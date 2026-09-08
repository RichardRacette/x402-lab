import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { decodePaymentRequiredHeader } from "@x402/core/http";
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
export function buyerTraceIntent(plan: BuyerTracePlan, sessionFile: string): PurchaseIntent {
  validatePlan(plan);
  return {
    endpoint: plan.url,
    sourceUrl: createBuyerTracePreflight().x402scan.sourceRepository,
    question: JSON.stringify([QUESTION, plan.method, plan.url, plan.page, plan.pageSize,
      terms(plan.requirement), plan.sourceCommit, plan.observedAt, resolve(sessionFile), "one-call", MAX_ATOMIC.toString()])
  };
}

export interface BuyerTraceDependencies {
  // Trusted components are injected. There is deliberately no default fetch or signer.
  // send must perform exactly one request and honor Request.redirect/signal.
  send: (request: Request) => Promise<Response>;
  createPayment: (requirement: PaymentRequirements) => Promise<string>;
}

export interface BuyerTraceOptions {
  execute?: boolean;
  authorization?: PurchaseAuthorization;
  sessionFile?: string;
  sessionBudgetAtomic?: bigint;
}

/** A one-use reservation is durable before any external dependency is reached.
 * Existing, partial or failed reservations are never automatically released.
 * The session path belongs to the owner control plane, not provider/model data.
 */
async function reserveSession(path: string, audit: object): Promise<void> {
  try {
    const file = await open(path, "wx", 0o600);
    try {
      await file.writeFile(JSON.stringify(audit) + "\n", "utf8");
      await file.sync();
    } finally {
      await file.close();
    }
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
  const intent = buyerTraceIntent(plan, sessionFile);
  assertPurchaseAuthorization(intent, options.authorization);
  const budget = options.sessionBudgetAtomic ?? MAX_ATOMIC;
  const amount = BigInt(plan.requirement.amount);
  if (typeof budget !== "bigint" || budget < amount || budget > MAX_ATOMIC || amount <= 0n || amount > MAX_ATOMIC) {
    throw new BuyerTraceError("BUDGET_REFUSED");
  }
  if (!dependencies) throw new BuyerTraceError("LIVE_COMPONENTS_UNAVAILABLE");
  const reservation = { ...audit, requestFingerprint: options.authorization!.requestFingerprint,
    state: "reserved-no-automatic-retry", reservedAtomic: amount.toString() };
  await reserveSession(sessionFile, reservation);
  try {
    const request = (signature?: string) => new Request(plan.url, {
      method: plan.method, redirect: "error", signal: AbortSignal.timeout(8_000),
      headers: signature ? { "PAYMENT-SIGNATURE": signature } : undefined
    });
    const challengeResponse = await dependencies.send(request());
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
    const signature = await dependencies.createPayment(structuredClone(plan.requirement));
    if (typeof signature !== "string" || !signature || signature.length > 16_384 || /[\r\n]/u.test(signature)) {
      throw new BuyerTraceError("PAYMENT_INVALID");
    }
    const response = await dependencies.send(request(signature));
    if (response.status !== 200 || response.redirected || (response.url && response.url !== plan.url)) {
      throw new BuyerTraceError("FULFILLMENT_REFUSED");
    }
    const body: unknown = await response.json();
    const envelope = body as { data?: unknown[]; pagination?: { page?: number; page_size?: number; has_next_page?: boolean } } | null;
    if (!envelope || !Array.isArray(envelope.data) || envelope.data.length > plan.pageSize ||
        envelope.pagination?.page !== plan.page || envelope.pagination.page_size !== plan.pageSize ||
        typeof envelope.pagination.has_next_page !== "boolean") {
      throw new BuyerTraceError("PAGINATION_DRIFT");
    }
    return {
      mode: "response-received" as const,
      audit: { ...reservation, state: "response-received-settlement-unverified", paymentAttempts: 1 },
      response: transformUntrusted(markUntrusted(null, "web", plan.url), "json-parse", body)
    };
  } catch (error) {
    // Reservation stays burned on every ambiguous transport, signer or response failure.
    if (error instanceof BuyerTraceError) throw error;
    throw new BuyerTraceError("DEPENDENCY_FAILED");
  }
}
