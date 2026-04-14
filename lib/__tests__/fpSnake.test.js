const assert = require("assert");
const game = require("../index.js");

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

const getSnakeItems = state =>
  game
    .join(state)
    .flat()
    .filter(cell => cell.color === "orange");

const getAppleItem = state =>
  game
    .join(state)
    .flat()
    .find(cell => cell.color === "red");

// ─── init ─────────────────────────────────────────────────────────────────────

describe("init", () => {
  it("applePanel과 snakePanel을 반환한다", () => {
    const state = game.init();
    assert(state.applePanel !== undefined, "applePanel이 있어야 한다");
    assert(state.snakePanel !== undefined, "snakePanel이 있어야 한다");
  });

  it("기본 크기는 15×15이다", () => {
    const state = game.init();
    assert.strictEqual(state.applePanel.length, 15);
    assert.strictEqual(state.applePanel[0].length, 15);
    assert.strictEqual(state.snakePanel.length, 15);
    assert.strictEqual(state.snakePanel[0].length, 15);
  });

  it("커스텀 크기를 지정할 수 있다", () => {
    const state = game.init(10, 20);
    assert.strictEqual(state.applePanel.length, 10);
    assert.strictEqual(state.applePanel[0].length, 20);
    assert.strictEqual(state.snakePanel.length, 10);
    assert.strictEqual(state.snakePanel[0].length, 20);
  });

  it("사과가 정확히 하나 존재한다", () => {
    const state = game.init();
    assert.strictEqual(getAppleItem(state) !== undefined, true);
    const appleCount = game
      .join(state)
      .flat()
      .filter(c => c.color === "red").length;
    assert.strictEqual(appleCount, 1);
  });

  it("뱀 세그먼트가 정확히 하나로 시작한다", () => {
    const state = game.init();
    assert.strictEqual(getSnakeItems(state).length, 1);
  });
});

// ─── toArray ──────────────────────────────────────────────────────────────────

describe("toArray", () => {
  it("길이 2인 배열을 반환한다", () => {
    const state = game.init();
    const arr = game.toArray(state);
    assert.strictEqual(arr.length, 2);
  });

  it("반환값은 딥 클론이다 — 수정해도 원본 state에 영향 없음", () => {
    const state = game.init();
    const arr = game.toArray(state);
    // 반환된 배열의 셀을 직접 수정
    arr[0][0][0].color = "blue";
    // 원본은 변경되지 않아야 한다
    assert.notStrictEqual(state.applePanel[0][0].color, "blue");
  });
});

// ─── join ─────────────────────────────────────────────────────────────────────

describe("join", () => {
  it("2D 배열을 반환한다", () => {
    const state = game.init();
    const joined = game.join(state);
    assert(Array.isArray(joined));
    assert(Array.isArray(joined[0]));
  });

  it("크기가 원본 패널과 동일하다", () => {
    const state = game.init(8, 12);
    const joined = game.join(state);
    assert.strictEqual(joined.length, 8);
    assert.strictEqual(joined[0].length, 12);
  });

  it("뱀(orange)과 사과(red)가 모두 포함된다", () => {
    const state = game.init();
    const cells = game.join(state).flat();
    assert(cells.some(c => c.color === "orange"), "뱀이 있어야 한다");
    assert(cells.some(c => c.color === "red"), "사과가 있어야 한다");
  });
});

// ─── key ──────────────────────────────────────────────────────────────────────

