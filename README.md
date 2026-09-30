Quizzo v46 – app.js bugfix

Vervang alleen app.js in de bestaande Quizzo-repository. Laat index.html, firebase.js, style.css, theme-assets.js, avatars.js, themes/ en overige bestanden staan.

Gefixt:
- alle centrale state-variabelen (G, CODE, HOST, Q, QID, ADMIN_EDIT, SEL, mode, tab, joinCode, busy, snapshots, boardAnim, enz.) zijn expliciet en vóór gebruik gedeclareerd;
- cleanup() is idempotent en controleert listener/timer voordat ze worden beëindigd;
- voorkomt de eerdere ReferenceErrors voor G, unsub en timer;
- app.js is syntax-gecontroleerd.
