#!/usr/bin/env python3
"""
Bake a portable, single-file build of the storyboard.

Reads page/index.html and every image under page/assets/, inlines each image as
a base64 data: URI, and writes:

    page/Storyboard_interactive.html

...a single self-contained file you can open by double-click or hand to someone
without shipping the assets/ folder. The runtime behaviour is identical to
index.html — only the image source resolver changes: instead of pointing at
assets/<id>.svg, asset() returns the embedded data URI.

Fonts still load from Google Fonts (matching index.html); offline, the page
falls back to the system serif / sans / mono stacks it declares.

Usage:
    python scripts/build_embed.py
"""
import base64
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "page")
ASSETS = os.path.join(PAGE, "assets")
SRC = os.path.join(PAGE, "index.html")
OUT = os.path.join(PAGE, "Storyboard_interactive.html")

MIME = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".avif": "image/avif",
}

MARKER = 'function asset(id){ return "assets/" + id + ".svg"; }'


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = MIME.get(ext, "application/octet-stream")
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return "data:%s;base64,%s" % (mime, b64)


def main():
    if not os.path.exists(SRC):
        sys.exit("error: %s not found — build the page first." % SRC)
    if not os.path.isdir(ASSETS):
        sys.exit("error: %s not found — run scripts/gen_assets.py first." % ASSETS)

    html = open(SRC, encoding="utf-8").read()
    if MARKER not in html:
        sys.exit("error: could not find the asset() resolver in index.html; "
                 "the embed hook may have changed.")

    embed = {}
    for name in sorted(os.listdir(ASSETS)):
        path = os.path.join(ASSETS, name)
        if not os.path.isfile(path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext not in MIME:
            continue
        key = os.path.splitext(name)[0]        # "p11", "title", "cast_sentinel", ...
        embed[key] = data_uri(path)

    if not embed:
        sys.exit("error: no images found in %s" % ASSETS)

    items = ",\n".join('  "%s": "%s"' % (key, uri) for key, uri in sorted(embed.items()))
    inject = (
        "/* portable build — images inlined as base64 data URIs by "
        "scripts/build_embed.py */\n"
        "const EMBED = {\n" + items + "\n};\n"
        'function asset(id){ return EMBED[id] || ("assets/" + id + ".svg"); }'
    )

    out_html = html.replace(MARKER, inject, 1)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out_html)

    kb = os.path.getsize(OUT) / 1024.0
    print("wrote %s" % OUT)
    print("  %d images embedded, %.0f KB single file" % (len(embed), kb))


if __name__ == "__main__":
    main()
