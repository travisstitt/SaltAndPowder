function snapshot(){
  const m = mission; let np = ports[0], nd = 1e9; for (const q of ports){ const d = Math.hypot(q.x-p.x, q.y-p.y); if (d < nd){ nd = d; np = q; } }
  const owners = {}; ports.forEach(q => { if (q.nk !== q.home) owners[q.name] = q.nk; });
  return { v:4, deg: DEG, policy: prizePolicy, pname: p.name, course: course ? course.name : null, squad: squad().map(fleetData), laidUp, spares, home: homeName, formation, orders, t: Date.now(), diff, gold, plunder, up, standing, cls: p.cls, shot, where: np.name, rank: RANKS[rankIdx][1], crew: p.crew, hold, wars: [...wars], owners, clock: Math.round(clock), wx: weather.kind, proj: 2, cal0, marque, courtDue, courtList, gaz: gazette.slice(0, 40), navy, captives, stats, dispatches: dispatches.slice(0, 30).map(v => ({ d: v.d, who: v.who, t: v.t })), book, ledger: ledger.slice(0, 40), store2, contract: contract ? { g: contract.g, tons: contract.tons, port: contract.port.name, until: contract.until, reward: contract.reward, nk: contract.nk } : null, press: ports.filter(q => q.pr && Object.keys(q.pr).length || q.ev && q.ev.length).map(q => [q.name, q.pr || {}, q.ev || []]), morale: Math.round(morale), officers, foul: +foul.toFixed(2), fouling, rivals,
    p: { x: Math.round(p.x), y: Math.round(p.y), h: +p.h.toFixed(3), hull: Math.round(p.hull), sails: Math.round(p.sails) },
    wind: { dir: +wind.dir.toFixed(3), str: +wind.str.toFixed(2) }, fleetLeg: fleet ? fleet.leg : null,
    mission: m ? { type: m.type, nk: m.nk, title: m.title, reward: m.reward, rep: m.rep, port: m.port && m.port.name, foe: m.foe, need: m.need, have: m.have, cls: m.cls, until: m.until, svc: m.svc,
      g: m.g, tons: m.tons, name: m.name, ax: m.x, ay: m.y, arrived: m.arrived, tr: m.ships ? m.ships.filter(t => !t.gone && t.sinking == null).map(t => [Math.round(t.x), Math.round(t.y)]) : undefined, sx: m.ship ? Math.round(m.ship.x) : 0, sy: m.ship ? Math.round(m.ship.y) : 0 } : null };
}
function readSlot(id){ try { const d = JSON.parse(recall('save.' + id)); return d && d.p ? d : null; } catch (_){ return null; } }
function writeSlot(id){ const d = snapshot(); store('save.' + id, JSON.stringify(d)); const b = readSlot(id); return !!b && b.t === d.t; }
function autosave(){ if (p && p.alive && !writeSlot('auto') && !saveWarned){ saveWarned = true;
  say('The log could not be written: this browser\'s storage is full or closed. Copy a save code from the log book to keep your voyage.'); } }
function latest(){ return SLOTS.map(v => readSlot(v[0])).filter(Boolean).sort((a, b) => b.t - a.t)[0] || null; }
function canSave(){ return (state === 'play' || state === 'port') && p.alive && !melee &&
  !(state === 'play' && (balls.length || ships.some(s => s.announced && !s.surrendered && !s.released && Math.hypot(s.x-p.x, s.y-p.y) < 900))); }
