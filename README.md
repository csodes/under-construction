# under-construction

A fun, fully static "Under Construction" landing page. No build step, no
dependencies — just open `index.html` in a browser (or deploy the folder to
any static host like GitHub Pages, Netlify, or S3).

## Features

- 🎨 Animated gradient background
- 👷 Bobbing construction worker who spins (and throws confetti) when clicked
- 🚧 Barber-pole progress bar that creeps toward "almost done"
- 💬 Rotating, lighthearted taglines
- 🔨 "Hammer Time" button with confetti bursts
- 🛠️ Floating tool emojis drifting up the screen
- 🧱 **Brick Stacker** mini-game in a modal — one-tap stacking with a
  `localStorage` high score
- ⌨️ Hidden easter egg — try typing `build`
- ♿ Respects `prefers-reduced-motion`

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup |
| `styles.css` | Styling and animations |
| `script.js` | Interactivity (progress, confetti, taglines) |
| `game.js` | Brick Stacker mini-game (modal) |

## Local preview

Just open the file directly:

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```
