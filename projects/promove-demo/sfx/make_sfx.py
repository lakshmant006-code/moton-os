"""Synthesize the sound effects track from reel.json's audio.sfxCues.

Every sound is generated here (no samples), so there is nothing to license.
Run from the project folder:  python3 sfx/make_sfx.py  ->  public/sfx.wav
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, attack=0.002, decay=0.1):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def onepole(x, cutoff):
    """Lowpass with a cutoff that can change per sample (array or scalar, in Hz)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - onepole(x, cutoff)


def band(x, lo, hi):
    return onepole(highpass(x, lo), hi)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


# ---- sound designs ---------------------------------------------------------

def ding(freq=1318, **_):
    t = t_axis(0.9)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) + 0.12 * np.sin(2 * np.pi * freq * 3.0 * t)
    return norm(x * env(len(t), 0.003, 0.28))


def chime(**_):
    t = t_axis(1.6)
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1046.5, 1), (1318.5, 0.7), (1568, 0.6), (2093, 0.25)])
    return norm(x * env(len(t), 0.01, 0.5))


def click(**_):
    n = noise(0.025)
    x = band(n, 2000, 7000) * env(len(n), 0.0005, 0.004)
    t = t_axis(0.025)
    x += 0.4 * np.sin(2 * np.pi * 1800 * t) * env(len(t), 0.0005, 0.006)
    return norm(x)


def tick(freq=1000, **_):
    t = t_axis(0.06)
    x = np.sin(2 * np.pi * freq * t) * env(len(t), 0.0008, 0.018)
    x += 0.5 * band(noise(0.06), 3000, 9000) * env(len(t), 0.0003, 0.003)
    return norm(x)


def key(**_):
    d = 0.05
    n = noise(d)
    clack = band(n, 1800, 6000) * env(len(n), 0.0004, 0.006 + rng.uniform(0, 0.004))
    t = t_axis(d)
    thock = np.sin(2 * np.pi * rng.uniform(170, 230) * t) * env(len(t), 0.001, 0.012)
    return norm(clack + 0.6 * thock, rng.uniform(0.7, 1.0))


def space(**_):
    d = 0.08
    t = t_axis(d)
    thock = np.sin(2 * np.pi * 140 * t) * env(len(t), 0.001, 0.02)
    clack = band(noise(d), 900, 4000) * env(len(t), 0.0005, 0.01)
    return norm(clack + thock)


def pop(freq=500, **_):
    t = t_axis(0.16)
    f = freq * (1 + 0.9 * np.exp(-t / 0.018))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.045)
    return norm(x)


def thud(**_):
    t = t_axis(0.22)
    f = 70 + 60 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.07)
    paper = band(noise(0.22), 300, 2500) * env(len(t), 0.0008, 0.02)
    return norm(body + 0.5 * paper)


def whoosh(dur=0.4, **_):
    n = noise(dur)
    p = np.linspace(0, 1, len(n))
    cutoff = 400 + 5000 * np.sin(np.pi * p) ** 2
    x = onepole(highpass(n, 150), cutoff) * np.sin(np.pi * p) ** 1.5
    return norm(x)


def air(dur=1.0, **_):
    n = noise(dur)
    p = np.linspace(0, 1, len(n))
    x = onepole(highpass(n, 200), 900 + 1600 * p) * (np.sin(np.pi * p) ** 2)
    return norm(x)


def swish(**_):
    d = 0.18
    n = noise(d)
    p = np.linspace(0, 1, len(n))
    x = onepole(highpass(n, 1500), 3000 + 6000 * p) * np.sin(np.pi * p) ** 2
    return norm(x)


def flip(**_):
    a = swish()
    b = swish()[: int(0.12 * SR)]
    x = np.zeros(int(0.3 * SR))
    x[: len(a)] += a
    x[int(0.09 * SR): int(0.09 * SR) + len(b)] += 0.6 * b
    tap = thud()[: int(0.12 * SR)] * 0.5
    x[int(0.16 * SR): int(0.16 * SR) + len(tap)] += tap
    return norm(x)


def send(**_):
    d = 0.22
    t = t_axis(d)
    f = 600 + 900 * (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.07)
    air_ = np.zeros(len(t))
    sw = swish()[: len(t)]
    air_[: len(sw)] = sw
    return norm(0.6 * tone + 0.5 * air_)


def bonk(**_):
    out = []
    for f, d in [(392, 0.11), (311, 0.2)]:
        t = t_axis(d)
        sq = np.tanh(3 * np.sin(2 * np.pi * f * t))
        out.append(onepole(sq, 2200) * env(len(t), 0.002, d * 0.6))
    return norm(np.concatenate(out))


def riser(dur=0.5, **_):
    t = t_axis(dur)
    f = 300 + 700 * (t / dur) ** 1.5
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(t / dur, 0, 1) * (1 - np.clip((t - dur * 0.85) / (dur * 0.15), 0, 1))
    return norm(x)


def zip_(dur=0.8, **_):
    n = noise(dur)
    p = np.linspace(0, 1, len(n))
    x = band(n, 1200, 1500 + 6000 * p) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 14 * p * dur))) * np.sin(np.pi * p)
    return norm(x)


