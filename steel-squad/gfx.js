// 스틸 스쿼드 그래픽: 도트 스프라이트·배경·지형을 코드로 그려서 캐시해 둔다.
const W = 480, H = 270, TW = 960;
const cache = new Map();
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
const rgbHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function sh(h, k) { let [r, g, b] = hexRgb(h); if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; } return rgbHex(r, g, b); }
export function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function box(g, x, y, w, h, c, k = 1) {
  R(g, x, y, w, h, c); R(g, x, y, w, 1, sh(c, .35 * k)); R(g, x, y + 1, 1, h - 1, sh(c, .18 * k));
  R(g, x, y + h - 1, w, 1, sh(c, -.42 * k)); R(g, x + w - 1, y + 1, 1, h - 2, sh(c, -.24 * k));
}
function rivet(g, x, y, c) { R(g, x, y, 1, 1, sh(c, .5)); R(g, x + 1, y + 1, 1, 1, sh(c, -.5)); }
function disc(g, cx, cy, r, c, light = true) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = x * x + y * y; if (d > r * r + r * .6) continue;
    let k = 0; if (light) { const l = (-x - y) / (r * 1.4); k = l > .45 ? .3 : l > .05 ? .1 : l < -.55 ? -.38 : l < -.2 ? -.18 : 0; }
    R(g, cx + x, cy + y, 1, 1, sh(c, k));
  }
}
function poly(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
function outline(c, col = '#140e0a') {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h), s = d.data, o = new Uint8ClampedArray(s), [r, gg, b] = hexRgb(col);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (s[i + 3] > 128) continue;
    if ((x > 0 && s[i - 1] > 128) || (x < w - 1 && s[i + 7] > 128) || (y > 0 && s[i - w * 4 + 3] > 128) || (y < h - 1 && s[i + w * 4 + 3] > 128)) { o[i] = r; o[i + 1] = gg; o[i + 2] = b; o[i + 3] = 255; }
  }
  d.data.set(o); g.putImageData(d, 0, 0); return c;
}
const whites = new WeakMap();
function white(c) { let w = whites.get(c); if (!w) { w = mk(c.width, c.height); const g = w.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; R(g, 0, 0, w.width, w.height, '#fff'); whites.set(c, w); } return w; }
// x: 세계 좌표의 기준선, ax: 캔버스 안의 기준선. flip이면 기준선을 축으로 좌우 반전.
function put(ctx, c, x, y, flip, ax, flash) {
  const img = flash ? white(c) : c; x = Math.round(x); y = Math.round(y);
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, -ax, y); ctx.restore(); }
  else ctx.drawImage(img, x - ax, y);
}
function once(key, w, h, fn, ol = true) { let c = cache.get(key); if (c) return c; c = mk(w, h); fn(c.getContext('2d'), c); if (ol) outline(c); cache.set(key, c); return c; }

// ───────── 총 ─────────
const GC = { g: '#24252b', G: '#4a4d58', m: '#9a9eaa', M: '#d6dae2', w: '#8a5a2c', W: '#56341a', y: '#d8a828', r: '#b8321c', o: '#f08020', b: '#2a5ac0', c: '#8af0ff' };
const GUNS = {
  P: ['GMmmmmG.', 'gggggggg', 'ggW.....', '.gW.....'],
  H: ['...mmmmmmmmmm.', 'GGGGGGGGGGGGGM', 'ggggggggggggggg', '..yyg.Wg.......', '......Wg.......'],
  S: ['MmmmmmmmmmmG.', 'gggggggggggggg', 'wwwwwg.GGGg...', 'WWW...........'],
  R: ['.GGGGGGGGGGGGG.', 'GMmmmmmmmmmmmmG', 'GgggggggggggggG', '.GGGg..Wg..GG..', '.......Wg......'],
  F: ['..oo..........', 'rrrr..GGGGGGGG.', 'rMmrGMmmmmmmmmG', 'rrrrggggggggggg', '.rr...Wg.......', '......Wg.......'],
  L: ['.bbbbbbbbbbbb..', 'GMmmmmmmmmmmcc.', 'ggggggggggggbcc', '..bg.Wg........', '.....Wg........'],
  E: ['....mmmmmmmmm.', 'wwwgggggggggggg', 'WW..gW.........', '....gW.........'],
  N: ['.......mmmmmmmmmmm', 'wwwwggggggggggggggg', 'WWW..gW..G........', '......gW..........'],
};
function gun(k) {
  return once('gun' + k, Math.max(...GUNS[k].map(r => r.length)), GUNS[k].length, g => GUNS[k].forEach((row, y) => [...row].forEach((ch, x) => { if (GC[ch]) R(g, x, y, 1, 1, GC[ch]); })), false);
}
function rot(g, img, x, y, r) {
  if (!r) { g.drawImage(img, x, y); return; }
  g.save(); g.translate(x, y); g.rotate(r * Math.PI / 2); g.drawImage(img, 0, 0); g.restore();
}

