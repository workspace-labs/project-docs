#!/usr/bin/env node
// The reader page: a project's planning documents → docs/read.html, one self-contained file that shows
// each document as easy-to-read panes in the Pearl look (soft silver, milky panes, a serif for titles).
// An Overview first (counts, documents, open questions, the plan step in hand and the plan's progress),
// then one view per document. Links switch views at their top with HTML fragments and CSS :target, and
// plan steps fold with <details>, so the page works where JavaScript is off, such as the iPhone file
// preview. The fonts are inside the file; nothing is loaded from the network. Node.js, no packages.
// It only shows the documents: it never changes them, and it decides nothing the documents do not say.
// Every word of every planning document is on the page, in its document's view, in order. The client
// meeting form is not a planning document and is not on the page.
//
// It reads each document through its CommonMark block structure (markdown-blocks.js) and the plan's steps
// with the plan page's own reader (plan-page.js), so the two pages never disagree about a step.
//
//   node read-page.js <project folder>             → writes <project folder>/docs/read.html
//   node read-page.js <project folder> out.html
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { blocks } = require('./markdown-blocks.js');
const planPage = require('./plan-page.js');

const ASSETS = path.join(__dirname, '..', 'assets');
const GENERATOR = 'project-docs read-page';
const pageStart = (lang) => `<!doctype html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="generator" content="${GENERATOR}">
`;
const PAGE_END = '</main></body></html>\n';
const DOCS = [ // id, file in the project, icon
  ['prd', 'docs/prd.md', 'target'], ['trd', 'docs/trd.md', 'cpu'], ['design', 'DESIGN.md', 'palette'],
  ['data', 'docs/data.md', 'db'], ['security', 'docs/security.md', 'shield'], ['handover', 'docs/handover.md', 'pkg'],
  ['plan', 'docs/plan.md', 'route'],
];

