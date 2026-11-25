'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MARKER = '<!-- project-docs:meeting-page -->';
const REFERENCE = path.join(__dirname, '../references/meeting-form.md');
const TITLES = { en: 'Client meeting form: ', ar: 'نموذج اجتماع العميل: ' };
const LATER = { en: 'later', ar: 'لاحقًا' };
const TIMELINE = { en: 'Milestone', ar: 'المحطة' };
const SIDE = {
  en: { metBy: 'Met by (our side)', signs: 'For our side' },
  ar: { metBy: 'من جهتنا', signs: 'من جهتنا' },
};

// The formats in 0.14.0 and 0.15.0 used the same headings, with an earlier set of fixed prompts.
const LEGACY = {
  en: {
    metBy: 'Met by (our team)', signs: 'For our team',
    datesLabel: 'Dates:', datesQuestion: 'is there a deadline? Is it fixed, or can it move?',
    samples: / \(ask for a copy of .*\)$/, oldSamples: ' (ask for a copy)',
    access: / Which accounts and admin access .*$/, oldAccess: ' Who gives us access?',
  },
  ar: {
    metBy: 'من فريقنا', signs: 'عن فريقنا',
    datesLabel: 'المواعيد:', datesQuestion: 'هل هناك موعد نهائي؟ هل هو ثابت أم يمكن أن يتغير؟',
    samples: / \(اطلب نسخة من .*\)$/, oldSamples: ' (اطلب نسخة)',
    access: / ما الحسابات وصلاحيات الإدارة .*$/, oldAccess: ' ومن يمنحنا الوصول؟',
  },
};

function refuse(line, message) {
  throw new Error(`line ${line}: ${message}`);
}

function readSections(markdown) {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r\n?|\n/);
  const first = lines[0];
  const lang = Object.keys(TITLES).find((key) => first.startsWith('# ' + TITLES[key]));
  if (!lang) refuse(1, 'expected a client meeting form title in English or Arabic');
  const project = first.slice(2 + TITLES[lang].length).trim();
  if (!project) refuse(1, 'the project name is missing');

  const sections = [{ heading: '', line: 1, content: [] }];
  for (const [index, raw] of lines.entries()) {
    if (index === 0 || !raw.trim()) continue;
    const line = index + 1;
    const value = raw.trimEnd();
    if (/^ {0,3}#{1,6}(?:\s|$)/.test(value)) {
      sections.push({ heading: value, line, content: [] });
    } else {
      sections.at(-1).content.push({ line, value });
    }
  }
  return { lang, project, sections, end: lines.length };
}

