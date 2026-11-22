# The TRD: what it is built with

Written only after the PRD is approved. It says what the project is built with and why, and once approved,
every AI on every computer follows it.

**The rule above all:** you never pick the technology. The person picks, or it is `TBD`.

## Contents

Gather first · The questions · TBD: an honest gap · The read-back · The document · In Arabic

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

When a service receives the client's or users' information (including the client's own work notes, even
when they are about other people), ask two separate questions: **may the provider keep it, and for how
long**, and **may it use it to train**? Reuse a filled meeting form's answers. Keep both answers on the
service's line. They come from the provider's terms or the client's contract, as the person read them:
never guess from what providers usually do. Anything not confirmed yet → one line for that provider,
`- TBD: what <service> may keep or train on. Decided when <the person has read its terms>.`, until every
answer is confirmed. Every step that sends it real information waits for that name; a step that uses only
made-up data does not. A service that receives nothing of theirs is not asked.

**Ask the rules first** (online or offline, languages, and which devices people will hold, which goes into
the Speed line): they change which options fit the other parts. Write the document in its own order.

**Where it lives:** if the project will be deployed or distributed beyond the builder's computer,
reuse any recovery decision already given. Ask the operator which recovery paths their release channel
supports. Ask the owner once to choose who decides to go back, what signal calls for it, and what to do
if the previous release cannot read data saved by the new one. For example, keep the data and ship a
fix release. Record the answer here under **Release recovery**. Skip this for a tool that stays on the
builder's computer.

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
  and ask, for each, whether it acts alone or a person approves first, and who that person is. When the
  model reads text the operator did not write (a user's message, a file, a web page, another system), also
  ask what that text must never be able to make it do, and write the answer on the **Decides alone** line,
  together with what it may do alone.
  Never a default. When it reads only the operator's own instructions, do not ask.
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

When an action uses a part charged by use, use the same cost question to record what it takes to
complete one action and what that costs. Count all paid parts and their billed units, including
failed attempts and retries that are charged. Keep the per-action estimate and any ceiling the person
sets separate from **Each month**. Use the person's amounts and sources. If the amount is still open,
use the existing `TBD` rule above. Skip this line when no part is charged by use.

Two parts are smart defaults, not questions, unless the work rules or the person say otherwise:

- **How the code is written:** the usual tools of the chosen language (its standard formatter and checker),
  one job per file, tests beside the code. Show them in the read-back as your picks; the person's "yes,
  that's it" makes them theirs, written with "(on the AI's recommendation)" like any pick left to you (the
  Speed line too), and they can change any of them.
- **Speed:** if it fits and the PRD or meeting form gives no other target, propose "every page or screen
  opens in under 2 seconds on an ordinary phone or computer" for the person to confirm in the read-back.
  When waiting time matters for a flow the person named, reuse what they already said and confirm any
  gaps together: the flow, when the clock starts, what counts as finished, on which device, and at what
  load. Put those conditions and the agreed target on the Speed line.
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
- **A speed target or its test conditions** block only a step that needs that speed check.
- **A release recovery decision** blocks only the affected release step.

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
- <only for deployment or distribution beyond the builder's computer: **Release recovery:** who decides to go back, the signal, and the route if the previous release cannot read new saved data>

## Outside services
- <service: what it is for; sends …; expects …; if unavailable …; when it receives the client's or users' information: keeps …; trains …>, because <reason>.

## AI part
- **Model:** <which model, and where it runs>, because <reason>.
- **Decides alone:** <what it may do with no person checking / Nothing: a person approves everything; when it reads text the operator did not write: what that text must never make it do>
- **A person approves:** <what waits for a person, and who approves it / Nothing: see Decides alone>
- **When it is wrong:** <how a wrong answer is noticed, who corrects it, what the user is told>
- **Checked by:** <the examples it must get right, who keeps them, and when they are run again>

## Running cost
- <each paid part: what it is, about <amount> a month or a year (from <where the price came from>), and what makes it grow, or "fixed">
- <only for a part charged by use: one completed action, billed units including charged failures and retries, the person's amount and source, and their ceiling if set>
- **Each month:** <about <the monthly amounts added up> a month, plus <the yearly amounts added up> a year, paid by <who>; not counted: <each part with no amount yet> / None: nothing is paid for, because <reason>>

## Rules it must follow
- **Online or offline:** <…>
- **Security:** <…>
- **Languages:** <…>
- **Speed:** <agreed target; where waiting matters: flow, start, finish, device and load>
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

