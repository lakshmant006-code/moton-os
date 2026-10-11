import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { Main } from "./Main";
import { reel } from "./reel";

const FONTS: [string, string, string, string][] = [
  ["Poppins", "poppins-latin-500-normal.woff2", "500", "normal"],
  ["Poppins", "poppins-latin-600-normal.woff2", "600", "normal"],
  ["Poppins", "poppins-latin-700-normal.woff2", "700", "normal"],
  ["Poppins", "poppins-latin-500-italic.woff2", "500", "italic"],
  ["Poppins", "poppins-latin-600-italic.woff2", "600", "italic"],
  ["Poppins", "poppins-latin-700-italic.woff2", "700", "italic"],
  ["Inter", "Inter-Regular.otf", "400", "normal"],
  ["Inter", "Inter-Medium.otf", "500", "normal"],
  ["Inter", "Inter-SemiBold.otf", "600", "normal"],
  ["Inter", "Inter-Bold.otf", "700", "normal"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("fonts", { timeoutInMilliseconds: 60000 });
  Promise.allSettled(
    FONTS.map(([family, file, weight, style]) =>
      // A stalled font request must never hang a render tab.
      Promise.race([
        new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight, style }).load().then((f) => document.fonts.add(f)),
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
