# Nová trojice kancelářských nepřátel — rozpracovaná integrace

Větev: `feature/office-enemy-trio`. Veřejný `main` zůstává beze změny.

**Bezpečák je zapnutý a používá dodaný návrh zpracovaný do transparentního atlasu. HR manažerka a designér zůstávají vypnutí (`enabled: false`, `art: null`), dokud nepřijdou jejich obrázky.**

## Jedno konfigurační místo

`enemy-catalog.js` exportuje `window.ITHeroEnemyCatalog`:

- `profiles`: zdraví, rychlost, hlídkování, interval a dosah útoků, skóre, poškození, typ útoku, projektil, rozměry snímku a hitbox, grafické podklady.
- `placements`: ID profilu, patro **1–9**, souřadnice X. Dosavadní nepřátelé se nemění.
- `registerAttack(type, handler)`: budoucí specializované útoky. Obsluha dostane `(scene, enemy)`.

Výskyty (bezpečák aktivní, zbylé dva profily čekají na obrázky):

| Profil | Patra |
|---|---|
| `security_guard` | 1, 2, 3 |
| `hr_manager` | 6, 8 |
| `design_manager` | 4, 8, 9 |

Všichni mají nyní 4 HP, 1 bod poškození a odměnu 100 bodů. Výchozí útok používá existující šanon. Žádné nové zbraně ani projektily se nevytvářejí. `attackType` vybírá obsluhu, `projectile: 'default'` znamená `folder`; později lze nastavit klíč jiné již načtené textury.

## Zapojení dodaných obrázků

Po dodání všech podkladů ulož vyčištěný transparentní atlas každé postavy do `assets/characters/`. Původní návrhy zachovej jako zdrojové podklady. Doplň například:

```js
art: {
  path: 'assets/characters/security_guard.png',
  poses: {
    idle: [x, y, width, height],
    walk: [x, y, width, height],
    stop: [x, y, width, height],
    radio: [x, y, width, height],
    hit: [x, y, width, height],
    defeat: [x, y, width, height]
  },
  anchors: {
    // Bod mezi chodidly, v souřadnicích konkrétního vyříznutého snímku.
    // Vynechaný anchor znamená střed dolní hrany snímku.
    idle: { x: footX, y: footY }
  }
}
```

Číselné hodnoty nelze určit bez skutečných obrázků. Každá póza používá stejný poměr zvětšení odvozený od klidového snímku; jednotlivé končetiny se nepřizpůsobují roztahováním. Pomocí `anchors` se vyrovná společná základní linie. Chybějící pózy mají dočasný fallback na klidový snímek; poražení se doplní krátkým fade-outem. Kontakt používá `contactPose`, útok `attackPose`. HR očekává `stop` a `documents`; design `explain` a `tablet`.

Až bude grafika ověřená, nastav `enabled: true`. Rozměry `frameWidth`, `frameHeight`, `renderHeight` a `body` dolaď podle dodaných proporcí. Dosavadní hodnoty jsou pouze příprava, nikoliv schválené zpracování návrhů.

## Integrace

Modul se načítá před `game.js`. Přidává instance do stávající fyzikální skupiny `enemies`, takže se používají dosavadní kolize s podlahou, stoly, disketami a CD. Nová větev stavů je aktivní jen u instancí s `profile`; staré postavy zůstávají v původní obsluze. Útok vyžaduje stejné patro i blízkost ve svislém směru. Poražený nepřítel má vypnuté tělo, nepřiděluje opakované skóre a po animaci je odstraněn.

## Testy a zbývající práce

Spusť lokální server na portu 8000 a `node tests/enemy-catalog.cjs`. Test používá **dosavadní grafiku jako výslovnou testovací náhradu pouze v paměti prohlížeče**; ověřuje konfiguraci, útoky v rámci patra, zásahy CD/disketami, jednorázové skóre a odstranění. Neověřuje skutečný vzhled nových postav ani konečné animační snímky.

Pro HR a designéra zbývá dodat a zpracovat obrázky, doladit hitboxy a ověřit skutečné pózy. Bezpečák používá pózy idle, STOP a chůzi s vysílačkou; chůze střídá existující pózy. Zásah využívá krátké zábleskové zvýraznění a poražení fade-out. Samostatné kreslené snímky zásahu a poražení v dodaném podkladu nejsou.

## Ověřený bezpečák

Transparentní atlas je `assets/characters/security_guard.png` (2033 × 774). Profil má snímek 80 × 96, vykreslenou výšku 92 pixelů a pevný hitbox 32 × 88. Obdélníky póz jsou v `profiles.security_guard.art.poses`; všechny se přepočítávají stejným měřítkem a ukotvují chodidly. `art.facing` zachovává správný směr původních póz při obracení postavy.

Výskyt: 1. patro X=420, 2. patro X=420, 3. patro X=450. Pozice jsou mimo vstupní bod hráče a herní stoly. `idleDuration` a `movementCycle` střídají stání/hlídání s chůzí. Zdraví a útok zůstávají výchozí.

`node tests/security-guard.cjs` používá skutečnou grafiku: kontroluje průhledné okraje, modré boty, zarovnání chodidel, pohyb, STOP při skutečném kontaktu, vysílačku při útoku, zásah hráče a zákaz útoku na jiné patro. `tests/enemy-catalog.cjs` nadále používá testovací náhrady pro zbývající profily a ověřuje jejich budoucí mechaniky.
