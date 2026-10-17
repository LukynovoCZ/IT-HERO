# IT HERO 0.4.0 — Výstup do vedení

První hratelný prototyp kancelářské 2D pixelové plošinovky v JavaScriptu a **Phaseru 3.90.0**.

## Nejjednodušší spuštění

1. Rozbal soubor `IT_HERO_0.1.zip` do vlastní složky.
2. Otevři `index.html` dvojklikem v Chrome, Edge nebo Firefoxu. Na Windows můžeš použít také `SPUSTIT_HRU.bat`.
3. **Připojení k internetu není potřeba.** Phaser 3.90.0 je přiložený ve složce `vendor`, společně s MIT licencí. Při kopírování hry zachovej i tuto složku.
4. Na úvodní obrazovce stiskni **ENTER** nebo klikni do hry.


## Ovládání

| Klávesy | Akce |
|---|---|
| `A`, `D` nebo šipky `←`, `→` | Pohyb |
| `W`, `↑`, `mezerník` | Skok |
| `S`, `↓` | Skrčení; u schodů postup do dalšího patra |
| `J`, `Ctrl` | Střelba disketami / CD |
| `E` u dveří | Volitelná záložní obsluha schodů / cíle |
| `Esc` | Pauza / pokračování |
| `M` | Zapnout / vypnout zvuky |
| `R` nebo `Enter` po konci hry | Nová hra |

## Co je implementováno

- devět kancelářských pater s nefunkčními výtahy, střídavý postup po schodech;
- pixelová budova inspirovaná referenční fotografií;
- diskety a sbíratelné CD vylepšení ve 3., 6. a 8. patře (dvojnásobné poškození do konce hry);
- IT hrdina s pohybem, skokem, skrčením a střelbou;
- stoly jako fyzické překážky;
- sekretářky vrhající šanony, odborář a silnější manažer;
- ubývání energie, invulnerabilita krátce po zásahu, káva pro doplnění energie;
- skóre, patrová oznámení, interakce se schodištěm, finální dveře a konec hry;
- detailní pixelové postavy a prostředí v lokální složce `assets`, zelenobílá corporate paleta;
- responzivní herní plátno 960 × 540, zvuky generované v prohlížeči.

## Struktura projektu

```
IT_HERO_0.1/
├── index.html         webová stránka
├── style.css          vzhled obalu hry
├── game.js            scéna, fyzika, nepřátelé, grafika, ovládání
├── SPUSTIT_HRU.bat    volitelné spuštění na Windows
└── CTI_ME.md           tento návod
```

## Vývoj

Otevři složku ve Visual Studio Code. K úpravám postačí textový editor:

- `FLOORS` v `game.js` — výšky pater;
- `enemySpecs` v `createActors()` — pozice, odolnost a rychlost útoků nepřátel;
- `makeTextures()` — vzhled postaviček a předmětů;
- `buildOffice()` — prostředí, dveře, překážky;
- `fire()`, `enemyAttack()`, `takeDamage()` — zbraně a poškození;
- `style.css` — vzhled stránky kolem hry.

Lokální vývojový server není pro tuto konkrétní verzi nutný, ale pokud máš Python, můžeš ve složce spustit `python -m http.server 8000` a navštívit `http://localhost:8000`.

## Lokální engine a oprava spuštění

Phaser 3.90.0 je přiložen jako `vendor/phaser.min.js` z oficiálního npm balíčku `phaser@3.90.0`. Licence je v `vendor/PHASER-LICENSE.txt`. Hra tak nevyžaduje přístup k CDN.

Oprava také používá `body.setAllowGravity(false)` pro střely hráče a nepřátel: původní volání na sprite způsobovalo po startu výjimku a zastavilo herní smyčku. Pokud engine chybí, zobrazí se chybová zpráva ještě před deklarací herní scény.

## Omezení první verze

- Žádné mobilní dotykové ovládání, gamepad ani editor levelů.
- Stav a skóre se po zavření hry zatím neukládají.
- Schodiště funguje jako interaktivní přechod mezi patry, nikoli jako samostatná fyzikální minihra.
- Postavy používají lokální atlas s jednotlivými pózami; sekretářka má štíhlou blond siluetu.

