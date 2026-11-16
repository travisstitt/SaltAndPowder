const NAT = {
  en: { adj:'British', land:'Great Britain', c1:'#d23a30', c2:'#f2f2f2', tag:'#ff8377' },
  es: { adj:'Spanish', land:'Spain', c1:'#e8b92e', c2:'#b3261e', tag:'#ffd24a' },
  fr: { adj:'French', land:'France', c1:'#3f6fd8', c2:'#f2f2f2', tag:'#8fb2ff' },
  nl: { adj:'Dutch', land:'the Netherlands', c1:'#ee8420', c2:'#f2f2f2', tag:'#ffa64d' },
  dk: { adj:'Danish', land:'Denmark', c1:'#8e5bd0', c2:'#f2f2f2', tag:'#c3a2f5' } };
const NKEYS = ['en', 'es', 'fr', 'nl', 'dk'];
const Land = k => NAT[k].land.replace(/^t/, 'T');
/* towns of the 1750s: name, a point just off the harbour, founding nation, and what makes the place itself.
   sz town size, roof style, forts, ch church (2 = cathedral), walls, yard = shipyard, dock = royal dockyard (ships of the line), free = free port, mk = goods made here (cheap), dm = goods wanted (dear) */
const TOWNS = [
  ['Kingston', -76.84, 17.88, 'en', { sz:3, roof:'slate', forts:['star', 'battery'], ch:1, yard:1, mk:['sugar', 'rum', 'cloth'], dm:['indigo', 'cocoa', 'tobacco', 'flour', 'fish'] }],
  ['Havana', -82.36, 23.2, 'es', { sz:3, roof:'tile', forts:['castle', 'tower'], ch:2, walls:1, yard:1, dock:1, mk:['tobacco', 'sugar'], dm:['cloth', 'coffee'] }],
  ['Santiago de Cuba', -75.87, 19.92, 'es', { sz:2, roof:'tile', forts:['castle'], ch:1, mk:['tobacco'], dm:['cloth'] }],
  ['Cap-Français', -72.2, 19.85, 'fr', { sz:3, roof:'slate', forts:['star', 'battery'], ch:2, yard:1, mk:['sugar', 'coffee', 'indigo'], dm:['cloth', 'cocoa', 'flour', 'fish'] }],
  ['Port-au-Prince', -72.45, 18.6, 'fr', { sz:2, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'indigo', 'molasses'], dm:['cloth', 'rum', 'flour', 'fish'] }],
  ['Santo Domingo', -69.89, 18.42, 'es', { sz:3, roof:'tile', forts:['tower', 'battery'], ch:2, walls:1, mk:['sugar'], dm:['cloth', 'rum'] }],
  ['San Juan', -66.12, 18.52, 'es', { sz:3, roof:'tile', forts:['castle'], ch:1, walls:1, mk:['sugar', 'coffee'], dm:['cloth'] }],
  ['Nassau', -77.35, 25.3, 'en', { sz:1, roof:'slate', forts:['star'], ch:1, mk:[], dm:['rum', 'cloth', 'sugar', 'molasses'] }],
  ['Veracruz', -96.08, 19.22, 'es', { sz:3, roof:'tile', forts:['castle', 'battery'], ch:2, walls:1, mk:['cocoa', 'indigo'], dm:['cloth', 'rum', 'tobacco'] }],
  ['Campeche', -90.6, 19.87, 'es', { sz:2, roof:'tile', forts:['battery', 'battery'], ch:1, walls:1, mk:['indigo'], dm:['cloth'] }],
  ['Trujillo', -85.95, 15.98, 'es', { sz:1, roof:'tile', forts:['battery'], ch:1, mk:['cocoa', 'indigo'], dm:['cloth', 'rum'] }],
  ['Portobelo', -79.65, 9.62, 'es', { sz:1, roof:'tile', forts:['battery', 'battery'], ch:1, mk:[], dm:['cloth', 'sugar', 'rum'] }],
  ['Cartagena', -75.6, 10.42, 'es', { sz:3, roof:'tile', forts:['castle', 'star'], ch:2, walls:1, mk:['cocoa'], dm:['cloth', 'rum', 'coffee'] }],
  ['Santa Marta', -74.24, 11.27, 'es', { sz:1, roof:'tile', forts:['tower'], ch:1, mk:['tobacco'], dm:['cloth'] }],
  ['Maracaibo', -71.6, 11.05, 'es', { sz:2, roof:'tile', forts:['tower'], ch:1, mk:['cocoa', 'tobacco'], dm:['cloth', 'rum'] }],
  ['Willemstad', -68.95, 12.07, 'nl', { sz:2, roof:'dutch', forts:['star'], ch:1, mk:['cloth'], dm:['cocoa', 'tobacco', 'indigo'] }],
  ['La Guaira', -66.93, 10.66, 'es', { sz:2, roof:'tile', forts:['battery', 'battery'], ch:1, mk:['cocoa'], dm:['cloth'] }],
  ['Cumaná', -64.2, 10.5, 'es', { sz:1, roof:'tile', forts:['castle'], ch:1, mk:['cocoa', 'tobacco'], dm:['cloth', 'rum'] }],
  ['Bridgetown', -59.68, 13.08, 'en', { sz:2, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'rum', 'molasses'], dm:['tobacco', 'cocoa', 'coffee', 'flour', 'fish'] }],
  ['Fort-Royal', -61.1, 14.58, 'fr', { sz:2, roof:'slate', forts:['star'], ch:1, mk:['sugar', 'coffee', 'molasses'], dm:['tobacco', 'cloth', 'flour', 'fish'] }],
  ['Basseterre', -62.74, 17.25, 'en', { la:-1.2, sz:1, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'molasses'], dm:['cocoa', 'tobacco', 'flour', 'fish'] }],
  ['English Harbour', -61.78, 16.92, 'en', { la:1.57, sz:2, roof:'slate', forts:['battery', 'battery'], ch:0, yard:1, dock:1, mk:[], dm:['rum', 'tobacco', 'coffee'] }],
  ['St Eustatius', -63.22, 17.58, 'nl', { sz:1, roof:'dutch', forts:['battery'], ch:1, free:1, mk:['cloth'], dm:['sugar', 'tobacco', 'coffee', 'molasses'] }],
  ['Basse-Terre', -61.8, 16.0, 'fr', { la:2.6, sz:2, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'coffee'], dm:['cloth', 'tobacco', 'flour', 'fish'] }],
  ['Saint-Pierre', -61.26, 14.8, 'fr', { la:3.3, sz:2, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'rum', 'molasses'], dm:['cloth', 'cocoa', 'flour', 'fish'] }],
  ['Louisbourg', -59.95, 45.88, 'fr', { sz:2, roof:'slate', forts:['castle','battery'], ch:1, walls:1, mk:['fish'], dm:['flour', 'rum', 'molasses'] }],
  ['Halifax', -63.52, 44.6, 'en', { sz:2, roof:'slate', forts:['star','battery'], ch:1, yard:1, dock:1, mk:['fish', 'naval'], dm:['rum', 'molasses', 'sugar'] }],
  ['Canso', -60.95, 45.3, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum', 'flour'] }],
  ['Annapolis Royal', -65.8, 44.72, 'en', { sz:1, roof:'slate', forts:['star'], ch:1, mk:['naval'], dm:['rum', 'cloth'] }],
  ['Falmouth', -70.18, 43.62, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['naval', 'fish'], dm:['rum', 'molasses'] }],
  ['Portsmouth', -70.68, 43.03, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, yard:1, mk:['naval'], dm:['rum', 'sugar'] }],
  ['Salem', -70.7, 42.66, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['fish', 'rum'], dm:['molasses', 'sugar'] }],
  ['Boston', -70.93, 42.33, 'en', { sz:3, roof:'slate', forts:['castle','battery'], ch:2, yard:1, mk:['rum', 'fish', 'naval'], dm:['molasses', 'sugar', 'coffee'] }],
  ['Plymouth', -70.6, 41.97, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['molasses'] }],
  ['Nantucket', -70.08, 41.32, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['flour', 'rum'] }],
  ['Newport', -71.33, 41.45, 'en', { sz:2, roof:'slate', forts:['battery'], ch:1, yard:1, mk:['rum'], dm:['molasses', 'sugar'] }],
  ['New London', -72.08, 41.28, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['flour'], dm:['rum', 'molasses'] }],
  ['New York', -73.95, 40.5, 'en', { sz:3, roof:'slate', forts:['star','battery'], ch:2, yard:1, mk:['flour', 'naval'], dm:['sugar', 'rum', 'molasses'] }],
  ['Philadelphia', -75.42, 39.36, 'en', { sz:3, roof:'slate', forts:['battery'], ch:2, yard:1, mk:['flour', 'cloth'], dm:['sugar', 'molasses', 'coffee'] }],
  ['Lewes', -75.08, 38.78, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['flour'], dm:['rum'] }],
  ['Yorktown', -76.45, 37.24, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['rum', 'cloth'] }],
  ['Annapolis', -76.36, 38.93, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['tobacco', 'flour'], dm:['rum', 'sugar'] }],
  ['Chincoteague', -75.3, 37.9, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['rum', 'cloth'] }],
  ['Norfolk', -76.3, 36.93, 'en', { sz:2, roof:'slate', forts:['battery'], ch:1, yard:1, mk:['tobacco', 'naval'], dm:['rum', 'sugar', 'molasses'] }],
  ['Ocracoke', -75.95, 35.08, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['naval'], dm:['rum'] }],
  ['Wilmington', -77.95, 33.88, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['naval', 'rice'], dm:['rum', 'cloth'] }],
  ['Georgetown', -79.18, 33.28, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['rice', 'indigo'], dm:['rum'] }],
  ['Charleston', -79.85, 32.72, 'en', { sz:3, roof:'slate', forts:['star','battery'], ch:2, yard:1, mk:['rice', 'indigo'], dm:['rum', 'sugar', 'flour'] }],
  ['Beaufort', -80.6, 32.28, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['rice'], dm:['rum'] }],
  ['Savannah', -80.92, 32.0, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['rice'], dm:['rum', 'cloth'] }],
  ['Frederica', -81.35, 31.2, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['naval'], dm:['rum', 'flour'] }],
  ['St Augustine', -81.25, 29.9, 'es', { sz:2, roof:'tile', forts:['castle'], ch:1, walls:1, mk:[], dm:['flour', 'cloth', 'rum'] }],
  ["St George's", -64.66, 32.4, 'en', { sz:1, roof:'slate', forts:['battery','battery'], ch:1, yard:1, mk:['fish'], dm:['flour', 'rum'] }],
  ['Pensacola', -87.22, 30.3, 'es', { sz:1, roof:'tile', forts:['battery'], ch:1, mk:['naval'], dm:['flour', 'cloth'] }],
  ['Mobile', -88.02, 30.2, 'fr', { sz:1, roof:'slate', forts:['star'], ch:1, mk:['naval', 'indigo'], dm:['flour', 'cloth'] }],
  ['New Orleans', -89.3, 29.0, 'fr', { sz:2, roof:'slate', forts:['battery'], ch:1, mk:['indigo', 'tobacco'], dm:['flour', 'cloth', 'rum'] }],
  ['Tampico', -97.75, 22.25, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['cloth'] }],
  ['Carmen', -91.8, 18.7, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['indigo'], dm:['rum', 'cloth'] }],
  ['Sisal', -90.03, 21.2, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['indigo'], dm:['cloth', 'flour'] }],
  ['Cozumel', -86.98, 20.5, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum'] }],
  ['Belize River', -88.15, 17.5, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['indigo'], dm:['rum', 'flour', 'cloth'] }],
  ['Roatán', -86.5, 16.28, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum', 'flour'] }],
  ['Omoa', -87.95, 15.8, 'es', { sz:1, roof:'tile', forts:['castle'], ch:1, mk:['indigo', 'cocoa'], dm:['cloth', 'flour'] }],
  ['Black River', -84.9, 15.95, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['indigo'], dm:['rum', 'cloth'] }],
  ['Bluefields', -83.7, 12.0, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['rum', 'cloth'] }],
  ['San Juan del Norte', -83.68, 10.95, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['cloth'] }],
  ['Chagres', -80.0, 9.35, 'es', { sz:1, roof:'thatch', land:1, ch:0, forts:['castle'], mk:[], dm:['cloth', 'flour'] }],
  ['Riohacha', -72.9, 11.58, 'es', { sz:1, roof:'tile', forts:['battery'], ch:1, mk:['fish'], dm:['cloth', 'flour'] }],
  ['Coro', -69.65, 11.5, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa', 'tobacco'], dm:['cloth'] }],
  ['Puerto Cabello', -68.0, 10.52, 'es', { sz:1, roof:'tile', forts:['castle'], ch:1, mk:['cocoa', 'coffee'], dm:['cloth', 'flour'] }],
  ['Barcelona', -64.7, 10.18, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['cloth'] }],
  ['Pampatar', -63.78, 11.0, 'es', { sz:1, roof:'thatch', land:1, ch:0, forts:['battery'], mk:['fish'], dm:['cloth', 'flour'] }],
  ['Port of Spain', -61.55, 10.65, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['cloth', 'flour'] }],
  ['Scarborough', -60.72, 11.16, 'fr', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar'], dm:['flour'] }],
  ['Saint-Georges', -61.78, 12.05, 'fr', { sz:1, roof:'slate', forts:['star'], ch:1, mk:['sugar', 'coffee', 'cocoa'], dm:['flour', 'cloth'] }],
  ['Kingstown', -61.25, 13.13, 'fr', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['flour', 'cloth'] }],
  ['Castries', -61.03, 14.03, 'fr', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'coffee'], dm:['flour', 'cloth'] }],
  ['Roseau', -61.42, 15.3, 'fr', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['coffee'], dm:['flour', 'fish'] }],
  ['Montserrat', -62.25, 16.7, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar'], dm:['fish', 'flour'] }],
  ['Philipsburg', -63.05, 18.0, 'nl', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['flour'] }],
  ['Road Town', -64.62, 18.4, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar'], dm:['flour', 'fish'] }],
  ['Charlotte Amalie', -64.95, 18.3, 'dk', { sz:2, roof:'dutch', forts:['castle'], ch:1, free:1, mk:['cloth', 'sugar'], dm:['flour', 'fish', 'tobacco'] }],
  ['Christiansted', -64.7, 17.78, 'dk', { sz:1, roof:'dutch', forts:['battery'], ch:1, mk:['sugar', 'rum'], dm:['flour', 'fish'] }],
  ['Ponce', -66.62, 17.95, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['coffee'], dm:['cloth', 'flour'] }],
  ['Aguada', -67.22, 18.4, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['cloth'] }],
  ['Monte Cristi', -71.65, 19.92, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, free:1, mk:['sugar', 'molasses'], dm:['flour', 'fish', 'cloth'] }],
  ['Puerto Plata', -70.7, 19.83, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['cloth'] }],
  ['Samaná', -69.3, 19.18, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['cocoa'], dm:['cloth', 'rum'] }],
  ['Saint-Marc', -72.75, 19.1, 'fr', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['indigo', 'coffee'], dm:['flour', 'cloth'] }],
  ['Les Cayes', -73.75, 18.15, 'fr', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'indigo'], dm:['flour', 'fish'] }],
  ['Jacmel', -72.53, 18.2, 'fr', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['coffee'], dm:['flour'] }],
  ['Môle Saint-Nicolas', -73.42, 19.82, 'fr', { sz:1, roof:'thatch', land:1, ch:0, forts:['battery'], mk:[], dm:['flour', 'rum'] }],
  ['Montego Bay', -77.93, 18.5, 'en', { sz:1, roof:'slate', forts:['battery'], ch:1, mk:['sugar', 'rum'], dm:['flour', 'fish'] }],
  ['Port Antonio', -76.45, 18.2, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar'], dm:['fish', 'flour'] }],
  ['Savanna-la-Mar', -78.13, 18.2, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar', 'molasses'], dm:['flour'] }],
  ['Matanzas', -81.57, 23.08, 'es', { sz:1, roof:'tile', forts:['castle'], ch:1, mk:['sugar', 'tobacco'], dm:['cloth', 'flour'] }],
  ['Trinidad', -80.0, 21.7, 'es', { sz:1, roof:'tile', forts:['tower'], ch:1, mk:['sugar', 'tobacco'], dm:['cloth'] }],
  ['Baracoa', -74.5, 20.38, 'es', { sz:1, roof:'thatch', land:1, ch:0, forts:['tower'], mk:['cocoa', 'coffee'], dm:['cloth'] }],
  ['Manzanillo', -77.15, 20.35, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['tobacco'], dm:['cloth', 'rum'] }],
  ['Batabanó', -82.3, 22.68, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['cloth'] }],
  ['Nuevitas', -77.05, 21.85, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['sugar'], dm:['cloth'] }],
  ['Grand Cayman', -81.38, 19.28, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum', 'flour'] }],
  ['Harbour Island', -76.63, 25.52, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum', 'flour'] }],
  ['Exuma', -75.8, 23.5, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum', 'flour'] }],
  ['Turks Islands', -71.13, 21.47, 'en', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['flour', 'rum'] }],
  ['Cayo Hueso', -81.8, 24.55, 'es', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['rum'] }],
  ['Aruba', -70.03, 12.52, 'nl', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['flour', 'cloth'] }],
  ['Bonaire', -68.28, 12.15, 'nl', { sz:1, roof:'thatch', land:1, forts:[], ch:0, mk:['fish'], dm:['flour'] }]];

