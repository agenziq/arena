# THE ARENA: Identity Awakening Simulator

A cinematic, interactive mini-movie + game built with pure HTML, CSS, and vanilla JavaScript.

## Run locally
1. Download or clone this folder.
2. Open `index.html` directly in any modern browser.
3. Click **Enter Simulation** and play.

No build step required.

## Features
- 3-act branching identity experience (9 prompts + adaptive narrator lines)
- Typewriter narrator pacing with skip support (press `Enter`)
- Canvas ember particles + parallax camera feel
- Cinematic mode (vignette + grain overlay)
- WebAudio ambience + click/whoosh SFX
- Mute toggle persisted with `localStorage`
- 6-second mini-game: **Dodge Distraction**
- Transparent archetype scoring + badge unlocks
- Share card PNG generation via Canvas
- Protocol PDF generation via jsPDF CDN
- Easter egg title click unlock

## Audio controls
- Use the top-left **Sound** toggle to mute/unmute.
- Preference is stored in `localStorage` key: `arenaMuted`.
- Audio starts after user interaction to satisfy browser autoplay policy.

## Cinematic mode
- Toggle **Cinematic Mode** in the top bar.
- Adds vignette + film grain style overlay.

## Replacing synthesized audio with real files (optional)
Current audio is generated with WebAudio (no external assets needed). To switch to real audio:
1. Add your audio files in `assets/` (example: `assets/ambience.mp3`, `assets/whoosh.mp3`).
2. In `script.js`, replace `startAmbience`, `playWhoosh`, and `playClick` implementations with `new Audio('assets/...')` or `<audio>` element playback.
3. Keep mute state checks (`state.muted`) so UX remains consistent.

## Mobile behavior
- Layout is responsive for small screens.
- Supports tap for options and mini-game distractions.
- Uses `deviceorientation` when available for subtle tilt parallax.