const LANGS = {
  en: {
    blurb: { prd: 'What we build and why', trd: 'What it is built with', design: 'The look', data: 'What it saves',
      security: 'Keeping it safe', handover: 'After it is built', plan: 'The steps, in order' },
    short: { prd: 'PRD', trd: 'TRD', design: 'Design', data: 'Data', security: 'Security', handover: 'Handover', plan: 'Plan' },
    // the stamp, exactly as SKILL.md writes it
    stamp: /^v([1-9]\d*) · (?:Draft|Approved (\d{4}-\d{2}-\d{2})(?: by \S.*)?)$/, approvedWord: /^v\d+ · Approved /,
    version: (n) => `v${n}`,
    tbd: /^TBD:\s*/, decided: /\.\s+Decided when\b/, check: /^Check:\s*/, checkWord: 'Check',
    changed: /^Changed (\d{4}-\d{2}-\d{2}):\s*/, changedWord: (d) => `Changed ${d}`,
    because: ', because ', from: '', to: ' → ', tbdWord: 'TBD', changeForm: '"Changed YYYY-MM-DD: <old> → <new>, because <reason>."',
    status: 'Status', stepsSection: 'Steps', step: /^Step (\d+): /,
    ui: {
      docs: 'Documents', overview: 'Overview', projectDocs: 'Project documents', openQs: 'Open questions', waiting: 'Waiting for a decision',
      approvedOf: (a, n) => `${a} of ${n} approved`, documents: 'Documents', approvedStat: 'Approved', draftN: (n) => `${n} draft`,
      must: 'Must-do items', toDecide: 'to decide', stepsChecked: 'Steps checked', sections: 'Sections', changes: 'Changes',
      approvedTag: 'Approved', draftTag: 'Draft', noStamp: 'No stamp', open: (n) => `${n} open`, theDocs: 'The documents', press: 'Press one to read it',
      stepN: (n) => `Step ${n}`, stepOf: (n, t) => `step ${n} of ${t}`, plan: 'Plan', coversShort: 'Covers', openPlan: 'Open the plan',
      progress: 'Plan progress', progressLine: (t, ok, chk) => `${t} ${t === 1 ? 'step' : 'steps'} · ${ok} checked · ${chk} waiting for your check`,
      st: { done: 'Checked', check: 'Waiting for your check', blocked: 'Waits for a decision', todo: 'Not started' },
      planUnread: (why) => `The steps' states are not shown: the plan page cannot read this plan (${why}).`,
      openQ: 'Open question', settled: 'Settled', ready: 'Code, as written in the document', earlier: 'A record kept in the document, as written',
      nothingOpen: 'Nothing open', made: 'Made from the project documents · they stay the source of truth',
    },
  },
  ar: {
    blurb: { prd: 'ماذا نبني ولماذا', trd: 'بماذا يُبنى', design: 'الشكل', data: 'ماذا يحفظ', security: 'كيف نحميه',
      handover: 'بعد البناء', plan: 'الخطوات بالترتيب' },
    short: { prd: 'PRD', trd: 'TRD', design: 'التصميم', data: 'البيانات', security: 'الأمان', handover: 'التسليم', plan: 'الخطة' },
    stamp: /^الإصدار ([1-9]\d*) · (?:مسودة|معتمد (\d{4}-\d{2}-\d{2})(?: من \S.*)?)$/, approvedWord: /^الإصدار \d+ · معتمد /,
    version: (n) => `الإصدار ${n}`,
    tbd: /^لم يُحسم بعد:\s*/, decided: /\.\s+يُحسم عندما/, check: /^الفحص:\s*/, checkWord: 'الفحص',
    changed: /^تغيّر في (\d{4}-\d{2}-\d{2}):\s*/, changedWord: (d) => `تغيّر في ${d}`,
    because: '، لأن', from: 'من ', to: ' إلى ', tbdWord: 'لم يُحسم بعد', changeForm: '"تغيّر في YYYY-MM-DD: من <القديم> إلى <الجديد>، لأن <السبب>."',
    status: 'الحالة', stepsSection: 'الخطوات', step: /^الخطوة (\d+): /,
    ui: {
      docs: 'الوثائق', overview: 'نظرة عامة', projectDocs: 'وثائق المشروع', openQs: 'أسئلة مفتوحة', waiting: 'تنتظر قرارًا',
      approvedOf: (a, n) => `${a} من ${n} معتمدة`, documents: 'الوثائق', approvedStat: 'معتمدة', draftN: (n) => `${n} مسودة`,
      must: 'ما يجب أن يفعله', toDecide: 'للحسم', stepsChecked: 'خطوات فُحصت', sections: 'الأقسام', changes: 'التغييرات',
      approvedTag: 'معتمد', draftTag: 'مسودة', noStamp: 'بلا ختم', open: (n) => `${n} مفتوح`, theDocs: 'الوثائق', press: 'اضغط وثيقة لقراءتها',
      stepN: (n) => `الخطوة ${n}`, stepOf: (n, t) => `الخطوة ${n} من ${t}`, plan: 'الخطة', coversShort: 'تغطي', openPlan: 'افتح الخطة',
      progress: 'تقدّم الخطة', progressLine: (t, ok, chk) => `${t} خطوة · ${ok} فُحصت · ${chk} تنتظر فحصك`,
      st: { done: 'فُحصت', check: 'تنتظر فحصك', blocked: 'تنتظر قرارًا', todo: 'لم تبدأ' },
      planUnread: (why) => `لا تظهر حالات الخطوات: صفحة الخطة لا تستطيع قراءة هذه الخطة (${why}).`,
      openQ: 'سؤال مفتوح', settled: 'حُسم', ready: 'شيفرة كما كُتبت في الوثيقة', earlier: 'سجل محفوظ في الوثيقة كما كُتب',
      nothingOpen: 'لا شيء مفتوح', made: 'صُنعت من وثائق المشروع · وتبقى الوثائق هي المرجع',
    },
  },
};
const CLASS = { done: 'ok', check: 'chk', blocked: 'wait', todo: 'todo' }; // plan-page state → style

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Inline marks: **bold**, `code`, [text](link) shown as text with its link, and a colour square before a hex colour.
function inline(s) {
  const parts = String(s).split(/(`[^`]+`)/);
  return parts.map((p, i) => {
    if (i % 2) return `<code>${esc(p.slice(1, -1))}</code>`;
    return esc(p)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 <span class="lk">($2)</span>')
      .replace(/(^|[^&\w])(#[0-9A-Fa-f]{6})\b/g, '$1<span class="hex"><span class="sw" style="--c:$2"></span>$2</span>');
  }).join('');
}

// ---- tables: a GitHub-style table is a header row, then a delimiter row with the same number of cells
const DELIM_CELL = /^\s*:?-+:?\s*$/;
function cells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const out = []; let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (s[i] === '|') { out.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  out.push(cur.trim());
  return out;
}
function table(lines) {
  if (lines.length < 2 || !lines[0].includes('|') || !lines[1].includes('|')) return null;
  const head = cells(lines[0]); const delim = cells(lines[1]);
  if (delim.length !== head.length || !delim.every((c) => DELIM_CELL.test(c))) return null;
  const rows = lines.slice(2).map(cells);
  // short rows get empty cells (as GitHub does); extra cells are kept, under an empty header, so no word is lost
  const width = Math.max(head.length, ...rows.map((r) => r.length));
  const pad = (r) => r.concat(Array(width - r.length).fill(''));
  return { t: 'table', head: pad(head), rows: rows.map(pad) };
}

const LIST_MARK = /^[ \t]*(?:([-+*])|(\d{1,9})([.)]))(?=[ \t]|$)/;
const tabWidth = (column) => 4 - (column % 4);

// Read only the prefixes of the actual ancestor nodes. An item's width is already
// measured by the block parser. Count tabs in columns, then slice the original text
// so tabs and greater-than signs beyond the container prefix stay literal.
function withoutContainers(raw, lineNo, ancestors) {
  let expanded = raw;
  if (ancestors.length && raw.includes('\t')) {
    expanded = '';
    for (const ch of raw) expanded += ch === '\t' ? ' '.repeat(tabWidth(expanded.length)) : ch;
  }
  let col = 0;
  for (const n of ancestors) {
    const tail = expanded.slice(col);
    if (n.t === 'quote') {
      const marker = /^ {0,3}> ?/.exec(tail);
      if (!marker) break; // a lazy line can omit its remaining container prefixes
      col += marker[0].length;
    } else if (n.line === lineNo || /^ */.exec(tail)[0].length >= n.width) col += n.width;
    else break;
  }
  if (expanded === raw) return raw.slice(col);
  let i = 0; let position = 0;
  while (i < raw.length && position < col) position += raw[i++] === '\t' ? tabWidth(position) : 1;
  return ' '.repeat(Math.max(0, position - col)) + raw.slice(i);
}

function historyClose(from, to, lineOf) {
  // Match complete tags so an attribute's quoted value cannot supply its own tag.
  const tokens = /<!--|`+|<\/?([A-Za-z][\w:-]*)(?=[\s/>])(?:[^<>"']|"[^"]*"|'[^']*')*>/g;
  const ticks = /`+/g;
  let depth = 0; let comment = false; let fence = '';
  for (let row = from; row <= to; row++) {
    const line = lineOf(row);
    // A displayed history may itself contain Markdown in lists and quotes.
    const head = line.replace(/^(?:[ \t]*(?:>[ \t]?|(?:[-+*]|\d{1,9}[.)])[ \t]+))*/, '').trimStart();
    const run = /^(?:`{3,}|~{3,})/.exec(head)?.[0];
    if (fence) {
      if (run && run[0] === fence[0] && run.length >= fence.length && !head.slice(run.length).trim()) fence = '';
      continue;
    }
    if (!comment && run && (run[0] === '~' || !head.slice(run.length).includes('`'))) {
      fence = run;
      continue;
    }
    let col = 0;
    while (col < line.length) {
      if (comment) {
        const end = line.indexOf('-->', col);
        if (end < 0) break;
        comment = false; col = end + 3;
      }
      tokens.lastIndex = col;
      const token = tokens.exec(line);
      if (!token) break;
      col = tokens.lastIndex;
      if (token[0] === '<!--') comment = true;
      else if (token[0][0] === '`') {
        ticks.lastIndex = col;
        for (let match; (match = ticks.exec(line));) {
          if (match[0].length === token[0].length) { col = ticks.lastIndex; break; }
        }
      } else if (token[1].toLowerCase() === 'details') {
        if (token[0].startsWith('</')) {
          if (!depth) return null;
          if (--depth === 0) return { row, col };
        } else depth++;
      }
    }
  }
  return null;
}

// ---- the block tree of one document, in source order, nothing dropped
// ancestors: the containers (items, quotes) around these children, outermost first.
function convert(kids, ctx, ancestors, parentEnd) {
  const out = [];
  const ends = kids.map((n, i) => (i + 1 < kids.length && kids[i + 1].line ? kids[i + 1].line - 1 : parentEnd));
  const lineOf = (l) => withoutContainers(ctx.lines[l - 1] || '', l, ancestors);
  const span = (from, to) => ctx.lines.slice(from - 1, to).map((line, i) => withoutContainers(line, from + i, ancestors));
  const rawBlock = (from, to) => {
    const res = span(from, to);
    while (res.length && !res[res.length - 1].trim()) res.pop();
    return res;
  };
  let list = null;
  for (let i = 0; i < kids.length; i++) {
    const n = kids[i];
    if (n.t !== 'item') list = null;
    if (n.t === 'heading') out.push({ t: 'heading', level: n.level, text: n.text, endLine: n.line + (n.setext ? n.lines.length : 0) });
    else if (n.t === 'para') out.push(table(n.lines) || { t: 'p', text: n.lines.join(' '), line: n.line, nlines: n.lines.length });
    else if (n.t === 'quote') out.push({ t: 'quote', line: n.line, blocks: convert(n.kids, ctx, [...ancestors, n], ends[i]) });
    else if (n.t === 'code') out.push({ t: 'code', lines: rawBlock(n.line, ends[i]) });
    else if (n.t === 'hr') out.push({ t: 'hr' });
    else if (n.t === 'html') {
      // A matched record can span several Markdown blocks. With no matching close, use the
      // ordinary HTML block boundary and keep later Markdown visible.
      const closeTag = /^<details(?=[\s/>]|$)/i.test(lineOf(n.line).trimStart()) && historyClose(n.line, parentEnd, lineOf);
      if (!closeTag) {
        out.push({ t: 'html', lines: rawBlock(n.line, ends[i]) }); continue;
      }
      const { row: close, col: at } = closeTag;
      while (i + 1 < kids.length && kids[i + 1].line && kids[i + 1].line <= close) i++; // the record's own pieces
      const rec = span(n.line, close);
      rec[rec.length - 1] = rec[rec.length - 1].slice(0, at);
      out.push({ t: 'html', lines: rec });
      const after = [lineOf(close).slice(at), ...span(close + 1, ends[i])];
      const text = after.map((l) => l.trim()).filter(Boolean).join(' ');
      if (text) out.push({ t: 'p', text, line: close, nlines: 2 });
    } else if (n.t === 'item') {
      const [, bullet, number, delimiter] = LIST_MARK.exec(lineOf(n.line)) || [];
      const key = bullet || delimiter || '-';
      const ordered = Boolean(number);
      if (!list || list.key !== key) { list = { t: 'list', ordered, key, start: ordered ? Number(number) : 1, items: [] }; out.push(list); }
      list.items.push({ line: n.line, blocks: convert(n.kids, ctx, [...ancestors, n], ends[i]) });
    }
  }
  return out;
}
const mainText = (it) => (it.blocks[0] && it.blocks[0].t === 'p' ? it.blocks[0].text : '');
const rest = (it) => (it.blocks[0] && it.blocks[0].t === 'p' ? it.blocks.slice(1) : it.blocks);

// Code spans use matching backtick runs. A word's apostrophe does not start or end a quotation.
const CHANGE_LITERALS = new RegExp([
  /(?<!\x60)(\x60+)(?!\x60).*?(?<!\x60)\1(?!\x60)/,
  /"(?:\\.|[^"\\])*"/,
  /(?<![\p{L}\p{N}])'(?:\\.|[^'\\]|'(?=[\p{L}\p{N}]))*'(?![\p{L}\p{N}])/u,
  /“[^”]*”/,
  /‘(?:[^’]|’(?=[\p{L}\p{N}]))*’(?![\p{L}\p{N}])/u,
  /«[^»]*»/,
].map((pattern) => pattern.source).join('|'), 'gu');

