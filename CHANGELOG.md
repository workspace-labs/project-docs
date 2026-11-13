# Changelog

All notable changes to this project. The version is the one named in `README.md`.

## [0.4.0] - 2026-11-13

Built in parallel with the published 0.3.0 and 0.3.1 and merged onto them; its decision records are
0008 and 0009.

### Added

- **A blank client meeting form** (`references/meeting-form.md` → `docs/meeting-form.md`), English and
  Arabic: the project, who is involved, the users, what it must do, questions for the later stages (data,
  where it must run, links, sign-in, security, prototype, testing, handover, running it, announcing it) and
  signatures. It is printed and filled in the room; afterwards its answers start the PRD as drafts, so the
  client is never asked twice. It has no stamp: the PRD is still approved on its own.
- **PRD → Who decides:** five fixed lines (owner, approves the scope, approves the prototype, accepts it
  (UAT), others to involve), or one `Owner: <who>, alone.` line for a project built for oneself. Also
  **Later** (wanted, not in this version) and **Dates** (what must be ready by when).
- **The stamp says who approved:** `> v2 · Approved 2026-10-08 by the clinic manager`. When Who decides
  names a scope approver, the PRD is approved only on their word, with the date they gave.
- **A seventh document, Handover** (`docs/handover.md`), for a project handed to someone: what is handed
  over (and who owns the code), who receives it, announcing it, the first weeks after go-live, running it,
  maintenance and updates, retiring it.
- **Plan → delivery steps:** when someone else decides, the plan carries fixed steps with fixed names:
  Prototype (right after step 1 when there are screens, or step 1 itself on made-up data when step 1 waits
  for the database), then after the building steps Functional test, Security test, Acceptance test (UAT) on
  a test copy the testers can reach, Guides and training, Install, Live test, Go-live and Handover. A
  delivery step may carry a **Target** date. Only the person ticks them.
- The Cedar Clinic examples carry all of it in English and Arabic, plus a filled meeting form; the study
  timer shows the "alone" case. 13 new tests (123): the new headings, the delivery steps' order, a missing,
  swapped, doubled or misplaced step caught, the approver in every stamp of a handed-over project, and the
  meeting form's shape in both languages.

### Changed (before release): four meetings, not one

- Research into how large organisations work before they build (government digital manuals, published
  consultancy methods, the requirements standards) found no fixed meeting count but one shared order, and
  that deciding in the room where needs are first heard is the commonest mistake. The meeting form is now
  **four meetings**: the goal (dates, whether they are fixed, budget, who only needs to be told, one contact
  each side); the people and today's work (users with numbers at the busiest time, today's steps, what
  goes wrong; notes signed); the needs and the new way (the steps with it, each must-do with how it is
  checked, later-stage questions now including old records, availability, speed, accessibility, policy,
  training and retiring it; assumptions and risks); and approve the scope, or stop. Stopping is a valid
  result. ADR 0009.
- **PRD:** new headings **How it works today**, **How it will work**, **Assumptions and risks**; **Dates**
  becomes **Dates and budget**; each `M` line carries a `Check:` line (`الفحص:` in Arabic) that the
  acceptance test tries. Questions in four rounds of at most three.
- **TRD → Rules it must follow:** **Available** (the client's hours, and what happens when it is down; never
  a default) and **Accessibility** (a default unless the client says more). **Data** asks about old records.
- Examples and tests follow: the clinic form is filled over four meetings; 3 new tests (126) check a check
  under every must-do line, and the form's four-meeting shape in both languages.
- Codex review round 1 (two findings, fixed): the TRD no longer says an open data storage blocks
  everything: it blocks the steps that save, and the Prototype on made-up data still goes first (F01).
  An **approved** document from an older version that lacks today's headings or fixed lines is treated as
  not approved yet: every line and its history kept, only the gaps asked, no approver, check or approval
  invented, then approved again the normal way (F02). 2 new tests (128), with the real approved 0.2.2
  clinic PRD, TRD and Plan kept as fixtures in `tests/fixtures/approved-0.2.2/`.

### Fixed

