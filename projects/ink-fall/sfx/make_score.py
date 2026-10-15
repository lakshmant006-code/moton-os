"""Synthesize the soundtrack for Ink fall from reel.json (scene times + red wash hits).

Everything is generated here (no samples), so there is nothing to license.
Run from the project folder:  python3 sfx/make_score.py  ->  public/score.wav
Needs numpy and scipy.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
reel = json.loads((ROOT / "reel.json").read_text())
DUR = reel["duration"]
BEAT = 60 / reel["audio"]["bpm"]
N = int(DUR * SR)
rng = np.random.default_rng(11)
scene = {s["id"]: s["t"] for s in reel["scenes"]}
hits = sorted(h for s in reel["scenes"] for e in s["els"] if e["id"] == "red" for h in e["props"]["at"]["v"])

L = np.zeros(N)
R = np.zeros(N)
VERB = np.zeros(N)  # send bus into the hall


def ta(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-t / d)


def put(x, at, gain=1.0, pan=0.0, verb=0.0):
    i = int(at * SR)
    if i >= N or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    x = x[: N - i]
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    L[i : i + len(x)] += x * gl
    R[i : i + len(x)] += x * gr
    VERB[i : i + len(x)] += x * gain * verb


def saw(f, t):
    ph = np.cumsum(np.broadcast_to(f, t.shape)) / SR
    return 2 * (ph % 1) - 1


# ---- instruments -------------------------------------------------------------

def kick(big=1.0):
    t = ta(0.5)
    f = 45 + 140 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.16 * big)
    click = hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0005, 0.004)
    return np.tanh(1.6 * (body + 0.25 * click))


def clap():
    n = rng.standard_normal(int(0.3 * SR))
    e = np.zeros(len(n))
    for k, o in enumerate([0, 0.011, 0.022]):
        e += np.roll(env(len(n), 0.0005, 0.008 if k < 2 else 0.09), int(o * SR))
    return bp(n, 900, 5000) * e


def hat(open_=False):
    d = 0.25 if open_ else 0.05
    n = rng.standard_normal(int(d * SR))
    return hp(n, 7000) * env(len(n), 0.0005, 0.08 if open_ else 0.014)


def boom(d=2.5):
    t = ta(d)
    f = 32 + 60 * np.exp(-t / 0.12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, d * 0.35)
    crack = lp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.001, 0.09)
    return np.tanh(1.3 * (sub + 0.6 * crack))


def crash(d=3.0):
    n = rng.standard_normal(int(d * SR))
    return hp(n, 3500) * env(len(n), 0.002, d * 0.3)


def whoosh(d=0.45, up=True):
    n = rng.standard_normal(int(d * SR))
    p = np.linspace(0, 1, len(n))
    a = np.sin(np.pi * p) ** 2
    lo = lp(n, 900) * a
    hi = hp(n, 2500) * a * (p if up else 1 - p)
    return lo * 0.7 + hi * 0.5


def riser(d):
    t = ta(d)
    p = t / d
    n = rng.standard_normal(len(t))
    noise = sum(bp(n[i::1], 300 + 5000 * q, 600 + 7000 * q) for i, q in [(0, 0.2), (0, 0.6)]) * 0.5
    noise = noise * p**2
    tone = saw(110 * 2 ** (p * 2.5), t) * 0.15 * p**1.5
    return lp(noise, 9000) + lp(tone, 4000)


def pluck(f, d=0.35):
    t = ta(d)
    x = saw(f, t) + 0.5 * saw(f * 1.005, t)
    return lp(x, 2600) * env(len(t), 0.002, 0.12)


def pad(freqs, d, cutoff=1400):
    t = ta(d)
    x = sum(saw(f * dt, t) for f in freqs for dt in (0.996, 1.0, 1.004))
    a = np.clip(t / 0.6, 0, 1) * np.clip((d - t) / 0.8, 0, 1)
    return lp(x, cutoff, 4) * a / (len(freqs) * 3)


def bass(f, d):
    t = ta(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * saw(f, t)
    return lp(x, 400) * env(len(t), 0.004, d * 0.6)


def ting(f=2637):
    t = ta(1.4)
    x = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in [(1, 1), (2.76, 0.4), (5.4, 0.2)])
    return x * env(len(t), 0.001, 0.35)


def pour(d):
    n = rng.standard_normal(int(d * SR))
    t = np.arange(len(n)) / SR
    wob = 500 + 380 * np.sin(2 * np.pi * 7 * t) * np.exp(-t)
    x = np.zeros(len(n))
    for i in range(0, len(n), 480):  # time varying lowpass in 10 ms blocks
        x[i : i + 480] = bp(n[i : i + 480], 80, max(200, wob[i]))
    return x * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.2, 0, 1)


def brush():
    d = 0.18
    n = rng.standard_normal(int(d * SR))
    p = np.linspace(0, 1, len(n))
    return bp(n, 1500, 6500) * np.sin(np.pi * p) ** 1.5


def wind(d):
    n = rng.standard_normal(int(d * SR))
    t = np.arange(len(n)) / SR
    a = np.clip(t / 1.2, 0, 1) * np.clip((d - t) / 1.0, 0, 1)
    return (bp(n, 250, 900) * 0.8 + bp(n, 1800, 4200) * 0.25 * (0.6 + 0.4 * np.sin(t * 1.3))) * a


D2, F2, A2, C3 = 73.42, 87.31, 110.0, 130.81
Dm = [146.83, 174.61, 220.0]
Bb = [116.54, 146.83, 174.61]
F = [174.61, 220.0, 261.63]
Cc = [130.81, 164.81, 196.0]

# ---- arrangement ------------------------------------------------------------

def beats(a, b, step=BEAT):
    x = a
    while x < b - 1e-6:
        yield x
        x += step

s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11 = (scene[f"S{i}"] for i in range(1, 12))

# Ink storm opening: low drone, pulse and brush strokes
put(pad([D2 / 2, D2, A2 / 2], s5[1], cutoff=420), 0, 0.9)
for b in beats(0, s6[0]):
    put(kick(0.8), b, 0.75)
for b in beats(0, s6[0], BEAT / 2):
    put(hat(), b + BEAT / 4, 0.12, pan=0.3)
for i, b in enumerate(beats(0, s5[0], BEAT / 2)):
    put(brush(), b + rng.uniform(0, 0.1), 0.22, pan=rng.uniform(-0.8, 0.8))
for b in beats(s1[0], s3[1], BEAT * 2):
    put(bass(D2, BEAT * 1.6), b, 0.5)

# Cuts and pushes
for c in [s2[0], s3[0], s4[0], s5[0]]:
    put(whoosh(0.4), c - 0.2, 0.45, verb=0.2)
put(riser(s2[1] - s2[0] - 0.1), s2[0] + 0.1, 0.3)
put(boom(1.2), s3[0], 0.5, verb=0.3)

# Eyes: heartbeat
for b in beats(s4[0], s5[1], BEAT):
    put(kick(0.6), b + 0.16, 0.35)
for b in beats(s4[0], s6[0], BEAT / 4):
    put(hat(), b, 0.07, pan=-0.3)
put(pad(Dm, s5[1] - s4[0], cutoff=900), s4[0], 0.5)

# Shades: ink pour, glint, dive
sh = next(e for e in reel["scenes"][4]["els"] if e["id"] == "face")["props"]
p0, p1 = sh["pour"]["v"]
put(pour(p1 - p0 + 0.3), p0, 0.9, verb=0.15)
put(ting(), sh["glint"]["v"], 0.18, pan=0.4, verb=0.6)
d0, d1 = sh["dive"]["v"]
put(riser(d1 - d0 + 0.6), d0 - 0.6, 0.55)
for i, b in enumerate(beats(d0 - 0.5, d1, BEAT / 4)):
    put(clap() * 0.5, b, 0.12 + 0.03 * i, verb=0.2)

# Flash and drop
put(crash(2.5), s6[0], 0.25, verb=0.5)
put(whoosh(0.5), s6[0] - 0.1, 0.6)
put(boom(3.0), s7[0], 0.75, verb=0.6)
put(crash(3.5), s7[0], 0.3, verb=0.4)

# Low angle and stand: the groove
prog = [(D2, Dm), (D2 * 0.794, Bb), (F2, F), (C3 / 2, Cc)]
for b in beats(s7[0], s9[0]):
    put(kick(), b, 0.85)
    if round((b - s7[0]) / BEAT) % 2 == 1:
        put(clap(), b, 0.35, verb=0.25)
for b in beats(s7[0], s9[0], BEAT / 2):
    put(hat(open_=round((b - s7[0]) / (BEAT / 2)) % 2 == 1), b, 0.12, pan=0.25)
for i, b in enumerate(beats(s7[0], s9[0], BEAT * 2)):
    root, chord = prog[i % 4]
    for k, bb in enumerate(beats(b, b + BEAT * 2, BEAT / 2)):
        put(bass(root, BEAT / 2), bb, 0.6)
    put(pad(chord, BEAT * 2 + 0.3, cutoff=1800), b, 0.4)
    for k, bb in enumerate(beats(b, b + BEAT * 2, BEAT / 4)):
        f = chord[k % 3] * (2 if k % 8 > 3 else 1)
        put(pluck(f), bb, 0.13, pan=0.5 * np.sin(k), verb=0.3)
put(whoosh(0.5), s8[0] - 0.25, 0.4, verb=0.3)

# Glow walk: hush
put(boom(2.0), s9[0], 0.7, verb=0.6)
put(crash(2.5), s9[0], 0.15, verb=0.6)
put(pad(Dm + [293.66], s9[1] - s9[0] + 0.5, cutoff=1200), s9[0], 0.55, verb=0.4)
for b in beats(s9[0], s10[0], BEAT * 2):
    put(kick(0.7), b, 0.45)
for b in beats(s9[0], s10[0], BEAT):
    put(ting(1760 if int(b * 2) % 4 else 2349), b + 0.25, 0.05, pan=rng.uniform(-0.6, 0.6), verb=0.8)

# The fall: wind, wide pads, booms on the red hits
put(whoosh(0.8), s10[0] - 0.3, 0.5, verb=0.4)
put(wind(s10[1] - s10[0] + 0.5), s10[0], 0.8, verb=0.2)
for i, b in enumerate(beats(s10[0], s10[1], BEAT * 4)):
    root, chord = prog[i % 4]
    put(pad(chord + [chord[0] * 2], BEAT * 4 + 0.6, cutoff=1500), b, 0.75, verb=0.5)
    put(bass(root / 2, BEAT * 3.5), b, 0.45)
for h in hits:
    if s10[0] <= h < s10[1]:
        put(boom(1.6), h, 0.55, verb=0.5)
put(riser(1.6), s11[0] - 1.6, 0.7)
for i, b in enumerate(beats(s11[0] - 1.0, s11[0], BEAT / 4)):
    put(kick(0.5), b, 0.2 + 0.07 * i)

# Burst
put(boom(3.5), s11[0], 1.25, verb=0.7)
put(crash(3.5), s11[0], 0.35, verb=0.5)
put(ting(2637), s11[0] + 0.05, 0.12, verb=0.9)
put(ting(3520), s11[0] + 0.12, 0.08, pan=0.5, verb=0.9)
for k in range(24):
    put(brush(), s11[0] + rng.uniform(0, 0.6), 0.25, pan=rng.uniform(-1, 1), verb=0.3)
put(pad([D2, A2, 146.83, 220.0], s11[1] - s11[0], cutoff=900), s11[0], 0.5, verb=0.6)

# Red washes elsewhere get a soft hit
for h in hits:
    if h < s10[0] and all(abs(h - c) > 0.1 for c in [s7[0], s9[0]]):
        put(boom(0.8), h, 0.3, verb=0.3)

# ---- mix --------------------------------------------------------------------
ir_t = ta(2.6)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.55)
ir = lp(ir, 5000)
ir /= np.sqrt(np.sum(ir**2))
wet = fftconvolve(VERB, ir)[:N] * 0.6
wl, wr = wet, np.roll(wet, int(0.013 * SR))
L += wl
R += wr
fade = np.clip((DUR - np.arange(N) / SR) / 0.5, 0, 1)
L, R = hp(L * fade, 25), hp(R * fade, 25)
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(L / peak * 1.4) * 0.89, np.tanh(R / peak * 1.4) * 0.89
out = np.stack([L, R], 1)
with wave.open(str(ROOT / "public" / "score.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("score.wav", round(DUR, 2), "s,", len(hits), "red hits")
