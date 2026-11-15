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
- **Ship classes** look different: fat merchantmen with cargo on deck, small red-sailed pirate cutters, black hunter brigs, and long navy frigates with a yellow gun stripe.
- **In port** you ride at anchor with your bow to the open sea. Time does not stop: other ships sail on, and each repair or refit takes time.
- **Hunters** come after you as your plunder grows.

Progress is not saved between sessions. The pace and aim-assist choices are remembered in the browser.
