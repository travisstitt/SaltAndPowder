(() => {
'use strict';
const TAU = Math.PI * 2, DEG = 900, KX = .891, LON0 = -98, LAT1 = 47.2, W = 31676, H = 35460, RANGE = 300, BALL_V = 540, BOARD_R = 90;
const PACES = [[.5, 'Slow'], [.7, 'Steady'], [1, 'Brisk'], [1.6, 'Swift'], [3, 'Passage'], [8, 'Make passage']];
  /* the last is for open water under the helmsman, and drops back when anything comes in sight */
const DIFFS = {
  easy:   { name:'Easy',   dmg:.6,  spread:.17, reload:6,   hunt:1.4, maxH:2, loot:1.25, rep:.7,  purse:300, note:'Enemies shoot wide and reload slowly, you take less damage, prizes pay a quarter more, and you start with 300 gold.' },
  normal: { name:'Normal', dmg:1,   spread:.12, reload:5,   hunt:1,   maxH:4, loot:1,    rep:1,   purse:0,   note:'The game as designed.' },
  hard:   { name:'Hard',   dmg:1.4, spread:.08, reload:4.2, hunt:.7,  maxH:5, loot:.85,  rep:1.3, purse:0,   note:'Enemies shoot straight and reload fast, you take more damage, hunters come sooner and in greater number, prizes pay less, and nations anger quickly.' } };
let diff = 'normal'; const D = () => DIFFS[diff];
const C = { sea:'#0f3f4c', bone:'#f3ead2', brass:'#c9a24a', blood:'#c9523f', ink:'#08222b', navy:'#4a7fbd' };
const cv = document.getElementById('sea'); let cx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const deckQ = matchMedia('(min-width: 900px) and (min-height: 560px) and (pointer: fine)'); let deck = false; /* the quarterdeck layout, for a wide screen and a mouse */

let rnd = Math.random; /* every roll of the dice in the game comes through here, so a test can seed it */
function seedRnd(n){ if (n == null){ rnd = Math.random; return; } const g = rng(n); rnd = g; }
let voyage = 0, tick = 0, sqC = null, sqT = -1, sqN = -1;
const later = (fn, ms) => { const v = voyage; setTimeout(() => { if (v === voyage) fn(); }, ms); }; /* a delayed word is dropped if the voyage it belonged to is over */
const dirty = () => { sqT = -1; };
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(1718);
const rand = (a, b) => a + rnd() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const angd = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const h1 = n => { const v = Math.sin(n*127.1)*43758.5453; return v - Math.floor(v); };
const hh = (x, y, k) => { const v = Math.sin(x*127.1 + y*311.7 + k*74.7)*43758.5453; return v - Math.floor(v); };
const circle = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); };
const X = lon => (lon - LON0)*DEG*KX, Y = lat => (LAT1 - lat)*DEG;

/* ---------- Geography: Natural Earth 1:10m coastlines (public domain), simplified; units of 1/200 degree ---------- */
