import {Chart} from '../charts';
import {TextShield} from './TextShield';

function makeChart (args) {
  var figures = [args.figure1, args.figure2, args.figure3, args.figure4];
  return new Chart(figures, args.querent, args.quesited);
}

function houseCommand (args) {
  var chart = makeChart(args);
  var houses = chart.getHouses();
  if (args.list) {
    for (var i = 0; i < 12; i++) {
      console.log((i + 1) + ' ' + houses[i].figure.name + '\n' + houses[i].figure.toTextFigure() + '\n');
    }
  }
  if (args.shield) {
    console.log('\nShield Chart\n------------');
    var shield = new TextShield(chart);
    console.log(shield.toString());
  }
  if (args.indications) {
    console.log('\nIndications\n------------');
    console.log(JSON.stringify(chart.getIndications(), null, 2));
  }
  if (args.weight) {
    console.log(`Weight = ${chart.getIndicationWeight()}`);
  }
}

function chartOptions (yargs) {
  return yargs
    .positional('figure1', {
      describe: 'First Mother',
      type: 'string',
      default: 'populus'
    })
    .positional('figure2', {
      describe: 'First Mother',
      type: 'string',
      default: 'populus'
    })
    .positional('figure3', {
      describe: 'First Mother',
      type: 'string',
      default: 'populus'
    })
    .positional('figure4', {
      describe: 'First Mother',
      type: 'string',
      default: 'populus'
    })
    .option('querent', {alias: 'Q', type: 'number', default: 0})
    .option('quesited', {alias: 'q', type: 'number', default: 4});
}

var figureString = '[figure1] [figure2] [figure3] [figure4]';

function builder (yargs) {
  return chartOptions(yargs)
    .option('indications', {alias: 'i', type: 'boolean', default: false})
    .option('weight', {alias: 'w', type: 'boolean', default: false})
    .option('list', {description: 'Show list of houses and figures', default: false})
    .option('shield', {type: 'boolean', default: false});
}

var args = require('yargs')
  .command({
    command: 'chart ' + figureString,
    desc: 'make a Chart',
    builder: builder,
    handler: houseCommand
  })
  .help()
  .parse();

// console.log(args);
