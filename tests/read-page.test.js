// The reader page (scripts/read-page.js): a project's planning documents → docs/read.html.
// It must show every word of every planning document in that document's own view, in order; keep each
// example's page up to date; take open questions from the latest change, step states from the plan page's
// own reader and approval only from a real stamp; keep nested content, tables, list numbers, titles and
// heading levels; switch views and fold steps without JavaScript, with visible keyboard focus; load nothing
// from the network; never let document text become page code; carry WorkSpace Labs at the bottom; and never
// overwrite a document or any file it did not make.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const SCRIPT = path.join(SKILL, 'scripts', 'read-page.js');
const { readProject, render } = require(SCRIPT);
const EXAMPLES = ['cedar-clinic', 'cedar-clinic-ar', 'study-timer', 'notes-digest'];
const ex = (folder) => path.join(SKILL, 'examples', folder);
const page = (folder) => fs.readFileSync(path.join(ex(folder), 'docs', 'read.html'), 'utf8');
const visible = (html) => html.replace(/<style>[\s\S]*?<\/style>/, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const words = (s) => s.match(/[\p{L}\p{N}]+/gu) || [];
const view = (html, id) => { const m = html.match(new RegExp(`<article class="doc doc-${id}"[^>]*>([\\s\\S]*?)</article>`)); return m ? m[1] : ''; };

function project(files) { // a throwaway project folder; files: { 'docs/prd.md': '…' }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-page-'));
  for (const [f, text] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
  return dir;
}
function withProject(files, fn) { const dir = project(files); try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); } }
const htmlOf = (files) => withProject(files, (dir) => { const { docs, lang } = readProject(dir); return render(docs, lang); });
const docsOf = (files) => withProject(files, (dir) => readProject(dir).docs);
const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
const inOrder = (html, parts) => { let at = -1; for (const p of parts) { const i = html.indexOf(p, at + 1); assert.ok(i > at, `"${p}" is in place`); at = i; } };
const PRD = (body, stamp = '> v1 · Draft') => `# PRD: Test\n${stamp}\n\n${body}\n`;

