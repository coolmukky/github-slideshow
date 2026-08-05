#!/usr/bin/env python3
"""
Generate the storyboard illustrations for "The Kingdom of Cleartext".

Produces flat, layered silhouette SVG scenes in the storyboard palette:
    midnight #07182D | gold #FFB74A | cyan #02C8FF | wax red #C8324B

Outputs into page/assets/:
    title.svg
    p11.svg .. p54.svg      (5 chapters x 4 panels, 16:9)
    cast_*.svg              (7 portraits, 3:4)

Deterministic: uses a seeded LCG so rebuilds are byte-stable.
Run:  python scripts/gen_assets.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "page", "assets"))

# ---- palette -------------------------------------------------------------
MID   = "#07182D"   # midnight
GOLD  = "#FFB74A"   # gold
CYAN  = "#02C8FF"   # cyan
WAX   = "#C8324B"   # wax red
BG    = "#05080F"   # near-black
PARCH = "#ECD9A8"   # parchment
STAR  = "#EAF6FF"
INK   = "#020509"

W, H = 1600, 900            # panel / title canvas (16:9)
CW, CH = 900, 1200          # cast canvas (3:4)


# ---- deterministic pseudo-random ----------------------------------------
def rng(seed):
    s = seed & 0x7FFFFFFF
    def nxt():
        nonlocal s
        s = (1103515245 * s + 12345) & 0x7FFFFFFF
        return s / 0x7FFFFFFF
    return nxt


# ---- shared defs ---------------------------------------------------------
def defs(accent=CYAN, w=W, h=H):
    return f"""<defs>
  <radialGradient id="sky" cx="50%" cy="18%" r="95%">
    <stop offset="0%" stop-color="#0d2949"/>
    <stop offset="42%" stop-color="{MID}"/>
    <stop offset="100%" stop-color="{BG}"/>
  </radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="{accent}" stop-opacity="0.9"/>
    <stop offset="55%" stop-color="{accent}" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="{accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gold" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffe6b0"/>
    <stop offset="55%" stop-color="{GOLD}"/>
    <stop offset="100%" stop-color="#a86a17"/>
  </radialGradient>
  <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0a1c33"/>
    <stop offset="100%" stop-color="{INK}"/>
  </linearGradient>
  <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0b2138"/>
    <stop offset="100%" stop-color="#040a14"/>
  </linearGradient>
  <linearGradient id="accentline" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="{accent}" stop-opacity="0"/>
    <stop offset="50%" stop-color="{accent}"/>
    <stop offset="100%" stop-color="{accent}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="vig" cx="50%" cy="46%" r="72%">
    <stop offset="60%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.62"/>
  </radialGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="soft2" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="16"/>
  </filter>
