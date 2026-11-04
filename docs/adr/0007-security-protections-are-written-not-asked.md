# 0007. Security protections are written, not asked

- Status: accepted by the owner on 2026-11-04 (records the 0.2.0 "How it's protected" section)
- Date: 2026-11-04 (recorded); shipped 2026-10-19 in 0.2.0
- Recorded by: an agent, from `references/security.md` and `CHANGELOG.md`. Who first decided it is not
  asserted here.

## Context

Until 0.2.0 the Security page recorded what the person said: who gets in, secrets, personal data, outside
services, what to do if something goes wrong. It said nothing about three mistakes builders make most
often: serving a record to anyone who has its link or ID, gluing typed text into a database query, and
trusting a sign-in by email or without limits. Everywhere else this skill asks before it writes, but
the person would not know the answers here, and there is only one safe answer to each.

## Options weighed

1. **Ask about them**, like every other line. Consistent, but the questions are ones the person cannot
   answer, and "no" to any of them would be written down as a decision.
2. **Leave them to the builder.** Short page, but the builder, often an AI, then has no written rule.
3. **Write them from the answers already given**, as rules a builder must follow, without asking.

## Decision

Option 3. Security has a **How it's protected** section with three fixed lines, worked out from the
Security answers, the TRD and Data:

- **Records:** every request for a protected record checks the agreed permissions (ownership, or the
  approved staff role); records agreed to be public stay public; a hard-to-guess link or ID is not
  protection.
- **Database:** when the project saves to a database, every query uses placeholders.
- **Sign-in:** sign-in, reset and sign-up tries are limited; "Sign in with …" checks the provider's
  signed answer and knows the person by the provider's account ID, never by their email.

A line that does not apply says **None:** (Arabic `لا ينطبق:`) and why.

## Consequences

- This is the one place the skill writes rules without asking. It stays limited to protections with a
  single safe answer; anything with a real choice in it is still asked.
- A test checks each line says None exactly when it does not apply, in all three examples.
- The sign-in rule needed a stable provider account ID in Data, which led to the 0.2.1 clinic example
  repairs.
- Adding a fourth line is a new decision, not an edit to this one.
