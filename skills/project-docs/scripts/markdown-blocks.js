'use strict';
// The block structure of a Markdown text, read the way CommonMark reads it: which lines are headings, list
// items, quotes and paragraphs, and which are code or raw HTML and so not content at all. It follows the
// block phase of the CommonMark reference parser (commonmark.js) step by step, without the inline phase.
//
//   blocks(text) → { t: 'doc', kids }
//   a kid is one of: { t: 'heading', level, text, line, setext? } · { t: 'para', lines, line }
//                    { t: 'item', kids, line } · { t: 'quote', kids } · { t: 'code' } · { t: 'html' } · { t: 'hr' }
//   (items sit directly in their container; lists are not grouped)
//
// What it would have to guess, it refuses with the line number:
// - a code fence, or an HTML block with its own end mark (a comment, <pre>, <script>, <style>, <textarea>,
//   <? ?>, <! >, CDATA), that is never closed, or is cut off because the list item or quote around it ends;
// - forms that Markdown versions and tools read differently: a <source> or <search> tag starting a line, a
//   closing </pre> </script> </style> </textarea> alone on a line, a "<!" declaration in small letters, a
//   comment written <!--> or <!--->, an HTML tag alone on the line right after quoted or list text, a link
//   definition ("[label]: address"), and a line that ends with a bare carriage return.

const BLOCK_TAGS = 'address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog'
  + '|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li'
  + '|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|summary|table|tbody|td|tfoot|th|thead'
  + '|title|tr|track|ul';
const TAG = '[A-Za-z][A-Za-z0-9-]*';
const ATTR = '(?:[ \\t]+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:[ \\t]*=[ \\t]*(?:[^"\'=<>`\\x00-\\x20]+|\'[^\']*\'|"[^"]*"))?)';
// The seven kinds of HTML block: how each starts and, for the first five, the mark that ends it. Kinds 6
// and 7 end at the next empty line. Kind 7 (any one whole tag alone on its line) cannot cut into a paragraph.
const HTML = [
  { kind: 1, start: /^<(?:script|pre|textarea|style)(?:[ \t>]|$)/i, end: /<\/(?:script|pre|textarea|style)>/i },
  { kind: 2, start: /^<!--/, end: /-->/ },
  { kind: 3, start: /^<\?/, end: /\?>/ },
  { kind: 4, start: /^<![A-Za-z]/, end: />/ },
  { kind: 5, start: /^<!\[CDATA\[/, end: /\]\]>/ },
  { kind: 6, start: new RegExp(`^</?(?:${BLOCK_TAGS})(?:[ \\t]|/?>|$)`, 'i') },
  { kind: 7, start: new RegExp(`^(?:<${TAG}${ATTR}*[ \\t]*/?>|</${TAG}[ \\t]*>)[ \\t]*$`) },
];
const UNSURE_TAG = /^<\/?(?:source|search)(?:[ \t]|\/?>|$)/i;
const UNSURE_CLOSER = /^<\/(?:script|pre|textarea|style)[ \t]*>[ \t]*$/i;

