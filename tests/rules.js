// Fast checks of the rules of the game, saved-game fixtures and a performance budget. Run: node tests/rules.js [--make-fixture]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '#test', FIX = path.join(__dirname, 'fixtures');
const results = [], check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: detail === undefined ? '' : JSON.stringify(detail) });
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1280, height: 760 } }); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL); await page.waitForFunction(() => window.__sp); const ev = (f, a) => page.evaluate(f, a);
  await ev(() => { const g = __sp; g.freeze(true); g.seed(1); g.setDiff('normal'); g.newGame(); g.setCalm(true); });
  if (process.argv.includes('--make-fixture')){ const d = await ev(() => { const g = __sp; g.seed(1); g.newGame(); g.setWars(['en-fr']); g.setMarque('en'); g.gold = 1500; g.hold.fish = 8; g.svc(7); g.addFleet({ cls: 'brig', hf: .9, sails: 100, crew: 50, cap: { name: 'Fixture Captain', gun: 3, sea: 3 } }, g.p.x - 80, g.p.y, 0); return g.snapshot(); });
    fs.writeFileSync(path.join(FIX, 'save-v5.json'), JSON.stringify(d)); console.log('wrote save-v5.json'); await browser.close(); return; }
  let r;
  // ---------- chance
  r = await ev(() => { const g = __sp, run = () => { g.seed(42); const a = []; for (let i = 0; i < 6; i++) a.push(g.roll()); g.newGame(); return a.join() + '|' + g.ships.length + '|' + g.ships.slice(0, 5).map(s => Math.round(s.x)).join(); }; const a = run(), b = run(); g.seed(43); return { same: a === b, differ: g.roll() !== (g.seed(42), g.roll()) }; });
  check('chance: the same seed gives the same rolls and the same world; another seed differs', r.same && r.differ, r);
  // ---------- trade
  r = await ev(() => { const g = __sp, P = n => g.ports.find(q => q.name === n), K = g.goodsKeys, base = k => g.GOODS[k][1]; let bad = 0; g.ports.forEach(q => K.forEach(k => { const v = g.price(q, k); if (!(v >= 2) || v > base(k)*2) bad++; }));
    return { bad, made: g.price(P('Kingston'), 'sugar') < base('sugar'), wanted: g.price(P('Boston'), 'molasses') > base('molasses'), smuggle: g.price(P('Havana'), 'cloth')/base('cloth'), monte: g.price(P('Monte Cristi'), 'flour')/base('flour'), goods: K.length }; });
  check('trade: every good has a sane price in every port', r.bad === 0 && r.goods === 12, r);
  check('trade: cheap where made, dear where wanted, dearest where forbidden', r.made && r.wanted && r.smuggle > 1.35 && r.monte > 1.35, r);
  // ---------- gunnery
  r = await ev(() => { const g = __sp; g.newGame(); const mk = h => { const s = g.mk('frigate', 'fr', 'patrol', g.p.x + 300, g.p.y, h); s.dest = g.ports[2]; return s; }, hit = (s, b) => { const h0 = s.hull, c0 = s.crew; g.strike(Object.assign({ x: s.x, y: s.y }, b), s, 8, 1, 1); const d = [+(h0 - s.hull).toFixed(2), c0 - s.crew]; s.gone = true; return d; };
    return { beam: hit(mk(0), { a: Math.PI/2 }), rake: hit(mk(0), { a: 0 }), dbl: hit(mk(0), { a: Math.PI/2, dbl: true }), both: hit(mk(0), { a: 0, dbl: true }), chain: hit(mk(0), { a: 0, chain: true }), grape: hit(mk(0), { a: 0, grape: true }) }; });
  check('gunnery: a beam hit does its plain damage and kills no one', r.beam[0] === 8 && r.beam[1] === 0, r);
  check('gunnery: raking and double shot each add 60 per cent, and stack', r.rake[0] === 12.8 && r.dbl[0] === 12.8 && Math.abs(r.both[0] - 20.48) < .01 && r.rake[1] >= 1, r);
  check('gunnery: chain does not rake; grape rakes the crew but not the hull', r.chain[0] === 8 && r.chain[1] === 0 && r.grape[0] === 8 && r.grape[1] >= 1, r);
  r = await ev(() => { const g = __sp; return { irons: g.polar(Math.PI), run: g.polar(0), reach: Math.max(g.polar(.9), g.polar(1.2), g.polar(1.6)) }; });
  check('sailing: no way made into the wind, and a reach beats a dead run', r.irons < .15 && r.reach > r.run && r.reach >= .95, r);
  // ---------- law and reputation
  r = await ev(() => { const g = __sp, out = {}; const go = (marque, nat) => { g.newGame(); g.setWars(['en-fr']); g.setMarque(marque); const s0 = Object.assign({}, g.standing); g.offend({ nation: nat }, 10); const d = {}; for (const k in s0) d[k] = +(g.standing[k] - s0[k]).toFixed(2); d.marque = g.marque; return d; };
    out.lawful = go('en', 'fr'); out.pirate = go(null, 'fr'); out.neutral = go('en', 'nl'); out.patron = go('en', 'en');
    g.newGame(); g.setWars(['en-fr']); g.setMarque('en'); const fr = g.mk('brig', 'fr', 'patrol', g.p.x, g.p.y + 300, 0), nl = g.mk('brig', 'nl', 'patrol', g.p.x, g.p.y - 300, 0), pi = g.mk('brig', 'pirate', 'rover', g.p.x + 300, g.p.y, 0); out.law = [g.lawful(fr), g.lawful(nl), g.lawful(pi)]; g.setMarque(null); out.none = [g.lawful(fr), g.lawful(pi)];
    g.setMarque('en'); const g0 = g.gold; g.sendIn(fr, 1); out.court = g.courtDue; out.paidNow = g.gold - g0; g.sendIn(nl, 1); out.quiet = g.gold - g0; out.value = g.classes.brig.value; [fr, nl, pi].forEach(s => { s.gone = true; }); return out; });
  check('law: a lawful capture angers only the enemy and pleases the patron', r.lawful.fr === -5 && r.lawful.en === 4 && r.lawful.es === 0 && r.lawful.marque === 'en', r.lawful);
  check('law: piracy is marked by every nation', r.pirate.fr === -10 && r.pirate.en === -2.5 && r.pirate.es === -2.5 && r.pirate.dk === -2.5, r.pirate);
  check('law: attacking a neutral or your own patron costs the letter when standing falls', r.neutral.nl === -10 && r.patron.marque === null, [r.neutral, r.patron]);
  check('law: only the enemy and pirates are lawful prize, and only under a letter', r.law[0] && !r.law[1] && r.law[2] && !r.none[0] && !r.none[1], r);
  check('law: the court pays 30 per cent over the plain price later; an unlawful hull sells at once for 60 per cent', r.court === Math.round(r.value*.35*1.3) && r.paidNow === 0 && r.quiet === Math.round(r.value*.35*.6), r);
  // ---------- calendar and career
  r = await ev(() => { const g = __sp, E = g.EVENTS, N = g.NAVY; return { sorted: E.every((e, i) => !i || e[0] >= E[i-1][0]), war: E.find(e => /declared war on France/.test(e[1]))[0], spain: E.find(e => /Spain has entered/.test(e[1]))[0], peace: E[E.length-1][0], navy: N.map(v => v[0]), ranks: [g.rankFor(0), g.rankFor(499), g.rankFor(500), g.rankFor(1e6)] }; });
  check('calendar: events are in order, with war in May 1756, Spain in January 1762 and peace in February 1763', r.sorted && r.war === 76 && r.spain === 144 && r.peace === 157, r);
  check('career: promotion thresholds rise, and notoriety follows plunder', r.navy.join() === '0,6,16,32,60' && r.ranks.join() === '0,0,1,5', r);
  r = await ev(() => { const g = __sp; g.newGame(); g.setWars(['en-fr']); g.setMarque('en'); const w0 = g.wageBill(); g.svc(60); g.navy.rank = 4; const w1 = g.wageBill(); g.setMarque(null); return { w0, w1, back: g.wageBill() }; });
  check('wages: a commodore in service pays about half, and loses that with the letter', r.w0 >= 1 && r.w1 <= Math.ceil(r.w0/2) && r.back === r.w0, r);
  // ---------- the world
  r = await ev(() => { const g = __sp, P = g.ports, names = new Set(P.map(q => q.name)); return { n: P.length, unique: names.size === P.length, wet: P.filter(q => g.isLand(q.ox, q.oy)).map(q => q.name), land: P.filter(q => q.spec.land).length, noGov: P.filter(q => q.spec.land && q.spec.sz !== 1).length, dock: P.filter(q => q.spec.dock).map(q => q.name).sort(), free: P.filter(q => q.spec.free).length,
    gs: [!!g.streamAt(g.X(-79.65), g.Y(27.4)), g.streamAt(g.X(-70), g.Y(20)) === null] }; });
  check('world: 108 ports with unique names, every anchorage afloat', r.n === 108 && r.unique && r.wet.length === 0, r);
  check('world: landings, dockyards and free ports are as designed', r.land >= 40 && r.noGov === 0 && r.dock.join() === 'English Harbour,Halifax,Havana' && r.free === 3 && r.gs[0] && r.gs[1], r);
  // ---------- the bays, the seasons, and the newer rules
  r = await ev(() => { const g = __sp, P = n => g.ports.find(q => q.name === n), k = P('Kingston'); g.newGame(); const reach = ['Norfolk', 'Yorktown', 'Annapolis', 'Philadelphia'].map(n => g.findPath(k.ox, k.oy, P(n).ox, P(n).oy).length > 3);
    g.setCal(84); g.update(.01); const jan = [g.iced(P('Louisbourg')), g.iced(P('Halifax')), g.iced(P('Boston')), g.season]; g.setCal(78); g.update(.01); const jul = [g.iced(P('Louisbourg')), g.season]; g.setCal(81); g.update(.01); return { reach, jan, jul, oct: g.season }; });
  check('bays: Norfolk, Yorktown, Annapolis and Philadelphia are reached through the Chesapeake and the Delaware', r.reach.every(Boolean), r);
  check('seasons: the far north is iced in from December to March; the land turns with autumn and winter', r.jan[0] && r.jan[1] && !r.jan[2] && r.jan[3] === 2 && !r.jul[0] && r.jul[1] === 0 && r.oct === 1, r);
  r = await ev(() => { const g = __sp; g.newGame(); g.state = 'play'; g.freeze(true); const n = g.PACES.length; g.setPace(5); g.update(.05); const dropped = g.pace; g.setPace(1); return { n, dropped }; });
  check('passage: the fastest pace needs the helmsman on a course, and drops back without one', r.n === 6 && r.dropped === 2, r);
  r = await ev(() => { const g = __sp; g.newGame(); g.state = 'play'; const m0 = g.morale; g.earn(600, 0, 0); const up = g.morale - m0; const a = g.pMul(); g.officers.master = true; const b = g.pMul(); g.setFouling(true); g.foul = .5; const c = g.pMul(); g.foul = 0; g.setFouling(false); g.officers.master = false; g.morale = 10; g.p.crew = 40; g.monthTick(3); return { up, a, b: +b.toFixed(3), c: +c.toFixed(3), ran: 40 - g.p.crew }; });
  check('company: prize money lifts the hands, a sailing master and a clean bottom make speed, and a sullen crew deserts', r.up >= 4 && r.a === 1 && r.b === 1.04 && r.c < .96 && r.ran >= 1, r);
  r = await ev(() => { const g = __sp, out = {}; for (const [k, roll] of [['win', 0], ['lose', .99]]){ g.newGame(); g.state = 'play'; g.setWars(['en-fr']); g.setMarque('en'); g.clock = 60 + 300*.6; const q = g.ports.find(q => q.name === 'Saint-Marc'), g0 = g.gold, c0 = g.p.crew = 60; g.setRnd(() => roll); g.shoreAction(q); const open = !document.getElementById('ask').hidden; document.getElementById('sa_cut').click(); out[k] = { open, gold: g.gold - g0, crew: c0 - g.p.crew, svc: g.navy.pts, again: q.raided != null }; g.seed(3); } return out; });
  check('shore: a night cutting-out pays when it succeeds and costs men when it fails', r.win.open && r.win.gold > 200 && r.win.svc >= 2 && r.win.again && r.lose.gold === 0 && r.lose.crew >= 6, r);
  r = await ev(() => { const g = __sp; g.newGame(); g.state = 'play'; g.setWars(['en-fr']); g.setMarque('en'); const q = g.ports.find(q => q.name === 'English Harbour'); g.p.x = q.ox + 2500; g.p.y = q.oy + 900; g.rivals.forEach((v, i) => { v.alive = i === 0; }); const cf = g.ports.find(q => q.name === 'Cap-Français'); g.p.x = cf.ox + 2600; g.p.y = cf.oy - 1200; g.spawnRival(); const s = g.ships.find(s => s.rival === 0), g0 = g.gold; if (!s) return { found: false };
    s.hitByPlayer = true; g.damage(s, 99999, 0); return { found: true, name: s.t.name, hostile: s.provoked, paid: g.gold - g0, dead: !g.rivals[0].alive, svc: g.navy.pts, wreck: g.wrecks.length }; });
  check('rivals: a named enemy captain cruises his home waters, and sinking him pays a reward', r.found && /Marchais/.test(r.name) && r.hostile && r.paid >= 600 && r.dead && r.svc >= 4 && r.wreck === 1, r);
  r = await ev(() => { const g = __sp; g.newGame(); g.state = 'play'; g.setWars(['en-fr']); g.setMarque('en'); g.hold.flour = 12; const s = g.mk('sloop', 'en', 'patrol', g.p.x + 100, g.p.y, 0); s.dest = g.ports[2]; g.navyStop(s); const open = !document.getElementById('ask').hidden; document.getElementById('n_submit').click(); s.gone = true;
    g.setMarque('fr'); g.setCal(100); g.makeOffers(g.ports.find(q => q.name === 'Cap-Français')); return { open, flour: g.hold.flour, ops: g.offers.map(o => o.title) }; });
  check('trading with the enemy: a British cruiser seizes provisions bound for the French', r.open && r.flour === 0, r);
  check('French service: operations against Louisbourg\'s besiegers and the Jamaica trade are offered', r.ops.some(t => /Louisbourg/.test(t)) && r.ops.some(t => /Jamaica trade/.test(t)), r);

  // ---------- a trading game
  r = await ev(() => { const g = __sp, P = n => g.ports.find(q => q.name === n); g.newGame(); g.state = 'play'; const k = P('Kingston'), pa = P('Port Antonio'), p0 = g.price(k, 'sugar'), l0 = g.price(pa, 'sugar'); g.press(k, 'sugar', 100); g.press(pa, 'sugar', 100); const up = g.price(k, 'sugar') - p0, upL = g.price(pa, 'sugar') - l0; g.press(k, 'sugar', -200); const down = g.price(k, 'sugar') < p0;
    for (let i = 0; i < 8; i++) g.marketTick(); const settled = Math.abs(g.price(k, 'sugar') - p0) <= 1; g.setRnd(() => .99); g.marketEvent(k, 'rum', 1.3, 3, null); const ev = g.price(k, 'rum'); g.setCal(g.cal + 5); g.marketTick(); const gone = g.price(k, 'rum') < ev; g.seed(3); return { up, upL, down, settled, gone }; });
  check('market: buying raises a price and selling lowers it, far more at a landing than a city, and it settles with time', r.up >= 1 && r.upL > r.up && r.down && r.settled, r);
  check('market: a shortage lifts a price for a few months and then passes', r.gone, r);
  r = await ev(() => { const g = __sp, P = n => g.ports.find(q => q.name === n); g.newGame(); g.state = 'play'; g.note(P('Kingston')); g.note(P('Santiago de Cuba')); const b = g.bestKnown('cloth', 'Kingston'), all = g.bestKnown('cloth', null);
    const s = g.addFleet({ cls: 'brig', hf: 1, sails: 100, crew: 40, cap: { name: 'T', gun: 3, sea: 3 } }, g.p.x, g.p.y, 0); g.gold = 1000; g.startTrade(s, [P('Kingston'), P('Santiago de Cuba')], null); s.doc.contra = 'avoid'; const clean = g.tradePlan(s, P('Kingston'), s.task); s.doc.contra = 'allow'; const smug = g.tradePlan(s, P('Kingston'), s.task); s.doc.margin = .2; s.doc.contra = 'avoid'; const strict = g.tradePlan(s, P('Santiago de Cuba'), s.task);
    return { hi: b.hi && b.hi[0], lo: all.lo && all.lo[0], clean: clean && clean.g, smug: smug && smug.g, strict: strict && strict.g }; });
  check('price book: prices seen are written down, and the dearest and cheapest known can be looked up', r.hi === 'Santiago de Cuba' && r.lo === 'Kingston', r);
  check('trader orders: told to carry no contraband she will not run cloth into a Spanish port; allowed, she will', r.clean !== 'cloth' && r.smug === 'cloth', r);
  r = await ev(() => { const g = __sp, P = n => g.ports.find(q => q.name === n); g.newGame(); g.state = 'play'; g.setRnd(() => .1); const k = P('Kingston'), fr = g.freightOffer(k); g.seed(4); if (!fr) return { found: false }; g.mission = { type: 'freight', nk: 'en', g: fr.g, tons: fr.tons, port: fr.port, until: g.cal + fr.months, reward: fr.reward, rep: 4, title: 'Freight' }; const g0 = g.gold; g.freightCheck(fr.port); const early = !!g.mission; g.hold[fr.g] = fr.tons + 5; const snap = JSON.parse(JSON.stringify(g.snapshot())); g.loadGame(snap); g.freeze(true); const kept = g.mission && g.mission.type === 'freight' && g.mission.tons === fr.tons;
    g.freightCheck(g.mission.port); return { found: true, early, kept, done: !g.mission, paid: g.gold - g0, left: g.hold[fr.g], reward: fr.reward, over: fr.reward > fr.tons*g.GOODS[fr.g][1]*1.3 }; });
  check('freight: a contract pays well over the market when the goods are landed, and survives a save', r.found && r.early && r.kept && r.done && r.paid === r.reward && r.left === 5 && r.over, r);

  // ---------- saved games from every format
  for (const [file, want] of [['save-v3.json', { cls: 'fifty', home: 'Kingston', squad: 1, laid: 'fifty', cal: 82, wars: 1, near: 'Cap-Français', sugar: 5, mission: 'deliver' }], ['save-v4.json', { cls: 'frigate', home: 'Kingston', squad: 1, cal: 128, wars: 1, near: 'Havana', marque: 'en', court: 500, rank: 2, mission: 'siege', have: 1, fr: 2 }], ['save-v5.json', { cls: 'sloop', home: 'Kingston', squad: 1, cal: 72, wars: 1, near: 'Kingston', marque: 'en', fish: 8, pts: 7 }]]){
    const d = JSON.parse(fs.readFileSync(path.join(FIX, file), 'utf8'));
    r = await ev(d => { const g = __sp; g.loadGame(d); g.freeze(true); let np = null, nd = 1e9; g.ports.forEach(q => { const dd = Math.hypot(q.ox - g.p.x, q.oy - g.p.y); if (dd < nd){ nd = dd; np = q; } }); const s = g.snapshot();
      return { cls: g.p.cls, home: g.home, squad: g.squad().length, laid: s.laidUp[0] && s.laidUp[0].cls, cal: g.cal, wars: g.wars.length, near: np.name, nd: Math.round(nd), marque: g.marque, court: g.courtDue, rank: g.navy.rank, pts: g.navy.pts, mission: g.mission && g.mission.type, have: g.mission && g.mission.have, fr: g.captives.fr, sugar: g.hold.sugar, fish: g.hold.fish, state: g.state, afloat: !g.isLand(g.p.x, g.p.y), dk: g.standing.dk != null, goods: Object.keys(g.hold).length }; }, d);
    const ok = Object.keys(want).every(k => r[k] === want[k]) && r.state === 'play' && r.afloat && r.dk && r.goods === 12 && r.nd < 600;
    check('saved game ' + file + ' loads into the present game', ok, [want, r]); }
  // ---------- performance
  r = await ev(() => { const g = __sp; g.seed(7); g.newGame(); g.setCalm(true); g.state = 'play'; const q = g.ports.find(q => q.name === 'Boston'); g.p.x = q.ox; g.p.y = q.oy; for (let i = 0; i < 600; i++) g.update(.05); for (let i = 0; i < 12 && g.ships.length < 55; i++){ const s = g.mk('brig', 'en', 'patrol', g.p.x + 400 + i*90, g.p.y + 900, 0); s.dest = g.ports[2]; }
    const n = g.ships.length, t0 = performance.now(); for (let i = 0; i < 1200; i++) g.update(.05); return { n, ms: +((performance.now() - t0)/1200).toFixed(3) }; });
  check('performance: a tick of the world with fifty ships costs under 3 ms', r.n >= 45 && r.ms < 3, r);
  check('no page errors', errors.length === 0, errors.slice(0, 4));
  await browser.close(); const fails = results.filter(x => !x.ok);
  for (const x of results) console.log((x.ok ? 'PASS  ' : 'FAIL  ') + x.name + (x.ok ? '' : '   -> ' + x.detail));
  console.log('\n' + (results.length - fails.length) + ' of ' + results.length + ' rule checks passed.'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('Rules run crashed:', e); process.exit(2); });
