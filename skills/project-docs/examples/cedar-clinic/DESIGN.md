# DESIGN.md: Cedar Clinic Booking
> v1 · Approved 2026-10-08

## The feel
Quiet and trustworthy, like a well-kept waiting room. Big, clear buttons that are easy to hit on a phone.

## Colors
| Name | Color | Used for |
|---|---|---|
| Background | #F7FAF8 | the page |
| Card | #FFFFFF | cards, panels, inputs |
| Text | #14231C | all reading text |
| Quiet text | #4A5D54 | hints, dates, second lines |
| Main color | #1F6B4A | main buttons, links, focus rings |
| On main | #FFFFFF | text on the main color |
| Lines | #D5E2DB | dividers and card edges |
| Error | #B42318 | error messages and delete |

## Fonts
| Use | Font | Size |
|---|---|---|
| Headings | Lora, bold | 28 px (page), 20 px (card) |
| Text | Plus Jakarta Sans | 16 px |
| Arabic | Noto Naskh Arabic | 17 px |

The font files are in `docs/fonts/` (free, SIL Open Font License). The project uses them from there, not
from the internet.

## Shapes and spacing
- **Corners:** 12 px on cards and buttons.
- **Spacing:** steps of 4, 8, 16, 24 and 32 px; nothing in between.

## Pieces
- **Button:** main color with white bold text, at least 44 px tall; a little darker when pressed; grey with quiet text when turned off.
- **Card:** card color, a 1 px line border, 16 px inside space.
- **Input:** card color, with a 1 px border in Quiet text, so its edge is easy to see; the label above it in text color; the border turns main color when in use.
- **Error message:** error color, bold, right under the thing that went wrong, saying what to do next.

## Must-have rules
- Works on a phone and a computer.
- Text contrast at least 4.5 : 1 (checked when this look was picked).
- Input edges and other controls stand out at least 3 : 1 (they use Quiet text, never Lines).
- Everything works with the keyboard, with a visible focus ring.
- Motion stays off for people who turn it off.

## Ready values
```css
:root {
  --color-background: #F7FAF8;
  --color-card: #FFFFFF;
  --color-text: #14231C;
  --color-quiet: #4A5D54;
  --color-main: #1F6B4A;
  --color-on-main: #FFFFFF;
  --color-lines: #D5E2DB;
  --color-error: #B42318;
  --font-heading: "Lora", Georgia, serif;
  --font-text: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-arabic: "Noto Naskh Arabic", serif;
  --radius: 12px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
}
```