// ───────── 병사 (32×48, 발 기준선 40, 중심 14) ─────────
export function playerPal(slot) {
  const v = ['#3c62b8', '#b83c3c', '#3c8c4a', '#c8a030'][slot];
  return { id: 'p' + slot, cl: v, band: sh(v, -.1), pants: '#8a7a52', boot: '#4a3626', skin: '#f0c088', hair: ['#5a3a1a', '#2a1a10', '#8a5a2a', '#c89048'][slot], belt: '#5a4026', st: '#6a6a3a', shirt: '#d8d0b0' };
}
export function enemyPal(th, k) {
  const c = th.e[0], d = th.e[1];
  return { id: 'e' + th.n + k, cl: k === 2 ? '#a83a2a' : c, hat: k === 2 ? '#5a1a12' : d, band: '#8a1a1a', pants: sh(c, -.25), boot: '#2a2420', skin: '#e0b080', hair: '#2a1a10', belt: '#3a2a1a', st: sh(d, .2), shirt: sh(c, .4) };
}
function limb(g, x1, y1, x2, y2, c) {
  const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let i = 0; i <= n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n); R(g, x - 1, y, 3, 1, c); R(g, x - 1, y, 1, 1, sh(c, .22)); R(g, x + 1, y, 1, 1, sh(c, -.28)); }
}
function leg(g, hx, hy, a, b, c, bt) {
  const kx = hx + Math.sin(a) * 4, ky = hy + Math.cos(a) * 4, a2 = a - b, fx = kx + Math.sin(a2) * 3, fy = ky + Math.cos(a2) * 3;
  limb(g, hx, hy, kx, ky, c); limb(g, kx, ky, fx, fy, sh(c, -.08));
  const X = Math.round(fx), Y = Math.round(fy); R(g, X - 1, Y, 4, 2, bt); R(g, X - 1, Y, 3, 1, sh(bt, .3));
}
function legs(g, pose, f, pal) {
  const p = pal.pants, pd = sh(p, -.3), bt = pal.boot;
  if (pose === 'cr') {
    R(g, 9, 37, 7, 2, pd); R(g, 7, 38, 4, 2, sh(bt, -.2));
    R(g, 14, 36, 5, 2, p); R(g, 14, 36, 5, 1, sh(p, .2)); R(g, 17, 37, 3, 2, p); R(g, 17, 38, 5, 2, bt); R(g, 17, 38, 4, 1, sh(bt, .3));
    return;
  }
  let A, B;
  if (pose === 'run') { const ph = f / 6 * Math.PI * 2; A = [.8 * Math.sin(ph + Math.PI), .9 * Math.max(0, Math.cos(ph + Math.PI)) + .1]; B = [.8 * Math.sin(ph), .9 * Math.max(0, Math.cos(ph)) + .1]; }
  else if (pose === 'jmp') { A = [-.4, .9]; B = [.7, 1.3]; }
  else { A = [-.14, .05]; B = [.14, .05]; }
  leg(g, 12, 31, A[0], A[1], pd, sh(bt, -.2)); leg(g, 15, 31, B[0], B[1], p, bt);
}
function torso(g, x, y, pal) {
  const c = pal.cl;
  R(g, x + 1, y, 7, 7, c); R(g, x, y + 1, 9, 6, c);
  R(g, x + 1, y, 6, 1, sh(c, .32)); R(g, x, y + 1, 1, 4, sh(c, .2)); R(g, x + 7, y + 1, 2, 5, sh(c, -.32)); R(g, x + 1, y + 5, 7, 1, sh(c, -.18));
  R(g, x + 3, y, 3, 1, pal.shirt);
  for (let i = 0; i < 5; i++) R(g, x + 1 + i, y + i, 1, 1, pal.belt);
  box(g, x + 4, y + 2, 3, 3, pal.st, .8);
  R(g, x, y + 5, 9, 2, pal.belt); R(g, x, y + 5, 9, 1, sh(pal.belt, .25)); R(g, x + 5, y + 5, 2, 2, '#d8b048');
}
function head(g, x, y, pal, hat) {
  const s = pal.skin, sd = sh(s, -.22), hr = pal.hair;
  R(g, x + 2, y + 3, 7, 5, s); R(g, x + 3, y + 8, 5, 1, sd); R(g, x + 2, y + 3, 2, 4, hr); R(g, x + 4, y + 5, 1, 1, sd);
  R(g, x + 7, y + 4, 1, 2, '#1a1410'); R(g, x + 6, y + 4, 1, 1, sh(s, .25)); R(g, x + 9, y + 5, 1, 2, s); R(g, x + 6, y + 7, 2, 1, sd); R(g, x + 8, y + 7, 1, 1, sd);
  if (hat === 'band') {
    R(g, x + 2, y, 7, 3, hr); R(g, x + 3, y, 5, 1, sh(hr, .25));
    const b = pal.band; R(g, x + 1, y + 2, 9, 2, b); R(g, x + 2, y + 2, 7, 1, sh(b, .32)); R(g, x - 1, y + 3, 3, 1, b); R(g, x - 3, y + 4, 3, 2, sh(b, -.2)); R(g, x - 2, y + 6, 2, 1, sh(b, -.3));
  } else if (hat === 'helm') {
    const k = pal.hat; R(g, x + 3, y - 1, 5, 1, sh(k, .35)); R(g, x + 2, y, 7, 1, k); R(g, x + 1, y + 1, 9, 2, k); R(g, x + 2, y, 3, 2, sh(k, .3)); R(g, x + 7, y + 1, 3, 2, sh(k, -.25)); R(g, x, y + 3, 11, 1, sh(k, -.42));
  } else if (hat === 'cap') {
    const k = pal.hat; R(g, x + 2, y, 7, 3, k); R(g, x + 3, y, 4, 1, sh(k, .3)); R(g, x + 8, y + 2, 4, 1, sh(k, -.3));
  } else if (hat === 'mask') {
    const k = pal.hat; R(g, x + 2, y, 7, 3, k); R(g, x + 1, y + 1, 9, 2, k); R(g, x + 3, y, 4, 1, sh(k, .3)); R(g, x + 3, y + 6, 7, 3, sh(k, -.15)); R(g, x + 8, y + 7, 2, 2, '#333'); R(g, x + 6, y + 4, 3, 1, '#e03a2a'); R(g, x + 7, y + 4, 1, 1, '#ffb0a0');
  }
}
function arms(g, aim, wp, pal, oy, ex) {
  const c = pal.cl, s = pal.skin, sl = sh(c, .12);
  if (ex === 'gren') { R(g, 10, 22 + oy, 2, 4, sl); R(g, 10, 19 + oy, 2, 3, s); disc(g, 11, 17 + oy, 2, '#4a5a32'); R(g, 11, 14 + oy, 1, 1, '#c8a040'); R(g, 14, 26 + oy, 3, 4, sl); R(g, 15, 30 + oy, 2, 2, s); return; }
  if (ex === 'knife') { R(g, 14, 26 + oy, 4, 3, sl); R(g, 18, 27 + oy, 2, 2, s); R(g, 20, 26 + oy, 6, 1, '#e0e4ec'); R(g, 20, 27 + oy, 5, 1, '#8a8e98'); R(g, 19, 26 + oy, 1, 3, '#4a3020'); return; }
  const G = gun(wp);
  if (aim === 1) { R(g, 13, 23 + oy, 3, 4, sl); R(g, 13, 21 + oy, 3, 2, s); rot(g, G, 12, 24 + oy, -1); return; }
  if (aim === 2) { R(g, 14, 27 + oy, 3, 3, sl); R(g, 15, 30 + oy, 2, 2, s); rot(g, G, 19, 30 + oy, 1); return; }
  R(g, 13, 26 + oy, 4, 3, sl); R(g, 13, 26 + oy, 4, 1, sh(c, .35)); R(g, 17, 27 + oy, 2, 2, s); rot(g, G, 15, 25 + oy, 0);
  if (ex === 'shield') { box(g, 20, 17 + oy, 5, 23 - oy, '#8c96a0'); R(g, 21, 20 + oy, 3, 1, '#2a2a2a'); R(g, 21, 22 + oy, 3, 6, '#a8d0f0'); R(g, 21, 22 + oy, 1, 6, '#e0f0ff'); rivet(g, 21, 32 + oy, '#8c96a0'); rivet(g, 23, 35, '#8c96a0'); }
}
function manFrame(pal, pose, f, aim, wp, hat, ex) {
  return once(['man', pal.id, pose, f, aim, wp, hat, ex].join('|'), 32, 48, g => {
    const oy = pose === 'cr' ? 7 : 0;
    legs(g, pose, f, pal); torso(g, 9, 24 + oy, pal); head(g, 10, 16 + oy, pal, hat); arms(g, aim, wp, pal, oy, ex);
  });
}
// o: {x: 히트박스 왼쪽, y: 발, face, pose, f, aim, wp, pal, hat, ex, flash}
export function drawMan(ctx, o) { put(ctx, manFrame(o.pal, o.pose, o.f, o.aim, o.wp, o.hat || 'band', o.ex || ''), o.x + 6, o.y - 40, o.face < 0, 14, o.flash); }

