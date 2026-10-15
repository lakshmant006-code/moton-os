import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { Main } from "./Main";
import { reel } from "./reel";

if (typeof document !== "undefined") {
  const handle = delayRender("fonts", { timeoutInMilliseconds: 60000 });
  // A stalled font request must never hang a render tab.
  Promise.race([
    new FontFace("Patrick Hand", `url(${staticFile("fonts/PatrickHand.woff2")})`).load().then((f) => document.fonts.add(f)),
    new Promise((resolve) => setTimeout(resolve, 15000)),
  ]).finally(() => continueRender(handle));
}

export const Root = () => (
  <Composition id="Main" component={Main} width={reel.w} height={reel.h} fps={reel.fps} durationInFrames={Math.round(reel.duration * reel.fps)} />
);
