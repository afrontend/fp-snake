const _ = require("lodash");
const fp = require("lodash/fp");
const p = require("fp-panel");

// Configuration

const GLOBAL = {
  color: "grey",
  appleColor: "red",
  snakeColor: "orange",
  pause: false
};

// Paint

const paintApple = panel =>
  p.paint(
    panel,
    [
      {
        row: _.random(0, panel.length - 1),
        column: _.random(0, panel[0].length - 1)
      }
    ],
    GLOBAL.appleColor
  );

const paintSnake = panel =>
  p.paint(
    panel,
    [
      {
        row: _.random(0, panel.length - 1),
        column: _.random(0, panel[0].length - 1),
        key: 0
      }
    ],
    GLOBAL.snakeColor
  );

// Panel

const createPanel = (() => {
  let savedRows = 0;
  let savedColumns = 0;
  return (rows, columns) => {
    savedRows = rows ? rows : savedRows;
    savedColumns = columns ? columns : savedColumns;
    return p.createPanel(savedRows, savedColumns);
  };
})();

const createApplePanel = (() => {
  let savedRows = 0;
  let savedColumns = 0;
  return (rows, columns) => {
    savedRows = rows ? rows : savedRows;
    savedColumns = columns ? columns : savedColumns;
    return paintApple(createPanel(savedRows, savedColumns));
  };
})();

const createSnakePanel = (() => {
  let savedRows = 0;
  let savedColumns = 0;
  return (rows, columns) => {
    savedRows = rows ? rows : savedRows;
    savedColumns = columns ? columns : savedColumns;
    return paintSnake(createPanel(savedRows, savedColumns));
  };
})();

// For snake

const SPACE = "space";
const LEFT = "left";
const UP = "up";
const RIGHT = "right";
const DOWN = "down";

const matchKey = (akey, bkey) => (akey === bkey ? 1 : 0);

const getNewRowColumn = (headItem, key) => ({
  row: headItem.row - matchKey(key, UP) + matchKey(key, DOWN),
  column: headItem.column - matchKey(key, LEFT) + matchKey(key, RIGHT)
});

const addHeadItem = ary => {
  const snake = _.cloneDeep(ary);
  const headItem = _.cloneDeep(_.head(snake));
  const newHeadItem = _.assign(
    headItem,
    getNewRowColumn(headItem, headItem.key)
  );
  return [newHeadItem, ...snake];
};

const removeTailItem = _.initial;

const reIndexing = ary => {
  return ary.map((item, index) => {
    item.index = index;
    return item;
  });
};

const justPaintSnake = posAry =>
  p.paint(createPanel(), posAry, GLOBAL.snakeColor);

const moveSnake = _.flow([
  _.flattenDepth,
  fp.filter(p.isItem),
  fp.sortBy("index"),
  addHeadItem,
  reIndexing,
  removeTailItem,
  justPaintSnake
]);

const moveSnakeAndAddTail = _.flow([
  _.flattenDepth,
  fp.filter(p.isItem),
  fp.sortBy("index"),
  addHeadItem,
  reIndexing,
  justPaintSnake
]);

const getSnake = _.flow([_.flattenDepth, fp.filter(p.isItem)]);

const addCount = ({ applePanel, snakePanel }) => {
  _.last(_.last(applePanel)).count = getSnake(snakePanel).length;
  return {
    applePanel,
    snakePanel
  };
};

const updatePanel = ({ applePanel, snakePanel }) => {
  const outOfRange = nextItemIsOutOfRange(
    snakePanel,
    getHeadItem(snakePanel).key
  );
  const tempSnakePanel = outOfRange ? snakePanel : moveSnake(snakePanel);
  const overlap = p.isOverlap(applePanel, tempSnakePanel);
  const newApplePanel = overlap ? createApplePanel() : applePanel;
  const newSnakePanel = overlap
    ? moveSnakeAndAddTail(snakePanel)
    : tempSnakePanel;
  return addCount({
    applePanel: newApplePanel,
    snakePanel: newSnakePanel
  });
};

// Check functions

const getHeadItem = _.flow([
  _.cloneDeep,
  _.flattenDepth,
  fp.filter(p.isItem),
  fp.sortBy("index"),
  _.head
]);

const getNextItem = (snakePanel, key) => {
  const headItem = getHeadItem(snakePanel);
  const { row, column } = getNewRowColumn(headItem, key);
  return snakePanel && snakePanel[row] && snakePanel[row][column]
    ? snakePanel[row][column]
    : undefined;
};
const nextItemIsBlank = _.flow([getNextItem, p.isBlankItem]);
const nextItemIsOutOfRange = _.flow([getNextItem, _.isUndefined]);

const arrowKey = ({ applePanel, snakePanel, key }) => {
  const headItem = getHeadItem(snakePanel);
  const origKey = snakePanel[headItem.row][headItem.column].key;
  snakePanel[headItem.row][headItem.column].key = nextItemIsBlank(
    snakePanel,
    key
  )
    ? key
    : origKey;
  return {
    applePanel,
    snakePanel
  };
};

// Key definition

const nop = nop => nop;

const isPaused = () => GLOBAL.pause === true;

const spaceKey = state => {
  GLOBAL.pause = !isPaused();
  return state;
};

const keyFnList = [
  { key: SPACE, fn: spaceKey },
  { key: LEFT, fn: arrowKey },
  { key: UP, fn: arrowKey },
  { key: RIGHT, fn: arrowKey },
  { key: DOWN, fn: arrowKey },
  { key: 0, fn: nop }
];

const isValidKey = key => _.some(keyFnList, item => item.key === key);
const validKey = ({ applePanel, snakePanel, key }) => ({
  applePanel,
  snakePanel,
  key: isValidKey(key) ? key : 0
});

const storeKey = ({ applePanel, snakePanel, key }) =>
  _.find(keyFnList, item => item.key === key).fn({
    applePanel,
    snakePanel,
    key
  });

const processKey = _.flow([validKey, storeKey]);

const init = (rows = 15, columns = 15) => ({
  applePanel: createApplePanel(rows, columns),
  snakePanel: createSnakePanel(rows, columns)
});

const tick = state =>
  isPaused()
    ? state
    : updatePanel({
        applePanel: state.applePanel,
        snakePanel: state.snakePanel
      });

const key = (key, state) =>
  processKey({
    applePanel: state.applePanel,
    snakePanel: state.snakePanel,
    key
  });

const join = state => p.add([state.applePanel, state.snakePanel]);

const toArray = ({ applePanel, snakePanel }) => [
  _.cloneDeep(applePanel),
  _.cloneDeep(snakePanel)
];

module.exports = {
  init,
  tick,
  key,
  join,
  isBlank: p.isBlankItem,
  toArray
};
