# 0009. Understanding a client project takes four meetings, not one

- Status: Superseded in part by [0013](0013-client-discovery-runs-in-four-stages.md) (the fixed meeting count)
- Date: 2026-11-13
- Decided by: the owner ("go", 2026-11-13, after reading the research summary)

## Context

The 0.3.0 meeting form was one first meeting that asked everything at once, then the PRD. The owner's own
method is several meetings: questions, then how the work runs (a workflow), then the screens, then more
meetings, and only then building. A research report on how large organisations work before they build
(government digital manuals, published consultancy methods, the requirements standards) found:

- no source publishes a fixed meeting count, and none requires a signed requirements document for a small
  system; they share an order instead: the problem, how the work runs today, a list the client can reject,
  one person approves the scope or the work stops, a rough prototype, then building;
- stopping is a valid result, not a failed project;
- signing the meeting notes is not approving the scope, and neither is accepting the finished system;
- the questions the form never asked: budget, whether the date is fixed, availability, old records, speed,
  accessibility, policy, training, retiring it, assumptions and risks, and a check for each requirement.

## Options weighed

1. **Keep one meeting, add the missing questions.** Smallest, but keeps deciding in the same room where the
   needs are first heard: the mistake the research names most.
2. **Four meetings in one form:** the goal; the people and today's work (notes signed); the needs and the
   new way; approve the scope or stop. The PRD is drafted between meetings 3 and 4.
3. **One meeting per project stage** (twelve). Matches a stage list, but heavy for a small project and the
   later stages are checks, not discovery.

## Decision

Option 2. The meeting count is our own synthesis, not a published rule. The PRD gains **How it works
today**, **How it will work**, a **Check** under each must-do line, **Assumptions and risks**, and **Dates
and budget**; the TRD gains **Available** and **Accessibility**; Data asks about old records.

## Consequences

- A small project may hold meetings 1 and 2 together, but meeting 4 always stands alone, after the PRD draft.
- A form whose meeting 4 says Stop ends the work; the PRD stays a Draft.
- Change control is the existing rule: after approval a change is a `Changed` line approved again by the
  person who approves the scope. The form now tells the client so.
- A project built for oneself still needs no form; its PRD writes one line for today and one for after.
