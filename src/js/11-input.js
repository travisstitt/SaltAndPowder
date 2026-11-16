function act(name){
  if (state !== 'play' || !p.alive || chartOpen || menuOpen || paused) return;
  if (name === 'sailUp') sailStep(1); else if (name === 'sailDown') sailStep(-1);
  else if (name === 'port') fire(p, -1); else if (name === 'star') fire(p, 1);
  else if (name === 'board') grapple();
  else if (melee) return;
  else if (name === 'both'){ for (const sd of [-1, 1]) if (!aimSide(sd, true).hit) fire(p, sd); } // never rakes a struck ship by accident
  else if (name === 'dock'){ if (!nearPort) return;
    if (iced(nearPort) && nearPort.name !== homeName) say(nearPort.name + ' is shut in by ice and winter gales. The harbour opens again in April.');
    else if (hostile(nearPort.nk) && !nearPort.spec.free && !nearPort.spec.land) shoreAction(nearPort);
    else openPort(nearPort); }
}
let chartMark = null; /* a ship of yours picked out on the chart */
function setChart(on, at){ const ok = state === 'play' || state === 'port'; if (on && ok && menuOpen) closeMenu();
  if (on && !chartOpen){ chartV.z = 3; chartV.cx = at ? at.x : p.x; chartV.cy = at ? at.y : p.y; } /* the chart opens on your own waters, or on the ship you asked for; zoom out for the whole of it */
  chartMark = on && ok ? at || null : null; chartOpen = !!on && ok; if (!chartOpen && chartPick){ const ps = chartPick.s; chartPick = null; later(() => { if (!chartOpen && !menuOpen && squad().indexOf(ps) >= 0) openFleet('S' + squad().indexOf(ps)); }, 0); } /* a choice abandoned goes back to her card */
  held.left = held.right = false; $('chartTools').hidden = !chartOpen;
  $('hud').style.visibility = $('toast').style.visibility = chartOpen ? 'hidden' : ''; if (state === 'port') $('port').hidden = chartOpen; /* in port the chart lies over the town until it is put away */ }
