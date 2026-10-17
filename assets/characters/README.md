# Office enemy references

Transparent three-pose atlases prepared from the user's supplied pixel-art lineups:

- `security_guard.png`: idle, STOP, walking with radio; brown suit, blue shoes.
- `hr_manager.png`: hand on hip, STOP, walking with documents; red curls and black dress.
- `design_manager.png`: hands folded, raised finger/tablet, walking with car design sheets; sterner expression requested by the user.

No new illustrated weapon was added. All three use the existing default folder projectile. `enemy-catalog.js` defines source rectangles, per-pose foot anchors, facing, common per-character scale and physics bodies. Runtime CanvasTextures isolate and normalize the poses without stretching their proportions. Missing hit/defeat illustrations use the existing flash and a fade-out. See `ENEMY_CATALOG.md` for configuration, placements and browser checks.
