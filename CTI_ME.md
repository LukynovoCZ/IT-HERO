# IT HERO 0.3.0 — Výstup do vedení

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
| `S`, `↓` | Skrčení / snížení zásahové plochy |
| `J`, `Ctrl` | Střelba disketami / CD |
| `E` u dveří | Vstup na schodiště / cíl |
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

## Grafika verze 0.3.0

`assets/characters.png` obsahuje postavy a kontaktní pózy, `assets/office.png` kancelářské prostředí a `assets/exterior.png` budovu v menu. Ilustrace byly vytvořeny podle schváleného návrhu; původní fotografie se na web nenahrávají. Pozadí i atlas se načítají lokálně a fungují bez internetu. Při nasazení kopíruj také složku `assets`. Jednotlivé pózy se normalizují se zachováním poměru stran a společnou základní linií, vykreslování používá nearest-neighbor.
