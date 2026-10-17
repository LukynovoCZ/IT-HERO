# Starý Jezevec (0.10.0)

Součást společné verze 0.10.1 spolu se SAP minibossem, čitelnějšími manažery,
IT kolegou a delšími hláškami.

## Soubory

- `old-badger.js`: konfigurace, vlastní herní čas, náhodné příchody, samostatná
  Arcade skupina, výtahové dveře, AI, obrana, STOMP, propadnutí, prach a hlášky.
- `assets/characters/old_badger.png`: čtyři transparentní pózy podle dodaného
  návrhu (2048 × 768): IDLE, WALK, BLOCK a stlačený STOMP_HIT. Výstup z výtahu
  a SINK jsou procedurální animace. Ořezy a kotvy jsou v `art`; výška 76 px.
- `game.js`: načtení/vytvoření kontroleru, pořadí kolizí, průběžná aktualizace,
  ochrana střel u nepřátel za Jezevcem a úklid při změně patra.
- `index.html`, `character-preview.html/js`: modul, verze a dvanáctá postava
  v náhledu. „Útok“ zde ukazuje blokovací pózu, „Zastavení hráče“ stlačenou.
- `tests/old-badger.cjs`: skutečné fyzikální interakce v Chromium.

## Konfigurace

V `ITHeroOldBadger.config` na začátku `old-badger.js`:

| Parametr | Výchozí hodnota |
|---|---:|
| spawnIntervalMin / spawnIntervalMax | 25000 / 45000 ms |
| walkSpeed | 28 px/s |
| walkDistance | 70 px na každou stranu od výtahu |
| pauseDuration | 950 ms |
| stompBounceVelocity | −330 px/s |
| sinkAnimationDuration | 1250 ms |
| scoreReward | 150 |
| exitDuration | 1200 ms |
| quoteInterval | 7000 ms |
| stompTolerance | 9 px |

Nová postava se objevuje v aktuálním patře, pouze jedna najednou. Příchod se
odloží, pokud hráč stojí u výtahu, prostor je blokovaný nebo tam právě vystupuje
starý pomocník. Při dokončení výstupu se znovu ověří vzdálenost od hráče.
Dveře jsou dočasná grafická vrstva; po výstupu opět platí „MIMO PROVOZ“.

## Pravidla kolizí

Jezevec není ve skupině `enemies`, nemá odečítané životy a nemá střelnou zbraň.
Jeho Arcade tělo je nepohyblivé vůči hráči a bez gravitace, ale AI jím posouvá
vodorovně. Chodí v centrální volné části patra mezi herními stoly.

- `playerShots × oldBadger`: střela zmizí, vznikne jiskra, blokovací póza a ťuknutí.
  Registruje se před běžnými zásahy nepřátel. Záloha v `hitEnemy` kontroluje
  i dráhu střely za poslední krok, aby nepoškodila cíl za překážkou.
- `enemyShots × oldBadger`: žádný collider ani overlap, žádná změna letu.
- `player × oldBadger` z boku: běžná fyzická překážka, žádné poškození.
- STOMP: kladná rychlost Y, předchozí spodní hrana hráče nad horní hranou
  Jezevce (malá tolerance) a alespoň 6 px vodorovného překrytí. Vyhodnocuje se
  v process callbacku před fyzikálním oddělením těl. Výskok ani boční kontakt
  podmínky nesplní. Odměna i animace jsou jištěné příznakem `stomped`.

Při porážce se tělo vypne ihned, hráč se odrazí, Jezevec se stlačí a přepne
na hlavu s rukama. Geometrická maska skryje část pod podlahou; následují hvězdy
a prach. Kamera po dobu efektu mírně sníží sledovací offset, aby animaci
nezakryl spodní HUD; při úklidu se vrátí původní nastavení.

Čas, animace a efekty stojí při pauze. Změna patra, konec hry a restart odstraní
postavu, masku, dveře, řeč, částice a související kolize. Nejsou použity žádné
neřízené intervaly či externí zvukové závislosti.

## Ověření

Při lokálním serveru na portu 8000 a nainstalovaných Playwright/Chromium:

```
node tests/old-badger.cjs
node tests/character-preview.cjs
node tests/trio-collisions.cjs
node tests/it-colleague.cjs
node tests/support.cjs
node tests/browser.cjs
```

Test Jezevce ověřuje automatický příchod, jedinou aktivní instanci, zákaz
spawnu uvnitř hráče, pohyb, pauzu, skutečné střely disket/CD z obou stran,
chráněného nepřítele za ním, průlet nepřátelské střely, boční i vzestupný kontakt,
skok na pohybující se postavu, odraz, maskované propadnutí, 150 bodů právě jednou,
živého Jezevce při změně patra, konec hry i restart scény.

Pro místní ruční test lze na instanci scény použít `scene.oldBadger.spawn()`.
Kontroler poskytuje `state.entity`, `state.clock`, `state.nextAt`, `group` a
`clear()`. Veřejná stránka instanci hry přímo neexportuje; testy ji zpřístupní
jen lokální úpravou načítaného skriptu.
