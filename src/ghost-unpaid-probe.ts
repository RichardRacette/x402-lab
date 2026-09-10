import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { bounded } from "./buyer-trace-adapter.js";

// Public targets from issue #50. This module never imports a signer or reads env/files.
const ORIGIN = "https://ghost-identity.ghost-agent-os.workers.dev";
const BODY = JSON.stringify({ query: "x402 machine commerce", results: 10 });
const MAX_BODY = 262_144;
const MAX_HEADER = 16_384;
export const ghostUnsignedRequests = [
  { method: "GET", url: `${ORIGIN}/openapi.json` },
  { method: "GET", url: `${ORIGIN}/.well-known/x402` },
  { method: "POST", url: `${ORIGIN}/v1/search`, body: BODY }
] as const;

export class GhostProbeError extends Error {
  constructor(readonly code: string) { super(code); }
}

async function readJson(response: Response, signal: AbortSignal) {
  const reader = response.body?.getReader();
  if (!reader) throw new GhostProbeError("BODY_MISSING");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await bounded(reader.read(), signal);
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_BODY) throw new GhostProbeError("BODY_TOO_LARGE");
      chunks.push(part.value);
    }
    const bytes = Buffer.concat(chunks);
    return { json: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown,
      bytes: size, sha256: createHash("sha256").update(bytes).digest("hex") };
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Exactly two metadata GETs and one unsigned POST, sequentially, with no retries.
 * Captures are untrusted public response data for LOCAL review, not publication.
 * A successful capture still requires manual advertised/live metadata comparison.
 */
export async function probeGhostUnpaid(send: (request: Request) => Promise<Response> = fetch) {
  const captures: unknown[] = [];
  const snapshots: { method: string; url: string; status: number; bytes: number; sha256: string }[] = [];
  const checks: Record<string, boolean> = {};
  try {
    for (const target of ghostUnsignedRequests) {
      const signal = AbortSignal.timeout(8_000);
      const request = new Request(target.url, {
        method: target.method, redirect: "error", credentials: "omit", signal,
        headers: { Accept: "application/json", ...(target.method === "POST" ? { "Content-Type": "application/json" } : {}) },
        ...(target.method === "POST" ? { body: target.body } : {})
      });
      const response = await bounded(send(request), signal);
      try {
        if (response.redirected || response.url !== target.url) throw new GhostProbeError("RESPONSE_URL_INVALID");
        if (response.status !== (target.method === "POST" ? 402 : 200)) throw new GhostProbeError("STATUS_UNEXPECTED");
        const header = response.headers.get("PAYMENT-REQUIRED");
        if (target.method === "POST" && (!header || header.length > MAX_HEADER || !/^[A-Za-z0-9+/]+={0,2}$/.test(header))) {
          throw new GhostProbeError("PAYMENT_REQUIRED_INVALID");
        }
        const body = await readJson(response, signal);
        snapshots.push({ method: target.method, url: target.url, status: response.status, bytes: body.bytes, sha256: body.sha256 });
        if (target.method === "GET") {
          captures.push({ url: target.url, body: body.json });
          continue;
        }
        const challenge = decodePaymentRequiredHeader(header!);
        const requirement = challenge.accepts?.[0];
        const bodyChallenge = body.json as typeof challenge | null;
        checks.version = challenge.x402Version === 2;
        checks.resource = challenge.resource?.url === target.url;
        checks.singleOffer = Array.isArray(challenge.accepts) && challenge.accepts.length === 1;
        checks.scheme = requirement?.scheme === "exact";
        checks.network = requirement?.network === "eip155:8453";
        checks.usdc = requirement?.asset?.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
        checks.amount = requirement?.amount === "10000";
        checks.recipientShape = typeof requirement?.payTo === "string" && /^0x[0-9a-fA-F]{40}$/.test(requirement.payTo);
        checks.timeoutShape = Number.isSafeInteger(requirement?.maxTimeoutSeconds) && requirement.maxTimeoutSeconds > 0;
        checks.tokenDomain = requirement?.extra?.name === "USD Coin" && requirement.extra.version === "2";
        checks.headerBodyTerms = bodyChallenge?.x402Version === challenge.x402Version &&
          isDeepStrictEqual(bodyChallenge?.accepts, challenge.accepts) &&
          isDeepStrictEqual(bodyChallenge?.resource, challenge.resource) &&
          isDeepStrictEqual(bodyChallenge?.extensions, challenge.extensions);
        captures.push({ url: target.url, decodedPaymentRequired: challenge, body: body.json });
      } finally { if (response.body && !response.body.locked) void response.body.cancel().catch(() => {}); }
    }
    return {
      report: {
        schema: "ghost-unpaid-observation/v1", observedAt: new Date().toISOString(), sourceTrust: "untrusted",
        status: Object.values(checks).every(Boolean) ? "CAPTURED_REQUIRES_METADATA_REVIEW" : "CHALLENGE_CHECKS_NEED_REVIEW",
        paymentAttempts: 0, signingAttempts: 0, walletLoaded: false,
        requestBody: BODY, limits: { timeoutMs: 8000, bodyBytes: MAX_BODY, paymentHeaderChars: MAX_HEADER, requests: 3 },
        snapshots, checks,
        unverified: ["OpenAPI and well-known terms reconciliation", "recipient ownership", "facilitator settlement", "operator identity", "paid fulfillment", "DSSE receipt verification", "post-payment credit semantics"]
      }, captures
    };
  } catch (error) {
    // Never propagate provider bytes or raw dependency exceptions.
    throw new GhostProbeError(error instanceof GhostProbeError ? error.code : "TRANSPORT_OR_PARSE_FAILED");
  }
}
