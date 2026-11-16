const squad = () => { if (sqT !== tick || sqN !== ships.length){ sqT = tick; sqN = ships.length; sqC = ships.filter(o => o.role === 'fleet' && o.sinking == null); } return sqC; }; /* rebuilt once a tick, or when the list of ships changes */
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
function fitConsort(s){ const f = s.hull/s.maxHull; s.guns = s.t.guns + s.up.guns; s.maxHull = s.t.hull + 30*s.up.hull; s.hull = s.maxHull*f; s.baseMul = (1 + .04*s.cap.sea)*(1 + .07*s.up.sail); s.speedMul = s.baseMul;
  s.t.name = s.name; }
const capTitle = c => c.mate ? 'Your first mate' : 'Capt. ' + c.name;
function capXp(o){ const c = o.cap; if (!c || c.gun >= 5) return; c.xp = (c.xp || 0) + 1; // a captain learns gunnery by landing shot
  if (c.xp >= 25 + 15*c.gun){ c.xp = 0; c.gun++; fitConsort(o); say(capTitle(c) + ' of the ' + o.name + ' has learned her guns: gunnery ' + c.gun + '.'); } }
function addFleet(d, x, y, h){ // d: { cls, hf, sails, crew, cap, up }
  const s = makeShip(CLASSES[d.cls] ? d.cls : 'sloop', 'player', 'fleet', x, y, h); s.cap = cleanCap(d.cap); s.up = cleanUp(d.up); s.name = cleanName(d.name); fitConsort(s);
  s.hull = s.maxHull*clamp(+d.hf || 1, .05, 1); s.sails = clamp(d.sails == null ? 100 : +d.sails, 0, 100); s.crew = clamp(d.crew|0 || 10, 1, s.t.crew); s.sail = 1;
  ships.push(s); dirty(); return s; }
const fleetData = s => ({ x: Math.round(s.x), y: Math.round(s.y), task: s.task && s.task.type !== 'fleet' ? { type: s.task.type === 'chase' ? 'raid' : s.task.type, port: s.task.port ? s.task.port.name : null } : null, cls: s.cls, hf: +(s.hull/s.maxHull).toFixed(3), sails: Math.round(s.sails), crew: s.crew, cap: s.cap, up: s.up, name: s.name });
const threat = o => o.owner !== 'player' && o.sinking == null && !o.released && !o.surrendered && (o === tracked || o === fleetTarget || o.hitByPlayer || o.announced);
function trimHold(){ let over = holdUsed() - holdCap(); for (const g of GK){ if (over <= 0) break; const d = Math.min(hold[g], over); hold[g] -= d; over -= d; } }
function setForm(k){ formation = FORMS[k] ? k : 'column'; $('formBtn').textContent = FORMS[formation]; }
function setOrders(k){ orders = ORDERS[k] ? k : 'line'; $('orderBtn').textContent = ORDERS[orders]; }
const inCompany = s => Math.hypot(s.x - p.x, s.y - p.y) < 900;
const taskWord = s => { const t = s.task; return !t || t.type === 'fleet' ? 'With the fleet' : t.type === 'raid' ? (t.prey ? 'Chasing a prize' : 'Hunting prizes') : t.type === 'chase' ? 'Engaging the ' + (t.prey ? nm(t.prey) : 'enemy') : t.type === 'hold' ? 'Holding station'
  : t.flee && !t.arrived ? 'Running for ' + t.port.name
  : t.arrived ? 'Waiting at ' + t.port.name : 'Bound for ' + t.port.name; };
