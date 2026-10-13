/* =========================================================
   Nasywa's Magical Love Castle — 2.5D explorable edition
   Pure vanilla JS. No build step, no dependencies.
   A tile-based 2.5D world (top-down with height & depth
   sorting) you can walk around to find 8 romantic gifts.
   Works offline and on any GitHub Pages URL (relative paths).
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. SETTINGS
     --------------------------------------------------------- */
  var CONFIG = {
    storageKey: 'nasywa-love-castle-v1',
    // Optional: your own song, RELATIVE path e.g. 'assets/audio/music.mp3'.
    // Empty = built-in synthesized music box melody.
    musicFile: '',
    endingAutoDelay: 10, // seconds before ending auto-opens after 8th gift
    tile: 32            // logical tile size in world units
  };

  // Colour keys for every pixel map ('.' = transparent)
  var PALETTE = {
    k: '#3b1f3a', r: '#e8344e', R: '#a01d3a', p: '#ff8fb8', P: '#ffd1e3',
    g: '#5fbf6e', G: '#2e7d4f', y: '#ffd23f', Y: '#c9971c', w: '#ffffff',
    b: '#c47a45', B: '#8a4f2a', l: '#b79cff', L: '#e2d6ff',
    c: '#8a4a2b', C: '#5a2a16', o: '#ffe9c4', e: '#fff0f5'
  };

  /* ---------------------------------------------------------
     2. THE 8 GIFTS  (unchanged — identity preserved)
     --------------------------------------------------------- */
  var GIFTS = [
    { id: 1, name: 'Enchanted Rose', emoji: '🌹', anim: 'anim-bloom',
      fx: { chars: ['♥', '❀', '✿'], colors: ['#e8344e', '#ff8fb8', '#ffd1e3'] },
      message: 'Just like this rose, my love for you will continue to bloom.',
      sprite: ['................','.....kkkkk......','....kRrrrRk.....','...kRrpprrRk....','...krpRRprrk....','...kRrRprRRk....','...kRRrrrRRk....','....kRRRRRk.....','.....kkkkk......','.......kgk......','..kkk..kgk......','.kgggk.kgk.kk...','..kgGGkkgkkggk..','...kkkkgGkGgk...','......kgGkkk....','.......kgk......'] },
    { id: 2, name: 'Eternal Bouquet', emoji: '💐', anim: 'anim-sway',
      fx: { chars: ['✿', '❀', '♥'], colors: ['#ff8fb8', '#b79cff', '#ffd23f'] },
      message: 'If you could see yourself through my eyes, you would understand how special you are to me.',
      sprite: ['..kk..kkk..kk...','.kppkkrrrkkllk..','.kpPpkrRrklLlk..','..kpkkkrkkklk...','.kkyykpPpkkkkk..','kyyYykpppkrrk...','.kyykgkpkkrRrk..','..kkgGkgkkkrk...','...kGgGgGgkk....','....kgGgGgk.....','....kPkkkPk.....','...kPPPyPPPk....','...kPpPyPpPk....','....kPPyPPk.....','.....kPPPk......','......kkk.......'] },
    { id: 3, name: 'Promise Ring', emoji: '💍', anim: 'anim-ring',
      fx: { chars: ['✦', '✧', '♥'], colors: ['#ffd23f', '#ffffff', '#e2d6ff'] },
      message: 'If I had to choose again, I would still choose you.',
      sprite: ['......kkkk......','.....kwLLwk.....','....kLwwwLLk....','.....kLLLLk.....','......kyyk......','....kkyyyykk....','...kyyYkkYyyk...','..kyYk....kYyk..','..kyk......kyk..','..kyk......kyk..','..kyk......kyk..','..kYyk....kyYk..','...kYyykkyyYk...','....kkYYYYkk....','......kkkk......'] },
    { id: 4, name: 'Cuddle Bear', emoji: '🧸', anim: 'anim-bounce',
      fx: { chars: ['♥', '♡', '✿'], colors: ['#ff8fb8', '#e8344e', '#ffe9c4'] },
      message: 'Whenever you need a hug, imagine this little bear giving you one from me.',
      sprite: ['..kkk......kkk..','.kbBbk....kbBbk.','.kBobkkkkkkboBk.','..kbbbbbbbbbbk..','.kbbbbbbbbbbbbk.','.kbbwkbbbbwkbbk.','.kbbkkbbbbkkbbk.','.kbbbboooobbbbk.','.kbpbbokkobbpbk.','..kbbbooobbbbk..','...kkbbbbbbkk...','..kbbkrrrrkbbk..','.kbbbbkrrkbbbbk.','.kobbbbbbbbbbok.','..kkbbkkkkbbkk..','....kk....kk....'] },
    { id: 5, name: 'Sweet Chocolate', emoji: '🍫', anim: 'anim-jelly',
      fx: { chars: ['♥', '✦', '♡'], colors: ['#8a4a2b', '#ff8fb8', '#ffd23f'] },
      message: 'You make my ordinary days sweeter just by being in them.',
      sprite: ['................','..kkkk....kkkk..','.kcccck..kcccck.','kccPPcckkcccccck','kcPcccccccccccck','kcPccccccPcccCck','kcccccccPcPccCck','.kcccccccPccCck.','..kccccccccCck..','...kccccccCck...','....kccccCck....','.....kccCck.....','......kcck......','.......kk.......','................','................'] },
    { id: 6, name: 'Secret Love Letter', emoji: '💌', anim: 'anim-letter',
      fx: { chars: ['♥', '✉', '♡'], colors: ['#e8344e', '#ffffff', '#ff8fb8'] },
      message: 'Dear Nasywa, words will never be enough to explain how much you mean to me.',
      sprite: ['................','................','kkkkkkkkkkkkkkkk','kkeeeeeeeeeeeekk','kekeeeeeeeeeekek','keekeeeeeeeekeek','keeekeeeeeekeeek','keeeekrrrrkeeeek','keeeeekRrkeeeeek','keeeeeekkeeeeeek','keeeeeeeeeeeeeek','kPPeeeeeeeeeePPk','kkkkkkkkkkkkkkkk','................','................','................'] },
    { id: 7, name: 'A Piece of the Stars', emoji: '⭐', anim: 'anim-star',
      fx: { chars: ['★', '✦', '✧'], colors: ['#ffd23f', '#ffffff', '#b79cff'] },
      message: 'Among a million stars, you will always be the light I look for.',
      sprite: ['.......k.......','......kyk......','......kyk......','.....kyyyk.....','kkkkkyywyykkkkk','.kyyyyyyyyyyyk.','..kyykyyykyyk..','...kpyyyyypk...','...kyyyyyyyk...','..kyyyyYyyyyk..','..kyyyYkYyyyk..','.kyyyYk.kYyyyk.','.kyyYk...kYyyk.','kyyYk.....kYyyk','kkkk.......kkkk'] },
    { id: 8, name: 'The Heart of Our Kingdom', emoji: '❤️', anim: 'anim-heart',
      fx: { chars: ['♥', '❤', '✦'], colors: ['#e8344e', '#ff8fb8', '#ffd23f'] },
      message: 'The greatest treasure in this kingdom is the happiness you bring into my life, Nasywa.',
      sprite: ['..kkk...kkk..','.kpPpk.kpplk.','kpPwPpkppplRk','kpPPppppppllk','kppppppppplRk','.kpppppppplk.','..kppppppRk..','...kpppplk...','....kppRk....','.....kRk.....','......k......'] }
  ];

  /* ---------------------------------------------------------
     3. HELPERS
     --------------------------------------------------------- */
  var $ = function (s) { return document.querySelector(s); };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowPower = (navigator.hardwareConcurrency || 4) <= 2;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || coarse;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /** Draw a pixel map onto a canvas, centred in a square if asked. */
  function drawSprite(canvas, rows, square) {
    var w = 0; rows.forEach(function (r) { w = Math.max(w, r.length); });
    var h = rows.length, size = Math.max(w, h);
    var cw = square ? size : w, ch = square ? size : h;
    canvas.width = cw; canvas.height = ch;
    var ctx = canvas.getContext('2d');
    var ox = Math.floor((cw - w) / 2), oy = Math.floor((ch - h) / 2);
    ctx.clearRect(0, 0, cw, ch);
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var col = PALETTE[row[x]];
        if (col) { ctx.fillStyle = col; ctx.fillRect(ox + x, oy + y, 1, 1); }
      }
    });
    return canvas;
  }

  /** Render a pixel map into an offscreen canvas (for use as a world sprite). */
  function spriteCanvas(rows) {
    var c = document.createElement('canvas');
    drawSprite(c, rows, false);
    return c;
  }

  /* ---------------------------------------------------------
     4. PROCEDURAL PIXEL ART (title/ending castle & trees)
     --------------------------------------------------------- */
  function drawCastle(canvas) {
    var ctx = canvas.getContext('2d'); var W = 120, H = 96;
    canvas.width = W; canvas.height = H;
    var C = { ink: '#3b1f3a', wall: '#ffc2dc', wallShade: '#f59cc2', wallLight: '#ffe3ef',
      roof: '#9a7bea', roofLight: '#c3adff', gold: '#ffd23f', win: '#fff1a8', door: '#7a3d6b', heart: '#e8344e', white: '#ffffff' };
    function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
    function box(x, y, w, h, fill, shade) {
      rect(x - 1, y - 1, w + 2, h + 2, C.ink); rect(x, y, w, h, fill);
      if (shade) rect(x + w - 3, y, 3, h, shade);
      for (var by = y + 4; by < y + h - 2; by += 6)
        for (var bx = x + ((by / 6) % 2 ? 3 : 6); bx < x + w - 4; bx += 8) rect(bx, by, 2, 1, C.wallShade);
    }
    function battlements(x, y, w) { for (var bx = x; bx < x + w - 1; bx += 5) { rect(bx - 1, y - 4, 5, 5, C.ink); rect(bx, y - 3, 3, 4, C.wall); } }
    function roof(cx, top, base, half) {
      for (var y = top; y <= base; y++) {
        var hw = Math.round(((y - top) / (base - top)) * half);
        rect(cx - hw - 1, y, hw * 2 + 3, 1, C.ink);
        if (y > top) { rect(cx - hw, y, hw * 2 + 1, 1, C.roof); rect(cx - hw, y, Math.max(1, hw), 1, C.roofLight);
          if ((y - top) % 4 === 0) rect(cx - hw, y, hw * 2 + 1, 1, '#8466d6'); }
      }
      rect(cx - half - 1, base + 1, half * 2 + 3, 1, C.ink);
    }
    function flag(cx, top) { rect(cx, top - 9, 1, 9, C.ink); var hx = cx + 1, hy = top - 9;
      rect(hx, hy, 2, 1, C.heart); rect(hx + 3, hy, 2, 1, C.heart); rect(hx, hy + 1, 5, 1, C.heart); rect(hx + 1, hy + 2, 3, 1, C.heart); rect(hx + 2, hy + 3, 1, 1, C.heart); }
    function win(x, y, w, h) { rect(x - 1, y - 1, w + 2, h + 2, C.ink); rect(x, y, w, h, C.win);
      rect(x, y, 1, 1, C.ink); rect(x + w - 1, y, 1, 1, C.ink); rect(x + Math.floor(w / 2), y + 1, 1, h - 1, '#ffd88a'); }
    ctx.clearRect(0, 0, W, H);
    box(14, 34, 18, 60, C.wall, C.wallShade); box(88, 34, 18, 60, C.wall, C.wallShade);
    battlements(14, 34, 18); battlements(88, 34, 18); roof(23, 10, 30, 11); roof(97, 10, 30, 11); flag(23, 10); flag(97, 10);
    box(32, 46, 56, 48, C.wall, C.wallShade); battlements(32, 46, 56);
    box(47, 24, 26, 22, C.wallLight, C.wall); roof(60, 2, 21, 15); flag(60, 2);
    rect(55, 29, 4, 2, C.heart); rect(61, 29, 4, 2, C.heart); rect(54, 31, 12, 2, C.heart); rect(56, 33, 8, 2, C.heart); rect(58, 35, 4, 2, C.heart); rect(56, 29, 1, 1, C.white);
    win(20, 44, 6, 9); win(94, 44, 6, 9); win(20, 64, 6, 9); win(94, 64, 6, 9); win(39, 56, 6, 9); win(75, 56, 6, 9);
    rect(50, 69, 20, 25, C.ink); rect(51, 71, 18, 23, C.door); rect(52, 70, 16, 1, C.ink);
    for (var gx = 54; gx < 68; gx += 4) rect(gx, 72, 1, 22, '#5c2a52');
    rect(51, 69, 2, 2, C.ink); rect(67, 69, 2, 2, C.ink); rect(59, 80, 2, 2, C.gold);
    rect(32, 92, 56, 2, C.gold); rect(14, 92, 18, 2, C.gold); rect(88, 92, 18, 2, C.gold);
    rect(48, 94, 24, 2, C.ink); rect(49, 94, 22, 1, '#d9b3c7');
  }

  /* ---------------------------------------------------------
     5. WORLD SPRITE FACTORY — pixel objects used in the world.
        Each returns a canvas with an "anchor": the number of
        pixels from the bottom that sits on the ground tile
        (so taller objects rise up for the 2.5D look).
     --------------------------------------------------------- */
  var Sprites = {};
  function makeSprite(key, rows, groundRows) {
    var c = spriteCanvas(rows);
    Sprites[key] = { canvas: c, w: c.width, h: c.height, ground: groundRows || 2 };
  }

  // Sakura tree (tall, casts long shadow)
  makeSprite('tree', [
    '......kkkk......','....kkPPPPkk....','..kkPpppppPkk..','.kPpppPppppPk.','kPppPpppPpppPk','kpppppPpppppPk','kPppppppPppppk','.kpppPppppppk.','.kPppppppPpk.','..kkPpppppkk..','....kkbbkk....','......kbbk.....','......kBbk.....','......kBbk.....','.....kkbbkk....'], 2);

  // Pine/hedge bush (short)
  makeSprite('bush', [
    '...kkkk...','..kgGGgk..','.kgGggGgk.','kgGgggGggk','kgggGgggGk','.kGgggggk.','..kgGGgk..','...kkkk...'], 2);

  // Flower cluster (very short, decorative, non-blocking handled in map)
  makeSprite('flower', ['.k.k.','rpypr','.ggg.','..g..'], 1);

  // Fountain (round, water, blocks)
  makeSprite('fountain', [
    '..kkkkkkkk..','.kLLLLLLLLk.','kLlwwwwwwlLk','kLw l l l wLk','kLwwwwwwwwLk','kLlwllllwllk','kLLLLLLLLLLk','.kkLLLLLLkk.','..kkkkkkkk..'].map(function (r) { return r.replace(/ /g, 'l'); }), 2);

  // Wall segment (stone, pink) — tall, blocks
  makeSprite('wall', [
    'kkkkkkkk','kPPpPPpk','kpPPpPpk','kPpPPppk','kpPpPpPk','kPPpPpPk','kBBBBBBk','kkkkkkkk'], 2);

  // Wooden door (on walls, walkable transition)
  makeSprite('door', [
    'kkkkkkkk','kBbbbbBk','kbyyyybk','kby  ybk','kby  ybk','kbyoy ybk','kbbbbbbk'].map(function (r) { return r.replace(/ /g, 'b'); }), 2);

  // Pillar (interior)
  makeSprite('pillar', ['kLLLk','kLwLk','kLLLk','.kkk.','kLwLk','kLwLk','kLwLk','.kLk.','kLwLk','kkkkk'], 2);

  // Bookshelf (library) — tall, blocks
  makeSprite('shelf', [
    'kkkkkkkkkk','kBrgylrgBk','kBBBBBBBBk','kBglyrglBk','kBBBBBBBBk','kBrlygrlBk','kBBBBBBBBk','kBylrgylBk','kkkkkkkkkk'], 2);

  // Bed (romantic room) — blocks
  makeSprite('bed', [
    '.kkkkkkkkkk.','kPPwwPPwwPPk','kppppppppppk','kBpppppppppk','kBBBBBBBBBBk','.k........k.','.k........k.'].map(function (r) { return r.replace(/ /g, 'e'); }), 2);

  // Rug / carpet handled by tiles. Candle (small light)
  makeSprite('candle', ['.y.','kyk','.k.','.b.','kbk'], 1);

  // Chest — closed & open frames (base + lid), 16x16
  makeSprite('chestClosed', [
    '................',
    '..kkkkkkkkkkkk..',
    '.kbBbbbbbbbbBbk.',
    '.kbbbbbbbbbbbbk.',
    '.kyyyyyyyyyyyyk.',
    '.kBBbbbbbbbbBBk.',
    '.kbbbbrrrrbbbbk.',
    '.kybbbrRRrbbbyk.',
    '.kybbbbRRbbbbyk.',
    '.kBbbbbkkbbbbBk.',
    '.kyyyyyyyyyyyyk.',
    '.kbbybbbbbbybbk.',
    '.kBBybbbbbbyBBk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................'], 2);
  makeSprite('chestOpen', [
    '..kk........kk..',
    '.kyk........kyk.',
    '.kykkkkkkkkkkyk.',
    '.kyyyyyyyyyyyyk.',
    '.kBBBBBBBBBBBBk.',
    '................',
    '.kyyyyyyyyyyyyk.',
    '.kbooooooooobbk.',
    '.kyoyyyyyyyyobk.',
    '.kBooyyyyyyoyBk.',
    '.kyyyyyyyyyyyyk.',
    '.kbbybbbbbbybbk.',
    '.kBBybbbbbbyBBk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................'], 2);

  // Bridge plank (over water) — walkable, drawn as tile
  // Sign post
  makeSprite('sign', ['.kkkkk.','kPwwwPk','kPwwwPk','kkkkkkk','..kk...','..bb...','..bb...'], 2);

  /* ---------------------------------------------------------
     6. PLAYER SPRITE — 4 directions x 2 walk frames, drawn
        procedurally so the little heroine has walk + idle.
     --------------------------------------------------------- */
  function buildPlayerFrames() {
    // 14x18 heroine: pink dress, brown hair, little gold crown.
    // Frames differ by leg/arm offset to make a walk cycle.
    function frame(legL, legR, armSwing) {
      var c = document.createElement('canvas');
      c.width = 14; c.height = 18;
      var x = c.getContext('2d');
      function r(px, py, w, h, col) { x.fillStyle = col; x.fillRect(px, py, w, h); }
      // crown
      r(4, 0, 6, 1, '#3b1f3a'); r(4, 0, 1, 1, '#ffd23f'); r(6, 0, 1, 1, '#ffd23f'); r(8, 0, 1, 1, '#ffd23f');
      r(4, 1, 6, 1, '#ffd23f'); r(6, 1, 2, 1, '#e8344e');
      // hair top
      r(3, 2, 8, 2, '#7a4a2e'); r(3, 2, 8, 1, '#5c3620');
      // face
      r(4, 4, 6, 4, '#ffe0c4'); r(3, 4, 1, 5, '#7a4a2e'); r(10, 4, 1, 5, '#7a4a2e');
      r(5, 5, 1, 1, '#3b1f3a'); r(8, 5, 1, 1, '#3b1f3a'); // eyes
      r(6, 6, 2, 1, '#ff8fb8'); // cheeks/mouth
      // hair sides
      r(3, 8, 1, 2, '#5c3620'); r(10, 8, 1, 2, '#5c3620');
      // body / dress
      r(4, 8, 6, 2, '#ffe0c4'); // neck/shoulders skin bit
      r(3, 9, 8, 1, '#3b1f3a');
      r(3, 10, 8, 4, '#ff8fb8'); r(3, 10, 8, 1, '#ffd1e3'); r(3, 13, 8, 1, '#e8507f');
      r(2, 14, 10, 2, '#ff8fb8'); r(2, 15, 10, 1, '#e8507f'); // skirt flare
      // arms (swing)
      r(2 + armSwing, 10, 1, 3, '#ffe0c4');
      r(11 - armSwing, 10, 1, 3, '#ffe0c4');
      // legs
      r(4 + legL, 16, 2, 2, '#f0c4a0'); r(8 + legR, 16, 2, 2, '#f0c4a0');
      r(4 + legL, 17, 2, 1, '#3b1f3a'); r(8 + legR, 17, 2, 1, '#3b1f3a');
      return c;
    }
    // Facing is faked (top-down): we flip for left/right using hair offset. Keep it simple:
    return {
      idle: frame(0, 0, 0),
      walkA: frame(-1, 1, 1),
      walkB: frame(1, -1, 0)
    };
  }
  var PLAYER = buildPlayerFrames();

  /* ---------------------------------------------------------
     7. SAVE DATA
     --------------------------------------------------------- */
  var state = { opened: [], muted: false, completions: 0 };
  function loadState() {
    try {
      var raw = window.localStorage.getItem(CONFIG.storageKey); if (!raw) return;
      var d = JSON.parse(raw), valid = {};
      (Array.isArray(d.opened) ? d.opened : []).forEach(function (id) { id = Number(id); if (id >= 1 && id <= GIFTS.length) valid[id] = true; });
      state.opened = Object.keys(valid).map(Number);
      state.muted = !!d.muted; state.completions = Number(d.completions) || 0;
    } catch (e) {}
  }
  function saveState() { try { window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {} }
  function isOpened(id) { return state.opened.indexOf(id) !== -1; }
  function allFound() { return state.opened.length >= GIFTS.length; }

  /* ---------------------------------------------------------
     8. AUDIO — Web Audio synth (unchanged behaviour)
     --------------------------------------------------------- */
  var Sound = (function () {
    var ctx = null, master = null, musicBus = null, timer = null, nextTime = 0, step = 0, playing = false, fileAudio = null;
    function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function init() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { ctx = new AC(); master = ctx.createGain(); master.gain.value = state.muted ? 0 : 0.8; master.connect(ctx.destination);
        musicBus = ctx.createGain(); musicBus.gain.value = 0.32; musicBus.connect(master); return true;
      } catch (e) { ctx = null; return false; }
    }
    function tone(freq, start, dur, type, vol, dest) {
      if (!ctx) return; var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(vol || 0.2, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur); o.connect(g); g.connect(dest || master);
      o.start(start); o.stop(start + dur + 0.05);
    }
    var CHORDS = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
    var ARP = [0, 1, 2, 3, 2, 1, 2, 1];
    var MELODY = [76, 0, 79, 0, 76, 74, 72, 0, 72, 0, 76, 0, 81, 0, 79, 0, 77, 0, 81, 0, 79, 77, 76, 0, 74, 0, 79, 0, 77, 76, 74, 0];
    var STEP = 60 / 80 / 2;
    function schedule() {
      while (nextTime < ctx.currentTime + 0.15) {
        var bar = Math.floor(step / 8) % 4, i = step % 8, chord = CHORDS[bar];
        tone(midi(chord[ARP[i]]), nextTime, 0.9, 'sine', 0.12, musicBus);
        if (i === 0) tone(midi(chord[0] - 12), nextTime, 1.6, 'triangle', 0.14, musicBus);
        var m = MELODY[step % 32];
        if (m) { tone(midi(m), nextTime, 0.7, 'triangle', 0.1, musicBus); tone(midi(m + 12), nextTime, 0.4, 'sine', 0.025, musicBus); }
        nextTime += STEP; step++;
      }
    }
    function startMusic() {
      if (playing || state.muted) return;
      if (CONFIG.musicFile) {
        try {
          if (!fileAudio) { fileAudio = new Audio(CONFIG.musicFile); fileAudio.loop = true; fileAudio.volume = 0.5;
            fileAudio.addEventListener('error', function () { CONFIG.musicFile = ''; fileAudio = null; playing = false; startMusic(); }); }
          var p = fileAudio.play(); if (p && p.catch) p.catch(function () {}); playing = true; return;
        } catch (e) { CONFIG.musicFile = ''; }
      }
      if (!init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      nextTime = ctx.currentTime + 0.1; playing = true; timer = setInterval(schedule, 40);
    }
    function stopMusic() { playing = false; if (timer) { clearInterval(timer); timer = null; } if (fileAudio) fileAudio.pause(); }
    function setMuted(m) { if (ctx && master) master.gain.setValueAtTime(m ? 0 : 0.8, ctx.currentTime); if (m) stopMusic(); else startMusic(); }
    function sfx(name) {
      if (state.muted || !init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var t = ctx.currentTime + 0.01, notes, i;
      switch (name) {
        case 'click': tone(988, t, 0.08, 'square', 0.05); break;
        case 'step': tone(rand(140, 180), t, 0.05, 'square', 0.015); break;
        case 'creak': var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
          o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(110, t + 0.4);
          g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5); break;
        case 'open': notes = [72, 76, 79, 84]; for (i = 0; i < notes.length; i++) tone(midi(notes[i]), t + i * 0.07, 0.5, 'square', 0.05); break;
        case 'found': notes = [79, 84, 88, 91, 96]; for (i = 0; i < notes.length; i++) tone(midi(notes[i]), t + i * 0.09, 0.8, 'triangle', 0.12); break;
        case 'door': tone(midi(60), t, 0.12, 'square', 0.05); tone(midi(67), t + 0.08, 0.3, 'sine', 0.06); break;
        case 'final': [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach(function (ch, k) {
            ch.forEach(function (n) { tone(midi(n), t + k * 0.35, k === 3 ? 2.2 : 0.5, 'triangle', 0.09); }); }); break;
        case 'pop': tone(rand(500, 900), t, 0.18, 'square', 0.025); break;
      }
    }
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) { if (ctx.suspend) ctx.suspend(); if (fileAudio) fileAudio.pause(); }
      else if (!state.muted) { if (ctx.resume) ctx.resume(); if (fileAudio && playing) fileAudio.play().catch(function () {}); }
    });
    return { startMusic: startMusic, setMuted: setMuted, sfx: sfx };
  })();

  /* ---------------------------------------------------------
     9. VISUAL FX (DOM particles + fireworks)
     --------------------------------------------------------- */
  var fxLayer = $('#fx');
  function burst(x, y, opts) {
    if (reducedMotion) return;
    var count = Math.round((opts.count || 18) * (lowPower ? 0.5 : 1));
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span'); s.className = 'particle'; s.textContent = pick(opts.chars);
      var ang = Math.random() * Math.PI * 2, dist = rand(60, opts.spread || 160);
      s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = pick(opts.colors);
      s.style.fontSize = Math.round(rand(14, 28)) + 'px';
      s.style.setProperty('--x', Math.cos(ang) * dist + 'px'); s.style.setProperty('--y', Math.sin(ang) * dist - 40 + 'px');
      s.style.setProperty('--r', rand(-180, 180) + 'deg'); s.style.setProperty('--d', rand(0.9, 1.6) + 's');
      s.addEventListener('animationend', removeSelf); fxLayer.appendChild(s);
    }
  }
  function rising(chars, colors) {
    if (reducedMotion) return;
    var s = document.createElement('span'); s.className = 'particle rise'; s.textContent = pick(chars);
    s.style.left = rand(0, 100) + 'vw'; s.style.top = '102vh'; s.style.color = pick(colors);
    s.style.fontSize = Math.round(rand(14, 30)) + 'px';
    s.style.setProperty('--x', rand(-60, 60) + 'px'); s.style.setProperty('--r', rand(-90, 90) + 'deg'); s.style.setProperty('--d', rand(4, 7) + 's');
    s.addEventListener('animationend', removeSelf); fxLayer.appendChild(s);
  }
  function removeSelf() { if (this.parentNode) this.parentNode.removeChild(this); }
  function flash() { if (reducedMotion) return; var f = document.createElement('div'); f.className = 'flash'; f.addEventListener('animationend', removeSelf); document.body.appendChild(f); }

  var Fireworks = (function () {
    var canvas = $('#fireworks'), ctx = canvas.getContext('2d');
    var SCALE = 4, parts = [], rockets = [], raf = null, last = 0, spawnT = 0;
    var COLORS = ['#ff8fb8', '#ffd1e3', '#ffd23f', '#b79cff', '#ffffff', '#e8344e'];
    function resize() { canvas.width = Math.max(1, Math.floor(window.innerWidth / SCALE)); canvas.height = Math.max(1, Math.floor(window.innerHeight / SCALE)); }
    function launch() { rockets.push({ x: rand(canvas.width * 0.15, canvas.width * 0.85), y: canvas.height, vy: -rand(55, 75), target: rand(canvas.height * 0.12, canvas.height * 0.45), color: pick(COLORS) }); }
    function explode(r) {
      var n = lowPower ? 22 : 40, heart = Math.random() < 0.4;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, sp, vx, vy;
        if (heart) { vx = 16 * Math.pow(Math.sin(a), 3); vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); sp = 1.6; }
        else { vx = Math.cos(a); vy = Math.sin(a); sp = rand(14, 30); }
        parts.push({ x: r.x, y: r.y, vx: vx * sp, vy: vy * sp, life: 1, color: i % 3 ? r.color : pick(COLORS) });
      }
      Sound.sfx('pop');
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; spawnT -= dt;
      if (spawnT <= 0) { launch(); spawnT = rand(0.5, 1.1); }
      ctx.fillStyle = 'rgba(26, 15, 46, 0.35)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (var i = rockets.length - 1; i >= 0; i--) { var r = rockets[i]; r.y += r.vy * dt; ctx.fillStyle = '#fff1a8'; ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 2); if (r.y <= r.target) { explode(r); rockets.splice(i, 1); } }
      for (var j = parts.length - 1; j >= 0; j--) { var p = parts[j]; p.vy += 18 * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.6;
        if (p.life <= 0) { parts.splice(j, 1); continue; } ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(frame);
    }
    function start() { resize(); parts = []; rockets = []; if (reducedMotion) return; last = performance.now(); spawnT = 0; if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    window.addEventListener('resize', function () { if (raf) resize(); });
    return { start: start, stop: stop };
  })();

  /* ---------------------------------------------------------
     10. SKY SCENERY (title screen flourishes)
     --------------------------------------------------------- */
  function buildScenery() {
    var stars = $('#stars'), i, el, n = lowPower ? 25 : 45;
    for (i = 0; i < n; i++) { el = document.createElement('div'); el.className = 'star' + (Math.random() < 0.15 ? ' big' : ''); el.style.left = rand(0, 100) + '%'; el.style.top = rand(0, 45) + '%'; el.style.animationDelay = rand(0, 3) + 's'; stars.appendChild(el); }
    var ff = $('#fireflies');
    for (i = 0; i < (lowPower ? 6 : 12); i++) { el = document.createElement('div'); el.className = 'firefly'; el.style.left = rand(3, 97) + '%'; el.style.top = rand(40, 92) + '%'; el.style.animationDelay = -rand(0, 6) + 's, ' + -rand(0, 2) + 's'; el.style.animationDuration = rand(5, 9) + 's, ' + rand(1.5, 3) + 's'; ff.appendChild(el); }
    var petals = $('#petals');
    for (i = 0; i < (lowPower ? 8 : 16); i++) { el = document.createElement('div'); el.className = 'petal'; el.style.left = rand(-5, 95) + '%'; el.style.animationDuration = rand(9, 16) + 's'; el.style.animationDelay = -rand(0, 16) + 's'; petals.appendChild(el); }
    var fc = ['#ff8fb8', '#ffffff', '#b79cff', '#ffd1e3', '#e8344e'];
    document.querySelectorAll('.flowers').forEach(function (box) {
      var c = Number(box.getAttribute('data-count')) || 20;
      for (var k = 0; k < c; k++) { var f = document.createElement('div'); f.className = 'flower'; f.style.left = rand(2, 98) + '%'; f.style.top = rand(6, 90) + '%'; f.style.setProperty('--c', pick(fc)); box.appendChild(f); }
    });
    drawCastle($('#castle-title')); drawCastle($('#castle-ending'));
  }

  /* =========================================================
     11. THE 2.5D WORLD
     ---------------------------------------------------------
     Areas are tile grids. Legend per char:
       ' ' outdoor grass path      '.'  indoor floor
       '#'  wall (blocks, tall)     'G'  grass decoration tile
       'P'  stone path tile         'W'  water (blocks)
       '='  bridge (walkable over water)
       'r'  rug/carpet tile (indoor accent)
     Objects & doors are placed separately with (col,row).
     ========================================================= */
  var T = CONFIG.tile;

  // Door links: from area -> to area at a target tile, with spawn facing.
  function door(toArea, col, row, label) { return { toArea: toArea, col: col, row: row, label: label }; }

  var AREAS = {
    courtyard: {
      name: 'Castle Courtyard',
      floor: 'grass',
      // 18 x 13 grid. Central plaza with fountain, paths ring around it.
      // Door tiles sit on the path so you simply walk onto them.
      map: [
        '##################',
        '#GG   PPPP   GG  #',
        '#G   PP  PP   G  #',
        '#    P    P      #',
        '#  GGP    PGG    #',
        '#    P    P      #',
        '#WWW PP  PP  WWW #',
        '#W=W  PPPP   W=W #',
        '#WWW  PPPP   WWW #',
        '#    PPPPPP      #',
        '#GG  P    P  GG  #',
        '#PPPPP    PPPPPPP#',
        '##################'
      ],
      objects: [
        { s: 'tree', col: 2, row: 2 }, { s: 'tree', col: 15, row: 2 },
        { s: 'tree', col: 2, row: 10 }, { s: 'tree', col: 15, row: 10 },
        { s: 'bush', col: 6, row: 1 }, { s: 'bush', col: 11, row: 1 },
        { s: 'fountain', col: 7, row: 3, w: 2 },
        { s: 'sign', col: 3, row: 11, deco: true },
        { s: 'flower', col: 4, row: 7, deco: true }, { s: 'flower', col: 13, row: 7, deco: true },
        { s: 'flower', col: 3, row: 5, deco: true }, { s: 'flower', col: 14, row: 5, deco: true },
        { s: 'chest', col: 4, row: 2, gift: 1 },
        { s: 'chest', col: 13, row: 2, gift: 2 }
      ],
      // Walk onto these path tiles to travel.
      doors: {
        '1,11': door('library', 10, 9, 'the Library'),     // far west path
        '16,11': door('bedroom', 2, 9, 'the Bedroom'),      // far east path
        '8,1': door('hall', 8, 10, 'the Great Hall'),       // north plaza top
        '9,1': door('hall', 8, 10, 'the Great Hall')
      },
      spawn: { col: 8, row: 9 }
    },

    hall: {
      name: 'The Great Hall',
      floor: 'indoor',
      map: [
        '##################',
        '#................#',
        '#..rrrrrrrrrrrr..#',
        '#..r........r...r#',
        '#..r.rrrrrr.r...r#',
        '#..r.rrrrrr.r...r#',
        '#..rrrrrrrrrrrr..#',
        '#................#',
        '#................#',
        '#................#',
        '#.......PP.......#',
        '##################'
      ],
      objects: [
        { s: 'pillar', col: 2, row: 3 }, { s: 'pillar', col: 15, row: 3 },
        { s: 'pillar', col: 2, row: 6 }, { s: 'pillar', col: 15, row: 6 },
        { s: 'candle', col: 1, row: 1, deco: true }, { s: 'candle', col: 16, row: 1, deco: true },
        { s: 'chest', col: 8, row: 4, gift: 3 },
        { s: 'chest', col: 5, row: 8, gift: 4 }
      ],
      doors: { '7,10': door('courtyard', 8, 2, 'the Courtyard'), '8,10': door('courtyard', 8, 2, 'the Courtyard'), '9,10': door('courtyard', 8, 2, 'the Courtyard') },
      spawn: { col: 8, row: 9 }
    },

    library: {
      name: 'The Royal Library',
      floor: 'indoor',
      map: [
        '##################',
        '#................#',
        '#................#',
        '#.##.##.##.##.##.#',
        '#.rr.rr.rr.rr.rr.#',
        '#................#',
        '#.##.##....##.##.#',
        '#.rr.rr....rr.rr.#',
        '#................#',
        '#................#',
        '#.......PP.......#',
        '##################'
      ],
      objects: [
        { s: 'shelf', col: 2, row: 3 }, { s: 'shelf', col: 5, row: 3 }, { s: 'shelf', col: 8, row: 3 }, { s: 'shelf', col: 11, row: 3 }, { s: 'shelf', col: 14, row: 3 },
        { s: 'shelf', col: 2, row: 6 }, { s: 'shelf', col: 5, row: 6 }, { s: 'shelf', col: 11, row: 6 }, { s: 'shelf', col: 14, row: 6 },
        { s: 'candle', col: 1, row: 1, deco: true }, { s: 'candle', col: 16, row: 1, deco: true },
        { s: 'chest', col: 8, row: 7, gift: 5 },
        { s: 'chest', col: 2, row: 1, gift: 6 }
      ],
      doors: { '7,10': door('courtyard', 2, 9, 'the Courtyard'), '8,10': door('courtyard', 2, 9, 'the Courtyard'), '9,10': door('courtyard', 2, 9, 'the Courtyard') },
      spawn: { col: 8, row: 9 }
    },

    bedroom: {
      name: 'The Romantic Chamber',
      floor: 'indoor',
      map: [
        '##################',
        '#................#',
        '#..rrrrrr........#',
        '#..rrrrrr........#',
        '#..rrrrrr...GG...#',
        '#...........GG...#',
        '#................#',
        '#................#',
        '#....GG....GG....#',
        '#................#',
        '#.......PP.......#',
        '##################'
      ],
      objects: [
        { s: 'bed', col: 3, row: 2, w: 2 },
        { s: 'candle', col: 1, row: 1, deco: true }, { s: 'candle', col: 16, row: 1, deco: true },
        { s: 'bush', col: 5, row: 8, deco: true }, { s: 'bush', col: 11, row: 8, deco: true },
        { s: 'chest', col: 13, row: 3, gift: 7 },
        { s: 'chest', col: 8, row: 6, gift: 8 }
      ],
      doors: { '7,10': door('courtyard', 13, 9, 'the Courtyard'), '8,10': door('courtyard', 13, 9, 'the Courtyard'), '9,10': door('courtyard', 13, 9, 'the Courtyard') },
      spawn: { col: 8, row: 9 }
    }
  };

  // Build runtime area data: solid grid + object list with resolved sprites.
  function buildArea(key) {
    var a = AREAS[key];
    if (a._built) return a;
    var rows = a.map, cols = rows[0].length, rowsN = rows.length;
    a.cols = cols; a.rows = rowsN;
    a.solid = [];
    a.tiles = [];
    for (var y = 0; y < rowsN; y++) {
      a.solid[y] = []; a.tiles[y] = [];
      for (var x = 0; x < cols; x++) {
        var ch = rows[y][x];
        a.tiles[y][x] = ch;
        a.solid[y][x] = (ch === '#' || ch === 'W');
      }
    }
    // Objects: compute footprint & whether they block.
    a.objs = [];
    a.objects.forEach(function (o) {
      var sp = Sprites[o.s === 'chest' ? 'chestClosed' : o.s];
      var footW = o.w || 1;
      var blocks = !o.deco && o.s !== 'flower' && o.s !== 'candle' && o.s !== 'door';
      if (o.s === 'chest') blocks = true;
      var obj = {
        type: o.s, gift: o.gift || null, deco: !!o.deco,
        col: o.col, row: o.row, footW: footW, blocks: blocks,
        // world pixel position (centre-bottom anchored)
        wx: o.col * T, wy: o.row * T
      };
      a.objs.push(obj);
      if (blocks) {
        for (var fx = 0; fx < footW; fx++) {
          var cx = o.col + fx, cy = o.row;
          if (a.solid[cy] && cx < cols) a.solid[cy][cx] = true;
        }
      }
    });
    a._built = true;
    return a;
  }

  /* ---------------------------------------------------------
     12. WORLD ENGINE
     --------------------------------------------------------- */
  var World = (function () {
    var canvas = $('#world'), ctx = canvas.getContext('2d');
    var VIEW = 1; // CSS pixels per device, set on resize
    var dpr = 1;
    var zoom = 2; // world->screen scale (set dynamically)
    var area = null, areaKey = null;
    var cam = { x: 0, y: 0 };
    var player = { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, animT: 0, frame: 0, flip: false, w: 14, h: 18 };
    var keys = {}, joy = { x: 0, y: 0, active: false };
    var raf = null, lastT = 0, running = false, stepT = 0;
    var nearObj = null;
    var transitioning = false;
    var petalPhase = 0;
    var prompt = $('#prompt'), banner = $('#area-banner');

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      VIEW = { w: w, h: h };
      // choose zoom so ~ 10-12 tiles are visible on the smaller dimension
      var tilesWanted = Math.min(w, h) < 520 ? 7.5 : 10;
      zoom = Math.max(2, Math.round((Math.min(w, h) / (tilesWanted * T)) * 2) / 2);
      ctx.imageSmoothingEnabled = false;
    }

    function setArea(key, spawnCol, spawnRow) {
      area = buildArea(key); areaKey = key;
      var sc = (spawnCol != null) ? spawnCol : area.spawn.col;
      var sr = (spawnRow != null) ? spawnRow : area.spawn.row;
      player.x = sc * T + T / 2; player.y = sr * T + T / 2;
      cam.x = player.x; cam.y = player.y;
      refreshChestObjs();
      showBanner(area.name);
    }

    function refreshChestObjs() {
      // sync chest open/closed sprite with save state
      Object.keys(AREAS).forEach(function (k) {
        if (!AREAS[k]._built) return;
        AREAS[k].objs.forEach(function (o) { if (o.gift) o.open = isOpened(o.gift); });
      });
    }

    function showBanner(txt) {
      banner.textContent = '♡ ' + txt + ' ♡';
      banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');
    }

    // Collision: can the player's feet box be at (nx, ny)?
    function canStand(nx, ny) {
      var halfW = 6, feet = 2; // small feet box near bottom
      var pts = [[nx - halfW, ny - feet], [nx + halfW, ny - feet], [nx - halfW, ny], [nx + halfW, ny]];
      for (var i = 0; i < pts.length; i++) {
        var cx = Math.floor(pts[i][0] / T), cy = Math.floor(pts[i][1] / T);
        if (cx < 0 || cy < 0 || cx >= area.cols || cy >= area.rows) return false;
        if (area.solid[cy][cx]) return false;
      }
      return true;
    }

    function tileAtPlayer() {
      var cx = Math.floor(player.x / T), cy = Math.floor(player.y / T);
      return { cx: cx, cy: cy, ch: (area.tiles[cy] && area.tiles[cy][cx]) || ' ' };
    }

    function checkDoor() {
      var p = tileAtPlayer();
      var dkey = p.cx + ',' + p.cy;
      var d = area.doors[dkey];
      if (d && !transitioning) {
        enterArea(d);
      }
    }

    function enterArea(d) {
      transitioning = true;
      Sound.sfx('door');
      var fade = document.createElement('div'); fade.className = 'area-fade'; fade.style.opacity = '0';
      fade.style.transition = reducedMotion ? 'none' : 'opacity .28s linear';
      document.body.appendChild(fade);
      requestAnimationFrame(function () { fade.style.opacity = '1'; });
      setTimeout(function () {
        setArea(d.toArea, d.col, d.row);
        fade.style.opacity = '0';
        setTimeout(function () { if (fade.parentNode) fade.parentNode.removeChild(fade); transitioning = false; }, reducedMotion ? 0 : 300);
      }, reducedMotion ? 0 : 290);
    }

    function findNearChest() {
      var best = null, bd = 9999;
      for (var i = 0; i < area.objs.length; i++) {
        var o = area.objs[i]; if (!o.gift) continue;
        var ox = o.wx + (o.footW * T) / 2, oy = o.wy + T / 2;
        var dx = ox - player.x, dy = oy - player.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < T * 1.1 && d < bd) { bd = d; best = o; }
      }
      return best;
    }

    function update(dt) {
      if (modalOpen()) { player.moving = false; return; }
      var mx = 0, my = 0;
      if (keys.up) my -= 1; if (keys.down) my += 1;
      if (keys.left) mx -= 1; if (keys.right) mx += 1;
      if (joy.active) { mx += joy.x; my += joy.y; }
      var len = Math.sqrt(mx * mx + my * my);
      if (len > 1) { mx /= len; my /= len; }
      player.moving = len > 0.08;

      if (player.moving) {
        if (Math.abs(mx) > Math.abs(my)) { player.dir = mx < 0 ? 'left' : 'right'; player.flip = mx < 0; }
        else { player.dir = my < 0 ? 'up' : 'down'; }
        var speed = 92; // world px/sec
        var nx = player.x + mx * speed * dt;
        var ny = player.y + my * speed * dt;
        // axis-separated movement for smooth sliding along walls
        if (canStand(nx, player.y)) player.x = nx;
        if (canStand(player.x, ny)) player.y = ny;
        // walk animation + footstep sfx
        player.animT += dt;
        if (player.animT > 0.18) { player.animT = 0; player.frame ^= 1; }
        stepT += dt; if (stepT > 0.3) { stepT = 0; Sound.sfx('step'); }
        checkDoor();
      } else { player.frame = 0; player.animT = 0; }

      // camera follow (clamped to area bounds)
      var worldW = area.cols * T, worldH = area.rows * T;
      var viewW = VIEW.w / zoom, viewH = VIEW.h / zoom;
      var tx = clamp(player.x, viewW / 2, Math.max(viewW / 2, worldW - viewW / 2));
      var ty = clamp(player.y, viewH / 2, Math.max(viewH / 2, worldH - viewH / 2));
      if (worldW < viewW) tx = worldW / 2;
      if (worldH < viewH) ty = worldH / 2;
      var k = reducedMotion ? 1 : clamp(dt * 8, 0, 1);
      cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;

      // interaction prompt
      nearObj = findNearChest();
      updatePrompt();

      petalPhase += dt;
    }

    function updatePrompt() {
      if (nearObj && !modalOpen()) {
        var ox = nearObj.wx + (nearObj.footW * T) / 2, oy = nearObj.wy;
        var sx = (ox - cam.x) * zoom + VIEW.w / 2;
        var sy = (oy - cam.y) * zoom + VIEW.h / 2 - 6;
        prompt.style.left = sx + 'px'; prompt.style.top = sy + 'px';
        prompt.querySelector('.prompt-text').textContent = nearObj.open ? 'Read again' : 'Open';
        prompt.classList.remove('hidden');
        if (els.btnInteract) els.btnInteract.classList.add('pulsing');
      } else {
        prompt.classList.add('hidden');
        if (els.btnInteract) els.btnInteract.classList.remove('pulsing');
      }
    }

    function interact() {
      if (modalOpen() || transitioning) return;
      if (nearObj && nearObj.gift) {
        var gift = GIFTS[nearObj.gift - 1];
        openChest(nearObj, gift);
      }
    }

    /* ---- RENDERING ---- */
    function floorColors(kind) {
      return kind === 'indoor'
        ? { a: '#5a3a6e', b: '#6b4680', line: '#4a2f5c', accent: '#7d5290' }
        : { a: '#6cc07a', b: '#5fb56e', line: '#4f9e63', accent: '#8ad694' };
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, VIEW.w, VIEW.h);

      var fc = floorColors(area.floor);
      // background wash
      ctx.fillStyle = area.floor === 'indoor' ? '#3a2350' : '#4f9e63';
      ctx.fillRect(0, 0, VIEW.w, VIEW.h);

      var ox = VIEW.w / 2 - cam.x * zoom;
      var oy = VIEW.h / 2 - cam.y * zoom;
      function sx(wx) { return Math.round(ox + wx * zoom); }
      function sy(wy) { return Math.round(oy + wy * zoom); }

      // visible tile range
      var c0 = Math.max(0, Math.floor((cam.x - VIEW.w / 2 / zoom) / T) - 1);
      var c1 = Math.min(area.cols - 1, Math.ceil((cam.x + VIEW.w / 2 / zoom) / T) + 1);
      var r0 = Math.max(0, Math.floor((cam.y - VIEW.h / 2 / zoom) / T) - 1);
      var r1 = Math.min(area.rows - 1, Math.ceil((cam.y + VIEW.h / 2 / zoom) / T) + 1);

      // --- ground tiles ---
      for (var y = r0; y <= r1; y++) {
        for (var x = c0; x <= c1; x++) {
          var ch = area.tiles[y][x];
          var px = sx(x * T), py = sy(y * T), ts = Math.ceil(T * zoom);
          var base = ((x + y) % 2 === 0) ? fc.a : fc.b;
          if (ch === 'W') { drawWater(px, py, ts); continue; }
          ctx.fillStyle = base; ctx.fillRect(px, py, ts, ts);
          if (ch === 'P' || ch === '=') { // path / bridge
            ctx.fillStyle = ch === '=' ? '#b07a44' : '#d9b38a';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = ch === '=' ? '#8a5c30' : '#c49a6c';
            ctx.fillRect(px, py + ts - Math.max(2, zoom), ts, Math.max(2, zoom));
          } else if (ch === 'r') { // rug
            ctx.fillStyle = '#c23b63'; ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
            ctx.fillStyle = '#e8507f'; ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
          } else if (ch === 'G') { // lush grass accent
            ctx.fillStyle = fc.accent; ctx.fillRect(px + 2, py + 2, 2, 2); ctx.fillRect(px + ts - 5, py + ts - 6, 2, 2);
          }
          // subtle grid line
          ctx.fillStyle = fc.line; ctx.globalAlpha = 0.25; ctx.fillRect(px, py, ts, 1); ctx.fillRect(px, py, 1, ts); ctx.globalAlpha = 1;
        }
      }

      // --- walls as raised blocks (drawn with height for 2.5D) ---
      var wallH = Math.round(14 * zoom / 2);
      for (var wy = r0; wy <= r1; wy++) {
        for (var wx = c0; wx <= c1; wx++) {
          if (area.tiles[wy][wx] !== '#') continue;
          var px2 = sx(wx * T), py2 = sy(wy * T), ts2 = Math.ceil(T * zoom);
          // only raise if the tile below is NOT a wall (front-facing)
          var below = area.tiles[wy + 1] && area.tiles[wy + 1][wx];
          drawWall(px2, py2, ts2, wallH, below !== '#');
        }
      }

      // --- depth-sorted entities (objects + player) ---
      var ents = [];
      for (var oi = 0; oi < area.objs.length; oi++) {
        var o = area.objs[oi];
        var baseY = o.wy + T; // bottom of its tile
        ents.push({ sortY: baseY, kind: 'obj', ref: o });
      }
      ents.push({ sortY: player.y, kind: 'player' });
      ents.sort(function (p, q) { return p.sortY - q.sortY; });

      for (var ei = 0; ei < ents.length; ei++) {
        if (ents[ei].kind === 'player') drawPlayer(sx, sy);
        else drawObject(ents[ei].ref, sx, sy);
      }

      // --- indoor vignette for cozy warmth ---
      if (area.floor === 'indoor') {
        var g = ctx.createRadialGradient(VIEW.w / 2, VIEW.h / 2, Math.min(VIEW.w, VIEW.h) * 0.25, VIEW.w / 2, VIEW.h / 2, Math.max(VIEW.w, VIEW.h) * 0.7);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,8,30,0.5)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
      }

      // floating petals over outdoor areas
      if (area.floor !== 'indoor' && !reducedMotion) drawWorldPetals();
    }

    function drawWater(px, py, ts) {
      ctx.fillStyle = '#4aa3d6'; ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#6cc0e8';
      var w = (Math.sin(petalPhase * 2 + (px + py) * 0.05) * 0.5 + 0.5);
      ctx.fillRect(px + 2, py + 4 + Math.round(w * 2), ts - 8, 2);
      ctx.fillStyle = '#bfe6f7'; ctx.fillRect(px + ts - 8, py + ts - 8 - Math.round(w * 2), 3, 2);
    }

    function drawWall(px, py, ts, h, front) {
      // top face
      ctx.fillStyle = '#f2b9d4'; ctx.fillRect(px, py - h, ts, ts);
      ctx.fillStyle = '#ffd1e3'; ctx.fillRect(px, py - h, ts, Math.max(2, zoom));
      // brick specks on top
      ctx.fillStyle = '#e59bc0'; ctx.fillRect(px + 4, py - h + 6, 3, 2); ctx.fillRect(px + ts - 9, py - h + 12, 3, 2);
      // front face (height)
      if (front) {
        ctx.fillStyle = '#c77aa0'; ctx.fillRect(px, py, ts, h);
        ctx.fillStyle = '#a85e86'; ctx.fillRect(px, py + h - Math.max(2, zoom), ts, Math.max(2, zoom));
        ctx.fillStyle = '#d98fb4'; ctx.fillRect(px + 3, py + 3, 4, 3); ctx.fillRect(px + ts - 10, py + h / 2, 4, 3);
        ctx.fillStyle = '#8a4f74'; ctx.fillRect(px, py, 1, h); // left edge
      }
      ctx.fillStyle = '#3b1f3a'; ctx.fillRect(px, py - h, 1, h + ts); // outline
    }

    function drawShadow(cx, cy, w) {
      ctx.fillStyle = 'rgba(40,15,45,0.28)';
      var sw = w * zoom, sh = Math.max(3, 4 * zoom / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, sw / 2, sh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawObject(o, sx, sy) {
      var spKey = o.type === 'chest' ? (o.open ? 'chestOpen' : 'chestClosed') : o.type;
      var sp = Sprites[spKey]; if (!sp) return;
      var footCx = o.wx + (o.footW * T) / 2;
      var baseY = o.wy + T; // sits on bottom of its tile
      // keep natural sprite proportion but fit width to footprint
      var targetW = o.footW * T * (o.type === 'chest' ? 0.72 : 0.92);
      var s = (targetW / sp.w) * zoom;
      var w = sp.w * s, hgt = sp.h * s;
      var cx = sx(footCx), by = sy(baseY);

      if (!o.deco) drawShadow(cx, by - 2, Math.max(10, sp.w * 0.7));
      // chest sparkle when opened
      if (o.open) {
        ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(petalPhase * 4);
        ctx.fillStyle = '#fff6a0';
        ctx.beginPath(); ctx.ellipse(cx, by - hgt * 0.5, w * 0.5, hgt * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(sp.canvas, Math.round(cx - w / 2), Math.round(by - hgt), Math.round(w), Math.round(hgt));

      // chest number tag
      if (o.gift) {
        var tagS = Math.max(8, Math.round(5 * zoom / 2));
        ctx.fillStyle = o.open ? '#ffd23f' : '#fff8fc';
        var tw = tagS + 4;
        ctx.fillRect(Math.round(cx - tw / 2), Math.round(by - hgt - tagS - 4), tw, tagS + 2);
        ctx.fillStyle = '#3b1f3a'; ctx.strokeStyle = '#3b1f3a';
        ctx.font = 'bold ' + tagS + 'px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(o.gift), Math.round(cx), Math.round(by - hgt - tagS / 2 - 3));
      }
    }

    function drawPlayer(sx, sy) {
      var frames = PLAYER;
      var img = player.moving ? (player.frame ? frames.walkA : frames.walkB) : frames.idle;
      var s = (T * 0.78 / img.width) * zoom; // fit to tile-ish
      var w = img.width * s, hgt = img.height * s;
      var cx = sx(player.x), by = sy(player.y + 4);
      drawShadow(cx, by - 2, 10);
      // little hop while walking
      var hop = player.moving && !reducedMotion ? Math.abs(Math.sin(player.animT / 0.18 * Math.PI)) * 2 * zoom / 2 : 0;
      ctx.save();
      if (player.flip && player.dir === 'left') {
        ctx.translate(cx, 0); ctx.scale(-1, 1);
        ctx.drawImage(img, Math.round(-w / 2), Math.round(by - hgt - hop), Math.round(w), Math.round(hgt));
      } else {
        ctx.drawImage(img, Math.round(cx - w / 2), Math.round(by - hgt - hop), Math.round(w), Math.round(hgt));
      }
      ctx.restore();
    }

    var worldPetals = null;
    function drawWorldPetals() {
      if (!worldPetals) {
        worldPetals = [];
        var n = lowPower ? 6 : 12;
        for (var i = 0; i < n; i++) worldPetals.push({ x: rand(0, VIEW.w), y: rand(0, VIEW.h), s: rand(0.4, 1), sp: rand(14, 34) });
      }
      ctx.fillStyle = '#ffd1e3';
      for (var j = 0; j < worldPetals.length; j++) {
        var p = worldPetals[j];
        p.y += p.sp * 0.016; p.x += Math.sin(petalPhase + j) * 0.4;
        if (p.y > VIEW.h) { p.y = -6; p.x = rand(0, VIEW.w); }
        var sz = Math.max(2, Math.round(3 * zoom / 2 * p.s));
        ctx.globalAlpha = 0.8; ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz - 1); ctx.globalAlpha = 1;
      }
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now;
      update(dt); draw();
      raf = requestAnimationFrame(loop);
    }

    function start(spawnKey) {
      resize();
      if (!area) setArea(spawnKey || 'courtyard');
      running = true; lastT = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    function resetToStart() { worldPetals = null; setArea('courtyard'); }

    // input setters
    function setKey(name, v) { keys[name] = v; }
    function setJoy(x, y, active) { joy.x = x; joy.y = y; joy.active = active; }

    window.addEventListener('resize', function () { if (running) { resize(); } });

    return {
      start: start, stop: stop, resize: resize, setArea: setArea,
      setKey: setKey, setJoy: setJoy, interact: interact,
      refreshChestObjs: refreshChestObjs, resetToStart: resetToStart,
      isRunning: function () { return running; }
    };
  })();

  /* ---------------------------------------------------------
     13. GIFT MODAL / PROGRESS / ENDING / MENU
     --------------------------------------------------------- */
  var els = {
    title: $('#screen-title'), game: $('#screen-game'),
    progressText: $('#progress-text'), progressBar: $('#progress-bar'), progressFill: $('#progress-fill'),
    modal: $('#gift-modal'), giftCanvas: $('#gift-canvas'), giftNumber: $('#gift-number'),
    giftName: $('#gift-name'), giftMessage: $('#gift-message'), giftClose: $('#btn-gift-close'),
    ending: $('#ending'), treasureRow: $('#treasure-row'), btnEnding: $('#btn-ending'),
    btnSound: $('#btn-sound'), hint: $('#title-hint'), live: $('#live'),
    menu: $('#menu'), menuProgress: $('#menu-progress'), menuMap: $('#menu-map'),
    btnInteract: $('#btn-interact'), touch: $('#touch-controls')
  };
  var busy = false, typeTimer = null, endingTimer = null, risingTimer = null, pendingEnding = false;

  function modalOpen() { return !els.modal.hidden || !els.ending.hidden || !els.menu.hidden; }

  function showScreen(name) {
    els.title.classList.toggle('active', name === 'title');
    els.game.classList.toggle('active', name === 'game');
  }

  function updateProgress() {
    var n = state.opened.length;
    els.progressText.textContent = n + '/' + GIFTS.length + ' Gifts Discovered';
    els.progressFill.style.width = (n / GIFTS.length * 100) + '%';
    els.progressBar.setAttribute('aria-valuenow', n);
    els.btnEnding.classList.toggle('hidden', !allFound());
  }

  function openChest(obj, gift) {
    if (busy) return;
    if (obj.open || isOpened(gift.id)) { openGiftModal(gift, false); return; }
    busy = true;
    Sound.sfx('creak');
    // mark open visually right away
    obj.open = true;
    setTimeout(function () {
      if (!isOpened(gift.id)) state.opened.push(gift.id);
      saveState(); updateProgress(); World.refreshChestObjs();
      Sound.sfx('open');
      busy = false;
      openGiftModal(gift, allFound());
    }, reducedMotion ? 0 : 420);
  }

  function openGiftModal(gift, isFinal) {
    pendingEnding = isFinal;
    els.modal.classList.toggle('final', isFinal);
    els.giftNumber.textContent = isFinal ? '✨ The final treasure #' + gift.id + ' ✨' : 'Treasure #' + gift.id;
    els.giftName.textContent = gift.name + ' ' + gift.emoji;
    els.giftClose.textContent = isFinal ? 'SEE THE MAGIC ✨' : 'CONTINUE ♡';
    drawSprite(els.giftCanvas, gift.sprite, true);
    els.giftCanvas.className = 'gift-sprite pixel'; void els.giftCanvas.offsetWidth; els.giftCanvas.classList.add(gift.anim);
    els.modal.hidden = false; els.giftClose.focus();
    typeMessage(gift.message);
    els.live.textContent = gift.name + '. ' + gift.message;
    Sound.sfx(isFinal ? 'final' : 'found');
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 80;
    setTimeout(function () { burst(cx, cy, { chars: gift.fx.chars, colors: gift.fx.colors, count: isFinal ? 40 : 22, spread: isFinal ? 280 : 180 }); }, 250);
    if (isFinal) {
      flash();
      setTimeout(function () { burst(cx, cy, { chars: ['♥', '★', '✦'], colors: ['#ffd23f', '#ff8fb8', '#b79cff'], count: 36, spread: 320 }); }, 900);
      clearTimeout(endingTimer); endingTimer = setTimeout(closeGiftModal, CONFIG.endingAutoDelay * 1000);
    }
  }

  function typeMessage(text) {
    clearInterval(typeTimer); var el = els.giftMessage;
    if (reducedMotion) { el.textContent = '“' + text + '”'; return; }
    var full = '“' + text + '”', i = 0; el.textContent = '';
    typeTimer = setInterval(function () { i++; el.textContent = full.slice(0, i); if (i >= full.length) clearInterval(typeTimer); }, 28);
  }

  function closeGiftModal() {
    if (els.modal.hidden) return;
    clearInterval(typeTimer); clearTimeout(endingTimer);
    els.modal.hidden = true; Sound.sfx('click');
    if (pendingEnding) { pendingEnding = false; showEnding(); }
  }

  function showEnding() {
    els.treasureRow.innerHTML = '';
    GIFTS.forEach(function (g) { var c = document.createElement('canvas'); c.className = 'pixel'; c.title = g.name; drawSprite(c, g.sprite, true); els.treasureRow.appendChild(c); });
    els.ending.hidden = false; els.ending.querySelector('.ending-content').scrollTop = 0;
    $('#btn-play-again').focus();
    Fireworks.start(); Sound.sfx('final');
    clearInterval(risingTimer);
    if (!reducedMotion) risingTimer = setInterval(function () { rising(['♥', '★', '♡', '✦'], ['#ff8fb8', '#ffd23f', '#ffffff', '#b79cff']); }, lowPower ? 700 : 350);
  }
  function hideEnding() { els.ending.hidden = true; Fireworks.stop(); clearInterval(risingTimer); fxLayer.innerHTML = ''; }

  function openMenu() {
    buildMenuMap();
    els.menuProgress.textContent = state.opened.length + '/' + GIFTS.length + ' treasures found';
    els.menu.hidden = false; $('#btn-resume').focus(); Sound.sfx('click');
  }
  function closeMenu() { els.menu.hidden = true; Sound.sfx('click'); }

  function buildMenuMap() {
    els.menuMap.innerHTML = '';
    GIFTS.forEach(function (g) {
      var slot = document.createElement('div');
      var open = isOpened(g.id);
      slot.className = 'slot' + (open ? '' : ' locked');
      var c = document.createElement('canvas'); c.className = 'pixel';
      // question-mark pixel map for undiscovered gifts
      var LOCKED = ['..kkkkk..', '.kyyyyyk.', 'kyk...kyk', 'kk....kyk', '.....kyk.', '....kyk..', '....kk...', '....ky...', '....kk...'];
      drawSprite(c, open ? g.sprite : LOCKED, true);
      slot.appendChild(c);
      var label = document.createElement('span');
      label.textContent = open ? g.name : '# ' + g.id + ' ???';
      slot.appendChild(label);
      els.menuMap.appendChild(slot);
    });
  }

  function playAgain() {
    Sound.sfx('click'); state.completions += 1; state.opened = []; saveState();
    hideEnding(); updateProgress(); World.resetToStart(); showScreen('game');
  }
  function resetProgress() {
    if (!window.confirm('Reset all progress? Every chest will be closed again.')) return;
    Sound.sfx('click'); state.opened = []; state.completions = 0; saveState();
    hideEnding(); els.modal.hidden = true; els.menu.hidden = true; pendingEnding = false;
    updateProgress(); World.resetToStart(); showScreen('title'); World.stop();
  }
  function updateSoundButton() {
    els.btnSound.classList.toggle('muted', state.muted);
    els.btnSound.setAttribute('aria-label', state.muted ? 'Unmute music' : 'Mute music');
    els.btnSound.setAttribute('aria-pressed', String(state.muted));
  }

  /* ---------------------------------------------------------
     14. INPUT WIRING
     --------------------------------------------------------- */
  var KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
  };
  function wireKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!els.modal.hidden) { closeGiftModal(); return; }
        if (!els.menu.hidden) { closeMenu(); return; }
        if (els.game.classList.contains('active')) { openMenu(); return; }
      }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') && els.game.classList.contains('active') && !modalOpen()) {
        e.preventDefault(); World.interact(); return;
      }
      var m = KEYMAP[e.key];
      if (m) { World.setKey(m, true); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1) e.preventDefault(); }
    });
    document.addEventListener('keyup', function (e) { var m = KEYMAP[e.key]; if (m) World.setKey(m, false); });
    window.addEventListener('blur', function () { ['up', 'down', 'left', 'right'].forEach(function (k) { World.setKey(k, false); }); });
  }

  function touchLayoutWanted() {
    return isTouch || Math.min(window.innerWidth, window.innerHeight) < 640;
  }
  function updateTouchVisibility() {
    var want = touchLayoutWanted();
    els.touch.classList.toggle('on', want);
    els.touch.setAttribute('aria-hidden', want ? 'false' : 'true');
  }
  function wireTouch() {
    updateTouchVisibility();
    window.addEventListener('resize', updateTouchVisibility);
    var joyEl = $('#joystick'), knob = $('#joystick-knob');
    var active = false, cxp = 0, cyp = 0, R = 50, touchId = null;
    function start(e) {
      var t = e.changedTouches ? e.changedTouches[0] : e;
      var rect = joyEl.getBoundingClientRect();
      cxp = rect.left + rect.width / 2; cyp = rect.top + rect.height / 2;
      active = true; touchId = e.changedTouches ? t.identifier : 'mouse';
      move(e); e.preventDefault();
    }
    function move(e) {
      if (!active) return;
      var t = null;
      if (e.changedTouches) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === touchId) t = e.changedTouches[i]; if (!t) return; }
      else t = e;
      var dx = t.clientX - cxp, dy = t.clientY - cyp;
      var d = Math.sqrt(dx * dx + dy * dy); if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      World.setJoy(dx / R, dy / R, true);
      e.preventDefault();
    }
    function end(e) { active = false; touchId = null; knob.style.transform = ''; World.setJoy(0, 0, false); }
    joyEl.addEventListener('touchstart', start, { passive: false });
    joyEl.addEventListener('touchmove', move, { passive: false });
    joyEl.addEventListener('touchend', end); joyEl.addEventListener('touchcancel', end);
    // mouse fallback for testing
    joyEl.addEventListener('mousedown', start); window.addEventListener('mousemove', function (e) { if (active) move(e); }); window.addEventListener('mouseup', end);

    function tap(e) { e.preventDefault(); World.interact(); }
    els.btnInteract.addEventListener('touchstart', tap, { passive: false });
    els.btnInteract.addEventListener('click', function (e) { e.preventDefault(); World.interact(); });
  }

  /* ---------------------------------------------------------
     15. INIT
     --------------------------------------------------------- */
  function startGame() {
    Sound.startMusic();
    Sound.sfx('open');
    showScreen('game');
    World.start('courtyard');
  }

  function init() {
    loadState();
    buildScenery();
    updateProgress();
    updateSoundButton();

    // title hint
    var n = state.opened.length;
    els.hint.textContent = n === 0 ? '' : (allFound() ? 'All 8 treasures found ♡ explore again anytime' : 'Welcome back! ' + n + '/8 treasures already found');

    $('#btn-start').addEventListener('click', startGame);
    els.giftClose.addEventListener('click', closeGiftModal);
    els.modal.addEventListener('click', function (e) { if (e.target === els.modal) closeGiftModal(); });
    els.btnEnding.addEventListener('click', function () { Sound.sfx('click'); showEnding(); });
    $('#btn-play-again').addEventListener('click', playAgain);
    $('#btn-reset').addEventListener('click', resetProgress);
    $('#btn-reset-hud').addEventListener('click', openMenu);
    $('#btn-resume').addEventListener('click', closeMenu);
    $('#btn-menu-reset').addEventListener('click', resetProgress);
    els.menu.addEventListener('click', function (e) { if (e.target === els.menu) closeMenu(); });
    els.btnSound.addEventListener('click', function () {
      state.muted = !state.muted; saveState(); updateSoundButton(); Sound.setMuted(state.muted); Sound.sfx('click');
    });

    wireKeyboard();
    wireTouch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
