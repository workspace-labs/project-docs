# The Plan: small steps

The last document. It turns the approved documents into small steps in order, each one ending with
something the person can see work. It always says where the work stopped, so any AI on any computer can
continue from there.

## Contents

Gather first · How to make the steps · The status of a step · The read-back · The document · In Arabic

## Gather first

- **PRD → What it must do:** every `M` line must be covered by at least one step.
- **Every open `TBD`**, in any document: a step that needs it is blocked. A back end (anything under the
  TRD's **Brain** that is not `None`) adds one step: write the API guide, `docs/api.md`, during the build.
- **Design, Data, Security:** the look is used from the first screen; tables and secrets go in the step
  that first needs them.
- An existing `docs/plan.md`: keep its steps and progress history; update only statuses and checks affected
  by a changed decision, and add only what is missing.

## How to make the steps

- **Step 1 is the thinnest version that works end to end**: one real path from start to finish, even if
  plain (one doctor, one day, one booking that really saves and really shows up).
- **Each step finishes in one sitting** and ends with something the person can **try**, not just "code
  written".
- **Each step names what it covers:** the PRD lines (`M1, M4`), or the TRD rule (`TRD: Languages`).
- **Each step has its check:** "How we know it works", a test the person can do themselves.
- An unchecked step that needs a `TBD` choice gets the status `⛔ waits for TBD: <the words of that TBD line>`: exactly
  the words between `TBD:` and `. Decided when`, never shortened, so the open choice can be found. If it
  needs more than one, name the first; the step's check says what else it waits for. A step that itself
  settles the TBD (signing up for a host decides the account) is not blocked: it says so in its check.
- **Personal data stays private from the first step.** A step that shows personal data to anyone comes
  after, or includes, the sign-in that protects it; until then it runs only on the builder's computer.
- **Every "only their own" rule gets a try with two people.** When Security says someone sees or changes
  only their own data, the step that builds it checks it with two accounts: signed in as A, try to open,
  change and delete B's data; each try is refused, and B's data is unchanged.
- **If a `TBD` blocks step 1, nothing can be built.** Say so plainly before asking for approval, and offer to
  settle it now (back in the document it belongs to) or to start with a step that doesn't need it.

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

Ordinary execution progress changes the status without changing the version or stamp. Changes caused by
a revised approved decision (including new blockers or revised checks), or adding, removing or reordering
steps, follow SKILL.md: preserve the decision history, raise the version, and return the plan to Draft.

## The read-back

> 7 steps. Step 1: a patient books a visit with one doctor and it shows on the front desk list. Then the full
> list, moving and cancelling, staff sign-in, the reminder (waits for the text-message service), the API
> guide, and Arabic. Is that it?

## The document

Write exactly these headings, in this order. Each step has its own `###` heading and these three lines.

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

When the person asks for Arabic, write the same document in Arabic with these headings and these exact
statuses. Keep `M1`, `M4` and `TRD` as they are.

| English | Arabic |
|---|---|
| `not started` | `لم تبدأ` |
| `⛔ waits for TBD: <what>` | `⛔ تنتظر ما لم يُحسم: <ما هو>` |
| `◐ waiting for your check (ran: <what>, <date>)` | `◐ بانتظار فحصك (نُفّذ: <ما نُفّذ>، <التاريخ>)` |
| `✅ checked <date>` | `✅ فُحصت <التاريخ>` |

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
