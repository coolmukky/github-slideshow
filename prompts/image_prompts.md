# Kingdom of Ultra Secure Collaboration — Image-Generation Prompt Pack

Prompts to recreate the storyboard as **photoreal, cinematic renders in the style of slide 12**
("Game of Zones" dark-fantasy movie-poster look). One prompt per storyboard panel, plus the
cast, title, and chapter heroes. Panel codes match the deck (`p11` = Chapter 1, bullet 1).

> Note: the delivered .pptx was illustrated **in code** (no image model was available in that
> environment), so these prompts were **not** used to build it — they are provided so you can
> regenerate photoreal versions with an image generator.

---

## 1. Global style block  — PREPEND to every prompt

```
Cinematic dark-fantasy concept art, photorealistic matte painting, medieval "castle at night"
mood, deep midnight-blue palette with warm golden candlelight and cool moonlight, dramatic
rolling storm clouds, volumetric light, atmospheric haze, epic movie-poster lighting, subtle
teal-and-gold cinematic color grade, rich detail, 35mm, 16:9 cinematic composition.
```

## 2. Negative prompt  — APPEND to every prompt (or use the tool's negative field)

```
text, letters, captions, watermark, signature, logo, modern objects, cars, electronics,
low quality, blurry, deformed hands, extra fingers, flat vector, cartoon, oversaturated, harsh daylight.
```

## 3. Consistency anchors (recurring "cast")

Reuse these exact descriptors wherever a character/prop appears so renders stay consistent.
For Midjourney, generate the cast first and pass them as character/style references (`--cref` / `--sref`).

- **KING** — an aging bearded king in a gold-and-crimson robe wearing a jewelled crown; warm, authoritative.
- **LORDS** — noble lords in deep-blue and teal robes, each wearing a glowing golden medallion pendant.
- **MAESTER** — a hooded scholar in dark-purple robes with a linked-metal chain of office, holding a book and quill.
- **GUARD** — an armored castle guard in a hood, holding a spear, at a chamber doorway.
- **SERVANT** — a simple hooded servant carrying a tray of goblets.
- **CASTLE** — a vast dark stone castle of many towers and battlements on a rocky crag, warm-glowing windows.
- **CHAMBER** — a candle-lit stone council chamber with a round oak table and a tall arched gothic window showing the moon.
- **MEDALLION** — an ornate glowing golden medallion engraved with a soundwave / voiceprint motif.
- **LETTERS PATENT** — an aged parchment scroll closed with a red wax seal stamped with a crown.
- **MAGIC BOOK** — an open floating tome radiating brilliant cyan-blue light, pages full of shifting cipher runes.
- **CROW (eavesdropper)** — a black crow with a cold glinting eye, perched at a window.
- **CARRIER CROW (messenger)** — a black crow in flight, warm-lit, carrying a small red-sealed scroll in its talons.
- **BABEL FISH** — a small glowing golden fish hovering in the air, emitting sound ripples.
- **MAGIC MIRROR** — an ornate gilded standing mirror glowing with cyan light, showing a distant person's face.
- **VAULT** — a heavy locked royal strongbox/vault with a glowing keyhole.
- **ISLE** — a distant island castle across dark moonlit water.

---

## 4. Title / cover

```
Epic cinematic movie-poster: a vast dark medieval CASTLE on a rocky crag at night, glowing
golden windows, dramatic storm clouds and a bright moon, a lone cloaked figure with a glowing
golden MEDALLION standing in the foreground looking toward the castle; deep midnight-blue and
gold; wide 16:9; open sky at top for a title.
```

---

## 5. Panel prompts

### Chapter 1 — Independently Verified Identity  (represents: Zero-Trust Identity)

**p11 — Each Lord issued two forms of identity**
```
Inside a candle-lit stone CHAMBER, an aging crowned KING extends both hands toward a blue-robed
LORD; between them float a glowing golden MEDALLION and a red-sealed PARCHMENT SCROLL; warm light
on their faces; tall arched moonlit window behind.
```

**p12 — A medallion used together with your voice**
```
Hero close-up of a glowing golden MEDALLION engraved with a soundwave, hovering in a dark CHAMBER;
luminous cyan voiceprint waves ripple outward past a lord's silhouette; warm-and-cool contrast,
volumetric glow.
```

**p13 — A "letters patent" signed and sealed by the king**
```
A large aged PARCHMENT SCROLL laid open on a dark oak table, a quill beside it and a dripping red
wax CROWN SEAL; a king's hand pressing the seal; intimate candlelit cinematic lighting.
```

**p14 — Show medallion to guards, verify by voice, be on the invite list**
```
At a torch-lit arched CHAMBER doorway, an armored GUARD with a spear inspects a blue-robed LORD
who holds up a glowing MEDALLION; faint cyan voiceprint waves in the air; a glowing parchment
invite-list to one side; moody and tense.
```

**p15 — Inside, the lords show letters patent to one another**
```
Several noble LORDS seated around a round oak table in a candle-lit CHAMBER, each holding up a
sealed PARCHMENT SCROLL to verify one another; warm rim light; arched moonlit window behind.
```

