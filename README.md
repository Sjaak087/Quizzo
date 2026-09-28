# Quizzo v29 patch

Fix voor `PERMISSION_DENIED` bij **Ontdek quizzen**.

De vorige versie probeerde de volledige `/users`-tak te lezen. De database-regels geven alleen leesrechten op individuele gebruikers (`/users/$u`), en terecht omdat daar ook privévelden zoals e-mail/salt/hash in staan.

Deze patch:
- leest alleen `/users/<ownerId>` per quizmaker;
- bewaart bij nieuwe quizzen ook `creatorName` in de publieke quizdata;
- verandert niets aan de thema-bestanden.

Vervang alleen `app.js` in je GitHub Pages-repository door deze versie. De bestaande `themes/`-map hoeft niet opnieuw geüpload te worden.
