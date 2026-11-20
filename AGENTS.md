# AGENTS.md: working on project-docs

For coding agents changing this repository. What the skill does is in `README.md`; what it must never do
is in `docs/scope.md`, and why it is built this way is in `docs/adr/`.

## Test

```bash
cd project-docs     # your clone
node --test
```

Node.js 18 or newer, for the tests. Writing and reading the documents needs nothing but an AI tool, and the
pages open in any browser. Making or refreshing the plan page (`scripts/plan-page.js`) or the reader page
(`scripts/read-page.js`) also uses Node.js 18 or newer; the skill never installs it.

The reader page's look (the owner's Pearl design) is the owner's decision, like the preview's: never change
it without his yes. After a change to `scripts/read-page.js`, regenerate each example's `docs/read.html`
(`node skills/project-docs/scripts/read-page.js skills/project-docs/examples/<example>`) and look at one
at computer and phone width.

## Look at the preview

The tests check the preview's rules, and run the page's own scripts in a stand-in for a browser (ready or
refused, and why). They cannot see the page. After any change to `assets/preview/`, open
it with an example `looks.js` and look at it at computer and phone width, or on a Mac run
`tools/shot-mac.sh <looks.js>` (it prints ready or refused with every problem, and writes `wide.png` and
`phone.png` to `/tmp/project-docs-shot/`).

## Check the plan page's Markdown reading against Pandoc

`scripts/markdown-blocks.js` must read a plan's block structure exactly as CommonMark does, or refuse it with
the line number; it must never guess. The tests replay a recorded sample, but they cannot make new cases.
After any change to that file, with Pandoc installed, run

```bash
node tools/blocks-vs-pandoc.js 5000 1     # 5000 generated texts, seed 1; try several seeds
```

Every text the script does not refuse must come out the same as `pandoc -f commonmark` reads it. A real
difference is a bug, or a form that tools read differently and that the script must refuse. Record
`tests/fixtures/markdown-blocks/pandoc-sample.json` again (`--record`) only from a run with no difference.

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
