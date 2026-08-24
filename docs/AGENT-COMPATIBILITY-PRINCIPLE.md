# Agent Compatibility Principle v0.1

Status: **distribution hypothesis and operating principle**

Adopted: **2026-08-24**

## Core idea

x402-lab is trying to become a path of least resistance for machine buyers.

That means compatibility is part of transaction friction.

The target market is not only agents built today with the newest recommended SDK. A meaningful installed base may consist of long-lived software agents that were deployed against older x402 versions, pinned SDKs, frozen containers, old dependency locks, internal automations, or unattended workflows that continue operating because they still work.

The installed-base hypothesis is:

> **Some economically active agents may remain on x402 V1 or other older client implementations for a long time, even after V2 becomes the current standard.**

This is an important hypothesis, not yet an established fact about market share. x402-lab should test it with real frozen clients rather than assume either that legacy agents are common or that all buyers upgrade promptly.

## Governing compatibility principle

> **AGENTS WELCOME means meeting a reasonable machine buyer where it is, not requiring it to modernize before buying a tiny utility.**

If a capable buyer can understand and purchase x402 services but cannot buy from x402-lab solely because its still-working stack is older, that is transaction friction.

The ideal store behaves like one store with multiple compatible doors, not multiple duplicated products.

```text
modern V2 agent ──────────┐
current Python agent ─────┤
current Go agent ─────────┤
legacy V1 agent ──────────┤
other compatible buyer ───┤
                          ▼
                    x402-lab store
                          │
                          ▼
                  same Evidence Slice
                  same price + contract
```

## Important distinction: implementation language is not the store language

A buyer may be implemented in TypeScript, Python, Go, Rust, or another language. x402-lab does not need a separate store implementation for each programming language.

The compatibility surface is primarily:

1. HTTP behavior
2. x402 wire-protocol version
3. payment challenge shape
4. network and asset identifiers
5. discovery metadata
6. input/output schema
7. error and retry semantics
8. SDK-specific interoperability where a widely used client has practical quirks

Programming language matters only insofar as real client implementations differ in protocol support or behavior.

## Compatibility is part of transaction friction

The product thesis currently treats total transaction cost as more than price. Compatibility adds several explicit friction classes:

- **protocol friction** — can the buyer understand the x402 dialect returned by the seller?
- **discovery friction** — can the buyer find the service using the metadata format it understands?
- **schema friction** — can the buyer understand what to send and what will come back?
- **SDK friction** — does the buyer's actual client library interoperate with the seller without manual adaptation?
- **upgrade friction** — would the buyer need to change dependencies, redeploy, or involve a human before making a trivial purchase?

For a $0.003 utility, requiring an otherwise capable agent to upgrade its stack can cost far more than the product itself.

## The asymmetry to test

Current SDKs may support older protocol versions while older SDKs cannot know about future protocol versions.

Therefore this possibility matters:

```text
new client -> old-compatible seller     may work
old V1-only client -> V2-only seller    may fail
```

The practical question is not merely whether the newest SDK advertises backward compatibility.

The question is:

> **Can a real client frozen at an older version, with no upgrade or helpful modification, discover and purchase from x402-lab today?**

## Discovery and payment are separate compatibility problems

An agent may be capable of paying for a resource when handed the exact endpoint while still being unable to discover or understand that resource through its normal machine-readable discovery mechanisms.

Conversely, a buyer may discover a product but fail when it encounters an unsupported payment challenge.

Every compatibility test should therefore separate at least:

### Can it find the candy?

Discovery compatibility:

- can the agent locate the resource?
- can it infer the method and endpoint?
- can it understand the price?
- can it understand the request schema?
- can it understand the response contract?

### Can it buy the candy?

Payment compatibility:

- can it parse the 402 challenge?
- can it select the intended requirement?
- can it construct the payment?
- can the facilitator verify and settle it?
- can it receive the paid response?

A service that passes only one half of this test still loses that buyer.

## Machine marketing principle

Human marketing and machine merchandising are different surfaces.

A human-friendly shelf label can remain concise:

> FOUND THE PAGE? DON'T READ THE WHOLE THING. URL + question -> relevant evidence. $0.003 USDC. x402. No signup.

