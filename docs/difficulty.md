# Obtížnost kampaně

Na začátku je předvolený Normal. Easy (prokikoti) má popisek „Tak abych se nepředřel“ a výslovné upozornění na vyřazení z žebříčku. Volba se uzamkne po spuštění hry a přenáší se přes checkpoint.

Easy začíná s plnou energií, nabízí zálohu při vstupu do každého patra a dvě sekundy ochrany po zásahu (Normal 1,25 s). Fyzikální krok těl protivníků a jejich střel běží na 75 %, bez změny hráče a prostředí. Odpočty mezi útoky běžných protivníků, SAP šéfa, Byznysáka a finálního manažera se prodlužují faktorem 1,3; animace a zvuk běží běžně.

Závěrečný odlet je společný. Easy poté otevře vlastní dialog s manažerem bez klobouku a létajícím autem. Nabízí nový výběr s Normal nebo návrat do menu. Starý checkpoint se smaže. Formulář výsledků ani lokální zápis nevzniknou. API odmítá explicitně jiné difficulty než normal; chybějící údaj přijímá kvůli dosavadním klientům. Jde o klientskou hru, nikoli ochranu proti úmyslnému falšování požadavků.

Ověření: `node tests/difficulty.cjs`, `node tests/difficulty-mobile.cjs`, `node tests/shared-scores.mjs`.
