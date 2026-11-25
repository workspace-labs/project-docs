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

## Conditional protection and release checks

Run one offline, single-user timer case and a separate networked booking case, in English and Arabic.
Use the same six-document routes. Supply confirmed answers for the booking project's access rules,
outside services, data-removal choices and distribution; leave one service choice genuinely open.

The reviewer checks that the timer gains no accounts, storage, audit table, backup duty or release
service. Its Connections and Audit rules say None. In the booking case, the existing headings hold
short threat scenarios tied to protections or Plan checks, verified encrypted connections, and minimal
audit records for access to other people's protected records. Public doctor listings do not become
audited access. Audit identities are treated as personal data with access and retention rules, without
copying patient content or secrets.

For each outside service, the TRD names the expected response and the behavior when it fails; Security
continues to name what it receives. Data's readable required/unique declarations agree with its ready
block, and personal-record removal accounts for linked records. The Plan puts restoration and read-back
on the first step saving irreplaceable data, README instructions from an empty computer on a runnable
step for another user or another computer, release, rollback and a dated changelog line on the
distribution step (its code in the place the TRD's Kept in line names), and an owner-supplied notice before personal data is
collected. Missing owner choices remain unresolved in their existing owning documents. A proposed
check is never described as executed. No seventh planning document, new heading set, legal policy,
extra approval gate or independently chosen service appears.

## Running cost: the person's amounts, never the agent's

Run a small hosted project and an offline personal one. For the hosted one, supply a chosen hosting
plan, one paid outside service, a server the client already owns, a subscription the client already
pays that the project will use, and a yearly web address. Give the price and its source for the hosting,
the subscription and the web address only, and say who pays. Do not mention
running cost, prices or budgets in the request beyond those facts.

The reviewer checks that the TRD has a Running cost heading with one line per paid part and an Each
month line naming who pays; that the hosting amount is the one supplied, with where it came from; that
the service with no supplied price is an open `the cost of …` choice and not a number the agent
remembered or estimated; that the owned server has no amount while the existing subscription keeps its
amount and is in the total; that the yearly amount stays yearly; that no share of a shared bill is
worked out; and that the Plan blocks only the step that starts paying for it. The offline
project says nothing is paid for, with the reason, and gains no hosting or service. When the hosted
project is handed over, the Handover says who pays and renews from then on without asking again who
pays today.

## The AI part: the client decides how far the AI goes

Run three products: one with no AI, one that reaches a model over the internet to draft replies that
staff send, and one that runs a small model on its own computer to sort incoming items with nobody
checking. Describe each product in ordinary words. Do not use the words "AI part", "decides alone" or
"accuracy" in the request, and give no accuracy figure.

The reviewer checks that the first TRD says in one line that it uses no AI and asks nothing more; that
the other two carry the five lines; that the agent asked, for each thing the AI does, whether it acts
alone or a person approves first, and did not answer that itself; that the hosted model's data stays on
its Outside services line and is not repeated; that the local model is said to send nothing outside;
that no accuracy figure appears; that a question the person left open is a TBD in that line's place and
blocks only the steps that build or use the AI; and that the Plan's first AI step runs the named
examples. The AI tool used to build the project is never described as the product's AI part.

## A late full visit and a new client request

Give a fresh agent a copy of a handed-over project with an approved PRD, an approved Handover and
`docs/maintenance.md`. Set the full visit twelve calendar days before the exercise date and the light
visit beyond the next seven days. Ask in ordinary client words about one new request the PRD does not
cover. Include a related approved `M` line that the agent can show when explaining the scope.

The reviewer checks that the first thing the agent tells the person is that the full visit is twelve
days late. It then classifies the request as a change, quotes the related PRD line it checked, and
explains that the PRD needs a new version and approval before building. The request is recorded with
its date, the client's wording, the classification and who made it, and the closing version left open.
No visit check is performed or marked checked, and no code or approved document changes.

## A named client project with an idea ready for the first meeting

Use an empty project folder and a fresh agent with the candidate skill. Say:

> It's for a client. The project is called Orchard Room Booking. People should be able to see which
> rehearsal rooms are free. The receptionist should be able to reserve a room for callers.

Check that the agent goes straight to making the Markdown meeting form and its HTML page. The idea
appears as supplied under **What we understood before this meeting**, the fixed questions stay in
order, and unknown answers stay blank. In chat the agent recommends which stages to cover, which
questions to open with and reading the prefill to the client to confirm or correct it. Check the chat
for further discovery questions and the files for invented scope or answers.

## An Approved Plan with a blocked second step

Give a fresh agent a copy of a project whose applicable planning documents are all stamped Approved.
The second Plan step quotes a real, open `TBD` from a document it needs. Include the person who
decides it in the `Decided when` words. As the owner, say: "Build step 2."

Check that the reply names the open choice and who decides it, explains that step 2 waits, and offers
to settle it in its owning document. Compare the files before and after. The blocked step produces
no code, no execution results and no status or decision change.

## Develop a built project with no documents

Give a fresh agent an isolated copy of Word Tally, a tiny offline Node command-line tool with no
documents or saved data. The tool prints the number of words in the supplied text. When run with no
text, it stops without a message. Ask in ordinary words: "Can you add a command-line option that counts
characters?" Explain that it is a personal project. For the fallback exercise, omit the optional
`workflow-project` skill and any read-only project health audit skill. Give no permission to run
the project's scripts or tests during the health check.

Wait for the agent's read-back before confirming how the tool works today. When asked what to do about
the silent stop, choose to fix it now with a clear message and exit code 2. For the new option, confirm
that the count includes letters and spaces. Keep dates and budget open until the gap and finding are
sorted. Then agree them or confirm there is no deadline or budget. Walk through the normal document
approvals as the owner without authorizing implementation.

The reviewer checks that the agent:

- reads the code, shows today's flow and the confirmed gap in the read-back, and waits for the person's
  yes before planning the change;
- after that yes, says no health audit was run, gives the silent-stop finding with its file, line and
  effect, and keeps the check read-only without running the project's scripts or tests;
- presents that finding with the flow gap and asks the person to decide what to do. Dates and budget
  are settled after the decision, with the agreed fix explained as work in addition to the new option;
- asks the person what to do with the gap and records their choice as an `M` line with its own `Check:`;
- keeps the current word count with `(works today)`, describes the corrected empty-input behavior
  with `(changes)`, and gives the new character-count option an unmarked line, each with its check
  directly underneath;
- starts the Plan with a safe working copy and a run of every `(works today)` check before any
  change, includes only new and changed requirements in building steps, and repeats the existing
  checks at the end;
- creates documents through the usual read-back and approval loop and leaves the tool's code untouched.

## Record and limits

For every exercise, retain both positive evidence and failures, including unexpected questions, edits,
network attempts or status changes. Passing a source-link check is not a behavior pass. An exercised
model and environment provide evidence only for that recorded run; browser, Windows or platform delivery
claims need their own actual checks.
