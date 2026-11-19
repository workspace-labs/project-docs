#!/usr/bin/env node
// Compares the plan page's Markdown reading with Pandoc's CommonMark reader, on generated texts full of
// awkward lines (fences, HTML, lists, quotes, tabs, underlines). For every text the script does not refuse:
//   1. its block structure (scripts/markdown-blocks.js) must equal Pandoc's, and
//   2. the plan read from its blocks must equal the plan read from Pandoc's blocks (same readPlan function).
// A developer tool: it needs `pandoc` on the PATH and is not part of `node --test`.
//
//   node tools/blocks-vs-pandoc.js [count=2000] [seed=1]
//   node tools/blocks-vs-pandoc.js --record <out.json> [count] [seed]   also save { md, tree } of the compared
//                                                                       texts, to replay later without Pandoc
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const scripts = path.join(__dirname, '..', 'skills', 'project-docs', 'scripts');
const { blocks } = require(path.join(scripts, 'markdown-blocks.js'));
const { readPlan } = require(path.join(scripts, 'plan-page.js'));

// Text is compared by its letters and digits only, with no spaces: inline markup and line wrapping, which
// the block reader does not parse, cannot make a difference.
const words = (s) => s.replace(/[^\p{L}\p{N}]+/gu, '');

// The script's tree, in a plain comparable shape.
function mine(node) {
  return node.kids.map((k) => {
    if (k.t === 'heading') return ['h', k.level, words(k.text)];
    if (k.t === 'para') return ['p', words(k.lines.join(' '))];
    if (k.t === 'item') return ['li', mine(k)];
    if (k.t === 'quote') return ['q', mine(k)];
    return [k.t];
  });
}

