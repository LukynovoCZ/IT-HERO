# Gen Z dvojice – issue #2 (0.15.0)

Původní větev `feature/gen-z-blockers`; na výslovný pokyn uživatele začleněna
do vydání 0.15.0 společně s ovladačem pod palcem.
Zadání: `tasks/GEN-Z-CODEX.md`, předloha: `assets/gen-z-duo-reference.svg`.

## Chování

Dvojice používá jednu neutrální Arcade skupinu a společný stavový automat.
První vzhled se losuje, další výskyty se střídají, takže je rozložení vyvážené.
Existuje nejvýše jedna postava. Přijde 20 px směrem do chodby, zastaví se na
5–8 sekund a sleduje mobil; střídá scrollování a vzhlédnutí. Potom pokrčí rameny,
vypne kolizi a za 500 ms vybledne. Hráč může počkat, přeskočit nebo z postavy
znovu skočit. Boční kontakt nevolá poškození ani odraz.

NPC nejsou v `enemies`, nemají HP, útok, zásah ani skóre. Diskety a CD skrz ně
procházejí; neexistuje s nimi kolize střel. Neútočí ani na ostatní postavy.

Čas běží jen při aktivním hraní. Pauza zachová fázi i zbývající čas. Změna patra,
přechod, konec hry a restart odstraňují tělo a bublinu. Blokátor navíc ustoupí,
pokud se k němu přiblíží nepřítel nebo Senior master, aby hráče neuvěznil v boji.

## Bezpečné místo

`safe()` testuje celý prostor příchodu proti nábytku, oběma schodišťovým dveřím,
výtahu, trase vozíků, DEMAND, hráči, předmětům a ostatním NPC. Hledá se bezpečné
místo v aktuálním patře; pokud není, čeká se další dvě sekundy. Příchod je z vnější
strany chodby, nikoli přes výtah. Během boje s DBPM nevznikne žádný blokátor;
páté patro s checkpointem a deváté s HDD jsou vyloučené vždy. Pomocníci také
respektují rezervované místo blokátoru při výběru místa pro občerstvení.

### Kontrola dosavadních „náhodných zarážek“

V aktuálním HEAD nejsou samostatné náhodné dočasné zarážky bez další logiky.
`gameplay.js` obsahuje trvalé servisní lávky, pohyblivé vozíky a časované dveře;
`dbpm.js` obsahuje ničitelný DEMAND a `old-badger.js` Senior mastera. Tyto prvky
jsou zachované. Nahrazení nespecifikované staré zarážky je odložené; tato verze
používá vlastní bezpečný spawn, jak dovoluje zadání.

## Kde měnit obsah

- `gen-z-blockers.js`, `config`: interval 25–45 s, doba blokování 5–8 s,
  rychlost, rozměry těla 26×64 px, vzdálenost od hráče a dveří, cooldown bubliny.
  `maxActive: 0` vypne vznik; návrh podporuje nejvýše jednu postavu.
- `art`, `preload()` a `textures()`: ilustrovaný pixel-art z atlasu
  `assets/characters/gen_z_duo.png`, průhledné snímky 64×80 px;
  dívka má zrzavé vlasy, modrou oversize mikinu a sluchátka na krku, kluk
  tmavé kudrny, šedobílou mikinu a velká sluchátka. Oba mají cargo kalhoty,
  batoh, tenisky a telefon. Sedm snímků zachovává boty na stejné základně.
  Původní předloha s popisky se nevkládá do hry; používá se nový samostatný atlas.
- `character-dialogue.js`, společné ID `gen_z`, skupiny `block`, `work`, `slang`:
  všech 20 přesných hlášek zadání. V přehledu lze číst a exportovat jejich návrhy.
- `character-preview.html`: obě varianty vedle sebe na poslední řadě, celkem
  15 postav; kontakt ukazuje scrollování a útok (bez útočné mechaniky) pokrčení ramen.

## Testování

Statická hra bez buildu a bez nových závislostí. HTTP server na portu 8000,
Playwright a Chromium `/usr/bin/chromium`.

- `node tests/gen-z.cjs`: oba vzhledy, průhlednost, sedm zarovnaných snímků,
  bezpečné místo i v reálné mapě s živými nepřáteli, jediná instance, skutečná
  boční kolize, skok přes NPC, průlet disket a CD, nulová změna HP a skóre,
  scrollování, pauza, odchod po limitu, automatické střídání a lifecycle.
