# Šéf SAP – Globální integrátor (0.8.1)

Samostatná větev `feature/sap-integrator`; veřejná hra se touto větví nemění.
Nový miniboss je v 5. patře, x=650, vedle stávajících nepřátel.
Finální šéf v 9. patře zůstává zachovaný.

## Konfigurace a soubory

- `sap-integrator.js`: profil (`health:8`, `speed:32`, `score:500`, hitbox),
  pozice, pole sedmi hlášek, tabulka `config`, bojové chování, generované textury
  helmy a propisky, ukazatel zdraví a první představení.
- `assets/characters/sap_integrator.png`: transparentní atlas podle dodané reference.
  Klid, pumpička a hod mají samostatné ořezy a kotvy chodidel. Menší postava má
  vykreslenou výšku 68 px. Chůze používá klidovou pózu s lehkým kýváním, zásah
  zastavení a bliknutí, smrt stažení a vyblednutí. Pro plně kreslené animace lze
  později nahradit `art.poses.walk/hit/defeat` dalšími snímky; nynější grafika
  zachovává referenční oblek, brýle, pleš, kravatu a odznáček zeměkoule.
- `enemy-catalog.js`: napojení samostatného chování přes `behavior:'sap'`.
- `game.js`: správné zobrazení bodové odměny z profilu.
- `index.html`, `character-preview.html/js`: načtení modulu, verze 0.8.1,
  desátá postava v porovnání se stejnými herními texturami a rozměry.

## Férovost a útoky

`config` určuje dosahy, rychlosti, časové prodlevy, gravitaci a životnost střel:

- do 76 px pumpička: nápřah 450 ms, úder za 2 energie, prodleva 2100 ms;
  kontroluje se aktuální poloha hráče v okamžiku úderu, lze odskočit či uskočit;
- do 250 px helma: 220 px/s, gravitace 330 px/s², rotace, 1 energie;
- do 460 px tři propisky: 410 px/s, mezera 150 ms, úzký hitbox, 1 energie.

Směr útoku se určí při nápřahu, takže hráč může změnit pozici. První setkání
poskytuje nejméně 1600 ms před útokem. Blízký protivník během prodlevy ustupuje.
Zásah ruší nápřah i zbytek série a přidává krátký oddech. Odchod z patra,
pozastavení či poražení nedovolí opožděné střely. Platí původní krátká
nezranitelnost hráče; nová pumpička nepřidává okamžité kontaktní poškození.
Helmy a propisky používají stávající kolize se stoly, podlahou a hráčem.
Hlášky zaznívají nejvýše přibližně jednou za 6,5–9 sekund, mimo úvodní představení.

## Testování

Statický server na portu 8000, Playwright + Chromium:

```
node tests/sap-integrator.cjs
node tests/character-preview.cjs
node tests/enemy-catalog.cjs
node tests/trio-collisions.cjs
node tests/browser.cjs
node tests/support.cjs
```

Test SAP ověřuje umístění, zachování finálního bosse, oba směry všech útoků,
nápřah a přeskočení pumpičky, oblouk helmy, tři rychlé úzké propisky,
přerušení zásahem, zrušení při změně patra, skutečné kolize hráčových CD,
500 bodů a schody do 6. patra.
