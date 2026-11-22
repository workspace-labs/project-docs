# Architecture overview

This repository ships one agent skill. Its scripts generate local meeting and plan pages. Those pages
and the look preview run in the browser from files on disk.

```text
README.md                          what the skill does, install, examples, limits, project map
.gitattributes                     every text file is LF; fonts and pictures are binary
AGENTS.md                          rules for coding agents changing this repository
CHANGELOG.md                       dated changes, one entry per version
TESTING.md                         what was run, what it proved, what is still unverified
CREDITS.md                         the six bundled fonts and their licences
docs/
  scope.md                         what the skill does, will NOT do, and how good it must be
  adr/                             why it is built this way (index: adr/README.md)
  architecture/                    this page and boundaries.md
  operations/release.md            how a version is made and shipped
  security.md                      what this repository touches, and what it never does
  risks-and-debt.md                known problems and unverified areas
  workflow/project-docs-workflow.json   the skill's flow, for the workflow-project skill
skills/project-docs/               the installed skill: copied or zipped exactly as it is
  SKILL.md                         the menu: document order, the shared loop, stamps, locks
  references/<document>.md         one per document: its questions and exact headings
  references/engineering-handoff.md   optional approved-input summary for a separate builder
  assets/preview/                  the look preview page: preview.html, render.js, check.js,
                                   preview.css, fonts/
  scripts/                         plan-page.js uses markdown-blocks.js to make docs/plan.html;
                                   meeting-page.js makes docs/meeting-form.html from docs/meeting-form.md
  examples/                        cedar-clinic, cedar-clinic-ar, study-timer, notes-digest
tests/                             node --test: documents, preview, plan page, Markdown blocks, font ranges, line
                                   endings, reference integrity; fixtures/markdown-blocks/: a sample recorded from Pandoc;
                                   behavioral-cases.md: separate real-agent exercise contracts
tools/                             builder-only helpers: font-ranges.js, shot-mac.sh/.swift, blocks-vs-pandoc.js
media/                             the README picture
```

## How the parts talk

```text
 person ──answers──▶ AI agent ──reads──▶ SKILL.md ──loads one──▶ references/<document>.md
                        │
                        ├──writes──▶ the person's project: docs/*.md, DESIGN.md
                        │
                        ├──copies──▶ assets/preview/ → project docs/design-preview/
                        │            and writes only looks.js there
                        │
                        ├──runs────▶ scripts/plan-page.js docs/plan.md → project docs/plan.html
                        │            (markdown-blocks.js → the plan → one page; refuses what it would guess)
                        │
                        ├──runs────▶ scripts/meeting-page.js docs/meeting-form.md → project docs/meeting-form.html
                        │            (browser typing → saved meeting answers → agent updates the form)
                        │
                        └──offers once──▶ frameflow skill (if installed; never installs it)

 browser ──opens──▶ preview.html ──loads──▶ looks.js → check.js → render.js
                                             (render.js shows a look only when check.js passes it;
                                              a font in onlineFonts is fetched from Google Fonts)

 node --test ──reads──▶ references + examples (document checks)
             ──runs───▶ check.js and render.js in a stand-in browser (preview checks)
```

- `SKILL.md` holds the order and the loop. A reference file holds everything about one document
  ([ADR 0001](../adr/0001-one-skill-with-a-file-per-document.md)).
- The documents a user gets live in their `docs/`, with `DESIGN.md` at their project root
  ([ADR 0002](../adr/0002-documents-live-in-docs-and-the-prd-is-the-scope.md)).
- The preview is classic scripts, not modules, so it opens from disk; `check.js` never touches the page,
  so the same file runs in Node for the tests and as `node check.js looks.js`
  ([ADR 0003](../adr/0003-an-html-preview-page-shows-the-looks.md)).
- The reference headings, the examples and `tests/documents.test.js` form one contract: they change
  together (see `AGENTS.md`).
- The optional engineering handoff is reachable from the approved-Plan closing step and the Plan
  reference. It reuses canonical documents and checks, adds no required output file, and never starts
  implementation. `tests/handoff.test.js` checks that its links remain self-contained in the package.

Who owns what, and what may not cross, is in [boundaries.md](boundaries.md).
