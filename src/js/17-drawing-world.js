let vw = 0, vh = 0, dpr = 1, scale = 1, pad = { t:12, r:16, b:12, l:16 }, time = 0, vignette = null, miniC = null;
const MINI = 9000; /* the small chart spans this much sea, east to west, about your ship */
let flagsEnd = 300, botTop = 0, botEl = null; /* where the compass, its readings and the flags of the nations end; the small chart keeps clear of them */
function chartRect(){ const small = coarse || vw < 620; let w = small ? clamp(vw - pad.l - pad.r - 234, 84, 120) : 190, h = w;
  const floor = small && botTop > 0 ? Math.min(vh - pad.b, botTop - 8) : vh - pad.b, room = floor - flagsEnd - 12;
    if (h > room){ h = room < 56 ? 0 : room; w = h; } /* on a screen too short for it, the small chart stands down */
  return { x: vw - pad.r - w, y: small ? Math.min(flagsEnd + 12, floor - h) : floor - h, w, h }; }
function landLayer(g, k, detail){
  g.save(); g.scale(k, k); g.lineJoin = 'round';
  if (detail){ g.strokeStyle = 'rgba(95,210,198,.22)'; g.lineWidth = 9/k; lands.forEach(l => g.stroke(l.path)); }
  g.fillStyle = '#7da35a'; lands.forEach(l => g.fill(l.path));
  g.strokeStyle = '#e3d199'; g.lineWidth = (detail ? 1.6 : 1.1)/k; lands.forEach(l => g.stroke(l.path)); g.restore();
}
function resize(){
  dpr = Math.min(2, window.devicePixelRatio || 1); vw = cv.clientWidth; vh = cv.clientHeight;
  cv.width = Math.round(vw*dpr); cv.height = Math.round(vh*dpr);
  baseScale = clamp(Math.sqrt(vw*vh)/620, .85, 2); scale = baseScale*zoomMul;
  const cs = getComputedStyle($('hud'));
  pad = { t: parseFloat(cs.paddingTop)||12, r: parseFloat(cs.paddingRight)||16, b: parseFloat(cs.paddingBottom)||12, l: parseFloat(cs.paddingLeft)||16 };
  const tb = $('topbar').offsetHeight; pad.t += tb + 8; document.documentElement.style.setProperty('--bar', tb + 'px'); // the compass and chart sit below the top bar
  vignette = cx.createRadialGradient(vw/2, vh/2, Math.min(vw, vh)*.35, vw/2, vh/2, Math.hypot(vw, vh)*.62);
  vignette.addColorStop(0, 'rgba(3,14,18,0)'); vignette.addColorStop(1, 'rgba(3,14,18,.5)');
  const m = chartRect(); miniC = document.createElement('canvas'); miniC.width = Math.round(W*190/MINI*dpr); miniC.height = Math.round(H*190/MINI*dpr);
  const g = miniC.getContext('2d'); g.fillStyle = '#0d3340'; g.fillRect(0, 0, miniC.width, miniC.height); landLayer(g, miniC.width/W, false);
}
addEventListener('resize', resize);

function blobTex(size, n, r0, r1, col, seed){
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), r = rng(seed);
  for (let i = 0; i < n; i++){ const x = r()*size, y = r()*size, rad = r0 + r()*(r1-r0);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++){ const bx = x + ox*size, by = y + oy*size;
      const gr = g.createRadialGradient(bx, by, 0, bx, by, rad); gr.addColorStop(0, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
      g.fillStyle = gr; g.fillRect(bx-rad, by-rad, rad*2, rad*2); } }
  return c;
}
const patLight = cx.createPattern(blobTex(256, 22, 18, 60, 'rgba(110,205,200,.13)', 3), 'repeat');
const patDark = cx.createPattern(blobTex(256, 16, 30, 80, 'rgba(3,26,36,.2)', 9), 'repeat');
const smokeTex = (rgb, seed) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = rng(seed);
  for (let i = 0; i < 9; i++){ const x = 64 + (r() - .5)*52, y = 64 + (r() - .5)*52, rad = 26 + r()*26, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(' + rgb + ',.42)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } return c; };
const smokeSpr = smokeTex('232,232,222', 41), smokeDark = smokeTex('58,54,50', 43);
const patWarm = cx.createPattern(blobTex(256, 22, 14, 46, 'rgba(238,228,150,.10)', 31), 'repeat'), patShade = cx.createPattern(blobTex(256, 18, 16, 50, 'rgba(12,40,24,.13)', 37), 'repeat');
const patFine = cx.createPattern(blobTex(128, 26, 5, 16, 'rgba(170,230,225,.09)', 14), 'repeat');
const cloudSpr = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = rng(21);
  for (let i = 0; i < 7; i++){ const x = 70 + r()*116, y = 80 + r()*96, rad = 40 + r()*40, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(2,18,24,.34)'); gr.addColorStop(1, 'rgba(2,18,24,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); } return c; })();
