function politics(){
  if (wars.size && rnd() < .35){ const w = [...wars][rnd()*wars.size|0].split('-'), fl = rnd() < .5, att = fl ? w[0] : w[1], def = fl ? w[1] : w[0];
    const own = ports.filter(q => q.nk === def && q !== curPort && q.name !== homeName);
    if (own.length > 1){ const q = own[rnd()*own.length|0]; q.nk = att; q.nation = NAT[att]; news(NAT[att].adj + ' forces have taken ' + q.name + ' from ' + NAT[def].land + '.'); return; } }
  const i = rnd()*4|0, j = (i + 1 + (rnd()*3|0)) % 4, /* Denmark keeps out of it */ a = NKEYS[i], b = NKEYS[j], k = wkey(a, b);
  if (wars.has(k)){ if (wars.size > 1){ wars.delete(k); news('Peace is signed between ' + NAT[a].land + ' and ' + NAT[b].land + '.'); } }
  else { wars.add(k); news('War! ' + Land(a) + ' and ' + NAT[b].land + ' are now at war.'); }
}
/* day, night and weather */
const WX = { clear:['Fair', 0, 0], rain:['Squall', .2, .1], fog:['Fog', -.35, .45], storm:['Storm', .55, .22] };
const sunAt = () => Math.cos(((clock/DAY*24 + 8) % 24 - 13)/24*TAU);
const darkness = () => clamp((.12 - sunAt())/.5, 0, 1)*.6;
const windMul = () => 1 + (weather.hur ? .95 : WX[weather.kind][1])*weather.k;
const vis = () => clamp(1 - darkness()*.45 - WX[weather.kind][2]*weather.k, .35, 1);
function startHurricane(){ if (hurr) return; hurr = { stage: 0, t: 40, x: p.x + 2500, y: p.y + 900, vx: -2500/40, vy: -900/40 }; hurrYear = calYear();
  say('The glass is falling fast and a long swell is running in. A hurricane is coming: make port, or strike your sails and ride it out.'); if (state === 'port' && !menuOpen && !chartOpen) renderPort(); }
function hurricaneTick(dt){ const w = weather; hurr.t -= dt; hurr.x += hurr.vx*dt*(hurr.stage ? .35 : 1); hurr.y += hurr.vy*dt*(hurr.stage ? .35 : 1);
  if (hurr.stage === 0){ if (hurr.t <= 0){ hurr.stage = 1; hurr.t = rand(60, 90);
    w.kind = 'storm'; w.next = null; w.k = Math.max(w.k, .35); w.hur = true; if (state === 'play') say('The hurricane is on you. Bare poles, and keep her head to the sea.'); } return; }
  w.left = Math.max(w.left, 2); wind.tDir += dt*.22; wind.dir += dt*.2; /* the wind backs right round the compass as the eye passes */
  if (state === 'play' && w.k > .4){
    if (p.alive){ const x = dt*(p.sail === 1 ? 1.5 : p.sail > 0 ? .65 : .22)*w.k, fl = p.sail === 1 ? 0 : p.maxHull*.1;
      p.sails = Math.max(p.sail === 1 ? 0 : 20, p.sails - dt*(p.sail === 1 ? 5 : p.sail > 0 ? 2 : .5)*w.k);
      if (p.sail === 1 && p.hull - x <= 0) damage(p, x + 1, 0); else if (p.hull > fl) p.hull = Math.max(fl, p.hull - x); }
    for (const o of ships){ if (o.sinking != null || o.docked || Math.abs(o.x - p.x) > 3000 || Math.abs(o.y - p.y) > 3000) continue;
      o.sails = Math.max(30, o.sails - dt*1.2*w.k); if (o.role === 'fleet' && o.hull > o.maxHull*.15) o.hull -= dt*.4*w.k*(o.sail === 0 ? .25 : o.sail < 1 ? .6 : 1); }
    if (rnd() < dt*.5){ flash = 1; boom(.25, 140); } }
  if (hurr.t <= 0){ hurr = null; w.hur = false; w.left = 0; if (state === 'play') say('The hurricane has passed. Count your spars.');
    gaz('A hurricane has passed' + offWhere(p.x, p.y) + '. Ships are reported dismasted and driven ashore.', 'news'); { const near = ports.filter(q => !q.spec.land && Math.hypot(q.x - p.x, q.y - p.y) < 3000).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0]; if (near){ marketEvent(near, 'flour', 1.4, 3, null); marketEvent(near, 'naval', 1.4, 3, 'After the hurricane ' + near.name + ' is crying out for provisions and for spars, cordage and tar.'); } } if (state === 'port' && !menuOpen && !chartOpen) renderPort(); } }
