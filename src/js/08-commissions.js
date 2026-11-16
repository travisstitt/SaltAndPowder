function makeOffers(port){
  if (port.spec.land){ offers = []; return; }
  const k = port.nk, fs = foesOf(k), foe = fs[rnd()*fs.length|0], o = [];
  const others = ports.filter(q => q !== port && !hostile(q.nk) && !q.spec.land).sort((a, b) => Math.hypot(a.ox-port.ox, a.oy-port.oy) - Math.hypot(b.ox-port.ox, b.oy-port.oy));
  const t = others[Math.min(others.length-1, 1 + (rnd()*12|0))];
  if (t){ const d = Math.hypot(t.ox-port.ox, t.oy-port.oy);
    const aw = { en:['Falmouth', 31], es:['Cádiz', 27], fr:['Brest', 35], nl:['Amsterdam', 33], dk:['Copenhagen', 29] }[k];
    if (aw && rnd() < .3){ const w = waterNear(W - 260, Y(aw[1]), 150), d2 = Math.hypot(w[0]-port.ox, w[1]-port.oy);
      o.push({ type:'away', nk:k, name:aw[0], x:w[0], y:w[1], title:'Carry dispatches for ' + aw[0], text:'The ' + aw[0] + ' packet for Europe lies to at the eastern edge of the chart, ' + Math.round(d2/DEG*20) + ' leagues away. Hand the letters over at sea.', reward: Math.round((160 + d2*.13)/10)*10, rep:8 }); }
    else o.push({ type:'deliver', nk:k, port:t, title:'Carry dispatches to ' + t.name, text:'Sealed letters for the governor at ' + t.name + ', ' + Math.round(d/DEG*20) + ' leagues away. Paid on arrival.', reward: Math.round((100 + d*.11)/10)*10, rep:6 }); }
  const cls = ['cutter', 'schooner', 'brig'][Math.min(2, Math.floor(plunder/1500))];
  o.push(foe && rnd() < .5
    ? { type:'raid', nk:k, foe, need:2, have:0, title:'Raid the trade of ' + NAT[foe].land, text:'Take or sink two ' + NAT[foe].adj + ' merchantmen. Paid when the second is yours.', reward:500, rep:10 }
    : { type:'pirate', nk:k, cls, from:port, title:'Hunt down a wanted pirate', text:'A pirate ' + cls + ' has been raiding near ' + port.name + '. Sink her or take her. Her position will be marked on your chart.', reward: 300 + BOUNTY[cls]*2, rep:8 });
  { const ci = calIdx(), P = n => ports.find(q => q.name === n); /* the operations of the war, offered to those who hold the governor's commission */
    if (marque === k && k === 'en' && ci >= 84 && ci < 140 && P('Cap-Français').nk === 'fr') o.push({ type:'siege', nk:k, foe:'fr', port:P('Cap-Français'), need:3, have:0, until:ci + 12, svc:5, title:'Blockade Cap-Français', text:'The squadron off Saint-Domingue is short of cruisers. Take or sink three French ships within sight of Cap-Français inside a year.', reward:1200, rep:12 });
    if (marque === k && k === 'en' && ci >= 99 && ci < 102) o.push({ type:'siege', nk:k, foe:'fr', port:P('Louisbourg'), need:3, have:0, until:102, svc:8, title:'Join the siege of Louisbourg', text:'Boscawen\'s fleet is gathering at Halifax for Louisbourg. Take or sink three French ships off the fortress before it falls.', reward:2500, rep:18 });
    if (marque === k && k === 'en' && ci >= 142 && ci < 145) o.push({ type:'escort', nk:k, need:2, arrived:0, until:ci + 4, svc:6, title:'Escort the troops to Martinique', text:'Three transports with Monckton\'s regiments sail from here for Fort-Royal. See at least two of them safe into the bay; French cruisers will be waiting.', reward:1500, rep:14 });
    if (marque === k && k === 'en' && ci >= 148 && ci < 151) o.push({ type:'siege', nk:k, foe:'es', port:P('Havana'), need:3, have:0, until:151, svc:8, title:'Join the siege of Havana', text:'Pocock\'s fleet lies off the Morro. Take or sink three Spanish ships off Havana before the city falls.', reward:2500, rep:18 });
    if (marque === k && k === 'fr' && ci >= 96 && ci < 102 && P('Louisbourg').nk === 'fr') o.push({ type:'deliver', nk:k, port:P('Louisbourg'), svc:6, title:'Run dispatches and powder into Louisbourg', text:'The fortress is all but invested. Get through the British cruisers to Louisbourg before it falls.', reward:1600, rep:16 });
    if (marque === k && k === 'fr' && ci >= 76 && ci < 157) o.push({ type:'siege', nk:k, foe:'en', port:P('Kingston'), need:3, have:0, until:ci + 12, svc:6, title:'Cruise against the Jamaica trade', text:'The sugar convoys gather off Kingston. Take or sink three British ships within sight of the port inside a year.', reward:1500, rep:14 });
    if (marque === k && k === 'es' && ci >= 144 && ci < 157) o.push({ type:'siege', nk:k, foe:'en', port:P('Kingston'), need:3, have:0, until:ci + 10, svc:6, title:'Carry the war to Jamaica', text:'His Catholic Majesty is at war with England. Take or sink three British ships within sight of Kingston.', reward:1500, rep:14 });
    if (marque === k && k === 'es' && ci >= 148 && ci < 151) o.push({ type:'siege', nk:k, foe:'en', port:P('Havana'), need:2, have:0, until:151, svc:8, title:'Defend Havana', text:'The British are landing east of the Morro. Take or sink two of their ships off Havana.', reward:2200, rep:18 });
    if (marque === k && k === 'fr' && ci >= 76 && ci < 157 && port.nk === 'fr') o.push({ type:'siege', nk:k, foe:'en', port, need:2, have:0, until:ci + 12, svc:5, title:'Break the blockade of ' + port.name, text:'British cruisers lie off the roads. Take or sink two of them within sight of ' + port.name + ' inside a year.', reward:1200, rep:12 }); }
  if (atWar(k, 'es') && fleet && fleet.lead) o.push({ type:'treasure', nk:k, title:'Take a Spanish plate ship', text:'The plate fleet is at sea between Veracruz and Havana under a strong escort; the plate ships themselves carry no guns. Board one. Her cargo is yours and the crown pays a bounty besides.', reward:1500, rep:20 });
  if (port.spec.sz < 2) o.length = Math.min(o.length, 1); /* a magistrate has letters to send and nothing more */
  offers = o;
}
function spawnQuarry(w){ const s = makeShip(mission.cls, 'pirate', 'quarry', w[0], w[1], rnd()*TAU); s.home = w; s.t.name = 'Wanted pirate ' + s.t.cname; ships.push(s); mission.ship = s; }
function transport(x, y, h, dest){ const t = makeShip('merchant', 'en', 'merchant', x, y, h);
  t.dest = dest; t.transport = true; t.t.name = 'British troop transport'; t.cargo = 0;
  t.goods = null; ships.push(t); return t; }
