function newGame(saved){ voyage++; dirty(); wrecks.length = 0; tutI = !saved && recall('tut') !== '0' && location.hash !== '#test' ? 0 : -1; if ($('tutor')) $('tutor').hidden = true; if (paceOut != null){ setPace(paceOut, true); paceOut = null; }
  ships = []; balls = []; pending = []; crates = []; parts = []; floaters = []; smokes.length = 0; orderSel = null; picking = false;
  if (saved && DIFFS[saved.diff]) diff = saved.diff;
  gold = D().purse; plunder = 0; shot = 'round'; up = { guns:0, hull:0, sail:0, drill:0 }; hunterT = 30*D().hunt; curPort = null;
  mission = null; offers = []; tracked = null; fleet = null; standing = { en:10, es:-5, fr:0, nl:0, dk:5 };
  prizePolicy = 'plunder'; roverT = rand(170, 280); formation = 'column'; orders = 'line';
    spares = []; laidUp = []; homeName = startName; tavern = []; course = null; autoHelm = false;
    routeLine = null; fleetTarget = null; paused = false; lastDay = 0;
  hold = emptyHold(); wars = new Set(); polT = rand(200, 320); cal0 = startCal; gsTold = false;
    marque = null; courtDue = 0; hurr = null; hurrYear = -1; newsLog = []; gazette = [];
    courtList = []; dispatches = []; dispNew = 0; shipSeq = 0; dispBadge(); morale = 70; officers = {}; foul = 0; lastCall = 0; rivals = RIVALS.map(() => ({ alive: true, wins: 0 }));
    navy = { k: null, pts: 0, rank: 0 }; captives = { en:0, es:0, fr:0, nl:0, dk:0 };
    stats = { taken:0, sunk:0, lawful:0, unlawful:0 }; customsT = 0; clock = 0; melee = null; prizeShip = null;
  weather = { kind:'clear', k:0, left: rand(90, 180), next:null };
  ports.forEach(q => { q.nk = q.home; q.nation = NAT[q.home]; q.raided = null; q.pr = null; q.ev = null; q.freight = undefined; }); book = {}; ledger = []; store2 = {}; contract = null; ghosts2 = [];
  if (saved && saved.p){
    const REN = { 'Port Royal':'Kingston', 'Tortuga':'Cap-Français', 'Petit-Goâve':'Port-au-Prince' }, fix = d => { if (d && d.cls === 'galleon') d.cls = 'fifty';
      }; fix(saved); (saved.squad || []).forEach(fix); (saved.laidUp || []).forEach(fix);
      ['home', 'course', 'where'].forEach(k => { if (REN[saved[k]]) saved[k] = REN[saved[k]]; });
    if (saved.cal0 != null){ cal0 = clamp(saved.cal0|0, 0, 1200); marque = NAT[saved.marque] ? saved.marque : null; courtDue = clamp(saved.courtDue|0, 0, 1e6);
      if (Array.isArray(saved.gaz)) gazette = saved.gaz.slice(0, 40).filter(v => v && v.t).map(v => ({ d: String(v.d).slice(0, 20), t: String(v.t).slice(0, 300), k: v.k === 'you' ? 'you' : 'news' }));
      if (saved.navy && NAT[saved.navy.k]) navy = { k: saved.navy.k, pts: clamp(saved.navy.pts|0, 0, 999), rank: clamp(saved.navy.rank|0, 0, NAVY.length - 1) };
      if (saved.captives) NKEYS.forEach(k => { captives[k] = clamp(saved.captives[k]|0, 0, 9); }); if (saved.stats) for (const k in stats) stats[k] = clamp(saved.stats[k]|0, 0, 99999);
      if (saved.book && typeof saved.book === 'object') for (const n in saved.book){ if (!ports.some(q => q.name === n)) continue; book[n] = {}; for (const g of GK){ const v = saved.book[n][g]; if (Array.isArray(v)) book[n][g] = [clamp(v[0]|0, 1, 999), v[1]|0]; } }
      if (Array.isArray(saved.ledger)) ledger = saved.ledger.slice(0, 40).filter(v => v && GOODS[v.g]).map(v => ({ m: v.m|0, ship: String(v.ship).slice(0, 30), g: v.g, tons: v.tons|0, port: String(v.port).slice(0, 30), profit: v.profit|0 }));
      if (saved.contract && GOODS[saved.contract.g]){ const cq = ports.find(q => q.name === saved.contract.port); if (cq) contract = { type: 'freight', g: saved.contract.g, tons: clamp(saved.contract.tons|0, 1, 400), port: cq, until: saved.contract.until|0, reward: clamp(saved.contract.reward|0, 0, 9999), nk: NAT[saved.contract.nk] ? saved.contract.nk : 'en', rep: 4 }; }
      if (saved.store2) GK.forEach(g => { store2[g] = clamp(saved.store2[g]|0, 0, 400); });
      if (Array.isArray(saved.press)) saved.press.forEach(v => { const q = ports.find(x => x.name === v[0]); if (!q) return; q.pr = {}; for (const g of GK) if (v[1] && +v[1][g]) q.pr[g] = clamp(+v[1][g], -.4, .4); q.ev = (Array.isArray(v[2]) ? v[2] : []).filter(e => e && GOODS[e.g]).map(e => ({ g: e.g, mul: clamp(+e.mul || 1, .5, 2), until: e.until|0 })); });
      if (Array.isArray(saved.dispatches)) dispatches = saved.dispatches.slice(0, 30).filter(v => v && v.t).map(v => ({ d: String(v.d).slice(0, 20), who: String(v.who).slice(0, 60), t: String(v.t).slice(0, 400), id: 0, ask: null }));
      if (saved.morale != null) morale = clamp(+saved.morale || 0, 0, 100); if (saved.officers) Object.keys(OFFICERS).forEach(k => { officers[k] = !!saved.officers[k]; });
        foul = clamp(+saved.foul || 0, 0, 1); if (saved.fouling != null) fouling = !!saved.fouling;
      if (Array.isArray(saved.rivals)) saved.rivals.slice(0, RIVALS.length).forEach((v, i) => { if (v) rivals[i] = { alive: !!v.alive, wins: clamp(v.wins|0, 0, 6) }; });
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
    if (saved.proj !== 2){ const q = ports.find(q => q.name === saved.where) || o;
      x = q.ox; y = q.oy; h = q.out; if (saved.mission){ saved.mission.sx = 0; saved.mission.ax = 0;
      saved.mission.tr = null; } (saved.squad || []).forEach(d => { if (d) d.task = null; });
      } /* a log from the smaller chart: she is found again off the port she was nearest */
    if (!(x > 40 && y > 40 && x < W-40 && y < H-40) || isLand(x, y)){ x = o.ox; y = o.oy; h = o.out; }
    p = makeShip(CLASSES[saved.cls] ? saved.cls : 'sloop', 'player', 'player', x, y, h);
      refit(); p.crew = clamp(saved.crew == null ? 40 : saved.crew|0, 1, p.t.crew); p.name = cleanName(saved.pname, p.name);
    p.hull = clamp(+saved.p.hull || p.maxHull, 1, p.maxHull); p.sails = saved.p.sails == null ? 100 : clamp(+saved.p.sails || 0, 0, 100);
    if (saved.wind){ wind.dir = wind.tDir = +saved.wind.dir || 0; wind.str = wind.tStr = clamp(+saved.wind.str || 1, .7, 1.3); }
  }
  rankIdx = rankFor(plunder);
  for (let i = 0; i < 40; i++) spawnMerchant(true);
  NKEYS.forEach(k => { for (let i = 0; i < 2; i++) spawnPatrol(k, true); }); for (let i = 0; i < 4; i++) spawnFisher();
  if (calIdx() >= 48) spawnFleet(true, saved && saved.fleetLeg != null ? ((saved.fleetLeg|0) + ROUTE.length - 1) % ROUTE.length : null);
  if (saved && Array.isArray(saved.squad)) saved.squad.slice(0, MAXSQ).forEach((d, i) => { if (d && CLASSES[d.cls]){ const sc = DEG/(+saved.deg || 400), away = d.task && d.x > 100 && d.y > 100 && d.x*sc < W - 100 && d.y*sc < H - 100 && !isLand(d.x*sc, d.y*sc), w = away ? [d.x*sc, d.y*sc] : waterNear(p.x, p.y, 160);
    const s = addFleet(d, w[0], w[1], p.h); if (away){ const q = ports.find(q => q.name === d.task.port);
      s.task = taskFrom(d.task, s); if (d.docked){ const dq = ports.find(x => x.name === d.docked); if (dq){ s.docked = dq; s.x = dq.ox; s.y = dq.oy; s.sail = 0; } } } } });
  setForm(formation); setOrders(orders);
  if (saved && saved.mission){ const sc = DEG/(+saved.deg || 400); restoreMission(Object.assign({}, saved.mission, { sx: saved.mission.sx*sc, sy: saved.mission.sy*sc })); }
  $('shotBtn').textContent = SHOTN[shot];
}
const cargoRoll = () => Math.round(rand(120, 300) + Math.min(400, plunder*.04));
const latOf = q => LAT1 - q.y/DEG, winter = () => calMon() >= 11 || calMon() <= 2;
const iced = q => winter() && latOf(q) > 44.2; /* Louisbourg, Canso, Halifax and Fundy are shut by ice and gales from December to March */
const BUBBLE = 6500, FAR = 8600; /* the sea is peopled around you: ships are raised within the bubble and forgotten beyond it */
const dP = q => Math.hypot(q.ox - p.x, q.oy - p.y);
function pickDest(from, short){ const c = ports.filter(q => q !== from).sort((a, b) => Math.hypot(a.ox-from.ox, a.oy-from.oy) - Math.hypot(b.ox-from.ox, b.oy-from.oy)).slice(0, 6);
  if (!short && rnd() < .45){ const big = ports.filter(q => q !== from && q.spec.sz >= 2 && Math.hypot(q.ox-from.ox, q.oy-from.oy) < 15000);
    if (big.length) return big[rnd()*big.length|0]; } /* the long hauls between the great ports */
  return c[rnd()*c.length|0]; }
function spawnMerchant(first){
  let cands = ports.filter(q => { const d = dP(q); return d < BUBBLE && (first || d > 1100); });
  if (!cands.length) cands = ports.slice().sort((a, b) => dP(a) - dP(b)).slice(0, 3);
  let tw = 0; const wt = q => (q.spec.land ? 1 : q.spec.sz*q.spec.sz + 1)*(winter() && latOf(q) > 40 ? (iced(q) ? .05 : .35) : 1);
    /* the northern trade lies up for the winter */ cands.forEach(q => { tw += wt(q); });
    let r = rnd()*tw, a = cands[0]; for (const q of cands){ r -= wt(q); if (r <= 0){ a = q; break; } }
  const coaster = a.spec.land || a.spec.sz < 2 && rnd() < .55, packet = !coaster && a.spec.sz >= 2 && rnd() < .07;
  const s = makeShip(packet ? 'bermuda' : coaster ? ['schooner', 'sloop', 'snow'][rnd()*3|0] : rnd() < .3 ? 'snow' : 'merchant', a.nk, 'merchant', a.ox, a.oy, a.ang);
  s.cargo = cargoRoll(); s.dest = pickDest(a, coaster); s.goods = {}; a.spec.mk.forEach(g => { if (rnd() < .8) s.goods[g] = 15 + (rnd()*45|0); });
    if (rnd() < .5){ const g = GK[rnd()*GK.length|0]; s.goods[g] = (s.goods[g] || 0) + 5 + (rnd()*20|0); }
  if (packet){ s.packet = true; s.t.name = NAT[a.nk].adj + ' packet'; s.cargo = 60; s.goods = null; s.guns = 2; }
  else if (coaster){ s.coaster = true; s.t.name = NAT[a.nk].adj + ' coasting ' + s.t.cname;
    s.cargo = Math.round(s.cargo*.4); s.guns = Math.min(s.guns, 1); for (const g in s.goods) s.goods[g] = Math.ceil(s.goods[g]*.4); }
  else if (a.nk === 'es' && s.cls === 'merchant' && rnd() < .18){ s.rich = true;
    s.cargo = Math.round(rand(600, 1100)); s.t.name = 'Spanish register ship'; s.t.chests = true;
    s.t.tag = '#ffe07a'; } /* a lone register ship, licensed to carry silver */
  const path = findPath(a.ox, a.oy, s.dest.ox, s.dest.oy); let w = null; for (let k = 0; k < 5 && !w; k++){ const v = path[rnd()*path.length*.85|0], dv = Math.hypot(v[0]-p.x, v[1]-p.y);
    if (dv > 1500 && dv < 4800) w = v; }
  if (w){ s.x = w[0]; s.y = w[1]; } else if (dP(a) < 1500 || dP(a) > 5200) return; /* she must come into sight, not appear in it */
  ships.push(s); if (!s.rich && !coaster && !packet && foesOf(a.nk).length && rnd() < .34) convoy(s, a);
}
function spawnFisher(){ const c = ports.filter(q => q.spec.sz < 2 && dP(q) < 4200 && dP(q) > 700); if (!c.length) return; const q = c[rnd()*c.length|0], w = waterNear(q.ox, q.oy, 520);
  if (Math.hypot(w[0]-p.x, w[1]-p.y) < 900) return; const s = makeShip('boat', q.nk, 'fisher', w[0], w[1], rnd()*TAU);
    s.home = [q.ox, q.oy]; s.t.name = NAT[q.nk].adj + ' fishing boat'; s.goods = { fish: 2 + (rnd()*5|0) };
    s.cargo = 0; ships.push(s); }
function navyStop(s){ customsT = clock + 170; const n = hold.flour + hold.fish, fine = Math.min(gold, 30 + n*5), bribe = 40 + n*7;
  ask('A British cruiser fires a gun to bring you to', 'Her lieutenant has orders to stop the provision trade with the French islands. You have ' + n + ' tons of flour and fish below, and French and neutral ports under your lee.', [
    ['n_bribe', 'A purse for the lieutenant', bribe + ' gold, and your papers say Jamaica.', gold >= bribe, () => { gold -= bribe; say('The boat pulls back to the cruiser. You are bound for Jamaica, if anyone asks.'); }],
    ['n_run', 'Crowd on sail and run', 'She will fire into you, and the Admiralty will hear of it.', true, () => { s.provoked = true; repute('en', -8); if (p.sail < 1) p.sail = 1; say('You run. The cruiser opens fire.'); }],
    ['n_submit', 'Heave to and be searched', 'The provisions are seized and you are fined ' + fine + ' gold.', true, () => { hold.flour = 0; hold.fish = 0; gold -= fine; repute('en', -2); cheer(-4); say('The prize agent takes ' + n + ' tons of provisions and ' + fine + ' gold.'); }]]); }
function shoreAction(port){ const sp = port.spec, k = port.nk, guard = sp.forts.length*18 + sp.sz*10 + (sp.land ? 0 : 14), law = !!marque && atWar(marque, k), night = darkness() > .25, thick = weather.kind === 'fog' || weather.kind === 'rain';
  const men = p.crew + squad().filter(inCompany).reduce((n, o) => n + o.crew*.5, 0), odds = (base, need) => clamp(base + (men - need)/130 + (night ? .12 : 0) + (thick ? .1 : 0) + (morale - 60)/400, .08, .9);
  const fail = what => { const lost = Math.min(p.crew - 5, 6 + (rnd()*9|0)); p.crew -= Math.max(0, lost);
    damage(p, p.maxHull*.2, 12); cheer(-10); repute(k, -6); say(what + ' ' + Math.max(0, lost) + ' of your people do not come back, and the batteries find your range as you haul off.'); };
  const cut = odds(.3, guard), raid = odds(.32, guard*1.6), recent = port.raided != null && calIdx() - port.raided < 6;
  ask('The guns at ' + port.name + ' warn you off', 'The port is closed to you. ' + (night ? 'It is dark, and the anchorage is full of shipping.' : 'In daylight the batteries command the anchorage; a boat attack wants darkness.') + (recent ? ' The place is alert after the last attempt.' : ''), [
    ['sa_cut', 'Cut out a ship from the anchorage', night && !recent ? 'Boats away under muffled oars. About ' + Math.round(cut*100) + ' chances in a hundred.' : recent ? 'They are waiting for you.' : 'Only at night.', night && !recent && p.crew > 14, () => { port.raided = calIdx();
      if (rnd() < cut){ const coin = Math.round(rand(220, 520)*(1 + sp.sz*.4)), g = sp.mk.length ? sp.mk[rnd()*sp.mk.length|0] : 'rum', tons = Math.min(20 + (rnd()*25|0), Math.max(0, holdCap() - holdUsed())), lost = 1 + (rnd()*4|0);
        p.crew = Math.max(5, p.crew - lost); hold[g] += tons; earn(coin, p.x, p.y); if (law){ svc(2);
        repute(marque, 3); repute(k, -5); } else { repute(k, -12); NKEYS.forEach(o => { if (o !== k) repute(o, -3); });
        } stats.taken++; law ? stats.lawful++ : stats.unlawful++;
        gaz('Boats from the ' + p.name + ' cut a laden merchantman out of the anchorage at ' + port.name + ' under the guns of the fort.', 'you');
          say('Your boats bring out a merchantman: ' + coin + ' gold and ' + tons + ' tons of ' + GOODS[g][0].toLowerCase() + ', for ' + lost + ' men.'); }
      else fail('The alarm is raised before your boats are alongside.'); }],
    ['sa_raid', 'Land and raid the place', sp.sz <= 1 && !recent ? 'Take the battery from behind and sack the warehouses. About ' + Math.round(raid*100) + ' chances in a hundred.' : recent ? 'They are waiting for you.' : 'Too strong to storm from boats.', sp.sz <= 1 && !recent && p.crew > 20, () => { port.raided = calIdx();
      if (rnd() < raid){ const coin = Math.round(rand(180, 380)*(sp.land ? 1 : 1.8)), lost = 2 + (rnd()*6|0);
        p.crew = Math.max(5, p.crew - lost); earn(coin, p.x, p.y); if (law){ svc(2); repute(marque, 2);
        repute(k, -8); } else { repute(k, -16); NKEYS.forEach(o => { if (o !== k) repute(o, -5); }); }
        gaz('A landing party from the ' + p.name + ' took the battery at ' + port.name + ' and carried off what the warehouses held.', 'you');
          say('The place is yours for an hour: ' + coin + ' gold, for ' + lost + ' men.'); }
      else fail('The militia are under arms when your boats ground.'); }],
    ['sa_off', 'Stand off', 'There will be other nights.', true, () => {}]]); }
/* rivals: a few named captains who cruise their own waters, grow with their luck, and can be hunted */
const RIVALS = [{ name:'Capitaine Étienne Marchais', ship:'Vengeur', nk:'fr', home:'Cap-Français' }, { name:'Don Rodrigo de Sotomayor', ship:'Santa Bárbara', nk:'es', home:'Havana' }, { name:'Captain Josiah Harland', ship:'Tartar', nk:'en', home:'English Harbour' }, { name:'Ned Corrigan, called the Kingfisher', ship:'Kingfisher', nk:'pirate', home:'Nassau' }];
function rivalTick(){ RIVALS.forEach((R0, i) => { const v = rivals[i]; if (!v || !v.alive) return; if (rnd() < .22 && v.wins < 6){ v.wins++; const near = ports.find(q => q.name === R0.home); news(R0.name + ', in the ' + R0.ship + ', has taken another prize off ' + near.name + '. That makes ' + v.wins + '.'); } }); }
function spawnRival(){ RIVALS.forEach((R0, i) => { const v = rivals[i]; if (!v || !v.alive || ships.some(s => s.rival === i)) return; const q = ports.find(q => q.name === R0.home), d = dP(q); if (d > BUBBLE || d < 1500) return;
  const w = waterNear(q.ox, q.oy, 800); if (Math.hypot(w[0] - p.x, w[1] - p.y) < 1400) return;
    const cls = ['brig', 'frigate', 'frigate', 'fifty'][Math.min(3, Math.floor(v.wins/2))], pir = R0.nk === 'pirate', s = makeShip(cls, R0.nk, pir ? 'rover' : 'patrol', w[0], w[1], rnd()*TAU);
  s.rival = i; s.home = [q.ox, q.oy]; s.ttl = 1e9; s.t.name = R0.ship + ', ' + R0.name;
    s.t.tag = '#ff9a85'; s.reload0 = .8; s.cargo = 300 + v.wins*200; if (!pir && marque && atWar(marque, R0.nk)) s.provoked = true; ships.push(s); }); }
const curPort_busy = () => state !== 'play' || chartOpen || paused;
function customs(s){ customsT = clock + 170; const n = hold.cloth, fine = Math.min(gold, 20 + n*6), bribe = 30 + n*9;
  ask('A Spanish guarda-costa signals you to heave to', 'Her officer means to search you for contraband. You have ' + n + ' tons of cloth and hardware below, which Spain forbids any foreigner to land in her colonies.', [
    ['c_bribe', 'Bribe the officer', bribe + ' gold, and he finds your papers in perfect order.', gold >= bribe, () => { gold -= bribe; say('The officer pockets your gold and wishes you a fair wind.'); }],
    ['c_run', 'Crowd on sail and run', 'She will open fire, and Spain will remember it.', true, () => { s.provoked = true; repute('es', -6); if (p.sail < 1) p.sail = 1; say('You show her your stern. The guarda-costa runs out her guns.'); }],
    ['c_submit', 'Heave to and be searched', 'The cloth is seized and you are fined ' + fine + ' gold.', true, () => { hold.cloth = 0; gold -= fine; repute('es', -1); say('The guarda-costa takes off ' + n + ' tons of contraband and ' + fine + ' gold in fines.'); }]]); }
/* stop and search: under a letter of marque, a neutral carrying the enemy's goods may lawfully be relieved of them */
function searchable(){ if (!marque || !foesOf(marque).length || melee || !p.alive) return null; let b = null, bd = BOARD_R + 50;
  for (const o of ships){ if (o.role !== 'merchant' || o.sinking != null || o.surrendered || o.released || o.searched || o.transport || !o.nation || o.nation === marque || atWar(marque, o.nation) || hostile(o.nation) || o.hitByPlayer) continue;
    const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bd){ bd = d; b = o; } } return b; }
