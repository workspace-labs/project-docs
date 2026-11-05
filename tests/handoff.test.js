// Package-integrity checks, not a simulation of an agent following prose.
// Live document/build behavior is covered separately by behavioral-cases.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'skills', 'project-docs');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const files = ['SKILL.md', ...fs.readdirSync(path.join(root, 'references'))
  .filter((file) => file.endsWith('.md')).map((file) => `references/${file}`)];
const source = new Map(files.map((file) => [file, read(file)]));

function referenceGraph(documents) {
  const seen = new Set();
  const edges = new Map();
  const problems = [];
  function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const links = [...documents.get(file).matchAll(/\]\(([^)]+\.md)(?:#[^)]*)?\)/g)]
      .map((match) => match[1]).filter((link) => !/^[a-z]+:\/\//i.test(link));
    const targets = links.map((link) => path.posix.normalize(path.posix.join(path.posix.dirname(file), link)));
    edges.set(file, targets);
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      if (path.posix.isAbsolute(links[i]) || target.startsWith('../')) {
        problems.push(`${file}: reference leaves the installed skill: ${links[i]}`);
      } else if (!documents.has(target)) {
        problems.push(`${file}: missing packaged reference: ${target}`);
      } else visit(target);
    }
  }
  visit('SKILL.md');
  return { seen, edges, problems };
}

test('the installed entrypoint and Plan reach the handoff, and all document references stay in the bundle', () => {
  const graph = referenceGraph(source);
  assert.deepEqual(graph.problems, []);
  assert.ok(graph.edges.get('SKILL.md').includes('references/engineering-handoff.md'));
  assert.ok(graph.edges.get('references/plan.md').includes('references/engineering-handoff.md'));
  assert.ok(graph.edges.get('references/engineering-handoff.md').includes('references/plan.md'));
  assert.deepEqual([...graph.seen].sort(), [...source.keys()].sort(), 'no unreachable instruction reference');
});

test('the reference check catches a missing handoff instead of silently skipping it', () => {
  const missing = new Map(source);
  missing.delete('references/engineering-handoff.md');
  const graph = referenceGraph(missing);
  assert.ok(graph.problems.some((problem) => problem.includes('missing packaged reference: references/engineering-handoff.md')));
});

test('the reference check rejects dependencies outside the installed package, including absolute paths', () => {
  for (const target of ['../../other-skill/SKILL.md', '/other-skill/SKILL.md']) {
    const escaped = new Map(source);
    escaped.set('references/engineering-handoff.md', `[Required partner](${target})`);
    assert.ok(referenceGraph(escaped).problems.some((problem) => problem.includes('reference leaves the installed skill')),
      `must reject ${target}`);
  }
});
