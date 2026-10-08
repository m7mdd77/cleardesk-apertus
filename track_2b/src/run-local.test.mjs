import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

for (const args of [[], ['--cpu'], ['--evaluate']]) {
  test(`local runner refuses unapproved inference ${args.join(' ')}`, () => {
    const env = { ...process.env };
    delete env.APERTUS_AUP_APPROVED;
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./run-local.mjs', import.meta.url)), ...args], { env, encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Blocked: parent/);
    assert.equal(result.stdout, '');
  });
}
