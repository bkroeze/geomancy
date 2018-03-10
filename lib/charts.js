import { Figure, House, houseRange } from './models';
import * as R from 'ramda';

const populus = Figure.byName('populus');

/**
 * Different house systems.  Each array is the ordered list of sequence indices for the houses.
 * For example, in the Esoteric system, the second house contains the figure fifth in the sequence.
 * So ESOTERIC[1] = 4;
 * @type {Array}
 */
export const HOUSE_MAPS = {
  ORDINARY: [0,1,2,3,4,5,6,7,8,9,11,12],
  ESOTERIC: [0,4,8,1,7,11,2,6,10,3,5,9],
  'GOLDEN DAWN': [1,5,9,2,6,10,3,7,11,0,4,8]
};

export const SHIELD_KEYS = ['Mother 1', 'Mother 2', 'Mother 3', 'Mother 4',
  'Daughter 1', 'Daughter 2', 'Daughter 3', 'Daughter 4',
  'Niece 1', 'Niece 2', 'Niece 3', 'Niece 4',
  'Left Witness', 'Right Witness', 'Judge'];

export const INDICATION_WEIGHTING = {
  occupations: 5,
  conjunctions: 5,
  mutations: 4,
  translations: 4,
  inCompany: -1,
  impedition: -5,
  trines: 3,
  sextiles: 3,
  oppositions: -4,
  squares: -3
};

const JUDGE = 14;

const hit = (querent, quesited) => {
  return {
    querent: querent.index,
    quesited: quesited.index
  };
};

/**
 * Base Geomancy Chart Model
 * @param {ChartSequence|array} [sequence=null] The starting set of mothers
 * @param {number} [querent=0] The 0-indexed house of the querent
 * @param {number} [quesited=-1] The 0-indexed house of the quesited
 * @param {string} [houseType='ordinary'] the type of house projection to use.
 */
export class Chart {
  constructor (sequence = null, querent = 0, quesited = 3, houseType='ordinary') {
    if (R.is(Array, sequence)) {
      try {
        sequence = new ChartSequence(...sequence);
      } catch (e) {
        console.log(e);
      }
    }
    this.seq = sequence || new ChartSequence();
    this.querentIx = querent;
    this.quesitedIx = quesited;
    this.setHouseType(houseType);
  }

  /**
   * Makes a copy of this chart.
   * @returns {Chart} clone of this chart
   */
  clone () {
    const seeds = this.getSeeds(false);
    const seq = new ChartSequence(...seeds);
    return new Chart(seq, this.querent, this.quesited);
  }

  /**
   * Get the house and type of company, if it exists.
   * @param {House|number} house to check for company
   * @returns {Object|null} if in company, then returns an object:
   *    {house: index, company: companyType}
   */
  getCompany (house) {
    if (!(house instanceof House)) {
      house = this.getHouse(house);
    }
    const companion = this.getHouse(house.companion);
    // console.log('companion', companion);
    const company = house.getCompanyType(companion);
    // console.log(house.figure.name + ' + ' + companion.figure.name + ' = ' + company);
    if (!company) {
      return null;
    }
    return {
      house: companion.index,
      company
    };
  }

  /**
   * Get the specified house by index.
   * @param {number} index position
   * @returns {House} at position
   */
  getHouse (index) {
    if (index instanceof House) {
      return index;
    }
    if (!R.is(Number, index)) {
      index = SHIELD_KEYS.indexOf(index);
      if (index === -1) {
        throw new TypeError('Invalid Index');
      }
    }
    const seqIndex = index > 11 ? index : this.houseMap[index];
    return new House(index, this.seq.get(seqIndex), this.querent === index, this.quesited === index);
  }

  /**
   * Get an array of all the houses from this chart.
   * @returns {array} all 12 houses, note that the array is 0-indexed
   */
  getHouses () {
    const houses = [];

    for (let i = 0; i < 12; i++) {
      houses.push(this.getHouse(i));
    }
    return houses;
  }