// ───────── 기계 적 ─────────
function robot(th, fr) {
  return once('rob' + th.n + fr, 20, 20, g => {
    const c = th.e[0], d = th.e[1], up = fr ? 0 : 2;
    R(g, 6, 14 + up, 2, 6 - up, '#666'); R(g, 12, 14 + up, 2, 6 - up, '#666'); for (let y = 15 + up; y < 19; y += 2) { R(g, 5, y, 4, 1, '#999'); R(g, 11, y, 4, 1, '#999'); }
    R(g, 4, 18, 5, 2, d); R(g, 11, 18, 5, 2, d);
    box(g, 3, 4 + up, 14, 11, c); R(g, 5, 3 + up, 10, 2, sh(c, .25)); R(g, 9, 0 + up, 1, 3, '#888'); R(g, 8, 0 + up, 3, 1, '#e33');
    R(g, 5, 7 + up, 12, 4, '#1a1a22'); R(g, 12, 8 + up, 3, 2, '#ff3a2a'); R(g, 13, 8 + up, 1, 1, '#ffd0c0'); R(g, 6, 8 + up, 4, 1, '#3a3a50');
    rivet(g, 4, 12 + up, c); rivet(g, 15, 12 + up, c);
  });
}
function drone(th, fr) {
  return once('dro' + th.n + fr, 24, 16, g => {
    const c = th.e[0], d = th.e[1];
    R(g, fr ? 1 : 6, 1, fr ? 22 : 12, 1, '#c8c8c8'); R(g, 11, 1, 2, 3, '#555');
    box(g, 7, 3, 10, 4, d); box(g, 3, 6, 18, 5, c); R(g, 5, 7, 14, 1, sh(c, .3)); R(g, 1, 7, 3, 2, d); R(g, 20, 7, 3, 2, d);
    R(g, 9, 11, 6, 3, '#333'); R(g, 10, 12, 4, 2, '#5a4a2a'); R(g, 14, 8, 2, 2, '#ff3a2a');
  });
}
function turret(th) {
  return once('tur' + th.n, 26, 18, g => {
    const c = th.e[0], d = th.e[1];
    poly(g, [3, 18, 23, 18, 20, 11, 6, 11], sh(d, -.1)); R(g, 6, 11, 14, 1, sh(d, .3)); for (let x = 6; x < 21; x += 4) rivet(g, x, 14, d);
    disc(g, 13, 9, 6, c); R(g, 7, 9, 13, 2, sh(c, -.3));
    box(g, 17, 6, 9, 3, '#3a3c44'); R(g, 24, 5, 2, 5, '#24252b'); R(g, 11, 6, 3, 2, '#ff3a2a');
  });
}
function heli(th, fr) {
  return once('hel' + th.n + fr, 44, 24, g => {
    const c = th.e[0], d = th.e[1];
    R(g, fr ? 2 : 10, 1, fr ? 40 : 24, 1, '#d0d0d0'); R(g, fr ? 4 : 12, 2, fr ? 36 : 20, 1, '#8a8a8a'); R(g, 21, 2, 3, 4, '#444');
    R(g, 1, 9, 14, 3, d); R(g, 1, 9, 14, 1, sh(d, .3)); R(g, 0, fr ? 5 : 7, 2, fr ? 10 : 6, '#bbb');
    poly(g, [14, 6, 34, 6, 41, 11, 40, 16, 32, 18, 14, 16], c); R(g, 15, 6, 19, 1, sh(c, .35)); R(g, 14, 15, 26, 2, sh(c, -.35));
    poly(g, [33, 8, 40, 11, 39, 14, 33, 14], '#5a8ab0'); R(g, 34, 9, 3, 1, '#c0e8ff');
    R(g, 24, 9, 4, 3, sh(c, -.2)); rivet(g, 18, 10, c); rivet(g, 29, 13, c);
    R(g, 34, 17, 6, 2, '#2a2a2a'); R(g, 38, 18, 4, 1, '#24252b');
    R(g, 17, 21, 20, 1, '#333'); R(g, 20, 18, 1, 3, '#333'); R(g, 32, 18, 1, 3, '#333');
  });
}
function tank(th, fr) {
  return once('tnk' + th.n + fr, 40, 24, g => {
    const c = th.e[0], d = th.e[1];
    R(g, 2, 16, 36, 8, '#2a2826'); for (let x = 2 + fr * 2; x < 38; x += 4) R(g, x, 16, 2, 1, '#4a4642'); for (let x = 3 + fr * 2; x < 38; x += 4) R(g, x, 23, 2, 1, '#4a4642');
    for (let i = 0; i < 5; i++) disc(g, 7 + i * 6.5, 19, 2, '#5a5652');
    poly(g, [1, 16, 39, 16, 36, 9, 6, 9], c); R(g, 6, 9, 30, 1, sh(c, .35)); R(g, 2, 14, 36, 2, sh(c, -.3)); for (let x = 6; x < 36; x += 6) rivet(g, x, 12, c);
    box(g, 12, 3, 16, 7, d); R(g, 15, 1, 6, 2, sh(d, .1)); R(g, 27, 5, 13, 3, '#3a3c44'); R(g, 27, 5, 13, 1, '#6a6c74'); R(g, 13, 4, 3, 2, sh(d, .4));
  });
}
const SOLDIER = { 0: ['helm', 'E', ''], 1: ['cap', 'E', 'gren'], 2: ['band', 'E', 'knife'], 5: ['helm', 'P', 'shield'], 6: ['mask', 'N', ''] };
export function drawEnemy(ctx, e, th, tick, gone) {
  const fl = e.fl > 0, f = e.face, x = e.x, y = e.y;
  if (gone && tick % 4 < 2) return;
  const s = SOLDIER[e.t];
  if (s) {
    const pal = enemyPal(th, e.t), sn = e.t === 6;
    drawMan(ctx, { x, y: y + e.h, face: f, pose: sn ? 'cr' : e.mv ? 'run' : 'st', f: Math.floor(tick / 5) % 6, aim: 0, wp: s[1], pal, hat: s[0], ex: s[2], flash: fl });
    return;
  }
  const fr = Math.floor(tick / 3) % 2;
  if (e.t === 3) put(ctx, robot(th, e.mv ? 0 : fr && tick % 40 < 20 ? 1 : 0), x + 7, y + e.h - 20, f < 0, 10, fl);
  else if (e.t === 4) put(ctx, drone(th, fr), x + 8, y - 3, f < 0, 12, fl);
  else if (e.t === 7) put(ctx, turret(th), x + 8, y + e.h - 18, f < 0, 13, fl);
  else if (e.t === 8) put(ctx, heli(th, fr), x + 14, y - 6, f < 0, 22, fl);
  else if (e.t === 9) put(ctx, tank(th, e.mv ? fr : 0), x + 15, y + e.h - 24, f < 0, 20, fl);
}

