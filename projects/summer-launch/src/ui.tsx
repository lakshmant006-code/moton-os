import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

export const C = {
  blue: "#1900ff",
  blueSoft: "#4d3dff",
  navy: "#212d5c",
  void: "#05070f",
  peri: "#aab3e8",
  ink: "#0b0d17",
  gray: "#6b7280",
  line: "#e5e7eb",
  surface: "#f8f9fa",
  green: "#22c55e",
};
export const HEAD = "'Avant Gothic', Inter, sans-serif";
export const UI = "Inter, Arial, sans-serif";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const ramp = (f: number, a: number, b: number, ease = easeOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Summer's resting brand look: near black navy with slow drifting blobs, grain and a soft vignette. */
export const Void: React.FC<{ f: number; glow?: number }> = ({ f, glow = 1 }) => {
  const d = Math.sin(f * 0.012) * 40;
  const blob = (x: number, y: number, s: number, color: string, o: number): React.CSSProperties => ({
    position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", filter: "blur(110px)", background: color, opacity: o,
  });
  return (
    <AbsoluteFill style={{ background: C.void, overflow: "hidden" }}>
      <div style={blob(-260 + d * 0.4, -320, 1100, "#151c3a", 0.95)} />
      <div style={blob(1180, 260 - d * 0.5, 900, C.blue, 0.2 * glow)} />
      <div style={blob(520 + d * 0.3, 640, 760, C.peri, 0.1 * glow)} />
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 50} /><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" /></filter>
      </svg>
      <div style={{ position: "absolute", inset: 0, filter: "url(#grain)", opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* Frosted glass panel, the product's surface language. */
export const glass = (o = 1): React.CSSProperties => ({
  background: `rgba(255,255,255,${0.94 * o})`,
  border: "1.5px solid rgba(255,255,255,0.7)",
  borderRadius: 22,
  boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(170,179,232,0.15)",
  backdropFilter: "blur(20px)",
});

/* The orb: Summer's helper. A glowing brand blue sphere with a fading trail. */
export const Orb: React.FC<{ trail: { x: number; y: number }[]; x: number; y: number; s: number; o: number }> = ({ trail, x, y, s, o }) => {
  const R = 30 * s;
  return (
    <>
      {trail.map((p, i) => {
        const k = 1 - (i + 1) / (trail.length + 1);
        const r = R * (0.35 + 0.6 * k);
        return <div key={i} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: C.blueSoft, opacity: 0.22 * k * o, filter: "blur(6px)" }} />;
      })}
      <div style={{ position: "absolute", left: x - R * 2.4, top: y - R * 2.4, width: R * 4.8, height: R * 4.8, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,61,255,0.45), transparent 65%)", opacity: o }} />
      <div style={{
        position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%", opacity: o,
        background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #b9b3ff 18%, #4d3dff 48%, #1900ff 75%, #0b0080 100%)",
        boxShadow: "0 0 30px rgba(25,0,255,0.8), 0 0 80px rgba(77,61,255,0.5), inset 0 -6px 14px rgba(0,0,40,0.5)",
      }} />
    </>
  );
};

/* Ripple left behind when the orb taps something. */
export const Ripple: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => {
  if (p <= 0 || p >= 1) return null;
  const r = 20 + 60 * p;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `3px solid rgba(77,61,255,${0.7 * (1 - p)})` }} />;
};

export const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 34 }) => {
  const palette = ["#1900ff", "#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#212d5c"];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: palette[h % palette.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: size * 0.4, flex: `0 0 ${size}px` }}>{initials}</div>
  );
};
