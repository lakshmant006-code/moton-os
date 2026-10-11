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

  // The rounded screen is shown for the desktop parts. It pops in out of the white page and hard cuts away on the beat.
  let shell = 0;
  let scale = 1;
  for (const [first, last] of IN_SCREEN) {
    const s = sceneFrames(first);
    const e = sceneFrames(last);
    if (f >= s.from && f < e.from + e.dur) {
      const fin = s.from === 0 ? 1 : ramp(f, s.from, s.from + 7);
      shell = fin;
      scale = lerp(0.94, 1, fin);
    }
  }

  // Camera inside the screen: push in on whatever the caption is about.
  const local = (id: string) => f - sceneFrames(id).from;
  const inScene = (id: string) => { const s = sceneFrames(id); return f >= s.from && f < s.from + s.dur; };
  let cam = { s: 1, ox: 50, oy: 50 };
  if (inScene("S1")) cam = { s: 1 + 0.38 * ramp(local("S1"), 0, 56), ox: 97, oy: 8 };
  else if (inScene("S2")) {
    const lf = local("S2");
    const folder = 0.14 * ramp(lf, 0, 30) * (1 - ramp(lf, 34, 44));
    const tabs = 0.62 * ramp(lf, 62, 96);
    cam = lf < 44 ? { s: 1 + folder, ox: 40, oy: 38 } : { s: 1 + tabs, ox: 50, oy: 11 };
  } else if (inScene("S3")) cam = { s: 1 + 0.07 * ramp(local("S3"), 0, 100), ox: 62, oy: 30 };
  else if (inScene("S4")) cam = { s: 1 + 0.06 * ramp(local("S4"), 0, 120), ox: 50, oy: 50 };
  const lastFrame = Math.round(reel.duration * FPS);

  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Audio src={staticFile("music.mp3")}
        volume={(fr) => reel.audio.musicVol * interpolate(fr, [0, 6, lastFrame - 45, lastFrame], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {/* Synthesized from reel.json audio.sfxCues by sfx/make_sfx.py */}
      <Audio src={staticFile(reel.audio.sfx)} volume={reel.audio.sfxVol} />

      {shell > 0 && (
        <Shell opacity={shell} scale={scale}>
          <AbsoluteFill style={{ transform: `scale(${cam.s})`, transformOrigin: `${cam.ox}% ${cam.oy}%` }}>
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
          </AbsoluteFill>
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
