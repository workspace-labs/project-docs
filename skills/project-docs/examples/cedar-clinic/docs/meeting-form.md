# Client meeting form: Cedar Clinic Booking

| | |
|---|---|
| Client (organisation, department) | Cedar Family Clinic, front desk |
| Met by (our side) | the builder |
| What we understood before this meeting (the client confirms or corrects) | Patients book and change their visits on their phone. The front desk sees all appointments for the day. |

Four stages before anything is built, with as many meetings as each needs. Write what the client says,
in their words. If something has not been decided, write "not decided".

## Meetings held

| # | Date and place | Stage | Who came (name and job) | What was decided |
|---|---|---|---|---|
| 1 | 2026-10-01, at the clinic | 1 | the clinic manager; the builder | |
| 2 | 2026-10-02, at the front desk | 2 | the clinic manager; the front desk lead; the two front desk staff; the builder | |
| 3 | 2026-10-06, at the clinic | 3 | the clinic manager; the front desk lead; the clinic's IT lead; the builder | |
| 4 | 2026-10-08, at the clinic | 4 | the clinic manager; the builder | Approved the scope and the proposed checks |

## Still open

| # | Question | Why open (missing or conflict) | Blocks the work? (yes or can wait) | Who answers | Raised in meeting |
|---|---|---|---|---|---|

## Stage 1: the goal

### 1. The project
- **What is it, in two or three sentences?** Patients book, move and cancel their own visits from their phone. The front desk sees the day in one list.
- **What problem does it solve? What goes wrong without it?** Every booking is a phone call. Mornings go on the phone, patients wait on hold, and missed visits are found out too late.

| Milestone | Date | Fixed or can move? |
|---|---|---|
| Start of work | 2026-10-09 | can move |
| First version they try (prototype) | 2026-10-10 | can move |
| Acceptance test (UAT) | 2026-11-16 | can move |
| Handover / go-live | 2026-11-30 | fixed |

- **Why this date? What happens if it slips?** The busy winter season starts in December. If handover slips, the front desk keeps taking all bookings by phone during the busy season.
- **Budget:** the clinic pays the builder's hours; the server is the clinic's own. It covers the prototype and the tests.

### 2. Who is involved
| Role | Name and job |
|---|---|
| Owner: who the project belongs to | the clinic manager |
| Approves the scope | the clinic manager |
| Approves the prototype (the first version they try) | the front desk lead |
| Accepts it: runs the acceptance test (UAT) and signs | the front desk lead tests with two patients; the clinic manager signs |
| Others to involve (IT, security, other departments) and what they need | the IT lead: it runs on the clinic's server, and they approve every outside service |

- **Who only needs to be told about it?** The doctors.
- **One contact person on each side:** the front desk lead; the builder.

## Stage 2: the people and today's work

### 3. Who will use it
| Kind of user | What they need from it | How many, and how many at the busiest time |
|---|---|---|
| Patients | book without calling; a reminder the day before | about 3,000; up to 40 bookings an hour on Monday mornings |
| Front desk staff | the day at a glance; add visits for callers; know who cancelled | 2 |
| | | |

### 4. How the work runs today
| # | Step | Who does it | On paper, or in which system? |
|---|---|---|---|
| 1 | A patient phones to book | the patient | phone |
| 2 | Look for a free time with the right doctor | front desk | the paper diary |
| 3 | Write the visit in the diary | front desk | the paper diary |
| 4 | A patient who cannot come is found out when they do not arrive | front desk | none |
| | | | |

- **What goes wrong today, or takes too long?** Mornings on the phone; patients on hold; empty times nobody can fill.
- **Unusual cases:** a doctor off sick: the desk phones every patient that day.
- **Papers, forms or files used today:** the front desk lead gave us a copy of the blank diary page and one week of diary entries with names and phone numbers removed.

### Signatures: the notes of stages 1 and 2
These notes match what was said. The scope is approved separately in Stage 4.

| | Name | Signature | Date |
|---|---|---|---|
| For the client | the clinic manager | signed | 2026-10-02 |
| For our side | the builder | signed | 2026-10-02 |

