# 0003. An HTML preview page shows the looks

- Status: accepted
- Date: 2026-10-08
- Decided by: the owner (Design round + decision 4, 2026-10-08)

## Context

The person picks the project's look by eye from 2–3 options, on any computer, including a locked work PC
and Claude in the browser. Each option must already be readable before the person sees it.

## Options weighed

1. **Describe the looks in words** (color codes, font names). Cheap, but the person can't see them.
2. **One HTML page plus one fixed template**, filled with the project's real words. It opens in any browser
   with nothing to install, the same approach as frameflow.
3. On fonts: **bundle a small set inside the skill**, or **load them from Google Fonts online**.

## Decision

Option 2, with bundled fonts. The agent writes only a small data file (the looks and the project's words).
The template draws the page, checks the text contrast of every color pair, and replaces any look that fails
with a plain "fix this" box, so a failing look is never shown. A font outside the bundled set is loaded
online only when the person says yes.

## Consequences

- Classic `<script>` files, not JavaScript modules, because browsers refuse modules opened from disk.
- The contrast check is plain JavaScript that also loads in Node, so the builder can test it.
- The bundled fonts add a few megabytes to the skill; each one is free (SIL Open Font License) and its
  license travels with it.
