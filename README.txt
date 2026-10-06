QUIZZO V109 – Schuifregelaar + NaN-opslagfix

Aangepast:
- De fout "set failed: value argument contains NaN ... questions...start" is opgelost. Niet-schuifregelaar-vragen krijgen niet langer lege start/eindwaarden als NaN bij het opslaan.
- Dit geldt zowel voor normaal opslaan als voor quizzen die via Sitebeheer worden bewerkt en opgeslagen.
- Bestaande quizzen zonder Schuifregelaar blijven hun normale vraagdata behouden.
- De Schuifregelaar-editor gebruikt nu de volledige beschikbare editorruimte, zoals de andere vraagtypes, in plaats van een klein ingesloten kaartje.
- Het antwoord in de editor blijft een normaal cijfer dat je intypt.
- De interne stapgrootte blijft automatisch en verborgen.
- De schermweergave van de Schuifregelaar blijft de eerder ingestelde afgeronde waarden gebruiken.
- index.html is bijgewerkt naar app.js?v=109 zodat de nieuwe versie direct wordt geladen.

Bestanden in deze ZIP:
- app.js
- index.html
- README.txt

Upload deze bestanden naar dezelfde map als je huidige Quizzo-bestanden. Geen andere bestanden zijn gewijzigd.
