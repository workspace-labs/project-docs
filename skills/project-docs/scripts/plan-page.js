#!/usr/bin/env node
// The plan page: docs/plan.md → docs/plan.html, one self-contained file that shows the plan as a board.
// Every card opens to its whole story (the plan, what was built, the person's decisions).
// Cards open with plain HTML (a radio per step and labels), so the page works where JavaScript is off,
// such as the iPhone file preview. Nothing is loaded from the network; Node.js with no packages.
// The plan is read through its Markdown block structure (markdown-blocks.js), so an example in a code
// block or in raw HTML is never taken for a step, and a real step is never hidden by one.
//
//   node plan-page.js docs/plan.md            → writes docs/plan.html beside it
//   node plan-page.js docs/plan.md out.html
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { blocks } = require('./markdown-blocks.js');

const LANGS = {
  en: {
    title: /^Plan: (.+)$/s,
    step: /^Step (\d+): (.+)$/s,
    fields: { covers: 'Covers', check: 'How we know it works', status: 'Status', target: 'Target', built: 'Built' },
    note: 'Your note',
    section: 'Steps',
    status: {
      todo: /^not started$/,
      blocked: /^⛔ waits for TBD: (\S.*)$/s,
      check: /^◐ waiting for your check \(ran: (\S.*?), (\d{4}-\d{2}-\d{2})\)$/s,
      done: /^✅ checked (\d{4}-\d{2}-\d{2})$/,
    },
    statusForms: '"not started", "⛔ waits for TBD: <what>", "◐ waiting for your check (ran: <what you ran>, <date>)", "✅ checked <date>"',
    comma: ', ',
    statusHistory: /^waited for /, todoWord: 'not started',
    changedWord: 'Changed', changeLabel: /^changed/i,
    changed: /^Changed (\d{4}-\d{2}-\d{2}): (.+)$/s, from: '', to: ' → ', because: ', because ', reasonWord: /^because/i,
    delivery: ['Functional test', 'Security test', 'Acceptance test (UAT)', 'Guides and training', 'Install', 'Live test', 'Go-live', 'Handover'],
    ui: {
      kicker: 'Build plan', page: 'plan',
      cols: { done: 'Done', check: 'Waiting for your check', todo: 'Next', blocked: 'Waiting for a decision' },
      here: 'You are here', open: 'Open →',
      where: { done: 'all steps checked', check: 'built, waiting for your check', todo: 'next to build', blocked: 'waiting for a decision' },
      step: (n) => `Step ${n}`, stepOf: (n, t) => `STEP ${n} OF ${t}`, deliveryTag: 'DELIVERY',
      state: { done: (w) => `Done — you checked it ${w}`, check: () => 'Built — waiting for your check', todo: () => 'Not started', blocked: () => 'Waiting for a decision' },
      plan: 'The plan', built: 'What was built', decisions: 'Your decisions',
      noBuilt: 'Nothing built yet.', noBuiltLine: 'No Built line was recorded for this step.', noDecisions: 'No decisions on this step yet.',
      firstWritten: 'As first written (the changes below replace the part they name):', changedOn: (d) => `Changed ${d}`,
      latest: 'Latest', statusOn: (d) => `${d} · status changed`, arrow: '→', asWritten: 'recorded as written', was: 'Was: ', because: 'Because: ', changedChip: 'Check changed',
      ran: 'Check the builder ran: ', wait: 'Waiting for you to decide: ', covers: 'Covers: ', target: 'Target: ',
      needs: 'Needs: ', builtChip: 'Built', notes: (n) => (n === 1 ? '1 note' : `${n} notes`),
      empty: 'Nothing here.', close: 'Close', prev: '←', next: '→',
      footer: 'Made from docs/plan.md · a step is Done only after you check it yourself · tap any card to open it',
    },
  },
  ar: {
    title: /^خطة التنفيذ: (.+)$/s,
    step: /^الخطوة (\d+): (.+)$/s,
    fields: { covers: 'تغطي', check: 'كيف نعرف أنها تعمل', status: 'الحالة', target: 'الموعد المستهدف', built: 'ما بُني' },
    note: 'ملاحظتك',
    section: 'الخطوات',
    status: {
      todo: /^لم تبدأ$/,
      blocked: /^⛔ تنتظر ما لم يُحسم: (\S.*)$/s,
      check: /^◐ بانتظار فحصك \(نُفّذ: (\S.*?)، (\d{4}-\d{2}-\d{2})\)$/s,
      done: /^✅ فُحصت (\d{4}-\d{2}-\d{2})$/,
    },
    statusForms: '«لم تبدأ»، «⛔ تنتظر ما لم يُحسم: <ما هو>»، «◐ بانتظار فحصك (نُفّذ: <ما نُفّذ>، <التاريخ>)»، «✅ فُحصت <التاريخ>»',
    comma: '، ',
    statusHistory: /^انتظار /, todoWord: 'لم تبدأ',
    changedWord: 'تغيّر في', changeLabel: /^تغيّ?ر في/,
    changed: /^تغيّر في (\d{4}-\d{2}-\d{2}): (.+)$/s, from: 'من ', to: ' إلى ', because: '، لأن ', reasonWord: /^لأن/,
    delivery: ['الاختبار الوظيفي', 'الاختبار الأمني', 'اختبار القبول (UAT)', 'الأدلة والتدريب', 'التثبيت', 'اختبار التشغيل', 'الإطلاق', 'التسليم'],
    ui: {
      kicker: 'خطة التنفيذ', page: 'الخطة',
      cols: { done: 'تمّت', check: 'بانتظار فحصك', todo: 'التالي', blocked: 'بانتظار قرار' },
      here: 'أنت هنا', open: 'افتح ←',
      where: { done: 'فُحصت كل الخطوات', check: 'بُنيت وتنتظر فحصك', todo: 'التالية في البناء', blocked: 'تنتظر قرارًا' },
      step: (n) => `الخطوة ${n}`, stepOf: (n, t) => `الخطوة ${n} من ${t}`, deliveryTag: 'مرحلة التسليم',
      state: { done: (w) => `تمّت — فحصتها في ${w}`, check: () => 'بُنيت — بانتظار فحصك', todo: () => 'لم تبدأ', blocked: () => 'بانتظار قرار' },
      plan: 'الخطة', built: 'ما بُني', decisions: 'قراراتك',
      noBuilt: 'لم يُبنَ شيء بعد.', noBuiltLine: 'لم يُسجَّل سطر «ما بُني» لهذه الخطوة.', noDecisions: 'لا قرارات في هذه الخطوة بعد.',
      firstWritten: 'كما كُتبت أول مرة (التغييرات أدناه تستبدل الجزء الذي تذكره):', changedOn: (d) => `تغيّرت في ${d}`, latest: 'الأحدث', statusOn: (d) => `${d} · تغيّرت الحالة`, arrow: '←', asWritten: 'كما كُتب', was: 'كانت: ', because: 'لأن: ', changedChip: 'تغيّر الفحص',
      ran: 'الفحص الذي نفّذه المطوّر: ', wait: 'بانتظار قرارك: ', covers: 'تغطي: ', target: 'الموعد المستهدف: ',
      needs: 'تحتاج: ', builtChip: 'بُنيت', notes: (n) => (n === 1 ? 'ملاحظة واحدة' : n === 2 ? 'ملاحظتان' : n <= 10 ? `${n} ملاحظات` : `${n} ملاحظة`),
      empty: 'لا شيء هنا.', close: 'إغلاق', prev: '→', next: '←',
      footer: 'مصنوعة من docs/plan.md · لا تُعدّ الخطوة منجزة إلا بعد أن تفحصها بنفسك · اضغط أي بطاقة لفتحها',
    },
  },
};

