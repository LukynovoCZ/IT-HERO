# IT KOLEGA (0.9.0)

Druhý přátelský pomocník vedle původního starého ajťáka. Samostatná větev
`feature/it-colleague` navazuje na rozpracovanou větev s minibossem SAP v 5. patře;
veřejný web se touto větví nemění.

## Soubory a konfigurace

- `it-colleague.js`: `config`, vlastní hlášky v `quotes`, atlas v `art`, bezpečná
  místa, stavy návštěvy, komiksové bubliny, vlastní statická skupina léčivých
  předmětů a jejich sbírání. `ITHeroColleague.config` lze upravit před spuštěním.
- `assets/characters/it_colleague.png`: čtyři průhledné pózy podle dodané reference.
  IDLE, PEEK, OFFER_COFFEE, OFFER_CANDY. DISAPPEAR je návrat do PEEK se zasunutím
  a vyblednutím za 400 ms. Výška ve stoje 80 px, stejné měřítko a kotvy chodidel.
- `game.js`: načtení grafiky, vytvoření kontroleru `scene.colleague`, aktualizace
  a úklid při přechodu patra. Pravidla původního `collectAid` se nemění.
- `index.html`, `character-preview.html/js`: načtení modulu a jedenáctá postava
  v porovnání. Kontakt ukazuje bonbon, útok kávu (jen pro volbu póz v náhledu).

Výchozí hodnoty: náhodný interval návštěv 20–35 s, rozhlédnutí 750 ms, položení
předmětu po 1100 ms, délka návštěvy 2,8–3,8 s. Předmět je viditelný 10 s,
pak 2 s bliká a zmizí. Vše běží na samostatném herním čase, který stojí během
pauzy, menu a přechodu patra.

## Léčení a bezpečné místo

Káva i Sisinka přidají přesně jeden život do maxima (`config.heal:1`). Texty po
sebrání jsou `+1 ŽIVOT • KÁVA` a `+1 ŽIVOT • SISINKA`. Kelímek a červenobílý
bonbon mají vlastní procedurální textury. Starý ajťák nadále nabízí pivo a párek
s úplným doléčením; nový pomocník nesdílí jeho předměty ani časovač.

Při návštěvě se vybírá dosažitelné místo v aktuálním patře mimo stoly, platformy,
zdi, běžnou kávu, CD a předměty starého pomocníka. Poloha se ověří znovu při
položení. Pokud není volno, návštěva se odloží; předmět nevznikne v překážce.
Přechod patra odstraní předměty, bublinu a pomocníka. Postava nemá fyzikální
tělo a není ve skupině nepřátel, takže neblokuje cestu a není zasažitelná.

## Testování

Spusťte statický server na portu 8000 a použijte Playwright s Chromium:

```
node tests/it-colleague.cjs
node tests/character-preview.cjs
node tests/support.cjs
node tests/trio-collisions.cjs
```

Pro ruční zkoušku přes konzoli scény lze zavolat
`scene.colleague.spawn({source:'desk',kind:'coffee'})` nebo
`scene.colleague.spawn({source:'door',kind:'candy'})`. Kontroler má `state.clock`,
`state.nextAt`, `state.visit`, `items`, `safe(x,floor)` a `changeFloor()`.
Veřejná stránka neexportuje instanci hry; automatické testy ji zpřístupňují jen
lokální úpravou odpovědi skriptu. Běžný hráč nic nastavovat nemusí.
