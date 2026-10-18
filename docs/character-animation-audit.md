# Postavy a animace – 0.19.0

`character-motion.js` doplňuje ostré pixelové snímky v původním rozměru textury,
se stejnou výškou a ukotvením chodidel. Kolizní těla a parametry pohybu se nemění.

| Postava | Pohyb | Kontakt / akce | Útok |
| --- | --- | --- | --- |
| Ajťák | původní chůze | skrčení, nový zásah | nový snímek střelby |
| Sekretářky (blond / černé / hnědé krátké vlasy) | dva kroky | otevřená ústa | natažená ruka s hrnkem |
| Odborář | doplněné dva kroky | píšťalka | natažená ruka |
| Manažer | doplněné kroky | dupání | natažená ruka, zlatá karta |
| Specialistka | doplněné kroky | vlajka | sprej nebo hod |
| Bezpečák | původní póza + druhý krok | STOP, firewall | vysílačka / projektil |
| HR | původní chůze + druhý krok | STOP, bičík | dokumenty / projektil |
| Design manažer | původní chůze + druhý krok | střídání dvou snímků řevu | nápřah a došvih golfovou holí, golfový míček |
| Šéf SAP | nově odlišná chůze | pumpička | původní dva druhy střelby |
| DBPM | původní samostatné snímky | původní nablízko | původní hody |
| Senior master | původní samostatné snímky | blokování / jídlo / zmizení | původní obranné chování |
| Gen Z holka a kluk | původní samostatné snímky | mobil, STOP, odchod | nebojují |
| Starý ajťák | vykouknutí a odchod | nabídka občerstvení | přátelský, neútočí |
| IT kolega | vykouknutí a odchod | dvě nabídky | přátelský, neútočí |

Běžným nepřátelům jsou doplněné i reakce na zásah a krátká porážka.
Přátelským a nezranitelným postavám nejsou přidány zraňující útoky.
V přehledu jsou všechny tři sekretářky. Golfové míčky mají vlastní malý hitbox,
rychlost 310 a původní kontrolu patra i ochranu hráče po zásahu.
