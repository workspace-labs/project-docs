# How project-docs was tested

project-docs was not just written. It was tested, run blind by fresh agents, and then reviewed by a second
AI that tried to break it. Every problem it found was fixed before release. This page lists what was run and
what was found, and is honest about what has not been tried yet.

## At a glance

| What | Result |
|---|---|
| Automated tests | **94**, all passing on Node.js 18, 20 and 22 (72 for the documents, 22 for the preview page) |
| Independent review | **7 rounds** by a second AI (OpenAI Codex), which read the code and tried to break it. **Approved** on 2026-10-08 |
| Problems the review found | **9**: 8 medium, 1 low. **All fixed** |
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
  else is refused, with every reason listed.

Every fix from the review left a test behind, so the same bug cannot come back silently.

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

- Windows, and Chrome, Edge and Firefox (the preview was checked in WebKit and in the stand-in browser)
- Loading fonts online from Google Fonts (all checks used the bundled fonts)
- A brand-new person using it on a real project of their own
- AI tools other than Claude Code: Claude in the browser, Codex, Copilot, and Cursor as the agent using the
  skill
