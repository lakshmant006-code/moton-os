"""Cut the user's drawings into the layers the video uses (run from the project folder: python3 tools/prep_art.py).

assets/character-sheet.png -> public/front|side|back(.png, -sil.png) at 2x, plus -head close up crops at 7x
assets/falling.png         -> public/fall.png, fall-sil.png
assets/waves.png           -> public/waves.png (seamless horizontal loop, black on transparent)
                              public/lenses.png (glasses lens mask for the ink pour)
Line art keeps its ink, the outside goes transparent; -sil is the solid white shape for the glow.
Needs numpy, pillow, scipy.
"""
from collections import deque
from scipy import ndimage
import sys
import numpy as np
from PIL import Image, ImageFilter

P = sys.argv[1] if len(sys.argv) > 1 else "."
A = f"{P}/assets"; O = f"{P}/public"

def load(path):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]) * (a[..., 3] / 255) + 255 * (1 - a[..., 3] / 255)
    return lum

def figure_mask(lum, close=4):
    """Inside of the drawing: everything not reachable from the border through white."""
    dark = lum < 140
    walls = np.asarray(Image.fromarray((dark * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * close + 1))) > 0
    open_ = ~walls
    bg = np.zeros_like(open_)
    bg[0, :] = open_[0, :]; bg[-1, :] = open_[-1, :]; bg[:, 0] = open_[:, 0]; bg[:, -1] = open_[:, -1]
    while True:
        g = bg.copy()
        g[1:, :] |= bg[:-1, :]; g[:-1, :] |= bg[1:, :]; g[:, 1:] |= bg[:, :-1]; g[:, :-1] |= bg[:, 1:]
        g &= open_
        if (g == bg).all():
            break
        bg = g
    # shrink back by the wall thickness so the silhouette hugs the ink line
    fig = ~bg
    fig = np.asarray(Image.fromarray((fig * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(2 * close - 1))) > 0
    return fig | dark

def save_pair(lum, mask, box, name, pad=24):
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(lum.shape[1], x1 + pad), min(lum.shape[0], y1 + pad)
    l, m = lum[y0:y1, x0:x1], mask[y0:y1, x0:x1]
    ink = np.where(l < 140, 0, 255).astype(np.uint8)
    rgba = np.dstack([ink, ink, ink, (m * 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(f"{O}/{name}.png")
    sil = np.dstack([np.full_like(ink, 255)] * 3 + [(m * 255).astype(np.uint8)])
    Image.fromarray(sil, "RGBA").save(f"{O}/{name}-sil.png")
    print(name, rgba.shape[1], "x", rgba.shape[0])

def boxes(mask, min_gap=40):
    cols = mask.any(axis=0)
    runs, start = [], None
    for x, c in enumerate(cols):
        if c and start is None: start = x
        if not c and start is not None:
            runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < min_gap: merged[-1][1] = r[1]
        else: merged.append(r)
    out = []
    for a, b in merged:
        if b - a < 60: continue
        rows = np.where(mask[:, a:b].any(axis=1))[0]
        out.append((a, rows[0], b, rows[-1] + 1))
    return out

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def render(lum, mask, box, s, name, pad=24):
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(lum.shape[1], x1 + pad), min(lum.shape[0], y1 + pad)
    l = Image.fromarray(np.clip(lum[y0:y1, x0:x1], 0, 255).astype(np.uint8))
    m = Image.fromarray((mask[y0:y1, x0:x1] * 255).astype(np.uint8))
    W, H = (x1 - x0) * s, (y1 - y0) * s
    L = np.asarray(l.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(s * (0.75 if s > 4 else 0.45)))).astype(np.float32)
    M = np.asarray(m.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(s * 0.6))).astype(np.float32)
    white = smooth(L, 105, 165)  # 0 = ink, 1 = paper
    alpha = smooth(M, 100, 155)
    v = (white * 255).astype(np.uint8)
    Image.fromarray(np.dstack([v, v, v, (alpha * 255).astype(np.uint8)]), "RGBA").save(f"{O}/{name}.png", optimize=True)
    w = np.full_like(v, 255)
    Image.fromarray(np.dstack([w, w, w, (alpha * 255).astype(np.uint8)]), "RGBA").save(f"{O}/{name}-sil.png", optimize=True)
    print(name, W, H, "box", x0, y0)
    return x0, y0


sheet = load(f"{A}/character-sheet.png")
m = figure_mask(sheet)

m = figure_mask(sheet)
k = 4
small = m[::k, ::k]
lab = np.zeros(small.shape, np.int32); n = 0; sizes = {}
for y in range(small.shape[0]):
    for x in range(small.shape[1]):
        if small[y, x] and not lab[y, x]:
            n += 1; q = deque([(y, x)]); lab[y, x] = n; c = 0
            while q:
                cy, cx = q.popleft(); c += 1
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < small.shape[0] and 0 <= xx < small.shape[1] and small[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx))
            sizes[n] = c
big = sorted(sizes, key=lambda i: -sizes[i])[:3]
figs = []
for i in big:
    ys, xs = np.where(lab == i)
    figs.append((xs.min(), i))
figs.sort()
full = np.kron(lab, np.ones((k, k), np.int32))[: m.shape[0], : m.shape[1]]
CUTS = {}
for (_, i), name in zip(figs, ["front", "side", "back"]):
    own = full == i
    own = np.asarray(Image.fromarray((own * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0
    mm = m & own
    ys, xs = np.where(mm)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    ox, oy = render(sheet, mm, box, 2, name)
    hb = {"front": (190, 0, 580, 400), "side": (0, 0, 356, 400), "back": (190, 0, 580, 400)}[name]
    render(sheet, mm, (ox + hb[0], oy + hb[1], ox + hb[2], oy + hb[3]), 7, name + "-head", pad=0)

fall = load(f"{A}/falling.png")
mf = figure_mask(fall)
rows = np.where(mf.any(axis=1))[0]; cols = np.where(mf.any(axis=0))[0]
render(fall, mf, (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1), 2, "fall")

# lens mask: the two white regions inside the glasses frame on the front close up
head = np.asarray(Image.open(f"{O}/front-head.png")).astype(np.float32)
lab2, _ = ndimage.label((head[..., 0] > 128) & (head[..., 3] > 128))
lens = [i + 1 for i, sl in enumerate(ndimage.find_objects(lab2)) if sl is not None
        and 700 < (sl[0].start + sl[0].stop) / 2 < 1000 and 900 < (sl[1].start + sl[1].stop) / 2 < 1600
        and 15000 < (lab2[sl] == i + 1).sum() < 40000]
out = ndimage.binary_dilation(ndimage.binary_fill_holes(np.isin(lab2, lens)), iterations=8)
a = (ndimage.gaussian_filter(out.astype(np.float32), 1.5) * 255).astype(np.uint8); z = np.zeros_like(a)
Image.fromarray(np.dstack([z, z, z, a]), "RGBA").save(f"{O}/lenses.png", optimize=True)
print("lenses", lens)

w = load(f"{A}/waves.png")
dark = w < 128
H, W = dark.shape
top = np.array([np.argmax(dark[:, x]) if dark[:, x].any() else H for x in range(W)])
best = None
for x0 in range(0, W // 4):
    for x1 in range(W - 1, W - W // 3, -1):
        d = abs(int(top[x0]) - int(top[x1])) + abs(int(top[x0 + 6]) - int(top[x1 + 6 if x1 + 6 < W else x1])) + abs(int(top[x0 - 6 if x0 >= 6 else 0]) - int(top[x1 - 6]))
        if best is None or d < best[0]:
            best = (d, x0, x1)
d, x0, x1 = best
y0 = max(0, int(top.min()) - 20)
crop = dark[y0:, x0:x1]
rgba = np.dstack([np.zeros_like(crop, np.uint8)] * 3 + [(crop * 255).astype(np.uint8)])
Image.fromarray(rgba, "RGBA").save(f"{O}/waves.png")
print("waves loop", x0, x1, "width", x1 - x0, "height", crop.shape[0], "seam diff", d)
