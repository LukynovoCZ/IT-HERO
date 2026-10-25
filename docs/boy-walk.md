# Ajťák – plynulá chůze a střelba, 0.28.1

Zapracování schváleného návrhu: osm průhledných snímků v `assets/characters/hero-boy-walk.png`, čtyři kroky a čtyři odpovídající kroky se střeleckou rukou. Zachována zelená polokošile, rozcuchané hnědé vlasy, průkazka, batoh, džíny i tenisky.

Oba hrdinové nyní sdílejí normalizaci chůze v `player-character.js`: rámečky 64×80, společné měřítko v rámci cyklu, stejné ukotvení chodidel. Kroky řídí skutečně uražená vzdálenost, nikoli jen držení klávesy. Střelba za chůze používá stejnou fázi nohou. Ve stoje, skoku, skrčení, zásahu a porážce zůstávají původní obrázky Ajťáka.

Použito v kancelářích i venku, čtyři snímky chůze rovněž v galerii a závěrečné animaci. Výchozí Normal/Ajťák a režimy Easy/Normal/Hard se nemění. Nemění se rychlost, kolize 28×72 s offsetem 18×8, poškození, střely ani skóre.

Ověření:

- `tests/boy-walk.cjs`: skutečné ovládání doleva/doprava, čtyři fáze, pohyb při souvislé střelbě bez statické útočné pózy, skok/skrčení/stání, venkovní scéna, čtyři fáze v galerii a závěru, stejné těleso a ukotvení chodidel.
- `tests/girl-walk.cjs`: regresní kontrola stejného společného systému pro Ajťačku.
- `tests/player-choice.cjs`: výběr obou postav, mobil, související pohyby a kontinuita scény/avatara/restartu.
- `tests/public-copy.mjs`: nový spritesheet je součástí veřejného balíčku; funkční hra, galerie, API a správa.
