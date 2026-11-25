# PRD: Cedar Clinic Booking
> v2 · Approved 2026-10-08 by the clinic manager

## What it is
A small website where patients of Cedar Family Clinic book, move and cancel their own visits from a phone
or a computer. The front desk sees each day's visits in one list and can add a visit for a patient who
calls in.

## Why
Today every booking goes through the front desk by phone. Mornings are spent answering calls, patients
wait on hold, and missed visits are only found out when the patient does not come.

## Who it's for
- **Patients**: book a visit at a time that suits them, without calling, and be reminded the day before.
- **Front desk staff**: see the day at a glance, add visits for callers, and know who cancelled.

## How it works today
1. A patient phones the front desk.
2. The front desk looks for a free time in the paper diary and writes the visit in it.
3. Nobody reminds the patient; a missed visit is found out when they do not come.

## How it will work
1. A patient books on their phone, signing in with a code by text.
2. The visit appears in the front desk's list for that day.
3. The day before, the patient gets a reminder message.
4. The front desk adds visits only for patients who call.

## Who decides
- **Owner**: the clinic manager.
- **Approves the scope**: the clinic manager.
- **Approves the prototype**: the front desk lead.
- **Accepts it (UAT)**: the front desk lead runs the acceptance test with two patients; the clinic manager signs it off.
- **Others to involve**: the clinic's IT lead, who runs the server and must approve every outside service.

## What it must do
- **M1.** A patient can book a visit: pick a doctor, a day and a free 20-minute slot.
  - Check: book a 20-minute visit for tomorrow on a phone. It shows in the front desk's list.
- **M2.** A patient can move or cancel their own visit, up to two hours before it.
  - Check: move a visit, then cancel it; a cancel one hour before the visit is refused.
- **M3.** A patient gets a reminder message the day before the visit.
  - Check: book a visit for tomorrow; the reminder reaches the phone today.
- **M4.** Front desk staff can see each day's visits in one list, by doctor.
  - Check: open today's list; each doctor's visits are shown in time order.
- **M5.** Front desk staff can add, move or cancel a visit for any patient.
  - Check: add a visit for a caller, move it, cancel it; the list shows each change.

## What it will NOT do
- No online payment.
- No medical records, test results or notes from the doctor.
- No video visits.
- No app to install: it is a website that works on phones.

## Later
- A patient can see their past visits.

## Assumptions and risks
- **Assumption:** the IT lead approves the text-message service before December.
- **Risk:** no text-message service keeps data in the country; then reminders (M3) wait.

## How we know it worked
- A patient books a visit on a phone in under two minutes, without help.
- On a normal morning, the front desk takes at least half as many booking calls as before.
- No two patients are ever booked into the same doctor's time.

## Dates and budget
- **Dates:**
  - Start of work: 2026-10-09 (can move).
  - First version they try (prototype): 2026-10-10 (can move).
  - Acceptance test (UAT): 2026-11-16 (can move).
  - Handover / go-live: 2026-11-30 (fixed).
  - The winter season starts in December. If go-live slips, the front desk keeps taking all bookings by phone during the busy season.
- **Budget:** the clinic pays the builder's hours; the server is the clinic's own. It covers the prototype and the tests.
