/* =========================================================
   game3d.js — Nasywa's Magical Love Castle, 3D edition.
   Builds the 3D world on top of engine3d.js + geometry3d.js,
   and reuses the romantic content (8 gifts, messages, audio,
   localStorage, secret ending) via the shared DOM/UI.
   No external libraries. Works offline on GitHub Pages.
   ========================================================= */
(function () {
  'use strict';

  var Engine = window.Engine3D.Engine, M = window.Engine3D.mat4;
  var Builder = window.Geo3D.Builder;

  var $ = function (s) { return document.querySelector(s); };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowPower = (navigator.hardwareConcurrency || 4) <= 2;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || coarse;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  var CONFIG = { storageKey: 'nasywa-love-castle-v1', musicFile: '', endingAutoDelay: 10 };

  /* ---- shared pixel palette (for the gift popup sprites) ---- */
  var PALETTE = {
    k: '#3b1f3a', r: '#e8344e', R: '#a01d3a', p: '#ff8fb8', P: '#ffd1e3',
    g: '#5fbf6e', G: '#2e7d4f', y: '#ffd23f', Y: '#c9971c', w: '#ffffff',
    b: '#c47a45', B: '#8a4f2a', l: '#b79cff', L: '#e2d6ff',
    c: '#8a4a2b', C: '#5a2a16', o: '#ffe9c4', e: '#fff0f5'
  };

  /* ---- the 8 gifts (sprites shown in the popup) ---- */
  var GIFTS = [
    { id: 1, name: 'Enchanted Rose', emoji: '🌹', anim: 'anim-bloom', color: '#e8344e',
      fx: { chars: ['♥', '❀', '✿'], colors: ['#e8344e', '#ff8fb8', '#ffd1e3'] },
      message: 'Just like this rose, my love for you will continue to bloom.',
      sprite: ['................','.....kkkkk......','....kRrrrRk.....','...kRrpprrRk....','...krpRRprrk....','...kRrRprRRk....','...kRRrrrRRk....','....kRRRRRk.....','.....kkkkk......','.......kgk......','..kkk..kgk......','.kgggk.kgk.kk...','..kgGGkkgkkggk..','...kkkkgGkGgk...','......kgGkkk....','.......kgk......'] },
    { id: 2, name: 'Eternal Bouquet', emoji: '💐', anim: 'anim-sway', color: '#ff8fb8',
      fx: { chars: ['✿', '❀', '♥'], colors: ['#ff8fb8', '#b79cff', '#ffd23f'] },
      message: 'If you could see yourself through my eyes, you would understand how special you are to me.',
      sprite: ['..kk..kkk..kk...','.kppkkrrrkkllk..','.kpPpkrRrklLlk..','..kpkkkrkkklk...','.kkyykpPpkkkkk..','kyyYykpppkrrk...','.kyykgkpkkrRrk..','..kkgGkgkkkrk...','...kGgGgGgkk....','....kgGgGgk.....','....kPkkkPk.....','...kPPPyPPPk....','...kPpPyPpPk....','....kPPyPPk.....','.....kPPPk......','......kkk.......'] },
    { id: 3, name: 'Promise Ring', emoji: '💍', anim: 'anim-ring', color: '#ffd23f',
      fx: { chars: ['✦', '✧', '♥'], colors: ['#ffd23f', '#ffffff', '#e2d6ff'] },
      message: 'If I had to choose again, I would still choose you.',
      sprite: ['......kkkk......','.....kwLLwk.....','....kLwwwLLk....','.....kLLLLk.....','......kyyk......','....kkyyyykk....','...kyyYkkYyyk...','..kyYk....kYyk..','..kyk......kyk..','..kyk......kyk..','..kyk......kyk..','..kYyk....kyYk..','...kYyykkyyYk...','....kkYYYYkk....','......kkkk......'] },
    { id: 4, name: 'Cuddle Bear', emoji: '🧸', anim: 'anim-bounce', color: '#c47a45',
      fx: { chars: ['♥', '♡', '✿'], colors: ['#ff8fb8', '#e8344e', '#ffe9c4'] },
      message: 'Whenever you need a hug, imagine this little bear giving you one from me.',
      sprite: ['..kkk......kkk..','.kbBbk....kbBbk.','.kBobkkkkkkboBk.','..kbbbbbbbbbbk..','.kbbbbbbbbbbbbk.','.kbbwkbbbbwkbbk.','.kbbkkbbbbkkbbk.','.kbbbboooobbbbk.','.kbpbbokkobbpbk.','..kbbbooobbbbk..','...kkbbbbbbkk...','..kbbkrrrrkbbk..','.kbbbbkrrkbbbbk.','.kobbbbbbbbbbok.','..kkbbkkkkbbkk..','....kk....kk....'] },
    { id: 5, name: 'Sweet Chocolate', emoji: '🍫', anim: 'anim-jelly', color: '#8a4a2b',
      fx: { chars: ['♥', '✦', '♡'], colors: ['#8a4a2b', '#ff8fb8', '#ffd23f'] },
      message: 'You make my ordinary days sweeter just by being in them.',
      sprite: ['................','..kkkk....kkkk..','.kcccck..kcccck.','kccPPcckkcccccck','kcPcccccccccccck','kcPccccccPcccCck','kcccccccPcPccCck','.kcccccccPccCck.','..kccccccccCck..','...kccccccCck...','....kccccCck....','.....kccCck.....','......kcck......','.......kk.......','................','................'] },
    { id: 6, name: 'Secret Love Letter', emoji: '💌', anim: 'anim-letter', color: '#fff0f5',
      fx: { chars: ['♥', '✉', '♡'], colors: ['#e8344e', '#ffffff', '#ff8fb8'] },
      message: 'Dear Nasywa, words will never be enough to explain how much you mean to me.',
      sprite: ['................','................','kkkkkkkkkkkkkkkk','kkeeeeeeeeeeeekk','kekeeeeeeeeeekek','keekeeeeeeeekeek','keeekeeeeeekeeek','keeeekrrrrkeeeek','keeeeekRrkeeeeek','keeeeeekkeeeeeek','keeeeeeeeeeeeeek','kPPeeeeeeeeeePPk','kkkkkkkkkkkkkkkk','................','................','................'] },
    { id: 7, name: 'A Piece of the Stars', emoji: '⭐', anim: 'anim-star', color: '#ffd23f',
      fx: { chars: ['★', '✦', '✧'], colors: ['#ffd23f', '#ffffff', '#b79cff'] },
      message: 'Among a million stars, you will always be the light I look for.',
      sprite: ['.......k.......','......kyk......','......kyk......','.....kyyyk.....','kkkkkyywyykkkkk','.kyyyyyyyyyyyk.','..kyykyyykyyk..','...kpyyyyypk...','...kyyyyyyyk...','..kyyyyYyyyyk..','..kyyyYkYyyyk..','.kyyyYk.kYyyyk.','.kyyYk...kYyyk.','kyyYk.....kYyyk','kkkk.......kkkk'] },
    { id: 8, name: 'The Heart of Our Kingdom', emoji: '❤️', anim: 'anim-heart', color: '#e8344e',
      fx: { chars: ['♥', '❤', '✦'], colors: ['#e8344e', '#ff8fb8', '#ffd23f'] },
      message: 'The greatest treasure in this kingdom is the happiness you bring into my life, Nasywa.',
      sprite: ['..kkk...kkk..','.kpPpk.kpplk.','kpPwPpkppplRk','kpPPppppppllk','kppppppppplRk','.kpppppppplk.','..kppppppRk..','...kpppplk...','....kppRk....','.....kRk.....','......k......'] }
  ];

  /* draw a pixel-map sprite onto a canvas (gift popup / ending row) */
  function drawSprite(canvas, rows, square) {
    var w = 0; rows.forEach(function (r) { w = Math.max(w, r.length); });
    var h = rows.length, size = Math.max(w, h);
    var cw = square ? size : w, ch = square ? size : h;
    canvas.width = cw; canvas.height = ch;
    var ctx = canvas.getContext('2d'), ox = Math.floor((cw - w) / 2), oy = Math.floor((ch - h) / 2);
    ctx.clearRect(0, 0, cw, ch);
    rows.forEach(function (row, y) { for (var x = 0; x < row.length; x++) { var c = PALETTE[row[x]]; if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); } } });
  }

  function drawCastleIcon(canvas) { // small pixel castle for title/ending
    var ctx = canvas.getContext('2d'); var W = 120, H = 96; canvas.width = W; canvas.height = H;
    var C = { ink: '#3b1f3a', wall: '#ffc2dc', wallShade: '#f59cc2', wallLight: '#ffe3ef', roof: '#9a7bea', roofLight: '#c3adff', gold: '#ffd23f', win: '#fff1a8', door: '#7a3d6b', heart: '#e8344e', white: '#ffffff' };
    function r(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
    function box(x, y, w, h, f, s) { r(x - 1, y - 1, w + 2, h + 2, C.ink); r(x, y, w, h, f); if (s) r(x + w - 3, y, 3, h, s); }
    function roof(cx, top, base, half) { for (var y = top; y <= base; y++) { var hw = Math.round(((y - top) / (base - top)) * half); r(cx - hw - 1, y, hw * 2 + 3, 1, C.ink); if (y > top) { r(cx - hw, y, hw * 2 + 1, 1, C.roof); r(cx - hw, y, Math.max(1, hw), 1, C.roofLight); } } }
    ctx.clearRect(0, 0, W, H);
    box(14, 34, 18, 60, C.wall, C.wallShade); box(88, 34, 18, 60, C.wall, C.wallShade);
    roof(23, 10, 30, 11); roof(97, 10, 30, 11);
    box(32, 46, 56, 48, C.wall, C.wallShade); box(47, 24, 26, 22, C.wallLight, C.wall); roof(60, 2, 21, 15);
    r(55, 29, 4, 2, C.heart); r(61, 29, 4, 2, C.heart); r(54, 31, 12, 2, C.heart); r(56, 33, 8, 2, C.heart); r(58, 35, 4, 2, C.heart);
    r(20, 44, 6, 9, C.win); r(94, 44, 6, 9, C.win); r(39, 56, 6, 9, C.win); r(75, 56, 6, 9, C.win);
    r(51, 71, 18, 23, C.door); r(32, 92, 56, 2, C.gold);
  }

  /* ---------------- SAVE ---------------- */
  var state = { opened: [], muted: false, completions: 0 };
  function loadState() {
    try { var raw = localStorage.getItem(CONFIG.storageKey); if (!raw) return; var d = JSON.parse(raw), v = {};
      (Array.isArray(d.opened) ? d.opened : []).forEach(function (id) { id = Number(id); if (id >= 1 && id <= 8) v[id] = true; });
      state.opened = Object.keys(v).map(Number); state.muted = !!d.muted; state.completions = Number(d.completions) || 0;
    } catch (e) {}
  }
  function saveState() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {} }
  function isOpened(id) { return state.opened.indexOf(id) !== -1; }
  function allFound() { return state.opened.length >= 8; }

  /* ---------------- AUDIO (Web Audio synth) ---------------- */
  var Sound = (function () {
    var ctx = null, master = null, musicBus = null, timer = null, nextTime = 0, step = 0, playing = false, fileAudio = null;
    function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function init() { if (ctx) return true; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { ctx = new AC(); master = ctx.createGain(); master.gain.value = state.muted ? 0 : 0.8; master.connect(ctx.destination);
        musicBus = ctx.createGain(); musicBus.gain.value = 0.32; musicBus.connect(master); return true; } catch (e) { ctx = null; return false; } }
    function tone(f, s, d, t, v, dest) { if (!ctx) return; var o = ctx.createOscillator(), g = ctx.createGain(); o.type = t || 'sine'; o.frequency.setValueAtTime(f, s);
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v || 0.2, s + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, s + d); o.connect(g); g.connect(dest || master); o.start(s); o.stop(s + d + 0.05); }
    var CH = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]], ARP = [0, 1, 2, 3, 2, 1, 2, 1];
    var MEL = [76, 0, 79, 0, 76, 74, 72, 0, 72, 0, 76, 0, 81, 0, 79, 0, 77, 0, 81, 0, 79, 77, 76, 0, 74, 0, 79, 0, 77, 76, 74, 0], ST = 60 / 80 / 2;
    function sched() { while (nextTime < ctx.currentTime + 0.15) { var bar = Math.floor(step / 8) % 4, i = step % 8, c = CH[bar];
      tone(midi(c[ARP[i]]), nextTime, 0.9, 'sine', 0.12, musicBus); if (i === 0) tone(midi(c[0] - 12), nextTime, 1.6, 'triangle', 0.14, musicBus);
      var m = MEL[step % 32]; if (m) { tone(midi(m), nextTime, 0.7, 'triangle', 0.1, musicBus); tone(midi(m + 12), nextTime, 0.4, 'sine', 0.025, musicBus); } nextTime += ST; step++; } }
    function startMusic() { if (playing || state.muted) return;
      if (CONFIG.musicFile) { try { if (!fileAudio) { fileAudio = new Audio(CONFIG.musicFile); fileAudio.loop = true; fileAudio.volume = 0.5; fileAudio.addEventListener('error', function () { CONFIG.musicFile = ''; fileAudio = null; playing = false; startMusic(); }); } var p = fileAudio.play(); if (p && p.catch) p.catch(function () {}); playing = true; return; } catch (e) { CONFIG.musicFile = ''; } }
      if (!init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume(); nextTime = ctx.currentTime + 0.1; playing = true; timer = setInterval(sched, 40); }
    function stopMusic() { playing = false; if (timer) { clearInterval(timer); timer = null; } if (fileAudio) fileAudio.pause(); }
    function setMuted(m) { if (ctx && master) master.gain.setValueAtTime(m ? 0 : 0.8, ctx.currentTime); if (m) stopMusic(); else startMusic(); }
    function sfx(name) { if (state.muted || !init()) return; if (ctx.state === 'suspended' && ctx.resume) ctx.resume(); var t = ctx.currentTime + 0.01, n, i;
      switch (name) {
        case 'click': tone(988, t, 0.08, 'square', 0.05); break;
        case 'step': tone(rand(130, 170), t, 0.05, 'square', 0.012); break;
        case 'creak': var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(110, t + 0.4); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5); break;
        case 'open': n = [72, 76, 79, 84]; for (i = 0; i < n.length; i++) tone(midi(n[i]), t + i * 0.07, 0.5, 'square', 0.05); break;
        case 'found': n = [79, 84, 88, 91, 96]; for (i = 0; i < n.length; i++) tone(midi(n[i]), t + i * 0.09, 0.8, 'triangle', 0.12); break;
        case 'final': [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach(function (ch, k) { ch.forEach(function (nn) { tone(midi(nn), t + k * 0.35, k === 3 ? 2.2 : 0.5, 'triangle', 0.09); }); }); break;
        case 'pop': tone(rand(500, 900), t, 0.18, 'square', 0.025); break;
      } }
    document.addEventListener('visibilitychange', function () { if (!ctx) return; if (document.hidden) { if (ctx.suspend) ctx.suspend(); if (fileAudio) fileAudio.pause(); } else if (!state.muted) { if (ctx.resume) ctx.resume(); if (fileAudio && playing) fileAudio.play().catch(function () {}); } });
    return { startMusic: startMusic, setMuted: setMuted, sfx: sfx };
  })();

  /* ---------------- FX (DOM particles + fireworks reused) ---------------- */
  var fxLayer = $('#fx');
  function burst(x, y, opts) { if (reducedMotion) return; var count = Math.round((opts.count || 18) * (lowPower ? 0.5 : 1));
    for (var i = 0; i < count; i++) { var s = document.createElement('span'); s.className = 'particle'; s.textContent = pick(opts.chars);
      var ang = Math.random() * Math.PI * 2, dist = rand(60, opts.spread || 160); s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = pick(opts.colors); s.style.fontSize = Math.round(rand(14, 28)) + 'px';
      s.style.setProperty('--x', Math.cos(ang) * dist + 'px'); s.style.setProperty('--y', Math.sin(ang) * dist - 40 + 'px'); s.style.setProperty('--r', rand(-180, 180) + 'deg'); s.style.setProperty('--d', rand(0.9, 1.6) + 's');
      s.addEventListener('animationend', rm); fxLayer.appendChild(s); } }
  function rising(chars, colors) { if (reducedMotion) return; var s = document.createElement('span'); s.className = 'particle rise'; s.textContent = pick(chars);
    s.style.left = rand(0, 100) + 'vw'; s.style.top = '102vh'; s.style.color = pick(colors); s.style.fontSize = Math.round(rand(14, 30)) + 'px';
    s.style.setProperty('--x', rand(-60, 60) + 'px'); s.style.setProperty('--r', rand(-90, 90) + 'deg'); s.style.setProperty('--d', rand(4, 7) + 's'); s.addEventListener('animationend', rm); fxLayer.appendChild(s); }
  function rm() { if (this.parentNode) this.parentNode.removeChild(this); }
  function flash() { if (reducedMotion) return; var f = document.createElement('div'); f.className = 'flash'; f.addEventListener('animationend', rm); document.body.appendChild(f); }

  var Fireworks = (function () {
    var canvas = $('#fireworks'), ctx = canvas.getContext('2d'); var SCALE = 4, parts = [], rockets = [], raf = null, last = 0, spawnT = 0;
    var COLORS = ['#ff8fb8', '#ffd1e3', '#ffd23f', '#b79cff', '#ffffff', '#e8344e'];
    function resize() { canvas.width = Math.max(1, Math.floor(window.innerWidth / SCALE)); canvas.height = Math.max(1, Math.floor(window.innerHeight / SCALE)); }
    function launch() { rockets.push({ x: rand(canvas.width * 0.15, canvas.width * 0.85), y: canvas.height, vy: -rand(55, 75), target: rand(canvas.height * 0.12, canvas.height * 0.45), color: pick(COLORS) }); }
    function explode(r) { var n = lowPower ? 22 : 40, heart = Math.random() < 0.4; for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2, sp, vx, vy;
      if (heart) { vx = 16 * Math.pow(Math.sin(a), 3); vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); sp = 1.6; } else { vx = Math.cos(a); vy = Math.sin(a); sp = rand(14, 30); }
      parts.push({ x: r.x, y: r.y, vx: vx * sp, vy: vy * sp, life: 1, color: i % 3 ? r.color : pick(COLORS) }); } Sound.sfx('pop'); }
    function frame(now) { var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; spawnT -= dt; if (spawnT <= 0) { launch(); spawnT = rand(0.5, 1.1); }
      ctx.fillStyle = 'rgba(26,15,46,0.35)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (var i = rockets.length - 1; i >= 0; i--) { var r = rockets[i]; r.y += r.vy * dt; ctx.fillStyle = '#fff1a8'; ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 2); if (r.y <= r.target) { explode(r); rockets.splice(i, 1); } }
      for (var j = parts.length - 1; j >= 0; j--) { var p = parts[j]; p.vy += 18 * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.6; if (p.life <= 0) { parts.splice(j, 1); continue; } ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(frame); }
    function start() { resize(); parts = []; rockets = []; if (reducedMotion) return; last = performance.now(); spawnT = 0; if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    window.addEventListener('resize', function () { if (raf) resize(); });
    return { start: start, stop: stop };
  })();

  function buildSky() { // title screen flourishes only
    var stars = $('#stars'), i, el, n = lowPower ? 25 : 45;
    for (i = 0; i < n; i++) { el = document.createElement('div'); el.className = 'star' + (Math.random() < 0.15 ? ' big' : ''); el.style.left = rand(0, 100) + '%'; el.style.top = rand(0, 45) + '%'; el.style.animationDelay = rand(0, 3) + 's'; stars.appendChild(el); }
    var ff = $('#fireflies'); for (i = 0; i < (lowPower ? 6 : 12); i++) { el = document.createElement('div'); el.className = 'firefly'; el.style.left = rand(3, 97) + '%'; el.style.top = rand(40, 92) + '%'; el.style.animationDelay = -rand(0, 6) + 's, ' + -rand(0, 2) + 's'; el.style.animationDuration = rand(5, 9) + 's, ' + rand(1.5, 3) + 's'; ff.appendChild(el); }
    var petals = $('#petals'); for (i = 0; i < (lowPower ? 8 : 16); i++) { el = document.createElement('div'); el.className = 'petal'; el.style.left = rand(-5, 95) + '%'; el.style.animationDuration = rand(9, 16) + 's'; el.style.animationDelay = -rand(0, 16) + 's'; petals.appendChild(el); }
    var fc = ['#ff8fb8', '#ffffff', '#b79cff', '#ffd1e3', '#e8344e'];
    document.querySelectorAll('.flowers').forEach(function (box) { var c = Number(box.getAttribute('data-count')) || 20; for (var k = 0; k < c; k++) { var f = document.createElement('div'); f.className = 'flower'; f.style.left = rand(2, 98) + '%'; f.style.top = rand(6, 90) + '%'; f.style.setProperty('--c', pick(fc)); box.appendChild(f); } });
    drawCastleIcon($('#castle-title')); drawCastleIcon($('#castle-ending'));
  }

  /* =========================================================
     THE 3D WORLD
     ========================================================= */
  var World3D = (function () {
    var canvas = $('#scene'), engine = null;
    var statics = null;         // merged static scenery mesh (castle, trees, ground...)
    var chestObjs = [];         // { id, x, z, lid, glowObj, base, open }
    var player = { x: 0, z: 6, y: 0, angle: 0, speed: 0, bob: 0 };
    var playerParts = {};
    var cam = { yaw: 0, dist: 11, height: 7.5, tx: 0, tz: 0 };
    var keys = {}, joy = { x: 0, y: 0, active: false };
    var raf = null, lastT = 0, running = false, t = 0, stepT = 0;
    var colliders = [];         // {x,z,r} cylinders to walk around
    var WORLD_R = 26;           // playable radius
    var nearChest = null;
    var fallbackMode = false;

    // chest world positions spread around the castle grounds
    var CHEST_POS = [
      { x: -6, z: 8 }, { x: 6, z: 8 },          // front garden
      { x: -12, z: 0 }, { x: 12, z: 0 },        // sides
      { x: -7, z: -6 }, { x: 7, z: -6 },        // near castle wings
      { x: 0, z: -11 }, { x: 0, z: 3 }          // behind + center fountain-side
    ];

    function tryInit() {
      try { engine = new Engine(canvas); return true; }
      catch (e) { return false; }
    }

    /* ---- build all the static scenery into one mesh ---- */
    function buildStatics() {
      var b = new Builder();
      // ground: grassy courtyard disc + stone plaza
      b.ground(0, 0, 0, 64, 64, '#5aa86a');
      b.ground(0, 0.02, 2, 20, 26, '#c9a36f');   // stone plaza
      b.ground(0, 0.03, 2, 6, 24, '#d8b989');    // path to door
      // perimeter low wall ring (suggested with boxes)
      var ringR = 22, segs = 28;
      for (var i = 0; i < segs; i++) {
        var a = i / segs * Math.PI * 2;
        var x = Math.cos(a) * ringR, z = Math.sin(a) * ringR;
        if (z > 9 && Math.abs(x) < 4) continue; // gap for entrance
        b.box(x, 0.9, z, 1.6, 1.8, 1.6, '#e4a8c6', '#c98bb0');
      }

      // ---- CASTLE ----
      var cz = -8; // castle sits toward the back
      // main keep
      b.box(0, 3, cz, 12, 6, 9, '#ffc2dc', '#f3a6c6');
      // battlement blocks on keep
      for (var bx = -5.5; bx <= 5.5; bx += 2.2) { b.box(bx, 6.3, cz - 4.3, 1.2, 1, 1.2, '#ffd1e3', '#f0a9c8'); b.box(bx, 6.3, cz + 4.3, 1.2, 1, 1.2, '#ffd1e3', '#f0a9c8'); }
      // central tall tower
      b.cylinder(0, 6, cz, 2.6, 7, 18, '#ffd1e3');
      b.cone(0, 13, cz, 3.2, 4.5, 18, '#9a7bea');
      // heart emblem on tower (two spheres + a cone-ish point via boxes)
      b.sphere(-0.8, 9.6, cz + 2.5, 0.7, 10, '#e8344e');
      b.sphere(0.8, 9.6, cz + 2.5, 0.7, 10, '#e8344e');
      b.box(0, 8.8, cz + 2.5, 1.9, 1.2, 0.4, '#e8344e');
      // four corner towers
      var towers = [[-6.5, cz - 4.5], [6.5, cz - 4.5], [-6.5, cz + 4.5], [6.5, cz + 4.5]];
      for (var ti = 0; ti < towers.length; ti++) {
        var tx = towers[ti][0], tz = towers[ti][1];
        b.cylinder(tx, 0, tz, 1.9, 9, 16, '#ffcbe0');
        b.cone(tx, 9, tz, 2.4, 3.4, 16, '#b79cff');
        // flag pole + heart
        b.cylinder(tx, 12.4, tz, 0.08, 1.6, 6, '#3b1f3a');
        b.box(tx + 0.5, 13.4, tz, 0.9, 0.6, 0.1, '#ff8fb8');
      }
      // front gate (door) + arch
      b.box(0, 1.9, cz + 4.6, 2.6, 3.8, 0.5, '#7a3d6b');
      b.box(0, 4.0, cz + 4.6, 3.0, 0.6, 0.6, '#ffd23f');
      // windows (glowing)
      var winColor = '#fff1a8';
      [[-4, 3.2, cz + 4.55], [4, 3.2, cz + 4.55], [-4, 3.2, cz - 4.55], [4, 3.2, cz - 4.55]].forEach(function (w) { b.box(w[0], w[1], w[2], 1, 1.6, 0.2, winColor); });

      // ---- FOUNTAIN (center plaza) ----
      var fz = 3;
      b.cylinder(0, 0, fz, 3, 0.6, 20, '#cdbce0');       // basin wall
      b.cylinder(0, 0.1, fz, 2.6, 0.5, 20, '#8fd0f0');   // water
      b.cylinder(0, 0.6, fz, 0.5, 1.6, 12, '#e2d6ff');   // center column
      b.sphere(0, 2.4, fz, 0.7, 10, '#bfe6ff');          // water bulb

      // ---- SAKURA TREES ring ----
      var treeSpots = [[-14, 10], [14, 10], [-16, -2], [16, -2], [-13, -12], [13, -12], [-9, 13], [9, 13]];
      for (var tr = 0; tr < treeSpots.length; tr++) {
        var txx = treeSpots[tr][0], tzz = treeSpots[tr][1];
        b.cylinder(txx, 0, tzz, 0.5, 3.2, 8, '#8a5a3c');            // trunk
        b.sphere(txx, 4.3, tzz, 2.2, 9, '#ffb3cf');                 // blossom canopy
        b.sphere(txx - 1.3, 3.7, tzz + 0.6, 1.3, 8, '#ffc8dd');
        b.sphere(txx + 1.2, 3.6, tzz - 0.7, 1.3, 8, '#ff9ec0');
        colliders.push({ x: txx, z: tzz, r: 0.9 });
      }

      // ---- flower beds (little coloured cubes near the plaza) ----
      var fcols = ['#ff8fb8', '#ffd23f', '#b79cff', '#ffffff', '#e8344e'];
      for (var fi = 0; fi < (lowPower ? 24 : 48); fi++) {
        var fa = rand(0, Math.PI * 2), fr = rand(5, 18), fx = Math.cos(fa) * fr, fzf = Math.sin(fa) * fr + 2;
        if (Math.abs(fx) < 3.5 && fzf > -2 && fzf < 8) continue; // keep path clear
        b.box(fx, 0.25, fzf, 0.3, 0.5, 0.3, pick(fcols));
      }

      // colliders: castle body, towers, fountain, gate
      colliders.push({ x: 0, z: cz, r: 7.2 });
      towers.forEach(function (tt) { colliders.push({ x: tt[0], z: tt[1], r: 2.2 }); });
      colliders.push({ x: 0, z: fz, r: 3.3 });

      statics = engine.add({ mesh: b.build(engine), model: M.create() });
    }

    /* ---- a chest = base + lid (openable) + glow cube ---- */
    function buildChests() {
      chestObjs = [];
      for (var i = 0; i < 8; i++) {
        var p = CHEST_POS[i];
        var baseB = new Builder();
        baseB.box(0, 0.45, 0, 1.4, 0.9, 1.0, '#9a5a2e', '#7a4522');
        baseB.box(0, 0.45, 0, 1.45, 0.25, 1.05, '#ffd23f', '#c9971c');
        baseB.box(0, 0.2, 0, 1.45, 0.25, 1.05, '#ffd23f', '#c9971c');
        var baseMesh = baseB.build(engine);

        var lidB = new Builder();
        // lid pivots around its back edge; model local origin at hinge
        lidB.box(0, 0, 0.0, 1.4, 0.5, 1.0, '#a9663a', '#8a5230');
        lidB.box(0, 0.18, 0, 1.45, 0.18, 1.05, '#ffd23f', '#c9971c');
        var lidMesh = lidB.build(engine);

        var glowB = new Builder();
        glowB.box(0, 0, 0, 0.8, 0.8, 0.8, GIFTS[i].color);
        var glowMesh = glowB.build(engine);

        var baseObj = engine.add({ mesh: baseMesh, model: M.create(), castsShadow: true });
        var lidObj = engine.add({ mesh: lidMesh, model: M.create(), castsShadow: true });
        var glowObj = engine.add({ mesh: glowMesh, model: M.create(), emissive: 1, glow: 0.6, castsShadow: false, visible: false });
        chestObjs.push({ id: i + 1, x: p.x, z: p.z, base: baseObj, lid: lidObj, glow: glowObj, open: false, lidAngle: 0 });
        colliders.push({ x: p.x, z: p.z, r: 0.95 });
      }
      syncChests();
    }

    function syncChests() {
      chestObjs.forEach(function (c) { c.open = isOpened(c.id); c.lidTarget = c.open ? -1.9 : 0; c.glow.visible = c.open; });
    }

    /* ---- the little heroine, assembled from boxes ---- */
    function buildPlayer() {
      function part(builderFn, opts) { var b = new Builder(); builderFn(b); var o = engine.add({ mesh: b.build(engine), model: M.create() }); if (opts) { o.emissive = opts.emissive || 0; } return o; }
      playerParts.body = part(function (b) {
        b.box(0, 0.45, 0, 0.7, 0.9, 0.5, '#ff8fb8', '#e8507f'); // dress
        b.box(0, 1.05, 0, 0.55, 0.3, 0.45, '#ffe0c4');          // neck/chest
      });
      playerParts.head = part(function (b) {
        b.box(0, 0, 0, 0.6, 0.55, 0.55, '#ffe0c4');             // face
        b.box(0, 0.18, -0.02, 0.66, 0.3, 0.62, '#7a4a2e');      // hair top
        b.box(0.33, -0.05, 0, 0.08, 0.5, 0.5, '#7a4a2e');       // hair side
        b.box(-0.33, -0.05, 0, 0.08, 0.5, 0.5, '#7a4a2e');
        b.box(0, 0.42, 0, 0.5, 0.14, 0.5, '#ffd23f');           // crown band
        b.box(-0.18, 0.55, 0, 0.1, 0.16, 0.1, '#ffd23f'); b.box(0, 0.58, 0, 0.1, 0.2, 0.1, '#ffd23f'); b.box(0.18, 0.55, 0, 0.1, 0.16, 0.1, '#ffd23f');
        b.box(-0.12, 0.02, 0.28, 0.08, 0.08, 0.05, '#3b1f3a'); b.box(0.12, 0.02, 0.28, 0.08, 0.08, 0.05, '#3b1f3a'); // eyes
      });
      playerParts.armL = part(function (b) { b.box(0, -0.25, 0, 0.16, 0.55, 0.16, '#ffe0c4'); });
      playerParts.armR = part(function (b) { b.box(0, -0.25, 0, 0.16, 0.55, 0.16, '#ffe0c4'); });
      playerParts.legL = part(function (b) { b.box(0, -0.3, 0, 0.2, 0.6, 0.2, '#f0c4a0'); });
      playerParts.legR = part(function (b) { b.box(0, -0.3, 0, 0.2, 0.6, 0.2, '#f0c4a0'); });
    }

    function placePlayer() {
      var swing = Math.sin(player.bob * 2) * (player.speed > 0.1 ? 0.6 : 0.05);
      var lift = Math.abs(Math.sin(player.bob * 2)) * (player.speed > 0.1 ? 0.08 : 0);
      var baseY = 0.6 + lift;
      function setPart(obj, lx, ly, lz, rotSwing) {
        var m = M.create();
        M.translate(m, m, player.x, 0, player.z);
        M.rotateY(m, m, player.angle);
        // local offset
        var lm = M.create(); M.translate(lm, lm, lx, baseY + ly, lz);
        M.mul(m, m, lm);
        obj.model = m;
      }
      setPart(playerParts.body, 0, 0, 0);
      setPart(playerParts.head, 0, 1.5, 0);
      // arms/legs swing
      function limb(obj, lx, ly, lz, phase) {
        var m = M.create(); M.translate(m, m, player.x, 0, player.z); M.rotateY(m, m, player.angle);
        var lm = M.create(); M.translate(lm, lm, lx, baseY + ly, lz + Math.sin(player.bob * 2 + phase) * (player.speed > 0.1 ? 0.18 : 0));
        M.mul(m, m, lm); obj.model = m;
      }
      limb(playerParts.armL, 0.46, 1.0, 0, 0);
      limb(playerParts.armR, -0.46, 1.0, 0, Math.PI);
      limb(playerParts.legL, 0.18, 0.0, 0, Math.PI);
      limb(playerParts.legR, -0.18, 0.0, 0, 0);
    }

    function updateChestTransforms() {
      for (var i = 0; i < chestObjs.length; i++) {
        var c = chestObjs[i];
        // smooth lid open/close
        c.lidAngle += (c.lidTarget - c.lidAngle) * (reducedMotion ? 1 : 0.15);
        var bm = M.create(); M.translate(bm, bm, c.x, 0, c.z); c.base.model = bm;
        // lid hinge at back edge (z = -0.5), raised to top of base (y=0.7)
        var lm = M.create(); M.translate(lm, lm, c.x, 0.75, c.z - 0.5);
        M.rotateY(lm, lm, 0); // face camera-neutral
        // rotate around X by lidAngle: emulate via manual since M has rotateY only -> use a small rotateX
        rotateX(lm, c.lidAngle);
        M.translate(lm, lm, 0, 0.0, 0.5);
        c.lid.model = lm;
        if (c.glow.visible) {
          var gm = M.create(); M.translate(gm, gm, c.x, 1.1 + Math.sin(t * 3 + i) * 0.12, c.z);
          M.rotateY(gm, gm, t * 1.5);
          c.glow.model = gm; c.glow.glow = 0.4 + 0.3 * Math.sin(t * 4 + i);
        }
      }
    }
    // rotateX helper (engine M only had rotateY)
    function rotateX(o, rad) {
      var s = Math.sin(rad), c = Math.cos(rad);
      var a10 = o[4], a11 = o[5], a12 = o[6], a13 = o[7], a20 = o[8], a21 = o[9], a22 = o[10], a23 = o[11];
      o[4] = a10 * c + a20 * s; o[5] = a11 * c + a21 * s; o[6] = a12 * c + a22 * s; o[7] = a13 * c + a23 * s;
      o[8] = a20 * c - a10 * s; o[9] = a21 * c - a11 * s; o[10] = a22 * c - a12 * s; o[11] = a23 * c - a13 * s;
    }

    function canMove(nx, nz) {
      if (nx * nx + nz * nz > WORLD_R * WORLD_R) return false;
      for (var i = 0; i < colliders.length; i++) { var c = colliders[i]; var dx = nx - c.x, dz = nz - c.z; var rr = c.r + 0.5; if (dx * dx + dz * dz < rr * rr) return false; }
      return true;
    }

    function update(dt) {
      t += dt;
      if (modalOpen()) { player.speed = 0; placePlayer(); updateChestTransforms(); return; }
      var mx = 0, mz = 0;
      if (keys.up) mz -= 1; if (keys.down) mz += 1; if (keys.left) mx -= 1; if (keys.right) mx += 1;
      if (joy.active) { mx += joy.x; mz += joy.y; }
      var len = Math.hypot(mx, mz);
      if (len > 0.1) {
        mx /= len; mz /= len;
        // camera basis on the ground plane
        var fwdX = Math.sin(cam.yaw), fwdZ = Math.cos(cam.yaw);   // away from camera
        var rightX = fwdZ, rightZ = -fwdX;                        // camera right
        // mz<0 is "up/forward"; mx>0 is "right"
        var wx = rightX * mx - fwdX * mz, wz = rightZ * mx - fwdZ * mz;
        player.angle = Math.atan2(wx, wz);
        player.speed = 1;
        var spd = 5.5 * dt;
        var nx = player.x + wx * spd, nz = player.z + wz * spd;
        if (canMove(nx, player.z)) player.x = nx;
        if (canMove(player.x, nz)) player.z = nz;
        player.bob += dt * 9;
        stepT += dt; if (stepT > 0.32) { stepT = 0; Sound.sfx('step'); }
      } else { player.speed = 0; }

      // camera smoothly orbits behind player facing
      var desiredYaw = cam.yaw; // free orbit via drag; default fixed
      cam.tx += (player.x - cam.tx) * clamp(dt * 6, 0, 1);
      cam.tz += (player.z - cam.tz) * clamp(dt * 6, 0, 1);

      // nearest chest for interaction
      nearChest = null; var bd = 2.4;
      for (var i = 0; i < chestObjs.length; i++) { var c = chestObjs[i]; var dx = c.x - player.x, dz = c.z - player.z; var d = Math.hypot(dx, dz); if (d < bd) { bd = d; nearChest = c; } }
      updatePrompt();

      placePlayer(); updateChestTransforms();

      // light orbits very slowly for living shadows
      if (!reducedMotion) { var ang = -0.6 + Math.sin(t * 0.03) * 0.15; engine.setLight([Math.cos(ang) * 0.6, -0.85, Math.sin(ang) * 0.3 - 0.4], engine.lightColor, engine.ambient); }
      engine.updateLightVP([0, 2, -2], 26);
    }

    function worldToScreen(x, y, z) {
      var clip = [0, 0, 0, 0];
      var vp = M.mul(M.create(), engine.proj, engine.view);
      var w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
      var sx = (vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w;
      var sy = (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w;
      return { x: (sx * 0.5 + 0.5) * window.innerWidth, y: (-sy * 0.5 + 0.5) * window.innerHeight, behind: w < 0 };
    }

    var prompt = $('#prompt');
    function updatePrompt() {
      if (nearChest && !modalOpen()) {
        var s = worldToScreen(nearChest.x, 2.1, nearChest.z);
        if (s.behind) { prompt.classList.add('hidden'); return; }
        prompt.style.left = s.x + 'px'; prompt.style.top = s.y + 'px';
        prompt.querySelector('.prompt-text').textContent = nearChest.open ? 'Read again' : 'Open';
        prompt.classList.remove('hidden');
        if (ui.btnInteract) ui.btnInteract.classList.add('pulsing');
      } else { prompt.classList.add('hidden'); if (ui.btnInteract) ui.btnInteract.classList.remove('pulsing'); }
    }

    function interact() {
      if (modalOpen() || !nearChest) return;
      openChest(nearChest);
    }

    function cameraEye() {
      var dist = cam.dist, h = cam.height;
      var ex = cam.tx + Math.sin(cam.yaw) * -dist;
      var ez = cam.tz + Math.cos(cam.yaw) * -dist;
      return [ex, h, ez];
    }

    function render() {
      engine.resize();
      var eye = cameraEye();
      var target = [cam.tx, 2.2, cam.tz];
      engine.render(eye, target, 0.92, 0.5, 120);
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now;
      update(dt); render();
      raf = requestAnimationFrame(loop);
    }

    function setupLighting() {
      engine.setLight([0.5, -0.85, -0.3], [1.0, 0.86, 0.72], [0.42, 0.36, 0.48]); // warm dusk sun + cool ambient
      engine.setFog([0.52, 0.36, 0.52], 28, 80); // dusk purple haze
    }

    function start() {
      if (!engine) { if (!tryInit()) { fallbackMode = true; return false; } }
      if (!statics) { setupLighting(); buildStatics(); buildChests(); buildPlayer(); }
      player.x = 0; player.z = 11; player.angle = Math.PI; cam.tx = 0; cam.tz = 11; cam.yaw = Math.PI;
      engine.resize();
      running = true; lastT = performance.now(); if (!raf) raf = requestAnimationFrame(loop);
      return true;
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    function resetWorld() { player.x = 0; player.z = 11; player.angle = Math.PI; cam.yaw = Math.PI; cam.tx = 0; cam.tz = 11; syncChests(); }

    function setKey(n, v) { keys[n] = v; }
    function setJoy(x, y, a) { joy.x = x; joy.y = y; joy.active = a; }
    function orbit(dYaw) { cam.yaw += dYaw; }
    function zoom(d) { cam.dist = clamp(cam.dist + d, 6, 18); cam.height = clamp(cam.height + d * 0.5, 4.5, 13); }

    window.addEventListener('resize', function () { if (engine) engine.resize(); });

    return {
      start: start, stop: stop, resetWorld: resetWorld, syncChests: syncChests,
      setKey: setKey, setJoy: setJoy, interact: interact, orbit: orbit, zoom: zoom,
      isFallback: function () { return fallbackMode; }, nearId: function () { return nearChest && nearChest.id; }
    };
  })();

  /* =========================================================
     UI: gift modal / progress / ending / menu  (shared DOM)
     ========================================================= */
  var ui = {
    title: $('#screen-title'), game: $('#screen-game'),
    progressText: $('#progress-text'), progressFill: $('#progress-fill'), progressBar: $('#progress-bar'),
    modal: $('#gift-modal'), giftCanvas: $('#gift-canvas'), giftNumber: $('#gift-number'),
    giftName: $('#gift-name'), giftMessage: $('#gift-message'), giftClose: $('#btn-gift-close'),
    ending: $('#ending'), treasureRow: $('#treasure-row'), btnEnding: $('#btn-ending'),
    btnSound: $('#btn-sound'), hint: $('#title-hint'), live: $('#live'),
    menu: $('#menu'), menuProgress: $('#menu-progress'), menuMap: $('#menu-map'),
    btnInteract: $('#btn-interact'), touch: $('#touch-controls')
  };
  var busy = false, typeTimer = null, endingTimer = null, risingTimer = null, pendingEnding = false;
  function modalOpen() { return !ui.modal.hidden || !ui.ending.hidden || !ui.menu.hidden; }
  function showScreen(name) { ui.title.classList.toggle('active', name === 'title'); ui.game.classList.toggle('active', name === 'game'); }

  function updateProgress() {
    var n = state.opened.length;
    ui.progressText.textContent = n + '/8 Gifts Discovered';
    ui.progressFill.style.width = (n / 8 * 100) + '%';
    ui.progressBar.setAttribute('aria-valuenow', n);
    ui.btnEnding.classList.toggle('hidden', !allFound());
  }

  function openChest(c) {
    if (busy) return;
    var gift = GIFTS[c.id - 1];
    if (c.open || isOpened(c.id)) { openGiftModal(gift, false); return; }
    busy = true; Sound.sfx('creak');
    c.open = true; c.lidTarget = -1.9; c.glow.visible = true;
    setTimeout(function () {
      if (!isOpened(c.id)) state.opened.push(c.id);
      saveState(); updateProgress(); World3D.syncChests();
      Sound.sfx('open'); busy = false;
      openGiftModal(gift, allFound());
    }, reducedMotion ? 0 : 480);
  }

  function openGiftModal(gift, isFinal) {
    pendingEnding = isFinal;
    ui.modal.classList.toggle('final', isFinal);
    ui.giftNumber.textContent = isFinal ? '✨ The final treasure #' + gift.id + ' ✨' : 'Treasure #' + gift.id;
    ui.giftName.textContent = gift.name + ' ' + gift.emoji;
    ui.giftClose.textContent = isFinal ? 'SEE THE MAGIC ✨' : 'CONTINUE ♡';
    drawSprite(ui.giftCanvas, gift.sprite, true);
    ui.giftCanvas.className = 'gift-sprite pixel'; void ui.giftCanvas.offsetWidth; ui.giftCanvas.classList.add(gift.anim);
    ui.modal.hidden = false; ui.giftClose.focus();
    typeMessage(gift.message); ui.live.textContent = gift.name + '. ' + gift.message;
    Sound.sfx(isFinal ? 'final' : 'found');
    var cx = innerWidth / 2, cy = innerHeight / 2 - 80;
    setTimeout(function () { burst(cx, cy, { chars: gift.fx.chars, colors: gift.fx.colors, count: isFinal ? 40 : 22, spread: isFinal ? 280 : 180 }); }, 250);
    if (isFinal) { flash(); setTimeout(function () { burst(cx, cy, { chars: ['♥', '★', '✦'], colors: ['#ffd23f', '#ff8fb8', '#b79cff'], count: 36, spread: 320 }); }, 900); clearTimeout(endingTimer); endingTimer = setTimeout(closeGiftModal, CONFIG.endingAutoDelay * 1000); }
  }

  function typeMessage(text) { clearInterval(typeTimer); var el = ui.giftMessage; if (reducedMotion) { el.textContent = '“' + text + '”'; return; }
    var full = '“' + text + '”', i = 0; el.textContent = ''; typeTimer = setInterval(function () { i++; el.textContent = full.slice(0, i); if (i >= full.length) clearInterval(typeTimer); }, 28); }

  function closeGiftModal() { if (ui.modal.hidden) return; clearInterval(typeTimer); clearTimeout(endingTimer); ui.modal.hidden = true; Sound.sfx('click'); if (pendingEnding) { pendingEnding = false; showEnding(); } }

  function showEnding() {
    ui.treasureRow.innerHTML = '';
    GIFTS.forEach(function (g) { var c = document.createElement('canvas'); c.className = 'pixel'; c.title = g.name; drawSprite(c, g.sprite, true); ui.treasureRow.appendChild(c); });
    ui.ending.hidden = false; ui.ending.querySelector('.ending-content').scrollTop = 0; $('#btn-play-again').focus();
    Fireworks.start(); Sound.sfx('final'); clearInterval(risingTimer);
    if (!reducedMotion) risingTimer = setInterval(function () { rising(['♥', '★', '♡', '✦'], ['#ff8fb8', '#ffd23f', '#ffffff', '#b79cff']); }, lowPower ? 700 : 350);
  }
  function hideEnding() { ui.ending.hidden = true; Fireworks.stop(); clearInterval(risingTimer); fxLayer.innerHTML = ''; }

  function openMenu() { buildMenuMap(); ui.menuProgress.textContent = state.opened.length + '/8 treasures found'; ui.menu.hidden = false; $('#btn-resume').focus(); Sound.sfx('click'); }
  function closeMenu() { ui.menu.hidden = true; Sound.sfx('click'); }
  function buildMenuMap() {
    ui.menuMap.innerHTML = '';
    GIFTS.forEach(function (g) {
      var slot = document.createElement('div'); var open = isOpened(g.id); slot.className = 'slot' + (open ? '' : ' locked');
      var c = document.createElement('canvas'); c.className = 'pixel';
      var LOCKED = ['..kkkkk..', '.kyyyyyk.', 'kyk...kyk', 'kk....kyk', '.....kyk.', '....kyk..', '....kk...', '....ky...', '....kk...'];
      drawSprite(c, open ? g.sprite : LOCKED, true); slot.appendChild(c);
      var label = document.createElement('span'); label.textContent = open ? g.name : '# ' + g.id + ' ???'; slot.appendChild(label);
      ui.menuMap.appendChild(slot);
    });
  }

  function playAgain() { Sound.sfx('click'); state.completions += 1; state.opened = []; saveState(); hideEnding(); updateProgress(); World3D.resetWorld(); showScreen('game'); }
  function resetProgress() { if (!window.confirm('Reset all progress? Every chest will be closed again.')) return; Sound.sfx('click'); state.opened = []; state.completions = 0; saveState(); hideEnding(); ui.modal.hidden = true; ui.menu.hidden = true; pendingEnding = false; updateProgress(); World3D.resetWorld(); showScreen('title'); World3D.stop(); }
  function updateSoundButton() { ui.btnSound.classList.toggle('muted', state.muted); ui.btnSound.setAttribute('aria-label', state.muted ? 'Unmute music' : 'Mute music'); ui.btnSound.setAttribute('aria-pressed', String(state.muted)); }

  /* ---------------- INPUT ---------------- */
  var KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  function wireKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!ui.modal.hidden) { closeGiftModal(); return; } if (!ui.menu.hidden) { closeMenu(); return; } if (ui.game.classList.contains('active')) { openMenu(); return; } }
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') && ui.game.classList.contains('active') && !modalOpen()) { e.preventDefault(); World3D.interact(); return; }
      if (e.key === 'q' || e.key === 'Q') World3D.orbit(-0.12);
      if (e.key === 'r' || e.key === 'R') World3D.orbit(0.12);
      var m = KEYMAP[e.key]; if (m) { World3D.setKey(m, true); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1) e.preventDefault(); }
    });
    document.addEventListener('keyup', function (e) { var m = KEYMAP[e.key]; if (m) World3D.setKey(m, false); });
    window.addEventListener('blur', function () { ['up', 'down', 'left', 'right'].forEach(function (k) { World3D.setKey(k, false); }); });
  }

  function touchWanted() { return isTouch || Math.min(innerWidth, innerHeight) < 640; }
  function wireTouch() {
    ui.touch.classList.toggle('on', touchWanted());
    window.addEventListener('resize', function () { ui.touch.classList.toggle('on', touchWanted()); });
    var joyEl = $('#joystick'), knob = $('#joystick-knob'), active = false, cxp = 0, cyp = 0, R = 50, id = null;
    function s(e) { var tt = e.changedTouches ? e.changedTouches[0] : e; var r = joyEl.getBoundingClientRect(); cxp = r.left + r.width / 2; cyp = r.top + r.height / 2; active = true; id = e.changedTouches ? tt.identifier : 'm'; mv(e); e.preventDefault(); }
    function mv(e) { if (!active) return; var tt = null; if (e.changedTouches) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === id) tt = e.changedTouches[i]; if (!tt) return; } else tt = e; var dx = tt.clientX - cxp, dy = tt.clientY - cyp; var d = Math.hypot(dx, dy); if (d > R) { dx = dx / d * R; dy = dy / d * R; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; World3D.setJoy(dx / R, dy / R, true); e.preventDefault(); }
    function en() { active = false; id = null; knob.style.transform = ''; World3D.setJoy(0, 0, false); }
    joyEl.addEventListener('touchstart', s, { passive: false }); joyEl.addEventListener('touchmove', mv, { passive: false }); joyEl.addEventListener('touchend', en); joyEl.addEventListener('touchcancel', en);
    joyEl.addEventListener('mousedown', s); window.addEventListener('mousemove', function (e) { if (active) mv(e); }); window.addEventListener('mouseup', en);
    ui.btnInteract.addEventListener('touchstart', function (e) { e.preventDefault(); World3D.interact(); }, { passive: false });
    ui.btnInteract.addEventListener('click', function (e) { e.preventDefault(); World3D.interact(); });

    // drag on the scene to orbit the camera; wheel to zoom
    var sc = $('#scene'), dragging = false, lastX = 0;
    sc.addEventListener('mousedown', function (e) { dragging = true; lastX = e.clientX; });
    window.addEventListener('mousemove', function (e) { if (dragging) { World3D.orbit((e.clientX - lastX) * 0.006); lastX = e.clientX; } });
    window.addEventListener('mouseup', function () { dragging = false; });
    sc.addEventListener('wheel', function (e) { World3D.zoom(e.deltaY > 0 ? 0.6 : -0.6); e.preventDefault(); }, { passive: false });
    // two-finger drag to orbit on touch
    var tLastX = null;
    sc.addEventListener('touchmove', function (e) { if (e.touches.length === 2) { var x = e.touches[0].clientX; if (tLastX !== null) World3D.orbit((x - tLastX) * 0.006); tLastX = x; e.preventDefault(); } }, { passive: false });
    sc.addEventListener('touchend', function () { tLastX = null; });
  }

  /* ---------------- INIT ---------------- */
  function startGame() {
    Sound.startMusic(); Sound.sfx('open');
    var ok = World3D.start();
    if (!ok) { showFallback(); return; }
    showScreen('game');
  }

  function showFallback() {
    // WebGL2 is required for the 3D world (supported by virtually all browsers
    // since 2021). If it is unavailable, let the player know kindly.
    ui.hint.textContent = 'This 3D kingdom needs WebGL. Please open it in a newer browser or device. ♡';
  }

  function init() {
    loadState(); buildSky(); updateProgress(); updateSoundButton();
    var n = state.opened.length;
    ui.hint.textContent = n === 0 ? '' : (allFound() ? 'All 8 treasures found ♡ explore again anytime' : 'Welcome back! ' + n + '/8 treasures already found');

    $('#btn-start').addEventListener('click', startGame);
    ui.giftClose.addEventListener('click', closeGiftModal);
    ui.modal.addEventListener('click', function (e) { if (e.target === ui.modal) closeGiftModal(); });
    ui.btnEnding.addEventListener('click', function () { Sound.sfx('click'); showEnding(); });
    $('#btn-play-again').addEventListener('click', playAgain);
    $('#btn-reset').addEventListener('click', resetProgress);
    $('#btn-reset-hud').addEventListener('click', openMenu);
    $('#btn-resume').addEventListener('click', closeMenu);
    $('#btn-menu-reset').addEventListener('click', resetProgress);
    ui.menu.addEventListener('click', function (e) { if (e.target === ui.menu) closeMenu(); });
    ui.btnSound.addEventListener('click', function () { state.muted = !state.muted; saveState(); updateSoundButton(); Sound.setMuted(state.muted); Sound.sfx('click'); });

    wireKeyboard(); wireTouch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
