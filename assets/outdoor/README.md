# Venkovní mezihra

- `courtyard.png`: samostatné pixelové pozadí inspirované dvěma uživatelem
  dodanými fotografiemi před administrativní budovou. Prosklený vstup, řady
  oken, parkoviště, zábrana a zeleň; žádná vložená fotografie ani firemní logo.
- `characters.png`: transparentní atlas 3 × 2. Pořadí po řádcích: Jarda na
  skládačce (dvě pózy), šedovlasý kolega, hnědovlasý kolega, kolegyně, sojka.
  Obě ilustrace vznikly generováním pro tuto hru. Výchozí fotky se nepublikují.

`outdoor-bonus.js` vyřízne hlavní souvislé siluety z buněk do CanvasTexture, odřízne
poloprůhledné pozadí a normalizuje spodní hranu. Cyklista má společné měřítko
obou snímků, aby při šlapání neměnil velikost. Pixely ze sousedních buněk
neovlivňují ukotvení kol. Králíci, kouř, koš a dveře se
kreslí přímo ve hře. Nouzové procedurální sprity se použijí při chybě atlasu.
