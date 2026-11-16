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
  { reference: 'prd.md', en: ['cedar-clinic/docs/prd.md', 'study-timer/docs/prd.md', 'notes-digest/docs/prd.md'], ar: ['cedar-clinic-ar/docs/prd.md'] },
  { reference: 'trd.md', en: ['cedar-clinic/docs/trd.md', 'study-timer/docs/trd.md', 'notes-digest/docs/trd.md'], ar: ['cedar-clinic-ar/docs/trd.md'] },
  { reference: 'design.md', en: ['cedar-clinic/DESIGN.md'], ar: ['cedar-clinic-ar/DESIGN.md'] },
  { reference: 'data.md', en: ['cedar-clinic/docs/data.md'], ar: ['cedar-clinic-ar/docs/data.md'] },
  { reference: 'security.md', en: ['cedar-clinic/docs/security.md', 'study-timer/docs/security.md', 'notes-digest/docs/security.md'], ar: ['cedar-clinic-ar/docs/security.md'] },
  { reference: 'handover.md', en: ['cedar-clinic/docs/handover.md'], ar: ['cedar-clinic-ar/docs/handover.md'] },
  { reference: 'plan.md', en: ['cedar-clinic/docs/plan.md', 'study-timer/docs/plan.md', 'notes-digest/docs/plan.md'], ar: ['cedar-clinic-ar/docs/plan.md'] },
];

// Each example project, checked as a whole. A "showcase" project must show every feature (a TBD, a blocked
// step, personal data); the small one only has to be right.
const PROJECTS = [
  { folder: 'cedar-clinic', lang: 'en', showcase: true, staffProviderIdentity: true, network: true, audit: true },
  { folder: 'cedar-clinic-ar', lang: 'ar', showcase: true, staffProviderIdentity: true, network: true, audit: true },
  { folder: 'study-timer', lang: 'en', showcase: false },
  { folder: 'notes-digest', lang: 'en', showcase: false, network: true },
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

// 0.5.0: where the code is kept is the person's answer in the TRD; the Plan's release check carries the
// changelog line and the set-up-from-empty README, in both languages and in every example.
test('the TRD says where the code is kept, and the Plan checks the changelog and a from-empty set-up', () => {
  const trd = readMarkdown(path.join(SKILL, 'references', 'trd.md'));
  const plan = readMarkdown(path.join(SKILL, 'references', 'plan.md')).replace(/\s+/g, ' ');
  for (const [label, examples] of [['Kept in', ['cedar-clinic', 'study-timer']], ['مكان الكود', ['cedar-clinic-ar']]]) {
    const line = new RegExp(`^- \\*\\*${label}:\\*\\* \\S`, 'm');
    assert.match(trd, line, `the TRD template has the "${label}" line`);
    for (const folder of examples) assert.match(read(`${folder}/docs/trd.md`), line, `${folder} says where its code is kept`);
    assert.ok(plan.includes(`**${label}**`), `the Plan's release check points at "${label}"`);
  }
  assert.ok(trd.replace(/\s+/g, ' ').includes('**Where the code is kept** is never a default'), 'the AI never picks where the code is kept');
  for (const rule of ['from an empty computer to running', 'a dated line in `CHANGELOG.md`', 'من حاسوب فارغ إلى التشغيل', 'وسطر مؤرّخ في `CHANGELOG.md`']) {
    assert.ok(plan.includes(rule), `plan.md must keep the check: ${rule}`);
  }
  // Each rule sits in the bullet it belongs to, not just somewhere in the file.
  const nfc = (s) => s.normalize('NFC');
  const between = (text, start, end) => nfc(text).split(nfc(start))[1].split(nfc(end))[0];
  const en = between(plan, 'It is deployed or distributed beyond', 'It collects personal data');
  const ar = between(plan, 'خارج حاسوب', '- يجمع بيانات شخصية');
  assert.ok(en.includes('a dated line in `CHANGELOG.md`') && en.includes('**Kept in**'), 'the English release check holds both');
  assert.ok(ar.includes('`CHANGELOG.md`') && ar.includes(nfc('**مكان الكود**')), 'the Arabic release check holds both');
  assert.ok(between(plan, 'Someone besides the author', 'It is deployed or distributed').includes('from an empty computer to running'));
  // An open choice blocks only the release or the handover, never the building steps.
  const tbd = nfc(trd.split('## TBD: an honest gap')[1].split('\n## ')[0].replace(/\s+/g, ' '));
  assert.ok(tbd.includes('**Where the code is kept** blocks only the step that releases it or hands it over: until then it is built on the builder\'s computer.'));
  assert.ok(nfc(trd.replace(/\s+/g, ' ')).includes(nfc('ويعطّل خطوة الإصدار أو التسليم فقط')), 'the Arabic rule blocks only the release or the handover');
});

// 0.6.0: what the project costs to run is the person's answer in the TRD, never a price the AI supplies;
// the Handover says who pays and renews from the handover on. Both languages, every example.
test('the TRD says what it costs to run and who pays, and the Handover says who pays from then on', () => {
  const nfc = (s) => s.normalize('NFC');
  const flat = (file) => nfc(readMarkdown(path.join(SKILL, 'references', file)).replace(/\s+/g, ' '));
  const trd = flat('trd.md');
  const handover = flat('handover.md');
  const cases = [
    { L: LANGS.en, cost: 'Running cost', label: 'Each month', running: 'Running it', noLine: ': no line → ', trds: ['cedar-clinic', 'study-timer'], handovers: ['cedar-clinic'] },
    { L: LANGS.ar, cost: 'تكلفة التشغيل', label: 'كل شهر', running: 'تشغيله', noLine: ': من لا سطر إلى ', trds: ['cedar-clinic-ar'], handovers: ['cedar-clinic-ar'] },
  ];
  for (const { L, cost, label, running, noLine, trds, handovers } of cases) {
    const line = new RegExp(`^- \\*\\*${label}:\\*\\* \\S`, 'm');
    assert.match(section(template('trd.md', L.templateHeading).join('\n'), cost), line, `the TRD template has "${label}" under "${cost}"`);
    for (const folder of trds) {
      const costs = section(read(`${folder}/docs/trd.md`), cost);
      assert.match(costs, line, `${folder} says what it costs each month, under "${cost}"`);
      // A price that depends on a choice still open stays with that choice: no second open line here.
      assert.deepStrictEqual(openTbds(costs, L), [], `${folder}: the running cost opens no TBD of its own`);
    }
    assert.ok(section(template('handover.md', L.templateHeading).join('\n'), running).includes(`TRD: ${cost}`), `the Handover template points at "${cost}"`);
    for (const folder of handovers) {
      const doc = read(`${folder}/docs/handover.md`);
      const lines = section(doc, running).split('\n').filter((l) => l.trim());
      const history = lines.findIndex((l) => L.changed.test(l) && l.includes(noLine));
      assert.ok(history > 0 && lines[history - 1].startsWith('- '), `${folder}: the line about paying keeps "no line" as its earlier value`);
      assert.ok(lines[history].includes('2026-10-08'), `${folder}: the earlier approval is kept beneath the new line`);
      assert.doesNotMatch(doc.split('\n')[1], L.approvedBy, `${folder}: a handover that gained a line waits as a draft`);
    }
  }
  for (const rule of [
    '**Running cost** is never a default and never a guess.',
    'Write only an amount the person gave, with where it came from; never a price from your own memory.',
    'Who pays is a fact about the client: never "you pick".',
    'say so on its line, and write no second `TBD`.',
    'ولا تكتب سعرًا من ذاكرتك',
    'من يدفع حقيقة عن العميل',
    'ويعطّل فقط الخطوة التي يبدأ عندها الدفع',
  ]) assert.ok(trd.includes(nfc(rule)), `trd.md must keep the rule: ${rule}`);
  // An open price blocks only the step that starts paying, never the building steps.
  const tbd = nfc(readMarkdown(path.join(SKILL, 'references', 'trd.md')).split('## TBD: an honest gap')[1].split('\n## ')[0].replace(/\s+/g, ' '));
  assert.ok(tbd.includes('**A running cost** blocks only the step that starts paying for it (putting it online, or signing up for the service): everything before that step can be built.'));
  assert.ok(handover.includes('Never ask it again'), 'the Handover takes the running cost from the TRD');
});

// 0.6.0, review round 2: a bill the client already pays stays a running cost. Every amount in a Running
// cost section is "about <number> <CUR> a month|a year (from <source>)", and the Each month line adds up
// exactly the amounts above it, monthly and yearly apart. This checks the shape and the sums; it cannot
// know whether an amount is true.
const COST = {
  en: { heading: 'Running cost', label: 'Each month', amount: /about ([\d,.]*\d) ([A-Z]{3}) a (month|year) \(from [^)]+\)/g, bare: /([\d,.]*\d) ([A-Z]{3}) a (month|year)/g, cadence: { month: 'month', year: 'year' } },
  ar: { heading: 'تكلفة التشغيل', label: 'كل شهر', amount: /نحو ([\d,.]*\d) ([A-Z]{3}) في (الشهر|السنة) \(من [^)]+\)/g, bare: /([\d,.]*\d) ([A-Z]{3}) في (الشهر|السنة)/g, cadence: { 'الشهر': 'month', 'السنة': 'year' } },
};
function costProblems(costs, c) {
  const problems = [];
  const lines = costs.split('\n').filter((l) => l.startsWith('- '));
  const isTotal = (l) => l.startsWith(`- **${c.label}:**`);
  const number = (s) => Number(s.replace(/,/g, ''));
  const sums = (text, pattern) => {
    const by = {};
    // Added up per currency and cadence: 4 USD a month is not 4 AED a month.
    for (const m of text.matchAll(pattern)) {
      const key = `${m[2]} a ${c.cadence[m[3]]}`;
      by[key] = (by[key] || 0) + number(m[1]);
    }
    return by;
  };
  const parts = lines.filter((l) => !isTotal(l));
  for (const line of parts) {
    // Money written any other way (no cadence, no source, the currency first, a symbol) is refused.
    const money = (line.match(/\d ?[A-Z]{3}\b|\b[A-Z]{3} ?\d|[$€£]\s?\d/g) || []).length;
    const sourced = [...line.matchAll(c.amount)].length;
    if (money !== sourced) problems.push(`an amount without its cadence and source: ${line}`);
  }
  const given = sums(parts.join('\n'), c.amount);
  const total = sums(lines.filter(isTotal).join('\n'), c.bare);
  for (const key of [...new Set([...Object.keys(given), ...Object.keys(total)])].sort()) {
    if ((given[key] || 0) !== (total[key] || 0)) problems.push(`the ${c.label} line says ${total[key] || 0} ${key}, the parts add up to ${given[key] || 0} ${key}`);
  }
  return problems;
}

