const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SKILL = path.join(__dirname, '..', 'skills', 'project-docs');
const read = (file) => fs.readFileSync(path.join(SKILL, file), 'utf8').replace(/\r\n/g, '\n').normalize('NFC');
const example = (folder, doc) => read(`examples/${folder}/docs/${doc}`);
const section = (text, heading) => (text.split(`\n## ${heading}\n`)[1] || '').split('\n## ')[0];

// These checks pin the guidance and examples. Live agent exercises check what an agent does with them.
function reference(file, lang) {
  const [english, arabic] = read(`references/${file}`).split('\n## In Arabic\n');
  return lang === 'en' ? english : arabic;
}

function referenceGuidance(file, lang) {
  return reference(file, lang).replace(/\s+/g, ' ');
}

function trdTemplate(lang) {
  return reference('trd.md', lang).split('\n```markdown\n')[1].split('\n```')[0];
}

function planStep(plan, number) {
  return plan.split('\n### ').find((step) => step.startsWith(`Step ${number}: `) || step.startsWith(`الخطوة ${number}: `)) || '';
}

test('named speed targets retain their read-back and first usable step check in English and Arabic', () => {
  const cases = [
    { lang: 'en', rules: 'Rules it must follow', speed: 'Speed', defaultTarget: /propose "every page or screen opens in under 2 seconds on an ordinary phone or computer" for the person to confirm in the read-back/,
      conditions: /the flow, when the clock starts, what counts as finished, on which device, and at what load/,
      exampleLine: /flow, start, finish, device and load/,
      check: /in the first step that makes it usable, cite \*\*TRD: Speed\*\*\. Time the flow from the agreed start to finish on the device and under the load named there\. Record the measured time and pass or fail/,
      skip: /Skip the speed check where waiting time is not a concern/,
      tbd: /A speed target or its test conditions\*\* block only a step that needs that speed check/ },
    { lang: 'ar', rules: 'القواعد التي يلتزم بها', speed: 'السرعة', defaultTarget: /فاقترح «تفتح كل صفحة أو شاشة في أقل من ثانيتين على هاتف أو حاسوب عادي» وأكّده مع الشخص عند إعادة عرض الإجابات عليه/,
      conditions: /المسار، ومتى يبدأ القياس، وما الذي يُعدّ اكتمالًا، وعلى أي جهاز، وتحت أي حمل/,
      exampleLine: /المسار، والبداية، والاكتمال، والجهاز، والحمل/,
      check: /في أول خطوة تجعله قابلًا للاستخدام، اذكر \*\*TRD: السرعة\*\*\. قِس الزمن من البداية إلى الاكتمال المتفق عليهما، على الجهاز وتحت الحمل المذكورين هناك\. عند تنفيذ الفحص، سجّل الزمن المقاس ونجاح الفحص أو فشله/,
      skip: /تجاوز فحص السرعة إذا لم يكن الانتظار مهمًا/,
      tbd: /«لم يُحسم بعد» ويعطّل فقط الخطوة التي تحتاج فحص السرعة/ },
  ];
  for (const { lang, rules, speed, defaultTarget, conditions, exampleLine, check, skip, tbd } of cases) {
    const trd = referenceGuidance('trd.md', lang);
    const plan = referenceGuidance('plan.md', lang);
    const fields = section(trdTemplate(lang), rules);
    const speedLine = fields.split('\n').find((line) => line.startsWith(`- **${speed}:**`)) || '';
    assert.match(trd, defaultTarget, `${lang}: confirm the proposed default`);
    assert.match(trd, conditions, `${lang}: name the measurement conditions`);
    assert.match(speedLine, exampleLine, `${lang}: conditions in the Speed line`);
    assert.match(plan, check, `${lang}: repeatable pass or fail check`);
    assert.match(plan, skip, `${lang}: skip when waiting time is not a concern`);
    assert.match(trd, tbd, `${lang}: open speed choices block only the affected step`);
  }
  const plan = example('notes-digest', 'plan.md');
  assert.doesNotMatch(planStep(plan, 1), /TRD: Speed/);
  const fullDigest = planStep(plan, 2);
  assert.match(fullDigest, /^- \*\*Covers:\*\* .*TRD: Speed/m);
  assert.match(fullDigest, /Pass at 30 seconds or less, otherwise fail \(TRD: Speed\)/);
});

