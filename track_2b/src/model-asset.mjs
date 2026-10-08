import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const fingerprint = {
  bytes: 5059027136,
  sha256: 'a037df8d87ff6caacee794ee85f55342f2152e0d359b7389033300c3bee5f299'
};

export async function verifyModel(path, expected = fingerprint) {
  const info = await stat(path);
  if (!info.isFile() || info.size !== expected.bytes) throw new Error(`Model is incomplete or wrong: ${info.size} bytes, expected ${expected.bytes}`);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  const sha256 = hash.digest('hex');
  if (sha256 !== expected.sha256) throw new Error('Model SHA256 mismatch');
  return { bytes: info.size, sha256 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { console.log(JSON.stringify(await verifyModel(process.argv[2] ?? '/models/apertus.gguf'))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
