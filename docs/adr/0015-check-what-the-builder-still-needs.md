# 0015. Check what the builder still needs

- Status: Accepted (by the owner, 2026-11-25)
- Date: 2026-11-25

## Context

A solo project needs fewer discovery questions than a client project. A fixed client form can collect
common facts, while each project still has working rules that only its client can supply. A planning
document can be Approved with decisions still open, so the stamp alone cannot tell a builder when to start.

## Decision

- Ask whether the project is personal or for a client. Begin a personal project at the PRD. For a
  client project, ask for the project name and idea together, write the supplied words into the form,
  and recommend the first meeting in chat.
- Keep the same fixed questions for each client. Add a prefill for the client to confirm, a timeline
  with four milestones, sample records and account access. Refer to the builder's side as “our side.”
- Read the answers as a builder after each client meeting and all documents before Plan approval.
  Bring unresolved questions back to the people who can answer them.
- Have the client approver named in the PRD approve its scope and proposed success checks, and the
  Handover. The person can approve technical documents. A client fact comes from the client or stays open.
- Require Approved documents for the step, settled blocking choices, and the owner's word to build.
  Carry blockers forward to dependent steps. A made-up-data prototype can go first, including for a
  solo owner. The real build starts from approved documents.
- Reuse the personal or client answer. Keep the solo PRD and recovery questions short, apply the Design
  rules to the named devices, let Security record its own unresolved choices, name the decider in
  `Decided when`, include Security in blocker order, and recommend a choice when offering frameflow.

## Consequences

Early client conversations can start from their own words. Plan approval records the order and scope.
The owner still decides when to build, and a step with an open blocking decision still waits.
