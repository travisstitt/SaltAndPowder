function paintTown(){
  if (state !== 'port' || !curPort) return; const cvs = $('townCanvas'), g = cvs.getContext('2d');
  if (!townArt || townArt.key !== curPort.name + curPort.nk) townArt = townPaint(curPort);
  const A = townArt, N = curPort.nation; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(A.canvas, 0, 0);
  const sw = Math.sin(time*1.1); g.lineJoin = 'round'; g.beginPath(); for (let x = -20; x <= TW + 20; x += 16) x === -20 ? g.moveTo(x, A.coast(x)) : g.lineTo(x, A.coast(x));
    // surf, breathing as it does at sea
  g.strokeStyle = 'rgba(235,252,250,' + (.1 + .06*sw).toFixed(3) + ')'; g.lineWidth = 12 + 5*sw;
    g.stroke(); g.strokeStyle = 'rgba(255,255,255,' + (.5 - .15*sw).toFixed(3) + ')';
    g.lineWidth = 2.4; g.stroke();
  // ships, drawn exactly as they are under way: a trader at the jetty, and your own at anchor
  const main = cx, ghosts = A.ships.map(v => Object.assign(makeShip(v.cls, v.owner, v.role, v.x, v.y, v.h), { sail: 0, pol: .5, speed: 0, heel: 0 }));
  [p].concat(squad().filter(inCompany)).forEach((o, i) => { const k = Math.ceil(i/2), sd = i % 2 ? 1 : -1; ghosts.push(Object.assign({}, o, { x: A.anchor[0] + (i ? sd*k*92 : 0), y: A.anchor[1] + (i ? 16 + (k - 1)*6 : 0) + Math.sin(time*1.3 + i)*1.2, h: -Math.PI/2 + .12*sd*(i ? 1 : 0), sail: 0, pol: .5, speed: 0, heel: Math.sin(time*.9 + i*2)*.08, sinking: null })); });
  cx = g; try { for (const o of ghosts){ g.save(); g.translate(o.x, o.y); g.scale(1.25, 1.25); g.translate(-o.x, -o.y); drawShip(o); g.restore(); } } finally { cx = main; }
  for (const f of A.flags){ const x = f[0], y = f[1], wd = wind.dir, fw = Math.sin(time*6 + x)*3.5, L = f[2]; g.lineCap = 'round';
    { const pts = []; for (let j = 0; j <= 4; j++){ const d = j/4, o = Math.sin(d*Math.PI)*fw;
      pts.push([x + Math.cos(wd)*L*d - Math.sin(wd)*o, y + Math.sin(wd)*L*d + Math.cos(wd)*o]);
      } g.lineCap = 'butt'; drawEnsign(g, A.key.slice(-2), pts, 10); }
    g.lineCap = 'butt'; g.fillStyle = '#2a1c10'; circle(g, x, y, 2.6); g.fill(); }
  const dk = darkness();
  if (dk > .02){ g.fillStyle = 'rgba(4,10,38,' + (dk*.95).toFixed(3) + ')'; g.fillRect(0, 0, TW, TH); g.globalCompositeOperation = 'lighter'; const la = dk/.6;
    g.fillStyle = 'rgba(255,215,130,' + (.8*la).toFixed(3) + ')'; A.lights.forEach((v, i) => { if (i % 4 === 3) return; g.fillRect(v[0] - 2, v[1] - 2, 4, 4); });
    for (const v of A.glows){ const gr = g.createRadialGradient(v[0], v[1], 0, v[0], v[1], v[2]);
      gr.addColorStop(0, 'rgba(255,205,120,' + (.55*la).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,70,0)');
      g.fillStyle = gr; circle(g, v[0], v[1], v[2]); g.fill(); }
    g.globalCompositeOperation = 'source-over'; }
  // the five places: a ring when chosen or under the pointer, and a name in the same lettering as a ship's tag
  for (const s of A.spots){ const sel = s.id === portTab, hov = s.id === townHover;
    if (sel || hov){ g.fillStyle = sel ? 'rgba(214,165,78,.12)' : 'rgba(255,255,255,.08)';
      g.strokeStyle = sel ? 'rgba(214,165,78,.95)' : 'rgba(255,255,255,' + (.6 + .3*Math.sin(time*5)).toFixed(3) + ')';
      g.lineWidth = 3; g.setLineDash([10, 8]); g.lineDashOffset = -time*24;
      g.beginPath(); g.roundRect ? g.roundRect(s.x, s.y, s.w, s.h, 10) : g.rect(s.x, s.y, s.w, s.h); g.fill(); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0; }
    const ty = s.y > 30 ? s.y - 9 : s.y + s.h + 22; g.font = '700 19px "Alegreya Sans", sans-serif';
      g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = 'rgba(8,25,30,.85)'; g.strokeText(s.name.toUpperCase(), s.x + s.w/2, ty);
      g.fillStyle = sel ? C.brass : C.bone; g.fillText(s.name.toUpperCase(), s.x + s.w/2, ty); }
  g.font = '34px "Pirata One", Georgia, serif'; g.textAlign = 'left'; g.lineWidth = 5;
    g.strokeStyle = 'rgba(8,25,30,.85)'; g.strokeText(curPort.name, 22, TH - 22); g.fillStyle = C.bone;
    g.fillText(curPort.name, 22, TH - 22);
}
function townSpotAt(e){ if (!townArt) return null; const b = $('townCanvas').getBoundingClientRect(), x = (e.clientX - b.left)/b.width*TW, y = (e.clientY - b.top)/b.height*TH; let hit = null;
  for (const s of townArt.spots) if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) hit = s.id; return hit; }
