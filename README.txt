Quizzo V100 – normale account-login blijft behouden na refresh

Aangepast:
- app.js
  - Het normale Quizzo-account wordt na succesvol inloggen opgeslagen in localStorage.
  - Bij refresh/rejoin wordt het normale account automatisch teruggeladen.
  - De normale gebruiker hoeft dus niet opnieuw in te loggen.
  - Sitebeheer blijft volledig apart: ADM wordt NIET opgeslagen en wordt bij een refresh/reload opnieuw afgesloten.
  - Uitloggen via de normale Quizzo-uitlogactie verwijdert het opgeslagen normale account zoals voorheen.

- index.html
  - Cacheversie verhoogd naar V100 zodat de nieuwe app.js daadwerkelijk geladen wordt.

Belangrijk:
Upload alleen deze twee bestanden als vervanging van je huidige bestanden:
1. app.js
2. index.html

De Firebase-regels hoeven voor deze wijziging niet aangepast te worden.
