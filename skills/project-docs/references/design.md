# The Design brief: the look (DESIGN.md)

Only for a project with screens. The person picks the look **by eye** from a preview page, and the picked
look becomes `DESIGN.md` at the project root: a plain table they can read plus ready values every AI copies
exactly, so no AI ever invents a color.

## Contents

Gather first · The questions · The preview page · The read-back · The document · In Arabic

## Gather first

- **An existing `DESIGN.md`** → keep it. Never change a value in it. Ask only about the headings it is
  missing, then stamp it. A real change follows the locks rule in SKILL.md.
- **Colors or fonts already in the code** (CSS variables, a theme file, a Tailwind config) → offer them as
  `(found in code)` and ask whether to keep them.
- **The TRD's work rules**: a work brand (colors, logo, fonts) comes before any taste question.
- **The approved PRD**: its words fill the preview, and its users shape the feel.

## The questions

**Round 1**
1. **Does a brand decide any of this?** Colors, a logo or fonts the work or the client already uses.
2. **What should it feel like?** Offer 3 short feels built from the PRD's users ("calm and trustworthy",
   "plain and fast", "warm and welcoming"), plus Other.
3. **Anything to avoid?** A color, a style, a site they don't want to look like.

Then build the preview. Detail questions come after the person has seen it ("What do you like in B? What
would you change?"), never before.

## The preview page

1. Copy the whole `assets/preview/` folder into the project as `docs/design-preview/`.
2. Write `docs/design-preview/looks.js` (the shape is below). It is the **only** file you write there;
   never change the page, its style or its checks.
3. Make **2 or 3 looks that really differ**: a different font pair, corner size and main color each, not
   one palette in three tints. Stay inside the person's answers: if a brand decides the colors, or the feel
   fixes them ("warm", "no dark pages"), vary the fonts, corners and accents instead.
4. Fonts: use the ones inside the preview: Plus Jakarta Sans, Instrument Sans, Bricolage Grotesque,
   Lora, Crimson Pro, and Noto Naskh Arabic for Arabic. For a brand font that isn't there, ask first:
   "This font isn't inside the preview. Load it from Google Fonts to show it? Opening the page downloads
   a Google Fonts stylesheet and font files." Only on yes, add its name to `onlineFonts`.
5. **Check before showing.** If you can open a browser, open `preview.html` and read
   `document.body.dataset.preview`: `ready`, or `refused` with each problem listed on the page. Without a
   browser but with Node.js, run `node docs/design-preview/check.js docs/design-preview/looks.js`: it prints
   `ready`, or `refused` and every problem. With neither, work out each pair in `check.js` yourself (the
   pairs and their minimums are listed there). Fix `looks.js` until it is `ready`, then ask the person to
   open `preview.html`, and look at it yourself if you can, at a computer width and at a phone width (a
   narrow window, or the browser's device view).
6. The person answers with a letter, or a mix ("A's colors with C's fonts"). Update `looks.js` and show it
   again until they pick.
7. **Keep the picked fonts.** Copy the picked look's font files and their license files from
   `docs/design-preview/fonts/` into `docs/fonts/`. The project's code uses them from there, so it never
   needs to load fonts online. (A font from `onlineFonts` is free on Google Fonts: say so, and write where to
   download it.)
8. Once `DESIGN.md` is approved, ask once: "Keep the preview in `docs/design-preview/` as a record, or
   delete it? DESIGN.md and `docs/fonts/` already hold everything." Delete it only on the person's yes.

The sample words in `looks.js` (`items`, `error`) are what a user would see on a real screen, built from
the PRD. They may use made-up sample names, like an example does ("Dr. Haddad"), but they never become
facts in a document.

```js
window.PROJECT_DOCS_LOOKS = {
  project: {
    name: 'Cedar Clinic Booking',                // the PRD's project name
    about: 'Patients of Cedar Family Clinic …',  // two or three sentences from the PRD
    actions: ['Book a visit', 'Move or cancel'], // 2+ button words from "What it must do"
    items: ['Tuesday 14 October, 09:30', '…'],   // 2+ short sample lines a user would see on a screen
    error: 'That time was just taken. Please pick another.', // optional: one real error line
    language: 'en'                               // 'en', or 'ar' for Arabic, right to left
  },
  onlineFonts: [],                               // only fonts the person said yes to
  looks: [
    {
      name: 'Calm Cedar',
      feel: 'Quiet and trustworthy, like a well-kept waiting room.',
      colors: { background: '#F7FAF8', surface: '#FFFFFF', text: '#14231C', muted: '#4A5D54',
                primary: '#1F6B4A', onPrimary: '#FFFFFF', border: '#D5E2DB', danger: '#B42318' },
      fonts: { heading: 'Lora', body: 'Plus Jakarta Sans' },
      radius: 12                                 // corner size in pixels, 0 to 32
    }
    // … 2 or 3 looks in all
  ]
};
```

The page refuses, in plain words, any look whose text is hard to read (4.5 : 1 for text, 3 : 1 for the
main color against the page), whose font is not there, or whose values are broken. A refused look is
never shown to the person.

## The read-back

> You picked A, Calm Cedar: cedar green buttons on a soft white page, Lora headings with Plus Jakarta Sans
> text, 12 px corners. I'll write it into DESIGN.md with the must-have rules. Is that it?

## The document

Write exactly these headings, in this order. The colors are the picked look's 8 roles. These are smart
defaults the person may change: sizes of 28 px for page headings, 20 px for card headings and 16 px for text
(17 px for Arabic text); buttons at least 44 px tall, a little darker when pressed, grey with quiet text when
turned off; cards with a 1 px Lines edge and 16 px inside space; error messages in the error color, right
under what went wrong, saying what to do next. The must-have rules are always there.

````markdown
# DESIGN.md: <Project name>
> v1 · Draft

## The feel
<One or two sentences.>

## Colors
| Name | Color | Used for |
|---|---|---|
| Background | <#hex> | the page |
| Card | <#hex> | cards, panels, inputs |
| Text | <#hex> | all reading text |
| Quiet text | <#hex> | hints, dates, second lines |
| Main color | <#hex> | main buttons, links, focus rings |
| On main | <#hex> | text on the main color |
| Lines | <#hex> | dividers and card edges |
| Error | <#hex> | error messages and delete |

## Fonts
| Use | Font | Size |
|---|---|---|
| Headings | <font> | <px> |
| Text | <font> | <px> |

The font files are in `docs/fonts/` (free, SIL Open Font License). The project uses them from there, not
from the internet.

## Shapes and spacing
- **Corners:** <px> on cards and buttons.
- **Spacing:** steps of 4, 8, 16, 24 and 32 px; nothing in between.

## Pieces
- **Button:** <how it looks: normal, pressed, turned off>
- **Card:** <…>
- **Input:** <…>, with a 1 px border in Quiet text, so its edge is easy to see.
- **Error message:** <…>

## Must-have rules
- Works on a phone and a computer.
- Text contrast at least 4.5 : 1 (checked when this look was picked).
- Input edges and other controls stand out at least 3 : 1 (they use Quiet text, never Lines).
- Everything works with the keyboard, with a visible focus ring.
- Motion stays off for people who turn it off.

## Ready values
```css
:root {
  --color-background: <#hex>;
  --color-card: <#hex>;
  --color-text: <#hex>;
  --color-quiet: <#hex>;
  --color-main: <#hex>;
  --color-on-main: <#hex>;
  --color-lines: <#hex>;
  --color-error: <#hex>;
  --font-heading: "<font>", <fallback>;
  --font-text: "<font>", <fallback>;
  --font-arabic: "Noto Naskh Arabic", serif; /* only when an English project also shows Arabic */
  --radius: <px>;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
}
```
````

## In Arabic

When the person asks for Arabic, set `language: 'ar'` in `looks.js` (the preview turns right to left, and
every look must use Noto Naskh Arabic for its headings and text), and write the document with these
headings. The ready values keep the same names as in the English template.

````markdown
# دليل التصميم (DESIGN.md): <اسم المشروع>
> الإصدار 1 · مسودة

## الإحساس
<جملة أو جملتان.>

## الألوان
| الاسم | اللون | يُستخدم في |
|---|---|---|
| الخلفية | <#hex> | الصفحة |
| البطاقة | <#hex> | البطاقات واللوحات وحقول الإدخال |
| النص | <#hex> | كل نص للقراءة |
| النص الهادئ | <#hex> | التلميحات والتواريخ والأسطر الثانية |
| اللون الرئيسي | <#hex> | الأزرار الرئيسية والروابط وإطار التركيز |
| على الرئيسي | <#hex> | النص فوق اللون الرئيسي |
| الحدود | <#hex> | الفواصل وحواف البطاقات |
| الخطأ | <#hex> | رسائل الخطأ والحذف |

## الخطوط
| الاستخدام | الخط | الحجم |
|---|---|---|
| العناوين | <الخط> | <px> |
| النص | <الخط> | <px> |

ملفات الخطوط في `docs/fonts/` (مجانية، برخصة SIL Open Font License). يستخدمها المشروع من هناك، لا من الإنترنت.

## الأشكال والمسافات
- **الزوايا:** <px> للبطاقات والأزرار.
- **المسافات:** خطوات من 4 و8 و16 و24 و32 px، ولا شيء بينها.

## العناصر
- **الزر:** <شكله: عادي، مضغوط، معطّل>
- **البطاقة:** <…>
- **حقل الإدخال:** <…>، بحدود 1 px بلون النص الهادئ ليظهر طرفه بوضوح.
- **رسالة الخطأ:** <…>

## قواعد لا بد منها
- يعمل على الهاتف والحاسوب.
- تباين النص 4.5 : 1 على الأقل (فُحص عند اختيار هذا الشكل).
- حواف حقول الإدخال وعناصر التحكم واضحة بتباين 3 : 1 على الأقل (بلون النص الهادئ، لا بلون الحدود).
- كل شيء يعمل بلوحة المفاتيح، مع إطار تركيز ظاهر.
- تبقى الحركة متوقفة لمن يوقفها.

## القيم الجاهزة
نفس القيم الجاهزة في القالب الإنجليزي أعلاه، بالأسماء نفسها.
````
