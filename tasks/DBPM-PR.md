## Výsledek

PROJEKŤÁK DBPM v 4. patře aktivně pronásleduje hráče přes celou kancelář,
přeskakuje stoly a dveře, útočí bagetou a střídá hody notebooku a bagety.
Po 12–18 s vytváří jednu dočasnou DEMAND tabulku: jde přeskočit, zničit dvěma
disketami / jedním CD a po 5 s zmizí. HP 6, odměna +250 právě jednou.

## Změny

- `dbpm.js`: konfigurace, AI, útoky, HP bar, bezpečné spawnování, společné
  kolize/poškození a úklid při pauze, změně patra, smrti, checkpointu a restartu.
- `enemy-catalog.js`, `game.js`, `index.html`: integrace bez změny SAP a finále.
- `character-dialogue.js`: import dodaného JSON a všech sedm přesných hlášek DBPM;
  doplněné texty sekretářky, manažera, bezpečáka, HR a design managera jsou
  skutečně napojené na události ve hře.
- `assets/characters/dbpm*.png`, `scripts/prepare_dbpm_sprites.py`: nově kreslené
  transparentní pózy podle nedotčené SVG reference, 32barevný atlas s jednotným
  měřítkem a kotvením nohou. HIT zatím používá idle s krátkým bílým zábleskem;
  samostatná kresba zásahu může přijít později.
- `character-preview.html/js`: všech 13 postav a volby nových póz.
- `DBPM.md`: parametry a postup dalšího rozšíření; volitelný výskyt v 8. patře
  je připravený, ale vypnutý.

Vzhled v běžící hře: [snímek DEMAND](https://github.com/LukynovoCZ/IT-HERO/blob/feature/dbpm-project-manager/docs/dbpm-gameplay.png).

## Ověření v Chromium / Playwright

- `tests/dbpm.cjs`: skutečný pohyb přes geometrii oběma směry; všechny útoky,
  úhyb, rotace, poškození, expirace, DEMAND, 2 diskety / 1 CD, HP/skóre a úklid.
- `tests/imported-dialogue.cjs`: všech 19 textů sedmi typů stávajících nepřátel.
- `tests/character-preview.cjs`, `tests/dialogue-catalogue.cjs`: 13 postav a editor.
- `tests/gameplay.cjs`, `tests/sap-integrator.cjs`: checkpoint, původní SAP a HDD finále.
- `tests/touch-controls.cjs`: vícebodové dotyky, čtyři mobilní rozměry a PC klávesnice.
- `tests/it-colleague.cjs`, `tests/helper-dialogue.cjs`: pomocníci a jejich hlášky.

Mobil byl ověřen emulací dotykového zařízení, nikoli na fyzickém telefonu.
Statická aplikace, žádné nové runtime závislosti. `main` ani veřejná verze
nejsou touto větví aktualizované; změna čeká na review a schválení.

Closes #1
