## Cíl

Implementuj do aktuální webové hry **IT HERO** v repozitáři `LukynovoCZ/IT-HERO` (aktuálně BUILD 0.12.0, Phaser 3) nového nepřítele **PROJEKŤÁK DBPM – VŠE KOMPLIKUJE**. Má to být aktivní, komický protivník, nikoliv dekorace. Jde o mladého sebevědomého projektového manažera s bagetou a notebookem, který hráče pronásleduje po celé délce patra a pravidelně mu vyrábí další komplikace.

### Grafická předloha

![DBPM – výřez z pixel-art předlohy](../assets/dbpm-reference-character.svg)

**Soubor v repozitáři:** [`assets/dbpm-reference-character.svg`](../assets/dbpm-reference-character.svg). Jde o skutečný **obrazový výřez** ze schváleného konceptu, uložený v SVG s vloženým WebP. Použij jej jako vizuální inspiraci, ale **přepracuj kresbu do reálného herního stylu současných postav**: čisté sprite snímky, transparentní pozadí, omezená paleta, ostré pixely, společná výška a konzistentní kotvení nohou. Nepoužívej tento soubor přímo jako hotovou kolizní texturu ani nekopíruj celý konceptový panel do hry.

**Vzhled:** mladý muž cca 30–40 let, štíhlý, krátké hnědé vlasy a začínající kouty, výrazný mušketýrský knír a úzká bradka, lehce vychytralý sebevědomý úsměv. Rozepnuté tmavomodré sako, světlá košile, hnědé chinos kalhoty, pohodlné boty, viditelná firemní ID karta. V jedné ruce bageta, v druhé notebook. Silueta se musí lišit od dosavadního manažera, SAP minibosse i starého jezevce.

### Chování a pohyb

- DBPM **prochází celou délku aktuálního patra** (rozumné hranice cca x=55..905; vycházej ze skutečné geometrie scény). Nestojí pouze na omezené hlídce jako základní nepřátelé.
- Aktivně sleduje hráče, mění směr, přibližuje se, krátce zastavuje kvůli útokům a může ustupovat.
- **Stoly a kancelářské překážky ho nesmějí trvale zastavit.** Preferuj automatický krátký skok/překročení překážky, je-li fyzikálně možné. Pokud jsou v některé části hry stoly pouze dekorace nebo jsou použité sdílené platformy, uprav pouze kolize této postavy, ne všech ostatních.
- **Nepřeskakuje celé patro teleportací, neprochází zdmi, nepadá mimo podlahu a nemůže se zaseknout ve výtahové šachtě.**
- Zaměř hráče ve **stejném patře**; ostatní patra neovlivňuje. Zachovej omezení počtu aktivních DBPM a bezpečné odstranění při změně patra, restartu nebo game over.
- Doporučený pohyb: 85–110 px/s, rychlejší než běžná sekretářka; skok musí stačit na nízké kancelářské překážky. Všechny rychlosti konfigurovatelné.

### Útoky (tři různé mechaniky)

1. **BAGETA – nablízko:** při vzdálenosti do cca 70–85 px se napřáhne a udeří bagetou. Předem čitelná animace nápřahu cca 350 ms; hitbox trvá krátce, pouze ve směru aktuálního natočení. Jeden zásah ubírá 1 energii. Musí být možné ustoupit nebo přeskočit. Cooldown kolem 1,5 s.
2. **HOZENÝ NOTEBOOK – dálka:** z větší vzdálenosti hodí rotující notebook, který letí mírným obloukem. Má vlastní fyziku, lifetime, kolize s hráčem a prostředím; neprolétá podlahou. Jeden zásah ubírá 1 energii. Zamez dvojímu poškození při jediné kolizi.
3. **HOZENÁ BAGETA – dálka:** místo notebooku občas hodí rotující bagetu. Odlišný sprite, rozměry, rychlost a trajektorie, předem rozpoznatelná animace. Jeden zásah ubírá 1 energii.

Respektuj existující **invulnerability frames** hráče po zásahu, jeho projektilové skupiny a již implementované zvukové efekty. Nevytvářej paralelní systém životů ani kolizí.

### Speciální útok – DYCKY DEMAND!

Každých **12–18 sekund aktivního hraní** (nezapočítávej menu/pauzu) může DBPM vytvořit jednu **novou excelovou tabulku / demand překážku** poblíž hráče:
- Vykřikne **„Dycky DEMAND!“** nebo **„Tak uděláme novou tabulku,ne?“**
- Objeví se výrazná pixelová tabulka, která krátce omezuje průchod, ale vždy má řešení: **přeskočení** nebo **zničení dvěma běžnými střelami**. Výdrž cca 5 s.
- Nespawnuj tabulku přímo v hráči, v prostoru dveří ani v takovém místě, kde zablokuje jedinou cestu či způsobí zaseknutí. Maximálně jedna tabulka od DBPM v jednu chvíli.
- Po zničení nebo expiraci odstraň kolizi, grafiku i časovače; hráč má vidět efekt rozpadajícího se Excelu. Útok má být vtipný, ale férový.

