// Every example document must follow its reference file's template (English, or its "In Arabic" one):
// the same title, a valid stamp on the second line, and the same headings in the same order.
// Then each example project must agree with itself, the way the skill promises, in both languages.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const EXAMPLES = path.join(SKILL, 'examples');

// The fixed words of each language, exactly as the reference files give them.
const LANGS = {
  en: {
    templateHeading: 'The document',
    stamp: /^> v[1-9]\d* · (Draft|Approved \d{4}-\d{2}-\d{2}( by \S.*)?)$/,
    approvedBy: / · Approved \d{4}-\d{2}-\d{2} by \S/,
    changed: /^ {2}- Changed \d{4}-\d{2}-\d{2}: .+ → .+, because .+\.$/,
    changedWord: 'Changed ',
    tbd: /^- TBD: .+\. Decided when .+\.$/,
    change: /^ {2}- Changed \d{4}-\d{2}-\d{2}: (.+?) → (.+?), because .+\.$/,
    tbdName: /^- TBD: (.+?)\. Decided when /,
    tbdToken: 'TBD',
    choiceEnd: ', because',
    tbdWord: 'TBD',
    colorRows: { Background: 'background', Card: 'surface', Text: 'text', 'Quiet text': 'muted', 'Main color': 'primary', 'On main': 'onPrimary', Lines: 'border', Error: 'danger' },
    fontRows: { Headings: 'heading', Text: 'body', Arabic: 'arabic' },
    fontsHeading: 'Fonts',
    marks: ['🔒 personal', '🔐 secret', '–'],
    waits: "Waits: the TRD's data storage is still TBD.",
    s: {
      must: 'What it must do', work: 'Work rules', storage: 'Data storage', brain: 'Brain', colors: 'Colors',
      ready: 'Ready values', sheets: 'Sheets', readyBlock: 'Ready block', personal: 'Personal data', steps: 'Steps',
    },
    who: 'Who can see it', howLong: "How long it's kept",
    stepTitle: /^Step \d+: \S/, covers: 'Covers', how: 'How we know it works',
    stepName: /^Step \d+: (.+)$/,
    decides: 'Who decides',
    check: /^ {2}- Check: \S/,
    decidesLabels: ['Owner', 'Approves the scope', 'Approves the prototype', 'Accepts it (UAT)', 'Others to involve'],
    alone: /^- \*\*Owner\*\*: .+, alone\.$/,
    delivery: ['Prototype', 'Functional test', 'Security test', 'Acceptance test (UAT)', 'Guides and training', 'Install', 'Live test', 'Go-live', 'Handover'],
    statusLine: /^- \*\*Status:\*\* (not started|⛔ waits for TBD: .+|◐ waiting for your check \(ran: .+, \d{4}-\d{2}-\d{2}\)|✅ checked \d{4}-\d{2}-\d{2})$/m,
    waitingFor: /⛔ waits for TBD: (.+)$/m,
    noBrain: /^- None/m,
  },
  ar: {
    templateHeading: 'In Arabic',
    stamp: /^> الإصدار [1-9]\d* · (مسودة|معتمد \d{4}-\d{2}-\d{2}( من \S.*)?)$/,
    approvedBy: / · معتمد \d{4}-\d{2}-\d{2} من \S/,
    changed: /^ {2}- تغيّر في \d{4}-\d{2}-\d{2}: من .+ إلى .+، لأن .+\.$/,
    changedWord: 'تغيّر في',
    tbd: /^- لم يُحسم بعد: .+\. يُحسم عندما .+\.$/,
    change: /^ {2}- تغيّر في \d{4}-\d{2}-\d{2}: من (.+?) إلى (.+?)، لأن .+\.$/,
    tbdName: /^- لم يُحسم بعد: (.+?)\. يُحسم عندما /,
    tbdToken: 'لم يُحسم بعد',
    choiceEnd: '، لأن',
    tbdWord: 'لم يُحسم بعد',
    colorRows: { 'الخلفية': 'background', 'البطاقة': 'surface', 'النص': 'text', 'النص الهادئ': 'muted', 'اللون الرئيسي': 'primary', 'على الرئيسي': 'onPrimary', 'الحدود': 'border', 'الخطأ': 'danger' },
    fontRows: { 'العناوين': 'heading', 'النص': 'body' },
    fontsHeading: 'الخطوط',
    marks: ['🔒 شخصي', '🔐 سري', '–'],
    waits: 'ينتظر: تخزين البيانات في TRD لم يُحسم بعد.',
    s: {
      must: 'ما يجب أن يفعله', work: 'قواعد العمل', storage: 'تخزين البيانات', brain: 'الخادم', colors: 'الألوان',
      ready: 'القيم الجاهزة', sheets: 'الجداول', readyBlock: 'الكود الجاهز', personal: 'البيانات الشخصية', steps: 'الخطوات',
    },
    who: 'من يستطيع رؤيته', howLong: 'مدة الاحتفاظ به',
    stepTitle: /^الخطوة \d+: \S/, covers: 'تغطي', how: 'كيف نعرف أنها تعمل',
    stepName: /^الخطوة \d+: (.+)$/,
    decides: 'من يقرر',
    check: /^ {2}- الفحص: \S/,
    decidesLabels: ['المالك', 'يعتمد النطاق', 'يعتمد النموذج الأولي', 'يقبله (اختبار القبول UAT)', 'جهات أخرى'],
    alone: /^- \*\*المالك\*\*: .+، وحده\.$/,
    delivery: ['النموذج الأولي', 'الاختبار الوظيفي', 'الاختبار الأمني', 'اختبار القبول (UAT)', 'الأدلة والتدريب', 'التثبيت', 'اختبار التشغيل', 'الإطلاق', 'التسليم'],
    statusLine: /^- \*\*الحالة:\*\* (لم تبدأ|⛔ تنتظر ما لم يُحسم: .+|◐ بانتظار فحصك \(نُفّذ: .+، \d{4}-\d{2}-\d{2}\)|✅ فُحصت \d{4}-\d{2}-\d{2})$/m,
    waitingFor: /⛔ تنتظر ما لم يُحسم: (.+)$/m,
    noBrain: /^- لا شيء/m,
  },
};

// reference file → the examples written from it, per language
const DOCUMENTS = [
  { reference: 'prd.md', en: ['cedar-clinic/docs/prd.md', 'study-timer/docs/prd.md'], ar: ['cedar-clinic-ar/docs/prd.md'] },
  { reference: 'trd.md', en: ['cedar-clinic/docs/trd.md', 'study-timer/docs/trd.md'], ar: ['cedar-clinic-ar/docs/trd.md'] },
  { reference: 'design.md', en: ['cedar-clinic/DESIGN.md'], ar: ['cedar-clinic-ar/DESIGN.md'] },
  { reference: 'data.md', en: ['cedar-clinic/docs/data.md'], ar: ['cedar-clinic-ar/docs/data.md'] },
  { reference: 'security.md', en: ['cedar-clinic/docs/security.md', 'study-timer/docs/security.md'], ar: ['cedar-clinic-ar/docs/security.md'] },
  { reference: 'handover.md', en: ['cedar-clinic/docs/handover.md'], ar: ['cedar-clinic-ar/docs/handover.md'] },
  { reference: 'plan.md', en: ['cedar-clinic/docs/plan.md', 'study-timer/docs/plan.md'], ar: ['cedar-clinic-ar/docs/plan.md'] },
];