test('a bill the client already pays stays in the running cost, with its amount, its source and its cadence', () => {
  const nfc = (s) => s.normalize('NFC');
  const trd = nfc(readMarkdown(path.join(SKILL, 'references', 'trd.md')).replace(/\s+/g, ' '));
  for (const rule of [
    'A part **bought once and owned** (a server the client already owns) has no bill',
    'A part **already being paid for** (an existing subscription, a yearly renewal) is still a running cost',
    "never work out this project's share yourself",
    'A yearly bill is written as a yearly amount and stays one: never divide it into months.',
    'adds up only the amounts written above it, monthly and yearly apart, and names every part it does not count',
    'يبقى تكلفة تشغيل', 'ولا تحسب نصيب هذا المشروع بنفسك', 'ولا تُقسَّم على الأشهر', 'ويسمّي كل جزء لم يحسبه',
  ]) assert.ok(trd.includes(nfc(rule)), `trd.md must keep the rule: ${rule}`);
  assert.ok(!trd.includes('is written as that, with no amount. A price'), 'an already-paid part is no longer written with no amount');

  // The examples: the clinic's existing subscription and its yearly bill are counted; the timer pays nothing.
  for (const [folder, c] of [['cedar-clinic', COST.en], ['study-timer', COST.en], ['notes-digest', COST.en], ['cedar-clinic-ar', COST.ar]]) {
    assert.deepStrictEqual(costProblems(section(read(`${folder}/docs/trd.md`), c.heading), c), [], `${folder}: every amount has its source and the total adds up`);
  }
  for (const [folder, c, subscription] of [['cedar-clinic', COST.en, 'Microsoft 365'], ['cedar-clinic-ar', COST.ar, 'Microsoft 365']]) {
    const costs = section(read(`${folder}/docs/trd.md`), c.heading);
    const line = costs.split('\n').find((l) => l.includes(subscription)) || '';
    assert.strictEqual([...line.matchAll(c.amount)].length, 1, `${folder}: the existing subscription carries its amount and source`);
    const cadences = [...costs.matchAll(c.amount)].map((m) => c.cadence[m[3]]).sort();
    assert.deepStrictEqual(cadences, ['month', 'year'], `${folder}: one monthly bill and one yearly bill`);
  }

  // A made-up owner-supplied case: an owned server, an existing subscription, a yearly renewal.
  const ok = [
    '- The office server: bought and owned by the firm; no bill.',
    '- The accounting subscription: about 200 AED a month (from the owner, the September invoice); fixed.',
    '- The web address: about 90 AED a year (from the owner, the renewal notice); fixed.',
    '- **Each month:** about 200 AED a month, plus 90 AED a year, paid by the firm.',
  ].join('\n');
  assert.deepStrictEqual(costProblems(ok, COST.en), []);
  const wrong = [
    ['the existing subscription left out of the total', ok.replace('about 200 AED a month, plus 90 AED a year, paid', 'nothing new, plus 90 AED a year, paid')],
    ['the existing subscription written with no amount, and the total still claiming none', ok.replace('about 200 AED a month (from the owner, the September invoice); fixed', 'already paid for; fixed')],
    ['the yearly bill divided into months', ok.replace('about 200 AED a month, plus 90 AED a year, paid', 'about 207.50 AED a month, paid')],
    ['an amount with no source', ok.replace(' (from the owner, the September invoice)', '')],
    ['an amount with no cadence', ok.replace('about 200 AED a month (from', 'about 200 AED (from')],
    ['a price written the other way round', ok.replace('- The web address:', '- A text service: AED 999/month.\n- The web address:')],
    ['a total nobody gave', ok.replace('about 200 AED a month, plus', 'about 350 AED a month, plus')],
  ];
  for (const [what, doc] of wrong) assert.ok(costProblems(doc, COST.en).length > 0, `caught: ${what}`);

  // An existing bill whose amount nobody has yet stays open; nothing is filled in for it.
  const unknown = ok.replace('- The accounting subscription: about 200 AED a month (from the owner, the September invoice); fixed.', '- TBD: the cost of the accounting subscription. Decided when the owner finds the invoice.')
    .replace('about 200 AED a month, plus 90 AED a year, paid by the firm.', 'about 90 AED a year, paid by the firm; not counted: the accounting subscription.');
  assert.deepStrictEqual(openTbds(unknown, LANGS.en).map((t) => t.name), ['the cost of the accounting subscription']);
  assert.deepStrictEqual(costProblems(unknown, COST.en), [], 'the open bill is named, not priced');
});

// 0.7.0: the AI part. A product that uses an AI model says which model, what it may decide alone, what a
// person approves, what happens when it is wrong and how it is checked; a product with no AI says so in
// one line. This checks the shape; it cannot know whether the answers are the client's.
// `stillNone` is the reference's own sentence for a product with no AI, with or without its "None:" opening.
// The word "None"/"لا شيء" alone is not enough: in Arabic the two authority lines may begin with the same
// two words to say that nothing is done alone, or nothing waits for a person.
const AI = {
  en: { heading: 'AI part', none: /^- None: \S/, stillNone: /^(None: )?it uses no AI\b/, noLine: 'no line', source: '(from ', labels: ['Model', 'Decides alone', 'A person approves', 'When it is wrong', 'Checked by'] },
  ar: { heading: 'جزء الذكاء الاصطناعي', none: /^- لا شيء: \S/, stillNone: /^(لا شيء: )?لا يستخدم الذكاء الاصطناعي/, noLine: 'لا سطر', source: '(من ', labels: ['النموذج', 'يقرر وحده', 'يعتمده إنسان', 'عند الخطأ', 'يُفحص بـ'] },
};

