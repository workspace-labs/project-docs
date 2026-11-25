# The PRD: what we build and why

The first document, and the one everything after it builds on. It is short (about one page) and holds no
technology: if the person names a tool or a language, note it for the TRD and keep it out of the PRD.

## Contents

Gather first · The questions · The read-back · The document · In Arabic

## Gather first

Before asking, read what already says what the project is: a filled `docs/meeting-form.md`, `docs/scope.md`,
`README.md`, the person's own description of the idea in this conversation, and the code if there is any.
Turn what you find into proposed answers, so the person confirms instead of starting from nothing. For a
client project using the [meeting form](meeting-form.md), a Stage 4 **Stop** ends the work. Draft the PRD
once the person confirms the answers are clear enough. Scope approval takes place in its own Stage 4 meeting.

For a [development](develop.md), confirm how the built project works today before planning the change.

## The questions

Ask at most 3 questions a round. Once the person has said something to build from, offer 2 or 3 short
drafts built **only from their own words**, plus "Other: type your own". Before that (the very first idea
and its why), ask openly. A `docs/scope.md`, a README or a description they already gave in the conversation
counts as something to build from: Round 1 then proposes drafts from it, and they confirm or correct. Never
invent a fact, a number or a user group.

**Round 1: the idea**
1. **What is it, and what is it called?** In two or three sentences, what does it do and where is it used?
   If it has no name yet, propose one or two from the person's own words.
2. **Why?** What problem does it solve, and what goes wrong without it?
3. **Who is it for?** Each kind of user and what they need from it. One kind, or several?

**Round 2: the work**
4. **How does the work run today?** The steps, in order, and who does each one, on paper or in which
   system. Write 2 to 6 short numbered steps. For a client project, ask the people who do the work,
   including those who do not manage it.
5. **How will it run with the project?** The same work, step by step, after it is built. Only as far as the
   answers support: never draw an ideal nobody described.
6. **What must it do?** The main things a user can do. Each becomes one line: "The patient can book a
   visit." Aim for 3 to 8. Under each line, one **Check**: how we prove it works, a step anyone can try
   ("book a visit for tomorrow; it shows in the front desk list"). Anything that is only nice to have, or
   that the client wants later, goes under **Later**.