### Chapter 2 — Zero-Trust End-to-End Encryption  (represents: E2E encryption, rotating keys)

**p21 — All participants share their letters patent**
```
Three LORDS around a glowing round table placing their sealed SCROLLS toward the centre; faint
cyan energy threads converging to a point of light; dark chamber; cinematic.
```

**p22 — Combined, they create a "magic book" holding the code**
```
Sealed scrolls streaming upward and merging into a floating open GLOWING TOME that radiates
brilliant cyan light with shifting cipher runes; dark council chamber; magical volumetric glow;
hero shot.
```

**p23 — New lord enters/leaves → a new book replaces the old**
```
A LORD stepping through a torch-lit doorway into a CHAMBER; a dim, fading magic tome on the left
and a bright NEW GLOWING TOME on the right, an arc of light passing between them; sense of a key
being rotated.
```

**p24 — A crow eavesdrops at the window but cannot decode**
```
A glowing cipher TOME secure inside a dark CHAMBER; at the tall arched window a black CROW with a
cold glinting eye peers in, unable to read the scrambled runes; ominous cool rim light.
```

### Chapter 3 — Adding Services into the Meeting  (represents: Video Mesh / on-prem AI, recording)

**p31 — The king employs Maesters as scribes**
```
Portrait of a hooded MAESTER — a learned scholar in dark-purple robes with a metal chain of
office — holding an open book and quill; warm candlelight in a stone CHAMBER; wise, trustworthy.
```

**p32 — The king issues special letters patent to the Maesters**
```
The crowned KING hands a glowing red-sealed SCROLL to a hooded MAESTER in a candle-lit CHAMBER;
warm ceremonial light.
```

**p33 — The chairperson asks a Maester to enter**
```
A gold-robed chairman LORD at a round table gestures toward a doorway where a hooded MAESTER waits
at the threshold, inviting him in; candle-lit CHAMBER.
```

**p34 — Maester joins, new book generated, documents and advises**
```
A hooded MAESTER seated at a round table between two LORDS, a glowing TOME hovering above the
table, the Maester writing notes with a quill; warm collaborative scene.
```

**p35 — Records stored in the king's vault; castle operator has no access**
```
A heavy locked royal VAULT glowing warm as a red-sealed scroll is placed inside; to the side, a
small dark castle silhouette marked with a glowing magenta "no-entry" symbol; secure and exclusive.
```

### Chapter 4 — Including Others (PSTN & beyond)  (represents: gateway to external/legacy audio)

**p41 — Lords call servants for food and wine**
```
A blue-robed LORD at a chamber table turns toward a hooded SERVANT carrying a tray of goblets at
an archway leading outside; warm doorway light spilling in.
```

**p42 — A Babel Fish translates between the coded conversation and the outside world**
```
A small glowing golden FISH hovering mid-air in a CHAMBER, emitting cyan sound-ripples on one
side and warm sound-ripples on the other; a hooded MAESTER nearby; it bridges the encrypted room
and the outside world.
```

### Chapter 5 — Adding External Participants  (represents: external guests via browser + temp identity)

**p51 — People from the Kingdom of the Isles (alliances)**
```
Epic wide establishing shot: the great dark CASTLE on its crag, and across dark moonlit water a
distant island castle (the Kingdom of the Isles); storm clouds and a bright moon; cinematic.
```

**p52 — Sensitive, protected, but not confined to the chamber**
```
The great castle and a distant island linked across open moonlit water by a glowing cyan
protective thread with a luminous SHIELD emblem at its centre, beyond the castle walls; dramatic.
```

**p53 — A temporary letters patent, sent by Carrier Crow**
```
A black CARRIER CROW in flight over moonlit water, carrying a small glowing red-sealed SCROLL in
its talons, flying from the great castle toward a distant island; warm glow; epic night sky.
```

**p54 — The envoy uses a Magic Mirror to join remotely; a new book is shared**
```
Inside a CHAMBER, an ornate gilded MAGIC MIRROR glows cyan showing a distant envoy's face; a
temporary red-sealed SCROLL beside it; a glowing shared TOME links the mirror to a LORD at the
table.
```

---

## 6. Chapter-divider heroes

Reuse these panels full-bleed as chapter openers: **Ch.1 → p14, Ch.2 → p22, Ch.3 → p31,
Ch.4 → p42, Ch.5 → p54.** (Or render dedicated wide establishing versions with more sky.)

## 7. Usage notes

- **Aspect ratio:** 16:9. Midjourney `--ar 16:9`; DALL·E/GPT-Image `1792×1024`; SDXL `1344×768`.
- **Consistency:** keep a fixed seed per run and reuse the exact anchor descriptions in section 3.
  In Midjourney, render the cast (section 3) first, then pass them with `--cref`/`--sref` on each panel.
- **No text in-image:** all captions/decoders live on the slide, not the render (keeps them crisp
  and editable). That's why every prompt ends with "no text".
- **Assembly:** drop the 20 rendered PNGs into a folder named `out2/` (files `p11.png … p54.png`,
  plus `title.png` and `cast_*.png`) and re-run the deck builder — it rebuilds the same .pptx with
  your approved story text and Cisco decoders around the new images.
```
