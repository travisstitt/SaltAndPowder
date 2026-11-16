// End-to-end tests for Salt and Powder.
// Run:  node tests/run-tests.js      (needs Playwright with Chromium available to `require`)
// The game exposes its internals as window.__sp when opened with #test.
const path = require('path');
const { chromium } = require('playwright');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '#test';

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail: detail === undefined ? '' : typeof detail === 'string' ? detail : JSON.stringify(detail) }); };

// helpers that run inside the page
const HELPERS = () => {
  const g = window.__sp;
  window.T = {
    reset(diff){ // a fresh voyage in fair weather, alone on the sea, mid-morning
      g.seed(20260 + (T.n = (T.n || 0) + 1)); g.setDiff(diff || 'normal'); g.newGame(); g.rivals.forEach(v => { v.alive = false; }); g.toastQ.length = 0; g.setCalm(true); g.setWars(['en-es', 'en-fr']); g.state = 'play'; g.setPaused(false); g.setChart(false);
      for (const id of ['title', 'port', 'prize', 'menu', 'manifest', 'fleetSheet', 'over', 'fate']) document.getElementById(id).hidden = true;
      const w = g.weather; w.kind = 'clear'; w.k = 0; w.left = 1e7; w.next = null; g.clock = 60;
      T.clear(4000); },
    clear(r){ g.ships.forEach(s => { if (s.owner !== 'player' && !s._t && Math.hypot(s.x - g.p.x, s.y - g.p.y) < r) s.gone = true; }); g.update(.001); },
    sea(){ g.p.x = g.X(-75); g.p.y = g.Y(15); g.p.h = 0; g.p.speed = 0; T.clear(4000); }, // open Caribbean, no land for leagues
    run(sec){ for (let t = 0; t < sec; t += .05){ g.ships.forEach(s => { if (s.role === 'hunter' && !s._t) s.gone = true; }); g.update(.05); if (g.state === 'over') break; } },
    foe(cls, owner, role, dx, dy){ const p = g.p, c = Math.cos(p.h), n = Math.sin(p.h), s = g.mk(cls, owner, role, p.x + c*dx - n*dy, p.y + n*dx + c*dy, p.h); s._t = true; s.dest = g.ports[2]; s.cargo = 200; return s; },
    consort(cls, i){ const p = g.p; return g.addFleet({ cls, hf: 1, sails: 100, crew: 30, cap: { name: 'Test Captain', gun: 3, sea: 3 } }, p.x - 60*(i + 1), p.y + 40, p.h); },
    bad(){ return g.ships.filter(s => !isFinite(s.x) || !isFinite(s.y) || !isFinite(s.hull)).length; }
  };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' @ ' + ((e.stack || '').split('\n')[1] || '').trim()));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL); await page.waitForFunction(() => window.__sp, null, { timeout: 30000 }); await page.evaluate(HELPERS);
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const errCount = () => errors.length;

  // ---------- boot and world ----------
  let r = await ev(() => { const g = __sp; return { ports: g.ports.length, landAnchors: g.ports.filter(q => g.isLand(q.ox, q.oy)).map(q => q.name), ships: g.ships.length, fleet: !!(g.fleet && g.fleet.lead),
    roles: g.ships.reduce((o, s) => { o[s.role] = (o[s.role] || 0) + 1; return o; }, {}), onLand: g.ships.filter(s => g.isLand(s.x, s.y)).length }; });
  check('boot: 108 ports', r.ports === 108, r.ports);
  check('boot: every port anchorage is in water', r.landAnchors.length === 0, r.landAnchors);
  check('boot: merchants, patrols and treasure fleet present', r.roles.merchant >= 12 && r.roles.patrol >= 3 && r.fleet && r.roles.treasure === 2, r.roles);
  check('boot: no ship starts on land', r.onLand === 0, r.onLand);
  r = await ev(() => { const o = {}; for (const d of ['easy', 'normal', 'hard']){ T.reset(d); o[d] = __sp.gold; } T.reset(); return o; });
  check('difficulty: starting purse', r.easy === 300 && r.normal === 0 && r.hard === 0, r);

  // ---------- sailing and wind ----------
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.wind.dir = g.wind.tDir = g.p.h + .8; g.wind.timer = 1e6; g.p.sail = 1; T.run(12); const reach = g.p.speed;
    g.wind.dir = g.wind.tDir = g.p.h + Math.PI; T.run(14); const irons = g.p.speed; g.p.sail = 0; T.run(10); return { reach, irons, furled: g.p.speed }; });
  check('sailing: makes way on a reach', r.reach > 80, r.reach);
  check('sailing: stalls head to wind', r.irons < 15, r.irons);
  check('sailing: stops with sails furled', r.furled < 3, r.furled);

  // ---------- gunnery, reputation, surrender ----------
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const m = T.foe('merchant', 'es', 'merchant', 0, 150), es0 = g.standing.es, en0 = g.standing.en; g.fire(g.p, 1); T.run(1.5);
    return { hull: m.hull, max: m.maxHull, es: g.standing.es - es0, en: g.standing.en - en0, tracked: g.tracked === m, hit: m.hitByPlayer }; });
  check('gunnery: a starboard broadside hits a ship abeam', r.hull < r.max && r.hit, r);
  check('gunnery: under a British letter, attacking Spain angers her and pleases Britain', r.es < 0 && r.en > 0, r);
  check('gunnery: the ship fired on becomes the chase', r.tracked);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.foe('merchant', 'es', 'merchant', 0, 200), b = T.foe('brig', 'es', 'patrol', 300, 400), c = T.foe('brig', 'pirate', 'quarry', -300, 400);
    g.struck(a); g.damage(a, a.maxHull*.65, 0); g.struck(b); g.damage(b, 1, 95); g.struck(c); c.crew = 3; g.damage(c, 1, 0); return [a.surrendered, b.surrendered, c.surrendered]; });
  check('surrender: battered hull strikes', r[0]); check('surrender: dismasted ship strikes', r[1]); check('surrender: ship with too few hands strikes', r[2]);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.foe('merchant', 'es', 'merchant', 0, 60); a.goods = { cocoa: 10, sugar: 500 }; g.struck(a); g.damage(a, a.maxHull*.65, 0); T.run(3);
    const st = g.state, g0 = g.gold; g.settlePrize('loot'); return { st, gained: g.gold - g0, after: g.state, released: a.released, cocoa: g.hold.cocoa, sugar: g.hold.sugar, cap: 40 }; });
  check('boarding: sailing into the ring opens the prize screen', r.st === 'prize', r.st);
  check('prize: plunder pays gold and releases her', r.gained === 200 && r.after === 'play' && r.released, r);
  check('prize: goods taken dearest first, up to the hold', r.cocoa === 10 && r.sugar === 30, r);
  r = await ev(() => { const g = __sp, out = {}; T.reset(); T.sea(); let a = T.foe('brig', 'es', 'patrol', 0, 60); g.capture(a); g.settlePrize('keep'); out.keep = g.p.cls; out.keepState = g.state;
    a = T.foe('merchant', 'es', 'merchant', 0, 60); g.p.crew = 40; const c0 = g.p.crew, g0 = g.gold; g.capture(a); g.settlePrize('send'); out.send = [g.p.crew - c0, g.gold > g0, a.gone];
    a = T.foe('sloop', 'es', 'patrol', 0, 60); g.p.crew = 60; g.capture(a); g.settlePrize('fleet'); out.fleet = g.squad().length; out.fleetCls = g.squad()[0] && g.squad()[0].cls; return out; });
  check('prize: take her as your own ship', r.keep === 'brig' && r.keepState === 'play', r);
  check('prize: send her in costs 8 hands and pays', r.send[0] === -8 && r.send[1] && r.send[2], r.send);
  check('prize: add her to your fleet', r.fleet === 1 && r.fleetCls === 'sloop', r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.foe('cutter', 'pirate', 'quarry', 0, 50); a.crew = 6; g.p.crew = 60; g.grapple(); const m = !!g.melee; T.run(8); const win = g.state; if (g.state === 'prize') g.settlePrize('loot');
    T.reset(); T.sea(); const b = T.foe('fifty', 'es', 'patrol', 0, 60); b.crew = 300; g.p.crew = 40; g.grapple(); T.run(12); return { m, win, lose: g.state, crew: g.p.crew, melee: !!g.melee }; });
  check('melee: boarding starts a fight', r.m); check('melee: a weak crew is taken', r.win === 'prize', r.win);
  check('melee: boarding a fifty-gun ship with 40 hands fails and costs crew', (r.lose === 'play' || r.lose === 'fate') && r.crew < 40 && !r.melee, r);

  // ---------- fleet ----------
  r = await ev(() => { const g = __sp; T.reset(); T.consort('sloop', 0); const a = T.foe('brig', 'pirate', 'hunter', 200, 150), b = T.foe('cutter', 'pirate', 'hunter', -200, 180);
    g.openPort(g.ports[0]); g.ashore(120); const mid = g.squad().map(s => Math.round(s.hull)); g.closePort(); T.run(5); return { mid, after: g.squad().length, pirates: [a.sinking, b.sinking] }; });
  check('fleet: a consort is safe while you are in port (the reported bug)', r.mid.length === 1 && r.mid[0] === 100 && r.after === 1, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); for (let i = 0; i < 4; i++) T.consort(['brig', 'merchant', 'sloop', 'frigate'][i], i); g.wind.dir = g.wind.tDir = g.p.h + .8; g.wind.timer = 1e6; g.p.sail = 1; T.run(40);
    const d = g.squad().map(s => Math.round(Math.hypot(s.x - g.p.x, s.y - g.p.y))).sort((a, b) => a - b); return { d, n: g.squad().length, bad: T.bad() }; });
  check('fleet: four consorts keep station in line astern', r.n === 4 && r.d[0] > 60 && r.d[3] < 560 && r.d.every((v, i) => Math.abs(v - 105*(i + 1)) < 90), r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); T.consort('sloop', 1); const a = T.foe('brig', 'pirate', 'hunter', 0, 260); const h0 = a.hull; g.struck(a); T.run(40);
    return { hurt: a.hull < h0 - 5 || a.sinking != null || a.surrendered || a.released, n: g.squad().length, p: g.state }; });
  check('fleet: consorts fight an enemy alongside the flagship', r.hurt, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); const a = T.foe('merchant', 'nl', 'merchant', 60, 250), nl0 = g.standing.nl; T.run(15); const calm = a.hull === a.maxHull && g.standing.nl === nl0; return { calm }; });
  check('fleet: consorts leave neutral ships alone', r.calm, r);

  r = await ev(() => { const g = __sp; T.reset(); g.seed(5); T.sea(); g.repute('es', -100); const s = T.consort('brig', 0), m = T.foe('merchant', 'es', 'merchant', 500, 200); m.goods = { cocoa: 12 }; const g0 = g.gold;
    g.setTask(s, { type: 'raid', at: [s.x, s.y], prey: null }); let t = 0; while (!m.released && m.sinking == null && t < 420){ T.clear(5000); s.hull = s.maxHull; T.run(5); t += 5; } return { t, released: m.released, sunk: m.sinking != null, gained: g.gold - g0, cocoa: g.hold.cocoa, word: g.taskWord(s), alive: g.squad().length }; });
  check('orders: a consort sent hunting takes a prize on her own and pays you', r.released && r.gained > 150 && r.cocoa === 12 && r.alive === 1, r);
  r = await ev(() => { const g = __sp; T.reset(); const s = T.consort('sloop', 0), q = g.ports.find(q => q.name === 'Santiago de Cuba'); g.setTask(s, { type: 'port', port: q }); let t = 0; while (!s.docked && t < 1500){ T.run(5); t += 5; }
    const arrived = s.docked === q, word = g.taskWord(s), d = Math.round(Math.hypot(s.x - q.ox, s.y - q.oy)), hull = Math.round(s.hull); const snap = JSON.parse(JSON.stringify(g.snapshot())); g.loadGame(snap); const s2 = g.squad()[0];
    const kept = s2 && s2.task && s2.task.type === 'port' && s2.docked === g.ports.find(x => x.name === 'Santiago de Cuba') && Math.hypot(s2.x - q.ox, s2.y - q.oy) < 400; g.p.x = q.ox + 60; g.p.y = q.oy + 60; T.run(2); return { arrived, word, d, hull, kept, rejoined: !s2.task || s2.task.type === 'fleet', t }; });
  check('orders: a consort sails alone to a port, goes in, and lies safe there', r.arrived && r.d < 200 && r.hull >= 95 && /^In port at/.test(r.word), r);
  check('orders: an absent ship keeps her place and orders through a save, and rejoins when you arrive', r.kept && r.rejoined, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const s = T.consort('sloop', 0); g.setTask(s, { type: 'hold' }); g.wind.dir = g.p.h + .8; g.p.sail = 1; T.run(25); return Math.round(Math.hypot(s.x - g.p.x, s.y - g.p.y)); });
  check('orders: a ship told to hold stays behind', r > 1200, r);
  r = await ev(() => { const g = __sp; T.reset(); T.consort('sloop', 0); const s = g.squad()[0]; g.setTask(s, { type: 'raid', at: [s.x + 3000, s.y], prey: null }); s.x += 3000; const a = T.foe('brig', 'pirate', 'hunter', 3000, 150); a._t = true; g.openPort(g.ports[0]); g.ashore(120); const hull = s.hull, ahull = a.hull, hit = !!a.hitByPlayer; g.closePort(); return { hull, max: s.maxHull, ahull, amax: a.maxHull, hit }; });
  check('safe harbour: while you are in port even a distant consort neither takes nor gives fire', r.hull === r.max && !r.hit, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.foe('merchant', 'es', 'merchant', 0, 150); for (let i = 0; i < 6; i++){ g.p.rl[0] = g.p.rl[1] = 0; g.fire(g.p, 1); T.run(.6); } const n = g.smokes.length; a.gone = true; g.balls.length = 0; T.run(40); return { n, later: g.smokes.length }; });
  check('gunsmoke: hangs after firing in proportion to the guns, then clears', r.n >= 18 && r.later < r.n*.4, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const s = T.consort('brig', 0), e = T.foe('brig', 'pirate', 'hunter', 400, 300); g.openOrders(s); const open = !document.getElementById('orders').hidden; document.getElementById('o_foe0').click(); const chase = s.task && s.task.type === 'chase' && s.task.prey === e;
    document.getElementById('o_flee').click(); const flee = s.task.type === 'port' && s.task.flee; document.getElementById('o_shot').click(); const shot = s.shot; document.getElementById('o_strike').click(); const armed = g.squad().length === 1; document.getElementById('o_strike').click(); return { open, chase, flee, shot, armed, gone: g.squad().length === 0, closed: document.getElementById('orders').hidden }; });
  check('combat orders: engage a sighted enemy, flee, change shot, and strike colours with a confirm', r.open && r.chase && r.flee && r.shot === 'chain' && r.armed && r.gone && r.closed, r);
  { const e1 = errCount(); await ev(() => { const g = __sp; T.reset(); T.sea(); const s = T.consort('sloop', 0); g.setTask(s, { type: 'hold' }); T.consort('brig', 1); }); await page.waitForTimeout(900); check('orders: drawing a fleet with one ship detached raises no errors', errCount() === e1, errors.slice(e1)); }

  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const s = T.consort('brig', 0), m = T.foe('merchant', 'es', 'merchant', -220, 260); m.cargo = 200; m.goods = { cocoa: 9 }; g.struck(m); g.damage(m, m.maxHull*.65, 0); g.crates.push({ x: g.p.x - 260, y: g.p.y - 220, amt: 77, life: 60, ph: 0 });
    const g0 = g.gold; let t = 0; while ((!m.released || g.crates.length) && t < 90){ T.run(3); t += 3; } return { t, released: m.released, crates: g.crates.length, gained: g.gold - g0, cocoa: g.hold.cocoa, state: g.state }; });
  check('fleet: a consort in the line plunders a struck ship and picks up flotsam for you', r.released && r.crates === 0 && r.gained === 180 + 77 && r.cocoa === 9 && r.state === 'play', r);
  r = await ev(() => { const g = __sp, out = {}; for (const k of ['send', 'keep', 'leave']){ T.reset(); T.sea(); g.setPolicy(k); T.consort('brig', 0); const m = T.foe('merchant', 'es', 'merchant', -220, 260); m.cargo = 100; g.struck(m); g.damage(m, m.maxHull*.65, 0); const g0 = g.gold; T.run(40);
      out[k] = { gone: !!m.gone || g.ships.indexOf(m) < 0, struck: m.surrendered, squad: g.squad().length, gained: g.gold - g0 }; } g.setPolicy('plunder'); return out; });
  check('fleet: the standing order for prizes is obeyed (send in, take into the fleet, leave to the flagship)', r.send.gone && r.send.gained > 100 && r.keep.squad === 2 && r.leave.struck && r.leave.squad === 1 && r.leave.gained === 0, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); let pirates = 0, seen = 0; for (let i = 0; i < 240; i++){ for (let t = 0; t < 5; t += .05) g.update(.05); const n = g.ships.filter(s => s.owner === 'pirate' && Math.hypot(s.x - g.p.x, s.y - g.p.y) < 2500).length; pirates = Math.max(pirates, n); if (n) seen++; if (g.state !== 'play') break; }
    return { pirates, share: +(seen/240).toFixed(2), state: g.state, hunters: g.ships.filter(s => s.role === 'hunter').length }; });
  check('pirates: in twenty minutes at sea they appear, but never more than two and no hunters chase a captain at peace', r.pirates >= 1 && r.pirates <= 2 && r.hunters === 0, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.spawnRover(); const s = g.ships.find(o => o.role === 'rover'); s._t = true; return { cargo: s.cargo, goods: Object.keys(s.goods).length, far: Math.hypot(s.x - g.p.x, s.y - g.p.y) > 1100 }; });
  check('pirates: a rover carries plunder worth taking', r.cargo >= 350 && r.goods >= 1 && r.far, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.repute('es', -100); const m = T.foe('merchant', 'es', 'merchant', 0, 300); m.dest = g.ports.find(q => q.name === 'Cartagena'); const d0 = Math.hypot(m.x - g.p.x, m.y - g.p.y), h0 = g.p.hull; g.p.sail = 0; T.run(25);
    return { d0: Math.round(d0), d1: Math.round(Math.hypot(m.x - g.p.x, m.y - g.p.y)), hurt: h0 - g.p.hull, fired: m.rl[0] > 0 || m.rl[1] > 0 }; });
  check('merchants: an enemy merchantman runs and never fires', r.d1 > r.d0 + 400 && r.hurt === 0 && !r.fired, r);

  // ---------- port, through the real buttons ----------
  await ev(() => { const g = __sp; T.reset(); g.gold = 9000; g.p.hull = 60; g.p.sails = 70; g.hold.rum = 12; T.consort('brig', 0); T.consort('sloop', 1); g.spares.push({ name: 'Mary Pike', gun: 5, sea: 4 }); g.openPort(g.ports[0]); });
  const click = async sel => { await page.click(sel, { timeout: 4000 }); };
  let ok = true, why = '';
  try {
    await click('#rAll'); r = await ev(() => [__sp.p.hull, __sp.p.sails]); check('port: repair the fleet', r[0] === 100 && r[1] === 100, r);
    await click('[data-tab=market]'); await click('#sell_rum'); await click('#buy_cloth'); r = await ev(() => [__sp.hold.rum, __sp.hold.cloth]); check('port: market sells and buys', r[0] === 0 && r[1] === 10, r);
    await click('[data-tab=tavern]'); const c0 = await ev(() => __sp.p.crew); await ev(() => { __sp.p.crew = 40; }); await click('[data-tab=tavern]'); await click('#crew'); r = await ev(() => __sp.p.crew); check('port: tavern hires crew', r === 50, [c0, r]);
    const sp0 = await ev(() => __sp.spares.length); await click('#cap_0'); r = await ev(() => __sp.spares.length); check('port: tavern hires a captain', r === sp0 + 1, r);
    await click('[data-tab=governor]'); await click('#m_0'); r = await ev(() => __sp.mission && __sp.mission.type); check('port: governor gives a commission', !!r, r);
    await click('[data-tab=fleet]'); await page.fill('#shipNameIn', 'Test Queen'); await click('#shipNameBtn'); r = await ev(() => __sp.p.name); check('fleet screen: rename the flagship', r === 'Test Queen', r);
    await click('#fi_S0'); const gu = await ev(() => __sp.squad()[0].guns); await click('#up_guns'); await click('#ch'); await click('#cp'); await click('#ca_0');
    r = await ev(() => { const s = __sp.squad()[0]; return [s.guns, s.crew, s.cap.name]; }); check('fleet screen: refit, hire, transfer crew and appoint a captain for one ship', r[0] === gu + 1 && r[1] === 45 && r[2] === 'Mary Pike', r);
    const g0 = await ev(() => __sp.gold); await click('#fs'); r = await ev(() => [__sp.squad().length, __sp.gold]); check('fleet screen: sell a consort', r[0] === 1 && r[1] > g0, r);
    await click('#fi_S0'); await click('#fl'); r = await ev(() => [__sp.squad().length, __sp.laidUp.length]); check('fleet screen: lay a ship up at the home port', r[0] === 0 && r[1] === 1, r);
    await click('#fi_L0'); await click('#lr'); r = await ev(() => [__sp.squad().length, __sp.laidUp.length]); check('fleet screen: recall her', r[0] === 1 && r[1] === 0, r);
    const before = await ev(() => [__sp.p.cls, __sp.squad()[0].cls]); await click('#fg'); r = await ev(() => [__sp.p.cls, __sp.squad()[0].cls, __sp.squad().length]); check('fleet screen: hoist your flag in a consort', r[0] === before[1] && r[1] === before[0] && r[2] === 1, [before, r]);
    await click('#fleetClose'); await click('[data-tab=yard]'); await click('#y_brig'); r = await ev(() => __sp.p.cls); check('port: buy a ship at the yard', r === 'brig', r);
    await click('#leaveBtn'); r = await ev(() => { T.run(3); return [__sp.state, __sp.squad().length]; }); check('port: weigh anchor with the fleet intact', r[0] === 'play' && r[1] === 1, r);
  } catch (e){ ok = false; why = e.message.split('\n')[0]; }
  check('port: every button in the walkthrough was clickable', ok, why);

  for (const name of ['Kingston', 'Havana', 'Fort-Royal', 'Willemstad', 'Cap-Français', 'English Harbour', 'St Eustatius']){
    await ev(n => { const g = __sp; T.reset(); g.openPort(g.ports.find(q => q.name === n)); }, name); await page.waitForTimeout(250);
    const spots = await ev(() => { const c = document.getElementById('townCanvas').getBoundingClientRect(); return __sp.townSpots.map(s => [s.id, c.x + (s.x + s.w/2)/1640*c.width, c.y + (s.y + s.h/2)/560*c.height]); });
    const m = spots.find(s => s[0] === 'market'); if (m) await page.mouse.click(m[1], m[2]); await page.waitForTimeout(80);
    r = await ev(() => ({ tab: __sp.portTab, row: !!document.getElementById('buy_sugar') })); r.spots = spots.length; r.sel = true;
    check('town: ' + name + ' is painted with five places, and clicking the market opens it', r.spots === 5 && r.tab === 'market' && r.row && r.sel, r); await ev(() => __sp.closePort()); }
  r = await ev(() => { const g = __sp; T.reset(); g.openPort(g.ports[0]); let i = -1; while (i < 0){ g.makeOffers(g.ports[0]); i = g.offers.findIndex(o => o.type === 'deliver'); } g.accept(i); const t = g.mission.port, reward = g.mission.reward; g.closePort(); const g0 = g.gold; g.openPort(t); const done = !g.mission, paid = g.gold - g0; g.closePort(); return { done, paid, reward }; });
  check('commission: dispatches are paid on arrival', r.done && r.paid === r.reward, r);
  r = await ev(() => { const g = __sp; T.reset(); g.repute('es', -100); const hav = g.ports.find(q => q.name === 'Havana'); g.p.x = hav.ox; g.p.y = hav.oy; T.run(.2); return g.hostile('es'); });
  await page.keyboard.press('KeyF'); await page.waitForTimeout(150);
  check('nations: a hostile port refuses you and offers a boat attack or a raid instead', r && (await ev(() => { const g = __sp, ok = g.state === 'play' && !document.getElementById('ask').hidden && !!document.getElementById('sa_cut') && !!document.getElementById('sa_raid'); document.getElementById('sa_off').click(); return ok && document.getElementById('ask').hidden; })));
  await ev(() => { const g = __sp; g.gold = 5000; g.openPort(g.ports[0]); }); await page.click('[data-tab=governor]'); await page.click('#pardon');
  check('nations: a pardon ends the hostility', !(await ev(() => __sp.hostile('es')))); await ev(() => __sp.closePort());

  // ---------- saving ----------
  r = await ev(() => { const g = __sp; T.reset(); g.gold = 1234; g.hold.cocoa = 7; g.p.crew = 33; g.p.name = 'Saved Ship'; T.consort('brig', 0); g.setCourse(g.ports[3]); const okW = g.writeSlot('1'); g.gold = 1; g.hold.cocoa = 0;
    g.loadGame(g.readSlot('1')); const a = { okW, gold: g.gold, cocoa: g.hold.cocoa, crew: g.p.crew, name: g.p.name, squad: g.squad().length, course: g.course && g.course.name, state: g.state };
    const code = g.encode(g.snapshot()), d = g.decode(code); a.code = !!d && d.gold === 1234; a.garbage = g.decode('not a code') === null;
    const old = g.snapshot(); delete old.proj; old.deg = 400; old.p.x = 8460; old.p.y = 4200; g.loadGame(old); a.oldOnLand = g.isLand(g.p.x, g.p.y); return a; });
  check('saving: a slot restores gold, cargo, crew, name, fleet and course', r.okW && r.gold === 1234 && r.cocoa === 7 && r.crew === 33 && r.name === 'Saved Ship' && r.squad === 1 && r.course === 'Cap-Français' && r.state === 'play', r);
  check('saving: save codes round-trip and bad codes are refused', r.code && r.garbage, r);
  check('saving: a save from the smaller map loads in open water', r.oldOnLand === 0 || r.oldOnLand === false, r.oldOnLand);

  // ---------- course and helmsman ----------
  for (const dest of ['Santiago de Cuba', 'Cartagena', 'Nassau', 'Havana']){
    r = await ev(name => { const g = __sp; T.reset(); g.setCourse(g.ports.find(q => q.name === name)); let t = 0; while (g.course && t < 2400 && g.state === 'play'){ T.run(5); t += 5; }
      return { arrived: !g.course, t, hull: Math.round(g.p.hull), land: g.isLand(g.p.x, g.p.y), d: Math.round(Math.hypot(g.p.x - g.ports.find(q => q.name === name).ox, g.p.y - g.ports.find(q => q.name === name).oy)) }; }, dest);
    check('helmsman: Kingston to ' + dest + ' without grounding', r.arrived && r.hull >= 95 && !r.land, r);
  }

  // ---------- the world left to itself ----------
  r = await ev(() => { const g = __sp; T.reset(); g.openPort(g.ports[0]); const t0 = performance.now(); for (let i = 0; i < 12; i++) g.ashore(60);
    const S = g.ships; return { ms: Math.round(performance.now() - t0), n: S.length, merchants: S.filter(s => s.role === 'merchant').length, onLand: S.filter(s => g.isLand(s.x, s.y)).length, bad: T.bad(),
      stuck: S.filter(s => s.speed < 4 && s.sail > 0 && !s.surrendered && !s.fleet).length, wars: g.wars.length, fleet: !!g.fleet }; });
  check('world: twelve minutes unattended leaves no ship aground or broken', r.onLand === 0 && r.bad === 0 && r.n < 70 && r.merchants >= 10, r);
  check('world: few ships stuck', r.stuck <= 3, r.stuck);
  r = await ev(() => { const g = __sp; T.reset(); for (let i = 0; i < 60; i++) g.politics(); const own = {}; g.ports.forEach(q => { own[q.nk] = (own[q.nk] || 0) + 1; }); return { wars: g.wars.length, own }; });
  check('politics: after sixty events every nation still holds a port and someone is at war', r.wars >= 1 && ['en', 'es', 'fr', 'nl'].every(k => r.own[k] >= 1), r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const w = g.weather; w.kind = 'storm'; w.k = 1; g.p.sail = 1; T.run(15); const torn = g.p.sails; g.p.sails = 100; g.p.sail = .5; T.run(10); return { torn, reefed: g.p.sails }; });
  check('weather: a storm tears full sail but spares battle sails', r.torn < 95 && r.reefed === 100, r);
  r = await ev(() => { const g = __sp; T.reset(); T.consort('brig', 0); g.gold = 1000; const w = g.wageBill(); g.payWages(5); const paid = 1000 - g.gold; g.gold = 0; const c0 = g.p.crew; g.payWages(6); return { w, paid, deserted: c0 - g.p.crew, free: (() => { g.gold = 50; g.payWages(0); return g.gold; })() }; });
  check('wages: paid in full, desertion when broke, none in the first month', r.paid === r.w && r.deserted > 0 && r.free === 50, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.gold = 900; g.sink(g.p); T.run(4); return g.state; });
  check('flagship lost: you are offered a choice', r === 'fate', r);
  await page.click('#ft_boat'); r = await ev(() => { const g = __sp; return [g.state, g.p.cls, g.gold, g.p.crew, g.p.alive]; }); check('flagship lost: marooned in the longboat with a third of your gold', r[0] === 'play' && r[1] === 'boat' && r[2] === 300 && r[3] === 8 && r[4], r);
  r = await ev(() => { const g = __sp; T.run(8); g.wind.dir = g.p.h + .8; g.p.sail = 1; T.run(8); return [g.state, Math.round(g.p.speed)]; }); check('flagship lost: the longboat sails', r[0] === 'play' && r[1] > 30, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); g.sink(g.p); T.run(4); return g.state; }); await page.click('#ft_flag0');
  r = await ev(() => { const g = __sp; return [g.state, g.p.cls, g.squad().length]; }); check('flagship lost: shift your flag to a consort', r[0] === 'play' && r[1] === 'brig' && r[2] === 0, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.gold = 1000; g.repute('en', 200); g.sink(g.p); T.run(4); return g.state; });
  { let freed = false; for (let i = 0; i < 30 && !freed; i++){ if (await ev(() => __sp.state) !== 'fate'){ freed = true; break; } if (await page.$('#ft_en:not([disabled])')) await page.click('#ft_en'); else { await ev(() => __sp.openFate()); } }
    r = await ev(() => { const g = __sp; return [g.state, g.p.cls, g.gold, g.isLand(g.p.x, g.p.y)]; }); check('flagship lost: a friendly governor wins your release', r[0] === 'play' && r[1] === 'sloop' && r[2] <= 600 && !r[3], r); }
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.sink(g.p); T.run(4); return g.state; }); await page.click('#ft_end'); r = await ev(() => __sp.state);
  check('game over: ending the voyage from the choice', r === 'over', r);
  await page.click('#againBtn'); check('game over: sail again starts a new voyage', (await ev(() => __sp.state)) === 'play');

  // ---------- keyboard and screens in real time ----------
  const e0 = errCount();
  await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); g.wind.dir = g.wind.tDir = g.p.h + .8; });
  await page.keyboard.press('KeyW'); await page.keyboard.press('KeyW'); await page.keyboard.down('KeyD'); await page.waitForTimeout(900); await page.keyboard.up('KeyD');
  r = await ev(() => [__sp.p.sail, __sp.p.h]); check('keys: W makes sail and D turns', r[0] === 1 && r[1] > .1, r);
  await page.keyboard.press('KeyR'); r = await page.textContent('#shotBtn'); check('keys: R changes shot', r === 'Double shot', r);
  await page.keyboard.press('Space'); await page.waitForTimeout(400); check('keys: Space fires', (await ev(() => __sp.p.rl[0] > 0 && __sp.p.rl[1] > 0)));
  await page.keyboard.press('KeyG'); await page.keyboard.press('KeyH'); r = [await page.textContent('#formBtn'), await page.textContent('#orderBtn')]; check('keys: G and H change formation and orders', r[0] === 'Line abreast' && r[1] === 'Engage at will', r);
  await page.keyboard.press('KeyP'); const c1 = await ev(() => __sp.clock); await page.waitForTimeout(500); r = await ev(() => [__sp.paused, __sp.clock]); check('keys: P pauses the sea', r[0] && r[1] === c1, r); await page.keyboard.press('KeyP');
  for (const [key, id] of [['KeyI', 'manifest'], ['KeyV', 'fleetSheet'], ['Escape', 'menu']]){ await page.keyboard.press(key); await page.waitForTimeout(150); const open = await ev(i => !document.getElementById(i).hidden, id); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    const shut = await ev(i => document.getElementById(i).hidden, id); check('keys: ' + key + ' opens and Escape closes the ' + id + ' screen', open && shut, [open, shut]); }
  for (let i = 0; i < 14; i++) await page.keyboard.press('Minus'); await page.waitForTimeout(700); r = await ev(() => [__sp.zoom, __sp.scale]); check('zoom: the view zooms far out', r[0] <= .31 && r[1] < .55, r);
  for (let i = 0; i < 9; i++) await page.keyboard.press('Equal');
  await page.keyboard.press('KeyC'); await page.waitForTimeout(1500); r = await ev(() => __sp.chartOpen); await page.mouse.wheel(0, -400); await page.waitForTimeout(200);
  await page.mouse.move(640, 400); await page.mouse.down(); await page.mouse.move(700, 430, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(100);
  check('chart: opens, zooms and drags without closing', r && (await ev(() => __sp.chartOpen)));
  await page.click('#czIn'); await page.keyboard.press('Equal'); await page.keyboard.press('ArrowLeft'); check('chart: zoom buttons and keys leave it open', await ev(() => __sp.chartOpen));
  await page.keyboard.press('Escape'); await page.waitForTimeout(100); await page.keyboard.press('KeyC'); await page.waitForTimeout(300);
  const z0 = await ev(() => __sp.chartZ); for (let i = 0; i < 5; i++) await page.click('#czOut'); r = await ev(() => { const g = __sp, m = g.chartRect(); return { z1: g.chartZ, clear: m.y >= g.flagsEnd }; });
  check('chart: opens zoomed in on your own waters and zooms out to the whole', z0 === 3 && r.z1 === 1, [z0, r]); check('small chart: sits clear of the compass and the flags', r.clear, r);
  const pt = await ev(() => { const g = __sp, q = g.ports.find(q => q.name === 'Cartagena'), aw = innerWidth - 32, ah = innerHeight - 14 - 12 - 62, k = Math.min(aw/g.W, ah/g.H), w = Math.min(aw, g.W*k), h = Math.min(ah, g.H*k); return [16 + (aw - w)/2 + q.x*k, 14 + (ah - h)/2 + q.y*k]; });
  await page.mouse.click(pt[0], pt[1]); await page.waitForTimeout(200); r = await ev(() => [__sp.course && __sp.course.name, __sp.autoHelm, __sp.chartOpen]); check('chart: clicking a port sets a course', r[0] === 'Cartagena' && r[1] && !r[2], r);
  await page.keyboard.down('KeyA'); await page.waitForTimeout(300); await page.keyboard.up('KeyA'); r = await ev(() => [__sp.autoHelm, !!__sp.course]); check('helmsman: touching the helm takes over but keeps the course', !r[0] && r[1], r);
  // a fight at night in a storm, then fog: nothing may throw while drawing
  await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); T.consort('sloop', 1); const a = T.foe('brig', 'pirate', 'hunter', 60, 240), b = T.foe('frigate', 'es', 'hunter', -80, -260); g.struck(a); g.clock = 300*.62; const w = g.weather; w.kind = 'storm'; w.k = 1; g.p.sail = .5; });
  for (let i = 0; i < 8; i++){ await page.keyboard.press('Space'); await page.waitForTimeout(600); }
  await ev(() => { const w = __sp.weather; w.kind = 'fog'; w.k = 1; }); await page.waitForTimeout(1200);
  const hit = await ev(() => { const g = __sp, a = g.ships.find(s => s._t && s.sinking == null); if (!a) return null; return [innerWidth/2 + (a.x - g.p.x - Math.cos(g.p.h)*30)*1.63, innerHeight/2 + (a.y - g.p.y - Math.sin(g.p.h)*30)*1.63]; });
  if (hit && hit[0] > 250 && hit[0] < 1100 && hit[1] > 90 && hit[1] < 640){ await page.mouse.click(hit[0], hit[1]); await page.waitForTimeout(150); check('targets: clicking an enemy names her the fleet\'s target', !!(await ev(() => __sp.fleetTarget))); }
  check('drawing: a night action in storm and fog raises no errors', errCount() === e0, errors.slice(e0));

  // ---------- the 1750s ----------
  r = await ev(() => { const g = __sp; g.setDiff('normal'); g.newGame(); const a = { date: g.date, wars0: g.wars.length }; g.setCal(76); g.calendarTick(); a.w1756 = g.wars.slice(); g.setCal(144); g.calendarTick(); a.w1762 = g.wars.length;
    g.setCal(151); g.calendarTick(); a.havana = g.ports.find(q => q.name === 'Havana').nk; g.setMarque('en'); g.setCal(157); g.calendarTick(); a.peace = g.wars.length; a.back = g.ports.find(q => q.name === 'Havana').nk; a.marque = g.marque; return a; });
  check('calendar: a voyage begins in January 1756, at peace', r.date === 'January 1756' && r.wars0 === 0, r);
  check('calendar: Britain and France go to war in May 1756 and Spain joins in 1762', r.w1756.length === 1 && r.w1756[0] === 'en-fr' && r.w1762 === 2, r);
  check('calendar: Havana falls in 1762 and is handed back at the peace, which voids letters of marque', r.havana === 'en' && r.back === 'es' && r.peace === 0 && r.marque === null, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const m = T.foe('merchant', 'nl', 'merchant', 0, 150), s0 = Object.assign({}, g.standing); g.fire(g.p, 1); T.run(1.5); return { nl: g.standing.nl - s0.nl, en: g.standing.en - s0.en, fr: g.standing.fr - s0.fr }; });
  check('piracy: firing on a neutral without a commission is marked by every nation', r.nl < 0 && r.en < 0 && r.fr < 0, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const a = T.foe('brig', 'fr', 'patrol', 0, 150), b = T.foe('brig', 'nl', 'patrol', 0, -150), g0 = g.gold; const n1 = g.sendIn(a, 1), due = g.courtDue, n2 = g.sendIn(b, 1), quiet = g.gold - g0;
    g.openPort(g.ports[0]); const paid = g.gold - g0 - quiet; g.closePort(); return { lawA: g.lawful(a), lawB: g.lawful(b), due, quiet, paid, left: g.courtDue }; });
  check('prize court: a lawful prize is condemned for more and paid at a friendly port; an unlawful one sells cheap', r.lawA && !r.lawB && r.due > r.quiet*2 && r.paid === r.due && r.left === 0, r);
  await ev(() => { const g = __sp; T.reset(); g.gold = 500; g.openPort(g.ports[0]); }); await page.click('[data-tab=governor]'); await page.click('#marque');
  r = await ev(() => { const g = __sp, a = { m: g.marque, gold: g.gold }; g.closePort(); return a; });
  check('governor: a letter of marque is bought in wartime', r.m === 'en' && r.gold === 350, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.foe('frigate', 'fr', 'patrol', 0, 150), b = T.foe('frigate', 'fr', 'patrol', 0, -150); a.h = g.p.h + Math.PI/2; b.h = g.p.h;
    g.strike({ a: g.p.h + Math.PI/2, x: a.x, y: a.y }, a, 8, 1, 1); g.strike({ a: g.p.h - Math.PI/2, x: b.x, y: b.y }, b, 8, 1, 1); const c = T.foe('frigate', 'fr', 'patrol', 300, 0); c.h = g.p.h + Math.PI/2; g.strike({ a: g.p.h, dbl: true, x: c.x, y: c.y }, c, 8, 1, 1);
    return { raked: a.maxHull - a.hull, beam: b.maxHull - b.hull, flag: a.raked === 1 && !b.raked, dbl: c.maxHull - c.hull }; });
  check('raking: shot down the length of her deck does far more harm than a beam hit', r.raked > r.beam*1.6 && r.flag && r.dbl > r.beam*1.6, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.toggleShot(); const kind = document.getElementById('shotBtn').textContent; const far = T.foe('merchant', 'es', 'merchant', 0, 230), near = T.foe('merchant', 'es', 'merchant', 0, -120); g.fire(g.p, 1); g.fire(g.p, -1); const rl = g.p.rl[1]; T.run(1.5);
    g.toggleShot(); g.toggleShot(); g.toggleShot(); return { kind, far: far.maxHull - far.hull, near: near.maxHull - near.hull, rl, back: document.getElementById('shotBtn').textContent }; });
  check('double shot: short range, heavy damage, slow to load', r.kind === 'Double shot' && r.far === 0 && r.near > 20 && r.rl > 4.5 && r.back === 'Round shot', r);
  r = await ev(() => { const g = __sp, C = g.classes; T.reset(); g.gold = 99999; g.openPort(g.ports.find(q => q.name === 'Kingston')); const k = !!document.getElementById('y_seventyfour'), f = !!document.getElementById('y_frigate'); g.closePort();
    g.openPort(g.ports.find(q => q.name === 'English Harbour')); const e = !!document.getElementById('y_seventyfour'); document.getElementById('y_seventyfour').click(); const cls = g.p.cls, guns = g.p.guns; g.closePort();
    return { k, f, e, cls, guns, galleon: !!C.galleon, names: [['sloop', 'en', 'patrol'], ['merchant', 'en', 'merchant'], ['fifty', 'es', 'treasure']].map(v => { const q = g.mk(v[0], v[1], v[2], g.p.x, g.p.y, 0); q.gone = true; return q.t.name; }) }; });
  check('ships: seventy-fours are sold only at a royal dockyard; the galleon is gone', !r.k && r.f && r.e && r.cls === 'seventyfour' && r.guns === 15 && !r.galleon, r);
  check('ships: period names for sloops of war, West Indiamen and plate ships', r.names[0] === 'British sloop of war' && r.names[1] === 'British West Indiaman' && r.names[2] === 'Spanish plate ship', r);
  r = await ev(() => { const g = __sp; g.setDiff('normal'); g.newGame(); const n = g.ports.map(q => q.name), tr = g.ships.filter(s => s.role === 'treasure'), ve = g.ports.find(q => q.name === 'Veracruz'), ha = g.ports.find(q => q.name === 'Havana');
    const near = tr.every(s => Math.min(Math.hypot(s.x - ve.ox, s.y - ve.oy), Math.hypot(s.x - ha.ox, s.y - ha.oy)) < 600), esc = g.ships.filter(s => s.role === 'escort').map(s => s.cls);
    return { n: n.length, has: ['Kingston', 'Cap-Français', 'Port-au-Prince', 'English Harbour', 'St Eustatius'].every(x => n.indexOf(x) >= 0), old: n.indexOf('Tortuga') >= 0 || n.indexOf('Port Royal') >= 0, tr: tr.length, near, esc, goods: g.goodsKeys.length }; });
  check('ports: the 1750s towns are on the chart and the buccaneer havens are gone', r.n === 108 && r.has && !r.old, r);
  check('plate fleet: two plate ships sail between Veracruz and Havana under a frigate escort', r.tr === 2 && r.near && r.esc.indexOf('frigate') >= 0, r);
  check('goods: coffee, indigo and molasses are traded', r.goods === 12, r);
  r = await ev(() => { const g = __sp; T.reset(); const st = g.ports.find(q => q.name === 'St Eustatius'), ha = g.ports.find(q => q.name === 'Havana'), ki = g.ports[0]; g.standing.nl = -60; g.p.x = st.ox; g.p.y = st.oy; g.update(.01); g.tap('dock'); const free = g.state === 'port'; if (free) g.closePort();
    return { free, smug: g.price(ha, 'cloth') > g.price(ki, 'cloth')*2 }; });
  check('free port: St Eustatius trades with anyone, and cloth smuggled into Havana pays double', r.free && r.smug, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); g.p.sail = 1; g.startHurricane(); const warn = g.hurr && g.hurr.stage === 0; T.run(45); const on = !!g.weather.hur; g.p.hull = g.p.maxHull; g.p.sails = 100; g.p.sail = 1; T.run(12); const full = { hull: g.p.maxHull - g.p.hull, sails: 100 - g.p.sails };
    g.p.sail = 0; g.p.hull = g.p.maxHull; T.run(12); const bare = g.p.maxHull - g.p.hull; g.p.hull = g.p.maxHull; T.run(90); return { warn, on, full, bare, over: !g.hurr && !g.weather.hur, alive: g.p.alive, squad: g.squad().length }; });
  check('hurricane: a warning, then a blow that punishes full sail far more than bare poles, then it passes', r.warn && r.on && r.full.hull > r.bare*3 && r.full.sails > 20 && r.over && r.squad === 1, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('frigate', 0); const s = g.squad()[0], f = T.foe('merchant', 'fr', 'merchant', 1300, 0); f.announced = true; f.hitByPlayer = true; f.sails = 20; g.setOrders('chase'); const d0 = Math.hypot(f.x - s.x, f.y - s.y); T.run(30); return { d0, d1: Math.hypot(f.x - s.x, f.y - s.y), ord: document.getElementById('orderBtn').textContent }; });
  check('general chase: consorts break the line to run down a distant enemy', r.ord === 'General chase' && r.d1 < r.d0 - 300, r);
  r = await ev(() => { const g = __sp; T.reset(); const d = g.snapshot(); d.cls = 'galleon'; d.home = 'Port Royal'; delete d.cal0; d.wars = ['es-nl']; g.loadGame(d); const a = { cls: g.p.cls, home: g.home, wars: g.wars.length }; T.reset(); g.setMarque('en'); g.setCal(100); const e = g.snapshot(); g.loadGame(e); a.cal = g.cal; a.m = g.marque; return a; });
  check('saving: old saves are brought into the 1750s, and new ones keep the date and the commission', r.cls === 'fifty' && r.home === 'Kingston' && r.wars === 0 && r.cal === 100 && r.m === 'en', r);

  // ---------- the second 1750s round ----------
  r = await ev(() => { const g = __sp; g.setDiff('normal'); g.newGame(); const n = g.ports.map(q => q.name), a = { has: n.indexOf('Basse-Terre') >= 0 && n.indexOf('Saint-Pierre') >= 0, rate: [g.classes.frigate.rate, g.classes.seventyfour.rate] };
    g.setCal(76); g.calendarTick(); a.gz = g.gazette[0]; g.setCal(112); g.calendarTick(); a.guad = g.ports.find(q => q.name === 'Basse-Terre').nk; g.setCal(157); g.calendarTick(); a.back = g.ports.find(q => q.name === 'Basse-Terre').nk;
    const c = document.createElement('canvas').getContext('2d'); ['en', 'es', 'fr', 'nl', 'pirate'].forEach((k, i) => g.flagRect(c, k, i*30, 0, 24, 15)); ['en', 'es', 'fr', 'nl'].forEach(k => g.drawEnsign(c, k, [[0, 0], [5, 1], [10, 0], [15, -1], [20, 0]], 7)); return a; });
  check('ports: Basse-Terre and Saint-Pierre are on the chart; Guadeloupe falls in 1759 and returns at the peace', r.has && r.guad === 'en' && r.back === 'fr', r);
  check('ratings: ships carry their real rating', r.rate[0] === 28 && r.rate[1] === 74, r);
  check('gazette: news is kept with the date it happened', r.gz && r.gz.d === 'May 1756' && /War!/.test(r.gz.t), r);
  await ev(() => { const g = __sp; T.reset(); g.openPaper('gazette'); }); r = await ev(() => !document.getElementById('paper').hidden && /Gazette/.test(document.querySelector('#paper .mast').textContent)); await page.keyboard.press('KeyJ');
  check('gazette: opens as a broadsheet and J folds it away', r && await ev(() => document.getElementById('paper').hidden && !__sp.menuOpen), r);
  await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const a = T.foe('brig', 'fr', 'patrol', 0, 150); g.sendIn(a, 1); a.gone = true; g.openPort(g.ports[0]); }); await page.waitForTimeout(600);
  r = await ev(() => ({ open: !document.getElementById('paper').hidden, court: /Vice-Admiralty/.test(document.getElementById('paperBody').textContent), rows: document.querySelectorAll('#paper .prow').length })); await page.click('#paperClose');
  check('prize court: the condemnation is read out on a sheet listing each hull', r.open && r.court && r.rows === 2 && await ev(() => { const ok = document.getElementById('paper').hidden && __sp.state === 'port'; __sp.closePort(); return ok; }), r);
  r = await ev(() => { const g = __sp; T.reset(); let i = -1, n = 0; while (i < 0 && n++ < 400){ g.makeOffers(g.ports[0]); i = g.offers.findIndex(o => o.type === 'away'); } if (i < 0) return { found: false }; g.accept(i); const m = g.mission, g0 = g.gold, name = m.name, land = g.isLand(m.x, m.y); const d = g.snapshot(); g.loadGame(d); const kept = g.mission && g.mission.type === 'away'; T.clear(4000);
    g.p.x = g.mission.x + 100; g.p.y = g.mission.y + 60; T.run(.2); return { found: true, name, land, kept, done: !g.mission, paid: g.gold - g0 }; });
  check('dispatches: letters for a place off the chart are handed to the packet at its edge, and survive a save', r.found && r.name === 'Falmouth' && !r.land && r.kept && r.done && r.paid > 200, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.repute('fr', -100); const a = T.foe('frigate', 'fr', 'hunter', 700, 0); T.run(2); const rk = a.raking; const b = T.foe('merchant', 'fr', 'merchant', 0, -2500); g.convoy(b, g.ports[3]); const co = g.ships.filter(s => s.lead === b), esc = co.filter(s => s.role === 'escort').length; a.gone = true; b.dest = g.ports[3];
    co.forEach(s => { s._t = true; }); for (let k = 0; k < 6; k++){ T.clear(5000); T.run(5); } return { rk, n: co.length, esc, near: co.filter(s => s.sinking == null && Math.hypot(s.x - b.x, s.y - b.y) < 700).length }; });
  check('enemy captains steer for your bow or stern, from windward', r.rk === true, r);
  check('convoys: merchantmen sail in company under escort and keep station', r.n >= 3 && r.esc >= 1 && r.near === r.n, r);
  r = await ev(() => { const g = __sp; T.reset(); const ha = g.ports.find(q => q.name === 'Havana'); g.p.x = ha.ox + 500; g.p.y = ha.oy - 900; T.clear(3000); g.hold.cloth = 10; g.gold = 500; T.foe('sloop', 'es', 'patrol', 0, 200); T.run(1); const asked = !document.getElementById('ask').hidden; if (asked) document.getElementById('c_submit').click();
    return { asked, cloth: g.hold.cloth, gold: g.gold, closed: document.getElementById('ask').hidden && !g.menuOpen }; });
  check('customs: a guarda-costa searches a smuggler in Spanish waters; submitting costs the cloth and a fine', r.asked && r.cloth === 0 && r.gold === 500 - 80 && r.closed, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const n = T.foe('merchant', 'nl', 'merchant', 0, 70), g0 = g.gold; g.setRnd(() => .1); let asked, took; try { asked = g.searchable() === n; g.grapple(); took = !document.getElementById('ask').hidden; if (took) document.getElementById('s_take').click(); } finally { g.seed(99); }
    return { asked, took, searched: n.searched, gained: g.gold - g0, again: g.searchable() === null, nl: g.standing.nl, svc: g.navy.pts }; });
  check('stop and search: a privateer may take enemy cargo out of a neutral, at the cost of her goodwill', r.asked && r.took && r.searched && r.gained > 60 && r.again && r.nl < 0 && r.svc === 1, r);
  await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const f = T.foe('frigate', 'fr', 'patrol', 0, 80); g.capture(f); g.settlePrize('loot'); g.svc(20); g.gold = 0; g.openPort(g.ports[0]); }); await page.click('[data-tab=governor]');
  r = await ev(() => ({ cap: __sp.captives.fr, pts: __sp.navy.pts })); await page.click('#pow_fr'); const afterPow = await ev(() => __sp.gold); await page.click('#promote'); await page.click('#promote');
  const nv = await ev(() => { const g = __sp, a = { rank: g.navy.rank, gold: g.gold, cap: g.captives.fr, y74: (document.querySelector('[data-tab=yard]').click(), !!document.getElementById('y_seventyfour')) }; g.closePort(); g.update(.01); g.hud && 0; a.label = document.getElementById('rank').textContent; return a; });
  check('prisoners: captured officers are handed to the governor for head money', r.cap === 2 && afterPow === 220 && nv.cap === 0, [r, afterPow, nv]);
  check('career: lawful service earns promotion, bounties and dockyard rights', r.pts >= 20 && nv.rank === 2 && nv.gold === 220 + 400 + 800 && nv.y74, [r, nv]);
  r = await ev(() => { const g = __sp; T.reset(); g.setMarque('en'); g.setCal(100); g.makeOffers(g.ports[0]); const i = g.offers.findIndex(o => o.type === 'siege'); if (i < 0) return { found: false }; g.accept(i); const cf = g.ports.find(q => q.name === 'Cap-Français'), g0 = g.gold; const d = g.snapshot(); g.loadGame(d); const kept = g.mission && g.mission.type === 'siege' && g.mission.port === cf;
    g.p.x = cf.ox + 300; g.p.y = cf.oy - 500; T.clear(3000); for (let k = 0; k < 3; k++){ const f = T.foe('sloop', 'fr', 'patrol', 0, 120); f.hitByPlayer = true; g.damage(f, 9999, 0); } return { found: true, kept, done: !g.mission, paid: g.gold - g0, svc: g.navy.pts }; });
  check('set pieces: the blockade of Cap-Français is offered in wartime and counts ships sunk off the port', r.found && r.kept && r.done && r.paid >= 1200 && r.svc >= 5, r);
  r = await ev(() => { const g = __sp; T.reset(); g.setMarque('en'); g.setCal(143); const eh = g.ports.find(q => q.name === 'English Harbour'); g.openPort(eh); g.makeOffers(eh); const i = g.offers.findIndex(o => o.type === 'escort'); if (i < 0) return { found: false }; g.accept(i); g.closePort(); const m = g.mission, n = m.ships.length, g0 = g.gold, fr = g.ports.find(q => q.name === 'Fort-Royal');
    m.ships.slice(0, 2).forEach(t => { t.x = fr.ox + 60; t.y = fr.oy + 30; }); T.run(3); return { found: true, n, done: !g.mission, paid: g.gold - g0 }; });
  check('set pieces: the Martinique convoy pays when two transports reach Fort-Royal', r.found && r.n === 3 && r.done && r.paid >= 1500, r);
  r = await ev(() => { const g = __sp; T.reset(); g.gold = 5000; g.openPort(g.ports[0]); g.retire(); const a = { state: g.state, title: document.getElementById('overTitle').textContent, text: document.getElementById('overText').textContent, shown: !document.getElementById('over').hidden }; document.getElementById('againBtn').click(); a.after = g.state; return a; });
  check('retirement: coming ashore ends the voyage with a reckoning', r.state === 'over' && r.title === 'Swallowing the anchor' && /fortune came to \d+ gold/.test(r.text) && r.shown && r.after === 'play', r);
  r = await ev(() => { const g = __sp; T.reset('easy'); g.setWars([]); g.setCalm(false); T.consort('brig', 0); T.consort('sloop', 1); const stops = ['Havana', 'Cartagena', 'Bridgetown', 'Kingston']; let i = 0, t = 0, bad = 0, seenWar = 0, hurr = 0;
    while (g.cal < 158 && t < 9500){ ['en', 'es', 'fr', 'nl'].forEach(k => { g.standing[k] = 60; }); if (!g.course && g.state === 'play') g.setCourse(g.ports.find(q => q.name === stops[i++ % 4]));
      for (let k = 0; k < 500; k++) g.update(.1); t += 50; g.p.hull = g.p.maxHull; g.p.sails = 100; g.gold = 5000; seenWar = Math.max(seenWar, g.wars.length); if (g.hurr) hurr++; if (g.menuOpen) g.closeMenu(); if (g.state === 'prize') g.settlePrize('loot'); if (g.state !== 'play') break; bad += T.bad(); }
    return { cal: g.cal, t, state: g.state, bad, seenWar, wars: g.wars.length, squad: g.squad().length, legs: i, hurr, gaz: g.gazette.length }; });
  check('long voyage: seven years under way with a fleet, through both declarations of war, hurricanes and the peace', r.cal >= 158 && r.state === 'play' && r.bad === 0 && r.seenWar === 2 && r.wars === 0 && r.legs >= 4 && r.gaz >= 8, r);

  // ---------- the wider world ----------
  r = await ev(() => { const g = __sp; g.setDiff('normal'); g.newGame(); const P = n => g.ports.find(q => q.name === n), k = P('Kingston'), names = ['Louisbourg', 'Halifax', 'Boston', 'Newport', 'New York', 'Philadelphia', 'Norfolk', 'Charleston', 'St Augustine', "St George's", 'New Orleans', 'Charlotte Amalie', 'Monte Cristi'];
    const reach = names.every(n => { const q = P(n); return q && g.findPath(k.ox, k.oy, q.ox, q.oy).length > 3; }), lat = q => 47.2 - q.y/g.DEG;
    return { reach, north: lat(P('Louisbourg')) > 45 && lat(P('Boston')) > 42, dk: P('Charlotte Amalie').nk === 'dk' && g.standing.dk != null, land: g.ports.filter(q => q.spec.land).length, big: g.ports.filter(q => q.spec.sz >= 3).length, goods: ['fish', 'flour', 'rice', 'naval'].every(x => g.goodsKeys.indexOf(x) >= 0) }; });
  check('map: the coast runs north to Louisbourg and every new port can be reached by sea from Kingston', r.reach && r.north, r);
  check('ports: cities, towns and dozens of landings, with Denmark as a fifth flag', r.dk && r.land >= 40 && r.big >= 9 && r.goods, r);
  r = await ev(() => { const g = __sp, out = {}; for (const n of ['Kingston', 'Charleston', 'New York', 'Boston']){ g.setStart(n); g.newGame(); const q = g.ports.find(q => q.name === n); out[n] = g.home === n && Math.hypot(g.p.x - q.ox, g.p.y - q.oy) < 5; } g.setStart('Kingston'); return out; });
  check('start: a voyage can begin from Kingston, Charleston, New York or Boston', r.Kingston && r.Charleston && r['New York'] && r.Boston, r);
  r = await ev(() => { const g = __sp; T.reset(); g.repute('en', -100); const q = g.ports.find(q => q.name === 'Port Antonio'), k = g.ports[0]; g.p.x = q.ox; g.p.y = q.oy; g.update(.01); g.tap('dock'); const open = g.state === 'port', offers = g.offers.length; let ships = false, marq = false;
    if (open){ ships = !!document.getElementById('y_brig'); document.querySelector('[data-tab=governor]').click(); marq = !!document.getElementById('marque'); document.querySelector('[data-tab=market]').click(); } const rows = document.querySelectorAll('#ledger [id^=buy_]').length; if (open) g.closePort();
    g.p.x = k.ox; g.p.y = k.oy; g.update(.01); g.tap('dock'); const shut = g.state === 'play' && !document.getElementById('ask').hidden; g.closeMenu(); return { open, offers, ships, marq, rows, shut }; });
  check('landings: open to anyone, with a short market and no governor, yard or letters of marque', r.open && r.offers === 0 && !r.ships && !r.marq && r.rows >= 1 && r.rows <= 4 && r.shut, r);
  r = await ev(() => { const g = __sp; T.reset(); const x = g.X(-79.65), y = g.Y(27.4); g.p.x = x; g.p.y = y; g.p.sail = 0; g.p.speed = 0; T.clear(3000); T.run(20); const drift = y - g.p.y; return { drift, in: !!g.streamAt(x, y), out: g.streamAt(g.X(-70), g.Y(27)) === null }; });
  check('Gulf Stream: a ship lying to off Florida is set to the north', r.in && r.out && r.drift > 250, r);
  r = await ev(() => { const g = __sp, out = {}; T.reset(); for (const at of [['Boston'], ['Kingston'], [null, -66, 30]]){ const q = at[0] && g.ports.find(q => q.name === at[0]); g.p.x = q ? q.ox : g.X(at[1]); g.p.y = q ? q.oy : g.Y(at[2]); g.p.sail = 0; for (let i = 0; i < 1800; i++) g.update(.05);
      const S = g.ships; out[at[0] || 'ocean'] = { near: S.filter(s => Math.hypot(s.x - g.p.x, s.y - g.p.y) < 3500).length, far: S.filter(s => Math.abs(s.x - g.p.x) > 8700 && (s.role === 'merchant' || s.role === 'patrol')).length, fish: S.filter(s => s.role === 'fisher').length, coast: S.filter(s => s.coaster).length, total: S.length }; } out.bad = T.bad(); return out; });
  check('traffic: busy off the great ports, thin in mid-ocean, and nothing kept beyond the horizon', r.Boston.near >= 10 && r.Kingston.near >= 10 && r.ocean.near <= 8 && r.Boston.far === 0 && r.ocean.far === 0 && r.Boston.fish >= 2 && r.Boston.coast + r.Kingston.coast >= 2 && r.Boston.total < 80 && r.bad === 0, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.setMarque('en'); const f = T.foe('bermuda', 'fr', 'merchant', 0, 80); f.packet = true; const g0 = g.gold; g.capture(f); g.settlePrize('loot'); return { gained: g.gold - g0, svc: g.navy.pts }; });
  check('packets: taking an enemy packet yields her dispatches', r.gained >= 150 && r.svc >= 2, r);
  r = await ev(() => { const g = __sp; g.setDiff('normal'); g.newGame(); g.setCal(102); g.calendarTick(); const a = g.ports.find(q => q.name === 'Louisbourg').nk; g.setCal(157); g.calendarTick(); return { a, fl: g.ports.find(q => q.name === 'St Augustine').nk, no: g.ports.find(q => q.name === 'New Orleans').nk, lb: g.ports.find(q => q.name === 'Louisbourg').nk }; });
  check('history: Louisbourg falls in 1758; at the peace Florida goes to Britain and Louisiana to Spain', r.a === 'en' && r.fl === 'en' && r.no === 'es' && r.lb === 'en', r);

  // ---------- chart in port, fleet on the chart, harbour pace ----------
  await ev(() => { const g = __sp; T.reset(); g.setPace(2); g.openPort(g.ports[0]); }); r = { slow: await ev(() => __sp.pace) }; await page.click('#portChart'); await page.waitForTimeout(150);
  r.open = await ev(() => ({ chart: __sp.chartOpen, port: document.getElementById('port').hidden, state: __sp.state })); await page.keyboard.press('Equal'); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  r.shut = await ev(() => ({ chart: __sp.chartOpen, port: document.getElementById('port').hidden, state: __sp.state })); await page.keyboard.press('KeyC'); await page.waitForTimeout(100); r.key = await ev(() => __sp.chartOpen);
  const cz = await ev(() => { const g = __sp, q = g.ports.find(q => q.name === 'Port Antonio'), aw = innerWidth - 32, ah = innerHeight - 14 - 12 - 62; return q.name; }); await page.keyboard.press('Escape');
  r.back = await ev(() => { const g = __sp; g.closePort(); return { pace: g.pace, state: g.state, chart: g.chartOpen }; });
  check('port: the chart can be opened and put away without weighing anchor', r.open.chart && r.open.port && r.open.state === 'port' && !r.shut.chart && !r.shut.port && r.shut.state === 'port' && r.key, r);
  check('port: the world goes by at the slow pace in harbour, and your sailing pace returns when you weigh', r.slow === 0 && r.back.pace === 2 && r.back.state === 'play' && !r.back.chart, r);
  await ev(() => { const g = __sp; T.reset(); T.sea(); const s = T.consort('brig', 0); s.x += 2400; s.y -= 1800; g.openFleet('S0'); }); await page.waitForTimeout(150);
  r = await ev(() => { const g = __sp, s = g.squad()[0]; return { text: g.whereIs(s), flag: g.whereIs(g.p), row: !!document.getElementById('fc') }; }); await page.click('#fc'); await page.waitForTimeout(200);
  const fm = await ev(() => { const g = __sp, a = { chart: g.chartOpen, mark: g.chartMark === g.squad()[0], sheet: document.getElementById('fleetSheet').hidden }; g.setChart(false); a.cleared = g.chartMark === null; return a; });
  check('fleet: each ship says where she lies, and her card opens the chart upon her', /leagues north-east of the flagship/.test(r.text) && /^Your flagship lies/.test(r.flag) && r.row && fm.chart && fm.mark && fm.sheet && fm.cleared, [r, fm]);

  // ---------- captains who think for themselves ----------
  r = await ev(() => { const g = __sp; T.reset(); const s = T.consort('brig', 0), q = g.ports.find(q => q.name === 'Port Antonio'); s.x = q.ox + 500; s.y = q.oy - 300; s.hull = s.maxHull*.25; g.gold = 1000; s.doc.allow = 0; T.clear(3000); let t = 0; while (!s.docked && t < 300){ T.run(2); t += 2; }
    const in1 = !!s.docked, word = g.taskWord(s), d0 = g.dispatches.slice(), ask = d0.find(v => v.ask === 'repair'), cost = g.repairCost(s); const foe = T.foe('frigate', 'pirate', 'hunter', 0, 0); foe.x = s.x + 150; foe.y = s.y; const h0 = s.hull; T.run(8); const safe = s.hull === h0; foe.gone = true;
    g.openPaper('dispatches'); const btn = document.querySelector('[id^=dp_back]'); const had = !!btn; if (btn) btn.click(); g.closeMenu(); return { in1, word, broke: d0.some(v => /breaking off/.test(v.t)), ask: !!ask, cost, safe, had, paid: 1000 - g.gold, hull: Math.round(s.hull/s.maxHull*100), out: !s.docked, task: s.task.type, unread: g.dispNew }; });
  check('captains: a damaged consort breaks off, goes into port and lies safe from attack', r.in1 && /^In port at/.test(r.word) && r.broke && r.safe, r);
  check('dispatches: her captain writes for leave to repair, and paying sends her back to sea', r.ask && r.had && r.paid === r.cost && r.hull === 100 && r.out && r.unread === 0, r);
  r = await ev(() => { const g = __sp; T.reset(); const s = T.consort('brig', 0), q = g.ports.find(q => q.name === 'Port Antonio'); s.x = q.ox + 400; s.y = q.oy - 300; s.hull = s.maxHull*.3; g.gold = 1000; s.doc.allow = 400; s.doc.after = 'join'; T.clear(3000); let t = 0; while (!(s.hull === s.maxHull) && t < 300){ T.run(2); t += 2; }
    return { mended: s.hull === s.maxHull, paid: 1000 - g.gold, task: s.task.type, asked: g.dispatches.some(v => v.ask) }; });
  check('allowance: within her allowance the captain repairs without asking and carries on', r.mended && r.paid > 50 && r.task === 'fleet' && !r.asked, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const a = T.consort('brig', 0), b = T.consort('sloop', 1); a.cap.sea = 5; b.cap.sea = 1; a.doc.wx = b.doc.wx = 'ride'; g.startHurricane(); T.run(3); const early = [a.sailCap, b.sailCap]; T.run(45); const late = [a.sailCap, b.sailCap];
    T.reset(); const c = T.consort('brig', 0), q = g.ports.find(q => q.name === 'Port Antonio'); c.cap.sea = 4; c.x = q.ox + 700; c.y = q.oy - 400; T.clear(3000); g.startHurricane(); T.run(4); const runs = c.task && c.task.type === 'port' && c.task.why === 'weather'; let t = 0; while (!c.docked && t < 200){ T.run(2); t += 2; } return { early, late, runs, in1: !!c.docked }; });
  check('weather: a good seaman shortens sail at the warning, a poor one only when it blows, and one ordered to runs for port', r.early[0] === .5 && r.early[1] == null && r.late[0] === 0 && r.late[1] === 0 && r.runs && r.in1, r);
  r = await ev(() => { const g = __sp; T.reset(); const s = T.consort('brig', 0), pa = g.ports.find(q => q.name === 'Port Antonio'); g.gold = 2000; g.assign(s, 'trade', g.ports.find(q => q.name === 'Santiago de Cuba')); const g0 = g.gold, stock = s.task.funds; let t = 0; while ((s.task.runs || 0) < 2 && t < 1500){ T.clear(4000); s.hull = s.maxHull; T.run(5); t += 5; }
    const sold = g.dispatches.find(v => /^Sold /.test(v.t)), made = s.task.made, took = 2000 - g0, losses = g.dispatches.filter(v => /a loss of/.test(v.t)).length; g.assign(s, 'cruise', pa); const back = g.gold - g0; const cw = g.taskWord(s), until = s.task.until - g.cal; g.assign(s, 'blockade', pa); const bw = g.taskWord(s); g.assign(s, 'patrol', pa); const pw = g.taskWord(s); const snap = JSON.parse(JSON.stringify(g.snapshot())); g.loadGame(snap); const s2 = g.squad()[0];
    return { stock, took, made, losses, back, t, sold: sold && sold.t, cw, until, bw, pw, kept: s2.task && s2.task.label === 'patrol' && s2.task.ends && s2.task.ends[1] === g.ports.find(q => q.name === 'Port Antonio'), doc: s2.doc.after, max: g.MAXSQ }; });
  check('trade: a consort takes a trading stock, sells two cargoes at a profit, remits the surplus and hands the stock back', r.stock === 250 && r.took === 250 && /^Sold \d+ tons/.test(r.sold || '') && r.made > 0 && r.losses === 0 && r.back >= 250, r);
  check('assignments: cruise, blockade and patrol are set, described and kept through a save; the fleet holds eight', /Cruising/.test(r.cw) && r.until === 3 && /Blockading Port Antonio/.test(r.bw) && /On patrol to/.test(r.pw) && r.kept && r.doc === 'station' && r.max === 8, r);
  r = await ev(() => { const g = __sp; T.reset(); g.toastQ.length = 0; g.toastTick(30); g.say('First notice for the captain to read.'); const a = document.getElementById('toast').textContent; g.say('Second notice, close behind.'); const b = document.getElementById('toast').textContent, q = g.toastQ.length; for (let i = 0; i < 80; i++) g.update(.05); const still = !document.getElementById('toast').classList.contains('off');
    g.toastTick(3); const c = document.getElementById('toast').textContent; g.toastTick(5); const lasts = !document.getElementById('toast').classList.contains('off'); g.toastTick(12); return { a, b, q, still, c, lasts, gone: document.getElementById('toast').classList.contains('off') }; });
  check('notices: each stays long enough to read whatever the pace, and a second waits its turn', /^First/.test(r.a) && /^First/.test(r.b) && r.q === 1 && r.still && /^Second/.test(r.c) && r.lasts && r.gone, r);

  // ---------- choosing on the chart; the trader's judgement ----------
  await ev(() => { const g = __sp; T.reset(); T.consort('brig', 0); g.gold = 1000; g.openFleet('S0'); }); await page.click('#to_port'); await page.waitForTimeout(300);
  r = await ev(() => { const g = __sp, G = g.chartGeo, q = g.ports.find(q => q.name === 'Montego Bay'); return { pick: g.chartPick && g.chartPick.kind, chart: g.chartOpen, sheet: document.getElementById('fleetSheet').hidden, drop: !!document.getElementById('taskPort'), at: [G.x - G.ox + q.x*G.k, G.y - G.oy + q.y*G.k] }; });
  await page.mouse.click(r.at[0], r.at[1]); await page.waitForTimeout(250); const p1 = await ev(() => { const g = __sp, s = g.squad()[0]; return { task: s.task.type, port: s.task.port && s.task.port.name, chart: g.chartOpen, pick: g.chartPick, sheet: !document.getElementById('fleetSheet').hidden }; });
  check('send to port: the port is chosen on the chart, not from a list, and her card comes back', r.pick === 'port' && r.chart && r.sheet && !r.drop && p1.task === 'port' && p1.port === 'Montego Bay' && !p1.chart && !p1.pick && p1.sheet, [r, p1]);
  await page.click('#as_area'); await page.waitForTimeout(300); const ar = await ev(() => { const g = __sp, G = g.chartGeo, k = g.ports[0], w = (x, y) => [G.x - G.ox + x*G.k, G.y - G.oy + y*G.k]; return { c: w(k.x, k.y), near: w(k.x + 150, k.y), far: w(k.x + 1900, k.y) }; });
  await page.mouse.click(ar.c[0], ar.c[1]); await page.waitForTimeout(100); await page.mouse.move(ar.far[0], ar.far[1]); await page.waitForTimeout(100); await page.mouse.click(ar.far[0], ar.far[1]); await page.waitForTimeout(300);
  r = await ev(() => { const g = __sp, s = g.squad()[0], t = s.task; const a = { type: t.type, n: t.set && t.set.length, area: !!t.area, funds: t.funds, gold: g.gold, chart: g.chartOpen, names: t.set && t.set.map(q => q.name) }; g.closeMenu(); return a; });
  check('trade area: a stretch of water marked on the chart gives her captain its open ports to choose between', r.type === 'trade' && r.n >= 3 && r.area && r.funds === 250 && r.gold === 750 && !r.chart && r.names.indexOf('Kingston') >= 0, r);
  await ev(() => { const g = __sp; T.reset(); T.consort('brig', 0); g.gold = 1000; g.openFleet('S0'); }); await page.click('#as_two'); await page.waitForTimeout(300);
  for (const n of ['Kingston', 'Santiago de Cuba']){ const at = await ev(n => { const g = __sp, G = g.chartGeo, q = g.ports.find(q => q.name === n); if (G.x - G.ox + q.x*G.k > innerWidth - 40 || G.y - G.oy + q.y*G.k < 60){ document.getElementById('czOut').click(); } return null; }, n); await page.waitForTimeout(200);
    const xy = await ev(n => { const g = __sp, G = g.chartGeo, q = g.ports.find(q => q.name === n); return [G.x - G.ox + q.x*G.k, G.y - G.oy + q.y*G.k]; }, n); await page.mouse.click(xy[0], xy[1]); await page.waitForTimeout(250); }
  r = await ev(() => { const g = __sp, s = g.squad()[0], t = s.task, a = { type: t.type, set: t.set && t.set.map(q => q.name).sort(), area: t.area }; g.closeMenu(); return a; });
  check('trade route: two ports clicked on the chart become her run', r.type === 'trade' && r.set.join() === 'Kingston,Santiago de Cuba' && !r.area, r);
  r = await ev(() => { const g = __sp; T.reset(); const s = T.consort('brig', 0), k = g.ports[0], pa = g.ports.find(q => q.name === 'Port Antonio'), sc = g.ports.find(q => q.name === 'Santiago de Cuba'); g.gold = 1000;
    g.startTrade(s, [k, pa], null); const none = g.tradePlan(s, k, s.task); g.setTask(s, { type: 'fleet' }); g.startTrade(s, [k, sc], null); const plan = g.tradePlan(s, k, s.task), margin = plan && g.price(sc, plan.g)*.9 - plan.buy;
    s.task.funds = 10; s.task.cargo = null; g.dock(s, k); const ask = g.dispatches.find(v => v.ask === 'funds'), word = g.taskWord(s), g1 = g.gold; g.openPaper('dispatches'); const b = document.querySelector('[id^=df_send]'); const had = !!b; if (b) b.click(); g.closeMenu(); return { none: none === null, good: plan && plan.g, to: plan && plan.q.name, margin, ask: !!ask, word, had, sent: g1 - g.gold, funds: s.task.funds, need: s.task.need }; });
  check('trader: loads nothing where no cargo would pay, and picks a paying cargo where one exists', r.none && r.to === 'Santiago de Cuba' && r.margin > 0, r);
  check('trader: when her stock runs low she lies in port and writes for funds, and sending them sets her trading again', r.ask && /Waiting for funds/.test(r.word) && r.had && r.sent === 240 && r.funds === 250 && !r.need, r);

  await ev(() => { const g = __sp; T.reset(); g.openPort(g.ports[0]); }); r = { before: await ev(() => !!document.getElementById('waitHurr')) }; await ev(() => __sp.startHurricane()); await page.waitForTimeout(100);
  r.offered = await ev(() => !!document.getElementById('waitHurr')); const h0 = await ev(() => ({ hull: __sp.p.hull, sails: __sp.p.sails, cal: __sp.clock })); await page.click('#waitHurr'); await page.waitForTimeout(150);
  r.after = await ev(h0 => { const g = __sp, a = { over: !g.hurr && !g.weather.hur, safe: g.p.hull === h0.hull && g.p.sails === h0.sails, passed: g.clock - h0.cal, state: g.state, gone: !document.getElementById('waitHurr') }; g.closePort(); return a; }, h0);
  check('port: in a hurricane you can wait it out at anchor, unharmed, and the offer goes when it has passed', !r.before && r.offered && r.after.over && r.after.safe && r.after.passed >= 60 && r.after.state === 'port' && r.after.gone, r);

  // ---------- a phone ----------
  const phone = await browser.newPage({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  const perr = []; phone.on('pageerror', e => perr.push(e.message));
  await phone.goto(URL); await phone.waitForFunction(() => window.__sp, null, { timeout: 30000 }); await phone.waitForTimeout(500);
  await phone.tap('#startBtn'); await phone.tap('[data-tap=sailUp]'); await phone.tap('[data-tap=sailUp]'); await phone.tap('[data-tap=star]'); await phone.waitForTimeout(700);
  r = await phone.evaluate(() => ({ sail: __sp.p.sail, fired: __sp.p.rl[1] > 0, wide: document.documentElement.scrollWidth <= innerWidth + 1 }));
  check('phone: touch buttons make sail and fire, and the page does not scroll sideways', r.sail === 1 && r.fired && r.wide && !perr.length, [r, perr]);
  await phone.evaluate(() => __sp.openPort(__sp.ports[0])); await phone.waitForTimeout(300); r = await phone.evaluate(() => { const c = document.querySelector('#port .card').getBoundingClientRect(); return c.width <= innerWidth && c.left >= 0; });
  check('phone: the port screen fits the width', r && !perr.length, perr);
  await phone.close();

  check('no page errors anywhere in the run', errors.length === 0, errors.slice(0, 6));
  await browser.close();
  const fails = results.filter(x => !x.ok);
  for (const x of results) console.log((x.ok ? 'PASS  ' : 'FAIL  ') + x.name + (x.ok ? '' : '   -> ' + x.detail));
  console.log('\n' + (results.length - fails.length) + ' of ' + results.length + ' checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('Test run crashed:', e); process.exit(2); });
