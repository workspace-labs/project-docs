# Plan: Cedar Clinic Booking
> v6 · Draft

## How to read it
Steps run in order. Status: not started · ⛔ waits for a TBD choice · ◐ built, waiting for your check · ✅ checked by you.

## Steps

### Step 1: A patient books a visit and the front desk sees it
- **Covers:** M1, M4
- **How we know it works:** on the builder's computer only, with made-up patients (there is no sign-in yet, so nothing goes online before steps 4 and 5), book a 20-minute visit with Dr. Haddad for tomorrow at phone size; it shows up on the front desk list straight away, and the same time can't be booked twice.
- **Built:** a booking page that works at phone size, a front desk list that refreshes by itself, and a rule in the database so one time can never be booked twice; tried with 12 made-up bookings.
- **Your note:** 2026-10-09 — keep the booking to three taps; no account needed to see free times.
- **Target:** 2026-10-09 (can move)
- **Status:** ✅ checked 2026-10-10

### Step 2: Prototype: the front desk lead tries booking
- **Covers:** PRD: Who decides
- **How we know it works:** the front desk lead books a made-up visit on a phone and finds it on the list in an isolated test copy on the builder's computer. They say go on or what to change. Check that the demo screens and made-up patients stay out of the product and that later steps use the approved documents.
- **Built:** a phone test link on the builder's computer with five made-up patients ready to book.
- **Your note:** 2026-10-10 — the front desk lead says go on.
- **Target:** 2026-10-10 (can move)
- **Status:** ✅ checked 2026-10-10

### Step 3: The front desk list, by doctor and by day
- **Covers:** M4
- **How we know it works:** still on the builder's computer, with visits booked for two doctors, the list shows each doctor's day in time order, and the day can be changed.
- **Built:** the list grouped by doctor in time order, with yesterday, today and tomorrow buttons and a date picker; it works on a computer and a phone.
- **Status:** ◐ waiting for your check (ran: booked 6 visits for 2 doctors and opened the list on a computer and a phone, 2026-10-11)

### Step 4: Staff sign in and manage any visit
- **Covers:** M5
- **How we know it works:** sign in with a clinic Microsoft 365 account, add a visit for a caller, move it and cancel it; without that sign-in the front desk list can't be opened.
  - Changed 2026-11-11: staff sign-in and visit changes → the same check plus failed or unavailable Microsoft login grants no session; opening, moving or cancelling a made-up patient's visit writes the staff actor ID, visit ID, time, action and outcome in audit_events without copied patient details or secrets; only the IT lead can read that record and another role's request is refused; README instructions let another staff user run the local example, because the TRD service contract and Security audit rule must be tried when staff first use it.
- **Status:** not started

### Step 5: A patient signs in with a code by text
- **Covers:** M1, M2, TRD: Running cost
- **How we know it works:** a patient asks for a code, it arrives by text, and with it they see only their own visits; 5 wrong codes pause sign-in for 15 minutes. With two made-up patients, signed in as patient A, try to open patient B's visit by its link: it is refused. Only after this step and step 4 are checked does the site go online.
  - Changed 2026-11-11: going online after steps 4 and 5 → going online only after step 10 is also checked; a failed code-service response grants no sign-in and shows the TRD's unavailable message; network connections use HTTPS/TLS with certificate validation, because live collection also needs the owner-supplied notice, recovery and release checks.
  - Changed 2026-11-20: code-service check → keep that check and, before enabling paid sends, check the cost of delivering one code against TRD: Running cost, including any charged failures and retries, because the service charges per message.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 6: A patient moves or cancels their own visit
- **Covers:** M2
- **How we know it works:** signed in (step 5), move a visit to another free time, then cancel it; both work until two hours before, and are refused after that with a clear message. Then, signed in as patient A, try to open, move and cancel another patient's (B's) visit: each try is refused, and B's visit is unchanged.
  - Changed 2026-11-11: visit changes and ownership check → the same check plus staff process a verified made-up patient's removal request using Data's removal route, and the patient, linked visits and linked audit records disappear while another patient's records remain, because retention and removal must work without deleting someone else's data.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 7: The reminder the day before
- **Covers:** M3, TRD: Running cost
- **How we know it works:** a visit booked for tomorrow gets a text message at 18:00 today, once.
  - Changed 2026-11-11: successful reminder only → the same check plus a failed service response leaves the saved visit unchanged and shows staff a delivery failure rather than a success, because the TRD defines the service-down behavior.
  - Changed 2026-11-20: reminder-service check → keep that check and, before enabling paid sends, check the cost of delivering one reminder against TRD: Running cost, including any charged failures and retries, because the service charges per message.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 8: Write the API guide
