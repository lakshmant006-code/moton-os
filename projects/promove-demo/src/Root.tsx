import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { Main } from "./Main";
import { reel } from "./reel";

const FONTS: [string, string, string][] = [
  ["Inter", "Inter-Regular.otf", "400"],
  ["Inter", "Inter-Medium.otf", "500"],
  ["Inter", "Inter-SemiBold.otf", "600"],
  ["Inter", "Inter-Bold.otf", "700"],
];

if (typeof document !== "undefined") {
  // Fonts are declared in CSS, and the render waits for them for at most a few seconds: a stalled
  // font request in one tab must never hang the whole render.
  const css = FONTS.map(([family, file, weight]) => `@font-face{font-family:${family};src:url(${staticFile(`fonts/${file}`)});font-weight:${weight};font-display:block}`).join("");
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  const handle = delayRender("fonts", { timeoutInMilliseconds: 120000 });
  let done = false;
  const finish = () => { if (!done) { done = true; continueRender(handle); } };
  setTimeout(finish, 8000);
  try {
    Promise.allSettled(FONTS.map(([family, , weight]) => document.fonts.load(`${weight} 20px ${family}`))).then(finish, finish);
  } catch {
    finish();
  }
}

export const Root = () => (
  <Composition
    id="Main"
    component={Main}
    width={reel.w}
    height={reel.h}
    fps={reel.fps}
    durationInFrames={Math.round(reel.duration * reel.fps)}
  />
);
