/*
 * shot.js — tiny Playwright screenshot helper used to verify the storyboard.
 *
 * Usage:
 *   node scripts/shot.js <url> <outfile> [width] [height] \
 *        [--full] [--keys=D,ArrowRight] [--click=selector] [--wait=ms]
 *
 * Examples:
 *   node scripts/shot.js http://localhost:8000/index.html title.png
 *   node scripts/shot.js http://localhost:8000/index.html panel.png 1440 900 \
 *        --keys=ArrowRight,ArrowRight,D --wait=1100
 *
 * Browser + Playwright resolution is auto-detected so this works outside the
 * container it was written in:
 *   - Playwright is require()'d from the local project, then from common global
 *     locations (npm root -g).
 *   - The Chromium binary is taken from PLAYWRIGHT_BROWSERS_PATH if that yields
 *     a chromium build; otherwise Playwright's own bundled resolution is used.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadPlaywright() {
  const candidates = ['playwright', 'playwright-core'];
  // add the global node_modules dir (npm root -g) to the search path
  try {
    const groot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    if (groot) candidates.push(path.join(groot, 'playwright'), path.join(groot, 'playwright-core'));
  } catch (_) { /* npm not available — fall back to local resolution */ }
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* try next */ }
  }
  throw new Error('Could not find the "playwright" module. Install it (npm i -g playwright) and retry.');
}

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base) return undefined; // let Playwright resolve its own bundled browser
  try {
    const dir = fs.readdirSync(base).find(d => d.startsWith('chromium-'));
    if (!dir) return undefined;
    for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      const p = path.join(base, dir, rel);
      if (fs.existsSync(p)) return p;
    }
  } catch (_) { /* directory not readable — fall back */ }
  return undefined;
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('usage: node scripts/shot.js <url> <outfile> [w] [h] [--full] [--keys=..] [--click=..] [--wait=ms]');
    process.exit(2);
  }
  const url = args[0];
  const out = args[1];
  const width = parseInt(args[2] || '1440', 10);
  const height = parseInt(args[3] || '900', 10);
  const full = args.includes('--full');
  const keysArg = (args.find(a => a.startsWith('--keys=')) || '').split('=')[1] || '';
  const clickArg = (args.find(a => a.startsWith('--click=')) || '').split('=')[1] || '';
  const waitArg = parseInt(((args.find(a => a.startsWith('--wait=')) || '').split('=')[1]) || '500', 10);

  const { chromium } = loadPlaywright();
  const executablePath = findChromium();

  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  if (clickArg) {
    for (const sel of clickArg.split('|')) {
      try { await page.click(sel, { timeout: 2000 }); await page.waitForTimeout(250); }
      catch (e) { console.error('click miss', sel, e.message); }
    }
  }
  if (keysArg) {
    for (const k of keysArg.split(',')) {
      await page.keyboard.press(k.trim());
      await page.waitForTimeout(350);
    }
  }
  await page.waitForTimeout(waitArg);
  await page.screenshot({ path: out, fullPage: full });
  await browser.close();
  console.log('shot ->', out);
})().catch(e => { console.error(e); process.exit(1); });
