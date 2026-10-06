Quizzo V104 – Uitloggen en automatische versie-update

Aangepast:
- De knop "Uitloggen" bij het normale Quizzo-account logt nu alleen het Quizzo-account uit.
- De aparte Sitebeheer-sessie wordt NIET meer automatisch beëindigd wanneer je je Quizzo-account uitlogt.
- De aparte Sitebeheer-knop/uitlogfunctie blijft verantwoordelijk voor het afsluiten van Sitebeheer.
- Quizzo controleert bij het starten automatisch of de live index.html een nieuwere app-versie aanbiedt.
- Als een nieuwere versie beschikbaar is, wordt de pagina automatisch vernieuwd met de nieuwste versie, zodat een oude browsercache niet blijft hangen.
- Cacheversies zijn verhoogd naar V104.

Aangepaste bestanden:
- app.js
- index.html

Let op:
- Upload zowel app.js als index.html naar GitHub Pages.
- Bij een volgende versie moet de app.js-versie en de cacheversies in index.html opnieuw worden verhoogd; de automatische controle gebruikt die versie om updates te herkennen.
