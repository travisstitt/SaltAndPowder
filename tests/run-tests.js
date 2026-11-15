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
      g.setDiff(diff || 'normal'); g.newGame(); g.state = 'play'; g.setPaused(false); g.setChart(false);
      for (const id of ['title', 'port', 'prize', 'menu', 'manifest', 'fleetSheet', 'over']) document.getElementById(id).hidden = true;
      const w = g.weather; w.kind = 'clear'; w.k = 0; w.left = 1e7; w.next = null; g.clock = 60;
      T.clear(4000); },
    clear(r){ g.ships.forEach(s => { if (s.owner !== 'player' && !s._t && Math.hypot(s.x - g.p.x, s.y - g.p.y) < r) s.gone = true; }); g.update(.001); },
    sea(){ g.p.x = (-75 + 98)*g.DEG; g.p.y = (28.2 - 15)*g.DEG; g.p.h = 0; g.p.speed = 0; T.clear(4000); }, // open Caribbean, no land for leagues
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
  check('boot: 21 ports', r.ports === 21, r.ports);
  check('boot: every port anchorage is in water', r.landAnchors.length === 0, r.landAnchors);
  check('boot: merchants, patrols and treasure fleet present', r.roles.merchant >= 12 && r.roles.patrol >= 8 && r.fleet && r.roles.treasure === 2, r.roles);
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
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); const m = T.foe('merchant', 'es', 'merchant', 0, 150), es0 = g.standing.es, en0 = g.standing.en; g.fire(g.p, 1); T.run(1.5);
    return { hull: m.hull, max: m.maxHull, es: g.standing.es - es0, en: g.standing.en - en0, tracked: g.tracked === m, hit: m.hitByPlayer }; });
  check('gunnery: a starboard broadside hits a ship abeam', r.hull < r.max && r.hit, r);
  check('gunnery: attacking Spain angers her and pleases her enemies', r.es < 0 && r.en > 0, r);
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
    T.reset(); T.sea(); const b = T.foe('galleon', 'es', 'patrol', 0, 60); b.crew = 300; g.p.crew = 40; g.grapple(); T.run(12); return { m, win, lose: g.state, crew: g.p.crew, melee: !!g.melee }; });
  check('melee: boarding starts a fight', r.m); check('melee: a weak crew is taken', r.win === 'prize', r.win);
  check('melee: boarding a galleon with 40 hands fails and costs crew', (r.lose === 'play' || r.lose === 'over') && r.crew < 40 && !r.melee, r);

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

  r = await ev(() => { const g = __sp; T.reset(); g.openPort(g.ports[0]); const i = g.offers.findIndex(o => o.type === 'deliver'); g.accept(i); const t = g.mission.port, reward = g.mission.reward; g.closePort(); const g0 = g.gold; g.openPort(t); const done = !g.mission, paid = g.gold - g0; g.closePort(); return { done, paid, reward }; });
  check('commission: dispatches are paid on arrival', r.done && r.paid === r.reward, r);
  r = await ev(() => { const g = __sp; T.reset(); g.repute('es', -100); const hav = g.ports.find(q => q.name === 'Havana'); g.p.x = hav.ox; g.p.y = hav.oy; T.run(.2); return g.hostile('es'); });
  await page.keyboard.press('KeyF'); await page.waitForTimeout(150);
  check('nations: a hostile port refuses you', r && (await ev(() => __sp.state)) === 'play');
  await ev(() => { const g = __sp; g.gold = 5000; g.openPort(g.ports[0]); }); await page.click('[data-tab=governor]'); await page.click('#pardon');
  check('nations: a pardon ends the hostility', !(await ev(() => __sp.hostile('es')))); await ev(() => __sp.closePort());

  // ---------- saving ----------
  r = await ev(() => { const g = __sp; T.reset(); g.gold = 1234; g.hold.cocoa = 7; g.p.crew = 33; g.p.name = 'Saved Ship'; T.consort('brig', 0); g.setCourse(g.ports[3]); const okW = g.writeSlot('1'); g.gold = 1; g.hold.cocoa = 0;
    g.loadGame(g.readSlot('1')); const a = { okW, gold: g.gold, cocoa: g.hold.cocoa, crew: g.p.crew, name: g.p.name, squad: g.squad().length, course: g.course && g.course.name, state: g.state };
    const code = g.encode(g.snapshot()), d = g.decode(code); a.code = !!d && d.gold === 1234; a.garbage = g.decode('not a code') === null;
    const old = g.snapshot(); old.deg = 400; old.p.x = 8460; old.p.y = 4200; g.loadGame(old); a.oldOnLand = g.isLand(g.p.x, g.p.y); return a; });
  check('saving: a slot restores gold, cargo, crew, name, fleet and course', r.okW && r.gold === 1234 && r.cocoa === 7 && r.crew === 33 && r.name === 'Saved Ship' && r.squad === 1 && r.course === 'Tortuga' && r.state === 'play', r);
  check('saving: save codes round-trip and bad codes are refused', r.code && r.garbage, r);
  check('saving: a save from the smaller map loads in open water', r.oldOnLand === 0 || r.oldOnLand === false, r.oldOnLand);

  // ---------- course and helmsman ----------
  for (const dest of ['Santiago de Cuba', 'Cartagena', 'Nassau', 'Havana']){
    r = await ev(name => { const g = __sp; T.reset(); g.setCourse(g.ports.find(q => q.name === name)); let t = 0; while (g.course && t < 2400 && g.state === 'play'){ T.run(5); t += 5; }
      return { arrived: !g.course, t, hull: Math.round(g.p.hull), land: g.isLand(g.p.x, g.p.y), d: Math.round(Math.hypot(g.p.x - g.ports.find(q => q.name === name).ox, g.p.y - g.ports.find(q => q.name === name).oy)) }; }, dest);
    check('helmsman: Port Royal to ' + dest + ' without grounding', r.arrived && r.hull >= 95 && !r.land, r);
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
  r = await ev(() => { const g = __sp; T.reset(); T.consort('brig', 0); g.gold = 1000; const w = g.wageBill(); g.payWages(5); const paid = 1000 - g.gold; g.gold = 0; const c0 = g.p.crew; g.payWages(6); return { w, paid, deserted: c0 - g.p.crew, free: (() => { g.gold = 50; g.payWages(2); return g.gold; })() }; });
  check('wages: paid in full, desertion when broke, none in the first days', r.paid === r.w && r.deserted > 0 && r.free === 50, r);
  r = await ev(() => { const g = __sp; T.reset(); T.sea(); g.sink(g.p); T.run(4); return g.state; });
  check('game over: a sunk flagship ends the voyage', r === 'over', r);
  await page.click('#againBtn'); check('game over: sail again starts a new voyage', (await ev(() => __sp.state)) === 'play');

  // ---------- keyboard and screens in real time ----------
  const e0 = errCount();
  await ev(() => { const g = __sp; T.reset(); T.sea(); T.consort('brig', 0); g.wind.dir = g.wind.tDir = g.p.h + .8; });
  await page.keyboard.press('KeyW'); await page.keyboard.press('KeyW'); await page.keyboard.down('KeyD'); await page.waitForTimeout(900); await page.keyboard.up('KeyD');
  r = await ev(() => [__sp.p.sail, __sp.p.h]); check('keys: W makes sail and D turns', r[0] === 1 && r[1] > .1, r);
  await page.keyboard.press('KeyR'); r = await page.textContent('#shotBtn'); check('keys: R changes shot', r === 'Chain shot', r);
  await page.keyboard.press('Space'); await page.waitForTimeout(400); check('keys: Space fires', (await ev(() => __sp.p.rl[0] > 0 && __sp.p.rl[1] > 0)));
  await page.keyboard.press('KeyG'); await page.keyboard.press('KeyH'); r = [await page.textContent('#formBtn'), await page.textContent('#orderBtn')]; check('keys: G and H change formation and orders', r[0] === 'Line abreast' && r[1] === 'Engage at will', r);
  await page.keyboard.press('KeyP'); const c1 = await ev(() => __sp.clock); await page.waitForTimeout(500); r = await ev(() => [__sp.paused, __sp.clock]); check('keys: P pauses the sea', r[0] && r[1] === c1, r); await page.keyboard.press('KeyP');
  for (const [key, id] of [['KeyI', 'manifest'], ['KeyV', 'fleetSheet'], ['Escape', 'menu']]){ await page.keyboard.press(key); await page.waitForTimeout(150); const open = await ev(i => !document.getElementById(i).hidden, id); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    const shut = await ev(i => document.getElementById(i).hidden, id); check('keys: ' + key + ' opens and Escape closes the ' + id + ' screen', open && shut, [open, shut]); }
  await page.keyboard.press('KeyC'); await page.waitForTimeout(1500); r = await ev(() => __sp.chartOpen); await page.mouse.wheel(0, -400); await page.waitForTimeout(200);
  await page.mouse.move(640, 400); await page.mouse.down(); await page.mouse.move(700, 430, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(100);
  check('chart: opens, zooms and drags without closing', r && (await ev(() => __sp.chartOpen)));
  await page.keyboard.press('Escape'); await page.waitForTimeout(100); await page.keyboard.press('KeyC'); await page.waitForTimeout(300);
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
