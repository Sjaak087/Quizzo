Quizzo v52 — complete avatar picker rework.

Replace only:
- app.js
- style.css
- avatars.js

Do not replace themes/.

Highlights:
- 20 clean base 3D characters with no wearable accessories baked into the character art.
- 20 accessories in standalone 3D art.
- Automatic accessory placement based on measured character head/face/neck/body geometry; no per-character manual tuning UI.
- Full-screen avatar studio with full-body live preview.
- Accessory names are fully visible (no ellipsis).
- "Geen accessoire" is selected by default.
- Responsive phone layout with touch-friendly controls and a mobile support badge.
- Solo flow still calls back immediately after "Klaar"; multiplayer customization keeps using the same callback.
- All avatar/accessory image data is embedded in avatars.js so GitHub Pages does not depend on a separate asset folder.
