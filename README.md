# Quizzo v66 avatar loader fix

Vervang alleen `app.js`.

Deze versie wacht eerst op `avatars.js` voordat de avatarcatalogus wordt vastgelegd. Als GitHub Pages de scripts door elkaar uitvoert, laadt `app.js` `avatars.js` automatisch nogmaals met een cache-buster. Daardoor blijven de 20 avatars en 20 accessoires zichtbaar in de avatar-kiezer.

De bestaande `avatars.js` en `avatars/` map blijven nodig en hoeven niet aangepast te worden.

`themes/` zit bewust niet in deze patch.
