# 0011. The plan page reads Markdown the way CommonMark does, or refuses

- Status: accepted
- Date: 2026-11-19
- Decided by: the owner ("accept", 2026-11-19), on the builder's proposal after eleven rounds of independent
  review of 0.8.0

## Context

The plan page must never misstate the plan: no card for a step that is only an example inside a code block
or raw HTML, and no real step hidden by one. The first builds read `docs/plan.md` line by line, with one
pattern per kind of line. Each independent review, which checked against Pandoc, found another Markdown shape
that a line pattern read differently from a Markdown parser: an indented fence, a fence inside a list item, a
lazy line, an HTML comment, a `<div>` right under a paragraph. Seven rounds of new patterns did not end it,
because in Markdown what a line is depends on the lines around it.

## Options weighed

1. **Keep adding line patterns.** Each fix is small, and the class of mistakes stays open.
2. **Refuse everything outside the plan template** (no code blocks, no HTML). Safe and tiny, but it refuses
   plans that are valid Markdown and that earlier builds read, such as an appendix with a fenced example.
3. **Use an existing Markdown parser.** A JavaScript parser bundled with the skill would run with Node.js
   alone and need no separate installation. That choice would add third-party code to distribute, maintain
   and review. Calling Pandoc from the shipped script would require users to have Pandoc at runtime. The
   comparison tool already uses Pandoc during development.
4. **A small block reader of its own** that follows the block phase of the CommonMark reference parser step
   by step (containers, lazy lines, fences, the seven kinds of HTML block), with no inline parsing, and that
   refuses what it would have to guess.

## Decision

Option 4. `scripts/markdown-blocks.js` gives the block structure; `scripts/plan-page.js` reads the plan from
those blocks and never from raw lines. Where the reference parser, the written standard and Pandoc disagree
on a form, the form is refused with its line number instead of being read one of the ways.

## Consequences

- The reader is checked against Pandoc, not against the builder's understanding of Markdown.
  `tools/blocks-vs-pandoc.js` generates texts full of awkward lines and compares, for every text the script
  does not refuse, the block structure and the plan read from it with what `pandoc -f commonmark` gives. The
  tests keep hand-picked cases and a recorded sample with the structure Pandoc gave. After any change to the
  reader, the comparison is run again (`AGENTS.md`).
- Some plans are refused that a looser reader would draw: an unclosed code block or HTML comment, and the
  forms that tools read differently (listed at the top of `markdown-blocks.js`). The refusal names the line,
  and the plan stays in `docs/plan.md` until it is fixed.
- A text line with `===` or `---` under it is a heading in Markdown. At the top level of a plan it is
  refused: a level-2 heading ends the steps, which is rarely what the writer of a `---` rule meant.
- Only the check field can hold changes to the check or settled-wait status history. A field's text may run
  over lines. An indented heading, or a field written with `*`, is read as Markdown reads it.
- The change-entry parser looks for the template's transition and reason markers outside matching quotes,
  brackets and code marks. An ambiguous transition is recorded as written. Quote a wait name containing
  `→` or «إلى» so the script can identify the status transition. A recognized change entry with an invalid
  date is refused with the step name.
- Pandoc is needed only to run the comparison. Using the skill still needs only Node.js for this script.
