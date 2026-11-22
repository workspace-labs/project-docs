# Responsibility boundaries

Each thing has one home. A change goes to the home that owns it, and nowhere else.

| Home | Owns | Never holds |
|---|---|---|
| `skills/project-docs/SKILL.md` | the document order, the shared loop (ask, read back, write, approve), the stamp, locks and `Changed` lines, the frameflow offer, the rules that never bend | anything about one document only; it stays a short menu (about 150 lines at most) |
| `skills/project-docs/references/<document>.md` | that document's questions, its exact headings, and its "In Arabic" words | rules shared by all documents (those belong in `SKILL.md`) |
| `skills/project-docs/assets/preview/` | how looks are drawn (`render.js`, `preview.css`), whether a look may be shown (`check.js`: contrast pairs, fonts, value shapes), the bundled fonts and their licences | project words or looks: those come only from the `looks.js` an agent writes in the user's project |
| `skills/project-docs/scripts/markdown-blocks.js` | the block structure of a Markdown text as CommonMark reads it (headings, list items, quotes, paragraphs; code and raw HTML are not content), and the refusal of what it would have to guess | anything about plans: it knows no step, field or status |
| `skills/project-docs/scripts/plan-page.js` | reading the plan from those blocks (the Steps section, steps, fields, change entries, the four statuses) and drawing `docs/plan.html` | the plan's format rules, which are the Plan reference's; reading raw lines of the file |
| `skills/project-docs/scripts/meeting-page.js` | reading the fixed meeting form, drawing `docs/meeting-form.html` and saving a local answers file from that page | deciding what is unresolved or when discovery is complete |
| `skills/project-docs/examples/` | complete, valid sample documents in each supported shape (full English, full Arabic, tiny with no screens and no saved data), each with its generated `plan.html` | anything that does not pass `node --test` |
| `tests/` | proof that examples follow the reference headings, agree with each other, that the preview refuses what it must, and that the plan page reads Markdown as Pandoc recorded it | test fixtures inside the skill folder |
| `tools/` | builder-only helpers: font coverage (`font-ranges.js`), Mac screenshots (`shot-mac.sh`), the comparison with Pandoc (`blocks-vs-pandoc.js`) | anything the installed skill needs at run time |
| root Markdown and `docs/` | install, scope, decisions, architecture, release, security, verification record | instructions the installed skill depends on |

## Rules at the boundaries

- **The skill folder is self-contained.** It is installed and zipped as it is. Nothing inside it links to or
  needs a file outside it. No tests, no drawn PDFs, no builder tools inside it.
- **One contract, changed together.** A heading in `references/<document>.md`, the examples that use it
  and `tests/documents.test.js` move in the same change.
- **The agent writes only `looks.js` in the preview.** It never edits `preview.html`, `render.js`,
  `check.js` or `preview.css` in a user's project.
- **The page's look and its contrast check belong to the owner.** No change loosens a check or changes the
  page's look without the owner's yes.
- **The network stops at fonts.** The only outside request anywhere is the preview loading a font the
  person said yes to (see [security](../security.md)). The skill, the tests and the tools make none.
- **The user's project is touched only in its documents.** The exceptions are the Plan's marked block in
  `AGENTS.md` or `CLAUDE.md` and the `@AGENTS.md` import in `CLAUDE.md`, each only on a yes to that file.
- **frameflow and workflow-project stay outside.** project-docs offers frameflow once and never installs
  it; process workflows are workflow-project's job.

A new document type adds one reference file, one line in the `SKILL.md` order, its examples and its tests,
as [ADR 0001](../adr/0001-one-skill-with-a-file-per-document.md) says. It adds no new home.
