import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";

export const W = 1920;
export const H = 936;
export const C = { ink: "#0a0a0a", paper: "#efe9e4", red: "#c0142b", glow: "#ffffff" };

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const ramp = (t: number, a: number, b: number, ease = easeInOut) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/* Deterministic randoms, so every render of a frame is identical. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* Pixel sizes of the prepared cutouts in public/ (see README in this folder). */
export const IMG = {
  front: [1534, 2866], side: [712, 2878], back: [1534, 2878], fall: [1374, 1344],
  "front-head": [2730, 2800], "side-head": [2492, 2800], "back-head": [2730, 2800], lenses: [2730, 2800],
} as const;
export type ImgName = keyof typeof IMG;

/* Puts image point (fx, fy) at screen point (sx, sy), k screen px per image px. */
export const place = (name: ImgName, fx: number, fy: number, sx: number, sy: number, k: number): React.CSSProperties => ({
  position: "absolute", left: sx - fx * k, top: sy - fy * k, width: IMG[name][0] * k, height: IMG[name][1] * k,
});

export const Pic: React.FC<{ name: string; style: React.CSSProperties }> = ({ name, style }) => (
  <Img src={staticFile(`${name}.png`)} style={{ ...style, maxWidth: "none" }} />
);

/* One dry brush stroke: a few tapered bristle bands of different lengths along +x. */
const strokePath = (len: number, w: number, seed: number) => {
  const bands = 2 + Math.floor(rnd(seed) * 3);
  let d = "";
  for (let b = 0; b < bands; b++) {
    const off = (rnd(seed + b * 3.1) - 0.5) * w * 0.9;
    const bw = w * (0.25 + 0.5 * rnd(seed + b * 7.7));
    const bl = len * (0.55 + 0.45 * rnd(seed + b * 5.3));
    const x0 = len - bl;
    const top: string[] = [];
    const bot: string[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const prof = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.02)), 0.7) * (1 - 0.55 * u) + 0.05;
      const j = (rnd(seed + b * 13 + i) - 0.5) * bw * 0.35;
      const x = x0 + u * bl;
      top.push(`${x.toFixed(1)},${(off - (bw / 2) * prof + j).toFixed(1)}`);
      bot.unshift(`${x.toFixed(1)},${(off + (bw / 2) * prof + j * 0.5).toFixed(1)}`);
    }
    d += `M${top.join(" L")} L${bot.join(" L")} Z `;
  }
  return d;
};

