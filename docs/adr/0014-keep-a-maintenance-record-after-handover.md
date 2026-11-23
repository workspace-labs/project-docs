# 0014. Keep a maintenance record after handover

- Status: Accepted
- Date: 2026-11-23
- Decided by: the owner ("yes boss", then "fix it boss", 2026-11-23)
- Replaces: the rule in [ADR 0008](0008-the-skill-covers-the-project-from-the-client-meeting-to-the-handover.md) that a project built alone never has a Handover

## Context

The Handover says who looks after a delivered project. People also need to know when care is due, what
was checked last time, and how to handle a client's request after delivery. Updating the approved
Handover whenever a visit happens would reopen approval for routine work.

This extends [ADR 0008](0008-the-skill-covers-the-project-from-the-client-meeting-to-the-handover.md)
beyond delivery. For a solo project the new record is optional and requires an approved Handover.

## Decision

- Extend project-docs, which already keeps the Handover and Plan.
- Agree light and full visit rhythms and the result recipient with the client in Handover. Serious
  security fixes use a separate deadline measured in days from when the fix is published. Urgent work
  can fall between visits.
- Keep dates and history in `docs/maintenance.md`. The approved Handover holds the rule. The record
  has no stamp or approval round.
- Read the next dates first when the project opens and report what's due soon or overdue. After each
  recorded visit, give the next date for the person's calendar.
- Use the approved PRD to distinguish a fault under the Handover agreement from a change that needs
  PRD approval. Routine care belongs to a visit. Show the PRD line used and ask the person to decide
  when the PRD leaves it open.
- Keep project-docs responsible for documentation. Whoever runs the checks supplies the results, and
  only the person marks the visit checked.

## Consequences

- Recording a visit keeps the agreed Handover in place. To change the agreement, use the Handover's
  existing version and approval rules.
- The person decides what to act on and who pays. A client change needs a newly approved PRD version
  before work starts.
