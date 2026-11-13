# The client meeting form

A blank form someone prints and takes to the client, before any document is written. Understanding a
project takes **four meetings, not one**: the goal, the people and today's work, the needs and the new way,
then the decision to approve the scope or stop. In the room there is no AI: only questions, blanks and
signatures. After each meeting the filled pages come back; after the third, the PRD is drafted from them and
taken to the fourth. Nobody asks the client twice.

## Contents

When · The four meetings · Writing the blank form · After each meeting · The form · In Arabic

## When

Offer it when the person says they are meeting a client, or asks for a meeting form, an intake form or a
list of questions for the client. It comes **before** the PRD and is not one of the approved documents: it
has no stamp and no version. Someone who builds a project only for themselves needs no form.

## The four meetings

| Meeting | Its purpose | Who comes from the client | It ends with |
|---|---|---|---|
| 1. The goal | what they want to achieve and why, who decides, dates and budget | the owner | the goal written down |
| 2. The people and today's work | who will use it, and how the work runs today, step by step | the owner and people who do the work, not only their manager | both sides sign the notes |
| 3. The needs and the new way | how the work will run with it, what it must do and how each is checked, what later stages need | the owner, users, IT or security | the draft list, still not approved |
| 4. Approve the scope, or stop | the draft PRD read back to the person who approves the scope | the person who approves the scope | approved, changes, or stop |

- A small project may hold meetings 1 and 2 in one sitting. Meeting 4 is always its own meeting, after the
  PRD is drafted: the scope is never approved in the room where the needs were first heard.
- **Stopping is a valid result**, not a failed project: no real need, the need is already met, or a limit
  makes it impossible.
- Signing the notes (meeting 2) is not approving the scope (meeting 4), and neither is accepting the
  finished system (the acceptance test, in the Plan).

## Writing the blank form

1. Write `docs/meeting-form.md` from the template below, with exactly its headings. Fill in only what the
   person already gave (the project name, the client); leave every other blank empty. Never fill a blank
   with a guess. No name yet → use the person's own words for it ("Car park project").
2. Do not change the questions to fit the project: the same form for every project is what makes it
   reliable. A question that does not apply is answered "does not apply" in the meeting.
3. It prints as it is. If your tool can turn markdown into a PDF or a Word file without installing anything,
   offer that too, and make it only on a yes, beside the form (`docs/meeting-form.pdf` or `.docx`). Do not
   wait for the answer to go on.

## After each meeting

1. The person types the answers into `docs/meeting-form.md`, or gives a photo or scan of the paper. Read it
   and write the answers into the file under their questions; mark a word you cannot read `[unreadable]`.
   When one answer was given under another question, write `(see <section>)` in the empty one: it is not a
   blank. A blank, "not known" or "not decided" is a fact about the client, never "you pick": it is asked
   in the next meeting or becomes a `TBD`.
2. **After meeting 2:** if your list of available skills has one named `workflow-project`, offer once to draw
   how the work runs today, A to Z, to take to meeting 3. Never install it.
3. **After meeting 3:** draft the PRD. Every answer becomes a **proposed** line, never an approved one; ask
   the person only about blanks and clashes, then write the PRD as a Draft for meeting 4. Section 8 goes
   under **Assumptions and risks**.