function accept(i){
  mission = offers[i]; offers = [];
  if (mission.type === 'escort'){ const from = curPort || ports[0], dest = ports.find(q => q.name === 'Fort-Royal'); mission.dest = dest; mission.raidT = 75; mission.ships = [];
    for (let n = 0; n < 3; n++){ const w = waterNear(from.ox, from.oy, 150); mission.ships.push(transport(w[0], w[1], from.out, dest)); } }
  if (mission.type === 'pirate'){ let w = null;
    for (let n = 0; n < 60 && !w; n++){ const a = rnd()*TAU, d = rand(1300, 2600), x = mission.from.ox + Math.cos(a)*d, y = mission.from.oy + Math.sin(a)*d;
      if (x > 100 && y > 100 && x < W-100 && y < H-100 && !isNear(x, y)) w = [x, y]; }
    spawnQuarry(w || waterNear(mission.from.ox, mission.from.oy, 1500)); }
}
function restoreMission(m){
  const nk = NAT[m.nk] ? m.nk : 'en', base = { type: m.type, nk, title: String(m.title || 'Commission').slice(0, 80), reward: clamp(m.reward|0, 0, 5000), rep: clamp(+m.rep || 0, 0, 30) };
  if (m.type === 'deliver'){ const q = ports.find(q => q.name === m.port); if (q) mission = Object.assign(base, { port: q }); }
  else if (m.type === 'raid' && NAT[m.foe]) mission = Object.assign(base, { foe: m.foe, need: (m.need|0) || 2, have: m.have|0 });
  else if (m.type === 'pirate' && CLASSES[m.cls]){ mission = Object.assign(base, { cls: m.cls, from: ports[0] });
    spawnQuarry(m.sx > 100 && m.sy > 100 && m.sx < W-100 && m.sy < H-100 && !isNear(m.sx, m.sy) ? [+m.sx, +m.sy] : waterNear(p.x, p.y, 1500)); }
  else if (m.type === 'treasure') mission = base;
  else if (m.type === 'freight' && GOODS[m.g]){ const q = ports.find(q => q.name === m.port); if (q) mission = Object.assign(base, { g: m.g, tons: clamp(m.tons|0, 1, 400), port: q, until: m.until|0 }); }
  else if (m.type === 'siege' && NAT[m.foe]){ const q = ports.find(q => q.name === m.port);
    if (q) mission = Object.assign(base, { foe: m.foe, port: q, need: (m.need|0) || 2, have: m.have|0, until: m.until|0, svc: clamp(m.svc|0, 0, 10) }); }
  else if (m.type === 'escort' && Array.isArray(m.tr) && m.tr.length){ const dest = ports.find(q => q.name === 'Fort-Royal');
    mission = Object.assign(base, { need: 2, arrived: clamp(m.arrived|0, 0, 3), until: m.until|0, svc: clamp(m.svc|0, 0, 10), dest, raidT: 0, ships: [] });
    m.tr.slice(0, 3).forEach(v => { let x = +v[0], y = +v[1]; if (!(x > 50 && y > 50 && x < W-50 && y < H-50) || isLand(x, y)){ const w = waterNear(p.x, p.y, 300); x = w[0]; y = w[1]; } mission.ships.push(transport(x, y, 0, dest)); }); }
  else if (m.type === 'away' && m.ax > 0 && m.ay > 0) mission = Object.assign(base, { name: String(m.name || 'the').slice(0, 30), x: clamp(+m.ax, 50, W-50), y: clamp(+m.ay, 50, H-50) });
}
function missionText(){ const m = mission;
  return m.type === 'deliver' ? 'Dispatches for ' + m.port.name : m.type === 'away' ? 'Dispatches for the ' + m.name + ' packet, at the eastern edge of the chart' : m.type === 'freight' ? m.tons + ' tons of ' + GOODS[m.g][0].toLowerCase() + ' for ' + m.port.name + ' by ' + MONTHS[m.until % 12] + ' (you hold ' + hold[m.g] + ')' : m.type === 'raid' ? NAT[m.foe].adj + ' merchantmen taken: ' + m.have + ' of ' + m.need
    : m.type === 'pirate' ? 'Hunt the wanted pirate ' + m.cls : m.type === 'siege' ? NAT[m.foe].adj + ' ships taken or sunk off ' + m.port.name + ': ' + m.have + ' of ' + m.need : m.type === 'escort' ? 'Transports safe at Fort-Royal: ' + m.arrived + ' of ' + m.need : 'Board a plate ship'; }
