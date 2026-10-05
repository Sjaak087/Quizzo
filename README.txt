Quizzo v94 – SyntaxError fix

Aangepast:
- app.js: de code rond app.js regel 544 (act.newq) is volledig omgezet van een grote template literal naar DOM-opbouw.
- Hierdoor kan de browser de tekst "site"/Nieuw-badge niet meer als JavaScript-identifier verkeerd parsen.
- De werking en vraagtypes blijven hetzelfde.

ZIP bevat alleen het aangepaste bestand + deze README.
