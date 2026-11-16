function moveShip(s, turn, dt){
  const a = Math.abs(angd(s.h, wind.dir)); s.pol = polar(a);
  const pol = s === p ? s.pol : Math.max(s.pol, .3);
  const target = s.t.speed*s.speedMul*s.sail*pol*wind.str*windMul()*(.35 + .65*s.sails/100);
  s.speed += (target - s.speed)*dt*(target > s.speed ? .55 : .9);
  const tr = s.t.turn*(.45 + .55*Math.min(1, s.speed/80))*(s.sail === 1 ? .8 : 1);
  s.h += turn*tr*dt;
  const ht = clamp(Math.sin(angd(wind.dir, s.h))*s.sail*.55*Math.min(1.4, wind.str*windMul()) - turn*.55*Math.min(1, s.speed/70), -1, 1); s.heel += (ht - s.heel)*Math.min(1, dt*2.5); // she leans to the wind and out of her turns
  const ch = Math.cos(s.h), sh = Math.sin(s.h), ox = s.x, oy = s.y;
  if (s.grappled) s.speed = 0;
  const gs = s.sinking == null ? streamAt(s.x, s.y) : null; if (gs && s === p && !gsTold && state === 'play'){ gsTold = true; say('You are in the Gulf Stream. It sets north-east at two knots: ride it north, and keep out of it coming south.'); }
  s.x = clamp(s.x + (ch*s.speed + (gs ? gs[0] : 0))*dt, 40, W-40); s.y = clamp(s.y + (sh*s.speed + (gs ? gs[1] : 0))*dt, 40, H-40);
  if (isLand(s.x + ch*s.t.len*.42, s.y + sh*s.t.len*.42) || isLand(s.x, s.y)){
    if (s.speed > 55 && !(s.owner === 'player' && state !== 'play')){ damage(s, 5, 0); if (s === p) say('Aground! Mind the shoals.'); }
    s.x = ox - ch*1.5; s.y = oy - sh*1.5; s.speed *= .2;
    if (isLand(s.x, s.y)){ s.x = ox; s.y = oy; }
  }
  s.rl[0] = Math.max(0, s.rl[0]-dt); s.rl[1] = Math.max(0, s.rl[1]-dt);
  if (s.speed > 60 && rnd() < dt*(5 + 14*(weather.kind === 'storm' ? weather.k : 0))) parts.push({ k:'bit', c:'240,250,250', x: s.x + ch*s.t.len*.5, y: s.y + sh*s.t.len*.5,
    vx: ch*s.speed*.5 - sh*rand(-40, 40), vy: sh*s.speed*.5 + ch*rand(-40, 40), life: rand(.3, .6), max:.6, size: rand(1.5, 2.6) });
  s.wakeT -= dt;
  if (s.speed > 22 && s.wakeT <= 0){ s.wakeT = .09;
    for (const sd of [-1, 1]) parts.push({ k:'wake', x: s.x - ch*s.t.len*.42 - sh*sd*s.t.wid*.25, y: s.y - sh*s.t.len*.42 + ch*sd*s.t.wid*.25,
      vx: -sh*sd*8 - ch*3, vy: ch*sd*8 - sh*3, life:2.4, max:2.4, size: s.t.wid*.17 }); }
}

