# Nasywa's Magical Love Castle 💗

A romantic **2.5D pixel-art adventure**: walk a little crowned heroine around a pink
magical castle — through the sakura courtyard, the Great Hall, the Royal Library and the
Romantic Chamber — to discover **8 hidden treasure chests**. Each one holds a gift and a
message for Nasywa. Open all 8 to unlock the secret ending. ♡

- 100% static: HTML + CSS + vanilla JavaScript. No backend, no build step, no packages, no frameworks.
- A tile-based **2.5D world** (top-down with height & depth sorting) you can actually explore — walk,
  bump into walls, pass behind trees and pillars, and step through doors between rooms.
- All pixel art — the castle, heroine, trees, fountain, furniture and every gift — is drawn in code
  (`script.js`), so there are **no image files that can go missing** on GitHub Pages.
- Music & sound effects are synthesized live with the Web Audio API (optional MP3 supported — see `assets/audio/README.md`).
- Progress is saved in `localStorage` and survives a page refresh.
- Responsive for **desktop and phone** (on-screen joystick + button on touch devices) and respects `prefers-reduced-motion`.

## Project structure

```
index.html        → entry point
style.css         → all styling, HUD, modals & animations
script.js         → the 2.5D engine, world maps, pixel art, audio, gifts, ending
assets/
  images/         → favicon.svg
  audio/          → (optional) your own music file
README.md
.nojekyll         → tells GitHub Pages to serve files as-is
```

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move | **WASD** or **Arrow keys** | Virtual **joystick** (bottom-left) |
| Open chest / interact | **E** (or Enter / Space) | Gold **E** button (bottom-right) |
| Pause menu & treasure map | **Esc** | **RESET** button in the HUD |

Walk up to a chest until the **E** prompt appears, then open it. Chests can be found in any order.

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
git add .
git commit -m "Update Nasywa's Magical Love Castle"
git push
```

## The 8 treasures & where to find them

| # | Gift | Where |
| --- | --- | --- |
| 1 | Enchanted Rose 🌹 | Courtyard (north-west) |
| 2 | Eternal Bouquet 💐 | Courtyard (north-east) |
| 3 | Promise Ring 💍 | The Great Hall (center) |
| 4 | Cuddle Bear 🧸 | The Great Hall (lower-left) |
| 5 | Sweet Chocolate 🍫 | The Royal Library (center) |
| 6 | Secret Love Letter 💌 | The Royal Library (corner) |
| 7 | A Piece of the Stars ⭐ | The Romantic Chamber (by the balcony) |
| 8 | The Heart of Our Kingdom ❤️ | The Romantic Chamber (center) |

Reach the Great Hall from the top of the courtyard, the Library from the far-west path, and the
Chamber from the far-east path.

## Customising

Everything you'd normally want to change lives near the top of `script.js`:

- `GIFTS` — each gift's name, emoji, romantic message, opening animation, particle effect and
  pixel map (`sprite`). Each letter in a sprite is a colour from `PALETTE`; `.` is transparent.
- `AREAS` — the room layouts. Each `map` is a grid of characters:
  `#` wall · `W` water · `P` path · `=` bridge · `r` rug · `G`/space floor.
  `objects` places trees, chests, furniture, etc.; `doors` link areas; `spawn` is where you appear.
- `CONFIG.musicFile` — optional path to your own song (keep it relative).
- `CONFIG.endingAutoDelay` — seconds before the ending opens itself after the last gift.
- `CONFIG.tile` — world tile size.

The ending letter text is in `index.html` (`.ending-message`).