const lands = [];
function chaikin(P, it){ for (; it--;){ const Q = []; for (let i = 0; i < P.length; i++){ const a = P[i], b = P[(i+1) % P.length];
  Q.push([a[0]*.75 + b[0]*.25, a[1]*.75 + b[1]*.25], [a[0]*.25 + b[0]*.75, a[1]*.25 + b[1]*.75]); } P = Q; } return P; }
function addLand(pts){
  pts = chaikin(pts, 1);
  const path = new Path2D(), chunks = []; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  pts.forEach((q, i) => { i ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1]); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
  path.closePath();
  for (let i = 0; i < pts.length; i += 20){ const c = { path: new Path2D(), x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; // short runs of coast, so only what is on screen is stroked for surf
    for (let j = i; j <= i + 20 && j <= pts.length; j++){ const q = pts[j % pts.length]; j === i ? c.path.moveTo(q[0], q[1]) : c.path.lineTo(q[0], q[1]);
      c.x0 = Math.min(c.x0, q[0]); c.y0 = Math.min(c.y0, q[1]); c.x1 = Math.max(c.x1, q[0]); c.y1 = Math.max(c.y1, q[1]); }
    chunks.push(c); }
  lands.push({ path, chunks, x0, y0, x1, y1 });
}
COAST.forEach(a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([X(a[i]/200), Y(a[i+1]/200)]); addLand(o); });

