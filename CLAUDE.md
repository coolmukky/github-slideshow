# CLAUDE.md — project brief for Claude Code

This is an **interactive storyboard** that retells Cisco's Ultra Secure Collaboration
(zero-trust meetings) as a medieval-fantasy fable. Source story = slides 15–19 of the
Tech Elevate / GSX 2026 deck; one storyboard panel per bullet (20 panels), grouped into
5 chapters, each mapped to a real Cisco capability.

## What's here

```
page/
  index.html                 # the interactive page (loads images from ./assets)
  assets/                    # 21 panel images (p11..p54, title) + 7 cast_*.jpg
  Storyboard_interactive.html# single-file build with images embedded as data URIs
deck/
  build_deck.js              # rebuilds the .pptx from the images in page/assets
  Kingdom_...Storyboard.pptx # the currently built slide deck
prompts/
  image_prompts.md           # photoreal image-gen prompts (one per panel) — slide-12 style
scripts/
  generate_images.py         # OPTIONAL: call an image API to regenerate photoreal panels
  build_embed.py             # rebuild page/Storyboard_interactive.html after swapping images
README.md                    # human setup + run steps
```

## The single most useful thing you can do here

The delivered images are **code-painted watercolor** (no image generator was available when
they were made). The brief is a **photoreal, "slide 12" cinematic look**. So the high-value task
is: **regenerate the 21 panels + 7 cast images as photoreal renders**, then everything else
(page + deck) rebuilds around them.

1. Read `prompts/image_prompts.md` — it has a global style block, negative prompt, consistency
   anchors for the cast, and one prompt per panel (`p11`…`p54`), the `title`, and the 7 `cast_*`.
2. Use `scripts/generate_images.py` as the driver. Fill in the `call_image_api()` function for
   whatever image model the user has (OpenAI Images, Replicate, fal, Stability, a local SDXL/Flux,
   etc.). Output **16:9** for panels/title and **1:1** for cast, written to `page/assets/<name>.jpg`
   with these exact filenames:
   `title, p11,p12,p13,p14,p15, p21,p22,p23,p24, p31,p32,p33,p34,p35, p41,p42, p51,p52,p53,p54,`
   `cast_king, cast_lords, cast_castle, cast_chamber, cast_maester, cast_medallion, cast_patent`.
3. Rebuild the single-file page:  `python scripts/build_embed.py`
4. Rebuild the deck:  `cd deck && npm i && node build_deck.js`

Keep filenames identical — the page and deck reference images by these names, so new art drops
straight in with no code changes.

## Content model (don't drift from it)

- The **story text** (fable) and the **"In Cisco Terms"** decoder for every panel live inside
  `page/index.html` (`PANELS`, `CH`, `CAST`, `RECAP` objects) and are duplicated in
  `deck/build_deck.js`. If you change wording, change both. These were reviewed and approved —
  don't rewrite them unless asked.
- Chapter → capability map: 1 Zero-Trust Identity · 2 Zero-Trust Encryption · 3 Services
  (Video Mesh / on-prem AI, recording) · 4 PSTN & external audio · 5 external participants via
  browser. GA dates: Q3 CY26 except chapter 4 (Q4 CY26).

## Style anchors (for any new art)

Cinematic dark-fantasy, deep midnight-blue (#07182D), warm cand+ window gold (#FFB74A), cool
moonlight and storm clouds, cyan "magic/encryption" glow (#02C8FF), wax-red seals (#C8324B).
Figures read as rim-lit silhouettes. No text baked into images — captions live on the page/slide.

## Conventions

- Node ≥ 18 for the deck (`pptxgenjs`). Python ≥ 3.9 for scripts (`Pillow`; plus your image SDK).
- The page is dependency-free vanilla HTML/CSS/JS; open `page/index.html` directly or serve the folder.
- Fonts (Cinzel / EB Garamond / Inter / Space Mono) load from Google Fonts; offline they fall back
  gracefully to serif/sans/mono.
