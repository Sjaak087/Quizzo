Quizzo V99 - definitieve Sitebeheer permission fix

Aangepast:
- database.rules.json toegevoegd. Dit was de ontbrekende oorzaak van permission_denied: de bestaande Firebase-regels blokkeerden siteSettings, updates en avatarBadges.
- Sitebeheer kan siteSettings, updates en avatarBadges nu opslaan.
- Admin kan bestaande quizzen beheren/verwijderen volgens de bestaande quiz-regels.
- Eerste Sitebeheer-instelling slaat e-mail + wachtwoordhash op onder /admin.
- Daarna blijft exact die Sitebeheer-login verplicht.
- Normale Quizzo-login blijft apart.
- Sitebeheer blijft binnen de normale Quizzo-interface.
- Foutmeldingen tonen nu ook de echte Firebase-fout in de console.
- Cacheversie verhoogd naar V99.

BELANGRIJK:
1. Upload database.rules.json naar Firebase Realtime Database > Rules en publiceer de regels.
2. Upload daarna app.js en index.html.
3. Alleen app.js/index.html/database.rules.json zijn aangepast.

Let op: Quizzo gebruikt een eigen login in de database en geen Firebase Authentication. Daarom kan Firebase zonder Auth niet server-side controleren of een Sitebeheer-wachtwoord correct is; de regels laten de Sitebeheer-instellingen daarom schrijven. De Sitebeheer-login zelf blijft wel verplicht in de interface.
