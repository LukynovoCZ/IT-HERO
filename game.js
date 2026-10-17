/*
 * IT HERO 0.2.1 – mini plošinovka v Phaser 3.
 * Bez externích obrázků: všechny textury jsou generované pomocí Phaser Graphics.
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

  class ITGame extends Phaser.Scene {
    constructor() { super('ITGame'); }

    create() {
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
      this.isMuted = false;
      this.audioCtx = null;
      this.enemies = this.physics.add.group();
      this.playerShots = this.physics.add.group({ allowGravity: false });
      this.enemyShots = this.physics.add.group({ allowGravity: false });
      this.platforms = this.physics.add.staticGroup();
      this.obstacles = this.physics.add.staticGroup();
      this.coffees = this.physics.add.staticGroup();
      this.upgrades = this.physics.add.staticGroup();

      this.makeTextures();
      this.buildOffice();
      this.createActors();
      this.configurePhysics();
      this.configureKeyboard();
      this.installReliableControls();
      this.createHUD();
      this.createOverlay();

      this.cameras.main.setBounds(0, 0, WIDTH, WORLD_HEIGHT);
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.startFollow(this.player, true, 0.13, 0.13, 0, 105);
      this.cameras.main.centerOn(this.player.x, FLOORS[0] - 95);
      this.physics.world.setBounds(0, 0, WIDTH, WORLD_HEIGHT);
      this.cameras.main.fadeIn(350, 6, 13, 26);
      this.updateHUD();
      this.showOverlay('IT HERO', 'VÝSTUP DO VEDENÍ',
        'Jsi poslední ajťák, který ještě neztratil heslo.\nProjdi 9 pater. Výtahy jsou mimo provoz.\nDiskety střílíš J. Najdi vylepšení na CD.',
        'ENTER nebo kliknutí = HRÁT');
    }

    makeTextures() {
      const texture = (key, w, h, draw) => {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
      };
      const rect = (g, color, x, y, w, h) => { g.fillStyle(color); g.fillRect(x, y, w, h); };

      const hero = (walk) => (g) => {
        rect(g, 0x19293f, 4, 22, 6, 5);
        rect(g, 0x19293f, walk ? 11 : 10, 22, 6, 5);
        rect(g, 0x6cdbe1, 3, 11, 15, 12);
        rect(g, 0x2a7691, 4, 19, 13, 4);
        rect(g, 0xf6b99a, 5, 4, 11, 9);
        rect(g, 0x26344a, 4, 2, 13, 5);
        rect(g, 0x26344a, 3, 4, 3, 7);
        rect(g, 0x19293f, 12, 8, 2, 2);
        rect(g, 0xf8c4a7, 0, 14, 4, 7);
        rect(g, 0xf8c4a7, 17, 14, 3, 7);
        rect(g, 0xe8fff6, 8, 14, 2, 5);
        rect(g, 0xe8fff6, 12, 14, 2, 5);
      };
      texture('hero', 20, 28, hero(false));
      texture('hero-walk', 20, 28, hero(true));
      texture('hero-duck', 20, 28, g => {
        rect(g, 0x26344a, 4, 15, 13, 4);
        rect(g, 0xf6b99a, 5, 18, 11, 5);
        rect(g, 0x18293b, 12, 20, 2, 2);
        rect(g, 0x6cdbe1, 3, 23, 15, 4);
        rect(g, 0x1c283d, 4, 27, 14, 1);
      });
      texture('secretary', 20, 29, g => {
        rect(g, 0x423044, 4, 23, 5, 6); rect(g, 0x423044, 12, 23, 5, 6);
        rect(g, 0xdb6188, 3, 11, 14, 14); rect(g, 0xaa3e68, 5, 22, 12, 3);
        rect(g, 0x8b4e41, 3, 1, 15, 12); rect(g, 0xf1b18f, 5, 5, 11, 10);
        rect(g, 0x4a2e37, 12, 10, 2, 2); rect(g, 0xc4a7c4, 16, 15, 4, 8);
        rect(g, 0xedd3af, 1, 14, 3, 9);
      });
      texture('union', 20, 29, g => {
        rect(g, 0x22293d, 4, 23, 5, 6); rect(g, 0x22293d, 12, 23, 5, 6);
        rect(g, 0x6f89a4, 3, 11, 14, 14); rect(g, 0x4d667c, 3, 19, 14, 5);
        rect(g, 0xf5ba8e, 5, 4, 11, 11); rect(g, 0xc6d0df, 3, 1, 15, 5);
        rect(g, 0x252c3e, 6, 9, 2, 2); rect(g, 0x252c3e, 12, 9, 2, 2);
        rect(g, 0xffdf82, 8, 15, 4, 5);
      });
      texture('manager', 20, 29, g => {
        rect(g, 0x101e2e, 3, 22, 5, 7); rect(g, 0x101e2e, 12, 22, 5, 7);
        rect(g, 0x273750, 2, 11, 16, 14); rect(g, 0xf1b18f, 5, 4, 11, 10);
        rect(g, 0x29303d, 4, 2, 13, 4); rect(g, 0x141f30, 6, 9, 4, 2);
        rect(g, 0x141f30, 12, 9, 4, 2); rect(g, 0xff647e, 9, 14, 3, 9);
        rect(g, 0xf1b18f, 17, 13, 3, 9);
      });
      texture('secretary-scream', 20, 29, g => {
        rect(g, 0x423044, 4, 23, 5, 6); rect(g, 0x423044, 12, 23, 5, 6);
        rect(g, 0xdb6188, 3, 11, 14, 14); rect(g, 0xaa3e68, 5, 22, 12, 3);
        rect(g, 0x8b4e41, 3, 1, 15, 12); rect(g, 0xf1b18f, 5, 5, 11, 10);
        rect(g, 0x4a2e37, 9, 10, 4, 4);
        rect(g, 0xf1b18f, 0, 0, 3, 16); rect(g, 0xf1b18f, 17, 0, 3, 16);
      });
      texture('union-whistle', 20, 29, g => {
        rect(g, 0x22293d, 4, 23, 5, 6); rect(g, 0x22293d, 12, 23, 5, 6);
        rect(g, 0x6f89a4, 3, 11, 14, 14); rect(g, 0x4d667c, 3, 19, 14, 5);
        rect(g, 0xf5ba8e, 5, 4, 11, 11); rect(g, 0xc6d0df, 3, 1, 15, 5);
        rect(g, 0x252c3e, 6, 9, 2, 2); rect(g, 0x252c3e, 12, 9, 2, 2);
        rect(g, 0xf5ba8e, 14, 12, 5, 4);
        rect(g, 0x3a9bff, 11, 11, 8, 3); rect(g, 0xa6e3ff, 14, 10, 3, 2);
      });
      [0, 1].forEach(step => texture(`manager-stomp-${step}`, 20, 29, g => {
        rect(g, 0x101e2e, 3, step ? 22 : 25, 6, step ? 7 : 4);
        rect(g, 0x101e2e, 12, step ? 25 : 22, 6, step ? 4 : 7);
        rect(g, 0x273750, 2, 11, 16, 14); rect(g, 0xed5554, 5, 4, 11, 10);
        rect(g, 0x29303d, 4, 2, 13, 4); rect(g, 0x141f30, 6, 8, 4, 2);
        rect(g, 0x141f30, 12, 8, 4, 2); rect(g, 0xff647e, 9, 14, 3, 9);
        rect(g, 0xed5554, 0, 15, 3, 6); rect(g, 0xed5554, 17, 15, 3, 6);
      }));
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
        rect(g, 0x242e66, 0, 0, 14, 14); rect(g, 0x7e8cc9, 2, 0, 9, 6);
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
      texture('coffee', 17, 22, g => {
        rect(g, 0xffe8b4, 3, 6, 11, 14); rect(g, 0xa85b4d, 4, 9, 9, 8);
        rect(g, 0xffffff, 2, 5, 13, 3); rect(g, 0xe5f4ee, 13, 10, 3, 6);
        rect(g, 0xc0dddc, 5, 1, 2, 4); rect(g, 0xc0dddc, 10, 0, 2, 4);
      });
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
      const names = ['RECEPCE', 'ADMINISTRATIVA', 'ÚČTÁRNA', 'PROJEKTY', 'ODBORY', 'PERSONÁLNÍ', 'PRÁVNÍ', 'MANAGEMENT', 'VEDENÍ'];
      FLOORS.forEach((y, level) => {
        const top = y - 414;
        const wall = level % 2 ? 0x68777d : 0x748187;
        g.fillStyle(wall).fillRect(0, top, WIDTH, 420);
        g.fillStyle(0x142539).fillRect(0, top + 10, WIDTH, 9);
        g.fillStyle(0x3b526a).fillRect(0, top + 22, WIDTH, 4);
        // Kancelářská okna (pixelové město za sklem).
        for (let x = 55; x < 940; x += 176) {
          g.fillStyle(0x647a92).fillRect(x - 5, top + 72, 134, 142);
          g.fillStyle(0x10273e).fillRect(x, top + 77, 124, 132);
          g.fillStyle(0x2b5363).fillRect(x + 3, top + 114, 118, 95);
          g.fillStyle(0x28485a).fillRect(x + 10, top + 147, 26, 62);
          g.fillStyle(0x183748).fillRect(x + 43, top + 125, 28, 84);
          g.fillStyle(0x315569).fillRect(x + 82, top + 156, 35, 53);
          g.fillStyle(0xc5a966).fillRect(x + 18, top + 152, 6, 8);
          g.fillStyle(0xc5a966).fillRect(x + 92, top + 174, 7, 9);
          g.fillStyle(0x668397).fillRect(x + 59, top + 77, 6, 132);
        }
        // Kolejnice lamp, lampy, podlahová lišta.
        g.fillStyle(0x93a5ba).fillRect(0, top + 49, WIDTH, 3);
        for (const lx of [130, 470, 810]) {
          g.fillStyle(0x5d7289).fillRect(lx, top + 49, 3, 25);
          g.fillStyle(0xf3dda0).fillRect(lx - 39, top + 73, 82, 8);
          g.fillStyle(0xcbb879, 0.11).fillTriangle(lx - 40, top + 81, lx + 45, top + 81, lx, top + 220);
        }
        g.fillStyle(0x364860).fillRect(0, y - 6, WIDTH, 6);
        g.fillStyle(0x8899ab).fillRect(0, y + 1, WIDTH, 5);
        g.fillStyle(0x152338).fillRect(0, y + 6, WIDTH, 38);
        for (let x = 0; x < WIDTH; x += 32) {
          g.fillStyle(0x23354b).fillRect(x, y + 10, 28, 2);
        }
        // Kancelářské obrazy a nástěnky.
        g.fillStyle(0x102136).fillRect(313, top + 244, 116, 64);
        g.fillStyle(0x52908b).fillRect(320, top + 250, 102, 51);
        g.fillStyle(0x6cf0dc).fillRect(331, top + 281, 12, 15);
        g.fillStyle(0x9ed5dc).fillRect(352, top + 268, 12, 28);
        g.fillStyle(0xe2cc77).fillRect(373, top + 256, 12, 40);
        g.fillStyle(0xd17b8b).fillRect(394, top + 273, 12, 23);
        this.add.text(24, y - 383, `${String(level + 1).padStart(2, '0')}  /  ${names[level]}`, {
          fontFamily: 'monospace', fontSize: '14px', color: '#c2d2e6',
          backgroundColor: '#152139', padding: { x: 12, y: 7 }
        }).setDepth(-8);
        this.addStatic(this.platforms, WIDTH / 2, y + 17, WIDTH, 30, 0x77869c, 11);
      });

      // Stoly – překážky, které je potřeba přeskočit.
      FLOORS.flatMap((_, level) => [[level, 305], [level, 700]]).forEach(([level, x]) => {
        const y = FLOORS[level];
        this.addStatic(this.obstacles, x, y - 19, 88, 38, 0x2d5363, 10);
        this.add.rectangle(x, y - 42, 96, 9, 0xc4a27a).setDepth(11);
        this.add.rectangle(x - 19, y - 63, 45, 31, 0x132a3c).setDepth(12);
        this.add.rectangle(x - 19, y - 65, 38, 24, 0x42809b).setDepth(13);
        this.add.rectangle(x + 26, y - 42, 12, 7, 0xffdf82).setDepth(13);
        this.add.rectangle(x - 17, y - 43, 32, 4, 0xd4dee6).setDepth(13);
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
        this.add.text(500, y - 192, `${floor + 1}  VÝTAH`, {font:'bold 12px monospace',color:'#243342'}).setOrigin(0.5).setDepth(5);
        this.add.text(500, y - 110, 'MIMO\nPROVOZ', {font:'bold 13px monospace',color:'#ffce83',align:'center',backgroundColor:'#283b49',padding:{x:5,y:5}}).setOrigin(0.5).setDepth(5);
      });
    }

    drawDoor(x, y, isExit, entry = false) {
      const color = isExit ? 0xc7a96e : 0x3b8b8b;
      const g = this.add.graphics().setDepth(5);
      g.fillStyle(0x0c1828).fillRect(x - 42, y - 118, 84, 118);
      g.fillStyle(0x78949a).fillRect(x - 38, y - 115, 76, 114);
      g.fillStyle(color).fillRect(x - 32, y - 107, 64, 106);
      g.fillStyle(0x1a3b45).fillRect(x - 25, y - 99, 50, 65);
      g.fillStyle(0xdde9da).fillRect(x + 21, y - 49, 5, 10);
      for (let k = 0; k < 5; k++) g.fillStyle(0x8ddacf).fillRect(x - 20 + k * 8, y - 21 - k * 9, 9, 5);
      g.fillStyle(0x0b1926).fillRect(x - 44, y - 123, 88, 23);
      const label = isExit ? 'CÍL' : entry ? 'VÝSTUP' : 'SCHODY ↑';
      this.add.text(x, y - 111, label, {
        font: 'bold 12px monospace', color: isExit ? '#ffdb8c' : '#b2ffee'
      }).setOrigin(0.5).setDepth(6);
      if (isExit) this.add.text(x, y - 137, 'ŘEDITEL', {
        font: 'bold 13px monospace', color: '#ffe2a5'
      }).setOrigin(0.5).setDepth(6);
    }

    createActors() {
      this.player = this.physics.add.sprite(82, FLOORS[0] - 40, 'hero');
      this.player.setScale(1.8).setDepth(23).setMaxVelocity(250, 860);
      this.player.setCollideWorldBounds(true).setDragX(1050).setBounce(0);
      this.player.body.setSize(15, 27).setOffset(2, 1);

      this.enemySpecs = FLOORS.flatMap((_, floor) => [
        {kind: floor === 8 ? 'manager' : floor % 3 === 1 ? 'union' : 'secretary', floor, x: 590, hp: floor === 8 ? 8 : 3 + Math.floor(floor / 3), patrol: 30, delay: 1800 - floor * 65},
        ...(floor > 1 ? [{kind:'secretary', floor, x:350, hp:3, patrol:25, delay:1900 - floor * 45}] : [])
      ]);
      this.enemySpecs.forEach((spec, i) => {
        const e = this.enemies.create(spec.x, FLOORS[spec.floor] - 36, spec.kind);
        e.setScale(1.8).setDepth(22).setCollideWorldBounds(true);
        e.body.setSize(17, 28).setOffset(1, 0);
        e.kind = spec.kind;
        e.floorIndex = spec.floor;
        e.hp = spec.hp;
        e.baseX = spec.x;
        e.patrol = spec.patrol;
        e.direction = i % 2 ? 1 : -1;
        e.lastAttack = 0;
        e.shotsThrown = 0;
        e.contactUntil = 0;
        e.lastStomp = -1000;
        e.attackDelay = spec.delay;
      });
      FLOORS.flatMap((_, floor) => [[floor, 192], [floor, 790]]).forEach(([floor, x]) => {
        const coffee = this.coffees.create(x, FLOORS[floor] - 24, 'coffee');
        coffee.setScale(1.6).setDepth(19).refreshBody();
        coffee.setData('floor', floor);
        this.tweens.add({ targets: coffee, y: coffee.y - 7, duration: 700 + 100 * floor, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
      });
      [2, 5, 7].forEach(floor => {
        this.upgrades.create(220, FLOORS[floor] - 35, 'cd').setScale(2).setDepth(20).refreshBody();
        this.add.text(220, FLOORS[floor] - 75, 'CD UPGRADE', {font:'bold 11px monospace',color:'#ffe0ff'}).setOrigin(0.5).setDepth(20);
      });
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
      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.player, this.obstacles);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.collider(this.enemies, this.obstacles);
      this.physics.add.collider(this.playerShots, this.platforms, shot => shot.destroy());
      this.physics.add.collider(this.playerShots, this.obstacles, shot => shot.destroy());
      this.physics.add.collider(this.enemyShots, this.platforms, shot => shot.destroy());
      this.physics.add.collider(this.enemyShots, this.obstacles, shot => shot.destroy());
      this.physics.add.overlap(this.player, this.upgrades, (_, upgrade) => this.collectUpgrade(upgrade));
      this.physics.add.overlap(this.player, this.coffees, (_, coffee) => this.collectCoffee(coffee));
      this.physics.add.overlap(this.playerShots, this.enemies, (shot, enemy) => this.hitEnemy(shot, enemy));
      this.physics.add.overlap(this.player, this.enemyShots, (_, shot) => {
        if (!shot.active) return;
        const sourceX = shot.x;
        shot.destroy();
        this.takeDamage(sourceX);
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
      return (this.browserMap[action] || []).some(code => this.browserHeld.has(code));
    }

    browserJustPressed(action) {
      const codes = this.browserMap[action] || [];
      const result = codes.some(code => this.browserPressed.has(code));
      codes.forEach(code => this.browserPressed.delete(code));
      return result;
    }

    togglePause() {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.physics.world.pause();
        this.showOverlay('PAUZA', 'VÝPADEK NA FIREWALLU',
          'Můžeš pokračovat klávesou ESC.\nRychlost, střelba i šanony zůstávají stejné.', 'ESC / KLIK = POKRAČOVAT');
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.physics.world.resume();
        this.hideOverlay();
      }
    }

    createHUD() {
      this.add.rectangle(480, 27, 960, 54, 0x0b1627, 0.94).setDepth(101).setScrollFactor(0);
      this.add.rectangle(480, 54, 960, 2, 0x3c526e).setDepth(101).setScrollFactor(0);
      this.add.text(22, 9, 'IT HERO', {font: 'bold 20px monospace', color: '#6cf0dc'}).setScrollFactor(0).setDepth(102);
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
      // Pixelová silueta podle reference: dvě křídla, pásy oken,
      // prosklená spojovací věž a nízká vstupní hala.
      const art = this.add.graphics();
      const r = (color, x, y, w, h) => art.fillStyle(color).fillRect(x, y, w, h);
      r(0x243f55, 608, 86, 312, 364);
      for (let y = 100; y < 440; y += 8) r(0x29465a, 608, y, 312, 2);
      r(0x142b3a, 608, 418, 312, 32);
      r(0x89928e, 626, 155, 116, 254);
      r(0xa6aaa0, 778, 109, 122, 300);
      r(0x63736e, 900, 109, 12, 300);
      for (let floor = 0; floor < 9; floor++) {
        const y = 117 + floor * 31;
        r(0xd0ccaf, 778, y + 21, 122, 6);
        for (let col = 0; col < 6; col++) {
          r(0xd5d6c4, 783 + col * 19, y, 17, 22);
          r((floor + col) % 4 ? 0x425e6e : 0x93a6aa, 785 + col * 19, y + 2, 13, 18);
          r(0x849799, 785 + col * 19, y + 2, 2, 18);
        }
        if (floor > 0) {
          const ly = 157 + (floor - 1) * 28;
          r(0xb7b8a5, 626, ly + 19, 116, 5);
          for (let col = 0; col < 6; col++) {
            r(0xccd0bf, 630 + col * 18, ly, 16, 19);
            r(0x4a6570, 632 + col * 18, ly + 2, 12, 15);
          }
        }
      }
      r(0x6d807d, 742, 100, 36, 309);
      r(0x324f5c, 748, 107, 24, 300);
      for (let y = 110; y < 404; y += 21) {
        r(0x91a7a4, 746, y, 30, 2); r(0x74918e, 759, y, 2, 20);
      }
      r(0x1d383a, 751, 84, 22, 16); r(0xa5bca0, 757, 87, 10, 10);
      r(0x364a4d, 616, 348, 120, 61);
      for (let x = 620; x < 736; x += 28) r(0x96a8a0, x, 348, 2, 61);
      r(0x90a6a1, 616, 377, 120, 3);
      r(0x536d70, 626, 386, 96, 23);
      r(0xb4c4b7, 626, 386, 96, 3);
      r(0xb4c4b7, 672, 386, 3, 23);
      r(0x6e7d77, 612, 410, 300, 8);
      r(0x1d3838, 880, 382, 18, 35); r(0x496a52, 876, 370, 26, 22);
      r(0x263d41, 641, 423, 46, 10); r(0x83999b, 650, 416, 25, 8);
      r(0x131f2b, 646, 432, 8, 5); r(0x131f2b, 675, 432, 8, 5);
      return art;
    }

    createOverlay() {
      const shade = this.add.rectangle(480, 270, 960, 540, 0x06101e, 0.82);
      const panel = this.add.rectangle(308, 266, 556, 366, 0x17253b);
      const exterior = this.drawExterior();
      panel.setStrokeStyle(4, 0x5accc7);
      this.overlayTitle = this.add.text(308, 121, '', {
        font: 'bold 48px monospace', color: '#82f7df'
      }).setOrigin(0.5);
      this.overlaySub = this.add.text(308, 170, '', {
        font: 'bold 17px monospace', color: '#ffdf82'
      }).setOrigin(0.5);
      this.overlayBody = this.add.text(308, 261, '', {
        font: '14px monospace', color: '#d9e4f6', align: 'center', lineSpacing: 11
      }).setOrigin(0.5);
      this.overlayAction = this.add.text(480, 378, '', {
        font: 'bold 17px monospace', color: '#101d2a', backgroundColor: '#75f1dc',
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
      if (this.gameState === 'menu') {
        this.gameState = 'playing';
        this.hideOverlay();
        this.tone(420, 0.07, 'triangle');
      } else if (this.gameState === 'paused') {
        this.togglePause();
      } else if (this.gameState === 'lose' || this.gameState === 'win') {
        // Změna stavu před restartem brání duplicitnímu spuštění při jednom kliknutí.
        this.gameState = 'restarting';
        this.scene.restart();
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
      this.energyCells.forEach((rect, i) => rect.setFillStyle(i < this.energy ? 0x66f0d7 : 0x30435a));
      if (this.weaponText) this.weaponText.setText(this.weapon === 'cd' ? 'CD • 2×' : 'DISKETY');
      this.floorText.setText(`PATRO ${this.floor + 1} / ${FLOOR_COUNT}`);
      this.scoreText.setText(`SKÓRE ${String(this.score).padStart(5, '0')}`);
    }

    collectCoffee(coffee) {
      if (this.gameState !== 'playing' || !coffee.active) return;
      coffee.destroy();
      this.energy = Math.min(this.maxEnergy, this.energy + 1);
      this.score += 50;
      this.tone(610, 0.10, 'sine');
      this.time.delayedCall(90, () => this.tone(840, 0.13, 'sine'));
      this.popText(this.player.x, this.player.y - 45, '+ KÁVA  +50', '#f7db91');
      this.updateHUD();
    }

    popText(x, y, str, color = '#eaf4ff') {
      const text = this.add.text(x, y, str, {
        font: 'bold 15px monospace', color, stroke: '#111c2a', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      this.tweens.add({ targets: text, y: y - 45, alpha: 0, duration: 820,
        onComplete: () => text.destroy() });
    }

    fire() {
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

    enemyContact(enemy) {
      if (this.gameState !== 'playing' || !enemy.active || enemy.floorIndex !== this.floor) return;
      this.takeDamage(enemy.x);
      if (this.time.now < enemy.contactUntil) return;
      enemy.contactUntil = this.time.now + 1000;
      enemy.setVelocityX(0);
      if (enemy.kind === 'secretary') {
        enemy.setTexture('secretary-scream');
        this.popText(enemy.x, enemy.y - 55, 'ÁÁÁÁ!', '#ffb4d3');
        this.tone(1250, 0.35, 'sawtooth');
      } else if (enemy.kind === 'union') {
        enemy.setTexture('union-whistle');
        this.popText(enemy.x, enemy.y - 55, 'PÍÍÍÍ!', '#79caff');
        this.tone(2300, 0.4, 'sine');
      } else {
        enemy.setTexture('manager-stomp-0');
        this.popText(enemy.x, enemy.y - 55, 'DUP! DUP!', '#ff9a85');
      }
    }

    enemyAttack(enemy) {
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

    hitEnemy(shot, enemy) {
      if (this.gameState !== 'playing' || !shot.active || !enemy.active) return;
      const damage = shot.getData('damage') || 1;
      shot.destroy();
      enemy.hp -= damage;
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(90, () => { if (enemy.active) enemy.clearTint(); });
      this.tone(245, 0.045);
      if (enemy.hp <= 0) {
        this.score += enemy.kind === 'manager' ? 250 : 100;
        this.popText(enemy.x, enemy.y - 27, enemy.kind === 'manager' ? '+250 ŠÉF' : '+100', '#91ffe0');
        enemy.destroy();
        this.updateHUD();
      }
    }

    takeDamage(sourceX) {
      if (this.gameState !== 'playing' || this.time.now - this.lastHit < 1250) return;
      this.lastHit = this.time.now;
      this.energy = Math.max(0, this.energy - 1);
      this.player.setVelocityX(this.player.x < sourceX ? -280 : 280);
      this.player.setVelocityY(-185);
      this.cameras.main.shake(100, 0.0038);
      this.tone(135, 0.20, 'sawtooth');
      this.popText(this.player.x, this.player.y - 42, '-1 ENERGIE', '#ff8ca6');
      this.updateHUD();
      if (this.energy === 0) {
        this.gameState = 'lose';
        this.player.setVelocityX(0);
        this.time.delayedCall(350, () => this.showOverlay('GAME OVER', 'ZASE DALŠÍ PORADA…',
          `Došel ti kofein.\nDostal ses do patra ${this.floor + 1}.\nZískané skóre: ${this.score}`, 'ENTER / R / KLIK = ZNOVU'));
      }
    }

    interact() {
      const door = this.doors[this.floor];
      if (Math.abs(this.player.x - 500) < 65) {
        this.popText(500, this.player.y - 65, 'VÝTAH NEFUNGUJE • POUŽIJ SCHODY', '#ffce83');
        return;
      }
      if (Math.abs(this.player.x - door.x) > 74 || Math.abs(this.player.y - (door.y - 25)) > 110 || this.transitioning) return;
      if (door.kind === 'exit') {
        this.gameState = 'win';
        this.score += this.energy * 100 + 500;
        this.updateHUD();
        this.tone(660, 0.20, 'sine');
        this.time.delayedCall(130, () => this.tone(990, 0.27, 'sine'));
        this.showOverlay('HOTOVO!', 'DOŠEL JSI DO VEDENÍ',
          `Máš přístup do posledního patra.\nEnergie: ${this.energy} / ${this.maxEnergy}\nKonečné skóre: ${this.score}`, 'ENTER / R / KLIK = ZNOVU');
        return;
      }
      this.transitioning = true;
      this.tone(740, 0.15, 'triangle');
      this.cameras.main.fadeOut(220, 7, 15, 28);
      this.time.delayedCall(230, () => {
        this.floor++;
        const spawnX = this.floor % 2 ? 872 : 88;
        this.player.setPosition(spawnX, FLOORS[this.floor] - 50);
        this.player.setVelocity(0, 0);
        this.player.body.reset(spawnX, FLOORS[this.floor] - 50);
        this.player.alpha = 1;
        this.lastHit = this.time.now;
        this.score += 150;
        this.updateHUD();
        this.cameras.main.centerOn(spawnX, FLOORS[this.floor] - 100);
        this.cameras.main.fadeIn(300, 7, 15, 28);
        this.popText(spawnX, FLOORS[this.floor] - 80, `PATRO ${this.floor + 1}  +150`, '#ffe6a6');
        this.transitioning = false;
      });
    }

    update(time, delta) {
      if (!this.keys) return;
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
      // START/PAUZA/RESTART mají přímou DOM obsluhu, nezávislou na Phaser input.
      if (this.gameState !== 'playing' || this.transitioning) {
        if (this.gameState !== 'playing') this.promptText.setText('');
        return;
      }

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
      const grounded = this.player.body.blocked.down || this.player.body.touching.down;
      const crouching = grounded && down('crouch');
      if (crouching !== this.wasCrouching) {
        this.player.body.setSize(15, crouching ? 14 : 27);
        this.player.body.setOffset(2, crouching ? 14 : 1);
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
      if (down('shoot') && time - this.lastShot > 240) {
        this.lastShot = time;
        this.fire();
      }
      if (pressed('interact')) this.interact();

      this.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const sameFloor = e.floorIndex === this.floor;
        if (!sameFloor) { e.setVelocityX(0); return; }
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
        e.setTexture(e.kind);
        if (e.x < e.baseX - e.patrol) e.direction = 1;
        if (e.x > e.baseX + e.patrol) e.direction = -1;
        e.setVelocityX(e.direction * (e.kind === 'manager' ? 34 : 49));
        if (Math.abs(e.x - this.player.x) < 510 && time - e.lastAttack > e.attackDelay) {
          e.lastAttack = time;
          this.enemyAttack(e);
        }
      });
      [this.playerShots, this.enemyShots].forEach(group => group.getChildren().forEach(shot => {
        if (shot.active && (time > shot.getData('expires') || shot.x < -30 || shot.x > WIDTH + 30)) shot.destroy();
      }));
      const door = this.doors[this.floor];
      const nearDoor = Math.abs(this.player.x - door.x) < 74 && Math.abs(this.player.y - (door.y - 25)) < 110;
      this.promptText.setText(nearDoor ? (door.kind === 'exit' ? '[ E ]  VSTUP DO VEDENÍ' : '[ E ]  PO SCHODECH NAHORU') : '');
      if (!this.isMuted || !this.tipText.text.startsWith('ZVUK')) {
        this.tipText.setText(nearDoor ? 'Použij schody • výtah je mimo provoz' : 'A / D • POHYB   W • SKOK   S • SKRČENÍ   J • DISKETY / CD');
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
    scene: [ITGame]
  });
})();
