# Plan: Cedar Clinic Booking
> v3 · Approved 2026-10-08

## How to read it
Steps run in order. Status: not started · ⛔ waits for a TBD choice · ◐ built, waiting for your check · ✅ checked by you.

## Steps

### Step 1: A patient books a visit and the front desk sees it
- **Covers:** M1, M4
- **How we know it works:** on the builder's computer only, with made-up patients (there is no sign-in yet, so nothing goes online before steps 3 and 4), book a visit with Dr. Haddad for tomorrow at phone size; it shows up on the front desk list straight away, and the same time can't be booked twice.
- **Status:** ✅ checked 2026-10-10

### Step 2: The front desk list, by doctor and by day
- **Covers:** M4
- **How we know it works:** still on the builder's computer, with visits booked for two doctors, the list shows each doctor's day in time order, and the day can be changed.
- **Status:** ◐ waiting for your check (ran: booked 6 visits for 2 doctors and opened the list on a computer and a phone, 2026-10-11)

### Step 3: Staff sign in and manage any visit
- **Covers:** M5
- **How we know it works:** sign in with a clinic Microsoft 365 account, add a visit for a caller, move it and cancel it; without that sign-in the front desk list can't be opened.
- **Status:** not started

### Step 4: A patient signs in with a code by text
- **Covers:** M1, M2
- **How we know it works:** a patient asks for a code, it arrives by text, and with it they see only their own visits; 5 wrong codes pause sign-in for 15 minutes. With two made-up patients, signed in as patient A, try to open patient B's visit by its link: it is refused. Only after this step and step 3 are checked does the site go online.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 5: A patient moves or cancels their own visit
- **Covers:** M2
- **How we know it works:** signed in (step 4), move a visit to another free time, then cancel it; both work until two hours before, and are refused after that with a clear message. Then, signed in as patient A, try to open, move and cancel another patient's (B's) visit: each try is refused, and B's visit is unchanged.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 6: The reminder the day before
- **Covers:** M3
- **How we know it works:** a visit booked for tomorrow gets a text message at 18:00 today, once.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 7: Write the API guide
- **Covers:** TRD: Brain
- **How we know it works:** every request the screens make is in `docs/api.md` with what it sends and what comes back, and a new developer can follow it.
- **Status:** not started

### Step 8: Every page in Arabic, right to left
- **Covers:** TRD: Languages
- **How we know it works:** switch to Arabic; every page reads right to left in Noto Naskh Arabic, with nothing left in English.
- **Status:** not started
