import { Figure, House, houseRange } from './models';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import isEqual from 'lodash/isEqual';
import concat from 'lodash/concat';
import isObject from 'lodash/isObject';
import has from 'lodash/has';
import unionWith from 'lodash/unionWith';
import differenceBy from 'lodash/differenceBy';

const populus = Figure.byName('populus');

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

export const hit = (querent, quesited) => {
  return {
    querent: querent.index,
    quesited: quesited.index
  };
};

export class Chart {
  constructor (sequence = null, querent = 0, quesited = -1) {
    if (isArray(sequence)) { sequence = new ChartSequence(...sequence); }
    this.seq = sequence || new ChartSequence();
    this.querent = querent;
    this.quesited = quesited;
  }

  clone () {
    const seeds = this.getSeeds(false);
    const seq = new ChartSequence(...seeds);
    return new Chart(seq);
  }

  /**
   * Returns the house and type of company, if it exists.
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

  getHouse (index) {
    if (!isNumber(index)) {
      index = SHIELD_KEYS.indexOf(index);
      if (index === -1) {
        throw new TypeError('Invalid Index');
      }
    }
    return new House(index, this.seq.get(index), this.querent === index, this.quesited === index);
  }

  getHouses () {
    const houses = [];

    for (let i = 0; i < 12; i++) {
      houses.push(this.getHouse(i));
    }
    return houses;
  }

  getIndex () {
    let count = 0;
    for (let i = 0; i < 12; i++) {
      let figure = this.seq.get(i);
      count += figure.getActivePoints();
    }
    return this.getHouse(houseRange(count));
  }

  getIndicationWeight () {
    const indications = this.getIndications();
    return getAttributeArray(indications, 'weight').reduce((prev, curr) => prev + curr);
  }

  getIndications (querentIx = this.querent, quesitedIx = this.quesited, inCompany = false) {
    if (querentIx < 0 || quesitedIx < 0) {
      return {};
    }

    const houses = this.getHouses();
    const querent = houses[querentIx];
    const quesited = houses[quesitedIx];

    const occupations = getOccupation(querent, quesited);
    const conjunctions = getConjunctions(querent, quesited, houses);
    const springs = getSprings(querent, quesited, houses);
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
        additional.push(this.getIndications(querentCo.house, quesitedIx, true));
        if (quesitedCo) {
          additional.push(this.getIndications(querentCo.house, quesitedCo.house, true));
        }
      }
      if (quesitedCo) {
        additional.push(this.getIndications(querentIx, quesitedCo.house, true));
      }
      additional.forEach(added => {
        addUnique(indications, added);
      });

      // OK, we've added all perfections possible for this chart.
      // If there aren't any, then we have an "impedition", so add it.
      // To find if we have any, we just need to find the total weight
      // if we don't have a positive one, then there weren't any perfections.
      const weight = getAttributeArray(indications, 'weight').reduce((prev, curr) => prev + curr);
      if (weight <= 0) {
        indications.impedition = {weight: INDICATION_WEIGHTING.impedition};
      }
    }

    return indications;
  }

  getPartOfFortune () {
    let count = 0;
    for (let i = 0; i < 12; i++) {
      let figure = this.seq.get(i);
      count += figure.getPoints();
    }
    return this.getHouse(houseRange(count));
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
    SHIELD_KEYS.forEach((name, ix) => {
      shield.set(name, this.seq.get(ix));
    });
    return shield;
  }

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
}

export class ChartSequence {
  constructor (...args) {
    this.slots = [populus, populus, populus, populus];
    args.forEach((arg, ix) => {
      this.set(ix, arg);
    });
  }

  set (ix, figure) {
    if (!isNumber(ix)) {
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
    if (!isNumber(ix)) {
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
    if (!isNumber(ix)) {
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
    if (!isNumber(ix)) {
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

export function addUnique (dict, added) {
  Object.keys(added).forEach(key => {
    if (!has(dict, key)) {
      dict[key] = added[key];
    } else if (isArray(dict[key])) {
      dict[key] = unionWith(dict[key], added[key], isEqual);
    } else {
      addUnique(dict[key], added[key]);
    }
  });
}

export function addWeights (dict, inCompany) {
  const indications = {...dict};
  // add the weights to each item in the indications
  for (const [indicationType, values] of Object.entries(dict)) {
    if (has(INDICATION_WEIGHTING, indicationType)) {
      let weight = INDICATION_WEIGHTING[indicationType];
      if (inCompany) {
        weight = weight + INDICATION_WEIGHTING.inCompany;
      }
      const addWeight = (indication) => {
        return {...indication, weight};
      };
      if (isArray(values)) {
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

function getOccupation (querent, quesited) {
  const occupation = [];
  if (querent.hasFigure(quesited)) {
    occupation.push(hit(querent, quesited));
  }
  return occupation;
}

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
  // console.log('Springs for ', querent.index, quesited.index, springs);
  return springs;
}

function getTranslations (querent, quesited, houses) {
  const translation = [];
  // translations
  let querentNeighbors = querent.getNeighbors(houses);
  let quesitedNeighbors = quesited.getNeighbors(houses);

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
        translation.push(hit(querentN, quesitedN));
      }
    }
  }
  return translation;
}

/**
 * walks an indications structure, returning an array of keyed values
 */
export function getAttributeArray (dict, member) {
  let found = [];
  for (const [key, values] of Object.entries(dict)) {
    if (isArray(values)) {
      const work = values.map(x => x[member]);
      found = concat(found, work);
    } else if (isObject(values)) {
      if (has(values, member)) {
        found.push(values[member]);
      } else {
        found = concat(found, getAttributeArray(values, member));
      }
    }
  }
  return found.filter(x => !isUndefined(x));
}

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
