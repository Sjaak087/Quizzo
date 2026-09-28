Quizzo v33 — fix voor “De app is niet geladen”

De vorige v32-download had de bestanden in een extra map in de ZIP staan. Daardoor kon GitHub Pages index.html niet naast app.js/style.css vinden als de map verkeerd was uitgepakt.

Deze ZIP is bewust een ROOT PATCH: de bestanden staan direct in de ZIP-root.

Vervang alleen:
- app.js
- style.css

Laat je bestaande index.html, firebase.js, theme-assets.js en themes/ staan.
