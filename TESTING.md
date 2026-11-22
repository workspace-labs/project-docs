# How project-docs was tested

**Last verified 2026-11-22 · version 0.14.1.** All 257 automated tests passed on macOS arm64 with Node.js
18.20.8 and 20.20.2, with zero skips.

## 0.14.1 — New README picture and accepted decision

- **Automated checks.** `node --test` passed 257/257 with zero skips on Node.js 20.20.2.
- **Unchanged.** The skill folder is identical to 0.14.0, so its browser and print results carry over.

## 0.14.0 — The form comes first for client projects

- **Automated checks.** The baseline at `0577954` passed 230/230. The updated suite covers the bilingual
  form shape, page modes, local storage and blocked storage, safe Markdown downloads, output refusal rules,
  the exact Plan instructions and the 173-line skill limit. The static skill audit reported zero findings.
- **Real browsers.** Chrome 157.0.8103.80 and WebKit 27.2 ran locally at 1280 and 390 px. Tested the filled
  English Cedar page and English and Arabic pages generated from the blank templates, including an Arabic
  open-question form. Each run checked keyboard focus, typing, the close warning, reload recovery, the
  downloaded Markdown, and Clear. Both engines also saved successfully with browser storage blocked.
- **A4 print.** Printed the same four cases from both widths in Chromium and in native macOS WebKit. Typed
  notes, writing space and signature grids appeared in both engines. In the Arabic full form in native
  WebKit, the Section 6 title lands at the end of page 4 and the first answer field starts page 5.
- **Not run.** A full live discovery and approval cycle, physical phones, and Windows. The optional
  Python skill validator requires PyYAML, which was unavailable. Ruby parsed the YAML frontmatter and the
  static skill audit checked the packaged skill.

### Review 1 corrections

- Chrome and WebKit both reproduced the shared draft between two same-name forms on the reviewed build.
  On the corrected build the second client opened empty and the first client's typing survived reload.
  Reusing the same file path for a different client also opened an empty draft. Old drafts with the
  shared storage key are not imported.
- Both browsers saved the same literal answer text, including contact details, Markdown punctuation,
  HTML-like text, whitespace and Arabic. Pandoc in CommonMark and GFM modes read the answer verbatim and
  produced only the intended headings.
- A single answer and an empty Still open table reported 50 blanks. A fully answered fixture showed the
  all-clear. Native WebKit printed A4 discovery and Stage 4 sheets in English and Arabic with only the
  relevant labelled signature grid on each.
- A real exFAT image reproduced the old link failure. The corrected generator created a page, replaced its
  own marked output and refused a foreign file without changing it. A regression test also places a
  foreign file at the destination during first write and verifies that its bytes are preserved.
- The 0.13.0 Cedar form generated after following the upgrade guide. The Markdown retained every answer
  and moved all four recorded meetings. A documentation test checks the old Stop rule and the Plan
  file placement rules for both agents.

### Review 2 corrections

- Cedar's existing later requirement with no check now shows the all-clear. In English and Arabic,
  a missing check on a now requirement still adds one blank to the count.
- Chrome and WebKit reproduced the encoded email in the question heading. The corrected downloads were
  byte-identical. CommonMark and GFM preserved question text, table context and answers as literal text,
  including email, URLs, Markdown punctuation, HTML-like text and Arabic. In both browsers, the second
  client's form still opened empty and the first client's draft returned after reload.
- Eight native WebKit A4 prints covered fully signed, partly signed, unsigned and Section 10 sheets in
  English and Arabic. Signed notes kept their recorded names, signatures and dates. The Section 10
  sheets printed blank scope signature grids.

## 0.13.0 — Three-step chain for whole projects

- **Automated checks.** `node --test` passed 230/230 with zero skips. `node tools/font-ranges.js --check` passed.
- **Upload zip.** 94 files under one `project-docs/` root, with no tests, PDFs or `.DS_Store` files.
- **NOT RUN.** Real agent behavior on a whole project and Windows.

## 0.12.1 — Clearer Arabic wording

- **Environment.** macOS arm64 with Node.js 20.20.2.
- **Automated checks.** `node --test` passed 230/230 with zero skips. The tests now require the new wording
  and refuse the old wording in the Arabic Data, TRD and Plan references.
- **Not run.** A real agent's authoring cycle, the preview and the Pandoc comparison: only Arabic reference
  text changed. No independent review was run for this wording patch.

## 0.12.0 — Three decisions a person must make

- **Automated checks.** `node --test` passed 230/230 with zero skips, up from 222. The eight new tests are in
  `tests/human-decisions.test.js`. One traces a step through two open decisions, in either order and both
  languages, through the real plan-page reader. Undoing the review fixes in a throwaway copy made the tests fail.
- **Independent review.** Codex approved the change on 2026-11-21 after four review rounds.
- **Upload zip.** 75 files under one `project-docs/` root, with no tests, PDFs or `.DS_Store` files.
- **Not run.** A real agent's full authoring and approval cycle with the changed questions, a visual look at
  the preview, and the standalone Pandoc comparison. `assets/preview/` and `scripts/` are unchanged.

## 0.11.0 — The reader page removed

- **Automated checks.** `node --test` passed 222/222 with zero skips: the 0.9.1 suite, after the reader
  page's 74 tests left with it. `node tools/font-ranges.js --check` passed. No file outside the removal
  changed; `AGENTS.md`, `CREDITS.md`, `README.md` (apart from the version) and `SKILL.md` match 0.9.1.
- **Not rerun.** The preview, plan-page and Pandoc checks: their files are unchanged since 0.9.1.

## 0.10.0 — The reader page (removed in 0.11.0)

### Release, 2026-11-21

- Claude's independent review of rounds 4, 5 and 6 (Codex the builder) ended APPROVED. The owner tried
  the page on his own iPhone, opened from Files, and approved it. ADR 0012 accepted on his word.
- At release: `node --test` 296/296 (Node 20.20.2), `node tools/font-ranges.js --check` passed,
  `git diff --check` clean. The upload zip has one `project-docs/` root and 85 files, the same count as
  the source folder, with no test files, PDFs or `.DS_Store`. `plan-page.js` and `markdown-blocks.js`
  are unchanged, so the plan-page and Pandoc checks of 0.8.0/0.9.0 stand.

### Round 6, reader focus and open counts (R01, R02)

- **Automated checks.** The two Round 6 assertions both failed on the incoming script
  (`5f9fd9f4d82c63df92c2971bda7069ff192e5761`) and both passed after the fix. R01 checks the
  generated focus rules for articles, links and summaries. R02 checks all four examples for zero
  open counts in English and Arabic. The reader suite passed 74/74. The full `node --test` suite
  passed 296/296 on Node.js 18.20.8, 20.20.2 and 22.23.1, with zero skips.
- **R01 in WebKit.** With JavaScript disabled, clicks, taps and Enter moved focus to the target
  article. Its article and header had no outline. Option+Tab still showed the 2 px ring on desktop
  tiles, document and question links, **Open the plan**, **‹ Overview** and a Plan disclosure summary.
  The 1280 px TRD click screenshot pair differed only around the header, where the old outline was
  removed. `tools/check-read-page-webkit.js` saves `after-click-trd-1280.png` while the TRD article
  still has focus.
- **R02 in WebKit.** Positive counts were visible, and the 320 px check found them below their stamp
  chips. The 390 px Cedar TRD test measured 400 → 0 px on both rounds. All 44 document taps reached
  0 px at 320 and 390 px. The Overview links returned to the top, the 16 question links and Plan
  disclosures worked, and the page stayed within the viewport.
- **Desktop and examples.** All 52 pairs of resting screenshots at 821 and 1280 px matched the
  Round 5 baseline byte for byte. Regenerated all four examples, and `git diff --check` passed.
  To reproduce the comparison, pass a copy of the Round 5 example tree as the argument to
  `node tools/check-read-page-webkit.js`.
