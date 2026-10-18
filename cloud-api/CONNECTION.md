# Připojení Cloudflare pro nasazení

## Doporučená alternativa, pokud mobilní Codex neukazuje nastavení

Není potřeba hledat tajné údaje v rozhraní Codexu. Repozitář má ručně
spouštěné nasazení `.github/workflows/deploy-community.yml`.

1. Otevři https://github.com/LukynovoCZ/IT-HERO/settings/secrets/actions
   jako vlastník repozitáře. **New repository secret**.
2. Název `CLOUDFLARE_API_TOKEN`, do pole Secret vlož vytvořený Cloudflare
   token. Potvrď Add secret. Hodnotu nikdy nevkládej do chatu nebo souboru.
3. Stejným postupem přidej `IT_HERO_ADMIN_TOKEN`: jiné soukromé heslo délky
   32 až 256 znaků pro přihlášení do správy hlášek. Ulož si ho do správce hesel.
   Není to Cloudflare token a nesmí být stejné jako on.
4. Otevři https://github.com/LukynovoCZ/IT-HERO/actions/workflows/deploy-community.yml
   → Run workflow → main → Run workflow. Na mobilu může být tlačítko níže
   nebo vyžadovat zobrazení pro počítače.
5. Po úspěchu otevři souhrn běhu. Obsahuje veřejnou adresu API. Workflow ji
   po kontrole provozu zapíše do `community-config.js` a `cloud-api/deployment.json`.
   Codex následně ověří propojení a spustí publikaci webu standardním Git pushem.
   Soukromé hodnoty tajných údajů nikdo nepotřebuje vidět.

Account ID `ff0e90e8eadd6238a7f6b31057c00a7f` je již ve workflow, není to tajný údaj.
Workflow se nespouští při běžných změnách hry. Lze ho ručně spustit přes Run workflow
nebo výslovnou změnou `cloud-api/deploy-request.json` na main. Má právo zápisu
kvůli připojení veřejné adresy API po úspěšném ověření; tajné údaje do Gitu nepíše.
Nasadí jen schránku hlášek, ne dosud navržené API pro globální skóre.

Nasazovací skript používá Cloudflare API: nejdříve ověří přístup čtením,
použije existující D1 se stejným názvem nebo vytvoří novou, přidá tabulky,
nahraje Worker a jeho privátní klíč. Po nasazení ověří CORS i přihlášené čtení.
Nepřepisuje uživatelské návrhy a nevypisuje klíče. Jestli Cloudflare odmítne
oprávnění, vypíše cestu a stav chyby; nic neoznačí za funkční bez ověření.
Při neúspěchu se konfigurace webu nemění. Při úspěchu se změní i cache klíč
konfigurace obou formulářů, aby nečetly starý prázdný endpoint.

Lokální ověření: `node tests/deploy-community.mjs` testuje průběh s náhradním
API bez kontaktování účtu. Skutečný běh Cloudflare dosud nebyl proveden.

## Alternativa: tajné údaje v prostředí Codexu


V tomto běhu nebylo nalezeno přihlášení Wrangleru ani Cloudflare proměnné.
Cloudflare účet nelze propojit prostřednictvím již existujícího GitHub přihlášení.

V návrhu nastavení prostředí byly připraveny dvě položky:

- `CLOUDFLARE_ACCOUNT_ID`: veřejné ID účtu z Cloudflare dashboardu.
- `CLOUDFLARE_API_TOKEN`: tajný API token, povolený pouze pro `api.cloudflare.com`.

Tyto údaje doplňuje vlastník v zabezpečeném nastavení prostředí, nikoli do chatu
nebo repozitáře. Potom je potřeba nastavení uložit a publikovat prostředí;
samotné připravení názvů proměnných nevytváří token a nepřipojí účet.

Token vytvořit na https://dash.cloudflare.com/profile/api-tokens pro vybraný
vlastní účet, s právem upravovat Workers Scripts, D1 a Workers Account Settings
(pro workers.dev). Nepotřebujeme Global API Key ani oprávnění měnit DNS celé domény.
Po zpřístupnění těchto údajů nejprve ověříme přístup read-only, potom nasadíme
připravený Worker a migraci z README. Doplňování soukromého klíče přímo do
`community-config.js` není řešení: tento soubor je veřejný.

Správcovský klíč schránky `ADMIN_TOKEN` je jiný údaj než Cloudflare API token.
Nastaví se jako tajná hodnota Workeru a do stránky správy se zadává soukromě.
Po nasazení se ověří skutečné odeslání z telefonu, export a mazání z PC.
Až potom lze říct, že společná schránka skutečně funguje online.
