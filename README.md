# Salt and Powder

A top-down pirate sailing game set in the Caribbean of the buccaneering era, in a single HTML file. Work the wind, fire broadsides, take prizes and refit in port.

## Play

Open `index.html` in a browser. There is no build step and no dependencies; the only network request is for two web fonts, and the game falls back to system fonts without them.

## Controls

| Action | Key |
|---|---|
| Steer | `A` / `D` |
| More / less sail | `W` / `S` |
| Fire port / starboard guns | `Q` / `E` |
| Fire both | `Space` |
| Switch round / chain / grape shot | `R` |
| Board a ship within a ship's length | `B` |
| Dock when near a port | `F` |
| Open the full chart | `C` (or click the small chart) |
| Zoom in / out | `=` / `-`, mouse wheel, or pinch |
| Aim assist on / off | `T` |
| Fleet formation: line astern / abreast / wedge | `G` |
| Fleet orders: line of battle / engage at will / hold fire | `H` |
| Fleet management: every ship, at sea or in port | `V` (or click a ship card) |
| Ship's manifest: cargo, crew, purse | `I` (or click the Hold line) |
| Game pace: slow / steady / brisk / swift | `1` / `2` / `3` / `4` |
| Log book: save, load, difficulty | `Esc` or `L` |
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## Screens

- **Top bar and ship cards.** Gold, rank, hold, crew and sail state run across the top with the tools beside them, including a full-screen button. Down the left side is a card for your flagship and one for each consort, showing hull, sails and crew; click a card to manage that ship.
- **Port.** A waterfront of five buildings replaces the long list: Shipyard (repair everything, buy a ship), Market, Tavern (crew and captains), Governor (commissions, standing, news, pardons, home port) and Your fleet.
- **Fleet management** opens at any time. Pick a ship from the list to see her picture and manage her alone: repairs, crew (move hands between ships, or hire in port), her own four refits, her captain, hoisting your flag in her, selling her, or laying her up at your home port. Repairs, refits, hiring and selling need a port.

## How it plays

