# Maintenance: after the handover

Keep the dates, visits and requests in `docs/maintenance.md`. This running record has no stamp and
never goes through approval. The maintenance agreement stays in the approved Handover.

## Contents

Gather first · The two parts · Suggested rhythm · Recording a visit · Requests after handover · Where the suggestions come from · The document · In Arabic

## Gather first

- **Handover → Maintenance and updates:** read the agreed light and full visit rhythms, the deadline
  for a serious security fix and who receives each visit's results. Link to the Handover in the
  record. When an agreement needs to change, use the Handover's normal approval process.
- **PRD → Who decides, What it must do and What it will NOT do:** read the approved scope and its
  `Check:` lines when sorting a request. Use the project's Data or Security document for facts the
  record needs about backups or security.
- Start when the person says the project has been handed over, or on their first maintenance
  request. For a project they built for themselves alone, start only if they ask for the record.
  Create the record only with an approved Handover. If there is no approved Handover, tell the
  person and offer to write it first.

## The two parts

**What does not wait for a visit.** Tell the person when any of the four items listed under that
heading in the record becomes known. For a fix rated critical or high, count the days from the date
the fix was published, using the deadline in the Handover.

**Regular visits.** A light visit covers the three checks under **Light visit checks**. A full visit
covers them and the additional checks under **Full visit checks**. Keep every check in the record.
When a check does not apply, say `not applicable` and give the reason, such as no backup because the
project saves nothing.

## Suggested rhythm

Suggest the closest row when writing the Handover. These intervals are judgment. The client agrees
to them or gives their own dates. The full visit includes a real restore where a backup applies.

| Kind of project | Light visit | Full visit |
|---|---|---|
| Online, with logins or personal data | Every month | Every 3 months |
| Inside a client's closed network | Every month | Every 6 months |
| Offline on one device, no accounts | Every 3 months | Every 12 months |

## Recording a visit

1. Use the actual handover date and each agreed rhythm to find the first dates. If earlier visits
   have already taken place, use the reported dates for the rhythms they covered. Ask for a missing
   date or agreement and show what is still open in its date field. Write known dates as
   `YYYY-MM-DD` and keep any existing visit history.
2. When opening the project, read the two dates first. For this reminder, due soon means today or
   within the next seven calendar days. Tell the person before anything else which visit is due
   soon or late, with the date and how many days away or late it is. Say nothing when neither
   visit is due soon or late. When both dates match, the full visit covers the light one.
3. The record names the checks. project-docs never runs a visit's checks. Record the results as
   reported by whoever ran the checks, and say who ran each one. Write `not run` for any applicable
   check that was not run. For each finding, record `fine`, `do now` or `can wait`. The person
   decides what is done.
4. Set the visit to `◐ waiting for your check` only after results were given. As with a Plan step,
   only the person marks a visit checked (`✅ checked <date>`).
5. When the visit is recorded, write the next two dates. Calculate the next date for the rhythm
   that the visit covered from the date it took place, and carry forward the other date. When a
   full visit covers both visits due on the same day, calculate both from that visit. Give the person
   the next date for their own calendar. Use the recipient in the Handover when saying who gets the
   results.

## Requests after handover

- **Fault:** an approved `M` line or its `Check:` is not met. The Handover agreement governs the
  fix and the PRD stays as approved.
- **Change:** a request is outside the approved PRD. Tell the person a new, approved version of the
  PRD is needed before building. Follow the normal change process to draft, version and approve it.
  Use [develop.md](develop.md) to mark the new PRD version.
- **Health job:** regular care that belongs to a visit.

Quote the approved PRD line or `Check:` you relied on in your reply. For a request outside scope,
quote the closest line, including an explicit exclusion when there is one. If the PRD does not settle it, say what
is unclear and leave the sort open for the person to decide. The agent never decides who pays.
Add one line per request with the date, the client's words, how it was sorted and by whom, and the
closing version. Mark it open until it closes. If it closes without a version, say so.

