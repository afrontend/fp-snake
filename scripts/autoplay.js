#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const clear = require("clear");
const game = require("../lib/index.js");

const ROWS = 15;
const COLS = 15;
const TICK_INTERVAL_MS = 200;
const MAX_KEYS = 50;
const KEY_EVERY_N_TICKS = 3;
const EXTRA_TICKS = 15;

const ARROW_KEYS = ["left", "up", "right", "down"];

function getColorItem(item, char) {
  if (chalk[item.color]) {
    return chalk[item.color](char);
  }
  return chalk.blue(char);
}

const getMark = item =>
  item.color === "grey" ? getColorItem(item, ".") : getColorItem(item, "■");

const format = ary =>
  ary.map(r => r.map(item => getMark(item)).join(" ")).join("|\r\n");

let state = game.init(ROWS, COLS);
let tick = 0;
let keysPressed = 0;

const timer = setInterval(() => {
  state = game.tick(state);
  clear();
  console.log(format(game.join(state)));

  if (tick % KEY_EVERY_N_TICKS === 0 && keysPressed < MAX_KEYS) {
    const k = ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)];
    state = game.key(k, state);
    keysPressed++;
  }

  tick++;

  if (keysPressed >= MAX_KEYS && tick >= MAX_KEYS * KEY_EVERY_N_TICKS + EXTRA_TICKS) {
    clearInterval(timer);
    process.exit(0);
  }
}, TICK_INTERVAL_MS);
