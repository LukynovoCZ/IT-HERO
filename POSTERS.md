# Korporátní plakáty

Modul `posters.js` je načtený před `game.js`. Vše kreslí lokálně do Phaser CanvasTexture; nevyžaduje generování obrázků, síť, fonty ani balíčky. Obsahuje 12 zadaných sloganů, 17 umístění a jednoduché generické ikony bez cizích log.

## Texty, vzhled a pozice

- `definitions`: `id`, `title`, `subtitle`, `theme`, `icon`; volitelně `bgColor`, `accentColor`, `textColor`, `width`, `height` a `textureScale`.
- `defaults`: společné barvy, rozměry, vrstva a vzdálenost tooltipu. Návrh má 144 × 180 pixelů s texturou ve dvojnásobném rozlišení; `displayScale: 0.5` jej na stěně zmenší na 72 × 90 herních pixelů. `tint` tlumí barvy podle prostředí a `depth` určuje vrstvu.
- `placements`: `floor` (1 až 9), `x`, `y`, `poster` (ID definice); lze přepsat rozměry, `displayScale`, `tint` a barvy konkrétního umístění. `x` je souřadnice ve světě, `y` je posun středu plakátu vůči podlaze. Výchozí `y: -220` znamená 220 pixelů nad podlahou.
- `icon`: `chair`, `workflow`, `cloud`, `arrows`, `people`, `car`, `meeting`, `chart`, `org`, `ai`, `stamp`. Ikony kreslí samostatná funkce `icon()`.

Konfigurační seznam je dostupný také jako `window.ITHeroPosters.placements`; katalog jako `window.ITHeroPosters.definitions`. Po úpravě zdroje obnov stránku. Při publikování změň verzi `posters.js?v=…` v `index.html`, aby prohlížeč nepoužil starý modul.

## Jak přidat 13. plakát

Do pole `definitions` přidej nový objekt s jedinečným ID:

```js
{
  id: 'passwords',
  title: 'BEZPEČNOST ZAČÍNÁ\nZMĚNOU HESLA',
  subtitle: 'A končí lístečkem na monitoru.',
  theme: 'IT / security',
  bgColor: '#f0eddb',
  accentColor: '#385e81',
  textColor: '#20382d',
  icon: 'stamp',
  width: 144,
  height: 180
}
```

Do pole `placements` přidej jeho umístění. V devátém patře je zatím jen jeden plakát, takže tento záznam zachová limit 1–2 plakátů na patro:

```js
{ floor: 9, x: 750, y: -220, poster: 'passwords' }
```

Nová definice automaticky získá texturu a tooltip. Více umístění stejného vzhledu sdílí jednu texturu. Odlišné texty, barvy nebo rozměry vytvoří jinou texturu; restart scény stávající textury znovu použije.

## Integrace a případná výměna grafiky

`ITHeroPosters.mount(scene, floors, options)` vrací manager s `posters`, `tooltip`, `update(player, floorIndex, active)` a `destroy()`. Interní `floorIndex` herní scény je 0–8; konfigurace umístění používá 1–9. Tooltip se zobrazuje v dolní informační liště pouze při hraní pod blízkým plakátem ve stejném patře. Při pauze, přechodu či konci hry se skryje. Plakáty nejsou fyzikální překážky.

Pozdější ruční ilustrace lze zapojit místo `createTexture()`. Data, umístění a tooltip mohou zůstat stejné. `theme` je redakční metadata a neomezuje název nové kategorie.

## Ověření

Spusť server z kořene projektu:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

S dostupným Playwrightem a Chromium spusť `node tests/posters.cjs`. Kontroluje všech 12 přesných textů, použití všech motivů, 1–2 plakáty na každém patře, tooltip při přiblížení/pauze, vlastní 13. plakát a restart bez hromadění textur. Snímky zapisuje do `/tmp/it-hero-tests`. Test `tests/floors.cjs` dále ověřuje průchod všemi patry a kávu.
