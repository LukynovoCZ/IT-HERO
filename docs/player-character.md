# Hratelné postavy (0.24.0)

Před zahájením hry je nad herním oknem volba Ajťák / Ajťačka. Při novém
načtení stránky je vždy vybraný Ajťák. Volba zůstává během aktuální návštěvy
při restartu i návratu z checkpointu. Za rozehrané hry se nepřepíná.
Obě postavy mají stejné kolize, pohyb, skok, zbraně i pravidla skóre.

Ajťačka má osm vlastních póz: klid, dva kroky, skok, útok, skrčení, zásah
a porážku. Používají se také v bonusovém kole a závěrečné animaci včetně
řidiče v autě. Při zápisu výsledku je dostupný její portrét, a pokud hráč
dříve nevybral jiného avatara, nabídne se hráčce automaticky. Galerie
porovnává 25 postav; Ajťačka je v posledním řádku.

`player-character.js` řeší grafiku a výběr; fyzika nadále používá stejné
rozměry 64×80 a tělo hráče jako před přidáním volby. Obrázky pocházejí
z `assets/characters/hero-girl.png`, podle dodané předlohy.

Public odborář používá schválenou prokreslenou sadu
`assets/characters/union-public.png`, včetně píšťalky a odvozených póz.
Dřívější plošné přebarvování ani dokreslený culík se nepoužívají.
Heslo pro původní podobu dále zpřístupňuje původní atlas.

Ověření: `node tests/player-choice.cjs`, `node tests/character-preview.cjs`,
`node tests/face-anchors.cjs`, `node tests/player-avatars.cjs`,
`node tests/shared-scores.mjs`, `node tests/public-copy.mjs`.
