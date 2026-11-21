'use strict';
// The three decisions a person must make that were missing before 0.12.0.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const { parse, render } = require(path.join(SKILL, 'scripts', 'plan-page.js'));
const read = (...parts) => fs.readFileSync(path.join(SKILL, ...parts), 'utf8').normalize('NFC').replace(/\s+/g, ' ');
const has = (text, words, where) => {
  for (const word of words) assert.ok(text.includes(word.normalize('NFC')), `${where} must say: ${word}`);
};

test('Data asks what happens if the saved records are lost, with a named open decision', () => {
  has(read('references', 'data.md'), [
    '- **If this copy is lost:** <where a copy someone can read is, and how much of the latest work may be lost / None: it can easily be typed in again>',
    'cannot easily be typed in again (a thousand paper records that take weeks to retype cannot)',
    'write `None: it can easily be typed in again`',
    'never assume a backup exists',
    "Reuse a filled meeting form's answer",
    '`open: see the TBD below`',
    '`- TBD: how the saved records are recovered. Decided when <…>.`',
    'waits for that exact name',
    '- **إذا ضاعت هذه النسخة:** <أين توجد نسخة يستطيع أحد قراءتها، وكم من آخر العمل قد يضيع / لا شيء: يمكن إدخالها من جديد بسهولة>',
    '(ألف سجل ورقي تحتاج إعادة كتابته أسابيع لا يُعد سهلًا)',
    'فاكتب «لا شيء: يمكن إدخالها من جديد بسهولة»',
    'تفترض وجود نسخة احتياطية',
    '«مفتوح: انظر ما لم يُحسم أدناه»',
    '`- لم يُحسم بعد: كيف تُستعاد السجلات المحفوظة. يُحسم عندما <…>.`',
    'تنتظر بهذا الاسم نفسه',
  ], 'data.md');
  has(read('examples', 'cedar-clinic', 'docs', 'data.md'), ['- **If this copy is lost:** ', 'up to one day of visits'], 'the clinic');
  has(read('examples', 'cedar-clinic-ar', 'docs', 'data.md'), ['- **إذا ضاعت هذه النسخة:** ', 'مواعيد يوم واحد'], 'the Arabic clinic');
});

test('the Handover reuses the Data decision and only asks who makes the copy', () => {
  const handover = read('references', 'handover.md');
  has(handover, [
    'makes the copy Data agreed',
    'With no Data document, or when Data says the records can easily be typed in again, skip the copy',
    'carry its `TBD` forward',
    'who makes the copy Data agreed (skip the copy when Data needs none)',
    'ومن يأخذ النسخة التي اتفقت عليها البيانات',
  ], 'handover.md');
  const raw = fs.readFileSync(path.join(SKILL, 'references', 'handover.md'), 'utf8').replace(/\r\n/g, '\n');
  const gather = raw.slice(raw.indexOf('## Gather first'), raw.indexOf('## The questions'));
  const recovery = gather.match(/^- \*\*Data → If this copy is lost:\*\*[\s\S]*?(?=\n- )/m)?.[0] || '';
  assert.match(recovery.replace(/\s+/g, ' '), /Never ask it again: the Handover only says who makes that copy\./, 'the recovery bullet itself says to reuse Data');
  assert.ok(!handover.includes('makes the backups, and where'), 'the Handover must not ask where the copy goes again');
  assert.ok(!handover.includes('where, backups>'), 'the English template must not ask for backups again');
  assert.ok(!handover.includes('والنسخ الاحتياطية>'.normalize('NFC')), 'the Arabic template must not ask for backups again');
});

test('the AI part stays five lines and asks what outside text must never make it do', () => {
  has(read('references', 'trd.md'), [
    'also ask what that text must never be able to make it do, and write the answer on the **Decides alone** line, together with what it may do alone',
    'when it reads text the operator did not write: what that text must never make it do',
    'ما الذي يجب ألا يستطيع هذا النص أن يجعله يفعله',
    '**يقرر وحده** مع ما يفعله وحده',
    'وعندما يقرأ نصًا لم يكتبه المشغّل: ما يجب ألا يجعله هذا النص يفعله',
  ], 'trd.md');
});

