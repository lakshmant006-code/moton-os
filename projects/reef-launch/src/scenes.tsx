import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { el } from "./reel";
import { C, Cursor, HEAD, Lockup, PdfIcon, UI, Win, backOut, lerp, ramp } from "./ui";

const fadeIn = (f: number, n = 6) => ramp(f, 0, n);

/* S1: late night, the exam reminders stack up. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S1", "notifs");
  const rows = e.v<{ title: string; body: string }[]>("rows");
  return (
    <AbsoluteFill>
      {rows.map((r, i) => {
        const t0 = e.start + i * 22;
        const p = ramp(f, t0, t0 + 14);
        return (
          <div key={i} style={{
            position: "absolute", right: 18, top: 48 + i * 98, width: 420, padding: "16px 18px", borderRadius: 20,
            background: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex", gap: 14, alignItems: "center", opacity: p, transform: `translateX(${(1 - p) * 460}px)`,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: i ? "#10B981" : C.maroon, flex: "0 0 44px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: UI, fontWeight: 700, fontSize: 15 }}>{i ? "SG" : "181"}</div>
            <div style={{ fontFamily: UI, color: C.ink }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{r.title}</div>
              <div style={{ fontSize: 15, color: C.gray2, marginTop: 2 }}>{r.body}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* S2: a folder of lectures, then a browser that fills with one tab per PDF. */
export const Tabs: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S2", "tabs");
  const files = e.v<{ name: string }[]>("files").map((x) => x.name);
  const folder = e.v("folder");
  const finderOut = ramp(f, 26, 34);
  const browserIn = ramp(f, 26, 40);
  const n = Math.max(0, Math.min(files.length, Math.floor((f - 32) / 6) + 1));
  const tabW = n ? Math.min(230, 1080 / n) : 230;
  const cur = files[Math.max(0, n - 1)];
  const cx = lerp(900, 330, ramp(f, 2, 20));
  const cy = lerp(560, 250, ramp(f, 2, 20));
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f) }}>
      {finderOut < 1 && (
        <Win x={220} y={110} w={1000} h={560} title={folder} style={{ opacity: 1 - finderOut, transform: `scale(${1 - finderOut * 0.05})` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "26px 10px", padding: "34px 30px" }}>
            {files.map((name, i) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ padding: 6, borderRadius: 10, background: i === 0 && f > 16 ? "rgba(0,0,0,0.08)" : "transparent" }}><PdfIcon size={70} /></div>
                <span style={{ fontFamily: UI, fontSize: 14, color: C.ink, padding: "2px 6px", borderRadius: 5, background: i === 0 && f > 16 ? "#2F6FED" : "transparent", ...(i === 0 && f > 16 ? { color: "#fff" } : {}) }}>{name}</span>
              </div>
            ))}
          </div>
          <Cursor x={cx - 220} y={cy - 158} press={f > 18 && f < 24 ? 1 : 0} />
        </Win>
      )}
      {browserIn > 0 && (
        <Win
          x={120} y={70} w={1200} h={660}
          style={{ opacity: browserIn, transform: `scale(${lerp(0.9, 1, browserIn)})` }}
          bar={
            <div style={{ display: "flex", alignItems: "flex-end", height: 48, marginLeft: 6, overflow: "hidden", width: 1090 }}>
              {files.slice(0, n).map((name, i) => {
                const p = ramp(f, 32 + i * 6, 38 + i * 6);
                const active = i === n - 1;
                return (
                  <div key={name} style={{
                    width: tabW * p, flex: "0 0 auto", height: 36, marginRight: 2, borderRadius: "10px 10px 0 0", overflow: "hidden", whiteSpace: "nowrap",
                    background: active ? "#fff" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 8, padding: tabW > 70 ? "0 12px" : "0 6px",
                    fontFamily: UI, fontSize: 14, color: C.ink, boxShadow: active ? "0 0 0 1px rgba(0,0,0,0.06)" : "none",
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: "#D93025", flex: "0 0 14px" }} />
                    {tabW > 90 && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>}
                  </div>
                );
              })}
            </div>
          }
        >
          <AbsoluteFill style={{ background: "#525659", display: "flex", alignItems: "center", paddingTop: 30 }}>
            <div style={{ width: 640, height: 700, background: "#fff", padding: "50px 56px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.ink }}>{cur.replace(".pdf", "")}</div>
              <div style={{ fontFamily: UI, fontSize: 16, color: C.gray3, marginTop: 6 }}>{folder}, Cell Biology</div>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} style={{ height: 10, borderRadius: 5, background: "#E8E8E8", marginTop: i % 4 === 0 ? 30 : 14, width: `${[92, 100, 86, 70, 96, 100, 64, 90, 100, 80, 94, 58, 100, 76][i]}%` }} />
              ))}
            </div>
          </AbsoluteFill>
        </Win>
      )}
    </AbsoluteFill>
  );
};

