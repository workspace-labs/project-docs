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
  confirm it. Nothing found in code is locked until they do.
- Anything the person already said about tools while writing the PRD.

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
**Data storage** · **Where it lives** (hosting) · **Outside services** (anything it talks to over the
internet: logins, payments, maps, messages, AI) · **Rules it must follow** (online or offline, security,
languages, speed) · **How the code is written** (language, formatting, checks, names, file size, tests).

**Ask the rules first** (online or offline, languages, which devices): they change which options fit the
other parts. Write the document in its own order.

Prices, free plans and limits of hosting and services change often and you cannot look them up: say so,
and tell the person to check them on the provider's site before they sign up.

Two parts are smart defaults, not questions, unless the work rules or the person say otherwise:

- **How the code is written:** the usual tools of the chosen language (its standard formatter and checker),
  one job per file, tests beside the code. Show them in the read-back as your picks; the person's "yes,
  that's it" makes them theirs, and they can change any of them.
- **Speed:** "every page or screen opens in under 2 seconds on an ordinary phone or computer", unless the
  PRD says more.

The **Security** rule in the TRD is one line: `see docs/security.md`, plus any security rule the work sets.

## TBD: an honest gap

Write a `TBD` line as `- TBD: <what is open>. Decided when <what will decide it>.` Keep the person's wish
in it when they gave one ("TBD: cheap or free hosting. Decided when …"). Every TBD stays visible until it
is picked. A Plan step that needs it cannot start. The screen, the data storage and the hosting of an
online project are needed by the very first step, so a TBD in any of them blocks everything: say so in the
read-back, before the TRD is written: "Nothing can be built until this is chosen. Settle it now, or keep it
open?"

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
> login + a text-message service (TBD). Works online only, English and Arabic. Code: TypeScript, Prettier,
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
- <service: what it is for>, because <reason>.

## Rules it must follow
- **Online or offline:** <…>
- **Security:** <…>
- **Languages:** <…>
- **Speed:** <…>

## How the code is written
- **Language:** <…>
- **Formatting:** <…>
- **Checks:** <…>
- **Names:** <…>
- **File size:** <…>
- **Tests:** <…>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings and fixed words.
Names of tools and code stay as they are (Next.js, PostgreSQL).

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
- <الخدمة: الغرض منها>، لأن <السبب>.

## القواعد التي يلتزم بها
- **متصل أو دون اتصال:** <…>
- **الأمان:** <…>
- **اللغات:** <…>
- **السرعة:** <…>

## طريقة كتابة الكود
- **اللغة:** <…>
- **التنسيق:** <…>
- **الفحص:** <…>
- **الأسماء:** <…>
- **حجم الملفات:** <…>
- **الاختبارات:** <…>
```
