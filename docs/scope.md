# Scope

## What it does

- Writes the planning documents a project needs **before anyone builds it**, in this order, and keeps
  its maintenance record after handover:
  0. *(For a client project, ask for the name and idea together, and carry the supplied words into the
     **client meeting form** in `docs/meeting-form.md` and the printable, editable `docs/meeting-form.html`.
     Recommend how to begin the first meeting. Four stages take as many meetings as needed. After each
     meeting, carry unresolved answers and questions a builder would still have to guess into **Still open**.
     The person decides when its answers are ready for a draft PRD. Stage 4 is a separate scope decision
     after that draft. Personal projects start directly with the PRD questions.)*
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
  7. **Handover** (`docs/handover.md`): for a project handed to someone, or for a solo owner who asks for
     a maintenance record and agrees to write a Handover first. It records what is handed over, who receives
     it, announcing it, the first weeks after go-live, running it (and who pays and renews from then on),
     the agreed light and full visit schedule, the deadline for serious security fixes, who receives
     the visit results, and retiring it.
  8. **Plan** (`docs/plan.md`): small steps you can see work, each with a check, then, when someone else
     decides, the fixed delivery steps: prototype, functional test, security test, acceptance test (UAT) on a
     test copy, guides and training, install, live test, go-live, handover. A solo owner can start with a
     disposable screen prototype when the first real step waits on a choice the prototype can do without.
- **Maintenance record** (`docs/maintenance.md`) starts at handover or at a first maintenance request
  once the Handover is approved. For a personal project, create it only on request. It keeps upcoming visit
  dates, reported results and requests, without a stamp or an approval round. The approved Handover
  keeps the rule. When the project opens, the skill reports visits due soon or late before other work
  and gives the person the next visit date for their calendar. It uses the approved PRD to sort requests.
- After Plan approval, offers the agent instructions once. With permission for each file, writes the marked
  block to `AGENTS.md` or `CLAUDE.md`, and adds `@AGENTS.md` to `CLAUDE.md` when the placement calls for it.
- An optional closing handoff carries approved documents, current decisions, open choices and existing
  Plan checks to a separately authorized builder. Applicable engineering tasks/evidence belong in the
  current Plan; this adds no required document or approval round for unchanged decisions.
- **Asks first.** For planning documents, ask click questions in small rounds of 2–3 and read the answers
  back. Write the draft after "yes, that's it".
- **Approval.** The client approver named in **Who decides** approves the PRD, proposed success checks
  and Handover. The person can approve technical documents, with client facts supplied by the client
  or recorded as `TBD`. Each **Approved** stamp gives the date and approver, and changes raise the version.
- **Builder check.** Before Plan approval, show which missing answers were settled, which go on the
  next client form, and which are recorded as a `TBD`. A builder starts a step only with the owner's word
  to build, Approved documents for the step, and no blocking `TBD`.
- **Locks.** Choices in the TRD and DESIGN.md are locked once approved. Only the person changes them,
  and the old choice stays visible with a dated "Changed" line.
- **Resumes.** It checks any maintenance dates first, then reads what the project already has and
  continues planning from the first document that is not approved.
- **Old projects.** It reads the code, writes what it finds as "found in code", and asks only about the gaps.
  For a development, it confirms how the project works today, checks the health of its code, and
  records the person's decisions on gaps and findings before planning the change. The plan checks
  what must keep working before and after the change.
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
- No running a maintenance visit's checks. Record the results from whoever ran them.
- No marking a maintenance visit checked. Only the person marks it checked.
- No changing an existing DESIGN.md's look, or any locked choice, without the person's yes.

## How good it must be

- **Same shape everywhere.** Every document has fixed headings, so any AI on any computer writes it the same way.
- **Nothing to install.** Documents are plain markdown; the preview page opens in any browser, with its fonts inside.
  The meeting and plan pages are made by scripts that need Node.js 18 or newer. The Markdown works on its
  own, and the skill never installs Node.js.
- **Readable looks only.** The preview page checks text contrast and never shows a look that fails.
- **Private by default.** Personal and secret data are marked in data.md and collected in security.md.
- **Proven.** The preview page's checks and the example documents have automatic tests; the owner looks at
  every preview by eye.
