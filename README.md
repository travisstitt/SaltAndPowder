# Salt and Powder

A top-down pirate sailing game set in the West Indies and along the coast of North America in the 1750s, through the Seven Years' War, in a single HTML file. Work the wind, fire broadsides, take prizes and refit in port.

## Play

Open `index.html` in a browser. It is one file with nothing to install; the typefaces are embedded, so it makes no network requests.

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
| Dispatches from your captains | `L` |
| Trade ledger and price book | `K` |
| Make a passage (8× on a set course) | `6` |
| Fleet orders: line of battle / engage at will / general chase / hold fire | `H` |
| The muster book: every ship, at sea or in port | `V` |
| Ship's manifest: cargo, crew, purse | `I` |
| Game pace: slow / steady / brisk / swift / passage | `1` to `5` |
| Combat orders for one ship | click her on the sea or on her pennant |
| Set sail, fire a broadside, change shot | click the binnacle: the sail chips, the two gun dials, the shot chip |
| Log book: save, load, difficulty | `Esc` or `L` |
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## Screens

The game has one look throughout, taken from the Georgian navy: dark plates with a brass edge for the instruments on deck, and paper for everything you read. Names are set in small capitals (IM Fell English SC), prose in IM Fell English, figures and buttons in Alegreya Sans. One button on each screen is the main one: brass on deck, oxblood on paper. A wax seal means a captain's message is waiting.

On a wide screen with a mouse (at least 900 by 560) the game is laid out as three places. Smaller and touch screens keep the earlier compact layout, in the same colours and type.

- **The quarterdeck.** The sea fills the screen and the instruments stand at its edges. Top left: the date, hour, weather and wind, the pace, the four powers' flags with a red tie between those at war, your purse, rank and commission. Top centre, when you have a chase: her name, hull and sails as bars, her distance and who has the weather gauge. Top right: Pause and the Great cabin, with a seal and a count when dispatches are unread. Down the left: one pennant for each consort, coloured by her task (white with the flag, gold a trader, blue an escort, red a cruiser, grey in port), with what she is about and her hull; a button shows all eight or only those in sight. Bottom left: your flagship, with hull, sails and crew as bars, the mood of the hands and the hold. Bottom centre: the binnacle, a compass with your heading and the wind, your point of sail and speed, the sail set, a dial for each broadside that fills as it reloads, and the shot loaded. Bottom right: a paper chart of the waters round you. Prompts such as "B · board" and "F · drop anchor" appear by your ship when they apply. The list of keys is kept in the log book.
- **The great cabin** is one table with six tabs: Chart, Fleet, Ledger, Dispatches, Gazette and Log book, and a button back to the deck. The **chart** is the hub: your ships are listed down the left, and clicking one, there or on the chart, opens her card on the right with what she is doing, her hold, her trading account and her orders. Click a port to set a course. Buttons show the price book a good at a time, your traders' runs, and the weather. The **Fleet** tab is the muster book: one line a ship (class, what she is doing, where, hull, hold), orders for all ships or for a division beneath, and the chosen ship on the facing page with her picture, refits, crew, captain and standing orders.
- **Ashore.** The painting of the town is the screen and its buildings carry the tabs: shipyard, market, tavern and governor. The market is one table: each good with its price here, whether it is rising or falling, the best price known elsewhere, what you have aboard, and buttons to buy ten or fill and sell ten or all. Beside it, "Word on the quay" gathers what concerns this port: captains of yours lying here who want repairs or funds, freight on offer, your commission, local shortages and gluts, and the late news. Along the foot are the chart, the fleet, dispatches and the gazette, and Weigh anchor.
- **The town paintings** are made with the same water, sand, trees, roofs and ship drawings as the sea view. Roofs and churches follow the nation that holds the town.
- **The chart** is drawn in ink on parchment, with rhumb lines, compass roses and place names. Zoom with the wheel or the + and − buttons; drag to move. A set course is a dotted red line with its length in leagues. Your home port is the green star.

