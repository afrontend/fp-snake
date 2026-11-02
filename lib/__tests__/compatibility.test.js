const { runGameContract } = require("fp-panel/testing");
const game = require("../index.js");

// 공통 API(초기화·크기 보정·일시정지·렌더링·스냅숏)는 fp-panel 계약으로 검사한다.
runGameContract(game, { name: "fp-snake" });

describe("fp-snake 고유 API", () => {
  it("길이와 tick 주기를 공식 API로 제공한다", () => {
    const state = game.init();
    expect(game.getLength(state)).toBe(1);
    expect(game.getTickInterval(state)).toBe(250);
  });
});
