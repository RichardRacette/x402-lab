# x402 agent-behavior lab

This lab presents synthetic x402 discovery and payment metadata to a local,
tool-free language model. It never supplies a wallet, signer, credential, RPC
endpoint, purchase tool, or payment capability.

Run from the repository root after starting local Ollama:

```powershell
node experiments/agent-behavior-lab/run.mjs qwen3:8b 2 experiments/agent-behavior-lab/outputs/2026-08-26-qwen3-8b.jsonl
```

The runner refuses to overwrite an existing output file. Each JSONL file starts
with a run record, contains one response record per scenario/repeat, and ends
with a summary record. `responseText` preserves the model's raw answer;
`parsedResponse` is populated only when that answer is valid JSON. Schema v2
also records the exact input specimen, scenario-file hash, Ollama completion
flag, transport status, and JSON validity separately. The runner exits nonzero
for an incomplete or invalid model response even when the HTTP call succeeded.

The scenario `expected` fields are a scoring rubric, not instructions sent to
the model. All addresses, transaction IDs, headers, receipts, and approvals are
synthetic fixtures.
