import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyModel } from './model-asset.mjs';
import { readFile } from 'node:fs/promises';

const path = new URL('../data/procedures.json', import.meta.url);
const bytes = await readFile(path);
const expected = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
test('fingerprint verifier hashes an actual local fixture (not a model inference test)', async () => {
  assert.deepEqual(await verifyModel(path, expected), expected);
});
test('incomplete asset rejected', async () => assert.rejects(verifyModel(path, { ...expected, bytes: bytes.length + 1 }), /incomplete/));
test('wrong asset rejected', async () => assert.rejects(verifyModel(path, { ...expected, sha256: '0'.repeat(64) }), /SHA256/));
test('missing asset rejected without download', async () => assert.rejects(verifyModel(new URL('../data/missing.gguf', import.meta.url)), /ENOENT/));
