import { open } from './slow.mjs';
const OUT = process.argv[2];
const { b, p, advance, start, stop, shot, click, stagePt } = await open(OUT);

// 1. Live: open the camera bar, start the demo performer
await start();
await advance(0.8);
await click('#btnCam'); await advance(1.2);
await click('#capStartDemo'); await advance(7);
await stop('live');

// 2. Pose: countdown, one drawing
await click('.cap-modes [data-mode="pose"]'); await advance(0.3);
await start();
await advance(0.4);
await click('#capShutter'); await advance(4.8);
await stop('pose');
await shot('pose_after');

// 3. Motion: record, stop, the take lands in the filmstrip
await click('.cap-modes [data-mode="motion"]'); await advance(0.5);
await start();
await advance(0.3);
await click('#capShutter'); await advance(4.5);
await click('#capShutter'); await advance(3.5);
await stop('motion');
await shot('filmstrip');

// 4. Rig: turn the selected part around its joint
const h = await p.evaluate(() => window.takes.handles && JSON.parse(JSON.stringify(window.takes.handles)));
console.log('handles', JSON.stringify(h));
if (h && h.turn) {
  await start();
  await advance(0.5);
  const a = await stagePt(h.turn);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let i = 1; i <= 36; i++) {
    const ang = (i / 36) * 1.3;
    await p.mouse.move(a.x + Math.sin(ang) * 80, a.y + 80 - Math.cos(ang) * 80);
    await advance(1 / 30);
  }
  await advance(0.4); await p.mouse.up(); await advance(0.9);
  await stop('turn');
  await shot('turned');
  const h2 = await p.evaluate(() => window.takes.handles && JSON.parse(JSON.stringify(window.takes.handles)));
  console.log('handles2', JSON.stringify(h2));
  if (h2 && h2.stretch) {
    await start();
    await advance(0.4);
    const s = await stagePt(h2.stretch);
    const t = await stagePt(h2.turn);
    const dx = s.x - t.x, dy = s.y - t.y, len = Math.hypot(dx, dy) || 1;
    await p.mouse.move(s.x, s.y); await p.mouse.down();
    for (let i = 1; i <= 30; i++) {
      const k = Math.sin((i / 30) * Math.PI / 2) * 70;
      await p.mouse.move(s.x + dx / len * k, s.y + dy / len * k);
      await advance(1 / 30);
    }
    await advance(0.3); await p.mouse.up(); await advance(0.9);
    await stop('stretch');
    await shot('stretched');
  }
}
await b.close();
