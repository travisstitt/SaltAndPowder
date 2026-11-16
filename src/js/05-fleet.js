const squad = () => { if (sqT !== tick || sqN !== ships.length){ sqT = tick; sqN = ships.length;
  sqC = ships.filter(o => o.role === 'fleet' && o.sinking == null); } return sqC; };
  /* rebuilt once a tick, or when the list of ships changes */
const holdCap = () => p.t.hold + ships.reduce((n, o) => n + (o.role === 'fleet' && o.sinking == null ? o.t.hold : 0), 0);
const stars = c => '★'.repeat(Math.round((c.gun + c.sea)/2)) + '☆'.repeat(5 - Math.round((c.gun + c.sea)/2));
const capLine = c => 'Capt. ' + c.name + ' ' + stars(c) + ' (gunnery ' + c.gun + ', seamanship ' + c.sea + ')';
const capCost = c => 120*(c.gun + c.sea) - 60;
function newCaptain(lo, hi){ const r = () => clamp(lo + (rnd()*(hi - lo + 1)|0), 1, 5);
  return { name: FIRST[rnd()*FIRST.length|0] + ' ' + LAST[rnd()*LAST.length|0], gun: r(), sea: r() }; }
const mate = () => ({ name: 'your first mate', gun: 1, sea: 1, mate: true });
const cleanCap = c => c && c.name ? { name: String(c.name).slice(0, 40), gun: clamp(c.gun|0, 1, 5), sea: clamp(c.sea|0, 1, 5), mate: !!c.mate, xp: +c.xp || 0, sx: +c.sx || 0 } : mate();
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
const cleanUp = u => { u = u || {}; return { guns: clamp(u.guns|0, 0, 6), hull: clamp(u.hull|0, 0, 5), sail: clamp(u.sail|0, 0, 5), drill: clamp(u.drill|0, 0, 5) }; };
function fitConsort(s){ const f = s.hull/s.maxHull; s.guns = s.t.guns + s.up.guns;
  s.maxHull = s.t.hull + 30*s.up.hull; s.hull = s.maxHull*f; s.baseMul = (1 + .04*s.cap.sea)*(1 + .07*s.up.sail); s.speedMul = s.baseMul;
  s.t.name = s.name; }
const capTitle = c => c.mate ? 'Your first mate' : 'Capt. ' + c.name;
function capXp(o){ const c = o.cap; if (!c || c.gun >= 5) return; c.xp = (c.xp || 0) + 1; // a captain learns gunnery by landing shot
  if (c.xp >= 25 + 15*c.gun){ c.xp = 0; c.gun++; fitConsort(o); say(capTitle(c) + ' of the ' + o.name + ' has learned her guns: gunnery ' + c.gun + '.'); } }
function addFleet(d, x, y, h){ // d: { cls, hf, sails, crew, cap, up }
  const s = makeShip(CLASSES[d.cls] ? d.cls : 'sloop', 'player', 'fleet', x, y, h); s.cap = cleanCap(d.cap); s.up = cleanUp(d.up); s.name = cleanName(d.name); fitConsort(s);
  s.hull = s.maxHull*clamp(+d.hf || 1, .05, 1); s.sails = clamp(d.sails == null ? 100 : +d.sails, 0, 100); s.crew = clamp(d.crew|0 || 10, 1, s.t.crew); s.sail = 1;
  s.id = ++shipSeq; s.doc = cleanDoc(d.doc); ships.push(s); dirty(); return s; }
const fleetData = s => ({ x: Math.round(s.x), y: Math.round(s.y), task: taskOut(s), doc: s.doc, docked: s.docked ? s.docked.name : null, cls: s.cls, hf: +(s.hull/s.maxHull).toFixed(3), sails: Math.round(s.sails), crew: s.crew, cap: s.cap, up: s.up, name: s.name });
const threat = o => o.owner !== 'player' && o.sinking == null && !o.released && !o.surrendered && (o === tracked || o === fleetTarget || o.hitByPlayer || o.announced);
function trimHold(){ let over = holdUsed() - holdCap(); for (const g of GK){ if (over <= 0) break; const d = Math.min(hold[g], over); hold[g] -= d; over -= d; } }
function setForm(k){ formation = FORMS[k] ? k : 'column'; $('formBtn').textContent = FORMS[formation]; }
function setOrders(k){ orders = ORDERS[k] ? k : 'line'; $('orderBtn').textContent = ORDERS[orders]; }
let dispatches = [], dispNew = 0, shipSeq = 0;
function dispatch(s, text, askFor){ dispatches.unshift({ d: dateStr(), who: s ? (s.cap.mate ? 'The mate of the ' : 'Capt. ' + s.cap.name + ', ') + s.name : 'Fleet', t: text, id: s ? s.id : 0, ask: askFor || null }); if (dispatches.length > 40) dispatches.length = 40; dispNew++; dispBadge();
  if (state === 'play' || state === 'port') say('Dispatch from the ' + (s ? s.name : 'fleet') + ': ' + text); }
