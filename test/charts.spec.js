'use strict';
import test from 'ava';
import { Figure } from '../lib/models';
import { Chart, ChartSequence, addUnique } from '../lib/charts';

const populus = Figure.byName('populus');
let seq;

test.before(t => {
  seq = new ChartSequence();
});

test('Chart Sequence should start with populus', t => {
  for (let i = 0; i < 15; i++) {
    t.is(seq.get(i), populus);
  }
});

test('Chart Sequence should project daughters', t => {
  seq.set(0, Figure.byName('amisso'));
  seq.set(1, Figure.byName('laetitia'));
  seq.set(2, Figure.byName('amisso'));
  seq.set(3, Figure.byName('via'));
  t.is(seq.get(4).name, 'Via');
  t.is(seq.getDaughter(0).name, 'Via');
  t.is(seq.get(5).name, 'Tristitia');
  t.is(seq.getDaughter(1).name, 'Tristitia');
  t.is(seq.get(6).name, 'Puella');
  t.is(seq.getDaughter(2).name, 'Puella');
  t.is(seq.get(7).name, 'Tristitia');
  t.is(seq.getDaughter(3).name, 'Tristitia');
});

test('Chart Sequence should project neices and the rest', t => {
  seq = new ChartSequence('amisso', 'conjunctio', 'laetitia', 'populus');
  t.is(seq.get(8).name, 'Fortuna Minor');
  t.is(seq.get(9).name, 'Laetitia');
  t.is(seq.get(10).name, 'Cauda Draconis');
  t.is(seq.get(11).name, 'Fortuna Minor');
  t.is(seq.get(12).name, 'Rubeus');
  t.is(seq.get(13).name, 'Albus');
  t.is(seq.get(14).name, 'Conjunctio');
});

test('Sequence.get only works on numbers', t => {
  const error = t.throws(() => {
    seq.get('foo');
  }, TypeError);
  t.is(error.message, 'Invalid Index');
});

test('Chart should construct without a sequence', t => {
  const chart = new Chart();
  // chart starts with populus in all 4 Mothers, if nothing given
  const houses = chart.getHouses();
  t.is(houses.length, 12);
  for (let i = 0; i < 12; i++) {
    let {figure, strength} = houses[i];
    t.is(figure.name, 'Populus');
    t.is(strength, figure.getStrength(i));
  }
});

test('Chart should store and return querent/quesited', t => {
  const chart = new Chart();
  chart.querent = 1;
  chart.quesited = 2;
  const houses = chart.getHouses();
  let house;
  for (let i = 0; i < 12; i++) {
    house = houses[i];
    t.is(house.figure.name, 'Populus');
    if (i === 1) {
      t.is(house.querent, true);
    } else if (i === 2) {
      t.is(house.quesited, true);
    } else {
      t.is(house.querent, false);
      t.is(house.quesited, false);
    }
  }
});

test('Chart should construct with a sequence', t => {
  const seq = new ChartSequence('amisso', 'conjunctio', 'laetitia', 'populus');
  const chart = new Chart(seq);
  const shield = chart.getShield();
  t.is(shield.get('Mother 1').name, 'Amisso');
  t.is(shield.get('Mother 2').name, 'Conjunctio');
  t.is(shield.get('Mother 3').name, 'Laetitia');
  t.is(shield.get('Mother 4').name, 'Populus');
  t.is(shield.get('Niece 1').name, 'Fortuna Minor');
  t.is(shield.get('Niece 2').name, 'Laetitia');
  t.is(shield.get('Niece 3').name, 'Cauda Draconis');
  t.is(shield.get('Niece 4').name, 'Fortuna Minor');
  t.is(shield.get('Left Witness').name, 'Rubeus');
  t.is(shield.get('Right Witness').name, 'Albus');
  t.is(shield.get('Judge').name, 'Conjunctio');
});

