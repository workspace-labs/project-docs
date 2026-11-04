# 0004. Approved choices keep their history

- Status: proposed (records the rule shipped since 0.1.0 and extended in 0.1.1 and 0.2.2; accepted on
  the owner's word)
- Date: 2026-11-04 (recorded); the rule dates from 2026-10-08
- Recorded by: an agent, from `SKILL.md`, the references and `CHANGELOG.md`. Who first decided it is not
  asserted here.

## Context

The documents are the truth every AI builds from. When an approved choice changes (SQLite becomes
PostgreSQL), a builder reading only the new value cannot tell that it changed, when, or why, and an AI
with an old copy in its memory cannot tell which is current. A choice left open (`TBD`) must stay
findable until it is settled, and work waiting on it must say so. Reopening a choice that was already
settled (0.1.1) and settling a plan step's wait (0.2.2) both broke earlier, simpler versions of this rule.

## Options weighed

1. **Overwrite the line.** Simple, but history is lost; the document says what, never what it used to be.
2. **Leave history to Git.** Accurate, but the person and their client read documents, not commits, and
   many projects are never in Git.
3. **Keep every approved line, and add a dated `Changed` line under it**, with the change and its reason.

## Decision

Option 3, in the documents themselves:

- An approved line is never rewritten. A change adds `  - Changed <date>: <old> → <new>, because <reason>.`
  under it, raises the version and returns the document to `Draft` until it is approved again.
- Settling a `TBD` is a change too: the `TBD` line stays, with a `Changed … TBD → <choice>` line under it.
- Reopening a choice adds `Changed … <choice> → TBD`. When the choice has no canonical TBD line yet, the
  old choice and its chain move into a collapsed `<details data-project-docs-history>` record, and one
  current `- TBD: <what is open>. Decided when <…>.` line goes outside it. Only history outside such
  records decides; its latest change wins. Superseded Data ready blocks are kept the same way.
- A settled plan wait is recorded as `  - Changed <date>: waited for <what> → not started, because …`,
  never repeating the `⛔ waits for TBD:` words, so a settled step cannot read as still waiting.
- A document that has never been approved has nothing locked: it is simply edited.

## Consequences

- Any reader sees the current choice, every earlier one, and why each changed, in one file.
- The shapes are fixed, so `tests/documents.test.js` checks them in both languages and catches the old
  wrong shapes.
- Documents grow with each change. That is accepted: history is the point.
- Every new kind of locked line needs its history shape written in its reference file and tested.
