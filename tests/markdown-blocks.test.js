// scripts/markdown-blocks.js: the block structure of a Markdown text, the way CommonMark reads it.
// The expected structures below were taken from Pandoc 3.12.1 (pandoc -f commonmark), not written by hand:
// tools/blocks-vs-pandoc.js compares the two, and tests/fixtures/markdown-blocks/ keeps a recorded sample.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { blocks } = require(path.join(__dirname, '..', 'skills', 'project-docs', 'scripts', 'markdown-blocks.js'));
const { mine: shape } = require(path.join(__dirname, '..', 'tools', 'blocks-vs-pandoc.js'));
const F = '```';
const NBSP = String.fromCharCode(160);

// [what it shows, the Markdown, the structure Pandoc gives]
// h = heading (level, its letters) · p = paragraph (its letters) · li = list item · q = quote · code · html · hr
const SAME_AS_PANDOC = [
  ["a fence at the top level hides a heading", "a\n\n```\n### H\n```\nb\n",
    [["p","a"],["code"],["p","b"]]],
  ["a fence indented three spaces is a fence; its content and closing line may sit at the margin", "   ```\n### H\n```\n### K\n",
    [["code"],["h",3,"K"]]],
  ["a fence indented four spaces is indented code, not a fence", "x\n\n    ```\n### K\n",
    [["p","x"],["code"],["h",3,"K"]]],
  ["a longer fence is not closed by a shorter one", "````\n```\n### H\n````\n### K\n",
    [["code"],["h",3,"K"]]],
  ["tilde and backtick fences do not close each other", "~~~\n```\n### H\n~~~\n### K\n",
    [["code"],["h",3,"K"]]],
  ["a backtick fence with a backtick in its first line is text", "```a`b\n### K\n",
    [["p","ab"],["h",3,"K"]]],
  ["a closing fence may be followed by spaces and tabs", "```\n### H\n``` \t \n### K\n",
    [["code"],["h",3,"K"]]],
  ["a fence inside a list item", "- a\n  ```\n  ### H\n  ```\n- b\n",
    [["li",[["p","a"],["code"]]],["li",[["p","b"]]]]],
  ["a fence at the parent item's column, after a sub-item", "- a\n  - b\n  ```\n  ### H\n  ```\n### K\n",
    [["li",[["p","a"],["li",[["p","b"]]],["code"]]],["h",3,"K"]]],
  ["a fence as the first thing in an item", "- ```\n  ### H\n  ```\n### K\n",
    [["li",[["code"]]],["h",3,"K"]]],
  ["a fence inside a quote", "> ```\n> ### H\n> ```\n### K\n",
    [["q",[["code"]]],["h",3,"K"]]],
  ["empty lines inside a fence in an item", "- a\n  ```\n  x\n\n  ### H\n\n  ```\n### K\n",
    [["li",[["p","a"],["code"]]],["h",3,"K"]]],
  ["a fence after a lazy line stays in the item", "- a\nlazy\n  ```\n  ### H\n  ```\n### K\n",
    [["li",[["p","alazy"],["code"]]],["h",3,"K"]]],
  ["a fence under a bare marker", "-\n  ```\n  ### H\n  ```\n### K\n",
    [["li",[["code"]]],["h",3,"K"]]],
  ["a fence in a numbered item", "1. a\n   ```\n   ### H\n   ```\n### K\n",
    [["li",[["p","a"],["code"]]],["h",3,"K"]]],
  ["a fence one space in, after a list item, is at the top level", "- a\n\n ```\n### H\n ```\n### K\n",
    [["li",[["p","a"]]],["code"],["h",3,"K"]]],
  ["an HTML comment hides a heading", "<!--\n### H\n-->\n### K\n",
    [["html"],["h",3,"K"]]],
  ["a comment closed on its own line", "<!-- c -->\n### K\n",
    [["html"],["h",3,"K"]]],
  ["backticks inside a comment are not a fence", "<!--\n```\n-->\n### K\n<!--\n```\n-->\n",
    [["html"],["h",3,"K"],["html"]]],
  ["a <div> block runs to the next empty line", "<div>\n### H\n</div>\n\n### K\n",
    [["html"],["h",3,"K"]]],
  ["a <div> can cut into a paragraph", "text\n<div>\n### H\n\n### K\n",
    [["p","text"],["html"],["h",3,"K"]]],
  ["a lone <span> cannot cut into a paragraph", "text\n<span>\n### K\n",
    [["p","textspan"],["h",3,"K"]]],
  ["a lone <span> after an empty line is a block", "text\n\n<span>\n### H\n\n### K\n",
    [["p","text"],["html"],["h",3,"K"]]],
  ["a <span> with text after it is ordinary text", "<span>words here</span>\n### K\n",
    [["p","spanwordsherespan"],["h",3,"K"]]],
  ["a <span> with an attribute and text after it is ordinary text", "<span class=\"x\">words</span>\n### K\n",
    [["p","spanclassxwordsspan"],["h",3,"K"]]],
  ["<pre> runs to its closing tag, over empty lines", "<pre>\n\n### H\n</pre>\n### K\n",
    [["html"],["h",3,"K"]]],
  ["a <div> inside a list item, right after its text", "- a\n  <div>\n  ```\n  ### H\n  </div>\n\n- b\n\n### K\n",
    [["li",[["p","a"],["html"]]],["li",[["p","b"]]],["h",3,"K"]]],
  ["<? ?> and CDATA blocks", "<?x\n### H\n?>\n<![CDATA[\n### H\n]]>\n### K\n",
    [["html"],["html"],["h",3,"K"]]],
  ["a declaration in capitals", "<!DOCTYPE html>\n### K\n",
    [["html"],["h",3,"K"]]],
  ["a tag with attributes alone on its line", "<a href=\"x\" b='c' d>\n### H\n\n### K\n",
    [["html"],["h",3,"K"]]],
  ["an unfinished tag is text", "<a\n### K\n",
    [["p","a"],["h",3,"K"]]],
  ["a tag indented four spaces is code", "x\n\n    <div>\n### K\n",
    [["p","x"],["code"],["h",3,"K"]]],
  ["item text continues on a lazy line", "- a\nb\n### K\n",
    [["li",[["p","ab"]]],["h",3,"K"]]],
  ["a numbered item not starting at 1 cannot cut into a paragraph", "text\n2. b\n",
    [["p","text2b"]]],
  ["a numbered item starting at 1 can", "text\n1. b\n",
    [["p","text"],["li",[["p","b"]]]]],
  ["an empty item cannot cut into a paragraph", "text\n*\n",
    [["p","text"]]],
  ["a numbered item of any number starts a list after quoted text", "> a\n2. b\n",
    [["q",[["p","a"]]],["li",[["p","b"]]]]],
  ["a bare marker opens an item", "-\n  a\n### K\n",
    [["li",[["p","a"]]],["h",3,"K"]]],
  ["an empty item ends at an empty line", "-\n\n  a\n",
    [["li",[]],["p","a"]]],
  ["a bare marker after item text is a new item", "- a\n-\n  ```\n  ### H\n  ```\n### K\n",
    [["li",[["p","a"]]],["li",[["code"]]],["h",3,"K"]]],
  ["sub-items", "- a\n  - b\n    - c\n- d\n",
    [["li",[["p","a"],["li",[["p","b"],["li",[["p","c"]]]]]]],["li",[["p","d"]]]]],
  ["the text column follows the spaces after the marker", "-   a\n\n    b\n\n  c\n",
    [["li",[["p","a"],["p","b"]]],["p","c"]]],
  ["five spaces after the marker make indented code", "-     a\n",
    [["li",[["code"]]]]],
  ["indented code needs an empty line before it", "text\n    more\n\n    code\n### K\n",
    [["p","textmore"],["code"],["h",3,"K"]]],
  ["a quote with a lazy line", "> a\nb\n\nc\n",
    [["q",[["p","ab"]]],["p","c"]]],
  ["a list in a quote", "> - a\n>   ```\n>   ### H\n>   ```\n### K\n",
    [["q",[["li",[["p","a"],["code"]]]]],["h",3,"K"]]],
  ["heading forms", "# a\n## b ##\n####### c\n#d\n ### e\n\n    ### f\n",
    [["h",1,"a"],["h",2,"b"],["p","cd"],["h",3,"e"],["code"]]],
  ["underlined headings", "a\n===\nb\nc\n---\n",
    [["h",1,"a"],["h",2,"bc"]]],
  ["rules", "a\n\n---\n- - -\n***\n___\n",
    [["p","a"],["hr"],["hr"],["hr"],["hr"]]],
  ["a rule after item text ends the list", "- a\n---\n",
    [["li",[["p","a"]]],["hr"]]],
  ["tabs count to the next multiple of four", "-\ta\n\n\tb\n### K\n",
    [["li",[["p","a"],["p","b"]]],["h",3,"K"]]],
  ["a tab before a fence makes it code", "x\n\n\t```\n### K\n",
    [["p","x"],["code"],["h",3,"K"]]],
];