## Where the suggestions come from

- **CIS Controls v8, Safeguards 11.2 and 11.5:** backups run weekly or more often. A sample backup
  is restored to test recovery every 3 months.
- **UK Cyber Essentials, Requirements for IT Infrastructure v3.3, effective 27 April 2026:**
  a fix rated critical or high is due within 14 days of release.
- **UK NCSC, vulnerability management, reviewed 1 May 2026:** suggests 5 days for internet-facing
  parts, 7 days for operating systems and applications, and 14 days for internal or air-gapped
  parts. These targets are too slow when attackers already use the weakness.

The visit rhythm is judgment. Use the security guidance to suggest a deadline in the Handover,
where the client agrees to it.

## The document

Write exactly these headings, in this order. When there is no visit or request yet, say so under
its heading. Keep the no-visit items and visit checks on their own lines so the person can scan them.

```markdown
# Maintenance: <Project name>

Maintenance agreement: [Handover](handover.md), **Maintenance and updates**.

## Next light visit
- <YYYY-MM-DD>

## Next full visit
- <YYYY-MM-DD>

## Light visit checks
- Security weaknesses in the packages the project uses.
- Whether the backups ran.
- What expires soon.

## Full visit checks
- The light visit checks.
- A real restore from backup on a separate, safe copy.
- The logs.
- The project's tests.
- Whether the project's parts still receive support.
- Whether the guides still match the project.

## What does not wait for a visit
- A serious security fix.
- A failed backup.
- A part whose maker has stopped sending security fixes.
- Something that expires before the next visit.

## Visits held
- **<date> — <light/full>** · <status>
  - <check>: <result, who ran it> · <finding>

## Requests received
- <date> · “<client's words>” · <fault/change/health job, by whom, PRD line or what remains unclear> · <closing version or open>
```

## In Arabic

عند طلب العربية، اكتب السجل بالعناوين التالية وبترتيبها. يحمل السجل المواعيد والزيارات والطلبات. لا ختم له ولا
يحتاج إلى اعتماد. يظل اتفاق الصيانة في وثيقة التسليم المعتمدة، ويشير السجل إليها. تُكتب التواريخ بصيغة
`YYYY-MM-DD`، وتبقى أسماء الملفات واسم `PRD` ورموز `M1` وما بعدها كما هي.

اقترح الوتيرة الأقرب إلى وضع المشروع عند كتابة وثيقة التسليم. هذه الوتيرة تقديرية، ويتفق عليها العميل مع من
يتولى الصيانة. وتشمل الزيارة الشاملة استعادة فعلية حين توجد نسخة احتياطية.

| نوع المشروع | الزيارة الخفيفة | الزيارة الشاملة |
|---|---|---|
| متصل بالإنترنت وفيه تسجيل دخول أو بيانات شخصية | كل شهر | كل 3 أشهر |
| داخل شبكة العميل المغلقة | كل شهر | كل 6 أشهر |
| دون اتصال على جهاز واحد، بلا حسابات | كل 3 أشهر | كل 12 شهرًا |

احسب الموعدين الأولين من تاريخ التسليم الفعلي وفق الوتيرتين المتفق عليهما. إن حدثت زيارات من قبل، فاستند
إلى تواريخها المذكورة لكل نوع. لأغراض التذكير، يُعدّ الموعد قريبًا إذا حلّ اليوم أو خلال الأيام السبعة المقبلة.
عند فتح المشروع، اذكر أولًا كل زيارة اقترب موعدها أو تأخرت، مع التاريخ وعدد الأيام. إذا لم يقترب أي موعد
ولم يتأخر، فتجاوز التذكير. إذا حلّ الموعدان في اليوم نفسه، شملت الزيارة الشاملة الزيارة الخفيفة.
عند تسجيل الزيارة، احسب الموعد التالي لكل نوع شملته من تاريخ إجرائها، وأبقِ موعد النوع الآخر كما هو.
أعطِ الشخص أقرب موعد ليضيفه إلى تقويمه، واذكر من يتلقى النتائج بحسب اتفاق التسليم.

