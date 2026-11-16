# Salt and Powder

A top-down pirate sailing game set in the West Indies and along the coast of North America in the 1750s, through the Seven Years' War, in a single HTML file. Work the wind, fire broadsides, take prizes and refit in port.

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
| Set a course | click a port on the full chart |
| Hand the helm to the helmsman, or take it back | `N` |
| Pause to give orders | `P` |
| Name the fleet's target | click an enemy ship |
| Zoom in / out | `=` / `-`, mouse wheel, or pinch |
| Aim assist on / off | `T` |
| Fleet formation: line astern / abreast / wedge | `G` |
| Gazette | `J` |
| Fleet orders: line of battle / engage at will / general chase / hold fire | `H` |
| Fleet management: every ship, at sea or in port | `V` (or click a ship card) |
| Ship's manifest: cargo, crew, purse | `I` (or click the Hold line) |
| Game pace: slow / steady / brisk / swift / passage | `1` to `5` |
| Combat orders for one ship | click her on the sea or on her card |
| Log book: save, load, difficulty | `Esc` or `L` |
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## Screens

- **Top bar and ship cards.** Gold, rank, hold, crew and sail state run across the top with the tools beside them, including a full-screen button. Down the left side is a card for your flagship and one for each consort, showing hull, sails and crew; click a card to manage that ship.
- **Port.** Each port opens on a painting of the town from above, made with the same water, shallows, sand, trees, roofs and ship drawings as the sea view, so it reads as the same world seen closer. The roofs and church follow the nation that holds the town (Spanish tile and domes, English slate and a square tower, French blue slate and a spire, Dutch colours, thatched huts in the buccaneer hamlets); size, walls, cathedral and fort follow the town. A trader lies at a jetty, your own ships ride at anchor, flags fly with the wind and lamps are lit at night. Click a building, or the tab beneath it: Shipyard (repair everything, buy a ship), Market, Tavern (crew and captains), Governor (commissions, standing, news, pardons, home port) and Your fleet.
- **The chart** is drawn in ink on parchment, with rhumb lines, compass roses and place names. Zoom with the wheel, pinch, or the + and − buttons and keys; drag or use the arrow keys to move. A set course is drawn as a dotted red line with its length in leagues. Your home port is the green star. Click a port to set a course: the helmsman steers there round the land and against the wind until you touch the helm, an enemy closes, or you arrive.
- **Fleet management** opens at any time. Pick a ship from the list to see her picture and manage her alone: repairs, crew (move hands between ships, or hire in port), her own four refits, her captain, hoisting your flag in her, selling her, or laying her up at your home port. Repairs, refits, hiring and selling need a port.

## Tests

`node tests/run-tests.js` runs 143 end-to-end checks in headless Chromium (it needs Playwright). They cover the world and ports, sailing and wind, gunnery and surrender, boarding and prizes, the fleet, every port building and the fleet screen through their real buttons, commissions, nations, saving, the helmsman on four voyages, twelve unattended minutes of the world, politics, weather, wages, the keyboard and screens, drawing at night in storm and fog, and a phone-sized screen. Opening the page with `#test` exposes the game's internals to the suite as `window.__sp`.

## How it plays

