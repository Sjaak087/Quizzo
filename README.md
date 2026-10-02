# Quizzo V78

Kahoot-inspired character editor update based on the current official Kahoot character flow: full-body character preview, separate character/accessory tabs, accessory choices previewed on the selected character, and a Done action. Kahoot documents this flow in its character help article.

Changes in V78:
- accessory rendering now preserves the original image aspect ratio; no forced width/height stretching;
- accessory placement uses avatar anatomy metrics from the original avatars.js catalog;
- added per-accessory anchor/size/angle layout data for all 20 accessories;
- accessory cards show the currently selected character wearing the accessory;
- responsive full-body preview is constrained to the available viewport so characters are not cut off;
- cache version bumped to V78.

Sources for the interaction model:
https://support.kahoot.com/hc/en-us/articles/10712953904147-How-to-use-game-characters
https://support.kahoot.com/hc/en-us/articles/32601683697053-New-Kahoot-features-and-updates