function splitRow({ line, value }) {
  const row = value.trim();
  if (!row.endsWith('|')) refuse(line, 'a table row must end with |');
  const cells = [];
  let cell = '';
  for (let index = 1; index < row.length; index++) {
    const char = row[index];
    if (char === '\\' && ['\\', '|'].includes(row[index + 1])) {
      cell += row[++index];
    } else if (char === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || !cells.length) refuse(line, 'expected a complete table row');
  return cells;
}

function readTable(lines) {
  const rows = lines.map((entry) => ({ line: entry.line, cells: splitRow(entry) }));
  const [header, divider, ...body] = rows;
  if (!divider || !divider.cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
    refuse(divider?.line ?? header.line, 'expected the table header divider');
  }
  for (const row of rows) {
    if (row.cells.length !== header.cells.length) {
      refuse(row.line, 'table row does not match the header width (escape a literal pipe as \\|)');
    }
  }
  return { kind: 'table', line: header.line, headers: header.cells, rows: body };
}

function lineKind(value) {
  if (value.startsWith('|')) return 'table';
  if (/^-(?:\s|$)/.test(value)) return 'bullet';
  if (/^ {0,3}>/.test(value)) return 'quote';
  if (/^ {2}\S/.test(value)) return 'continuation';
  return 'paragraph';
}

function readBlocks(section) {
  const lines = section.content;
  const blocks = [];
  for (let index = 0; index < lines.length;) {
    const { value, line } = lines[index];
    const kind = lineKind(value);
    let end = index + 1;
    if (kind === 'bullet') {
      while (lineKind(lines[end]?.value ?? '') === 'continuation') end++;
      const text = lines.slice(index, end).map((entry) => entry.value.trim()).join(' ').slice(1).trim();
      const label = text.match(/^\*\*([^*]+)\*\*(?:\s|$)/);
      blocks.push({ kind, line, text, label: label?.[1], answer: false });
    } else if (kind === 'quote') {
      const previous = blocks.at(-1);
      if (previous?.kind !== 'bullet') refuse(line, 'a quoted answer must follow a question or a notes bullet');
      while (lineKind(lines[end]?.value ?? '') === 'quote') end++;
      previous.answer = lines.slice(index, end).some((entry) => entry.value.trim().slice(1).trim());
    } else if (kind === 'continuation') {
      refuse(line, 'unexpected indented text');
    } else {
      while (end < lines.length && lineKind(lines[end].value) === kind) end++;
      blocks.push(kind === 'table' ? readTable(lines.slice(index, end)) : {
        kind, line, text: lines.slice(index, end).map((entry) => entry.value).join(' '),
      });
    }
    index = end;
  }
  return blocks;
}

function templateFor(form) {
  const { lang } = form;
  const reference = fs.readFileSync(REFERENCE, 'utf8').replace(/\r\n?/g, '\n');
  const template = [...reference.matchAll(/^```markdown\n([\s\S]*?)^```[ \t]*$/gm)]
    .find((match) => match[1].startsWith('# ' + TITLES[lang]));
  if (!template) throw new Error(`meeting form reference has no ${lang} template`);
  const { metBy, signs, datesLabel, datesQuestion, samples, oldSamples, access, oldAccess } = LEGACY[lang];
  const legacy = readBlocks(form.sections[0])[0]?.rows?.some(({ cells }) => cells[0] === metBy);
  return readSections(template[1]).sections.map((section) => {
    const blocks = readBlocks(section);
    if (!legacy) return { ...section, blocks };

    if (!section.heading) {
      const [details] = blocks;
      details.rows.pop();
      details.rows[1].cells[0] = metBy;
    }
    const timelineIndex = blocks.findIndex(isTimelineTable);
    if (timelineIndex !== -1) {
      blocks.splice(timelineIndex, 2, { kind: 'bullet', label: datesLabel, text: `**${datesLabel}** ${datesQuestion}` });
    }
    for (const block of blocks) {
      if (block.kind === 'table' && isSignatureTable(block)) block.rows.at(-1).cells[0] = signs;
      if (block.kind === 'bullet') block.text = block.text.replace(samples, oldSamples).replace(access, oldAccess);
    }
    return { ...section, blocks };
  });
}

function checkHeaders(actual, expected) {
  if (!expected.headers.every((header, index) => header === actual.headers[index])
      || actual.headers.length !== expected.headers.length) {
    refuse(actual.line, `expected the table header: ${expected.headers.join(' | ')}`);
  }
}

function checkFixedRows(actual, expected) {
  for (const [index, { cells }] of expected.rows.entries()) {
    if (actual.rows[index]?.cells[0] !== cells[0]) {
      refuse(actual.rows[index]?.line ?? actual.line, `expected the row: ${cells[0]}`);
    }
  }
  if (actual.rows.length > expected.rows.length) {
    refuse(actual.rows[expected.rows.length].line, 'unexpected row in a fixed table');
  }
}

function isSignatureTable(table) {
  return ['Signature', 'التوقيع'].includes(table.headers[2]);
}

function isTimelineTable(block) {
  return block.kind === 'table' && Object.values(TIMELINE).includes(block.headers[0]);
}

function displayFixedRows(rows, lang) {
  const current = SIDE[lang];
  const earlier = LEGACY[lang];
  return rows.map(({ cells: [role, ...values], ...row }) => {
    const name = role === earlier.metBy ? current.metBy : role === earlier.signs ? current.signs : role;
    return { ...row, cells: [name, ...values] };
  });
}

function tableAnswers(table, fixed) {
  const hasRowLabel = fixed || table.headers[0] === '#';
  return table.rows.map(({ cells }) => hasRowLabel ? cells.slice(1) : cells);
}

function blankTableCells(table, answers, fixed, later) {
  const rows = fixed ? answers : answers.filter((row) => row.some(Boolean));
  // A repeatable question needs at least one answer row. Empty spare rows are for extra answers.
  if (!rows.length) return table.headers.length - Number(table.headers[0] === '#');
  const required = rows.flatMap((row) => {
    const [requirement, timing] = row;
    return later && timing === later ? [requirement, timing] : row;
  });
  return required.filter((cell) => !cell).length;
}

function matchBlocks(section, expected, role, lang) {
  const blocks = readBlocks(section);
  const model = [];
  let answered = false;
  let blank = 0;
  let approved = false;
  if (role === 'notes') {
    for (const block of blocks) {
      if (block.kind !== 'bullet') refuse(block.line, 'expected a notes bullet');
      answered ||= Boolean(block.text || block.answer);
    }
    return { model: expected, answered, blank };
  }
  for (const [index, want] of expected.entries()) {
    const got = blocks[index];
    if (got?.kind !== want.kind) refuse(got?.line ?? section.line, `expected a ${want.kind} in this section`);
    if (want.kind === 'table') {
      checkHeaders(got, want);
      const fixed = want.headers[0] !== '#' && want.rows.every(({ cells }) => cells[0]);
      if (fixed) checkFixedRows(got, want);
      const answers = tableAnswers(got, fixed);
      answered ||= answers.some((row) => row.some(Boolean));
      if (!isSignatureTable(want)) {
        if (role === 'decision') {
          const marked = got.rows.filter(({ cells }) => cells[1]);
          blank += Number(marked.length !== 1);
          approved = marked.length === 1 && marked[0].cells[0] === want.rows[0].cells[0];
        } else {
          // Only section 6 allows a later requirement to omit its check.
          const later = section.heading.startsWith('### 6. ') ? LATER[lang] : undefined;
          blank += blankTableCells(got, answers, fixed, later);
        }
      }
      model.push({ ...want, fixed, actual: fixed ? displayFixedRows(got.rows, lang) : got.rows });
    } else if (want.kind === 'bullet') {
      if (got.label !== want.label) refuse(got.line, `expected the question: ${want.label}`);
      const hasInlineAnswer = got.text !== want.text && got.text !== `**${got.label}**`;
      const filled = got.answer || hasInlineAnswer;
      answered ||= filled;
      // Section 10 only asks for a reason when changes are requested or discovery stops.
      if (!filled && !approved) blank++;
      model.push(want);
    } else {
      if (got.text !== want.text) refuse(got.line, `expected the form text: ${want.text}`);
      model.push(want);
    }
  }
  if (blocks.length > expected.length) refuse(blocks[expected.length].line, 'unexpected content in this section');
  return { model, answered, blank };
}

function parse(markdown) {
  const form = readSections(markdown);
  const template = templateFor(form);
  let answered = false;
  let blank = 0;
  let number = 1;
  let open = [];
  let details = [];
  let decisionHeading = '';
  const stages = [];
  const signatures = [];
  for (const [index, want] of template.entries()) {
    const section = form.sections[index];
    if (section?.heading !== want.heading) refuse(section?.line ?? form.end, `expected ${want.heading}`);
    const role = /^### 9\./.test(section.heading) ? 'notes' : /^### 10\./.test(section.heading) ? 'decision' : '';
    const { model, answered: filled, blank: blanksInSection } = matchBlocks(section, want.blocks, role, form.lang);
    if (index === 0) {
      details = model[0].actual;
    } else if (index === 1) {
      for (const { line, cells } of model[0].actual) {
        if (cells[0] !== String(number) || !/^(?:[1-4]|1, 2)$/.test(cells[2])) {
          refuse(line, 'expected consecutive meeting numbers and a stage from 1 to 4 (or 1, 2)');
        }
        number++;
      }
      answered ||= model[0].actual.some(({ cells }) => Boolean(cells[4]));
    } else if (index === 2) {
      open = model[0].actual.map(({ line, cells }) => {
        if (!cells[1]) refuse(line, 'the open question is blank');
        return cells[1];
      });
    } else {
      answered ||= filled;
      blank += blanksInSection;
      const heading = section.heading.startsWith('### ') ? section.heading.slice(4) : '';
      if (role === 'decision') decisionHeading = heading;
      if (section.heading.startsWith('## ')) stages.push({ heading: section.heading.slice(3), sections: [] });
      const blocks = model.map((block) => {
        if (block.kind !== 'table' || !isSignatureTable(block)) return block;
        const scope = role === 'decision';
        const signature = { ...block, kind: 'signature', scope, label: scope ? UI[form.lang].scopeSignature : heading };
        signatures.push(signature);
        return signature;
      });
      stages.at(-1).sections.push({ heading, blocks });
    }
  }
  if (form.sections.length > template.length) refuse(form.sections[template.length].line, 'unexpected heading after the form');
  const mode = open.length ? 'open' : !answered ? 'whole' : blank ? 'incomplete' : 'clear';
  const followupSignature = signatures.find(({ scope }) => scope === open.includes(decisionHeading));
  return { lang: form.lang, project: form.project, number, open, details, stages, followupSignature, blank, mode };
}

const UI = {
  en: {
    intro: 'Four stages before anything is built, with as many meetings as each needs.',
    lead: 'Write what the client says, in their words. If something has not been decided, write "not decided".',
    details: 'Meeting details', project: 'Project', meeting: 'Meeting', date: 'Date', place: 'Place',
    attendees: 'Who came (name and job)', news: 'Anything new the client said', open: 'Still open',
    questionLabel: 'Question', contextLabel: 'Context', answerLabel: 'Answer',
    clear: 'Nothing is open.', scopeSignature: 'Signatures for the scope decision', save: 'Save answers',
    incomplete: (n) => `${n} ${n === 1 ? 'question is' : 'questions are'} blank. Update Still open.`,
    clearTyping: 'Clear saved typing', privacy: 'Client answers stay in this browser until cleared.',
    unavailable: 'Browser storage is unavailable. Typing will not survive closing or reloading this tab. Save your answers before leaving.',
    confirm: 'Clear the typing for this meeting from this browser?',
    saved: 'Answers downloaded.', cleared: 'Typing cleared.', answers: (n) => `Meeting ${n} answers`,
  },
  ar: {
    intro: 'أربع مراحل قبل أن يُبنى أي شيء، وفي كل مرحلة ما يلزمها من اجتماعات.',
    lead: 'اكتب ما يقوله العميل بكلماته. إذا لم يُحسم أمر، فاكتب «لم يُحسم».',
    details: 'تفاصيل الاجتماع', project: 'المشروع', meeting: 'الاجتماع', date: 'التاريخ', place: 'المكان',
    attendees: 'الحاضرون (اسم كل واحد ووظيفته)', news: 'أي جديد قاله العميل', open: 'ما زال مفتوحًا',
    questionLabel: 'السؤال', contextLabel: 'السياق', answerLabel: 'الإجابة',
    clear: 'لا توجد أسئلة مفتوحة.', scopeSignature: 'توقيعات قرار النطاق', save: 'حفظ الإجابات',
    incomplete: (n) => `${n} من الأسئلة بلا إجابة. حدّث «ما زال مفتوحًا».`,
    clearTyping: 'مسح الكتابة المحفوظة', privacy: 'تبقى إجابات العميل في هذا المتصفح حتى تمسحها.',
    unavailable: 'التخزين في المتصفح غير متاح. لن تُحفظ كتابتك بعد إغلاق علامة التبويب أو إعادة تحميلها. احفظ الإجابات قبل المغادرة.',
    confirm: 'هل تريد مسح ما كتبته لهذا الاجتماع من هذا المتصفح؟',
    saved: 'تم تنزيل الإجابات.', cleared: 'مُسحت الكتابة.', answers: (n) => `إجابات الاجتماع ${n}`,
  },
};

const CSS = `
* { box-sizing: border-box; }
:root {
  --accent: #0f766e;
  --ink: #141a24;
  --text: #2b3240;
  --quiet: #6b7280;
  --line: #d5d9e0;
  --zebra: #f5f6f8;
  color: var(--text);
  background: var(--zebra);
  font: 100%/1.6 system-ui, "Segoe UI", sans-serif;
}
body { margin: 0; }
main { max-inline-size: 54rem; padding: clamp(1rem, 4vw, 3rem); margin-inline: auto; background: #fff; }
header { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .1rem 1rem; align-items: start; }
h1, h2, h3 { color: var(--ink); font-weight: 800; line-height: 1.2; overflow-wrap: anywhere; }
h1 { grid-column: 1; grid-row: 2; font-size: clamp(1.9rem, 5vw, 2.6rem); letter-spacing: -.01em; margin: 0; }
h2 { font-size: 1.75rem; margin: 0 0 .9rem; padding-block-end: .55rem; border-block-end: 2.5px solid var(--ink); }
h3 { font-size: 1.35rem; margin: 1.5rem 0 .6rem; }
p { margin-block: .5rem; }
.doc-kind { grid-column: 1; grid-row: 1; color: var(--accent); font-size: .85rem; font-weight: 700; margin: 0; }
.meeting-number { grid-column: 2; grid-row: 1; color: var(--quiet); font-size: .85rem; text-align: end; margin: 0; }
.stage-strip {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px;
  list-style: none; margin: 1rem 0 .3rem; padding: 0;
}
.stage-strip li {
  padding-block-start: .45rem; border-block-start: 4px solid var(--line);
  color: var(--quiet); text-align: center; font-size: .74rem; line-height: 1.3; overflow-wrap: anywhere;
}
.stage-strip li span { display: block; font-size: .95rem; font-weight: 800; }
.stage-strip .current { color: var(--accent); border-color: var(--accent); font-weight: 700; }
.stage-note { margin: 0 0 1rem; color: var(--quiet); font-size: .8rem; }
.lead { margin: 1.1rem 0 1.3rem; padding-inline-start: .9rem; border-inline-start: 4px solid var(--accent); color: var(--quiet); }
.eyebrow { display: block; margin-block-end: .15rem; font-size: .8rem; font-weight: 700; color: var(--accent); }
.section-number { margin-inline-end: .25em; color: var(--accent); }
section { margin-block-start: 1.6rem; }
.meeting-details h2 { font-size: 1.4rem; }
.project-details {
  display: grid; grid-template-columns: minmax(9rem, 16rem) minmax(0, 1fr); gap: .35rem 1.2rem;
  margin: 0 0 .6rem;
}
.project-details, .meeting-details h2 + .meeting-fields {
  padding: .6rem .9rem; background: var(--zebra); border-inline-start: 4px solid var(--accent);
}
.project-details dt { color: var(--ink); font-size: .9rem; font-weight: 700; }
.project-details dd { margin: 0; overflow-wrap: anywhere; }
.meeting-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: .8rem; }
.meeting-fields .field:last-child { grid-column: 1 / -1; }
.field { display: grid; align-content: start; gap: .35rem; margin-block: .8rem; min-inline-size: 0; }
label { color: var(--ink); font-size: .95rem; font-weight: 700; overflow-wrap: anywhere; }
.meeting-fields label { color: var(--quiet); font-size: .9rem; font-weight: 500; }
.meeting-details h2 + .meeting-fields label { color: var(--text); }
input, textarea, button { font: inherit; color: inherit; }
input, textarea {
  inline-size: 100%; padding: .6rem .75rem; background: #fff;
  border: 1px solid var(--quiet); border-radius: 4px;
}
input { min-block-size: 2.75rem; }
textarea { min-block-size: 4rem; resize: vertical; }
fieldset { min-inline-size: 0; border: 1px solid var(--line); margin: .8rem 0; padding: .2rem .85rem; }
legend { color: var(--ink); font-weight: 600; padding-inline: .4rem; }
.table-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: .65rem; }
.table-fields .field { margin-block: .5rem; }
.actions { display: flex; flex-wrap: wrap; gap: .65rem; margin-block: 1rem .65rem; }
button {
  min-block-size: 2.75rem; padding: .6rem 1rem; background: #fff;
  border: 1px solid var(--ink); border-radius: 6px; font-weight: 700; cursor: pointer;
}
button:first-child { background: var(--accent); color: #fff; border-color: var(--accent); }
button:first-child:hover { background: var(--ink); border-color: var(--ink); }
button + button:hover { background: var(--zebra); }
input:focus, textarea:focus, button:focus { outline: 3px solid var(--accent); outline-offset: 2px; }
.hint { color: var(--quiet); }
#storage-warning { border-inline-start: 3px solid var(--accent); padding-inline-start: .7rem; }
table {
  inline-size: 100%; table-layout: fixed; border-collapse: collapse;
  border-block-end: 2px solid var(--ink); margin-block: .65rem;
}
th, td {
  border: 1px solid var(--line); padding: .45rem; text-align: start;
  overflow-wrap: anywhere; vertical-align: top;
}
thead th { background: var(--ink); color: #fff; border-color: var(--ink); padding: .55rem .6rem; }
tbody tr:nth-child(even) { background: var(--zebra); }
tbody th { font-weight: 600; color: var(--ink); }
.signature-table { break-inside: avoid; }
.signature-table caption { text-align: start; font-weight: 600; }
.timeline-table .field { margin: 0; }
.visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
.only-paper, .paper-answer { display: none; }
@media screen and (max-width: 35rem) {
  .meeting-fields, .project-details { grid-template-columns: 1fr; gap: 0; }
  .project-details dd { margin-block-end: .5rem; }
}
@media print {
  :root { background: #fff; font-size: 10pt; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  main { max-inline-size: none; padding: 7.2mm; }
  main:not([data-mode="whole"]) { padding-block-end: 0; }
  h1 { font-size: 25pt; }
  main:not([data-mode="whole"]) section { margin-block-start: 1rem; }
  main:not([data-mode="whole"]) .meeting-fields .field { margin-block: .5rem; }
  h2, h3, legend { break-after: avoid; }
  fieldset, .paper-keep, .field, tr, .signature-table, .timeline-table { break-inside: avoid; }
  input, textarea, .screen-only { display: none !important; }
  .only-paper, .paper-answer { display: block; }
  .field { display: block; }
  .field:not(.meeting-fields .field, .table-fields .field, td .field) {
    display: grid; grid-template-columns: 36% minmax(0, 1fr); gap: 1.2rem;
    margin: 0; padding: .55rem 0; border-block-end: 1px solid var(--line);
  }
  .paper-answer {
    min-block-size: 2.7rem; border-block-end: 1px dotted var(--quiet);
    white-space: pre-wrap; overflow-wrap: anywhere; position: relative;
  }
  .field:not(.meeting-fields .field, .table-fields .field, td .field) .paper-answer:empty::before {
    content: ""; position: absolute; inset-inline: 0; inset-block-start: 1.2rem;
    border-block-start: 1px dotted var(--quiet);
  }
  .meeting-fields .paper-answer, td .paper-answer { min-block-size: 1.5rem; }
  .repeat-row {
    display: flex; margin: 0; padding: 0;
    border: 1px solid var(--line); border-block-end: 0;
  }
  .repeat-row-alt { background: var(--zebra); }
  .repeat-row-end { border-block-end: 2px solid var(--ink); }
  .repeat-row legend {
    float: inline-start; inline-size: 34%; margin: 0; padding: .55rem .7rem;
    font-size: .9rem; border-inline-end: 1px solid var(--line); overflow-wrap: anywhere;
  }
  .repeat-row .row-number {
    inline-size: 2.6rem; padding-inline: .3rem; white-space: nowrap; text-align: center; font-weight: 700;
  }
  .table-fields { flex: 1; display: flex; gap: 0; }
  .table-fields .field { flex: 1; margin: 0; padding: .4rem .6rem; border-inline-start: 1px solid var(--line); }
  .table-fields .field:first-child { border-inline-start: 0; }
  .table-fields label { color: var(--text); font-size: .72rem; font-weight: 600; }
  .table-fields .paper-answer { min-block-size: 1.6rem; }
  .table-fields .paper-answer, td .paper-answer { border: 0; }
  .signature-table td { height: 2.4rem; }
}
`;

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const html = (value) => String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);