// Each example project, checked as a whole. A "showcase" project must show every feature (a TBD, a blocked
// step, personal data); the small one only has to be right.
const PROJECTS = [
  { folder: 'cedar-clinic', lang: 'en', showcase: true, staffProviderIdentity: true, network: true, audit: true },
  { folder: 'cedar-clinic-ar', lang: 'ar', showcase: true, staffProviderIdentity: true, network: true, audit: true },
  { folder: 'study-timer', lang: 'en', showcase: false },
];

// Git's default Windows checkout uses CRLF. Markdown has the same meaning with either line ending.
const readMarkdown = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const read = (example) => readMarkdown(path.join(EXAMPLES, example));
const exists = (example) => fs.existsSync(path.join(EXAMPLES, example));
const section = (text, heading) => (text.split(`\n## ${heading}\n`)[1] || '').split('\n## ')[0];
const headings = (lines) => lines.filter((l) => l.startsWith('## ')).map((l) => l.trim());

// The ready values' names, and the colour role each one must hold.
const READY_COLORS = {
  '--color-background': 'background', '--color-card': 'surface', '--color-text': 'text', '--color-quiet': 'muted',
  '--color-main': 'primary', '--color-on-main': 'onPrimary', '--color-lines': 'border', '--color-error': 'danger',
};

// Every place DESIGN.md disagrees with the picked look, role by role (an empty list means it agrees).
function designProblems(design, picked, L) {
  const problems = [];
  const rows = (heading) => section(design, heading).split('\n').filter((l) => /^\| [^-]/.test(l)).slice(1)
    .map((l) => l.split('|').map((c) => c.trim()));
  const seen = new Set();
  for (const [, name, value] of rows(L.s.colors)) {
    const role = L.colorRows[name];
    if (!role) { problems.push(`colour row "${name}" is not one of the 8 roles`); continue; }
    seen.add(role);
    if (value !== picked.colors[role].toUpperCase()) problems.push(`colour row "${name}" is ${value}, the look has ${picked.colors[role]}`);
  }
  for (const role of Object.values(L.colorRows)) if (!seen.has(role)) problems.push(`no colour row for ${role}`);
  // A font cell is the exact family, optionally followed by a note after a comma ("Lora, bold").
  const wantFont = { heading: picked.fonts.heading, body: picked.fonts.body, arabic: 'Noto Naskh Arabic' };
  const seenFonts = new Set();
  for (const [, use, font] of rows(L.fontsHeading)) {
    const role = L.fontRows[use];
    if (!role) { problems.push(`font row "${use}" is not a known role`); continue; }
    seenFonts.add(role);
    const family = font.split(/[,،]/)[0].trim();
    if (family !== wantFont[role]) problems.push(`font row "${use}" is ${family}, the look has ${wantFont[role]}`);
  }
  for (const role of ['heading', 'body']) if (!seenFonts.has(role)) problems.push(`no font row for ${role}`);
  const ready = Object.fromEntries([...section(design, L.s.ready).matchAll(/^\s+(--[a-z0-9-]+):\s*(.+?);/gm)].map((m) => [m[1], m[2]]));
  for (const [name, role] of Object.entries(READY_COLORS)) {
    if ((ready[name] || '').toUpperCase() !== picked.colors[role].toUpperCase()) problems.push(`${name} is ${ready[name]}, the look has ${picked.colors[role]}`);
  }
  const firstFamily = (value) => ((value || '').match(/^"([^"]+)"/) || [])[1];
  if (firstFamily(ready['--font-heading']) !== picked.fonts.heading) problems.push(`--font-heading is ${ready['--font-heading']}`);
  if (firstFamily(ready['--font-text']) !== picked.fonts.body) problems.push(`--font-text is ${ready['--font-text']}`);
  if (ready['--font-arabic'] !== undefined && firstFamily(ready['--font-arabic']) !== 'Noto Naskh Arabic') problems.push(`--font-arabic is ${ready['--font-arabic']}`);
  if (ready['--radius'] !== `${picked.radius}px`) problems.push(`--radius is ${ready['--radius']}`);
  return problems;
}

// The choices still open in a document, read through their whole history: an item is open when its
// latest value is TBD (a TBD line never settled, or settled and then reopened, or a choice changed back to
// TBD). Its name is what the TBD line says is open, never the "Decided when" condition.
function openTbds(text, L) {
  // Superseded choices stay readable, but only the current named record can block future work.
  const lines = text.replace(/<details data-project-docs-history>[\s\S]*?<\/details>/g, '').split('\n');
  const open = [];
  lines.forEach((line, i) => {
    if (!line.startsWith('- ')) return;
    const named = line.match(L.tbdName);
    let isOpen = Boolean(named);
    for (let j = i + 1; j < lines.length && lines[j].startsWith('  - '); j++) {
      const change = lines[j].match(L.change);
      if (change) isOpen = change[2].trim() === L.tbdToken;
    }
    if (isOpen) open.push({ name: named ? named[1] : line.slice(2).split(L.choiceEnd)[0], line });
  });
  return open;
}

// Every ⛔ status whose label is not, word for word, the name of an open choice in the source documents
// (the words between "TBD:" and ". Decided when"). A shortened name, a piece of a word, or a condition is
// refused: only the exact name says which choice the step waits for.
function waitingProblems(planText, sources, L) {
  const open = sources.flatMap((text) => openTbds(text, L)).map((t) => t.name);
  return [...planText.matchAll(new RegExp(L.waitingFor.source, 'gm'))]
    .map((m) => m[1]).filter((what) => !open.includes(what))
    .map((what) => `"${what}" is not the exact name of an open TBD`);
}

// Data's ready block must wait exactly while the TRD's data storage is open.
function readyBlockProblems(storage, ready, L) {
  const open = openTbds(storage, L).length > 0;
  if (open) return ready.trim() === L.waits ? [] : ['the ready block must wait while the data storage is TBD'];
  return /^```\w+\n[\s\S]+\n```/m.test(ready) ? [] : ['the data storage is chosen, so the ready block must hold the tables'];
}

// The clinic's approved sign-in rule uses Microsoft's stable account ID, never email.
// Check both the readable model and its executable schema, not just a word in Security.
function staffIdentityProblems(data, L) {
  const problems = [];
  const staff = section(data, L.s.sheets).split('\n### ').slice(1)
    .find((sheet) => /\(staff\)$/.test(sheet.split('\n')[0]));
  const row = (staff || '').split('\n').find((line) => /^\| microsoft_account_id \|/.test(line));
  if (!row) problems.push('the staff model has no Microsoft account ID');
  else if (row.split('|')[4].trim() !== L.marks[0]) problems.push('the Microsoft account ID must be marked personal');
  const sql = section(data, L.s.readyBlock).match(/CREATE TABLE staff\s*\(([\s\S]*?)\);/i);
  const column = sql && sql[1].match(/^\s*microsoft_account_id\s+text\b([^\n]*)/im);
  if (!column || !/\bNOT NULL\b/i.test(column[1]) || !/\bUNIQUE\b/i.test(column[1])) {
    problems.push('the staff schema needs a required, unique Microsoft account ID');
  }
  return problems;
}

// "Who decides" is either the five fixed lines in order, or one "Owner …, alone." line.
// Says whether the project is built for its owner alone, and any problem.
function decidesProblems(prd, L) {
  const lines = section(prd, L.decides).split('\n').filter((l) => l.startsWith('- '));
  if (lines.length === 1 && L.alone.test(lines[0])) return { alone: true, problems: [] };
  const labels = lines.map((l) => (l.match(/^- \*\*(.+?)\*\*: \S/) || [])[1]);
  const ok = JSON.stringify(labels) === JSON.stringify(L.decidesLabels);
  return { alone: false, problems: ok ? [] : [`"${L.decides}" must be the five fixed lines or one "alone" line, found ${JSON.stringify(labels)}`] };
}

