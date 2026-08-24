import { randomUUID } from "node:crypto";
import { open, readFile, rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import {
  wrapFetchWithPayment,
  x402Client,
  x402HTTPClient
} from "@x402/fetch";
import type {
  PaymentRequired,
  PaymentRequirements
} from "@x402/core/types";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const SHOPPER_ADDRESS = "0x3597A007dfCe9573C6a1fc85f8BB04f7B88f17c5";
const ALLOWED_ENDPOINT =
  "https://x402-lab-production.up.railway.app/extract-evidence";
const ALLOWED_NETWORK = "eip155:84532" as const;
const ALLOWED_SELLER = "0x36a4C8E542055c409bc9a020e7F1cf1F6E988732";
const ALLOWED_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const DEFAULT_RPC_URL = "https://sepolia.base.org";

const BALANCE_OF_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  }
] as const;

export type ShopperGatewayErrorCode =
  | "CHALLENGE_INVALID"
  | "CONFIG_INVALID"
  | "LEDGER_INVALID"
  | "LOCK_RECOVERY_REFUSED"
  | "PAYMENT_FAILED"
  | "POLICY_DENIED"
  | "PURCHASE_LOCKED"
  | "RECONCILIATION_REQUIRED";

export class ShopperGatewayError extends Error {
  readonly code: ShopperGatewayErrorCode;

  constructor(code: ShopperGatewayErrorCode, message: string) {
    super(message);
    this.name = "ShopperGatewayError";
    this.code = code;
  }
}

export interface ShopperConfig {
  shopper: string;
  allowedEndpoint: string;
  network: typeof ALLOWED_NETWORK;
  seller: string;
  asset: string;
  maxItemPriceAtomic: bigint;
  lifetimeBudgetAtomic: bigint;
  initialSpendCapAtomic: bigint;
  protectedReserveAtomic: bigint;
  ledgerPath: string;
  lockPath: string;
  shopperEnvPath: string;
  rpcUrl: string;
}

export interface ShopperRequest {
  endpoint: string;
  sourceUrl: string;
  question: string;
}

export interface SettledPurchase {
  transaction: string;
  amountAtomic: string;
  status: "settled";
  endpoint: string;
  reservationId?: string;
  sourceUrl?: string;
  question?: string;
  settledAt?: string;
}

export interface PurchaseReservation {
  id: string;
  amountAtomic: string;
  endpoint: string;
  sourceUrl: string;
  question: string;
  createdAt: string;
  transaction?: string;
  state: "reserved" | "settlement-recorded";
}

export interface ReconciliationAuditEntry {
  reservation: PurchaseReservation;
  outcome: "failed-released";
  resolvedAt: string;
}

export interface ShopperLedgerV1 {
  version: 1;
  shopper: string;
  network: string;
  asset: string;
  startingBudgetAtomic: string;
  initialSpendCapAtomic: string;
  committedSpendAtomic: string;
  purchases: SettledPurchase[];
}

export interface ShopperLedgerV2 {
  version: 2;
  shopper: string;
  network: string;
  asset: string;
  startingBudgetAtomic: string;
  initialSpendCapAtomic: string;
  committedSpendAtomic: string;
  purchases: SettledPurchase[];
  reservations: PurchaseReservation[];
  reconciliationAudit: ReconciliationAuditEntry[];
}

export interface LoadedLedger {
  ledger: ShopperLedgerV2;
  migratedFromV1: boolean;
}

export interface PolicyDecision {
  allowed: boolean;
  reasons: string[];
  committedSpendAtomic: bigint;
  reservedSpendAtomic: bigint;
  remainingInitialAllowanceAtomic: bigint;
  walletBalanceAtomic: bigint;
  proposedAmountAtomic: bigint;
  protectedReserveAtomic: bigint;
}

export interface DryRunResult extends PolicyDecision {
  challenge: PaymentRequired;
  requirement: PaymentRequirements;
  migratedFromV1: boolean;
}

export type ReceiptState = "success" | "failed" | "pending";

export interface PaymentExecutionResult {
  status: number;
  paymentStatus: string;
  transaction?: string;
  body: unknown;
}

export interface PaymentExecutionInput {
  request: ShopperRequest;
  config: ShopperConfig;
  privateKey: `0x${string}`;
  beforePaymentCreation: (
    paymentRequired: PaymentRequired,
    selectedRequirements: PaymentRequirements
  ) => Promise<void>;
  onTransaction: (transaction: string) => Promise<void>;
}