- **Covers:** TRD: Brain
- **How we know it works:** after the sign-in, visit changes and reminder in steps 5 to 7 work, every request the screens make is in `docs/api.md` with what it sends and what comes back, and a new developer can follow it.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 9: Every page in Arabic, right to left
- **Covers:** TRD: Languages
- **How we know it works:** after the patient pages in steps 5 and 6 work, switch to Arabic. Every page reads right to left in Noto Naskh Arabic, with nothing left in English.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 10: Release safely before collecting real patient data
- **Covers:** TRD: Where it lives, Work rules, Recovery, Kept in; Data: How long it's kept, If this copy is lost; Security: Connections, Audit
- **How we know it works:** after steps 4 and 5, show the clinic manager's supplied patient notice before collecting personal data. This also waits for the text-message service for reminders and patient sign-in codes and the release recovery decision. On isolated made-up records, restore a backup into a separate database and read the same visits back. Document the Docker release and try the agreed Release recovery under TRD: Where it lives on that isolated copy, with its signal and decision maker. Try the previous image only if it can read the newly saved visits. Otherwise try the agreed alternative. Give the release a version and a dated line in `CHANGELOG.md`, from the clinic's own git repository. Follow the README from an empty computer as another operator and check that only the IT lead can read audit records, expired audit records are removed at 90 days, and the public doctor list does not create protected-record audit events. These are checks to run, not claimed results.
  - Changed 2026-11-21: generic restore → keep that check, restoring the IT lead's nightly copy from the second disk into the separate database, and confirm that at most one day of visits would be lost (Data: If this copy is lost), because Data now names the copy and the allowed loss.
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 11: Functional test
- **Covers:** M1, M2, M3, M4, M5
- **How we know it works:** the checks of steps 1 to 10 run again in one go, in English and Arabic, and the reminder reaches a real phone through the text-message service. This also waits for step 10's patient notice and release recovery decision.
- **Status:** ⛔ waits for TBD: the text-message service for reminders and patient sign-in codes

### Step 12: Security test
- **Covers:** Security
- **How we know it works:** someone who did not build it tries every line of the Security page: signed out, the front desk list is refused; signed in as patient A, opening, moving and cancelling B's visit is refused; 5 wrong codes pause sign-in; no key is in the code or in git. This also waits for the text-message service and release recovery decision in step 10.
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 13: Acceptance test (UAT)
- **Covers:** PRD: How we know it worked
- **How we know it works:** after the functional and security tests, the front desk lead and two patients use a test copy on the clinic's server. They run each M line's Check and the "How we know it worked" checks that can be tried now (a booking on a phone in under two minutes, no double booking). The clinic manager signs it off. This also waits for the text-message service and release recovery decision.
- **Target:** 2026-11-16 (can move)
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 14: Guides and training
- **Covers:** Handover
- **How we know it works:** the front desk and admin guides match the accepted product. Two front desk staff have had their hour of training and can book, move and cancel a visit on their own. This also waits for the text-message service and release recovery decision.
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 15: Install: on the clinic's server
- **Covers:** TRD: Where it lives
- **How we know it works:** once the release checks in step 10 pass, the IT lead sees it running in its Docker container on the clinic's in-country server, with its keys in the server's environment. This also waits for the text-message service and release recovery decision.
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 16: Live test
- **Covers:** TRD: Where it lives
- **How we know it works:** after Install, the front desk lead books, moves and cancels a test visit on the clinic's network. The reminder arrives, then the test visit is deleted. This also waits for the text-message service and release recovery decision.
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 17: Go-live
- **Covers:** Handover
- **How we know it works:** after Live test, the poster is up and the text has gone to every patient. Patients book online. Two weeks later phone booking stops. On a normal morning a month later, the front desk takes at most half as many booking calls as before. This also waits for the text-message service and release recovery decision.
- **Target:** 2026-11-30 (fixed)
- **Status:** ⛔ waits for TBD: the owner-supplied patient notice

### Step 18: Handover
- **Covers:** Handover
- **How we know it works:** after Go-live, everything under the Handover document's "What is handed over" is delivered, and the clinic manager signs the handover. This also waits for the owner-supplied patient notice, the text-message service and the release recovery decision.
- **Target:** 2026-11-30 (fixed)
- **Status:** ⛔ waits for TBD: who builds new features after the handover
