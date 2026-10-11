import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { el } from "./reel";
import { BODY, C, Cursor, HEAD, Lockup, PdfIcon, UI, Win, backOut, lerp, ramp } from "./ui";

const fadeIn = (f: number, n = 6) => ramp(f, 0, n);

/* S1: late night, the exam reminders stack up. Main pushes the camera in on them. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S1", "notifs");
  const rows = e.v<{ title: string; body: string }[]>("rows");
  return (
    <AbsoluteFill>
      {rows.map((r, i) => {
        const t0 = e.start + i * 16;
        const p = ramp(f, t0, t0 + 12);
        return (
          <div key={i} style={{
            position: "absolute", right: 22, top: 50 + i * 112, width: 500, padding: "18px 20px", borderRadius: 22,
            background: "rgba(255,255,255,0.86)", backdropFilter: "blur(24px)", boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
            display: "flex", gap: 16, alignItems: "center", opacity: p, transform: `translateX(${(1 - p) * 540}px)`,
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: i ? "#10B981" : C.maroon, flex: "0 0 52px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: UI, fontWeight: 700, fontSize: 17 }}>{i ? "SG" : "181"}</div>
            <div style={{ fontFamily: UI, color: C.ink }}>
              <div style={{ fontWeight: 700, fontSize: 21 }}>{r.title}</div>
              <div style={{ fontSize: 18, color: C.gray2, marginTop: 3 }}>{r.body}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* S2: a folder of lectures, then a browser that fills with one tab per PDF. Main punches in on the tab strip. */
