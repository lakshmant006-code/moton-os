"""Synthesize a calm music bed for the demo: a warm pad, a soft pluck arpeggio and a sub.

Everything is generated here (no samples), so there is nothing to license.
Run from the project folder:  python3 sfx/make_music.py  ->  public/music.wav
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
reel = json.loads((ROOT / "reel.json").read_text())
DUR = reel["duration"] + 1.0
BPM = reel["audio"]["bpm"]
BEAT = 60 / BPM
BAR = BEAT * 4
N = int(DUR * SR)
t = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# Fmaj9, Am7, Dm9, Bbmaj7 (two bars each), voiced low and open.
CHORDS = [
    [41, 53, 57, 60, 64, 67],
    [45, 52, 57, 60, 64, 67],
    [38, 50, 57, 60, 64, 65],
    [34, 50, 53, 57, 62, 65],
]


def lowpass(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


pad = np.zeros((N, 2))
sub = np.zeros(N)
seg = 2 * BAR
for ci in range(int(DUR / seg) + 1):
    notes = CHORDS[ci % len(CHORDS)]
    s = int(ci * seg * SR)
    e = min(N, int((ci + 1) * seg * SR + 1.5 * SR))
    if s >= N:
        break
    tt = np.arange(e - s) / SR
    env = np.minimum(1, tt / 1.6) * np.exp(-np.maximum(0, tt - seg) / 0.7)
    for k, n in enumerate(notes[1:]):
        f = midi(n)
        for side, det in ((0, -0.08), (1, 0.08)):
            ph = 2 * np.pi * f * (1 + det / 100) * tt
            tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
            pad[s:e, side] += 0.06 * tone * env * (1 - 0.08 * k)
    sub[s:e] += 0.16 * np.sin(2 * np.pi * midi(notes[0]) * tt) * env

# Pluck arpeggio on eighths, entering after the opening question and dropping out for the end card.
pl = np.zeros(N)
eighth = BEAT / 2
pattern = [3, 4, 5, 4, 2, 4, 3, 5]
start, stop = 5.0, reel["duration"] - 4.5
i = 0
while True:
    at = start + i * eighth
    if at > stop:
        break
    chord = CHORDS[int(at / seg) % len(CHORDS)]
    n = chord[pattern[i % len(pattern)]] + 12
    s = int(at * SR)
    ln = int(0.9 * SR)
    e = min(N, s + ln)
    tt = np.arange(e - s) / SR
    f = midi(n)
    x = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.004)
    accent = 1.0 if i % 4 == 0 else 0.7
    pl[s:e] += 0.07 * accent * x
    i += 1

pl = lowpass(pl, 3200)
# simple stereo echo for the plucks
d = int(eighth * 1.5 * SR)
L = pl.copy()
R = np.zeros(N)
R[d:] += pl[:-d] * 0.55
L[2 * d:] += pl[:-2 * d] * 0.3

mix = pad.copy()
mix[:, 0] += L + sub
mix[:, 1] += R + pl * 0.6 + sub
fade = np.minimum(1, t / 2.0) * np.minimum(1, (DUR - t) / 3.0)
mix *= fade[:, None]
# duck the bed under each narration line so the voice sits clearly on top
duck = reel["audio"].get("duck")
if duck:
    g = np.ones(N)
    r = duck.get("ramp", 0.3)
    for ln in reel["audio"].get("voLines", []):
        a, b = ln["at"], ln["at"] + ln["to"] - ln["from"]
        g = np.minimum(g, np.interp(t, [a - r, a, b, b + r], [1, duck["under_vo"], duck["under_vo"], 1], left=1, right=1))
    mix *= g[:, None]
mix = np.tanh(mix * 1.1)
mix = mix / np.max(np.abs(mix)) * 0.7
out = ROOT / "public" / "music.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {out}, {DUR:.1f}s")
