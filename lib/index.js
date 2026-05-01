const p = require("fp-panel");

// Configuration

const config = {
  color: "grey",
  appleColor: "red",
  snakeColor: "orange",
};

// Native utilities replacing lodash

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);
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

const spawnSnake = (panel) =>
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
const createSnakePanel = (r, c) => spawnSnake(createPanel(r, c));

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
  const newHeadItem = {
    ...snake[0],
    ...getNewRowColumn(snake[0], snake[0].key),
  };
  return [newHeadItem, ...snake];
};

const removeTailItem = (ary) => ary.slice(0, -1);

const reindex = (ary) => ary.map((item, index) => ({ ...item, index }));

const renderSnake = (rows, cols) => (posAry) =>
  p.paint(createPanel(rows, cols), posAry, config.snakeColor);

const slideSnake = (snakePanel) =>
  pipe(
    flatten,
    filter(p.isFilled),
    sortBy("index"),
    addHeadItem,
    reindex,
    removeTailItem,
    renderSnake(snakePanel.length, snakePanel[0].length),
  )(snakePanel);

const growSnake = (snakePanel) =>
  pipe(
    flatten,
    filter(p.isFilled),
    sortBy("index"),
    addHeadItem,
    reindex,
    renderSnake(snakePanel.length, snakePanel[0].length),
  )(snakePanel);

const getSnake = pipe(flatten, filter(p.isFilled));

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

const getHeadItem = pipe(
  structuredClone,
  flatten,
  filter(p.isFilled),
  sortBy("index"),
  head,
);

const getNextItem = (snakePanel, key) => {
  const headItem = getHeadItem(snakePanel);
  const { row, column } = getNewRowColumn(headItem, key);
  return snakePanel && snakePanel[row] && snakePanel[row][column]
    ? snakePanel[row][column]
    : undefined;
};

// Explicit 2-argument functions — not flow-composed, to preserve the key arg.
const nextItemIsBlank = (snakePanel, key) =>
  p.isBlankItem(getNextItem(snakePanel, key));
const nextItemIsOutOfRange = (snakePanel, key) =>
  isUndefined(getNextItem(snakePanel, key));

const updatePanel = ({ applePanel, snakePanel }) => {
  const outOfRange = nextItemIsOutOfRange(
    snakePanel,
    getHeadItem(snakePanel).key,
  );
  const tempSnakePanel = outOfRange ? snakePanel : slideSnake(snakePanel);
  const overlap = p.isOverlap(applePanel, tempSnakePanel);
  const newApplePanel = overlap
    ? createApplePanel(snakePanel.length, snakePanel[0].length)
    : applePanel;
  const newSnakePanel = overlap ? growSnake(snakePanel) : tempSnakePanel;
  return addCount({
    applePanel: newApplePanel,
    snakePanel: newSnakePanel,
  });
};

const arrowKey = ({ applePanel, snakePanel, key }) => {
  const headItem = getHeadItem(snakePanel);
  const origKey = snakePanel[headItem.row][headItem.column].key;
  const newKey = nextItemIsBlank(snakePanel, key) ? key : origKey;
  const newSnakePanel = snakePanel.map((row, ri) =>
    row.map((cell, ci) =>
      ri === headItem.row && ci === headItem.column
        ? { ...cell, key: newKey }
        : cell,
    ),
  );
  return { applePanel, snakePanel: newSnakePanel };
};

// Key definition

const isPaused = (state) => state.pause === true;

const spaceKey = (state) => ({ ...state, pause: !(state.pause ?? false) });

const keyFnList = [
  { key: LEFT, fn: arrowKey },
  { key: UP, fn: arrowKey },
  { key: RIGHT, fn: arrowKey },
  { key: DOWN, fn: arrowKey },
];

const processKey = ({ applePanel, snakePanel, key }) => {
  const handler = keyFnList.find((item) => item.key === key);
  return handler
    ? handler.fn({ applePanel, snakePanel, key })
    : { applePanel, snakePanel };
};

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

const pressKey = (keyName, state) =>
  keyName === SPACE
    ? spaceKey(state)
    : {
        ...processKey({
          applePanel: state.applePanel,
          snakePanel: state.snakePanel,
          key: keyName,
        }),
        pause: state.pause ?? false,
      };

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
