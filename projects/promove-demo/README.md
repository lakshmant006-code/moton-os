# ProMove demo video

A walkthrough of pro-move, the motion add-on for Procreate (the Motion Rig prototype in `Kalyan0025/pro-move`), built in Remotion and
reviewed in the Motion OS player. Its structure follows a design-competition walkthrough: a chapter label, a text
column on the left, a card on the right, a question card to open, option cards, and a speed pill on sped-up
screen recordings. The look is ProMove's own: a warm paper background, white cards, and accents taken from the
character and the playground art (beanie red, Procreate blue, sun yellow, playground green, navy).

Every on-screen word, color and timing is in `reel.json`, so most changes are "edit reel.json, re-render".

## Scenes

| # | Time | Beat |
|---|---|---|
| S0 | 0–3.6 s | Logo intro: pro-move by procreate |
| S1 | 3.6–7.8 s | Question card: what if your drawing could move the moment you do? |
| S2 | 7.8–15.8 s | Why: 24 drawings for one second of animation |
| S3 | 15.8–26.2 s | How it works: camera → body, face, smoothing → rigged drawing |
| S4 | 26.2–33.6 s | A Procreate add-on: Actions › Rig tab (real screen) |
| S5 | 33.6–39.1 s | Live capture with the demo performer (real footage) |
| S6 | 39.1–44.1 s | Two ways to capture: Pose and Motion cards |
| S7 | 44.1–49.1 s | Pose countdown (real footage) |
| S8 | 49.1–55.1 s | Motion take lands in the filmstrip (real footage, 1.25x) |
| S9 | 55.1–61.6 s | Tap a limb: Turn, then Stretch (real footage, zoomed) |
| S10 | 61.6–66.9 s | Feel: Snappy, Smooth, Floaty, with animated curves |
| S11 | 66.9–73.3 s | Rig check: six poses, local AI joint fixes |
| S12 | 73.3–78.5 s | Export: Procreate, motion tools, sprite sheet and video, AI pack |
| S13 | 78.5–83.5 s | Logo outro: pro-move by procreate. Imagination in motion. |

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