function missionTarget(){ const m = mission; if (!m) return null;
  if (m.type === 'deliver' || m.type === 'freight') return { x: m.port.x, y: m.port.y, name: m.port.name, port: m.port };
  if (m.type === 'away') return { x: m.x, y: m.y, name: m.name + ' packet' };
  if (m.type === 'siege') return { x: m.port.x, y: m.port.y, name: m.port.name, port: m.port };
  if (m.type === 'escort'){ const t = m.ships.find(s => !s.gone && s.sinking == null); return t ? { x: t.x, y: t.y, name: 'Troop transports', s: t } : null; }
  if (m.type === 'pirate' && m.ship && m.ship.sinking == null) return { x: m.ship.x, y: m.ship.y, name:'Wanted pirate', s: m.ship };
  if (m.type === 'treasure' && fleet && fleet.lead) return { x: fleet.lead.x, y: fleet.lead.y, name:'Treasure fleet', s: fleet.lead };
  return null; }
function complete(){ const m = mission; mission = null; earn(m.reward, p.x, p.y);
  repute(m.nk, m.rep); chime(); if (m.nk === marque) svc(m.svc || 1); gaz('The ' + p.name + ' has discharged a commission for ' + NAT[m.nk].land + ': ' + m.title.toLowerCase() + '.', 'you');
  say('Commission fulfilled for ' + NAT[m.nk].land + ': ' + m.reward + ' gold paid.'); }
