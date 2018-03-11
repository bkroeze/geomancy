# geomancy

Geomantic utilities

[![Build Status](https://secure.travis-ci.org/bkroeze/geomancy.png?branch=master)](http://travis-ci.org/bkroeze/geomancy) [![NPM version](https://badge-me.herokuapp.com/api/npm/geomancy.png)](http://badges.enytc.com/for/npm/geomancy)

## Getting Started
Install the module with: `npm install geomancy`

```javascript
var geomancy = require('geomancy');
const fig = geomancy.Figure.byName('populus'); // Populus Figure

Look at the tests for examples of the API.
```

## Showing a chart

Example:
```bash
./geomancy.js chart tristitia albus cauda-draconis caput-draconis --shield --houses=esoteric --meanings
```

## Other stuff

* documentation - I've started documenting the API.  See API.md.
* support - open an issue [here](https://github.com/bkroeze/geomancy/issues).

## License
[MIT](http://opensource.org/licenses/MIT) © 2016-2018, Bruce Kroeze
