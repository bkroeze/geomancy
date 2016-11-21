'use strict';
import test from 'ava';
import { Figure } from '../lib/models';
import { ChartSequence } from '../lib/charts';

const populus = Figure.byName('populus');
let chart;

test.before(t => {
  chart = new ChartSequence();
});

test('It should start with populus', t => {
  for (let i = 0; i < 15; i++) {
    t.is(chart.get(i), populus);
  }
});

test('It should project daughters', t => {
  chart.set(0, Figure.byName('amisso'));
  chart.set(1, Figure.byName('laetitia'));
  chart.set(2, Figure.byName('amisso'));
  chart.set(3, Figure.byName('via'));
  t.is(chart.get(4).name, 'Via');
  t.is(chart.getDaughter(0).name, 'Via');
  t.is(chart.get(5).name, 'Tristitia');
  t.is(chart.getDaughter(1).name, 'Tristitia');
  t.is(chart.get(6).name, 'Puella');
  t.is(chart.getDaughter(2).name, 'Puella');
  t.is(chart.get(7).name, 'Tristitia');
  t.is(chart.getDaughter(3).name, 'Tristitia');
});

test('It should project neices', t => {
  chart = new ChartSequence('amisso', 'conjunctio', 'laetitia', 'populus');
  t.is(chart.get(8).name, 'Fortuna Minor');
  t.is(chart.get(9).name, 'Laetitia');
  t.is(chart.get(10).name, 'Cauda Draconis');
  t.is(chart.get(11).name, 'Fortuna Minor');
  t.is(chart.get(12).name, 'Rubeus');
  t.is(chart.get(13).name, 'Albus');
  t.is(chart.get(14).name, 'Conjunctio');
});
