function sailable(s, want, dt){
  const upw = wind.dir + Math.PI, d = angd(want, upw);
  if (Math.abs(d) < .87){ s.tackT -= dt; if (s.tackT <= 0){ s.tack = d >= 0 ? 1 : -1; s.tackT = 7; } return upw + s.tack*.92; }
  s.tackT = 0; return want;
}
const OFFS = [0, .5, -.5, 1, -1, 1.6, -1.6, 2.3, -2.3];
function avoid(s, want){
  for (const o of OFFS){ const a = want + o, c = Math.cos(a), n = Math.sin(a);
    if (!shore(s.x + c*125, s.y + n*125) && !shore(s.x + c*62, s.y + n*62)) return a; }
  return want + Math.PI;
}
function aiFire(s, d, brg){
  if (d > RANGE*.9) return;
  const rel = angd(brg, s.h);
  if (Math.abs(Math.abs(rel) - Math.PI/2) < .24) fire(s, rel > 0 ? 1 : -1, true);
}
const warship = s => s.role === 'hunter' || s.role === 'patrol' || s.role === 'escort' || s.role === 'quarry' || s.role === 'rover';
const hostileTo = (a, b) => { if (a.owner === b.owner) return false;
  if (a.owner === 'player' || b.owner === 'player'){ const o = a.owner === 'player' ? b : a; return o.owner === 'pirate' || hostile(o.nation) || o.provoked; }
  return a.owner === 'pirate' || b.owner === 'pirate' || atWar(a.nation, b.nation); };
function attack(s, tx, ty, dt, vp, tg){ // close, then turn a broadside on the target
  const dx = tx-s.x, dy = ty-s.y, d = Math.hypot(dx, dy), brg = Math.atan2(dy, dx); let want;
  const smart = !!tg && (s.cap ? s.cap.sea >= 3 : s.t.hull >= 140 || s.role === 'hunter' || s.role === 'quarry'); /* a seasoned captain manoeuvres for the rake and the weather gauge */
  const run = !!tg && prize(tg) && !tg.surrendered, near = run ? 140 : 230; /* a fleeing merchant is run down close before the helm goes over */
  if (d > near){ let ax = tx, ay = ty;
    if (run){ const lead = Math.min(220, d*.5); ax = tx + Math.cos(tg.h)*lead; ay = ty + Math.sin(tg.h)*lead; if (isNear(ax, ay)){ ax = tx; ay = ty; } }
    else if (smart && d < 900){ const c = Math.cos(tg.h), n = Math.sin(tg.h), sg = (s.x - tx)*c + (s.y - ty)*n > 0 ? 1 : -1;
      ax = tx + c*sg*170 - Math.cos(wind.dir)*70; ay = ty + n*sg*170 - Math.sin(wind.dir)*70;
      if (isNear(ax, ay)){ ax = tx; ay = ty; } }
    s.raking = smart && d < 900; want = navTo(s, ax, ay, dt); s.sail = 1; }
  else { const a = brg + Math.PI/2, b = brg - Math.PI/2; want = Math.abs(angd(a, s.h)) < Math.abs(angd(b, s.h)) ? a : b; s.sail = .5; }
  if (d <= RANGE*.9){ const rel = angd(brg, s.h); if (Math.abs(Math.abs(rel) - Math.PI/2) < .24) fire(s, rel > 0 ? 1 : -1, vp); }
  return want;
}
function waterNear(x, y, r){ const c = cellNear(clamp(x + rand(-r, r), 0, W-1), clamp(y + rand(-r, r), 0, H-1));
  return c < 0 ? [x, y] : [(c % GW + .5)*CELL, ((c/GW|0) + .5)*CELL]; }
