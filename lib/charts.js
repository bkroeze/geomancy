import { Figure, House } from './models';
import isNaN from 'lodash/isNaN';

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

  getPerfections () {
    const springs = {querent: [], quesited: []};
    const occupation = [];
    const conjunction = {querent: [], quesited: []};
    const mutation = [];

    if (this.querent < -1 || this.quesited < -1) {
        return {};
    }

    const houses = this.getHouses();
    const querent = houses[this.querent];
    const quesited = houses[this.quesited];

    if (querent.hasFigure(quesited)) {
      occupation.push(this.quesited);
    }

    for (let i = 0; i < 12; i++) {
      let house = houses[i];
      if (!house.querent && house.hasFigure(querent)) {
        springs.querent.push(i);
      }
      if (!house.quesited && house.hasFigure(quesited)) {
        springs.quesited.push(i);
      }

      if (querent.isNextTo(house) && house.hasFigure(quesited)) {
        conjunction.querent.push(i);
      }
      if (quesited.isNextTo(house) && house.hasFigure(querent)) {
        conjunction.quesited.push(i);
      }
    }

    // second pass - go through the springs, looking for neighbor conjunctions so that we
    // can find any mutations
    if (springs.querent && springs.quesited) {
      springs.querent.forEach((ix) => {
        let springQuerent = houses[ix];
        let hits = springs.quesited.filter((jx) => {
          let springQuesited = houses[jx];
          return springQuerent.isNextTo(springQuesited);
        });
        hits.forEach((hit) => {
          mutation.push({querent: ix, quesited: hit});
        });
      });
    }
    return {springs, occupation, conjunction, mutation};
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