function dispBadge(){ const b = $('dispBtn'); if (b) b.textContent = 'Dispatches' + (dispNew ? ' · ' + dispNew : ''); }
const DOC0 = { wx:'port', dmg:.33, foe:'equal', allow:150, after:'station', cap:250 };
const DOCS = { wx:[['port', 'Run for port'], ['ride', 'Ride it out']], dmg:[[.5, 'Retire at half hull'], [.33, 'Retire at a third'], [0, 'Never retire']], foe:[['avoid', 'Avoid anything stronger'], ['equal', 'Fight her equals'], ['any', 'Fight anything']], allow:[[0, 'Ask every time'], [150, 'Up to 150 gold'], [400, 'Up to 400 gold'], [1e6, 'Whatever it costs']], after:[['station', 'Return to her station'], ['join', 'Rejoin the flagship'], ['stay', 'Wait in port']], cap:[[100, '100 gold'], [250, '250 gold'], [500, '500 gold'], [1000, '1000 gold']] };
const docWord = (k, v) => (DOCS[k].find(o => o[0] === v) || DOCS[k][0])[1];
const cleanDoc = d => { const o = Object.assign({}, DOC0); if (d) for (const k in DOCS) if (DOCS[k].some(v => v[0] === d[k])) o[k] = d[k]; return o; };
const admits = q => (!hostile(q.nk) || q.spec.free || q.spec.land) && !iced(q);
const openPortNear = (s, r) => { let b = null, bd = r; for (const q of ports){ if (!admits(q)) continue; const d = Math.hypot(q.ox - s.x, q.oy - s.y); if (d < bd){ bd = d; b = q; } } return b; };
const repairCost = s => Math.round(Math.max(0, s.maxHull - s.hull) + Math.max(0, 100 - s.sails));
function afterRepairs(s, how){ how = how || s.doc.after; if (how === 'stay') return; setTask(s, how === 'join' || !s.prev ? { type: 'fleet' } : s.prev); s.prev = null; }
function payRepairs(s, how){ const c = Math.min(gold, repairCost(s)); gold -= c; mend(s, c); afterRepairs(s, how); return c; }
function dock(s, port){ /* a consort goes in: safe from weather and the enemy until she sails again */
  s.docked = port; s.x = port.ox; s.y = port.oy; s.speed = 0; s.sail = 0; s.sailCap = null; s.evade = null; const t = s.task, cost = repairCost(s), why = t && t.why;
  if (t && t.type === 'trade'){ tradeCall(s, port); if (cost > 8 && cost <= s.doc.allow && gold >= cost){ gold -= cost; mend(s, cost); } return; }
  if (cost > 8){ if (cost <= s.doc.allow && gold >= cost){ gold -= cost; mend(s, cost); dispatch(s, 'In at ' + port.name + (why === 'weather' ? ' out of the weather' : '') + '. Repairs made good for ' + cost + ' gold, within my allowance. ' + docWord('after', s.doc.after) + '.'); if (why !== 'weather') afterRepairs(s); }
    else dispatch(s, 'In at ' + port.name + ' with hull at ' + Math.round(s.hull/s.maxHull*100) + ' per cent and sails at ' + Math.round(s.sails) + '. The yard asks ' + cost + ' gold to make her good. I await your orders.', 'repair'); }
  else if (why) dispatch(s, 'Safe in at ' + port.name + (why === 'weather' ? ', out of the weather. I shall sail again when it clears.' : '.'));
  else say('The ' + s.name + ' is in at ' + port.name + ' and lies safe at anchor there.'); }
function runFor(s, q, why){ if (s.task && s.task.type !== 'port' && s.task.type !== 'fleet') s.prev = s.task; else if (!s.task || s.task.type === 'fleet') s.prev = null; setTask(s, { type: 'port', port: q, flee: true, why });
  dispatch(s, why === 'weather' ? 'Glass falling. I am running for ' + q.name + '.' : 'Hull at ' + Math.round(s.hull/s.maxHull*100) + ' per cent, sails at ' + Math.round(s.sails) + '. I am breaking off for ' + q.name + '.'); }
const CAPS = [100, 250, 500, 1000];
const etaTo = (s, a, b) => Math.hypot(b.ox - a.ox, b.oy - a.oy)/(s.t.speed*.6);
function tradePlan(s, from, t){ /* the best cargo and port from here: what it costs now against what it should fetch when she lands it, with a margin for luck */
  let best = null; const ports2 = t.set.filter(q => q !== from && admits(q));
  for (const q of ports2){ const when = clock + etaTo(s, from, q); for (const g of GK){ if (from.spec.land && from.spec.mk.indexOf(g) < 0) continue; if (q.spec.land && q.spec.dm.indexOf(g) < 0 && q.spec.mk.indexOf(g) < 0) continue;
    const buy = price(from, g), sell = Math.min(price(q, g, when), price(q, g))*.9, m = sell - buy; if (m < buy*.12) continue; const tons = Math.min(s.t.hold, Math.floor(t.funds/buy)); if (tons < 1) continue; const gain = m*tons/(60 + etaTo(s, from, q));
    if (!best || gain > best.gain) best = { g, q, tons, buy, gain }; } } return best; }
function tradeCall(s, port){ const t = s.task; t.need = false; /* sell if it pays, or carry it on; then buy the best cargo going, or go where one is */
  if (t.cargo){ const c = t.cargo, here = Math.round(price(port, c.g)*.9*c.tons); let alt = null;
    if (here < c.cost && (t.div || 0) < 2) for (const q of t.set){ if (q === port || !admits(q)) continue; const r = Math.min(price(q, c.g, clock + etaTo(s, port, q)), price(q, c.g))*.9*c.tons; if (r > c.cost*1.04 && (!alt || r > alt.r)) alt = { q, r }; }
    if (alt){ t.div = (t.div || 0) + 1; t.dest = alt.q; s.dwell = 5; dispatch(s, GOODS[c.g][0] + ' is cheap at ' + port.name + ' today. I am carrying my cargo on to ' + alt.q.name + ' sooner than sell at a loss.'); return; }
    const profit = here - c.cost; t.funds += here; t.cargo = null; t.div = 0; t.runs = (t.runs || 0) + 1; t.made = (t.made || 0) + profit; let tail = '';
    if (t.funds > t.cap){ const over = t.funds - t.cap, share = Math.round(over*.1); t.funds = t.cap; gold += over - share; plunder += over - share; tail = ' I remit ' + (over - share) + ' gold to you, and ' + share + ' goes to my people.'; }
    dispatch(s, 'Sold ' + c.tons + ' tons of ' + GOODS[c.g][0].toLowerCase() + ' at ' + port.name + ': ' + (profit >= 0 ? profit + ' gold clear.' : 'a loss of ' + -profit + ' gold, the market having turned.') + tail); }
  if (t.funds < Math.max(40, t.cap*.25)){ t.need = true; s.dwell = 1e9; dispatch(s, 'My trading money is down to ' + Math.round(t.funds) + ' gold, too little to load a cargo worth carrying. I ask ' + (t.cap - Math.round(t.funds)) + ' gold to make it up to ' + t.cap + ', and lie at ' + port.name + ' until I hear.', 'funds'); return; }
  const plan = tradePlan(s, port, t);
  if (plan){ t.cargo = { g: plan.g, tons: plan.tons, cost: plan.tons*plan.buy }; t.funds -= t.cargo.cost; t.dest = plan.q; t.idle = 0; s.dwell = 14; return; }
  /* nothing worth loading here: try the port in her waters with the best prospect, in ballast */
  let go = null; for (const q of t.set){ if (q === port || !admits(q)) continue; const pl = tradePlan(s, q, t); if (pl && (!go || pl.gain > go.gain)) go = { q, gain: pl.gain }; }
  t.idle = (t.idle || 0) + 1; if (go){ t.dest = go.q; s.dwell = 8; } else { s.dwell = 40; if (t.idle === 3) dispatch(s, 'There is no cargo in these waters that would pay its freight. I am lying at ' + port.name + ' until prices move.'); } }
