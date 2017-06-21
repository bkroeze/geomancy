'use strict';
var _ = require('lodash');

export function houseRange (x) {
  while (x < 0) { x = x + 12; }
  return x % 12;
}

function zero1 (flag) {
  return flag ? '1' : '0';
}

function xor (a, b) {
  return !a != !b;
}

export class Figure {
  constructor (flags) {
    this.flags = flags;
  }

  /**
   * gets one Figure by name
   */
  static byName (name) {
    name = name.toLowerCase();
    if (_.has(Figures, name)) {
      return Figures[name];
    }
    throw new Error('Figure Not Found');
  }

  /**
   * gets one Figure by its Flags
   */
  static byFlags (flags) {
    if (!FigureDetails.has(flags)) {
      throw new Error('Figure Not Found');
    }
    return Figures[FigureDetails.get(flags).name.toLowerCase()];
  }

  /**
   * gets an array of Figure by elements.  It does not have to be a complete
   * set of elements, allowing this to return more than one.
   */
  static byElements (elements) {
    const flags = (
    zero1(elements.earth)
    + zero1(elements.water)
    + zero1(elements.air)
    + zero1(elements.fire)
    );

    return Figure.byFlags(flags);
  }

  get details () {
    if (!this._details) {
      const flags = this.flags;
      if (!FigureDetails.has(flags)) {
        throw new Error('No such figure with flags: ' + flags);
      }
      this._details = FigureDetails.get(flags);
    }
    return this._details;
  }

  get flags () {
    return (
      zero1(this.earth)
      + zero1(this.water)
      + zero1(this.air)
      + zero1(this.fire)
    );
  }

  set flags (raw) {
    let flags = raw + '';
    if (flags.length < 4) {
      flags = '0'.repeat(4 - flags.length) + flags;
    }
    this._details = null;
    this.earth = flags[0] == '1';
    this.water = flags[1] == '1';
    this.air = flags[2] == '1';
    this.fire = flags[3] == '1';
  }

  get name () {
    return this.details.name;
  }

  get number () {
    return parseInt(this.flags, 10);
  }

  getLine (ix) {
    switch (ix) {
      case 0:
        return this.fire;
        break;
      case 1:
        return this.air;
        break;
      case 2:
        return this.water;
        break;
      case 3:
        return this.earth;
        break;
      default:
        throw new Error('IndexError');
    }
  }

  getActivePoints() {
    return ['fire','air','water','earth'].reduce((points, element) => {
      if (this[element]) {
        return points + 1;
      } else {
        return points;
      }
    }, 0);
  }

  getPoints() {
    return ['fire','air','water','earth'].reduce((points, element) => {
      if (this[element]) {
        return points + 1;
      } else {
        return points + 2;
      }
    }, 0);
  }

  getStrength (house) {
    let shouldBeStrong = 0;
    if (this.details.houses.strong === house) shouldBeStrong++;
    else if (this.details.houses.weak === house) shouldBeStrong--;
    return shouldBeStrong;
  }

  add (...others) {
    let sum = this;
    let flags;
    others.forEach(other => {
      flags = (
        zero1(xor(sum.earth, other.earth)) +
        zero1(xor(sum.water, other.water)) +
        zero1(xor(sum.air, other.air)) +
        zero1(xor(sum.fire, other.fire))
      );
      sum = Figure.byFlags(flags);
    });
    return sum;
  }

  equals (other) {
      if (!(other && other instanceof Figure)) {
          return false;
      }
      return other.flags === this.flags
  }

  get slug() {
      return this.name.toLowerCase().replace(' ', '-');
  }

  toJSON () {
    return JSON.stringify(this.details);
  }
}

export const Figures = {};

export const FigureDetails = new Map();

function makeFigures (figures) {
  figures.forEach(details => {
    FigureDetails.set(details.flags, details);
    Figures[details.name.toLowerCase()] = new Figure(details.flags);
  });
}