**أين يعمل:** إذا كان المشروع سيُنشر أو يوزّع خارج حاسوب المطوّر، فأعد استخدام أي قرار سبق أن اتخذه
المالك بشأن التعافي. اسأل المشغّل عن طرق التعافي التي تدعمها قناة الإصدار، واسأل المالك مرة واحدة:
من يقرر الرجوع، وما الإشارة التي تستدعيه، وماذا يفعل إذا تعذّرت على الإصدار السابق قراءة البيانات
التي حفظها الإصدار الجديد؟ قد يكون الحل إبقاء البيانات وإصدار تحديث إصلاحي. سجّل الجواب هنا تحت
**التعافي عند الإصدار**. تجاوز هذا السطر إذا بقيت الأداة على حاسوب المطوّر. وإذا بقي قرار التعافي
مفتوحًا، فاكتب «لم يُحسم بعد» وعطّل خطوة الإصدار المعنية فقط.

**السرعة:** إذا كان الهدف مناسبًا ولم يرد هدف آخر في PRD أو استمارة الاجتماع، فاقترح «تفتح كل صفحة
أو شاشة في أقل من ثانيتين على هاتف أو حاسوب عادي» وأكّده مع الشخص عند إعادة عرض الإجابات عليه.
عندما يكون زمن الانتظار مهمًا لمسار سمّاه الشخص، أعد استخدام ما ذكره وأكّد معه ما ينقص: المسار،
ومتى يبدأ القياس، وما الذي يُعدّ اكتمالًا، وعلى أي جهاز، وتحت أي حمل. اكتب الشروط والهدف المتفق
عليه في سطر السرعة. وما بقي مفتوحًا يُكتب «لم يُحسم بعد» ويعطّل فقط الخطوة التي تحتاج فحص السرعة.

لكل **خدمة خارجية**، أكمل السؤال نفسه بما يرسله المنتج وما يجب أن يعود به، وما يراه المستخدم أو
يستطيع فعله عند تعطّل الخدمة أو فشل الرد. تبقى هذه التفاصيل في سطر الخدمة الحالي، ويعيد الأمان
استخدام ما تستقبله. لا تخترع إعادة محاولة أو خدمة بديلة أو بيانات محفوظة جديدة. القرار المفتوح يتبع
«لم يُحسم بعد» ويعطّل العمل الذي يحتاجه فقط. دون خدمة خارجية، أبقِ «لا شيء» ولا تسأل عن تعطّلها.

عندما تستقبل الخدمة معلومات العميل أو مستخدميه (بما فيها ملاحظات عمل العميل نفسه، ولو كانت عن أشخاص آخرين)،
اسأل سؤالين منفصلين: **هل يحق للمزوّد الاحتفاظ بها، وإلى متى**، و**هل يحق له التدريب عليها**؟ أعد استخدام
إجابات نموذج الاجتماع المعبّأ. يبقى الجوابان في سطر الخدمة. ومصدرهما شروط المزوّد أو عقد العميل كما قرأها الشخص،
ولا تخمّنهما مما يفعله المزوّدون عادةً. وما لم يتأكد بعد يبقى له سطر واحد لذلك المزوّد:
`- لم يُحسم بعد: ما يحق لـ<الخدمة> الاحتفاظ به أو التدريب عليه. يُحسم عندما <يقرأ الشخص شروطها>.` حتى تتأكد كل
الإجابات. وتنتظر بهذا الاسم كل خطوة ترسل إليها معلومات حقيقية؛ أما الخطوة التي تستخدم بيانات مختلَقة فقط فلا
تنتظر. والخدمة التي لا تستقبل شيئًا من معلوماتهم لا يُسأل عنها.

**جزء الذكاء الاصطناعي:** فقط عندما يستخدم المنتج نفسه نموذج ذكاء اصطناعي ليجيب أو يصوغ أو يصنّف أو
يوصي أو يتصرف. أداة الذكاء الاصطناعي التي تساعد في بناء المشروع ليست هذا الجزء. إن لم يوجد نموذج
فاكتب سطرًا واحدًا «لا شيء: لا يستخدم الذكاء الاصطناعي» ولا تسأل أكثر. وإلا فاكتب أسطره الخمسة:

- **النموذج** اختيار تقني كغيره: يختاره الشخص من الخيارات، أو يبقى «لم يُحسم بعد». اذكر أين يعمل.
  النموذج الذي يُوصل إليه عبر الإنترنت خدمة خارجية أيضًا: ما يُرسل إليه وما يجب أن يعود به وما يحدث عند
  تعطّله يبقى في سطره تحت **الخدمات الخارجية** ولا يُكرَّر هنا. والنموذج الذي يعمل على حاسوب المشروع نفسه
  لا يرسل شيئًا إلى الخارج: اذكر ذلك.