/* land masks at 8 units per cell: exact land, land plus a 60-unit margin, and land more than 38 units from the shore */
const RES = 16, MW = Math.ceil(W/RES), MH = Math.ceil(H/RES);
function buildMask(draw){
  const c = document.createElement('canvas'); c.width = MW; c.height = MH; const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000'; g.fillRect(0, 0, MW, MH); g.scale(1/RES, 1/RES); g.lineJoin = 'round'; draw(g);
  const d = g.getImageData(0, 0, MW, MH).data, m = new Uint8Array(MW*MH); for (let i = 0; i < m.length; i++) m[i] = d[i*4] > 127 ? 1 : 0; return m;
}
const fillAll = g => { g.fillStyle = '#fff'; lands.forEach(l => g.fill(l.path)); };
const landM = buildMask(fillAll);
const nearM = buildMask(g => { fillAll(g); g.strokeStyle = '#fff'; g.lineWidth = 120; lands.forEach(l => g.stroke(l.path)); });
const deepM = buildMask(g => { fillAll(g); g.strokeStyle = '#000'; g.lineWidth = 76; lands.forEach(l => g.stroke(l.path)); });
const at = (m, x, y) => x < 0 || y < 0 || x >= W || y >= H ? 1 : m[(y/RES|0)*MW + (x/RES|0)];
const isLand = (x, y) => at(landM, x, y), isNear = (x, y) => at(nearM, x, y);
/* at this scale the mouths of the great bays close up, so pilot channels are kept clear through them */
const CHANNELS = [[[-75.75, 36.95], [-76.0, 36.97], [-76.12, 37.05], [-76.14, 37.6], [-76.22, 38.3], [-76.36, 38.85], [-76.4, 39.15]], [[-76.05, 36.97], [-76.3, 36.96]], [[-76.14, 37.2], [-76.42, 37.24]], [[-74.8, 38.75], [-75.03, 38.87], [-75.2, 39.1], [-75.4, 39.33]]];
const onChannel = (x, y, r) => { for (const ch of CHANNELS) for (let i = 0; i < ch.length - 1; i++){ const ax = X(ch[i][0]), ay = Y(ch[i][1]), bx = X(ch[i+1][0]), by = Y(ch[i+1][1]), dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax)*dx + (y - ay)*dy)/(dx*dx + dy*dy))); if (Math.hypot(x - ax - dx*t, y - ay - dy*t) < r) return true; } return false; };
{ let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0; CHANNELS.forEach(ch => ch.forEach(v => { x0 = Math.min(x0, X(v[0])); x1 = Math.max(x1, X(v[0])); y0 = Math.min(y0, Y(v[1])); y1 = Math.max(y1, Y(v[1])); }));
  for (let j = Math.floor((y0 - 100)/RES); j <= (y1 + 100)/RES; j++) for (let i = Math.floor((x0 - 100)/RES); i <= (x1 + 100)/RES; i++){ const k = j*MW + i; if (nearM[k] && !landM[k] && onChannel((i + .5)*RES, (j + .5)*RES, 80)) nearM[k] = 0; } }