/* A storm of brush strokes travelling along one diagonal, wrapping around the frame. */
export const Strokes: React.FC<{
  t: number; n?: number; angle?: number; speed?: number; color?: string; seed?: number; opacity?: number; minLen?: number; maxLen?: number; width?: number;
}> = ({ t, n = 40, angle = -24, speed = 2200, color = C.ink, seed = 1, opacity = 1, minLen = 160, maxLen = 760, width = 34 }) => {
  const a = (angle * Math.PI) / 180;
  const dx = -Math.cos(a), dy = -Math.sin(a);
  const span = W + H + 1600;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = seed * 1000 + i * 17;
        const len = lerp(minLen, maxLen, rnd(s + 1));
        const w = width * (0.35 + rnd(s + 2));
        const v = speed * (0.6 + 0.8 * rnd(s + 3));
        // position along the travel direction, and across it
        const along = ((rnd(s + 4) * span + v * t) % span) - 800;
        const across = (rnd(s + 5) - 0.5) * (W + H) * 1.1;
        const cx = W / 2 + dx * (along - span / 2 + 800) - dy * across;
        const cy = H / 2 + dy * (along - span / 2 + 800) + dx * across;
        return <path key={i} d={strokePath(len, w, s)} fill={color} transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angle + 180})`} />;
      })}
    </svg>
  );
};

/* Ink spatter dots that flick in for a couple of frames. */
export const Spatter: React.FC<{ f: number; color?: string; n?: number; seed?: number; every?: number }> = ({ f, color = C.ink, n = 26, seed = 3, every = 3 }) => {
  const k = Math.floor(f / every);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = seed * 999 + k * 131 + i * 7;
        if (rnd(s) > 0.55) return null;
        const r = 2 + 9 * Math.pow(rnd(s + 1), 3);
        return <circle key={i} cx={rnd(s + 2) * W} cy={rnd(s + 3) * H} r={r} fill={color} />;
      })}
    </svg>
  );
};

/* Red light bleeding in from the edges on the beat, like the LED wall in the reference. */
export const RedWash: React.FC<{ t: number; at: number[]; dark?: boolean }> = ({ t, at, dark }) => {
  let o = 0;
  for (const h of at) {
    if (t < h - 0.04) continue;
    const d = t - h;
    o = Math.max(o, d < 0 ? 1 + d / 0.04 : Math.exp(-d / 0.26));
  }
  if (o < 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 85% at 50% 45%, rgba(192,20,43,${0.25 * o}) 0%, rgba(192,20,43,${0.85 * o}) 65%, rgba(120,0,18,${o}) 100%)`, mixBlendMode: dark ? "screen" : "multiply" }} />
      {dark && <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 70% at 50% 50%, transparent 40%, rgba(192,20,43,${0.55 * o}) 100%)` }} />}
    </AbsoluteFill>
  );
};

/* Radial speed lines bursting from a point. They re-roll every few frames for a hand drawn shimmer. */
export const Rays: React.FC<{ f: number; cx: number; cy: number; color: string; n?: number; every?: number; inner?: number; seed?: number; o?: number }> = ({
  f, cx, cy, color, n = 70, every = 2, inner = 120, seed = 5, o = 1,
}) => {
  const k = Math.floor(f / every);
  const R = 2600;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = seed * 777 + k * 53 + i * 11;
        const a = ((i + rnd(s) * 0.9) / n) * Math.PI * 2;
        const wa = 0.004 + 0.022 * Math.pow(rnd(s + 1), 2);
        const r0 = inner * (0.6 + rnd(s + 2) * 1.8);
        const p = (ang: number, r: number) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
        return <polygon key={i} points={`${p(a, r0)} ${p(a - wa, R)} ${p(a + wa, R)}`} fill={color} />;
      })}
    </svg>
  );
};

/* Vertical light streaks rushing upward: the figure is falling through them. */
export const Rain: React.FC<{ t: number; n?: number; speed?: number; o?: number }> = ({ t, n = 150, speed = 1700, o = 1 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {Array.from({ length: n }).map((_, i) => {
      const s = 4000 + i * 13;
      const len = 60 + 520 * Math.pow(rnd(s), 1.6);
      const v = speed * (0.45 + rnd(s + 1));
      const span = H + len + 200;
      const y = H + 100 - ((rnd(s + 2) * span + v * t) % span);
      const x = rnd(s + 3) * W;
      const w = rnd(s + 4) < 0.15 ? 3 : rnd(s + 4) < 0.5 ? 2 : 1;
      const a = 0.25 + 0.75 * rnd(s + 5);
      return (
        <div key={i} style={{
          position: "absolute", left: x, top: y, width: w, height: len, borderRadius: w,
          background: `linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,${a}) 70%, rgba(255,255,255,${a * 0.6}))`,
          boxShadow: w > 1 ? `0 0 6px rgba(255,255,255,${a * 0.6})` : undefined,
        }} />
      );
    })}
  </AbsoluteFill>
);

/* Slow drifting dust specks. */
export const Dust: React.FC<{ t: number; n?: number; o?: number; rise?: number }> = ({ t, n = 70, o = 1, rise = 18 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {Array.from({ length: n }).map((_, i) => {
      const s = 9000 + i * 7;
      const r = 1 + 2.6 * Math.pow(rnd(s), 3);
      const x = (rnd(s + 1) * W + Math.sin(t * 0.6 + i) * 14 + t * 8 * (rnd(s + 2) - 0.5)) % W;
      const y = (((rnd(s + 3) * H - t * rise * (0.4 + rnd(s + 4))) % H) + H) % H;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rnd(s + 5) * 2) + i));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: "#fff", opacity: tw, boxShadow: `0 0 ${r * 3}px rgba(255,255,255,0.8)` }} />;
    })}
  </AbsoluteFill>
);

/* Brush strokes exploding out of a point. Red first, cooling to white. */
export const BurstStrokes: React.FC<{ t: number; cx: number; cy: number; n?: number }> = ({ t, cx, cy, n = 170 }) => {
  if (t < 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = 7000 + i * 19;
        const a = rnd(s) * Math.PI * 2;
        const v = 500 + 2300 * Math.pow(rnd(s + 1), 1.4);
        const delay = rnd(s + 2) * 0.12;
        const tt = Math.max(0, t - delay);
        if (tt <= 0) return null;
        const r = 40 + v * (1 - Math.exp(-tt * 2.2)) / 2.2;
        const len = 40 + 260 * rnd(s + 3) * Math.exp(-tt * 1.4) + 30;
        const w = 4 + 18 * rnd(s + 4);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.82;
        const heat = Math.min(1, tt / 0.55);
        const red = rnd(s + 5) < 0.5 + 0.4 * (1 - heat);
        const color = red ? C.red : "#ffffff";
        const o = Math.min(1, tt / 0.04) * (1 - ramp(tt, 1.2, 1.9));
        return <path key={i} d={strokePath(len, w, s)} fill={color} opacity={o} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.atan2(Math.sin(a) * 0.82, Math.cos(a)) * 180) / Math.PI + 180})`} />;
      })}
    </svg>
  );
};

/* A white glowing silhouette. The drawing can flicker inside it on the beats. */
export const Glow: React.FC<{ name: ImgName; style: React.CSSProperties; art?: number; strength?: number; rot?: number }> = ({ name, style, art = 0, strength = 1, rot = 0 }) => (
  <div style={{ ...style, transform: `rotate(${rot}deg)` }}>
    <Pic name={`${name}-sil`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `blur(${26 * strength}px)`, opacity: 0.85 }} />
    <Pic name={`${name}-sil`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: `blur(${8 * strength}px)` }} />
    <Pic name={`${name}-sil`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    {art > 0.01 && <Pic name={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: art, mixBlendMode: "multiply", filter: "contrast(0.6) brightness(1.35)" }} />}
  </div>
);

/* Film grain and the LED wall falloff at the edges. */
export const Finish: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 37} /><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.09 0" /></filter>
    </svg>
    <AbsoluteFill style={{ filter: "url(#grain)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 90% at 50% 45%, transparent 60%, rgba(0,0,0,0.38) 100%)" }} />
  </AbsoluteFill>
);
