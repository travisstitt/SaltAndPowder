function update(dt){ tick++; { const mo = calMon(), sn = mo >= 11 || mo <= 2 ? 2 : mo >= 8 ? 1 : 0; if (sn !== seasonNow){ seasonNow = sn; tiles.clear(); tilesLo.clear(); } }
  wind.timer -= dt;
  if (wind.timer <= 0){ wind.timer = rand(12, 26); wind.tDir = wind.dir + rand(-1.2, 1.2); wind.tStr = rand(.7, 1.3); }
  wind.dir += angd(wind.tDir, wind.dir)*dt*.08; wind.str += (wind.tStr - wind.str)*dt*.1;

  for (let i = parts.length-1; i >= 0; i--){ const q = parts[i]; q.life -= dt; if (q.life <= 0){ parts.splice(i, 1); continue; }
    q.x += q.vx*dt; q.y += q.vy*dt; if (q.k === 'smoke'){ q.vx = q.vx*.96 + Math.cos(wind.dir)*1.2;
      q.vy = q.vy*.96 + Math.sin(wind.dir)*1.2; } else if (q.k === 'chunk'){ q.vx *= 1 - dt*1.2; q.vy *= 1 - dt*1.2; } }
  for (let i = parts.length-1; i >= 0; i--){ const q = parts[i]; if (q.k === 'chunk' && q.life < .06 && !q.wet){ q.wet = true;
    parts.push({ k:'splash', x: q.x, y: q.y, vx: 0, vy: 0, life: .45, max: .45, size: 2.6 }); } }
  { const wx = Math.cos(wind.dir)*11*wind.str*windMul(), wy = Math.sin(wind.dir)*11*wind.str*windMul(), fast = weather.kind === 'storm' || weather.kind === 'rain' ? 1 + 2*weather.k : 1;
    // wind and rain clear the smoke
    for (let i = smokes.length-1; i >= 0; i--){ const q = smokes[i]; q.life -= dt*fast;
      if (q.life <= 0){ smokes.splice(i, 1); continue; } q.vx *= 1 - dt*.9; q.vy *= 1 - dt*.9;
      q.x += (q.vx + wx)*dt; q.y += (q.vy + wy)*dt; } }
  for (const s of ships) ailing(s, dt); ailing(p, dt);
  if (parts.length > 1600) parts.splice(0, parts.length - 1600);
  shake *= Math.pow(.02, dt);
  if (state !== 'play' && state !== 'port') return;
  const sailing = state === 'play';
  clock += dt; weatherTick(dt); polT -= dt; if (polT <= 0){ polT = rand(220, 380); if (calIdx() > 166) politics(); }

  for (let i = wrecks.length - 1; i >= 0; i--){ const w = wrecks[i]; w.t -= dt; w.x += Math.cos(wind.dir)*3*dt; w.y += Math.sin(wind.dir)*3*dt; if (w.t <= 0) wrecks.splice(i, 1); }
  if (sailing && officers.bosun && p.sails < 100 && p.sails > 8 && !tracked) p.sails = Math.min(100, p.sails + dt*.12);
  if (sailing && clock > 150 && clock - dt <= 150 && recall('keys') == null) setKeys(false); /* by now the keys are learned; the legend folds itself away */
  if (paceIdx === 5 && sailing){ const why = !course || !autoHelm ? 'The helmsman needs a course to make a passage.' : weather.kind === 'storm' || hurr ? 'Weather coming on. Back to a brisk pace.' : ships.some(o => o.owner !== 'player' && !o.released && o.sinking == null && (Math.hypot(o.x - p.x, o.y - p.y) < 380 || (o.owner === 'pirate' || hostile(o.nation) || o.provoked) && warship(o) && Math.hypot(o.x - p.x, o.y - p.y) < 1700)) ? 'Sail in sight. Back to a brisk pace.' : Math.hypot(course.ox - p.x, course.oy - p.y) < 900 ? 'Landfall. Back to a brisk pace.' : '';
    if (why){ setPace(2); say(why); } }
  if (paceIdx === 4 && sailing && ships.some(o => o.owner !== 'player' && o.announced && !o.surrendered && !o.released && Math.hypot(o.x - p.x, o.y - p.y) < 1100)){ setPace(1);
    say('Enemy in sight. Back to a steady pace.'); }
  const day = Math.floor(clock/MONTH); if (day > lastDay){ lastDay = day; monthTick(day); }
  if (fleetTarget && (fleetTarget.sinking != null || fleetTarget.released || fleetTarget.surrendered || fleetTarget.gone || ships.indexOf(fleetTarget) < 0)) fleetTarget = null;
  let helm = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  if (sailing && course && p.alive){
    if (autoHelm && helm){ autoHelm = false; say('You have the helm. The course for ' + course.name + ' stays marked; press N to hand her back.'); }
    if (autoHelm && ships.some(o => o.owner !== 'player' && o.announced && !o.surrendered && !o.released && Math.hypot(o.x-p.x, o.y-p.y) < 650)){ autoHelm = false;
      say('Enemy closing. You have the helm.'); }
    routeT -= dt; if (routeT <= 0){ routeT = 3; routeLine = findPath(p.x, p.y, course.ox, course.oy); }
    if (Math.hypot(course.ox-p.x, course.oy-p.y) < 210){ say('Arrived off ' + course.name + '. Drop anchor when you are ready.');
      if (autoHelm) p.sail = 0; course = null; autoHelm = false; routeLine = null; }
    else if (autoHelm && !melee){ const want = avoid(p, sailable(p, navTo(p, course.ox, course.oy, dt), dt)); helm = clamp(angd(want, p.h)*3, -1, 1);
      { const c = Math.cos(p.h), n = Math.sin(p.h); if (shore(p.x + c*100, p.y + n*100) || shore(p.x + c*50, p.y + n*50)) p.speed = Math.min(p.speed, 50);
        } } /* close in with the land the helmsman backs his topsails rather than risk her bottom */
  }
  if (sailing){ if (p.sinking == null) moveShip(p, melee ? 0 : helm, dt);
    else { p.sinking -= dt; overT -= dt; if (overT <= 0) openFate(); }
    if (melee) meleeTick(dt); }

  let merchants = 0, hunters = 0, slotN = 0, fishers = 0; const pat = {};
  for (let i = ships.length-1; i >= 0; i--){ const s = ships[i];
    if (s.sinking != null){ s.sinking -= dt; if (s.sinking <= 0) ships.splice(i, 1); continue; }
    if (s.gone){ ships.splice(i, 1); continue; }
    if ((s.role === 'merchant' || s.role === 'patrol' || s.role === 'fisher') && s.rival == null && !s.hitByPlayer && !s.fleet && !s.transport && s !== tracked && !(mission && mission.ship === s) && (Math.abs(s.x - p.x) > FAR || Math.abs(s.y - p.y) > FAR) && !squad().some(o => o.task && o.task.prey === s) && !outposts.some(o => Math.abs(s.x - o.x) < 4600 && Math.abs(s.y - o.y) < 4600)){ if ((s.rich || s.packet || s.conv) && s.dest && ghosts2.length < 12) ghosts2.push({ cls: s.cls, owner: s.owner, x: s.x, y: s.y, dest: s.dest, cargo: s.cargo, goods: s.goods, rich: !!s.rich, packet: !!s.packet, conv: !!s.conv, name: s.t.name, hull: s.hull, t: clock });
      s.gone = true; ships.splice(i, 1); continue; } /* hull down and gone */
    if (s.role === 'rover' && !s.surrendered){ s.ttl -= dt; if (s.ttl <= 0 && Math.hypot(s.x - p.x, s.y - p.y) > 1500) s.gone = true; }
    if (s.role === 'fleet'){ if (!s.task || s.task.type === 'fleet') s.slot = ++slotN;
      } else if (s.released){ } else if (s.role === 'merchant') merchants++; else if (s.role === 'fisher') fishers++;
      else if (s.role === 'hunter') hunters++; else if (s.role === 'patrol') pat[s.nation] = (pat[s.nation] || 0) + 1;
    ai(s, dt);
  }
  trafT -= dt; if (trafT <= 0){ trafT = .35; let np = 0, small = 0; for (const q of ports){ const d = dP(q);
    if (d < BUBBLE){ np += q.spec.land ? .6 : q.spec.sz >= 2 ? 1.6 : 1; if (q.spec.sz < 2 && d < 4200) small++; } }
    outposts = squad().filter(o => !o.docked && o.task && o.task.type === 'raid' && Math.hypot(o.x - p.x, o.y - p.y) > BUBBLE).slice(0, 2);
      /* a cruiser on a distant station has ships to meet as well */
    for (const o of outposts){ let n = 0; for (const s of ships) if (s.role === 'merchant' && Math.abs(s.x - o.x) < 3200 && Math.abs(s.y - o.y) < 3200) n++;
      if (n < 4 && merchants < 70){ focus = o; try { spawnMerchant(false); } finally { focus = null; } } }
    for (let gi = ghosts2.length - 1; gi >= 0; gi--){ const gh = ghosts2[gi], dx = gh.dest.ox - gh.x, dy = gh.dest.oy - gh.y, dd = Math.hypot(dx, dy) || 1;
      gh.x += dx/dd*55*.35; gh.y += dy/dd*55*.35; /* a ship lost sight of keeps her course, and can be found again */
      if (dd < 300 || clock - gh.t > 900){ ghosts2.splice(gi, 1); continue; } const dp = Math.hypot(gh.x - p.x, gh.y - p.y);
        if (dp > 1500 && dp < 4800 && !isNear(gh.x, gh.y)){ const s = makeShip(gh.cls, gh.owner, 'merchant', gh.x, gh.y, Math.atan2(dy, dx));
        s.dest = gh.dest; s.cargo = gh.cargo; s.goods = gh.goods; s.t.name = gh.name; s.hull = Math.min(s.maxHull, gh.hull);
        if (gh.rich){ s.rich = true; s.t.chests = true; s.t.tag = '#ffe07a'; } if (gh.packet) s.packet = true;
        ships.push(s); if (gh.conv) convoy(s, { nk: gh.owner, spec: { mk: [] } }); ghosts2.splice(gi, 1); } }
    spawnRival(); trafWant = Math.round(clamp(4 + np*1.7, 4, 32)); if (merchants < trafWant) spawnMerchant(false); if (fishers < Math.min(7, small)) spawnFisher(); }
  patrolT -= dt; if (patrolT <= 0){ patrolT = 10; NKEYS.forEach(k => { let n = 0; for (const q of ports) if (q.nk === k && !q.spec.land && dP(q) < BUBBLE) n++; if ((pat[k] || 0) < Math.min(3, Math.ceil(n/3))) spawnPatrol(k, false); }); }
  driftT -= dt; if (driftT <= 0){ driftT = 40; NKEYS.forEach(k => { if (standing[k] < 0) repute(k, 1); }); }
  fleetTick(dt);
  if (tracked){ const t = tracked;
    if (t.sinking != null || t.gone || t.released || ships.indexOf(t) < 0) tracked = null;
    else if (Math.hypot(t.x-p.x, t.y-p.y) > TRACK_R){ tracked = null; if (sailing) say('The ' + nm(t) + ' is over the horizon. You have lost her.'); } }
  hunterT -= dt;
  if (sailing && hunterT <= 0 && p.alive && hunters < Math.min(D().maxH, 1 + Math.min(3, Math.floor(plunder/2000))) + Math.min(2, slotN)){ spawnHunter(); hunterT = 40*D().hunt; }
  if (sailing && p.alive){ roverT -= dt; if (roverT <= 0){ roverT = rand(260, 440)*D().hunt; if (!ships.some(o => o.role === 'rover' && o.sinking == null)) spawnRover(); } }

  for (let i = pending.length-1; i >= 0; i--){ const q = pending[i]; q.delay -= dt; if (q.delay <= 0){ launch(q); pending.splice(i, 1); } }
  for (let i = balls.length-1; i >= 0; i--){ const b = balls[i];
    b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt; let done = false, hitS = null;
    if (b.mine){ for (const s of ships){ if (s.sinking == null && s.owner !== 'player' && hitShip(b, s)){ hitS = s; struck(s);
      if (b.grape) s.crew = Math.max(0, s.crew - 3 - (rnd()*3|0)); else if (!b.chain && rnd() < .5) s.crew = Math.max(0, s.crew - 1);
      strike(b, s, b.grape ? 1 : b.chain ? 2 : 8, b.grape ? 2 : b.chain ? 12 : 1, 1); done = true; break; } } }
    else if (!b.vp){ const ours = b.o.owner === 'player'; for (const s of ships){ if (s !== b.o && s.sinking == null && !s.docked && s.owner !== b.o.owner && !(ours && (s.surrendered || s.released)) && !(s.owner === 'player' && !sailing) && !(b.o.owner === 'player' && !sailing) && hitShip(b, s)){ hitS = s;
      if (ours){ struck(s, true); capXp(b.o); } strike(b, s, b.chain ? 2 : 6, b.chain ? 10 : 2, 1); done = true; break; } } }
    else if (sailing && p.sinking == null && hitShip(b, p)){ hitS = p; p.lastFoe = b.o.nation || 'pirate';
      strike(b, p, b.chain ? 2 : 6, b.chain ? 5 : 2, D().dmg); done = true; if (!tracked) engage(b.o);
      if (rnd() < .45 && p.crew > 6) p.crew--; }
    else if (b.vp && sailing){ for (const o of ships){ if (o.role === 'fleet' && o.sinking == null && !o.docked && hitShip(b, o)){ hitS = o;
      strike(b, o, b.chain ? 2 : 6, b.chain ? 5 : 2, D().dmg); done = true; break; } } }
    if (done){ if (hitS) impact(b, hitS); }
    else if (isLand(b.x, b.y)){ done = true; parts.push({ k:'smoke', g:190, x:b.x, y:b.y, vx:0, vy:0, life:.5, max:.5, size:5 }); }
    else if (b.life <= 0){ done = true; parts.push({ k:'splash', x:b.x, y:b.y, vx:0, vy:0, life:.6, max:.6, size:4.5 }); parts.push({ k:'ring', x:b.x, y:b.y, vx:0, vy:0, life:.9, max:.9, size:5 });
      for (let k = 0; k < 4; k++) parts.push({ k:'bit', c:'235,250,250', x:b.x, y:b.y, vx:rand(-45,45), vy:rand(-45,45), life:rand(.25,.5), max:.5, size:1.6 }); }
    if (done) balls.splice(i, 1);
  }
  for (let i = crates.length-1; i >= 0; i--){ const c = crates[i]; c.life -= dt;
    if (sailing && (p.alive && Math.hypot(c.x-p.x, c.y-p.y) < 48 || ships.some(o => o.role === 'fleet' && o.sinking == null && Math.abs(o.x - c.x) < 46 && Math.abs(o.y - c.y) < 46))){ earn(c.amt, c.x, c.y); crates.splice(i, 1); }
    else if (c.life <= 0) crates.splice(i, 1); }
  for (let i = floaters.length-1; i >= 0; i--){ const f = floaters[i]; f.life -= dt; f.y -= 24*dt; if (f.life <= 0) floaters.splice(i, 1); }

  if (mission && mission.type === 'escort'){ const m = mission, alive = m.ships.filter(t => !t.gone && t.sinking == null && !t.surrendered).length;
    if (m.arrived >= m.need){ say('The transports are safe in the bay at Fort-Royal.'); complete(); }
    else if (alive + m.arrived < m.need){ say('Too many transports are lost. The governor will hear of it.'); repute(m.nk, -6); mission = null; }
    else if (m.raidT > 0 && (m.raidT -= dt) <= 0){ const t = m.ships.find(q => !q.gone && q.sinking == null); if (t){ const a = Math.atan2(m.dest.oy - t.y, m.dest.ox - t.x);
      for (const c of (plunder > 2500 ? ['frigate', 'brig'] : ['brig', 'sloop'])){ const w = waterNear(t.x + Math.cos(a)*950, t.y + Math.sin(a)*950, 200), e = makeShip(c, 'fr', 'patrol', w[0], w[1], a + Math.PI);
        e.provoked = true; ships.push(e); } if (sailing) say('Lookout: French cruisers ahead, standing for the convoy.'); } } }
  if (sailing && mission && mission.type === 'away' && p.alive && Math.hypot(mission.x - p.x, mission.y - p.y) < 300){ say('The ' + mission.name + ' packet takes your dispatches aboard.'); complete(); }
  if (sailing){ nearPort = null; if (p.alive) for (const q of ports) if (Math.hypot(q.x-p.x, q.y-p.y) < 170 || Math.hypot(q.ox-p.x, q.oy-p.y) < 110){ nearPort = q; break; } }
}
function boardable(){ if (melee || !p.alive) return null; let best = null, bd = 85;
  for (const s of ships){ if (s.sinking != null || s.released || s.surrendered || s.owner === 'player') continue;
    const d = Math.hypot(s.x-p.x, s.y-p.y); if (d < bd){ bd = d; best = s; } } return best; }
