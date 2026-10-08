# How project-docs was tested

Last verified: **2026-10-09 · version 0.1.1 · 101 passed, 0 failed**.

project-docs was not just written. It was tested, run blind by fresh agents, and then reviewed by a second
AI that tried to break it. The first release passed that review; version 0.1.1 adds Windows testing and
fixes found there. This page lists what was run and found, and what has not been tried yet.

## At a glance

| What | Result |
|---|---|
| Automated tests | **101**, all passing on Windows with Node.js 24.19.0: 73 document checks, 24 preview checks, 2 font-parser checks and 2 complete line-ending runs. The original 94 passed on Node.js 18, 20 and 22 |
| Windows browsers | **22 offline checks** in installed Chrome 143.0.7499.41 and Edge 143.0.3650.66, with screenshots inspected |
| Final skill ZIP | **59 files**, each verified against the source by SHA-256; correct `project-docs/` root, no tests or PDFs |
| First-release independent review | **7 rounds** by a second AI (OpenAI Codex), which read the code and tried to break it. **Approved** on 2026-10-08 |
| Problems that review found | **9**: 8 medium, 1 low. **All fixed** |
| Planted bugs | **11** deliberate breaks by the builder, then **27** more by the reviewer. The tests caught **all 38** |
| Preview page under attack | **24** hostile preview pages from the reviewer (missing fonts, broken values, crashing inputs). Each was refused with a plain reason or drawn correctly, as it should be |
| Blind dry runs | **2** fresh agents used the skill from start to finish for a made-up home-bakery website. They found about 37 problems, and all were fixed |
| Arabic | The clinic example also exists in Arabic, right to left, read and approved by the owner |
| Skill audit | Static audit of the skill folder: no findings, and no trigger clash with other installed skills |

## The automated tests

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

## Windows verification: 2026-10-09

The final run passed **101 of 101 automated tests**, with no failures, skipped tests or cancellations.

| Environment | Tested version |
|---|---|
| Windows | Build 26100 |
| PowerShell | 5.1.26100.7309 |
| Node.js | 24.19.0 |
| Chrome | 143.0.7499.41 |
| Edge | 143.0.3650.66 |

### Browser checks

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

### Problems found and fixed

| Problem | Evidence before the fix | Fix and verification |
|---|---|---|
| Windows line endings broke the document checks | A fresh checkout with `core.autocrlf=true` passed 51 tests and failed 43 | Normalize Markdown at the read boundary; rerun every document check against both LF and CRLF copies |
| Missing glyphs silently used Windows fallback fonts | A mixed-language title reported `ready` while Segoe UI supplied Arabic letters | Declare actual bundled-font character coverage; both browsers now refuse the unsupported text; the normal Arabic example still passes |
| Reopening an approved choice conflicted with preserving history | An independent continuation test could not consistently update ready SQL, plan blockers and approval stamps | Preserve superseded choices and SQL in marked history, keep one current named TBD, retain checked progress and block affected unchecked work; test reopening and settling again in both languages |
| Manual install and ZIP instructions only covered Unix shells | The original commands used Bash syntax and `zip` | Add PowerShell alternatives; exercise Claude Code and Codex destinations, ZIP creation and overwrite in temporary staging |

The independent continuation result changed only TRD, Data and the existing Plan. All three returned to
Draft, the old SQL stayed intact, and no user approval or completed work was invented.

### Final checks

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

## The blind dry runs

Two fresh AI agents, who had never seen the skill's code, played a person with a made-up home-bakery
website and went through all six documents.

- Run 1: 13 rounds, 31 questions. About 20 problems found, all fixed.
- Run 2, after those fixes: 17 rounds, 36 questions, never more than 3 questions a round. 17 problems found,
  all fixed.

## The independent review

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

## Not tried yet

These have not been tried yet. If you try one, an issue telling us how it went is welcome.

- Firefox (WebKit, Chrome, Edge and the stand-in browser have been checked)
- Live loading from Google Fonts (all real-browser checks used bundled fonts; automated tests simulate
  online font faces and failures)
- A brand-new person using it on a real project of their own
- A complete interactive project from start to finish in Claude in the browser, Codex, Copilot or Cursor.
  The Windows Codex check above exercised one continuation scenario, not a complete live user project
