# Evidence Slice V0

Status: **selected first product hypothesis**

Adopted: **2026-08-23**

Governing product thesis: [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md)

## One-sentence product

> Give x402-lab a public URL and a question. We return the few passages on that page that actually contain evidence relevant to the question, packaged as clean JSON.

That is the whole V0.

## Why this is the first shelf item

Evidence Slice sits immediately after web search in a common agent workflow:

```text
agent has a question
    ↓
search finds candidate URLs
    ↓
agent needs the parts of one page that matter
    ↓
POST /extract-evidence
    ↓
small structured evidence packet
    ↓
agent continues reasoning
```

The service does not try to replace search, answer the user's question, determine truth, browse multiple sources, or synthesize a report.

It sells one narrow transformation:

**public webpage + question → relevant passages**

## V0 paid endpoint

`POST /extract-evidence`

### Testnet price

`$0.003` USDC on Base Sepolia (`eip155:84532`).

The initial price is intentionally trivial. It is a product-signal price, not a margin-maximizing price.

## Request contract

```json
{
  "url": "https://example.com/article",
  "question": "When did the company announce the factory closure?"
}
```

Both fields are required strings.

V0 accepts exactly one URL and one question per paid call.

## Response contract

```json
{
  "service": "x402-lab/evidence-slice",
  "network": "eip155:84532",
  "price": "$0.003",
  "source": {
    "url": "https://example.com/article",
    "title": "Example article title",
    "retrievedAt": "2026-08-23T22:00:00.000Z",
    "contentHash": "sha256:..."
  },
  "question": "When did the company announce the factory closure?",
  "evidence": [
    {
      "text": "The company announced Thursday that the plant will close...",
      "score": 0.91
    }
  ]
}
```

V0 returns at most **3 passages**.

If no passage clears a minimal relevance threshold, return an empty `evidence` array rather than inventing an answer.

## What counts as a passage

A passage is a compact contiguous block of visible page text suitable for quoting or further machine reasoning.

V0 should favor paragraph-sized blocks rather than isolated keywords or an entire article.

Recommended bound: roughly **80–800 characters per passage** after normalization.

## V0 extraction behavior

Keep this deterministic and dependency-light.

1. Validate the requested URL.
2. Fetch the public page with a short timeout and bounded response size.
3. Accept only `http:` or `https:` resources that resolve to public internet addresses.
4. Accept `text/html` and `text/plain` only.
5. Extract visible text.
6. Remove obvious non-content elements such as scripts, styles, navigation, forms, and repeated whitespace.
7. Preserve useful paragraph boundaries.
8. Tokenize/normalize the question.
9. Score passages using a simple deterministic lexical relevance method.
10. Return the top 0–3 passages in descending score order.
11. Hash the normalized source content with SHA-256.

No model is required for V0.

A simple lexical scorer is acceptable. The first goal is a predictable useful primitive, not semantic-search perfection.

## Safety boundary: public URLs only

URL fetching creates an SSRF risk. This is the one area where V0 is not allowed to be careless.

The implementation must reject:

- non-HTTP(S) schemes
- credentials embedded in URLs
- localhost names
- loopback addresses
- private IPv4 ranges
- link-local IPv4 ranges
- private/link-local/loopback IPv6 ranges
- cloud/container metadata addresses
- redirects to any blocked destination

DNS must be resolved and checked before connecting, and each redirect target must be revalidated.

V0 should also enforce:

- request timeout
- redirect limit
- response byte limit
- allowed content types
- normalized machine-readable error responses

Security checks are part of the product contract because a publicly reachable URL-fetching service cannot safely ship without them.

## Suggested V0 limits

These are implementation defaults, not future product promises:

- URL length: <= 2,048 characters
- question length: <= 1,000 characters
- fetch timeout: ~8 seconds
- redirects: <= 3
- fetched body: <= 1 MiB
- evidence passages: <= 3

If a tighter limit simplifies a safe implementation, prefer the tighter limit.

## Error contract

Errors should be JSON and machine-actionable.

Example:

```json
{
  "error": {
    "code": "UNSUPPORTED_CONTENT_TYPE",
    "message": "Evidence Slice V0 accepts text/html or text/plain sources.",
    "retryable": false
  }
}
```

Initial error families should remain small:

- `INVALID_INPUT`
- `URL_NOT_PUBLIC`
- `FETCH_TIMEOUT`
- `FETCH_FAILED`
- `TOO_MANY_REDIRECTS`
- `SOURCE_TOO_LARGE`
- `UNSUPPORTED_CONTENT_TYPE`
- `NO_READABLE_CONTENT`

Do not create an elaborate error taxonomy until operation demands it.

## Explicit non-goals

V0 does **not**:

- answer the question
- claim that a passage is true
- fact-check claims
- compare multiple URLs
- search the web
- follow links from the supplied page
- render JavaScript-heavy sites in a browser
- bypass paywalls, authentication, robots controls, or access restrictions
- accept uploaded files or PDFs
- summarize the entire page
- use an LLM
- store source content in a database
- maintain user accounts
- issue API keys
- expose an MCP tool
- run on mainnet

If a page cannot be handled cleanly by the simple V0 fetch-and-extract path, fail explicitly.

## Why an agent might buy instead of build

The hypothesis is not that lexical passage ranking is technologically difficult.

The hypothesis is that an agent repeatedly moving through search results may prefer to pay a tiny predictable price for a known URL-to-evidence contract rather than spend time/tokens implementing and debugging page retrieval, cleanup, passage segmentation, ranking, provenance, hashing, and failure handling each time.

x402-lab is competing on **total friction**, not algorithmic novelty.

## Repeat-purchase hypothesis

One research task naturally touches multiple sources.

If Evidence Slice is useful, a single external agent could make repeated purchases within one workflow:

```text
source A → Evidence Slice
source B → Evidence Slice
source C → Evidence Slice
```

That makes the project's primary early metric — repeat autonomous purchase — observable quickly.

## Falsification conditions

Treat the hypothesis as weak or wrong if, after public testnet exposure:

- external agents can integrate but do not buy it,
- buyers consistently use it once but do not repeat,
- the output is too weak compared with local agent reasoning,
- public-page fetching failures dominate useful calls,
- buyers clearly prefer raw page extraction over question-targeted passages,
- or the service requires enough model/infrastructure complexity that the tiny-price advantage disappears.

Do not rescue the hypothesis indefinitely with features.

## Definition of done for local V0

Evidence Slice V0 is locally complete when:

- `POST /extract-evidence` is protected by x402 on Base Sepolia
- price is `$0.003`
- unpaid call returns a valid `402`
- paid buyer call settles and returns `200`
- one public HTML page produces 1–3 sensible passages
- one irrelevant question can produce an empty evidence array
- blocked/private URL cases are tested
- response-size/content-type/timeout boundaries are tested where practical
- existing `/analyze-job` behavior remains intact
- no new model, database, authentication system, MCP surface, mainnet setting, or deployment target is added

Then and only then move to a public Base Sepolia deployment.
