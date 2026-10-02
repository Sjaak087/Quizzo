# Quizzo V81

Changed only the character/avatar system and the site-management avatar badge permissions.

- Uses the original V67 avatar WebP artwork, embedded locally in avatars.js.
- Removes accessories from the avatar profile.
- 20 image-backed characters are available.
- Avatar images no longer depend on /Quizzo/avatars/... URLs, preventing the previous 404 failures.
- Sitebeheer -> Avatar badges can toggle Nieuw per avatar without logging the administrator out.
- database.rules.json adds proof-authenticated writes for avatarBadges. Publish these rules in Firebase Realtime Database.
- Cache version updated to V81.
