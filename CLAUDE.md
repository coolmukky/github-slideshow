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

## Art status — photoreal regeneration is DONE

All 28 images (`title`, `p11`…`p54`, and the 7 `cast_*`) are **photoreal cinematic renders**
in the slide-12 style. The original code-painted watercolor set has been fully replaced; every
previous version remains recoverable from git history.

If you need to regenerate or replace any single image:

1. `prompts/image_prompts.md` holds the global style block, negative prompt, cast consistency
   anchors, and one prompt per panel. In practice these worked best with `wide 16:9 cinematic
   composition, full-bleed, no white border or frame` appended, and with the recurring cast
   (King, Lords, Maester) generated first and reused as references.
2. Drop the new file in with `python scripts/add_art.py <image> <slot>` — it trims any baked-in
   white border, fits to the exact size the page and deck expect (`--anchor low|high` when the
   subject sits off-centre), and rebuilds the page, the .pptx and the live build in one step.
3. `scripts/generate_images.py` remains wired for API-driven generation (OpenAI / Replicate /
   Stability, auto-detected from whichever key is set) if you have egress to an image host.

Output sizes: **1280×720** for panels/title, **640×640** for cast. Keep filenames identical —
the page and deck reference images by these names.

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