const KEYS = { KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right' };
const TAPS = { KeyB:'board', KeyW:'sailUp', ArrowUp:'sailUp', KeyS:'sailDown', ArrowDown:'sailDown', KeyQ:'port', KeyE:'star', Space:'both', KeyF:'dock' };
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '') && e.code !== 'Escape') return; // typing a name or a save code
  if (menuOpen){ if (e.code === 'Escape' || (e.code === 'KeyJ' || e.code === 'KeyL') && !$('paper').hidden || e.code === 'KeyI' && !$('manifest').hidden || e.code === 'KeyV' && !$('fleetSheet').hidden) closeMenu(); return; }
  if (state === 'fate') return;
  if (state === 'port' && !chartOpen && !e.repeat && (e.code === 'KeyI' || e.code === 'KeyV' || e.code === 'KeyC')){ e.code === 'KeyI' ? openManifest() : e.code === 'KeyV' ? openFleet('F') : setChart(true); return; }
  if (state === 'port' && !chartOpen){ if (e.code === 'Escape') closePort(); return; }
  if (state !== 'play' && !(state === 'port' && chartOpen)) return;
  if (state === 'play' && e.code === 'Escape' && orderSel && !chartOpen && !menuOpen){ if (picking){ picking = false; renderOrders(); } else closeOrders(); e.preventDefault(); return; }
  if (chartOpen){ const c = e.code, st = 260/(chartGeo ? chartGeo.k : .05)/8; e.preventDefault();
    if (c === 'Equal' || c === 'NumpadAdd') chartV.z = clamp(chartV.z*1.3, 1, 5); else if (c === 'Minus' || c === 'NumpadSubtract') chartV.z = clamp(chartV.z/1.3, 1, 5);
    else if (c === 'ArrowLeft' || c === 'KeyA') chartV.cx -= st; else if (c === 'ArrowRight' || c === 'KeyD') chartV.cx += st;
      else if (c === 'ArrowUp' || c === 'KeyW') chartV.cy -= st; else if (c === 'ArrowDown' || c === 'KeyS') chartV.cy += st;
    else if (c === 'Escape' || c === 'KeyC' || c === 'Enter') setChart(false);
    return; }
  if (KEYS[e.code]){ held[KEYS[e.code]] = true; e.preventDefault(); }
  else if (TAPS[e.code]){ if (!e.repeat || e.code === 'Space') act(TAPS[e.code]); e.preventDefault(); }
  else if (e.code === 'KeyR' && !e.repeat) toggleShot();
  else if (e.code === 'KeyM' && !e.repeat) toggleMute();
  else if (e.code === 'KeyT' && !e.repeat) setAssist(!assist);
  else if (e.code === 'KeyC' && !e.repeat) setChart(true);
  else if (e.code === 'KeyI' && !e.repeat) openManifest();
  else if (e.code === 'KeyJ' && !e.repeat) openPaper('gazette');
  else if (e.code === 'KeyL' && !e.repeat) openPaper('dispatches');
  else if (e.code === 'KeyV' && !e.repeat) openFleet('F');
  else if (e.code === 'KeyP' && !e.repeat) setPaused(!paused);
  else if (e.code === 'KeyN' && !e.repeat && course){ autoHelm = !autoHelm; p.path = null; say(autoHelm ? 'The helmsman steers for ' + course.name + '.' : 'You have the helm.'); }
  else if (e.code === 'KeyG' && !e.repeat) cycleForm();
  else if (e.code === 'KeyH' && !e.repeat) cycleOrders();
  else if ((e.code === 'Escape' || e.code === 'KeyL') && !e.repeat) openMenu();
  else if (/^Digit[123456]$/.test(e.code)) setPace(+e.code.slice(5) - 1);
  else if (e.code === 'Minus' || e.code === 'NumpadSubtract') setZoom(zoomMul/1.15);
  else if (e.code === 'Equal' || e.code === 'NumpadAdd') setZoom(zoomMul*1.15);
});
addEventListener('keyup', e => { if (KEYS[e.code]) held[KEYS[e.code]] = false; });
addEventListener('blur', () => { held.left = held.right = false; });
document.querySelectorAll('[data-hold]').forEach(b => {
  const k = b.dataset.hold, off = () => { held[k] = false; };
  b.addEventListener('pointerdown', e => { held[k] = true; try { b.setPointerCapture(e.pointerId); } catch (_){ } e.preventDefault(); });
  b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
});
document.querySelectorAll('[data-tap]').forEach(b => b.addEventListener('pointerdown', e => { act(b.dataset.tap); e.preventDefault(); }));
$('shotBtn').addEventListener('click', e => { toggleShot(); e.currentTarget.blur(); });
$('muteBtn').addEventListener('click', e => { toggleMute(); e.currentTarget.blur(); });
function store(k, v){ try { localStorage.setItem('sp.' + k, v); } catch (_){ } }
function recall(k){ try { return localStorage.getItem('sp.' + k); } catch (_){ return null; } }
let paceOut = null; /* the pace you were sailing at, kept while you lie in port */
function setPace(i, quiet){ paceIdx = clamp(i|0, 0, PACES.length-1); $('paceBtn').textContent = 'Pace: ' + PACES[paceIdx][1]; if (!quiet) store('pace', paceIdx); }
function setAssist(on){ assist = !!on; $('aimBtn').textContent = 'Aim: ' + (assist ? 'on' : 'off'); $('aimBtn').setAttribute('aria-pressed', assist); store('aim', assist ? 1 : 0); }
function setZoom(z){ zoomMul = clamp(z, .3, 2); scale = baseScale*zoomMul; store('zoom', zoomMul.toFixed(2)); }
addEventListener('wheel', e => { if (state !== 'play' || menuOpen) return; e.preventDefault();
  if (chartOpen) chartV.z = clamp(chartV.z*Math.exp(-e.deltaY*.0015), 1, 5); else setZoom(zoomMul*Math.exp(-e.deltaY*.0015)); }, { passive: false });
const touches = new Map(); let pinch = 0;
const spread = () => { const v = [...touches.values()]; return Math.hypot(v[0][0]-v[1][0], v[0][1]-v[1][1]); };
let dragged = false, dragAt = null;
cv.addEventListener('pointerdown', e => { touches.set(e.pointerId, [e.clientX, e.clientY]); dragged = false; dragAt = [e.clientX, e.clientY]; if (touches.size === 2) pinch = spread()/(chartOpen ? chartV.z : zoomMul); });
cv.addEventListener('pointermove', e => { chartPtr = [e.clientX, e.clientY]; if (!touches.has(e.pointerId)) return; const was = touches.get(e.pointerId); touches.set(e.pointerId, [e.clientX, e.clientY]);
  if (touches.size === 2 && pinch && (state === 'play' || chartOpen)){ if (chartOpen) chartV.z = clamp(spread()/pinch, 1, 5); else setZoom(spread()/pinch); dragged = true; }
  else if (chartOpen && touches.size === 1 && chartGeo){ if (dragAt && Math.hypot(e.clientX-dragAt[0], e.clientY-dragAt[1]) > 6) dragged = true;
    if (dragged){ chartV.cx -= (e.clientX-was[0])/chartGeo.k; chartV.cy -= (e.clientY-was[1])/chartGeo.k; } } });