// The AI part as it stands today, read through its history like every locked choice (decision record 0004).
// Each top-level line is a record with the Changed lines beneath it; collapsed historical records are left
// out. A Changed line "no line → …" only says how the line came to be; any other Changed line replaces the
// line's value with its target. Today the part is exactly one of:
//   - "no AI": one None line (or one named choice settled to "no AI"), and nothing else;
//   - undecided: one named open choice, and nothing else;
//   - uses AI: the five lines, each answered or with a named choice standing in its place.
// A value that is the bare TBD word is none of these, whether it was written that way or reached through a
// Changed line: reopening keeps the old record collapsed and puts a named TBD in its place (SKILL.md).
function aiProblems(ai, A, L) {
  const nfc = (s) => s.normalize('NFC');
  const records = [];
  const problems = [];
  for (const line of ai.replace(/<details data-project-docs-history>[\s\S]*?<\/details>/g, '').split('\n')) {
    if (line.startsWith('- ')) records.push({ line, history: [] });
    else if (line.startsWith('  - ') && records.length) records[records.length - 1].history.push(line);
  }
  if (!records.length) return ['the AI part is empty'];
  const isTbd = (value) => nfc(value.trim().replace(/\.$/, '')) === nfc(L.tbdToken);
  const isNone = (value) => A.stillNone.test(nfc(value.trim()));
  // The value a record holds today: its last replacing Changed target, or null when the line stands as written.
  const latest = (record) => {
    for (const h of record.history) if (!L.change.test(h)) problems.push(`a history line that is not in the fixed form: ${h.trim()}`);
    const changes = record.history.map((h) => h.match(L.change)).filter((c) => c && nfc(c[1].trim()) !== nfc(A.noLine));
    return changes.length ? changes[changes.length - 1][2].trim() : null;
  };
  const state = records.map((record) => {
    const now = latest(record);
    const labelled = record.line.match(/^- \*\*(.+?):\*\* (\S.*)$/);
    if (A.none.test(record.line)) {
      if (now === null || isNone(now)) return { kind: 'none' };
      // Reopened with a bare TBD: neither "no AI" nor a model, and no named choice to wait for.
      return isTbd(now) ? { kind: 'unfinished', what: 'the "no AI" line' } : { kind: 'replaced' };
    }
    // A named TBD line, as the reference writes it: open, settled or reopened through its Changed lines.
    if (L.tbdName.test(record.line)) return now !== null && isNone(now) ? { kind: 'none' } : { kind: 'choice', open: now === null || isTbd(now) };
    if (labelled) {
      const value = now === null ? labelled[2] : now;
      if (isTbd(value)) return { kind: 'unfinished', what: labelled[1], label: labelled[1] };
      return { kind: 'label', label: labelled[1], turnedNone: now !== null && isNone(now) };
    }
    return { kind: 'other', line: record.line };
  });
  for (const s of state) {
    if (s.kind === 'unfinished') problems.push(`${s.what}: a bare TBD names no open choice and nothing that will decide it`);
    if (s.kind === 'other') problems.push(`not a line of the AI part: ${s.line}`);
  }
  const live = state.filter((s) => s.kind !== 'replaced');
  if (live.some((s) => s.kind === 'none')) {
    if (live.length > 1) problems.push('a product with no AI has one line there and nothing else');
    return problems;
  }
  // Whether the product uses AI at all is still open: one named choice, alone.
  if (live.length === 1 && live[0].kind === 'choice' && live[0].open) return problems;
  const labels = state.filter((s) => s.kind === 'label' || (s.kind === 'unfinished' && s.label));
  for (const { label, turnedNone } of labels) {
    if (!A.labels.includes(label)) problems.push(`not a line of the AI part: ${label}`);
    if (turnedNone) problems.push(`${label}: one line says "no AI" while the others stand`);
  }
  for (const label of A.labels) if (labels.filter((s) => s.label === label).length > 1) problems.push(`written twice: ${label}`);
  // A line still open, or opened and later settled, is a named choice in its place; anything else missing is a gap.
  const missing = A.labels.filter((label) => !labels.some((s) => s.label === label));
  if (missing.length > state.filter((s) => s.kind === 'choice').length) problems.push(`missing, with no choice in its place: ${missing.join(', ')}`);
  // An accuracy figure is the person's, with where it came from, like a price.
  for (const { line, history } of records) for (const text of [line, ...history]) if (/\d\s?[%٪]/.test(text) && !text.includes(A.source)) problems.push(`an accuracy figure with no source: ${text}`);
  return problems;
}

test('the TRD has an AI part: five lines when the product uses AI, one line when it does not', () => {
  const nfc = (s) => s.normalize('NFC');
  const flat = (file) => nfc(readMarkdown(path.join(SKILL, 'references', file)).replace(/\s+/g, ' '));
  const trd = flat('trd.md');
  const plan = flat('plan.md');
  for (const [L, A, examples] of [[LANGS.en, AI.en, ['cedar-clinic', 'study-timer']], [LANGS.ar, AI.ar, ['cedar-clinic-ar']]]) {
    const shape = section(template('trd.md', L.templateHeading).join('\n'), A.heading);
    assert.deepStrictEqual(aiProblems(shape, A, L), [], `the ${A.heading} template has its five lines`);
    assert.deepStrictEqual(shape.split('\n').filter((l) => l.startsWith('- **')).length, 5);
    for (const folder of examples) {
      const ai = section(read(`${folder}/docs/trd.md`), A.heading);
      assert.match(ai, A.none, `${folder} uses no AI and says so`);
      assert.deepStrictEqual(aiProblems(ai, A, L), [], `${folder}: one line and nothing else`);
    }
    for (const label of [A.labels[4], A.labels[3]]) assert.ok(plan.includes(nfc(`**${label}**`)), `the Plan's check points at "${label}"`);
  }
  for (const rule of [
    'only when the product itself uses an AI model',
    'The AI tool that helps build the project is not this part.',
    'stay on its **Outside services** line, never repeated here.',
    '**Decides alone** and **A person approves** are never a default and never "you pick"',
    'Never promise that it will not be wrong.',
    'Never write an accuracy figure the person did not give.',
    'مدى تصرف الذكاء الاصطناعي دون إنسان مسؤولية العميل', 'ولا تعد بأنه لن يخطئ', 'ولا تكتب نسبة دقة لم يذكرها الشخص',
    'ولا يُكرَّر هنا',
  ]) assert.ok(trd.includes(nfc(rule)), `trd.md must keep the rule: ${rule}`);
  // The same four details, point for point, in English and in Arabic.
  for (const [en, ar] of [
    ["A model that runs on the project's own computer sends nothing outside: say so.", 'والنموذج الذي يعمل على حاسوب المشروع نفسه لا يرسل شيئًا إلى الخارج: اذكر ذلك.'],
    ['whether it acts alone or a person approves first, and who that person is.', 'هل يتصرف وحده أم يعتمده إنسان أولًا، ومن هو ذلك الإنسان.'],
    ['(that an answer came from AI, how to report a wrong one)', '(أن الجواب من الذكاء الاصطناعي، وكيف يبلّغ عن جواب خاطئ)'],
    ['(real questions with the answer the client accepts)', '(أسئلة حقيقية مع الجواب الذي يقبله العميل)'],
  ]) {
    assert.ok(trd.includes(nfc(en)), `trd.md must keep the detail: ${en}`);
    assert.ok(trd.includes(nfc(ar)), `the Arabic rules must keep the same detail: ${ar}`);
  }
  const tbd = nfc(readMarkdown(path.join(SKILL, 'references', 'trd.md')).split('## TBD: an honest gap')[1].split('\n## ')[0].replace(/\s+/g, ' '));
  assert.ok(tbd.includes('**The AI part** blocks only the steps that build or use it: the rest of the product can be built.'));
  // The check sits in the Plan's list of conditional checks, in both languages.
  const between = (text, start, end) => text.split(nfc(start))[1].split(nfc(end))[0];
  assert.ok(between(plan, 'An outside service is used', 'A tiny offline project').includes("An AI model is used (the TRD's **AI part** is not `None`)"));
  assert.ok(between(plan, 'يستخدم خدمة خارجية', 'لا تفرض على أداة صغيرة').includes(nfc('يستخدم نموذج ذكاء اصطناعي')));

  // A made-up product that uses AI: a help desk where the model drafts and staff send.
  const used = [
    '- **Model:** a hosted language model, reached through its Outside services line, because the owner already has an account.',
    '- **Decides alone:** sorts each new request into one of five queues.',
    '- **A person approves:** every reply before it is sent, by the help desk agent on duty.',
    '- **When it is wrong:** the agent corrects the draft before sending; a wrong queue is moved by hand and counted each week by the team lead.',
    '- **Checked by:** forty past requests with the reply the team lead accepts, kept by the team lead, run before go-live and after any change of the model or its instructions.',
  ].join('\n');
  assert.deepStrictEqual(aiProblems(used, AI.en, LANGS.en), []);
  const wrong = [
    ['what it may decide alone left out', used.split('\n').filter((l) => !l.startsWith('- **Decides alone')).join('\n')],
    ['who approves left out', used.split('\n').filter((l) => !l.startsWith('- **A person approves')).join('\n')],
    ['no word on wrong answers', used.split('\n').filter((l) => !l.startsWith('- **When it is wrong')).join('\n')],
    ['no examples to check it by', used.split('\n').filter((l) => !l.startsWith('- **Checked by')).join('\n')],
    ['"no AI" written above a model', `- None: it uses no AI.\n${used}`],
    ['a line the AI part does not have', `${used}\n- **Accuracy:** very high.`],
    ['an accuracy figure nobody gave', used.replace('run before go-live', 'right 95% of the time, run before go-live')],
    ['an empty part', ''],
  ];
  for (const [what, doc] of wrong) assert.ok(aiProblems(doc, AI.en, LANGS.en).length > 0, `caught: ${what}`);
  // How far it may go is still open: one TBD in the line's place, nothing filled in for the client.
  const open = used.replace('- **Decides alone:** sorts each new request into one of five queues.', '- TBD: what the AI may decide alone. Decided when the help desk manager has agreed it with the team lead.');
  assert.deepStrictEqual(openTbds(open, LANGS.en).map((t) => t.name), ['what the AI may decide alone']);
  assert.deepStrictEqual(aiProblems(open, AI.en, LANGS.en), [], 'an open line is a TBD, not a gap');
  assert.deepStrictEqual(aiProblems(used.replace('run before go-live', 'right 95% of the time (from the team lead, the March trial), run before go-live'), AI.en, LANGS.en), [], 'a figure the person gave, with its source, is kept');
});

