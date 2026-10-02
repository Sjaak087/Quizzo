# Quizzo V82

- Public quiz discovery fixed: `/quizzes` now has a readable parent rule so the existing "Ontdek quizzen" view no longer gets `PERMISSION_DENIED`.
- Sitebeheer can read the quiz collection without being kicked out when changing avatar badges.
- Restored the original V67 avatar artwork (embedded in `avatars.js`) for the existing 20 avatars.
- Added 5 extra avatar artworks based on the previously generated character set: Sneeuwpop, Zon, Meisje, Jongen and Giraf.
- Total avatar count is now 25.
- Accessories remain removed.
- Avatar badge settings remain per-avatar and are stored under `avatarBadges/<index>`.
- Cache version bumped to V82.
