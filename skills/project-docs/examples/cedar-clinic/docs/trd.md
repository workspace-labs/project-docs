# TRD: Cedar Clinic Booking
> v5 · Draft

## Work rules
- Must use: the clinic's Microsoft 365 accounts for staff login.
- Can't use: any service that keeps patient details outside the country.
- Where it runs: the clinic's own in-country server.
- Security: the clinic's IT lead approves every outside service before it goes live.
- TBD: the owner-supplied patient notice. Decided when the clinic manager supplies the text to show before collection.

## Screen
- Next.js (React), because the developer already knows it and it works well on phones.

## Brain
- Next.js server routes in the same project, because one project is easier to look after than two.

## Data storage
- SQLite, because it is one file and easy to back up.
  - Changed 2026-10-08: SQLite → PostgreSQL, because many patients and the front desk book at the same moment, and it stops two of them taking the same slot.

## Where it lives
- The clinic's own in-country server, in a Docker container, because the work rules keep patient data in the country.
- TBD: the release recovery decision. Decided when the IT lead confirms the available Docker recovery paths and the clinic manager confirms who decides to go back, the signal, and what to do if the previous image cannot read the saved visits.

## Outside services
- Microsoft 365 login: staff sign in, because the work rules require it.
  - Changed 2026-11-11: staff sign-in only → staff sign-in sends the login request and expects a verified signed answer with the stable account ID; failed or unavailable login creates no session and explains that sign-in is unavailable, because a failed identity check must not grant staff access.
  - Changed 2026-11-21: no line → keeps: the staff sign-in records for 90 days; trains: no, as the IT lead read the clinic's Microsoft agreement (a made-up term for this example), because v4 was written before this was asked.
- TBD: the text-message service for reminders and patient sign-in codes. Decided when the clinic's IT lead has approved one that keeps data in the country and has confirmed from its terms how long it keeps the phone numbers and texts and whether it may train on them.
  The proposed contract sends the patient's phone number and the code or reminder text, expects a delivery-acceptance or failure response, and reports a failed code request without signing the patient in. A failed reminder leaves the saved visit unchanged and shows staff that delivery failed; it never says the message was delivered without confirmation.

## AI part
- None: it uses no AI.

## Running cost
- The clinic's in-country server: bought and owned by the clinic; no bill.
- Microsoft 365 accounts for staff login: about 450 AED a month (from the clinic manager, the October 2026 invoice); grows with the number of staff accounts. The same accounts serve all the clinic's work, so this is the whole bill, not this project's share.
- The booking site's web address: about 60 AED a year (from the IT lead, the registrar's renewal notice); fixed.
- The text-message service: paid per message, so it grows with the number of reminders and sign-in codes; its price comes with the service, which is still open (see Outside services).
- One delivered reminder or sign-in code: count the messages billed through delivery, including any charged failures and retries. The price and what is billed come with the same open service choice (see Outside services).
- **Each month:** about 450 AED a month, plus 60 AED a year, paid by the clinic; not counted: the text messages, whose price comes with the service still open.

## Rules it must follow
- **Online or offline:** online only; a clear message when the connection drops.
- **Security:** see `docs/security.md`.
- **Languages:** English and Arabic (right to left).
- **Speed:** every page opens in under 2 seconds on a phone on 4G.
- **Recovery:** before real patient records are stored, the IT lead demonstrates restoring a backup into an isolated copy and reading the same visits back; a test never overwrites live records.
- **Available:** patients book at any hour; the front desk needs it 8:00 to 18:00. When it is down, the desk takes bookings by phone as before.
- **Accessibility:** text that stays readable when an older patient makes it larger; readable contrast, works with the keyboard, respects reduced motion (see DESIGN.md).

## How the code is written
- **Language:** TypeScript.
- **Formatting:** Prettier, default settings.
- **Checks:** ESLint with the Next.js rules; no warnings left behind.
- **Names:** camelCase for code, kebab-case for file names.
- **File size:** one job per file; split any file that grows past about 300 lines.
- **Tests:** Vitest, in `tests/`, run before every delivery.
- **Kept in:** the clinic's own git repository on its in-country server; the second copy is the server's nightly backup.
