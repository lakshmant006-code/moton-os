import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";

export const W = 1920;
export const H = 936;
/* Diary page look: black pen on white ruled paper, nothing else. */
export const C = { ink: "#111111", paper: "#fdfdfb", rule: "#cdcdcd" };

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const ramp = (t: number, a: number, b: number, ease = easeInOut) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/* Deterministic randoms, so every render of a frame is identical. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* Pixel sizes of the prepared cutouts in public/ (made by tools/prep_art.py). */
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

/* The ruled diary page. `scroll` slides the rules (they rush upward during the fall). */
export const Page: React.FC<{ scroll?: number; gap?: number }> = ({ scroll = 0, gap = 64 }) => (
  <AbsoluteFill style={{
    background: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${gap - 2}px, ${C.rule} ${gap - 2}px, ${C.rule} ${gap}px), ${C.paper}`,
    backgroundPosition: `0px ${(((-scroll % gap) + gap) % gap) + 30}px, 0 0`,
  }} />
);

/* Hand drawn line boil: the drawing layer wobbles a hair every few frames, like a redrawn cartoon. */
export const BoilDefs: React.FC<{ f: number }> = ({ f }) => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <filter id="boil" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={Math.floor(f / 3) % 7} />
      <feDisplacementMap in="SourceGraphic" scale={4} />
    </filter>
  </svg>
);
export const Boil: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "url(#boil)" }}>{children}</AbsoluteFill>
);

const line = (x1: number, y1: number, x2: number, y2: number, w: number, key: React.Key, color = C.ink, o = 1) => (
  <line key={key} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} />
);

/* Cartoon motion lines: little groups of 2 or 3 parallel pen strokes sliding along one direction. */
export const MotionLines: React.FC<{ t: number; n?: number; angle?: number; speed?: number; seed?: number; w?: number; minLen?: number; maxLen?: number; color?: string; o?: number; area?: [number, number, number, number] }> = ({
  t, n = 14, angle = -24, speed = 1800, seed = 1, w = 5, minLen = 90, maxLen = 320, color = C.ink, o = 1, area = [0, 0, W, H],
}) => {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const [ax, ay, aw, ah] = area;
  const span = aw + ah + 800;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: n }).flatMap((_, i) => {
        const s = seed * 1000 + i * 17;
        const len = lerp(minLen, maxLen, rnd(s + 1));
        const v = speed * (0.7 + 0.6 * rnd(s + 3));
        const along = ((rnd(s + 4) * span + v * t) % span) - span / 2;
        const across = (rnd(s + 5) - 0.5) * (aw + ah) * 0.9;
        const cx = ax + aw / 2 - dx * along - dy * across;
        const cy = ay + ah / 2 - dy * along + dx * across;
        const k = 2 + Math.floor(rnd(s + 6) * 2);
        return Array.from({ length: k }).map((__, j) => {
          const off = (j - (k - 1) / 2) * 22;
          const l = len * (j === 1 ? 1 : 0.7);
          const px = cx - dy * off, py = cy + dx * off;
          return line(px, py, px + dx * l, py + dy * l, w, `${i}-${j}`, color);
        });
      })}
    </svg>
  );
};

/* Comic burst: clean radiating pen lines around a point, re-inked every few frames. */
export const BurstLines: React.FC<{ f: number; cx: number; cy: number; n?: number; r0?: number; r1?: number; w?: number; every?: number; seed?: number; o?: number; grow?: number }> = ({
  f, cx, cy, n = 48, r0 = 260, r1 = 900, w = 5, every = 3, seed = 5, o = 1, grow = 1,
}) => {
  const k = Math.floor(f / every);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = seed * 777 + k * 53 + i * 11;
        const a = ((i + (rnd(s) - 0.5) * 0.6) / n) * Math.PI * 2;
        const a0 = r0 * (1 + 0.35 * rnd(s + 1));
        const a1 = a0 + (r1 - a0) * (0.45 + 0.55 * rnd(s + 2)) * grow;
        return line(cx + Math.cos(a) * a0, cy + Math.sin(a) * a0, cx + Math.cos(a) * a1, cy + Math.sin(a) * a1, w * (0.6 + 0.7 * rnd(s + 3)), i);
      })}
    </svg>
  );
};

/* Shock marks: the little dashes that pop around someone on a beat. */
export const Shock: React.FC<{ t: number; hits: number[]; cx: number; cy: number; rx: number; ry: number; n?: number; len?: number; w?: number }> = ({
  t, hits, cx, cy, rx, ry, n = 10, len = 46, w = 6,
}) => {
  const h = hits.filter((x) => x <= t + 1e-6).pop();
  if (h === undefined || t - h > 0.42) return null;
  const p = (t - h) / 0.42;
  const pop = ramp(p, 0, 0.25, backOut);
  const o = 1 - ramp(p, 0.7, 1);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        // two fans, one either side of the subject
        const side = i % 2 ? 1 : -1;
        const a = (side > 0 ? 0 : Math.PI) + ((Math.floor(i / 2) / (n / 2 - 1)) - 0.5) * 1.3 + (rnd(h * 10 + i) - 0.5) * 0.12;
        const r = 1 + 0.08 * pop;
        const x0 = cx + Math.cos(a) * rx * r, y0 = cy + Math.sin(a) * ry * r;
        const l = len * pop * (0.7 + 0.5 * rnd(h * 10 + i + 3));
        return line(x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l, w, i);
      })}
    </svg>
  );
};

/* Doodle stars and plus sparkles flying out of a point. */
export const Doodles: React.FC<{ t: number; cx: number; cy: number; n?: number }> = ({ t, cx, cy, n = 26 }) => {
  if (t <= 0) return null;
  const star = (r: number) => Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = 6100 + i * 23;
        const a = rnd(s) * Math.PI * 2;
        const v = 420 + 900 * rnd(s + 1);
        const tt = Math.max(0, t - rnd(s + 2) * 0.15);
        const r = 80 + v * (1 - Math.exp(-tt * 2.6)) / 2.6;
        const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * 0.75;
        const size = 14 + 22 * rnd(s + 3);
        const o = Math.min(1, tt / 0.05) * (1 - ramp(tt, 1.1, 1.7));
        const rot = (rnd(s + 4) - 0.5) * 60 + tt * 90 * (rnd(s + 5) - 0.5);
        const kind = rnd(s + 6);
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`} opacity={o}>
            {kind < 0.5 ? <polygon points={star(size)} fill={C.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              : kind < 0.8 ? <path d={`M${-size * 0.7} 0 L${size * 0.7} 0 M0 ${-size * 0.7} L0 ${size * 0.7}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              : <circle r={size * 0.25} fill={C.ink} />}
          </g>
        );
      })}
    </svg>
  );
};

/* A faint print texture so the page is not dead flat. */
export const Finish: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 23} /><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.05 0" /></filter>
    </svg>
    <AbsoluteFill style={{ filter: "url(#grain)" }} />
  </AbsoluteFill>
);

/* The user's ocean waves (public/waves.png is a seamless horizontal loop, black on transparent). */
export const WAVE = { w: 2950, h: 521 };
const waveTile = (h: number, x: number): React.CSSProperties => ({
  backgroundImage: `url(${staticFile("waves.png")})`, backgroundRepeat: "repeat-x",
  backgroundSize: `${((WAVE.w / WAVE.h) * h).toFixed(1)}px ${h}px`, backgroundPosition: `${x.toFixed(1)}px 0px`,
});
/* Pen outline around a shape, for the paler back row. */
const OUTLINE = [[4, 0], [-4, 0], [0, 4], [0, -4]].map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${C.ink})`).join(" ");

/* One carousel row of waves sliding left to right, solid sea below its crests. outline: white waves drawn in pen. */
export const WaveRow: React.FC<{ t: number; top: number; h: number; speed: number; phase?: number; outline?: boolean }> = ({ t, top, h, speed, phase = 0, outline }) => {
  const tw = (WAVE.w / WAVE.h) * h;
  const x = ((speed * t + phase) % tw + tw) % tw;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, bottom: -400, filter: outline ? `invert(1) ${OUTLINE}` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, ...waveTile(h, x) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: h - 2, bottom: 0, background: "#000" }} />
    </div>
  );
};

