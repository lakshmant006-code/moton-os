import React from "react";
import { Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { reel } from "./reel";

const brand = Object.fromEntries(reel.brand.colors.map((c) => [c.id, c.v])) as Record<string, string>;
// Light theme: warm paper stage, white cards, accents taken from the character and the playground art.
export const C = {
  stage: brand.stage, card: brand.card, text: brand.text, muted: brand.muted, navy: brand.navy,
  blue: brand.blue, red: brand.red, yellow: brand.yellow, green: brand.green, sky: brand.sky,
  line: "#DCD7CC",
  hair: "rgba(23,24,28,0.07)",
  soft: "#F6F3EE",
  faint: "#C9C4BA",
};
export const FONT = "Inter, Arial, sans-serif";
export const SHADOW = "0 1px 2px rgba(28,43,75,0.06), 0 18px 50px rgba(28,43,75,0.10)";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
// 0..1 progress between two frames, eased.
export const ramp = (f: number, a: number, b: number, ease = easeOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Layout from the reference: a text column from 11.7% and a card on the right.
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

// Chapter label: a small numbered tag and the chapter name.
export const Label: React.FC<{ text: string }> = ({ text }) => {
  const [num, ...rest] = text.split(/\s{2,}/);
  const name = rest.join(" ");
  return (
    <div style={{ position: "absolute", left: X0, top: 44, fontFamily: FONT, fontSize: 20, color: C.muted }}>
      <Appear at={2} dy={6} blur={4} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {name ? (
          <>
            <span style={{ padding: "4px 10px", borderRadius: 8, background: C.navy, color: "#fff", fontWeight: 600, fontSize: 16 }}>{num}</span>
            <span>{name}</span>
          </>
        ) : <span>{text}</span>}
      </Appear>
    </div>
  );
};

export const Title: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <div style={{ position: "absolute", left: X0, top: 100, fontFamily: FONT, fontSize: 44, fontWeight: 600, color: C.text, letterSpacing: -0.8 }}>
    <Words text={text} at={at} />
  </div>
);

// Headline plus a muted line under it, vertically centred on the left.
export const TextBlock: React.FC<{ head: string; sub: string; at: number; width?: number }> = ({ head, sub, at, width = 560 }) => (
  <div style={{ position: "absolute", left: X0, top: 0, bottom: 0, width, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT }}>
    <Words text={head} at={at} step={1.6} style={{ fontSize: 46, lineHeight: 1.18, fontWeight: 600, color: C.text, letterSpacing: -1 }} />
    <Appear at={at + 22} dy={10} blur={6}>
      <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.38, color: C.muted, letterSpacing: -0.2 }}>{sub}</div>
    </Appear>
  </div>
);

// The small "Learning" note at the bottom left, as in the reference.
export const Learning: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <div style={{ position: "absolute", left: X0, bottom: 64, width: 560, fontFamily: FONT }}>
    <Appear at={at} dy={6} blur={4}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: C.yellow }} />
        <div>
          <div style={{ fontSize: 15, color: C.muted, marginBottom: 4, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>Learning</div>
          <div style={{ fontSize: 20, color: "#4A4D55", lineHeight: 1.35 }}>{text}</div>
        </div>
      </div>
    </Appear>
  </div>
);

// The white card on the right.
export const Card: React.FC<{ at: number; children: React.ReactNode; box?: { x: number; y: number; w: number; h: number }; bg?: string }> = ({ at, children, box = CARD, bg = C.card }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, at + 20);
  return (
    <div
      style={{
        position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 32, overflow: "hidden",
        background: bg, boxShadow: `${SHADOW}, inset 0 0 0 1px ${C.hair}`,
        opacity: t, transform: `translateY(${(1 - t) * 24}px) scale(${lerp(0.985, 1, t)})`,
      }}
    >
      {children}
    </div>
  );
};

// A flat coloured disc with a white icon.
export const Orb: React.FC<{ color: string; size: number; children?: React.ReactNode }> = ({ color, size, children }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      background: color, boxShadow: `0 ${size * 0.1}px ${size * 0.3}px ${hexA(color, 0.35)}, inset 0 -${size * 0.06}px 0 rgba(0,0,0,0.12)`,
    }}
  >
    {children}
  </div>
);

// White option card with a tinted top panel (the reference's coloured listener cards, re-done in white).
export const ColorCard: React.FC<{ color: string; at: number; w: number; h: number; panel?: number; children: React.ReactNode; top?: React.ReactNode }> = ({ color, at, w, h, panel = 380, children, top }) => {
  const f = useCurrentFrame();
  const t = ramp(f, at, at + 22);
  return (
    <div
      style={{
        width: w, height: h, borderRadius: 32, position: "relative", overflow: "hidden", flexShrink: 0, background: C.card,
        boxShadow: `${SHADOW}, inset 0 0 0 1px ${C.hair}`,
        opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(0.96, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 8}px)` : undefined,
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "absolute", left: 14, right: 14, top: 14, height: panel, borderRadius: 22, overflow: "hidden", background: hexA(color, 0.12) }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${hexA(color, 0.22)} 1.6px, transparent 1.6px)`, backgroundSize: "22px 22px" }} />
        {top}
      </div>
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
    <div style={{ width, height: inner * (SCREEN_H / SCREEN_W) + bezel * 2, padding: bezel, borderRadius: 40, background: "#1B1C20", boxShadow: "inset 0 0 0 2px #3A3B41, 0 24px 60px rgba(28,43,75,0.28)", boxSizing: "border-box" }}>
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
  <div style={{ position: "absolute", top: 26, right: 30 }}>
    <Appear at={at} dy={-6} blur={4}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: C.navy, color: "#fff", fontFamily: FONT, fontSize: 20, fontWeight: 600 }}>
        {`${rate}x`}
        <svg width="22" height="14" viewBox="0 0 22 14"><path d="M0 0l10 7-10 7zM11 0l10 7-10 7z" fill="#fff" /></svg>
      </div>
    </Appear>
  </div>
);

export const Chip: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean }> = ({ color, children, style, solid }) => (
  <div style={{ padding: "10px 14px", borderRadius: 12, background: solid ? color : hexA(color, 0.1), boxShadow: solid ? `0 8px 20px ${hexA(color, 0.3)}` : `inset 0 0 0 1px ${hexA(color, 0.25)}`, color: solid ? "#fff" : C.text, fontFamily: FONT, fontSize: 16, lineHeight: 1.35, fontWeight: solid ? 600 : 400, ...style }}>
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

// ---- line icons (24x24) ----
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
export const Icon: React.FC<{ name: string; size?: number; color?: string; width?: number }> = ({ name, size = 24, color = "#fff", width = 1.9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d={P[name]} />
  </svg>
);