  /**
   * Find the Geomantic "index" of a chart.
   * @returns {House} at index
   */
  getIndex () {
    let count = 0;
    for (let i = 0; i < 12; i++) {
      let figure = this.seq.get(i);
      count += figure.getActivePoints();
    }
    return this.getHouse(houseRange(count));
  }

  /**
   * Calculate and return the total "indication" weight for this chart.
   * @returns {number} weighted total with positive numbers indicating success/true.
   */
  getIndicationWeight () {
    const indications = this.getIndications();
    return getAttributeArray(indications, 'weight').reduce((prev, curr) => prev + curr);
  }

  /**
   * Gets the chart indications for the specified querest and quesited houses.
   * @param {number} [querent=this.querent] querent to use for this call
   * @param {number} [quesited=this.quesited] quesited to use for this call
   * @param {boolean} [inCompany=false] flag to prevent endless recursion on companies
   * @returns {Object} a dictionary of Indications
   * @example
   *{
   *  "springs": {
   *    "querent": [
   *      {
   *        "from": 1,
   *        "to": 4
   *      }
   *    ],
   *    "quesited": []
   *  },
   *  "occupations": [],
   *  "conjunctions": {
   *    "querent": [],
   *    "quesited": []
   *  },
   *  "mutations": [],
   *  "translations": [
   *    {
   *      "querent": 11,
   *      "quesited": 8,
   *      "weight": 3
   *    }
   *  ],
   *  "trines": [],
   *  "squares": [
   *    {
   *      "direction": "sinister",
   *      "querent": 4,
   *      "quesited": 7,
   *      "weight": -4
   *    }
   *  ],
   *  "oppositions": [],
   *  "sextiles": [
   *    {
   *      "direction": "sinister",
   *      "querent": 4,
   *      "quesited": 6,
   *      "weight": 2
   *    }
   *  ]
   *}
   */
  getIndications (querent = this.querent, quesited = this.quesited, inCompany = false) {
    querent = this.getHouse(querent);
    quesited = this.getHouse(quesited);
    if (querent.index === quesited.index) {
      return {};
    }

    const subQuerent = this.querent.index !== querent.index;
    const subQuesited = this.quesited.index !== quesited.index;

    const houses = this.getHouses();

    const occupations = getOccupation(querent, quesited);
    const conjunctions = getConjunctions(querent, quesited, houses);
    const springs = getSprings(querent, quesited, houses);
    let qIndex;
    if (subQuerent) {
      // strip any springs to the original
      qIndex = this.querent.index;
      springs.querent = springs.querent.filter(q => q.to != qIndex);
    }
    if (subQuesited) {
      // strip any springs to the original
      qIndex = this.quesited.index;
      springs.quesited = springs.quesited.filter(q => q.to != qIndex);
    }
    const mutations = getMutations(springs, houses);
    const translations = getTranslations(querent, quesited, houses);
    const aspects = getAspects(querent, quesited, springs, houses);

    const indications = addWeights({springs, occupations, conjunctions, mutations, translations, ...aspects}, inCompany);

    if (!inCompany) {
      // if we're not already in Company, check to see if companies exist
      // and if so, use them to add more indications
      const querentCo = this.getCompany(querent);
      const quesitedCo = this.getCompany(quesited);
      let additional = [];
      if (querentCo) {
        additional.push(this.getIndications(querentCo.house, quesited, true));
        if (quesitedCo) {
          additional.push(this.getIndications(querentCo.house, quesitedCo.house, true));
        }
      }
      if (quesitedCo) {
        additional.push(this.getIndications(querent, quesitedCo.house, true));
      }
      additional.forEach(added => {
        addUnique(indications, added);
      });

      // OK, we've added all perfections possible for this chart.
      // If there aren't any, then we have an "impedition", so add it.
      // to do that, just find all weights, and look for positives
      const positives = getAttributeArray(indications, 'weight').filter(x => { return x > 0; });
      if (positives.length === 0) {
        indications.impedition = {weight: INDICATION_WEIGHTING.impedition};
      }
    }

    return indications;
  }

