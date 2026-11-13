# PRD: Study Timer
> v1 · Approved 2026-10-08

## What it is
A small study timer that runs in the computer's terminal: 25 minutes of work, then a 5-minute break, with
a short sound and a one-line message at each change.

## Why
Phone timers pull the student into the phone. A timer in the terminal they already have open keeps them on
the work.

## Who it's for
- **One student**: start a session with one command and be told when to stop.

## How it works today
1. The student sets a timer on the phone, and ends up in the phone.

## How it will work
1. The student types one command in the terminal and keeps working until the sound.

## Who decides
- **Owner**: the student, alone.

## What it must do
- **M1.** The student can start, pause and stop a session.
  - Check: start a session, pause it, start it again, stop it; each prints one line.
- **M2.** It plays a short sound and prints one line when work time or break time ends.
  - Check: start a session with one-minute times; the sound and the line come at each change.

## What it will NOT do
- No windows or app to click: it lives in the terminal.
- No accounts, no statistics, no saving of past sessions.

## Later
- None.

## Assumptions and risks
- **Assumption:** None.
- **Risk:** None.

## How we know it worked
- One command starts a session, and the sound plays at 25 minutes.

## Dates and budget
- **Dates:** None: no date.
- **Budget:** None: no budget.
