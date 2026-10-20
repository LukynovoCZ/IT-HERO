# Avataři hráčů — 0.23.0

Při zápisu jména a výsledku po dokončení hry si hráč vybere jeden ze 24
čtvercových portrétů. Nabídka zahrnuje všechny postavy z porovnání, včetně
tří sekretářek, obou Gen Z, Jardy, tří kolegů u koše, sojky a obou králíků.
Vybraný portrét je zvýrazněný a jeho jméno je pod galerií. Galerie funguje
klávesnicí i dotykem a pamatuje poslední volbu v tomto prohlížeči.

`avatars.js` obsahuje stabilní ID, názvy a odkazy na původní herní textury.
V žebříčku na úvodu i po zápisu se kreslí stejné portréty; vzhled respektuje
veřejnou/původní variantu zvolenou prohlížejícím hráčem. Neukládají se libovolné
obrázky ani odkazy, pouze ověřené ID postavy. Starší či neznámý lokální údaj
se zobrazí jako výchozí ajťák. Ukázkové jméno Lukynovo je změněno na Poldajede
v jednom společném seznamu pro úvod i závěr. Skutečné hráčské přezdívky se nemění.

Lokální záznam dostal pole `avatar`. API `GET /v1/scores` jej vrací také;
`POST /v1/scores` jej přijímá z pevného seznamu. Chybějící pole starších klientů
znamená `hero`. Neplatné ID se odmítá. Avatar je součástí kontroly idempotence:
stejný požadavek s jiným avatarem vrátí konflikt, ne druhý výsledek.

Migrace `0004_score_avatars.sql` vytváří samostatnou tabulku přiřazení podle
`request_id`. Je opakovatelná, nepřepisuje ani nemaže původní skóre, hlášky
či statistiky. Nový výsledek a avatar se zapisují v jedné D1 transakci (`batch`).
Starší výsledky bez záznamu dostávají při čtení výchozí ID `hero`.
Seznam pro API regeneruje `node scripts/sync_avatar_catalog.cjs`; nasazovací
skript nově přibaluje také `cloud-api/avatar-ids.mjs`.

Jardovy dvě šlapací pózy v `assets/outdoor/jarda-poses.png` jsou upravené bez
knírku. Ostatní čtyři postavy atlasu se stále čtou z původního zdroje, tedy
nezmění vzhled. Zůstávají rozcuchané vlasy, křivé brýle a mechanika přeskočení.

Ověření:
- `tests/player-avatars.cjs`: všech 24 portrétů obsahuje grafiku; starší
  výsledky mají výchozí portrét; reálný dotykový výběr, jméno, lokální
  záznam, odeslané ID, úvodní pořadí a přetrvání po obnovení stránky.
- `tests/shared-scores.mjs`: skutečné SQLite, opakované migrace, shoda
  seznamů klient/API, validace, avatar čtený jiným klientem, idempotence,
  konflikt při změně avatara, řazení, omezení četnosti a odmítnutí tréninku.
- `tests/score-table.cjs`: deset ukázkových jmen, výběr Jardy, ukládání,
  české jméno, opakované odeslání, TOP 10, blokované úložiště a mobilní rozměry.
- `tests/deploy-community.mjs`, `tests/dialogue-community.mjs`: balení Workeru,
  nasazovací tok a nezměněné návrhy hlášek/moderace.
- `tests/outdoor-bonus.cjs`: zarovnání kol obou Jardových póz, pohyb, odměny,
  návrat a emulované dotykové ovládání.
- `tests/manager-hall-bowler.cjs`: Poldajede ve společném seznamu, správné
  označení ukázkových soupeřů, pálka, zásah zblízka a veřejná buřinka.

## Hall of Fame — 0.23.1

Horní galerie již není pevný seznam názvů postav. Čte stejné seřazené
výsledky jako tabulka a ukazuje prvních šest jmen, skóre a vybraných avatarů.
Při zápisu nového výsledku se obě místa přepočítají společně.
Pokud je skutečných výsledků méně než šest, zbytek doplní označení ukázkoví
soupeři ze stejné tabulky. Jejich body jsou pod posledním skutečným výsledkem;
bez výsledků se použije dosavadní ukázkové pořadí kydla, zulupapa, dezecejvan…
Ukázkové portréty se vybírají náhodně ze všech avatarů, první přiřazení je
uložené v prohlížeči (ne ve skóre), takže při obnovení nepřeskakují.
`tests/hall-ranking.cjs` ověřuje propojení, pořadí, body, výchozí jména,
platné náhodné avatary, jejich stabilitu po obnovení a přepočet po změně skóre.
