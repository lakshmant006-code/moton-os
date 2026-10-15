import React, { createContext, useContext } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { el, FPS, reel } from "./reel";
import { Boil, BurstLines, C, Doodles, MotionLines, Page, Pic, Shock, Splash, WaveRow, WaveWall, backOut, easeIn, easeInOut, easeOut, lerp, place, ramp, rnd } from "./fx";

/* Seconds a scene starts early so it can dissolve over the one before (see Main.tsx). */
export const PreRoll = createContext(0);
const useT = () => {
  const pre = useContext(PreRoll);
  const f = useCurrentFrame();
  return { f, t: f / FPS - pre };
};
/* Beat hits for a scene, in that scene's local seconds. */
const beats = (id: string) => {
  const s = reel.scenes.find((x) => x.id === id)!;
  return s.els.some((e) => e.id === "pulse") ? el(id, "pulse").v<number[]>("at").map((h) => h - s.t[0]) : [];
};
const shake = (t: number, amt: number) => ({ x: Math.sin(t * 13.1) * amt + Math.sin(t * 7.3) * amt * 0.6, y: Math.cos(t * 11.7) * amt * 0.8 });

/* S1: back view on the page, wind lines whipping past. */
export const Storm: React.FC = () => {
  const { f, t } = useT();
  const e = el("S1", "figure");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.0, easeOut));
  const s = shake(t, 2);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <MotionLines t={t} n={16} seed={2} speed={2300} angle={156} />
        <Pic name="back" style={place("back", 780, 720, 960 + s.x, 540 + s.y, k)} />
        <Shock t={t} hits={beats("S1")} cx={960} cy={260} rx={150} ry={120} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S2: zoom lines rush in while the camera dives into the black hair. */
export const Nape: React.FC = () => {
  const { f, t } = useT();
  const e = el("S2", "head");
  const p = ramp(t, 0, 1.5, easeIn);
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), p);
  const fy = lerp(980, 1180, p);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <BurstLines f={f} cx={960} cy={470} r0={lerp(380, 700, p)} r1={1300} n={40} w={5} o={1 - ramp(t, 1.0, 1.4)} />
        <Pic name="back-head" style={place("back-head", 1365, fy, 960, 470, k)} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S3: the profile, the camera sliding from the ear to the face. */
