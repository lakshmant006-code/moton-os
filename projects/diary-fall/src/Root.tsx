import { Composition } from "remotion";
import { Main } from "./Main";
import { reel } from "./reel";

export const Root = () => (
  <Composition id="Main" component={Main} width={reel.w} height={reel.h} fps={reel.fps} durationInFrames={Math.round(reel.duration * reel.fps)} />
);
