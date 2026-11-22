# The Plan: small steps

The last document. It turns the approved documents into small steps in order, each one ending with
something the person can see work. It always says where the work stopped, so any AI on any computer can
continue from there.

## Contents

Gather first · How to make the steps · Delivery steps · The status of a step · The read-back · The plan page · The document · In Arabic

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
  - Waiting time matters for a named flow: in the first step that makes it usable, cite **TRD: Speed**.
    Time the flow from the agreed start to finish on the device and under the load named there. Record
    the measured time and pass or fail against the agreed target when the check is run.
  - An action uses a part charged by use: before the step starts paying for it, cite **TRD: Running cost**.
    Using the agreed rates, check the cost through completion including charged failures and retries.
    Compare it with the estimate and the ceiling if one was set.
  - Saved data that cannot reasonably be recreated: before first entrusting it to the product, cite
    **Data: If this copy is lost**, restore the copy it names into a separate safe copy, read the records
    back and check that no more than the agreed loss is at risk; never overwrite live data for a test.
  - Someone besides the author will run it, or it will be set up again on another computer: when it
    becomes runnable, write the README how-to from an empty computer to running (what to install, its
    settings, how to start it) and try its instructions that way, as that user.
  - It is deployed or distributed beyond the builder's computer: that step names how to release it and
    cites **Release recovery** under **TRD: Where it lives**. On a safe copy before release, try the
    agreed recovery, including the signal, who decides, and what happens to saved data. Try going back
    only if the previous release can read the new saved data. If it cannot, try the agreed alternative
    on the copy. Each release gets a version and a dated line in `CHANGELOG.md` saying what changed for
    the people who use it, and its code is in the place the TRD names under **Kept in**.
  - It collects personal data from its users: the owner supplies the notice shown before collection;
    check that the product shows the supplied text. Do not draft a legal policy, infer a legal duty,
    create `docs/privacy.md` or block unrelated work while that text is awaited.
  - An outside service is used: the step that connects it tries the agreed expected response and
    failure behavior from the TRD. A Security threat or audit rule gets its corresponding check there.
  - An AI model is used (the TRD's **AI part** is not `None`): the step that first builds it runs the
    examples named under **Checked by** and shows the result, and any later step that changes the model
    or its instructions runs them again. The step that lets it act alone tries what **When it is wrong**
    says. When **Decides alone** limits what outside text can make it do, the step that first reads that
    text tries such a text and cites that line.
  A tiny offline project with no saved data gets no restore, service, notice or deployment check merely
  because these examples exist. Skip the speed check where waiting time is not a concern and the cost
  check where no part is charged by use. These are proposed checks; actual run results come from the
  builder or reviewer, and only the person marks them checked.
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

If the `checkflow` skill is installed, offer to run it after the Security test and before the Acceptance
test. It is not a plan step of its own, and a plan without these steps offers it before the handover.

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
| `⛔ waits for TBD: <what>` | it needs a choice a document left open | the AI; back to `not started` only once nothing it needs is still open |
| `◐ waiting for your check (ran: <what you ran>, <date>)` | built, and its check was run | the AI, **only after running the check**, in the same edit as the step's **Built** line |
| `✅ checked <date>` | the person tried it and it works | **only the person**: the AI types it only when the person says it works |

**The builder never marks its own homework.** Never write `✅` because the code looks right or the tests
pass. If the person says it does not work, set the step back to `not started` with one line saying why.

When a choice reopens, keep already checked steps as historical progress; they do not approve the revised
choice. Block affected unchecked steps, including ones waiting for the person's check. Keep any earlier
run and its date as historical text beneath the step's check, with only one current Status line. When
several choices block a step, keep its existing open TBD label first and name the others in its check.

When the choice a step waited for is settled, first check what else the step needs. **If another `TBD` it
needs is still open,** keep it blocked: set its Status to `⛔ waits for TBD: <the next open one, in document
order>` and keep the move as one line under **Status**:
`  - Changed <date>: waited for <what> → waits for <the next one>, because <the document> settled it as <the choice>.`
**Only when nothing it needs is still open,** set its Status back to `not started` and keep the wait as one
line under **How we know it works**. Use `  - Changed <date>: waited for <what> → not started, because
<the document> settled it as <the choice>.` If the wait's name contains `→`, quote the name, for example
`waited for “draft → sent”`. The page records a wait with extra unquoted arrows as written. The words
`⛔ waits for TBD:` appear only on a Status line, where the script looks for a waiting step.

Ordinary execution progress changes the status without changing the version or stamp. Changes caused by
a revised approved decision (including new blockers or revised checks), or adding, removing or reordering
steps, follow SKILL.md: preserve the decision history, raise the version, and return the plan to Draft.

## The read-back

Tell it as the story of the build: each building step on its own line, what is built first and what the
person will see when it is done; the delivery steps may share one line. Nothing is built until the person
approves the order.

> 18 steps, in this order:
> 1. First I build: a patient books a visit with one doctor → you will see it on the front desk list.
> 2. Prototype: the front desk lead tries booking → they say go on, or what to change.
> 3. The front desk list by doctor and day → you will see each doctor's day in time order.
> 4. Staff sign-in → without a clinic account the front desk list will not open.
> 5. Patient sign-in with a code by text → a patient sees only their own visits (waits for the
>    text-message service).
> 6. Moving and cancelling → a patient moves or cancels their own visit, never someone else's (waits for
>    the text-message service).
> 7. The reminder → a text arrives at 18:00 the day before the visit (waits for the text-message service).
> 8. The API guide → a new developer can follow every request in `docs/api.md`.
> 9. Arabic → every page reads right to left, with nothing left in English.
> 10. The safe release → a backup restores and the agreed recovery is tried on a safe copy (waits for
>    the patient notice and the release recovery decision).
> 11–18. Delivery: functional test, security test, UAT by the front desk lead on a test copy, guides and
>    training, install on the clinic's server, live test, go-live by early December, handover to the clinic
>    manager.
> Right order? Anything missing, too big or not needed?

