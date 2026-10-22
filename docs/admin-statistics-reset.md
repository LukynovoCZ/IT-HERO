# Ruční reset statistik a Hall of Fame

Po přihlášení do `dialogue-admin.html` je tlačítko **Vynulovat statistiky a Hall of Fame**. Před odesláním je nutné do potvrzovacího okna napsat `VYNULOVAT`. Samotné nasazení nové verze data nemaže.

Autorizovaný POST `/v1/admin/reset-statistics` s UUID `requestId` a `confirmation: "VYNULOVAT"` provede v jedné transakci smazání `arcade_plays`, `arcade_score_avatars` a `arcade_scores`. Následující hra se počítá znovu od nuly. Komentáře, návrhy hlášek, jejich stavy a omezení četnosti požadavků zůstávají zachované. Ukázkoví soupeři jsou dekorace a reset je neodstraňuje.

`arcade_statistics_resets` uchovává pouze identifikátor a čas operace. Opakování stejného požadavku po ztracené odpovědi už nové výsledky nemaže. Současné požadavky chrání transakce i podmínka v každém DELETE. GET `/v1/scores` vrací identifikátor posledního resetu; při nejbližším úspěšném načtení žebříčku se smaže i stará místní kopie výsledků daného prohlížeče. Zařízení bez připojení zjistí reset po opětovném připojení.

Nové návrhy statistik „Spuštěné hry“ a „Největší metla ajťáctva“ zatím nejsou implementované; reset se týká nynějších počtů unikátních hráčů a skutečných rekordů.

Testy: `node tests/admin-reset.mjs`, `node tests/shared-scores.mjs`, `node tests/play-stats.mjs`, `node tests/public-copy.mjs`.