function encode(d){ return btoa(unescape(encodeURIComponent(JSON.stringify(d)))); }
function decode(t){ try { const d = JSON.parse(decodeURIComponent(escape(atob(String(t).replace(/\s+/g, ''))))); return d && d.p ? d : null; } catch (_){ return null; } }
function summary(d){ const c = CLASSES[d.cls] ? CLASSES[d.cls].cname : 'sloop', when = new Date(d.t || 0);
  return (d.rank || 'Swab') + ' · ' + c + ' · ' + (d.gold|0) + ' gold · near ' + (d.where || 'Kingston') + ' · ' + (DIFFS[d.diff] ? DIFFS[d.diff].name : 'Normal') + ' · ' +
    when.toLocaleDateString([], { month:'short', day:'numeric' }) + ' ' + when.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
function loadGame(d){ closeMenu(); setPaused(false); $('title').hidden = true; $('over').hidden = true;
  $('port').hidden = true; initAudio(); const oldLog = !!(d && d.p && d.cal0 == null);
  newGame(d); setDiff(diff); state = 'play';
  if (oldLog) later(() => say('This log was kept under the old rules. The calendar restarts in January 1756 and the wars now follow history.'), 3900);
  say('Voyage resumed near ' + (d.where || 'Kingston') + '. Other ships have moved on since you saved.'); }
function setDiff(k){ diff = DIFFS[k] ? k : 'normal'; store('diff', diff);
  document.querySelectorAll('[data-diff]').forEach(b => b.setAttribute('aria-pressed', b.dataset.diff === diff));
  document.querySelectorAll('.diffNote').forEach(e => { e.textContent = D().name + ': ' + D().note; }); }
function refreshTitle(){ const l = latest(); $('contBtn').hidden = !l; if (l) $('contBtn').textContent = 'Continue: ' + summary(l); }
function openMenu(){ setChart(false); menuOpen = true; held.left = held.right = false; $('menu').hidden = false; $('saveCode').value = ''; renderMenu(); $('menuClose').focus(); }
function closeMenu(){ menuOpen = false; $('menu').hidden = true; $('manifest').hidden = true;
  $('fleetSheet').hidden = true; $('paper').hidden = true; if (!$('ask').hidden){ $('ask').hidden = true;
  const f = askDefault; askDefault = null; if (f) f(); } if (state === 'port') renderPort();
  refreshTitle(); document.activeElement && document.activeElement.blur(); }
function renderMenu(focusId, note){
  const ok = canSave(), live = state === 'play' || state === 'port';
  $('menuNote').textContent = note || (!live ? 'Start or load a voyage to save it.' : ok ? 'The game also saves by itself each time you enter or leave a port.' : 'You cannot save with shot in the air or an enemy closing. Shake her off first.');
  const ul = $('slots'); ul.textContent = '';
  SLOTS.forEach(v => { const d = readSlot(v[0]), e = document.createElement('li'), sp = document.createElement('span'), sm = document.createElement('small'), bs = document.createElement('span');
    sp.textContent = v[1]; sm.textContent = d ? summary(d) : 'Empty'; sp.appendChild(sm); bs.className = 'btns';
    const btn = (id, label, on, fn) => { const b = document.createElement('button');
      b.type = 'button'; b.id = id; b.textContent = label; b.disabled = !on; b.addEventListener('click', fn); bs.appendChild(b); };
    if (v[0] !== 'auto') btn('sv_' + v[0], 'Save', ok, () => { const w = writeSlot(v[0]); renderMenu('sv_' + v[0], w ? 'Saved to ' + v[1] + '.' : 'This browser would not keep the save. Use the save code below instead.'); });
    btn('ld_' + v[0], 'Load', !!d, () => loadGame(d));
    e.appendChild(sp); e.appendChild(bs); ul.appendChild(e); });
  $('copyCode').disabled = !live;
  const f = focusId && $(focusId); if (f && !f.disabled) f.focus();
}
document.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => setDiff(b.dataset.diff)));
const ERAS = { 0:'January 1750. The long peace: trade, smuggle, hunt the last pirates. War is six years off.', 72:'January 1756. Britain and France are a few months from open war, and Spain will follow in 1762.', 108:'January 1759. Britain and France are at war and the governors are signing letters of marque.' };
const STARTS = { Kingston:'Kingston, Jamaica: the sugar islands, Spanish trade to windward, the plate fleet to leeward.', Charleston:'Charleston, Carolina: rice and indigo, with Spanish Florida a day\'s sail south.', 'New York':'New York: flour for the islands, and more privateers than any port in America.', Boston:'Boston: rum, fish and masts, with Louisbourg and the French fishery to the north.' };
function setStart(v){ startName = STARTS[v] ? v : 'Kingston'; document.querySelectorAll('[data-start]').forEach(b => b.setAttribute('aria-pressed', b.dataset.start === startName));
  $('startNote').textContent = STARTS[startName]; }
