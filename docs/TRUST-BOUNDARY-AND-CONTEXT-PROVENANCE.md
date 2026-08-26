# Trust Boundary and Context Provenance V0

Status: security architecture baseline

Applies to: x402-lab shopper, Kiroshi/agent surfaces, future MCP tools, future autonomous buyers, and any component that reads external content and can reach credentials, money, writes, or network egress.

## Governing principle

> Transformation does not create authority.

External information remains untrusted even after it is fetched, decoded, decrypted, parsed, summarized, ranked, embedded, retrieved, rewritten by a model, returned by a tool, or copied through another agent.

A value may change representation without changing who controls it.

This is the core defense against Cryptographic Context Injection (CCI) and the broader class of context-laundering attacks.

## Why this exists

CCI demonstrates a dangerous failure mode in agent harnesses:

1. attacker-controlled content enters as ordinary external data;
2. an agent performs a transformation such as decryption inside a trusted runtime;
3. the transformed output is treated as if the runtime itself authored it;
4. the output is allowed to influence privileged tools or outbound actions.

The security mistake is not "failing to recognize ciphertext." The mistake is losing provenance during transformation.

Trying to block every encoding, cipher, obfuscation, prompt-injection phrase, or future bypass is not a sufficient architecture. x402-lab instead treats authority and data as separate planes.

## Two planes

### Data plane

The data plane contains facts, requests, pages, tool responses, model output, observations, decrypted plaintext, and derived analysis.

Examples:

- a URL supplied to Evidence Slice;
- HTML fetched from the public web;
- a 402 response body;
- marketplace metadata observed by Kiroshi;
- text returned by another agent;
- ciphertext found in a page;
- plaintext produced by decrypting that ciphertext;
- a model summary of the plaintext.

Data can inform a decision. Data cannot grant itself authority.

### Authority plane

The authority plane contains deterministic capabilities that permit privileged actions.

Examples:

- the configured seller allowlist;
- the configured Base Sepolia network;
- the maximum item price;
- the lifetime budget;
- the protected reserve;
- the local purchase lock;
- an explicit owner-issued purchase authorization;
- future human confirmations or pre-approved machine policies.

External content must never be able to alter the authority plane merely by being interpreted.

## Trust invariant: no laundering

For any untrusted value U and any transformation T:

`trust(T(U)) <= trust(U)`

In V0 the implementation is deliberately simpler: untrusted values remain exactly `untrusted` through transformation.

Examples:

`UNTRUSTED_WEB_HTML`
→ parse
`UNTRUSTED_PARSED_TEXT`
→ decrypt
`UNTRUSTED_DECRYPTED_TEXT`
→ summarize
`UNTRUSTED_MODEL_SUMMARY`
→ extract JSON
`UNTRUSTED_STRUCTURED_DATA`

Never:

`UNTRUSTED_CIPHERTEXT`
→ trusted runtime decrypts it
→ `TRUSTED_INSTRUCTION`

## Payment authority rule

> Model-interpreted or externally derived content cannot authorize a payment.

The shopper may use external content as the subject of a purchase, but authorization must come from a separate trusted control path.

V0 implements this by separating the raw shopper gateway from the privileged entrypoint:

`shopper-cli --execute`
→ create owner CLI authorization
→ bind authorization to exact request fingerprint
→ `executeAuthorizedPurchase`
→ verify authorization
→ raw shopper gateway
→ existing deterministic payment policy
→ credential load
→ signing / settlement

The authorization fingerprint is SHA-256 over the exact tuple:

- endpoint
- source URL
- question

If any of those fields change after authorization, execution fails before the raw shopper gateway is reached.

This prevents a downstream model/tool transformation from silently changing what the owner approved.

## Important distinction

The purchase authorization does **not** declare the URL or question trusted.

The URL and question remain data. The authorization says only:

> the owner explicitly approved paying for this exact request tuple through the local execution boundary.

This distinction must remain intact as the system becomes more agentic.

## Existing deterministic payment controls remain mandatory

Context provenance is an additional layer, not a replacement for the shopper gateway's existing controls.

A purchase still must satisfy all applicable deterministic policy checks, including:

- exact allowed endpoint;
- x402 v2 challenge;
- exact payment scheme;
- allowed network;
- allowed seller;
- allowed asset;
- maximum item price;
- initial spend cap;
- lifetime budget;
- protected wallet reserve;
- reservation/reconciliation state;
- purchase lock ownership;
- successful settlement receipt.

