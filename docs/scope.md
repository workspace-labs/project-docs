# Scope

## What it does

- Writes the documents a project needs **before anyone builds it**, in this order:
  0. *(Before the PRD, when meeting a client: a blank **client meeting form**, `docs/meeting-form.md`, to print
     and fill in over four meetings: the goal, today's work, the needs, approve the scope or stop. Not an
     approved document; its answers start the PRD.)*
  1. **PRD** (`docs/prd.md`): what it is, why, who it's for, who decides (owner, scope, prototype, acceptance,
     others), how the work runs today and with it, what it must do (each with a check), what it will NOT do, what
     comes later, assumptions and risks, how we know it worked, dates and budget.
  2. **TRD** (`docs/trd.md`): what it is built with (screen, brain, data storage, where it lives, outside services),
     its AI part when the product uses an AI model (what it may decide alone, what a person approves, what
     happens when it is wrong, how it is checked),
     what it costs to run and who pays (the person's amounts, never a price the AI supplies),
     the rules it must follow, how the code is written, and the reason for each choice.
  3. *(Offers the frameflow skill for the screens, once.)*
  4. **Design brief** (`DESIGN.md`): colors, fonts, shapes, pieces, must-have rules and ready values,
     picked by eye from a preview page.
  5. **Data** (`docs/data.md`): only when the project saves something. Sheets, columns, links, with
     personal and secret columns marked.
  6. **Security** (`docs/security.md`): always, short when simple. Who gets in, how it's protected (record owner checks, safe
     database queries, safe sign-in), secrets, personal data,
     outside services, work rules, and what to do if something goes wrong.
  7. **Handover** (`docs/handover.md`): only when it is handed to someone. What is handed over, who receives
     it, announcing it, the first weeks after go-live, running it (and who pays and renews from then on),
     maintenance and updates, retiring it.
  8. **Plan** (`docs/plan.md`): small steps you can see work, each with a check, then, when someone else
     decides, the fixed delivery steps: prototype, functional test, security test, acceptance test (UAT) on a
     test copy, guides and training, install, live test, go-live, handover.
- An optional closing handoff carries approved documents, current decisions, open choices and existing
  Plan checks to a separately authorized builder. Applicable engineering tasks/evidence belong in the
  current Plan; this adds no required document or approval round for unchanged decisions.
- **Asks first.** Click questions in small rounds of 2–3, then a read-back. It writes only after "yes, that's it".
- **Approval.** Every document is a draft until the person (or their client) approves it: then it is
  stamped **Approved** with the date and who approved it. Each change makes v2, v3.
- **Locks.** Choices in the TRD and DESIGN.md are locked once approved. Only the person changes them,
  and the old choice stays visible with a dated "Changed" line.
- **Resumes.** It reads what the project already has and continues from the first document that is not approved.
- **Old projects.** It reads the code, writes what it finds as "found in code", and asks only about the gaps.
- English by default; **Arabic** (right to left) when asked.
- Works with Claude Code, Claude in the browser, ChatGPT/Codex, GitHub Copilot and Cursor.

## What it will NOT do

- **Never picks the technology by itself.** It offers 2–3 options with its pick and the person clicks;
  "not sure yet" becomes TBD.
- No building of the project itself, and no code beyond the ready blocks inside DESIGN.md and data.md.
- No app flow drawing (that is frameflow's job) and no process workflow (that is workflow-project's job).
- No API guide up front: it only becomes a Plan step when the project has a back end.
- No ticking of plan steps as done: the AI marks a step "waiting for your check"; only the person ticks it.
- No installing anything on the person's computer, and no network calls (the preview page loads fonts
  online only when the person says yes to a font that is not bundled).
- No data collection, no accounts.
- No running the tests, the UAT, the install or the handover itself: the Plan names them as steps with
  checks, and only the person ticks a sign-off.
- No changing an existing DESIGN.md's look, or any locked choice, without the person's yes.

## How good it must be

- **Same shape everywhere.** Every document has fixed headings, so any AI on any computer writes it the same way.
- **Nothing to install.** Documents are plain markdown; the preview page opens in any browser, with its fonts inside.
- **Readable looks only.** The preview page checks text contrast and never shows a look that fails.
- **Private by default.** Personal and secret data are marked in data.md and collected in security.md.
- **Proven.** The preview page's checks and the example documents have automatic tests; the owner looks at
  every preview by eye.
