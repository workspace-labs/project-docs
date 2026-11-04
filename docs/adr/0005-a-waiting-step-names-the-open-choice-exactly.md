# 0005. A waiting step names the open choice exactly

- Status: proposed (records the owner's decision on finding F02 in review round 7; accepted on the
  owner's word)
- Date: 2026-11-04 (recorded); decided 2026-10-08
- Decided by: the owner, as `TESTING.md` records for finding F02

## Context

A plan step that needs a choice the TRD left open is blocked: `⛔ waits for TBD: <what>`. The first
independent review (finding F02, medium) showed such a step could name a choice that did not exist, or
named it loosely, while every test passed. A builder then cannot tell whether the step is still blocked,
and a test cannot tell either. The finding was reopened through six fixes and settled by the owner's
decision in round 7.

## Options weighed

1. **Match by meaning:** let the agent shorten or paraphrase the TBD. Readable, but neither a person nor a
   test can check it reliably.
2. **A short ID per TBD** (`TBD-3`). Exact, but adds a numbering scheme to every document for one link.
3. **Quote the TBD exactly:** the words between `TBD:` and `. Decided when`, never shortened.

## Decision

Option 3. An unchecked step that needs an open choice has the status
`⛔ waits for TBD: <the words of that TBD line>`, exactly. If it needs more than one, it names the first
and its check says what else it waits for. A step that itself settles the TBD is not blocked and says so
in its check.

## Consequences

- A test finds the open TBD by its exact words, and fails when the step names a choice that is not open.
  This closed F02.
- Status lines can be long. That is accepted for a match nobody has to guess.
- Rewording a TBD line means rewording every step that waits for it, in the same change.
- When the TBD is settled, the step's history follows [ADR 0004](0004-approved-choices-keep-their-history.md).
