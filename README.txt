Quizzo – aangepaste versie V115

Deze ZIP bevat alleen de bestanden die voor deze aanpassing zijn gewijzigd.

Aangepast:
- app.js
  - Multiplayer heeft na de laatste vraag weer een echte eindstatus met podium in plaats van het spel direct te verwijderen.
  - Dit geldt ook wanneer de laatste vraag een dia is.
  - De host krijgt tijdens een multiplayer-vraag geen antwoordknoppen, slider of invoerveld meer. De host ziet alleen de vraag, timer en hoeveel spelers al hebben geantwoord.
  - Antwoordacties zijn ook technisch geblokkeerd voor de multiplayer-host, zodat de host niet alsnog via de interface een antwoord kan insturen.
  - Na de laatste uitslag zien zowel host als spelers het podium met de top 3. De host kan daarna de quiz afsluiten; spelers wachten op het afsluiten door de host.
  - De bestaande slider-weergave uit V114 blijft behouden.
  - Build/cache-versie verhoogd naar V115.

- style.css
  - Styling toegevoegd voor het nieuwe host-scherm tijdens multiplayer-vragen.

- index.html
  - Cache-versie verhoogd naar V115 zodat de nieuwe app/style direct wordt geladen.

- README.txt
  - Deze wijzigingsnotities bijgewerkt.

Waarom dit nodig was:
In de vorige slider-aanpassing bleef de multiplayer-eindroute het game-record verwijderen zodra de laatste vraag klaar was. Daardoor kregen spelers nooit de eind-podiumweergave. Daarnaast gebruikte de host tijdens een multiplayer-vraag dezelfde antwoordweergave als een speler. Deze versie splitst die twee rollen weer correct.

Gebruik:
Upload de bestanden uit deze ZIP over de bestaande bestanden van je GitHub Pages-project.
