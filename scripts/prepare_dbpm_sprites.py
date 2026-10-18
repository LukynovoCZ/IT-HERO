"""Normalize the newly drawn DBPM poses. Pillow is an offline authoring tool only."""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'assets/characters/dbpm-source.png').convert('RGBA')
# Pose bounds and shared anatomical foot anchors in the source drawing.
poses = [
    ((113, 20, 338, 418), (232, 408)),  # idle
    ((508, 20, 780, 420), (640, 412)),  # walk
    ((914, 20, 1190, 420), (1050, 412)), # alternate walk
    ((42, 432, 400, 772), (238, 756)),  # jump
    ((476, 430, 817, 812), (630, 802)), # melee
    ((847, 470, 1274, 814), (1012, 802)), # laptop
    ((24, 862, 500, 1215), (165, 1206)), # baguette
    ((505, 818, 831, 1215), (650, 1206)), # demand
    ((846, 884, 1274, 1220), (1040, 1206)), # defeat
]
scale = 82 / (408 - 28)
sheet = Image.new('RGBA', (160 * len(poses), 96))
for index, (box, foot) in enumerate(poses):
    crop = source.crop(box)
    crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.NEAREST)
    position = (round(80 + (box[0] - foot[0]) * scale), round(96 + (box[1] - foot[1]) * scale))
    cell = Image.new('RGBA', (160, 96))
    cell.alpha_composite(crop, position)
    cell.putalpha(cell.getchannel('A').point(lambda value: 255 if value >= 160 else 0))
    bounds = cell.getbbox()
    if bounds and bounds[3] < 96:
        aligned = Image.new('RGBA', (160, 96))
        aligned.alpha_composite(cell, (0, 96 - bounds[3]))
        cell = aligned
    sheet.alpha_composite(cell, (index * 160, 0))
alpha = sheet.getchannel('A').point(lambda value: 255 if value >= 160 else 0)
sheet = sheet.convert('RGB').quantize(colors=32, method=Image.Quantize.MEDIANCUT).convert('RGBA')
sheet.putalpha(alpha)
sheet.save(ROOT / 'assets/characters/dbpm.png', optimize=True)
