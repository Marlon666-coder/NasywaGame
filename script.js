/* =========================================================
   Nasywa's Magical Love Castle — game logic
   Pure vanilla JS. No build step, no dependencies.
   All art is drawn from the pixel maps below, so the game
   works offline and on any GitHub Pages URL.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. SETTINGS — edit these to customise the game
     --------------------------------------------------------- */
  var CONFIG = {
    storageKey: 'nasywa-love-castle-v1',
    // Optional: put your own song in assets/audio/ and write its
    // RELATIVE path here, e.g. 'assets/audio/music.mp3'.
    // Leave empty to use the built-in synthesized music box melody.
    musicFile: '',
    // Seconds before the ending opens by itself after the 8th gift.
    endingAutoDelay: 10
  };

  // Colour keys used by every pixel map below ('.' = transparent)
  var PALETTE = {
    k: '#3b1f3a', // outline
    r: '#e8344e', R: '#a01d3a', // reds
    p: '#ff8fb8', P: '#ffd1e3', // pinks
    g: '#5fbf6e', G: '#2e7d4f', // greens
    y: '#ffd23f', Y: '#c9971c', // golds
    w: '#ffffff',
    b: '#c47a45', B: '#8a4f2a', // wood / bear
    l: '#b79cff', L: '#e2d6ff', // lavenders
    c: '#8a4a2b', C: '#5a2a16', // chocolate
    o: '#ffe9c4', // cream
    e: '#fff0f5'  // paper
  };

  /* ---------------------------------------------------------
     2. THE 8 GIFTS
     --------------------------------------------------------- */
  var GIFTS = [
    {
      id: 1, name: 'Enchanted Rose', emoji: '🌹', anim: 'anim-bloom',
      fx: { chars: ['♥', '❀', '✿'], colors: ['#e8344e', '#ff8fb8', '#ffd1e3'] },
      message: 'Just like this rose, my love for you will continue to bloom.',
      sprite: [
        '................',
        '.....kkkkk......',
        '....kRrrrRk.....',
        '...kRrpprrRk....',
        '...krpRRprrk....',
        '...kRrRprRRk....',
        '...kRRrrrRRk....',
        '....kRRRRRk.....',
        '.....kkkkk......',
        '.......kgk......',
        '..kkk..kgk......',
        '.kgggk.kgk.kk...',
        '..kgGGkkgkkggk..',
        '...kkkkgGkGgk...',
        '......kgGkkk....',
        '.......kgk......'
      ]
    },
    {
      id: 2, name: 'Eternal Bouquet', emoji: '💐', anim: 'anim-sway',
      fx: { chars: ['✿', '❀', '♥'], colors: ['#ff8fb8', '#b79cff', '#ffd23f'] },
      message: 'If you could see yourself through my eyes, you would understand how special you are to me.',
      sprite: [
        '..kk..kkk..kk...',
        '.kppkkrrrkkllk..',
        '.kpPpkrRrklLlk..',
        '..kpkkkrkkklk...',
        '.kkyykpPpkkkkk..',
        'kyyYykpppkrrk...',
        '.kyykgkpkkrRrk..',
        '..kkgGkgkkkrk...',
        '...kGgGgGgkk....',
        '....kgGgGgk.....',
        '....kPkkkPk.....',
        '...kPPPyPPPk....',
        '...kPpPyPpPk....',
        '....kPPyPPk.....',
        '.....kPPPk......',
        '......kkk.......'
      ]
    },
    {
      id: 3, name: 'Promise Ring', emoji: '💍', anim: 'anim-ring',
      fx: { chars: ['✦', '✧', '♥'], colors: ['#ffd23f', '#ffffff', '#e2d6ff'] },
      message: 'If I had to choose again, I would still choose you.',
      sprite: [
        '......kkkk......',
        '.....kwLLwk.....',
        '....kLwwwLLk....',
        '.....kLLLLk.....',
        '......kyyk......',
        '....kkyyyykk....',
        '...kyyYkkYyyk...',
        '..kyYk....kYyk..',
        '..kyk......kyk..',
        '..kyk......kyk..',
        '..kyk......kyk..',
        '..kYyk....kyYk..',
        '...kYyykkyyYk...',
        '....kkYYYYkk....',
        '......kkkk......'
      ]
    },
    {
      id: 4, name: 'Cuddle Bear', emoji: '🧸', anim: 'anim-bounce',
      fx: { chars: ['♥', '♡', '✿'], colors: ['#ff8fb8', '#e8344e', '#ffe9c4'] },
      message: 'Whenever you need a hug, imagine this little bear giving you one from me.',
      sprite: [
        '..kkk......kkk..',
        '.kbBbk....kbBbk.',
        '.kBobkkkkkkboBk.',
        '..kbbbbbbbbbbk..',
        '.kbbbbbbbbbbbbk.',
        '.kbbwkbbbbwkbbk.',
        '.kbbkkbbbbkkbbk.',
        '.kbbbboooobbbbk.',
        '.kbpbbokkobbpbk.',
        '..kbbbooobbbbk..',
        '...kkbbbbbbkk...',
        '..kbbkrrrrkbbk..',
        '.kbbbbkrrkbbbbk.',
        '.kobbbbbbbbbbok.',
        '..kkbbkkkkbbkk..',
        '....kk....kk....'
      ]
    },
    {
      id: 5, name: 'Sweet Chocolate', emoji: '🍫', anim: 'anim-jelly',
      fx: { chars: ['♥', '✦', '♡'], colors: ['#8a4a2b', '#ff8fb8', '#ffd23f'] },
      message: 'You make my ordinary days sweeter just by being in them.',
      sprite: [
        '................',
        '..kkkk....kkkk..',
        '.kcccck..kcccck.',
        'kccPPcckkcccccck',
        'kcPcccccccccccck',
        'kcPccccccPcccCck',
        'kcccccccPcPccCck',
        '.kcccccccPccCck.',
        '..kccccccccCck..',
        '...kccccccCck...',
        '....kccccCck....',
        '.....kccCck.....',
        '......kcck......',
        '.......kk.......',
        '................',
        '................'
      ]
    },
    {
      id: 6, name: 'Secret Love Letter', emoji: '💌', anim: 'anim-letter',
      fx: { chars: ['♥', '✉', '♡'], colors: ['#e8344e', '#ffffff', '#ff8fb8'] },
      message: 'Dear Nasywa, words will never be enough to explain how much you mean to me.',
      sprite: [
        '................',
        '................',
        'kkkkkkkkkkkkkkkk',
        'kkeeeeeeeeeeeekk',
        'kekeeeeeeeeeekek',
        'keekeeeeeeeekeek',
        'keeekeeeeeekeeek',
        'keeeekrrrrkeeeek',
        'keeeeekRrkeeeeek',
        'keeeeeekkeeeeeek',
        'keeeeeeeeeeeeeek',
        'kPPeeeeeeeeeePPk',
        'kkkkkkkkkkkkkkkk',
        '................',
        '................',
        '................'
      ]
    },
    {
      id: 7, name: 'A Piece of the Stars', emoji: '⭐', anim: 'anim-star',
      fx: { chars: ['★', '✦', '✧'], colors: ['#ffd23f', '#ffffff', '#b79cff'] },
      message: 'Among a million stars, you will always be the light I look for.',
      sprite: [
        '.......k.......',
        '......kyk......',
        '......kyk......',
        '.....kyyyk.....',
        'kkkkkyywyykkkkk',
        '.kyyyyyyyyyyyk.',
        '..kyykyyykyyk..',
        '...kpyyyyypk...',
        '...kyyyyyyyk...',
        '..kyyyyYyyyyk..',
        '..kyyyYkYyyyk..',
        '.kyyyYk.kYyyyk.',
        '.kyyYk...kYyyk.',
        'kyyYk.....kYyyk',
        'kkkk.......kkkk'
      ]
    },
    {
      id: 8, name: 'The Heart of Our Kingdom', emoji: '❤️', anim: 'anim-heart',
      fx: { chars: ['♥', '❤', '✦'], colors: ['#e8344e', '#ff8fb8', '#ffd23f'] },
      message: 'The greatest treasure in this kingdom is the happiness you bring into my life, Nasywa.',
      sprite: [
        '..kkk...kkk..',
        '.kpPpk.kpplk.',
        'kpPwPpkppplRk',
        'kpPPppppppllk',
        'kppppppppplRk',
        '.kpppppppplk.',
        '..kppppppRk..',
        '...kpppplk...',
        '....kppRk....',
        '.....kRk.....',
        '......k......'
      ]
    }
  ];

  var CHEST_LID = [
    '..kkkkkkkkkkkk..',
    '.kbbbbbbbbbbbbk.',
    'kbbybbbbbbbbybbk',
    'kyyyyyyyyyyyyyyk',
    'kBBybbbbbbbbyBBk',
    'kkkkkkkkkkkkkkkk'
  ];
  var CHEST_BASE = [
    'kbbybkyyyykbybbk',
    'kbbybkyrrykbybbk',
    'kBBybkyyyykbyBBk',
    'kbbybbkkkkbbybbk',
    'kyyyyyyyyyyyyyyk',
    'kbbybbbbbbbbybbk',
    'kBBybbbbbbbbyBBk',
    'kkkkkkkkkkkkkkkk'
  ];

  /* ---------------------------------------------------------
     3. HELPERS
     --------------------------------------------------------- */
  var $ = function (sel) { return document.querySelector(sel); };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowPower = (navigator.hardwareConcurrency || 4) <= 2;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Tiny deterministic RNG so trees look the same every load
  function seeded(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  /** Draw a pixel map onto a canvas. Non-square maps are centred in a square. */
  function drawSprite(canvas, rows, square) {
    var w = 0;
    rows.forEach(function (r) { w = Math.max(w, r.length); });
    var h = rows.length;
    var size = Math.max(w, h);
    var cw = square ? size : w;
    var ch = square ? size : h;
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext('2d');
    var ox = Math.floor((cw - w) / 2);
    var oy = Math.floor((ch - h) / 2);
    ctx.clearRect(0, 0, cw, ch);
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var col = PALETTE[row[x]];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    });
    return canvas;
  }

  /* ---------------------------------------------------------
     4. PROCEDURAL PIXEL ART: castle & sakura trees
     --------------------------------------------------------- */
  function drawCastle(canvas) {
    var ctx = canvas.getContext('2d');
    var W = 120, H = 96;
    canvas.width = W; canvas.height = H;
    var C = {
      ink: '#3b1f3a', wall: '#ffc2dc', wallShade: '#f59cc2', wallLight: '#ffe3ef',
      roof: '#9a7bea', roofLight: '#c3adff', gold: '#ffd23f', win: '#fff1a8',
      door: '#7a3d6b', heart: '#e8344e', white: '#ffffff'
    };
    function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
    function box(x, y, w, h, fill, shade) {
      rect(x - 1, y - 1, w + 2, h + 2, C.ink);
      rect(x, y, w, h, fill);
      if (shade) rect(x + w - 3, y, 3, h, shade);
      // brick dots
      for (var by = y + 4; by < y + h - 2; by += 6) {
        for (var bx = x + ((by / 6) % 2 ? 3 : 6); bx < x + w - 4; bx += 8) rect(bx, by, 2, 1, C.wallShade);
      }
    }
    function battlements(x, y, w) {
      for (var bx = x; bx < x + w - 1; bx += 5) {
        rect(bx - 1, y - 4, 5, 5, C.ink);
        rect(bx, y - 3, 3, 4, C.wall);
      }
    }
    function roof(cx, top, base, half) {
      for (var y = top; y <= base; y++) {
        var hw = Math.round(((y - top) / (base - top)) * half);
        rect(cx - hw - 1, y, hw * 2 + 3, 1, C.ink);
        if (y > top) {
          rect(cx - hw, y, hw * 2 + 1, 1, C.roof);
          rect(cx - hw, y, Math.max(1, hw), 1, C.roofLight);
          if ((y - top) % 4 === 0) rect(cx - hw, y, hw * 2 + 1, 1, '#8466d6');
        }
      }
      rect(cx - half - 1, base + 1, half * 2 + 3, 1, C.ink);
    }
    function flag(cx, top) {
      rect(cx, top - 9, 1, 9, C.ink);
      // little heart flag
      var hx = cx + 1, hy = top - 9;
      rect(hx, hy, 2, 1, C.heart); rect(hx + 3, hy, 2, 1, C.heart);
      rect(hx, hy + 1, 5, 1, C.heart); rect(hx + 1, hy + 2, 3, 1, C.heart); rect(hx + 2, hy + 3, 1, 1, C.heart);
    }
    function windowArch(x, y, w, h) {
      rect(x - 1, y - 1, w + 2, h + 2, C.ink);
      rect(x, y, w, h, C.win);
      rect(x, y, 1, 1, C.ink); rect(x + w - 1, y, 1, 1, C.ink);
      rect(x + Math.floor(w / 2), y + 1, 1, h - 1, '#ffd88a');
    }

    ctx.clearRect(0, 0, W, H);
    // side towers
    box(14, 34, 18, 60, C.wall, C.wallShade);
    box(88, 34, 18, 60, C.wall, C.wallShade);
    battlements(14, 34, 18); battlements(88, 34, 18);
    roof(23, 10, 30, 11); roof(97, 10, 30, 11);
    flag(23, 10); flag(97, 10);
    // main keep
    box(32, 46, 56, 48, C.wall, C.wallShade);
    battlements(32, 46, 56);
    // central tower
    box(47, 24, 26, 22, C.wallLight, C.wall);
    roof(60, 2, 21, 15);
    flag(60, 2);
    // heart emblem on central tower
    rect(55, 29, 4, 2, C.heart); rect(61, 29, 4, 2, C.heart);
    rect(54, 31, 12, 2, C.heart); rect(56, 33, 8, 2, C.heart); rect(58, 35, 4, 2, C.heart);
    rect(56, 29, 1, 1, C.white);
    // windows
    windowArch(20, 44, 6, 9); windowArch(94, 44, 6, 9);
    windowArch(20, 64, 6, 9); windowArch(94, 64, 6, 9);
    windowArch(39, 56, 6, 9); windowArch(75, 56, 6, 9);
    // gate
    rect(50, 69, 20, 25, C.ink);
    rect(51, 71, 18, 23, C.door);
    rect(52, 70, 16, 1, C.ink);
    for (var gx = 54; gx < 68; gx += 4) rect(gx, 72, 1, 22, '#5c2a52');
    rect(51, 69, 2, 2, C.ink); rect(67, 69, 2, 2, C.ink);
    rect(59, 80, 2, 2, C.gold);
    // gold trims
    rect(32, 92, 56, 2, C.gold); rect(14, 92, 18, 2, C.gold); rect(88, 92, 18, 2, C.gold);
    // steps
    rect(48, 94, 24, 2, C.ink); rect(49, 94, 22, 1, '#d9b3c7');
  }

  function drawTree(canvas, seed) {
    var ctx = canvas.getContext('2d');
    var W = 40, H = 48;
    canvas.width = W; canvas.height = H;
    var rnd = seeded(seed);
    function px(x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
    // trunk
    for (var y = 24; y < H; y++) {
      var tw = y > 42 ? 8 : 5;
      var tx = 18 - Math.floor(tw / 2);
      for (var x = tx - 1; x <= tx + tw; x++) {
        px(x, y, (x === tx - 1 || x === tx + tw) ? '#3b1f3a' : (x < tx + 2 ? '#a86b4a' : '#7a4a35'));
      }
    }
    // branches
    for (var i = 0; i < 6; i++) { px(13 + i, 28 - i, '#7a4a35'); px(22 + i, 27 - i, '#7a4a35'); }
    // blossom blobs
    var blobs = [[20, 16, 12], [9, 21, 8], [31, 21, 8], [20, 7, 8], [12, 11, 7], [28, 11, 7]];
    var cols = ['#ffd1e3', '#ffb3cf', '#ff8fb8', '#ffe3ef'];
    for (var yy = 0; yy < 32; yy++) {
      for (var xx = 0; xx < W; xx++) {
        var inside = false, edge = false;
        for (var b = 0; b < blobs.length; b++) {
          var dx = xx - blobs[b][0], dy = yy - blobs[b][1], r = blobs[b][2];
          var d = dx * dx + dy * dy;
          if (d <= r * r) { inside = true; if (d > (r - 1.3) * (r - 1.3)) edge = true; else { edge = false; break; } }
        }
        if (!inside) continue;
        if (edge) px(xx, yy, '#c75a8c');
        else px(xx, yy, yy > 22 && rnd() < .5 ? '#f08cb5' : cols[Math.floor(rnd() * cols.length)]);
      }
    }
  }

  /* ---------------------------------------------------------
     5. SAVE DATA (localStorage, safely wrapped)
     --------------------------------------------------------- */
  var state = { opened: [], muted: false, completions: 0 };

  function loadState() {
    try {
      var raw = window.localStorage.getItem(CONFIG.storageKey);
      if (!raw) return;
      var data = JSON.parse(raw);
      var valid = {};
      (Array.isArray(data.opened) ? data.opened : []).forEach(function (id) {
        id = Number(id);
        if (id >= 1 && id <= GIFTS.length) valid[id] = true;
      });
      state.opened = Object.keys(valid).map(Number);
      state.muted = !!data.muted;
      state.completions = Number(data.completions) || 0;
    } catch (e) { /* storage unavailable or corrupted: start fresh */ }
  }
  function saveState() {
    try { window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function isOpened(id) { return state.opened.indexOf(id) !== -1; }
  function allFound() { return state.opened.length >= GIFTS.length; }

  /* ---------------------------------------------------------
     6. AUDIO — Web Audio synth (no files needed)
     --------------------------------------------------------- */
  var Sound = (function () {
    var ctx = null, master = null, musicBus = null, timer = null;
    var nextTime = 0, step = 0, playing = false, fileAudio = null;

    function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

    function init() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = state.muted ? 0 : 0.8;
        master.connect(ctx.destination);
        musicBus = ctx.createGain();
        musicBus.gain.value = 0.32;
        musicBus.connect(master);
        return true;
      } catch (e) { ctx = null; return false; }
    }

    function tone(freq, start, dur, type, vol, dest) {
      if (!ctx) return;
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g); g.connect(dest || master);
      o.start(start); o.stop(start + dur + 0.05);
    }

    // I – vi – IV – V in C major, music-box style
    var CHORDS = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
    var ARP = [0, 1, 2, 3, 2, 1, 2, 1];
    var MELODY = [
      76, 0, 79, 0, 76, 74, 72, 0,
      72, 0, 76, 0, 81, 0, 79, 0,
      77, 0, 81, 0, 79, 77, 76, 0,
      74, 0, 79, 0, 77, 76, 74, 0
    ];
    var STEP = 60 / 80 / 2; // eighth notes at 80 BPM

    function schedule() {
      while (nextTime < ctx.currentTime + 0.15) {
        var bar = Math.floor(step / 8) % 4;
        var i = step % 8;
        var chord = CHORDS[bar];
        tone(midi(chord[ARP[i]]), nextTime, 0.9, 'sine', 0.12, musicBus);
        if (i === 0) tone(midi(chord[0] - 12), nextTime, 1.6, 'triangle', 0.14, musicBus);
        var m = MELODY[step % 32];
        if (m) {
          tone(midi(m), nextTime, 0.7, 'triangle', 0.1, musicBus);
          tone(midi(m + 12), nextTime, 0.4, 'sine', 0.025, musicBus);
        }
        nextTime += STEP;
        step++;
      }
    }

    function startMusic() {
      if (playing || state.muted) return;
      if (CONFIG.musicFile) {
        try {
          if (!fileAudio) {
            fileAudio = new Audio(CONFIG.musicFile);
            fileAudio.loop = true;
            fileAudio.volume = 0.5;
            fileAudio.addEventListener('error', function () {
              CONFIG.musicFile = ''; fileAudio = null; playing = false; startMusic();
            });
          }
          var p = fileAudio.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked: ignore */ });
          playing = true;
          return;
        } catch (e) { CONFIG.musicFile = ''; }
      }
      if (!init()) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      nextTime = ctx.currentTime + 0.1;
      playing = true;
      timer = setInterval(schedule, 40);
    }

    function stopMusic() {
      playing = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (fileAudio) fileAudio.pause();
    }

    function setMuted(m) {
      if (ctx && master) master.gain.setValueAtTime(m ? 0 : 0.8, ctx.currentTime);
      if (m) stopMusic(); else startMusic();
    }

    function sfx(name) {
      if (state.muted || !init()) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var t = ctx.currentTime + 0.01;
      var notes, i;
      switch (name) {
        case 'click':
          tone(988, t, 0.08, 'square', 0.05);
          break;
        case 'creak':
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(180, t);
          o.frequency.linearRampToValueAtTime(110, t + 0.4);
          g.gain.setValueAtTime(0.05, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(t + 0.5);
          break;
        case 'open':
          notes = [72, 76, 79, 84];
          for (i = 0; i < notes.length; i++) tone(midi(notes[i]), t + i * 0.07, 0.5, 'square', 0.05);
          break;
        case 'found':
          notes = [79, 84, 88, 91, 96];
          for (i = 0; i < notes.length; i++) tone(midi(notes[i]), t + i * 0.09, 0.8, 'triangle', 0.12);
          break;
        case 'final':
          [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach(function (ch, k) {
            ch.forEach(function (n) { tone(midi(n), t + k * 0.35, k === 3 ? 2.2 : 0.5, 'triangle', 0.09); });
          });
          break;
        case 'pop':
          tone(rand(500, 900), t, 0.18, 'square', 0.025);
          break;
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
     7. VISUAL FX (DOM particles + fireworks canvas)
     --------------------------------------------------------- */
  var fxLayer = $('#fx');

  function burst(x, y, opts) {
    if (reducedMotion) return;
    var count = Math.round((opts.count || 18) * (lowPower ? 0.5 : 1));
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'particle';
      s.textContent = pick(opts.chars);
      var ang = Math.random() * Math.PI * 2;
      var dist = rand(60, opts.spread || 160);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.color = pick(opts.colors);
      s.style.fontSize = Math.round(rand(14, 28)) + 'px';
      s.style.setProperty('--x', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--y', Math.sin(ang) * dist - 40 + 'px');
      s.style.setProperty('--r', rand(-180, 180) + 'deg');
      s.style.setProperty('--d', rand(0.9, 1.6) + 's');
      s.addEventListener('animationend', removeSelf);
      fxLayer.appendChild(s);
    }
  }
  function rising(chars, colors) {
    if (reducedMotion) return;
    var s = document.createElement('span');
    s.className = 'particle rise';
    s.textContent = pick(chars);
    s.style.left = rand(0, 100) + 'vw';
    s.style.top = '102vh';
    s.style.color = pick(colors);
    s.style.fontSize = Math.round(rand(14, 30)) + 'px';
    s.style.setProperty('--x', rand(-60, 60) + 'px');
    s.style.setProperty('--r', rand(-90, 90) + 'deg');
    s.style.setProperty('--d', rand(4, 7) + 's');
    s.addEventListener('animationend', removeSelf);
    fxLayer.appendChild(s);
  }
  function removeSelf() { if (this.parentNode) this.parentNode.removeChild(this); }
  function flash() {
    if (reducedMotion) return;
    var f = document.createElement('div');
    f.className = 'flash';
    f.addEventListener('animationend', removeSelf);
    document.body.appendChild(f);
  }

  var Fireworks = (function () {
    var canvas = $('#fireworks'), ctx = canvas.getContext('2d');
    var SCALE = 4, parts = [], rockets = [], raf = null, last = 0, spawnT = 0;
    var COLORS = ['#ff8fb8', '#ffd1e3', '#ffd23f', '#b79cff', '#ffffff', '#e8344e'];

    function resize() {
      canvas.width = Math.max(1, Math.floor(window.innerWidth / SCALE));
      canvas.height = Math.max(1, Math.floor(window.innerHeight / SCALE));
    }
    function launch() {
      rockets.push({
        x: rand(canvas.width * 0.15, canvas.width * 0.85), y: canvas.height,
        vy: -rand(55, 75), target: rand(canvas.height * 0.12, canvas.height * 0.45),
        color: pick(COLORS)
      });
    }
    function explode(r) {
      var n = lowPower ? 22 : 40, heart = Math.random() < 0.4;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, sp;
        var vx, vy;
        if (heart) { // heart-shaped burst
          vx = 16 * Math.pow(Math.sin(a), 3);
          vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          sp = 1.6;
        } else { vx = Math.cos(a); vy = Math.sin(a); sp = rand(14, 30); }
        parts.push({ x: r.x, y: r.y, vx: vx * sp, vy: vy * sp, life: 1, color: i % 3 ? r.color : pick(COLORS) });
      }
      Sound.sfx('pop');
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      spawnT -= dt;
      if (spawnT <= 0) { launch(); spawnT = rand(0.5, 1.1); }
      ctx.fillStyle = 'rgba(26, 15, 46, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i];
        r.y += r.vy * dt;
        ctx.fillStyle = '#fff1a8';
        ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 2);
        if (r.y <= r.target) { explode(r); rockets.splice(i, 1); }
      }
      for (var j = parts.length - 1; j >= 0; j--) {
        var p = parts[j];
        p.vy += 18 * dt;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.life -= dt * 0.6;
        if (p.life <= 0) { parts.splice(j, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function start() {
      resize();
      parts = []; rockets = [];
      if (reducedMotion) return; // static, calm ending
      last = performance.now(); spawnT = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', function () { if (raf) resize(); });
    return { start: start, stop: stop };
  })();

  /* ---------------------------------------------------------
     8. SCENERY (stars, fireflies, petals, flowers)
     --------------------------------------------------------- */
  function buildScenery() {
    var stars = $('#stars'), i, el;
    var nStars = lowPower ? 25 : 45;
    for (i = 0; i < nStars; i++) {
      el = document.createElement('div');
      el.className = 'star' + (Math.random() < 0.15 ? ' big' : '');
      el.style.left = rand(0, 100) + '%';
      el.style.top = rand(0, 45) + '%';
      el.style.animationDelay = rand(0, 3) + 's';
      stars.appendChild(el);
    }
    var ff = $('#fireflies');
    for (i = 0; i < (lowPower ? 6 : 12); i++) {
      el = document.createElement('div');
      el.className = 'firefly';
      el.style.left = rand(3, 97) + '%';
      el.style.top = rand(40, 92) + '%';
      el.style.animationDelay = -rand(0, 6) + 's, ' + -rand(0, 2) + 's';
      el.style.animationDuration = rand(5, 9) + 's, ' + rand(1.5, 3) + 's';
      ff.appendChild(el);
    }
    var petals = $('#petals');
    for (i = 0; i < (lowPower ? 8 : 16); i++) {
      el = document.createElement('div');
      el.className = 'petal';
      el.style.left = rand(-5, 95) + '%';
      el.style.animationDuration = rand(9, 16) + 's';
      el.style.animationDelay = -rand(0, 16) + 's';
      petals.appendChild(el);
    }
    var flowerColors = ['#ff8fb8', '#ffffff', '#b79cff', '#ffd1e3', '#e8344e'];
    document.querySelectorAll('.flowers').forEach(function (box) {
      var n = Number(box.getAttribute('data-count')) || 20;
      for (var k = 0; k < n; k++) {
        var f = document.createElement('div');
        f.className = 'flower';
        f.style.left = rand(2, 98) + '%';
        f.style.top = rand(6, 90) + '%';
        f.style.setProperty('--c', pick(flowerColors));
        box.appendChild(f);
      }
    });
    drawCastle($('#castle-title'));
    drawCastle($('#castle-game'));
    drawCastle($('#castle-ending'));
    drawTree($('.tree-left'), 7);
    drawTree($('.tree-right'), 42);
  }

  /* ---------------------------------------------------------
     9. GAME
     --------------------------------------------------------- */
  var els = {
    title: $('#screen-title'), game: $('#screen-game'),
    chests: $('#chests'), progressText: $('#progress-text'),
    progressBar: $('#progress-bar'), progressFill: $('#progress-fill'),
    modal: $('#gift-modal'), giftCanvas: $('#gift-canvas'),
    giftNumber: $('#gift-number'), giftName: $('#gift-name'), giftMessage: $('#gift-message'),
    giftClose: $('#btn-gift-close'), ending: $('#ending'), treasureRow: $('#treasure-row'),
    btnEnding: $('#btn-ending'), btnSound: $('#btn-sound'), hint: $('#title-hint'),
    live: $('#live'), gameCastle: $('#castle-game')
  };
  var busy = false, typeTimer = null, endingTimer = null, risingTimer = null;
  var lastFocus = null, pendingEnding = false;

  function showScreen(name) {
    els.title.classList.toggle('active', name === 'title');
    els.game.classList.toggle('active', name === 'game');
  }

  function buildChests() {
    els.chests.innerHTML = '';
    GIFTS.forEach(function (gift, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chest';
      btn.style.setProperty('--i', i);
      btn.setAttribute('data-id', gift.id);
      btn.innerHTML =
        '<span class="shadow"></span>' +
        '<canvas class="lid pixel"></canvas>' +
        '<canvas class="base pixel"></canvas>' +
        '<span class="num">' + gift.id + '</span>' +
        '<span class="found">FOUND ♡</span>';
      drawSprite(btn.querySelector('.lid'), CHEST_LID);
      drawSprite(btn.querySelector('.base'), CHEST_BASE);
      btn.addEventListener('click', function () { onChestClick(gift, btn); });
      els.chests.appendChild(btn);
    });
    refreshChests();
  }

  function refreshChests() {
    els.chests.querySelectorAll('.chest').forEach(function (btn) {
      var id = Number(btn.getAttribute('data-id'));
      var gift = GIFTS[id - 1];
      var open = isOpened(id);
      btn.classList.toggle('opened', open);
      btn.setAttribute('aria-label', open
        ? 'Chest ' + id + ', opened: ' + gift.name + '. Tap to read again.'
        : 'Treasure chest ' + id + ', closed. Tap to open.');
    });
  }

  function updateProgress() {
    var n = state.opened.length;
    els.progressText.textContent = n + '/' + GIFTS.length + ' Gifts Discovered';
    els.progressFill.style.width = (n / GIFTS.length * 100) + '%';
    els.progressBar.setAttribute('aria-valuenow', n);
    els.btnEnding.classList.toggle('hidden', !allFound());
    els.gameCastle.classList.toggle('glowing', allFound());
    if (n === 0) els.hint.textContent = '';
    else if (allFound()) els.hint.textContent = 'All 8 treasures found ♡ the kingdom glows for you';
    else els.hint.textContent = 'Welcome back! ' + n + '/8 treasures already found';
  }

  function onChestClick(gift, btn) {
    if (busy) return;
    Sound.sfx('click');
    if (isOpened(gift.id)) { openGiftModal(gift, btn, false); return; }

    busy = true;
    btn.classList.add('opening');
    Sound.sfx('creak');
    setTimeout(function () {
      btn.classList.remove('opening');
      // Record progress (guarded so it can never duplicate)
      if (!isOpened(gift.id)) state.opened.push(gift.id);
      saveState();
      refreshChests();
      updateProgress();
      Sound.sfx('open');

      var r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 3, { chars: ['♥', '♡', '✦'], colors: ['#ff8fb8', '#ffd23f', '#ffffff'], count: 14, spread: 110 });
      setTimeout(function () {
        busy = false;
        openGiftModal(gift, btn, allFound());
      }, reducedMotion ? 0 : 450);
    }, reducedMotion ? 0 : 600);
  }

  function openGiftModal(gift, btn, isFinal) {
    lastFocus = btn;
    pendingEnding = isFinal;
    els.modal.classList.toggle('final', isFinal);
    els.giftNumber.textContent = isFinal ? '✨ The final treasure #' + gift.id + ' ✨' : 'Treasure #' + gift.id;
    els.giftName.textContent = gift.name + ' ' + gift.emoji;
    els.giftClose.textContent = isFinal ? 'SEE THE MAGIC ✨' : 'CONTINUE ♡';

    drawSprite(els.giftCanvas, gift.sprite, true);
    els.giftCanvas.className = 'gift-sprite pixel';
    void els.giftCanvas.offsetWidth; // restart animation
    els.giftCanvas.classList.add(gift.anim);

    els.modal.hidden = false;
    els.giftClose.focus();
    typeMessage(gift.message);
    els.live.textContent = gift.name + '. ' + gift.message;

    Sound.sfx(isFinal ? 'final' : 'found');
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 80;
    setTimeout(function () {
      burst(cx, cy, { chars: gift.fx.chars, colors: gift.fx.colors, count: isFinal ? 40 : 22, spread: isFinal ? 280 : 180 });
    }, 250);
    if (isFinal) {
      flash();
      setTimeout(function () { burst(cx, cy, { chars: ['♥', '★', '✦'], colors: ['#ffd23f', '#ff8fb8', '#b79cff'], count: 36, spread: 320 }); }, 900);
      clearTimeout(endingTimer);
      endingTimer = setTimeout(closeGiftModal, CONFIG.endingAutoDelay * 1000);
    }
  }

  function typeMessage(text) {
    clearInterval(typeTimer);
    var el = els.giftMessage;
    if (reducedMotion) { el.textContent = '“' + text + '”'; return; }
    var full = '“' + text + '”', i = 0;
    el.textContent = '';
    typeTimer = setInterval(function () {
      i++;
      el.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(typeTimer);
    }, 28);
  }

  function closeGiftModal() {
    if (els.modal.hidden) return;
    clearInterval(typeTimer);
    clearTimeout(endingTimer);
    els.modal.hidden = true;
    Sound.sfx('click');
    if (pendingEnding) { pendingEnding = false; showEnding(); }
    else if (lastFocus) lastFocus.focus();
  }

  function showEnding() {
    els.treasureRow.innerHTML = '';
    GIFTS.forEach(function (g) {
      var c = document.createElement('canvas');
      c.className = 'pixel';
      c.title = g.name;
      drawSprite(c, g.sprite, true);
      els.treasureRow.appendChild(c);
    });
    els.ending.hidden = false;
    els.ending.querySelector('.ending-content').scrollTop = 0;
    $('#btn-play-again').focus();
    Fireworks.start();
    Sound.sfx('final');
    clearInterval(risingTimer);
    if (!reducedMotion) {
      risingTimer = setInterval(function () {
        rising(['♥', '★', '♡', '✦'], ['#ff8fb8', '#ffd23f', '#ffffff', '#b79cff']);
      }, lowPower ? 700 : 350);
    }
  }

  function hideEnding() {
    els.ending.hidden = true;
    Fireworks.stop();
    clearInterval(risingTimer);
    fxLayer.innerHTML = '';
  }

  function playAgain() {
    Sound.sfx('click');
    state.completions += 1;
    state.opened = [];
    saveState();
    hideEnding();
    refreshChests();
    updateProgress();
    showScreen('game');
  }

  function resetProgress() {
    if (!window.confirm('Reset all progress? Every chest will be closed again.')) return;
    Sound.sfx('click');
    state.opened = [];
    state.completions = 0;
    saveState();
    hideEnding();
    els.modal.hidden = true;
    pendingEnding = false;
    refreshChests();
    updateProgress();
    showScreen('title');
  }

  function updateSoundButton() {
    els.btnSound.classList.toggle('muted', state.muted);
    els.btnSound.setAttribute('aria-label', state.muted ? 'Unmute music' : 'Mute music');
    els.btnSound.setAttribute('aria-pressed', String(state.muted));
  }

  /* ---------------------------------------------------------
     10. WIRING
     --------------------------------------------------------- */
  function init() {
    loadState();
    buildScenery();
    buildChests();
    updateProgress();
    updateSoundButton();

    $('#btn-start').addEventListener('click', function () {
      Sound.startMusic(); // first user interaction unlocks audio
      Sound.sfx('open');
      showScreen('game');
      var first = els.chests.querySelector('.chest:not(.opened)') || els.chests.querySelector('.chest');
      if (first) first.focus({ preventScroll: true });
    });
    els.giftClose.addEventListener('click', closeGiftModal);
    els.modal.addEventListener('click', function (e) { if (e.target === els.modal) closeGiftModal(); });
    els.btnEnding.addEventListener('click', function () { Sound.sfx('click'); showEnding(); });
    $('#btn-play-again').addEventListener('click', playAgain);
    $('#btn-reset').addEventListener('click', resetProgress);
    $('#btn-reset-hud').addEventListener('click', resetProgress);
    els.btnSound.addEventListener('click', function () {
      state.muted = !state.muted;
      saveState();
      updateSoundButton();
      Sound.setMuted(state.muted);
      Sound.sfx('click');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !els.modal.hidden) closeGiftModal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