- **The map** runs from the Spanish Main north to Louisbourg on Cape Breton, and from Veracruz east to Barbados and Bermuda: the Caribbean, the Gulf of Mexico, Florida, the Carolinas, the Chesapeake and Delaware capes, New York, New England and Nova Scotia. Coastlines are Natural Earth 1:10m data (public domain), simplified. The world is 900 units to the degree of latitude, on a projection that is true at 27° N. The Chesapeake and Delaware bays are too narrow to sail at this scale, so Norfolk and Philadelphia stand at their capes.
- **Ports.** There are 106, in four sizes. Cities (Boston, New York, Philadelphia, Charleston, Kingston, Havana, Cap-Français and others) and towns have a governor, a yard, a prize court and letters of marque. Small ports have a magistrate who has only dispatches to send. Landings, more than forty of them from Canso to Bonaire, are fishing villages, plantation wharves and logwood camps: a few goods, a careenage, no governor, no customs officer, and they never turn anyone away, whatever flag is hunting you. Havana, English Harbour and Halifax are royal dockyards. St Eustatius, Charlotte Amalie and Monte Cristi are free ports.
- **Five flags.** Denmark holds St Thomas and St Croix and is neutral throughout.
- **Home port.** A new voyage can start from Kingston, Charleston, New York or Boston.
- **The northern trade.** Four more goods: salt fish, flour and provisions, rice, and naval stores. The mainland feeds the sugar islands and takes molasses home for rum. Monte Cristi, a Spanish landing on the French border of Hispaniola, pays a smuggler's price for flour and fish.
- **Traffic.** The sea is peopled around you: up to about thirty merchantmen within some 70 leagues, more off the great ports and few in mid-ocean, with ships beyond the horizon forgotten and new ones raised on the routes. Besides West Indiamen, snows and convoys there are coasting schooners and sloops between the small ports, fishing boats off the landings, and fast packets whose mail bags are worth taking.
- **Sea conditions.** The Gulf Stream sets north-east at about two knots through the Florida Straits and up the coast past Hatteras. Fog is commoner north of New York, and winter brings gales north of the Carolinas.
- **On the chart** ports are marked with their flags. Cities are always named; towns, small ports and landings are named as you zoom in.
- **Wind** shifts over time. You cannot sail into it; a broad reach is fastest. The compass shows the wind, your point of sail and your speed.
- **Guns** fire sideways from each beam and reload separately. Round shot breaks hulls; double shot hits far harder at half the range and loads slowly; chain shot shreds sails; grape shot, at short range, cuts down crew. A ball that travels the length of a ship's deck rakes her: about 60% more damage, and crew killed. Guns fired to leeward, from the weather gauge, shoot a little truer because the smoke blows clear. French warships fire chain at your rigging; British ones reload faster. With aim assist on, shaded lanes show where each broadside will fall and turn green when it will hit a moving target.
- **Ships strike their colours** when the hull is battered or the sails are shot away: white flag, a white ring around them. Hold fire and sail into the ring to board for the full prize; sinking one loses most of it. White ticks on an enemy's bars mark where she will strike.
- **Nations and the war.** Great Britain, Spain, France and the Netherlands each hold ports and send out merchantmen and warships in their own colours. The calendar follows history: Britain and France go to war in May 1756, Spain joins in January 1762, Martinique and Havana fall to the British that year, and the Peace of Paris in February 1763 hands them back. After that the game runs on, and wars and peace come at random. You can start in 1750, 1756 or 1759. At Hostile a nation's ports close to you and her warships hunt you; a pardon can be bought elsewhere.
- **Privateer or pirate.** In wartime a governor sells a letter of marque for 150 gold. His enemies' ships are then lawful prize: only they hold it against you, your patron warms to you, and hulls you send in are condemned by the prize court for more gold, paid when you next call at one of his ports or your home port. Attack anyone else, or anyone at all without a letter, and it is piracy: every nation marks it, and a patron revokes the letter.
- **Career.** Lawful prizes, commissions, searched neutrals and exchanged prisoners earn service with your patron. Governors promote you from privateer to lieutenant, commander, post-captain and commodore, with bounties, the right to buy ships of the line at any of the patron's yards, a frigate, then a fifty-gun ship and half wages. Piracy gets the letter revoked and your name struck off.
- **Convoys.** A nation at war sails much of its trade in company: a lead merchantman, two or three more on station, and a sloop, brig or frigate escort.
- **Stop and search.** With a letter of marque, come alongside a neutral merchantman and press B. If she carries enemy cargo you may take it as lawful prize, at some cost in her nation's goodwill.
- **Prisoners.** Officers of warships you board give their parole. Their own governor will ransom them, or an enemy governor pays head money and counts it as service.
- **Customs.** Spanish guarda-costas stop you in Spanish waters if you carry cloth and hardware: bribe, run or be searched. Ashore in a Spanish port the customs officer can be paid to look away; unpaid, he sometimes seizes the lot.
- **Operations of the war.** Holding the right commission, governors offer dated operations: the blockade of Cap-Français (1757 to 1761), the troop convoy to Martinique (early 1762), the siege of Louisbourg (spring 1758), the siege or the defence of Havana (summer 1762), and breaking a British blockade for France. Dispatches may also be for Europe, handed to a packet at the eastern edge of the chart.
- **The gazette** (J) keeps the dated news of the war and of your own doings. The prize court reads out each condemnation on its own sheet.
- **Retiring.** The governor at your home port will let you swallow the anchor: the voyage ends with a reckoning of your years at sea, prizes, rank and fortune.
- **Flags and paint.** Ships and forts fly the flags of the 1750s: the British red ensign, the Spanish Burgundy cross, the white Bourbon ensign of France and the Dutch tricolour; a privateer flies her patron's. Warships have varnished sides, a black wale and gilded sterns, and open their gun ports when they clear for action. The four flags under the compass are tied in red where nations are at war.
- **Shipyard.** Yards sell sloops, Bermuda sloops, schooners, snows, brigs and frigates; the royal dockyards also sell fifty-gun ships and seventy-fours, the two-deckers of the line. Each has its own speed, handling, guns and hull. Your old ship is taken in part exchange and your refits carry over.
- **Commissions.** Governors offer paid work: carry dispatches to another port, raid an enemy nation's trade, hunt a wanted pirate, or board a Spanish plate ship.
- **The plate fleet.** From 1754 two unarmed Spanish plate ships with heavy cargo sail between Veracruz and Havana under a naval escort, a ship of the line among them once you are notorious. The fleet is marked on the chart as a gold diamond. Lone Spanish register ships, marked in gold, carry silver without an escort.
- **Trade.** Eight goods: molasses, sugar, tobacco, rum, coffee, cocoa, cloth and hardware, and indigo. Each port makes some cheaply and pays well for others. Spain forbids foreign manufactures in her colonies, so cloth and hardware bought at Kingston, Willemstad or St Eustatius fetch a smuggler's price in Spanish ports.
- **Hurricanes.** From June to November a hurricane may come, once a season at most. The glass falls about forty seconds ahead; then the wind goes round the compass for a minute or more. Under full sail it will strip your canvas and can sink you; under bare poles you lose little. Ports are safe.
- **Chase.** A ship you fire on, or one that fires on you, is tracked with a pointer and a distance even when out of sight, until she is more than about 120 leagues away.
- **In port** you ride at anchor with your bow to the open sea. Time does not stop: other ships sail on, and each repair or refit takes time.
- **Crew and boarding.** Every ship has a crew. Yours is hired in port; below half strength your guns reload slowly. Come within a ship's length of an enemy and board her: the fight is decided by numbers, and a ship with too few hands left strikes her colours.
- **Prizes.** The prize screen lists everything in her hold, gold and each trade good, with how much of it you have room for. A captured ship can be plundered and released, taken as your own ship (the old one is sold), or sent to port under a prize crew for the value of her hull.
- **Fleet.** A captured ship can join your fleet; up to four consorts sail with you and fight beside you. Their holds add to yours. In port you can repair them, refit each one separately, sell them to free a place in the fleet, appoint captains, or hoist your flag in one and make her your own ship.
- **Captains.** Each consort needs a captain. Taverns offer captains for hire, rated 1 to 5 for gunnery (faster, truer broadsides) and seamanship (speed). A captured ship's officer sometimes offers to serve. With no spare captain your first mate takes her, at the lowest rating.
- **Crew from prizes.** Up to half of a captured ship's survivors will sign on with you. A ship added to your fleet keeps her own crew, topped up from yours if she is short.
- **Safe harbour.** While you are in port the world sails on, but neither you nor any ship of yours can take damage, and your ships do not fire.
- **Home port.** You start with Kingston as home and can move it to any open port for a fee. Consorts can be laid up there (eight at most) and recalled.
- **Orders for one ship.** In fleet management any consort can be sent off alone: to hunt prizes (hostile merchantmen, pirates and ships you have marked), to chase your marked ship, to hold where she is, or to sail to a named port and wait. She boards what strikes to her and sends you the gold and goods, less a tenth for her company, and rejoins when you meet her or call her back.
- **Prizes and flotsam.** Consorts sailing in your line slip away to board ships that have struck and to pick up crates, then return. A standing order, set from the flagship's orders panel or the fleet screen, says what they do with a prize: plunder and release, take her into the fleet, send her in to be sold, or leave her to the flagship.
- **Command.** Choose a formation and standing orders. In line of battle consorts keep station and fire as the enemy bears; engage at will sends each after the nearest enemy; general chase lets them break the line and run down any enemy in sight; hold fire keeps them back. With aim assist on, each consort's lines of fire are drawn and turn green when a target is in them. Hunters come in squadrons against a fleet.
- **Pause and targets.** Pause freezes the sea while you change formation, orders and shot. Click an enemy ship, paused or not, to make her the fleet's target.
- **Captains improve.** A captain gains gunnery by landing shot and seamanship by time under way in company.
- **Wages and shares.** Every hand and captain is paid on the first of each month, after the first; if you cannot pay, a tenth of your flagship's crew deserts. Each consort's company takes 6% of the gold from every prize.
- **Ship names.** Every ship of yours has a name, which you can change in fleet management.
- **Trade.** Five goods (sugar, tobacco, rum, cocoa, cloth) are cheap where they are made and dear where they are wanted. Each class has a hold; captured merchantmen carry goods as well as gold.
- **Politics.** Wars and peace between the four nations change over time, and ports change hands. Warships attack ships of nations they are at war with, and everyone fights pirates, whether or not you are there.
- **Day, night and weather.** A day lasts five minutes. At night ports and ships show lights and you are harder to spot. Squalls freshen the wind, fog hides you from hunters, and storms tear the canvas of a ship under full sail.
- **Shot that shows.** A hit bursts in flame and throws timber or torn canvas into the sea, where it splashes; round shot can start fires that burn for a while. Every gun fired leaves smoke that hangs, drifts downwind and thickens with the firing until it hides the ships and spoils everyone's aim. Wind and rain clear it.
- **Combat orders.** Click one of your ships, on the sea or on her card, for a panel at the lower left: engage a ship you pick or one from the list of enemies in sight, engage your mark, hunt prizes, rejoin the line, hold, flee to the nearest safe port, change her shot, or strike her colours to save her captain. Clicking your flagship gives signals to the whole fleet.
- **Losing the flagship** is no longer the end. You may shift your flag to a consort, take to the longboat with eight hands and a third of your gold, petition a governor for your release (friendlier nations are likelier to help), or end the voyage.
- **Motion.** Ships heel to the wind and out of their turns, roll from the recoil of a broadside, pitch harder in a storm, throw spray at speed, and shiver their canvas in irons. Wrecks leave planks afloat.
- **Towns** are each laid out differently: cathedral cities behind walls at Havana, Cartagena, Santo Domingo and Veracruz, gabled Dutch houses at Willemstad, a small naval yard at English Harbour and a single street of warehouses at St Eustatius.
- **Hunters** are the navy of a nation you have made an enemy; a captain at peace is not chased.
- **Pirates are rare.** Every several minutes a rover or two appears, never more than two at once. They carry what they have taken, so a pirate prize pays far more than her bounty. A rover fights a weaker ship and runs from a stronger one.
- **Merchantmen do not fight.** They run from anything that means them harm, for their destination if that way lies open and otherwise straight away, and they never fire.

## Saving and difficulty

- **Saves** are kept in the browser's local storage: an autosave written each time you enter or leave a port, plus three manual slots in the log book. You cannot save with shot in the air or an enemy closing.
- **Save codes.** The log book can copy the current voyage as a text code and load a pasted one, to keep a voyage outside the browser or move it to another device.
- **Passage pace** runs the sea at three times speed for long crossings and drops back to steady when an enemy closes.
- **What is saved:** your ship, your fleet, laid-up ships, captains and home port, crew, cargo, refits, gold, plunder, standing with each nation, wars and port owners, the date, your letter of marque and prize money owed, the clock and weather, position, wind, commission and the plate fleet's leg. Other ships are placed afresh on loading.
- **Difficulty** is Easy, Normal or Hard, chosen on the title screen and changeable in the log book. It scales enemy accuracy and reload, damage you take, how soon and how many hunters come, prize money, and how fast nations anger.

The pace, zoom, aim-assist and difficulty choices are remembered in the browser.