- **Not run.** Physical iPhone and Files, screen-reader speech, Safari as an app, other browser
  engines and print. The physical Files check belongs to the owner.

### Round 5, phone layout

- **Automated checks.** `node --test` passed 294/294 on each of Node.js 18.20.8, 20.20.2 and 22.23.1.
  The reader suite passed 72/72 on 20.20.2. The three new structure tests cover the default Overview,
  the localized return link on each view, and the document and question rows, their order and targets.
  All three failed against the incoming reader. Updated switching tests cover the focusable fragment
  targets and keep the checks for offline operation and escaping document text.
- **Scroll regression.** With WebKit 26.5 (build 2370), JavaScript disabled and local files at 390 × 640 px,
  scroll the English Cedar Overview to 400 px and tap the visible part of the TRD row. The radio-based
  reader stayed at 400 px. The fragment link landed at 0 px. At 320 and 390 px, all 44 document-row taps
  across the four examples landed at 0 px from starting positions of 242–737 px.
- **Phone checks.** Each example returned to the Overview from every view. All 16 open-question taps
  and each **Open the plan** link reached the matching document. Plan disclosures opened and closed.
  The document and body matched the viewport width in every view. A range check caught text
  crossing into the neighboring row column at 320 px in the first build. It passed after the stamp
  and count were stacked at 360 px and below.
- **Keyboard and desktop.** In this WebKit configuration, Option+Tab reached links when plain Tab
  skipped them. Enter moved visible focus to the title of the opened document or Overview. All 52
  pairs of full-page screenshots matched at 821 and 1280 px across all four examples with focus cleared.
  WebKit can also outline the focused heading after mouse or touch activation.
- **Examples and skill.** Regenerated all four example pages. The reader's document bodies and footer
  matched the incoming output after accounting for the return links and heading IDs. The skill
  validator passed and the static audit reported zero findings. `git diff --check` passed.
- **Reproduce the browser checks** with an existing Playwright module and WebKit browser.
  `node tools/check-read-page-webkit.js` runs the local-file checks and saves screenshots.
  Set `PLAYWRIGHT_MODULE` and `WEBKIT_EXECUTABLE` to use existing custom paths.
  Pass the directory containing a copy of the incoming example tree to compare desktop screenshots and
  replay the old scroll behavior. The automation reads scroll and layout from WebKit with page JavaScript
  disabled.
- **Not run.** The owner's physical iPhone and its Files preview, Safari as an app, other browser
  engines, print, Windows and Pandoc. Only the owner can check this build on his iPhone in Files.

### Round 4, after the third independent review (F01–F06, F08, F09, F13)

- **Automated checks.** Each Node.js version passed 291/291. The reader suite passed 69/69 on Node.js
  20.20.2. The 23 tests named `round 4` cover these cases:
  - F01 preserves every byte of an empty output file and a foreign HTML file that quotes the generator marker.
  - F02 keeps nested decisions independent and quoted examples in their own scope. An empty target is
    refused at its line. Quoted old values can include English and Arabic separators.
  - F03 excludes checked archived steps from the Overview count and waiting archived steps from its
    current-step card. Live Plan headings keep their badges.
  - F04 reads the approval stamp below a multiline setext title in English and Arabic.
  - F05 keeps literal greater-than signs in quoted fences, including fences in a list in an existing quote.
  - F06 keeps each history record in one disclosure, including a closing tag in a fence or comment and a
    record nested in a quoted list. An unmatched opener leaves later sections visible.
  - F08 keeps a list starting at 7 in an existing quote with space or tab indentation.
  - F09 keeps quoted H1, H2 and H3 at distinct, consecutive ranks.
  - F13 distinguishes project, output and source errors and reports whether a prior reader is available.
- **Old-fails proof.** The same 23 tests failed on the saved round-3 script and passed on the round-4
  script with `node --test --test-name-pattern='round 4' tests/read-page.test.js`. The baseline ran
  in a scratch copy with the same test file, helper scripts and fonts.
- **Examples.** Regenerated Cedar Clinic, Cedar Clinic Arabic, Study Timer and Notes Digest with the CLI.
  All four outputs matched the pre-edit files byte for byte and passed the up-to-date tests.
- **Browser.** WebKit 26.5 (Playwright build 2370) passed at 320, 390 and 1280 px in English and Arabic,
  offline with JavaScript disabled. Touch, mouse and keyboard switched views. The 2 px focus ring
  stayed visible after Option+Tab and arrow keys, the phone grid fit, and Plan and code disclosures
  opened and closed. The page and body stayed within the viewport in every view and both disclosure
  states. Embedded fonts loaded with zero HTTP requests. The Pearl CSS, fonts and WorkSpace Labs footer
  matched the baseline, as did all 12 browser screenshots.
- **Not run.** Physical devices, the Safari app, other browsers, Windows, print, the Pandoc comparison
  and a live agent following step 8.

### Round 3, after the second independent review (F01–F09, F11, F13–F15)

- **Automated checks.** `node --test` passed 268/268 with zero skips. `tests/read-page.test.js` now has
  46 tests. The new cases:
  - F01: a linked docs folder, a linked folder inside the project, and a hard link to the PRD are
    refused, with nothing written; the page is now opened once without following a link, and checked on
    that open file before it is written.
  - F02: the settled Notes Digest price is drawn "Settled"; an arrow to TBD in a reason does not reopen;
    a change one level deeper counts; a change under an open question written another way is refused
    with its line.
  - F03: a badge goes to the step with the same number and title.
  - F04: v0, الإصدار 0, a stamp after a blank line, and one split over two lines are not approved.
  - F05: code and HTML on a list item's own line lose only the container marks.
  - F06: a record on an item's line, a closing tag inside code, and text right after the record.
  - F07: short rows padded; extra cells kept, under an empty header.
  - F08: a nested marker on its parent's line.
  - F09: H5 and H6 distinct; a comment above the title.
  - F11 and F15: phone tiles wrap in rows; no cut-off card text.
  - F13 and F14: the wording in SKILL.md and the reference.
- **Old-fails proof.** The round-3 tests for F01–F09 fail on the round-2 script.
- **Deliberate breaks.** Sixteen breaks of the round-3 script, each in a throwaway copy, each fail the
  tests. One ("the reason read as the new value") was missed at first; a case with "because" twice in the
  reason was added.
- **Looked at.** Headless Chrome: the Arabic Overview at 600 px (tiles in two rows) and the Notes Digest
  Overview at 1440 px (the whole step text on the card).
- **Not run.** WebKit, keyboard focus in a real browser (the ring now uses `:focus`, which WebKit keeps
  after arrows switch the radio), a physical iPhone, Windows, print, Node.js other than 20.20.2, a live
  agent following step 8.

### Round 2, after the first independent review (F01–F14)

- **Automated checks.** `node --test` passed 259/259 with zero skips. `tests/read-page.test.js` now has
  37 tests. Each review finding has a test that asserts exact placement, cells, counts, states or file
  contents: no output over a document, a link or a foreign file, and the docs folder made (F01); settled
  and reopened questions in English and Arabic, nested ones too, and the Notes Digest price settled (F02);
  states from the plan page's reader, a broken plan showing none, and no fold outside the plan (F03); only
  a real stamp counts (F04); a fence inside an item, a heading and list inside a quote, and text after a
  child item, all in order (F05); one disclosure for a history record with blank lines (F06); escaped
  pipes, dash-only rows and pipe prose (F07); list starts and boundaries (F08); each view's full title and
  heading levels (F09); an underlined Arabic title (F10); a focus ring per view (F11); 4.5:1 for the small
  text colours (F12); the meeting form left out (F14). The word check now looks inside each document's
  own view.
- **Old-fails proof.** On the round-1 script, kept in a scratch copy, the tests for F01–F10 fail; F12 and
  F14 check the page and the project, not the script.
- **Deliberate breaks.** Twelve breaks of the round-2 script, each in a throwaway copy, each fail the
  tests: a settled question counted, a link followed, a foreign file overwritten, any quote taken as a
  stamp, nested code dropped, a history record split, escaped pipes split, list starts lost, headings
  flattened, the focus ring removed, the old low-contrast grey, states not from the plan page.
