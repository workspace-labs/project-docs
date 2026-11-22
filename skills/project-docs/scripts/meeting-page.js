'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MARKER = '<!-- project-docs:meeting-page -->';
const REFERENCE = path.join(__dirname, '../references/meeting-form.md');
const TITLES = { en: 'Client meeting form: ', ar: 'نموذج اجتماع العميل: ' };
const LATER = { en: 'later', ar: 'لاحقًا' };

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

function templateFor(lang) {
  const reference = fs.readFileSync(REFERENCE, 'utf8').replace(/\r\n?/g, '\n');
  const template = [...reference.matchAll(/^```markdown\n([\s\S]*?)^```[ \t]*$/gm)]
    .find((match) => match[1].startsWith('# ' + TITLES[lang]));
  if (!template) throw new Error(`meeting form reference has no ${lang} template`);
  return readSections(template[1]).sections;
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
      model.push({ ...want, fixed, actual: got.rows });
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
  const template = templateFor(form.lang);
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
    const { model, answered: filled, blank: blanksInSection } = matchBlocks(section, readBlocks(want), role, form.lang);
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
  color: #202625;
  background: #f4f5f3;
  font: 100%/1.55 system-ui, sans-serif;
}
body { margin: 0; }
main { max-inline-size: 52rem; padding: clamp(1rem, 4vw, 3rem); margin-inline: auto; }
h1, h2, h3 { line-height: 1.25; overflow-wrap: anywhere; }
h1 { font-size: clamp(1.75rem, 5vw, 2.6rem); margin: 0; }
h2 { font-size: 1.35rem; margin: 0 0 1rem; }
h3 { font-size: 1.1rem; margin: 1.5rem 0 .65rem; }
p { margin-block: .5rem; }
.meeting-number { color: #48534e; margin-block: .45rem 0; }
section {
  margin-block-start: 1.5rem; padding: clamp(1rem, 3vw, 1.65rem);
  background: #fff; border: 1px solid #bcc6be; border-block-start: 3px solid #24604d;
}
.project-details { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .25rem 1rem; }
.project-details dt { font-weight: 650; }
.project-details dd { margin: 0; overflow-wrap: anywhere; }
.meeting-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: .8rem; }
.meeting-fields .field:last-child { grid-column: 1 / -1; }
.field { display: grid; align-content: start; gap: .35rem; margin-block: .8rem; min-inline-size: 0; }
label { font-weight: 600; overflow-wrap: anywhere; }
input, textarea, button { font: inherit; color: inherit; }
input, textarea {
  inline-size: 100%; padding: .6rem .75rem; background: #fff;
  border: 1px solid #717e76; border-radius: .3rem;
}
input { min-block-size: 2.75rem; }
textarea { min-block-size: 4rem; resize: vertical; }
fieldset { min-inline-size: 0; border: 1px solid #bcc6be; margin: .8rem 0; padding: .2rem .85rem; }
legend { font-weight: 600; padding-inline: .4rem; }
.table-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: .65rem; }
.table-fields .field { margin-block: .5rem; }
.actions { display: flex; flex-wrap: wrap; gap: .65rem; margin-block: 1rem .65rem; }
button {
  min-block-size: 2.75rem; padding: .6rem 1rem; background: #fff;
  border: 1px solid #717e76; border-radius: .3rem; font-weight: 650; cursor: pointer;
}
button:first-child { background: #205541; color: #fff; border-color: #205541; }
button:first-child:hover { background: #174032; }
button + button:hover { background: #e9ede9; }
input:focus, textarea:focus, button:focus { outline: 3px solid #225ba2; outline-offset: 3px; }
.hint { color: #48534e; }
#storage-warning { border-inline-start: 3px solid #9b5b22; padding-inline-start: .7rem; }
table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-block: .65rem; }
th, td {
  border: 1px solid #717e76; padding: .45rem; text-align: start;
  overflow-wrap: anywhere; vertical-align: top;
}
thead { background: #25352f; color: white; }
thead th { border-inline-color: #25352f; }
tbody tr:nth-child(even) { background: #f4f5f3; }
tbody tr:last-child { border-block-end: 2px solid #717e76; }
.signature-table { break-inside: avoid; }
.signature-table caption { text-align: start; font-weight: 600; }
.only-paper, .paper-answer { display: none; }
@media screen and (max-width: 35rem) {
  .meeting-fields, .project-details { grid-template-columns: 1fr; gap: 0; }
  .project-details dd { margin-block-end: .5rem; }
}
@page { size: A4; margin: 14mm; }
@media print {
  :root { color: black; background: white; font-size: 10.5pt; }
  main { max-inline-size: none; padding: 0; }
  h1 { font-size: 22pt; }
  section { padding: 0; border: 0; margin-block-start: .9rem; }
  h2, h3, legend { break-after: avoid; page-break-after: avoid; }
  fieldset, .paper-keep, .field, .signature-table { break-inside: avoid; page-break-inside: avoid; }
  fieldset { padding: .1rem .55rem; }
  input, textarea, .screen-only { display: none !important; }
  .only-paper, .paper-answer { display: block; }
  .field { display: block; }
  .paper-answer {
    min-block-size: 2.65rem; border-block-end: 1px solid #727272;
    white-space: pre-wrap; overflow-wrap: anywhere;
  }
  .meeting-fields .paper-answer { min-block-size: 1.65rem; }
  .signature-table td { height: 2.4rem; }
  thead { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
`;

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const html = (value) => String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);

function field({ id, key = id, label, context = '', type }) {
  const attrs = `id="${id}" data-answer="${html(key)}" data-question="${html(label)}" data-context="${html(context)}" dir="auto"`;
  const input = type ? `<input ${attrs} type="${type}">` : `<textarea ${attrs} rows="2"></textarea>`;
  return `<div class="field"><label for="${id}">${html(label)}</label>${input}<div class="paper-answer" aria-hidden="true"></div></div>\n`;
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
    return `<fieldset><legend>${html(legend)}</legend><div class="table-fields">${fields}</div></fieldset>\n`;
  });
}

function stageQuestions(stage, answerField) {
  const content = stage.sections.flatMap(({ heading, blocks }) => {
    const markup = blocks.flatMap((block) => {
      switch (block.kind) {
        case 'signature': return signatureTable(block, block.scope);
        case 'table': return tableFields(block, heading || stage.heading, answerField);
        case 'paragraph': return `<p>${html(block.text)}</p>`;
        case 'bullet': return answerField(block.text.replace(/\*\*/g, '') || heading, block.text ? heading : '');
      }
    });
    const repeatsHeading = blocks.length === 1 && blocks[0].kind === 'bullet' && !blocks[0].text;
    if (heading && !repeatsHeading) {
      const withHeading = blocks[0]?.kind === 'paragraph' && blocks[1]?.kind === 'signature' ? 2 : 1;
      const first = markup.splice(0, withHeading).join('');
      markup.unshift(`<div class="paper-keep"><h3>${html(heading)}</h3>\n${first}</div>`);
    }
    return markup;
  });
  const first = content.splice(0, stage.sections[0].blocks.length + 1).join('');
  return `<section><div class="paper-keep"><h2>${html(stage.heading)}</h2>\n${first}</div>${content.join('')}</section>\n`;
}

function meetingDetails(form, ui) {
  const details = form.details.filter(({ cells }) => cells[1]);
  const written = details.map(({ cells }) => `<dt>${html(cells[0])}</dt><dd>${html(cells[1])}</dd>`).join('');
  return `<section><h2>${ui.details}</h2>\n`
    + (written ? `<dl class="project-details">${written}</dl>\n` : '')
    + '<div class="meeting-fields">\n'
    + field({ id: 'meeting-date', label: ui.date, type: 'date' })
    + field({ id: 'meeting-place', label: ui.place, type: 'text' })
    + field({ id: 'meeting-attendees', label: ui.attendees })
    + '</div></section>\n';
}

function formContent(form, ui) {
  let count = 0;
  const occurrences = new Map();
  const answerField = (label, context = '') => {
    const identity = JSON.stringify([context, label]);
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    return field({ id: `answer-${++count}`, key: `${identity}:${occurrence}`, label, context });
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
  const script = `(${runForm.toString()})();`;
  const csp = `default-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; `
    + `script-src 'sha256-${hash(script)}'; style-src 'sha256-${hash(CSS)}'`;
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
    + `<title>${html(form.project)} · ${ui.meeting} ${form.number}</title>\n<style>${CSS}</style></head><body>\n`
    + `<main data-mode="${form.mode}"><header><h1>${html(form.project)}</h1>`
    + `<p class="meeting-number">${ui.meeting} ${form.number}</p></header>\n`
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