$('townCanvas').addEventListener('mousemove', e => { townHover = townSpotAt(e); e.currentTarget.style.cursor = townHover ? 'pointer' : 'default'; });
$('townCanvas').addEventListener('mouseleave', () => { townHover = null; });
$('townCanvas').addEventListener('click', e => { const id = townSpotAt(e); if (!id) return; if (id === 'fleet'){ openFleet('F'); return; } portTab = id; renderPort(); });
document.querySelectorAll('#townTabs [data-tab]').forEach(b => b.addEventListener('click', () => { if (b.dataset.tab === 'fleet'){ openFleet('F'); return; } portTab = b.dataset.tab; renderPort(); }));

/* ---------- Fleet management: every ship, at sea or in port ---------- */
function drawPic(s){
  const c = $('shipPic'), w = c.width, h = c.height, g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a6072'); gr.addColorStop(1, '#0d3340'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(205,240,238,.18)'; g.lineWidth = 2; for (let i = 0; i < 26; i++){ const x = h1(i*3.1)*w, y = h1(i*7.7 + 2)*h;
    g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x, y - 7, x + 12, y); g.stroke(); }
  const k = Math.min(w/(s.t.len*1.75), h/(s.t.wid*3.6));
  const ghost = Object.assign({}, s, { x: 0, y: 0, h: 0, sail: 1, pol: .9, heel: 0, speed: 70, sinking: null, surrendered: false, released: false });
  const main = cx; cx = g; g.save(); g.translate(w/2 - s.t.len*k*.06, h/2 + 4); g.scale(k, k);
  try { drawShip(ghost); } finally { g.restore(); cx = main; }
  if (miniC && s.x != null && s.owner === 'player'){ /* where she is: a corner of the chart about her */
    const iw = Math.round(w*.3), ih = Math.round(h*.52), ix = w - iw - 8, iy = h - ih - 8, span = 7000, k2 = iw/span, sc = miniC.width/W, ox = clamp(s.x - span/2, 0, W - span), oy = clamp(s.y - ih/k2/2, 0, H - ih/k2);
    g.drawImage(miniC, ox*sc, oy*sc, span*sc, ih/k2*sc, ix, iy, iw, ih); g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
    for (const q of ports){ if (q.spec.land || q.spec.sz < 2 && q.name !== homeName) continue; const qx = ix + (q.x - ox)*k2, qy = iy + (q.y - oy)*k2; if (qx < ix || qx > ix + iw || qy < iy || qy > iy + ih) continue; g.fillStyle = q.name === homeName ? HOMEC : '#ffd24a'; circle(g, qx, qy, 3); g.fill(); }
    if (s !== p){ g.fillStyle = '#c8321e'; circle(g, ix + (p.x - ox)*k2, iy + (p.y - oy)*k2, 4); g.fill(); }
    const mx2 = ix + (s.x - ox)*k2, my2 = iy + (s.y - oy)*k2; g.fillStyle = '#ffffff'; g.strokeStyle = '#08191e'; g.lineWidth = 2; circle(g, mx2, my2, 5.5); g.fill(); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; circle(g, mx2, my2, 11); g.stroke(); g.restore();
    g.strokeStyle = 'rgba(214,165,78,.9)'; g.lineWidth = 2; g.strokeRect(ix + 1, iy + 1, iw - 2, ih - 2); }
}
function stowage(){ /* the fleet's common cargo, stowed ship by ship: flagship first, then each consort that is not trading on her own account */
  const out = new Map(), left = Object.assign({}, hold), order = [p].concat(squad().filter(o => !(o.task && o.task.type === 'trade')));
  order.forEach((s, i) => { let room = s.t.hold; const m = {}; for (const g of GK){ if (room <= 0) break; const n = Math.min(left[g], room); if (n > 0){ m[g] = n; left[g] -= n; room -= n; } } out.set(s, m); });
  const over = GK.reduce((n, g) => n + left[g], 0); if (over > 0){ const m = out.get(p); GK.forEach(g => { if (left[g] > 0) m[g] = (m[g] || 0) + left[g]; }); } return out; }