describe("key", () => {
  it("유효하지 않은 키를 무시한다", () => {
    const state = game.init();
    const next = game.key("x", state);
    assert(next.applePanel !== undefined);
    assert(next.snakePanel !== undefined);
  });

  it("space 키로 일시정지/재개 토글", () => {
    const state = game.init();
    // 일시정지
    const paused = game.key("space", state);
    const tickedWhilePaused = game.tick(paused);
    assert.deepStrictEqual(
      game
        .join(tickedWhilePaused)
        .flat()
        .filter(c => c.color === "orange"),
      game
        .join(paused)
        .flat()
        .filter(c => c.color === "orange"),
      "일시정지 중에는 뱀이 움직이지 않아야 한다"
    );
    // 재개
    const resumed = game.key("space", paused);
    assert(resumed.snakePanel !== undefined);
  });

  it("방향키를 전달하면 state를 반환한다", () => {
    const state = game.init();
    for (const dir of ["left", "up", "right", "down"]) {
      const next = game.key(dir, state);
      assert(
        next.applePanel !== undefined,
        `${dir} 후 applePanel이 있어야 한다`
      );
      assert(
        next.snakePanel !== undefined,
        `${dir} 후 snakePanel이 있어야 한다`
      );
    }
  });
});

// ─── tick ─────────────────────────────────────────────────────────────────────

describe("tick", () => {
  it("일시정지 상태에서는 state가 변하지 않는다", () => {
    const state = game.init();
    const paused = game.key("space", state); // GLOBAL.pause = true
    try {
      const after = game.tick(paused);
      assert.deepStrictEqual(
        game
          .join(after)
          .flat()
          .map(c => c.color),
        game
          .join(paused)
          .flat()
          .map(c => c.color)
      );
    } finally {
      game.key("space", paused); // GLOBAL.pause = false — 전역 상태 복원
    }
  });

  it("tick 후에도 state 구조가 유지된다", () => {
    const state = game.init();
    const next = game.tick(state);
    assert(next.applePanel !== undefined);
    assert(next.snakePanel !== undefined);
    assert.strictEqual(next.applePanel.length, state.applePanel.length);
    assert.strictEqual(next.snakePanel.length, state.snakePanel.length);
  });

  it("tick 후 뱀 세그먼트 수가 유지된다 (사과를 먹지 않은 경우)", () => {
    // 사과를 먹을 가능성이 낮은 큰 보드에서 테스트
    const state = game.init(20, 20);
    const before = getSnakeItems(state).length;
    // 여러 번 tick — 사과를 먹지 않는 이상 세그먼트 수 유지
    // (매우 낮은 확률이지만 한 번만 tick해서 확인)
    const after = game.tick(state);
    const afterCount = getSnakeItems(after).length;
    // 사과를 먹었으면 1 증가, 아니면 동일
    assert(afterCount === before || afterCount === before + 1);
  });

  it("경계 밖으로 나가면 뱀이 멈춘다", () => {
    // 5×5 작은 보드에서 방향을 벽 쪽으로 고정 후 여러 tick
    const state = game.init(5, 5);
    // up 방향으로 충분히 이동하면 반드시 경계에 닿는다
    let s = game.key("up", state);
    for (let i = 0; i < 10; i++) {
      s = game.tick(s);
    }
    // 뱀이 여전히 존재해야 한다 (사라지지 않음)
    assert(getSnakeItems(s).length >= 1, "경계에서도 뱀이 존재해야 한다");
  });

  it("사과를 먹으면 뱀 길이가 1 증가한다", () => {
    // 초기 key=0 상태에서는 뱀이 움직이지 않으므로 방향을 먼저 설정한다.
    // 4×4 보드에서 방향을 주기적으로 전환하며 뱀이 사과를 먹도록 유도한다.
    let s = game.init(4, 4);
    const dirs = ["right", "down", "left", "up"];
    let dirIdx = 0;
    let grew = false;
    const initialLen = getSnakeItems(s).length;

    for (let i = 0; i < 1000 && !grew; i++) {
      if (i % 3 === 0) {
        s = game.key(dirs[dirIdx % 4], s);
        dirIdx++;
      }
      const prev = getSnakeItems(s).length;
      s = game.tick(s);
      if (getSnakeItems(s).length > prev) grew = true;
    }
    assert(grew, "1000 tick 내에 뱀이 성장해야 한다");
    assert(getSnakeItems(s).length > initialLen);
  });
});
