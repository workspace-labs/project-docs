# 0002. The documents live in docs/, and the PRD is the scope

- Status: accepted
- Date: 2026-10-08
- Decided by: the owner (PRD round, 2026-10-08)

## Context

A user's project needs one predictable place for the documents, so any AI on any computer finds them.
Many projects (the owner's among them) already keep `docs/scope.md`, which says what is in and what is out,
the same thing as the PRD's "What it must do" and "What it will NOT do".

## Options weighed

1. **A separate `project-docs/` folder.** Keeps the documents apart, but it is a second home next to `docs/`.
2. **`docs/`, with `DESIGN.md` at the project root.** `docs/` is where people already look. `DESIGN.md`
   at the root is where design rules are commonly kept, and where the owner's projects keep it.
3. On scope: **keep both `scope.md` and `prd.md`**, or **let the PRD count as the scope**.

## Decision

Option 2: `docs/prd.md`, `docs/trd.md`, `DESIGN.md`, `docs/data.md`, `docs/security.md`, `docs/plan.md`.
When `docs/prd.md` exists, it counts as the project's scope: one place for the truth, so two files never
drift apart.

## Consequences

- If a project already has `docs/scope.md`, the PRD questions start from it, and the skill does not
  delete it. The person decides what to do with it.
- If a project already has `docs/plan.md` or `DESIGN.md`, the skill reads it first and fills only the gaps.
- The owner's own engineering rule that asks for `docs/scope.md` gets its wording changed separately
  (plan step 15), outside this repository.
