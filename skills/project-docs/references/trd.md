# The TRD: what it is built with

Written only after the PRD is approved. It says what the project is built with and why, and once approved,
every AI on every computer follows it.

**The rule above all:** you never pick the technology. The person picks, or it is `TBD`.

## Contents

Gather first · The questions · TBD: an honest gap · The pointer line · The read-back · The document · In Arabic

## Gather first

- The approved PRD: its "must do" lines tell which parts are needed (no saving means no database).
- The code, if there is any: `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`,
  `*.csproj`, config files, the folders. Write each finding with `(found in code)` and ask the person to
  confirm it; a confirmed finding's reason is that the code already uses it, unless they give a better one.
  Nothing found in code is locked until they do.
- Anything the person already said about tools while writing the PRD.
- Reuse any already stated target platforms/devices, distribution channels, capabilities (for example,
  accounts, payments or other people's data), and explicitly requested assurance needs. Put selected
  platforms and distribution under **Where it lives**, and applicable constraints under **Work rules** or
  **Rules it must follow**, without changing the fixed headings. Do not infer a store, a legal duty or a
  conformance claim from a product name. Ask only when a missing fact changes the current choice; use the
  existing `TBD` process for an unresolved choice, rather than a new mandatory questionnaire. These are
  requirements for later builder/reviewer evidence, never proof that a platform or assurance check ran.
- A filled `docs/meeting-form.md`: where it must run, links, sign-in, languages, devices, available, speed,
  accessibility, rules and policies. These are facts about the client: never "you pick".

## The questions

**First question, always: "Is this for work, or personal?"**

- **Work** → before any technology question, ask about the rules the workplace sets. These come first
  and nothing may break them:
  1. Tools or services you **must** use (a company login, a cloud, a language, a database).
  2. Tools or services you **can't** use.
  3. Where it has to run (company servers, a cloud, a country, offline, a kind of computer).
  4. Security rules (approvals, where data may be kept, who may log in).
- **Personal** → write "None: personal project" under Work rules and go on.

**Then each part, at most 3 parts a round.** Ask each part as **one** question that already holds the
options, so the person answers once: "Screen: do you already know what you want? If not, here are 3
options and my pick." Each option has: what it is (one line) · good · bad · what is easy or hard to look
after later. All options obey the work rules.

- **They name their own pick** → write it, and ask why in one line (the reason goes in the document).
- **They click an option** → write it, with the reason from the option.
- **They give a wish, not a pick** ("something cheap or free") → show options that meet the wish.
- **"Not sure"** before seeing options means "show me the options". Only after they have seen the options
  and still want to leave it open ("not sure yet", "I'll ask someone") do you write `TBD`.
- **The part is not needed** (no back end, no outside services) → write `None`, with the reason.

The parts: **Screen** (what people see and tap) · **Brain** (the back end that does the work) ·
**Data storage** · **Where it lives** (hosting) · **Outside services** (anything outside the project it talks
to, over the internet or the client's network: logins, payments, maps, messages, AI) · **AI part** (only when the product itself uses an AI model) · **Running cost** (what is paid to
keep it running, and who pays) · **Rules it must follow** (online or offline, security,
languages, speed, available, accessibility) · **How the code is written** (language, formatting, checks, names, file size, tests, where the code is kept).

For each **Outside service**, use that same question to confirm what the product sends, what must come
back, and what the user sees or can still do when the service is down or returns a failure. Keep these
on the service's existing line; Security reuses what it receives. Do not invent a retry, fallback service
or new saved data. An unresolved choice follows the existing `TBD` process and blocks only the work
that needs it. With no outside service, keep `None` and ask nothing about service failures.

**Ask the rules first** (online or offline, languages, and which devices people will hold, which goes into
the Speed line): they change which options fit the other parts. Write the document in its own order.

Prices, free plans and limits of hosting and services change often and you cannot look them up: say so,
and tell the person to check them on the provider's site before they sign up.

**AI part:** only when the product itself uses an AI model, to answer, draft, sort, recommend or act. The
AI tool that helps build the project is not this part. No model → one line, `None: it uses no AI`, and
ask nothing more. Otherwise write its five lines:

- **Model** is a technology choice like any other: the person picks from the options, or it is `TBD`. Say
  where it runs. A model reached over the internet is an outside service too: what is sent to it, what
  must come back and what happens when it is down stay on its **Outside services** line, never repeated
  here. A model that runs on the project's own computer sends nothing outside: say so.
- **Decides alone** and **A person approves** are never a default and never "you pick": how far the AI may
  go without a person is the client's responsibility. Go through the PRD's `M` lines the AI takes part in
  and ask, for each, whether it acts alone or a person approves first, and who that person is.
- **When it is wrong:** ask how a wrong answer is noticed, who corrects it, and what the user is told (that
  an answer came from AI, how to report a wrong one). Never promise that it will not be wrong.
- **Checked by:** ask for the examples it must get right (real questions with the answer the client
  accepts), who keeps them, and when they are run again: before go-live, and after any change of the
  model or its instructions. Never write an accuracy figure the person did not give.

**Running cost** is never a default and never a guess. Once the other parts are chosen, list every part
somebody pays for to keep the project running (hosting, a database service, a domain name, each paid
outside service, an AI model charged by use, a store or licence fee) and ask the person what each one costs, what makes it grow (more
users, more messages, more storage, or "fixed"), and who pays. Write only an amount the person gave, with
where it came from; never a price from your own memory. Who pays is a fact about the client: never "you
pick".

Keep two things apart. A part **bought once and owned** (a server the client already owns) has no bill:
write that, with no amount. A part **already being paid for** (an existing subscription, a yearly renewal)
is still a running cost: ask for its amount and where it came from like any other, and keep it in the
total. When that bill also covers other work (company accounts everybody uses), say so on its line and
write the whole bill; never work out this project's share yourself. A yearly bill is written as a yearly
amount and stays one: never divide it into months.

A price that depends on a choice still open stays with that choice: say so on its line, and write no second
`TBD`. A price still open on its own, for a new part or an existing bill → `TBD`, named `the cost of <the
part>`. The **Each month** line adds up only the amounts written above it, monthly and yearly apart, and
names every part it does not count. Nothing is paid for → `None: nothing is paid for`, with the reason.

Two parts are smart defaults, not questions, unless the work rules or the person say otherwise:

- **How the code is written:** the usual tools of the chosen language (its standard formatter and checker),
  one job per file, tests beside the code. Show them in the read-back as your picks; the person's "yes,
  that's it" makes them theirs, written with "(on the AI's recommendation)" like any pick left to you (the
  Speed line too), and they can change any of them.
