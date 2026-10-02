Quizzo — aangepaste bestanden V68

Deze ZIP bevat alleen de bestanden die voor V68 zijn aangepast. De bestaande `avatars/`- en `themes/`-mappen hoeven niet opnieuw te worden vervangen. Kopieer deze bestanden over de huidige bestanden in de root van je GitHub Pages-repository.

## Wijzigingen V68 — 404 assets + Kahoot-achtige avatars
- `app.js`: asset-routes zijn gekoppeld aan de locatie van `app.js`, zodat GitHub Pages onder een repository-pad correct blijft werken.
- `app.js`: avatar-, accessoire- en themabestandsnamen worden automatisch naar de juiste map genormaliseerd.
- `app.js`: oudere opgeslagen avatarprofielen blijven werken wanneer ze alleen `avatar-#.webp` of `accessory-#.webp` bevatten.
- `app.js`: veilige avatar-fallback toegevoegd wanneer een lokale avatarafbeelding toch niet bereikbaar is.
- `app.js`: extra controle voor lokale avatar-, accessoire- en Classic-assets toegevoegd.
- `index.html`: lokale CSS/JS krijgen `?v=68` cache-busting, zodat een oude v67-cache niet meer de oude assetpaden gebruikt.
- `style.css`: avatarpicker visueel aangescherpt naar een Kahoot-achtige paarse/witte kaartstijl met duidelijke selectie, diepte en responsive gedrag.

## Belangrijk
Gebruik de bestanden uit deze ZIP in dezelfde mapstructuur als de bestaande website. De echte afbeeldingen blijven staan in `avatars/` en `themes/`.
