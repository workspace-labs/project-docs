---
name: project-docs
description: "Use when someone wants a project's documents: a PRD (what and why), a TRD (what it is built with), a design brief or DESIGN.md (the look), a data or database map, a security page, a handover plan (who receives, runs and maintains it), or a step-by-step build plan with its tests, UAT and handover. Also a blank client meeting form for four stages before building (the goal, today's work, the needs, approve the scope or stop), with as many meetings as needed. After handover, keeps the maintenance record with visit dates, results and client requests. Also when asked to write, update, continue or approve any of the planning documents, to 'plan this project properly before we build', or 'where are we?' on a project that has docs/plan.md or docs/maintenance.md. It asks first, reads back, and never picks the technology by itself. Not for drawing the screens (frameflow), a process workflow or swimlane (workflow-project), or building the project itself."
---

# project-docs

Prepare the project documents from the first client meeting through the handover plan. Ask in small rounds,
read back the answers and record approval. After the project is handed over, keep its maintenance record.

## The documents, in this order

| # | Document | File | When | Read first |
|---|---|---|---|---|
| 1 | **PRD**: what we build and why | `docs/prd.md` | always | [references/prd.md](references/prd.md) |
| 2 | **TRD**: what it is built with | `docs/trd.md` | always, after an approved PRD | [references/trd.md](references/trd.md) |
| – | *Offer the app flow* | *(frameflow)* | when it has screens | see below |
| 3 | **Design brief**: the look | `DESIGN.md` (project root) | when it has screens | [references/design.md](references/design.md) |
| 4 | **Data**: what it saves | `docs/data.md` | only if it saves anything | [references/data.md](references/data.md) |
| 5 | **Security**: one page | `docs/security.md` | always (short when simple) | [references/security.md](references/security.md) |
| 6 | **Handover**: after it is built | `docs/handover.md` | when handed to someone, or for a solo owner's requested maintenance record | [references/handover.md](references/handover.md) |
| 7 | **Plan**: small steps, then delivery | `docs/plan.md` | always, last | [references/plan.md](references/plan.md) |

For a client project, make the **client meeting form** and its HTML page first. See [references/meeting-form.md](references/meeting-form.md)
for the four stages, the follow-up after each meeting, and the separate scope approval or stop meeting.

Load **only** the reference file of the document you are writing: its questions and its exact headings.

## Start: where are we?

1. If `docs/maintenance.md` exists, read its next dates first. Before anything else, report visits due soon or late
   and by how many calendar days. Due soon means today through the next seven days. Say nothing when neither visit is near.
2. For maintenance, a request after handover, or confirmation that handover took place, read [references/maintenance.md](references/maintenance.md).
   Otherwise, read `docs/`, `DESIGN.md`, `README.md` and existing code. For a new project with no documents, ask
   "Is it for a client, or for yourself?" Client → make `docs/meeting-form.md` and `docs/meeting-form.html` first.
   For yourself → go straight to the PRD. Follow the meeting reference for discovery and the PRD draft. Stage 4 **Stop** ends the work.
   Read each numbered document's **stamp** (see below). Continue from the **first document that is not approved**
   or the one the person asks for. The meeting form and the maintenance record have no stamp.
3. A document that exists but has no stamp (the person wrote it before): read it, keep everything in it,
   ask only about what is missing under the fixed headings, then stamp it. An **approved** document that
   lacks headings or fixed lines its reference now has (written by an older version of this skill: a PRD
   with no **Who decides** or no `Check:` lines, a TRD with no **Available** line), or that lacks an answer now
   needed inside a line it already has (a service receiving the client's or users' information with no keeps
   and trains answers; a model reading text the operator did not write with no limit on **Decides alone**):
   treat it as the first document that is not approved. Keep every line, its stamp history and its `Changed`
   lines; reuse what another document already answers; ask only for the missing parts, or write `TBD`. Never
   invent an approver, a check or an approval. Then raise the version, set it to `Draft`, and approve it the
   normal way, before writing anything that needs the new parts (the Handover, the delivery steps).
