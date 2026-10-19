# Společná schránka návrhů hlášek

**Stav:** nasazeno 18. 10. 2026 na
`https://it-hero-community.l-baborak.workers.dev`. GitHub Actions ověřil CORS
veřejného formuláře i autorizované načtení správy a připojil adresu do
`community-config.js`. Záznam nasazení je v `deployment.json`.
Databáze D1 ukládá také společné výsledky hry. Migrace `0002_scores.sql`
přidává tabulku skóre a ponechává návrhy hlášek beze změny.

## Připomínky ke hře

Formulář nabízí také nápad, komentář a chybu / připomínku. Jeden příspěvek může
mít až 2000 znaků včetně odstavců. Ukládá se do stejné soukromé schránky
pod označením Připomínky ke hře. Export má `type: game_feedback`, `category`,
`text` a `author`; není určen k importu do hlášek postav. Platí stejné
ověřování správce, omezení odesílání a ruční vyřízení jako pro hlášky.

## Použití

- Hráč: `dialogue-suggestions.html`, nebo odkaz u konkrétní postavy v přehledu.
  Vybere postavu a situaci, napíše jednu hlášku na řádek, případně přezdívku.
  Nejvýše 10 hlášek v návrhu, 200 znaků na hlášku. Hlášky se nikdy samy nezveřejní.
- Správce: `dialogue-admin.html`. Po zadání správcovského klíče vidí čekající,
  převzaté a zamítnuté návrhy. Klíč je pouze v paměti otevřené stránky, nikoli
  v souboru konfigurace, adrese nebo localStorage; odchod ze stránky jej zahodí.
- Text v návrhu lze upravit a uložit tlačítkem **Uložit úpravy ke kontrole**.
  Uložení vždy vrátí stav na čekající; zachová autora a čas odeslání.
  Neuložené úpravy nelze exportovat ani označit jako převzaté.
- Vybrat návrhy → Exportovat vybrané JSON. Soubor `it-hero-hlasky-navrhy.json`
  používá stejnou strukturu jako dřívější export hlášek: postava → situace → lines.
  Duplicitní texty pro stejnou postavu a situaci se v exportu sloučí.
- Soubor lze předat Codexu s pokynem, které řádky převzít. Texty návrhů jsou
  nedůvěryhodná data, nikoli instrukce k provádění příkazů nebo změn projektu.
- „Označit jako převzaté“ je jen evidence; nemění `character-dialogue.js`.
  „Zamítnout“ návrh ponechá pro pozdější kontrolu. Smazání vybraných položek
  vyžaduje potvrzení a je trvalé, proto případně nejdřív exportovat zálohu.
- Načítá se po 50 návrzích, další tlačítkem Načíst další. Jedna hromadná změna
  nebo smazání přijímá nejvýše 100 ID. Není zde veřejné čtení cizích návrhů.

## Nasazení z GitHubu (bez nastavení prostředí Codexu)

[Postup přes GitHub Actions a repository secrets](CONNECTION.md) je připravený
pro mobilní rozhraní. Nevyžaduje přihlášení Wrangleru ani předání tokenu do chatu.
Skutečné nasazení nastane až po doplnění tajných údajů a ručním spuštění workflow.

## Alternativní nasazení přes Wrangler – až po připojení účtu Cloudflare

Tyto příkazy zatím nebyly spuštěné proti žádnému účtu. Správcovský klíč
se zadává zabezpečeně při `secret put`, neposílá se do chatu ani commitu.

1. V kořeni repozitáře spusť `node scripts/sync_dialogue_catalog.cjs`.
   Vygeneruje povolené postavy a situace z aktuálního herního katalogu.
2. V adresáři `cloud-api` přihlas Wrangler do vlastního účtu:
   `npx wrangler@4 login`.
3. Použij existující D1 pro komunitní data, případně vytvoř novou:
   `npx wrangler@4 d1 create it-hero-community`.
4. Zkopíruj `wrangler.example.toml` na ignorovaný `wrangler.toml`, vlož
   přidělené `database_id`. Pokud používáš existující DB, uprav i `database_name`.
5. Aplikuj pouze přidanou migraci: `npx wrangler@4 d1 migrations apply it-hero-community --remote`.
6. Vytvoř dlouhý náhodný správcovský klíč (nejméně 32 znaků) ve správci hesel
   a nastav ho příkazem `npx wrangler@4 secret put ADMIN_TOKEN`.
7. `npx wrangler@4 deploy`. Origin musí být `https://lukynovocz.github.io`,
   bez `/IT-HERO/`, protože prohlížeč posílá původ bez cesty.
8. Do `community-config.js` vlož jen veřejnou HTTPS URL Workeru jako
   `apiBaseUrl`, žádný soukromý klíč. Zveřejni změnu na GitHub Pages.
