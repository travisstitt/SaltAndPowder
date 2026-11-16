const CLASSES = {
  sloop:    { crew:60, hold:40, value:700, cname:'sloop', rate:14, len:56, wid:19, hull:100, guns:4, speed:130, turn:1.15, rig:'square', masts:[.2,-.18], bow:.36, st:.3, sr:.03, price:0 },
  schooner: { crew:50, hold:30, value:900, cname:'schooner', rate:8, len:56, wid:16, hull:85, guns:3, speed:150, turn:1.35, rig:'gaff', masts:[.24,-.08], bow:.26, st:.22, sr:.02, price:900 },
  cutter:   { crew:40, hold:20, value:600, cname:'cutter', rate:10, len:46, wid:14, hull:70, guns:3, speed:132, turn:1.3, rig:'gaff', masts:[.12], bow:.24, st:.2, sr:.02 },
  brig:     { crew:100, hold:80, value:2400, cname:'brig', rate:16, len:66, wid:21, hull:140, guns:6, speed:122, turn:1.1, rig:'square', masts:[.22,-.2], bow:.34, st:.3, sr:.03, price:2400 },
  merchant: { crew:36, hold:160, value:900, cname:'West Indiaman', rate:12, len:66, wid:29, hull:80, guns:2, speed:98, turn:1, rig:'square', masts:[.22,-.16], bow:.47, st:.44, sr:.09, cargo:true, price:1800 },
  frigate:  { crew:220, hold:100, value:6000, cname:'frigate', rate:28, len:90, wid:27, hull:230, guns:9, speed:116, turn:.95, rig:'square', masts:[.3,.03,-.26], bow:.36, st:.37, sr:0, boats:true, price:6000 },
  bermuda:  { crew:45, hold:35, value:1100, cname:'Bermuda sloop', rate:10, len:52, wid:15, hull:80, guns:3, speed:158, turn:1.4, rig:'gaff', masts:[.14], bow:.25, st:.2, sr:.02, price:1100 },
  snow:     { crew:30, hold:110, value:1300, cname:'snow', rate:8, len:60, wid:23, hull:90, guns:2, speed:110, turn:1.1, rig:'square', masts:[.22,-.18], bow:.42, st:.38, sr:.07, cargo:true, price:1300 },
  fifty:    { crew:300, hold:140, value:9500, cname:'fifty-gun ship', rate:50, len:100, wid:31, hull:320, guns:11, speed:104, turn:.85, rig:'square', masts:[.3,.04,-.24], bow:.4, st:.4, sr:.01, boats:true, decks:2, price:9500, dock:true },
  seventyfour: { crew:480, hold:160, value:15000, cname:'seventy-four', rate:74, len:116, wid:36, hull:460, guns:15, speed:98, turn:.72, rig:'square', masts:[.31,.04,-.25], bow:.4, st:.41, sr:.01, boats:true, decks:2, price:15000, dock:true }
};
CLASSES.boat = { crew:8, hold:4, value:40, cname:'longboat', rate:0, len:30, wid:10, hull:30, guns:0, speed:104, turn:1.5, rig:'gaff', masts:[.1], bow:.3, st:.24, sr:.03 };
const YARD = ['sloop', 'bermuda', 'schooner', 'snow', 'merchant', 'brig', 'frigate', 'fifty', 'seventyfour'];
const BOUNTY = { cutter:90, schooner:110, sloop:130, brig:220, frigate:480, fifty:700, seventyfour:1100, bermuda:120, snow:0, merchant:0 };
function livery(cls, owner, role){
  if (owner === 'player') return { hullC:'#8a5530', hullD:'#4f2c14', trim:'#e0b458', band:null, deck:'#c39a66', sailC:'#f2e9d2', seam:'rgba(196,71,47,.9)', flag:['#c4472f','#c4472f'], tag:C.bone };
  if (owner === 'pirate') return { hullC:'#2c2622', hullD:'#120f0d', trim:'#8c2a1c', band: cls === 'cutter' ? null : '#7a1f14', deck:'#6f5a42',
    sailC: cls === 'brig' ? '#373c40' : '#8a3327', seam:'rgba(190,60,40,.95)', flag:['#111111','#111111'], tag:'#e9e9e9', skull:true };
  const n = NAT[owner];
  if (role === 'treasure') return { hullC:'#7a3220', hullD:'#3e160d', trim:'#f0d070', band:'#e2b534', deck:'#c9a36c', sailC:'#f8f1dd', seam:n.c2, flag:[n.c1, n.c2], tag:'#ffe07a', chests:true };
  if (role === 'merchant') return { hullC:'#a87f4e', hullD:'#6b4a26', trim:'#3a2613', band:n.c1, deck:'#d6b17c', sailC:'#f8f1dd', seam:n.c1, flag:[n.c1, n.c2], tag:n.tag };
  return { hullC:'#bd8f50', hullD:'#6f4a22', trim:'#ecca6c', band:n.c1, wale:true, deck:'#c9a877', sailC:'#f5f8fa', seam:n.c1, flag:[n.c1, n.c2], tag:n.tag };
    /* varnished sides, a black wale, upper works in the national colour */
}
const ENS = { en:'#c8102e', es:'#f4f1e6', fr:'#f6f3ea', nl:'#f2f2f2', dk:'#c8102e' };
function drawEnsign(g, k, pts, w){ /* a waving ensign along a polyline: red ensign, Burgundy cross, Bourbon white, Dutch tricolour */
  const n = pts.length - 1, ang = Math.atan2(pts[n][1] - pts[0][1], pts[n][0] - pts[0][0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  const line = (a, b, wd, col, off) => { g.strokeStyle = col; g.lineWidth = wd; g.lineJoin = 'round';
    g.beginPath(); for (let j = a; j <= b; j++){ const x = pts[j][0] + nx*off, y = pts[j][1] + ny*off;
    j === a ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); };
  line(0, n, w + 2, 'rgba(8,25,30,.55)', 0); line(0, n, w, ENS[k], 0);
  if (k === 'nl'){ line(0, n, w/3, '#b3261e', -w/3); line(0, n, w/3, '#2a4f9c', w/3); }
  else if (k === 'en'){ line(0, 2, w/2, '#1f3a7a', -w/4); line(0, 2, w/7, '#f2f2f2', -w/4); }
  else if (k === 'dk'){ line(0, n, w/4.5, '#f2f2f2', 0); g.strokeStyle = '#f2f2f2';
    g.lineWidth = w/4; g.beginPath(); g.moveTo(pts[1][0] + nx*w/2, pts[1][1] + ny*w/2);
    g.lineTo(pts[1][0] - nx*w/2, pts[1][1] - ny*w/2); g.stroke(); }
  else if (k === 'es'){ g.strokeStyle = '#b3261e'; g.lineWidth = Math.max(1.2, w/5);
    g.beginPath(); for (const sd of [-1, 1]){ g.moveTo(pts[1][0] + nx*sd*w*.4, pts[1][1] + ny*sd*w*.4);
    g.lineTo(pts[n-1][0] - nx*sd*w*.4, pts[n-1][1] - ny*sd*w*.4); } g.stroke(); }
  else if (k === 'fr'){ g.fillStyle = '#d4a92a'; for (let j = 1; j < n; j++){ circle(g, pts[j][0], pts[j][1], Math.max(1, w*.17)); g.fill(); } } }
function flagRect(g, k, x, y, w, h){ g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = ENS[k] || '#111'; g.fillRect(x, y, w, h);
  if (k === 'nl'){ g.fillStyle = '#b3261e'; g.fillRect(x, y, w, h/3); g.fillStyle = '#2a4f9c'; g.fillRect(x, y + h*2/3, w, h/3); }
  else if (k === 'en'){ const cw = w*.46, hh = h*.52, cross = () => { g.beginPath();
    g.moveTo(x + cw/2, y); g.lineTo(x + cw/2, y + hh); g.moveTo(x, y + hh/2); g.lineTo(x + cw, y + hh/2); g.stroke(); };
    g.fillStyle = '#1f3a7a'; g.fillRect(x, y, cw, hh); g.strokeStyle = '#f2f2f2';
      g.lineWidth = h*.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + cw, y + hh); g.moveTo(x + cw, y);
      g.lineTo(x, y + hh); g.stroke(); g.lineWidth = h*.16; cross(); g.strokeStyle = '#c8102e';
      g.lineWidth = h*.08; cross(); }
  else if (k === 'dk'){ g.fillStyle = '#f2f2f2'; g.fillRect(x, y + h*.4, w, h*.2); g.fillRect(x + w*.28, y, h*.2, h); }
  else if (k === 'es'){ g.strokeStyle = '#b3261e'; g.lineWidth = h*.17; g.beginPath();
    g.moveTo(x + w*.12, y + h*.1); g.lineTo(x + w*.88, y + h*.9); g.moveTo(x + w*.88, y + h*.1);
    g.lineTo(x + w*.12, y + h*.9); g.stroke(); }
  else if (k === 'fr'){ g.fillStyle = '#d4a92a'; for (const v of [[.3, .32], [.7, .32], [.5, .7]]){ circle(g, x + w*v[0], y + h*v[1], h*.11); g.fill(); } }
  g.restore(); g.strokeStyle = 'rgba(20,12,6,.75)'; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, w - 1, h - 1); }