function startTrade(s, set, area){ set = set.filter((q, i) => q && set.indexOf(q) === i); if (set.length < 2){ say('A trader needs at least two open ports to work between.'); return false; }
  const cap = s.doc.cap || 250, put = Math.min(gold, cap); if (put < 40){ say('You have not the gold to give her a trading stock.'); return false; } gold -= put;
  let near = set[0]; for (const q of set) if (Math.hypot(q.ox - s.x, q.oy - s.y) < Math.hypot(near.ox - s.x, near.oy - s.y)) near = q;
  setTask(s, { type: 'trade', set, dest: near, cargo: null, funds: put, cap, area: area || null, runs: 0, made: 0 }); say('The ' + s.name + ' takes ' + put + ' gold as her trading stock and makes for ' + near.name + '.'); return true; }
/* choosing on the chart: a port, two ports, or a stretch of water */
let chartPick = null, chartPtr = [0, 0];
function pickOnChart(s, kind){ closeMenu(); setChart(true, s); chartV.z = kind === 'area' ? 1.8 : 2.4; chartPick = { s, kind, step: 0, a: null }; }
function pickHint(){ const k = chartPick.kind, n = chartPick.s.name; return k === 'port' ? 'Click the port the ' + n + ' is to make for.' : k === 'cruise' ? 'Click the port the ' + n + ' is to cruise off.' : k === 'blockade' ? 'Click the port the ' + n + ' is to blockade.' : k === 'patrol' ? 'Click the port the ' + n + ' is to patrol to.'
  : k === 'two' ? (chartPick.step ? 'Now click the second port, to trade with ' + chartPick.a.name + '.' : 'Click the first of the two ports the ' + n + ' is to trade between.') : chartPick.step ? 'Now click again to set how wide her trading waters are.' : 'Click the middle of the waters the ' + n + ' is to trade in.'; }
function pickClick(hit, wx, wy){ const c = chartPick, s = c.s; let done = false;
  if (c.kind === 'area'){ if (!c.step){ c.a = [wx, wy]; c.step = 1; return; } const r = clamp(Math.hypot(wx - c.a[0], wy - c.a[1]), 500, 8000), set = ports.filter(q => admits(q) && Math.hypot(q.ox - c.a[0], q.oy - c.a[1]) < r);
    if (set.length < 2){ say('Fewer than two open ports lie in those waters. Click farther out for a wider stretch.'); return; } done = startTrade(s, set, { x: Math.round(c.a[0]), y: Math.round(c.a[1]), r: Math.round(r) }); }
  else if (!hit){ say('Click on a port.'); return; }
  else if (c.kind === 'two'){ if (!c.step){ c.a = hit; c.step = 1; return; } if (hit === c.a){ say('Choose a different port for the other end.'); return; } if (!admits(hit) || !admits(c.a)){ say('Both ports must be open to you.'); return; } done = startTrade(s, [c.a, hit], null); }
  else if (c.kind === 'port'){ setTask(s, { type: 'port', port: hit }); say('The ' + s.name + ' is ordered to ' + hit.name + '.'); done = true; }
  else { assign(s, c.kind, hit); done = true; }
  if (done){ chartPick = null; setChart(false); openFleet('S' + Math.max(0, squad().indexOf(s))); } }
function think(s){ /* once a second each captain looks at the sky, at his ship and at the enemy, and acts on his standing orders */
  const D2 = s.doc, sea = s.cap.sea, frac = s.hull/s.maxHull, flee = s.task && s.task.type === 'port' && s.task.flee;
  const blow = hurr ? hurr.stage === 1 || sea >= 3 : weather.kind === 'storm' && weather.k > (sea >= 3 ? .25 : .65);
  s.sailCap = blow ? (hurr && hurr.stage === 1 && !flee ? 0 : .5) : null;
  if (state !== 'play' && inCompany(s)) return;
  if (hurr && blow && D2.wx === 'port' && !flee){ const q = openPortNear(s, 1300 + sea*500); if (q){ runFor(s, q, 'weather'); return; } }
  if (D2.dmg > 0 && (frac < D2.dmg || s.sails < 22) && !flee){ const q = openPortNear(s, 1e9); if (q){ runFor(s, q, 'damage'); return; } }
  s.evade = null; if (D2.foe !== 'any' && s.task && s.task.type !== 'fleet' && Math.hypot(p.x - s.x, p.y - s.y) > 1000){ const mine = s.hull*(s.guns + 1)*(D2.foe === 'equal' ? 1.6 : 1); let bd = 800;
    for (const o of ships){ if (o.owner === 'player' || o.sinking != null || o.surrendered || o.released || !warship(o) || !(o.owner === 'pirate' || hostile(o.nation) || o.provoked)) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < bd && o.hull*(o.guns + 1) > mine){ bd = d; s.evade = o; } } } }
function taskOut(s){ const t = s.task; if (!t || t.type === 'fleet') return null; return { type: t.type === 'chase' ? 'raid' : t.type, port: t.port ? t.port.name : null, label: t.label, until: t.until, idx: t.idx, ends: t.ends ? t.ends.map(q => q.name) : null, set: t.set ? t.set.map(q => q.name) : null, dest: t.dest ? t.dest.name : null, funds: t.funds, cap: t.cap, area: t.area || null, runs: t.runs, made: t.made, at: t.at ? [Math.round(t.at[0]), Math.round(t.at[1])] : null, cargo: t.cargo || null }; }
function taskFrom(d, s){ const P = n => ports.find(q => q.name === n), ends = Array.isArray(d.ends) ? d.ends.map(P) : null, okEnds = ends && ends.length === 2 && ends[0] && ends[1];
  if (d.type === 'port' && P(d.port)) return { type: 'port', port: P(d.port) }; if (d.type === 'hold') return { type: 'hold' };
  if (d.type === 'trade'){ const set = (Array.isArray(d.set) ? d.set.map(P) : ends || []).filter(Boolean); if (set.length >= 2) return { type: 'trade', set, dest: P(d.dest) || set[0], funds: clamp(+d.funds || 0, 0, 1e5), cap: CAPS.indexOf(d.cap) >= 0 ? d.cap : 250, area: d.area && d.area.r ? { x: +d.area.x, y: +d.area.y, r: +d.area.r } : null, runs: d.runs|0, made: d.made|0, cargo: d.cargo && GOODS[d.cargo.g] ? { g: d.cargo.g, tons: clamp(d.cargo.tons|0, 0, 400), cost: Math.max(0, d.cargo.cost|0) } : null }; }
  const at = Array.isArray(d.at) && d.at[0] > 50 && d.at[1] > 50 && d.at[0] < W - 50 && d.at[1] < H - 50 ? [+d.at[0], +d.at[1]] : [s.x, s.y];
  return { type: 'raid', at, prey: null, label: ['cruise', 'patrol', 'blockade'].indexOf(d.label) >= 0 ? d.label : undefined, until: d.until ? d.until|0 : undefined, ends: okEnds ? ends : undefined, idx: d.idx ? 1 : 0, port: d.label === 'blockade' ? P(d.port) : undefined }; }
