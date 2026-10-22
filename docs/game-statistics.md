# Spuštěné hry a největší metla ajťáctva

Hlavní stránka vedle dosavadních počtů unikátních prohlížečů zobrazuje počet jednotlivých herních pokusů a tři typy protivníků s nejvíce ukončenými hrami. U prvního je zvýrazněný portrét. Bez proher se objeví „Zatím nás nikdo nezastavil.“ Jména i portréty používají současný katalog a public/původní vzhled hry. Tři sekretářky jsou jeden typ protivníka.

Každý přechod z menu do kampaně a každá obnova checkpointu po prohře vytvoří nové náhodné UUID. Pause/resume, venkovní mezihra, obnovení viditelnosti nebo samotná návštěva stránky nový pokus nevytváří. Normal i Easy se počítají. Od začátku aktivní nesmrtelnost se nezapočítá; aktivace během hry označí aktuální pokus jako trénink a vyřadí jej i zpětně. Dosavadní statistika unikátních prohlížečů zůstává beze změny.

Protivníkovy střely si nesou stabilní `killerId`, takže smrtelný zásah lze přiřadit i po zničení jejich původce. Přímé útoky předávají stejný identifikátor do `takeDamage`. Zápis se provede jen po odebrání poslední energie, nejvýše jednou pro daný pokus. Zbytková salva v posledním patře patří manažerovi. Neznámý zdroj nevytváří vymyšlený kill.

`arcade_game_runs` uchovává náhodný identifikátor pokusu, obtížnost, příznak tréninku, typ případného protivníka a čas startu. Neobsahuje jméno hráče, stálé ID zařízení ani IP. Omezení četnosti používá dosavadní krátkodobé hashované buckety. Přehled vrací jen součty. Počty vyžadují připojení; neúspěšná telemetrie nesmí přerušit hru ani si vymyslet výsledek.

API: GET `/v1/game-stats`, POST `/v1/game-runs`, POST `/v1/game-runs/death`, POST `/v1/game-runs/training`. Měření začíná časem prvního provedení migrace 0006; migrace je idempotentní a datum při dalším nasazení neposouvá. Reset v administraci smaže pokusy i zabití a nastaví nový začátek měření. Generace resetu chrání před opožděnými zápisy starých her. Existující počty hráčů, Hall of Fame ani komentáře se samotným nasazením nemažou.

Ověření: `node tests/game-statistics.mjs`, `node tests/admin-reset.mjs`, `node tests/play-stats.mjs`, `node tests/public-copy.mjs`, `node tests/difficulty.cjs`.
