const INK = '#3a2614', FELL = '"IM Fell English", Georgia, "Times New Roman", serif', FELLSC = '"IM Fell English SC", Georgia, serif';
const chartV = { z: 1, cx: 0, cy: 0 }; let chartCache = null, chartGeo = null;
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { chartCache = null; });
function buildChart(){
  const cw = 2600, chh = Math.round(cw*H/W), c = document.createElement('canvas'); c.width = cw; c.height = chh;
  const g = c.getContext('2d'), k = cw/W, r = rng(77), mx = lon => X(lon)*k, my = lat => Y(lat)*k;
  g.fillStyle = '#e9d9b0'; g.fillRect(0, 0, cw, chh);
  for (let i = 0; i < 320; i++){ const x = r()*cw, y = r()*chh, rad = 40 + r()*230, a = .025 + r()*.05, gr = g.createRadialGradient(x, y, 0, x, y, rad), col = r() < .55 ? '120,85,40,' : '255,250,225,';
    gr.addColorStop(0, 'rgba(' + col + a + ')'); gr.addColorStop(1, 'rgba(' + col + '0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad*2, rad*2); }
  g.strokeStyle = 'rgba(90,60,30,.05)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 1400; i++){ const x = r()*cw, y = r()*chh, l = 8 + r()*40, a = (r() - .5)*.5;
    g.moveTo(x, y); g.lineTo(x + Math.cos(a)*l, y + Math.sin(a)*l); } g.stroke();
  const roses = [[mx(-93), my(24.6), 62], [mx(-79.5), my(13.3), 74], [mx(-63.3), my(22.4), 50]];
  roses.forEach(c2 => { for (let i = 0; i < 32; i++){ const a = i/32*TAU; g.strokeStyle = i % 8 === 0 ? 'rgba(58,38,20,.3)' : i % 4 === 0 ? 'rgba(40,95,75,.22)' : i % 2 === 0 ? 'rgba(150,50,30,.16)' : 'rgba(58,38,20,.09)'; g.lineWidth = .9;
    g.beginPath(); g.moveTo(c2[0], c2[1]); g.lineTo(c2[0] + Math.cos(a)*4000, c2[1] + Math.sin(a)*4000); g.stroke(); } });
  g.strokeStyle = 'rgba(58,38,20,.2)'; g.lineWidth = .8; g.fillStyle = INK; g.font = '15px ' + FELL; g.textAlign = 'center';
  for (let lon = -95; lon <= -60; lon += 5){ g.beginPath(); g.moveTo(mx(lon), 0);
    g.lineTo(mx(lon), chh); g.stroke(); g.fillText(-lon + '° W', mx(lon), 40); g.fillText(-lon + '° W', mx(lon), chh - 28); }
  g.textAlign = 'left'; for (let lat = 10; lat <= 45; lat += 5){ g.beginPath(); g.moveTo(0, my(lat));
    g.lineTo(cw, my(lat)); g.stroke(); g.fillText(lat + '° N', 30, my(lat) - 5); g.fillText(lat + '° N', cw - 76, my(lat) - 5); }
  g.save(); g.scale(k, k); g.lineJoin = 'round';
  const CS = DEG/640; for (const v of [[560, .045], [380, .06], [230, .08], [120, .1], [50, .14]]){ g.strokeStyle = 'rgba(58,112,132,' + v[1] + ')';
    g.lineWidth = v[0]*CS; lands.forEach(l => g.stroke(l.path)); }
  lands.forEach(l => { g.save(); g.clip(l.path); g.fillStyle = '#dcc88f'; g.fillRect(l.x0, l.y0, l.x1 - l.x0, l.y1 - l.y0);
    g.strokeStyle = 'rgba(105,125,70,.2)'; g.lineWidth = 420*CS; g.stroke(l.path);
      g.strokeStyle = 'rgba(125,92,45,.3)'; g.lineWidth = 150*CS; g.stroke(l.path); g.strokeStyle = 'rgba(100,70,35,.32)';
      g.lineWidth = 46*CS; g.stroke(l.path); g.restore(); });
  g.strokeStyle = INK; g.lineWidth = 1.5/k; lands.forEach(l => g.stroke(l.path)); g.restore();
  g.strokeStyle = 'rgba(58,38,20,.75)'; g.lineWidth = 1.1; g.lineCap = 'round';
  for (let gy = 0; gy < H; gy += 350) for (let gx = 0; gx < W; gx += 350){ const x = gx + hh(gx, gy, 31)*280, y = gy + hh(gx, gy, 32)*280;
    if (hh(gx, gy, 33) > .62 || !at(deepM, x, y) || !at(deepM, x + 320, y) || !at(deepM, x - 320, y) || !at(deepM, x, y + 320) || !at(deepM, x, y - 320)) continue;
    const px = x*k, py = y*k, sz = 6 + hh(gx, gy, 34)*6; g.beginPath(); g.moveTo(px - sz, py + sz*.5);
      g.quadraticCurveTo(px - sz*.2, py - sz*1.1, px + sz*.1, py - sz*.9); g.quadraticCurveTo(px + sz*.6, py - sz*.3, px + sz, py + sz*.5); g.stroke();
    g.beginPath(); for (let j = 0; j < 3; j++){ g.moveTo(px + sz*(.25 + j*.2), py - sz*(.45 - j*.22)); g.lineTo(px + sz*(.35 + j*.2), py + sz*.42); } g.stroke(); }
  const spaced = (t, x, y, size, gap, rot, col, sc) => { g.save(); g.translate(x, y);
    g.rotate(rot || 0); g.font = (sc ? '' : 'italic ') + size + 'px ' + (sc ? FELLSC : FELL);
    g.fillStyle = col || INK; g.textAlign = 'left';
    let w = 0; for (const ch of t) w += g.measureText(ch).width + gap; let px = -w/2; for (const ch of t){ g.fillText(ch, px, 0); px += g.measureText(ch).width + gap; } g.restore(); };
  const SEA = 'rgba(40,82,104,.8)';
  spaced('CARIBBEAN SEA', mx(-71.5), my(15), 40, 26, 0, SEA); spaced('or the North Sea', mx(-71.5), my(14.2), 22, 4, 0, SEA);
  spaced('GULF OF MEXICO', mx(-90.5), my(25.6), 34, 20, 0, SEA); spaced('THE WESTERN OCEAN', mx(-66.5), my(31), 40, 26, 0, SEA); spaced('or Atlantick Sea', mx(-66.5), my(30.1), 22, 4, 0, SEA);
  spaced('NEW ENGLAND', mx(-72.3), my(43.4), 17, 6, -.5, INK, 1); spaced('NEW YORK', mx(-75.6), my(42.6), 15, 5, 0, INK, 1);
    spaced('PENSILVANIA', mx(-77.8), my(40.8), 15, 5, 0, INK, 1); spaced('VIRGINIA', mx(-78.6), my(37.6), 19, 8, 0, INK, 1);
    spaced('CAROLINA', mx(-80.6), my(34.7), 20, 9, -.3, INK, 1); spaced('GEORGIA', mx(-83.3), my(32.4), 15, 6, 0, INK, 1);
  spaced('LOUISIANA', mx(-92), my(32.5), 28, 18, 0, INK, 1); spaced('NOVA SCOTIA', mx(-64.4), my(45.05), 13, 4, -.45, INK, 1);
    spaced('CANADA', mx(-74), my(46.2), 22, 14, 0, INK, 1); spaced('The Gulf Stream', mx(-76.2), my(34.1), 17, 4, -.75, SEA);
    spaced('Bermudas', mx(-64.7), my(33.1), 15, 2, 0, INK);
  { g.save(); g.strokeStyle = 'rgba(58,38,20,.5)'; g.lineWidth = 3; g.setLineDash([2, 13]); g.lineCap = 'round'; /* the great trades, pricked out as a pilot would */
    for (const ln of [[[-96, 19.6], [-90, 22.8], [-84.5, 23.6], [-82.4, 23.6], [-80.2, 24.6], [-79.5, 27.5], [-78.5, 31.5], [-74.5, 35.6], [-66, 40], [-59, 42.5]], [[-76.6, 17.6], [-74.6, 19.2], [-73.9, 20.6], [-73.6, 23.5], [-73.6, 30], [-73.7, 39.9]], [[-70.6, 42.3], [-66, 34], [-61, 22], [-59.9, 13.4]], [[-75.7, 10.7], [-77.5, 15.5], [-76.9, 17.6]], [[-70.6, 42.3], [-66.5, 43.2], [-63.5, 44.4], [-60, 45.6]], [[-61.2, 14.3], [-63, 17.2], [-65, 18.9], [-73, 20.4]]]){ g.beginPath();
      ln.forEach((v, i) => i ? g.lineTo(mx(v[0]), my(v[1])) : g.moveTo(mx(v[0]), my(v[1]))); g.stroke(); } g.restore();
    spaced('The Homeward Track', mx(-67.5), my(39.3), 19, 3, -.3, INK); spaced('The Provision Trade', mx(-64.4), my(27.5), 19, 3, 1.25, INK);
      spaced('Track from Jamaica', mx(-73.1), my(27.5), 18, 2, -1.57, INK); }
  { g.save(); g.strokeStyle = 'rgba(70,120,140,.2)'; g.lineWidth = 2*280*k; g.lineCap = 'round';
    g.lineJoin = 'round'; g.beginPath(); GS.forEach((v, i) => i ? g.lineTo(v[0]*k, v[1]*k) : g.moveTo(v[0]*k, v[1]*k)); g.stroke(); g.restore(); }
  spaced('Bay of Honduras', mx(-86.6), my(17.6), 20, 3, 0, SEA); spaced('Windward Passage', mx(-74.3), my(20.9), 15, 1, -.9, SEA); spaced('Straits of Florida', mx(-81.2), my(24.1), 17, 3, .12, SEA);
  spaced('CUBA', mx(-79.2), my(22), 26, 22, .22, INK, 1); spaced('HISPANIOLA', mx(-70.6), my(18.85), 21, 9, 0, INK, 1); spaced('JAMAICA', mx(-77.3), my(18.12), 13, 4, .1, INK, 1);
  spaced('FLORIDA', mx(-81.6), my(28.3), 19, 8, 1.2, INK, 1); spaced('YUCATAN', mx(-89), my(19.6), 22, 10, 0, INK, 1); spaced('NEW SPAIN', mx(-94.3), my(17.4), 22, 10, -.25, INK, 1);
  spaced('HONDURAS', mx(-86.6), my(14.7), 20, 9, 0, INK, 1); spaced('TIERRA FIRME', mx(-68), my(8.9), 30, 20, 0, INK, 1); spaced('DARIEN', mx(-78.2), my(8.35), 15, 6, .2, INK, 1);
  spaced('The Bahama Islands', mx(-74.3), my(25.3), 19, 4, .5, INK); spaced('The Caribbee Islands', mx(-59.9), my(16.6), 18, 4, 1.45, INK);
    spaced('PORTO RICO', mx(-66.45), my(18.22), 10, 2, 0, INK, 1);
  roses.forEach(c2 => { const R0 = c2[2]; g.save(); g.translate(c2[0], c2[1]);
    g.fillStyle = '#e9d9b0'; g.strokeStyle = INK; g.lineWidth = 1.2; circle(g, 0, 0, R0*.62); g.fill(); g.stroke(); circle(g, 0, 0, R0*.56); g.stroke();
    for (const lv of [[16, R0*.5, .09, 'rgba(40,95,75,.9)'], [8, R0*.74, .13, 'rgba(150,50,30,.9)'], [4, R0, .17, INK]]){ const n = lv[0];
      for (let i = 0; i < n; i++){ const a = i/n*TAU - Math.PI/2 + (n === 8 ? TAU/16 : n === 16 ? TAU/32 : 0);
      for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(Math.cos(a)*lv[1], Math.sin(a)*lv[1]);
        g.lineTo(Math.cos(a + sd*lv[2]*2.4)*R0*.16, Math.sin(a + sd*lv[2]*2.4)*R0*.16); g.lineTo(0, 0);
        g.closePath(); g.fillStyle = sd < 0 ? lv[3] : '#efe2bd'; g.fill(); g.strokeStyle = INK;
        g.lineWidth = .8; g.stroke(); } } }
    g.fillStyle = INK; g.beginPath(); g.moveTo(0, -R0 - 22); g.quadraticCurveTo(9, -R0 - 10, 3, -R0 - 3); g.lineTo(-3, -R0 - 3); g.quadraticCurveTo(-9, -R0 - 10, 0, -R0 - 22); g.fill();
    g.font = '16px ' + FELLSC; g.textAlign = 'center'; g.fillText('N', 0, -R0 - 26); g.restore(); });
  const boat = (x, y, sc, flip) => { g.save(); g.translate(x, y); g.scale(sc*(flip ? -1 : 1), sc); g.strokeStyle = INK; g.fillStyle = '#e9d9b0'; g.lineWidth = 1.2/sc;
    g.beginPath(); g.moveTo(-26, 4); g.quadraticCurveTo(0, 16, 28, 2); g.lineTo(34, -6); g.lineTo(22, -3); g.lineTo(-22, -3); g.lineTo(-30, -9); g.closePath(); g.fill(); g.stroke();
    for (const m of [[-12, 30], [4, 38], [18, 26]]){ g.beginPath(); g.moveTo(m[0], -3);
      g.lineTo(m[0], -m[1] - 6); g.stroke(); g.beginPath(); g.moveTo(m[0] - 9, -m[1]);
      g.quadraticCurveTo(m[0] + 6, -m[1]*.55, m[0] - 9, -8); g.lineTo(m[0] + 8, -8); g.quadraticCurveTo(m[0] + 15, -m[1]*.55, m[0] + 8, -m[1]);
      g.closePath(); g.fill(); g.stroke(); }
    g.beginPath(); for (let i = -36; i < 40; i += 12){ g.moveTo(i, 14); g.quadraticCurveTo(i + 3, 10, i + 6, 14); } g.stroke(); g.restore(); };
  boat(mx(-88.3), my(23.6), 1.1, false); boat(mx(-66.2), my(13.6), 1.3, true); boat(mx(-72.2), my(23.9), .9, true);
  const bx = mx(-96.6), by = my(45.9), bw = mx(-86.2) - bx, bh = my(42.85) - by; // cartouche, out in the unexplored interior
  g.fillStyle = 'rgba(233,217,176,.92)'; g.fillRect(bx, by, bw, bh); g.strokeStyle = INK;
    g.lineWidth = 2.2; g.strokeRect(bx, by, bw, bh); g.lineWidth = .9; g.strokeRect(bx + 7, by + 7, bw - 14, bh - 14);
  g.fillStyle = INK; g.textAlign = 'center'; g.font = '42px "Pirata One", ' + FELL; g.fillText('The West Indies', bx + bw/2, by + 58);
  g.font = 'italic 21px ' + FELL; g.fillText('with the Coast of North America to Cape Breton,', bx + bw/2, by + 90);
    g.fillText('for Merchants, Privateers & Officers of the Navy', bx + bw/2, by + 116);
  const lg = 5*DEG*k, sx0 = bx + bw/2 - lg/2 - 30, sy0 = by + bh - 34; g.lineWidth = 1.2; g.strokeRect(sx0, sy0, lg, 8); for (let i = 0; i < 4; i += 2) g.fillRect(sx0 + lg/4*i, sy0, lg/4, 8);
  g.font = '15px ' + FELL; g.fillText('0', sx0, sy0 - 5); g.fillText('50', sx0 + lg/2, sy0 - 5); g.fillText('100 Leagues', sx0 + lg + 8, sy0 - 5);
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(9, 9, cw - 18, chh - 18); g.lineWidth = 1.3; g.strokeRect(19, 19, cw - 38, chh - 38);
  for (const v of [[0, 0, cw, 0, 0, 1], [0, chh, cw, chh, 0, -1], [0, 0, 0, chh, 1, 0], [cw, 0, cw, chh, -1, 0]]){ const gr = g.createLinearGradient(v[0], v[1], v[0] + v[4]*150, v[1] + v[5]*150);
    gr.addColorStop(0, 'rgba(70,42,16,.42)'); gr.addColorStop(1, 'rgba(70,42,16,0)'); g.fillStyle = gr; g.fillRect(0, 0, cw, chh); }
  return c;
}
function drawBigChart(){
  cx.fillStyle = 'rgba(5,16,20,.93)'; cx.fillRect(0, 0, vw, vh);
  if (!chartCache) chartCache = buildChart();
  const aw = vw - pad.l - pad.r, top = 14, ah = vh - top - pad.b - 62, k0 = Math.min(aw/W, ah/H), k = k0*chartV.z, w = Math.min(aw, W*k), h = Math.min(ah, H*k);
  const x = pad.l + (aw - w)/2, y = top + (ah - h)/2;
  chartV.cx = clamp(chartV.cx, w/2/k, W - w/2/k); chartV.cy = clamp(chartV.cy, h/2/k, H - h/2/k);
  const ox = chartV.cx*k - w/2, oy = chartV.cy*k - h/2, cs = chartCache.width/W; chartGeo = { x, y, w, h, k, ox, oy };
  cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
  cx.imageSmoothingQuality = 'high'; cx.drawImage(chartCache, ox/k*cs, oy/k*cs, w/k*cs, h/k*cs, x, y, w, h);
  const X0 = x - ox, Y0 = y - oy, fs = clamp(11 + 3*chartV.z, 13, 20);
  routeOn(X0, Y0, k, 4.2, true);
  if (state !== 'title') for (const s of ships){ if (s.sinking != null || s.released) continue;
    const d = Math.hypot(s.x-p.x, s.y-p.y); if (s.role !== 'fleet' && s !== tracked && !s.surrendered && (prize(s) ? d > 1800 : d > 2600)) continue;
    const sx = X0 + s.x*k, sy = Y0 + s.y*k; cx.fillStyle = s.role === 'fleet' ? '#ffffff' : s.nation ? NAT[s.nation].c1 : '#111111';
      cx.strokeStyle = INK; cx.lineWidth = 1; cx.fillRect(sx - 3, sy - 3, 6, 6); cx.strokeRect(sx - 3, sy - 3, 6, 6); }
  if (fleet && fleet.lead){ const fx = X0 + fleet.lead.x*k, fy = Y0 + fleet.lead.y*k, r = 8;
    cx.fillStyle = '#e8b92e'; cx.strokeStyle = INK; cx.lineWidth = 1.5; cx.beginPath();
    cx.moveTo(fx, fy-r); cx.lineTo(fx+r, fy); cx.lineTo(fx, fy+r); cx.lineTo(fx-r, fy);
    cx.closePath(); cx.fill(); cx.stroke();
    cx.font = 'italic ' + (fs - 1) + 'px ' + FELL; cx.textAlign = 'center'; cx.lineWidth = 3.5;
      cx.strokeStyle = 'rgba(233,217,176,.9)'; cx.strokeText('The Plate Fleet', fx, fy - 13);
      cx.fillStyle = '#7a4a08'; cx.fillText('The Plate Fleet', fx, fy - 13); }
  if (hurr){ const hx = X0 + hurr.x*k, hy = Y0 + hurr.y*k, rr = 26; cx.strokeStyle = '#7a1c12'; cx.lineWidth = 2.6; cx.lineCap = 'round';
    for (let a = 0; a < 3; a++){ cx.beginPath(); for (let t = 0; t <= 1.001; t += .1){ const an = a*TAU/3 + t*3.4 - time*1.6, r2 = 4 + t*rr, px2 = hx + Math.cos(an)*r2, py2 = hy + Math.sin(an)*r2;
      t ? cx.lineTo(px2, py2) : cx.moveTo(px2, py2); } cx.stroke(); } cx.lineCap = 'butt';
    cx.font = 'italic ' + fs + 'px ' + FELL; cx.textAlign = 'center'; cx.lineWidth = 3.5;
      cx.strokeStyle = 'rgba(233,217,176,.9)'; cx.strokeText('Hurricane', hx, hy - rr - 10);
      cx.fillStyle = '#7a1c12'; cx.fillText('Hurricane', hx, hy - rr - 10); }
  const mt = missionTarget(); if (mt){ cx.strokeStyle = '#0d6f73'; cx.lineWidth = 2.4; circle(cx, X0 + mt.x*k, Y0 + mt.y*k, 13 + Math.sin(time*4)); cx.stroke(); }
  const placed = [], rank = q => q.name === homeName ? 9 : q === course ? 8 : q.spec.land ? 0 : q.spec.sz; /* the greater places are named first, and a name gives way rather than lie across another */
  for (const q of ports.slice().sort((a, b) => rank(b) - rank(a))){ const px = X0 + q.x*k, py = Y0 + q.y*k, home = q.name === homeName, la = q.spec.la == null ? q.ang : q.spec.la, c = Math.cos(la), n = Math.sin(la);
    if (q === course){ cx.strokeStyle = '#c8321e'; cx.lineWidth = 2.4; circle(cx, px, py, 13); cx.stroke(); }
    if (home){ cx.fillStyle = HOMEC; cx.strokeStyle = INK; cx.lineWidth = 1.5; cx.beginPath();
      for (let i = 0; i < 10; i++){ const a = i/10*TAU - Math.PI/2, r = i % 2 ? 6 : 13;
      cx.lineTo(px + Math.cos(a)*r, py + Math.sin(a)*r); } cx.closePath(); cx.fill(); cx.stroke(); }
    else { const fw = q.spec.land ? 11 : q.spec.sz >= 3 ? 20 : q.spec.sz === 2 ? 17 : 14, fh = Math.round(fw*.64);
      cx.globalAlpha = hostile(q.nk) ? .45 : 1; flagRect(cx, q.nk, Math.round(px - fw/2), Math.round(py - fh/2), fw, fh); cx.globalAlpha = 1; }
    if (!home && q !== course && !(mt && mt.port === q) && chartV.z < (q.spec.land ? 3.2 : q.spec.sz >= 3 ? 0 : q.spec.sz === 2 ? 1.5 : 2.3)) continue;
      /* small places are named when you look closer */
    cx.font = fs + 'px ' + FELLSC; cx.textAlign = c > .3 ? 'left' : c < -.3 ? 'right' : 'center'; const tx = px + c*13, ty = py + n*17 + 5, label = q.name + (home ? ' (home)' : '');
    { const tw = cx.measureText(label).width, bx0 = cx.textAlign === 'left' ? tx : cx.textAlign === 'right' ? tx - tw : tx - tw/2, box = [bx0 - 3, ty - fs, bx0 + tw + 3, ty + 4];
      if (placed.some(o => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1])) continue; placed.push(box); }
    cx.lineWidth = 4; cx.strokeStyle = 'rgba(233,217,176,.92)'; cx.strokeText(label, tx, ty); cx.fillStyle = home ? '#0b6b4c' : INK; cx.fillText(label, tx, ty); }
  const ppx = X0 + p.x*k, ppy = Y0 + p.y*k; cx.strokeStyle = '#c8321e'; cx.lineWidth = 1.6; circle(cx, ppx, ppy, 12 + 2.5*Math.sin(time*4)); cx.stroke();
  cx.save(); cx.translate(ppx, ppy); cx.rotate(p.h); cx.fillStyle = '#c8321e'; cx.strokeStyle = INK;
    cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(-6, 5.5); cx.lineTo(-3, 0);
    cx.lineTo(-6, -5.5); cx.closePath(); cx.fill(); cx.stroke(); cx.restore();
  cx.restore(); cx.strokeStyle = C.brass; cx.lineWidth = 1.5; cx.strokeRect(x+.5, y+.5, w-1, h-1);
  cx.textAlign = 'center'; cx.font = '500 14px "Alegreya Sans", sans-serif'; cx.fillStyle = '#b9b39f';
  cx.fillText((coarse ? 'Tap a port to set a course for it. Pinch to zoom, drag to move. Tap the sea to close.' : 'Click a port to set a course for it. Zoom with the wheel or + and −, move by dragging or the arrow keys. Esc or a click on the sea closes.'), vw/2, y + h + 22);
  const items = NKEYS.map(k2 => [k2, NAT[k2].land.replace(/^the /, '') + ': ' + standWord(standing[k2])]).concat([[null, 'Home: ' + homeName]]); let tw = 0;
  cx.font = '700 13px "Alegreya Sans", sans-serif'; items.forEach(v => { tw += cx.measureText(v[1]).width + 34; });
  let lx = vw/2 - tw/2 + 8; const ly = y + h + 44; cx.textAlign = 'left';
  if (tw < aw) items.forEach(v => { if (v[0]) flagRect(cx, v[0], Math.round(lx - 9), Math.round(ly - 11), 15, 10); else { cx.fillStyle = HOMEC; circle(cx, lx, ly - 4, 5); cx.fill(); } cx.fillStyle = C.bone; cx.fillText(v[1], lx + 9, ly); lx += cx.measureText(v[1]).width + 34; });
}

