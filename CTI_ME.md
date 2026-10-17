# Oprava verze 0.1.1 (17. 10. 2026)

Opravena nespolehlivá reakce úvodní obrazovky na `Enter` a kliknutí.
Spuštění i pauza nyní fungují přímo přes prohlížeč (DOM), nikoli pouze přes Phaser.
Klávesy během hraní mají zároveň záložní obsluhu přes `document`.
Tlačítko na obrazovce je skutečný HTML element. Kliknutí kdekoliv na herní plochu rovněž spustí hru.

**Důležité:** Nahraď celou starou složku, ne pouze `index.html`. Verze 0.1.1 potřebuje nové `game.js` a `style.css`.
Neotvírej původní soubor 0.1.0. Vpravo nahoře musí být `BUILD 0.1.1`.

---

# IT HERO 0.1.1 — Výstup do vedení

První hratelný prototyp kancelářské 2D pixelové plošinovky v JavaScriptu a **Phaseru 3.90.0**.

## Nejjednodušší spuštění

1. Rozbal soubor `IT_HERO_0.1.zip` do vlastní složky.
2. Otevři `index.html` dvojklikem v Chrome, Edge nebo Firefoxu. Na Windows můžeš použít také `SPUSTIT_HRU.bat`.
3. **Připojení k internetu není potřeba.** Phaser 3.90.0 je přiložený ve složce `vendor`, společně s MIT licencí. Při kopírování hry zachovej i tuto složku.
4. Na úvodní obrazovce stiskni **ENTER** nebo klikni do hry.

Jako alternativu lze použít jediný soubor `IT_HERO_0.1_JEDEN_SOUBOR.html` — rozbalování není nutné, ale také vyžaduje internet kvůli Phaseru.

## Ovládání

| Klávesy | Akce |
|---|---|
| `A`, `D` nebo šipky `←`, `→` | Pohyb |
| `W`, `↑`, `mezerník` | Skok |
| `S`, `↓` | Skrčení / snížení zásahové plochy |
| `J`, `Ctrl` | Střelba datovými pakety |
| `E` u dveří | Vstup na schodiště / cíl |
| `Esc` | Pauza / pokračování |
| `M` | Zapnout / vypnout zvuky |
| `R` nebo `Enter` po konci hry | Nová hra |

## Co je implementováno

- tři kancelářská patra, postup zleva doprava / zprava doleva / zleva doprava;
- IT hrdina s pohybem, skokem, skrčením a střelbou;
- stoly jako fyzické překážky;
- sekretářky vrhající šanony, odborář a silnější manažer;
- ubývání energie, invulnerabilita krátce po zásahu, káva pro doplnění energie;
- skóre, patrová oznámení, interakce se schodištěm, finální dveře a konec hry;
- provizorní pixelová grafika tvořená přímo v JavaScriptu (bez obrázkových souborů);
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
- Grafika je záměrně provizorní a snadno nahraditelná.

**Technologie:** Phaser v3.90.0 (https://phaser.io/download/release/v3.90.0).