/* S3: typing flashcards by hand while the clock runs away. */
export const ByHand: React.FC<{ clock: string }> = () => {
  const f = useCurrentFrame();
  const e = el("S3", "card");
  const q = e.v("q");
  const chars = Math.floor(Math.max(0, f - 8) / 2.2);
  const typed = q.slice(0, chars);
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f) }}>
      <Win x={300} y={120} w={840} h={520} title="Flashcards">
        <div style={{ position: "absolute", top: 18, right: 24, fontFamily: UI, fontSize: 16, color: C.gray3 }}>{e.v("count")}</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 64, bottom: 50, borderRadius: 14, background: "#FFFDF6", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ height: 52, borderBottom: "2px solid #F2B8C6" }} />
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 52, borderBottom: "1px solid #CFE0F5" }} />)}
          <div style={{ position: "absolute", left: 30, top: 14, fontFamily: UI, fontSize: 15, fontWeight: 600, color: C.gray3, letterSpacing: "0.04em" }}>FRONT</div>
          <div style={{ position: "absolute", left: 30, right: 30, top: 66, fontFamily: UI, fontSize: 32, lineHeight: "52px", color: C.ink }}>
            {typed}<span style={{ opacity: caret ? 1 : 0, color: C.maroon }}>|</span>
          </div>
        </div>
      </Win>
    </AbsoluteFill>
  );
};

/* S4: a generic chatbot answers, but not from your class. */
export const Chatbot: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S4", "chat");
  const reply = e.v("reply");
  const ask = ramp(f, 4, 14);
  const dots = f > 16 && f < 30;
  const shown = reply.slice(0, Math.max(0, Math.floor((f - 30) * 2.2)));
  const flag = ramp(f, 92, 104, backOut);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f) }}>
      <Win x={330} y={90} w={780} h={600} title="Chat">
        <div style={{ position: "absolute", inset: 0, padding: "28px 30px", display: "flex", flexDirection: "column", gap: 18, fontFamily: UI }}>
          <div style={{ alignSelf: "flex-end", padding: "14px 20px", borderRadius: 20, background: "#2F6FED", color: "#fff", fontSize: 22, opacity: ask, transform: `translateY(${(1 - ask) * 14}px)` }}>{e.v("ask")}</div>
          {dots && (
            <div style={{ alignSelf: "flex-start", display: "flex", gap: 7, padding: "18px 20px", borderRadius: 20, background: "#EFEFF2" }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: "#999", opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 4) / 5)) }} />)}
            </div>
          )}
          {f >= 30 && (
            <div style={{ alignSelf: "flex-start", maxWidth: 560, padding: "16px 20px", borderRadius: 20, background: "#EFEFF2", color: C.ink, fontSize: 22, lineHeight: 1.5 }}>{shown}</div>
          )}
          {flag > 0 && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "#FBEAEA", color: "#C62828", fontWeight: 700, fontSize: 19, transform: `scale(${flag})`, transformOrigin: "0 50%" }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, background: "#C62828", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>!</span>
              {e.v("flag")}
            </div>
          )}
        </div>
      </Win>
    </AbsoluteFill>
  );
};