function pageFooter(form, title) {
  const arabic = form.lang === 'ar';
  const start = arabic ? 'right' : 'left';
  const end = arabic ? 'left' : 'right';
  const direction = arabic ? 'rtl' : 'ltr';
  const page = arabic ? 'صفحة ' : 'Page ';
  const of = arabic ? ' من ' : ' of ';
  // Escape CSS string syntax and prevent project text from ending the style element.
  const caption = `${title} · ${form.project}`.replace(/["\\<>\u0000-\u001f\u007f]/g,
    (char) => `\\${char.codePointAt(0).toString(16)} `);
  return `
@page {
  size: A4; margin: 16mm 15mm 17mm;
  @bottom-${start} {
    content: "${caption}"; direction: ${direction}; text-align: ${start};
    width: 72%; white-space: normal; overflow-wrap: anywhere;
    color: #6b7280; font: 8pt system-ui, "Segoe UI", sans-serif;
  }
  @bottom-${end} {
    content: "${page}" counter(page) "${of}" counter(pages); direction: ${direction}; text-align: ${end};
    width: 28%; color: #6b7280; font: 8pt system-ui, "Segoe UI", sans-serif;
  }
}
`;
}

function stageTitle(heading) {
  const [, label, number, name] = heading.match(/^(Stage|المرحلة) ([1-4]): (.+)$/);
  return { prefix: `${label} ${number}`, number, name: name[0].toUpperCase() + name.slice(1) };
}

function currentStages(form) {
  if (form.mode === 'whole') return new Set([0]);
  if (form.mode !== 'open') return new Set();
  const normalize = (value) => value.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().replace(/:$/, '').toLowerCase();
  const labels = form.stages.map(({ heading, sections }) => {
    const { prefix, name } = stageTitle(heading);
    const prompts = sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => {
        if (block.kind === 'bullet') return [block.label, block.text];
        if (block.kind !== 'table') return [];
        if (block.fixed) return [...block.headers.slice(1), ...block.rows.map(({ cells }) => cells[0])];
        return block.headers.filter((header) => header !== '#');
      }),
    ]);
    return new Set([heading, prefix, name, ...prompts].filter(Boolean).map(normalize));
  });
  const current = new Set();
  for (const question of form.open) {
    const key = normalize(question);
    const index = labels.findIndex((stage) => stage.has(key));
    // A free-form question can be unassigned or share a short label with another stage.
    if (index !== -1 && labels.findLastIndex((stage) => stage.has(key)) === index) current.add(index);
  }
  return current;
}