// A change entry under an open question, read the way SKILL.md writes it. Returns { reopens } or null.
function readChange(text, L) {
  const entry = text.replace(L.changed, '');
  if (!entry.startsWith(L.from)) return null;
  const body = entry.slice(L.from.length);
  // Search for delimiters outside quoted values without changing any positions.
  const separators = body.replace(CHANGE_LITERALS, (span) => '\0'.repeat(span.length));
  const cut = separators.indexOf(L.because);
  if (cut < 0 || !body.slice(cut + L.because.length).trim()) return null;
  const arrow = separators.slice(0, cut).lastIndexOf(L.to);
  if (arrow < 0 || !body.slice(0, arrow).trim()) return null;
  const target = body.slice(arrow + L.to.length, cut).trim();
  return target ? { reopens: target === L.tbdWord } : null;
}

function readDecisions(bs, doc, L) {
  const questions = [];
  function visit(contents, owner) {
    for (const b of contents) {
      // A quote starts its own scope. A quoted example cannot change the decision outside it.
      if (b.t === 'quote') visit(b.blocks, null);
      if (b.t !== 'list') continue;
      for (const it of b.items) {
        const t = mainText(it);
        if (/^\*\*[A-Z]+\d+\.\*\*/.test(t)) doc.must++;
        if (L.changed.test(t)) {
          doc.changes++;
          if (owner) {
            const change = readChange(t, L);
            if (!change) throw new Error(`line ${it.line}: a change under an open question must read ${L.changeForm}`);
            owner.tbdOpen = change.reopens;
          }
        }
        if (L.tbd.test(t)) {
          it.tbdOpen = true;
          questions.push(it);
          visit(rest(it), it);
        } else visit(rest(it), owner);
      }
    }
  }
  visit(bs, null);
  doc.tbd = questions.filter((it) => it.tbdOpen)
    .map((it) => mainText(it).replace(L.tbd, '').split(L.decided)[0].replace(/\.$/, ''));
}

function readDoc(source, id, L) {
  const lines = String(source).normalize('NFC').split(/\r?\n/);
  const tree = blocks(lines.join('\n'));
  const all = convert(tree.kids, { lines }, [], lines.length);
  const doc = { id, sections: [], title: '', stamp: '', version: '', approved: false, stamped: false };
  // the title: the first H1 before any section; anything above it (a comment, say) is kept, shown first
  const firstH2 = all.findIndex((b) => b.t === 'heading' && b.level === 2);
  const h = all.findIndex((b, k) => b.t === 'heading' && b.level === 1 && (firstH2 < 0 || k < firstH2));
  let body = all;
  if (h >= 0) {
    doc.title = all[h].text;
    const q = all[h + 1];
    const stampLine = all[h].endLine + 1; // the stamp follows the title, including a setext underline
    let skip = 1;
    if (q && q.t === 'quote' && q.line === stampLine && q.blocks.length === 1 && q.blocks[0].t === 'p' && q.blocks[0].nlines === 1 && L.stamp.test(q.blocks[0].text)) {
      doc.stamp = q.blocks[0].text; doc.stamped = true; doc.approved = L.approvedWord.test(doc.stamp);
      doc.version = L.version(doc.stamp.match(L.stamp)[1]); skip = 2;
    }
    body = [...all.slice(0, h), ...all.slice(h + skip)];
  }
  const colon = doc.title.indexOf(': ');
  doc.kind = colon > 0 ? doc.title.slice(0, colon) : doc.title;
  let sec = null; let sub = null;
  for (const b of body) {
    if (b.t === 'heading' && b.level <= 2) { sub = null; sec = { title: b.text, level: b.level, body: [], subs: [] }; doc.sections.push(sec); continue; }
    if (!sec) { sec = { title: '', level: 2, body: [], subs: [] }; doc.sections.push(sec); }
    if (b.t === 'heading') { sub = { title: b.text, level: b.level, body: [] }; sec.subs.push(sub); continue; }
    (sub || sec).body.push(b);
  }
  // The latest valid change in document order belongs to the nearest enclosing TBD.
  doc.changes = 0; doc.must = 0;
  readDecisions(doc.sections.flatMap((s) => [...s.body, ...s.subs.flatMap((x) => x.body)]), doc, L);
  doc.steps = [];
  if (id === 'plan') {
    let parsedSteps = [];
    try { parsedSteps = planPage.parse(lines.join('\n')).steps; } catch (e) { doc.planError = e.message; }
    // Overview and Plan use the same steps: parsed states matched to visible headings in the Steps section.
    const stepsSec = doc.sections.find((s) => s.level === 2 && s.title === L.stepsSection);
    if (stepsSec) {
      for (const x of stepsSec.subs.filter((y) => y.level === 3)) {
        const m = x.title.match(L.step);
        if (!m) continue;
        const name = x.title.slice(m[0].length).trim();
        const step = parsedSteps.find((s) => s.n === Number(m[1]) && s.title === name);
        x.step = step || {};
        if (step) doc.steps.push(step);
      }
    }
  }
  return doc;
}

// ---- draw
const P = {
  home: 'M3 11l9-8 9 8M5 9v12h14V9', target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  palette: 'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7h.01M15 7h.01',
  db: 'M12 3c5 0 8 1.3 8 3s-3 3-8 3-8-1.3-8-3 3-3 8-3zM4 6v12c0 1.7 3 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3 3 8 3s8-1.3 8-3',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', pkg: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  route: 'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 17h7a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h7',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.5',
};
const ico = (k) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[k]}"/></svg>`;
const hTag = (level) => `h${Math.min(Math.max(level, 3), 6)}`; // H2 is the pane's h2; H3–H6 keep their own levels

