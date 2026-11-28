# Pore & Peace · 拔走烦恼

A small, calming blackhead-plucking game. No countdown, login, ads, backend, or paid API. Made for mouse, touch, and keyboard.

**Play:** https://pore-and-peace-james.jamesbonds520.chatgpt.site

## Features

- Drag a pore upward by 64 CSS pixels to pull it out; release early to let it spring back.
- Switch to **轻点解压** for a gentle one-tap, 650 ms extraction.
- Three skin scenes: peach cheek, cream nose, and caramel cheek.
- Organic scattered positions with minimum spacing, varied sizes and angles, stretching plugs, tweezers, pop particles, and synthesized sound.
- Clear 16 pores to finish a round, then start another or enjoy the clean skin.
- Keyboard: Tab to a pore, then Enter or Space. Focus advances after extraction.
- Optional sound toggle; reduced-motion preference respected.
- Lifetime extraction count and sound preference stored locally. A refresh starts a fresh board; totals persist on the same browser and origin.

## Run locally

Requires Python 3; Node.js is optional for the syntax check. No npm install or build step is needed.

```sh
git clone https://github.com/Jameslovecs/pore-and-peace.git
cd pore-and-peace
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. Alternatively run `npm run dev`.

```sh
npm run check
```

## Files

- `dist/index.html`: game screen, controls, and accessible dialogs
- `dist/style.css`: responsive artwork and animations
- `dist/layout.js`: irregular pore placement and appearance generation
- `dist/game.js`: pointer interaction, round state, audio, and local storage
- `dist/icon.svg`: original favicon
- `.openai/hosting.json`: static Sites hosting configuration (contains no credentials)
- `QA.md`: release verification and repeatable manual checks

All illustrations are CSS or original inline SVG. Google Fonts optionally supplies DM Sans and Noto Sans SC, with system fallbacks if blocked. No game data is sent to a server; the hosting provider and font provider receive ordinary web requests. There are no analytics, accounts, cookies, or runtime secrets.

## Deploy / maintain

The public site is hosted with Sites as a static `dist/` deployment. In a Sites-enabled Codex session, open this repo and ask to update the existing site; reuse the `project_id` in `.openai/hosting.json`. Validate, push the exact source state to the configured Sites source repository, save a version with the static archive, then deploy that version. Preserve public access. GitHub is the public source mirror.

For another static host, upload the contents of `dist/`. The app uses relative paths and works at a subpath, including GitHub Pages. No environment variables, API keys, database, or paid services are necessary. Do not commit credentials; `.env*` is ignored.

## Scope

This is a complete small single-player game, not a skin-care simulation. Progress is browser-local, with no cloud sync or leaderboards. Switching scenes or refreshing resets the current board, but not the lifetime counter. Audio and vibration depend on browser support. Mobile layout is tested with a narrow Chrome viewport; real iOS/Android hardware is not part of this release's verification.

## License

MIT. See [LICENSE](LICENSE).