- `node tests/character-preview.cjs`, `node tests/dialogue-catalogue.cjs`:
  15 postav a 14 společných sad hlášek; mobilní čitelnost, editace a export.
- Dosavadní testy `browser.cjs`, `gameplay.cjs`, `touch-controls.cjs`,
  `old-badger.cjs` a `it-colleague.cjs` ověřují spuštění, devět pater, checkpoint,
  finále, víceprsté ovládání a původní pomocníky.

Snímky `docs/gen-z-girl.png` a `docs/gen-z-boy.png` vznikají v reálném herním
patře při izolovaném browser testu; ostatní soupeři jsou v tomto testu vypnutí.

## Vizuální revize 0.14.1

Podle nově dodaných referencí: dívka má vlnité měděné vlasy, modrou otevřenou
bomber bundu s oranžovožlutými proužky přes šedé tričko, olivové cargo kalhoty,
červenobílé tenisky, batoh a sluchátka na krku. Kluk má bohaté tmavé kudrny,
světlou oversize mikinu s jednoduchým abstraktním motivem, černé cargo kalhoty,
bílé tenisky s modrým detailem, tmavý batoh a velká sluchátka na krku.
Siluety používají tvarované obrysy, stíny a zvýrazněné švy místo původních
jednoduchých obdélníků. Hlášky mají světlou komiksovou bublinu s tmavým okrajem
a špičkou. Pravidla hry, kolize, časy a texty se touto vizuální revizí nemění.

Zvětšený náhled skutečných herních snímků je `docs/gen-z-visuals-0.14.1.png`.
Znovu jej vytvoří `node scripts/render_gen_z_preview.cjs` při běžícím serveru.

## Sladění se stávajícími postavami (0.14.2)

Původní obdélníkové kreslení bylo nahrazeno atlasem `assets/characters/gen_z_duo.png`
se třemi ilustrovanými pózami každé postavy. Vychází z nové předlohy, stylu
atlasu `managers_readable.png` a uživatelova požadavku přiblížit dívku Max
Mayfield ze Stranger Things. Proporce, látky, obličeje i vlasy odpovídají
stávajícím postavám. Kluk má stejný způsob vykreslení, kudrny a světlou mikinu.

Atlas má tři sloupce (idle, walk, shrug) a dva řádky (girl, boy). `art` určuje
zdroj a mapování sedmi herních stavů. Ořezy podle alfa kanálu, odstranění
průsvitného lemu a normalizace na společnou výšku 76 px se provedou jednou
při načtení. Pohyb palce a lehké vzhlédnutí se odvozují z malovaných snímků.
Neběží žádné externí generování obrázků při hraní.

Aktuální náhled je `docs/gen-z-visuals-0.14.2.png`; soubor 0.14.1 zachycuje
předchozí návrh. Mechaniky, hitboxy, časy a dialogy zůstávají stejné.


## Vliv na hratelnost – kontrola 0.15.0

- Skok s vrcholem přibližně 106 px překoná 64px kolizi blokátoru.
  `tests/gen-z-impact.cjs` ověřuje skutečný skok z obou stran vedle stolu
  i pod jednostrannou lávkou ve druhém patře. `tests/thumb-controls.cjs`
  ověřuje přeskočení kombinací levého palce a pravého tlačítka skoku.
- Blokování trvá nejvýše 8 sekund; příchozí nepřítel nebo Senior master
  do 70 px postavu okamžitě odstraní. Nezvyšuje HP nepřátel ani poškození.
- Střely hráče skrz postavu procházejí. Checkpoint SAP v pátém a finále
  v devátém patře jsou vyloučené; živý DBPM rovněž brání výskytu.
- Interval 25–45 sekund a nejvýše jedna postava omezují zdržování. Hrubý
  podíl blokovací fáze při dostupném místě je kolem 19 % aktivního času;
  hráč může přeskočit, nemusí čekat. Časovač mise během čekání pokračuje.
- V zaplněném patře nemusí existovat bezpečné místo. Po 2 sekundách se hledá
  znovu; výskyt tedy není garantovaný v každém patře. Uvolnění prostoru po
  poražení protivníků nebo sebrání předmětů rozšíří dostupná místa. Test
  vypisuje počty bezpečných pozic s živými protivníky v každém patře.
