# fp-snake

> Functional snake game library for [fp-snake-game](https://github.com/afrontend/fp-snake-game)

![demo](https://github.com/afrontend/fp-snake/releases/download/demo-assets/demo.gif)

## Just run

```sh
npx fp-snake
```

Use `--full` to fill the entire terminal window:

```sh
npx fp-snake --full
```

## Run with source

```sh
git clone https://github.com/afrontend/fp-snake.git
cd fp-snake
npm install
npm start
```

### CLI options

| 옵션 | 설명 |
|--------|------|
| `-f, --full` | 터미널 전체 크기로 게임판을 표시한다. |
| `--rows <number>` | 게임판 행 수를 지정한다. |
| `--columns <number>` | 게임판 열 수를 지정한다. |

`--full`과 크기 옵션을 함께 사용하면 `--full`이 우선한다.

## Controls

| 키 | 동작 |
|----|------|
| `←` `↑` `→` `↓` | 뱀 이동 |
| `Space` | 일시정지 / 재개 |
| `h` | 도움말 열기 / 닫기 |
| `s` | 빠른 저장 |
| `l` | 빠른 불러오기 |
| `q` / `Ctrl+C` | 종료 |
| `Ctrl+D` | 복원 가능한 스냅숏 JSON을 출력하고 종료 |

빠른 저장 상태는 현재 실행 중에만 유지된다. 게임은 3초 카운트다운 후 시작한다.

## Library API

Install as a dependency:

```sh
npm install fp-snake
```

```js
const game = require('fp-snake');
```

### `game.init(options)`

초기 상태를 만든다. 기본 크기는 `15×15`이며 기존 위치 인자 호출도 지원한다.

```js
let state = game.init({ rows: 15, columns: 15 });
let legacyState = game.init(15, 15);
```

보드 크기는 1~500으로 보정되고 상태에 `rows`, `columns`가 기록된다.

### `game.tick(state)`

Advances the game by one frame. Returns updated state.

```js
state = game.tick(state);
```

### `game.key(keyName, state)`

Applies a key input. Valid key names: `'left'`, `'right'`, `'up'`, `'down'`, `'space'`.
Returns updated state.

```js
state = game.key('right', state);
```

### `game.join(state)`

Returns a merged 2D array of cells (apple + snake combined), suitable for rendering.

```js
const panel = game.join(state);
panel.forEach(row => {
  console.log(row.map(item => game.isBlank(item) ? '.' : '■').join(' '));
});
```

### `game.isBlank(item)`

Returns `true` if a cell is empty.

### `game.toArray(state)`

Returns `[applePanel, snakePanel]` as separate deep-cloned 2D arrays.

### 공통 상태 API

```js
const length = game.getLength(state);
const interval = game.getTickInterval(state); // 250
const snapshot = game.serializeState(state);
const restored = game.restoreState(snapshot);
```

스냅숏은 `{ game: 'fp-snake', version: 1, state }` 형식의 JSON-safe 객체다. 셀의 `count` 속성은 하위 호환을 위해 남아 있지만 deprecated이며 신규 코드는 `getLength()`를 사용한다.

### Minimal example

```js
const game = require('fp-snake');

let state = game.init(15, 15);

setInterval(() => {
  state = game.tick(state);
  const panel = game.join(state);
  console.clear();
  console.log(panel.map(row =>
    row.map(item => game.isBlank(item) ? '.' : '■').join(' ')
  ).join('\n'));
}, 200);
```

## Demo GIF 업데이트

터미널 동작 미리보기를 자동으로 재생성합니다.

```sh
# 의존 도구 설치 (최초 1회)
brew install asciinema
brew install agg
brew install gh && gh auth login

# 데모 생성 및 GitHub Releases 업로드
npm run demo-gif
```

`npm run demo-gif` 실행 순서:

1. `scripts/autoplay.js` — BFS 기반 AI가 게임을 자동 플레이하고 자동 종료
2. `asciinema rec` — 터미널 출력을 `demo.cast`로 녹화
3. `agg` — `demo.cast` → `demo.gif` 변환
4. `gh release upload` — GitHub Releases `demo-assets` 태그에 업로드
5. `README.md` — GIF URL을 GitHub Releases 경로로 교체

master 브랜치에 푸시하면 `.github/workflows/demo.yml`이 위 과정을 자동으로 실행합니다.

## License

MIT © Bob Hwang