const shore = (x, y) => at(landM, x, y) || at(landM, x+26, y) || at(landM, x-26, y) || at(landM, x, y+26) || at(landM, x, y-26);

/* ports: snap each town to the nearest coast and face it out to sea */
const ports = [];
TOWNS.forEach(t => {
  const px = X(t[1]), py = Y(t[2]), ix = px/RES|0, iy = py/RES|0; let best = 1e9, bx = ix, by = iy;
  for (let dy = -32; dy <= 32; dy++) for (let dx = -32; dx <= 32; dx++){ const x = ix+dx, y = iy+dy; if (x < 1 || y < 1 || x >= MW-1 || y >= MH-1) continue;
    if (!landM[y*MW+x]) continue; if (landM[y*MW+x+1] && landM[y*MW+x-1] && landM[(y+1)*MW+x] && landM[(y-1)*MW+x]) continue;
    const d = dx*dx + dy*dy; if (d < best){ best = d; bx = x; by = y; } }
  let lx = 0, ly = 0, ln = 0, wx = 0, wy = 0, wn = 0;
  for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++){ if (dx*dx + dy*dy > 81) continue; const x = bx+dx, y = by+dy; if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
    if (landM[y*MW+x]){ lx += dx; ly += dy; ln++; } else { wx += dx; wy += dy; wn++; } }
  const ang = Math.atan2(wy/Math.max(1, wn) - ly/Math.max(1, ln), wx/Math.max(1, wn) - lx/Math.max(1, ln));
  const x = (bx+.5)*RES, y = (by+.5)*RES; let ox = x + Math.cos(ang)*110, oy = y + Math.sin(ang)*110;
  for (const o of [0, .35, -.35, .7, -.7, 1.1, -1.1]){ const c = Math.cos(ang+o), n = Math.sin(ang+o); let d = 80, clear = true;
    for (; d <= 340; d += 10){ if (isLand(x + c*d, y + n*d)){ clear = false; break; } if (!isNear(x + c*d, y + n*d)) break; }
    if (clear){ d = Math.min(d + 20, 340); ox = x + c*d; oy = y + n*d; break; } }
  ports.push({ name: t[0], nk: t[3], nation: NAT[t[3]], home: t[3], ang, out: Math.atan2(oy-y, ox-x), x, y, ox, oy, spec: t[4] });
});

