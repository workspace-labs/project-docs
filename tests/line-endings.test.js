// Run the actual document checks against both checkout styles, independent of this machine's Git settings.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

for (const [name, ending] of [['LF', '\n'], ['CRLF', '\r\n']]) {
  test(`all document checks pass with ${name} references and examples`, () => {
    // Spaces and Arabic also exercise Windows paths without depending on the owner's checkout path.
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'project-docs العربية '));
    try {
      fs.mkdirSync(path.join(work, 'tests'));
      fs.copyFileSync(path.join(__dirname, 'documents.test.js'), path.join(work, 'tests', 'documents.test.js'));
      const skill = path.join(work, 'skills', 'project-docs');
      fs.cpSync(path.join(__dirname, '..', 'skills', 'project-docs'), skill, { recursive: true });
      function convert(folder) {
        for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
          const file = path.join(folder, entry.name);
          if (entry.isDirectory()) convert(file);
          else if (entry.name.endsWith('.md')) {
            const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
            fs.writeFileSync(file, text.replace(/\n/g, ending));
          }
        }
      }
      convert(skill);
      const result = spawnSync(process.execPath, ['--test', 'tests/documents.test.js'], {
        cwd: work, encoding: 'utf8', timeout: 30000,
        // This is an independent test run, not a child managed by the parent Node test runner.
        env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'NODE_TEST_CONTEXT')),
      });
      assert.ifError(result.error);
      assert.strictEqual(result.status, 0, `${name}:\n${result.stdout}\n${result.stderr}`);
      assert.match(result.stdout, /(?:#|ℹ) tests [1-9]\d*\b/);
    } finally {
      // work is the absolute directory returned by mkdtempSync under the system temp directory.
      fs.rmSync(work, { recursive: true, force: true });
    }
  });
}
