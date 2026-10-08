import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { verifyModel } from './model-asset.mjs';
import { ask, modelName } from './assistant.mjs';

if (process.env.APERTUS_AUP_APPROVED !== '1') {
  console.error('Blocked: parent must obtain human approval of the Apertus 1.5 AUP before inference. Set APERTUS_AUP_APPROVED=1 only after that approval.');
  process.exitCode = 2;
} else {
  const runtime = new URL('../../local-runtime/', import.meta.url);
  const cpu = process.argv.includes('--cpu');
  const evaluate = process.argv.includes('--evaluate');
  const question = process.argv.slice(2).filter(a => !['--cpu', '--evaluate'].includes(a)).join(' ') || 'My work laptop is missing. What should I do?';
  const baseUrl = 'http://127.0.0.1:18972/v1';
  let server;
  let closed = false;
  let stopped = false;
  const stop = () => { stopped = true; if (server && server.exitCode === null) server.kill(); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  try {
    const asset = await verifyModel(new URL('model.gguf', runtime));
    // Refuse to reuse an unidentified listener as inference evidence.
    await new Promise((resolve, reject) => {
      const probe = createServer();
      probe.once('error', () => reject(new Error('Port 18972 is unavailable; stop its listener or verify it independently.')));
      probe.listen({ port: 18972, host: '127.0.0.1', exclusive: true }, () => probe.close(resolve));
    });
    const executable = new URL('llama/llama-server.exe', runtime);
    server = spawn(fileURLToPath(executable), ['-m', fileURLToPath(new URL('model.gguf', runtime)), '--host', '127.0.0.1', '--port', '18972', '-c', '4096', '-np', '1', '-lv', '4', '-ngl', cpu ? '0' : '99', ...(cpu ? ['--device', 'none', '--no-op-offload', '--no-kv-offload'] : []), '--alias', modelName], {
      cwd: fileURLToPath(new URL('llama/', runtime)), windowsHide: true, stdio: ['ignore', 'inherit', 'inherit']
    });
    let spawnError;
    server.on('error', error => { spawnError = error; });
    server.on('close', () => { closed = true; });
    let ready = false;
    for (let i = 0; i < 180 && !stopped; i++) {
      if (spawnError) throw spawnError;
      if (closed || server.exitCode !== null || server.signalCode !== null) throw new Error(`Model server exited: ${server.exitCode ?? server.signalCode}`);
      try { ready = (await fetch('http://127.0.0.1:18972/health', { signal: AbortSignal.timeout(1000) })).ok; } catch { /* still loading */ }
      if (ready) break;
      await delay(1000);
    }
    if (!ready || stopped) throw new Error('Model server did not become ready or was interrupted');
    if (evaluate) {
      process.env.LLM_BASE_URL = baseUrl;
      process.env.LLM_NAME = modelName;
      delete process.env.LLM_API_KEY;
      process.env.EVALUATION_MODE = cpu ? 'cpu' : 'vulkan';
      await import('./evaluate.mjs');
    } else {
      const result = await ask(question, { baseUrl, name: modelName, apiKey: null });
      const evidence = { generated_at: new Date().toISOString(), backend_requested: cpu ? 'cpu' : 'vulkan', asset, ...result };
      await mkdir(runtime, { recursive: true });
      await writeFile(new URL(`inference-${cpu ? 'cpu' : 'vulkan'}-${Date.now()}.json`, runtime), JSON.stringify(evidence, null, 2));
      console.log(JSON.stringify(evidence, null, 2));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally {
    stop();
    if (server && !closed && server.pid) await Promise.race([new Promise(resolve => server.once('close', resolve)), delay(5000)]);
    process.off('SIGINT', stop);
    process.off('SIGTERM', stop);
  }
}