/* navigation grid for the other ships */
const CELL = 160, GW = Math.ceil(W/CELL), GH = Math.ceil(H/CELL), water = new Uint8Array(GW*GH), prev = new Int32Array(GW*GH), queue = new Int32Array(GW*GH);
for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) water[j*GW+i] = isNear((i+.5)*CELL, (j+.5)*CELL) && !(onChannel((i+.5)*CELL, (j+.5)*CELL, 115) && !isLand((i+.5)*CELL, (j+.5)*CELL)) ? 0 : 1;
const DX = [1,-1,0,0,1,1,-1,-1], DY = [0,0,1,-1,1,-1,1,-1];
function cellNear(x, y){
  const ci = clamp(x/CELL|0, 0, GW-1), cj = clamp(y/CELL|0, 0, GH-1); if (water[cj*GW+ci]) return cj*GW+ci;
  for (let r = 1; r < 9; r++){ let best = -1, bd = 1e18;
    for (let j = cj-r; j <= cj+r; j++) for (let i = ci-r; i <= ci+r; i++){ if (i < 0 || j < 0 || i >= GW || j >= GH || !water[j*GW+i]) continue;
      const d = Math.pow((i+.5)*CELL - x, 2) + Math.pow((j+.5)*CELL - y, 2); if (d < bd){ bd = d; best = j*GW+i; } }
    if (best >= 0) return best; }
  return -1;
}
function findPath(x0, y0, x1, y1){
  const a = cellNear(x0, y0), b = cellNear(x1, y1); if (a < 0 || b < 0 || a === b) return [[x1, y1]];
  prev.fill(-1); let qh = 0, qt = 0; queue[qt++] = b; prev[b] = b;
  while (qh < qt){ const c = queue[qh++]; if (c === a) break; const ci = c % GW, cj = (c/GW)|0;
    for (let k = 0; k < 8; k++){ const ni = ci + DX[k], nj = cj + DY[k]; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const n = nj*GW + ni; if (!water[n] || prev[n] >= 0) continue; if (k > 3 && !(water[cj*GW+ni] && water[nj*GW+ci])) continue;
      prev[n] = c; queue[qt++] = n; } }
  if (prev[a] < 0) return [[x1, y1]];
  const out = []; let c = a; while (c !== b){ c = prev[c]; out.push([(c % GW + .5)*CELL, ((c/GW|0) + .5)*CELL]); } out.push([x1, y1]); return out;
}
function los(x0, y0, x1, y1){ const d = Math.hypot(x1-x0, y1-y0); if (d > 2400) return false; const n = Math.ceil(d/40);
  for (let i = 2; i < n; i++) if (isNear(x0 + (x1-x0)*i/n, y0 + (y1-y0)*i/n)) return false; return true; }
