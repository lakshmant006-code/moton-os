import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'] });
const P = Math.PI;
const POSES = {
  armsup: { upperArmR: -P / 2 - 0.35, foreArmR: -P / 2 - 0.15, upperArmL: -P / 2 + 0.35, foreArmL: -P / 2 + 0.15 },
  cross: { upperArmR: P / 2 - 0.55, foreArmR: -0.25, upperArmL: P / 2 + 0.55, foreArmL: P + 0.25 },
  wave: { upperArmR: -P + 0.6, foreArmR: -P / 2 - 0.2, upperArmL: P / 2 - 0.2, foreArmL: P / 2 - 0.1, thighL: P / 2 - 0.35, shinL: P / 2 + 0.5 },
};
for (const [name, ang] of Object.entries(POSES)) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 } });
  await ctx.addInitScript(() => { const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { if (/^rig\.(hint|auto|checkDone)\./.test(k)) return '1'; if (k === 'rig.bgOn') return '0'; return g.call(this, k); }; });
  const p = await ctx.newPage();
  await p.goto('http://localhost:5173/?testpose=rest', { waitUntil: 'load' });
  await p.waitForTimeout(6000);
  await p.evaluate((a) => Object.assign(window.motionRig.rig.angle, a), ang);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/pose_${name}.png` }); console.log(name);
  await ctx.close();
}
await b.close();
