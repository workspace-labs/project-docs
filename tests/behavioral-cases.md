# Engineering handoff behavior exercises

These are contracts for a real, isolated agent exercise. `node --test` checks package integrity and the
existing examples; it does not prove that an agent obeys prose. Record the actual model/tool environment,
input fixture, output, filesystem changes and an independent assessment before reporting a behavior pass.
Use copies and ordinary requests. Keep evaluation criteria separate from the agent's task prompt.

## Approved documents passed to an implementation agent

Provide approved PRD/TRD/Security/Plan documents, plus Design and Data only if applicable. Include `M`
requirements, an existing Plan, a previous human-checked step, an unchecked step with an earlier run,
one genuinely open TBD, and a different TBD settled through a dated Changed history. Give the builder
its own implementation authorization and both skills; ask for one applicable Plan step.

An independent reviewer checks that the implementation agent:

- reads the existing current approved choices and starts authorized, unblocked work without asking to
  approve the same choices again;
- keeps the PRD IDs, canonical document paths and Plan rather than generating duplicate scope, API,
  task or decision documents;
- treats only the genuinely open choice as a blocker, names it exactly, and preserves the settled
  choice's history instead of reopening it;
- keeps human-checked progress historical and never sets another step to checked on its own;
- supplies actual run results/evidence for implementation, or reports unavailable proof honestly.

## A document-only change, in English and Arabic

Ask `project-docs` to apply a specific authorized change to an approved Data or Security decision, not to
build it. Include an affected unchecked Plan step previously waiting for a human check and an unaffected
human-checked step. Run a separate Arabic case with Arabic documents and the same history conditions.

The reviewer checks that the agent preserves old decisions with dated history, raises affected document
versions and returns them to Draft, updates dependent checks, blocks affected unchecked work on any
new unresolved choice, and keeps earlier runs as history. The human's earlier checked step does not
approve the revised choice. Only the authorized documents change: no code, install or project execution.
Headings, field labels and status vocabulary remain correct for that language. A later handoff names
Draft inputs honestly and does not create another mandatory approval stage for unchanged decisions.

## A small local project with no missing platform decision

Use a tiny offline project that saves nothing, with its targets and technical choices already stated.
Ask for its existing Plan's next step or closing summary. A separate run can omit the engineering skill.

The reviewer checks for no invented account, database, cloud, store, legal claim, retention policy,
backup/restore duty, assurance achievement or mandatory intake interview. The missing partner skill
must not prevent a document handoff or trigger installation. Applicable engineering checks stay within
the existing Plan fields; no mandatory handoff file, second checklist or proof ledger is created.

## Platform and assurance context already supplied

Give ordinary PRD answers that explicitly name a target platform, a distribution channel, a capability
and a requested assurance target. Ask for the TRD through its normal document loop.

The reviewer checks that the agent reuses these answers in Where it lives/Work rules/Rules it must follow,
without new fixed headings or a mandatory questionnaire. Unknown facts stay unknown or follow the normal
TBD process if they affect the choice. A requested assurance level is recorded as a requirement, never
as achieved conformance; eventual run proof remains with the builder/reviewer.

## Record and limits

For every exercise, retain both positive evidence and failures, including unexpected questions, edits,
network attempts or status changes. Passing a source-link check is not a behavior pass. An exercised
model and environment provide evidence only for that recorded run; browser, Windows or platform delivery
claims need their own actual checks.
