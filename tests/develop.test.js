// Checks the written contract and its samples. The agent exercise is in behavioral-cases.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const skillRoot = path.join(__dirname, '..', 'skills', 'project-docs');
const development = 'references/develop.md';
const read = (file) => fs.readFileSync(path.join(skillRoot, file), 'utf8').replace(/\r\n/g, '\n');
const oneLine = (text) => text.replace(/\s+/g, ' ').trim();

function section(markdown, heading) {
  const start = markdown.split('\n').indexOf('## ' + heading);
  assert.notEqual(start, -1, 'missing section: ' + heading);
  return markdown.split('\n').slice(start + 1).join('\n').split('\n## ')[0];
}

test('the packaged development reference is reached from Start, the PRD and maintenance', () => {
  assert.ok(fs.existsSync(path.join(skillRoot, development)), 'missing packaged development reference');
  const start = section(read('SKILL.md'), 'Start: where are we?');
  assert.match(start, /^4\. [\s\S]*?\]\(references\/develop\.md\)[\s\S]*?^5\. /m);

  const prd = read('references/prd.md');
  assert.match(section(prd, 'Gather first'), /\]\(develop\.md(?:#[^)]*)?\)/);
  assert.match(section(prd, 'The document'), /\]\(develop\.md(?:#[^)]*)?\)/);
  const requests = section(read('references/maintenance.md'), 'Requests after handover');
  assert.match(requests, /^- \*\*Change:\*\*[\s\S]*?\]\(develop\.md(?:#[^)]*)?\)[\s\S]*?^- \*\*Health job:/m);
});

const languages = [
  {
    name: 'English',
    must: '## What it must do',
    marks: ['(works today)', '(changes)'],
    unmarked: /\bno mark\b/i,
    check: /^ {2}- Check: \S/,
    step: /^### Step 1: \S/,
    fields: ['- **Covers:** ', '- **How we know it works:** '],
    status: '- **Status:** not started',
  },
  {
    name: 'Arabic',
    must: '## ما يجب أن يفعله',
    marks: ['(يعمل اليوم)', '(يتغير)'],
    unmarked: /بلا علامة|دون علامة/,
    check: /^ {2}- الفحص: \S/,
    step: /^### الخطوة 1: \S/,
    fields: ['- **تغطي:** ', '- **كيف نعرف أنها تعمل:** '],
    status: '- **الحالة:** لم تبدأ',
  },
];

const languageMarks = languages.flatMap((language) => language.marks);

for (const [languageIndex, language] of languages.entries()) {
  test(language.name + ' development examples keep the PRD and first-step line shapes', () => {
    const text = read(development).split('\n## In Arabic\n')[languageIndex];
    assert.ok(text, 'missing guidance for ' + language.name);
    const fence = /^(`{3,})markdown\n([\s\S]*?)\n\1$/gm;
    const prose = text.replace(fence, '');
    for (const mark of language.marks) assert.ok(prose.includes(mark), 'missing mark: ' + mark);
    assert.match(prose, language.unmarked, 'the explanation names unmarked new work');

    const samples = [...text.matchAll(fence)].map((sample) => sample[2].split('\n'));
    const prd = samples.find((sample) => sample[0] === language.must);
    assert.ok(prd, 'missing sample under the fixed PRD heading');
    assert.equal(prd.length, 7, 'three M lines with one check each');
    const numbers = new Map();
    for (let number = 1; number <= 3; number += 1) {
      const offset = (number * 2) - 1;
      const must = prd[offset].match(/^- \*\*M(\d+)\.\*\* (\S.*)$/);
      assert.ok(must, 'expected "- **M<n>.**" at the start of ' + prd[offset]);
      assert.equal(must[1], String(number), 'sample numbering is consecutive');
      const mark = must[2].match(/ (\([^()]+\))$/)?.[1] ?? '';
      const words = mark ? must[2].slice(0, -(mark.length + 1)) : must[2];
      assert.ok(words.trim().length, 'the M line has words before its mark');
      for (const token of languageMarks) {
        assert.ok(!words.includes(token), 'marks belong only at the end of the M line');
      }
      assert.ok(!numbers.has(mark), 'one sample for each kind of M line');
      numbers.set(mark, 'M' + must[1]);
      assert.match(prd[offset + 1], language.check, 'the check sits directly under its M line');
    }
    assert.deepEqual([...numbers.keys()].sort(), ['', ...language.marks].sort());

    const step = samples.find((sample) => language.step.test(sample[0]));
    assert.ok(step, 'missing first-step sample');
    assert.equal(step.length, 4, 'the first step has the three fixed fields');
    for (const [index, field] of language.fields.entries()) {
      assert.ok(step[index + 1].startsWith(field), 'missing or misplaced Plan field: ' + field);
      assert.ok(step[index + 1].slice(field.length).trim().length, 'empty Plan field: ' + field);
    }
    assert.equal(step[1], language.fields[0] + numbers.get(language.marks[0]), 'the first step covers the keep-working line');
    assert.equal(step[3], language.status);
  });
}

test('the English Plan copies and checks the untouched project first and repeats its checks at delivery', () => {
  const plan = read('references/plan.md');
  const how = section(plan, 'How to make the steps');
  const first = how.split(/\n(?=- )/).map(oneLine)
    .find((bullet) => /\b(?:Step 1|first step)\b[^.]*\bchanges nothing\b/i.test(bullet));
  assert.ok(first, 'the development first step changes nothing');
  assert.match(first, /\bsafe copy\b/i);
  assert.match(first, /\b(?:run|runs) (?:each|every|all)\b[^.]*\bchecks?\b/i);
  assert.match(first, /\(works today\)/);
  assert.match(first, /\b(?:untouched|before (?:the first|any) change)\b/i);

  const delivery = section(plan, 'Delivery steps');
  for (const label of ['Functional test', 'Acceptance test (UAT)']) {
    const row = delivery.split('\n').find((line) => line.startsWith('| **' + label + '** |'));
    assert.ok(row, 'missing fixed delivery step: ' + label);
    assert.match(row, /\b(?:runs?|reruns?|again)\b/i);
    assert.match(row, /\(works today\)/, label + ' repeats the existing behavior checks');
  }
});

test('the Arabic Plan copies and checks the untouched project first and repeats its checks at delivery', () => {
  const arabic = read('references/plan.md').split('\n## In Arabic\n')[1];
  assert.ok(arabic, 'missing Arabic guidance');
  const paragraphs = arabic.trim().split(/\n\s*\n/).map(oneLine);
  const first = paragraphs.find((text) => /لا تغيّر الخطوة الأولى شيئًا|الخطوة الأولى لا تغيّر شيئًا/.test(text));
  assert.ok(first, 'the development first step changes nothing');
  assert.match(first, /نسخة آمنة/);
  assert.match(first, /قبل (?:أي|أول) (?:تعديل|تغيير)/);
  assert.match(first, /\(يعمل اليوم\)/);
  assert.match(first, /كل (?:فحص|الفحوص)/);

  const delivery = paragraphs.find((text) => text.includes('الاختبار الوظيفي') && text.includes('اختبار القبول (UAT)'));
  assert.ok(delivery, 'the Arabic guidance names both fixed delivery tests together');
  assert.match(delivery, /\(يعمل اليوم\)/, 'both tests include the checks of existing behavior');
  assert.match(delivery, /يعيد|تُعاد/);
});

test('the skill description offers built-project development and the entrypoint stays within 173 lines', () => {
  const skill = read('SKILL.md');
  const description = skill.split('\n---\n')[0].match(/^description: (.+)$/m)?.[1];
  assert.ok(description, 'missing entrypoint description');
  assert.match(description, /\bdevelop, extend or change\b[^.!?]*\b(?:already built|already[- ]built)\b/i);
  assert.ok(skill.replace(/\n$/, '').split('\n').length <= 173);
});

function between(text, start, end) {
  return text.split(start)[1]?.split(end)[0] ?? '';
}

const [englishGuide, arabicGuide] = read(development).split('\n## In Arabic\n');
const englishHealth = between(englishGuide, '\n## Health check before the change\n', '\n## Mark the PRD\n');
const arabicHealth = between(arabicGuide, '\n**فحص سلامة المشروع قبل التغيير.**', '\nضع العلامة');
const englishWorkflow = between(englishGuide, '\n## How it works today\n', '\n## Health check before the change\n');
const arabicWorkflow = arabicGuide.split('\n**فحص سلامة المشروع قبل التغيير.**')[0];

const healthCases = [
  {
    name: 'English',
    checks: [
      ['puts the health check between confirmation and planning', englishGuide, [
        /How it works today · Health check before the change · Mark the PRD/,
        /## How it works today .*?## Health check before the change After the person confirms how the project works today[^.]*before planning the change.*?## Mark the PRD/,
      ]],
      ['limits the check to reporting and asks before running scripts or tests', englishHealth, [
        /The check only reports\./,
        /read-only[^.]*code, formatting and dependencies/i,
        /(?:ask|get)[^.]*person[’']s (?:yes|permission)[^.]*before running[^.]*scripts or tests/i,
      ]],
      ['forbids installing the workflow skill', englishWorkflow, [
        /`workflow-project`[^]*?Never install it\./,
      ]],
      ['forbids installing an audit skill', englishHealth, [
        /read-only project health audit skill[^]*?evidence-backed[^]*?Never install it\./i,
      ]],
      ['gives the code-backed fallback and the honest limit', englishHealth, [
        /No health audit was run\./,
        /only the problems you confirmed while reading the code[^.]*file and line/,
        /Tell the person[^.]*reads the code[^.]*can miss problems[^.]*no findings/i,
      ]],
      ['leaves the decision with the person and routes fixes they choose now', englishHealth, [
        /every finding with the gaps in the same read-back/i,
        /ask the person to decide/i,
        /\*\*Fix it now\.\*\*[^]*?`M` line with its `Check:`[^]*?TRD, Data or Security[^]*?normal approval[^]*?\*\*Covers\*\*/,
      ]],
      ['routes deferred fixes to Later', englishHealth, [
        /\*\*Fix it later\.\*\*[^.]*\*\*Later\*\*/,
      ]],
      ['records findings the person leaves as named risks', englishHealth, [
        /\*\*Leave it\.\*\*[^.]*`Risk:` under \*\*Assumptions and risks\*\*[^.]*names the finding/,
      ]],
      ['settles dates and budget after both lists are sorted', englishHealth, [
        /\*\*Dates and budget\*\* after[^.]*sorted the gaps and findings/i,
        /fixes they chose add work/i,
        /dates or a budget were agreed earlier[^.]*ask whether they still hold/i,
        /only numbers, durations and prices the person supplies or confirms/i,
      ]],
    ],
  },
  {
    name: 'Arabic',
    checks: [
      ['puts the health check between confirmation and planning', arabicGuide, [
        /\*\*فحص سلامة المشروع قبل التغيير\.\*\*[^.]*بعد أن يؤكد الشخص[^.]*قبل التخطيط للتغيير[\s\S]*?ضع العلامة/,
      ]],
      ['limits the check to reporting and asks before running scripts or tests', arabicHealth, [
        /يقتصر الفحص على عرض النتائج\./,
        /(?:بالقراءة فقط|دون تعديل)[^.]*الكود[^.]*تنسيق[^.]*اعتماديات/,
        /موافقة الشخص قبل تشغيل[^.]*(?:سكربتات|برامج)[^.]*أو فحوصه/,
      ]],
      ['forbids installing the workflow skill', arabicWorkflow, [
        /`workflow-project`[^]*?لا تثبّتها أبدًا\./,
      ]],
      ['forbids installing an audit skill', arabicHealth, [
        /مهارة تفحص سلامة المشروع بالقراءة فقط[^]*?تستند إلى أدلة[^]*?لا تثبّتها أبدًا\./,
      ]],
      ['gives the code-backed fallback and the honest limit', arabicHealth, [
        /لم يُجرَ فحص لسلامة المشروع\./,
        /فقط المشكلات التي تأكدت منها أثناء قراءة الكود[^.]*ملف كل مشكلة وسطرها/,
        /قل للشخص[^.]*قراءة الكود[^.]*قد تفوته مشكلات[^.]*لم يسجّل أي ملاحظات/,
      ]],
      ['leaves the decision with the person and routes fixes they choose now', arabicHealth, [
        /كل ملاحظة مع الثغرات في العرض نفسه/,
        /اسأله عمّا يريد فعله بها/,
        /\*\*إصلاحها الآن\.\*\*[^]*?`M`[^]*?`الفحص:`[^]*?`TRD` أو البيانات أو الأمان[^]*?قواعد اعتمادها[^]*?\*\*تغطي\*\*/,
      ]],
      ['routes deferred fixes to Later', arabicHealth, [
        /\*\*إصلاحها لاحقًا\.\*\*[^.]*\*\*لاحقًا\*\*/,
      ]],
      ['records findings the person leaves as named risks', arabicHealth, [
        /\*\*تركها\.\*\*[^.]*(?:سمِّ|اذكر|سجّل) الملاحظة[^.]*\*\*خطر:\*\* تحت \*\*الافتراضات والمخاطر\*\*/,
      ]],
      ['settles dates and budget after both lists are sorted', arabicHealth, [
        /\*\*المواعيد والميزانية\*\* بعد أن يقرر الشخص[^.]*بكل ثغرة وملاحظة/,
        /الإصلاحات التي اختارها تضيف عملًا/,
        /سبق الاتفاق على مواعيد أو ميزانية[^.]*اسأله/,
        /فقط الأرقام والمدد والأسعار التي يقدّمها الشخص أو يؤكدها/,
      ]],
    ],
  },
];

for (const { name, checks } of healthCases) {
  for (const [description, content, expected] of checks) {
    test(name + ' ' + description, () => {
      const missing = expected.filter((pattern) => !pattern.test(oneLine(content)));
      assert.deepEqual(missing, []);
    });
  }
}
