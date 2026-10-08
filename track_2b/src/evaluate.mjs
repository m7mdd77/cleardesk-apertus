import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { ask } from './assistant.mjs';

const cases = JSON.parse(await readFile(new URL('../data/evaluation.json', import.meta.url), 'utf8'));
const results = [];
const mode = process.env.EVALUATION_MODE ?? 'endpoint';
if (!['endpoint', 'cpu', 'vulkan'].includes(mode)) throw new Error('Invalid evaluation mode');
const target = new URL(`../docs/model-evaluation-${mode}-${Date.now()}.json`, import.meta.url);
async function save(complete, error) {
  const report = { generated_at: new Date().toISOString(), synthetic: true, mode, complete, planned_cases: cases.length, cases: results.length, passed: results.filter(r => r.pass).length, ...(error ? { error } : {}), results };
  await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
  await writeFile(target, JSON.stringify(report, null, 2));
  return report;
}
try {
for (const entry of cases) {
  const result = await ask(entry.question);
  const pass = entry.expected === null ? result.reason === 'no_evidence' : result.status === 'evidence_found' && result.citations.some(c => c.source_id === entry.expected && entry.required_quote_parts.every(part => c.quote.includes(part)));
  results.push({ id: entry.id, expected: entry.expected, pass, ...result });
  await save(false);
  console.log(`${entry.id}: ${pass ? 'PASS' : 'FAIL'} (${result.elapsed_ms} ms)`);
}
const report = await save(true);
console.log(`${report.passed}/${report.cases} real model cases passed. Source presence is not semantic entailment proof.`);
process.exitCode = report.passed === report.cases ? 0 : 1;
} catch (error) {
  await save(false, error.message);
  throw error;
}
