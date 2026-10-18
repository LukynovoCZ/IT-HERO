# Ovládání na mobilu a PC – 0.11.0

Stejná hra a stejný odkaz fungují s klávesnicí i dotykem. Na zařízení s dotykem
se panel zobrazí automaticky. Tlačítkem „Dotykové ovládání“ pod hrou ho lze
zapnout i na PC nebo skrýt. Klávesnice funguje současně s dotykovým panelem.

## Mobil

- ◀ / ▶: držení pro pohyb.
- ↑: skok.
- ▼: držení pro skrčení; u schodů přechod do dalšího patra.
- ●: střelba, při držení opakovaná. Platí i pro CD.
- Pauza / Pokračovat a zvuk mají samostatná tlačítka.
- Celá obrazovka se nabízí pouze tam, kde ji prohlížeč podporuje.

Lze současně držet pohyb, střílet a skákat třemi prsty. Prstem lze přejet mezi
směry. Opuštění panelu, zrušení dotyku, změna rozměrů nebo ztráta zaměření
uvolní držené akce. Při skrytí stránky (např. přepnutí aplikace) se hra pozastaví;
pokračování je záměrně ruční. Krátké klepnutí na střelbu se neztratí mezi snímky.

Tlačítka jsou mimo herní plátno. Rozložení na šířku využívá většinu výšky pro
hru a spodní řádek pro ovládání. Na výšku zůstává běžná stránka se čtvercovými
tlačítky pod hrou. Hru je obvykle pohodlnější hrát na šířku. Plná obrazovka
není podmínkou; například některé verze Safari ji pro tento typ prvku nenabízejí.

## PC

Původní A/D, šipky, W/mezerník, S, J/Ctrl, E a M fungují stejně. Dotykový panel
je možné zkusit i myší. Tlačítka lze procházet tabulátorem a používat Enterem
nebo mezerníkem. UI tlačítko při své aktivaci nespustí zároveň skok ve hře.

## Soubory a rozšiřování

- `touch-controls.js`: nezávislé ukazatele podle pointerId, fronta krátkých
  stisknutí, správa přerušení, pauza, zvuk, plná obrazovka a ruční volba režimu.
- `game.js`: společné akce přes `browserDown` / `browserJustPressed`, krátké
  stisky střelby i skrčení, dotyková nápověda.
- `index.html`: přístupná HTML tlačítka, skupiny a přepínač.
- `style.css`: rozložení, zvýraznění držených tlačítek, bezpečné okraje,
  portrét/landscape a fullscreen. Velikosti upravujte v pravidlech `.touch-*`.

Dotykové tlačítko používá `data-touch-action` se stejným názvem akce jako
klávesnice. Kontroler neposílá syntetické klávesové události a při restartu
odregistruje své posluchače. Nesdílí držené klávesy s prsty, takže uvolnění
jednoho způsobu vstupu nezruší jiný současně držený vstup.

## Ověření

Playwright s Chromium, místní server na portu 8000:

```
node tests/touch-controls.cjs
node tests/browser.cjs
node tests/floors.cjs
node tests/intro-death.cjs
node tests/character-preview.cjs
```

Dotykový test posílá skutečné vícebodové dotyky přes Chromium DevTools Protocol:
3 prsty současně, nezávislé uvolnění, klepnutí, skrčení, schody, pauza druhým
prstem, zvuk, fullscreen, přesun prstu, cancel, otočení, návrat ze skryté stránky
a restart. Kontroluje viewporty 390×844, 320×568, 844×390 a 568×320, minimálně 44px
ovládací cíle, neexistenci vodorovného přetečení a umístění tlačítek mimo plátno.
Fyzický telefon s Androidem ani iOS zde nebyl k dispozici; jde o browserovou
emulaci dotykového zařízení a samostatné testování desktopové klávesnice.

## Rozložení 0.11.1
Na mobilu na šířku (výška okna do 540 px) jsou tlačítka v bočních pruzích.
Herní plátno využívá celou dostupnou výšku, zachovává poměr 16:9 a tlačítka
nepřekrývají dění. Na výšku zůstávají tlačítka pod hrou. Fullscreen `[ ]`
uvolní také prostor zabraný rozhraním prohlížeče, pokud jej zařízení podporuje.