function blocks(text) {
  const refuse = (line, why) => { throw new Error(`line ${line}: ${why}`); };
  let source = String(text);
  if (source.charCodeAt(0) === 0xFEFF) source = source.slice(1); // the byte order mark some editors put first is not text
  const bareReturn = source.search(/\r(?!\n)/);
  if (bareReturn >= 0) {
    refuse(source.slice(0, bareReturn).split('\n').length, 'a line that ends with a bare carriage return (the old Mac line end) is read as one line by some Markdown tools and as two by others; save the file with ordinary line ends');
  }
  const lines = source.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();
  const doc = { t: 'doc', kids: [], open: true, parent: null, line: 0 };
  let tip = doc; // the deepest open block
  let no = 0;
  const holds = (n) => n.t === 'doc' || n.t === 'quote' || n.t === 'item';
  const needsItsEnd = (n) => !n.closed && ((n.t === 'code' && n.fenced) || (n.t === 'html' && n.kind <= 5));
  const linkDefinition = (p) => {
    if (p.lines[0][0] !== '[') return false;
    // The opening label may span lines. Only its unescaped closing bracket can introduce a definition.
    const prefix = /^\[((?:\\[\s\S]|[^[\]\\])*)\]:/.exec(p.lines.join('\n'));
    return prefix !== null && /[^ \n]/.test(prefix[1]);
  };
  const close = (n) => {
    if (n.t === 'para' && linkDefinition(n)) {
      refuse(n.line, 'a link definition ("[label]: address") is not ordinary text in Markdown; write the address inside the sentence');
    }
    n.open = false;
    tip = n.parent;
  };
  const add = (t, more) => {
    while (!holds(tip)) close(tip);
    const n = { t, open: true, parent: tip, line: no, ...more };
    tip.kids.push(n);
    tip = n;
    return n;
  };

  for (const raw of lines) {
    no += 1;
    let line = ''; // tabs count as spaces up to the next multiple of four, as Markdown counts them
    for (const ch of raw) line += ch === '\t' ? ' '.repeat(4 - (line.length % 4)) : ch;
    let off = 0, ns = 0, indent = 0, blank = false;
    const find = () => { ns = off; while (line[ns] === ' ') ns += 1; indent = ns - off; blank = ns >= line.length; };

    // 1. Which open blocks does this line continue?
    const oldTip = tip;
    let container = doc, last, done = false;
    while ((last = container.kids && container.kids[container.kids.length - 1]) && last.open) {
      container = last;
      find();
      let ok = true;
      if (container.t === 'quote') {
        if (indent <= 3 && line[ns] === '>') { off = ns + 1; if (line[off] === ' ') off += 1; } else ok = false;
      } else if (container.t === 'item') {
        if (blank) { if (container.kids.length) off = ns; else ok = false; }
        else if (indent >= container.width) off += container.width;
        else ok = false;
      } else if (container.t === 'para') {
        ok = !blank;
      } else if (container.t === 'code' && container.fenced) {
        const m = indent <= 3 && line[ns] === container.char && /^(?:`{3,}|~{3,})(?= *$)/.exec(line.slice(ns));
        if (m && m[0].length >= container.len) { container.closed = true; close(container); done = true; break; }
        for (let i = container.offset; i > 0 && line[off] === ' '; i -= 1) off += 1;
      } else if (container.t === 'code') {
        if (indent >= 4) off += 4; else if (blank) off = ns; else ok = false;
      } else if (container.t === 'html') {
        ok = !(blank && container.kind >= 6);
      }
      if (!ok) { container = container.parent; break; }
    }
    if (done) continue; // the line was a closing fence

    let allClosed = container === oldTip;
    const lastMatched = container;
    const closeUnmatched = () => {
      if (allClosed) return;
      for (let n = oldTip; n !== lastMatched;) {
        const up = n.parent;
        if (needsItsEnd(n)) {
          let inside = 'quote';
          for (let c = n.parent; c !== lastMatched; c = c.parent) if (c.t === 'item') inside = 'list item';
          const part = inside === 'quote' ? 'quote' : 'item';
          refuse(n.line, n.t === 'code'
            ? `a code fence inside a ${inside} is not closed before the ${part} ends at line ${no}; close it inside the ${part}`
            : `an HTML comment or block inside a ${inside} is opened and never closed before the ${part} ends at line ${no}; close it inside the ${part}`);
        }
        close(n);
        n = up;
      }
      allClosed = true;
    };

    // 2. Does it start new blocks? (Not inside code or HTML: there every line is content.)
    let leaf = container.t === 'code' || container.t === 'html';
    while (!leaf) {
      find();
      const indented = indent >= 4;
      const rest = line.slice(ns);
      let m;
      if (!indented && rest[0] === '>') { // a quote
        off = ns + 1;
        if (line[off] === ' ') off += 1;
        closeUnmatched();
        container = add('quote', { kids: [] });
        continue;
      }
      if (!indented && (m = /^#{1,6}(?: +|$)/.exec(rest))) { // a # heading
        closeUnmatched();
        container = add('heading', { level: m[0].trim().length, text: rest.slice(m[0].length).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '').trim() });
        close(container);
        leaf = true;
        break;
      }
      if (!indented && (m = /^`{3,}(?![^]*`)|^~{3,}/.exec(rest))) { // a code fence
        closeUnmatched();
        container = add('code', { fenced: true, char: m[0][0], len: m[0].length, offset: indent });
        leaf = true;
        break;
      }
      if (!indented && rest[0] === '<') { // an HTML block
        const lazy = !allClosed && tip.t === 'para'; // the line could also continue the text above, lazily
        const aloneTag = HTML[6].start.test(rest) && container.t !== 'para';
        if (UNSURE_TAG.test(rest)) refuse(no, 'a <source> or <search> tag at the start of a line is read differently by different Markdown versions; put it inside a sentence or remove it');
        if (/^<![a-z]/.test(rest)) refuse(no, 'a "<!" declaration in small letters is read differently by different Markdown versions; remove it');
        if (/^<!---?>/.test(rest) || /^<\?>/.test(rest)) refuse(no, 'a comment written <!--> or <!--->, or <?>, is read as closed by some Markdown tools and as still open by others; write <!-- --> instead');
        if (aloneTag && UNSURE_CLOSER.test(rest)) refuse(no, 'a closing </pre>, </script>, </style> or </textarea> alone on a line is read differently by different Markdown versions; remove it');
        if (aloneTag && lazy && !HTML.slice(0, 6).some((h) => h.start.test(rest))) refuse(no, 'an HTML tag alone on the line after quoted or list text is read differently by different Markdown tools; leave an empty line before it, or put it inside the sentence');
        const html = HTML.find((h) => h.start.test(rest) && (h.kind < 7 || (container.t !== 'para' && !lazy)));
        if (html) {
          closeUnmatched();
          container = add('html', { kind: html.kind, end: html.end });
          leaf = true;
          break;
        }
      }
      if (!indented && container.t === 'para' && /^(?:=+|-+) *$/.test(rest)) { // an underline: the text above is a heading
        if (linkDefinition(container)) refuse(container.line, 'a link definition ("[label]: address") with a line of = or - under it is read differently by different Markdown tools; remove the underline');
        Object.assign(container, { t: 'heading', level: rest[0] === '=' ? 1 : 2, text: container.lines.join(' '), setext: true, open: false });
        tip = container.parent;
        leaf = true;
        break;
      }
      if (!indented && /^(?:\* *){3,}$|^(?:_ *){3,}$|^(?:- *){3,}$/.test(rest)) { // a rule
        closeUnmatched();
        container = add('hr');
        close(container);
        leaf = true;
        break;
      }
      if (!indented && (m = /^[*+-]/.exec(rest) || /^(\d{1,9})[.)]/.exec(rest))) { // a list item
        const interrupts = container.t === 'para'; // then it must have text, and a numbered one must start at 1
        const after = rest.slice(m[0].length);
        if ((after === '' || after[0] === ' ') && !(interrupts && (!/[^ \f\v]/.test(after) || (m[1] !== undefined && Number(m[1]) !== 1)))) {
          const p = ns + m[0].length;
          let sp = 0;
          while (sp < 5 && line[p + sp] === ' ') sp += 1;
          const wide = sp >= 5 || sp < 1 || p + sp >= line.length; // then the text starts one space after the marker
          off = p + (wide ? (line[p] === ' ' ? 1 : 0) : sp);
          closeUnmatched();
          container = add('item', { kids: [], width: indent + m[0].length + (wide ? 1 : sp) });
          continue;
        }
      }
      if (indented && tip.t !== 'para' && !blank) { // indented code
        off += 4;
        closeUnmatched();
        container = add('code', { fenced: false });
        leaf = true;
        break;
      }
      break;
    }

    // 3. What is left is text.
    if (!allClosed && !blank && tip.t === 'para') { tip.lines.push(line.slice(ns).trim()); continue; } // a lazy line
    closeUnmatched();
    if (container.t === 'para') container.lines.push(line.slice(ns).trim());
    else if (container.t === 'html' && container.kind <= 5 && container.end.test(line.slice(off))) { container.closed = true; close(container); }
    else if (holds(container) && !blank) add('para', { lines: [line.slice(ns).trim()] });
  }

  for (let n = tip; n !== doc; n = n.parent) {
    if (needsItsEnd(n)) {
      refuse(n.line, n.t === 'code' ? 'a code fence is opened and never closed; close it on its own line' : 'an HTML comment or block is opened and never closed; close it');
    }
    close(n);
  }
  return doc;
}

module.exports = { blocks };