- A blind dry run (a car park for a city department, run from the meeting form to the closing summary)
  listed 36 places the wording made it guess. Settled in the wording: a fact about the client (languages,
  brand, systems, policies, who does what, a "not decided") is never "you pick"; with a filled meeting
  form the read-back is the confirmation; an answer given under another question is marked `(see …)`;
  open questions become `TBD`s where they belong; the form asks about devices, users, languages, brand and
  how long data is kept; a PDF or Word copy is made only on a yes; step 1 is the path the client wants to
  try first; a step waiting for several `TBD`s names the first in document order; the Handover step waits
  for the Handover's open `TBD`s; outside services include the client's own network; sign-in with the
  client's own work accounts follows the client's rules; a column the client named counts when a line uses
  it; a general "you pick" is not a yes to writing `AGENTS.md`.

## [0.3.1] - 2026-11-11

### Changed

- Filled conditional coverage gaps inside the four existing TRD, Data, Security and Plan references,
  without changing the six-document order, fixed headings, approval process or preview.
- Outside services describe expected replies and failure behavior; sheet proposals describe required
  and unique fields plus personal-record removal. Readable examples and ready SQL stay coordinated.
- Security records short threat scenarios tied to protections or Plan checks, verified encrypted
  connections and minimal audit records where another person's protected records are accessed.
  Audit identities remain personal data, with visibility and retention rules and no copied secrets
  or unnecessary personal content. Offline tools keep their None lines.
- Existing Plan checks conditionally cover restoration/read-back, README instructions, release and
  rollback, and an owner-supplied notice before personal data is collected. No legal policy is drafted.
- English and Arabic clinic examples follow the same rules. The small timer still has neither a
  Design nor a Data document. Package consistency checks and behavioral exercise contracts cover
  the additions; their execution scope is recorded in TESTING.md.

## [0.3.0] - 2026-11-05

### Added

- An optional, source-reachable engineering handoff in English and Arabic: approved documents,
  current decisions/history, PRD IDs, Plan checks, blockers and human-owned checked status pass to a
  separately authorized builder without a duplicate document or reapproval of unchanged choices.
- Three package-integrity tests for the reference graph, including missing and out-of-package links,
  and separate contracts for isolated real-agent behavior exercises.

### Changed

- Existing Plan fields can carry applicable engineering tasks and expected evidence, tied to approved
  TRD/Data/Security rules. The fixed headings, three fields, approval and TBD history rules are preserved.
- The TRD reuses already stated platforms, distribution, capabilities and explicit assurance needs in
  its existing headings without a mandatory new questionnaire or guessed legal/conformance claims.
- `project-docs` remains document-only. Execution proof belongs to the builder/reviewer; a requested
  assurance target or proposed check is never reported as achieved.

### Verification

- Baseline `node --test`: 110/110 passed; candidate: 113/113 passed on macOS 27.2, Node.js 22.14.0.
- Preview assets and existing examples are unchanged. Five coordinated synthetic exercise outcomes
  passed independent artifact review; 29 retained fixture test methods reran successfully. One raw
  documentation-hash grader false positive is retained and explained in TESTING.md.
- No new browser, Windows, Arabic live workflow, automatic-selection, real-release or conformance
  result is claimed. The optional general YAML validator could not start without PyYAML.
- The owner accepted both candidates; all six installed paths match the accepted manifests,
  Claude aliases and recovery copies are preserved, and installed snapshots passed static re-audit.

## [0.2.6] - 2026-11-04

### Changed

- Decision records 0004–0007 are **Accepted**, on the owner's word of 2026-11-04. Their decisions are
  unchanged; only their status lines and the index in `docs/adr/README.md` changed.

### Verification

- Documentation only: no skill file, test or example changed, and `node --test` was not rerun.

## [0.2.5] - 2026-11-04

### Added

- Four decision records for rules already in the shipped skill, so the reason for each lives in the
  repository and not only in the changelog and test record. All four are **Proposed** until the owner
  accepts them:
  - `0004`: approved choices keep their history (`Changed` lines, settling and reopening a TBD, history
    records, settled plan waits).
  - `0005`: a waiting plan step names the open choice by its exact words (finding F02).
  - `0006`: the AI never picks the technology.
  - `0007`: the Security page's "How it's protected" lines are written, not asked.
- `docs/adr/README.md` lists them.

### Verification

