// Run the generated reader as a local file with JavaScript disabled.
// PLAYWRIGHT_MODULE can point to an existing Playwright module, and WEBKIT_EXECUTABLE to a cached browser.
// Pass a copy of the previous repository tree to also reproduce the scroll bug and compare desktop images.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const before = process.argv[2] && path.resolve(process.argv[2]);
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'read-page-webkit-'));
const clinicDocs = ['prd', 'trd', 'design', 'data', 'security', 'handover', 'plan'];
const shortDocs = ['prd', 'trd', 'security', 'plan'];
const examples = [
  { name: 'cedar-clinic', docs: clinicDocs, waiting: 1 },
  { name: 'cedar-clinic-ar', docs: clinicDocs, waiting: 1 },
  { name: 'study-timer', docs: shortDocs, waiting: 0 },
  { name: 'notes-digest', docs: shortDocs, waiting: 0 },
];
const reader = (folder, example) => pathToFileURL(path.join(folder, 'skills/project-docs/examples', example, 'docs/read.html')).href;
const scrollY = (page) => page.evaluate(() => window.scrollY);

async function load(page, url) {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

async function withPage(browser, width, run) {
  const phone = width <= 820;
  const page = await browser.newPage({
    javaScriptEnabled: false, offline: true, viewport: { width, height: 640 },
    isMobile: phone, hasTouch: phone, reducedMotion: 'reduce',
  });
  page.setDefaultTimeout(5000);
  const requests = [];
  page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  try {
    await run(page);
    assert.deepEqual(requests, [], 'the local page makes no HTTP requests');
  } finally {
    await page.context().close();
  }
}

async function view(page, id) {
  await page.locator(`#v-${id}`).waitFor({ state: 'visible' });
  assert.deepEqual(await page.locator('article.doc:visible').evaluateAll((els) => els.map((el) => el.id)), [`v-${id}`]);
}

async function widths(page, width) {
  assert.deepEqual(await page.evaluate(() => [
    document.documentElement.clientWidth, document.documentElement.scrollWidth, document.body.scrollWidth,
  ]), [width, width, width], 'viewport, document and body widths');
}

async function atTop(page, id) {
  await view(page, id);
  const y = await scrollY(page);
  const top = await page.locator(`#v-${id}`).evaluate((el) => el.getBoundingClientRect().top);
  assert.ok(y >= 0 && y <= 8 && top >= 0 && top <= 18, `#v-${id} opens at its top (scroll ${y}, article ${top})`);
  return y;
}

async function controlFocus(control) {
  const focused = await control.evaluate((el) => document.activeElement === el && el.matches(':focus-visible'));
  assert.ok(focused, `visible keyboard focus on ${control}`);
  const outline = await control.evaluate((el) => {
    const { outlineStyle, outlineWidth, outlineColor, outlineOffset } = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const inset = parseFloat(outlineWidth) + parseFloat(outlineOffset);
    // WebKit can leave a focused row partly visible at the top or bottom edge.
    const visible = rect.left >= inset && rect.right + inset <= innerWidth && rect.bottom > inset && rect.top + inset < innerHeight;
    return [outlineStyle, outlineWidth, outlineColor, visible];
  });
  assert.deepEqual(outline, ['solid', '2px', 'rgb(44, 44, 46)', true], `focus ring on ${control}`);
}

async function destinationFocus(page, id) {
  const state = await page.locator(`#v-${id}`).evaluate((article) => [
    document.activeElement === article,
    getComputedStyle(article).outlineStyle,
    getComputedStyle(article.querySelector('.top')).outlineStyle,
  ]);
  assert.deepEqual(state, [true, 'none', 'none'], `#v-${id} receives focus without an outline on the article or header`);
}

async function keyboard(page, url, phone, example) {
  await load(page, url);
  const first = page.locator(phone ? '.list .row:first-child' : '.t-home');
  await page.keyboard.press('Tab');
  const usesTab = await first.evaluate((el) => document.activeElement === el);
  const forward = usesTab ? 'Tab' : 'Alt+Tab';
  if (!usesTab) await page.keyboard.press(forward);
  await controlFocus(first);
  if (!phone) {
    await page.keyboard.press(forward);
    await controlFocus(page.locator('.t-prd'));
  }
  await page.keyboard.press('Enter');
  await atTop(page, 'prd');
  await destinationFocus(page, 'prd');
  await page.screenshot({ path: path.join(shots, `focus-${example}-${page.viewportSize().width}.png`) });
  if (phone) {
    await page.keyboard.press(forward);
    await controlFocus(page.locator('#v-prd .back'));
    await page.keyboard.press('Enter');
    await atTop(page, 'home');
    await destinationFocus(page, 'home');
    await page.keyboard.press(forward);
    const links = await page.locator('#v-home a').all();
    await controlFocus(first);
    for (const link of links.slice(1)) {
      await page.keyboard.press(forward);
      await controlFocus(link);
    }
    await page.keyboard.press('Enter');
    await atTop(page, 'plan');
    await destinationFocus(page, 'plan');
    await page.keyboard.press(forward);
    await controlFocus(page.locator('#v-plan .back'));
    await page.keyboard.press(forward);
    await controlFocus(page.locator('#v-plan details.fold > summary').first());
  } else {
    const backward = usesTab ? 'Shift+Tab' : 'Shift+Alt+Tab';
    // From the document, reverse through the sidebar to its Overview tile.
    const links = await page.locator('.side a').all();
    for (const link of links.reverse()) {
      await page.keyboard.press(backward);
      await controlFocus(link);
    }
    await page.keyboard.press('Enter');
    await atTop(page, 'home');
    await destinationFocus(page, 'home');
  }
  return usesTab ? 'Tab' : 'Option+Tab';
}

async function phone(browser, { name, docs, waiting }, width) {
  const url = reader(root, name);
  await withPage(browser, width, async (page) => {
    await load(page, url);
    await atTop(page, 'home');
    assert.equal(await page.locator('.side').isVisible(), false);
    const home = page.locator('#v-home');
    const positions = await home.locator('.board > section').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    assert.deepEqual(positions, [...new Set(positions)].sort((a, b) => a - b), 'Overview sections run down the phone in reading order');
    const rows = home.locator('.list .row');
    const counts = rows.locator('.oq');
    assert.ok((await counts.allTextContents()).every((count) => /^[1-9]\d* /.test(count)), 'only positive open counts are rendered');
    if (width <= 360) {
      const stacked = await counts.evaluateAll((els) => els.every((count) => {
        const stamp = count.parentElement.querySelector('.st');
        return count.getBoundingClientRect().top >= stamp.getBoundingClientRect().bottom;
      }));
      assert.ok(stacked, 'the count sits below the stamp on a narrow phone');
    }
    assert.equal(await rows.first().evaluate((el) => getComputedStyle(el).borderBottomWidth), '1px');
    const namesFit = await rows.locator('.rn').evaluateAll((els) => els.every((name) => {
      const cell = name.getBoundingClientRect();
      const text = document.createRange();
      text.selectNodeContents(name);
      return [...text.getClientRects()].every((rect) => rect.left >= cell.left - 1 && rect.right <= cell.right + 1);
    }));
    assert.ok(namesFit, 'document names and blurbs stay in their column');
    assert.equal(await home.locator('.stats').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length), 3);
    await widths(page, width);
    await page.screenshot({ path: path.join(shots, `overview-${name}-${width}.png`) });

    const targets = await rows.evaluateAll((els) => els.map((el) => el.hash.slice(3)));
    assert.deepEqual(targets, docs, 'each existing document is available from the list');
    const lang = await page.locator('html').getAttribute('lang');
    const scrolls = [];
    for (const id of targets) {
      const link = home.locator(`.list a[href="#v-${id}"]`);
      await link.evaluate((el) => { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -24); });
      const start = await scrollY(page);
      assert.ok(start > 0 && await link.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight;
      }), `tap ${id} from a scrolled list with the row fully in view`);
      await link.tap();
      scrolls.push(`${id} ${start} → ${await atTop(page, id)}`);
      await destinationFocus(page, id);
      await widths(page, width);
      const back = page.locator(`#v-${id} .back`);
      assert.equal((await back.innerText()).replace(/\s+/g, ' '), lang === 'ar' ? '‹ نظرة عامة' : '‹ Overview');
      if (id === 'trd') await page.screenshot({ path: path.join(shots, `trd-${name}-${width}.png`) });
      await back.tap();
      assert.equal(new URL(page.url()).hash, '#v-home');
      await atTop(page, 'home');
      await destinationFocus(page, 'home');
    }

    const questions = await home.locator('.qs .row.q').all();
    for (const question of questions) {
      const id = (await question.getAttribute('href')).slice(3);
      await question.tap();
      await atTop(page, id);
      await page.locator(`#v-${id} .back`).tap();
    }
    await home.locator('.choose').tap();
    await atTop(page, 'plan');
    assert.equal(await page.locator('#v-plan details.fold[open]').count(), waiting);
    const step = page.locator('#v-plan details.fold').first();
    const summary = step.locator('summary');
    assert.equal(await step.getAttribute('open'), null);
    await summary.tap();
    assert.equal(await step.getAttribute('open'), '');
    await widths(page, width);
    await summary.tap();
    assert.equal(await step.getAttribute('open'), null);
    await widths(page, width);
    const key = await keyboard(page, url, true, name);
    console.log(`${name} ${width}×640: ${scrolls.join(', ')} px. Overview return, ${questions.length} open-question links, Plan link, disclosures, ${key} focus, zero overflow.`);
  });
}

