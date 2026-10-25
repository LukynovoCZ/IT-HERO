# Návrh recepce podle fotografie

Schválený architektonický návrh pro přízemí, zapracovaný do hry ve verzi 0.27.0. Produkce načítá `assets/reception.png`; změna se týká pouze přízemí.

Vychází z dodané fotografie atria: bílé galerie s tmavými kancelářskými okny, vysoká skleněná stěna a světlík, větvené ocelové vzpěry, kruhové stropní prvky, recepční pult s medovými svislými lamelami, tmavě šedá dlažba a velké rostliny. Fotografie je reinterpretovaná jako pixel-art pozadí se zcela vodorovnou herní podlahou. Její původní snímek není do repozitáře kopírován.

Hratelnost zachována:

- Dveřmi ven vlevo na x=130, výtah uprostřed a schody vpravo zůstávají stávajícími herními objekty.
- Oba pevné stoly přízemí zůstávají na x=330 a x=700, se stejnými tělesy a monitory.
- Podlaha, rozměry hrdiny, protivníci, sbírání kávy/CD a ostatní patra se nemění.
- Recepční pult, zeleň a ocelové vzpěry jsou pouze pozadí, nikoli nové překážky.
- Nové pozadí používá jemnější útlum 16 %, aby zůstalo vzdušné; současné přední stoly a postavy jsou plně kontrastní.

Soubory:

- `reception-background.png`: nově vytvořená pozadí podle fotografie, bez postav a herních objektů.
- `before.png` / `after.png`: stejný seed dekorací, stejné herní měřítko a poloha hráče.
- `jump.png`: skutečný dopad hrdiny na první stůl v navržené scéně.
- `mobile.png`: pohled při viewportu 844×390.
- `scripts/reception_photo_preview.cjs`: reprodukovatelný lokální náhled. Původní verzi načítá z revize `df4dada`, novou z aktuálního kódu. Srovnávací skript nepřepisuje produkční soubory.

Spuštění při místním serveru: `IT_HERO_PREVIEW_URL=http://127.0.0.1:8005 node scripts/reception_photo_preview.cjs`.

Ověření proběhlo v Chromiu: původní a navržená scéna mají totožné polohy a rozměry všech pevných stolů, plošin, dveří i tělesa hrdiny a stejný počet protivníků. V obou variantách prošel skutečný klávesový skok a dopad na první stůl. Žádné chyby JavaScriptu.

![Návrh ve hře](after.png)

![Dopad na stůl](jump.png)

![Mobil](mobile.png)

Produkční kontrola: `tests/reception.cjs` ověřuje nové pozadí pouze v přízemí, původní rozměry a polohy, čtyři skutečné skoky s oběma hrdiny, přechod po schodech do dalšího patra a venkovní návštěvu s návratem. `tests/public-copy.mjs` kontroluje přibalení `assets/reception.png` a funkčnost veřejné distribuce.
