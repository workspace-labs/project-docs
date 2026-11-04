# 0006. The AI never picks the technology

- Status: proposed (records the rule in `docs/scope.md` and the TRD reference since 0.1.0; accepted on
  the owner's word)
- Date: 2026-11-04 (recorded); the rule dates from 2026-10-08
- Recorded by: an agent, from `docs/scope.md`, `SKILL.md` and `references/trd.md`. Who first decided it is
  not asserted here.

## Context

The TRD fixes what a project is built with: the screen, the brain, the data storage, where it lives, the
outside services. Those choices bind the person for years: cost, who can maintain it, what they can hire
for. An AI that fills the TRD itself writes its own habits as the person's decision, and a later AI reads
them as approved truth. People who are unsure also tend to accept whatever is offered first.

## Options weighed

1. **The AI picks sensible defaults** and the person may object. Fast, but silence becomes approval of a
   choice they never weighed.
2. **The AI says nothing** and only asks. Honest, but leaves a person who does not know the options stuck.
3. **The person picks; the AI shows the options.** When they are unsure, 2 or 3 options, each with what it
   is, good, bad and what is easy or hard to maintain later, the AI's recommendation first with its
   reason. "Not sure yet" is written as an honest `TBD`.

## Decision

Option 3. It is the rule above all others in `references/trd.md`:

- The person picks, or it is `TBD: <what is open>. Decided when <…>.`
- "Not sure" before seeing options means "show me the options". Only after seeing them and still
  choosing to wait is it `TBD`.
- "You pick" or "your recommended one" is the person's own choice: it is written with its reason and
  "(on the AI's recommendation)".
- A choice found in existing code is marked `(found in code)` and is not approved until the person
  confirms it.

## Consequences

- Every technology line in a TRD traces to the person, so a later AI can trust it as decided.
- The TRD takes more rounds than if the AI just filled it in. That is accepted.
- Open TBDs are normal and visible. An open screen or data-storage choice blocks step 1 of the plan; an
  open hosting choice blocks the step that goes online ([ADR 0005](0005-a-waiting-step-names-the-open-choice-exactly.md)).
- The AI still recommends: the person can always say "your pick", and it is recorded as such.
