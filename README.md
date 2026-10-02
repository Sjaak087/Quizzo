Quizzo v63 patch

Fix voor: "Uncaught ReferenceError: cleanup is not defined".

Vervang alleen app.js in de bestaande repository. Laat index.html, firebase.js, style.css, avatars.js, avatars/ en themes/ staan.
De cleanup-functie is nu centraal en veilig gedeclareerd vóór home() en run().
