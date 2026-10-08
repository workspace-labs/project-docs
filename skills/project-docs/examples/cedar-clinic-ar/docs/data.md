# البيانات: حجز عيادة سيدر
> الإصدار 2 · معتمد 2026-10-08

## ما يحفظه
من هم المرضى، وأي الأطباء يستقبلون المواعيد، وكل موعد، والموظفون الذين يستخدمون قائمة الاستقبال.
الجداول: المرضى · الأطباء · المواعيد · الموظفون.

## الجداول

### المرضى (patients)
الصف الواحد هو مريض واحد من مرضى العيادة.

| العمود | يحمل | مثال | العلامة |
|---|---|---|---|
| id | رقم يعطيه النظام | 1042 | – |
| full_name | اسم المريض | سارة مثال | 🔒 شخصي |
| phone | حيث تصل رسائل التذكير ورموز الدخول | +000 5550 1234 | 🔒 شخصي |
| sign_in_code_hash | نسخة مشفّرة من آخر رمز دخول | (مشفّر) | 🔐 سري |
| created_at | متى حجز المريض أول مرة | 2026-10-14 09:12 | – |

- **من يستطيع رؤيته:** يرى موظفو الاستقبال كل المرضى، ويرى المريض صفه فقط.
- **مدة الاحتفاظ به:** سنتان بعد آخر موعد للمريض، أو أقل إذا طلب المريض حذفه.

### الأطباء (doctors)
الصف الواحد هو طبيب واحد يستقبل المواعيد.

| العمود | يحمل | مثال | العلامة |
|---|---|---|---|
| id | رقم يعطيه النظام | 3 | – |
| display_name | الاسم الذي يراه المرضى | د. حدّاد | 🔒 شخصي |
| speciality | نوع الطبيب | طبيب عائلة | – |
| visit_minutes | مدة الموعد الواحد بالدقائق | 20 | – |

- **من يستطيع رؤيته:** الجميع، حتى المرضى الذين لم يسجّلوا الدخول: الأسماء معروضة عن قصد ليختار المرضى طبيبهم.
- **مدة الاحتفاظ به:** ما دام الطبيب يعمل في العيادة.

### المواعيد (visits)
الصف الواحد هو موعد محجوز: من، ومع أي طبيب، ومتى.

| العمود | يحمل | مثال | العلامة |
|---|---|---|---|
| id | رقم يعطيه النظام | 88213 | – |
| patient_id | أي مريض | 1042 | 🔒 شخصي |
| doctor_id | أي طبيب | 3 | 🔒 شخصي |
| starts_at | اليوم والساعة | 2026-10-14 09:30 | – |
| status | محجوز أو مُغيَّر أو ملغى | booked | – |
| reminder_sent_at | متى أُرسل التذكير | 2026-10-13 18:00 | – |

- **من يستطيع رؤيته:** يرى موظفو الاستقبال كل المواعيد، ويرى المريض مواعيده فقط.
- **مدة الاحتفاظ به:** سنتان، ثم يُحذف.

### الموظفون (staff)
الصف الواحد هو موظف استقبال واحد، من دخول Microsoft 365 الخاص بالعيادة.

| العمود | يحمل | مثال | العلامة |
|---|---|---|---|
| id | رقم يعطيه النظام | 7 | – |
| work_email | بريده في العيادة، من الدخول | desk@clinic.example | 🔒 شخصي |
| display_name | اسمه | استقبال 1 | 🔒 شخصي |

- **من يستطيع رؤيته:** مسؤول تقنية المعلومات في العيادة فقط.
- **مدة الاحتفاظ به:** حتى يغادر الموظف العيادة.

## كيف ترتبط الجداول
- كل موعد يخص مريضًا واحدًا وطبيبًا واحدًا.
- للطبيب موعد واحد في كل وقت: لا يمكن أن يبدأ موعدان مع الطبيب نفسه في الوقت نفسه.

## الكود الجاهز
```sql
-- PostgreSQL (محسوم في TRD)
CREATE TABLE patients (
  id                bigserial PRIMARY KEY,
  full_name         text NOT NULL,          -- شخصي
  phone             text NOT NULL UNIQUE,   -- شخصي
  sign_in_code_hash text,                   -- سري: نسخة مشفّرة فقط، لا الرمز نفسه
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE doctors (
  id            bigserial PRIMARY KEY,
  display_name  text NOT NULL,          -- شخصي (معروض عن قصد)
  speciality    text NOT NULL,
  visit_minutes integer NOT NULL CHECK (visit_minutes > 0)
);

CREATE TABLE visits (
  id               bigserial PRIMARY KEY,
  patient_id       bigint NOT NULL REFERENCES patients(id),   -- شخصي
  doctor_id        bigint NOT NULL REFERENCES doctors(id),    -- شخصي
  starts_at        timestamptz NOT NULL,
  status           text NOT NULL CHECK (status IN ('booked', 'moved', 'cancelled')),
  reminder_sent_at timestamptz
);
-- لا موعدين محجوزين مع الطبيب نفسه في الوقت نفسه.
CREATE UNIQUE INDEX one_visit_per_doctor_time ON visits (doctor_id, starts_at) WHERE status <> 'cancelled';

CREATE TABLE staff (
  id           bigserial PRIMARY KEY,
  work_email   text NOT NULL UNIQUE,        -- شخصي
  display_name text NOT NULL                -- شخصي
);
```
