/* Pixel weapons and short, non-stacking contact effects for the office trio. */
(() => {
  'use strict';
  const colors = { ink: 0x17212c, steel: 0xbdced9, red: 0xe43842, gold: 0xffcc55 };
  function textures(scene) {
    const make = (key, draw) => {
      if (scene.textures.exists(key)) return;
      const g = scene.make.graphics({ add: false });
      draw(g); g.generateTexture(key, 32, 32); g.destroy();
    };
    make('handcuffs', g => {
      g.lineStyle(3, colors.ink).strokeRect(2, 8, 11, 13).strokeRect(20, 8, 10, 13);
      g.lineStyle(2, colors.steel).strokeRect(3, 9, 9, 11).strokeRect(21, 9, 8, 11);
      g.lineBetween(13, 13, 20, 17); g.lineBetween(13, 17, 20, 13);
    });
    make('fireball', g => {
      g.fillStyle(0xe44d25).fillTriangle(0, 3, 27, 12, 24, 25).fillCircle(22, 17, 9);
      g.fillStyle(0xffa62f).fillCircle(23, 17, 6);
      g.fillStyle(0xffef9c).fillRect(22, 14, 6, 5);
    });
    make('red-heel', g => {
      g.fillStyle(colors.ink).fillRect(3, 20, 25, 4).fillRect(5, 22, 3, 8);
      g.fillStyle(colors.red).fillRect(3, 12, 7, 9).fillRect(9, 18, 12, 5).fillTriangle(17, 18, 29, 23, 17, 23);
      g.fillStyle(0xff9095).fillRect(4, 12, 3, 5);
    });
    make('red-balloon', g => {
      g.lineStyle(2, colors.ink).lineBetween(16, 20, 19, 28).strokeCircle(19, 28, 3);
      g.fillStyle(colors.red).fillEllipse(15, 10, 18, 20).fillTriangle(15, 18, 12, 22, 18, 22);
      g.fillStyle(0xffa5a7).fillRect(10, 4, 3, 6);
    });
    make('golf-club', g => {
      g.fillStyle(colors.ink).fillRect(13, 1, 5, 25).fillRect(15, 23, 14, 7);
      g.fillStyle(colors.steel).fillRect(14, 7, 2, 19).fillRect(16, 24, 11, 4);
      g.fillStyle(0x573e30).fillRect(13, 1, 4, 8);
    });
    make('calculator', g => {
      g.fillStyle(colors.ink).fillRect(6, 1, 21, 30);
      g.fillStyle(0x8faaa8).fillRect(8, 3, 17, 26);
      g.fillStyle(0x233e35).fillRect(10, 5, 13, 6);
      for (let y = 14; y < 27; y += 5) for (let x = 10; x < 24; x += 5) g.fillStyle(x === 20 ? colors.red : colors.ink).fillRect(x, y, 3, 3);
    });
  }
  function projectile(scene, enemy) {
    textures(scene);
    const pool = enemy.profile.projectiles;
    const total = pool.reduce((n, item) => n + item.weight, 0);
    let pick = Math.random() * total;
    const weapon = pool.find(item => (pick -= item.weight) < 0) || pool[pool.length - 1];
    const direction = scene.player.x >= enemy.x ? 1 : -1;
    const shot = scene.enemyShots.create(enemy.x + direction * 28, enemy.body.bottom - 34, weapon.key).setDepth(25);
    shot.setFlipX(direction < 0).setVelocity(direction * (weapon.speed || 245), -30);
    shot.body.setAllowGravity(false);
    shot.body.setSize(weapon.key === 'fireball' ? 22 : 20, 22, true);
    if (weapon.spin) shot.setAngularVelocity(direction * weapon.spin);
    shot.setData('expires', scene.time.now + 1900).setData('damage', enemy.profile.damage).setData('floor', enemy.floorIndex);
    scene.tone(weapon.key === 'fireball' ? 110 : 210, 0.07, 'triangle');
  }
  function clear(enemy) {
    if (enemy.contactEffect) enemy.contactEffect.destroy();
    enemy.contactEffect = null;
  }
  function contact(scene, enemy) {
    clear(enemy);
    enemy.contactEffect = scene.add.graphics().setDepth(27);
    enemy.effectUntil = scene.time.now + 650;
    scene.tone(enemy.profile.contactEffect === 'scream' ? 760 : 140, 0.12, 'sawtooth');
    update(scene, enemy, scene.time.now);
  }
  function update(scene, enemy, time) {
    const g = enemy.contactEffect;
    if (!g) return;
    if (!enemy.active || enemy.defeated || enemy.floorIndex !== scene.floor || scene.gameState !== 'playing' || time >= enemy.effectUntil) { clear(enemy); return; }
    const reach = enemy.profile.contactEffect === 'whip' ? 62 : 50;
    if (Math.abs(scene.player.x - enemy.x) < reach && Math.abs(scene.player.body.bottom - enemy.body.bottom) < 65) scene.takeDamage(enemy.x, enemy.profile.damage);
    g.clear().setPosition(enemy.x, enemy.body.bottom);
    const phase = Math.floor(time / 70) % 3;
    if (enemy.profile.contactEffect === 'firewall') {
      for (let i = 0; i < 8; i++) {
        const x = -40 + i * 10, h = 17 + ((i + phase) % 3) * 8;
        g.fillStyle(0xe44d25).fillTriangle(x, 0, x + 6, -h, x + 12, 0);
        g.fillStyle(0xffcf59).fillTriangle(x + 3, 0, x + 6, -h + 8, x + 9, 0);
      }
    } else if (enemy.profile.contactEffect === 'whip') {
      const d = enemy.facingDirection || 1;
      const y = -43 - phase * 8;
      g.lineStyle(4, 0x4a251d).lineBetween(d * 10, -42, d * 28, -48);
      g.lineStyle(2, 0x21171c).beginPath().moveTo(d * 28, -48).lineTo(d * 46, y).lineTo(d * 57, y + 16).lineTo(d * 46, y + 23).strokePath();
    } else if (enemy.profile.contactEffect === 'scream') {
      // Exaggerated eyes, open mouth and sound rays, over the existing head.
      const y = -enemy.profile.renderHeight + 17;
      g.fillStyle(0xfff8e4).fillRect(-9, y, 8, 6).fillRect(2, y, 8, 6);
      g.fillStyle(colors.ink).fillRect(-4, y + 1, 2, 4).fillRect(6, y + 1, 2, 4).fillRect(-2, y + 12, 7, 9);
      g.lineStyle(2, colors.gold);
      for (const d of [-1, 1]) { g.lineBetween(d * 16, y + 5, d * (24 + phase * 3), y); g.lineBetween(d * 18, y + 13, d * (28 + phase * 3), y + 16); }
    }
  }
  window.ITHeroTrioAttacks = { textures, projectile, contact, update, clear };
})();