The machine-facing shelf should expose the same proposition through the formats real agents consume, such as:

- runtime x402 payment requirements
- Bazaar/discovery metadata
- stable JSON schemas and examples
- OpenAPI when useful
- `.well-known` metadata when supported and useful
- ecosystem discovery surfaces such as x402scan
- explicit version/compatibility information where doing so reduces buyer uncertainty

This is **machine merchandising**: the agent should be able to infer what the product does, what it costs, how to call it, and whether it can pay.

## Desired architecture if legacy compatibility is earned

Do not duplicate Evidence Slice or fork product logic merely to support another protocol version.

Prefer:

```text
                     Evidence Slice
                         $0.003
                           │
               ┌───────────┴───────────┐
               │                       │
        modern frontage          legacy frontage
           x402 V2                   x402 V1
               │                       │
        modern discovery        legacy discovery
               │                       │
               └───────────┬───────────┘
                           ▼
                  same product logic
                  same output contract
```

The exact implementation may instead be a single dual-compatible route if the protocol and middleware support that cleanly. The architecture should be chosen only after interoperability testing.

## Earn compatibility complexity

Do **not** respond to this principle by immediately supporting every historical SDK, chain, language, or protocol variant.

Compatibility earns implementation effort when at least one of the following is true:

- a representative frozen client demonstrably cannot use the store
- ecosystem usage indicates a meaningful installed base
- an external buyer attempts and fails because of compatibility
- a low-cost compatibility surface materially broadens discoverability
- a compatibility change can be made without weakening payment correctness, security, or maintainability

Do not add compatibility layers merely because they are technically possible.

## Compatibility experiment

Before the Purchase Decision Experiment, run a small compatibility matrix against the same Evidence Slice product.

Representative rows should include, where practical:

| Buyer | Client state | Discovery | Parse offer | Pay | Receive result |
|---|---|---:|---:|---:|---:|
| current TypeScript reference client | current / V2-era | ? | ? | ? | ? |
| current Python reference client | current | ? | ? | ? | ? |
| current Go reference client | current | ? | ? | ? | ? |
| frozen legacy TypeScript client | real V1-era version | ? | ? | ? | ? |
| frozen legacy Python client | real V1-era version | ? | ? | ? | ? |
| other historically meaningful legacy client | frozen | ? | ? | ? | ? |
| generic HTTP/OpenAPI consumer | no x402 SDK for discovery step | ? | ? | n/a | n/a |

### Rules for legacy tests

A legacy test is only meaningful if the client is genuinely frozen.

- pin the historical package/version
- use its historical protocol behavior
- do not upgrade dependencies to make the test pass
- do not patch it with knowledge of V2
- do not hand-convert V2 structures into V1 structures unless the experiment is explicitly testing an adapter
- record exact version, runtime, discovery method, challenge observed, and failure point

Treat the legacy agent as software that has been running unattended since deployment.

## Evidence standard

Do not claim that V1 compatibility is commercially necessary until evidence supports it.

Record findings as one of:

- **compatible without changes**
- **discovery incompatible, payment compatible**
- **discovery compatible, payment incompatible**
- **fully incompatible**
- **not representative / test invalid**

For each failure, identify the smallest compatibility surface that would fix it.

Then decide whether the additional door is worth maintaining.

## Success condition

This principle succeeds if x402-lab can answer, with evidence:

> **Which meaningful categories of machine buyers can currently find and buy Evidence Slice, which cannot, why, and what is the smallest justified change that would admit more real buyers?**

The goal is not universal theoretical compatibility.

The goal is to avoid accidentally excluding a meaningful class of already-operating machine customers from a store whose core promise is low-friction purchasing.

## Relationship to the product thesis

This principle extends, rather than replaces, the governing thesis:

> **Reduce transaction friction so aggressively that choosing us becomes cheaper for the agent than thinking about alternatives.**

Protocol upgrades, dependency upgrades, manual integration work, and incompatible discovery formats are all forms of transaction friction.

For x402-lab, "AGENTS WELCOME" should eventually mean more than "latest SDK welcome."