No model output may redefine these values at runtime.

## Privileged-action rule

The payment rule generalizes:

> Untrusted or derived-untrusted context may propose a privileged action; it may not authorize one.

Privileged actions include:

- spend money;
- sign transactions;
- expose credentials;
- contact a new network destination;
- push or merge code;
- publish artifacts;
- write outside an approved workspace;
- change an allowlist or budget;
- broaden another agent's permissions.

Future agent features should pass proposals across a deterministic boundary rather than executing them directly from model context.

## Egress rule

An agent that has processed untrusted content should not gain arbitrary network egress merely because the model asks for it.

Future autonomous paths should use destination policy:

- known store endpoint: permitted subject to purchase policy;
- known RPC endpoint: permitted for defined blockchain operations;
- new or attacker-supplied host: deny by default or require explicit authorization;
- URLs constructed from untrusted content: treat as untrusted destinations.

This is especially important for exfiltration chains where malicious context instructs the agent to place private data into a query parameter or callback.

## Credential rule

Untrusted-content processing and secret-bearing execution should be separated where practical.

The current shopper already loads its private key only after non-secret preflight succeeds. Context Provenance V0 adds authorization verification before the privileged shopper path.

The future target is stronger isolation:

1. untrusted-content worker has no wallet credential;
2. worker returns structured proposal plus provenance;
3. policy process validates the proposal;
4. signing process receives only a bounded, approved transaction intent;
5. signing process cannot browse arbitrary content.

## Kiroshi rule

Kiroshi is an observability surface, not an authority source.

Signals from Kiroshi, Buyer Trace, the Observatory, web sensors, or future marketplace sensors may influence what the system investigates. They must not directly:

- raise spend limits;
- authorize purchases;
- add sellers to an allowlist;
- select arbitrary egress destinations;
- grant repository or wallet permissions.

Observation is not authorization.

## Provenance trace requirements

For future agentic execution, retain enough information to reconstruct chains such as:

`external page`
→ `decryption`
→ `model interpretation`
→ `tool proposal`
→ `policy decision`
→ `payment attempt`

At minimum, privileged-action logs should eventually record:

- originating external source(s);
- transformations performed;
- resolved tool arguments;
- policy decision;
- authority/capability used;
- destination;
- amount when financial;
- result/transaction identifier.

Detection should focus on dangerous sequences, not only suspicious strings.

## V0 code controls

Context Provenance V0 adds:

- `src/trust-boundary.ts`
  - marks external values untrusted;
  - propagates untrusted provenance through transformations;
  - fingerprints purchase intents;
  - verifies owner purchase capabilities.

- `src/authorized-shopper.ts`
  - privileged purchase entrypoint;
  - rejects mismatched authorization before raw gateway execution.

- `src/shopper-cli.ts`
  - creates a single-purchase capability only on explicit local `--execute`;
  - routes purchases through the authorized shopper boundary.

- `src/trust-boundary.test.ts`
  - proves decrypted/parsed external data remains untrusted;
  - proves request mutation invalidates authorization;
  - proves mismatched capabilities fail before the raw shopper path;
  - scans application source so ordinary code cannot directly bypass the authorized shopper entrypoint or mint CLI authority.

## V0 limitation

This is a meaningful architecture boundary, but it is not yet cryptographic human attestation.

The owner capability is minted inside the local CLI process when `--execute` is explicitly supplied. A future system in which an autonomous coding agent can freely modify and execute the repository would require a stronger boundary outside that agent's writable trust domain.

Possible future hardening includes:

- separate signer process;
- OS-level credential isolation;
- capability tokens issued by a human-controlled UI/process;
- signed approval records;
- hardware-backed keys;
- policy daemon unreachable from the untrusted-content worker except through a narrow RPC contract.

The V0 rule is therefore:

> Code-path separation now; process/capability separation before autonomous real-money operation.

## Mainnet consequence

No autonomous mainnet buyer should be enabled until context provenance and authority separation survive adversarial testing.

Before autonomous mainnet spend, require at least:

1. untrusted-content quarantine or equivalent process isolation;
2. deterministic egress policy;
3. bounded signer capability;
4. immutable or separately protected spend policy;
5. provenance-aware privileged-action logs;
6. replayable security tests for indirect prompt injection and CCI-style transformation chains;
7. explicit owner approval of the resulting threat model.

## Security maxim

**Data can persuade the model. Data cannot grant the model permission.**