// The fixed delivery steps: none when the owner builds it alone; otherwise all of them in order, the building
// steps first, the Prototype at step 1 or 2 only when there are screens, and Handover last.
function deliveryProblems(plan, { alone, screens }, L) {
  const names = section(plan, L.s.steps).split('\n### ').slice(1)
    .map((s) => (s.split('\n')[0].match(L.stepName) || [])[1] || '');
  const found = names.map((name) => L.delivery.find((d) => name === d || name.startsWith(`${d}: `)));
  const problems = [];
  if (alone) {
    if (found.some(Boolean)) problems.push('a project its owner builds alone has no delivery steps');
    return problems;
  }
  const [prototype, ...closing] = L.delivery;
  // Right after step 1, or step 1 itself when step 1 would wait for the database.
  if (screens) { if (found[0] !== prototype && found[1] !== prototype) problems.push(`step 1 or 2 must be "${prototype}"`); }
  else if (found.includes(prototype)) problems.push(`no screens, so no "${prototype}" step`);
  if (JSON.stringify(found.slice(-closing.length)) !== JSON.stringify(closing)) problems.push(`the last steps must be ${closing.join(', ')}, in order`);
  if (found.filter(Boolean).length !== closing.length + (screens ? 1 : 0)) problems.push('each delivery step appears once');
  return problems;
}

