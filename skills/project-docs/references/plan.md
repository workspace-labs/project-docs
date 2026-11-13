# The Plan: small steps

The last document. It turns the approved documents into small steps in order, each one ending with
something the person can see work. It always says where the work stopped, so any AI on any computer can
continue from there.

## Contents

Gather first · How to make the steps · Delivery steps · The status of a step · The read-back · The document · In Arabic

## Gather first

- **PRD → What it must do:** every `M` line must be covered by at least one step.
- **Every open `TBD`**, in any document: a step that needs it is blocked. A back end (anything under the
  TRD's **Brain** that is not `None`) adds one step of its own, after the steps that build the back end:
  write the API guide, `docs/api.md` (written during the build, never up front).
- **PRD → Who decides** and the **Handover** document: they decide the delivery steps (below).
- **Design, Data, Security:** the look is used from the first screen; tables and secrets go in the step
  that first needs them.
- An existing `docs/plan.md`: keep its steps and progress history; update only statuses and checks affected
  by a changed decision, and add only what is missing.

## How to make the steps

- **Step 1 is the thinnest version that works end to end**: one real path from start to finish, even if
  plain (one doctor, one day, one booking that really saves and really shows up). When the meeting form
  says what the client wants to try first, that is the path.
- **Each step finishes in one sitting** and ends with something the person can **try**, not just "code
  written".
- **Each step names what it covers:** the PRD lines (`M1, M4`), or the TRD rule (`TRD: Languages`).
- **Each step has its check:** "How we know it works", a test the person can do themselves.
- **Engineering work belongs in these same steps.** When an approved TRD, Data or Security rule needs
  implementation or verification, cite that rule in **Covers** and put the expected result/evidence in
  **How we know it works**. Use only checks the project needs; do not add a separate checklist document or
  invent feature IDs. Later, the builder or reviewer records the real run and outcome beneath that check;
  proposed checks are not proof. For a handoff after approval, see [engineering-handoff.md](engineering-handoff.md).
- **Add applicable checks to the step that needs them, not new document types.** Reuse the approved
  answers; if a missing choice affects the check, settle it in its owning document through the normal
  `TBD` and approval process. Keep these within **Covers** and **How we know it works**:
  - Saved data that cannot reasonably be recreated: before first entrusting it to the product, restore
    a backup into a separate safe copy and read the records back; never overwrite live data for a test.
  - Someone besides the author will run it: when it becomes runnable, write the README how-to and try
    its instructions as that user.
  - It is deployed or distributed beyond the builder's computer: that step names how to release it,
    how to return to the previous working release and what happens to saved data; try the rollback on
    a safe copy before release.
  - It collects personal data from its users: the owner supplies the notice shown before collection;
    check that the product shows the supplied text. Do not draft a legal policy, infer a legal duty,
    create `docs/privacy.md` or block unrelated work while that text is awaited.
  - An outside service is used: the step that connects it tries the agreed expected response and
    failure behavior from the TRD. A Security threat or audit rule gets its corresponding check there.
  A tiny offline project with no saved data gets no restore, service, notice or deployment check merely
  because these examples exist. These are proposed checks; actual run results come from the builder or
  reviewer, and only the person marks them checked.
- An unchecked step that needs a `TBD` choice gets the status `⛔ waits for TBD: <the words of that TBD line>`: exactly
  the words between `TBD:` and `. Decided when`, never shortened, so the open choice can be found. If it
  needs more than one, name the first in document order (PRD, TRD, Design, Data, Handover); the step's
  check says what else it waits for. A step that itself
  settles the TBD (signing up for a host decides the account) is not blocked: it says so in its check.
- **Personal data stays private from the first step.** A step that shows personal data to anyone comes
  after, or includes, the sign-in that protects it; until then it runs only on the builder's computer.
- **Every "only their own" rule gets a try with two people.** When Security says someone sees or changes
  only their own data, the step that builds it checks it with two accounts: signed in as A, try to open,
  change and delete B's data; each try is refused, and B's data is unchanged. The same when only one role
  may see or change something: signed out, or signed in as anyone else, each of its pages and actions is
  refused.
- **If a `TBD` blocks step 1, nothing can be built.** Say so plainly before asking for approval, and offer to
  settle it now (back in the document it belongs to) or to start with a step that doesn't need it.

## Delivery steps

When the PRD's **Who decides** names people (not "alone"), the plan carries these fixed steps. Each title
starts with its fixed name, exactly as written here, and may add a few words after a colon
(`### Step 2: Prototype: the front desk lead tries booking`).

| Step | Where | Covers | Its check |
|---|---|---|---|
| **Prototype** | right after step 1, only when the project has screens | PRD: Who decides | the person who approves the prototype tries step 1's path and says go on, or what to change |
| **Functional test** | after the building steps | every `M` line | every step's check run again in one go, plus every link to another system the TRD names |
| **Security test** | next | Security | every line of the Security page tried, ideally by someone who did not build it; every "only their own" try refused |
| **Acceptance test (UAT)** | next | PRD: How we know it worked | on a test copy the testers can reach (a test server at the client, or the builder's computer), the tester the PRD names runs every `M` line's Check and every "How we know it worked" check that can be tried now, with real users; the one who signs, signs it off |
| **Guides and training** | next | Handover | the guides the Handover document lists are written, and the training is held |
| **Install** | next | TRD: Where it lives | installed on the place the TRD names (the client's network or servers), with its secrets in place |
| **Live test** | next | TRD: Where it lives | the main checks run again there, on the real network, by the client |
| **Go-live** | next | Handover | the announcement goes out, people start using it, the old way stops as the Handover says; a "How we know it worked" check that needs time is looked at when its time comes |
| **Handover** | last | Handover | everything under "What is handed over" is delivered, and the person who receives it signs |

**A prototype never waits for the database.** When step 1 waits for a `TBD` the screens do not need (most
often the data storage), the Prototype comes first instead, as step 1: the same path on the builder's
computer, with made-up data kept only in the screens, and its check says so.

When the PRD has dates under **Dates and budget**, a delivery step may carry `- **Target:** <a week or a date>` above its Status.
An open `TBD` blocks them like any step (an Install waits for an open hosting); the Handover step waits for
every open `TBD` in the Handover document. These steps are ticked only by the person, like every step: a
sign-off is theirs to record, never the builder's.

Propose the steps, then ask in one round: "Right order? Anything missing, too big or not needed?"

## The status of a step

Exactly one of these, on the step's **Status** line:

| Status | Means | Who sets it |
|---|---|---|
| `not started` | nothing done yet | the AI, when writing the plan |
| `⛔ waits for TBD: <what>` | it needs a choice a document left open | the AI; back to `not started` once that choice is made |
| `◐ waiting for your check (ran: <what you ran>, <date>)` | built, and its check was run | the AI, **only after running the check** |
| `✅ checked <date>` | the person tried it and it works | **only the person**: the AI types it only when the person says it works |

**The builder never marks its own homework.** Never write `✅` because the code looks right or the tests
pass. If the person says it does not work, set the step back to `not started` with one line saying why.

When a choice reopens, keep already checked steps as historical progress; they do not approve the revised
choice. Block affected unchecked steps, including ones waiting for the person's check. Keep any earlier
run and its date as historical text beneath the step's check, with only one current Status line. When
several choices block a step, keep its existing open TBD label first and name the others in its check.

When the choice a step waited for is settled, set its Status back to `not started` and keep the wait as one
line under its check: `  - Changed <date>: waited for <what> → not started, because <the document> settled it
as <the choice>.` The words `⛔ waits for TBD:` appear only on a Status line, never in a history line: they
are how a waiting step is found.

Ordinary execution progress changes the status without changing the version or stamp. Changes caused by
a revised approved decision (including new blockers or revised checks), or adding, removing or reordering
steps, follow SKILL.md: preserve the decision history, raise the version, and return the plan to Draft.

## The read-back

> 17 steps. Step 1: a patient books a visit with one doctor and it shows on the front desk list, then the
> front desk lead tries it as the prototype. Then the full list, staff sign-in, patient sign-in, moving and
> cancelling, the reminder (these three wait for the text-message service), the API guide and Arabic. Then
> delivery: functional test, security test, UAT by the front desk lead on a test copy, guides and training,
> install on the clinic's server, live test, go-live by early December, handover to the clinic manager.
> Is that it?

## The document

Write exactly these headings, in this order. Each step has its own `###` heading and these three lines
(a delivery step may add its **Target** line above the Status).

```markdown
# Plan: <Project name>
> v1 · Draft

## How to read it
Steps run in order. Status: not started · ⛔ waits for a TBD choice · ◐ built, waiting for your check · ✅ checked by you.

## Steps

### Step 1: <something you can see work>
- **Covers:** <M1, M4 / TRD: …>
- **How we know it works:** <a check the person can try>
- **Status:** not started
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings, these exact
statuses and these delivery step names. Keep `M1`, `M4` and `TRD` as they are.

العمل الهندسي الذي تتطلبه قاعدة معتمدة في TRD أو البيانات أو الأمان يبقى في الخطوات نفسها: اذكر
القاعدة تحت **تغطي** والنتيجة والدليل المطلوبين تحت **كيف نعرف أنها تعمل**، دون وثيقة فحص إضافية أو
معرّفات متطلبات مخترعة. يسجّل المطوّر أو المراجع التنفيذ الحقيقي ونتيجته تحت الفحص لاحقًا؛ الفحص
المقترح ليس دليلًا على نجاحه. لا تضف فحصًا لا يحتاجه المشروع.

أضف الفحوص المشروطة إلى الخطوة التي تحتاجها، داخل **تغطي** و**كيف نعرف أنها تعمل**، دون أنواع وثائق
جديدة. أعد استخدام الإجابات المعتمدة؛ وإذا غاب قرار يؤثر في الفحص، فاحسمه في وثيقته بالطريقة
المعتادة مع «لم يُحسم بعد» والاعتماد:
- بيانات محفوظة لا يمكن إعادة إنشائها عمليًا: قبل الاعتماد على المنتج لحفظها، استعد نسخة احتياطية
  في نسخة آمنة منفصلة واقرأ السجلات مجددًا؛ لا تستبدل البيانات الحية للاختبار.
- سيشغّله شخص غير مؤلفه: عند أول نسخة قابلة للتشغيل، اكتب إرشادات README وجرّب اتباعها مثل ذلك المستخدم.
- سينشر أو يوزّع خارج حاسوب المطوّر: سمِّ طريقة الإصدار والعودة إلى الإصدار السابق الذي يعمل، وما
  يحدث للبيانات المحفوظة؛ جرّب الرجوع على نسخة آمنة قبل الإصدار.
- يجمع بيانات شخصية من مستخدميه: يقدّم المالك نص الإشعار الذي يظهر قبل الجمع؛ افحص ظهور النص الذي
  قدّمه. لا تكتب سياسة قانونية، ولا تفترض واجبًا قانونيًا، ولا تنشئ `docs/privacy.md`، ولا تعطّل العمل
  المستقل في انتظار النص.
- يستخدم خدمة خارجية: تفحص الخطوة التي تربطها الرد المتوقع والتصرف عند الفشل كما في TRD؛ وتفحص
  أيضًا قاعدة التهديد أو سجل التدقيق ذات الصلة في الأمان.
لا تفرض على أداة صغيرة دون اتصال ولا حفظ فحوص الاستعادة والخدمات والإشعار والنشر لمجرد ورودها هنا.
هذه فحوص مقترحة؛ دليل التنفيذ من المطوّر أو المراجع، ولا يضع علامة «فُحصت» إلا الشخص.

| English | Arabic |
|---|---|
| `not started` | `لم تبدأ` |
| `⛔ waits for TBD: <what>` | `⛔ تنتظر ما لم يُحسم: <ما هو>` |
| `◐ waiting for your check (ran: <what>, <date>)` | `◐ بانتظار فحصك (نُفّذ: <ما نُفّذ>، <التاريخ>)` |
| `✅ checked <date>` | `✅ فُحصت <التاريخ>` |
| `Prototype` | `النموذج الأولي` |
| `Functional test` | `الاختبار الوظيفي` |
| `Security test` | `الاختبار الأمني` |
| `Acceptance test (UAT)` | `اختبار القبول (UAT)` |
| `Guides and training` | `الأدلة والتدريب` |
| `Install` | `التثبيت` |
| `Live test` | `اختبار التشغيل` |
| `Go-live` | `الإطلاق` |
| `Handover` | `التسليم` |
| `- **Target:** <…>` | `- **الموعد المستهدف:** <…>` |
| `  - Changed <date>: waited for <what> → not started, because <…>.` | `  - تغيّر في <التاريخ>: من انتظار <ما هو> إلى لم تبدأ، لأن <…>.` |

```markdown
# خطة التنفيذ: <اسم المشروع>
> الإصدار 1 · مسودة

## كيف تقرؤها
الخطوات بالترتيب. الحالة: لم تبدأ · ⛔ تنتظر قرارًا لم يُحسم · ◐ بُنيت وتنتظر فحصك · ✅ فحصتها أنت.

## الخطوات

### الخطوة 1: <شيء تراه يعمل>
- **تغطي:** <M1، M4 / TRD: …>
- **كيف نعرف أنها تعمل:** <فحص يستطيع الشخص تجربته>
- **الحالة:** لم تبدأ
```
