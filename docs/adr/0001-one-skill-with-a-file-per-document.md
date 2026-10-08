# 0001. One skill, with a file per document

- Status: accepted
- Date: 2026-10-08
- Decided by: the owner ("1 skill + frameflow", locked 2026-10-08)

## Context

The project needs six documents before building: PRD, TRD, Design, Data, Security, Plan. Each one feeds
the next (the TRD builds on the approved PRD, Data proposes sheets from the PRD, Security gathers from the
TRD and Data, the Plan is blocked by any TBD in the TRD). The app flow already has its own public skill,
frameflow.

## Options weighed

1. **Six separate skills.** Each one is small, but there are six triggers that can clash with each other and
   with workflow-project, and the order between them lives nowhere.
2. **One skill: a short `SKILL.md` menu plus one reference file per document.** One trigger and one folder,
   and the order lives in one place. Only the document being written gets loaded.

## Decision

Option 2. `SKILL.md` holds the order and the shared loop (ask, read back, write, approve). Each document's
questions and exact headings live in `references/<document>.md`. frameflow stays its own skill, and
project-docs offers it once.

## Consequences

- An agent always loads only the descriptions of skills, so one skill costs no more than six.
- `SKILL.md` must stay short: anything about one document belongs in its reference file.
- Adding a document later means one new reference file and one line in the order.