function setTask(s, t){ s.task = t; s.path = null; s.foe = null; s.boardT = 0; s.speedMul = s.baseMul; }
const fairGame = o => o.owner !== 'player' && o.sinking == null && !o.released && !o.gone && (o === fleetTarget || o.owner === 'pirate' || prize(o) && (hostile(o.nation) || o.hitByPlayer)); // what a consort may take on her own
const POLICY = { plunder:'Plunder and release', keep:'Take into the fleet', send:'Send in as prizes', leave:'Leave to the flagship' };
let prizePolicy = 'plunder';
function setPolicy(k){ prizePolicy = POLICY[k] ? k : 'plunder'; }
function cyclePolicy(){ const k = Object.keys(POLICY); setPolicy(k[(k.indexOf(prizePolicy) + 1) % k.length]); say('Standing order for prizes: ' + POLICY[prizePolicy].toLowerCase() + '.'); }
function claimPrize(s, o){ // a consort boards a struck ship and deals with her as the standing order says
  const c = prizeLoot(o), share = Math.round(c*.1), hf = clamp(o.hull/o.maxHull, .1, 1), name = nm(o); let tons = 0, tail = ''; o.cargo = 0; earn(c, s.x, s.y); gold -= share;
  const how = prizePolicy === 'keep' && squad().length >= MAXSQ ? 'send' : prizePolicy === 'leave' ? 'plunder' : prizePolicy;
  if (how === 'keep'){ const cap = spares.length ? spares.sort((a, b) => b.gun + b.sea - a.gun - a.sea).shift() : mate(); addFleet({ cls: o.cls, hf, sails: Math.max(30, o.sails), crew: Math.max(o.crew, Math.ceil(o.t.crew*.25)), cap }, o.x, o.y, o.h); o.gone = true; tail = ' She joins your fleet under ' + (cap.mate ? 'your first mate' : 'Capt. ' + cap.name) + '.'; }
  manifestOf(o).forEach(v => { hold[v.g] += v.take; tons += v.take; }); o.goods = null;
  if (how === 'send'){ tail = ' She is sent in. ' + sendIn(o, hf); o.gone = true; }
  else if (how === 'plunder'){ o.surrendered = false; o.released = true; o.sail = 1; o.sails = Math.max(o.sails, 40); }
  onPrize(o, true); if (tracked === o) tracked = null; chime();
  say('The ' + s.name + ' has taken the ' + name + ': ' + (c - share) + ' gold to you' + (tons ? ' and ' + tons + ' tons of goods' : '') + ', ' + share + ' in shares to her company.' + tail); }