test('Chart should return a standalone clone', t => {
  const chart = new Chart();
  const chart2 = chart.clone();
  t.is(chart === chart2, false);
  t.is(chart.seq === chart2.seq, false);
  const s1 = chart.getSeeds(true).join(',');
  const s2 = chart2.getSeeds(true).join(',');
  t.is(s1 === s2, true);
});

test('Chart should find springs', t => {
  // [ 0, 'Amisso' ],
  // [ 1, 'Conjunctio' ],
  // [ 2, 'Laetitia' ],
  // [ 3, 'Populus' ],
  // [ 4, 'Amisso' ],
  // [ 5, 'Rubeus' ],
  // [ 6, 'Fortuna Minor' ],
  // [ 7, 'Populus' ],
  // [ 8, 'Fortuna Minor' ],
  // [ 9, 'Laetitia' ],
  // [ 10, 'Cauda Draconis' ],
  // [ 11, 'Fortuna Minor' ]
  const seq = new ChartSequence('amisso', 'conjunctio', 'laetitia', 'populus');
  const chart = new Chart(seq, 0, 11);
  const indications = chart.getIndications();
  t.is(indications.springs.querent.length, 1);
  t.deepEqual(indications.springs.querent, [{from: 0, to: 4}]);
  // t.is(indications.springs.quesited.length, 2);
  t.deepEqual(indications.springs.quesited, [{from: 11, to: 6}, {from: 11, to: 8}]);
});

test('Chart should find occupation', t => {
  /*
  [0'Via',
  1 'Populus',
  2 'Conjunctio',
  3 'Populus',
  4 'Laetitia',
  5 'Amisso',
  6 'Amisso',
  7 'Laetitia',
  8 'Via',
  9 'Conjunctio',
  10 'Albus',
  11 'Albus' ]
  */
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 0, 8);
  const indications = chart.getIndications();
  t.deepEqual(indications.occupations, [{querent: 0, quesited: 8, weight: 5}]);
});

test('Chart should find conjunctions', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 0, 7);
  const indications = chart.getIndications();
  t.deepEqual(indications.conjunctions.quesited, [{querent: 8, quesited: 7, weight: 5}]);
});

test('Chart should find no mutations', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 10, 7);
  const indications = chart.getIndications();
  t.is(indications.mutations.length, 0);
});

test('Chart should find a mutation', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 1, 7);
  const indications = chart.getIndications();
  t.is(indications.mutations.length, 1);
  t.deepEqual(indications.mutations[0], {querent: 3, quesited: 4, weight: 4});
});

test('Chart should find no translations', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 2, 9);
  const indications = chart.getIndications();
  t.is(indications.translations.length, 0);
});

test('Chart should find a translation', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 3, 6);
  const indications = chart.getIndications();
  t.is(indications.translations.length, 1);
  t.deepEqual(indications.translations[0], {querent: 4, quesited: 7, weight: 4});
});

test('Chart should not find a translation for the house exactly between the two', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 7, 9);
  const indications = chart.getIndications();
  t.is(indications.translations.length, 0);
});

test('Chart should find its index', t => {
  const seq = new ChartSequence('Via', 'Via', 'Via', 'Via');
  const chart = new Chart(seq, 0, 7);
  const house = chart.getIndex();
  t.is(house.index, 8);
  t.is(house.equals(chart.getHouse(8)), true);
});

test('Chart should find its part of fortune', t => {
  const seq = new ChartSequence('Via', 'Via', 'Via', 'Via');
  const chart = new Chart(seq, 0, 7);
  const house = chart.getPartOfFortune();
  t.is(house.index, 4);
  t.is(house.equals(chart.getHouse(4)), true);
});

test('Chart should find aspects 1', t => {
  const seq = new ChartSequence('Via', 'Populus', 'Conjunctio', 'Populus');
  const chart = new Chart(seq, 0, 9);
  const indications = chart.getIndications();
  t.is(indications.sextiles.length, 1);
  t.deepEqual(indications.sextiles[0], {
    direction: 'sinister',
    querent: 0,
    quesited: 2,
    weight: 3
  });
  t.is(indications.oppositions.length, 2);
  t.deepEqual(indications.oppositions[0], {
    direction: '',
    querent: 8,
    quesited: 2,
    weight: -4
  });
});

