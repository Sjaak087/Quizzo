# Quizzo V91 – volledig vernieuwd Sitebeheer

## Sitebeheer
- Sitebeheer opent nu als een **overlay over de huidige site**, niet meer als een apart scherm.
- De beheerlogin wordt alleen in het geheugen gehouden. Bij een refresh wordt de beheerder automatisch uitgelogd.
- Ingelogd blijven geeft toegang tot de nieuwe tabs:
  - Dashboard
  - Updatelog
  - Openbare quizzen
  - Beheer

## Updatelog
- Als de beheerder is ingelogd, staat er in de gewone Updatelog een knop **+ Nieuwe update**.
- Vanuit Sitebeheer kun je updates toevoegen, aanpassen en verwijderen.

## Openbare quizzen
- De Sitebeheer-tab toont alle opgeslagen quizzen, niet alleen de quizzen die openbaar zijn.
- Elke quiz kan vanuit Sitebeheer worden geopend en volledig aangepast.
- Quiztoegang kan daarnaast per quiz worden geblokkeerd/toegestaan via Beheer.

## Beheer
Onder Beheer zijn vier subtabs toegevoegd:
1. **Poppetjes** – per avatar online/offline + Nieuw-badge.
2. **Vraagtypes** – Quizvraag, Waar/niet waar, Dia en Typen online/offline + Nieuw-badge.
3. **Speltypes** – Alleen spelen en Multiplayer online/offline + Nieuw-badge.
4. **Quiztoestemming** – per quiz bepalen of deze online beschikbaar mag zijn.

Nieuwe avatars, vraagtypes en speltypes zijn standaard **offline** totdat de beheerder ze online zet. De instellingen worden in Firebase opgeslagen onder `siteSettings`.

De ingestelde Nieuw-badges worden ook in de relevante spelerskeuzes getoond.

## Actieve spelcodes
- Een spelcode wordt alleen tijdens een actieve game onder `games/<code>` opgeslagen.
- Bij het einde van de quiz wordt de volledige game-node verwijderd.
- Bij annuleren wordt de game-node verwijderd.
- Bij het sluiten/verversen van de hostpagina wordt geprobeerd de actieve game direct te verwijderen.
- Daardoor blijven beëindigde/inactieve quizcodes niet als actieve games in Firebase staan.

## Gewijzigde bestanden
- `app.js`
- `style.css`
- `index.html`
- `README.md`
