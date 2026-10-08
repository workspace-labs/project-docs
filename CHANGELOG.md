# Changelog

All notable changes to this project. The version is the one named in `README.md`.

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
