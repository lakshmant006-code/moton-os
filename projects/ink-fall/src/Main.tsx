import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS, el, reel, sceneFrames } from "./reel";
import { Finish, RedWash, ramp } from "./fx";
import { Burst, Eyes, Fall, Flash, GlowWalk, LowAngle, Nape, Profile, Shades, Stand, Storm } from "./scenes";

const SCENES: Record<string, React.FC> = {
  S1: Storm, S2: Nape, S3: Profile, S4: Eyes, S5: Shades, S6: Flash, S7: LowAngle, S8: Stand, S9: GlowWalk, S10: Fall, S11: Burst,
};
// Scenes lit from behind: the red light adds on top instead of staining the paper.
const DARK = new Set(["S3", "S9", "S10", "S11"]);

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cur = reel.scenes.find((s) => t >= s.t[0] && t < s.t[1]) ?? reel.scenes[reel.scenes.length - 1];
  const hits = reel.scenes.flatMap((s) => s.els.filter((e) => e.id === "red").map(() => el(s.id, "red").v<number[]>("at"))).flat();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Synthesized from reel.json by sfx/make_score.py */}
      <Audio src={staticFile(reel.audio.sfx)} volume={reel.audio.sfxVol} />
      {Object.entries(SCENES).map(([id, Comp]) => {
        const { from, dur } = sceneFrames(id);
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}
      <RedWash t={t} at={hits} dark={DARK.has(cur.id)} />
      <Finish f={f} />
      <AbsoluteFill style={{ background: "#000", opacity: ramp(t, reel.duration - 0.45, reel.duration - 0.05) }} />
    </AbsoluteFill>
  );
};
