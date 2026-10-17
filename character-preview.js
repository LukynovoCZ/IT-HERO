/* Standalone inspection scene: uses the same normalized textures as the game. */
(() => {
  'use strict';
  class CharacterPreview extends Phaser.Scene {
    constructor() { super('CharacterPreview'); }
    preload() {
      ITHeroEnemyCatalog.preload(this);
      this.load.image('preview-hero-source', 'assets/characters.png');
    }
    create() {
      this.floor = 0; this.gameState = 'playing';
      this.player = {x: -9999, body: {bottom: 0}};
      this.tone = () => {}; this.takeDamage = () => {};
      ITHeroTrioAttacks.textures(this);
      this.paused = false;
      this.animationTime = 0;
      this.baseline = 360;
      const graphics = this.add.graphics();
      graphics.fillStyle(0x152f2b).fillRect(0, 0, 960, 540);
      graphics.lineStyle(1, 0x24453e);
      for (let y = 40; y < this.baseline; y += 20) graphics.lineBetween(0, y, 960, y);
      graphics.fillStyle(0x78867b).fillRect(0, this.baseline, 960, 34);
      graphics.lineStyle(2, 0xa7eb6a).lineBetween(0, this.baseline, 960, this.baseline);
      const hero = this.textures.createCanvas('preview-hero', 64, 80);
      hero.context.imageSmoothingEnabled = false;
      const width = Math.round(245 * 76 / 342);
      hero.context.drawImage(this.textures.get('preview-hero-source').getSourceImage(),
        40, 16, 245, 342, Math.round((64 - width) / 2), 4, width, 76);
      hero.refresh();
      this.entries = [{ name: 'AJŤÁK', height: 76, frames: { idle: 'preview-hero' },
        body: { width: 28, height: 72, x: 18, y: 8 }, frameWidth: 64, frameHeight: 80 }];
      for (const profile of Object.values(ITHeroEnemyCatalog.profiles)) {
        this.entries.push({ ...profile, height: profile.renderHeight,
          frames: ITHeroEnemyCatalog.createTextures(this, profile) });
      }
      this.entries.forEach((entry, i) => {
        const x = 120 + i * 240;
        entry.sprite = this.add.sprite(x, this.baseline, entry.frames.idle).setOrigin(0.5, 1);
        if (entry.id) {
          Object.assign(entry.sprite, {profile: entry, floorIndex: 0, facingDirection: 1, body: {bottom: this.baseline}});
          entry.projectiles.forEach((weapon, index) => this.add.image(x - 22 + index * 44, 485, weapon.key));
        }
        this.add.text(x, 415, entry.name, { fontFamily: 'monospace', fontSize: '17px', color: '#b0ee78' }).setOrigin(0.5);
        this.add.text(x, 445, `${entry.height} px`, { fontFamily: 'monospace', fontSize: '16px', color: '#e6eee8' }).setOrigin(0.5);
      });
      this.bodyGraphics = this.add.graphics();
      this.controls = Object.fromEntries(['pose', 'zoom', 'pause', 'bodies'].map(id => [id, document.getElementById(id)]));
      this.controls.pause.onclick = () => {
        this.paused = !this.paused;
        this.controls.pause.textContent = this.paused ? 'Pokračovat v animaci' : 'Pozastavit animaci';
        this.controls.pause.setAttribute('aria-pressed', String(this.paused));
      };
      this.refresh();
    }
    refresh() {
      const zoom = Number(this.controls.zoom.value);
      const pose = this.controls.pose.value;
      this.bodyGraphics.clear().lineStyle(1, 0xffd269);
      for (const entry of this.entries) {
        let frame = pose === 'contact' ? entry.contactPose : pose === 'attack' ? entry.attackPose : pose;
        if (pose === 'walk' && Math.floor(this.animationTime / 180) % 2 === 0) frame = 'idle';
        entry.sprite.setTexture(entry.frames[frame] || entry.frames.idle).setScale(zoom);
        if (entry.id) {
          if (pose === 'contact') {
            // Effect coordinates use game pixels; scale the graphics with the sprite.
            if (!entry.sprite.contactEffect) { ITHeroTrioAttacks.contact(this, entry.sprite); entry.sprite.effectUntil = this.animationTime + 650; }
            ITHeroTrioAttacks.update(this, entry.sprite, this.animationTime);
            entry.sprite.contactEffect?.setScale(zoom);
          } else ITHeroTrioAttacks.clear(entry.sprite);
        }
        if (this.controls.bodies.checked) {
          const body = entry.body;
          this.bodyGraphics.strokeRect(entry.sprite.x + (body.x - entry.frameWidth / 2) * zoom,
            this.baseline + (body.y - entry.frameHeight) * zoom, body.width * zoom, body.height * zoom);
        }
      }
    }
    update(time, delta) {
      if (!this.controls) return;
      if (!this.paused) this.animationTime += delta;
      this.refresh();
    }
  }
  new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: 960, height: 540,
    pixelArt: true, roundPixels: true, antialias: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [CharacterPreview]
  });
})();
