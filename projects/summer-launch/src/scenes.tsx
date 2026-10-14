import React from "react";
import { Img, staticFile } from "remotion";
import { el } from "./reel";
import { Avatar, C, HEAD, UI, backOut, easeInOut, glass, lerp, ramp } from "./ui";

/* Shared layout, in 1920x1080 frame pixels. Main.tsx flies the orb to these same spots. */
export const L = {
  card: { x: 520, w: 880, top: 300, row: 64, pad: 16 },
  pill: { x: 640, w: 640, h: 56 },
  ask: { x: 460, y: 430, w: 1000, h: 180, textX: 500, textY: 452, size: 30 },
  send: { x: 1405, y: 565 },
  deck: { x: 580, y: 250, w: 760, h: 440 },
  cta: { x: 1222, y: 642 },
  logo: { x: 672, y: 220, w: 576, h: 324 },
};
export const rowY = (k: number, top = L.card.top) => top + L.card.pad + L.card.row * k + L.card.row / 2;
export const START_X = L.pill.x + L.pill.w - 70;

let ctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, font: string) => {
  if (typeof document === "undefined") return text.length * 15;
  ctx = ctx ?? document.createElement("canvas").getContext("2d");
  ctx!.font = font;
  return ctx!.measureText(text).width;
};
export const ASK_FONT = `500 ${L.ask.size}px Inter`;

/* ---------------- S1: scattered hours ---------------- */
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export const Scatter: React.FC<{ t: number }> = ({ t }) => {
  const pull = ramp(t, 0.85, 1.35, easeInOut);
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const bx = 240 + rnd(i, 1) * 1440, by = 160 + rnd(i, 2) * 760;
        const wob = t * (0.8 + rnd(i, 3));
        const x = lerp(bx + Math.sin(wob * 2.2 + i) * 90, 960, pull);
        const y = lerp(by + Math.cos(wob * 1.7 + i) * 70, 540, pull);
        const s = 5 + rnd(i, 4) * 7;
        return <div key={i} style={{ position: "absolute", left: x - s, top: y - s, width: s * 2, height: s * 2, borderRadius: "50%", background: i % 3 ? "#fff" : C.peri, opacity: (1 - ramp(t, 1.38, 1.5)) * ramp(t, 0, 0.2) }} />;
      })}
    </>
  );
};

/* ---------------- S2-S4: chips, the queue and the Start pill ---------------- */
type Row = { who: string; task: string; due: string };
const RowView: React.FC<{ r: Row; i: number; w: number; o: number }> = ({ r, i, w, o }) => (
  <div style={{ position: "absolute", left: 0, top: -L.card.row / 2 + 8, width: w, height: L.card.row - 16, display: "flex", alignItems: "center", gap: 18, padding: "0 18px", borderRadius: 14, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)", overflow: "hidden", whiteSpace: "nowrap", fontFamily: UI }}>
    <span style={{ width: 14, fontSize: 20, fontWeight: 600, color: C.gray, opacity: o }}>{i + 1}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, flex: 1 }}>
      <Avatar name={r.who} size={30} />
      <span style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>{r.who}</span>
      <span style={{ fontSize: 20, color: "#374151" }}>{r.task}</span>
      <span style={{ marginLeft: "auto", fontSize: 18, color: C.gray }}>{r.due}</span>
    </div>
  </div>
);

/* The orb settles at the top of the list and five blank bars drop out of it, then stretch into rows. */
export const Queue: React.FC<{ t: number; orbAt: (t: number) => { x: number; y: number } }> = ({ t, orbAt }) => {
  const e = el("S3", "queue");
  const rows = e.v<Row[]>("rows");
  const grow = ramp(t, 4.5, 5.25, easeInOut);
  const content = ramp(t, 5.0, 5.5);
  const dim = 1 - 0.65 * ramp(t, 8.8, 9.2);
  const out = ramp(t, 15.1, 15.3);
  const pillIn = ramp(t, 6.2, 6.7, backOut);
  const pill = el("S4", "pill");
  const tapped = ramp(t, 8.6, 8.75);
  if (t < 3.7 || t > 15.4) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: dim * (1 - out) }}>
      <div style={{ position: "absolute", left: L.card.x - 8, top: L.card.top - 8, width: L.card.w + 16, height: L.card.pad * 2 + L.card.row * 5 + 16, ...glass(0.35), opacity: content }} />
      {rows.map((r, i) => {
        const appear = ramp(t, 3.75 + i * 0.1, 3.95 + i * 0.1, backOut);
        const drop = ramp(t, 3.75 + i * 0.1, 4.3 + i * 0.1);
        const cx = L.card.x + 16, cy = lerp(262, rowY(i), drop);
        const w = lerp(52, L.card.w - 32, grow);
        return (
          <div key={i} style={{ position: "absolute", left: cx, top: cy, transform: `scale(${appear})`, transformOrigin: "26px 0" }}>
            <RowView r={r} i={i} w={w} o={content} />
          </div>
        );
      })}
      {t > 6.2 && (
        <div style={{ position: "absolute", left: L.pill.x, top: rowY(5) + 24, width: L.pill.w, height: L.pill.h, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 24px", fontFamily: UI, fontSize: 20, color: C.ink, transform: `scale(${pillIn})`, boxShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 0 ${2 + tapped * 2}px rgba(25,0,255,${0.15 + 0.6 * tapped * (1 - ramp(t, 9, 9.3))})` }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, border: `2.5px solid ${C.gray}` }} />
          {pill.v("text")}
          <span style={{ marginLeft: "auto", fontWeight: 600, color: tapped > 0.5 ? C.blue : C.ink }}>{pill.v("cta")} ›</span>
        </div>
      )}
    </div>
  );
};

