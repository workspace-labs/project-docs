# Data: Cedar Clinic Booking
> v4 · Draft

## What it saves
Who the patients are, which doctors take visits, every visit, and the staff who use the front desk list.
Sheets: Patients · Doctors · Visits · Staff · Audit events (the Security rule).

## Sheets

### Patients (patients)
One row is one patient of the clinic.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 1042 | – |
| full_name | the patient's name | Sara Example | 🔒 personal |
| phone | where reminders and sign-in codes go | +000 5550 1234 | 🔒 personal |
| sign_in_code_hash | a scrambled copy of the last sign-in code | (scrambled) | 🔐 secret |
| created_at | when the patient first booked | 2026-10-14 09:12 | – |

- **Who can see it:** front desk staff see every patient; a patient sees only their own row.
- **How long it's kept:** two years after the patient's last visit, or sooner if the patient asks to be removed.
- **Required:** `id` (generated), `full_name`, `phone`, `created_at` (defaulted). The code hash may be absent.
- **Unique:** `id`, `phone`.
- **Removal:** front desk verifies the patient's request, then removes their visits (and linked audit events) before removing the patient. The retention cleanup uses the same order when the two years end.

### Doctors (doctors)
One row is one doctor who takes visits.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 3 | – |
| display_name | the name patients see | Dr. Haddad | 🔒 personal |
| speciality | what kind of doctor | Family doctor | – |
| visit_minutes | how long one visit lasts | 20 | – |

- **Who can see it:** everyone, including patients who are not signed in: the names are shown on purpose, so patients can pick a doctor.
- **How long it's kept:** while the doctor works at the clinic, then until their linked visits have been removed.
- **Required:** `id` (generated), `display_name`, `speciality`, `visit_minutes`.
- **Unique:** `id`.
- **Removal:** the IT lead removes a departed doctor's row after their linked visits have been removed; a visit must never point to a missing doctor.

### Visits (visits)
One row is one booked visit: who, with which doctor, when.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 88213 | – |
| patient_id | which patient | 1042 | 🔒 personal |
| doctor_id | which doctor | 3 | 🔒 personal |
| starts_at | the day and time | 2026-10-14 09:30 | – |
| status | booked, moved or cancelled | booked | – |
| reminder_sent_at | when the reminder went out | 2026-10-13 18:00 | – |

- **Who can see it:** front desk staff see every visit; a patient sees only their own.
- **How long it's kept:** two years, then removed.
- **Required:** `id` (generated), `patient_id`, `doctor_id`, `starts_at`, `status`. The reminder time may be absent.
- **Unique:** `id`. Combined rule: `doctor_id` + `starts_at` cannot repeat unless the visit is cancelled.
- **Removal:** front desk handles a verified patient-removal request; the retention cleanup removes expired visits. Removing a visit also removes its audit events.

### Staff (staff)
One row is one front desk staff member, from the clinic's Microsoft 365 login.
  - Changed 2026-10-19: staff without a stored Microsoft account ID → staff with a stored Microsoft account ID, because Security requires the provider's stable identity.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 7 | – |
| microsoft_account_id | the stable account ID from the clinic's verified Microsoft login, never their email | clinic-account-007 | 🔒 personal |
| work_email | their clinic email, from the login | desk@clinic.example | 🔒 personal |
| display_name | their name | Front Desk 1 | 🔒 personal |

- **Who can see it:** only the clinic's IT lead.
- **How long it's kept:** until the person leaves the clinic.
- **Required:** `id` (generated), `microsoft_account_id`, `work_email`, `display_name`.
- **Unique:** `id`, `microsoft_account_id`, `work_email`.
- **Removal:** the IT lead removes the staff row when the person leaves; its linked audit events are removed too.

### Audit events (audit_events)
One row is one staff attempt to open, move or cancel a protected patient visit, required by Security.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 18 | – |
| actor_id | which staff member acted | 7 | 🔒 personal |
| visit_id | which protected visit was involved | 88213 | 🔒 personal |
| event_at | when it happened | 2026-10-14 09:32 | – |
| action | open, move or cancel | open | – |
| outcome | success or refused | success | – |

- **Who can see it:** only the clinic's IT lead. Patient values, codes and keys are never copied here.
- **How long it's kept:** at most 90 days, or less if the linked visit or staff member is removed.
- **Required:** `id` (generated), `actor_id`, `visit_id`, `event_at` (defaulted), `action`, `outcome`.
- **Unique:** `id`.
- **Removal:** the IT lead's retention cleanup removes events older than 90 days; removing the linked visit or staff member also removes them.

## How the sheets link
- Each Visit belongs to one Patient and one Doctor.
- A Doctor has one time per visit: two non-cancelled Visits with the same doctor can never start at the same time.
- Remove a patient's visits before the patient, and a departed doctor's visits before the doctor. Each audit event points at one Staff row and one Visit; deleting either deletes that event.

## Ready block
```sql
-- PostgreSQL (locked in the TRD)
CREATE TABLE patients (
  id                bigserial PRIMARY KEY,
  full_name         text NOT NULL,          -- personal
  phone             text NOT NULL UNIQUE,   -- personal
  sign_in_code_hash text,                   -- secret: a hash only, never the code
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE doctors (
  id            bigserial PRIMARY KEY,
  display_name  text NOT NULL,          -- personal (shown on purpose)
  speciality    text NOT NULL,
  visit_minutes integer NOT NULL CHECK (visit_minutes > 0)
);

CREATE TABLE visits (
  id               bigserial PRIMARY KEY,
  patient_id       bigint NOT NULL REFERENCES patients(id),   -- personal
  doctor_id        bigint NOT NULL REFERENCES doctors(id),    -- personal
  starts_at        timestamptz NOT NULL,
  status           text NOT NULL CHECK (status IN ('booked', 'moved', 'cancelled')),
  reminder_sent_at timestamptz
);
-- No two booked visits with the same doctor at the same time.
CREATE UNIQUE INDEX one_visit_per_doctor_time ON visits (doctor_id, starts_at) WHERE status <> 'cancelled';

CREATE TABLE staff (
  id           bigserial PRIMARY KEY,
  microsoft_account_id text NOT NULL UNIQUE, -- personal: stable Microsoft identity, never email
  work_email   text NOT NULL UNIQUE,        -- personal
  display_name text NOT NULL                -- personal
);

CREATE TABLE audit_events (
  id       bigserial PRIMARY KEY,
  actor_id bigint NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  visit_id bigint NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  event_at timestamptz NOT NULL DEFAULT now(),
  action   text NOT NULL CHECK (action IN ('open', 'move', 'cancel')),
  outcome  text NOT NULL CHECK (outcome IN ('success', 'refused'))
);
```
