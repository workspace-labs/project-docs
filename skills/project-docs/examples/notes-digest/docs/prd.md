# PRD: Notes Digest
> v1 · Approved 2026-11-16

## What it is
A small tool for the computer's terminal: it reads one text file of meeting notes and prints a short
summary and a list of the actions it found, each with the name of who took it.

## Why
After a meeting the notes stay long and unread, and the actions agreed in them get lost. A short digest
made in a minute gets read.

## Who it's for
- **One team lead**: turn their own meeting notes into a digest they check and then paste into their follow-up message.

## How it works today
1. The team lead rereads the notes and writes the summary and the action list by hand, or skips it.

## How it will work
1. The team lead runs one command on the notes file, reads the digest against the notes, corrects it, and pastes it.

## Who decides
- **Owner**: the team lead, alone.

## What it must do
- **M1.** It prints a summary of at most five lines for one notes file.
  - Check: run it on a notes file; a summary of five lines or fewer is printed.
- **M2.** It prints the actions it found, each with who took it, and marks an action whose owner it could not find.
  - Check: run it on notes where one action names nobody; that action is printed with "owner not found".
- **M3.** Its first line says the digest was written by AI and must be checked.
  - Check: run it; the first printed line says so.
- **M4.** When the AI service cannot be reached, it says so in one line and prints nothing else.
  - Check: run it with the network off; one line says the service is unavailable.

## What it will NOT do
- It never sends the digest to anyone and never saves it: the team lead copies what they accept.
- No windows or app to click: it lives in the terminal.
- No accounts, and no memory of earlier notes.

## Later
- None.

## Assumptions and risks
- **Assumption:** the notes are plain text, in English.
- **Risk:** the AI can miss an action or name the wrong owner, so the team lead reads every digest against the notes before using it.

## How we know it worked
- For one month, a follow-up message with a digest goes out after every meeting the team lead runs.

## Dates and budget
- **Dates:** None: no date.
- **Budget:** None: no budget for building it. What it costs to run is in the TRD.
