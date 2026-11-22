# 0013. Client discovery runs in four stages

- Status: Accepted
- Date: 2026-11-22
- Decided by: the owner ("approve", 2026-11-22)
- Replaces: the fixed meeting count in [ADR 0009](0009-understanding-a-client-project-takes-four-meetings.md)

## Context

The same questions can take one sitting or several. A fixed count can push a developer to draft the
scope while key answers are still missing or disputed. A printable form still matters when the developer
meets the client away from a computer. An HTML entry page also supports typing and saving Arabic answers.

## Decision

- A new client project starts with a Markdown form and an offline HTML page. A personal project starts
  with the PRD.
- Keep the goal, current work, needs and scope decision in order. Allow as many meetings per stage as
  needed. Stage 4 has its own meeting after the PRD draft.
- After each meeting, record what was answered and surface missing and conflicting answers. Carry only
  open questions to the next meeting. The person confirms which items block the work and decides when
  the answers are clear enough to draft the PRD. Carry deferred decisions as named `TBD` items.

## Consequences

- The form retains the meeting history and current open questions. People can print and sign it or save
  an answers file from the generated page. Signatures stay on paper.
- The page keeps typing locally when browser storage is available. The Markdown form can still be used
  on its own, including when Node.js is unavailable.
- The scope approver approves, asks for changes or stops the project in Stage 4. Signing notes confirms
  the record of what was said. The existing PRD approval and change rules still apply.
