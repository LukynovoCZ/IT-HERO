# Laurin a Klement, hosté na úvodu a po smrti

Schválený párový podklad `assets/characters/laurin-klement.png` vychází z uživatelem dodaných historických fotografií: Laurin vlevo s plnovousem a výkresem, Klement vpravo s knírkem a zápisníkem. `founders.js` připravuje šest společných póz do 128×84 textur se společným měřítkem a průhledností. V debatě střídá pozdrav a rozhovor nad výkresem.

Jde o přátelskou vizuální návštěvu kancelářských pater. První možnost výskytu je po 12–22 sekundách aktivního hraní, další po náhodných 22–40 sekundách od příchodu. Zobrazí se nejvýše jedna dvojice na šest sekund, včetně krátkého objevení a zmizení. Hledá místo mimo hráče, nábytek a viditelné protivníky. Pokud není místo, zkusí to později. Nemá fyzikální tělo, HP, odměnu ani útok. Nepatří do statistik zabití. Nemá zatím žádné hlášky.

Pauza zmrazí čas návštěvy. Přechod do jiného patra, smrt a konec scény odstraní návštěvu. Venkovní mezihra pauzuje hlavní scénu stejně jako ostatní prvky kanceláře.

`menu-guests.js` doplňuje do pravého panelu pouze po prohře náhodnou skutečnou herní postavu a citaci z jejího vlastního katalogu. Volí pouze postavy s dostupnými hláškami (nyní 20 podob). Sekretářky, Gen Z dvojice a Ajťák/Ajťačka sdílejí příslušný katalog. Laurin a Klement zatím do tohoto výběru nepatří, protože ještě nemají hlášky. Výběr respektuje public/původní vzhled a hlášky i při přepnutí konzolí. Nepřidává herní pokus ani jinou statistiku. Úvod, pauza a vítězná obrazovka zachovávají původní pozadí. Jméno ani nadpis se u citace nezobrazují.

Ověření: `node tests/founders-menu.cjs`, `node tests/player-choice.cjs`, `node tests/public-copy.mjs`.
