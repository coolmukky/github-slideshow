#!/usr/bin/env python3
"""
generate_images.py — regenerate the storyboard art as photoreal, "slide 12" renders.

Fill in `call_image_api()` for whatever image model you have access to, then run:

    python scripts/generate_images.py            # all images
    python scripts/generate_images.py p24 p53    # just these

Output: page/assets/<name>.jpg  (16:9 for panels/title, 1:1 for cast) — the exact filenames
the interactive page and the deck builder already reference. Keep the names identical.

Prompts here mirror prompts/image_prompts.md. Edit there and here together if you tune them.
"""
import os, sys, io
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Please `pip install Pillow` first.")

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "page" / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

# ---- global art direction (matches slide 12) ----
STYLE = ("Cinematic dark-fantasy concept art, photorealistic matte painting, medieval castle-at-night "
         "mood, deep midnight-blue palette with warm golden candlelight and cool moonlight, dramatic "
         "rolling storm clouds, volumetric light, atmospheric haze, epic movie-poster lighting, subtle "
         "teal-and-gold cinematic color grade, rich detail, 35mm, 16:9 cinematic composition. ")
NEGATIVE = ("text, letters, captions, watermark, signature, logo, modern objects, cars, electronics, "
            "low quality, blurry, deformed hands, extra fingers, flat vector, cartoon, oversaturated, harsh daylight.")

# ---- per-image scene prompts (see prompts/image_prompts.md for the annotated versions) ----
SCENES = {
"title": "A vast dark medieval CASTLE on a rocky crag at night, glowing golden windows, dramatic storm clouds and a bright moon, a lone cloaked figure with a glowing golden MEDALLION in the foreground looking toward the castle; open sky at top for a title.",
# Chapter 1
"p11": "Inside a candle-lit stone CHAMBER, an aging crowned KING extends both hands toward a blue-robed LORD; between them float a glowing golden MEDALLION and a red-sealed PARCHMENT SCROLL; warm light on their faces; tall arched moonlit window behind.",
"p12": "Hero close-up of a glowing golden MEDALLION engraved with a soundwave, hovering in a dark CHAMBER; luminous cyan voiceprint waves ripple outward past a lord's silhouette; warm-and-cool contrast, volumetric glow.",
"p13": "A large aged PARCHMENT SCROLL laid open on a dark oak table, a quill beside it and a dripping red wax CROWN SEAL; a king's hand pressing the seal; intimate candlelit cinematic lighting.",
"p14": "At a torch-lit arched CHAMBER doorway, an armored GUARD with a spear inspects a blue-robed LORD who holds up a glowing MEDALLION; faint cyan voiceprint waves in the air; a glowing parchment invite-list to one side; moody and tense.",
"p15": "Several noble LORDS seated around a round oak table in a candle-lit CHAMBER, each holding up a sealed PARCHMENT SCROLL to verify one another; warm rim light; arched moonlit window behind.",
# Chapter 2
"p21": "Three LORDS around a glowing round table placing their sealed SCROLLS toward the centre; faint cyan energy threads converging to a point of light; dark chamber; cinematic.",
"p22": "Sealed scrolls streaming upward and merging into a floating open GLOWING TOME that radiates brilliant cyan light with shifting cipher runes; dark council chamber; magical volumetric glow; hero shot.",
"p23": "A LORD stepping through a torch-lit doorway into a CHAMBER; a dim fading magic tome on the left and a bright NEW GLOWING TOME on the right, an arc of light passing between them; sense of a key being rotated.",
"p24": "A glowing cipher TOME secure inside a dark CHAMBER; at the tall arched window a black CROW with a cold glinting eye peers in, unable to read the scrambled runes; ominous cool rim light.",
# Chapter 3
"p31": "Portrait of a hooded MAESTER, a learned scholar in dark-purple robes with a metal chain of office, holding an open book and quill; warm candlelight in a stone CHAMBER; wise, trustworthy.",
"p32": "The crowned KING hands a glowing red-sealed SCROLL to a hooded MAESTER in a candle-lit CHAMBER; warm ceremonial light.",
"p33": "A gold-robed chairman LORD at a round table gestures toward a doorway where a hooded MAESTER waits at the threshold, inviting him in; candle-lit CHAMBER.",
"p34": "A hooded MAESTER seated at a round table between two LORDS, a glowing TOME hovering above the table, the Maester writing notes with a quill; warm collaborative scene.",
"p35": "A heavy locked royal VAULT glowing warm as a red-sealed scroll is placed inside; to the side a small dark castle silhouette marked with a glowing magenta no-entry symbol; secure and exclusive.",
# Chapter 4
"p41": "A blue-robed LORD at a chamber table turns toward a hooded SERVANT carrying a tray of goblets at an archway leading outside; warm doorway light spilling in.",
"p42": "A small glowing golden FISH hovering mid-air in a CHAMBER, emitting cyan sound-ripples on one side and warm sound-ripples on the other; a hooded MAESTER nearby; bridging the encrypted room and the outside world.",
# Chapter 5
"p51": "Epic wide establishing shot: the great dark CASTLE on its crag, and across dark moonlit water a distant island castle (the Kingdom of the Isles); storm clouds and a bright moon; cinematic.",
"p52": "The great castle and a distant island linked across open moonlit water by a glowing cyan protective thread with a luminous SHIELD emblem at its centre, beyond the castle walls; dramatic.",
"p53": "A black CARRIER CROW in flight over moonlit water carrying a small glowing red-sealed SCROLL in its talons, flying from the great castle toward a distant island; warm glow; epic night sky.",
"p54": "Inside a CHAMBER, an ornate gilded MAGIC MIRROR glows cyan showing a distant envoy's face; a temporary red-sealed SCROLL beside it; a glowing shared TOME links the mirror to a LORD at the table.",
# Cast (square)
"cast_king": "Full-body portrait of an aging bearded KING in a gold-and-crimson robe wearing a jewelled crown, warm authoritative presence, dark chamber, candlelight.",
"cast_lords": "Two noble LORDS in deep-blue and teal robes, each wearing a glowing golden MEDALLION pendant, dark chamber backdrop.",
"cast_castle": "A vast dark stone CASTLE of many towers and battlements on a rocky crag at night, warm-glowing windows, moonlit.",
"cast_chamber": "A candle-lit stone COUNCIL CHAMBER with a round oak table and a tall arched gothic window showing the moon, a few seated lords.",
"cast_maester": "A hooded MAESTER in dark-purple robes with a linked-metal chain of office, holding a book and quill, warm candlelight.",
"cast_medallion": "An ornate glowing golden MEDALLION engraved with a soundwave / voiceprint motif, cyan glow, dark backdrop.",
"cast_patent": "An aged PARCHMENT SCROLL closed with a red wax seal stamped with a crown, warm candlelight, dark backdrop.",
}

