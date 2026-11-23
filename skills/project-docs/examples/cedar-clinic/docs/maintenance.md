# Maintenance: Cedar Clinic Booking

Maintenance agreement: [Handover](handover.md), **Maintenance and updates**.

This fictional example picks up after the clinic manager approved the agreement and received the project
on 2026-12-01. The linked Handover shows the earlier draft.

## Next light visit
- 2027-02-01

## Next full visit
- 2027-03-01

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
- **2027-01-01 — light** · ✅ checked 2027-01-02 by the clinic manager
  - Security weaknesses: the IT lead found no package advisories requiring action in the report reviewed for this visit · fine.
  - Backups: the IT lead confirmed the nightly backup log showed a successful run each night since handover · fine.
  - Expiries: the IT lead checked the site's certificate, web address and service accounts. The certificate expires on 2027-02-20, so the clinic manager decided to review renewal at the next light visit · can wait.

## Requests received
- 2026-12-16 · “The reminder for tomorrow's appointment never reached my phone.” · fault, confirmed by the clinic manager against PRD M3 (“A patient gets a reminder message the day before the visit.”) · closed in v1.0.1.