def shimmer(dur=1.2, **_):
    out = np.zeros(int(dur * SR) + SR)
    for i in range(14):
        f = rng.choice([1568, 1760, 2093, 2349, 2637, 3136])
        g = ding(f) * rng.uniform(0.15, 0.4)
        s = int(rng.uniform(0, dur) * SR)
        out[s: s + len(g)] += g[: len(out) - s]
    return norm(out[: int(dur * SR) + SR // 2])


# ---- index card sounds (the flashcard scene) --------------------------------

def paper(dur, lo=1500, hi=7000):
    """Paper texture: band limited noise with a fast random grain, like fibers rubbing."""
    n = band(noise(dur), lo, hi)
    grain = onepole(np.abs(noise(dur)), 300)
    return n * (0.35 + grain / (np.max(grain) or 1))


def cardslide(**_):
    d = 0.32
    p = np.linspace(0, 1, int(d * SR))
    x = onepole(paper(d, 800, 9000), 7000 - 5000 * p)
    shape = np.clip(p / 0.15, 0, 1) * (1 - np.clip((p - 0.55) / 0.45, 0, 1)) ** 1.5
    return norm(x * shape)


def cardtap(**_):
    d = 0.09
    t = t_axis(d)
    body = np.sin(2 * np.pi * np.cumsum(170 + 90 * np.exp(-t / 0.01)) / SR) * env(len(t), 0.0008, 0.018)
    click = band(noise(d), 2500, 8000) * env(len(t), 0.0003, 0.0035)
    return norm(0.8 * body + 0.6 * click)


def cardflip(**_):
    d = 0.34
    out = np.zeros(int(d * SR))
    # lift: rising air as the card leaves the deck
    a = paper(0.12, 1200, 6000)
    pa = np.linspace(0, 1, len(a))
    a = onepole(a, 2000 + 6000 * pa) * np.sin(np.pi * pa) ** 2
    out[: len(a)] += 0.7 * a
    # turn: quicker falling air
    b = paper(0.09, 1500, 8000)
    pb = np.linspace(0, 1, len(b))
    b = onepole(b, 9000 - 6000 * pb) * np.sin(np.pi * pb) ** 2
    s = int(0.1 * SR)
    out[s: s + len(b)] += 0.6 * b
    # snap: the card's edge as it lands face up, then a soft tap
    sn = band(noise(0.03), 3000, 10000) * env(int(0.03 * SR), 0.0002, 0.003)
    s = int(0.25 * SR)
    out[s: s + len(sn)] += 0.9 * sn
    tp = cardtap() * 0.6
    s = int(0.255 * SR)
    out[s: s + len(tp)] += tp[: len(out) - s]
    return norm(out)


def reveal(**_):
    """Soft marimba style up interval for a correct answer."""
    out = np.zeros(int(0.7 * SR))
    for i, f in enumerate([1318.5, 1975.5]):
        t = t_axis(0.5)
        tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / 0.02)
        tone *= env(len(t), 0.002, 0.16)
        s = int(i * 0.085 * SR)
        out[s: s + len(tone)] += tone[: len(out) - s]
    return norm(out)


def soft(**_):
    """A small felt tap for a card settling: a low, quickly damped tone with a hint of texture. No sweep."""
    t = t_axis(0.09)
    tone = np.sin(2 * np.pi * 330 * t) * env(len(t), 0.002, 0.03)
    tex = onepole(highpass(noise(0.09), 900), 2600) * env(len(t), 0.001, 0.012)
    return norm(onepole(tone + 0.25 * tex, 2400))


def chip(**_):
    t = t_axis(0.1)
    tick = np.sin(2 * np.pi * 2400 * t) * env(len(t), 0.0005, 0.01)
    body = pop(760)[: len(t)]
    x = np.zeros(len(t))
    x[: len(body)] += 0.6 * body
    return norm(0.7 * tick + x)


KINDS = {"soft": soft, "cardslide": cardslide, "cardtap": cardtap, "cardflip": cardflip, "reveal": reveal, "chip": chip,
         "ding": ding, "chime": chime, "click": click, "tick": tick, "key": key, "space": space, "pop": pop, "thud": thud,
         "whoosh": whoosh, "air": air, "swish": swish, "flip": flip, "send": send, "bonk": bonk, "riser": riser,
         "zip": zip_, "shimmer": shimmer}


def main():
    reel = json.loads((ROOT / "reel.json").read_text())
    total = int((reel["duration"] + 0.5) * SR)
    mix = np.zeros((total, 2))
    for c in reel["audio"]["sfxCues"]:
        x = KINDS[c["kind"]](**c) * c.get("gain", 0.5)
        s = int(c["t"] * SR)
        e = min(total, s + len(x))
        pan = c.get("pan", rng.uniform(-0.15, 0.15))
        mix[s:e, 0] += x[: e - s] * (1 - max(0, pan))
        mix[s:e, 1] += x[: e - s] * (1 + min(0, pan))
    mix = np.tanh(mix * 0.9) / np.tanh(0.9)  # gentle safety clip
    mix = mix[: int(reel["duration"] * SR)]
    out = ROOT / "public" / "sfx.wav"
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767 * 0.95).astype("<i2").tobytes())
    print(f"wrote {out} with {len(reel['audio']['sfxCues'])} cues, peak {np.max(np.abs(mix)):.2f}")


if __name__ == "__main__":
    main()