for (const folder of EXAMPLES) {
  test(`(${folder}) the example's reader page is up to date with its documents`, () => {
    const { docs, lang } = readProject(ex(folder));
    assert.strictEqual(render(docs, lang), page(folder), `run: node scripts/read-page.js examples/${folder}`);
  });

  test(`(${folder}) every word of each document is in that document's own view, title included`, () => {
    const html = page(folder);
    for (const d of readProject(ex(folder)).docs) {
      const seen = new Set(words(visible(view(html, d.id))));
      const missing = [...new Set(words(fs.readFileSync(path.join(ex(folder), d.file), 'utf8')))].filter((w) => !seen.has(w));
      assert.deepStrictEqual(missing, [], `${d.file}: words missing from its view`);
    }
  });

  test(`(${folder}) views switch without JavaScript, with visible focus, and nothing loads from the network`, () => {
    const html = page(folder);
    assert.ok(!/<script\b/i.test(html), 'no script');
    assert.ok(!/(src|href)\s*=\s*"(https?:)?\/\//i.test(html), 'no network src or href');
    assert.ok(!/url\(\s*["']?(https?:)?\/\//i.test(html), 'no network url() in the styles');
    assert.doesNotMatch(html, /<input\b[^>]*type="radio"/);
    for (const id of ['home', ...readProject(ex(folder)).docs.map((d) => d.id)]) {
      assert.ok(html.includes(`<a href="#v-${id}" class="tl t-${id}">`), `a desktop tile link for ${id}`);
      assert.match(html, new RegExp(`<article class="doc doc-${id}" id="v-${id}" tabindex="-1" aria-labelledby="h-${id}">`));
      assert.ok(view(html, id).includes(`<h1 id="h-${id}">`), `the target is named by its title`);
    }
    assert.match(html, /a:focus-visible[^{}]*\{outline:2px solid var\(--ink\)/);
  });

  test(`(${folder}) plan steps fold, with the plan page's states; only the step waiting for a check starts open`, () => {
    const { docs } = readProject(ex(folder));
    const plan = docs.find((d) => d.id === 'plan');
    const v = view(page(folder), 'plan');
    const folds = v.match(/<details class="sub fold"( open)?>/g) || [];
    assert.strictEqual(folds.length, plan.steps.length);
    assert.strictEqual(folds.filter((f) => f.includes(' open')).length, plan.steps.filter((s) => s.state === 'check').length);
    for (const id of docs.filter((d) => d.id !== 'plan').map((d) => d.id)) assert.ok(!view(page(folder), id).includes('class="sub fold"'), `no folds in ${id}`);
  });

  test(`(${folder}) WorkSpace Labs is at the bottom of the page`, () => {
    const html = page(folder);
    const at = html.lastIndexOf('<footer class="brand">');
    assert.ok(at > html.lastIndexOf('</article>'));
    assert.ok(html.slice(at).includes('<b>WorkSpace Labs</b>'));
  });
}

test('an Arabic project gives a right-to-left Arabic page with its own font inside', () => {
  const html = page('cedar-clinic-ar');
  assert.ok(html.includes('<html lang="ar" dir="rtl">'));
  assert.ok(html.includes('font-family:Naskh;src:url(data:font/ttf;base64,'));
  assert.ok(!page('cedar-clinic').includes('font-family:Naskh'));
});

test('F10: an Arabic title written with an underline still gives the Arabic page and its markers', () => {
  const docs = docsOf({ 'docs/prd.md': 'متطلبات المنتج (PRD): تجربة\n===\n> الإصدار 2 · معتمد 2026-10-08 من المدير\n\n## لماذا\n- لم يُحسم بعد: اللون. يُحسم عندما يختار المدير.\n' });
  const html = htmlOf({ 'docs/prd.md': 'متطلبات المنتج (PRD): تجربة\n===\n> الإصدار 2 · معتمد 2026-10-08 من المدير\n\n## لماذا\n- لم يُحسم بعد: اللون. يُحسم عندما يختار المدير.\n' });
  assert.ok(html.includes('<html lang="ar" dir="rtl">'));
  assert.strictEqual(docs[0].approved, true);
  assert.deepStrictEqual(docs[0].tbd, ['اللون']);
});

test('F02: an open question settled by its latest change is closed; one reopened by a later change is open again', () => {
  const en = docsOf({ 'docs/trd.md': PRD([
    '## Services', '- TBD: the price. Decided when the lead says.', '  - Changed 2026-11-20: TBD → 4 USD, because the lead said.',
    '- TBD: the host. Decided when IT says.', '  - Changed 2026-11-01: TBD → Acme, because IT said.', '  - Changed 2026-11-02: Acme → TBD, because Acme closed.',
    '- Mail', '  - TBD: the sender. Decided when later.', '    - Changed 2026-11-03: TBD → Postbox, because it is cheap.',
  ].join('\n')).replace('PRD', 'TRD') })[0];
  assert.deepStrictEqual(en.tbd, ['the host']);
  assert.strictEqual(en.changes, 4, 'nested Changed lines are counted');
  const ar = docsOf({ 'docs/trd.md': [
    '# المتطلبات التقنية (TRD): تجربة', '> الإصدار 1 · مسودة', '', '## الخدمات',
    '- لم يُحسم بعد: السعر. يُحسم عندما يقول المسؤول.', '  - تغيّر في 2026-11-20: من لم يُحسم بعد إلى 4 دولارات، لأن المسؤول قال.',
    '- لم يُحسم بعد: المضيف. يُحسم عندما يقرر الفريق.', '  - تغيّر في 2026-11-01: من لم يُحسم بعد إلى أكمي، لأن الفريق قرر.', '  - تغيّر في 2026-11-02: من أكمي إلى لم يُحسم بعد، لأن أكمي أغلقت.', '',
  ].join('\n') })[0];
  assert.deepStrictEqual(ar.tbd, ['المضيف']);
  const notes = readProject(ex('notes-digest')).docs.find((d) => d.id === 'trd');
  assert.deepStrictEqual(notes.tbd, [], 'the Notes Digest price was settled');
  assert.ok(view(page('notes-digest'), 'home').includes('Nothing open'));
});

test('F03: step states come from the Status field through the plan page; a broken plan shows no states', () => {
  const STEP = (n, status) => `### Step ${n}: Thing ${n}\n- **Covers:** M1\n- **How we know it works:** try ${n}.\n${status === null ? '' : `- **Status:** ${status}\n`}`;
  const plan = (...s) => `# Plan: Test\n> v1 · Draft\n\n## Steps\n\n${s.join('\n')}`;
  const good = htmlOf({ 'docs/plan.md': plan(STEP(1, '⛔ waits for TBD: the ✅ colour'), STEP(2, '◐ waiting for your check (ran: the ✅ test, 2026-11-01)'), STEP(3, 'not started')) });
  const v = view(good, 'plan');
  inOrder(v, ['Thing 1 <span class="st wait">Waits for a decision</span>', 'Thing 2 <span class="st chk">Waiting for your check</span>', 'Thing 3 <span class="st todo">Not started</span>']);
  assert.ok(good.includes('<span class="badge">0/3</span>'));
  const broken = htmlOf({ 'docs/plan.md': plan(STEP(1, null)) });
  assert.ok(view(broken, 'plan').includes('class="note"'), 'says why the states are missing');
  assert.ok(!/<span class="st (ok|chk|wait|todo)">/.test(view(broken, 'plan')), 'no state is guessed');
  assert.ok(!broken.includes('Plan progress'));
  const other = htmlOf({ 'docs/handover.md': '# Handover: Test\n> v1 · Draft\n\n## Steps\n\n### Step 1: Train the staff\n- Two hours.\n', 'docs/plan.md': plan(STEP(1, '✅ checked 2026-11-01'), STEP(2, '✅ checked 2026-11-02')) });
  assert.ok(!view(other, 'handover').includes('class="sub fold"'), 'a Step heading outside the plan does not fold');
  assert.ok(!view(other, 'handover').includes('2/2'), 'and gets no plan count');
});

test('F04: only a real stamp counts as approved; any other quote stays readable content', () => {
  const [en] = docsOf({ 'docs/prd.md': '# PRD: Test\n> Approved by nobody yet\n\n## Why\nBecause.\n' });
  assert.strictEqual(en.approved, false);
  const html = htmlOf({ 'docs/prd.md': '# PRD: Test\n> Approved by nobody yet\n\n## Why\nBecause.\n' });
  assert.ok(view(html, 'prd').includes('<blockquote><p class="lead">Approved by nobody yet</p></blockquote>'));
  assert.ok(view(html, 'prd').includes('<span class="pill">No stamp</span>'));
  const [ar] = docsOf({ 'docs/prd.md': '# متطلبات المنتج (PRD): تجربة\n> هذا نص معتمد عند الناس\n\n## لماذا\nلأن.\n' });
  assert.strictEqual(ar.approved, false);
  const [ok] = docsOf({ 'docs/prd.md': PRD('## Why\nBecause.', '> v3 · Approved 2026-10-08 by the manager') });
  assert.strictEqual(ok.approved, true);
  assert.strictEqual(ok.version, 'v3');
});

test('F05: nested content stays, in its order', () => {
  const html = view(htmlOf({ 'docs/prd.md': PRD([
    '## Notes', '- First item', '  ```', '  fenced alpha', '  ```', '- Second item', '', 'Outer paragraph.', '',
    '> ### Quoted heading', '> - quoted bravo', '> - quoted charlie', '',
    '- Parent', '  - Child item', '', '  After the child.', '',
  ].join('\n')) }), 'prd');
  inOrder(html, ['First item', 'fenced alpha', 'Second item', 'Outer paragraph.', '<blockquote><h3 class="hq">Quoted heading</h3>', 'quoted bravo', 'quoted charlie', 'Parent', 'Child item', 'After the child.']);
});

test('F05 (round 3): code and HTML that start on a list item\'s own line lose only the container marks', () => {
  const html = view(htmlOf({ 'docs/prd.md': PRD('## Notes\n- > ```\n  > alpha code\n  > ```\n- <!-- hidden note -->\n') }), 'prd');
  assert.ok(html.includes('<pre>```\nalpha code\n```</pre>'), 'no "- >" inside the code');
  assert.ok(html.includes('<pre>&lt;!-- hidden note --&gt;</pre>'), 'no "- " in front of the HTML');
});

test('F06: a history record with blank lines inside stays one closed disclosure', () => {
  const html = view(htmlOf({ 'docs/trd.md': PRD([
    '## Data storage', '- PostgreSQL, because it is shared.', '',
    '<details data-project-docs-history>', '<summary>Earlier: SQLite</summary>', '', 'Zanzibar marmalade.', '', '- Old line kumquat', '', '</details>', '',
    'After the record.', '',
  ].join('\n')).replace('PRD', 'TRD') }), 'trd');
  const records = html.match(/<details class="code">[\s\S]*?<\/details>/g) || [];
  assert.strictEqual(records.length, 1, 'one disclosure');
  for (const w of ['Zanzibar', 'kumquat', '&lt;/details&gt;']) assert.ok(records[0].includes(w), w);
  const outside = html.replace(records[0], '');
  assert.ok(!outside.includes('Zanzibar') && !outside.includes('kumquat'), 'nothing of it shows outside the disclosure');
  assert.ok(outside.includes('After the record.'));
});

test('F07: tables keep their cells, escaped pipes and dash-only rows; pipe prose stays prose', () => {
  const html = view(htmlOf({ 'docs/prd.md': PRD([
    '## Table', '| Name | Note |', '|---|:--:|', '| Alpha \\| Beta | x |', '| --- | --- |', '| last | row |', '',
    '| --- |', '| --- |', '| cell |', '',
    '| this is a line of prose that starts with a pipe', '',
  ].join('\n')) }), 'prd');
  assert.ok(html.includes('<td>Alpha | Beta</td><td>x</td>'), 'escaped pipe kept in one cell');
  assert.ok(html.includes('<tr><td>---</td><td>---</td></tr>'), 'dash-only data row kept');
  assert.ok(html.includes('<th>---</th>') && html.includes('<td>cell</td>'), 'dash-only header does not crash');
  assert.ok(html.includes('<p class="lead">| this is a line of prose that starts with a pipe</p>'));
});

test('F08: ordered lists keep their boundaries and starting numbers', () => {
  const html = view(htmlOf({ 'docs/prd.md': PRD('## Lists\n7. seven\n8. eight\n4) four\n5) five\n') }), 'prd');
  inOrder(html, ['<ol class="steps" start="7"><li><span class="n">7</span>', 'seven', '<span class="n">8</span>', 'eight', '</ol>',
    '<ol class="steps" start="4"><li><span class="n">4</span>', 'four', '<span class="n">5</span>', 'five']);
});

test('F09: each view shows its own full title, and heading levels stay distinct', () => {
  const html = htmlOf({ 'docs/prd.md': PRD('## Top\n### Three\ntext\n#### Four\ntext\n##### Five\ntext\n'), 'docs/trd.md': '# TRD: Unique Engine Name\n> v1 · Draft\n\n## Screen\n- None.\n' });
  assert.match(view(html, 'trd'), /<h1\b[^>]*>TRD: Unique Engine Name<\/h1>/);
  inOrder(view(html, 'prd'), ['<h3>Three</h3>', '<h4>Four</h4>', '<h5>Five</h5>']);
  const deep = view(htmlOf({ 'docs/prd.md': PRD('## Top\n##### Five\ntext\n###### Six\ntext\n') }), 'prd');
  inOrder(deep, ['<h5>Five</h5>', '<h6>Six</h6>']);
  const commented = htmlOf({ 'docs/prd.md': '<!-- kept note -->\n\n# PRD: Comet Booking\n> v1 · Draft\n\n## Why\nBecause.\n' });
  assert.match(view(commented, 'home'), /<h1\b[^>]*>Comet Booking<\/h1>/, 'a comment above the title does not hide it');
  assert.ok(view(commented, 'prd').includes('kept note'), 'and the comment is still shown');
});

test('F12: small text colours reach 4.5:1 on the Pearl background', () => {
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const html = page('cedar-clinic');
  const v = (name) => html.match(new RegExp(`--${name}:(#[0-9a-f]{6})`))[1];
  for (const name of ['muted', 'text-2', 'down', 'text']) assert.ok(ratio(v(name), v('screen')) >= 4.5, `${name} on the screen colour`);
});

test('F14: the page holds the seven planning documents, never the client meeting form', () => {
  const { docs } = readProject(ex('cedar-clinic'));
  assert.deepStrictEqual(docs.map((d) => d.id), ['prd', 'trd', 'design', 'data', 'security', 'handover', 'plan']);
  assert.ok(fs.existsSync(path.join(ex('cedar-clinic'), 'docs', 'meeting-form.md')));
  assert.ok(!page('cedar-clinic').includes('Meeting 4'), 'the meeting form is not on the page');
});

test('F02 (round 3): the view and the Overview agree; a reason mentioning TBD does not reopen; deeper changes count; a misspelt change is refused', () => {
  const nd = view(page('notes-digest'), 'trd');
  assert.ok(nd.includes('<span class="flag done">Settled</span>') && !nd.includes('<span class="flag">Open question</span>'), 'the settled price is not marked open');
  const trd = (body) => `# TRD: Test\n> v1 · Draft\n\n## Services\n${body}\n`;
  const [a] = docsOf({ 'docs/trd.md': trd('- TBD: the host. Decided when IT says.\n  - Changed 2026-11-01: TBD → Acme, because the old note said Acme → TBD was wrong.') });
  assert.deepStrictEqual(a.tbd, [], 'an arrow to TBD inside the reason does not reopen');
  const [a2] = docsOf({ 'docs/trd.md': trd('- TBD: the host. Decided when IT says.\n  - Changed 2026-11-01: TBD → Acme, because IT said Acme → TBD, because of an old note.') });
  assert.deepStrictEqual(a2.tbd, [], 'the new value ends at the first ", because"');
  const [b] = docsOf({ 'docs/trd.md': trd('- TBD: the host. Decided when IT says.\n  - Notes from the call\n    - Changed 2026-11-01: TBD → Acme, because IT said.') });
  assert.deepStrictEqual(b.tbd, [], 'a change one level deeper settles it');
  assert.strictEqual(b.changes, 1);
  withProject({ 'docs/trd.md': '# المتطلبات التقنية (TRD): تجربة\n> الإصدار 1 · مسودة\n\n## الخدمات\n- لم يُحسم بعد: المضيف. يُحسم عندما يقرر الفريق.\n  - تغيّر في 2026-11-01: أكمي بدل لم يُحسم بعد.\n' }, (dir) => {
    const r = run([dir]);
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /refused: docs\/trd\.md: line 6: a change under an open question must read/);
    assert.ok(!fs.existsSync(path.join(dir, 'docs', 'read.html')));
  });
});

test('F03 (round 3): a badge goes to the step with the same number and title, never by position', () => {
  const html = view(htmlOf({ 'docs/plan.md': [
    '# Plan: Test', '> v1 · Draft', '', '## Steps', '',
    '<details data-project-docs-history>', '<summary>An earlier step</summary>', '',
    '### Step 1: Old thing', '- **Covers:** M1', '- **How we know it works:** try 1.', '- **Status:** ✅ checked 2026-11-01', '', '</details>', '',
    '### Step 2: Live thing', '- **Covers:** M1', '- **How we know it works:** try 2.', '- **Status:** not started', '',
  ].join('\n') }), 'plan');
  assert.ok(html.includes('Live thing <span class="st todo">Not started</span>'));
  assert.ok(!/Live thing <span class="st ok">/.test(html));
});

test('F04 (round 3): a stamp counts only on the one line right under the title, with version 1 or more', () => {
  const approved = (text) => docsOf({ 'docs/prd.md': text })[0].approved;
  assert.strictEqual(approved('# PRD: T\n> v0 · Approved 2026-01-01 by A\n\n## Why\nB.\n'), false, 'v0');
  assert.strictEqual(approved('# متطلبات المنتج (PRD): ت\n> الإصدار 0 · معتمد 2026-01-01 من أ\n\n## لماذا\nب.\n'), false, 'الإصدار 0');
  assert.strictEqual(approved('# PRD: T\n\n> v1 · Approved 2026-01-01 by A\n\n## Why\nB.\n'), false, 'after a blank line');
  assert.strictEqual(approved('# PRD: T\n> v1 · Approved\n> 2026-01-01 by A\n\n## Why\nB.\n'), false, 'split over two lines');
  assert.strictEqual(approved('# PRD: T\n> v12 · Approved 2026-01-01 by A\n\n## Why\nB.\n'), true, 'v12');
});

test('F06 (round 3): a record on a list item\'s line, a closing tag in code, and text right after the record', () => {
  const one = (md) => { const v = view(htmlOf({ 'docs/prd.md': PRD(md) }), 'prd'); return { v, recs: v.match(/<details class="code">[\s\S]*?<\/details>/g) || [] }; };
  let r = one('## Notes\n- <details data-project-docs-history>\n  <summary>Earlier</summary>\n\n  Body kiwi.\n\n  </details>\n');
  assert.strictEqual(r.recs.length, 1); assert.ok(r.recs[0].includes('kiwi')); assert.ok(!r.v.replace(r.recs[0], '').includes('kiwi'));
  r = one('## Notes\n<details data-project-docs-history>\n<summary>Earlier</summary>\n\nIt used `</details>` once, mango.\n\nStill inside, papaya.\n\n</details>\n');
  assert.strictEqual(r.recs.length, 1); assert.ok(r.recs[0].includes('papaya'), 'a closing tag in code does not end the record');
  r = one('## Notes\n<details data-project-docs-history>\n<summary>Earlier</summary>\n\nOld lime.\n\n</details>\nAfter prose fig.\n');
  assert.strictEqual(r.recs.length, 1); assert.ok(r.recs[0].includes('lime') && !r.recs[0].includes('fig'));
  assert.ok(r.v.includes('After prose fig.'), 'the text after the record is shown outside it');
});

test('F07 (round 3): body cells stay under their headers; a short row gets an empty cell, an extra cell an empty header', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Table\n| A | B |\n|---|---|\n| One |\n| x | y | zeta |\n') }), 'prd');
  assert.ok(v.includes('<thead><tr><th>A</th><th>B</th><th></th></tr></thead>'));
  assert.ok(v.includes('<tr><td>One</td><td></td><td></td></tr>'));
  assert.ok(v.includes('<tr><td>x</td><td>y</td><td>zeta</td></tr>'));
});

test('F08 (round 3): a nested list marker on its parent\'s line starts its own numbered list', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Lists\n- 7. Seven\n  8. Eight\n') }), 'prd');
  inOrder(v, ['<ol class="steps" start="7"><li><span class="n">7</span>', 'Seven', '<span class="n">8</span>', 'Eight', '</ol>']);
});

test('F11, F15: the phone uses in-page navigation and the Overview card keeps its whole text', () => {
  const html = page('cedar-clinic');
  const phone = html.slice(html.indexOf('@media (max-width:820px)'), html.indexOf('@media print'));
  assert.match(phone, /\.side\{display:none\}/, 'desktop navigation leaves no tile strip on a phone');
  assert.match(phone, /\.back\{display:inline-flex/);
  assert.ok(!/\.card \.cw\{[^}]*line-clamp/.test(html), 'no cut-off text on the card');
});

test('round 5: the Overview shows by default and yields to the targeted document without :has()', () => {
  const html = htmlOf({ 'docs/prd.md': PRD('## Why\nExample.') });
  inOrder(html, ['.doc{display:none', '.doc-home,.doc:target{display:block}', '.doc:target ~ .doc-home{display:none}']);
  inOrder(html, ['<main>', 'id="v-prd"', 'id="v-home"', '<footer class="brand">']);
});

test('round 5: every existing document has a localized Overview link above its header', () => {
  for (const [folder, overview] of [['cedar-clinic', 'Overview'], ['cedar-clinic-ar', 'نظرة عامة']]) {
    const { docs, lang } = readProject(ex(folder));
    const html = render(docs, lang);
    assert.doesNotMatch(view(html, 'home'), /class="back"/);
    for (const { id } of docs) {
      inOrder(view(html, id), [`<a href="#v-home" class="back"><span class="arrow" aria-hidden="true">‹</span> ${overview}</a>`, '<div class="top">']);
    }
  }
});

test('round 5: the phone list precedes questions and the step card, and all links resolve to their documents', () => {
  for (const folder of EXAMPLES) {
    const { docs, lang } = readProject(ex(folder));
    const html = render(docs, lang);
    const home = view(html, 'home');
    inOrder(home, ['class="top"', 'class="stats pane"', 'class="pane list"', 'class="pane qs"', 'class="pane pick"', 'class="pane prog"']);
    assert.deepStrictEqual([...home.matchAll(/<a href="#v-([a-z]+)" class="row">/g)].map(([, id]) => id), docs.map(d => d.id));
    const questions = docs.flatMap(d => d.tbd.map(() => d.id));
    assert.deepStrictEqual([...home.matchAll(/<a href="#v-([a-z]+)" class="row q">/g)].map(([, id]) => id), questions);
    assert.deepStrictEqual([...html.matchAll(/<a href="#v-([a-z]+)" class="act">/g)].map(([, id]) => id), questions);
    assert.ok(home.includes('<a href="#v-plan" class="choose">'));
    for (const [, id, row] of home.matchAll(/<a href="#v-([a-z]+)" class="row">([\s\S]*?)<\/a>/g)) {
      const open = docs.find(d => d.id === id).tbd.length;
      const count = open ? [`class="oq">${open} ${lang === 'ar' ? 'مفتوح' : 'open'}`] : [];
      inOrder(row, ['class="orb"', 'class="rn"', '<b>', '<small>', ...count, 'class="st ', 'aria-hidden="true">›']);
    }
    for (const [, target] of html.matchAll(/<a href="#([^"]+)"/g)) {
      assert.strictEqual(html.split(`id="${target}"`).length - 1, 1, `${folder}: unique target for #${target}`);
    }
  }
});

test('round 6 R01: a focused article has no outline and links and summaries keep their focus rings', () => {
  const html = htmlOf({ 'docs/prd.md': PRD('## Why\nExample.') });
  const [css] = html.match(/<style>[\s\S]*?<\/style>/);
  assert.deepStrictEqual({
    articleOutlineSuppressed: /\.doc:focus\{outline:none\}/.test(css),
    headerOutline: /\.doc:focus(?:-visible)?\s*>\s*\.top\{[^}]*\boutline:/.test(css),
    controlOutline: /summary:focus-visible,a:focus-visible\{outline:2px solid var\(--ink\)/.test(css),
  }, { articleOutlineSuppressed: true, headerOutline: false, controlOutline: true });
});

test('round 6 R02: no example renders a zero open count in English or Arabic', () => {
  const examplesWithZero = EXAMPLES.filter((folder) => {
    const { docs, lang } = readProject(ex(folder));
    return />0 (?:open|مفتوح)</.test(render(docs, lang));
  });
  assert.deepStrictEqual(examplesWithZero, []);
});

test('F13, F14 (round 3): the menu says the seven planning documents; showing the documents never edits one', () => {
  const skill = fs.readFileSync(path.join(SKILL, 'SKILL.md'), 'utf8');
  assert.match(skill, /`scripts\/read-page\.js` \| makes `docs\/read\.html` from the seven planning documents/);
  const ref = fs.readFileSync(path.join(SKILL, 'references', 'read-page.md'), 'utf8');
  assert.match(ref, /never edits a document/);
  assert.ok(!/In a draft, fix that line/.test(ref));
});

test('the counts on the Overview come from the documents', () => {
  const { docs } = readProject(ex('cedar-clinic'));
  const html = render(docs, 'en');
  const plan = docs.find((d) => d.id === 'plan');
  const ok = plan.steps.filter((s) => s.state === 'done').length;
  const open = docs.reduce((a, d) => a + d.tbd.length, 0);
  assert.ok(html.includes(`${docs.filter((d) => d.approved).length} of ${docs.length} approved`));
  assert.ok(html.includes(`<span class="badge">${ok}/${plan.steps.length}</span>`));
  assert.ok(html.includes(`<h2>Open questions</h2><p>Waiting for a decision</p></div><span class="badge">${open}</span>`));
  assert.ok(open === 4 && ok === 2);
});

test('document text never becomes page code', () => {
  const html = htmlOf({ 'docs/prd.md': [
    '# PRD: <img src=x onerror=alert(1)>', '> v1 · Draft', '', '## What it is',
    'A page with <script>alert(1)</script> and "quotes" & ampersands.', '',
    '- **Owner:** <b onclick="x()">me</b>', '- TBD: who <i>decides</i>. Decided when soon.', '',
    '| Name | Color |', '|---|---|', '| Main | #12ab34" onmouseover="x |', '', '[click](javascript:alert(1))', '',
  ].join('\n') });
  assert.ok(!/<script>alert/.test(html) && !/<img src=x/.test(html) && !/<b onclick/.test(html));
  const tags = html.replace(/<style>[\s\S]*?<\/style>/, '').match(/<[^>]*>/g);
  assert.deepStrictEqual(tags.filter((t) => /\son[a-z]+\s*=/i.test(t)), [], 'no live handler');
  const links = tags.filter((t) => /\shref\s*=/i.test(t));
  assert.ok(links.every((t) => /^<a href="#v-(home|prd)" class="[^"]+">$/.test(t)), 'only generated reader links');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('style="--c:#12ab34"'));
});

test('F01: the page is never written over a document, a link or a file it did not make', () => {
  withProject({ 'docs/prd.md': PRD('## Why\nBecause.') }, (dir) => {
    const prd = path.join(dir, 'docs', 'prd.md'); const before = fs.readFileSync(prd, 'utf8');
    let r = run([dir, prd]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /must be written to an \.html file/);
    fs.symlinkSync(prd, path.join(dir, 'docs', 'read.html'));
    r = run([dir]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /is a link/);
    assert.strictEqual(fs.readFileSync(prd, 'utf8'), before, 'the PRD is untouched');
    const other = path.join(dir, 'notes.html'); fs.writeFileSync(other, '<p>mine</p>');
    r = run([dir, other]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /not a reader page/);
    assert.strictEqual(fs.readFileSync(other, 'utf8'), '<p>mine</p>');
    fs.unlinkSync(path.join(dir, 'docs', 'read.html'));
    fs.linkSync(prd, path.join(dir, 'docs', 'read.html')); // a hard link: the same file under another name
    r = run([dir]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /is one of the documents/);
    assert.strictEqual(fs.readFileSync(prd, 'utf8'), before, 'the PRD is untouched');
  });
  withProject({ 'docs/prd.md': PRD('## Why\nBecause.') }, (dir) => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'read-page-else-'));
    try {
      fs.mkdirSync(path.join(dir, 'pages'));
      fs.symlinkSync(elsewhere, path.join(dir, 'pages', 'out')); // a linked folder inside the project
      const r = run([dir, path.join(dir, 'pages', 'out', 'read.html')]);
      assert.strictEqual(r.status, 1); assert.match(r.stderr, /is a link; the page is written only into plain folders/);
      assert.deepStrictEqual(fs.readdirSync(elsewhere), []);
    } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
  });
  withProject({ 'DESIGN.md': '# DESIGN.md: Test\n> v1 · Draft\n\n## The feel\nCalm.\n' }, (dir) => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'read-page-else-'));
    try {
      fs.symlinkSync(elsewhere, path.join(dir, 'docs')); // docs/ itself is a link
      const r = run([dir]);
      assert.strictEqual(r.status, 1); assert.match(r.stderr, /is a link/);
      assert.deepStrictEqual(fs.readdirSync(elsewhere), []);
    } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
  });
  withProject({ 'DESIGN.md': '# DESIGN.md: Test\n> v1 · Draft\n\n## The feel\nCalm.\n' }, (dir) => {
    const r = run([dir]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(fs.existsSync(path.join(dir, 'docs', 'read.html')), 'the docs folder is made');
    assert.strictEqual(run([dir]).status, 0, 'and its own page can be refreshed');
  });
});

