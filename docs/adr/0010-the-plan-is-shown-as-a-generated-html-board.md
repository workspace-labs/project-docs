# 0010. The plan is shown as a generated HTML board

- Status: accepted
- Date: 2026-11-19
- Decided by: the owner chose the board look and the flow, and accepted the Node.js script ("accept",
  2026-11-19, after eleven rounds of independent review)

## Context

The owner wants to see the plan before anything is built, and later to ask "where are we?" at any time and
see the answer, because people forget where a project stands. The plan changes after every step. He also
shares the page with friends, who open it on an iPhone from a chat.

## Options weighed

1. **A PDF of the plan, rebuilt after every step.** Easy to send, but every "where are we?" means drawing the
   whole document again: slow, costly in tokens, and old copies pile up.
2. **The AI writes the HTML page by hand after every step.** No program needed, but the same token cost, and
   the page can drift from `docs/plan.md`.
3. **A page drawn by JavaScript from a data file**, like the Design preview. Cheap to update, but a phone's
   file preview runs no JavaScript, so nothing opens there.
4. **A small script turns `docs/plan.md` into one finished HTML file.** The AI changes one Status line and
   runs the script; the page always matches the plan, and its cards open with plain HTML.

## Decision

Option 4. The owner picked the board look (four columns, cards that open to the plan, what was built and his
decisions) from three looks and two rounds. The script is Node.js with no packages: the tests already run on
Node.js, and the coding tools that can run commands normally have it. A PDF is offered once, after the Plan
is approved, as a printed copy of the page.

## Consequences

- The page needs Node.js to be made. Without it, or in a chat that cannot run commands, the skill says so and
  the plan stays in `docs/plan.md`; it never installs Node.js.
- Every card opens through a radio button and labels, so the page works with JavaScript off. The evidence:
  the owner's iPhone, opening a demo of the board from a chat, opened no card while the popups needed
  JavaScript and opened them once they used labels; this build was tapped in WebKit at iPhone size with
  JavaScript off. This exact build has not been tried on a physical iPhone. The one small script only adds
  the keyboard: focus into the open card, Tab kept inside it, focus back to the card on close.
- The script reads the plan through its Markdown block structure, the way CommonMark reads it, and refuses
  what it would have to guess (ADR 0011). It reads only the `## Steps` section. A Changed line is split into
  old and new only when the boundary is certain; otherwise it is shown whole. It refuses a plan it would show
  wrongly (a heading that is not a step, steps out of order, an empty check, two Status lines, a Status not
  in one of the four exact forms of the plan's language), naming the step to fix.
- While a card is open the board behind it is locked with CSS alone, so taps on the backdrop close the card
  on a scrolled board too.
- A changed check shows its first wording marked as history, with each change below it: what it is now,
  the part it replaced, and why.
- Two lines join a step while work goes on: **Built** (written with the waiting status) and **Your note**
  (only the person's own words). The board shows them; the Plan's checks are unchanged.
- The examples carry their generated `plan.html`, and a test fails when one falls out of date.
