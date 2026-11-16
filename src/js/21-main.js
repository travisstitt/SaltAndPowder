let frozen = false; /* tests stop the clock to compare pictures */
function frame(t){ const dt = Math.min(.05, (t - last)/1000 || 0)*PACES[paceIdx][0]; last = t; const held2 = chartOpen || menuOpen || paused || frozen; try { if (!held2){ const n = Math.ceil(PACES[paceIdx][0]); for (let k = 0; k < n; k++) update(dt/n); } render(held2 ? 0 : dt); hud(); if (state === 'port' && !menuOpen) paintTown(); } catch (e){ cx.setTransform(1, 0, 0, 1, 0, 0); if (lastErr !== e.message){ lastErr = e.message; console.error(e); } } /* one bad frame must never stop the game */ requestAnimationFrame(frame); }
function start(data){
  data = data || {};
  const sz = +recall('zoom'); if (sz) zoomMul = clamp(sz, .3, 2);
  setDiff(recall('diff')); resize(); newGame(data.p ? data : null); setDiff(diff); refreshTitle();
  const sp = recall('pace'), sa = recall('aim'); setPace(sp == null ? 1 : +sp); setAssist(sa == null ? true : sa === '1');
  if (data.p){ $('title').hidden = true; state = 'play'; }
  requestAnimationFrame(frame);
}
/* test hook: open the page with #test to expose the game's internals to the test suite in tests/ */
if (location.hash === '#test') window.__sp = { update, ashore, openPort, closePort, accept, complete, grapple, capture, settlePrize, politics, snapshot, loadGame, newGame, openFleet, openManifest, setCourse, setPaused, setChart,
  get cal(){ return calIdx(); }, setCal(i){ cal0 = i - Math.floor(clock/MONTH); }, calendarTick, monthTick, get date(){ return dateStr(); }, get marque(){ return marque; }, setMarque(k){ marque = k; }, get courtDue(){ return courtDue; }, setWars(a){ wars = new Set(a); }, setCalm(v){ calm = !!v; }, toggleShot, price, tap: act, setOrders, startHurricane, get hurr(){ return hurr; }, get weather(){ return weather; }, strike, sendIn, lawful, get classes(){ return CLASSES; }, get goodsKeys(){ return GK; },
  navyStop, shoreAction, spawnRival, rivalTick, RIVALS, get rivals(){ return rivals; }, get morale(){ return morale; }, set morale(v){ morale = v; }, get officers(){ return officers; }, get foul(){ return foul; }, set foul(v){ foul = v; }, setFouling(v){ fouling = !!v; store('foul', fouling ? '1' : '0'); const b = $('foulBtn'); if (b){ b.setAttribute('aria-pressed', fouling); b.textContent = 'Hull fouling: ' + (fouling ? 'on' : 'off'); } }, pMul, cheer, darkness,
  ask, svc, customs, search, searchable, retire, convoy, spawnMerchant, attack, get navy(){ return navy; }, get captives(){ return captives; }, get stats(){ return stats; }, get menuOpen(){ return menuOpen; }, closeMenu, setCustomsT(v){ customsT = v; },
  iced, winter, onChannel, spawnFisher, get trafWant(){ return trafWant; },
  get chartZ(){ return chartV.z; }, get flagsEnd(){ return flagsEnd; }, chartRect,
  freeze(v){ frozen = !!v; }, roll(){ return rnd(); }, seed: seedRnd, setRnd(f){ rnd = f || Math.random; }, setTime(v){ time = v; }, get tick(){ return tick; }, polar, restoreMission, repute, offend, NAVY, EVENTS, GOODS, rankFor, wageBill, MINI,
  X, Y, streamAt, setStart, get startName(){ return startName; },
  openPaper, get gazette(){ return gazette; }, makeOffers, flagRect, drawEnsign,
  addFleet, squad, spawnRover, spawnHunter, setPolicy, cyclePolicy, get policy(){ return prizePolicy; }, get crates(){ return crates; }, openFate, openOrders, closeOrders, renderFate, impact, puff, get smokes(){ return smokes; }, get orderSel(){ return orderSel; }, get picking(){ return picking; }, setTask, claimPrize, taskWord, payWages, wageBill, fire, damage, struck, sink, makeOffers, spawnHunter, isLand, isNear, findPath, hostile, repute, readSlot, writeSlot, encode, decode, setDiff, makeShip, gameOver,
  mk: (c, o, r, x, y, h) => { const q = makeShip(c, o, r, x, y, h); ships.push(q); return q; },
  get state(){ return state; }, set state(v){ state = v; }, get p(){ return p; }, get ships(){ return ships; }, get balls(){ return balls; }, get ports(){ return ports; }, get gold(){ return gold; }, set gold(v){ gold = v; },
  get plunder(){ return plunder; }, get hold(){ return hold; }, get standing(){ return standing; }, get mission(){ return mission; }, get offers(){ return offers; }, get wars(){ return [...wars]; }, get weather(){ return weather; },
  get clock(){ return clock; }, set clock(v){ clock = v; }, get fleet(){ return fleet; }, get spares(){ return spares; }, get laidUp(){ return laidUp; }, get tracked(){ return tracked; }, get fleetTarget(){ return fleetTarget; },
  get course(){ return course; }, get autoHelm(){ return autoHelm; }, get melee(){ return melee; }, get diff(){ return diff; }, get home(){ return homeName; }, get up(){ return up; }, get wind(){ return wind; },
  get paused(){ return paused; }, get townSpots(){ return townArt ? townArt.spots : []; }, get zoom(){ return zoomMul; }, get scale(){ return scale; }, get portTab(){ return portTab; }, get chartOpen(){ return chartOpen; }, get menuOpen(){ return menuOpen; }, get curPort(){ return curPort; }, get tavern(){ return tavern; }, W, H, DEG, CLASSES };
const hot = window.claude && window.claude.hot;
try { hot && hot.snapshot && hot.snapshot(() => state === 'title' || !p.alive ? {} : snapshot()); } catch (_){ }
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();

