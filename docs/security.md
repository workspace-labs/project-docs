# Security

project-docs is a set of instructions plus one local web page. It has no accounts, no server, no
database, and collects nothing. This page covers what it touches and what it promises never to do.

## What runs, and where

| Part | Runs | Touches |
|---|---|---|
| `SKILL.md` and references | inside the person's AI tool, as instructions | only the project's documents: `docs/`, `DESIGN.md`, and the TRD pointer line in `AGENTS.md` or `CLAUDE.md` on the person's yes |
| the preview page | in the person's browser, opened from disk | reads `looks.js` next to it; may fetch fonts (below) |
| `node check.js looks.js` | Node.js, on the person's computer | reads one file, prints `ready` or `refused` |
| `tests/` | Node.js, for builders only | reads the repository; `line-endings.test.js` copies the skill into a temporary folder and deletes it afterwards |
| `tools/` | builders only | `font-ranges.js` reads the bundled fonts and, without `--check`, rewrites their coverage lines; `shot-mac.sh` compiles a helper and writes screenshots under `/tmp/project-docs-shot/` |

## The one network call

The preview loads a font from Google Fonts **only** when its name is in `onlineFonts`, and the skill adds
a name there **only** after the person says yes to: "Opening the page downloads a Google Fonts stylesheet
and font files."

- Requests go to `fonts.googleapis.com` (stylesheet) and `fonts.gstatic.com` (font files). Like any web
  request, they show Google the viewer's IP address and that this font was requested. No project words are
  sent.
- A font that does not load within ten seconds ends in a plain refusal, never a silent stand-in font.
- With `onlineFonts` empty, which is the default and both examples, the page makes no outside request.
- The skill itself, the tests and the tools make no network calls.

## How the page protects itself

- **Words are text, never HTML.** `render.js` inserts the project's words with `textContent` only, so a
  name or sample line cannot become markup or script.
- **Values are checked before use.** `check.js` accepts colors only as `#RGB`/`#RRGGBB`, font names only as
  letters, numbers and spaces, and corner sizes only in range. Bad input is refused with a plain reason
  and never crashes the page.
- **`looks.js` is a script.** The browser runs it as code. It is written by the person's own agent in the
  person's own project. Treat a `looks.js` from anywhere else like any other script: read it before
  opening the page.

## Secrets and personal data

- The repository holds no secrets. `.gitignore` keeps `.env` and `.env.*` out.
- The examples use made-up people and places. Real personal data never goes into an example, a test or
  a published file, and no path from the owner's computer goes into anything published (`AGENTS.md`).

## Rules that keep it this way

- The skill never installs anything and never makes a network call, apart from the font case above.
- The preview's checks are never loosened without the owner's yes.
- A new outside request, of any kind, needs a decision record before it is added.

## Reporting a problem

- TBD: where to report a security problem privately. Decided when the owner chooses between GitHub private
  vulnerability reporting and a contact address.
