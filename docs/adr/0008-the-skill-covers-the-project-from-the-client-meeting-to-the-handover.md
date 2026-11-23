# 0008. The skill covers the project from the client meeting to the handover

- Status: Superseded in part by [0014](0014-keep-a-maintenance-record-after-handover.md) (a solo project may have a Handover; the time after the handover)
- Date: 2026-11-13
- Decided by: the owner (three choices, 2026-11-13)

## Context

A team building projects for clients with AI was given a twelve-stage project life: receive the project,
gather the stakeholders' needs, turn them into an approved scope, design, prototype, build, functional test,
security test, acceptance test (UAT), install on the client's network, live test there, hand over. The
skill covered the first four well, the middle ones in part, and nothing from the handover on. The team also
needed a paper form for the first client meeting, where no AI is in the room.

## Options weighed

1. **Smallest fix:** stakeholders and UAT in the PRD, a handover section in the Plan.
2. **Fill the gaps:** keep the six documents, add "Who decides" to the PRD, a short Handover document, and
   fixed delivery steps in the Plan; add the meeting form.
3. **Rebuild the skill around the twelve stages.**

## Decision

Option 2, kept generic ("the client's network or servers", no organisation's names), with the meeting form
inside the skill so its questions and the documents never drift apart.

## Consequences

- A project built for oneself writes one "alone" line and gets no Handover document and no delivery steps,
  so small projects stay small.
- The delivery steps have fixed names in both languages, so the tests can check they are all there, in order.
- The meeting form is not an approved document: it has no stamp, and its answers are only drafts for the PRD.
- After a blind dry run the owner also added: Dates and Later in the PRD, the approver's name in the
  stamp, more meeting-form questions, a prototype on made-up data before the database, and Guides and
  training and Go-live steps. The acceptance test runs on a test copy the testers can reach, before the
  real install.
- SKILL.md stays at about 150 lines; the details live in `references/handover.md` and `references/meeting-form.md`.
