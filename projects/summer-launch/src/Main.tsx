import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, reel } from "./reel";
import { Ask, CARD_LEN, CARD_T0, Cards, DRAW, Done, L, Lockup, Queue, Ranked, Ring, START_X, Scatter, Swarm, TAP_AT, archPoint, rowY, wordX } from "./scenes";
import { Orb, Ripple, Void, easeInOut, lerp, ramp } from "./ui";

type K = [number, number, number, number?, number?]; // seconds, x, y, scale, opacity

/* One continuous flight for the orb. It lands exactly on the things it taps (see scenes.tsx layout). */
const path = (): K[] => {
  const w = wordX();
  const pillY = rowY(5) + 24 + L.pill.h / 2;
  const pill2Y = rowY(3, 330) + 24 + L.pill.h / 2;
  const cards: K[] = [];
  for (let i = 0; i < 3; i++) {
    const t0 = CARD_T0 + i * CARD_LEN;
    cards.push([t0 + 0.35, 1430, 470], [t0 + TAP_AT - 0.15, L.cta.x, L.cta.y + 18], [t0 + TAP_AT, L.cta.x, L.cta.y], [t0 + 1.75, 1420, 560]);
  }
  return [
    [1.38, 960, 540, 0, 0], [1.55, 960, 540, 1.15, 1], [2.1, 1260, 380, 1, 1], [2.7, 1320, 770], [3.3, 760, 840], [3.8, 460, 520], [4.3, 560, 250, 0.9],
    [4.95, 1320, 240], [5.6, 1480, 440], [6.5, 720, pillY + 60], [6.75, L.pill.x + 60, pillY], [8.25, START_X - 40, pillY], [8.45, START_X, pillY + 10], [8.6, START_X, pillY],
    [9.3, 1320, 780], [10.6, 1500, 700], [11.6, w.from - 120, 540], [12.15, w.from - 40, 495], [12.75, w.from + 40, 495], [13.15, w.to - 30, 500], [13.8, w.to + 50, 505],
    [14.3, L.send.x + 30, L.send.y + 60], [14.48, L.send.x, L.send.y + 12], [14.6, L.send.x, L.send.y], [15.0, L.send.x - 40, L.send.y - 20],
    [15.24, 960, 520, 1.3], [15.6, 1560, 560, 1], [16.6, 1500, 300], [17.6, 400, 380], [18.4, 520, 760], [19.0, L.card.x - 40, 360], [19.3, L.card.x - 30, 370],
    [19.9, 1330, 320], [20.6, 1250, pill2Y + 70], [21.05, START_X, pill2Y + 10], [21.2, START_X, pill2Y],
    ...cards,
    [28.0, 960, 520, 1], [28.12, 960, 520, 0.3, 0],
    [30.2, 260, 900, 0.9, 0], [30.35, 300, 860, 1, 1], [31.0, 860, 260], [31.7, 1560, 640], [32.25, 980, 560, 0.8], [32.7, archPoint(0).x, archPoint(0).y, 0.3, 1], [32.92, archPoint(0).x, archPoint(0).y, 0.25, 0],
  ];
};

const TAPS = () => {
  const pillY = rowY(5) + 24 + L.pill.h / 2;
  const pill2Y = rowY(3, 330) + 24 + L.pill.h / 2;
  return [
    { t: 8.6, x: START_X, y: pillY }, { t: 14.6, x: L.send.x, y: L.send.y }, { t: 21.2, x: START_X, y: pill2Y },
    ...[0, 1, 2].map((i) => ({ t: CARD_T0 + i * CARD_LEN + TAP_AT, x: L.cta.x, y: L.cta.y })),
  ];
};

const sample = (keys: K[], t: number) => {
  let s = 1, o = 1;
  for (const k of keys) { if (k[3] !== undefined && k[0] <= t) s = k[3]; if (k[4] !== undefined && k[0] <= t) o = k[4]; }
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] ?? 1, o: keys[0][4] ?? 1 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const p = easeInOut((t - a[0]) / (b[0] - a[0] || 1));
      const sa = scaleAt(keys, i), sb = scaleAt(keys, i + 1), oa = opAt(keys, i), ob = opAt(keys, i + 1);
      return { x: lerp(a[1], b[1], p), y: lerp(a[2], b[2], p), s: lerp(sa, sb, p), o: lerp(oa, ob, p) };
    }
  }
  const z = keys[keys.length - 1];
  return { x: z[1], y: z[2], s, o };
};
const scaleAt = (k: K[], i: number) => { for (let j = i; j >= 0; j--) if (k[j][3] !== undefined) return k[j][3]!; return 1; };
const opAt = (k: K[], i: number) => { for (let j = i; j >= 0; j--) if (k[j][4] !== undefined) return k[j][4]!; return 1; };

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const keys = path();
  const at = (tt: number) => sample(keys, tt);
  const me = at(t);
  const taps = TAPS();
  const press = taps.reduce((m, tp) => Math.max(m, 1 - Math.min(1, Math.abs(t - tp.t) / 0.1)), 0);
  const trail = Array.from({ length: 9 }).map((_, i) => at(t - (i + 1) * 0.022));
  const lastFrame = Math.round(reel.duration * FPS);
  const glow = 1 + 0.6 * ramp(t, 28.05, 28.4) * (1 - ramp(t, 29.5, 30.2));

  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <Audio src={staticFile("music.mp3")}
        volume={(fr) => reel.audio.musicVol * interpolate(fr, [0, 4, lastFrame - 36, lastFrame], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Audio src={staticFile(reel.audio.sfx)} volume={reel.audio.sfxVol} />
      <Void f={f} glow={glow} />
      {t < 1.6 && <Scatter t={t} />}
      <Queue t={t} orbAt={(tt) => at(tt)} />
      <Ask t={t} />
      <Swarm t={t} />
      <Ranked t={t} />
      <Cards t={t} />
      <Done t={t} />
      <Ring t={t} />
      <Lockup t={t} />
      {taps.map((tp, i) => <Ripple key={i} x={tp.x} y={tp.y} p={ramp(t, tp.t, tp.t + 0.45)} />)}
      {me.o > 0.01 && t < DRAW.t0 + 0.05 && <div style={{ position: "absolute", inset: 0, zIndex: 20 }}><Orb trail={trail.filter((p) => p.o > 0.05)} x={me.x} y={me.y} s={me.s * (1 - 0.18 * press)} o={me.o} /></div>}
    </AbsoluteFill>
  );
};