function stageStrip(form, ui) {
  const current = currentStages(form);
  const items = form.stages.map(({ heading }, index) => {
    const { number, name } = stageTitle(heading);
    const mark = current.has(index) ? ' class="current" aria-current="step"' : '';
    return `<li${mark}><span>${number}</span>${html(name)}</li>`;
  }).join('');
  return `<ol class="stage-strip" role="list">${items}</ol>\n`
    + `<p class="stage-note">${html(ui.intro)}</p>\n<p class="lead">${html(ui.lead)}</p>\n`;
}

function field({ id, key = id, label, context = '', type, compact = false }) {
  const attrs = `id="${id}" data-answer="${html(key)}" data-question="${html(label)}" data-context="${html(context)}" dir="auto"`;
  const input = type ? `<input ${attrs} type="${type}">` : `<textarea ${attrs} rows="2"></textarea>`;
  const caption = compact ? `<label class="visually-hidden" for="${id}">${html(`${context} · ${label}`)}</label>`
    : `<label for="${id}">${html(label)}</label>`;
  return `<div class="field">${caption}${input}<div class="paper-answer" aria-hidden="true"></div></div>\n`;
}

function signatureTable(block, showCaption = false) {
  const header = block.headers.map((value) => `<th scope="col">${html(value)}</th>`).join('');
  const rows = block.actual.map(({ cells: [role, ...recorded] }) => {
    const values = recorded.map((value) => `<td>${block.scope ? '' : html(value)}</td>`).join('');
    return `<tr><th scope="row">${html(role)}</th>${values}</tr>`;
  }).join('');
  const label = html(block.label);
  const caption = showCaption ? `<caption>${label}</caption>` : '';
  return `<table class="signature-table" aria-label="${label}">${caption}<thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
}

function tableFields(block, section, answerField) {
  const numbered = block.headers[0] === '#';
  const idColumn = numbered || block.fixed;
  return block.rows.map(({ cells }, row) => {
    const legend = block.fixed ? cells[0] : `#${numbered ? cells[0] : row + 1}`;
    const headers = idColumn ? block.headers.slice(1) : block.headers;
    const fields = headers.map((label) => answerField(label, `${section} · ${legend}`)).join('');
    const legendClass = block.fixed ? '' : ' class="row-number"';
    const last = row === block.rows.length - 1 ? ' repeat-row-end' : '';
    const alternate = row % 2 ? ' repeat-row-alt' : '';
    return `<fieldset class="repeat-row${alternate}${last}"><legend${legendClass}>${html(legend)}</legend>`
      + `<div class="table-fields">${fields}</div></fieldset>\n`;
  });
}

