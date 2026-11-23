const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SKILL = path.join(ROOT, 'skills', 'project-docs');
const REFERENCE = 'references/maintenance.md';
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');

const cases = [
  {
    folder: 'cedar-clinic',
    template: 'The document',
    title: '# Maintenance: ',
    headings: [
      'Next light visit', 'Next full visit', 'Light visit checks', 'Full visit checks',
      'What does not wait for a visit', 'Visits held', 'Requests received',
    ],
    handover: 'Maintenance and updates',
    fields: ['Light visit rhythm', 'Full visit rhythm', 'Serious security fix deadline', 'Visit results go to'],
    cadence: [
      /online.*\|.*month.*\|.*3 months/i,
      /closed network.*\|.*month.*\|.*6 months/i,
      /offline.*\|.*3 months.*\|.*12 months/i,
    ],
    urgent: [/serious security fix/i, /backup.*failed|failed backup/i, /stopped.*security fixes/i, /expir.*before the next visit/i],
  },
  {
    folder: 'cedar-clinic-ar',
    template: 'In Arabic',
    title: '# الصيانة: ',
    headings: [
      'الزيارة الخفيفة القادمة', 'الزيارة الشاملة القادمة', 'فحوص الزيارة الخفيفة', 'فحوص الزيارة الشاملة',
      'ما لا ينتظر موعد الزيارة', 'الزيارات التي أُجريت', 'الطلبات الواردة',
    ],
    handover: 'الصيانة والتحديثات',
    fields: ['وتيرة الزيارات الخفيفة', 'وتيرة الزيارات الشاملة', 'مهلة معالجة الثغرات الأمنية الخطيرة', 'تُرسل نتائج كل زيارة إلى'],
    cadence: [
      /الإنترنت.*\|.*شهر.*\|.*3 أشهر/,
      /شبكة.*مغلقة.*\|.*شهر.*\|.*6 أشهر/,
      /دون اتصال.*\|.*3 أشهر.*\|.*12 شهر/,
    ],
    urgent: [/إصلاح.*أمني|ثغرة أمنية/, /فشل.*النسخ|نسخ.*فشل|نسخة.*فشل/, /توقّ?ف.*إصلاحات أمنية/, /قبل الزيارة القادمة/],
  },
];

function section(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  assert.notEqual(start, -1, `missing section: ${heading}`);
  return lines.slice(start + 1).join('\n').split('\n## ')[0];
}

function template(markdown, heading) {
  const body = markdown.split(`\n## ${heading}\n`)[1];
  const fenced = body?.match(/^```markdown\n([\s\S]+?)\n```$/m);
  assert.ok(fenced, `missing Markdown template: ${heading}`);
  return fenced[1];
}

test('both maintenance templates and example records keep the fixed headings in order without a stamp', () => {
  const reference = read(SKILL, REFERENCE);
  for (const { folder, template: heading, title, headings } of cases) {
    for (const doc of [template(reference, heading), read(SKILL, `examples/${folder}/docs/maintenance.md`)]) {
      assert.ok(doc.startsWith(title), `${folder}: title`);
      assert.deepEqual(doc.split('\n').filter((line) => /^#{2,} /.test(line)), headings.map((h) => `## ${h}`));
      assert.doesNotMatch(doc, /^>\s*(?:v\d+\b|الإصدار\s)/m, `${folder}: no stamp`);
    }
  }
});

test('both Handover templates and examples name all four maintenance agreement fields', () => {
  const reference = read(SKILL, 'references/handover.md');
  for (const { folder, template: heading, handover, fields } of cases) {
    for (const doc of [template(reference, heading), read(SKILL, `examples/${folder}/docs/handover.md`)]) {
      const lines = section(doc, handover).split('\n');
      for (const field of fields) {
        assert.ok(lines.some((line) => line.startsWith(`- **${field}:** `)), `${folder}: ${field}`);
      }
    }
  }
});

test('the maintenance reference gives three visit rhythms and four urgent items in both languages', () => {
  const reference = read(SKILL, REFERENCE);
  const arabicStart = reference.indexOf('\n## In Arabic\n');
  assert.ok(arabicStart > 0, 'there is an Arabic section');
  for (const [index, { template: heading, headings, cadence, urgent }] of cases.entries()) {
    const language = index === 0 ? reference.slice(0, arabicStart) : reference.slice(arabicStart);
    const tableRows = language.split('\n').filter((line) => line.startsWith('|'));
    for (const row of cadence) assert.ok(tableRows.some((line) => row.test(line)), `${heading}: rhythm ${row}`);
    const exceptions = section(template(reference, heading), headings[4]).split('\n')
      .filter((line) => line.startsWith('- '));
    assert.equal(exceptions.length, 4, `${heading}: four urgent items`);
    for (const item of urgent) assert.ok(exceptions.some((line) => item.test(line)), `${heading}: urgent item ${item}`);
  }
});

test('maintenance leaves execution to the person who ran each check and sign-off to the person alone', () => {
  const reference = read(SKILL, REFERENCE).replace(/\s+/g, ' ');
  assert.match(reference, /(?:agent|project-docs) never runs (?:a visit's|the|these) checks/i);
  assert.match(reference, /only the person marks a visit checked/i);
});

test('the short skill routes maintenance and puts due or late visits first on opening a project', () => {
  const skill = read(SKILL, 'SKILL.md');
  assert.ok(skill.includes('](references/maintenance.md)'), 'SKILL.md links the maintenance reference');
  const start = section(skill, 'Start: where are we?').replace(/\s+/g, ' ').trim();
  assert.match(start, /^1\. .*docs\/maintenance\.md.*next dates first.*before anything else.*due soon or late.*days/i);
  assert.match(start, /say nothing when neither visit is near/i);
  assert.ok(skill.trimEnd().split('\n').length <= 173);
});

test('the scope excludes running maintenance checks and marking a visit checked', () => {
  const scope = section(read(ROOT, 'docs/scope.md'), 'What it will NOT do');
  assert.match(scope, /^- No running a maintenance visit's checks\b/m);
  assert.match(scope, /^- No marking a maintenance visit checked\b/m);
});

test('the new published maintenance guidance omits unverified short deadlines', () => {
  for (const file of ['SKILL.md', 'references/handover.md', REFERENCE]) {
    assert.doesNotMatch(read(SKILL, file), /\b(?:48[ -]hours?|3[ -]days?)\b|(?:48|٤٨)\s*ساعة|(?:3|٣)\s*أيام/i, file);
  }
});
