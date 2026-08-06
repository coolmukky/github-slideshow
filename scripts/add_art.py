#!/usr/bin/env python3
"""
add_art.py — drop a newly generated image into the storyboard and rebuild everything.

    python scripts/add_art.py <source-image> <asset-name>

    <asset-name> is the storyboard slot: title, p11..p54, or cast_*.
    Panels/title are written 1280x720; cast_* are written 640x640.

What it does:
  1. trims any solid white border the generator baked in (common with some tools),
  2. scales + centre-crops to the exact size the page and deck expect
     (--anchor low|high shifts the crop window when the subject sits off-centre),
  3. backs up the image being replaced into scripts/_replaced/ (a local
     convenience copy - it is gitignored, since git history already holds
     every previous version of every asset),
  4. rebuilds page/Storyboard_interactive.html, the .pptx deck, and the
     CSP-clean page/live_artifact.html.

After it runs, republish the artifact to push the change to the live URL.
"""
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("pip install Pillow first")

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "page" / "assets"
BACKUP = ROOT / "scripts" / "_replaced"

PANELS = {"title"} | {f"p{c}{i}" for c, i in
                      [(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (2, 1), (2, 2), (2, 3), (2, 4),
                       (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (4, 1), (4, 2),
                       (5, 1), (5, 2), (5, 3), (5, 4)]}
CAST = {"cast_king", "cast_lords", "cast_castle", "cast_chamber",
        "cast_maester", "cast_medallion", "cast_patent"}


def trim_white_border(im, thresh=235):
    """Some generators frame the render in a solid white margin — drop it."""
    w, h = im.size
    px = im.load()
    light = lambda p: p[0] > thresh and p[1] > thresh and p[2] > thresh
    step = max(1, w // 150)
    top = 0
    while top < h and all(light(px[x, top]) for x in range(0, w, step)):
        top += 1
    bot = h - 1
    while bot > top and all(light(px[x, bot]) for x in range(0, w, step)):
        bot -= 1
    left = 0
    while left < w and all(light(px[left, y]) for y in range(0, h, step)):
        left += 1
    right = w - 1
    while right > left and all(light(px[right, y]) for y in range(0, h, step)):
        right -= 1
    if (left, top, right, bot) != (0, 0, w - 1, h - 1):
        print(f"  trimmed white border -> {right-left+1}x{bot-top+1}")
        return im.crop((left, top, right + 1, bot + 1))
    return im


def fit(im, tw, th, anchor="center"):
    """Scale to fill, then crop. anchor shifts the window when the subject sits low/high."""
    W, H = im.size
    s = max(tw / W, th / H)
    nw, nh = round(W * s), round(H * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    if anchor == "low":
        top = min(nh - th, int((nh - th) * 0.85))
    elif anchor == "high":
        top = max(0, int((nh - th) * 0.15))
    else:
        top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    anchor = "center"
    for a in sys.argv[1:]:
        if a.startswith("--anchor="):
            anchor = a.split("=", 1)[1]
    if len(args) != 2:
        sys.exit(__doc__)
    src, name = Path(args[0]), args[1]

    if name not in PANELS and name not in CAST:
        sys.exit(f"unknown slot '{name}'. Valid: title, p11..p54, cast_*")
    if not src.exists():
        sys.exit(f"no such file: {src}")

    tw, th = (640, 640) if name in CAST else (1280, 720)
    im = Image.open(src).convert("RGB")
    print(f"  source {im.size}")
    im = trim_white_border(im)
    im = fit(im, tw, th, anchor)

    dest = ASSETS / f"{name}.jpg"
    if dest.exists():
        BACKUP.mkdir(parents=True, exist_ok=True)
        prev = BACKUP / f"{name}.jpg"
        if not prev.exists():                     # keep the ORIGINAL, not each revision
            prev.write_bytes(dest.read_bytes())
    im.save(dest, quality=88, optimize=True)
    print(f"  wrote {dest.relative_to(ROOT)} {im.size}")

    for step, cmd in [("page", [sys.executable, "scripts/build_embed.py"]),
                      ("deck", ["node", "build_deck.js"]),
                      ("live", [sys.executable, "scripts/build_artifact.py"])]:
        cwd = ROOT / "deck" if step == "deck" else ROOT
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
        print(f"  {step}: {'ok' if r.returncode == 0 else 'FAILED ' + r.stderr[-300:]}")


if __name__ == "__main__":
    main()
