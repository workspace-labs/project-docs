# From approved documents to a builder

Read this when the Plan is approved and the person wants to pass it to a builder, or asks how the
documents guide engineering. This is an optional closing summary, not another document or approval gate.
`project-docs` writes documents only: it does not build, install, run the project or claim execution proof.

## Carry the same decisions forward

- Name the approved PRD, TRD, Security and Plan with their versions and approval dates. Include
  `DESIGN.md` only when screens need it and Data only when something is saved. An existing draft or
  unstamped document stays unapproved; do not invent an approval or silently skip a missing required one.
- Keep those files canonical. The PRD owns scope and its `M1`, `M2`… IDs; existing `docs/scope.md` remains
  intact. Reuse the current Plan, checks and progress; do not create a second scope, task list or copied
  decision ledger. A back end's later API guide stays at `docs/api.md`, as the Plan already requires.
- Read each decision's current value through its `Changed` history. Collapsed historical records do not
  become current again. Carry every open `TBD`, its exact name and decision trigger, and which unchecked
  steps it blocks. A blocked step stays blocked; name an independent first step only if one exists.
- Existing approvals carry into the handoff. Do not ask the person to approve the same unchanged choices
  again. A genuinely new or changed choice returns to its owning document's normal read-back, change
  history and approval process; a new summary must not turn it into an approved fact.

## Put engineering work in the existing Plan

Use **Covers**, **How we know it works** and **Status**, under the existing Plan headings. Feature work
keeps its PRD `M` IDs. Engineering work can cite the existing TRD, Data or Security rule it satisfies;
do not invent an `M` requirement or another tracking document for it.

Select checks from the approved project's actual needs. For example, an approved requirement to retain
irreplaceable records needs a backup/restore check before those records are entrusted to the project;
a selected distribution channel needs its relevant delivery check. A local timer needs neither merely
because these examples exist. Describe what the builder must demonstrate and where the result belongs
under the step's check. Record a requested assurance target as a target, not achieved conformance.

The builder or independent reviewer supplies actual commands, outcomes, dates and evidence, including
unavailable platform checks. `project-docs` does not run them. Never report a proposed check as passed.
The existing waiting-for-your-check status needs a real run; only the person can authorize **checked**.
Tests passing or another agent's confidence is not that authorization. Preserve earlier runs and checked
progress as history when a decision changes, exactly as [plan.md](plan.md) requires.

If `software-engineering-build-standard` is available to the separately authorized builder, it can
organize implementation and the applicable engineering checks from these inputs. The documents remain
usable without that skill. Do not install it, start implementation, or add a dependency from this handoff.

## A short closing summary

State the approved inputs, current open choices and blocked steps, the first unblocked Plan step and its
existing check, then any applicable engineering check already in the Plan that the builder must prove.
If the person asks for a document change instead, use that document's reference and normal approval loop.
Do not create a mandatory handoff file, new stamp, sign-off round or separate proof ledger.

## In Arabic

عندما تكون الخطة معتمدة ويريد الشخص تسليمها إلى المطوّر، قدّم ملخصًا قصيرًا فقط؛ ليس وثيقة جديدة ولا
موافقة إضافية. مهارة `project-docs` تكتب الوثائق فقط، ولا تبني المشروع أو تثبّته أو تشغّله ولا تدّعي
أن الفحوص قد نُفّذت.

- اذكر وثائق PRD وTRD والأمان والخطة المعتمدة مع الإصدار وتاريخ الاعتماد، وأضف `DESIGN.md` عند وجود
  واجهات ووثيقة البيانات عند الحفظ. المسودة أو الوثيقة بلا ختم لا تصبح معتمدة بالتسليم.
- تبقى الملفات نفسها المرجع: النطاق في PRD ومعرّفات `M1` و`M2` كما هي، وملف `docs/scope.md` يبقى دون حذف.
  استخدم الخطة وفحوصها وتاريخ تقدّمها؛ لا تنشئ قائمة مهام أو سجل قرارات بديلًا. دليل API اللاحق يبقى
  في `docs/api.md` عندما يحتاج المشروع إلى خادم.
- اتبع آخر قيمة حالية وسجل «تغيّر في»، ولا تُعد التاريخ المطوي قرارًا حاليًا. انقل كل «لم يُحسم بعد»
  باسمه وشرط حسمه والخطوات غير المفحوصة التي يعطّلها. لا تبدأ خطوة معطّلة.
- لا تطلب اعتماد القرارات نفسها مرة أخرى. القرار الجديد أو المعدّل يعود إلى وثيقته، والقراءة الراجعة
  وسجل التغيير والاعتماد المعتادة؛ الملخص لا يمنحه اعتمادًا.
- ضع العمل الهندسي تحت **تغطي** و**كيف نعرف أنها تعمل** و**الحالة** في الخطة الحالية. أبقِ معرّفات `M`
  للعمل الوظيفي، واربط العمل الهندسي بقاعدة TRD أو البيانات أو الأمان التي يحققها. لا تفرض فحص استعادة
  على مؤقّت لا يحفظ شيئًا. إذا طلب الشخص مستوى ضمان، اكتبه هدفًا لا نتيجة محققة.
- يقدّم المطوّر أو المراجع المستقل التنفيذ الفعلي والنتيجة والتاريخ والدليل، ويبيّن فحوص المنصات التي
  لم يتمكن من إجرائها. لا تنفّذها هذه المهارة. لا تُكتب «بانتظار فحصك» إلا بعد فحص حقيقي، ولا تُكتب
  «فُحصت» إلا عندما يقول الشخص إنها تعمل. احفظ التقدّم السابق كتاريخ إذا تغيّر القرار.
- يمكن للمطوّر المأذون له استخدام `software-engineering-build-standard` إن كانت متاحة؛ الوثائق تعمل
  دونها أيضًا. لا تثبّتها ولا تبدأ البناء. اختم بالمدخلات المعتمدة والقرارات المفتوحة والخطوات المعطّلة
  وأول خطوة مستقلة وفحصها؛ لا تضف ملف تسليم إلزاميًا أو دورة اعتماد جديدة.
