import React from "react";
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { el, FPS } from "./reel";
import {
  Appear, C, CARD, Card, Chip, Clip, FONT, GlowCard, Icon, Label, Learning, Orb, Pose, Screen, Speed, Tablet, TextBlock,
  Title, Words, X0, hexA, lerp, ramp,
} from "./ui";

// Frame (relative to the scene) at which an element appears.
const at = (s: string, e: string) => el(s, e).start;
const v = (s: string, e: string, k: string) => el(s, e).v(k);
const vl = (s: string, e: string, k: string) => el(s, e).v<string[][]>(k);

// ---------------------------------------------------------------- S1 / S13 gradient card
const GradientCard: React.FC<{ at: number; children: React.ReactNode }> = ({ at: a, children }) => {
  const f = useCurrentFrame();
  const t = ramp(f, a, a + 26);
  const drift = f / FPS;
  return (
    <div
      style={{
        position: "absolute", left: X0, top: 238, width: 1920 - X0 * 2, height: 604, borderRadius: 34, overflow: "hidden",
        opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${lerp(0.97, 1, t)})`, filter: t < 1 ? `blur(${(1 - t) * 14}px)` : undefined,
        background: `radial-gradient(70% 95% at ${96 - drift * 1.2}% ${108 - drift}%, ${C.gradB} 0%, ${hexA(C.gradB, 0.55)} 30%, rgba(0,0,0,0) 62%),
          radial-gradient(60% 80% at ${10 + drift * 1.5}% 0%, #B596FF 0%, rgba(0,0,0,0) 70%),
          linear-gradient(135deg, #9A78F4 0%, ${C.gradA} 55%, #A879D8 100%)`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
      }}
    >
      {children}
    </div>
  );
};

export const Question: React.FC = () => {
  const e = el("S1", "s1card");
  return (
    <GradientCard at={e.start}>
      <div style={{ position: "absolute", left: 64, bottom: 70, fontFamily: FONT, color: "#fff" }}>
        <Appear at={e.start + 14} dy={8} blur={4}>
          <div style={{ fontSize: 20, opacity: 0.75, marginBottom: 18 }}>{e.v("kicker")}</div>
        </Appear>
        <Words text={e.v("text")} at={e.start + 20} step={2.6} style={{ fontSize: 54, lineHeight: 1.18, fontWeight: 500, letterSpacing: -0.8 }} />
      </div>
    </GradientCard>
  );
};

export const End: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S13", "s13card");
  const bob = Math.sin((f / FPS) * 2.4) * 6;
  const pt = ramp(f, e.start + 30, e.start + 52);
  return (
    <GradientCard at={e.start}>
      <div style={{ position: "absolute", right: 120, bottom: -8, opacity: pt, transform: `translateY(${(1 - pt) * 80 + bob}px)` }}>
        <Pose name="wave" h={520} style={{ filter: "drop-shadow(0 20px 40px rgba(60,20,90,0.35))" }} />
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 70, fontFamily: FONT, color: "#fff" }}>
        <Appear at={e.start + 12} dy={8} blur={4}>
          <div style={{ fontSize: 20, opacity: 0.75, marginBottom: 14 }}>{e.v("kicker")}</div>
        </Appear>
        <Words text={e.v("name")} at={e.start + 16} style={{ fontSize: 120, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }} />
        <Words text={e.v("text")} at={e.start + 26} step={2.4} style={{ fontSize: 46, fontWeight: 500, letterSpacing: -0.6, marginTop: 18 }} />
      </div>
    </GradientCard>
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
          <div style={{ fontSize: 96, fontWeight: 600, color: C.text, letterSpacing: -3, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
            {shown}<span style={{ color: "#3A3A40" }}> / {n}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: (CARD.w - gw) / 2, top: 250, width: gw, display: "flex", flexWrap: "wrap", gap }}>
          {Array.from({ length: n }).map((_, i) => {
            const t = ramp(f, t0 + i * 3.2, t0 + i * 3.2 + 10);
            const hot = i === shown - 1;
            return (
              <div key={i} style={{ width: cw, height: ch, borderRadius: 14, background: hot ? "#232328" : "#1A1A1E", boxShadow: `inset 0 0 0 1px ${hot ? hexA(C.red, 0.6) : C.hair}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: t, transform: `scale(${lerp(0.85, 1, t)})` }}>
                <Pose name={CYCLE[i % CYCLE.length]} h={108} style={{ maxWidth: cw - 14, objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
          <Appear at={t0 + n * 3.2}>
            <div style={{ fontFamily: FONT, fontSize: 24, color: C.muted }}>{c.v("caption")}</div>
          </Appear>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- S3 pipeline tree
const Line: React.FC<{ d: string; color: string; p: number; len?: number }> = ({ d, color, p, len = 600 }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.9} />
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
  const pulse = 1 + 0.06 * Math.sin((f / FPS) * 4);
  return (
    <>
      <Label text={v("S3", "s3label", "text")} />
      <TextBlock head={v("S3", "s3text", "head")} sub={v("S3", "s3text", "sub")} at={at("S3", "s3text")} />
      <Card at={e.start}>
        <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            {colors.map((c, i) => (
              <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8A8A92" /><stop offset="1" stopColor={c} />
              </linearGradient>
            ))}
          </defs>
          {xs.map((x, i) => (
            <Line key={`a${i}`} d={`M${cx} ${yTop + 60} V${yTop + 140} H${x} V${yMid - 54}`} color={`url(#g${i})`} p={ramp(f, a + 8 + i * 4, a + 34 + i * 4)} />
          ))}
          {xs.map((x, i) => (
            <Line key={`b${i}`} d={`M${x} ${yMid + 150} V${yBot - 170} H${cx} V${yBot - 80}`} color={colors[i]} p={ramp(f, a + 70 + i * 4, a + 100 + i * 4)} />
          ))}
        </svg>
        {/* top: the performer */}
        <div style={{ position: "absolute", left: cx - 50, top: yTop - 50 }}>
          <Appear at={a}>
            <div style={{ transform: `scale(${pulse})` }}>
              <Orb color="#8C8C96" size={100}><Icon name="camera" size={44} /></Orb>
            </div>
          </Appear>
        </div>
        <div style={{ position: "absolute", left: cx + 70, top: yTop - 16, fontFamily: FONT, fontSize: 20, color: C.muted }}>
          <Appear at={a + 6}>{e.v("top")}</Appear>
        </div>
        {/* middle: what is tracked */}
        {nodes.map(([name, chip], i) => (
          <div key={i} style={{ position: "absolute", left: xs[i] - 120, top: yMid - 48, width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Appear at={a + 30 + i * 5}>
              <Orb color={colors[i]} size={96}><Icon name={icons[i]} size={42} /></Orb>
            </Appear>
            <Appear at={a + 38 + i * 5}>
              <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 500, color: C.text, marginTop: 14, textAlign: "center" }}>{name}</div>
            </Appear>
            <Appear at={a + 46 + i * 5}>
              <Chip color={colors[i]} style={{ marginTop: 10, width: 210, textAlign: "center" }}>{chip}</Chip>
            </Appear>
          </div>
        ))}
        {/* bottom: the rigged drawing */}
        <div style={{ position: "absolute", left: cx - 75, top: yBot - 80, display: "flex", flexDirection: "column", alignItems: "center", width: 150 }}>
          <Appear at={a + 98}>
            <Orb color={C.violet} size={150} glow={1.3}>
              <div style={{ width: 130, height: 130, borderRadius: "50%", overflow: "hidden", position: "relative" }}>
                <Img src={staticFile("poses/rest.png")} style={{ position: "absolute", height: 520, left: -131, top: -20 }} />
              </div>
            </Orb>
          </Appear>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: yBot + 86, textAlign: "center", fontFamily: FONT }}>
          <Appear at={a + 106}>
            <div style={{ fontSize: 24, fontWeight: 500, color: C.text }}>{e.v("bottom")}</div>
            <div style={{ fontSize: 18, color: C.muted, marginTop: 8 }}>{e.v("foot")}</div>
          </Appear>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- tablet scenes
const TabletCard: React.FC<{ at: number; zoom?: { s: number; x: number; y: number }; children: React.ReactNode; overlay?: React.ReactNode }> = ({ at: a, zoom, children, overlay }) => (
  <Card at={a}>
    <div style={{ position: "absolute", left: 30, top: (CARD.h - 650) / 2 }}>
      <Tablet width={CARD.w - 60} zoom={zoom}>{children}</Tablet>
    </div>
    {overlay}
  </Card>
);

// Ring that pulses around a point given in screen pixels (1366x1024 space).
const Ring: React.FC<{ x: number; y: number; at: number; color?: string }> = ({ x, y, at: a, color = C.blue }) => {
  const f = useCurrentFrame();
  const t = ramp(f, a, a + 12);
  const p = ((f - a) % 36) / 36;
  return (
    <>
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", boxShadow: `0 0 0 4px ${color}`, opacity: t }} />
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", boxShadow: `0 0 0 3px ${color}`, opacity: t * (1 - p), transform: `scale(${1 + p * 0.8})` }} />
    </>
  );
};

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
      <div style={{ position: "absolute", left: CARD.x + 40, top: CARD.y + 36 }}>
        <Appear at={swap + 16}>
          <Chip color={C.blue} style={{ fontSize: 20, padding: "10px 18px" }}>{e.v("tag")}</Chip>
        </Appear>
      </div>
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
  const tagAt = second ? e.start + splitAt : e.start + 8;
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
      <div key={tag} style={{ position: "absolute", left: CARD.x + 40, top: CARD.y + 36 }}>
        <Appear at={tagAt}>
          <Chip color={C.blue} style={{ fontSize: 20, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              {second ? <path d="M9 1l8 8-8 8-8-8z" fill="none" stroke="#fff" strokeWidth="2" /> : <circle cx="9" cy="9" r="7" fill="none" stroke="#fff" strokeWidth="2" />}
            </svg>
            {tag}
          </Chip>
        </Appear>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- S6 two ways to capture
export const TwoWays: React.FC = () => {
  const f = useCurrentFrame();
  const e = el("S6", "s6cards");
  const cards = e.v<string[][]>("cards");
  const w = (1920 - X0 * 2 - 40) / 2;
  const a = e.start;
  // Pose: 3, 2, 1, flash, one drawing
  const cd = a + 22;
  const n = 3 - Math.floor((f - cd) / 14);
  const flash = ramp(f, cd + 42, cd + 46) * (1 - ramp(f, cd + 46, cd + 60));
  const one = ramp(f, cd + 44, cd + 58);
  // Motion: REC with a strip that fills
  const strip = ["rest", "wave", "armsup", "mixed", "cross"];
  const recT = Math.max(0, (f - (a + 26)) / FPS);
  return (
    <>
      <Label text={v("S6", "s6label", "text")} />
      <Title text={v("S6", "s6title", "text")} at={at("S6", "s6title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 40 }}>
        <GlowCard color={C.blue} at={a} w={w} h={640}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {f < cd + 44 ? (
              <div style={{ fontFamily: FONT, fontSize: 200, fontWeight: 600, color: "#fff", opacity: f < cd ? 0.25 : 1, textShadow: `0 0 60px ${hexA(C.blue, 0.8)}` }}>
                {f < cd ? 3 : Math.max(1, n)}
              </div>
            ) : (
              <div style={{ opacity: one, transform: `scale(${lerp(0.8, 1, one)})` }}><Pose name="wave" h={290} /></div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.5, borderRadius: 20 }} />
          </div>
          <CardText name={cards[0][0]} desc={cards[0][1]} color={C.blue} />
        </GlowCard>
        <GlowCard color={C.orange} at={a + 6} w={w} h={640}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: FONT, fontSize: 22, color: "#fff" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.red, opacity: 0.5 + 0.5 * Math.round((Math.sin(f / 5) + 1) / 2) }} />
            REC 0:{String(Math.min(10, Math.floor(recT))).padStart(2, "0")}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", gap: 10 }}>
            {strip.map((p, i) => {
              const t = ramp(f, a + 30 + i * 9, a + 42 + i * 9);
              return (
                <div key={i} style={{ width: 118, height: 200, borderRadius: 14, background: "rgba(255,255,255,0.05)", boxShadow: `inset 0 0 0 1px ${hexA(C.orange, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
                  <Pose name={p} h={176} style={{ maxWidth: 108, objectFit: "contain" }} />
                </div>
              );
            })}
          </div>
          <CardText name={cards[1][0]} desc={cards[1][1]} color={C.orange} />
        </GlowCard>
      </div>
    </>
  );
};

const CardText: React.FC<{ name: string; desc: string; color: string; top?: number }> = ({ name, desc, color, top = 420 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", fontFamily: FONT }}>
    <div style={{ fontSize: 36, fontWeight: 600, color, letterSpacing: -0.4, filter: "brightness(1.25)" }}>{name}</div>
    <div style={{ fontSize: 22, color: "#A3A3AA", marginTop: 12, lineHeight: 1.4 }}>{desc}</div>
  </div>
);

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
  const colors = [C.orange, C.blue, C.green];
  const w = (1920 - X0 * 2 - 80) / 3;
  const gw = w - 80, gh = 200;
  return (
    <>
      <Label text={v("S10", "s10label", "text")} />
      <Title text={v("S10", "s10title", "text")} at={at("S10", "s10title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 40 }}>
        {cards.map(([name, desc], i) => {
          const a = e.start + i * 6;
          const fn = FEELS[i];
          const draw = ramp(f, a + 14, a + 44);
          const loop = (((f - a - 30) / FPS) % 2.2) / 1.6;
          const tt = Math.max(0, Math.min(1, loop));
          const pts = Array.from({ length: 61 }, (_, k) => {
            const x = k / 60;
            return `${(x * gw).toFixed(1)},${(gh - fn(x) * gh * 0.8 - gh * 0.1).toFixed(1)}`;
          });
          const dotX = tt * gw, dotY = gh - fn(tt) * gh * 0.8 - gh * 0.1;
          return (
            <GlowCard key={i} color={colors[i]} at={a} w={w} h={640}>
              <svg width={gw} height={gh} style={{ position: "absolute", left: 40, top: 80, overflow: "visible" }}>
                <line x1={0} y1={gh * 0.9} x2={gw} y2={gh * 0.9} stroke="#2E2E33" strokeWidth={1.5} />
                <line x1={0} y1={gh * 0.1} x2={gw} y2={gh * 0.1} stroke="#2E2E33" strokeWidth={1.5} strokeDasharray="4 6" />
                <polyline points={pts.join(" ")} fill="none" stroke={colors[i]} strokeWidth={4} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - draw)} />
                {f > a + 30 && <circle cx={dotX} cy={dotY} r={10} fill="#fff" style={{ filter: `drop-shadow(0 0 10px ${colors[i]})` }} />}
              </svg>
              {/* the same motion on a moving ball */}
              <div style={{ position: "absolute", left: 40, top: 320, width: gw, height: 4, borderRadius: 2, background: "#25252A" }} />
              {f > a + 30 && (
                <div style={{ position: "absolute", left: 40 + fn(tt) * (gw - 36), top: 304, width: 36, height: 36, borderRadius: "50%", background: colors[i], boxShadow: `0 0 24px ${colors[i]}` }} />
              )}
              <CardText name={name} desc={desc} color={colors[i]} top={420} />
            </GlowCard>
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
          <div style={{ fontSize: 30, fontWeight: 500, color: C.text, marginTop: 6 }}>Pose {Math.min(cur + 1, 6)} of 6</div>
        </div>
        <div style={{ position: "absolute", left: 56, top: 190, width: 380, display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map(([s], i) => {
            const isDone = i < cur || done;
            const isCur = i === cur && !done;
            const t = ramp(f, a - 10 + i * 3, a + i * 3);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, background: isCur ? "rgba(47,123,255,0.14)" : "rgba(255,255,255,0.03)", boxShadow: `inset 0 0 0 1px ${isCur ? hexA(C.blue, 0.5) : C.hair}`, opacity: t, fontFamily: FONT }}>
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="12" fill="none" stroke="#34343A" strokeWidth="3" />
                  {isCur && <circle cx="15" cy="15" r="12" fill="none" stroke={C.blue} strokeWidth="3" strokeDasharray={75.4} strokeDashoffset={75.4 * (1 - Math.min(1, local / 0.5))} transform="rotate(-90 15 15)" strokeLinecap="round" />}
                  {isDone && <circle cx="15" cy="15" r="13" fill={C.green} />}
                  {isDone && <path d="M9 15.5l4 4 8-9" fill="none" stroke="#0B2A18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
                <div style={{ fontSize: 22, color: isDone ? "#B9B9BF" : C.text }}>{s}</div>
              </div>
            );
          })}
        </div>
        {/* the pose being tested: a red tear ring, then the fix */}
        <div style={{ position: "absolute", left: 470, top: 170, width: 380, height: 560, borderRadius: 24, background: "rgba(255,255,255,0.03)", boxShadow: `inset 0 0 0 1px ${C.hair}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Pose name={CHECK_POSES[cur]} h={440} style={{ maxWidth: 340, objectFit: "contain" }} />
          {!done && (
            <div style={{ position: "absolute", left: 0, right: 0, top: `${(local * 120) % 100}%`, height: 3, background: `linear-gradient(90deg, transparent, ${hexA(C.blue, 0.8)}, transparent)` }} />
          )}
          <div style={{ position: "absolute", left: 190 - 60, top: 210, width: 120, height: 120, borderRadius: "50%", border: `3px dashed ${fix < 0.5 ? C.red : C.green}`, opacity: done ? 0 : Math.min(1, local * 4), transform: `scale(${lerp(1.1, 0.9, fix)})` }} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 760, width: 380, display: "flex", justifyContent: "center" }}>
          <div style={{ opacity: fix }}>
            <Chip color={C.green} style={{ fontSize: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="spark" size={20} color="#9FF0C2" /> {e.v("fixed")}
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
  const colors = [C.blue, C.violet, C.orange, C.green];
  const icons = ["layers", "vector", "film", "spark"];
  const w = (1920 - X0 * 2 - 3 * 28) / 4;
  return (
    <>
      <Label text={v("S12", "s12label", "text")} />
      <Title text={v("S12", "s12title", "text")} at={at("S12", "s12title")} />
      <div style={{ position: "absolute", left: X0, top: 230, display: "flex", gap: 28 }}>
        {cards.map(([name, desc], i) => (
          <GlowCard key={i} color={colors[i]} at={e.start + i * 6} w={w} h={640}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
              <Orb color={colors[i]} size={130}><Icon name={icons[i]} size={54} /></Orb>
            </div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 340, textAlign: "center", fontFamily: FONT }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: colors[i], filter: "brightness(1.3)", letterSpacing: -0.4 }}>{name}</div>
              <div style={{ fontSize: 21, color: "#A3A3AA", marginTop: 14, lineHeight: 1.4 }}>{desc}</div>
            </div>
          </GlowCard>
        ))}
      </div>
    </>
  );
};