## The plan page

`docs/plan.md` is the truth. `docs/plan.html` shows it as a board the person can open at any time: four
columns (Done · Waiting for your check · Next · Waiting for a decision), a **You are here** bar on the first
step not yet checked, and every card opens to that step's plan, what was built and the person's decisions.
The skill's script makes it; never write or edit the page by hand:

    node <this skill's folder>/scripts/plan-page.js docs/plan.md

It needs Node.js 18 or newer and nothing else: no packages, no network. If Node.js is missing, or your tool
cannot run a command (a chat in the browser), say so once and never install it; the plan stays in
`docs/plan.md` and the page waits.

- **After the Plan is approved, before anything is built:** make the page without asking and open it for
  the person. Then ask once: "Do you want the plan as a PDF?" Yes → print the page to `docs/plan.pdf`
  (with a browser you can drive, or tell the person: open the page, then Print, then Save as PDF). The PDF
  is a copy of that day: make it once, never refresh it. No → no PDF.
- **After every change to a step** (built, checked, waiting, settled, a new note): change `docs/plan.md`
  first, then run the script again.
- **"Where are we?"**: run the script, open the page for the person, and answer in one line: the step you
  are on and its state.
- The page is one file and holds only what the plan holds, so the person may share it. Its cards open
  without JavaScript, which a phone's file preview turns off (an iPhone opening the file from a chat).
- The script reads the plan the way Markdown reads it: a step shown as an example inside a code block is not
  counted, and what it would have to guess (a code block left open, a text line with `---` under it, an HTML
  tag alone on a line) it refuses. When it refuses, it names the step, or the line of the file, to fix. Fix
  `docs/plan.md`, never the page.
- Write a calendar date with Western digits in every `Changed` line, using `YYYY-MM-DD`. The script names
  the step if it refuses a change entry because of the date.