function assign(s, kind, q){ const here = openPortNear(s, 1e9) || q, home = ports.find(x => x.name === homeName) || q;
  if (kind === 'cruise') setTask(s, { type: 'raid', label: 'cruise', at: [q.ox, q.oy], prey: null, until: calIdx() + 3 });
  else if (kind === 'blockade') setTask(s, { type: 'raid', label: 'blockade', at: [q.ox, q.oy], prey: null, port: q });
  else if (kind === 'patrol') setTask(s, { type: 'raid', label: 'patrol', at: [q.ox, q.oy], prey: null, ends: [here, q], idx: 1 });
  else if (kind === 'trade') startTrade(s, [q, home], null); }
function fleetSignal(kind){ const sq = squad(); if (kind === 'recall'){ sq.forEach(s => setTask(s, { type: 'fleet' })); say('Signal to all ships: rejoin the flag.'); }
  else if (kind === 'port'){ sq.forEach(s => { const q = openPortNear(s, 1e9); if (q && !s.docked) setTask(s, { type: 'port', port: q }); }); say('Signal to all ships: make for the nearest open port.'); }
  else { const q = ports.find(x => x.name === homeName); sq.forEach(s => setTask(s, { type: 'port', port: q })); say('Signal to all ships: rendezvous at ' + homeName + '.'); } }
const inCompany = s => !s.docked && Math.hypot(s.x - p.x, s.y - p.y) < 900;
const taskWord = s => { const t = s.task; return s.docked ? (t && t.type === 'trade' ? (t.need ? 'Waiting for funds at ' : 'Loading at ') : 'In port at ') + s.docked.name : !t || t.type === 'fleet' ? 'With the fleet' : t.type === 'trade' ? 'Trading: bound for ' + t.dest.name + (t.cargo ? ' with ' + GOODS[t.cargo.g][0].toLowerCase() : ' in ballast') : t.type === 'raid' ? (t.prey ? 'Chasing a prize' : t.label === 'cruise' ? 'Cruising for prizes' : t.label === 'blockade' ? 'Blockading ' + t.port.name : t.label === 'patrol' ? 'On patrol to ' + t.ends[t.idx].name : 'Hunting prizes') : t.type === 'chase' ? 'Engaging the ' + (t.prey ? nm(t.prey) : 'enemy') : t.type === 'hold' ? 'Holding station'
  : t.flee && !t.arrived ? 'Running for ' + t.port.name
  : t.arrived ? 'Waiting at ' + t.port.name : 'Bound for ' + t.port.name; };
function setTask(s, t){ if (s.task && s.task.type === 'trade' && (!t || t.type !== 'trade')){ const o = s.task, back = Math.round(o.funds + (o.cargo ? o.cargo.cost*.8 : 0)); if (back > 0){ gold += back; say('The ' + s.name + ' hands back her trading stock: ' + back + ' gold.'); } } /* her trading money comes home with her */
  if (s.docked){ s.h = s.docked.out; s.docked = null; s.sail = 1; } s.task = t; s.path = null; s.foe = null; s.boardT = 0; s.speedMul = s.baseMul; }
const fairGame = o => o.owner !== 'player' && o.sinking == null && !o.released && !o.gone && (o === fleetTarget || o.owner === 'pirate' || prize(o) && (hostile(o.nation) || o.hitByPlayer));
  // what a consort may take on her own
const POLICY = { plunder:'Plunder and release', keep:'Take into the fleet', send:'Send in as prizes', leave:'Leave to the flagship' };
let prizePolicy = 'plunder';
function setPolicy(k){ prizePolicy = POLICY[k] ? k : 'plunder'; }
function cyclePolicy(){ const k = Object.keys(POLICY); setPolicy(k[(k.indexOf(prizePolicy) + 1) % k.length]); say('Standing order for prizes: ' + POLICY[prizePolicy].toLowerCase() + '.'); }
function claimPrize(s, o){ // a consort boards a struck ship and deals with her as the standing order says
  const c = prizeLoot(o), share = Math.round(c*.1), hf = clamp(o.hull/o.maxHull, .1, 1), name = nm(o); let tons = 0, tail = ''; o.cargo = 0; earn(c, s.x, s.y); gold -= share;
  const how = prizePolicy === 'keep' && squad().length >= MAXSQ ? 'send' : prizePolicy === 'leave' ? 'plunder' : prizePolicy;
  if (how === 'keep'){ const cap = spares.length ? spares.sort((a, b) => b.gun + b.sea - a.gun - a.sea).shift() : mate();
    addFleet({ cls: o.cls, hf, sails: Math.max(30, o.sails), crew: Math.max(o.crew, Math.ceil(o.t.crew*.25)), cap }, o.x, o.y, o.h);
    o.gone = true; tail = ' She joins your fleet under ' + (cap.mate ? 'your first mate' : 'Capt. ' + cap.name) + '.'; }
  manifestOf(o).forEach(v => { hold[v.g] += v.take; tons += v.take; }); o.goods = null;
  if (how === 'send'){ tail = ' She is sent in. ' + sendIn(o, hf); o.gone = true; }
  else if (how === 'plunder'){ o.surrendered = false; o.released = true; o.sail = 1; o.sails = Math.max(o.sails, 40); }
  onPrize(o, true); if (tracked === o) tracked = null; chime();
  say('The ' + s.name + ' has taken the ' + name + ': ' + (c - share) + ' gold to you' + (tons ? ' and ' + tons + ' tons of goods' : '') + ', ' + share + ' in shares to her company.' + tail); }
