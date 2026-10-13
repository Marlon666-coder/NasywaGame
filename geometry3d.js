/* =========================================================
   geometry3d.js — procedural mesh builders + a Builder that
   merges many coloured primitives into one mesh (so the whole
   castle is drawn in a single draw call).
   ========================================================= */
(function (global) {
  'use strict';

  function hex(c) { // '#rrggbb' -> [r,g,b] 0..1
    return [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255];
  }

  /** Accumulates geometry; call .box/.cone/... then .build(engine). */
  function Builder() { this.pos = []; this.nor = []; this.col = []; this.idx = []; this._base = 0; }

  Builder.prototype._push = function (verts, norms, color) {
    var c = typeof color === 'string' ? hex(color) : color;
    var base = this.pos.length / 3;
    for (var i = 0; i < verts.length; i += 3) {
      this.pos.push(verts[i], verts[i + 1], verts[i + 2]);
      this.nor.push(norms[i], norms[i + 1], norms[i + 2]);
      this.col.push(c[0], c[1], c[2]);
    }
    return base;
  };

  // Axis-aligned box centred at (x,y,z) with size (w,h,d).
  Builder.prototype.box = function (x, y, z, w, h, d, color, shade) {
    var hw = w / 2, hh = h / 2, hd = d / 2;
    var faces = [
      // +X
      [[x + hw, y - hh, z - hd], [x + hw, y - hh, z + hd], [x + hw, y + hh, z + hd], [x + hw, y + hh, z - hd], [1, 0, 0]],
      // -X
      [[x - hw, y - hh, z + hd], [x - hw, y - hh, z - hd], [x - hw, y + hh, z - hd], [x - hw, y + hh, z + hd], [-1, 0, 0]],
      // +Y (top)
      [[x - hw, y + hh, z - hd], [x + hw, y + hh, z - hd], [x + hw, y + hh, z + hd], [x - hw, y + hh, z + hd], [0, 1, 0]],
      // -Y (bottom)
      [[x - hw, y - hh, z + hd], [x + hw, y - hh, z + hd], [x + hw, y - hh, z - hd], [x - hw, y - hh, z - hd], [0, -1, 0]],
      // +Z
      [[x + hw, y - hh, z + hd], [x - hw, y - hh, z + hd], [x - hw, y + hh, z + hd], [x + hw, y + hh, z + hd], [0, 0, 1]],
      // -Z
      [[x - hw, y - hh, z - hd], [x + hw, y - hh, z - hd], [x + hw, y + hh, z - hd], [x - hw, y + hh, z - hd], [0, 0, -1]]
    ];
    for (var f = 0; f < faces.length; f++) {
      var q = faces[f], n = q[4];
      // slightly shade side faces for depth if a shade colour is given
      var col = (shade && (f < 2 || f > 3)) ? shade : color;
      var verts = [].concat(q[0], q[1], q[2], q[3]);
      var norms = [n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]];
      var base = this._push(verts, norms, col);
      this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return this;
  };

  // Cone with base radius r, height h, centred base at (x,y,z), pointing +Y.
  Builder.prototype.cone = function (x, y, z, r, h, seg, color) {
    seg = seg || 12;
    var apex = [x, y + h, z];
    var ring = [];
    for (var i = 0; i < seg; i++) { var a = i / seg * Math.PI * 2; ring.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r]); }
    for (var j = 0; j < seg; j++) {
      var p0 = ring[j], p1 = ring[(j + 1) % seg];
      var ux = (p0[0] + p1[0]) / 2 - x, uz = (p0[2] + p1[2]) / 2 - z;
      var nl = Math.hypot(ux, h * 0.5, uz) || 1;
      var n = [ux / nl, (r / h) * 0.5 + 0.3, uz / nl];
      var verts = [].concat(p0, p1, apex);
      var norms = [n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]];
      var base = this._push(verts, norms, color);
      this.idx.push(base, base + 1, base + 2);
    }
    // base disc
    var bc = this._push([].concat([x, y, z]), [0, -1, 0], color);
    var ringBase = [];
    for (var k = 0; k < seg; k++) { ringBase.push(this._push([].concat(ring[k]), [0, -1, 0], color)); }
    for (var m = 0; m < seg; m++) this.idx.push(bc, ringBase[(m + 1) % seg], ringBase[m]);
    return this;
  };

  // Cylinder radius r, height h, base at (x,y,z), +Y.
  Builder.prototype.cylinder = function (x, y, z, r, h, seg, color) {
    seg = seg || 14;
    var ringB = [], ringT = [];
    for (var i = 0; i < seg; i++) { var a = i / seg * Math.PI * 2, cx = Math.cos(a), cz = Math.sin(a); ringB.push([x + cx * r, y, z + cz * r, cx, cz]); ringT.push([x + cx * r, y + h, z + cz * r, cx, cz]); }
    for (var j = 0; j < seg; j++) {
      var b0 = ringB[j], b1 = ringB[(j + 1) % seg], t0 = ringT[j], t1 = ringT[(j + 1) % seg];
      var verts = [b0[0], b0[1], b0[2], b1[0], b1[1], b1[2], t1[0], t1[1], t1[2], t0[0], t0[1], t0[2]];
      var norms = [b0[3], 0, b0[4], b1[3], 0, b1[4], t1[3], 0, t1[4], t0[3], 0, t0[4]];
      var base = this._push(verts, norms, color);
      this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    // top cap
    var tc = this._push([x, y + h, z], [0, 1, 0], color);
    var topRing = [];
    for (var k = 0; k < seg; k++) topRing.push(this._push([ringT[k][0], ringT[k][1], ringT[k][2]], [0, 1, 0], color));
    for (var m = 0; m < seg; m++) this.idx.push(tc, topRing[m], topRing[(m + 1) % seg]);
    return this;
  };

  // Low-poly sphere (icosphere-ish via lat/long) radius r centred (x,y,z).
  Builder.prototype.sphere = function (x, y, z, r, seg, color) {
    seg = seg || 10; var rings = Math.max(4, Math.round(seg * 0.6));
    var grid = [];
    for (var la = 0; la <= rings; la++) {
      var theta = la / rings * Math.PI, st = Math.sin(theta), ct = Math.cos(theta); var row = [];
      for (var lo = 0; lo <= seg; lo++) {
        var phi = lo / seg * Math.PI * 2, sp = Math.sin(phi), cp = Math.cos(phi);
        var nx = st * cp, ny = ct, nz = st * sp;
        row.push(this._push([x + nx * r, y + ny * r, z + nz * r], [nx, ny, nz], color));
      }
      grid.push(row);
    }
    for (var i = 0; i < rings; i++) for (var j = 0; j < seg; j++) {
      var a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
      this.idx.push(a, b, c, a, c, d);
    }
    return this;
  };

  // Flat quad on the XZ plane (ground), centred (x,y,z), size (w,d).
  Builder.prototype.ground = function (x, y, z, w, d, color) {
    var hw = w / 2, hd = d / 2;
    var verts = [x - hw, y, z - hd, x + hw, y, z - hd, x + hw, y, z + hd, x - hw, y, z + hd];
    var norms = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    var base = this._push(verts, norms, color);
    this.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    return this;
  };

  Builder.prototype.build = function (engine) {
    return engine.mesh({
      pos: new Float32Array(this.pos),
      normal: new Float32Array(this.nor),
      color: new Float32Array(this.col),
      index: this.idx
    });
  };
  Builder.prototype.vertexCount = function () { return this.pos.length / 3; };

  global.Geo3D = { Builder: Builder, hex: hex };
})(window);
