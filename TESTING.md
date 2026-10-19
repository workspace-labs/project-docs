# How project-docs was tested

Last verified: **2026-10-19 · version 0.2.1 · 109 automated tests passed · six native WebKit cases passed**.

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

Run them yourself from the repository root (Node.js 18 or newer, needed for the tests only):

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