function timelineTable(block, section, answerField) {
  const headers = block.headers.map((label) => `<th scope="col">${html(label)}</th>`).join('');
  const rows = block.actual.map(({ cells: [milestone, ...values] }) => {
    const cells = values.map((value, index) => {
      const content = answerField ? answerField(block.headers[index + 1], `${section} · ${milestone}`, true) : html(value);
      return `<td>${content}</td>`;
    }).join('');
    return `<tr><th scope="row">${html(milestone)}</th>${cells}</tr>`;
  }).join('');
  return `<table class="timeline-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function stageQuestions(stage, answerField) {
  const content = stage.sections.flatMap(({ heading, blocks }) => {
    const markup = blocks.flatMap((block) => {
      switch (block.kind) {
        case 'signature': return signatureTable(block, block.scope);
        case 'table': return isTimelineTable(block) ? timelineTable(block, heading, answerField)
          : tableFields(block, heading || stage.heading, answerField);
        case 'paragraph': return `<p>${html(block.text)}</p>`;
        case 'bullet': return answerField(block.text.replace(/\*\*/g, '') || heading, block.text ? heading : '');
      }
    });
    const repeatsHeading = blocks.length === 1 && blocks[0].kind === 'bullet' && !blocks[0].text;
    if (heading && !repeatsHeading) {
      const withHeading = blocks[0]?.kind === 'paragraph' && blocks[1]?.kind === 'signature' ? 2 : 1;
      const first = markup.splice(0, withHeading).join('');
      const styled = html(heading).replace(/^(\d+)\. /, '<span class="section-number">$1</span> ');
      markup.unshift(`<div class="paper-keep"><h3>${styled}</h3>\n${first}</div>`);
    }
    return markup;
  });
  const first = content.splice(0, stage.sections[0].blocks.length + 1).join('');
  const { prefix, name } = stageTitle(stage.heading);
  const title = `<span class="eyebrow">${html(prefix)}</span>${html(name)}`;
  return `<section><div class="paper-keep"><h2>${title}</h2>\n${first}</div>${content.join('')}</section>\n`;
}

function meetingDetails(form, ui) {
  const details = form.details.filter(({ cells }) => cells[1]);
  const written = details.map(({ cells }) => `<dt>${html(cells[0])}</dt><dd>${html(cells[1])}</dd>`).join('');
  const timeline = form.stages[0].sections.flatMap(({ blocks }) => blocks).find(isTimelineTable);
  const hasTimeline = timeline?.actual.some(({ cells }) => cells.slice(1).some(Boolean));
  return `<section class="meeting-details"><h2>${ui.details}</h2>\n`
    + (written ? `<dl class="project-details">${written}</dl>\n` : '')
    + (form.mode !== 'whole' && hasTimeline ? timelineTable(timeline) : '')
    + '<div class="meeting-fields">\n'
    + field({ id: 'meeting-date', label: ui.date, type: 'date' })
    + field({ id: 'meeting-place', label: ui.place, type: 'text' })
    + field({ id: 'meeting-attendees', label: ui.attendees })
    + '</div></section>\n';
}

function formContent(form, ui) {
  let count = 0;
  const occurrences = new Map();
  const answerField = (label, context = '', compact = false) => {
    const identity = JSON.stringify([context, label]);
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    return field({ id: `answer-${++count}`, key: `${identity}:${occurrence}`, label, context, compact });
  };
  if (form.mode === 'whole') return form.stages.map((stage) => stageQuestions(stage, answerField)).join('');
  if (form.mode === 'open') {
    return `<section><h2>${ui.open}</h2>${form.open.map((label) => answerField(label)).join('')}</section>\n`;
  }
  const notice = form.mode === 'incomplete' ? ui.incomplete(form.blank) : ui.clear;
  return `<p class="hint">${notice}</p>\n`;
}

function render(form) {
  const ui = UI[form.lang];
  const dir = form.lang === 'ar' ? 'rtl' : 'ltr';
  const title = TITLES[form.lang].slice(0, -2);
  const css = CSS + pageFooter(form, title);
  const script = `(${runForm.toString()})();`;
  const csp = `default-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; `
    + `script-src 'sha256-${hash(script)}'; style-src 'sha256-${hash(css)}'`;
  const data = {
    project: form.project, client: form.details[0]?.cells[1] ?? '',
    'project-label': ui.project, 'answers-title': ui.answers(form.number),
    'question-label': ui.questionLabel, 'context-label': ui.contextLabel, 'answer-label': ui.answerLabel,
    number: form.number, confirm: ui.confirm, saved: ui.saved, cleared: ui.cleared,
  };
  const attributes = Object.entries(data).map(([key, value]) => `data-${key}="${html(value)}"`).join(' ');
  const buttons = `<div class="actions"><button type="button" id="save-answers">${ui.save}</button>`
    + `<button type="button" id="clear-answers">${ui.clearTyping}</button></div>`;
  const signature = form.followupSignature;
  const signatures = form.mode === 'whole' ? '' : `<section class="only-paper paper-keep"><h2>${html(signature.label)}</h2>`
    + signatureTable(signature) + '</section>';
  return `<!doctype html>\n${MARKER}\n<html lang="${form.lang}" dir="${dir}"><head>\n`
    + '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + `<meta http-equiv="Content-Security-Policy" content="${csp}">\n`
    + `<title>${html(form.project)} · ${ui.meeting} ${form.number}</title>\n<style>${css}</style></head><body>\n`
    + `<main data-mode="${form.mode}"><header><p class="doc-kind">${html(title)}</p><h1>${html(form.project)}</h1>`
    + `<p class="meeting-number">${ui.meeting} ${form.number}</p></header>\n${stageStrip(form, ui)}`
    + `<form id="meeting-sheet" ${attributes} autocomplete="off">\n`
    + meetingDetails(form, ui) + formContent(form, ui)
    + `<section>${field({ id: 'meeting-new', label: ui.news })}</section>\n`
    + `<div class="screen-only">${buttons}<p class="hint">${ui.privacy}</p>`
    + `<p id="storage-warning" role="status" hidden>${ui.unavailable}</p><p id="save-status" role="status"></p></div>\n`
    + `${signatures}</form></main>\n<script>${script}</script></body></html>\n`;
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('base64');
}

// This function is embedded as static script text. Read data and copy from the document.
function runForm() {
  const sheet = document.getElementById('meeting-sheet');
  const copy = sheet.dataset;
  const fields = [...document.querySelectorAll('[data-answer]')];
  const warning = document.getElementById('storage-warning');
  const status = document.getElementById('save-status');
  // Some browsers share localStorage among different file:// pages.
  const pageUrl = window.location.href.split(/[?#]/, 1)[0];
  const key = JSON.stringify(['project-docs:meeting', pageUrl, copy.project, copy.client, copy.number]);
  let dirty = false;

  function warnBeforeLeaving(event) {
    event.preventDefault();
    event.returnValue = '';
  }

  function markDirty(value) {
    if (dirty === value) return;
    dirty = value;
    if (dirty) window.addEventListener('beforeunload', warnBeforeLeaving);
    else window.removeEventListener('beforeunload', warnBeforeLeaving);
  }

  function updatePrint(field) {
    if (field.nextElementSibling) field.nextElementSibling.textContent = field.value;
  }

  function storeTyping() {
    const values = Object.fromEntries(fields.map((field) => [field.dataset.answer, field.value]));
    try {
      window.localStorage.setItem(key, JSON.stringify({ values, dirty }));
      warning.hidden = true;
    } catch {
      warning.hidden = false;
    }
  }

  function quote(text) {
    // A longer fence keeps every character literal without opening Markdown or HTML structures.
    const longestRun = [...text.matchAll(/~+/g)].reduce((length, [run]) => Math.max(length, run.length), 2);
    const fence = '~'.repeat(longestRun + 1);
    return [fence, ...text.split('\n'), fence].map((line) => '> ' + line).join('\n');
  }

  function save() {
    const lines = [`# ${copy.answersTitle}`, '', `## ${copy.projectLabel}`, '', quote(copy.project), ''];
    for (const field of fields) {
      const { question, context } = field.dataset;
      if (field.id.startsWith('answer-')) {
        const questionNumber = field.id.slice('answer-'.length);
        lines.push(`## ${copy.questionLabel} ${questionNumber}`, '', quote(question), '');
        if (context) lines.push(`**${copy.contextLabel}**`, '', quote(context), '');
        lines.push(`**${copy.answerLabel}**`, '');
      } else {
        // Meeting details and new notes use the built-in field labels.
        lines.push(`## ${question}`, '');
      }
      lines.push(quote(field.value), '');
    }
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-${copy.number}-answers.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    markDirty(false);
    storeTyping();
    status.textContent = copy.saved;
  }

  function clear() {
    if (!window.confirm(copy.confirm)) return;
    try {
      window.localStorage.removeItem(key);
      warning.hidden = true;
    } catch {
      warning.hidden = false;
    }
    for (const field of fields) {
      field.value = '';
      updatePrint(field);
    }
    markDirty(false);
    status.textContent = copy.cleared;
  }

  try {
    const entry = JSON.parse(window.localStorage.getItem(key));
    for (const field of fields) {
      const value = entry?.values?.[field.dataset.answer];
      if (typeof value === 'string') field.value = value;
      updatePrint(field);
    }
    markDirty(entry?.dirty === true && fields.some((field) => field.value));
  } catch {
    warning.hidden = false;
  }

  for (const field of fields) {
    field.addEventListener('input', () => {
      updatePrint(field);
      markDirty(true);
      status.textContent = '';
      storeTyping();
    });
  }
  sheet.addEventListener('submit', (event) => event.preventDefault());
  document.getElementById('save-answers').addEventListener('click', save);
  document.getElementById('clear-answers').addEventListener('click', clear);
}

