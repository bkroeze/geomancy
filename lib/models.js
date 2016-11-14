'use strict';
var _ = require('lodash');

let _figureArray;

function getFigureArray () {
  if (!_figureArray) {
    _figureArray = _.values(Figures);
  }
  return _figureArray;
}

const zero1 = (flag) => {
  return flag ? '1' : '0';
};

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
    if (!_.has(Figures, flags)) {
      throw new Error('Figure Not Found');
    }
    return Figures[flags];
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

  get (ix) {
    switch (ix) {
      case 3:
        return this.fire;
        break;
      case 2:
        return this.air;
        break;
      case 1:
        return this.air;
        break;
      case 0:
        return this.earth;
        break;
      default:
        throw new Exception('IndexException');
    }
  }
};

export const Figures = {};

const FigureDetails = new Map();

function makeFigure (details) {
  FigureDetails.set(details.flags, details);
  Figures[details.name.toLowerCase()] = new Figure(details.flags);
}

makeFigure({
  name: 'Puer',
  flags: '1011',
  houses: {}
});

makeFigure({
  name: 'Amisso',
  flags: '0101',
  houses: {}
});

makeFigure({
  name: 'Albus',
  flags: '0100',
  houses: {}
});

makeFigure({
  name: 'Populus',
  flags: '0000',
  houses: {}
});

makeFigure({
  name: 'Fortuna Major',
  flags: '1100',
  houses: {}
});

makeFigure({
  name: 'Conjunctio',
  flags: '0110',
  houses: {}
});

makeFigure({
  name: 'Puella',
  flags: '1101',
  houses: {}
});

makeFigure({
  name: 'Rubeus',
  flags: '0010',
  houses: {}
});

makeFigure({
  name: 'Acquisitio',
  flags: '1010',
  houses: {}
});

makeFigure({
  name: 'Carcer',
  flags: '1001',
  houses: {}
});

makeFigure({
  name: 'Tistitia',
  flags: '1000',
  houses: {}
});

makeFigure({
  name: 'Laetitia',
  flags: '0001',
  houses: {}
});

makeFigure({
  name: 'Cauda Draconis',
  flags: '0111',
  houses: {}
});

makeFigure({
  name: 'Caput Draconis',
  flags: '1110',
  houses: {}
});

makeFigure({
  name: 'Fortuna Minor',
  flags: '0011',
  houses: {}
});

makeFigure({
  name: 'Via',
  flags: '1111',
  houses: {}
});