/* S5: logo reveal on the drop. */
export const Meet: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S5", "lockup");
  const out = ramp(f, 90, 102);
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1 + ramp(f, 20, 90) * 0.04 - out * 0.1})`, opacity: 1 - out }}>
        <Lockup lead={e.v("lead")} name={e.v("name")} size={150} f={f} t0={0} />
      </div>
    </AbsoluteFill>
  );
};

/* S6 and S7 share the Reef window. */
const ReefBar: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 26, width: "100%", fontFamily: UI, fontSize: 15, color: C.gray3 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Img src={staticFile("octopus.png")} style={{ height: 28 }} />
      <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, color: C.maroon, letterSpacing: "-0.02em" }}>Reef</span>
    </div>
    <span>Dashboard</span><span>Summaries</span><span>Tasks</span>
    <span style={{ marginLeft: "auto" }}>Library</span><span>Help</span>
    <span style={{ color: "#4C7A14" }}>● Saved</span>
  </div>
);
const REEF_WIN = { x: 50, y: 52, w: 1340, h: 690 };
const dotGrid: React.CSSProperties = { background: "#FAFAFA", backgroundImage: "radial-gradient(#D6D6D6 1.4px, transparent 1.4px)", backgroundSize: "26px 26px" };

const Toolbar: React.FC = () => (
  <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, padding: "9px 14px", borderRadius: 999, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)" }}>
    {["#2F6FED", "#14B8A6", "#F59E0B", "#22C55E", "#EC4899", "#F97316", "#EF4444", "#9CA3AF"].map((c) => (
      <div key={c} style={{ width: 30, height: 30, borderRadius: 9, background: c }} />
    ))}
  </div>
);

const FileCard: React.FC<{ name: string; meta: string; dark?: boolean; tag?: string }> = ({ name, meta, dark, tag = "PDF" }) => (
  <div style={{ width: 250, borderRadius: 16, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.07)", overflow: "hidden", fontFamily: UI }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px" }}>
      <span style={{ padding: "2px 6px", borderRadius: 4, background: tag === "PDF" ? "#D93025" : "#2F6FED", color: "#fff", fontSize: 11, fontWeight: 700 }}>{tag}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </div>
    <div style={{ height: 150, margin: "0 14px", borderRadius: 8, background: dark ? "#141414" : "#F4F4F6", padding: 14 }}>
      {dark ? (
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginTop: 70 }}>BIO 181<br /><span style={{ fontWeight: 400, fontSize: 14, opacity: 0.8 }}>Cell Biology</span></div>
      ) : (
        Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ height: 7, borderRadius: 4, background: "#DDDDE2", marginTop: 10, width: `${[90, 100, 70, 95, 60, 88, 75][i]}%` }} />)
      )}
    </div>
    <div style={{ padding: "10px 14px 12px", fontSize: 13, color: C.gray3 }}>{meta}</div>
  </div>
);

export const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S6", "canvas");
  const files = e.v<{ name: string; meta: string }[]>("files");
  const spots = [{ x: 90, y: 90 }, { x: 390, y: 60 }, { x: 260, y: 330 }];
  const drop = (i: number) => ramp(f, 8 + i * 13, 24 + i * 13, backOut);
  const note = ramp(f, 50, 62, backOut);
  const wire = ramp(f, 64, 92);
  const node = ramp(f, 58, 72, backOut);
  const last = Math.min(2, Math.floor(Math.max(0, f - 8) / 13));
  const dp = ramp(f, 8 + last * 13, 22 + last * 13);
  const cursor = f < 52 ? { x: lerp(spots[last].x + 200, spots[last].x + 150, dp), y: lerp(-40, spots[last].y + 120, dp) } : { x: 900, y: 360 };
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 8), transform: `scale(${lerp(0.96, 1, fadeIn(f, 10))})` }}>
      <Win {...REEF_WIN} bar={<ReefBar />}>
        <AbsoluteFill style={dotGrid}>
          <svg width={1340} height={640} style={{ position: "absolute", inset: 0 }}>
            {[{ x: 340, y: 210 }, { x: 640, y: 180 }, { x: 510, y: 450 }, { x: 700, y: 560 }].map((p, i) => (
              <path key={i} d={`M ${p.x} ${p.y} C ${p.x + 140} ${p.y}, 780 300, 900 300`} fill="none" stroke={C.maroon} strokeWidth={2.5} strokeDasharray="7 7"
                pathLength={1} style={{ strokeDasharray: `${wire} 1` }} opacity={0.75} />
            ))}
          </svg>
          {files.map((x, i) => {
            const p = drop(i);
            return (
              <div key={x.name} style={{ position: "absolute", left: spots[i].x, top: spots[i].y, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -160}px) rotate(${(1 - p) * -6}deg)` }}>
                <FileCard name={x.name} meta={x.meta} dark={i === 0} tag={x.name.endsWith(".docx") ? "DOC" : "PDF"} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 560, top: 470, width: 220, padding: "16px 18px", borderRadius: 12, background: C.goldTint, border: "1px solid #F5DC94", fontFamily: UI, fontSize: 17, color: C.ink, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", transform: `scale(${note}) rotate(-2deg)`, opacity: Math.min(1, note * 2) }}>
            {e.v("note")}
          </div>
          <div style={{ position: "absolute", left: 900, top: 230, width: 300, borderRadius: 16, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(140,29,64,0.25)", fontFamily: UI, overflow: "hidden", transform: `scale(${node})`, opacity: Math.min(1, node * 2) }}>
            <div style={{ padding: "12px 16px", background: C.maroonTint, fontWeight: 700, fontSize: 15, color: C.maroon }}>Workflow</div>
            <div style={{ padding: "12px 16px", fontSize: 14, color: C.gray3 }}>Wired in: {Math.round(wire * 4)} items</div>
            <div style={{ margin: "0 16px 16px", padding: "10px 0", textAlign: "center", borderRadius: 10, background: C.maroon, color: "#fff", fontWeight: 700, fontSize: 15 }}>+ AI card</div>
          </div>
          <Toolbar />
          <Cursor x={cursor.x} y={cursor.y} />
        </AbsoluteFill>
      </Win>
    </AbsoluteFill>
  );
};