</defs>"""


def stars(seed, n=110, w=W, h=H, maxy=None):
    r = rng(seed)
    maxy = maxy if maxy is not None else int(h * 0.68)
    out = []
    for _ in range(n):
        x = r() * w
        y = r() * maxy
        rad = 0.4 + r() * 1.7
        o = 0.16 + r() * 0.7
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.2f}" fill="{STAR}" opacity="{o:.2f}"/>')
    return "".join(out)


def moon(cx, cy, rad, accent=GOLD, glow=True):
    g = f'<circle cx="{cx}" cy="{cy}" r="{rad*2.4:.0f}" fill="url(#glow)" opacity="0.7"/>' if glow else ""
    return (f'{g}<circle cx="{cx}" cy="{cy}" r="{rad}" fill="url(#gold)"/>'
            f'<circle cx="{cx-rad*0.28:.0f}" cy="{cy-rad*0.22:.0f}" r="{rad*0.72:.0f}" '
            f'fill="{MID}" opacity="0.28"/>')


def base(seed, accent=CYAN, moon_at=None, aurora=False, w=W, h=H, nstars=110):
    """Sky + stars + optional moon + optional aurora + ground haze."""
    parts = [f'<rect width="{w}" height="{h}" fill="url(#sky)"/>']
    if aurora:
        parts.append(
            f'<path d="M0 {h*0.30:.0f} Q {w*0.3} {h*0.14:.0f} {w*0.55} {h*0.26:.0f} '
            f'T {w} {h*0.20:.0f} V0 H0 Z" fill="url(#glow)" opacity="0.35" filter="url(#soft2)"/>')
    parts.append(stars(seed, nstars, w, h))
    if moon_at:
        parts.append(moon(*moon_at))
    # horizon haze
    parts.append(f'<rect x="0" y="{h*0.60:.0f}" width="{w}" height="{h*0.4:.0f}" '
                 f'fill="url(#glow)" opacity="0.10"/>')
    return "".join(parts)


def ground(y, w=W, h=H, fill="url(#hill)"):
    return f'<rect x="0" y="{y}" width="{w}" height="{h-y}" fill="{fill}"/>'


def vignette(w=W, h=H):
    return f'<rect width="{w}" height="{h}" fill="url(#vig)"/>'


# ---- motif primitives ----------------------------------------------------
def crenellated(x, y, wdt, hgt, tooth=26, fill="#06121f", stroke=None):
    """A crenellated wall block."""
    top = []
    cx = x
    up = True
    top.append(f"M{x} {y+hgt}")
    top.append(f"L{x} {y}")
    while cx < x + wdt:
        step = min(tooth, x + wdt - cx)
        if up:
            top.append(f"L{cx+step:.0f} {y}")
        else:
            top.append(f"L{cx:.0f} {y+tooth*0.6:.0f} L{cx+step:.0f} {y+tooth*0.6:.0f}")
        # simple square merlons
        cx += step
        up = not up
    top.append(f"L{x+wdt} {y+hgt} Z")
    s = f' stroke="{stroke}" stroke-width="2"' if stroke else ""
    # simpler robust crenellation:
    merlons = ""
    mx = x
    i = 0
    while mx < x + wdt - tooth:
        if i % 2 == 0:
            merlons += f'<rect x="{mx:.0f}" y="{y-tooth*0.7:.0f}" width="{tooth:.0f}" height="{tooth*0.7:.0f}" fill="{fill}"/>'
        mx += tooth
        i += 1
    return f'<rect x="{x}" y="{y}" width="{wdt}" height="{hgt}" fill="{fill}"{s}/>' + merlons


def tower(cx, baseY, twh, tww, fill="#081726", accent=None, cap=GOLD):
    x = cx - tww / 2
    body = f'<rect x="{x:.0f}" y="{baseY-twh:.0f}" width="{tww:.0f}" height="{twh:.0f}" fill="{fill}"/>'
    # battlement
    bat = ""
    bx = x
    i = 0
    tsize = tww / 5
    while bx < x + tww - 1:
        if i % 2 == 0:
            bat += f'<rect x="{bx:.0f}" y="{baseY-twh-tsize:.0f}" width="{tsize:.0f}" height="{tsize:.0f}" fill="{fill}"/>'
        bx += tsize
        i += 1
    # conical roof for slim towers
    win = ""
    if accent:
        win = (f'<rect x="{cx-tww*0.14:.0f}" y="{baseY-twh*0.62:.0f}" width="{tww*0.28:.0f}" '
               f'height="{twh*0.22:.0f}" rx="{tww*0.14:.0f}" fill="{accent}" opacity="0.85"/>'
               f'<rect x="{cx-tww*0.14:.0f}" y="{baseY-twh*0.62:.0f}" width="{tww*0.28:.0f}" '
               f'height="{twh*0.22:.0f}" rx="{tww*0.14:.0f}" fill="url(#glow)" opacity="0.4"/>')
    return body + bat + win


def castle(cx, baseY, scale=1.0, accent=GOLD, lit=True):
    """A cluster of towers + curtain wall + gate."""
    s = scale
    parts = []
    ww = 360 * s
    wh = 150 * s
    parts.append(crenellated(cx - ww / 2, baseY - wh, ww, wh, tooth=30 * s))
    # gate
    gw, gh = 64 * s, 96 * s
    parts.append(f'<path d="M{cx-gw/2:.0f} {baseY:.0f} L{cx-gw/2:.0f} {baseY-gh+gw/2:.0f} '
                 f'A{gw/2:.0f} {gw/2:.0f} 0 0 1 {cx+gw/2:.0f} {baseY-gh+gw/2:.0f} '
                 f'L{cx+gw/2:.0f} {baseY:.0f} Z" fill="{INK}"/>')
    if lit:
        parts.append(f'<path d="M{cx-gw*0.34:.0f} {baseY:.0f} L{cx-gw*0.34:.0f} {baseY-gh*0.7:.0f} '
                     f'A{gw*0.34:.0f} {gw*0.34:.0f} 0 0 1 {cx+gw*0.34:.0f} {baseY-gh*0.7:.0f} '
                     f'L{cx+gw*0.34:.0f} {baseY:.0f} Z" fill="{accent}" opacity="0.55"/>')
    # towers
    parts.append(tower(cx - ww / 2, baseY, 260 * s, 78 * s, accent=accent if lit else None))
    parts.append(tower(cx + ww / 2, baseY, 260 * s, 78 * s, accent=accent if lit else None))
    parts.append(tower(cx, baseY - wh, 150 * s, 96 * s, accent=accent if lit else None))
    return "".join(parts)


def figure(cx, baseY, hgt, color="#020608", accent=None, item=None):
    """A hooded, cloaked silhouette."""
    w = hgt * 0.46
    head = hgt * 0.19
    parts = []
    # cloak body (bell shape)
    parts.append(
        f'<path d="M{cx:.0f} {baseY-hgt:.0f} '
        f'C{cx-w*0.5:.0f} {baseY-hgt*0.9:.0f} {cx-w*0.62:.0f} {baseY-hgt*0.3:.0f} {cx-w*0.66:.0f} {baseY:.0f} '
        f'L{cx+w*0.66:.0f} {baseY:.0f} '
        f'C{cx+w*0.62:.0f} {baseY-hgt*0.3:.0f} {cx+w*0.5:.0f} {baseY-hgt*0.9:.0f} {cx:.0f} {baseY-hgt:.0f} Z" '
        f'fill="{color}"/>')
    # hood/head
    parts.append(f'<circle cx="{cx:.0f}" cy="{baseY-hgt+head*0.7:.0f}" r="{head:.0f}" fill="{color}"/>')
    parts.append(f'<path d="M{cx-head*1.05:.0f} {baseY-hgt+head*1.1:.0f} '
                 f'Q{cx:.0f} {baseY-hgt-head*0.5:.0f} {cx+head*1.05:.0f} {baseY-hgt+head*1.1:.0f} '
                 f'Q{cx:.0f} {baseY-hgt+head*0.2:.0f} {cx-head*1.05:.0f} {baseY-hgt+head*1.1:.0f} Z" '
                 f'fill="{color}"/>')
    if accent:
        # thin rim light on one shoulder
        parts.append(f'<path d="M{cx-w*0.44:.0f} {baseY-hgt*0.66:.0f} '
                     f'C{cx-w*0.55:.0f} {baseY-hgt*0.34:.0f} {cx-w*0.6:.0f} {baseY-hgt*0.12:.0f} {cx-w*0.62:.0f} {baseY:.0f}" '
                     f'fill="none" stroke="{accent}" stroke-width="3" opacity="0.6"/>')
    return "".join(parts)


def wax_seal(cx, cy, rad, accent=WAX, glyph="star"):
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{rad*1.9:.0f}" fill="url(#glow)" opacity="0.28"/>']
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{rad}" fill="{accent}"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{rad}" fill="none" stroke="#7d1526" stroke-width="{rad*0.10:.0f}"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{rad*0.72:.0f}" fill="none" stroke="#7d1526" '
                 f'stroke-width="2" stroke-dasharray="4 6" opacity="0.8"/>')
    parts.append(_glyph(cx, cy, rad * 0.5, glyph, "#3a0a12"))
    return "".join(parts)


def _glyph(cx, cy, r, kind, fill):
    if kind == "star":
        pts = []
        import math
        for i in range(10):
            ang = -math.pi / 2 + i * math.pi / 5
            rr = r if i % 2 == 0 else r * 0.42
            pts.append(f"{cx+rr*math.cos(ang):.1f},{cy+rr*math.sin(ang):.1f}")
        return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'
    if kind == "key":
        return (f'<circle cx="{cx}" cy="{cy-r*0.4:.0f}" r="{r*0.42:.0f}" fill="none" stroke="{fill}" stroke-width="{r*0.2:.0f}"/>'
                f'<rect x="{cx-r*0.09:.0f}" y="{cy-r*0.05:.0f}" width="{r*0.18:.0f}" height="{r*0.95:.0f}" fill="{fill}"/>'
                f'<rect x="{cx:.0f}" y="{cy+r*0.55:.0f}" width="{r*0.3:.0f}" height="{r*0.16:.0f}" fill="{fill}"/>')
    if kind == "eye":
        return (f'<path d="M{cx-r:.0f} {cy:.0f} Q{cx:.0f} {cy-r*0.8:.0f} {cx+r:.0f} {cy:.0f} '
                f'Q{cx:.0f} {cy+r*0.8:.0f} {cx-r:.0f} {cy:.0f} Z" fill="none" stroke="{fill}" stroke-width="{r*0.14:.0f}"/>'
                f'<circle cx="{cx}" cy="{cy}" r="{r*0.3:.0f}" fill="{fill}"/>')
    if kind == "crown":
        return (f'<path d="M{cx-r:.0f} {cy+r*0.5:.0f} L{cx-r:.0f} {cy-r*0.3:.0f} '
                f'L{cx-r*0.5:.0f} {cy+r*0.1:.0f} L{cx:.0f} {cy-r*0.5:.0f} '
                f'L{cx+r*0.5:.0f} {cy+r*0.1:.0f} L{cx+r:.0f} {cy-r*0.3:.0f} '
                f'L{cx+r:.0f} {cy+r*0.5:.0f} Z" fill="{fill}"/>')
    # shield
    return (f'<path d="M{cx:.0f} {cy-r:.0f} L{cx+r*0.8:.0f} {cy-r*0.6:.0f} '
            f'L{cx+r*0.8:.0f} {cy+r*0.2:.0f} Q{cx+r*0.8:.0f} {cy+r*0.85:.0f} {cx:.0f} {cy+r:.0f} '
            f'Q{cx-r*0.8:.0f} {cy+r*0.85:.0f} {cx-r*0.8:.0f} {cy+r*0.2:.0f} '
            f'L{cx-r*0.8:.0f} {cy-r*0.6:.0f} Z" fill="{fill}"/>')


def key_icon(cx, cy, scale=1.0, rot=0, accent=GOLD):
    r = 22 * scale
    return (f'<g transform="translate({cx},{cy}) rotate({rot})" opacity="0.92">'
            f'<circle cx="0" cy="0" r="{r:.0f}" fill="none" stroke="{accent}" stroke-width="{r*0.34:.0f}"/>'
            f'<rect x="{-r*0.16:.0f}" y="0" width="{r*0.32:.0f}" height="{r*2.6:.0f}" fill="{accent}"/>'
            f'<rect x="0" y="{r*1.8:.0f}" width="{r*0.7:.0f}" height="{r*0.28:.0f}" fill="{accent}"/>'
            f'<rect x="0" y="{r*2.3:.0f}" width="{r*0.5:.0f}" height="{r*0.28:.0f}" fill="{accent}"/></g>')


def rune_row(x, y, w, accent=CYAN, n=7, seed=1):
    r = rng(seed)
    glyphs = ["M0 0 L14 0 M7 0 L7 20 M0 20 L14 20", "M0 0 L0 20 L12 20 M0 10 L10 10",
              "M0 0 L12 0 L12 20 L0 20 Z M0 10 L12 10", "M6 0 L6 20 M0 6 L12 6",
              "M0 0 L12 10 L0 20", "M0 0 L12 0 L6 20 Z", "M0 10 L6 0 L12 10 L6 20 Z"]
    step = w / n
    out = []
    for i in range(n):
        g = glyphs[int(r() * len(glyphs)) % len(glyphs)]
        o = 0.35 + r() * 0.55
        out.append(f'<g transform="translate({x+i*step:.0f},{y:.0f}) scale(1.1)" '
                   f'stroke="{accent}" stroke-width="2.4" fill="none" opacity="{o:.2f}">'
                   f'<path d="{g}"/></g>')
    return "".join(out)


def node_map(seed, x, y, w, h, accent=CYAN, anomaly=False):
    r = rng(seed)
    nodes = []
    pts = []
    for _ in range(14):
        px = x + r() * w
        py = y + r() * h
        pts.append((px, py))
    edges = ""
    for i, (px, py) in enumerate(pts):
        # connect to a couple nearby
        for j in range(i + 1, len(pts)):
            qx, qy = pts[j]
            d = ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5
            if d < w * 0.28 and r() > 0.4:
                edges += (f'<line x1="{px:.0f}" y1="{py:.0f}" x2="{qx:.0f}" y2="{qy:.0f}" '
                          f'stroke="{accent}" stroke-width="1.4" opacity="0.35"/>')
    for i, (px, py) in enumerate(pts):
        rad = 4 + r() * 5
        nodes.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{rad:.0f}" fill="{accent}" opacity="0.85"/>'
                     f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{rad*2.4:.0f}" fill="url(#glow)" opacity="0.3"/>')
    an = ""
    if anomaly:
        ax, ay = pts[3]
        bx, by = pts[9]
        an = (f'<line x1="{ax:.0f}" y1="{ay:.0f}" x2="{bx:.0f}" y2="{by:.0f}" stroke="{WAX}" '
              f'stroke-width="3" stroke-dasharray="8 6"/>'
              f'<circle cx="{bx:.0f}" cy="{by:.0f}" r="12" fill="none" stroke="{WAX}" stroke-width="3"/>'
              f'<circle cx="{bx:.0f}" cy="{by:.0f}" r="20" fill="url(#glow)" opacity="0.5"/>')
    return edges + "".join(nodes) + an


def title_text_block():
    # decorative only — real H1 lives in HTML overlay
    return ""


# ---- SVG wrapper ---------------------------------------------------------
def svg(w, h, accent, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">\n{defs(accent,w,h)}\n{body}\n'
            f'{vignette(w,h)}\n</svg>\n')


# =========================================================================
# PANEL SCENES  (each returns body string; base handles sky)
# =========================================================================
def sc_p11():  # one great wall + moat, full moon
    b = [base(11, GOLD, moon_at=(1290, 190, 90, GOLD), nstars=90)]
    b.append(ground(560))
    b.append(castle(800, 560, 1.35, GOLD))
    # moat
    b.append(f'<path d="M0 640 Q400 600 800 640 T1600 640 V900 H0 Z" fill="#04101d"/>')
    b.append(f'<path d="M0 648 Q400 612 800 648 T1600 648" fill="none" stroke="{CYAN}" stroke-width="2" opacity="0.3"/>')
    return "".join(b)

def sc_p12():  # wall with many gates + copied keys
    b = [base(12, GOLD, moon_at=(240, 170, 66, GOLD), nstars=80)]
    b.append(ground(600))
    b.append(crenellated(120, 470, 1360, 130, tooth=44))
    # many small gates
    for i in range(7):
        gx = 210 + i * 190
        b.append(f'<path d="M{gx-34} 600 L{gx-34} 540 A34 34 0 0 1 {gx+34} 540 L{gx+34} 600 Z" fill="{INK}"/>')
        b.append(f'<path d="M{gx-20} 600 L{gx-20} 552 A20 20 0 0 1 {gx+20} 552 L{gx+20} 600 Z" fill="{GOLD}" opacity="0.35"/>')
    # floating copied keys
    for i, (kx, ky, rot) in enumerate([(430, 250, -18), (760, 200, 12), (1080, 270, -8), (1290, 210, 22), (600,300,6)]):
        b.append(key_icon(kx, ky, 1.5, rot, GOLD))
    return "".join(b)

def sc_p13():  # thief slipping toward glowing treasury
    b = [base(13, WAX, moon_at=(1350, 150, 60, GOLD), nstars=70)]
    b.append(ground(600))
    b.append(crenellated(0, 470, 1600, 130, tooth=44))
    # open gate with a thief silhouette
    gx = 560
    b.append(f'<path d="M{gx-46} 600 L{gx-46} 520 A46 46 0 0 1 {gx+46} 520 L{gx+46} 600 Z" fill="{INK}"/>')
    b.append(figure(gx, 600, 150, "#01040a", accent=WAX))
    # glowing treasury to the right
    b.append(f'<rect x="1120" y="470" width="300" height="130" fill="#0a1a2b"/>')
    b.append(f'<rect x="1150" y="500" width="240" height="100" fill="url(#gold)" opacity="0.65"/>')
    b.append(f'<circle cx="1270" cy="550" r="150" fill="url(#glow)" opacity="0.35"/>')
    # dashed path from gate to treasury
    b.append(f'<path d="M{gx+40} 600 Q 860 660 1150 580" fill="none" stroke="{WAX}" stroke-width="3" stroke-dasharray="10 8" opacity="0.75"/>')
    return "".join(b)

def sc_p14():  # sovereign on rampart, cracked wall
    b = [base(14, GOLD, moon_at=(300, 200, 70, GOLD), aurora=True, nstars=80)]
    b.append(ground(620))
    b.append(crenellated(0, 430, 1600, 190, tooth=48))
    # big crack
    b.append(f'<path d="M980 430 L1010 500 L975 560 L1020 620 L985 620 L950 560 L985 500 L960 430 Z" fill="{BG}"/>')
    b.append(f'<path d="M980 430 L1010 500 L975 560 L1020 620" fill="none" stroke="{WAX}" stroke-width="3" opacity="0.7"/>')
    # sovereign standing on the wall
    b.append(figure(360, 430, 190, "#02060d", accent=GOLD))
    b.append(_glyph(360, 250, 26, "crown", GOLD))
    return "".join(b)

def sc_p21():  # herald at gate, line of travelers
    b = [base(21, CYAN, moon_at=(1330, 180, 64, GOLD), nstars=80)]
    b.append(ground(640))
    b.append(tower(430, 640, 300, 150, accent=CYAN))
    b.append(tower(640, 640, 300, 150, accent=CYAN))
    b.append(f'<path d="M470 640 L470 500 A65 65 0 0 1 600 500 L600 640 Z" fill="{INK}"/>')
    b.append(f'<path d="M498 640 L498 512 A37 37 0 0 1 572 512 L572 640 Z" fill="{CYAN}" opacity="0.4"/>')
    # herald with a scroll near gate
    b.append(figure(700, 640, 168, "#02060d", accent=CYAN))
    b.append(f'<rect x="740" y="520" width="20" height="70" rx="8" fill="{PARCH}" opacity="0.85"/>')
    # line of travelers
    for i in range(4):
        b.append(figure(950 + i * 120, 640, 120 - i * 6, "#01040a"))
    return "".join(b)

def sc_p22():  # two-part sigil: key + token (MFA)
    b = [base(22, CYAN, nstars=70)]
    b.append(f'<circle cx="800" cy="440" r="300" fill="url(#glow)" opacity="0.22"/>')
    # a hand region abstracted as pedestal
    b.append(ground(660))
    b.append(f'<path d="M560 660 L620 520 L980 520 L1040 660 Z" fill="#08182a"/>')
    # sigil one: key
    b.append(key_icon(700, 360, 3.0, -10, GOLD))
    # plus
    b.append(f'<rect x="792" y="380" width="16" height="70" fill="{PARCH}" opacity="0.8"/>')
    b.append(f'<rect x="765" y="407" width="70" height="16" fill="{PARCH}" opacity="0.8"/>')
    # sigil two: token (hex with glyph)
    import math
    cx, cy, rr = 940, 400, 78
    pts = " ".join(f"{cx+rr*math.cos(math.pi/6+i*math.pi/3):.0f},{cy+rr*math.sin(math.pi/6+i*math.pi/3):.0f}" for i in range(6))
    b.append(f'<polygon points="{pts}" fill="#0a1f34" stroke="{CYAN}" stroke-width="4"/>')
    b.append(_glyph(cx, cy, 34, "star", CYAN))
    return "".join(b)

def sc_p23():  # traveler under scanning arc (posture)
    b = [base(23, CYAN, nstars=70)]
    b.append(ground(660))
    b.append(figure(800, 660, 240, "#02070f", accent=CYAN))
    # scanning arcs
    for i, rr in enumerate([170, 230, 290]):
        b.append(f'<circle cx="800" cy="470" r="{rr}" fill="none" stroke="{CYAN}" stroke-width="3" '
                 f'opacity="{0.5-i*0.12:.2f}" stroke-dasharray="6 10"/>')
    # scan line
    b.append(f'<rect x="540" y="452" width="520" height="4" fill="{CYAN}" opacity="0.8"/>')
    b.append(f'<rect x="540" y="452" width="520" height="30" fill="url(#glow)" opacity="0.4"/>')
    # check tick
    b.append(f'<path d="M1120 430 L1160 480 L1250 360" fill="none" stroke="{GOLD}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>')
    return "".join(b)

def sc_p24():  # repeated checkpoints along a road
    b = [base(24, CYAN, moon_at=(200, 160, 56, GOLD), nstars=70)]
    b.append(ground(600))
    # perspective road
    b.append(f'<path d="M700 900 L760 560 L840 560 L980 900 Z" fill="#0a1a2b"/>')
    b.append(f'<path d="M772 700 L828 700 M784 640 L816 640 M792 600 L808 600" stroke="{GOLD}" stroke-width="6" opacity="0.5"/>')
    # receding gates
    for i, (yy, s) in enumerate([(560, 0.5), (640, 0.72), (760, 1.0)]):
        gx = 800
        gw = 70 * s
        gh = 150 * s
        b.append(f'<rect x="{gx-gw*1.4:.0f}" y="{yy-gh:.0f}" width="{gw*0.5:.0f}" height="{gh:.0f}" fill="#08182a"/>')
        b.append(f'<rect x="{gx+gw*0.9:.0f}" y="{yy-gh:.0f}" width="{gw*0.5:.0f}" height="{gh:.0f}" fill="#08182a"/>')
        b.append(f'<rect x="{gx-gw*1.4:.0f}" y="{yy-gh:.0f}" width="{gw*2.3:.0f}" height="{gh*0.18:.0f}" fill="#0a1f34"/>')
        b.append(f'<circle cx="{gx:.0f}" cy="{yy-gh*0.9:.0f}" r="{6*s:.0f}" fill="{CYAN}" opacity="0.8"/>')
    b.append(figure(810, 700, 90, "#01040a"))
    return "".join(b)

def sc_p31():  # realm divided into wards (grid)
    b = [base(31, GOLD, nstars=60)]
    b.append(ground(640))
    cols, rows = 5, 3
    x0, y0, cw, ch = 260, 300, 216, 120
    accents = [GOLD, CYAN, GOLD, WAX, CYAN]
    for r_ in range(rows):
        for c in range(cols):
            x = x0 + c * cw
            y = y0 + r_ * ch
            ac = accents[(c + r_) % len(accents)]
            b.append(f'<rect x="{x}" y="{y}" width="{cw-16}" height="{ch-16}" fill="#08182a" '
                     f'stroke="{ac}" stroke-width="2" opacity="0.9"/>')
            b.append(f'<circle cx="{x+(cw-16)/2:.0f}" cy="{y+(ch-16)/2:.0f}" r="14" fill="{ac}" opacity="0.7"/>')
    return "".join(b)

def sc_p32():  # baker at granary (allow), armory denied
    b = [base(32, GOLD, nstars=60)]
    b.append(ground(660))
    # granary door (open, gold)
    b.append(f'<rect x="360" y="430" width="230" height="230" fill="#0a1a2b"/>')
    b.append(f'<path d="M400 660 L400 500 A75 75 0 0 1 550 500 L550 660 Z" fill="url(#gold)" opacity="0.55"/>')
    b.append(f'<text x="475" y="700" font-family="monospace" font-size="26" fill="{GOLD}" text-anchor="middle" opacity="0.85">GRANARY</text>')
    # armory door (denied, red X)
    b.append(f'<rect x="1010" y="430" width="230" height="230" fill="#0a1420"/>')
    b.append(f'<path d="M1050 660 L1050 500 A75 75 0 0 1 1200 500 L1200 660 Z" fill="{INK}"/>')
    b.append(f'<path d="M1080 500 L1170 620 M1170 500 L1080 620" stroke="{WAX}" stroke-width="12" stroke-linecap="round"/>')
    b.append(f'<text x="1125" y="700" font-family="monospace" font-size="26" fill="{WAX}" text-anchor="middle" opacity="0.85">ARMORY</text>')
    # baker figure heading to granary
    b.append(figure(760, 660, 150, "#02060d", accent=GOLD))
    b.append(f'<path d="M800 620 Q680 600 590 585" fill="none" stroke="{GOLD}" stroke-width="3" stroke-dasharray="9 7" opacity="0.7"/>')
    return "".join(b)

def sc_p33():  # inner gates, breach contained (fire in one ward)
    b = [base(33, WAX, nstars=60)]
    b.append(ground(660))
    # three wards separated by inner gates
    for i in range(3):
        x = 220 + i * 400
        b.append(f'<rect x="{x}" y="380" width="360" height="280" fill="#08182a" stroke="{GOLD}" stroke-width="2" opacity="0.9"/>')
    # inner gate walls between
    for x in [610, 1010]:
        b.append(f'<rect x="{x-14}" y="360" width="28" height="300" fill="#0a2036"/>')
        b.append(f'<rect x="{x-14}" y="360" width="28" height="300" fill="url(#glow)" opacity="0.3"/>')
    # fire contained in middle ward
    b.append(f'<circle cx="800" cy="560" r="120" fill="url(#glow)" opacity="0.5"/>')
    for fx in [770, 800, 830]:
        b.append(f'<path d="M{fx} 620 Q{fx-24} 560 {fx} 500 Q{fx+24} 560 {fx} 620 Z" fill="{WAX}" opacity="0.85"/>')
        b.append(f'<path d="M{fx} 610 Q{fx-12} 570 {fx} 535 Q{fx+12} 570 {fx} 610 Z" fill="{GOLD}" opacity="0.8"/>')
    return "".join(b)

def sc_p34():  # one door judging two travelers (allow/deny)
    b = [base(34, GOLD, nstars=60)]
    b.append(ground(660))
    # central door
    b.append(f'<rect x="710" y="380" width="180" height="280" fill="#0a1a2b"/>')
    b.append(f'<path d="M740 660 L740 470 A60 60 0 0 1 860 470 L860 660 Z" fill="{INK}"/>')
    b.append(f'<path d="M740 660 L740 470 A60 60 0 0 1 860 470 L860 660 Z" fill="url(#glow)" opacity="0.3"/>')
    # left traveler allowed (gold arrow in)
    b.append(figure(360, 660, 150, "#02060d", accent=GOLD))
    b.append(f'<path d="M470 560 L690 560" stroke="{GOLD}" stroke-width="6" opacity="0.8"/>')
    b.append(f'<path d="M690 560 L662 544 M690 560 L662 576" stroke="{GOLD}" stroke-width="6"/>')
    b.append(_glyph(360, 470, 20, "shield", GOLD))
    # right traveler denied (red arrow bounce)
    b.append(figure(1240, 660, 150, "#02060d", accent=WAX))
    b.append(f'<path d="M1130 560 L920 560" stroke="{WAX}" stroke-width="6" stroke-dasharray="10 8" opacity="0.8"/>')
    b.append(f'<path d="M1130 520 L1180 570 M1180 520 L1130 570" stroke="{WAX}" stroke-width="7" stroke-linecap="round"/>')
    return "".join(b)

def sc_p41():  # giant eye above realm, rays over roads
    b = [base(41, CYAN, nstars=80)]
    # giant eye in sky
    cx, cy = 800, 300
    b.append(f'<circle cx="{cx}" cy="{cy}" r="320" fill="url(#glow)" opacity="0.4"/>')
    b.append(f'<path d="M{cx-210} {cy} Q{cx} {cy-150} {cx+210} {cy} Q{cx} {cy+150} {cx-210} {cy} Z" '
             f'fill="#061626" stroke="{CYAN}" stroke-width="5"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="72" fill="{CYAN}" opacity="0.9"/>')
    b.append(f'<circle cx="{cx}" cy="{cy}" r="34" fill="{INK}"/>')
    b.append(f'<circle cx="{cx-20}" cy="{cy-20}" r="12" fill="{STAR}" opacity="0.8"/>')
    b.append(ground(680))
    # roads fanning out, watched
    for a in [-0.5, -0.2, 0.1, 0.4]:
        x2 = cx + a * 1600
        b.append(f'<line x1="{cx}" y1="{cy+90}" x2="{x2:.0f}" y2="900" stroke="{CYAN}" stroke-width="2" opacity="0.22"/>')
    b.append(castle(800, 760, 0.7, CYAN))
    return "".join(b)

def sc_p42():  # living map / constellation of nodes
    b = [base(42, CYAN, nstars=50)]
    b.append(f'<rect x="120" y="150" width="1360" height="640" rx="18" fill="#040e18" opacity="0.6" stroke="{CYAN}" stroke-width="1.5"/>')
    b.append(node_map(4242, 180, 200, 1240, 520, CYAN))
    b.append(f'<text x="150" y="200" font-family="monospace" font-size="24" fill="{CYAN}" opacity="0.6">REALM // LIVE MAP</text>')
    return "".join(b)

def sc_p43():  # bent path highlighted red among cyan
    b = [base(43, CYAN, nstars=50)]
    b.append(f'<rect x="120" y="150" width="1360" height="640" rx="18" fill="#040e18" opacity="0.6" stroke="{CYAN}" stroke-width="1.5"/>')
    b.append(node_map(9931, 180, 200, 1240, 520, CYAN, anomaly=True))
    b.append(f'<text x="150" y="200" font-family="monospace" font-size="24" fill="{WAX}" opacity="0.8">ANOMALY // granary&#8594;armory</text>')
    return "".join(b)

def sc_p44():  # sigil dimmed / revoked as eye watches
    b = [base(44, CYAN, nstars=60)]
    # watching eye small top
    b.append(f'<g transform="translate(800,180)">{_glyph(0,0,60,"eye",CYAN)}</g>')
    b.append(f'<circle cx="800" cy="180" r="120" fill="url(#glow)" opacity="0.3"/>')
    b.append(ground(660))
    # a fading wax seal
    b.append(f'<g opacity="0.35">{wax_seal(560, 500, 90, WAX, "shield")}</g>')
    b.append(f'<path d="M470 590 L650 410" stroke="{WAX}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>')
    # a new bright seal
    b.append(wax_seal(1060, 500, 90, WAX, "star"))
    b.append(f'<text x="560" y="640" font-family="monospace" font-size="24" fill="{WAX}" text-anchor="middle" opacity="0.8">REVOKED</text>')
    b.append(f'<text x="1060" y="640" font-family="monospace" font-size="24" fill="{GOLD}" text-anchor="middle" opacity="0.8">TRUSTED</text>')
    return "".join(b)

def sc_p51():  # stone tablet vs rewriting charter
    b = [base(51, GOLD, nstars=60)]
    b.append(ground(680))
    # stone tablet (static, cracked)
    b.append(f'<rect x="300" y="330" width="260" height="330" rx="10" fill="#0a1420" stroke="#1b2f45" stroke-width="4"/>')
    for yy in [400, 450, 500, 550, 600]:
        b.append(f'<rect x="340" y="{yy}" width="180" height="10" rx="5" fill="#1b2f45"/>')
    b.append(f'<path d="M430 330 L410 660" stroke="{BG}" stroke-width="6" opacity="0.8"/>')
    # living charter (glowing, rewriting)
    b.append(f'<rect x="1040" y="330" width="260" height="330" rx="10" fill="#08182a" stroke="{GOLD}" stroke-width="3"/>')
    b.append(f'<rect x="1040" y="330" width="260" height="330" rx="10" fill="url(#glow)" opacity="0.18"/>')
    b.append(rune_row(1070, 380, 200, GOLD, 5, seed=51))
    b.append(rune_row(1070, 440, 200, CYAN, 5, seed=52))
    b.append(rune_row(1070, 500, 200, GOLD, 5, seed=53))
    b.append(rune_row(1070, 560, 200, CYAN, 5, seed=54))
    # arrow of transformation
    b.append(f'<path d="M600 500 L1010 500" stroke="{GOLD}" stroke-width="5" stroke-dasharray="12 8" opacity="0.7"/>')
    b.append(f'<path d="M1010 500 L978 482 M1010 500 L978 518" stroke="{GOLD}" stroke-width="5"/>')
    return "".join(b)

def sc_p52():  # one gate learns -> light spreads to many
    b = [base(52, GOLD, nstars=60)]
    b.append(ground(700))
    # source gate bright
    sx, sy = 300, 560
    b.append(f'<circle cx="{sx}" cy="{sy}" r="120" fill="url(#glow)" opacity="0.5"/>')
    b.append(f'<rect x="{sx-40}" y="{sy-120}" width="80" height="140" fill="#0a1f34" stroke="{GOLD}" stroke-width="3"/>')
    b.append(f'<circle cx="{sx}" cy="{sy-70}" r="16" fill="{GOLD}"/>')
    # spreading nodes
    targets = [(620, 400), (720, 640), (980, 340), (1080, 600), (1300, 440), (1360, 680)]
    for i, (tx, ty) in enumerate(targets):
        b.append(f'<line x1="{sx}" y1="{sy-60}" x2="{tx}" y2="{ty}" stroke="{GOLD}" stroke-width="2" opacity="0.4"/>')
        ac = GOLD if i % 2 == 0 else CYAN
        b.append(f'<rect x="{tx-26}" y="{ty-46}" width="52" height="70" fill="#0a1f34" stroke="{ac}" stroke-width="2"/>')
        b.append(f'<circle cx="{tx}" cy="{ty-16}" r="9" fill="{ac}" opacity="0.85"/>')
        b.append(f'<circle cx="{tx}" cy="{ty-16}" r="22" fill="url(#glow)" opacity="0.3"/>')
    return "".join(b)

def sc_p53():  # trust as a tide, rising
    b = [base(53, CYAN, moon_at=(1300, 200, 74, GOLD), nstars=70)]
    # travelers on shore
    b.append(ground(720, fill="#081726"))
    for i in range(3):
        b.append(figure(240 + i * 120, 720, 130 - i * 8, "#01040a"))
    # tide waves rising with markers
    for i, (yy, op) in enumerate([(560, 0.25), (620, 0.35), (680, 0.5)]):
        b.append(f'<path d="M0 {yy} Q400 {yy-40} 800 {yy} T1600 {yy} V900 H0 Z" fill="{CYAN}" opacity="{op}"/>')
    # rising trust gauge on right
    b.append(f'<rect x="1360" y="300" width="60" height="420" rx="30" fill="#0a1f34" stroke="{CYAN}" stroke-width="2"/>')
    b.append(f'<rect x="1360" y="480" width="60" height="240" rx="30" fill="url(#gold)" opacity="0.75"/>')
    b.append(f'<path d="M1390 470 L1390 340 M1390 340 L1372 366 M1390 340 L1408 366" stroke="{GOLD}" stroke-width="5"/>')
    return "".join(b)

def sc_p54():  # finale: wall dissolved into points of light, realm watchful
    b = [base(54, GOLD, moon_at=(800, 210, 96, GOLD), aurora=True, nstars=120)]
    b.append(ground(700))
    # dissolved wall — dotted remnants of crenellation turning to light
    r = rng(54)
    for i in range(60):
        x = 60 + i * 25
        y = 560 + (r() - 0.5) * 60
        rad = 2 + r() * 4
        ac = GOLD if r() > 0.5 else CYAN
        b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad:.1f}" fill="{ac}" opacity="{0.4+r()*0.5:.2f}"/>')
    # small watchful eyes floating over the realm
    for (ex, ey) in [(360, 380), (800, 330), (1240, 400)]:
        b.append(f'<g opacity="0.85">{_glyph(ex, ey, 30, "eye", CYAN)}</g>')
        b.append(f'<circle cx="{ex}" cy="{ey}" r="60" fill="url(#glow)" opacity="0.25"/>')
    # central seal of the new charter
    b.append(wax_seal(800, 640, 70, WAX, "star"))
    return "".join(b)


PANELS = {
    "p11": (GOLD, sc_p11), "p12": (GOLD, sc_p12), "p13": (WAX, sc_p13), "p14": (GOLD, sc_p14),
    "p21": (CYAN, sc_p21), "p22": (CYAN, sc_p22), "p23": (CYAN, sc_p23), "p24": (CYAN, sc_p24),
    "p31": (GOLD, sc_p31), "p32": (GOLD, sc_p32), "p33": (WAX, sc_p33), "p34": (GOLD, sc_p34),
    "p41": (CYAN, sc_p41), "p42": (CYAN, sc_p42), "p43": (WAX, sc_p43), "p44": (CYAN, sc_p44),
    "p51": (GOLD, sc_p51), "p52": (GOLD, sc_p52), "p53": (CYAN, sc_p53), "p54": (GOLD, sc_p54),
}


# =========================================================================
# TITLE
# =========================================================================
def sc_title():
    b = [base(7, GOLD, moon_at=(1280, 200, 104, GOLD), aurora=True, nstars=160)]
    b.append(ground(640))
    # layered ridges
    b.append(f'<path d="M0 700 Q300 620 640 680 T1600 640 V900 H0 Z" fill="url(#ridge)"/>')
    b.append(castle(800, 700, 1.6, GOLD))
    b.append(f'<path d="M0 760 Q420 700 800 760 T1600 740 V900 H0 Z" fill="url(#hill)"/>')
    # banner
    b.append(f'<rect x="792" y="150" width="6" height="260" fill="{GOLD}" opacity="0.7"/>')
    b.append(f'<path d="M798 160 L900 190 L798 230 Z" fill="{WAX}"/>')
    return svg(W, H, GOLD, "".join(b))


# =========================================================================
# CAST PORTRAITS  (3:4)
# =========================================================================
def cast_base(seed, accent):
    b = [f'<rect width="{CW}" height="{CH}" fill="url(#sky)"/>']
    b.append(stars(seed, 50, CW, CH, int(CH * 0.6)))
    # spotlight
    b.append(f'<ellipse cx="{CW/2:.0f}" cy="{CH*0.42:.0f}" rx="360" ry="420" fill="url(#glow)" opacity="0.28"/>')
    # pedestal
    b.append(f'<ellipse cx="{CW/2:.0f}" cy="{CH*0.86:.0f}" rx="300" ry="60" fill="#040c16"/>')
    b.append(f'<ellipse cx="{CW/2:.0f}" cy="{CH*0.86:.0f}" rx="300" ry="60" fill="none" stroke="{accent}" stroke-width="2" opacity="0.5"/>')
    return b

def cast_svg(seed, accent, figure_extra, emblem):
    b = cast_base(seed, accent)
    b.append(figure(CW / 2, CH * 0.9, CH * 0.66, "#02070f", accent=accent))
    b.extend(figure_extra)
    # emblem badge bottom
    b.append(f'<circle cx="{CW/2:.0f}" cy="{CH*0.9:.0f}" r="4" fill="none"/>')
    b.append(emblem)
    b.append(vignette(CW, CH))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CW} {CH}" width="{CW}" height="{CH}" role="img">\n'
            f'{defs(accent, CW, CH)}\n' + "".join(b) + "\n</svg>\n")

def cast_sovereign():
    extra = [_glyph(CW / 2, CH * 0.20, 60, "crown", GOLD),
             f'<circle cx="{CW/2:.0f}" cy="{CH*0.20:.0f}" r="120" fill="url(#glow)" opacity="0.3"/>']
    emblem = _glyph(CW / 2, CH * 0.90, 46, "crown", GOLD)
    return cast_svg(101, GOLD, extra, emblem)

def cast_herald():
    extra = [f'<rect x="{CW/2+70:.0f}" y="{CH*0.42:.0f}" width="26" height="150" rx="10" fill="{PARCH}" opacity="0.9"/>',
             f'<path d="M{CW/2+140:.0f} {CH*0.40:.0f} l90 -30 l0 70 z" fill="{CYAN}" opacity="0.85"/>']
    emblem = _glyph(CW / 2, CH * 0.90, 40, "star", CYAN)
    return cast_svg(102, CYAN, extra, emblem)

def cast_gatekeeper():
    extra = [f'<g transform="translate({CW/2:.0f},{CH*0.44:.0f})">{_glyph(0,0,90,"shield",GOLD)}</g>',
             f'<rect x="{CW/2-70:.0f}" y="{CH*0.40:.0f}" width="140" height="10" fill="#0a1f34"/>']
    emblem = _glyph(CW / 2, CH * 0.90, 42, "shield", GOLD)
    return cast_svg(103, GOLD, extra, emblem)

def cast_cartographer():
    extra = [f'<rect x="{CW/2-90:.0f}" y="{CH*0.40:.0f}" width="180" height="130" rx="8" fill="#08182a" stroke="{CYAN}" stroke-width="3"/>',
             node_map(555, CW / 2 - 78, CH * 0.42, 156, 100, CYAN)]
    emblem = _glyph(CW / 2, CH * 0.90, 40, "eye", CYAN)
    return cast_svg(104, CYAN, extra, emblem)

def cast_sentinel():
    extra = [f'<g transform="translate({CW/2:.0f},{CH*0.36:.0f})">{_glyph(0,0,110,"eye",CYAN)}</g>',
             f'<circle cx="{CW/2:.0f}" cy="{CH*0.36:.0f}" r="150" fill="url(#glow)" opacity="0.32"/>']
    emblem = _glyph(CW / 2, CH * 0.90, 44, "eye", CYAN)
    return cast_svg(105, CYAN, extra, emblem)

def cast_courier():
    extra = [f'<rect x="{CW/2-70:.0f}" y="{CH*0.46:.0f}" width="140" height="96" rx="6" fill="{PARCH}" opacity="0.92"/>',
             f'<path d="M{CW/2-70:.0f} {CH*0.46:.0f} L{CW/2:.0f} {CH*0.53:.0f} L{CW/2+70:.0f} {CH*0.46:.0f}" fill="none" stroke="#b79a5c" stroke-width="3"/>',
             wax_seal(CW / 2, CH * 0.55, 26, WAX, "star")]
    emblem = key_icon(CW / 2, CH * 0.885, 1.6, 0, GOLD)
    return cast_svg(106, GOLD, extra, emblem)

def cast_pretender():
    # masked figure, wax red
    extra = [f'<path d="M{CW/2-70:.0f} {CH*0.30:.0f} Q{CW/2:.0f} {CH*0.26:.0f} {CW/2+70:.0f} {CH*0.30:.0f} '
             f'Q{CW/2+50:.0f} {CH*0.37:.0f} {CW/2:.0f} {CH*0.38:.0f} Q{CW/2-50:.0f} {CH*0.37:.0f} {CW/2-70:.0f} {CH*0.30:.0f} Z" '
             f'fill="{WAX}" opacity="0.9"/>',
             f'<circle cx="{CW/2-28:.0f}" cy="{CH*0.315:.0f}" r="9" fill="{INK}"/>',
             f'<circle cx="{CW/2+28:.0f}" cy="{CH*0.315:.0f}" r="9" fill="{INK}"/>',
             key_icon(CW / 2 + 120, CH * 0.5, 1.8, 30, WAX)]
    emblem = _glyph(CW / 2, CH * 0.90, 42, "key", WAX)
    return cast_svg(107, WAX, extra, emblem)


CAST = {
    "cast_sovereign": cast_sovereign,
    "cast_herald": cast_herald,
    "cast_gatekeeper": cast_gatekeeper,
    "cast_cartographer": cast_cartographer,
    "cast_sentinel": cast_sentinel,
    "cast_courier": cast_courier,
    "cast_pretender": cast_pretender,
}


def main():
    os.makedirs(OUT, exist_ok=True)
    count = 0
    # title
    with open(os.path.join(OUT, "title.svg"), "w") as f:
        f.write(sc_title())
    count += 1
    # panels
    for name, (accent, fn) in PANELS.items():
        with open(os.path.join(OUT, name + ".svg"), "w") as f:
            f.write(svg(W, H, accent, fn()))
        count += 1
    # cast
    for name, fn in CAST.items():
        with open(os.path.join(OUT, name + ".svg"), "w") as f:
            f.write(fn())
        count += 1
    print(f"wrote {count} svg assets to {OUT}")


if __name__ == "__main__":
    main()