test('Chart should find its way of points - single', t => {
  let chart = new Chart(['fortuna minor', 'populus', 'populus', 'populus']);
  let points = chart.getWayOfThePoint();
  t.is(points.length, 1);
  t.is(points[0], 0);

  chart = new Chart(['fortuna minor', 'cauda draconis', 'laetitia', 'populus']);
  points = chart.getWayOfThePoint();
  t.is(points.length, 1);
  t.is(points[0], 2);
});

test('Chart should find its way of points - branching', t => {
  let chart = new Chart(['fortuna minor', 'cauda draconis', 'fortuna minor', 'laetitia']);
  let points = chart.getWayOfThePoint();
  t.is(points.length, 2);
  t.deepEqual(points, [6, 7]);
});

test('Chart should find company', t => {
  let chart = new Chart();
  let result = chart.getCompany(0);
  t.deepEqual(result, {house: 1, company: 'simple'});

  chart = new Chart(['tristitia', 'cauda draconis', 'populus', 'via']);
  result = chart.getCompany(0);
  t.deepEqual(result, {house: 1, company: 'demi-simple'});
});

test('Chart should find company from quesited', t => {
  let chart = new Chart();
  let result = chart.getCompany(5);
  t.deepEqual(result, {house: 4, company: 'simple'});

  chart = new Chart(['cauda draconis', 'puer', 'albus', 'carcer'], 0, 6);
  // console.log(chart.getHouses().map(h => h.figure.name));
  result = chart.getCompany(6);
  t.deepEqual(result, {house: 7, company: 'compound'});
});

test('Utility addUnique should add dictionaries together', t => {
  const init = {a: [1, 2], b: [3, 4], c: [5, 6]};
  let added = {a: [1, 2], b: [3, 4], c: [7]};
  addUnique(init, added);
  t.deepEqual(init, {a: [1, 2], b: [3, 4], c: [5, 6, 7]});

  added.c = [5, 6, 8];
  added.d = ['foo'];
  addUnique(init, added);
  t.deepEqual(init, {a: [1, 2], b: [3, 4], c: [5, 6, 7, 8], d: ['foo']});
});

test('Utility should add dictionaries 2', t => {
  const init = {
    'aspects': {
      'perfections': [
        {'direction': 'sinister', 'querent': 0, 'quesited': 2, 'aspect': 'sextile'}
      ],
      'denials': [
        {'direction': '', 'querent': 8, 'quesited': 2, 'aspect': 'opposition'}
      ]
    }
  };
  const added = {
    'aspects':
    {'perfections':
    [
        {'direction': 'dexter', 'querent': 1, 'quesited': 9, 'aspect': 'trine'}
    ],
      'denials': [
        {'direction': '', 'querent': 3, 'quesited': 9, 'aspect': 'opposition'}
      ]
    }
  };
  addUnique(init, added);
  const expected = {
    'perfections': [
      {'direction': 'sinister', 'querent': 0, 'quesited': 2, 'aspect': 'sextile'},
      {'direction': 'dexter', 'querent': 1, 'quesited': 9, 'aspect': 'trine'}
    ],
    'denials': [
      {'direction': '', 'querent': 8, 'quesited': 2, 'aspect': 'opposition'},
      {'direction': '', 'querent': 3, 'quesited': 9, 'aspect': 'opposition'}
    ]
  };
  t.deepEqual(init.aspects, expected);
});

test('Chart should find perfections and denials by company', t => {
  const chart = new Chart(['fortuna major', 'fortuna minor', 'populus', 'fortuna minor'], 0, 3);
  const indications = chart.getIndications();
  t.is(indications.occupations.length, 1);
  t.deepEqual(indications.occupations[0], {querent: 1, quesited: 3, weight: 4});
});
