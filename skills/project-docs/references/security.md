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
- **Data:** every 🔒 personal and 🔐 secret column, with who can see it and how long it's kept. If the data
  document is missing, use the approved PRD and TRD, and confirm anything found in existing code. A missing
  document does not mean nothing is saved: ask about missing data facts, or carry them as `TBD`. Write
  "saves nothing" only when the project's confirmed answers establish that.
- Any `TBD` in those places: carry it over as `TBD`, naming the document that holds it (`- TBD: the hosting,
  see the TRD's Where it lives.`), never fill it in yourself. Security quotes a `TBD`; it never opens one of
  its own.

## The questions (only what is missing: one round, three questions)

1. **Who can get in, and how?** Nobody (it runs on one computer), anyone, or only people who sign in? How do
   they sign in? Are there roles (a patient sees only their own visits; staff see everything)? If someone
   signs in, how is that sign-in protected, and how do they get back in if they are locked out (that answer
   is a line under **Who can get in**)? Suggest the defaults: a password of at least 12 characters, a 15-minute pause after 5 wrong tries, and a second step
   only if the TRD already has the service it needs (otherwise offer it as a TRD change).
2. **Secrets:** the keys and passwords the project needs (a database password, a service key). Where will
   they live? Suggest the default: never in the code and never in git; in environment variables or the
   host's secret store, with `.env` files listed in `.gitignore`. Who can see them, and how is one replaced?
3. **If something goes wrong** (a leak, a break-in, a lost laptop): who is told first, what is done first
   (turn it off, change the keys), and who tells the people whose data was involved?

## How it's protected (never asked: the skill writes it)

Five lines a builder must follow, worked out from the answers above, the TRD and Data. They are not
questions: the person would not know them, and the safe way is the only way. When one does not apply,
its line says so with **None:** and why.

- **Records:** every request for a protected record checks the permissions agreed above: ownership for
  someone limited to their own things, or the approved staff role. Records agreed to be public stay
  public. A link or ID that is hard to guess is not protection.
- **Database:** when the project saves to a database, every query uses placeholders: text people type is
  never glued into the query.
- **Sign-in:** when anyone signs in, sign-in, reset and sign-up tries are limited. When they sign in with
  another company's account ("Sign in with Microsoft"), check that company's signed answer before trusting
  it, and know the person by that company's account ID, never by their email.
- **Connections:** when the product uses a network, use HTTPS/TLS with certificate validation for its
  pages, API and outside-service connections. Never turn certificate checks off. A fully offline tool
  says **None:** it has no network connection.
- **Audit:** when a role can open or change someone else's protected personal records, record the
  necessary actor and affected-record IDs, time, action and outcome. Do not copy secrets or unnecessary
  personal content into the record. A deliberately public doctor list does not trigger this rule.
  These IDs can themselves be personal: Data and **Personal data** must say who sees the audit records,
  how long they are kept, and how they are removed. If this needs Data to change, use the normal change
  loop; do not silently add storage.

When someone signs in, personal or secret data is saved, or an outside service is used, add a few plain
lines under this same heading: what is worth protecting, who is not trusted, and one or two ways it can
go wrong → the protection above or the Plan check that addresses it. Derive them from the agreed
project; ask about a missing fact in its owning document rather than inventing it. Keep these lines
with their protections when a decision changes. No new heading, threat-model file or questionnaire is
needed. A fully offline tool with no saved data keeps its short **None** lines.

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
- **Connections:** <…>
- **Audit:** <…>

<When relevant: what is worth protecting; who is not trusted; one or two risks → protection or Plan check.>

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

إذا وُجد دخول أو حفظ لبيانات شخصية أو سرية أو استخدام لخدمة خارجية، أضف تحت **كيف يُحمى** أسطرًا
قصيرة عمّا يستحق الحماية، ومن لا يُوثق به، وطريقة أو طريقتين لحدوث الضرر ← الحماية أو فحص الخطة.
تُشتق من القرارات المتفق عليها، ولا تضف عنوانًا أو ملفًا أو استبيانًا. الاتصالات تستخدم HTTPS/TLS
مع التحقق من الشهادة؛ لا تُعطّل التحقق. عند فتح أي مستخدم مخوّل لبيانات شخصية محمية تخص غيره أو تغييرها، يسجّل
التدقيق المعرّفات الضرورية للفاعل والسجل والوقت والفعل والنتيجة، دون أسرار أو محتوى شخصي غير لازم.
المعرّفات قد تكون شخصية أيضًا: تُذكر رؤيتها ومدة حفظها وحذفها في البيانات والأمان عبر دورة التغيير
المعتادة. عرض أسماء الأطباء للعامة لا يتطلب هذا التدقيق. الأداة غير المتصلة التي لا تحفظ شيئًا تبقى
على أسطر «لا ينطبق» القصيرة.

```markdown
# الأمان: <اسم المشروع>
> الإصدار 1 · مسودة

## من يستطيع الدخول
- <…>

## كيف يُحمى
- **السجلات:** <…>
- **قاعدة البيانات:** <…>
- **الدخول:** <…>
- **الاتصالات:** <…>
- **التدقيق:** <…>

<عند انطباقه: ما يستحق الحماية؛ من لا يُوثق به؛ خطر أو خطران ← حماية أو فحص في الخطة.>

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
