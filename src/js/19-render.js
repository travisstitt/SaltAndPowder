function render(dt){
  time += dt;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.fillStyle = C.sea; cx.fillRect(0, 0, vw, vh);
  const sk = shake > .3 ? shake : 0;
  const camX = p.x + Math.cos(p.h)*30 + rand(-sk, sk), camY = p.y + Math.sin(p.h)*30 + rand(-sk, sk); camNow.x = camX; camNow.y = camY;
  const hw = vw/scale/2, hh2 = vh/scale/2, x0 = camX-hw, y0 = camY-hh2, x1 = camX+hw, y1 = camY+hh2;
  const wc = Math.cos(wind.dir), wn = Math.sin(wind.dir);
  drift.x += wc*dt*26*wind.str; drift.y += wn*dt*26*wind.str;
  cx.save(); cx.translate(vw/2, vh/2); cx.scale(scale, scale); cx.translate(-camX, -camY);

  for (const L of [[patDark, 2.6, .35], [patLight, 1.5, 1], [patFine, 1, 1.5]]){ const ox = drift.x*L[2], oy = drift.y*L[2], k = L[1];
    cx.save(); cx.translate(ox, oy); cx.scale(k, k); cx.fillStyle = L[0]; cx.fillRect((x0-ox)/k, (y0-oy)/k, (x1-x0)/k, (y1-y0)/k); cx.restore(); }
  const G = scale < .6 ? 192 : 96, ox = drift.x*.55, oy = drift.y*.55; cx.lineWidth = 1.2; cx.lineCap = 'round';
  for (let gx = Math.floor((x0-ox)/G); gx <= Math.floor((x1-ox)/G); gx++) for (let gy = Math.floor((y0-oy)/G); gy <= Math.floor((y1-oy)/G); gy++){
    const f = hh(gx, gy, 1), f2 = hh(gx, gy, 2), ph = .5 + .5*Math.sin(time*1.1 + f*TAU), al = .05 + .16*ph;
    const wx = gx*G + f*G + ox, wy = gy*G + f2*G + oy, w = 6 + f2*8;
    cx.strokeStyle = 'rgba(3,30,40,' + (al*.9).toFixed(3) + ')'; cx.beginPath(); cx.moveTo(wx-w, wy+2.5); cx.quadraticCurveTo(wx, wy-3, wx+w, wy+2.5); cx.stroke();
    cx.strokeStyle = 'rgba(205,240,238,' + al.toFixed(3) + ')'; cx.beginPath(); cx.moveTo(wx-w, wy); cx.quadraticCurveTo(wx, wy-5.5, wx+w, wy); cx.stroke();
    if (ph > .93 && f > .5){ cx.fillStyle = 'rgba(255,255,245,' + ((ph-.93)*9).toFixed(3) + ')'; cx.fillRect(wx + 20, wy - 14, 1.4, 5); cx.fillRect(wx + 18.2, wy - 12.2, 5, 1.4); }
  }
  cx.lineCap = 'butt';
  cx.fillStyle = 'rgba(4,14,18,.6)';
  if (x0 < 0) cx.fillRect(x0, y0, -x0, y1-y0); if (x1 > W) cx.fillRect(W, y0, x1-W, y1-y0);
  if (y0 < 0) cx.fillRect(Math.max(0, x0), y0, Math.min(W, x1)-Math.max(0, x0), -y0); if (y1 > H) cx.fillRect(Math.max(0, x0), H, Math.min(W, x1)-Math.max(0, x0), y1-H);

  const lod = scale*dpr < .95, budget = { n: lod ? 5 : 2 };
  for (let tj = Math.max(0, Math.floor((y0-80)/TS)); tj <= Math.min(Math.ceil(H/TS)-1, Math.floor((y1+80)/TS)); tj++)
    for (let ti = Math.max(0, Math.floor((x0-80)/TS)); ti <= Math.min(TGW-1, Math.floor((x1+80)/TS)); ti++){
      if (!tileLand[tj*TGW+ti]) continue; const t = tileAt(ti, tj, budget, lod) || (lod ? tiles.get(tj*TGW + ti) : tilesLo.get(tj*TGW + ti)); if (t) cx.drawImage(t, ti*TS, tj*TS, TS, TS); }
  const sw = Math.sin(time*1.1); cx.lineJoin = 'round';
  for (const l of lands){ if (l.x1 < x0-20 || l.x0 > x1+20 || l.y1 < y0-20 || l.y0 > y1+20) continue;
    for (const c of l.chunks){ if (c.x1 < x0-20 || c.x0 > x1+20 || c.y1 < y0-20 || c.y0 > y1+20) continue;
      cx.strokeStyle = 'rgba(235,252,250,' + (.1 + .06*sw).toFixed(3) + ')'; cx.lineWidth = 12 + 5*sw; cx.stroke(c.path);
      cx.strokeStyle = 'rgba(255,255,255,' + (.55 - .15*sw).toFixed(3) + ')'; cx.lineWidth = 2.4; cx.stroke(c.path); } }
  if (!reduced && (streamAt(p.x, p.y) || streamAt(p.x + 700, p.y) || streamAt(p.x - 700, p.y) || streamAt(p.x, p.y + 700) || streamAt(p.x, p.y - 700))){ const bx = Math.floor(p.x/800)*800, by = Math.floor(p.y/800)*800;
    cx.lineCap = 'round'; /* the Stream: bluer water, and lines of weed setting north-east */
    for (let i = 0; i < 110; i++){ const wx = bx + (h1(i*1.7 + bx*.001) - .5)*2000, wy = by + (h1(i*2.9 + by*.001 + 3) - .5)*2000;
      if (wx < x0 || wx > x1 || wy < y0 || wy > y1) continue; const sv = streamAt(wx, wy); if (!sv) continue;
      const m = Math.hypot(sv[0], sv[1]) || 1, ph = (time*.22 + h1(i*5.3)) % 1, ux = sv[0]/m, uy = sv[1]/m, fx = wx + ux*ph*110, fy = wy + uy*ph*110, al = Math.sin(ph*Math.PI)*(m/26);
      cx.strokeStyle = i % 3 ? 'rgba(165,225,240,' + (al*.5).toFixed(3) + ')' : 'rgba(206,178,88,' + (al*.75).toFixed(3) + ')';
        cx.lineWidth = i % 3 ? 1.8 : 2.6; cx.beginPath(); cx.moveTo(fx, fy); cx.lineTo(fx + ux*(i % 3 ? 48 : 13), fy + uy*(i % 3 ? 48 : 13));
        cx.stroke(); } cx.lineCap = 'butt'; }
  for (const w of wrecks){ const a = Math.min(1, w.t/12); cx.globalAlpha = a; /* what a sunk ship leaves: planks, casks, and a boat pulling clear */
    for (let i = 0; i < 9; i++){ const an = h1(w.seed + i)*TAU, d = h1(w.seed + i*3.1)*w.r*.9 + (w.max - w.t)*.25, x = w.x + Math.cos(an)*d, y = w.y + Math.sin(an)*d + Math.sin(time*1.4 + i)*1.2;
      cx.save(); cx.translate(x, y); cx.rotate(an*2.3 + time*.05);
      if (i % 3){ cx.fillStyle = '#7d5a34'; cx.fillRect(-7, -1.4, 14, 2.8); cx.strokeStyle = 'rgba(30,18,8,.6)';
        cx.lineWidth = .6; cx.strokeRect(-7, -1.4, 14, 2.8); } else { cx.fillStyle = '#6a4826';
        circle(cx, 0, 0, 3.2); cx.fill(); cx.strokeStyle = '#c9a25e'; cx.lineWidth = .8;
        cx.stroke(); } cx.restore(); }
    if (w.boat){ const bxp = w.x + Math.cos(w.seed)*(w.r*.6 + (w.max - w.t)*.9), byp = w.y + Math.sin(w.seed)*(w.r*.6 + (w.max - w.t)*.9);
      cx.save(); cx.translate(bxp, byp); cx.rotate(w.seed); cx.fillStyle = 'rgba(0,20,25,.25)';
      cx.beginPath(); cx.ellipse(2, 3, 11, 4.4, 0, 0, TAU); cx.fill(); cx.fillStyle = '#8a6238';
      cx.beginPath(); cx.ellipse(0, 0, 11, 4.4, 0, 0, TAU); cx.fill(); cx.fillStyle = '#d9c7a0';
      for (let k = -2; k <= 2; k++){ circle(cx, k*3.6, 0, 1.2); cx.fill(); }
      cx.strokeStyle = '#3a2412'; cx.lineWidth = 1; const ro = Math.sin(time*3)*2.5;
        cx.beginPath(); for (const k of [-4, 4]){ cx.moveTo(k, -4); cx.lineTo(k + ro, -11);
        cx.moveTo(k, 4); cx.lineTo(k + ro, 11); } cx.stroke(); cx.restore(); } cx.globalAlpha = 1; }
  for (const q of ports){ if (q.x < x0-260 || q.x > x1+260 || q.y < y0-260 || q.y > y1+260) continue; drawPort(q);
    if (!q.spec.land && darkness() < .35) for (let i = 0; i < q.spec.sz; i++){ const ph = (time*.035 + i/q.spec.sz + h1(q.x + i)) % 1, t = ph < .5 ? ph*2 : 2 - ph*2, sd = (i - (q.spec.sz - 1)/2)*26, c = Math.cos(q.out), n = Math.sin(q.out), x = q.x + (q.ox - q.x)*(.3 + t*.6) - n*sd, y = q.y + (q.oy - q.y)*(.3 + t*.6) + c*sd;
      /* lighters plying between the roads and the quay */
      cx.save(); cx.translate(x, y); cx.rotate(q.out + (ph < .5 ? 0 : Math.PI));
        cx.fillStyle = 'rgba(0,20,25,.22)'; cx.beginPath(); cx.ellipse(1.5, 2.5, 8, 3.2, 0, 0, TAU);
        cx.fill(); cx.fillStyle = '#7a5532'; cx.beginPath(); cx.ellipse(0, 0, 8, 3.2, 0, 0, TAU);
        cx.fill(); cx.fillStyle = '#e9dfc4'; cx.beginPath(); cx.moveTo(-1, 0); cx.lineTo(3, -5.5);
        cx.lineTo(4, 0); cx.closePath(); cx.fill(); cx.restore(); } }

  for (const q of parts) if (q.k === 'wake'){ const t = q.life/q.max; cx.fillStyle = 'rgba(235,248,248,' + (t*t*.2).toFixed(3) + ')'; circle(cx, q.x, q.y, q.size + (1-t)*7); cx.fill(); }
  for (const c of crates){ const b = Math.sin(time*3 + c.ph)*1.5, rp = (time*.6 + c.ph) % 1;
    cx.strokeStyle = 'rgba(235,250,250,' + ((1-rp)*.4).toFixed(3) + ')'; cx.lineWidth = 1.2; circle(cx, c.x, c.y, 8 + rp*12); cx.stroke();
    cx.save(); cx.translate(c.x, c.y + b); cx.rotate(c.ph);
    cx.fillStyle = 'rgba(0,20,25,.3)'; cx.fillRect(-5, -4, 14, 13); cx.fillStyle = '#8f6537'; cx.fillRect(-7, -6, 14, 12);
    cx.fillStyle = '#6f4b25'; cx.fillRect(-7, -6, 14, 3); cx.strokeStyle = C.brass; cx.lineWidth = 1.3; cx.strokeRect(-7, -6, 14, 12);
    cx.beginPath(); cx.moveTo(-2.5, -6); cx.lineTo(-2.5, 6); cx.moveTo(2.5, -6); cx.lineTo(2.5, 6); cx.stroke(); cx.restore();
    if (Math.sin(time*4 + c.ph*3) > .8){ cx.fillStyle = 'rgba(255,240,180,.9)'; cx.fillRect(c.x-1, c.y-9+b, 2, 6); cx.fillRect(c.x-3, c.y-7+b, 6, 2); } }

  if (state === 'play' && p.sinking == null){ if (assist) drawAim(); else drawArcs();
    const c = Math.cos(p.h), n = Math.sin(p.h);
    for (const s of ships){ if (s.role !== 'fleet' || s.sinking != null) continue;
      const inLine = s.off && (!s.task || s.task.type === 'fleet'), tx = inLine ? p.x + c*s.off[0] - n*s.off[1] : s.x, ty = inLine ? p.y + n*s.off[0] + c*s.off[1] : s.y;
        // her station in the formation, if she is sailing in it
      if (inLine && Math.hypot(tx-s.x, ty-s.y) > 70){ cx.setLineDash([4, 6]); cx.strokeStyle = 'rgba(239,230,207,.35)';
        cx.lineWidth = 1.3; circle(cx, tx, ty, 16); cx.stroke(); cx.beginPath(); cx.moveTo(s.x, s.y);
        cx.lineTo(tx, ty); cx.stroke(); cx.setLineDash([]); }
      if (assist && orders !== 'hold') for (const side of [-1, 1]){ const a = s.h + side*Math.PI/2, ch = Math.cos(s.h), sh = Math.sin(s.h), hf = s.t.len*.3, ex = Math.cos(a)*RANGE, ey = Math.sin(a)*RANGE, bears = laneBears(s, side);
        const col = bears ? '120,235,150' : '239,230,207'; cx.fillStyle = 'rgba(' + col + ',' + (bears ? .16 : .06) + ')'; // her line of fire
        cx.beginPath(); cx.moveTo(s.x + ch*hf, s.y + sh*hf); cx.lineTo(s.x + ch*(hf + 20) + ex, s.y + sh*(hf + 20) + ey);
          cx.lineTo(s.x - ch*(hf + 20) + ex, s.y - sh*(hf + 20) + ey); cx.lineTo(s.x - ch*hf, s.y - sh*hf); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(' + col + ',' + (bears ? .5 : .2) + ')'; cx.lineWidth = 1; cx.setLineDash([5, 6]); cx.stroke(); cx.setLineDash([]); } } }
  for (const s of ships) if (s.surrendered && s.sinking == null && s !== prizeShip) drawStruck(s);
  for (const s of ships) if (s.x > x0-120 && s.x < x1+120 && s.y > y0-120 && s.y < y1+120) drawShip(s);
  drawShip(p);
  for (const s of ships) if (s.x > x0-60 && s.x < x1+60 && s.y > y0-60 && s.y < y1+60) drawBars(s);
  for (const s of [tracked, mission && mission.ship, fleetTarget]){ if (!s || s.sinking != null || s.surrendered) continue;
    const r = s.t.len*(s === fleetTarget ? .86 : .74); cx.strokeStyle = s === fleetTarget ? '#ff5a4a' : s === tracked ? s.t.tag : '#7fe0d0';
    cx.lineWidth = s === fleetTarget ? 2.6 : 2;
    for (const v of [[-1,-1],[1,-1],[1,1],[-1,1]]){ cx.beginPath(); cx.moveTo(s.x + v[0]*r, s.y + v[1]*(r-12));
      cx.lineTo(s.x + v[0]*r, s.y + v[1]*r); cx.lineTo(s.x + v[0]*(r-12), s.y + v[1]*r); cx.stroke(); } }

  for (const b of balls){ const u = 1 - b.life/b.life0, ht = Math.sin(Math.PI*clamp(u, 0, 1));
    cx.fillStyle = 'rgba(0,15,20,.3)'; circle(cx, b.x + ht*6, b.y + ht*9, 2.4); cx.fill();
    const by = b.y - ht*5, r = 2.3 + ht*1.3;
    if (b.chain){ const c = Math.cos(b.a + time*20)*4.5, n = Math.sin(b.a + time*20)*4.5;
      cx.strokeStyle = '#111'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(b.x+c, by+n);
      cx.lineTo(b.x-c, by-n); cx.stroke();
      cx.fillStyle = '#0b0b0b'; circle(cx, b.x+c, by+n, r*.8); cx.fill(); circle(cx, b.x-c, by-n, r*.8); cx.fill(); }
    else if (b.grape){ cx.fillStyle = '#141414'; for (let j = 0; j < 5; j++){ circle(cx, b.x + (h1(j*3.7 + b.a) - .5)*9, by + (h1(j*5.3 + b.a) - .5)*9, 1.2); cx.fill(); } }
    else { cx.fillStyle = '#0b0b0b'; circle(cx, b.x, by, r); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.35)'; circle(cx, b.x - r*.3, by - r*.3, r*.35); cx.fill(); } }
  for (const q of parts){ const t = q.life/q.max;
    if (q.k === 'smoke'){ const g = q.g; cx.fillStyle = 'rgba(' + g + ',' + g + ',' + (g-8) + ',' + (t*.38).toFixed(3) + ')'; circle(cx, q.x, q.y, q.size*(2-t)); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,' + (t*.08).toFixed(3) + ')'; circle(cx, q.x - q.size*.3, q.y - q.size*.3, q.size*(1.1-t*.4)); cx.fill(); }
    else if (q.k === 'splash'){ cx.strokeStyle = 'rgba(235,250,250,' + (t*.8).toFixed(3) + ')'; cx.lineWidth = 1.6; circle(cx, q.x, q.y, q.size + (1-t)*11); cx.stroke();
      cx.fillStyle = 'rgba(245,255,255,' + (t*.85).toFixed(3) + ')'; circle(cx, q.x, q.y - (1-t)*3, q.size*t); cx.fill(); }
    else if (q.k === 'bit'){ cx.fillStyle = 'rgba(' + q.c + ',' + t.toFixed(3) + ')'; cx.fillRect(q.x, q.y, q.size, q.size); }
    else if (q.k === 'chunk'){ const u = 1 - q.life/q.max, ht = Math.sin(Math.PI*clamp(u, 0, 1))*14;
      cx.fillStyle = 'rgba(0,15,20,.25)'; cx.fillRect(q.x + ht*.5, q.y + ht*.8, q.size, q.size*.6);
      // debris thrown up and out, with its shadow on the water
      cx.save(); cx.translate(q.x, q.y - ht); cx.rotate(q.a + u*9); cx.fillStyle = 'rgb(' + q.c + ')';
        cx.fillRect(-q.size/2, -q.size*(q.rag ? .5 : .3), q.size, q.size*(q.rag ? 1 : .6)); cx.restore(); }
    else if (q.k === 'ring'){ cx.strokeStyle = 'rgba(235,250,250,' + (t*.55).toFixed(3) + ')'; cx.lineWidth = 1.4; circle(cx, q.x, q.y, q.size + (1-t)*26); cx.stroke(); }
    else if (q.k === 'plank'){ cx.save(); cx.translate(q.x, q.y + Math.sin(time*2 + q.a*5));
      cx.rotate(q.a + time*.1); cx.fillStyle = 'rgba(122,85,50,' + Math.min(1, t*4).toFixed(3) + ')';
      cx.fillRect(-q.size/2, -1.2, q.size, 2.4); cx.restore(); } }
  cx.globalCompositeOperation = 'lighter';
  for (const q of parts){ const t = q.life/q.max;
    if (q.k === 'flash'){ const g = cx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.size);
      g.addColorStop(0, 'rgba(255,240,190,' + t.toFixed(3) + ')'); g.addColorStop(.4, 'rgba(255,160,60,' + (t*.7).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,90,20,0)');
      cx.fillStyle = g; circle(cx, q.x, q.y, q.size); cx.fill(); }
    else if (q.k === 'boomfx'){ const r = q.size*(.35 + 1.25*(1 - t)), g = cx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
      g.addColorStop(0, 'rgba(255,250,220,' + t.toFixed(3) + ')'); g.addColorStop(.35, 'rgba(255,170,60,' + (t*.85).toFixed(3) + ')');
      g.addColorStop(.75, 'rgba(210,70,20,' + (t*.4).toFixed(3) + ')'); g.addColorStop(1, 'rgba(120,30,10,0)');
      cx.fillStyle = g; circle(cx, q.x, q.y, r); cx.fill(); }
    else if (q.k === 'flame'){ cx.fillStyle = 'rgba(255,' + Math.round(110 + 90*t) + ',40,' + (t*.7).toFixed(3) + ')'; circle(cx, q.x, q.y, q.size*(.4 + .6*t)); cx.fill(); } }
  cx.globalCompositeOperation = 'source-over';

  for (const q of smokes){ const t = q.life/q.max, r = q.size*(1 + (1 - t)*2.1);
    if (q.x + r < x0 || q.x - r > x1 || q.y + r < y0 || q.y - r > y1) continue; // hanging gunsmoke, over everything on the water
    cx.globalAlpha = Math.min(1, (1 - t)*10)*Math.min(1, t*2.4)*(q.dark ? .34 : .3); cx.drawImage(q.dark ? smokeDark : smokeSpr, q.x - r, q.y - r, r*2, r*2); }
  cx.globalAlpha = 1;
  if (orderSel && orderSel.sinking == null){ const o = orderSel; cx.setLineDash([8, 7]);
    cx.lineDashOffset = -time*20; cx.strokeStyle = 'rgba(214,165,78,.95)'; cx.lineWidth = 2.4/Math.min(1, scale);
    circle(cx, o.x, o.y, o.t.len*.9); cx.stroke(); cx.setLineDash([]); cx.lineDashOffset = 0; }
  if (!reduced) for (const g of gulls){ if (Math.hypot(g.x-camX, g.y-camY) > 760){ g.x = camX + rand(-560, 560); g.y = camY + rand(-380, 380); }
    g.a += g.w*dt; const bx = g.x + Math.cos(g.a)*g.r, by = g.y + Math.sin(g.a)*g.r, hd = g.a + Math.sign(g.w)*Math.PI/2, fl = Math.sin(time*7 + g.ph)*.35;
    for (const pass of [0, 1]){ cx.save(); cx.translate(bx + (pass ? 0 : 9), by + (pass ? 0 : 13));
      cx.rotate(hd); cx.strokeStyle = pass ? '#f6f8f8' : 'rgba(0,20,25,.22)'; cx.lineWidth = 1.8; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(-2 - fl*3, -7); cx.quadraticCurveTo(2, -3, 0, 0); cx.quadraticCurveTo(2, 3, -2 - fl*3, 7); cx.stroke(); cx.restore(); } }
  cx.lineCap = 'butt';
  const F = 3200; cx.globalAlpha = .8;
  for (const c of clouds){ const wx = ((c.x + drift.x*1.6 - camX + F/2) % F + F) % F - F/2 + camX, wy = ((c.y + drift.y*1.6 - camY + F/2) % F + F) % F - F/2 + camY;
    if (wx + c.s/2 < x0 || wx - c.s/2 > x1 || wy + c.s/2 < y0 || wy - c.s/2 > y1) continue; cx.drawImage(cloudSpr, wx - c.s/2, wy - c.s/2, c.s, c.s); }
  cx.globalAlpha = 1;

  if (melee) drawMelee();
  cx.font = '24px "Pirata One", Georgia, serif'; cx.textAlign = 'center';
  for (const f of floaters){ cx.globalAlpha = clamp(f.life, 0, 1); cx.lineWidth = 4;
    cx.strokeStyle = 'rgba(8,25,30,.8)'; cx.strokeText(f.txt, f.x, f.y); cx.fillStyle = C.brass;
    cx.fillText(f.txt, f.x, f.y); }
  cx.globalAlpha = 1;
  cx.restore();

  if (!reduced){ cx.strokeStyle = 'rgba(239,246,246,.08)'; cx.lineWidth = 1;
    for (const s of streaks){ s.x += wc*dt*260*wind.str*s.s/vw; s.y += wn*dt*260*wind.str*s.s/vh;
      if (s.x < -.05) s.x += 1.1; if (s.x > 1.05) s.x -= 1.1; if (s.y < -.05) s.y += 1.1; if (s.y > 1.05) s.y -= 1.1;
      const sx = s.x*vw, sy = s.y*vh; cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(sx - wc*s.l, sy - wn*s.l); cx.stroke(); } }
  const dk = darkness(), wk = weather.k, sun = sunAt();
  if (weather.kind === 'rain' || weather.kind === 'storm'){ cx.fillStyle = 'rgba(8,18,28,' + ((weather.kind === 'storm' ? (weather.hur ? .5 : .34) : .2)*wk).toFixed(3) + ')'; cx.fillRect(0, 0, vw, vh); }
  if (Math.abs(sun) < .3 && dk < .5){ cx.fillStyle = 'rgba(255,140,60,' + ((.3 - Math.abs(sun))*.4).toFixed(3) + ')'; cx.fillRect(0, 0, vw, vh); }
  if (dk > .01){ cx.fillStyle = 'rgba(4,10,38,' + dk.toFixed(3) + ')'; cx.fillRect(0, 0, vw, vh);
    if (weather.kind === 'clear' && dk > .3){ const mg = cx.createLinearGradient(vw*.3, 0, vw*.7, vh*.25);
      mg.addColorStop(0, 'rgba(205,220,255,0)'); mg.addColorStop(.5, 'rgba(205,220,255,' + (dk*.12).toFixed(3) + ')');
      mg.addColorStop(1, 'rgba(205,220,255,0)'); cx.fillStyle = mg; cx.fillRect(0, 0, vw, vh);
      } /* the moon's path on the water */
    cx.save(); cx.translate(vw/2, vh/2); cx.scale(scale, scale); cx.translate(-camX, -camY); cx.globalCompositeOperation = 'lighter'; const la = dk/.6;
    const glow = (x, y, r, a) => { const g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,205,120,' + (a*la).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,70,0)');
      cx.fillStyle = g; circle(cx, x, y, r); cx.fill(); };
    for (const s of ships.concat([p])){ if (s.sinking != null || s.x < x0-80 || s.x > x1+80 || s.y < y0-80 || s.y > y1+80) continue;
      glow(s.x - Math.cos(s.h)*s.t.len*.48, s.y - Math.sin(s.h)*s.t.len*.48, 30, .5); glow(s.x + Math.cos(s.h)*s.t.len*.2, s.y + Math.sin(s.h)*s.t.len*.2, 16, .25); }
    for (const q of ports){ if (!q.b || q.x < x0-260 || q.x > x1+260 || q.y < y0-260 || q.y > y1+260) continue;
      const lk = q.spec.land ? .72 : 1; cx.save(); cx.translate(q.x, q.y); cx.scale(lk, lk); cx.translate(-q.x, -q.y);
      const u = q.P(-q.depth*.5, 0); glow(u[0], u[1], q.span + 70, .22); cx.fillStyle = 'rgba(255,215,130,' + (.75*la).toFixed(3) + ')';
      q.b.forEach((b, i) => { if (i % 3 === 1) return; const w = q.P(b.a + 2, b.b); cx.fillRect(w[0] - 1.5, w[1] - 1.5, 3, 3); });
      for (const jb of q.jet){ const w = q.P(58, jb); glow(w[0], w[1], 22, .5); } cx.restore();
        if (q.spec.sz >= 2 && !q.spec.land){ const fl = Math.max(0, Math.sin(time*1.3 + q.x*.01));
        glow(q.x + (q.ox - q.x)*.25, q.y + (q.oy - q.y)*.25, 26 + 30*fl, .35 + .5*fl); } /* the harbour light */ }
    cx.restore(); }
  if (weather.kind === 'fog' && wk > 0){ cx.fillStyle = 'rgba(196,206,206,' + (.42*wk).toFixed(3) + ')'; cx.fillRect(0, 0, vw, vh);
    for (let i = 0; i < 7; i++){ const fx = ((h1(i*7.1)*vw*1.4 + time*(8 + i*3)) % (vw*1.4)) - vw*.2, fy = h1(i*3.3 + 1)*vh, r = 180 + h1(i)*220;
      const g = cx.createRadialGradient(fx, fy, 0, fx, fy, r); g.addColorStop(0, 'rgba(225,232,232,' + (.3*wk).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(225,232,232,0)'); cx.fillStyle = g; cx.fillRect(fx - r, fy - r, r*2, r*2); } }
  if (hurr && !reduced){ const a = Math.atan2(p.y - hurr.y, p.x - hurr.x), c = Math.cos(a), n = Math.sin(a), R2 = Math.max(vw, vh)*.75; /* the long swell runs in ahead of the storm */
    cx.strokeStyle = 'rgba(225,240,240,' + (hurr.stage ? .15 : .1) + ')'; cx.lineWidth = 2.4; cx.beginPath();
    for (let i = 0; i < 9; i++){ const d = ((i*160 + time*(hurr.stage ? 150 : 55)) % 1440) - 720, mx = vw/2 + c*d, my = vh/2 + n*d;
      cx.moveTo(mx - n*R2, my + c*R2); cx.quadraticCurveTo(mx + c*46, my + n*46, mx + n*R2, my - c*R2); } cx.stroke();
    if (weather.hur){ const wx2 = Math.cos(wind.dir), wy2 = Math.sin(wind.dir); cx.strokeStyle = 'rgba(240,250,250,' + (.22*wk).toFixed(3) + ')';
      cx.lineWidth = 1.4; cx.beginPath(); /* spindrift torn off the wave tops */
      for (let i = 0; i < 80; i++){ const px2 = (((h1(i*1.3)*vw + time*wx2*900) % vw) + vw) % vw, py2 = (((h1(i*2.7 + 9)*vh + time*wy2*900) % vh) + vh) % vh;
        cx.moveTo(px2, py2); cx.lineTo(px2 - wx2*34, py2 - wy2*34); } cx.stroke(); } }
  if ((weather.kind === 'rain' || weather.kind === 'storm') && wk > 0 && !reduced){ const n = Math.round((weather.kind === 'storm' ? (weather.hur ? 300 : 170) : 90)*wk), sx = wc*10 + 4, len = weather.kind === 'storm' ? 26 : 18;
    cx.strokeStyle = 'rgba(200,220,230,.3)'; cx.lineWidth = 1; cx.beginPath();
    for (let i = 0; i < n; i++){ const rx = (h1(i*1.7)*vw + time*sx*40) % vw, ry = (h1(i*2.9 + 4)*vh + time*(700 + h1(i)*300)) % vh;
      cx.moveTo((rx + vw) % vw, ry); cx.lineTo((rx + vw) % vw - sx, ry - len); } cx.stroke(); }
  if (flash > 0){ cx.fillStyle = 'rgba(255,255,255,' + (flash*.5).toFixed(3) + ')'; cx.fillRect(0, 0, vw, vh); }
  cx.fillStyle = vignette; cx.fillRect(0, 0, vw, vh);

  if (state === 'play' && !chartOpen){
    const on = (x, y) => { const sx = (x - camX)*scale + vw/2, sy = (y - camY)*scale + vh/2; return [sx, sy, sx > 54 && sx < vw-54 && sy > 54 && sy < vh-54]; };
    const lg = (x, y) => Math.max(1, Math.round(Math.hypot(x-p.x, y-p.y)/DEG*20)) + ' lg';
    const badge = (x, y, col, text, icon) => { const a = on(x, y); if (a[2]) return;
      pointer(a[0], a[1], () => { cx.fillStyle = 'rgba(8,25,30,.85)'; circle(cx, 0, 0, 20); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke(); icon();
        cx.font = '700 12px "Alegreya Sans", sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(8,25,30,.85)';
        const tl = text + ' · ' + lg(x, y); cx.strokeText(tl, 0, 36); cx.fillStyle = C.bone; cx.fillText(tl, 0, 36); cx.fillStyle = col; }); };
    const mt = missionTarget();
    let np = null, nd = 1e9; for (const q of ports){ const d = Math.hypot(q.x-p.x, q.y-p.y); if (d < nd){ nd = d; np = q; } }
    if (course) badge(course.x, course.y, '#ff8a6a', 'Course: ' + course.name, () => { cx.strokeStyle = '#ff8a6a'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-8, 6); cx.lineTo(0, -9); cx.lineTo(8, 6); cx.stroke(); });
    else if (!mt || mt.port !== np) badge(np.x, np.y, C.brass, np.name, () => { cx.fillStyle = '#ffd24a'; circle(cx, 0, 0, 5); cx.fill(); });
    for (const s of ships) if (s.surrendered && s.sinking == null) badge(s.x, s.y, '#ffffff', 'Struck', () => { cx.fillStyle = '#ffffff'; cx.fillRect(-7, -9, 2, 18); cx.fillRect(-5, -9, 13, 9); });
    if (tracked && !tracked.surrendered) badge(tracked.x, tracked.y, tracked.t.tag, tracked.t.name, () => { cx.strokeStyle = tracked.t.tag; cx.lineWidth = 1.6; circle(cx, 0, 0, 7); cx.stroke();
      cx.beginPath(); cx.moveTo(-12, 0); cx.lineTo(12, 0); cx.moveTo(0, -12); cx.lineTo(0, 12); cx.stroke(); });
    if (mt && mt.s !== tracked) badge(mt.x, mt.y, '#7fe0d0', mt.name, () => { cx.fillStyle = '#7fe0d0'; cx.fillRect(-6, -8, 12, 16); cx.fillStyle = '#08191e'; cx.fillRect(-3.5, -4, 7, 1.6); cx.fillRect(-3.5, -.5, 7, 1.6); cx.fillRect(-3.5, 3, 5, 1.6); });
  }
  drawCompass(); drawChart();
  if (chartOpen) drawBigChart();
}
function drawCompass(){
  const r = 42, x = vw - pad.r - r - 3, y = pad.t + r + 3;
  const rg = cx.createLinearGradient(x-r, y-r, x+r, y+r); rg.addColorStop(0, '#f0cf86'); rg.addColorStop(.5, '#a87a2c'); rg.addColorStop(1, '#e2b964');
  cx.fillStyle = rg; circle(cx, x, y, r+3); cx.fill();
  const fg = cx.createRadialGradient(x, y - r*.3, 2, x, y, r); fg.addColorStop(0, '#16353d'); fg.addColorStop(1, '#08191e'); cx.fillStyle = fg; circle(cx, x, y, r); cx.fill();
  cx.strokeStyle = 'rgba(239,230,207,.45)'; cx.lineWidth = 1;
  for (let i = 0; i < 32; i++){ const a = i/32*TAU, k = i % 8 === 0 ? 8 : i % 4 === 0 ? 6 : 3;
    cx.beginPath(); cx.moveTo(x + Math.cos(a)*(r-k), y + Math.sin(a)*(r-k)); cx.lineTo(x + Math.cos(a)*(r-1), y + Math.sin(a)*(r-1)); cx.stroke(); }
  cx.font = '13px "Pirata One", Georgia, serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = C.bone;
  cx.fillText('N', x, y - r + 15); cx.fillStyle = 'rgba(239,230,207,.55)'; cx.fillText('S', x, y + r - 14); cx.fillText('E', x + r - 14, y); cx.fillText('W', x - r + 14, y);
  cx.save(); cx.translate(x, y); cx.rotate(p.h); cx.fillStyle = 'rgba(239,230,207,.8)';
    cx.beginPath(); cx.moveTo(13, 0); cx.quadraticCurveTo(2, 7, -9, 4.5); cx.lineTo(-9, -4.5);
    cx.quadraticCurveTo(2, -7, 13, 0); cx.fill(); cx.restore();
  cx.save(); cx.translate(x, y); cx.rotate(wind.dir); cx.strokeStyle = C.brass; cx.fillStyle = C.brass; cx.lineWidth = 2.5;
  cx.beginPath(); cx.moveTo(-r+3, 0); cx.lineTo(-19, 0); cx.stroke(); cx.beginPath(); cx.moveTo(-14, 0); cx.lineTo(-23, 5.5); cx.lineTo(-23, -5.5); cx.closePath(); cx.fill(); cx.restore();
  const a = Math.abs(angd(p.h, wind.dir)), name = pointOfSail(a);
  cx.textBaseline = 'alphabetic'; cx.textAlign = 'right'; cx.font = '500 13px "Alegreya Sans", sans-serif';
  const tx = vw - pad.r, ty = y + r + 22; cx.lineWidth = 3; cx.strokeStyle = 'rgba(8,25,30,.85)';
  const l1 = 'Wind ' + Math.round(wind.str*windMul()*13*(weather.hur ? 1 + 1.6*weather.k : 1)) + ' kn', l2 = name + ' · ' + (p.speed/16).toFixed(1) + ' kn', hr = (clock/DAY*24 + 8) % 24;
  const l3 = dateStr() + ' · ' + ('0' + Math.floor(hr)).slice(-2) + ':' + ('0' + Math.floor(hr % 1*6)*10).slice(-2) + ' · ' + (weather.hur ? 'Hurricane' : hurr ? 'Glass falling' : WX[weather.next && weather.k < .5 ? weather.next : weather.kind][0]);
  cx.strokeText(l1, tx, ty); cx.fillStyle = C.brass; cx.fillText(l1, tx, ty);
  cx.strokeText(l2, tx, ty+17); cx.fillStyle = name === 'In irons' ? '#ff8a73' : C.bone; cx.fillText(l2, tx, ty+17);
  cx.strokeText(l3, tx, ty+34); cx.fillStyle = C.bone; cx.fillText(l3, tx, ty+34);
  { const fw = 24, fh = 15, gap = 12, x0 = tx - (fw*4 + gap*3), y0 = ty + 46, mid = i => x0 + i*(fw + gap) + fw/2;
    flagsEnd = y0 + fh + 34; cx.font = '600 12px "Alegreya Sans", sans-serif'; cx.textAlign = 'right';
    cx.lineWidth = 3; cx.strokeStyle = 'rgba(8,25,30,.85)'; { const wl = wars.size ? 'At war' : 'At peace';
    cx.strokeText(wl, x0 - 8, y0 + 12); cx.fillStyle = wars.size ? '#ff8a73' : C.bone;
    cx.fillText(wl, x0 - 8, y0 + 12); } /* the four flags, with a red tie between nations at war */
    NKEYS.slice(0, 4).forEach((k, i) => { flagRect(cx, k, x0 + i*(fw + gap), y0, fw, fh); if (k === marque){ cx.strokeStyle = C.brass; cx.lineWidth = 2; cx.strokeRect(x0 + i*(fw + gap) - 2, y0 - 2, fw + 4, fh + 4); } });
    [...wars].forEach(w => { const a = NKEYS.indexOf(w.slice(0, 2)), b = NKEYS.indexOf(w.slice(3)), dip = 7 + Math.abs(a - b)*6, mx = (mid(a) + mid(b))/2, my = y0 + fh + 2 + dip;
      cx.strokeStyle = '#ff6a55'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(mid(a), y0 + fh + 2); cx.quadraticCurveTo(mx, y0 + fh + 2 + dip*2, mid(b), y0 + fh + 2); cx.stroke();
      cx.lineWidth = 2; cx.beginPath(); cx.moveTo(mx - 4, my - 4); cx.lineTo(mx + 4, my + 4); cx.moveTo(mx + 4, my - 4); cx.lineTo(mx - 4, my + 4); cx.stroke(); }); }
}
const HOMEC = '#35d6a0';
function routeOn(x, y, k, w, big){ if (!course) return; const pts = [[p.x, p.y]].concat(routeLine || [[course.ox, course.oy]]);
  const trace = () => { cx.beginPath(); pts.forEach((v, i) => i ? cx.lineTo(x + v[0]*k, y + v[1]*k) : cx.moveTo(x + v[0]*k, y + v[1]*k)); cx.stroke(); };
  cx.lineJoin = 'round'; cx.lineCap = 'round';
  if (big){ cx.strokeStyle = 'rgba(233,217,176,.85)'; cx.lineWidth = w + 4; trace(); } // a pale bed under the dots so the course reads over land and lettering
  cx.strokeStyle = '#c8321e'; cx.lineWidth = w; cx.setLineDash([.01, w*2.3]); cx.lineDashOffset = -(time*w*3 % (w*2.3)); trace(); cx.setLineDash([]); cx.lineDashOffset = 0; cx.lineCap = 'butt';
  if (big){ const e = pts[pts.length - 1], ex = x + e[0]*k, ey = y + e[1]*k; let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
    cx.strokeStyle = INK; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(ex, ey);
      cx.lineTo(ex, ey - 26); cx.stroke(); cx.fillStyle = '#c8321e'; cx.beginPath(); cx.moveTo(ex, ey - 26);
      cx.lineTo(ex + 15, ey - 21); cx.lineTo(ex, ey - 16); cx.closePath(); cx.fill(); cx.stroke();
    const m = pts[Math.floor(pts.length/2)], t = 'Course for ' + course.name + ' · ' + Math.max(1, Math.round(len/DEG*20)) + ' leagues'; cx.font = 'italic 16px ' + FELL; cx.textAlign = 'center';
    cx.lineWidth = 4; cx.strokeStyle = 'rgba(233,217,176,.95)'; cx.strokeText(t, x + m[0]*k, y + m[1]*k - 12); cx.fillStyle = '#9c2414'; cx.fillText(t, x + m[0]*k, y + m[1]*k - 12); } }
function chartMarks(x, y, k){ // the small chart in the corner
  routeOn(x, y, k, 1.4);
  { const near = ports.filter(q => !q.spec.land && (q.spec.sz >= 2 || q.name === homeName)).map(q => [Math.hypot(q.x - p.x, q.y - p.y), q]).filter(v => v[0] < MINI*.62).sort((a, b) => a[0] - b[0]).slice(0, 3);
    cx.font = '600 10.5px "Alegreya Sans", sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 2.6;
    cx.strokeStyle = 'rgba(8,25,30,.9)';
    near.forEach(v => { const q = v[1], px = x + q.x*k, py = y + q.y*k - 7; cx.strokeText(q.name, px, py); cx.fillStyle = '#efe6cf'; cx.fillText(q.name, px, py); }); }
  for (const q of ports){ const px = x + q.x*k, py = y + q.y*k, home = q.name === homeName, big = home || q.spec.sz >= 2 && !q.spec.land;
    if (!big && q !== course){ cx.fillStyle = 'rgba(255,210,74,.75)'; cx.fillRect(px - 1, py - 1, 2, 2);
    continue; } cx.fillStyle = '#08191e'; circle(cx, px, py, home ? 5 : 3.4); cx.fill();
    cx.fillStyle = home ? HOMEC : '#ffd24a'; circle(cx, px, py, home ? 3.6 : 2.2); cx.fill(); if (q === course){ cx.strokeStyle = '#ff7a5c'; cx.lineWidth = 1.5; circle(cx, px, py, 7); cx.stroke(); } }
  if (state !== 'title') for (const s of ships){ if (s.sinking != null || s.released) continue; const d = Math.hypot(s.x-p.x, s.y-p.y), sx = x + s.x*k, sy = y + s.y*k;
    if (s.surrendered){ const pr = 3 + 2*(.5 + .5*Math.sin(time*5)); cx.strokeStyle = '#ffffff';
      cx.lineWidth = 1.5; circle(cx, sx, sy, pr + 1.5); cx.stroke(); cx.fillStyle = '#ffffff';
      circle(cx, sx, sy, 2); cx.fill(); continue; }
    if (s === tracked){ cx.strokeStyle = s.t.tag; cx.lineWidth = 1.5; circle(cx, sx, sy, 5); cx.stroke(); }
    else if (s.role !== 'fleet' && (prize(s) ? d > 1800 : d > 2600)) continue;
    cx.fillStyle = s.role === 'fleet' ? '#ffffff' : s.t.tag; cx.fillRect(sx - 1.6, sy - 1.6, 3.2, 3.2); }
  if (fleet && fleet.lead){ const fx = x + fleet.lead.x*k, fy = y + fleet.lead.y*k, r = 4.5;
    cx.fillStyle = '#08191e'; cx.beginPath(); cx.moveTo(fx, fy-r-1.5); cx.lineTo(fx+r+1.5, fy);
    cx.lineTo(fx, fy+r+1.5); cx.lineTo(fx-r-1.5, fy); cx.closePath(); cx.fill();
    cx.fillStyle = '#ffe07a'; cx.beginPath(); cx.moveTo(fx, fy-r); cx.lineTo(fx+r, fy); cx.lineTo(fx, fy+r); cx.lineTo(fx-r, fy); cx.closePath(); cx.fill(); }
  if (hurr){ cx.strokeStyle = '#ff7a66'; cx.lineWidth = 2; for (const r2 of [4, 8]){ cx.beginPath(); cx.arc(x + hurr.x*k, y + hurr.y*k, r2, time*2 + r2, time*2 + r2 + 4.4); cx.stroke(); } }
  const mt = missionTarget(); if (mt){ cx.strokeStyle = '#7fe0d0'; cx.lineWidth = 2; circle(cx, x + mt.x*k, y + mt.y*k, 6.5 + Math.sin(time*4)); cx.stroke(); }
  const pr = 6 + 2*Math.sin(time*4); cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.2; circle(cx, x + p.x*k, y + p.y*k, pr); cx.stroke();
  cx.save(); cx.translate(x + p.x*k, y + p.y*k); cx.rotate(p.h); cx.fillStyle = '#ffffff';
    cx.beginPath(); cx.moveTo(6, 0); cx.lineTo(-4, 3.6); cx.lineTo(-4, -3.6); cx.closePath(); cx.fill(); cx.restore();
}
function drawChart(){
  if (!botEl) botEl = document.querySelector('#hud .bottom'); if (botEl && (tick & 15) === 0) botTop = botEl.getBoundingClientRect().top;
  const m0 = chartRect(); if (m0.w < 10) return;
  const m = m0, k = m.w/MINI, vhU = m.h/k, ox = clamp(p.x, MINI/2, W - MINI/2) - MINI/2, oy = clamp(p.y, vhU/2, H - vhU/2) - vhU/2, sc = miniC.width/W;
  cx.drawImage(miniC, ox*sc, oy*sc, MINI*sc, vhU*sc, m.x, m.y, m.w, m.h);
  cx.save(); cx.beginPath(); cx.rect(m.x, m.y, m.w, m.h); cx.clip(); chartMarks(m.x - ox*k, m.y - oy*k, k); cx.restore();
  cx.strokeStyle = 'rgba(214,165,78,.8)'; cx.lineWidth = 1.5; cx.strokeRect(m.x+.5, m.y+.5, m.w-1, m.h-1);
}
/* the full chart is drawn once, in ink on parchment, and then only marked up */
