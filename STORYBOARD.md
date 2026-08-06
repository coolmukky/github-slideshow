# The Kingdom of Ultra Secure Collaboration — Interactive Storyboard

An interactive retelling of Cisco's zero-trust secure collaboration story (Tech Elevate / GSX 2026,
story slides 15–19) as a medieval-fantasy fable — the fable on parchment, the Cisco meaning decoded
alongside every panel.

## Run the page

No build needed. Either:

- **Open directly:** double-click `page/index.html`, or
- **Serve it** (recommended, avoids any browser file:// quirks):

```bash
cd page
python3 -m http.server 8000
# visit http://localhost:8000
```

Or just open the all-in-one file `page/Storyboard_interactive.html` — images are embedded, so it
works offline from anywhere (email it, drop it on a share, etc.).

### Controls
`←` / `→` or space move · `D` decode (show/hide the Cisco meaning) · `C` cast · `F` fullscreen ·
`Home` back to title · click a chapter on the bottom rail to jump.

## Rebuild the slide deck (.pptx)

```bash
cd deck
npm install       # installs pptxgenjs
node build_deck.js
```

Outputs `Kingdom_of_Ultra_Secure_Collaboration_Storyboard.pptx` using the images in `page/assets`.

## The art

All 28 images are **photoreal cinematic renders** (the "slide 12" look). The original watercolor
set has been replaced; earlier versions are recoverable from git history.

To replace any single image: `python scripts/add_art.py <image> <slot>` — it sizes the file
correctly and rebuilds the page, deck and live build together.

To regenerate the whole set from scratch:

1. Open `prompts/image_prompts.md` — global style, negative prompt, cast consistency anchors, and
   one prompt per panel.
2. Edit `scripts/generate_images.py` → implement `call_image_api()` for your image model
   (OpenAI Images, Replicate, fal, Stability, local SDXL/Flux…), set your API key via env var.
3. Run it — it writes new files into `page/assets/` using the exact names the page/deck expect.
4. `python scripts/build_embed.py` to refresh the single-file page, and rebuild the deck (above).

Keep the filenames identical and nothing else needs to change.

## Layout

```
page/    interactive page + images (+ single-file build)
deck/    pptx builder + current deck
prompts/ photoreal image-generation prompt pack
scripts/ image-gen driver + single-file page builder
```

## Notes
- Fonts load from Google Fonts; offline they fall back to serif/sans/mono.
- Story text and Cisco decoders were reviewed/approved — they live in both `page/index.html` and
  `deck/build_deck.js`; keep the two in sync if you edit copy.
- `paintkit` (the watercolor engine behind the original art) is Apache-2.0 and is not required to
  run the page or deck.