// 0.7.0, review round 2: the AI part is judged as it stands today. A bare "TBD" is not an answer, a line
// written twice is not five lines, an old "no AI" does not excuse a model added later, and a choice that
// was open and then settled counts as answered. English and Arabic, with the controls that must still pass.
const AI_CASES = [
    { L: LANGS.en, A: AI.en,
      used: [
        '- **Model:** a hosted language model, reached through its Outside services line, because the owner already has an account.',
        '- **Decides alone:** sorts each new request into one of five queues.',
        '- **A person approves:** every reply before it is sent, by the help desk agent on duty.',
        '- **When it is wrong:** the agent corrects the draft before sending; a wrong queue is moved by hand.',
        '- **Checked by:** forty past requests with the reply the team lead accepts, run before go-live and after any change.',
      ],
      bare: 'TBD', decides: '- **Decides alone:**',
      none: '- None: it uses no AI.',
      upgraded: '  - Changed 2026-11-16: no line → it uses no AI, because v1, approved 2026-10-08, was written before this line was asked.',
      toModel: "  - Changed 2026-11-17: it uses no AI → a local model on the student's computer, because the student added AI sorting.",
      backToNone: '  - Changed 2026-11-18: a local model on the student\'s computer → it uses no AI, because the student removed it.',
      tbd: '- TBD: what the AI may decide alone. Decided when the manager agrees its authority.',
      name: 'what the AI may decide alone',
      settled: '  - Changed 2026-11-16: TBD → M1: assigns each request to a queue, because the manager approved that authority.',
      reopened: '  - Changed 2026-11-20: M1: assigns each request to a queue → TBD, because the manager withdrew it.',
      label: 'Model' },
    { L: LANGS.ar, A: AI.ar,
      used: [
        '- **النموذج:** نموذج لغوي مستضاف، يُوصل إليه عبر سطره في الخدمات الخارجية، لأن المالك لديه حساب أصلًا.',
        '- **يقرر وحده:** يصنّف كل طلب جديد في واحدة من خمس قوائم.',
        '- **يعتمده إنسان:** كل رد قبل إرساله، ويعتمده موظف الدعم المناوب.',
        '- **عند الخطأ:** يصحّح الموظف المسودة قبل الإرسال؛ والطلب في القائمة الخطأ يُنقل يدويًا.',
        '- **يُفحص بـ:** أربعون طلبًا سابقًا مع الرد الذي يقبله قائد الفريق، وتُعاد قبل الإطلاق وبعد أي تغيير.',
      ],
      bare: 'لم يُحسم بعد', decides: '- **يقرر وحده:**',
      none: '- لا شيء: لا يستخدم الذكاء الاصطناعي.',
      upgraded: '  - تغيّر في 2026-11-16: من لا سطر إلى لا يستخدم الذكاء الاصطناعي، لأن الإصدار 1 المعتمد 2026-10-08 كُتب قبل طلب هذا السطر.',
      toModel: '  - تغيّر في 2026-11-17: من لا يستخدم الذكاء الاصطناعي إلى نموذج محلي على حاسوب الطالب، لأن الطالب أضاف تصنيفًا بالذكاء الاصطناعي.',
      backToNone: '  - تغيّر في 2026-11-18: من نموذج محلي على حاسوب الطالب إلى لا يستخدم الذكاء الاصطناعي، لأن الطالب أزاله.',
      tbd: '- لم يُحسم بعد: ما يقرره الذكاء الاصطناعي وحده. يُحسم عندما يوافق المدير على صلاحيته.',
      name: 'ما يقرره الذكاء الاصطناعي وحده',
      settled: '  - تغيّر في 2026-11-16: من لم يُحسم بعد إلى M1: يوزّع كل طلب على قائمة، لأن المدير اعتمد هذه الصلاحية.',
      reopened: '  - تغيّر في 2026-11-20: من M1: يوزّع كل طلب على قائمة إلى لم يُحسم بعد، لأن المدير سحبها.',
      label: 'النموذج' },
];

