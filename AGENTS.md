# AGENTS.md: working on project-docs

For coding agents changing this repository. What the skill does is in `README.md`; what it must never do
is in `docs/scope.md`, and why it is built this way is in `docs/adr/`.

## Test

```bash
cd project-docs     # your clone
node --test
```

Node.js 18 or newer, for the tests only. The skill itself needs nothing but an AI tool and a browser.

## Look at the preview

The tests check the preview's rules, and run the page's own scripts in a stand-in for a browser (ready or
refused, and why). They cannot see the page. After any change to `assets/preview/`, open
it with an example `looks.js` and look at it at computer and phone width, or on a Mac run
`tools/shot-mac.sh <looks.js>` (it prints ready or refused with every problem, and writes `wide.png` and
`phone.png` to `/tmp/project-docs-shot/`).

## Rules for this repository

- Keep `skills/project-docs/` clean: it is installed and uploaded as it is. No test files, no drawn PDFs.
- `SKILL.md` stays a short menu (about 150 lines at most). Anything about one document belongs in its
  `references/<document>.md`.
- The headings in each reference file are a contract: the examples and the tests follow them. Change all
  three together.
- The preview page's look and its contrast check are the owner's decisions: never loosen the check or change
  the page's look without his yes.
- After the first release (0.1.0), every change bumps the version in `README.md` and adds a dated
  `CHANGELOG.md` entry.
- Never commit or push without the owner's word. Never put a path from the owner's computer in anything
  published.
