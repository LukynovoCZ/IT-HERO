/* Shared game and catalogue item textures. Keep both views visually identical. */
(() => {
  'use strict';
  function create(scene) {
    const rect=(g,color,x,y,w,h)=>g.fillStyle(color).fillRect(x,y,w,h);
    const texture=(key,w,h,draw)=>{if(scene.textures.exists(key))return;const g=scene.make.graphics({add:false});draw(g);g.generateTexture(key,w,h);g.destroy();};
      const rainbow = [0xef5366,0xf5a347,0xf8df65,0x63c86a,0x54b3f6,0xaf79e1];
      texture('unicorn', 26, 22, g => {
        rect(g,0x263b51,4,9,17,9); rect(g,0xfaf0ff,5,8,15,9);
        rect(g,0xfaf0ff,15,4,8,10); rect(g,0xd9a4f1,13,5,4,9);
        rect(g,0xffd96f,20,0,2,6); rect(g,0x27374b,20,7,2,2);
        rect(g,0xeebdf1,5,16,3,5); rect(g,0xeebdf1,15,16,3,5);
        rainbow.forEach((color,i)=>rect(g,color,1,8+i,5,1));
      });
      texture('rainbow-spray', 74, 36, g => {
        rainbow.forEach((color,i)=> {
          rect(g,color,6+i*4,3+i*5,58-i*3,4);
          rect(g,color,66-i*2,4+i*5,3,3);
        });
      });
      texture('rainbow-flag', 62, 42, g => {
        rect(g,0xb39a72,1,1,3,40);
        rainbow.forEach((color,i)=>rect(g,color,4,2+i*5,56,5));
      });
      texture('beer', 18, 27, g => {
        rect(g,0x132e23,2,0,14,27); rect(g,0xd9c477,3,0,12,3);
        rect(g,0x12613c,3,3,12,21); rect(g,0x38935a,4,4,2,18);
        rect(g,0xe9d99c,4,10,10,9); rect(g,0xb44636,7,12,4,4);
        rect(g,0xd9c477,3,24,12,2);
      });
      // Český párek v rohlíku: párek nahoře, dutý rohlík svisle, ubrousek dole.
      texture('hotdog', 17, 34, g => {
        rect(g,0x743e22,7,0,6,14); rect(g,0xcf7d3d,8,1,4,13);
        rect(g,0xf2ad65,8,1,1,8);
        rect(g,0x9d6328,4,10,11,20); rect(g,0xd39b45,5,10,9,19);
        rect(g,0xe7b966,6,13,3,15); rect(g,0xefd08a,6,14,1,12);
        rect(g,0xf5cd4c,5,9,4,3); rect(g,0xf5cd4c,8,11,4,2);
        rect(g,0xffe37b,5,9,2,1);
        rect(g,0xe1e7e3,1,25,15,7); rect(g,0xf8f8ed,2,24,6,6);
        rect(g,0xf8f8ed,8,26,8,7); rect(g,0xadbdb6,7,27,2,6);
      });
      texture('mug', 15, 14, g => {
        rect(g, 0xe4f1f1, 1, 2, 10, 11); rect(g, 0x8e4843, 2, 3, 8, 3);
        rect(g, 0x86b8cb, 2, 7, 8, 5); rect(g, 0xe4f1f1, 11, 4, 4, 7);
        rect(g, 0x243750, 11, 6, 2, 3);
      });
      texture('hammer', 18, 18, g => {
        rect(g, 0xa37a4e, 8, 5, 4, 13); rect(g, 0xe0b57e, 8, 7, 1, 11);
        rect(g, 0x758797, 1, 1, 16, 6); rect(g, 0xd0dce1, 2, 1, 14, 2);
      });
      texture('gear', 18, 18, g => {
        rect(g, 0x9caeba, 3, 3, 12, 12);
        for (const [x,y,w,h] of [[6,0,6,3],[6,15,6,3],[0,6,3,6],[15,6,3,6]])
          rect(g, 0x9caeba, x,y,w,h);
        rect(g, 0x42576b, 6, 6, 6, 6); rect(g, 0xd1e4ea, 7, 7, 4, 4);
      });
      texture('gold-card', 20, 12, g => {
        rect(g, 0xa47626, 0, 0, 20, 12); rect(g, 0xf6d472, 1, 1, 18, 10);
        rect(g, 0xe6af42, 1, 3, 18, 2); rect(g, 0xfff2b4, 3, 6, 4, 3);
        rect(g, 0x997027, 10, 8, 7, 1);
      });
      texture('floppy', 14, 14, g => {
        rect(g, 0x472469, 0, 0, 14, 14); rect(g, 0xcaa5ea, 2, 0, 9, 6);
        rect(g, 0x18243e, 7, 1, 3, 4); rect(g, 0xf3e5be, 2, 8, 10, 5);
        rect(g, 0xd16d84, 3, 9, 8, 1);
      });
      texture('cd', 16, 16, g => {
        for (const [x, y, w, h] of [[4,0,8,2],[2,2,12,2],[0,4,16,8],[2,12,12,2],[4,14,8,2]])
          rect(g, 0xcbdde8, x, y, w, h);
        rect(g, 0x83f1da, 2, 4, 4, 5); rect(g, 0xdca5ed, 10, 7, 4, 5);
        rect(g, 0x263750, 6, 6, 4, 4); rect(g, 0xfaffff, 7, 7, 2, 2);
      });
      texture('folder', 15, 11, g => {
        rect(g, 0xa36540, 1, 2, 13, 8); rect(g, 0xf4be6e, 1, 4, 13, 5);
        rect(g, 0xf6d58d, 2, 1, 6, 3); rect(g, 0xcc9155, 6, 5, 6, 1);
      });
      texture('coffee', 26, 27, g => {
        // Bílý porcelán, zelený okřídlený geometrický symbol, bez loga značky.
        rect(g,0x233d35,3,3,16,22); rect(g,0xb7d0c9,4,5,14,18);
        rect(g,0xf5f6e9,4,4,13,17); rect(g,0xffffff,5,4,3,15);
        rect(g,0xd8e5dd,18,7,7,11); rect(g,0xffffff,18,7,6,2);
        rect(g,0x213c31,19,10,3,5); rect(g,0xffffff,18,16,5,2);
        rect(g,0x987050,5,3,11,4); rect(g,0x503327,6,4,9,2);
        rect(g,0x176344,7,10,7,7); rect(g,0x4c9862,8,11,5,5);
        rect(g,0xf7f5e1,9,12,4,1); rect(g,0xf7f5e1,8,13,3,1);
        rect(g,0xf7f5e1,10,14,2,2); rect(g,0x12482f,12,11,1,1);
        rect(g,0xb9cfc3,1,24,21,2); rect(g,0xf7f5e1,3,23,17,1);
      });
  }
  window.ITHeroItems={create};
})();
