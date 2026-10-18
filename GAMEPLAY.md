# Hratelnost 0.12.1

Samostatný modul `gameplay.js` obsahuje `ITHeroGameplay.config`, konfiguraci
průchodů `routes` a stav aktuálního pokusu. `game.js` jej napojuje na ovládání,
zásahy, přechody a vítězství. Žádná nová externí grafika ani knihovna není potřeba.

## Souboje

Automatickému hodu běžných nepřátel předchází 400 ms nápřahu, u bezpečáka,
HR manažerky a manažera designu 500 ms. Zastaví se, natočí se a objeví se žluté
vykřičníky. Zásah nebo kontakt nápřah přeruší, odchod do jiného patra jej zruší.
Pauza zastaví zbývající dobu. SAP zachovává vlastní 450ms přípravu, navíc má
stejný výrazný vykřičník. Přímé kontaktní poškození a dosavadní efekty zůstávají.
Délky nápřahů lze změnit v `config.windup`, `config.trioWindup` a v konfiguraci SAP.

## Průchody

- Patra 2, 4, 7: volitelné servisní lávky nad stoly. Lze na ně vyskočit ze stolu
  i projít pod nimi; zespodu neblokují skok. Zemní trasa zůstává průchozí.
- Patra 3 a 8: pomalu jezdící vozík. Lze jej přeskočit nebo na něm stát;
  zastavuje projektily obou stran.
- Patra 4 a 7: automatické dveře. Zavřené jsou 1,4 s, otevřené nejméně 3 s.
  Nikdy se nezavřou do hráče ani nepřítele, horní lávka je obejde.
- Kamera drží podlahu stejného patra v záběru i během skoků.

Pozice a rychlosti jsou v `routes`, patra jsou číslovaná 1–9. Léčivé předměty
se nepokládají do celé dráhy vozíku. Starý ajťák najde náhradní dostupné místo;
Senior master se u výtahu v těchto dvou patrech neobjeví, aby se nepřekrýval s vozíkem.
Oba pomocníci, původní nepřátelé i Senior master zůstávají součástí hry.

## Checkpoint

Porážka SAP aktivuje checkpoint v 5. patře a uloží skóre, zbraň a poražené
postavy na tomto patře. Při smrti Enter, kliknutí nebo dotyk obnoví přímo hru
u vstupu do 5. patra s plným zdravím. SAP a již poražení nepřátelé ze záznamu
se neobnoví, vyšší patra se obnoví; body získané po checkpointu se vrátí zpět.
Čas strávený neúspěšným pokusem se zachová. Stav je pouze pro současné otevření
hry: obnovení celé stránky začne novou misi. Vítězství checkpoint vymaže.

## Čas a finále

Čas běží jen během aktivního hraní. Bonus začíná na +1200 bodech a během
6 minut plynule klesne na nulu. Po vypršení lze normálně pokračovat a vyhrát.
Pauzy, menu a přechody mezi patry se nepočítají. Nastavení: `bonusWindow`,
`maxTimeBonus`. K výsledku se přičte jednou, spolu s dosavadním bonusem za zdraví.

V 9. patře je viditelný externí HDD u pravých dveří. Je nutné porazit původního
finálního manažera. Přiblížení k HDD poté ohlásí poslední salvu tří zlatých karet
z jeho pracovního stolu, se zřetelnou výstrahou 900 ms předem. Salvu lze přeskočit;
pokračuje, i když hráč vyskočí nebo ustoupí. Po salvě odpoj HDD podržením S / ↓,
E nebo dotykového ▼ po dobu 1,2 sekundy. Pohyb, skok, vzdálení nebo zásah postup
odpojení zruší. Ukazatel přímo ukazuje průběh. Teprve odpojení ukončí misi.
Parametry: `disconnectDuration`, `finalWarning`, `finalShotGap`, `finalRecovery`.

## Ověření

Při běžícím lokálním HTTP serveru na portu 8000:

- `node tests/gameplay.cjs`: nápřahy, pauza a přerušení, skutečný skok na lávku,
  jízda na vozíku, bezpečné dveře, CD zásah SAP, checkpoint a obnova, čas, finální
  boss, salva, přerušení odpojení, vítězné skóre a čistý nový pokus.
- `node tests/gameplay-mobile.cjs`: skutečný dotyk drženého ▼, finále a restart.
- `node tests/touch-controls.cjs`: souběžné dotyky, schody, čtyři mobilní rozměry.
- `node tests/browser.cjs`, `node tests/floors.cjs`: start, PC, průchod devíti patry.
- Dosavadní testy SAP, pomocníků, Senior mastera a zásahů zůstávají použitelné.

Mobilní ověření používá emulované dotykové zařízení v Chromium, nikoli fyzický telefon.

## Oprava schodů a lávek (0.12.1)

- Držení skrčení přes přechod patra nezablokuje další schody. Pojistka se znovu připraví po opuštění dveří; podržení u příchodu nevynechá patro.
- Neaktivní dveře jsou označeny PŘÍCHOD, pokračuje se protějšími SCHODY ↓.
- Lávky ve 2., 4. a 7. patře mají výšku 128 px a mezi díly 65 px volného prostoru. Pod lávkou je místo pro stojícího hráče i nad deskou stolu. Nahoru se skáče ze stolu.
- S / ↓ / dotykové ▼ na lávce umožní seskočit k nepřátelům. Podlaha a stoly zůstávají pevné; po seskoku je lávka znovu použitelná.
- Starý Jezevec se nově zobrazuje jako SENIOR MASTER. Interní ID `old_badger` zůstává kvůli kompatibilitě hlášek.
- Regrese: `node tests/stairs-platforms.cjs` ověřuje schody s drženým skrčením, skutečný skok ze stolu na lávku, seskočení a skok pod lávkou.

## Oprava zamrznutí po zásahu vozíku (0.13.1)

Při kolizi dynamického sprite se skupinou Phaser předává sprite jako první
argument callbacku. Původní obsluha zničila vozík místo střely a následná
aktualizace pohybu vyvolala výjimku, která zastavila herní smyčku.
Kolize nyní výslovně používají pořadí vozík/skupina a ničí druhý argument
(střelu). Oprava platí pro hráčovy i nepřátelské projektily ve 3. a 8. patře.

`node tests/cart-projectiles.cjs` ověřuje skutečné zásahy disketou, CD
a nepřátelskou střelou do obou vozíků, pokračující pohyb a herní čas,
skok i přechod ze třetího patra po kolizích.
