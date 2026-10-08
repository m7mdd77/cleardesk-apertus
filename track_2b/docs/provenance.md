# Provenance and boundaries

New independent project started 2026-10-07 during Hack Apertus. No PayPal mission files or previous application source copied. Coding assistance: Codex; disclose this in the final report. AI coding assistants are explicitly allowed by https://hackapertus.ch/faq.

All four procedures and seven evaluation questions are synthetic, created for this project; not Bahrain Polytechnic policies. example.invalid URLs are intentionally non-live fixture references. Source links prove provenance inside the supplied corpus, not real institutional policy.

Inference candidate: Colby/apertus-v1.5-8b-text-Q4_K_M-GGUF, revision 248ec68a63e219e3f061e4c946fc8a20d63b9975. Derived from Andreas Martin's text-only Apertus 1.5 conversion, itself derived from swiss-ai/Apertus-v1.5-8B. Conversion removes multimodal components and adjusts special-token head rows; no equivalence to official multimodal behavior or logit parity is claimed. Apache-2.0 upstream notices and Apertus AUP apply. Weights are not republished here.

Runtime: official ggml-org/llama.cpp b11459, reported commit f498f864f. Portable runtime and model are kept outside submitted track_2b source. llama.cpp is MIT licensed. Model and runtime are separate dependencies.

Pinned model file: apertus-v1.5-8b-text-q4_k_m.gguf, size 5,059,027,136 bytes and SHA256 a037df8d87ff6caacee794ee85f55342f2152e0d359b7389033300c3bee5f299 from the HF tree API's LFS metadata. The existing partial file was resumed, not duplicated; PowerShell Get-FileHash verified this hash on October 7. Docker's separate asset-check service and the local runner verify it before server startup. Weights are mounted read-only, not downloaded into or redistributed with the container image.

Rights gate discovered on October 7: the upstream Apertus 1.5 AUP (July 14, 2026) includes indemnification for use and express assent upon redistribution. The user explicitly approved it for local synthetic inference, not redistribution. No acceptance was inferred from the download. APERTUS_AUP_APPROVED is an interlock, not a license receipt. See local-runtime/USAGE_POLICY.pdf and https://github.com/swiss-ai/apertus-legal/blob/main/apertus_1.5/USAGE_POLICY.pdf.

Output gate checks exact quotation and trusted IDs; it cannot prove that a retrieved passage is relevant, complete, current, or semantically entails an answer. The application emits no freeform model advice and takes no external action. Prompt injection resistance is evaluated on a small synthetic set, not certified.

The author explicitly confirmed rights and approved public source/report/data licensing: Apache-2.0 code, CC-BY-4.0 report and non-code documentation/evidence, CDLA-Permissive-2.0 synthetic data. Full license texts and attribution are in LICENSE, LICENSES.md, NOTICE and licenses/. The upstream template README and license are retained. Final contest warranties and demo-hosting terms remain separate and unaccepted.

Latest evidence: revised seven-case GPU, CPU-only and Docker evaluations completed successfully. Root GNU Make/Docker inference succeeded twice, with live read-only/no-port/internal-network checks and cleanup recorded in docker-verification.json. The local demo is clearly labeled playback from earlier actual JSON artifacts, not a staged live session, and is excluded from this source/report/data packet. Publication approval does not authorize weight redistribution, private data, spending, third-party demo hosting or final contest acceptance. Do not re-request unchanged local AUP approval.