test('the AI part is read through its history: bare TBDs, repeats and a replaced "no AI" are caught', () => {
  for (const { L, A, used, bare, decides, none, upgraded, toModel, backToNone, tbd, name, settled, reopened, label } of AI_CASES) {
    const lang = L === LANGS.ar ? 'ar' : 'en';
    const five = used.join('\n');
    const check = (doc) => aiProblems(doc, A, L);
    const withDecides = (lines) => used.map((l) => (l.startsWith(decides) ? lines : l)).join('\n');
    for (const line of [upgraded, toModel, backToNone, settled, reopened]) assert.match(line, L.changed, `${lang}: the history line is in the fixed form`);
    assert.match(tbd, L.tbd, `${lang}: the open choice is in the fixed form`);

    // Controls that must keep passing.
    assert.deepStrictEqual(check(five), [], `${lang}: five answered lines`);
    assert.deepStrictEqual(check(none), [], `${lang}: an untouched "no AI"`);
    assert.deepStrictEqual(check(`${none}\n${upgraded}`), [], `${lang}: "no AI" added by an upgrade`);

    // F01: a bare TBD is not an answer, and a line written twice is not five lines.
    const allBare = A.labels.map((l) => `- **${l}:** ${bare}`).join('\n');
    assert.strictEqual(openTbds(allBare, L).length, 0, `${lang}: bare TBDs name no open choice`);
    assert.strictEqual(check(allBare).length, 5, `${lang}: five bare TBDs are five problems`);
    assert.ok(check(withDecides(`${decides} ${bare}.`)).length > 0, `${lang}: one bare TBD among four answers`);
    assert.ok(check(`${five}\n${used[0]}`).length > 0, `${lang}: ${label} written twice`);
    assert.ok(check(withDecides(`${decides} `)).length > 0, `${lang}: an empty labelled value`);

    // F02: "no AI" replaced by a model through a Changed line no longer excuses the five lines.
    assert.ok(check(`${none}\n${upgraded}\n${toModel}`).length > 0, `${lang}: a model added under an old "no AI", with no answers`);
    assert.deepStrictEqual(check(`${none}\n${upgraded}\n${toModel}\n${five}`), [], `${lang}: the same, now with its five lines`);
    assert.deepStrictEqual(check(`${none}\n${toModel}\n${backToNone}`), [], `${lang}: a model added and then removed again is "no AI" today`);
    assert.ok(check(`${none}\n${toModel}\n${backToNone}\n${five}`).length > 0, `${lang}: "no AI" today, but five lines still standing`);

    // F02: an open choice, a settled one and a reopened one each stand in for their line.
    const open = withDecides(tbd);
    assert.deepStrictEqual(openTbds(open, L).map((t) => t.name), [name], `${lang}: the open choice is found by its name`);
    assert.deepStrictEqual(check(open), [], `${lang}: an open choice in the line's place`);
    const closed = withDecides(`${tbd}\n${settled}`);
    assert.deepStrictEqual(openTbds(closed, L), [], `${lang}: the settled choice is no longer open`);
    assert.deepStrictEqual(check(closed), [], `${lang}: a settled choice counts as answered`);
    const again = withDecides(`${tbd}\n${settled}\n${reopened}`);
    assert.strictEqual(openTbds(again, L).length, 1, `${lang}: reopened, it is open again`);
    assert.deepStrictEqual(check(again), [], `${lang}: a reopened choice still stands in for its line`);
    assert.ok(check(used.filter((l) => !l.startsWith(decides)).join('\n')).length > 0, `${lang}: the line simply left out`);

    // F02: an old "no AI" kept as a collapsed historical record does not excuse today's lines, and does not block them.
    const archived = `<details data-project-docs-history>\n<summary>${label}</summary>\n\n${none}\n${toModel}\n\n</details>\n`;
    assert.deepStrictEqual(check(`${archived}${closed}`), [], `${lang}: history archived, today's lines complete`);
    assert.ok(check(`${archived}${used.slice(0, 2).join('\n')}`).length > 0, `${lang}: history archived, today's lines incomplete`);
    assert.ok(check(archived).length > 0, `${lang}: only an archived record is an empty AI part`);
  }

  // The real examples still read as "no AI" today, and the Study Timer with a model added under it is caught.
  const timer = section(read('study-timer/docs/trd.md'), AI.en.heading);
  assert.deepStrictEqual(aiProblems(timer, AI.en, LANGS.en), []);
  const changed = `${timer.trimEnd()}\n  - Changed 2026-11-17: it uses no AI → a local model on the student's computer, because the student added AI sorting.\n`;
  assert.ok(aiProblems(changed, AI.en, LANGS.en).length > 0, 'the Study Timer with a model added and no answers');
});

// 0.7.0, review round 3: every state the AI part can be in today. An answer or a "no AI" reopened with a
// bare "→ TBD" is unfinished: the skill's own reopening keeps the old line and its history in a collapsed
// record and puts a named TBD, with what will decide it, in its place. Until then it is neither answered
// nor "no AI". The same cases in English and in Arabic.
const AI_REOPEN = {
  en: {
    toTbd: '  - Changed 2026-11-16: the answer above → TBD, because the owner reopened the decision.',
    tbdToAnswer: '  - Changed 2026-11-21: TBD → sorts requests only, because the manager decided.',
    toOther: '  - Changed 2026-11-19: the answer above → sorts requests and closes duplicates, because the manager widened it.',
    toNone: '  - Changed 2026-11-23: the answer above → it uses no AI, because the owner removed it.',
    noneToTbd: '  - Changed 2026-11-16: it uses no AI → TBD, because the owner reopened the AI decision.',
    tbdToNone: '  - Changed 2026-11-22: TBD → it uses no AI, because the owner decided against it.',
    tbdToModel: '  - Changed 2026-11-22: TBD → a local model on the office computer, because the owner chose it.',
    whole: '- TBD: whether the product uses AI. Decided when the owner has tried the prototype.',
    wholeName: 'whether the product uses AI',
    other: '- It also summarises long requests.',
    malformed: '  - Changed 2026-11-16: it uses no AI => a local model',
    openFor: (label) => `- TBD: the ${label} line of the AI part. Decided when the owner has met the team lead.`,
  },
  ar: {
    toTbd: '  - تغيّر في 2026-11-16: من الجواب أعلاه إلى لم يُحسم بعد، لأن المالك أعاد فتح القرار.',
    tbdToAnswer: '  - تغيّر في 2026-11-21: من لم يُحسم بعد إلى يصنّف الطلبات فقط، لأن المدير قرر ذلك.',
    toOther: '  - تغيّر في 2026-11-19: من الجواب أعلاه إلى يصنّف الطلبات ويغلق المكرر منها، لأن المدير وسّعه.',
    toNone: '  - تغيّر في 2026-11-23: من الجواب أعلاه إلى لا يستخدم الذكاء الاصطناعي، لأن المالك أزاله.',
    noneToTbd: '  - تغيّر في 2026-11-16: من لا يستخدم الذكاء الاصطناعي إلى لم يُحسم بعد، لأن المالك أعاد فتح قرار الذكاء الاصطناعي.',
    tbdToNone: '  - تغيّر في 2026-11-22: من لم يُحسم بعد إلى لا يستخدم الذكاء الاصطناعي، لأن المالك قرر عدم استخدامه.',
    tbdToModel: '  - تغيّر في 2026-11-22: من لم يُحسم بعد إلى نموذج محلي على حاسوب المكتب، لأن المالك اختاره.',
    whole: '- لم يُحسم بعد: هل يستخدم المنتج الذكاء الاصطناعي. يُحسم عندما يجرّب المالك النموذج الأولي.',
    wholeName: 'هل يستخدم المنتج الذكاء الاصطناعي',
    other: '- ويلخّص أيضًا الطلبات الطويلة.',
    malformed: '  - تغيّر في 2026-11-16: من لا يستخدم الذكاء الاصطناعي => نموذج محلي',
    openFor: (label) => `- لم يُحسم بعد: سطر ${label} في جزء الذكاء الاصطناعي. يُحسم عندما يلتقي المالك بقائد الفريق.`,
  },
};

