Quizzo v43 – bugfix

Fixes in app.js:
- declares user before avatar actions use it
- declares offset before the Firebase server-time listener uses it

Replace only app.js. Keep your existing firebase.js, index.html, style.css, avatars.js, avatars/, and themes/.