const lift = e => { touches.delete(e.pointerId); if (touches.size < 2) pinch = 0; };
cv.addEventListener('pointerup', lift); cv.addEventListener('pointercancel', lift); cv.addEventListener('pointerleave', lift);
$('zoomOutBtn').addEventListener('click', e => { setZoom(zoomMul/1.2); e.currentTarget.blur(); });
$('zoomInBtn').addEventListener('click', e => { setZoom(zoomMul*1.2); e.currentTarget.blur(); });
$('paceBtn').addEventListener('click', e => { setPace((paceIdx + 1) % PACES.length); e.currentTarget.blur(); });
$('aimBtn').addEventListener('click', e => { setAssist(!assist); e.currentTarget.blur(); });
$('chartBtn').addEventListener('click', e => { setChart(!chartOpen); e.currentTarget.blur(); });
$('portChart').addEventListener('click', () => setChart(true));
cv.addEventListener('click', e => {
  if (chartOpen){ if (dragged){ dragged = false; return; } const g = chartGeo; let hit = null, bd = 20; // a click on a port sets a course for it
    if (g) for (const q of ports){ const d = Math.hypot(g.x - g.ox + q.x*g.k - e.clientX, g.y - g.oy + q.y*g.k - e.clientY); if (d < bd){ bd = d; hit = q; } }
    if (chartPick){ pickClick(hit, g ? (e.clientX - g.x + g.ox)/g.k : 0, g ? (e.clientY - g.y + g.oy)/g.k : 0); return; }
    if (hit){ if (hostile(hit.nk)) say(hit.name + ' is closed to you, but the course is set.'); setCourse(hit === course ? null : hit); }
    setChart(false); return; }
  const m = chartRect();
  if (state !== 'play') return;
  if (e.clientX >= m.x && e.clientX <= m.x + m.w && e.clientY >= m.y && e.clientY <= m.y + m.h){ setChart(true); return; }
  const wx = (e.clientX - vw/2)/scale + camNow.x, wy = (e.clientY - vh/2)/scale + camNow.y;
    let hit = null, bd = 70, mine = null, bm = 60; // a click on one of your ships opens her orders; on an enemy, names her the target
  for (const o of [p].concat(squad())){ const d = Math.hypot(o.x-wx, o.y-wy); if (d < bm){ bm = d; mine = o; } }
  for (const o of ships){ if (o.owner === 'player' || o.sinking != null || o.released || o.surrendered) continue; const d = Math.hypot(o.x-wx, o.y-wy); if (d < bd){ bd = d; hit = o; } }
  if (picking && orderSel && orderSel !== p){ if (hit){ setTask(orderSel, { type: 'chase', prey: hit, at: [orderSel.x, orderSel.y] });
    say('The ' + orderSel.name + ' will engage the ' + nm(hit) + '.'); picking = false; renderOrders(); } return; }
  if (mine && (!hit || bm <= bd)){ openOrders(mine); return; }
  if (hit){ fleetTarget = hit; engage(hit); say(squad().length ? 'Signal to the fleet: engage the ' + nm(hit) + '.' : 'You mark the ' + nm(hit) + ' as your chase.');
    if (orderSel) renderOrders(); } });
