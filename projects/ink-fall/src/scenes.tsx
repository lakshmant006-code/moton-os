import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { el, FPS } from "./reel";
import { BurstStrokes, C, Dust, Glow, Pic, Rain, Rays, Spatter, Strokes, easeIn, easeOut, lerp, place, ramp, rnd } from "./fx";

const useT = () => {
  const f = useCurrentFrame();
  return { f, t: f / FPS };
};
const Paper: React.FC<{ tone?: string }> = ({ tone = C.paper }) => <AbsoluteFill style={{ background: tone }} />;
const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], p))).join(",")})`;
};
/* Small handheld shake so the stills feel like a camera on a drawing. */
const shake = (t: number, amt: number) => ({ x: Math.sin(t * 13.1) * amt + Math.sin(t * 7.3) * amt * 0.6, y: Math.cos(t * 11.7) * amt * 0.8 });

/* S1: back view on paper inside a storm of dry brush strokes. */
export const Storm: React.FC = () => {
  const { f, t } = useT();
  const e = el("S1", "figure");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.0, easeOut));
  const s = shake(t, 3);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
      <Strokes t={t} n={90} seed={2} speed={2600} width={42} opacity={0.95} />
      <Pic name="back" style={place("back", 780, 720, 960 + s.x, 540 + s.y, k)} />
      <Strokes t={t + 3} n={9} seed={9} speed={3400} width={30} />
      <Spatter f={f} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 80% at 50% 45%, transparent 55%, rgba(10,10,10,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* S2: punch in on the back of the head and dive into the black hair. */
export const Nape: React.FC = () => {
  const { f, t } = useT();
  const e = el("S2", "head");
  const p = ramp(t, 0, 1.5, easeIn);
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), p);
  const fy = lerp(980, 1180, p);
  const dark = ramp(t, 0.55, 1.4);
  const s = shake(t, 2);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper tone={mix(C.paper, "#0d0d0d", dark)} />
      <Strokes t={t + 2} n={30} seed={4} speed={2400} width={44} opacity={1 - dark * 0.7} />
      <Pic name="back-head" style={place("back-head", 1365, fy, 960 + s.x, 470 + s.y, k)} />
      <Strokes t={t + 7} n={8} seed={12} speed={3600} width={34} color={dark > 0.5 ? "#f2f2f2" : C.ink} opacity={0.9} />
      <Spatter f={f} seed={8} color={dark > 0.5 ? "#ddd" : C.ink} />
    </AbsoluteFill>
  );
};

/* S3: the profile on black, camera sliding from the ear to the face. */
export const Profile: React.FC = () => {
  const { f, t } = useT();
  const e = el("S3", "side");
  const p = ramp(t, 0, 1.5, easeOut);
  const k = e.v<number>("zoom") * lerp(1, 1.08, p);
  const fx = lerp(1400, 1850, p);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#0b0b0b" }} />
      <Strokes t={t + 5} n={22} seed={6} speed={3000} width={26} color="#e9e4df" opacity={0.55} angle={-12} />
      <Pic name="side-head" style={place("side-head", fx, 960, 900, 440, k)} />
      <Strokes t={t + 11} n={7} seed={15} speed={3800} width={22} color="#f4f0ec" angle={-12} />
      <Spatter f={f} seed={21} color="#e9e4df" />
    </AbsoluteFill>
  );
};

/* S4: extreme close up on the glasses. */
export const Eyes: React.FC = () => {
  const { f, t } = useT();
  const e = el("S4", "face");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.0, easeOut));
  const s = shake(t, 2.5);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
      <Pic name="front-head" style={place("front-head", 1242, 905, 960 + s.x, 470 + s.y, k)} />
      <Strokes t={t + 9} n={14} seed={17} speed={3000} width={36} angle={-20} opacity={0.9} />
      <Spatter f={f} seed={30} />
    </AbsoluteFill>
  );
};

/* S5: ink pours into the lenses, a glint crosses, and the camera dives into the left lens. */
export const Shades: React.FC = () => {
  const { f, t } = useT();
  const e = el("S5", "face");
  const T0 = 7.0;
  const [p0, p1] = e.v<number[]>("pour").map((x) => x - T0);
  const [d0, d1] = e.v<number[]>("dive").map((x) => x - T0);
  const glint = e.v<number>("glint") - T0;
  const pour = ramp(t, p0, p1, easeOut);
  const dive = ramp(t, d0, d1, easeIn);
  const k = e.v<number>("zoom") * lerp(1, 1.06, ramp(t, 0, d0)) * Math.pow(26, dive);
  const fx = lerp(1242, 1041, ramp(t, d0 - 0.4, d1, easeOut));
  const fy = lerp(930, 897, ramp(t, d0 - 0.4, d1, easeOut));
  const sx = lerp(960, 960, dive), sy = lerp(470, 468, dive);
  const box = place("front-head", fx, fy, sx, sy, k);
  // ink level in head pixels: lenses span y 777..983
  const level = lerp(760, 1000, pour);
  const wave = (x: number) => Math.sin(x / 38 + t * 9) * 10 * (1 - pour) + Math.sin(x / 17 - t * 13) * 5 * (1 - pour);
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const x = 880 + i * 18;
    return `${x},${(level + wave(x)).toFixed(1)}`;
  });
  const gp = ramp(t, glint, glint + 0.55, easeOut);
  const mask: React.CSSProperties = { WebkitMaskImage: `url(${staticFile("lenses.png")})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile("lenses.png")})`, maskSize: "100% 100%" };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
      <Strokes t={t + 4} n={16} seed={19} speed={2500} width={36} angle={-20} opacity={0.75 * (1 - dive)} />
      <div style={box}>
        <Pic name="front-head" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", inset: 0, ...mask }}>
          <svg viewBox="0 0 2730 2800" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* drips run ahead of the fill */}
            {[960, 1030, 1110, 1380, 1450, 1520].map((x, i) => (
              <rect key={i} x={x - 9} y={0} width={18} height={level + 40 + 50 * rnd(i) * (1 - pour)} rx={9} fill="#000" opacity={pour > 0 ? 1 : 0} />
            ))}
            <polygon points={`880,0 1620,0 ${pts.slice().reverse().join(" ")}`} fill="#000" />
            {pour >= 0.999 && <path d="M 960 830 Q 1010 815 1060 835 M 1375 800 Q 1425 785 1475 805" stroke="rgba(255,255,255,0.55)" strokeWidth={10} strokeLinecap="round" fill="none" />}
            {gp > 0 && gp < 1 && <polygon points={`${lerp(700, 1700, gp)},700 ${lerp(760, 1760, gp)},700 ${lerp(620, 1620, gp)},1060 ${lerp(560, 1560, gp)},1060`} fill="rgba(255,255,255,0.85)" />}
          </svg>
        </div>
      </div>
      <Strokes t={t + 13} n={6} seed={23} speed={3600} width={30} angle={-20} opacity={1 - dive} />
      <Spatter f={f} seed={41} />
      <AbsoluteFill style={{ background: C.ink, opacity: ramp(t, d1 - 0.15, d1) }} />
    </AbsoluteFill>
  );
};

/* S6: a diagonal white slash wipes the black. */
export const Flash: React.FC = () => {
  const { t } = useT();
  const p = ramp(t, 0, 0.32, easeOut);
  const out = ramp(t, 0.3, 0.5);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -600, top: -900, width: 3200, height: 2800, transform: `rotate(-24deg) translateX(${lerp(-3000, 0, p)}px)`, background: "#fff", boxShadow: "0 0 120px 60px rgba(255,255,255,0.8)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: out }} />
    </AbsoluteFill>
  );
};

/* S7: low angle on the sneakers against a white speed line burst, tilting up the body. */
export const LowAngle: React.FC = () => {
  const { f, t } = useT();
  const e = el("S7", "legs");
  const p = ramp(t, 0.15, 3.5);
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), p);
  const fy = lerp(2560, 1400, p);
  const s = shake(t, 2 + 5 * Math.exp(-t * 4));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 70% at 50% 55%, #ffffff 0%, #f1ece8 35%, #6d6a68 75%, #151515 100%)" }} />
      <Rays f={f} cx={960} cy={560} color="rgba(255,255,255,0.95)" n={60} inner={160} seed={3} />
      <Rays f={f + 1} cx={960} cy={560} color={C.ink} n={46} inner={420} seed={8} o={0.85} />
      <Pic name="front-sil" style={{ ...place("front", 767, fy, 960 + s.x, 520 + s.y, k), filter: "brightness(0)" }} />
      <Pic name="front" style={{ ...place("front", 767, fy, 960 + s.x, 520 + s.y, k), opacity: 0.16, mixBlendMode: "screen" }} />
      <Spatter f={f} seed={50} n={14} />
    </AbsoluteFill>
  );
};

/* S8: the full figure from behind, a dark silhouette in a white burst. */
export const Stand: React.FC = () => {
  const { f, t } = useT();
  const e = el("S8", "figure");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.5, easeOut));
  const glow = 0.85 + 0.15 * Math.sin(t * 9);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 34% 62% at 50% 52%, #ffffff 0%, rgba(240,236,232,${glow}) 40%, #3a3836 78%, #0b0b0b 100%)` }} />
      <Rays f={f} cx={960} cy={500} color="rgba(255,255,255,0.75)" n={52} inner={260} seed={13} every={3} />
      <Strokes t={t + 1} n={10} seed={27} speed={1800} width={22} angle={-90} color={C.ink} opacity={0.35} />
      <Pic name="back-sil" style={{ ...place("back", 780, 1440, 960, 455, k), filter: "brightness(0)" }} />
    </AbsoluteFill>
  );
};

