#!/usr/bin/env node
const _ = require("lodash");
const clear = require("clear");
const keypress = require("keypress");
const { program } = require("commander");
const game = require("../lib/index.js");
const pkg = require("../package.json");
const chalk = require("chalk");

program
  .version(pkg.version)
  .option("-f, --full", "terminal full size")
  .parse(process.argv);

function getColorItem(item, char) {
  if (chalk[item.color]) {
    return chalk[item.color](char);
  }
  return chalk.blue(char);
}

const getMark = (item) =>
  item.color === "grey" ? getColorItem(item, ".") : getColorItem(item, "■");

const dump = (state) => {
  console.log(JSON.stringify(state));
};

const save = (ctx) => {
  ctx.savedState = _.cloneDeep(ctx.state);
};

const restore = (ctx) => {
  ctx.state = ctx.savedState;
};

const format = (ary) =>
  ary.map((r) => r.map((item) => getMark(item)).join(" ")).join("|\r\n");

const startGame = (rows = 15, columns = 15) => {
  const ctx = {
    state: game.init(rows, columns),
  };

  keypress(process.stdin);

  process.stdin.on("keypress", (ch, key) => {
    if (key && key.ctrl && key.name === "c") {
      process.exit();
    }
    if (key && key.name === "q") {
      process.exit();
    }
    if (key && key.name === "s") {
      save(ctx);
    }
    if (key && key.name === "l") {
      restore(ctx);
    }
    if (key && key.ctrl && key.name === "d") {
      dump(ctx.state);
      process.exit();
    }
    if (key) {
      ctx.state = game.key(key.name, ctx.state);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  ctx.timer = setInterval(() => {
    ctx.state = game.tick(ctx.state);
    if (!program.opts().full) {
      clear();
    }
    console.log(format(game.join(ctx.state)));
  }, 200);
};

const activate = () => {
  if (program.opts().full) {
    startGame(process.stdout.rows - 1, process.stdout.columns / 2 - 1);
  } else {
    startGame();
  }
};

activate();
