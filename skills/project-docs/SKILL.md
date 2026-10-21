---
name: project-docs
description: "Use when someone wants the documents a project needs before it is built: a PRD (what and why), a TRD (what it is built with), a design brief or DESIGN.md (the look), a data or database map, a security page, or a step-by-step build plan. Also when asked to write, update, continue or approve any of them, or to 'plan this project properly before we build'. It asks first, reads back, and never picks the technology by itself. Not for drawing the screens (frameflow), a process workflow or swimlane (workflow-project), or building the project itself."
---

# project-docs

The documents a project needs **before anyone builds it**, written with the person in small rounds of
questions. Each document is read back, written with fixed headings, and approved with a date. After that,
every AI on every computer builds from the same truth.

## The documents, in this order

| # | Document | File | When | Read first |
|---|---|---|---|---|
| 1 | **PRD**: what we build and why | `docs/prd.md` | always | [references/prd.md](references/prd.md) |
| 2 | **TRD**: what it is built with | `docs/trd.md` | always, after an approved PRD | [references/trd.md](references/trd.md) |
| – | *Offer the app flow* | *(frameflow)* | when it has screens | see below |
| 3 | **Design brief**: the look | `DESIGN.md` (project root) | when it has screens | [references/design.md](references/design.md) |
| 4 | **Data**: what it saves | `docs/data.md` | only if it saves anything | [references/data.md](references/data.md) |
| 5 | **Security**: one page | `docs/security.md` | always (short when simple) | [references/security.md](references/security.md) |
| 6 | **Plan**: small steps | `docs/plan.md` | always, last | [references/plan.md](references/plan.md) |

Load **only** the reference file of the document you are writing. Each one holds that document's
questions and its exact headings.

## Start: where are we?

1. Read the project folder: `docs/`, `DESIGN.md`, `README.md`, and the code if there is any.
2. Read the **stamp** of each document that exists (see below). Continue from the **first document that is
   not approved**, or the one the person asks for.
3. A document that exists but has no stamp (the person wrote it before): read it, keep everything in it,
   ask only about what is missing under the fixed headings, then stamp it.
4. A project that already has code: write what you find and mark it `(found in code)`. Ask only about the
   gaps. Nothing found in code is approved until the person confirms it.
5. A project with a `docs/scope.md`: start the PRD from it. Once `docs/prd.md` exists it is the project's
   scope. Never delete `scope.md`: the person decides what to do with it.
6. **Language:** English by default. When the person asks for Arabic, write every document in Arabic, with
   the headings and fixed words from the **In Arabic** section of each reference file. File names, code
   names and `M1`, `M2`… stay as they are.

## The loop: every document, the same way

1. **Gather first.** Take everything the earlier documents already answer, and skip any question they
   already answer. Never ask twice.
2. **Ask at most 3 questions a round.** Give clickable choices when your tool has them (otherwise numbered
   choices), always with "Other: type your own". Put your recommended choice first and say why in one line.
   When there is nothing to build choices from yet (the very first "why"), ask openly instead. Each answer
   can open a sharper follow-up. If an answer is vague ("old phones", "fast") ask what it means; if it
   clashes with an earlier answer, say so and ask which wins. Never guess a fact the person did not give:
   ask, or write `TBD`. "You pick" or "your recommended one" is the person's choice: write it with its
   reason, adding "(on the AI's recommendation)".
3. **Read it back** in plain words, short, in the person's own terms. Write nothing until they say "yes,
   that's it". If they correct it, ask again and read it back again.
4. **Write the document** with the exact headings from its reference file, then show it.
5. **Approval.** Ask: "Approved, or changes?" The person, or their client, decides.
   - **Approved** → stamp it `Approved` with today's date.
   - **Changes** → a clear change: make exactly that, and also the lines that only exist because of the old
     value (a check that quotes the old number), saying so when you show it. A vague change, or one that
     adds something new or clashes with an earlier answer: ask about it first (same loop: questions,
     read-back), then change it.
     Either way, raise the version and show it again. As many rounds as needed.
6. Go on to the next document in the order. If an answer here needs an **approved** earlier document to
   change (a new outside service, a new column), say which one, and change it there the normal way
   (`Changed` line, new version, approved again).
7. **After the Plan is approved, close with a short summary:** the documents written, every open `TBD` with
   what will decide it (a `TBD` with a `Changed` line settling it underneath is closed, not open), and the
   first step to build. If a `TBD` blocks step 1, say so first.

## The stamp

The line right under each document's title is its stamp. Nothing else goes on that line:

```markdown
# PRD: Clinic Booking
> v1 · Draft
```

```markdown
# PRD: Clinic Booking
> v2 · Approved 2026-10-08
```

- In Arabic the stamp is `> الإصدار 1 · مسودة` or `> الإصدار 2 · معتمد 2026-10-08`.
- `v1` is the first version shown. Each round of changes after someone has seen it raises the version.
- A changed document is a `Draft` again until it is approved again; ordinary Plan execution progress is
  the exception (see its reference).
- The TRD, Data and the Plan build **only** on an approved PRD. If the PRD changes, say which later
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
blocked (each the way its reference says). **Reopening** a
choice keeps its history and adds `  - Changed <date>: <the choice> → TBD, because <reason>.`. If it already
has a canonical TBD line, keep that current history and its descriptive name. Otherwise keep the original
choice and Changed chain together in a labelled, collapsed historical `<details data-project-docs-history>`
record, then add one current top-level `- TBD: <what is open>. Decided when <…>.` line outside it (for
example, `the database`).
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
- **Never tick a plan step done.** You mark it waiting for the person's check; only the person ticks it.
- **Never install anything** and never make a network call. The one exception: the Design preview page
  may load a font online, and only when the person says yes to that font.
- **Never change an existing look or a locked choice** without the person's yes.
- **Touch only the project's documents.** The one exception: the TRD's pointer line in `AGENTS.md` or
  `CLAUDE.md`, and only on the person's yes.
- **Smart defaults, the person decides.** Always suggest the best way and say why. The person can always
  say "no, do it my way". Only real limits cannot be overruled, and you explain them plainly.

## Files

| File | What it is |
|---|---|
| `references/prd.md` … `references/plan.md` | one per document: its questions and its exact headings |
| `assets/preview/` | the Design preview page: shows 2 or 3 looks side by side, checks contrast, fonts inside |
| `examples/` | `cedar-clinic/`: all six documents for a website that saves personal data · `cedar-clinic-ar/`: the same in Arabic · `study-timer/`: a tiny terminal tool with no screens and nothing saved, so it has no DESIGN.md and no data document |