test('blocks: 52 hand-picked texts are read the way Pandoc reads them', () => {
  for (const [what, md, expected] of SAME_AS_PANDOC) assert.deepStrictEqual(shape(blocks(md)), expected, what);
});

// [what it is, the Markdown, the refusal]. Each is either cut off without its end, or a form that Markdown
// versions and tools read differently; the reader names the line instead of guessing.
const REFUSED = [
  ['a code fence never closed', `${F}\n### H\n`, /^Error: line 1: a code fence is opened and never closed/],
  ['a closing fence followed by a non-breaking space', `${F}\n### H\n${F}${NBSP}\n`, /^Error: line 1: a code fence is opened and never closed/],
  ['a fence cut off by the end of its list item', `- a\n  ${F}\n### H\n`, /^Error: line 2: a code fence inside a list item is not closed before the item ends at line 3/],
  ['a fence in a sub-item cut off by a line at the parent\'s column', `- a\n  - b\n    ${F}\n  ### H\n`, /^Error: line 3: a code fence inside a list item is not closed before the item ends at line 4/],
  ['a fence line at the margin under a list-item fence', `- a\n  ${F}\n  x\n${F}\n### H\n${F}\n`, /^Error: line 2: a code fence inside a list item is not closed before the item ends at line 4/],
  ['a fence cut off by the end of its quote', `> ${F}\n### H\n`, /^Error: line 1: a code fence inside a quote is not closed before the quote ends at line 2/],
  ['an HTML comment never closed', `<!--\n### H\n`, /^Error: line 1: an HTML comment or block is opened and never closed/],
  ['a <pre> never closed', `<pre>\n### H\n`, /^Error: line 1: an HTML comment or block is opened and never closed/],
  ['a comment cut off by the end of its list item', `- a\n  <!--\n### H\n`, /^Error: line 2: an HTML comment or block inside a list item is opened and never closed before the item ends at line 3/],
  ['a <source> tag starting a line', `<source src="x">\n### H\n`, /^Error: line 1: a <source> or <search> tag/],
  ['a <search> tag right under a text line', `text\n<search>\n`, /^Error: line 2: a <source> or <search> tag/],
  ['a closing </pre> alone on a line', `a\n\n</pre>\n### H\n`, /^Error: line 3: a closing <\/pre>/],
  ['a declaration in small letters', `<!doctype html>\n`, /^Error: line 1: a "<!" declaration in small letters/],
  ['a comment written <!-->', `<!-->\n### H\n`, /^Error: line 1: a comment written <!-->/],
  ['a comment written <!--->', `<!--->\n`, /^Error: line 1: a comment written <!-->/],
  ['<?> alone', `<?>\n`, /^Error: line 1: a comment written <!-->/],
  ['a lone tag right after quoted text', `> a\n<span>\n### H\n`, /^Error: line 2: an HTML tag alone on the line after quoted or list text/],
  ['a lone tag right after list text', `- a\n<span>\n`, /^Error: line 2: an HTML tag alone on the line after quoted or list text/],
  ['a link definition', `[foo]: /url\n`, /^Error: line 1: a link definition/],
  ['a link definition in a list item', `- a\n\n  [foo]: /url "t"\n`, /^Error: line 3: a link definition/],
  ['a link definition with an underline', `[foo]: /url\n===\n`, /^Error: line 1: a link definition .* with a line of = or - under it/],
  ['a bare carriage return', `# a\r### H\r\n`, /^Error: line 1: a line that ends with a bare carriage return/],
  ['a bare carriage return on a later line', `# a\n\nb\rc\n`, /^Error: line 3: a line that ends with a bare carriage return/],
];