4. A project that already has code: write what you find and mark it `(found in code)`. Ask only about the
   gaps. Nothing found in code is approved until the person confirms it.
5. A project with a `docs/scope.md`: start the PRD from it. Once `docs/prd.md` exists it is the project's
   scope. Never delete `scope.md`: the person decides what to do with it.
6. **Language:** English by default. For Arabic, use the headings and fixed words from **In Arabic** in each
   reference. File names, code names and `M1`, `M2`… stay as they are.

## The loop: every document, the same way

1. **Gather first.** Take everything the earlier documents already answer, and skip any question they
   already answer. Never ask twice.
2. **Ask at most 3 questions a round.** Give clickable choices when your tool has them (otherwise numbered
   choices), always with "Other: type your own". Put your recommended choice first and say why in one line.
   When there is nothing to build choices from yet (the very first "why"), ask openly instead. Each answer
   can open a sharper follow-up. If an answer is vague ("old phones", "fast") ask what it means; if it
   clashes with an earlier answer, say so and ask which wins. Never guess a fact the person did not give:
   ask, or write `TBD`. "You pick" or "your recommended one" is the person's choice: write it with its
   reason, adding "(on the AI's recommendation)". A **fact about the client** (their languages, brand,
   systems, policies, who does what, or a "not decided") is never "you pick": ask, or write `TBD`.
3. **Read it back** in plain words, short, in the person's own terms. Write nothing until they say "yes,
   that's it". If they correct it, ask again and read it back again.
4. **Write the document** with the exact headings from its reference file, then show it.
5. **Approval.** Ask "Approved, or changes?" For a PRD started from a client meeting form, follow Stage 4
   instead. When **Who decides** names the scope approver, only that person can approve the PRD.
   - **Approved** → stamp it `Approved` with the date it was given and who gave it (see the stamp).
   - **Changes** → a clear change: make exactly that, and also the lines that only exist because of the old
     value (a check that quotes the old number), saying so when you show it. A vague change, or one that
     adds something new or clashes with an earlier answer: ask about it first (same loop: questions,
     read-back), then change it.
     Either way, raise the version and show it again. As many rounds as needed.
6. Go on to the next document in the order. If an answer here needs an **approved** earlier document to
   change (a new outside service, a new column), say which one, and change it there the normal way
   (`Changed` line, new version, approved again).
7. **After the Plan is approved,** make and open `docs/plan.html`, ask once about a PDF, and offer the agent
   instructions once (see [references/plan.md](references/plan.md)). Refresh the page after step changes
   and open it for "where are we?" Then **close with a short summary:** the documents written, every open `TBD` with
   what will decide it (a `TBD` with a `Changed` line settling it underneath is closed, not open), and the
   first step to build. If a `TBD` blocks step 1, say so first. For a builder handoff, read
   [references/engineering-handoff.md](references/engineering-handoff.md); this skill still writes documents only.

## The stamp

The line right under each document's title is its stamp, `> v1 · Draft` at first. Nothing else goes on it:

```markdown
# PRD: Clinic Booking
> v2 · Approved 2026-10-08 by the clinic manager
```

- `by <who>` names who approved, by name or job; leave it out only when the person approved their own project.
- In Arabic: `> الإصدار 1 · مسودة` or `> الإصدار 2 · معتمد 2026-10-08 من مدير العيادة`.
- `v1` is the first version shown. Each round of changes after someone has seen it raises the version.
- A changed document is a `Draft` again until it is approved again; ordinary Plan execution progress is
  the exception (see its reference).
- The TRD, Data, the Handover and the Plan build **only** on an approved PRD. If the PRD changes, say which later
  documents it affects and offer to update them.

## Locks: approved choices never vanish

The TRD's technology choices and DESIGN.md's look are **locked** once approved. Only the person changes
them. Never rewrite a locked line: keep it, and add the change under it:

```markdown
- Database: SQLite, because it is one file and works offline.
  - Changed 2026-11-02: SQLite → PostgreSQL, because several clinics now share one database.
```

