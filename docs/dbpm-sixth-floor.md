# Dva Projekťáci v 6. patře — 0.23.5

Původní DBPM ve 4. patře zůstává. `ITHeroDBPM.config.placements` přidává:
- 6. patro, x=225, `encounter: sixth_first`: přítomný při vstupu do patra;
- 6. patro, výtah x=500, `encounter: sixth_second`, `after: sixth_first`:
  skrytý a bez kolizí do porážky prvního.

Po porážce prvního následuje 900 ms prodleva, otevření výtahu a 1,4 s
výstup stranou od hráče. Druhý během výstupu neútočí a jeho tělo neblokuje
průchod. Na konci se objeví na bezpečné straně výtahu a dostane obvyklou
prodlevu před prvním útokem. Hodnoty jsou `arrivalDelay`, `arrivalDuration`
a `initialDelay`; každý má dosavadních 6 životů a odměnu 250 bodů.

Text `projektaku není nikdy dost` je jednou v `character-dialogue.js`,
skupina `dbpm / arrival`. Používá společnou bublinu a spodní panel;
později jej lze upravovat či navrhovat přes stávající přehled a galerii.
Nasazovací marker obnoví seznam povolených skupin komunitní schránky.

Po celou dobu je v patře aktivní nejvýše jeden bojující DBPM.
Čas výstupu stojí při pauze. Odchod během výstupu uklidí grafiku výtahu,
postavu skryje a dokončení odloží do návratu do 6. patra. Výrok už neopakuje,
pokud zazněl při prvním pokusu. Po porážce obou se další nevytváří.
Restart a obnovení checkpointu používají stávající pravidla: dvě nové
postavy se vytvoří z konfigurace jako ostatní nepřátelé, skóre a porážky
se obnoví podle uložené zálohy, ne podle zbylého časovače výstupu.

Ověření: `tests/dbpm-sixth-floor.cjs` — dvě postavy/čekající druhý, skutečné
zásahy CD a odměny, výstup i přesný text jednou, pauza, odchod a návrat,
žádný souběžný boj ani třetí spawn. `tests/dbpm.cjs` a `tests/gameplay.cjs`
ověřují původní pohyb/útoky/překážky, checkpoint a finální souboj;
`tests/dialogue-community.mjs` kontroluje shodu katalogu a moderaci návrhů.
