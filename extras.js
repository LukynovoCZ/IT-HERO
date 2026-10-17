/*
 * IT HERO 0.3.1 — volitelné kancelářské postavy.
 * Starý IT kolega rozdává časově omezené léčení, duhová specialistka je další herní protivník.
 * Všechny nové textury se kreslí procedurálně. Nevyžadují žádné nové obrázky.
 */
(() => {
  'use strict';
  const RAINBOW = [0xea535a, 0xf39a47, 0xf6d55d, 0x56be7b, 0x4f9ce7, 0xa36bd4];

  function makeTextures(scene) {
    const paint = (key, width, height, draw) => {
      if (scene.textures.exists(key)) return;
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      draw((color, x, y, w, h) => {
        g.fillStyle(color);
        g.fillRect(x, y, w, h);
      });
      g.generateTexture(key, width, height);
      g.destroy();
    };
    paint('old-it', 64, 80, r => {
      // Plešatějící senior se šedými vlasy, brýlemi a vybledlým IT svetrem.
      r(0x243047, 17, 73, 13, 6); r(0x243047, 36, 73, 13, 6);
      r(0x4b6473, 19, 57, 26, 18);
      r(0x28536b, 15, 31, 34, 30);
      r(0x355f7b, 9, 36, 9, 23); r(0x355f7b, 46, 36, 9, 23);
      r(0xe9b78b, 10, 57, 8, 8); r(0xe9b78b, 46, 57, 8, 8);
      r(0xe9b78b, 21, 13, 24, 25); r(0xd99d78, 19, 23, 3, 10);
      r(0xd8dce4, 19, 13, 7, 11); r(0xd8dce4, 40, 13, 7, 12);
      r(0xc4cbd4, 23, 8, 18, 7);
      r(0x253344, 23, 23, 9, 6); r(0x253344, 35, 23, 9, 6);
      r(0xb7dde9, 24, 24, 7, 3); r(0xb7dde9, 36, 24, 7, 3);
      r(0x253344, 31, 25, 4, 2);
      r(0x73747d, 28, 34, 12, 3);
      r(0x7ad9c7, 25, 44, 14, 4); r(0xbfe8de, 30, 47, 4, 5);
    });
    paint('pilsen-can', 24, 33, r => {
      r(0xb6c2ba, 4, 0, 16, 3); r(0x6c857b, 4, 3, 16, 2);
      r(0x164f3b, 3, 5, 18, 25); r(0x27805e, 6, 5, 11, 25);
      r(0xe9d394, 5, 8, 14, 2); r(0xf8e5ad, 6, 13, 12, 11);
      r(0x154c38, 8, 15, 2, 7); r(0x154c38, 10, 15, 5, 2);
      r(0x154c38, 15, 17, 2, 3); r(0x154c38, 10, 19, 5, 2);
      r(0xe9d394, 5, 26, 14, 2); r(0xb6c2ba, 4, 30, 16, 3);
    });
    paint('hot-dog', 38, 22, r => {
      r(0xd29543, 1, 9, 36, 12); r(0xf2c27b, 2, 6, 34, 12);
      r(0xa24b41, 4, 8, 30, 7); r(0xcb6350, 5, 7, 28, 5);
      r(0xf5db64, 6, 7, 4, 2); r(0xf5db64, 13, 9, 5, 2);
      r(0xf5db64, 23, 7, 4, 2); r(0xf5db64, 30, 9, 3, 2);
      r(0xe6ac5d, 4, 17, 30, 3);
    });
    function specialist(key, pose) {
      paint(key, 64, 80, r => {
        // Širší silueta, modré vlasy, tmavě fialový kabát.
        r(0x29334b, 16, 73, 13, 6); r(0x29334b, 37, 73, 13, 6);
        r(0x56517b, 15, 57, 35, 18);
        r(0x59466f, 10, 33, 45, 29); r(0x816799, 13, 34, 40, 19);
        r(0xdba387, 8, 53, 8, 10);
        r(0xdba387, 50, 53, 7, 10);
        r(0xe7b395, 20, 13, 26, 25);
        r(0x126cc9, 16, 9, 32, 13); r(0x39a8ef, 17, 8, 29, 7);
        r(0x1279df, 14, 14, 8, 22); r(0x128fe2, 44, 12, 7, 21);
        r(0x30415c, 23, 23, 7, 3); r(0x30415c, 36, 23, 7, 3);
        r(0xa85366, 29, 32, 10, 2);
        r(0xefbca0, 48, 28, 7, 14);
        if (pose === 'spray') {
          r(0xdba387, 49, 29, 11, 6);
          r(0xaec9d3, 58, 26, 5, 11);
          r(0x59d6dd, 59, 24, 3, 2);
        } else {
          const swing = pose === 'flag';
          const poleX = swing ? 54 : 55;
          r(0xd5dbe0, poleX, swing ? 5 : 15, 2, 51);
          RAINBOW.forEach((color, i) => r(color, swing ? 32 : 44,
            (swing ? 7 : 16) + i * 4, swing ? 23 : 13, 4));
        }
      });
    }
    specialist('rainbow-idle', 'idle');
    specialist('rainbow-flag', 'flag');
    specialist('rainbow-spray-pose', 'spray');
    paint('rainbow-mist', 22, 18, r => {
      RAINBOW.forEach((color, i) => r(color, i % 2 ? 3 : 0, i * 3, 20 - i % 3, 3));
    });
  }

  function createActors(scene, floors) {
    scene.extraPickups = scene.physics.add.group({ allowGravity: false });
    scene.extraGift = null;
    scene.extraGiftLabel = null;
    scene.extraHelper = null;
    scene.extraNextSpawn = scene.time.now + 7200;

    // Objeví se v několika patrech, aby hráč nemusel bojovat se všemi druhy najednou.
    [1, 3, 5, 7].forEach((floor, index) => {
      const x = index % 2 ? 612 : 395;
      const e = scene.enemies.create(x, floors[floor] - 41, 'rainbow-idle');
      e.setDepth(22).setCollideWorldBounds(true);
      e.body.setSize(44, 68).setOffset(10, 12);
      e.kind = 'rainbow';
      e.floorIndex = floor;
      e.hp = 4 + Math.floor(floor / 3);
      e.baseX = x;
      e.patrol = 35;
      e.direction = index % 2 ? 1 : -1;
      e.contactUntil = 0;
      e.rainbowPoseUntil = 0;
      e.shotsThrown = 0;
      e.lastAttack = scene.time.now;
      e.attackDelay = 1250;
    });
  }

  function configurePhysics(scene) {
    scene.physics.add.overlap(scene.player, scene.extraPickups,
      (_, gift) => collectGift(scene, gift));
  }

  function collectGift(scene, gift) {
    if (scene.gameState !== 'playing' || !gift.active) return;
    scene.energy = scene.maxEnergy;
    scene.score += 125;
    const name = gift.extraKind === 'pilsen-can' ? 'PLZEŇ' : 'PÁREK V ROHLÍKU';
    scene.popText(scene.player.x, scene.player.y - 55, name + ' • PLNÁ ENERGIE!', '#a9ed63');
    scene.tone(630, 0.09, 'triangle');
    scene.time.delayedCall(120, () => scene.tone(940, 0.18, 'triangle'));
    destroyGift(scene, gift);
    scene.updateHUD();
  }

  function destroyGift(scene, gift) {
    if (scene.extraGiftLabel) {
      scene.extraGiftLabel.destroy();
      scene.extraGiftLabel = null;
    }
    if (gift && gift.active) gift.destroy();
    if (scene.extraGift === gift) scene.extraGift = null;
  }

  function spawnOldIT(scene, floors) {
    if (scene.extraGift && scene.extraGift.active) return;
    const y = floors[scene.floor];
    const fromLift = Math.random() < 0.5;
    const deskX = Math.random() < 0.5 ? 305 : 700;
    const x = fromLift ? 500 : deskX;
    const giftX = fromLift ? 583 : deskX === 305 ? 390 : 612;
    const itemType = Math.random() < 0.5 ? 'pilsen-can' : 'hot-dog';
    const originY = y - 9;
    const helper = scene.add.sprite(x, originY, 'old-it')
      .setDepth(fromLift ? 3 : 9).setAlpha(0).setScale(0.9);
    scene.extraHelper = helper;
    scene.tweens.add({
      targets: helper, alpha: 1, y: y - 43, duration: 470, ease: 'Back.Out',
      onComplete: () => {
        if (!helper.active) return;
        helper.setDepth(27);
        scene.popText(x, y - 115, fromLift ? 'STARÝ AJŤÁK Z VÝTAHU!' : 'AJŤÁK ZPOD STOLU!', '#f4e1ad');
        // Předmět je položený na dosah, nikoliv uvnitř stolu.
        const gift = scene.extraPickups.create(giftX, y - 31, itemType);
        gift.setDepth(28).setScale(itemType === 'hot-dog' ? 1.6 : 1.35);
        gift.body.setAllowGravity(false).setImmovable(true);
        gift.extraKind = itemType;
        gift.extraFloor = scene.floor;
        scene.extraGift = gift;
        const name = itemType === 'pilsen-can' ? 'PLECHOVKA PLZEŇ' : 'PÁREK V ROHLÍKU';
        scene.extraGiftLabel = scene.add.text(giftX, y - 79, name + '\n+ PLNÁ ENERGIE',
          { font: 'bold 12px monospace', color: '#fff5c3',
            stroke: '#142034', strokeThickness: 4, align: 'center' })
          .setOrigin(0.5).setDepth(29);
        scene.tweens.add({ targets: gift, scaleX: gift.scaleX * 1.09,
          scaleY: gift.scaleY * 1.09, duration: 560, yoyo: true, repeat: -1 });
        scene.time.delayedCall(6400, () => {
          if (gift.active) scene.tweens.add({ targets: gift, alpha: 0.2,
            duration: 140, yoyo: true, repeat: 5 });
        });
        scene.time.delayedCall(8200, () => {
          if (gift.active) {
            scene.popText(gift.x, gift.y - 25, 'ZMIZELO!', '#c6cee0');
            destroyGift(scene, gift);
          }
        });
      }
    });
    scene.time.delayedCall(2300, () => {
      if (!helper.active) return;
      scene.tweens.add({ targets: helper, y: originY, alpha: 0, duration: 450,
        onComplete: () => {
          helper.destroy();
          if (scene.extraHelper === helper) scene.extraHelper = null;
        } });
    });
  }

  function onUpdate(scene, floors, time) {
    if (time >= scene.extraNextSpawn) {
      scene.extraNextSpawn = time + Phaser.Math.Between(14000, 22500);
      spawnOldIT(scene, floors);
    }
    // Přechod mezi patry nesmí nechat aktivní dárek v jiném patře.
    if (scene.extraGift && scene.extraGift.active &&
        scene.extraGift.extraFloor !== scene.floor) {
      destroyGift(scene, scene.extraGift);
    }
  }

  function enemyContact(scene, enemy) {
    scene.takeDamage(enemy.x);
    if (scene.time.now < enemy.contactUntil) return;
    enemy.contactUntil = scene.time.now + 600;
    enemy.rainbowPoseUntil = enemy.contactUntil;
    enemy.setTexture('rainbow-flag');
    scene.popText(enemy.x, enemy.y - 58, 'DUHOVÝ ÚDER!', '#f8b5ed');
    scene.tone(460, 0.08, 'sawtooth');
  }

  function enemyAttack(scene, enemy) {
    const distance = Math.abs(scene.player.x - enemy.x);
    const verticalDistance = Math.abs(scene.player.y - enemy.y);
    const direction = scene.player.x >= enemy.x ? 1 : -1;
    enemy.setFlipX(direction < 0);
    const melee = distance < 86 && (enemy.shotsThrown++ % 2 === 0);
    enemy.rainbowPoseUntil = scene.time.now + (melee ? 380 : 480);
    enemy.setVelocityX(0);
    if (melee) {
      enemy.setTexture('rainbow-flag');
      const swipe = scene.add.sprite(enemy.x + direction * 36, enemy.y - 19,
        'rainbow-mist').setDepth(26).setScale(2.3);
      scene.tweens.add({ targets: swipe, alpha: 0, angle: direction * 100,
        duration: 320, onComplete: () => swipe.destroy() });
      if (distance < 86 && verticalDistance < 75) scene.takeDamage(enemy.x);
      scene.tone(370, 0.08, 'sawtooth');
    } else {
      enemy.setTexture('rainbow-spray-pose');
      // Krátký rozptyl: tři barevné obláčky se rozplynou poblíž postavy.
      [-1, 0, 1].forEach((offset, i) => {
        const shot = scene.enemyShots.create(
          enemy.x + direction * 31, enemy.y - 17 + offset * 9, 'rainbow-mist');
        shot.setDepth(26).setScale(1.1);
        shot.body.setAllowGravity(false);
        shot.setVelocity(direction * (155 + i * 18), offset * 33);
        shot.setData('expires', scene.time.now + 540);
      });
      scene.popText(enemy.x, enemy.y - 60, 'DUHOVÝ SPREJ!', '#f6a8d6');
      scene.tone(710, 0.12, 'triangle');
    }
  }

  function updateEnemy(scene, enemy, time) {
    if (time < enemy.contactUntil || time < enemy.rainbowPoseUntil) {
      enemy.setVelocityX(0);
      return;
    }
    enemy.setTexture('rainbow-idle');
    if (enemy.x < enemy.baseX - enemy.patrol) enemy.direction = 1;
    if (enemy.x > enemy.baseX + enemy.patrol) enemy.direction = -1;
    enemy.setVelocityX(enemy.direction * 46);
    const horizontal = Math.abs(enemy.x - scene.player.x);
    const vertical = Math.abs(enemy.y - scene.player.y);
    if (horizontal < 150 && vertical < 85 &&
        time - enemy.lastAttack > enemy.attackDelay) {
      enemy.lastAttack = time;
      enemyAttack(scene, enemy);
    }
  }

  window.ITHeroExtras = {
    makeTextures, createActors, configurePhysics, onUpdate, enemyContact, updateEnemy
  };
})();
