# fp-snake

> Functional snake game library for [fp-snake-game](https://github.com/afrontend/fp-snake-game)

![demo](https://github.com/afrontend/fp-snake/releases/download/demo-assets/demo.gif)

## Quick start

```sh
npx fp-snake
```

Use `--full` to fill the entire terminal window:

```sh
npx fp-snake --full
```

## Run from source

```sh
git clone https://github.com/afrontend/fp-snake.git
cd fp-snake
npm install
npm start
```

## Controls

| Key | Action |
|---|---|
| `←` `↑` `→` `↓` | Move snake |
| `Space` | Pause / Resume |
| `q` | Quit |
| `s` | Save state |
| `l` | Load saved state |

## Library API

Install as a dependency:

```sh
npm install fp-snake
```

```js
const game = require('fp-snake');
```

### `game.init(rows, cols)`

Creates the initial game state. Defaults to `15 × 15`.

```js
let state = game.init(15, 15);
```

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
npm run release
```

`npm run release` 실행 순서:

1. `scripts/autoplay.js` — BFS 기반 AI가 게임을 자동 플레이하고 자동 종료
2. `asciinema rec` — 터미널 출력을 `demo.cast`로 녹화
3. `agg` — `demo.cast` → `demo.gif` 변환
4. `gh release upload` — GitHub Releases `demo-assets` 태그에 업로드
5. `README.md` — GIF URL을 GitHub Releases 경로로 교체

master 브랜치에 푸시하면 `.github/workflows/demo.yml`이 위 과정을 자동으로 실행합니다.

## License

MIT © Bob Hwang
