Quizzo V74 — asset loader fix

Deze update is opnieuw gebaseerd op de originele V67-bestanden.

Aangepast:
- app.js gebruikt import.meta.url als basis voor alle theme/avatar/accessoire-assets.
- Theme previews proberen automatisch alle juiste bestandsextensies en fallbacks.
- Achtergronden gebruiken dezelfde robuuste resolver tijdens het spelen.
- Avatar/accessoire URLs worden niet meer afhankelijk van document.baseURI opgebouwd.
- maintenance.js vereist na iedere volledige pagina-load opnieuw het wachtwoord.
- enabled=true toont onderhoud; enabled=false verbergt het.

Ongewijzigde assetmappen blijven nodig:
- themes/
- avatars/
