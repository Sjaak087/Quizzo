Quizzo v58 — character flow and wearable fitting patch

Based on the documented Kahoot! participant-character flow: random character on multiplayer join, edit via the character editor, separate character/accessory tabs, Done to finalize, and character shown through the live game and podium. This patch uses Quizzo's own characters/assets; no Kahoot assets are included.

Replace only app.js and style.css. Keep your existing index.html, firebase.js, avatars.js and themes/.

The wearable fitting now compensates for transparent padding in the 512x512 accessory source art and uses independent visible width/height targets plus separate front/back layers. This prevents hats, crowns, glasses, scarves and capes from floating in the wrong place or being clipped.
