# Security: Notes Digest
> v1 · Approved 2026-11-16

## Who can get in
- Nobody signs in: it runs only on the team lead's own computer.

## How it's protected
- **Records:** None: nobody signs in, so there is no one else's record to reach.
- **Database:** None: it saves nothing.
- **Sign-in:** None: nobody signs in.
- **Connections:** the tool reaches Quill 2 only over HTTPS/TLS with certificate validation, and never with that check turned off.
- **Audit:** None: it saves nothing and has no access to anyone else's protected records.

Worth protecting: the text of the notes, which can name people and what they said, and the service key.
Not trusted: the notes themselves, which may hold text written to steer the model. A notes file that says
"ignore your instructions" must not change what the tool does → the Plan's step 3 runs such a file. A key
left in the code would be copied with it → the key lives only in an environment variable (see Secrets).

## Secrets
- The service key: in an environment variable on the team lead's computer, never in the code and never in git. Only the team lead sees it, and it is replaced on Harborline's site.

## Personal data
- It saves nothing. The notes it reads can name people and what they said: that text is sent to the language model (see Outside services) and is never kept by the tool.

## Outside services
- Quill 2, Harborline's hosted language model: receives the text of the one notes file and the instructions, and nothing else from the computer.

## Work rules
- None: personal project.

## If something goes wrong
- **Tell first:** nobody else is involved; it is a personal tool.
- **Do first:** replace the service key on Harborline's site.
- **Tell the people affected:** if Harborline reports a leak, the team lead tells the people named in the notes that were sent.