const STATES = ['done', 'check', 'todo', 'blocked'];

// Where "→" / «إلى» and "because" / «لأن» stand at the top level of an entry's sentence: outside every pair
// of quotes, brackets and code marks. Words inside such a pair belong to the thing named, not to the entry.
// - Paired with certainty: «…» “…” ‹…› (…) […] {…}, and "…" and `…` (each closes the one before it).
// - Paired by their look only, because the same marks have other uses: '…' and ‘…’ (an apostrophe inside a
//   word is no quote), *…* and _…_. A separator inside one of these may or may not be quoted.
// Returns null, meaning nothing in the entry is certain, when the pairs do not match up, when a separator
// sits inside a pair of the second kind, or when the entry holds an HTML tag or a quote mark of a kind not
// followed here („…“, 「…」 and the like).
// Also found at the top level: `loose`, every place the reason word stands, however it is written ("because"
// with no comma before it, with a capital, after two spaces; «لأن» after a Latin comma). One that comes before
// the template's marker is a reason whose start is not certain.
const PAIRS = { '«': '»', '“': '”', '‹': '›', '(': ')', '[': ']', '{': '}' };
const CLOSING = new Set(Object.values(PAIRS));
const NOT_FOLLOWED = /[„‟‚‛「」『』〝〞〟＂＇（）［］｛｝【】〔〕《》〈〉﴾﴿]|<[A-Za-z/!?]/;
function topLevel(s, L) {
  if (NOT_FOLLOWED.test(s)) return null;
  const found = { to: [], because: [], loose: [] }, open = [];
  const top = () => open[open.length - 1];
  for (let i = 0; i < s.length; i++) {
    for (const k of ['to', 'because']) {
      if (!s.startsWith(L[k], i)) continue;
      if (!open.length) found[k].push(i);
      else if (open.some((o) => o.byLook)) return null;
    }
    const c = s[i], before = s[i - 1], after = s[i + 1];
    if (L.reasonWord.test(s.slice(i, i + 8)) && !/[\p{L}\p{N}]/u.test(before || ' ')) {
      if (!open.length) found.loose.push(i);
      else if (open.some((o) => o.byLook)) return null;
    }
    if (PAIRS[c]) open.push({ close: PAIRS[c] });
    else if (CLOSING.has(c)) { const o = open.pop(); if (!o || o.close !== c) return null; }
    else if (c === '"' || c === '`') { if (top() && top().close === c) open.pop(); else open.push({ close: c }); }
    else if ("'‘’*_".includes(c)) {
      const kind = c === '*' || c === '_' ? c : "'";
      const closes = top() && top().byLook && top().close === kind && c !== '‘' && before !== undefined && !/\s/.test(before) && (after === undefined || !/[\p{L}\p{N}]/u.test(after));
      const opens = c !== '’' && (before === undefined || /[\s([{«“"‹]/.test(before)) && after !== undefined && !/\s/.test(after);
      if (closes) open.pop(); else if (opens) open.push({ close: kind, byLook: true });
    }
  }
  return open.length ? null : found;
}

const realDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`))
  && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;

// Recognize variations in capitalization, Arabic shadda and paired emphasis so the caller can refuse
// them with the step name. A colon or an initial digit after the label distinguishes it from prose.
function startsChange(text, L) {
  const opening = text.match(/^[*_]*/)[0];
  const label = L.changeLabel.exec(text.slice(opening.length));
  if (!label) return false;
  const closing = [...opening].reverse().join('');
  const afterLabel = text.slice(opening.length + label[0].length);
  if (!afterLabel.startsWith(closing)) return false;
  const rest = afterLabel.slice(closing.length);
  return rest.startsWith(':') || (/^\s/.test(rest) && (rest.includes(':') || /^\s+\p{Nd}/u.test(rest)));
}

// One change entry ("Changed <date>: <old> → <new>, because <reason>.") → { date, old, now, why }, split only
// where the boundary is certain: exactly one "because" / «لأن» marker at the top level, no reason word
// written another way before it, and before it exactly one "→" / «إلى» at the top level, with words on both
// sides. Anything else is kept whole as { date, raw }, shown as written and never guessed.
function change(text, L) {
  const m = text.match(L.changed);
  if (!m) return null;
  const date = m[1], body = m[2].replace(/\.$/, '');
  const whole = { date, raw: body, why: '' };
  const at = topLevel(body, L);
  if (!at || at.because.length !== 1) return whole;
  const cut = at.because[0];
  if (at.loose.some((i) => i < cut)) return whole;
  const what = body.slice(0, cut), why = body.slice(cut + L.because.length);
  if (!what.trim() || !why.trim()) return whole;
  const arrows = at.to.filter((i) => i < cut);
  if (!what.startsWith(L.from) || arrows.length !== 1 || arrows[0] < L.from.length) return { date, raw: what, why };
  const old = what.slice(L.from.length, arrows[0]), now = what.slice(arrows[0] + L.to.length);
  return old.trim() && now.trim() ? { date, old, now, why } : { date, raw: what, why };
}

const unquoted = (s) => s.trim().replace(/^[«"“‘'`]+/, '').replace(/[»"”’'`]+$/, '').trim();

// What a change entry is:
// - 'status': a settled wait, the whole move "waited for <x> → not started" (Arabic «من انتظار … إلى لم
//   تبدأ»), its target quoted or not, even when the entry had to be kept whole;
// - 'check': a change to the check, split with certainty into old / new / reason, written under the check;
// - 'unclear': anything else. It is shown as written and never marks the check as replaced.
function kindOf(c, L) {
  if (c.old !== undefined) return L.statusHistory.test(unquoted(c.old)) && unquoted(c.now) === L.todoWord ? 'status' : 'check';
  // Kept whole: only the part before the first top-level reason marker can contain the move. There must
  // be exactly one top-level separator there: a separator in the wait's name must be quoted so it cannot
  // be mistaken for part of a different move or reason.
  const raw = c.raw.startsWith(L.from) ? c.raw.slice(L.from.length) : c.raw;
  const at = topLevel(raw, L);
  if (!at) return 'unclear';
  const move = at.because.length ? raw.slice(0, at.because[0]) : raw;
  if (at.loose.some((i) => i < move.length)) return 'unclear';
  const arrows = at.to.filter((i) => i < move.length);
  if (arrows.length !== 1) return 'unclear';
  const [cut] = arrows;
  const target = move.slice(cut + L.to.length).trim();
  const t = L.todoWord;
  const settled = [t, `"${t}"`, `«${t}»`, `“${t}”`, `‘${t}’`, `'${t}'`, `\`${t}\``].includes(target);
  return settled && L.statusHistory.test(unquoted(move.slice(0, cut))) ? 'status' : 'unclear';
}

const firstText = (item) => (item.kids[0] && item.kids[0].t === 'para' ? item.kids[0].lines : null);
const listItemsIn = (item, out = []) => { // every list item inside this one, in reading order (quotes are not entered)
  for (const k of item.kids) if (k.t === 'item') { out.push(k); listItemsIn(k, out); }
  return out;
};

// The plan, from the top-level blocks of its Markdown: the title, the one Steps section, a "### Step N: …"
// heading per step, the step's fields (list items that begin with **Label:**), and the change entries
// (list items that begin with "Changed <date>:"), each filed under the field it sits in.
function readPlan(top) {
  const h1 = top.find((b) => b.t === 'heading' && b.level === 1);
  const lang = h1 && LANGS.ar.title.test(h1.text) ? 'ar' : 'en';
  const L = LANGS[lang];
  const other = LANGS[lang === 'ar' ? 'en' : 'ar'];
  const title = h1 && h1.text.match(L.title);
  if (!title) throw new Error('not a plan: the first heading must be "# Plan: <name>" or "# خطة التنفيذ: <name>"');
  const underlined = top.find((b) => b.t === 'heading' && b.setext);
  if (underlined) {
    throw new Error(`line ${underlined.line}: a text line with === or --- under it is a heading in Markdown, and a heading can end the steps; write headings with #, and leave an empty line before a --- rule`);
  }
  const sections = top.flatMap((b, i) => (b.t === 'heading' && b.level === 2 && b.text === L.section ? [i] : []));
  if (sections.length !== 1) throw new Error(`the plan needs exactly one "## ${L.section}" section`);

  const steps = [];
  let s = null, where = '', status = null, seen = null;
  const finish = () => {
    if (!s) return;
    if (status === null) throw new Error(`${where}: no ${L.fields.status} line`);
    if (!s.check) throw new Error(`${where}: no ${L.fields.check} line, or it is empty`);
    const st = Object.entries(L.status).map(([k, re]) => [k, status.match(re)]).find(([, m]) => m);
    if (!st) throw new Error(`${where}: the ${L.fields.status} must be exactly one of: ${L.statusForms}`);
    s.state = st[0];
    const date = st[0] === 'done' ? st[1][1] : st[0] === 'check' ? st[1][2] : null;
    if (date !== null && !realDate(date)) throw new Error(`${where}: ${date} is not a real date`);
    s.when = st[0] === 'todo' ? '' : st[0] === 'check' ? `${st[1][1]}${L.comma}${st[1][2]}` : st[1][1];
    s.delivery = L.delivery.some((d) => s.title.startsWith(d));
    steps.push(s);
  };
  const isField = (line, label) => line.startsWith(`**${label}:**`) && /^(\s|$)/.test(line.slice(label.length + 5));
  const readItem = (item) => {
    const lines = firstText(item);
    let under = null; // the field this item is, so the change entries inside it are filed under it
    if (lines) {
      const value = (label) => [lines[0].slice(label.length + 5), ...lines.slice(1)].join(' ').trim();
      for (const [key, label] of Object.entries(L.fields)) {
        if (!isField(lines[0], label)) continue;
        if (seen.has(key)) throw new Error(`${where}: more than one ${label} line (keep one current line; history goes under it)`);
        seen.add(key);
        under = key;
        if (key !== 'status') s[key] = value(label).replace(/`/g, '');
        else if (lines.length > 1) throw new Error(`${where}: the ${label} must be on one line, exactly one of: ${L.statusForms}`);
        else status = value(label);
      }
      if (isField(lines[0], L.note)) {
        under = 'note';
        const [date, ...rest] = value(L.note).split(' — ');
        s.notes.push(rest.length ? { date: date.trim(), text: rest.join(' — ').trim() } : { date: '', text: value(L.note) });
      }
    }
    for (const it of [item, ...listItemsIn(item)]) {
      const text = (firstText(it) || []).join(' ');
      if (startsChange(text, other)) {
        throw new Error(`${where}: a change entry in the other language ("${other.changedWord} …"); write it as "${L.changedWord} <date>: …"`);
      }
      const c = change(text, L);
      if (!c) {
        if (startsChange(text, L)) {
          throw new Error(`${where}: a change entry must read "${L.changedWord} YYYY-MM-DD: <old>${L.to}<new>${L.because}<reason>."`);
        }
        continue;
      }
      if (!realDate(c.date)) throw new Error(`${where}: ${c.date} is not a real date`);
      // The check holds both check changes and settled-wait history. Entries anywhere else stay neutral.
      const field = it === item ? null : under;
      const kind = field === 'check' ? kindOf(c, L) : 'unclear';
      s.changes.push({ ...c, under: field, kind });
    }
  };

  for (const b of top.slice(sections[0] + 1)) {
    if (b.t === 'heading' && b.level <= 2) break; // the next section ends the steps
    if (b.t === 'heading' && b.level === 3) {
      finish();
      const m = b.text.match(L.step);
      if (!m) throw new Error(`"### ${b.text}": not a step heading (it must read "${lang === 'ar' ? 'الخطوة N: …' : 'Step N: …'}")`);
      s = { n: Number(m[1]), title: m[2].trim(), covers: '', check: '', target: '', built: '', notes: [], changes: [] };
      where = b.text;
      status = null;
      seen = new Set();
      if (s.n !== steps.length + 1) throw new Error(`${where}: steps must be numbered 1, 2, 3… in order (expected ${steps.length + 1})`);
    } else if (b.t === 'item' && s) readItem(b);
  }
  finish();
  if (!steps.length) throw new Error('no steps found under the plan');
  return { lang, title: title[1].trim(), steps };
}

const parse = (text) => readPlan(blocks(String(text).normalize('NFC')).kids);

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CSS = `
:root{--bg:#f2f0eb;--ink:#121518;--ink2:#3a4148;--muted:#727a82;--line:#e2ddd3;--card:#fff;
--done:#1c7a54;--done-t:#e2f2ea;--check:#b4730a;--check-t:#fbf0dc;--todo:#56616d;--todo-t:#eceef0;--blocked:#b2392a;--blocked-t:#f8e5e1;
--r:16px;--sh:0 1px 1px #0000000a,0 2px 4px #0000000a,0 10px 24px -8px #0000001f;--sh-up:0 2px 2px #0000000d,0 8px 16px #00000012,0 24px 48px -12px #00000033}
*{box-sizing:border-box}
body{margin:0;color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;
background:radial-gradient(1200px 600px at 85% -10%,#fff 0,transparent 60%),radial-gradient(900px 500px at -10% 110%,#e9e4d8 0,transparent 60%),var(--bg);min-height:100vh}
[dir=rtl] *{letter-spacing:0!important}
.wrap{max-width:1320px;margin:0 auto;padding:40px 24px 64px}
header{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center}
.kicker{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
h1{font:700 40px/1.1 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",system-ui,sans-serif;letter-spacing:-.03em;margin:6px 0}
.meter{display:flex;align-items:center;gap:18px;background:#ffffffb3;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid #fff;border-radius:22px;padding:14px 18px;box-shadow:var(--sh)}
.ring{position:relative;width:84px;height:84px}.ring svg{transform:rotate(-90deg)}
.ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:22px;font-weight:800;font-variant-numeric:tabular-nums}
.ring b small{display:block;font-size:10.5px;font-weight:700;color:var(--muted);margin-top:-30px}
.counts{display:grid;grid-template-columns:repeat(2,auto);gap:6px 18px}
.counts span{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink2);white-space:nowrap}
.counts i{width:9px;height:9px;border-radius:3px;display:inline-block;background:var(--c)}.counts b{font-variant-numeric:tabular-nums;min-width:16px}
.here{all:unset;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin:28px 0 26px;padding:16px 22px;border-radius:18px;
background:linear-gradient(180deg,#1b2026,#111418);color:#e8eaed;box-shadow:var(--sh);transition:transform .2s}
.here:hover{transform:translateY(-1px)}.here:focus-visible{outline:3px solid var(--check);outline-offset:3px}
.pulse{flex:none;width:10px;height:10px;border-radius:50%;background:#f2b13a;box-shadow:0 0 0 0 #f2b13a99;animation:p 2s infinite}
@keyframes p{70%{box-shadow:0 0 0 12px #f2b13a00}100%{box-shadow:0 0 0 0 #f2b13a00}}
.here em{font-style:normal;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9aa3ad;font-weight:700;white-space:nowrap}
.here strong{color:#ffcf6e;font-weight:700}.here .go{margin-inline-start:auto;color:#9aa3ad;font-size:13px;white-space:nowrap}
.cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;align-items:start}
.col{background:#ffffff73;border:1px solid #ffffffb3;border-radius:22px;padding:14px}
.col h2{display:flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:4px 6px 14px;color:var(--c)}
.col h2 i{width:8px;height:8px;border-radius:50%;background:var(--c)}.col h2 span{margin-inline-start:auto;color:var(--muted);font-variant-numeric:tabular-nums}
.empty{font-size:13px;color:var(--muted);padding:10px 8px 6px}
.card{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;background:var(--card);border-radius:var(--r);padding:14px 16px 12px;margin-bottom:12px;
box-shadow:var(--sh);position:relative;overflow:hidden;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.card:before{content:"";position:absolute;inset-inline-start:0;top:0;bottom:0;width:4px;background:var(--c)}
.card:hover{transform:translateY(-3px);box-shadow:var(--sh-up)}.card:focus-visible{outline:3px solid var(--c);outline-offset:2px}
.card .top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.num{font-size:11.5px;font-weight:800;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
.tag{font-size:10.5px;font-weight:800;letter-spacing:.08em;padding:2px 7px;border-radius:6px;background:var(--todo-t);color:var(--todo)}
.card h3{margin:0 0 6px;font-size:15.5px;line-height:1.3}
.card p{margin:0;font-size:13.5px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px;background:var(--t);color:var(--c)}
.chip.n{background:#f1efe9;color:var(--ink2)}
.need{margin-top:8px;font-size:12.5px;font-weight:600;color:var(--blocked)}
.s-done{--c:var(--done);--t:var(--done-t)}.s-check{--c:var(--check);--t:var(--check-t)}.s-todo{--c:var(--todo);--t:var(--todo-t)}.s-blocked{--c:var(--blocked);--t:var(--blocked-t)}
.r{position:fixed;opacity:0;pointer-events:none}
html:has(.r:not(#r0):checked),html:has(.r:not(#r0):checked) body{overflow:hidden}
.chg.latest{background:#fff;box-shadow:inset 0 0 0 1.5px var(--ink)}
.chg.unclear{border-inline-start-color:var(--muted);background:#f9f8f5}.chg.unclear time{color:var(--muted)}
.d-body:focus-visible{outline:2px solid var(--c);outline-offset:-2px}
.pop{position:fixed;inset:0;z-index:10;display:none;align-items:center;justify-content:center;padding:16px}
.bg{position:absolute;inset:0;background:#14171a59;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer}
.sheet{position:relative;display:flex;flex-direction:column;border-radius:26px;width:min(760px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);
box-shadow:0 40px 120px -20px #00000066;background:#fff;overflow:hidden;animation:in .32s cubic-bezier(.2,.8,.2,1)}
@keyframes in{from{opacity:0;transform:translateY(16px) scale(.98)}}
label{-webkit-tap-highlight-color:transparent}
.d-head{padding:26px 30px 22px;background:linear-gradient(180deg,var(--t),#fff);border-bottom:1px solid var(--line);position:relative}
.d-head .num{color:var(--c)}.d-head h2{font:700 26px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif;letter-spacing:-.02em;margin:6px 0 12px;padding-inline-end:40px}
.state{display:inline-flex;align-items:center;font-weight:700;font-size:13px;padding:6px 12px;border-radius:99px;background:#fff;color:var(--c);box-shadow:inset 0 0 0 1.5px var(--c)}
.x{cursor:pointer;position:absolute;inset-inline-end:20px;top:20px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:20px;color:var(--ink2);background:#ffffffcc}
.x:hover{background:#fff}.x:focus-visible{outline:3px solid var(--c)}
.d-body{padding:8px 30px 10px;overflow:auto;flex:1;min-height:0;-webkit-overflow-scrolling:touch}
.sec{display:grid;grid-template-columns:36px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid var(--line)}.sec:last-child{border:0}
.ico{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-size:16px;background:#f3f1ec}
.sec h4{margin:4px 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.sec p{margin:0;color:var(--ink2)}.sec p::first-letter,.card p::first-letter,.tl li::first-letter{text-transform:uppercase}
.small{font-size:12.5px;color:var(--muted);margin-top:8px!important}.none{color:var(--muted)!important;font-style:italic}
.sec p.old{color:var(--muted)}
.chg{margin-top:10px;padding:10px 12px;border-radius:12px;background:#f6f4ef;border-inline-start:3px solid var(--ink)}
.chg time{display:block;font-size:12px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}.chg p{margin:2px 0 0}
.tl{list-style:none;margin:4px 0 0;padding:0}.tl li{position:relative;padding:0 0 12px;padding-inline-start:22px;color:var(--ink2)}
.tl li:before{content:"";position:absolute;inset-inline-start:3px;top:8px;width:9px;height:9px;border-radius:50%;background:var(--ink)}
.tl li.ch:before{background:#fff;box-shadow:inset 0 0 0 2px var(--muted)}
.tl li:after{content:"";position:absolute;inset-inline-start:7px;top:20px;bottom:0;width:1px;background:var(--line)}.tl li:last-child:after{display:none}
.tl time{display:block;font-size:12px;font-weight:700;color:var(--muted);font-variant-numeric:tabular-nums}
.wait{background:var(--blocked-t);color:var(--blocked);border-radius:12px;padding:10px 12px;font-weight:600;margin-top:6px}
.d-foot{display:flex;justify-content:space-between;padding:14px 22px;border-top:1px solid var(--line);background:#faf9f6}
.nav{cursor:pointer;font-size:13.5px;font-weight:600;padding:8px 14px;border-radius:10px;color:var(--ink2)}
.nav:hover{background:#efece5}.nav.off{opacity:.3;cursor:default;pointer-events:none}.nav:focus-visible{outline:2px solid var(--ink)}
footer{margin-top:28px;text-align:center;color:var(--muted);font-size:12.5px}
@media (max-width:1000px){.cols{grid-template-columns:repeat(2,minmax(0,1fr))}header{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.cols{grid-template-columns:1fr}h1{font-size:30px}.wrap{padding:24px 16px}.here .go{display:none}
.meter{gap:12px;padding:12px}.counts{grid-template-columns:1fr;gap:4px}.counts span{white-space:normal}.here{flex-wrap:wrap;gap:8px 12px}
.d-head{padding:22px 20px 18px}.d-head h2{font-size:22px}.d-body{padding:4px 20px 8px}.pop{padding:10px}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@media print{html,body{overflow:visible!important}body{background:#fff}.here,.cols,footer,.bg,.x,.d-foot,.r{display:none!important}.meter{box-shadow:none}
.pops .pop{display:block!important;position:static;padding:0;margin-top:10px}.sheet{animation:none;box-shadow:none;border:1px solid var(--line);border-radius:12px;max-height:none;break-inside:avoid}
.d-body{overflow:visible;padding:0 20px}.d-head{background:#fff;padding:12px 20px 10px}.d-head h2{font-size:17px;margin:2px 0 6px}.state{font-size:11px;padding:3px 9px}
.sec{padding:8px 0;gap:10px;grid-template-columns:24px 1fr}.ico{width:24px;height:24px;font-size:12px;border-radius:7px}.sec h4{margin:2px 0;font-size:10px}.sec p,.tl li{font-size:12.5px}}
`;

// Only adds the keyboard; taps work without it. Enter or Space opens a focused card, focus moves into the
// open card and Tab stays inside it, Esc closes and gives focus back to the card that opened it, the arrows
// move between steps (swapped in Arabic).
const JS = `(()=>{let opener=null;const rtl=document.dir==='rtl',pop=i=>document.getElementById('p'+i);
const cur=()=>{const o=document.querySelector('.r:checked:not(#r0)');return o?+o.id.slice(1):0;};
const settle=()=>{const i=cur();if(i){pop(i).querySelector('.x').focus();}else if(opener){opener.focus();opener=null;}};
const show=i=>{const r=document.getElementById('r'+i);if(r){r.checked=true;settle();}};
document.addEventListener('click',e=>{const l=e.target.closest&&e.target.closest('label[for]');if(!l)return;
if(!cur()&&l.matches('.card,.here'))opener=l;setTimeout(settle,0);});
document.addEventListener('keydown',e=>{const t=e.target;
if((e.key==='Enter'||e.key===' ')&&t.matches&&t.matches('label[for]')){e.preventDefault();t.click();return;}
const i=cur();if(!i)return;
if(e.key==='Escape'){e.preventDefault();show(0);return;}
if(e.key===(rtl?'ArrowLeft':'ArrowRight')){show(i+1);return;}
if(e.key===(rtl?'ArrowRight':'ArrowLeft')){if(i>1)show(i-1);return;}
if(e.key==='Tab'){const f=[...pop(i).querySelectorAll('[tabindex="0"]')],k=f.indexOf(document.activeElement);e.preventDefault();
f[e.shiftKey?(k<=0?f.length-1:k-1):(k<0||k===f.length-1?0:k+1)].focus();return;}
const b=pop(i).querySelector('.d-body'),h=b.clientHeight*0.85,by={ArrowDown:40,ArrowUp:-40,PageDown:h,PageUp:-h,Home:-1e9,End:1e9}[e.key];
if(by!==undefined&&t!==b){e.preventDefault();b.scrollBy(0,by);}});})();`;

function popup(s, i, total, L) {
  const U = L.ui;
  const checkChanges = s.changes.filter((c) => c.kind === 'check');
  const statusHistory = s.changes.filter((c) => c.kind === 'status');
  const notes = s.notes.map((n) => `<li>${n.date ? `<time>${esc(n.date)}</time>` : ''}${esc(n.text)}</li>`).join('')
    + statusHistory.map((c) => `<li class="ch"><time>${esc(U.statusOn(c.date))}</time>${esc(c.raw ?? `${c.old} ${U.arrow} ${c.now}`)}${c.why ? `<br><span class="small">${esc(U.because + c.why)}</span>` : ''}</li>`).join('');
  const built = s.built ? `<p>${esc(s.built)}</p>`
    : `<p class="none">${esc(s.state === 'done' || s.state === 'check' ? U.noBuiltLine : U.noBuilt)}</p>`;
  // A changed check: the first wording stays readable (a change may only add to it); each change below it
  // says what it is now, the part it replaced and why, and the newest one is marked as the latest.
  // An unclear entry is shown as written beside them, with the name of the line it sits under when that is
  // not the check. It never marks the check as replaced, and when it is the newest entry under the check,
  // "Latest" is left unsaid.
  const first = checkChanges.length ? `<p class="small">${esc(U.firstWritten)}</p>` : '';
  const shown = s.changes.filter((c) => c.kind !== 'status');
  const underCheck = shown.filter((c) => c.under === 'check');
  const changes = shown.map((c) => {
    if (c.kind === 'unclear') {
      const line = c.under === 'note' ? L.note : c.under && c.under !== 'check' ? L.fields[c.under] : '';
      return `<div class="chg unclear"><time>${esc(U.changedOn(c.date))} · ${esc(line ? `${line} · ` : '')}${esc(U.asWritten)}</time>`
        + `<p>${esc(c.raw ?? `${c.old} ${U.arrow} ${c.now}`)}</p>${c.why ? `<p class="small">${esc(U.because + c.why)}</p>` : ''}</div>`;
    }
    const latest = checkChanges.length > 1 && c === underCheck[underCheck.length - 1];
    return `<div class="chg${latest ? ' latest' : ''}"><time>${latest ? `${esc(U.latest)} · ` : ''}${esc(U.changedOn(c.date))}</time><p>${esc(c.now)}</p>`
      + `<p class="small">${esc(U.was + c.old)}</p>${c.why ? `<p class="small">${esc(U.because + c.why)}</p>` : ''}</div>`;
  }).join('');
  const ran = s.state === 'check' ? `<p class="small">${esc(U.ran + s.when)}</p>` : '';
  const wait = s.state === 'blocked' ? `<div class="wait">${esc(U.wait + s.when)}</div>` : '';
  const decisions = notes ? `<ul class="tl">${notes}</ul>` : wait ? '' : `<p class="none">${esc(U.noDecisions)}</p>`;
  const extra = (s.covers ? `<p class="small">${esc(U.covers + s.covers)}</p>` : '') + (s.target ? `<p class="small">${esc(U.target + s.target)}</p>` : '');
  const prev = i > 1 ? `<label class="nav" for="r${i - 1}" tabindex="0">${U.prev} ${esc(U.step(i - 1))}</label>` : `<span class="nav off">${U.prev}</span>`;
  const next = i < total ? `<label class="nav" for="r${i + 1}" tabindex="0">${esc(U.step(i + 1))} ${U.next}</label>` : `<span class="nav off">${U.next}</span>`;
  return `<div class="pop s-${s.state}" id="p${i}" role="dialog" aria-modal="true" aria-labelledby="t${i}">`
    + `<label class="bg" for="r0" aria-hidden="true"></label><div class="sheet">`
    + `<div class="d-head"><label class="x" for="r0" tabindex="0" aria-label="${esc(U.close)}">×</label>`
    + `<span class="num">${esc(U.stepOf(s.n, total))}${s.delivery ? ` · ${esc(U.deliveryTag)}` : ''}</span>`
    + `<h2 id="t${i}">${esc(s.title)}</h2><span class="state">${esc(U.state[s.state](s.when))}</span></div>`
    + `<div class="d-body" tabindex="0" role="region" aria-labelledby="t${i}"><div class="sec"><div class="ico">◎</div><div><h4>${esc(U.plan)}</h4>${first}<p${checkChanges.length ? ' class="old"' : ''}>${esc(s.check)}</p>${changes}${extra}</div></div>`
    + `<div class="sec"><div class="ico">⚒</div><div><h4>${esc(U.built)}</h4>${built}${ran}</div></div>`
    + `<div class="sec"><div class="ico">✎</div><div><h4>${esc(U.decisions)}</h4>${wait}${decisions}</div></div></div>`
    + `<div class="d-foot">${prev}${next}</div></div></div>`;
}

function render({ lang, title, steps }) {
  const U = LANGS[lang].ui;
  const total = steps.length;
  const count = Object.fromEntries(STATES.map((k) => [k, steps.filter((s) => s.state === k).length]));
  const hereIndex = Math.max(0, steps.findIndex((s) => s.state !== 'done'));
  const here = steps.findIndex((s) => s.state !== 'done') === -1 ? null : steps[hereIndex];
  const circ = 2 * Math.PI * 34;
  const ring = `<svg width="84" height="84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="none" stroke="#ebe7de" stroke-width="9"/>`
    + `<circle cx="42" cy="42" r="34" fill="none" stroke="var(--done)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(circ * count.done / total).toFixed(1)} ${circ.toFixed(1)}"/></svg>`;
  const counts = STATES.map((k) => `<span class="s-${k}"><i></i><b>${count[k]}</b>${esc(U.cols[k])}</span>`).join('');
  const hereBar = `<label class="here" for="r${hereIndex + 1}" tabindex="0"><span class="pulse"></span><em>${esc(U.here)}</em>`
    + (here ? `<span>${esc(U.step(here.n))} · <strong>${esc(here.title)}</strong> — ${esc(U.where[here.state])}</span>` : `<span>${esc(U.where.done)}</span>`)
    + `<span class="go">${esc(U.open)}</span></label>`;
  const cols = STATES.map((k) => {
    const mine = steps.map((s, i) => [s, i + 1]).filter(([s]) => s.state === k);
    const cards = mine.map(([s, i]) => {
      const chips = (s.built ? `<span class="chip">${esc(U.builtChip)}</span>` : '')
        + (s.notes.length ? `<span class="chip n">${esc(U.notes(s.notes.length))}</span>` : '')
        + (s.changes.some((c) => c.kind === 'check') ? `<span class="chip n">${esc(U.changedChip)}</span>` : '')
        + (k === 'done' ? `<span class="chip">✓ ${esc(s.when)}</span>` : '');
      return `<label class="card s-${k}" for="r${i}" tabindex="0"><div class="top"><span class="num">${esc(U.step(s.n))}</span>`
        + `${s.delivery ? `<span class="tag">${esc(U.deliveryTag)}</span>` : ''}</div><h3>${esc(s.title)}</h3><p>${esc(s.check)}</p>`
        + `${k === 'blocked' ? `<div class="need">${esc(U.needs + s.when)}</div>` : ''}${chips ? `<div class="meta">${chips}</div>` : ''}</label>`;
    }).join('');
    return `<section class="col s-${k}"><h2><i></i>${esc(U.cols[k])}<span>${mine.length}</span></h2>${cards || `<div class="empty">${esc(U.empty)}</div>`}</section>`;
  }).join('');
  const radios = `<input class="r" type="radio" name="open" id="r0" checked aria-hidden="true" tabindex="-1">`
    + steps.map((_, i) => `<input class="r" type="radio" name="open" id="r${i + 1}" aria-hidden="true" tabindex="-1">`).join('');
  const show = steps.map((_, i) => `#r${i + 1}:checked~.pops #p${i + 1}`).join(',') + '{display:flex}';
  const pops = steps.map((s, i) => popup(s, i + 1, total, LANGS[lang])).join('');
  return `<!doctype html>\n<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · ${esc(U.page)}</title>`
    + `<style>${CSS}${show}</style></head><body>${radios}<div class="wrap"><header><div><div class="kicker">${esc(U.kicker)}</div><h1>${esc(title)}</h1></div>`
    + `<div class="meter"><div class="ring">${ring}<b>${count.done}<small>/ ${total}</small></b></div><div class="counts">${counts}</div></div></header>`
    + `${hereBar}<div class="cols">${cols}</div><footer>${esc(U.footer)}</footer></div><div class="pops">${pops}</div><script>${JS}</script></body></html>\n`;
}

module.exports = { parse, render, readPlan };

if (require.main === module) {
  const [src, out] = process.argv.slice(2);
  if (!src) { console.error('usage: node plan-page.js docs/plan.md [docs/plan.html]'); process.exit(2); }
  try {
    const plan = parse(fs.readFileSync(src, 'utf8'));
    const dest = out || path.join(path.dirname(src), 'plan.html');
    fs.writeFileSync(dest, render(plan));
    const done = plan.steps.filter((s) => s.state === 'done').length;
    console.log(`wrote ${dest}: ${plan.steps.length} steps, ${done} checked`);
  } catch (e) {
    console.error(`plan page not written: ${e.message}`);
    process.exit(1);
  }
}
