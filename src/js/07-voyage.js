function newGame(saved){ voyage++; dirty();
  ships = []; balls = []; pending = []; crates = []; parts = []; floaters = []; smokes.length = 0; orderSel = null; picking = false;
  if (saved && DIFFS[saved.diff]) diff = saved.diff;
  gold = D().purse; plunder = 0; shot = 'round'; up = { guns:0, hull:0, sail:0, drill:0 }; hunterT = 30*D().hunt; curPort = null;
  mission = null; offers = []; tracked = null; fleet = null; standing = { en:10, es:-5, fr:0, nl:0, dk:5 };
  prizePolicy = 'plunder'; roverT = rand(170, 280); formation = 'column'; orders = 'line'; spares = []; laidUp = []; homeName = startName; tavern = []; course = null; autoHelm = false; routeLine = null; fleetTarget = null; paused = false; lastDay = 0;
  hold = emptyHold(); wars = new Set(); polT = rand(200, 320); cal0 = startCal; gsTold = false; marque = null; courtDue = 0; hurr = null; hurrYear = -1; newsLog = []; gazette = []; courtList = []; navy = { k: null, pts: 0, rank: 0 }; captives = { en:0, es:0, fr:0, nl:0, dk:0 }; stats = { taken:0, sunk:0, lawful:0, unlawful:0 }; customsT = 0; clock = 0; melee = null; prizeShip = null;
  weather = { kind:'clear', k:0, left: rand(90, 180), next:null };
  ports.forEach(q => { q.nk = q.home; q.nation = NAT[q.home]; });
  if (saved && saved.p){
    const REN = { 'Port Royal':'Kingston', 'Tortuga':'Cap-Français', 'Petit-Goâve':'Port-au-Prince' }, fix = d => { if (d && d.cls === 'galleon') d.cls = 'fifty'; }; fix(saved); (saved.squad || []).forEach(fix); (saved.laidUp || []).forEach(fix); ['home', 'course', 'where'].forEach(k => { if (REN[saved[k]]) saved[k] = REN[saved[k]]; });
    if (saved.cal0 != null){ cal0 = clamp(saved.cal0|0, 0, 1200); marque = NAT[saved.marque] ? saved.marque : null; courtDue = clamp(saved.courtDue|0, 0, 1e6);
      if (Array.isArray(saved.gaz)) gazette = saved.gaz.slice(0, 40).filter(v => v && v.t).map(v => ({ d: String(v.d).slice(0, 20), t: String(v.t).slice(0, 300), k: v.k === 'you' ? 'you' : 'news' }));
      if (saved.navy && NAT[saved.navy.k]) navy = { k: saved.navy.k, pts: clamp(saved.navy.pts|0, 0, 999), rank: clamp(saved.navy.rank|0, 0, NAVY.length - 1) };
      if (saved.captives) NKEYS.forEach(k => { captives[k] = clamp(saved.captives[k]|0, 0, 9); }); if (saved.stats) for (const k in stats) stats[k] = clamp(saved.stats[k]|0, 0, 99999);
      if (Array.isArray(saved.courtList)) courtList = saved.courtList.slice(0, 30).filter(v => v && v.n).map(v => ({ n: String(v.n).slice(0, 60), v: v.v|0 })); }
    if (Array.isArray(saved.wars) && saved.cal0 != null) wars = new Set(saved.wars.filter(w => /^(en|es|fr|nl)-(en|es|fr|nl)$/.test(w)));
    if (saved.owners && saved.cal0 != null) ports.forEach(q => { const k = saved.owners[q.name]; if (NAT[k]){ q.nk = k; q.nation = NAT[k]; } });
    if (saved.hold) GK.forEach(g => { hold[g] = clamp(saved.hold[g]|0, 0, 400); });
    course = ports.find(q => q.name === saved.course) || null; lastDay = Math.floor(Math.max(0, +saved.clock || 0)/MONTH);
    setPolicy(saved.policy); formation = FORMS[saved.formation] ? saved.formation : 'column'; orders = ORDERS[saved.orders] ? saved.orders : 'line';
    spares = Array.isArray(saved.spares) ? saved.spares.slice(0, 6).map(cleanCap) : []; laidUp = Array.isArray(saved.laidUp) ? saved.laidUp.slice(0, MAXLAID).filter(d => d && CLASSES[d.cls]) : [];
    homeName = ports.some(q => q.name === saved.home) ? saved.home : 'Kingston';
    clock = Math.max(0, +saved.clock || 0); if (WX[saved.wx]){ weather.kind = saved.wx; weather.k = saved.wx === 'clear' ? 0 : 1; weather.left = rand(30, 80); }
  }
  { const kept = !!(saved && saved.p && saved.cal0 != null); calDone = 0; /* history up to today has already happened */
    while (calDone < EVENTS.length && EVENTS[calDone][0] <= calIdx()){ if (!kept && EVENTS[calDone][2]) EVENTS[calDone][2](); calDone++; } }
  const o = ports.find(q => q.name === startName) || ports[0];
  p = makeShip('sloop', 'player', 'player', o.ox, o.oy, o.out); p.crew = 40;
  wind.dir = wind.tDir = o.out + .8; wind.timer = 20;
  if (saved && saved.p){
    gold = saved.gold|0; plunder = saved.plunder|0; if (saved.up) for (const k in up) up[k] = clamp(saved.up[k]|0, 0, UPG[k].max);
    if (saved.standing) NKEYS.forEach(k => { standing[k] = clamp(+saved.standing[k] || 0, -100, 100); });
    if (SHOTK[saved.shot]) shot = saved.shot;
    const sc = DEG/(+saved.deg || 400); // older saves used a smaller map
    let x = +saved.p.x*sc, y = +saved.p.y*sc, h = +saved.p.h || 0;
    if (saved.proj !== 2){ const q = ports.find(q => q.name === saved.where) || o; x = q.ox; y = q.oy; h = q.out; if (saved.mission){ saved.mission.sx = 0; saved.mission.ax = 0; saved.mission.tr = null; } (saved.squad || []).forEach(d => { if (d) d.task = null; }); } /* a log from the smaller chart: she is found again off the port she was nearest */
    if (!(x > 40 && y > 40 && x < W-40 && y < H-40) || isLand(x, y)){ x = o.ox; y = o.oy; h = o.out; }
    p = makeShip(CLASSES[saved.cls] ? saved.cls : 'sloop', 'player', 'player', x, y, h); refit(); p.crew = clamp(saved.crew == null ? 40 : saved.crew|0, 1, p.t.crew); p.name = cleanName(saved.pname, p.name);
    p.hull = clamp(+saved.p.hull || p.maxHull, 1, p.maxHull); p.sails = saved.p.sails == null ? 100 : clamp(+saved.p.sails || 0, 0, 100);
    if (saved.wind){ wind.dir = wind.tDir = +saved.wind.dir || 0; wind.str = wind.tStr = clamp(+saved.wind.str || 1, .7, 1.3); }
  }
  rankIdx = rankFor(plunder);
  for (let i = 0; i < 40; i++) spawnMerchant(true);
  NKEYS.forEach(k => { for (let i = 0; i < 2; i++) spawnPatrol(k, true); }); for (let i = 0; i < 4; i++) spawnFisher();
  if (calIdx() >= 48) spawnFleet(true, saved && saved.fleetLeg != null ? ((saved.fleetLeg|0) + ROUTE.length - 1) % ROUTE.length : null);
  if (saved && Array.isArray(saved.squad)) saved.squad.slice(0, MAXSQ).forEach((d, i) => { if (d && CLASSES[d.cls]){ const sc = DEG/(+saved.deg || 400), away = d.task && d.x > 100 && d.y > 100 && d.x*sc < W - 100 && d.y*sc < H - 100 && !isLand(d.x*sc, d.y*sc), w = away ? [d.x*sc, d.y*sc] : waterNear(p.x, p.y, 160);
    const s = addFleet(d, w[0], w[1], p.h); if (away){ const q = ports.find(q => q.name === d.task.port); s.task = d.task.type === 'port' && q ? { type: 'port', port: q } : d.task.type === 'hold' ? { type: 'hold' } : { type: 'raid', at: [s.x, s.y] }; } } });
  setForm(formation); setOrders(orders);
  if (saved && saved.mission){ const sc = DEG/(+saved.deg || 400); restoreMission(Object.assign({}, saved.mission, { sx: saved.mission.sx*sc, sy: saved.mission.sy*sc })); }
  $('shotBtn').textContent = SHOTN[shot];
}
const cargoRoll = () => Math.round(rand(120, 300) + Math.min(400, plunder*.04));
const BUBBLE = 6500, FAR = 8600; /* the sea is peopled around you: ships are raised within the bubble and forgotten beyond it */
const dP = q => Math.hypot(q.ox - p.x, q.oy - p.y);
function pickDest(from, short){ const c = ports.filter(q => q !== from).sort((a, b) => Math.hypot(a.ox-from.ox, a.oy-from.oy) - Math.hypot(b.ox-from.ox, b.oy-from.oy)).slice(0, 6);
  if (!short && rnd() < .45){ const big = ports.filter(q => q !== from && q.spec.sz >= 2 && Math.hypot(q.ox-from.ox, q.oy-from.oy) < 15000); if (big.length) return big[rnd()*big.length|0]; } /* the long hauls between the great ports */
  return c[rnd()*c.length|0]; }
