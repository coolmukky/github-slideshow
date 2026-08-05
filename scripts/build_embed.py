#!/usr/bin/env python3
"""
build_embed.py — bake page/index.html + page/assets/*.jpg into a single portable file
page/Storyboard_interactive.html (images embedded as data URIs). Run after regenerating art.

    python scripts/build_embed.py
"""
import base64, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "page"
ASSETS = PAGE / "assets"

html = (PAGE / "index.html").read_text()

def datauri(p: Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode()

assets = {p.stem: p for p in ASSETS.glob("*.jpg")}
if not assets:
    raise SystemExit("No images found in page/assets/*.jpg")

data_map = "{\n" + ",\n".join(f'  "{k}": "{datauri(v)}"' for k, v in sorted(assets.items())) + "\n}"

# swap the asset loader to read from an embedded map
html = html.replace(
    "const A = './assets/';",
    "const ASSET_DATA = " + data_map + ";\n  const A = '';\n"
    "  const U = n => ASSET_DATA[n] || (n.endsWith('.jpg') ? ASSET_DATA[n.slice(0,-4)] : '');",
)
html = html.replace('src="${A}${img}.jpg"', 'src="${U(img)}"')
html = html.replace("`url('${A}${currentImg(s)}.jpg')`", "`url('${U(currentImg(s))}')`")
html = html.replace('src="${A}cast_${c[0]}.jpg"', 'src="${U(\'cast_\'+c[0])}"')
html = html.replace("im.src=A+n+'.jpg';", "im.src=U(n);")

out = PAGE / "Storyboard_interactive.html"
out.write_text(html)
print(f"wrote {out.relative_to(ROOT)}  ({out.stat().st_size/1e6:.1f} MB, {len(assets)} images embedded)")
