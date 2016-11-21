'use strict';
import test from 'ava';
import { Figure } from '../lib/models';
import { ChartSequence } from '../lib/charts';

const populus = Figure.byName('populus');
let chart;

test.before(t => {
  chart = new ChartSequence();
});

// test('It should start with populus', t => {
//   for (let i = 0; i < 15; i++) {
//     t.is(chart.get(i), populus)
//   }
// })

test('It should project daughters', t => {
  chart.set(0, Figure.byName('amisso'));
  chart.set(1, Figure.byName('laetitia'));
  chart.set(2, Figure.byName('amisso'));
  chart.set(3, Figure.byName('via'));
  // t.is(chart.get(4).name, 'Via')
  // t.is(chart.getDaughter(0).name, 'Via')
  // t.is(chart.get(5).name, 'Tristitia')
  // t.is(chart.getDaughter(1).name, 'Tristitia')
  t.is(chart.get(6).name, 'Puella');
  t.is(chart.getDaughter(2).name, 'Puella');
// t.is(chart.get(7).name, 'Tristitia')
// t.is(chart.getDaughter(3).name, 'Tristitia')
});
