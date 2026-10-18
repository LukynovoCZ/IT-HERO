# Závěr IT HERO 0.18.0

Skutečné odpojení HDD potvrdí vítězství a přičte skóre právě jednou. Poté se
pozastaví herní scéna a spustí samostatná `ITEscape` v `ending-scene.js`.
Nepřátelé, fyzika, čas mise a dotykové akce během odletu nepokračují.

## Časování

| Čas | Akce |
|---|---|
| 0–3 s | Ajťák s HDD vyjde na střechu. |
| 3–6 s | Objeví sportovní prototyp. „Co to zas kluci z designu vyváděli?“ |
| 6–9 s | Dojde k autu, dveře se otevřou a zavřou, objeví se za volantem. |
| 9–12 s | Kola se překlopí, zapnou se trysky a auto se zvedne. |
| 12–16 s | Odlet nad Laurin & Klement kampusem. |
| 16–19 s | MISSION COMPLETE a vizuální dopočítání již potvrzeného skóre. |

Potom se otevře skutečná tabulka se zadáním jména. Stejnou cestu použije
PŘESKOČIT, Enter, mezerník nebo Escape. Skip nevolá znovu výpočet skóre.
`handleStart` během animace brání nechtěnému restartu podkladové hry.
Zvuk respektuje ztlumení, včetně M a mobilního přepínače. Skrytí stránky
zastaví čas animace; návrat neskočí o dobu strávenou v jiné aplikaci dopředu.
Časování využívá monotónní čas, aby nízké FPS zbytečně neprodlužovaly sekvenci.

Při `prefers-reduced-motion: reduce` se ukáže na 3 sekundy klidný záběr
nad kampusem, bez přesunu auta a pulzování trysek; skip funguje stejně.

## Náhled bez průchodu hrou

`ending-preview.html` používá stejnou scénu a stejné textury, ale samostatný
přehrávač. Nepoužívá `score-table.js` a nezapisuje žádný výsledek do úložiště.
Přehrání lze opakovat. Samotná hra nenabízí veřejnou zkratku pro vítězství.

## Soubory

- `ending-scene.js`: stav sekvence, časování, zvuk, skip, lifecycle a přechod
  do výsledků. `config` nahoře určuje délku a šířku auta.
- `assets/ending/`: dva místní atlasy. Pozadí a auto se načtou s hrou.
- `game.js`: preload, registrace scény a zavolání při úspěšném odpojení HDD.
- `ending-preview.html` / `.js`: samostatný přehrávač, žádné herní rekordy.
- `tests/ending.cjs`: celé přehrání, oba vstupy, ovládání a náhled.

## Ověření

Při místním HTTP serveru na portu 8000:

```
node tests/ending.cjs
node tests/score-table.cjs
node tests/gameplay.cjs
node tests/gameplay-mobile.cjs
```

Test přehraje skutečnou 19sekundovou sekvenci, kontroluje všechny fáze,
nástup a řidiče, změnu kol, kampus, zastavení skryté stránky, jeden bonus a
jediné otevření výsledků. Následně testuje Enter/mezerník, dotyk ve dvou
orientacích, zkrácenou variantu a opakovaný náhled bez uloženého skóre.
Starší testy výpočtu skóre a průchodu hrou používají viditelné tlačítko skip,
aby neopakovaly dlouhou sekvenci pro každý případ. Mobil je emulovaný v Chromium.
