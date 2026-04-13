# fp-snake
> library for [fp-snake-game](https://github.com/afrontend/fp-snake-game)

![console snake screenshot](https://agvim.files.wordpress.com/2019/03/fp-snake.png "console snake screenshot")

## Just run

```sh
$ npx fp-snake
```

## Run with source

```sh
git clone https://github.com/afrontend/fp-snake.git
cd fp-snake
npm install
npm start
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

1. `scripts/autoplay.js` — 게임을 자동 플레이하고 50회 랜덤 키 입력 후 자동 종료
2. `asciinema rec` — 터미널 출력을 `demo.cast`로 녹화
3. `agg` — `demo.cast` → `demo.gif` 변환
4. `gh release upload` — GitHub Releases `demo-assets` 태그에 업로드
5. `README.md` — GIF URL을 GitHub Releases 경로로 교체 (이미 설정된 경우 스킵)

master 브랜치에 푸시하면 `.github/workflows/demo.yml`이 위 과정을 자동으로 실행합니다.

## License

MIT © Bob Hwang
