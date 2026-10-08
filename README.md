# ClearDesk

A local Apertus 1.5 CLI that selects a single verbatim passage from four
synthetic IT procedures. A deterministic gate checks the source ID and exact
quotation; unsupported questions yield abstention. The application takes no actions.

## Run

Use Docker, Compose and GNU Make. Obtain the exact model described in
[provenance](track_2b/docs/provenance.md) separately; weights are not included.
Set APERTUS_MODEL_PATH to its absolute path. Operators must approve the upstream
Apertus AUP before setting APERTUS_AUP_APPROVED=1. Then run `make run` from this
repository root. No API key or published host port is required.

Set CLEARDESK_EVALUATE=1 for the optional seven-case development evaluation.
Run `make test` for the 22 contract tests. See [run details](track_2b/docs/RUN.md).

## Measured Evidence

Root GNU Make/Docker inference completed twice with exit 0 on the development
workstation. Runtime inspection confirmed a read-only model mount, no published
ports, an internal network and cleanup. Container development cases passed 7/7,
alongside earlier CPU-only and Vulkan 7/7 runs. The failed 5/7 baseline is retained.
These are development fixtures, not held-out accuracy or security certification.

- [Container verification](track_2b/docs/docker-verification.json)
- [Technical report](track_2b/technical_report.md)
- [Three-page PDF report](track_2b/ClearDesk_Report.pdf)
- [Licenses and attribution](LICENSES.md)

Based on the official HackApertus project template; the original Track 2B README
is retained. No real institutional policy, live integration, model weights or
credentials are included. Demo hosting and final contest submission are separate
pending actions, not receipts established by this repository.
