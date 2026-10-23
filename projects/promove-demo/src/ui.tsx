import React from "react";
import { Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { reel } from "./reel";

const brand = Object.fromEntries(reel.brand.colors.map((c) => [c.id, c.v])) as Record<string, string>;
export const C = {
  stage: brand.stage, card: brand.card, text: brand.text, muted: brand.muted,
  blue: brand.blue, red: brand.red, orange: brand.orange, green: brand.green, violet: brand.violet,
  gradA: brand.gradA, gradB: brand.gradB,
  line: "#1E1E21",
  hair: "rgba(255,255,255,0.07)",
};
export const FONT = "Inter, Arial, sans-serif";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
// 0..1 progress between two frames, eased.
export const ramp = (f: number, a: number, b: number, ease = easeOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Layout taken from the reference: a text column from 11.7% and a dark card on the right.
export const X0 = 224;
export const CARD = { x: 860, y: 60, w: 900, h: 960 };

// Blur-and-rise entrance used for everything that appears.
export const Appear: React.FC<{ at: number; dur?: number; dy?: number; blur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, dur = 16, dy = 18, blur = 10, style, children }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, at + dur);
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * dy}px)`, filter: t < 1 ? `blur(${(1 - t) * blur}px)` : undefined, ...style }}>
      {children}
    </div>
  );
};

// Words blur in one after another.
export const Words: React.FC<{ text: string; at: number; step?: number; style?: React.CSSProperties }> = ({ text, at, step = 2.2, style }) => {
  const f = useCurrentFrame();
  let i = 0;
  return (
    <div style={style}>
      {text.split("\n").map((line, li) => (
        <div key={li}>
          {line.split(" ").map((w, wi) => {
            const t = ramp(f, at + i * step, at + i * step + 14);
            i++;
            return (
              <span key={wi} style={{ display: "inline-block", opacity: t, filter: `blur(${(1 - t) * 8}px)`, transform: `translateY(${(1 - t) * 10}px)`, marginRight: "0.26em" }}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: X0, top: 46, fontFamily: FONT, fontSize: 20, color: C.muted, letterSpacing: 0.2 }}>
    <Appear at={2} dy={6} blur={4}>{text}</Appear>
  </div>
);

export const Title: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <div style={{ position: "absolute", left: X0, top: 96, fontFamily: FONT, fontSize: 40, fontWeight: 500, color: C.text, letterSpacing: -0.4 }}>
    <Words text={text} at={at} />
  </div>
);

// Headline plus a muted line under it, vertically centred on the left.
export const TextBlock: React.FC<{ head: string; sub: string; at: number; width?: number }> = ({ head, sub, at, width = 560 }) => (
  <div style={{ position: "absolute", left: X0, top: 0, bottom: 0, width, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT }}>
    <Words text={head} at={at} step={1.6} style={{ fontSize: 44, lineHeight: 1.22, fontWeight: 500, color: C.text, letterSpacing: -0.6 }} />
    <Appear at={at + 22} dy={10} blur={6}>
      <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: C.muted, letterSpacing: -0.2 }}>{sub}</div>
    </Appear>
  </div>
);

// The small "Learning" note at the bottom left, as in the reference.
export const Learning: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <div style={{ position: "absolute", left: X0, bottom: 64, width: 560, fontFamily: FONT }}>
    <Appear at={at} dy={6} blur={4}>
      <div style={{ fontSize: 16, color: "#55555B", marginBottom: 6 }}>Learning</div>
      <div style={{ fontSize: 20, color: "#9A9AA0", lineHeight: 1.35 }}>{text}</div>
    </Appear>
  </div>
);

// The dark rounded card on the right.
export const Card: React.FC<{ at: number; children: React.ReactNode; box?: { x: number; y: number; w: number; h: number } }> = ({ at, children, box = CARD }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, at + 20);
  return (
    <div
      style={{
        position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 30, overflow: "hidden",
        background: `linear-gradient(180deg, #17171A 0%, ${C.card} 100%)`, boxShadow: `inset 0 0 0 1px ${C.hair}`,
        opacity: t, transform: `translateY(${(1 - t) * 24}px) scale(${lerp(0.985, 1, t)})`,
      }}
    >
      {children}
    </div>
  );
};

