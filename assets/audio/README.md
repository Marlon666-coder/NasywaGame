# Audio

The game does **not** need any file here — the romantic music-box melody and all
sound effects are synthesized live in the browser with the Web Audio API.

Want to use your own song instead?

1. Put an MP3/OGG file in this folder, e.g. `assets/audio/music.mp3`.
2. Open `script.js` and set `musicFile: 'assets/audio/music.mp3'` inside `CONFIG`
   (keep the path **relative**, without a leading `/`).
3. Commit and push. If the file can't be loaded, the game falls back to the built-in melody.
