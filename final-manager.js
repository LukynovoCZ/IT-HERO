/* Final boss: fair windups, active-play clock and same-floor cancellation. */
(()=>{'use strict';
 const config={windup:600,cooldown:1800,pumpRange:78,pumpDamage:2,ballSpeed:300,ballGap:170,range:510,jumpVelocity:-370};
 function textures(scene,base='manager'){ITHeroSAP.textures(scene);if(!scene.textures.exists('pingpong-ball')){const g=scene.make.graphics({add:false});g.fillStyle(0x243240).fillCircle(8,8,8);g.fillStyle(0xfff3ca).fillCircle(8,8,6);g.fillStyle(0xffffff).fillRect(5,3,4,3);g.generateTexture('pingpong-ball',16,16);g.destroy();}
  const source=scene.textures.get(base).getSourceImage();
  for(const pose of ['paddle','paddle-strike','paddle-follow','pump']){
   const key=`manager-${pose}`;if(scene.textures.exists(key))continue;
   const t=scene.textures.createCanvas(key,64,80),c=t.context;c.imageSmoothingEnabled=false;c.drawImage(source,0,0);
   // Remove the old raised gold-card hand. Rebuild a sleeved arm with the
   // handle passing through the fingers, rather than floating beside the body.
   c.clearRect(0,12,24,43);c.clearRect(46,27,18,32);c.fillStyle='#1a242e';c.fillRect(43,43,4,15);
   c.strokeStyle='#111b25';c.lineWidth=7;c.beginPath();c.moveTo(27,35);c.lineTo(23,43);c.lineTo(27,49);c.stroke();c.strokeStyle='#303c47';c.lineWidth=3;c.stroke();
   const follow=pose==='paddle-follow',strike=pose==='paddle-strike';
   const hand=follow?[51,45]:strike?[53,40]:[51,34];
   c.strokeStyle='#111b25';c.lineWidth=8;c.beginPath();c.moveTo(40,35);c.lineTo(45,40);c.lineTo(...hand);c.stroke();
   c.strokeStyle='#34404b';c.lineWidth=4;c.stroke();
   const head=pose==='pump'?[58,14]:follow?[59,49]:strike?[59,34]:[55,23];
   c.strokeStyle='#151e24';c.lineWidth=5;c.beginPath();c.moveTo(hand[0]-2,hand[1]+3);c.lineTo(...head);c.stroke();
   c.strokeStyle='#b88a54';c.lineWidth=2;c.stroke();
   if(pose==='pump'){c.fillStyle='#c4d9de';c.fillRect(57,14,3,18);c.fillStyle='#18212a';c.fillRect(52,11,12,4);}
   else {c.fillStyle='#131e28';c.fillRect(head[0]-5,head[1]-7,10,14);c.fillRect(head[0]-6,head[1]-4,12,8);c.fillStyle='#ba3446';c.fillRect(head[0]-4,head[1]-6,8,12);c.fillRect(head[0]-5,head[1]-3,10,6);c.fillStyle='#f4767d';c.fillRect(head[0]-3,head[1]-5,3,6);}
   c.fillStyle='#a86f51';c.fillRect(hand[0]-3,hand[1]-2,6,6);c.fillStyle='#edbb91';c.fillRect(hand[0]-3,hand[1]-2,5,4);t.refresh();
  }
 }

 function cancel(e,clock=0){e.finalAttack?.warning.destroy();e.finalAttack?.effect?.destroy();e.finalAttack=null;e.finalNext=Math.max(e.finalNext||0,clock+650);}
 function valid(s,e){return e.active&&!e.defeated&&s.gameState==='playing'&&!s.transitioning&&e.floorIndex===s.floor;}
 function start(s,e,forced){if(!valid(s,e)||e.finalAttack||s.playTime<(e.finalNext||0))return false;const distance=Math.abs(s.player.x-e.x);if(distance>config.range)return false;const cycle=['helmet','pens','pingpong','jump','pump'],type=forced||(distance<80?(e.finalCycle%2?'pump':'jump'):cycle[(e.finalCycle||0)%cycle.length]);const phase=e.hp<=2?2:e.hp<=4?1:0;const group=!e.finalIntroduced?'intro':phase>(e.finalDialoguePhase||0)?'phase':'special';const spoken=s.dialogue?.say(e,'manager',group,group==='special'?{}:{priority:true,replace:true});if(spoken){e.finalIntroduced=true;e.finalDialoguePhase=phase;}e.finalCycle=(e.finalCycle||0)+1;const direction=s.player.x>=e.x?1:-1;e.setVelocityX(0);e.setFlipX(direction<0);e.finalAttack={type,direction,start:s.playTime,launched:false,fired:0,warning:s.add.text(e.x,e.body.top-18,type==='jump'?'↑ !':'!',{font:'bold 22px monospace',color:'#ffdc75',stroke:'#17212c',strokeThickness:3}).setOrigin(.5).setDepth(110)};return true;}
 function shot(s,e,key,direction,index=0){const helmet=key==='sap-helmet',ball=key==='pingpong-ball';const item=s.enemyShots.create(e.x+direction*28,e.body.bottom-32+(ball?(index-1)*4:0),key).setDepth(26);item.body.setAllowGravity(helmet);if(helmet)item.body.setGravityY(330-s.physics.world.gravity.y);item.setVelocity(direction*(helmet?220:ball?config.ballSpeed:410),helmet?-115:ball?(index-1)*22:0).setAngularVelocity(direction*(ball?420:170));item.body.setSize(ball?10:helmet?22:21,ball?10:helmet?15:5,true);item.setData('floor',e.floorIndex).setData('damage',1).setData('expires',s.time.now+1800);}
 function update(s,e){if(!valid(s,e)){cancel(e,s.playTime);e.setVelocityX(0);return true;}const a=e.finalAttack;if(!a){if(s.playTime>=(e.finalNext||0)&&Math.abs(s.player.x-e.x)<config.range)start(s,e);return !!e.finalAttack;}
  const age=s.playTime-a.start;const swingAge=age-config.windup-(a.type==='jump'?350:0);const gap=a.type==='pingpong'?config.ballGap:150;const swing=swingAge>=0&&(a.type==='jump'||a.type==='pump'||swingAge<gap*3);const phase=swingAge%gap;const frame=a.type==='pump'?'pump':!swing?'paddle':phase<70?'paddle-strike':'paddle-follow';e.setTexture(`manager-${frame}`);e.setFlipX(a.direction<0);a.warning.setPosition(e.x,e.body.top-18);if(age<config.windup){e.setVelocityX(0);return true;}a.warning.setVisible(false);
  if(a.type==='jump'&&!a.launched){a.launched=true;e.setVelocity(a.direction*95,config.jumpVelocity);}
  if(a.type==='pump'||a.type==='jump'){
   const strike=a.type==='jump'?config.windup+350:config.windup;
   if(age>=strike&&!a.fired){a.fired=1;const g=s.add.graphics().setDepth(26);a.effect=g;g.lineStyle(5,a.type==='jump'?0xe95860:0xbdd4dd).lineBetween(e.x,e.body.bottom-32,e.x+a.direction*config.pumpRange,e.body.bottom-32);const dx=s.player.x-e.x;if(dx*a.direction>=-12&&Math.abs(dx)<config.pumpRange&&Math.abs(s.player.body.bottom-e.body.bottom)<(a.type==='jump'?85:32))s.takeDamage(e.x,a.type==='pump'?2:1);}
  }else{const count=a.type==='helmet'?1:3,gap=a.type==='pingpong'?config.ballGap:150;while(a.fired<count&&age>=config.windup+a.fired*gap){shot(s,e,a.type==='helmet'?'sap-helmet':a.type==='pens'?'sap-pen':'pingpong-ball',a.direction,a.fired);e.setTexture('manager-paddle-follow');a.fired++;}}
  if(age>config.windup+(a.type==='jump'?900:650)){cancel(e,s.playTime);e.finalNext=s.playTime+config.cooldown;}return true;
 }
 window.ITHeroFinalManager={config,textures,start,update,cancel};
})();