test('the AI part today is "no AI", five lines, or a named open choice: a bare reopening is none of them', () => {
  for (const { L, A, used, decides, none, upgraded } of AI_CASES) {
    const lang = L === LANGS.ar ? 'ar' : 'en';
    const R = AI_REOPEN[lang];
    const five = used.join('\n');
    const check = (doc) => aiProblems(doc, A, L);
    const decidesLine = used.find((l) => l.startsWith(decides));
    const withDecides = (lines) => used.map((l) => (l.startsWith(decides) ? lines : l)).join('\n');
    const archive = (lines) => `<details data-project-docs-history>\n<summary>${A.heading}</summary>\n\n${lines}\n\n</details>\n`;
    for (const key of ['toTbd', 'tbdToAnswer', 'toOther', 'toNone', 'noneToTbd', 'tbdToNone', 'tbdToModel']) assert.match(R[key], L.changed, `${lang}: ${key} is in the fixed form`);
    assert.match(R.whole, L.tbd, `${lang}: the whole-part choice is in the fixed form`);
    assert.doesNotMatch(R.malformed, L.changed, `${lang}: the malformed line is not in the fixed form`);

    // F01: an answer reopened with a bare "→ TBD" is not an answer.
    assert.ok(check(withDecides(`${decidesLine}\n${R.toTbd}`)).length > 0, `${lang}: one answer reopened with a bare TBD`);
    assert.ok(check(used.map((l) => `${l}\n${R.toTbd}`).join('\n')).length >= 5, `${lang}: all five answers reopened with a bare TBD`);
    // The skill's own reopening: the old line and its history collapsed, a named TBD in its place.
    const reopenedOne = `${archive(`${decidesLine}\n${R.toTbd}`)}${withDecides(R.openFor(A.labels[1]))}`;
    assert.deepStrictEqual(check(reopenedOne), [], `${lang}: one answer reopened the skill's way`);
    assert.strictEqual(openTbds(reopenedOne, L).length, 1, `${lang}: and it is found open, once`);
    const reopenedAll = `${archive(used.map((l) => `${l}\n${R.toTbd}`).join('\n'))}${A.labels.map(R.openFor).join('\n')}`;
    assert.deepStrictEqual(check(reopenedAll), [], `${lang}: all five reopened the skill's way`);
    assert.strictEqual(openTbds(reopenedAll, L).length, 5, `${lang}: and five choices are open`);
    // An answer that was changed, or reopened and then answered again, is answered today.
    assert.deepStrictEqual(check(withDecides(`${decidesLine}\n${R.toOther}`)), [], `${lang}: an answer changed to another answer`);
    assert.deepStrictEqual(check(withDecides(`${decidesLine}\n${R.toTbd}\n${R.tbdToAnswer}`)), [], `${lang}: reopened, then answered again`);
    assert.ok(check(withDecides(`${decidesLine}\n${R.toOther}\n${R.toTbd}`)).length > 0, `${lang}: changed, then reopened with a bare TBD`);
    // One line changed to "no AI" while the others stand says two things at once.
    assert.ok(check(withDecides(`${decidesLine}\n${R.toNone}`)).length > 0, `${lang}: one line turned into "no AI" beside four answers`);

    // Review round 4: "nothing" as the answer of one line is not "the product uses no AI". The template
    // itself offers it for the two authority lines; in Arabic both begin with the same two words as "None".
    const shape = template('trd.md', L.templateHeading);
    for (const index of [1, 2]) {
      const field = A.labels[index];
      const placeholder = shape.find((l) => l.startsWith(`- **${field}:** <`));
      const nothing = placeholder.slice(placeholder.lastIndexOf(' / ') + 3, -1);
      const line = used.find((l) => l.startsWith(`- **${field}:**`));
      const withField = (lines) => used.map((l) => (l === line ? lines : l)).join('\n');
      const changedTo = R.toOther.replace(R.toOther.match(L.change)[2], nothing);
      const settledTo = R.tbdToAnswer.replace(R.tbdToAnswer.match(L.change)[2], nothing);
      for (const history of [changedTo, settledTo]) assert.match(history, L.changed, `${lang}: the history line for "${nothing}" is in the fixed form`);
      assert.strictEqual(changedTo.match(L.change)[2], nothing, `${lang}: the changed line ends at the template's own words`);
      assert.deepStrictEqual(check(withField(`- **${field}:** ${nothing}`)), [], `${lang}: ${field} written as "${nothing}"`);
      assert.deepStrictEqual(check(withField(`${line}\n${changedTo}`)), [], `${lang}: ${field} changed to "${nothing}"`);
      assert.deepStrictEqual(check(withField(`${R.openFor(field)}\n${settledTo}`)), [], `${lang}: an open ${field} settled to "${nothing}"`);
      assert.deepStrictEqual(check(withField(`${line}\n${R.toTbd}\n${settledTo}`)), [], `${lang}: ${field} reopened in place, then settled to "${nothing}"`);
      // A real "no AI" in the same places is still two things at once.
      assert.ok(check(withField(`${line}\n${R.toNone}`)).length > 0, `${lang}: ${field} changed to "no AI" beside the other lines`);
      assert.ok(check(withField(`${R.openFor(field)}\n${R.tbdToNone}`)).length > 0, `${lang}: an open ${field} settled to "no AI" beside the other lines`);
    }

    // F02: "no AI" reopened with a bare "→ TBD" is unresolved, not "no AI".
    assert.ok(check(`${none}\n${R.noneToTbd}`).length > 0, `${lang}: "no AI" reopened with a bare TBD`);
    assert.ok(check(`${none}\n${upgraded}\n${R.noneToTbd}`).length > 0, `${lang}: the same after an upgrade line`);
    assert.ok(check(`${none}\n${R.noneToTbd}\n${five}`).length > 0, `${lang}: the same with five lines beside it`);
    assert.strictEqual(openTbds(`${none}\n${R.noneToTbd}`, L).length, 1, `${lang}: the unresolved record is seen as open`);
    // The skill's own reopening of "no AI": history collapsed, one named choice for the whole part.
    const wholeOpen = `${archive(`${none}\n${R.noneToTbd}`)}${R.whole}`;
    assert.deepStrictEqual(check(wholeOpen), [], `${lang}: whether it uses AI is open, the skill's way`);
    assert.deepStrictEqual(openTbds(wholeOpen, L).map((t) => t.name), [R.wholeName], `${lang}: and found by its name`);
    assert.deepStrictEqual(check(R.whole), [], `${lang}: a new product that has not decided yet`);
    // That choice settled: "no AI" stands alone; a model needs the other four lines.
    assert.deepStrictEqual(check(`${R.whole}\n${R.tbdToNone}`), [], `${lang}: decided: no AI`);
    assert.ok(check(`${R.whole}\n${R.tbdToNone}\n${five}`).length > 0, `${lang}: decided no AI, with five lines still standing`);
    assert.ok(check(`${R.whole}\n${R.tbdToModel}`).length > 0, `${lang}: decided on a model, the other four lines missing`);
    assert.deepStrictEqual(check(`${R.whole}\n${R.tbdToModel}\n${used.slice(1).join('\n')}`), [], `${lang}: decided on a model, with its other four lines`);
    // Reopened in place and then decided again: what counts is today.
    assert.deepStrictEqual(check(`${none}\n${R.noneToTbd}\n${R.tbdToNone}`), [], `${lang}: reopened and decided "no AI" again`);
    assert.ok(check(`${none}\n${R.noneToTbd}\n${R.tbdToModel}`).length > 0, `${lang}: reopened and decided on a model, with no answers`);

    // Anything else under the heading is not part of it.
    assert.ok(check(`${five}\n${R.other}`).length > 0, `${lang}: an unlabelled line beside the five`);
    assert.ok(check(`${none}\n${R.malformed}`).length > 0, `${lang}: a history line that is not in the fixed form`);
    assert.ok(check(`${five}\n${R.whole}`).length === 0, `${lang}: five answers and one more open question is still complete`);
  }

  // The real example, with the owner reopening its "no AI" in place.
  const timer = section(read('study-timer/docs/trd.md'), AI.en.heading);
  assert.ok(aiProblems(`${timer.trimEnd()}\n${AI_REOPEN.en.noneToTbd}\n`, AI.en, LANGS.en).length > 0, 'the Study Timer with "no AI" reopened by a bare TBD');
});

// 0.7.1: Notes Digest, the example whose product uses an AI model. Its documents must agree with each other:
// the model is one outside service, the AI part has its five lines, the model's bill is in the running cost,
// and the Plan runs the examples and tries a wrong answer where the reference says.
// The Model line names a model: the words before its first comma, and those same words name the outside service.
function modelProblems(trd) {
  const model = ((section(trd, AI.en.heading).match(/^- \*\*Model:\*\* ([^,]+),/m) || [])[1] || '').trim();
  const name = model.split(' from ')[0];
  if (!model || /^(the|a|an) /i.test(model)) return [`the Model line describes a model without naming it: "${model}"`];
  const services = section(trd, 'Outside services').split('\n').filter((l) => l.startsWith('- '));
  return services.some((l) => l.startsWith(`- ${name}, `) || l.startsWith(`- ${name}: `)) ? [] : [`no Outside services line is named "${name}"`];
}

// The Plan's AI checks, where the Plan guide puts them: the step that first connects the model tries the
// service failure; the step that first builds the AI part runs the kept examples and tries a wrong answer;
// every later step that covers the AI part runs the examples again and compares everything they hold.
function aiPlanProblems(steps) {
  const problems = [];
  const title = (step) => step.split('\n')[0];
  const covers = (step, what) => ((step.match(/^- \*\*Covers:\*\* (.+)$/m) || [])[1] || '').split(', ').includes(what);
  const ai = steps.filter((s) => covers(s, 'TRD: AI part'));
  if (!ai.length) return ['no step covers the AI part'];
  const first = ai[0];
  if (!covers(first, 'TRD: Outside services')) problems.push(`"${title(first)}" first uses the model but does not cover its Outside services line`);
  if (!first.includes('(TRD: Outside services)') || !/unavailable/.test(first)) problems.push(`"${title(first)}" connects the model but does not try the service being unavailable`);
  if (!first.includes('(TRD: Checked by)')) problems.push(`"${title(first)}" first builds the AI part but does not run the kept examples`);
  if (!first.includes('(TRD: When it is wrong)')) problems.push(`"${title(first)}" first lets the AI act but does not try a wrong answer`);
  for (const step of ai.slice(1)) {
    if (!step.includes('(TRD: Checked by)')) problems.push(`"${title(step)}" changes the AI part but does not run the kept examples again`);
    else if (!/compare both the summaries and the actions/.test(step)) problems.push(`"${title(step)}" reruns the examples but does not compare everything they hold`);
  }
  return problems;
}

