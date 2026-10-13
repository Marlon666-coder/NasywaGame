/* =========================================================
   engine3d.js — a tiny self-contained 3D engine on WebGL2.
   No dependencies. Provides: vector/matrix math, a shader
   program with Phong-ish lighting + a shadow map, mesh &
   instanced-mesh helpers, and a free/follow camera.
   Everything here is plain ES5-ish so it runs anywhere.
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------------- MATH: mat4 & vec3 ---------------- */
  var M = {
    create: function () { var o = new Float32Array(16); o[0] = o[5] = o[10] = o[15] = 1; return o; },
    identity: function (o) { o[0] = 1; o[1] = 0; o[2] = 0; o[3] = 0; o[4] = 0; o[5] = 1; o[6] = 0; o[7] = 0; o[8] = 0; o[9] = 0; o[10] = 1; o[11] = 0; o[12] = 0; o[13] = 0; o[14] = 0; o[15] = 1; return o; },
    mul: function (o, a, b) {
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      for (var i = 0; i < 4; i++) {
        var b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
        o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      }
      return o;
    },
    perspective: function (o, fovy, aspect, near, far) {
      var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      o[0] = f / aspect; o[1] = 0; o[2] = 0; o[3] = 0;
      o[4] = 0; o[5] = f; o[6] = 0; o[7] = 0;
      o[8] = 0; o[9] = 0; o[10] = (far + near) * nf; o[11] = -1;
      o[12] = 0; o[13] = 0; o[14] = 2 * far * near * nf; o[15] = 0; return o;
    },
    ortho: function (o, l, r, b, t, n, f) {
      var lr = 1 / (l - r), bt = 1 / (b - t), nf = 1 / (n - f);
      o[0] = -2 * lr; o[1] = 0; o[2] = 0; o[3] = 0;
      o[4] = 0; o[5] = -2 * bt; o[6] = 0; o[7] = 0;
      o[8] = 0; o[9] = 0; o[10] = 2 * nf; o[11] = 0;
      o[12] = (l + r) * lr; o[13] = (t + b) * bt; o[14] = (f + n) * nf; o[15] = 1; return o;
    },
    lookAt: function (o, eye, center, up) {
      var ex = eye[0], ey = eye[1], ez = eye[2];
      var zx = ex - center[0], zy = ey - center[1], zz = ez - center[2];
      var zl = 1 / Math.hypot(zx, zy, zz); zx *= zl; zy *= zl; zz *= zl;
      var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
      var xl = Math.hypot(xx, xy, xz); if (!xl) { xx = 0; xy = 0; xz = 0; } else { xl = 1 / xl; xx *= xl; xy *= xl; xz *= xl; }
      var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0;
      o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0;
      o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
      o[12] = -(xx * ex + xy * ey + xz * ez);
      o[13] = -(yx * ex + yy * ey + yz * ez);
      o[14] = -(zx * ex + zy * ey + zz * ez); o[15] = 1; return o;
    },
    translate: function (o, a, x, y, z) {
      if (a !== o) for (var i = 0; i < 12; i++) o[i] = a[i];
      o[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      o[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      o[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      o[15] = a[3] * x + a[7] * y + a[11] * z + a[15]; return o;
    },
    scale: function (o, a, x, y, z) {
      o[0] = a[0] * x; o[1] = a[1] * x; o[2] = a[2] * x; o[3] = a[3] * x;
      o[4] = a[4] * y; o[5] = a[5] * y; o[6] = a[6] * y; o[7] = a[7] * y;
      o[8] = a[8] * z; o[9] = a[9] * z; o[10] = a[10] * z; o[11] = a[11] * z;
      o[12] = a[12]; o[13] = a[13]; o[14] = a[14]; o[15] = a[15]; return o;
    },
    rotateY: function (o, a, rad) {
      var s = Math.sin(rad), c = Math.cos(rad);
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      if (a !== o) { o[4] = a[4]; o[5] = a[5]; o[6] = a[6]; o[7] = a[7]; o[12] = a[12]; o[13] = a[13]; o[14] = a[14]; o[15] = a[15]; }
      o[0] = a00 * c - a20 * s; o[1] = a01 * c - a21 * s; o[2] = a02 * c - a22 * s; o[3] = a03 * c - a23 * s;
      o[8] = a00 * s + a20 * c; o[9] = a01 * s + a21 * c; o[10] = a02 * s + a22 * c; o[11] = a03 * s + a23 * c; return o;
    },
    invert: function (o, a) {
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return o; det = 1 / det;
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return o;
    },
    // normal matrix (transpose of inverse upper 3x3) packed as mat3 in a mat4-less Float32Array(9)
    normalFromMat4: function (out, a) {
      var inv = M.invert(M.create(), a);
      out[0] = inv[0]; out[1] = inv[4]; out[2] = inv[8];
      out[3] = inv[1]; out[4] = inv[5]; out[5] = inv[9];
      out[6] = inv[2]; out[7] = inv[6]; out[8] = inv[10]; return out;
    }
  };

  var V = {
    sub: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
    norm: function (a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  };

  /* ---------------- SHADERS ---------------- */
  // Main pass: vertex colour + directional light + shadow + simple fog.
  var VS = [
    '#version 300 es',
    'in vec3 aPos; in vec3 aNormal; in vec3 aColor;',
    'uniform mat4 uProj, uView, uModel; uniform mat3 uNormalMat; uniform mat4 uLightVP;',
    'out vec3 vNormal; out vec3 vColor; out vec3 vWorld; out vec4 vLightPos;',
    'void main(){',
    '  vec4 wp = uModel * vec4(aPos,1.0);',
    '  vWorld = wp.xyz;',
    '  vNormal = normalize(uNormalMat * aNormal);',
    '  vColor = aColor;',
    '  vLightPos = uLightVP * wp;',
    '  gl_Position = uProj * uView * wp;',
    '}'
  ].join('\n');

  var FS = [
    '#version 300 es', 'precision highp float;',
    'in vec3 vNormal; in vec3 vColor; in vec3 vWorld; in vec4 vLightPos;',
    'uniform vec3 uLightDir; uniform vec3 uLightColor; uniform vec3 uAmbient;',
    'uniform vec3 uCamPos; uniform vec3 uFogColor; uniform float uFogNear, uFogFar;',
    'uniform sampler2D uShadowMap; uniform float uEmissive; uniform float uGlow;',
    'out vec4 frag;',
    'float shadowCalc(vec4 lp, float ndl){',
    '  vec3 p = lp.xyz/lp.w * 0.5 + 0.5;',
    '  if(p.z>1.0) return 1.0;',
    '  float bias = max(0.0025*(1.0-ndl), 0.0008);',
    '  float sh = 0.0; vec2 tx = vec2(1.0/2048.0);',
    '  for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++){',
    '     float d = texture(uShadowMap, p.xy + vec2(x,y)*tx).r;',
    '     sh += (p.z - bias > d) ? 0.0 : 1.0; }',
    '  return sh/9.0;',
    '}',
    'void main(){',
    '  vec3 N = normalize(vNormal);',
    '  if(!gl_FrontFacing) N = -N;',  // two-sided: flip normal on back faces
    '  float ndl = max(dot(N, -uLightDir), 0.0);',
    '  float sh = shadowCalc(vLightPos, ndl);',
    '  vec3 diff = uLightColor * ndl * (0.35 + 0.65*sh);',
    '  vec3 V = normalize(uCamPos - vWorld);',
    '  vec3 H = normalize(-uLightDir + V);',
    '  float spec = pow(max(dot(N,H),0.0), 24.0) * ndl * sh * 0.25;',
    '  vec3 col = vColor * (uAmbient + diff) + vec3(spec);',
    '  col = mix(col, vColor, uEmissive);',  // emissive objects ignore light
    '  col += vColor * uGlow;',              // extra glow
    '  float dist = length(uCamPos - vWorld);',
    '  float fog = clamp((dist - uFogNear)/(uFogFar - uFogNear), 0.0, 1.0);',
    '  col = mix(col, uFogColor, fog*0.85);',
    '  frag = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // Depth-only pass for the shadow map.
  var SHADOW_VS = ['#version 300 es', 'in vec3 aPos; uniform mat4 uLightVP, uModel;',
    'void main(){ gl_Position = uLightVP * uModel * vec4(aPos,1.0); }'].join('\n');
  var SHADOW_FS = ['#version 300 es', 'precision highp float; void main(){}'].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src);
    return s;
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  /* ---------------- ENGINE ---------------- */
  function Engine(canvas) {
    var gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl; this.canvas = canvas;
    gl.enable(gl.DEPTH_TEST);
    // Culling disabled: our procedural meshes don't guarantee consistent winding,
    // so we draw both faces to avoid "holes". (Double-sided is cheap at this scale.)
    gl.disable(gl.CULL_FACE);

    this.prog = program(gl, VS, FS);
    this.shadowProg = program(gl, SHADOW_VS, SHADOW_FS);
    this.u = {};
    ['uProj', 'uView', 'uModel', 'uNormalMat', 'uLightVP', 'uLightDir', 'uLightColor', 'uAmbient',
      'uCamPos', 'uFogColor', 'uFogNear', 'uFogFar', 'uShadowMap', 'uEmissive', 'uGlow'].forEach(function (n) {
      this.u[n] = gl.getUniformLocation(this.prog, n);
    }, this);
    this.su = { uLightVP: gl.getUniformLocation(this.shadowProg, 'uLightVP'), uModel: gl.getUniformLocation(this.shadowProg, 'uModel') };

    this.aPos = gl.getAttribLocation(this.prog, 'aPos');
    this.aNormal = gl.getAttribLocation(this.prog, 'aNormal');
    this.aColor = gl.getAttribLocation(this.prog, 'aColor');
    this.saPos = gl.getAttribLocation(this.shadowProg, 'aPos');

    this._initShadow(2048);

    this.proj = M.create(); this.view = M.create();
    this.lightVP = M.create();
    this.normalMat = new Float32Array(9);
    this.objects = [];
  }

  Engine.prototype._initShadow = function (size) {
    var gl = this.gl; this.shadowSize = size;
    this.shadowTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, size, size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.shadowFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  /** Build a mesh from positions/normals/colors (Float32Array) + indices (Uint16/32Array). */
  Engine.prototype.mesh = function (data) {
    var gl = this.gl;
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    function buf(loc, arr, size) {
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); return b;
    }
    buf(this.aPos, data.pos, 3);
    buf(this.aNormal, data.normal, 3);
    buf(this.aColor, data.color, 3);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    var use32 = data.pos.length / 3 > 65535;
    var idx = use32 ? new Uint32Array(data.index) : new Uint16Array(data.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return { vao: vao, count: idx.length, type: use32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
  };

  /** Register an object { mesh, model(mat4), emissive, glow, castsShadow, visible, noCull } */
  Engine.prototype.add = function (obj) {
    obj.model = obj.model || M.create();
    obj.emissive = obj.emissive || 0; obj.glow = obj.glow || 0;
    if (obj.castsShadow === undefined) obj.castsShadow = true;
    obj.visible = obj.visible !== false;
    this.objects.push(obj); return obj;
  };

  Engine.prototype.setLight = function (dir, color, ambient) {
    this.lightDir = V.norm(dir); this.lightColor = color; this.ambient = ambient;
  };
  Engine.prototype.setFog = function (color, near, far) { this.fogColor = color; this.fogNear = near; this.fogFar = far; };

  Engine.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.floor(this.canvas.clientWidth * dpr), h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  };

  Engine.prototype._renderObjects = function (prog, uModel, shadowPass) {
    var gl = this.gl;
    for (var i = 0; i < this.objects.length; i++) {
      var o = this.objects[i];
      if (!o.visible) continue;
      if (shadowPass && !o.castsShadow) continue;
      gl.uniformMatrix4fv(uModel, false, o.model);
      if (!shadowPass) {
        M.normalFromMat4(this.normalMat, o.model);
        gl.uniformMatrix3fv(this.u.uNormalMat, false, this.normalMat);
        gl.uniform1f(this.u.uEmissive, o.emissive);
        gl.uniform1f(this.u.uGlow, o.glow);
      }
      gl.bindVertexArray(o.mesh.vao);
      gl.drawElements(gl.TRIANGLES, o.mesh.count, o.mesh.type, 0);
    }
    gl.bindVertexArray(null);
  };

  /** Compute an orthographic light view-projection that covers the scene box. */
  Engine.prototype.updateLightVP = function (center, radius) {
    var d = this.lightDir;
    var eye = [center[0] - d[0] * radius * 2, center[1] - d[1] * radius * 2, center[2] - d[2] * radius * 2];
    var lv = M.lookAt(M.create(), eye, center, [0, 1, 0]);
    var lp = M.ortho(M.create(), -radius, radius, -radius, radius, 0.1, radius * 4.5);
    M.mul(this.lightVP, lp, lv);
  };

  Engine.prototype.render = function (camPos, camTarget, fov, near, far) {
    var gl = this.gl;
    // ---- shadow pass ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.viewport(0, 0, this.shadowSize, this.shadowSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.shadowProg);
    gl.uniformMatrix4fv(this.su.uLightVP, false, this.lightVP);
    // bind shadow attrib layout: our VAOs expose aPos at location saPos==aPos (same 0)
    this._renderObjects(this.shadowProg, this.su.uModel, true);

    // ---- main pass ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    var fc = this.fogColor;
    gl.clearColor(fc[0], fc[1], fc[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);
    M.perspective(this.proj, fov, this.canvas.width / this.canvas.height, near, far);
    M.lookAt(this.view, camPos, camTarget, [0, 1, 0]);
    gl.uniformMatrix4fv(this.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(this.u.uView, false, this.view);
    gl.uniformMatrix4fv(this.u.uLightVP, false, this.lightVP);
    gl.uniform3fv(this.u.uLightDir, this.lightDir);
    gl.uniform3fv(this.u.uLightColor, this.lightColor);
    gl.uniform3fv(this.u.uAmbient, this.ambient);
    gl.uniform3fv(this.u.uCamPos, camPos);
    gl.uniform3fv(this.u.uFogColor, this.fogColor);
    gl.uniform1f(this.u.uFogNear, this.fogNear);
    gl.uniform1f(this.u.uFogFar, this.fogFar);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.uniform1i(this.u.uShadowMap, 0);
    this._renderObjects(this.prog, this.u.uModel, false);
  };

  global.Engine3D = { Engine: Engine, mat4: M, vec3: V };
})(window);
