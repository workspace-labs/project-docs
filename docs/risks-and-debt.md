# Risks and debt

Known problems, deliberate shortcuts and unverified areas, as of version 0.2.2 (2026-10-21). Each item says
what would close it. When one closes, mark it with the date and the change that closed it; never delete it.
What was actually run is in [TESTING.md](../TESTING.md).

## Unverified

| Area | Last checked | Closes when |
|---|---|---|
| A real person finishing their own project | never; only agent dry runs | one real trial is reported and its findings are fixed |
| A full live workflow in Claude in the browser, Codex, Copilot or Cursor | one isolated Codex continuation only | one end-to-end run in each tool `docs/scope.md` names |
| Firefox preview | never | the examples report `ready` in Firefox at computer and phone width |
| Windows and Edge | 0.1.2 | `node --test` and the preview checks are rerun on Windows for the current version |
| Node.js 18 and 22 | 0.1.0 (94 tests); 0.2.2 ran on Node 20 only | the current suite passes on 18, 20 and 22 |
| Live Google Fonts | 0.1.2, one font family (Merriweather) | rerun when `render.js` font loading changes |
| The bundled Python skill validator | could not run (no PyYAML) | it runs where PyYAML is already available |

## Debt

| Item | Risk | Closes when |
|---|---|---|
| No CI | the test count in README and CHANGELOG depends on someone running `node --test` by hand | a workflow runs `node --test` and the font check on push, on Linux, macOS and Windows |
| No `.gitattributes` | a CRLF checkout once failed 43 of 94 tests; the tests now cope, but the repository does not declare its line endings | Closed 2026-11-04 (0.2.4): `.gitattributes` stores and checks out every text file with LF |
| No tags or GitHub releases | users cannot install or roll back to a named version | the tag and release steps in [operations/release.md](operations/release.md) are approved and used |
| Screenshot helper is macOS-only | Windows and Linux builders have no scripted way to look at the preview | a cross-platform helper, or written manual steps for each platform |
| `docs/workflow/project-docs-workflow.json` is at 0.1 | it misses the Security page's "How it's protected" section (0.2.0) | it is regenerated for the current version |
| `docs/scope.md` names five AI tools | only Claude Code and one Codex scenario are verified | the scope line says "designed for", or the runs above are done |
| The version and test count are written in three places | README, CHANGELOG and TESTING drift apart | each release follows the release checklist, or a test checks they agree |

## Deliberate limits

These are choices, not debt. They change only by a new decision.

- English and Arabic only.
- 2 or 3 looks in a preview; six bundled fonts; any other font only online and only on the person's yes.
- The skill writes documents, not code, apart from `DESIGN.md`'s ready values and `data.md`'s ready
  tables.