function search(n){ n.searched = true; const fs = foesOf(marque), foe = fs[rnd()*fs.length|0], name = nm(n);
  if (rnd() < .38){ const g = GK[2 + (rnd()*(GK.length - 2)|0)], tons = 10 + (rnd()*22|0), take = Math.min(tons, Math.max(0, holdCap() - holdUsed())), coin = 60 + tons*5;
    ask('Enemy cargo aboard the ' + name, 'Her papers show ' + tons + ' tons of ' + GOODS[g][0].toLowerCase() + ' consigned to a ' + NAT[foe].adj + ' house, and ' + coin + ' gold in freight money. By the rule of war it is lawful prize, though ' + NAT[n.nation].land + ' will protest.', [
      ['s_take', 'Seize the enemy cargo', take + ' tons fit in your hold, and the freight money comes with them.', true, () => { hold[g] += take; earn(coin, p.x, p.y); repute(n.nation, -3); repute(marque, 2); svc(1); gaz('The ' + p.name + ' stopped the ' + name + offWhere(n.x, n.y) + ' and took out ' + NAT[foe].adj + ' goods as lawful prize.', 'you'); }],
      ['s_leave', 'Let her pass', 'The goodwill of ' + NAT[n.nation].land + ' is worth more.', true, () => { repute(n.nation, 1); say('You wave the ' + name + ' on her way.'); }]]); }
  else { repute(n.nation, -1); say('Her papers are in order. The ' + name + ' sails on, and her master will complain of the delay.'); } }