test('the Notes Digest example shows a product that uses AI, and its documents agree', () => {
  const L = LANGS.en;
  const doc = (name) => read(`notes-digest/docs/${name}`);
  const trd = doc('trd.md');
  const ai = section(trd, AI.en.heading);
  assert.doesNotMatch(ai, AI.en.none, 'this example uses AI');
  assert.deepStrictEqual(aiProblems(ai, AI.en, L), []);
  const line = (label) => ai.split('\n').find((l) => l.startsWith(`- **${label}:** `)) || '';
  assert.deepStrictEqual(AI.en.labels.filter((label) => !line(label)), [], 'all five lines are answered, none left open');
  assert.deepStrictEqual(openTbds(trd, L), [], 'nothing in this TRD is open');

  // A hosted model is one outside service, with what is sent, what comes back and what happens when it is down;
  // the Model line points there instead of repeating it.
  const services = section(trd, 'Outside services').split('\n').filter((l) => l.startsWith('- '));
  assert.strictEqual(services.length, 1, 'the model is the only outside service');
  for (const word of ['sends ', 'expects ', 'if unavailable', ', because ']) assert.ok(services[0].includes(word), `the service line says "${word.trim()}"`);
  assert.ok(line('Model').includes('Outside services'), 'the Model line points at the Outside services line');
  // Which model is a locked choice: the Model line names it, and the same name is the outside service.
  assert.deepStrictEqual(modelProblems(trd), []);
  const [model, provider] = ['Quill 2', 'Harborline'];
  assert.ok(line('Model').startsWith(`- **Model:** ${model} from ${provider},`), 'the Model line begins with the model and its provider');
  assert.ok(services[0].startsWith(`- ${model}, `) && services[0].includes(provider) && services[0].includes('made-up names'), 'the service line names the same model and provider, and says the names are made up');
  const original = trd.replace(line('Model'), '- **Model:** the hosted language model named under Outside services, running on its provider\'s servers, because the team lead already has an account there.');
  assert.ok(modelProblems(original).length > 0, 'caught: a model described but never named');
  assert.ok(modelProblems(trd.replace(services[0], services[0].replace(`${model}, `, 'A model, '))).length > 0, 'caught: the Model line naming a model the service line does not');
  assert.ok(!/\bsends\b/.test(ai), 'what is sent is not repeated in the AI part');
  // The client's answers: something it does alone, something a person approves, and how the examples are kept and rerun.
  assert.ok(!/^- \*\*Decides alone:\*\* Nothing/m.test(ai) && !/^- \*\*A person approves:\*\* Nothing/m.test(ai), 'both authority lines hold a real answer');
  for (const word of ['kept by', 'after any change of the model or its instructions']) assert.ok(line('Checked by').includes(word), `Checked by says "${word}"`);
  assert.doesNotMatch(ai, /\d\s?%/, 'no accuracy figure');

  // A model charged by use is a running cost, with the person's amount and its source.
  const costs = section(trd, COST.en.heading);
  assert.deepStrictEqual(costProblems(costs, COST.en), []);
  assert.strictEqual([...costs.matchAll(COST.en.amount)].length, 1, 'one sourced amount');
  assert.ok(/language model: about .+ a month \(from /.test(costs) && costs.includes('charged by use'), 'the model is the paid part, charged by use');

  // Security names the same service and what it receives; the key is a secret; the connection is protected.
  const security = doc('security.md');
  assert.ok(section(security, 'Outside services').startsWith(`- ${model}, `) && section(security, 'Outside services').includes('language model: receives'), 'Security names the same model and what it receives');
  assert.ok(section(security, 'Secrets').includes('never in the code and never in git'));
  // The PRD tells the user the answer came from AI, and the Plan carries the AI checks where the reference puts them.
  assert.match(section(doc('prd.md'), L.s.must), /^- \*\*M\d+\.\*\* .*written by AI/m, 'a must-do line says the user is told it came from AI');
  const steps = section(doc('plan.md'), L.s.steps).split('\n### ').slice(1);
  const usesAi = steps.filter((s) => s.includes('TRD: AI part'));
  assert.ok(usesAi.length >= 2 && usesAi[0] === steps[0], 'the first step builds the AI part');
  // Each check sits in the step that first needs it, and a changed instruction reruns both outputs.
  assert.deepStrictEqual(aiPlanProblems(steps), []);
  assert.ok(steps.some((s) => s.includes('Security: How it\'s protected') && s.includes('ignore your instructions')), 'a step runs notes that try to steer the model');
  const plan = doc('plan.md');
  const stepsOf = (text) => section(text, L.s.steps).split('\n### ').slice(1);
  const wrongAnswer = ' Read one digest against its notes and correct a wrong summary line before copying it (TRD: When it is wrong).';
  const failure = ' Run it with the network off; one line says the service is unavailable and nothing else is printed (TRD: Outside services).';
  for (const piece of [wrongAnswer, failure]) assert.strictEqual(plan.split(piece).length, 2, 'the sentence is in the plan once');
  const lastCheck = 'with its first line saying it was written by AI.';
  const misplaced = [
    ['the wrong-answer try moved to the last step', plan.replace(wrongAnswer, '').replace(lastCheck, `${lastCheck}${wrongAnswer}`)],
    ['the wrong-answer try left out of the first step', plan.replace(wrongAnswer, '')],
    ['the service failure tried only in the last step', plan.replace(failure, '').replace(lastCheck, `${lastCheck}${failure}`)],
    ['the kept examples not run when the AI is first built', plan.replace(' Run the ten kept notes files (TRD: Checked by) and compare each summary with the one the team lead accepts.', '')],
    ['the rerun comparing only the actions', plan.replace('compare both the summaries and the actions with the accepted ones', 'compare the actions with the accepted ones')],
    ['the rerun left out after the instructions changed', plan.replace(' The instructions changed, so run the ten kept notes files again (TRD: Checked by) and compare both the summaries and the actions with the accepted ones.', '')],
  ];
  for (const [what, text] of misplaced) {
    assert.notStrictEqual(text, plan, `the changed plan really differs: ${what}`);
    assert.ok(aiPlanProblems(stepsOf(text)).length > 0, `caught: ${what}`);
  }

  // Each of these is caught when the example loses it.
  const without = (label) => ai.split('\n').filter((l) => !l.startsWith(`- **${label}:** `)).join('\n');
  for (const label of AI.en.labels) assert.ok(aiProblems(without(label), AI.en, L).length > 0, `caught: the example without ${label}`);
  assert.ok(costProblems(costs.replace(/ \(from [^)]+\)/, ''), COST.en).length > 0, 'caught: the amount without its source');
  assert.ok(costProblems(costs.replace('about 4 USD a month, paid', 'nothing, paid'), COST.en).length > 0, 'caught: the model left out of the total');
  assert.ok(costProblems(costs.replace('about 4 USD a month (from', 'about 4 AED a month (from'), COST.en).length > 0, 'caught: the part in one currency and the total in another');
  // What is sent to the model is said once in the TRD and Security repeats it, not something else.
  const sent = 'the text of the one notes file and the instructions';
  assert.ok(services[0].includes(`sends ${sent}`) && section(security, 'Outside services').includes(`receives ${sent}`), 'the TRD and Security agree on what the model is given');
});

// The clinic's release step (step 10), as its two lines.
function stepLines(plan, number, L) {
  const step = section(plan, L.s.steps).split('\n### ').slice(1).find((s) => new RegExp(`^\\S+ ${number}: `).test(s)) || '';
  const line = (label) => step.split('\n').find((l) => l.startsWith(`- **${label}:**`)) || '';
  return { covers: line(L.covers), how: line(L.how) };
}

// The release step itself must cover the TRD's code location, name that same place, and ask for a
// version and a dated changelog line. A token elsewhere in the plan does not count.
function releaseCheckProblems(plan, trd, W, L) {
  const nfc = (s) => s.normalize('NFC');
  const { covers, how } = stepLines(nfc(plan), 10, L);
  const kept = (nfc(trd).match(new RegExp(`^- \\*\\*${nfc(W.label)}:\\*\\* (.+)$`, 'm')) || [])[1] || '';
  const problems = [];
  if (!covers.includes('TRD:') || !covers.includes(nfc(W.label))) problems.push('the release step does not cover the TRD code location');
  if (!how.includes(nfc(W.version))) problems.push('the release check gives the release no version');
  if (!how.includes(nfc(W.dated))) problems.push('the release check has no dated changelog line');
  if (!kept.includes(nfc(W.place)) || !how.includes(nfc(W.place))) problems.push('the release check and the TRD do not name the same place');
  return problems;
}

