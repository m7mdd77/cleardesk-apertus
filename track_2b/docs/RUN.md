# ClearDesk

Local IT procedure lookup with Apertus 1.5 and checked quotations. All demo records are synthetic and do not represent any institution's policy. This is a new independent Track 2B project, not a reused payment application.

## Run

The user has approved the upstream Apertus 1.5 AUP, including indemnification, for local synthetic inference only. That approval is retained for unchanged local runs. Set APERTUS_AUP_APPROVED=1 within those runs. New operators must obtain their own approval; the flag itself is not legal evidence. Source/report/data publication has separately been approved under the licenses in LICENSES.md. Private data, spending, weight redistribution, third-party demo hosting and final contest acceptance remain outside the approved scope.

On a machine with Docker engine, Compose and GNU Make running, execute `make run` from the project root. Build time needs network access to Ubuntu/Node packages and pinned llama.cpp source; it does not download weights. Set APERTUS_MODEL_PATH to an absolute path to the verified community GGUF on a clean checkout. In this workspace it defaults to ../local-runtime/model.gguf, relative to track_2b. The asset-check container hashes the read-only file before the model starts. The runtime network is internal, with no published ports. CPU inference may take minutes per question; allocate at least 8 GB available RAM. No API account, key or payment is required. Docker and GNU Make were tested here; availability on another machine is an operator prerequisite.

The CLI prints JSON containing the question, status, checked quotations, fixture URLs, model name, raw model output and elapsed milliseconds. `evidence_found` means quotations exist in the supplied corpus, not that semantic correctness is proven. There are no action-taking tools.

For the existing Windows portable runtime, after parent-recorded approval:

```powershell
$env:APERTUS_AUP_APPROVED='1' # only after human approval
node src/run-local.mjs "My work laptop is missing. What should I do?"
node src/run-local.mjs --cpu "My work laptop is missing. What should I do?"
npm test
node src/run-local.mjs --evaluate
node src/run-local.mjs --cpu --evaluate
```

The runner hashes the existing file, refuses an unidentified listener on port 18972, starts the server from its DLL directory on loopback, and stops its own server on completion. It never downloads weights. New smoke evidence uses local-runtime/inference-{cpu,vulkan}-{timestamp}.json; earlier fixed-name evidence is preserved. CPU mode explicitly disables device, operation and KV offload. Retain logs to prove the actual backend.

Use the event-defined variables `LLM_NAME`, `LLM_BASE_URL`, `LLM_API_KEY` for an approved on-premise endpoint. Do not commit keys. Model names are checked for Apertus, but the actual weights/version must be independently verified by the operator; a name is not proof.

Evaluation evidence uses docs/model-evaluation-{endpoint,cpu,vulkan}-{timestamp}.json, saved after each actual case. An inference failure preserves completed cases and marks the run incomplete with an error. Only complete=true with recorded results is completed evaluation. Contract doubles are explicitly identified and separate. No mock fallback is presented as Apertus.

## Submission checklist

- Parent creates the PUBLIC GitHub repo with the organizer's **Use this template** mechanism, retaining track_2b and removing other template tracks in that new repository only.
- Parent confirms public licenses and rights at action time; add required license texts/notices after approval.
- Verify `make run` on a clean checkout with a running Docker engine. A Dockerfile alone is not verification.
- Include ClearDesk_Report.pdf, max six pages, and technical_report.md.
- Record and host a truthful max-two-minute demo of actual inference, not a slide-only concept.
- Dataset URL is optional for this application; corpus/evaluation fixtures stay under 100 MB, labeled synthetic. Any separately submitted dataset uses the organizer's HF template and public dataset licenses.
- Complete actual form at https://hackapertus.ch/online-hack/submissions with final approval and receipt. No receipt means not submitted.

## Latest measured state

October 8 container verification: actual project-root GNU Make run completed twice with exit 0 using Docker server29.6.2 and project-local GNU Make4.4.1. All three images built. Live inspection confirmed the existing model bind was read-only, zero published host ports and Internal=true; the asset-check container verified the exact 5,059,027,136-byte GGUF hash. The runner removed its owned containers/network. Set CLEARDESK_EVALUATE=1 before make run for the optional seven-case evaluation; only its timestamped results are written through a project-docs mount. Actual results:7/7 in model-evaluation-endpoint-1791469094778.json, total request86,238ms. Evidence:docker-verification.json. This is an existing-workstation run, not a clean-machine setup test.

Revised GPU and CPU-only evaluation each passed 7/7: model-evaluation-vulkan-1791385931354.json and model-evaluation-cpu-1791386027334.json. Logs prove 33/33 GPU layers and entirely CPU weights/KV/compute respectively. Baseline 5/7 with irrelevant citations is preserved, as is the older hybrid smoke. These seven cases are development fixtures, not held-out reliability evidence. Root GNU Make test and Linux image tests passed22/22. ClearDesk_Demo.webm is a 70-second playback of actual artifacts, not a live recording; decoded700 frames successfully. It predates the Docker run and is not container footage. Public hosting is not authorized or completed.