function grapple(){ const s = boardable(), n = searchable(); if (n && (!s || s === n)){ search(n); return; } if (!s) return;
  struck(s); melee = { s, t: 0, pc0: p.crew, ec0: Math.max(1, s.crew) }; s.grappled = true; p.grappled = true; p.speed = 0; s.speed = 0;
  say('Grapnels away! Your crew boards the ' + nm(s) + '.'); }
function meleeTick(dt){
  const m = melee, s = m.s; if (s.sinking != null || p.sinking != null){ endMelee(); return; }
  m.t += dt; if (m.t < .45) return; m.t = 0;
  const skill = diff === 'easy' ? 1.25 : diff === 'hard' ? .85 : 1;
  const pl = Math.max(1, Math.round(s.crew*.07*rand(.6, 1.4)/skill)), el = Math.max(1, Math.round(p.crew*.09*rand(.6, 1.4)*skill));
  p.crew = Math.max(0, p.crew - pl); s.crew = Math.max(0, s.crew - el); boom(.06, 2600);
  for (let k = 0; k < 3; k++) parts.push({ k:'bit', c:'230,230,220', x: (p.x+s.x)/2 + rand(-14, 14), y: (p.y+s.y)/2 + rand(-14, 14), vx: rand(-30, 30), vy: rand(-30, 30), life:.4, max:.4, size:1.8 });
  if (s.crew <= Math.max(2, m.ec0*.25)){ endMelee(); capture(s); }
  else if (p.crew <= Math.max(3, m.pc0*.3)){ endMelee();
    if (p.crew <= 5){ p.alive = false; p.lastFoe = s.nation || 'pirate'; openFate('Your boarders were cut down on the deck of the ' + nm(s) + ' and your ship was taken. You took ' + plunder + ' gold in plunder and were known as ' + RANKS[rankIdx][1] + '.'); }
    else say('Your boarders are thrown back with ' + p.crew + ' hands left. Break away!'); }
}
