import { Figure, House, houseRange } from './models';
import isNaN from 'lodash/isNaN';
import differenceBy from 'lodash/differenceBy';

const populus = Figure.byName('populus');

export class Chart {
  constructor (sequence = null, querent = 0, quesited = -1) {
    this.seq = sequence || new ChartSequence();
    this.querent = querent;
    this.quesited = quesited;
    this.shieldKeys = ['Mother 1', 'Mother 2', 'Mother 3', 'Mother 4',
      'Daughter 1', 'Daughter 2', 'Daughter 3', 'Daughter 4',
      'Niece 1', 'Niece 2', 'Niece 3', 'Niece 4',
      'Left Witness', 'Right Witness', 'Judge'];
  }

  clone () {
    const seeds = this.getSeeds(false);
    const seq = new ChartSequence(...seeds);
    return new Chart(seq);
  }

  getConjunctions (querent, quesited, houses) {
    const conjunction = {querent: [], quesited: []};
    for (let i = 0; i < 12; i++) {
      let house = houses[i];

      if (querent.isNextTo(house) && house.hasFigure(quesited)) {
        conjunction.querent.push(i);
      }
      if (quesited.isNextTo(house) && house.hasFigure(querent)) {
        conjunction.quesited.push(i);
      }
    }
    return conjunction;
  }

  getHouses () {
    const houses = [];

    for (let i = 0; i < 12; i++) {
      let querent = this.querent === i;
      let quesited = this.quesited === i;
      const figure = this.seq.get(i);

      houses.push(new House(i, figure, querent, quesited));
    }
    return houses;
  }

  getMutations (springs, houses) {
    // go through the springs, looking for neighbor conjunctions so that we
    // can find any mutations
    const mutation = [];
    if (springs.querent && springs.quesited) {
      springs.querent.forEach((querentIx) => {
        let querent = houses[querentIx];
        let hits = springs.quesited.filter((quesitedIx) => {
          let quesited = houses[quesitedIx];
          return querent.isNextTo(quesited);
        });
        hits.forEach((quesitedIx) => {
          mutation.push({querent: querentIx, quesited: quesitedIx});
        });
      });
    }
    return mutation;
  }

  getOccupation (querent, quesited) {
    const occupation = [];
    if (querent.hasFigure(quesited)) {
      occupation.push(this.quesited);
    }
    return occupation;
  }

  getPerfections () {
    if (this.querent < 0 || this.quesited < 0) {
        return {};
    }

    const houses = this.getHouses();
    const querent = houses[this.querent];
    const quesited = houses[this.quesited];

    const occupation = this.getOccupation(querent, quesited);
    const conjunction = this.getConjunctions(querent, quesited, houses);
    const springs = this.getSprings(querent, quesited, houses);
    const mutation = this.getMutations(springs, houses);
    const translation = this.getTranslations(querent, quesited, houses);

    return {springs, occupation, conjunction, mutation, translation};
  }

  getSeeds (slugify = false) {
    const seeds = [];
    const houses = this.getHouses();
    for (let ix = 0; ix < 4; ix++) {
      let {figure} = houses[ix];
      let seed = slugify ? figure.slug : figure.name;
      seeds.push(seed);
    }
    return seeds;
  }

  getShield () {
    const shield = new Map();
    this.shieldKeys.forEach((name, ix) => {
      shield.set(name, this.seq.get(ix));
    });
    return shield;
  }

  getSprings (querent, quesited, houses) {
    const springs = {querent: [], quesited: []};
    for (let i = 0; i < 12; i++) {
      let house = houses[i];
      if (!house.querent && house.hasFigure(querent)) {
        springs.querent.push(i);
      }
      if (!house.quesited && house.hasFigure(quesited)) {
        springs.quesited.push(i);
      }
    }
    return springs;
  }

  getTranslations (querent, quesited, houses) {

    const translation = [];
    // translations
    let querentNeighbors = querent.getNeighbors(houses);
    let quesitedNeighbors = quesited.getNeighbors(houses)

    // remove same indexes
    querentNeighbors = differenceBy(querentNeighbors, quesitedNeighbors, 'index');
    quesitedNeighbors = differenceBy(quesitedNeighbors, querentNeighbors, 'index');

    // remove direct figure matches;
    const exclusions = (neighbor) => {
      return !(
        neighbor.equals(quesited) ||
        neighbor.equals(querent) ||
        neighbor.hasFigure(quesited) ||
        neighbor.hasFigure(querent)
      );
    };
    querentNeighbors = querentNeighbors.filter(exclusions);
    quesitedNeighbors = quesitedNeighbors.filter(exclusions);

    // for the remaining, go through neighbors and see if there are any figure matches
    // which are next to both Q and q.
    for (let querentN of querentNeighbors) {
        for (let quesitedN of quesitedNeighbors) {
            if (querentN.hasFigure(quesitedN)) {
                translation.push([querentN.index, quesitedN.index]);
            }
        }
    }
    return translation;
  }
}

export class ChartSequence {
  constructor (...args) {
    this.slots = [populus, populus, populus, populus];
    args.forEach((arg, ix) => {
      this.set(ix, arg);
    });
  }

  set (ix, figure) {
    if (isNaN(ix)) {
      throw new TypeError('Invalid Index');
    }
    if (ix >= 5) {
      throw new Error('Invalid setting, can only set the Mothers (0-3)');
    }
    if (typeof (figure) === 'string') {
      figure = Figure.byName(figure);
    }
    this.slots[ix] = figure;
  }

  get (ix) {
    if (isNaN(ix)) {
      throw new TypeError('Invalid Index');
    }
    if (ix <= 3) {
      return this.slots[ix];
    }
    if (ix <= 7) {
      return this.getDaughter(ix - 4);
    }
    return this.getProjected(ix);
  }

  getDaughter (ix) {
    if (isNaN(ix)) {
      throw new TypeError('Invalid Index');
    }
    const elements = {
      fire: this.slots[0].getLine(ix),
      air: this.slots[1].getLine(ix),
      water: this.slots[2].getLine(ix),
      earth: this.slots[3].getLine(ix)
    };
    return Figure.byElements(elements);
  }

  getProjected (ix) {
    if (isNaN(ix)) {
      throw new TypeError('Invalid Index');
    }
    const p1 = (ix - 8) * 2;
    const p2 = (ix - 8) * 2 + 1;
    const f1 = this.get(p1);
    const f2 = this.get(p2);
    return f1.add(f2);
  }
}
