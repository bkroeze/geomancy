/*
 * geomancy
 * https://github.com/bkroeze/geomancy
 *
 * Copyright (c) 2016 Bruce Kroeze
 * Licensed under the MIT license.
 */

'use strict';
import test from 'ava';
import geomancy from '../lib/geomancy';

test('it is defined', t => {
  const geoType = typeof (geomancy);
  t.is(geoType, 'function', 'Should be a function');
});
