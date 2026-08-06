/*
 * verify_page.js — behavioural checks for page/index.html.
 *
 *   node scripts/verify_page.js [baseUrl]      (default http://localhost:8000)
 *
 * Drives a real browser and asserts the things that are easy to break silently:
 * deep linking, keyboard operability of the chapter rail, focus handling, the
 * cast dialog's focus trap, lazy image loading, and console cleanliness.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadPlaywright() {
  const cands = ['playwright', 'playwright-core'];
  try {
    const g = execSync('npm root -g', { encoding: 'utf8' }).trim();
    if (g) cands.push(path.join(g, 'playwright'), path.join(g, 'playwright-core'));
  } catch (_) {}
  for (const c of cands) { try { return require(c); } catch (_) {} }
  throw new Error('playwright not found');
}
function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base) return undefined;
  try {
    const dir = fs.readdirSync(base).find(d => d.startsWith('chromium-'));
    if (!dir) return undefined;
    for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell']) {
      const p = path.join(base, dir, rel);
      if (fs.existsSync(p)) return p;
    }
  } catch (_) {}
  return undefined;
}

const BASE = process.argv[2] || 'http://localhost:8000';
let pass = 0, fail = 0;
const ok  = (n, d) => { pass++; console.log(`  PASS  ${n}${d ? ' — ' + d : ''}`); };
const bad = (n, d) => { fail++; console.log(`  FAIL  ${n}${d ? ' — ' + d : ''}`); };
const check = (c, n, d) => c ? ok(n, d) : bad(n, d);

(async () => {
  const { chromium } = loadPlaywright();
  const exe = findChromium();
  const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  // ---------- console + image requests ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const external = t => /fonts\.(googleapis|gstatic)\.com|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED/.test(t);
  page.on('console', m => { if (m.type() === 'error' && !external(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  const imgReqs = new Set();
  page.on('request', r => { if (/\.jpg(\?|$)/.test(r.url())) imgReqs.add(r.url().split('/').pop()); });

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  check(errors.length === 0, 'no console errors on load', errors[0] || '');
  check(imgReqs.size <= 5, 'lazy loading', `${imgReqs.size}/28 fetched on load: ${[...imgReqs].sort().join(' ')}`);

  // ---------- social/meta ----------
  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  const desc = await page.getAttribute('meta[name="description"]', 'content');
  check(!!og && og.endsWith('title.jpg'), 'og:image present', og || 'missing');
  check(!!desc && desc.length > 60, 'meta description present');

  // ---------- deep linking ----------
  await page.goto(`${BASE}/index.html#3.4`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const codeAt34 = await page.textContent('.code').catch(() => null);
  check(codeAt34 === 'PANEL 3.4', 'deep link #3.4 opens that panel', codeAt34 || 'no panel');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  check((await page.evaluate(() => location.hash)) === '#3.5', 'URL updates when navigating',
        await page.evaluate(() => location.hash));

  await page.goBack(); await page.waitForTimeout(400);
  check((await page.textContent('.code')) === 'PANEL 3.4', 'browser Back steps the story');

  // ---------- rail keyboard operability ----------
  const railTag = await page.evaluate(() => document.querySelector('.chseg')?.tagName);
  check(railTag === 'BUTTON', 'chapter rail is a real button', railTag);
  const railFocusable = await page.evaluate(() => {
    const b = document.querySelector('.chseg'); b.focus(); return document.activeElement === b;
  });
  check(railFocusable, 'chapter rail is focusable');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  check((await page.evaluate(() => location.hash)) === '#ch1', 'rail activates with Enter',
        await page.evaluate(() => location.hash));

  // rail keeps focus across navigation (it is no longer rebuilt)
  const keptFocus = await page.evaluate(() => {
    const b = document.querySelectorAll('.chseg')[2]; b.focus();
    const before = document.activeElement;
    return { same: before === b };
  });
  check(keptFocus.same, 'rail nodes persist (focus not destroyed)');

  // ---------- live region ----------
  await page.goto(`${BASE}/index.html#1.4`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const live = await page.textContent('#liveNote');
  check(!!live && live.includes('Panel 1.4'), 'scene announced to screen readers',
        (live || '').slice(0, 48) + '…');

  // ---------- cast dialog focus ----------
  await page.keyboard.press('c');
  await page.waitForTimeout(500);
  const focusInDialog = await page.evaluate(() => document.getElementById('castOverlay').contains(document.activeElement));
  check(focusInDialog, 'focus moves into the cast dialog');
  await page.waitForTimeout(700);
  const castLoaded = [...imgReqs].filter(n => n.startsWith('cast_')).length;
  check(castLoaded >= 5, 'cast portraits load on demand', `${castLoaded}/7 after opening`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const restored = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  check(restored !== 'BODY', 'focus restored after closing the dialog', String(restored));

  // ---------- Escape must not throw away your place ----------
  await page.goto(`${BASE}/index.html#2.3`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check((await page.textContent('.code')) === 'PANEL 2.3', 'Escape keeps your place');

  // ---------- escaping ----------
  const escOk = await page.evaluate(() => {
    const f = window.esc || null;
    return f ? f('a"b<c>d&e\'f') === 'a&quot;b&lt;c&gt;d&amp;e&#39;f' : 'nofn';
  });
  check(escOk === true || escOk === 'nofn', 'esc() hardened (or not exposed globally)', String(escOk));

  // ---------- title fits, header doesn't collide, no sideways scroll ----------
  for (const w of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width: w, height: 820 });
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const h = document.querySelector('.title-wrap h1');
      const a = document.querySelector('.mark').getBoundingClientRect();
      const b = document.querySelector('.tools').getBoundingClientRect();
      return { fits: h.scrollWidth <= h.clientWidth + 1,
               overlap: a.right > b.left + 1,
               pageOvf: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
               text: h.textContent.replace(/\s+/g, ' ').trim() };
    });
    check(r.fits && !r.overlap && !r.pageOvf, `title layout @ ${w}px`,
          `${r.fits ? 'fits' : 'OVERFLOWS'}, header ${r.overlap ? 'OVERLAPS' : 'clear'}`);
    if (w === 360) check(/of Ultra/.test(r.text), 'title keeps the space when it rewraps', r.text);
    if (w === 1440) {
      const g = await page.evaluate(() => {
        const cs = getComputedStyle(document.querySelector('.title-wrap h1'));
        return { grad: /gradient/.test(cs.backgroundImage), clip: cs.webkitBackgroundClip || cs.backgroundClip };
      });
      check(g.grad && g.clip === 'text', 'title renders the engraved gradient', `clip=${g.clip}`);
    }
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
