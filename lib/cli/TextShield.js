import {map, keys} from 'ramda';

const transpose = a => map(c => map(r => r[c], a), keys(a[0]));

export class TextShield {
  constructor (chart) {
    this.chart = chart;
  }

  toString () {
    const rows = [];
    let row = [];
    for (var i = 0; i < 8; i++) {
      row.push(this.chart.getHouse(7 - i).figure.toTextFigure('*', 5));
    }
    rows.push(row);
    row = [];
    for (var i = 0; i < 4; i++) {
      row.push(this.chart.getHouse(11 - i).figure.toTextFigure('*', 10));
    }
    rows.push(row);
    row = [];
    for (var i = 0; i < 2; i++) {
      row.push(this.chart.getHouse(13 - i).figure.toTextFigure('*', 20));
    }
    rows.push(row);
    rows.push([this.chart.getHouse(14).figure.toTextFigure('*', 40)]);

    // now "flatten the rows by splitting on \n"
    const work = rows.map(row => {
      return row.map(c => c.split('\n'));
    });

    let out = work.map(transpose);

    out = out.map(row => {
      return row.map(c => c.join('')).join('\n');
    });

    return out.join('\n\n');
  }
}