## Tests

Three suites, all in headless Chromium (they need Playwright):

- `node tests/rules.js` runs 42 fast checks in a few seconds: prices, gunnery arithmetic, the law of prize and reputation, the calendar, promotion, wages, the port list, a performance budget (a tick with fifty ships must cost under 3 ms), and saved games from three formats in `tests/fixtures/` loading into the present game. `--make-fixture` rewrites the current-format fixture.
- `node tests/run-tests.js` runs 170 end-to-end checks in under two minutes: the world and ports, sailing and wind, gunnery and surrender, boarding and prizes, the fleet, every port building and the fleet screen through their real buttons, the chart, saving, the 1750s systems, the wider map and traffic, a seven-year unattended voyage, and a phone.
- `node tests/visual.js` compares nine fixed scenes with the pictures in `tests/baseline/` and checks at five screen sizes, two on the quarterdeck layout with a full fleet of eight and three on the compact one, that no part of the HUD overlaps another or leaves the screen. `--update` rewrites the baselines after an intended change of looks.

Every roll of the dice in the game comes from one source that the tests seed, so a failure repeats. The page exposes its test hook only when opened with `#test`.

## Building

`index.html` is built from `src/` by `python3 build.py`: the page template, the embedded typefaces, and the script in 21 sections under `src/js/` that are joined in name order. The sections share one scope and are not modules. Edit the sources and rebuild; do not edit `index.html` by hand.

The typefaces (Alegreya Sans, IM Fell English and IM Fell English SC, all under the SIL Open Font License) are embedded, so the game needs no network and looks the same offline.

## How it plays

