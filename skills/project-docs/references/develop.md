# Developing a project that is already built

## Contents

When this applies · How it works today · Health check before the change · Mark the PRD · Keep today's behaviour working · Decide each gap · The other documents · The Plan · Samples · In Arabic

## When this applies

Use this guide when a project has code and the person asks for a new feature or a change to how it
works. The request must add or change an `M` line. If this skill documented and handed over the project,
sort the request first under [Requests after handover](maintenance.md#requests-after-handover).
A **Fault** follows the Handover agreement. A **Change** comes here to mark the new version of the PRD.

## How it works today

Read the README, existing documents, screens or routes and their code, as in Start, step 4.
If `workflow-project` is already available, ask it for the workflow of **how it works today**. Take
every line of its **Gaps found** list when it provides one. Never install it.

Gather today's steps for **How it works today** in the [PRD](prd.md). If the skill is missing or
the available copy gives no list, put only the gaps you confirmed while reading in the read-back.
Look for a path that ends with nothing happening, a decision with a missing answer, a step nobody
does, a screen that promises something the code never does or a screen nothing leads to. Ask the
person about anything you could not confirm. In the first read-back, describe today's flow and name
each confirmed gap. Once the person confirms that account, check the project's health before planning
the change.

## Health check before the change

After the person confirms how the project works today, do the health check before planning the change.

If a read-only project health audit skill is available, ask it for the audit. Look for one that
reports evidence-backed findings such as bugs, security hazards, missing tests, broken references
and risky spots, with the project kept read-only. Never install it. If none is available, say
“No health audit was run.” Bring only the problems you confirmed while reading the code, each with
its file and line.

The check only reports. Keep the project read-only throughout the check, including its code,
formatting and dependencies. Get the person's yes before running the project's own scripts or tests,
including through the audit skill.

For each finding, say what it is, give its file and line, and describe what it could cause. Keep the
report about the code and its effects. Avoid judging the builder or giving the code a general verdict.
Tell the person “A health check reads the code and can miss problems, even when it reports no findings.”

Present every finding with the gaps in the same read-back, in the person's language. Recommend what
to do with each finding and ask the person to decide.

- **Fix it now.** If it changes what a user can do, write an `M` line with its `Check:`. Otherwise put
  it in the document that owns it (TRD, Data or Security), follow that document's normal approval and
  cite the rule in a Plan step's **Covers**.
- **Fix it later.** Put it under **Later**.
- **Leave it.** Write a `Risk:` under **Assumptions and risks** that names the finding.

Keep each finding in the read-back until the person decides where it goes. Fix a finding only when
the person asks for it and approves the work.

Settle **Dates and budget** after the person has sorted the gaps and findings. Explain that the fixes
they chose add work beside the change they requested. If dates or a budget were agreed earlier, ask
whether they still hold. Use only numbers, durations and prices the person supplies or confirms.
Then follow the usual PRD read-back and approval.

## Mark the PRD

Put the mark at the end of the `M` line, after its words.

- **`(works today)`** means the product already does this, the person confirmed it and it must keep
  working as it is.
- **`(changes)`** means the product already does this and the request changes it. Write what it must
  do after the change and give it a `Check:` that proves the new behaviour.
- **No mark** means new work.

Keep the `Check:` line directly under its `M` line. Use the [PRD's numbering and change rules](prd.md#the-document)
for the revised version, so approved numbers and history stay visible. New `M` lines take the next numbers.
Keep `(found in code)` on an unconfirmed finding. When the person confirms an `M` line found in code,
change its mark to `(works today)` or `(changes)`.

## Keep today's behaviour working

The `(works today)` lines and their checks are the list of what must keep working. Keep them in
**What it must do**. Run their checks on the untouched project before the first change, then run
them again at the end.

## Decide each gap

Show every confirmed gap alongside the health findings in the same read-back, in the person's
language. A yes to today's account confirms the facts. Get a decision on each gap by recommending
an option and asking the person what they want to do.

- **Fix it now.** Write a `(changes)` or new `M` line with its `Check:`.
- **Fix it later.** Put it under **Later**.
- **Leave it.** Write a `Risk:` under **Assumptions and risks** that names the gap.

Keep each gap in the read-back until the person decides where it goes. Fix a gap only when the person
asks for it and approves the work.

## The other documents

Follow the rules in [TRD](trd.md), [Design](design.md), [Data](data.md) and [Security](security.md).
Mark the technology and choices you find in the built project as `(found in code)` and ask the
person to confirm them. Ask the person about each new choice the change needs.

## The Plan

Use the [Plan](plan.md) rules. The first step changes nothing. Keep the owner's working version and
make a safe copy to work on. Run every `(works today)` check on the untouched copy before the first
change and record each real result. If a check already fails, tell the person it failed before the work
and ask them to sort it as a gap.

The next step is the thinnest version of the change that works end to end. The building steps cover
the `(changes)` lines and the new work. Place the **Prototype** right after the first step that builds
the change when a client project has screens. Run the `(works today)` checks again in the
**Functional test** and the **Acceptance test (UAT)**. A solo owner's plan gets the same first step
and repeats the same checks at the end without the client delivery steps.

## Samples

A workshop booking tool lets visitors reserve places and cancel until two hours before the start.
The person wants to allow cancellation until one hour before the start and add a room filter.

```markdown
## What it must do
- **M1.** A visitor can book an open place and see it in their bookings. (works today)
  - Check: Book an open place and see it appear in My bookings.
- **M2.** A visitor can cancel a booking until one hour before it starts. (changes)
  - Check: Cancel a booking 90 minutes before it starts and see it go away. Try another with 30 minutes left and see the booking stay.
- **M3.** A visitor can filter the workshops by room.
  - Check: Choose Room A and see only workshops in Room A.
```

```markdown
### Step 1: Copy the project and check today's bookings
- **Covers:** M1
- **How we know it works:** Keep the owner's working version and make a safe copy. Run M1's Check on the untouched copy and record the result before making any change.
- **Status:** not started
```

## In Arabic

هذا الدليل لمشروع قائم له كود ويطلب الشخص إضافة ميزة إليه أو تغيير طريقة عمله. يضيف الطلب بندًا
من بنود `M` أو يغيّره. إذا وثّقت المهارة المشروع وسلّمته من قبل، فابدأ بتصنيف الطلب وفق
[طلبات ما بعد التسليم](maintenance.md#requests-after-handover). يُعالج **العطل** وفق اتفاق التسليم،
ويعود **التغيير** إلى هذا الدليل لتمييز بنود الإصدار الجديد من `PRD`.

اقرأ المشروع كما في خطوة البداية الرابعة. إن كانت مهارة `workflow-project` متاحة، فاطلب منها رسم
سير العمل اليوم، وانقل كل ما في قائمة **ثغرات وجدناها** إن ظهرت. لا تثبّتها أبدًا.
اجمع الخطوات الحالية لقسم **كيف يسير العمل اليوم** في `PRD`. إذا غابت المهارة أو لم تُخرج قائمتها،
فاذكر عند إعادة عرض الفهم الثغرات التي تأكدت منها أثناء القراءة فقط، مثل مسار ينتهي دون أن يحدث شيء، أو
قرار بلا جواب لإحدى حالاته، أو خطوة لا ينفّذها أحد، أو شاشة تعد بشيء لا ينفّذه الكود، أو شاشة
لا يوجد مسار يصل إليها. اسأل الشخص عمّا تعذّر عليك تأكيده. في العرض الأول، صف طريقة العمل اليوم وسمِّ
كل ثغرة تأكدت منها. بعد أن يؤكد الشخص الوصف، افحص سلامة المشروع قبل التخطيط للتغيير.

**فحص سلامة المشروع قبل التغيير.** ابدأ الفحص بعد أن يؤكد الشخص طريقة عمل المشروع اليوم، وقبل التخطيط
للتغيير.

إذا توفرت مهارة تفحص سلامة المشروع بالقراءة فقط، فاطلب منها إجراء الفحص. اختر مهارة تعرض ملاحظات
تستند إلى أدلة، مثل الأخطاء والمخاطر الأمنية والاختبارات المفقودة والمراجع المعطّلة والمواضع التي قد
تسبّب مشكلات، وتعمل دون تعديل المشروع. لا تثبّتها أبدًا. إذا لم تتوفر مهارة كهذه، فقل «لم يُجرَ فحص
لسلامة المشروع.» ثم اعرض فقط المشكلات التي تأكدت منها أثناء قراءة الكود، واذكر ملف كل مشكلة وسطرها.

يقتصر الفحص على عرض النتائج. افحص المشروع دون تعديل الكود أو تنسيقه أو اعتمادياته. اطلب موافقة الشخص
قبل تشغيل أي من سكربتات المشروع أو فحوصه، حتى عند استخدام مهارة الفحص.

اشرح كل ملاحظة، واذكر ملفها وسطرها وما قد يترتب عليها. ركّز على الكود وأثره، وتجنّب الحكم على من
كتبه أو إصدار حكم عام عليه. قل للشخص «يعتمد فحص سلامة المشروع على قراءة الكود، وقد تفوته مشكلات
حتى لو لم يسجّل أي ملاحظات.»

اعرض كل ملاحظة مع الثغرات في العرض نفسه وباللغة التي يستخدمها الشخص. اقترح ما تراه مناسبًا لكل
ملاحظة واسأله عمّا يريد فعله بها.

- **إصلاحها الآن.** إذا كان الإصلاح يغيّر ما يستطيع المستخدم فعله، فاكتب بندًا من بنود `M` مع سطر
  `الفحص:`. وإلا فسجّله في وثيقته، سواء كانت `TRD` أو البيانات أو الأمان، واتبع قواعد اعتمادها. اذكر
  القاعدة تحت **تغطي** في خطوة من الخطة.
- **إصلاحها لاحقًا.** اكتبها تحت **لاحقًا**.
- **تركها.** سمِّ الملاحظة في سطر **خطر:** تحت **الافتراضات والمخاطر**.

أبقِ كل ملاحظة في العرض حتى يقرر الشخص أين تُسجّل. ولا تُصلحها إلا إذا طلب ذلك واعتمد العمل.

اتفق على **المواعيد والميزانية** بعد أن يقرر الشخص ما سيفعله بكل ثغرة وملاحظة. اشرح أن الإصلاحات
التي اختارها تضيف عملًا إلى التغيير الذي طلبه. إذا سبق الاتفاق على مواعيد أو ميزانية، فاسأله إن
كانت لا تزال مناسبة. سجّل فقط الأرقام والمدد والأسعار التي يقدّمها الشخص أو يؤكدها. ثم اتبع خطوات
عرض `PRD` واعتماده المعتادة.

ضع العلامة في آخر سطر البند تحت **ما يجب أن يفعله**.

- **`(يعمل اليوم)`** للوظيفة القائمة التي أكدها الشخص ويجب أن تواصل العمل كما هي.
- **`(يتغير)`** للوظيفة القائمة التي يغيّرها الطلب. اكتب ما يجب أن تفعله بعد التغيير، وضع فحصًا
  يثبت السلوك الجديد.
- **بلا علامة** للعمل الجديد.

أبقِ سطر `الفحص:` مباشرة تحت كل بند. احتفظ برقم البند وسجل اعتماده وتغييراته وفق قواعد `PRD`،
وأعطِ البنود الجديدة الأرقام التالية. تبقى علامة `(found in code)` على ما لم يؤكده الشخص بعد.
عند تأكيد بند `M` وجدته في الكود، تصبح علامته `(يعمل اليوم)` أو `(يتغير)`.

البنود المعلّمة بـ`(يعمل اليوم)` وفحوصها هي قائمة ما يجب أن يواصل العمل. أبقِها تحت **ما يجب أن يفعله**.
تُجرى فحوصها على المشروع قبل أول تعديل، ثم تُعاد في النهاية.

اعرض كل ثغرة مؤكدة مع ملاحظات فحص سلامة المشروع في العرض نفسه وباللغة التي يستخدمها الشخص.
تؤكد موافقته على وصف العمل اليوم ما وجدته فيه. اقترح ما تراه مناسبًا لكل ثغرة واسأله عمّا يريد فعله بها.

- **إصلاحها الآن.** اكتب بندًا من بنود `M` بعلامة `(يتغير)` أو بندًا جديدًا، مع فحصه.
- **إصلاحها لاحقًا.** اكتبها تحت **لاحقًا**.
- **تركها.** سمِّ الثغرة في سطر **خطر:** تحت **الافتراضات والمخاطر**.

أبقِ كل ثغرة في العرض حتى يقرر الشخص أين تُسجّل. ولا تُصلحها إلا إذا طلب ذلك واعتمد العمل.
في `TRD` والتصميم والبيانات والأمان، علّم التقنيات والقرارات القائمة التي تجدها بعلامة
`(found in code)` ليؤكدها الشخص. واسأله عن كل اختيار جديد يحتاجه التغيير.

في الخطة، لا تغيّر الخطوة الأولى شيئًا في المشروع. احتفظ بنسخة المالك العاملة وخذ نسخة آمنة
للعمل عليها. شغّل على النسخة فحوص كل بند علامته `(يعمل اليوم)` قبل أي تعديل وسجّل النتيجة
الفعلية لكل فحص. إذا فشل أحدها، أخبر الشخص أنه فشل قبل بدء التغيير ودعه يصنّفه كما يصنّف الثغرات.
تبني الخطوة التالية أبسط مسار للتغيير يعمل من البداية إلى النهاية. تغطّي خطوات البناء البنود
المتغيّرة والجديدة. يأتي **النموذج الأولي** لمشروع العميل ذي الشاشات بعد أول خطوة تبني التغيير.
أعد فحوص البنود التي تعمل اليوم في **الاختبار الوظيفي** و**اختبار القبول (UAT)**. في المشروع
الشخصي الفردي، تبدأ الخطة بالخطوة نفسها وتعيد الفحوص في النهاية دون خطوات تسليم العميل.

تتيح أداة حجز الورش للزائر حجز مكان وإلغاء حجزه حتى ساعتين قبل البدء. يريد الشخص إتاحة الإلغاء
حتى ساعة قبل البدء وإضافة تصفية الورش حسب القاعة.

```markdown
## ما يجب أن يفعله
- **M1.** يستطيع الزائر حجز مكان متاح ورؤيته في قائمة حجوزاته. (يعمل اليوم)
  - الفحص: احجز مكانًا متاحًا وتأكد من ظهوره في قائمة «حجوزاتي».
- **M2.** يستطيع الزائر إلغاء الحجز حتى ساعة قبل بدء الورشة. (يتغير)
  - الفحص: ألغِ حجزًا قبل البدء بتسعين دقيقة وتأكد من اختفائه. جرّب إلغاء حجز آخر قبل البدء بنصف ساعة وتأكد من بقائه.
- **M3.** يستطيع الزائر تصفية الورش حسب القاعة.
  - الفحص: اختر القاعة أ وتأكد من ظهور ورش هذه القاعة وحدها.
```

```markdown
### الخطوة 1: حفظ نسخة وفحص الحجز الحالي
- **تغطي:** M1
- **كيف نعرف أنها تعمل:** احتفظ بنسخة المالك العاملة وخذ نسخة آمنة للعمل عليها. نفّذ فحص M1 على النسخة قبل أي تعديل وسجّل النتيجة.
- **الحالة:** لم تبدأ
```
