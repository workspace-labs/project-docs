// The preview's checks: a look that is hard to read, or uses a font that isn't there, is never shown.
// The last tests open the page itself (preview.html's scripts) in a stand-in for the browser.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const check = require('../skills/project-docs/assets/preview/check.js');

function exampleLooks() {
  const window = {};
  const file = path.join(__dirname, '..', 'skills/project-docs/examples/cedar-clinic/docs/design-preview/looks.js');
  new Function('window', require('node:fs').readFileSync(file, 'utf8'))(window);
  return JSON.parse(JSON.stringify(window.PROJECT_DOCS_LOOKS));
}

test('contrast matches the WCAG formula', () => {
  assert.strictEqual(Math.round(check.contrast('#000000', '#FFFFFF')), 21);
  assert.strictEqual(check.contrast('#fff', '#FFFFFF'), 1);
  assert.ok(check.contrast('#777777', '#FFFFFF') < 4.5, '#777 on white is just under 4.5');
  assert.ok(check.contrast('#767676', '#FFFFFF') >= 4.5, '#767676 on white is the classic pass');
});

test('the Cedar Clinic example passes every check', () => {
  const result = check.validate(exampleLooks());
  assert.deepStrictEqual(result.problems, []);
  assert.strictEqual(result.looks.length, 3);
  for (const look of result.looks) {
    assert.deepStrictEqual(look.problems, []);
    assert.strictEqual(look.checks.length, 8);
  }
});