test('a folder with no documents, or Markdown the reader would have to guess, is refused and no page is written', () => {
  withProject({ 'docs/.keep': '' }, (dir) => {
    const r = run([dir]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /refused: Project error: no project documents/);
    assert.ok(!fs.existsSync(path.join(dir, 'docs', 'read.html')));
  });
  withProject({ 'docs/prd.md': '# PRD: X\n> v1 · Draft\n\n## What\n```\nnever closed\n' }, (dir) => {
    const r = run([dir]);
    assert.strictEqual(r.status, 1); assert.match(r.stderr, /refused: docs\/prd\.md: line 5/);
    assert.ok(!fs.existsSync(path.join(dir, 'docs', 'read.html')));
  });
});

test('the command line writes docs/read.html beside the documents', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-page-'));
  try {
    fs.cpSync(ex('study-timer'), dir, { recursive: true });
    fs.rmSync(path.join(dir, 'docs', 'read.html'), { force: true });
    const out = execFileSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8' });
    assert.match(out, /wrote .*read\.html \(4 documents\)/);
    assert.strictEqual(fs.readFileSync(path.join(dir, 'docs', 'read.html'), 'utf8'), page('study-timer'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

for (const [kind, contents] of [
  ['empty', Buffer.alloc(0)],
  ['quoted-marker', Buffer.from('<!doctype html>\n<title>My notes</title>\n<pre><meta name="generator" content="project-docs read-page"></pre>\n')],
]) {
  test(`round 4 F01: preserves every byte of an existing ${kind} output file`, () => {
    withProject({ 'docs/prd.md': PRD('## Why\nBecause.'), 'mine.html': contents }, (dir) => {
      const destination = path.join(dir, 'mine.html');
      const result = run([dir, destination]);
      assert.ok(fs.readFileSync(destination).equals(contents), 'existing output bytes');
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /already exists and is not a reader page/);
    });
  });
}

function planWithArchivedStep(status) {
  return {
    'docs/plan.md': [
      '# Plan: Test', '> v1 · Draft', '', '## Steps', '',
      '<details data-project-docs-history>', '<summary>An earlier step</summary>', '',
      '### Step 1: Archived task', '- **Covers:** M1', '- **How we know it works:** Try the old thing.', `- **Status:** ${status}`,
      '', '</details>', '',
      '### Step 2: Live task', '- **Covers:** M2', '- **How we know it works:** Try the live thing.', '- **Status:** not started', '',
    ].join('\n'),
  };
}

test('round 4 F03: the Overview only counts the live Plan steps with badges', () => {
  const html = htmlOf(planWithArchivedStep('✅ checked 2026-11-01'));
  const home = view(html, 'home');
  assert.match(home, /<h2>Plan progress<\/h2><p>1 step · 0 checked · 0 waiting for your check<\/p>/);
  assert.match(home, /<span class="badge">0\/1<\/span>/);
  assert.match(home, /Steps checked<\/p><b>0<small>\/1<\/small><\/b>/);
  const plan = view(html, 'plan');
  assert.match(plan, /Archived task/);
  assert.match(plan, /Live task <span class="st todo">Not started<\/span>/);
  assert.doesNotMatch(plan, /class="st ok"/);
});

test('round 4 F03: the current-step card excludes a waiting archived step', () => {
  const html = htmlOf(planWithArchivedStep('◐ waiting for your check (ran: tried it, 2026-11-01)'));
  const home = view(html, 'home');
  assert.match(home, /<h2>Step 2<\/h2><p class="fee">Not started<\/p>/);
  assert.match(home, /step 1 of 1/);
  assert.match(home, /<b class="ct">Live task<\/b>/);
  assert.doesNotMatch(home, /Archived task/);
});

test('round 4 F13: an empty project reports a project error and no available reader', () => {
  withProject({}, (dir) => {
    const result = run([dir]);
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Project error: no project documents/);
    assert.doesNotMatch(result.stderr, /line \d|Previous reader page/);
    assert.match(result.stderr, /Reader unavailable\./);
  });
});

test('round 4 F13: an output directory reports an output error and no available reader', () => {
  withProject({ 'docs/prd.md': PRD('## Why\nBecause.'), 'out.html/keep.txt': 'keep' }, (dir) => {
    const result = run([dir, path.join(dir, 'out.html')]);
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Output error:/);
    assert.doesNotMatch(result.stderr, /line \d|Previous reader page/);
    assert.match(result.stderr, /Reader unavailable\./);
    assert.strictEqual(fs.readFileSync(path.join(dir, 'out.html', 'keep.txt'), 'utf8'), 'keep');
  });
});

test('round 4 F13: a source error locates the line and offers a prior page only if present', () => {
  const valid = PRD('## Why\nBecause.');
  const broken = PRD('## Why\n```\nnever closed');
  withProject({ 'docs/prd.md': valid }, (dir) => {
    const dest = path.join(dir, 'docs/read.html');
    assert.strictEqual(run([dir]).status, 0);
    const prior = fs.readFileSync(dest);
    fs.writeFileSync(path.join(dir, 'docs/prd.md'), broken);
    const stale = run([dir]);
    assert.strictEqual(stale.status, 1);
    assert.match(stale.stderr, /refused: docs\/prd\.md: line 5:/);
    assert.ok(stale.stderr.includes(`Previous reader page: ${dest} (out of date).`));
    assert.deepStrictEqual(fs.readFileSync(dest), prior);
  });
  withProject({ 'docs/prd.md': broken, 'docs/read.html': '<p>Foreign page</p>' }, (dir) => {
    const missing = run([dir]);
    assert.strictEqual(missing.status, 1);
    assert.match(missing.stderr, /refused: docs\/prd\.md: line 5:/);
    assert.match(missing.stderr, /Reader unavailable\./);
    assert.doesNotMatch(missing.stderr, /Previous reader page/);
  });
});

test('F02 (round 4): a port decision settles independently of its parent host decision', () => {
  const files = { 'docs/trd.md': PRD([
    '## Services',
    '- TBD: the host. Decided when IT chooses.',
    '  - TBD: the port. Decided when IT chooses.',
    '    - Changed 2026-11-21: TBD → 443, because IT chose HTTPS.',
  ].join('\n')) };
  assert.deepStrictEqual(docsOf(files)[0].tbd, ['the host']);
  const html = htmlOf(files);
  assert.match(view(html, 'home'), /1 open/);
  inOrder(view(html, 'trd'), ['Open question</span>', 'the host', 'Settled</span>', 'the port', '443']);
});

test('F02 (round 4): a quoted example cannot settle a live decision', () => {
  const files = { 'docs/trd.md': PRD([
    '## Services',
    '- TBD: the host. Decided when IT chooses.',
    '',
    '  > - Changed 2026-11-21: TBD → ExampleHost, because this is a sample.',
  ].join('\n')) };
  assert.deepStrictEqual(docsOf(files)[0].tbd, ['the host']);
  const html = htmlOf(files);
  assert.match(view(html, 'home'), /1 open/);
  inOrder(view(html, 'trd'), ['Open question</span>', 'the host', '<blockquote>', 'ExampleHost']);
});

test('F02 (round 4): a change with an empty target is refused at its own line', () => {
  const files = { 'docs/trd.md': PRD([
    '## Services',
    '- TBD: the host. Decided when IT chooses.',
    '  - Changed 2026-11-21: TBD → , because IT chose HTTPS.',
  ].join('\n')) };
  assert.throws(() => docsOf(files), /docs\/trd\.md: line 6: a change under an open question must read/);
});

test('F02 (round 4): English change syntax keeps separators inside quoted values', () => {
  const files = { 'docs/trd.md': PRD([
    '## Services',
    '- TBD: the host. Decided when IT chooses.',
    '  - Changed 2026-11-21: "example, because label → alias" → Acme, because IT chose it.',
  ].join('\n')) };
  assert.deepStrictEqual(docsOf(files)[0].tbd, []);
  inOrder(view(htmlOf(files), 'trd'), ['Settled</span>', 'example, because label → alias', 'Acme']);
});

test('F02 (round 4): Arabic change syntax keeps separators inside quoted values', () => {
  const files = { 'docs/trd.md': [
    '# المتطلبات التقنية (TRD): تجربة',
    '> الإصدار 1 · مسودة',
    '',
    '## الخدمات',
    '- لم يُحسم بعد: المضيف. يُحسم عندما يقرر الفريق.',
    '  - تغيّر في 2026-11-21: من «قديم، لأن الوصف يشير إلى رمز» إلى أكمي، لأن الفريق اختاره.',
  ].join('\n') };
  assert.deepStrictEqual(docsOf(files)[0].tbd, []);
  inOrder(view(htmlOf(files), 'trd'), ['حُسم</span>', 'قديم، لأن الوصف يشير إلى رمز', 'أكمي']);
});

for (const [language, title, stamp, section, version] of [
  ['English', ['PRD: Long', 'title'], 'v2 · Approved 2026-11-21 by Sam', 'Why', 'v2'],
  ['Arabic', ['متطلبات المنتج (PRD): عنوان', 'طويل'], 'الإصدار 2 · معتمد 2026-11-21 من سام', 'لماذا', 'الإصدار 2'],
]) {
  test(`F04 (round 4): ${language} stamp follows the underline of a multiline title`, () => {
    const files = { 'docs/prd.md': [...title, '===', '> ' + stamp, '', '## ' + section, '', 'Text.'].join('\n') };
    const [doc] = docsOf(files);
    assert.strictEqual(doc.title, title.join(' '));
    assert.strictEqual(doc.approved, true);
    assert.strictEqual(doc.version, version);
    assert.ok(view(htmlOf(files), 'prd').includes(stamp));
  });
}

test('F05 (round 4): a quote consumes one marker and keeps a literal greater-than sign in its fence', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Notes\n> ```text\n>>literal\n> ```\n') }), 'prd');
  assert.ok(v.includes('<pre>```text\n&gt;literal\n```</pre>'));
});

