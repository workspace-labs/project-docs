# TRD: Notes Digest
> v3 · Approved 2026-11-20

## Work rules
- None: personal project.

## Screen
- The terminal, as plain lines of text, because the PRD rules out windows.

## Brain
- None: everything runs inside the one small program.

## Data storage
- None: it saves nothing.

## Where it lives
- On the team lead's own computer, as one Python file, because Python is already installed there.

## Outside services
- Quill 2, the hosted language model from Harborline (made-up names for this example), reached over the internet through Harborline's API: it writes the digest; sends the text of the one notes file and the instructions; expects a summary and an action list as plain text; if unavailable, the tool prints one line saying so and nothing else, because the team lead already has a Harborline account.

## AI part
- **Model:** Quill 2 from Harborline, the service named under Outside services, running on Harborline's servers, because the team lead already has an account there and it reads long English notes well.
- **Decides alone:** the wording of the summary, and which lines of the notes it lists as actions and for whom; it only prints them on the team lead's screen.
- **A person approves:** everything that leaves the screen: the team lead reads the digest against the notes and copies only what they accept.
- **When it is wrong:** the team lead notices when reading the digest against the notes, and corrects the text before pasting it; the first printed line says the digest was written by AI and must be checked.
- **Checked by:** ten past notes files, each with the summary and the actions the team lead accepts, kept by the team lead beside the tests, and run before first use and after any change of the model or its instructions.

## Running cost
- Quill 2, the hosted language model: about 4 USD a month (from the team lead, Harborline's usage page for October 2026); charged by use, so it grows with the number and the length of the notes.
- TBD: the cost of printing one complete digest. Decided when the team lead supplies the billing units and prices for the notes, instructions and full output, including whether any failed attempts or retries would be charged.
  - Changed 2026-11-20: TBD → 0.04 USD per completed digest with no billed failures or retries (3,000 input tokens for the notes and instructions at 0.01 USD per 1,000 input tokens, plus 500 output tokens for the full summary and action list at 0.02 USD per 1,000 output tokens), because the team lead supplied the rates and usage from Harborline's usage page for October 2026. Failed attempts and retries are billed at the same rates for any tokens used. October had about 100 digests at that size and no billed failures or retries, which accounts for the monthly total above.
- **Each month:** about 4 USD a month, paid by the team lead.

## Rules it must follow
- **Online or offline:** online only; one clear line when the service cannot be reached.
- **Security:** see `docs/security.md`.
- **Languages:** English.
- **Speed:** the digest is printed within 30 seconds for notes of up to five pages.
  - Changed 2026-11-20: the digest is printed within 30 seconds for notes of up to five pages → on the team lead's computer, at most 30 seconds from running the command to the last line of the summary and action list being printed, with one five-page notes file and one run at a time, because v1, approved 2026-11-16, did not say how to measure the time.
- **Available:** when the team lead runs it.
- **Accessibility:** None: no screens.

## How the code is written
- **Language:** Python 3.
- **Formatting:** Ruff format, default settings.
- **Checks:** Ruff, with no warnings left behind.
- **Names:** snake_case.
- **File size:** one file, kept under about 200 lines.
- **Tests:** pytest, in `tests/`.
- **Kept in:** the team lead's computer, with a second copy in their private GitHub repository.
