import sys
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB').crop((330, 100, 1036, 975))  # stage area, skip toolbar and sidebar
w, h = im.size
mask = Image.new('L', (w, h), 0)
work = im.copy()
for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
    ImageDraw.floodfill(work, seed, (255, 0, 255), thresh=40)
px, mp = work.load(), mask.load()
for y in range(h):
    for x in range(w):
        if px[x, y] != (255, 0, 255):
            mp[x, y] = 255
mask = mask.filter(ImageFilter.GaussianBlur(0.8))
out = im.convert('RGBA'); out.putalpha(mask)
out = out.crop(out.getbbox())
out.save(dst)
print(dst, out.size)