/* ---------------- S5: ask Summer ---------------- */
export const Ask: React.FC<{ t: number }> = ({ t }) => {
  const e = el("S5", "ask");
  const first = e.v("first"), from = e.v("from"), to = e.v("to");
  const stem = first.slice(0, first.length - from.length);
  const rise = ramp(t, 9.0, 9.5, backOut);
  const out = ramp(t, 14.85, 15.24, easeInOut);
  if (t < 9 || t > 15.3) return null;
  let text: React.ReactNode;
  const typed = Math.floor(Math.max(0, t - 9.5) * 18);
  const sel = ramp(t, 12.3, 12.75);
  if (t < 12.3) text = <>{first.slice(0, typed)}</>;
  else if (t < 12.95) text = <>{stem}<span style={{ background: `rgba(25,0,255,${0.18 * sel})`, borderRadius: 6 }}>{from}</span></>;
  else {
    const n = Math.floor(Math.max(0, t - 13.1) * 11);
    text = <>{stem}<span style={{ background: "rgba(25,0,255,0.14)", color: C.blue, borderRadius: 6, padding: "0 2px" }}>{to.slice(0, n)}</span></>;
  }
  const caret = Math.floor(t * 3) % 2 === 0 && t < 14.4;
  const sent = ramp(t, 14.6, 14.75);
  const a = L.ask;
  return (
    <div style={{ position: "absolute", left: a.x, top: a.y, width: a.w, height: a.h, ...glass(1), padding: "22px 40px", fontFamily: UI, opacity: rise * (1 - out), transform: `translateY(${(1 - rise) * 60}px) scale(${1 - out * 0.4})` }}>
      <div style={{ fontSize: a.size, fontWeight: 500, color: C.ink, whiteSpace: "nowrap" }}>{text}<span style={{ opacity: caret ? 1 : 0, color: C.blue }}>|</span></div>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 22, display: "flex", alignItems: "center", gap: 18, fontSize: 18, color: C.gray }}>
        <span style={{ fontSize: 26 }}>+</span><span style={{ padding: "4px 10px", borderRadius: 8, background: "#f3f4f6" }}>⌘K</span>
        <span style={{ marginLeft: "auto" }}>All projects ▾</span>
        <span style={{ width: 46, height: 46, borderRadius: 23, background: C.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, transform: `scale(${1 - 0.12 * Math.sin(Math.PI * sent)})` }}>↑</span>
      </div>
    </div>
  );
};
export const wordX = () => {
  const e = el("S5", "ask");
  const first = e.v("first"), from = e.v("from"), to = e.v("to");
  const stem = first.slice(0, first.length - from.length);
  const base = L.ask.x + 40 + measure(stem, ASK_FONT);
  return { from: base + measure(from, ASK_FONT) / 2, to: base + measure(to, ASK_FONT) / 2 };
};