test('F05 (round 4): a fence in a list in an existing quote loses exactly both container prefixes', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Notes\n> Intro.\n>\n> - ```text\n>   >literal\n>   ```\n') }), 'prd');
  assert.ok(v.includes('<pre>```text\n&gt;literal\n```</pre>'));
});

for (const [kind, literal] of [
  ['fenced code', ['```html', '</details>', '```']],
  ['an HTML comment', ['<!--', '</details>', '-->']],
  ['a list in an existing quote', null],
]) {
  test(`F06 (round 4): tagged history stays in one exact disclosure with ${kind}`, () => {
    const record = ['<details data-project-docs-history>', '<summary>Earlier history</summary>', '',
      ...(literal || ['Previously closed.']), '', 'Still in history.', '', '</details>'];
    const md = literal ? [...record, 'After history.'] : [
      '> Intro.', '>', `> - ${record[0]}`, ...record.slice(1).map((line) => `>   ${line}`), '>   After history.',
    ];
    const v = view(htmlOf({ 'docs/prd.md': PRD(['## Notes', ...md].join('\n')) }), 'prd');
    const folds = v.match(/<details class="code">[\s\S]*?<\/details>/g) || [];
    assert.strictEqual(folds.length, 1);
    const want = record.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    assert.ok(folds[0].includes(`<pre>${want}</pre>`), 'one disclosure contains the complete record');
    const outside = v.replace(folds[0], '');
    assert.ok(!outside.includes('Still in history.') && outside.includes('After history.'));
  });
}

