# Making a release

> Status: Proposed. Steps 1–7 write down what releases 0.1.0–0.2.2 already did. Steps 8–9 (tag and
> GitHub release) are new and wait for the owner's yes.

project-docs uses semantic versioning: a fix is `0.2.x`, a new behaviour or document section is `0.x.0`.
Every change after 0.1.0 is a release (see `AGENTS.md`).

## Steps

1. **Run the checks** from the repository root, Node.js 18 or newer:

   ```bash
   node --test
   node tools/font-ranges.js --check
   ```

   All tests pass, none skipped. Note the test count.

2. **Look at the preview** after any change to `assets/preview/`: open it with each example `looks.js` at
   computer and phone width, or on a Mac run `tools/shot-mac.sh <looks.js>`. Both examples must say `ready`.

3. **Bump the version once** in `README.md` (the `Version x.y.z · N tests` line). Update the test count
   there too.

4. **Add a dated `CHANGELOG.md` entry**: `## [x.y.z] - YYYY-MM-DD`, with Added / Fixed and a Verification
   paragraph saying what ran, where, and the test count.

5. **Update `TESTING.md`**: the "Last verified" line, a dated section for this version, and what was *not*
   rerun. Older sections stay as history.

6. **Build the upload zip and check it.**

   macOS or Linux:

   ```bash
   rm -f dist/project-docs.zip && mkdir -p dist
   (cd skills && zip -r -X ../dist/project-docs.zip project-docs -x '*.DS_Store')
   ```

   Windows PowerShell:

   ```powershell
   New-Item -ItemType Directory -Path '.\dist' -Force | Out-Null
   Compress-Archive -LiteralPath '.\skills\project-docs' -DestinationPath '.\dist\project-docs.zip' -Force
   ```

   The zip has one `project-docs/` root, and no tests, PDFs or `.DS_Store` files. Record its file count
   in `TESTING.md` (75 at 0.2.2). `dist/` is never committed.

7. **Commit and push only on the owner's word.** No path from the owner's computer goes into anything
   published.

8. **Tag the release** (Proposed): `git tag -a vx.y.z -m "project-docs x.y.z"`, then push the tag.

9. **Publish a GitHub release** (Proposed) for the tag: the CHANGELOG entry as its notes, with
   `project-docs.zip` attached for Claude app users.

## Rolling back

Decide this before releasing: the rollback point is the previous version.

- **The repository:** revert the release commit; never rewrite published history.
- **A user's install:** reinstall the previous version's `skills/project-docs/` folder, or upload the
  previous release's zip. Until tags exist (none do as of 0.2.2), the previous version is the commit
  before the release commit.
- **Users' documents** need nothing: the skill writes plain Markdown, and a stamp or `Changed` line written
  by one version stays valid for the next. A release that changes a heading contract says so in its
  CHANGELOG entry, because older documents will still have the old heading.
