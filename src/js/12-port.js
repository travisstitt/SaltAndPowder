function freightOffer(port){ if (port.freight === undefined || port.freight && port.freight.made < calIdx() - 2){ port.freight = null;
  if (rnd() < .6){ const dests = ports.filter(q => q !== port && !q.spec.land && admits(q) && q.spec.dm.length && Math.hypot(q.ox - port.ox, q.oy - port.oy) < 9000);
  if (dests.length){ const q = dests[rnd()*dests.length|0], g = q.spec.dm[rnd()*q.spec.dm.length|0], tons = 20 + 10*(rnd()*4|0), d = Math.hypot(q.ox - port.ox, q.oy - port.oy);
      port.freight = { g, tons, port: q, months: 3 + Math.round(d/2500), reward: Math.round(tons*GOODS[g][1]*1.9 + d*.03), made: calIdx() }; } } } return port.freight; }
function freightCheck(port){ const m = contract; if (m && m.port === port && hold[m.g] >= m.tons){ hold[m.g] -= m.tons;
  contract = null; earn(Math.round(m.reward*eco.trade), p.x, p.y); repute(m.nk, m.rep);
  chime(); gaz('The ' + p.name + ' landed ' + m.tons + ' tons of ' + GOODS[m.g][0].toLowerCase() + ' at ' + port.name + ' under contract.', 'you');
  later(() => say('The consignee at ' + port.name + ' takes delivery of ' + m.tons + ' tons of ' + GOODS[m.g][0].toLowerCase() + ' and pays ' + Math.round(m.reward*eco.trade) + ' gold.'), 300); } }
function openPort(port){ note(port); freightCheck(port); if (paceOut == null){ paceOut = paceIdx;
  setPace(0, true); } /* in harbour the world goes by slowly; your sailing pace comes back when you weigh */ port.greased = false;
  { const m = Math.floor(clock/MONTH);
  if (m > lastCall || lastCall === 0) cheer(3); lastCall = m; } payCourt(port); setChart(false);
  state = 'port'; curPort = port; held.left = held.right = false; portTab = 'yard';
  p.x = port.ox; p.y = port.oy; p.h = port.out; p.speed = 0; p.sail = 0; // riding at anchor, bow to the open sea
  if (mission && mission.type === 'deliver' && mission.port === port) complete();
  if (course === port){ course = null; autoHelm = false; routeLine = null; } setPaused(false);
  squad().forEach(s => { if (s.docked === port && (!s.task || s.task.type !== 'trade')) setTask(s, { type: 'fleet' }); }); /* consorts lying here come under your eye again */
  squad().filter(inCompany).forEach((s, i) => { if (s.task && s.task.type === 'port' && s.task.port === port) setTask(s, { type: 'fleet' }); const k = Math.ceil((i+1)/2), sd = i % 2 ? -1 : 1, x = port.ox - Math.sin(port.out)*sd*75*k + Math.cos(port.out)*30, y = port.oy + Math.cos(port.out)*sd*75*k + Math.sin(port.out)*30;
    if (!isLand(x, y)){ s.x = x; s.y = y; } else { s.x = port.ox; s.y = port.oy; } s.h = port.out; s.speed = 0; s.path = null; });
  tavern = [newCaptain(1, 3), newCaptain(2, 4)]; if (port.spec.sz === 3) tavern.push(newCaptain(3, 5));
  makeOffers(port); autosave();
  $('port').hidden = false; renderPort(); $('leaveBtn').focus(); }
function closePort(){ if (chartOpen) setChart(false); if (paceOut != null){ setPace(paceOut, true);
  paceOut = null; } courtTok++; if (!$('paper').hidden) closeMenu(); autosave(); $('port').hidden = true;
  state = 'play'; document.activeElement && document.activeElement.blur(); }
let waiting = false;
function waitOut(){ if (waiting || !hurr) return; waiting = true; const port = curPort; /* the hours go by as fast as they can be reckoned, a slice each frame, until the storm is past */
  const step = () => { const t0 = performance.now(); let n = 0; while (hurr && state === 'port' && n++ < 6000 && performance.now() - t0 < 13) update(.1);
    if (hurr && state === 'port'){ requestAnimationFrame(step); return; } waiting = false;
      if (state === 'port' && !menuOpen && !chartOpen) renderPort(); if (!hurr) say('The hurricane has blown itself out. The sky is clearing over ' + port.name + '.'); };
  step(); }
function ashore(seconds){ for (let t = 0; t < seconds; t += .05) update(.05); } // work in port takes time; the world sails on
/* one row of a ledger: a name, a line of detail, a value, and any number of buttons */
function uiRow(ul, name, desc, amt, btns, rerender, cls){
  const e = document.createElement('li'); if (cls) e.className = cls; const sp = document.createElement('span'), sm = document.createElement('small'), right = document.createElement('span'); right.className = 'btns';
  sp.textContent = name; sm.textContent = desc; sp.appendChild(sm);
  if (amt){ const a = document.createElement('span'); a.className = 'amt'; a.textContent = amt; right.appendChild(a); }
  (btns || []).forEach(v => { if (!v) return; const b = document.createElement('button'); b.type = 'button'; b.id = v[0]; b.textContent = v[1]; b.disabled = !v[2]; b.addEventListener('click', () => { dirty(); v[3](); dirty(); rerender(v[0]); }); right.appendChild(b); });
  e.appendChild(sp); e.appendChild(right); ul.appendChild(e);
}
const hurt = s => Math.ceil(s.maxHull - s.hull) + Math.ceil(100 - s.sails);
function mend(s, c){ const h = Math.min(c, Math.ceil(s.maxHull - s.hull)); s.hull = Math.min(s.maxHull, s.hull + h);
  c -= h; const v = Math.min(c, Math.ceil(100 - s.sails)); s.sails = Math.min(100, s.sails + v); return c - v; }
