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
  g.fillStyle = INK; g.textAlign = 'center'; g.font = '40px ' + FELLSC; g.fillText('The West Indies', bx + bw/2, by + 58);
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
  const hub = deck && cabTab === 'chart', inL = hub ? 262 : 0, inR = hub && paneOpen ? 288 : 0; /* in the cabin the muster lies to the left of the chart and a ship's card to the right */
  const aw = vw - pad.l - pad.r - inL - inR, top = deck && !chartPick ? 49 : 14, ah = vh - top - pad.b - 62, k0 = Math.min((vw - pad.l - pad.r)/W, ah/H), k = k0*chartV.z, w = Math.min(aw, W*k), h = Math.min(ah, H*k);
  const x = pad.l + inL + (aw - w)/2, y = top + (ah - h)/2, mxc = x + w/2;
  chartV.cx = clamp(chartV.cx, w/2/k, W - w/2/k); chartV.cy = clamp(chartV.cy, h/2/k, H - h/2/k);
  const ox = chartV.cx*k - w/2, oy = chartV.cy*k - h/2, cs = chartCache.width/W; chartGeo = { x, y, w, h, k, ox, oy };
  cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
  cx.imageSmoothingQuality = 'high'; cx.drawImage(chartCache, ox/k*cs, oy/k*cs, w/k*cs, h/k*cs, x, y, w, h);
  const X0 = x - ox, Y0 = y - oy, fs = clamp(11 + 3*chartV.z, 13, 20);
  routeOn(X0, Y0, k, 4.2, true);
  if (state !== 'title') for (const s of ships){ if (s.sinking != null || s.released) continue;
    const d = Math.hypot(s.x-p.x, s.y-p.y); if (s.role !== 'fleet' && s !== tracked && !s.surrendered && (prize(s) ? d > 1800 : d > 2600)) continue;
    const sx = X0 + s.x*k, sy = Y0 + s.y*k;
    if (s.role === 'fleet'){ /* a consort: a white pennant on her heading, with her name */
      const tk = s.task && s.task.type, pc = s.docked ? '#b9b39f' : tk === 'trade' ? '#e8b92e' : tk === 'escort' ? '#7fb0ff' : tk === 'raid' || tk === 'chase' ? '#ff8a73' : '#ffffff';
        /* gold for a trader, blue an escort, red a cruiser, grey in port */
      cx.save(); cx.translate(sx, sy); cx.rotate(s.docked ? -Math.PI/2 : s.h); cx.fillStyle = pc;
        cx.strokeStyle = INK; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(9, 0); cx.lineTo(-6, 5);
        cx.lineTo(-3, 0); cx.lineTo(-6, -5); cx.closePath(); cx.fill(); cx.stroke(); cx.restore();
      if (s === chartMark || s.docked || chartV.z >= 1.6 || Math.hypot(s.x - p.x, s.y - p.y) > 900){ cx.font = 'italic ' + Math.max(12, fs - 3) + 'px ' + FELL;
        cx.textAlign = 'left'; cx.lineWidth = 3.5; cx.strokeStyle = 'rgba(233,217,176,.92)';
        cx.strokeText(s.name, sx + 11, sy - 7); cx.fillStyle = '#1d4f6b'; cx.fillText(s.name, sx + 11, sy - 7); }
      continue; }
    cx.fillStyle = s.nation ? NAT[s.nation].c1 : '#111111';
      cx.strokeStyle = INK; cx.lineWidth = 1; cx.fillRect(sx - 3, sy - 3, 6, 6); cx.strokeRect(sx - 3, sy - 3, 6, 6); }
  if (fleet && fleet.lead){ const fx = X0 + fleet.lead.x*k, fy = Y0 + fleet.lead.y*k, r = 8;
    cx.fillStyle = '#e8b92e'; cx.strokeStyle = INK; cx.lineWidth = 1.5; cx.beginPath();
    cx.moveTo(fx, fy-r); cx.lineTo(fx+r, fy); cx.lineTo(fx, fy+r); cx.lineTo(fx-r, fy);
    cx.closePath(); cx.fill(); cx.stroke();
    cx.font = 'italic ' + (fs - 1) + 'px ' + FELL; cx.textAlign = 'center'; cx.lineWidth = 3.5;
      cx.strokeStyle = 'rgba(233,217,176,.9)'; cx.strokeText('The Plate Fleet', fx, fy - 13);
      cx.fillStyle = '#7a4a08'; cx.fillText('The Plate Fleet', fx, fy - 13); }
  if (hurr && showWx){ const hx = X0 + hurr.x*k, hy = Y0 + hurr.y*k, rr = 26; cx.strokeStyle = '#7a1c12'; cx.lineWidth = 2.6; cx.lineCap = 'round';
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
  if (showRoutes) for (const s of squad()){ const t = s.task; if (!t || t.type !== 'trade') continue;
    cx.strokeStyle = (t.made || 0) < 0 ? 'rgba(140,42,28,.75)' : 'rgba(31,107,58,.75)';
    cx.lineWidth = 2.4; cx.setLineDash([10, 6]); /* her run, green while it pays and red when it does not */
    if (t.area){ circle(cx, X0 + t.area.x*k, Y0 + t.area.y*k, t.area.r*k); cx.stroke();
      } else if (t.set.length === 2){ cx.beginPath(); cx.moveTo(X0 + t.set[0].x*k, Y0 + t.set[0].y*k);
      cx.lineTo(X0 + t.set[1].x*k, Y0 + t.set[1].y*k); cx.stroke(); } cx.setLineDash([]); }
  dispatches.slice(0, 6).forEach(v => { if (!v.x) return; const dx2 = X0 + v.x*k, dy2 = Y0 + v.y*k; cx.fillStyle = '#8c2a1c'; circle(cx, dx2, dy2, 4.5); cx.fill(); cx.strokeStyle = '#f4ecd2'; cx.lineWidth = 1; cx.stroke(); });
    /* a seal where each late dispatch was written */
  if (priceShow){ const base = GOODS[priceShow][1]; cx.font = '700 ' + Math.max(12, fs - 3) + 'px "Alegreya Sans", sans-serif'; cx.textAlign = 'center'; /* the price book, written on the chart */
    for (const q of ports){ const b = book[q.name] && book[q.name][priceShow]; if (!b) continue;
      const px2 = X0 + q.x*k, py2 = Y0 + q.y*k + 22, tw3 = cx.measureText(b[0]).width + 8;
      cx.fillStyle = b[0] <= base*.85 ? '#1f6b3a' : b[0] >= base*1.2 ? '#8c2a1c' : '#3a2614';
      cx.fillRect(px2 - tw3/2, py2 - 12, tw3, 16); cx.fillStyle = '#f4ecd2'; cx.fillText(b[0], px2, py2); } }
  { const ar = chartPick && chartPick.kind === 'area' && chartPick.step ? { x: chartPick.a[0], y: chartPick.a[1], r: clamp(Math.hypot((chartPtr[0] - x + ox)/k - chartPick.a[0], (chartPtr[1] - y + oy)/k - chartPick.a[1]), 500, 8000) } : chartMark && chartMark.task && chartMark.task.type === 'trade' ? chartMark.task.area : null;
    /* trading waters: being marked out, or already hers */
    if (ar){ cx.strokeStyle = '#0d6f73'; cx.lineWidth = 2.2; cx.setLineDash([9, 7]);
      circle(cx, X0 + ar.x*k, Y0 + ar.y*k, ar.r*k); cx.stroke(); cx.setLineDash([]); cx.fillStyle = 'rgba(13,111,115,.08)'; cx.fill();
      for (const q of ports) if (admits(q) && Math.hypot(q.ox - ar.x, q.oy - ar.y) < ar.r){ cx.strokeStyle = '#0d6f73'; cx.lineWidth = 2; circle(cx, X0 + q.x*k, Y0 + q.y*k, 11); cx.stroke(); } }
    if (chartMark && chartMark.task && chartMark.task.type === 'trade' && !chartMark.task.area) for (const q of chartMark.task.set){ cx.strokeStyle = '#0d6f73';
      cx.lineWidth = 2; circle(cx, X0 + q.x*k, Y0 + q.y*k, 11); cx.stroke(); }
    if (chartPick && chartPick.kind === 'two' && chartPick.a){ cx.strokeStyle = '#0d6f73'; cx.lineWidth = 3; circle(cx, X0 + chartPick.a.x*k, Y0 + chartPick.a.y*k, 13); cx.stroke(); } }
  if (chartMark && chartMark.sinking == null){ const mx2 = X0 + chartMark.x*k, my2 = Y0 + chartMark.y*k;
    cx.strokeStyle = '#0d6f73'; cx.lineWidth = 2.6; circle(cx, mx2, my2, 17 + 3*Math.sin(time*4));
    cx.stroke(); cx.lineWidth = 1.2; circle(cx, mx2, my2, 26 + 3*Math.sin(time*4)); cx.stroke();
    cx.font = fs + 'px ' + FELLSC; cx.textAlign = 'center'; cx.lineWidth = 4.5; cx.strokeStyle = 'rgba(233,217,176,.96)';
      cx.strokeText(chartMark.name, mx2, my2 + 48); cx.fillStyle = '#0d5a5e'; cx.fillText(chartMark.name, mx2, my2 + 48);
      } /* her name stands clear of the port names, under the ring */
  const ppx = X0 + p.x*k, ppy = Y0 + p.y*k; cx.strokeStyle = '#c8321e'; cx.lineWidth = 1.6; circle(cx, ppx, ppy, 12 + 2.5*Math.sin(time*4)); cx.stroke();
  cx.save(); cx.translate(ppx, ppy); cx.rotate(p.h); cx.fillStyle = '#c8321e'; cx.strokeStyle = INK;
    cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(-6, 5.5); cx.lineTo(-3, 0);
    cx.lineTo(-6, -5.5); cx.closePath(); cx.fill(); cx.stroke(); cx.restore();
  if (deck && showWx){ for (const q of ports) if (iced(q)){ cx.strokeStyle = 'rgba(60,110,150,.9)'; cx.lineWidth = 2; cx.setLineDash([3, 3]); circle(cx, X0 + q.x*k, Y0 + q.y*k, 10); cx.stroke(); cx.setLineDash([]); } /* harbours shut by ice */
    const wx = x + w - 54, wy = y + 56; cx.fillStyle = 'rgba(240,227,192,.9)'; circle(cx, wx, wy, 30); cx.fill(); cx.strokeStyle = INK; cx.lineWidth = 1.2; cx.stroke();
    cx.save(); cx.translate(wx, wy); cx.rotate(wind.dir); cx.strokeStyle = '#8c2a1c'; cx.fillStyle = '#8c2a1c'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(-20, 0); cx.lineTo(8, 0); cx.stroke();
      cx.beginPath(); cx.moveTo(20, 0); cx.lineTo(7, 7); cx.lineTo(7, -7); cx.closePath(); cx.fill(); cx.restore();
    const wl = 'Wind ' + Math.round(wind.str*windMul()*13) + ' kn'; cx.font = '13px ' + FELLSC; cx.textAlign = 'center'; cx.lineWidth = 3.5; cx.strokeStyle = 'rgba(233,217,176,.95)'; cx.strokeText(wl, wx, wy + 46); cx.fillStyle = INK; cx.fillText(wl, wx, wy + 46); }
  cx.restore(); cx.strokeStyle = C.brass; cx.lineWidth = deck ? 3 : 1.5; cx.strokeRect(x+.5, y+.5, w-1, h-1);
  cx.textAlign = 'center'; cx.font = '500 14px "Alegreya Sans", sans-serif'; cx.fillStyle = '#b9b39f';
  if (chartPick){ const hint = pickHint() + (coarse ? '' : ' Esc cancels.'); cx.font = '700 15px "Alegreya Sans", sans-serif';
    cx.textAlign = 'center'; const tw2 = cx.measureText(hint).width + 28; cx.fillStyle = 'rgba(8,25,30,.92)';
    cx.fillRect(mxc - tw2/2, y + 10, tw2, 30); cx.strokeStyle = C.brass; cx.lineWidth = 1.5;
    cx.strokeRect(mxc - tw2/2 + .5, y + 10.5, tw2 - 1, 29); cx.fillStyle = C.bone; cx.fillText(hint, mxc, y + 30); }
  if (!chartPick) cx.fillText((coarse ? 'Tap a port to set a course for it. Pinch to zoom, drag to move. Tap the sea to close.' : deck ? 'Click a port to set a course for it, or a ship of yours for her orders. Zoom with the wheel, move by dragging.' : 'Click a port to set a course for it. Zoom with the wheel or + and −, move by dragging or the arrow keys. Esc or a click on the sea closes.'), mxc, y + h + 22);
  const items = NKEYS.map(k2 => [k2, NAT[k2].land.replace(/^the /, '') + ': ' + standWord(standing[k2])]).concat([[null, 'Home: ' + homeName]]); let tw = 0;
  cx.font = '700 13px "Alegreya Sans", sans-serif'; items.forEach(v => { tw += cx.measureText(v[1]).width + 34; });
  let lx = mxc - tw/2 + 8; const ly = y + h + 44; cx.textAlign = 'left';
  if (tw < aw) items.forEach(v => { if (v[0]) flagRect(cx, v[0], Math.round(lx - 9), Math.round(ly - 11), 15, 10); else { cx.fillStyle = HOMEC; circle(cx, lx, ly - 4, 5); cx.fill(); } cx.fillStyle = C.bone; cx.fillText(v[1], lx + 9, ly); lx += cx.measureText(v[1]).width + 34; });
}

