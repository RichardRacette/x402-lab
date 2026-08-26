import { createHash } from "node:crypto";

/**
 * Context provenance primitives for x402-lab.
 *
 * Security invariant: transformations never upgrade attacker-controlled data
 * into authority. Fetched, decoded, decrypted, parsed, summarized, ranked, or
 * model-produced derivatives of untrusted external content remain untrusted.
 */
export type UntrustedOrigin =
  | "web"
  | "tool"
  | "model"
  | "peer-agent"
  | "unknown-external";

export interface UntrustedValue<T> {
  trust: "untrusted";
  origin: UntrustedOrigin;
  source: string;
  transformations: string[];
  value: T;
}

export function markUntrusted<T>(
  value: T,
  origin: UntrustedOrigin,
  source: string
): UntrustedValue<T> {
  return {
    trust: "untrusted",
    origin,
    source,
    transformations: [],
    value
  };
}

export function transformUntrusted<T, U>(
  parent: UntrustedValue<T>,
  transformation: string,
  value: U
): UntrustedValue<U> {
  if (!transformation.trim()) {
    throw new ContextTrustError(
      "PROVENANCE_INVALID",
      "Untrusted transformations must be named for auditability."
    );
  }

  return {
    trust: "untrusted",
    origin: parent.origin,
    source: parent.source,
    transformations: [...parent.transformations, transformation.trim()],
    value
  };
}

export interface PurchaseIntent {
  endpoint: string;
  sourceUrl: string;
  question: string;
}

const OWNER_CLI_CAPABILITY = Symbol("x402-owner-cli-purchase-capability");

/**
 * V0 purchase capability.
 *
 * The opaque symbol cannot be reconstructed from JSON, model output, tool
 * output, decrypted plaintext, or other external data. Only the explicit
 * local minting path can obtain the in-process capability.
 *
 * This is not a statement that sourceUrl/question are trusted; they remain
 * data. It states that the owner explicitly authorized paying for this exact
 * request tuple.
 */
export interface PurchaseAuthorizationV1 {
  version: 1;
  authority: "owner-cli";
  scope: "single-purchase";
  approvalSource: "explicit-local-cli-execute";
  requestFingerprint: string;
  readonly capability: typeof OWNER_CLI_CAPABILITY;
}

export type PurchaseAuthorization = PurchaseAuthorizationV1;

export type ContextTrustErrorCode =
  | "AUTHORIZATION_INVALID"
  | "AUTHORIZATION_MISMATCH"
  | "PROVENANCE_INVALID";

export class ContextTrustError extends Error {
  readonly code: ContextTrustErrorCode;

  constructor(code: ContextTrustErrorCode, message: string) {
    super(message);
    this.name = "ContextTrustError";
    this.code = code;
  }
}

function canonicalPurchaseIntent(intent: PurchaseIntent): string {
  return JSON.stringify([
    intent.endpoint,
    intent.sourceUrl,
    intent.question
  ]);
}

export function fingerprintPurchaseIntent(intent: PurchaseIntent): string {
  const digest = createHash("sha256")
    .update(canonicalPurchaseIntent(intent), "utf8")
    .digest("hex");
  return `sha256:${digest}`;
}

/**
 * Privileged V0 mint. Application-source tests restrict this function to the
 * explicit local shopper CLI. Future autonomous/mainnet use must move minting
 * outside the untrusted agent's writable/executable trust domain.
 */
export function mintOwnerCliPurchaseAuthorization(
  intent: PurchaseIntent
): PurchaseAuthorization {
  return {
    version: 1,
    authority: "owner-cli",
    scope: "single-purchase",
    approvalSource: "explicit-local-cli-execute",
    requestFingerprint: fingerprintPurchaseIntent(intent),
    capability: OWNER_CLI_CAPABILITY
  };
}

export function assertPurchaseAuthorization(
  intent: PurchaseIntent,
  authorization: PurchaseAuthorization | undefined
): void {
  if (
    !authorization ||
    authorization.version !== 1 ||
    authorization.authority !== "owner-cli" ||
    authorization.scope !== "single-purchase" ||
    authorization.approvalSource !== "explicit-local-cli-execute" ||
    authorization.capability !== OWNER_CLI_CAPABILITY ||
    !/^sha256:[a-f0-9]{64}$/.test(authorization.requestFingerprint)
  ) {
    throw new ContextTrustError(
      "AUTHORIZATION_INVALID",
      "Purchase authorization is missing, malformed, forged, or not owner-issued."
    );
  }

  const expected = fingerprintPurchaseIntent(intent);
  if (authorization.requestFingerprint !== expected) {
    throw new ContextTrustError(
      "AUTHORIZATION_MISMATCH",
      "Purchase authorization does not match the exact request being executed."
    );
  }
}
