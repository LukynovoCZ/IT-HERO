# Korporátní hlášky — 0.22.0 (větev pro kontrolu)

Zadání uvádí 44 hlášek, ale seznam obsahuje **40 neprázdných výroků**.
Nadpisy DBPM / SAP / Senior / HR / sekretářka / bezpečák se rozcházejí
s počtem odrážek. Přidány jsou všechny skutečně vypsané texty, nic navíc.
Prázdná odrážka sekretářky není hláška. `&#x20;` je dekódováno na skutečnou
koncovou mezeru (dvě hlášky); `< >` není HTML — přesný text je `mám v <> nějaký péří`.

| Postava | Přidáno | Události |
| --- | ---: | --- |
| Projekťák DBPM | 9 | chase, attack, hit, nová defeat |
| Šéf SAP | 5 | combat, nové melee, hit, strong |
| Manažer designu | 4 | combat, contact, nová ambient |
| Finální manažer | 4 | nové intro, special, phase |
| Odborář | 3 | nové attack, hit, repeated_hit |
| Senior master | 3 | block, nové pause, rage |
| Starý ajťák | 2 | peek |
| IT kolega | 2 | coffee, candy |
| HR manažerka | 3 | combat |
| Sekretářka (všechny tři vzhledy) | 3 | contact |
| Bezpečák | 2 | combat |
| **Celkem** | **40** | |

## Texty a časování

Texty se mění pouze v `character-dialogue.js`. Hra, přehled, galerie i návrhové
formuláře čtou `ITHeroDialogue.lines(id, group)`. Nové skupiny pro schránku
návrhů regeneruje `node scripts/sync_dialogue_catalog.cjs`.
Při sloučení PR marker `cloud-api/deploy-request.json` spustí existující workflow
pro nasazení rozšířeného seznamu povolených skupin. Databázová data se nemění.
V této větvi se produkční databáze ani GitHub Pages nenasazují.

`dialogue-runtime.js` rozšiřuje stejné API o `pick`, `duration`, `layout`, `create`.
Nejde o druhý katalog. Konfigurace četnosti je `ITHeroDialogue.config`:
- jedna aktivní bublina v celé hlavní scéně;
- běžná postava 7–10 s mezi výroky, mezera 600 ms mezi různými postavami;
- výběr bez bezprostředního opakování, historie podle ID postavy i mezi návštěvami;
- váha textu nad 60 znaků 0,5, nad 80 znaků 0,2 (běžná váha 1);
- do 35 znaků 2,8 s, do 80 znaků 4 s, delší 4,4–6 s;
- bublina 270 px, písmo 14 px, kontrastní tmavé pozadí, zalamování;
- u textu nad 120 znaků zkrácený náhled s výpustkou, plný originál v panelu;
- umístění sleduje postavu a kameru, zůstává pod horními HUD/miniboss panely
  a nad spodním panelem; galerie používá stejný renderer.

Při pauze se bublina skryje a její čas stojí. Patro, přechod, prohra, výhra
nebo restart ji odstraní. Žádná dialogová funkce nezastavuje souboj ani nemění
rychlost, kolize, poškození či časování útoků. Je-li místo pro bublinu obsazené,
obyčejná replika se přeskočí, nefrontuje se do pozdějšího, nesouvisejícího okamžiku.
Předání pomocníka a intro/změna fáze finálního bosse mohou předchozí bublinu
nahradit. V jednu chvíli zůstává viditelná pouze jedna.

Starý ajťák řekne jednu hlášku při předání: ve 35 % návštěv z `peek`, jinak
z nabídky příslušného předmětu. Kvůli dřívějšímu požadavku na delší čtení
zůstává jeho bublina 5,5 s; léčení na maximum se nemění. IT kolega mluví při
předání kávy/Sisinky, stále léčí o 1. Jeho bublina může doznít po odchodu.

SAP má „dívám se na to holisticky“ ve skupině `melee`, takže tato replika je
navázaná přímo na nápřah pumpičkou; `strong` na trojici propisek, `hit` na zásah.
Finální manažer používá intro při prvním útoku, phase při překročení prahů 4 a 2
životů a special při dalších nápřazích. Původní attack/cancel/update se zachovávají.
Design komentuje chůzi nejvýše po 14 s, kontakt má vlastní skupinu.
Seniorovo počítadlo zablokovaných střel pouze vybere `rage` při každé páté
střele. Ve výchozím HEAD není samostatná mechanika zuřivosti; nepřidáváme ji
kvůli dialogům. Nezranitelnost, blokování a porážka skokem na hlavu se nemění.