- **The map** runs from the Spanish Main north to Louisbourg on Cape Breton, and from Veracruz east to Barbados and Bermuda: the Caribbean, the Gulf of Mexico, Florida, the Carolinas, the Chesapeake and Delaware capes, New York, New England and Nova Scotia. Coastlines are Natural Earth 1:10m data (public domain), simplified. The world is 900 units to the degree of latitude, on a projection that is true at 27° N. Pilot channels are kept open through the mouths of the Chesapeake and the Delaware, so Norfolk, Yorktown, Annapolis and Philadelphia lie inside their bays.
- **Ports.** There are 108, in four sizes. Cities (Boston, New York, Philadelphia, Charleston, Kingston, Havana, Cap-Français and others) and towns have a governor, a yard, a prize court and letters of marque. Small ports have a magistrate who has only dispatches to send. Landings, more than forty of them from Canso to Bonaire, are fishing villages, plantation wharves and logwood camps: a few goods, a careenage, no governor, no customs officer, and they never turn anyone away, whatever flag is hunting you. Havana, English Harbour and Halifax are royal dockyards. St Eustatius, Charlotte Amalie and Monte Cristi are free ports.
- **Five flags.** Denmark holds St Thomas and St Croix and is neutral throughout.
- **Home port.** A new voyage can start from Kingston, Charleston, New York or Boston.
- **The northern trade.** Four more goods: salt fish, flour and provisions, rice, and naval stores. The mainland feeds the sugar islands and takes molasses home for rum. Monte Cristi, a Spanish landing on the French border of Hispaniola, pays a smuggler's price for flour and fish.
- **Traffic.** The sea is peopled around you: up to about thirty merchantmen within some 70 leagues, more off the great ports and few in mid-ocean, with ships beyond the horizon forgotten and new ones raised on the routes. Besides West Indiamen, snows and convoys there are coasting schooners and sloops between the small ports, fishing boats off the landings, and fast packets whose mail bags are worth taking.
- **Making a passage.** A sixth pace (key 6) runs the clock at eight times for open water under the helmsman. It drops back by itself when a hostile sail or any ship close aboard appears, when the weather turns, or at landfall.
- **The ship's company.** The hands have a mood: prize money, pay and a run ashore lift it; long cruises, lost fights and unpaid wages sink it. A contented crew serves the guns faster, and a sullen one deserts. Taverns in the larger towns offer a sailing master, a gunner, a surgeon and a boatswain, each with a standing benefit, and each can be lost to raking fire.
- **Careening (optional).** With hull fouling switched on at the title screen, weed slowly takes up to 18 per cent off your speed until you careen at any port or landing.
- **Shore actions.** A port that is closed to you can be attacked from boats: cut a merchantman out of the anchorage at night, or land and raid a small port or landing. Odds depend on your numbers, the forts, darkness and weather.
- **Rivals.** Four named captains, French, Spanish, British and a pirate, cruise their home waters, appear in the gazette as they take prizes, grow more dangerous with success, and carry a reward. (The names are invented.)
- **Trading with the enemy.** In wartime a British cruiser will stop a British trader carrying flour or fish near French or neutral free ports: bribe, run or lose the cargo.
- **Winter.** From December to March, Louisbourg, Canso, Halifax and Annapolis Royal are shut by ice, the northern trade thins, and the land north of the Delaware lies under snow. Autumn colours the northern woods from September.
- **French and Spanish service.** France offers the relief of Louisbourg and a cruise against the Jamaica trade; Spain, from 1762, a cruise off Jamaica and the defence of Havana.
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
- **On the water.** The Gulf Stream shows as lines of weed and bluer streaks setting north-east. Sunk ships leave planks, casks and a boat pulling clear. Lighters ply between the roads and the quay at every town. At night ships carry a glowing stern lantern, the moon lies on the water in clear weather, and the larger ports show a harbour light.
- **Regional towns.** New England ports are clapboard and shingle, New York keeps its Dutch gables, and Charleston and Savannah are stucco.
- **Captains who think for themselves.** Each consort's captain looks to his own ship. He shortens sail when a storm or hurricane comes (a good seaman at the warning, a poor one only when it blows), breaks off for the nearest open port when badly damaged, and when detached runs from warships too strong for him. A consort sent to a port goes in and lies safe there, out of the weather and out of reach, until she sails again; she comes out to rejoin when the flagship arrives.
- **Dispatches** (L). Captains write when they break off, make port, finish a cruise or sell a cargo. Dispatches arrive at once and wait in their own box. A damaged ship in port asks leave to repair: pay and send her back to her station, pay and have her rejoin, pay and keep her in port, or leave her.
- **Standing orders** for each consort, on her fleet card: run for port or ride out a hurricane; retire at half hull, at a third, or never; avoid stronger warships, fight equals, or fight anything; how much she may spend on repairs without asking; and what she does once repaired.
- **Independent service.** Besides hunting prizes, a consort can cruise off a port for three months, blockade it, or patrol to it from where she lies. Each is chosen by clicking on the chart, as is the port for "Send her to a port". Her company keeps a tenth. Signals to the whole fleet recall everyone, send everyone to the nearest open port, or call a rendezvous at your home port.
- **Fleet overview** (O). Every ship on one sheet: what she is doing, where, her hull, her cargo and her last dispatch, with buttons to open her card, find her on the chart, recall her, send a trader to sea or pay for repairs. Ships put into the Red, White or Blue division on their cards can be given one order together: rejoin, make for a port, cruise or blockade, the place chosen on the chart.
- **Captains with character.** Some captains are cautious, bold, born traders or prime seamen, and it changes how they follow their standing orders.
- **Two commissions.** A freight contract is held separately from a governor's commission. A consort can be sent to deliver the governor's dispatches in your stead.
- **More for traders.** A trader can be told to carry goods from your warehouse to their best market, and to insure each cargo at five per cent, which repays cargo and trading stock if she is lost. She keeps a little of her stock back for port dues.
- **A guided first voyage.** A new voyage shows nine short steps beside the fleet cards, from making sail to taking a prize, and can be skipped.
- **Economy settings.** In the log book, trade income, prize money and wages can each be set lean, normal or rich.
- **A wider living sea.** Rich register ships, packets and convoys lost over the horizon keep their course and can be found again. A consort cruising or blockading far from the flagship has merchantmen raised around her too.
- **On the chart.** Each trader's run is drawn, green while it pays and red when it does not. Consorts' pennants are gold for a trader, blue for an escort, red for a cruiser and grey in port. A seal marks where each late dispatch was written.
- **A market that reacts.** Buying raises a port's price and selling lowers it, far more at a landing than at a city, and the effect fades over a few months. Shortages and gluts come and go, announced in the gazette; war makes naval stores dear, and a hurricane leaves the nearest town short of provisions and spars.
- **Buying and selling.** Buy ten tons or fill the hold; sell ten or sell all. Each market row says what the good last fetched elsewhere when your price book knows of a better or cheaper port.
- **The price book and trade ledger** (K). Prices are written down whenever you or one of your traders calls at a port. The ledger shows each trader's cargoes and profit, takings by the month, late sales, and the cheapest and dearest known port for every good. On the chart, the Prices button writes the book beside each port, one good at a time.
- **Warehouse.** At your home port up to 400 tons can be stored, taken out again, or sold from the warehouse when the price is right.
- **Freight contracts.** Merchants in the market offer a contract to land so many tons of a good at a named port within a few months, for well over the market price. You find the goods.
- **Merchantmen and escorts.** Any yard will fit out a snow or a West Indiaman for your fleet. A consort can be told to escort a trader: she keeps station on her, goes into port when she does, and fights what threatens her.
- **Sail now.** A trader lying in port has a "Sail now" button on her card: she leaves at once with whatever is in her hold for her next port of call, in ballast if she has nothing.
- **Trader's orders.** Besides her trading stock, each trader has a least profit she will load for (8, 12 or 20 per cent), whether she may carry contraband, and whether she may call where your standing is poor. A city turns her round faster than a landing.
- **Trading on her own account.** Mark two ports on the chart, or click the middle and then the edge of a stretch of water and let her captain choose among the open ports inside it. She takes a trading stock from your purse (100, 250, 500 or 1000 gold, set on her card). Her captain buys only a cargo that should clear at least twelve per cent where he is bound, judging the price at the hour he expects to land it; goes in ballast to a better market when nothing pays; and carries a cargo on to another port sooner than sell it at a loss. Profit above the stock is remitted to you, less a tenth for her company. If the stock falls too low to load a cargo he lies in port and writes for more through the dispatches. The stock comes back when she is given other orders.
- **Eight consorts.** The fleet holds eight ships besides the flagship.
- **Notices** stay on screen long enough to read (six to fourteen seconds by length, by the clock rather than the game pace), and a notice that arrives on the heels of another waits its turn.
- **Your fleet on the chart.** Each consort is a white pennant with her name. Her card in the fleet screen says where she lies, marks the spot on a corner of the chart beside her picture, and has a button that opens the full chart upon her.
- **Waiting out a hurricane.** If a hurricane is coming or blowing while you lie in port, the port screen offers to wait it out: the clock runs as fast as the machine allows until it is over, and nothing touches you.
- **Fleet cards.** The top of each ship's card says what she is doing and where she lies. Each card also lists what is in her hold: the fleet's common cargo is stowed in the flagship first and then in each consort in turn, and a ship trading on her own account shows her own cargo and trading stock.
- **Dispatches and gazette in port.** Both open from the port screen, by the buttons beside "Weigh anchor" or with L and J.
- **Chart in port.** The chart opens from the port screen (button or C) without weighing anchor; a course set there is kept for when you sail. While you lie in port the world goes by at the slow pace, and your sailing pace returns when you weigh.
- **Chart extras.** The great trade routes are pricked out on the chart, and the small chart names the nearest ports.
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
- **Fleet.** A captured ship can join your fleet; up to eight consorts sail with you and fight beside you. Their holds add to yours. In port you can repair them, refit each one separately, sell them to free a place in the fleet, appoint captains, or hoist your flag in one and make her your own ship.
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