/* ---------------- S6: the swarm ---------------- */
const KEEP = ["Acme Steel Corp", "Desert Ridge Office Park", "Riverside Apartments, Phase 2"];
export const Swarm: React.FC<{ t: number }> = ({ t }) => {
  const chips = el("S6", "swarm").v<{ name: string }[]>("chips").map((c) => c.name);
  if (t < 15.24 || t > 19.9) return null;
  const burst = ramp(t, 15.24, 15.9, backOut);
  const sort = ramp(t, 18.2, 19.1, easeInOut);
  return (
    <>
      {chips.map((name, i) => {
        const keep = KEEP.indexOf(name);
        const th = (i / chips.length) * Math.PI * 2 + (t - 15.24) * (0.75 + 0.15 * (i % 3));
        const z = Math.sin(th);
        const ox = 960 + Math.cos(th) * 600 * burst, oy = 520 + z * 250 * burst + Math.sin(t * 2 + i) * 12;
        const s = (0.72 + 0.38 * (z + 1) / 2) * burst;
        const tx = keep >= 0 ? L.card.x + 16 : 960, ty = keep >= 0 ? rowY(keep, 330) : 520;
        const x = lerp(ox, tx, sort), y = lerp(oy, ty, sort);
        const o = keep >= 0 ? 1 : 1 - ramp(t, 18.2, 18.8);
        return (
          <div key={name} style={{ position: "absolute", left: x, top: y, transform: `translate(${keep >= 0 ? 0 : -50}%, -50%) scale(${keep >= 0 ? lerp(s, 1, sort) : s * (1 - sort * 0.6)})`, transformOrigin: keep >= 0 ? "0 50%" : "50% 50%", opacity: o * (0.55 + 0.45 * (z + 1) / 2 * (1 - sort) + sort), zIndex: Math.round((z + 1) * 10) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px 10px 10px", borderRadius: 999, background: "#fff", boxShadow: "0 10px 26px rgba(0,0,0,0.35)", fontFamily: UI, fontSize: 20, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
              <Avatar name={name} size={30} />{name}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------------- S7: ranked ---------------- */
export const Ranked: React.FC<{ t: number }> = ({ t }) => {
  const rows = el("S7", "ranked").v<Row[]>("rows");
  if (t < 19.05 || t > 21.6) return null;
  const grow = ramp(t, 19.3, 19.95, easeInOut);
  const content = ramp(t, 19.7, 20.1);
  const pillIn = ramp(t, 19.9, 20.3, backOut);
  const tapped = ramp(t, 21.2, 21.32);
  const out = ramp(t, 21.35, 21.5);
  const top = 330;
  const pill = el("S4", "pill");
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: L.card.x - 8, top: top - 8, width: L.card.w + 16, height: L.card.pad * 2 + L.card.row * 3 + 16, ...glass(0.35), opacity: content }} />
      {rows.map((r, i) => (
        <div key={i} style={{ position: "absolute", left: L.card.x + 16, top: rowY(i, top), opacity: ramp(t, 19.05, 19.3) }}>
          <RowView r={r} i={i} w={lerp(300, L.card.w - 32, grow)} o={content} />
        </div>
      ))}
      <div style={{ position: "absolute", left: L.pill.x, top: rowY(3, top) + 24, width: L.pill.w, height: L.pill.h, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 24px", fontFamily: UI, fontSize: 20, color: C.ink, transform: `scale(${pillIn})`, boxShadow: `0 10px 30px rgba(0,0,0,0.35), 0 0 0 ${2 + tapped * 2}px rgba(25,0,255,${0.15 + 0.6 * tapped})` }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, border: `2.5px solid ${C.gray}` }} />
        {pill.v("text")}
        <span style={{ marginLeft: "auto", fontWeight: 600, color: tapped > 0.5 ? C.blue : C.ink }}>{pill.v("cta")} ›</span>
      </div>
    </div>
  );
};

/* ---------------- S8: action cards ---------------- */
type Card = { who: string; ref: string; title: string; source: string; body: string; cta: string };
export const CARD_T0 = 21.5, CARD_LEN = 2.175, TAP_AT = 1.35;
export const Cards: React.FC<{ t: number }> = ({ t }) => {
  const cards = el("S8", "cards").v<Card[]>("cards");
  if (t < CARD_T0 || t > 28.2) return null;
  const d = L.deck;
  return (
    <>
      {[2, 1].map((g) => (
        <div key={g} style={{ position: "absolute", left: d.x + g * 18, top: d.y + g * 18, width: d.w, height: d.h, ...glass(0.25 + 0.15 * (2 - g)), opacity: (1 - ramp(t, 27.5 - (2 - g) * 2.175, 27.9 - (2 - g) * 2.175)) * ramp(t, CARD_T0, CARD_T0 + 0.3) }} />
      ))}
      {cards.map((c, i) => {
        const t0 = CARD_T0 + i * CARD_LEN;
        if (t < t0 - 0.05 || t > t0 + CARD_LEN + 0.1) return null;
        const inP = ramp(t, t0, t0 + 0.4);
        const tap = ramp(t, t0 + TAP_AT, t0 + TAP_AT + 0.12);
        const fly = ramp(t, t0 + 1.8, t0 + 2.17, easeInOut);
        return (
          <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.w, height: d.h, ...glass(1), padding: "30px 36px", fontFamily: UI, zIndex: 5,
            opacity: Math.min(inP * 1.5, 1) * (1 - fly), transform: `translate(${(1 - inP) * 160 - fly * 700}px, ${-fly * 120}px) rotate(${-fly * 10}deg) scale(${lerp(0.94, 1, inP)})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: C.gray }}>
              <Avatar name={c.who} size={30} /><span style={{ fontWeight: 700, color: C.ink }}>{c.who}</span><span>{c.ref}</span>
              <span style={{ marginLeft: "auto" }}>{i + 1} of 3</span>
            </div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, lineHeight: 1.22, color: C.ink, marginTop: 22, letterSpacing: "-0.015em" }}>{c.title}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, padding: "6px 12px", borderRadius: 999, background: "#eef0ff", color: C.blue, fontSize: 16, fontWeight: 600 }}>● {c.source}</div>
            <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 14, background: C.surface, border: `1px solid ${C.line}`, fontSize: 19, color: "#374151", lineHeight: 1.45 }}>{c.body}</div>
            <div style={{ position: "absolute", left: 36, right: 36, bottom: 26, display: "flex", alignItems: "center", gap: 20, fontSize: 18, color: C.gray }}>
              <span>+ Ask about this…</span>
              <span style={{ marginLeft: "auto" }}>Skip</span>
              <span style={{ minWidth: 190, height: 50, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 19,
                background: tap > 0 ? C.blue : C.ink, color: "#fff", transform: `scale(${1 - 0.08 * Math.sin(Math.PI * tap)})` }}>{tap >= 1 ? "✓" : c.cta}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ---------------- S9: week closed ---------------- */
export const Done: React.FC<{ t: number }> = ({ t }) => {
  if (t < 28.0 || t > 30.4) return null;
  const pop = ramp(t, 28.05, 28.4, backOut);
  const shrink = ramp(t, 30.0, 30.3, easeInOut);
  const burst = ramp(t, 28.12, 29.3);
  const text = el("S9", "done").v("text");
  return (
    <>
      {Array.from({ length: 64 }).map((_, i) => {
        const a = (i / 64) * Math.PI * 2 + rnd(i, 7) * 0.3;
        const r = 120 + burst * (260 + rnd(i, 8) * 320);
        return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r, top: 520 + Math.sin(a) * r * 0.75, width: 7, height: 7, borderRadius: 4, background: [C.peri, "#fff", C.blueSoft][i % 3], opacity: (1 - burst) * ramp(t, 28.12, 28.2) }} />;
      })}
      <div style={{ position: "absolute", left: 960 - 200, top: 520 - 80, width: 400, height: 160, borderRadius: 26, background: C.blue, boxShadow: "0 0 80px rgba(25,0,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", fontFamily: HEAD, fontWeight: 600, fontSize: 46, transform: `scale(${pop * (1 - shrink * 0.9)})`, opacity: 1 - shrink }}>
        <span style={{ fontFamily: UI, fontSize: 40 }}>✓</span>{text}
      </div>
    </>
  );
};

/* ---------------- S10: ring of goals ---------------- */
const GOAL_POS = [{ x: 470, y: 300, at: 30.75 }, { x: 1300, y: 260, at: 31.3 }, { x: 420, y: 760, at: 31.825 }, { x: 1290, y: 800, at: 32.15 }];
export const Ring: React.FC<{ t: number }> = ({ t }) => {
  if (t < 30.0 || t > 32.7) return null;
  const goals = el("S10", "ring").v<{ name: string }[]>("goals").map((g) => g.name);
  const zoom = lerp(0.25, 3.4, ramp(t, 30.1, 32.4, (x) => x * x * (3 - 2 * x)));
  const rot = (t - 30.1) * 14;
  const hole = ramp(t, 32.05, 32.5, easeInOut);
  const fills = ["#1900ff", "#2a22ff", "#3a33d6", "#212d5c", "#4d3dff", "#1d2a7a", "#5b52ff", "#2a3366"];
  const rings = [90, 170, 260, 360, 470];
  const arcs: React.ReactNode[] = [];
  rings.forEach((r, ri) => {
    const r0 = ri ? rings[ri - 1] + 6 : 40;
    const n = 5 + ri;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2 + ri * 0.4, a1 = ((k + 1) / n) * Math.PI * 2 + ri * 0.4 - 0.03;
      const p = (rr: number, a: number) => `${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
      arcs.push(<path key={`${ri}-${k}`} d={`M ${p(r0, a0)} L ${p(r, a0)} A ${r} ${r} 0 0 1 ${p(r, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`} fill={fills[(k + ri * 3) % fills.length]} opacity={0.55 + 0.4 * (((k + ri) % 3) / 2)} />);
    }
  });
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ramp(t, 30.1, 30.3) }}>
        <g transform={`translate(960 540) scale(${zoom}) rotate(${rot})`}>{arcs}<circle r={34 + hole * 600} fill={C.void} /></g>
      </svg>
      {goals.map((g, i) => {
        const p = GOAL_POS[i];
        const pop = ramp(t, p.at, p.at + 0.2, backOut);
        return (
          <div key={g} style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${pop})`, opacity: 1 - hole, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 999, background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", fontFamily: UI, fontSize: 24, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
            {g}<span style={{ width: 30, height: 30, borderRadius: 15, background: C.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</span>
          </div>
        );
      })}
    </>
  );
};

/* ---------------- S11: one line draws the arch, then the lockup ---------------- */
// Arch geometry from brand/logo-dark.png (288x162): a 143.5px radius half disc on a 12px base, shown here at 2x.
const A = { x0: L.logo.x, x1: L.logo.x + 574, base: L.logo.y + 310, cy: L.logo.y + 287, r: 287 };
const ARCH = `M ${A.x0} ${A.base} L ${A.x0} ${A.cy} A ${A.r} ${A.r} 0 0 1 ${A.x1} ${A.cy} L ${A.x1} ${A.base} Z`;
export const archPoint = (p: number) => {
  // walk the outline: left side up, arc over, right side down, base back
  const seg = [A.base - A.cy, Math.PI * A.r, A.base - A.cy, A.x1 - A.x0];
  const total = seg.reduce((a, b) => a + b, 0);
  let d = p * total;
  if (d <= seg[0]) return { x: A.x0, y: A.base - d };
  d -= seg[0];
  if (d <= seg[1]) { const a = Math.PI - d / A.r; return { x: (A.x0 + A.x1) / 2 + Math.cos(a) * A.r, y: A.cy - Math.sin(a) * A.r }; }
  d -= seg[1];
  if (d <= seg[2]) return { x: A.x1, y: A.cy + d };
  d -= seg[2];
  return { x: A.x1 - d, y: A.base };
};
export const DRAW = { t0: 32.9, t1: 35.45, fill: 35.675 };
export const Lockup: React.FC<{ t: number }> = ({ t }) => {
  if (t < 32.4) return null;
  const e = el("S11", "lockup");
  const draw = ramp(t, DRAW.t0, DRAW.t1, easeInOut);
  const fill = ramp(t, DRAW.fill, DRAW.fill + 0.25);
  const png = ramp(t, DRAW.fill + 0.15, DRAW.fill + 0.5);
  const tip = archPoint(draw);
  const line = ramp(t, 36.3, 36.8), badge = ramp(t, 36.8, 37.3, backOut), cta = ramp(t, 37.2, 37.6, backOut);
  const out = ramp(t, 39.35, 39.95);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={ARCH} fill="#fff" fillOpacity={fill * (1 - png)} stroke="#fff" strokeWidth={3} pathLength={1} style={{ strokeDasharray: `${draw} 1`, strokeLinejoin: "round" }} opacity={1 - png} />
      </svg>
      {draw > 0 && draw < 1 && <div style={{ position: "absolute", left: tip.x - 9, top: tip.y - 9, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 0 18px rgba(170,179,232,0.9)" }} />}
      <Img src={staticFile("logo.png")} style={{ position: "absolute", left: L.logo.x, top: L.logo.y, width: L.logo.w, height: L.logo.h, opacity: png, transform: `scale(${1 + 0.03 * Math.sin(Math.PI * ramp(t, DRAW.fill, DRAW.fill + 0.5))})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 56, color: "#fff", opacity: line, transform: `translateY(${(1 - line) * 16}px)`, letterSpacing: "-0.01em" }}>{e.v("line")}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", gap: 22, alignItems: "center" }}>
        <span style={{ padding: "12px 22px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", fontFamily: UI, fontWeight: 600, fontSize: 24, transform: `scale(${badge})` }}>{e.v("badge")}</span>
        <span style={{ padding: "16px 34px", borderRadius: 14, background: C.blue, color: "#fff", fontFamily: HEAD, fontWeight: 600, fontSize: 30, boxShadow: "0 0 40px rgba(25,0,255,0.6)", transform: `scale(${cta})` }}>{e.v("cta")}</span>
      </div>
    </div>
  );
};