function destinationState(destination, sourceStat) {
  const stat = fs.lstatSync(destination, { throwIfNoEntry: false });
  if (!stat) return undefined;
  if (stat.isSymbolicLink()) throw new Error('the destination is a symbolic link');
  if (stat.dev === sourceStat.dev && stat.ino === sourceStat.ino) throw new Error('the destination is the source file');
  if (!stat.isFile()) throw new Error('the destination is not a regular file');
  return stat;
}

function writePage(source, output, page) {
  const sourcePath = fs.realpathSync(source);
  const folder = fs.realpathSync(path.dirname(output));
  const destination = path.join(folder, path.basename(output));
  const sourceStat = fs.statSync(sourcePath);
  if (sourcePath === destination) throw new Error('the destination is the source file');
  if (path.extname(destination) !== '.html') throw new Error('the destination must end with .html');

  const existing = destinationState(destination, sourceStat);
  if (existing) {
    const fd = fs.openSync(destination, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    try {
      const opened = fs.fstatSync(fd);
      if (opened.dev !== existing.dev || opened.ino !== existing.ino) {
        throw new Error('the destination changed before it could be read');
      }
      if (!fs.readFileSync(fd, 'utf8').split(/\r?\n/).includes(MARKER)) {
        throw new Error('the destination already exists without this generator’s marker');
      }
    } finally {
      fs.closeSync(fd);
    }
  }

  // Prepare the full page before making it available at the destination.
  const tempDir = fs.mkdtempSync(path.join(folder, '.meeting-page-'));
  const temp = path.join(tempDir, 'page.html');
  try {
    fs.writeFileSync(temp, page);
    if (existing) {
      const current = destinationState(destination, sourceStat);
      if (!current || current.dev !== existing.dev || current.ino !== existing.ino
          || current.mtimeMs !== existing.mtimeMs || current.ctimeMs !== existing.ctimeMs) {
        throw new Error('the destination changed before it could be replaced');
      }
      fs.renameSync(temp, destination);
    } else {
      try {
        fs.linkSync(temp, destination);
      } catch (error) {
        // Filesystems such as exFAT lack hard links. The copy must still create the file exclusively.
        if (!['ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EPERM'].includes(error.code)) throw error;
        fs.copyFileSync(temp, destination, fs.constants.COPYFILE_EXCL);
      }
    }
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.rmdirSync(tempDir);
  }
}

module.exports = { parse, render };

if (require.main === module) {
  const [source, output, ...extra] = process.argv.slice(2);
  if (!source || extra.length) {
    console.error('usage: node meeting-page.js docs/meeting-form.md [docs/meeting-form.html]');
    process.exit(2);
  }
  try {
    const form = parse(fs.readFileSync(source, 'utf8'));
    const destination = output || path.join(path.dirname(source), 'meeting-form.html');
    writePage(source, destination, render(form));
    console.log(`wrote ${destination}: meeting ${form.number}`);
  } catch (error) {
    console.error(`meeting page not written: ${error.message}`);
    process.exit(1);
  }
}
