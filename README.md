# Nasywa's Magical Love Castle 💗

A tiny romantic pixel-art game: a pink magical castle, a sakura garden at dusk,
and **8 mystery treasure chests** — each one holding a gift and a message for Nasywa.
Open all 8 to unlock the secret ending. ♡

- 100% static: HTML + CSS + vanilla JavaScript. No backend, no build step, no packages.
- All pixel art is drawn in code (`script.js`), so there are no image files that can go missing.
- Music & sound effects are synthesized with the Web Audio API (optional MP3 supported, see `assets/audio/README.md`).
- Progress is saved in `localStorage` and survives page refresh.
- Responsive (desktop & phone) and respects `prefers-reduced-motion`.

## Project structure

```
index.html        → entry point
style.css         → all styling & animations
script.js         → game logic, pixel art, audio, fireworks
assets/
  images/         → favicon.svg
  audio/          → (optional) your own music file
README.md
.nojekyll         → tells GitHub Pages to serve files as-is
```

## Run locally

No installation needed — just open `index.html` in a browser (double-click it).

## Deploy to GitHub Pages

1. Upload seluruh file ke repository GitHub (including the hidden `.nojekyll` file).
2. Buka repository → **Settings** → **Pages**.
3. Pada bagian **Build and deployment**, pilih `Deploy from a branch`.
4. Pilih branch `main` dan folder `/(root)`.
5. Klik **Save**.
6. Tunggu proses deployment selesai (biasanya 1–2 menit, lihat tab **Actions**).
7. Buka URL GitHub Pages yang diberikan GitHub, e.g. `https://username.github.io/nama-repository/`.

All paths are relative, so it works with **any repository name**.
To update the site, just edit the files, then commit and push — GitHub redeploys automatically.

Via command line:

```bash
git init
git add .
git commit -m "Nasywa's Magical Love Castle"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

## How to play

1. Click **START OUR ADVENTURE**.
2. Tap any of the 8 chests, in any order.
3. Each chest reveals a gift with its own animation and a message.
4. Find all 8 → the castle glows, fireworks start, and the secret letter appears.
5. **PLAY AGAIN** closes all chests for a new round; **RESET PROGRESS** wipes saved progress and returns to the title.

## Customising

Everything lives at the top of `script.js`:

- `GIFTS` — names, emojis, messages, unique animation and the pixel map (`sprite`) of each gift.
  Each letter in a sprite is a colour from `PALETTE`; `.` is transparent.
- `CONFIG.musicFile` — optional path to your own song.
- `CONFIG.endingAutoDelay` — seconds before the ending opens by itself after the last gift.

The ending letter text is in `index.html` (`.ending-message`).
