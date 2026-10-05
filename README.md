# Quizzo v93

Foutfix voor de Sitebeheer-update.

Aangepast:
- `app.js`: de problematische grote template literal rond regel 402 is vervangen door normale DOM-opbouw. Dit voorkomt de `Unexpected identifier 'site'` syntaxfout.
- `index.html`: alle cacheversies verhoogd naar v93.
- `index.html`: expliciete favicon toegevoegd.
- `favicon.ico`: echte favicon toegevoegd zodat de `/favicon.ico` 404 verdwijnt.

Alleen gewijzigde/nieuwe bestanden zitten in deze ZIP.
