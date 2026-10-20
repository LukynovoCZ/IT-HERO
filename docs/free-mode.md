# Volný režim a konzole – 0.20.0

Výchozí grafiku vybírá `appearance-mode.js`. Hnědý culík odboráře, bradka
manažera, vlajka specialistky se smajlíkem, zatočený knír design manažera,
tmavá patka SAP šéfa a buřinka s modrým svetrem Senior mastera jsou samostatné
textury. Původní textury, rozměry, ukotvení, snímky a kolize zůstávají zachovány.
Ostatní postavy se nemění. Stejná volba se promítá do portrétů na úvodu.

Konzole: klávesa pod Esc (Backquote), pět rychlých klepnutí na BUILD nebo
pět klepnutí na IT HERO vlevo nahoře přímo ve hře. Na mobilu použij IT HERO.
Konzole hru pozastaví a po zavření obnoví předchozí stav.

- `skodatonevidet`: přepíná volný a původní vzhled všech šesti postav.
- `iddqd`: přepíná nesmrtelnost. Celý rozehraný pokus zůstane tréninkový i po
  vypnutí kódu, včetně pokračování z checkpointu. Lokální ani společné skóre
  se neuloží. Nová hra s vypnutou nesmrtelností je opět hodnocená.

Kódy se vyhodnocují pevným seznamem, nikoli jako JavaScript. Nejde o zabezpečení
původních obrázků; ty jsou stále součástí klientské hry.

`final-manager.js`: windup 600 ms, pumpička nablízko, helmy po oblouku,
série tří propisek, tři pingpongové míčky s odpalem pálkou a výskok s úderem.
Zásah bosse i odchod z patra ruší rozpracovaný útok. Po útoku je pauza.
Parametry jsou nahoře v `config`. Původní finální salva u HDD zůstává zachována.

Odborář má při zásahu 30% šanci pustit kávu, nejvýše jednou za 12 sekund.
Hledá volné místo na podlaze, káva zmizí po 12 sekundách a léčí +1 jako běžná káva.
Hlášky jsou v `character-dialogue.js`, kontakt design manažera má vlastní skupinu.

`lobby.js` kreslí portréty a načítá společné TOP 10 přes `/v1/scores`.
Závěrečná tabulka uchovává také lokální výsledek. Společný zápis proběhne až po
zadání jména; při výpadku nabídne opakování se stejným ID bez duplicit.
API ukládá jen ID zápisu, přezdívku, score, délku hry a čas. Veřejně vrací jméno
se skóre, nejvýše deset řádků; žádné IP ani administrátorský klíč.
Výsledky jsou komunitní z klientské hry, nikoliv serverově ověřené záznamy replaye.
