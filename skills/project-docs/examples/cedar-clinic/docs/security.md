# Security: Cedar Clinic Booking
> v2 · Approved 2026-10-08

## Who can get in
- **Patients** sign in with a one-time code sent by text, and see only their own visits.
- **Front desk staff** sign in with their clinic Microsoft 365 account, and see every visit.
- Nobody else gets past the doctor list and the free times.

## Secrets
- The database password and the text-message service key live in the server's environment, never in the code or in git.
- `.env` files are listed in `.gitignore`.
- Only the clinic's IT lead can see them. To replace one: make a new one, put it in the server's environment, restart, then delete the old one.

## Personal data
- **patients.full_name** (🔒 personal): front desk, and the patient themself; kept two years after the last visit.
- **patients.phone** (🔒 personal): front desk, and the patient themself; kept two years after the last visit.
- **patients.sign_in_code_hash** (🔐 secret): nobody; only a scrambled copy is saved.
- **doctors.display_name** (🔒 personal): everyone, on purpose, so patients can pick a doctor; kept while the doctor works at the clinic.
- **visits.patient_id** (🔒 personal): front desk, and the patient themself; kept two years, then removed with the visit.
- **visits.doctor_id** (🔒 personal): front desk, and the patient whose visit it is; kept two years, then removed with the visit.
- **staff.work_email** (🔒 personal): the IT lead; kept until the person leaves.
- **staff.display_name** (🔒 personal): the IT lead; kept until the person leaves.

## Outside services
- **Microsoft 365 login:** receives the staff member's sign-in, nothing about patients.
- **TBD: the text-message service.** It will receive patient phone numbers and the message text. It must keep data in the country and be approved by the IT lead first.

## Work rules
- Patient details never leave the country.
- The IT lead approves every outside service before it goes live.

## If something goes wrong
- **Tell first:** the clinic's IT lead, by phone, the same hour.
- **Do first:** take the website offline and change every key and password.
- **Tell the people affected:** the clinic manager tells every patient whose details were involved, within three days.