function holdLine(s){ const t = s.task && s.task.type === 'trade' ? s.task : null;
  if (t) return (t.cargo ? t.cargo.tons + ' tons of ' + GOODS[t.cargo.g][0].toLowerCase() + ', bought for ' + t.cargo.cost + ' gold' : 'In ballast') + ' · ' + Math.round(t.funds) + ' gold of trading stock in hand. ' + (s.docked ? (t.need ? 'She waits for funds.' : t.cargo ? 'She sails for ' + t.dest.name + ' as soon as she is loaded; she does not wait for a full hold.' : 'She is looking for a cargo that will pay.') : 'Bound for ' + t.dest.name + '.');
  const m = stowage().get(s) || {}, ks = GK.filter(g => m[g] > 0), used = ks.reduce((n, g) => n + m[g], 0);
  return (ks.length ? ks.map(g => GOODS[g][0] + ' ' + m[g] + ' t').join(' · ') : 'Empty') + '. ' + (s === p ? 'The fleet\'s cargo is stowed in the flagship first, then in each consort in turn.' : 'She carries what the ships ahead of her cannot.'); }
function nowLine(s){ /* what she is about, and where */
  const doing = s === p ? (state === 'port' && curPort ? 'At anchor at ' + curPort.name : course ? (autoHelm ? 'On a course for ' : 'Course marked for ') + course.name : p.sail > 0 ? 'Under way, in your own hand' : 'Lying to') : taskWord(s);
  return doing + '. ' + whereIs(s); }
const PTS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
function whereIs(s){ const off = offWhere(s.x, s.y).replace(/^ /, ''); if (s === p) return 'Your flagship lies ' + off + '.'; const d = Math.hypot(s.x - p.x, s.y - p.y), lg = Math.round(d/DEG*20);
  return lg < 2 ? 'In company with the flagship, ' + off + '.' : lg + ' leagues ' + PTS[Math.round(Math.atan2(s.y - p.y, s.x - p.x)/(Math.PI/4) + 8) % 8] + ' of the flagship, ' + off + '.'; }
function openFleet(sel){ if (state !== 'play' && state !== 'port') return; setChart(false); menuOpen = true; held.left = held.right = false; fleetSel = sel || 'F';
  $('fleetSheet').hidden = false; renderFleet(); $('fleetClose').focus({ preventScroll: true }); }