function chore(s, dt){ // a consort in the line slips away for a struck ship or flotsam close by, then returns
  s.jobT = (s.jobT || 0) - dt;
  if (s.jobT <= 0){ s.jobT = 1; s.job = null; let bd = 1e9;
    if (prizePolicy !== 'leave') for (const o of ships){ if (!o.surrendered || o.released || o.sinking != null || o.owner === 'player' || o.board > 0 || o.claim && o.claim !== s && o.claimT > clock || Math.hypot(o.x - p.x, o.y - p.y) > 800) continue;
      const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < bd){ bd = d; s.job = o; } }
    if (!s.job) for (const c of crates){ if (c.claim && c.claim !== s && c.claimT > clock || Math.hypot(c.x - p.x, c.y - p.y) > 650) continue;
      const d = Math.hypot(c.x - s.x, c.y - s.y); if (d < bd){ bd = d; s.job = c; } }
    if (s.job){ s.job.claim = s; s.job.claimT = clock + 3; } }
  const j = s.job; if (!j) return null;
  if (j.amt != null ? crates.indexOf(j) < 0 : !j.surrendered || j.released || j.sinking != null || j.gone){ s.job = null; s.boardT = 0; return null; }
  const d = Math.hypot(j.x - s.x, j.y - s.y); s.speedMul = s.baseMul;
  if (j.amt == null && d < BOARD_R){ s.sail = 0; s.boardT = (s.boardT || 0) + dt; if (s.boardT >= 2){ s.boardT = 0; s.job = null; claimPrize(s, j); } return s.h; }
  s.sail = d > 160 ? 1 : .5; return navTo(s, j.x, j.y, dt);
}
let orderSel = null, picking = false, strikeArm = false;
function sighted(from){ return ships.filter(o => o.owner !== 'player' && o.sinking == null && !o.released && !o.surrendered && (threat(o) || o.owner === 'pirate' || hostile(o.nation)) && Math.hypot(o.x - from.x, o.y - from.y) < 1600)
  .sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y)).slice(0, 4); }
