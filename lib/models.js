'use strict';
var _ = require('lodash');

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

  toJSON () {
    return JSON.stringify(this.details);
  }
};

export const Figures = {};

export const FigureDetails = new Map();

function makeFigures (figures) {
  figures.forEach(details => {
    FigureDetails.set(details.flags, details);
    Figures[details.name.toLowerCase()] = new Figure(details.flags);
  });
}

makeFigures([
  {
    name: 'Puer',
    english: 'Boy',
    flags: '1011',
    houses: {strong: 1, weak: 7}
  }, {
    name: 'Amisso',
    english: 'Loss',
    flags: '0101',
    houses: {strong: 2, weak: 8}
  }, {
    name: 'Albus',
    english: 'White',
    flags: '0100',
    houses: {strong: 3, weak: 9}
  }, {
    name: 'Populus',
    english: 'People',
    flags: '0000',
    houses: {strong: 4, weak: 10}
  }, {
    name: 'Fortuna Major',
    english: 'Greater Fortune',
    flags: '1100',
    houses: {strong: 5, weak: 11}
  }, {
    name: 'Conjunctio',
    english: 'Confunction',
    flags: '0110',
    houses: {strong: 6, weak: 12}
  }, {
    name: 'Puella',
    english: 'Girl',
    flags: '1101',
    houses: {strong: 7, weak: 1}
  }, {
    name: 'Rubeus',
    english: 'Red',
    flags: '0010',
    houses: {strong: 8, weak: 2}
  }, {
    name: 'Acquisitio',
    english: 'Gain',
    flags: '1010',
    houses: {strong: 9, weak: 3}
  }, {
    name: 'Carcer',
    english: 'Prison',
    flags: '1001',
    houses: {strong: 10, weak: 4}
  }, {
    name: 'Tristitia',
    english: 'Sorrow',
    flags: '1000',
    houses: {strong: 11, weak: 5}
  }, {
    name: 'Laetitia',
    english: 'Joy',
    flags: '0001',
    houses: {strong: 12, weak: 6}
  }, {
    name: 'Cauda Draconis',
    english: 'Tail of the Dragon',
    flags: '0111',
    houses: {strong: 9, weak: 3}
  }, {
    name: 'Caput Draconis',
    english: 'Head of the Dragon',
    flags: '1110',
    houses: {strong: 6, weak: 12}
  }, {
    name: 'Fortuna Minor',
    english: 'Lesser Fortune',
    flags: '0011',
    houses: {strong: 5, weak: 11}
  }, {
    name: 'Via',
    english: 'Way',
    flags: '1111',
    houses: {strong: 4, weak: 10}
  }
]);
