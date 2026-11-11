# Security: Cedar Clinic Booking
> v4 · Draft

## Who can get in
- **Patients** sign in with a one-time code sent by text, and see only their own visits.
- **Front desk staff** sign in with their clinic Microsoft 365 account, and see every visit.
- Nobody else gets past the doctor list and the free times.

## How it's protected
- **Records:** every request for a visit checks that the signed-in patient owns it; staff are checked as staff. A visit number that is hard to guess is not protection.
- **Database:** every query uses placeholders; nothing a patient types is glued into a query.
- **Sign-in:** text-code sends and tries are limited (a 15-minute pause after 5 wrong codes). Staff sign-in checks Microsoft's signed answer before trusting it, and knows each staff member by their Microsoft account ID, never their email.
- **Connections:** all website/API and Microsoft/text-service connections use HTTPS/TLS with certificate validation; certificate checks are never disabled.
- **Audit:** when staff open, move or cancel a patient's visit, save the necessary staff/visit IDs, time, action and outcome in `audit_events`. Never copy names, phones, message text, codes or keys into it. Public doctor-list viewing is not audited.

Worth protecting: patient contact details and visits, sign-in codes and service keys. Not trusted: signed-out visitors and a patient asking for another patient's records.
Can go wrong: a patient guesses another visit ID → Records checks and the Plan's two-account refusal check. Someone intercepts a network reply → Connections and the Plan's encrypted-connection check. Staff misuse access → Audit and its Plan check.


## Secrets
- The database password and the text-message service key live in the server's environment, never in the code or in git.
- `.env` files are listed in `.gitignore`.
- Only the clinic's IT lead can see them. To replace one: make a new one, put it in the server's environment, restart, then delete the old one.

## Personal data
- **patients.full_name** (🔒 personal): front desk, and the patient themself; kept two years after the last visit.
- **patients.phone** (🔒 personal): front desk, and the patient themself; kept two years after the last visit.
- **patients.sign_in_code_hash** (🔐 secret): nobody; only a scrambled copy is saved.
- **doctors.display_name** (🔒 personal): everyone, on purpose, so patients can pick a doctor; kept while the doctor works at the clinic, then until their linked visits have been removed.
- **visits.patient_id** (🔒 personal): front desk, and the patient themself; kept two years, then removed with the visit.
- **visits.doctor_id** (🔒 personal): front desk, and the patient whose visit it is; kept two years, then removed with the visit.
- **staff.microsoft_account_id** (🔒 personal): the IT lead; kept until the person leaves.
- **staff.work_email** (🔒 personal): the IT lead; kept until the person leaves.
- **staff.display_name** (🔒 personal): the IT lead; kept until the person leaves.
- **audit_events.actor_id** (🔒 personal): the IT lead only; kept at most 90 days, removed sooner with the linked staff member or visit.
- **audit_events.visit_id** (🔒 personal): the IT lead only; kept at most 90 days, removed sooner with the linked visit or staff member.

## Outside services
- **Microsoft 365 login:** receives the staff member's sign-in, nothing about patients.
- **TBD: the text-message service.** It will receive patient phone numbers and the message text. It must keep data in the country and be approved by the IT lead first.

## Work rules
- Patient details never leave the country.
- The IT lead approves every outside service before it goes live.
- **TBD: the owner-supplied patient notice.** See the TRD's Work rules; the clinic manager supplies the text to show before collection.

## If something goes wrong
- **Tell first:** the clinic's IT lead, by phone, the same hour.
- **Do first:** take the website offline and change every key and password.
- **Tell the people affected:** the clinic manager tells every patient whose details were involved, within three days.
