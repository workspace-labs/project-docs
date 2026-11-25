# Handover: what happens after it is built

For a planned handover, write it before building so the people who will run and care for the project agree early.
Keep it short when the project is simple. When the PRD's **Who decides** says the person builds it for
themselves alone, skip it unless they ask for a maintenance record. If they ask and have no approved
Handover, offer to write one first. The [maintenance record](maintenance.md) holds the dates and results
after handover. This document holds the agreement.

## Contents

Gather first · The questions · The read-back · The document · In Arabic

## Gather first

- **A filled `docs/meeting-form.md`:** its training, handover, running, maintenance, announcing and retiring answers.
- **PRD → Who decides:** the owner and who accepts it are usually who receives it.
- **TRD → Where it lives:** where it will be installed and run, and who can reach it, to suggest a maintenance rhythm.
- **TRD → Running cost:** what is paid to keep it running and who pays it now. Never ask it again: the
  Handover only says who pays and renews from the handover on.
- **Data → How long it's kept:** what happens to the data when the project is retired.
- **Data → If this copy is lost:** where the readable copy is and how much may be lost. Never ask it again:
  the Handover only says who makes that copy.
- **Security → If something goes wrong:** who is told first, to check it matches who looks after it.
- Any `TBD` in those places: quote it with the document that holds it, never fill it in. Who receives,
  runs, supports and pays for it, the visit rhythms, the security fix deadline and the recipient of visit
  results are facts about the client and the agreement with them: never "you pick".
  A "not decided" from the client is a `TBD`.

## The questions

Ask at most 3 questions a round, with drafts built from what you gathered; skip what is already answered.

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
5. **Who runs it day to day?** Who keeps it switched on, checks it works, and makes the copy Data agreed.
   With no Data document, or when Data says the records can easily be typed in again, skip the copy. When that
   decision is open in Data, carry its `TBD` forward.
   When the TRD's **Running cost** names a paid part: who pays it and renews it from the handover on.
6. **Who fixes problems and makes updates after that?** How a problem or a change request reaches them, how
   fast it is answered, and how an update is tested before it goes live.

**Round 3: regular care and retirement**
7. **How often will the light visit and the full visit happen?** Suggest the row that matches the project
   in the [maintenance reference](maintenance.md#suggested-rhythm). Ask what the client agrees to for each.
8. **What is the deadline for a serious security fix, and who gets each visit's results?** Count calendar
   days from when the fix is published. For a fix rated critical or high, Cyber Essentials uses 14 days.
   The NCSC suggests 5 days for internet-facing parts, 7 days for operating systems and applications,
   and 14 days for internal or air-gapped parts. If attackers already use the weakness, agree on a faster
   response. Ask who will receive the results, by name or role.
9. **When would it be retired?** What would end it (a replacement, the end of a contract), who decides, and
   what happens to its data: handed over, kept, or deleted (following Data's "How long it's kept").

If the person does not know yet, write `- TBD: <what is open>. Decided when <what will decide it>.` under
the heading it belongs to. A `TBD` with the exact name of a fixed maintenance line takes that line's place
until it is settled. If the Handover was approved with that `TBD`, keep it and record the confirmed
answer beneath it on a `Changed` line, then follow the normal approval process.

For a client project, ask the client approver named in the PRD's **Who decides** to approve this
Handover. Use the named owner if they have that authority. If it is unclear who can approve it, ask the
client and record the answer in the PRD's existing **Who decides** lines through the normal change
process. The person who signs at handover can be a different person.

## The read-back

> The clinic manager receives the code, a front desk guide and an admin guide, and signs the handover; two
> front desk staff get one hour of training. Patients are told by a poster and a text. For the first four
> weeks the builder fixes problems, and phone booking stops after two weeks. Then the IT lead runs it
> on the clinic's server, backs it up every night, renews the web address the clinic pays for, and
> answers problem reports within one working day. Updates are tried on a copy first. The clinic agrees to
> a light visit every month, a full visit every three months, and serious security fixes within five
> calendar days of release, with a faster response if attackers already use the weakness. The IT lead
> sends the results to the clinic manager. If the system is replaced, patient appointments are exported,
> then deleted once the new system has them. Is that it?

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
- <who runs it day to day, where, and who makes the copy Data agreed (skip the copy when Data needs none)>
- <who pays the running cost and renews the paid parts from the handover on (TRD: Running cost) / None: nothing is paid for>

## Maintenance and updates
- <who fixes problems, how requests arrive, how fast, how updates are tested>
- **Light visit rhythm:** <how often, as agreed with the client>
- **Full visit rhythm:** <how often, as agreed with the client>
- **Serious security fix deadline:** <the agreed number of calendar days from publication of the fix>
- **Visit results go to:** <the agreed name or role>

## Retiring it
- <what would end it, who decides, what happens to the data>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings. An empty heading
says so in one line ("لا شيء: لن يُعلن عنه.").

في مشروع العميل، اطلب اعتماد الوثيقة من الشخص المخوّل من جهة العميل والمذكور في **من يقرر** في PRD.
قد يكون هو المالك إن كانت له هذه الصلاحية، وقد يختلف عن الشخص الذي يوقّع عند التسليم. إذا لم تتضح
جهة الاعتماد، فاسأل العميل وسجّل الإجابة في الأسطر الحالية من **من يقرر** باتباع خطوات التغيير المعتادة.

مواعيد الزيارات ومهلة الإصلاح والجهة التي تتلقى النتائج بنود يُتفق عليها مع العميل. اقترح الوتيرة المناسبة
للمشروع من [مرجع الصيانة](maintenance.md)، واسأل العميل عمّا يوافق عليه. تُحسب مهلة الإصلاح بالأيام
التقويمية من تاريخ صدوره. اسأل ثلاثة أسئلة على الأكثر في كل جولة. إذا لم يُحسم بند، فاستخدم اسمه كما
يظهر أدناه في سطر يحلّ محلّه، مثل `- لم يُحسم بعد: <البند>. يُحسم عندما <شرط الحسم>.` إذا اعتُمدت وثيقة
التسليم بهذا السطر، فأبقِه وأضف الإجابة التي أُقرّت تحته في سطر «تغيّر»، ثم اتبع خطوات الاعتماد المعتادة.

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
- <من يشغّله يوميًا، وأين، ومن يأخذ النسخة التي اتفقت عليها البيانات (تجاوز النسخة إذا لم تحتج إليها البيانات)>
- <من يدفع تكلفة التشغيل ويجدّد الأجزاء المدفوعة بعد التسليم (TRD: تكلفة التشغيل) / لا شيء: لا يُدفع شيء>

## الصيانة والتحديثات
- <من يصلح المشكلات، وكيف تصل الطلبات، وبأي سرعة، وكيف تُختبر التحديثات>
- **وتيرة الزيارات الخفيفة:** <الفاصل بين الزيارات كما اتُّفق عليه مع العميل>
- **وتيرة الزيارات الشاملة:** <الفاصل بين الزيارات كما اتُّفق عليه مع العميل>
- **مهلة معالجة الثغرات الأمنية الخطيرة:** <عدد الأيام التقويمية المتفق عليه من تاريخ صدور الإصلاح>
- **تُرسل نتائج كل زيارة إلى:** <الاسم أو الوظيفة المتفق عليها>

## إيقافه
- <ما الذي ينهيه، ومن يقرر، وماذا يحدث للبيانات>
```