export const Profile: React.FC = () => {
  const { f, t } = useT();
  const e = el("S3", "side");
  const p = ramp(t, 0, 1.5, easeOut);
  const k = e.v<number>("zoom") * lerp(1, 1.08, p);
  const fx = lerp(1400, 1850, p);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <MotionLines t={t} n={8} seed={6} speed={1500} angle={180} area={[0, 80, 1920, 500]} />
        <Pic name="side-head" style={place("side-head", fx, 960, 900, 440, k)} />
        <Shock t={t} hits={beats("S3")} cx={1020} cy={360} rx={300} ry={200} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S4: extreme close up on the glasses, shock marks on the beat. */
export const Eyes: React.FC = () => {
  const { t } = useT();
  const e = el("S4", "face");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.0, easeOut));
  const hit = beats("S4").reduce((m, h) => (t >= h ? Math.max(m, Math.exp(-(t - h) / 0.12)) : m), 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <Pic name="front-head" style={place("front-head", 1242, 905, 960, 470, k * (1 + 0.025 * hit))} />
        <Shock t={t} hits={beats("S4")} cx={960} cy={420} rx={840} ry={300} len={60} w={8} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S5: ink glugs into the lenses, a glint crosses, then the camera dives into the left lens. */
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
  const box = place("front-head", fx, fy, 960, 470, k);
  const level = lerp(760, 1000, pour);
  const wave = (x: number) => Math.sin(x / 38 + t * 9) * 10 * (1 - pour) + Math.sin(x / 17 - t * 13) * 5 * (1 - pour);
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const x = 880 + i * 18;
    return `${x},${(level + wave(x)).toFixed(1)}`;
  });
  const gp = ramp(t, glint, glint + 0.45, easeOut);
  const mask: React.CSSProperties = { WebkitMaskImage: `url(${staticFile("lenses.png")})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile("lenses.png")})`, maskSize: "100% 100%" };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <div style={box}>
          <Pic name="front-head" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          <div style={{ position: "absolute", inset: 0, ...mask }}>
            <svg viewBox="0 0 2730 2800" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {[960, 1030, 1110, 1380, 1450, 1520].map((x, i) => (
                <rect key={i} x={x - 9} y={0} width={18} height={level + 40 + 50 * rnd(i) * (1 - pour)} rx={9} fill={C.ink} opacity={pour > 0 ? 1 : 0} />
              ))}
              <polygon points={`880,0 1620,0 ${pts.slice().reverse().join(" ")}`} fill={C.ink} />
              {/* cartoon shine: two short pen ticks per lens */}
              {pour >= 0.999 && <path d="M 965 840 L 1010 822 M 975 880 L 995 872 M 1380 810 L 1425 792 M 1390 850 L 1410 842" stroke={C.paper} strokeWidth={14} strokeLinecap="round" fill="none" />}
              {gp > 0 && gp < 1 && <polygon points={`${lerp(700, 1700, gp)},700 ${lerp(760, 1760, gp)},700 ${lerp(620, 1620, gp)},1060 ${lerp(560, 1560, gp)},1060`} fill={C.paper} />}
            </svg>
          </div>
        </div>
        <Shock t={t} hits={beats("S5")} cx={960} cy={420} rx={760} ry={300} len={56} w={8} />
      </Boil>
      <AbsoluteFill style={{ background: C.ink, opacity: ramp(t, d1 - 0.15, d1) }} />
    </AbsoluteFill>
  );
};

/* S6: the ruled page wipes in diagonally over the black. */
export const Flash: React.FC = () => {
  const { t } = useT();
  const p = ramp(t, 0, 0.36, easeOut);
  const x = lerp(-500, 1920 + 900, p);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `polygon(0px 0px, ${x}px 0px, ${x - 420}px 936px, 0px 936px)` }}>
        <Page />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* S7: low angle on the sneakers in a burst, tilting up the body, then pulling back so the figure turns around into S8. */
export const LowAngle: React.FC = () => {
  const { f, t } = useT();
  const e = el("S7", "legs");
  const tilt = ramp(t, 0.15, 2.7);
  const back = ramp(t, 2.3, 3.0, easeInOut);
  const k = lerp(lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), tilt), 0.27, back);
  const fy = lerp(lerp(2560, 1300, tilt), 1430, back);
  const sy = lerp(520, 455, back);
  const s = shake(t, 4 * Math.exp(-t * 4));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <BurstLines f={f} cx={960} cy={sy + 40} r0={lerp(300, 330, back)} r1={1150} n={56} w={6} seed={3} />
        <Pic name="front" style={place("front", 767, fy, 960 + s.x, sy + s.y, k)} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S8: the whole figure from behind inside the burst. Starts where S7 ends, then drops out of frame into the fall. */
