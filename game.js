/*
 * IT HERO 0.21.2 – mini plošinovka v Phaser 3.
 * Lokální pixelové ilustrace v assets; střely generuje Phaser Graphics.
 * Edituj FLOORS, buildOffice(), makeTextures() a createActors() pro další obsah.
 */
(() => {
  'use strict';

  // Ověř engine ještě před deklarací třídy, která dědí z Phaser.Scene.
  if (typeof Phaser === 'undefined') {
    const msg = document.getElementById('offline-message');
    if (msg) msg.hidden = false;
    return;
  }

  const WIDTH = 960;
  const HEIGHT = 540;
  const FLOOR_COUNT = 9;
  const WORLD_HEIGHT = 4440;
  const FLOORS = Array.from({ length: FLOOR_COUNT }, (_, i) => 4320 - i * 485);
  const COLORS = {
    dark: 0x0c1727,
    wall: 0x23334c,
    wallAlt: 0x273b54,
    concrete: 0x65748b,
    light: 0xe4effa,
    mint: 0x6cf0dc,
    yellow: 0xffdf82,
    pink: 0xff7698,
    blue: 0x75bdfb
  };

  const FLOOR_PLANS = [
    {name:'RECEPCE & NÁVŠTĚVY',type:'reception',desks:[330,700]},
    {name:'ADMINISTRATIVA • OPENSPACE',type:'open',desks:[305,680]},
    {name:'ÚČTÁRNA • KANCELÁŘE',type:'office',desks:[360,700]},
    {name:'PROJEKTY • ZASEDACÍ CHODBA',type:'corridor',desks:[305,720]},
    {name:'ODBORY • JEDNACÍ MÍSTNOSTI',type:'meeting',desks:[320,700]},
    {name:'HR • OPENSPACE',type:'open',desks:[300,680]},
    {name:'PRÁVNÍ • ARCHIVNÍ CHODBA',type:'archive',desks:[350,700]},
    {name:'MANAGEMENT • KANCELÁŘE',type:'office',desks:[305,720]},
    {name:'VEDENÍ • POSLEDNÍ ZÁLOHA',type:'executive',desks:[340,690]}
  ];

  const OLD_HELPER_TIMING = {offerAt:1800,visitDuration:6500,panelDuration:7000};
  const OLD_HELPER_LINES = Object.fromEntries(['beer','hotdog','peek'].map(key=>[key,window.ITHeroDialogue.lines('old_it',key)]));

  const DEATH_LINES = window.ITHeroDialogue.lines('hero','death');

  class ITGame extends Phaser.Scene {
    constructor() { super('ITGame'); }

    preload() {
      window.ITHeroEnemyCatalog.preload(this);
      window.ITHeroColleague.preload(this);
      window.ITHeroOldBadger.preload(this);
      window.ITHeroGenZ.preload(this);
      window.ITHeroEnding.preload(this);
      window.ITHeroOutdoor.preload(this);
      this.load.image('support-art', 'assets/support.png');
      this.load.image('character-art', 'assets/characters.png');
      this.load.image('floor-art', 'assets/floors.png');
      this.load.image('office-art', 'assets/office.png');
      this.load.image('exterior-art', 'assets/exterior.png');
    }

    create(data = {}) {
      this.gameState = 'menu';
      this.energy = 4;
      this.maxEnergy = 5;
      this.score = 0;
      this.weapon = 'floppy';
      this.floor = 0;
      this.facing = 1;
      this.lastHit = -3000;
      this.lastShot = -1000;
      this.lastJumpAt = -1000;
      this.lastOnGroundAt = -1000;
      this.transitioning = false;
      this.wasCrouching = false;
      this.stairsCrouchHeld = false;
      this.dropThroughPlatform = null;
      this.isMuted = false;
      this.audioCtx = null;
      this.enemies = this.physics.add.group();
      this.playerShots = this.physics.add.group({ allowGravity: false });
      this.enemyShots = this.physics.add.group({ allowGravity: false });
      this.platforms = this.physics.add.staticGroup();
      this.obstacles = this.physics.add.staticGroup();
      this.coffees = this.physics.add.staticGroup();
      this.upgrades = this.physics.add.staticGroup();
      this.aidItems = this.physics.add.staticGroup();
      this.playTime = 0;
      this.nextHelperAt = 7000;
      this.helperVisit = null;
      this.outdoorVisit=null;this.outdoorCooldown=0;
      if(!data.resumeCheckpoint)this.outdoorRewards={cd:[false,false,false],coffee:false};

      if(!data.resumeCheckpoint)this.registry.remove('trainingRun');
      ITHeroAppearance.state.training=!!data.resumeCheckpoint&&!!this.registry.get('trainingRun')||ITHeroAppearance.state.god;
      if(ITHeroAppearance.state.training)this.registry.set('trainingRun',true);
      this.makeTextures();
      this.buildOffice();
      window.ITHeroOutdoor.door(this,4320);
      this.createActors();
      this.dbpm = window.ITHeroDBPM.create(this, FLOORS);
      this.configurePhysics();
      this.configureKeyboard();
      this.installReliableControls();
      this.touchControls = window.ITHeroTouchControls?.attach(this);
      this.createHUD();
      this.createOverlay();
      this.posters = window.ITHeroPosters.mount(this, FLOORS);
      this.pacing = window.ITHeroGameplay.create(this, FLOORS, !!data.resumeCheckpoint);
      this.genZ = window.ITHeroGenZ.create(this, FLOORS);
      ITHeroFinalManager.textures(this);
      ITHeroAppearance.prepare(this);
      this.secretConsole=ITHeroConsole.attach(this);
      this.trainingHud=this.add.text(480,74,'',{font:'bold 12px monospace',color:'#ffdd85',backgroundColor:'#182b28'}).setOrigin(.5).setScrollFactor(0).setDepth(110);
      window.ITHeroLobby?.mount(this);
      const restored = this.pacing.restore();
      if(restored)window.ITHeroPlayStats?.started();

      this.cameras.main.setBounds(0, 0, WIDTH, WORLD_HEIGHT);
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.startFollow(this.player, true, 0.13, 0, 0, 105);
      // Keep the ground visible when jumping or taking an upper service route.
      this.cameras.main.setScroll(0, FLOORS[this.floor] - 420);
      this.physics.world.setBounds(0, 0, WIDTH, WORLD_HEIGHT);
      this.cameras.main.fadeIn(350, 6, 13, 26);
      this.updateHUD();
      if (!restored) this.showOverlay('IT HERO', 'NO MORE MEETING',
        'Jsi ajťák na životně důležité misi.\nProjdi 9 pater a odpoj HDD u vedení.\nJakákoliv podobnost s čímkoliv z reálného světa a s čímkoliv jiným či podobným je čistě strategická.',
        'ENTER nebo kliknutí = HRÁT');
    }

    makeTextures() {
      // Normalize independently drawn atlas poses to a shared baseline without
      // stretching slim characters. Source rectangles isolate each pose.
      const poses = {
        'hero': [40, 16, 245, 342], 'hero-walk': [380, 16, 265, 342],
        'hero-duck': [744, 122, 244, 236],
        'secretary': [65, 365, 210, 358], 'secretary-scream': [385, 362, 267, 361],
        'union': [730, 365, 285, 358], 'union-whistle': [1090, 365, 302, 358],
        'manager': [35, 725, 279, 337], 'manager-stomp-0': [375, 728, 298, 336],
        'manager-stomp-1': [733, 728, 292, 336]
      };
      const source = this.textures.get('character-art').getSourceImage();
      Object.entries(poses).forEach(([key, [x, y, w, h]]) => {
        if (this.textures.exists(key)) return;
        const canvas = this.textures.createCanvas(key, 64, 80);
        const ctx = canvas.context;
        ctx.imageSmoothingEnabled = false;
        const height = key === 'hero-duck' ? 49 : 76;
        const width = Math.round(w * height / h);
        ctx.drawImage(source, x, y, w, h, Math.round((64 - width) / 2), 80 - height, width, height);
        canvas.refresh();
      });
      const supportSource = this.textures.get('support-art').getSourceImage();
      const supportPoses = {
        'old-it': [85, 12, 370, 482], 'old-it-crouch': [580, 120, 430, 374],
        'old-it-offer': [1120, 12, 380, 482],
        'specialist': [45, 502, 420, 495],
        'specialist-flag': [490, 533, 585, 464],
        'specialist-spray': [1070, 533, 465, 464]
      };
      Object.entries(supportPoses).forEach(([key, [x,y,w,h]]) => {
        if (this.textures.exists(key)) return;
        const canvas = this.textures.createCanvas(key, 136, 80);
        canvas.context.imageSmoothingEnabled = false;
        const height = key === 'old-it-crouch' ? 54 : 76;
        const width = Math.round(w * height / h);
        // Same body anchor (x=68) for wide flag / spray poses.
        const left = key === 'specialist-flag' ? 39 : key === 'specialist-spray' ? 46 : Math.round(68 - width / 2);
        canvas.context.drawImage(supportSource,x,y,w,h,left,80-height,width,height);
        canvas.refresh();
      });
      this.heroFrames=window.ITHeroMotion.complete(this,{idle:'hero',walk:'hero-walk',contact:'hero-duck'},{prefix:'hero-motion'});
      this.secretaryVariants=window.ITHeroMotion.secretaries(this);
      this.legacyFrames={};for(const kind of ['secretary','union','manager','specialist'])this.legacyFrames[kind]=window.ITHeroMotion.complete(this,{idle:kind,contact:kind==='secretary'?'secretary-scream':kind==='union'?'union-whistle':kind==='manager'?'manager-stomp-0':'specialist-flag'},{prefix:`legacy-${kind}`});
      window.ITHeroItems.create(this);
    }

    drawRoomBackdrop(y, level) {
      const plan = FLOOR_PLANS[level];
      const kind = ['open','reception'].includes(plan.type) ? 0 : ['office','executive'].includes(plan.type) ? 1 : 2;
      const texture = this.textures.get('floor-art');
      const source = texture.getSourceImage();
      const row = Math.floor(source.height / 3);
      // Preserve detailed architecture, but compress the rear furniture band so
      // desks behind glass read smaller than the foreground gameplay tables.
      const split = Math.round(row * 0.57);
      if (!texture.has(`upper-${kind}`)) {
        texture.add(`upper-${kind}`,0,0,kind*row,source.width,split);
        texture.add(`lower-${kind}`,0,0,kind*row+split,source.width,row-split);
      }
      const flip = [5,7].includes(level);
      const tint = level === 8 ? 0xf5e7c5 : level === 6 ? 0xcdd8df : level === 5 ? 0xdff5e3 : 0xffffff;
      this.add.image(0,y-414,'floor-art',`upper-${kind}`).setOrigin(0).setDisplaySize(WIDTH,304).setFlipX(flip).setTint(tint).setDepth(-10);
      this.add.image(0,y-110,'floor-art',`lower-${kind}`).setOrigin(0).setDisplaySize(WIDTH,110).setFlipX(flip).setTint(tint).setDepth(-10);
      const g = this.add.graphics().setDepth(-9);
      const r = (c,x,dy,w,h) => g.fillStyle(c).fillRect(x,y+dy,w,h);
      if(plan.type==='reception') {
        r(0x406b4e,180,-55,165,40);r(0xc6bd96,176,-61,174,7);
        r(0x9acc8e,192,-40,32,4);r(0xb9caaf,240,-40,83,2);
      } else if(plan.type==='meeting') {
        for(const x of [180,650]) {
          r(0x3b5041,x,-42,145,5);r(0xbaaa7c,x,-47,145,5);
          for(let i=0;i<3;i++){r(0x28543d,x+12+i*44,-29,24,17);r(0x62745e,x+20+i*44,-12,3,11);}
        }
      } else if(plan.type==='archive') {
        for(const x of [180,650]) {
          r(0x707b64,x,-90,130,77);
          for(let shelf=0;shelf<2;shelf++)for(let folder=0;folder<9;folder++) {
            r((folder+shelf)%3?0x235d42:0xb6ab77,x+5+folder*13,-84+shelf*34,10,28);
            r(0xe0dfb9,x+8+folder*13,-78+shelf*34,4,7);
          }
        }
      } else if(plan.type==='executive') {
        r(0x39734e,170,-23,200,12);r(0xc6b978,170,-23,200,2);
        r(0xb3a66b,650,-148,110,72);r(0x275d45,654,-144,102,64);
        this.add.text(705,y-112,'POSLEDNÍ\nZÁLOHA',{font:'bold 12px monospace',align:'center',color:'#e9ddb7'}).setOrigin(0.5).setDepth(-8);
      }
      return plan;
    }

    addStatic(group, x, y, w, h, color, depth = 8) {
      const r = this.add.rectangle(x, y, w, h, color).setDepth(depth);
      this.physics.add.existing(r, true);
      group.add(r);
      return r;
    }

    buildOffice() {
      const g = this.add.graphics().setDepth(-12);
      g.fillStyle(COLORS.dark).fillRect(0, 0, WIDTH, WORLD_HEIGHT);

      FLOORS.forEach((y, level) => {
        const plan = this.drawRoomBackdrop(y, level);
        g.fillStyle(0x253b36).fillRect(0, y, WIDTH, 38);
        g.fillStyle(0xa7b1a5).fillRect(0, y, WIDTH, 6);
        for (let x = 0; x < WIDTH; x += 32) g.fillStyle(0x4d6058).fillRect(x, y + 14, 28, 2);
        this.add.text(24, y - 348, `${String(level + 1).padStart(2, '0')}  /  ${plan.name}`, {
          fontFamily: 'monospace', fontSize: '14px', color: '#f4f0df',
          backgroundColor: '#064c37', padding: { x: 12, y: 7 }
        }).setDepth(-8);
        this.addStatic(this.platforms, WIDTH / 2, y + 17, WIDTH, 30, 0x77877a, 11);
      });

      // Stoly – překážky, které je potřeba přeskočit.
      FLOOR_PLANS.flatMap((plan, level) => plan.desks.map(x => [level, x])).forEach(([level, x]) => {
        const y = FLOORS[level];
        this.addStatic(this.obstacles, x, y - 19, 88, 38, 0x737d79, 10).setStrokeStyle(3,0x172b2b);
        this.add.rectangle(x, y - 42, 96, 9, 0xfff4d9).setStrokeStyle(2,0x203531).setDepth(11);
        this.add.rectangle(x - 19, y - 63, 45, 31, 0x132a3c).setDepth(12);
        this.add.rectangle(x - 19, y - 65, 38, 24, 0x42809b).setDepth(13);
        this.add.rectangle(x + 26, y - 42, 12, 7, 0xffdf82).setDepth(13);
        this.add.rectangle(x - 17, y - 43, 32, 4, 0xd4dee6).setDepth(13);
        const detail = this.add.graphics().setDepth(14);
        detail.fillStyle(0xa7e970).fillRect(x - 35, y - 73, 19, 2);
        detail.fillStyle(0x9bb7b1).fillRect(x - 35, y - 68, 10, 2);
        detail.fillStyle(0x6c7773).fillRect(x - 38, y - 35, 76, 2);
        detail.fillStyle(0x596661).fillRect(x + 5, y - 31, 2, 28);
        for (let line = 0; line < 3; line++) {
          detail.fillStyle(0xc4cbc3).fillRect(x + 12, y - 26 + line * 9, 20, 1);
          detail.fillStyle(0xe8ebde).fillRect(x + 21, y - 24 + line * 9, 4, 1);
        }
      });

      // Schodišťové dveře; každé další patro začíná u stejné šachty.
      this.doors = FLOORS.map((y, floor) => ({
        floor, y, x: floor % 2 ? 81 : 879,
        kind: floor === FLOOR_COUNT - 1 ? 'exit' : 'stairs'
      }));
      this.doors.forEach(({ x, y, kind }, floor) => {
        this.drawDoor(x, y, kind === 'exit');
        if (floor > 0) this.drawDoor(x === 879 ? 81 : 879, y, false, true);
        // Prosklená centrální šachta a nefunkční výtah na každém patře.
        const lift = this.add.graphics().setDepth(4);
        lift.fillStyle(0x354954).fillRect(440, y - 210, 120, 210);
        lift.fillStyle(0x92a4a8).fillRect(447, y - 158, 106, 158);
        lift.fillStyle(0x526974).fillRect(453, y - 151, 94, 151);
        lift.fillStyle(0x243b49).fillRect(498, y - 151, 4, 151);
        lift.fillStyle(0xd5e3d7).fillRect(449, y - 205, 102, 28);
        lift.fillStyle(0xe97568).fillRect(563, y - 92, 8, 8);
        lift.fillStyle(0xc7d6cb).fillRect(455, y - 149, 2, 146);
        lift.fillStyle(0x79978c).fillRect(535, y - 149, 6, 146);
        for (let stripe = 0; stripe < 9; stripe++) {
          const tx = 451 + stripe * 11;
          const ty = y - 77 + stripe * 4;
          lift.fillStyle(stripe % 2 ? 0x25352f : 0xf3d266).fillRect(tx, ty, 12, 7);
        }
        this.add.text(500, y - 192, `${floor + 1}  VÝTAH`, {font:'bold 12px monospace',color:'#243342'}).setOrigin(0.5).setDepth(5);
        this.add.text(500, y - 110, 'MIMO\nPROVOZ', {font:'bold 13px monospace',color:'#ffce83',align:'center',backgroundColor:'#283b49',padding:{x:5,y:5}}).setOrigin(0.5).setDepth(5);
      });
    }

    drawDoor(x, y, isExit, entry = false) {
      const color = isExit ? 0xc7a96e : entry ? 0x315a74 : 0x176344;
      const g = this.add.graphics().setDepth(5);
      g.fillStyle(0x0c1828).fillRect(x - 42, y - 118, 84, 118);
      const edge=isExit?0xffdf82:entry?0x90c5e5:0xb1ed75;
      g.fillStyle(edge).fillRect(x-40,y-117,80,117);
      g.fillStyle(0x172c2b).fillRect(x-36,y-113,72,113);
      g.fillStyle(color).fillRect(x - 32, y - 107, 64, 106);
      g.fillStyle(0x0a392e).fillRect(x - 25, y - 99, 50, 65);
      g.fillStyle(0xdde9da).fillRect(x + 21, y - 49, 5, 10);
      for (let k = 0; k < 5; k++) g.fillStyle(0xa6ef5d).fillRect(x - 20 + k * 8, y - 21 - k * 9, 9, 5);
      g.fillStyle(edge).fillRect(x-46,y-125,92,27);
      g.fillStyle(0x0b1926).fillRect(x - 44, y - 123, 88, 23);
      const label = isExit ? 'HDD ↓' : entry ? 'PŘÍCHOD' : 'SCHODY ↓';
      this.add.text(x, y - 111, label, {
        font: 'bold 12px monospace', color: isExit ? '#ffdb8c' : '#b2ffee'
      }).setOrigin(0.5).setDepth(6);
      if (isExit) this.add.text(x, y - 137, 'ŘEDITEL', {
        font: 'bold 13px monospace', color: '#ffe2a5'
      }).setOrigin(0.5).setDepth(6);
    }

    createActors() {
      this.player = this.physics.add.sprite(82, FLOORS[0] - 40, 'hero');
      this.player.setScale(1).setDepth(23).setMaxVelocity(250, 860);
      this.player.setCollideWorldBounds(true).setDragX(1050).setBounce(0);
      this.player.body.setSize(28, 72).setOffset(18, 8);

      this.enemySpecs = FLOORS.flatMap((_, floor) => [
        {kind: floor === 8 ? 'manager' : floor % 3 === 1 ? 'union' : 'secretary', floor, x: 590, hp: floor === 8 ? 8 : 3 + Math.floor(floor / 3), patrol: 30, delay: 1800 - floor * 65},
        ...([2, 4, 6, 7].includes(floor) ? [{kind:'specialist', floor, x:790, hp:5, patrol:26, delay:1600}] : []),
        ...(floor > 1 ? [{kind:'secretary', floor, x:350, hp:3, patrol:25, delay:1900 - floor * 45}] : [])
      ]);
      this.enemySpecs.forEach((spec, i) => {
        const e = this.enemies.create(spec.x, FLOORS[spec.floor] - 36, spec.kind);
        e.setScale(1).setDepth(22).setCollideWorldBounds(true);
        e.body.setSize(spec.kind === 'secretary' ? 24 : 38, 72).setOffset(spec.kind === 'specialist' ? 49 : spec.kind === 'secretary' ? 20 : 13, 8);
        e.kind = spec.kind;
        e.floorIndex = spec.floor;
        e.hp = spec.hp;
        e.baseX = spec.x;
        e.patrol = spec.patrol;
        e.direction = i % 2 ? 1 : -1;
        e.lastAttack = spec.kind==='manager'?Infinity:0;
        e.shotsThrown = 0;
        e.visualFrames=spec.kind==='secretary'?this.secretaryVariants[spec.floor%3].frames:this.legacyFrames[spec.kind];
        e.variant=spec.kind==='secretary'?this.secretaryVariants[spec.floor%3].id:null;
        e.setTexture(e.visualFrames.idle);
        e.contactUntil = 0;
        e.lastStomp = -1000;
        e.attackDelay = spec.delay;
      });
      this.enemyTrio = window.ITHeroEnemyCatalog.create(this, FLOORS);
      this.colleague = window.ITHeroColleague.create(this, FLOORS, FLOOR_PLANS);
      this.oldBadger = window.ITHeroOldBadger.create(this, FLOORS);
      FLOORS.flatMap((_, floor) => [[floor, 192], [floor, 790]]).forEach(([floor, x]) => {
        const coffee = this.coffees.create(x, FLOORS[floor] - 17, 'coffee');
        coffee.setScale(1.2).setDepth(19).refreshBody();
        coffee.setData('floor', floor);
        const steam = this.add.graphics().setDepth(20);
        coffee.setData('steam',steam);
      });
      [2, 5, 7].forEach(floor => {
        this.upgrades.create(220, FLOORS[floor] - 35, 'cd').setScale(2).setDepth(20).refreshBody();
        this.add.text(220, FLOORS[floor] - 75, 'CD UPGRADE', {font:'bold 11px monospace',color:'#ffe0ff'}).setOrigin(0.5).setDepth(20);
      });
    }

    spawnHelper(source = Phaser.Math.Between(0, 1) ? 'lift' : 'desk', kind = Phaser.Math.Between(0, 1) ? 'beer' : 'hotdog') {
      if (this.helperVisit || this.gameState !== 'playing') return;
      const floor = this.floor;
      const x = source === 'lift' ? 500 : FLOOR_PLANS[this.floor].desks[this.player.x < 480 ? 0 : 1];
      const desiredX = source === 'lift' ? (this.player.x < 500 ? 435 : 565) : x - 68;
      const dropX = [desiredX,125,190,390,610,780,840].sort((a,b)=>Math.abs(a-desiredX)-Math.abs(b-desiredX))
        .find(candidate=>this.colleague.safe(candidate,floor));
      if (dropX === undefined) return;
      const sprite = this.add.sprite(x, FLOORS[floor], source === 'desk' ? 'old-it-crouch' : 'old-it').setOrigin(0.5,1).setDepth(source === 'desk' ? 9 : 20);
      const doorway = source === 'lift' ? this.add.rectangle(x,FLOORS[floor]-73,82,146,0x152a25).setDepth(7) : null;
      this.helperVisit = {floor,source,kind,x,dropX,sprite,doorway,started:this.playTime,dropped:false};
      this.sayOldHelper(this.helperVisit, 'peek');
      this.nextHelperAt = this.playTime + Phaser.Math.Between(24000,32000);
    }

    sayOldHelper(visit, category) {
      visit.speech?.destroy();
      const line = Phaser.Utils.Array.GetRandom(OLD_HELPER_LINES[category]);
      visit.speech = this.add.text(Phaser.Math.Clamp(visit.sprite.x,150,810),visit.sprite.y-Math.max(visit.sprite.displayHeight+14,145),line,
        {font:'bold 12px monospace',color:'#e9f6cd',backgroundColor:'#173c2e',
          wordWrap:{width:260},align:'center',padding:{x:8,y:6}}).setOrigin(0.5,1).setDepth(106);
      this.posters.showMessage(`STARÝ AJŤÁK\n${line}`, OLD_HELPER_TIMING.panelDuration);
    }

    updateHelper(delta) {
      this.playTime += delta;
      const visit = this.helperVisit;
      if (visit) {
        const age = this.playTime - visit.started;
        visit.sprite.setAlpha(Math.min(1,age/300,Math.max(0,(OLD_HELPER_TIMING.visitDuration-age)/500)));
        if (visit.floor !== this.floor || age > OLD_HELPER_TIMING.visitDuration) {
          visit.speech?.destroy();
          visit.sprite.destroy();
          if (visit.doorway) visit.doorway.destroy();
          this.helperVisit = null;
        } else if (age >= OLD_HELPER_TIMING.offerAt && !visit.dropped) {
          visit.dropped = true;
          visit.sprite.setTexture('old-it-offer').setDepth(20).setX(visit.source === 'desk' ? visit.x - 60 : visit.x);
          const item = this.aidItems.create(visit.dropX,FLOORS[this.floor]-22,visit.kind).setScale(1.5).setDepth(21).refreshBody();
          item.setData('expires',this.playTime + 11000);
          const label = this.add.text(visit.dropX,FLOORS[this.floor]-98,visit.kind === 'beer' ? 'PLZEŇ • PLNÉ ZDRAVÍ' : 'PÁREK • PLNÉ ZDRAVÍ', {font:'bold 10px monospace',color:'#f4e3a2',backgroundColor:'#173c2e',padding:{x:4,y:3}}).setOrigin(0.5).setDepth(105);
          item.setData('label',label);
          this.sayOldHelper(visit, visit.kind);
          this.tone(680,0.12,'triangle');
        }
      } else if (this.playTime >= this.nextHelperAt) this.spawnHelper();
      this.aidItems.getChildren().slice().forEach(item => {
        const remaining = item.getData('expires') - this.playTime;
        if (remaining <= 0) this.removeAid(item);
        else item.setAlpha(remaining < 3000 && Math.floor(this.playTime/180)%2 ? 0.35 : 1);
      });
    }

    removeAid(item) {
      const label = item.getData('label');
      if (label) label.destroy();
      item.destroy();
    }

    collectAid(item) {
      if (this.gameState !== 'playing' || !item.active) return;
      this.energy = this.maxEnergy;
      this.removeAid(item);
      this.updateHUD();
      this.popText(this.player.x,this.player.y-65,'ZDRAVÍ DOPLNĚNO DO PLNA', '#a9ed63');
      this.tone(820,0.17,'triangle');
    }

    collectUpgrade(upgrade) {
      if (this.gameState !== 'playing' || !upgrade.active) return;
      upgrade.destroy();
      this.weapon = 'cd';
      this.updateHUD();
      this.popText(this.player.x, this.player.y - 65, 'CD UPGRADE • 2× SÍLA', '#dca5ed');
      this.tone(880, 0.2, 'triangle');
    }

    configurePhysics() {
      // Ignore only the service bridge being dropped through; floors and desks stay solid.
      this.physics.add.collider(this.player, this.platforms, undefined, (player, platform) => {
        if (this.dropThroughPlatform !== platform) return true;
        if (player.body.top <= platform.body.bottom + 2) return false;
        this.dropThroughPlatform = null;
        return true;
      });
      this.physics.add.collider(this.player, this.obstacles);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.collider(this.enemies, this.obstacles);
      this.physics.add.collider(this.playerShots, this.platforms, shot => shot.destroy());
      this.physics.add.collider(this.playerShots, this.obstacles, shot => shot.destroy());
      this.physics.add.collider(this.enemyShots, this.platforms, shot => shot.destroy());
      this.physics.add.collider(this.enemyShots, this.obstacles, shot => shot.destroy());
      this.physics.add.overlap(this.player, this.aidItems, (_, item) => this.collectAid(item));
      this.physics.add.overlap(this.player, this.upgrades, (_, upgrade) => this.collectUpgrade(upgrade));
      this.physics.add.overlap(this.player, this.coffees, (_, coffee) => this.collectCoffee(coffee));
      this.oldBadger.configurePhysics();
      this.physics.add.overlap(this.playerShots, this.enemies, (shot, enemy) => this.hitEnemy(shot, enemy));
      this.physics.add.overlap(this.player, this.enemyShots, (_, shot) => {
        if (!shot.active) return;
        if (shot.getData('floor') !== undefined && shot.getData('floor') !== this.floor) { shot.destroy(); return; }
        const sourceX = shot.x;
        const damage = shot.getData('damage') || 1;
        shot.destroy();
        this.takeDamage(sourceX, damage);
      });
      this.physics.add.overlap(this.player, this.enemies, (_, enemy) => this.enemyContact(enemy));
    }

    configureKeyboard() {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = {
        left: [this.input.keyboard.addKey(K.A), this.input.keyboard.addKey(K.LEFT)],
        right: [this.input.keyboard.addKey(K.D), this.input.keyboard.addKey(K.RIGHT)],
        jump: [this.input.keyboard.addKey(K.W), this.input.keyboard.addKey(K.UP), this.input.keyboard.addKey(K.SPACE)],
        crouch: [this.input.keyboard.addKey(K.S), this.input.keyboard.addKey(K.DOWN)],
        shoot: [this.input.keyboard.addKey(K.J), this.input.keyboard.addKey(K.CTRL)],
        interact: this.input.keyboard.addKey(K.E),
        enter: this.input.keyboard.addKey(K.ENTER),
        restart: this.input.keyboard.addKey(K.R),
        mute: this.input.keyboard.addKey(K.M),
        pause: this.input.keyboard.addKey(K.ESC)
      };
      this.input.keyboard.addCapture([K.UP, K.DOWN, K.LEFT, K.RIGHT, K.SPACE, K.CTRL]);
      this.input.on('pointerdown', () => {
        if (this.gameState === 'menu' || this.gameState === 'win' || this.gameState === 'lose') this.handleStart();
      });
    }

    // Klávesy jsou snímány i přímo na dokumentu: fungují také při otevření přes file://,
    // kdy některé kombinace prohlížeč/Phaser nemusí předat první vstup hře.
    installReliableControls() {
      this.browserHeld = new Set();
      this.browserPressed = new Set();
      this.browserMap = {
        left: ['KeyA', 'ArrowLeft'],
        right: ['KeyD', 'ArrowRight'],
        jump: ['KeyW', 'ArrowUp', 'Space'],
        crouch: ['KeyS', 'ArrowDown'],
        shoot: ['KeyJ', 'ControlLeft', 'ControlRight'],
        interact: ['KeyE'],
        mute: ['KeyM']
      };
      const allGameCodes = new Set([
        ...Object.values(this.browserMap).flat(), 'Enter', 'NumpadEnter', 'Escape', 'KeyR'
      ]);
      const isTyping = (node) => node && (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName) || node.isContentEditable
      );
      const button = document.getElementById('game-action');
      const surface = document.getElementById('game');
      const startFromBrowser = () => {
        if (this.gameState === 'menu' || this.gameState === 'win' || this.gameState === 'lose') {
          this.handleStart();
        }
        if (this.gameState === 'paused') this.handleStart();
        // Ponecháme fokus ve hře, nikoli na tlačítku.
        if (this.game && this.game.canvas && this.game.canvas.focus) {
          this.game.canvas.focus({ preventScroll: true });
        }
      };
      const onKeyDown = (event) => {
        if (isTyping(event.target)) return;
        if (!allGameCodes.has(event.code)) return;
        event.preventDefault();
        if (!this.browserHeld.has(event.code)) this.browserPressed.add(event.code);
        this.browserHeld.add(event.code);
        if (event.repeat) return;
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
          if (this.gameState !== 'playing') startFromBrowser();
        } else if (event.code === 'Escape') {
          this.togglePause();
        } else if (event.code === 'KeyR' && (this.gameState === 'win' || this.gameState === 'lose')) {
          this.handleStart();
        }
      };
      const onKeyUp = (event) => {
        this.browserHeld.delete(event.code);
        // Krátké stisknutí musí zůstat ve frontě do příštího herního snímku.
      };
      const onBlur = () => { this.browserHeld.clear(); this.browserPressed.clear(); };
      const onSurfaceClick = () => {
        if (this.gameState === 'menu' || this.gameState === 'win' || this.gameState === 'lose') startFromBrowser();
      };
      if (this.game && this.game.canvas) this.game.canvas.tabIndex = 0;
      if (button) button.addEventListener('click', startFromBrowser);
      if (surface) surface.addEventListener('pointerdown', onSurfaceClick);
      document.addEventListener('keydown', onKeyDown, true);
      document.addEventListener('keyup', onKeyUp, true);
      window.addEventListener('blur', onBlur);
      this.events.once('shutdown', () => {
        if (button) button.removeEventListener('click', startFromBrowser);
        if (surface) surface.removeEventListener('pointerdown', onSurfaceClick);
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('keyup', onKeyUp, true);
        window.removeEventListener('blur', onBlur);
      });
    }

    browserDown(action) {
      return (this.browserMap[action] || []).some(code => this.browserHeld.has(code)) || !!this.touchControls?.isDown(action);
    }

    browserJustPressed(action) {
      const codes = this.browserMap[action] || [];
      const result = codes.some(code => this.browserPressed.has(code));
      codes.forEach(code => this.browserPressed.delete(code));
      const touch = this.touchControls?.justPressed(action);
      return result || !!touch;
    }

    togglePause() {
      if(this.outdoorVisit){this.outdoorVisit.scene.togglePause();return;}
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.physics.world.pause();
        this.showOverlay('PAUZA', 'VÝPADEK NA FIREWALLU',
          this.touchControls?.enabled ? 'Pokračuj tlačítkem pauzy nebo klepnutím.\nPohyb i střelba teď odpočívají.' : 'Můžeš pokračovat klávesou ESC.\nRychlost, střelba i šanony zůstávají stejné.', 'ESC / KLIK = POKRAČOVAT');
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.physics.world.resume();
        this.hideOverlay();
      }
    }

    createHUD() {
      this.add.rectangle(480,510,960,64,0x102b24).setDepth(100).setScrollFactor(0);
      this.add.rectangle(480, 27, 960, 54, 0x0b1627, 0.94).setDepth(101).setScrollFactor(0);
      this.add.rectangle(480, 54, 960, 2, 0x3c526e).setDepth(101).setScrollFactor(0);
      this.add.text(22, 9, 'IT HERO', {font: 'bold 20px monospace', color: '#a9ed63'}).setScrollFactor(0).setDepth(102);
      this.add.text(150, 8, 'ENERGIE', {font: 'bold 12px monospace', color: '#a9bad1'}).setScrollFactor(0).setDepth(102);
      this.energyCells = [];
      for (let i = 0; i < 5; i++) {
        this.add.rectangle(161 + i * 26, 34, 21, 10, 0x22334d).setScrollFactor(0).setDepth(103);
        const cell = this.add.rectangle(161 + i * 26, 34, 17, 6, COLORS.mint).setScrollFactor(0).setDepth(104);
        this.energyCells.push(cell);
      }
      this.floorText = this.add.text(438, 14, '', {font: 'bold 16px monospace', color: '#f4e0ab'}).setScrollFactor(0).setDepth(102);
      this.weaponText = this.add.text(660, 17, 'DISKETY', {font:'bold 12px monospace',color:'#dca5ed'}).setScrollFactor(0).setDepth(102);
      this.scoreText = this.add.text(937, 14, '', {font: 'bold 15px monospace', color: '#ecf4ff'}).setOrigin(1, 0).setScrollFactor(0).setDepth(102);
      this.promptText = this.add.text(480, 479, '', {
        font: 'bold 17px monospace', color: '#fef0c0', backgroundColor: '#16263e',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(104);
      this.tipText = this.add.text(480, 512, '', {
        font: '12px monospace', color: '#b0c2d8'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(104);
      this.events.on('shutdown', () => {
        if (this.audioCtx) this.audioCtx.close().catch(() => {});
      });
    }

    drawExterior() {
      return this.add.image(608, 52, 'exterior-art').setOrigin(0).setDisplaySize(312, 416);
    }

    createOverlay() {
      const shade = this.add.rectangle(480, 270, 960, 540, 0x061e18, 0.94);
      const panel = this.add.rectangle(308, 266, 556, 366, 0x0c3028);
      const exterior = this.drawExterior();
      panel.setStrokeStyle(4, 0x95de64);
      this.overlayTitle = this.add.text(308, 121, '', {
        font: 'bold 48px monospace', color: '#a9ed63'
      }).setOrigin(0.5);
      this.overlaySub = this.add.text(308, 170, '', {
        font: 'bold 17px monospace', color: '#ffdf82'
      }).setOrigin(0.5);
      this.overlayBody = this.add.text(308, 261, '', {
        font: '14px monospace', color: '#d9e4f6', align: 'center', lineSpacing: 8, wordWrap: {width: 480, useAdvancedWrap: true}
      }).setOrigin(0.5);
      this.overlayAction = this.add.text(480, 378, '', {
        font: 'bold 17px monospace', color: '#101d2a', backgroundColor: '#a9ed63',
        padding: { x: 18, y: 12 }
      }).setOrigin(0.5);
      this.overlay = this.add.container(0, 0, [shade, panel, exterior, this.overlayTitle, this.overlaySub, this.overlayBody]);
      this.overlayAction.destroy(); // Tlačítko je nyní skutečný HTML element s nativní obsluhou kliknutí.
      this.overlayAction = null;
      this.overlay.setDepth(400).setScrollFactor(0);
    }

    showOverlay(title, sub, message, action) {
      this.overlayTitle.setText(title);
      this.overlaySub.setText(sub);
      this.overlayBody.setFontSize(this.gameState === 'lose' ? 13 : 14);
      this.overlayBody.setText(message);
      this.overlay.setVisible(true);
      const button = document.getElementById('game-action');
      if (button) {
        button.textContent = action;
        button.hidden = false;
      }
    }

    hideOverlay() {
      this.overlay.setVisible(false);
      const button = document.getElementById('game-action');
      if (button) button.hidden = true;
    }

    handleStart() {
      if (window.ITHeroScores?.isOpen() || window.ITHeroEnding?.isRunning()) return;
      if (this.gameState === 'menu') {
        this.gameState = 'playing';
        window.ITHeroPlayStats?.started();
        this.hideOverlay();
        this.tone(420, 0.07, 'triangle');
      } else if (this.gameState === 'paused') {
        this.togglePause();
      } else if (this.gameState === 'lose' || this.gameState === 'win') {
        // Změna stavu před restartem brání duplicitnímu spuštění při jednom kliknutí.
        const resumeCheckpoint = this.gameState === 'lose' && !!this.registry.get(window.ITHeroGameplay.checkpointKey);
        if (!resumeCheckpoint) this.registry.remove(window.ITHeroGameplay.checkpointKey);
        this.gameState = 'restarting';
        this.scene.restart({resumeCheckpoint});
      }
    }

    tone(freq, duration = 0.09, wave = 'square') {
      if (this.isMuted) return;
      try {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const volume = this.audioCtx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now);
        volume.gain.setValueAtTime(0.045, now);
        volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(volume).connect(this.audioCtx.destination);
        osc.start(now); osc.stop(now + duration + 0.015);
      } catch (_) { /* zvuk je nepovinný */ }
    }

    updateHUD() {
      this.energyCells.forEach((rect, i) => rect.setFillStyle(i < this.energy ? 0xa9ed63 : 0x30435a));
      if (this.weaponText) this.weaponText.setText(this.weapon === 'cd' ? 'CD • 2×' : 'DISKETY');
      this.floorText.setText(`PATRO ${this.floor + 1} / ${FLOOR_COUNT}`);
      this.scoreText.setText(`SKÓRE ${String(this.score).padStart(5, '0')}`);
    }

    dropUnionCoffee(enemy) {
      const floor=enemy.floorIndex,ground=FLOORS[floor];
      const blocked=x=>[...this.obstacles.getChildren(),...this.platforms.getChildren()].some(o=>o.body?.enable&&o.body.top<ground-8&&o.body.bottom>ground-28&&o.body.left<x+14&&o.body.right>x-14);
      const x=[enemy.x-50,enemy.x+50,192,790,130,835].find(x=>x>50&&x<910&&!blocked(x));if(x===undefined)return;
      const coffee=this.coffees.create(x,ground-17,'coffee').setDepth(24).setScale(1.2).refreshBody();coffee.setData('floor',floor).setData('expires',this.playTime+12000);
      this.popText(enemy.x,enemy.body.top-25,'Zítra budeme pískat všichni.','#e9f6c5',5000);this.posters.showMessage('ODBORÁŘ\nZítra budeme pískat všichni.',7000);
    }

    collectCoffee(coffee) {
      if (this.gameState !== 'playing' || !coffee.active) return;
      const steam = coffee.getData('steam');
      if (steam) steam.destroy();
      coffee.destroy();
      this.energy = Math.min(this.maxEnergy, this.energy + 1);
      this.score += 50;
      this.tone(610, 0.10, 'sine');
      this.time.delayedCall(90, () => this.tone(840, 0.13, 'sine'));
      this.popText(this.player.x, this.player.y - 45, '+ KÁVA  +50', '#f7db91');
      this.updateHUD();
    }

    popText(x, y, str, color = '#eaf4ff', visibleDuration = 820) {
      const text = this.add.text(x, y, str, {
        font: 'bold 15px monospace', color, stroke: '#111c2a', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      this.tweens.add({ targets: text, y: y - 45, alpha: 0, duration: 820, delay: Math.max(0, visibleDuration - 820),
        onComplete: () => text.destroy() });
    }

    fire() {
      this.playerAttackUntil=this.time.now+160;
      this.player.setTexture(this.heroFrames.attack);
      const x = this.player.x + this.facing * 22;
      const y = this.player.y - 5;
      const bullet = this.playerShots.create(x, y, this.weapon);
      bullet.setDepth(26).setScale(1.6).setVelocityX(this.facing * 560);
      bullet.body.setAllowGravity(false);
      bullet.setData('damage', this.weapon === 'cd' ? 2 : 1);
      bullet.setAngularVelocity(this.weapon === 'cd' ? 720 : 300);
      bullet.setData('expires', this.time.now + 1250);
      if (this.facing < 0) bullet.setFlipX(true);
      this.tone(510, 0.045);
    }

    enemyDialogue(enemy, group) {
      if (this.gameState !== 'playing' || !enemy.active || enemy.floorIndex !== this.floor) return;
      if (this.playTime < (enemy.nextDialogueAt || 0)) return;
      const lines = window.ITHeroDialogue.lines(enemy.kind, group);
      if (!lines.length) return;
      const line = Phaser.Utils.Array.GetRandom(lines);
      enemy.nextDialogueAt = this.playTime + 7000;
      this.popText(Phaser.Math.Clamp(enemy.x, 160, 800), enemy.y - 65, line, '#eaf4ff', 3500);
      const name = window.ITHeroDialogue.characters.find(c => c.id === enemy.kind).name;
      this.posters.showMessage(`${name}\n${line}`, 7000);
    }

    enemyContact(enemy) {
      if(enemy.kind==='manager'){this.enemyDialogue(enemy,'contact');ITHeroFinalManager.start(this,enemy,'jump');return;}
      if (enemy.profile) { this.enemyTrio.contact(enemy); return; }
      if (this.gameState !== 'playing' || !enemy.active || enemy.floorIndex !== this.floor) return;
      this.pacing.cancel(enemy);
      this.takeDamage(enemy.x);
      if (this.time.now < enemy.contactUntil) return;
      enemy.contactUntil = this.time.now + 1000;
      enemy.setVelocityX(0);
      if (enemy.kind === 'secretary') {
        enemy.setTexture(enemy.visualFrames.contact);
        this.enemyDialogue(enemy, 'contact');
        this.tone(1250, 0.35, 'sawtooth');
      } else if (enemy.kind === 'union') {
        enemy.setTexture('union-whistle');
        this.enemyDialogue(enemy, 'contact');
        this.tone(2300, 0.4, 'sine');
      } else if (enemy.kind === 'specialist') {
        enemy.setTexture('specialist-flag');
        this.enemyDialogue(enemy, 'combat');
        this.specialistAttack(enemy, 'rainbow-flag');
        this.tone(320,0.12,'triangle');
      } else {
        enemy.setTexture('manager-stomp-0');
        this.enemyDialogue(enemy, 'contact');
      }
    }

    enemyAttack(enemy) {
      if(enemy.kind==='manager'){ITHeroFinalManager.start(this,enemy);return;}
      if (enemy.profile) { this.enemyTrio.attack(enemy); return; }
      if (enemy.kind === 'specialist') {
        this.enemyDialogue(enemy, 'combat');
        this.specialistAttack(enemy, Math.abs(this.player.x-enemy.x)<135 ? 'rainbow-spray' : 'unicorn');
        return;
      }
      enemy.setTexture(enemy.visualFrames.attack);enemy.poseUntil=this.time.now+350;
      const direction = this.player.x >= enemy.x ? 1 : -1;
      const near = Math.abs(this.player.x - enemy.x) < 180;
      const alternate = enemy.shotsThrown++ % 2;
      const projectile = enemy.kind === 'manager' ? 'gold-card'
        : enemy.kind === 'union' ? (alternate ? 'gear' : 'hammer')
        : (near || alternate ? 'mug' : 'folder');
      const item = this.enemyShots.create(enemy.x + 19 * direction, enemy.y - 5, projectile);
      item.setScale(1.5).setDepth(25);
      item.body.setAllowGravity(false);
      item.setVelocity(direction * (enemy.kind === 'manager' ? 315 : 245), enemy.kind === 'manager' ? 0 : -45);
      item.setAngularVelocity(direction * (projectile === 'gear' ? 600 : 360));
      item.setData('expires', this.time.now + 1900);
      enemy.setFlipX(direction < 0);
      this.tone(170, 0.06, 'triangle');
    }

    specialistAttack(enemy, projectile) {
      const direction = this.player.x >= enemy.x ? 1 : -1;
      enemy.setTexture(projectile==='rainbow-spray'?'specialist-spray':enemy.visualFrames.attack);enemy.poseUntil=this.time.now+350;
      const short = projectile !== 'unicorn';
      const item = this.enemyShots.create(enemy.x + direction*(short ? 52 : 27),enemy.y-5,projectile).setDepth(26);
      item.body.setAllowGravity(false);
      item.setFlipX(direction<0).setVelocityX(short ? direction*35 : direction*270);
      item.setData('expires',this.time.now+(short ? 350 : 1800));
      if (!short) item.setScale(1.3);
      enemy.setFlipX(direction<0);
      if (projectile === 'rainbow-spray') {
        enemy.setTexture('specialist-spray');
        enemy.contactUntil = this.time.now + 450;
        this.tone(900,0.1,'sawtooth');
      }
    }

    hitEnemy(shot, enemy) {
      if (this.gameState !== 'playing' || !shot.active || !enemy.active || enemy.defeated) return;
      if (this.oldBadger.intercept(shot)) return;
      const damage = shot.getData('damage') || 1;
      shot.destroy();
      this.pacing.cancel(enemy);
      enemy.hp -= damage;
      if(enemy.kind==='manager')ITHeroFinalManager.cancel(enemy,this.playTime);
      if(enemy.kind==='union'&&this.playTime>(enemy.nextCoffeeDrop||0)&&Math.random()<.3){enemy.nextCoffeeDrop=this.playTime+12000;this.dropUnionCoffee(enemy);}
      if(!enemy.profile){enemy.hitUntil=this.time.now+160;enemy.setTexture(enemy.visualFrames.hit);}
      if (enemy.profile) this.enemyTrio.hit(enemy);
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(90, () => { if (enemy.active) enemy.clearTint(); });
      this.tone(245, 0.045);
      if (enemy.hp <= 0) {
        this.pacing.recordDefeat(enemy);
        this.score += enemy.profile ? enemy.profile.score : enemy.kind === 'manager' ? 250 : 100;
        this.popText(enemy.x, enemy.y - 27, enemy.profile ? `+${enemy.profile.score}` : enemy.kind === 'manager' ? '+250 ŠÉF' : '+100', '#91ffe0');
        if (enemy.profile) this.enemyTrio.defeat(enemy);
        else {enemy.defeated=true;enemy.body.enable=false;enemy.setTexture(enemy.visualFrames.defeat);this.tweens.add({targets:enemy,alpha:0,duration:220,onComplete:()=>enemy.destroy()});}
        if (enemy.kind === 'sap_integrator') this.pacing.checkpoint();
        this.updateHUD();
      }
    }

    nextDeathLine() {
      let queue = this.registry.get('deathLines');
      if (!queue || !queue.length) {
        queue = Phaser.Utils.Array.Shuffle([...DEATH_LINES]);
        if (queue[0] === this.registry.get('lastDeathLine')) [queue[0],queue[1]] = [queue[1],queue[0]];
      }
      const line = queue.shift();
      this.registry.set('deathLines',queue);
      this.registry.set('lastDeathLine',line);
      return line;
    }

    takeDamage(sourceX, damage = 1) {
      if(ITHeroAppearance.state.god)return;
      if (this.gameState !== 'playing' || this.time.now - this.lastHit < 1250) return;
      this.lastHit = this.time.now;
      this.playerHitUntil=this.time.now+180;
      this.player.setTexture(this.heroFrames.hit);
      this.pacing.interrupt();
      this.energy = Math.max(0, this.energy - damage);
      this.player.setVelocityX(this.player.x < sourceX ? -280 : 280);
      this.player.setVelocityY(-185);
      this.cameras.main.shake(100, 0.0038);
      this.tone(135, 0.20, 'sawtooth');
      this.popText(this.player.x, this.player.y - 42, `-${damage} ENERGIE`, '#ff8ca6');
      this.updateHUD();
      if (this.energy === 0) {
        this.pacing.retainElapsed();
        this.gameState = 'lose';
        this.player.setVelocityX(0);
        const line = this.nextDeathLine();
        this.time.delayedCall(350, () => this.showOverlay('DOSTALI TĚ!', 'TVŮJ NOVÝ ÚKOL:',
          `${line}\n\nPatro ${this.floor + 1} / ${FLOOR_COUNT} • Skóre ${this.score}${this.pacing.state.checkpoint ? '\nPokračuješ ze zálohy v 5. patře.' : ''}`, this.pacing.state.checkpoint ? 'ENTER / KLIK = OBNOVIT ZÁLOHU' : 'ENTER / KLIK = ZKUSIT ZNOVU'));
      }
    }

    finishMission(timeBonus, elapsed) {
      if (this.gameState !== 'playing') return;
      this.gameState = 'win';
      this.score += this.energy * 100 + 500 + timeBonus;
      this.updateHUD();
      this.tone(660, 0.20, 'sine');
      this.time.delayedCall(130, () => this.tone(990, 0.27, 'sine'));
      window.ITHeroEnding.play(this, {score:this.score, elapsed, bonus:timeBonus});
    }

    interact() {
      if(window.ITHeroOutdoor.nearDoor(this)){window.ITHeroOutdoor.enter(this);return;}
      const door = this.doors[this.floor];
      if (Math.abs(this.player.x - 500) < 65) {
        this.popText(500, this.player.y - 65, 'VÝTAH NEFUNGUJE • POUŽIJ SCHODY', '#ffce83');
        return;
      }
      if (Math.abs(this.player.x - door.x) > 74 || Math.abs(this.player.y - (door.y - 25)) > 110 || this.transitioning) return;
      if (door.kind === 'exit') { this.pacing.requestDisconnect(); return; }
      this.transitioning = true;
      this.player.setVelocity(0, 0);
      this.dropThroughPlatform = null;
      this.tone(740, 0.15, 'triangle');
      this.cameras.main.fadeOut(220, 7, 15, 28);
      this.time.delayedCall(230, () => {
        this.floor++;
        this.colleague.changeFloor();
        this.oldBadger.clear();
        this.aidItems.getChildren().slice().forEach(item => this.removeAid(item));
        const spawnX = this.floor % 2 ? 872 : 88;
        this.player.setPosition(spawnX, FLOORS[this.floor] - 50);
        this.player.setVelocity(0, 0);
        this.player.body.reset(spawnX, FLOORS[this.floor] - 50);
        this.player.alpha = 1;
        this.lastHit = this.time.now;
        this.score += 150;
        this.updateHUD();
        this.cameras.main.setScroll(0, FLOORS[this.floor] - 420);
        if (this.floor === 8) this.posters.showMessage('POSLEDNÍ PATRO\nPoraz šéfa, přeskoč poslední salvu a podržením skrčení odpoj HDD.', 6500);
        this.cameras.main.fadeIn(300, 7, 15, 28);
        this.popText(spawnX, FLOORS[this.floor] - 80, `PATRO ${this.floor + 1}  +150`, '#ffe6a6');
        this.transitioning = false;
      });
    }

    update(time, delta) {
      if (!this.keys) return;
      this.touchControls?.sync();
      const pressed = (action) => {
        // Obě cesty vyhodnotíme bez zkráceného ||, abychom nevyvolali akci dvakrát.
        const browser = this.browserJustPressed(action);
        const phaser = (Array.isArray(this.keys[action]) ? this.keys[action] : [this.keys[action]])
          .some(k => k && Phaser.Input.Keyboard.JustDown(k));
        return browser || phaser;
      };
      if (pressed('mute')) {
        this.isMuted = !this.isMuted;
        this.tipText.setText(this.isMuted ? 'ZVUK VYPNUT (M)' : 'ZVUK ZAPNUT (M)');
      }
      this.posters.update(this.player, this.floor, this.gameState === 'playing' && !this.transitioning, delta);
      this.pacing.tick(delta);
      this.dbpm.tick(delta);
      this.genZ.update(delta);
      this.colleague.update(delta);
      this.oldBadger.update(delta);
      // START/PAUZA/RESTART mají přímou DOM obsluhu, nezávislou na Phaser input.
      if (this.gameState !== 'playing' || this.transitioning) {
        if (this.gameState !== 'playing') this.promptText.setText('');
        return;
      }

      this.updateHelper(delta);
      const down = action => this.browserDown(action) || (
        Array.isArray(this.keys[action]) ? this.keys[action] : [this.keys[action]]
      ).some(k => k && k.isDown);
      const left = down('left');
      const right = down('right');
      const moving = left !== right;
      if (moving) {
        this.facing = left ? -1 : 1;
        this.player.setVelocityX(this.facing * (this.wasCrouching ? 112 : 230));
        this.player.setFlipX(this.facing < 0);
      } else {
        this.player.setVelocityX(0);
      }
      if (this.dropThroughPlatform && (!this.dropThroughPlatform.active ||
          this.player.body.top > this.dropThroughPlatform.body.bottom + 2)) {
        this.dropThroughPlatform = null;
      }
      let grounded = this.player.body.blocked.down || this.player.body.touching.down;
      const crouchPressed = pressed('crouch');
      const crouchHeld = down('crouch') || crouchPressed;
      if (grounded && crouchHeld) {
        const bridge = this.pacing.bridges.find(b => b.active &&
          Math.abs(this.player.body.bottom - b.body.top) < 5 &&
          this.player.body.right > b.body.left && this.player.body.left < b.body.right);
        if (bridge) {
          this.dropThroughPlatform = bridge;
          this.player.setVelocityY(80);
          this.lastOnGroundAt = -5000;
          grounded = false;
        }
      }
      const crouching = grounded && crouchHeld;
      if (crouching !== this.wasCrouching) {
        this.player.body.setSize(28, crouching ? 36 : 72);
        this.player.body.setOffset(18, crouching ? 44 : 8);
        this.wasCrouching = crouching;
      }
      if (grounded) this.lastOnGroundAt = time;
      if (pressed('jump')) this.lastJumpAt = time;
      if (!crouching && time - this.lastJumpAt < 125 && time - this.lastOnGroundAt < 110) {
        this.player.setVelocityY(-505);
        this.lastJumpAt = -5000;
        this.lastOnGroundAt = -5000;
        this.tone(380, 0.095, 'triangle');
      }
      if (crouching) this.player.setTexture('hero-duck');
      else if (grounded && moving) this.player.setTexture(Math.floor(time / 130) % 2 ? 'hero' : 'hero-walk');
      else this.player.setTexture('hero');
      if(!crouching&&time<(this.playerAttackUntil||0))this.player.setTexture(this.heroFrames.attack);
      if(time<(this.playerHitUntil||0))this.player.setTexture(this.heroFrames.hit);
      const shootPressed = pressed('shoot');
      if ((down('shoot') || shootPressed) && time - this.lastShot > 240) {
        this.lastShot = time;
        this.fire();
      }
      const stairs = this.doors[this.floor];
      const atStairs = Math.abs(this.player.x-stairs.x)<74 && Math.abs(this.player.y-(stairs.y-25))<110;
      const atBonusDoor=window.ITHeroOutdoor.nearDoor(this);
      const atAnyDoor=atStairs||atBonusDoor;
      if (crouching && atAnyDoor && !this.stairsCrouchHeld) {
        this.stairsCrouchHeld = true;
        this.interact();
      }
      // Re-arm on leaving the doorway, even if a mobile player keeps ▼ held.
      if (!crouchHeld || !atAnyDoor) this.stairsCrouchHeld = false;
      // E remains an optional alternative for older controls.
      if (pressed('interact')) this.interact();
      this.pacing.objective(delta, {held: crouching || down('interact'), moving, grounded});
      if (this.gameState !== 'playing') return;
      this.trainingHud.setText(ITHeroAppearance.state.training?'TRÉNINK • SKÓRE SE NEZAPÍŠE':'');
      this.coffees.getChildren().slice().forEach(coffee => {
        if(coffee.getData('expires')&&this.playTime>coffee.getData('expires')){coffee.destroy();return;}
        const steam = coffee.getData('steam');
        if (!steam) return;
        steam.clear();
        for(let i=0;i<3;i++) {
          const phase = ((this.playTime+i*480)%1500)/1500;
          const x = coffee.x-5+i*5+Math.round(Math.sin(phase*7+i)*2);
          steam.fillStyle(0xf0f5e7,(1-phase)*0.45);
          steam.fillRect(x,coffee.y-19-phase*18,2,5);
        }
      });

      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (e.profile) { this.enemyTrio.update(e, time); return; }
        if(e.kind==='manager'&&ITHeroFinalManager.update(this,e))return;
        const sameFloor = e.floorIndex === this.floor;
        if (!sameFloor) { e.setVelocityX(0); return; }
        if (this.pacing.isWinding(e)) { e.setVelocityX(0); return; }
        if (time < e.contactUntil) {
          e.setVelocityX(0);
          if (e.kind === 'manager') {
            e.setTexture(`manager-stomp-${Math.floor((e.contactUntil - time) / 140) % 2}`);
            if (time - e.lastStomp > 280) {
              e.lastStomp = time;
              this.tone(75, 0.09, 'square');
              this.cameras.main.shake(65, 0.0015);
            }
          }
          return;
        }
        if(time<(e.hitUntil||0)||time<(e.poseUntil||0)){e.setVelocityX(0);return;}
        e.setTexture(e.visualFrames[Math.floor(time/170)%2?'walk':'walk_alt']);
        if (e.x < e.baseX - e.patrol) e.direction = 1;
        if (e.x > e.baseX + e.patrol) e.direction = -1;
        e.setVelocityX(e.direction * (e.kind === 'manager' ? 34 : 49));
        if (Math.abs(e.x - this.player.x) < 510 && time - e.lastAttack > (e.kind === 'specialist' && Math.abs(e.x-this.player.x)<135 ? 850 : e.attackDelay)) {
          e.lastAttack = time;
          this.pacing.queue(e, () => this.enemyAttack(e));
        }
      });
      [this.playerShots, this.enemyShots].forEach(group => group.getChildren().forEach(shot => {
        if (shot.active && ((shot.getData('floor') !== undefined && shot.getData('floor') !== this.floor) || time > shot.getData('expires') || shot.x < -30 || shot.x > WIDTH + 30)) shot.destroy();
      }));
      const door = this.doors[this.floor];
      const nearDoor = Math.abs(this.player.x - door.x) < 74 && Math.abs(this.player.y - (door.y - 25)) < 110;
      const nearBonusDoor=window.ITHeroOutdoor.nearDoor(this);
      this.promptText.setVisible(nearBonusDoor || nearDoor && door.kind !== 'exit');
      const stairsKey = this.touchControls?.enabled ? '▼' : 'S / ↓';
      this.promptText.setText(nearBonusDoor?`[ ${stairsKey} ]  DVEŘMI VEN • BONUS`:nearDoor ? `[ ${stairsKey} ]  ${door.kind === 'exit' ? 'ODPOJIT HDD' : 'DALŠÍ PATRO'}` : '');
      this.tipText.setVisible(!this.posters.tooltip.visible);
      if (!this.isMuted || !this.tipText.text.startsWith('ZVUK')) {
        const thumb = this.touchControls?.movementMode === 'stick';
        this.tipText.setText(this.touchControls?.enabled ? (nearDoor ? (door.kind === 'exit' ? (thumb ? 'Drž levý palec dole a stůj na místě' : 'U HDD podrž ▼ a stůj na místě') : (thumb ? 'U schodů táhni levý palec dolů' : 'U schodů podrž ▼')) : (thumb ? 'PALEC ↔ • POHYB   ↓ • SKRČENÍ   ↑ • SKOK   ● • STŘELBA' : '◀ / ▶ • POHYB   ↑ • SKOK   ▼ • SKRČENÍ   ● • STŘELBA')) : (nearDoor ? (door.kind === 'exit' ? 'U HDD podrž S / ↓ nebo E a stůj na místě' : 'U schodů se skrč: S nebo ↓') : 'A / D • POHYB   W • SKOK   S • SKRČENÍ   J • DISKETY / CD'));
      }
      if (time - this.lastHit < 1250) this.player.alpha = Math.floor(time / 90) % 2 ? 0.4 : 1;
      else this.player.alpha = 1;
    }
  }

  // Použitý engine: Phaser 3.90.0, načtený lokálně v index.html.
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#0c1727',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: WIDTH,
      height: HEIGHT
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 1200 }, debug: false }
    },
    scene: [ITGame, window.ITHeroEnding.Scene, window.ITHeroOutdoor.Scene]
  });
})();
