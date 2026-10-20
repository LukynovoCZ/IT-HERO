# Hlášky postav

`character-dialogue.js` obsahuje společná data pro hru i přehled všech 13 postav.
Každá postava má `id`, `name` a `groups`; skupina má `id`, `label`, `lines`.
U existující skupiny uprav nebo přidej řetězce do `lines`. Texty se automaticky
projeví v jejím dosavadním herním použití i na `character-preview.html`.
Nový typ situace vyžaduje také napojení na herní událost; pouhé přidání dat
nový útok ani nové spouštění hlášek nezavádí. Sekretářka, odborář a původní manažer náhodně vybírají z `contact`.
Specialistka, Security master, HR a manažer designu používají `combat` při útoku i kontaktu.
Tyto hlášky jsou nad postavou 3,5 sekundy a ve spodním panelu 7 sekund;
stejná postava mluví nejvýše jednou za 7 sekund, pouze v aktuálním patře.
DBPM má vlastní skupiny `chase`, `attack`, `hit`, `demand`, bublinu se zalamováním
a vlastní aktivní časování (viz `DBPM.md`).

Pod porovnáním postav je sekce **Hlášky postav**: skutečné texty ve hře,
rozdělené podle postav a situací, včetně textů po prohře. Postavy bez vlastních
hlášek jsou výslovně označené. Editor návrhů umožňuje přidávat a upravovat texty,
ukládá rozepsané návrhy lokálně a exportuje `it-hero-hlasky.json` pro zapracování
do projektu. Tyto návrhy záměrně nemění veřejnou hru. Tlačítko obnovení vrací
návrhy na texty z aktuálního vydání. Přístup k úložišti není podmínkou exportu.

`character-dialogue-view.js` vytváří seznam a editor bezpečně přes DOM/textContent.
Zobrazení i export fungují bez externích služeb.

Ověření: `node tests/dialogue-catalogue.cjs`, `node tests/helper-dialogue.cjs`.

## Aktuální názvy postav

- `jarda`: DžejTý
- `security_guard`: Security master
- `old_badger`: SENIOR MASTER

Stejné názvy používají hra, galerie avatarů, přehled postav a katalog návrhů
hlášek. Interní ID a názvy grafických souborů zůstávají stabilní kvůli uloženým
avatarům a existujícím návrhům. Starší zadání a historické záznamy mohou
obsahovat původní jména; nejsou zdrojem názvů v aktuální hře.