function template(referenceFile, heading) {
  const text = readMarkdown(path.join(SKILL, 'references', referenceFile));
  const after = text.split(new RegExp(`^## ${heading}$`, 'm'))[1];
  assert.ok(after, `${referenceFile}: no "## ${heading}" section`);
  // The template sits in a ```markdown block, or a ````markdown block when it holds a code block itself.
  const block = after.match(/(`{3,})markdown\n([\s\S]*?)\n\1(?=\n|$)/);
  assert.ok(block, `${referenceFile}: no markdown template block under "## ${heading}"`);
  return block[2].split('\n');
}

for (const [lang, L] of Object.entries(LANGS)) {
  for (const doc of DOCUMENTS) {
    for (const example of doc[lang]) {
      test(`${example} follows references/${doc.reference} (${lang})`, () => {
        const shape = template(doc.reference, L.templateHeading);
        const lines = read(example).split('\n');
        const titlePrefix = shape[0].split('<')[0];
        assert.ok(lines[0].startsWith(titlePrefix), `title must start with "${titlePrefix}"`);
        assert.match(shape[1], L.stamp, 'the template itself must show a valid stamp');
        assert.match(lines[1], L.stamp, 'line 2 must be the stamp');
        assert.deepStrictEqual(headings(lines), headings(shape));
      });
    }
  }
}

for (const { folder, lang, showcase, staffProviderIdentity, network = false, audit = false } of PROJECTS) {
  const L = LANGS[lang];
  const doc = (name) => read(`${folder}/${name}`);
  const has = (name) => exists(`${folder}/${name}`);
  const steps = () => section(doc('docs/plan.md'), L.s.steps).split('\n### ').slice(1);
  const allLines = () => ['docs/prd.md', 'docs/trd.md', 'DESIGN.md', 'docs/data.md', 'docs/security.md', 'docs/handover.md', 'docs/plan.md']
    .filter(has).flatMap((name) => doc(name).split('\n'));
  const field = (label) => new RegExp(`^- \\*\\*${label}:\\*\\* \\S`, 'm');

  // Every marked column in data.md, as "code_name.column" with its mark.
  function markedColumns() {
    const marked = [];
    for (const sheet of section(doc('docs/data.md'), L.s.sheets).split('\n### ').slice(1)) {
      const heading = sheet.split('\n')[0].trim();
      const code = heading.match(/\(([a-z][a-z0-9_]*)\)$/);
      assert.ok(code, `the sheet "${heading}" needs its code name in brackets, like "Orders (orders)"`);
      for (const row of sheet.split('\n').filter((l) => l.startsWith('| ') && !/^\| (Column|العمود) /.test(l))) {
        const cells = row.split('|').map((c) => c.trim());
        assert.ok(L.marks.includes(cells[4]), `${code[1]}.${cells[1]}: the mark "${cells[4]}" must be one of ${L.marks.join(', ')}`);
        if (cells[4] !== '–') marked.push({ column: `${code[1]}.${cells[1]}`, mark: cells[4] });
      }
    }
    return marked;
  }

  test(`(${folder}) the PRD numbers its "must do" lines M1, M2, … without gaps`, () => {
    const numbers = [...section(doc('docs/prd.md'), L.s.must).matchAll(/^- \*\*M(\d+)\.\*\*/gm)].map((m) => Number(m[1]));
    assert.ok(numbers.length >= 1, 'no M lines found');
    assert.deepStrictEqual(numbers, numbers.map((_, i) => i + 1));
  });

  test(`(${folder}) every "must do" line has one check under it`, () => {
    const lines = section(doc('docs/prd.md'), L.s.must).split('\n');
    lines.forEach((line, i) => {
      if (/^- \*\*M\d+\.\*\*/.test(line)) assert.match(lines[i + 1] || '', L.check, `${line} needs a check line under it`);
    });
  });

  test(`(${folder}) every "Changed" line keeps the old choice and says when, what and why`, () => {
    for (const line of allLines().filter((l) => l.includes(L.changedWord))) assert.match(line, L.changed, line);
  });

  test(`(${folder}) every open choice in the TRD is an honest TBD line`, () => {
    const lines = doc('docs/trd.md').split('\n').filter((l) => l.startsWith('- ') && l.includes(L.tbdWord));
    if (showcase) assert.ok(lines.length >= 1, 'the example must show one TBD');
    for (const line of lines) assert.match(line, L.tbd, line);
  });

  test(`(${folder}) the TRD has work rules or says it is personal`, () => {
    assert.match(section(doc('docs/trd.md'), L.s.work), /^- \S/m);
  });

  if (has('DESIGN.md')) {
    const picked = () => {
      const window = {};
      new Function('window', doc('docs/design-preview/looks.js'))(window);
      return window.PROJECT_DOCS_LOOKS.looks[0]; // the example's person picked the first look
    };

    test(`(${folder}) DESIGN.md holds exactly the picked look, every colour and font in its own role`, () => {
      assert.deepStrictEqual(designProblems(doc('DESIGN.md'), picked(), L), []);
    });

    test(`(${folder}) a DESIGN.md with two roles swapped is caught`, () => {
      const design = doc('DESIGN.md');
      const look = picked();
      const swapReady = design
        .replace(`--color-background: ${look.colors.background}`, '--color-background: SWAP')
        .replace(`--color-card: ${look.colors.surface}`, `--color-card: ${look.colors.background}`)
        .replace('--color-background: SWAP', `--color-background: ${look.colors.surface}`);
      assert.notStrictEqual(swapReady, design);
      assert.ok(designProblems(swapReady, look, L).length >= 2, 'background and card swapped in the ready values');
      const swapFonts = design
        .replace(`--font-heading: "${look.fonts.heading}"`, '--font-heading: "SWAP"')
        .replace(`--font-text: "${look.fonts.body}"`, `--font-text: "${look.fonts.heading}"`)
        .replace('--font-heading: "SWAP"', `--font-heading: "${look.fonts.body}"`);
      if (look.fonts.heading !== look.fonts.body) {
        assert.notStrictEqual(swapFonts, design);
        assert.ok(designProblems(swapFonts, look, L).length >= 2, 'heading and text fonts swapped');
      }
    });

    test(`(${folder}) a renamed font row, or a family that only shares a prefix, is caught`, () => {
      const design = doc('DESIGN.md');
      const look = picked();
      const headingRow = Object.keys(L.fontRows).find((k) => L.fontRows[k] === 'heading');
      const renamed = design.replace(`| ${headingRow} | ${look.fonts.heading}`, `| Renamed font | ${look.fonts.heading}`);
      assert.notStrictEqual(renamed, design);
      assert.ok(designProblems(renamed, look, L).length >= 1, 'renamed heading row');
      const prefix = design.replace(`| ${headingRow} | ${look.fonts.heading}`, `| ${headingRow} | ${look.fonts.heading} Different`);
      assert.notStrictEqual(prefix, design);
      assert.ok(designProblems(prefix, look, L).length >= 1, 'a family sharing only a prefix');
    });

    test(`(${folder}) DESIGN.md's font files are really in docs/fonts/, with their licences`, () => {
      const look = picked();
      for (const font of new Set([look.fonts.heading, look.fonts.body])) {
        const file = font.replace(/ /g, '');
        const files = fs.readdirSync(path.join(EXAMPLES, folder, 'docs/fonts'));
        assert.ok(files.some((f) => f.startsWith(file) && f.endsWith('.ttf')), `${font} files in docs/fonts/`);
        assert.ok(files.some((f) => f.includes(file) && f.endsWith('.txt')), `${font} licence in docs/fonts/`);
      }
    });

    test(`(${folder}) DESIGN.md uses exactly the ready value names of the template`, () => {
      const optional = ['--font-arabic'];
      const names = (text) => [...text.matchAll(/^\s+(--[a-z0-9-]+):/gm)].map((m) => m[1]).filter((n) => !optional.includes(n));
      const templateNames = names(template('design.md', 'The document').join('\n'));
      assert.ok(templateNames.length >= 10, 'the template lists its names');
      assert.deepStrictEqual(names(section(doc('DESIGN.md'), L.s.ready)), templateNames);
    });
  }

  if (has('docs/data.md')) {
    if (staffProviderIdentity) test(`(${folder}) staff provider identities are present and unique, matching Security`, () => {
      const data = doc('docs/data.md');
      assert.deepStrictEqual(staffIdentityProblems(data, L), []);
      const noModelIdentity = data.replace(/^\| microsoft_account_id \|.*\n/m, '');
      assert.notStrictEqual(noModelIdentity, data);
      assert.ok(staffIdentityProblems(noModelIdentity, L).length > 0, 'a missing readable identity field is caught');
      const unmarkedIdentity = data.replace(/^(\| microsoft_account_id \|.+\|) [^|]+ \|$/m, '$1 – |');
      assert.notStrictEqual(unmarkedIdentity, data);
      assert.ok(staffIdentityProblems(unmarkedIdentity, L).length > 0, 'a provider identity without its personal mark is caught');
      const noSchemaIdentity = data.replace(/^\s*microsoft_account_id\s+text[^\n]*\n/m, '');
      assert.notStrictEqual(noSchemaIdentity, data);
      assert.ok(staffIdentityProblems(noSchemaIdentity, L).length > 0, 'a missing schema identity field is caught');
      const emailOnly = data.replace(/(microsoft_account_id\s+text\s+)NOT NULL UNIQUE/i, '$1NOT NULL');
      assert.notStrictEqual(emailOnly, data);
      assert.ok(staffIdentityProblems(emailOnly, L).length > 0, 'email uniqueness cannot replace provider identity uniqueness');
    });

    test(`(${folder}) data.md marks every column, and every sheet says who sees it and how long it is kept`, () => {
      const marked = markedColumns();
      if (showcase) assert.ok(marked.length >= 1, 'the example must mark personal data');
      for (const sheet of section(doc('docs/data.md'), L.s.sheets).split('\n### ').slice(1)) {
        assert.match(sheet, field(L.who), sheet.split('\n')[0]);
        assert.match(sheet, field(L.howLong), sheet.split('\n')[0]);
      }
    });

    test(`(${folder}) every name, contact detail and link to a person is marked personal`, () => {
      const rows = [];
      for (const sheet of section(doc('docs/data.md'), L.s.sheets).split('\n### ').slice(1)) {
        const code = sheet.split('\n')[0].match(/\(([a-z][a-z0-9_]*)\)$/)[1];
        for (const row of sheet.split('\n').filter((l) => l.startsWith('| ') && !/^\| (Column|العمود) /.test(l))) {
          const cells = row.split('|').map((c) => c.trim());
          rows.push({ sheet: code, column: cells[1], mark: cells[4] });
        }
      }
      const personalSheets = new Set(rows.filter((r) => r.mark !== '–' && !r.column.endsWith('_id')).map((r) => r.sheet));
      for (const r of rows) {
        const identifying = /name|phone|email|birth|address/.test(r.column) ||
          (r.column.endsWith('_id') && personalSheets.has(`${r.column.slice(0, -3)}s`));
        if (identifying) assert.notStrictEqual(r.mark, '–', `${r.sheet}.${r.column} identifies a person and must be marked`);
      }
    });

    test(`(${folder}) data.md has a ready block only when the TRD has settled the data storage`, () => {
      const storage = section(doc('docs/trd.md'), L.s.storage);
      assert.deepStrictEqual(readyBlockProblems(storage, section(doc('docs/data.md'), L.s.readyBlock), L), []);
    });

    test(`(${folder}) security.md names every personal and secret column from data.md, with its mark`, () => {
      const personal = section(doc('docs/security.md'), L.s.personal);
      for (const { column, mark } of markedColumns()) {
        assert.ok(personal.includes(`**${column}** (${mark})`), `security.md is missing ${column} (${mark})`);
      }
    });
  }

  test(`(${folder}) every plan step has its three lines and one valid status`, () => {
    assert.ok(steps().length >= 1, 'no steps');
    for (const step of steps()) {
      const title = step.split('\n')[0];
      assert.match(title, L.stepTitle);
      assert.match(step, field(L.covers), title);
      assert.match(step, field(L.how), title);
      assert.match(step, L.statusLine, title);
    }
  });

  test(`(${folder}) every way in that Security names has its own sign-in step in the plan`, () => {
    // A way in is a bullet that names who (in bold) and says they sign in.
    const signIn = lang === 'en' ? /\bsigns? in\b/i : /يدخل/;
    const waysIn = section(doc('docs/security.md'), lang === 'en' ? 'Who can get in' : 'من يستطيع الدخول')
      .split('\n').filter((l) => l.startsWith('- **') && signIn.test(l));
    const signInSteps = steps().filter((s) => signIn.test(s.split('\n')[0]));
    assert.ok(signInSteps.length >= waysIn.length, `${waysIn.length} ways in, but ${signInSteps.length} sign-in steps`);
  });

  test(`(${folder}) an "only their own" rule gets a two-person try: open, change and cancel B's data as A, all refused`, () => {
    const ownOnly = lang === 'en' ? /only their own/ : /فقط/;
    const waysIn = section(doc('docs/security.md'), lang === 'en' ? 'Who can get in' : 'من يستطيع الدخول');
    if (!waysIn.split('\n').some((l) => l.startsWith('- **') && ownOnly.test(l))) return;
    const words = lang === 'en'
      ? [/\bA\b/, /\bB's\b/, /\bopen\b/, /\bmove\b/, /\bcancel\b/, /\brefused\b/, /\bunchanged\b/]
      : [/المريض أ/, /\(ب\)|المريض ب/, /فتح/, /تغيير/, /إلغاء/, /تُرفض/, /دون تغيير/];
    const tried = doc('docs/plan.md').split('\n').some((l) => words.every((w) => w.test(l)));
    assert.ok(tried, 'no step signs in as A and tries to open, change and cancel B\'s data, all refused, B unchanged');
  });

  test(`(${folder}) each protection applies to this project's actual capabilities, otherwise says None`, () => {
    const en = lang === 'en';
    const who = section(doc('docs/security.md'), en ? 'Who can get in' : 'من يستطيع الدخول').split('\n');
    const applies = {
      [en ? 'Records' : 'السجلات']: who.some((l) => l.startsWith('- **') && (en ? /only their own/ : /فقط/).test(l)),
      [en ? 'Database' : 'قاعدة البيانات']: exists(`${folder}/docs/data.md`),
      [en ? 'Sign-in' : 'الدخول']: who.some((l) => l.startsWith('- **') && (en ? /\bsigns? in\b/i : /يدخل/).test(l)),
      [en ? 'Connections' : 'الاتصالات']: network,
      [en ? 'Audit' : 'التدقيق']: audit,
    };
    const lines = section(doc('docs/security.md'), en ? "How it's protected" : 'كيف يُحمى').split('\n').filter((l) => l.startsWith('- '));
    assert.deepStrictEqual(lines.map((l) => (l.match(/^- \*\*(.+?):\*\* /) || [])[1]), Object.keys(applies));
    for (const [label, yes] of Object.entries(applies)) {
      const none = lines.find((l) => l.startsWith(`- **${label}:**`)).includes(`:** ${en ? 'None:' : 'لا ينطبق:'}`);
      assert.strictEqual(none, !yes, `${label} ${yes ? 'applies but says None' : 'does not apply but is not None'}`);
    }
  });

  test(`(${folder}) the plan covers every PRD "must do" line`, () => {
    const must = [...section(doc('docs/prd.md'), L.s.must).matchAll(/\*\*(M\d+)\.\*\*/g)].map((m) => m[1]);
    const covered = steps().flatMap((s) => s.match(new RegExp(`\\*\\*${L.covers}:\\*\\* (.+)`))[1].match(/M\d+/g) || []);
    for (const m of must) assert.ok(covered.includes(m), `no step covers ${m}`);
  });

  // Where a TBD really lives: the PRD, TRD, DESIGN.md, Data and the Handover. Security and the Plan only quote them.
  const tbdSources = () => ['docs/prd.md', 'docs/trd.md', 'DESIGN.md', 'docs/data.md', 'docs/handover.md'].filter(has).map(doc);

  test(`(${folder}) "Who decides" is the five fixed lines, or one "alone" line`, () => {
    assert.deepStrictEqual(decidesProblems(doc('docs/prd.md'), L).problems, []);
  });

  test(`(${folder}) a handed-over project says who approved each approved document`, () => {
    if (decidesProblems(doc('docs/prd.md'), L).alone) return;
    for (const name of ['docs/prd.md', 'docs/trd.md', 'DESIGN.md', 'docs/data.md', 'docs/security.md', 'docs/handover.md', 'docs/plan.md'].filter(has)) {
      const stamp = doc(name).split('\n')[1];
      if (stamp.includes(lang === 'en' ? 'Approved' : 'معتمد')) assert.match(stamp, L.approvedBy, `${name}: ${stamp}`);
    }
  });

  test(`(${folder}) a handed-over project has a Handover document and every delivery step in order; one built alone has neither`, () => {
    const { alone } = decidesProblems(doc('docs/prd.md'), L);
    assert.strictEqual(has('docs/handover.md'), !alone, alone ? 'built alone: no handover.md' : 'handed over: needs handover.md');
    assert.deepStrictEqual(deliveryProblems(doc('docs/plan.md'), { alone, screens: has('DESIGN.md') }, L), []);
    if (has('docs/handover.md')) {
      for (const line of doc('docs/handover.md').split('\n').filter((l) => l.startsWith('- ') && l.includes(L.tbdWord))) {
        assert.match(line, L.tbd, line);
      }
    }
  });

  test(`(${folder}) a step waiting for a TBD names a TBD that really is open`, () => {
    const waiting = steps().filter((s) => L.waitingFor.test(s));
    if (showcase) assert.ok(waiting.length >= 1, 'the example must show a blocked step');
    assert.deepStrictEqual(waitingProblems(doc('docs/plan.md'), tbdSources(), L), []);
  });

  test(`(${folder}) a waiting step naming a TBD that does not exist is caught`, () => {
    const status = lang === 'en' ? '⛔ waits for TBD: nonexistent unicorn service' : '⛔ تنتظر ما لم يُحسم: خدمة غير موجودة';
    const plan = doc('docs/plan.md').replace(L.statusLine, (line) => line.replace(/:\*\* .+$/, `:** ${status}`));
    assert.notStrictEqual(plan, doc('docs/plan.md'));
    assert.strictEqual(waitingProblems(plan, tbdSources(), L).length, 1);
  });

  test(`(${folder}) a back end gets an API guide step, and no back end gets none`, () => {
    const backEnd = !L.noBrain.test(section(doc('docs/trd.md'), L.s.brain));
    assert.strictEqual(steps().some((s) => s.includes('docs/api.md')), backEnd);
  });
}