function openOrders(o){ if (state !== 'play') return; orderSel = o; picking = false; strikeArm = false; renderOrders(); }
function closeOrders(){ orderSel = null; picking = false; strikeArm = false; $('orders').hidden = true; }
function renderOrders(){
  const o = orderSel, el = $('orders'); if (!o || o !== p && (o.sinking != null || ships.indexOf(o) < 0)){ closeOrders(); return; }
  el.hidden = false; const flag = o === p, sq = squad(), tt = o.task && o.task.type || 'fleet', mark = fleetTarget || tracked;
  $('ordName').textContent = o.name; $('ordSub').textContent = flag ? 'Flagship · signals to the whole fleet' : cap1(o.t.cname) + ' · ' + capTitle(o.cap) + ' ' + stars(o.cap);
  const box = $('ordBtns'); box.textContent = '';
  const B = (id, label, on, fn, cls) => { const b = document.createElement('button');
    b.type = 'button'; b.id = id; b.textContent = label; b.disabled = !on; if (cls) b.className = cls;
    b.addEventListener('click', () => { const keep = id === 'o_strike'; fn(); if (!keep) strikeArm = false; renderOrders(); }); box.appendChild(b); };
  if (flag){
    B('o_all', 'All engage my mark', !!mark && sq.length > 0, () => { fleetTarget = mark; setOrders('engage'); sq.forEach(s => setTask(s, { type: 'fleet' })); say('Signal: all ships engage the ' + nm(mark) + '.'); });
    B('o_rejoin', 'All rejoin the line', sq.some(s => s.task && s.task.type !== 'fleet'), () => { sq.forEach(s => setTask(s, { type: 'fleet' })); say('Signal: all ships rejoin the line.'); });
    B('o_form', 'Formation: ' + FORMS[formation], sq.length > 0, cycleForm); B('o_ord', 'Orders: ' + ORDERS[orders], sq.length > 0, cycleOrders);
    B('o_flee', 'Run for the nearest port', true, () => { const q = ports.filter(q => !hostile(q.nk)).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0]; if (q) setCourse(q); });
    B('o_policy', 'Prizes: ' + POLICY[prizePolicy], true, cyclePolicy);
    B('o_manage', 'Manage the fleet', true, () => openFleet('F'));
  } else {
    B('o_pick', picking ? 'Now click her target…' : 'Engage a ship…', true, () => { picking = !picking; }, picking ? 'primary' : '');
    B('o_mark', mark ? 'Engage my mark' : 'Engage my mark', !!mark, () => setTask(o, { type: 'chase', prey: mark, at: [o.x, o.y] }));
    B('o_raid', 'Hunt prizes', tt !== 'raid', () => setTask(o, { type: 'raid', at: [o.x, o.y], prey: null }));
    B('o_fleet', 'Rejoin the line', tt !== 'fleet', () => setTask(o, { type: 'fleet' }));
    B('o_hold', 'Hold here', tt !== 'hold', () => setTask(o, { type: 'hold' }));
    B('o_flee', 'Flee to safety', true, () => { const q = ports.filter(q => !hostile(q.nk)).sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y))[0]; if (q){ setTask(o, { type: 'port', port: q, flee: true }); say('The ' + o.name + ' breaks off and runs for ' + q.name + '.'); } });
    B('o_shot', 'Her shot: ' + (o.shot === 'chain' ? 'chain' : 'round'), true, () => { o.shot = o.shot === 'chain' ? 'round' : 'chain'; });
    B('o_strike', strikeArm ? 'Confirm: give her up' : 'Strike her colours', true, () => { if (!strikeArm){ strikeArm = true; return; }
      const back = !o.cap.mate && spares.length < 6; if (back) spares.push(o.cap);
        ships.splice(ships.indexOf(o), 1); trimHold(); newsLog.unshift('Struck her colours: the ' + o.name + '.');
        newsLog.length = Math.min(newsLog.length, 4);
      say('The ' + o.name + ' strikes her colours and is lost to you.' + (back ? ' Capt. ' + o.cap.name + ' is put ashore and will rejoin you as a spare.' : ''));
        closeOrders(); }, strikeArm ? 'danger' : '');
    B('o_manage', 'Manage her', true, () => openFleet('S' + squad().indexOf(o)));
  }
  if (!orderSel) return;
  const foes = $('ordFoes'); foes.textContent = ''; const seen = sighted(o);
  if (seen.length){ const h = document.createElement('div'); h.className = 'ordlbl';
    h.textContent = flag ? 'Enemies in sight: mark one for the fleet' : 'Enemies in sight: send her against one'; foes.appendChild(h); }
  seen.forEach((e, i) => { const b = document.createElement('button'); b.type = 'button'; b.id = 'o_foe' + i; b.textContent = e.t.name + ' · ' + Math.max(1, Math.round(Math.hypot(e.x - o.x, e.y - o.y)/DEG*20)) + ' lg';
    b.addEventListener('click', () => { if (flag){ fleetTarget = e; engage(e); say('Signal to the fleet: engage the ' + nm(e) + '.'); } else { setTask(o, { type: 'chase', prey: e, at: [o.x, o.y] }); say('The ' + o.name + ' will engage the ' + nm(e) + '.'); } picking = false; renderOrders(); }); foes.appendChild(b); });
  $('ordNote').textContent = picking ? 'Click the enemy ship she is to engage. Esc cancels.' : flag ? (sq.length ? sq.length + ' consort' + (sq.length > 1 ? 's' : '') + ' under your flag. Click one of your ships to give her orders of her own.' : 'You sail alone.') : taskWord(o) + '. Hull ' + Math.round(o.hull/o.maxHull*100) + '%, crew ' + o.crew + '.';
}
function detached(s, dt){ // a consort acting on her own orders
  const t = s.task; let want = s.h; s.speedMul = s.baseMul;
  if (s.evade && s.evade.sinking == null){ s.sail = 1; return Math.atan2(s.y - s.evade.y, s.x - s.evade.x); } /* too strong for her: she shows her heels */
  if (t.type === 'hold'){ s.sail = 0; }
  else if (t.type === 'trade'){ const q = t.dest, d = Math.hypot(q.ox - s.x, q.oy - s.y); if (d < 190){ if (admits(q)) dock(s, q); else { s.sail = 0; if (!t.told){ t.told = true; dispatch(s, q.name + ' is closed to us. I am standing off and on until you send new orders.'); } } } else { s.sail = 1; want = navTo(s, q.ox, q.oy, dt); } }
  else if (t.type === 'port'){ const d = Math.hypot(t.port.ox - s.x, t.port.oy - s.y);
    if (d < 180 && admits(t.port)){ dock(s, t.port); return s.h; }
    if (d < 180){ s.sail = 0; if (!t.arrived){ t.arrived = true; say('The ' + s.name + ' has reached ' + t.port.name + ', which is closed to her, and waits outside for you.');
      } if (inCompany(s) && Math.hypot(p.x - s.x, p.y - s.y) < 420){ setTask(s, { type: 'fleet' });
      say('The ' + s.name + ' rejoins the fleet.'); } }
    else { s.sail = 1; want = navTo(s, t.port.ox, t.port.oy, dt); } }
  else { // raid or chase
    if (t.type === 'chase' && (!t.prey || t.prey.sinking != null || t.prey.released || t.prey.gone || ships.indexOf(t.prey) < 0)){ say('The ' + s.name + ' has lost her chase and returns to the fleet.');
      setTask(s, { type: 'fleet' }); return want; }
    if (t.type === 'raid' && t.until && calIdx() > t.until){ dispatch(s, 'My cruise is out. I am returning to the flag.'); setTask(s, { type: 'fleet' }); return want; }
    if (t.type === 'raid' && t.ends && !t.prey && Math.hypot(t.at[0] - s.x, t.at[1] - s.y) < 650){ t.idx ^= 1; t.at = [t.ends[t.idx].ox, t.ends[t.idx].oy]; s.loiter = null; }
    if (t.type === 'raid'){ s.scanT -= dt; if (s.scanT <= 0 || t.prey && (t.prey.sinking != null || t.prey.released || t.prey.gone)){ s.scanT = 1.5; t.prey = null; let bd = 2400;
      for (const o of ships){ if (!fairGame(o)) continue; const od = Math.hypot(o.x - s.x, o.y - s.y); if (od < bd){ bd = od; t.prey = o; } } } }
    const o = state === 'play' ? t.prey : null; // while you lie in port your ships neither give nor take fire
    if (!o){ s.sail = .5; want = loiterTo(s, dt, () => waterNear(t.at[0], t.at[1], 700)); }
    else if (o.surrendered){ const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < BOARD_R){ s.sail = 0;
      s.boardT = (s.boardT || 0) + dt; if (s.boardT >= 2){ s.boardT = 0; claimPrize(s, o);
      t.prey = null; if (t.type === 'chase'){ setTask(s, { type: 'fleet' }); } } }
      else { s.sail = d > 200 ? 1 : .5; want = navTo(s, o.x, o.y, dt); } }
    else { s.speedMul = s.baseMul*(prize(o) && Math.hypot(o.x - s.x, o.y - s.y) > 200 ? 1.2 : 1); want = attack(s, o.x, o.y, dt, false, o); }
  }
  return want;
}
function fleetAI(s, dt){
  if (s.docked){ s.x = s.docked.ox; s.y = s.docked.oy; s.speed = 0; if (s.task && s.task.type === 'trade' && state === 'play' && (s.dwell -= dt) <= 0){ const t = s.task; if (t.dest === s.docked) tradeCall(s, s.docked); else { s.h = s.docked.out; s.docked = null; s.sail = 1; } }
    else if (state === 'play' && s.task && s.task.type === 'port' && Math.hypot(p.x - s.x, p.y - s.y) < 420 && repairCost(s) <= 8){ setTask(s, { type: 'fleet' }); say('The ' + s.name + ' weighs and rejoins the fleet.'); } /* she comes out to meet the flag */
    else if (s.task && s.task.why === 'weather' && !hurr && weather.kind !== 'storm' && repairCost(s) <= 8){ afterRepairs(s, s.prev ? 'station' : 'join'); } return; }
  s.thinkT = (s.thinkT || 0) - dt; if (s.thinkT <= 0){ s.thinkT = 1; think(s); }
  if (s.task && s.task.type !== 'fleet'){ const want = state === 'play' || !inCompany(s) ? detached(s, dt) : (s.sail = 0, s.h); moveShip(s, clamp(angd(avoid(s, want), s.h)*3, -1, 1), dt); return; }
  const i = s.slot || 1, k = Math.ceil(i/2), sd = i % 2 ? 1 : -1;
  s.off = formation === 'column' ? [-105*i, 0] : formation === 'abreast' ? [0, sd*100*k] : [-80*k, sd*90*k];
  if (orders === 'hold') s.off = [s.off[0] - 170, s.off[1]];
  let want = s.h, tgt = null;
  if (state !== 'play' && inCompany(s)){ s.sail = 0; s.speed *= .9; }
  else {
    if (orders !== 'hold'){ s.scanT -= dt;
      if (s.scanT <= 0){ s.scanT = .6 + rnd()*.4; s.foe = null; let bd = 1e9;
        if (fleetTarget && threat(fleetTarget) && Math.hypot(fleetTarget.x-s.x, fleetTarget.y-s.y) < 1100){ s.foe = fleetTarget; bd = -1e9; } // the flagship's signal comes first
        for (const o of ships){ if (!threat(o)) continue; const od = Math.hypot(o.x-s.x, o.y-s.y), w = od - (o === tracked ? 200 : 0);
          if (od < (orders === 'chase' ? 1700 : 720) && w < bd){ bd = w; s.foe = o; } } }
      if (s.foe && !threat(s.foe)) s.foe = null; tgt = s.foe; } else s.foe = null;
    if (!tgt){ const w2 = chore(s, dt); if (w2 != null){ moveShip(s, clamp(angd(avoid(s, w2), s.h)*3, -1, 1), dt); return; } }
    const c = Math.cos(p.h), n = Math.sin(p.h), tx = p.x + c*s.off[0] - n*s.off[1], ty = p.y + n*s.off[0] + c*s.off[1], lag = Math.hypot(tx-s.x, ty-s.y);
    const ex = (tx-s.x)*c + (ty-s.y)*n, ey = -(tx-s.x)*n + (ty-s.y)*c; // how far her station is ahead of her, and to starboard
    s.speedMul = s.baseMul*(ex > 380 ? 1.9 : ex > 120 ? 1.4 : 1); // consorts crowd on sail to keep station
    if (tgt && (orders === 'engage' && Math.hypot(s.x-p.x, s.y-p.y) < 1200 || orders === 'chase' && Math.hypot(s.x-p.x, s.y-p.y) < 3000)) want = attack(s, tgt.x, tgt.y, dt, false, tgt);
    else { if (lag > 700) want = navTo(s, tx, ty, dt), s.sail = 1, s.speedMul = s.baseMul*1.5;
      else { want = p.h + clamp(ey/110, -.7, .7); // steer the flagship's course, easing sideways into her slot; never turn back for it
        const base = s.t.speed*Math.max(s.pol, .3)*wind.str*windMul()*(.35 + .65*s.sails/100), wantV = clamp(p.speed + ex*.8, 0, 250); // match the flagship's speed, plus or minus the gap
        s.sail = wantV > 6 ? 1 : 0; s.speedMul = clamp(wantV/Math.max(1, base), .15, 2.4); s.speed += (wantV - s.speed)*Math.min(1, dt*1.3); }
      if (tgt){ const dx = tgt.x-s.x, dy = tgt.y-s.y; if (Math.hypot(dx, dy) <= RANGE*.9){ const rel = angd(Math.atan2(dy, dx), s.h);
        if (Math.abs(Math.abs(rel) - Math.PI/2) < .3) fire(s, rel > 0 ? 1 : -1, false); } } }
    if (p.speed > 40 && s.cap.sea < 5){ s.cap.sx = (s.cap.sx || 0) + dt; if (s.cap.sx > 200 + 120*s.cap.sea){ s.cap.sx = 0;
      s.cap.sea++; fitConsort(s); say(capTitle(s.cap) + ' of the ' + s.name + ' has learned the sea: seamanship ' + s.cap.sea + '.'); } }
  }
  moveShip(s, clamp(angd(avoid(s, want), s.h)*3, -1, 1), dt);
}
function laneBears(s, side){ for (const o of ships){ if (!threat(o)) continue; const dx = o.x-s.x, dy = o.y-s.y; if (Math.hypot(dx, dy) > RANGE) continue;
  const rel = angd(Math.atan2(dy, dx), s.h); if ((rel > 0 ? 1 : -1) === side && Math.abs(Math.abs(rel) - Math.PI/2) < .3) return true; } return false; }
