import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, el, reel, sceneById, sceneFrames } from "./reel";
import { Bars, ByHand, Canvas, Chatbot, EndCard, Flashcards, Generate, Hook, Meet, Tabs } from "./scenes";
import { Caption, Dock, MenuBar, Shell, Wallpaper, lerp, ramp } from "./ui";

const toMin = (s: string) => {
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  return ((+m[1] % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + +m[2];
};
const fromMin = (n: number) => {
  const m = ((Math.round(n) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const SCENES: Record<string, React.FC<{ clock: string }>> = {
  S1: Hook, S2: Tabs, S3: ByHand, S4: Chatbot, S6: Canvas, S7: Generate, S8: Flashcards,
};
const FULL: Record<string, React.FC> = { S5: Meet, S9: Bars, S10: EndCard };
const IN_SCREEN = [["S1", "S4"], ["S6", "S8"]];

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const sec = f / FPS;

  // Menu bar clock: the night drags on while you study by hand.
  const base = el("S1", "notifs").v("clock");
  const by = el("S3", "card");
  const [a, b] = [toMin(by.v("clockFrom")), toMin(by.v("clockTo"))];
  const s3 = sceneById("S3").t;
  const late = sec >= s3[0] && sec < sceneById("S4").t[1];
  const span = ((b - a) + 1440) % 1440;
  const clock = late ? `Wed ${fromMin(a + span * Math.min(1, (sec - s3[0]) / (s3[1] - s3[0])))}` : base;

  // The rounded screen is shown for the desktop parts and fades out for the full white beats.
  let shell = 0;
  let scale = 1;
  for (const [first, last] of IN_SCREEN) {
    const s = sceneFrames(first);
    const e = sceneFrames(last);
    const end = e.from + e.dur;
    if (f >= s.from && f < end) {
      const fin = s.from === 0 ? 1 : ramp(f, s.from, s.from + 10);
      const fout = 1 - ramp(f, end - 6, end);
      shell = Math.min(fin, fout);
      scale = lerp(0.94, 1, fin);
    }
  }
  const lastFrame = Math.round(reel.duration * FPS);

  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Audio src={staticFile("music.mp3")}
        volume={(fr) => reel.audio.musicVol * interpolate(fr, [0, 6, lastFrame - 45, lastFrame], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {shell > 0 && (
        <Shell opacity={shell} scale={scale}>
          <Wallpaper zoom={1 + sec * 0.002} />
          <MenuBar clock={clock} />
          <Dock />
          {Object.entries(SCENES).map(([id, Comp]) => {
            const { from, dur } = sceneFrames(id);
            return (
              <Sequence key={id} from={from} durationInFrames={dur}>
                <Comp clock={clock} />
              </Sequence>
            );
          })}
        </Shell>
      )}

      {Object.entries(FULL).map(([id, Comp]) => {
        const { from, dur } = sceneFrames(id);
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}

      {reel.scenes.map((s) => {
        const cap = s.els.find((e) => e.id.endsWith("cap"));
        if (!cap) return null;
        const { from, dur } = sceneFrames(s.id);
        const c = el(s.id, cap.id);
        return (
          <Sequence key={cap.id} from={from} durationInFrames={dur}>
            <Caption text={c.v("text")} hl={c.v("hl")} start={c.start} end={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