function blocksHtml(bs, L) { return bs.map((b) => block(b, L)).join(''); }
function quoteHtml(bs, L) {
  const levels = bs.filter((b) => b.t === 'heading').map((b) => b.level);
  // Move the whole group toward h3 when it fits without flattening higher ranks.
  const offset = levels.length ? Math.max(0, Math.min(3 - Math.min(...levels), 6 - Math.max(...levels))) : 0;
  return `<blockquote>${bs.map((b) => block(b, L, offset)).join('')}</blockquote>`;
}
function under(b, L) { // what sits under a tile's first line: Check and Changed lines get their marks, the rest in order
  if (b.t !== 'list' || b.ordered) return block(b, L);
  return b.items.map((it) => {
    if (it.tbdOpen !== undefined) return item(it, L);
    const t = mainText(it); const more = blocksHtml(rest(it), L); let m;
    if ((m = t.match(L.check))) return `<div class="check"><i>✓</i><div><b>${esc(L.checkWord)}</b> ${inline(t.slice(m[0].length))}${more}</div></div>`;
    if ((m = t.match(L.changed))) return `<div class="changed"><i>↺</i><div><b>${esc(L.changedWord(m[1]))}</b> ${inline(t.slice(m[0].length))}${more}</div></div>`;
    return `<div class="kid"><div>${t ? inline(t) : ''}${more}</div></div>`;
  }).join('');
}
function item(it, L) {
  const t = mainText(it); const after = rest(it); let m;
  const kids = after.map((b) => under(b, L)).join('');
  const long = t.length > 120 || after.length ? ' long' : '';
  if (!t) return `<div class="tile plain long">${kids}</div>`;
  if ((m = t.match(L.tbd))) {
    if (it.tbdOpen === false) return `<div class="tile settled long"><span class="flag done">${esc(L.ui.settled)}</span><p><b class="tb">${esc(t.slice(0, m[0].length).trim())}</b> ${inline(t.slice(m[0].length))}</p>${kids}</div>`;
    return `<div class="tile open long"><span class="flag">${esc(L.ui.openQ)}</span><p><b class="tb">${esc(t.slice(0, m[0].length).trim())}</b> ${inline(t.slice(m[0].length))}</p>${kids}</div>`;
  }
  if ((m = t.match(/^\*\*([A-Z]+\d+)\.\*\*\s*/))) return `<div class="tile req long"><span class="id">${esc(m[1])}</span><div><p>${inline(t.slice(m[0].length))}</p>${kids}</div></div>`;
  if ((m = t.match(/^\*\*([^*]+?):?\*\*:?\s+/))) {
    return `<div class="tile field${long}"><span class="lbl">${esc(m[1].replace(/:$/, ''))}</span><p>${inline(t.slice(m[0].length))}</p>${kids}</div>`;
  }
  if ((m = t.match(/^([^:*`|]{1,30}):\s+/)) && m[1].trim().split(/\s+/).length <= 4) {
    return `<div class="tile field${long}"><span class="lbl">${esc(m[1])}</span><p>${inline(t.slice(m[0].length))}</p>${kids}</div>`;
  }
  return `<div class="tile plain${long}"><p>${inline(t)}</p>${kids}</div>`;
}
function block(b, L, headingOffset) {
  if (b.t === 'p') return `<p class="lead">${inline(b.text)}</p>`;
  if (b.t === 'heading') {
    const tag = headingOffset === undefined ? hTag(b.level) : `h${b.level + headingOffset}`;
    return `<${tag} class="hq">${inline(b.text)}</${tag}>`;
  }
  if (b.t === 'hr') return '<hr>';
  if (b.t === 'quote') return quoteHtml(b.blocks, L);
  if (b.t === 'code') return `<details class="code"><summary>${esc(L.ui.ready)}</summary><pre>${esc(b.lines.join('\n'))}</pre></details>`;
  if (b.t === 'html') return `<details class="code"><summary>${esc(L.ui.earlier)}</summary><pre>${esc(b.lines.join('\n'))}</pre></details>`;
  if (b.t === 'table') {
    return `<div class="tbl"><table><thead><tr>${b.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${
      b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if (b.ordered) {
    return `<ol class="steps" start="${b.start}">${b.items.map((it, k) => `<li><span class="n">${b.start + k}</span><div>${mainText(it) ? `<p>${inline(mainText(it))}</p>` : ''}${rest(it).map((x) => under(x, L)).join('')}</div></li>`).join('')}</ol>`;
  }
  return `<div class="tiles${b.items.length < 2 ? ' one' : ''}">${b.items.map((it) => item(it, L)).join('')}</div>`;
}

const sizeOf = (bs) => bs.reduce((a, b) => a + (b.t === 'p' ? b.text.length : b.t === 'list' ? b.items.reduce((x, it) => x + mainText(it).length + 200 * rest(it).length, 0) : 999), 0);
const shortOf = (s) => s && !s.subs.length && sizeOf(s.body) < 380;

function section(s, i, all, L) {
  const subs = s.subs.map((x) => {
    const tag = hTag(x.level); const body = blocksHtml(x.body, L);
    if (!x.step) return `<div class="sub lv${x.level}"><${tag}>${inline(x.title)}</${tag}>${body}</div>`;
    // a plan step folds shut to its title and state; the step waiting for the person's check starts open
    const st = x.step.state;
    const badge = st ? ` <span class="st ${CLASS[st]}">${esc(L.ui.st[st])}</span>` : '';
    return `<details class="sub fold"${st === 'check' ? ' open' : ''}><summary><${tag}>${inline(x.title)}${badge}</${tag}><span class="chev" aria-hidden="true"></span></summary><div class="fb">${body}</div></details>`;
  }).join('');
  const short = shortOf(s) && (shortOf(all[i - 1]) || shortOf(all[i + 1])); // half width only beside another short pane
  const head = s.title ? `<header><h2>${inline(s.title)}</h2><span class="nm">${String(i + 1).padStart(2, '0')}</span></header>` : '';
  return `<section class="pane sec${short ? ' half' : ''}">${head}${blocksHtml(s.body, L)}${subs}</section>`;
}

// a small column of hairlines beside a count, the counted part drawn dark
function mark(part, all) {
  const n = Math.max(1, Math.min(all, 18)); const on = all ? Math.round((part / all) * n) : 0;
  return `<svg viewBox="0 0 ${n * 5} 30" class="mk" aria-hidden="true">${Array.from({ length: n }, (_, k) => {
    const h = 6 + ((k * 7) % 5) * 4 + (k < on ? 6 : 0);
    return `<line x1="${k * 5 + 2}" y1="30" x2="${k * 5 + 2}" y2="${30 - h}"${k < on ? ' class="on"' : ''}/>`;
  }).join('')}</svg>`;
}
const stat = (label, val, part, all, note) => `<div class="stat"><p>${esc(label)}</p><b>${val}</b>${note ? `<em class="down">${esc(note)}</em>` : ''}${mark(part, all)}</div>`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function render(docs, lang) {
  const L = LANGS[lang]; const U = L.ui;
  const prd = docs.find((d) => d.id === 'prd') || docs[0];
  const plan = docs.find((d) => d.id === 'plan');
  const steps = plan ? plan.steps : [];
  const okN = steps.filter((s) => s.state === 'done').length;
  const chkN = steps.filter((s) => s.state === 'check').length;
  const current = steps.find((s) => s.state === 'check') || steps.find((s) => s.state !== 'done');
  const openAll = docs.flatMap((d) => d.tbd.map((o) => ({ d, o })));
  const approvedN = docs.filter((d) => d.approved).length;
  const draftN = docs.filter((d) => d.stamped && !d.approved).length;
  const label = (d) => L.short[d.id];
  const tag = (d) => (d.stamped ? `${d.approved ? U.approvedTag : U.draftTag} · ${esc(d.version)}` : esc(U.noStamp));
  const colon = prd.title.indexOf(': ');
  const name = colon > 0 ? prd.title.slice(colon + 2) : prd.title;

  const pick = current ? `<section class="pane pick">
   <h2>${esc(U.stepN(current.n))}</h2><p class="fee">${esc(U.st[current.state])}</p>
   <div class="card"><span class="t">${esc(U.plan)} <span>· ${esc(U.stepOf(steps.indexOf(current) + 1, steps.length))}</span></span>
    <b class="ct">${inline(current.title)}</b><p class="cw">${inline(current.check)}</p>
    ${current.covers ? `<span class="no">${esc(U.coversShort)} ${inline(current.covers)}</span>` : ''}</div>
   <div class="dots">${steps.map((s) => `<i class="${CLASS[s.state]}${s === current ? ' now' : ''}"></i>`).join('')}</div>
   <a href="#v-plan" class="choose">${esc(U.openPlan)}</a></section>` : '';
  const prog = steps.length ? `<section class="pane prog">
   <header><div><h2>${esc(U.progress)}</h2><p>${esc(U.progressLine(steps.length, okN, chkN))}</p></div><span class="badge">${okN}/${steps.length}</span></header>
   <div class="bars">${steps.map((s) => `<i class="${CLASS[s.state]}" style="--v:${{ done: 100, check: 70, blocked: 45, todo: 28 }[s.state]}"></i>`).join('')}</div>
   <div class="legend">${['done', 'check', 'blocked', 'todo'].map((k) => `<span><i class="${CLASS[k]}"></i>${esc(U.st[k])}</span>`).join('')}</div></section>` : '';
  const qs = `<section class="pane qs">
   <header><div><h2>${esc(U.openQs)}</h2><p>${esc(openAll.length ? U.waiting : U.nothingOpen)}</p></div><span class="badge">${openAll.length}</span></header>
   <div class="rows">${openAll.map(({ d, o }) => `<a href="#v-${d.id}" class="row q"><span class="tg">${esc(label(d))}</span><span class="rn">${inline(cap(o))}</span></a>`).join('')}</div></section>`;
  const list = `<section class="pane list">
   <header><div><h2>${esc(U.theDocs)}</h2><p>${esc(U.press)}</p></div></header>
   <div class="rows">${docs.map((d) => `<a href="#v-${d.id}" class="row"><span class="orb">${ico(d.icon)}</span><span class="rn"><b>${esc(d.kind || label(d))}</b><small>${esc(L.blurb[d.id])}</small></span>${d.tbd.length ? `<span class="oq">${esc(U.open(d.tbd.length))}</span>` : ''}<span class="st ${d.approved ? 'ok' : 'chk'}">${tag(d)}</span><span class="arrow" aria-hidden="true">›</span></a>`).join('')}</div></section>`;

  const home = `<article class="doc doc-home" id="v-home" tabindex="-1" aria-labelledby="h-home">
 <div class="top"><div><h1 id="h-home">${esc(name)}</h1><p>${esc(U.projectDocs)}</p></div><span class="pill">${esc(U.approvedOf(approvedN, docs.length))}</span></div>
 <div class="stats pane">${stat(U.documents, docs.length, docs.length, docs.length)}${stat(U.approvedStat, approvedN, approvedN, docs.length, draftN ? U.draftN(draftN) : '')}${
  prd.must ? stat(U.must, prd.must, prd.must, prd.must) : ''}${stat(U.openQs, openAll.length, openAll.length, Math.max(openAll.length, 6), openAll.length ? U.toDecide : '')}${
  steps.length ? stat(U.stepsChecked, `${okN}<small>/${steps.length}</small>`, okN, steps.length) : ''}</div>
 <div class="board${current ? '' : ' nopick'}">${list}${qs}${pick}${prog}</div></article>`;

  const views = docs.map((d) => `<article class="doc doc-${d.id}" id="v-${d.id}" tabindex="-1" aria-labelledby="h-${d.id}">
 <a href="#v-home" class="back"><span class="arrow" aria-hidden="true">‹</span> ${esc(U.overview)}</a>
 <div class="top"><div><p class="kick">${esc(label(d))} · ${esc(L.blurb[d.id])}</p><h1 id="h-${d.id}">${inline(d.title || label(d))}</h1>${d.stamp ? `<p>${inline(d.stamp)}</p>` : ''}</div><span class="pill">${tag(d)}</span></div>
 ${d.planError ? `<p class="note">${esc(U.planUnread(d.planError))}</p>` : ''}
 <div class="stats pane">${stat(U.sections, d.sections.length, d.sections.length, d.sections.length)}${d.must ? stat(U.must, d.must, d.must, d.must) : ''}${
  d.steps.length ? stat(U.stepsChecked, `${okN}<small>/${steps.length}</small>`, okN, steps.length) : ''}${
  stat(U.openQs, d.tbd.length, d.tbd.length, Math.max(d.tbd.length, 4), d.tbd.length ? U.toDecide : '')}${stat(U.changes, d.changes, d.changes, Math.max(d.changes, 6))}</div>
 <div class="grid">${d.sections.map((s, i, all) => section(s, i, all, L)).join('')}</div></article>`).join('');

  const tiles = [`<a href="#v-home" class="tl t-home">${ico('home')}<span>${esc(U.overview)}</span></a>`,
    ...docs.map((d) => `<a href="#v-${d.id}" class="tl t-${d.id}">${ico(d.icon)}<span>${esc(label(d))}</span>${d.tbd.length ? `<em>${d.tbd.length}</em>` : ''}</a>`)].join('');
  const acts = openAll.map(({ d, o }) => `<a href="#v-${d.id}" class="act"><i>${ico('alert')}</i><span>${inline(cap(o))}</span></a>`).join('');
  const activeTiles = ['body:not(:has(.doc:target)) .t-home',
    ...['home', ...docs.map((d) => d.id)].map((id) => `body:has(#v-${id}:target) .t-${id}`)];
  const font = (f) => fs.readFileSync(f).toString('base64');
  const arabic = lang === 'ar'
    ? `@font-face{font-family:Naskh;src:url(data:font/ttf;base64,${font(path.join(ASSETS, 'preview/fonts/NotoNaskhArabic-Regular.ttf'))}) format("truetype")}` : '';
  const serif = lang === 'ar' ? 'Naskh,Newsreader,serif' : 'Newsreader,Georgia,serif';
  const sans = lang === 'ar' ? 'Naskh,Outfit,system-ui,sans-serif' : 'Outfit,system-ui,sans-serif';

  return `${pageStart(lang)}<title>${esc(name)} · ${esc(U.docs)}</title><style>
@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${font(path.join(ASSETS, 'read/Outfit.woff2'))}) format("woff2");font-weight:300 700}
@font-face{font-family:Newsreader;src:url(data:font/woff2;base64,${font(path.join(ASSETS, 'read/Newsreader.woff2'))}) format("woff2");font-weight:400}
${arabic}
:root{--screen:#e6e7e9;--pane:rgba(255,255,255,.42);--tile:rgba(255,255,255,.62);--rim:rgba(255,255,255,.85);--hair:rgba(28,28,30,.08);
--ink:#2c2c2e;--text:#1c1c1e;--text-2:#5d5f63;--muted:#66686c;--bar:#b9bbbf;--bar-2:#d3d5d8;--up:#237a3f;--down:#b02e35;--serif:${serif};--sans:${sans}}
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100vh;color:var(--text);font:400 14px/1.55 var(--sans);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;
background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.75) 42%,transparent 54%) fixed,linear-gradient(100deg,transparent 62%,rgba(255,255,255,.5) 74%,transparent 86%) fixed,var(--screen)}
h1,h2,h3,h4,p{margin:0;font-weight:400}
.tl,.act,.row,.choose,.back{color:inherit;text-decoration:none}
.back,.list .arrow{display:none}
.i{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pane{border-radius:24px;background:var(--pane);box-shadow:inset 0 0 0 1px var(--rim),0 20px 40px -30px rgba(40,44,50,.35)}
.pill{height:34px;padding:0 15px;border-radius:17px;display:inline-flex;align-items:center;font-size:12.5px;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim),0 6px 14px -8px rgba(40,44,50,.4);white-space:nowrap}
.orb{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim),0 6px 14px -8px rgba(40,44,50,.4)}.orb .i{width:15px;height:15px}
.badge{height:20px;padding:0 8px;border-radius:10px;display:inline-grid;place-items:center;font:500 10px/1 var(--sans);background:var(--ink);color:#fff;white-space:nowrap}
.side{position:fixed;inset-inline-start:14px;top:14px;bottom:14px;width:250px;padding:14px;display:flex;flex-direction:column;border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.12));overflow:auto}
.side .cap{padding:4px 8px 10px;font:400 14px/1 var(--serif);color:var(--text-2);border-bottom:1px solid var(--hair)}
.tls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.tl{position:relative;height:74px;border-radius:16px;display:grid;place-content:center;justify-items:center;gap:7px;font-size:12.5px;background:rgba(255,255,255,.4);box-shadow:inset 0 0 0 1px var(--rim);cursor:pointer;transition:background .25s,transform .25s}
.tl:hover{background:#fff;transform:translateY(-2px)}
.tl em{position:absolute;top:7px;inset-inline-end:8px;min-width:17px;height:17px;border-radius:9px;background:var(--ink);color:#fff;font:500 10px/17px var(--sans);font-style:normal;text-align:center}
.acts{margin-top:16px;display:grid;gap:2px}.acts .h{padding:0 8px 6px;font:400 14px/1 var(--serif);color:var(--text-2)}
.act{display:flex;align-items:center;gap:10px;padding:6px;border-radius:21px;font-size:12.5px;line-height:1.3;cursor:pointer}.act:hover{background:rgba(255,255,255,.5)}
.act i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim);color:var(--text-2)}.act .i{width:14px;height:14px}
main{margin-inline-start:278px;padding:18px 22px 30px;padding-inline-start:0;display:flex;flex-direction:column}
.doc{display:none;max-width:1240px;scroll-margin-top:18px}
/* Overview follows the documents so any targeted document can hide it with a sibling selector. */
.doc-home,.doc:target{display:block}
.doc:target ~ .doc-home{display:none}
.doc-home{order:-1}
.doc:focus{outline:none}
.top{min-height:62px;display:flex;align-items:center;gap:10px}.top>div{margin-inline-end:auto}
h1{font:400 27px/1.15 var(--serif);letter-spacing:-.01em}.kick{font-size:12.5px;color:var(--text-2);margin:0 0 4px!important;font-family:var(--sans)!important}
.note{margin:10px 0 0;padding:10px 14px;border-radius:14px;background:var(--tile);box-shadow:inset 0 0 0 1px rgba(176,46,53,.35);color:var(--text);font-size:13px}
.top p{margin-top:4px;font:400 15px/1.3 var(--serif);color:var(--text-2)}
.stats{display:flex;align-items:center;min-height:86px;margin-top:12px;padding:0 6px}
.stat{position:relative;flex:1;padding:0 18px;min-width:0}.stat+.stat{border-inline-start:1px solid var(--hair)}
.stat p{font:400 14px/1.1 var(--serif);color:var(--text-2)}
.stat b{display:inline-block;margin-top:8px;font:400 23px/1 var(--serif)}.stat b small{font-size:14px;color:var(--muted)}
.stat em{margin-inline-start:8px;font-style:normal;font-size:11px}.stat em.down{color:var(--down)}
.mk{position:absolute;inset-inline-end:16px;top:6px;width:66px;height:32px;overflow:visible}.mk line{stroke:var(--bar);stroke-width:1.1;stroke-linecap:round}.mk line.on{stroke:var(--text)}
.board{display:grid;grid-template-columns:330px minmax(0,1fr) minmax(0,1fr);gap:12px;margin-top:12px}
.board.nopick{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.pane>header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.pane h2{font:400 17px/1.2 var(--serif)}.pane header p{margin-top:5px;font-size:11.5px;color:var(--muted)}
.pick{grid-row:1/3;padding:28px 20px 22px;text-align:center;display:flex;flex-direction:column;align-items:center}
.pick h2{font-size:27px}.fee{margin-top:6px;font:400 17px/1.2 var(--serif);color:var(--muted)}
.card{position:relative;width:250px;min-height:300px;margin:26px 0 18px;border-radius:26px;padding:20px 20px 20px;text-align:start;color:#3b382f;
background:linear-gradient(160deg,#f3efe2,#ddd6c2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),inset 0 2px 0 rgba(255,255,255,.9),-14px 12px 0 -6px rgba(255,255,255,.45),14px 14px 0 -8px rgba(210,212,215,.7),0 30px 40px -24px rgba(40,44,50,.6);overflow:hidden}
.card::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 60% at 110% 20%,rgba(255,255,255,.75),transparent 60%),radial-gradient(90% 50% at -10% 75%,rgba(255,255,255,.6),transparent 60%);pointer-events:none}
.card>*{position:relative}.card .t{font:400 15px/1.2 var(--serif)}.card .t span{color:#5c5747}
.card .ct{display:block;margin-top:34px;font:400 22px/1.2 var(--serif)}.card .cw{margin-top:12px;font-size:12px;line-height:1.5;color:#45412f}
.card .no{display:block;margin-top:14px;font:400 15px/1.25 var(--serif)}
.dots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:230px}
.dots i{width:10px;height:10px;border-radius:50%;background:var(--bar-2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8)}
.dots i.ok{background:var(--ink)}.dots i.chk{background:var(--bar)}.dots i.wait{background:#fff;box-shadow:inset 0 0 0 1.5px var(--down)}
.dots i.now{transform:scale(1.5);box-shadow:inset 0 0 0 1px #fff,0 0 0 3px rgba(255,255,255,.9),0 0 0 4px var(--hair)}
.pick h3{margin-top:16px;font:400 14px/1.4 var(--serif);color:var(--text-2);max-width:280px}
.choose{min-width:150px;height:40px;padding:0 22px;border-radius:20px;display:inline-grid;place-items:center;font-size:12.5px;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.45),0 10px 18px -10px rgba(40,44,50,.5);cursor:pointer;margin-top:18px}
.choose:hover{background:var(--ink);color:#fff}
.list,.qs,.prog{padding:18px}.prog{grid-column:2/4}.nopick .prog{grid-column:1/3}
.rows{display:grid;gap:4px;margin-top:12px}
.row{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:16px;cursor:pointer}.row:hover{background:rgba(255,255,255,.6)}
.rn{flex:1;min-width:0;font-size:13px;line-height:1.35}.rn b{display:block;font:400 15px/1.2 var(--serif)}.rn small{color:var(--muted);font-size:11.5px}
.oq{font-size:11.5px;color:var(--down);white-space:nowrap}
.tg{font:500 10px/1 var(--sans);padding:5px 8px;border-radius:9px;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim);color:var(--text-2);flex:none}
.row.q{align-items:flex-start}
.bars{display:flex;align-items:flex-end;gap:3px;height:90px;margin-top:14px}
.bars i{flex:1;height:calc(var(--v)*1%);border-radius:1px;background:var(--bar-2)}.bars i.ok{background:var(--ink)}.bars i.chk{background:var(--bar)}.bars i.wait{background:rgba(200,55,60,.18);box-shadow:inset 0 2px 0 var(--down)}
.legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:11.5px;color:var(--text-2)}.legend i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-inline-end:6px;background:var(--bar-2)}
.legend i.ok{background:var(--ink)}.legend i.chk{background:var(--bar)}.legend i.wait{background:rgba(200,55,60,.18);box-shadow:inset 0 2px 0 var(--down)}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;margin-top:12px}
.sec{grid-column:span 2;padding:18px 20px}.sec.half{grid-column:span 1}
.nm{font:400 13px/1 var(--serif);color:var(--muted)}.sec>header{margin-bottom:10px}
.lead{margin:0 0 8px;max-width:78ch}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:8px;margin:4px 0 8px}.tiles.one{grid-template-columns:1fr}
.tile{background:var(--tile);border-radius:16px;padding:10px 13px;box-shadow:inset 0 0 0 1px var(--rim)}.tile.long{grid-column:1/-1}.tile p{margin:0}
.lbl{display:block;font:400 13px/1.25 var(--serif);color:var(--muted);margin-bottom:3px}
.tile.open{background:rgba(255,255,255,.75);box-shadow:inset 0 0 0 1px rgba(200,55,60,.4)}
.flag{display:inline-block;height:20px;padding:0 9px;border-radius:10px;font:500 10px/20px var(--sans);background:var(--down);color:#fff;margin-bottom:6px}.flag.done{background:var(--ink)}
.tile.req{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:start}.tile.req>div{grid-column:2}
.id{background:var(--ink);color:#fff;border-radius:10px;padding:3px 8px;font:400 13px/1.2 var(--serif)}
.check,.changed,.kid{display:flex;gap:8px;margin-top:6px;font-size:12.5px;color:var(--text-2)}
.check i,.changed i{font-style:normal;width:18px;height:18px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:10px;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim)}
.check i{color:var(--up)}.check b,.changed b{color:var(--text);font-weight:500}.check>div,.changed>div,.kid>div{min-width:0}
.steps{list-style:none;margin:4px 0 8px;padding:0;display:grid;gap:5px}
.steps li{display:flex;gap:12px;align-items:flex-start;background:var(--tile);border-radius:16px;padding:8px 12px;box-shadow:inset 0 0 0 1px var(--rim)}
.steps .n{width:22px;height:22px;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font:400 12px/1 var(--serif);flex:none}.steps p{margin:1px 0 0}
.tbl{overflow-x:auto;margin:6px 0 10px;border-radius:16px;background:var(--tile);box-shadow:inset 0 0 0 1px var(--rim)}
table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:start;font:400 13px/1.25 var(--serif);color:var(--muted);padding:9px 12px}
td{padding:8px 12px;border-top:1px solid var(--hair);vertical-align:top}
.hex{white-space:nowrap}.sw{display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--c);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12),0 2px 4px -1px rgba(40,44,50,.35);vertical-align:-3px;margin-inline-end:7px}
code{font-size:.9em;background:var(--tile);border-radius:6px;padding:0 5px;box-shadow:inset 0 0 0 1px var(--rim)}.lk{color:var(--muted)}
.sub{border-top:1px solid var(--hair);margin-top:12px;padding-top:2px}
main h3,main h4,main h5,main h6{font:400 16px/1.25 var(--serif);margin:12px 0 8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}main h3{font-size:17px}main h5{font-size:15px}main h6{font-size:14px;color:var(--text-2)}
.sub.lv4{margin-inline-start:14px}.sub.lv5{margin-inline-start:28px}.sub.lv6{margin-inline-start:42px}
blockquote{margin:6px 0 10px;padding:4px 0;padding-inline-start:14px;border-inline-start:2px solid var(--bar)}hr{border:0;border-top:1px solid var(--hair);margin:12px 0}.tb{font-weight:500}
details.fold{margin-top:0;padding:0}details.fold>summary{list-style:none;display:flex;align-items:center;gap:12px;cursor:pointer;padding:4px 6px;border-radius:12px}
details.fold>summary::-webkit-details-marker{display:none}details.fold>summary:hover{background:rgba(255,255,255,.55)}
details.fold>summary>*:first-child{flex:1;margin:8px 0}summary:focus-visible,a:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.tl:focus-visible{outline-offset:3px}
.chev{width:9px;height:9px;border-inline-end:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);opacity:.55;flex:none;margin-inline-end:6px;transition:transform .2s}
details.fold[open]>summary .chev{transform:rotate(225deg)}details.fold .fb{padding:0 6px 10px}
details.code summary{cursor:pointer;color:var(--text-2);font-size:12.5px;padding:6px 0}
pre{background:var(--tile);border-radius:16px;padding:14px;overflow:auto;font-size:12px;line-height:1.5;box-shadow:inset 0 0 0 1px var(--rim);direction:ltr;text-align:left}
.st{display:inline-block;padding:2px 9px;border-radius:10px;font:500 10.5px/16px var(--sans);background:var(--tile);color:var(--text-2);box-shadow:inset 0 0 0 1px var(--rim)}
.st.ok{background:var(--ink);color:#fff;box-shadow:none}.st.wait{color:var(--down)}.st.todo{color:var(--muted)}
.brand{margin-top:28px;padding:14px 0 4px;text-align:center;font-size:11.5px;color:var(--muted);border-top:1px solid var(--hair)}
.brand b{display:block;margin-top:4px;font:400 15px/1 var(--serif);color:var(--text-2);letter-spacing:.02em}
@media (prefers-reduced-motion:reduce){.chev,.tl{transition:none}}
${activeTiles.join(',')}{background:linear-gradient(160deg,#47474a,var(--ink));color:#fff;box-shadow:0 14px 22px -12px rgba(28,28,30,.7)}
${activeTiles.map((s) => `${s} em`).join(',')}{background:#fff;color:var(--ink)}
@media (max-width:1100px){.board{grid-template-columns:300px minmax(0,1fr)}.prog{grid-column:1/3}.board.nopick{grid-template-columns:minmax(0,1fr)}.nopick .prog{grid-column:auto}}
@media (max-width:820px){.side{display:none}
main{margin:0;padding:8px 16px 28px}.doc{scroll-margin-top:8px}
.back{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 4px;margin:6px 0 4px;font-size:16px;color:var(--ink);border-radius:8px}
.back .arrow,.list .row .arrow{font-size:20px;line-height:1}
html[dir=rtl] .arrow{transform:scaleX(-1)}
.list .rows{gap:0}.list .row{gap:8px;padding:12px 8px;border-bottom:1px solid var(--hair);border-radius:0}
.list .row:last-child{border-bottom:0}.list .row .arrow{display:inline-block;color:var(--muted);margin-inline-start:2px}
.list .rn,.list .st{overflow-wrap:anywhere}
.top{flex-wrap:wrap;padding:4px 0;min-height:0}h1{font-size:22px}.top p{font-size:13.5px}
.doc:not(.doc-home) .top .pill{display:none}.doc-home .top .pill{height:28px;font-size:11.5px}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:start;gap:2px 0;min-height:0;margin-top:10px;padding:10px 4px}.stat{padding:4px 10px}.stat+.stat{border-inline-start:0}.mk{display:none}
.stat p{font-size:12px}.stat b{font-size:19px;margin-top:3px}.stat b small{font-size:12px}.stat em{display:block;margin:2px 0 0;font-size:10.5px}
.board,.board.nopick,.grid{grid-template-columns:minmax(0,1fr);gap:10px}.pick,.list,.qs,.prog,.sec,.sec.half{grid-column:auto;grid-row:auto}
.sec{padding:14px 14px}.pane{border-radius:20px}.pane h2{font-size:16px}.tile{padding:9px 11px}
.pick{padding:18px 14px 16px}.pick h2{font-size:22px}.fee{font-size:15px}.card{width:100%;max-width:320px;min-height:0;margin:16px 0 14px;padding:16px}.card .ct{margin-top:18px;font-size:19px}
main h3,main h4,main h5,main h6{font-size:15px}details.fold>summary{padding:2px 2px}}
@media (max-width:360px){
.list .row{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:3px 6px;padding-inline:4px}
.list .orb{grid-area:1/1/span 2}.list .rn{grid-area:1/2/span 2}
.list .st{grid-area:1/3;align-self:end;justify-self:end;max-width:9em}
.list .oq{grid-area:2/3;align-self:start;justify-self:end}
.list .row .arrow{grid-area:1/4/span 2}}
@media print{.side,.back{display:none}main{margin:0}.doc{display:block!important;break-after:page}details{display:block}details>*{display:block}}
</style></head><body>
<nav class="side" aria-label="${esc(U.docs)}"><div class="cap">${esc(U.docs)}</div><div class="tls">${tiles}</div>
${openAll.length ? `<div class="acts"><div class="h">${esc(U.openQs)}</div>${acts}</div>` : ''}</nav>
<main>${views}${home}
<footer class="brand">${esc(U.made)}<b>WorkSpace Labs</b></footer>${PAGE_END}`;
}

function readProject(dir) {
  const found = DOCS.filter(([, f]) => fs.existsSync(path.join(dir, f)));
  if (!found.length) throw new Error(`Project error: no project documents in ${dir} (looked for ${DOCS.map(([, f]) => f).join(', ')})`);
  const sources = found.map(([id, f, icon]) => {
    try { return { id, f, icon, src: fs.readFileSync(path.join(dir, f), 'utf8') }; } catch (e) { throw new Error(`${f}: ${e.message}`); }
  });
  const lead = sources.find((s) => s.id === 'prd') || sources[0];
  let h1 = '';
  try { const top = blocks(String(lead.src).normalize('NFC')).kids; const h = top.find((b) => b.t === 'heading' && b.level === 1); h1 = h ? h.text : ''; } catch (e) { /* refused below, with its file */ }
  const lang = /[؀-ۿ]/.test(h1) ? 'ar' : 'en';
  const docs = sources.map(({ id, f, icon, src }) => {
    try { return Object.assign(readDoc(src, id, LANGS[lang]), { icon, file: f }); } catch (e) { throw new Error(`${f}: ${e.message}`); }
  });
  return { docs, lang, sources: found.map(([, f]) => path.join(dir, f)) };
}

// Inside the project the destination is reached only through plain folders.
function outputPath(dir, dest) {
  if (path.extname(dest).toLowerCase() !== '.html') throw new Error(`${dest}: the page must be written to an .html file`);
  const abs = path.resolve(dest); const parent = path.dirname(abs);
  const rel = path.relative(path.resolve(dir), parent);
  if (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel)) {
    let at = path.resolve(dir);
    for (const part of rel.split(path.sep).filter(Boolean)) {
      at = path.join(at, part);
      let st = null;
      try { st = fs.lstatSync(at); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      if (st && st.isSymbolicLink()) throw new Error(`${at}: is a link; the page is written only into plain folders of the project`);
      if (st && !st.isDirectory()) throw new Error(`${at}: is not a folder`);
    }
  }
  return abs;
}

const READER_STARTS = Object.keys(LANGS).map((lang) => Buffer.from(pageStart(lang)));
const READER_END = Buffer.from(PAGE_END);
function isReaderPage(fd, size) {
  const hasBytes = (expected, offset) => {
    const actual = Buffer.alloc(expected.length);
    return fs.readSync(fd, actual, 0, actual.length, offset) === actual.length && actual.equals(expected);
  };
  return READER_STARTS.some((start) => size >= start.length + READER_END.length && hasBytes(start, 0))
    && hasBytes(READER_END, size - READER_END.length);
}

const { O_RDONLY, O_RDWR, O_CREAT, O_EXCL, O_NOFOLLOW, O_NONBLOCK } = fs.constants;
const OPEN_PLAIN = O_NOFOLLOW | O_NONBLOCK; // do not follow a link or wait for a pipe

function previousReader(dir, dest) {
  try {
    const fd = fs.openSync(outputPath(dir, dest), O_RDONLY | OPEN_PLAIN);
    try {
      const st = fs.fstatSync(fd);
      return st.isFile() && isReaderPage(fd, st.size);
    } finally { fs.closeSync(fd); }
  } catch {
    return false;
  }
}

// Exclusive creation distinguishes a fresh file from an existing empty one. Check an existing file
// using the same open descriptor that will be written, so a path swap cannot redirect the write.
function writePage(dir, dest, html, sources) {
  const abs = outputPath(dir, dest);
  const ids = sources.map((s) => { const st = fs.statSync(s); return `${st.dev}:${st.ino}`; });
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  let fd;
  let created = true;
  try {
    try { fd = fs.openSync(abs, O_RDWR | O_CREAT | O_EXCL | OPEN_PLAIN, 0o644); } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      created = false;
      fd = fs.openSync(abs, O_RDWR | OPEN_PLAIN);
    }
  } catch (e) {
    if (e.code === 'ELOOP' || e.code === 'EMLINK') throw new Error(`${dest}: is a link; remove it, the page is written only to a plain file`);
    if (e.code === 'EISDIR') throw new Error(`${dest}: is a folder`);
    throw e;
  }
  try {
    const st = fs.fstatSync(fd);
    if (!st.isFile()) throw new Error(`${dest}: is not a file`);
    if (ids.includes(`${st.dev}:${st.ino}`)) throw new Error(`${dest}: is one of the documents (the same file under another name)`);
    if (!created && !isReaderPage(fd, st.size)) {
      throw new Error(`${dest}: already exists and is not a reader page; it was left as it is`);
    }
    fs.ftruncateSync(fd, 0);
    fs.writeFileSync(fd, html, 'utf8');
  } finally { fs.closeSync(fd); }
}

if (require.main === module) {
  const [dir, out] = process.argv.slice(2);
  if (!dir) { console.error('usage: node read-page.js <project folder> [out.html]'); process.exit(2); }
  const dest = out || path.join(dir, 'docs', 'read.html');
  let phase = '';
  try {
    const { docs, lang, sources } = readProject(dir);
    phase = 'Output error: ';
    writePage(dir, dest, render(docs, lang), sources);
    console.log(`wrote ${dest} (${docs.length} documents)`);
  } catch (e) {
    console.error(`refused: ${phase}${e.message}`);
    console.error(previousReader(dir, dest) ? `Previous reader page: ${dest} (out of date).` : 'Reader unavailable.');
    process.exit(1);
  }
}

module.exports = { readProject, readDoc, render, writePage, LANGS };