const prize = s => s.role === 'merchant' || s.role === 'treasure';
const strikeAt = s => prize(s) ? .4 : .22;
const nm = s => s.nation ? s.t.name : s.t.name.toLowerCase();
const an = t => (/^[AEIOU]/i.test(t) ? 'An ' : 'A ') + t;
const SHIPN1 = ['Sea', 'Black', 'Golden', 'Royal', 'Swift', 'Bold', 'Lucky', 'Red', 'Grey', 'Morning', 'Wandering', 'Iron', 'Silver', 'Merry', 'Night', 'Salt'];
const SHIPN2 = ['Wraith', 'Gull', 'Hind', 'Fortune', 'Venture', 'Revenge', 'Lark', 'Marlin', 'Tempest', 'Rose', 'Falcon', 'Dolphin', 'Star', 'Pelican', 'Serpent', 'Wind'];
const shipName = () => SHIPN1[rnd()*SHIPN1.length|0] + ' ' + SHIPN2[rnd()*SHIPN2.length|0];
const cleanName = (n, d) => { n = String(n == null ? '' : n).replace(/[^\w '.\-]/g, '').trim().slice(0, 22); return n || d || shipName(); };
function makeShip(cls, owner, role, x, y, h){
  const t = Object.assign({}, CLASSES[cls], livery(cls, owner, role)), nat = NAT[owner] ? owner : null;
  t.name = owner === 'player' ? 'Your ' + t.cname : role === 'treasure' ? 'Spanish plate ship' : (nat ? NAT[nat].adj : 'Pirate') + ' ' + (nat && cls === 'sloop' && role !== 'merchant' ? 'sloop of war' : cls === 'merchant' && nat !== 'en' ? 'merchantman' : t.cname);
  return { cls, owner, role, nation: nat, t, x, y, h, speed: 0, sail: owner === 'player' ? 0 : 1, hull: t.hull, maxHull: t.hull, sails: 100, guns: role === 'treasure' ? 0 : t.guns,
    speedMul: 1, reload: owner === 'player' ? 3.6 : 5, rl: [0, 0], pol: 1, tack: 1, tackT: 0, wakeT: 0, alive: true,
    sinking: null, surrendered: false, released: false, board: 0, cargo: 0, dest: null, announced: false,
    path: null, pi: 0, losT: rnd(), repT: 0, direct: false, stuck: 0, loiter: null,
    name: owner === 'player' ? shipName() : '', hitByPlayer: false, provoked: false, fleet: false, off: null, home: null, foe: null, scanT: rnd(), heel: 0,
    goods: role === 'treasure' ? { tobacco: 20 + (rnd()*30|0), cocoa: 10 + (rnd()*20|0) } : owner !== 'player' && role !== 'merchant' && rnd() < .6 ? { rum: 4 + (rnd()*10|0) } : null,
    crew: Math.round(t.crew*(owner === 'player' ? 1 : role === 'treasure' ? .45 : rand(.65, 1))) };
}

let assist = true, paceIdx = 1, chartOpen = false;
let state = 'title', p, ships, balls, pending, crates, parts, floaters;
let gold, plunder, shot, up, hunterT, curPort, nearPort, shake = 0, rankIdx = 0, overT = 0;
const RANKS = [[0,'Master'],[500,'Privateersman'],[1500,'Captain'],[3500,'Rover'],[6500,'Scourge of the Islands'],[10000,'Terror of the West Indies']];
const rankFor = v => { let i = 0; while (i+1 < RANKS.length && v >= RANKS[i+1][0]) i++; return i; };

const GOODS = { molasses:['Molasses', 10], sugar:['Sugar', 14], tobacco:['Tobacco', 20], rum:['Rum', 26], coffee:['Coffee', 30], cocoa:['Cocoa', 32], cloth:['Cloth and hardware', 40], indigo:['Indigo', 46], fish:['Salt fish', 12], flour:['Flour and provisions', 16], rice:['Rice', 22], naval:['Naval stores', 28] }, GK = Object.keys(GOODS);
const emptyHold = () => { const h = {}; GK.forEach(g => { h[g] = 0; }); return h; };
let hold, wars, polT = 0, newsLog = [], clock = 0, weather, melee = null, prizeShip = null, stormWarned = false, flash = 0;
const DAY = 300, MONTH = 90, MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let startName = 'Kingston', cal0 = 72, startCal = 72, calDone = 0, marque = null, courtDue = 0, hurr = null, hurrYear = -1, calm = false;
const calIdx = () => cal0 + Math.floor(clock/MONTH), calYear = () => 1750 + Math.floor(calIdx()/12), calMon = () => calIdx() % 12;
const dateStr = () => MONTHS[calMon()] + ' ' + calYear();
const setOwner = (name, k) => { const q = ports.find(q => q.name === name); if (q){ q.nk = k; q.nation = NAT[k]; } };
/* the Seven Years' War as it came to the Caribbean: [months since January 1750, the news, what changes] */
const EVENTS = [
  [53, 'Word from the Ohio country: Virginia militia and the French have traded shots. London and Versailles both say there is no war.', null],
  [65, 'Admiral Boscawen has seized two French ships of the line off Newfoundland. Still no war is declared.', null],
  [76, 'War! Great Britain has declared war on France. Governors are issuing letters of marque.', () => { wars.add('en-fr'); ['Kingston', 'Boston', 'New York', 'Cap-Français', 'Fort-Royal'].forEach(n => { const q = ports.find(x => x.name === n); if (q) marketEvent(q, 'naval', 1.3, 8, null); }); }],
  [102, 'Louisbourg has fallen to Amherst and Boscawen. French convoys to the islands grow scarce and well guarded.', () => { setOwner('Louisbourg', 'en'); }],
  [112, 'Guadeloupe has surrendered to a British expedition. Basse-Terre flies British colours.', () => { setOwner('Basse-Terre', 'en'); }],
  [118, 'Hawke has broken the French fleet in Quiberon Bay. The sea is Britain\'s.', null],
  [144, 'War! Spain has entered the war beside France. Spanish trade is now lawful prize for British privateers.', () => { wars.add('en-es'); }],
  [145, 'Rodney and Monckton have taken Martinique. Fort-Royal flies British colours.', () => { setOwner('Fort-Royal', 'en'); }],
  [151, 'Havana has fallen to Pocock and Albemarle after a two-month siege.', () => { setOwner('Havana', 'en'); }],
  [157, 'Peace is signed at Paris. Havana, Martinique and Guadeloupe are handed back; Florida, Mobile and the neutral islands go to Britain, and Louisiana to Spain. Every letter of marque is void.', () => { wars.clear(); setOwner('Fort-Royal', 'fr'); setOwner('Havana', 'es'); setOwner('Basse-Terre', 'fr'); ['St Augustine', 'Pensacola', 'Mobile', 'Saint-Georges', 'Roseau', 'Kingstown', 'Scarborough'].forEach(n => setOwner(n, 'en')); setOwner('New Orleans', 'es'); voidMarque(); later(() => { if (state === 'play') say('The war is over. You may retire at your home port governor\'s, or sail on.'); }, 4300); }]];
function voidMarque(){ marque = null; }
function calendarTick(){ while (calDone < EVENTS.length && EVENTS[calDone][0] <= calIdx()){ const e = EVENTS[calDone++];
  if (e[2]) e[2](); gazDate = MONTHS[e[0] % 12] + ' ' + (1750 + Math.floor(e[0]/12));
  news(e[1]); gazDate = null; if (curPort && state === 'port') renderPort(); }
  if (marque && !foesOf(marque).length){ marque = null; say('Peace: your letter of marque is void. Any ship you take now is piracy.'); } }
function monthTick(m){ payWages(m); calendarTick();
  if (m - lastCall >= 2) cheer(-3); /* long at sea */ if (fouling && state === 'play') foul = Math.min(1, foul + .04);
  if (officers.surgeon && p.crew < p.t.crew) p.crew = Math.min(p.t.crew, p.crew + 2);
  if (morale < 25 && p.crew > 12){ const n = Math.max(1, Math.round(p.crew*.08)); p.crew -= n; say('The hands are ' + moraleWord() + '. ' + n + ' have run.'); }
  rivalTick(); marketTick();
  if (contract && calIdx() > contract.until){ say('Too late: the freight for ' + contract.port.name + ' was wanted last month. The contract is void.'); repute(contract.nk, -2); contract = null; }
  if (mission && mission.until && calIdx() > mission.until){ say('Too late: the commission "' + mission.title + '" has lapsed.');
    if (mission.ships) mission.ships.forEach(t => { t.transport = false; }); mission = null; }
  if (!fleet && calIdx() >= 48) spawnFleet(false);
  const mo = calMon(); if (mo >= 5 && mo <= 10 && !calm && !hurr && hurrYear !== calYear() && rnd() < .3) startHurricane(); }
/* privateering: with a letter of marque the ships of your patron's enemies are lawful prize; anything else is piracy */
const lawful = s => !!marque && (s.owner === 'pirate' || atWar(marque, s.nation));
function sendIn(o, hf){ const base = CLASSES[o.cls].value*.35*hf;
  if (lawful(o)){ const v = Math.round(base*1.3); courtDue += v; courtList.push({ n: cap1(nm(o)) + (o.name ? ' ' + o.name : ''), v });
    if (courtList.length > 30) courtList.shift(); return 'A lawful prize: the court will condemn her for ' + v + ' gold, paid at any ' + NAT[marque].adj + ' port or your home port.'; }
  if (o.owner === 'pirate'){ const v = Math.round(base); gold += v; return 'A pirate hull, sold for ' + v + ' gold.'; }
  const v = Math.round(base*.6); gold += v; return 'No court will condemn her, so she is sold quietly for ' + v + ' gold.'; }
function payCourt(port){ if (courtDue > 0 && (port.name === homeName || marque && port.nk === marque && port.spec.sz >= 2)){ const v = courtDue, list = courtList.length ? courtList : [{ n: 'Prizes sent in', v }];
  courtDue = 0; courtList = []; gold += v; plunder += v; gaz('The prize court at ' + port.name + ' condemned ' + list.length + ' prize' + (list.length > 1 ? 's' : '') + ' and paid over ' + v + ' gold.', 'you');
    const tok = ++courtTok; later(() => { if (state === 'port' && curPort === port && tok === courtTok) openPaper('court', { port: port.name, list, total: v }); else say('The prize court has condemned your prizes: ' + v + ' gold paid over.'); }, 350); } }
const wkey = (a, b) => a < b ? a + '-' + b : b + '-' + a;
const atWar = (a, b) => !!a && !!b && a !== b && wars.has(wkey(a, b));
const foesOf = k => NKEYS.filter(o => atWar(k, o));
const holdUsed = () => GK.reduce((n, g) => n + hold[g], 0);
/* ---------- your fleet ---------- */
const FORMS = { column:'Line astern', abreast:'Line abreast', wedge:'Wedge' }, ORDERS = { line:'Line of battle', engage:'Engage at will', chase:'General chase', hold:'Hold fire' };
const FIRST = ['Henry','Anne','Diego','Jean','Pieter','Mary','Edward','Juan','Roche','Laurens','Tobias','Charlotte','Samuel','Isabel','Michel','Cornelis','Grace','Mateo'];
const LAST = ['Vane','Morrow','Delgado','Le Clerc','de Vries','Hale','Teague','Navarro','Brasil','Kidman','Marlowe','Bonnard','Ashby','Ortega','Grammont','Jol','Pike','Santoro'];
const MAXSQ = 8, MAXLAID = 8;
let formation = 'column', orders = 'line', spares = [], laidUp = [], homeName = 'Kingston', tavern = [];
