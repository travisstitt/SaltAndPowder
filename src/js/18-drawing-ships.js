function drawShip(s){
  const T = s.t, L = T.len, Wd = T.wid, M = T.masts, main = M.length === 3 ? 1 : M.length - 1, fade = s.sinking != null ? clamp(s.sinking/2.6, 0, 1) : 1;
  cx.save(); cx.translate(s.x + 5, s.y + 7); cx.rotate(s.h); cx.globalAlpha = .28*fade; hullPath(cx, L*1.04, Wd*1.12, T); cx.fillStyle = '#021215'; cx.fill(); cx.restore();
  cx.save(); cx.translate(s.x, s.y); cx.rotate(s.h); cx.globalAlpha = fade;
  if (s.sinking != null){ const k = .75 + .25*fade; cx.scale(k, k*(.55 + .45*fade)); }
  const hl = s.heel || 0, swell = 1 + (weather.kind === 'storm' ? (weather.hur ? 2.6 : 1.6)*weather.k : weather.kind === 'rain' ? .6*weather.k : 0);
  cx.scale(1 + Math.sin(time*2.2 + s.x*.013)*.012*swell, 1 - Math.abs(hl)*.1); // pitching in the swell, narrower as she heels
  if (s.speed > 25 && s.sinking == null){ const a = clamp(s.speed/130, 0, 1); cx.lineWidth = 1.7;
    for (const sd of [-1, 1]){ cx.strokeStyle = 'rgba(240,250,250,' + (a*.6).toFixed(3) + ')'; cx.beginPath(); cx.moveTo(L*.5, 0); cx.quadraticCurveTo(L*.3, sd*Wd*.78, -L*.2, sd*Wd*1.12); cx.stroke();
      cx.strokeStyle = 'rgba(240,250,250,' + (a*.25).toFixed(3) + ')'; cx.beginPath(); cx.moveTo(L*.44, sd*2); cx.quadraticCurveTo(L*.2, sd*Wd*1.05, -L*.38, sd*Wd*1.5); cx.stroke(); } }
  cx.strokeStyle = '#2a1c10'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(L*.42, 0); cx.lineTo(L*.68, 0); cx.stroke();
  const hg = cx.createLinearGradient(0, -Wd/2, 0, Wd/2); hg.addColorStop(0, T.hullD); hg.addColorStop(.5, T.hullC); hg.addColorStop(1, T.hullD);
  hullPath(cx, L, Wd, T); cx.fillStyle = hg; cx.fill();
  if (T.band){ cx.save(); cx.clip(); cx.strokeStyle = T.band; cx.lineWidth = Wd*.26;
    cx.stroke(); if (T.wale){ cx.strokeStyle = '#17120d'; cx.lineWidth = Wd*.1; cx.stroke();
    } cx.restore(); hullPath(cx, L, Wd, T); }
  cx.lineWidth = 1.6; cx.strokeStyle = T.trim; cx.stroke();
  if (Math.abs(hl) > .12 && s.sinking == null){ const up2 = hl > 0 ? -1 : 1, a = Math.abs(hl); // the weather side rides high, the lee rail drags a line of foam
    cx.strokeStyle = 'rgba(245,252,252,' + (a*.55*Math.min(1, s.speed/60)).toFixed(3) + ')'; cx.lineWidth = 2 + a*2.5;
    cx.beginPath(); cx.moveTo(L*.36, -up2*Wd*.5); cx.quadraticCurveTo(0, -up2*Wd*(.62 + a*.12), -L*.42, -up2*Wd*.5); cx.stroke(); }
  cx.save(); cx.translate(0, hl*Wd*.09); cx.scale(.84, .72); hullPath(cx, L, Wd, T); cx.fillStyle = T.deck; cx.fill(); cx.clip();
  cx.strokeStyle = 'rgba(40,22,8,.3)'; cx.lineWidth = .8; cx.beginPath();
  for (let y = -Wd/2 + 2; y < Wd/2; y += 3.4){ cx.moveTo(-L/2, y); cx.lineTo(L/2, y); } cx.stroke();
  cx.fillStyle = 'rgba(50,28,12,.42)'; cx.fillRect(-L/2, -Wd/2, L*.21, Wd); cx.fillStyle = 'rgba(50,28,12,.22)'; cx.fillRect(L*.3, -Wd/2, L*.2, Wd);
  cx.fillStyle = 'rgba(20,14,10,.75)'; for (let g = 0; g < s.guns; g++){ const gx = (s.guns === 1 ? 0 : g/(s.guns-1) - .5)*L*.74;
    cx.fillRect(gx-2, Wd*.36, 4, Wd*.16); cx.fillRect(gx-2, -Wd*.52, 4, Wd*.16); }
  const nd = Math.floor((1 - s.hull/s.maxHull)*8); cx.fillStyle = 'rgba(14,9,7,.6)';
  for (let i = 0; i < nd; i++){ circle(cx, (h1(i*3.1 + L) - .5)*L*.8, (h1(i*5.7 + Wd) - .5)*Wd*.8, 2 + h1(i)*2.5); cx.fill(); }
  cx.restore();
  if (s.rakeAt != null && clock >= s.rakeAt && clock - s.rakeAt < .4){ cx.strokeStyle = 'rgba(255,236,170,' + (.75*(1 - (clock - s.rakeAt)/.4)).toFixed(3) + ')';
    cx.lineWidth = Wd*.42; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(-L*.42, 0);
    cx.lineTo(L*.42, 0); cx.stroke(); cx.lineCap = 'butt'; } /* raked: the shot tears down the length of her */
  // deck furniture tells the classes apart
  cx.fillStyle = 'rgba(30,18,8,.75)'; cx.fillRect(-L*.05, -Wd*.1, L*.09, Wd*.2); cx.strokeStyle = 'rgba(150,110,60,.5)'; cx.lineWidth = .6; cx.strokeRect(-L*.05, -Wd*.1, L*.09, Wd*.2);
  if (T.cargo && !(s.task && s.task.type === 'trade' && !s.task.cargo)){ for (const v of [[.07, -.16, 7], [.07, .1, 6], [-.02, -.04, 6.5], [-.3, 0, 6]]){ cx.fillStyle = '#8f6537';
    cx.fillRect(v[0]*L, v[1]*Wd, v[2], v[2]); cx.strokeStyle = '#4e3418'; cx.lineWidth = .8;
    cx.strokeRect(v[0]*L, v[1]*Wd, v[2], v[2]); }
    for (const v of [[.34, -.1], [.34, .1], [-.1, .2]]){ cx.fillStyle = '#6f4b25'; circle(cx, v[0]*L, v[1]*Wd, 2.6); cx.fill(); cx.strokeStyle = '#c9a25e'; cx.lineWidth = .7; cx.stroke(); } }
  if (T.boats){ for (const sd of [-1, 1]){ cx.fillStyle = '#eef2f4'; cx.beginPath();
    cx.ellipse(L*.14, sd*Wd*.14, 7.5, 2.6, 0, 0, TAU); cx.fill(); cx.strokeStyle = '#6a5a44';
    cx.lineWidth = .7; cx.stroke(); }
    cx.fillStyle = '#c9a24a'; cx.fillRect(-L*.5 - 1.5, -Wd*.3, 4.2, Wd*.6); cx.fillStyle = darkness() > .25 ? '#ffe9a8' : '#1f2c36';
      for (let k = -2; k <= 2; k++) cx.fillRect(-L*.5 - .7, k*Wd*.11 - 1.5, 2.6, 3); } /* the gilded stern and its gallery windows */
  if (s.cls === 'brig'){ cx.fillStyle = T.band || '#7a1f14'; cx.fillRect(-L*.32, -2.5, 7, 5); }
  if (T.decks){ /* a two-decker: quarterdeck and forecastle, and the gangways over the upper gun deck */
    cx.fillStyle = 'rgba(60,30,14,.34)'; cx.fillRect(-L*.46, -Wd*.3, L*.2, Wd*.6); cx.fillRect(L*.26, -Wd*.24, L*.1, Wd*.48);
    cx.strokeStyle = T.trim; cx.lineWidth = 1; cx.strokeRect(-L*.46, -Wd*.3, L*.2, Wd*.6);
    cx.strokeStyle = 'rgba(240,208,112,.5)'; cx.lineWidth = 1.3; cx.setLineDash([3, 4]);
      cx.beginPath(); for (const sd of [-1, 1]){ cx.moveTo(-L*.26, sd*Wd*.3); cx.lineTo(L*.26, sd*Wd*.3);
      } cx.stroke(); cx.setLineDash([]); }
  if (T.chests) for (const v of [[-.2, -.16], [-.2, .06], [.16, -.05], [-.12, -.05]]){ cx.fillStyle = '#e8b92e';
    cx.fillRect(v[0]*L, v[1]*Wd, 8, 5.5); cx.strokeStyle = '#7a5a10'; cx.lineWidth = .8;
    cx.strokeRect(v[0]*L, v[1]*Wd, 8, 5.5); }
  if (s === p){ cx.strokeStyle = '#3a2412'; cx.lineWidth = 1.1; circle(cx, -L*.33, 0, 3);
    cx.stroke(); cx.beginPath(); cx.moveTo(-L*.33 - 4, 0); cx.lineTo(-L*.33 + 4, 0);
    cx.moveTo(-L*.33, -4); cx.lineTo(-L*.33, 4); cx.stroke(); }
  { const run = s.sinking == null && s.rl && (s.rl[0] > 0 || s.rl[1] > 0 || s.announced || s.provoked || s.owner === 'player' && !!tracked && Math.hypot(tracked.x - s.x, tracked.y - s.y) < 900);
    /* ports open and guns run out when she clears for action */
    for (let g = 0; g < s.guns; g++){ const gx = (s.guns === 1 ? 0 : g/(s.guns-1) - .5)*L*.62;
      if (run){ cx.fillStyle = '#a02c1e'; cx.fillRect(gx-2.7, Wd*.5-4, 5.4, 1.7);
        cx.fillRect(gx-2.7, -Wd*.5+2.3, 5.4, 1.7); cx.fillStyle = '#15171a'; cx.fillRect(gx-1.6, Wd*.5-2.5, 3.2, 5.5);
        cx.fillRect(gx-1.6, -Wd*.5-3, 3.2, 5.5); }
      else { cx.fillStyle = 'rgba(20,14,10,.82)'; cx.fillRect(gx-1.9, Wd*.5-3.6, 3.8, 2.3); cx.fillRect(gx-1.9, -Wd*.5+1.3, 3.8, 2.3); } } }
  if (s.sails > 8 && s.sails < 45 && s.sinking == null){ const sd = h1(L*1.7 + Wd) > .5 ? 1 : -1, mx = M[main]*L; /* a fallen topmast trails over the side in a tangle of canvas */
    cx.fillStyle = 'rgba(232,224,200,.5)'; cx.beginPath(); cx.moveTo(mx - 4, sd*Wd*.4);
      cx.lineTo(mx - L*.2, sd*Wd*1.02); cx.lineTo(mx - L*.07, sd*Wd*1.14); cx.lineTo(mx + 5, sd*Wd*.5); cx.closePath(); cx.fill();
    cx.strokeStyle = '#2a1c10'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(mx, sd*Wd*.1); cx.lineTo(mx - L*.16, sd*Wd*1.1); cx.stroke(); }
  cx.strokeStyle = 'rgba(20,12,6,.5)'; cx.lineWidth = .7; cx.beginPath();
  M.forEach(m => { for (const sd of [-1, 1]) for (const o of [-.05, .02]){ cx.moveTo(m*L, 0); cx.lineTo(m*L + o*L, sd*Wd*.47); } }); cx.stroke();
  cx.translate(0, hl*Wd*.34); // masts and canvas lean over with her
  const so = Math.cos(-s.h)*4 - Math.sin(-s.h)*6, sq = Math.sin(-s.h)*4 + Math.cos(-s.h)*6;
  cx.save(); cx.translate(so, sq); rigging(s, fade, true); cx.restore();
  rigging(s, fade, false);
  cx.globalAlpha = fade;
  if (s.sails > 8 && s.sails < 84 && s.sail > 0){ cx.fillStyle = 'rgba(38,24,12,.5)';
    for (let i = Math.floor((100 - s.sails)/14); i > 0; i--){ circle(cx, M[i % M.length]*L + (h1(i*2.3 + L) - .4)*7, (h1(i*4.1 + Wd) - .5)*Wd*1.25, 1.6 + h1(i*1.9)*2.2);
    cx.fill(); } } /* shot holes and scorching in her canvas */
  M.forEach((m, i) => { cx.fillStyle = '#1e130a'; circle(cx, m*L, 0, i === main ? 3.2 : 2.6); cx.fill(); cx.fillStyle = '#8a6740'; circle(cx, m*L, 0, 1.2); cx.fill(); });
  cx.fillStyle = 'rgba(255,225,140,.9)'; circle(cx, -L*.5, 0, 1.4); cx.fill(); if (darkness() > .25 && s.sinking == null){ cx.fillStyle = 'rgba(255,214,120,.16)';
    circle(cx, -L*.5, 0, 11); cx.fill(); cx.fillStyle = 'rgba(255,224,150,.3)'; circle(cx, -L*.5, 0, 5); cx.fill(); }
  const fa = angd(wind.dir, s.h), fx = -L*.46, big = s.surrendered, fl = big ? 28 : 21;
  const pts = []; for (let j = 0; j <= 4; j++){ const d = j*fl/4, off = Math.sin(time*8 - j*1.1 + s.x*.01)*j*(big ? 1.1 : .9);
    pts.push([fx + Math.cos(fa)*d - Math.sin(fa)*off, Math.sin(fa)*d + Math.cos(fa)*off]); }
  const ribbon = (w, col) => { cx.strokeStyle = col; cx.lineWidth = w; cx.lineJoin = 'round';
    cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]); for (let j = 1; j < 5; j++) cx.lineTo(pts[j][0], pts[j][1]); cx.stroke(); };
  if (big){ ribbon(12.5, 'rgba(8,25,30,.7)'); ribbon(10, '#ffffff'); }
  else if (s.released){ ribbon(7, 'rgba(8,25,30,.5)'); ribbon(5, '#8d8d86'); }
  else if (s.owner === 'player' ? marque : s.nation) drawEnsign(cx, s.owner === 'player' ? marque : s.nation, pts, 7.4); /* a privateer flies her patron's colours */
  else { ribbon(9, 'rgba(8,25,30,.55)'); ribbon(7, T.flag[0]); if (T.flag[1] !== T.flag[0]) ribbon(2.4, T.flag[1]);
    if (T.skull){ cx.fillStyle = '#f2f2f2'; circle(cx, pts[2][0], pts[2][1], 2.1); cx.fill(); } }
  cx.fillStyle = '#1e130a'; circle(cx, fx, 0, 1.6); cx.fill();
  cx.restore();
  if (s === tracked && s.sinking == null && !s.surrendered && p){ const upw = wind.dir + Math.PI, g = Math.cos(Math.atan2(s.y - p.y, s.x - p.x) - wind.dir), col = g > .3 ? '120,220,150' : g < -.3 ? '255,120,100' : '230,220,190', rr = L*.82, ax = s.x + Math.cos(upw)*rr, ay = s.y + Math.sin(upw)*rr;
    cx.strokeStyle = 'rgba(' + col + ',.85)'; cx.lineWidth = 3; if (g < -.3) cx.setLineDash([5, 5]);
      cx.beginPath(); cx.arc(s.x, s.y, rr, upw - .5, upw + .5); cx.stroke(); cx.setLineDash([]);
      /* broken when she holds the gauge, whole when you do */ /* the wind's side of her: green when the weather gauge is yours */
    cx.fillStyle = 'rgba(' + col + ',.95)'; cx.beginPath(); cx.moveTo(ax + Math.cos(wind.dir)*13, ay + Math.sin(wind.dir)*13);
      cx.lineTo(ax + Math.cos(wind.dir + 2.3)*7, ay + Math.sin(wind.dir + 2.3)*7); cx.lineTo(ax + Math.cos(wind.dir - 2.3)*7, ay + Math.sin(wind.dir - 2.3)*7); cx.closePath(); cx.fill(); }
}
function drawBars(s){
  if (s.sinking != null || s.released) return;
  const f = Math.max(1, .8/scale), y = s.y - s.t.len*.78 - 6*(f - 1), w = 46*f, x = s.x - w/2, th = strikeAt(s), mine = s.role === 'fleet'; // tags keep their size on screen when you zoom out
  cx.font = '700 ' + Math.round(11*f) + 'px "Alegreya Sans", sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 3*f; cx.strokeStyle = 'rgba(8,25,30,.8)';
  const label = s.t.name.toUpperCase() + (mine && s.task && s.task.type !== 'fleet' ? ' · ' + taskWord(s).toUpperCase() : '');
  cx.strokeText(label, s.x, y - 5*f); cx.fillStyle = s.t.tag; cx.fillText(label, s.x, y - 5*f);
  if (s.hull < s.maxHull || s.sails < 100){
    cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(x - f, y - f, w + 2*f, 11*f);
    cx.fillStyle = mine || s.hull/s.maxHull > th ? '#6c9a55' : '#ffffff'; cx.fillRect(x, y, w*clamp(s.hull/s.maxHull, 0, 1), 5*f);
    if (!mine){ cx.fillStyle = '#ffffff'; cx.fillRect(x + w*th - .75*f, y - 2*f, 1.5*f, 8*f); }
    cx.fillStyle = C.bone; cx.fillRect(x, y + 6*f, w*s.sails/100, 3*f); if (!mine){ cx.fillStyle = '#ffffff'; cx.fillRect(x + w*.08 - .5*f, y + 5*f, f, 5*f); }
  }
}
function drawStruck(s){
  const pulse = .5 + .5*Math.sin(time*5), near = s.board > 0;
  cx.fillStyle = 'rgba(255,255,255,' + (.05 + .05*pulse).toFixed(3) + ')'; circle(cx, s.x, s.y, BOARD_R); cx.fill();
  cx.setLineDash([9, 8]); cx.lineDashOffset = -time*22; cx.strokeStyle = 'rgba(255,255,255,' + (.5 + .4*pulse).toFixed(3) + ')'; cx.lineWidth = 2.2;
  circle(cx, s.x, s.y, BOARD_R); cx.stroke(); cx.setLineDash([]); cx.lineDashOffset = 0;
  if (near){ cx.strokeStyle = C.brass; cx.lineWidth = 6; cx.lineCap = 'round'; cx.beginPath();
    cx.arc(s.x, s.y, BOARD_R, -Math.PI/2, -Math.PI/2 + TAU*clamp(s.board, 0, 1)); cx.stroke(); cx.lineCap = 'butt'; }
  const y = s.y - BOARD_R - 30; cx.textAlign = 'center'; cx.lineWidth = 4; cx.strokeStyle = 'rgba(8,25,30,.85)';
  cx.font = '22px "IM Fell English SC", Georgia, serif'; cx.strokeText('Struck her colours', s.x, y); cx.fillStyle = '#ffffff'; cx.fillText('Struck her colours', s.x, y);
  const l2 = near ? 'Boarding…' : 'Hold fire. Sail into the ring to board.';
  cx.font = '700 14px "Alegreya Sans", sans-serif'; cx.strokeText(l2, s.x, y + 18); cx.fillStyle = near ? C.brass : C.bone; cx.fillText(l2, s.x, y + 18);
}
function aimSide(side, struckOnly){
  const ch = Math.cos(p.h), sh = Math.sin(p.h), k = SHOTK[shot], life = RANGE/BALL_V*k, a = p.h + side*Math.PI/2;
  const vx = Math.cos(a)*BALL_V + ch*p.speed*.6, vy = Math.sin(a)*BALL_V + sh*p.speed*.6;
  const bx = p.x - sh*side*p.t.wid*.55, by = p.y + ch*side*p.t.wid*.55, inf = p.t.len*.2;
  let hit = null, ht = 0;
  for (const s of ships){ if (s.sinking != null || s.released || s.owner === 'player' || !!s.surrendered !== !!struckOnly) continue; if (Math.hypot(s.x-p.x, s.y-p.y) > RANGE + 260) continue;
    const c = Math.cos(s.h), n = Math.sin(s.h);
    for (let i = 1; i <= 24; i++){ const t = life*i/24, dx = bx + vx*t - (s.x + c*s.speed*t), dy = by + vy*t - (s.y + n*s.speed*t);
      const lx = (dx*c + dy*n)/(s.t.len*.5 + inf), ly = (-dx*n + dy*c)/(s.t.wid*.5 + inf);
      if (lx*lx + ly*ly < 1){ if (!hit || t < ht){ hit = s; ht = t; } break; } } }
  return { vx, vy, bx, by, life, k, hit, ht };
}
function drawAim(){
  const ch = Math.cos(p.h), sh = Math.sin(p.h), half = p.t.len*.31;
  for (const side of [-1, 1]){
    const A = aimSide(side), ready = p.rl[side > 0 ? 1 : 0] <= 0, wd = .07*RANGE*A.k;
    const col = !ready ? '200,205,195' : A.hit ? '120,235,150' : '214,165,78', al = ready ? 1 : .5;
    const ex = A.vx*A.life, ey = A.vy*A.life;
    const f0x = A.bx + ch*half, f0y = A.by + sh*half, a0x = A.bx - ch*half, a0y = A.by - sh*half;
    const f1x = f0x + ex + ch*wd, f1y = f0y + ey + sh*wd, a1x = a0x + ex - ch*wd, a1y = a0y + ey - sh*wd;
    const g = cx.createLinearGradient(A.bx, A.by, A.bx + ex, A.by + ey);
    g.addColorStop(0, 'rgba(' + col + ',' + (.26*al).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',' + (.05*al).toFixed(3) + ')');
    cx.beginPath(); cx.moveTo(f0x, f0y); cx.lineTo(f1x, f1y); cx.lineTo(a1x, a1y); cx.lineTo(a0x, a0y); cx.closePath(); cx.fillStyle = g; cx.fill();
    cx.strokeStyle = 'rgba(' + col + ',' + (.6*al).toFixed(3) + ')'; cx.lineWidth = 1.3; cx.setLineDash([6, 6]);
    cx.beginPath(); cx.moveTo(f0x, f0y); cx.lineTo(f1x, f1y); cx.moveTo(a0x, a0y); cx.lineTo(a1x, a1y); cx.stroke(); cx.setLineDash([]);
    cx.lineWidth = 2; cx.beginPath(); cx.moveTo(f1x, f1y); cx.lineTo(a1x, a1y); cx.stroke();
    if (A.hit){ const s = A.hit, tx = s.x + Math.cos(s.h)*s.speed*A.ht, ty = s.y + Math.sin(s.h)*s.speed*A.ht;
      if (Math.abs(Math.sin(p.h - s.h)) > .8 && shot !== 'chain'){ cx.fillStyle = 'rgba(' + col + ',' + al.toFixed(3) + ')';
        cx.font = '700 13px "Alegreya Sans", sans-serif'; cx.textAlign = 'center'; cx.fillText('RAKE', tx, ty - 28); }
      cx.strokeStyle = 'rgba(' + col + ',' + (.95*al).toFixed(3) + ')'; cx.lineWidth = 2; circle(cx, tx, ty, 15); cx.stroke();
      cx.beginPath(); for (let q = 0; q < 4; q++){ const a = q*Math.PI/2; cx.moveTo(tx + Math.cos(a)*9, ty + Math.sin(a)*9); cx.lineTo(tx + Math.cos(a)*22, ty + Math.sin(a)*22); } cx.stroke(); }
  }
}
function drawArcs(){
  cx.save(); cx.translate(p.x, p.y); cx.rotate(p.h); cx.setLineDash([5, 7]); cx.lineWidth = 1.5;
  for (const side of [-1, 1]){ cx.strokeStyle = p.rl[side > 0 ? 1 : 0] <= 0 ? 'rgba(214,165,78,.55)' : 'rgba(239,230,207,.14)';
    cx.beginPath(); cx.arc(0, 0, RANGE*SHOTK[shot], side*Math.PI/2 - .26, side*Math.PI/2 + .26); cx.stroke(); }
  cx.setLineDash([]); cx.restore();
}
const streaks = []; for (let i = 0; i < 26; i++) streaks.push({ x: rnd(), y: rnd(), l: rand(14, 30), s: rand(.7, 1.3) });
function pointer(sx, sy, draw){
  const m = 54, px = clamp(sx, m + pad.l, vw - m - pad.r), py = clamp(sy, m + pad.t, vh - m - pad.b), a = Math.atan2(sy-py, sx-px);
  cx.save(); cx.translate(px, py); draw(); cx.rotate(a); cx.beginPath(); cx.moveTo(32, 0); cx.lineTo(23, 6); cx.lineTo(23, -6); cx.closePath(); cx.fill(); cx.restore();
}