function weatherTick(dt){
  const w = weather; w.left -= dt; if (hurr) hurricaneTick(dt);
  if (w.left <= 0 && !w.next){ const r = rnd(); const lat = p ? LAT1 - p.y/DEG : 20, mo = calMon(), fogB = lat > 39 ? .16 : 0, galeB = lat > 34 && (mo >= 10 || mo <= 2) ? .13 : 0;
    /* fog on the northern banks, gales in a northern winter */
    w.next = w.kind !== 'clear' ? (r < .75 - fogB ? 'clear' : r < .88 - fogB ? 'rain' : 'fog') : r < .45 - fogB - galeB ? 'clear' : r < .68 - fogB - galeB ? 'rain' : r < .83 - galeB ? 'fog' : 'storm';
    if (w.next === w.kind){ w.next = null; w.left = rand(60, 140); } }
  if (w.next){ w.k -= dt*.12; if (w.k <= 0){ w.k = 0; w.kind = w.next; w.next = null; w.left = w.kind === 'clear' ? rand(90, 200) : rand(50, 110); stormWarned = false;
    if (w.kind !== 'clear' && state === 'play') say(w.kind === 'storm' ? (p && LAT1 - p.y/DEG > 34 && (calMon() >= 10 || calMon() <= 2) ? 'A winter gale is coming down from the north-west.' : 'A storm is coming up.') + ' Shorten sail or lose canvas.' : w.kind === 'fog' ? 'Fog is rolling in. You will be hard to find, and so will they.' : 'A squall is blowing in. The wind freshens.'); } }
  else if (w.kind !== 'clear') w.k = Math.min(1, w.k + dt*.1);
  if (w.kind === 'storm' && w.k > .5){
    if (state === 'play' && p.alive && p.sail === 1 && p.sails > 25){ p.sails = Math.max(25, p.sails - dt*1.6*w.k);
      if (!stormWarned){ stormWarned = true; say('The storm is tearing your canvas. Reduce to battle sails.'); } }
    if (rnd() < dt*.22){ flash = 1; boom(.2, 160); } }
  flash = Math.max(0, flash - dt*3.5);
}
let course = null, autoHelm = false, routeLine = null, routeT = 0, fleetTarget = null, paused = false, lastDay = 0, camNow = { x: 0, y: 0 };
function setCourse(q){ course = q || null; autoHelm = !!q; routeLine = null; routeT = 0; p.path = null; p.losT = 0;
  if (q){ if (p.sail === 0 && state === 'play') p.sail = 1; say('Course set for ' + q.name + '. The helmsman has her; touch the helm to take over.'); } else say('Course cleared.'); }
const wageBill = () => Math.ceil(eco.wage*(inService() && navy.rank >= 4 ? .15 : .3)*(Math.ceil((p.crew + squad().reduce((n, o) => n + o.crew, 0))/8) + squad().reduce((n, o) => n + (o.cap.mate ? 0 : 6*Math.round((o.cap.gun + o.cap.sea)/2)), 0) + spares.length*6));
function payWages(day){ if (day < 1) return; const w = wageBill(); // the first days are sailed on the promise of shares
  if (gold >= w){ gold -= w; floaters.push({ x: p.x, y: p.y - 30, txt: '−' + w + ' wages', life: 2 }); cheer(1); }
  else { gold = 0; const lost = Math.max(1, Math.round(p.crew*.1)); p.crew = Math.max(5, p.crew - lost);
    say('You cannot meet the month\'s wages of ' + w + ' gold. ' + lost + ' hands desert.'); cheer(-15); } }
function setPaused(on){ paused = !!on && state === 'play'; $('pauseBanner').hidden = !paused; $('pauseBtn').textContent = paused ? 'Resume' : 'Pause'; held.left = held.right = false; }
const smokes = []; // gunsmoke that hangs and drifts; enough of it and you fight half blind
const smokeAt = (x, y) => { let n = 0; for (const q of smokes) if (Math.abs(q.x - x) < 130 && Math.abs(q.y - y) < 130) n++; return n; };
function puff(x, y, size, life, dark, vx, vy){ if (Math.abs(x - p.x) > 2600 || Math.abs(y - p.y) > 2600) return;
  if (smokes.length > 460) smokes.shift(); /* only smoke you could ever see is kept */ smokes.push({ x, y, vx: vx || 0, vy: vy || 0, size, life, max: life, dark: !!dark, rot: rnd()*TAU }); }