/* ---------- HUD ---------- */
const setT = (el, v) => { if (el._v !== v){ el._v = v; el.textContent = v; } };
const setW = (el, f) => { const v = Math.round(clamp(f, 0, 1)*100) + '%'; if (el._w !== v){ el._w = v; el.style.width = v; } };
let cardKey = null, cards = [];
function hud(){ tutTick();
  setT($('gold'), deck ? gold.toLocaleString('en-US') : String(gold)); setT($('rank'), inService() && navy.rank ? NAVY[navy.rank][1] : RANKS[rankIdx][1]);
    setT($('marq'), marque ? NAT[marque].adj + ' letter' : 'None'); $('marq').classList.toggle('on', !!marque);
  setT($('holdLine'), holdUsed() + '/' + holdCap() + ' t'); setT($('crewStat'), p.crew + '/' + p.t.crew);
  setT($('sailSet'), p.sail === 0 ? 'Furled' : p.sail < 1 ? 'Battle' : 'Full'); setT($('flagName'), p.name);
  const cl = $('courseLine'); if (cl.hidden === !!course) cl.hidden = !course;
  if (course) setT(cl, 'Course: ' + course.name + ' · ' + Math.max(1, Math.round(Math.hypot(course.x-p.x, course.y-p.y)/DEG*20)) + ' lg · ' + (autoHelm ? 'helmsman steering' : 'you have the helm (N)'));
  setW($('bHull'), p.hull/p.maxHull); setW($('bSails'), p.sails/100);
  const hc = p.hull/p.maxHull > .4 ? 'var(--moss)' : 'var(--blood)'; if ($('bHull')._c !== hc){ $('bHull')._c = hc; $('bHull').style.background = hc; }
  setW($('bPort'), 1 - p.rl[0]/(p.reload*crewSlow())); setW($('bStar'), 1 - p.rl[1]/(p.reload*crewSlow()));
  const sq = ships.filter(o => o.role === 'fleet' && o.sinking == null), key = (deck ? 'D|' : '') + sq.map(o => o.t.name + o.name).join('|');
  if (key !== cardKey){ cardKey = key; cards = []; const col = $('fleetCol'); col.textContent = ''; col.classList.toggle('many', sq.length > 4); // one compact card for each consort
    sq.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'shipcard'; b.title = 'Manage this ship';
      const nmE = document.createElement('span'); nmE.className = 'nm'; const t = document.createElement('span'), st = document.createElement('small');
        t.textContent = deck ? o.name : o.t.name; st.textContent = '★'.repeat(Math.round((o.cap.gun + o.cap.sea)/2));
        nmE.appendChild(t); nmE.appendChild(st); b.appendChild(nmE);
      if (deck){ const pn = document.createElement('i'), m = document.createElement('span'), tr = document.createElement('i'), f = document.createElement('b'); pn.className = 'pn'; nmE.insertBefore(pn, t);
        m.className = 'meter'; tr.appendChild(f); m.appendChild(tr); b.appendChild(m); b.title = 'Orders for the ' + o.name;
        b.addEventListener('click', () => openOrders(o)); col.appendChild(b); cards.push({ hull: f, pn, st, b, deck: true }); return; } /* on the quarterdeck: a pennant in the colour of her task, her name, what she is about, and her hull */
      const meter = label => { const m = document.createElement('span'), l = document.createElement('span'), tr = document.createElement('i'), f = document.createElement('b');
        m.className = 'meter'; l.textContent = label; tr.appendChild(f); m.appendChild(l);
        m.appendChild(tr); b.appendChild(m); return f; };
      const c = { hull: meter('Hull'), sails: meter('Sail'), crew: document.createElement('span') }; c.sails.style.background = 'var(--bone)'; c.crew.className = 'cr'; b.appendChild(c.crew);
      b.addEventListener('click', () => openOrders(o)); col.appendChild(b); cards.push(c); }); }
  sq.forEach((o, i) => { const c = cards[i]; if (!c) return; setW(c.hull, o.hull/o.maxHull);
    if (c.deck){ const tk = o.task && o.task.type, pc = o.docked ? 'pn p' : tk === 'trade' ? 'pn t' : tk === 'escort' ? 'pn e' : tk === 'raid' || tk === 'chase' ? 'pn c' : 'pn'; if (c.pn._c !== pc){ c.pn._c = pc; c.pn.className = pc; }
      const col = o.hull/o.maxHull > .4 ? 'var(--moss)' : 'var(--blood)'; if (c.hull._c !== col){ c.hull._c = col; c.hull.style.background = col; }
      setT(c.st, shortTask(o)); const vis = !sightOnly || !o.docked && Math.hypot(o.x - p.x, o.y - p.y) < 2600; if (c.b.hidden === vis) c.b.hidden = !vis; return; }
    setW(c.sails, o.sails/100);
    const col = o.hull/o.maxHull > .4 ? 'var(--moss)' : 'var(--blood)'; if (c.hull._c !== col){ c.hull._c = col; c.hull.style.background = col; }
    setT(c.crew, 'Crew ' + o.crew + '/' + o.t.crew + ' · ' + (o.task && o.task.type !== 'fleet' ? taskWord(o) : o.foe ? 'engaging' : 'in company')); });
  if (orderSel){ if (state !== 'play' || orderSel !== p && (orderSel.sinking != null || ships.indexOf(orderSel) < 0)) closeOrders();
    else if (!picking && orderSel !== p) setT($('ordNote'), taskWord(orderSel) + '. Hull ' + Math.round(orderSel.hull/orderSel.maxHull*100) + '%, crew ' + orderSel.crew + '.'); }
  const fr = $('fleetRow'); if (fr.hidden === !!sq.length) fr.hidden = !sq.length;
  const bb = $('boardBtn'), live = state === 'play' && !chartOpen && !menuOpen, sr = live ? searchable() : null, b0 = live ? boardable() : null, bs = sr && (!b0 || b0 === sr) ? null : b0;
  if (bb.hidden === !!(bs || sr)) bb.hidden = !(bs || sr); if (bs) setT(bb, deck ? 'B · board the ' + nm(bs) : 'Board the ' + nm(bs) + (coarse ? '' : ' · B'));
    else if (sr) setT(bb, deck ? 'B · stop and search the ' + nm(sr) : 'Stop and search the ' + nm(sr) + (coarse ? '' : ' · B'));
  const ce = $('chase'), me = $('missionLine');
  if (ce.hidden === !!tracked) ce.hidden = !tracked;
  if (tracked){ const td = Math.hypot(tracked.x-p.x, tracked.y-p.y), g = Math.cos(Math.atan2(tracked.y-p.y, tracked.x-p.x) - wind.dir);
    setT(ce, 'Chase: ' + tracked.t.name + ' · ' + Math.max(1, Math.round(td/DEG*20)) + ' lg' + (td < 1100 && Math.abs(g) > .3 ? g > 0 ? ' · weather gauge yours' : ' · she has the weather gauge' : '')); }
  if (me.hidden === !!mission) me.hidden = !mission;
  if (mission || contract) setT(me, (mission ? 'Commission: ' + missionText() : '') + (mission && contract ? ' · ' : '') + (contract ? 'Freight: ' + contract.tons + ' t ' + GOODS[contract.g][0].toLowerCase() + ' for ' + contract.port.name : ''));
  const d = $('dock'), show = state === 'play' && !!nearPort && !chartOpen;
  if (d.hidden === show) d.hidden = !show;
  if (show) setT(d, deck ? 'F · drop anchor at ' + nearPort.name : 'Drop anchor at ' + nearPort.name + (coarse ? '' : ' · F'));
  if (deck) deckHud(); cabinSync();
}
/* ---------- The quarterdeck: instruments at the edges of the sea ---------- */
let dk = null, sightOnly = false, warKey = '', placed = false;
const shortTask = o => { const t = o.task; return o.docked ? 'in port, ' + o.docked.name : !t || t.type === 'fleet' ? (o.foe ? 'engaging' : inCompany(o) ? 'in line' : 'rejoining') : t.type === 'trade' ? 'bound for ' + t.dest.name : t.type === 'escort' ? 'escorting'
  : t.type === 'raid' ? (t.prey ? 'chasing' : t.label === 'blockade' ? 'blockading' : t.label === 'patrol' ? 'on patrol' : 'cruising') : t.type === 'chase' ? 'engaging' : t.type === 'hold' ? 'holding' : t.type === 'port' ? 'for ' + t.port.name : taskWord(o).toLowerCase(); };
