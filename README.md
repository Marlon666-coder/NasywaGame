# Nasywa's Magical Love Castle 💗

A romantic **3D pixel-fantasy adventure**: walk a little crowned heroine around a
3D castle at dusk — past the fountain, sakura trees and flower beds — to discover
**8 hidden treasure chests**. Each one holds a gift and a message for Nasywa. Open all
8 to unlock the secret ending. ♡

- 100% static: HTML + CSS + vanilla JavaScript. **No frameworks, no build step, no packages, no backend.**
- Real **3D rendered with WebGL2** — a tiny self-contained engine written from scratch
  (`engine3d.js` + `geometry3d.js`), so there are **no external libraries and nothing to download at runtime**.
- Perspective camera you can orbit & zoom, directional sunlight with **real-time shadows**, dusk fog,
  a volumetric castle with towers, a fountain, and glowing treasure chests.
- All gift art is drawn in code, so no image files can go missing on GitHub Pages.
- Music & sound effects are synthesized live with the Web Audio API (optional MP3 — see `assets/audio/README.md`).
- Progress is saved in `localStorage` and survives a refresh.
- Works on **desktop and phone** (on-screen joystick + button on touch devices) and respects `prefers-reduced-motion`.

## Project structure

```
index.html        → entry point
style.css         → HUD, modals, title screen & animations
engine3d.js       → the WebGL2 engine (math, shaders, lighting, shadow map)
geometry3d.js     → procedural mesh builders (box, cone, cylinder, sphere…)
game3d.js         → the world, player, camera, gifts, audio, saving & ending
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
| Rotate camera | **drag** mouse, or **Q** / **R** | drag with **two fingers** |
| Zoom camera | mouse **wheel** | — |
| Pause menu & treasure map | **Esc** | **RESET** button in the HUD |

Walk up to a chest until the **E** prompt appears, then open it. Chests can be found in any order.

> **Requirement:** the 3D world needs **WebGL2**, which virtually all browsers have supported since 2021.
> On a browser without it, the game shows a friendly message instead of failing silently.

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

```bash
git add .
git commit -m "Update Nasywa's Magical Love Castle"
git push
```

## The 8 treasures

| # | Gift | | # | Gift |
| --- | --- | --- | --- | --- |
| 1 | Enchanted Rose 🌹 | | 5 | Sweet Chocolate 🍫 |
| 2 | Eternal Bouquet 💐 | | 6 | Secret Love Letter 💌 |
| 3 | Promise Ring 💍 | | 7 | A Piece of the Stars ⭐ |
| 4 | Cuddle Bear 🧸 | | 8 | The Heart of Our Kingdom ❤️ |

They are scattered across the courtyard, the castle wings, and behind the keep.

## Customising

Everything you'd normally want to change lives near the top of `game3d.js`:

- `GIFTS` — each gift's name, emoji, romantic message, opening animation, particle colours,
  the 3D glow colour, and the pixel map (`sprite`) shown in the popup.
  Each letter in a sprite is a colour from `PALETTE`; `.` is transparent.
- `CHEST_POS` (inside `World3D`) — the `{x, z}` world positions of the 8 chests.
- `CONFIG.musicFile` — optional path to your own song (keep it relative).
- `CONFIG.endingAutoDelay` — seconds before the ending opens itself after the last gift.

To reshape the castle or garden, edit `buildStatics()` in `game3d.js` (it stacks boxes,
cones, cylinders and spheres). The ending letter text is in `index.html` (`.ending-message`).
