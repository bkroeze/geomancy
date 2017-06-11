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
    const houses = this.getHouses();
    const querentHouse = new House(this.querent);
    const quesitedHouse = new House(this.quesited);
    const querentFig = houses[querentHouse.index].figure;
    const quesitedFig = houses[quesitedHouse.index].figure;
    const figureByHouse = (h) => {
      return houses[h.index].figure;
    };

    const springs = {querent: [], quesited: []};
    const occupation = [];
    const conjunction = {querent: [], quesited: []};
    const mutation = [];

    if (querentFig.name === quesitedFig.name) {
      occupation.push(this.quesited);
    }
    for (let i = 0; i < 12; i++) {
      let curr = houses[i].figure;
      // console.log(i, curr.name, querentFig ? querentFig.name : null, quesitedFig ? quesitedFig.name : null);
      if (i !== this.querent && this.querent > -1) {
        if (curr.name === querentFig.name) {
          springs.querent.push(i);
        }
      }
      if (i !== this.quesited && this.quesited > -1) {
        if (curr.name === quesitedFig.name) {
          springs.quesited.push(i);
        }
      }

      if (querentHouse.isNextTo(i) && quesitedFig.name === curr.name) {
        conjunction.querent.push(i);
      }
      if (quesitedHouse.isNextTo(i) && querentFig.name === curr.name) {
        conjunction.quesited.push(i);
      }
    }

    // second pass - go through the springs, looking for neighbor conjunctions
    if (springs.querent && springs.quesited) {
      springs.querent.forEach((ix) => {
        let qh = new House(ix);
        let hits = springs.quesited.filter((jx) => {
          let h = new House(jx);
          return h.isNextTo(qh);
        });
        hits.forEach((hit) => {
          mutation.push({querent: qh.index, quesited: h.index});
        });
      });
    }
    return {springs, occupation, conjunction, mutation};
  }

  getSeeds (slugify = false) {
    const seeds = [];
    const houses = this.getHouses();
    for (let ix = 0; ix < 4; ix++) {
      let seed = houses[ix].figure.name;
      if (slugify) {
        seed = seed.toLowerCase().replace(' ', '-');
      }
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
      let strength = 0;
      let querent = this.querent === i;
      let quesited = this.quesited === i;
      const figure = this.seq.get(i);
      if (i === (figure.details.houses.strong - 1)) {
        strength = 1;
      } else if (i === (figure.details.houses.weak - 1)) {
        strength = -1;
      }

      houses.push({figure, strength, querent, quesited});
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
