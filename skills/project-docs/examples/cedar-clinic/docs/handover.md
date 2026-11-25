# Handover: Cedar Clinic Booking
> v2 · Draft

## What is handed over
- The code belongs to the clinic, in the clinic's own git repository.
- A one-page front desk guide and an admin guide for the IT lead, plus the API guide (`docs/api.md`).
- The server keys, handed to the IT lead in person and put straight into the server's environment; never written down here.
- One hour of training for two front desk staff, at the clinic, before the first day.

## Who receives it
- The clinic manager receives it and signs the handover; the IT lead receives the code and the keys.
- This document goes to the clinic manager, named as the owner in the PRD's **Who decides**, for approval.

## Announcing it
- A poster at the front desk and one text message to every patient, sent by the clinic manager.

## First weeks after go-live
- For the first four weeks the builder fixes problems, within one working day.
- Booking by phone stops two weeks after go-live; until then the front desk takes both.

## Running it
- The IT lead keeps it running on the clinic's in-country server and backs it up every night to a second disk at the clinic.
- The clinic keeps paying the Microsoft 365 accounts, the web address and the text messages; the IT lead renews the web address each year and holds the text-message service account.
  - Changed 2026-11-16: no line → the clinic pays and the IT lead renews, because v1, approved 2026-10-08 by the clinic manager, was written before this line was asked.

## Maintenance and updates
- The front desk reports a problem to the IT lead by email; it is answered within one working day.
- An update is tried on a copy of the site first, then installed after clinic hours.
- **Light visit rhythm:** every month.
- **Full visit rhythm:** every three months.
- **Serious security fix deadline:** within five calendar days of release for fixes rated critical or high, sooner if attackers already use the weakness.
- **Visit results go to:** the clinic manager, from the IT lead.
- TBD: who builds new features after the handover. Decided when the clinic manager has chosen between the builder and the IT lead.

## Retiring it
- If the clinic replaces it, the clinic manager decides; visits are exported for the new system, then deleted from this one once the clinic manager confirms the new system has them.