function spawnMerchant(first){
  let cands = ports.filter(q => { const d = dP(q); return d < BUBBLE && (first || d > 1100); });
  if (!cands.length) cands = ports.slice().sort((a, b) => dP(a) - dP(b)).slice(0, 3);
  let tw = 0; const wt = q => q.spec.land ? 1 : q.spec.sz*q.spec.sz + 1; cands.forEach(q => { tw += wt(q); }); let r = rnd()*tw, a = cands[0]; for (const q of cands){ r -= wt(q); if (r <= 0){ a = q; break; } }
  const coaster = a.spec.land || a.spec.sz < 2 && rnd() < .55, packet = !coaster && a.spec.sz >= 2 && rnd() < .07;
  const s = makeShip(packet ? 'bermuda' : coaster ? ['schooner', 'sloop', 'snow'][rnd()*3|0] : rnd() < .3 ? 'snow' : 'merchant', a.nk, 'merchant', a.ox, a.oy, a.ang);
  s.cargo = cargoRoll(); s.dest = pickDest(a, coaster); s.goods = {}; a.spec.mk.forEach(g => { if (rnd() < .8) s.goods[g] = 15 + (rnd()*45|0); }); if (rnd() < .5){ const g = GK[rnd()*GK.length|0]; s.goods[g] = (s.goods[g] || 0) + 5 + (rnd()*20|0); }
  if (packet){ s.packet = true; s.t.name = NAT[a.nk].adj + ' packet'; s.cargo = 60; s.goods = null; s.guns = 2; }
  else if (coaster){ s.coaster = true; s.t.name = NAT[a.nk].adj + ' coasting ' + s.t.cname; s.cargo = Math.round(s.cargo*.4); s.guns = Math.min(s.guns, 1); for (const g in s.goods) s.goods[g] = Math.ceil(s.goods[g]*.4); }
  else if (a.nk === 'es' && s.cls === 'merchant' && rnd() < .18){ s.rich = true; s.cargo = Math.round(rand(600, 1100)); s.t.name = 'Spanish register ship'; s.t.chests = true; s.t.tag = '#ffe07a'; } /* a lone register ship, licensed to carry silver */
  const path = findPath(a.ox, a.oy, s.dest.ox, s.dest.oy); let w = null; for (let k = 0; k < 5 && !w; k++){ const v = path[rnd()*path.length*.85|0], dv = Math.hypot(v[0]-p.x, v[1]-p.y); if (dv > 1500 && dv < 4800) w = v; }
  if (w){ s.x = w[0]; s.y = w[1]; } else if (dP(a) < 1500 || dP(a) > 5200) return; /* she must come into sight, not appear in it */
  ships.push(s); if (!s.rich && !coaster && !packet && foesOf(a.nk).length && rnd() < .34) convoy(s, a);
}
function spawnFisher(){ const c = ports.filter(q => q.spec.sz < 2 && dP(q) < 4200 && dP(q) > 700); if (!c.length) return; const q = c[rnd()*c.length|0], w = waterNear(q.ox, q.oy, 520);
  if (Math.hypot(w[0]-p.x, w[1]-p.y) < 900) return; const s = makeShip('boat', q.nk, 'fisher', w[0], w[1], rnd()*TAU); s.home = [q.ox, q.oy]; s.t.name = NAT[q.nk].adj + ' fishing boat'; s.goods = { fish: 2 + (rnd()*5|0) }; s.cargo = 0; ships.push(s); }
