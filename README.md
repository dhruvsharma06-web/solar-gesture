# Orbit · Hand-controlled Solar System

Explore the Sun, planets, moons and satellites with your webcam and hand gestures.
Built with **Vite + Three.js + MediaPipe Hands + Tailwind CSS**.

## Run it
```bash
npm install      # also copies MediaPipe's wasm into public/mediapipe
npm run dev      # open the localhost URL it prints, in Chrome
```
Build for Vercel: `npm run build` (output in `dist/`).

## Gestures
| Gesture | Action |
|---|---|
| ✋ Move your hand | Aim the cursor (objects light up) |
| 🤏 Pinch on an object | Fly to it; keep holding to zoom closer |
| ✊ Hold a fist | Pull back; hold ~1 s to return to the overview |

Mouse/keyboard fallback: click an object, scroll to zoom, ← → to browse, Esc for overview.

## Structure
- `src/data.js`: planets, moons, satellites and their facts
- `src/scene.js`: Three.js scene, textures, orbits
- `src/camera.js`: cinematic camera (overview and fly-in)
- `src/hands.js`: webcam, MediaPipe tracker (throttled, self-tuning), gesture engine, hand painter
- `src/main.js`: UI, picking, labels, main loop (each part isolated so an error can't freeze the app)