export const Tabs: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S2", "tabs");
  const files = e.v<{ name: string }[]>("files").map((x) => x.name);
  const folder = e.v("folder");
  const OPEN = 34;
  const finderOut = ramp(f, OPEN, OPEN + 8);
  const browserIn = ramp(f, OPEN, OPEN + 12);
  const T0 = OPEN + 4;
  const n = Math.max(0, Math.min(files.length, Math.floor((f - T0) / 5.5) + 1));
  const tabW = n ? Math.min(230, 1080 / n) : 230;
  const cur = files[Math.max(0, n - 1)];
  const cx = lerp(900, 330, ramp(f, 2, 22));
  const cy = lerp(560, 250, ramp(f, 2, 22));
  const sel = f > 24;
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 4) }}>
      {finderOut < 1 && (
        <Win x={220} y={110} w={1000} h={560} title={folder} style={{ opacity: 1 - finderOut, transform: `scale(${1 - finderOut * 0.05})` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "30px 10px", padding: "34px 26px" }}>
            {files.map((name, i) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ padding: 6, borderRadius: 10, background: i === 0 && sel ? "rgba(0,0,0,0.08)" : "transparent" }}><PdfIcon size={92} /></div>
                <span style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, color: i === 0 && sel ? "#fff" : C.ink, padding: "2px 7px", borderRadius: 5, background: i === 0 && sel ? "#2F6FED" : "transparent" }}>{name}</span>
              </div>
            ))}
          </div>
          <Cursor x={cx - 220} y={cy - 158} press={f > 24 && f < 30 ? 1 : 0} />
        </Win>
      )}
      {browserIn > 0 && (
        <Win
          x={120} y={70} w={1200} h={660}
          style={{ opacity: browserIn, transform: `scale(${lerp(0.9, 1, browserIn)})` }}
          bar={
            <div style={{ display: "flex", alignItems: "flex-end", height: 48, marginLeft: 6, overflow: "hidden", width: 1090 }}>
              {files.slice(0, n).map((name, i) => {
                const p = ramp(f, T0 + i * 5.5, T0 + 5 + i * 5.5);
                const active = i === n - 1;
                return (
                  <div key={name} style={{
                    width: tabW * p, flex: "0 0 auto", height: 38, marginRight: 2, borderRadius: "10px 10px 0 0", overflow: "hidden", whiteSpace: "nowrap",
                    background: active ? "#fff" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 8, padding: tabW > 70 ? "0 12px" : "0 6px",
                    fontFamily: UI, fontSize: 15, fontWeight: 500, color: C.ink, boxShadow: active ? "0 0 0 1px rgba(0,0,0,0.06)" : "none",
                  }}>
                    <div style={{ width: 15, height: 15, borderRadius: 3, background: "#D93025", flex: "0 0 15px" }} />
                    {tabW > 90 && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>}
                  </div>
                );
              })}
            </div>
          }
        >
          <AbsoluteFill style={{ background: "#E9E9EC", display: "flex", alignItems: "center", paddingTop: 30 }}>
            <div style={{ width: 760, height: 700, background: "#fff", padding: "50px 60px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.ink }}>{cur.replace(".pdf", "")}</div>
              <div style={{ fontFamily: UI, fontSize: 18, color: C.gray3, marginTop: 6 }}>{folder}, Cell Biology</div>
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

/* S3: typing flashcards by hand while a big clock runs away. */
export const ByHand: React.FC<{ clock: string }> = ({ clock }) => {
  const f = useCurrentFrame();
  const e = el("S3", "card");
  const q = e.v("q");
  const chars = Math.floor(Math.max(0, f - 6) / 1.9);
  const typed = q.slice(0, chars);
  const caret = Math.floor(f / 8) % 2 === 0;
  const time = clock.replace(/^\w+\s/, "");
  const late = ramp(f, 30, 90);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 4) }}>
      <Win x={260} y={110} w={920} h={540} title="Flashcards">
        <div style={{ position: "absolute", top: 14, right: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 18, color: C.gray3 }}>{e.v("count")}</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999,
            background: `rgb(${Math.round(lerp(25, 198, late))},${Math.round(lerp(25, 40, late))},${Math.round(lerp(25, 40, late))})`,
            color: "#fff", fontFamily: UI, fontWeight: 700, fontSize: 30, fontVariantNumeric: "tabular-nums",
          }}>
            <svg width={26} height={26} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" strokeWidth="2.2" /><path d="M12 6.5 V12 L15.5 14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
            {time}
          </span>
        </div>
        <div style={{ position: "absolute", left: 56, right: 56, top: 84, bottom: 44, borderRadius: 14, background: "#FFFDF6", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ height: 56, borderBottom: "2px solid #F2B8C6" }} />
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 56, borderBottom: "1px solid #CFE0F5" }} />)}
          <div style={{ position: "absolute", left: 30, top: 16, fontFamily: UI, fontSize: 16, fontWeight: 600, color: C.gray3, letterSpacing: "0.04em" }}>FRONT</div>
          <div style={{ position: "absolute", left: 30, right: 30, top: 66, fontFamily: UI, fontSize: 38, lineHeight: "56px", color: C.ink }}>
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
  const ask = ramp(f, 2, 10);
  const dots = f > 12 && f < 24;
  const shown = reply.slice(0, Math.max(0, Math.floor((f - 24) * 3.2)));
  const flag = ramp(f, 58, 68, backOut);
  return (
    <AbsoluteFill style={{ opacity: fadeIn(f, 4) }}>
      <Win x={350} y={110} w={740} h={480} title="Chat">
        <div style={{ position: "absolute", inset: 0, padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18, fontFamily: UI }}>
          <div style={{ alignSelf: "flex-end", padding: "14px 22px", borderRadius: 22, background: "#2F6FED", color: "#fff", fontSize: 27, opacity: ask, transform: `translateY(${(1 - ask) * 14}px)` }}>{e.v("ask")}</div>
          {dots && (
            <div style={{ alignSelf: "flex-start", display: "flex", gap: 8, padding: "20px 22px", borderRadius: 22, background: "#EFEFF2" }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: "#999", opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 4) / 5)) }} />)}
            </div>
          )}
          {f >= 24 && (
            <div style={{ alignSelf: "flex-start", maxWidth: 600, padding: "16px 22px", borderRadius: 22, background: "#EFEFF2", color: C.ink, fontSize: 27, lineHeight: 1.45 }}>{shown}</div>
          )}
          {flag > 0 && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 999, background: "#FBEAEA", color: "#C62828", fontWeight: 700, fontSize: 25, transform: `scale(${flag})`, transformOrigin: "0 50%" }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: "#C62828", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>!</span>
              {e.v("flag")}
            </div>
          )}
        </div>
      </Win>
    </AbsoluteFill>
  );
};

