import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT, lerp, ramp } from "./ui";

// The Gomma pinwheel mark, as drawn on the app's camera button (pro-move public/index.html).
const PETAL = "M0 0 C-3 -16 -4 -34 -10 -47 C2 -40 12 -26 7 -10 C5 -5 2 -2 0 0Z";
const DASH = "M-25.0 0H25.0";

export const Pinwheel: React.FC<{ size: number; color?: string; petals?: number; dashes?: number; spin?: number }> = ({ size, color = "#111", petals = 1, dashes = 1, spin = 0 }) => (
  <svg width={size} height={size} viewBox="-76 -76 152 152" style={{ overflow: "visible" }}>
    <g transform={`rotate(${spin})`}>
      <g fill={color}>
        {Array.from({ length: 8 }).map((_, i) => {
          const t = Math.max(0, Math.min(1, petals * 8 - i));
          return <path key={i} d={PETAL} transform={`rotate(${i * 45}) scale(${t})`} opacity={t} />;
        })}
      </g>
      <g fill="none" stroke={color} strokeWidth={6.5} strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const t = Math.max(0, Math.min(1, dashes * 8 - i));
          return <path key={i} d={DASH} transform={`rotate(${-25 + i * 45}) translate(0 ${-60 - (1 - t) * 30}) rotate(18)`} opacity={t} />;
        })}
      </g>
    </g>
  </svg>
);

// "pro-move / by procreate" lockup, black on white. The mark spins in petal by petal, the name types on,
// then "by procreate" rises in under it.
export const Logo: React.FC<{ at: number; name?: string; by?: string; scale?: number; color?: string }> = ({ at, name = "pro-move", by = "by procreate", scale = 1, color = "#111" }) => {
  const f = useCurrentFrame() - at;
  const petals = ramp(f, 0, 18);
  const dashes = ramp(f, 8, 28);
  const settle = ramp(f, 0, 40);
  const spin = lerp(-200, 0, settle);
  const shown = Math.floor(ramp(f, 16, 34, (x) => x) * name.length + 0.0001);
  const byT = ramp(f, 34, 50);
  const caret = f > 14 && f < 44 && Math.floor(f / 6) % 2 === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontFamily: FONT, color, transform: `scale(${scale})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `scale(${lerp(0.6, 1, settle)})` }}>
          <Pinwheel size={150} color={color} petals={petals} dashes={dashes} spin={spin} />
        </div>
        <div style={{ fontSize: 190, fontWeight: 400, letterSpacing: -2, lineHeight: 1, minWidth: 720, position: "relative", top: -12 }}>
          {name.slice(0, shown)}
          <span style={{ opacity: caret ? 1 : 0, fontWeight: 300 }}>|</span>
        </div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 400, marginTop: 6, marginRight: 10, opacity: byT, transform: `translateY(${(1 - byT) * 16}px)`, filter: byT < 1 ? `blur(${(1 - byT) * 6}px)` : undefined }}>
        {by}
      </div>
    </div>
  );
};
