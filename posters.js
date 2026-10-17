/* IT HERO: local, data-driven corporate posters. No external assets or branding.
 * Floors are numbered 1–9. Placement y is relative to that floor's ground line.
 */
(() => {
  'use strict';
  const defaults = {
    width: 144, height: 180, textureScale: 2, displayScale: 0.5,
    bgColor: '#e2dfcc', accentColor: '#29674b', textColor: '#465347',
    depth: -7, tint: 0xd1d4c0, tooltipDistance: 92
  };
  const definitions = [
    {id:'friday',title:'NEJVĚTŠÍ INOVACE\nVZNIKAJÍ V PÁTEK V OFISU',subtitle:'Spolupráce. Energie. Přítomnost.',theme:'office / attendance / culture',icon:'chair',accentColor:'#537c46'},
    {id:'forwarded',title:'VYŘEŠENO ZNAMENÁ\nPŘEPOSLÁNO',subtitle:'Efektivní ticket management v moderní organizaci.',theme:'IT / helpdesk / workflow',icon:'workflow',accentColor:'#356d7d'},
    {id:'migration',title:'CO FUNGUJE,\nTO ZMIGRUJEME',subtitle:'Transformace je cesta k budoucnosti.',theme:'migration / cloud / servers',icon:'cloud',accentColor:'#477e92'},
    {id:'alignment',title:'STRATEGICKY ALAJNOVÁNI.\nPRAKTICKY ZTRACENI.',subtitle:'Jedna vize. Mnoho směrů.',theme:'strategy / roadmap / chaos',icon:'arrows',accentColor:'#a37942'},
    {id:'people',title:'PEOPLE FIRST.\nPROCESS ALWAYS.',subtitle:'Na lidech nám záleží. Proto máme jasná pravidla.',theme:'HR / compliance',icon:'people',accentColor:'#577953'},
    {id:'attendance',title:'HOME OFFICE JE BENEFIT.\nPRÁZDNÁ ŽIDLE JE PROBLÉM.',subtitle:'Společně tvoříme kulturu přítomnosti.',theme:'home office / office culture',icon:'chair',accentColor:'#8b694b'},
    {id:'vehicle',title:'SOFTWARE DEFINED VEHICLE.\nMEETING DEFINED COMPANY.',subtitle:'Budoucnost mobility vzniká spoluprací.',theme:'automotive / software / meetings',icon:'car',accentColor:'#367260'},
    {id:'meeting',title:'KAŽDÝ PROBLÉM MÁ ŘEŠENÍ.\nDALŠÍ MEETING.',subtitle:'Sdílením perspektiv zrychlujeme rozhodování.',theme:'meetings / management',icon:'meeting',accentColor:'#7c6077'},
    {id:'future',title:'FUTURE READY.\nPRODUCTION PENDING.',subtitle:'Inovace dnes. Implementace zítra.',theme:'automotive / future / concept',icon:'chart',accentColor:'#51768b'},
    {id:'change',title:'ZMĚNA JE\nJEDINÁ KONSTANTA',subtitle:'Reorganizace podporuje růst, pružnost a odolnost.',theme:'reorganization / org chart',icon:'org',accentColor:'#a27c3e'},
    {id:'ai',title:'POKUD TO NEJDE,\nTAK TO UDĚLEJTE AIČKEM.',subtitle:'Inovace neznají překážky.',theme:'AI / digitalization',icon:'ai',accentColor:'#67759a'},
    {id:'leadership',title:'JE JEN JEDNO PRAVIDLO:\nVEDENÍ MÁ VŽDYCKY PRAVDU.',subtitle:'Naše hodnoty. Naše pravidla.',theme:'leadership / executive floor',icon:'stamp',accentColor:'#8c7137'}
  ];
  // Edit this list to change floor, poster, position and optional dimensions.
  const placements = [
    {floor:1,x:240,y:-220,poster:'people'}, {floor:1,x:750,y:-220,poster:'attendance'},
    {floor:2,x:240,y:-220,poster:'meeting'}, {floor:2,x:750,y:-220,poster:'people'},
    {floor:3,x:240,y:-220,poster:'attendance'}, {floor:3,x:750,y:-220,poster:'forwarded'},
    {floor:4,x:240,y:-220,poster:'migration'}, {floor:4,x:750,y:-220,poster:'change'},
    {floor:5,x:240,y:-220,poster:'ai'}, {floor:5,x:750,y:-220,poster:'forwarded'},
    {floor:6,x:240,y:-220,poster:'change'}, {floor:6,x:750,y:-220,poster:'migration'},
    {floor:7,x:240,y:-220,poster:'friday'}, {floor:7,x:750,y:-220,poster:'alignment'},
    {floor:8,x:240,y:-220,poster:'vehicle'}, {floor:8,x:750,y:-220,poster:'future'},
    {floor:9,x:260,y:-220,poster:'leadership'}
  ];

  function wrap(ctx, text, width) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > width) { lines.push(line); line = word; }
        else line = candidate;
      }
      lines.push(line);
    }
    return lines;
  }

  function icon(ctx, type, x, y, color, background) {
    ctx.save(); ctx.translate(x,y); ctx.fillStyle = color;
    const r = (x,y,w,h) => ctx.fillRect(x,y,w,h);
    switch(type) {
      case 'chair': r(7,0,18,10);r(5,12,24,4);r(15,16,4,6);r(5,22,24,2);r(5,24,4,2);r(25,24,4,2);break;
      case 'cloud': r(3,8,29,12);r(9,2,16,18);r(0,11,36,6);r(16,20,4,6);break;
      case 'workflow': r(0,5,10,16);r(26,5,10,16);r(12,12,12,3);r(19,8,3,11);break;
      case 'arrows': r(16,2,4,23);r(2,11,32,4);r(2,8,5,10);r(29,8,5,10);r(12,2,12,4);r(12,21,12,4);break;
      case 'people': for(const x of [0,14,28]){r(x,2,7,7);r(x-1,11,9,13);}break;
      case 'car': r(0,12,36,10);r(7,4,23,11);ctx.fillStyle=background;r(10,7,7,6);r(20,7,7,6);ctx.fillStyle=color;r(4,22,6,4);r(27,22,6,4);break;
      case 'meeting': r(0,12,36,6);r(4,18,3,8);r(28,18,3,8);for(const x of [3,16,29]){r(x,0,5,5);r(x-1,6,7,4);}break;
      case 'chart': r(0,24,36,2);r(3,16,7,8);r(14,9,7,15);r(25,1,7,23);break;
      case 'org': r(12,0,13,7);r(17,7,3,8);r(3,12,29,2);for(const x of [0,13,26])r(x,17,10,8);break;
      case 'ai': r(5,3,26,21);r(0,7,4,3);r(0,17,4,3);r(32,7,4,3);r(32,17,4,3);ctx.fillStyle=background;r(10,8,5,5);r(21,8,5,5);r(13,18,11,2);break;
      case 'stamp': r(12,0,12,10);r(6,10,24,7);r(2,19,32,6);break;
      default: r(0,0,30,25);ctx.fillStyle=background;r(3,3,24,19);
    }
    ctx.restore();
  }

  function createTexture(scene, definition, options = {}) {
    const spec = {...defaults,...definition,...options};
    const width = Math.round(spec.width), height = Math.round(spec.height);
    if (width < 96 || height < 130) throw new Error(`Poster ${spec.id}: minimum size is 96 × 130`);
    const scale = spec.textureScale;
    const signature = JSON.stringify(spec);
    let hash = 0;
    for (let i=0;i<signature.length;i++) hash = ((hash<<5)-hash+signature.charCodeAt(i))|0;
    const key = `corporate-poster-${spec.id}-${hash >>> 0}`;
    if (scene.textures.exists(key)) return key;
    const texture = scene.textures.createCanvas(key,width*scale,height*scale);
    const ctx = texture.context;
    ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
    ctx.fillStyle=spec.bgColor;ctx.fillRect(0,0,width,height);
    ctx.strokeStyle='#939b89';ctx.lineWidth=1;ctx.strokeRect(1,1,width-2,height-2);
    ctx.fillStyle=spec.accentColor;ctx.fillRect(4,4,width-8,14);
    ctx.fillStyle=spec.bgColor;ctx.font='bold 6px monospace';ctx.fillText('INTERNÍ KOMUNIKACE',10,14);
    const pad=10, titleArea=height*0.43;
    let font=13, lines;
    do {ctx.font=`bold ${font}px monospace`;lines=wrap(ctx,spec.title,width-pad*2);if(lines.length*(font+2)<=titleArea)break;font--;} while(font>6);
    ctx.fillStyle=spec.textColor;
    lines.forEach((line,i)=>ctx.fillText(line,pad,32+i*(font+2)));
    const iconY=Math.round(height*0.59);
    icon(ctx,spec.icon,Math.round((width-36)/2),iconY,spec.accentColor,spec.bgColor);
    ctx.fillStyle=spec.accentColor;ctx.fillRect(pad,iconY+31,width-pad*2,1);
    let subFont=8, subLines;
    const subY=iconY+43;
    do {ctx.font=`${subFont}px monospace`;subLines=wrap(ctx,spec.subtitle,width-pad*2);if(subLines.length*(subFont+2)<height-subY-5)break;subFont--;}while(subFont>5);
    ctx.fillStyle=spec.textColor;
    subLines.forEach((line,i)=>ctx.fillText(line,pad,subY+i*(subFont+2)));
    texture.refresh();
    return key;
  }

  function mount(scene, floors, options = {}) {
    const catalog = options.definitions || definitions;
    const layout = options.placements || placements;
    const byId = new Map(catalog.map(def=>[def.id,def]));
    const posters = layout.map(place=>{
      const def=byId.get(place.poster);
      if(!def)throw new Error(`Unknown poster: ${place.poster}`);
      if(!Number.isInteger(place.floor)||!floors[place.floor-1])throw new Error(`Invalid poster floor: ${place.floor}`);
      const spec={...defaults,...def,...place};
      const key=createTexture(scene,def,{width:spec.width,height:spec.height,bgColor:spec.bgColor,accentColor:spec.accentColor,textColor:spec.textColor,textureScale:spec.textureScale});
      const image=scene.add.image(place.x,floors[place.floor-1]+place.y,key)
        .setDisplaySize(spec.width*spec.displayScale,spec.height*spec.displayScale).setDepth(spec.depth).setTint(spec.tint)
        .setData('posterId',def.id).setData('floor',place.floor);
      return {image,definition:def,placement:place};
    });
    const tooltip=scene.add.text(480,535,'',{
      font:'12px monospace',color:'#f4f0df',backgroundColor:'#123e2d',
      padding:{x:12,y:8},wordWrap:{width:450},lineSpacing:4
    }).setOrigin(0.5,1).setDepth(150).setScrollFactor(0).setVisible(false);
    let destroyed=false;
    const manager={posters,tooltip,
      update(player,floor,active){
        if(destroyed)return;
        const nearest=active?posters.filter(p=>p.placement.floor===floor+1)
          .filter(p=>Math.abs(player.y-(floors[floor]-40))<120)
          .sort((a,b)=>Math.abs(a.placement.x-player.x)-Math.abs(b.placement.x-player.x))[0]:null;
        if(nearest&&Math.abs(nearest.placement.x-player.x)<defaults.tooltipDistance){
          tooltip.setText(`${nearest.definition.title}\n${nearest.definition.subtitle}`).setVisible(true);
        }else tooltip.setVisible(false);
      },
      destroy(){if(destroyed)return;destroyed=true;tooltip.destroy();posters.forEach(p=>p.image.destroy());}
    };
    scene.events.once('shutdown',()=>manager.destroy());
    return manager;
  }
  window.ITHeroPosters={defaults,definitions,placements,createTexture,mount};
})();