const clouds = []; for (let i = 0; i < 7; i++) clouds.push({ x: rnd()*3200, y: rnd()*3200, s: rand(620, 1100) });
const gulls = []; for (let i = 0; i < 7; i++) gulls.push({ x:-9e9, y:0, a: rnd()*TAU, r: rand(40, 120), w: rand(.5, .9)*(i % 2 ? 1 : -1), ph: rnd()*TAU });
const drift = { x:0, y:0 };

/* land is painted once per 512-unit tile and cached */
const TS = 512, tiles = new Map(), tileLand = new Uint8Array(Math.ceil(W/TS)*Math.ceil(H/TS)), TGW = Math.ceil(W/TS);
for (let j = 0; j < Math.ceil(H/TS); j++) for (let i = 0; i < TGW; i++){ let any = 0;
  for (let y = j*TS - 190; y <= (j+1)*TS + 190 && !any; y += 32) for (let x = i*TS - 190; x <= (i+1)*TS + 190; x += 32) if (x >= 0 && y >= 0 && x < W && y < H && nearM[(y/RES|0)*MW + (x/RES|0)]){ any = 1; break; }
  tileLand[j*TGW+i] = any; }
function tree(g, x, y, r, k){ // a canopy built from shaded lobes, lit from the north-west like the ships
  const P = k < .33 ? ['#27552f', '#3b7a40', '#5a9c50', '#93c873'] : k < .66 ? ['#245236', '#377346', '#52935b', '#86bd7c'] : ['#35662b', '#4c8838', '#6fa94a', '#aad572'];
  g.fillStyle = 'rgba(8,30,22,.16)'; circle(g, x + r*.5, y + r*.72, r*1.06); g.fill(); g.fillStyle = 'rgba(8,30,22,.2)'; circle(g, x + r*.3, y + r*.46, r); g.fill();
  g.fillStyle = P[0]; circle(g, x, y, r); g.fill();
  g.fillStyle = P[1]; for (const v of [[-.26, -.24, .66], [.3, -.12, .58], [-.04, .3, .56]]){ circle(g, x + v[0]*r, y + v[1]*r, v[2]*r); g.fill(); }
  g.fillStyle = P[2]; for (const v of [[-.3, -.32, .42], [.2, -.24, .34], [-.1, .08, .3]]){ circle(g, x + v[0]*r, y + v[1]*r, v[2]*r); g.fill(); }
  g.fillStyle = P[3]; circle(g, x - r*.36, y - r*.4, r*.2); g.fill(); circle(g, x + r*.14, y - r*.3, r*.13); g.fill();
  g.strokeStyle = 'rgba(8,30,22,.3)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - .5, .15, 1.9); g.stroke();
}
function palm(g, x, y, rot){
  for (const pass of [0, 1]){ g.strokeStyle = pass ? '#4f9146' : 'rgba(10,35,25,.3)'; g.lineWidth = 2.2; g.lineCap = 'round';
    for (let f = 0; f < 7; f++){ const fa = rot + f/7*TAU, ox = pass ? 0 : 2.5, oy = pass ? 0 : 3.5;
      g.beginPath(); g.moveTo(x+ox, y+oy); g.quadraticCurveTo(x+ox+Math.cos(fa)*5, y+oy+Math.sin(fa)*5 - 1.5, x+ox+Math.cos(fa)*9, y+oy+Math.sin(fa)*9); g.stroke(); } }
  g.fillStyle = '#6b4a2a'; circle(g, x, y, 1.6); g.fill(); g.lineCap = 'butt';
}
function makeTile(ti, tj, TR){
  const c = document.createElement('canvas'); c.width = c.height = Math.round(TS*TR);
  const g = c.getContext('2d'), x0 = ti*TS, y0 = tj*TS; g.scale(TR, TR); g.translate(-x0, -y0); g.lineJoin = 'round';
  const L = lands.filter(l => l.x1 > x0-260 && l.x0 < x0+TS+260 && l.y1 > y0-260 && l.y0 < y0+TS+260);
  for (const v of [[400,.05],[290,.06],[190,.08],[110,.11],[52,.16]]){ g.strokeStyle = 'rgba(95,215,200,' + v[1] + ')'; g.lineWidth = v[0]; L.forEach(l => g.stroke(l.path)); }
  for (const l of L){ g.save(); g.clip(l.path); g.fillStyle = '#3f7a45'; g.fillRect(x0, y0, TS, TS);
    for (const v of [[520,'#4b8648'],[320,'#5f964e'],[170,'#77a657'],[78,'#a6b56a'],[54,'#ecdcaa'],[14,'#c8b07a']]){ g.strokeStyle = v[1]; g.lineWidth = v[0]; g.stroke(l.path); }
    g.fillStyle = patShade; g.fillRect(x0, y0, TS, TS); g.fillStyle = patWarm; g.fillRect(x0, y0, TS, TS); // mottled light and shade, so the ground is not one flat green
    g.restore(); }
  for (let gy = Math.floor((y0-90)/170); gy*170 < y0+TS+90; gy++) for (let gx = Math.floor((x0-90)/170); gx*170 < x0+TS+90; gx++){
    const x = gx*170 + hh(gx, gy, 1)*120, y = gy*170 + hh(gx, gy, 2)*120;
    if (hh(gx, gy, 3) > .5 || !at(deepM, x, y) || !at(deepM, x+90, y) || !at(deepM, x-90, y) || !at(deepM, x, y+90) || !at(deepM, x, y-90)) continue;
    const r = 46 + hh(gx, gy, 4)*38; g.fillStyle = 'rgba(25,55,38,.34)'; circle(g, x+9, y+11, r); g.fill();
    g.fillStyle = 'rgba(150,182,112,.3)'; circle(g, x-7, y-9, r*.72); g.fill(); g.fillStyle = 'rgba(205,205,170,.3)'; circle(g, x-10, y-12, r*.26); g.fill(); }
  const T = [];
  for (let gy = Math.floor((y0-14)/19); gy*19 < y0+TS+14; gy++) for (let gx = Math.floor((x0-14)/19); gx*19 < x0+TS+14; gx++){
    const x = gx*19 + hh(gx, gy, 5)*17, y = gy*19 + hh(gx, gy, 6)*17, k = hh(gx, gy, 7);
    if (at(deepM, x, y)){ if (k < .62) T.push([x, y, 5 + hh(gx, gy, 8)*6.5, k]);
      else { g.strokeStyle = k < .8 ? 'rgba(170,205,110,.5)' : 'rgba(40,85,40,.4)';
        g.lineWidth = 1.1; g.beginPath(); for (let j = -1; j <= 1; j++){ g.moveTo(x + j*2.4, y + 2);
        g.lineTo(x + j*3.4, y - 3 - (j ? 0 : 1.5)); } g.stroke(); // tufts of grass in the clearings
        if (k > .96){ g.fillStyle = hh(gx, gy, 9) < .5 ? '#f3e7a0' : '#e8b0a0'; circle(g, x + 5, y + 4, 1.3); g.fill(); } } }
    else if (k > .3 && k < .34 && isLand(x, y) && x > 0 && y > 0 && x < W && y < H){ g.fillStyle = 'rgba(120,100,70,.55)';
      circle(g, x, y, 1.6); g.fill(); g.fillStyle = 'rgba(255,250,225,.5)'; circle(g, x + 6, y + 3, 1.1); g.fill(); }
    else if (k < .05 && y > Y(31.5) && isLand(x, y) && x > 0 && y > 0 && x < W && y < H) palm(g, x, y, k*90); /* no palms north of Georgia */
    else if (k > .93 && !isLand(x, y) && isNear(x, y) && shore(x, y) && hh(gx, gy, 9) < .25){ const r = 3 + hh(gx, gy, 8)*4; g.fillStyle = '#6f7873'; circle(g, x, y, r); g.fill();
      g.fillStyle = 'rgba(255,255,255,.28)'; circle(g, x-r*.3, y-r*.3, r*.45); g.fill(); } }
  T.sort((a, b) => a[1] - b[1]); for (const t of T) tree(g, t[0], t[1], t[2]*1.08, t[3]/.62);
  return c;
}
const tilesLo = new Map(); // coarse tiles for the zoomed-out view, where many more are on screen
let seasonNow = 0; /* 0 green, 1 autumn, 2 winter: the tiles are repainted when it turns */
function seasonTint(c, tj){ const lat = LAT1 - (tj + .5)*TS/DEG; if (lat < 34) return;
  const g = c.getContext('2d'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(16,50,44,' + clamp((lat - 34)/14, 0, 1)*.3 + ')'; g.fillRect(0, 0, c.width, c.height); /* pine and hardwood darken the land northward */
  if (seasonNow === 1 && lat > 37){ g.fillStyle = 'rgba(186,104,28,' + clamp((lat - 37)/6, 0, 1)*.26 + ')'; g.fillRect(0, 0, c.width, c.height); }
  if (seasonNow === 2 && lat > 39){ g.fillStyle = 'rgba(238,243,248,' + clamp((lat - 39)/4, 0, 1)*.62 + ')'; g.fillRect(0, 0, c.width, c.height); } g.restore(); }
function tileAt(ti, tj, budget, lo){
  const key = tj*TGW + ti, M = lo ? tilesLo : tiles; let t = M.get(key);
  if (t){ M.delete(key); M.set(key, t); return t; }
  if (budget.n <= 0) return null; budget.n--;
  t = makeTile(ti, tj, lo ? .5 : dpr > 1 ? 1.5 : 1.25); seasonTint(t, tj); M.set(key, t);
  if (M.size > (lo ? 200 : 34)) M.delete(M.keys().next().value);
  return t;
}

/* every town is laid out once from its own description, and only on ground that is really land */
const ROOFS = { tile:[['#b64a30','#8c3522'],['#c2603a','#964428'],['#a9432c','#7c2e1e']], slate:[['#6f7780','#525a62'],['#7d8288','#5e646a'],['#8a6f5a','#6a5242']],
  dutch:[['#b5442e','#8a3220'],['#3f6f9e','#2d5378'],['#d6a13a','#a87a22'],['#5d8f5a','#426b40']], thatch:[['#c2a35c','#9a7d3e'],['#b3934f','#8a6d35']], clap:[['#5c4b3c','#3f3228'],['#6b5a48','#4b3d30'],['#7a2f24','#571f18'],['#4d4a48','#343230']], pastel:[['#6f7780','#525a62'],['#8a5a48','#6a4232'],['#7d8288','#5e646a']] };
const WALLS = { tile:'#efe3c8', slate:'#e4ddd0', dutch:'#f3ead6', thatch:'#b89868', clap:'#f2f0e6', pastel:'#f2d8c0' };
ports.forEach(q => { if (q.home !== 'en' || q.spec.land) return; const lat = LAT1 - q.y/DEG; if (q.name === 'New York') q.spec.roof = 'dutch'; else if (lat > 38.5) q.spec.roof = 'clap'; else if (lat > 31.5 && lat < 34) q.spec.roof = 'pastel'; });
  /* clapboard and shingle in New England, Dutch gables at New York, stucco at Charleston */
function buildTown(q){
  const sp = q.spec, r = rng(q.name.length*977 + q.name.charCodeAt(0)*31 + q.name.charCodeAt(1)), c = Math.cos(q.ang), n = Math.sin(q.ang);
  const P = q.P = (a, b) => [q.x + c*a - n*b, q.y + n*a + c*b], ok = (a, b) => { const u = P(a, b), v = P(a + 7, b); return isLand(u[0], u[1]) && isLand(v[0], v[1]); };
  const span = q.span = 34 + sp.sz*26, rows = sp.sz + 1; q.b = []; q.forts = []; q.wall = []; q.depth = 0;
  if (sp.ch){ for (const a of [-58, -46, -36]) if (ok(a, 0) && ok(a - 12, 0)){ q.church = { a, big: sp.ch === 2 }; break; } }
  for (let i = 0; i < rows; i++){ const a = -19 - i*21;
    for (let b = -span + 6; b <= span - 6; b += 19 + r()*4){ if (r() < .13) continue;
      if (q.church && Math.abs(b) < (q.church.big ? 26 : 17) && Math.abs(a - q.church.a) < (q.church.big ? 30 : 20)) continue;
      const jb = b + (r() - .5)*5, ja = a + (r() - .5)*4; if (!ok(ja, jb)) continue;
      q.b.push({ a: ja, b: jb, w: sp.roof === 'dutch' && i === 0 ? 10 + r()*3 : 13 + r()*6, d: sp.roof === 'dutch' && i === 0 ? 17 : 11 + r()*4, k: r()*4|0, hut: sp.roof === 'thatch' && r() < .6 });
        q.depth = Math.max(q.depth, -ja); } }
  sp.forts.forEach((kind, i) => { const side = i ? -1 : 1;
    for (const v of [[-16, span + 34], [-22, span + 18], [-34, span + 4], [-16, -(span + 34)], [-30, 0]]){ const b = v[1]*side;
      if (ok(v[0], b) && ok(v[0] - 14, b)){ q.forts.push({ kind, a: v[0], b }); break; } } });
  if (sp.walls){ const D = q.depth + 24, pts = []; for (let i = 0; i <= 26; i++){ const t = i/26, b = -(span + 12) + t*(2*span + 24), a = -4 - D*Math.sin(Math.PI*t)**.55;
    pts.push([a, b, ok(a, b)]); } q.wall = pts; }
  q.jet = sp.sz === 1 ? [0] : sp.sz === 2 ? [-24, 26] : [-44, 0, 44];
  q.yard = sp.yard && ok(-14, -(span - 10)) ? -(span - 10) : null;
}
function drawFort(q, f){
  const u = q.P(f.a, f.b), x = u[0], y = u[1], poly = (pts, dx, dy) => { cx.beginPath();
    pts.forEach((v, i) => { const w = q.P(f.a + v[0], f.b + v[1]); i ? cx.lineTo(w[0] + dx, w[1] + dy) : cx.moveTo(w[0] + dx, w[1] + dy); }); cx.closePath(); };
  let shape;
  if (f.kind === 'star'){ shape = []; for (let i = 0; i < 10; i++){ const a = i/10*TAU, r = i % 2 ? 15 : 25; shape.push([Math.cos(a)*r, Math.sin(a)*r]); } }
  else if (f.kind === 'castle') shape = [[-20,-24],[-12,-24],[-12,-18],[12,-18],[12,-24],[20,-24],[20,-12],[26,-12],[26,12],[20,12],[20,24],[12,24],[12,18],[-12,18],[-12,24],[-20,24],[-20,12],[-14,12],[-14,-12],[-20,-12]];
  else if (f.kind === 'battery') shape = [[10,-20],[14,-12],[14,12],[10,20],[-4,20],[-4,-20]];
  if (shape){ cx.fillStyle = 'rgba(10,30,25,.35)'; poly(shape, 3, 4); cx.fill(); cx.fillStyle = '#a7a99e'; poly(shape, 0, 0); cx.fill(); cx.strokeStyle = '#5d5f58'; cx.lineWidth = 1.5; cx.stroke();
    if (f.kind === 'castle'){ cx.fillStyle = '#8b8d83'; poly([[-9,-12],[9,-12],[9,12],[-9,12]], 0, 0); cx.fill(); cx.fillStyle = '#74766d';
      for (const v of [[-16,-18],[16,-18],[16,18],[-16,18]]){ const w = q.P(f.a + v[0], f.b + v[1]); circle(cx, w[0], w[1], 5); cx.fill(); } }
    else if (f.kind === 'star'){ cx.fillStyle = '#8b8d83'; circle(cx, x, y, 10); cx.fill(); }
    else { cx.fillStyle = '#1b1d1f'; for (const b of [-12, 0, 12]){ const w = q.P(f.a + 13, f.b + b), w2 = q.P(f.a + 19, f.b + b);
      cx.strokeStyle = '#1b1d1f'; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(w[0], w[1]);
      cx.lineTo(w2[0], w2[1]); cx.stroke(); } } }
  else { cx.fillStyle = 'rgba(10,30,25,.35)'; circle(cx, x + 3, y + 4, 12); cx.fill();
    cx.fillStyle = '#a3a59a'; circle(cx, x, y, 12); cx.fill(); cx.fillStyle = '#7f8178';
    circle(cx, x, y, 7.5); cx.fill();
    cx.strokeStyle = '#5d5f58'; cx.lineWidth = 1.5; cx.setLineDash([3, 3]); circle(cx, x, y, 10.5); cx.stroke(); cx.setLineDash([]); }
  const wd = wind.dir, fw = Math.sin(time*6 + q.x)*2.5; cx.lineCap = 'round';
  for (const v of [[7, q.nation.c1], [3, q.nation.c2]]){ cx.strokeStyle = v[1]; cx.lineWidth = v[0];
    cx.beginPath(); cx.moveTo(x, y); cx.quadraticCurveTo(x + Math.cos(wd)*9 - Math.sin(wd)*fw, y + Math.sin(wd)*9 + Math.cos(wd)*fw, x + Math.cos(wd)*19, y + Math.sin(wd)*19); cx.stroke(); }
  cx.lineCap = 'butt'; cx.fillStyle = '#2a1c10'; circle(cx, x, y, 2); cx.fill();
}
function drawPort(q){ if (!q.spec.land){ drawPort0(q); return; } cx.save(); cx.translate(q.x, q.y); cx.scale(.72, .72); cx.translate(-q.x, -q.y); try { drawPort0(q); } finally { cx.restore(); } }
function drawPort0(q){
  if (!q.b) buildTown(q);
  const P = q.P, sp = q.spec, span = q.span, roofs = ROOFS[sp.roof];
  const seg = (A, B, w, col) => { cx.strokeStyle = col; cx.lineWidth = w; cx.beginPath(); cx.moveTo(A[0], A[1]); cx.lineTo(B[0], B[1]); cx.stroke(); };
  cx.lineCap = 'butt'; cx.lineJoin = 'round';
  if (q.wall.length){ for (const pass of [[9, '#6f7168'], [6, '#b9b6a6']]){ cx.strokeStyle = pass[1]; cx.lineWidth = pass[0]; cx.beginPath(); let pen = false;
      for (const v of q.wall){ if (!v[2]){ pen = false; continue; } const u = P(v[0], v[1]); pen ? cx.lineTo(u[0], u[1]) : cx.moveTo(u[0], u[1]); pen = true; } cx.stroke(); }
    q.wall.forEach((v, i) => { if (v[2] && i % 5 === 2){ const u = P(v[0] - 3, v[1]); cx.fillStyle = '#a7a99e'; cx.save(); cx.translate(u[0], u[1]); cx.rotate(q.ang + .78); cx.fillRect(-6, -6, 12, 12); cx.strokeStyle = '#5d5f58'; cx.lineWidth = 1.2; cx.strokeRect(-6, -6, 12, 12); cx.restore(); } }); }
  if (sp.roof !== 'thatch'){ seg(P(-3, -span), P(-3, span), 13, 'rgba(0,20,25,.25)'); seg(P(-5, -span), P(-5, span), 11, '#b5ae9b'); seg(P(-1, -span), P(-1, span), 2, '#7d776a'); }
  for (const jb of q.jet){ const A = P(-4, jb), B = P(58, jb); seg([A[0]+3, A[1]+4], [B[0]+3, B[1]+4], 10, 'rgba(0,20,25,.3)'); seg(A, B, 9, '#8f6639');
    cx.strokeStyle = 'rgba(45,25,8,.4)'; cx.lineWidth = 1; for (let d = 0; d < 58; d += 5){ const u = P(d, jb-4.5), v = P(d, jb+4.5);
      cx.beginPath(); cx.moveTo(u[0], u[1]); cx.lineTo(v[0], v[1]); cx.stroke(); }
    cx.fillStyle = '#3f2913'; for (const d of [19, 38, 57]) for (const k of [-5, 5]){ const u = P(d, jb+k); circle(cx, u[0], u[1], 1.8); cx.fill(); }
    const u = P(24 + (jb & 7), jb + 13); cx.save(); cx.translate(u[0], u[1]); cx.rotate(q.ang + Math.PI/2 + .2);
    cx.fillStyle = 'rgba(0,20,25,.25)'; cx.beginPath(); cx.ellipse(2, 3, 9, 3.6, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#7a5532'; cx.beginPath(); cx.ellipse(0, 0, 9, 3.6, 0, 0, TAU);
      cx.fill(); cx.fillStyle = '#c9a877'; cx.beginPath(); cx.ellipse(0, 0, 6.5, 2.1, 0, 0, TAU); cx.fill(); cx.restore(); }
  if (q.yard != null){ const u = P(4, q.yard); cx.save(); cx.translate(u[0], u[1]); cx.rotate(q.ang); cx.fillStyle = '#9a7a4e'; cx.fillRect(-14, -9, 34, 18);
    cx.strokeStyle = '#5a3a1c'; cx.lineWidth = 1.6; cx.beginPath(); cx.ellipse(3, 0, 15, 6, 0, 0, TAU);
      cx.stroke(); cx.lineWidth = 1; for (let i = -9; i <= 15; i += 4){ cx.beginPath();
      cx.moveTo(i, -5); cx.lineTo(i, 5); cx.stroke(); } cx.restore(); }
  for (const b of q.b){ const u = P(b.a, b.b); if (b.hut){ cx.fillStyle = 'rgba(8,26,22,.3)';
    circle(cx, u[0] + 3, u[1] + 4, 7.5); cx.fill(); } else roofShadow(cx, u[0], u[1], b.w, b.d, q.ang + Math.PI/2, .7); }
  for (const b of q.b){ const u = P(b.a, b.b);
    if (b.hut){ const hg = cx.createRadialGradient(u[0] - 2, u[1] - 2, 1, u[0], u[1], 7.5);
      hg.addColorStop(0, '#dcc17c'); hg.addColorStop(1, '#9a7d3e'); cx.fillStyle = hg;
      circle(cx, u[0], u[1], 7.5); cx.fill(); cx.strokeStyle = '#7a6230'; cx.lineWidth = .8;
      cx.stroke(); cx.fillStyle = '#5a4020'; circle(cx, u[0], u[1], 1.3); cx.fill(); }
    else roofRect(cx, u[0], u[1], b.w, b.d, q.ang + Math.PI/2, roofs[b.k % roofs.length], WALLS[sp.roof], sp.roof === 'tile'); }
  if (q.church){ const big = q.church.big, u = P(q.church.a, 0), k = big ? 1.5 : 1; cx.save(); cx.translate(u[0], u[1]); cx.rotate(q.ang); cx.scale(k, k);
    cx.fillStyle = 'rgba(10,30,25,.35)'; cx.fillRect(-9, -11, 26, 30); cx.fillStyle = '#f4efe2'; cx.fillRect(-12, -14, 24, 28); cx.fillStyle = '#b9b3a2'; cx.fillRect(-12, -14, 12, 28);
    if (big){ cx.fillStyle = '#e6dfcd'; cx.fillRect(10, -15, 9, 9); cx.fillRect(10, 6, 9, 9);
      cx.fillStyle = '#9db7c4'; circle(cx, -2, 0, 7); cx.fill(); cx.strokeStyle = '#6d6a60';
      cx.lineWidth = 1; cx.stroke(); }
    else { cx.fillStyle = '#e6dfcd'; cx.fillRect(10, -6, 10, 12); }
    cx.fillStyle = '#6d6a60'; cx.fillRect(13, -1, 5, 2); cx.fillRect(14.5, -3.5, 2, 7); cx.restore();
    if (sp.sz === 3){ const v = P(q.church.a + 34, 0); cx.save(); cx.translate(v[0], v[1]); cx.rotate(q.ang); cx.fillStyle = 'rgba(214,196,150,.55)'; cx.fillRect(-11, -16, 22, 32); cx.restore(); } }
  q.forts.forEach(f => drawFort(q, f));
  if (state === 'play' && Math.hypot(q.x-p.x, q.y-p.y) < 560){ cx.setLineDash([6, 8]); cx.strokeStyle = 'rgba(214,165,78,.5)'; cx.lineWidth = 1.5;
    circle(cx, q.x, q.y, 170); cx.stroke(); cx.setLineDash([]); }
  const lb = P(-(q.depth + 46), 0); cx.textAlign = 'center'; cx.lineWidth = 4; cx.strokeStyle = 'rgba(8,25,30,.85)';
  cx.font = '24px "Pirata One", Georgia, serif'; cx.strokeText(q.name, lb[0], lb[1]); cx.fillStyle = C.bone; cx.fillText(q.name, lb[0], lb[1]);
  cx.font = '700 11px "Alegreya Sans", sans-serif'; cx.lineWidth = 3; const sub = q.nation.adj.toUpperCase() + (hostile(q.nk) ? ' · CLOSED TO YOU' : '');
    cx.strokeText(sub, lb[0], lb[1] + 15); cx.fillStyle = hostile(q.nk) ? '#ff8a73' : q.nation.tag;
    cx.fillText(sub, lb[0], lb[1] + 15);
}
function drawMelee(){
  const s = melee.s, mx = (p.x+s.x)/2, my = Math.min(p.y, s.y) - 78;
  cx.strokeStyle = 'rgba(60,40,20,.9)'; cx.lineWidth = 1.4; for (const k of [-.25, 0, .25]){ cx.beginPath();
    cx.moveTo(p.x + Math.cos(p.h)*p.t.len*k, p.y + Math.sin(p.h)*p.t.len*k); cx.lineTo(s.x + Math.cos(s.h)*s.t.len*k, s.y + Math.sin(s.h)*s.t.len*k); cx.stroke(); }
  cx.textAlign = 'center'; cx.lineWidth = 4; cx.strokeStyle = 'rgba(8,25,30,.85)';
    cx.font = '24px "Pirata One", Georgia, serif'; cx.strokeText('Boarding!', mx, my);
    cx.fillStyle = '#ffffff'; cx.fillText('Boarding!', mx, my);
  const w = 150, bar = (y, f, col, label) => { cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(mx - w/2 - 1, y - 1, w + 2, 9); cx.fillStyle = col; cx.fillRect(mx - w/2, y, w*clamp(f, 0, 1), 7);
    cx.font = '700 12px "Alegreya Sans", sans-serif'; cx.lineWidth = 3; cx.strokeText(label, mx, y + 21); cx.fillStyle = C.bone; cx.fillText(label, mx, y + 21); };
  bar(my + 8, p.crew/melee.pc0, '#6c9a55', 'Your crew ' + p.crew); bar(my + 36, s.crew/melee.ec0, s.t.tag, 'Theirs ' + s.crew);
}
function hullPath(g, L, Wd, T){
  const st = T.st, sr = T.sr, bw = T.bow;
  g.beginPath(); g.moveTo(L/2, 0); g.bezierCurveTo(L*bw, Wd*.5, L*.12, Wd*.56, -L*.12, Wd*.52);
  g.quadraticCurveTo(-L*.42, Wd*.5, -L/2, Wd*st); g.quadraticCurveTo(-L*(.5+sr), 0, -L/2, -Wd*st);
  g.quadraticCurveTo(-L*.42, -Wd*.5, -L*.12, -Wd*.52); g.bezierCurveTo(L*.12, -Wd*.56, L*bw, -Wd*.5, L/2, 0); g.closePath();
}
function rigging(s, fade, shadow){
  const T = s.t, L = T.len, Wd = T.wid, M = T.masts, main = M.length === 3 ? 1 : M.length - 1;
  const fa = angd(wind.dir, s.h), lee = Math.sin(fa) >= 0 ? 1 : -1, brace = clamp(fa*.5, -.6, .6);
  const belly = s.sail*(2 + 9*s.pol)*(s.pol < .2 ? 1 + .5*Math.sin(time*17 + s.x) : 1), // canvas shivers when she is in irons
    sailA = shadow ? .22 : .6 + .4*s.sails/100, col = shadow ? '#021215' : T.sailC;
  if (s.sails <= 8){ if (shadow) return; // dismasted: spars and canvas lie across the deck
    M.forEach((m, i) => { const a = 1 + h1(i*3.3 + L)*1.6, sp = Wd*1.5; cx.save(); cx.translate(m*L, 0); cx.rotate(a); cx.globalAlpha = fade;
      cx.fillStyle = 'rgba(235,228,205,.55)'; cx.beginPath(); cx.moveTo(-sp*.5, -2); cx.lineTo(sp*.3, -5); cx.lineTo(sp*.45, 4); cx.lineTo(-sp*.3, 5); cx.closePath(); cx.fill();
      cx.strokeStyle = '#2a1c10'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(-sp*.6, 0); cx.lineTo(sp*.6, 0); cx.stroke(); cx.restore(); });
    return; }
  if (s.sail > 0){ cx.globalAlpha = fade*sailA; cx.beginPath(); cx.moveTo(L*.66, 0);
    cx.quadraticCurveTo(L*.47, lee*Wd*.6*(.35 + .65*s.pol), M[0]*L + 3, lee*1.5); cx.lineTo(M[0]*L + 3, 0); cx.closePath();
    cx.fillStyle = col; cx.fill(); if (!shadow){ cx.strokeStyle = 'rgba(0,0,0,.28)'; cx.lineWidth = .8; cx.stroke(); } }
  if (T.rig === 'gaff'){
    const om = .16 + 1.1*(1 - Math.min(1, Math.abs(fa)/2.4));
    M.forEach((m, i) => { const mx = m*L, Lb = L*(M.length > 1 ? (i ? .38 : .3) : .6), bx = mx - Math.cos(om)*Lb, by = lee*Math.sin(om)*Lb;
      let nx = by, ny = -(bx - mx); const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; if (nx*Math.cos(fa) + ny*Math.sin(fa) < 0){ nx = -nx; ny = -ny; }
      cx.globalAlpha = fade*sailA;
      if (s.sail > 0){ const b2 = belly*1.5 + 3; cx.beginPath(); cx.moveTo(mx, 0); cx.quadraticCurveTo((mx+bx)/2 + nx*b2*1.6, by/2 + ny*b2*1.6, bx, by); cx.closePath();
        cx.fillStyle = col; cx.fill();
        if (!shadow){ cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = .8; cx.stroke(); cx.strokeStyle = s === p ? T.seam : 'rgba(0,0,0,.22)'; cx.lineWidth = s === p ? 1.6 : 1;
          for (const k of [.35, .65]){ cx.beginPath(); cx.moveTo(mx + (bx-mx)*k, by*k); cx.lineTo(mx + (bx-mx)*k + nx*b2*.75, by*k + ny*b2*.75); cx.stroke(); } } }
      if (!shadow){ cx.globalAlpha = fade; cx.strokeStyle = '#2a1c10'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(mx, 0); cx.lineTo(bx, by); cx.stroke();
        if (s.sail === 0){ cx.strokeStyle = T.sailC; cx.lineWidth = 3.2; cx.lineCap = 'round';
          cx.beginPath(); cx.moveTo(mx + (bx-mx)*.1, by*.1); cx.lineTo(mx + (bx-mx)*.92, by*.92);
          cx.stroke(); cx.lineCap = 'butt'; } } });
    return;
  }
  M.forEach((m, i) => { const span = Wd*(i === main ? 1.95 : 1.62);
    cx.save(); cx.translate(m*L, 0); cx.rotate(brace); cx.globalAlpha = fade*sailA;
    if (s.sail > 0){
      cx.beginPath(); cx.moveTo(0, -span/2); cx.quadraticCurveTo(belly*2, 0, 0, span/2); cx.quadraticCurveTo(belly*.4, 0, 0, -span/2); cx.closePath();
      cx.fillStyle = col; cx.fill();
      if (!shadow){
        const sg = cx.createLinearGradient(0, -span/2, 0, span/2); sg.addColorStop(0, 'rgba(0,0,0,.22)'); sg.addColorStop(.45, 'rgba(255,255,255,.1)'); sg.addColorStop(1, 'rgba(0,0,0,.15)');
        cx.fillStyle = sg; cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.34)'; cx.lineWidth = .8; cx.stroke();
        cx.strokeStyle = 'rgba(0,0,0,.13)'; cx.lineWidth = .7;
        for (const k of [-.28, 0, .28]){ const y = k*span, bx = belly*(1 - 4*k*k); cx.beginPath(); cx.moveTo(bx*.42, y); cx.lineTo(bx*1.02, y); cx.stroke(); }
        cx.beginPath(); cx.moveTo(0, -span/2); cx.quadraticCurveTo(belly*1.25, 0, 0, span/2); cx.strokeStyle = T.seam; cx.lineWidth = s === p || s.owner === 'pirate' ? 2.2 : 1.7; cx.stroke();
        const nh = Math.floor((100 - s.sails)/11); cx.fillStyle = 'rgba(8,25,30,.8)';
        for (let j = 0; j < nh; j++){ const hy = (h1(j*7.3 + i*2.9) - .5)*span*.8, hx = belly*.6*(1 - Math.pow(2*hy/span, 2)); circle(cx, hx, hy, 1.7); cx.fill(); }
      }
    }
    if (!shadow){ cx.globalAlpha = fade; cx.strokeStyle = '#2a1c10'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, -span/2); cx.lineTo(0, span/2); cx.stroke();
      if (s.sail === 0){ cx.strokeStyle = T.sailC; cx.lineWidth = 3.4; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(1.5, -span*.44); cx.lineTo(1.5, span*.44); cx.stroke(); cx.lineCap = 'butt'; } }
    cx.restore(); });
}