- **Looked at.** Headless Chrome: the English PRD view and the Notes Digest Overview at 1440 px (a long
  step text overlapped the card's Covers line and was fixed), and the Arabic Plan at 600 px.
- **Not run.** WebKit, keyboard focus in a real browser, a physical iPhone, Windows, print, Node.js other
  than 20.20.2, and a live agent following step 8.

### Round 1

- **Automated checks.** `node --test` passed 249/249 with zero skips, up from 222. The 27 new tests in
  `tests/read-page.test.js` check, for each of the four examples, that its `docs/read.html` matches its
  documents, that every word of every document is on the page, that views switch and steps fold without
  JavaScript, that nothing loads from the network, and that WorkSpace Labs is at the bottom; and, once
  each, the Arabic right-to-left page, counts taken from the documents, document text that tries to
  become page code, a collapsed history record, an empty folder and an unclosed code fence (both refused
  with no page written), and the command line.
- **Deliberate breaks.** Seven breaks of the script, each in a throwaway copy, each fail the tests:
  history records dropped, `<` not escaped, every step open, open questions not counted, the WorkSpace
  Labs line removed, sub-items dropped, numbered lists drawn as bullets. The first was missed at first
  (no example has a history record); the history-record test was added for it.
- **Looked at.** Headless Chrome on macOS: the English and Arabic clinic Overviews and the Plan view at
  1440 px, the Study Timer Overview (no Design, Data or Handover), and the Arabic TRD at 600 px.
- **Not run.** WebKit, a physical iPhone and its Files preview, Windows, printing, and a live agent
  following step 8.

## 0.9.1 — Release steps in use (documentation only)

- **Automated checks.** `node --test` passed 222/222 with zero skips. Only `docs/operations/release.md`
  and the version records changed; the skill folder, examples and preview are unchanged, so the preview,
  plan-page, Pandoc and agent-exercise checks of 0.9.0 were not rerun and still stand.

## 0.9.0 — Speed, per-action cost and release recovery

- **Automated checks.** `node --test` passed 222/222, up from 218/218 on the same Node.js
  version. Four new tests cover named speed targets and their Plan checks, metered costs, release
  recovery, and the tiny offline example. Six separate removals of the new guidance in an isolated copy
  each failed the matching test and its LF and CRLF reruns. The suite checks that the generated example
  pages match their Markdown. The skill validator and the bundled font range check passed.
- **Isolated agent exercises.** Three Codex subagents used copies of the skill with synthetic requests.
  One proposed measuring Search at 800 ms or less on the named phone and workload. The Arabic exercise
  counted a billed failed attempt and retry, kept the per-action ceiling separate from monthly costs,
  and proposed rehearsing a fix release if the older image could not read new receipts. The tiny offline
  converter got a functional check and no added speed, paid-action or release-recovery check.
- **Coverage.** The exercises produced proposed documents and questions. Measurements, paid calls
  and release rehearsals require a future build. This round used macOS and covered example page
  generation. Platform and visual preview results from earlier releases are recorded below.

## 0.8.0: the plan page, 2026-11-19

### Round 11

- **F01, malformed change labels.** The CLI now refuses recognizable change entries with lower-, upper-,
  or mixed-case `Changed`, paired `*` or `_` emphasis around either language’s label, or a missing shadda
  in `تغير في`. The error names the step and the template spelling. The new regression test failed against
  the saved round-10 parser and passed here. Direct comparisons with Pandoc 3.12.1 agreed on the blocks
  and plan outcome for 17 malformed-label cases, five ordinary items, and both canonical spellings. Every
  malformed case went from success with an omitted entry to refusal with no output page.
- **Node.js on macOS.** `node --test` passed 218/218 on 18.20.8, 20.20.0, 20.20.2, 22.14.0, 22.23.1 and
  24.22.1, with zero skips. Node.js 26.13.1 passed 217/218, with the same design-preview test failure recorded
  in round 10. The new plan-page test passed on all seven versions. The font-range check, skill validator,
  and static audit also passed.
- **Against Pandoc 3.12.1.** `node tools/blocks-vs-pandoc.js 5000 662071` reported 3,755 matching block
  trees, 3,754 matching plan outcomes (1,306 readable plans), and zero differences. The tool counted
  1,246 refusals, including one setext-heading refusal after block matching. The existing 367-text
  sample was replayed by the suite.
- **Examples and ZIP.** All four pages regenerated byte-identically. Chrome and WebKit passed 16 combined
  example views at desktop and phone widths with a card opened and closed. The phone contexts had
  JavaScript off. Both engines checked print media. Chrome printed all four examples to PDF, and all 19
  rendered pages matched round 10 at 45 DPI. The rebuilt ZIP contains 75 files that match their sources.
- **Not run.** Windows, a physical iPhone and its Files preview, printer hardware, and a live agent
  following the plan rules.

### Round 10

- **F01, change entries.** The CLI now refuses a recognizable change label with a date such as
  `tomorrow` or `٢٠٢٦-١١-١٩`. The error names the step and gives the required `YYYY-MM-DD` format.
  A settled wait can count as status history only under **How we know it works** or **كيف نعرف أنها تعمل**.
  More than one unquoted transition before the reason leaves the entry neutral. This supersedes the
  earlier round's treatment of unquoted wait names with `→` or «إلى». The English and Arabic reference
  show how to quote the wait name to keep it as status history.
- **F03, bracketed prose.** Both round-9 bracketed review notes and a third near miss now generate a
  two-step page and match Pandoc's blocks. A link-definition label whose unescaped closing bracket
  immediately precedes a colon is still refused with a line number.
- **F09, visible history.** Round 9 introduced the neutral box under **The plan** for changes under
  another field. Its exact Target labels are `Changed 2026-11-19 · Target · recorded as written` and
  `تغيّرت في 2026-11-19 · الموعد المستهدف · كما كُتب`. Round 10 sends a settled-wait-looking Target change
  to the same box. Chrome and WebKit checked both label strings at desktop and phone width. The existing
  Arabic right-to-left display places the date segments on screen in the order `19-11-2026`, with the
  text stored as `2026-11-19`. The renderer, styles and inline script match round 9 byte for byte.
- **Old-fails proof.** The three new plan tests, two new block-parser tests and revised test of 4,200
  generated change entries failed on preserved round-9 scripts and passed on the candidate. The original
  two malformed-date fixtures also went from CLI exit 0 to exit 1 with a named step and no output page.
- **Node.js on macOS.** `node --test` passed 217/217 on 18.20.8, 20.20.0, 20.20.2, 22.14.0, 22.23.1 and
  24.22.1. Node.js 26.13.1 passed 216/217. The same design-preview test failed on round 9 (211/212).
  In the stand-in browser, Node 26's VM read a global getter that throws `null` as `undefined`, so the
  preview saw missing input. `node tools/font-ranges.js --check` passed.
- **Against Pandoc 3.12.1.** `node tools/blocks-vs-pandoc.js 5000 84132` reported 3,746 matching block
  trees, 3,745 matching plan outcomes (1,326 readable plans), and zero differences. The tool reported
  1,255 refusals, including one after block matching for a setext heading inside a plan. A separate
  zero-difference 500-text run (seed 84131) supplied the refreshed 367-text sample.
- **Browser and ZIP.** All four example pages regenerated byte-identically. Chrome and WebKit passed
  24 desktop and phone-width browser cases across the four examples and both Target-label fixtures.
  Phone-width checks used JavaScript off. All four Chrome print PDFs were visually checked, and WebKit's
  print styles were exercised. The rebuilt upload ZIP contains one `project-docs/` root and 75 files,
  each checked against the source bytes. It contains zero test files, PDFs or `.DS_Store` entries.
- **Skill validation.** The static audit found zero issues in the candidate. The skill-creator validator
  passed using the system Python and its existing PyYAML.
- **Not run.** Windows, a physical iPhone and its Files preview, printer hardware, and a live agent
  following the updated plan rules. Node.js 16 is older than the declared minimum of 18.

### Earlier 0.8.0 verification

After an eighth independent review, the way the script reads a plan was rebuilt. Until then it judged
`docs/plan.md` line by line, and every review found one more Markdown shape that a line pattern read
differently from a Markdown parser. It now reads the block structure the way CommonMark does
(`scripts/markdown-blocks.js`, a port of the block phase of the reference parser), reads the plan from those
blocks, and refuses what it would have to guess (ADR 0011). **212 automated tests passed.**

- **Against Pandoc 3.12.1.** `tools/blocks-vs-pandoc.js` generated 40,000 texts on the delivered scripts (seeds 401 to 408): plans with
  awkward lines put into them, and pure mixes of such lines (fences of both kinds and several lengths, the
  seven kinds of HTML block, list items of every form, quotes, headings, underlines, rules, tabs, a
  non-breaking space, CRLF). The script refused 10,065 of them for their Markdown, nearly all for a fence or an
  HTML comment left open by the random mix. Of the 29,935 it read, every one has the same block structure as
  `pandoc -f commonmark` gives, and for every one the plan read from Pandoc's blocks, by the same reading
  function, is the same plan or the same refusal (10,629 of them a readable plan). Runs of 40,000 (seeds 101
  to 108), 40,000 (seeds 201 to 208) and 20,000 (seeds 301 to 304), on the same reader while the rules for
  change entries were being finished, gave the same: 0 differ. Earlier runs of 58,000 texts
  while the comparison was being built showed differences only in the comparison's own text handling (an entity, an Arabic comma beside
  inline code, stray backticks), never in structure. The comparison found, and the script now refuses, forms
  that Pandoc reads differently from the written standard: a comment written `<!-->`, an HTML tag alone on the
  line after quoted or list text, and a bare carriage return as a line end.
