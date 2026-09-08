import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import type { PaymentRequirements } from "@x402/core/types";
import { createBuyerTracePreflight } from "./buyer-trace-preflight.js";
import {
  assertPurchaseAuthorization, markUntrusted, transformUntrusted,
  type PurchaseAuthorization, type PurchaseIntent
} from "./trust-boundary.js";

const MAX_ATOMIC = 10_000n;
const QUESTION = "Is recent People Data Labs activity dominated by one or a few buyers?";

export interface BuyerTracePlan {
  method: "GET";
  url: string;
  page: 0;
  pageSize: number;
  requirement: PaymentRequirements;
  sourceCommit: string;
  observedAt: string;
}

export class BuyerTraceError extends Error {
  constructor(readonly code: string) {
    // Never propagate provider errors, payloads, wallet output or credentials.
    super(`Buyer Trace refused: ${code}`);
    this.name = "BuyerTraceError";
  }
}

/** Historical preflight is proposal data, not a current quote or authority. */
export function createBuyerTracePlan(pageSize = 100): BuyerTracePlan {
  const preflight = createBuyerTracePreflight();
  const target = preflight.targets.find(item => item.id === "people-data-labs")!;
  const payment = preflight.x402scan.paymentRequirement;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > preflight.x402scan.pagination.maximumPageSize) {
    throw new BuyerTraceError("PAGINATION_INVALID");
  }
  const url = new URL(target.proposedRequest.url);
  url.searchParams.set("page_size", String(pageSize));
  return {
    method: target.proposedRequest.method, url: url.href, page: 0, pageSize,
    sourceCommit: preflight.x402scan.sourceCommit,
    observedAt: preflight.x402scan.challengeObservedAt,
    requirement: {
      scheme: payment.scheme, network: payment.network, amount: payment.amountAtomic,
      asset: payment.asset, payTo: payment.payTo, maxTimeoutSeconds: payment.maxTimeoutSeconds,
      extra: { name: payment.assetName, version: payment.assetVersion }
    }
  };
}

function terms(requirement: PaymentRequirements): unknown[] {
  return [requirement.scheme, requirement.network, requirement.asset, requirement.payTo,
    requirement.amount, requirement.maxTimeoutSeconds, requirement.extra?.name, requirement.extra?.version];
}

function validatePlan(plan: BuyerTracePlan): void {
  const expected = createBuyerTracePlan(plan.pageSize);
  if (plan.method !== expected.method || plan.url !== expected.url || plan.page !== 0 ||
      plan.sourceCommit !== expected.sourceCommit || plan.observedAt !== expected.observedAt ||
      JSON.stringify(terms(plan.requirement)) !== JSON.stringify(terms(expected.requirement))) {
    throw new BuyerTraceError("PREFLIGHT_DRIFT");
  }
}

/** Bind the existing owner capability to request, payment, pagination and session. */
export function buyerTraceIntent(plan: BuyerTracePlan, sessionFile: string, expiresAt?: number, walletAddress?: string): PurchaseIntent {
  validatePlan(plan);
  return {
    endpoint: plan.url,
    sourceUrl: createBuyerTracePreflight().x402scan.sourceRepository,
    question: JSON.stringify([QUESTION, plan.method, plan.url, plan.page, plan.pageSize,
      terms(plan.requirement), plan.sourceCommit, plan.observedAt, resolve(sessionFile), "one-call", MAX_ATOMIC.toString(), expiresAt, walletAddress])
  };
}

export interface BuyerTraceDependencies {
  // Trusted components are injected. There is deliberately no default fetch or signer.
  // send must perform exactly one request and honor Request.redirect/signal.
  send: (request: Request) => Promise<Response>;
  createPayment: (requirement: PaymentRequirements, signal: AbortSignal) => Promise<string>;
}

export interface BuyerTraceOptions {
  execute?: boolean;
  expiresAt?: number;
  walletAddress?: string;
  requestTimeoutMs?: number;
  authorization?: PurchaseAuthorization;
  sessionFile?: string;
  sessionBudgetAtomic?: bigint;
}

/** The pinned SDK authorizes maxTimeoutSeconds from signing time. Leave time
 * for the bounded handshake before asking the owner or burning a reservation. */
export function assertApprovalWindow(plan: BuyerTracePlan, expiresAt: number | undefined, handshakeMs = 0): void {
  const now = Date.now();
  if (!Number.isSafeInteger(expiresAt) || expiresAt! <= now || expiresAt! > now + 900_000) {
    throw new BuyerTraceError("APPROVAL_EXPIRED_OR_INVALID");
  }
  if (handshakeMs && expiresAt! - now < plan.requirement.maxTimeoutSeconds * 1000 + handshakeMs) {
    throw new BuyerTraceError("APPROVAL_WINDOW_TOO_SHORT");
  }
}

