const game = require("../index.js");

describe("공통 호환 API", () => {
  it("객체와 위치 인자 초기화를 모두 지원하고 크기를 상태에 기록한다", () => {
    const objectState = game.init({ rows: 6, columns: 7 });
    expect(objectState.rows).toBe(6);
    expect(objectState.columns).toBe(7);
    expect(game.init(8, 9).columns).toBe(9);
  });

  it("크기를 1~500 범위로 보정한다", () => {
    const state = game.init({ rows: 0, columns: 999 });
    expect(state.rows).toBe(1);
    expect(state.columns).toBe(500);
  });

  it("paused와 deprecated pause를 함께 갱신한다", () => {
    const paused = game.key("space", game.init());
    expect(paused.paused).toBe(true);
    expect(paused.pause).toBe(true);
  });

  it("길이와 tick 주기를 공식 API로 제공한다", () => {
    const state = game.init();
    expect(game.getLength(state)).toBe(1);
    expect(game.getTickInterval(state)).toBe(250);
  });

  it("JSON 왕복 가능한 스냅숏을 복원한다", () => {
    const state = game.init({ rows: 8, columns: 9 });
    const snapshot = JSON.parse(JSON.stringify(game.serializeState(state)));
    expect(snapshot.game).toBe("fp-snake");
    expect(snapshot.version).toBe(1);
    expect(game.restoreState(snapshot).snakePanel).toEqual(state.snakePanel);
  });
});
