# Připojení Cloudflare pro nasazení

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