- Documentation only: no skill file, test or example changed, and `node --test` was not rerun.

## [0.2.4] - 2026-11-04

### Added

- `.gitattributes`: every text file is stored and checked out with LF on every computer, and fonts and
  pictures are binary. Every text file in the repository was already LF, so no file changed. This closes
  the line-endings item in `docs/risks-and-debt.md`; the CRLF test runs stay, so a CRLF copy still works.
- A **Project map** in `README.md`: where the skill, tests, tools, documentation and pictures live.
  `docs/architecture/overview.md` lists `.gitattributes`.

### Verification

- `git add --renormalize .` changed no file. Documentation and repository settings only: the tests read
  only `skills/project-docs/`, and `node --test` was not rerun for this version.

## [0.2.3] - 2026-11-04

### Added

- The repository documents the agent engineering standard makes due, so a stranger holding only the
  repository can find how it is built, shipped and kept safe:
  - `docs/architecture/overview.md`: a map of the repository and how the agent, skill, references,
    preview page and tests talk to each other.
  - `docs/architecture/boundaries.md`: one home for each thing, and the rules at the boundaries.
  - `docs/adr/README.md`: an index of the three decision records.
  - `docs/operations/release.md`: the release steps used so far and a rollback plan. The tag and
    GitHub release steps are Proposed and wait for the owner's yes.
  - `docs/security.md`: what each part runs and touches, the one consented Google Fonts request, how the
    preview protects itself. Where to report a problem privately is a TBD.
  - `docs/risks-and-debt.md`: the unverified areas, known debt and deliberate limits as of 0.2.2.
- No skill file, test or example changed.

### Verification

- Documentation only. The tests read only `skills/project-docs/`, so the 110-test result of 0.2.2 is
  unaffected; `node --test` was not rerun for this version.

## [0.2.2] - 2026-10-21

### Fixed

- A fresh agent carried a made-up project through all six documents and listed every place the
  instructions made it guess. The wording now settles each of them: the PRD's first round proposes
  drafts when a `scope.md` or README exists; a clear change also reaches the lines that quote the old
  value; smart defaults carry "(on the AI's recommendation)"; devices go into the Speed line; a confirmed
  "found in code" choice has its reason; only the screen and the data storage block step 1, while an open
  hosting blocks the step that goes online; settling a TBD also updates the Security line that carried
  it, and a settled TBD counts as closed in the closing summary; Security quotes a TBD and never opens
  one; the lock-out answer has its place; Data says who sees which column and asks what happens to
  linked rows when a parent is removed; DESIGN.md writes both heading sizes in one cell and drops
  `--font-arabic` unless Arabic is shown; the agent says when it has not seen the preview itself; the
  API guide is a step of its own; the two-person try also covers "only one role sees it".
- A plan step whose wait was settled now records it as a fixed `Changed` line under its check
  (`waited for <what> → not started`), so the `⛔ waits for TBD:` words appear only on a Status line and a
  settled step can never be read as still waiting. A test guards the line in both languages and catches
  the old shape (110 tests).
- All six licence files follow one name, `<Font>-OFL.txt`: `OFL-PlusJakartaSans.txt` and
  `OFL-NotoNaskhArabic.txt` were renamed in the preview and in both clinic examples.

### Verification

- 110 automated tests pass on macOS with Node.js 20; both example previews report `ready` in native
  WebKit and in Chrome 155 at computer and phone width. See `TESTING.md`.

## [0.2.1] - 2026-10-19

### Fixed

- A stalled preview font now ends in a clear refusal after ten seconds; a late result cannot make it
  ready. Font checks cover the two action labels the preview actually draws, so an unused third label
  cannot falsely reject an otherwise valid look. Colors, layout, consent and contrast thresholds stay the same.
- A missing Data document no longer means the project saves nothing. Security-only work uses confirmed
  project facts, asks about missing details or keeps a TBD. Record checks honor the approved owner,
  staff and public permissions. Online-font consent describes stylesheet and font-file downloads accurately.
- The English and Arabic clinic staff models and ready SQL now include the stable Microsoft account ID
  required by Security, marked personal and included in both inventories. Changed example Data/Security
  documents return to Draft; the repair does not invent a fresh approval.

### Verification

