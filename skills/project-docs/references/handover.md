# Handover: what happens after it is built

Written before building, like the others, so the people who will receive, run and look after the project
agree on it now, not on the last day. Short when simple. Only for a project that is handed to someone: when
the PRD's **Who decides** says the person builds it for themselves alone, skip this document.

## Contents

Gather first · The questions · The read-back · The document · In Arabic

## Gather first

- **A filled `docs/meeting-form.md`:** its training, handover, running, announcing and retiring answers.
- **PRD → Who decides:** the owner and who accepts it are usually who receives it.
- **TRD → Where it lives:** where it will run, so where it is installed and run from.
- **Data → How long it's kept:** what happens to the data when the project is retired.
- **Security → If something goes wrong:** who is told first, to check it matches who looks after it.
- Any `TBD` in those places: quote it with the document that holds it, never fill it in. Who receives,
  runs, supports and pays for it are facts about the client and the agreement with them: never "you pick".
  A "not decided" from the client is a `TBD`.

## The questions

Ask at most 3 questions a round, with drafts built from what you gathered; skip what is already answered.
Round 2 has four questions, so it takes two rounds when none is answered yet.

**Round 1: handing it over**
1. **What is handed over?** The code (who owns it, and where it will live), the documents (a user guide, an
   admin guide, the API guide when the Plan has one), accounts and keys (handed over safely, never written
   here), and training: who is trained, how, how long.
2. **Who receives it, and who signs the handover?** A name or a job.
3. **Is it announced?** Who is told it exists (staff, customers, the public), how, and by whom. "Not
   announced" is an answer.

**Round 2: after the handover**
4. **The first weeks after go-live:** who fixes problems at first (often the builder), for how long, and
   when the old way (a paper list, a spreadsheet) stops.
5. **Who runs it day to day?** Who keeps it switched on, checks it works, and makes the backups, and where.
6. **Who fixes problems and makes updates after that?** How a problem or a change request reaches them, how
   fast it is answered, and how an update is tested before it goes live.
7. **When would it be retired?** What would end it (a replacement, the end of a contract), who decides, and
   what happens to its data: handed over, kept, or deleted (following Data's "How long it's kept").

If the person does not know yet, write `- TBD: <what is open>. Decided when <what will decide it>.` under
the heading it belongs to.

## The read-back

> The clinic manager receives the code, a front desk guide and an admin guide, and signs the handover; two
> front desk staff get one hour of training. Patients are told by a poster and a text. For the first four
> weeks the builder fixes problems, and phone booking stops after two weeks. Then the IT lead runs it
> on the clinic's server, backs it up every night, and fixes problems within one working day; updates are
> tried on a copy first. If it is replaced, visits are exported, then deleted once the new system has them. Is that it?

## The document

Write exactly these headings, in this order. A heading with nothing under it says so in one line
("None: it is not announced.").

```markdown
# Handover: <Project name>
> v1 · Draft

## What is handed over
- <the code: who owns it, where it lives>
- <documents, accounts and keys (how, never the keys themselves), training>

## Who receives it
- <who receives it, and who signs the handover>

## Announcing it
- <who is told, how, by whom / None>

## First weeks after go-live
- <who fixes problems at first, for how long; when the old way stops>

## Running it
- <who runs it day to day, where, backups>

## Maintenance and updates
- <who fixes problems, how requests arrive, how fast, how updates are tested>

## Retiring it
- <what would end it, who decides, what happens to the data>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings. An empty heading
says so in one line ("لا شيء: لن يُعلن عنه.").

```markdown
# التسليم وما بعده: <اسم المشروع>
> الإصدار 1 · مسودة

## ما يُسلَّم
- <الكود: من يملكه، وأين يُحفظ>
- <الوثائق، الحسابات والمفاتيح (كيف تُسلَّم، لا المفاتيح نفسها)، التدريب>

## من يستلمه
- <من يستلمه، ومن يوقّع على التسليم>

## الإعلان عنه
- <من يُبلَّغ، وكيف، ومن يبلّغه / لا شيء>

## الأسابيع الأولى بعد الإطلاق
- <من يصلح المشكلات في البداية، ولأي مدة؛ ومتى تتوقف الطريقة القديمة>

## تشغيله
- <من يشغّله يوميًا، وأين، والنسخ الاحتياطية>

## الصيانة والتحديثات
- <من يصلح المشكلات، وكيف تصل الطلبات، وبأي سرعة، وكيف تُختبر التحديثات>

## إيقافه
- <ما الذي ينهيه، ومن يقرر، وماذا يحدث للبيانات>
```