const curPort_busy = () => state !== 'play' || chartOpen || paused;
function customs(s){ customsT = clock + 170; const n = hold.cloth, fine = Math.min(gold, 20 + n*6), bribe = 30 + n*9;
  ask('A Spanish guarda-costa signals you to heave to', 'Her officer means to search you for contraband. You have ' + n + ' tons of cloth and hardware below, which Spain forbids any foreigner to land in her colonies.', [
    ['c_bribe', 'Bribe the officer', bribe + ' gold, and he finds your papers in perfect order.', gold >= bribe, () => { gold -= bribe; say('The officer pockets your gold and wishes you a fair wind.'); }],
    ['c_run', 'Crowd on sail and run', 'She will open fire, and Spain will remember it.', true, () => { s.provoked = true; repute('es', -6); if (p.sail < 1) p.sail = 1; say('You show her your stern. The guarda-costa runs out her guns.'); }],
    ['c_submit', 'Heave to and be searched', 'The cloth is seized and you are fined ' + fine + ' gold.', true, () => { hold.cloth = 0; gold -= fine; repute('es', -1); say('The guarda-costa takes off ' + n + ' tons of contraband and ' + fine + ' gold in fines.'); }]]); }
/* stop and search: under a letter of marque, a neutral carrying the enemy's goods may lawfully be relieved of them */
function searchable(){ if (!marque || !foesOf(marque).length || melee || !p.alive) return null; let b = null, bd = BOARD_R + 50;
  for (const o of ships){ if (o.role !== 'merchant' || o.sinking != null || o.surrendered || o.released || o.searched || o.transport || !o.nation || o.nation === marque || atWar(marque, o.nation) || hostile(o.nation) || o.hitByPlayer) continue; const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bd){ bd = d; b = o; } } return b; }