- **Speed:** "every page or screen opens in under 2 seconds on an ordinary phone or computer", unless the
  PRD or the meeting form says more.
- **Accessibility:** "readable contrast, works with the keyboard, respects reduced motion (see DESIGN.md)",
  unless the meeting form says more. No screens → "None: no screens".

**Available** is never a default: the hours it must work and what happens when it is down are the client's
answer. Ask, or write `TBD`. Personal project → "When the person runs it".

**Where the code is kept** is never a default either. Ask where the code and its history are kept (a
private Git repository at a provider they name, the workplace's own server, only this computer) and where
its second copy is, so a lost computer does not lose the project. The work rules come first. The person
picks; "only this computer, no second copy" is their answer to give and is written as it is. Still open →
`TBD`.

The **Security** rule in the TRD is one line: `see docs/security.md`, plus any security rule the work sets.

## TBD: an honest gap

Write a `TBD` line as `- TBD: <what is open>. Decided when <what will decide it>.` Keep the person's wish
in it when they gave one ("TBD: cheap or free hosting. Decided when …"). Every TBD stays visible until it
is picked. A Plan step that needs it cannot start. Say what an open choice blocks in the read-back, before
the TRD is written:

- **The screen** is needed by the very first step, so a TBD there blocks everything: "Nothing can be built
  until this is chosen. Settle it now, or keep it open?"
- **The data storage** blocks every step that saves or reads saved data. When the project has screens, the
  Prototype still goes first, on made-up data kept only in the screens (see the Plan): "Only the
  prototype can be built until this is chosen. Settle it now, or keep it open?" No screens → it blocks
  everything that saves, like the screen.
- **The hosting** blocks only the step that puts it online: until then it runs on the builder's computer.
- **Where the code is kept** blocks only the step that releases it or hands it over: until then it is
  built on the builder's computer.
- **The AI part** blocks only the steps that build or use it: the rest of the product can be built.
- **A running cost** blocks only the step that starts paying for it (putting it online, or signing up for
  the service): everything before that step can be built.

## The pointer line (only on the person's yes)

After the TRD is approved, offer once: "Shall I add one line to AGENTS.md / CLAUDE.md so every AI reads these
documents before coding?" On yes, add this line to whichever of the two files the project has (both if it
has both; if it has neither, create `AGENTS.md` holding only this line):