function placeHud(){ const d = deckQ.matches; if (placed && d === deck) return; placed = true; deck = d; document.body.classList.toggle('deck', d); const tl = document.querySelector('.tools'), more = document.querySelector('.more'), lb = $('ledgerBtn');
  if (d){ $('whenBox').appendChild($('paceBtn')); $('binRow').appendChild($('shotBtn')); ['aimBtn', 'muteBtn', 'zoomOutBtn', 'zoomInBtn', 'fsBtn'].forEach(k => $('menuOpts').appendChild($(k))); }
  else { tl.insertBefore($('shotBtn'), tl.firstChild); tl.insertBefore($('aimBtn'), $('shotBtn').nextSibling); tl.insertBefore($('paceBtn'), $('aimBtn').nextSibling);
    ['muteBtn', 'zoomOutBtn', 'zoomInBtn'].forEach(k => more.insertBefore($(k), lb)); more.appendChild($('fsBtn')); }
  cardKey = null; } /* the same buttons serve both layouts; they are moved to where each layout keeps them */
const rot = (el, a) => { const d = Math.round(a*180/Math.PI); if (el._r !== d){ el._r = d; el.setAttribute('transform', 'rotate(' + d + ')'); } };
function deckHud(){
  if (!dk){ dk = {}; ['gDate', 'gWx', 'gWar', 'gWarT', 'nHull', 'nSails', 'nCrew', 'bCrew', 'flagNote', 'flagCls', 'target', 'tgName', 'tgHull', 'tgSails', 'tgNote', 'arcP', 'arcS', 'gunPT', 'gunST', 'roseShip', 'roseWind', 'posN', 'knots', 'cabTxt', 'cabSeal', 'sightBtn', 'topbar'].forEach(k => { dk[k] = $(k); });
    let t = ''; for (let i = 0; i < 16; i++) t += '<line y1="-52" y2="' + (i % 2 ? -46 : -40) + '" transform="rotate(' + i*22.5 + ')"/>'; $('roseTicks').innerHTML = t; dk.sails = [...document.querySelectorAll('#binRow [data-sail]')]; }
  const hr = (clock/DAY*24 + 8) % 24; setT(dk.gDate, dateStr());
  setT(dk.gWx, ('0' + Math.floor(hr)).slice(-2) + ':' + ('0' + Math.floor(hr % 1*6)*10).slice(-2) + ' · ' + (weather.hur ? 'hurricane' : hurr ? 'glass falling' : WX[weather.next && weather.k < .5 ? weather.next : weather.kind][0].toLowerCase()) + ' · wind ' + Math.round(wind.str*windMul()*13*(weather.hur ? 1 + 1.6*weather.k : 1)) + ' kn');
  const wk = [...wars].join() + marque + dpr; if (wk !== warKey){ warKey = wk; const c = dk.gWar, g = c.getContext('2d'), fw = 22, fh = 14, gap = 12, mid = i => 1 + i*(fw + gap) + fw/2; c.width = Math.round(124*dpr); c.height = Math.round(32*dpr); g.scale(dpr, dpr);
    NKEYS.slice(0, 4).forEach((k, i) => { flagRect(g, k, 1 + i*(fw + gap), 2, fw, fh); if (k === marque){ g.strokeStyle = '#e6c06a'; g.lineWidth = 2; g.strokeRect(i*(fw + gap), 1, fw + 2, fh + 2); } });
    [...wars].forEach(w => { const a = NKEYS.indexOf(w.slice(0, 2)), b = NKEYS.indexOf(w.slice(3)); if (a > 3 || b > 3) return; const dip = 3 + Math.abs(a - b)*3.6, mx = (mid(a) + mid(b))/2, my = 18 + dip;
      g.strokeStyle = '#ff6a55'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(mid(a), 18); g.quadraticCurveTo(mx, 18 + dip*2, mid(b), 18); g.stroke();
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(mx - 3, my - 3); g.lineTo(mx + 3, my + 3); g.moveTo(mx + 3, my - 3); g.lineTo(mx - 3, my + 3); g.stroke(); });
    setT(dk.gWarT, wars.size ? 'At war' : 'At peace'); dk.gWarT.classList.toggle('war', wars.size > 0); }
  setT(dk.nHull, String(Math.round(p.hull/p.maxHull*100))); setT(dk.nSails, String(Math.round(p.sails))); setW(dk.bCrew, p.crew/p.t.crew); setT(dk.nCrew, p.crew + '/' + p.t.crew);
  setT(dk.flagCls, 'flagship · ' + p.t.cname); setT(dk.flagNote, 'Hands ' + moraleWord() + ' · hold ' + holdUsed() + ' of ' + holdCap() + ' tons');
  const t = state === 'play' && tracked && tracked.sinking == null ? tracked : null; if (dk.target.hidden === !!t){ dk.target.hidden = !t; document.body.classList.toggle('tgt', !!t); }
  if (t){ const td = Math.hypot(t.x - p.x, t.y - p.y), g = Math.cos(Math.atan2(t.y - p.y, t.x - p.x) - wind.dir); setT(dk.tgName, cap1(nm(t))); setW(dk.tgHull, t.hull/t.maxHull); setW(dk.tgSails, t.sails/100);
    setT(dk.tgNote, Math.max(1, Math.round(td/DEG*20)) + ' leagues' + (t.surrendered ? ' · she has struck her colours' : td < 1100 && Math.abs(g) > .3 ? g > 0 ? ' · the weather gauge is yours' : ' · she has the weather gauge' : '')); }
  if ((tick & 31) === 0){ const w = dk.topbar.offsetWidth; if (dk._w !== w){ dk._w = w; document.documentElement.style.setProperty('--tlw', w + 'px'); document.body.classList.toggle('tight', innerWidth - w - 46 - 360 - 250 < 0); } }
  rot(dk.roseShip, p.h); rot(dk.roseWind, wind.dir); const pos = pointOfSail(Math.abs(angd(p.h, wind.dir))); setT(dk.posN, pos); setT(dk.knots, (p.speed/16).toFixed(1) + ' kn');
  if (dk.posN._i !== (pos === 'In irons')){ dk.posN._i = pos === 'In irons'; dk.posN.classList.toggle('irons', dk.posN._i); }
  const si = p.sail === 0 ? 0 : p.sail < 1 ? 1 : 2; if (dk._si !== si){ dk._si = si; dk.sails.forEach((b, i) => b.setAttribute('aria-pressed', String(i === si))); }
  [[dk.arcP, dk.gunPT, 0, 'Port'], [dk.arcS, dk.gunST, 1, 'Starboard']].forEach(v => { const f = clamp(1 - p.rl[v[2]]/(p.reload*crewSlow()), 0, 1), q = Math.round(f*60);
    if (v[0]._q !== q){ v[0]._q = q; v[0].setAttribute('stroke-dasharray', (f*188.5).toFixed(1) + ' 189'); v[0].setAttribute('class', f >= 1 ? 'g1 rdy' : 'g1'); } setT(v[1], f >= 1 ? v[3] + ' · ready' : v[3] + ' guns'); });
  setT(dk.cabTxt, 'Great cabin' + (dispNew ? ' · ' + dispNew : '')); if (dk.cabSeal.hidden === !!dispNew) dk.cabSeal.hidden = !dispNew;
}
function setSight(on){ sightOnly = !!on; const b = $('sightBtn'); b.textContent = sightOnly ? 'In sight only' : 'All ships'; b.setAttribute('aria-pressed', String(sightOnly)); store('sight', sightOnly ? '1' : '0'); }
$('sightBtn').addEventListener('click', e => { setSight(!sightOnly); e.currentTarget.blur(); }); setSight(recall('sight') === '1');
document.querySelectorAll('#binRow [data-sail]').forEach(b => b.addEventListener('click', () => { if (state === 'play' && p.alive && !melee && !paused) p.sail = +b.dataset.sail*.5; b.blur(); }));
$('gunP').addEventListener('click', e => { act('port'); e.currentTarget.blur(); }); $('gunS').addEventListener('click', e => { act('star'); e.currentTarget.blur(); });
$('cabinBtn').addEventListener('click', e => { setChart(true); e.currentTarget.blur(); });
/* ---------- The great cabin: chart, fleet, ledger, dispatches, gazette and log book as six tabs on one table ---------- */
let cabTab = null, paperMode = '', cabF = 0, musterKey = '', paneKey = '', paneOpen = false, showRoutes = true, showWx = true;
const CAB = { chart: () => setChart(true), fleet: () => openFleet(fleetSel), ledger: () => openPaper('ledger'), dispatches: () => openPaper('dispatches'), gazette: () => openPaper('gazette'), log: () => openMenu() };
function cabinSync(){ const live = deck && (state === 'play' || state === 'port') && !chartPick;
  const tab = !live ? null : chartOpen ? 'chart' : !$('ask').hidden || !$('manifest').hidden ? null : !$('fleetSheet').hidden ? 'fleet' : !$('paper').hidden ? (paperMode === 'ledger' || paperMode === 'dispatches' || paperMode === 'gazette' ? paperMode : null) : !$('menu').hidden ? 'log' : null;
  if (tab !== cabTab){ cabTab = tab; $('cabinBar').hidden = !tab; document.body.classList.toggle('cabin', !!tab); document.querySelectorAll('#cabinBar [data-cab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cab === tab)));
    $('cabBack').textContent = state === 'port' ? 'Back ashore' : 'Back on deck'; $('muster').hidden = tab !== 'chart'; musterKey = paneKey = ''; if (tab !== 'chart'){ $('shipPane').hidden = true; paneOpen = false; } }
  if (!tab) return; cabF++; setT($('cabNote'), dateStr() + ' · ' + gold.toLocaleString('en-US') + ' gold'); setT($('cabDTxt'), 'Dispatches' + (dispNew ? ' · ' + dispNew : '')); if ($('cabDSeal').hidden === !!dispNew) $('cabDSeal').hidden = !dispNew;
  if (tab === 'chart' && (cabF & 7) === 1) renderMuster(); }
const mEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const penOf = s => s === p ? 'pn f' : s.docked ? 'pn p' : s.task && s.task.type === 'trade' ? 'pn t' : s.task && s.task.type === 'escort' ? 'pn e' : s.task && (s.task.type === 'raid' || s.task.type === 'chase') ? 'pn c' : 'pn';
const whereShort = s => { if (s === p) return state === 'port' && curPort ? 'At ' + curPort.name : cap1(offWhere(p.x, p.y).trim().replace(/^at sea, (\d+) leagues from/, '$1 lg from')); const t = s.task;
  return s.docked ? s.docked.name : t && t.type === 'trade' ? 'Bound for ' + t.dest.name : t && t.type === 'port' ? 'For ' + t.port.name : inCompany(s) ? 'With the flag' : cap1(offWhere(s.x, s.y).trim().replace(/^at sea, (\d+) leagues from/, '$1 lg from')); };
const doingShort = s => { if (s === p) return 'Flagship'; const t = s.task; return s.docked ? (t && t.type === 'trade' ? (t.need ? 'Wants funds' : 'Loading') : 'In port') : !t || t.type === 'fleet' ? 'In line' : t.type === 'trade' ? 'Trading' : t.type === 'escort' ? 'Escorting'
  : t.type === 'raid' ? (t.prey ? 'Chasing' : t.label === 'blockade' ? 'Blockading' : t.label === 'patrol' ? 'On patrol' : 'Cruising') : t.type === 'chase' ? 'Engaging' : t.type === 'hold' ? 'Holding' : t.type === 'port' ? 'Making port' : 'Detached'; };
const holdShort = s => { const t = s.task && s.task.type === 'trade' ? s.task : null; if (t) return t.cargo ? GOODS[t.cargo.g][0] + ' ' + t.cargo.tons + ' t' : '—';
  const m = stowage().get(s) || {}, ks = GK.filter(g => m[g] > 0).sort((a, b) => m[b] - m[a]); return ks.length ? GOODS[ks[0]][0] + ' ' + m[ks[0]] + ' t' + (ks.length > 1 ? ' +' + (ks.length - 1) : '') : '—'; };
function chartSelect(s){ chartMark = s; if (s){ chartV.cx = s.x; chartV.cy = s.y; } musterKey = paneKey = ''; renderMuster(); }
function renderMuster(){ const all = [p].concat(squad()), sel = all.indexOf(chartMark) >= 0 ? chartMark : null;
  const key = all.map(s => s.name + Math.round(s.hull/s.maxHull*100) + penOf(s) + whereShort(s)).join('|') + '|' + all.indexOf(sel);
  if (key !== musterKey){ musterKey = key; const L = $('musterList'), had = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.mi : null; L.textContent = '';
    all.forEach((s, i) => { const b = mEl('button', 'mitem'), l1 = mEl('span', 'l1'), a = mEl('span'), pn = mEl('i', penOf(s)); b.type = 'button'; b.id = 'mi_' + i; b.dataset.mi = i; b.setAttribute('aria-pressed', String(s === sel));
      a.appendChild(pn); a.appendChild(mEl('b', '', s.name)); l1.appendChild(a); l1.appendChild(mEl('span', '', Math.round(s.hull/s.maxHull*100) + '%')); b.appendChild(l1);
      b.appendChild(mEl('span', 'l2', (s === p ? '' : doingShort(s) + ' · ') + whereShort(s))); b.addEventListener('click', () => chartSelect(chartMark === s ? null : s)); L.appendChild(b); });
    if (had != null && $('mi_' + had)) $('mi_' + had).focus({ preventScroll: true }); }
  renderPane(sel); }
function renderPane(s){ const P = $('shipPane'); if (!s){ if (!P.hidden){ P.hidden = true; paneOpen = false; paneKey = ''; } return; }
  const sq = squad(), i = sq.indexOf(s), t = s.task && s.task.type === 'trade' ? s.task : null, last = s !== p && dispatches.find(v => v.id === s.id);
  const key = s.name + '|' + nowLine(s) + '|' + holdShort(s) + '|' + (t ? Math.round(t.funds) + '/' + (t.made || 0) : '') + '|' + (last ? last.t : '') + '|' + !!course + gold;
  if (key === paneKey && !P.hidden) return; paneKey = key; P.textContent = ''; P.hidden = false; paneOpen = true;
  const add = (tag, cls, txt) => { const e = mEl(tag, cls, txt); P.appendChild(e); return e; }, btn = (r, id, label, on, fn, ink) => { const b = mEl('button', ink ? 'ink' : '', label); b.type = 'button'; b.id = id; b.disabled = !on; b.addEventListener('click', () => { fn(); musterKey = paneKey = ''; }); r.appendChild(b); };
  { const x = add('button', 'x', '×'); x.type = 'button'; x.id = 'cp_x'; x.setAttribute('aria-label', 'Put her card away'); x.addEventListener('click', () => chartSelect(null)); }
  add('div', 'sc ph2', s.name).style.borderBottom = '0';
  add('div', 'sub', cap1(s.t.cname) + (s === p ? ' · your flagship' : s.cap.mate ? ' · under your first mate' : ' · Capt. ' + s.cap.name + ' ' + '★'.repeat(Math.round((s.cap.gun + s.cap.sea)/2)) + (s.cap.trait && TRAITS[s.cap.trait] ? ', ' + TRAITS[s.cap.trait][0] : '')));
  add('hr', 'rule'); add('p', 'now', nowLine(s));
  add('div', 'k', 'Hull, sails and crew'); { const v = add('div', 'v'), hb = mEl('span', 'mrow'); v.textContent = Math.round(s.hull/s.maxHull*100) + ' · ' + Math.round(s.sails) + ' · ' + s.crew + ' of ' + s.t.crew + ' hands'; }
  add('div', 'k', 'In her hold'); add('div', 'v', t ? (t.cargo ? GOODS[t.cargo.g][0] + ' ' + t.cargo.tons + ' t' : 'In ballast') + ' · ' + s.t.hold + ' tons burthen' : (() => { const m = stowage().get(s) || {}, ks = GK.filter(g => m[g] > 0); return (ks.length ? ks.map(g => GOODS[g][0] + ' ' + m[g] + ' t').join(' · ') : 'Empty') + ' · ' + s.t.hold + ' tons burthen'; })());
  if (t){ add('div', 'k', 'Her run'); const v = add('div', 'v'), b = mEl('b', (t.made || 0) < 0 ? 'dn' : 'up', ((t.made || 0) >= 0 ? '+' : '') + (t.made || 0) + ' gold'); v.appendChild(document.createTextNode((t.runs || 0) + ' cargoes · ')); v.appendChild(b); v.appendChild(document.createTextNode(' · stock ' + Math.round(t.funds))); }
  add('div', 'k', 'Orders'); const r = add('div', 'btns');
  if (s === p){ btn(r, 'cp_clear', 'Clear the course', !!course, () => setCourse(null)); btn(r, 'cp_hold', 'Manifest', true, () => openManifest()); }
  else { if (t) btn(r, 'cp_sail', 'Sail now', !!s.docked, () => tradeSail(s), true); btn(r, 'cp_join', 'Rejoin the flag', !!(s.task && s.task.type !== 'fleet') || !!s.docked, () => setTask(s, { type: 'fleet' }));
    btn(r, 'cp_port', 'To a port…', true, () => pickOnChart(s, 'port')); btn(r, 'cp_cruise', 'Cruise…', true, () => pickOnChart(s, 'cruise')); btn(r, 'cp_block', 'Blockade…', true, () => pickOnChart(s, 'blockade'));
    btn(r, 'cp_two', 'Trade two ports…', true, () => pickOnChart(s, 'two')); btn(r, 'cp_area', 'Trade an area…', true, () => pickOnChart(s, 'area')); }
  { const r2 = add('div', 'btns'); r2.style.marginTop = '10px'; btn(r2, 'cp_page', 'Her page in the muster book', true, () => { setChart(false); openFleet(s === p ? 'F' : 'S' + i); }); }
  if (last){ const w = add('div', 'word'); w.appendChild(mEl('span', 'seal')); w.appendChild(document.createTextNode('“' + last.t.slice(0, 150) + (last.t.length > 150 ? '…' : '') + '”')); } }
document.querySelectorAll('#cabinBar [data-cab]').forEach(b => b.addEventListener('click', () => { if (b.dataset.cab === cabTab) return; if (menuOpen) closeMenu(); CAB[b.dataset.cab](); }));
$('cabBack').addEventListener('click', () => { if (chartOpen) setChart(false); if (menuOpen) closeMenu(); });
$('cRoutes').addEventListener('click', e => { showRoutes = !showRoutes; e.currentTarget.setAttribute('aria-pressed', String(showRoutes)); });
$('cWx').addEventListener('click', e => { showWx = !showWx; e.currentTarget.setAttribute('aria-pressed', String(showWx)); });

/* ---------- Boot ---------- */
let last = 0;
let lastErr = '';