function renderPort(focusId){
  $('portName').textContent = curPort.name; $('portNation').textContent = curPort.nation.adj + (curPort.spec.land ? ' landing' : curPort.spec.sz >= 3 ? ' city' : curPort.spec.sz === 2 ? ' town' : ' port') + (curPort.spec.free ? ' · free port' : '') + (wars.size && foesOf(curPort.nk).length ? ' · at war' : '') + (hurr ? ' · hurricane ' + (hurr.stage ? 'blowing' : 'coming') : '') + (dispNew ? ' · ' + dispNew + ' dispatch' + (dispNew > 1 ? 'es' : '') + ' unread' : '') + (squad().some(o => o.docked === curPort) ? ' · ' + squad().filter(o => o.docked === curPort).map(o => o.name).join(', ') + ' lying here' : '') + (curPort.name === homeName ? ' · your home port' : '');
    $('portGold').textContent = gold;
  document.querySelectorAll('#townTabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === portTab)));
  paintTown();
  const ul = $('ledger'); ul.textContent = '';
  const R = (name, desc, amt, btns) => uiRow(ul, name, desc, amt, btns, renderPort), T = (cls, t) => ledgerText(ul, cls, t);
  if (hurr){ T('sec', hurr.stage ? 'A hurricane is blowing' : 'A hurricane is coming'); /* in harbour you are safe; this passes the time until it is over */
    R('Wait out the hurricane', (hurr.stage ? 'It is on the coast now. ' : 'The glass is falling and a long swell is running in. ') + 'Lie here at anchor, with topmasts struck, until it has passed. Nothing can touch you in port; the world outside is not so lucky.', '', [['waitHurr', waiting ? 'Riding it out…' : 'Wait it out', !waiting, waitOut]]); }
  if (portTab === 'yard'){
    const all = [p].concat(squad().filter(inCompany)), total = all.reduce((n, s) => n + hurt(s), 0), pay = Math.min(total, gold);
    T('sec', 'Shipwright');
    if (fouling){ const c = 20 + Math.round(p.t.len*.5); R('Careen and scrape her bottom', foul > .05 ? 'Weed and barnacle cost her ' + Math.round(foul*18) + ' per cent of her speed.' : 'Her bottom is clean.', c + ' gold', [['careen', 'Careen', gold >= c && foul > .05, () => { gold -= c; foul = 0; ashore(40); }]]); }
    R('Repair ' + (all.length > 1 ? 'the whole fleet' : 'your ' + p.t.cname), total ? total + ' points of damage to hulls and sails' + (pay < total ? ', and you can pay for ' + pay : '') + '. The work takes time, and the world sails on.' : 'Every plank and sail is sound.', '',
      [['rAll', total ? 'Repair: ' + pay + ' gold' : 'No need', total > 0 && gold > 0, () => { let c = pay; gold -= pay; all.forEach(s => { c = mend(s, c); }); ashore(4 + pay*.1); }]]);
    R('Refit and manage your ships', 'Guns, timbers, sailcloth and gun drill for each ship, crew transfers, captains, selling and laying up.', '', [['toFleet', 'Open the fleet', true, () => openFleet('F')]]);
    if (curPort.spec.land) T('txt', 'There is no shipwright at a landing: only a careenage, a forge and whatever timber is to hand.'); else {
    T('sec', 'Ships for sale');
    [['snow', 'A handy trader: 110 tons of hold and two guns a side.'], ['merchant', 'A West Indiaman: 160 tons of hold, slow, and no match for a cruiser. Give her an escort.']].forEach(v => { const k = CLASSES[v[0]]; R('Fit out a ' + k.cname + ' for your fleet', v[1] + ' She joins under your first mate; put a captain in her from the fleet screen.', k.price + ' gold', [['fit_' + v[0], 'Fit her out', gold >= k.price && squad().length < MAXSQ, () => { gold -= k.price; const w = waterNear(p.x, p.y, 120); addFleet({ cls: v[0], hf: 1, sails: 100, crew: Math.round(k.crew*.8), cap: mate() }, w[0], w[1], p.h); ashore(20); }]]); });
    T('txt', 'You command a ' + p.t.cname + '. The yard allows ' + tradeIn() + ' gold for her in trade, and her refits carry over to the new ship.');
    if (!curPort.spec.dock) T('txt', 'Ships of the line are built and sold only at the royal dockyards: Havana, English Harbour and Halifax.');
    YARD.forEach(c => { if (c === p.cls || CLASSES[c].dock && !(curPort.spec.dock || inService() && navy.rank >= 2 && curPort.nk === marque)) return; const k = CLASSES[c], net = Math.max(0, k.price - tradeIn());
      R(cap1(k.cname), 'Rated ' + k.rate + ' guns · ' + k.guns + ' a side in play · hull ' + k.hull + ' · speed ' + k.speed + ' · crew ' + k.crew + ' · hold ' + k.hold + ' · ' + (k.turn >= 1.25 ? 'nimble' : k.turn >= 1.05 ? 'handy' : k.turn >= .9 ? 'steady' : 'ponderous'), net + ' gold',
        [['y_' + c, 'Buy', gold >= net, () => { gold -= net; const o = p; p = makeShip(c, 'player', 'player', o.x, o.y, o.h); refit(); p.hull = p.maxHull; p.crew = Math.min(o.crew, p.t.crew); trimHold(); ashore(25); }]]); }); }
  } else if (portTab === 'market'){
    T('sec', 'Market');
    T('txt', 'Hold: ' + holdUsed() + ' of ' + holdCap() + ' tons across your fleet. Goods are cheap where they are made and dear where they are wanted.');
    if (curPort.spec.land) T('txt', 'A landing deals only in what it makes and what it lacks. No customs officer has ever been seen here.');
    const sellGoods = (g, n) => { const pr = price(curPort, g), sell = Math.max(1, Math.round(pr*.9));
      if (g === 'cloth' && curPort.home === 'es' && curPort.nk === 'es' && !curPort.spec.land && !curPort.greased && rnd() < .22){ const fine = Math.min(gold, n*4);
        hold[g] -= n; gold -= fine; repute('es', -2); later(() => say('The customs officers were waiting on the quay. Your ' + n + ' tons are seized and you are fined ' + fine + ' gold.'), 50); return; }
      gold += Math.round(n*sell*eco.trade); hold[g] -= n; press(curPort, g, -n); repute(curPort.nk, .05*n); };
    GK.forEach(g => { if (curPort.spec.land && curPort.spec.mk.indexOf(g) < 0 && curPort.spec.dm.indexOf(g) < 0) return; const pr = price(curPort, g), sell = Math.max(1, Math.round(pr*.9)), room = Math.max(0, Math.min(holdCap() - holdUsed(), Math.floor(gold/pr))), n = Math.min(10, room), have = hold[g], bk = bestKnown(g, curPort.name), ev = (curPort.ev || []).find(e => e.g === g && e.until >= calIdx());
      const tip = bk.hi && bk.hi[1] > pr*1.12 ? ' · ' + bk.hi[1] + ' at ' + bk.hi[0] + ' ' + ago(bk.hi[2]) : bk.lo && bk.lo[1] < pr*.85 ? ' · only ' + bk.lo[1] + ' at ' + bk.lo[0] + ' ' + ago(bk.lo[2]) : '';
      uiRow(ul, GOODS[g][0], (ev ? (ev.mul > 1 ? 'short here · ' : 'a glut here · ') : curPort.spec.mk.indexOf(g) >= 0 ? 'made here, cheap · ' : curPort.spec.dm.indexOf(g) >= 0 ? (g === 'cloth' && curPort.home === 'es' ? 'forbidden by Spain · ' : 'wanted here · ') : '') + 'hold ' + have + ' t' + tip, pr + ' a ton' + (mkt(curPort, g) > 1.04 ? ' ▲' : mkt(curPort, g) < .96 ? ' ▼' : ''), [
        ['buy_' + g, 'Buy ' + (n || 10), n > 0, () => { gold -= n*pr; hold[g] += n; press(curPort, g, n); }], ['buymax_' + g, 'Fill', room > 10, () => { gold -= room*pr; hold[g] += room; press(curPort, g, room); }],
        ['sell10_' + g, 'Sell 10', have > 10, () => sellGoods(g, 10)], ['sell_' + g, have ? 'Sell ' + have + ' for ' + have*sell : 'Sell all', have > 0, () => sellGoods(g, have)]], renderPort, 'tight'); });
    if (contract) T('txt', 'Freight in hand: ' + contract.tons + ' tons of ' + GOODS[contract.g][0].toLowerCase() + ' for ' + contract.port.name + ' by ' + MONTHS[contract.until % 12] + ', ' + contract.reward + ' gold on delivery. You hold ' + hold[contract.g] + ' tons.');
    if (!curPort.spec.land && !contract){ const fr = freightOffer(curPort); if (fr) R('Freight wanted: ' + fr.tons + ' tons of ' + GOODS[fr.g][0].toLowerCase() + ' for ' + fr.port.name, 'A merchant here will pay well above the market for it landed at ' + fr.port.name + ' within ' + fr.months + ' months. You find the goods; he pays on delivery.', fr.reward + ' gold', [['freight', 'Take the contract', true, () => { contract = { type: 'freight', nk: curPort.nk, g: fr.g, tons: fr.tons, port: fr.port, until: calIdx() + fr.months, reward: fr.reward, rep: 4, title: 'Land ' + fr.tons + ' tons of ' + GOODS[fr.g][0].toLowerCase() + ' at ' + fr.port.name }; curPort.freight = null; }]]); }
    if (curPort.name === homeName){ T('sec', 'Your warehouse'); const used = GK.reduce((n, g) => n + (store2[g] || 0), 0);
      T('txt', used + ' of 400 tons stored. Goods kept here wait for a better price or a contract.');
      GK.forEach(g => { const have = hold[g], st = store2[g] || 0; if (!have && !st) return; const inn = Math.min(have, 400 - used), out = Math.min(st, Math.max(0, holdCap() - holdUsed()));
        uiRow(ul, GOODS[g][0], 'aboard ' + have + ' t · stored ' + st + ' t', '', [['store_' + g, 'Store ' + inn, inn > 0, () => { hold[g] -= inn; store2[g] = st + inn; }], ['take_' + g, 'Take ' + out, out > 0, () => { store2[g] = st - out; hold[g] += out; }], ['sellst_' + g, 'Sell stored', st > 0, () => { const sell = Math.max(1, Math.round(price(curPort, g)*.9)); gold += st*sell; press(curPort, g, -st); store2[g] = 0; }]], renderPort, 'tight'); }); }
    if (curPort.home === 'es' && curPort.nk === 'es' && hold.cloth > 0 && !curPort.greased){ const c = 20 + hold.cloth*3;
      R('Grease the customs officer', 'Landing foreign cloth and hardware here is smuggling. Paid, he will be looking the other way this visit; unpaid, he may seize the lot.', c + ' gold', [['grease', 'Pay him', gold >= c, () => { gold -= c; curPort.greased = true; }]]); }
  } else if (portTab === 'tavern'){
    const need = p.t.crew - p.crew, hire = Math.min(10, need, Math.floor(gold/8));
    T('sec', 'The ship\'s company');
    T('txt', 'The hands are ' + moraleWord() + '. Prize money, pay and a run ashore lift them; long cruises, lost fights and unpaid wages do not.');
    { const c = Math.max(10, p.crew*2); R('Stand the hands a run ashore', 'Rum, music and a day\'s liberty.', c + ' gold', [['liberty', 'Pay for it', gold >= c && morale < 95, () => { gold -= c; cheer(14); ashore(20); }]]); }
    if (curPort.spec.sz >= 2 && !curPort.spec.land) Object.keys(OFFICERS).forEach(k => { if (!officers[k]) R(OFFICERS[k][0] + ' seeking a berth', OFFICERS[k][1], '250 gold', [['of_' + k, 'Sign him', gold >= 250, () => { gold -= 250; officers[k] = true; }]]); });
    T('sec', 'Hands for hire');
    R('Sign on hands for your flagship', 'Guns reload slowly below half strength, and boarding is decided by numbers. Hire for your consorts in the fleet screen.', p.crew + ' of ' + p.t.crew,
      [['crew', hire > 0 ? 'Hire ' + hire + ': ' + hire*8 + ' gold' : need ? '8 gold a hand' : 'Full crew', hire > 0, () => { gold -= hire*8; p.crew += hire; ashore(4); }]]);
    T('sec', 'Captains for hire');
    if (!tavern.length) T('txt', 'No captains are looking for a ship here today.');
    tavern.forEach((c, i) => R('Capt. ' + c.name + ' ' + stars(c), 'Gunnery ' + c.gun + ' (faster, truer broadsides) · seamanship ' + c.sea + ' (speed).', capCost(c) + ' gold',
      [['cap_' + i, 'Hire', gold >= capCost(c) && spares.length < 6, () => { gold -= capCost(c); spares.push(c); tavern.splice(i, 1); }]]));
    T('txt', spares.length ? 'Spare captains with you: ' + spares.map(c => c.name + ' ' + stars(c)).join(', ') + '. Appoint them in the fleet screen; the best takes the next ship you capture.' : 'You have no spare captains. A captured ship sails under your first mate until you appoint one.');
  } else {
    T('sec', "Governor's commissions");
    if (mission) R(mission.title, missionText() + '. Sworn to ' + NAT[mission.nk].land + ', pays ' + mission.reward + ' gold.', '', [['m_drop', 'Abandon', true, () => { if (mission.ship) mission.ship.role = 'hunter'; mission = null; makeOffers(curPort); }]]);
    else if (!offers.length) T('txt', 'The governor has nothing for you today.');
    else offers.forEach((o, i) => R(o.title, o.text, o.reward + ' gold', [['m_' + i, 'Accept', true, () => accept(i)]]));
    if (marque && curPort.nk === marque){ const nx = NAVY[navy.k === marque ? navy.rank + 1 : 1], pts = navy.k === marque ? navy.pts : 0, rk = navy.k === marque ? navy.rank : 0;
      T('sec', 'The ' + NAT[marque].adj + ' service');
      const perk = ['', 'A bounty of 400 gold.', 'A bounty of 800 gold, and every ' + NAT[marque].adj + ' yard will build you ships of the line.', 'The crown gives you a frigate.', 'The crown gives you a fifty-gun ship, and half your wages are borne on the establishment.'];
      if (nx && pts >= nx[0]) R('Promotion to ' + nx[1], perk[rk + 1], '', [['promote', 'Accept', true, () => { if (navy.k !== marque) navy = { k: marque, pts: 0, rank: 0 }; navy.rank++; const r = navy.rank; if (r === 1) gold += 400; else if (r === 2) gold += 800;
        else { const d = { cls: r === 3 ? 'frigate' : 'fifty', hf: 1, sails: 100, crew: r === 3 ? 150 : 210, cap: mate() };
          if (squad().length < MAXSQ){ const w = waterNear(p.x, p.y, 120); addFleet(d, w[0], w[1], p.h);
          } else if (laidUp.length < MAXLAID) laidUp.push({ cls: d.cls, hf: 1, sails: 100, crew: d.crew, cap: mate(), name: shipName() });
          else gold += r === 3 ? 4000 : 6500; }
        chime(); gaz('The master of the ' + p.name + ' is made ' + NAVY[r][1] + ' in the ' + NAT[marque].adj + ' service.', 'you'); }]]);
      else T('txt', (rk ? NAVY[rk][1] + ' in the ' + NAT[marque].adj + ' service. ' : 'You serve as a privateer. ') + (nx ? 'Lawful prizes and commissions count toward ' + nx[1] + ': ' + pts + ' of ' + nx[0] + '.' : 'There is no higher rank for a sea officer in these waters.')); }
    if (NKEYS.some(k => captives[k] > 0)){ T('sec', 'Prisoners of war');
      NKEYS.forEach(k => { const n = captives[k]; if (!n) return; const own = curPort.nk === k, foe = atWar(curPort.nk, k), v = n*(own ? 180 : 110);
        if (own || foe) R((own ? 'Ransom ' : 'Hand over ') + n + ' ' + NAT[k].adj + ' officer' + (n > 1 ? 's' : ''), own ? 'Their own governor pays to have them back, and thinks the better of you.' : 'Head money from the crown, and they will be exchanged by cartel.', v + ' gold', [['pow_' + k, own ? 'Ransom' : 'Hand over', true, () => { captives[k] = 0; gold += v; repute(own ? k : curPort.nk, n*2); if (!own) svc(Math.ceil(n/2)); }]]);
        else T('txt', n + ' ' + NAT[k].adj + ' officer' + (n > 1 ? 's are' : ' is') + ' aboard on parole. Their own governors, or their enemies\', will pay for them.'); }); }
    T('sec', 'Letter of marque');
    if (curPort.spec.sz < 2) T('txt', curPort.spec.land ? 'There is no governor here, and no one to ask your business.' : 'Letters of marque are issued only by the governors of the larger towns.');
      else { const k = curPort.nk, fs = foesOf(k), names = fs.map(f => NAT[f].land).join(' and ');
      if (marque === k) T('txt', 'You hold a ' + NAT[k].adj + ' commission against ' + names + '. Their ships are lawful prize; prizes you send in are condemned by the court and paid here' + (courtDue ? ' (' + courtDue + ' gold awaiting you at a ' + NAT[k].adj + ' port)' : '') + '.');
      else if (fs.length && !hostile(k)) R('Take a commission from ' + NAT[k].land, 'A letter of marque against ' + names + '. Their ships become lawful prize, the prize court pays more for hulls you send in, and only they will hold it against you.' + (marque ? ' It replaces your ' + NAT[marque].adj + ' letter.' : ''), '150 gold',
        [['marque', 'Sign', gold >= 150, () => { gold -= 150; marque = k; repute(k, 4); chime(); gaz('The governor at ' + curPort.name + ' has granted the ' + p.name + ' a letter of marque against ' + names + '.', 'you'); }]]);
      else T('txt', fs.length ? 'The governor will not commission an enemy of the crown.' : NAT[k].land.replace(/^t/, 'T') + ' is at peace, and no letters are being issued. ' + (marque ? '' : 'Any ship you take without one is piracy, and every nation will mark it.')); }
    T('sec', 'Standing and news');
    T('txt', dateStr() + '. ' + NKEYS.map(k => NAT[k].land.replace(/^the /, '') + ': ' + standWord(standing[k])).join(' · ') + '. At war: ' + ([...wars].map(w => { const a = w.split('-'); return Land(a[0]) + ' and ' + NAT[a[1]].land; }).join('; ') || 'no one') + '.');
    newsLog.slice(0, 2).forEach(n => T('txt', n));
    const w = NKEYS.filter(hostile).sort((a, b) => standing[a] - standing[b])[0];
    if (w){ const c = 300 + Math.round((-25 - standing[w])*8);
      R('Buy a pardon from ' + NAT[w].land, 'Ends the hostility and reopens ' + NAT[w].adj + ' ports.', c + ' gold', [['pardon', 'Buy', gold >= c, () => { gold -= c; standing[w] = -10;
        ships.forEach(s => { if (s.nation === w){ s.provoked = false; s.hitByPlayer = false; if (s.role === 'hunter') s.role = 'patrol'; } }); if (w === 'es' && fleet) fleet.alarm = false; }]]); }
    if (curPort.name !== homeName) R('Make ' + curPort.name + ' your home port', 'Ships laid up at ' + homeName + ' are brought round.', '400 gold', [['home', 'Settle here', gold >= 400, () => { gold -= 400; homeName = curPort.name; ashore(10); }]]);
    else { T('txt', curPort.name + ' is your home port. Lay ships up here from the fleet screen.');
      R('Retire from the sea', 'Swallow the anchor, come ashore for good, and hear how the islands will remember you. This ends the voyage.', '', [['retire', 'Retire', true, () => ask('Come ashore for good?', 'Your voyage ends here at ' + homeName + ' and your fortune is counted.', [['r_yes', 'Retire ashore', 'The voyage ends.', true, retire], ['r_no', 'Not yet', 'There is more sea to cross.', true, () => {}]])]]); }
  }
  if (menuOpen) return;
  const f = focusId && $(focusId); if (f && !f.disabled) f.focus(); else if (focusId) $('leaveBtn').focus();
}
/* ---------- the town, seen from above and painted with the same brush as the sea: same water, shallows, sand, trees, roofs and ships ---------- */
const TW = 1640, TH = 560; let townArt = null, townHover = null;
const TOWN_ROOFS = { tile:[['#b9563a','#8f3a26'],['#c56a44','#9a4a2c'],['#a84a30','#7c3220']], slate:[['#6f7780','#525a62'],['#7d8288','#5e646a'],['#8a6f5a','#6a5242']],
  mansard:[['#5f7187','#44546a'],['#6d7b8c','#505d6e'],['#54657a','#3f4d60']], dutch:[['#b5442e','#8a3220'],['#3f6f9e','#2d5378'],['#d6a13a','#a87a22'],['#5d8f5a','#426b40'],['#4a4444','#2f2c2c']], thatch:[['#c2a35c','#9a7d3e'],['#b3934f','#8a6d35']], clap:[['#5c4b3c','#3f3228'],['#6b5a48','#4b3d30'],['#7a2f24','#571f18'],['#4d4a48','#343230']], pastel:[['#6f7780','#525a62'],['#8a5a48','#6a4232'],['#7d8288','#5e646a']] };
function roofShadow(g, x, y, w, d, rot, lift){ for (const v of [[1.25, .13], [.85, .16], [.5, .16]]){ g.save();
  g.translate(x + 4*lift*v[0], y + 6*lift*v[0]); g.rotate(rot); g.fillStyle = 'rgba(8,26,22,' + v[1] + ')';
  g.fillRect(-w/2 - 2, -d/2 - 2, w + 4, d + 4); g.restore(); } }
function roofRect(g, x, y, w, d, rot, rf, wall, tiles){ // a pitched roof with a lit slope and a shaded one, a ridge, courses of tile, and a strip of wall showing under the eave
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = wall; g.fillRect(-w/2 - 1.8, -d/2 - 1.8, w + 3.6, d + 6); g.fillStyle = 'rgba(60,40,22,.3)'; g.fillRect(-w/2 - 1.8, d/2 + 1.6, w + 3.6, 2.6);
  g.fillStyle = 'rgba(45,30,18,.55)'; for (let i = -w/2 + 4; i < w/2 - 3; i += 7) g.fillRect(i, d/2 + 2, 2.2, 1.8);
  g.fillStyle = rf[0]; g.fillRect(-w/2, -d/2, w, d/2); let gr = g.createLinearGradient(0, -d/2, 0, 0);
    gr.addColorStop(0, 'rgba(0,0,0,.14)'); gr.addColorStop(1, 'rgba(255,255,255,.24)');
    g.fillStyle = gr; g.fillRect(-w/2, -d/2, w, d/2);
  g.fillStyle = rf[1]; g.fillRect(-w/2, 0, w, d/2); gr = g.createLinearGradient(0, 0, 0, d/2);
    gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = gr; g.fillRect(-w/2, 0, w, d/2);
  g.strokeStyle = 'rgba(0,0,0,' + (tiles ? .15 : .09) + ')'; g.lineWidth = .7; g.beginPath();
    for (let i = -d/2 + 2.6; i < d/2; i += 2.6){ g.moveTo(-w/2, i); g.lineTo(w/2, i);
    } if (tiles) for (let i = -w/2 + 4; i < w/2; i += 4){ g.moveTo(i, -d/2); g.lineTo(i, d/2); } g.stroke();
  g.strokeStyle = 'rgba(30,10,5,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-w/2, .7);
    g.lineTo(w/2, .7); g.stroke(); g.strokeStyle = 'rgba(255,240,215,.45)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(-w/2, -.5); g.lineTo(w/2, -.5); g.stroke();
  g.strokeStyle = 'rgba(20,10,5,.45)'; g.lineWidth = 1; g.strokeRect(-w/2, -d/2, w, d);
  if ((w*7 + d*3 | 0) % 3 === 0){ g.fillStyle = 'rgba(8,26,22,.3)'; g.fillRect(w*.2 + 2, -d*.3 + 3, 4.5, 4.5);
    g.fillStyle = '#8a6f5c'; g.fillRect(w*.2, -d*.3, 4.5, 4.5); g.fillStyle = '#2a1c14';
    g.fillRect(w*.2 + 1.2, -d*.3 + 1.2, 2.1, 2.1); }
  g.restore(); }
function townPaint(q){
  const sp = q.spec, nk = q.nk, N = q.nation, r = rng(q.name.length*193 + q.name.charCodeAt(0)*11 + q.name.charCodeAt(1)*3), c = document.createElement('canvas'); c.width = TW; c.height = TH;
  const g = c.getContext('2d'), hut = sp.roof === 'thatch' && sp.sz === 1, style = hut ? 'thatch' : nk === 'en' && TOWN_ROOFS[sp.roof] && sp.roof !== 'slate' ? sp.roof : { es:'tile', en:'slate', fr:'mansard', nl:'dutch', dk:'dutch' }[nk], RP = TOWN_ROOFS[style];
  const wallC = { tile:'#f3ead8', slate:'#d9c9ae', mansard:'#efe6d2', dutch:'#f3ead6', thatch:'#b89868', clap:'#f4f2e8', pastel:'#f3dcc6' }[style], STONE = '#b5ae9b', pick = a => a[r()*a.length|0];
  const p1 = r()*TAU, p2 = r()*TAU, side = r() < .5 ? 1 : -1, cxT = TW/2 - side*40, half = 230 + sp.sz*105, fortX = cxT + side*(half + 150), yardX = cxT - side*(half + 110);
  const coast = x => 322 + 20*Math.sin(x*.0042 + p1) + 11*Math.sin(x*.0113 + p2) + 66*Math.exp(-Math.pow((x - fortX)/100, 2)) - 30*Math.exp(-Math.pow((x - yardX)/80, 2));
  const rows = 2 + sp.sz*2, depth = 46 + (rows - 1)*33, art = { key: q.name + q.nk, canvas: c, spots: [], lights: [], glows: [], flags: [], ships: [], coast, cxT };
  const shore = () => { g.beginPath(); for (let x = -20; x <= TW + 20; x += 16) x === -20 ? g.moveTo(x, coast(x)) : g.lineTo(x, coast(x)); };
  const landPath = () => { shore(); g.lineTo(TW + 20, -20); g.lineTo(-20, -20); g.closePath(); };
  // the sea, as it is drawn under way
  g.fillStyle = C.sea; g.fillRect(0, 0, TW, TH);
  for (const L of [[patDark, 2.6], [patLight, 1.5], [patFine, 1]]){ g.save(); g.scale(L[1], L[1]); g.fillStyle = L[0]; g.fillRect(0, 0, TW/L[1], TH/L[1]); g.restore(); }
  g.lineCap = 'round'; g.lineWidth = 1.3;
  for (let i = 0; i < 150; i++){ const x = r()*TW, y = coast(x) + 20 + r()*(TH - coast(x)), w = 6 + r()*8, a = .07 + r()*.14;
    g.strokeStyle = 'rgba(3,30,40,' + (a*.9).toFixed(3) + ')'; g.beginPath(); g.moveTo(x - w, y + 2.5); g.quadraticCurveTo(x, y - 3, x + w, y + 2.5); g.stroke();
    g.strokeStyle = 'rgba(205,240,238,' + a.toFixed(3) + ')'; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - 5.5, x + w, y); g.stroke(); }
  g.lineJoin = 'round'; g.lineCap = 'butt';
  for (const v of [[400, .05], [290, .06], [190, .08], [110, .11], [52, .16]]){ g.strokeStyle = 'rgba(95,215,200,' + v[1] + ')'; g.lineWidth = v[0]; shore(); g.stroke(); }
  g.save(); landPath(); g.clip(); g.fillStyle = '#3f7a45'; g.fillRect(0, 0, TW, TH);
  for (const v of [[520, '#4b8648'], [320, '#5f964e'], [170, '#77a657'], [78, '#a6b56a'], [54, '#ecdcaa'], [14, '#c8b07a']]){ g.strokeStyle = v[1]; g.lineWidth = v[0]; shore(); g.stroke(); }
  g.fillStyle = patShade; g.fillRect(0, 0, TW, TH); g.fillStyle = patWarm; g.fillRect(0, 0, TW, TH);
  for (let i = 0; i < 9; i++){ const x = r()*TW, y = r()*150, rad = 50 + r()*50;
    g.fillStyle = 'rgba(25,55,38,.3)'; circle(g, x + 9, y + 11, rad); g.fill(); g.fillStyle = 'rgba(150,182,112,.28)';
    circle(g, x - 7, y - 9, rad*.72); g.fill(); g.fillStyle = 'rgba(205,205,170,.26)';
    circle(g, x - 10, y - 12, rad*.26); g.fill(); }
  // the ground the town stands on, its lanes and its square
  const cy0 = coast(cxT) - 20 - depth/2; g.fillStyle = 'rgba(217,199,154,.9)'; g.beginPath(); g.ellipse(cxT, cy0, half + 50, depth/2 + 44, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(190,170,125,.35)'; for (let i = 0; i < 500; i++){ const a = r()*TAU, k = Math.sqrt(r()); g.fillRect(cxT + Math.cos(a)*k*(half + 44), cy0 + Math.sin(a)*k*(depth/2 + 40), 2, 2); }
  g.strokeStyle = 'rgba(232,218,180,.9)'; g.lineWidth = 9; g.lineCap = 'round';
  for (let i = 0; i < rows; i++){ const hw = half*(1 - i*.06); g.beginPath(); for (let x = cxT - hw; x <= cxT + hw; x += 30){ const y = coast(x) - 28 - i*33 - 16;
    x === cxT - hw ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  g.beginPath(); g.moveTo(cxT, coast(cxT) - 10); g.lineTo(cxT, cy0 - depth/2 - 30); g.lineTo(cxT + side*60, -10); g.stroke(); g.lineCap = 'butt';
  g.restore();
  // woods and palms outside the town
  const inTown = (x, y, pad) => Math.pow((x - cxT)/(half + 50 + pad), 2) + Math.pow((y - cy0)/(depth/2 + 44 + pad), 2) < 1;
  const T = []; for (let gy = 0; gy < TH; gy += 22) for (let gx = 0; gx < TW; gx += 22){ const x = gx + r()*18, y = gy + r()*18, k = r(), cy = coast(x);
    if (y > cy - 34 || inTown(x, y, 10) || Math.hypot(x - fortX, y - (coast(fortX) - 50)) < 86 || Math.abs(x - yardX) < 110 && y > cy - 150) { if (y < cy - 12 && y > cy - 40 && k < .16 && q.y > Y(31.5) && !inTown(x, y, -30)) palm(g, x, y, k*90); continue; }
    if (k < .6) T.push([x, y, 6 + r()*7, k]); }
  T.sort((a, b) => a[1] - b[1]); for (const t of T) tree(g, t[0], t[1], t[2]*1.1, t[3]/.6);
  // places kept clear for the five buildings you can visit
  const mk = { x: cxT - 86, y: coast(cxT) - 122, w: 172, h: 96 }, ch = { x: cxT - 44, y: mk.y - (sp.ch === 2 ? 118 : 96), w: 88, h: sp.ch === 2 ? 110 : 88 };
  const tv = { x: cxT + side*(half*.5) - 52, y: coast(cxT + side*half*.5) - 104, w: 104, h: 80 }, gv = { x: cxT - side*(half*.55) - 78, y: Math.max(26, cy0 - depth/2 + 6), w: 156, h: 118 };
  const keep = [mk, tv, gv].concat(sp.ch ? [ch] : []), clear = (x, y, pad) => !keep.some(k => x > k.x - pad && x < k.x + k.w + pad && y > k.y - pad && y < k.y + k.h + pad);
  // city walls
  if (sp.walls){ const wx = half + 40, wy = depth + 22, by = coast(cxT) - 14; for (const pass of [[13, '#6f7168'], [8, '#c2bfae']]){ g.strokeStyle = pass[1];
    g.lineWidth = pass[0]; g.beginPath(); g.ellipse(cxT, by, wx, wy, 0, Math.PI*1.03, Math.PI*1.97); g.stroke(); }
    for (let i = 0; i <= 6; i++){ const a = Math.PI*(1.06 + i*.147), x = cxT + Math.cos(a)*wx, y = by + Math.sin(a)*wy;
      if (i === 3) continue; g.save(); g.translate(x, y); g.rotate(a + .78); g.fillStyle = 'rgba(10,30,25,.3)';
      g.fillRect(-8, -6, 20, 20); g.fillStyle = '#b9b6a6'; g.fillRect(-10, -10, 20, 20);
      g.strokeStyle = '#5d5f58'; g.lineWidth = 1.4; g.strokeRect(-10, -10, 20, 20); g.restore(); }
    g.fillStyle = '#8f8a78'; g.fillRect(cxT - 11, by - wy - 9, 22, 18); g.fillStyle = '#3a2a1c'; g.fillRect(cxT - 5, by - wy - 9, 10, 18); }
  // houses, row on row
  const B = [];
  for (let i = 0; i < rows; i++){ const hw = half*(1 - i*.06);
    for (let x = cxT - hw + r()*10; x < cxT + hw; ){ const w = style === 'dutch' ? 15 + r()*4 : hut ? 20 : 22 + r()*9, d = style === 'dutch' ? 25 + r()*4 : hut ? 20 : 17 + r()*6, y = coast(x) - 28 - i*33 + (r() - .5)*5;
      if (y > 18 && clear(x, y, 14) && Math.abs(x - cxT) > 9 && r() > .1) B.push({ x, y, w, d, rot: (r() - .5)*.12 + (style === 'dutch' ? Math.PI/2 : 0), rf: pick(RP), hut: hut || style === 'thatch' && r() < .5 });
        x += (style === 'dutch' ? d*.72 : w) + 6 + r()*(hut ? 16 : 4); } }
  for (const b of B) b.hut ? (g.fillStyle = 'rgba(10,30,25,.34)', circle(g, b.x + 4, b.y + 6, 10), g.fill()) : roofShadow(g, b.x, b.y, b.w, b.d, b.rot, 1);
  for (const b of B){ if (b.hut){ g.fillStyle = '#b3934f'; circle(g, b.x, b.y, 10);
    g.fill(); g.strokeStyle = '#8a6d35'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#d2b673';
    circle(g, b.x - 2, b.y - 2, 5); g.fill(); g.fillStyle = '#6b4a2a'; circle(g, b.x, b.y, 1.5); g.fill(); }
    else { roofRect(g, b.x, b.y, b.w, b.d, b.rot, b.rf, wallC, style === 'tile'); if (style === 'slate' || style === 'mansard'){ g.fillStyle = '#4a3a30'; g.fillRect(b.x + b.w*.22, b.y - 3, 4, 4); } }
    art.lights.push([b.x, b.y]); }
  // the church or cathedral, in the fashion of the nation that holds the town
  if (sp.ch){ const x = ch.x + ch.w/2, y = ch.y + ch.h/2, big = sp.ch === 2, L = big ? 96 : 74, rf = style === 'dutch' ? ['#4a4444','#2f2c2c'] : RP[0], wl = nk === 'en' ? '#b7b2a4' : nk === 'nl' ? '#b5442e' : '#f7f0e2';
    roofShadow(g, x, y, 26, L, 0, 1.5); roofShadow(g, x, y - L*.12, 64, 24, 0, 1.5);
    g.save(); g.translate(x, y); g.rotate(Math.PI/2); g.restore(); roofRect(g, x, y, L, 26, Math.PI/2, rf, wl, style === 'tile'); roofRect(g, x, y - L*.12, 64, 24, 0, rf, wl, style === 'tile');
    if (nk === 'es'){ g.fillStyle = 'rgba(10,30,25,.3)'; circle(g, x + 5, y - L*.12 + 7, 15);
      g.fill(); g.fillStyle = '#c56a44'; circle(g, x, y - L*.12, 15); g.fill(); g.fillStyle = '#e08a5c';
      circle(g, x - 4, y - L*.12 - 4, 7); g.fill(); g.strokeStyle = '#7c3220'; g.lineWidth = 1.2;
      circle(g, x, y - L*.12, 15); g.stroke(); }
    const tw = (tx, ty, sz2, col, cap) => { g.fillStyle = 'rgba(10,30,25,.34)'; g.fillRect(tx - sz2/2 + 7, ty - sz2/2 + 11, sz2, sz2);
      g.fillStyle = col; g.fillRect(tx - sz2/2, ty - sz2/2, sz2, sz2); g.strokeStyle = 'rgba(40,30,20,.6)';
      g.lineWidth = 1.2; g.strokeRect(tx - sz2/2, ty - sz2/2, sz2, sz2);
      if (cap === 'spire'){ g.fillStyle = '#44546a'; g.beginPath(); g.moveTo(tx, ty - sz2/2);
        g.lineTo(tx + sz2/2, ty); g.lineTo(tx, ty + sz2/2); g.lineTo(tx - sz2/2, ty); g.closePath();
        g.fill(); g.fillStyle = '#8fa2b8'; circle(g, tx, ty, 2); g.fill(); }
      else if (cap === 'dome'){ g.fillStyle = cap === 'dome' && nk === 'nl' ? '#5d8f5a' : '#b9563a';
        circle(g, tx, ty, sz2*.36); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; circle(g, tx - 2, ty - 2, sz2*.15); g.fill(); }
      else { g.strokeStyle = '#5d5f58'; g.setLineDash([3, 3]); g.strokeRect(tx - sz2/2 + 2, ty - sz2/2 + 2, sz2 - 4, sz2 - 4); g.setLineDash([]); } };
    const cap = nk === 'es' || nk === 'nl' ? 'dome' : nk === 'fr' ? 'spire' : 'keep', tc = nk === 'en' ? '#a9a79d' : nk === 'nl' ? '#9c3a28' : '#efe6d2';
    if (big){ tw(x - 20, y + L/2 - 4, 18, tc, cap); tw(x + 20, y + L/2 - 4, 18, tc, cap); } else tw(x, y + L/2 - 2, 18, tc, cap);
    art.lights.push([x, y]); }
  // the governor's house: three wings round a court, with a garden
  { const x = gv.x, y = gv.y, rf = RP[0], gw = '#f7f0e2';
    g.fillStyle = '#4d7f3f'; g.fillRect(x + 6, y + 70, 144, 44); g.fillStyle = '#6fa255';
      g.fillRect(x + 12, y + 76, 132, 32); g.strokeStyle = '#ead9a6'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(x + 78, y + 70); g.lineTo(x + 78, y + 114); g.moveTo(x + 12, y + 92);
      g.lineTo(x + 144, y + 92); g.stroke();
    g.fillStyle = STONE; circle(g, x + 78, y + 92, 9); g.fill(); g.fillStyle = '#6fc3cf';
      circle(g, x + 78, y + 92, 5.5); g.fill(); for (const v of [[24, 84], [130, 84], [24, 102], [130, 102], [52, 82], [104, 102]]){ g.fillStyle = '#2f6a38';
      circle(g, x + v[0], y + v[1], 5); g.fill(); }
    g.fillStyle = '#e3d6b4'; g.fillRect(x + 44, y + 30, 68, 36);
    for (const v of [[78, 20, 118, 26, 0], [26, 44, 62, 26, Math.PI/2], [130, 44, 62, 26, Math.PI/2]]) roofShadow(g, x + v[0], y + v[1], v[2], v[3], v[4], 1.4);
    for (const v of [[78, 20, 118, 26, 0], [26, 44, 62, 26, Math.PI/2], [130, 44, 62, 26, Math.PI/2]]) roofRect(g, x + v[0], y + v[1], v[2], v[3], v[4], rf, gw, style === 'tile');
    art.flags.push([x + 78, y + 20, 30]); art.lights.push([x + 78, y + 20], [x + 26, y + 44], [x + 130, y + 44]);
      art.spots.push({ id:'governor', name: sp.land ? 'Headman' : sp.sz < 2 ? 'Magistrate' : 'Governor', x: gv.x - 6, y: gv.y - 6, w: gv.w + 12, h: gv.h + 12 }); }
  // the market square
  { const x = mk.x, y = mk.y; g.fillStyle = '#dccfa8'; g.fillRect(x, y, mk.w, mk.h);
    g.strokeStyle = 'rgba(120,100,60,.22)'; g.lineWidth = 1; g.beginPath(); for (let i = 12; i < mk.w; i += 12){ g.moveTo(x + i, y);
    g.lineTo(x + i, y + mk.h); } for (let i = 12; i < mk.h; i += 12){ g.moveTo(x, y + i);
    g.lineTo(x + mk.w, y + i); } g.stroke();
    g.strokeStyle = '#a89a72'; g.lineWidth = 2; g.strokeRect(x, y, mk.w, mk.h); g.fillStyle = 'rgba(10,30,25,.25)';
      circle(g, x + mk.w/2 + 3, y + mk.h/2 + 4, 12); g.fill(); g.fillStyle = STONE; circle(g, x + mk.w/2, y + mk.h/2, 12);
      g.fill(); g.fillStyle = '#6fc3cf'; circle(g, x + mk.w/2, y + mk.h/2, 8); g.fill();
      g.fillStyle = '#8f8a78'; circle(g, x + mk.w/2, y + mk.h/2, 2.5); g.fill();
    const aw = [N.c1, N.c2 === '#f2f2f2' ? '#f6efd8' : N.c2];
    for (const v of [[20, 16], [58, 14], [116, 14], [152, 18], [18, 50], [154, 52], [22, 80], [60, 82], [114, 82], [150, 80]]){ const sx = x + v[0], sy = y + v[1];
      g.fillStyle = 'rgba(10,30,25,.3)'; g.fillRect(sx - 11, sy - 5, 28, 18); g.fillStyle = aw[0];
      g.fillRect(sx - 14, sy - 9, 28, 18); g.fillStyle = aw[1]; for (let k = 0; k < 3; k++) g.fillRect(sx - 14 + 5 + k*9, sy - 9, 4.5, 18);
      g.strokeStyle = 'rgba(30,20,10,.5)'; g.lineWidth = .8; g.strokeRect(sx - 14, sy - 9, 28, 18); }
    for (let i = 0; i < 16; i++){ const bx = x + 34 + r()*(mk.w - 68), by = y + 26 + r()*(mk.h - 52);
      if (Math.hypot(bx - x - mk.w/2, by - y - mk.h/2) < 18) continue; if (r() < .5){ g.fillStyle = '#8f6537';
      g.fillRect(bx, by, 6, 6); g.strokeStyle = '#4e3418'; g.lineWidth = .7; g.strokeRect(bx, by, 6, 6);
      } else { g.fillStyle = '#6f4b25'; circle(g, bx, by, 3); g.fill(); g.strokeStyle = '#c9a25e';
      g.lineWidth = .7; g.stroke(); } }
    art.spots.push({ id:'market', name:'Market', x: mk.x - 4, y: mk.y - 4, w: mk.w + 8, h: mk.h + 8 }); }
  // the tavern: two wings and a yard of barrels
  { const x = tv.x, y = tv.y, rf = RP[RP.length - 1]; g.fillStyle = '#cdb98c'; g.fillRect(x + 40, y + 34, 60, 42);
    roofShadow(g, x + 52, y + 18, 100, 28, 0, 1.3); roofShadow(g, x + 18, y + 52, 50, 28, Math.PI/2, 1.3);
      roofRect(g, x + 52, y + 18, 100, 28, 0, rf, wallC, style === 'tile'); roofRect(g, x + 18, y + 52, 50, 28, Math.PI/2, rf, wallC, style === 'tile');
    for (const v of [[52, 46], [62, 50], [56, 58], [84, 44], [90, 52], [78, 64], [70, 68]]){ g.fillStyle = 'rgba(10,30,25,.3)';
      circle(g, x + v[0] + 1.5, y + v[1] + 2, 4.2); g.fill(); g.fillStyle = '#6f4b25';
      circle(g, x + v[0], y + v[1], 4.2); g.fill(); g.strokeStyle = '#c9a25e'; g.lineWidth = .9; g.stroke(); }
    g.fillStyle = '#8f6639'; g.fillRect(x + 72, y + 52, 14, 8); g.fillStyle = '#d6a54e';
      g.fillRect(x + 96, y + 30, 8, 8); g.strokeStyle = '#2a1c10'; g.lineWidth = 1; g.strokeRect(x + 96, y + 30, 8, 8);
    art.glows.push([x + 100, y + 34, 34], [x + 66, y + 54, 30]); art.lights.push([x + 30, y + 18], [x + 70, y + 18], [x + 18, y + 56]);
      art.spots.push({ id:'tavern', name:'Tavern', x: tv.x - 6, y: tv.y - 6, w: tv.w + 12, h: tv.h + 12 }); }
  // the quay, its jetties and boats
  const ql = cxT - half - 16, qr = cxT + half + 16, quay = (w, col, dy) => { g.strokeStyle = col;
    g.lineWidth = w; g.beginPath(); for (let x = ql; x <= qr; x += 20) x === ql ? g.moveTo(x, coast(x) - 5 + dy) : g.lineTo(x, coast(x) - 5 + dy); g.stroke(); };
  if (!hut){ quay(18, 'rgba(0,20,25,.28)', 5); quay(16, STONE, 0); quay(2, '#7d776a', 7); g.fillStyle = '#4a4638'; for (let x = ql + 14; x < qr; x += 38){ circle(g, x, coast(x) + 1, 2); g.fill(); } }
  const jets = []; for (let i = 0; i <= sp.sz; i++){ const x = cxT + (i - sp.sz/2)*(half*1.25/Math.max(1, sp.sz)) + (r() - .5)*20; if (Math.abs(x - cxT) < 8) continue; jets.push(x); }
  for (const x of jets){ const y0 = coast(x) - 4, L = 92 + r()*26; g.strokeStyle = 'rgba(0,20,25,.3)';
    g.lineWidth = 12; g.beginPath(); g.moveTo(x + 4, y0 + 5); g.lineTo(x + 4, y0 + L + 5);
    g.stroke(); g.strokeStyle = '#8f6639'; g.lineWidth = 11; g.beginPath(); g.moveTo(x, y0);
    g.lineTo(x, y0 + L); g.stroke();
    g.strokeStyle = 'rgba(45,25,8,.42)'; g.lineWidth = 1; g.beginPath(); for (let d = 4; d < L; d += 5){ g.moveTo(x - 5.5, y0 + d);
      g.lineTo(x + 5.5, y0 + d); } g.stroke(); g.fillStyle = '#3f2913'; for (let d = 22; d <= L; d += 24) for (const k of [-6, 6]){ circle(g, x + k, y0 + d, 2.1); g.fill(); }
    art.glows.push([x, y0 + L, 26]);
    for (const k of [-1, 1]){ if (r() < .35) continue; const bx = x + k*(15 + r()*4), by = y0 + 30 + r()*(L - 50);
      g.save(); g.translate(bx, by); g.rotate(Math.PI/2 + (r() - .5)*.3); g.fillStyle = 'rgba(0,20,25,.25)';
      g.beginPath(); g.ellipse(2, 3, 11, 4.2, 0, 0, TAU); g.fill(); g.fillStyle = '#7a5532';
      g.beginPath(); g.ellipse(0, 0, 11, 4.2, 0, 0, TAU); g.fill(); g.fillStyle = '#c9a877';
      g.beginPath(); g.ellipse(0, 0, 8, 2.5, 0, 0, TAU); g.fill(); g.strokeStyle = '#4e3418';
      g.lineWidth = .8; g.beginPath(); g.moveTo(-3, -2.5); g.lineTo(-3, 2.5); g.moveTo(3, -2.5);
      g.lineTo(3, 2.5); g.stroke(); g.restore(); } }
  if (jets.length){ const jx = jets[side > 0 ? 0 : jets.length - 1]; art.ships.push({ cls:'merchant', owner: nk, role:'merchant', x: jx - side*30, y: coast(jx) + 78, h: -Math.PI/2 + .04 }); }
  // the shipyard: a slip, a hull in frame, sheds and stacked timber
  { const x = yardX, y = coast(x); g.fillStyle = '#c9b88a'; g.beginPath(); g.ellipse(x, y - 52, 104, 62, 0, 0, TAU); g.fill();
    g.fillStyle = '#8a6a45'; g.beginPath(); g.moveTo(x - 20, y - 60); g.lineTo(x + 20, y - 60);
      g.lineTo(x + 24, y + 58); g.lineTo(x - 24, y + 58); g.closePath(); g.fill(); g.strokeStyle = 'rgba(45,25,8,.4)';
      g.lineWidth = 1; g.beginPath(); for (let d = -54; d < 58; d += 7){ g.moveTo(x - 22, y + d);
      g.lineTo(x + 22, y + d); } g.stroke();
    g.save(); g.translate(x, y - 6); g.rotate(Math.PI/2); g.fillStyle = 'rgba(10,30,25,.3)';
      g.save(); g.translate(5, -4); hullPath(g, 86, 27, CLASSES.brig); g.fill(); g.restore();
      hullPath(g, 84, 26, CLASSES.brig); g.fillStyle = '#b08350'; g.fill(); g.strokeStyle = '#4a2c14'; g.lineWidth = 2; g.stroke();
    g.save(); g.clip(); g.strokeStyle = '#5a3a1c'; g.lineWidth = 2; g.beginPath();
      for (let d = -36; d <= 36; d += 8){ g.moveTo(d, -14); g.lineTo(d, 14); } g.moveTo(-42, 0);
      g.lineTo(42, 0); g.stroke(); g.restore(); g.restore();
    const wood = [['#7a5a3a','#5a4026'], ['#86663f','#63472a']];
    for (const v of [[-70, -78, 58, 26, .1], [66, -86, 52, 24, -.12]]) roofShadow(g, x + v[0], y + v[1], v[2], v[3], v[4], 1.2);
      for (const v of [[-70, -78, 58, 26, .1], [66, -86, 52, 24, -.12]]){ roofRect(g, x + v[0], y + v[1], v[2], v[3], v[4], wood[0], '#4e3a24', false);
      art.lights.push([x + v[0], y + v[1]]); }
    g.strokeStyle = '#9a6b3c'; g.lineWidth = 3; g.lineCap = 'round'; for (const v of [[-62, -36, 0], [-66, -24, .1], [58, -44, -.2], [62, -32, .1], [52, -22, 0]]){ g.beginPath();
      for (let k = 0; k < 4; k++){ const ox = Math.cos(v[2] + Math.PI/2)*k*3.4, oy = Math.sin(v[2] + Math.PI/2)*k*3.4;
      g.moveTo(x + v[0] + ox - Math.cos(v[2])*15, y + v[1] + oy - Math.sin(v[2])*15); g.lineTo(x + v[0] + ox + Math.cos(v[2])*15, y + v[1] + oy + Math.sin(v[2])*15); } g.stroke(); }
    g.lineCap = 'butt'; g.fillStyle = 'rgba(10,30,25,.3)'; circle(g, x + 39, y - 12, 5);
      g.fill(); g.strokeStyle = '#2a1c10'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 36, y - 16);
      g.lineTo(x + 6, y - 30); g.stroke(); g.fillStyle = '#4a3018'; circle(g, x + 36, y - 16, 5);
      g.fill(); g.fillStyle = '#d6a54e'; circle(g, x + 6, y - 30, 2.5); g.fill();
    if (sp.dock){ /* a royal dockyard: a mast pond, and a sheer hulk moored off the slip */
      g.fillStyle = '#7b6a4a'; g.fillRect(x - 100, y - 152, 78, 38); g.fillStyle = '#1c6f7c';
        g.fillRect(x - 96, y - 148, 70, 30); g.strokeStyle = '#b08a55'; g.lineWidth = 3;
        g.lineCap = 'round'; for (let k = 0; k < 5; k++){ g.beginPath(); g.moveTo(x - 92, y - 144 + k*5.6);
        g.lineTo(x - 32, y - 143 + k*5.6); g.stroke(); } g.lineCap = 'butt';
      g.save(); g.translate(x + side*86, y + 104); g.rotate(-Math.PI/2 + .1); g.fillStyle = 'rgba(0,20,25,.3)'; g.save(); g.translate(5, 6); hullPath(g, 104, 33, CLASSES.fifty); g.fill(); g.restore();
      hullPath(g, 100, 31, CLASSES.fifty); g.fillStyle = '#6e5234'; g.fill(); g.strokeStyle = '#2f1e0e';
        g.lineWidth = 2; g.stroke(); g.fillStyle = '#b89a6a'; g.fillRect(-36, -9, 64, 18);
        g.fillStyle = '#7a5a3a'; g.fillRect(-30, -11, 34, 22); g.strokeStyle = '#4e3a24';
        g.lineWidth = 1; g.strokeRect(-30, -11, 34, 22); g.beginPath(); g.moveTo(-30, 0); g.lineTo(4, 0); g.stroke();
      g.strokeStyle = '#2a1c10'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
        g.moveTo(10, -12); g.lineTo(40, 0); g.moveTo(10, 12); g.lineTo(40, 0); g.stroke();
        g.lineCap = 'butt'; g.fillStyle = '#d6a54e'; circle(g, 40, 0, 2.6); g.fill(); g.restore(); }
    art.spots.push({ id:'yard', name: sp.dock ? 'Royal dockyard' : sp.land ? 'Careenage' : 'Shipyard', x: x - 108, y: y - 112, w: 216, h: 176 }); }
  // the fort on its point
  if (sp.forts.length){ const x = fortX, y = coast(x) - 52, kind = sp.forts[0]; let shape = [];
    if (kind === 'castle') shape = [[-44,-44],[-26,-44],[-26,-34],[26,-34],[26,-44],[44,-44],[44,-26],[52,-26],[52,26],[44,26],[44,44],[26,44],[26,34],[-26,34],[-26,44],[-44,44],[-44,26],[-34,26],[-34,-26],[-44,-26]];
    else if (kind === 'battery') shape = [[-40,-24],[40,-24],[46,-8],[46,22],[30,34],[-30,34],[-46,22],[-46,-8]];
    else if (kind === 'tower'){ for (let i = 0; i < 16; i++){ const a = i/16*TAU; shape.push([Math.cos(a)*30, Math.sin(a)*30]); } }
    else for (let i = 0; i < 10; i++){ const a = i/10*TAU - Math.PI/2, rad = i % 2 ? 30 : 54; shape.push([Math.cos(a)*rad, Math.sin(a)*rad]); }
    const poly = (dx, dy) => { g.beginPath(); shape.forEach((v, i) => i ? g.lineTo(x + v[0] + dx, y + v[1] + dy) : g.moveTo(x + v[0] + dx, y + v[1] + dy)); g.closePath(); };
    g.fillStyle = 'rgba(10,30,25,.36)'; poly(6, 9); g.fill(); g.fillStyle = '#a7a99e'; poly(0, 0); g.fill(); g.strokeStyle = '#5d5f58'; g.lineWidth = 2.4; g.stroke();
    g.save(); poly(0, 0); g.clip(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 7; poly(-2, -3); g.stroke(); g.restore();
    g.fillStyle = '#8b8d83'; circle(g, x, y, kind === 'tower' ? 19 : 22); g.fill(); g.fillStyle = '#74766d'; circle(g, x, y, kind === 'tower' ? 10 : 12); g.fill();
    if (kind === 'castle') for (const v of [[-36,-36],[36,-36],[36,36],[-36,36]]){ g.fillStyle = 'rgba(10,30,25,.3)';
      circle(g, x + v[0] + 3, y + v[1] + 5, 11); g.fill(); g.fillStyle = '#9a9c91'; circle(g, x + v[0], y + v[1], 11);
      g.fill(); g.strokeStyle = '#5d5f58'; g.lineWidth = 1.6; g.stroke(); }
    g.strokeStyle = '#1b1d1f'; g.lineWidth = 3.4; g.lineCap = 'round'; for (const dx of [-24, -8, 8, 24]){ g.beginPath();
      g.moveTo(x + dx, y + (kind === 'tower' ? 18 : 26)); g.lineTo(x + dx, y + (kind === 'tower' ? 30 : 40));
      g.stroke(); } g.lineCap = 'butt';
    art.flags.push([x, y, 34]); art.glows.push([x, y, 40]); }
  // where your ships lie at anchor
  const ax = clamp(cxT + side*(half*.2), 300, TW - 300), ay = Math.min(TH - 84, coast(ax) + 168); art.anchor = [ax, ay];
  art.spots.push({ id:'fleet', name:'Your fleet', x: ax - 190, y: ay - 64, w: 380, h: 132 });
  const vg = g.createRadialGradient(TW/2, TH/2, TH*.5, TW/2, TH/2, TW*.62); vg.addColorStop(0, 'rgba(3,14,18,0)'); vg.addColorStop(1, 'rgba(3,14,18,.45)'); g.fillStyle = vg; g.fillRect(0, 0, TW, TH);
  return art;
}
