'use strict';
import test from 'ava';
import { Figure, House } from '../lib/models';

const makeHouse = (ix) => new House(ix);

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

test('Figure should calculate its point count', t => {
  let puer = Figure.byName('puer');
  let via = Figure.byName('Via');
  let conj = Figure.byName('Conjunctio');

  t.is(puer.getPoints(), 5);
  t.is(puer.getActivePoints(), 3);
  t.is(via.getPoints(), 4);
  t.is(via.getActivePoints(), 4);
  t.is(conj.getPoints(), 6);
  t.is(conj.getActivePoints(), 2);
});

test('Figures should know their company types', t => {
  const puer = Figure.byName('puer');
  const puella = Figure.byName('puella');
  const rubeus = Figure.byName('rubeus');
  const via = Figure.byName('via');
  const conjunctio = Figure.byName('conjunctio');
  t.is(puer.getCompanyType(puer), 'simple');
  t.is(puer.getCompanyType(puella), 'compound');
  t.is(puer.getCompanyType(rubeus), 'demi-simple');
  t.is(puer.getCompanyType(via), 'capitular');
  t.is(puer.getCompanyType(conjunctio), null);
  t.is(puella.getCompanyType(puella), 'simple');
});

test('Figure should render as text', t => {
  const puer = Figure.byName('puer');
  t.is(puer.toTextFigure(), ' * \n * \n* *\n * ');
});

test('House should know its neighbors', t => {
  let h = new House(6);
  t.is(h.isNextTo(2), false);
  t.is(h.isNextTo(5), true);
  t.is(h.isNextTo(7), true);
  t.is(h.isNextTo(10), false);
});

test('House should know its neighbors, wrapping around', t => {
  let h = new House(0);
  t.is(h.isNextTo(4), false);
  t.is(h.isNextTo(1), true);
  t.is(h.isNextTo(11), true);
  t.is(h.isNextTo(10), false);
});

test('House should compare less than', t => {
  let h = new House(6);
  t.is(h.isLessThan(7, 0), true);
  t.is(h.isLessThan(5, 0), false);
  t.is(h.isLessThan(0, 0), false);
  t.is(h.isLessThan(10, 0), true);
  t.is(h.isLessThan(10, 8), false);
});

test('House should know its aspects', t => {
  let h = new House(0);
  t.deepEqual(h.trines, [4, 8]);
  t.deepEqual(h.squares, [3, 9]);
  t.deepEqual(h.sextiles, [2, 10]);
  t.is(h.opposition, 6);
});

test('House should know sinister/dexter', t => {
  let h = new House(0);
  t.is(h.isSinisterOf(1), true);
  t.is(h.isDexterOf(2), false);
  t.is(h.isSinisterOf(2), true);
  t.is(h.isSinisterOf(5), true);
  t.is(h.isDexterOf(5), false);
  t.is(h.isSinisterOf(6), false);
  t.is(h.isDexterOf(6), false);
  t.is(h.isSinisterOf(11), false);
  t.is(h.isDexterOf(11), true);
});

test('Other houses know sinister too', t => {
  let h = new House(6);
  t.is(h.isSinisterOf(1), false);
  t.is(h.isSinisterOf(2), false);
  t.is(h.isSinisterOf(5), false);
  t.is(h.isSinisterOf(0), false);
  t.is(h.isSinisterOf(7), true);
  t.is(h.isSinisterOf(11), true);
});

test('House should know its parents', t => {
  for (let i = 0; i < 8; i++) {
    t.deepEqual(makeHouse(i).parents, []);
  }
  t.deepEqual(makeHouse(8).parents, [0, 1]);
  t.deepEqual(makeHouse(9).parents, [2, 3]);
  t.deepEqual(makeHouse(10).parents, [4, 5]);
  t.deepEqual(makeHouse(11).parents, [6, 7]);
  t.deepEqual(makeHouse(12).parents, [8, 9]);
  t.deepEqual(makeHouse(13).parents, [10, 11]);
  t.deepEqual(makeHouse(14).parents, [12, 13]);
});

test('House should know its companion', t => {
  t.is(makeHouse(0).companion, 1);
  t.is(makeHouse(1).companion, 0);
  t.is(makeHouse(2).companion, 3);
  t.is(makeHouse(3).companion, 2);
  t.is(makeHouse(4).companion, 5);
  t.is(makeHouse(5).companion, 4);
  t.is(makeHouse(6).companion, 7);
  t.is(makeHouse(7).companion, 6);
  t.is(makeHouse(8).companion, 9);
  t.is(makeHouse(9).companion, 8);
  t.is(makeHouse(10).companion, 11);
  t.is(makeHouse(11).companion, 10);
});

test('House should know its meanings', t => {
  const puer = Figure.byName('puer');
  const house = new House(2,puer);
  const meaning = house.getMeaning();
  t.is(meaning.house, "Communication, siblings, relatives, friends, neighbors, community, Siblings, short journeys, surroundings");
  t.is(meaning.figure, "Raises a man to honor above his brethren, and to be feared of them; signifies journeys to be dangerous, and denotes persons of good credit.");
});