- **The reviewer's own checks.** The reviewer's scripts from rounds 2 to 8 and their 141 different fixture
  texts are on this computer; each script was run unchanged against this build. Rounds 3, 5, 6, 7 and 8 pass
  whole. Rounds 2 and 4 pass but for one check each that the reviewer replaced in a later round (English
  status words in an Arabic plan, and a code fence never closed, must now be refused): both behave as the
  later round requires. Against the round-8 results, 35 of 41 fixtures come out the same and six changed,
  each to what Pandoc reads: the two "arrow inside the reason" entries are now neutral, the real wait with an
  arrow in its reason is status history, the inline `<span>` keeps the real step under it, and the two
  `<div>` examples are no longer steps (one was refused before and is now read).
- **How a change entry is split.** The eighth review showed an arrow inside the reason being taken for the
  move "waited for … → not started". The move is now looked for only in the part before the reason. Trying
  to break that fix, the builder wrapped the same lookalike in single quotes, round brackets, backticks, an
  HTML tag and stars: all five were still filed as status history. The rule is now general: "→" and
  "because" (Arabic «إلى» and «لأن») count only at the top level of the sentence, outside quotes, brackets
  and code marks; and where a mark cannot be paired with certainty (single quotes that may be apostrophes,
  stars, an HTML tag, a mark without its pair, a kind of quote the script does not follow) the entry is
  kept whole and shown as written. A real wait whose name holds brackets or single quotes is still status
  history. A second try at breaking it started the reason another way ("because" with no comma, a capital,
  two spaces, "since", a semicolon, a dash; Arabic «لأن» with no comma or a Latin one, «حيث إن»): eleven of
  eleven were filed as status history. Now, when the part before the reason holds more than one arrow, it
  counts as a settled wait only when the start of the reason is certain: the reason word written any other
  way than the template's, a clause mark between the arrows, or no reason at all, leaves the entry as
  written. A wait whose name holds an arrow or «إلى» and whose reason follows the template is still status
  history, as rounds 6 and 7 require. One form is left, and is recorded as a limit: no mark at all and a
  reason word the script does not know, before a template reason ("waited for A → B since C → not started,
  because D") reads as a wait named "A → B since C".
- **New tests.** Eight for the plan page and five for the Markdown reader. The eight, and the corrected
  round-7 test below, fail against the kept round-8 script. Among them: 4,200 change entries built from parts in English and Arabic, where what each
  entry is, is known from how it was put together; 52 hand-picked Markdown cases with the structure Pandoc
  gave; 23 refusals with their line numbers; a recorded sample of 353 generated texts.
- **A wrong test of the builder's own, corrected.** A round-7 test expected a text line with `-` under it to
  be read as ordinary text. Pandoc reads it as a level-2 heading, which would end the steps; it is now
  refused, and the test says so.
- **Deliberate breaks.** 87 breaks of the two scripts, one at a time in a throwaway copy, are each caught.
  Three were missed at first (two Steps sections allowed; a mark without its pair accepted; an unfollowed
  kind of quote mark accepted); their cases were added. A fourth could not be caught because the line it
  broke did nothing; that line was removed.
- **The page itself is unchanged for a plan written to the template:** the four example pages are
  byte-for-byte the pages of round 8, also after the last change. The round 2 and round 3 browser checks pass again in WebKit and
  Chrome, English and Arabic, and both clinic pages printed with a card open hold all 18 steps.
- Not run: Windows, a physical iPhone with this exact build, and a real agent following the new rules.

After a seventh independent review: **199 automated tests passed**. The two new tests (the review's quoted
lookalike of "→ not started" in both languages, real waits with quotes inside and a doubled reason, a line
ending in "not started" that is not a wait; a bare list marker before a fence, fenced backticks inside HTML
comments around a real step, a step inside a comment, an unclosed comment, an HTML block, a "-" underline)
fail against the kept round-seven script. Three deliberate breaks were first missed or could not apply:
one was rewritten to really test the quote boundary, one exposed a rule that could never be reached (it was
removed), and one needed the not-a-wait case above. Thirty-three breaks are now each caught. The round 2
and round 3 browser checks pass; the page's look did not change this round, so printing was not rerun.

After a sixth independent review: **197 automated tests passed**. The two new tests (settled waits kept
whole in both languages: a quoted target, an extra separator, a doubled reason; uncertain lines shown as
written; a fence after a sub-item at the parent's column, inside and leaking; a fence in a sub-item that
falls back to the parent column; a lazy continuation line; a numbered parent) fail against the kept
round-six script. Two deliberate breaks were first missed (sub-items not tracked, lazy lines closing the
item); the cases that show them were added, which also found that a list item's own first line was not
treated as a paragraph a lazy line may continue. Twenty-nine deliberate breaks are now each caught. The
round 2 and round 3 browser checks pass, and both clinic pages printed with a card open hold all 18 steps.

After a fifth independent review: **195 automated tests passed**. The two new tests (wait-like check
changes in both languages, crossed quotes including a pair that balances in number, empty sides; top-level
fences indented one, two and three spaces, a one-space fence after a list item, a column-zero marker under
a list-item fence) fail against the kept round-five script. A helper in the test file that found a card
also matched the You-are-here bar, so one earlier "no badge" check had passed without looking at the card;
it now looks only at cards. Twenty-five deliberate breaks are each caught, and the browser checks of
rounds 2 and 3 pass again.

After a fourth independent review: **193 automated tests passed**. The two new tests use the review's
cases (nested «…» around «إلى», a repeated «لأن» / "because", a quoted wait, a closing fence followed by a
non-breaking space, an unclosed fence inside a list item, an unclosed top-level fence) and both fail
against the kept round-four script. Twenty-one deliberate breaks are each caught. The round 2 and round 3
browser checks were rerun and pass.

After a third independent review: **191 automated tests passed**, and sixteen deliberate breaks of the
script are each caught (five new: fences read as content, a fence closed by a shorter one, impossible dates
accepted, quoted values split inside the quotes, ambiguous Changed lines guessed). The new tests use the
review's exact cases: an Arabic change «الانتقال إلى الصفحة الأولى» → «عرض صفحة التأكيد» after an earlier
change, the same words unquoted, status history holding «إلى», a fenced "## Example" inside the Steps, a
``` example inside a ```` fence, a fenced Arabic template in an English appendix, and 2026-02-30. The
browser checks of rounds 2 and 3 were rerun and pass, and both clinic pages printed with a card open hold
all 18 steps.

After a second independent review: **188 automated tests passed**, and twelve deliberate breaks of the
script are each caught. In WebKit and Chrome, English and Arabic, at iPhone 13 size with JavaScript off:
the board scrolled to 180, card 2 opened by a raw tap, and taps at five backdrop points each close it with
the scroll kept. The same check on a copy of the Arabic page without the new scroll lock fails in WebKit
(the card stays open and the board jumps to 0 or 802), so the first review's edge finding was a real page
problem, not only a test-tool effect as this file said after round 1. With JavaScript on: Enter opens step
4 with focus on its close button; Page Down, Down and End scroll the card body and not the board; Tab
reaches the card body and stays inside the card; Esc returns focus to the card. PDFs: English 11 pages,
Arabic 10.

After the first independent review: **185 automated tests passed**. Four new tests cover what the review found
(a changed check shown with its change, malformed steps refused, "no Built line" told apart from "nothing
built yet", keyboard focus and the phone layout); each fails on the first delivery's script. In WebKit and
Chrome, English and Arabic: keyboard focus stays in the open card and returns to its card on close; with
JavaScript off at iPhone 13 size, taps at all four backdrop corners and the edges close the card; the page
no longer scrolls sideways (the counts box had been 34 pixels wider than the phone). The review's WebKit
edge taps that did not close were then put down to the test tool's scroll-into-view step; the second
review showed it also happens on a scrolled board after a raw tap, and it was fixed (see above). The English and Arabic pages printed to PDF in Chrome (11 and 10 pages).

First delivery: **2026-11-19 · version 0.8.0 · 181 automated tests passed** on macOS, with
`node tools/font-ranges.js --check`. The new test file reads all four example plans, refuses a page that is
out of date with its plan, checks that every card opens with CSS alone and that nothing is loaded from the
network, that plan text never becomes page code, that Arabic plans give a right-to-left Arabic page, and
that an unreadable plan is refused with a reason and no page. Seven deliberate breaks of the script, each in
its own throwaway copy, each fail it. By hand: the English and Arabic clinic pages were tapped in WebKit at
iPhone 13 size with JavaScript off and on (open a card, next, close, You are here, tap the background), and
the English page was printed to PDF in Chrome. Before the build the owner tried a demo of the same board on
a real iPhone, opened from a chat: its cards did not open while the popup needed JavaScript, and opened once
they used plain HTML. The upload zip was rebuilt: one `project-docs/` root, 93 entries (74 files and 19
folders). Not rerun: the Design preview (unchanged), Windows, a real iPhone with this exact build, and a
blind dry run with a fresh agent.

## 0.7.1: an example that uses AI, 2026-11-16

Verified: **2026-11-16 · version 0.7.1 · 166 automated tests passed** on macOS, with
`node tools/font-ranges.js --check`. The new example, Notes Digest, is checked by the same tests as the
other examples and by one of its own, which makes its four documents agree with each other. The upload
zip was rebuilt: one `project-docs/` root, 87 entries (69 files and 18 folders). Not rerun: the preview
page (unchanged), Windows, and a blind dry run with a fresh agent. The example's amounts and its ten
"kept notes files" are made up; no such files exist in the repository, and the model and provider
names are made up too. After an independent review the example names its model, and its Plan tries the
service failure and a wrong answer in the first step that needs them; the test gained checks for a
model that is only described, for six misplaced or partial Plan checks, for a currency mismatch, and
for the TRD and Security disagreeing on what is sent.

## 0.7.0: the AI part, 2026-11-16

Verified: **2026-11-16 · version 0.7.0 · 143 automated tests passed** on macOS, with
`node tools/font-ranges.js --check`. The new test was tried against changed copies, each in its own
throwaway folder, and each fails the suite: an example that says no AI and also names a model, an
example without the heading, an empty Arabic AI part, the Study Timer's new line without its approval
history, the English and the Arabic template each missing one of the five lines, the rule changed to
let the AI choose its own authority, accuracy figures allowed without the person, an open AI choice
made to block every step, the building tool described as the product's AI, and the Plan guide without
its AI check.
The upload zip was rebuilt: one `project-docs/` root, 81 entries (65 files and 16 folders). Not rerun:
the preview page (unchanged), Windows, and a blind dry run with a fresh agent on a product that uses AI.
No example project uses AI, so the five lines are exercised only by the made-up cases inside the tests.
After an independent review, the checker was rewritten to read the AI part as it stands today, through
its Changed lines, and a second test was added with English and Arabic cases: five bare TBDs, a line
written twice, and a model added under an old "no AI" are refused; an untouched "no AI", an open
choice, a settled one, a reopened one and an archived historical record are accepted. The Arabic rules
were rewritten as the same four points as the English, and four details are now checked in both.
A second review found two more routes through Changed history: an answer, or the "no AI" line, reopened
with a bare "→ TBD" still passed. The checker now names the three states the part can be in today and
refuses anything else, and a third test covers each state and each way between them in both languages.
Run against the previous checker, that test fails at "one answer reopened with a bare TBD". The
reviewer's recorded inputs were replayed against the repaired checker: the original 18 and the 14
added in the second review all give the expected outcome.
A third review found that fix had gone one step too far in Arabic: the template lets the two authority
lines say «لا شيء: …» ("nothing: …"), and the checker read those two opening words as "the product uses
no AI". "No AI" is now recognised only by the reference's own sentence. The third test gained, for both
authority lines and in both languages, the template's own "nothing" answer written directly, reached
through a Changed line, and reached by settling a named TBD, each accepted, beside a real "no AI" in the
same places, each refused. Run against the previous checker it fails at the Arabic Decides alone case;
the English cases passed before and after. The test count is unchanged because the cases joined an
existing test.
Verified again: **145 automated tests passed**.

## 0.6.0: what it costs to run, and who pays, 2026-11-16

Verified: **2026-11-16 · version 0.6.0 · 142 automated tests passed** on macOS, with
`node tools/font-ranges.js --check`. The new test and the extended upgrade test were tried against ten
changed copies, each in its own throwaway folder, and each fails the suite: the Study Timer and the
Arabic clinic without their monthly line, a second TBD opened for the text-message price, the clinic's
Handover keeping its old approval, its history line dropped, the Arabic history given an invented
earlier value, the open-price rule changed to block every step, the AI allowed to supply a price, the
Handover template without its pointer to the TRD, and the TRD template without the heading. The upload
zip was rebuilt: one `project-docs/` root, 81 entries (65 files and 16 folders). After an independent
review found that a bill the client already pays could drop out of the total, a second test was added:
it adds up the amounts of each Running cost section and was tried against a made-up case with an owned
server, an existing subscription and a yearly renewal, in seven wrong forms, each refused. It checks the
shape and the sums, never whether an amount is true. Not rerun: the preview page (unchanged), Windows,
and a blind dry run of the new question with a fresh agent.

## 0.5.0: where the code is kept, the changelog and a from-empty set-up, 2026-11-16

Verified: **2026-11-16 · version 0.5.0 · 140 automated tests passed** on macOS, with
`node tools/font-ranges.js --check`. The three new tests were tried against changed copies: an example
TRD without its Kept in line, the changelog sentence moved out of the clinic's release check into the
Prototype title, and the open-code-location rule reversed to block every building step each fail the
suite. `tests/fixtures/approved-0.4.0/trd.md` is the Study Timer TRD as 0.4.0 shipped it; the upgrade
test compares it with today's example. Not rerun: the preview page (unchanged), Windows, and a blind dry
run of the new question.

## 0.4.0: the client meetings to the handover, 2026-11-13

Verified: **2026-11-13 · version 0.4.0 · 137 automated tests passed** (previews unchanged). Built as 0.3.0 on
0.2.2 in parallel with the published 0.3.0/0.3.1, reviewed and approved by Codex in two rounds, then merged
onto 0.3.1 as 0.4.0.

### Blind dry run of the client parts

A fresh agent with no memory of the build was given a made-up client (a staff car park for a city
department: 120 spaces, about 200 staff, the department's own network only, sign-in with work accounts)
and a fixed set of answers. It wrote the blank meeting form, filled it from typed meeting notes, then went
through the PRD, TRD, Design, Data, Security, Handover and Plan to the closing summary, and listed 36 places
where the wording made it guess.

What mattered most for client work: the acceptance test came before the install while the testers could
only reach the client's network (now: on a test copy the testers can reach); one open database choice
blocked the prototype (now: the prototype runs on made-up data first); the client's deadline and its
"later" wishes had nowhere to go (now: **Dates** and **Later** in the PRD, and a **Target** line on delivery
steps); the stamp could not say who approved (now: `by <who>`); no step wrote the guides, held the
training or marked the go-live (now: fixed steps); and the Handover's hints nudged the AI to fill in who
fixes problems, which is the client's decision (now: a fact about the client is never "you pick"). The
owner chose which of these to add; the wording fixes are listed in `CHANGELOG.md`. Left alone on purpose:
the API-guide rule (already approved), a stronger mark for health data, and the design preview not seen in
a browser by the agent.

One limit of the test itself: while reading a reference, the agent's shell command also printed the filled
clinic meeting form from the examples, so its own filled form may have copied that shape.

Also run on macOS: `node --test` (137 pass after the merge) and the static skill audit (no findings). The preview page did
not change, so it was not re-rendered.

## 0.3.1 conditional coverage update, 2026-11-11

- Before edits, accepted source commit `47ee191d2dc98c3e0c8f405db6e655281268b042` had a clean
  working tree and passed the repository's `node --test`: **113/113** tests.
- The updated package passes **119/119** tests, with no failures, skips or todos. The six added
  consistency checks compare English/Arabic readable required/unique declarations with the ready SQL,
  detect removed phone constraints, and check the audit model's minimal fields and linked deletion.
- The existing protection test now checks Connections/Audit against each example's actual capabilities.
  It failed on the original three-line examples, then passed on the coordinated five-line examples.
  The TBD mutation test now counts the current waiting statuses, so the added notice blocker does not
  weaken exact-name checks. Existing heading, history, personal-data inventory, LF/CRLF, reference,
  font and preview-script checks still pass.
- A separate read-only reviewer ran the document/data checks (**85/85**) and inspected the actual diff.
  Review found a missing decision-history extension and Arabic wording limited to staff; both were
  corrected. The dated extension preserves ADR 0007's original decision. The revised Arabic rule
  covers any authorized user accessing another person's protected personal records.
- The bounded static skill audit reports **0 findings** for the candidate package. This is structure,
  reference and compatibility evidence, not proof that an agent follows the instructions.
- The approved update was synchronized to the existing shared-agent and Codex installations after
  backups and a concurrency check. All 60 packaged file hashes and modes agree with the candidate;
  the Claude alias is preserved. Matching installed snapshots and the candidate passed the static
  audit together with **0 findings**. At verification time, the source changes were uncommitted
  and unpublished.
- The general skill-creator YAML validator was attempted but cannot start because this Python lacks
  PyYAML. No dependency was installed. The package's existing metadata/reference tests and separate
  static auditor ran; the unavailable general validator is not reported as a pass.

The six-document order, fixed document headings, PRD IDs, approval process, optional Frameflow offer,
deferred API guide and preview assets are unchanged. Clinic examples remain Draft after changes;
earlier human-checked Plan progress is preserved as history. The timer has no Design or Data document
and no invented service, backup, notice or deployment requirement.

These are package checks and source review. No new live-agent exercise, browser/Windows run, actual
database restore, deployed release, legal review or conformance result is claimed. The additional
live-agent cases in [behavioral-cases.md](tests/behavioral-cases.md) are exercise contracts, not runs.

## 0.3.0 candidate: package checks, 2026-11-05

Verified on **macOS 27.2 · Node.js 22.14.0** with the repository's offline `node --test` command:

- Before edits, commit `25beb27c376af95728386be330376987ed077aa2` passed **110/110** tests.
- The updated candidate passed **113/113** tests: 0 failures, cancellations, skips or todos.
- The three added tests check real packaged reference reachability and detect a missing handoff or a
  link outside the installed bundle. They are integrity tests, not evidence that an agent follows prose.
- Existing English/Arabic document examples, fixed headings, approval/history/status checks, font
  coverage, preview script checks and LF/CRLF document runs still pass. Preview assets and existing
  examples were not changed; no new visual/browser or Windows/platform test is claimed.

### Executed coordinated exercises

Five fresh executor contexts received separate ordinary requests/workspaces and manually supplied
candidate skill paths, without the private rubric. A separate fixture/probe author independently
graded their actual outputs, and a separate source reviewer reran the retained fixture suites in
disposable copies. All five observed artifact/response outcomes passed within their defined scope:

- A tiny typo changed one heading only; no new files or planning process appeared.
- An already approved notes build reused its stack, canonical documents and IDs. Owned deletion
  persisted across a fresh load; private probes denied cross-owner access without data changes.
  Prior owner-checked progress stayed intact and new work waited for the owner's check.
- A SQLite restore repair proved usable records and preserved useful data on failed recovery.
- A document-only seven-day policy revision preserved original decisions and checked history,
  settled the current-versus-historical TBD correctly, left revised documents as Draft, and
  invalidated the old unchecked run without changing code.
- A store release assessment correctly left missing artifact/signing/privacy/current-policy proof
  unverified. It did not turn a source slice or no-collection promise into submission readiness.

The independently rerun fixture suites passed **1/10/16/1/1 methods**, respectively: **29 distinct
methods**, separate from the 113 package tests. Independent pristine-code controls showed that the
retained persistence and corrupt-restore regressions detect the original implementation gaps.
One raw restore grader check remains red because it incorrectly required its operating document
to stay byte-identical. Both independent reviews accepted the expanded instructions after confirming
the unchanged SQLite/schema/CLI contract; EVAL-01 and the raw result are retained, not silently erased.

Source/staged packages matched their complete final manifests (23 engineering files, 60 project-docs
files). Original source repositories and all six user installations remained preserved. Raw fixtures,
responses, probes, snapshots and independent assessments live outside this repository in the local
coordinated update workspace's `evidence/` directory. No real installation occurred.

These are one-run synthetic cases, not every contract in
[behavioral-cases.md](tests/behavioral-cases.md). Arabic live document changes, a complete new-project
interview, optional-partner absence, repeated reliability, automatic selection, real release and
assurance/conformance were not established. English/Arabic source parity was reviewed, not live-tested.
Full executor tool histories and per-read package hashes were not exported; actual outputs/reruns
are evidence, while reported command history and absence of external actions are not independently
attested. Exact model-build identifiers were not captured. There was no old-skill/no-skill agent
control, so no causal improvement score is claimed. Package checks alone prove none of these behaviors.

The skill-creator general YAML validator was attempted but could not start because the current
Python lacks PyYAML. No dependency was installed; this is an unavailable check, not a pass. Package
metadata checks and the static audit passed (no project-docs findings). That candidate record
preceded the required owner acceptance for real installation.

### Subsequent owner acceptance and installed-copy verification

On 2026-11-05 the owner accepted both candidates and authorized committing and pushing them.
The exact accepted packages were installed across six logical user skill paths: four physical
directories, with the two existing Claude aliases preserved. Fresh recovery copies and original
directories were retained. All six paths matched the accepted content/mode manifests: 60 files
for project-docs and 23 for engineering. No project-docs instruction bytes were changed;
the engineering guide had one extra EOF blank line removed during staging, with its
pre-correction copies and original manifests retained alongside final publication identities.

Hash/mode-identical installed snapshots passed the static re-audit with no structural errors or
project-docs findings; engineering retains its 12 existing nested-tree review warnings. The
engineering suite also passed 41/41 against the real Codex installed root. This does not add a
new project-docs behavior, automatic-selection, browser/platform or assurance result. No real
rollback drill, tag, GitHub Release or store submission was performed for this record.

The historical browser/platform results below belong to their named versions and runs.

## 0.2.2 verification record

Last verified then: **2026-10-21 · version 0.2.2 · 110 automated tests passed · WebKit and Chrome previews ready**.

## Blind dry run and wording repairs — 0.2.2

A fresh agent with no memory of the skill was given a made-up project (a neighbours' book shelf: a few
pages, two sheets, one keeper password, an existing Express and SQLite start) and a fixed set of answers for
the person, and told to follow `SKILL.md` to the letter. It wrote all six documents and `AGENTS.md`, ran the
preview check (`ready`), changed the approved PRD on a clear request, settled a hosting `TBD` after the plan
was approved, and handed back 24 notes on where the wording made it guess. Nineteen were gaps and are
settled in the references (the list is in `CHANGELOG.md`); the other five were judgment calls the agent
made well, or limits of the test itself, and were left alone.

The one defect that mattered: with no format for a step whose wait was settled, the agent wrote a history
line that repeated the `⛔ waits for TBD:` words, which the document checks read as a step still waiting on
a choice that no longer exists. The plan reference now gives the fixed line, and a new test proves it is a
valid `Changed` line that no longer reads as waiting, in both languages, and that the old shape is caught.

Also run on macOS: `node --test` (110 pass), the static skill audit (no findings), the font-range check,
every Markdown link target, the zip recipe (75 files), and the example previews in native WebKit and in
Chrome 155, English and Arabic, at 1280 px and 390 px, all `ready`. Windows, Edge, Firefox and live Google
Fonts were not rerun for 0.2.2.

## macOS repair verification — 0.2.1

Baseline: `b45af47e4b18ba4ca5b61032d0cf365fdaafa02f` (0.2.0), initially clean.
The baseline's 104 automated tests passed before the additional checks exposed the cases below.
This repair was verified on macOS 27.0.1, arm64, with Node.js 20.20.2. The installed skill folders
matched that baseline before repair; backups were retained outside the installable package.

### Automated checks

```text
node --test
109 tests; 109 pass; 0 fail; 0 cancelled; 0 skipped; 0 todo

node tools/font-ranges.js --check
Bundled font ranges match every TTF.
```

The total contains 78 document tests, 27 preview tests, two font-parser tests and two line-ending
wrapper tests. The wrapper tests additionally run the complete document checks in disposable LF and
CRLF copies; their child results are not added to the reported 109 top-level tests. No assertion was
weakened and no test was skipped.

Five new tests cover two English/Arabic provider-identity checks and three preview cases. Negative
controls remove the readable identity field, its personal-data mark, its SQL column or uniqueness and
prove the document checks reject each mismatch. The preview cases reproduce the hidden third-action
false refusal, stalled font loading, stable refusal after a late result, and cleanup of settled deadlines.
The two preview bug reproductions and both provider-identity checks failed against the original
behavior before the fixes, then passed afterward. Deadline cleanup is an additional passing control.

The skill-creator package validator, static skill audit, font metadata check and `git diff --check`
passed. Independent source review and a document-workflow check verify the repairs; those checks are
not a new end-to-end live-user project trial.

### Native browser checks

The repository's existing `tools/shot-mac.swift` checker was compiled with the installed Xcode tools
and used on fresh copies of the preview. It opens native WebKit offscreen and reports the page's actual
`data-preview` result. No dependency was installed and no production project was used.

Six checks of the repaired page produced their expected result:

- English clinic at 1280 px and 390 px: `ready`.
- Arabic clinic at 1280 px and 390 px: `ready`, with right-to-left layout.
- English clinic with an unused third action containing Arabic: `ready`; the displayed labels stay English.
- Font loading deliberately replaced with a never-settling promise: `refused` after the ten-second deadline,
  with the existing font guidance shown.

The same four ordinary pages were captured before repair. All four before/after PNG pairs are
byte-identical; desktop and phone screenshots were inspected. The hidden-action baseline instead
reported a false refusal, and the stalled-font baseline still had no final state when the checker
reached its twenty-second limit. These failing baseline observations are not counted as successful
repaired-page checks. No change was made to CSS, colors, layout, fonts or contrast thresholds.

### Document and distribution checks

Security-only work no longer assumes a missing Data document proves there is no saved data. The
reference distinguishes approved owner/staff/public permissions and accurately discloses Google Fonts
downloads. Both clinic examples' required, unique Microsoft account IDs agree across the readable
model, ready SQL, personal-data marks and Security inventories. Their changed Data/Security documents
are v3 Draft, preserving history without inventing owner approval. The timer's confirmed no-persistence
case remains unchanged.

All 59 files in the installed Codex and shared Agent Skills copies were verified against the validated
source by SHA-256 after synchronization; Claude's existing alias still uses the shared copy. Raw logs, before/after
screenshots, findings and backups are retained outside the repository and installable skill.

### Current limits

The new 109-test result and browser cases establish macOS behavior at this repair only. Windows,
Chrome, Edge and live Google Fonts were not rerun for 0.2.1; their 0.1.2 results below remain historical.
Firefox and a real person completing a whole project remain unverified. The earlier blind agent runs,
review approvals and isolated continuation scenario are not a full fresh live-user workflow for 0.2.1.

## Historical validation — versions 0.1.0 to 0.1.2

The following dated record is retained unchanged apart from heading depth. Its platform, browser,
release approval and upload-ZIP claims apply to those earlier versions, not automatically to 0.2.1.

Last verified: **2026-10-09 · version 0.1.2 · 101 automated tests passed, 32 browser checks passed**.

project-docs was not just written. It was tested, run blind by fresh agents, and then reviewed by a second
AI that tried to break it. The first release passed that review; version 0.1.1 added Windows testing and
fixes, and version 0.1.2 adds live Google Fonts verification. This page lists what was run and found, and
what still needs validation.

### At a glance

| What | Result |
|---|---|
| Automated tests | **101**, all passing on Windows with Node.js 24.19.0: 73 document checks, 24 preview checks, 2 font-parser checks and 2 complete line-ending runs. The original 94 passed on Node.js 18, 20 and 22 |
| Windows browsers | **32 checks** in installed Chrome 143.0.7499.41 and Edge 143.0.3650.66: 22 offline preview checks and 10 live online-font/consent/failure checks, with screenshots inspected |
| Final skill ZIP | **59 files**, each verified against the source by SHA-256; correct `project-docs/` root, no tests or PDFs |
| First-release independent review | **7 rounds** by a second AI (OpenAI Codex), which read the code and tried to break it. **Approved** on 2026-10-08 |
| Problems that review found | **9**: 8 medium, 1 low. **All fixed** |
| Planted bugs | **11** deliberate breaks by the builder, then **27** more by the reviewer. The tests caught **all 38** |
| Preview page under attack | **24** hostile preview pages from the reviewer (missing fonts, broken values, crashing inputs). Each was refused with a plain reason or drawn correctly, as it should be |
| Blind dry runs | **2** fresh agents used the skill from start to finish for a made-up home-bakery website. They found about 37 problems, and all were fixed |
| Arabic | The clinic example also exists in Arabic, right to left, read and approved by the owner |
| Skill audit | Static audit of the skill folder: no findings, and no trigger clash with other installed skills |

### The automated tests

Run them yourself from the repository root (Node.js 18 or newer, needed for the tests and to make the plan page):

```bash
node --test
```

- **The documents** (`tests/documents.test.js`): every example, in English and Arabic, is checked against
  its document's headings. Requirement numbers have no gaps, `Changed` lines and open choices (TBDs) have the
  right shape, and the design file matches the look that was picked. Personal and secret data is marked, and
  the security page names every marked column. Every requirement is covered by a plan step, and a step that
  waits for an open choice names a choice that is really open.
- **The preview page** (`tests/preview.test.js`): the page's real scripts run in a stand-in browser. A look
  is shown as ready only if its fonts really load and every colour pair passes the contrast check. Anything
  else is refused, with every reason listed. Every bundled face's declared character coverage is compared
  to its actual font file; unsupported mixed-language text must be refused.
- **Font metadata** (`tests/font-ranges.test.js`): independent known Unicode mappings check the dependency-free
  TTF reader, including missing glyphs and characters beyond the basic multilingual plane.
- **Line endings** (`tests/line-endings.test.js`): all document checks run again against isolated copies
  with LF and CRLF Markdown, including paths containing spaces and Arabic. Git settings and source files
  are left alone.

Every fix from the review left a test behind, so the same bug cannot come back silently.

### Windows verification: 2026-10-09

The final run passed **101 of 101 automated tests**, with no failures, skipped tests or cancellations.

| Environment | Tested version |
|---|---|
| Windows | Build 26100 |
| PowerShell | 5.1.26100.7309 |
| Node.js | 24.19.0 |
| Chrome | 143.0.7499.41 |
| Edge | 143.0.3650.66 |

#### Browser checks

Every case below ran in **both Chrome and Edge**, directly from local files with the browser offline.
All 22 cases returned the expected result, with no uncaught page errors.

| Case | Widths (px) | Expected result | Checks across both browsers |
|---|---|---|---|
| English clinic example | 1280, 390, 320 | `ready`, three looks | 6 |
| Arabic clinic example | 1280, 390, 320 | `ready`, three looks, right to left | 6 |
| Valid 60-character unbroken title | 390 | `ready`, title wraps | 2 |
| Unreadable button text | 390 | `refused`, contrast problem explained | 2 |
| Missing Lora bold file | 390 | `refused`, missing font explained | 2 |
| Preview value accessor throws `null` | 390 | `refused`, clear fix message | 2 |
| Arabic title text assigned to Latin-only fonts | 390 | `refused`, unsupported text explained | 2 |

Screenshots were inspected at desktop and phone widths. The preview's visual rules and contrast
thresholds were kept; the inspected English desktop and Arabic phone screenshots were byte-identical
before and after the font metadata repair.

#### Live Google Fonts checks

Ten additional cases ran in the same Chrome and Edge versions, using an isolated English clinic preview
with **Merriweather** as one look's heading font. Successful cases fetched the real stylesheet from
`fonts.googleapis.com` and a real WOFF2 file from `fonts.gstatic.com`, both with HTTP 200, and the browser
confirmed the font face loaded. Desktop and phone screenshots were inspected. All cases below passed
without uncaught page errors.

| Case | Widths (px) | Expected result | Checks across both browsers |
|---|---|---|---|
| Merriweather listed in `onlineFonts` | 1280, 390 | `ready`, three looks, actual font loaded | 4 |
| Merriweather absent from `onlineFonts` | 390 | `refused`, no external request | 2 |
| Google Fonts stylesheet request blocked | 390 | `refused`, connection/font advice shown | 2 |
| Stylesheet loads, font-file request blocked | 390 | `refused`, connection/font advice shown | 2 |

This verifies one English font family, not every Google Fonts family or language subset. The normal
automated suite remains offline; these live checks do not add a network dependency to `node --test`.

#### Problems found and fixed

| Problem | Evidence before the fix | Fix and verification |
|---|---|---|
| Windows line endings broke the document checks | A fresh checkout with `core.autocrlf=true` passed 51 tests and failed 43 | Normalize Markdown at the read boundary; rerun every document check against both LF and CRLF copies |
| Missing glyphs silently used Windows fallback fonts | A mixed-language title reported `ready` while Segoe UI supplied Arabic letters | Declare actual bundled-font character coverage; both browsers now refuse the unsupported text; the normal Arabic example still passes |
| Reopening an approved choice conflicted with preserving history | An independent continuation test could not consistently update ready SQL, plan blockers and approval stamps | Preserve superseded choices and SQL in marked history, keep one current named TBD, retain checked progress and block affected unchecked work; test reopening and settling again in both languages |
| Manual install and ZIP instructions only covered Unix shells | The original commands used Bash syntax and `zip` | Add PowerShell alternatives; exercise Claude Code and Codex destinations, ZIP creation and overwrite in temporary staging |

The independent continuation result changed only TRD, Data and the existing Plan. All three returned to
Draft, the old SQL stayed intact, and no user approval or completed work was invented.

#### Final checks

- `node --test`: **101 passed, 0 failed**.
- `node tools/font-ranges.js --check`: every bundled font descriptor matches its TTF file.
- Skill metadata and reference links passed validation with an already available YAML parser. The bundled
  Python skill validator could not run because this Python environment does not have PyYAML.
- The final upload ZIP contained all **59 source files**, with matching SHA-256 hashes, under the
  `project-docs/` root. No test files or PDFs were included. No skill was installed into a live agent
  configuration during testing.
- A separate review of the final changes found no remaining substantive issue; `git diff --check` passed.

The browser checks used already installed browsers and cached development tooling. They do not add a
runtime dependency to the installed skill. The final 101-test suite was run on Node.js 24 on Windows;
the expanded suite has not yet been rerun on Node.js 18, 20 or 22, or on macOS.

After replacing bundled fonts, regenerate their metadata with `node tools/font-ranges.js`, then verify it
without writing with `node tools/font-ranges.js --check`. Run `node --test` and inspect the real preview.

### The blind dry runs

Two fresh AI agents, who had never seen the skill's code, played a person with a made-up home-bakery
website and went through all six documents.

- Run 1: 13 rounds, 31 questions. About 20 problems found, all fixed.
- Run 2, after those fixes: 17 rounds, 36 questions, never more than 3 questions a round. 17 problems found,
  all fixed.

### The independent review

Codex reviewed the skill as a stranger would. It read the real code, ran the tests, and built its own broken
copies to see whether the tests noticed. After each round the fixes went back to Codex, and Codex decided
each time whether a finding was really closed. Five findings were reopened at least once. The last one needed
six fixes and was settled by the owner's decision in round 7.

| # | Severity | What Codex found | Fixed by |
|---|---|---|---|
| F01 | Medium | The design file's values could drift from the picked look while every test still passed | Each value is compared exactly to the picked look |
| F02 | Medium | A plan step waiting for an open choice could name a choice that does not exist | A waiting step must use the open choice's exact full name (the owner's decision, after six fixes) |
| F03 | Medium | A missing font was drawn with a stand-in and still reported ready | The preview is ready only when every font really loads, in the right weights, for the real text |
| F04 | Medium | A palette could pass the contrast check yet hide its option letter | The letter is drawn on a tile of the look's own background and checked |
| F05 | Medium | Badly formed look values passed the check, or crashed it | Stricter values. Bad input is refused with a plain reason and never crashes |
| F06 | Low | The examples said they used local fonts that were not there | The examples ship their fonts |
| F07 | Medium | A valid long title broke the layout on a phone | Long words wrap |
| F08 | Medium | The example clinic plans left out patient sign-in and the open choice it waits for | Added, and a test checks it |
| F09 | Medium | Identifying fields were missing from the personal-data map | Added, and a test checks it |

### Remaining validation

Completed checks are recorded above. These gaps remain; a report of a real trial is welcome.

- **Firefox preview behavior:** Firefox was unavailable in this Windows test environment. WebKit,
  Chrome, Edge and the stand-in browser have been checked.
- **A real person completing their own project:** the earlier full dry runs were agent simulations,
  not a new user working on a real project.
- **A complete interactive workflow in Claude in the browser, Codex, Copilot or Cursor:** Codex has been
  checked through one isolated continuation scenario. That does not establish an end-to-end live user
  workflow in any of these tools.
