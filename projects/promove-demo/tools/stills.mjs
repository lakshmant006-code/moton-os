import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
// Quick layout check: node tools/stills.mjs 90 300 555  ->  out/stills/f0090.png ...
const root = process.cwd();
fs.mkdirSync("out/stills", { recursive: true });
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.REMOTION_BROWSER || undefined; // e.g. a preinstalled headless_shell
const composition = await selectComposition({ serveUrl, id: "Main", browserExecutable });
for (const frame of frames) {
  await renderStill({ serveUrl, composition, frame, output: `out/stills/f${String(frame).padStart(4, "0")}.png`, browserExecutable });
  console.log("frame", frame);
}
