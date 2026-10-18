# Ovládání na mobilu a PC – 0.15.1

Stejná hra a stejný odkaz fungují s klávesnicí i dotykem. Na zařízení s dotykem
se panel zobrazí automaticky. Tlačítkem „Dotykové ovládání“ pod hrou ho lze
zapnout i na PC nebo skrýt. Klávesnice funguje současně s dotykovým panelem.

## Mobil: plovoucí ovladač pod palcem

Výchozí režim je **Palec**. Polož levý palec do ovládacího pruhu vlevo od hry na šířku
(nebo na ovládací plochu pod hrou na výšku). Střed ovladače vznikne v místě dotyku.

- Táhni vlevo / vpravo: pohyb. Návrat ke středu: zastavení.
- Táhni dolů: skrčení, u schodů další patro, u HDD podržení pro odpojení.
- Převážně svislé tažení toleruje drobný pohyb do stran, takže hráč neujíždí od HDD.
- Táhni nahoru: skok. Šikmo nahoru: skok při pohybu. Pro další skok vrať palec
  ke středu a táhni znovu nahoru; držení nahoru neopakuje skok po dopadu.
- Šikmo dolů: pomalý pohyb ve skrčení.
- Pravé tlačítko ↑: skok; pravé ●: střelba, při držení opakovaná (i CD).
- **Palec / Tlač.** v pravém panelu přepne na původní směrová tlačítka.
- Pauza, zvuk a podporovaná celá obrazovka mají vlastní tlačítka.

Pohyb lze současně kombinovat se skokem i střelbou. Aktivní levý prst si ovladač
zachytí a sleduje ho i mimo původní plochu. Zvednutí nebo zrušení dotyku, pauza,
změna režimu, otočení telefonu a ztráta zaměření uvolní všechny příslušné akce.
Při skrytí stránky se hra pozastaví; pokračování je ruční. Krátké klepnutí na
střelbu se neztratí mezi snímky.

Na šířku je levý ovladač ve vlastním pruhu vedle plátna (128 px, na menších
telefonech 112 px). Pravá tlačítka jsou také mimo plátno. Herní obraz zachovává
poměr stran a využívá zbývající šířku, palce tedy nezakrývají dění. Na výšku je
ovladač pod hrou. Přepnutí na tlačítka obnoví původní boční pruhy. Režim se
zachová při restartu hry; obnovení stránky vybere znovu Palec.

Plná obrazovka není podmínkou. Uvolní prostor rozhraní prohlížeče, pokud ji
zařízení podporuje; některé verze Safari ji pro tento prvek nenabízejí.

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

## Nastavení palce

`stickConfig` v `touch-controls.js`: poloměr 46 CSS pixelů, mrtvá zóna 25 %,
práh nahoru i dolů 52 % a převaha svislého směru 1,1. Tyto hodnoty ovlivňují citlivost,
nikoli rychlost hráče. Jeden aktivní prst řídí pohyb; ostatní mohou mačkat akce.
Rozměry a umístění ovladače upravují `.touch-stick-*` v `style.css`.

## Ověření

Playwright s Chromium, místní server na portu 8000:

```
node tests/thumb-controls.cjs
node tests/touch-controls.cjs
node tests/gameplay-mobile.cjs
node tests/gen-z-impact.cjs
node tests/browser.cjs
node tests/gameplay.cjs
```

Nový test posílá skutečné vícebodové dotyky přes Chromium DevTools Protocol:
plovoucí střed, mrtvá zóna, všechny směry, jeden skok na gesto, tři prsty, zachycení mimo plochu,
zrušení, pauza a otočení. Ověřuje přeskočení Gen Z, schody i úplné odpojení HDD
s malou vodorovnou odchylkou palce. Samostatný test zachovává kontrolu původních
tlačítek a klávesnice. Layouty 390×844, 320×568, 844×390 a 568×320 kontrolují
minimálně 44px cíle, dostupnost pravých tlačítek, umístění kolečka mimo obraz
i ve fullscreenu a chybějící vodorovné přetečení.
Fyzický telefon zde nebyl k dispozici; ověření proběhlo v emulaci prohlížeče.
