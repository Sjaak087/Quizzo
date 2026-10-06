Quizzo V105 – Vaste Sitebeheer-login voor alle accounts

Aangepast:
- Sitebeheer gebruikt nu een volledig aparte, vaste login: e-mailadres + wachtwoord.
- De Sitebeheer-login is NIET het wachtwoord van een normaal Quizzo-account.
- De eerste keer dat Sitebeheer wordt geopend, moet de beheerder één keer een e-mailadres en wachtwoord instellen.
- Deze gegevens worden opgeslagen onder /siteAdmin en worden daarna voor ALLE Quizzo-accounts gebruikt.
- Een normaal Quizzo-account kan dus niet met zijn eigen wachtwoord Sitebeheer openen.
- De oude /admin-opslag wordt niet meer gebruikt, zodat deze versie opnieuw een aparte Sitebeheer-login kan laten instellen.
- De normale Quizzo-login blijft losstaan van Sitebeheer.
- De normale knop Uitloggen logt alleen het Quizzo-account uit; Sitebeheer heeft een eigen uitlogactie.
- Automatische versie-update uit V104 blijft behouden.
- Cacheversies zijn verhoogd naar V105.

BELANGRIJK:
1. Upload database.rules.json naar Firebase Realtime Database > Rules en klik Publish.
2. Upload daarna app.js en index.html.
3. Bij de eerste keer Sitebeheer openen stel je de vaste Sitebeheer-e-mail en het vaste Sitebeheer-wachtwoord in.
4. Iedereen gebruikt daarna precies diezelfde Sitebeheer-login, ongeacht welk Quizzo-account is ingelogd.

Aangepaste bestanden:
- app.js
- index.html
- database.rules.json
