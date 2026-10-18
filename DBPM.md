# PROJEKŤÁK DBPM – VŠE KOMPLIKUJE (0.13.0)

Implementace zadání `tasks/DBPM-CODEX.md`. Větev `feature/dbpm-project-manager`;
změny nejsou určené k automatickému sloučení ani k publikaci na Pages před review.

## Konfigurace a rozmístění

Všechny parametry DBPM jsou v `ITHeroDBPM.config` na začátku `dbpm.js`:
HP 6, rychlost 98 px/s, 250 bodů, hranice pohybu x=55..905. Hlavní výskyt je
ve 4. patře na x=140. Druhý výskyt v 8. patře (8 HP, 105 px/s) je připraven,
ale má `enabled:false`, aby bez vyzkoušení nepřidal další těžký souboj.
Zapne se změnou této položky v `placements`. Limit je jedna aktivní postava
na aktuálním patře; ostatní instance mají vypnuté tělo a své efekty.

## Pohyb a útoky

DBPM sleduje hráče přes celé patro. Před nízkým stolem, dočasnou překážkou
nebo zavřenými dveřmi vyskočí (-530 px/s), bez teleportace a bez vypínání
kolizí jiným nepřátelům. Krátce ustupuje, pokud čeká na další útok.

- Bageta nablízko: nápřah 350 ms, zamčený směr, krátký přední hitbox 110 ms,
  poškození 1, cooldown 1,5 s. Útok lze přeskočit nebo ustoupit z dosahu.
- Notebook a bageta na dálku: střídají se, rozpoznatelné pózy, 450ms nápřah,
  různé rychlosti, gravitace, rozměry a rotace. Poškození 1 a cooldown 2,3 s.
- Všechny zásahy procházejí původní skupinou `enemyShots` a `takeDamage`, takže
  platí stávající ochrana po zásahu. Hráčovy diskety/CD dál používají `hitEnemy`.
- Nápřah lze přerušit zásahem, pauza jej zmrazí. Hodiny útoků, dialogů,
  projektilů a tabulek počítají jen aktivní hraní na dostupném patře.

DEMAND se připravuje po 12–18 s od setkání a dále v náhodných intervalech.
Jeho 500ms příprava má vlastní pózu a jednu z přesných hlášek. Na patře existuje
nejvýše jedna tabulka, 110–260 px od hráče, mimo dveře, výtah a těla postav.
Ve stísněných místech může stát na existujícím stole; celková výška zůstane
pod maximem skoku. Jinak stojí na podlaze. Vždy lze vyskočit nahoru a přejít
nebo ji rozbít dvěma disketami / jedním CD. Má 2 HP, trvá 5 s aktivního času,
a po odstranění se rozpadne na malé pixelové listy. Pokud není bezpečné místo,
počká a zkusí to znovu; nic se nespawnuje dovnitř hráče.

Změna patra, game over, porážka, restart a checkpoint uklidí vlastní střely,
hitboxy, tabulky, bubliny i efekty; boj nepoužívá nezávislé běžící časovače.
Při porážce dostane hráč 250 bodů pouze jednou, následuje krátký pád a dokumenty.
Checkpoint, SAP, finální HDD souboj a mobilní tlačítka zůstávají zachované.

## Grafika

`assets/dbpm-reference-character.svg` zůstává nedotčenou referencí ze zadání.
Podle ní byla nově vytvořena sada pixelových póz:

- `assets/characters/dbpm-source.png`: nová transparentní kresba všech póz,
  vytvořená nástrojem image generation podle dodané předlohy, nikoli kopie panelu;
- `assets/characters/dbpm.png`: runtime atlas devíti snímků 160×96, 32 barev,
  binární průhlednost, stejná stupnice a kotvení nohou; viditelná stojící postava
  má přibližně 82 px a kolizní tělo 26×80 px;
- `scripts/prepare_dbpm_sprites.py`: offline normalizace v Pillow, bez runtime
  závislosti; `python3 scripts/prepare_dbpm_sprites.py` obnoví atlas.

Pózy: idle, dvě fáze chůze, skok, bagetový nápřah, hod notebooku, hod bagety,
tvorba tabulky a komický pád. HIT používá správně ukotvený idle snímek s
krátkým bílým zábleskem a zastavením; samostatná kreslená póza zásahu je možné
budoucí grafické doladění. Levá orientace zrcadlí shodné snímky. Projektily,
tabulky a dokumenty jsou lokální generované pixelové textury.

V `character-preview.html` je třináctá postava a přidané volby pro kontrolu
skoku, hodu bagety, DEMAND, zásahu a porážky. Původních 12 postav zůstává
ve stejném pořadí. Hlášky jsou vidět a editovat ve stejném přehledu.

## Hlášky

Importovaný JSON aktualizuje přesné dodané texty ve `character-dialogue.js`,
včetně nezvyklých formulací. Nové skupiny bezpečáka, HR a design managera jsou
napojené na útok i kontakt. Sekretářka a původní manažer už střídají všechny
své kontaktní texty, nikoli pouze první položku. DBPM má čtyři skupiny situací
(chase, attack, hit, demand) obsahující všech sedm přesných textů zadání.
Bublina je pouze jedna, dlouhé texty se zalamují, čitelné jsou 4,2 s; běžný
odstup je 6,5 s. DEMAND smí nahradit aktuální bublinu bez duplikace.

## Ověření

Statická hra, žádný build. Testy používají lokální HTTP server na portu 8000,
Playwright a Chromium (`/usr/bin/chromium`).

- `node tests/dbpm.cjs`: skutečné pronásledování oběma směry přes geometrii,
  skoky, melee a úhyb, oba hody, orientace, fyzika, zásahy, překážky a lifetime,
  DEMAND (vznik, přeskočení, dvě reálné diskety, expirace), pauza, HP/CD, skóre,
  přesné texty a úklid při změně patra, smrti a restartu.
- `node tests/imported-dialogue.cjs`: všech 19 textů sedmi typů protivníků
  se skutečně vyvolá, včetně cooldownu a spodního panelu.
- `node tests/character-preview.cjs`, `node tests/dialogue-catalogue.cjs`:
  13 postav, sdílené proporce, animace a editace/export návrhů.
- `node tests/gameplay.cjs`, `node tests/sap-integrator.cjs`:
  původní checkpoint, dynamická patra, SAP a finále.
- `node tests/touch-controls.cjs`: skutečné vícebodové dotyky v Chromium,
  PC klávesnice, schody, pauza, fullscreen a čtyři mobilní rozměry.
- `node tests/it-colleague.cjs`, `node tests/helper-dialogue.cjs`: pomocníci
  a zobrazení hlášek.

Mobilní testy jsou emulace dotykového telefonu v prohlížeči, nikoli fyzické zařízení.
