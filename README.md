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
| Switch round / chain shot | `R` |
| Dock when near a port | `F` |
| Open the full chart | `C` (or click the small chart) |
| Zoom in / out | `=` / `-`, mouse wheel, or pinch |
| Aim assist on / off | `T` |
| Game pace: slow / steady / brisk | `1` / `2` / `3` |
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## How it plays

- **The map** is the Caribbean, from Veracruz to Barbados and from Florida to the Spanish Main, drawn from real coordinates. The smaller islands are drawn a little large so they can be sailed around.
- **Ports** are 21 towns of the period in their real locations: Port Royal, Havana, Santiago de Cuba, Tortuga, Petit-Goave, Santo Domingo, San Juan, Nassau, Veracruz, Campeche, Trujillo, Portobelo, Cartagena, Santa Marta, Maracaibo, Willemstad, La Guaira, Cumana, Bridgetown, Fort-Royal and Basseterre. They show as yellow marks on the chart, and a pointer at the screen edge leads to the nearest one.
- **Wind** shifts over time. You cannot sail into it; a broad reach is fastest. The compass shows the wind, your point of sail and your speed.
- **Guns** fire sideways from each beam and reload separately. Round shot breaks hulls; chain shot shreds sails. With aim assist on, shaded lanes show where each broadside will fall and turn green when it will hit a moving target.
- **Ships strike their colours** when the hull is battered or the sails are shot away: white flag, a white ring around them. Hold fire and sail into the ring to board for the full prize; sinking one loses most of it. White ticks on an enemy's bars mark where she will strike.
- **Nations.** England, Spain, France and the Netherlands each hold ports and send out merchantmen and warships in their own colours. Attack a nation's ships and your standing with her falls while her enemies warm to you. At Hostile her ports close to you and her navy hunts you; a pardon can be bought in any port still open. Pirates fly black and attack everyone.
- **Shipyard.** Every port sells five classes: sloop, schooner, brig, frigate and galleon, each with its own speed, handling, guns and hull. Your old ship is taken in part exchange and your refits carry over.
- **Commissions.** Governors offer paid work: carry dispatches to another port, raid an enemy nation's merchantmen under a letter of marque, hunt a wanted pirate, or board a Spanish treasure galleon.
- **The treasure fleet.** Two unarmed Spanish galleons with heavy cargo sail under escort between Veracruz, Havana, Santo Domingo, Cartagena and Portobelo. The fleet is marked on the chart as a gold diamond.
- **Chase.** A ship you fire on, or one that fires on you, is tracked with a pointer and a distance even when out of sight, until she is more than about 120 leagues away.
- **In port** you ride at anchor with your bow to the open sea. Time does not stop: other ships sail on, and each repair or refit takes time.
- **Hunters** come after you as your plunder grows: pirates at first, and the navy of any nation you have made an enemy.

Progress is not saved between sessions. The pace and aim-assist choices are remembered in the browser.