```text
Before writing code, read the project documents in docs/ and DESIGN.md. Locked choices there change only with the owner's yes.
```

Change nothing else in those files.

## The read-back

> Work project: must use the clinic's Microsoft logins, patient data stays in the country. Screen: Next.js.
> Brain: Next.js server routes. Data: PostgreSQL. Lives on the clinic's own server. Outside services: staff
> login + a text-message service (TBD). Running cost: the Microsoft accounts they already pay for, about
> 450 AED a month, and the web address, about 60 AED a year, both paid by the clinic; the text messages are
> not counted yet; the server is theirs, with no bill. Works online only, English and Arabic. Code: TypeScript, Prettier,
> ESLint, Vitest. Is that it?

## The document

Write exactly these headings, in this order. Each choice is one line: `- <choice>, because <reason>.`
Approved choices are **locked**: change them only on the person's yes, with a dated `Changed` line under
the old one (see SKILL.md).

```markdown
# TRD: <Project name>
> v1 · Draft

## Work rules
- <Must use / can't use / where it runs / security rule, or "None: personal project">

## Screen
- <choice>, because <reason>.

## Brain
- <choice>, because <reason>.

## Data storage
- <choice>, because <reason>.

## Where it lives
- <choice>, because <reason>.

## Outside services
- <service: what it is for; sends …; expects …; if unavailable …>, because <reason>.

## AI part
- **Model:** <which model, and where it runs>, because <reason>.
- **Decides alone:** <what it may do with no person checking / Nothing: a person approves everything>
- **A person approves:** <what waits for a person, and who approves it / Nothing: see Decides alone>
- **When it is wrong:** <how a wrong answer is noticed, who corrects it, what the user is told>
- **Checked by:** <the examples it must get right, who keeps them, and when they are run again>

## Running cost
- <each paid part: what it is, about <amount> a month or a year (from <where the price came from>), and what makes it grow, or "fixed">
- **Each month:** <about <the monthly amounts added up> a month, plus <the yearly amounts added up> a year, paid by <who>; not counted: <each part with no amount yet> / None: nothing is paid for, because <reason>>

## Rules it must follow
- **Online or offline:** <…>
- **Security:** <…>
- **Languages:** <…>
- **Speed:** <…>
- **Available:** <the hours it must work, and what happens when it is down>
- **Accessibility:** <…>

## How the code is written
- **Language:** <…>
- **Formatting:** <…>
- **Checks:** <…>
- **Names:** <…>
- **File size:** <…>
- **Tests:** <…>
- **Kept in:** <where the code and its history are kept, and where the second copy is>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings and fixed words.
Names of tools and code stay as they are (Next.js, PostgreSQL).

استخدم ما ذكره الشخص أصلًا عن المنصات والأجهزة وقنوات التوزيع وقدرات المشروع ومتطلبات الضمان الصريحة.
ضع المنصات والتوزيع تحت **أين يعمل** والقيود ذات الصلة تحت **قواعد العمل** أو **القواعد التي يلتزم بها**،
دون عناوين جديدة. لا تفترض متجرًا أو واجبًا قانونيًا أو ادعاء مطابقة. اسأل فقط إذا غيّر المجهول القرار
الحالي، واستخدم «لم يُحسم بعد» للقرار المفتوح. لا تضف استبيانًا إلزاميًا، ولا تكتب المتطلب كأنه فحص ناجح؛
دليل التنفيذ مسؤولية المطوّر أو المراجع لاحقًا.

لكل **خدمة خارجية**، أكمل السؤال نفسه بما يرسله المنتج وما يجب أن يعود به، وما يراه المستخدم أو
يستطيع فعله عند تعطّل الخدمة أو فشل الرد. تبقى هذه التفاصيل في سطر الخدمة الحالي، ويعيد الأمان
استخدام ما تستقبله. لا تخترع إعادة محاولة أو خدمة بديلة أو بيانات محفوظة جديدة. القرار المفتوح يتبع
«لم يُحسم بعد» ويعطّل العمل الذي يحتاجه فقط. دون خدمة خارجية، أبقِ «لا شيء» ولا تسأل عن تعطّلها.

**جزء الذكاء الاصطناعي:** فقط عندما يستخدم المنتج نفسه نموذج ذكاء اصطناعي ليجيب أو يصوغ أو يصنّف أو
يوصي أو يتصرف. أداة الذكاء الاصطناعي التي تساعد في بناء المشروع ليست هذا الجزء. إن لم يوجد نموذج
فاكتب سطرًا واحدًا «لا شيء: لا يستخدم الذكاء الاصطناعي» ولا تسأل أكثر. وإلا فاكتب أسطره الخمسة:

- **النموذج** اختيار تقني كغيره: يختاره الشخص من الخيارات، أو يبقى «لم يُحسم بعد». اذكر أين يعمل.
  النموذج الذي يُوصل إليه عبر الإنترنت خدمة خارجية أيضًا: ما يُرسل إليه وما يجب أن يعود به وما يحدث عند
  تعطّله يبقى في سطره تحت **الخدمات الخارجية** ولا يُكرَّر هنا. والنموذج الذي يعمل على حاسوب المشروع نفسه
  لا يرسل شيئًا إلى الخارج: اذكر ذلك.
- **يقرر وحده** و**يعتمده إنسان** ليسا خيارًا افتراضيًا ولا «اختر أنت»: مدى تصرف الذكاء الاصطناعي دون إنسان
  مسؤولية العميل. مرّ على أسطر `M` في PRD التي يشارك فيها الذكاء الاصطناعي، واسأل عن كل سطر: هل يتصرف
  وحده أم يعتمده إنسان أولًا، ومن هو ذلك الإنسان.
- **عند الخطأ:** اسأل كيف يُلاحَظ الجواب الخاطئ، ومن يصحّحه، وماذا يُقال للمستخدم (أن الجواب من الذكاء
  الاصطناعي، وكيف يبلّغ عن جواب خاطئ). ولا تعد بأنه لن يخطئ.
- **يُفحص بـ:** اسأل عن الأمثلة التي يجب أن يجيب عنها صحيحًا (أسئلة حقيقية مع الجواب الذي يقبله العميل)،
  ومن يحتفظ بها، ومتى تُعاد: قبل الإطلاق، وبعد أي تغيير في النموذج أو تعليماته. ولا تكتب نسبة دقة لم
  يذكرها الشخص.

القرار المفتوح هنا يعطّل فقط الخطوات التي تبني هذا الجزء أو تستخدمه.

**تكلفة التشغيل** ليست خيارًا افتراضيًا ولا تخمينًا: بعد اختيار الأجزاء الأخرى، اذكر كل جزء يُدفع مقابله
ليبقى المشروع يعمل (الاستضافة، خدمة قاعدة بيانات، اسم النطاق، كل خدمة خارجية مدفوعة، رسوم متجر أو
ترخيص)، واسأل الشخص عن تكلفة كل جزء، وما الذي يزيدها، ومن يدفعها. اكتب فقط المبلغ الذي ذكره الشخص مع
مصدره، ولا تكتب سعرًا من ذاكرتك. من يدفع حقيقة عن العميل وليس «اختر أنت».

فرّق بين أمرين. الجزء **المشترى مرة واحدة والمملوك** (خادم يملكه العميل أصلًا) لا فاتورة له: اكتب ذلك دون
مبلغ. والجزء **الذي يُدفع له أصلًا باستمرار** (اشتراك قائم، تجديد سنوي) يبقى تكلفة تشغيل: اسأل عن مبلغه
ومصدره كأي جزء آخر، وأبقِه في المجموع. وإن كانت الفاتورة تغطي أعمالًا أخرى أيضًا (حسابات الشركة التي
يستخدمها الجميع) فاذكر ذلك في سطره واكتب الفاتورة كلها، ولا تحسب نصيب هذا المشروع بنفسك. والفاتورة
السنوية تُكتب مبلغًا سنويًا وتبقى كذلك، ولا تُقسَّم على الأشهر.

السعر المرتبط بقرار ما زال مفتوحًا يبقى مع ذلك القرار، ولا يُكتب له سطر مفتوح ثانٍ. وإن بقي السعر وحده
مفتوحًا، لجزء جديد أو لفاتورة قائمة، فهو «لم يُحسم بعد» باسم «تكلفة <الجزء>»، ويعطّل فقط الخطوة التي يبدأ
عندها الدفع. وسطر **كل شهر** يجمع فقط المبالغ المكتوبة فوقه، الشهري وحده والسنوي وحده، ويسمّي كل جزء لم
يحسبه. وإن لم يُدفع شيء فاكتب «لا شيء: لا يُدفع شيء» مع السبب.

**مكان الكود** ليس خيارًا افتراضيًا: اسأل أين يُحفظ الكود وتاريخه وأين نسخته الثانية، حتى لا يضيع
المشروع بضياع حاسوب واحد. قواعد العمل أولًا، والشخص هو من يختار؛ وإن بقي مفتوحًا فهو «لم يُحسم بعد»
ويعطّل خطوة الإصدار أو التسليم فقط.

| English | Arabic |
|---|---|
| `- <choice>, because <reason>.` | `- <الاختيار>، لأن <السبب>.` |
| `- TBD: <what is open>. Decided when <…>.` | `- لم يُحسم بعد: <ما المفتوح>. يُحسم عندما <…>.` |
| `  - Changed <date>: X → Y, because <…>.` | `  - تغيّر في <التاريخ>: من X إلى Y، لأن <…>.` |
| `  - Changed <date>: TBD → <choice>, because <…>.` | `  - تغيّر في <التاريخ>: من لم يُحسم بعد إلى <الاختيار>، لأن <…>.` |
| `None: personal project` | `لا شيء: مشروع شخصي` |

```markdown
# المتطلبات التقنية (TRD): <اسم المشروع>
> الإصدار 1 · مسودة