### Zdraví, skóre, obtížnost a rozmístění

- **HP 6** zásahů běžnou disketou (respektuj již existující upgrade zbraně).
- **250 bodů** po porážce, pouze jednou.
- **4. patro – PROJEKTY:** hlavní výskyt, miniboss / silnější běžný protivník.
- **8. patro – MANAGEMENT:** volitelný druhý výskyt, třeba 8 HP a o něco rychlejší; zajisti, aby nebyl přehnaně obtížný souběh s dalšími minibossy.
- Nepřepisuj důležitou logiku aktuálního SAP minibosse a finálního bosse.
- Při zásahu krátká reakce, při porážce komický pád, létající dokumenty / „SCOPE CHANGE!“, pak bezpečné odstranění.

### Hlášky – **doslova zachovat texty včetně překlepů a neobvyklé česko-slovenské směsi**

1. `teraz som plně vytížený`
2. `som šel oba po povrche`
3. `teď už jen doleštime ten diamant`
4. `u zákazníka máte připraven cervenej koberec`
5. `navrhuji další meeting na tohle téma`
6. `Dycky DEMAND!`
7. `Tak uděláme novou tabulku,ne?`

Hlášky náhodně rozděluj do souvisejících situací: pronásledování, útok, zásah, vznik tabulky. Nad hlavou zobraz čitelnou krátkou bublinu; dlouhé texty zalamuj a nedovol jejich duplicitní překrývání. Zamez repetitivnímu spamování. Texty patří ideálně do společné správy `character-dialogue.js`.

### Sprite animace

Minimálně `IDLE`, `WALK/RUN`, `JUMP_OVER_DESK`, `ATTACK_MELEE`, `THROW_LAPTOP`, `THROW_BAGUETTE`, `CREATE_DEMAND`, `HIT`, `DEFEAT`.

Připrav správné pozice sprite snímků pro obě orientace, bez poskakujícího kotvení těla. Pokud dodaná reference nestačí, dokresli nové herní pózy v identickém stylu nebo vytvoř kvalitní provizorní animace a napiš jasně, co je potřeba graficky doladit.

### Technické pokyny (ověřená aktuální struktura projektu)

V repozitáři je Phaser 3, `game.js`, `enemy-catalog.js`, `trio-attacks.js`, `sap-integrator.js`, `character-dialogue.js`, `gameplay.js`, `old-badger.js`, `posters.js`. Nejprve zkontroluj současnou architekturu a další nedávno zavedené prvky, **nevycházej ze starých zadání pro 0.1**.

Preferuj:
- nový oddělený modul `dbpm.js` pro AI, útoky a lifetime překážek;
- deklaraci v `enemy-catalog.js` nebo jeho rozšíření, pokud to zapadá do současného způsobu registrace nepřátel;
- společné dialogy v `character-dialogue.js`;
- načítání grafických podkladů a skriptů v odpovídajícím pořadí v `index.html`;
- konfiguraci v jednom místě pro rychlosti, HP, cooldowny, dosah, četnost demandů, skóre, spawn pozice.

Nevytvářej externí runtime závislosti; nevypínej kolize jiným nepřátelům. Všechny časovače, projektily a překážky je třeba vyčistit při shutdown/restartu a změně patra. Zohledni přítomné mobilní dotykové ovládání.

### Akceptační testy

Ověř reálný běh v prohlížeči a podle možností automatizované testy:
1. Start hry bez JS chyb; původní nepřátelé fungují.
2. DBPM se objeví ve 4. patře, sleduje hráče od jednoho konce patra k druhému.
3. Opakovaně se nezasekne u stolu; skok či specifická navigace je vidět.
4. Nablízko udeří bagetou; dál střídá notebook a bagetu.
5. Projektily mají správnou orientaci, kolize, poškození a expiraci.
6. `DEMAND` vznikne přiměřeně daleko od hráče, jde přeskočit či zničit a po pěti sekundách zmizí.
7. Ukazatel zdraví a body správně reagují; porážka přidá +250 jen jednou.
8. Dialogy jsou čitelné, beze změny původního znění.
9. Při změně patra, game over, checkpointu a restartu nezůstávají objekty ani běžící časovače.
10. Desktopové i dotykové ovládání zůstává funkční.

Pokud nemůžeš provést vizuální/browser test, uveď to jako neotestované; kontrola syntaxe není ekvivalentem úspěšného herního testu.

### Dodání

Implementuj **přímo v projektu**, v nové větvi `feature/dbpm-project-manager`, a vytvoř PR proti `main`. V PR shrň upravené soubory, použité grafické zdroje, výsledky testů a způsob, jak snadno změnit parametry DBPM. Neprováděj merge bez mého potvrzení.

---
GitHub issue: https://github.com/LukynovoCZ/IT-HERO/issues/1
