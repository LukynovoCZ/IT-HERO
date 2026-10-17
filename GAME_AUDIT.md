# Kontrola celé hry – verze 0.10.1

## Příčina rozdílu mezi zadáním a veřejnou hrou

Na začátku kontroly byla vzdálená hlavní větev na `f0f8f59` (BUILD 0.7.2).
Veřejná hra proto ještě neobsahovala navazující změny připravené v pracovních
větvích. Společná verze 0.10.1 zahrnuje:

- IT kolegu s kávou a Sisinkou za +1 život;
- Starého jezevce se štítem proti střelám a porážkou skokem;
- čitelnější atlas HR a design manažera `managers_readable.png`;
- nové hlášky starého ajťáka, delší zobrazení nad postavou a spodní panel;
- Šéfa SAP v 5. patře, finálního šéfa nadále v 9. patře;
- porovnání všech 12 postav.

## Nalezená a opravená chyba mechanismu

Přechod po schodech dříve přepisoval `nextHelperAt` nejvýše na čas za 5 sekund.
Tím se při postupu budovou rušil interval 24–32 sekund mezi návštěvami starého
ajťáka. Tento přepis je odstraněný. První návštěva zůstává po 7 sekundách,
další příchody zachovávají původní rozestupy i po přechodu do dalšího patra.
Regresní test provádí skutečný přechod po schodech a kontroluje zachování termínu.

## Automatické příchody v běžící hře

`tests/natural-appearances.cjs` nevolá `spawn()`, nepřepisuje časovače a nevypíná
nepřátele. Hráč se běžným ovládáním skrčí, aby při čekání uhýbal střelám.
Pozorované první příchody v úspěšném běhu:

| Postava | Aktivní herní čas |
|---|---:|
| Starý ajťák | 7,04 s |
| IT kolega | 29,36 s |
| Starý Jezevec | 33,61 s |

Náhodné termíny dalších běhů se liší. IT kolega má interval 20–35 s, Jezevec
25–45 s. Jezevec odloží příchod, pokud hráč stojí u výtahu nebo ho právě používá
starý ajťák. Menu, pauza a přechod patra zastavují čas nových postav.

## Rozsah ověření

Celkem 17 testovacích souborů v Chromium/Playwright:

- start Enterem, tlačítkem a kliknutím do hry; pohyb, skok, skrčení, střelba,
  pauza, obnovení a případ chybějícího enginu;
- všech 9 pater, S/šipka dolů na schodech, ochrana proti opakovanému přechodu,
  CD, vítězství a restart;
- skutečné útoky i kontakty sekretářky, odboráře, manažera a specialistky;
- bezpečák, HR a design manažer: grafika, zarovnání, útoky, vlastní střely,
  zásahy disket/CD, poražení a skóre;
- SAP: všechny tři útoky oběma směry, prodlevy, úhyb před pumpičkou, přerušení
  útoku, poražení, 500 bodů a pokračování z 5. do 6. patra;
- Jezevec: příchod, pohyb, blokování obou hráčových zbraní, chráněný cíl za ním,
  průlet nepřátelských střel, neškodný boční kontakt, dopad na pohybující se
  postavu, odraz, propadnutí, 150 bodů právě jednou a úklid;
- oba pomocníci, skutečné sbírání předmětů, +1 oproti úplnému léčení, maximum
  zdraví, blikání, expirace, pauza a bezpečné umístění ve všech patrech;
- hlášky nad postavou i dole, délka, zalomení, obnovení plakátu a změna patra;
- plakáty, tooltipy, pára z kávy, 11 skutečných úmrtí se střídáním hlášek;
- porovnávací scéna se 12 postavami, stejné základny, skutečné velikosti,
  pózy, zvětšení, zastavení a hitboxy.

Při celkové zátěži se opravil také způsob pozorování krátké série propisek
v testu SAP: snímek se nyní pořizuje přímo v okamžiku dokončení série, aby
kontrola neproběhla až po vypršení první střely. Hodnoty ani počet útoků ve hře
se tím nemění.

## Zveřejnění a kontrola verze

Tato společná verze se zveřejňuje přes `main`, ze které je nastavený GitHub
Pages. HTML i URL skriptů používají BUILD 0.10.1, aby prohlížeč nepoužil staré
herní skripty. Dřívější zmínky o nezveřejněných pracovních větvích v dokumentaci
jednotlivých postav byly aktualizovány.

Po dokončení sestavení Pages musí hlavní stránka zobrazovat BUILD 0.10.1 a
porovnání obsahovat 12 postav. Přímé HTTP ověření domény GitHub Pages je z tohoto
cloudového prostředí blokováno síťovou bránou (403); není to zjištěná HTTP chyba
samotné hry. Funkce se ověřují v prohlížeči nad stejnými soubory z hlavní větve.