  getMeanings() {
    const meanings = [];
    for (let i=0; i < 12; i++) {
      let house = this.getHouse(i);
      meanings.push(house.getMeaning());
    }
    return meanings;
  }

  /**
   * Find and return the house for the part of fortune.
   * @return {House} Part of Fortune
   */
  getPartOfFortune () {
    let count = 0;
    for (let i = 0; i < 12; i++) {
      let figure = this.seq.get(i);
      count += figure.getPoints();
    }
    return this.getHouse(houseRange(count));
  }

  /**
   * Get the mothers as an array.
   * @param  {Boolean} [slugify=false] convert to slugs
   * @return {array<House>} four mother houses
   */
  getSeeds (slugify = false) {
    const seeds = [];
    for (let ix = 0; ix < 4; ix++) {
      let {figure} = this.getHouse(ix);
      let seed = slugify ? figure.slug : figure.name;
      seeds.push(seed);
    }
    return seeds;
  }

  /**
   * Get the chart houses as a map
   * @return {Map<String, House>} Shield houses keyed by name in the shield
   */
  getShield () {
    const shield = new Map();
    SHIELD_KEYS.forEach((name, ix) => {
      shield.set(name, this.seq.get(ix));
    });
    return shield;
  }

  /**
   * Return the way of the point as an array, if it exists.
   * @return {Array<Number>} Array of indexes of points in the way
   */
  getWayOfThePoint () {
    const followFire = (house) => {
      return house.parents.filter((parentIx) => {
        return this.getHouse(parentIx).figure.fire === house.figure.fire;
      });
    };

    const followThePath = (house, points) => {
      house = this.getHouse(house);
      if (house.index < 8) { return house; }

      followFire(house).forEach((parent) => {
        const point = followThePath(parent, points);
        if (point) {
          points.push(point);
        }
      });
    };

    const points = [];
    followThePath('Judge', points);
    return points.map(point => point.index);
  }

  /**
   * Sets the house type to any legal name in HOUSE_MAPS
   * @param {string} houseType name of system
   * @return {`Chart`} self
   */
  setHouseType(houseType) {
    const key = houseType.toUpperCase();
    const houseMap = HOUSE_MAPS[key];
    if (! houseMap) {
      throw new TypeError('Invalid House Type');
    }
    this.houseMap = houseMap;
    this.querent = this.getHouse(this.querentIx);
    this.quesited = this.getHouse(this.quesitedIx);

    return this;
  }

}

/**
 * A sequence of geomantic figures, which is seeded by the first four houses,
 * and projects all the rest from them.
 * @type {Array<Figure|String>} four figure names or Figures
 */
export class ChartSequence {
  constructor (...args) {
    this.slots = [populus, populus, populus, populus];
    args.forEach((arg, ix) => {
      this.set(ix, arg);
    });
  }

