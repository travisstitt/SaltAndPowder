function endMelee(){ if (melee){ melee.s.grappled = false; } p.grappled = false; melee = null; }
function prizeLoot(s){ return Math.round((prize(s) ? s.cargo : (BOUNTY[s.cls] || 0)*1.5 + (s.cargo || 0))*D().loot); }
function capture(s){ if (s.officer === undefined) s.officer = rnd() < .45 ? newCaptain(s.t.hull >= 230 ? 3 : 1, s.role === 'merchant' ? 3 : 4) : null;
  prizeShip = s; s.surrendered = true; s.sail = 0; state = 'prize'; held.left = held.right = false; chime(); renderPrize(); $('prize').hidden = false; $('pz_loot').focus(); }
function manifestOf(s, all){ // what she carries, dearest first, and how much of each you have room for
  let space = all ? 1e9 : Math.max(0, holdCap() - holdUsed()); const out = [];
  GK.slice().sort((a, b) => GOODS[b][1] - GOODS[a][1]).forEach(g => { const n = s.goods && s.goods[g] || 0; if (!n) return; const take = Math.min(n, space); space -= take; out.push({ g, n, take }); });
  return out; }
function takeCargo(s, all){ const c = prizeLoot(s), m = manifestOf(s, all); let tons = 0; s.cargo = 0; earn(c, s.x, s.y);
  const share = Math.round(c*.06*squad().length); if (share){ gold -= share; later(() => say('Your captains and their crews take ' + share + ' gold of the prize in shares.'), 2600); } m.forEach(v => { hold[v.g] += v.take; tons += v.take; }); s.goods = null; return [c, tons]; }
function settlePrize(how){ dirty();
  if (prizeShip.nation && prizeShip.role !== 'merchant' && prizeShip.role !== 'treasure') captives[prizeShip.nation] = Math.min(9, captives[prizeShip.nation] + (prizeShip.t.hull >= 230 ? 2 : 1)); /* her officers give their parole */
  const s = prizeShip, name = nm(s), got = takeCargo(s, how === 'keep' || how === 'fleet'), tail = got[1] ? ' and ' + got[1] + ' tons of goods' : '';
  if (how === 'fleet'){ const need = Math.max(0, Math.ceil(s.t.crew*.3) - s.crew), cap = spares.length ? spares.sort((a, b) => b.gun + b.sea - a.gun - a.sea).shift() : mate();
    p.crew -= need; addFleet({ cls: s.cls, hf: s.hull/s.maxHull, sails: Math.max(30, s.sails), crew: s.crew + need, cap }, s.x, s.y, s.h); s.gone = true;
    trimHold(); say('The ' + name + ' joins your fleet under ' + (cap.mate ? 'your first mate' : 'Capt. ' + cap.name) + '. ' + got[0] + ' gold' + tail + ' taken aboard.'); }
  else if (how === 'keep'){ const old = p, sale = Math.round(CLASSES[old.cls].value*.35), hf = clamp(s.hull/s.maxHull, .1, 1);
    p = makeShip(s.cls, 'player', 'player', s.x, s.y, s.h); refit(); p.hull = p.maxHull*hf; p.sails = Math.max(30, s.sails); p.crew = Math.min(old.crew, p.t.crew);
    let over = holdUsed() - holdCap(); for (const g of GK){ if (over <= 0) break; const d = Math.min(hold[g], over); hold[g] -= d; over -= d; }
    gold += sale; s.gone = true; say('You take the ' + name + ' as your own. ' + got[0] + ' gold' + tail + ' aboard; your old ' + old.t.cname + ' is sent in and sold for ' + sale + '.'); }
  else if (how === 'send'){ const note = sendIn(s, clamp(s.hull/s.maxHull, .1, 1)); p.crew -= 8; s.gone = true;
    say('A prize crew of 8 sails the ' + name + ' to port. ' + note + ' ' + got[0] + ' gold' + tail + ' from her hold.'); }
  else { s.surrendered = false; s.released = true; s.sail = 1; s.sails = Math.max(s.sails, 40); say('Plundered the ' + name + ': ' + got[0] + ' gold' + tail + '. You let her go.'); }
  dirty(); onPrize(s, true); if (tracked === s) tracked = null; prizeShip = null; $('prize').hidden = true; state = 'play'; document.activeElement && document.activeElement.blur();
}
function ledgerLine(ul, name, small, amt){ const e = document.createElement('li'), sp = document.createElement('span'), sm = document.createElement('small'), a = document.createElement('span');
  sp.textContent = name; sm.textContent = small; sp.appendChild(sm); a.className = 'amt'; a.textContent = amt; e.appendChild(sp); e.appendChild(a); ul.appendChild(e); }