// ───────── 보스 (왼쪽을 보고 그림, 여백 20) ─────────
const M = 20;
function plates(g, x, y, w, h, c, step = 16) { box(g, x, y, w, h, c); for (let px = x + step; px < x + w - 2; px += step) { R(g, px, y + 2, 1, h - 4, sh(c, -.35)); R(g, px + 1, y + 2, 1, h - 4, sh(c, .2)); } for (let px = x + 3; px < x + w - 3; px += step) { rivet(g, px, y + 2, c); rivet(g, px, y + h - 4, c); } }
const BOSS_ART = [
  (g, c, d, fr) => { // 중전차 96×56
    const X = M, Y = M;
    R(g, X, Y + 38, 96, 18, '#2a2826'); for (let x = X + (fr ? 3 : 0); x < X + 96; x += 6) { R(g, x, Y + 38, 3, 2, '#4e4a46'); R(g, x, Y + 54, 3, 2, '#4e4a46'); }
    for (let i = 0; i < 7; i++) { disc(g, X + 10 + i * 12.6, Y + 47, 5, '#5e5a54'); disc(g, X + 10 + i * 12.6, Y + 47, 2, '#8a857e', false); }
    poly(g, [X - 2, Y + 40, X + 98, Y + 40, X + 94, Y + 22, X + 10, Y + 22], c); R(g, X + 10, Y + 22, 84, 2, sh(c, .35)); R(g, X - 1, Y + 37, 98, 3, sh(c, -.35));
    for (let x = X + 14; x < X + 92; x += 13) { R(g, x, Y + 25, 1, 11, sh(c, -.3)); rivet(g, x + 3, Y + 26, c); rivet(g, x + 3, Y + 33, c); }
    plates(g, X + 30, Y + 4, 50, 19, d, 12); poly(g, [X + 30, Y + 4, X + 30, Y + 23, X + 22, Y + 23, X + 24, Y + 8], sh(d, -.15));
    box(g, X + 50, Y - 2, 14, 6, sh(d, .1)); R(g, X + 54, Y - 6, 2, 4, '#555'); R(g, X + 66, Y - 1, 8, 4, '#333');
    box(g, X + 16, Y + 9, 16, 9, '#3a3c44'); box(g, X - 14, Y + 10, 32, 4, '#4a4d58'); box(g, X - 14, Y + 15, 32, 3, '#3a3c44'); R(g, X - 16, Y + 9, 3, 10, '#24252b');
    R(g, X + 70, Y + 10, 6, 4, '#ffcf40'); R(g, X + 71, Y + 11, 2, 1, '#fff');
  },
  (g, c, d, fr) => { // 보행병기 64×84
    const X = M, Y = M, a = fr ? 3 : -3;
    for (const [lx, o] of [[12, a], [42, -a]]) {
      box(g, X + lx, Y + 46, 12, 18, sh(d, lx > 20 ? 0 : -.2)); disc(g, X + lx + 6, Y + 64, 5, '#5a5a5a');
      poly(g, [X + lx + 1, Y + 64, X + lx + 11, Y + 64, X + lx + 9 + o, Y + 80, X + lx + 3 + o, Y + 80], sh(d, lx > 20 ? -.05 : -.25));
      box(g, X + lx - 4 + o, Y + 79, 20, 5, '#3a3a3a');
    }
    plates(g, X, Y + 14, 64, 34, c, 16); poly(g, [X, Y + 14, X + 10, Y + 6, X + 54, Y + 6, X + 64, Y + 14], sh(c, .15));
    box(g, X + 4, Y + 20, 18, 12, '#2a3a4a'); R(g, X + 6, Y + 22, 8, 2, '#8ac8f0'); R(g, X + 6, Y + 24, 3, 5, '#5a9ac8');
    box(g, X + 26, Y - 4, 22, 11, d); for (let i = 0; i < 4; i++) disc(g, X + 30 + i * 5, Y + 1, 2, '#2a2a2a', false);
    box(g, X - 14, Y + 26, 20, 6, '#4a4d58'); box(g, X - 14, Y + 38, 20, 6, '#4a4d58'); R(g, X - 16, Y + 25, 3, 8, '#24252b'); R(g, X - 16, Y + 37, 3, 8, '#24252b');
    R(g, X + 50, Y + 20, 6, 6, '#ffcf40');
  },
  (g, c, d, fr) => { // 공격헬기 104×40
    const X = M, Y = M;
    R(g, X + (fr ? 0 : 20), Y - 4, fr ? 104 : 64, 2, '#d8d8d8'); R(g, X + (fr ? 6 : 26), Y - 2, fr ? 92 : 52, 1, '#8a8a8a'); box(g, X + 46, Y - 2, 8, 6, '#444');
    R(g, X + 68, Y + 12, 34, 7, d); R(g, X + 68, Y + 12, 34, 2, sh(d, .3)); box(g, X + 96, Y + 2, 7, 18, d); R(g, X + 99, Y + (fr ? -4 : 2), 3, fr ? 28 : 16, '#bbb');
    poly(g, [X + 4, Y + 22, X + 14, Y + 6, X + 70, Y + 4, X + 76, Y + 20, X + 66, Y + 32, X + 12, Y + 32], c);
    R(g, X + 15, Y + 6, 54, 2, sh(c, .38)); R(g, X + 10, Y + 29, 58, 3, sh(c, -.38)); for (let x = X + 24; x < X + 70; x += 12) { R(g, x, Y + 9, 1, 19, sh(c, -.3)); rivet(g, x + 3, Y + 12, c); }
    poly(g, [X + 6, Y + 21, X + 15, Y + 9, X + 28, Y + 9, X + 28, Y + 21], '#3a6a90'); R(g, X + 15, Y + 11, 8, 2, '#c0e8ff'); R(g, X + 12, Y + 15, 4, 1, '#8ac8f0');
    box(g, X + 34, Y + 22, 26, 6, d); for (let i = 0; i < 4; i++) disc(g, X + 38 + i * 6, Y + 25, 2, '#2a2a2a', false);
    box(g, X + 2, Y + 30, 16, 5, '#3a3c44'); R(g, X - 6, Y + 31, 9, 3, '#24252b'); R(g, X + 20, Y + 37, 50, 2, '#333'); R(g, X + 26, Y + 32, 2, 5, '#333'); R(g, X + 60, Y + 32, 2, 5, '#333');
  },
  (g, c, d) => { // 요새포대 84×150
    const X = M, Y = M;
    plates(g, X + 10, Y + 6, 74, 144, c, 18); for (let y = Y + 30; y < Y + 150; y += 30) { R(g, X + 11, y, 72, 2, sh(c, -.38)); R(g, X + 11, y + 2, 72, 1, sh(c, .2)); }
    box(g, X + 6, Y, 82, 10, d); for (let x = X + 8; x < X + 86; x += 10) box(g, x, Y - 6, 6, 6, d);
    R(g, X + 70, Y - 26, 2, 20, '#666'); R(g, X + 66, Y - 26, 10, 2, '#888'); R(g, X + 70, Y - 28, 2, 2, '#f33');
    for (const k of [.2, .45, .7]) { const y = Y + 150 * k; box(g, X + 2, y - 7, 18, 16, d); box(g, X - 16, y - 3, 22, 6, '#4a4d58'); R(g, X - 18, y - 4, 3, 8, '#24252b'); R(g, X - 14, y - 3, 20, 1, '#8a8e98'); }
    box(g, X + 34, Y + 64, 30, 22, '#2a2a34'); disc(g, X + 49, Y + 75, 8, '#ffcf40'); disc(g, X + 49, Y + 75, 3, '#fff8c0', false);
  },
  (g, c, d, fr) => { // 전폭기 96×30
    const X = M, Y = M;
    poly(g, [X + 34, Y + 12, X + 52, Y - 6, X + 62, Y - 6, X + 58, Y + 12], sh(d, -.1));
    poly(g, [X, Y + 16, X + 12, Y + 9, X + 86, Y + 9, X + 96, Y + 14, X + 86, Y + 22, X + 10, Y + 22], c);
    R(g, X + 12, Y + 9, 74, 2, sh(c, .38)); R(g, X + 10, Y + 20, 76, 2, sh(c, -.38)); for (let x = X + 22; x < X + 84; x += 10) R(g, x, Y + 11, 1, 9, sh(c, -.25));
    poly(g, [X + 6, Y + 14, X + 13, Y + 10, X + 24, Y + 10, X + 24, Y + 14], '#3a6a90'); R(g, X + 13, Y + 11, 6, 1, '#c0e8ff');
    poly(g, [X + 36, Y + 18, X + 64, Y + 18, X + 70, Y + 34, X + 56, Y + 34], d); R(g, X + 40, Y + 18, 24, 1, sh(d, .3));
    poly(g, [X + 80, Y + 10, X + 88, Y - 2, X + 94, Y - 2, X + 94, Y + 10], d);
    box(g, X + 44, Y + 23, 12, 5, '#3a3c44'); box(g, X + 26, Y + 22, 10, 4, '#4a4d58');
    R(g, X + 96, Y + 12, 4 + fr * 3, 6, '#ff9a20'); R(g, X + 96, Y + 14, 2 + fr * 2, 2, '#fff2a0');
  },
];
const BODY_SZ = [[96, 56], [64, 84], [104, 40], [84, 150], [96, 30]];
export function drawBoss(ctx, B, th, tick) {
  const [w, h] = BODY_SZ[B.bi], fr = Math.floor(tick / 4) % 2;
  const c = once(`boss${B.bi}|${th.n}|${fr}`, w + M * 2, h + M * 2, g => BOSS_ART[B.bi](g, th.e[0], th.e[1], fr));
  const x = B.x + (B.sh ? Math.round((Math.random() - .5) * 3) : 0);
  put(ctx, c, x + w / 2, B.y - M, B.face > 0, M + w / 2, B.fl > 0);
  if (B.ph === 2 && tick % 30 < 15) { ctx.globalAlpha = .18; put(ctx, white(c), x + w / 2, B.y - M, B.face > 0, M + w / 2); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
}

// ───────── 배경 ─────────
const ART = [
  { far: 'mesa', mid: 'dunes', gnd: 'sand' }, { far: 'ruins', mid: 'trees', gnd: 'stone' }, { far: 'mount', mid: 'pines', gnd: 'ice' },
  { far: 'skyline', mid: 'wreck', gnd: 'concrete' }, { far: 'chimney', mid: 'pipes', gnd: 'metal' }, { far: 'cave', mid: 'columns', gnd: 'rock' },
  { far: 'sea', mid: 'cranes', gnd: 'dock' }, { far: 'volcano', mid: 'spires', gnd: 'basalt' }, { far: 'hills', mid: 'towers', gnd: 'metal' },
  { far: 'planet', mid: 'modules', gnd: 'metal' },
];
function wrapDraw(fn, x, w) { fn(x); if (x < w) fn(x + TW); if (x > TW - w) fn(x - TW); }
function ridge(r, base, amps) { const ph = amps.map(() => r() * 6.28); return x => base - amps.reduce((s, a, i) => s + a[0] * Math.sin(x / TW * 6.283 * a[1] + ph[i]), 0); }
function sky(th, art, r) {
  const c = mk(W, H), g = c.getContext('2d'), top = th.sky[0], bot = th.sky[1];
  for (let i = 0; i < 9; i++) R(g, 0, i * H / 9, W, H / 9 + 1, mix(top, bot, i / 8));
  for (let i = 1; i < 9; i++) for (let x = (i % 2) * 2; x < W; x += 4) R(g, x, Math.round(i * H / 9) - 1, 2, 1, mix(top, bot, (i - .5) / 8));
  if (th.stars) for (let i = 0; i < 90; i++) { const b = r(); R(g, r() * W, r() * H * .75, b > .9 ? 2 : 1, b > .9 ? 2 : 1, b > .6 ? '#fff' : '#9ab'); }
  if (!th.stars && art.far !== 'cave') for (let i = 0; i < 7; i++) {
    const cx = r() * W, cy = 20 + r() * 80, n = 4 + Math.floor(r() * 5), cl = mix(bot, '#ffffff', .55);
    for (let j = 0; j < n; j++) { const rr = 6 + r() * 10; const px = cx + (j - n / 2) * 10 + r() * 6, py = cy - Math.sin(j / n * Math.PI) * 8; g.fillStyle = mix(cl, top, .25); g.beginPath(); g.arc(px, py + 3, rr, 0, 7); g.fill(); g.fillStyle = cl; g.beginPath(); g.arc(px - 1, py, rr - 1, 0, 7); g.fill(); }
  }
  return c;
}
function farLayer(th, art, r) {
  const c = mk(TW, H), g = c.getContext('2d'), fog = th.sky[1], col = mix(th.far, fog, .25);
  const fill = (yf, base, lit, shd, fogTop) => {
    for (let x = 0; x < TW; x++) {
      const y = Math.round(yf(x)), dy = yf(x + 1) - yf(x);
      R(g, x, y, 1, H - y, base); R(g, x, y, 1, 3, dy < -.2 ? lit : dy > .2 ? shd : base);
    }
    if (fogTop !== undefined) { for (let i = 0; i < 6; i++) { g.globalAlpha = .12; R(g, 0, fogTop + i * 10, TW, H, fog); } g.globalAlpha = 1; }
  };
  const k = art.far;
  if (k === 'mesa' || k === 'mount' || k === 'hills' || k === 'volcano') {
    const back = ridge(r, k === 'hills' ? 190 : 150, [[22, 2], [14, 5], [6, 11]]);
    fill(back, mix(col, fog, .4), mix(col, '#ffffff', .25), mix(col, fog, .55));
    let f = ridge(r, k === 'hills' ? 205 : 175, [[26, 3], [12, 7], [5, 17]]);
    if (k === 'mesa') { const f0 = f; f = x => { const y = f0(x); return y < 168 ? 150 + Math.round((y - 150) / 14) * 6 : y; }; }
    fill(f, col, sh(col, .25), sh(col, -.2), 175);
    if (k === 'mount') for (let x = 0; x < TW; x++) { const y = Math.round(f(x)); if (y < 165) { R(g, x, y, 1, Math.min(12, 165 - y), x % 3 ? '#f4f8ff' : '#d8e4f0'); } }
    if (k === 'mesa') for (let x = 0; x < TW; x++) { const y = Math.round(f(x)); for (let yy = y + 8; yy < 200; yy += 7) R(g, x, yy, 1, 1, sh(col, -.12)); }
    if (k === 'volcano') { const cx = TW * .35; poly(g, [cx - 170, 220, cx - 30, 70, cx + 30, 70, cx + 170, 220], mix('#3a1a14', fog, .2)); R(g, cx - 28, 68, 56, 4, '#ff7a20'); for (let i = 0; i < 6; i++) { g.globalAlpha = .5 - i * .07; g.fillStyle = '#5a3a34'; g.beginPath(); g.arc(cx + i * 10, 50 - i * 14, 14 + i * 5, 0, 7); g.fill(); } g.globalAlpha = 1; for (let y = 72; y < 200; y += 3) R(g, cx - 4 + Math.sin(y * .2) * 6, y, 3, 3, '#ff5a10'); }
  } else if (k === 'skyline' || k === 'chimney' || k === 'sea') {
    if (k === 'sea') { const sy = 180; R(g, 0, sy, TW, H - sy, mix('#2a5a88', fog, .3)); for (let i = 0; i < 160; i++) R(g, r() * TW, sy + 4 + r() * 60, 4 + r() * 10, 1, mix('#ffffff', fog, .3)); for (let i = 0; i < 4; i++) { const x = r() * TW, w = 40 + r() * 50; wrapDraw(X => { poly(g, [X, sy, X + w, sy, X + w - 6, sy + 8, X + 6, sy + 8], mix('#3a4450', fog, .4)); R(g, X + w * .4, sy - 10, w * .25, 10, mix('#3a4450', fog, .45)); R(g, X + w * .5, sy - 18, 2, 8, mix('#3a4450', fog, .45)); }, x, w); } }
    for (let layer = 0; layer < 2; layer++) {
      const bc = mix(col, fog, layer ? 0 : .35);
      for (let x = 0; x < TW;) {
        const w = 18 + Math.floor(r() * 4) * 8, h = (k === 'sea' ? 30 : 50) + r() * (layer ? 60 : 90), y = (k === 'sea' ? 182 : 210) - h + layer * 20;
        if (k !== 'sea' || r() < .35) {
          R(g, x, y, w, H - y, bc); R(g, x, y, 1, H - y, sh(bc, .12));
          for (let wy = y + 4; wy < 230; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (r() < .55) R(g, wx, wy, 2, 3, layer ? sh(bc, th.stars ? .45 : -.2) : sh(bc, -.1));
          if (k === 'chimney' && r() < .5) { R(g, x + w / 2 - 3, y - 40, 7, 40, sh(bc, -.08)); R(g, x + w / 2 - 4, y - 42, 9, 3, sh(bc, .1)); for (let i = 0; i < 5; i++) { g.globalAlpha = .35 - i * .06; g.fillStyle = '#d8d0c8'; g.beginPath(); g.arc(x + w / 2 + i * 8, y - 48 - i * 10, 6 + i * 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
          if (r() < .3) R(g, x + w / 2, y - 12, 1, 12, bc);
        }
        x += w + Math.floor(r() * 3) * 4;
      }
    }
  } else if (k === 'ruins') {
    for (let i = 0; i < 26; i++) { const x = r() * TW, rr = 20 + r() * 30, y = 120 + r() * 50; wrapDraw(X => { disc(g, X, y, Math.round(rr), mix('#3a6a4a', fog, .55), true); }, x, rr); }
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 160 + r() * 40, w = 50 + r() * 30, h = 70 + r() * 60, sc = mix('#7a7a62', fog, .45);
      wrapDraw(X => { for (let y = 220 - h; y < 230; y += 10) { const off = (Math.floor(y / 10) % 2) * 6; for (let bx = X; bx < X + w; bx += 14) box(g, bx + off - 6, y, 14, 10, sc, .6); } if (i % 2 === 0) { box(g, X + w / 2 - 14, 220 - h - 26, 28, 26, sc, .7); R(g, X + w / 2 - 8, 220 - h - 18, 5, 4, sh(sc, -.4)); R(g, X + w / 2 + 3, 220 - h - 18, 5, 4, sh(sc, -.4)); R(g, X + w / 2 - 5, 220 - h - 8, 10, 2, sh(sc, -.35)); } }, x, w);
    }
    for (let i = 0; i < 5; i++) { g.globalAlpha = .14; R(g, 0, 150 + i * 14, TW, H, fog); } g.globalAlpha = 1;
  } else if (k === 'cave') {
    R(g, 0, 0, TW, H, mix(th.far, '#000000', .2));
    for (let i = 0; i < 40; i++) { const x = r() * TW, w = 10 + r() * 30, h = 30 + r() * 90; wrapDraw(X => { poly(g, [X - w / 2, 0, X + w / 2, 0, X + 2, h, X - 2, h], mix(th.far, '#6a5a6a', .25)); R(g, X - w / 4, 0, 2, h * .7, mix(th.far, '#8a7a8a', .3)); }, x, w); }
    for (let i = 0; i < 30; i++) { const x = r() * TW, w = 12 + r() * 30, h = 20 + r() * 70; wrapDraw(X => poly(g, [X - w / 2, H, X + w / 2, H, X + 2, H - h, X - 2, H - h], mix(th.far, '#5a4a5a', .3)), x, w); }
  } else if (k === 'planet') {
    const cx = TW * .3, cy = 90; for (let y = -60; y <= 60; y++) for (let x = -60; x <= 60; x++) { if (x * x + y * y > 3600) continue; const l = (-x - y * .6) / 85; R(g, cx + x, cy + y, 1, 1, sh(Math.floor((y + 60) / 12) % 2 ? '#8a5ab8' : '#a070c8', l > .3 ? .25 : l < -.3 ? -.45 : l < 0 ? -.2 : 0)); }
    g.strokeStyle = 'rgba(220,200,255,.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 100, 18, -.25, 0, 7); g.stroke();
    for (let i = 0; i < 3; i++) disc(g, TW * (.55 + i * .15), 40 + i * 30, 6 + i * 3, '#8a8aa0');
  }
  return c;
}
function midLayer(th, art, r) {
  const c = mk(TW, H), g = c.getContext('2d'), fog = th.sky[1], m = mix(th.mid, fog, .12), k = art.mid;
  if (k === 'dunes') {
    const f = ridge(r, 212, [[14, 3], [8, 8]]); for (let x = 0; x < TW; x++) { const y = Math.round(f(x)), dy = f(x + 1) - f(x); R(g, x, y, 1, H, m); R(g, x, y, 1, 2, dy < 0 ? sh(m, .25) : sh(m, -.15)); for (let yy = y + 6; yy < H; yy += 9) R(g, x, yy + Math.round(Math.sin(x * .05) * 2), 1, 1, sh(m, -.1)); }
    for (let i = 0; i < 5; i++) { const x = r() * TW, h = 40 + r() * 50, sc = sh(m, .1); wrapDraw(X => { for (let y = 215 - h; y < 222; y += 8) box(g, X + (y % 16 ? 0 : 1), y, 14, 8, sc, .7); box(g, X - 3, 215 - h - 6, 20, 6, sc, .7); }, x, 20); }
  } else if (k === 'trees') {
    for (let i = 0; i < 14; i++) {
      const x = r() * TW, tw = 8 + r() * 8, th2 = 120 + r() * 80, tc = mix('#4a3a2a', fog, .25), lc = mix('#2f6a3a', fog, .2);
      wrapDraw(X => {
        R(g, X, H - th2, tw, th2, tc); R(g, X, H - th2, 2, th2, sh(tc, .2)); R(g, X + tw - 2, H - th2, 2, th2, sh(tc, -.3)); for (let y = H - th2; y < H; y += 6) R(g, X + 3, y, 2, 3, sh(tc, -.2));
        for (let j = 0; j < 7; j++) disc(g, Math.round(X + tw / 2 + (j - 3) * 12 + Math.sin(j * 7) * 6), Math.round(H - th2 + Math.cos(j * 3) * 10), 13 + (j % 3) * 4, lc);
        for (let v = 0; v < 4; v++) { const vx = X + tw / 2 + (v - 1.5) * 14; for (let y = H - th2 + 10; y < H - th2 + 50 + v * 12; y += 2) R(g, vx + Math.sin(y * .1) * 2, y, 1, 2, sh(lc, -.15)); }
      }, x, 60);
    }
  } else if (k === 'pines') {
    for (let i = 0; i < 22; i++) {
      const x = r() * TW, h = 60 + r() * 70, b = 230, pc = mix('#2a4a3a', fog, .3);
      wrapDraw(X => { R(g, X - 2, b - 12, 5, 14, '#4a3a2a'); for (let j = 0; j < 4; j++) { const y = b - 10 - j * h / 4, w = (4 - j) * h / 9; poly(g, [X - w, y, X + w, y, X, y - h / 3], pc); poly(g, [X - w, y, X - w * .3, y - 3, X, y - h / 3, X - w * .5, y - 2], '#f0f6ff'); } }, x, 40);
    }
  } else if (k === 'wreck' || k === 'towers' || k === 'modules') {
    for (let x = 0; x < TW;) {
      const w = 40 + Math.floor(r() * 4) * 12, h = 50 + r() * 90, y = 236 - h;
      if (k === 'modules') { box(g, x, y + 20, w, h, m); R(g, x, y + 30, w, 3, sh(m, -.3)); for (let wx = x + 6; wx < x + w - 6; wx += 10) { R(g, wx, y + 40, 5, 4, '#7ad8ff'); } R(g, x + w / 2 - 1, y - 10, 2, 30, sh(m, .2)); R(g, x + w / 2 - 12, y - 10, 24, 2, sh(m, .2)); }
      else if (k === 'towers' && r() < .5) { R(g, x + 10, y, 3, h, m); R(g, x + w - 13, y, 3, h, m); for (let yy = y; yy < 236; yy += 14) { g.strokeStyle = m; g.beginPath(); g.moveTo(x + 11, yy); g.lineTo(x + w - 11, yy + 14); g.moveTo(x + w - 11, yy); g.lineTo(x + 11, yy + 14); g.stroke(); } box(g, x + 4, y - 16, w - 8, 16, m); R(g, x + 8, y - 12, w - 16, 5, '#ffd870'); g.fillStyle = 'rgba(255,240,180,.12)'; g.beginPath(); g.moveTo(x + w / 2, y - 10); g.lineTo(x + w / 2 - 70, 0); g.lineTo(x + w / 2 - 30, 0); g.fill(); }
      else {
        box(g, x, y, w, h + 20, m);
        for (let wy = y + 6; wy < 230; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 9) { const lit = th.stars && r() < .3; R(g, wx, wy, 5, 7, lit ? '#ffd870' : sh(m, -.4)); R(g, wx, wy, 5, 1, sh(m, -.2)); }
        if (k === 'wreck') { for (let jx = x; jx < x + w; jx += 4) R(g, jx, y - 1, 4, Math.floor(r() * 10), fog); for (let i = 0; i < 3; i++) R(g, x + r() * w, y - 8, 1, 10, '#6a4a3a'); disc(g, Math.round(x + w * .6), Math.round(y + h * .4), 6, sh(m, -.5), false); }
      }
      x += w + 8 + Math.floor(r() * 4) * 8;
    }
  } else if (k === 'pipes') {
    for (let i = 0; i < 4; i++) { const y = 150 + i * 22, pc = mix('#6a6a72', fog, .2 + i * .05); R(g, 0, y, TW, 8, pc); R(g, 0, y, TW, 2, sh(pc, .35)); R(g, 0, y + 6, TW, 2, sh(pc, -.35)); for (let x = r() * 60; x < TW; x += 60 + r() * 60) box(g, x, y - 2, 6, 12, sh(pc, -.1)); }
    for (let i = 0; i < 8; i++) { const x = r() * TW, w = 40 + r() * 30, h = 50 + r() * 40, tc = mix('#8a7a5a', fog, .15); wrapDraw(X => { box(g, X, 236 - h, w, h, tc); R(g, X, 236 - h + 10, w, 2, sh(tc, -.3)); R(g, X + 4, 236 - h + 14, 6, h - 20, sh(tc, .25)); for (let rx = X + 4; rx < X + w - 4; rx += 8) rivet(g, rx, 236 - h + 4, tc); R(g, X + 10, 236 - h + h / 2, w - 20, 6, '#e0a030'); for (let s = 0; s < w - 20; s += 6) R(g, X + 10 + s, 236 - h + h / 2, 3, 6, '#2a2a2a'); }, x, w); }
  } else if (k === 'columns' || k === 'spires') {
    for (let i = 0; i < 16; i++) {
      const x = r() * TW, w = 16 + r() * 24, h = 70 + r() * 110, cc = mix(k === 'spires' ? '#2a1a18' : th.mid, fog, .1);
      wrapDraw(X => { poly(g, [X - w / 2, H, X + w / 2, H, X + w / 5, H - h, X - w / 6, H - h + 6], cc); poly(g, [X - w / 2, H, X - w / 4, H, X - w / 12, H - h + 8, X - w / 6, H - h + 6], sh(cc, .18)); if (k === 'spires') for (let y = H - h + 20; y < H; y += 7) R(g, X + Math.sin(y * .3) * w / 5, y, 2, 4, '#ff6a1a'); }, x, w);
    }
  } else if (k === 'cranes') {
    for (let i = 0; i < 3; i++) { const x = 100 + i * 320 + r() * 60, cc = mix('#c8502a', fog, .25); R(g, x, 70, 5, 166, cc); R(g, x + 20, 70, 5, 166, cc); for (let y = 70; y < 236; y += 14) { g.strokeStyle = cc; g.beginPath(); g.moveTo(x + 5, y); g.lineTo(x + 20, y + 14); g.stroke(); } R(g, x - 60, 64, 160, 6, cc); box(g, x - 4, 50, 34, 16, sh(cc, -.1)); R(g, x - 50, 70, 1, 60 + i * 20, '#333'); box(g, x - 58, 130 + i * 20, 18, 10, '#2a5a8a'); }
    for (let x = 0; x < TW; x += 34) { if (r() < .4) continue; const n = 1 + Math.floor(r() * 3); for (let j = 0; j < n; j++) { const cc = mix(['#2a6a9a', '#a83a2a', '#3a8a4a', '#c89030'][Math.floor(r() * 4)], fog, .2); box(g, x, 236 - (j + 1) * 14, 32, 14, cc); for (let sx = x + 3; sx < x + 30; sx += 3) R(g, sx, 236 - (j + 1) * 14 + 2, 1, 10, sh(cc, -.25)); } }
  }
  return c;
}

// ───────── 지형 질감 ─────────
function blocks(g, base, r, o) {
  let y = 0;
  while (y < 64) {
    const bh = o.bh || 16; let x = -Math.floor(r() * 16);
    while (x < 64) {
      const bw = o.bw ? o.bw : [16, 24, 32][Math.floor(r() * 3)], col = sh(base, (r() - .5) * (o.jit ?? .16));
      for (const X of [x, x + 64, x - 64]) {
        R(g, X, y, bw, bh, col); R(g, X, y, bw, 1, sh(col, .3)); R(g, X, y, 1, bh, sh(col, .16)); R(g, X, y + bh - 1, bw, 1, sh(col, -.45)); R(g, X + bw - 1, y, 1, bh, sh(col, -.35));
        for (let i = 0; i < (o.spk ?? 6); i++) R(g, X + 2 + r() * (bw - 4), y + 2 + r() * (bh - 4), 1, 1, sh(col, r() < .5 ? -.2 : .15));
        if (o.moss && r() < .5) for (let i = 0; i < 8; i++) R(g, X + r() * bw, y + r() * 4, 2, 1, mix('#4a8a3a', col, .3));
        if (o.crack && r() < .4) { let cx = X + 3 + r() * (bw - 6), cy = y + 2; for (let i = 0; i < bh - 4; i++) { R(g, cx, cy + i, 1, 1, sh(col, -.5)); cx += Math.round(r() * 2 - 1); } }
        if (o.rivet) { rivet(g, X + 2, y + 2, col); rivet(g, X + bw - 4, y + 2, col); rivet(g, X + 2, y + bh - 4, col); rivet(g, X + bw - 4, y + bh - 4, col); }
        if (o.lava && r() < .35) { let cx = X + r() * bw; for (let i = 0; i < bh; i++) { R(g, cx, y + i, 1, 1, '#ff6a1a'); cx += Math.round(r() * 2 - 1); } }
      }
      x += bw;
    }
    y += bh;
  }
}
const GND = {
  sand: { c: '#c8904a', o: { jit: .1 }, edge: ['#e8c078', '#c89858'] },
  stone: { c: '#7a7a60', o: { moss: 1, crack: 1 }, edge: ['#5aa040', '#3a7a2a'], grass: 1 },
  ice: { c: '#a8c8e0', o: { jit: .08, spk: 3 }, edge: ['#ffffff', '#d8e8f8'], drip: 1 },
  concrete: { c: '#7a7670', o: { crack: 1, bw: 32 }, edge: ['#9a968e', '#6a665e'] },
  metal: { c: '#5a5e6a', o: { rivet: 1, bw: 32, jit: .06, spk: 2 }, edge: ['#d8a028', '#2a2a2a'], hazard: 1 },
  rock: { c: '#5a4a3e', o: { jit: .22, crack: 1 }, edge: ['#7a6a5a', '#5a4a3a'] },
  dock: { c: '#7a5432', o: { bh: 8, bw: 64, jit: .14, spk: 10 }, edge: ['#9a9a9a', '#6a6a6a'] },
  basalt: { c: '#3a2a26', o: { lava: 1, jit: .18 }, edge: ['#ff7a20', '#8a2a10'] },
};
function groundTex(art, r) {
  const d = GND[art.gnd], c = mk(64, 64); blocks(c.getContext('2d'), d.c, r, d.o); return c;
}
function edgeTex(art, r) {
  const d = GND[art.gnd], c = mk(64, 12), g = c.getContext('2d'), [a, b] = d.edge;
  if (d.hazard) { R(g, 0, 0, 64, 4, a); for (let x = 0; x < 64; x += 8) poly(g, [x, 0, x + 4, 0, x, 4, x - 4, 4], b); R(g, 0, 0, 64, 1, sh(a, .4)); R(g, 0, 4, 64, 1, '#1a1a1a'); return c; }
  R(g, 0, 0, 64, 4, a); R(g, 0, 0, 64, 1, sh(a, .35)); R(g, 0, 3, 64, 1, b);
  for (let x = 0; x < 64; x++) { const h = d.grass ? (r() < .35 ? 2 + r() * 6 : 1) : d.drip ? (r() < .2 ? 2 + r() * 5 : 1) : (r() < .3 ? 1 + r() * 2 : 0); R(g, x, 4, 1, h, x % 2 ? b : sh(b, -.15)); }
  if (d.grass) for (let x = 0; x < 64; x += 3) R(g, x + r() * 2, 0, 1, 1, sh(a, .5));
  return c;
}
function plat(art) {
  return once('plat' + art.gnd, 16, 8, g => { const c = art.gnd === 'metal' || art.gnd === 'concrete' ? '#6a6e7a' : '#8a5a32'; box(g, 0, 0, 16, 5, c); R(g, 7, 1, 1, 3, sh(c, -.35)); rivet(g, 2, 1, c); rivet(g, 12, 1, c); R(g, 3, 5, 2, 3, sh(c, -.3)); R(g, 11, 5, 2, 3, sh(c, -.3)); }, false);
}

// ───────── 소품 ─────────
const DECO = [['rock', 'skull', 'barrel', 'cactus'], ['bush', 'rock', 'fern', 'bush'], ['rock', 'crate', 'pine', 'rock'], ['rubble', 'barrel', 'crate', 'rubble'], ['barrel', 'crate', 'barrel', 'rubble'], ['crystal', 'rock', 'crystal', 'rock'], ['crate', 'barrel', 'bollard', 'crate'], ['rock', 'rock', 'skull', 'rock'], ['sandbag', 'crate', 'barrel', 'sandbag'], ['crate', 'barrel', 'crystal', 'crate']];
function deco(k, th) {
  return once('deco' + k + th.n, 24, 20, g => {
    const gc = th.far;
    switch (k) {
      case 'rock': disc(g, 12, 15, 6, mix('#7a7266', gc, .3)); disc(g, 7, 17, 3, mix('#6a6258', gc, .3)); break;
      case 'skull': disc(g, 10, 15, 4, '#e8e0c8'); R(g, 8, 14, 2, 2, '#2a2a2a'); R(g, 11, 14, 2, 2, '#2a2a2a'); R(g, 9, 18, 4, 2, '#d0c8b0'); R(g, 15, 18, 6, 2, '#e0d8c0'); break;
      case 'barrel': box(g, 6, 6, 11, 14, '#5a6a3a'); R(g, 6, 9, 11, 1, '#2a2a2a'); R(g, 6, 16, 11, 1, '#2a2a2a'); R(g, 8, 7, 2, 12, '#7a8a5a'); break;
      case 'crate': box(g, 3, 6, 16, 14, '#9a6a3a'); R(g, 4, 12, 14, 2, '#6a4a2a'); poly(g, [4, 7, 6, 7, 18, 18, 16, 18], '#7a5230'); break;
      case 'cactus': box(g, 9, 2, 5, 18, '#4a8a3a'); box(g, 4, 8, 4, 6, '#4a8a3a'); box(g, 15, 5, 4, 7, '#4a8a3a'); for (let y = 4; y < 18; y += 3) R(g, 11, y, 1, 1, '#c8e0a0'); break;
      case 'bush': disc(g, 7, 15, 5, '#3a7a2a'); disc(g, 15, 14, 6, '#4a8a32'); disc(g, 11, 12, 5, '#5a9a3a'); break;
      case 'fern': for (let i = -3; i <= 3; i++) for (let j = 0; j < 9; j++) R(g, 12 + i * j * .5, 19 - j * (1.6 - Math.abs(i) * .25), 1, 1, j % 2 ? '#3a8a2a' : '#5aaa3a'); break;
      case 'pine': poly(g, [3, 19, 21, 19, 12, 2], '#2a5a3a'); poly(g, [3, 19, 9, 17, 12, 2], '#f0f6ff'); break;
      case 'rubble': box(g, 2, 14, 9, 6, '#8a8680'); box(g, 9, 11, 10, 9, '#7a7670'); box(g, 16, 16, 7, 4, '#6a665e'); R(g, 12, 8, 1, 4, '#6a4a3a'); break;
      case 'crystal': poly(g, [8, 20, 12, 4, 15, 20], '#7ad8ff'); poly(g, [8, 20, 12, 4, 11, 20], '#c8f0ff'); poly(g, [14, 20, 18, 10, 20, 20], '#5ab0e0'); break;
      case 'bollard': box(g, 7, 8, 9, 12, '#3a3a3a'); box(g, 5, 6, 13, 4, '#4a4a4a'); break;
      case 'sandbag': for (let i = 0; i < 3; i++) box(g, 1 + i * 7, 15, 8, 5, '#a89060'); for (let i = 0; i < 2; i++) box(g, 4 + i * 7, 10, 8, 5, '#b89a68'); break;
    }
  });
}

// ───────── 스테이지 아트 ─────────
export function initStageArt(n, th, LV, rng) {
  const ti = Math.floor((n - 1) / 5), art = ART[ti], r = rng(n * 977 + 3);
  const key = 'stage' + ti;
  let A = cache.get(key);
  if (!A) { A = { art, sky: sky(th, art, r), far: farLayer(th, art, r), mid: midLayer(th, art, r), gt: groundTex(art, r), et: edgeTex(art, r) }; cache.set(key, A); }
  const decos = [], set = DECO[ti];
  for (const s of LV.S) { if (s.o) continue; for (let x = s.x + 10 + r() * 40; x < s.x + s.w - 24; x += 50 + r() * 90) decos.push({ x: Math.round(x), y: s.y, k: set[Math.floor(r() * 4)] }); }
  return { ...A, decos, th };
}
export function drawBack(ctx, A, cam) {
  ctx.drawImage(A.sky, 0, 0);
  for (const [img, p] of [[A.far, .15], [A.mid, .4]]) { const o = ((cam * p) % TW + TW) % TW; ctx.drawImage(img, -Math.round(o), 0); if (o > TW - W) ctx.drawImage(img, Math.round(TW - o), 0); }
}
export function drawGround(ctx, A, LV, cam) {
  if (!A.gp) { A.gp = ctx.createPattern(A.gt, 'repeat'); A.ep = ctx.createPattern(A.et, 'repeat-x'); }
  const c0 = cam - 30, c1 = cam + W + 30, pl = plat(A.art);
  for (const s of LV.S) {
    if (s.x + s.w < c0 || s.x > c1) continue;
    if (s.o) { for (let x = s.x; x < s.x + s.w; x += 16) ctx.drawImage(pl, x, s.y, Math.min(16, s.x + s.w - x), 8); continue; }
    const x0 = Math.max(s.x, c0), x1 = Math.min(s.x + s.w, c1);
    ctx.fillStyle = A.gp; ctx.fillRect(x0, s.y, x1 - x0, H - s.y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x0, s.y + 10, x1 - x0, H - s.y);
    if (s.x >= c0) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(s.x, s.y, 3, H - s.y); }
    if (s.x + s.w <= c1) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(s.x + s.w - 4, s.y, 4, H - s.y); }
    ctx.save(); ctx.translate(0, s.y); ctx.fillStyle = A.ep; ctx.fillRect(x0, 0, x1 - x0, 12); ctx.restore();
  }
  for (const d of A.decos) if (d.x > c0 - 24 && d.x < c1) ctx.drawImage(deco(d.k, A.th), d.x, d.y - 20);
}
