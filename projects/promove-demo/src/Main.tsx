import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, reel, sceneFrames } from "./reel";
import { ClipScene, End, Export, Feel, Live, LogoIntro, Pipeline, Problem, Procreate, Question, RigCheck, RigClips, TwoWays } from "./scenes";
import { C } from "./ui";

// Frames into S9 where the turn clip hands over to the stretch clip.
const RIG_SPLIT = 84;

const SCENES: Record<string, React.FC> = {
  S0: LogoIntro,
  S1: Question,
  S2: Problem,
  S3: Pipeline,
  S4: Procreate,
  S5: Live,
  S6: TwoWays,
  S7: () => <ClipScene scene="S7" label="s7label" text="s7text" screen="s7screen" zoom={{ s: 1.15, x: 683, y: 600 }} />,
  S8: () => <ClipScene scene="S8" label="s8label" text="s8text" screen="s8screen" learn="s8learn" />,
  S9: () => <RigClips splitAt={RIG_SPLIT} />,
  S10: Feel,
  S11: RigCheck,
  S12: Export,
  S13: End,
};

// Each scene fades up from black and fades out into the next, like the reference's soft cuts.
const Fade: React.FC<{ dur: number; children: React.ReactNode; first: boolean; last: boolean }> = ({ dur, children, first, last }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, first ? 1 : 8, dur - (last ? 20 : 8), dur], [first ? 1 : 0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Main: React.FC = () => {
  const lastFrame = Math.round(reel.duration * FPS);
  const ids = Object.keys(SCENES);
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <Audio src={staticFile(reel.audio.music)}
        volume={(fr) => reel.audio.musicVol * interpolate(fr, [0, 20, lastFrame - 60, lastFrame], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {/* Synthesized from reel.json audio.sfxCues by sfx/make_sfx.py */}
      <Audio src={staticFile(reel.audio.sfx)} volume={reel.audio.sfxVol} />
      {/* ElevenLabs narration, one line per scene, placed by sfx/make_vo.py */}
      <Audio src={staticFile(reel.audio.vo)} volume={reel.audio.voVol} />
      {/* the thin rule down the left, as in the reference */}
      <div style={{ position: "absolute", left: 172, top: 0, bottom: 0, width: 1.5, background: C.line }} />
      {ids.map((id, i) => {
        const { from, dur } = sceneFrames(id);
        const Comp = SCENES[id];
        return (
          <Sequence key={id} from={from} durationInFrames={dur} name={id}>
            <Fade dur={dur} first={i === 0} last={i === ids.length - 1}><Comp /></Fade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