/* S9: the silhouette turns to light and walks away. */
export const GlowWalk: React.FC = () => {
  const { t } = useT();
  const e = el("S9", "figure");
  const k = e.v<number>("zoom") * lerp(1.04, 0.9, ramp(t, 0, 3, easeOut));
  const step = t * Math.PI * 2 * 1.6;
  const bob = Math.abs(Math.sin(step)) * -8;
  const sway = Math.sin(step) * 1.4;
  const inv = ramp(t, 0, 0.18);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 60% at 50% 55%, #1c1c1f 0%, #070708 70%)" }} />
      <Dust t={t + 17} n={60} />
      <AbsoluteFill style={{ background: "#fff", opacity: 1 - inv }} />
      <Glow name="back" style={place("back", 780, 1440, 960, 470 + bob, k)} rot={sway} art={0.18 * Math.exp(-((t % 0.5) / 0.12))} />
      {/* floor glow under the feet */}
      <div style={{ position: "absolute", left: 960 - 220, top: 470 + (2829 - 1440) * k - 30, width: 440, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.35), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

/* S10: the long fall. The user's falling drawing, lit from behind, dropping through rushing light. */
export const Fall: React.FC = () => {
  const { t } = useT();
  const e = el("S10", "figure");
  const k = e.v<number>("zoom") * (1 + 0.035 * Math.sin(t * 0.9));
  // keep the drawing's own speed lines close to vertical: only a gentle sway
  const rot = 3 * Math.sin(t * 0.55) + 1.2 * Math.sin(t * 1.7);
  const x = 960 + Math.sin(t * 0.4) * 60;
  const y = 450 + Math.sin(t * 0.8) * 16;
  const beats = el("S10", "red").v<number[]>("at").map((h) => h - 20);
  let pulse = 0;
  for (const b of beats) if (t >= b) pulse = Math.max(pulse, Math.exp(-(t - b) / 0.3));
  const enter = ramp(t, 0, 0.45, easeOut);
  const box = place("fall", 687, 672, x, lerp(y - 260, y, enter), k);
  const full: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 70% at 50% 45%, #1a1a1d 0%, #050506 75%)" }} />
      <Rain t={t + 20} n={140} o={0.5} speed={1300} />
      <div style={{ ...box, transform: `rotate(${rot}deg)` }}>
        {/* backlight: the body shape blurred into a halo, so the black pants still read on black */}
        <Pic name="fall-sil" style={{ ...full, filter: `blur(${34 + 16 * pulse}px)`, opacity: 0.75 + 0.25 * pulse }} />
        <Pic name="fall-sil" style={{ ...full, filter: "blur(7px)", opacity: 0.9 }} />
        <Pic name="fall-lines" style={{ ...full, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
        <Pic name="fall" style={full} />
      </div>
      <Rain t={t + 41} n={30} o={0.85} speed={2300} />
      <Dust t={t + 3} n={40} rise={120} o={0.8} />
    </AbsoluteFill>
  );
};

/* S11: lands facing us and bursts into brush strokes. */
export const Burst: React.FC = () => {
  const { t } = useT();
  const e = el("S11", "figure");
  const pop = ramp(t, 0, 0.2, easeOut);
  const k = e.v<number>("zoom") * lerp(0.86, 1, pop) * lerp(1, 1.05, ramp(t, 0.2, 2));
  const out = ramp(t, 1.45, 2.0);
  const flash = Math.exp(-t / 0.09);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 65% at 50% 50%, #2a0a10 0%, #0a0507 75%)" }} />
      <Rays f={useCurrentFrame()} cx={960} cy={430} color="rgba(255,255,255,0.12)" n={40} inner={300} seed={77} every={2} />
      <BurstStrokes t={t - 0.02} cx={960} cy={430} />
      <Glow name="front" style={place("front", 767, 1430, 960, 430, k)} strength={1.3} art={0.25 * Math.exp(-t / 0.6)} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.9 }} />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

