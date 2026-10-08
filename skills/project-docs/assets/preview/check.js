// project-docs preview: the checks. Never touches the page, so it also runs in Node for the tests.
// A look that fails any check is never shown: the page shows its problems instead.
(function (root) {
  'use strict';

  // The fonts inside this folder. Any other font needs the person's yes (listed in onlineFonts).
  var BUNDLED_FONTS = {
    'Plus Jakarta Sans': { arabic: false },
    'Instrument Sans': { arabic: false },
    'Bricolage Grotesque': { arabic: false },
    'Lora': { arabic: false },
    'Crimson Pro': { arabic: false },
    'Noto Naskh Arabic': { arabic: true }
  };

  var COLOR_ROLES = ['background', 'surface', 'text', 'muted', 'primary', 'onPrimary', 'border', 'danger'];

  // Each pair the page draws as text (4.5 : 1) or as a shape people must see (3 : 1).
  var PAIRS = [
    { fg: 'text', bg: 'background', need: 4.5, what: 'the main text on the page background' },
    { fg: 'text', bg: 'surface', need: 4.5, what: 'the main text on a card' },
    { fg: 'muted', bg: 'surface', need: 4.5, what: 'the quiet text on a card' },
    { fg: 'muted', bg: 'background', need: 4.5, what: 'the quiet text on the page background' },
    { fg: 'onPrimary', bg: 'primary', need: 4.5, what: 'the button text on the main color' },
    { fg: 'primary', bg: 'background', need: 3, what: 'the main color against the page background' },
    { fg: 'danger', bg: 'surface', need: 4.5, what: 'the error text on a card' },
    { fg: 'danger', bg: 'background', need: 4.5, what: 'the error text on the page background' }
  ];

  var HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var FONT_NAME = /^[A-Za-z0-9 ]{2,40}$/;

  function channel(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(hex) {
    var h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
  }

  // WCAG contrast ratio, 1 to 21.
  function contrast(a, b) {
    var x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  function round(r) { return Math.floor(r * 10) / 10; }

  function isText(v, max) { return typeof v === 'string' && v.trim().length > 0 && v.length <= max; }

  // Only the object's own values count: never an inherited one such as "toString".
  function own(obj, key) { return obj !== null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key); }
  function isBundled(name) { return own(BUNDLED_FONTS, name); }

  function checkLook(look, n, online, arabic) {
    var problems = [], checks = [];
    var label = 'Look ' + n + (look && isText(look.name, 60) ? ' "' + look.name + '"' : '');
    if (!look || typeof look !== 'object') return { problems: [label + ': is not a look.'], checks: checks };
    if (!isText(look.name, 40)) problems.push(label + ': give it a short name (up to 40 characters).');
    if (!isText(look.feel, 140)) problems.push(label + ': say its feel in one line (up to 140 characters).');

    var colors = look.colors;
    var colorsOk = true;
    COLOR_ROLES.forEach(function (role) {
      if (!own(colors, role) || typeof colors[role] !== 'string' || !HEX.test(colors[role])) {
        problems.push(label + ': the color "' + role + '" must be written like #1D4ED8.');
        colorsOk = false;
      }
    });
    if (colorsOk) {
      PAIRS.forEach(function (p) {
        var ratio = contrast(colors[p.fg], colors[p.bg]);
        var pass = ratio >= p.need;
        checks.push({ fg: p.fg, bg: p.bg, what: p.what, ratio: round(ratio), need: p.need, pass: pass });
        if (!pass) {
          problems.push(label + ': ' + p.what + ' (' + colors[p.fg] + ' on ' + colors[p.bg] + ') is hard to read: ' +
            round(ratio) + ' : 1, it needs ' + p.need + ' : 1. Make one of the two darker or lighter.');
        }
      });
    }

    var fonts = look.fonts;
    ['heading', 'body'].forEach(function (role) {
      var name = own(fonts, role) ? fonts[role] : undefined;
      if (!isText(name, 40)) {
        problems.push(label + ': name a ' + role + ' font.');
      } else if (!isBundled(name) && online.indexOf(name) === -1) {
        problems.push(label + ': the font "' + name + '" is not inside the preview. Use one of: ' +
          Object.keys(BUNDLED_FONTS).join(', ') + '. Or, only if the person says yes, add it to onlineFonts.');
      } else if (arabic && isBundled(name) && !BUNDLED_FONTS[name].arabic) {
        problems.push(label + ': the ' + role + ' font "' + name + '" has no Arabic letters. Use Noto Naskh Arabic.');
      }
    });

    if (typeof look.radius !== 'number' || !isFinite(look.radius) || look.radius < 0 || look.radius > 32) {
      problems.push(label + ': give the corner size as a number of pixels from 0 to 32.');
    }
    return { problems: problems, checks: checks };
  }

  // Whatever was thrown (an Error, null, undefined, a string), said safely in words.
  function describe(thrown) {
    try { return thrown && typeof thrown.message === 'string' ? thrown.message : String(thrown); }
    catch (e) { return 'an unreadable error'; }
  }

  // Checks the whole looks file. Returns { problems: [...], looks: [{ problems, checks }], data }.
  // It checks a plain copy (no getters, no functions, NaN and Infinity become null), and the page draws only
  // that copy, so a value can never change or throw after it was checked. A value so odd that copying or
  // checking it throws is refused too, never a crash.
  function validate(data) {
    var cannot = function (thrown) {
      return { problems: ['looks.js holds a value that cannot be checked (' + describe(thrown) + '). Write it as shown in references/design.md.'], looks: [], data: null };
    };
    if (data === undefined || data === null || typeof data !== 'object') return validateData(data);
    var copy;
    try { copy = JSON.parse(JSON.stringify(data)); } catch (e) { return cannot(e); }
    try { var result = validateData(copy); result.data = copy; return result; } catch (e) { return cannot(e); }
  }

  function validateData(data) {
    var problems = [];
    if (!data || typeof data !== 'object') {
      return { problems: ['looks.js is missing or empty. Write it as shown in references/design.md.'], looks: [] };
    }
    var project = data.project !== null && typeof data.project === 'object' ? data.project : {};
    if (!isText(project.name, 60)) problems.push('The project needs a name (up to 60 characters).');
    if (!isText(project.about, 400)) problems.push('Add "about": two or three sentences from the PRD (up to 400 characters).');
    if (!Array.isArray(project.actions) || project.actions.length < 2 || !project.actions.every(function (a) { return isText(a, 30); })) {
      problems.push('Add "actions": at least two button words from the PRD, each up to 30 characters.');
    }
    if (!Array.isArray(project.items) || project.items.length < 2 || !project.items.every(function (a) { return isText(a, 80); })) {
      problems.push('Add "items": at least two list lines from the PRD, each up to 80 characters.');
    }
    if (project.error !== undefined && !isText(project.error, 100)) problems.push('"error" must be one short line (up to 100 characters).');
    if (project.language !== undefined && project.language !== 'en' && project.language !== 'ar') {
      problems.push('"language" must be "en" or "ar".');
    }

    var online = data.onlineFonts === undefined ? [] : data.onlineFonts;
    if (!Array.isArray(online) || !online.every(function (f) { return typeof f === 'string' && FONT_NAME.test(f); })) {
      problems.push('"onlineFonts" must be a list of font names (letters, numbers and spaces).');
      online = [];
    }

    var looks = Array.isArray(data.looks) ? data.looks : [];
    if (looks.length < 2 || looks.length > 3) problems.push('Show 2 or 3 looks (now ' + looks.length + ').');

    var arabic = project.language === 'ar';
    var results = looks.slice(0, 3).map(function (look, i) { return checkLook(look, i + 1, online, arabic); });
    return { problems: problems, looks: results };
  }

  var api = { BUNDLED_FONTS: BUNDLED_FONTS, COLOR_ROLES: COLOR_ROLES, contrast: contrast, validate: validate, isBundled: isBundled };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ProjectDocsCheck = api;

  // Without a browser: node check.js looks.js  → prints "ready" or "refused" and every problem.
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    var fs = require('fs'), vm = require('vm');
    var file = process.argv[2] || require('path').join(__dirname, 'looks.js');
    var sandbox = { window: {} }, data;
    // Running looks.js, and even reading the value it set, can throw anything (null too): both are refused.
    try {
      vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
      data = sandbox.window.PROJECT_DOCS_LOOKS;
    } catch (e) { console.log('refused\n - looks.js could not be read: ' + describe(e)); process.exit(2); }
    var result = validate(data);
    var problems = result.problems.concat.apply(result.problems, result.looks.map(function (l) { return l.problems; }));
    console.log(problems.length ? 'refused' : 'ready');
    problems.forEach(function (p) { console.log(' - ' + p); });
    process.exit(problems.length ? 2 : 0);
  }
})(this);