  /**
   * Set the `Figure` at slot `ix`
   * @param {number} ix position
   * @param {Figure|string} figure to set
   * @return {null} nothing
   */
  set (ix, figure) {
    if (!R.is(Number, ix)) {
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

  /**
   * Get the figure at or projected to that index
   * @param  {number} ix position
   * @return {Figure} figure at position
   */
  get (ix) {
    if (!R.is(Number, ix)) {
      throw new TypeError('Invalid Index', ix);
    }
    if (ix <= 3) {
      return this.slots[ix];
    }
    if (ix <= 7) {
      return this.getDaughter(ix - 4);
    }
    return this.getProjected(ix);
  }

  /**
   * Project the Daughter figures
   * @param  {Number} ix position
   * @return {Figure} daughter
   */
  getDaughter (ix) {
    if (!R.is(Number, ix)) {
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

  /**
   * Project any arbitrary higher position
   * @param  {Number} ix position
   * @return {Figure} at position
   */
  getProjected (ix) {
    if (!R.is(Number, ix)) {
      throw new TypeError('Invalid Index');
    }
    const p1 = (ix - 8) * 2;
    const p2 = (ix - 8) * 2 + 1;
    const f1 = this.get(p1);
    const f2 = this.get(p2);
    return f1.add(f2);
  }
}

// -------------

/**
 * Adds unique values of one dictionary to another, appending to arrays, and walking sub-objects.
 * @param {Object} dict target object
 * @param {Object} added merge object
 * @returns {Object} merged dict
 */
export function addUnique (dict, added) {
  Object.keys(added).forEach(key => {
    if (!R.has(key, dict)) {
      dict[key] = added[key];
    } else if (R.is(Array, dict[key])) {
      dict[key] = R.unionWith(R.equals, dict[key], added[key]);
    } else {
      addUnique(dict[key], added[key]);
    }
  });
  return dict;
}

/**
 * Adds up indication weights for a set of indications.
 * @param {Object} dict      Indications
 * @param {Boolean} inCompany true if indication is due to a company
 * @returns {Object} indications with weights
 */
export function addWeights (dict, inCompany) {
  const indications = {...dict};
  // add the weights to each item in the indications
  for (const [indicationType, values] of Object.entries(dict)) {
    if (R.has(indicationType, INDICATION_WEIGHTING)) {
      let weight = INDICATION_WEIGHTING[indicationType];
      if (inCompany) {
        weight = weight + INDICATION_WEIGHTING.inCompany;
      }
      const addWeight = (indication) => {
        return {...indication, weight};
      };
      if (R.is(Array, values)) {
        indications[indicationType] = values.map(addWeight);
      } else {
        indications[indicationType] = {
          querent: values.querent.map(addWeight),
          quesited: values.quesited.map(addWeight)
        };
      }
    }
  }
  return indications;
}

/**
 * Get all trines, squares, oppositions, and sextiles from a set of houses,
 * including those caused by springs.
 *
 * @param  {House} initialQuerent base querent
 * @param  {House} initialQuesited base quesited
 * @param  {Array<Object>} springs list of springs
 * @param  {Array<House>} houses list of chart houses
 * @return {Object} Aspect set
 */
function getAspects (initialQuerent, initialQuesited, springs, houses) {
  const aspects = {trines: [], squares: [], oppositions: [], sextiles: []};
  if (springs.quesited) {
    springs.quesited.forEach((quesited) => {
      makeAspectsFor(aspects, initialQuerent, houses[quesited.to]);
    });
  }
  if (springs.querent) {
    springs.querent.forEach((querent) => {
      makeAspectsFor(aspects, houses[querent.to], initialQuesited);
    });
  }
  if (springs.querent && springs.quesited) {
    springs.querent.forEach((querent) => {
      springs.quesited.forEach((quesited) => {
        makeAspectsFor(aspects, houses[querent.to], houses[quesited.to]);
      });
    });
  }
  return aspects;
}

/**
 * Find conjunctions for a given set of houses.
 *
 * @param  {House} querent  chart querent
 * @param  {House} quesited chart quesited
 * @param  {Array<House>} houses List of chart houses
 * @return {Object<String, Array>} Conjunctions
 */
function getConjunctions (querent, quesited, houses) {
  const conjunction = {querent: [], quesited: []};
  for (let i = 0; i < 12; i++) {
    let house = houses[i];

    if (querent.isNextTo(house) && house.hasFigure(quesited)) {
      conjunction.querent.push(hit(querent, house));
    }
    if (quesited.isNextTo(house) && house.hasFigure(querent)) {
      conjunction.quesited.push(hit(house, quesited));
    }
  }
  return conjunction;
}

/**
 * Find mutations for a given set of houses
 * @param {Array<Object>} springs list of springs
 * @param  {Array<House>} houses List of chart houses
 * @return {Array<Object>} list of mutations
 */
function getMutations (springs, houses) {
  // go through the springs, looking for neighbor conjunctions so that we
  // can find any mutations
  const mutation = [];
  if (springs.querent && springs.quesited) {
    springs.querent.forEach((querentSpring) => {
      let querent = houses[querentSpring.to];
      let hits = springs.quesited.filter((quesitedSpring) => {
        let quesited = houses[quesitedSpring.to];
        return querent.isNextTo(quesited);
      });
      hits.forEach((quesitedSpring) => {
        mutation.push({querent: querentSpring.to, quesited: quesitedSpring.to});
      });
    });
  }
  return mutation;
}

/**
 * [getOccupation description]
 * @param  {[type]} querent  [description]
 * @param  {[type]} quesited [description]
 * @return {[type]}          [description]
 */
function getOccupation (querent, quesited) {
  const occupation = [];
  if (querent.hasFigure(quesited)) {
    occupation.push(hit(querent, quesited));
  }
  return occupation;
}

/**
 * [getSprings description]
 * @param  {[type]} querent  [description]
 * @param  {[type]} quesited [description]
 * @param  {[type]} houses   [description]
 * @return {[type]}          [description]
 */
function getSprings (querent, quesited, houses) {
  const springs = {querent: [], quesited: []};
  for (let i = 0; i < 12; i++) {
    let house = houses[i];
    if (!house.querent && house.hasFigure(querent) && querent.index !== i) {
      springs.querent.push({from: querent.index, to: i});
    }
    if (!house.quesited && house.hasFigure(quesited) && quesited.index !== i) {
      springs.quesited.push({from: quesited.index, to: i});
    }
  }
  return springs;
}

/**
 * [getTranslations description]
 * @param  {[type]} querent  [description]
 * @param  {[type]} quesited [description]
 * @param  {[type]} houses   [description]
 * @return {[type]}          [description]
 */
function getTranslations (querent, quesited, houses) {
  const translation = [];
  // translations
  let querentNeighbors = querent.getNeighbors(houses);
  let quesitedNeighbors = quesited.getNeighbors(houses);

  // remove same indexes
  const eqIndex = R.eqProps('index');
  querentNeighbors = R.differenceWith(eqIndex, querentNeighbors, quesitedNeighbors);
  quesitedNeighbors = R.differenceWith(eqIndex, quesitedNeighbors, querentNeighbors);

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
        translation.push(hit(querentN, quesitedN));
      }
    }
  }
  return translation;
}

/**
 * walks an indications structure, returning an array of keyed values
 * @param  {[type]} dict   [description]
 * @param  {[type]} member [description]
 * @return {[type]}        [description]
 */
export function getAttributeArray (dict, member) {
  let found = [];
  for (const [key, values] of Object.entries(dict)) {
    if (R.is(Array, values)) {
      const work = values.map(x => x[member]);
      found = R.concat(found, work);
    } else if (R.is(Object, values)) {
      if (R.has(member, values)) {
        found.push(values[member]);
      } else {
        found = R.concat(found, getAttributeArray(values, member));
      }
    }
  }
  return R.reject(R.isNil, found);
}

/**
 * [makeAspectsFor description]
 * @param  {[type]} aspects  [description]
 * @param  {[type]} querent  [description]
 * @param  {[type]} quesited [description]
 * @return {[type]}          [description]
 */
function makeAspectsFor (aspects, querent, quesited) {
  let direction = '';
  if (querent.isSinisterOf(quesited)) {
    direction = 'sinister';
  } else if (querent.isDexterOf(quesited)) {
    direction = 'dexter';
  }

  const aspect = {
    direction,
    querent: querent.index,
    quesited: quesited.index
  };

  if (querent.isTrineTo(quesited)) {
    aspects.trines.push(aspect);
  } else if (querent.isSquareTo(quesited)) {
    aspects.squares.push(aspect);
  } else if (querent.isSextileTo(quesited)) {
    aspects.sextiles.push(aspect);
  } else if (querent.isOpposedTo(quesited)) {
    aspects.oppositions.push(aspect);
  }
}