test('a settled TBD keeps its history and is no longer open, in both languages', () => {
  const sql = '```sql\nCREATE TABLE orders (id bigserial PRIMARY KEY);\n```';
  const cases = {
    en: {
      open: '- TBD: the database. Decided when Layla\'s nephew has answered.',
      settled: '- TBD: the database. Decided when Layla\'s nephew has answered.\n  - Changed 2026-11-02: TBD → PostgreSQL, because her nephew already runs one.',
    },
    ar: {
      open: '- لم يُحسم بعد: قاعدة البيانات. يُحسم عندما يجيب ابن أخ ليلى.',
      settled: '- لم يُحسم بعد: قاعدة البيانات. يُحسم عندما يجيب ابن أخ ليلى.\n  - تغيّر في 2026-11-02: من لم يُحسم بعد إلى PostgreSQL، لأن ابن أخيها يديرها.',
    },
  };
  for (const [lang, c] of Object.entries(cases)) {
    const L = LANGS[lang];
    assert.strictEqual(openTbds(c.open, L).length, 1, `${lang}: open`);
    assert.strictEqual(openTbds(c.settled, L).length, 0, `${lang}: settled`);
    assert.match(c.settled.split('\n')[1], L.changed, `${lang}: the settling line is a valid Changed line`);
    assert.deepStrictEqual(readyBlockProblems(c.settled, sql, L), [], `${lang}: settled storage gets its tables`);
    assert.strictEqual(readyBlockProblems(c.settled, L.waits, L).length, 1, `${lang}: settled storage must not wait`);
    assert.deepStrictEqual(readyBlockProblems(c.open, L.waits, L), [], `${lang}: open storage waits`);
    assert.strictEqual(readyBlockProblems(c.open, sql, L).length, 1, `${lang}: open storage has no tables yet`);
  }
});

