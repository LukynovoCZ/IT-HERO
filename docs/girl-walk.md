# Plynulá chůze Ajťačky – 0.26.9

Původní dva obrázky měly podobnou pozici nohou, každý se samostatně škáloval podle vlastního obrysu a při výstřelu se na 160 ms z 240ms intervalu celá postava přepnula do statické střelecké pózy. To působilo jako šoupání a střídání velikosti postavy.

Nový průhledný spritesheet `assets/characters/hero-girl-walk.png` obsahuje čtyři fáze chůze a čtyři odpovídající fáze chůze se střeleckou rukou. Všechny se normalizují společným měřítkem na rámečky 64×80, s nohama na stejné spodní hraně. Fyzika zůstává 28×72, offset 18×8.

`ITHeroPlayer.movementKey` řídí kroky podle skutečné vodorovné vzdálenosti (18 px/fáze); stav je vázaný na konkrétní sprite, takže se nepřenáší mezi scénami ani restarty. Pohyb do zdi nepřičítá vzdálenost, zastavení vrací klid a přemístění mezi patry nevytváří falešný krok. `attackKey` zachová fázi nohou při výstřelu; skrčení nepřepíná na stojící postavu. Stejný mechanismus používají kanceláře a venkovní scéna. Galerie a závěrečná animace používají čtyři snímky prostřednictvím `cycleKey`.

Původní pózy pro klid, samostatnou střelbu, skok, skrčení, zásah a porážku jsou zachované. Ajťák má původní grafiku a pravidla pohybu.

Ověření:

- `tests/girl-walk.cjs`: skutečné klávesové ovládání v obou směrech, všechny čtyři fáze, chůze při střelbě bez statických póz, venkovní scéna, přechody klid/skok/skrčení, čtyři fáze galerie, společná spodní hrana a měřítko, nezměněné těleso, žádné chyby prohlížeče.
- `tests/player-choice.cjs`: oba hráči, mobil, skok/skrčení/střelba/zásah, venkovní scéna, čtyřfázová chůze Ajťačky v závěru, avatar a restart.
- `tests/public-copy.mjs`: veřejný balíček obsahuje nový spritesheet, hra i galerie fungují, zachováno API a moderace, žádné externí požadavky.

Testovací server lze zadat proměnnou `IT_HERO_PREVIEW_URL`.
