# Dveřmi ven – 0.21.0

V recepci (1. patro), vlevo u začátku hry, jsou skleněné dveře **Dveřmi**.
Přistup a skrč se (S / šipka dolů / palec dolů); alternativně stiskni E.
Běžné schody vpravo zůstávají stejné.

Venku nejsou nebezpeční protivníci ani časový limit. Hlavní scéna, fyzika,
časový bonus mise a rozpracované návštěvy pomocníků se pozastaví. Ovládání
zůstává stejné na PC i telefonu, střelba nikomu venku neubližuje.

- Tři CD vylepší střelbu stejně jako hlavní CD upgrade; každé navíc přidá 50 bodů.
  Hra nadále používá původní systém zbraní, nezavádí omezenou zásobu munice.
- Jedna káva doplní zdraví na maximum. IT kolega stojí pod stromem u kávy.
- U koše kouří tři kolegové, Jarda pravidelně projíždí na skládačce a musí se přeskočit. Srážka vrátí
  hráče bez ztráty zdraví do recepce s hláškou „Tam je provoz zase.“ Dva hnědí
  králíci poskakují po parkovišti. Jarda je brýlatý, pupkatý a má řídké šedé vlasy.
- Sojka sedí na větvi nad IT kolegou, střídá tři hlášky a u třetí krátce odletí.
  Texty jsou v `character-dialogue.js` pod `jay / ambient`, také v přehledu
  hlášek a formuláři návrhů. V porovnání postav je celý venkovní ansámbl.

Zpět: vlevo u dveří označených RECEPCE se skrč / stiskni E, nebo použij
**↩ Recepce** vpravo nahoře. Vrátíš se do stejného patra s CD, životy i skóre.
Při opakované návštěvě se již sebrané odměny neobnoví. Nová hra je obnoví.
Pauza přes ESC nebo mobilní tlačítko funguje i venku; vstup ani návrat nezapisují
nového hráče do statistiky a nemění označení tréninkového pokusu.

Konfigurace pozic, rychlosti kola a odměn je v `outdoor-bonus.js / config`.
Pozadí a sprity jsou v `assets/outdoor/`, rozdělené od herní logiky.

## Jardův kotrmelec — 0.23.3

Každý průjezd má 45% šanci na jeden kotrmelec mezi 5. a 9,5. sekundou
jízdy. Cyklista i skládačka se otočí o 360° během 1,1 s a pokračují stejným
směrem a rychlostí. Rotace končí přesně na 0°, se stejnou výškou kol i
původním ukotvením. Během letu se zásahová oblast posouvá s postavou;
na chodníku nezůstává neviditelný blok. Pauza zastaví celý pohyb. Při
nastaveném omezení animací v prohlížeči se kotrmelce nepoužívají.
Parametry jsou v `ITHeroOutdoor.config`: `rollChance`, `rollDuration`,
`rollLift`, `rollEarliest`, `rollLatest`. Test `tests/jarda-somersault.cjs`
ověřuje průběh, pauzu, kolizi, narovnání, pokračování a náhodný výběr.

## Králíci a střelba — 0.23.4

Kontakt hráče s králíkem spustí jednorázový komický odlet s rotací směrem od
hráče. Králík zmizí za okrajem obrazovky, do další návštěvy nádvoří se nevrací.
Bez krvavých efektů, změny zdraví nebo skóre; pauza zastaví i odlet. Parametry
jsou `rabbitKickSpeed`, `rabbitKickUp`, `rabbitGravity`.
Mobilní tlačítko střelby má 90 × 90 CSS px na výšku, 80 × 80 na šířku a
72 × 72 na malých displejích naležato. Pravý pruh pro ovládání se přizpůsobí
velikosti tlačítka, aby nezasahovalo do herního obrazu.
Testy: `tests/rabbit-kick.cjs` (oba směry, kontakt, odlet, pauza, zdraví/skóre),
`tests/thumb-controls.cjs` (skutečný dotyk, větší cíl, čtyři velikosti displeje).