export const Stand: React.FC = () => {
  const { f, t } = useT();
  const e = el("S8", "figure");
  const k = lerp(e.v<number>("zoomFrom"), e.v<number>("zoomTo"), ramp(t, 0, 2.1, easeInOut));
  // a little hop, then the floor gives way and the figure drops out of the bottom of the frame
  const drop = -24 * Math.sin(Math.PI * ramp(t, 1.85, 2.05, (x) => x)) + 1000 * ramp(t, 2.05, 2.5, easeIn);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <BurstLines f={f} cx={960} cy={495} r0={330 * k / 0.27} r1={1150} n={56} w={6} seed={3} o={1 - ramp(t, 2.05, 2.3)} />
        <MotionLines t={t} n={8} seed={41} speed={2200} angle={-90} minLen={120} maxLen={360} o={ramp(t, 2.05, 2.15)} />
        <Pic name="back" style={place("back", 780, 1440, 960, 455 + drop, k)} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S10: the long fall. The page rules rush upward past the user's falling drawing while the user's waves scroll by
   below as one carousel layer; at the end the figure dives into the waves and the sea swallows the frame. */
export const Fall: React.FC = () => {
  const { f, t } = useT();
  const e = el("S10", "figure");
  const sea = el("S10", "waves");
  const [dive0, dive1] = sea.v<number[]>("dive").map((x) => x - 17);
  const surge0 = sea.v<number>("surge") - 17;
  const k = e.v<number>("zoom") * (1 + 0.03 * Math.sin(t * 0.9));
  const rot = 3 * Math.sin(t * 0.55) + 1.2 * Math.sin(t * 1.7) + 14 * ramp(t, dive0, dive1, easeInOut);
  const x = 960 + Math.sin(t * 0.4) * 60;
  const enter = ramp(t, 0, 0.5, easeOut);
  // the drop into the sea: eases in from the hover, eases out as he sinks below the crests
  const dive = ramp(t, dive0, dive1, easeInOut);
  // before the drop the camera lets him float up to the top third, so the drop reads top to bottom
  const hover = lerp(420, 300, ramp(t, dive0 - 1.8, dive0, easeInOut)) + Math.sin(t * 0.8) * 14 * (1 - dive);
  const y = lerp(lerp(-420, hover, enter), 960, dive);
  const full: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  const hits = beats("S10").filter((h) => h < dive0);
  // the sea rises into frame as the fall starts, and comes closer as he nears it
  const near = ramp(t, dive0 - 1.6, dive1, easeInOut);
  const h = sea.v<number>("height") * lerp(1, 1.3, near);
  const rise = 320 * (1 - ramp(t, 0.1, 0.9, easeOut));
  const frontTop = 936 - h + 34 + rise;
  const hitAt = sea.v<number>("splash") - 17; // when he reaches the front crests
  const wall = lerp(936 + 40, -340, ramp(t, surge0, surge0 + 0.5, easeInOut));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page scroll={t * 1400 * (1 - 0.6 * dive)} />
      <Boil>
        <MotionLines t={t} n={10} seed={31} speed={1900} angle={-90} minLen={120} maxLen={380} w={5} o={1 - dive} />
        <div style={{ ...place("fall", 687, 672, x, y, k), transform: `rotate(${rot}deg)` }}>
          <Pic name="fall-lines" style={{ ...full, filter: "brightness(0)" }} />
          <Pic name="fall" style={full} />
        </div>
        <WaveRow t={t} top={frontTop} h={h} speed={sea.v<number>("speed")} />
        <Shock t={t} hits={hits} cx={x} cy={y} rx={420} ry={330} n={12} len={52} w={7} />
        <Splash t={t - hitAt} x={x - 40} y={frontTop + h * 0.25} />
        <WaveWall t={t} top={wall} />
      </Boil>
    </AbsoluteFill>
  );
};

/* S11: lands facing us, ta-da, burst lines and doodles. */
export const Burst: React.FC = () => {
  const { f, t } = useT();
  const e = el("S11", "figure");
  const pop = ramp(t, 0.18, 0.4, backOut);
  const k = e.v<number>("zoom") * lerp(0.8, 1, pop) * lerp(1, 1.04, ramp(t, 0.25, 2));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Page />
      <Boil>
        <BurstLines f={f} cx={960} cy={450} r0={300} r1={1100} n={60} w={6} seed={77} grow={ramp(t, 0.15, 0.45, easeOut)} />
        <Doodles t={t - 0.2} cx={960} cy={450} />
        <Pic name="front" style={place("front", 767, 1430, 960, 450, k)} />
        <WaveWall t={t + 9} top={lerp(-340, 936 + 40, ramp(t, 0.04, 0.5, easeInOut))} />
      </Boil>
    </AbsoluteFill>
  );
};