- The page files an entry as a check change or settled-wait history only when it sits under
  **How we know it works**. The check-change format is `  - Changed <date>: <old> → <new>, because
  <reason>.` Under another field, or when the transition is ambiguous, the page records the entry as
  written. Quote the old or new wording with “…” if it contains an arrow or the word "because". The script
  looks for the entry's arrow and reason outside those quotes.

Two lines are added to a step while the work goes on, never when the plan is written. Both go after **How
we know it works** and its history lines, before **Target** and **Status**:

- `- **Built:** <what was really made, in plain words>`: written by the builder in the same edit that sets
  `◐ waiting for your check`. Never on a step that is not built.
- `- **Your note:** <date> — <the person's words>`: a decision or comment the person gave about this step,
  one line each, in the order given. Only the person's own words; never invent one, and never put the AI's
  opinion there.

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
- زمن الانتظار مهم لمسار محدّد: في أول خطوة تجعله قابلًا للاستخدام، اذكر **TRD: السرعة**. قِس الزمن من
  البداية إلى الاكتمال المتفق عليهما، على الجهاز وتحت الحمل المذكورين هناك. عند تنفيذ الفحص، سجّل
  الزمن المقاس ونجاح الفحص أو فشله حسب الهدف المتفق عليه.
- إجراء يستخدم جزءًا مدفوعًا بحسب الاستخدام: قبل أن يبدأ الدفع في الخطوة، اذكر **TRD: تكلفة التشغيل**.
  تحقّق بالأسعار المتفق عليها من التكلفة حتى اكتمال الإجراء، بما فيها الفشل وإعادة المحاولة
  المدفوعان، وقارنها بالتقدير وبالسقف إن حدده الشخص.
- بيانات محفوظة لا يمكن إعادة إنشائها عمليًا: قبل الاعتماد على المنتج لحفظها، اذكر **البيانات: إذا ضاعت
  هذه النسخة**، واستعد النسخة التي يسمّيها في نسخة آمنة منفصلة، واقرأ السجلات مجددًا، وتحقق من أن ما قد يضيع
  لا يتجاوز المتفق عليه؛ لا تستبدل البيانات الحية للاختبار.
- سيشغّله شخص غير مؤلفه، أو سيُجهَّز من جديد على حاسوب آخر: عند أول نسخة قابلة للتشغيل، اكتب إرشادات
  README من حاسوب فارغ إلى التشغيل (ما يُثبَّت، وإعداداته، وكيف يبدأ) وجرّب اتباعها مثل ذلك المستخدم.
- سيُنشر أو يوزّع خارج حاسوب المطوّر: سمِّ طريقة الإصدار وأشر إلى **التعافي عند الإصدار** تحت
  **TRD: أين يعمل**. قبل الإصدار، جرّب التعافي المتفق عليه على نسخة آمنة، بما في ذلك الإشارة ومن
  يقرر وما يحدث للبيانات المحفوظة. لا تجرّب الرجوع إلا إذا استطاع الإصدار السابق قراءة البيانات
  الجديدة المحفوظة. وإن تعذّر ذلك، فجرّب البديل المتفق عليه على النسخة. لكل إصدار رقم وسطر مؤرّخ
  في `CHANGELOG.md` يقول ما تغيّر لمن يستخدمونه، وكوده في المكان الذي يسمّيه TRD تحت **مكان الكود**.
- يجمع بيانات شخصية من مستخدميه: يقدّم المالك نص الإشعار الذي يظهر قبل الجمع؛ افحص ظهور النص الذي
  قدّمه. لا تكتب سياسة قانونية، ولا تفترض واجبًا قانونيًا، ولا تنشئ `docs/privacy.md`، ولا تعطّل العمل
  المستقل في انتظار النص.
- يستخدم خدمة خارجية: تفحص الخطوة التي تربطها الرد المتوقع والتصرف عند الفشل كما في TRD؛ وتفحص
  أيضًا قاعدة التهديد أو سجل التدقيق ذات الصلة في الأمان.