/* ---------- HUD ---------- */
const setT = (el, v) => { if (el._v !== v){ el._v = v; el.textContent = v; } };
const setW = (el, f) => { const v = Math.round(clamp(f, 0, 1)*100) + '%'; if (el._w !== v){ el._w = v; el.style.width = v; } };
let cardKey = null, cards = [];
function hud(){
  setT($('gold'), String(gold)); setT($('rank'), inService() && navy.rank ? NAVY[navy.rank][1] : RANKS[rankIdx][1]);
    setT($('marq'), marque ? NAT[marque].adj + ' letter' : 'None'); $('marq').classList.toggle('on', !!marque);
  setT($('holdLine'), holdUsed() + '/' + holdCap() + ' t'); setT($('crewStat'), p.crew + '/' + p.t.crew);
  setT($('sailSet'), p.sail === 0 ? 'Furled' : p.sail < 1 ? 'Battle' : 'Full'); setT($('flagName'), p.name);
  const cl = $('courseLine'); if (cl.hidden === !!course) cl.hidden = !course;
  if (course) setT(cl, 'Course: ' + course.name + ' · ' + Math.max(1, Math.round(Math.hypot(course.x-p.x, course.y-p.y)/DEG*20)) + ' lg · ' + (autoHelm ? 'helmsman steering' : 'you have the helm (N)'));
  setW($('bHull'), p.hull/p.maxHull); setW($('bSails'), p.sails/100);
  const hc = p.hull/p.maxHull > .4 ? 'var(--moss)' : 'var(--blood)'; if ($('bHull')._c !== hc){ $('bHull')._c = hc; $('bHull').style.background = hc; }
  setW($('bPort'), 1 - p.rl[0]/(p.reload*crewSlow())); setW($('bStar'), 1 - p.rl[1]/(p.reload*crewSlow()));
  const sq = ships.filter(o => o.role === 'fleet' && o.sinking == null), key = sq.map(o => o.t.name).join('|');
  if (key !== cardKey){ cardKey = key; cards = []; const col = $('fleetCol'); col.textContent = ''; // one compact card for each consort
    sq.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'shipcard'; b.title = 'Manage this ship';
      const nmE = document.createElement('span'); nmE.className = 'nm'; const t = document.createElement('span'), st = document.createElement('small');
        t.textContent = o.t.name; st.textContent = '★'.repeat(Math.round((o.cap.gun + o.cap.sea)/2));
        nmE.appendChild(t); nmE.appendChild(st); b.appendChild(nmE);
      const meter = label => { const m = document.createElement('span'), l = document.createElement('span'), tr = document.createElement('i'), f = document.createElement('b');
        m.className = 'meter'; l.textContent = label; tr.appendChild(f); m.appendChild(l);
        m.appendChild(tr); b.appendChild(m); return f; };
      const c = { hull: meter('Hull'), sails: meter('Sail'), crew: document.createElement('span') }; c.sails.style.background = 'var(--bone)'; c.crew.className = 'cr'; b.appendChild(c.crew);
      b.addEventListener('click', () => openOrders(o)); col.appendChild(b); cards.push(c); }); }
  sq.forEach((o, i) => { const c = cards[i]; if (!c) return; setW(c.hull, o.hull/o.maxHull); setW(c.sails, o.sails/100);
    const col = o.hull/o.maxHull > .4 ? 'var(--moss)' : 'var(--blood)'; if (c.hull._c !== col){ c.hull._c = col; c.hull.style.background = col; }
    setT(c.crew, 'Crew ' + o.crew + '/' + o.t.crew + ' · ' + (o.task && o.task.type !== 'fleet' ? taskWord(o) : o.foe ? 'engaging' : 'in company')); });
  if (orderSel){ if (state !== 'play' || orderSel !== p && (orderSel.sinking != null || ships.indexOf(orderSel) < 0)) closeOrders();
    else if (!picking && orderSel !== p) setT($('ordNote'), taskWord(orderSel) + '. Hull ' + Math.round(orderSel.hull/orderSel.maxHull*100) + '%, crew ' + orderSel.crew + '.'); }
  const fr = $('fleetRow'); if (fr.hidden === !!sq.length) fr.hidden = !sq.length;
  const bb = $('boardBtn'), live = state === 'play' && !chartOpen && !menuOpen, sr = live ? searchable() : null, b0 = live ? boardable() : null, bs = sr && (!b0 || b0 === sr) ? null : b0;
  if (bb.hidden === !!(bs || sr)) bb.hidden = !(bs || sr); if (bs) setT(bb, 'Board the ' + nm(bs) + (coarse ? '' : ' · B'));
    else if (sr) setT(bb, 'Stop and search the ' + nm(sr) + (coarse ? '' : ' · B'));
  const ce = $('chase'), me = $('missionLine');
  if (ce.hidden === !!tracked) ce.hidden = !tracked;
  if (tracked){ const td = Math.hypot(tracked.x-p.x, tracked.y-p.y), g = Math.cos(Math.atan2(tracked.y-p.y, tracked.x-p.x) - wind.dir);
    setT(ce, 'Chase: ' + tracked.t.name + ' · ' + Math.max(1, Math.round(td/DEG*20)) + ' lg' + (td < 1100 && Math.abs(g) > .3 ? g > 0 ? ' · weather gauge yours' : ' · she has the weather gauge' : '')); }
  if (me.hidden === !!mission) me.hidden = !mission;
  if (mission) setT(me, 'Commission: ' + missionText());
  const d = $('dock'), show = state === 'play' && !!nearPort && !chartOpen;
  if (d.hidden === show) d.hidden = !show;
  if (show) setT(d, 'Drop anchor at ' + nearPort.name + (coarse ? '' : ' · F'));
}

/* ---------- Boot ---------- */
let last = 0;
let lastErr = '';