/* S5: logo reveal. The octopus finishes popping on the drop (15.24s, frame 16 of this scene). */
export const Meet: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S5", "lockup");
  const bump = Math.max(0, 1 - Math.abs(f - 33) / 5) * 0.03; // small nod on the next beat
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1 + ramp(f, 16, 88) * 0.05 + bump})` }}>
        <Lockup lead={e.v("lead")} name={e.v("name")} size={160} f={f} at={{ a: [0, 5], o: [8, 17], b: [14, 22] }} />
      </div>
    </AbsoluteFill>
  );
};

/* S6, S7 and S9 share the Reef window. */
const ReefBar: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 26, width: "100%", fontFamily: BODY, fontSize: 16, color: C.gray3 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <Img src={staticFile("octopus.png")} style={{ height: 30 }} />
      <span style={{ fontFamily: HEAD, fontSize: 27, color: C.ink, letterSpacing: "-0.01em" }}>reef</span>
      <span style={{ fontFamily: HEAD, fontSize: 14, color: C.maroon }}>beta</span>
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
  <div style={{ width: 280, borderRadius: 16, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.07)", overflow: "hidden", fontFamily: BODY }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px" }}>
      <span style={{ padding: "2px 6px", borderRadius: 4, background: tag === "PDF" ? "#D93025" : "#2F6FED", color: "#fff", fontSize: 12, fontWeight: 700 }}>{tag}</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </div>
    <div style={{ height: 160, margin: "0 14px", borderRadius: 8, background: dark ? "#141414" : "#F4F4F6", padding: 14 }}>
      {dark ? (
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginTop: 76 }}>BIO 181<br /><span style={{ fontWeight: 400, fontSize: 15, opacity: 0.8 }}>Cell Biology</span></div>
      ) : (
        Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ height: 7, borderRadius: 4, background: "#DDDDE2", marginTop: 11, width: `${[90, 100, 70, 95, 60, 88, 75][i]}%` }} />)
      )}
    </div>
    <div style={{ padding: "10px 14px 12px", fontSize: 14, color: C.gray3 }}>{meta}</div>
  </div>
);

// Drops land on the music hits after the cut: 18.225s, 18.75s and 19.3s (frames 17, 33, 49 of this scene).
const DROP_START = [6, 22, 38];
export const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S6", "canvas");
  const files = e.v<{ name: string; meta: string }[]>("files");
  const spots = [{ x: 70, y: 70 }, { x: 400, y: 40 }, { x: 250, y: 320 }];
  const drop = (i: number) => ramp(f, DROP_START[i], DROP_START[i] + 12, backOut);
  const note = ramp(f, 56, 66, backOut);
  const node = ramp(f, 62, 72, backOut);
  const wire = ramp(f, 66, 92);
  const last = DROP_START.reduce((acc, s, i) => (f >= s - 4 ? i : acc), 0);
  const dp = ramp(f, DROP_START[last] - 4, DROP_START[last] + 10);
  const cursor = f < 54 ? { x: lerp(spots[last].x + 220, spots[last].x + 170, dp), y: lerp(-40, spots[last].y + 130, dp) } : { x: lerp(spots[2].x + 170, 960, ramp(f, 54, 74)), y: lerp(spots[2].y + 130, 380, ramp(f, 54, 74)) };
  return (
    <AbsoluteFill>
      <Win {...REEF_WIN} bar={<ReefBar />}>
        <AbsoluteFill style={dotGrid}>
          <svg width={1340} height={640} style={{ position: "absolute", inset: 0 }}>
            {[{ x: 350, y: 200 }, { x: 680, y: 170 }, { x: 530, y: 460 }, { x: 790, y: 560 }].map((p, i) => (
              <path key={i} d={`M ${p.x} ${p.y} C ${p.x + 120} ${p.y}, 800 300, 930 300`} fill="none" stroke={C.maroon} strokeWidth={3}
                pathLength={1} style={{ strokeDasharray: `${wire} 1` }} opacity={0.8} />
            ))}
          </svg>
          {files.map((x, i) => {
            const p = drop(i);
            return (
              <div key={x.name} style={{ position: "absolute", left: spots[i].x, top: spots[i].y, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -170}px) rotate(${(1 - p) * -6}deg)` }}>
                <FileCard name={x.name} meta={x.meta} dark={i === 0} tag={x.name.endsWith(".docx") ? "DOC" : "PDF"} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 590, top: 470, width: 240, padding: "16px 18px", borderRadius: 12, background: C.goldTint, border: "1px solid #F5DC94", fontFamily: BODY, fontSize: 19, color: C.ink, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", transform: `scale(${note}) rotate(-2deg)`, opacity: Math.min(1, note * 2) }}>
            {e.v("note")}
          </div>
          <div style={{ position: "absolute", left: 930, top: 220, width: 320, borderRadius: 16, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(140,29,64,0.25)", fontFamily: BODY, overflow: "hidden", transform: `scale(${node})`, opacity: Math.min(1, node * 2) }}>
            <div style={{ padding: "13px 18px", background: C.maroonTint, fontWeight: 700, fontSize: 17, color: C.maroon }}>Workflow</div>
            <div style={{ padding: "12px 18px", fontSize: 16, color: C.gray3 }}>Wired in: {Math.round(wire * 4)} items</div>
            <div style={{ margin: "0 18px 18px", padding: "12px 0", textAlign: "center", borderRadius: 10, background: C.maroon, color: "#fff", fontWeight: 700, fontSize: 17 }}>+ AI card</div>
          </div>
          <Toolbar />
          <Cursor x={cursor.x} y={cursor.y} />
        </AbsoluteFill>
      </Win>
    </AbsoluteFill>
  );
};