- **يقرر وحده** و**يعتمده إنسان** ليسا خيارًا افتراضيًا ولا «اختر أنت»: مدى تصرف الذكاء الاصطناعي دون إنسان
  مسؤولية العميل. مرّ على أسطر `M` في PRD التي يشارك فيها الذكاء الاصطناعي، واسأل عن كل سطر: هل يتصرف
  وحده أم يعتمده إنسان أولًا، ومن هو ذلك الإنسان. وعندما يقرأ النموذج نصًا لم يكتبه صاحب النظام (رسالة مستخدم، ملف،
  صفحة ويب، نظام آخر)، اسأل أيضًا: ما الذي لا يجوز أن يدفعه هذا النص إلى فعله؟ واكتب الجواب في سطر
  **يقرر وحده** مع ما يفعله وحده. ليس هذا خيارًا افتراضيًا. وإن كان لا يقرأ إلا تعليمات صاحب النظام نفسه فلا تسأل.
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

للجزء الذي يُدفع بحسب الاستخدام، استخدم سؤال التكلفة نفسه لتسجيل ما يتطلبه إكمال إجراء واحد وما
يكلّفه. احسب كل الأجزاء المدفوعة ووحدات الفوترة حتى اكتمال الإجراء، بما فيها المحاولات الفاشلة
وإعادات المحاولة التي تُحتسب في الفاتورة. افصل تقدير تكلفة الإجراء وأي سقف يحدده الشخص عن مجموع
**كل شهر**. استخدم مبالغ الشخص ومصادرها. وإذا بقي المبلغ مفتوحًا، فاتبع قاعدة «لم يُحسم بعد» أعلاه.
تجاوز هذا السطر إذا لم يكن أي جزء مدفوعًا بحسب الاستخدام.

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
- <فقط للنشر أو التوزيع خارج حاسوب المطوّر: **التعافي عند الإصدار:** من يقرر الرجوع، وما الإشارة، وما المسار إذا لم يقرأ الإصدار السابق البيانات الجديدة المحفوظة>

## الخدمات الخارجية
- <الخدمة: الغرض منها؛ يرسل …؛ ينتظر …؛ عند التعطّل …؛ عندما تستقبل معلومات العميل أو المستخدمين: يحتفظ …؛ يدرّب …>، لأن <السبب>.

## جزء الذكاء الاصطناعي
- **النموذج:** <أي نموذج، وأين يعمل>، لأن <السبب>.
- **يقرر وحده:** <ما يفعله دون مراجعة إنسان / لا شيء: يعتمد إنسان كل شيء؛ وعندما يقرأ نصًا لم يكتبه صاحب النظام: ما لا يجوز أن يدفعه هذا النص إلى فعله>
- **يعتمده إنسان:** <ما ينتظر إنسانًا، ومن يعتمده / لا شيء: انظر يقرر وحده>
- **عند الخطأ:** <كيف يُلاحَظ الجواب الخاطئ، ومن يصحّحه، وماذا يُقال للمستخدم>
- **يُفحص بـ:** <الأمثلة التي يجب أن يجيب عنها صحيحًا، ومن يحتفظ بها، ومتى تُعاد>

## تكلفة التشغيل
- <كل جزء مدفوع: ما هو، نحو <المبلغ> في الشهر أو السنة (من <مصدر السعر>)، وما الذي يزيده، أو «ثابت»>
- <فقط للجزء المدفوع بحسب الاستخدام: إجراء واحد مكتمل، ووحدات الفوترة بما فيها الفشل وإعادة المحاولة المدفوعان، ومبلغ الشخص ومصدره، وسقفه إن حدده>
- **كل شهر:** <نحو <مجموع المبالغ الشهرية> في الشهر، إضافةً إلى <مجموع المبالغ السنوية> في السنة، يدفعه <من>؛ غير محسوب: <كل جزء بلا مبلغ بعد> / لا شيء: لا يُدفع شيء، لأن <السبب>>

## القواعد التي يلتزم بها
- **متصل أو دون اتصال:** <…>
- **الأمان:** <…>
- **اللغات:** <…>
- **السرعة:** <الهدف المتفق عليه؛ وحيث يهم الانتظار: المسار، والبداية، والاكتمال، والجهاز، والحمل>
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
