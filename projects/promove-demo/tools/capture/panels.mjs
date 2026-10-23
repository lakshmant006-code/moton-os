// Stills of panels and test poses (real clock, no recording).
import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--hide-scrollbars'] });
async function page(query = '', bgOff = false) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 } });
  await ctx.addInitScript((bgOff) => {
    const g = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      if (/^rig\.(hint|auto|checkDone)\./.test(k)) return '1';
      if (bgOff && k === 'rig.bgOn') return '0';
      return g.call(this, k);
    };
  }, bgOff);
  const p = await ctx.newPage();
  await p.goto('http://localhost:5173/' + query, { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  return p;
}
const shot = async (p, n) => { await p.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n); };

let p = await page();
await p.click('#btnActions'); await p.waitForTimeout(600);
await p.click('.atab[data-tab="rig"]'); await p.waitForTimeout(800);
await shot(p, 's_actions_rig');
await p.click('.atab[data-tab="canvas"]'); await p.waitForTimeout(500);
await shot(p, 's_actions_canvas');
await p.click('.atab[data-tab="rig"]'); await p.waitForTimeout(500);
await p.evaluate(() => { const el = document.querySelector('#actionsPanel .panel-body, #actionsPanel'); el.scrollTop = 600; });
await p.waitForTimeout(400);
await shot(p, 's_actions_rig2');
await p.keyboard.press('Escape'); await p.mouse.click(700, 600); await p.waitForTimeout(500);
await p.click('#btnLayers'); await p.waitForTimeout(700);
await shot(p, 's_layers');
await p.mouse.click(700, 600); await p.waitForTimeout(400);
await p.evaluate(() => document.getElementById('btnRigCheck')?.click());
await p.waitForTimeout(1500);
await shot(p, 's_rigcheck');
await p.context().close();

for (const pose of ['rest', 'armsup', 'cross', 'squat', 'down', '']) {
  const q = await page('?testpose=' + pose, true);
  await q.waitForTimeout(1500);
  await shot(q, 'pose_' + (pose || 'mixed'));
  await q.context().close();
}
await b.close();