function impact(b, s){ // shot strikes home: a burst, timber and canvas flung into the sea, and sometimes fire
  const big = !b.chain && !b.grape, out = Math.atan2(b.y - s.y, b.x - s.x), near = clamp(1 - Math.hypot(b.x - p.x, b.y - p.y)/700, 0, 1);
  parts.push({ k:'boomfx', x: b.x, y: b.y, vx: 0, vy: 0, life: big ? .34 : .22, max: big ? .34 : .22, size: big ? 22 : 12 });
  for (let k = big ? 10 : 6; k > 0; k--){ const a = out + rand(-1.25, 1.25), v = rand(60, big ? 210 : 150);
    parts.push({ k:'chunk', c: b.chain ? (rnd() < .7 ? '236,228,205' : '90,70,45') : rnd() < .6 ? '150,105,60' : '74,50,28', x: b.x, y: b.y, vx: Math.cos(a)*v + Math.cos(s.h)*s.speed, vy: Math.sin(a)*v + Math.sin(s.h)*s.speed, life: rand(.45, 1.05), max: 1.05, size: rand(2, b.chain ? 6 : 5), a: rnd()*TAU, rag: b.chain }); }
  for (let k = 0; k < 6; k++) parts.push({ k:'bit', c:'175,125,72', x: b.x, y: b.y, vx: rand(-80, 80), vy: rand(-80, 80), life: rand(.3, .8), max: .8, size: rand(1, 2.6) });
  puff(b.x, b.y, big ? 16 : 11, rand(5, 9), true);
  if (big && rnd() < .4){ const c = Math.cos(s.h), n = Math.sin(s.h), dx = b.x - s.x, dy = b.y - s.y;
    (s.burn = s.burn || []).push({ ox: clamp((dx*c + dy*n)*.7, -s.t.len*.4, s.t.len*.4), oy: clamp((-dx*n + dy*c)*.5, -s.t.wid*.3, s.t.wid*.3), t: rand(3, 7) });
    if (s.burn.length > 4) s.burn.shift(); }
  if (!reduced && near > .3) shake = Math.min(10, shake + (big ? 2.2 : 1)*near);
  boom(near*.18, big ? 700 : 1200);
}
let standing, mission = null, offers = [], fleet = null, tracked = null, zoomMul = 1, baseScale = 1, driftT = 0, patrolT = 0, trafT = 0, trafWant = 0;
const TRACK_R = 5200;
const hostile = k => !!k && standing[k] <= -25;
const standWord = v => v <= -25 ? 'Hostile' : v < -8 ? 'Wary' : v < 15 ? 'Neutral' : 'Friendly';
function repute(k, d){
  if (!k) return; const was = hostile(k); standing[k] = clamp(standing[k] + d, -100, 100);
  if (!was && hostile(k)) say(NAT[k].land.replace(/^t/, 'T') + ' now counts you an enemy. ' + NAT[k].adj + ' ports are closed to you and her warships will hunt you.');
  else if (was && !hostile(k)) say(NAT[k].land.replace(/^t/, 'T') + ' no longer hunts you. ' + NAT[k].adj + ' ports are open again.');
}
function offend(s, amt){ if (!s.nation) return; amt *= D().rep;
  if (marque && atWar(marque, s.nation)){ repute(s.nation, -amt*.5); repute(marque, amt*.4); return; } /* a lawful act of war */
  repute(s.nation, -amt); NKEYS.forEach(k => { if (k !== s.nation) repute(k, -amt*.25); }); /* piracy: every flag takes note */
  if (marque && (s.nation === marque || standing[marque] < -8)){ const k = marque;
    marque = null; navy = { k: null, pts: 0, rank: 0 }; say('Your letter of marque from ' + NAT[k].land + ' is revoked and your name struck from her lists. You sail as a pirate now.'); } }
function engage(s){ if (s && s.owner !== 'player' && !s.released && s.sinking == null) tracked = s; }
function refit(){ const t = p.t, f = p.hull/p.maxHull; p.guns = t.guns + up.guns; p.maxHull = t.hull + 30*up.hull; p.hull = p.maxHull*f;
  p.speedMul = 1 + .07*up.sail; p.reload = 3.6*Math.pow(.9, up.drill); }