function renderFleet(focusId){
  let inPort = state === 'port', atHome = inPort && curPort.name === homeName; const sq = squad(), pct = s => Math.round(s.hull/s.maxHull*100);
  let kind = fleetSel[0], idx = +fleetSel.slice(1) || 0;
  if (kind === 'S' && !sq[idx] || kind === 'L' && !laidUp[idx]){ kind = 'F'; fleetSel = 'F'; }
  $('fleetGold').textContent = gold;
  const list = $('shipList'); list.textContent = '';
  const item = (key, title, sub) => { const b = document.createElement('button'), t = document.createElement('span'), sm = document.createElement('small');
    b.type = 'button'; b.className = 'shipitem'; b.id = 'fi_' + key;
    b.setAttribute('aria-pressed', String(fleetSel === key)); t.textContent = title;
      sm.textContent = sub; b.appendChild(t); b.appendChild(sm); b.addEventListener('click', () => { fleetSel = key; renderFleet('fi_' + key); }); list.appendChild(b); };
  item('F', p.name, 'Flagship · ' + p.t.cname + ' · hull ' + pct(p) + '%');
  sq.forEach((s, i) => item('S' + i, s.name, cap1(s.t.cname) + ' · ' + stars(s.cap) + ' · hull ' + pct(s) + '%'));
  laidUp.forEach((d, i) => item('L' + i, 'Laid up · ' + cap1(CLASSES[d.cls].cname), 'At ' + homeName + ' · hull ' + Math.round(d.hf*100) + '%'));
  const ul = $('shipRows'); ul.textContent = '';
  const R = (name, desc, amt, btns) => uiRow(ul, name, desc, amt, btns, renderFleet);
  if (kind === 'L'){ const d = laidUp[idx], k = CLASSES[d.cls], tmp = makeShip(d.cls, 'player', 'fleet', 0, 0, 0), v = Math.round(k.value*.35*d.hf);
    tmp.sails = d.sails; tmp.hull = tmp.maxHull*d.hf; drawPic(tmp);
    $('shipHead').textContent = (d.name || cap1(k.cname)) + ', a ' + k.cname + ' laid up at ' + homeName; $('nameRow').hidden = true;
    $('shipNow').textContent = 'Laid up at ' + homeName + ', out of commission. Her hold is empty.'; $('shipNow').hidden = false;
    $('shipSub').textContent = 'Rated ' + k.rate + ' guns · ' + k.guns + ' a side in play · hull ' + Math.round(d.hf*100) + '% · crew ' + d.crew + ' · ' + (d.cap && !d.cap.mate ? 'Capt. ' + d.cap.name + ' ' + stars(d.cap) : 'no captain');
    R('Recall her to the fleet', atHome ? (sq.length < MAXSQ ? 'She rejoins you here.' : 'Your fleet is full at ' + MAXSQ + ' consorts.') : 'You must be in port at ' + homeName + '.', '', [['lr', 'Recall', atHome && sq.length < MAXSQ, () => { laidUp.splice(idx, 1); addFleet(d, curPort.ox, curPort.oy, curPort.out); fleetSel = 'S' + (squad().length - 1); }]]);
    R('Sell her', atHome ? 'The yard at ' + homeName + ' will take her. Her captain stays with you as a spare.' : 'You must be in port at ' + homeName + '.', v + ' gold', [['ls', 'Sell', atHome, () => { gold += v; if (d.cap && !d.cap.mate && spares.length < 6) spares.push(d.cap); laidUp.splice(idx, 1); fleetSel = 'F'; }]]);
  } else { const flag = kind === 'F', s = flag ? p : sq[idx], u = upOf(s), here = flag || inCompany(s), inPortAll = inPort; inPort = inPortAll && here; atHome = atHome && here; drawPic(s);
    $('shipHead').textContent = s.name + (flag ? ', your flagship, a ' : ', a ') + s.t.cname;
      $('nameRow').hidden = false; if (document.activeElement !== $('shipNameIn')) $('shipNameIn').value = s.name;
    $('shipSub').textContent = 'Rated ' + s.t.rate + ' guns · ' + s.guns + ' a side in play · speed ' + s.t.speed + ' · hold ' + s.t.hold + ' tons' + (flag ? '' : ' · ' + (s.cap.mate ? 'under your first mate ★☆☆☆☆' : stars(s.cap) + ' gunnery ' + s.cap.gun + ', seamanship ' + s.cap.sea));
    $('shipNow').textContent = nowLine(s); $('shipNow').hidden = false;
    R('Where she is', 'Her place is marked on the picture above' + (s === p ? '.' : ', with the flagship in red.'), '', [['fc', 'Show on chart', true, () => { closeMenu(); setChart(true, s); }]]);
    { const m = s.task && s.task.type === 'trade' ? null : stowage().get(s) || {}, used = m ? GK.reduce((n, g) => n + (m[g] || 0), 0) : s.task.cargo ? s.task.cargo.tons : 0; R('In her hold', holdLine(s), used + ' of ' + s.t.hold + ' tons', []); }
    if (flag) R('Trade ledger', 'What your traders have made, month by month, and the price book.', '', [['toLedger', 'Open the ledger', true, () => openPaper('ledger')]]);
    if (flag && sq.length) R('Signals to the whole fleet', sq.filter(o => o.docked).length + ' in port, ' + sq.filter(o => !o.docked && o.task && o.task.type !== 'fleet').length + ' detached, ' + sq.filter(o => !o.task || o.task.type === 'fleet').length + ' with the flag.', '', [['sg_recall', 'All rejoin', true, () => fleetSignal('recall')], ['sg_port', 'All to the nearest port', true, () => fleetSignal('port')], ['sg_home', 'Rendezvous at ' + homeName, true, () => fleetSignal('home')]]);
    if (flag) ledgerText(ul, 'txt', 'The hands are ' + moraleWord() + '. Officers: ' + (Object.keys(OFFICERS).filter(k => officers[k]).map(k => OFFICERS[k][0].toLowerCase()).join(', ') || 'none beyond your mates') + '.' + (fouling ? ' Her bottom is ' + (foul < .15 ? 'clean.' : foul < .5 ? 'growing weed.' : 'foul.') : ''));
    if (!inPort) ledgerText(ul, 'txt', 'At sea you can move hands between ships and appoint captains. Repairs, refits, hiring and selling need a port.');
    const fix = hurt(s), fc = Math.min(fix, gold);
    R('Hull and sails', fix ? fix + ' points of damage.' : 'Sound.', Math.round(s.hull) + '/' + Math.round(s.maxHull) + ' · ' + Math.round(s.sails) + '%', [['fx', !fix ? 'No need' : !inPort ? 'In port only' : 'Repair: ' + fc + ' gold', inPort && fix > 0 && gold > 0, () => { gold -= fc; mend(s, fc); ashore(3 + fc*.1); }]]);
    const hire = Math.min(10, s.t.crew - s.crew, Math.floor(gold/8));
    R('Crew', flag ? 'Below half strength her guns reload slowly.' : 'Move hands between her and your flagship, five at a time.', s.crew + '/' + s.t.crew, [
      flag ? null : ['cm', '−5 to flagship', here && s.crew >= 10 && p.crew + 5 <= p.t.crew, () => { s.crew -= 5; p.crew += 5; }],
      flag ? null : ['cp', '+5 from flagship', here && p.crew >= 15 && s.crew + 5 <= s.t.crew, () => { s.crew += 5; p.crew -= 5; }],
      ['ch', !inPort ? 'In port only' : hire > 0 ? 'Hire ' + hire + ': ' + hire*8 + ' gold' : 'Hire', inPort && hire > 0, () => { gold -= hire*8; s.crew += hire; ashore(3); }]]);
    Object.keys(UPG).forEach(k => { const U = UPG[k], l = u[k], maxed = l >= U.max, c = U.cost(l);
      R(U.name, U.act + '. Level ' + l + ' of ' + U.max + '.', U.val(s), [['up_' + k, maxed ? 'Finest fitted' : !inPort ? 'In port only' : c + ' gold', inPort && !maxed && gold >= c, () => { gold -= c; u[k]++; flag ? refit() : fitConsort(s); ashore(15); }]]); });
    if (!flag){
      const tt = s.task && s.task.type || 'fleet', mark = fleetTarget || tracked;
      R('Her orders', taskWord(s) + '. On her own she takes prizes for the fleet: hostile merchantmen, pirates, and any ship you have marked. Her company keeps a tenth.', '', [
        ['to_fleet', 'Sail with the fleet', tt !== 'fleet', () => setTask(s, { type: 'fleet' })],
        ['to_raid', 'Hunt prizes', tt !== 'raid', () => setTask(s, { type: 'raid', at: [s.x, s.y], prey: null })],
        ['to_chase', mark ? 'Chase the ' + nm(mark) : 'Chase my mark', !!mark && mark.sinking == null && !mark.released, () => setTask(s, { type: 'chase', prey: mark, at: [s.x, s.y] })],
        ['to_hold', 'Hold here', tt !== 'hold', () => setTask(s, { type: 'hold' })]]);
      R('Send her to a port', 'Choose the port on the chart. She sails there, goes in and lies safe; meet her there and she rejoins.', '', [['to_port', 'Choose on the chart', true, () => pickOnChart(s, 'port')]]);
      R('Independent service', 'Choose on the chart where she is to cruise for three months, which port she is to blockade, or which port she is to patrol to from where she lies. Her company keeps a tenth of what she takes.', '', [
        ['as_cruise', 'Cruise', true, () => pickOnChart(s, 'cruise')], ['as_blockade', 'Blockade', true, () => pickOnChart(s, 'blockade')], ['as_patrol', 'Patrol', true, () => pickOnChart(s, 'patrol')]]);
      { const t2 = s.task && s.task.type === 'trade' ? s.task : null, ci = Math.max(0, DOCS.cap.findIndex(o => o[0] === s.doc.cap));
        R('Trade on her own account', t2 ? 'She works ' + (t2.area ? t2.set.length + ' ports in the waters you marked' : t2.set.map(q => q.name).join(' and ')) + ' with ' + Math.round(t2.funds) + ' gold in hand' + (t2.cargo ? ' and ' + t2.cargo.tons + ' tons of ' + GOODS[t2.cargo.g][0].toLowerCase() + ' aboard' : '') + '. ' + (t2.runs || 0) + ' cargoes sold, ' + (t2.made || 0) + ' gold made.' : 'Mark two ports on the chart, or a stretch of water whose ports her captain may choose between. He buys what should sell at a profit where he is bound, carries a cargo on sooner than sell at a loss, and remits what he makes above his stock.', '', [
          ['as_two', 'Two ports', true, () => pickOnChart(s, 'two')], ['as_area', 'An area', true, () => pickOnChart(s, 'area')]]);
        [['margin', 'Least profit she will load for', 'A higher mark means fewer cargoes and surer ones.'], ['contra', 'Contraband', 'Cloth into Spanish ports, and provisions to the French in wartime.'], ['risk', 'Ports she will use', 'Whether she calls where your standing is poor.']].forEach(v => { const k = v[0], opts = DOCS[k], i = Math.max(0, opts.findIndex(o => o[0] === s.doc[k])); R(v[1], v[2], '', [['so_' + k, opts[i][1], true, () => { s.doc[k] = opts[(i + 1) % opts.length][0]; }]]); });
        { const tr = squad().filter(o => o !== s && o.task && o.task.type === 'trade').slice(0, 4); if (tr.length) R('Escort a trader', 'She keeps station on the trader, goes into port when the trader does, and fights what threatens her.', '', tr.map((o, i) => ['es_' + i, o.name, !(s.task && s.task.type === 'escort' && s.task.ward === o), () => setTask(s, { type: 'escort', ward: o })])); }
        R('Her trading stock', 'The gold she takes from your purse to trade with. It comes back when she is given other orders. If it runs too low to load a cargo, her captain writes to ask for more.', '', [['so_cap', DOCS.cap[ci][1], !t2, () => { s.doc.cap = DOCS.cap[(ci + 1) % DOCS.cap.length][0]; }]]); }
      ledgerText(ul, 'sec', 'Standing orders');
      [['wx', 'In a hurricane', 'A good seaman sees it coming sooner.'], ['dmg', 'When damaged', 'She breaks off and makes for the nearest open port.'], ['foe', 'Against warships, when detached', 'Whether she stands or runs.'], ['allow', 'Repairs without asking', 'Above this her captain writes for your leave.'], ['after', 'Once repaired', '']].forEach(v => { const k = v[0], opts = DOCS[k], i = Math.max(0, opts.findIndex(o => o[0] === s.doc[k]));
        R(v[1], v[2], '', [['so_' + k, opts[i][1], true, () => { s.doc[k] = opts[(i + 1) % opts.length][0]; }]]); });
      if (!here) ledgerText(ul, 'txt', 'She is away from the flagship: repairs, refits, crew and selling wait until she is back in company.');
      const best = spares.slice().sort((a, b) => b.gun + b.sea - a.gun - a.sea).slice(0, 3);
      R('Captain', s.cap.mate ? 'Your first mate commands her. Hire a captain in a tavern.' : 'Capt. ' + s.cap.name + ': gunnery ' + s.cap.gun + ', seamanship ' + s.cap.sea + '.', stars(s.cap),
        best.map((c, i) => ['ca_' + i, 'Appoint ' + c.name.split(' ').slice(-1)[0] + ' ' + '★'.repeat(Math.round((c.gun + c.sea)/2)), true, () => { spares.splice(spares.indexOf(c), 1); if (!s.cap.mate) spares.push(s.cap); s.cap = c; fitConsort(s); }]));
      const v = Math.round(s.t.value*.35*s.hull/s.maxHull);
      R('Hoist your flag in her', 'She becomes your flagship and your present ship takes her place in the fleet. Refits stay with each ship.', '', [['fg', 'Hoist flag', inPort, () => { const a = fleetData(s), mine = { cls: p.cls, hf: p.hull/p.maxHull, sails: p.sails, crew: s.crew, cap: s.cap, up: Object.assign({}, up), name: p.name }, myCrew = p.crew, o = p, x = s.x, y = s.y, h = s.h;
        ships.splice(ships.indexOf(s), 1); up = cleanUp(a.up); p = makeShip(a.cls, 'player', 'player', o.x, o.y, o.h);
          refit(); p.hull = p.maxHull*a.hf; p.sails = a.sails; p.crew = Math.min(myCrew, p.t.crew);
          p.name = cleanName(a.name, p.name); addFleet(mine, x, y, h); trimHold(); fleetSel = 'F'; }]]);
      R('Part with her', inPort ? 'Selling frees a place in your fleet; her captain stays with you as a spare and her crew is paid off.' + (atHome ? ' Or lay her up here to recall later.' : '') : 'Ships are sold in port, and laid up at ' + homeName + '.', v + ' gold', [
        ['fs', inPort ? 'Sell' : 'In port only', inPort, () => { gold += v; if (!s.cap.mate && spares.length < 6) spares.push(s.cap); ships.splice(ships.indexOf(s), 1); trimHold(); fleetSel = 'F'; }],
        atHome ? ['fl', 'Lay up', laidUp.length < MAXLAID, () => { laidUp.push(fleetData(s)); ships.splice(ships.indexOf(s), 1); trimHold(); fleetSel = 'F'; }] : null]);
    } else ledgerText(ul, 'txt', 'To replace your flagship, buy a ship at a shipyard, take a prize as your own, or hoist your flag in one of your consorts.');
  }
  $('fleetWages').textContent = 'Wages: ' + wageBill() + ' gold a month. Each consort\'s company takes 6% of every prize in shares.';
  $('policyBtn2').textContent = 'Prizes: ' + POLICY[prizePolicy];
  $('formBtn2').textContent = 'Formation: ' + FORMS[formation]; $('orderBtn2').textContent = 'Orders: ' + ORDERS[orders];
  const f = focusId && $(focusId); if (f && !f.disabled) f.focus({ preventScroll: true }); else if (focusId) $('fleetClose').focus({ preventScroll: true });
}
$('fleetClose').addEventListener('click', closeMenu);
$('fleetBtn').addEventListener('click', e => { openFleet('F'); e.currentTarget.blur(); });
$('flagCard').addEventListener('click', () => { if (state === 'play') openOrders(p); else openFleet('F'); });
$('policyBtn2').addEventListener('click', () => { cyclePolicy(); renderFleet('policyBtn2'); });
$('formBtn2').addEventListener('click', () => { cycleForm(); renderFleet('formBtn2'); });
$('orderBtn2').addEventListener('click', () => { cycleOrders(); renderFleet('orderBtn2'); });
$('fsBtn').addEventListener('click', e => { e.currentTarget.blur(); const no = () => say('Full screen is not available in this view.');
  try { if (document.fullscreenElement) document.exitFullscreen(); else { const r = document.documentElement.requestFullscreen(); if (r && r.catch) r.catch(no); } } catch (_){ no(); } });

/* ---------- Saving and difficulty ---------- */
let menuOpen = false;
const SLOTS = [['auto', 'Autosave'], ['1', 'Slot 1'], ['2', 'Slot 2'], ['3', 'Slot 3']];
