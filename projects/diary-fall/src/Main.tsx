import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS, reel, sceneFrames } from "./reel";
import { BoilDefs, C, Finish, ramp } from "./fx";
import { Burst, Eyes, Fall, Flash, LowAngle, Nape, PreRoll, Profile, Shades, Stand, Storm, Walk } from "./scenes";

const SCENES: Record<string, React.FC> = {
  S1: Storm, S2: Nape, S3: Profile, S4: Eyes, S5: Shades, S6: Flash, S7: LowAngle, S8: Stand, S9: Walk, S10: Fall, S11: Burst,
};
/* A scene with an "in" element dissolves over the previous one for that many seconds. */
const dissolve = (id: string) => {
  const e = reel.scenes.find((s) => s.id === id)!.els.find((x) => x.id === "in");
  return e ? (e.props as Record<string, { v: unknown }>).dur.v as number : 0;
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: C.paper, filter: "grayscale(1)" }}>
      {/* Synthesized from reel.json by sfx/make_score.py */}
      <Audio src={staticFile(reel.audio.sfx)} volume={reel.audio.sfxVol} />
      <BoilDefs f={f} />
      {Object.entries(SCENES).map(([id, Comp]) => {
        const { from, dur } = sceneFrames(id);
        const d = dissolve(id);
        const pre = Math.round(d * FPS);
        return (
          <Sequence key={id} from={from - pre} durationInFrames={dur + pre}>
            <PreRoll.Provider value={pre / FPS}>
              <AbsoluteFill style={{ opacity: d ? ramp(t, from / FPS - d, from / FPS) : 1 }}>
                <Comp />
              </AbsoluteFill>
            </PreRoll.Provider>
          </Sequence>
        );
      })}
      <Finish f={f} />
      <AbsoluteFill style={{ background: C.paper, opacity: ramp(t, reel.duration - 0.5, reel.duration - 0.05) }} />
    </AbsoluteFill>
  );
};
