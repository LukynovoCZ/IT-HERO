# Nová trojice kancelářských nepřátel

Větev: `feature/office-enemy-trio`. Veřejný `main` zůstává beze změny.

**Všechny tři postavy jsou zapnuté ve verzi 0.7.0 a používají dodané návrhy zpracované do transparentních atlasů. Manažer designu má podle zadání přísnější výraz.**

## Jedno konfigurační místo

`enemy-catalog.js` exportuje `window.ITHeroEnemyCatalog`:

- `profiles`: zdraví, rychlost, hlídkování, interval a dosah útoků, skóre, poškození, typ útoku, projektil, rozměry snímku a hitbox, grafické podklady.
- `placements`: ID profilu, patro **1–9**, souřadnice X. Dosavadní nepřátelé se nemění.
- `registerAttack(type, handler)`: budoucí specializované útoky. Obsluha dostane `(scene, enemy)`.

Aktivní výskyty:

| Profil | Patra |
|---|---|
| `security_guard` | 1, 2, 3 |
| `hr_manager` | 6, 8 |
| `design_manager` | 4, 8, 9 |

Všichni mají nyní 4 HP, 1 bod poškození a odměnu 100 bodů. Výchozí útok používá existující šanon. Žádné nové zbraně ani projektily se nevytvářejí. `attackType` vybírá obsluhu, `projectile: 'default'` znamená `folder`; později lze nastavit klíč jiné již načtené textury.

## Zapojení dodaných obrázků

Pro případ výměny atlasu nebo přidání jiné postavy použij následující strukturu; aktuální konkrétní obdélníky už jsou vyplněné v konfiguraci. Transparentní atlasy jsou v `assets/characters/`:

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

Obdélníky a kotvy se určují v pixelech konkrétního atlasu. Každá póza používá stejný poměr zvětšení odvozený od klidového snímku; jednotlivé končetiny se nepřizpůsobují roztahováním. Pomocí `anchors` se vyrovná společná základní linie. Chybějící pózy mají dočasný fallback na klidový snímek; poražení se doplní krátkým fade-outem. Kontakt používá `contactPose`, útok `attackPose`. HR očekává `stop` a `documents`; design `explain` a `tablet`.

Přepínač `enabled` určuje, zda se profil načítá a vytváří. Všechny tři aktuální profily už mají `enabled: true`; rozměry `frameWidth`, `frameHeight`, `renderHeight`, `body` a kotvy odpovídají zpracovaným návrhům.

## Integrace

Modul se načítá před `game.js`. Přidává instance do stávající fyzikální skupiny `enemies`, takže se používají dosavadní kolize s podlahou, stoly, disketami a CD. Nová větev stavů je aktivní jen u instancí s `profile`; staré postavy zůstávají v původní obsluze. Útok vyžaduje stejné patro i blízkost ve svislém směru. Poražený nepřítel má vypnuté tělo, nepřiděluje opakované skóre a po animaci je odstraněn.

## Testy a zbývající práce

Spusť lokální server na portu 8000 a `node tests/enemy-catalog.cjs`. Test používá **dosavadní grafiku jako výslovnou testovací náhradu pouze v paměti prohlížeče**; ověřuje konfiguraci, útoky v rámci patra, zásahy CD/disketami, jednorázové skóre a odstranění. Neověřuje skutečný vzhled nových postav ani konečné animační snímky.

Všechny tři dodané sady jsou zapojené. Chybějící kreslené snímky zásahu a poražení nahrazuje záblesk a fade-out. Bezpečák používá pózy idle, STOP a chůzi s vysílačkou; chůze střídá existující pózy. Zásah využívá krátké zábleskové zvýraznění a poražení fade-out. Samostatné kreslené snímky zásahu a poražení v dodaném podkladu nejsou.

## Ověřený bezpečák

Transparentní atlas je `assets/characters/security_guard.png` (2033 × 774). Profil má snímek 80 × 96, vykreslenou výšku 92 pixelů a pevný hitbox 32 × 88. Obdélníky póz jsou v `profiles.security_guard.art.poses`; všechny se přepočítávají stejným měřítkem a ukotvují chodidly. `art.facing` zachovává správný směr původních póz při obracení postavy.

Výskyt: 1. patro X=420, 2. patro X=420, 3. patro X=450. Pozice jsou mimo vstupní bod hráče a herní stoly. `idleDuration` a `movementCycle` střídají stání/hlídání s chůzí. Zdraví a útok zůstávají výchozí.

`node tests/security-guard.cjs` používá skutečnou grafiku: kontroluje průhledné okraje, modré boty, zarovnání chodidel, pohyb, STOP při skutečném kontaktu, vysílačku při útoku, zásah hráče a zákaz útoku na jiné patro. `tests/enemy-catalog.cjs` samostatně ověřuje konfigurační kontrakt; vzhled hodnotí testy konkrétních postav.

## Ověřená HR manažerka