test('only a metered action gets a sourced completion estimate with charged retries in English and Arabic', () => {
  const cases = [
    { lang: 'en', heading: 'Running cost', guide: /Count all paid parts and their billed units, including failed attempts and retries that are charged/,
      ceiling: /Keep the per-action estimate and any ceiling the person sets separate from \*\*Each month\*\*\. Use the person's amounts and sources/,
      tbd: /use the existing `TBD` rule above\. Skip this line when no part is charged by use/,
      entry: /one completed action, billed units including charged failures and retries, the person's amount and source, and their ceiling if set/,
      check: /before the step starts paying for it, cite \*\*TRD: Running cost\*\*\. Using the agreed rates, check the cost through completion including charged failures and retries/,
      compare: /Compare it with the estimate and the ceiling if one was set\./ },
    { lang: 'ar', heading: 'تكلفة التشغيل', guide: /احسب كل الأجزاء المدفوعة ووحدات الفوترة حتى اكتمال الإجراء، بما فيها المحاولات الفاشلة وإعادات المحاولة التي تُحتسب في الفاتورة/,
      ceiling: /افصل تقدير تكلفة الإجراء وأي سقف يحدده الشخص عن مجموع \*\*كل شهر\*\*\. استخدم مبالغ الشخص ومصادرها/,
      tbd: /فاتبع قاعدة «لم يُحسم بعد» أعلاه\. تجاوز هذا السطر إذا لم يكن أي جزء مدفوعًا بحسب الاستخدام/,
      entry: /إجراء واحد مكتمل، ووحدات الفوترة بما فيها الفشل وإعادة المحاولة المدفوعان، ومبلغ الشخص ومصدره، وسقفه إن حدده/,
      check: /قبل أن يبدأ الدفع في الخطوة، اذكر \*\*TRD: تكلفة التشغيل\*\*\. تحقّق بالأسعار المتفق عليها من التكلفة حتى اكتمال الإجراء، بما فيها الفشل وإعادة المحاولة المدفوعان/,
      compare: /وقارنها بالتقدير وبالسقف إن حدده الشخص\./ },
  ];
  for (const { lang, heading, guide, ceiling, tbd, entry, check, compare } of cases) {
    const trd = referenceGuidance('trd.md', lang);
    const plan = referenceGuidance('plan.md', lang);
    const costs = section(trdTemplate(lang), heading);
    for (const rule of [guide, ceiling, tbd]) assert.match(trd, rule, lang);
    assert.match(costs, entry, `${lang}: per-action fields stay under Running cost`);
    assert.match(plan, check, `${lang}: check before starting to pay`);
    assert.match(plan, compare, `${lang}: compare the cost against the estimate and any ceiling`);
  }
  const digestPlan = example('notes-digest', 'plan.md');
  const firstPaidStep = planStep(digestPlan, 1);
  assert.match(firstPaidStep, /^- \*\*Status:\*\* not started$/m, 'the settled cost unblocks step 1');
  assert.match(firstPaidStep, /^  - Changed 2026-11-20: waited for the cost of printing one complete digest → not started, because the TRD settled it as 0\.04 USD per completed digest with no billed failures or retries\.$/m);
  assert.match(digestPlan, /^> v4 · Draft$/m);
  assert.ok(digestPlan.includes('v3, approved 2026-11-20'), 'the earlier approval stays in the history');
});

test('release recovery belongs in the TRD and the Plan rehearses the safe path in both languages', () => {
  const cases = [
    { lang: 'en', where: 'Where it lives', label: 'Release recovery', clinic: 'cedar-clinic',
      owner: /Ask the owner once to choose who decides to go back, what signal calls for it, and what to do if the previous release cannot read data saved by the new one/,
      route: /Ask the operator which recovery paths their release channel supports/,
      skip: /Skip this for a tool that stays on the builder's computer\./,
      check: /cites \*\*Release recovery\*\* under \*\*TRD: Where it lives\*\*\. On a safe copy before release/,
      safety: /Try going back only if the previous release can read the new saved data\. If it cannot, try the agreed alternative/,
      tbd: /A release recovery decision\*\* blocks only the affected release step/,
      exampleWait: 'the release recovery decision' },
    { lang: 'ar', where: 'أين يعمل', label: 'التعافي عند الإصدار', clinic: 'cedar-clinic-ar',
      owner: /واسأل المالك مرة واحدة: من يقرر الرجوع، وما الإشارة التي تستدعيه، وماذا يفعل إذا تعذّرت على الإصدار السابق قراءة البيانات التي حفظها الإصدار الجديد/,
      route: /اسأل المشغّل عن طرق التعافي التي تدعمها قناة الإصدار/,
      skip: /تجاوز هذا السطر إذا بقيت الأداة على حاسوب المطوّر\./,
      check: /أشر إلى \*\*التعافي عند الإصدار\*\* تحت \*\*TRD: أين يعمل\*\*\. قبل الإصدار، جرّب التعافي المتفق عليه على نسخة آمنة/,
      safety: /لا تجرّب الرجوع إلا إذا استطاع الإصدار السابق قراءة البيانات الجديدة المحفوظة\. وإن تعذّر ذلك، فجرّب البديل المتفق عليه/,
      tbd: /فاكتب «لم يُحسم بعد» وعطّل خطوة الإصدار المعنية فقط/,
      exampleWait: 'قرار التعافي عند الإصدار' },
  ];
  for (const { lang, where, label, clinic, owner, route, skip, check, safety, tbd, exampleWait } of cases) {
    const trd = referenceGuidance('trd.md', lang);
    const plan = referenceGuidance('plan.md', lang);
    for (const rule of [owner, route, tbd]) assert.match(trd, rule, lang);
    assert.match(trd, skip, `${lang}: skip release recovery for a local tool`);
    for (const rule of [check, safety]) assert.match(plan, rule, lang);
    const location = section(trdTemplate(lang), where);
    assert.ok(location.split('\n').some((line) => line.startsWith('- <') && line.includes(`**${label}:**`)), `${lang}: optional line in the location template`);
    const clinicLocation = section(example(clinic, 'trd.md'), where);
    const tbdPrefix = lang === 'en' ? 'TBD' : 'لم يُحسم بعد';
    assert.ok(clinicLocation.includes(`- ${tbdPrefix}: ${exampleWait}.`), `${lang}: the open decision belongs in the TRD`);
    const release = planStep(example(clinic, 'plan.md'), 10);
    assert.ok(release.includes(`TRD: ${where}`) && release.includes(label) && release.includes(exampleWait), `${lang}: the release step points to the open TRD decision`);
  }
});

test('the tiny offline example gets no per-action cost, recovery decision or additional speed check', () => {
  const trd = example('study-timer', 'trd.md');
  assert.doesNotMatch(section(trd, 'Where it lives'), /Release recovery|TBD/);
  const costs = section(trd, 'Running cost');
  assert.deepStrictEqual(costs.split('\n').filter((line) => line.startsWith('- ')), [
    "- **Each month:** None: nothing is paid for, because it runs on the student's own computer.",
  ]);
  assert.doesNotMatch(example('study-timer', 'plan.md'), /TRD: Speed|TRD: Running cost|Release recovery/);
});
