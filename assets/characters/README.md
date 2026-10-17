# Office enemy references

Transparent three-pose atlases prepared from the user's supplied pixel-art lineups:

- `security_guard.png`: idle, STOP, walking with radio; brown suit, blue shoes.
- `hr_manager.png`: hand on hip, STOP, walking with documents; red curls and black dress.
- `design_manager.png`: hands folded, raised finger/tablet, walking with car design sheets; sterner expression requested by the user.

No new illustrated weapon was added. All three use the existing default folder projectile. `enemy-catalog.js` defines source rectangles, per-pose foot anchors, facing, common per-character scale and physics bodies. Runtime CanvasTextures isolate and normalize the poses without stretching their proportions. Missing hit/defeat illustrations use the existing flash and a fade-out. See `ENEMY_CATALOG.md` for configuration, placements and browser checks.

`sap_integrator.png`: transparentní atlas malého štíhlého Šéfa SAP podle dodané
reference (1774 × 887). Klid, nápřah pumpičkou a hod. Ořezy a kotvy jsou
v `sap-integrator.js`; chůze, zásah a smrt používají jednoduchou Phaser animaci.

`managers_readable.png` (1536 × 1024): čitelnější varianta HR manažerky
(horní řada) a design manažera (dolní řada), po třech pózách. Používá výraznější
obrysy a kontrast, nahrazuje původní jemné atlasy v konfiguraci verze 0.8.1.

`it_colleague.png` (1774 × 887): nezranitelný pomocník IT KOLEGA, čtyři pózy
podle reference. Jeho vlastní ořezy, kotvy, návštěvy a předměty jsou v
`it-colleague.js`, konfigurace a testování v `IT_COLLEAGUE.md`.
