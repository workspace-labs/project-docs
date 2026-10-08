# TRD: Cedar Clinic Booking
> v2 · Approved 2026-10-08

## Work rules
- Must use: the clinic's Microsoft 365 accounts for staff login.
- Can't use: any service that keeps patient details outside the country.
- Where it runs: the clinic's own in-country server.
- Security: the clinic's IT lead approves every outside service before it goes live.

## Screen
- Next.js (React), because the developer already knows it and it works well on phones.

## Brain
- Next.js server routes in the same project, because one project is easier to look after than two.

## Data storage
- SQLite, because it is one file and easy to back up.
  - Changed 2026-10-08: SQLite → PostgreSQL, because many patients and the front desk book at the same moment, and it stops two of them taking the same slot.

## Where it lives
- The clinic's own in-country server, in a Docker container, because the work rules keep patient data in the country.

## Outside services
- Microsoft 365 login: staff sign in, because the work rules require it.
- TBD: the text-message service for reminders and patient sign-in codes. Decided when the clinic's IT lead has approved one that keeps data in the country.

## Rules it must follow
- **Online or offline:** online only; a clear message when the connection drops.
- **Security:** see `docs/security.md`.
- **Languages:** English and Arabic (right to left).
- **Speed:** every page opens in under 2 seconds on a phone on 4G.

## How the code is written
- **Language:** TypeScript.
- **Formatting:** Prettier, default settings.
- **Checks:** ESLint with the Next.js rules; no warnings left behind.
- **Names:** camelCase for code, kebab-case for file names.
- **File size:** one job per file; split any file that grows past about 300 lines.
- **Tests:** Vitest, in `tests/`, run before every delivery.