function navTo(s, tx, ty, dt){
  s.losT -= dt; s.repT -= dt;
  if (s.losT <= 0){ s.losT = .4 + rnd()*.4; s.direct = los(s.x, s.y, tx, ty);
    if (!s.direct){ const e = s.path && s.path[s.path.length-1];
      if (!e || Math.hypot(e[0]-tx, e[1]-ty) > 260 || s.repT <= 0){ s.path = findPath(s.x, s.y, tx, ty); s.pi = 0; s.repT = 6; }
      for (let k = 0; k < 3 && s.pi+1 < s.path.length && los(s.x, s.y, s.path[s.pi+1][0], s.path[s.pi+1][1]); k++) s.pi++; } }
  if (s.direct || !s.path) return Math.atan2(ty-s.y, tx-s.x);
  let w = s.path[s.pi]; if (Math.hypot(w[0]-s.x, w[1]-s.y) < 120 && s.pi < s.path.length-1) w = s.path[++s.pi];
  return Math.atan2(w[1]-s.y, w[0]-s.x);
}

const wind = { dir: R()*TAU, str: 1, tDir: 0, tStr: 1, timer: 0 };
wind.tDir = wind.dir;
const POLAR = [[0,.78],[45,1],[90,.9],[125,.55],[148,.16],[180,.04]];
function polar(a){ const d = a*180/Math.PI;
  for (let i = 1; i < POLAR.length; i++) if (d <= POLAR[i][0]){ const p = POLAR[i-1], q = POLAR[i];
    return p[1] + (q[1]-p[1])*(d-p[0])/(q[0]-p[0]); }
  return .04; }
function pointOfSail(a){ const d = a*180/Math.PI;
  return d < 25 ? 'Running' : d < 70 ? 'Broad reach' : d < 112 ? 'Beam reach' : d < 142 ? 'Close-hauled' : 'In irons'; }

/* ---------- Ships ---------- */
