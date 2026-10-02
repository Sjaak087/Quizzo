Quizzo v67 — resource repair patch

Vervang app.js, style.css, avatars.js en de map avatars/.
Laat index.html, firebase.js en themes/ staan.

Fixes:
- Thema-afbeeldingen zoeken eerst JPG (de bestaande themes/ bestanden), daarna WebP/PNG/SVG als fallback.
- Oude SVG-CSS-verwijzingen worden geneutraliseerd zodat ze geen 404s meer veroorzaken.
- Avatar/accessoire-assets uit de werkende avatarcatalogus zijn meegeleverd.
- Bare avatar-0.webp/accessory-0.webp namen worden automatisch naar avatars/ genormaliseerd.