const SHOTK = { round:1, double:.55, chain:.78, grape:.6 };
const SHOTN = { round:'Round shot', double:'Double shot', chain:'Chain shot', grape:'Grape shot' };
const crewSlow = () => 1 + Math.max(0, 1 - p.crew/(p.t.crew*.5)); // an undermanned ship is slow to reload
function fire(s, side, vp){
  const i = side > 0 ? 1 : 0;
  if (s.rl[i] > 0 || s.sinking != null || s.surrendered || s.grappled) return;
  s.rl[i] = s === p ? s.reload*crewSlow()*(shot === 'double' ? 1.4 : 1) : s.cap ? reloadOf(s) : D().reload*(s.nation === 'en' ? .85 : 1); /* British crews drill for rate of fire */ s.heel = clamp(s.heel - side*.55, -1, 1); // recoil rolls her away from the broadside
  for (let g = 0; g < s.guns; g++)
    pending.push({ o: s, off: (s.guns === 1 ? 0 : g/(s.guns-1) - .5)*s.t.len*.62, side, delay: rnd()*.22, shot: s === p ? shot : s.shot || (s.nation === 'fr' && !s.cap && s.role !== 'merchant' && vp && p.sails > 45 && s.rl[0] + s.rl[1] < 99 && h1(clock*.37 + s.x) < .6 ? 'chain' : 'round'), vp: !!vp }); /* the French fire high, to cripple the rigging */
  s.smk = smokeAt(s.x, s.y);
}
function launch(q){
  const s = q.o; if (s.sinking != null) return;
  const ch = Math.cos(s.h), sh = Math.sin(s.h), rx = -sh*q.side, ry = ch*q.side;
  const x = s.x + ch*q.off + rx*s.t.wid*.55, y = s.y + sh*q.off + ry*s.t.wid*.55;
  const a = s.h + q.side*Math.PI/2 + rand(-1, 1)*((s === p ? .07 : s.cap ? .16 - .018*s.cap.gun : D().spread) + .011*Math.min(9, s.smk || 0) + (q.shot === 'double' ? .05 : 0) - (Math.cos(s.h + q.side*Math.PI/2 - wind.dir) > .5 ? .02 : 0)); // thick smoke spoils the aim; firing to leeward, with the weather gauge, the smoke blows clear
  const chain = q.shot === 'chain', life = RANGE/BALL_V*SHOTK[q.shot];
  balls.push({ x, y, vx: Math.cos(a)*BALL_V + ch*s.speed*.6, vy: Math.sin(a)*BALL_V + sh*s.speed*.6, life, life0: life, mine: s === p, o: s, vp: q.vp, chain, grape: q.shot === 'grape', dbl: q.shot === 'double', a });
  parts.push({ k:'flash', x: x + Math.cos(a)*5, y: y + Math.sin(a)*5, vx:0, vy:0, life:.11, max:.11, size:14 });
  puff(x + Math.cos(a)*14, y + Math.sin(a)*14, rand(20, 32), rand(14, 24), false, Math.cos(a)*rand(14, 30), Math.sin(a)*rand(14, 30));
  for (let k = 0; k < 5; k++) parts.push({ k:'smoke', g: 205 + (rnd()*35|0), x, y, vx: Math.cos(a)*rand(15,90), vy: Math.sin(a)*rand(15,90), life: rand(.9,1.9), max:1.9, size: rand(4,8) });
  boom(clamp(1 - Math.hypot(s.x-p.x, s.y-p.y)/900, 0, 1)*.22, 420);
}
function strike(b, s, hull, sails, k){ /* a ball strikes home; one that travels the length of her deck rakes her */
  if (b.dbl) hull *= 1.6;
  if (!b.chain && Math.abs(Math.cos(b.a - s.h)) > .8){ hull *= b.grape ? 1 : 1.6; s.crew = Math.max(s === p ? Math.min(s.crew, 6) : 0, s.crew - 1 - (rnd()*2|0)); s.raked = (s.raked || 0) + 1;
    if (clock - (s.rakeAt == null ? -9 : s.rakeAt) > 1.5){ s.rakeAt = clock; floaters.push({ x: s.x, y: s.y - 44, txt: 'Raked!', life: 1.5 }); } }
  damage(s, hull*k, sails*k); }
