/* Catalogue inspection only; uses the game's textures and shared bubble renderer. */
(()=>{'use strict';const D=ITHeroDialogue;
 D.mountGallery=source=>{
  const root=document.getElementById('dialogue-gallery');if(!root)return;
  const character=document.getElementById('gallery-character'),group=document.getElementById('gallery-group'),status=document.getElementById('gallery-status');let index=0,scene;
  for(const c of D.characters){const o=document.createElement('option');o.value=c.id;o.textContent=c.name;character.append(o);}
  const aliases={hero:'AJŤÁK',old_it:'STARÝ AJŤÁK',old_badger:'SENIOR MASTER',sap_integrator:'ŠÉF SAP',it_colleague:'IT KOLEGA',gen_z:'GEN Z – HOLKA',jay:'SOJKA'};
  function refresh(){if(!scene)return;const c=D.characters.find(c=>c.id===character.value),lines=D.lines(c.id,group.value);index=(index+lines.length)%lines.length;
   const entry=c.id==='laurin_klement'?{frames:{idle:'founders-talk'}}:source.entries.find(e=>e.id===c.id)||source.entries.find(e=>e.name===(aliases[c.id]||c.name)||c.id==='secretary'&&e.name.startsWith('SEKRETÁŘKA'))||source.entries[0];
   const key=ITHeroAppearance.texture(source,entry.frames.idle),image=source.textures.get(key).getSourceImage();if(scene.textures.exists('gallery-person'))scene.textures.remove('gallery-person');scene.textures.addImage('gallery-person',image);scene.person.setTexture('gallery-person');scene.person.setDisplaySize(image.width,image.height);
   scene.dialogue.clear();scene.dialogue.state.gapUntil=0;scene.dialogue.state.next.clear();scene.dialogue.say(scene.person,c.id,group.value,{line:lines[index],replace:true,duration:600000});
   status.textContent=`${index+1} / ${lines.length} • ${D.duration(lines[index])/1000} s ve hře • ${lines[index]}`;
  }
  function groups(){group.replaceChildren();for(const g of D.characters.find(c=>c.id===character.value).groups){const o=document.createElement('option');o.value=g.id;o.textContent=g.label;group.append(o);}index=0;refresh();}
  character.onchange=groups;group.onchange=()=>{index=0;refresh();};document.getElementById('gallery-next').onclick=()=>{index++;refresh();};document.getElementById('gallery-prev').onclick=()=>{index--;refresh();};groups();
  class Gallery extends Phaser.Scene{create(){scene=this;this.floor=0;this.gameState='playing';this.add.rectangle(480,210,960,420,0x152f2b);this.add.rectangle(480,332,960,20,0x78867b);this.person=this.add.image(480,322,'__WHITE').setOrigin(.5,1);this.posters={showMessage:()=>{}};this.dialogue=D.create(this);refresh();}}
  new Phaser.Game({type:Phaser.CANVAS,parent:'dialogue-stage',width:960,height:420,pixelArt:true,roundPixels:true,antialias:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Gallery]});
 };
})();