function chore(s, dt){ // a consort in the line slips away for a struck ship or flotsam close by, then returns
  s.jobT = (s.jobT || 0) - dt;
  if (s.jobT <= 0){ s.jobT = 1; s.job = null; let bd = 1e9;
    if (prizePolicy !== 'leave') for (const o of ships){ if (!o.surrendered || o.released || o.sinking != null || o.owner === 'player' || o.board > 0 || o.claim && o.claim !== s && o.claimT > clock || Math.hypot(o.x - p.x, o.y - p.y) > 800) continue; const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < bd){ bd = d; s.job = o; } }
    if (!s.job) for (const c of crates){ if (c.claim && c.claim !== s && c.claimT > clock || Math.hypot(c.x - p.x, c.y - p.y) > 650) continue; const d = Math.hypot(c.x - s.x, c.y - s.y); if (d < bd){ bd = d; s.job = c; } }
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
  const B = (id, label, on, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.id = id; b.textContent = label; b.disabled = !on; if (cls) b.className = cls; b.addEventListener('click', () => { const keep = id === 'o_strike'; fn(); if (!keep) strikeArm = false; renderOrders(); }); box.appendChild(b); };
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
      const back = !o.cap.mate && spares.length < 6; if (back) spares.push(o.cap); ships.splice(ships.indexOf(o), 1); trimHold(); newsLog.unshift('Struck her colours: the ' + o.name + '.'); newsLog.length = Math.min(newsLog.length, 4);
      say('The ' + o.name + ' strikes her colours and is lost to you.' + (back ? ' Capt. ' + o.cap.name + ' is put ashore and will rejoin you as a spare.' : '')); closeOrders(); }, strikeArm ? 'danger' : '');
    B('o_manage', 'Manage her', true, () => openFleet('S' + squad().indexOf(o)));
  }
  if (!orderSel) return;
  const foes = $('ordFoes'); foes.textContent = ''; const seen = sighted(o);
  if (seen.length){ const h = document.createElement('div'); h.className = 'ordlbl'; h.textContent = flag ? 'Enemies in sight: mark one for the fleet' : 'Enemies in sight: send her against one'; foes.appendChild(h); }
  seen.forEach((e, i) => { const b = document.createElement('button'); b.type = 'button'; b.id = 'o_foe' + i; b.textContent = e.t.name + ' · ' + Math.max(1, Math.round(Math.hypot(e.x - o.x, e.y - o.y)/DEG*20)) + ' lg';
    b.addEventListener('click', () => { if (flag){ fleetTarget = e; engage(e); say('Signal to the fleet: engage the ' + nm(e) + '.'); } else { setTask(o, { type: 'chase', prey: e, at: [o.x, o.y] }); say('The ' + o.name + ' will engage the ' + nm(e) + '.'); } picking = false; renderOrders(); }); foes.appendChild(b); });
  $('ordNote').textContent = picking ? 'Click the enemy ship she is to engage. Esc cancels.' : flag ? (sq.length ? sq.length + ' consort' + (sq.length > 1 ? 's' : '') + ' under your flag. Click one of your ships to give her orders of her own.' : 'You sail alone.') : taskWord(o) + '. Hull ' + Math.round(o.hull/o.maxHull*100) + '%, crew ' + o.crew + '.';
}
function detached(s, dt){ // a consort acting on her own orders
  const t = s.task; let want = s.h; s.speedMul = s.baseMul;
  if (t.type === 'hold'){ s.sail = 0; }
  else if (t.type === 'port'){ const d = Math.hypot(t.port.ox - s.x, t.port.oy - s.y);
    if (d < 180){ s.sail = 0; if (!t.arrived){ t.arrived = true; say('The ' + s.name + ' has reached ' + t.port.name + ' and waits for you there.'); } if (inCompany(s) && Math.hypot(p.x - s.x, p.y - s.y) < 420){ setTask(s, { type: 'fleet' }); say('The ' + s.name + ' rejoins the fleet.'); } }
    else { s.sail = 1; want = navTo(s, t.port.ox, t.port.oy, dt); } }
  else { // raid or chase
    if (t.type === 'chase' && (!t.prey || t.prey.sinking != null || t.prey.released || t.prey.gone || ships.indexOf(t.prey) < 0)){ say('The ' + s.name + ' has lost her chase and returns to the fleet.'); setTask(s, { type: 'fleet' }); return want; }
    if (t.type === 'raid'){ s.scanT -= dt; if (s.scanT <= 0 || t.prey && (t.prey.sinking != null || t.prey.released || t.prey.gone)){ s.scanT = 1.5; t.prey = null; let bd = 2400;
      for (const o of ships){ if (!fairGame(o)) continue; const od = Math.hypot(o.x - s.x, o.y - s.y); if (od < bd){ bd = od; t.prey = o; } } } }
    const o = state === 'play' ? t.prey : null; // while you lie in port your ships neither give nor take fire
    if (!o){ s.sail = .5; want = loiterTo(s, dt, () => waterNear(t.at[0], t.at[1], 700)); }
    else if (o.surrendered){ const d = Math.hypot(o.x - s.x, o.y - s.y); if (d < BOARD_R){ s.sail = 0; s.boardT = (s.boardT || 0) + dt; if (s.boardT >= 2){ s.boardT = 0; claimPrize(s, o); t.prey = null; if (t.type === 'chase'){ setTask(s, { type: 'fleet' }); } } }
      else { s.sail = d > 200 ? 1 : .5; want = navTo(s, o.x, o.y, dt); } }
    else { s.speedMul = s.baseMul*(prize(o) && Math.hypot(o.x - s.x, o.y - s.y) > 200 ? 1.2 : 1); want = attack(s, o.x, o.y, dt, false, o); }
  }
  return want;
}
function fleetAI(s, dt){
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
        for (const o of ships){ if (!threat(o)) continue; const od = Math.hypot(o.x-s.x, o.y-s.y), w = od - (o === tracked ? 200 : 0); if (od < (orders === 'chase' ? 1700 : 720) && w < bd){ bd = w; s.foe = o; } } }
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
      if (tgt){ const dx = tgt.x-s.x, dy = tgt.y-s.y; if (Math.hypot(dx, dy) <= RANGE*.9){ const rel = angd(Math.atan2(dy, dx), s.h); if (Math.abs(Math.abs(rel) - Math.PI/2) < .3) fire(s, rel > 0 ? 1 : -1, false); } } }
    if (p.speed > 40 && s.cap.sea < 5){ s.cap.sx = (s.cap.sx || 0) + dt; if (s.cap.sx > 200 + 120*s.cap.sea){ s.cap.sx = 0; s.cap.sea++; fitConsort(s); say(capTitle(s.cap) + ' of the ' + s.name + ' has learned the sea: seamanship ' + s.cap.sea + '.'); } }
  }
  moveShip(s, clamp(angd(avoid(s, want), s.h)*3, -1, 1), dt);
}
function laneBears(s, side){ for (const o of ships){ if (!threat(o)) continue; const dx = o.x-s.x, dy = o.y-s.y; if (Math.hypot(dx, dy) > RANGE) continue;
  const rel = angd(Math.atan2(dy, dx), s.h); if ((rel > 0 ? 1 : -1) === side && Math.abs(Math.abs(rel) - Math.PI/2) < .3) return true; } return false; }