function damage(s, hull, sails){
  if (s.sinking != null) return;
  s.hull -= hull; s.sails = Math.max(0, s.sails - sails);
  if (s === p && !reduced) shake = Math.min(10, shake + hull*.8);
  if (s.hull <= 0){ sink(s); return; }
  if (s !== p && s.hitByPlayer && !s.surrendered && !s.released && !s.grappled){
    const beaten = s.hull < s.maxHull*strikeAt(s) || s.crew <= s.t.crew*.2, dismasted = s.sails <= 8;
    if (beaten || dismasted){ s.surrendered = true; s.sail = 0; s.board = 0; chime();
      say('The ' + nm(s) + (dismasted && !beaten ? ' is dismasted and' : '') + ' strikes her colours! Hold fire and sail into the white ring to board.'); } }
}
function sink(s){
  s.hull = 0; s.sinking = 2.6; s.alive = false;
  for (let k = 0; k < 16; k++) parts.push({ k:'bit', c:'170,120,70', x: s.x, y: s.y, vx: rand(-90,90), vy: rand(-90,90), life: rand(.5,1.1), max:1.1, size: rand(1.5,3) });
  for (let k = 0; k < 3; k++) parts.push({ k:'boomfx', x: s.x + rand(-18, 18), y: s.y + rand(-12, 12), vx: 0, vy: 0, life: rand(.3, .6), max: .6, size: rand(18, 30) });
  for (let k = 0; k < 18; k++){ const a = rnd()*TAU, v = rand(70, 230); parts.push({ k:'chunk', c: rnd() < .6 ? '150,105,60' : '74,50,28', x: s.x, y: s.y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: rand(.5, 1.2), max: 1.2, size: rand(2, 6), a: a }); }
  for (let k = 0; k < 4; k++) puff(s.x + rand(-20, 20), s.y + rand(-20, 20), rand(18, 30), rand(8, 14), true);
  for (let k = 0; k < 7; k++) parts.push({ k:'plank', x: s.x + rand(-30,30), y: s.y + rand(-30,30), vx: rand(-5,5), vy: rand(-5,5), life: rand(8,14), max:14, size: rand(5,10), a: rnd()*TAU });
  for (let k = 0; k < 7; k++) parts.push({ k:'splash', x: s.x + rand(-28,28), y: s.y + rand(-28,28), vx:0, vy:0, life: rand(.6,1.8), max:1.8, size: rand(4,9) });
  boom(clamp(1 - Math.hypot(s.x-p.x, s.y-p.y)/900, 0, 1)*.3, 200);
  if (s === p){ overT = 2.4; return; }
  if (s.role === 'fleet'){ newsLog.unshift('Lost in action: the ' + s.name + ', your ' + s.t.cname + '.'); newsLog.length = Math.min(newsLog.length, 4); say('The ' + s.name + ', your ' + s.t.cname + ', is lost' + (s.cap.mate ? '.' : ', and Capt. ' + s.cap.name + ' with her.')); s.sinking = 2.6; later(trimHold, 0); return; }
  const mine = s.hitByPlayer, loot = !mine || s.released ? 0 : Math.round((prize(s) ? s.cargo*.4 : (BOUNTY[s.cls] || 0) + (s.cargo || 0)*.4)*D().loot);
  if (loot > 0){ const n = 3; for (let k = 0; k < n; k++)
    crates.push({ x: s.x + rand(-34,34), y: s.y + rand(-34,34), amt: Math.max(1, Math.round(loot/n)), life: 70, ph: rnd()*TAU }); }
  if (mine && prize(s) && s.cargo > 0) say('She sinks. Most of the cargo goes with her.');
  else if (mine && loot) say('The ' + nm(s) + ' is finished. Collect the bounty.');
  if (mine && !s.released) onPrize(s, false);
}
function earn(amt, x, y){
  gold += amt; plunder += amt; floaters.push({ x, y, txt: '+' + amt, life: 1.6 });
  const r = rankFor(plunder); if (r > rankIdx){ rankIdx = r; say('They now call you ' + RANKS[r][1] + '.'); gaz('The waterfront now speaks of the master of the ' + p.name + ' as ' + RANKS[r][1] + '.', 'you'); }
}

/* ---------- AI ---------- */