V zadání není uvedeno znění zvláštní dlouhé repliky DBPM při kritickém zdraví.
Není domyšleno. Obecný renderer dlouhé texty podporuje a test používá jasně
zkušební text, který se neukládá do herních dialogů.

## Galerie a výjimky

V `character-preview.html` je „Zkušební galerie hlášek“: postava, situace,
předchozí/další, skutečný herní čas zobrazení. Náhled zůstává otevřený ke čtení.
Galerie používá původní textury, včetně upraveného vzhledu a tří sekretářek.
U návrhových editorů nadále platí jeden řádek = jedna hláška; rozepsané návrhy
nemění publikované texty.

`popText()` zůstává pro čísla poškození, skóre, upozornění a sběr předmětů.
Původní „Zítra budeme pískat všichni.“ u vypadlé odborářovy kávy a hláška při
nárazu do Jardy jsou existující stavové zprávy, nikoli nové náhodné repliky.
Sojka má vlastní bublinu v samostatné venkovní scéně, kde jsou hlavní postavy
pozastavené; její původní tři texty se nemění.

Nově přidané oslovení/jméno je **pane Frodo**. Původní výrazy **Laca, Vosahlo,
Kačka12, Saša** aj. jsou zachovány. Před veřejným vydáním je autor může
zkontrolovat v katalogu; tato interní změna je necenzuruje ani nepřejmenovává.

## Jarda — dodatečná úprava podle reference

`assets/outdoor/jarda-poses.png` obsahuje obě šlapací pózy s rozcuchanými
šedými vlasy a křivě posazenými brýlemi nízko na nose. Z nového atlasu se
používají jen první dvě buňky. Kuřáci a sojka zůstávají z původního atlasu.
Velikost, poloha kol a kolizní oblast pro přeskočení zůstávají stejné.

## Ověření

- `node tests/corporate-dialogues.cjs`: 40 přesných textů, postavy/skupiny,
  zachování všech textů ze snapshotu 0.21.2, žádné duplicity, diakritika,
  `<>`, koncové mezery, délky, neopakování; skutečný prohlížeč, HUD a
  kamera, pauza, patro, prohra, soubojové události a galerie na mobilu/PC.
- `node tests/imported-dialogue.cjs`: původní i rozšířené běžné repliky,
  spodní panel, omezení četnosti/patra, zachovaná střelba.
- `node tests/dbpm.cjs`, `node tests/gameplay.cjs`, `node tests/free-mode.cjs`:
  útoky, zásahy, překážky, checkpointy, finální boj a restart.
- `node tests/helper-dialogue.cjs`, `node tests/old-badger.cjs`,
  `node tests/gen-z.cjs`: pomocníci, blokování/skok na hlavu, Gen Z.
- `node tests/outdoor-bonus.cjs`, `node tests/outdoor-jarda.cjs`:
  normalizace Jardových kol, odměny, skutečné dotykové ovládání,
  přeskočení a návrat po srážce, sojka bez překryvu tlačítka.
- `node tests/dialogue-catalogue.cjs`, `node tests/dialogue-community.mjs`:
  společný katalog, lokální návrhy, skutečné SQLite, validace skupin,
  odeslání, moderace a export bez změny publikovaných textů.

Testy běží v Chromium (Playwright), mobilní rozměry a dotykové vstupy jsou
emulované; neproběhl ruční test na fyzickém telefonu. Produkční API není
z tohoto prostředí přímo dostupné; jeho nasazení má proběhnout až po sloučení.

## Navazující opravy 0.22.1 — stejná větev

Úvodní Hall of Fame zobrazuje také deset jmen ze závěrečné tabulky: používá
stejný `ITHeroScores.demoRows`, ukázkoví soupeři jsou oddělení od skutečných
rekordů a nevstupují do databáze. Skutečné výsledky a statistiky se nemění.
Manažer má tři snímky pálky (nápřah, úder, dotažení), rukojeť prochází dlaní;
původní zlatá karta i stará ruka jsou při útoku nahrazené. Snímky se střídají
při trojodpalu i kontaktním výskoku a jsou vidět také v porovnání postav.
Směr, zásahy, prodlevy a počet projektilů zůstávají původní.
Senior master má ve veřejném vzhledu zaoblenou tmavou buřinku včetně
snímku porážky. Původní vzhled přes konzoli zůstává zachován.

`node tests/manager-hall-bowler.cjs` ověřuje všech deset jmen, označení
ukázek, tři fáze pálky, tři míčky v obou směrech, skutečné spuštění útoku
při kontaktu, výskok, zásah a rozdíl veřejné/původní textury Seniora.
