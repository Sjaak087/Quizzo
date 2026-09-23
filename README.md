# Quizzo!

Kahoot-achtige quizsite met Firebase (Auth + Realtime Database). Puur statisch, dus geschikt voor GitHub Pages.

## 1. Firebase instellen
1. Firebase Console > Authentication > Sign-in method > zet **E-mail/wachtwoord** aan.
2. Authentication > Settings > Authorized domains > voeg `JOUWNAAM.github.io` toe.
3. Realtime Database > Rules > plak de inhoud van `database.rules.json` en klik op Publish.

## 2. Op GitHub zetten
1. Maak een nieuwe repository en upload **alle** bestanden uit deze zip naar de hoofdmap (`index.html`, `style.css`, `app.js`, `firebase.js`, `.nojekyll`).
2. Repository > Settings > Pages > Source: **Deploy from a branch** > branch `main` en map `/ (root)` > Save.
3. Na ongeveer een minuut staat de site op `https://JOUWNAAM.github.io/REPONAAM/`.

Open de site altijd via die https-link. Dubbelklikken op `index.html` werkt niet, want Firebase Auth werkt niet vanaf `file://`.
Lokaal testen kan met `python3 -m http.server` en dan `http://localhost:8000`.
