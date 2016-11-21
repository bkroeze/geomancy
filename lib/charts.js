import { Figure } from './models';

const populus = Figure.byName('populus');

export class ChartSequence {
  constructor (...args) {
    this.slots = [populus, populus, populus, populus];
    args.forEach((arg, ix) => {
      this.set(ix, arg);
    });
  }

  set (ix, figure) {
    if (ix >= 5) {
      throw new Error('Invalid setting, can only set the Mothers (0-3)');
    }
    if (typeof (figure) == 'string') {
      figure = Figure.byName(figure);
    }
    this.slots[ix] = figure;
  }

  get (ix) {
    if (ix <= 3) {
      return this.slots[ix];
    }
    if (ix <= 7) {
      return this.getDaughter(ix - 4);
    }
    return this.getProjected(ix);
  }

  getDaughter (ix) {
    const elements = {
      fire: this.slots[0].getLine(ix),
      air: this.slots[1].getLine(ix),
      water: this.slots[2].getLine(ix),
      earth: this.slots[3].getLine(ix)
    };
    return Figure.byElements(elements);
  }

  getProjected (ix) {
    const p1 = (ix - 8) * 2;
    const p2 = (ix - 8) * 2 + 1;
    const f1 = this.get(p1);
    const f2 = this.get(p2);
    return f1.add(f2);
  }
};
