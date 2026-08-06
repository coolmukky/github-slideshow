#!/usr/bin/env python3
"""
build_artifact.py — produce a fully self-contained, CSP-clean single file suitable
for hosting as an Artifact / live page.

Unlike build_embed.py (which inlines images but keeps the Google Fonts <link>),
this ALSO inlines the four webfonts as @font-face data: URIs and strips the outer
<!doctype>/<html>/<head>/<body> so the result is a body fragment: exactly what the
Artifact host wants (it supplies its own document skeleton).

    python scripts/build_artifact.py            -> writes page/live_artifact.html

Fetches the fonts once from Google Fonts at build time (via the outbound proxy).
"""
import base64
import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("pip install requests first")

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "page"
ASSETS = PAGE / "assets"
OUT = PAGE / "live_artifact.html"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")

# exactly the families/weights the page uses
FONTS_CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Cinzel:wght@600;700;800&"
    "family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&"
    "family=Inter:wght@400;500;600;700&"
    "family=Space+Mono:wght@400;700&display=swap"
)
KEEP_SUBSETS = {"latin", "latin-ext"}   # skip cyrillic/greek/vietnamese to stay lean


CACHE = Path(__file__).resolve().parent / "_fontcache" / "fontface.css"


def _get(url: str, binary: bool, tries: int = 3):
    """Fetch with a couple of retries — the egress proxy occasionally resets."""
    last = None
    for i in range(tries):
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=45)
            r.raise_for_status()
            return r.content if binary else r.text
        except Exception as e:            # noqa: BLE001 - retry any transport error
            last = e
    raise last


def build_fontface_css() -> str:
    """Inline the webfonts as data URIs, caching the result.

    The fonts never change between runs, so the cache both speeds up repeat builds
    and keeps them working when the network is briefly unavailable.
    """
    if CACHE.exists():
        css = CACHE.read_text(encoding="utf-8")
        print(f"  fonts from cache ({len(css)//1024} KB)")
        return css

    css = _get(FONTS_CSS_URL, binary=False)
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    out, n = [], 0
    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue
        m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if not m:
            continue
        url = m.group(1)
        raw = _get(url, binary=True)
        uri = "data:font/woff2;base64," + base64.b64encode(raw).decode("ascii")
        out.append(block.replace(url, uri))
        n += 1
    if not out:
        sys.exit("no @font-face blocks captured — aborting (would ship fallback fonts)")
    result = "\n".join(out)
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(result, encoding="utf-8")
    print(f"  inlined {n} font faces ({len(result)//1024} KB), cached for later builds")
    return result


def inline_images(html: str) -> str:
    assets = {p.stem: p for p in sorted(ASSETS.glob("*.jpg"))}
    if not assets:
        sys.exit("no images in page/assets/*.jpg")

    def datauri(p: Path) -> str:
        return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

    data_map = "{\n" + ",\n".join(f'  "{k}": "{datauri(v)}"' for k, v in assets.items()) + "\n}"
    html = html.replace(
        "const A = './assets/';",
        "const ASSET_DATA = " + data_map + ";\n  const A = '';\n"
        "  const U = n => ASSET_DATA[n] || (n.endsWith('.jpg') ? ASSET_DATA[n.slice(0,-4)] : '');",
    )
    html = html.replace('src="${A}${img}.jpg"', 'src="${U(img)}"')
    html = html.replace("`url('${A}${currentImg(s)}.jpg')`", "`url('${U(currentImg(s))}')`")
    html = html.replace('src="${A}cast_${c[0]}.jpg"', 'src="${U(\'cast_\'+c[0])}"')
    html = html.replace("im.src=A+n+'.jpg';", "im.src=U(n);")
    print(f"  inlined {len(assets)} images")
    return html


def main():
    html = (PAGE / "index.html").read_text(encoding="utf-8")
    html = inline_images(html)

    style = re.search(r"<style>(.*?)</style>", html, re.S).group(1)
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    fontface = build_fontface_css()

    # body fragment only — the Artifact host wraps it in <!doctype><head></head><body>
    fragment = (
        "<style>\n"
        "/* fonts inlined as data URIs so the page keeps its type under the Artifact CSP */\n"
        + fontface + "\n\n"
        + style +
        "\n</style>\n"
        + body.strip() + "\n"
    )
    OUT.write_text(fragment, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"wrote {OUT.relative_to(ROOT)}  ({kb/1024:.2f} MB fragment)")


if __name__ == "__main__":
    main()
