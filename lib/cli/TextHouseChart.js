import {map, keys} from 'ramda';

const transpose = a => map(c => map(r => r[c], a), keys(a[0]));

export class TextHouseChart {
  constructor (chart) {
    this.chart = chart;
  }

  toString () {
    const B = "       \n       \n       \n       ";
    const h = (i) => this.chart.getHouse(i-1).figure.toTextFigure('*', 7);
    const rows = [
      [B, h(11), h(10), h(9), B],
      [h(12), B, B, B, h(8)],
      [h(1), B, h(15), B, h(7)],
      [h(2), B, B, B, h(6)],
      [B, h(3), h(4), h(5), B]
    ];
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
