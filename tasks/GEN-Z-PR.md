## Gen Z dvojice jako dočasné neutrální blokátory

Closes #2

Přidává GEN Z HOLKU a KLUČINU podle `tasks/GEN-Z-CODEX.md` a předlohy
`assets/gen-z-duo-reference.svg`. Postavy po bezpečném příchodu 5–8 sekund
scrollují uprostřed chodby, komentují situaci a odejdou. Hráč je může přeskočit
nebo počkat; kontakt neškodí a diskety/CD procházejí. Nemají HP ani skóre.

- Společná logika a kolize pro oba vzhledy, nejvýše jedna instance, vyvážené
  střídání, interval 25–45 sekund aktivního hraní; pauza čas nezapočítává.
- Bezpečnost testuje celý příchod, dveře, výtah, hráče, nábytek, vozíky,
  DEMAND, předměty a další NPC. Při přiblížení nepřítele blokátor ustoupí.
  Nevzniká při boji s DBPM, na checkpointovém pátém ani závěrečném devátém patře.
- Sedm průhledných procedurálních pixelových snímků obou variant; boty mají
  stejnou základnu, oba sprity výšku 76 px. Telefon zůstává v ruce.
- 20 přesných hlášek ve společné sekci `gen_z`, editor a přehled všech 15 postav.
- Bez nových závislostí a externích API. Konfigurace, grafika a lifecycle jsou
  v `gen-z-blockers.js`; popis a nastavení jsou v `GEN_Z.md`.

### Původní překážky

V aktuálním HEAD nebyl nalezen samostatný systém dočasných náhodných zarážek,
které by šlo bezpečně nahradit. Servisní lávky, vozíky, časované dveře, Senior
master i DEMAND zůstávají zachované; náhrada blíže neurčené staré zarážky je
odložena a NPC mají vlastní spawn systém.

### Ukázky obou variant

Izolovaný browser test v reálném herním patře, ostatní soupeři jsou vypnutí.

![Gen Z holka](https://github.com/LukynovoCZ/IT-HERO/blob/feature/gen-z-blockers/docs/gen-z-girl.png?raw=true)
![Gen Z klučina](https://github.com/LukynovoCZ/IT-HERO/blob/feature/gen-z-blockers/docs/gen-z-boy.png?raw=true)

### Ověření v Chromium / Playwright

- `node tests/gen-z.cjs`: skutečná kolize, skok přes oba vzhledy, průlet obou
  zbraní, nulové poškození a skóre, bezpečný spawn, časování, scrollování,
  pauza a úklid při přechodu/game over/restartu.
- `node tests/character-preview.cjs` a `node tests/dialogue-catalogue.cjs`:
  15 postav, 14 sad hlášek, společné základny, mobilní verze, editace a export.
- `node tests/browser.cjs` a `node tests/gameplay.cjs`: Enter/kliknutí,
  devět pater, původní útoky, checkpoint, bossové a závěr mise.
- `node tests/touch-controls.cjs`: skutečné víceprsté dotyky v emulovaném mobilu,
  čtyři rozměry, PC ovládání, schody, pauza, rotace a restart.
- `node tests/old-badger.cjs` a `node tests/it-colleague.cjs`: oba původní
  pomocníci, sbírání a léčba, pauza a úklid.

Mobil je testovaný emulací v prohlížeči, ne fyzickým telefonem.
**Neslučovat automaticky.**

### Vizuální revize podle nových uživatelských předloh (0.14.1)

Detailnější vlnité zrzavé vlasy, modrá bomber bunda, olivové cargo kalhoty a
červenobílé tenisky u dívky; tmavé kudrny, světlá mikina, černé cargo kalhoty
a bílé tenisky u kluka. Oba mají čitelný batoh, sluchátka na krku a mobil.
Nové světlé komiksové bubliny. Bez změn mechanik či kolizí.

![Gen Z – skutečné herní snímky 3×](https://github.com/LukynovoCZ/IT-HERO/blob/feature/gen-z-blockers/docs/gen-z-visuals-0.14.1.png?raw=true)
