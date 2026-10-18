# Závěrečná animace – lokální grafika

`backgrounds.png`: dvě stejně vysoké scény nad sebou; nahoře střecha původní
budovy za soumraku, dole noční Laurin & Klement kampus podle dodané fotografie.
`car.png`: transparentní atlas, dvě stejně vysoké řady; nahoře sportovní SUV
s běžnými koly, dole stejný vůz v letové konfiguraci. Příď směřuje doprava.

Grafika byla připravena podle schváleného storyboardu bez značkových log.
Nejde o přesný sériový model automobilu. Hrdina používá původní herní snímky.
`ending-scene.js` vytváří textury ořezem atlasů jednou při prvním přehrání;
pohyb, dveře, překlopení kol a trysky pak animuje Phaser. Za hraní se nic
externě negeneruje ani nestahuje z cizího API.
