import reel from "../reel.json";

export { reel };
export const FPS = reel.fps;

type El = { id: string; t: number[]; props: Record<string, { v: unknown }> };
type Scene = { id: string; name: string; t: number[]; els: El[] };
const scenes = reel.scenes as unknown as Scene[];

export const sceneById = (id: string) => scenes.find((s) => s.id === id)!;
export const sceneFrames = (id: string) => {
  const s = sceneById(id);
  return { from: Math.round(s.t[0] * FPS), dur: Math.round((s.t[1] - s.t[0]) * FPS) };
};
// Every on screen value comes from reel.json, so Motion OS edits are "edit reel.json, re-render".
export function el(sceneId: string, elId: string) {
  const s = sceneById(sceneId);
  const e = s.els.find((x) => x.id === elId)!;
  return {
    t: e.t,
    // element start relative to its scene, in frames
    start: Math.round((e.t[0] - s.t[0]) * FPS),
    v: <T = string>(k: string) => e.props[k].v as T,
  };
}
