// Generate the page with the public command, then exercise its standalone browser script.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const SCRIPT = path.join(SKILL, 'scripts', 'meeting-page.js');
const CEDAR = path.join(SKILL, 'examples', 'cedar-clinic', 'docs');
const MARKER = '<!-- project-docs:meeting-page -->';
const TEMPLATE = [
  { lang: 'en', dir: 'ltr', project: 'Cedar Test Clinic', title: 'Client meeting form', placeholder: '<Project name>',
    open: 'Still open', firstQuestion: 'What is it, in two or three sentences?', signatures: 'Signatures: the notes of stages 1 and 2',
    newThings: 'Anything new the client said', missing: 'missing', blocks: 'yes', clear: /no open questions|nothing (?:is )?open/i },
  { lang: 'ar', dir: 'rtl', project: 'عيادة الأرز', title: 'نموذج اجتماع العميل', placeholder: '<اسم المشروع>',
    open: 'ما زال مفتوحًا', firstQuestion: 'ما هو، في جملتين أو ثلاث؟', signatures: 'التوقيعات: ملاحظات المرحلتين 1 و2',
    newThings: 'أي جديد قاله العميل', missing: 'ناقص', blocks: 'نعم', clear: /لا (?:شيء|توجد|يوجد)[^<]*مفتوح/ },
];

function formFor(language) {
  const reference = fs.readFileSync(path.join(SKILL, 'references', 'meeting-form.md'), 'utf8');
  const form = [...reference.matchAll(/```markdown\n([\s\S]*?)\n```/g)]
    .map((m) => m[1]).find((m) => m.startsWith(`# ${language.title}: `));
  assert.ok(form, `${language.lang} reference template`);
  return `${form.replace(language.placeholder, language.project)}\n`;
}

function withTableRows(form, heading, ...rows) {
  const lines = form.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  assert.ok(start > 0, `${heading} heading in the form`);
  const separator = lines.findIndex((line, index) => index > start && /^\|[- :]+\|/.test(line));
  assert.ok(separator > start, `${heading} table separator in the form`);
  lines.splice(separator + 1, 0, ...rows);
  return lines.join('\n');
}

function workspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-docs-meeting-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(source, destination) {
  const args = destination === undefined ? [source] : [source, destination];
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  assert.ifError(result.error);
  return result;
}

function assertOffline(html) {
  const csp = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i);
  assert.ok(csp, 'the page declares a Content Security Policy');
  assert.match(entityDecode(csp[1]), /\bdefault-src\s+'none'/i);
  assert.doesNotMatch(html, /https?:\/\/|<[a-z][^>]*\b(?:src|srcset|href)\s*=|<link\b|@import|\burl\s*\(/i);
  assert.equal((html.match(/<script\b/gi) || []).length, 1, 'exactly one inline runtime script');
}

function generate(t, form) {
  const dir = workspace(t);
  const source = path.join(dir, 'meeting-form.md');
  const output = path.join(dir, 'meeting-form.html');
  fs.writeFileSync(source, form);
  const result = run(source);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(output, 'utf8');
  assertOffline(html);
  return html;
}

function entityDecode(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (_, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
    return named[entity];
  });
}