document.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => setStart(b.dataset.start))); setStart('Kingston');
function setFoul(v){ fouling = !!v; store('foul', fouling ? '1' : '0'); const b = $('foulBtn'); b.setAttribute('aria-pressed', fouling); b.textContent = 'Hull fouling: ' + (fouling ? 'on' : 'off'); }
$('foulBtn').addEventListener('click', () => setFoul(!fouling)); setFoul(recall('foul') === '1');
document.querySelectorAll('[data-eco]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.eco, i = ECOV.findIndex(o => o[0] === eco[k]); setEco(k, ECOV[(i + 1) % ECOV.length][0]); }));
  try { const e0 = JSON.parse(recall('eco') || '{}'); for (const k in ECO) if (ECOV.some(o => o[0] === e0[k])) eco[k] = e0[k]; } catch (_){ } setEco();
function setEra(v){ startCal = ERAS[v] ? +v : 72; document.querySelectorAll('[data-era]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.era === startCal));
  $('eraNote').textContent = ERAS[startCal]; }
document.querySelectorAll('[data-era]').forEach(b => b.addEventListener('click', () => setEra(b.dataset.era))); setEra(72);
$('menuBtn').addEventListener('click', e => { openMenu(); e.currentTarget.blur(); });
$('menuClose').addEventListener('click', closeMenu);
$('manifestClose').addEventListener('click', closeMenu);
$('cargoBtn').addEventListener('click', e => { openManifest(); e.currentTarget.blur(); });
function setKeys(open, keep){ $('keys').classList.toggle('shut', !open); $('keysBtn').textContent = open ? 'Hide keys' : 'Keys';
  $('keysBtn').setAttribute('aria-expanded', open); if (keep) store('keys', open ? '1' : '0'); }
$('keysBtn').addEventListener('click', e => { setKeys($('keys').classList.contains('shut'), true); e.currentTarget.blur(); }); setKeys(recall('keys') !== '0');
$('dispBtn').addEventListener('click', e => { openPaper('dispatches'); e.currentTarget.blur(); });
$('gazBtn').addEventListener('click', e => { openPaper('gazette'); e.currentTarget.blur(); }); $('paperClose').addEventListener('click', closeMenu);
$('holdLine').addEventListener('click', openManifest);
$('titleLoad').addEventListener('click', openMenu);
$('contBtn').addEventListener('click', () => { const l = latest(); if (l) loadGame(l); });
$('overLoad').addEventListener('click', () => { const l = latest(); if (l) loadGame(l); });
$('copyCode').addEventListener('click', () => { const t = $('saveCode'); t.value = encode(snapshot()); t.focus(); t.select();
  const done = m => renderMenu('copyCode', m);
  try { navigator.clipboard.writeText(t.value).then(() => done('Save code copied. Keep it somewhere safe.'), () => done('Save code is in the box below. Select and copy it.')); }
  catch (_){ done('Save code is in the box below. Select and copy it.'); } });
$('loadCode').addEventListener('click', () => { const d = decode($('saveCode').value); if (d) loadGame(d); else renderMenu('loadCode', 'That is not a valid save code. Paste the whole code and try again.'); });

/* ---------- Toast ---------- */
let toastT = 0;
const toastQ = []; let toastAge = 9;
function showToast(msg){ const t = $('toast'); t.textContent = msg; t.classList.remove('off');
  toastT = clamp(5 + msg.length/16, 6.5, 14); toastAge = 0; } /* long enough to read, however fast the game is running */
function say(msg){ if (toastT > 0 && toastAge < 1.6 && $('toast').textContent !== msg){ if (toastQ.length < 5) toastQ.push(msg); return; } showToast(msg); }
function toastTick(rdt){ toastAge += rdt; if (toastQ.length && toastAge >= 2.6){ showToast(toastQ.shift());
  return; } if (toastT > 0){ toastT -= rdt; if (toastT <= 0){ if (toastQ.length) showToast(toastQ.shift());
  else $('toast').classList.add('off'); } } }

/* ---------- Update ---------- */
