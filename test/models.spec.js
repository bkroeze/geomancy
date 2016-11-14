'use strict';
import test from 'ava';
import { Figure } from '../lib/models';

test('It should construct via a numeric boolean (1)', t => {
  let geo = new Figure(1000);
  t.falsy(geo.fire);
  t.falsy(geo.air);
  t.falsy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1000);
});

test('It should construct via a numeric boolean (2)', t => {
  let geo = new Figure();
  geo.flags = 1100;
  t.falsy(geo.fire);
  t.falsy(geo.air);
  t.truthy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1100);
});

test('It should construct via a numeric boolean (3)', t => {
  let geo = new Figure(11);
  t.truthy(geo.fire);
  t.truthy(geo.air);
  t.falsy(geo.water);
  t.falsy(geo.earth);
  t.is(geo.number, 11);
});

test('It should get by name', t => {
  let geo = Figure.byName('via');
  t.is(geo.number, 1111);

  geo = Figure.byName('carcer');
  t.truthy(geo.fire);
  t.falsy(geo.air);
  t.falsy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1001);
  t.is(geo.name.toLowerCase(), 'carcer');
});
