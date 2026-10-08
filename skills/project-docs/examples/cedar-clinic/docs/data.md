# Data: Cedar Clinic Booking
> v2 · Approved 2026-10-08

## What it saves
Who the patients are, which doctors take visits, every visit, and the staff who use the front desk list.
Sheets: Patients · Doctors · Visits · Staff.

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

### Doctors (doctors)
One row is one doctor who takes visits.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 3 | – |
| display_name | the name patients see | Dr. Haddad | 🔒 personal |
| speciality | what kind of doctor | Family doctor | – |
| visit_minutes | how long one visit lasts | 20 | – |

- **Who can see it:** everyone, including patients who are not signed in: the names are shown on purpose, so patients can pick a doctor.
- **How long it's kept:** while the doctor works at the clinic.

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

### Staff (staff)
One row is one front desk staff member, from the clinic's Microsoft 365 login.

| Column | Holds | Example | Mark |
|---|---|---|---|
| id | a number the system gives | 7 | – |
| work_email | their clinic email, from the login | desk@clinic.example | 🔒 personal |
| display_name | their name | Front Desk 1 | 🔒 personal |

- **Who can see it:** only the clinic's IT lead.
- **How long it's kept:** until the person leaves the clinic.

## How the sheets link
- Each Visit belongs to one Patient and one Doctor.
- A Doctor has one time per visit: two Visits with the same doctor can never start at the same time.

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
  work_email   text NOT NULL UNIQUE,        -- personal
  display_name text NOT NULL                -- personal
);
```