// note that the houses are in zero-index order
makeFigures([
  {
    name: 'Puer',
    english: 'Boy',
    flags: '1011',
    houses: {strong: 0, weak: 6}
  }, {
    name: 'Amisso',
    english: 'Loss',
    flags: '0101',
    houses: {strong: 1, weak: 7}
  }, {
    name: 'Albus',
    english: 'White',
    flags: '0100',
    houses: {strong: 2, weak: 8}
  }, {
    name: 'Populus',
    english: 'People',
    flags: '0000',
    houses: {strong: 3, weak: 9}
  }, {
    name: 'Fortuna Major',
    english: 'Greater Fortune',
    flags: '1100',
    houses: {strong: 4, weak: 10}
  }, {
    name: 'Conjunctio',
    english: 'Confunction',
    flags: '0110',
    houses: {strong: 5, weak: 11}
  }, {
    name: 'Puella',
    english: 'Girl',
    flags: '1101',
    houses: {strong: 6, weak: 0}
  }, {
    name: 'Rubeus',
    english: 'Red',
    flags: '0010',
    houses: {strong: 7, weak: 1}
  }, {
    name: 'Acquisitio',
    english: 'Gain',
    flags: '1010',
    houses: {strong: 8, weak: 2}
  }, {
    name: 'Carcer',
    english: 'Prison',
    flags: '1001',
    houses: {strong: 9, weak: 3}
  }, {
    name: 'Tristitia',
    english: 'Sorrow',
    flags: '1000',
    houses: {strong: 10, weak: 4}
  }, {
    name: 'Laetitia',
    english: 'Joy',
    flags: '0001',
    houses: {strong: 11, weak: 5}
  }, {
    name: 'Cauda Draconis',
    english: 'Tail of the Dragon',
    flags: '0111',
    houses: {strong: 8, weak: 2}
  }, {
    name: 'Caput Draconis',
    english: 'Head of the Dragon',
    flags: '1110',
    houses: {strong: 5, weak: 11}
  }, {
    name: 'Fortuna Minor',
    english: 'Lesser Fortune',
    flags: '0011',
    houses: {strong: 4, weak: 10}
  }, {
    name: 'Via',
    english: 'Way',
    flags: '1111',
    houses: {strong: 3, weak: 9}
  }
]);

export class House {
  constructor (index, figure, querent, quesited) {
    this.index = index;
    this.figure = figure;
    this.querent = querent;
    this.quesited = quesited;
  }

  equals (other) {
    return other.index === this.index;
  }

  indexPlus(delta) {
    return houseRange(this.index + delta);
  }

  get trines() {
    return [this.indexPlus(4), this.indexPlus(8)];
  }

  get squares() {
    return [this.indexPlus(3), this.indexPlus(-3)];
  }

  get sextiles() {
    return [this.indexPlus(2), this.indexPlus(-2)];
  }

  get opposition() {
    return this.indexPlus(6);
  }

  get parents() {
    if (this.index < 8) {
      return [];
    }
    return [(this.index-8) * 2, (this.index-8) * 2 + 1]
  }

  hasFigure (other) {
    if (other instanceof House) {
      other = other.figure;
    }
    if (!other) {
      return false;
    }
    return this.figure.equals(other);
  }

  isLessThan (other, quesited=0) {
    if (quesited instanceof House) {
      quesited = house.index;
    }
    if (other instanceof House) {
      other = other.index;
    }
    other = other - quesited;
    return this.index < other;
  }

  /**
   * returns whether 'other' is sinister to this House
   */
  isSinisterOf(other) {
    if (other instanceof House) {
      other = other.index;
    }
    const range = [];
    for (let i=1; i<6; i++) {
      range.push(this.indexPlus(i));
    }
    return range.indexOf(other) > -1;
  }

  isDexterOf(other) {
    if (other instanceof House) {
      other = other.index;
    }
    return  (other !== this.index && other !== this.indexPlus(6) && !this.isSinisterOf(other))
  }

  get strength () {
      if (!this.figure) {
          return false;
      }
      return this.figure.getStrength(this.index);
  }

  getNeighbors(houses) {
      return [
        houses[houseRange(this.index-1)],
        houses[houseRange(this.index+1)]
      ]
  }

  isNextTo (other) {
    if (other instanceof House) {
        other = other.index;
    } else {
        other = houseRange(other);
    }
    return (
      other === houseRange(this.index - 1) ||
      other === houseRange(this.index + 1)
    );
  }
}
