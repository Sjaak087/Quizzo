Quizzo V97 – normale login + Sitebeheer in normale interface

Aangepast:
- Normaal Quizzo inloggen gebruikt weer gewoon e-mailadres/gebruikersnaam + wachtwoord.
- De normale login wordt niet meer in localStorage bewaard. Na een volledige pagina-refresh moet je opnieuw normaal inloggen.
- Sitebeheer gebruikt geen apart Sitebeheer-loginformulier meer.
- Een account met Sitebeheer-rechten krijgt na de normale login een extra tabblad “Sitebeheer” in dezelfde Quizzo-interface.
- Sitebeheer wordt binnen het normale Quizzo-scherm geopend; er wordt geen apart fullscreen admin-scherm/overlay meer geopend.
- De bestaande Sitebeheerfuncties blijven beschikbaar: Dashboard, Updatelog, Openbare quizzen en Beheer.
- Sitebeheer afsluiten brengt je terug naar het normale Quizzo-scherm zonder je normale account uit te loggen.
- “Uitloggen” bij Sitebeheer logt alleen Sitebeheer uit en laat het normale Quizzo-account ingelogd.
- De oude aparte Sitebeheer-loginactie geeft niet langer een tweede loginformulier.

Gewijzigde bestanden:
- app.js
- README.txt
