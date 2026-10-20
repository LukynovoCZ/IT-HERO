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