/** A one-use reservation is durable before any external dependency is reached.
 * Existing, partial or failed reservations are never automatically released.
 * The session path belongs to the owner control plane, not provider/model data.
 */
async function reserveSession(path: string, audit: object) {
  try {
    const file = await open(path, "wx", 0o600);
    try {
      await file.writeFile(JSON.stringify(audit) + "\n", "utf8");
      await file.sync();
    } catch (error) {
      await file.close();
      throw error;
    }
    return file;
  } catch {
    throw new BuyerTraceError("SESSION_REFUSED");
  }
}

/** One challenge request and at most one signed request; no automatic retries. */
export async function runBuyerTrace(
  proposed: BuyerTracePlan = createBuyerTracePlan(),
  options: BuyerTraceOptions = {},
  dependencies?: BuyerTraceDependencies
) {
  // Copy before the first await so caller mutation cannot alter an approved action.
  const submitted = structuredClone(proposed);
  validatePlan(submitted);
  // Reconstruct from preflight, discarding every unapproved caller-supplied field.
  const plan = createBuyerTracePlan(submitted.pageSize);
  const audit = {
    schema: "buyer-trace-audit/v1", target: "people-data-labs",
    method: plan.method, url: plan.url, network: plan.requirement.network,
    asset: plan.requirement.asset, recipient: plan.requirement.payTo,
    amountAtomic: plan.requirement.amount, page: plan.page, pageSize: plan.pageSize,
    quoteObservedAt: plan.observedAt, sourceCommit: plan.sourceCommit,
    sourceTrust: "untrusted" as const, maximumPaidCalls: 1
  };
  if (options.execute === undefined || options.execute === false) {
    return { mode: "dry-run" as const, audit: { ...audit, authorizedSpendUsd: 0, paymentAttempts: 0 } };
  }
  if (options.execute !== true) throw new BuyerTraceError("EXECUTION_ACTION_INVALID");
  if (!options.sessionFile) throw new BuyerTraceError("SESSION_REQUIRED");
  const sessionFile = resolve(options.sessionFile);
  const expiresAt = options.expiresAt;
  const timeoutMs = options.requestTimeoutMs ?? 8_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 8_000) throw new BuyerTraceError("TIMEOUT_INVALID");
  const intent = buyerTraceIntent(plan, sessionFile, expiresAt, options.walletAddress);
  const assertApproved = () => {
    assertPurchaseAuthorization(intent, options.authorization);
    assertApprovalWindow(plan, expiresAt);
  };
  assertApproved();
  assertApprovalWindow(plan, expiresAt, 2 * timeoutMs);
  const budget = options.sessionBudgetAtomic ?? MAX_ATOMIC;
  const amount = BigInt(plan.requirement.amount);
  if (typeof budget !== "bigint" || budget < amount || budget > MAX_ATOMIC || amount <= 0n || amount > MAX_ATOMIC) {
    throw new BuyerTraceError("BUDGET_REFUSED");
  }
  if (!dependencies) throw new BuyerTraceError("LIVE_COMPONENTS_UNAVAILABLE");
  const reservation = { ...audit, requestFingerprint: options.authorization!.requestFingerprint,
    state: "reserved-no-automatic-retry", reservedAtomic: amount.toString() };
  const journal = await reserveSession(sessionFile, reservation);
  let paymentAttempts = 0;
  let state = "reserved-unsigned";
  let settlement: "reported" | "failed" | "unknown" = "unknown";
  let received = false;
  const record = async (next: string) => {
    state = next;
    await journal.writeFile(JSON.stringify({state, settlement, paymentAttempts})+"\n", "utf8");
    await journal.sync();
  };
  try {
    const request = (signature?: string) => new Request(plan.url, {
      method: plan.method, redirect: "error", signal: AbortSignal.timeout(timeoutMs),
      headers: signature ? { "PAYMENT-SIGNATURE": signature } : undefined
    });
    const challengeRequest = request();
    const challengeResponse = await bounded(dependencies.send(challengeRequest), challengeRequest.signal);
    if (challengeResponse.status !== 402 || challengeResponse.redirected ||
        (challengeResponse.url && challengeResponse.url !== plan.url)) {
      throw new BuyerTraceError("CHALLENGE_RESPONSE_INVALID");
    }
    const header = challengeResponse.headers.get("PAYMENT-REQUIRED");
    if (!header || header.length > 16_384) throw new BuyerTraceError("CHALLENGE_INVALID");
    const challenge = decodePaymentRequiredHeader(header);
    if (challenge.x402Version !== 2 || challenge.resource?.url !== plan.url ||
        !Array.isArray(challenge.accepts) || challenge.accepts.length !== 1 ||
        !challenge.accepts[0] ||
        JSON.stringify(terms(challenge.accepts[0])) !== JSON.stringify(terms(plan.requirement)) ||
        Object.keys(challenge.accepts[0].extra ?? {}).sort().join(",") !== "name,version" ||
        (challenge.extensions && Object.keys(challenge.extensions).length > 0)) {
      throw new BuyerTraceError("CHALLENGE_DRIFT");
    }
    // Pass only the reviewed terms, never arbitrary challenge metadata, to the wallet.
    if (challengeResponse.body) await bounded(challengeResponse.body.cancel(), challengeRequest.signal);
    assertApproved();
    assertApprovalWindow(plan, expiresAt, timeoutMs);
    // Persist before signing: crashes here require reconciliation, never retry.
    paymentAttempts = 1;
    await record("signing-outcome-unknown");
    assertApproved();
    const signingDeadline = AbortSignal.timeout(timeoutMs);
    const signature = await bounded(dependencies.createPayment(structuredClone(plan.requirement), signingDeadline), signingDeadline);
    if (typeof signature !== "string" || !signature || signature.length > 16_384 || /[\r\n]/u.test(signature)) {
      throw new BuyerTraceError("PAYMENT_INVALID");
    }
    assertApproved();
    await record("sending-outcome-unknown");
    assertApproved();
    const paidRequest = request(signature);
    const response = await bounded(dependencies.send(paidRequest), paidRequest.signal);
    if (response.status !== 200 || response.redirected || (response.url && response.url !== plan.url)) {
      throw new BuyerTraceError("FULFILLMENT_REFUSED");
    }
    settlement = settlementState(response, plan.requirement);
    received = true;
    await record("receipt-received");
    const body: unknown = await boundedJson(response, paidRequest.signal);
    const envelope = body as { data?: unknown[]; pagination?: { page?: number; page_size?: number; has_next_page?: boolean } } | null;
    if (!envelope || !Array.isArray(envelope.data) || envelope.data.length > plan.pageSize ||
        envelope.pagination?.page !== plan.page || envelope.pagination.page_size !== plan.pageSize ||
        typeof envelope.pagination.has_next_page !== "boolean") {
      throw new BuyerTraceError("PAGINATION_DRIFT");
    }
    await record("response-received");
    return {
      mode: "response-received" as const,
      audit: { ...reservation, state, settlement, paymentAttempts: 1 },
      response: transformUntrusted(markUntrusted(null, "web", plan.url), "json-parse", body)
    };
  } catch (error) {
    // Reservation stays burned on every ambiguous transport, signer or response failure.
    try { await record(received ? "fulfillment-failed" : paymentAttempts ? "outcome-unknown" : "failed-unsigned"); } catch { /* marker still blocks reuse */ }
    if (error instanceof BuyerTraceError) throw error;
    throw new BuyerTraceError("DEPENDENCY_FAILED");
  } finally { await journal.close(); }
}

