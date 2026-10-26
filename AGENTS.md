# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, OpenCode, pi, …) working in this repository.
`CLAUDE.md` only imports this file (`@AGENTS.md`); edit this file, not `CLAUDE.md`.

## What this is

`fp-snake` is a functional Snake game-logic library (published to npm) plus a terminal demo. It sits in the afrontend game stack:

```
fp-panel (npm) → fp-snake (this repo, npm) → fp-snake-game (React web app)
```

Grid primitives come from `fp-panel`; the web app `fp-snake-game` consumes this package from npm. A change here reaches the web app only after publishing and bumping its dependency (or `npm link` locally).

## Commands

```sh
npm test            # ESLint (pretest) then vitest run
npm run test:watch  # vitest in watch mode
npm start           # terminal demo (node ./src/example.js)
npm run demo-gif    # record demo.cast/demo.gif (scripts/make-demo.sh, asciinema + agg)
npx vitest run lib/__tests__/fpSnake.test.js   # single test file
```

ESLint + Prettier are configured in `eslint.config.js`; `pretest` runs ESLint, so lint errors block tests.

## Layout

- `lib/index.js` — the library (CJS, hand-written source, not build output)
- `lib/__tests__/` — vitest tests; `compatibility.test.js` pins the shared API contract
- `src/example.js` — terminal game (chalk + keypress)
- `scripts/autoplay.js`, `scripts/make-demo.sh` — heuristic autoplay for the demo GIF
- `docs/` — notes (e.g. heuristic AI vs ML vs LLM)
- `.github/workflows/demo.yml` — on push to `master`, regenerates the demo GIF

## Architecture

State machine on top of `fp-panel`. All transitions are pure and return a new state object. The state holds named panels (`snakePanel`, `applePanel`, …) composed with `fp-panel` primitives.

Shared API (same shape across fp-tetris / fp-block / fp-snake / fp-space / fp-sokoban):

| Export                                  | Description                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `init({ rows, columns })`               | Initial state; `init(rows, columns)` still accepted for compatibility                                 |
| `tick(state)`                           | Advance one frame                                                                                     |
| `key(keyName, state)`                   | Input: `'left'`, `'right'`, `'up'`, `'down'`, `'space'` (pause); implemented as `pressKey` internally |
| `join(state)`                           | Merge panels into one renderable panel                                                                |
| `toArray`, `isBlank`, `getTickInterval` | Rendering / timing helpers                                                                            |
| `serializeState` / `restoreState`       | Save / load                                                                                           |

Snake-specific: `getLength`.
