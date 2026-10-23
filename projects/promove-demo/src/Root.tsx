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
  const handle = delayRender("fonts", { timeoutInMilliseconds: 60000 });
  Promise.allSettled(
    FONTS.map(([family, file, weight]) =>
      // A stalled font request must never hang a render tab.
      Promise.race([
        new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight }).load().then((f) => document.fonts.add(f)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
      ]),
    ),
  ).then((r) => {
    r.forEach((x, i) => x.status === "rejected" && console.warn("font failed", FONTS[i][1], x.reason));
    continueRender(handle);
  });
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