test('a step whose wait was settled keeps it as a Changed line that no longer reads as waiting, in both languages', () => {
  const cases = {
    en: {
      settled: '- TBD: the hosting. Decided when the nephew answers.\n  - Changed 2026-10-21: TBD → Render, because the nephew uses it.',
      line: '  - Changed 2026-10-21: waited for the hosting → not started, because the TRD settled it as Render.',
      wrong: '  - Changed 2026-10-21: was ⛔ waits for TBD: the hosting → not started, because the TRD settled it as Render.',
      plan: (history) => `### Step 7: Put it online\n- **Covers:** TRD: Where it lives\n- **How we know it works:** open the link on a phone.\n${history}\n- **Status:** not started`,
    },
    ar: {
      settled: '- لم يُحسم بعد: الاستضافة. يُحسم عندما يجيب ابن الأخ.\n  - تغيّر في 2026-10-21: من لم يُحسم بعد إلى Render، لأن ابن الأخ يستخدمها.',
      line: '  - تغيّر في 2026-10-21: من انتظار الاستضافة إلى لم تبدأ، لأن TRD حسمها Render.',
      wrong: '  - تغيّر في 2026-10-21: من ⛔ تنتظر ما لم يُحسم: الاستضافة إلى لم تبدأ، لأن TRD حسمها Render.',
      plan: (history) => `### الخطوة 7: نشره\n- **تغطي:** TRD: أين يعمل\n- **كيف نعرف أنها تعمل:** افتح الرابط على الهاتف.\n${history}\n- **الحالة:** لم تبدأ`,
    },
  };
  for (const [lang, c] of Object.entries(cases)) {
    const L = LANGS[lang];
    assert.strictEqual(openTbds(c.settled, L).length, 0, `${lang}: the choice is settled`);
    assert.match(c.line, L.changed, `${lang}: the history line is a valid Changed line`);
    const plan = c.plan(c.line);
    assert.match(plan, L.statusLine, `${lang}: the step has one valid status`);
    assert.ok(!L.waitingFor.test(plan), `${lang}: the step no longer reads as waiting`);
    assert.deepStrictEqual(waitingProblems(plan, [c.settled], L), [], `${lang}: nothing waits on the settled choice`);
    assert.strictEqual(waitingProblems(c.plan(c.wrong), [c.settled], L).length, 1, `${lang}: a history line that repeats the waiting words is caught`);
  }
});

test('a reopened choice is open again, and a waiting step must name the choice, not its condition', () => {
  const sql = '```sql\nCREATE TABLE orders (id bigserial PRIMARY KEY);\n```';
  const cases = {
    en: {
      reopened: '- TBD: the database. Decided when the owner chooses.\n' +
        '  - Changed 2026-10-08: TBD → PostgreSQL, because the owner chose it.\n' +
        '  - Changed 2026-10-09: PostgreSQL → TBD, because the owner is reconsidering.',
      changedBack: '- SQLite, because it is one file.\n  - Changed 2026-10-09: SQLite → TBD, because the clinic may share it.',
      plan: (what) => `### Step 1: Book\n- **Covers:** M1\n- **How we know it works:** try it.\n- **Status:** ⛔ waits for TBD: ${what}`,
      name: 'the database', condition: 'the owner chooses',
    },
    ar: {
      reopened: '- لم يُحسم بعد: قاعدة البيانات. يُحسم عندما يختار المالك.\n' +
        '  - تغيّر في 2026-10-08: من لم يُحسم بعد إلى PostgreSQL، لأن المالك اختارها.\n' +
        '  - تغيّر في 2026-10-09: من PostgreSQL إلى لم يُحسم بعد، لأن المالك يعيد التفكير.',
      changedBack: '- SQLite، لأنها ملف واحد.\n  - تغيّر في 2026-10-09: من SQLite إلى لم يُحسم بعد، لأن العيادة قد تشاركها.',
      plan: (what) => `### الخطوة 1: الحجز\n- **تغطي:** M1\n- **كيف نعرف أنها تعمل:** جرّبها.\n- **الحالة:** ⛔ تنتظر ما لم يُحسم: ${what}`,
      name: 'قاعدة البيانات', condition: 'يختار المالك',
    },
  };
  for (const [lang, c] of Object.entries(cases)) {
    const L = LANGS[lang];
    assert.strictEqual(openTbds(c.reopened, L).length, 1, `${lang}: TBD → choice → TBD is open`);
    assert.strictEqual(readyBlockProblems(c.reopened, sql, L).length, 1, `${lang}: a reopened storage has no ready tables`);
    assert.strictEqual(openTbds(c.changedBack, L).length, 1, `${lang}: a choice changed back to TBD is open`);
    assert.deepStrictEqual(waitingProblems(c.plan(c.name), [c.reopened], L), [], `${lang}: waiting on the choice name`);
    assert.strictEqual(waitingProblems(c.plan(c.condition), [c.reopened], L).length, 1, `${lang}: the condition is not a name`);
  }
});

test('a reopened choice with archived history has one current TBD and can be settled again', () => {
  const cases = {
    en: {
      history: '- SQLite, because it is one file.\n  - Changed 2026-10-09: SQLite → TBD, because the clinic may expand.',
      current: '- TBD: the database. Decided when TBD.', name: 'the database',
      settled: '  - Changed 2026-10-10: TBD → PostgreSQL, because the owner chose it.',
    },
    ar: {
      history: '- SQLite، لأنها ملف واحد.\n  - تغيّر في 2026-10-09: من SQLite إلى لم يُحسم بعد، لأن العيادة قد تتوسع.',
      current: '- لم يُحسم بعد: قاعدة البيانات. يُحسم عندما TBD.', name: 'قاعدة البيانات',
      settled: '  - تغيّر في 2026-10-10: من لم يُحسم بعد إلى PostgreSQL، لأن المالك اختارها.',
    },
  };
  const sql = '```sql\nCREATE TABLE visits (id bigint PRIMARY KEY);\n```';
  for (const [lang, c] of Object.entries(cases)) {
    const L = LANGS[lang];
    const storage = `<details data-project-docs-history>\n<summary>History</summary>\n\n${c.history}\n\n</details>\n\n${c.current}`;
    assert.deepStrictEqual(openTbds(storage, L).map(t => t.name), [c.name], `${lang}: only the named current choice is open`);
    assert.deepStrictEqual(readyBlockProblems(storage, L.waits, L), []);
    const settled = `${storage}\n${c.settled}`;
    assert.deepStrictEqual(openTbds(settled, L), [], `${lang}: old history must not leave a ghost blocker`);
    assert.deepStrictEqual(readyBlockProblems(settled, sql, L), []);
    assert.strictEqual(readyBlockProblems(settled, L.waits, L).length, 1);
    const ordinaryDetails = storage.replace(' data-project-docs-history', '');
    assert.strictEqual(openTbds(ordinaryDetails, L).length, 2, `${lang}: unmarked collapsed content is still current`);
  }
});

