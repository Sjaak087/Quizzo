Quizzo v96 – Sitebeheer permission denied fix

Aangepast:
- Sitebeheer gebruikt de normale Quizzo-login; er wordt geen tweede wachtwoord-login gevraagd.
- De beheerder wordt herkend aan het normale ingelogde Quizzo-account en het bestaande admin/email-record.
- De extra tijdelijke root-write naar _proof/adminPing is verwijderd. Die veroorzaakte Firebase "PERMISSION_DENIED" bij het openen van Sitebeheer.
- Beheerinstellingen worden rechtstreeks naar hun eigen databasepaden opgeslagen in plaats van via een root-update met _proof.
- Na toegang blijft Sitebeheer in dezelfde normale Quizzo-interface beschikbaar.

Alleen gewijzigd:
- app.js
- README.txt