- يستخدم نموذج ذكاء اصطناعي (**جزء الذكاء الاصطناعي** في TRD ليس «لا شيء»): تشغّل الخطوة التي تبنيه أول
  مرة الأمثلة المذكورة تحت **يُفحص بـ** وتعرض النتيجة، وتعيدها أي خطوة لاحقة تغيّر النموذج أو تعليماته.
  والخطوة التي تسمح له بالتصرف وحده تجرّب ما يقوله سطر **عند الخطأ**. وإذا حدّد **يقرر وحده** ما لا يجوز أن
  يدفعه النص الخارجي إلى فعله، فالخطوة التي تقرأ ذلك النص أول مرة تجرّب نصًا كهذا وتذكر ذلك السطر.
لا تفرض على أداة صغيرة دون اتصال ولا حفظ فحوص الاستعادة والخدمات والإشعار والنشر لمجرد ورودها هنا.
تجاوز فحص السرعة إذا لم يكن الانتظار مهمًا، وفحص التكلفة إذا لم يكن أي جزء مدفوعًا بحسب الاستخدام.
هذه فحوص مقترحة؛ دليل التنفيذ من المطوّر أو المراجع، ولا يضع علامة «فُحصت» إلا الشخص.

صفحة الخطة نفسها تعمل بالعربية من اليمين إلى اليسار حين تكون الخطة عربية، ويصنعها النص البرمجي نفسه. والسطران
اللذان يُضافان أثناء العمل لهما الاسمان في الجدول أدناه: «ما بُني» يكتبه المطوّر مع حالة «بانتظار فحصك»، و«ملاحظتك»
بكلمات الشخص وحده. اكتب تاريخًا صحيحًا بالأرقام الغربية بصيغة `YYYY-MM-DD` في كل سطر يبدأ بـ«تغيّر في».
إذا رفض النص البرمجي السطر بسبب التاريخ، يذكر اسم الخطوة.

عند حسم القرار الذي تنتظره الخطوة، انظر أولًا ما تحتاجه أيضًا. **إن بقي قرار آخر تحتاجه مفتوحًا** فأبقها معطّلة: اجعل
حالتها `⛔ تنتظر ما لم يُحسم: <التالي المفتوح بترتيب الوثائق>`، واحفظ الانتقال في سطر واحد تحت **الحالة**:
`  - تغيّر في <التاريخ>: من انتظار <ما هو> إلى انتظار <التالي>، لأن <الوثيقة> حسمته بأنه <الاختيار>.`
**ولا تعود إلى «لم تبدأ» إلا حين لا يبقى شيء تحتاجه مفتوحًا.**

ضع تغييرات الفحص وسجلّ الانتقال إلى «لم تبدأ» بعد حسم الانتظار تحت سطر **كيف نعرف أنها تعمل**. تحت أي حقل
آخر، أو إذا التبس معنى الانتقال، يُعرض السطر كما كُتب. إذا احتوى اسم ما تنتظره الخطوة على كلمة «إلى»،
فضع الاسم بين علامتي تنصيص، مثل `من انتظار «الوصول إلى خدمة الاستضافة» إلى لم تبدأ`. يظهر الانتظار
الذي فيه أكثر من «إلى» خارج علامات التنصيص كما كُتب. وإذا احتوت الصياغة القديمة أو الجديدة على «إلى»
أو «لأن»، فاكتب تلك الصياغة بين «…» ليبقى الفاصل والسبب واضحين.

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
| `- **Built:** <…>` | `- **ما بُني:** <…>` |
| `- **Your note:** <date> — <…>` | `- **ملاحظتك:** <التاريخ> — <…>` |
| `  - Changed <date>: waited for <what> → not started, because <…>.` | `  - تغيّر في <التاريخ>: من انتظار <ما هو> إلى لم تبدأ، لأن <…>.` |
| `  - Changed <date>: waited for <what> → waits for <the next one>, because <…>.` | `  - تغيّر في <التاريخ>: من انتظار <ما هو> إلى انتظار <التالي>، لأن <…>.` |

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
