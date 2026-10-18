# Security: one page

Always written, for every project. When the project is simple it is short ("nobody logs in, it saves
nothing, it talks to nothing"), and that short page still proves someone checked. Most of it is gathered
from the TRD and Data; only three things are new questions.

## Contents

Gather first · The questions · How it's protected · The read-back · The document · In Arabic

## Gather first

- **TRD → Work rules:** every security rule the workplace set.
- **TRD → Outside services:** everything the project talks to over the internet, and what it sends there.
  When the hosting company keeps personal data (the TRD's "Where it lives"), it is an outside service too.
- **Data:** every 🔒 personal and 🔐 secret column, with who can see it and how long it's kept. No data
  document means the project saves nothing.
- Any `TBD` in those places: carry it over as `TBD`, never fill it in yourself.

## The questions (only what is missing: one round, three questions)

1. **Who can get in, and how?** Nobody (it runs on one computer), anyone, or only people who sign in? How do
   they sign in? Are there roles (a patient sees only their own visits; staff see everything)? If someone
   signs in, how is that sign-in protected, and how do they get back in if they are locked out? Suggest the
   defaults: a password of at least 12 characters, a 15-minute pause after 5 wrong tries, and a second step
   only if the TRD already has the service it needs (otherwise offer it as a TRD change).
2. **Secrets:** the keys and passwords the project needs (a database password, a service key). Where will
   they live? Suggest the default: never in the code and never in git; in environment variables or the
   host's secret store, with `.env` files listed in `.gitignore`. Who can see them, and how is one replaced?
3. **If something goes wrong** (a leak, a break-in, a lost laptop): who is told first, what is done first
   (turn it off, change the keys), and who tells the people whose data was involved?

## How it's protected (never asked: the skill writes it)

Three lines a builder must follow, worked out from the answers above, the TRD and Data. They are not
questions: the person would not know them, and the safe way is the only way. When one does not apply,
its line says so with **None:** and why.

- **Records:** when anyone sees only their own things, every request for a record checks that the
  signed-in person owns it. A link or ID that is hard to guess is not protection.
- **Database:** when the project saves to a database, every query uses placeholders: text people type is
  never glued into the query.
- **Sign-in:** when anyone signs in, sign-in, reset and sign-up tries are limited. When they sign in with
  another company's account ("Sign in with Microsoft"), check that company's signed answer before trusting
  it, and know the person by that company's account ID, never by their email.

## The read-back

> Staff sign in with Microsoft 365; patients with a code by text and see only their own visits. Keys live in
> the server's environment, never in git. Personal data: patient names and phones, staff emails. If
> something goes wrong, tell the IT lead first and change every key; the clinic manager tells patients.
> Is that it?

## The document

Write exactly these headings, in this order. Under **Personal data**, name every 🔒 and 🔐 column from the
Data document as `sheet.column`. A heading with nothing under it says so in one line ("None: it saves
nothing.").

```markdown
# Security: <Project name>
> v1 · Draft

## Who can get in
- <…>

## How it's protected
- **Records:** <…>
- **Database:** <…>
- **Sign-in:** <…>

## Secrets
- <…>

## Personal data
- <sheet.column (🔒 personal / 🔐 secret): who can see it, how long it's kept>

## Outside services
- <service: what it receives>

## Work rules
- <…>

## If something goes wrong
- **Tell first:** <…>
- **Do first:** <…>
- **Tell the people affected:** <…>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings. Column names stay
as they are in the Data document (`patients.phone`), with the Arabic marks `🔒 شخصي` and `🔐 سري`. A line that does not apply starts with `لا ينطبق:`. An empty
heading says so in one line ("لا شيء: لا يحفظ شيئًا.").

```markdown
# الأمان: <اسم المشروع>
> الإصدار 1 · مسودة

## من يستطيع الدخول
- <…>

## كيف يُحمى
- **السجلات:** <…>
- **قاعدة البيانات:** <…>
- **الدخول:** <…>

## الأسرار
- <…>

## البيانات الشخصية
- <sheet.column (🔒 شخصي / 🔐 سري): من يراها، ومدة الاحتفاظ بها>

## الخدمات الخارجية
- <الخدمة: ما تستقبله>

## قواعد العمل
- <…>

## إذا حدث خطأ
- **أخبر أولًا:** <…>
- **افعل أولًا:** <…>
- **أخبر المتأثرين:** <…>
```
