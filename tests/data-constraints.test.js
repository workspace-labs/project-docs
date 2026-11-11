// Compare readable declarations with the SQL that a builder will actually copy.
// This is a package consistency check, not a database or agent behavior test.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const examples = path.join(__dirname, '..', 'skills', 'project-docs', 'examples');
const languages = [
  { folder: 'cedar-clinic', sheets: 'Sheets', required: 'Required', unique: 'Unique', removal: 'Removal' },
  { folder: 'cedar-clinic-ar', sheets: 'الجداول', required: 'مطلوب', unique: 'فريد', removal: 'الحذف' },
];
const read = (folder) => fs.readFileSync(path.join(examples, folder, 'docs/data.md'), 'utf8').replace(/\r\n/g, '\n');

function constraintProblems(text, language) {
  const current = text.replace(/<details data-project-docs-history>[\s\S]*?<\/details>/g, '');
  const sheets = (current.split(`\n## ${language.sheets}\n`)[1] || '').split('\n## ')[0].split('\n### ').slice(1);
  const tables = new Map([...current.matchAll(/CREATE TABLE ([a-z_]+)\s*\(([\s\S]*?)\n\);/g)].map((m) => [m[1], m[2]]));
  const problems = [];
  if (!sheets.length) problems.push('no readable sheets');
  for (const sheet of sheets) {
    const name = (sheet.split('\n')[0].match(/\(([a-z_]+)\)$/) || [])[1];
    const sql = tables.get(name);
    if (!sql) { problems.push(`${name}: no SQL table`); continue; }
    const declared = (label) => {
      const line = sheet.split('\n').find((value) => value.startsWith(`- **${label}:** `));
      if (!line) problems.push(`${name}: no ${label} declaration`);
      const individual = (line || '').split(/\. (?:Combined rule|القيد المركّب):/)[0];
      return [...individual.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
    };
    const columns = new Map(sql.split('\n').map((line) => line.match(/^\s*([a-z_]+)\s+(.+)/)).filter(Boolean).map((m) => [m[1], m[2].split('--')[0]]));
    for (const [label, pattern] of [[language.required, /\bNOT NULL\b|\bPRIMARY KEY\b/i], [language.unique, /\bUNIQUE\b|\bPRIMARY KEY\b/i]]) {
      for (const field of declared(label)) {
        if (!columns.has(field) || !pattern.test(columns.get(field))) problems.push(`${name}.${field}: ${label} is not enforced by SQL`);
      }
    }
    if (!sheet.split('\n').some((line) => line.startsWith(`- **${language.removal}:** `))) problems.push(`${name}: no removal rule`);
  }
  return problems;
}

for (const language of languages) {
  test(`${language.folder}: required/unique fields match SQL and each sheet names its removal route`, () => {
    assert.deepEqual(constraintProblems(read(language.folder), language), []);
  });

  test(`${language.folder}: losing a required or unique SQL constraint is detected`, () => {
    const data = read(language.folder);
    const optionalPhone = data.replace(/(phone\s+text\s+)NOT NULL/i, '$1');
    assert.notEqual(optionalPhone, data);
    assert.ok(constraintProblems(optionalPhone, language).some((p) => p.includes('patients.phone')));
    const sharedPhone = data.replace(/(phone\s+text\s+NOT NULL\s+)UNIQUE/i, '$1');
    assert.notEqual(sharedPhone, data);
    assert.ok(constraintProblems(sharedPhone, language).some((p) => p.includes('patients.phone')));
  });

  test(`${language.folder}: audit record links follow linked-record deletion without storing personal content`, () => {
    const data = read(language.folder);
    const sql = (data.match(/CREATE TABLE audit_events\s*\(([\s\S]*?)\n\);/) || [])[1];
    assert.ok(sql, 'the audit records required by Security have a data model');
    assert.match(sql, /actor_id\s+bigint\s+NOT NULL\s+REFERENCES staff\(id\)\s+ON DELETE CASCADE/i);
    assert.match(sql, /visit_id\s+bigint\s+NOT NULL\s+REFERENCES visits\(id\)\s+ON DELETE CASCADE/i);
    const fields = [...sql.matchAll(/^\s*([a-z_]+)\s+/gm)].map((m) => m[1]);
    assert.deepEqual(fields.sort(), ['id', 'actor_id', 'visit_id', 'event_at', 'action', 'outcome'].sort());
  });
}
