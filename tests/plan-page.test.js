// The plan page (scripts/plan-page.js): docs/plan.md → docs/plan.html.
// It must read every example plan in both languages, keep each example's page up to date, open every card
// without JavaScript, load nothing from the network, and never let plan text become page code.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const SCRIPT = path.join(SKILL, 'scripts', 'plan-page.js');
const { parse, render } = require(SCRIPT);
const EXAMPLES = ['cedar-clinic', 'cedar-clinic-ar', 'study-timer', 'notes-digest'];
const md = (folder) => fs.readFileSync(path.join(SKILL, 'examples', folder, 'docs', 'plan.md'), 'utf8');
const pageOf = (folder) => path.join(SKILL, 'examples', folder, 'docs', 'plan.html');

const NBSP = String.fromCharCode(160); // a non-breaking space: it looks like a space and is not one
const STEP = (n, status, extra = '') => `### Step ${n}: Step ${n}\n- **Covers:** M1\n- **How we know it works:** try ${n}.\n${extra}- **Status:** ${status}\n`;
const PLAN = (...steps) => `# Plan: Test\n> v1 · Draft\n\n## Steps\n\n${steps.join('\n')}`;

for (const folder of EXAMPLES) {
  test(`(${folder}) the plan page reads every step with one of the four states`, () => {
    const text = md(folder).replace(/\r\n/g, '\n');
    const plan = parse(text);
    const headings = text.split('\n').filter((l) => l.startsWith('### ')).length;
    assert.strictEqual(plan.steps.length, headings);
    assert.deepStrictEqual(plan.steps.map((s) => s.n), plan.steps.map((_, i) => i + 1), 'steps in order');
    for (const s of plan.steps) {
      assert.ok(['done', 'check', 'todo', 'blocked'].includes(s.state), `step ${s.n}`);
      assert.ok(s.check.length > 0, `step ${s.n} has its check`);
      if (s.state === 'blocked') assert.ok(s.when.length > 0, `step ${s.n} names what it waits for`);
      if (s.state === 'done') assert.match(s.when, /^\d{4}-\d{2}-\d{2}$/, `step ${s.n} has its check date`);
    }
  });

  test(`(${folder}) the example's plan.html is up to date with its plan.md`, () => {
    assert.ok(fs.existsSync(pageOf(folder)), 'run: node scripts/plan-page.js examples/<folder>/docs/plan.md');
    assert.strictEqual(fs.readFileSync(pageOf(folder), 'utf8'), render(parse(md(folder))), 'regenerate the page');
  });
}

test('the clinic examples show the new lines: a Built line on every built step, notes in the person\'s words', () => {
  for (const folder of ['cedar-clinic', 'cedar-clinic-ar']) {
    const { steps } = parse(md(folder));
    for (const s of steps) {
      if (s.state === 'done' || s.state === 'check') assert.ok(s.built, `(${folder}) step ${s.n} is built but has no Built line`);
      else assert.strictEqual(s.built, '', `(${folder}) step ${s.n} is not built but has a Built line`);
    }
    assert.ok(steps.some((s) => s.notes.length && s.notes.every((n) => /^\d{4}-\d{2}-\d{2}$/.test(n.date) && n.text)), `(${folder}) a dated note`);
  }
});

