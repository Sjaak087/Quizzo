Quizzo – aangepaste versie V114

Deze ZIP bevat alleen de bestanden die voor deze aanpassing zijn gewijzigd.

Aangepast:
- app.js
  - Schuifregelaar tijdens het spelen duidelijker gemaakt: grote actuele waarde, visuele schaal met stap-markeringen en een duidelijke sleepknop.
  - De beginpositie van de schuifregelaar staat standaard rond het midden van de schaal, zodat spelers direct een bruikbare startpositie hebben.
  - Na het versturen van een schuifantwoord wordt bij de uitslag onderscheid gemaakt tussen exact goed en een antwoord dat niet exact goed is maar wel punten oplevert.
  - De host ziet bij een schuifvraag na het beantwoorden een Kahoot-achtige resultaatweergave: juiste waarde als groene marker, antwoorden van spelers als markers op dezelfde schaal en daaronder per speler de gekozen waarde, punten en status.
  - De speler ziet bij de persoonlijke uitslag zijn eigen waarde, de juiste waarde en de verdiende punten.
  - Schuifscore blijft gebaseerd op 80% afstand en 20% tijd; de bestaande spelregels zijn verder niet gewijzigd.
  - Build/cache-versie verhoogd naar V114.

- style.css
  - Nieuwe styling voor de schuifregelaar, de marker/tick-weergave en de uitgebreide uitslagweergave.
  - Responsive gemaakt voor mobiel, inclusief spelerlijst op kleine schermen.

- index.html
  - Cache-versie verhoogd naar V114 zodat de aangepaste app direct wordt opgehaald.

Niet gewijzigd:
- Firebase-structuur en database-regels.
- Andere vraagtypes en bestaande quizfuncties.

Gebruik:
Upload de bestanden uit deze ZIP over de bestaande bestanden van je GitHub Pages-project. 