function search(n){ n.searched = true; const fs = foesOf(marque), foe = fs[rnd()*fs.length|0], name = nm(n);
  if (rnd() < .38){ const g = GK[2 + (rnd()*(GK.length - 2)|0)], tons = 10 + (rnd()*22|0), take = Math.min(tons, Math.max(0, holdCap() - holdUsed())), coin = 60 + tons*5;
    ask('Enemy cargo aboard the ' + name, 'Her papers show ' + tons + ' tons of ' + GOODS[g][0].toLowerCase() + ' consigned to a ' + NAT[foe].adj + ' house, and ' + coin + ' gold in freight money. By the rule of war it is lawful prize, though ' + NAT[n.nation].land + ' will protest.', [
      ['s_take', 'Seize the enemy cargo', take + ' tons fit in your hold, and the freight money comes with them.', true, () => { hold[g] += take; earn(coin, p.x, p.y); repute(n.nation, -3); repute(marque, 2); svc(1); gaz('The ' + p.name + ' stopped the ' + name + offWhere(n.x, n.y) + ' and took out ' + NAT[foe].adj + ' goods as lawful prize.', 'you'); }],
      ['s_leave', 'Let her pass', 'The goodwill of ' + NAT[n.nation].land + ' is worth more.', true, () => { repute(n.nation, 1); say('You wave the ' + name + ' on her way.'); }]]); }
  else { repute(n.nation, -1); say('Her papers are in order. The ' + name + ' sails on, and her master will complain of the delay.'); } }
