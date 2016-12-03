'use strict';
import test from 'ava';
import { Figure } from '../lib/models';

test('Figure should construct via a numeric boolean (1)', t => {
  let geo = new Figure(1000);
  t.falsy(geo.fire);
  t.falsy(geo.air);
  t.falsy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1000);
});

test('Figure  should construct via a numeric boolean (2)', t => {
  let geo = new Figure();
  geo.flags = 1100;
  t.falsy(geo.fire);
  t.falsy(geo.air);
  t.truthy(geo.water);
  t.truthy(geo.earth);
  t.is(geo.number, 1100);
});

test('Figure should construct via a numeric boolean (3)', t => {
  let geo = new Figure(11);
  t.truthy(geo.fire);
  t.truthy(geo.air);
  t.falsy(geo.water);
  t.falsy(geo.earth);
  t.is(geo.number, 11);
});

test('Figure should get by name', t => {
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

test('Figure should get by Flags', t => {
  let geo = Figure.byFlags('1111');
  t.is(geo.name, 'Via');
});

test('Figure should get lines of figures by index', t => {
  let geo = Figure.byName('carcer');
  t.truthy(geo.getLine(0));
  t.falsy(geo.getLine(1));
  t.falsy(geo.getLine(2));
  t.truthy(geo.getLine(3));
});

test('Figure should get details of figures', t => {
  let geo = Figure.byName('Albus');
  t.is(geo.details.english, 'White');
});

test('Figure should add figures together', t => {
  let via = Figure.byName('Via');
  let populus = Figure.byName('Populus');
  t.is(via.add(populus), via);
  let fmajor = Figure.byName('fortuna major');
  let fminor = Figure.byName('fortuna minor');
  t.is(fmajor.add(via), fminor);
});

test('Figure should add together several figures in sequence', t => {
  let puer = Figure.byName('puer');
  let via = Figure.byName('Via');
  let conj = Figure.byName('Conjunctio');
  t.is(via.add(puer, conj).name, 'Rubeus');
  // same as
  t.is(via.add(puer).add(conj).name, 'Rubeus');
});