- 109 automated tests pass on macOS with Node.js 20.20.2, including five new regression tests and the
  existing LF/CRLF runs. Six repaired-preview cases behave as expected in native WebKit; the normal
  English/Arabic desktop/phone screenshots are byte-identical to the baseline. See `TESTING.md` for scope
  and remaining platform/workflow limits.

## [0.2.0] - 2026-10-19

### Added

- The Security page has a new **How it's protected** section with three lines a builder must follow:
  **Records** (every request checks the signed-in person owns the record; a hard-to-guess ID is not
  protection), **Database** (placeholders, never typed text glued into a query) and **Sign-in** (tries
  limited; "Sign in with …" checks the provider's signed answer and knows the person by the provider's
  account ID, not their email). They are written from the answers, never asked. A line that does not
  apply says **None:** (Arabic `لا ينطبق:`).
- All three examples carry the section, and a new test checks each line says None exactly when it does
  not apply (104 tests). Windows was last verified on 0.1.2; this change adds no code to the preview.

## [0.1.2] - 2026-10-09

### Added

- Ten real-browser Google Fonts checks in Chrome and Edge: successful Merriweather loading at desktop
  and phone widths, refusal without consent, and refusal when the stylesheet or font download is blocked.
- `TESTING.md` now separates the 32 completed browser checks from remaining Firefox and real-user
  validation. The earlier Codex continuation and agent simulations are distinguished from a complete
  interactive project run. No skill code changed.

## [0.1.1] - 2026-10-09

Windows testing and portability fixes. No changes to the preview's visual design or contrast thresholds.

### Fixed

- Document checks accept both LF and Windows CRLF line endings. A default Windows Git checkout previously
  failed 43 of the 94 tests; full document checks now run against both styles in isolated copies.
- Bundled fonts declare their real character coverage, so mixed-language text cannot silently use a
  fallback font while the preview reports ready. A builder helper regenerates and verifies the coverage
  from the shipped font files.
- Reopening an approved choice as TBD has a named decision record, preserves superseded ready code as
  history, and distinguishes completed progress from future steps blocked by the revised choice.

### Added

- Tested PowerShell commands for manual installation and making the upload ZIP.
- Windows validation on Node.js 24, and offline Chrome and Edge preview checks in English and Arabic at
  desktop and phone widths. `TESTING.md` records the 101-test result, all 22 browser cases, fixes,
  verified 59-file ZIP, exact environment and remaining limits.

## [0.1.0] - 2026-10-08

The first version, built from the owner's decisions of 2026-10-08. Codex approved it after seven review
rounds. Not yet tried by a fresh user or on Windows.

### Added

- `TESTING.md`: how it was tested (94 tests, 38 planted bugs caught, two blind dry runs, seven review rounds
  with all 9 findings and their fixes) and what has not been tried yet. The README links to it.
- The picture at the top of the README (`media/project-docs-hero.png`).
- The repository: scope, three decision records (one skill with a file per document; the documents live in
  `docs/` and the PRD is the scope; an HTML preview page shows the looks), and the
  workflow.
- `SKILL.md`: the order of the six documents, the shared loop (at most 3 questions a round, read-back,
  "Approved, or changes?"), the stamp (`> v2 · Approved 2026-10-08`), locks with dated `Changed` lines,
  resuming from the first document that is not approved, the frameflow offer, and a closing summary.
- One reference file per document, each with its questions and exact headings: PRD, TRD (work rules
  first, the AI never picks, honest TBDs, the pointer line), Design, Data (personal and secret columns
  marked), Security (one page, always) and Plan (only the person ticks a step done).
- The Design preview page: 2 or 3 looks side by side with the project's own words, eight contrast checks,
  six free fonts inside, right to left for Arabic, and `node check.js looks.js` for agents without a browser.
- Arabic: an "In Arabic" section in every reference file, and the preview right to left.
- Examples: a clinic booking website (in English and in Arabic) and a tiny terminal timer.
- Builder's checks: 94 tests (`node --test`) that hold every example to its template and the documents to
  each other, and run the preview page's own scripts in a stand-in for a browser; and `tools/shot-mac.sh`
  to look at the preview on a Mac.
- Two blind dry runs with a made-up user; every problem they found was fixed.