test('a hard-to-read pair refuses only that look, and names the colors', () => {
  const data = exampleLooks();
  data.looks[1].colors.onPrimary = '#9DB8EA';
  const result = check.validate(data);
  assert.deepStrictEqual(result.looks[0].problems, []);
  assert.strictEqual(result.looks[1].problems.length, 1);
  assert.match(result.looks[1].problems[0], /button text.*#9DB8EA on #1858C9.*needs 4.5/);
});

test('quiet text and error text are checked on the page background too', () => {
  const data = exampleLooks();
  data.looks[0].colors.background = '#B8C4BE'; // fine on a card, too dark behind quiet and error text
  const problems = check.validate(data).looks[0].problems.join(' ');
  assert.match(problems, /quiet text on the page background/);
  assert.match(problems, /error text on the page background/);
});

test('a font that is not inside the preview is refused unless the person said yes', () => {
  const data = exampleLooks();
  data.looks[0].fonts.heading = 'Merriweather';
  assert.match(check.validate(data).looks[0].problems[0], /"Merriweather" is not inside the preview/);
  data.onlineFonts = ['Merriweather'];
  assert.deepStrictEqual(check.validate(data).looks[0].problems, []);
});

test('an Arabic preview needs an Arabic font', () => {
  const data = exampleLooks();
  data.project.language = 'ar';
  assert.match(check.validate(data).looks[0].problems.join(' '), /no Arabic letters/);
  for (const look of data.looks) look.fonts = { heading: 'Noto Naskh Arabic', body: 'Noto Naskh Arabic' };
  for (const look of check.validate(data).looks) assert.deepStrictEqual(look.problems, []);
});

test('the page as a whole is refused when it is empty, or has 1 or 4 looks', () => {
  assert.match(check.validate(undefined).problems[0], /looks.js is missing/);
  const one = exampleLooks(); one.looks = one.looks.slice(0, 1);
  assert.match(check.validate(one).problems.join(' '), /Show 2 or 3 looks \(now 1\)/);
  const four = exampleLooks(); four.looks.push(four.looks[0]);
  assert.match(check.validate(four).problems.join(' '), /now 4/);
});

test('without a browser, "node check.js looks.js" says ready or refused', () => {
  const { spawnSync } = require('node:child_process');
  const script = path.join(__dirname, '..', 'skills/project-docs/assets/preview/check.js');
  const good = path.join(__dirname, '..', 'skills/project-docs/examples/cedar-clinic/docs/design-preview/looks.js');
  const ok = spawnSync(process.execPath, [script, good], { encoding: 'utf8' });
  assert.strictEqual(ok.status, 0);
  assert.strictEqual(ok.stdout.trim(), 'ready');
  const missing = spawnSync(process.execPath, [script, path.join(__dirname, 'no-such-looks.js')], { encoding: 'utf8' });
  assert.strictEqual(missing.status, 2);
  assert.match(missing.stdout, /^refused\n - looks.js could not be read/);
});

test('odd values are refused, never trusted and never a crash', () => {
  const inherited = exampleLooks();
  inherited.looks[0].fonts.heading = 'toString'; // an inherited name, not a bundled font
  assert.match(check.validate(inherited).looks[0].problems.join(' '), /"toString" is not inside the preview/);

  const notANumber = exampleLooks();
  notANumber.looks[0].radius = NaN;
  assert.match(check.validate(notANumber).looks[0].problems.join(' '), /corner size/);
  notANumber.looks[0].radius = Infinity;
  assert.match(check.validate(notANumber).looks[0].problems.join(' '), /corner size/);

  const coercible = exampleLooks();
  coercible.looks[0].colors.text = { toString: () => '#14231C' }; // looks like a color, isn't text
  assert.match(check.validate(coercible).looks[0].problems.join(' '), /the color "text" must be written like/);

  const throwing = exampleLooks();
  Object.defineProperty(throwing.looks[1], 'name', { get() { throw new Error('boom'); } });
  const result = check.validate(throwing);
  assert.match(result.problems.join(' '), /cannot be checked \(boom\)/);
});

test('anything thrown (null, undefined, a string) is refused in words, and only a plain copy is drawn', () => {
  for (const thrown of [null, undefined, 'plain words', 0]) {
    const data = exampleLooks();
    Object.defineProperty(data.looks[0], 'name', { get() { throw thrown; } });
    const result = check.validate(data);
    assert.strictEqual(result.looks.length, 0);
    assert.match(result.problems[0], new RegExp(`cannot be checked \\(${String(thrown)}\\)`));
  }
  const fine = exampleLooks();
  const result = check.validate(fine);
  assert.notStrictEqual(result.data, fine, 'the page draws a copy, not the live object');
  assert.deepStrictEqual(result.data, fine);
});

test('the command line refuses a thrown null or undefined with exit 2', () => {
  const { spawnSync } = require('node:child_process');
  const fs = require('node:fs');
  const os = require('node:os');
  const script = path.join(__dirname, '..', 'skills/project-docs/assets/preview/check.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-docs-'));
  try {
    for (const thrown of ['null', 'undefined']) {
      const file = path.join(dir, `${thrown}.js`);
      fs.writeFileSync(file, 'window.PROJECT_DOCS_LOOKS = ' + JSON.stringify(exampleLooks()) +
        `;\nObject.defineProperty(window.PROJECT_DOCS_LOOKS.project, 'name', { get: function () { throw ${thrown}; } });\n`);
      const run = spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
      assert.strictEqual(run.status, 2, `${thrown}: ${run.stderr}`);
      assert.match(run.stdout, new RegExp(`^refused\\n - looks.js holds a value that cannot be checked \\(${thrown}\\)`));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the command line refuses an odd value with exit 2, not a crash', () => {
  const { spawnSync } = require('node:child_process');
  const fs = require('node:fs');
  const os = require('node:os');
  const script = path.join(__dirname, '..', 'skills/project-docs/assets/preview/check.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-docs-'));
  const file = path.join(dir, 'looks.js');
  const looks = exampleLooks();
  fs.writeFileSync(file, 'window.PROJECT_DOCS_LOOKS = ' + JSON.stringify(looks) +
    ';\nwindow.PROJECT_DOCS_LOOKS.looks[0].colors.text = { toString: function () { return "#14231C"; } };\n');
  const run = spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.strictEqual(run.status, 2, run.stderr);
  assert.match(run.stdout, /^refused\n - Look 1 "Calm Cedar": the color "text"/);
});

test('broken values are refused in plain words', () => {
  const data = exampleLooks();
  data.looks[2].colors.primary = 'indigo';
  data.looks[2].radius = 90;
  data.onlineFonts = ['Bad<script>'];
  const result = check.validate(data);
  assert.match(result.problems.join(' '), /onlineFonts/);
  assert.match(result.looks[2].problems.join(' '), /"primary" must be written like #1D4ED8/);
  assert.match(result.looks[2].problems.join(' '), /corner size/);
});

test('the command line refuses a looks.js that throws anything, while it runs or when its value is read, with exit 2', () => {
  const { spawnSync } = require('node:child_process');
  const os = require('node:os');
  const script = path.join(__dirname, '..', 'skills/project-docs/assets/preview/check.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-docs-'));
  const getter = (thrown) => `Object.defineProperty(window, 'PROJECT_DOCS_LOOKS', { get: function () { throw ${thrown}; } });`;
  const cases = [[getter('null'), 'null'], [getter('undefined'), 'undefined'], [getter("new Error('root boom')"), 'root boom'],
    ['throw null;', 'null'], ['throw undefined;', 'undefined']];
  try {
    cases.forEach(([source, said], i) => {
      const file = path.join(dir, `${i}.js`);
      fs.writeFileSync(file, source);
      const run = spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
      assert.strictEqual(run.status, 2, `${source}: ${run.stderr}`);
      assert.strictEqual(run.stdout, `refused\n - looks.js could not be read: ${said}\n`, source);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---- The page itself, without a browser. preview.html's scripts run in a small stand-in for one, so what the
// page decides (ready or refused, and why) is tested on every run. Its fonts answer the way CSS Font Loading
// says and WebKit really answered: the face nearest the weight asked for stands in for a missing one, a face
// answers only for text with a letter in its unicode-range, and a face whose file is missing rejects the load.

const PREVIEW = path.join(__dirname, '..', 'skills/project-docs/assets/preview');
const looksFile = (looks) => `window.PROJECT_DOCS_LOOKS = ${JSON.stringify(looks)};`;

// The faces preview.css declares, each marked missing when its file is not in the fonts folder.
function bundledFaces() {
  const css = fs.readFileSync(path.join(PREVIEW, 'preview.css'), 'utf8');
  return [...css.matchAll(/@font-face \{ font-family: '([^']+)'; src: url\('([^']+)'\); font-weight: (\d+); \}/g)]
    .map(([, family, file, weight]) => ({ family, file, weight, missing: !fs.existsSync(path.join(PREVIEW, file)) }));
}

// document.fonts.load(font, text): the family's faces nearest the weight asked for (CSS Fonts 4: bold looks up,
// then down; regular looks up to 500, then down, then above 500), keeping those with a letter of the text.
function fontLoader(faces) {
  return (font, text = ' ') => {
    const [, weight, family] = font.match(/^(\d+) 16px "(.+)"$/);
    const want = Number(weight);
    const distance = (face) => {
      const [lo, hi = lo] = face.weight.split(' ').map(Number);
      const near = Math.min(Math.max(want, lo), hi);
      if (near === want) return 0;
      if (want > 500) return near > want ? near - want : 1000 + want - near;
      return near > want && near <= 500 ? near - want : near < want ? 1000 + want - near : 2000 + near - want;
    };
    const codes = Array.from(text, (ch) => ch.codePointAt(0));
    const hasLetter = (face) => (face.unicodeRange || 'U+0-10FFFF').split(',').some((part) => {
      const [from, to = from] = part.trim().slice(2).split('-').map((hex) => parseInt(hex, 16));
      return codes.some((code) => code >= from && code <= to);
    });
    const ofFamily = faces.filter((f) => f.family === family);
    const best = Math.min(...ofFamily.map(distance));
    const found = ofFamily.filter((f) => distance(f) === best && hasLetter(f));
    if (found.some((f) => f.missing)) return Promise.reject(new Error('NetworkError: A network error occurred.'));
    return Promise.resolve(found.map((f) => ({ family, weight: f.weight, status: 'loaded', unicodeRange: f.unicodeRange || 'U+0-10FFFF' })));
  };
}

// The few parts of the DOM that render.js uses.
class Element {
  constructor(tag, text = '') { Object.assign(this, { tag, own: text, children: [], attributes: {}, style: {}, className: '', parent: null }); }
  get textContent() { return [this.own, ...this.children.map((c) => c.textContent)].filter(Boolean).join(' '); }
  set textContent(text) { this.own = String(text); this.children = []; }
  appendChild(child) { return this.insertBefore(child, null); }
  insertBefore(child, before) {
    const at = this.children.indexOf(before);
    this.children.splice(at < 0 ? this.children.length : at, 0, child);
    child.parent = this;
    return child;
  }
  replaceWith(other) { this.parent.children[this.parent.children.indexOf(this)] = other; other.parent = this.parent; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return name in this.attributes ? this.attributes[name] : null; }
}

// The text of every "fix these" box on the page.
const fixTexts = (node) => (/\bfix\b/.test(node.className) ? [node.textContent] : []).concat(...node.children.map(fixTexts));

// Opens preview.html with this looks.js: runs the scripts it lists, in order, each on its own as a browser does
// (a script that throws stops only itself). Answers once the page says ready or refused, or after 2 seconds
// with state null (a page that never decided). `online` holds each online font's stylesheet faces (an empty
// list is a stylesheet without faces; a family missing from it fails like a blocked connection). `load: null`
// is a browser without document.fonts.load.
function openPage(looksJs, { faces = bundledFaces(), online = {}, load } = {}) {
  const loaded = faces.slice();
  const document = {
    documentElement: {}, title: '', head: new Element('head'), body: new Element('body'),
    createElement: (tag) => new Element(tag),
    createTextNode: (text) => new Element('#text', text),
    fonts: load === null ? undefined : { load: load || fontLoader(loaded) },
  };
  document.head.appendChild = (link) => {
    const family = decodeURIComponent(link.href.match(/family=([^:&]+)/)[1].replace(/\+/g, ' '));
    setImmediate(() => {
      if (!online[family]) return link.onerror();
      loaded.push(...online[family].map((face) => ({ family, ...face })));
      link.onload();
    });
    return link;
  };
  return new Promise((resolve) => {
    const answer = () => resolve({ state: document.body.getAttribute('data-preview'), fixes: fixTexts(document.body) });
    const timer = setTimeout(answer, 2000);
    document.body.setAttribute = (name, value) => {
      document.body.attributes[name] = String(value);
      if (name === 'data-preview') { clearTimeout(timer); answer(); }
    };
    const context = vm.createContext({ document, setTimeout: (fn, ms) => setTimeout(fn, ms).unref() });
    context.window = vm.runInContext('this', context);
    const html = fs.readFileSync(path.join(PREVIEW, 'preview.html'), 'utf8');
    for (const [, src] of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
      const code = src === 'looks.js' ? looksJs : fs.readFileSync(path.join(PREVIEW, src), 'utf8');
      try { vm.runInContext(code, context, { filename: src }); } catch (e) { /* the browser goes on to the next script */ }
    }
  });
}

// The example with look 1's heading in an online font the person said yes to.
function onlineHeading(family, change = () => {}) {
  const looks = exampleLooks();
  looks.onlineFonts = [family];
  looks.looks[0].fonts.heading = family;
  change(looks);
  return looksFile(looks);
}

test('the page: the example is ready when every font it draws really loaded', async () => {
  const page = await openPage(looksFile(exampleLooks()));
  assert.strictEqual(page.state, 'ready');
  assert.deepStrictEqual(page.fixes, []);
});

test('the page: a variable font whose weight range holds bold is ready', async () => {
  const page = await openPage(onlineHeading('Review Online'), { online: { 'Review Online': [{ weight: '100 900' }] } });
  assert.strictEqual(page.state, 'ready');
});

test('the page refuses a bold that is really a regular face standing in', async () => {
  const noLoraBold = bundledFaces().filter((f) => !(f.family === 'Lora' && f.weight === '700'));
  const regularOnly = await openPage(looksFile(exampleLooks()), { faces: noLoraBold });
  assert.strictEqual(regularOnly.state, 'refused');
  assert.match(regularOnly.fixes.join(' '), /Look 1 "Calm Cedar": the font "Lora" \(bold\) did not load for the text it shows/);
  const rangeBelowBold = await openPage(onlineHeading('Review Online'), { online: { 'Review Online': [{ weight: '100 600' }] } });
  assert.strictEqual(rangeBelowBold.state, 'refused');
  assert.match(rangeBelowBold.fixes.join(' '), /the font "Review Online" \(bold\) did not load/);
});

test('the page refuses a font that lacks letters it shows, even when nothing failed to load', async () => {
  const latin = { weight: '700', unicodeRange: 'U+0000-00FF' };
  const cyrillicName = onlineHeading('Review Subset', (looks) => { looks.project.name = 'Cedar Клиника'; });
  const cyrillic = { weight: '700', unicodeRange: 'U+0400-04FF' };
  for (const faces of [[latin], [latin, { ...cyrillic, missing: true }]]) {
    const page = await openPage(cyrillicName, { online: { 'Review Subset': faces } });
    assert.strictEqual(page.state, 'refused', `${faces.length} face(s)`);
    assert.match(page.fixes.join(' '), /the font "Review Subset" \(bold\) did not load for the text it shows/);
  }
  assert.strictEqual((await openPage(cyrillicName, { online: { 'Review Subset': [latin, cyrillic] } })).state, 'ready', 'every letter has its face');
  // An Arabic preview: a Latin project name is covered, but not its letter أ.
  const arabicLetter = onlineHeading('Review Subset', (looks) => {
    looks.project.language = 'ar';
    for (const look of looks.looks.slice(1)) look.fonts = { heading: 'Noto Naskh Arabic', body: 'Noto Naskh Arabic' };
    looks.looks[0].fonts.body = 'Noto Naskh Arabic';
  });
  const page = await openPage(arabicLetter, { online: { 'Review Subset': [latin] } });
  assert.strictEqual(page.state, 'refused');
  assert.match(page.fixes.join(' '), /the font "Review Subset" \(bold\) did not load/);
  const withArabic = [latin, { weight: '700', unicodeRange: 'U+0600-06FF' }];
  assert.strictEqual((await openPage(arabicLetter, { online: { 'Review Subset': withArabic } })).state, 'ready', 'the letter has its face');
});

test('the page refuses an online font whose stylesheet has no faces, or cannot be fetched', async () => {
  const empty = await openPage(onlineHeading('Review Online'), { online: { 'Review Online': [] } });
  assert.strictEqual(empty.state, 'refused');
  const blocked = await openPage(onlineHeading('Review Online'));
  assert.strictEqual(blocked.state, 'refused');
  assert.match(blocked.fixes.join(' '), /"Review Online" \(bold\) did not load .* It loads from the internet/);
});

test('the page refuses a font file missing from the fonts folder', async () => {
  const faces = bundledFaces().map((f) => (f.file === 'fonts/Lora-Bold.ttf' ? { ...f, missing: true } : f));
  const page = await openPage(looksFile(exampleLooks()), { faces });
  assert.strictEqual(page.state, 'refused');
  assert.match(page.fixes.join(' '), /"Lora" \(bold\) did not load .* Keep the fonts folder next to preview.html/);
});

test('the page refuses when the browser cannot confirm fonts loaded, or its font check throws anything', async () => {
  const noApi = await openPage(looksFile(exampleLooks()), { load: null });
  assert.strictEqual(noApi.state, 'refused');
  assert.match(noApi.fixes.join(' '), /cannot confirm the fonts loaded/);
  const throws = await openPage(looksFile(exampleLooks()), { load: () => { throw null; } });
  assert.strictEqual(throws.state, 'refused');
  assert.match(throws.fixes.join(' '), /The fonts could not be checked \(null\)/);
});

test('the page refuses a looks.js whose value throws anything when read: a fix box, never a blank page', async () => {
  for (const [thrown, said] of [['null', 'null'], ['undefined', 'undefined'], ["new Error('root boom')", 'root boom']]) {
    const page = await openPage(`Object.defineProperty(window, 'PROJECT_DOCS_LOOKS', { get: function () { throw ${thrown}; } });`);
    assert.strictEqual(page.state, 'refused', thrown);
    assert.match(page.fixes.join(' '), new RegExp(`The preview could not be drawn \\(${said}\\)\\. Check looks\\.js`), thrown);
  }
  const broken = await openPage('throw null;');
  assert.strictEqual(broken.state, 'refused');
  assert.match(broken.fixes.join(' '), /looks.js is missing or empty/);
});
