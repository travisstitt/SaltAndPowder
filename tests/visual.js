// Screenshot comparisons of fixed scenes, and layout checks at four screen sizes. Run: node tests/visual.js [--update]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '#test', BASE = path.join(__dirname, 'baseline'), UPDATE = process.argv.includes('--update');
const results = [], check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: detail === undefined ? '' : JSON.stringify(detail) });
const SIZES = { desktop: { viewport: { width: 1280, height: 760 } }, phone: { viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true } };
// each scene puts the game in a known state with the clock stopped
const setup = () => { const g = __sp; g.freeze(false); g.seed(11); g.setDiff('normal'); g.setStart('Kingston'); g.newGame(); g.state = 'play'; g.setCalm(true); g.setPaused(false); g.setChart(false); g.closeMenu();
  for (const id of ['title', 'port', 'prize', 'menu', 'manifest', 'fleetSheet', 'over', 'fate', 'paper', 'ask']) document.getElementById(id).hidden = true;
  const w = g.weather; w.kind = 'clear'; w.k = 0; w.left = 1e7; w.next = null; g.clock = 60; g.wind.dir = g.wind.tDir = 1; g.wind.timer = 1e6; g.setWars(['en-fr']); g.setMarque('en');
  g.ships.forEach(s => { if (s.owner !== 'player') s.gone = true; }); g.update(.001); g.gold = 4200; g.hold.rum = 12;
  g.addFleet({ cls: 'brig', hf: .7, sails: 80, crew: 60, name: 'Sea Hind', cap: { name: 'Anne Morrow', gun: 4, sea: 3 } }, g.p.x - 80, g.p.y + 40, g.p.h); g.p.name = 'Royal Fortune'; g.freeze(true); g.setTime(10); };
const SCENES = {
  title: () => { document.getElementById('title').hidden = false; __sp.state = 'title'; },
  sea: () => { const g = __sp; g.p.x = g.X(-75); g.p.y = g.Y(15); g.p.h = 0; g.squad()[0].x = g.p.x - 110; g.squad()[0].y = g.p.y + 10; const a = g.mk('frigate', 'fr', 'patrol', g.p.x + 170, g.p.y - 150, .4), b = g.mk('merchant', 'es', 'merchant', g.p.x - 150, g.p.y + 150, 0); [a, b].forEach(s => { s.dest = g.ports[2]; s.sail = 1; }); a.announced = true; g.tracked = a; },
  port: () => { const g = __sp; g.openPort(g.ports[0]); document.querySelector('[data-tab=market]').click(); },
  chart: () => { __sp.setChart(true); },
  fleet: () => { __sp.openFleet('F'); },
  gazette: () => { const g = __sp; g.setCal(76); g.calendarTick(); g.openPaper('gazette'); } };
const DIFF = async (page, a, b) => page.evaluate(async ([a, b]) => { const load = s => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/jpeg;base64,' + s; }); const [ia, ib] = await Promise.all([load(a), load(b)]); if (ia.width !== ib.width || ia.height !== ib.height) return { size: true };
  const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data; g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
  let bad = 0, sum = 0; for (let i = 0; i < da.length; i += 4){ const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i+1] - db[i+1]), Math.abs(da[i+2] - db[i+2])); sum += d; if (d > 48) bad++; } return { pct: +(bad/(da.length/4)*100).toFixed(2), mean: +(sum/(da.length/4)).toFixed(2) }; }, [a, b]);
(async () => {
  const browser = await chromium.launch(); const errors = [];
  for (const [sz, opt] of Object.entries(SIZES)){
    const page = await browser.newPage(opt); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL); await page.waitForFunction(() => window.__sp); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
    for (const name of Object.keys(SCENES)){ if (sz === 'phone' && (name === 'fleet' || name === 'gazette' || name === 'chart')) continue;
      await page.evaluate(setup); await page.evaluate(SCENES[name]); await page.waitForTimeout(450);
      const shot = (await page.screenshot({ type: 'jpeg', quality: 80 })).toString('base64'), file = path.join(BASE, name + '-' + sz + '.jpg');
      if (UPDATE || !fs.existsSync(file)){ fs.writeFileSync(file, Buffer.from(shot, 'base64')); check('picture ' + name + ' at ' + sz + ': baseline written', true); continue; }
      const d = await DIFF(page, shot, fs.readFileSync(file).toString('base64'));
      if (!(d.pct < 2.5) || d.size) fs.writeFileSync(path.join(BASE, name + '-' + sz + '.new.jpg'), Buffer.from(shot, 'base64'));
      check('picture ' + name + ' at ' + sz + ' matches its baseline', !d.size && d.pct < 2.5 && d.mean < 18, d); } /* the sea glitters differently every frame, even behind a sheet, so pictures are held to shapes rather than shades */
    await page.close(); }
  // ---------- nothing in the HUD may lie across anything else
  for (const [label, opt] of [['1366x768', { viewport: { width: 1366, height: 768 } }], ['1100x520', { viewport: { width: 1100, height: 520 } }], ['780x380 touch', { viewport: { width: 780, height: 380 }, hasTouch: true, isMobile: true }], ['400x780 touch', { viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true }]]){
    const page = await browser.newPage(opt); await page.goto(URL); await page.waitForFunction(() => window.__sp); await page.waitForTimeout(300);
    await page.evaluate(setup); await page.evaluate(() => { const g = __sp; g.freeze(false); g.setWars(['en-fr', 'en-es', 'es-nl']); }); await page.waitForTimeout(500);
    const r = await page.evaluate(() => { const g = __sp, box = {}, rect = (k, e) => { if (!e) return; const b = e.getBoundingClientRect(); if (b.width > 2 && b.height > 2 && getComputedStyle(e).visibility !== 'hidden') box[k] = [b.left, b.top, b.right, b.bottom].map(Math.round); };
      rect('top bar', document.getElementById('topbar')); rect('flagship card', document.getElementById('flagCard')); rect('fleet column', document.getElementById('fleetCol')); rect('key legend', document.getElementById('keys')); rect('touch controls', document.querySelector('.touch')); rect('dock button', document.getElementById('dock'));
      const m = g.chartRect(); if (m.w > 10) box['small chart'] = [m.x, m.y, m.x + m.w, m.y + m.h].map(Math.round); const tb = box['top bar']; box['compass and flags'] = [innerWidth - 150, tb ? tb[3] + 4 : 0, innerWidth, Math.round(g.flagsEnd)];
      const ks = Object.keys(box), hits = []; for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++){ const a = box[ks[i]], b = box[ks[j]]; if (a[0] < b[2] - 1 && a[2] > b[0] + 1 && a[1] < b[3] - 1 && a[3] > b[1] + 1) hits.push(ks[i] + ' / ' + ks[j]); }
      const off = ks.filter(k => box[k][0] < -1 || box[k][1] < -1 || box[k][2] > innerWidth + 1 || box[k][3] > innerHeight + 1); return { hits, off, n: ks.length, box }; });
    check('layout at ' + label + ': no HUD element overlaps another or leaves the screen', r.hits.length === 0 && r.off.length === 0 && r.n >= 4, r.hits.length || r.off.length ? r : undefined); await page.close(); }
  check('no page errors', errors.length === 0, errors.slice(0, 4));
  await browser.close(); const fails = results.filter(x => !x.ok);
  for (const x of results) console.log((x.ok ? 'PASS  ' : 'FAIL  ') + x.name + (x.ok ? '' : '   -> ' + x.detail));
  console.log('\n' + (results.length - fails.length) + ' of ' + results.length + ' visual checks passed.'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('Visual run crashed:', e); process.exit(2); });