Then raise the version and set the stamp back to `Draft` until it is approved again. Apply the same rule
to any approved line; Plan status lines and generated Data ready blocks preserve history as their
references say. A document that has **never been approved** has nothing locked yet: just edit it.

**Settling a `TBD` in an approved document is a change too:** keep the `TBD` line and add
`  - Changed <date>: TBD → <the choice>, because <reason>.` under it. Then update what waited for it: Data's
ready block once the database is chosen, the Security line that carried the `TBD`, and the Plan steps it
blocked (each the way its reference says). **Reopening** a choice keeps its history and adds
`  - Changed <date>: <the choice> → TBD, because <reason>.`. If it already has a canonical TBD line, keep
that current history and its descriptive name. Otherwise keep the original choice and Changed chain
together in a labelled, collapsed historical `<details data-project-docs-history>` record, then add one
current top-level `- TBD: <what is open>. Decided when <…>.` line outside it (for example, `the database`).
Ask for a missing decision trigger, or write `TBD` for it. Only the current history outside historical
records decides; its latest change wins. Dependent documents wait again; follow their references.

## Between the TRD and the Design: offer the app flow

If the project has screens (an app, a website, a desktop program), look in your list of available skills
for one named `frameflow`:

- **frameflow is installed** → offer once: "Do you want the app flow next, the screens a user sees and taps,
  drawn for your client to approve?" Yes → run frameflow, then come back to the Design. No → go on.
- **frameflow is not installed** → say once: "The frameflow skill can draw your screens as a storyboard:
  https://github.com/workspace-labs/frameflow". Then go on. Never install it, and never ask again.

No screens → skip the app flow **and** the Design brief, and go on to Data.

## Rules that never bend

- **Never pick the technology yourself.** In the TRD, the person chooses. When they are unsure, show 2 or 3
  options with plain pros, cons and what will be easy or hard to maintain later, recommend one, and let them
  click. "Not sure yet" is written as `TBD`.
- **Only the person checks off a Plan step or maintenance visit.** Record it as waiting for their check when it is ready.
- **Never install anything** and never make a network call. The one exception: the Design preview page
  may load a font online, and only when the person says yes to that font.
- **Never change an existing look or a locked choice** without the person's yes.
- **Touch only the project's documents.** The exceptions are the Plan's marked block in `AGENTS.md` or
  `CLAUDE.md` and the `@AGENTS.md` import in `CLAUDE.md`, each only on a yes to that file.
- **Smart defaults, the person decides.** Always suggest the best way and say why. The person can always
  say "no, do it my way". Only real limits cannot be overruled, and you explain them plainly.

## The three-step chain

For a whole project, never a small fix: **1. project-docs** (nothing is built before the client approves),
**2. software-engineering-build-standard** (builds only from the approved documents and the plan),
**3. checkflow** (nothing is deployed or handed over before its check is clean). When the documents are
approved, name step 2. If a skill in the chain is not installed, say so and ask how to continue.

## Files

| File | What it is |
|---|---|
| `references/prd.md` … `references/plan.md` | one per document: its questions and its exact headings |
| `references/meeting-form.md` | the client meeting form, its four stages and how its answers start the PRD |
| `assets/preview/` | the Design preview page: shows 2 or 3 looks side by side, checks contrast, fonts inside |
| `scripts/plan-page.js` | makes `docs/plan.html` from `docs/plan.md`: the plan as a board whose cards open (Node.js, no packages); `scripts/markdown-blocks.js` reads the plan's Markdown for it |
| `scripts/meeting-page.js` | makes the printable, editable `docs/meeting-form.html` from `docs/meeting-form.md` (Node.js, no packages) |
| `examples/` | `cedar-clinic/`: a filled meeting form, its HTML page, seven documents and a maintenance record · `cedar-clinic-ar/`: the documents and record in Arabic · `study-timer/`: a small personal project · `notes-digest/`: a terminal tool with an AI part |