## Stage 3: the needs and the new way

### 5. How the work will run with it
| # | Step | Who does it |
|---|---|---|
| 1 | Book on the phone, signing in with a code by text | the patient |
| 2 | The visit appears in the day's list | (it does) |
| 3 | A reminder the day before | (it does) |
| 4 | Add visits for patients who call | front desk |
| | | |

### 6. What it must do
| # | The user can … | Now or later? | How we check it |
|---|---|---|---|
| 1 | a patient books a visit: doctor, day, free time | now | book for tomorrow on a phone; it shows in the desk's list |
| 2 | a patient moves or cancels their own visit | now | move, then cancel; one hour before is refused |
| 3 | a patient gets a reminder the day before | now | book for tomorrow; the reminder arrives today |
| 4 | the front desk sees each day's visits by doctor | now | today's list, in time order per doctor |
| 5 | the front desk adds, moves or cancels any visit | now | add, move, cancel for a caller; the list shows each |
| 6 | patients see their past visits | later | |
| | | | |
| | | | |

- **What will it NOT do?** No payment, no medical records, no video visits, no app to install.
- **How will we know it worked?** A patient books on a phone in under two minutes without help; half as many booking calls; never a double booking.

### 7. Later stages: ask now
- **Data:** patient names and phone numbers. Patient details must stay in the country; visits are kept two years.
- **Old records:** none move in; the paper diary ends when it goes live.
- **Where it must run:** the clinic's own server. Internet allowed, for patients. The clinic owns the server and the domain. The IT lead gives the builder a server account and domain admin access. When it is chosen, the clinic will own the messaging account and the IT lead will give the builder access. No payment account is needed.
- **Available:** patients at any hour; the front desk 8:00 to 18:00. When it is down, the desk takes calls as before.
- **Speed:** every page in under 2 seconds on a phone, even on Monday mornings.
- **Devices:** patients on their phones; the front desk on two computers.
- **Languages:** English and Arabic.
- **Brand:** no brand rules.
- **Accessibility:** many older patients: text must stay readable when made larger.
- **Links to other systems:** a text-message service for codes and reminders (not chosen yet); only the phone number and the message go to it.
- **Sign-in:** staff with their clinic Microsoft 365 accounts; patients with a code by text.
- **Security:** the IT lead approves every outside service before it goes live.
- **Rules and policies:** patient details stay in the country.
- **Prototype:** booking one visit on a phone.
- **Testing and acceptance:** the front desk lead with two patients, made-up data first.
- **Training:** one hour for the two front desk staff, at the clinic, before the first day.
- **Handover:** a short guide for the front desk, one for the IT lead; the clinic manager receives it.
- **After the handover:** the IT lead runs it and fixes problems. New features: not decided.
- **Announcing it:** a poster at the front desk and a text to every patient.
- **Retiring it:** if the clinic replaces it; the clinic manager decides; visits are exported for the new system, then deleted from this one.

### 8. Assumptions and risks
- **What are we assuming is true?** The IT lead approves the text-message service before December.
- **What could go wrong, or delay it?** No text-message service keeps data in the country; then reminders wait.

### 9. Open questions and notes
- Which text-message service: the IT lead will look for one that keeps data in the country.
- After Stage 3, the builder needed to know how long each appointment lasts. The clinic manager confirmed in Stage 4 that patients book 20-minute appointments.
- The clinic manager explicitly approved the proposed PRD Check lines and How we know it worked checks in the Stage 4 read-back.

## Stage 4: approve the scope, or stop

Bring the draft PRD, written from stages 1 to 3. Read it back to the person who approves the scope.

### 10. The decision
| Decision | ✓ |
|---|---|
| Approved | ✓ |
| Changes first (listed below, then another Stage 4 meeting) | |
| Stop (why, below) | |

- **Changes asked, or why it stops:** none.

After approval, every change is written down and approved by the person who approves the scope before it is
built.

| | Name | Signature | Date |
|---|---|---|---|
| Approves the scope | the clinic manager | signed | 2026-10-08 |
| For our side | the builder | signed | 2026-10-08 |