test('the page works without JavaScript and loads nothing from the network', () => {
  for (const folder of EXAMPLES) {
    const page = fs.readFileSync(pageOf(folder), 'utf8');
    const n = parse(md(folder)).steps.length;
    assert.ok(!/(src|href)\s*=\s*["']?(https?:)?\/\//i.test(page), `(${folder}) no outside file`);
    assert.ok(!/@import|url\(\s*["']?https?:/i.test(page), `(${folder}) no outside style or font`);
    assert.ok(!/<script[^>]+src=/i.test(page), `(${folder}) no script file`);
    for (let i = 1; i <= n; i++) {
      assert.ok(page.includes(`id="r${i}"`) && page.includes(`id="p${i}"`), `(${folder}) step ${i} has its switch and its popup`);
      assert.ok(page.includes(`#r${i}:checked~.pops #p${i}`), `(${folder}) step ${i} opens with CSS alone`);
      assert.ok(page.includes(`<label class="card s-`) && page.includes(`for="r${i}"`), `(${folder}) a card opens step ${i}`);
    }
    assert.ok(page.includes('id="r0" checked'), `(${folder}) every popup is closed at first`);
    assert.strictEqual((page.match(/for="r0"/g) || []).length, 2 * n, `(${folder}) each popup has a close button and a background that close it`);
  }
});

test('the four columns and the "You are here" bar follow the statuses', () => {
  const html = render(parse(PLAN(STEP(1, '✅ checked 2026-01-02'), STEP(2, '◐ waiting for your check (ran: tried it, 2026-01-03)'),
    STEP(3, 'not started'), STEP(4, '⛔ waits for TBD: the host'))));
  const col = (k) => html.split(`<section class="col s-${k}">`)[1].split('</section>')[0];
  assert.match(col('done'), /Step 1</); assert.match(col('check'), /Step 2</);
  assert.match(col('todo'), /Step 3</); assert.match(col('blocked'), /Step 4</);
  assert.match(col('blocked'), /Needs: the host/);
  assert.match(html, /<label class="here" for="r2"/, 'here = the first step not checked');
  assert.match(html, /Check the builder ran: tried it, 2026-01-03/);
  const allDone = render(parse(PLAN(STEP(1, '✅ checked 2026-01-02'))));
  assert.match(allDone, /all steps checked/);
});

test('plan text is shown as text, never run as page code', () => {
  const evil = '<script>alert(1)</script><img src=x onerror=alert(2)>';
  const html = render(parse(PLAN(STEP(1, 'not started', `- **Built:** ${evil}\n- **Your note:** 2026-01-01 — ${evil}\n`)).replace('Step 1: Step 1', `Step 1: ${evil}`)));
  assert.ok(!html.includes('<script>alert') && !html.includes('<img src=x'), 'escaped');
  assert.strictEqual((html.match(/<script>/g) || []).length, 1, 'only the page\'s own keyboard script');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('Arabic plans give an Arabic page, right to left', () => {
  const html = fs.readFileSync(pageOf('cedar-clinic-ar'), 'utf8');
  assert.match(html, /<html lang="ar" dir="rtl">/);
  for (const words of ['أنت هنا', 'بانتظار فحصك', 'بانتظار قرار', 'ما بُني', 'قراراتك']) assert.ok(html.includes(words), words);
  assert.ok(!/>Waiting for|>You are here</.test(html), 'no English page words');
  assert.match(fs.readFileSync(pageOf('cedar-clinic'), 'utf8'), /<html lang="en" dir="ltr">/);
});

test('a plan the script cannot read is refused with a reason, and no page is written', () => {
  assert.throws(() => parse('# PRD: Not a plan\n'), /not a plan/);
  assert.throws(() => parse('# Plan: X\n> v1 · Draft\n\n## Steps\n'), /no steps/);
  assert.throws(() => parse(PLAN('### Step 1: A\n- **Covers:** M1\n- **How we know it works:** try.\n')), /Step 1: A: no Status line/);
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'plan-page-'));
  fs.writeFileSync(path.join(tmp, 'plan.md'), '# PRD: Not a plan\n');
  assert.throws(() => execFileSync(process.execPath, [SCRIPT, path.join(tmp, 'plan.md')], { stdio: 'pipe' }), /plan page not written/);
  assert.ok(!fs.existsSync(path.join(tmp, 'plan.html')));
  fs.writeFileSync(path.join(tmp, 'plan.md'), PLAN(STEP(1, 'not started')));
  assert.match(execFileSync(process.execPath, [SCRIPT, path.join(tmp, 'plan.md')]).toString(), /1 steps, 0 checked/);
  assert.ok(fs.existsSync(path.join(tmp, 'plan.html')));
  fs.rmSync(tmp, { recursive: true });
});

test('the Plan reference tells when to make, refresh and open the page, and the two new lines', () => {
  const ref = fs.readFileSync(path.join(SKILL, 'references', 'plan.md'), 'utf8').replace(/\s+/g, ' ');
  for (const rule of ['## The plan page', 'scripts/plan-page.js docs/plan.md', 'never write or edit the page by hand',
    'Do you want the plan as a PDF?', 'it names the step, or the line of the file, to fix', 'reads the plan the way Markdown reads it',
    'only when it sits under **How we know it works**', 'تحت سطر **كيف نعرف أنها تعمل**', 'make it once, never refresh it', 'After every change to a step', '"Where are we?"',
    '- **Built:**', '- **Your note:**', 'Only the person\'s own words', '- **ما بُني:**', '- **ملاحظتك:**']) {
    assert.ok(ref.includes(rule), `plan.md must say: ${rule}`);
  }
  const skill = fs.readFileSync(path.join(SKILL, 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('scripts/plan-page.js') && skill.includes('scripts/markdown-blocks.js') && skill.includes('where are we?'));
});

// Review round 1 (0.8.0): F01–F05.
const popupOf = (html, n) => html.split(`id="p${n}"`)[1].split('<div class="pop ')[0];
const cardOf = (html, n) => html.split(`<label class="card`).slice(1).find((c) => c.includes(`for="r${n}"`)).split('</label>')[0];

test('F01: a changed check shows what it is now, with the first wording kept as history', () => {
  for (const [folder, now, first, chip] of [
    ['cedar-clinic', 'going online only after step 10 is also checked', 'As first written (the changes below replace the part they name):', 'Check changed'],
    ['cedar-clinic-ar', 'النشر بعد فحص الخطوة 10 أيضًا', 'كما كُتبت أول مرة (التغييرات أدناه تستبدل الجزء الذي تذكره):', 'تغيّر الفحص'],
  ]) {
    const html = render(parse(md(folder)));
    const step5 = popupOf(html, 5);
    assert.ok(step5.includes(first) && step5.includes('class="old"'), `(${folder}) the first wording is marked as history`);
    assert.ok(step5.includes('class="chg"') && step5.includes('2026-11-11'), `(${folder}) the change and its date are shown`);
    assert.ok(step5.includes(now), `(${folder}) what the check is now is shown: ${now}`);
    assert.ok(cardOf(html, 5).includes(chip), `(${folder}) the card says its check changed`);
    assert.ok(!popupOf(html, 1).includes('class="chg"'), `(${folder}) an unchanged step shows no change`);
  }
});

test('F03: a plan the page would show wrongly is refused, naming the step', () => {
  const bad = [
    [PLAN(STEP(1, 'not started'), '### Step two: B\n- **Covers:** M1\n- **How we know it works:** b.\n- **Status:** ⛔ waits for TBD: x\n'), /Step two: B.*not a step heading/],
    [PLAN(STEP(1, 'not started'), STEP(1, 'not started')), /Step 1: Step 1: steps must be numbered/],
    [PLAN(STEP(1, 'not started'), STEP(3, 'not started')), /expected 2/],
    [PLAN('### Step 1: A\n- **Covers:** M1\n- **How we know it works:** \n- **Status:** not started\n'), /Step 1: A: no How we know it works line/],
    [PLAN(STEP(1, '✅ checked')), /Step 1: Step 1: the Status must be exactly one of/],
    [PLAN(STEP(1, '⛔ waits for TBD')), /Step 1: Step 1: the Status must be exactly one of/],
    [PLAN(STEP(1, '⛔ waits for TBD:  ')), /Step 1: Step 1: the Status must be exactly one of/],
    [PLAN(STEP(1, '◐ waiting for your check')), /Step 1: Step 1: the Status must be exactly one of/],
  ];
  for (const [plan, reason] of bad) assert.throws(() => parse(plan), reason);
});

test('F04: "Nothing built yet" only for unbuilt steps; a built step without its Built line says so', () => {
  const html = render(parse(PLAN(STEP(1, '✅ checked 2026-01-02'), STEP(2, '◐ waiting for your check (ran: tried, 2026-01-03)'),
    STEP(3, 'not started'), STEP(4, '⛔ waits for TBD: the host'))));
  for (const n of [1, 2]) assert.ok(popupOf(html, n).includes('No Built line was recorded') && !popupOf(html, n).includes('Nothing built yet'), `step ${n}`);
  for (const n of [3, 4]) assert.ok(popupOf(html, n).includes('Nothing built yet'), `step ${n}`);
  assert.ok(popupOf(html, 2).includes('Check the builder ran: tried, 2026-01-03'), 'the recorded run stays');
});

test('F02 and F05: keyboard focus stays in the open card; the phone layout keeps the counts inside the screen', () => {
  const html = render(parse(PLAN(STEP(1, 'not started'))));
  const js = html.split('<script>')[1];
  for (const part of ["querySelector('.x').focus()", 'opener.focus()', "e.key==='Tab'", 'e.shiftKey', "matches('.card,.here')"]) {
    assert.ok(js.includes(part), `keyboard script: ${part}`);
  }
  const phone = html.split('@media (max-width:600px){')[1].split('@media')[0];
  assert.ok(phone.includes('.counts{grid-template-columns:1fr') && phone.includes('.counts span{white-space:normal}'), 'counts wrap on a phone');
  assert.ok(html.includes('header{grid-template-columns:minmax(0,1fr)}'), 'the header may shrink below its content');
});

// Review round 2 (0.8.0): F01, F03, F05 and F08 again.
test('F01 (round 2): status history is not a check change, and of two changes the newest is marked latest', () => {
  const settled = '  - Changed 2026-01-05: waited for the host → not started, because the TRD settled it as Hetzner.\n';
  const html = render(parse(PLAN(STEP(1, 'not started', settled))));
  assert.ok(!cardOf(html, 1).includes('Check changed'), 'no "Check changed" chip for status history');
  assert.ok(!popupOf(html, 1).includes('As first written') && !popupOf(html, 1).includes('class="old"'), 'the check is not marked as history');
  assert.ok(popupOf(html, 1).includes('2026-01-05 · status changed') && popupOf(html, 1).includes('waited for the host → not started'), 'status history is shown');
  const two = '  - Changed 2026-01-05: one day → two days, because A.\n  - Changed 2026-01-09: two days → three days, because B.\n';
  const p = popupOf(render(parse(PLAN(STEP(1, 'not started', two)))), 1);
  assert.strictEqual((p.match(/class="chg latest"/g) || []).length, 1, 'exactly one change is the latest');
  assert.ok(p.indexOf('Latest · Changed 2026-01-09') > p.indexOf('Changed 2026-01-05'), 'the newest change is marked latest');
  const ar = render(parse('# خطة التنفيذ: س\n> الإصدار 1 · مسودة\n\n## الخطوات\n\n### الخطوة 1: أ\n- **تغطي:** M1\n- **كيف نعرف أنها تعمل:** جرّب.\n'
    + '  - تغيّر في 2026-01-05: من انتظار المضيف إلى لم تبدأ، لأن TRD حسمه.\n- **الحالة:** لم تبدأ\n'));
  assert.ok(!cardOf(ar, 1).includes('تغيّر الفحص') && popupOf(ar, 1).includes('تغيّرت الحالة'), 'Arabic status history');
});

test('F03 (round 2): only the Steps section counts, and every current status has its exact form', () => {
  const appendix = PLAN(STEP(1, 'not started')) + '\n## Appendix\n\n```markdown\n### Step 2: Example\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked 2026-01-01\n```\n';
  assert.strictEqual(parse(appendix).steps.length, 1, 'a fenced example after the Steps section is not a step');
  const fencedInside = PLAN(STEP(1, 'not started'), '```\n### Step 9: Shown as an example\n- **Status:** ✅ checked 2026-01-01\n```\n');
  assert.strictEqual(parse(fencedInside).steps.length, 1, 'a fenced example inside the Steps section is not a step');
  const bad = [
    [PLAN(STEP(1, 'not started', '- **Status:** ✅ checked 2026-11-19\n')), /Step 1: Step 1: more than one Status line/],
    [PLAN(STEP(1, '◐ waiting for your check (ran:   )')), /the Status must be exactly one of/],
    [PLAN(STEP(1, '◐ waiting for your check (ran: tried it)')), /the Status must be exactly one of/],
    [PLAN(STEP(1, 'started')), /the Status must be exactly one of/],
    [PLAN(STEP(1, 'not started', '- **How we know it works:** again.\n')), /more than one How we know it works line/],
    ['# خطة التنفيذ: س\n\n## الخطوات\n\n### الخطوة 1: أ\n- **تغطي:** M1\n- **كيف نعرف أنها تعمل:** جرّب.\n- **الحالة:** ✅ checked 2026-01-01\n', /يجب أن تكون|exactly one of|«لم تبدأ»/],
    ['# Plan: X\n\n### Step 1: A\n- **Covers:** M1\n- **How we know it works:** a.\n- **Status:** not started\n', /exactly one "## Steps" section/],
  ];
  for (const [plan, reason] of bad) assert.throws(() => parse(plan), reason);
});

test('F05 and F08 (round 2): the board is locked behind an open card, and the card body is reachable and scrollable by keyboard', () => {
  const html = render(parse(PLAN(STEP(1, 'not started'))));
  assert.ok(html.includes('html:has(.r:not(#r0):checked),html:has(.r:not(#r0):checked) body{overflow:hidden}'), 'scroll lock while a card is open, without JavaScript');
  assert.ok(html.includes('@media print{html,body{overflow:visible!important}'), 'printing is never clipped by the lock');
  assert.ok(popupOf(html, 1).includes('class="d-body" tabindex="0" role="region"'), 'the card body takes focus');
  const js = html.split('<script>')[1];
  for (const part of ['querySelectorAll(\'[tabindex="0"]\')', 'PageDown', 'End:1e9', 'b.scrollBy(0,by)']) assert.ok(js.includes(part), `keyboard script: ${part}`);
});

// Review round 3 (0.8.0): F01 and F03 again.
const AR = (extra, status = 'لم تبدأ') => `# خطة التنفيذ: س\n> الإصدار 1 · مسودة\n\n## الخطوات\n\n### الخطوة 1: أ\n- **تغطي:** M1\n- **كيف نعرف أنها تعمل:** جرّب.\n${extra}- **الحالة:** ${status}\n`;

test('F01 (round 3): quoted values are kept whole, and a line that cannot be split safely is shown whole', () => {
  const two = '  - تغيّر في 2026-01-05: من ثلاث لمسات إلى لمستين، لأن أ.\n'
    + '  - تغيّر في 2026-01-09: من «الانتقال إلى الصفحة الأولى» إلى «عرض صفحة التأكيد»، لأن ب.\n';
  const [c1, c2] = parse(AR(two)).steps[0].changes;
  assert.deepStrictEqual([c1.old, c1.now], ['ثلاث لمسات', 'لمستين']);
  assert.deepStrictEqual([c2.old, c2.now, c2.why], ['«الانتقال إلى الصفحة الأولى»', '«عرض صفحة التأكيد»', 'ب']);
  const latest = popupOf(render(parse(AR(two))), 1).split('class="chg latest"')[1];
  assert.ok(latest.includes('<p>«عرض صفحة التأكيد»</p>') && latest.includes('كانت: «الانتقال إلى الصفحة الأولى»'), 'the Latest box shows the full new and old wording');
  const ambiguous = parse(AR('  - تغيّر في 2026-01-09: من الانتقال إلى الصفحة الأولى إلى عرض صفحة التأكيد، لأن ب.\n')).steps[0].changes[0];
  assert.strictEqual(ambiguous.raw, 'من الانتقال إلى الصفحة الأولى إلى عرض صفحة التأكيد', 'two unquoted إلى: kept whole, never guessed');
  const amb = popupOf(render(parse(AR('  - تغيّر في 2026-01-09: من الانتقال إلى الصفحة الأولى إلى عرض صفحة التأكيد، لأن ب.\n'))), 1);
  assert.ok(amb.includes('<p>من الانتقال إلى الصفحة الأولى إلى عرض صفحة التأكيد</p>') && !amb.includes('كانت:'), 'shown whole, with no guessed "was"');
  const status = parse(AR('  - تغيّر في 2026-01-05: من انتظار الانتقال إلى الخادم إلى لم تبدأ، لأن TRD حسمه.\n')).steps[0].changes[0];
  assert.strictEqual(status.kind, 'unclear', 'two unquoted إلى leave a wait ambiguous too');
  assert.ok(popupOf(render(parse(AR('  - تغيّر في 2026-01-05: من انتظار الانتقال إلى الخادم إلى لم تبدأ، لأن TRD حسمه.\n'))), 1).includes('من انتظار الانتقال إلى الخادم إلى لم تبدأ'), 'shown whole');
  const en = parse(PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: "go a → b" → "show c", because the owner said so.\n'))).steps[0].changes[0];
  assert.deepStrictEqual([en.old, en.now], ['"go a → b"', '"show c"']);
});

test('F03 (round 3): fenced content is removed before the title, the Steps section and the fields are read', () => {
  const titleFence = PLAN(STEP(1, '✅ checked 2026-01-02'), '```markdown\n## Example\n### Step 2: Shown only as an example\n- **Status:** ✅ checked 2026-01-01\n```\n', STEP(2, '⛔ waits for TBD: the host'));
  const p1 = parse(titleFence);
  assert.deepStrictEqual(p1.steps.map((s) => s.state), ['done', 'blocked'], 'a fenced "## Example" neither ends the section nor adds a step');
  const nested = PLAN(STEP(1, 'not started'), '````markdown\n```\n### Step 2: Phantom\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked 2026-01-01\n```\n````\n');
  assert.strictEqual(parse(nested).steps.length, 1, 'a ``` example inside a ```` fence is not a step');
  const bilingual = PLAN(STEP(1, 'not started')) + '\n## Appendix\n\n```markdown\n# خطة التنفيذ: مثال\n\n## الخطوات\n\n### الخطوة 1: مثال\n- **تغطي:** M1\n- **كيف نعرف أنها تعمل:** س.\n- **الحالة:** ✅ فُحصت 2026-01-01\n```\n';
  const p3 = parse(bilingual);
  assert.ok(p3.lang === 'en' && p3.title === 'Test' && p3.steps.length === 1 && p3.steps[0].state === 'todo', 'a fenced Arabic template never replaces the English plan');
  const before = '```markdown\n# خطة التنفيذ: مثال\n```\n\n' + PLAN(STEP(1, 'not started'));
  assert.strictEqual(parse(before).lang, 'en', 'a fenced title before the plan is not the plan');
});

test('F03 (round 3): status dates must be real calendar dates', () => {
  for (const status of ['✅ checked 2026-02-30', '✅ checked 2026-02-29', '✅ checked 2026-13-01', '◐ waiting for your check (ran: tried, 2026-04-31)']) {
    assert.throws(() => parse(PLAN(STEP(1, status))), /is not a real date/, status);
  }
  assert.throws(() => parse(AR('', '✅ فُحصت 2026-02-30')), /is not a real date/);
  assert.strictEqual(parse(PLAN(STEP(1, '✅ checked 2028-02-29'))).steps[0].when, '2028-02-29', 'a leap day is a real date');
});

// Review round 4 (0.8.0): F01 and F03 again.
test('F01 (round 4): split only where the boundary is certain; nested quotes, a repeated reason marker and a quoted wait', () => {
  const nested = parse(AR('  - تغيّر في 2026-01-09: من «إرسال «الطلب» إلى الخادم» إلى «عرض حالة الاتصال»، لأن أ.\n')).steps[0].changes[0];
  assert.deepStrictEqual([nested.old, nested.now, nested.why], ['«إرسال «الطلب» إلى الخادم»', '«عرض حالة الاتصال»', 'أ'], 'nested quotes stay whole');
  for (const [plan, raw] of [
    [AR('  - تغيّر في 2026-01-09: من ثلاث إلى اثنتين، لأن العيادة طلبت، لأن الوقت ضيق.\n'), 'من ثلاث إلى اثنتين، لأن العيادة طلبت، لأن الوقت ضيق'],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: three → two, because the clinic asked, because time is short.\n')), 'three → two, because the clinic asked, because time is short'],
    [AR('  - تغيّر في 2026-01-09: من «إرسال الطلب إلى الخادم إلى «عرض»، لأن أ.\n'), null],
  ]) {
    const c = parse(plan).steps[0].changes[0];
    assert.ok(c.raw !== undefined && c.old === undefined, `kept whole: ${raw || 'unbalanced quotes'}`);
    if (raw) assert.strictEqual(c.raw, raw, 'the complete entry, reason included');
    if (raw) assert.ok(!popupOf(render(parse(plan)), 1).includes('Because: the clinic') && !popupOf(render(parse(plan)), 1).includes('كانت:'), 'nothing guessed on the card');
  }
  for (const plan of [
    AR('  - تغيّر في 2026-01-05: من «انتظار المضيف» إلى لم تبدأ، لأن TRD حسمه.\n'),
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: "waited for the host" → not started, because the TRD settled it.\n')),
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'status', 'a quoted wait is status history');
    assert.ok(!cardOf(html, 1).includes('Check changed') && !cardOf(html, 1).includes('تغيّر الفحص'), 'no Check changed badge');
  }
});

test('F03 (round 4): a closing fence allows only spaces or tabs after it; list-item and unclosed fences are refused', () => {
  const nbsp = PLAN(STEP(1, 'not started'), '```\n### Step 2: Fake\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked 2026-01-01\n```' + NBSP + '\nstill inside the example\n```\n');
  assert.deepStrictEqual(parse(nbsp).steps.map((s) => s.state), ['todo'], 'a fence line followed by a non-breaking space does not close it');
  const tabClose = PLAN(STEP(1, 'not started'), '```\n### Step 2: Fake\n- **Status:** ✅ checked 2026-01-01\n```\t \n', STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(tabClose).steps.map((s) => s.state), ['todo', 'blocked'], 'spaces and tabs after a closing fence are fine');
  const listFence = PLAN(STEP(1, 'not started', '- **Built:** an example:\n  ```\n  code\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(listFence), /a code fence inside a list item is not closed before the item ends/);
  assert.throws(() => parse(PLAN(STEP(1, 'not started'), '```\n### Step 2: X\n')), /opened and never closed/);
  const listClosed = PLAN(STEP(1, 'not started', '- **Built:** an example:\n  ```\n  ### Step 9: not a step\n  ```\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(listClosed).steps.map((s) => s.state), ['todo', 'blocked'], 'a list-item fence closed inside its item is fine');
});

// Review round 5 (0.8.0): F01 and F03 again.
test('F01 (round 5): a settled wait is the whole move to "not started"; crossed quotes and empty sides stay whole', () => {
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: “waited for the confirmation message” → “open the audit log and find the confirmation line”, because the clinic asked.\n')),
    AR('  - تغيّر في 2026-01-09: من «انتظار رسالة التأكيد» إلى «افتح سجل التدقيق وابحث عن سطر التأكيد»، لأن العيادة طلبت.\n'),
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'check', 'a check that once mentioned waiting is still a check change');
    assert.ok(popupOf(html, 1).includes('class="chg"') && !popupOf(html, 1).includes('class="ch"'), 'shown under The plan, not in Your decisions');
    assert.ok(cardOf(html, 1).includes('Check changed') || cardOf(html, 1).includes('تغيّر الفحص'), 'the card says the check changed');
  }
  assert.strictEqual(parse(PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: waited for the host → not started, because the TRD settled it.\n'))).steps[0].changes[0].kind, 'status', 'a real settled wait');
  for (const [plan, what] of [
    [AR('  - تغيّر في 2026-01-09: من «أ "ب» ج" إلى د، لأن هـ.\n'), 'crossed quotes'],
    [AR('  - تغيّر في 2026-01-09: من “أ «ب” ج» إلى د، لأن هـ.\n'), 'crossed quotes that balance in number'],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-01-09:  → two, because x.\n')), 'empty old side'],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: one → , because x.\n')), 'empty new side'],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: one → two, because .\n')), 'empty reason'],
  ]) {
    const c = parse(plan).steps[0].changes[0];
    assert.ok(c.raw !== undefined && c.old === undefined, `kept whole: ${what}`);
    assert.ok(!popupOf(render(parse(plan)), 1).includes('Was:') && !popupOf(render(parse(plan)), 1).includes('كانت:'), `no split shown: ${what}`);
  }
});

test('F03 (round 5): top-level fences indented 1–3 spaces are fine; a list fence closed left of its item is refused', () => {
  for (const n of [1, 2, 3]) {
    const pad = ' '.repeat(n);
    const plan = PLAN(STEP(1, 'not started'), `An example of a step:\n${pad}\`\`\`\n### Step 2: Sample\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked 2026-01-01\n${pad}\`\`\`\n`, STEP(2, '⛔ waits for TBD: the host'));
    assert.deepStrictEqual(parse(plan).steps.map((s) => s.state), ['todo', 'blocked'], `top-level fence indented ${n}`);
  }
  const oneAfterItem = PLAN(STEP(1, 'not started'), ' ```\n### Step 2: Sample\n- **Status:** ✅ checked 2026-01-01\n ```\n', STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(oneAfterItem).steps.map((s) => s.state), ['todo', 'blocked'], 'one space after a list item is left of its content: a top-level fence');
  const zeroCloser = PLAN(STEP(1, 'not started', '- **Built:** a sample:\n  ```\n  ### Step 2: Sample\n  - **Status:** ✅ checked 2026-01-01\n```\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(zeroCloser), /line \d+: a code fence inside a list item is not closed before the item ends at line \d+/, 'a column-zero marker does not close a list-item fence');
});

// Review round 6 (0.8.0): F01 and F03 again.
test('F01 (round 6): a settled wait kept whole is still status history; an uncertain line never marks the check as replaced', () => {
  for (const plan of [
    AR('  - تغيّر في 2026-01-05: من انتظار «الانتقال إلى الخادم» إلى «لم تبدأ»، لأن TRD حسمه، لأن العيادة وافقت.\n'),
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: waited for “a → b handover” → "not started", because the TRD settled it, because the clinic agreed.\n')),
    AR('  - تغيّر في 2026-01-05: من انتظار المضيف إلى لم تبدأ، لأن TRD حسمه، لأن العيادة وافقت.\n'),
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: waited for the host → not started, because the TRD settled it, because the clinic agreed.\n')),
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'status', 'a confirmed wait stays status history');
    assert.ok(!cardOf(html, 1).includes('Check changed') && !cardOf(html, 1).includes('تغيّر الفحص'), 'no Check changed badge');
    assert.ok(!popupOf(html, 1).includes('class="old"'), 'the check is not marked as replaced');
  }
  for (const [plan, label] of [
    [AR('  - تغيّر في 2026-01-09: من أ إلى ب إلى ج، لأن د.\n'), 'كما كُتب'],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: waited for a → b → open the log, because x.\n')), 'recorded as written'],
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'unclear');
    assert.ok(popupOf(html, 1).includes('class="chg unclear"') && popupOf(html, 1).includes(label), 'shown as written');
    assert.ok(!popupOf(html, 1).includes('class="old"') && !popupOf(html, 1).includes('As first written') && !popupOf(html, 1).includes('كما كُتبت أول مرة'), 'the check is not marked as replaced');
    assert.ok(!cardOf(html, 1).includes('Check changed') && !cardOf(html, 1).includes('تغيّر الفحص'), 'no badge for an uncertain line');
  }
  const two = PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: one → two, because A.\n  - Changed 2026-01-06: two → three, because B.\n  - Changed 2026-01-09: a → b → c, because C.\n'));
  assert.ok(!popupOf(render(parse(two)), 1).includes('Latest'), 'no "Latest" when the newest entry is uncertain');
});

test('F03 (round 6): a fence after a sub-item at the parent item\'s column belongs to the parent item', () => {
  const sub = '  - Changed 2026-01-01: a → b, because c.\n';
  const inside = PLAN(STEP(1, 'not started', `${sub}  \`\`\`\n  ### Step 2: Sample\n  - **Status:** ✅ checked 2026-01-01\n  \`\`\`\n`), STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(inside).steps.map((s) => s.state), ['todo', 'blocked'], 'the fenced sample is not a step and the real blocked step stays');
  const leaking = PLAN(STEP(1, 'not started', `${sub}  \`\`\`\n### Step 2: Sample\n- **Status:** ✅ checked 2026-01-01\n  \`\`\`\n`), STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(leaking), /a code fence inside a list item is not closed before the item ends/, 'content left of the parent item ends it: refused');
  const lazy = PLAN(STEP(1, 'not started', '- **Built:** a long line\nthat wraps lazily\n  ```\n  ### Step 9: Sample\n  ```\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(lazy).steps.map((s) => s.state), ['todo', 'blocked'], 'a lazy continuation line keeps the item open');
  const numbered = PLAN(STEP(1, 'not started', '1. first\n   - sub\n   ```\n   ### Step 9: Sample\n   ```\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(numbered).steps.map((s) => s.state), ['todo', 'blocked'], 'a numbered parent item');
  const subFence = PLAN(STEP(1, 'not started', `${sub}    \`\`\`\n  ### Step 9: Sample\n    \`\`\`\n`), STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(subFence), /not closed before the item ends/, 'a fence in a sub-item whose content falls back to the parent column ends the sub-item: refused');
  const lazyLeak = PLAN(STEP(1, 'not started', '- **Built:** a long line\nthat wraps lazily\n  \`\`\`\n'), STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(lazyLeak), /not closed before the item ends/, 'after a lazy line the fence is still in the item, so the real step at column 0 ends it: refused, never hidden');
});

// Review round 7 (0.8.0): F01 and F03 again.
test('F01 (round 7): a quoted lookalike of "→ not started" is not a settled wait', () => {
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-09: waited for the banner “ready → not started, because staging was down” → “check the confirmation line”, because the screen changed, because the owner asked.\n')),
    AR('  - تغيّر في 2026-01-09: من انتظار اللافتة «جاهز إلى لم تبدأ، لأن الخادم كان متوقفًا» إلى «افحص سطر التأكيد»، لأن الشاشة تغيّرت، لأن المالك طلب.\n'),
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'unclear', 'neutral, not status');
    assert.ok(!popupOf(html, 1).includes('class="ch"'), 'not filed under Your decisions as a status change');
    assert.ok(popupOf(html, 1).includes('class="chg unclear"'), 'shown as written under The plan');
  }
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: waited for “a → b” → "not started", because A, because B.\n')),
    AR('  - تغيّر في 2026-01-05: من انتظار «أ إلى ب» إلى «لم تبدأ»، لأن أ، لأن ب.\n'),
  ]) assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'status', 'a real settled wait with quotes inside and a doubled reason');
  assert.strictEqual(parse(PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: waited for the host → “not started, because A.\n'))).steps[0].changes[0].kind, 'unclear', 'a half-quoted target');
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: a → b → not started, because x.\n')),
    AR('  - تغيّر في 2026-01-05: من أ إلى ب إلى لم تبدأ، لأن س.\n'),
  ]) assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'unclear', 'ends in "not started" but is not a wait: neutral');
});

test('F03 (round 7): a bare list marker opens an item; fences inside HTML comments are not fences', () => {
  const bareLeak = PLAN(STEP(1, 'not started'), '-\n  ```\n### Step 2: Sample\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked 2026-01-01\n  ```\n', STEP(2, '⛔ waits for TBD: the host'));
  assert.throws(() => parse(bareLeak), /not closed before the item ends/, 'a fence under a bare "-" belongs to that item: content at column 0 is refused, never counted');
  const bareInside = PLAN(STEP(1, 'not started'), '-\n  ```\n  ### Step 9: Sample\n  ```\n', STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(bareInside).steps.map((s) => s.state), ['todo', 'blocked'], 'a fence closed inside the bare item');
  const comments = PLAN(STEP(1, 'not started'), '<!--\n```\n-->\n', STEP(2, '⛔ waits for TBD: the host'), '<!--\n```\n-->\n');
  assert.deepStrictEqual(parse(comments).steps.map((s) => s.state), ['todo', 'blocked'], 'backticks inside HTML comments do not hide the real step between them');
  const commented = PLAN(STEP(1, 'not started'), '<!--\n### Step 2: Hidden draft\n- **Status:** ✅ checked 2026-01-01\n-->\n');
  assert.strictEqual(parse(commented).steps.length, 1, 'a step inside an HTML comment is not shown');
  assert.throws(() => parse(PLAN(STEP(1, 'not started'), '<!--\n### Step 2: X\n')), /HTML comment or block is opened and never closed/);
  const block = PLAN(STEP(1, 'not started'), '<div>\n```\n</div>\n\n', STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(block).steps.map((s) => s.state), ['todo', 'blocked'], 'backticks inside an HTML block are not a fence');
  const underline = PLAN(STEP(1, 'not started'), 'A heading\n-\n```\nx\n```\n', STEP(2, '⛔ waits for TBD: the host'));
  // (Corrected in round 8: Pandoc reads a text line with "-" under it as a level-2 heading, which would end the steps.)
  assert.throws(() => parse(underline), /line \d+: a text line with === or --- under it/, 'a "-" under a text line makes that line a heading: refused');
});

// Review round 8 (0.8.0): the plan is read through its Markdown block structure (scripts/markdown-blocks.js,
// tested in tests/markdown-blocks.test.js), and a change entry is filed under the line it sits in.
test('F01 (round 8): the move of a settled wait is looked for before the reason, never inside it', () => {
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-11-19: waited for the banner → verify the confirmation line, because the unrelated demo resets pending → not started, because its setup is recreated.\n')),
    AR('  - تغيّر في 2026-11-19: من انتظار اللافتة إلى تحقق من سطر التأكيد، لأن العرض التجريبي يعيد الحالة من قيد العمل إلى لم تبدأ، لأن بياناته تعاد.\n'),
  ]) {
    const html = render(parse(plan));
    assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'unclear', 'an arrow to "not started" inside the reason does not make it a wait');
    assert.ok(!popupOf(html, 1).includes('class="ch"'), 'not filed under Your decisions as a status change');
    assert.ok(popupOf(html, 1).includes('class="chg unclear"') && !popupOf(html, 1).includes('class="old"'), 'shown as written; the check is not marked as replaced');
  }
  for (const plan of [
    PLAN(STEP(1, 'not started', '  - Changed 2026-11-19: waited for the host → "not started", because its state moved queued → ready, because the owner selected local hosting.\n')),
    AR('  - تغيّر في 2026-11-19: من انتظار المضيف إلى «لم تبدأ»، لأن حالته انتقلت من قيد الانتظار إلى جاهز، لأن المالك اختار الاستضافة المحلية.\n'),
  ]) assert.strictEqual(parse(plan).steps[0].changes[0].kind, 'status', 'a real settled wait whose reason holds an arrow');
});

// The same lookalike with its reason started any other way than the template's ", because " / «، لأن ». Where
// the reason starts is then not certain, so the entry is shown as written. Quotes distinguish a separator
// inside the name from the transition that settles the wait.
test('F01 (round 8): where the reason starts must be certain before a wait counts as settled', () => {
  const en = (body) => PLAN(STEP(1, 'not started', `  - Changed 2026-11-19: ${body}.\n`));
  const ar = (body) => AR(`  - تغيّر في 2026-11-19: ${body}.\n`);
  const kind = (plan) => parse(plan).steps[0].changes[0].kind;
  for (const [why, plan] of [
    ['no comma before "because"', en('waited for the banner → verify the confirmation line because the unrelated demo resets pending → not started')],
    ['no comma, then a second reason', en('waited for the banner → verify the confirmation line because the unrelated demo resets pending → not started, because its setup is recreated')],
    ['a capital "Because" after a full stop', en('waited for the banner → verify the confirmation line. Because the demo resets pending → not started')],
    ['a capital "Because" with no mark before it', en('waited for the banner → verify the line Because the demo resets pending → not started, because its setup is recreated')],
    ['two spaces before "because"', en('waited for the banner → verify the confirmation line,  because the demo resets pending → not started')],
    ['"since", and the entry ends', en('waited for the banner → verify the confirmation line, since the unrelated demo resets pending → not started')],
    ['"since", then a reason', en('waited for the banner → verify the confirmation line, since the unrelated demo resets pending → not started, because its setup is recreated')],
    ['a semicolon', en('waited for the banner → verify the confirmation line; the demo resets pending → not started')],
    ['a dash', en('waited for the banner → verify the confirmation line — the demo resets pending → not started')],
    ['two arrows and no reason at all', en('waited for the banner → verify the line as the demo resets pending → not started')],
    ['Arabic, no comma', ar('من انتظار اللافتة إلى تحقق من سطر التأكيد لأن العرض التجريبي يعيد الحالة من قيد العمل إلى لم تبدأ')],
    ['Arabic, a Latin comma', ar('من انتظار اللافتة إلى تحقق من سطر التأكيد, لأن العرض التجريبي يعيد الحالة من قيد العمل إلى لم تبدأ')],
    ['Arabic, another reason word', ar('من انتظار اللافتة إلى تحقق من سطر التأكيد، حيث إن العرض يعيد الحالة إلى لم تبدأ')],
    ['Arabic, another reason word, then a reason', ar('من انتظار اللافتة إلى تحقق من سطر التأكيد، حيث إن العرض يعيد الحالة إلى لم تبدأ، لأن بياناته تعاد')],
  ]) {
    assert.strictEqual(kind(plan), 'unclear', why);
    assert.ok(!popupOf(render(parse(plan)), 1).includes('class="ch"'), `${why}: not filed under Your decisions`);
  }
  for (const [why, plan] of [
    ['an arrow in the quoted wait name', en('waited for "the draft → sent status" → "not started", because the TRD settled it')],
    ['an arrow in the quoted name, two reasons', en('waited for “draft → sent status” → “not started”, because the TRD chose local hosting, because the client has no cloud account')],
    ['a comma in the name, one arrow', en('waited for the reply, in writing → not started, because it came')],
    ['one arrow and no reason', en('waited for the host → not started')],
    ['Arabic «إلى» in the quoted wait name', ar('من انتظار «الوصول إلى خدمة الاستضافة» إلى لم تبدأ، لأن TRD حسمها')],
    ['an Arabic word that only holds the letters of «لأن»', ar('من انتظار تحديث الأنظمة إلى لم تبدأ، لأن TRD حسمها')],
  ]) assert.strictEqual(kind(plan), 'status', why);
  assert.strictEqual(kind(en('the first page → the second page because it is new, because the owner asked')), 'unclear', 'a check change with a reason word before the marker is not split');
  assert.strictEqual(kind(en('the first page → the second page, because it is new. Because the owner asked')), 'check', 'a reason word inside the reason changes nothing');
});

test('F01 (round 8): a change counts as a change to the check only under the check; elsewhere it is shown as written, with the line it is under', () => {
  const plan = PLAN(STEP(1, 'not started', '- **Target:** early December\n  - Changed 2026-11-02: early December → mid December, because the client asked.\n'
    + '- **Built:** a page\n  - Changed 2026-11-03: a page → two pages, because one was not enough.\n- Changed 2026-11-04: loose → entry, because it sits under nothing.\n'));
  assert.deepStrictEqual(parse(plan).steps[0].changes.map((c) => [c.under, c.kind]), [['target', 'unclear'], ['built', 'unclear'], [null, 'unclear']]);
  const html = render(parse(plan));
  assert.ok(!cardOf(html, 1).includes('Check changed') && !popupOf(html, 1).includes('class="old"') && !popupOf(html, 1).includes('As first written'), 'the check is untouched');
  assert.ok(popupOf(html, 1).includes('Changed 2026-11-02 · Target · recorded as written') && popupOf(html, 1).includes('early December → mid December'));
  assert.ok(popupOf(html, 1).includes('Changed 2026-11-03 · Built · recorded as written') && popupOf(html, 1).includes('Changed 2026-11-04 · recorded as written'));
  const ar = render(parse(AR('').replace('- **الحالة:** لم تبدأ', '- **الموعد المستهدف:** ديسمبر\n  - تغيّر في 2026-11-02: من أول ديسمبر إلى منتصف ديسمبر، لأن العميل طلب.\n- **الحالة:** لم تبدأ')));
  assert.ok(popupOf(ar, 1).includes('الموعد المستهدف · كما كُتب') && !cardOf(ar, 1).includes('تغيّر الفحص'), 'the same in Arabic');
});

test('F01 (round 8): a change entry is never dropped: a malformed or foreign one is refused', () => {
  for (const [plan, reason] of [
    [PLAN(STEP(1, 'not started', '  - Changed 2026-1-5: a → b, because c.\n')), /Step 1: Step 1: a change entry must read "Changed YYYY-MM-DD:/],
    [PLAN(STEP(1, 'not started', '  - Changed 2026-02-30: a → b, because c.\n')), /Step 1: Step 1: 2026-02-30 is not a real date/],
    [PLAN(STEP(1, 'not started', '  - تغيّر في 2026-01-05: من أ إلى ب، لأن ج.\n')), /a change entry in the other language/],
    [AR('  - Changed 2026-01-05: a → b, because c.\n'), /a change entry in the other language/],
  ]) assert.throws(() => parse(plan), reason);
  assert.strictEqual(parse(PLAN(STEP(1, 'not started', '  - Changed my mind after the call.\n'))).steps[0].changes.length, 0, 'ordinary history that only begins with the word is left alone');
  assert.strictEqual(parse(PLAN(STEP(1, 'not started', '  - earlier run, 2026-01-01\n    - Changed 2026-01-05: a → b, because c.\n'))).steps[0].changes[0].kind, 'check', 'an entry inside a sub-item of the check is read');
  const wrapped = parse(PLAN(STEP(1, 'not started', '  - Changed 2026-01-05: a →\n    b, because c.\n'))).steps[0].changes[0];
  assert.deepStrictEqual([wrapped.old, wrapped.now, wrapped.why], ['a', 'b', 'c'], 'an entry written over two lines is read whole');
});

test('F01 (round 10): the CLI refuses recognizable change labels with non-ISO dates and names the step', (t) => {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'plan-page-date-'));
  t.after(() => fs.rmSync(tmp, { recursive: true }));
  const input = path.join(tmp, 'plan.md');
  const output = path.join(tmp, 'plan.html');
  const en = (line) => PLAN(STEP(1, 'not started', `  - ${line}\n`));
  const ar = (line) => AR(`  - ${line}\n`);
  for (const [plan, reason] of [
    [en('Changed tomorrow: a → b, because c.'), /Step 1: Step 1: a change entry must read "Changed YYYY-MM-DD:/],
    [ar('تغيّر في ٢٠٢٦-١١-١٩: من أ إلى ب، لأن ج.'), /الخطوة 1: أ: a change entry must read "تغيّر في YYYY-MM-DD:/],
    [en('Changed: a → b, because c.'), /Step 1: Step 1: a change entry must read/],
    [ar('تغيّر في غدًا: من أ إلى ب، لأن ج.'), /الخطوة 1: أ: a change entry must read/],
    [en('تغيّر في ٢٠٢٦-١١-١٩: من أ إلى ب، لأن ج.'), /Step 1: Step 1: a change entry in the other language/],
    [ar('Changed tomorrow: a → b, because c.'), /الخطوة 1: أ: a change entry in the other language/],
  ]) {
    fs.writeFileSync(input, plan);
    assert.throws(() => execFileSync(process.execPath, [SCRIPT, input, output], { stdio: 'pipe' }), reason);
    assert.ok(!fs.existsSync(output), 'the refused plan writes no page');
  }
});

test('F01 (round 11): the CLI names the step when a change label varies in case, emphasis, or shadda', (t) => {
  const tmp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'plan-page-label-'));
  t.after(() => fs.rmSync(tmp, { recursive: true }));
  const input = path.join(tmp, 'plan.md');
  const output = path.join(tmp, 'plan.html');
  const en = (line) => PLAN(STEP(1, 'not started', `  - ${line}\n`));
  const ar = (line) => AR(`  - ${line}\n`);
  const enEntry = (label) => `${label} 2026-11-19: alpha → beta, because c.`;
  const arEntry = (label) => `${label} 2026-11-19: من أ إلى ب، لأن ج.`;
  const enLabels = ['changed', 'CHANGED', 'ChAnGeD', '**Changed**', '*changed*', '_Changed_', '__CHANGED__', '***Changed***', '**_Changed_**'];
  const arLabels = ['تغير في', '**تغيّر في**', '_تغير في_', '__تغيّر في__', '*تغيّر في*'];
  const cases = [
    ...enLabels.map((label) => [en, enEntry(label), /Step 1: Step 1: a change entry must read "Changed YYYY-MM-DD:/]),
    ...arLabels.map((label) => [ar, arEntry(label), /الخطوة 1: أ: a change entry must read "تغيّر في YYYY-MM-DD:/]),
    [ar, enEntry('__CHANGED__'), /الخطوة 1: أ: a change entry in the other language/],
    [en, arEntry('**تغير في**'), /Step 1: Step 1: a change entry in the other language/],
  ];
  for (const [plan, line, message] of cases) {
    fs.writeFileSync(input, plan(line));
    assert.throws(() => execFileSync(process.execPath, [SCRIPT, input, output], { stdio: 'pipe' }), message, line);
    assert.ok(!fs.existsSync(output), `the refused plan writes no page: ${line}`);
  }

  for (const [plan, line] of [
    [en, 'Changed my mind after the call.'],
    [en, 'changed my mind after the call.'],
    [en, '**Changed** my mind after the call.'],
    [ar, '_تغير في_ ترتيب العمل بعد الاتصال.'],
  ]) assert.deepStrictEqual(parse(plan(line)).steps[0].changes, [], line);
  assert.strictEqual(parse(en(enEntry('Changed'))).steps[0].changes[0].kind, 'check');
  assert.strictEqual(parse(ar(arEntry('تغيّر في'))).steps[0].changes[0].kind, 'check');
});

test('F01 (round 10): even a clear settled wait is status history only under the check', () => {
  const en = 'Changed 2026-11-19: waited for the target date → not started, because the review reopened.';
  const ar = 'تغيّر في 2026-11-19: من انتظار الموعد إلى لم تبدأ، لأن المراجعة أُعيدت.';
  for (const [plan, under, label] of [
    [PLAN(STEP(1, 'not started', `  - ${en}\n`)), 'check', '2026-11-19 · status changed'],
    [AR(`  - ${ar}\n`), 'check', '2026-11-19 · تغيّرت الحالة'],
    [PLAN(STEP(1, 'not started', `- **Target:** pending\n  - ${en}\n`)), 'target', 'Changed 2026-11-19 · Target · recorded as written'],
    [PLAN(STEP(1, `not started\n  - ${en}`)), 'status', 'Changed 2026-11-19 · Status · recorded as written'],
    [PLAN(STEP(1, 'not started', `- ${en}\n`)), null, 'Changed 2026-11-19 · recorded as written'],
    [AR(`- **الموعد المستهدف:** ديسمبر\n  - ${ar}\n`), 'target', 'تغيّرت في 2026-11-19 · الموعد المستهدف · كما كُتب'],
  ]) {
    const result = parse(plan);
    const [entry] = result.steps[0].changes;
    const inCheck = under === 'check';
    assert.deepStrictEqual([entry.under, entry.kind], [under, inCheck ? 'status' : 'unclear'], label);
    const html = render(result);
    const popup = popupOf(html, 1);
    assert.ok(popup.includes(`<time>${label}</time>`), label);
    assert.strictEqual(popup.includes('class="ch"'), inCheck);
    assert.strictEqual(popup.includes('class="chg unclear"'), !inCheck);
    assert.doesNotMatch(cardOf(html, 1), /Check changed|تغيّر الفحص/);
  }
});

test('F01 (round 10): multiple unquoted transition separators leave a settled wait ambiguous', () => {
  const en = (body) => PLAN(STEP(1, 'not started', `  - Changed 2026-11-19: ${body}.\n`));
  const ar = (body) => AR(`  - تغيّر في 2026-11-19: ${body}.\n`);
  for (const [ambiguous, quoted] of [
    [en('waited for A → B since C → not started, because D'), en('waited for “A → B since C” → not started, because D')],
    [en('waited for the draft → sent status → "not started", because the TRD settled it'), en('waited for "the draft → sent status" → "not started", because the TRD settled it')],
    [en('waited for draft → sent status → “not started”, because the TRD chose local hosting, because the client has no cloud account'),
      en('waited for “draft → sent status” → “not started”, because the TRD chose local hosting, because the client has no cloud account')],
    [ar('من انتظار الوصول إلى خدمة الاستضافة إلى لم تبدأ، لأن TRD حسمها'), ar('من انتظار «الوصول إلى خدمة الاستضافة» إلى لم تبدأ، لأن TRD حسمها')],
  ]) {
    const result = parse(ambiguous);
    assert.strictEqual(result.steps[0].changes[0].kind, 'unclear', ambiguous);
    assert.match(popupOf(render(result), 1), /class="chg unclear"/);
    assert.strictEqual(parse(quoted).steps[0].changes[0].kind, 'status', quoted);
  }
});

test('F03 (round 8): inline HTML is text and an HTML block is not content, exactly as Markdown has them', () => {
  const span = PLAN(STEP(1, '✅ checked 2026-11-19'), `<span>Pending items are listed below.</span>\n${STEP(2, '⛔ waits for TBD: hosting')}`);
  assert.deepStrictEqual(parse(span).steps.map((s) => s.state), ['done', 'blocked'], 'a <span> with words in it is a sentence: the real step under it stays');
  const div = PLAN(STEP(1, '✅ checked 2026-11-19').trimEnd(), '<div>', STEP(2, '✅ checked 2026-11-19').trimEnd(), '</div>\n');
  assert.deepStrictEqual(parse(div).steps.map((s) => s.n), [1], 'a <div> right under a text line starts a block: the example in it is not a step');
  for (const gap of ['', '\n']) {
    const inItem = PLAN(STEP(1, 'not started', `- **Built:** Review notes.\n${gap}  <div>\n  \`\`\`\n  ### Step 2: Example only\n  </div>\n\n`), STEP(2, '⛔ waits for TBD: hosting'));
    assert.deepStrictEqual(parse(inItem).steps.map((s) => s.state), ['todo', 'blocked'], 'a <div> block inside a list item, with or without an empty line before it');
  }
  const loneAfterGap = PLAN(STEP(1, '✅ checked 2026-11-19'), `<span>\n${STEP(2, '✅ checked 2026-11-19')}`, STEP(2, '⛔ waits for TBD: hosting'));
  assert.deepStrictEqual(parse(loneAfterGap).steps.map((s) => s.state), ['done', 'blocked'], 'a tag alone on its line after an empty line is a block, to the next empty line');
  const loneUnderText = PLAN(STEP(1, '✅ checked 2026-11-19').trimEnd(), '<span>', STEP(2, '⛔ waits for TBD: hosting'));
  assert.throws(() => parse(loneUnderText), /line \d+: an HTML tag alone on the line after quoted or list text/, 'the same tag right under list text is read both ways by tools: refused');
});

test('F03 (round 8): steps and fields are what Markdown says they are', () => {
  const indented = PLAN(STEP(1, 'not started'), ' ### Step 2: Indented\n - **Covers:** M1\n - **How we know it works:** x.\n - **Status:** ⛔ waits for TBD: the host\n');
  assert.deepStrictEqual(parse(indented).steps.map((s) => s.state), ['todo', 'blocked'], 'a heading and fields indented one space are still a heading and fields');
  assert.throws(() => parse(PLAN(STEP(1, 'not started', '* **Status:** ✅ checked 2026-01-02\n'))), /Step 1: Step 1: more than one Status line/, 'a field written with * is a field too');
  const wrapped = parse(PLAN('### Step 1: A\n- **Covers:** M1\n- **How we know it works:** open the page\n  and count three rows,\nthen close it.\n- **Status:** not started\n'));
  assert.strictEqual(wrapped.steps[0].check, 'open the page and count three rows, then close it.', 'a field that runs over lines is read whole');
  assert.throws(() => parse(PLAN('### Step 1: A\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:** ✅ checked\n  2026-01-02\n')), /Step 1: A: the Status must be on one line/);
  assert.throws(() => parse(PLAN('### Step 1: A\n- **Covers:** M1\n- **How we know it works:** x.\n- **Status:**not started\n')), /Step 1: A: no Status line/, 'the label needs a space after it, as bold text does');
  const h1 = PLAN(STEP(1, 'not started'), `# Notes\n\n${STEP(2, '✅ checked 2026-01-02')}`);
  assert.deepStrictEqual(parse(h1).steps.map((s) => s.n), [1], 'a level-1 heading ends the steps, like a level-2 heading');
  const h4 = parse(PLAN('### Step 1: A\n- **Covers:** M1\n#### Details\n- **How we know it works:** x.\n- **Status:** not started\n'));
  assert.deepStrictEqual([h4.steps.length, h4.steps[0].check], [1, 'x.'], 'a smaller heading inside a step does not end it');
  assert.throws(() => parse(PLAN(STEP(1, 'not started'), 'Notes\n-----\n', STEP(2, '⛔ waits for TBD: the host'))), /line \d+: a text line with === or --- under it/, 'an underlined heading would end the steps: refused');
  assert.throws(() => parse(PLAN(STEP(1, 'not started'), '## Steps\n', STEP(1, 'not started'))), /the plan needs exactly one "## Steps" section/, 'a second Steps section');
  const quoted = PLAN(STEP(1, 'not started', '> - **Status:** ✅ checked 2026-01-02\n'));
  assert.deepStrictEqual(parse(quoted).steps.map((s) => s.state), ['todo'], 'a quoted field is a quotation, not a field');
});

test('F03 (round 8): line ends and letter forms', () => {
  const lf = PLAN(STEP(1, 'not started'), STEP(2, '⛔ waits for TBD: the host'));
  assert.deepStrictEqual(parse(lf.replace(/\n/g, '\r\n')), parse(lf), 'CRLF line ends read the same');
  assert.throws(() => parse(lf.replace(/\n/g, '\r')), /line 1: a line that ends with a bare carriage return/);
  const ar = AR('  - تغيّر في 2026-01-05: من انتظار المضيف إلى لم تبدأ، لأن TRD حسمه.\n');
  assert.notStrictEqual(ar.normalize('NFD'), ar, 'the Arabic plan has letters that can be written two ways');
  assert.deepStrictEqual(parse(ar.normalize('NFD')), parse(ar), 'both ways read the same');
});

// Every combination of an old wording, a new wording and a reason, in both languages. What each entry is, is
// known from how it was put together, not from reading it back:
// - a settled wait (status history): one separator before the reason, from the wait to exactly "not started".
//   A separator inside the wait's name must be quoted;
// - a change to the check: one clear "→" and one clear "because" at the top level of the sentence (words
//   inside quotes, brackets or code marks are not at the top level);
// - anything else: unclear, shown as written. That includes every entry with a part where it cannot be
//   certain what is quoted: an arrow inside single quotes or stars, an HTML tag, a mark without its pair.
test('F01: change entries built from parts are each filed as what they were built to be', () => {
  // old: [text, is a wait, arrows at the top level, reason marks at the top level, not certain]
  // new: [text, is exactly "not started", arrows at the top level]      reason: [text, reason marks at the top level, not certain]
  const parts = {
    en: {
      line: (body) => PLAN(STEP(1, 'not started', `  - Changed 2026-11-19: ${body}.\n`)), from: '', to: ' → ',
      olds: [['the first page', false, 0, 0], ['waited for the host', true, 0, 0], ['“waited for the host”', true, 0, 0], ['waited for a → b handover', true, 1, 0],
        ['waited for the banner → verify the line, since the demo resets pending', true, 1, 0, true],
        ['waited for “a → b”', true, 0, 0], ['waited for the banner “ready → not started, because staging was down”', true, 0, 0], ['show a → b', false, 1, 0],
        ['waited for the fix, because of the outage', true, 0, 1],
        ['waited for the banner (ready → not started, because staging was down)', true, 0, 0], ['waited for the banner `ready → not started, because staging was down`', true, 0, 0],
        ['waited for the owner’s reply', true, 0, 0], ['waited for ‘Phase 2’ sign-off', true, 0, 0], ['the users\' list', false, 0, 0],
        ['waited for the banner ‘ready → not started, because staging was down’', true, 0, 0, true], ['waited for the banner *ready → not started* now', true, 0, 0, true],
        ['waited for the banner <b>ready → not started</b>', true, 0, 0, true], ['waited for the banner „ready“', true, 0, 0, true], ['waited for the banner (ready', true, 0, 0, true],
        ['waited for the banner 「ready → not started, because staging was down」', true, 0, 0, true]],
      news: [['not started', true, 0], ['"not started"', true, 0], ['“not started”', true, 0], ['not started yet', false, 0], ['the second page', false, 0],
        ['“check the line → not started”', false, 0], ['c → d', false, 1],
        ['‘not started’', true, 0], ['\'not started\'', true, 0], ['`not started`', true, 0], ['(not started)', false, 0], ['the page (a → b)', false, 0]],
      reasons: [[', because the owner asked', 1], [', because the screen changed, because the owner asked', 2], [', because the demo resets pending → not started', 1],
        [', because the note says “retry, because data changed”', 1], [', because its state moved queued → ready, because it was chosen', 2], ['', 0],
        [', because the owner’s note says so', 1], [', because the log (a → b, because c) shows it', 1],
        [', because the client asked (see the note', 1, true], [', because the client said “soon', 1, true],
        [' because the demo resets pending → not started', 0, true], [', Because the owner asked', 0, true], [' because it is new, because the owner asked', 1, true]],
    },
    ar: {
      line: (body) => AR(`  - تغيّر في 2026-11-19: ${body}.\n`), from: 'من ', to: ' إلى ',
      olds: [['الصفحة الأولى', false, 0, 0], ['انتظار المضيف', true, 0, 0], ['«انتظار المضيف»', true, 0, 0], ['انتظار الانتقال إلى الخادم', true, 1, 0],
        ['انتظار «الوصول إلى الخادم»', true, 0, 0], ['انتظار اللافتة «جاهز إلى لم تبدأ، لأن الخادم كان متوقفًا»', true, 0, 0], ['عرض أ إلى ب', false, 1, 0],
        ['انتظار الإصلاح، لأن الخدمة متوقفة', true, 0, 1],
        ['انتظار اللافتة (جاهز إلى لم تبدأ، لأن الخادم متوقف)', true, 0, 0],
        ['انتظار اللافتة ‘جاهز إلى لم تبدأ’', true, 0, 0, true], ['انتظار اللافتة <b>جاهز</b>', true, 0, 0, true],
        ['انتظار اللافتة إلى تحقق من السطر، حيث إن العرض يعيد الحالة', true, 1, 0, true]],
      news: [['لم تبدأ', true, 0], ['«لم تبدأ»', true, 0], ['"لم تبدأ"', true, 0], ['لم تبدأ بعد', false, 0], ['الصفحة الثانية', false, 0],
        ['«افحص السطر إلى لم تبدأ»', false, 0], ['ج إلى د', false, 1], ['‘لم تبدأ’', true, 0], ['`لم تبدأ`', true, 0]],
      reasons: [['، لأن المالك طلب', 1], ['، لأن الشاشة تغيّرت، لأن المالك طلب', 2], ['، لأن العرض يعيد الحالة إلى لم تبدأ', 1],
        ['، لأن الملاحظة تقول «أعد المحاولة، لأن البيانات تغيّرت»', 1], ['، لأن حالته انتقلت من الانتظار إلى جاهز، لأن المالك اختاره', 2], ['', 0],
        ['، لأن السجل (أ إلى ب، لأن ج) يبيّن ذلك', 1], ['، لأن العميل طلب (انظر الملاحظة', 1, true],
        [' لأن العرض يعيد الحالة إلى لم تبدأ', 0, true], [', لأن المالك طلب', 0, true]],
    },
  };
  let count = 0;
  const kinds = { status: 0, check: 0, unclear: 0 };
  for (const [lang, p] of Object.entries(parts)) {
    for (const [old, isWait, oldArrows, oldReasons, notCertain] of p.olds) for (const [now, isTodo, newArrows] of p.news) for (const [reason, marks, reasonNotCertain] of p.reasons) {
      const body = `${p.from}${old}${p.to}${now}${reason}`;
      const expected = notCertain || reasonNotCertain ? 'unclear'
        : isWait && isTodo && !oldReasons && !oldArrows ? 'status'
          : marks + oldReasons === 1 && !oldArrows && !newArrows && !oldReasons ? 'check' : 'unclear';
      const change = parse(p.line(body)).steps[0].changes[0];
      assert.strictEqual(change.kind, expected, `(${lang}) ${body}`);
      if (expected === 'check') assert.deepStrictEqual([change.old, change.now], [old, now], `(${lang}) ${body}`);
      else if (expected === 'unclear') assert.ok(change.raw !== undefined && change.old === undefined, `(${lang}) kept whole, never split: ${body}`);
      kinds[expected] += 1;
      count += 1;
    }
  }
  assert.strictEqual(count, 20 * 12 * 13 + 12 * 9 * 10, 'every combination was tried');
  assert.ok(kinds.status > 300 && kinds.check > 300 && kinds.unclear > 300, `each kind is well covered: ${JSON.stringify(kinds)}`);
});
