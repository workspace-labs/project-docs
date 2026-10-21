# The PRD: what we build and why

The first document, and the one everything after it builds on. It is short (about one page) and holds no
technology: if the person names a tool or a language, note it for the TRD and keep it out of the PRD.

## Contents

Gather first · The questions · The read-back · The document · In Arabic

## Gather first

Before asking, read what already says what the project is: `docs/scope.md`, `README.md`, the person's own
description of the idea in this conversation, and the code if there is any. Turn what you find into
proposed answers, so the person confirms instead of starting from nothing.

## The questions

Ask at most 3 questions a round. Once the person has said something to build from, offer 2 or 3 short
drafts built **only from their own words**, plus "Other: type your own". Before that (the very first idea
and its why), ask openly. A `docs/scope.md`, a README or a description they already gave in the conversation
counts as something to build from: Round 1 then proposes drafts from it, and they confirm or correct. Never
invent a fact, a number or a user group.

**Round 1: the idea**
1. **What is it, and what is it called?** In two or three sentences, what does it do and where is it used?
   If it has no name yet, propose one or two from the person's own words.
2. **Why?** What problem does it solve, and what happens today without it?
3. **Who is it for?** Each kind of user and what they need from it. One kind, or several?

**Round 2: the edges**
4. **What must it do?** The main things a user can do. Each becomes one line: "The patient can book a
   visit." Aim for 3 to 8. Anything that is only nice to have can wait for a later version.
5. **What will it NOT do?** Suggest 2 or 3 tempting extras the person might rule out ("No online payment
   in the first version?"). These stop the project from growing in secret.

**Round 3: done**
6. **How will we know it worked?** Each answer is a check anyone can try: "A patient books a visit in under
   two minutes on a phone", not "it is easy to use".

Ask follow-ups whenever an answer is vague ("fast", "simple", "everyone"): ask what it means in practice.
If an answer clashes with an earlier one, say so and ask which wins. If the person truly does not know
yet, write `- TBD: <what is open>. Decided when <what will decide it>.` under the heading it belongs to.

## The read-back

Say it back in five or six short lines before writing, for example:

> Cedar Clinic Booking lets patients book, move and cancel visits on their phone, so the front desk stops
> spending mornings on the phone. Two users: patients and the front desk. It must do 5 things (book, move,
> cancel, see today's list, send a reminder). It will not take payments or keep medical records. It worked
> when a patient books in under two minutes. Is that it?

## The document

Write exactly these headings, in this order. Number the "must do" lines `M1`, `M2` and so on: the Plan
names them, so a number never changes once the PRD is approved (a dropped line is struck through, not
renumbered).

```markdown
# PRD: <Project name>
> v1 · Draft

## What it is
<Two or three sentences.>

## Why
<The problem it solves, and what happens today without it.>

## Who it's for
- **<Kind of user>**: <what they need from it>

## What it must do
- **M1.** <The user can …>
- **M2.** <…>

## What it will NOT do
- <…>

## How we know it worked
- <A check anyone can try.>
```

## In Arabic

When the person asks for Arabic, write the same document in Arabic with these headings. Keep `M1`, `M2`…
as they are: the Plan names them.

```markdown
# متطلبات المنتج (PRD): <اسم المشروع>
> الإصدار 1 · مسودة

## ما هو
<جملتان أو ثلاث.>

## لماذا
<المشكلة التي يحلها، وما يحدث اليوم من دونه.>

## لمن
- **<نوع المستخدم>**: <ما يحتاجه منه>

## ما يجب أن يفعله
- **M1.** <يستطيع المستخدم …>
- **M2.** <…>

## ما لن يفعله
- <…>

## كيف نعرف أنه نجح
- <فحص يستطيع أي أحد تجربته.>
```
