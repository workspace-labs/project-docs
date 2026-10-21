# Data: what it saves

Only when the project saves something. It maps every "sheet" (users, orders, messages…), what each
column holds, how the sheets link, and **where personal and secret data lives**, so it gets protected.
It is written as plain tables a non-developer can read, then one ready block for the AI.

## Contents

The first question · Gather first · The questions · The read-back · The document · In Arabic

## The first question

**"Does this project save anything?"** (accounts, orders, messages, settings, files…). Skip it when the
PRD already answers it (a "must do" line that keeps orders means yes).

- **No** → write no data document. Tell the person, and go on to Security (which then says "saves nothing").
- **Yes** → go on.

## Gather first

- The approved PRD: each "must do" line hints at what is saved ("book a visit" → visits, patients).
- The TRD's **Data storage** choice: it decides the ready block. If it is `TBD`, the ready block waits.
- Tables, models or migrations already in the code: offer them as `(found in code)`.

## The questions

**Round 1: the sheets.** Propose them from the PRD and let the person shape the list:
"I see 4 sheets: Patients · Doctors · Visits · Staff. Keep them, add one, remove one, or rename?"

**Then the sheets, 2 or 3 a round, one question each.** For each sheet, show your proposal as a small
table and ask the person to confirm or change it: what one row is, the columns, the marks, who can see it
(when that differs by column, say which columns each audience sees), and how long a row is kept. For example:

> **Orders** (one row = one order): customer name 🔒, phone 🔒, items, pickup day. Only you see it; kept until
> the Saturday after pickup. Right, or change something?

- **Columns:** propose them from the PRD. Each one must serve a "must do" line, so never add one "just in
  case". Then walk each "must do" line and check it has every column it needs (a total per item needs a
  price, if the PRD shows money).
- **Marks:** point out every column that is 🔒 **personal** (a name, a phone number, an email, an ID number,
  a birth date, a location, health or money details, or a link to one person such as `patient_id`) or
  🔐 **secret** (a password, a sign-in code, a key, a token). A name is personal even when it is shown to
  everyone on purpose (a doctor's name on the booking page): the mark says it identifies someone, and
  "who can see it" says who may.
- **How long it's kept:** for a sheet with nothing personal in it (a menu), propose "as long as the project
  runs". If the person doesn't know, write `TBD` and Security will carry it.
- **Linked rows:** when a sheet points at another (`book_id`), ask what happens to its rows when the row they
  point at is removed: they go with it, or they stay. Write the answer under **How the sheets link**.

Secrets are never saved as they are: a password or a sign-in code is saved only as a scrambled copy (a hash)
that cannot be turned back. Say this plainly when you mark a 🔐 column.

## The read-back

> It saves 4 sheets. Patients (name and phone, both personal), Doctors, Visits (who, which doctor, when),
> Staff (from the clinic's Microsoft login). Front desk sees everything; a patient sees only their own
> visits. Visits are kept two years. Is that it?

## The document

Write exactly these headings, in this order. Under **Sheets**, give each sheet its own `###` heading with its
name in the code in brackets (`### Orders (orders)`), its table and its two lines. In the table, the **Mark** column holds `🔒 personal`, `🔐 secret` or `–`.

````markdown
# Data: <Project name>
> v1 · Draft

## What it saves
<One or two sentences, then the sheets in one line.>

## Sheets

### <Sheet name> (<code name>)
One row is <…>.

| Column | Holds | Example | Mark |
|---|---|---|---|
| <name> | <what it holds> | <a made-up example> | <🔒 personal / 🔐 secret / –> |

- **Who can see it:** <…>
- **How long it's kept:** <…>

## How the sheets link
- <Each Visit belongs to one Patient and one Doctor.>

## Ready block
<For the database the TRD locked: the tables as code, in one code block.
If the TRD's data storage is still TBD, write only:
"Waits: the TRD's data storage is still TBD.">
````

When an approved database choice changes or reopens, preserve the exact superseded generated ready block
in a collapsed `<details data-project-docs-history>` record at the end of **How the sheets link**, outside
the active **Ready block**.
Label it as historical, with the superseding date and "do not build from this" (translate the label in an
Arabic document), and add a dated `Changed` line saying why it was superseded. The active **Ready block**
holds only the current code, or exactly the waiting sentence above while storage is TBD. Raise the
version and return to Draft. Keep the sheets, columns, marks and links unless the decision affects them.

Examples in the tables are always made up: never a real person's name, phone number or email.

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings and fixed words.
Table and column names stay in English, as they will be in the code: put the table's code name in brackets
after its Arabic name.

| English | Arabic |
|---|---|
| `🔒 personal` | `🔒 شخصي` |
| `🔐 secret` | `🔐 سري` |
| `Waits: the TRD's data storage is still TBD.` | `ينتظر: تخزين البيانات في TRD لم يُحسم بعد.` |

````markdown
# البيانات: <اسم المشروع>
> الإصدار 1 · مسودة

## ما يحفظه
<جملة أو جملتان، ثم الجداول في سطر واحد.>

## الجداول

### <اسم الجدول> (<اسمه في الكود>)
الصف الواحد هو <…>.

| العمود | يحمل | مثال | العلامة |
|---|---|---|---|
| <name> | <ما يحمله> | <مثال مختلَق> | <🔒 شخصي / 🔐 سري / –> |

- **من يستطيع رؤيته:** <…>
- **مدة الاحتفاظ به:** <…>

## كيف ترتبط الجداول
- <كل موعد يخص مريضًا واحدًا وطبيبًا واحدًا.>

## الكود الجاهز
<الجداول بلغة قاعدة البيانات التي حسمها TRD، في كتلة كود واحدة،
أو فقط: «ينتظر: تخزين البيانات في TRD لم يُحسم بعد.»>
````