function convoy(lead, a){ /* in wartime the trade sails in company, under the guns of the navy */
  lead.conv = true; const n = 2 + (rnd()*2|0), esc = plunder > 2500 && rnd() < .5 ? ['frigate', 'sloop'] : rnd() < .5 ? ['sloop'] : ['brig'];
  for (let i = 0; i < n; i++){ const w = waterNear(lead.x, lead.y, 150), m = makeShip(rnd() < .4 ? 'snow' : 'merchant', a.nk, 'merchant', w[0], w[1], lead.h); m.cargo = cargoRoll(); m.dest = lead.dest; m.lead = lead; m.off = [-125*(i + 1), (i % 2 ? 1 : -1)*75];
    m.goods = {}; a.spec.mk.forEach(g => { if (rnd() < .8) m.goods[g] = 15 + (rnd()*45|0); }); ships.push(m); }
  esc.forEach((c, i) => { const w = waterNear(lead.x, lead.y, 170), e = makeShip(c, a.nk, 'escort', w[0], w[1], lead.h); e.lead = lead; e.off = [70 - i*240, (i % 2 ? -1 : 1)*175]; ships.push(e); }); }
function spawnPatrol(k, anywhere){
  const own = ports.filter(q => q.nk === k && !q.spec.land && dP(q) < BUBBLE && (anywhere || dP(q) > 1200)); if (!own.length) return;
  const a = own[rnd()*own.length|0], r = rnd(), cls = r < .02 ? 'seventyfour' : r < .07 ? 'fifty' : r < .24 ? 'frigate' : r < .65 ? 'sloop' : 'brig';
  const w = waterNear(a.ox, a.oy, anywhere ? 600 : 60);
  if (Math.hypot(w[0]-p.x, w[1]-p.y) < 500) return;
  ships.push(makeShip(cls, k, 'patrol', w[0], w[1], a.ang));
}
function spawnHunter(){ // only a nation you have made an enemy sends ships after you
  const lvl = Math.min(4, Math.floor(plunder/1200)), foes = NKEYS.filter(hostile); if (!foes.length) return;
  const owner = foes[rnd()*foes.length|0], table = [['sloop'],['sloop','brig'],['brig'],['brig','frigate'],['frigate','fifty']][lvl], cls = table[rnd()*table.length|0];
  for (let i = 0; i < 40; i++){
    const a = rnd()*TAU, d = rand(900, 1300), x = clamp(p.x+Math.cos(a)*d, 100, W-100), y = clamp(p.y+Math.sin(a)*d, 100, H-100);
    if (Math.hypot(x-p.x, y-p.y) < 800 || isNear(x, y)) continue;
    ships.push(makeShip(cls, owner, 'hunter', x, y, a + Math.PI));
    for (let k = Math.min(2, squad().length); k > 0; k--){ const w = waterNear(x, y, 170); ships.push(makeShip(table[rnd()*table.length|0], owner, 'hunter', w[0], w[1], a + Math.PI)); } // they come in squadrons against a fleet
    return;
  }
}
let roverT = 220;
function spawnRover(){ // pirates are a rare sight: a rover or two, fat with what they have taken
  const lvl = Math.min(2, Math.floor(plunder/1800)), n = rnd() < .3 ? 2 : 1;
  for (let i = 0; i < 40; i++){
    const a = rnd()*TAU, d = rand(1300, 1900), x = clamp(p.x+Math.cos(a)*d, 100, W-100), y = clamp(p.y+Math.sin(a)*d, 100, H-100);
    if (Math.hypot(x-p.x, y-p.y) < 1200 || isNear(x, y)) continue;
    for (let k = 0; k < n; k++){ const w = k ? waterNear(x, y, 160) : [x, y], s = makeShip(['cutter', 'schooner', 'brig'][Math.max(0, lvl - k)], 'pirate', 'rover', w[0], w[1], a + Math.PI/2);
      s.cargo = Math.round(rand(350, 900) + lvl*250); s.goods = {}; for (let j = 0; j < 2; j++){ const g = GK[rnd()*GK.length|0]; s.goods[g] = (s.goods[g] || 0) + 8 + (rnd()*22|0); } s.ttl = rand(420, 700); ships.push(s); }
    if (state === 'play') say('Lookout: ' + (n > 1 ? 'two sails' : 'a sail') + ' flying no colours. Pirates, and likely heavy with plunder.'); return;
  }
}
/* the Spanish plate fleet: the Portobelo galleons are gone, but from 1754 a flota sails again between Veracruz and Havana under the guns of the navy */
const ROUTE = ['Veracruz', 'Havana'].map(n => ports.find(q => q.name === n));
function spawnFleet(first, at){
  const leg = at != null ? clamp(at|0, 0, ROUTE.length-1) : first ? rnd()*ROUTE.length|0 : 0, a = ROUTE[leg];
  fleet = { leg: (leg+1) % ROUTE.length, wait: 0, alarm: false, respawn: 0, lead: null };
  const mk = (cls, role, off) => { const w = waterNear(a.ox, a.oy, 110), s = makeShip(cls, 'es', role, w[0], w[1], a.ang); s.fleet = true; s.off = off; ships.push(s); return s; };
  fleet.lead = mk('fifty', 'treasure', null); fleet.lead.cargo = Math.round(rand(1800, 2600));
  const g2 = mk('fifty', 'treasure', [-170, 0]); g2.cargo = Math.round(rand(1800, 2600)); g2.speedMul = 1.15;
  (plunder < 2000 ? [['frigate', [70, 160]], ['sloop', [70, -160]]] : [['seventyfour', [70, 170]], ['frigate', [70, -170]], ['sloop', [-300, 0]]]).forEach(e => mk(e[0], 'escort', e[1]));
  if (!first) say('News: the Spanish plate fleet has put to sea from ' + a.name + ', bound for ' + ROUTE[fleet.leg].name + '.');
}
function fleetTick(dt){
  if (!fleet) return;
  const tr = ships.filter(s => s.fleet && s.role === 'treasure' && s.sinking == null && !s.released);
  if (!tr.length){
    if (!fleet.respawn){ fleet.respawn = 240; fleet.lead = null; ships.forEach(s => { if (s.fleet && s.role === 'escort') s.role = 'patrol'; }); }
    fleet.respawn -= dt; if (fleet.respawn <= 0) spawnFleet(false); return; }
  fleet.lead = tr.find(s => !s.surrendered) || tr[0];
  const dest = ROUTE[fleet.leg];
  if (fleet.wait > 0){ fleet.wait -= dt;
    if (fleet.wait <= 0){ fleet.leg = (fleet.leg+1) % ROUTE.length; if (state === 'play') say('News: the Spanish plate fleet has sailed from ' + dest.name + ', bound for ' + ROUTE[fleet.leg].name + '.'); } }
  else if (Math.hypot(dest.ox-fleet.lead.x, dest.oy-fleet.lead.y) < 230) fleet.wait = 30;
}
/* commissions from the governors */
