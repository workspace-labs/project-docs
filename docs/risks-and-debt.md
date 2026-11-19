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
| Node.js 18 and 22 | 0.8.0 round 10, 217 tests passed on both majors | Closed 2026-11-19 by rerunning the current suite on Node 18, 20 and 22 |
| Live Google Fonts | 0.1.2, one font family (Merriweather) | rerun when `render.js` font loading changes |
| The Python skill validator | 0.8.0 round 10, passed with system Python and its existing PyYAML | Closed 2026-11-19 |
| The plan page on a physical iPhone, with the released build | 0.8.0: only a demo of the board, on the owner's iPhone, before the build; the build itself in WebKit at iPhone size | the owner opens a page made by the released script from a chat on his iPhone and the cards open |
| The plan page made on Windows | never | `node --test` passes on Windows and `plan-page.js` makes a page there from a plan saved by a Windows editor |
| A real agent following the plan page rules (make it, refresh it after a step, open it on "where are we?") | never | one real project is run through the Plan with the installed skill |
| The Markdown reader against a Pandoc other than 3.12.1, or another CommonMark tool | 0.8.0, Pandoc 3.12.1 only | `tools/blocks-vs-pandoc.js` is rerun when Pandoc or the reader changes |

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
| `SKILL.md` is 163 lines (0.8.0) | the guide for this repository says about 150 at most; it was 160 before the plan page | a pass that moves detail into the references without changing a rule |
| The comparison with Pandoc is run by hand (0.8.0) | a change to `scripts/markdown-blocks.js` could ship with only the recorded sample checked | the release checklist step is followed, or a CI job with Pandoc runs it |
| One existing design-preview test fails on Node.js 26.13.1 | the stand-in browser reads a VM global getter that throws `null` as `undefined`, so the test sees the missing-input message | the preview test harness reproduces browser getter behavior on Node 26 and the full suite passes |

## Deliberate limits

These are choices, not debt. They change only by a new decision.

- English and Arabic only.
- 2 or 3 looks in a preview; six bundled fonts; any other font only online and only on the person's yes.
- The skill writes documents, not code, apart from `DESIGN.md`'s ready values and `data.md`'s ready
  tables.
- The plan page reads the plan's Markdown blocks, not its inline markup: bold, links and character codes
  inside a value are shown as typed. A plan that is not certain to read (ADR 0011) is refused, not drawn.
- Ordinary sub-points nested under a step field stay in `docs/plan.md`. The generated page shows the field
  and its recognized change entries and omits the other sub-points.
- The plan page interprets change entries using the template's separators `→` and `, because` (Arabic
  «إلى» and «، لأن»). Check changes and settled waits count only under the check field. A wait with extra
  unquoted transition separators, such as "waited for A → B since C → not started, because D", is recorded
  as written. Quote the wait name when it contains a transition separator. An invalid change-entry date
  stops generation and the error names the step.
