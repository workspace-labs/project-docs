# 0012. The documents are read on a generated reader page

- Status: accepted
- Date: 2026-11-20 (accepted 2026-11-21)
- Decided by: the owner chose the Pearl look from his own Design Library after three rounds of looks
  ("this one", 2026-11-20), asked for plan steps to fold, and asked for WorkSpace Labs at the bottom.
  He chose the phone's document list after trying it in iPhone Files ("1 better", 2026-11-21).
  He accepted the script after six rounds of independent review ("approve", 2026-11-21).

## Context

The documents are Markdown, written so an AI can follow them. For a person they are hard to read: small
text, marks like `#` and `**`, long lists. The owner saw a short video of the same documents drawn as
pages, and wanted that for his own projects, in a design of his own.

## Decision

A script, `scripts/read-page.js` (Node.js, no packages), makes `docs/read.html` from the seven planning
documents the project has (not the client meeting form). It reads each document through the same CommonMark block reader as the plan page
(`scripts/markdown-blocks.js`, ADR 0011), so it refuses with a line number what it would have to guess. It
shows every word of every planning document in that document's view. The nearest enclosing question in
the same quote owns each change. The Overview and Plan badges share the visible steps matched to the plan
page's parser. The stamp follows the whole title. The script creates a fresh `.html` file or refreshes one
with the reader's generated header and ending. On refusal it reports the cause and whether there is a
prior reader at that path. The Pearl design embeds its fonts and steps fold with HTML `details`, so
the page works offline with JavaScript disabled.

All view links point to the relevant article with a fragment such as `#v-prd`. CSS `:target` shows
that view, and the browser scrolls to it and gives it focus. The Overview is visible by default and
follows the document articles so a targeted sibling can hide it without `:has()`. The desktop tile
highlight uses `:has()` when supported. At 820 px and below the document list leads the Overview
after its counts. Each document has a link back to the Overview above its header.

## Consequences

- The Markdown files stay the only source of truth; the page is regenerated after each document change,
  and each example carries an up-to-date page that the tests compare.
- Every page carries about 120 KB of fonts (about 450 KB for an Arabic page, which adds an Arabic font).
- Display rules (tiles for `Label: value` lines, open-question marks for `TBD`, folding steps) follow the
  references' fixed wording in English and Arabic; a line written another way is still shown, as written.
- A fragment can open a specific document directly. Fragment navigation puts the reader at the top
  of the selected view after a tap from a scrolled list.
- Radio controls kept the prior view's scroll position on the phone. Fragment links let the browser
  handle the scroll and keyboard focus on both phone and computer.
- Rejected: drawing the pages by hand per project (goes stale), and styling raw Markdown in the browser
  (needs JavaScript and a network library).