// Pandoc's inlines back to text. `marked` keeps the markup the plan reader looks at (**bold**, line breaks).
function inline(xs, marked) {
  return xs.map((x) => {
    const c = x.c;
    switch (x.t) {
      case 'Str': return c;
      case 'Space': return ' ';
      case 'SoftBreak': case 'LineBreak': return marked ? '\n' : ' ';
      case 'Code': return marked ? `\`${c[1]}\`` : c[1];
      case 'RawInline': return c[1];
      case 'Strong': return marked ? `**${inline(c, marked)}**` : inline(c);
      case 'Emph': return marked ? `*${inline(c, marked)}*` : inline(c);
      case 'Link': case 'Image': return `${inline(c[1], marked)} ${c[2][0]}`;
      default: return Array.isArray(c) ? inline(c.filter((y) => y && y.t), marked) : '';
    }
  }).join('');
}
// Pandoc's tree in the comparable shape (lists are not grouped; Para and Plain are the same thing).
function theirs(bs) {
  return bs.flatMap((b) => {
    const c = b.c;
    switch (b.t) {
      case 'Header': return [['h', c[0], words(inline(c[2]))]];
      case 'Para': case 'Plain': return [['p', words(inline(c))]];
      case 'BulletList': return c.map((item) => ['li', theirs(item)]);
      case 'OrderedList': return c[1].map((item) => ['li', theirs(item)]);
      case 'BlockQuote': return [['q', theirs(c)]];
      case 'CodeBlock': return [['code']];
      case 'RawBlock': return [['html']];
      case 'HorizontalRule': return [['hr']];
      default: return [[b.t]];
    }
  });
}
// Pandoc's tree in the shape readPlan takes.
function rebuilt(bs) {
  return bs.flatMap((b) => {
    const c = b.c;
    switch (b.t) {
      case 'Header': return [{ t: 'heading', level: c[0], text: inline(c[2], true).replace(/\n/g, ' ') }];
      case 'Para': case 'Plain': return [{ t: 'para', lines: inline(c, true).split('\n').map((l) => l.trim()) }];
      case 'BulletList': return c.map((item) => ({ t: 'item', kids: rebuilt(item) }));
      case 'OrderedList': return c[1].map((item) => ({ t: 'item', kids: rebuilt(item) }));
      case 'BlockQuote': return [{ t: 'quote', kids: rebuilt(c) }];
      case 'CodeBlock': return [{ t: 'code' }];
      case 'RawBlock': return [{ t: 'html' }];
      default: return [{ t: 'hr' }];
    }
  });
}
function pandocBlocks(md) {
  const r = spawnSync('pandoc', ['-f', 'commonmark', '-t', 'json'], { input: md, encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`pandoc failed: ${r.stderr}`);
  return JSON.parse(r.stdout).blocks;
}
const pandoc = (md) => theirs(pandocBlocks(md));
// What reading the plan gives: the plan, or the refusal. Spacing, backslashes and backticks are evened out,
// because Pandoc's text has them already folded.
const outcome = (top) => {
  let o;
  try { o = JSON.stringify(readPlan(top)); } catch (e) { o = `refused: ${e.message}`; }
  return o.replace(/\\\\|`/g, '').replace(/ +/g, ' ');
};

// --- generated texts -------------------------------------------------------------------------------------
function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const F = '```';
const NBSP = String.fromCharCode(160), LINE_SEPARATOR = String.fromCharCode(0x2028), FORM_FEED = String.fromCharCode(12);
const INDENTS = ['', '', '', '', ' ', '  ', '  ', '   ', '    ', '     ', '      ', '\t', ' \t', '  \t', '   \t'];
// "@" is where a unique word goes, so that lines cannot be confused with one another.
const NOISE = [
  F, F, F, `${F}md`, `${F}${F[0]}`, '~~~', '~~~~', '~~~md`', `${F}md\`x`, `${F} `, `${F}\t`, `${F}${NBSP}`, `${F}${F[0]}${F[0]}`, `${F} @`,
  '<div>', '</div>', '<div class="a">', '<div>@</div>', '<span>', '</span>', '<span>@</span>', '<span class="x">', '<span class="x">@</span>',
  '<!-- @ -->', '<!--', '-->', '<!-- @', '@ -->', '<!-->', '<pre>', '<pre>@</pre>', '<script>', '</script>', '<style>', '</style>', '<textarea>',
  '<p>', '</p>', '<p>@</p>', '<a href="x">', '<a href="x">@</a>', '<x-y>', '</x-y>', '<br>', '<br/>', '<hr>', '<?p', '?>', '<?p @ ?>',
  '<!DOCTYPE html>', '<![CDATA[', ']]>', '<![CDATA[ @ ]]>', '<table>', '<td>@', '<li>', '<b>@</b> text', 'text <i>@</i>', '<img src="a.png">',
  '<input disabled>', '<a', '<div', '<div/>', '<span/>', '< div>', '<1>', '<a b=c>', "<a b='c'>", '<a b="c" d>', '<A>', '<DIV>', '<h1>@</h1>', '<ul>',
  '-', '- ', '- @', '-  @', '-   @', '-    @', '-     @', '* @', '+ @', '1. @', '1.', '1. ', '2. @', '10. @', '1) @', '- - @', '- 1. @', `- ${F}`,
  '- > @', '- # @', '- <div>', '- <!--', `1. ${F}`, '0. @', '01. @', '-@', '1.@', '- [ ] @', '*', '+', '2.', '- -', '-\t@', '1.\t@',
  '> @', '>', '> ', '>@', '> - @', `> ${F}`, '>> @', '> # @', '> <div>', '> <!--', '>     @', '> 1. @', '>\t@', '> -', '> >',
  '# @', '## @', '### @', '#### @', '###### @', '####### @', '#@', '###', '## ', '### Step 9: @', '## Steps', '## @ ##', '### @ #', '#\t@',
  '===', '---', '-', '=', '--', '==', '- - -', '***', '___', '* * *', '--- @', '-- -', '_ _ _', '**', '= =', '-  -  -', '----------',
  '[foo]: /url', '[foo]: /url "t"', '[x] @', '[@]', '<source>', '<search>', '<!doctype html>', '</pre>', '</script>', '<?>', '<!--->',
  '    @', '     @', '  @', ' @', '\\# @', '> @', '1. @', '- @', '  - @', '    - @', '   1. @', '  > @', '      @', '> > @', '- > - @',
  '@', '@ more words', '@ ends with colon:', '2026 @', '1986. @', '14.  @', '*@* text', '`@` text', '@ `a', '@ <b', '@.', '(@)',
  `@${LINE_SEPARATOR}### @`, `${FORM_FEED}### @`, `${NBSP}### @`, `- **Status:** ✅ checked 2026-01-0${1 + 3}`, '* **Covers:** @', '1. **Built:** @',
  '', '', '', '', '', '', ' ', '  ', '\t',
];
const STATUS = ['not started', '✅ checked 2026-01-02', '⛔ waits for TBD: host', '◐ waiting for your check (ran: tried it, 2026-01-03)'];
const CHANGED = ['  - Changed 2026-01-05: a@ → b, because c.', '  - Changed 2026-01-06: waited for the host@ → not started, because d.',
  '    - Changed 2026-01-07: e@ → f, because g.', '- Changed 2026-01-08: h@ → i, because j.', '  continued @', '  - earlier run @',
  '- **Built:** made @', '- **Your note:** 2026-01-04 — said @', '- **Target:** week @', '  - Changed 2026-01-09: one@ → two → three, because k.'];

// Lines that are refused, or that open something only a matching line closes. Half of the texts leave them
// out as single lines (pairs still come), so that more texts are read and compared instead of refused.
const NEEDS_AN_END = /^(?:`{3}|~{3}|<!--(?!.*-->)|<(?:pre|script|style|textarea)>$|<\?p$|<!\[CDATA\[$|(?:- |> |1\. )(?:`{3}|<!--)|<source|<search|<!doctype|<\/(?:pre|script)>$|<\?>|\[foo\]:)/;

function generate(seed) {
  const r = rng(seed);
  const calm = Math.floor(seed / 3) % 2 === 1;
  const pick = (a) => { let x = a[Math.floor(r() * a.length)]; for (let k = 0; calm && a === NOISE && k < 8 && NEEDS_AN_END.test(x); k++) x = a[Math.floor(r() * a.length)]; return x; };
  let n = 0;
  const word = (s) => s.replace(/@/g, () => `w${++n}`);
  if (seed % 3 === 0) { // every third text is a pure mix of awkward lines, with no plan around it
    return `${Array.from({ length: 3 + Math.floor(r() * 14) }, () => pick(INDENTS) + word(pick(NOISE))).join('\n')}\n`;
  }
  const step = (k) => [`### Step ${k}: T${k}`, '- **Covers:** M1', `- **How we know it works:** check ${k}.`, `- **Status:** ${pick(STATUS)}`];
  const lines = ['# Plan: T', '', '## Steps', ''];
  const count = 1 + Math.floor(r() * 3);
  for (let k = 1; k <= count; k++) { lines.push(...step(k)); if (r() < 0.8) lines.push(''); }
  if (r() < 0.25) lines.push('## Appendix', '', ...step(9));
  for (let e = 1 + Math.floor(r() * 5); e > 0; e--) {
    const at = 3 + Math.floor(r() * (lines.length - 2));
    const roll = r();
    if (roll < 0.4) lines.splice(at, 0, pick(INDENTS) + word(pick(NOISE)));
    else if (roll < 0.6) { // an opening and a closing line around a few lines
      const [open, shut] = pick([[F, F], [`${F}md`, F], ['~~~', '~~~'], ['<!--', '-->'], ['<div>', '</div>'], ['<pre>', '</pre>'], [`${F}${F[0]}`, `${F}${F[0]}`], ['<span>', '</span>'], ['<div>', '']]);
      const ind = pick(INDENTS), span = Math.floor(r() * 4);
      lines.splice(Math.min(at + span, lines.length), 0, (r() < 0.85 ? ind : pick(INDENTS)) + shut);
      lines.splice(at, 0, ind + open);
    } else if (roll < 0.7) lines.splice(at, 0, ...step(2 + Math.floor(r() * 2)).map((l) => (r() < 0.3 ? pick(INDENTS) : '') + l));
    else if (roll < 0.82) lines.splice(at, 0, word(pick(CHANGED)));
    else if (roll < 0.9) { if (at < lines.length) lines[at] = pick(INDENTS) + lines[at]; }
    else if (roll < 0.95) { if (lines[at] === '') lines.splice(at, 1); }
    else lines.splice(at, 0, word(pick(NOISE)), word(pick(NOISE)));
  }
  const end = r();
  return lines.join(end < 0.05 ? '\r\n' : end < 0.06 ? '\r' : '\n') + (r() < 0.9 ? '\n' : '');
}

// --- run -------------------------------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  const record = args[0] === '--record' ? args.splice(0, 2)[1] : null;
  const count = Number(args[0] || 2000), seed = Number(args[1] || 1);
  const refused = {}, differences = [], kept = [];
  const tally = (why) => { refused[why] = (refused[why] || 0) + 1; };
  let same = 0, plans = 0, plansRead = 0;
  for (let i = 0; i < count; i++) {
    const md = generate(seed * 1000003 + i).normalize('NFC');
    let tree;
    try { tree = blocks(md); } catch (e) { tally(e.message.replace(/line \d+/g, 'line N').replace(/"[^"]*"/g, '"…"').slice(0, 72)); continue; }
    const ast = pandocBlocks(md);
    const a = mine(tree), b = theirs(ast);
    if (JSON.stringify(a) !== JSON.stringify(b)) { differences.push({ md, what: 'blocks', mine: a, pandoc: b }); continue; }
    same += 1;
    if (record) kept.push({ md, tree: b });
    const p = outcome(tree.kids);
    if (/^refused: line \d+: a text line with ===/.test(p)) { tally('line N: (plan) a text line with === or --- under it'); continue; }
    const q = outcome(rebuilt(ast));
    plans += 1;
    if (!p.startsWith('refused')) plansRead += 1;
    if (p !== q) differences.push({ md, what: 'plan', mine: p, pandoc: q });
  }
  const refusals = Object.values(refused).reduce((x, y) => x + y, 0);
  console.log(`${count} texts (seed ${seed}): ${same} have the same blocks as in Pandoc; ${plans} gave the same plan or the same plan refusal from both (${plansRead} of them a readable plan); ${differences.length} differ; ${refusals} refused for their Markdown`);
  for (const [why, k] of Object.entries(refused).sort((x, y) => y[1] - x[1])) console.log(`  refused ${String(k).padStart(5)}  ${why}`);
  for (const d of differences.slice(0, Number(process.env.SHOW || 5))) {
    console.log(`\n--- ${d.what} differ ---\n${JSON.stringify(d.md)}\n mine   ${JSON.stringify(d.mine)}\n pandoc ${JSON.stringify(d.pandoc)}`);
  }
  if (record) fs.writeFileSync(record, `${JSON.stringify(kept)}\n`);
  process.exit(differences.length ? 1 : 0);
}

module.exports = { generate, mine, theirs, rebuilt, pandoc, pandocBlocks, outcome, words };
