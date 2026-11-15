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
| Mute | `M` |

On a touch screen, on-screen buttons replace the keys.

## How it plays

- **Wind** shifts over time. You cannot sail into it; a broad reach is fastest. The compass shows the wind, your point of sail and your speed.
- **Guns** fire sideways from each beam and reload separately. Round shot breaks hulls; chain shot shreds sails.
- **Merchantmen** strike their colours when battered. Come alongside for the whole cargo; sinking one loses most of it.
- **Ports** repair the ship and sell upgrades: more guns, stronger hull, faster sails, quicker reloads.
- **Hunters** come after you as your plunder grows.

Progress is not saved between sessions.