function ledgerText(ul, cls, text){ const e = document.createElement('li'); e.className = cls; e.textContent = text; ul.appendChild(e); }
function renderPrize(){
  const s = prizeShip, c = prizeLoot(s), k = CLASSES[s.cls], hf = clamp(s.hull/s.maxHull, .1, 1), m = manifestOf(s), free = Math.max(0, holdCap() - holdUsed());
  $('prizeName').textContent = 'Prize: ' + s.t.name;
  $('prizeText').textContent = 'She is yours. Hull at ' + Math.round(hf*100) + '%, sails at ' + Math.round(s.sails) + '%, ' + s.crew + ' of her crew left standing.' + (s.nation && s.role !== 'merchant' && s.role !== 'treasure' ? ' Her officers give you their parole: a governor will pay to exchange or ransom them.' : '');
  const ul = $('prizeCargo'); ul.textContent = '';
  ledgerText(ul, 'sec', 'In her hold');
  ledgerLine(ul, 'Gold coin', 'From her strongbox. All of it comes with you.', c + ' gold');
  m.forEach(v => ledgerLine(ul, GOODS[v.g][0] + ' · ' + v.n + ' tons', 'Worth about ' + v.n*GOODS[v.g][1] + ' gold at market. ' + (v.take === v.n ? 'All of it fits.' : v.take ? 'Only ' + v.take + ' tons fit.' : 'No room for it.'), v.take + ' of ' + v.n));
  if (!m.length) ledgerText(ul, 'txt', 'No trade goods aboard.');
  ledgerText(ul, 'txt', 'Your hold has room for ' + free + ' of ' + holdCap() + ' tons. Taking her as your own ship keeps everything in her hold of ' + k.hold + ' tons.');
  $('pz_keepNote').textContent = k.guns + ' guns a side · hull ' + k.hull + ' · speed ' + k.speed + ' · crew ' + k.crew + ' · hold ' + k.hold + '. Your ' + p.t.cname + ' is sold for ' + Math.round(CLASSES[p.cls].value*.35) + ' gold and your refits carry over.';
  $('pz_sendNote').textContent = 'Costs you 8 hands. Pays ' + Math.round(k.value*.35*hf) + ' gold for the hull.';
  $('pz_send').disabled = p.crew < 20;
  const join = Math.min(Math.floor(s.crew*.5), p.t.crew - p.crew);
  $('pz_crewNote').textContent = s.pressed ? 'Her volunteers are aboard. Your crew is ' + p.crew + ' of ' + p.t.crew + '.' : join > 0 ? join + ' of her hands will sign your articles. Your crew is ' + p.crew + ' of ' + p.t.crew + '.' : 'You have no berths to spare, or none of her hands will serve.';
  $('pz_crew').disabled = !!s.pressed || join <= 0; $('pz_crew').textContent = join > 0 && !s.pressed ? 'Sign on ' + join : 'Sign on';
  $('pz_mateRow').hidden = !s.officer;
  if (s.officer){ $('pz_mateNote').textContent = capLine(s.officer) + ' offers to serve you as a captain for 150 gold.'; $('pz_mate').disabled = gold < 150 || spares.length >= 6; }
  const need = Math.max(0, Math.ceil(s.t.crew*.3) - s.crew), n = squad().length, best = spares.slice().sort((a, b) => b.gun + b.sea - a.gun - a.sea)[0];
  $('pz_fleetNote').textContent = n >= MAXSQ ? 'Your fleet is full at ' + MAXSQ + ' consorts. Lay one up at your home port first.' :
    'She sails with you under ' + (best ? capLine(best) : 'your first mate ★☆☆☆☆ until you hire a captain') + (need ? '. You must put ' + need + ' of your hands aboard her' : '. Her own crew is enough to work her') + '. Her hold of ' + k.hold + ' tons is added to yours.';
  $('pz_fleet').disabled = n >= MAXSQ || p.crew - need < 10;
}
/* the ship's manifest: everything aboard at a glance */
function openManifest(){ if (state !== 'play' && state !== 'port') return; setChart(false); menuOpen = true; held.left = held.right = false; renderManifest(); $('manifest').hidden = false; $('manifestClose').focus({ preventScroll: true }); $('manifest').firstElementChild.scrollTop = 0; }
function renderManifest(){
  const ul = $('manifestList'); ul.textContent = ''; const used = holdUsed(); let worth = 0;
  ledgerText(ul, 'sec', 'Cargo: ' + used + ' of ' + holdCap() + ' tons');
  GK.forEach(g => { if (!hold[g]) return; worth += hold[g]*GOODS[g][1]; ledgerLine(ul, GOODS[g][0], 'Worth about ' + hold[g]*GOODS[g][1] + ' gold at an ordinary market.', hold[g] + ' tons'); });
  ledgerText(ul, 'txt', used ? 'About ' + worth + ' gold of goods in all, more where they are wanted.' : 'The hold is empty.');
  ledgerText(ul, 'sec', 'Purse');
  ledgerLine(ul, 'Gold', 'Plunder taken so far: ' + plunder + '. Known as ' + RANKS[rankIdx][1] + '.', gold + ' gold');
  ledgerLine(ul, 'Wages', 'Paid on the first of the month to every hand and captain in the fleet. Unpaid crews desert.', wageBill() + ' a month');
  ledgerText(ul, 'sec', 'Your ' + p.t.cname);
  ledgerLine(ul, 'Crew', p.crew < p.t.crew*.5 ? 'Short-handed: the guns reload slowly.' : 'Enough hands to work the guns.', p.crew + ' of ' + p.t.crew);
  ledgerLine(ul, 'Hull', 'Timbers and planking.', Math.round(p.hull) + ' of ' + Math.round(p.maxHull));
  ledgerLine(ul, 'Sails', 'Canvas and rigging.', Math.round(p.sails) + '%');
  ledgerLine(ul, 'Guns', 'Reload ' + (p.reload*crewSlow()).toFixed(1) + ' s. Loaded with ' + SHOTN[shot].toLowerCase() + '.', p.guns + ' a side');
  ledgerLine(ul, 'Refits', 'Guns, hull, sailcloth, gun drill.', up.guns + ' · ' + up.hull + ' · ' + up.sail + ' · ' + up.drill);
  const sq = squad(); ledgerText(ul, 'sec', 'Fleet: ' + sq.length + ' of ' + MAXSQ + ' consorts');
  sq.forEach(o => ledgerLine(ul, o.t.cname.charAt(0).toUpperCase() + o.t.cname.slice(1) + ' · ' + (o.cap.mate ? 'your first mate' : capLine(o.cap)), 'Crew ' + o.crew + '/' + o.t.crew + ' · ' + o.guns + ' guns a side · hold ' + o.t.hold + ' tons', 'Hull ' + Math.round(o.hull/o.maxHull*100) + '%'));
  ledgerText(ul, 'txt', (sq.length ? 'Formation: ' + FORMS[formation].toLowerCase() + '. Orders: ' + ORDERS[orders].toLowerCase() + '. ' : 'No consorts. ') + 'Home port: ' + homeName + (laidUp.length ? ', with ' + laidUp.length + ' laid up there' : '') + '.' + (spares.length ? ' Spare captains: ' + spares.map(c => c.name + ' ' + stars(c)).join(', ') + '.' : ''));
  ledgerText(ul, 'sec', 'Commission');
  ledgerText(ul, 'txt', mission ? mission.title + '. ' + missionText() + '. For ' + NAT[mission.nk].land + ', pays ' + mission.reward + ' gold.' : 'None. Governors offer them in port.');
  ledgerText(ul, 'sec', 'Standing');
  ledgerText(ul, 'txt', NKEYS.map(k => NAT[k].land.replace(/^the /, '') + ': ' + standWord(standing[k])).join(' · ') + '.');
}
function struck(s, quiet){ // one of your shot, or your fleet's, has hit s
  if (!quiet || !tracked) engage(s); if (s.released) return;
  if (!s.hitByPlayer){ s.hitByPlayer = true; offend(s, 6); }
  if (s.fleet && fleet) fleet.alarm = true;
  if (s.nation) for (const o of ships) if (o.nation === s.nation && (o.role === 'patrol' || o.role === 'escort') && Math.hypot(o.x-s.x, o.y-s.y) < 800) o.provoked = true;
}
function ailing(s, dt){
  if (s.sinking != null) return; const f = s.hull/s.maxHull;
  if (s.burn && s.burn.length){ const c = Math.cos(s.h), n = Math.sin(s.h); // fires started by round shot burn for a while
    for (let i = s.burn.length-1; i >= 0; i--){ const u = s.burn[i]; u.t -= dt; if (u.t <= 0){ s.burn.splice(i, 1); continue; } const x = s.x + c*u.ox - n*u.oy, y = s.y + n*u.ox + c*u.oy;
      if (rnd() < dt*14) parts.push({ k:'flame', x: x + rand(-2, 2), y: y + rand(-2, 2), vx: rand(-6, 6), vy: rand(-6, 6), life: rand(.25, .5), max: .5, size: rand(4, 7) });
      if (rnd() < dt*2.2) puff(x, y, rand(9, 14), rand(4, 8), true); } }
  if (f >= .5) return;
  const o = rand(-.35, .35)*s.t.len, x = s.x + Math.cos(s.h)*o, y = s.y + Math.sin(s.h)*o;
  if (rnd() < dt*(f < .25 ? 10 : 4)) parts.push({ k:'smoke', g: 45 + (rnd()*30|0), x, y, vx: rand(-8,8), vy: rand(-8,8), life: rand(1,2), max:2, size: rand(3,6) });
  if (f < .25 && rnd() < dt*9) parts.push({ k:'flame', x, y, vx: rand(-6,6), vy: rand(-6,6), life: rand(.25,.5), max:.5, size: rand(4,7) });
}
function hitShip(b, s){
  const dx = b.x-s.x, dy = b.y-s.y, c = Math.cos(s.h), n = Math.sin(s.h);
  const lx = (dx*c + dy*n)/(s.t.len*.5), ly = (-dx*n + dy*c)/(s.t.wid*.5 + 4);
  return lx*lx + ly*ly < 1;
}
/* the flagship is gone: shift your flag, take to the boat, beg a governor, or end it */
let fateTried = {}, fateText = '';
function openFate(text){ state = 'fate'; endMelee(); closeOrders(); setPaused(false); fateTried = {}; fateText = text || ''; renderFate(); $('fate').hidden = false; const b = $('fateBtns').querySelector('button:not(:disabled)'); if (b) b.focus(); }
const fateOdds = k => clamp(.3 + standing[k]/70, .05, .92);
function afterFate(msg){ $('fate').hidden = true; state = 'play'; hold = emptyHold(); tracked = null; fleetTarget = null; course = null; autoHelm = false; routeLine = null; balls.length = 0; pending.length = 0;
  ships.forEach(o => { if (o.owner !== 'player'){ o.announced = false; o.hitByPlayer = false; o.provoked = false; if (o.role === 'hunter' && Math.hypot(o.x - p.x, o.y - p.y) < 1800) o.gone = true; } }); hunterT = 45; p.sail = 0; say(msg); document.activeElement && document.activeElement.blur(); }
