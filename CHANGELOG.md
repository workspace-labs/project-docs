# Changelog

All notable changes to this project. The version is the one named in `README.md`.

## [0.11.0] - 2026-11-21

### Removed

- **The reader page** added in 0.10.0: `scripts/read-page.js`, `references/read-page.md`, its fonts in
  `assets/read/`, the examples' `docs/read.html`, its tests and its WebKit check tool, and step 8 in
  `SKILL.md`. The page carried the owner's own design, and the skill is public, so every user's page would
  have looked like his. The skill again writes the documents and the plan page only. ADR 0012 is marked
  deprecated. Projects that already made a `docs/read.html` with 0.10.0 can delete it; nothing reads it.
  `AGENTS.md`, `CREDITS.md`, `README.md` and `SKILL.md` are back to their 0.9.1 text, apart from the version.

### Verification

`node --test` passed 222/222 with zero skips, the same suite as 0.9.1.

## [0.10.0] - 2026-11-21

### Added

- **The reader page.** `scripts/read-page.js` makes `docs/read.html` from all of a project's documents, so
  the person reads a calm page instead of raw Markdown: an Overview (counts, the plan step in hand, every
  document with its stamp, every open `TBD`, the plan's progress), then each document as panes. Label
  lines become tiles, `TBD` lines are marked as open questions, `Check:` and `Changed` lines sit under
  their line, tables keep a colour square beside each hex colour, and plan steps fold to one line each,
  with the step waiting for the person's check open. Every word of each of the seven planning documents
  is in its own view, in order (the client meeting form is not on the page). Open questions follow their
  latest `Changed` line, step states come from the plan page's own reader, and "approved" only from a
  real stamp. It writes only to an `.html` file it made itself, never over a document or a link.
  English and Arabic (right to left); works with JavaScript off, with a visible keyboard focus ring;
  fonts inside the file, nothing loaded from the network; **WorkSpace Labs** at the bottom. The look is
  the owner's Pearl design.
- **Phone reader layout.** At 820 px and below, the Overview puts its title and counts above a
  full-width document list, followed by open questions, the current step and plan progress. Each row
  opens its document at the top and shows an open count when there are open questions. **‹ Overview**
  returns to the Overview. The desktop tiles use the same in-page links. Links and disclosure
  summaries show a visible focus ring during keyboard navigation.
- `references/read-page.md`, a step 8 in `SKILL.md` (and the generated pages named as an exception to
  "touch only the project's documents"), the Newsreader and Outfit fonts with their licences in
  `assets/read/`, a `docs/read.html` for each example, and `tests/read-page.test.js` (74 reader tests,
  296 tests in all). `tools/check-read-page-webkit.js` checks scrolling, keyboard focus and layout
  with JavaScript disabled.

## [0.9.1] - 2026-11-20

### Fixed

- `docs/operations/release.md` no longer calls tagging and the GitHub release "Proposed". Both were
  first done for 0.9.0 and are now part of every release, on the owner's word. Rolling back now points
  to the previous version's tag and release zip; versions before 0.9.0 still roll back to the commit
  before the release commit. Documentation only: the skill folder is unchanged.

Verification: `node --test` passed 222/222 on macOS arm64 with Node.js 20.20.2, zero skips.

## [0.9.0] - 2026-11-20

### Added

- The TRD records the agreed timing conditions for a flow where waiting matters. The Plan measures
  it in the first step that makes the flow usable and records pass or fail.
- For actions charged by use, the TRD records the cost through completion, including charged failures
  and retries. The per-action amount and any ceiling stay separate from the monthly total.
- For releases beyond the builder's computer, the TRD records who decides to go back, the signal, and
  the agreed route if the previous release cannot read newly saved data. The Plan rehearses that
  route on a safe copy.

These additions use the existing English and Arabic TRD and Plan sections and apply only where needed.
Verification on macOS with Node.js 22.14.0 passed all 222 tests with zero skips. See [TESTING.md](TESTING.md).

## [0.8.0] - 2026-11-19

The owner wanted to see the plan before anything is built, and later to ask "where are we?" and see the
answer, without the cost of redrawing a PDF after every step.

### Added

- **The plan page, `docs/plan.html`:** the plan as a board with four columns (Done · Waiting for your check
  · Next · Waiting for a decision), a progress ring, and a **You are here** bar on the first step not yet
  checked. Every card opens to that step's plan, what was built and the person's decisions, with the
  previous and next step one tap away. One self-contained file: no network, and its cards open without
  JavaScript, so it also works in a phone's file preview. Arabic plans give an Arabic page, right to left.
- **`scripts/plan-page.js`** makes the page from `docs/plan.md` (Node.js 18 or newer, no packages), with
  `scripts/markdown-blocks.js` beside it, which reads the plan's Markdown. Without Node.js, or in a chat that
  cannot run commands, the skill says so and the plan stays in `docs/plan.md`.
- **When the page is made:** after the Plan is approved and before anything is built, it is made and opened
  without asking; the person is asked once whether they want a PDF (a printed copy of that day, made once).
  After every change to a step the script runs again. "Where are we?" runs it, opens the page and answers in
  one line.
- **Two optional step lines,** added while the work goes on: `- **Built:**` (what was really made, written
  in the same edit as the waiting status) and `- **Your note:** <date> — <words>` (only the person's own
  words). Arabic: `ما بُني` and `ملاحظتك`. The clinic examples show both, in English and Arabic.
- **What a card shows of a step's history.** A changed check keeps its first wording readable and shows
  each change under it: what the check is now, the part it replaced and why; the newest of several is marked
  Latest and the card says "Check changed". A settled wait ("waited for X → not started") written under
  **How we know it works** appears under Your decisions as status history. Changes written under other
  fields appear in a neutral box under The plan with the field name. For Target, the exact label is
  `Changed 2026-11-19 · Target · recorded as written` or
  `تغيّرت في 2026-11-19 · الموعد المستهدف · كما كُتب`. This visible markup was introduced in the previous
  candidate and also applies to settled-wait wording outside the check in this round. A change whose
  meaning is unclear also appears in a neutral box. A built step with no Built line says that none was recorded.
- **Keyboard and phone.** Focus moves into the open card and stays there (Tab, Shift+Tab); the arrows change
  step; Page Down, the arrow keys, Home and End scroll a long card; Esc or × gives focus back to the card
  that opened it. The board behind an open card is locked, so a tap on the dimmed background closes the card
  on a scrolled page too.
- Every example carries its generated `plan.html`.
- `tools/blocks-vs-pandoc.js`, a builder's tool that compares the script's reading of generated texts with
  Pandoc's, and `tests/fixtures/markdown-blocks/pandoc-sample.json`, a sample recorded from it.
- ADR 0010 (accepted): the plan is shown as a generated HTML board. ADR 0011 (accepted): the plan page
  reads Markdown as CommonMark does, or refuses.

### How the script reads the plan

- **Through its Markdown structure, the way CommonMark reads it.** `scripts/markdown-blocks.js` follows the
  block phase of the CommonMark reference parser. A step, a field or a change shown as an example inside a
  code block or raw HTML is not counted, and a real step is never hidden by one. The steps are the level-3
  headings of the one `## Steps` section, which ends at the next level-1 or level-2 heading; a step's fields
  are its list items that begin with `**Label:**`, and a field's text may run over lines.
- **What it would have to guess, it refuses, naming the line:** a code fence, or an HTML comment, `<pre>`,
  `<script>`, `<style>` or `<textarea>` block, that is never closed or is cut off by the end of its list item
  or quote; a text line with `===` or `---` under it (a heading in Markdown, which could end the steps); and
  forms that Markdown versions and tools read differently: a `<source>` or `<search>` tag starting a line, a
  closing `</pre>` (or the like) alone on a line, a comment written `<!-->`, a `<!…>` declaration in small
  letters, an HTML tag alone on the line right after quoted or list text, a link-definition label whose
  closing bracket immediately precedes a colon, and a bare carriage return as a line end. Bracketed
  prose can contain a later link-definition lookalike and still be read as a paragraph.
- **A plan it would show wrongly, it refuses, naming the step:** a `###` heading that is not a step; steps
  out of order or numbered twice; an empty check; two Status (or other field) lines; a Status that is not
  exactly one of the four forms of the plan's language, or runs over two lines, or carries an impossible
  date; a recognizable change entry without a real `YYYY-MM-DD` date in Western digits, or written in
  the other language. This includes dates written in words or with Arabic-Indic digits.
- **Malformed change labels.** The CLI names the step when a recognizable change entry uses a different
  capitalization of `Changed`, puts `*` or `_` emphasis around the label, or writes `تغير في` without the
  shadda in `تغيّر في`. The entry must use the template spelling. Prose such as “Changed my mind after
  the call.” remains readable.
- **A change entry is split only where its sentence is certain.** "→" and "because" count only at the top
  level of the sentence: outside quotes, brackets and code marks, whose words belong to the thing named. An
  entry is split into old, new and reason when there is exactly one transition and one reason marker there.
  Status history requires one top-level transition before the reason. Multiple unquoted separators leave a
  wait ambiguous, even with a quoted target or a reason that follows the template. Quote a wait name that
  contains `→` or Arabic «إلى» to keep it as status history. A mark that cannot be paired with certainty
  or a reason whose start is unclear leaves the entry neutral.
- A file saved with a byte order mark, with CRLF line ends, or with Arabic letters in their decomposed form
  reads the same as without.

### Changed

- **The Plan read-back** is now told as the story of the build: each building step on its own line, what
  is built and what the person will see; delivery steps may share a line. The question stays "Right order?
  Anything missing, too big or not needed?"
- SKILL.md step 7 names the plan page; the description also answers "where are we?". The builder handoff
  says the builder writes the Built line with the waiting status, then runs the script again. The Plan
  reference says where a `Changed` line must sit to count as a change to the check.
- README and AGENTS.md say plainly where Node.js is needed: for the tests and to make or refresh the plan
  page; never to write or read the documents. The architecture pages name the two scripts and what each owns;
  the security page, the risks page and the release steps cover the plan page.

### Verification

- macOS, 2026-11-19. All 218 tests passed on Node.js 18.20.8, 20.20.0, 20.20.2, 22.14.0, 22.23.1
  and 24.22.1. Node.js 26.13.1 passed 217 tests and reproduced the existing design-preview failure.
  The change-label regression test failed on the saved round-10 parser and passed on round 11.
- Pandoc 3.12.1 reported zero differences in the round-11 5,000-text run (seed 662071). The suite replayed
  the 367-text sample recorded in round 10. Earlier comparisons are in TESTING.md.
- All four example pages regenerated byte-identically. Chrome and WebKit passed 16 desktop and phone-width
  example checks in round 11. Round 10 also checked both Target labels. All four examples were printed to
  PDF in Chrome, and their print styles were checked in WebKit. The ZIP contains 75 byte-matched files.
- Windows, a physical iPhone and a live agent using the updated rules remain unverified for this candidate.

## [0.7.1] - 2026-11-16

0.7.0 shipped the AI part with no example of a product that uses AI. This release adds one.

### Added

- **A fourth example, `notes-digest/`:** a small terminal tool for one team lead that turns a file of
  meeting notes into a short summary and an action list, using a hosted language model whose name and
  provider are made up for the example (Quill 2, from Harborline). It has four
  documents (PRD, TRD, Security, Plan) and, like the Study Timer, no screens, nothing saved and nobody to
  hand it to. It shows:
  - the AI part with its five lines answered, the Model line pointing at the model's Outside services
    line instead of repeating what is sent;
  - the model as a paid part charged by use, with a made-up amount and its source, in the Running cost;
  - a PRD line that tells the user the digest was written by AI;
  - the Plan trying the service failure, running the kept examples and trying a wrong answer in the step
    that first connects and builds the AI, and comparing every kept output again in the step that
    changes its instructions;
  - a Security line and a Plan step for notes that try to steer the model.
- The skill's Files table and the README name the new example.

### Changed

- Nothing in the references. No heading, fixed line or rule changed.

### Verification

- macOS, 2026-11-16: `node --test`, 166 tests pass (145 before: one new test for the example, and the
  twenty checks every example gets). The new test also removes each of the five AI lines, the amount's
  source and the model from the total, and each is refused. It refuses a model that is described but
  not named, an AI check placed in a later step than the one that first needs it, and a rerun that
  compares only part of the kept outputs. The cost check now adds up each currency by itself. `node tools/font-ranges.js --check` passes.
  The preview page is unchanged and was not rerun.

## [0.7.0] - 2026-11-16

More and more projects have an AI model inside them. The TRD listed AI only as one more outside service,
so nothing asked the questions a client must answer before such a product is built: how far the AI may
go without a person, and what happens when it is wrong.

### Added

- **TRD → AI part** (Arabic: `جزء الذكاء الاصطناعي`), a new heading after Outside services and before
  Running cost. It is about an AI model the product itself uses, never the AI tool that builds the
  project. A product with no AI has one line there: `None: it uses no AI`. A product that uses AI has
  five lines:
  - **Model:** which model and where it runs. A technology choice like any other: the person picks.
    For a model reached over the internet, what is sent to it stays on its Outside services line and
    is not repeated.
  - **Decides alone** and **A person approves:** how far the AI may go without a person, asked for each
    PRD `M` line the AI takes part in. Never a default and never "you pick".
  - **When it is wrong:** how a wrong answer is noticed, who corrects it, what the user is told.
  - **Checked by:** the examples it must get right, who keeps them, and when they are run again. An
    accuracy figure is written only when the person gave it, with where it came from.
- **An open choice in the AI part** is a `TBD` in that line's place. It blocks only the steps that build
  or use the AI part.
- **Plan → conditional checks** gain one: when an AI model is used, the step that first builds it runs the
  Checked by examples, any later step that changes the model or its instructions runs them again, and
  the step that lets it act alone tries what When it is wrong says.
- **Running cost** names an AI model charged by use among the paid parts.
- The three examples carry the heading with `None`. The Study Timer TRD shows the upgrade again, with the
  earlier approval kept in a `Changed` line beneath the new line.

### Not added, on purpose

- No example project that uses AI. The filled form is shown only as a made-up case in the tests.
- No new line in the Security document. What an outside model receives is already named there through
  Outside services.

### Upgrading

- A TRD approved before 0.7.0 has no AI part heading. As with any newer heading, the skill keeps
  everything, asks only whether the product uses AI, and the TRD is approved again.
- This release adds one heading to the TRD's heading contract. Older TRDs do not have it.

### Verification

- macOS, 2026-11-16: `node --test`, 145 tests pass (142 before, plus three for the AI part; the upgrade
  test gained three wrong-upgrade cases). The first test checks the template, the three examples, the
  rule sentences and four details point for point in both languages, the Plan check's place, and a
  made-up help desk product in eight wrong forms, each refused. The second reads the AI part through its
  history, in English and in Arabic: a bare TBD, a line written twice and a model added under an old
  "no AI" are refused; an open choice, a settled one, a reopened one and an archived historical record
  are accepted. The third walks every state the part can be in today: "no AI", undecided (one named open
  choice), or five lines. An answer or a "no AI" reopened with a bare "→ TBD" is none of these and is
  refused until it is reopened the skill's way, with the old record collapsed and a named TBD in its
  place. "Nothing" as the answer of one authority line, which the template offers and which in Arabic
  begins with the same two words as "None", is an answer and not "no AI".
  All three check shape and history, never whether the answers are the client's.
  `node tools/font-ranges.js --check` passes. The preview page is unchanged and was not rerun.

## [0.6.0] - 2026-11-16

A project is paid for twice: once to build it, and then every month to keep it running. The PRD asked
for the build budget; nothing asked what it costs to run, or who pays that after the handover.

### Added

- **TRD → Running cost** (Arabic: `تكلفة التشغيل`), a new heading after Outside services: one line for each
  part somebody pays for, then a fixed **Each month** line (`كل شهر`) with the total and who pays.
  The amounts are the person's, with where each came from. The AI never supplies a price, and who pays
  is a fact about the client, never "you pick". Nothing paid is `None: nothing is paid for`, with the
  reason.
- **Owned or still paid for.** A part bought once and owned has no bill and no amount. A bill the client
  already pays (an existing subscription, a yearly renewal) is still a running cost: it carries its
  amount and source and stays in the total. A bill that also covers other work is written whole, never
  as a share the AI worked out. A yearly bill stays yearly, never divided into months. The Each month
  line adds up only the amounts above it and names every part it does not count.
- **An open price** is a `TBD` named `the cost of <the part>`. It blocks only the step that starts
  paying for it. A price that depends on a choice still open stays with that choice: no second `TBD`.
- **Handover → Running it** gains a line: who pays the running cost and renews the paid parts from the
  handover on. It is gathered from the TRD and never asked twice.
- The three examples carry the new lines. The clinic's TRD shows an owned server, an existing monthly
  subscription, a yearly web address and a price still tied to an open choice; its amounts are made up.
  The clinic's Handover shows the upgrade of an approved
  document: it had been approved without the line, so it is now `v2 · Draft` with the earlier approval
  kept in a `Changed` line beneath the new line. The Study Timer TRD does the same for its Each month line.

### Upgrading

- A TRD approved before 0.6.0 has no Running cost heading and no Each month line. As with any newer
  heading or fixed line, the skill keeps everything, asks only for what is missing, and the TRD is
  approved again. A Handover approved earlier is not treated as incomplete: its new line is asked the
  next time that Handover is opened for a change.
- This release adds one heading to the TRD's heading contract. Older TRDs do not have it.

### Verification

- macOS, 2026-11-16: `node --test`, 142 tests pass (140 before, plus two for these lines; the upgrade
  test gained three wrong-upgrade cases). The second test adds up the amounts in each Running cost
  section and refuses an amount with no source or cadence, a subscription left out of the total, a
  yearly bill divided into months and a total nobody gave. It checks shape and sums; it cannot know
  whether an amount is true. Changed copies were tried and each fails the suite: an
  example without its Each month line (English and Arabic), a second TBD opened for a price, a Handover
  that keeps or invents an approval, a dropped or invented history line, the open-price rule made to
  block every step, the AI allowed to supply a price, and a template without the heading or the
  Handover pointer. `node tools/font-ranges.js --check` passes. The preview page is unchanged and was
  not rerun.

## [0.5.0] - 2026-11-16

From an outside review of a finished document set, which listed eight things as missing. Six were
already there or half there; this release adds the gaps as lines inside the existing documents, with no
new document type.

### Added

- **TRD → How the code is written → Kept in:** where the code and its history are kept, and where the
  second copy is (Arabic: `مكان الكود`). It is the person's answer, never the AI's default; an open
  choice is a `TBD` that blocks only the step that releases or hands over the project.
- **Plan → the release check** now also asks for a version and a dated line in `CHANGELOG.md` for each
  release, saying what changed for the people who use it, with its code in the place the TRD names.
- **Plan → the README check** now covers setting the project up again on another computer, not only
  another person: the how-to goes from an empty computer to running, and is tried that way.
- The three examples carry the Kept in line; the clinic's release step covers it and carries the
  changelog line. The Study Timer TRD shows the upgrade: it had been approved without the line, so it is
  now `v2 · Draft` with the earlier approval kept in a `Changed` line beneath the new line.

### Not added, on purpose

- No separate decision log: each choice already keeps its reason and its dated `Changed` lines in the
  document that owns it (decision record 0004).

### Upgrading

- A TRD approved before 0.5.0 has no Kept in line. As with any newer fixed line, the skill keeps
  everything, asks only for that line, and the TRD is approved again.

### Verification

- macOS, 2026-11-16: `node --test`, 140 tests pass (137 before, plus three for these lines). They fail
  when an example loses its Kept in line, when the changelog sentence leaves the release check for
  another step, when an open code location is made to block every building step, and when an upgraded
  TRD keeps or invents an approval. `node tools/font-ranges.js --check` passes. The preview page is
  unchanged and was not rerun.

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