/* Splash doodle: teardrop droplets thrown up and out, with a few spray strokes. */
export const Splash: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 16 }) => {
  if (t <= 0 || t > 1.2) return null;
  const o = 1 - ramp(t, 0.8, 1.2);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = 8800 + i * 13;
        const a = -Math.PI / 2 + (rnd(s) - 0.5) * 2.2;
        const v = 700 + 900 * rnd(s + 1);
        const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 1400 * t * t;
        const vx = Math.cos(a) * v, vy = Math.sin(a) * v + 2800 * t;
        const ang = (Math.atan2(vy, vx) * 180) / Math.PI - 90;
        const r = 9 + 12 * rnd(s + 2);
        return (
          <path key={i} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${ang.toFixed(1)})`}
            d={`M0 ${-r * 2.2} C ${r * 0.9} ${-r * 0.6} ${r} 0 0 ${r} C ${-r} 0 ${-r * 0.9} ${-r * 0.6} 0 ${-r * 2.2} Z`}
            fill={C.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        );
      })}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = -Math.PI / 2 + (i / 6 - 0.5) * 1.6;
        const r0 = 40 + 120 * t, r1 = r0 + 140 * (1 - ramp(t, 0.2, 0.6));
        return <line key={`l${i}`} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/* A wall of sea whose wavy crest sits at `top`: used to swallow the frame and hand over to the next shot. */
export const WaveWall: React.FC<{ t: number; top: number; h?: number }> = ({ t, top, h = 300 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: H + h + 400 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, ...waveTile(h, 260 * t) }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: h - 2, bottom: 0, background: "#000" }} />
  </div>
);