function renderFate(){
  const cap = p.lastFoe && NAT[p.lastFoe] ? 'the ' + NAT[p.lastFoe].adj : 'pirates', sq = squad();
  $('fateTitle').textContent = 'The ' + p.name + ' is lost';
  $('fateText').textContent = (fateText || 'She goes down by the head and the sea closes over her.') + ' You are in the water with what is left of your people, and ' + cap + ' have the weather gauge. You have ' + gold + ' gold to your name.';
  const box = $('fateBtns'); box.textContent = '';
  const R = (id, name, desc, label, on, fn) => uiRow(box, name, desc, '', [[id, label, on, fn]], () => { if (state === 'fate') renderFate(); });
  sq.slice().sort((a, b) => b.hull - a.hull).slice(0, 2).forEach((o, i) => R('ft_flag' + i, 'Shift your flag to the ' + o.name, 'Her boats pick you up. The ' + o.t.cname + ' becomes your flagship, with her crew of ' + o.crew + '. Your cargo aboard the flagship is lost.', 'Board her', true, () => {
    const d = fleetData(o), x = o.x, y = o.y, h = o.h; ships.splice(ships.indexOf(o), 1); up = cleanUp(d.up); p = makeShip(d.cls, 'player', 'player', x, y, h); refit(); p.hull = p.maxHull*d.hf; p.sails = d.sails; p.crew = d.crew; p.name = cleanName(d.name);
    afterFate('You hoist your flag in the ' + p.name + '. The fight is not over.'); trimHold(); }));
  R('ft_boat', 'Take to the longboat', 'Marooned on the open sea with eight hands, a sail and a compass. You keep a third of your gold and none of your cargo. Reach a port and a yard will find you a sloop.', 'Cast off', true, () => {
    const w = isLand(p.x, p.y) ? waterNear(p.x, p.y, 200) : [p.x, p.y]; gold = Math.floor(gold/3); up = { guns:0, hull:0, sail:0, drill:0 }; p = makeShip('boat', 'player', 'player', w[0], w[1], p.h); refit(); p.crew = 8; p.name = 'Longboat';
    afterFate('You are adrift in the longboat. Make sail for the nearest port.'); });
  NKEYS.forEach(k => { const odds = fateOdds(k), tried = fateTried[k];
    R('ft_' + k, 'Write to the governor of ' + NAT[k].land.replace(/^the /, ''), tried ? 'He has declined to speak for you.' : 'You are taken prisoner and petition for your release. ' + NAT[k].land.replace(/^t/, 'T') + ' counts you ' + standWord(standing[k]).toLowerCase() + ': he is ' + (odds > .65 ? 'likely' : odds > .35 ? 'as likely as not' : 'unlikely') + ' to help. Freedom costs four tenths of your gold and three days.', tried ? 'Declined' : 'Send the letter', !tried, () => {
      if (rnd() < odds){ const own = ports.filter(q => q.nk === k).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0] || ports[0];
        gold = Math.floor(gold*.6); up = { guns:0, hull:0, sail:0, drill:0 }; p = makeShip('sloop', 'player', 'player', own.ox, own.oy, own.out); refit(); p.hull = p.maxHull*.7; p.sails = 80; p.crew = 20; clock += DAY*3; lastDay = Math.floor((clock/DAY*24 + 8)/24); standing[k] = clamp(standing[k] - 6, -100, 100);
        afterFate('The governor of ' + NAT[k].land.replace(/^the /, '') + ' has spoken for you. Three days on, you are set down at ' + own.name + ' with a worn sloop and twenty hands.'); }
      else fateTried[k] = true; }); });
  R('ft_end', 'End the voyage here', 'Let the sea have the last word, and see how you are remembered.', 'End it', true, () => { $('fate').hidden = true; gameOver(fateText); });
}
function retire(){ const hullV = d => Math.round(CLASSES[d.cls].value*.35), fortune = gold + courtDue + hullV(p) + squad().reduce((n, o) => n + hullV(o), 0) + laidUp.reduce((n, d) => n + hullV(d), 0) + GK.reduce((n, g) => n + hold[g]*GOODS[g][1], 0);
  const mo = Math.max(1, Math.floor(clock/MONTH)), yrs = Math.floor(mo/12), tot = stats.taken + stats.sunk, pirate = stats.unlawful > stats.lawful;
  const who = inService() && navy.rank ? 'a ' + NAVY[navy.rank][1] + ' in the ' + NAT[marque].adj + ' service' : pirate ? 'a pirate known as ' + RANKS[rankIdx][1] : 'known as ' + RANKS[rankIdx][1];
  const end = fortune < 2000 ? 'It buys a tavern by the careenage, where you tell the story for rum.' : fortune < 10000 ? 'It buys a small sugar estate in the hills and a quiet old age.' : fortune < 30000 ? 'It buys a town house, a seat on the council and a pew near the front.' : 'It is one of the great fortunes of the islands, and your grandchildren will not know how it was made.';
  const score = fortune + Math.round(plunder/2) + (inService() ? navy.rank*2000 : 0);
  closePort(); gaz('The master of the ' + p.name + ' has come ashore at ' + homeName + ' and quit the sea.', 'you');
  gameOver('You came ashore at ' + homeName + ' in ' + dateStr() + ' after ' + (yrs ? yrs + (yrs > 1 ? ' years' : ' year') + ' and ' : '') + (mo % 12) + ' months at sea, ' + who + '. You took ' + stats.taken + ' ships and sank ' + stats.sunk + (tot ? '; ' + stats.lawful + ' of the ' + tot + ' were lawful prize' : '') + '. Your fortune came to ' + fortune + ' gold. ' + end + ' Final reckoning: ' + score + '.', 'Swallowing the anchor'); }
function gameOver(text, title){
  state = 'over'; endMelee(); $('overTitle').textContent = title || 'She goes down by the head';
  $('overText').textContent = text || 'You took ' + plunder + ' gold in plunder and were known as ' + RANKS[rankIdx][1] + '. The sea keeps the rest.';
  $('overLoad').hidden = !latest(); $('over').hidden = false; $('againBtn').focus();
}

/* ---------- Render ---------- */