$('ordClose').addEventListener('click', closeOrders);
$('czIn').addEventListener('click', () => { chartV.z = clamp(chartV.z*1.4, 1, 5); });
$('czOut').addEventListener('click', () => { chartV.z = clamp(chartV.z/1.4, 1, 5); });
$('cClear').addEventListener('click', () => { if (course) setCourse(null); });
$('cClose').addEventListener('click', () => setChart(false));
$('pauseBtn').addEventListener('click', e => { setPaused(!paused); e.currentTarget.blur(); });
$('courseLine').addEventListener('click', () => { if (course){ autoHelm = !autoHelm; p.path = null; say(autoHelm ? 'The helmsman steers for ' + course.name + '.' : 'You have the helm.'); } });
$('shipNameBtn').addEventListener('click', () => { const sq = squad(), s = fleetSel[0] === 'S' ? sq[+fleetSel.slice(1)] : p; if (!s) return; s.name = cleanName($('shipNameIn').value, s.name); if (s !== p) fitConsort(s); renderFleet('shipNameBtn'); });
$('dock').addEventListener('click', () => act('dock'));
$('boardBtn').addEventListener('click', () => act('board'));
function cycleForm(){ const k = Object.keys(FORMS); setForm(k[(k.indexOf(formation) + 1) % k.length]); if (squad().length) say('Formation: ' + FORMS[formation].toLowerCase() + '.'); }
function cycleOrders(){ const k = Object.keys(ORDERS); setOrders(k[(k.indexOf(orders) + 1) % k.length]);
  if (squad().length) say(orders === 'line' ? 'Signal: form line of battle. Keep station and fire as they bear.' : orders === 'engage' ? 'Signal: engage the enemy at will.' : 'Signal: hold fire and stand clear.'); }
$('formBtn').addEventListener('click', e => { cycleForm(); e.currentTarget.blur(); });
$('orderBtn').addEventListener('click', e => { cycleOrders(); e.currentTarget.blur(); });
$('pz_crew').addEventListener('click', () => { const s = prizeShip, n = Math.min(Math.floor(s.crew*.5), p.t.crew - p.crew); if (n > 0){ p.crew += n; s.crew -= n; s.pressed = true; } renderPrize(); $('pz_loot').focus(); });
$('pz_mate').addEventListener('click', () => { const s = prizeShip; if (s.officer && gold >= 150 && spares.length < 6){ gold -= 150; spares.push(s.officer); s.officer = null; } renderPrize(); $('pz_loot').focus(); });
['loot', 'keep', 'send', 'fleet'].forEach(k => $('pz_' + k).addEventListener('click', () => settlePrize(k)));
$('startBtn').addEventListener('click', () => { initAudio(); newGame(); $('title').hidden = true; state = 'play'; document.activeElement && document.activeElement.blur();
  say(coarse ? 'Tap More sail to get under way.' : 'Press W to make sail.'); });
$('leaveBtn').addEventListener('click', closePort);
$('againBtn').addEventListener('click', () => { $('over').hidden = true; newGame(); state = 'play'; document.activeElement && document.activeElement.blur(); });

/* ---------- Sound ---------- */
let ac = null, noise = null, muted = false;
function initAudio(){ if (ac) return; try { const A = window.AudioContext || window.webkitAudioContext; ac = new A();
  noise = ac.createBuffer(1, ac.sampleRate*.6, ac.sampleRate); const ch = noise.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (rnd()*2-1)*Math.pow(1 - i/ch.length, 3); } catch (_){ ac = null; } }
function boom(v, freq){ if (!ac || muted || v < .02) return; try {
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noise; s.playbackRate.value = rand(.7, 1.1); f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = v*2.2;
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); } catch (_){ } }
function chime(){ if (!ac || muted) return; try { [660, 880, 1320].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i*.15;
  o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.13, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .7);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .75); }); } catch (_){ } }
function toggleMute(){ muted = !muted; $('muteBtn').textContent = muted ? 'Sound off' : 'Sound on'; }

/* ---------- Port ---------- */
const UPG = {
  guns:  { name:'Guns',         act:'Mount another pair',  max:6, cost:l => 300 + 250*l, val:s => s.guns + ' a side' },
  hull:  { name:'Hull timbers', act:'Sister the timbers',  max:5, cost:l => 250 + 200*l, val:s => 'Strength ' + Math.round(s.maxHull) },
  sail:  { name:'Sailcloth',    act:'Bend on finer canvas', max:5, cost:l => 250 + 200*l, val:s => '+' + 7*upOf(s).sail + '% speed' },
  drill: { name:'Gun drill',    act:'Drill the gun crews', max:5, cost:l => 200 + 175*l, val:s => 'Reload ' + reloadOf(s).toFixed(1) + ' s' }
};
const upOf = s => s === p ? up : s.up;
const reloadOf = s => s === p ? p.reload*crewSlow() : (5.8 - .5*s.cap.gun)*Math.pow(.9, s.up.drill);
const tradeIn = () => Math.round(CLASSES[p.cls].value*.5);
let portTab = 'yard', fleetSel = 'F';
