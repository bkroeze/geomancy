import { Figure } from './models';
import isNaN from 'lodash/isNaN';

const populus = Figure.byName('populus');

export class Chart {
  constructor (sequence = null) {
    this.seq = sequence || new ChartSequence();
  }

  getShield () {
    const shield = new Map();
    ['Mother 1', 'Mother 2', 'Mother 3', 'Mother 4',
      'Daughter 1', 'Daughter 2', 'Daughter 3', 'Daughter 4',
      'Niece 1', 'Niece 2', 'Niece 3', 'Niece 4',
      'Left Witness', 'Right Witness', 'Judge'].forEach((name, ix) => {
      shield.set(name, this.seq.get(ix));
    });
    return shield;
  }

  getHouses () {
    const houses = [];
    for (let i = 0; i < 12; i++) {
      let strength = 0;
      const figure = this.seq.get(i);
      if (i === (figure.details.houses.strong - 1)) {
        strength = 1;
      } else if (i === (figure.details.houses.weak - 1)) {
        strength = -1;
      }

      houses.push({
        figure: figure,
        strength: strength
      });
    }
    return houses;
  }
};

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
};