function convoy(lead, a){ /* in wartime the trade sails in company, under the guns of the navy */
  lead.conv = true; const n = 2 + (rnd()*2|0), esc = plunder > 2500 && rnd() < .5 ? ['frigate', 'sloop'] : rnd() < .5 ? ['sloop'] : ['brig'];
  for (let i = 0; i < n; i++){ const w = waterNear(lead.x, lead.y, 150), m = makeShip(rnd() < .4 ? 'snow' : 'merchant', a.nk, 'merchant', w[0], w[1], lead.h);
    m.cargo = cargoRoll(); m.dest = lead.dest; m.lead = lead; m.off = [-125*(i + 1), (i % 2 ? 1 : -1)*75];
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
    for (let k = Math.min(2, squad().length); k > 0; k--){ const w = waterNear(x, y, 170);
      ships.push(makeShip(table[rnd()*table.length|0], owner, 'hunter', w[0], w[1], a + Math.PI));
      } // they come in squadrons against a fleet
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
      s.cargo = Math.round(rand(350, 900) + lvl*250); s.goods = {}; for (let j = 0; j < 2; j++){ const g = GK[rnd()*GK.length|0];
        s.goods[g] = (s.goods[g] || 0) + 8 + (rnd()*22|0); } s.ttl = rand(420, 700); ships.push(s); }
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
