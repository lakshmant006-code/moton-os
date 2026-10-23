import React from "react";
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { el, FPS } from "./reel";
import {
  Appear, C, CARD, Card, Chip, Clip, ColorCard, FONT, Icon, Label, Learning, Orb, Pose, Screen, Speed, Tablet, TextBlock,
  Title, Words, X0, hexA, lerp, ramp, SHADOW,
} from "./ui";

// Frame (relative to the scene) at which an element appears.
const at = (s: string, e: string) => el(s, e).start;
// The app's playground background, as set on the opening card.
const BG = el("S1", "s1card").v("bg");
const v = (s: string, e: string, k: string) => el(s, e).v(k);

// ---------------------------------------------------------------- S1 / S13 hero card
// A white card with the character standing in the app's playground, in place of the reference's gradient card.
const HeroCard: React.FC<{ at: number; pose: string; bg: string; children: React.ReactNode }> = ({ at: a, pose, bg, children }) => {
  const f = useCurrentFrame();
  const t = ramp(f, a, a + 26);
  const sky = ramp(f, a + 10, a + 34);
  const pt = ramp(f, a + 22, a + 44);
  const bob = Math.sin((f / FPS) * 2.4) * 5;
  const W = 1920 - X0 * 2, H = 640;
  return (
    <div
      style={{
        position: "absolute", left: X0, top: 220, width: W, height: H, borderRadius: 36, overflow: "hidden", background: C.card,
        boxShadow: `${SHADOW}, inset 0 0 0 1px ${C.hair}`,
        opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(0.97, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line} 1.6px, transparent 1.6px)`, backgroundSize: "26px 26px", opacity: 0.7 }} />
      {/* the app's own playground behind the character */}
      <div style={{ position: "absolute", right: 18, top: 18, bottom: 18, width: 520, borderRadius: 26, overflow: "hidden", opacity: sky, transform: `scale(${lerp(0.94, 1, sky)})` }}>
        <Img src={staticFile(bg)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "64% 60%", transform: `scale(${1.08 + (f / FPS) * 0.008})` }} />
        <div style={{ position: "absolute", left: "50%", bottom: 30, transform: `translateX(-50%) translateY(${(1 - pt) * 120 + bob}px)`, opacity: pt }}>
          <Pose name={pose} h={470} style={{ filter: "drop-shadow(0 16px 18px rgba(28,43,75,0.35))" }} />
        </div>
      </div>
      {children}
    </div>
  );
};

const Kicker: React.FC<{ text: string; at: number }> = ({ text, at: a }) => (
  <Appear at={a} dy={8} blur={4}>
    <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 999, background: C.red, color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 26 }}>{text}</div>
  </Appear>
);

export const Question: React.FC = () => {
  const e = el("S1", "s1card");
  return (
    <HeroCard at={e.start} pose="wave" bg={e.v("bg")}>
      <div style={{ position: "absolute", left: 72, top: 0, bottom: 0, width: 880, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT, color: C.text }}>
        <div><Kicker text={e.v("kicker")} at={e.start + 14} /></div>
        <Words text={e.v("text")} at={e.start + 20} step={2.6} style={{ fontSize: 58, lineHeight: 1.14, fontWeight: 600, letterSpacing: -1.5 }} />
      </div>
    </HeroCard>
  );
};

export const End: React.FC = () => {
  const e = el("S13", "s13card");
  return (
    <HeroCard at={e.start} pose="armsup" bg={e.v("bg")}>
      <div style={{ position: "absolute", left: 72, top: 0, bottom: 0, width: 880, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT, color: C.text }}>
        <div><Kicker text={e.v("kicker")} at={e.start + 12} /></div>
        <Words text={e.v("name")} at={e.start + 16} style={{ fontSize: 132, fontWeight: 700, letterSpacing: -4.5, lineHeight: 1, color: C.navy }} />
        <Words text={e.v("text")} at={e.start + 26} step={2.4} style={{ fontSize: 46, fontWeight: 500, letterSpacing: -0.8, marginTop: 22, color: C.muted }} />
      </div>
    </HeroCard>
  );
};

// ---------------------------------------------------------------- S2 flipbook
const CYCLE = ["rest", "wave", "armsup", "mixed", "cross", "down", "squat"];
export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const c = el("S2", "s2card");
  const n = c.v<number>("count");
  const t0 = c.start + 16;
  const shown = Math.max(0, Math.min(n, Math.floor((f - t0) / 3.2) + 1));
  const cols = 6;
  const cw = 118, ch = 128, gap = 12;
  const gw = cols * cw + (cols - 1) * gap;
  return (
    <>
      <Label text={v("S2", "s2label", "text")} />
      <TextBlock head={v("S2", "s2text", "head")} sub={v("S2", "s2text", "sub")} at={at("S2", "s2text")} />
      <Card at={c.start}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: FONT }}>
          <div style={{ fontSize: 22, color: C.muted }}>Drawing</div>
          <div style={{ fontSize: 96, fontWeight: 700, color: C.text, letterSpacing: -3, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
            {shown}<span style={{ color: C.faint }}> / {n}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: (CARD.w - gw) / 2, top: 250, width: gw, display: "flex", flexWrap: "wrap", gap }}>
          {Array.from({ length: n }).map((_, i) => {
            const t = ramp(f, t0 + i * 3.2, t0 + i * 3.2 + 10);
            const hot = i === shown - 1;
            return (
              <div key={i} style={{ width: cw, height: ch, borderRadius: 14, background: hot ? hexA(C.red, 0.08) : C.soft, boxShadow: `inset 0 0 0 ${hot ? 2 : 1}px ${hot ? C.red : C.hair}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: t, transform: `scale(${lerp(0.85, 1, t)})` }}>
                <Pose name={CYCLE[i % CYCLE.length]} h={108} style={{ maxWidth: cw - 14, objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
          <Appear at={t0 + n * 3.2}>
            <div style={{ display: "inline-block" }}><Chip color={C.red} solid style={{ fontSize: 22, padding: "12px 20px" }}>{c.v("caption")}</Chip></div>
          </Appear>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- S3 pipeline tree
const Line: React.FC<{ d: string; color: string; p: number; len?: number }> = ({ d, color, p, len = 600 }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
);
export const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S3", "s3tree");
  const a = e.start + 14;
  const nodes = e.v<string[][]>("nodes");
  const colors = [C.blue, C.red, C.green];
  const icons = ["body", "face", "wave"];
  const cx = CARD.w / 2;
  const xs = [cx - 270, cx, cx + 270];
  const yTop = 150, yMid = 420, yBot = 780;
  const pulse = 1 + 0.05 * Math.sin((f / FPS) * 4);
  return (
    <>
      <Label text={v("S3", "s3label", "text")} />
      <TextBlock head={v("S3", "s3text", "head")} sub={v("S3", "s3text", "sub")} at={at("S3", "s3text")} />
      <Card at={e.start}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line} 1.5px, transparent 1.5px)`, backgroundSize: "24px 24px", opacity: 0.6 }} />
        <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0 }}>
          {xs.map((x, i) => (
            <Line key={`a${i}`} d={`M${cx} ${yTop + 60} V${yTop + 140} H${x} V${yMid - 54}`} color={colors[i]} p={ramp(f, a + 8 + i * 4, a + 34 + i * 4)} />
          ))}
          {xs.map((x, i) => (
            <Line key={`b${i}`} d={`M${x} ${yMid + 150} V${yBot - 170} H${cx} V${yBot - 80}`} color={colors[i]} p={ramp(f, a + 70 + i * 4, a + 100 + i * 4)} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: cx - 50, top: yTop - 50 }}>
          <Appear at={a}>
            <div style={{ transform: `scale(${pulse})` }}>
              <Orb color={C.navy} size={100}><Icon name="camera" size={44} /></Orb>
            </div>
          </Appear>
        </div>
        <div style={{ position: "absolute", left: cx + 70, top: yTop - 16, fontFamily: FONT, fontSize: 20, color: C.muted, fontWeight: 500 }}>
          <Appear at={a + 6}>{e.v("top")}</Appear>
        </div>
        {nodes.map(([name, chip], i) => (
          <div key={i} style={{ position: "absolute", left: xs[i] - 120, top: yMid - 48, width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Appear at={a + 30 + i * 5}>
              <Orb color={colors[i]} size={96}><Icon name={icons[i]} size={42} /></Orb>
            </Appear>
            <Appear at={a + 38 + i * 5}>
              <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.text, marginTop: 14, textAlign: "center" }}>{name}</div>
            </Appear>
            <Appear at={a + 46 + i * 5}>
              <Chip color={colors[i]} style={{ marginTop: 10, width: 210, textAlign: "center", background: "#fff", boxShadow: `inset 0 0 0 1.5px ${hexA(colors[i], 0.35)}, 0 6px 16px rgba(28,43,75,0.06)` }}>{chip}</Chip>
            </Appear>
          </div>
        ))}
        <div style={{ position: "absolute", left: cx - 75, top: yBot - 80, display: "flex", flexDirection: "column", alignItems: "center", width: 150 }}>
          <Appear at={a + 98}>
            <div style={{ width: 150, height: 150, borderRadius: "50%", overflow: "hidden", position: "relative", boxShadow: `0 0 0 6px #fff, 0 0 0 9px ${C.yellow}, 0 18px 40px rgba(28,43,75,0.18)` }}>
              <Img src={staticFile(BG)} style={{ position: "absolute", height: 150, left: -100 }} />
              <Img src={staticFile("poses/rest.png")} style={{ position: "absolute", height: 520, left: -121, top: -10 }} />
            </div>
          </Appear>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: yBot + 92, textAlign: "center", fontFamily: FONT }}>
          <Appear at={a + 106}>
            <div style={{ fontSize: 26, fontWeight: 600, color: C.text }}>{e.v("bottom")}</div>
            <div style={{ fontSize: 18, color: C.muted, marginTop: 8 }}>{e.v("foot")}</div>
          </Appear>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- tablet scenes