// A glowing sphere, like the listener orbs in the reference.
export const Orb: React.FC<{ color: string; size: number; children?: React.ReactNode; glow?: number }> = ({ color, size, children, glow = 1 }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.85) 0%, ${color} 38%, ${shade(color, -0.55)} 100%)`,
      boxShadow: `0 0 ${size * 0.5 * glow}px ${hexA(color, 0.45 * glow)}, inset 0 -${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.35)`,
    }}
  >
    {children}
  </div>
);

// A tinted option card with a soft inner glow (Roaster / Ride-or-Die / Calm Sibling in the reference).
export const GlowCard: React.FC<{ color: string; at: number; w: number; h: number; children: React.ReactNode }> = ({ color, at, w, h, children }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, at + 22);
  return (
    <div
      style={{
        width: w, height: h, borderRadius: 32, position: "relative", overflow: "hidden", flexShrink: 0,
        background: `radial-gradient(120% 90% at 50% 110%, ${hexA(color, 0.42)} 0%, ${hexA(color, 0.1)} 55%, rgba(20,20,22,0.9) 100%), #121214`,
        boxShadow: `inset 0 0 0 1.5px ${hexA(color, 0.38)}, inset 0 0 70px ${hexA(color, 0.22)}, 0 0 60px ${hexA(color, 0.12 * t)}`,
        opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(0.96, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined,
        fontFamily: FONT,
      }}
    >
      {children}
    </div>
  );
};

// iPad (landscape) showing a 1366x1024 screen. zoom = scale around a point in screen pixels.
export const SCREEN_W = 1366;
export const SCREEN_H = 1024;
export const Tablet: React.FC<{ width: number; zoom?: { s: number; x: number; y: number }; children: React.ReactNode }> = ({ width, zoom, children }) => {
  const bezel = 16;
  const inner = width - bezel * 2;
  const k = inner / SCREEN_W;
  return (
    <div style={{ width, height: inner * (SCREEN_H / SCREEN_W) + bezel * 2, padding: bezel, borderRadius: 40, background: "#0A0A0B", boxShadow: "inset 0 0 0 2px #2A2A2E, 0 30px 80px rgba(0,0,0,0.6)", boxSizing: "border-box" }}>
      <div style={{ width: inner, height: inner * (SCREEN_H / SCREEN_W), borderRadius: 22, overflow: "hidden", position: "relative", background: "#222" }}>
        <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
          <div style={{ width: SCREEN_W, height: SCREEN_H, position: "relative", transformOrigin: zoom ? `${zoom.x}px ${zoom.y}px` : undefined, transform: zoom ? `scale(${zoom.s})` : undefined }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Screen: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: SCREEN_W, height: SCREEN_H, ...style }} />
);

export const Clip: React.FC<{ src: string; from?: number; rate?: number }> = ({ src, from = 0, rate = 1 }) => (
  <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} playbackRate={rate} muted style={{ position: "absolute", inset: 0, width: SCREEN_W, height: SCREEN_H }} />
);

// "2x ▶▶" speed pill from the reference.
export const Speed: React.FC<{ rate: number; at: number }> = ({ rate, at }) => (
  <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)" }}>
    <Appear at={at} dy={-6} blur={4}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(40,40,44,0.85)", color: "#fff", fontFamily: FONT, fontSize: 20, fontWeight: 500, boxShadow: `inset 0 0 0 1px ${C.hair}` }}>
        {`${rate}x`}
        <svg width="22" height="14" viewBox="0 0 22 14"><path d="M0 0l10 7-10 7zM11 0l10 7-10 7z" fill="#fff" /></svg>
      </div>
    </Appear>
  </div>
);

export const Chip: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ color, children, style }) => (
  <div style={{ padding: "10px 14px", borderRadius: 12, background: hexA(color, 0.12), boxShadow: `inset 0 0 0 1px ${hexA(color, 0.35)}`, color: "#E8E8EA", fontFamily: FONT, fontSize: 16, lineHeight: 1.35, ...style }}>
    {children}
  </div>
);

export const Pose: React.FC<{ name: string; h: number; style?: React.CSSProperties }> = ({ name, h, style }) => (
  <Img src={staticFile(`poses/${name}.png`)} style={{ height: h, width: "auto", display: "block", ...style }} />
);

// ---- colour helpers ----
export function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// ---- line icons (24x24, white stroke) ----
const P: Record<string, string> = {
  camera: "M4 8h3l2-2.5h6L17 8h3v11H4zM12 17a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z",
  body: "M12 3.2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 8v7m0 0-3.5 6M12 15l3.5 6M5.5 10.5 12 9l6.5 1.5",
  face: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM8.5 10v.5M15.5 10v.5M8 14.5c1 1.4 2.4 2 4 2s3-.6 4-2",
  wave: "M2 12c2.5-6 4.5-6 7 0s4.5 6 7 0 4.5-6 6 0",
  timer: "M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 9v4l2.5 2M9.5 2.5h5",
  film: "M3 5h18v14H3zM7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  vector: "M5 19L19 5M5 19a2 2 0 1 1 0-.01M19 5a2 2 0 1 1 0-.01M4 8h4V4M16 20h4v-4",
  grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  spark: "M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z",
  check: "M5 12.5l4.5 4.5L19 7.5",
};
export const Icon: React.FC<{ name: string; size?: number; color?: string; width?: number }> = ({ name, size = 24, color = "#fff", width = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d={P[name]} />
  </svg>
);
