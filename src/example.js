#!/usr/bin/env node
const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .option('-f, --full', 'terminal full size')
  .parse(process.argv);

const startGame = (rows = 17, columns = 15) => {
}

const activate = (program) => {
  if (program.full) {
    startGame(process.stdout.rows - 2, (process.stdout.columns / 2) - 4 );
  } else {
    startGame();
  }
}

activate(program);

