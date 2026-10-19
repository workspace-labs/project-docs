// project-docs preview: draws the page from looks.js. Only text is ever inserted (never HTML),
// and a look that fails a check is replaced by its list of problems.
(function () {
  'use strict';
  var check = window.ProjectDocsCheck;
  var data; // read inside drawSafely: even a looks.js whose value throws when read ends in a refusal

  var STRINGS = {
    en: {
      eyebrow: 'Pick a look',
      lead: function (n) { return (n === 2 ? 'Two' : 'Three') + ' looks, each filled with your own words. Every one passed a readability check. Tell the AI the letter you like, or what to change.'; },
      leadRefused: 'Not every look passed its checks yet. The AI fixes them before you choose.',
      colors: 'Colors', headings: 'Headings', text: 'Text', corners: 'Corners',
      readable: 'Readable ✓', ratio: function (c) { return this.roles[c.fg] + ' on ' + this.roles[c.bg] + ': ' + c.ratio + ' : 1 (needs ' + c.need + ')'; },
      fixPage: 'This preview can\'t be shown yet. Fix these in looks.js:',
      fixLook: function (letter) { return 'Look ' + letter + ' can\'t be shown yet. Fix these:'; },
      roles: { background: 'Background', surface: 'Card', text: 'Text', muted: 'Quiet text', primary: 'Main color', onPrimary: 'On main', border: 'Lines', danger: 'Error' },
      credit: 'Made with project-docs'
    },
    ar: {
      eyebrow: 'اختر شكلًا',
      lead: function (n) { return (n === 2 ? 'شكلان' : 'ثلاثة أشكال') + '، كلٌّ منها بكلماتك أنت. وكلها نجحت في فحص سهولة القراءة. أخبر الذكاء الاصطناعي بالحرف الذي أعجبك، أو بما تريد تغييره.'; },
      leadRefused: 'لم تنجح كل الأشكال في الفحص بعد. سيصلحها الذكاء الاصطناعي قبل أن تختار.',
      colors: 'الألوان', headings: 'العناوين', text: 'النص', corners: 'الزوايا',
      readable: 'سهل القراءة ✓', ratio: function (c) { return this.roles[c.fg] + ' على ' + this.roles[c.bg] + ': ' + c.ratio + ' : 1 (المطلوب ' + c.need + ')'; },
      fixPage: 'لا يمكن عرض هذه المعاينة بعد. أصلح هذه في looks.js:',
      fixLook: function (letter) { return 'لا يمكن عرض الشكل ' + letter + ' بعد. أصلح هذه:'; },
      roles: { background: 'الخلفية', surface: 'البطاقة', text: 'النص', muted: 'النص الهادئ', primary: 'اللون الرئيسي', onPrimary: 'على الرئيسي', border: 'الحدود', danger: 'الخطأ' },
      credit: 'صُنع باستخدام project-docs'
    }
  };
  var LETTERS = { en: ['A', 'B', 'C'], ar: ['أ', 'ب', 'ج'] };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // A value like "#FFFFFF" or "12 px" keeps its own direction inside a right-to-left page.
  function isolated(tag, text) {
    var node = el(tag);
    node.appendChild(el('bdi', null, text));
    return node;
  }

  function fontStack(name) { return '"' + name + '", system-ui, sans-serif'; }

  function fixBox(title, problems, cls) {
    var box = el('section', 'fix' + (cls ? ' ' + cls : ''));
    box.setAttribute('role', 'alert');
    box.appendChild(el('h2', null, title));
    var list = el('ol');
    problems.forEach(function (p) { list.appendChild(el('li', null, p)); });
    box.appendChild(list);
    return box;
  }

  function sample(look, project) {
    var c = look.colors, r = look.radius + 'px';
    var s = el('div', 'sample');
    s.style.background = c.background; s.style.color = c.text; s.style.borderColor = c.border;
    s.style.fontFamily = fontStack(look.fonts.body); s.style.borderRadius = r;

    var h = el('h2', null, project.name);
    h.style.fontFamily = fontStack(look.fonts.heading);
    s.appendChild(h);
    s.appendChild(el('p', null, project.about));

    var buttons = el('div', 'sample-buttons');
    var main = el('span', null, project.actions[0]);
    main.style.background = c.primary; main.style.color = c.onPrimary; main.style.borderColor = c.primary; main.style.borderRadius = r;
    var second = el('span', null, project.actions[1]);
    second.style.color = c.text; second.style.borderColor = c.border; second.style.borderRadius = r;
    buttons.appendChild(main); buttons.appendChild(second);
    s.appendChild(buttons);

    var card = el('div', 'sample-card');
    card.style.background = c.surface; card.style.borderColor = c.border; card.style.borderRadius = r; card.style.color = c.text;
    card.appendChild(el('strong', null, project.items[0]));
    project.items.slice(1, 4).forEach(function (item) {
      var q = el('span', 'quiet', item); q.style.color = c.muted; card.appendChild(q);
    });
    if (project.error) { var e = el('span', 'error', project.error); e.style.color = c.danger; card.appendChild(e); }
    s.appendChild(card);
    return s;
  }

  function facts(look, result, t) {
    var f = el('div', 'facts');
    var sw = el('ul', 'swatches');
    sw.setAttribute('aria-label', t.colors);
    check.COLOR_ROLES.forEach(function (role) {
      var li = el('li');
      var chip = el('span', 'chip'); chip.style.background = look.colors[role];
      li.appendChild(chip); li.appendChild(document.createTextNode(t.roles[role]));
      li.appendChild(isolated('code', look.colors[role].toUpperCase()));
      sw.appendChild(li);
    });
    f.appendChild(sw);
    var dl = el('dl');
    [[t.headings, look.fonts.heading], [t.text, look.fonts.body], [t.corners, look.radius + ' px']].forEach(function (pair) {
      dl.appendChild(el('dt', null, pair[0])); dl.appendChild(isolated('dd', pair[1]));
    });
    f.appendChild(dl);
    var d = el('details', 'readable');
    d.appendChild(el('summary', null, t.readable));
    var ul = el('ul');
    result.checks.forEach(function (c) { ul.appendChild(el('li', null, t.ratio(c))); });
    d.appendChild(ul);
    f.appendChild(d);
    return f;
  }

  function draw() {
    var result = check.validate(window.PROJECT_DOCS_LOOKS);
    data = result.data || null; // from here on, only the plain copy that was checked
    var project = (data && data.project) || {};
    var lang = project.language === 'ar' && STRINGS.ar ? 'ar' : 'en';
    var t = STRINGS[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    var wrap = el('main', 'wrap');
    wrap.appendChild(el('p', 'eyebrow', t.eyebrow));
    wrap.appendChild(el('h1', 'title', project.name || 'project-docs'));
    if (project.name) document.title = t.eyebrow + ' · ' + project.name;

    var refused = result.problems.length > 0;
    var waits = [], shown = [], lead;
    if (refused) {
      wrap.appendChild(fixBox(t.fixPage, result.problems, 'page-fix'));
    } else {
      // Fonts outside the folder load only when the person said yes (they are listed in onlineFonts).
      waits = (data.onlineFonts || []).map(loadOnlineFont);
      refused = result.looks.some(function (r) { return r.problems.length > 0; });
      lead = el('p', 'lead', refused ? t.leadRefused : t.lead(data.looks.length));
      wrap.appendChild(lead);
      var grid = el('div', 'looks');
      data.looks.forEach(function (look, i) {
        var r = result.looks[i];
        if (r.problems.length) { grid.appendChild(fixBox(t.fixLook(LETTERS[lang][i]), r.problems)); return; }
        var card = el('article', 'look');
        card.setAttribute('aria-label', LETTERS[lang][i] + ': ' + look.name);
        // The letter sits on the look's own background, so it is always as readable as the look's main color.
        var letter = el('span', 'letter', LETTERS[lang][i]);
        letter.style.fontFamily = fontStack(look.fonts.heading);
        letter.style.color = look.colors.primary;
        letter.style.background = look.colors.background;
        letter.setAttribute('aria-hidden', 'true');
        card.appendChild(letter);
        card.appendChild(el('h2', 'look-name', look.name));
        card.appendChild(el('p', 'look-feel', look.feel));
        card.appendChild(sample(look, project));
        card.appendChild(facts(look, r, t));
        grid.appendChild(card);
        shown.push({ look: look, card: card, letter: LETTERS[lang][i], n: i + 1 });
      });
      wrap.appendChild(grid);
    }
    wrap.appendChild(el('p', 'credit', t.credit));
    document.body.appendChild(wrap);

    // A look is ready only once its fonts really loaded: a missing font file or a blocked online font
    // would otherwise show a stand-in font as if it were the look.
    Promise.all(waits)
      .then(function () { return Promise.all(shown.map(fontProblems)); })
      .then(function (lists) {
        lists.forEach(function (problems, k) {
          if (!problems.length) return;
          refused = true;
          shown[k].card.replaceWith(fixBox(t.fixLook(shown[k].letter), problems));
        });
        if (refused && lead) lead.textContent = t.leadRefused;
      })
      .then(done, function (e) {
        refused = true;
        wrap.insertBefore(fixBox(t.fixPage, ['The fonts could not be checked (' + said(e) + ').'], 'page-fix'), wrap.children[2] || null);
        done();
      });

    // For the agent: "ready" means every look passed; "refused" means fix it first.
    function done() { document.body.setAttribute('data-preview', refused ? 'refused' : 'ready'); }
  }

  function loadOnlineFont(name) {
    return new Promise(function (resolve) {
      var link = el('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + ':wght@400;700&display=swap';
      var finish = function () { resolve(); };
      link.onload = finish; link.onerror = finish;
      setTimeout(finish, 10000);
      document.head.appendChild(link);
    });
  }

  // A face's weight: "400", "bold", or a variable font's range "100 900".
  function weightRange(w) {
    var parts = String(w).trim().split(/\s+/).map(function (p) { return p === 'normal' ? 400 : p === 'bold' ? 700 : Number(p); });
    return parts.length === 2 ? parts : [parts[0], parts[0]];
  }

  // A face's unicode-range ("U+0000-00FF, U+0600-06FF, U+4??") as [from, to] pairs.
  function unicodeRanges(r) {
    return String(r || 'U+0-10FFFF').split(',').map(function (part) {
      var m = part.trim().replace(/^U\+/i, '').split('-');
      var from = parseInt(m[0].replace(/\?/g, '0'), 16);
      var to = parseInt((m[1] || m[0]).replace(/\?/g, 'F'), 16);
      return [from, to];
    });
  }

  // Every font, weight and the exact text the sample draws with it.
  function drawnText(look, letter) {
    var p = data.project, list = [];
    list.push([look.fonts.heading, 700, p.name + ' ' + letter]);
    list.push([look.fonts.body, 400, [p.about].concat(p.items.slice(1, 4)).join(' ')]);
    list.push([look.fonts.body, 700, p.actions.slice(0, 2).concat(p.items[0], p.error || []).join(' ')]);
    return list;
  }

  // A stalled font file must end in refusal too. Settling this promise once keeps a late
  // load from changing the result; completed requests release their deadline immediately.
  function loadFont(font, text) {
    var loading = document.fonts.load(font, text);
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { resolve([]); }, 10000);
      loading.then(function (faces) {
        clearTimeout(timer); resolve(faces);
      }, function (error) {
        clearTimeout(timer); reject(error);
      });
    });
  }

  // A look counts as loaded only when, for each font and weight it draws, a loaded face really has that
  // weight (a variable font's range counts) and covers every letter of the text drawn with it. A regular
  // face standing in for bold, or a missing language subset, is refused.
  function fontProblems(item) {
    var label = 'Look ' + item.n + ' "' + item.look.name + '"';
    if (!document.fonts || !document.fonts.load) {
      return Promise.resolve([label + ': this browser cannot confirm the fonts loaded. Open the preview in a current Chrome, Edge, Safari or Firefox.']);
    }
    return Promise.all(drawnText(item.look, item.letter).map(function (w) {
      var name = w[0], weight = w[1], text = w[2];
      return loadFont(weight + ' 16px "' + name + '"', text).then(function (faces) {
        var usable = faces.filter(function (f) {
          var r = weightRange(f.weight);
          return f.status === 'loaded' && weight >= r[0] && weight <= r[1];
        });
        if (!usable.length || faces.some(function (f) { return f.status === 'error'; })) return false;
        return Array.from(text).every(function (ch) {
          if (/\s/.test(ch)) return true;
          var code = ch.codePointAt(0);
          return usable.some(function (f) {
            return unicodeRanges(f.unicodeRange).some(function (r) { return code >= r[0] && code <= r[1]; });
          });
        });
      }, function () { return false; }).then(function (ok) {
        return ok ? null : label + ': the font "' + name + '" (' + (weight === 700 ? 'bold' : 'regular') + ') did not load for the text it shows. ' +
          (check.isBundled(name) ? 'Keep the fonts folder next to preview.html, with every file in it. If the files are there, pick a font containing every character in the sample.' : 'It loads from the internet: check the connection, or pick a font inside the preview.');
      });
    })).then(function (list) {
      return list.filter(Boolean).filter(function (p, i, all) { return all.indexOf(p) === i; });
    });
  }

  // Whatever was thrown (an Error, null, undefined, a string), said safely in words.
  function said(e) {
    try { return e && typeof e.message === 'string' ? e.message : String(e); } catch (x) { return 'an unreadable error'; }
  }

  // If anything unexpected goes wrong while drawing, the page still ends in a clear refusal, never blank.
  function drawSafely() {
    try { draw(); }
    catch (e) {
      document.body.textContent = '';
      var wrap = el('main', 'wrap');
      wrap.appendChild(fixBox(STRINGS.en.fixPage, ['The preview could not be drawn (' + said(e) + '). Check looks.js against references/design.md.'], 'page-fix'));
      document.body.appendChild(wrap);
      document.body.setAttribute('data-preview', 'refused');
    }
  }

  drawSafely();
})();