/* Gold "New" pill that pops onto a shot. Gold background takes ink text, per the brand rules. */
const Badge: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const p = ramp(f, 2, 12, backOut);
  const [tag, ...rest] = text.split(":");
  return (
    <div style={{ position: "absolute", left: 40, top: 36, display: "flex", alignItems: "center", gap: 12, padding: "12px 22px 12px 12px", borderRadius: 999,
      background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", fontFamily: BODY, transform: `scale(${p})`, transformOrigin: "0 50%", opacity: Math.min(1, p * 2) }}>
      <span style={{ padding: "6px 14px", borderRadius: 999, background: C.gold, color: C.ink, fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}>{tag.toUpperCase()}</span>
      <span style={{ fontSize: 26, fontWeight: 600, color: C.ink }}>{rest.join(":").trim()}</span>
    </div>
  );
};

/* Two real shots in the Reef window, hard cut on a beat. Each clip is pre cropped to 16:9. */
const Footage: React.FC<{ shots: { src: string; dur: number; rate?: number; push?: number; origin?: string; badge?: string }[] }> = ({ shots }) => {
  const f = useCurrentFrame();
  let start = 0;
  return (
    <AbsoluteFill>
      <Win {...REEF_WIN} bar={<ReefBar />}>
        <AbsoluteFill style={{ overflow: "hidden", background: "#FAFAFA" }}>
          {shots.map((sh) => {
            const from = start;
            start += sh.dur;
            if (f < from || f >= from + sh.dur) return null;
            return (
              <Sequence key={sh.src} from={from} durationInFrames={sh.dur} layout="none">
                <OffthreadVideo src={staticFile(sh.src)} muted playbackRate={sh.rate ?? 1}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                    transform: `scale(${1 + ramp(f - from, 0, sh.dur, (t) => t) * (sh.push ?? 0.04)})`, transformOrigin: sh.origin ?? "50% 50%" }} />
                {sh.badge && <Badge text={sh.badge} f={f - from} />}
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </Win>
    </AbsoluteFill>
  );
};

/* S7: the template node gets wired to the lecture, then the AI's formula sheet appears. Cut at 23.1s (frame 48). */
export const Generate: React.FC = () => (
  <Footage shots={[
    { src: "gen-wire.mp4", dur: 48, push: 0.05, origin: "30% 40%" },
    { src: "gen-sheet.mp4", dur: 66, rate: 0.7, push: 0.08, origin: "62% 80%" },
  ]} />
);

/* S8: a big flashcard flips to its answer on a beat, then shows the page it came from. */
// Hits after the cut at 25.3s: 25.85 (f16), 26.375 (f32), 26.95 (f49), 27.475 (f65).
export const Flashcards: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S8", "flash");
  const flip = ramp(f, 39, 49);
  const chip = ramp(f, 58, 66, backOut);
  const deal = (i: number) => ramp(f, i * 3, 10 + i * 3);
  const W = 960, H = 560, X = (1440 - W) / 2, Y = 100;
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: 28, background: "#fff", backfaceVisibility: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", padding: "56px 68px", fontFamily: BODY };
  return (
    <AbsoluteFill style={dotGrid}>
      {[2, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: X + i * 16, top: Y + i * 16, width: W, height: H, borderRadius: 28, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.06)", opacity: deal(i), transform: `translateY(${(1 - deal(i)) * 80}px)` }} />
      ))}
      <div style={{ position: "absolute", left: X, top: Y, width: W, height: H, perspective: 2000, opacity: deal(0), transform: `translateY(${(1 - deal(0)) * 80}px)` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
          <div style={face}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700, letterSpacing: "0.06em", color: C.maroon }}>
              <span>QUESTION</span><span style={{ color: C.gray3, letterSpacing: 0, fontWeight: 500 }}>{e.v("count")}</span>
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 60, lineHeight: 1.18, color: C.ink, marginTop: 56 }}>{e.v("q")}</div>
          </div>
          <div style={{ ...face, transform: "rotateY(180deg)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.06em", color: C.maroon }}>ANSWER</div>
            <div style={{ fontFamily: HEAD, fontStyle: "italic", fontWeight: 600, fontSize: 100, color: C.maroon, marginTop: 52, letterSpacing: "-0.015em" }}>{e.v("a")}</div>
            <div style={{ display: "inline-flex", marginTop: 56, padding: "14px 24px", borderRadius: 999, background: C.goldTint, border: "1px solid #F5DC94", fontSize: 26, color: C.ink, transform: `scale(${chip})`, transformOrigin: "0 50%" }}>{e.v("source")}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* S9: two real features. Library course roadmap, then the study buddy on the 30.725s cut (frame 48). */
export const Extras: React.FC = () => (
  <Footage shots={[
    // badge text lives in reel.json
    { src: "library.mp4", dur: 48, push: 0.04, origin: "40% 45%" },
    { src: "buddy.mp4", dur: 50, push: 0.05, origin: "60% 55%", badge: el("S9", "extras").v("badge") },
  ]} />
);

/* S10: end card, cut in on the big 32.4s hit. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S10", "end");
  const l = ramp(f, 8, 18);
  const b = ramp(f, 14, 26, backOut);
  const s = ramp(f, 22, 32);
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ transform: `translateY(${interpolate(f, [0, 10], [30, 0], { extrapolateRight: "clamp" })}px)` }}>
        <Lockup lead={e.v("lead")} name={e.v("name")} size={124} f={f} at={{ a: [0, 4], o: [0, 8], b: [2, 8] }} />
      </div>
      <div style={{ marginTop: 34, textAlign: "center", fontFamily: HEAD, fontSize: 46, lineHeight: 1.3, color: C.gray2, opacity: l, transform: `translateY(${(1 - l) * 16}px)` }}>
        <div>{e.v("line1")}</div>
        <div style={{ fontStyle: "italic", fontWeight: 500, color: C.ink }}>{e.v("line2")}</div>
      </div>
      <div style={{ marginTop: 46, padding: "22px 50px", borderRadius: 999, background: C.maroon, color: "#fff", fontFamily: BODY, fontWeight: 600, fontSize: 34, boxShadow: "0 6px 18px rgba(140,29,64,0.3)", transform: `scale(${b})` }}>{e.v("cta")}</div>
      <div style={{ marginTop: 32, fontFamily: BODY, fontSize: 25, color: C.gray3, opacity: s }}>{e.v("fine")}</div>
    </AbsoluteFill>
  );
};