test('blocks: what would have to be guessed is refused with its line number', () => {
  for (const [what, md, refusal] of REFUSED) assert.throws(() => blocks(md), refusal, what);
});

test('blocks: near misses of the refused forms are certain, and are read (as Pandoc reads them)', () => {
  assert.deepStrictEqual(shape(blocks('[x] task\n===\n')), [['h', 1, 'xtask']], '"[x] task" has no "]:", so it is no link definition');
  assert.deepStrictEqual(shape(blocks('> a\n\n<span>\n### H\n\n### K\n')), [['q', [['p', 'a']]], ['html'], ['h', 3, 'K']], 'a lone tag after an empty line');
  assert.deepStrictEqual(shape(blocks('# a\r\n\r\n### K\r\n')), [['h', 1, 'a'], ['h', 3, 'K']], 'CRLF line ends are ordinary');
  assert.deepStrictEqual(shape(blocks('text\n</pre>\n')), [['p', 'textpre']], 'a closing </pre> right under a text line is part of that text');
  assert.deepStrictEqual(shape(blocks('')), []);
  assert.deepStrictEqual(shape(blocks(String.fromCharCode(0xFEFF) + '# a\n\n### K\n')), [['h', 1, 'a'], ['h', 3, 'K']], 'the byte order mark some editors put first is not text');
});

