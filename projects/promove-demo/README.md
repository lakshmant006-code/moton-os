# ProMove demo video

An 80-second walkthrough of ProMove (the Motion Rig prototype in `Kalyan0025/pro-move`), built in Remotion and
reviewed in the Motion OS player. Its structure follows a design-competition walkthrough: a chapter label, a text
column on the left, a card on the right, a question card to open, option cards, and a speed pill on sped-up
screen recordings. The look is ProMove's own: a warm paper background, white cards, and accents taken from the
character and the playground art (beanie red, Procreate blue, sun yellow, playground green, navy).

Every on-screen word, color and timing is in `reel.json`, so most changes are "edit reel.json, re-render".

## Scenes

| # | Time | Beat |
|---|---|---|
| S1 | 0–5 s | Question card: what if your drawing could move the moment you do? |
| S2 | 5–11.5 s | Why: 24 drawings for one second of animation |
| S3 | 11.5–20 s | How it works: camera → body, face, smoothing → rigged drawing |
| S4 | 20–26 s | Built like Procreate: Actions › Rig tab (real screen) |
| S5 | 26–33 s | Live capture with the demo performer (real footage) |
| S6 | 33–38.5 s | Two ways to capture: Pose and Motion cards |
| S7 | 38.5–43.5 s | Pose countdown (real footage) |
| S8 | 43.5–50.5 s | Motion take lands in the filmstrip (real footage, 1.25x) |
| S9 | 50.5–57 s | Tap a limb: Turn, then Stretch (real footage, zoomed) |
| S10 | 57–62.5 s | Feel: Snappy, Smooth, Floaty, with animated curves |
| S11 | 62.5–69 s | Rig check: six poses, local AI joint fixes |
| S12 | 69–75 s | Export: Procreate, motion tools, sprite sheet and video, AI pack |
| S13 | 75–80 s | End card: ProMove. Draw it once. Perform it forever. |

## Render

```bash
npm install
python3 sfx/make_music.py   # public/music.wav (synthesized bed)
python3 sfx/make_sfx.py     # public/sfx.wav from reel.json audio.sfxCues
npm run render              # video.mp4
```

Then open it in the player: `node ../../player/serve.mjs .`

## Footage

The screens and clips in `public/` are captured from the real app, not mocked up. With the pro-move server on
`localhost:5173` and Playwright installed:

- `tools/capture/recAll.mjs <outDir>`: live demo, pose countdown, motion take, rig turn and stretch.
  `slow.mjs` slows the page's clocks to 1/4 speed and records in real time, so a software-rendered
  (no GPU) browser still gives about 40 fps once played back at normal speed.
- `tools/capture/recMotion.mjs`: the motion take on its own, in a fresh session.
- `tools/capture/panels.mjs`: stills of Actions › Rig, Layers and the rig check card.
- `tools/capture/poses2.mjs` and `cutout.py`: the character in test poses, cut out of a white canvas.

All sound is synthesized in `sfx/`, so there is nothing to license.
