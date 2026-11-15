# Salt and Powder

A top-down pirate sailing game in a single HTML file. Work the wind, fire broadsides, take merchant prizes and refit in port.

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
| Aim assist on / off | `T` |
| Game pace: slow / steady / brisk | `1` / `2` / `3` |
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## How it plays

- **Wind** shifts over time. You cannot sail into it; a broad reach is fastest. The compass shows the wind, your point of sail and your speed.
- **Guns** fire sideways from each beam and reload separately. Round shot breaks hulls; chain shot shreds sails. With aim assist on, shaded lanes show where each broadside will fall and turn green when it will hit a moving target.
- **Battered ships strike their colours**: white flag, sails furled, a white ring around them. Hold fire and sail into the ring to board for the full prize; sinking one loses most of it. The white tick on an enemy's hull bar marks where she will strike.
- **Pace** can be set to slow, steady or brisk at any time from the panel at top left.
- **Ports** repair the ship and sell upgrades: more guns, stronger hull, faster sails, quicker reloads.
- **Hunters** come after you as your plunder grows.

Progress is not saved between sessions. The pace and aim-assist choices are remembered in the browser.
