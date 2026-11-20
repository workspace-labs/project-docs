# The reader page

Markdown is written for the AI and is hard for a person to read: small text, marks like `#` and `**`, and
long lists. The reader page shows the seven planning documents (the PRD, TRD, DESIGN.md, Data, Security,
Handover and Plan, whichever the project has; not the client meeting form) as a calm page of panes, so the person reads the
page and never the raw files. The Markdown files stay the source of truth; the page is made from them and
never changes them.

## Make it and keep it current

```bash
node scripts/read-page.js <project folder>        # writes <project folder>/docs/read.html
```

Run it from the skill folder, with the path to the project. It needs Node.js 18 or newer and nothing else;
never install Node.js for it. If Node.js is missing, say so once and go on: the documents are complete
without the page.

- Refresh it **each time a document is written, approved or changed** the normal way, and after every
  Plan step change, together with the plan page.
- Open it when the person asks to read or see the documents, or "show me the docs". Showing the documents
  never edits a document: run the script, open the page, and stop.
- Tell the person if the script refuses. A source error names the document and gives the line when the
  Markdown is malformed. A project error can mean there are no planning documents. An output error
  can mean the destination is a folder or a file the script cannot refresh.
- Open the page named by `Previous reader page` and say it is out of date. If the script says
  `Reader unavailable`, report that the reader is unavailable.
- Correct Markdown through the ordinary document change process. Get the person's yes, follow the locks
  and `Changed` lines, make a new version, and stamp it `Draft` until it is approved again. Then refresh
  the reader with the script.
- The script creates a new `.html` file or refreshes a complete reader page at that path. It leaves other
  files as they are, including empty files, documents under another name, and links. Inside the project
  the output path must go through plain folders.

## What it shows

- **The Overview:** the project's name, counts (documents, approved, must-do items, open questions, steps
  checked), every document with its stamp, every open `TBD`, the plan step in hand and the plan's
  progress. Select a document or an open question to open the document at its top.
- **On a phone (820 px or narrower):** the Overview puts the title and counts above a full-width
  document list. Each row shows its icon, name, short description and stamp. Rows with open questions
  show a count.
  Open questions, the current step and plan progress follow the list. Use **‹ Overview**
  (**‹ نظرة عامة** in Arabic) above a document's title to return to the Overview.
- **On a computer:** the document tiles stay in the side panel. The tiles, document and question rows,
  and **Open the plan** all use the same in-page links.
- **With a keyboard.** Focused links and disclosure summaries show a ring. Press Enter on a link to
  open the view and move focus to its article.
- **One view per document:** its stamp, its counts, and each section as a pane. `Label: value` lines become
  small tiles; `TBD` lines are marked open or settled, as their latest change says; `Check:` and `Changed` lines sit under the line
  they belong to; tables keep their rows, with a colour square beside each hex colour; plan steps fold
  shut to their title and state, and the step waiting for the person's check starts open.
- Every word of every planning document is on the page, in its own view, in order: nested lists, quotes,
  tables and numbered lists keep their shape. Code blocks keep their literal text after the surrounding
  quote and list prefixes. A history disclosure ends at its matching closing tag. Tags inside fenced
  samples and HTML comments stay literal.
- A `Changed` line belongs to its nearest enclosing `TBD` in the same quote scope. Enclose values that
  contain the transition or reason separator in quotes or backticks. The latest change in document order
  settles the question or reopens it when the new value is `TBD`.
- Badges, progress and the current-step card use the same visible steps from the Plan's Steps section.
  Their states come from the plan page's own reading. If it cannot read the plan, the reader shows why.
- The approval stamp belongs directly below the whole title, including the underline of a setext title.
- English and Arabic: an Arabic project gets a right-to-left page with an Arabic font inside it.
- The reader uses plain HTML and CSS with its fonts embedded, so it works offline with JavaScript
  disabled. **WorkSpace Labs** sits at the bottom.

The page shows only what the documents say. It never decides a state the documents do not write: a step
is checked only when its Status line says `✅`.