const TabletCard: React.FC<{ at: number; zoom?: { s: number; x: number; y: number }; children: React.ReactNode; overlay?: React.ReactNode }> = ({ at: a, zoom, children, overlay }) => (
  <Card at={a} bg={C.soft}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line} 1.5px, transparent 1.5px)`, backgroundSize: "24px 24px", opacity: 0.8 }} />
    <div style={{ position: "absolute", left: 30, top: (CARD.h - 650) / 2 }}>
      <Tablet width={CARD.w - 60} zoom={zoom}>{children}</Tablet>
    </div>
    {overlay}
  </Card>
);

// Ring that pulses around a point given in screen pixels (1366x1024 space).
const Ring: React.FC<{ x: number; y: number; at: number; color?: string }> = ({ x, y, at: a, color = C.yellow }) => {
  const f = useCurrentFrame();
  const t = ramp(f, a, a + 12);
  const p = ((f - a) % 36) / 36;
  return (
    <>
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", boxShadow: `0 0 0 5px ${color}`, opacity: t }} />
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", boxShadow: `0 0 0 3px ${color}`, opacity: t * (1 - p), transform: `scale(${1 + p * 0.8})` }} />
    </>
  );
};

const Tag: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at: a, color = C.blue, children }) => (
  <div style={{ position: "absolute", left: CARD.x + 40, top: CARD.y + 36 }}>
    <Appear at={a}>
      <Chip color={color} solid style={{ fontSize: 20, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>{children}</Chip>
    </Appear>
  </div>
);

export const Procreate: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S4", "s4screen");
  const swap = e.start + 64;
  const t = ramp(f, swap, swap + 14);
  const z = ramp(f, swap + 20, swap + 70);
  return (
    <>
      <Label text={v("S4", "s4label", "text")} />
      <TextBlock head={v("S4", "s4text", "head")} sub={v("S4", "s4text", "sub")} at={at("S4", "s4text")} />
      <TabletCard at={e.start} zoom={{ s: lerp(1, 1.55, z), x: 330, y: 260 }}>
        <Screen src={e.v("first")} />
        <Screen src={e.v("second")} style={{ opacity: t }} />
        {f > swap + 10 && <Ring x={531} y={160} at={swap + 10} />}
      </TabletCard>
      <Tag at={swap + 16}>{e.v("tag")}</Tag>
    </>
  );
};

export const Live: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S5", "s5screen");
  const z = ramp(f, e.start + 70, e.start + 150);
  return (
    <>
      <Label text={v("S5", "s5label", "text")} />
      <TextBlock head={v("S5", "s5text", "head")} sub={v("S5", "s5text", "sub")} at={at("S5", "s5text")} />
      <TabletCard at={e.start} zoom={{ s: lerp(1, 1.18, z), x: 683, y: 560 }}>
        <Sequence from={e.start}>
          <Clip src={e.v("clip")} from={e.v<number>("from")} />
        </Sequence>
      </TabletCard>
      <Tag at={e.start + 40} color={C.red}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", display: "inline-block" }} /> Live
      </Tag>
    </>
  );
};

// S7 and S8: a clip in the tablet, with the speed pill when it is sped up.
export const ClipScene: React.FC<{ scene: string; label: string; text: string; screen: string; learn?: string; zoom?: { s: number; x: number; y: number } }> = ({ scene, label, text, screen, learn, zoom }) => {
  const e = el(scene, screen);
  const rate = e.v<number>("rate");
  return (
    <>
      <Label text={v(scene, label, "text")} />
      <TextBlock head={v(scene, text, "head")} sub={v(scene, text, "sub")} at={at(scene, text)} />
      <TabletCard at={e.start} zoom={zoom} overlay={rate !== 1 ? <Speed rate={rate} at={e.start + 10} /> : null}>
        <Sequence from={e.start}>
          <Clip src={e.v("clip")} from={e.v<number>("from")} rate={rate} />
        </Sequence>
      </TabletCard>
      {learn && <Learning text={v(scene, learn, "text")} at={at(scene, learn)} />}
    </>
  );
};

export const RigClips: React.FC<{ splitAt: number }> = ({ splitAt }) => {
  const f = useCurrentFrame();
  const e = el("S9", "s9screen");
  const second = f >= e.start + splitAt;
  const tag = second ? e.v("tagB") : e.v("tagA");
  return (
    <>
      <Label text={v("S9", "s9label", "text")} />
      <TextBlock head={v("S9", "s9text", "head")} sub={v("S9", "s9text", "sub")} at={at("S9", "s9text")} />
      <TabletCard at={e.start} zoom={{ s: 1.75, x: 700, y: 560 }}>
        <Sequence from={e.start} durationInFrames={splitAt}>
          <Clip src={e.v("a")} from={e.v<number>("fromA")} />
        </Sequence>
        <Sequence from={e.start + splitAt}>
          <Clip src={e.v("b")} from={e.v<number>("fromB")} />
        </Sequence>
      </TabletCard>
      <Tag key={tag} at={second ? e.start + splitAt : e.start + 8}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          {second ? <path d="M9 1l8 8-8 8-8-8z" fill="none" stroke="#fff" strokeWidth="2" /> : <circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="2" />}
        </svg>
        {tag}
      </Tag>
    </>
  );
};

// ---------------------------------------------------------------- S6 two ways to capture
const CardText: React.FC<{ name: string; desc: string; color: string; top: number }> = ({ name, desc, color, top }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: FONT }}>
    <div style={{ fontSize: 36, fontWeight: 700, color, letterSpacing: -0.6 }}>{name}</div>
    <div style={{ fontSize: 22, color: C.muted, marginTop: 10, lineHeight: 1.4 }}>{desc}</div>
  </div>
);

export const TwoWays: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S6", "s6cards");
  const cards = e.v<string[][]>("cards");
  const w = (1920 - X0 * 2 - 40) / 2;
  const a = e.start;
  const cd = a + 22;
  const n = 3 - Math.floor((f - cd) / 14);
  const flash = ramp(f, cd + 42, cd + 46) * (1 - ramp(f, cd + 46, cd + 60));
  const one = ramp(f, cd + 44, cd + 58);
  const strip = ["rest", "wave", "armsup", "mixed", "cross"];
  const recT = Math.max(0, (f - (a + 26)) / FPS);
  return (
    <>
      <Label text={v("S6", "s6label", "text")} />
      <Title text={v("S6", "s6title", "text")} at={at("S6", "s6title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 40 }}>
        <ColorCard color={C.blue} at={a} w={w} h={640} panel={400} top={
          <>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f < cd + 44 ? (
                <div style={{ width: 230, height: 230, borderRadius: "50%", background: "#fff", boxShadow: `0 16px 40px ${hexA(C.blue, 0.25)}, inset 0 0 0 8px ${hexA(C.blue, 0.15)}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 140, fontWeight: 700, color: C.blue, opacity: f < cd ? 0.4 : 1 }}>
                  {f < cd ? 3 : Math.max(1, n)}
                </div>
              ) : (
                <div style={{ opacity: one, transform: `scale(${lerp(0.8, 1, one)})` }}><Pose name="wave" h={340} style={{ filter: "drop-shadow(0 14px 20px rgba(28,43,75,0.2))" }} /></div>
              )}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.8 }} />
          </>
        }>
          <CardText name={cards[0][0]} desc={cards[0][1]} color={C.blue} top={450} />
        </ColorCard>
        <ColorCard color={C.red} at={a + 6} w={w} h={640} panel={400} top={
          <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, background: "#fff", fontFamily: FONT, fontSize: 22, fontWeight: 600, color: C.text, boxShadow: "0 6px 16px rgba(28,43,75,0.08)" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.red, opacity: 0.4 + 0.6 * Math.round((Math.sin(f / 5) + 1) / 2) }} />
                REC 0:{String(Math.min(10, Math.floor(recT))).padStart(2, "0")}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", gap: 12 }}>
              {strip.map((p, i) => {
                const t = ramp(f, a + 30 + i * 9, a + 42 + i * 9);
                return (
                  <div key={i} style={{ width: 118, height: 230, borderRadius: 16, background: "#fff", boxShadow: "0 8px 20px rgba(28,43,75,0.08)", display: "flex", alignItems: "center", justifyContent: "center", opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
                    <Pose name={p} h={196} style={{ maxWidth: 108, objectFit: "contain" }} />
                  </div>
                );
              })}
            </div>
          </>
        }>
          <CardText name={cards[1][0]} desc={cards[1][1]} color={C.red} top={450} />
        </ColorCard>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- S10 feel cards
const FEELS: ((t: number) => number)[] = [
  // Snappy: holds, then moves quickly
  (t) => (t < 0.45 ? 0 : 1 - Math.pow(1 - Math.min(1, (t - 0.45) / 0.25), 3)),
  // Smooth: one flowing line
  (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  // Floaty: trails behind, then settles with a soft overshoot
  (t) => {
    const u = Math.max(0, Math.min(1, (t - 0.12) / 0.88));
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
  },
];
export const Feel: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S10", "s10cards");
  const cards = e.v<string[][]>("cards");
  const colors = [C.red, C.blue, C.green];
  const w = (1920 - X0 * 2 - 80) / 3;
  const gw = w - 108, gh = 200;
  return (
    <>
      <Label text={v("S10", "s10label", "text")} />
      <Title text={v("S10", "s10title", "text")} at={at("S10", "s10title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 40 }}>
        {cards.map(([name, desc], i) => {
          const a = e.start + i * 6;
          const fn = FEELS[i];
          const draw = ramp(f, a + 14, a + 44);
          const tt = Math.max(0, Math.min(1, ((((f - a - 30) / FPS) % 2.2) + 2.2) % 2.2 / 1.6));
          const pts = Array.from({ length: 61 }, (_, k) => {
            const x = k / 60;
            return `${(x * gw).toFixed(1)},${(gh - fn(x) * gh * 0.8 - gh * 0.1).toFixed(1)}`;
          });
          const dotX = tt * gw, dotY = gh - fn(tt) * gh * 0.8 - gh * 0.1;
          return (
            <ColorCard key={i} color={colors[i]} at={a} w={w} h={640} panel={380} top={
              <>
                <svg width={gw} height={gh} style={{ position: "absolute", left: 40, top: 50, overflow: "visible" }}>
                  <line x1={0} y1={gh * 0.9} x2={gw} y2={gh * 0.9} stroke={hexA(colors[i], 0.3)} strokeWidth={2} />
                  <line x1={0} y1={gh * 0.1} x2={gw} y2={gh * 0.1} stroke={hexA(colors[i], 0.3)} strokeWidth={2} strokeDasharray="4 6" />
                  <polyline points={pts.join(" ")} fill="none" stroke={colors[i]} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={900} strokeDashoffset={900 * (1 - draw)} />
                  {f > a + 30 && <circle cx={dotX} cy={dotY} r={11} fill="#fff" stroke={colors[i]} strokeWidth={4} />}
                </svg>
                <div style={{ position: "absolute", left: 40, top: 310, width: gw, height: 6, borderRadius: 3, background: "#fff" }} />
                {f > a + 30 && (
                  <div style={{ position: "absolute", left: 40 + fn(tt) * (gw - 40), top: 293, width: 40, height: 40, borderRadius: "50%", background: colors[i], boxShadow: `0 8px 18px ${hexA(colors[i], 0.4)}` }} />
                )}
              </>
            }>
              <CardText name={name} desc={desc} color={colors[i]} top={440} />
            </ColorCard>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- S11 rig check
const CHECK_POSES = ["armsup", "rest", "down", "mixed", "cross", "wave"];
export const RigCheck: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S11", "s11card");
  const steps = e.v<string[][]>("steps");
  const a = e.start + 14;
  const per = 22;
  const cur = Math.max(0, Math.min(steps.length - 1, Math.floor((f - a) / per)));
  const local = (f - a - cur * per) / per;
  const done = f > a + steps.length * per;
  const fix = ramp(f, a + 0.45 * per + cur * per, a + 0.85 * per + cur * per);
  return (
    <>
      <Label text={v("S11", "s11label", "text")} />
      <TextBlock head={v("S11", "s11text", "head")} sub={v("S11", "s11text", "sub")} at={at("S11", "s11text")} />
      <Card at={e.start}>
        <div style={{ position: "absolute", left: 56, top: 70, fontFamily: FONT }}>
          <div style={{ fontSize: 20, color: C.muted }}>Rig check</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.text, marginTop: 6, letterSpacing: -0.5 }}>Pose {Math.min(cur + 1, 6)} of 6</div>
        </div>
        <div style={{ position: "absolute", left: 56, top: 190, width: 380, display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map(([s], i) => {
            const isDone = i < cur || done;
            const isCur = i === cur && !done;
            const t = ramp(f, a - 10 + i * 3, a + i * 3);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, background: isCur ? hexA(C.blue, 0.08) : C.soft, boxShadow: `inset 0 0 0 ${isCur ? 2 : 1}px ${isCur ? C.blue : C.hair}`, opacity: t, fontFamily: FONT }}>
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="12" fill="none" stroke="#DDD8CE" strokeWidth="3" />
                  {isCur && <circle cx="15" cy="15" r="12" fill="none" stroke={C.blue} strokeWidth="3" strokeDasharray={75.4} strokeDashoffset={75.4 * (1 - Math.min(1, local / 0.5))} transform="rotate(-90 15 15)" strokeLinecap="round" />}
                  {isDone && <circle cx="15" cy="15" r="13" fill={C.green} />}
                  {isDone && <path d="M9 15.5l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
                <div style={{ fontSize: 22, color: isDone ? C.muted : C.text, fontWeight: isCur ? 600 : 400 }}>{s}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 470, top: 170, width: 380, height: 560, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Img src={staticFile(BG)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "64% 60%" }} />
          <Pose name={CHECK_POSES[cur]} h={440} style={{ maxWidth: 340, objectFit: "contain", position: "relative", filter: "drop-shadow(0 14px 16px rgba(28,43,75,0.3))" }} />
          {!done && (
            <div style={{ position: "absolute", left: 0, right: 0, top: `${(local * 120) % 100}%`, height: 3, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)` }} />
          )}
          <div style={{ position: "absolute", left: 190 - 60, top: 210, width: 120, height: 120, borderRadius: "50%", border: `4px dashed ${fix < 0.5 ? C.red : C.green}`, opacity: done ? 0 : Math.min(1, local * 4), transform: `scale(${lerp(1.1, 0.9, fix)})` }} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 760, width: 380, display: "flex", justifyContent: "center" }}>
          <div style={{ opacity: fix }}>
            <Chip color={C.green} solid style={{ fontSize: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="spark" size={20} /> {e.v("fixed")}
            </Chip>
          </div>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- S12 export
export const Export: React.FC = () => {
  const e = el("S12", "s12cards");
  const cards = e.v<string[][]>("cards");
  const colors = [C.blue, C.navy, C.red, C.green];
  const icons = ["layers", "vector", "film", "spark"];
  const w = (1920 - X0 * 2 - 3 * 28) / 4;
  return (
    <>
      <Label text={v("S12", "s12label", "text")} />
      <Title text={v("S12", "s12title", "text")} at={at("S12", "s12title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 28 }}>
        {cards.map(([name, desc], i) => (
          <ColorCard key={i} color={colors[i]} at={e.start + i * 6} w={w} h={640} panel={300} top={
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Orb color={colors[i]} size={130}><Icon name={icons[i]} size={56} /></Orb>
            </div>
          }>
            <div style={{ position: "absolute", left: 30, right: 30, top: 350, textAlign: "center", fontFamily: FONT }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: colors[i], letterSpacing: -0.5 }}>{name}</div>
              <div style={{ fontSize: 21, color: C.muted, marginTop: 14, lineHeight: 1.4 }}>{desc}</div>
            </div>
          </ColorCard>
        ))}
      </div>
    </>
  );
};
