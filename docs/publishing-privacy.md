# Návrh méně osobního zveřejnění – zatím bez přesunu

Doporučení: vlastní neutrální doména a samostatný web na Cloudflare Pages,
s neutrální adresou API na stejné doméně. Veřejná adresa pak nebude obsahovat
osobní GitHub přezdívku ani název workers.dev subdomény. Registrace domény
by měla mít zapnuté skrytí veřejných registračních údajů, pokud ho registrátor nabízí.

Před přesunem:

1. Připravit distribuční kopii bez `.git`, vývojových dokumentů, osobních odkazů,
   cest, screenshotů rozhraní účtů a metadat obrázků. Zachovat potřebné licence.
   Projít i viditelné titulky, komentáře, zdrojové mapy a vzorové přezdívky.
2. Zdrojový repozitář pro další vývoj může být soukromý, případně pod samostatnou
   projektovou identitou. Nový čistý repozitář sám neodstraní existující veřejnou historii.
3. Pro schránku i skóre nastavit novou neutrální API adresu a povolený původ webu
   v Workeru i nasazovacím skriptu. Soukromé tokeny dál ponechat v secrets.
4. Nejprve ověřit nový web, formulář, správu a skóre na PC i telefonu. Teprve potom
   samostatně rozhodnout o vypnutí původního GitHub Pages a veřejnosti původního repozitáře.

Dřívější veřejné commity, kopie, indexy vyhledávačů a sdílené odkazy mohou autora
nadále spojovat s hrou. Tento postup omezuje běžnou dohledatelnost nové adresy,
neposkytuje záruku anonymity ani skrytí před provozovatelem hostingu.

V této změně se doména nekupuje, hosting se nepřesouvá a nic veřejného se nemaže.

## Kontrola současné verze (0.23.8)

- Veřejná adresa hry obsahuje účet `lukynovocz.github.io`.
- `community-config.js` obsahuje API `it-hero-community.l-baborak.workers.dev`;
  tuto adresu lze vidět v síťových požadavcích prohlížeče.
- Veřejný repozitář, jeho historie a vývojová dokumentace umožňují propojení s autorem.
- Nestačí přesměrovat neutrální doménu na současnou URL ani vložit hru do iframe.

Doporučené uspořádání: `hra.neutralni-domena.cz` pro statické soubory a
`api.neutralni-domena.cz` pro stávající Worker a databázi D1. Neutrální názvy
jsou pouze příklad, doména nebyla vybrána ani registrována. Cloudflare Pages
lze naplnit přímo distribučními soubory bez zveřejnění zdrojového repozitáře.
Worker může dál používat stejnou databázi; skóre a návrhy není nutné přenášet.
Je nutné změnit veřejnou konfiguraci API, CORS i ověřování a konfiguraci
nasazovacího skriptu, který nyní používá pevně nastavený původ GitHub Pages.

Nová distribuční kopie má obsahovat jen potřebné herní soubory a licence.
Odkazy na storyboard a vývojové návody je třeba odstranit nebo upravit, aby
nový web nepublikoval dokumentaci s osobními adresami. Původní Pages a veřejný
repozitář řešit až po ověření nového webu. Vyhledávače a dřívější kopie mohou
spojení zachovat i po jejich vypnutí.

## Připravené nasazení čisté kopie

Workflow `.github/workflows/publish-neutral-copy.yml` vytváří samostatný projekt
Cloudflare Pages s neutrálním názvem odvozeným z krátkého názvu hry
v manifestu a přípony „arcade“. Původní GitHub Pages, Worker a databázi nemění. Název nové adresy se
nezapisuje do veřejného kódu ani do veřejného protokolu nasazení.

Distribuci připraví `node scripts/build_public_copy.mjs /tmp/clean-release`
(cílový adresář musí být prázdný). Obsahuje potřebné herní soubory, galerii,
formuláře a licenci Phaseru. Neobsahuje historii Git, zadání, vývojové návody,
reference ani storyboard. Textová a EXIF metadata PNG jsou odstraněna bez změny
pixelů. Konfigurace API používá pouze aktuální původ webu; pokročilý Pages Worker
obsluhuje `/v1/` přímo se stávající databází D1. Osobní workers.dev adresu
prohlížeč vůbec nepotřebuje. Web žádá vyhledávače o neindexování; nejde o ochranu
před přímým přístupem nebo porovnáním s dřívější veřejnou hrou.

Potřebná oprávnění existujícího API tokenu: **Account / Cloudflare Pages / Edit**
a přístup ke stávající databázi **Account / D1 / Read**. Oprávnění Workers Scripts
dříve používané pro komunitní API nenahrazuje oprávnění Cloudflare Pages.
Heslo správy je nadále uloženo pouze v GitHub secretu a v šifrované konfiguraci
Cloudflare. Pro novou kopii se používá stejná správa návrhů a stejná data.

Ověřená URL se ukládá do `cloud-api/public-copy-receipt.json` šifrovaně pomocí
veřejného RSA klíče `cloud-api/public-copy-receipt.pem`. Soukromý klíč nepatří do
repozitáře ani do distribuční kopie. Při ztrátě soukromého klíče lze adresu
najít ve vlastním Cloudflare dashboardu; případně vyměnit veřejný klíč a spustit
nasazení znovu. Změna správcovského hesla adresu nemění. Dřívější kopie s náhodným názvem
zůstává funkční a tento postup ji nemaže.

Regresní test `node tests/public-copy.mjs` ověřuje skutečné spuštění hry,
galerii, formulář, SQLite API, soukromou správu, odmítnutí cizího původu,
nepřítomnost vývojových souborů a nulové požadavky prohlížeče na jiné adresy.
