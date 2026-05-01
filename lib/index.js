const p = require("fp-panel");

// Configuration

const config = {
  color: "grey",
  appleColor: "red",
  snakeColor: "orange",
};

// Native utilities replacing lodash

const flow = (fns) => (x) => fns.reduce((v, f) => f(v), x);
const filter = (fn) => (ary) => ary.filter(fn);
const sortBy = (key) => (ary) =>
  [...ary].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const flatten = (ary) => ary.flat();
const head = (ary) => ary[0];
const isUndefined = (x) => x === undefined;

// Paint

const paintApple = (panel) =>
  p.paint(
    panel,
    [
      {
        row: randInt(0, panel.length - 1),
        column: randInt(0, panel[0].length - 1),
      },
    ],
    config.appleColor,
  );

const paintSnake = (panel) =>
  p.paint(
    panel,
    [
      {
        row: randInt(0, panel.length - 1),
        column: randInt(0, panel[0].length - 1),
        key: 0,
      },
    ],
    config.snakeColor,
  );

// Panel

const createPanel = (r, c) => p.createPanel(r, c);
const createApplePanel = (r, c) => paintApple(createPanel(r, c));
const createSnakePanel = (r, c) => paintSnake(createPanel(r, c));

// For snake

const SPACE = "space";
const LEFT = "left";
const UP = "up";
const RIGHT = "right";
const DOWN = "down";

const matchKey = (akey, bkey) => (akey === bkey ? 1 : 0);

const getNewRowColumn = (headItem, key) => ({
  row: headItem.row - matchKey(key, UP) + matchKey(key, DOWN),
  column: headItem.column - matchKey(key, LEFT) + matchKey(key, RIGHT),
});

const addHeadItem = (ary) => {
  const snake = structuredClone(ary);
  const headItem = structuredClone(snake[0]);
  const newHeadItem = Object.assign(
    headItem,
    getNewRowColumn(headItem, headItem.key),
  );
  return [newHeadItem, ...snake];
};

const removeTailItem = (ary) => ary.slice(0, -1);

const reindex = (ary) => ary.map((item, index) => ({ ...item, index }));

const justPaintSnake = (rows, cols) => (posAry) =>
  p.paint(createPanel(rows, cols), posAry, config.snakeColor);

const moveSnake = (snakePanel) =>
  flow([
    flatten,
    filter(p.isFilled),
    sortBy("index"),
    addHeadItem,
    reindex,
    removeTailItem,
    justPaintSnake(snakePanel.length, snakePanel[0].length),
  ])(snakePanel);

const moveSnakeAndAddTail = (snakePanel) =>
  flow([
    flatten,
    filter(p.isFilled),
    sortBy("index"),
    addHeadItem,
    reindex,
    justPaintSnake(snakePanel.length, snakePanel[0].length),
  ])(snakePanel);

const getSnake = flow([flatten, filter(p.isFilled)]);

const addCount = ({ applePanel, snakePanel }) => {
  const count = getSnake(snakePanel).length;
  const lastRowIdx = applePanel.length - 1;
  const lastColIdx = applePanel[lastRowIdx].length - 1;
  const newApplePanel = applePanel.map((row, ri) =>
    row.map((cell, ci) =>
      ri === lastRowIdx && ci === lastColIdx ? { ...cell, count } : cell,
    ),
  );
  return { applePanel: newApplePanel, snakePanel };
};

// Check functions

const getHeadItem = flow([
  structuredClone,
  flatten,
  filter(p.isFilled),
  sortBy("index"),
  head,
]);

const getNextItem = (snakePanel, key) => {
  const headItem = getHeadItem(snakePanel);
  const { row, column } = getNewRowColumn(headItem, key);
  return snakePanel && snakePanel[row] && snakePanel[row][column]
    ? snakePanel[row][column]
    : undefined;
};
const nextItemIsBlank = flow([getNextItem, p.isBlankItem]);
const nextItemIsOutOfRange = flow([getNextItem, isUndefined]);

const updatePanel = ({ applePanel, snakePanel }) => {
  const outOfRange = nextItemIsOutOfRange(
    snakePanel,
    getHeadItem(snakePanel).key,
  );
  const tempSnakePanel = outOfRange ? snakePanel : moveSnake(snakePanel);
  const overlap = p.isOverlap(applePanel, tempSnakePanel);
  const newApplePanel = overlap
    ? createApplePanel(snakePanel.length, snakePanel[0].length)
    : applePanel;
  const newSnakePanel = overlap
    ? moveSnakeAndAddTail(snakePanel)
    : tempSnakePanel;
  return addCount({
    applePanel: newApplePanel,
    snakePanel: newSnakePanel,
  });
};

const arrowKey = ({ applePanel, snakePanel, key }) => {
  const headItem = getHeadItem(snakePanel);
  const origKey = snakePanel[headItem.row][headItem.column].key;
  snakePanel[headItem.row][headItem.column].key = nextItemIsBlank(
    snakePanel,
    key,
  )
    ? key
    : origKey;
  return { applePanel, snakePanel };
};

// Key definition

const nop = ({ applePanel, snakePanel }) => ({ applePanel, snakePanel });

const isPaused = (state) => state.pause === true;

const keyFnList = [
  { key: LEFT, fn: arrowKey },
  { key: UP, fn: arrowKey },
  { key: RIGHT, fn: arrowKey },
  { key: DOWN, fn: arrowKey },
  { key: 0, fn: nop },
];

const isValidKey = (key) => keyFnList.some((item) => item.key === key);
const validKey = ({ applePanel, snakePanel, key }) => ({
  applePanel,
  snakePanel,
  key: isValidKey(key) ? key : 0,
});

const storeKey = ({ applePanel, snakePanel, key }) =>
  keyFnList
    .find((item) => item.key === key)
    .fn({
      applePanel,
      snakePanel,
      key,
    });

const processKey = flow([validKey, storeKey]);

const MAX_DIMENSION = 500;

const init = (rows = 15, columns = 15) => ({
  applePanel: createApplePanel(
    Math.min(Math.max(1, rows), MAX_DIMENSION),
    Math.min(Math.max(1, columns), MAX_DIMENSION),
  ),
  snakePanel: createSnakePanel(
    Math.min(Math.max(1, rows), MAX_DIMENSION),
    Math.min(Math.max(1, columns), MAX_DIMENSION),
  ),
  pause: false,
});

const tick = (state) =>
  isPaused(state) ? state : { ...state, ...updatePanel(state) };

const pressKey = (keyName, state) => ({
  ...processKey({
    applePanel: state.applePanel,
    snakePanel: state.snakePanel,
    key: keyName,
  }),
  pause: keyName === SPACE ? !(state.pause ?? false) : (state.pause ?? false),
});

const join = (state) => p.add([state.applePanel, state.snakePanel]);

const toArray = ({ applePanel, snakePanel }) => [
  structuredClone(applePanel),
  structuredClone(snakePanel),
];

module.exports = {
  init,
  tick,
  key: pressKey,
  join,
  isBlank: p.isBlankItem,
  toArray,
};