9. Z mobilu odešli zkušební návrh, na PC se přihlas do správy, exportuj ho,
   označ a smaž. Teprve tím je ověřené skutečné online nasazení.

Správce v tomto malém řešení používá sdílený soukromý klíč. Pro více správců
je vhodné později přidat Cloudflare Access s přihlášením místo ručního klíče.
Wrangler config, `.dev.vars`, lokální stav a tajné hodnoty jsou v `.gitignore`.

## API

| Cesta | Metoda | Přístup a účel |
|---|---|---|
| `/v1/dialogue-suggestions` | POST | Veřejné podání, žádné zveřejnění. |
| `/v1/admin/dialogue-suggestions?status=pending&before=123` | GET | Správce, stránka 50 položek. `before` je volitelné. |
| `/v1/admin/dialogue-suggestions` | PATCH | Správce, `{ids:[1,2],status:"accepted"}`; také pending/rejected. |
| `/v1/admin/dialogue-suggestions` | DELETE | Správce, `{ids:[1,2]}`. |

Veřejné tělo: `requestId` (UUID v4), `characterId`, `groupId`, `lines` (pole),
volitelně `author`. Úspěch 202 vrátí `id` a `status`. Při ztrátě odpovědi
opakování se stejným UUID a obsahem neudělá druhý záznam. Změna obsahu se stejným
UUID vrací 409. Změna textu ve formuláři vytvoří při dalším podání nové UUID.

Správce posílá `Authorization: Bearer …`. Server chrání GET i všechny změny;
samotná skrytá stránka ani CORS nejsou zabezpečení. Chybějící konfigurace vrací
503, chybný klíč 401, cizí origin 403, chybný vstup 400, velké tělo 413,
limit podání 429. Návrhy se vykreslují přes textContent, nikoli HTML.

Omezení: 5 nových podání na 10minutový interval/IP, každé do 10 hlášek.
Krátkodobý limit používá hash IP se serverovým tajemstvím, nikoli uloženou IP
v návrhu; staré limity se mažou. Je zde i neviditelné honeypot pole. To omezuje
běžný spam, nikoli distribuovaný útok. Pro větší provoz lze přidat Turnstile.

## Lokální ověření

Při statickém serveru na `127.0.0.1:8000`:

```
node tests/dialogue-community.mjs
node tests/dialogue-catalogue.cjs
```

První test spouští skutečný Worker přes adaptér D1 nad SQLite (`node:sqlite`,
Node 24+) a HTTP API, nikoli pouze mock vracející pevná data. Ověřuje validaci,
CORS, neveřejnost návrhů, klíče, limity, idempotenci, stavy, smazání a stránkování.
V Chromium testuje stažení JSON bez služby, reálný zápis z mobilního formuláře,
ztracenou odpověď a opakování bez duplikátu, správu v jiném prohlížeči, export,
bezpečné zobrazení textu, zrušení i potvrzení smazání a neměnnost veřejné hry.
Nejde o ověření běžícího účtu Cloudflare, to vyžaduje kroky nasazení výše.

## Společný žebříček (0.20.0)

`GET /v1/scores` veřejně vrací deset nejlepších jmen a skóre. `POST /v1/scores`
ukládá dokončený netréninkový výsledek po zadání přezdívky. ID zápisu brání
opakovanému uložení při ztracené odpovědi; jiné údaje se stejným ID vrací 409.
API ověřuje délky a rozsahy a omezuje zápisy na pět za deset minut z jedné IP;
samotnou IP neukládá. Předané skóre není ověřeno serverovým přehráním celé hry.
Žebříček je na úvodu; při výpadku zůstávají dostupné lokální výsledky.
Nasazovací skript provádí všechny přidávající SQL migrace v pořadí a ověřuje
čtení žebříčku i autorizovanou správu návrhů.

## Počty hráčů (0.20.1)

`GET /v1/play-stats` vrací unikátní prohlížeče za dnešek, aktuální kalendářní
týden od pondělí a celkem. Dny se určují na serveru v `Europe/Prague`, včetně
přechodů letního času. `POST /v1/plays` se volá až při skutečném spuštění nebo
obnovení hry, nikoliv při návštěvě stránky. Náhodné UUID zůstává v localStorage;
server ukládá jen jeho jednosměrný hash a den. Neukládá IP, jméno ani fingerprint.
Nové zařízení nebo smazaná data znamenají nový prohlížeč. Bez dostupného úložiště
se identita zachová pouze po dobu návštěvy. Historická hraní se nedopočítávají.
Migrace `0003_play_stats.sql` přidává vlastní tabulku bez změny hlášek a skóre.
Ochranný limit pro nové identity je 300 za deset minut ze stejné IP, aby bylo
možné hrát i ze sdílené firemní sítě. Opakované spuštění již započítaným
prohlížečem tento limit nespotřebovává. Hashování identit nezávisí na heslu správce.
