// Start python3 -m http.server 8000 --bind 127.0.0.1 first.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/game.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('new Phaser.Game({', 'window.__testGame = new Phaser.Game({') });
    });
    await page.goto('http://127.0.0.1:8000');
    await page.locator('#game-action').waitFor({ state: 'visible' });
    await page.keyboard.press('Enter');
    await page.evaluate(() => {
      const s = window.__testGame.scene.getScene('ITGame');
      s.enemies.getChildren().slice().filter(e => e.kind !== 'specialist').forEach(e => e.destroy());
      s.enemies.getChildren().forEach(e => e.attackDelay = Infinity);
    });
    for (const [source, kind] of [['lift', 'beer'], ['desk', 'hotdog']]) {
      await page.evaluate(({ source, kind }) => {
        const s = window.__testGame.scene.getScene('ITGame');
        s.spawnHelper(source, kind);
      }, { source, kind });
      assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').helperVisit.source), source);
      await page.waitForFunction(() => window.__testGame.scene.getScene('ITGame').aidItems.countActive() === 1);
      assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').aidItems.getChildren()[0].texture.key), kind);
      await page.screenshot({ path: `/tmp/it-hero-tests/helper-${source}.png` });
      // Pausing must freeze the helper visit and the gift's expiry clock.
      await page.keyboard.press('Escape');
      const time = await page.evaluate(() => window.__testGame.scene.getScene('ITGame').playTime);
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').playTime), time);
      await page.keyboard.press('Escape');
      await page.evaluate(() => {
        const s = window.__testGame.scene.getScene('ITGame');
        s.energy = 1;
        const item = s.aidItems.getChildren()[0];
        s.player.body.reset(item.x, item.y - 15);
        s.player.setVelocity(0, 0);
      });
      await page.waitForFunction(() => window.__testGame.scene.getScene('ITGame').energy === 5);
      assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').aidItems.countActive()), 0);
      await page.evaluate(() => window.__testGame.scene.getScene('ITGame').updateHelper(3600));
      assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').helperVisit), null);
      console.log(`PASS ${source}/${kind}: appearance, delayed drop, pause freeze, actual pickup restores full health, helper leaves`);
    }
    await page.evaluate(() => {
      const s = window.__testGame.scene.getScene('ITGame');
      s.player.body.reset(82, 4280);
      s.spawnHelper('desk', 'hotdog');
      s.updateHelper(901);
      const item = s.aidItems.getChildren()[0];
      window.__giftLabel = item.getData('label');
      s.updateHelper(11001);
    });
    assert.equal(await page.evaluate(() => window.__testGame.scene.getScene('ITGame').aidItems.countActive()), 0);
    assert.equal(await page.evaluate(() => window.__giftLabel.active), false);
    console.log('PASS uncollected gift and its label expire after 11 seconds');
    // Verify the scheduler itself, rather than only explicit appearances.
    await page.evaluate(() => {
      const s = window.__testGame.scene.getScene('ITGame');
      s.nextHelperAt = s.playTime + 100;
    });
    await page.waitForFunction(() => !!window.__testGame.scene.getScene('ITGame').helperVisit);
    console.log('PASS helper appears automatically on the game clock');
    for (const [distance, expected] of [[300, 'unicorn'], [80, 'rainbow-spray']]) {
      const attack = await page.evaluate(distance => {
        const s = window.__testGame.scene.getScene('ITGame');
        s.physics.world.pause();
        s.enemyShots.clear(true, true);
        const e = s.enemies.getChildren()[0];
        e.floorIndex = 0; e.body.reset(590, 4280); e.lastAttack = Infinity;
        e.contactUntil = 0; e.baseX = 590;
        s.player.body.reset(e.x - distance, 4280);
        s.player.setVelocity(0, 0); s.energy = 5; s.lastHit = -3000;
        s.enemyAttack(e);
        const shot = s.enemyShots.getChildren()[0];
        const result = { texture: shot.texture.key, expires: shot.getData('expires') - s.time.now };
        s.physics.world.resume();
        return result;
      }, distance);
      assert.equal(attack.texture, expected);
      if (expected === 'rainbow-spray') {
        assert.equal(attack.expires, 350);
        await page.waitForFunction(() => window.__testGame.scene.getScene('ITGame').energy === 4);
        await page.screenshot({ path: '/tmp/it-hero-tests/specialist-spray.png' });
      }
      console.log(`PASS specialist ${expected}: distance-dependent attack${expected === 'rainbow-spray' ? ' and real spray hit' : ''}`);
    }
    await page.evaluate(() => {
      const s = window.__testGame.scene.getScene('ITGame');
      s.enemyShots.clear(true, true);
      window.__flagCreated = false;
      const create = s.enemyShots.create.bind(s.enemyShots);
      s.enemyShots.create = (...args) => { const item = create(...args); if (item.texture.key === 'rainbow-flag') window.__flagCreated = true; return item; };
      const e = s.enemies.getChildren()[0];
      e.contactUntil = 0; s.energy = 5; s.lastHit = -3000;
      s.player.body.reset(e.x, e.y); s.player.setVelocity(0, 0);
    });
    await page.waitForFunction(() => window.__testGame.scene.getScene('ITGame').energy === 4);
    const flag = await page.evaluate(() => {
      const s = window.__testGame.scene.getScene('ITGame');
      s.physics.world.pause();
      return { pose: s.enemies.getChildren()[0].texture.key, flag: window.__flagCreated };
    });
    assert.equal(flag.pose, 'specialist-flag'); assert.equal(flag.flag, true);
    assert.deepEqual(errors, []);
    console.log('PASS specialist contact: flag swing, one point of damage, no JS errors');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