test('an outside service records keeping and training as two answers, with one named gap per provider', () => {
  has(read('references', 'trd.md'), [
    "receives the client's or users' information (including the client's own work notes, even when they are about other people)",
    '**may the provider keep it, and for how long**, and **may it use it to train**',
    'never guess from what providers usually do',
    '`- TBD: what <service> may keep or train on. Decided when <the person has read its terms>.`',
    'Every step that sends it real information waits for that name; a step that uses only made-up data does not',
    "when it receives the client's or users' information: keeps …; trains …",
    '(بما فيها ملاحظات عمل العميل نفسه، ولو كانت عن أشخاص آخرين)',
    '**هل يحق للمزوّد الاحتفاظ بها، وإلى متى**، و**هل يحق له التدريب عليها**',
    '`- لم يُحسم بعد: ما يحق لـ<الخدمة> الاحتفاظ به أو التدريب عليه. يُحسم عندما <يقرأ الشخص شروطها>.`',
    'كل خطوة ترسل إليها معلومات حقيقية؛ أما الخطوة التي تستخدم بيانات مختلَقة فقط فلا تنتظر',
    'عندما تستقبل معلومات العميل أو المستخدمين: يحتفظ …؛ يدرّب …',
  ], 'trd.md');
  has(read('examples', 'cedar-clinic', 'docs', 'trd.md'), [
    'keeps: the staff sign-in records for 90 days', 'trains: no',
    'has confirmed from its terms how long it keeps the phone numbers and texts and whether it may train on them',
  ], 'the clinic');
  has(read('examples', 'cedar-clinic-ar', 'docs', 'trd.md'), [
    'يحتفظ: بسجلات دخول الموظفين 90 يومًا', 'يدرّب: لا',
    'ويؤكد من شروطها مدة احتفاظها بأرقام الهواتف والنصوص وهل يحق لها التدريب عليها',
  ], 'the Arabic clinic');
  has(read('examples', 'notes-digest', 'docs', 'trd.md'), ['keeps: the notes for 30 days', 'trains: no'], 'Notes Digest');
});

test('the client meeting form asks each question only when it applies, in both languages', () => {
  has(read('references', 'meeting-form.md'), [
    'If its records could not easily be typed in again: if this copy is lost, where is another someone can read',
    "If it sends the client's or users' information to an outside provider: may the provider keep it, for how long, and may it use it to train?",
    'وإن لم يسهل إدخال سجلاته من جديد: إذا ضاعت هذه النسخة',
    'وإذا أرسل معلومات العميل أو المستخدمين إلى مزوّد خارجي: هل يحق للمزوّد الاحتفاظ بها، وإلى متى، وهل يحق له التدريب عليها؟',
  ], 'meeting-form.md');
});

test('an older approved document is upgraded when an answer inside an existing line is missing', () => {
  has(read('SKILL.md'), [
    'or that lacks an answer now needed inside a line it already has',
    "a service receiving the client's or users' information with no keeps and trains answers",
    'a model reading text the operator did not write with no limit on **Decides alone**',
    'reuse what another document already answers',
  ], 'SKILL.md');
  const notes = read('examples', 'notes-digest', 'docs', 'trd.md');
  has(notes, ['> v4 · Draft', 'v3, approved 2026-11-20'], 'Notes Digest keeps its approval history');
});

test('the Plan checks carry the decisions that own them', () => {
  has(read('references', 'plan.md'), [
    'cite **Data: If this copy is lost**', 'no more than the agreed loss is at risk',
    'When **Decides alone** limits what outside text can make it do',
    'اذكر **البيانات: إذا ضاعت هذه النسخة**', 'وإذا حدّد **يقرر وحده**',
  ], 'the Plan reference');
  has(read('examples', 'cedar-clinic', 'docs', 'plan.md'), ['If this copy is lost', 'at most one day of visits would be lost'], 'the clinic Plan');
  has(read('examples', 'cedar-clinic-ar', 'docs', 'plan.md'), ['إذا ضاعت هذه النسخة', 'لا يتجاوز مواعيد يوم واحد'], 'the Arabic clinic Plan');
  has(read('examples', 'notes-digest', 'docs', 'plan.md'), ['TRD: Decides alone', 'v3, approved 2026-11-20'], 'the Notes Digest Plan');
  const notesPlan = fs.readFileSync(path.join(SKILL, 'examples', 'notes-digest', 'docs', 'plan.md'), 'utf8');
  const firstStep = notesPlan.slice(notesPlan.indexOf('### Step 1:'), notesPlan.indexOf('### Step 2:'));
  for (const word of ['TRD: Decides alone', 'ignore your instructions', 'first step that reads notes']) {
    assert.ok(firstStep.includes(word), `the first step that reads notes must say: ${word}`);
  }
});