test('F03: bracketed prose can contain a later link-definition lookalike', () => {
  const prose = '[Reviewer] saw the literal string `[gate]: blocked` in the log.';
  const letters = 'Reviewersawtheliteralstringgateblockedinthelog';
  assert.deepStrictEqual(shape(blocks(prose)), [['p', letters]]);
  assert.deepStrictEqual(shape(blocks(prose.replace('[gate]', '\\[gate]'))), [['p', letters]]);
  assert.deepStrictEqual(shape(blocks(`${prose}\n===\n`)), [['h', 1, letters]]);
  assert.deepStrictEqual(shape(blocks('[Reviewer] read the log.\n[gate]: /review\n')), [['p', 'Reviewerreadtheloggatereview']]);
});

test('F03: only an unescaped label close immediately followed by a colon marks a link definition', () => {
  assert.deepStrictEqual(shape(blocks('[gate\\]: read] was literal text.\n')), [['p', 'gatereadwasliteraltext']]);
  assert.deepStrictEqual(shape(blocks('[team [gate]: prose\n')), [['p', 'teamgateprose']]);
  assert.deepStrictEqual(shape(blocks('[gate] : prose\n')), [['p', 'gateprose']]);
  assert.deepStrictEqual(shape(blocks('[]: prose\n')), [['p', 'prose']]);
  assert.deepStrictEqual(shape(blocks('[ ]: prose\n')), [['p', 'prose']]);
  for (const label of ['gate', 'review\nname', 'a \\[b', 'a \\] b', 'a \\\\']) {
    assert.throws(() => blocks(`# Heading\n\n[${label}]: /review\n`), /^Error: line 3: a link definition/);
  }
  assert.throws(() => blocks('[gate]: text with spaces\n'), /^Error: line 1: a link definition/);
});

test('blocks: what the plan reader uses: heading text, paragraph lines, items inside items, line numbers', () => {
  const doc = blocks('# Plan: T ##\n\n- **Covers:** M1\n  wrapped\nlazy\n  - sub one\n    - sub two\n\nUnder\n-----\n');
  const [h, item, underlined] = doc.kids;
  assert.deepStrictEqual([h.t, h.level, h.text, h.line], ['heading', 1, 'Plan: T', 1]);
  assert.deepStrictEqual(item.kids[0].lines, ['**Covers:** M1', 'wrapped', 'lazy']);
  assert.deepStrictEqual([item.kids[1].t, item.kids[1].kids[0].lines, item.kids[1].kids[1].kids[0].lines], ['item', ['sub one'], ['sub two']]);
  assert.deepStrictEqual([underlined.t, underlined.level, underlined.text, underlined.setext, underlined.line], ['heading', 2, 'Under', true, 9]);
  assert.strictEqual(blocks('- a\n\n  ```\n  x\n  ```\n').kids[0].kids[1].t, 'code');
});

test('blocks: a recorded sample of generated texts reads the same as Pandoc read it', () => {
  const sample = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'markdown-blocks', 'pandoc-sample.json'), 'utf8'));
  assert.ok(sample.length >= 300, 'the sample is there');
  for (const { md, tree } of sample) assert.deepStrictEqual(shape(blocks(md)), tree, JSON.stringify(md));
});
