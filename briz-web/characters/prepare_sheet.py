"""Clean an AI-drawn 3x3 mascot sheet so the page-mascot build accepts it.

    python prepare_sheet.py <keyed.png> <out.png> [--scale-file scale.txt]

Expects the green background to be removed already (page-mascot's key.py). Then:

1. Despill: the character has no green of its own, so any green-dominant pixel
   left at the edges is key spill and is pulled back to neutral. Enclosed
   pockets of key colour (inside a handle, under an arm) are made transparent.
2. Re-grid: image models rarely space the nine drawings evenly, and an even 3x3
   cut then slices through heads. Each drawing is found as a connected blob
   (floating symbols are attached to the nearest one) and placed in its own even
   cell, centred on the shoulders, on a shared baseline.

Both sheets of a character must use the same scale or they will not line up.
The first sheet processed writes its scale to --scale-file; the second reads it.
Process the expressions sheet first: its floating symbols need the most room.
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

CELL = 420
BASELINE = 0.90      # where the bottom of the shoulders lands down the cell
MAX_HEIGHT = 0.78    # tallest drawing, as a fraction of the cell
MAX_WIDTH = 0.86
MAX_WITH_SYMBOLS = 0.87

source, destination = sys.argv[1], sys.argv[2]
scale_file = sys.argv[sys.argv.index('--scale-file') + 1] if '--scale-file' in sys.argv else None

pixels = np.array(Image.open(source).convert('RGBA')).astype(np.int16)
red, green, blue = pixels[..., 0], pixels[..., 1], pixels[..., 2]
limit = np.maximum(red, blue)
# key.py keeps key-coloured areas that the character encloses (the gap inside a
# bag handle, between an arm and the body). Nothing here is meant to be green,
# so clear them instead of letting the despill turn them into dark patches.
pixels[..., 3] = np.where((green > limit + 70) & (green > 140), 0, pixels[..., 3])
pixels[..., 1] = np.where(green > limit + 6, limit, green)
pixels = pixels.astype(np.uint8)

solid = pixels[..., 3] > 40
labels, count = ndimage.label(solid)
ids = np.arange(1, count + 1)
sizes = ndimage.sum(solid, labels, ids)
order = np.argsort(sizes)[::-1]
if count < 9:
    sys.exit(f'expected nine drawings, found {count} -- are two of them touching?')
mains = [int(ids[i]) for i in order[:9]]
extras = [int(ids[i]) for i in order[9:] if sizes[i] > 60]
centres = {k: ndimage.center_of_mass(labels == k) for k in mains + extras}
groups = {k: [k] for k in mains}
for extra in extras:
    nearest = min(mains, key=lambda m: (centres[m][0] - centres[extra][0]) ** 2 + (centres[m][1] - centres[extra][1]) ** 2)
    groups[nearest].append(extra)


def bounds(mask):
    ys, xs = np.where(mask)
    return ys.min(), ys.max(), xs.min(), xs.max()


boxes = {k: bounds(labels == k) for k in mains}
by_row = sorted(mains, key=lambda k: boxes[k][0])
grid = [sorted(by_row[i:i + 3], key=lambda k: boxes[k][2]) for i in (0, 3, 6)]

if scale_file and os.path.exists(scale_file):
    scale = float(open(scale_file).read())
else:
    tallest = max(b[1] - b[0] for b in boxes.values())
    widest = max(b[3] - b[2] for b in boxes.values())
    # A drawing plus its floating symbol must also fit above the baseline.
    with_symbols = max(boxes[k][1] - bounds(np.isin(labels, groups[k]))[0] for k in mains)
    scale = min(MAX_HEIGHT * CELL / tallest, MAX_WIDTH * CELL / widest, MAX_WITH_SYMBOLS * CELL / with_symbols)
    if scale_file:
        open(scale_file, 'w').write(f'{scale:.5f}')

sheet = Image.new('RGBA', (CELL * 3, CELL * 3), (0, 0, 0, 0))
for row, cells in enumerate(grid):
    for column, k in enumerate(cells):
        top, bottom, left, right = boxes[k]
        body = labels[top:bottom + 1, left:right + 1] == k
        shoulders = np.where(body[int(body.shape[0] * 0.88):].any(0))[0]
        centre = left + (shoulders.min() + shoulders.max()) / 2
        mask = np.isin(labels, groups[k])
        g_top, g_bottom, g_left, g_right = bounds(mask)
        crop = pixels[g_top:g_bottom + 1, g_left:g_right + 1].copy()
        crop[~mask[g_top:g_bottom + 1, g_left:g_right + 1]] = 0
        drawing = Image.fromarray(crop).resize(
            (round(crop.shape[1] * scale), round(crop.shape[0] * scale)), Image.LANCZOS)
        x = round(column * CELL + CELL / 2 - (centre - g_left) * scale)
        y = round(row * CELL + CELL * BASELINE - (bottom - g_top + 1) * scale)
        if y < row * CELL or x < column * CELL - 2 or x + drawing.width > (column + 1) * CELL + 2:
            sys.exit(f'drawing {row * 3 + column + 1} does not fit its cell at scale {scale:.3f}')
        sheet.alpha_composite(drawing, (x, y))

sheet.save(destination)
symbols = sum(len(v) - 1 for v in groups.values())
print(f'{os.path.basename(destination)}: 9 drawings, {symbols} floating symbols, scale {scale:.3f}')