Transparentní atlas `assets/characters/hr_manager.png` má 1881 × 836 pixelů. Zachovává rezavé kudrny, černé brýle, lesklé černé šaty, podpatky a červené dokumenty z dodaného návrhu. Normalizované snímky mají 80 × 96, společnou výšku 92 a hitbox 26 × 88. Samostatné kotvy chodidel jsou zadané v `profiles.hr_manager.art.anchors`. Pózy: idle s rukou v bok, STOP a chůze s dokumenty. Útok používá dokumentovou pózu a stávající šanon, zásah záblesk, poražení postupné zmizení; nové zbraně nevznikají.

Je v 6. patře na X=420 a v 8. patře na X=180. `node tests/hr-manager.cjs` ověřuje skutečné textury, průhlednost, zarovnání, pohyb, kontakt se STOP, útok, poškození hráče a poražení disketami/CD se skóre. `tests/floors.cjs` kontroluje průchod všemi patry po zapojení postavy.

## Ověřený manažer designu

`assets/characters/design_manager.png` (1536 × 1024) zachovává vysokou, velmi štíhlou postavu, světle šedé vlasy, modré sako, bílou košili, tmavé kalhoty a návrhové podklady; oči, obočí a ústa mají přísnější výraz. Tři pózy: založené ruce, zdvižený ukazováček s tabletem, chůze s návrhy. Ukazováček slouží pro kontakt a tablet při útoku; chybějící zásah a poražení řeší společná animace.

Snímek má 80 × 112 pixelů, vykreslenou výšku 108 a hitbox 24 × 104. Kotvy chodidel jsou v `profiles.design_manager.art.anchors`. Je ve 4., 8. a 9. patře.

Výchozí šanon nových postav vzniká 34 pixelů nad spodní hranou jejich fyzikálního těla, aby střelba nezávisela na rozdílné výšce obrázků. Volitelný parametr `projectileOffsetY` v profilu tuto výšku přepíše. Zbraň, poškození ani běžná detekce kolizí se nemění; herní stoly střely nadále blokují.

`node tests/design-manager.cjs` ověřuje skutečné textury, průhlednost a základnu póz, hlídkování, vysvětlovací gesto při kontaktu, tablet při útoku, zásah hráče na volné trase bez stolu, poražení disketami/CD se skóre a schody za přítomnosti živého designéra. Další samostatné testy skutečné grafiky jsou `tests/security-guard.cjs` a `tests/hr-manager.cjs`.

`node tests/trio-collisions.cjs` testuje skutečné fyzikální zásahy každého finálního hitboxu přes hráčovo `fire()`: jedna CD střela a dvě diskety protivníka porazí a přidělí skóre. Pro izolovaný test zastaví jeho pohyb a útoky ostatních nepřátel; nenahrazuje detekci kolizí přímým voláním zásahu. Regresní `tests/browser.cjs` kontroluje Enter, kliknutí, ovládání, všechna patra i původní postavy.

Verze 0.7.0 obsahuje všechny tři postavy a odkaz na porovnávací scénu. Verzované URL skriptů zabrání načtení starého `game.js` po zveřejnění.

## Zkušební scéna velikostí

Otevřete `character-preview.html` přes stejný statický server jako hru, nebo klikněte
na „Zkušební scéna: porovnání postav“ pod hrou. Scéna ukazuje ajťáka a všechny tři
nové postavy vedle sebe na stejné podlaze. Nabízí pózy, pozastavení animace,
zvětšení 1×/2× a zásahové oblasti. Neobsahuje souboje.

`character-preview.js` přebírá rozměry, hitboxy a normalizované textury přímo
z `enemy-catalog.js` přes sdílenou funkci `createTextures`. Herní rozměry měňte
v profilech katalogu (`renderHeight`, `frameWidth`, `frameHeight`, `body`),
nikoliv v náhledu. Výška ajťáka odpovídá hernímu ořezu 76 px.

Ověření náhledu: `node tests/character-preview.cjs` (server na portu 8000).

## Vlastní zbraně a kontakt (0.7.1)

`trio-attacks.js` procedurálně kreslí šest pixelových střel a krátké kontaktní
animace bez externích obrázků. Profily v `enemy-catalog.js` nyní používají
`attackType: 'office-weapons'` a pole `projectiles` s položkami `key`, `weight`,
volitelnými `speed` a `spin`. Původní typ `default` zůstává dostupný.

- Bezpečák: želízka / fireball, váhy 4:1; `contactEffect: 'firewall'`.
- HR: červený střevíc / červený balonek s černým poutkem, 1:1; `contactEffect: 'whip'`.
- Design: malá golfová hůl / kalkulačka, 1:1; `contactEffect: 'scream'`.

Kontakt trvá 650 ms. Plameny a bičík mají dosah přibližně 50/62 px, respektují
stejné patro, svislou vzdálenost a stávající ochranu po zásahu. Efekty zmizí po
poražení či opuštění patra. Nové střely nesou číslo patra a při přechodu zmizí.
Skóre, zdraví a poškození se nemění. Porovnávací scéna ukazuje oba předměty pod
každou postavou a kontaktní efekty přes volbu „Zastavení hráče“.

Ověření: `node tests/trio-weapons.cjs`, `node tests/trio-collisions.cjs`.
