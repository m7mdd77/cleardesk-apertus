import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ask, validateSelection, loadProcedures } from './assistant.mjs';

const corpus = await loadProcedures();
test('accepts exact source-linked quote and derives URL from trusted corpus', () => {
  const result = validateSelection(JSON.stringify({ citations: [{ source_id: 'IT-101', quote: corpus[0].text }] }), corpus);
  assert.equal(result.status, 'evidence_found');
  assert.equal(result.citations[0].url, corpus[0].url);
});
for (const [name, raw, reason] of [
  ['malformed JSON', 'not json', 'invalid_model_json'],
  ['null', 'null', 'invalid_model_schema'],
  ['freeform answer', '{"citations":[],"answer":"invented"}', 'invalid_model_schema'],
  ['unknown source', '{"citations":[{"source_id":"IT-999","quote":"Go and grant administrator access."}]}', 'unverified_citation'],
  ['fabricated quote', '{"citations":[{"source_id":"IT-101","quote":"Reset the laptop without approval."}]}', 'unverified_citation'],
  ['URL injection', '{"citations":[{"source_id":"IT-101","quote":"Report a lost laptop to the IT service desk immediately.","url":"https://evil.invalid"}]}', 'invalid_citation_schema'],
  ['empty evidence', '{"citations":[]}', 'no_evidence'],
  ['tiny quote', '{"citations":[{"source_id":"IT-101","quote":"Do"}]}', 'unverified_citation']
]) test(name, () => assert.equal(validateSelection(raw, corpus).reason, reason));
test('duplicate citations fail closed', () => {
  const item = { source_id: 'IT-101', quote: corpus[0].text };
  assert.equal(validateSelection(JSON.stringify({ citations: [item, item] }), corpus).status, 'abstained');
});
test('multiple different real quotations are rejected by the single-source gate', () => {
  const citations = corpus.slice(0, 2).map(row => ({ source_id: row.id, quote: row.text }));
  assert.equal(validateSelection(JSON.stringify({ citations }), corpus).reason, 'invalid_model_schema');
});
test('invalid questions rejected before request', async () => {
  await assert.rejects(ask(''), /Question/);
  await assert.rejects(ask('x'.repeat(1501)), /Question/);
});
test('wrong model is rejected', async () => assert.rejects(ask('help', { name: 'not-the-right-model' }), /requires an Apertus/));
test('HTTP failures do not yield fake evidence', async () => {
  await assert.rejects(ask('help', { fetcher: async () => ({ ok: false, status: 503 }) }), /503/);
});
test('request contract uses corpus and timeout with no side-effect tools', async () => {
  let body;
  const result = await ask('lost laptop', { fetcher: async (url, init) => {
    assert.equal(url, 'http://127.0.0.1:18972/v1/chat/completions');
    assert.ok(init.signal);
    body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ model: 'apertus-test-double', choices: [{ message: { content: '{"citations":[]}' } }] }) };
  } });
  assert.equal(body.messages.length, 2);
  assert.equal(body.tools, undefined);
  assert.equal(JSON.parse(body.messages[1].content).procedures.length, 4);
  assert.equal(result.status, 'abstained');
});