const price = (q, g) => Math.max(2, Math.round(GOODS[g][1]*(q.spec.mk.indexOf(g) >= 0 ? .7 : q.spec.dm.indexOf(g) >= 0 ? (g === 'cloth' && q.home === 'es' || q.name === 'Monte Cristi' && (g === 'flour' || g === 'fish') ? 1.7 : g === 'flour' || g === 'fish' ? 1.6 : 1.35) : 1)*(1 + .1*Math.sin(clock*.011 + q.x*.01 + g.length*2.1))));
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
  const nx = NAVY[navy.rank + 1]; if (nx && was < nx[0] && navy.pts >= nx[0]){ const adj = NAT[marque].adj; later(() => say('Your service is noticed. Call on a ' + adj + ' governor to be made ' + nx[1] + '.'), 3000); } }
function ask(title, text, opts){ /* opts: [id, label, note, enabled, fn]; Esc takes the last */
  setChart(false); menuOpen = true; held.left = held.right = false; $('askTitle').textContent = title; $('askText').textContent = text; const ul = $('askBtns'); ul.textContent = '';
  opts.forEach(o => { const li = document.createElement('li'), sp = document.createElement('span'), sm = document.createElement('small'), b = document.createElement('button'); sp.textContent = o[1]; sm.textContent = o[2] || ''; sp.appendChild(sm); b.type = 'button'; b.id = o[0]; b.textContent = 'Choose'; b.disabled = !o[3];
    b.addEventListener('click', () => { askDefault = null; closeMenu(); o[4](); if (state === 'port') renderPort(); }); li.appendChild(sp); li.appendChild(b); ul.appendChild(li); });
  askDefault = opts[opts.length - 1][4]; $('ask').hidden = false; const f = ul.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true }); }
let gazDate = null;
function gaz(t, k){ gazette.unshift({ d: gazDate || dateStr(), t: String(t), k: k || 'news' }); if (gazette.length > 60) gazette.length = 60; }
const offWhere = (x, y) => { let b = ports[0], bd = 1e9; for (const q of ports){ const d = Math.hypot(q.x - x, q.y - y); if (d < bd){ bd = d; b = q; } } return (bd < 700 ? ' off ' : ' at sea, ' + Math.round(bd/DEG*20) + ' leagues from ') + b.name; };
function openPaper(mode, data){ if (state !== 'play' && state !== 'port') return; setChart(false); menuOpen = true; held.left = held.right = false; const b = $('paperBody'); b.textContent = '';
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; b.appendChild(e); return e; };
  const row = (a, c, cls) => { const r = el('div', 'prow' + (cls ? ' ' + cls : '')), x = document.createElement('span'), y = document.createElement('span'); x.textContent = a; y.textContent = c; r.appendChild(x); r.appendChild(y); };
  if (mode === 'court'){ el('div', 'mast', 'Court of Vice-Admiralty'); el('div', 'dateline', 'Sitting at ' + data.port + ' · ' + dateStr());
    el('p', 'lead', 'Be it known that the following vessels, taken at sea under a lawful commission, are this day condemned as good and lawful prize, and the proceeds ordered paid to their captor.');
    data.list.forEach(v => row(v.n, v.v + ' gold')); row('Paid over this day', data.total + ' gold', 'total'); el('p', 'sig', 'By order of the Judge, and God save the King.'); }
  else { el('div', 'mast', 'The ' + homeName + ' Gazette'); const ws = [...wars].map(w => NAT[w.slice(0, 2)].land + ' and ' + NAT[w.slice(3)].land).join('; ');
    el('div', 'dateline', dateStr() + ' · ' + (ws ? 'At war: ' + ws : 'The nations are at peace'));
    if (!gazette.length) el('p', 'lead', 'No news has come in yet. The packet is expected.');
    gazette.forEach(v => { const e = el('p', v.k), bb = document.createElement('b'); bb.textContent = v.d + '. '; e.appendChild(bb); e.appendChild(document.createTextNode(v.t)); }); }
  $('paper').hidden = false; $('paperClose').focus({ preventScroll: true }); $('paper').firstElementChild.scrollTop = 0; }
function news(msg){ gaz(msg, 'news'); newsLog.unshift(msg); newsLog.length = Math.min(newsLog.length, 4); if (state === 'play') say('News: ' + msg); }