function loiterTo(s, dt, pick){ if (!s.loiter || Math.hypot(s.loiter[0]-s.x, s.loiter[1]-s.y) < 230){ s.loiter = pick(); s.path = null; } return navTo(s, s.loiter[0], s.loiter[1], dt); }
function station(s, L, dt){
  const c = Math.cos(L.h), n = Math.sin(L.h), o = s.off || [-170, 0], tx = L.x + c*o[0] - n*o[1], ty = L.y + n*o[0] + c*o[1], d = Math.hypot(tx-s.x, ty-s.y);
  s.sail = d > 170 ? 1 : d > 55 ? .5 : L.speed > 20 ? .5 : 0;
  return d > 55 ? (L === p && d < 600 ? Math.atan2(ty-s.y, tx-s.x) : navTo(s, tx, ty, dt)) : L.h;
}
function ai(s, dt){
  if (s.role === 'fleet'){ fleetAI(s, dt); return; }
  const dx = p.x-s.x, dy = p.y-s.y, d = Math.hypot(dx, dy), brg = Math.atan2(dy, dx), hot = p.alive && state === 'play';
  if (s.lead && (s.lead.sinking != null || s.lead.surrendered || s.lead.released || s.lead.gone)) s.lead = null;
  const L = s.lead || (s.fleet && fleet ? fleet.lead : null);
  let want = s.h, fights = false;
  if (hot && !s.surrendered && !s.released){
    const v = vis();
    if (s.role === 'hunter') fights = d < 1500*v || s.announced && d < 900;
    else if (s.role === 'patrol') fights = d < 900 && (s.provoked || hostile(s.nation) && d < 700*v);
    if (s.role === 'patrol' && s.nation === 'es' && d < 430 && !fights && !hostile('es') && hold.cloth > 0 && clock > customsT && !menuOpen && !melee && !curPort_busy() && ports.some(q => q.home === 'es' && Math.hypot(q.x - p.x, q.y - p.y) < 2400)) customs(s);
    if (s.role === 'patrol' && s.nation === 'en' && s.rival == null && d < 430 && !fights && !hostile('en') && hold.flour + hold.fish > 0 && atWar('en', 'fr') && clock > customsT && !menuOpen && !melee && !curPort_busy() && (marque === 'en' || (ports.find(q => q.name === homeName) || {}).home === 'en') && ports.some(q => (q.nk === 'fr' || q.spec.free) && Math.hypot(q.x - p.x, q.y - p.y) < 2400)) navyStop(s);
    else if (s.role === 'escort') fights = d < 650 && (s.provoked || s.fleet && fleet && fleet.alarm || hostile(s.nation));
    else if (s.role === 'quarry') fights = d < 650*v || s.hitByPlayer;
    else if (s.role === 'rover' && d < 700*v){ // a rover fights what she can beat and runs from what she cannot
      let mine = p.hull, theirs = s.hull; for (const o of ships){ if (o.sinking != null) continue;
        if (o.role === 'fleet' && Math.hypot(o.x - p.x, o.y - p.y) < 700) mine += o.hull;
        else if (o !== s && o.role === 'rover' && Math.hypot(o.x - s.x, o.y - s.y) < 500) theirs += o.hull; }
      fights = mine <= theirs*1.35; s.runs = !fights; } else if (s.role === 'rover') s.runs = false;
  }
  if (!fights && warship(s) && !s.surrendered && !s.released && !s.grappled){ // look for a quarrel with someone else
    s.scanT -= dt;
    if (s.scanT <= 0){ s.scanT = 1 + rnd(); s.foe = null; let bd = 520;
      for (const o of ships){ if (o === s || o.sinking != null || o.released || o.surrendered || !hostileTo(s, o) || o.owner === 'player' && state !== 'play') continue;
        /* your ships are safe under the fort's guns while you are in port */ const od = Math.hypot(o.x-s.x, o.y-s.y);
        if (od < bd){ bd = od; s.foe = o; } } }
    if (s.foe && (s.foe.sinking != null || s.foe.released || s.foe.surrendered || s.foe.owner === 'player' && state !== 'play' || Math.hypot(s.foe.x-s.x, s.foe.y-s.y) > 720)) s.foe = null;
  } else s.foe = null;
  if (s.grappled){ s.sail = 0; }
  else if (s.surrendered){
    s.sail = 0;
    if (d < BOARD_R && hot) s.board += dt/1.5; else s.board = Math.max(0, s.board - dt);
    if (s.board >= 1){ s.board = 0; capture(s); }
  } else if (s.role === 'rover' && s.runs && !fights){
    s.sail = 1; want = brg + Math.PI; s.foe = null;
  } else if (s.released){
    s.sail = 1; want = brg + Math.PI; if (d > 1500) s.gone = true;
  } else if (fights){
    if (!s.announced && d < 700){ s.announced = true; say(an(nm(s)) + ' is bearing down on you.'); }
    let T = p, bd = d; for (const o of ships) if (o.role === 'fleet' && o.sinking == null){ const od = Math.hypot(o.x-s.x, o.y-s.y); if (od < bd - 60){ bd = od; T = o; } }
    want = attack(s, T.x, T.y, dt, true, T);
  } else if (s.foe){
    want = attack(s, s.foe.x, s.foe.y, dt, false, s.foe);
  } else if (s.role === 'treasure' || s.role === 'escort'){
    if (L && s !== L) want = station(s, L, dt);
    else if (s.role === 'treasure' && fleet){ const q = ROUTE[fleet.leg]; if (fleet.wait > 0) s.sail = 0; else { s.sail = 1; want = navTo(s, q.ox, q.oy, dt); } }
    else s.role = 'patrol';
  } else if (s.role === 'merchant'){ // a merchant wants her cargo home and her people alive: she runs from anything that means her harm, and never offers battle
    s.sail = 1; s.scanT -= dt;
    if (s.scanT <= 0){ s.scanT = 1 + rnd(); s.fear = null; let bd = 680*vis();
      if (hot && (s.hitByPlayer || hostile(s.nation)) && d < bd){ bd = d; s.fear = p; }
      for (const o of ships){ if (o === s || o.sinking != null || o.surrendered || o.released) continue;
        if (o.role === 'fleet' ? !(hot && (s.hitByPlayer || hostile(s.nation))) : !(warship(o) && hostileTo(o, s))) continue;
        const od = Math.hypot(o.x - s.x, o.y - s.y); if (od < bd){ bd = od; s.fear = o; } } }
    const q = s.dest, home = navTo(s, q.ox, q.oy, dt), f = s.fear;
    if (f && f.sinking == null && Math.hypot(f.x - s.x, f.y - s.y) < 900){ const away = Math.atan2(s.y - f.y, s.x - f.x);
      want = Math.abs(angd(home, away)) < 1.7 ? home : away; s.speedMul = 1.12; } // for port if the way lies open, else straight away, with every stitch set
    else { s.fear = null; want = L && s !== L ? station(s, L, dt) : home; s.speedMul = s.conv ? .86 : 1; if (L && L.dest) s.dest = L.dest; }
    if (!L && Math.hypot(q.ox-s.x, q.oy-s.y) < 190){ if (s.transport){ s.gone = true;
      if (mission && mission.type === 'escort') mission.arrived++; } else { s.dest = pickDest(q);
      s.cargo = cargoRoll(); s.path = null; } }
  } else if (s.role === 'patrol'){
    s.sail = 1; want = loiterTo(s, dt, () => { if (s.rival != null) return waterNear(s.home[0], s.home[1], 900); const own = ports.filter(q => q.nk === s.nation), q = own[rnd()*own.length|0]; return waterNear(q.ox, q.oy, 650); });
  } else if (s.role === 'fisher'){ s.sail = .5; want = loiterTo(s, dt, () => waterNear(s.home[0], s.home[1], 560));
  } else if (s.role === 'quarry'){
    s.sail = .5; want = loiterTo(s, dt, () => waterNear(s.home[0], s.home[1], 420));
  } else {
    s.sail = .5; want = loiterTo(s, dt, () => waterNear(s.x, s.y, 900));
  }
  want = avoid(s, sailable(s, want, dt));
  moveShip(s, clamp(angd(want, s.h)*3, -1, 1), dt);
  if (!s.surrendered && s.sail > 0 && s.speed < 6){ s.stuck += dt;
    if (s.stuck > 8 && d > 800){ const c = cellNear(s.x, s.y); if (c >= 0){ s.x = (c % GW + .5)*CELL; s.y = ((c/GW|0) + .5)*CELL; s.path = null; } s.stuck = 0; } }
  else s.stuck = 0;
}

/* ---------- Input ---------- */
const held = { left:false, right:false };
function sailStep(d){ if (state !== 'play' || !p.alive || melee || paused) return; p.sail = clamp(p.sail + d*.5, 0, 1); }
function toggleShot(){ shot = shot === 'round' ? 'double' : shot === 'double' ? 'chain' : shot === 'chain' ? 'grape' : 'round'; $('shotBtn').textContent = SHOTN[shot]; }
