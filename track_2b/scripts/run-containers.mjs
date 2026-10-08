import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const prefix = ['compose', '--project-name', 'cleardesk-apertus', '--file', 'compose.yaml'];
const steps = [['build'], ['up', '-d', '--wait', 'model'], ['run', '--rm', '--no-deps', 'assistant']];
if (process.argv.includes('--plan')) {
  console.log(JSON.stringify({ commands: [...steps, ['down']].map(step => ['docker', ...prefix, ...step]), published_ports: [], model_mount: 'read_only' }, null, 2));
} else if (process.env.APERTUS_AUP_APPROVED !== '1') {
  console.error('Blocked: local Apertus AUP approval is required before inference.');
  process.exitCode = 2;
} else {
  const abort = new AbortController();
  const interrupt = () => abort.abort();
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', interrupt);
  function run(step, cleanup = false, raw = false) {
    return new Promise((resolve, reject) => {
      const child = spawn('docker', raw ? step : [...prefix, ...step], { cwd, stdio: 'inherit', windowsHide: true, ...(cleanup ? {} : { signal: abort.signal }) });
      child.once('error', reject);
      child.once('close', (code, signal) => code === 0 ? resolve() : reject(new Error(`Docker ${step[0]} failed (${code ?? signal})`)));
    });
  }
  let created = false;
  try {
    await run(steps[0]);
    created = true;
    await run(steps[1]);
    await run(['inspect', 'cleardesk-apertus-model-1', '--format', '{{json .Mounts}} {{json .NetworkSettings.Ports}}'], false, true);
    await run(['network', 'inspect', 'cleardesk-apertus_inference', '--format', '{{json .Internal}}'], false, true);
    await run(['logs', '--no-color', 'asset-check']);
    await run(['exec', '-T', 'model', 'sh', '-c', 'test -r /models/apertus.gguf && test ! -w /models/apertus.gguf']);
    await run(steps[2]);
    if (process.env.CLEARDESK_EVALUATE === '1') {
      const docs = fileURLToPath(new URL('../docs/', import.meta.url));
      await run(['run', '--rm', '--no-deps', '--volume', `${docs}:/app/docs`, '--entrypoint', 'node', 'assistant', 'src/evaluate.mjs']);
    }
    await run(['logs', '--no-color', '--tail', '20', 'model']);
  } catch (error) {
    console.error(error.message);
    process.exitCode = abort.signal.aborted ? 130 : 1;
  } finally {
    if (created) {
      try { await run(['down'], true); }
      catch (error) { console.error(`Cleanup: ${error.message}`); process.exitCode = 1; }
    }
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', interrupt);
  }
}