test('the clinic release step itself carries the version, the dated changelog line and the TRD code location', () => {
  const cases = [
    { folder: 'cedar-clinic', L: LANGS.en, protoTitle: 'Step 2: Prototype',
      W: { label: 'Kept in', version: 'Give the release a version', dated: 'a dated line in `CHANGELOG.md`', place: "the clinic's own git repository" } },
    { folder: 'cedar-clinic-ar', L: LANGS.ar, protoTitle: 'الخطوة 2: النموذج الأولي',
      W: { label: 'مكان الكود', version: 'أعطِ الإصدار رقمًا', dated: 'وسطرًا مؤرّخًا في `CHANGELOG.md`', place: 'مستودع git الخاص بالعيادة' } },
  ];
  for (const { folder, L, W, protoTitle } of cases) {
    const plan = read(`${folder}/docs/plan.md`).normalize('NFC'), trd = read(`${folder}/docs/trd.md`);
    assert.deepStrictEqual(releaseCheckProblems(plan, trd, W, L), [], `${folder}: the real example`);
    // The sentence moved out of the release check into the Prototype title is caught.
    const sentence = plan.slice(plan.indexOf(W.version.normalize('NFC')), plan.indexOf(W.place.normalize('NFC')) + W.place.normalize('NFC').length);
    assert.ok(sentence.includes('`CHANGELOG.md`') && plan.includes(protoTitle.normalize('NFC')), `${folder}: the mutation can be made`);
    const moved = plan.replace(sentence, '').replace(protoTitle.normalize('NFC'), `${protoTitle.normalize('NFC')} ${sentence}`);
    assert.ok(moved.includes('`CHANGELOG.md`'));
    assert.ok(releaseCheckProblems(moved, trd, W, L).length >= 3, `${folder}: a changelog token outside the release check does not count`);
    // The release step no longer covering the code location is caught, and so is a TRD naming another place.
    assert.ok(releaseCheckProblems(plan.replace(new RegExp(`[,،] ${W.label.normalize('NFC')}`), ''), trd, W, L).length > 0, `${folder}: Covers`);
    assert.ok(releaseCheckProblems(plan, trd.normalize('NFC').replace(W.place.normalize('NFC'), 'GitHub'), W, L).length > 0, `${folder}: the place`);
  }
});

// What a TRD lacks under today's template: the AI part heading, and the fixed bold lines. The AI part's
// own five lines are not fixed lines: a product with no AI has one "None" line there instead (aiProblems).
function trdUpgradeGaps(trd, L) {
  const A = L === LANGS.ar ? AI.ar : AI.en;
  const labels = (lines) => lines.map((l) => (l.match(/^- \*\*(.+?):\*\* /) || [])[1]).filter(Boolean);
  const have = labels(trd.split('\n'));
  const fixed = labels(template('trd.md', L.templateHeading)).filter((label) => !A.labels.includes(label));
  return [...(trd.includes(`\n## ${A.heading}\n`) ? [] : [A.heading]), ...fixed.filter((label) => !have.includes(label))];
}

// Upgrading an approved document that lacks a newer fixed line: keep every line, add the missing line with
// the earlier approval kept beneath it, raise the version, and wait as a Draft. Never a new approval.
function upgradeProblems(before, after, L) {
  const stampOf = (doc) => doc.split('\n')[1];
  const version = (doc) => Number((stampOf(doc).match(/^> v(\d+) · /) || [])[1]);
  const approved = (stampOf(before).match(/Approved (\d{4}-\d{2}-\d{2})/) || [])[1];
  const problems = [];
  const afterLines = after.split('\n');
  for (const line of before.split('\n').filter((l, i) => i !== 1 && l.trim())) {
    if (!afterLines.includes(line)) problems.push(`a line was lost: ${line}`);
  }
  for (const gap of trdUpgradeGaps(after, L)) problems.push(`still missing: ${gap}`);
  if (version(after) !== version(before) + 1) problems.push('the version was not raised by one');
  if (!/^> v\d+ · Draft$/.test(stampOf(after))) problems.push('the upgraded document must wait as a Draft, never carry an approval nobody gave');
  for (const gap of trdUpgradeGaps(before, L)) {
    // A missing heading is answered by the first line under it; a missing fixed line by that line.
    const heading = afterLines.indexOf(`## ${gap}`);
    const at = heading >= 0 ? heading + 1 : afterLines.findIndex((l) => l.startsWith(`- **${gap}:** `));
    const history = (at >= 0 && afterLines[at].startsWith('- ') && afterLines[at + 1]) || '';
    if (at < 0 || !L.changed.test(history) || !history.includes(`approved ${approved}`)) problems.push(`${gap}: the earlier approval (${approved}) is not kept beneath the new line`);
    else if (!history.includes(': no line → ')) problems.push(`${gap}: the history invents an earlier value`);
  }
  return problems;
}

// Real output of 0.4.0 (the Study Timer TRD at a0a4131): approved, with no Kept in line.
test('an approved TRD written before the Kept in line is found incomplete, and its upgrade keeps the approval history', () => {
  const L = LANGS.en;
  const before = readMarkdown(path.join(__dirname, 'fixtures', 'approved-0.4.0', 'trd.md'));
  const after = read('study-timer/docs/trd.md');
  assert.match(before.split('\n')[1], /^> v1 · Approved 2026-10-08$/, 'the fixture is a real approved 0.4.0 document');
  assert.deepStrictEqual(trdUpgradeGaps(before, L), ['AI part', 'Each month', 'Kept in'], 'it lacks the Kept in line, since 0.6.0 the running cost, and since 0.7.0 the AI part');
  assert.deepStrictEqual(trdUpgradeGaps(readMarkdown(path.join(FIXTURES, 'trd.md')), L), ['AI part', 'Each month', 'Available', 'Accessibility', 'Kept in'], 'the 0.2.2 TRD lacks more');
  for (const folder of ['cedar-clinic', 'study-timer', 'notes-digest']) assert.deepStrictEqual(trdUpgradeGaps(read(`${folder}/docs/trd.md`), L), [], `${folder} is complete`);
  assert.deepStrictEqual(trdUpgradeGaps(read('cedar-clinic-ar/docs/trd.md'), LANGS.ar), [], 'the Arabic clinic is complete');
  assert.deepStrictEqual(upgradeProblems(before, after, L), [], 'the Study Timer example is the completed counterpart');
  const wrong = [
    ['the line added but the old approval kept', after.replace('> v2 · Draft', '> v1 · Approved 2026-10-08')],
    ['a new approval nobody gave', after.replace('> v2 · Draft', '> v2 · Approved 2026-11-16')],
    ['the version not raised', after.replace('> v2 · Draft', '> v1 · Draft')],
    ['the approval history dropped', after.split('\n').filter((l) => !l.includes('Changed 2026-11-16')).join('\n')],
    ['an invented earlier value', after.replace('Changed 2026-11-16: no line → the student', 'Changed 2026-11-16: only this computer → the student')],
    ['an invented earlier running cost', after.replace(': no line → nothing is paid for', ': a free plan → nothing is paid for')],
    ['the running cost added with no history', after.replace(/\n  - Changed 2026-11-16: no line → nothing is paid for[^\n]*/, '')],
    ['an invented earlier AI part', after.replace(': no line → it uses no AI', ': a chatbot → it uses no AI')],
    ['the AI part added with no history', after.replace(/\n  - Changed 2026-11-16: no line → it uses no AI[^\n]*/, '')],
    ['the AI part never added', after.replace(/\n## AI part\n- None: it uses no AI\.\n  - Changed[^\n]*\n/, '\n')],
    ['an earlier line lost', after.replace('- **Tests:** pytest, in `tests/`.\n', '')],
    ['the line never added', before.replace('> v1 · Approved 2026-10-08', '> v2 · Draft')],
  ];
  for (const [what, doc] of wrong) assert.ok(upgradeProblems(before, doc, L).length > 0, `caught: ${what}`);
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