const price = (q, g, t) => Math.max(2, Math.round(GOODS[g][1]*(q.spec.mk.indexOf(g) >= 0 ? .7 : q.spec.dm.indexOf(g) >= 0 ? (g === 'cloth' && q.home === 'es' || q.name === 'Monte Cristi' && (g === 'flour' || g === 'fish') ? 1.7 : g === 'flour' || g === 'fish' ? 1.6 : 1.35) : 1)*(1 + .1*Math.sin((t == null ? clock : t)*.011 + q.x*.01 + g.length*2.1))));
let gazette = [], courtList = [], courtTok = 0;
const OFFICERS = { master:['Sailing master', 'Half a knot more out of her on every point of sailing.'], gunner:['Gunner', 'The guns are served a tenth faster.'], surgeon:['Surgeon', 'Some of the wounded come back to duty each month.'], bosun:['Boatswain', 'Sails are knotted and spliced at sea.'] };
let morale = 70, officers = {}, foul = 0, fouling = false, lastCall = 0, rivals = [];
const moraleWord = () => morale >= 85 ? 'in high spirits' : morale >= 60 ? 'content' : morale >= 40 ? 'grumbling' : morale >= 25 ? 'sullen' : 'near mutiny';
const cheer = d => { morale = clamp(morale + d, 0, 100); };
const pMul = () => (officers.master ? 1.04 : 1)*(1 - .18*foul);
const NAVY = [[0, 'Privateer'], [6, 'Lieutenant'], [16, 'Commander'], [32, 'Post-captain'], [60, 'Commodore']];
let navy = { k: null, pts: 0, rank: 0 }, captives = { en:0, es:0, fr:0, nl:0, dk:0 }, stats = { taken:0, sunk:0, lawful:0, unlawful:0 }, customsT = 0, askDefault = null;
const inService = () => !!marque && navy.k === marque;
function svc(n){ if (!marque || !n) return; if (navy.k !== marque) navy = { k: marque, pts: 0, rank: 0 }; const was = navy.pts; navy.pts += n;
  const nx = NAVY[navy.rank + 1]; if (nx && was < nx[0] && navy.pts >= nx[0]){ const adj = NAT[marque].adj;
    later(() => say('Your service is noticed. Call on a ' + adj + ' governor to be made ' + nx[1] + '.'), 3000); } }
