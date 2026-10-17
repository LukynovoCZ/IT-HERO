const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
 const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.route('**/character-preview.js*', async route => {
  const response = await route.fetch();
  await route.fulfill({ response, body: (await response.text()).replace('new Phaser.Game({', 'window.__preview = new Phaser.Game({') });
 });
 await page.goto('http://127.0.0.1:8000/character-preview.html');
 await page.waitForFunction(() => window.__preview?.scene.scenes[0]?.entries?.length === 4);
 const snapshot = () => page.evaluate(() => window.__preview.scene.scenes[0].entries.map(e => ({
  name: e.name, height: e.height, bottom: e.sprite.getBottomCenter().y, scale: e.sprite.scaleX, texture: e.sprite.texture.key
 })));
 let entries = await snapshot();
 assert.deepEqual(entries.map(e => e.height), [76, 92, 92, 108]);
 assert(entries.every(e => e.bottom === 360 && e.scale === 2));
 await page.selectOption('#pose', 'attack');
 await page.waitForTimeout(100);
 entries = await snapshot();
 assert.deepEqual(entries.slice(1).map(e => e.texture), ['trio-security_guard-radio', 'trio-hr_manager-documents', 'trio-design_manager-tablet']);
 await page.selectOption('#pose', 'walk');
 await page.click('#pause');
 await page.waitForTimeout(50);
 const frozen = await snapshot();
 await page.waitForTimeout(400);
 assert.deepEqual(await snapshot(), frozen);
 await page.selectOption('#zoom', '1');
 await page.check('#bodies');
 await page.waitForTimeout(100);
 assert((await snapshot()).every(e => e.bottom === 360 && e.scale === 1));
 await page.selectOption('#zoom', '2');
 await page.selectOption('#pose', 'idle');
 await page.uncheck('#bodies');
 await page.waitForTimeout(100);
 await page.screenshot({ path: '/tmp/it-hero-tests/character-preview.png', fullPage: true });
 assert.deepEqual(errors, []);
 await browser.close();
 console.log('PASS: four characters, shared baseline, real sizes, attack poses, pause, zoom and hitboxes; no browser errors.');
})().catch(e => { console.error(e); process.exit(1); });