## قواعد العمل
- <يجب استخدام / لا يجوز استخدام / مكان التشغيل / قاعدة أمان، أو «لا شيء: مشروع شخصي»>

## الواجهة
- <الاختيار>، لأن <السبب>.

## الخادم
- <الاختيار>، لأن <السبب>.

## تخزين البيانات
- <الاختيار>، لأن <السبب>.

## أين يعمل
- <الاختيار>، لأن <السبب>.

## الخدمات الخارجية
- <الخدمة: الغرض منها؛ يرسل …؛ ينتظر …؛ عند التعطّل …>، لأن <السبب>.

## جزء الذكاء الاصطناعي
- **النموذج:** <أي نموذج، وأين يعمل>، لأن <السبب>.
- **يقرر وحده:** <ما يفعله دون مراجعة إنسان / لا شيء: يعتمد إنسان كل شيء>
- **يعتمده إنسان:** <ما ينتظر إنسانًا، ومن يعتمده / لا شيء: انظر يقرر وحده>
- **عند الخطأ:** <كيف يُلاحَظ الجواب الخاطئ، ومن يصحّحه، وماذا يُقال للمستخدم>
- **يُفحص بـ:** <الأمثلة التي يجب أن يجيب عنها صحيحًا، ومن يحتفظ بها، ومتى تُعاد>

## تكلفة التشغيل
- <كل جزء مدفوع: ما هو، نحو <المبلغ> في الشهر أو السنة (من <مصدر السعر>)، وما الذي يزيده، أو «ثابت»>
- **كل شهر:** <نحو <مجموع المبالغ الشهرية> في الشهر، إضافةً إلى <مجموع المبالغ السنوية> في السنة، يدفعه <من>؛ غير محسوب: <كل جزء بلا مبلغ بعد> / لا شيء: لا يُدفع شيء، لأن <السبب>>

## القواعد التي يلتزم بها
- **متصل أو دون اتصال:** <…>
- **الأمان:** <…>
- **اللغات:** <…>
- **السرعة:** <…>
- **التوفر:** <الساعات التي يجب أن يعمل فيها، وماذا يحدث عندما يتوقف>
- **سهولة الوصول:** <…>

## طريقة كتابة الكود
- **اللغة:** <…>
- **التنسيق:** <…>
- **الفحص:** <…>
- **الأسماء:** <…>
- **حجم الملفات:** <…>
- **الاختبارات:** <…>
- **مكان الكود:** <أين يُحفظ الكود وتاريخه، وأين نسخته الثانية>
```
