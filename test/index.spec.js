'use strict';
import test from 'ava';
import Geomancy from '../lib';

test('Index Chart Sequence should start with populus', t => {
  const populus = Geomancy.Figure.byName('populus');
  const seq = new Geomancy.ChartSequence();
  for (let i = 0; i < 15; i++) {
    t.is(seq.get(i), populus);
  }
});

test('Index Figure should construct via a numeric boolean (2)', t => {
  let geo = new Geomancy.Figure();
  geo.flags = 1100;
  t.falsy(geo.fire);
  t.falsy(geo.air);
  t.truthy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1100);
});

test('Figures should be exported in index', t => {
  t.is(Geomancy.Figures.populus, Geomancy.Figure.byName('populus'));
});
