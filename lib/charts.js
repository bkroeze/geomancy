import { Figure } from './models';

const populus = Figure.byName('populus');

export class ChartSequence {
  constructor () {
    this.slots = [populus, populus, populus, populus];
  }

  set (ix, figure) {
    if (ix >= 5) {
      throw new Error('Invalid setting, can only set the Mothers');
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
    console.log('Elements for ' + ix + ': ' + JSON.stringify(elements));
    return Figure.byElements(elements);
  }

  getProjected (ix) {
    const p1 = (ix - 8) * 2;
    const p2 = (ix - 8) * 2 + 1;
    return this.get(p1).add(p2);
  }
};
