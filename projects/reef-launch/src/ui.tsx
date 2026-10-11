import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const C = {
  maroon: "#8C1D40",
  maroonDark: "#6E1733",
  gold: "#FFC627",
  goldTint: "#FFF6DF",
  maroonTint: "#F1E4E8",
  ink: "#191919",
  gray2: "#484848",
  gray3: "#747474",
  muted: "#BFBFBF",
  line: "#E8E8E8",
  panel: "#FBFBFD",
  app: "#F5F5F7",
  hairline: "rgba(0,0,0,0.07)",
  hairlineStrong: "rgba(0,0,0,0.14)",
};
export const HEAD = "Poppins, Inter, sans-serif";
export const UI = "Inter, Arial, sans-serif";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
// 0..1 progress between two frames, eased.
export const ramp = (f: number, a: number, b: number, ease = easeOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// The "screen" the story plays in: a rounded 16:9 frame on the white page, captions go underneath.
export const SCREEN = { x: 240, y: 48, w: 1440, h: 810 };

export const Shell: React.FC<{ opacity: number; scale: number; children: React.ReactNode }> = ({ opacity, scale, children }) => (
  <div
    style={{
      position: "absolute", left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h,
      borderRadius: 28, overflow: "hidden", opacity, transform: `scale(${scale})`,
      boxShadow: "0 30px 80px rgba(25,25,25,0.12), 0 0 0 1px rgba(0,0,0,0.06)", background: "#dfe3ea",
    }}
  >
    {children}
  </div>
);

export const Wallpaper: React.FC<{ zoom?: number }> = ({ zoom = 1 }) => (
  <AbsoluteFill>
    <Img src={staticFile("wallpaper.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
  </AbsoluteFill>
);

export const MenuBar: React.FC<{ clock: string }> = ({ clock }) => (
  <div
    style={{
      position: "absolute", left: 0, right: 0, top: 0, height: 34, display: "flex", alignItems: "center",
      padding: "0 18px", gap: 22, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)",
      fontFamily: UI, fontSize: 15, color: C.ink,
    }}
  >
    <span style={{ fontWeight: 700 }}>Files</span>
    <span>File</span><span>Edit</span><span>View</span><span>Window</span>
    <span style={{ marginLeft: "auto", fontWeight: 500 }}>{clock}</span>
  </div>
);

const DOCK = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9", "#F97316", "#64748B"];
export const Dock: React.FC = () => (
  <div
    style={{
      position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10,
      padding: 9, borderRadius: 22, background: "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
    }}
  >
    {DOCK.map((c, i) => (
      <div key={i} style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(160deg, ${c}, ${c}cc)` }} />
    ))}
  </div>
);

export const Lights: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
      <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
    ))}
  </div>
);

export const Win: React.FC<{
  x: number; y: number; w: number; h: number; title?: string; style?: React.CSSProperties; bar?: React.ReactNode; children?: React.ReactNode;
}> = ({ x, y, w, h, title, style, bar, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, overflow: "hidden", background: "#fff",
      boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", ...style,
    }}
  >
    <div style={{ height: 48, flex: "0 0 48px", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", background: C.panel, borderBottom: `1px solid ${C.hairline}` }}>
      <Lights />
      {bar ?? <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 16, color: C.ink }}>{title}</span>}
    </div>
    <div style={{ position: "relative", flex: 1 }}>{children}</div>
  </div>
);

export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={30} height={30} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0" }}>
    <path d="M3 2 L3 19 L7.5 15 L10.5 21.5 L13.3 20.3 L10.4 13.9 L16.5 13.9 Z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const PdfIcon: React.FC<{ size?: number; tag?: string; color?: string }> = ({ size = 64, tag = "PDF", color = "#D93025" }) => (
  <div style={{ position: "relative", width: size * 0.78, height: size, borderRadius: 6, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}>
    {[0.28, 0.4, 0.52].map((t) => (
      <div key={t} style={{ position: "absolute", left: "16%", right: "16%", top: `${t * 100}%`, height: 2, background: "#E1E1E1" }} />
    ))}
    <div style={{ position: "absolute", left: "10%", bottom: "12%", padding: "1px 4px", borderRadius: 3, background: color, color: "#fff", fontFamily: UI, fontWeight: 700, fontSize: size * 0.15 }}>{tag}</div>
  </div>
);

// Captions: words land one by one (grey, then ink), then a gold highlighter sweeps under the key phrase.
export const Caption: React.FC<{ text: string; hl: string; start: number; end: number }> = ({ text, hl, start, end }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const hw = hl.split(" ").filter(Boolean);
  let hs = -1;
  for (let i = 0; i + hw.length <= words.length; i++) {
    if (hw.length && hw.every((w, j) => words[i + j] === w)) { hs = i; break; }
  }
  const GAP = 4;
  const at = (i: number) => start + i * GAP;
  const hlAt = hs < 0 ? 0 : at(hs + hw.length - 1) + 4;
  const sweep = ramp(f, hlAt, hlAt + 9);
  const out = 1 - ramp(f, end - 6, end);
  const word = (w: string, i: number) => {
    const p = ramp(f, at(i) - 2, at(i) + 6);
    const ink = ramp(f, at(i) + 2, at(i) + 9);
    const c = Math.round(lerp(191, 25, ink));
    return (
      <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 10}px)`, color: `rgb(${c},${c},${c})`, marginRight: "0.26em" }}>{w}</span>
    );
  };
  const before = words.slice(0, hs < 0 ? words.length : hs).map((w, i) => word(w, i));
  const mid = hs < 0 ? [] : words.slice(hs, hs + hw.length).map((w, j) => word(w, hs + j));
  const after = hs < 0 ? [] : words.slice(hs + hw.length).map((w, j) => word(w, hs + hw.length + j));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 918, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ fontFamily: HEAD, fontStyle: "italic", fontWeight: 600, fontSize: 46, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {before}
        {mid.length > 0 && (
          <span style={{ position: "relative", display: "inline-block", marginRight: "0.26em" }}>
            <span style={{ position: "absolute", left: -8, right: -2, top: "14%", bottom: "6%", borderRadius: 8, background: "rgba(255,198,39,0.5)", transform: `scaleX(${sweep})`, transformOrigin: "0 50%" }} />
            <span style={{ position: "relative", marginRight: "-0.26em" }}>{mid}</span>
          </span>
        )}
        {after}
      </div>
    </div>
  );
};

export const Lockup: React.FC<{ lead: string; name: string; size: number; f: number; t0?: number }> = ({ lead, name, size, f, t0 = 0 }) => {
  const a = ramp(f, t0, t0 + 10);
  const o = ramp(f, t0 + 6, t0 + 20, backOut);
  const b = ramp(f, t0 + 12, t0 + 24);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: size * 0.16 }}>
      <span style={{ fontFamily: HEAD, fontStyle: "italic", fontWeight: 600, fontSize: size, color: C.ink, letterSpacing: "-0.03em", opacity: a, transform: `translateX(${(1 - a) * -30}px)` }}>{lead}</span>
      <Img src={staticFile("octopus.png")} style={{ height: size * 1.12, transform: `scale(${o}) rotate(${(1 - o) * -20}deg)` }} />
      <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: size, color: C.maroon, letterSpacing: "-0.02em", opacity: b, transform: `translateX(${(1 - b) * 40}px)` }}>{name}</span>
    </div>
  );
};
