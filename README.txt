Quizzo V98

Fixes:
- Sitebeheer vraagt weer expliciet om e-mailadres + wachtwoord.
- Eerste keer Sitebeheer: de ingevoerde gegevens worden opgeslagen onder /admin en daarna zijn die gegevens de vaste Sitebeheer-inlog voor iedereen.
- Daarna moet bij iedere nieuwe Sitebeheer-sessie opnieuw e-mail + wachtwoord worden ingevoerd.
- Normaal Quizzo-inloggen blijft apart en ongewijzigd.
- Sitebeheer blijft binnen de normale Quizzo-interface; geen apart admin-scherm.
- Sitebeheer-opslag gebruikt geen update() op de Firebase-root meer. Iedere wijziging wordt afzonderlijk naar het betreffende pad geschreven, waardoor root permission_denied niet meer optreedt.
- index.html gebruikt app.js/avatars.js/style.css cacheversie 98.

Let op: Firebase Rules moeten lezen/schrijven van de gebruikte admin-, siteSettings-, updates- en quiz-paden toestaan. De app gebruikt geen root update meer.
