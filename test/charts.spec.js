'use strict';
import test from 'ava';
import { Figure } from '../lib/models';
import { Chart, ChartSequence } from '../lib/charts';

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
    seq.get('foo');}, TypeError);
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
    t.is(strength, figure.getStrength(i + 1));
  }
});

test('Chart should construct with a sequence', t => {
  seq = new ChartSequence('amisso', 'conjunctio', 'laetitia', 'populus');
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

test('Chart should publish shield field names', t => {
  const chart = new Chart();
  t.is(chart.shieldKeys[0], 'Mother 1');
});