export interface ShopperGatewayDependencies {
  fetchChallenge: (
    request: ShopperRequest,
    config: ShopperConfig
  ) => Promise<PaymentRequired>;
  getBalance: (config: ShopperConfig) => Promise<bigint>;
  loadPrivateKey: (config: ShopperConfig) => Promise<`0x${string}`>;
  executePayment: (
    input: PaymentExecutionInput
  ) => Promise<PaymentExecutionResult>;
  waitForReceipt: (
    transaction: string,
    config: ShopperConfig
  ) => Promise<ReceiptState>;
  getReceipt: (
    transaction: string,
    config: ShopperConfig
  ) => Promise<ReceiptState>;
  now: () => Date;
  randomId: () => string;
}

export interface ExecutePurchaseResult {
  transaction: string;
  status: number;
  paymentStatus: string;
  body: unknown;
}

export interface ReconciliationResult {
  reservationId: string;
  outcome: "COMMITTED" | "FAILED_RELEASED" | "PENDING" | "AMBIGUOUS";
  transaction?: string;
}

function parseAtomicConfig(value: string | undefined, fallback: bigint): bigint {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) {
    throw new ShopperGatewayError(
      "CONFIG_INVALID",
      "Shopper atomic policy values must be non-negative integers."
    );
  }
  return BigInt(value);
}