يذكر `project-docs` الفحوص ولا يجريها. دوّن نتيجة كل فحص كما أبلغ بها من أجراه، واذكر اسمه.
اكتب «لم يُجرَ» للفحص الذي لم يُجرَ، و«لا ينطبق» مع السبب للفحص الذي لا ينطبق على المشروع. أبقِ الفحص في
السجل في الحالتين. سجّل كل ملاحظة بإحدى العبارات «سليم» أو «يحتاج إلى إجراء الآن» أو «يمكن تأجيله»،
ودع الشخص يقرر الإجراء. بعد ورود النتائج تصبح حالة الزيارة `◐ بانتظار فحصك`. وحده الشخص يضع علامة الفحص
`✅ فُحصت <التاريخ>`.

في طلبات ما بعد التسليم، يُعدّ عدم تحقق أحد بنود `M` المعتمدة أو فحصه **عطلًا** ويُعالَج وفق اتفاق
التسليم. وما يقع خارج نطاق `PRD` المعتمد **تغيير**. أخبر الشخص أن العمل يتطلب إصدارًا جديدًا معتمدًا من
`PRD` قبل البناء. والعناية الدورية **عمل صيانة** يدخل في الزيارة. اقتبس في ردّك نص بند `PRD` أو الفحص الذي استندت إليه. إن لم
يحسم النص نوع الطلب، فاذكر ما التبس ودع الشخص يقرر. لا يقرر الوكيل من يدفع.

أبلغ الشخص بأي بند تحت **ما لا ينتظر موعد الزيارة** فور العلم به. تُحسب مهلة الإصلاح الأمني الخطير من
تاريخ نشر الإصلاح، وفق اتفاق التسليم. تأتي الأرقام المقترحة للنسخ الاحتياطي والاستعادة من `CIS Controls v8`،
ولمهل الإصلاح الأمني من `UK Cyber Essentials` و`UK NCSC` المذكورين أعلاه. وتيرة الزيارات تقديرية.

إذا لم تُجرَ زيارة أو لم يرد طلب بعد، فاكتب ذلك تحت عنوانه.

```markdown
# الصيانة: <اسم المشروع>

اتفاق الصيانة: [التسليم وما بعده](handover.md)، قسم **الصيانة والتحديثات**.

## الزيارة الخفيفة القادمة
- <YYYY-MM-DD>

## الزيارة الشاملة القادمة
- <YYYY-MM-DD>

## فحوص الزيارة الخفيفة
- الثغرات الأمنية في الحزم التي يستخدمها المشروع.
- ما إذا كانت النسخ الاحتياطية قد أُخذت.
- ما سيحل موعد انتهائه قريبًا.

## فحوص الزيارة الشاملة
- فحوص الزيارة الخفيفة.
- استعادة فعلية من النسخة الاحتياطية على نسخة منفصلة وآمنة.
- سجلّات التشغيل.
- اختبارات المشروع.
- ما إذا كانت أجزاء المشروع لا تزال مدعومة.
- ما إذا كانت الأدلة لا تزال تطابق المشروع.

## ما لا ينتظر موعد الزيارة
- إصلاح ثغرة أمنية خطيرة.
- فشل النسخ الاحتياطي.
- جزء توقفت الجهة المطوّرة له عن إصدار إصلاحات أمنية.
- شيء تنتهي صلاحيته قبل الزيارة القادمة.

## الزيارات التي أُجريت
- **<التاريخ> — <خفيفة/شاملة>** · <الحالة>
  - <الفحص>: <النتيجة، من أجراه> · <الملاحظة>

## الطلبات الواردة
- <التاريخ> · «<كلام العميل>» · <عطل/تغيير/عمل صيانة، من صنّفه، بند PRD أو ما لم يُحسم> · <الإصدار الذي أُغلق فيه الطلب أو مفتوح>
```