- **The map** is the Caribbean, from Veracruz to Barbados and from Florida to the Spanish Main. Coastlines are Natural Earth 1:10m data (public domain), simplified. The world is 640 units to the degree, so a ship is small against the land and narrow channels are sailable. Tortuga and New Providence are drawn about twice life size so their towns fit, Tortuga is nudged north to keep its channel open, and Maracaibo sits at the mouth of its lake rather than inside the strait.
- **Ports** are 21 towns of the period in their real locations: Port Royal, Havana, Santiago de Cuba, Tortuga, Petit-Goave, Santo Domingo, San Juan, Nassau, Veracruz, Campeche, Trujillo, Portobelo, Cartagena, Santa Marta, Maracaibo, Willemstad, La Guaira, Cumana, Bridgetown, Fort-Royal and Basseterre. They show as yellow marks on the chart, and a pointer at the screen edge leads to the nearest one.
- **Wind** shifts over time. You cannot sail into it; a broad reach is fastest. The compass shows the wind, your point of sail and your speed.
- **Guns** fire sideways from each beam and reload separately. Round shot breaks hulls; chain shot shreds sails; grape shot, at short range, cuts down crew. With aim assist on, shaded lanes show where each broadside will fall and turn green when it will hit a moving target.
- **Ships strike their colours** when the hull is battered or the sails are shot away: white flag, a white ring around them. Hold fire and sail into the ring to board for the full prize; sinking one loses most of it. White ticks on an enemy's bars mark where she will strike.
- **Nations.** England, Spain, France and the Netherlands each hold ports and send out merchantmen and warships in their own colours. Attack a nation's ships and your standing with her falls while her enemies warm to you. At Hostile her ports close to you and her navy hunts you; a pardon can be bought in any port still open. Pirates fly black and attack everyone.
- **Shipyard.** Every port sells five classes: sloop, schooner, brig, frigate and galleon, each with its own speed, handling, guns and hull. Your old ship is taken in part exchange and your refits carry over.
- **Commissions.** Governors offer paid work: carry dispatches to another port, raid an enemy nation's merchantmen under a letter of marque, hunt a wanted pirate, or board a Spanish treasure galleon.
- **The treasure fleet.** Two unarmed Spanish galleons with heavy cargo sail under escort between Veracruz, Havana, Santo Domingo, Cartagena and Portobelo. The fleet is marked on the chart as a gold diamond.
- **Chase.** A ship you fire on, or one that fires on you, is tracked with a pointer and a distance even when out of sight, until she is more than about 120 leagues away.
- **In port** you ride at anchor with your bow to the open sea. Time does not stop: other ships sail on, and each repair or refit takes time.
- **Crew and boarding.** Every ship has a crew. Yours is hired in port; below half strength your guns reload slowly. Come within a ship's length of an enemy and board her: the fight is decided by numbers, and a ship with too few hands left strikes her colours.
- **Prizes.** The prize screen lists everything in her hold, gold and each trade good, with how much of it you have room for. A captured ship can be plundered and released, taken as your own ship (the old one is sold), or sent to port under a prize crew for the value of her hull.
- **Fleet.** A captured ship can join your fleet; up to four consorts sail with you and fight beside you. Their holds add to yours. In port you can repair them, refit each one separately, sell them to free a place in the fleet, appoint captains, or hoist your flag in one and make her your own ship.
- **Captains.** Each consort needs a captain. Taverns offer captains for hire, rated 1 to 5 for gunnery (faster, truer broadsides) and seamanship (speed). A captured ship's officer sometimes offers to serve. With no spare captain your first mate takes her, at the lowest rating.
- **Crew from prizes.** Up to half of a captured ship's survivors will sign on with you. A ship added to your fleet keeps her own crew, topped up from yours if she is short.
- **Home port.** You start with Port Royal as home and can move it to any open port for a fee. Consorts can be laid up there (eight at most) and recalled.
- **Command.** Choose a formation and standing orders. In line of battle consorts keep station and fire as the enemy bears; engage at will sends each after the nearest enemy; hold fire keeps them back. With aim assist on, each consort's lines of fire are drawn and turn green when a target is in them. Hunters come in squadrons against a fleet.
- **Trade.** Five goods (sugar, tobacco, rum, cocoa, cloth) are cheap where they are made and dear where they are wanted. Each class has a hold; captured merchantmen carry goods as well as gold.
- **Politics.** Wars and peace between the four nations change over time, and ports change hands. Warships attack ships of nations they are at war with, and everyone fights pirates, whether or not you are there.
- **Day, night and weather.** A day lasts five minutes. At night ports and ships show lights and you are harder to spot. Squalls freshen the wind, fog hides you from hunters, and storms tear the canvas of a ship under full sail.
- **Motion.** Ships heel to the wind and out of their turns, roll from the recoil of a broadside, pitch harder in a storm, throw spray at speed, and shiver their canvas in irons. Wrecks leave planks afloat.
- **Towns** are each laid out differently: cathedral cities behind walls at Havana, Cartagena, Santo Domingo and Veracruz, gabled Dutch houses at Willemstad, thatched huts at Tortuga and Nassau.
- **Hunters** come after you as your plunder grows: pirates at first, and the navy of any nation you have made an enemy.

## Saving and difficulty

- **Saves** are kept in the browser's local storage: an autosave written each time you enter or leave a port, plus three manual slots in the log book. You cannot save with shot in the air or an enemy closing.
- **Save codes.** The log book can copy the current voyage as a text code and load a pasted one, to keep a voyage outside the browser or move it to another device.
- **What is saved:** your ship, your fleet, laid-up ships, captains and home port, crew, cargo, refits, gold, plunder, standing with each nation, wars and port owners, the clock and weather, position, wind, commission and the treasure fleet's leg. Other ships are placed afresh on loading.
- **Difficulty** is Easy, Normal or Hard, chosen on the title screen and changeable in the log book. It scales enemy accuracy and reload, damage you take, how soon and how many hunters come, prize money, and how fast nations anger.

The pace, zoom, aim-assist and difficulty choices are remembered in the browser.