4. **After meeting 4:**
   - **Approved** → stamp the PRD `Approved`, with the date and the person who approves the scope.
   - **Changes** → make them in the PRD, raise its version, and take it to another meeting 4.
   - **Stop** → write nothing more. The PRD stays a Draft. Say once that the project stopped, and why.

   After approval, every change to the scope is written down and approved by that same person before it is
   built (the PRD's `Changed` lines).
5. The other answers wait in the file for the document that uses them: the TRD (where it must run, links,
   sign-in, languages, devices, available, speed, accessibility, rules), the Design (brand), Data (how long
   it is kept, old records), Security, the Handover (training, after the handover, announcing it, retiring
   it), and the Plan (what they want to try first, testing). Each **open question** becomes a `TBD` in the
   document it belongs to.
6. Signatures that came back missing: go on, and say so once.

## The form

```markdown
# Client meeting form: <Project name>

| | |
|---|---|
| Client (organisation, department) | |
| Met by (our team) | |

Four meetings before anything is built: 1 the goal · 2 the people and today's work · 3 the needs and the new
way · 4 approve the scope, or stop. Write what the client says, in their words. Never guess: write "not
decided".

## Meeting 1: the goal
Date and place: · Present (name and job of each):

### 1. The project
- **What is it, in two or three sentences?**
- **What problem does it solve? What goes wrong without it?**
- **Dates:** is there a deadline? Is it fixed, or can it move?
- **Budget:** is there a budget? Does it cover the prototype and the tests?

### 2. Who is involved
| Role | Name and job |
|---|---|
| Owner: who the project belongs to | |
| Approves the scope | |
| Approves the prototype (the first version they try) | |
| Accepts it: runs the acceptance test (UAT) and signs | |
| Others to involve (IT, security, other departments) and what they need | |

- **Who only needs to be told about it?**
- **One contact person on each side:**

## Meeting 2: the people and today's work
Date and place: · Present (name and job of each):

### 3. Who will use it
| Kind of user | What they need from it | How many, and how many at the busiest time |
|---|---|---|
| | | |
| | | |
| | | |

### 4. How the work runs today
| # | Step | Who does it | On paper, or in which system? |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

- **What goes wrong today, or takes too long?**
- **Unusual cases:** what happens when something is late, missing or wrong?
- **Papers, forms or files used today:** (ask for a copy)

### Signatures: the notes of meetings 1 and 2
These notes match what was said. They do not approve the scope: that is meeting 4.

| | Name | Signature | Date |
|---|---|---|---|
| For the client | | | |
| For our team | | | |

## Meeting 3: the needs and the new way
Date and place: · Present (name and job of each):

### 5. How the work will run with it
| # | Step | Who does it |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

### 6. What it must do
| # | The user can … | Now or later? | How we check it |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |

- **What will it NOT do?** (tempting extras to rule out)
- **How will we know it worked?** (checks anyone can try: "books a visit in under two minutes")

### 7. Later stages: ask now
- **Data:** does it keep personal or sensitive information? What kind? Any rule on where it must stay, or
  how long it may be kept?
- **Old records:** do records from today's paper or system move into it? How many, and who checks them?
- **Where it must run:** the client's own network or servers, a cloud, or devices? Is the internet allowed?
  Who gives us access?
- **Available:** which hours must it work? What happens when it is down?
- **Speed:** how fast must it answer, at the busiest time?
- **Devices:** which devices people use (phones, computers, a shared screen).
- **Languages:** which languages it must offer.
- **Brand:** is there a logo, colours or brand rules to follow?
- **Accessibility:** does anyone need large text, a screen reader or the keyboard only?
- **Links to other systems:** which systems must it talk to, what goes between them, who owns them?
- **Sign-in:** who signs in, and with which accounts (existing work accounts)?
- **Security:** any security rules, reviews or approvals it must pass?
- **Rules and policies:** any law or policy it must follow?
- **Prototype:** what would they like to try first?
- **Testing and acceptance:** who tests it, when, and with what data?
- **Training:** who is trained, how, and for how long?
- **Handover:** which documents do they expect, and who receives it?
- **After the handover:** who runs it, and who fixes problems and makes updates?
- **Announcing it:** will it be announced, to whom, by whom?
- **Retiring it:** what would end it one day, who decides, and what happens to the data?

### 8. Assumptions and risks
- **What are we assuming is true?**
- **What could go wrong, or delay it?**

### 9. Open questions and notes
-

## Meeting 4: approve the scope, or stop
Date and place: · Present (name and job of each):

Bring the draft PRD, written from meetings 1 to 3. Read it back to the person who approves the scope.

### 10. The decision
| Decision | ✓ |
|---|---|
| Approved | |
| Changes first (listed below, then another meeting 4) | |
| Stop (why, below) | |

- **Changes asked, or why it stops:**

After approval, every change is written down and approved by the person who approves the scope before it is
built.

| | Name | Signature | Date |
|---|---|---|---|
| Approves the scope | | | |
| For our team | | | |
```

## In Arabic

When the person asks for Arabic, write the same form in Arabic with these headings.

```markdown
# نموذج اجتماع العميل: <اسم المشروع>

| | |
|---|---|
| العميل (الجهة، القسم) | |
| من فريقنا | |

أربعة اجتماعات قبل أن يُبنى أي شيء: 1 الهدف · 2 الأشخاص والعمل اليوم · 3 الاحتياجات والطريقة الجديدة ·
4 اعتماد النطاق أو التوقف. اكتب ما يقوله العميل بكلماته. لا تخمّن: اكتب «لم يُحسم».

## الاجتماع 1: الهدف
التاريخ والمكان: · الحاضرون (اسم كل واحد ووظيفته):

### 1. المشروع
- **ما هو، في جملتين أو ثلاث؟**
- **ما المشكلة التي يحلها؟ وما الذي يتعثر من دونه؟**
- **المواعيد:** هل هناك موعد نهائي؟ هل هو ثابت أم يمكن أن يتغير؟
- **الميزانية:** هل هناك ميزانية؟ وهل تشمل النموذج الأولي والاختبارات؟

### 2. من المعنيون
| الدور | الاسم والوظيفة |
|---|---|
| المالك: لمن المشروع | |
| يعتمد النطاق | |
| يعتمد النموذج الأولي (أول نسخة يجرّبونها) | |
| يقبله: يجري اختبار القبول (UAT) ويوقّع | |
| جهات أخرى (تقنية المعلومات، الأمن، أقسام أخرى) وما تحتاجه | |

- **من يكفي أن يُبلَّغ به فقط؟**
- **شخص واحد للتواصل من كل جانب:**

## الاجتماع 2: الأشخاص والعمل اليوم
التاريخ والمكان: · الحاضرون (اسم كل واحد ووظيفته):

### 3. من سيستخدمه
| نوع المستخدم | ما يحتاجه منه | كم عددهم، وكم منهم في وقت الذروة |
|---|---|---|
| | | |
| | | |
| | | |

### 4. كيف يسير العمل اليوم
| # | الخطوة | من يقوم بها | على الورق، أم في أي نظام؟ |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

- **ما الذي يتعثر اليوم أو يأخذ وقتًا طويلًا؟**
- **الحالات غير المعتادة:** ماذا يحدث عندما يتأخر شيء أو ينقص أو يكون خطأ؟
- **الأوراق والنماذج والملفات المستخدمة اليوم:** (اطلب نسخة)

### التوقيعات: ملاحظات الاجتماعين 1 و2
هذه الملاحظات تطابق ما قيل. وهي لا تعتمد النطاق: ذلك في الاجتماع 4.

| | الاسم | التوقيع | التاريخ |
|---|---|---|---|
| عن العميل | | | |
| عن فريقنا | | | |

## الاجتماع 3: الاحتياجات والطريقة الجديدة
التاريخ والمكان: · الحاضرون (اسم كل واحد ووظيفته):

### 5. كيف سيسير العمل معه
| # | الخطوة | من يقوم بها |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

### 6. ما يجب أن يفعله
| # | يستطيع المستخدم … | الآن أم لاحقًا؟ | كيف نفحصه |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |

- **ما الذي لن يفعله؟** (إضافات مغرية نستبعدها)
- **كيف نعرف أنه نجح؟** (فحوص يستطيع أي أحد تجربتها: "يحجز موعدًا في أقل من دقيقتين")

### 7. المراحل اللاحقة: نسأل الآن
- **البيانات:** هل يحفظ معلومات شخصية أو حساسة؟ من أي نوع؟ هل هناك قاعدة لمكان بقائها، أو لمدة الاحتفاظ بها؟
- **السجلات القديمة:** هل تُنقل إليه سجلات من الورق أو النظام الحالي؟ كم عددها، ومن يراجعها؟
- **أين يجب أن يعمل:** على شبكة العميل أو خوادمه، أم في سحابة، أم على أجهزة؟ هل الإنترنت مسموح؟ ومن يمنحنا الوصول؟
- **التوفر:** في أي ساعات يجب أن يعمل؟ وماذا يحدث عندما يتوقف؟
- **السرعة:** ما مدى سرعة استجابته المطلوبة في وقت الذروة؟
- **الأجهزة:** ما الأجهزة التي يستخدمونها (هواتف، حواسيب، شاشة مشتركة)؟
- **اللغات:** ما اللغات التي يجب أن يقدّمها؟
- **الهوية:** هل هناك شعار أو ألوان أو قواعد هوية يجب اتباعها؟
- **سهولة الوصول:** هل يحتاج أحد إلى خط كبير أو قارئ شاشة أو لوحة المفاتيح فقط؟
- **الربط بأنظمة أخرى:** ما الأنظمة التي يجب أن يتصل بها، وما الذي يُتبادل بينها، ومن يملكها؟
- **الدخول:** من يدخل، وبأي حسابات (حسابات العمل الحالية)؟
- **الأمان:** هل هناك قواعد أو مراجعات أو موافقات أمنية يجب أن يجتازها؟
- **القواعد والسياسات:** هل هناك قانون أو سياسة يجب أن يلتزم بها؟
- **النموذج الأولي:** ماذا يريدون أن يجرّبوا أولًا؟
- **الاختبار والقبول:** من يختبره، ومتى، وبأي بيانات؟
- **التدريب:** من يُدرَّب، وكيف، وكم من الوقت؟
- **التسليم:** ما الوثائق المتوقعة، ومن يستلمه؟
- **بعد التسليم:** من يشغّله، ومن يصلح المشكلات ويجري التحديثات؟
- **الإعلان عنه:** هل سيُعلن عنه، ولمن، ومن يعلنه؟
- **إيقافه:** ما الذي قد ينهيه يومًا، ومن يقرر، وماذا يحدث للبيانات؟

### 8. الافتراضات والمخاطر
- **ما الذي نفترض أنه صحيح؟**
- **ما الذي قد يتعثر أو يؤخره؟**

### 9. أسئلة مفتوحة وملاحظات
-

## الاجتماع 4: اعتماد النطاق أو التوقف
التاريخ والمكان: · الحاضرون (اسم كل واحد ووظيفته):

أحضر مسودة وثيقة PRD المكتوبة من الاجتماعات 1 إلى 3، واقرأها على من يعتمد النطاق.

### 10. القرار
| القرار | ✓ |
|---|---|
| معتمد | |
| تعديلات أولًا (مكتوبة أدناه، ثم اجتماع 4 آخر) | |
| توقف (السبب أدناه) | |

- **التعديلات المطلوبة، أو سبب التوقف:**

بعد الاعتماد، يُكتب كل تغيير ويعتمده من يعتمد النطاق قبل أن يُبنى.

| | الاسم | التوقيع | التاريخ |
|---|---|---|---|
| يعتمد النطاق | | | |
| عن فريقنا | | | |
```