/* S7: real capture of the app writing a study sheet. */
export const Generate: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Win {...REEF_WIN} bar={<ReefBar />}>
        <AbsoluteFill style={{ overflow: "hidden", background: "#fff" }}>
          <OffthreadVideo src={staticFile("canvas-generate.mp4")} muted
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.02 + ramp(f, 0, 114) * 0.06})`, transformOrigin: "40% 60%" }} />
        </AbsoluteFill>
      </Win>
    </AbsoluteFill>
  );
};

/* S8: a flashcard flips to its answer, with the page it came from. */
export const Flashcards: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S8", "flash");
  const flip = ramp(f, 38, 56);
  const chip = ramp(f, 62, 74, backOut);
  const deal = (i: number) => ramp(f, i * 4, 14 + i * 4);
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: 24, background: "#fff", backfaceVisibility: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", padding: "44px 52px", fontFamily: UI };
  return (
    <AbsoluteFill style={{ ...dotGrid, opacity: fadeIn(f, 8) }}>
      {[2, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: 400 + i * 14, top: 150 + i * 14, width: 640, height: 400, borderRadius: 24, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.06)", opacity: deal(i), transform: `translateY(${(1 - deal(i)) * 80}px)` }} />
      ))}
      <div style={{ position: "absolute", left: 400, top: 150, width: 640, height: 400, perspective: 1600, opacity: deal(0), transform: `translateY(${(1 - deal(0)) * 80}px)` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
          <div style={face}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: C.maroon }}>
              <span>QUESTION</span><span style={{ color: C.gray3, letterSpacing: 0, fontWeight: 500 }}>{e.v("count")}</span>
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: C.ink, marginTop: 40 }}>{e.v("q")}</div>
          </div>
          <div style={{ ...face, transform: "rotateY(180deg)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: C.maroon }}>ANSWER</div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 64, color: C.maroon, marginTop: 50, letterSpacing: "-0.02em" }}>{e.v("a")}</div>
            <div style={{ display: "inline-flex", marginTop: 46, padding: "10px 18px", borderRadius: 999, background: C.goldTint, border: "1px solid #F5DC94", fontSize: 19, color: C.ink, transform: `scale(${chip})`, transformOrigin: "0 50%" }}>{e.v("source")}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* S9: the same job, by hand versus with Reef. */
export const Bars: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S9", "bars");
  const rows = e.v<{ label: string; value: string }[]>("rows");
  const grow = [ramp(f, 4, 20), ramp(f, 20, 34)];
  const widths = [1, 0.035];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: fadeIn(f, 8) }}>
        <Img src={staticFile("octopus.png")} style={{ height: 120, transform: `scale(${ramp(f, 0, 14, backOut)})` }} />
      </div>
      <div style={{ position: "absolute", top: 395, left: 0, right: 0, textAlign: "center", fontFamily: UI, fontSize: 22, fontWeight: 600, letterSpacing: "0.04em", color: C.gray3, opacity: fadeIn(f, 10) }}>{e.v("title").toUpperCase()}</div>
      {rows.map((r, i) => (
        <div key={r.label} style={{ position: "absolute", top: 470 + i * 96, left: 360, width: 1200, display: "flex", alignItems: "center", gap: 28, fontFamily: UI, opacity: fadeIn(f - i * 8, 8) }}>
          <span style={{ width: 150, fontSize: 24, color: i ? C.maroon : C.gray3, fontWeight: i ? 700 : 500 }}>{r.label}</span>
          <div style={{ flex: 1, height: 34, borderRadius: 17, background: C.app, overflow: "hidden" }}>
            <div style={{ width: `${Math.max(2.6, widths[i] * 100 * grow[i])}%`, height: "100%", borderRadius: 17, background: i ? C.maroon : C.muted }} />
          </div>
          <span style={{ width: 130, fontSize: 26, fontWeight: 700, color: i ? C.maroon : C.gray3, opacity: ramp(f, 12 + i * 18, 22 + i * 18) }}>{r.value}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* S10: end card. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S10", "end");
  const l = ramp(f, 10, 22);
  const b = ramp(f, 18, 32, backOut);
  const s = ramp(f, 26, 38);
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ transform: `translateY(${interpolate(f, [0, 14], [40, 0], { extrapolateRight: "clamp" })}px)` }}>
        <Lockup lead={e.v("lead")} name={e.v("name")} size={118} f={f + 24} />
      </div>
      <div style={{ marginTop: 34, textAlign: "center", fontFamily: HEAD, fontSize: 38, lineHeight: 1.4, color: C.gray2, opacity: l, transform: `translateY(${(1 - l) * 16}px)` }}>
        <div>{e.v("line1")}</div>
        <div style={{ fontWeight: 700, color: C.ink }}>{e.v("line2")}</div>
      </div>
      <div style={{ marginTop: 44, padding: "20px 44px", borderRadius: 999, background: C.maroon, color: "#fff", fontFamily: HEAD, fontWeight: 600, fontSize: 30, boxShadow: "0 6px 18px rgba(140,29,64,0.3)", transform: `scale(${b})` }}>{e.v("cta")}</div>
      <div style={{ marginTop: 30, fontFamily: UI, fontSize: 22, color: C.gray3, opacity: s }}>{e.v("fine")}</div>
    </AbsoluteFill>
  );
};