export function createShopperConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd()
): ShopperConfig {
  return {
    shopper: env.SHOPPER_ADDRESS ?? SHOPPER_ADDRESS,
    allowedEndpoint: env.SHOPPER_ALLOWED_ENDPOINT ?? ALLOWED_ENDPOINT,
    network: ALLOWED_NETWORK,
    seller: env.SHOPPER_ALLOWED_SELLER ?? ALLOWED_SELLER,
    asset: env.SHOPPER_ALLOWED_ASSET ?? ALLOWED_USDC,
    maxItemPriceAtomic: parseAtomicConfig(
      env.SHOPPER_MAX_ITEM_PRICE_ATOMIC,
      3_000n
    ),
    lifetimeBudgetAtomic: parseAtomicConfig(
      env.SHOPPER_LIFETIME_BUDGET_ATOMIC,
      1_000_000n
    ),
    initialSpendCapAtomic: parseAtomicConfig(
      env.SHOPPER_INITIAL_SPEND_CAP_ATOMIC,
      30_000n
    ),
    protectedReserveAtomic: parseAtomicConfig(
      env.SHOPPER_PROTECTED_RESERVE_ATOMIC,
      970_000n
    ),
    ledgerPath: resolve(
      cwd,
      env.SHOPPER_LEDGER_PATH ?? ".env.shopper-ledger.json"
    ),
    lockPath: resolve(cwd, env.SHOPPER_LOCK_PATH ?? ".env.shopper.lock"),
    shopperEnvPath: resolve(cwd, env.SHOPPER_ENV_PATH ?? ".env.shopper"),
    rpcUrl: env.SHOPPER_RPC_URL ?? DEFAULT_RPC_URL
  };
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ShopperGatewayError("LEDGER_INVALID", `${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(
  record: Record<string, unknown>,
  key: string,
  label = "ledger"
): string {
  const value = record[key];
  if (typeof value !== "string" || !value) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      `${label}.${key} must be a non-empty string.`
    );
  }
  return value;
}

function atomicString(value: string, label: string): string {
  if (!/^\d+$/.test(value)) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      `${label} must be an atomic-unit integer string.`
    );
  }
  return value;
}

function parsePurchase(value: unknown): SettledPurchase {
  const record = asRecord(value, "purchase");
  if (record.status !== "settled") {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Every committed purchase must have settled status."
    );
  }

  const purchase: SettledPurchase = {
    transaction: requiredString(record, "transaction", "purchase"),
    amountAtomic: atomicString(
      requiredString(record, "amountAtomic", "purchase"),
      "purchase.amountAtomic"
    ),
    status: "settled",
    endpoint: requiredString(record, "endpoint", "purchase")
  };

  for (const key of [
    "reservationId",
    "sourceUrl",
    "question",
    "settledAt"
  ] as const) {
    if (typeof record[key] === "string") purchase[key] = record[key];
  }

  return purchase;
}

function parseReservation(value: unknown): PurchaseReservation {
  const record = asRecord(value, "reservation");
  if (record.state !== "reserved" && record.state !== "settlement-recorded") {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "reservation.state is invalid."
    );
  }

  const reservation: PurchaseReservation = {
    id: requiredString(record, "id", "reservation"),
    amountAtomic: atomicString(
      requiredString(record, "amountAtomic", "reservation"),
      "reservation.amountAtomic"
    ),
    endpoint: requiredString(record, "endpoint", "reservation"),
    sourceUrl: requiredString(record, "sourceUrl", "reservation"),
    question: requiredString(record, "question", "reservation"),
    createdAt: requiredString(record, "createdAt", "reservation"),
    state: record.state
  };

  if (typeof record.transaction === "string") {
    reservation.transaction = record.transaction;
  }
  return reservation;
}

function parseAuditEntry(value: unknown): ReconciliationAuditEntry {
  const record = asRecord(value, "reconciliationAudit entry");
  if (record.outcome !== "failed-released") {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "reconciliationAudit outcome is invalid."
    );
  }
  return {
    reservation: parseReservation(record.reservation),
    outcome: "failed-released",
    resolvedAt: requiredString(record, "resolvedAt", "reconciliationAudit entry")
  };
}

function parseArray<T>(
  value: unknown,
  label: string,
  parser: (item: unknown) => T
): T[] {
  if (!Array.isArray(value)) {
    throw new ShopperGatewayError("LEDGER_INVALID", `${label} must be an array.`);
  }
  return value.map(parser);
}

function parseCommonLedger(record: Record<string, unknown>) {
  return {
    shopper: requiredString(record, "shopper"),
    network: requiredString(record, "network"),
    asset: requiredString(record, "asset"),
    startingBudgetAtomic: atomicString(
      requiredString(record, "startingBudgetAtomic"),
      "ledger.startingBudgetAtomic"
    ),
    initialSpendCapAtomic: atomicString(
      requiredString(record, "initialSpendCapAtomic"),
      "ledger.initialSpendCapAtomic"
    ),
    committedSpendAtomic: atomicString(
      requiredString(record, "committedSpendAtomic"),
      "ledger.committedSpendAtomic"
    ),
    purchases: parseArray(record.purchases, "ledger.purchases", parsePurchase)
  };
}

export function parseLedger(value: unknown): LoadedLedger {
  const record = asRecord(value, "ledger");
  const common = parseCommonLedger(record);

  if (record.version === 1) {
    return {
      migratedFromV1: true,
      ledger: {
        version: 2,
        ...common,
        reservations: [],
        reconciliationAudit: []
      }
    };
  }

  if (record.version === 2) {
    return {
      migratedFromV1: false,
      ledger: {
        version: 2,
        ...common,
        reservations: parseArray(
          record.reservations,
          "ledger.reservations",
          parseReservation
        ),
        reconciliationAudit: parseArray(
          record.reconciliationAudit ?? [],
          "ledger.reconciliationAudit",
          parseAuditEntry
        )
      }
    };
  }

  throw new ShopperGatewayError(
    "LEDGER_INVALID",
    "Shopper ledger version must be 1 or 2."
  );
}

function sumAtomic(values: readonly string[]): bigint {
  return values.reduce((sum, value) => sum + BigInt(value), 0n);
}

function equalAddress(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function validateLedger(
  ledger: ShopperLedgerV2,
  config: ShopperConfig
): void {
  if (!equalAddress(ledger.shopper, config.shopper)) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger shopper does not match the configured public shopper address."
    );
  }
  if (ledger.network !== config.network) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger network does not match the shopper policy."
    );
  }
  if (!equalAddress(ledger.asset, config.asset)) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger asset does not match the shopper policy."
    );
  }
  if (BigInt(ledger.startingBudgetAtomic) !== config.lifetimeBudgetAtomic) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger starting budget does not match the shopper policy."
    );
  }
  if (BigInt(ledger.initialSpendCapAtomic) !== config.initialSpendCapAtomic) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger initial spend cap does not match the shopper policy."
    );
  }

  const purchaseTotal = sumAtomic(
    ledger.purchases.map(purchase => purchase.amountAtomic)
  );
  if (purchaseTotal !== BigInt(ledger.committedSpendAtomic)) {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "Ledger committed spend does not equal settled purchase history."
    );
  }
}

export async function loadLedger(
  ledgerPath: string,
  config: ShopperConfig
): Promise<LoadedLedger> {
  let text: string;
  try {
    text = await readFile(ledgerPath, "utf8");
  } catch {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "The local shopper ledger could not be read."
    );
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ShopperGatewayError(
      "LEDGER_INVALID",
      "The local shopper ledger is not valid JSON."
    );
  }

  const loaded = parseLedger(value);
  validateLedger(loaded.ledger, config);
  return loaded;
}

export async function writeLedgerAtomic(
  ledgerPath: string,
  ledger: ShopperLedgerV2,
  id = randomUUID()
): Promise<void> {
  const temporaryPath = `${ledgerPath}.tmp-${process.pid}-${id}`;
  let handle;

  try {
    handle = await open(temporaryPath, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporaryPath, ledgerPath);
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

export interface PurchaseLock {
  release: () => Promise<void>;
}

export type ProcessStatus = "active" | "not-running" | "unknown";

export interface LockRecoveryDependencies {
  checkProcessStatus: (pid: number) => ProcessStatus;
}

export interface LockRecoveryResult {
  outcome: "NO_LOCK" | "ACTIVE" | "RECOVERED";
  pid?: number;
  processStatus?: Exclude<ProcessStatus, "unknown">;
}

export async function acquirePurchaseLock(
  lockPath: string,
  now = new Date()
): Promise<PurchaseLock> {
  let handle;
  try {
    handle = await open(lockPath, "wx", 0o600);
    await handle.writeFile(
      `${JSON.stringify({ pid: process.pid, createdAt: now.toISOString() })}\n`,
      "utf8"
    );
    await handle.sync();
  } catch (error) {
    await handle?.close().catch(() => undefined);
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") {
      throw new ShopperGatewayError(
        "PURCHASE_LOCKED",
        "Another shopper operation owns the purchase lock."
      );
    }
    throw error;
  }

  let released = false;
  return {
    release: async () => {
      if (released) return;
      released = true;
      await handle?.close();
      await unlink(lockPath);
    }
  };
}

function parsePurchaseLock(value: unknown): { pid: number; createdAt: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock is malformed; recovery was refused."
    );
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.pid !== "number" ||
    !Number.isSafeInteger(record.pid) ||
    record.pid <= 0 ||
    typeof record.createdAt !== "string"
  ) {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock has invalid ownership metadata; recovery was refused."
    );
  }

  const createdAt = new Date(record.createdAt);
  if (
    Number.isNaN(createdAt.getTime()) ||
    createdAt.toISOString() !== record.createdAt
  ) {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock has invalid ownership metadata; recovery was refused."
    );
  }

  return { pid: record.pid, createdAt: record.createdAt };
}

export function defaultCheckProcessStatus(pid: number): ProcessStatus {
  try {
    process.kill(pid, 0);
    return "active";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return "not-running";
    if (code === "EPERM") return "active";
    return "unknown";
  }
}

export const defaultLockRecoveryDependencies: LockRecoveryDependencies = {
  checkProcessStatus: defaultCheckProcessStatus
};

export async function recoverPurchaseLock(
  lockPath: string,
  dependencies: LockRecoveryDependencies = defaultLockRecoveryDependencies
): Promise<LockRecoveryResult> {
  let text: string;
  try {
    text = await readFile(lockPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { outcome: "NO_LOCK" };
    }
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock ownership could not be read; recovery was refused."
    );
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock is malformed; recovery was refused."
    );
  }

  const lock = parsePurchaseLock(value);
  let processStatus: ProcessStatus;
  try {
    processStatus = dependencies.checkProcessStatus(lock.pid);
  } catch {
    processStatus = "unknown";
  }
  if (processStatus === "active") {
    return { outcome: "ACTIVE", pid: lock.pid, processStatus };
  }
  if (processStatus !== "not-running") {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The shopper lock owner status is indeterminate; recovery was refused."
    );
  }

  try {
    const currentText = await readFile(lockPath, "utf8");
    if (currentText !== text) {
      throw new Error("Shopper lock changed during recovery.");
    }
    await unlink(lockPath);
  } catch {
    throw new ShopperGatewayError(
      "LOCK_RECOVERY_REFUSED",
      "The confirmed-stale shopper lock could not be removed."
    );
  }
  return { outcome: "RECOVERED", pid: lock.pid, processStatus };
}

export function validateStoreEndpoint(
  endpoint: string,
  config: ShopperConfig
): void {
  if (endpoint !== config.allowedEndpoint) {
    throw new ShopperGatewayError(
      "POLICY_DENIED",
      "The requested store endpoint is not allowed by shopper policy."
    );
  }
}

function validateRequirement(
  requirement: PaymentRequirements,
  config: ShopperConfig
): void {
  if (requirement.scheme !== "exact") {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement scheme must be exact."
    );
  }
  if (requirement.network !== config.network) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement network is not Base Sepolia."
    );
  }
  if (!equalAddress(requirement.payTo, config.seller)) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement seller is not allowed."
    );
  }
  if (!equalAddress(requirement.asset, config.asset)) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement asset is not allowed."
    );
  }
  if (!/^\d+$/.test(requirement.amount)) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement amount is invalid."
    );
  }

  const amount = BigInt(requirement.amount);
  if (amount <= 0n || amount > config.maxItemPriceAtomic) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment requirement exceeds the maximum item price."
    );
  }
}

export function validatePaymentChallenge(
  challenge: PaymentRequired,
  endpoint: string,
  config: ShopperConfig
): PaymentRequirements {
  validateStoreEndpoint(endpoint, config);

  if (challenge.x402Version !== 2) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment challenge must use x402 version 2."
    );
  }
  if (challenge.resource?.url !== endpoint) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment challenge resource URL does not match the store endpoint."
    );
  }
  if (!Array.isArray(challenge.accepts) || challenge.accepts.length === 0) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The payment challenge contains no payment requirements."
    );
  }

  let firstError: unknown;
  for (const requirement of challenge.accepts) {
    try {
      validateRequirement(requirement, config);
      return requirement;
    } catch (error) {
      firstError ??= error;
    }
  }

  throw firstError;
}

function requirementMatches(
  left: PaymentRequirements,
  right: PaymentRequirements
): boolean {
  return (
    left.scheme === right.scheme &&
    left.network === right.network &&
    equalAddress(left.asset, right.asset) &&
    left.amount === right.amount &&
    equalAddress(left.payTo, right.payTo)
  );
}

export function evaluatePurchasePolicy(
  ledger: ShopperLedgerV2,
  proposedAmountAtomic: bigint,
  walletBalanceAtomic: bigint,
  config: ShopperConfig
): PolicyDecision {
  validateLedger(ledger, config);

  const committedSpendAtomic = BigInt(ledger.committedSpendAtomic);
  const reservedSpendAtomic = sumAtomic(
    ledger.reservations.map(reservation => reservation.amountAtomic)
  );
  const remainingInitialAllowanceAtomic =
    config.initialSpendCapAtomic > committedSpendAtomic + reservedSpendAtomic
      ? config.initialSpendCapAtomic - committedSpendAtomic - reservedSpendAtomic
      : 0n;
  const reasons: string[] = [];

  if (ledger.reservations.length > 0) {
    reasons.push("An unresolved reservation requires reconciliation.");
  }
  if (
    committedSpendAtomic + reservedSpendAtomic + proposedAmountAtomic >
    config.initialSpendCapAtomic
  ) {
    reasons.push("The proposed purchase exceeds the initial spend cap.");
  }
  if (
    committedSpendAtomic + reservedSpendAtomic + proposedAmountAtomic >
    config.lifetimeBudgetAtomic
  ) {
    reasons.push("The proposed purchase exceeds the lifetime wallet budget.");
  }
  if (walletBalanceAtomic < proposedAmountAtomic) {
    reasons.push("The live wallet balance is below the proposed price.");
  } else if (
    walletBalanceAtomic - proposedAmountAtomic <
    config.protectedReserveAtomic
  ) {
    reasons.push("The proposed purchase would breach the protected reserve.");
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    committedSpendAtomic,
    reservedSpendAtomic,
    remainingInitialAllowanceAtomic,
    walletBalanceAtomic,
    proposedAmountAtomic,
    protectedReserveAtomic: config.protectedReserveAtomic
  };
}

async function defaultFetchChallenge(
  request: ShopperRequest
): Promise<PaymentRequired> {
  let response: Response;
  try {
    response = await fetch(request.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: request.sourceUrl, question: request.question }),
      redirect: "error",
      signal: AbortSignal.timeout(8_000)
    });
  } catch {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The unpaid shopper challenge request failed."
    );
  }

  if (response.status !== 402) {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      `The store returned HTTP ${response.status} instead of an unpaid 402 challenge.`
    );
  }

  let body: unknown;
  try {
    const text = await response.text();
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  try {
    const httpClient = new x402HTTPClient(new x402Client());
    return httpClient.getPaymentRequiredResponse(
      name => response.headers.get(name),
      body
    );
  } catch {
    throw new ShopperGatewayError(
      "CHALLENGE_INVALID",
      "The store returned an invalid x402 payment challenge."
    );
  }
}

function createPublicRpcClient(config: ShopperConfig) {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(config.rpcUrl)
  });
}

async function defaultGetBalance(config: ShopperConfig): Promise<bigint> {
  const client = createPublicRpcClient(config);
  return client.readContract({
    address: config.asset as `0x${string}`,
    abi: BALANCE_OF_ABI,
    functionName: "balanceOf",
    args: [config.shopper as `0x${string}`]
  });
}

async function defaultLoadPrivateKey(
  config: ShopperConfig
): Promise<`0x${string}`> {
  const isolatedEnvironment: Record<string, string> = {};
  const result = loadDotenv({
    path: config.shopperEnvPath,
    processEnv: isolatedEnvironment,
    quiet: true
  });
  if (result.error) {
    throw new ShopperGatewayError(
      "CONFIG_INVALID",
      "The shopper credential file could not be loaded."
    );
  }

  const privateKey = isolatedEnvironment.SHOPPER_PRIVATE_KEY;
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new ShopperGatewayError(
      "CONFIG_INVALID",
      "The shopper credential is missing or invalid."
    );
  }
  return privateKey as `0x${string}`;
}

function requirementAllowedBySdkPolicy(
  version: number,
  requirement: PaymentRequirements,
  config: ShopperConfig
): boolean {
  if (version !== 2) return false;
  try {
    validateRequirement(requirement, config);
    return true;
  } catch {
    return false;
  }
}

async function defaultExecutePayment(
  input: PaymentExecutionInput
): Promise<PaymentExecutionResult> {
  const signer = privateKeyToAccount(input.privateKey);
  if (!equalAddress(signer.address, input.config.shopper)) {
    throw new ShopperGatewayError(
      "CONFIG_INVALID",
      "The shopper credential does not match the configured public shopper address."
    );
  }

  const client = new x402Client();
  client.setSpendControls({ maxAmountPerPayment: "$0.003" });
  client.register(
    input.config.network,
    new ExactEvmScheme(signer)
  );
  client.registerPolicy((version, requirements) =>
    requirements.filter(requirement =>
      requirementAllowedBySdkPolicy(version, requirement, input.config)
    )
  );
  client.onBeforePaymentCreation(async context => {
    try {
      const approved = validatePaymentChallenge(
        context.paymentRequired,
        input.request.endpoint,
        input.config
      );
      if (!requirementMatches(approved, context.selectedRequirements)) {
        throw new ShopperGatewayError(
          "CHALLENGE_INVALID",
          "The SDK selected a payment requirement outside shopper policy."
        );
      }
      await input.beforePaymentCreation(
        context.paymentRequired,
        context.selectedRequirements
      );
      return undefined;
    } catch (error) {
      return {
        abort: true as const,
        reason:
          error instanceof Error
            ? error.message
            : "Shopper policy rejected payment creation."
      };
    }
  });
  client.onPaymentResponse(async context => {
    const transaction = context.settleResponse?.transaction;
    if (transaction) await input.onTransaction(transaction);
  });

  const paidFetch = wrapFetchWithPayment(fetch, client);
  const response = await paidFetch(input.request.endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: input.request.sourceUrl,
      question: input.request.question
    }),
    redirect: "error"
  });
  const parsed = await new x402HTTPClient(client).processResponse(response);
  const header = parsed.header as
    | { success?: boolean; transaction?: string }
    | undefined;

  return {
    status: response.status,
    paymentStatus: parsed.paymentStatus,
    transaction: header?.transaction,
    body: parsed.body
  };
}

async function defaultWaitForReceipt(
  transaction: string,
  config: ShopperConfig
): Promise<ReceiptState> {
  if (!/^0x[a-fA-F0-9]{64}$/.test(transaction)) {
    throw new ShopperGatewayError(
      "PAYMENT_FAILED",
      "Settlement returned an invalid transaction hash."
    );
  }
  const receipt = await createPublicRpcClient(config).waitForTransactionReceipt({
    hash: transaction as `0x${string}`,
    confirmations: 1,
    timeout: 60_000
  });
  return receipt.status === "success" ? "success" : "failed";
}

async function defaultGetReceipt(
  transaction: string,
  config: ShopperConfig
): Promise<ReceiptState> {
  if (!/^0x[a-fA-F0-9]{64}$/.test(transaction)) {
    throw new ShopperGatewayError(
      "RECONCILIATION_REQUIRED",
      "Reservation contains an invalid transaction hash."
    );
  }
  try {
    const receipt = await createPublicRpcClient(config).getTransactionReceipt({
      hash: transaction as `0x${string}`
    });
    return receipt.status === "success" ? "success" : "failed";
  } catch (error) {
    if ((error as { name?: string }).name === "TransactionReceiptNotFoundError") {
      return "pending";
    }
    throw error;
  }
}

export const defaultShopperDependencies: ShopperGatewayDependencies = {
  fetchChallenge: request => defaultFetchChallenge(request),
  getBalance: defaultGetBalance,
  loadPrivateKey: defaultLoadPrivateKey,
  executePayment: defaultExecutePayment,
  waitForReceipt: defaultWaitForReceipt,
  getReceipt: defaultGetReceipt,
  now: () => new Date(),
  randomId: () => randomUUID()
};

export async function dryRunPurchase(
  request: ShopperRequest,
  config: ShopperConfig,
  dependencies: ShopperGatewayDependencies = defaultShopperDependencies
): Promise<DryRunResult> {
  validateStoreEndpoint(request.endpoint, config);
  const loaded = await loadLedger(config.ledgerPath, config);
  const challenge = await dependencies.fetchChallenge(request, config);
  const requirement = validatePaymentChallenge(
    challenge,
    request.endpoint,
    config
  );
  const balance = await dependencies.getBalance(config);
  const decision = evaluatePurchasePolicy(
    loaded.ledger,
    BigInt(requirement.amount),
    balance,
    config
  );

  return {
    ...decision,
    challenge,
    requirement,
    migratedFromV1: loaded.migratedFromV1
  };
}

async function persistReservation(
  request: ShopperRequest,
  requirement: PaymentRequirements,
  config: ShopperConfig,
  dependencies: ShopperGatewayDependencies
): Promise<PurchaseReservation> {
  const loaded = await loadLedger(config.ledgerPath, config);
  const balance = await dependencies.getBalance(config);
  const decision = evaluatePurchasePolicy(
    loaded.ledger,
    BigInt(requirement.amount),
    balance,
    config
  );
  if (!decision.allowed) {
    throw new ShopperGatewayError(
      "POLICY_DENIED",
      `Payment creation denied: ${decision.reasons.join(" ")}`
    );
  }

  const reservation: PurchaseReservation = {
    id: dependencies.randomId(),
    amountAtomic: requirement.amount,
    endpoint: request.endpoint,
    sourceUrl: request.sourceUrl,
    question: request.question,
    createdAt: dependencies.now().toISOString(),
    state: "reserved"
  };
  loaded.ledger.reservations.push(reservation);
  await writeLedgerAtomic(config.ledgerPath, loaded.ledger);
  return reservation;
}

export async function recordReservationTransaction(
  ledgerPath: string,
  reservationId: string,
  transaction: string,
  config: ShopperConfig
): Promise<void> {
  const loaded = await loadLedger(ledgerPath, config);
  const reservation = loaded.ledger.reservations.find(
    item => item.id === reservationId
  );

  if (!reservation) {
    const committed = loaded.ledger.purchases.find(
      purchase => purchase.reservationId === reservationId
    );
    if (committed?.transaction === transaction) return;
    throw new ShopperGatewayError(
      "RECONCILIATION_REQUIRED",
      "The active reservation could not be found while recording settlement."
    );
  }
  if (reservation.transaction && reservation.transaction !== transaction) {
    throw new ShopperGatewayError(
      "RECONCILIATION_REQUIRED",
      "The reservation already records a different settlement transaction."
    );
  }

  reservation.transaction = transaction;
  reservation.state = "settlement-recorded";
  await writeLedgerAtomic(ledgerPath, loaded.ledger);
}

export async function commitReservation(
  ledgerPath: string,
  reservationId: string,
  transaction: string,
  config: ShopperConfig,
  settledAt = new Date()
): Promise<void> {
  const loaded = await loadLedger(ledgerPath, config);
  const existingPurchase = loaded.ledger.purchases.find(
    purchase => purchase.transaction === transaction
  );
  const reservationIndex = loaded.ledger.reservations.findIndex(
    reservation => reservation.id === reservationId
  );

  if (existingPurchase) {
    if (reservationIndex >= 0) {
      loaded.ledger.reservations.splice(reservationIndex, 1);
      await writeLedgerAtomic(ledgerPath, loaded.ledger);
    }
    return;
  }
  if (reservationIndex < 0) {
    throw new ShopperGatewayError(
      "RECONCILIATION_REQUIRED",
      "The reservation is missing and settlement is not committed."
    );
  }

  const reservation = loaded.ledger.reservations[reservationIndex];
  if (reservation.transaction && reservation.transaction !== transaction) {
    throw new ShopperGatewayError(
      "RECONCILIATION_REQUIRED",
      "Settlement transaction does not match the reservation."
    );
  }

  loaded.ledger.purchases.push({
    transaction,
    amountAtomic: reservation.amountAtomic,
    status: "settled",
    endpoint: reservation.endpoint,
    reservationId: reservation.id,
    sourceUrl: reservation.sourceUrl,
    question: reservation.question,
    settledAt: settledAt.toISOString()
  });
  loaded.ledger.committedSpendAtomic = (
    BigInt(loaded.ledger.committedSpendAtomic) +
    BigInt(reservation.amountAtomic)
  ).toString();
  loaded.ledger.reservations.splice(reservationIndex, 1);
  await writeLedgerAtomic(ledgerPath, loaded.ledger);
}

async function releaseFailedReservation(
  ledgerPath: string,
  reservationId: string,
  config: ShopperConfig,
  resolvedAt: Date
): Promise<void> {
  const loaded = await loadLedger(ledgerPath, config);
  const index = loaded.ledger.reservations.findIndex(
    reservation => reservation.id === reservationId
  );
  if (index < 0) return;

  const [reservation] = loaded.ledger.reservations.splice(index, 1);
  loaded.ledger.reconciliationAudit.push({
    reservation,
    outcome: "failed-released",
    resolvedAt: resolvedAt.toISOString()
  });
  await writeLedgerAtomic(ledgerPath, loaded.ledger);
}

export async function executePurchase(
  request: ShopperRequest,
  config: ShopperConfig,
  dependencies: ShopperGatewayDependencies = defaultShopperDependencies
): Promise<ExecutePurchaseResult> {
  validateStoreEndpoint(request.endpoint, config);
  const lock = await acquirePurchaseLock(config.lockPath, dependencies.now());
  let reservation: PurchaseReservation | undefined;

  try {
    const preflight = await dryRunPurchase(request, config, dependencies);
    if (!preflight.allowed) {
      throw new ShopperGatewayError(
        "POLICY_DENIED",
        `Purchase denied: ${preflight.reasons.join(" ")}`
      );
    }

    // The credential is intentionally loaded only after non-secret preflight passes.
    const privateKey = await dependencies.loadPrivateKey(config);
    const paymentResult = await dependencies.executePayment({
      request,
      config,
      privateKey,
      beforePaymentCreation: async (paymentRequired, selectedRequirements) => {
        const approved = validatePaymentChallenge(
          paymentRequired,
          request.endpoint,
          config
        );
        if (!requirementMatches(approved, selectedRequirements)) {
          throw new ShopperGatewayError(
            "CHALLENGE_INVALID",
            "The selected payment requirement changed after preflight."
          );
        }
        reservation = await persistReservation(
          request,
          selectedRequirements,
          config,
          dependencies
        );
      },
      onTransaction: async transaction => {
        if (!reservation) {
          throw new ShopperGatewayError(
            "RECONCILIATION_REQUIRED",
            "Settlement appeared before a local reservation was recorded."
          );
        }
        await recordReservationTransaction(
          config.ledgerPath,
          reservation.id,
          transaction,
          config
        );
      }
    });

    if (!reservation) {
      throw new ShopperGatewayError(
        "RECONCILIATION_REQUIRED",
        "The payment path completed without creating a reservation."
      );
    }

    const transaction = paymentResult.transaction;
    if (transaction) {
      await recordReservationTransaction(
        config.ledgerPath,
        reservation.id,
        transaction,
        config
      );
    }
    if (
      paymentResult.status !== 200 ||
      paymentResult.paymentStatus !== "settled" ||
      !transaction
    ) {
      throw new ShopperGatewayError(
        "PAYMENT_FAILED",
        "The shopper payment did not return a settled HTTP 200 response."
      );
    }

    const receipt = await dependencies.waitForReceipt(transaction, config);
    if (receipt !== "success") {
      throw new ShopperGatewayError(
        "RECONCILIATION_REQUIRED",
        "The settlement transaction is not confirmed successful."
      );
    }

    await commitReservation(
      config.ledgerPath,
      reservation.id,
      transaction,
      config,
      dependencies.now()
    );
    return {
      transaction,
      status: paymentResult.status,
      paymentStatus: paymentResult.paymentStatus,
      body: paymentResult.body
    };
  } finally {
    await lock.release();
  }
}

export async function reconcileLedger(
  config: ShopperConfig,
  dependencies: ShopperGatewayDependencies = defaultShopperDependencies
): Promise<ReconciliationResult[]> {
  const lock = await acquirePurchaseLock(config.lockPath, dependencies.now());
  try {
    const loaded = await loadLedger(config.ledgerPath, config);
    const results: ReconciliationResult[] = [];

    for (const reservation of [...loaded.ledger.reservations]) {
      if (!reservation.transaction) {
        results.push({
          reservationId: reservation.id,
          outcome: "AMBIGUOUS"
        });
        continue;
      }

      const receipt = await dependencies.getReceipt(
        reservation.transaction,
        config
      );
      if (receipt === "success") {
        await commitReservation(
          config.ledgerPath,
          reservation.id,
          reservation.transaction,
          config,
          dependencies.now()
        );
        results.push({
          reservationId: reservation.id,
          outcome: "COMMITTED",
          transaction: reservation.transaction
        });
      } else if (receipt === "failed") {
        await releaseFailedReservation(
          config.ledgerPath,
          reservation.id,
          config,
          dependencies.now()
        );
        results.push({
          reservationId: reservation.id,
          outcome: "FAILED_RELEASED",
          transaction: reservation.transaction
        });
      } else {
        results.push({
          reservationId: reservation.id,
          outcome: "PENDING",
          transaction: reservation.transaction
        });
      }
    }

    return results;
  } finally {
    await lock.release();
  }
}

export function formatUsdc(amountAtomic: bigint): string {
  const negative = amountAtomic < 0n;
  const absolute = negative ? -amountAtomic : amountAtomic;
  const whole = absolute / 1_000_000n;
  let fraction = (absolute % 1_000_000n).toString().padStart(6, "0");
  while (fraction.length > 3 && fraction.endsWith("0")) {
    fraction = fraction.slice(0, -1);
  }
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}