test('a step that needs two open decisions waits until the last one settles, in either order and both languages', () => {
  has(read('references', 'plan.md'), [
    '**If another `TBD` it needs is still open,** keep it blocked',
    'and keep the move as one line under **Status**: ` - Changed <date>: waited for <what> → waits for <the next one>',
    'واحفظ الانتقال في سطر واحد تحت **الحالة**: ` - تغيّر في <التاريخ>: من انتظار <ما هو> إلى انتظار <التالي>',
    '**Only when nothing it needs is still open,** set its Status back to `not started`',
    'back to `not started` only once nothing it needs is still open',
    '**إن بقي قرار آخر تحتاجه مفتوحًا** فأبقها معطّلة',
    '**ولا تعود إلى «لم تبدأ» إلا حين لا يبقى شيء تحتاجه مفتوحًا.**',
  ], 'the Plan reference');
  const FORMS = {
    en: {
      head: '# Plan: Trace\n> v1 · Draft\n\n## Steps\n', step: 'Step', covers: 'Covers', how: 'How we know it works', status: 'Status',
      chip: 'Check changed', todo: 'not started', wait: (w) => `⛔ waits for TBD: ${w}`,
      moved: (a, b) => `  - Changed 2026-11-21: waited for ${a} → waits for ${b}, because the document settled it.`,
      freed: (a) => `  - Changed 2026-11-22: waited for ${a} → not started, because the document settled it.`,
      names: ['how the saved records are recovered', 'what Quill 2 may keep or train on'],
    },
    ar: {
      head: '# خطة التنفيذ: تتبع\n> الإصدار 1 · مسودة\n\n## الخطوات\n', step: 'الخطوة', covers: 'تغطي', how: 'كيف نعرف أنها تعمل', status: 'الحالة',
      chip: 'تغيّر الفحص', todo: 'لم تبدأ', wait: (w) => `⛔ تنتظر ما لم يُحسم: ${w}`,
      moved: (a, b) => `  - تغيّر في 2026-11-21: من انتظار ${a} إلى انتظار ${b}، لأن الوثيقة حسمته.`,
      freed: (a) => `  - تغيّر في 2026-11-22: من انتظار ${a} إلى لم تبدأ، لأن الوثيقة حسمته.`,
      names: ['كيف تُستعاد السجلات المحفوظة', 'ما يحق لـQuill 2 الاحتفاظ به أو التدريب عليه'],
    },
  };
  const plan = (F, real, underCheck = '', underStatus = '') => {
    const step = (n, status, check = '', history = '') => `\n### ${F.step} ${n}: S${n}\n- **${F.covers}:** M${n}\n- **${F.how}:** try it.\n${check}- **${F.status}:** ${status}\n${history}`;
    return F.head + step(1, F.todo) + step(2, real, underCheck, underStatus) + step(3, real, underCheck, underStatus);
  };
  for (const F of Object.values(FORMS)) {
    for (const [first, last] of [F.names, [...F.names].reverse()]) {
      const waiting = parse(plan(F, F.wait(first))).steps;
      assert.deepStrictEqual(waiting.map((s) => s.state), ['todo', 'blocked', 'blocked'], 'made-up-data work stays available');

      const moved = `${F.moved(first, last)}\n`;
      const afterFirst = parse(plan(F, F.wait(last), '', moved)).steps;
      assert.deepStrictEqual(afterFirst.map((s) => s.state), ['todo', 'blocked', 'blocked'], 'both real-data steps still wait');
      for (const s of afterFirst.slice(1)) {
        assert.strictEqual(s.when, last, 'the step now names its next open decision');
        assert.ok(s.changes.length === 1 && s.changes[0].kind !== 'check', 'the move is history, not a changed check');
      }
      const page = render(parse(plan(F, F.wait(last), '', moved)));
      assert.ok(page.includes(last) && page.includes(first), 'the page shows the next wait and keeps the earlier one');
      assert.ok(!page.includes(F.chip), 'a move under Status shows no changed-check badge');
      assert.ok(render(parse(plan(F, F.wait(last), moved, ''))).includes(F.chip), 'negative control: the same move under the check shows the badge');

      const afterLast = parse(plan(F, F.todo, `${F.freed(last)}\n`, moved)).steps;
      assert.deepStrictEqual(afterLast.map((s) => s.state), ['todo', 'todo', 'todo'], 'free only after the last decision');
      for (const s of afterLast.slice(1)) {
        assert.strictEqual(s.changes.length, 2, 'both moves stay in the history');
        assert.ok(s.changes.some((c) => c.kind === 'status'), 'the final move is a settled wait');
      }
    }
  }
});
