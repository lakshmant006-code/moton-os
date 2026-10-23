// Real-time recording with the page's clock slowed down (time dilation), so the slow software
// renderer still gives smooth footage once it's played back at normal speed.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
export const W = 1366, H = 1024;
export async function open(OUT, K = 0.25) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript((K) => {
    const g = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      if (/^rig\.(hint|auto|checkDone)\./.test(k)) return '1';
      return g.call(this, k);
    };
    // Slow every clock the app can read by K.
    window.__K = 1;
    const pn = performance.now.bind(performance);
    let realBase = pn(), virtBase = realBase;
    const now = () => virtBase + (pn() - realBase) * window.__K;
    window.__setK = (k) => { virtBase = now(); realBase = pn(); window.__K = k; };
    performance.now = now;
    const dn = Date.now; const d0 = dn(), p0 = pn();
    Date.now = () => d0 + (now() - p0);
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf(() => cb(now()));
    const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
    window.setTimeout = (fn, d = 0, ...a) => st(fn, (d || 0) / window.__K, ...a);
    window.setInterval = (fn, d = 0, ...a) => si(fn, (d || 0) / window.__K, ...a);
  }, K);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:5173/', { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  const slow = async () => { await p.evaluate((k) => window.__setK(k), K); await cdp.send('Animation.setPlaybackRate', { playbackRate: K }); };
  await slow();
  let frames = null;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    if (frames) frames.push({ t: metadata.timestamp, data });
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  // wait in app time
  const advance = (sec) => p.waitForTimeout((sec * 1000) / K);
  const start = async () => { frames = []; await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H }); };
  const stop = async (name) => {
    await cdp.send('Page.stopScreencast');
    const fr = frames; frames = null;
    const dir = `${OUT}/${name}_f`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    let list = '';
    fr.forEach((f, i) => {
      const fn = `${dir}/${String(i).padStart(5, '0')}.jpg`;
      fs.writeFileSync(fn, Buffer.from(f.data, 'base64'));
      const d = i < fr.length - 1 ? (fr[i + 1].t - f.t) * K : 0.1;
      list += `file '${fn}'\nduration ${d.toFixed(5)}\n`;
    });
    list += `file '${dir}/${String(fr.length - 1).padStart(5, '0')}.jpg'\n`;
    fs.writeFileSync(`${dir}/list.txt`, list);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', `fps=30,scale=${W}:${H},format=yuv420p`, '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', `${OUT}/${name}.mp4`]);
    fs.rmSync(dir, { recursive: true, force: true });
    const span = (fr[fr.length - 1].t - fr[0].t) * K;
    console.log(`clip ${name}: ${fr.length} frames over ${span.toFixed(1)}s app time (${(fr.length / span).toFixed(1)} fps)`);
  };
  const shot = async n => { await p.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n); };
  const click = async (sel) => { await p.$eval(sel, el => el.click()); };
  const stagePt = async (pt) => p.evaluate(({ x, y }) => {
    const c = document.getElementById('stage');
    const r = c.getBoundingClientRect();
    return { x: r.left + x * r.width / c.width, y: r.top + y * r.height / c.height };
  }, pt);
  return { b, p, advance, start, stop, shot, click, stagePt };
}