/** Limit headers-to-body time as well as fetch time; never print provider bytes. */
export async function bounded<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new BuyerTraceError("TRANSPORT_TIMEOUT");
  let abort: () => void = () => {};
  const deadline = new Promise<never>((_, reject) => {
    abort = () => reject(new BuyerTraceError("TRANSPORT_TIMEOUT"));
    signal.addEventListener("abort", abort, {once:true});
  });
  try { return await Promise.race([operation, deadline]); }
  finally { signal.removeEventListener("abort", abort); }
}
async function boundedJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new BuyerTraceError("BODY_INVALID");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const {done,value} = await bounded(reader.read(), signal);
      if (done) break;
      size += value.byteLength;
      if (size > 1_048_576) throw new BuyerTraceError("BODY_TOO_LARGE");
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { void reader.cancel().catch(()=>{}); reader.releaseLock(); }
}
function settlementState(response: Response, requirement: PaymentRequirements): "reported" | "failed" | "unknown" {
  const header = response.headers.get("PAYMENT-RESPONSE");
  if (!header || header.length > 16_384) return "unknown";
  try {
    const receipt = decodePaymentResponseHeader(header);
    if (receipt.network !== requirement.network || typeof receipt.success !== "boolean" ||
        (receipt.amount !== undefined && receipt.amount !== requirement.amount)) return "unknown";
    if (!receipt.success) return "failed";
    if (!/^0x[0-9a-fA-F]{64}$/.test(receipt.transaction)) return "unknown";
    // A server report is never independent on-chain confirmation.
    return "reported";
  } catch { return "unknown"; }
}