async function desktop(browser, { name, docs }, width) {
  const url = reader(root, name);
  const ids = ['home', ...docs];
  const captureTrdClick = name === 'cedar-clinic' && width === 1280;
  const baseline = new Map();
  if (before) {
    await withPage(browser, width, async (page) => {
      await load(page, reader(before, name));
      for (const id of ids) {
        if (id !== 'home') await page.locator(`.t-${id}`).click();
        if (captureTrdClick && id === 'trd') {
          await page.mouse.move(width / 2, 0);
          await page.screenshot({ path: path.join(shots, 'before-click-trd-1280.png') });
        }
        await page.mouse.click(width / 2, 1);
        baseline.set(id, await page.screenshot({ path: path.join(shots, `before-${name}-${width}-${id}.png`), fullPage: true }));
      }
    });
  }
  await withPage(browser, width, async (page) => {
    await load(page, url);
    for (const id of ids) {
      const tile = page.locator(`.t-${id}`);
      if (id !== 'home') await tile.click();
      await atTop(page, id);
      if (id !== 'home') await destinationFocus(page, id);
      assert.equal(await tile.evaluate((el) => getComputedStyle(el).color), 'rgb(255, 255, 255)');
      assert.equal(await page.locator('.back:visible').count(), 0);
      if (captureTrdClick && id === 'trd') {
        await page.mouse.move(width / 2, 0);
        await page.screenshot({ path: path.join(shots, 'after-click-trd-1280.png') });
      }
      // Clear focus on both versions for the resting comparison.
      await page.mouse.click(width / 2, 1);
      assert.equal(await page.locator('article:focus-visible').count(), 0);
      const png = await page.screenshot({ path: path.join(shots, `after-${name}-${width}-${id}.png`), fullPage: true });
      if (before) assert.ok(png.equals(baseline.get(id)), `${name} ${width}px ${id} desktop screenshot differs`);
    }
    await widths(page, width);
    const questions = page.locator('.side .act');
    if (await questions.count()) {
      const question = questions.first();
      const id = (await question.getAttribute('href')).slice(3);
      await question.click();
      await atTop(page, id);
    }
    const key = await keyboard(page, url, false, name);
    console.log(`${name} ${width}px: ${ids.length} views ${before ? 'with identical resting desktop screenshots' : 'captured'}, ${key} focus.`);
  });
}

