#!/usr/bin/env node
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
  ctx.savedState = structuredClone(ctx.state);
};

const reload = (ctx) => {
  ctx.state = ctx.savedState;
};

const format = (ary) =>
  ary.map((r) => r.map((item) => getMark(item)).join(" ")).join("|\r\n");

const HELP_TEXT = [
  "",
  "  Controls:",
  "  ← ↑ → ↓  Move snake",
  "  Space     Pause / resume",
  "  s         Save state",
  "  l         Load state",
  "  h         Toggle this help",
  "  q / ^C    Quit",
].join("\r\n");

const startGame = (rows = 15, columns = 15) => {
  const ctx = {
    state: game.init(rows, columns),
    showHelp: false,
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
      reload(ctx);
    }
    if (key && key.name === "h") {
      ctx.showHelp = !ctx.showHelp;
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
    if (!ctx.showHelp) {
      ctx.state = game.tick(ctx.state);
    }
    if (!program.opts().full) {
      clear();
    }
    console.log(format(game.join(ctx.state)));
    if (ctx.showHelp) {
      console.log(HELP_TEXT);
    }
  }, 200);
};

const runCountdown = (rows, columns) => {
  const counts = [5, 4, 3, 2, 1];
  let i = 0;

  const tick = () => {
    clear();
    console.log("\r\n");
    console.log(chalk.yellow("  fp-snake\r\n"));
    console.log(chalk.cyan("  Press [ h ] for help\r\n"));
    console.log(chalk.white("  Starting in... ") + chalk.bold.green(counts[i]));
    i++;
    if (i < counts.length) {
      setTimeout(tick, 1000);
    } else {
      setTimeout(() => startGame(rows, columns), 1000);
    }
  };

  tick();
};

const activate = () => {
  if (program.opts().full) {
    runCountdown(process.stdout.rows - 1, process.stdout.columns / 2 - 1);
  } else {
    runCountdown();
  }
};

activate();