for (const language of TEMPLATE) {
  test(`${language.lang}: a blank form shows every stage, labeled fields and paper signatures`, (t) => {
    const form = formFor(language);
    const html = generate(t, form);
    assert.match(html, new RegExp(`<html[^>]+lang="${language.lang}"[^>]+dir="${language.dir}"`));
    assert.match(html, /<main[^>]+data-mode="whole"/);
    for (const heading of form.match(/^###? (?:Stage \d|المرحلة \d|\d+\.).*$/gm)) {
      assert.ok(entityDecode(html).includes(heading.replace(/^#+ /, '')), heading);
    }
    assert.ok(entityDecode(html).includes(language.firstQuestion));
    assert.ok(entityDecode(html).includes(language.signatures));
    assert.match(html, /@page\s*\{[^}]*size\s*:\s*A4\b/i);
    const fields = [...html.matchAll(/<(?:input|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)].map((m) => m[1]);
    assert.ok(fields.length > 30, 'the document includes questions and meeting details');
    assert.equal(new Set(fields).size, fields.length, 'each field ID is unique');
    for (const id of fields) assert.ok(html.includes(`for="${id}"`), `visible label for ${id}`);
    assert.ok(fields.every((id) => !id.includes('signature')), 'signatures are paper only');
  });

  test(`${language.lang}: a follow-up form shows only the questions listed as still open`, (t) => {
    const form = formFor(language);
    const openQuestion = language.lang === 'ar' ? 'متى يسلّم العميل السجلات؟' : 'When will the client send the records?';
    const html = generate(t, withTableRows(form, language.open,
      `| 1 | ${openQuestion} | ${language.missing} | ${language.blocks} | Cedar | 1 |`));
    assert.match(html, /<main[^>]+data-mode="open"/);
    assert.ok(entityDecode(html).includes(openQuestion));
    assert.ok(entityDecode(html).includes(language.newThings));
    assert.ok(!entityDecode(html).includes(language.firstQuestion));
    assert.equal((html.match(/<textarea\b[^>]*\bid="answer-\d+"/g) || []).length, 1);
    for (const id of ['meeting-date', 'meeting-place', 'meeting-attendees', 'meeting-new']) {
      assert.ok(html.includes(`for="${id}"`));
    }
  });

  test(`${language.lang}: a single answer and one meeting without open rows still reports blanks`, (t) => {
    const form = formFor(language);
    const answer = language.lang === 'ar' ? 'يتصل المريض بالعيادة.' : 'The patient calls the clinic.';
    const answered = form.replace(`**${language.firstQuestion}**\n`, `**${language.firstQuestion}**\n\n> ${answer}\n\n`);
    assert.notEqual(answered, form, 'fixture answers a question');
    const held = language.lang === 'ar' ? 'الاجتماعات التي عُقدت' : 'Meetings held';
    const html = generate(t, withTableRows(answered, held, '| 1 | 2026-11-22, Cedar | 1 | Cedar manager | |'));
    assert.match(html, /<main[^>]+data-mode="incomplete"/);
    assert.match(entityDecode(html), language.lang === 'ar'
      ? /50 من الأسئلة بلا إجابة\. حدّث «ما زال مفتوحًا»/
      : /50 questions are blank\. Update Still open/);
    assert.doesNotMatch(entityDecode(html), language.clear);
    assert.ok(!html.includes('id="answer-1"'));
    for (const id of ['meeting-date', 'meeting-place', 'meeting-attendees', 'meeting-new']) {
      assert.ok(html.includes(`for="${id}"`));
    }
  });

  test(`${language.lang}: the separate scope-signature grid requires the exact open decision`, (t) => {
    const form = formFor(language);
    const held = language.lang === 'ar' ? 'الاجتماعات التي عُقدت' : 'Meetings held';
    const scopeRow = language.lang === 'ar' ? 'يعتمد النطاق' : 'Approves the scope';
    const decision = language.lang === 'ar' ? '10. القرار' : '10. The decision';
    const signLabel = language.lang === 'ar' ? 'توقيعات قرار النطاق' : 'Signatures for the scope decision';
    const withMeeting = withTableRows(form, held, '| 1 | 2026-11-22, Cedar | 1 | Cedar manager | |');
    const withOpenQuestion = (question) => withTableRows(withMeeting, language.open,
      `| 1 | ${question} | ${language.missing} | ${language.blocks} | Cedar | 1 |`);
    const discovery = generate(t, withOpenQuestion(language.firstQuestion));
    assert.ok(!discovery.includes(`<th scope="row">${scopeRow}</th>`));
    assert.ok(!discovery.includes(signLabel));
    assert.ok(discovery.includes(`aria-label="${language.signatures}"`));
    const scopeMeeting = generate(t, withOpenQuestion(decision));
    assert.ok(scopeMeeting.includes(`<th scope="row">${scopeRow}</th>`));
    assert.ok(scopeMeeting.includes(`<h2>${signLabel}</h2>`));
    assert.ok(scopeMeeting.includes(`aria-label="${signLabel}"`));
    assert.ok(!scopeMeeting.includes(`<h2>${language.signatures}</h2>`));
  });
}

for (const language of TEMPLATE) {
  test(`${language.lang}: section 6 requires a check for now but not for later`, (t) => {
    const form = formFor(language);
    const arabic = language.lang === 'ar';
    const heading = arabic ? '### 6. ما يجب أن يفعله' : '### 6. What it must do';
    const timing = arabic ? ['لاحقًا', 'الآن'] : ['later', 'now'];
    const requirement = arabic ? 'يرى المريض زياراته السابقة' : 'patients see their past visits';
    const [before, section] = form.split(heading);
    assert.ok(section, 'the form includes section 6');

    for (const [when, blank] of [[timing[0], 48], [timing[1], 49]]) {
      const withRequirement = before + heading + section.replace('| 1 | | | |', `| 1 | ${requirement} | ${when} | |`);
      assert.notEqual(withRequirement, form, 'the fixture fills in a section 6 row');
      const html = generate(t, withRequirement);
      assert.match(html, /<main[^>]+data-mode="incomplete"/);
      const notice = arabic ? `${blank} من الأسئلة بلا إجابة` : `${blank} questions are blank`;
      assert.ok(html.includes(notice), `${when}: expected "${notice}"`);
    }
  });
}

test('the approved Cedar form reaches the all-clear with an empty check for a later requirement', (t) => {
  const cedar = fs.readFileSync(path.join(CEDAR, 'meeting-form.md'), 'utf8');
  assert.ok(cedar.includes('| 6 | patients see their past visits | later | |'));
  const html = generate(t, cedar);
  assert.match(html, /<main[^>]+data-mode="clear"/);
  assert.match(html, /Nothing is open\./);
});

test('explicitly answered fields allow the all-clear', (t) => {
  const cedar = fs.readFileSync(path.join(CEDAR, 'meeting-form.md'), 'utf8');
  const complete = cedar
    .replace('| 6 | patients see their past visits | later | |', '| 6 | patients see their past visits | now | not decided |')
    .replace('**Old records:** none move in; the paper diary ends when it goes live.', '**Old records:** does not apply')
    .replace('**Brand:** no brand rules.', '**Brand:** (see <section>)')
    .replace('**Changes asked, or why it stops:** none.', '**Changes asked, or why it stops:**');
  const html = generate(t, complete);
  assert.match(html, /<main[^>]+data-mode="clear"/);
  assert.match(html, /Nothing is open\./);
  assert.ok(!html.includes('<th scope="row">Approves the scope</th>'));
});

test('Cedar follow-ups keep recorded note signatures and leave unsigned rows ready', (t) => {
  const cedar = fs.readFileSync(path.join(CEDAR, 'meeting-form.md'), 'utf8');
  const followup = withTableRows(cedar, 'Still open',
    '| 1 | When will the client send the records? | missing | yes | Cedar | 4 |');
  const client = '| For the client | the clinic manager | signed | 2026-10-02 |';
  const builder = '| For our team | the builder | signed | 2026-10-02 |';
  assert.ok(cedar.includes(client) && cedar.includes(builder), 'the Cedar example records both note signatures');

  const clientSigned = '<th scope="row">For the client</th><td>the clinic manager</td><td>signed</td><td>2026-10-02</td>';
  const builderSigned = '<th scope="row">For our team</th><td>the builder</td><td>signed</td><td>2026-10-02</td>';
  const builderUnsigned = '<th scope="row">For our team</th><td>the builder</td><td></td><td></td>';

  const fullySigned = generate(t, followup);
  assert.ok(fullySigned.includes(clientSigned) && fullySigned.includes(builderSigned));

  const partial = followup.replace(builder, '| For our team | the builder | | |');
  const partlySigned = generate(t, partial);
  assert.ok(partlySigned.includes(clientSigned) && partlySigned.includes(builderUnsigned));

  const unsigned = generate(t, partial.replace(client, '| For the client | | | |'));
  assert.ok(unsigned.includes('<th scope="row">For the client</th><td></td><td></td><td></td>'));
  assert.ok(unsigned.includes(builderUnsigned));

  const decision = generate(t, withTableRows(cedar, 'Still open',
    '| 1 | 10. The decision | missing | yes | Cedar | 4 |'));
  assert.ok(decision.includes('<th scope="row">Approves the scope</th><td></td><td></td><td></td>'));
  assert.ok(!decision.includes(clientSigned));
});

test('a meeting without answers still shows the whole form and advances the download number', (t) => {
  const form = withTableRows(formFor(TEMPLATE[0]), 'Meetings held', '| 1 | 2026-11-22 | 1, 2 | Cedar | |');
  const html = generate(t, form);
  assert.match(html, /<main[^>]+data-mode="whole"/);
  const page = browser(html);
  page.click('save-answers');
  assert.equal(page.downloads[0].name, 'meeting-2-answers.md');
});

test('the published Cedar page is current', (t) => {
  const html = generate(t, fs.readFileSync(path.join(CEDAR, 'meeting-form.md'), 'utf8'));
  assert.equal(fs.readFileSync(path.join(CEDAR, 'meeting-form.html'), 'utf8'), html, 'regenerate the Cedar example');
  assert.ok(html.includes(MARKER));
});

test('an unknown form heading is refused with its line number before output is written', (t) => {
  const dir = workspace(t);
  const form = formFor(TEMPLATE[0]);
  const lines = form.split('\n');
  const stage = lines.indexOf('## Stage 2: the people and today\'s work');
  assert.ok(stage > 0);
  lines[stage] = '## Stage 2: an unknown heading';
  const source = path.join(dir, 'meeting-form.md');
  fs.writeFileSync(source, lines.join('\n'));
  const result = run(source);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, new RegExp(`\\bline\\s+${stage + 1}\\b`, 'i'));
  assert.equal(fs.existsSync(path.join(dir, 'meeting-form.html')), false);
});

test('the command will not overwrite a link, the source, a file with the wrong extension or a foreign page', (t) => {
  const dir = workspace(t);
  const form = formFor(TEMPLATE[0]);
  const source = path.join(dir, 'meeting-form.md');
  const sourceWithHtmlSuffix = path.join(dir, 'source.html');
  const generated = path.join(dir, 'generated.html');
  const foreign = path.join(dir, 'foreign.html');
  const linked = path.join(dir, 'linked.html');
  const wrongSuffix = path.join(dir, 'generated.txt');
  const oldPage = `<!doctype html>\n${MARKER}\n<p>old page</p>\n`;
  fs.writeFileSync(source, form);
  fs.writeFileSync(sourceWithHtmlSuffix, form);
  fs.writeFileSync(generated, oldPage);
  fs.writeFileSync(foreign, '<p>keep this page</p>\n');
  fs.writeFileSync(wrongSuffix, oldPage);
  fs.symlinkSync(generated, linked);

  for (const [input, output, reason] of [[source, linked, /(?:symbolic )?link/i],
    [sourceWithHtmlSuffix, sourceWithHtmlSuffix, /source|input|same/i], [source, wrongSuffix, /\.html/i],
    [source, foreign, /generat|marker|foreign|overwrite/i]]) {
    const bytes = fs.readFileSync(output);
    const result = run(input, output);
    assert.notEqual(result.status, 0, `must refuse ${path.basename(output)}`);
    assert.match(result.stderr, reason);
    assert.deepEqual(fs.readFileSync(output), bytes, `must preserve ${path.basename(output)}`);
  }
  assert.ok(fs.lstatSync(linked).isSymbolicLink());
  assert.equal(fs.readFileSync(generated, 'utf8'), oldPage, 'a link target is preserved as well');
  const result = run(source, generated);
  assert.equal(result.status, 0, result.stderr);
  const replaced = fs.readFileSync(generated, 'utf8');
  assert.ok(replaced.includes(MARKER));
  assert.ok(replaced.includes(TEMPLATE[0].project));
  assert.ok(!replaced.includes('old page'));
});

test('the first write works without hard links and preserves a file created during that write', (t) => {
  const dir = workspace(t);
  const source = path.join(dir, 'meeting-form.md');
  const first = path.join(dir, 'first.html');
  const raced = path.join(dir, 'raced.html');
  const noHardLinks = path.join(dir, 'no-hard-links.cjs');
  const foreign = '<p>Another writer got here first</p>\n';
  fs.writeFileSync(source, formFor(TEMPLATE[0]));
  fs.writeFileSync(noHardLinks, `
    const fs = require('node:fs');
    fs.linkSync = (_, destination) => {
      if (destination.endsWith('raced.html')) {
        fs.writeFileSync(destination, ${JSON.stringify(foreign)}, { flag: 'wx' });
      }
      throw Object.assign(new Error('This filesystem does not support hard links'), { code: 'ENOTSUP' });
    };
  `);

  const create = (destination) => {
    const result = spawnSync(process.execPath, ['--require', noHardLinks, SCRIPT, source, destination], { encoding: 'utf8' });
    assert.ifError(result.error);
    return result;
  };
  const written = create(first);
  assert.equal(written.status, 0, written.stderr);
  assert.ok(fs.readFileSync(first, 'utf8').includes(MARKER));

  const refused = create(raced);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /EEXIST|already exists/i);
  assert.equal(fs.readFileSync(raced, 'utf8'), foreign);
});

function readAttributes(tag) {
  return Object.fromEntries([...tag.matchAll(/\s([\w-]+)(?:="([^"]*)")?/g)]
    .map(([, key, value = '']) => [key, entityDecode(value)]));
}

// Enough of the browser to run the generated script against actual fields, including event bubbling.
function browser(html, { storage = new Map(), storageBlocked = false, confirm = true,
  href = 'file:///example/meeting-form.html' } = {}) {
  function element(tag = '', parent) {
    const attrs = readAttributes(tag);
    const listeners = new Map();
    const dataset = Object.fromEntries(Object.entries(attrs).filter(([name]) => name.startsWith('data-'))
      .map(([name, value]) => [name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
    return {
      id: attrs.id, dataset, hidden: Object.hasOwn(attrs, 'hidden'), value: attrs.value || '', textContent: '',
      addEventListener(type, handler) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
      dispatch(type, event = {}) {
        event.target ??= this;
        event.currentTarget = this;
        event.preventDefault ??= () => { event.defaultPrevented = true; };
        for (const handler of listeners.get(type) || []) handler(event);
        if (event.bubbles) parent?.dispatch(type, event);
        return event;
      },
    };
  }

  const window = element();
  window.location = { href };
  const document = element('', window);
  const tags = [...html.matchAll(/<[a-z][^>]+\bid="[^"]+"[^>]*>/gi)].map((match) => match[0]);
  const formTag = tags.find((tag) => /\bid="meeting-sheet"/.test(tag));
  const form = element(formTag, document);
  const nodes = new Map(tags.map((tag) => {
    const node = tag === formTag ? form : element(tag, form);
    return [node.id, node];
  }));
  const fields = [...nodes.values()].filter((node) => Object.hasOwn(node.dataset, 'answer'));
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const blobs = new Map();
  const downloads = [];
  const urlApi = {
    createObjectURL(blob) {
      const id = `blob:${blobs.size}`;
      blobs.set(id, blob);
      return id;
    },
    revokeObjectURL(url) { blobs.delete(url); },
  };
  const append = () => {};
  document.body = { append, appendChild: append };
  document.documentElement = { dataset: {}, lang: html.match(/<html[^>]*\blang="([^"]+)"/)[1] };
  document.getElementById = (id) => nodes.get(id) || null;
  document.querySelectorAll = (selector) => {
    assert.equal(selector, '[data-answer]', 'documented data entry fields');
    return fields;
  };
  document.createElement = (tag) => {
    assert.equal(tag, 'a');
    return {
      remove() {},
      click() { downloads.push({ name: this.download, contents: blobs.get(this.href).text() }); },
    };
  };
  const timer = (callback) => callback();
  const confirmDialog = () => confirm;
  const sandbox = { window, document, URL: urlApi, Blob, setTimeout: timer, confirm: confirmDialog };
  Object.assign(window, { document, URL: urlApi, Blob, setTimeout: timer, confirm: confirmDialog });
  for (const target of [window, sandbox]) {
    Object.defineProperty(target, 'localStorage', { get() {
      if (storageBlocked) throw new Error('Storage is blocked');
      return localStorage;
    } });
  }
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 1, 'only the generator runtime reaches the browser');
  vm.runInNewContext(scripts[0][1], sandbox, { timeout: 1000 });
  return {
    nodes, downloads, storage,
    type(id, value) {
      const field = nodes.get(id);
      assert.ok(field, id);
      field.value = value;
      field.dispatch('input', { bubbles: true });
    },
    click(id) { nodes.get(id).dispatch('click', { bubbles: true }); },
    closeWarning() {
      const event = window.dispatch('beforeunload');
      return Boolean(event.defaultPrevented || event.returnValue !== undefined);
    },
  };
}

function savedAnswers(saved) {
  const lines = saved.split('\n');
  const answers = [];
  for (let index = 0; index < lines.length; index++) {
    const opening = lines[index].match(/^> (~{3,})$/);
    if (!opening) continue;
    const closing = lines.indexOf(opening[0], index + 1);
    assert.ok(closing > index + 1, 'an answer has its own matched fences and a body line');
    const body = lines.slice(index + 1, closing);
    assert.ok(body.every((line) => line.startsWith('> ')), 'every line of the answer is quoted');
    assert.ok(body.every((line) => !line.includes(opening[1])), 'answer text cannot close its fence');
    answers.push(body.map((line) => line.slice(2)).join('\n'));
    index = closing;
  }
  return answers;
}

test('client markup stays ordinary text in the HTML and the downloaded Markdown', async (t) => {
  const scriptText = '<script>meetingProbe</script>';
  const attributeText = '" data-injected="yes';
  const openQuestion = `What did ${scriptText} ${attributeText} mean?`;
  const html = generate(t, withTableRows(formFor(TEMPLATE[0]), TEMPLATE[0].open,
    `| 1 | ${openQuestion} | missing | yes | Cedar | 1 |`));
  assert.ok(entityDecode(html).includes(openQuestion), 'all words remain visible');
  assert.ok(!html.includes(scriptText));
  assert.ok(!html.includes(attributeText));
  assert.match(html, /&lt;script&gt;meetingProbe&lt;\/script&gt;/);

  const page = browser(html);
  page.type('meeting-date', '2026-11-22');
  page.type('meeting-attendees', 'Cedar Clinic Manager');
  const answer = [
    'Call ahmed@client.ae or +971 50 123 4567, see https://client.ae/a_b #2 (50% & free)',
    scriptText, attributeText, '## Fake', '| a |', '* _ &', 'هذه إجابة العميل كما كتبها.', '',
    '~~~~~~', '  Keep my spaces  ', '',
  ].join('\n');
  page.type('answer-1', answer);
  assert.ok(page.closeWarning(), 'typing a draft warns before closing');
  page.click('save-answers');
  assert.equal(page.downloads.length, 1);
  assert.equal(page.downloads[0].name, 'meeting-1-answers.md');
  const saved = await page.downloads[0].contents;
  assert.ok(!page.closeWarning(), 'saving clears the unsaved status');
  assert.deepEqual(saved.split('\n').filter((line) => /^##\s/.test(line)), [
    '## Project', '## Date', '## Place', '## Who came (name and job)', '## Question 1', '## Anything new the client said',
  ], 'only fixed labels make headings');
  assert.deepEqual(savedAnswers(saved), [TEMPLATE[0].project, '2026-11-22', '', 'Cedar Clinic Manager', openQuestion, answer, '']);
});

test('saved question text is literal, including the exact contact question and Markdown lookalikes', async (t) => {
  const questions = ['Is info@client.ae the right contact?', '## Fake +971 50 123 4567 # | * _ & <script> >'];
  const openRows = questions.map((question, index) =>
    `| ${index + 1} | ${question.replace(/\|/g, '\\|')} | missing | yes | Cedar | 1 |`
  );
  const page = browser(generate(t, withTableRows(formFor(TEMPLATE[0]), TEMPLATE[0].open, ...openRows)));
  page.type('answer-1', 'Yes.');
  page.type('answer-2', 'Keep the exact symbols.');
  page.click('save-answers');
  const saved = await page.downloads[0].contents;
  assert.match(saved, /^> Is info@client\.ae the right contact\?$/m);
  assert.doesNotMatch(saved, /^## Fake/m);
  assert.deepEqual(savedAnswers(saved).slice(4, 8), [questions[0], 'Yes.', questions[1], 'Keep the exact symbols.']);
});

test('saved Arabic question context uses literal text and Arabic labels', async (t) => {
  const page = browser(generate(t, formFor(TEMPLATE[1])));
  const field = Array.from(page.nodes.values()).find((item) => item.dataset.context?.endsWith(' · #1'));
  assert.ok(field, 'a numbered table question includes the source row label in its context');
  page.type(field.id, 'خطوة مسجلة');
  page.click('save-answers');
  const saved = await page.downloads[0].contents;
  const questionNumber = field.id.slice('answer-'.length);
  const expected = [
    `## السؤال ${questionNumber}`, '', '> ~~~', `> ${field.dataset.question}`, '> ~~~', '',
    '**السياق**', '', '> ~~~', `> ${field.dataset.context}`, '> ~~~', '',
    '**الإجابة**', '', '> ~~~', '> خطوة مسجلة', '> ~~~',
  ].join('\n');
  assert.ok(saved.includes(expected));
});

test('same-name projects keep separate drafts by page path and client', (t) => {
  const website = formFor({ ...TEMPLATE[0], project: 'Website' });
  const sourceA = website.replace('| Client (organisation, department) | |', '| Client (organisation, department) | Client A |');
  const sourceB = website.replace('| Client (organisation, department) | |', '| Client (organisation, department) | Client B |');
  const htmlA = generate(t, sourceA);
  const htmlB = generate(t, sourceB);
  const storage = new Map();
  const href = 'file:///client-A/meeting-form.html';
  const draft = 'SECRET budget of Client A';
  browser(htmlA, { storage, href }).type('answer-1', draft);
  assert.equal(browser(htmlA, { storage, href: 'file:///other-folder/meeting-form.html' }).nodes.get('answer-1').value, '');
  assert.equal(browser(htmlB, { storage, href }).nodes.get('answer-1').value, '');
  assert.equal(browser(htmlB, { storage, href: 'file:///client-B/meeting-form.html' }).nodes.get('answer-1').value, '');
  assert.equal(browser(htmlA, { storage, href: href + '?draft=1#meeting' }).nodes.get('answer-1').value, draft);
});

test('typing persists per project and meeting, and Clear discards it only after confirmation', (t) => {
  const html = generate(t, formFor(TEMPLATE[0]));
  const otherProject = generate(t, formFor({ ...TEMPLATE[0], project: 'Another clinic' }));
  const nextMeeting = generate(t, fs.readFileSync(path.join(CEDAR, 'meeting-form.md'), 'utf8')
    .replace('Cedar Clinic Booking', TEMPLATE[0].project));
  const storage = new Map();
  const page = browser(html, { storage, confirm: false });
  assert.equal(page.nodes.get('storage-warning').hidden, true, 'available storage needs no warning');
  page.type('meeting-new', 'Notes stay with one meeting');
  assert.equal(storage.size, 1);
  const otherPage = browser(otherProject, { storage });
  const laterPage = browser(nextMeeting, { storage });
  assert.equal(otherPage.nodes.get('meeting-new').value, '');
  assert.equal(laterPage.nodes.get('meeting-new').value, '');
  otherPage.type('meeting-new', 'A separate draft');
  page.click('clear-answers');
  assert.equal(page.nodes.get('meeting-new').value, 'Notes stay with one meeting');
  const reloaded = browser(html, { storage });
  assert.equal(reloaded.nodes.get('meeting-new').value, 'Notes stay with one meeting');
  reloaded.click('clear-answers');
  assert.equal(reloaded.nodes.get('meeting-new').value, '');
  assert.equal(storage.size, 1);
  assert.equal(browser(otherProject, { storage }).nodes.get('meeting-new').value, 'A separate draft');
});

test('blocked localStorage shows a warning, answers can still be typed and downloaded', async (t) => {
  const html = generate(t, formFor(TEMPLATE[1]));
  const page = browser(html, { storageBlocked: true });
  assert.equal(page.nodes.get('storage-warning').hidden, false, 'the storage warning becomes visible');
  assert.match(html, /لن تُحفظ كتابتك بعد إغلاق/, 'the notice describes losing unsaved typing');
  page.type('meeting-new', 'زيارة جديدة');
  assert.ok(page.closeWarning());
  page.click('save-answers');
  assert.equal(page.downloads.length, 1);
  assert.match(await page.downloads[0].contents, /^> زيارة جديدة$/m);
});