CAST = {k for k in SCENES if k.startswith("cast_")}
WEB = {"panel": (1280, 720), "cast": (640, 640)}


def call_image_api(prompt: str, negative: str, size: str) -> bytes:
    """
    RETURN raw image bytes (PNG/JPEG) for the given prompt.
    `size` is either "1792x1024" (16:9) or "1024x1024" (1:1).
    Implement ONE of the examples below for your provider, then delete the raise.
    """
    raise NotImplementedError(
        "Wire up call_image_api() to your image model — see commented examples in this function."
    )

    # --- Example: OpenAI Images (pip install openai; export OPENAI_API_KEY) ---
    # from openai import OpenAI
    # import base64
    # client = OpenAI()
    # r = client.images.generate(model="gpt-image-1", prompt=prompt, size=size, quality="high")
    # return base64.b64decode(r.data[0].b64_json)

    # --- Example: Replicate SDXL/Flux (pip install replicate; export REPLICATE_API_TOKEN) ---
    # import replicate, requests
    # w, h = size.split("x")
    # out = replicate.run("black-forest-labs/flux-1.1-pro",
    #                     input={"prompt": prompt, "width": int(w), "height": int(h)})
    # url = out[0] if isinstance(out, list) else out
    # return requests.get(url).content

    # --- Example: Stability (pip install requests; export STABILITY_KEY) ---
    # import requests
    # resp = requests.post("https://api.stability.ai/v2beta/stable-image/generate/core",
    #     headers={"authorization": f"Bearer {os.environ['STABILITY_KEY']}", "accept": "image/*"},
    #     files={"none": ''}, data={"prompt": prompt, "negative_prompt": negative,
    #     "aspect_ratio": "16:9" if size.startswith('1792') else "1:1", "output_format": "jpeg"})
    # resp.raise_for_status(); return resp.content


def render(name: str):
    scene = SCENES[name]
    is_cast = name in CAST
    size = "1024x1024" if is_cast else "1792x1024"
    prompt = STYLE + scene
    raw = call_image_api(prompt, NEGATIVE, size)
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im = im.resize(WEB["cast" if is_cast else "panel"])
    out = ASSETS / f"{name}.jpg"
    im.save(out, quality=86, optimize=True)
    print("wrote", out.relative_to(ROOT))


def main():
    want = sys.argv[1:] or list(SCENES.keys())
    unknown = [n for n in want if n not in SCENES]
    if unknown:
        sys.exit(f"Unknown name(s): {unknown}\nValid: {', '.join(SCENES)}")
    for n in want:
        render(n)
    print("Done. Now: python scripts/build_embed.py  &&  (cd deck && node build_deck.js)")


if __name__ == "__main__":
    main()