**Technologie:** Phaser v3.90.0 (https://phaser.io/download/release/v3.90.0).

## Ověření v prohlížeči

Spusť `python3 -m http.server 8000 --bind 127.0.0.1`. S dostupným Node.js, balíčkem `playwright` a Chromium v `/usr/bin/chromium` spusť `node tests/browser.cjs`. Test ověřuje Enter, tlačítko, kliknutí na plátno, pohyb, střelbu, pauzu, přechody všemi devíti patry, nefunkční výtahy, sběr CD, sílu CD střely, vítězství a reset zbraně. Pro test přechodů hráče přemísťuje ke dveřím a odstraní nepřátele; nejde o kompletní dohrání soubojů.

## Záporáci a útoky

- Sekretářka střídá šanony a hrnky, na krátkou vzdálenost hází hrnky. Při doteku zvedne ruce a ječí.
- Odborář střídá kladiva a ozubená kola. Při doteku píská na modrou píšťalku.
- Manažer hází zlaté karty. Při doteku zrudne a dupe.

Kontakt ubírá jeden bod energie; krátká ochrana po zásahu brání ztrátě více bodů během jediného doteku. Reakce trvá jednu sekundu, poté nepřítel pokračuje v hlídce. Zvuky respektují klávesu M.

## Grafika verze 0.4.0

`assets/characters.png` obsahuje postavy a kontaktní pózy, `assets/office.png` kancelářské prostředí a `assets/exterior.png` budovu v menu. Ilustrace byly vytvořeny podle schváleného návrhu; původní fotografie se na web nenahrávají. Pozadí i atlas se načítají lokálně a fungují bez internetu. Při nasazení kopíruj také složku `assets`. Jednotlivé pózy se normalizují se zachováním poměru stran a společnou základní linií, vykreslování používá nearest-neighbor.

## Nové postavy verze 0.4.0

Starý ajťák je přátelský pomocník. Poprvé se objeví přibližně po 7 sekundách hraní, potom zhruba po 24–32 sekundách; po přechodu do patra přijde nejpozději za 5 sekund. Náhodně vykoukne z výtahu nebo zpod stolu, za 0,9 sekundy položí zelenozlatou plechovku Plzně nebo český párek v rohlíku (svislý rohlík, vyčnívající párek, hořčice a ubrousek). Oba dárky doplní energii do plna. Pomocník odejde po 3,5 sekundách, nesebraný dárek zmizí po 11 sekundách a poslední 3 sekundy bliká. Pauza odpočet zastaví. Při změně patra se zbývající dárky odstraní. Pomocníkovi nelze ublížit.

Modrovlasá specialistka se objevuje ve 3., 5., 7. a 8. patře. Má silnější siluetu, fialové sako a duhovou vlajku. Na dálku hází jednorožce, zblízka používá krátký duhový sprej a při kontaktu udeří vlajkou. Všechny zásahy ubírají jeden bod energie a respektují ochranu po zásahu.

`node tests/support.cjs` ověřuje oba příchody pomocníka, dárky a jejich skutečný sběr přes fyziku, plné uzdravení, pauzu, zmizení, automatický příchod i tři útoky specialistky. Test expirace posouvá herní čas; útoky volí testovanou vzdálenost přemístěním postavy. Před spuštěním testů spusť lokální server na portu 8000.

## Úvod a hlášky verze 0.4.1

Menu zobrazuje „NO MORE MEETING“ a krátké zadání mise. Pod hrou je rozbalovací úplný příběh „Operace poslední záloha“. Při smrti se losuje z deseti hlášek, každá se objeví jednou za kolo; pořadí přetrvává přes restarty scény a poslední hláška se neopakuje na začátku nového kola. Po obnovení celé stránky začíná nové losování. HTML načítá JS a CSS s verzí v URL kvůli cache. Při dalším vydání aktualizuj query verzi i BUILD společně. `node tests/intro-death.cjs` kontroluje úvod, příběh, načítanou verzi a 11 skutečných úmrtí/restartů včetně rozměrů textu.

## Patra a ovládání verze 0.5.0

U aktivních schodů se skrč pomocí S nebo ↓. V posledním patře se stejným způsobem vstupuje do cíle. Jedno podržení skrčení nespouští opakované přechody; mimo schody se jen skrčíš. E zůstává jako volitelná starší obsluha.

1. Recepce a návštěvy — vstupní lobby.
2. Administrativa — openspace za sklem.
3. Účtárna — samostatné kanceláře.
4. Projekty — chodba se zasedačkami.
5. Odbory — jednací místnosti.
6. HR — druhý openspace.
7. Právní — archivní chodba.
8. Management — kanceláře vedoucích.
9. Vedení — cílové patro.

Každé patro má vlastní rozmístění herních stolů, které respektuje i pomocník. Zadní nábytek má menší měřítko. Kávu představuje bílý hrnek se stylizovaným zeleným okřídleným symbolem; jemná pára se animuje při hraní a po sebrání zmizí. `node tests/floors.cjs` ověřuje přechody přes S a ↓ všemi patry, držení klávesy, cílovou obrazovku, skutečné sebrání kávy a animaci/úklid páry; snímky pater zapisuje do /tmp/it-hero-tests.

## Plakáty a stoly verze 0.6.0

Herní stoly mají šedé podstavce a krémově bílé desky. Modul `posters.js` generuje 12 korporátních plakátů přímo v prohlížeči; po patrech jich je rozmístěno 17, vždy 1–2 na patro. Při přiblížení se ve spodní liště zobrazí celý slogan a podtext. Texty, barvy, rozměry a pozice lze měnit v konfiguraci modulu. Postup pro přidání dalšího plakátu a testování je v `POSTERS.md`.

## Noví nepřátelé verze 0.7.0

Konfigurace v `enemy-catalog.js`: bezpečák v 1.–3. patře, HR manažerka v 6. a 8., manažer designu ve 4., 8. a 9. Nové transparentní atlasy jsou v `assets/characters/`. Od verze 0.7.1 mají vlastní střely a kontaktní efekty v `trio-attacks.js`, se zachováním původní fyziky zásahů; původní nepřátelé se zachovávají. Vzhled designéra má přísnější výraz podle zadání. Podrobný popis parametrů a testů je v `ENEMY_CATALOG.md`. Porovnání postav otevřete odkazem pod hrou nebo přes `character-preview.html`.

## Hlášky starého ajťáka (0.9.1)

Texty jsou v `game.js` v tabulce `OLD_HELPER_LINES`: `beer` pro nabídku piva,
`hotdog` pro párek a `peek` při vykouknutí. Výběr je náhodný. Hláška se při
nabídce vymění, dlouhé texty se zalamují a při odchodu postavy zmizí.
Léčení, předměty i časování návštěv zůstávají stejné.

Od 0.9.2 má starý ajťák delší čtení: nabídku položí po 1,8 s a návštěva končí
po 6,5 s. Hodnoty jsou v `OLD_HELPER_TIMING` v `game.js`. Jeho hlášky i hlášky
IT kolegy se zároveň zobrazí na 7 s ve spodním panelu. `posters.showMessage()`
dočasně překryje detail plakátu, po doznění se vrátí původní obsah podle polohy
hráče. Pauza čas hlášky zastaví a změna patra ji vyčistí.
