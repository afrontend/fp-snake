#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const clear = require("clear");
const game = require("../lib/index.js");

const ROWS = 15;
const COLS = 15;
const TICK_INTERVAL_MS = 200;
const MAX_TICKS = 2000;

// ── Rendering ────────────────────────────────────────────────────────────────

function getColorItem(item, char) {
  return chalk[item.color] ? chalk[item.color](char) : chalk.blue(char);
}
const getMark = item =>
  item.color === "grey" ? getColorItem(item, ".") : getColorItem(item, "■");
const format = ary =>
  ary.map(r => r.map(item => getMark(item)).join(" ")).join("|\r\n");

// ── Board parsing ─────────────────────────────────────────────────────────────

function parseBoard(state) {
  const rows = state.snakePanel.length;
  const cols = state.snakePanel[0].length;

  // Snake body cells (sorted by index: 0 = head)
  const snakeCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = state.snakePanel[r][c];
      if (!game.isBlank(cell)) {
        snakeCells.push({ row: r, col: c, index: cell.index });
      }
    }
  }
  snakeCells.sort((a, b) => a.index - b.index);
  const head = snakeCells[0];

  // Apple position
  let apple = null;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!game.isBlank(state.applePanel[r][c])) {
        apple = { row: r, col: c };
      }
    }
  }

  // Occupied set (snake body, excluding tail — tail will move away next tick)
  const occupied = new Set();
  for (let i = 0; i < snakeCells.length - 1; i++) {
    occupied.add(`${snakeCells[i].row},${snakeCells[i].col}`);
  }

  return { head, apple, occupied, rows, cols };
}

// ── BFS ───────────────────────────────────────────────────────────────────────

const DIRS = [
  { key: "up", dr: -1, dc: 0 },
  { key: "down", dr: 1, dc: 0 },
  { key: "left", dr: 0, dc: -1 },
  { key: "right", dr: 0, dc: 1 }
];

function bfs(start, goal, occupied, rows, cols) {
  const queue = [{ ...start, path: [] }];
  const visited = new Set([`${start.row},${start.col}`]);

  while (queue.length > 0) {
    const { row, col, path } = queue.shift();

    for (const dir of DIRS) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      const key = `${nr},${nc}`;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (occupied.has(key) || visited.has(key)) continue;

      const newPath = [...path, dir.key];

      if (nr === goal.row && nc === goal.col) return newPath;

      visited.add(key);
      queue.push({ row: nr, col: nc, path: newPath });
    }
  }
  return null; // no path found
}

// ── Flood fill (reachable cell count from a position) ────────────────────────

function floodFill(start, occupied, rows, cols) {
  const stack = [start];
  const visited = new Set([`${start.row},${start.col}`]);
  let count = 0;

  while (stack.length > 0) {
    const { row, col } = stack.pop();
    count++;
    for (const dir of DIRS) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (occupied.has(key) || visited.has(key)) continue;
      visited.add(key);
      stack.push({ row: nr, col: nc });
    }
  }
  return count;
}

// ── Decision logic ────────────────────────────────────────────────────────────

function chooseKey(state) {
  const { head, apple, occupied, rows, cols } = parseBoard(state);
  const totalFree = rows * cols - occupied.size - 1; // -1 for head itself

  // 1. Find shortest path to apple
  const pathToApple = apple ? bfs(head, apple, occupied, rows, cols) : null;

  if (pathToApple && pathToApple.length > 0) {
    const firstKey = pathToApple[0];
    const dir = DIRS.find(d => d.key === firstKey);
    const nextPos = { row: head.row + dir.dr, col: head.col + dir.dc };

    // Simulate occupancy after moving (tail frees up — already excluded above)
    const nextOccupied = new Set(occupied);
    nextOccupied.add(`${head.row},${head.col}`);

    // Safety check: is enough space reachable after this move?
    const reachable = floodFill(nextPos, nextOccupied, rows, cols);
    const safe = reachable >= totalFree * 0.5;

    if (safe) return firstKey;
  }

  // 2. Fallback: chase tail (keeps snake moving along open space)
  const tailTarget = findTail(state);
  if (tailTarget) {
    const pathToTail = bfs(head, tailTarget, occupied, rows, cols);
    if (pathToTail && pathToTail.length > 0) return pathToTail[0];
  }

  // 3. Last resort: pick any direction that doesn't immediately kill the snake
  for (const dir of DIRS) {
    const nr = head.row + dir.dr;
    const nc = head.col + dir.dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
    if (!occupied.has(`${nr},${nc}`)) return dir.key;
  }

  return "up"; // trapped — nothing we can do
}

function findTail(state) {
  let tailCell = null;
  let maxIndex = -1;
  for (let r = 0; r < state.snakePanel.length; r++) {
    for (let c = 0; c < state.snakePanel[0].length; c++) {
      const cell = state.snakePanel[r][c];
      if (!game.isBlank(cell) && cell.index > maxIndex) {
        maxIndex = cell.index;
        tailCell = { row: r, col: c };
      }
    }
  }
  return tailCell;
}

// ── Main loop ─────────────────────────────────────────────────────────────────

let state = game.init(ROWS, COLS);
let ticks = 0;

const timer = setInterval(() => {
  const k = chooseKey(state);
  state = game.key(k, state);
  state = game.tick(state);

  clear();
  console.log(format(game.join(state)));

  ticks++;
  if (ticks >= MAX_TICKS) {
    clearInterval(timer);
    process.exit(0);
  }
}, TICK_INTERVAL_MS);