**Round 3: the edges**
7. **What will it NOT do?** Suggest 2 or 3 tempting extras the person might rule out ("No online payment
   in the first version?"). These stop the project from growing in secret.
8. **What are we assuming, and what could go wrong?** Each assumption is something the plan needs to be
   true ("the IT lead approves the server in time"); each risk is what could delay or stop it. "None" is an
   answer.

**Round 4: done, who decides, dates and budget**
9. **How will we know it worked?** Each answer is a check anyone can try: "A patient books a visit in under
   two minutes on a phone", not "it is easy to use". A check that can only be seen after a while ("the
   paper list is gone within a month") says when.
10. **Who decides?** Who owns the project, who approves this scope, who approves the first version they can
    try (the prototype), who runs the acceptance test (UAT) and signs it off, and who else must be involved
    (an IT department, a security team) with what they need. Ask for a name or a job, never a phone number.
    If the person builds it only for themselves, that is one answer: they decide alone. Who decides is a
    fact about the client: never "you pick". Ask, or write `TBD`.
11. **Dates and budget?** Reuse the meeting form's timeline and budget. Record the dates for start of
    work, the first version they try (prototype), acceptance test (UAT), and handover / go-live. For
    each date given, keep whether it is fixed or can move. Keep why the dates matter and what slips
    would affect. Is there a budget, and does it cover the prototype and the tests? "No date" and
    "no budget" are answers. The Plan takes its `Target` dates from this section.
    For a development, ask about dates and budget only after the person has sorted the gaps and health
    findings.

For a project built only for oneself, skip asking other workers. "What goes wrong without it?" and
"How does the work run today?" may be answered "None". The current and planned workflows can be one
line each. **Assumptions and risks** and **Dates and budget** may each say "None". For **Who decides**,
confirm the sole owner if that is still unclear.

Ask follow-ups whenever an answer is vague ("fast", "simple", "everyone"): ask what it means in practice.
If an answer clashes with an earlier one, say so and ask which wins. If the person truly does not know
yet, write `- TBD: <what is open>. Decided when <what will decide it>.` under the heading it belongs to.

## The read-back

Say it back in five or six short lines before writing, for example:

> Cedar Clinic Booking lets patients book, move and cancel visits on their phone, so the front desk stops
> spending mornings on the phone. Two users: patients and the front desk. It must do 5 things (book, move,
> cancel, see today's list, send a reminder). It will not take payments or keep medical records. It worked
> when a patient books in under two minutes. Today every booking is a phone call; after, patients book
> themselves and the desk only checks the list. The clinic manager owns it and signs it off; the front desk
> lead tries the prototype and runs the acceptance test; the IT lead must approve the server. Is that it?

For a client project, the PRD's **Approves the scope** names the scope approver. In the Stage 4 read-back,
mark every agent-drafted `Check:` line and **How we know it worked** check as proposed. Ask that approver
to confirm or correct each proposed check explicitly. Silence leaves a check open. If the approver
approves the rest while a check is open, record it as `TBD` in the PRD with that approver named in
`Decided when …`.

## The document

Write exactly these headings, in this order. Number the "must do" lines `M1`, `M2` and so on: the Plan
names them, so a number never changes once the PRD is approved (a dropped line is struck through, not
renumbered).

Under each `M` line goes one `Check:` line, two spaces in: the acceptance test (UAT) tries these checks.
After approval, a change to the scope is a `Changed` line, approved by the person who approves the scope.
For a [development](develop.md), put its mark at the end of the `M` line and keep the `Check:` directly below.

**Who decides** has these five lines, in this order. Someone who builds it only for themselves writes one
line instead, `- **Owner**: <who>, alone.`. Their [Plan](plan.md) skips the fixed client delivery
sequence and can still start with a disposable screen prototype when it helps. They need a
[Handover](handover.md) only if they ask for a maintenance record.

```markdown
# PRD: <Project name>
> v1 · Draft

## What it is
<Two or three sentences.>

## Why
<The problem it solves, and what goes wrong without it.>

## Who it's for
- **<Kind of user>**: <what they need from it>

## How it works today
1. <step, and who does it>

## How it will work
1. <step, and who does it>

## Who decides
- **Owner**: <who the project belongs to>
- **Approves the scope**: <who approves this PRD>
- **Approves the prototype**: <who tries the first version and says go on>
- **Accepts it (UAT)**: <who runs the acceptance test and signs it off>
- **Others to involve**: <who else, and what they need / None>

## What it must do
- **M1.** <The user can …>
  - Check: <a step anyone can try, and what they see>
- **M2.** <…>
  - Check: <…>

## What it will NOT do
- <…>

## Later
- <wanted, but not in this version / None>

## Assumptions and risks
- **Assumption:** <what must be true / None>
- **Risk:** <what could delay or stop it / None>

## How we know it worked
- <A check anyone can try.>

## Dates and budget
- **Dates:** <start, prototype, UAT and handover / go-live dates; fixed or can move; why, and what happens if they slip / None: no date>
- **Budget:** <the budget, and whether it covers the prototype and tests / None: no budget>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings. Keep `M1`, `M2`…
as they are: the Plan names them. The check line under each is `  - الفحص: …`. Someone who builds it only
for themselves writes under **من يقرر** one line, `- **المالك**: <من>، وحده.`
تتجاوز [خطة](plan.md) المشروع الشخصي الفردي خطوات التسليم الثابتة للعميل، ويمكن أن تبدأ بنموذج أولي
للشاشات يُستبعد بعد تجربته إذا كان ذلك مفيدًا.

عند [تطوير مشروع قائم](develop.md#in-arabic)، ابدأ بتأكيد طريقة عمله اليوم. ضع علامة البند في نهاية سطر
`M` وأبقِ سطر «الفحص» تحته مباشرة.

في مشروع للعميل، يعتمد النطاقَ من سُمّي في خانة **يعتمد النطاق**. عند إعادة عرض المسودة في المرحلة الرابعة،
اعرض كل سطر «الفحص» كتبته أنت وكل فحص اقترحته تحت **كيف نعرف أنه نجح** على أنه مقترح. اطلب من جهة اعتماد
النطاق تأكيد كل فحص أو تصحيحه صراحةً. يبقى الفحص مفتوحًا عند عدم الرد. إذا اعتُمد باقي النطاق، سجّل ذلك
الفحص تحت «لم يُحسم بعد»، واذكر من يقرره ضمن عبارة «يُحسم عندما …».

في المشروع الشخصي الفردي، لا تسأل أشخاصًا آخرين عن طريقة العمل. يجوز أن تكون الإجابة «لا شيء» عن
«ما الذي يتعثر من دونه؟» و«كيف يسير العمل اليوم؟» وكذلك في **المواعيد والميزانية**. في مشروع العميل، انقل
مواعيد نموذج الاجتماع إلى هذا القسم مع بيان ما إذا كانت ثابتة أو قابلة للتغيير، ولماذا تهم، وما أثر تأخيرها.
تأخذ الخطة مواعيدها المستهدفة من هنا.
عند تطوير مشروع قائم، اسأل عن المواعيد والميزانية بعد أن يقرر الشخص ما سيفعله بكل ثغرة وكل ملاحظة
من فحص سلامة المشروع.

```markdown
# متطلبات المنتج (PRD): <اسم المشروع>
> الإصدار 1 · مسودة

## ما هو
<جملتان أو ثلاث.>

## لماذا
<المشكلة التي يحلها، وما الذي يتعثر من دونه.>

## لمن
- **<نوع المستخدم>**: <ما يحتاجه منه>

## كيف يسير العمل اليوم
1. <الخطوة، ومن يقوم بها>

## كيف سيسير العمل معه
1. <الخطوة، ومن يقوم بها>

## من يقرر
- **المالك**: <لمن المشروع>
- **يعتمد النطاق**: <من يعتمد هذه الوثيقة>
- **يعتمد النموذج الأولي**: <من يجرّب أول نسخة ويقول استمروا>
- **يقبله (اختبار القبول UAT)**: <من يجري اختبار القبول ويوقّع عليه>
- **جهات أخرى**: <من غيرهم، وما يحتاجونه / لا شيء>

## ما يجب أن يفعله
- **M1.** <يستطيع المستخدم …>
  - الفحص: <خطوة يستطيع أي أحد تجربتها، وما يراه>
- **M2.** <…>
  - الفحص: <…>

## ما لن يفعله
- <…>

## لاحقًا
- <مطلوب، لكن ليس في هذا الإصدار / لا شيء>

## الافتراضات والمخاطر
- **افتراض:** <ما يجب أن يكون صحيحًا / لا شيء>
- **خطر:** <ما قد يؤخره أو يوقفه / لا شيء>

## كيف نعرف أنه نجح
- <فحص يستطيع أي أحد تجربته.>

## المواعيد والميزانية
- **المواعيد:** <مواعيد بدء العمل والنموذج الأولي واختبار القبول والتسليم أو الإطلاق؛ ثابتة أم قابلة للتغيير؛ ولماذا تهم وما أثر التأخير / لا شيء: لا موعد>
- **الميزانية:** <الميزانية، وهل تشمل النموذج الأولي والاختبارات / لا شيء: لا ميزانية>
```