test('a waiting step names its choice word for word: a shortened name, a piece of a word, filler or punctuation is caught', () => {
  const cases = {
    en: {
      folder: 'cedar-clinic', name: 'the text-message service for reminders and patient sign-in codes',
      second: '- TBD: the text-message service for staff alerts. Decided when the IT lead has chosen one.',
      // [the ⛔ label, the open choice's name in the TRD, named?]
      labels: [
        ['hosting', 'hosting', true], // a one-word choice, named whole
        ['the cart service', 'the cart service', true],
        ['the text-message service', null, false], // the old shortened label
        ['text-message service', null, false], // Codex's rounds 3–6: shortened names, fragments, filler, punctuation
        ['cart service', 'the cart service', false],
        ['art', 'the cart service', false],
        ['the', null, false],
        ['that', 'the text-message service for reminders and patient sign-in codes that supports queued delivery', false],
        ['amongst', 'the text-message service for reminders and patient sign-in codes amongst other providers', false],
        ['the,', 'the text-message service for reminders and patient sign-in codes for the, as yet undecided, clinic account', false],
        ['—', 'the text-message service for reminders — provider undecided', false],
        ['The text-message service for reminders and patient sign-in codes', null, false], // a different case
        ['the text-message service for reminders and patient sign-in codes ', null, false], // a trailing space
        ['nonexistent unicorn service', null, false],
      ],
    },
    ar: {
      folder: 'cedar-clinic-ar', name: 'خدمة الرسائل النصية للتذكير ورموز دخول المرضى',
      second: '- لم يُحسم بعد: خدمة الرسائل النصية لتنبيه الموظفين. يُحسم عندما يختار مسؤول تقنية المعلومات واحدة.',
      labels: [
        ['إدارة المخزون', 'إدارة المخزون', true],
        ['خدمة الرسائل النصية', null, false], // the old shortened label
        ['الرسائل النصية', null, false],
        ['المخزون', 'إدارة المخزون', false],
        ['دار', 'إدارة المخزون', false],
        ['هذا', 'خدمة الرسائل النصية للتذكير ورموز دخول المرضى في هذا المركز', false],
        ['وبه', 'خدمة الرسائل النصية للتذكير ورموز دخول المرضى وبه رموز الدخول', false],
        ['سوف', 'خدمة الرسائل النصية التي سوف تُختار', false],
        ['أو،', 'خدمة الرسائل النصية للتذكير أو، عند الحاجة، البريد الإلكتروني', false],
        ['—', 'خدمة الرسائل النصية للتذكير — لم يُختر المزود', false],
        ['خدمة غير موجودة', null, false],
      ],
    },
  };
  for (const [lang, c] of Object.entries(cases)) {
    const L = LANGS[lang];
    const trd = read(`${c.folder}/docs/trd.md`), plan = read(`${c.folder}/docs/plan.md`);
    const waitCount = [...plan.matchAll(new RegExp(L.waitingFor.source, 'gm'))].length;
    // The example's plan with every ⛔ label replaced (what the plan says now is the per-project test's business).
    const waitingOn = (what) => plan.replace(new RegExp(L.waitingFor.source, 'gm'), (line, old) => line.replace(old, what));
    assert.ok(trd.includes(c.name), `${lang}: the example still has its choice`);
    assert.ok(new RegExp(L.waitingFor.source, 'm').test(plan), `${lang}: the example still has a waiting step`);
    assert.deepStrictEqual(waitingProblems(waitingOn(c.name), [trd], L), [], `${lang}: the whole name`);
    for (const [what, name, named] of c.labels) {
      const problems = waitingProblems(waitingOn(what), [name ? trd.replace(c.name, name) : trd], L);
      assert.strictEqual(problems.length, named ? 0 : waitCount, `${lang}: "${what}" for "${name || c.name}" → ${JSON.stringify(problems)}`);
    }
    // Two open choices that share their first words: each whole name picks its own.
    const two = trd.replace(new RegExp(L.tbdName.source, 'm'), (start) => `${c.second}\n${start}`);
    assert.strictEqual(openTbds(two, L).length, openTbds(trd, L).length + 1, `${lang}: one additional open choice`);
    assert.deepStrictEqual(waitingProblems(waitingOn(c.name), [two], L), [], `${lang}: the whole name names one`);
    assert.deepStrictEqual(waitingProblems(waitingOn(openTbds(two, L)[0].name), [two], L), [], `${lang}: the other whole name names the other`);
  }
});

test('a project that saves nothing has no data.md, and its security page says so', () => {
  assert.ok(!exists('study-timer/docs/data.md'));
  assert.match(section(read('study-timer/docs/security.md'), 'Personal data'), /^- None: it saves nothing\.$/m);
});