function ask(title, text, opts){ /* opts: [id, label, note, enabled, fn]; Esc takes the last */
  setChart(false); menuOpen = true; held.left = held.right = false; $('askTitle').textContent = title; $('askText').textContent = text; const ul = $('askBtns'); ul.textContent = '';
  opts.forEach(o => { const li = document.createElement('li'), sp = document.createElement('span'), sm = document.createElement('small'), b = document.createElement('button'); sp.textContent = o[1]; sm.textContent = o[2] || ''; sp.appendChild(sm); b.type = 'button'; b.id = o[0]; b.textContent = 'Choose'; b.disabled = !o[3];
    b.addEventListener('click', () => { askDefault = null; closeMenu(); o[4](); if (state === 'port') renderPort(); }); li.appendChild(sp); li.appendChild(b); ul.appendChild(li); });
  askDefault = opts[opts.length - 1][4]; $('ask').hidden = false; const f = ul.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true }); }
let gazDate = null;
function gaz(t, k){ gazette.unshift({ d: gazDate || dateStr(), t: String(t), k: k || 'news' }); if (gazette.length > 60) gazette.length = 60; }
const offWhere = (x, y) => { let b = ports[0], bd = 1e9; for (const q of ports){ const d = Math.hypot(q.x - x, q.y - y);
  if (d < bd){ bd = d; b = q; } } return (bd < 700 ? ' off ' : ' at sea, ' + Math.round(bd/DEG*20) + ' leagues from ') + b.name; };
function openPaper(mode, data){ if (state !== 'play' && state !== 'port') return; setChart(false); menuOpen = true; held.left = held.right = false; const b = $('paperBody'); b.textContent = '';
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; b.appendChild(e); return e; };
  const row = (a, c, cls) => { const r = el('div', 'prow' + (cls ? ' ' + cls : '')), x = document.createElement('span'), y = document.createElement('span');
    x.textContent = a; y.textContent = c; r.appendChild(x); r.appendChild(y); };
  if (mode === 'court'){ el('div', 'mast', 'Court of Vice-Admiralty'); el('div', 'dateline', 'Sitting at ' + data.port + ' · ' + dateStr());
    el('p', 'lead', 'Be it known that the following vessels, taken at sea under a lawful commission, are this day condemned as good and lawful prize, and the proceeds ordered paid to their captor.');
    data.list.forEach(v => row(v.n, v.v + ' gold')); row('Paid over this day', data.total + ' gold', 'total'); el('p', 'sig', 'By order of the Judge, and God save the King.'); }
  else if (mode === 'dispatches'){ dispNew = 0; dispBadge(); el('div', 'mast', 'Dispatches'); el('div', 'dateline', dateStr() + ' · from the captains of your fleet');
    if (!dispatches.length) el('p', 'lead', 'Nothing has come in. Your captains write when they make port, break off, or have something to report.');
    dispatches.forEach((v, i) => { const e = el('p', v.ask ? 'you' : ''), bb = document.createElement('b'); bb.textContent = v.d + '. ' + v.who + ': '; e.appendChild(bb); e.appendChild(document.createTextNode(v.t));
      const s = v.ask && squad().find(o => o.id === v.id); if (v.ask === 'repair' && (!s || !s.docked || repairCost(s) <= 8)) v.ask = null; if (v.ask === 'funds' && (!s || !s.task || s.task.type !== 'trade' || !s.task.need)) v.ask = null;
      if (v.ask === 'funds'){ const t2 = s.task, want = Math.max(0, t2.cap - Math.round(t2.funds)), r = el('div', 'dbtns'); [['send', 'Send her ' + Math.min(want, gold) + ' gold'], ['recall', 'Recall her to the flag'], ['', 'Let her wait']].forEach(o => { const b2 = document.createElement('button'); b2.type = 'button'; b2.id = 'df_' + (o[0] || 'wait') + i; b2.textContent = o[1]; b2.disabled = o[0] === 'send' && gold < 1;
        b2.addEventListener('click', () => { v.ask = null; if (o[0] === 'send'){ const n = Math.min(want, gold); gold -= n; t2.funds += n; t2.need = false; s.dwell = 2; v.t += ' [Sent ' + n + ' gold.]'; } else if (o[0] === 'recall'){ setTask(s, { type: 'fleet' }); v.t += ' [Recalled.]'; } else v.t += ' [Left waiting.]'; openPaper('dispatches'); }); r.appendChild(b2); }); }
      else
      if (v.ask){ const c = repairCost(s), r = el('div', 'dbtns'); [['back', 'Pay ' + c + ' and send her back'], ['join', 'Pay and have her rejoin'], ['stay', 'Pay and keep her in port'], ['', 'Leave her as she is']].forEach(o => { const b2 = document.createElement('button'); b2.type = 'button'; b2.id = 'dp_' + (o[0] || 'leave') + i; b2.textContent = o[1]; b2.disabled = !!o[0] && gold < 1;
        b2.addEventListener('click', () => { v.ask = null; if (o[0]){ const paid = payRepairs(s, o[0] === 'back' ? 'station' : o[0]); v.t += ' [Paid ' + paid + ' gold. ' + (o[0] === 'back' ? 'Sent back to her station.' : o[0] === 'join' ? 'Ordered to rejoin.' : 'Kept in port.') + ']'; } else v.t += ' [Left unrepaired.]'; openPaper('dispatches'); }); r.appendChild(b2); }); } }); }
  else { el('div', 'mast', 'The ' + homeName + ' Gazette'); const ws = [...wars].map(w => NAT[w.slice(0, 2)].land + ' and ' + NAT[w.slice(3)].land).join('; ');
    el('div', 'dateline', dateStr() + ' · ' + (ws ? 'At war: ' + ws : 'The nations are at peace'));
    if (!gazette.length) el('p', 'lead', 'No news has come in yet. The packet is expected.');
    gazette.forEach(v => { const e = el('p', v.k), bb = document.createElement('b'); bb.textContent = v.d + '. '; e.appendChild(bb); e.appendChild(document.createTextNode(v.t)); }); }
  $('paper').hidden = false; $('paperClose').focus({ preventScroll: true }); $('paper').firstElementChild.scrollTop = 0; }
function news(msg){ gaz(msg, 'news'); newsLog.unshift(msg); newsLog.length = Math.min(newsLog.length, 4); if (state === 'play') say('News: ' + msg); }
