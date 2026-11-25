# 0016. Confirm today before planning a change

- Status: Accepted (by the owner, 2026-11-25)
- Date: 2026-11-25

## Context

When someone asks to develop a built project, they need to agree how it works today before planning
the change. A builder needs to see which approved requirements are already met and which are work for
this change. A workflow of today's project can also uncover gaps that need the person's decision.

## Decision

- Read the built project, show how it works today and bring each confirmed gap to the person. Where
  workflow-project is available, use its current workflow and any gaps it found. Confirm today's flow
  before planning the change.
- After the person confirms today's flow, check the code's health before planning the change. Use
  an available read-only audit skill or report only the problems confirmed while reading the code.
  Get the person's yes before running the project's scripts or tests. The check produces findings only.
- Put `(works today)` or `(changes)` at the end of the applicable PRD `M` line. New work has no mark.
  Use the `(works today)` lines and their checks as the list of behavior to keep.
- Start the Plan with a step that changes nothing. Keep a safe copy, run the `(works today)` checks on
  the untouched project and record the results. Run those checks again at the end.
- Ask the person to sort every confirmed gap and finding. An agreed fix to user behaviour goes into
  an `M` line with a `Check:`. Other agreed fixes go into approved TRD, Data or Security rules that the
  Plan step cites. A deferred fix goes under **Later**, and an issue left in place goes under
  **Assumptions and risks**.
- Agree dates and budget after the person sorts the gaps and findings, with the chosen fixes included
  in the work.

## Options considered

- A separate **Must keep working** heading would break the PRD's heading contract and repeat the `M`
  lines and their checks.
- A separate development or health-check skill would split the scope decisions from the documents
  and approvals. The owner chose to keep this case in project-docs.
- A separate health-check document would repeat decisions that already have a place in the PRD,
  TRD, Data, Security and the Plan.

## Consequences

Builders can see what to preserve and what to implement. A before-and-after record lets the person
distinguish a check that already failed from a regression during the work.