function onPrize(s, boarded){
  { const law = s.owner === 'pirate' || lawful(s); boarded ? stats.taken++ : stats.sunk++; law ? stats.lawful++ : stats.unlawful++;
    if (s.rival != null && rivals[s.rival] && rivals[s.rival].alive){ const R0 = RIVALS[s.rival], v = rivals[s.rival], prize2 = 600 + 250*v.wins;
      v.alive = false; earn(prize2, s.x, s.y); cheer(10); if (lawful(s) || s.owner === 'pirate') svc(4);
      gaz(R0.name + ' and the ' + R0.ship + ' are ' + (boarded ? 'taken' : 'sunk') + ' by the ' + p.name + offWhere(s.x, s.y) + ', after ' + v.wins + ' prizes.', 'you');
      later(() => say('That was ' + R0.name + '. The merchants of every port he troubled have put up ' + prize2 + ' gold for you.'), 2600); }
    if (s.packet && boarded){ earn(150, s.x, s.y); if (lawful(s)){ svc(1); repute(marque, 2);
      } later(() => say('Her mail bags hold dispatches worth 150 gold' + (lawful(s) ? ', and the governor will be glad of them.' : '.')), 2800); }
    if (lawful(s)) svc(s.role === 'treasure' ? 4 : s.role === 'merchant' ? 1 : s.t.hull >= 230 ? 3 : 2); }
  gaz('The ' + nm(s) + (boarded ? ' was taken by the ' : ' was sunk by the ') + p.name + (squad().length ? ' and her consorts' : '') + offWhere(s.x, s.y) + '.', 'you');
  if (!s.nation) NKEYS.forEach(k => repute(k, 2)); else offend(s, boarded ? 8 : 12);
  const m = mission; if (!m) return;
  if (m.type === 'raid' && s.role === 'merchant' && s.nation === m.foe){ if (++m.have >= m.need) complete(); }
  else if (m.type === 'pirate' && s === m.ship) complete();
  else if (m.type === 'treasure' && s.role === 'treasure' && boarded) complete();
  else if (m.type === 'siege' && s.nation === m.foe && Math.hypot(s.x - m.port.x, s.y - m.port.y) < 2800){ if (++m.have >= m.need) complete(); }
}

const GS = [[-83.6, 24.0], [-80.7, 24.4], [-79.6, 26.2], [-79.7, 28.5], [-79.3, 31], [-77, 33.6], [-74.8, 35.4], [-71, 37.5], [-65, 39.6], [-59, 41]].map(v => [X(v[0]), Y(v[1])]);
let gsTold = false; const wrecks = [];
function streamAt(x, y){ if (y > GS[0][1] + 300 || y < GS[GS.length - 1][1] - 300) return null; /* the Stream sets north-east at two knots and more */
  for (let i = 0; i < GS.length - 1; i++){ const a = GS[i], b = GS[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx*dx + dy*dy, t = clamp(((x - a[0])*dx + (y - a[1])*dy)/L2, 0, 1), d = Math.hypot(x - a[0] - dx*t, y - a[1] - dy*t);
    if (d < 280){ const L = Math.sqrt(L2), f = 26*(1 - d/280); return [dx/L*f, dy/L*f]; } } return null; }