async function regressionAt400(browser, folder, phase) {
  await withPage(browser, 390, async (page) => {
    await load(page, reader(folder, 'cedar-clinic'));
    await page.evaluate(() => window.scrollTo(0, 400));
    const start = await scrollY(page);
    assert.equal(start, 400);
    const radioLabel = page.locator('.list label[for="r-trd"]');
    const legacy = phase === 'Before' && await radioLabel.count() > 0;
    const link = legacy ? radioLabel : page.locator('.list a[href="#v-trd"]');
    const point = await link.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const bottom = Math.min(innerHeight, rect.bottom);
      return top < bottom ? { x: (rect.left + rect.right) / 2, y: (top + bottom) / 2 } : null;
    });
    assert.ok(point, 'TRD has a visible tap target at a scroll position of 400 px');
    // Tap the visible part directly so the automation does not scroll the row into view.
    await page.touchscreen.tap(point.x, point.y);
    await page.locator('.doc-trd').waitFor({ state: 'visible' });
    const end = legacy ? await scrollY(page) : await atTop(page, 'trd');
    if (legacy) assert.ok(end > 8, 'the old reader keeps the scrolled position');
    console.log(`${phase}, en 390×640, TRD: ${start} → ${end} px.`);
  });
}

async function main() {
  const { webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const browser = await webkit.launch({ executablePath: process.env.WEBKIT_EXECUTABLE });
  try {
    console.log(`WebKit ${browser.version()}, file URLs, offline, JavaScript disabled. Images in ${shots}`);
    if (before) await regressionAt400(browser, before, 'Before');
    await regressionAt400(browser, root, 'After');
    for (const example of examples) {
      for (const width of [320, 390]) await phone(browser, example, width);
      for (const width of [821, 1280]) await desktop(browser, example, width);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
