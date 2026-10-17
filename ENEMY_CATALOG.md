# Nová trojice kancelářských nepřátel — rozpracovaná integrace

Větev: `feature/office-enemy-trio`. Veřejný `main` zůstává beze změny.

**Grafické podklady zatím nebyly dodané. Všechny tři profily mají `enabled: false` a `art: null`. Nemají produkční náhradní obrázky. Nelze zatím ověřit jejich skutečný vzhled, proporce ani animace.**

## Jedno konfigurační místo

`enemy-catalog.js` exportuje `window.ITHeroEnemyCatalog`:

- `profiles`: zdraví, rychlost, hlídkování, interval a dosah útoků, skóre, poškození, typ útoku, projektil, rozměry snímku a hitbox, grafické podklady.
- `placements`: ID profilu, patro **1–9**, souřadnice X. Dosavadní nepřátelé se nemění.
- `registerAttack(type, handler)`: budoucí specializované útoky. Obsluha dostane `(scene, enemy)`.

Připravené výskyty (zatím neaktivní):

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

Po obdržení obrázků zbývá vyčistit pozadí, vyříznout a ukotvit pózy, doladit hitboxy a otestovat skutečné zobrazení, chůzi, gesta, zásah a poražení všech tří postav včetně průchodu budovou.