test('a missing, misplaced or extra delivery step is caught, in both languages', () => {
  for (const [lang, folder] of [['en', 'cedar-clinic'], ['ar', 'cedar-clinic-ar']]) {
    const L = LANGS[lang];
    const plan = read(`${folder}/docs/plan.md`);
    const opts = { alone: false, screens: true };
    assert.deepStrictEqual(deliveryProblems(plan, opts, L), [], `${lang}: the example passes`);
    const steps = plan.split('\n### ');
    const uat = steps.findIndex((s) => s.startsWith(`${lang === 'en' ? 'Step' : 'الخطوة'} 13: ${L.delivery[3]}`));
    assert.ok(uat > 0, `${lang}: the example has its UAT step`);
    assert.ok(deliveryProblems(steps.filter((_, i) => i !== uat).join('\n### '), opts, L).length > 0, `${lang}: a missing UAT is caught`);
    const swapped = [...steps];
    [swapped[uat], swapped[uat + 1]] = [swapped[uat + 1], swapped[uat]];
    assert.ok(deliveryProblems(swapped.join('\n### '), opts, L).length > 0, `${lang}: UAT after Install is caught`);
    assert.ok(deliveryProblems(plan, { alone: false, screens: false }, L).length > 0, `${lang}: a prototype without screens is caught`);
    assert.ok(deliveryProblems(plan, { alone: true, screens: true }, L).length > 0, `${lang}: delivery steps in a project built alone are caught`);
    const twice = plan.replace(/\n### [^\n]+\n/, (m) => m.replace(/: .+$/m, `: ${L.delivery[5]}`));
    assert.ok(deliveryProblems(twice, opts, L).length > 0, `${lang}: a delivery step that appears twice is caught`);
    // The prototype may come first (step 1 waits for the database), but never later than step 2.
    const first = [steps[0], steps[2], steps[1], ...steps.slice(3)].join('\n### ');
    assert.deepStrictEqual(deliveryProblems(first, opts, L), [], `${lang}: a prototype at step 1 is accepted`);
    const late = [steps[0], steps[1], steps[3], steps[2], ...steps.slice(4)].join('\n### ');
    assert.ok(deliveryProblems(late, opts, L).length > 0, `${lang}: a prototype at step 3 is caught`);
    const noGoLive = steps.filter((s) => !s.includes(`: ${L.delivery[7]}\n`)).join('\n### ');
    assert.notStrictEqual(noGoLive, plan);
    assert.ok(deliveryProblems(noGoLive, opts, L).length > 0, `${lang}: a missing go-live is caught`);
  }
  const L = LANGS.en;
  const prd = read('study-timer/docs/prd.md');
  assert.strictEqual(decidesProblems(prd, L).alone, true);
  const half = prd.replace('- **Owner**: the student, alone.', '- **Owner**: the student.\n- **Approves the scope**: the student.');
  assert.notStrictEqual(half, prd);
  assert.ok(decidesProblems(half, L).problems.length > 0, 'two of the five lines are caught');
});

// The meeting form has no stamp: it is checked on its own. It is four meetings with ten numbered sections;
// both templates share one shape, and the filled example keeps every heading and role row of the English one.
test('the meeting form templates match each other, and the filled example keeps the form', () => {
  const formHeadings = (lines) => lines.filter((l) => /^#{1,3} /.test(l));
  const shape = (lines) => formHeadings(lines).map((h) => h.match(/^(#+) /)[1] + ((h.match(/^#+ \D*?(\d+)[.:]/) || [])[1] || ''));
  const roles = (lines) => {
    const part = (lines.join('\n').split(/\n### 2\. .+\n/)[1] || '').split('\n#')[0];
    return part.split('\n').filter((l) => /^\| [^-|]/.test(l)).slice(1).map((l) => l.split('|')[1].trim());
  };
  const en = template('meeting-form.md', 'The form');
  const ar = template('meeting-form.md', 'In Arabic');
  const want = ['#', '##1', '###1', '###2', '##2', '###3', '###4', '###', '##3', '###5', '###6', '###7', '###8', '###9', '##4', '###10'];
  assert.deepStrictEqual(shape(en), want, 'four meetings, ten sections, the notes signature after meeting 2');
  assert.deepStrictEqual(shape(ar), want, 'the Arabic form has the same shape');
  assert.strictEqual(roles(en).length, 5, 'five roles, as in the PRD');
  assert.strictEqual(roles(ar).length, 5, 'five roles in Arabic');
  const filled = read('cedar-clinic/docs/meeting-form.md').split('\n');
  assert.ok(filled[0].startsWith(en[0].split('<')[0]), 'the filled form keeps the title');
  assert.ok(!/^> /.test(filled[1]), 'a meeting form has no stamp');
  assert.deepStrictEqual(formHeadings(filled).slice(1), formHeadings(en).slice(1));
  assert.deepStrictEqual(roles(filled), roles(en));
  const questions = (lines) => lines.filter((l) => /^- \*\*/.test(l)).length;
  assert.strictEqual(questions(ar), questions(en), 'the Arabic form asks the same number of questions');
  assert.strictEqual(questions(filled), questions(en), 'the filled form answers every question');
});

test('the stamp rules reject a broken stamp', () => {
  assert.match('> v2 · Approved 2026-10-08 by the clinic manager', LANGS.en.stamp);
  assert.match('> الإصدار 2 · معتمد 2026-10-08 من مدير العيادة', LANGS.ar.stamp);
  for (const bad of ['> v2 · Approved 2026-10-08 by ', '> v2 · Approved 2026-10-08 by', '> v2 · Draft by the manager']) {
    assert.doesNotMatch(bad, LANGS.en.stamp, bad);
  }
  for (const bad of ['> v1 Draft', '> v0 · Draft', '> v2 · Approved', '> v1 · Approved 8 Oct 2026', 'v1 · Draft']) {
    assert.doesNotMatch(bad, LANGS.en.stamp, bad);
  }
  for (const bad of ['> الإصدار 1 مسودة', '> الإصدار 0 · مسودة', '> الإصدار 2 · معتمد', '> v1 · مسودة']) {
    assert.doesNotMatch(bad, LANGS.ar.stamp, bad);
  }
});

// What an older approved PRD lacks under today's template: missing headings, and must-do lines with no check.
function upgradeGaps(prd, L) {
  const have = headings(prd.split('\n'));
  const gaps = headings(template('prd.md', L.templateHeading)).filter((h) => !have.includes(h));
  const lines = section(prd, L.s.must).split('\n');
  lines.forEach((line, i) => {
    const m = line.match(/^- \*\*(M\d+)\.\*\*/);
    if (m && !L.check.test(lines[i + 1] || '')) gaps.push(`${m[1]} has no check`);
  });
  return gaps;
}

// A Prototype step must never wait for the TRD's data storage.
function prototypeWaitProblems(plan, trd, L) {
  const storage = openTbds(section(trd, L.s.storage), L).map((t) => t.name);
  const proto = section(plan, L.s.steps).split('\n### ').slice(1)
    .find((s) => ((s.split('\n')[0].match(L.stepName) || [])[1] || '').startsWith(L.delivery[0]));
  const waits = proto && proto.match(L.waitingFor);
  return waits && storage.includes(waits[1]) ? ['the prototype waits for the data storage'] : [];
}

const FIXTURES = path.join(__dirname, 'fixtures', 'approved-0.2.2');

// Real output of 0.2.2 (the clinic example at ef1e129): approved, but missing what 0.3.0 needs. The skill must
// treat it as not approved yet, keep everything, ask only for the gaps, and never invent an approval.
test('an approved 0.2.2 document is found incomplete, and the skill says how to continue it', () => {
  const L = LANGS.en;
  const fixture = (name) => readMarkdown(path.join(FIXTURES, name));
  for (const name of ['prd.md', 'trd.md', 'plan.md']) {
    assert.match(fixture(name).split('\n')[1], / · Approved \d{4}-\d{2}-\d{2}$/, `${name} is a real approved 0.2.2 document`);
  }
  assert.deepStrictEqual(upgradeGaps(fixture('prd.md'), L), [
    '## How it works today', '## How it will work', '## Who decides', '## Later', '## Assumptions and risks',
    '## Dates and budget', 'M1 has no check', 'M2 has no check', 'M3 has no check', 'M4 has no check', 'M5 has no check',
  ]);
  assert.deepStrictEqual(upgradeGaps(read('cedar-clinic/docs/prd.md'), L), [], 'the 0.3.0 example has no gaps');
  assert.doesNotMatch(section(fixture('trd.md'), 'Rules it must follow'), /\*\*Available:\*\*/, 'the 0.2.2 TRD has no Available line');
  assert.ok(deliveryProblems(fixture('plan.md'), { alone: false, screens: true }, L).length > 0, 'the 0.2.2 plan has no delivery steps');
  const skill = readMarkdown(path.join(SKILL, 'SKILL.md')).replace(/\s+/g, ' ');
  for (const rule of [
    'An **approved** document that lacks headings or fixed lines its reference now has',
    'treat it as the first document that is not approved',
    'Keep every line, its stamp history and its `Changed` lines',
    'Never invent an approver, a check or an approval',
    'set it to `Draft`, and approve it the normal way, before writing anything that needs the new parts',
    'A document that exists but has no stamp (the person wrote it before): read it, keep everything in it',
  ]) assert.ok(skill.includes(rule), `SKILL.md must keep the rule: ${rule}`);
});

// Screens chosen, database open: the prototype on made-up data can go first; every step that saves still waits.
test('with the data storage TBD, the prototype goes first and the saving steps wait', () => {
  const L = LANGS.en;
  const trdText = read('cedar-clinic/docs/trd.md');
  const storage = section(trdText, L.s.storage);
  const trd = trdText.replace(storage, '\n- TBD: the database. Decided when the clinic\'s IT lead names one.\n');
  assert.notStrictEqual(trd, trdText);
  const plan = read('cedar-clinic/docs/plan.md');
  const steps = plan.split('\n### ');
  const booking = steps[1].replace(/^- \*\*Status:\*\* .+$/m, '- **Status:** ⛔ waits for TBD: the database');
  const prototype = steps[2].replace(/^Step 2: /, 'Step 1: ').replace(/^- \*\*Status:\*\* .+$/m, '- **Status:** not started');
  const first = [steps[0], prototype, booking.replace(/^Step 1: /, 'Step 2: '), ...steps.slice(3)].join('\n### ');
  assert.deepStrictEqual(deliveryProblems(first, { alone: false, screens: true }, L), [], 'the prototype at step 1 is accepted');
  assert.deepStrictEqual(waitingProblems(first, [trd, read('cedar-clinic/docs/handover.md')], L), [], 'the saving step waits for the open database by its exact name');
  assert.deepStrictEqual(prototypeWaitProblems(first, trd, L), [], 'the prototype does not wait');
  const blocked = first.replace(/(### Step 1: Prototype[\s\S]*?- \*\*Status:\*\* ).+/, '$1⛔ waits for TBD: the database');
  assert.notStrictEqual(blocked, first);
  assert.ok(prototypeWaitProblems(blocked, trd, L).length > 0, 'a prototype waiting for the database is caught');
  const tbdRule = readMarkdown(path.join(SKILL, 'references', 'trd.md')).split('## TBD: an honest gap')[1].split('\n## ')[0].replace(/\s+/g, ' ');
  assert.ok(tbdRule.includes('Only the prototype can be built until this is chosen'), 'the TRD tells the client the prototype can go on');
  assert.doesNotMatch(tbdRule, /screen and the data storage are needed by the very first step/, 'the old "blocks everything" rule is gone');
});