for (const [kind, start, next] of [
  ['spaces', '> - 7. Seven', '>   8. Eight'],
  ['tabs', '> -\t7. Seven', '> \t8. Eight'],
]) {
  test(`F08 (round 4): a nested list in an existing quote keeps its numbering with ${kind}`, () => {
    const v = view(htmlOf({ 'docs/prd.md': PRD(['## Notes', '> Intro.', '>', start, next].join('\n')) }), 'prd');
    assert.strictEqual((v.match(/<ol /g) || []).length, 1);
    inOrder(v, ['<ol class="steps" start="7">', '<span class="n">7</span>', 'Seven', '<span class="n">8</span>', 'Eight', '</ol>']);
  });
}

test('F09 (round 4): quoted H1, H2 and H3 keep their relative levels', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Notes\n> # First\n> ## Second\n> ### Third\n') }), 'prd');
  assert.match(v, /<blockquote><h3 class="hq">First<\/h3><h4 class="hq">Second<\/h4><h5 class="hq">Third<\/h5><\/blockquote>/);
});

test('F06 (round 4): an unmatched history opener does not absorb later live sections', () => {
  const v = view(htmlOf({ 'docs/prd.md': PRD('## Notes\n<details data-project-docs-history>\n<summary>Unclosed</summary>\n\n## Live section\nLive prose.\n') }), 'prd');
  const folds = v.match(/<details class="code">[\s\S]*?<\/details>/g) || [];
  assert.strictEqual(folds.length, 1);
  assert.ok(folds[0].includes('Unclosed') && !folds[0].includes('Live'));
  assert.ok(v.includes('<h2>Live section</h2>') && v.includes('<p class="lead">Live prose.</p>'));
});
