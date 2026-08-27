import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { PaymentRequired, PaymentRequirements } from "@x402/core/types";
import {
  createShopperConfig,
  dryRunPurchase,
  executePurchase,
  loadLedger,
  ShopperGatewayError,
  validatePaymentChallenge,
  type ShopperConfig,
  type ShopperGatewayDependencies,
  type ShopperRequest
} from "./shopper-gateway.js";

const endpoint = "https://store.example/extract-evidence";
const shopper = "0x1111111111111111111111111111111111111111";
const seller = "0x2222222222222222222222222222222222222222";
const asset = "0x3333333333333333333333333333333333333333";
const request: ShopperRequest = {
  endpoint,
  sourceUrl: "https://source.example/article",
  question: "What evidence is relevant?"
};

function requirement(overrides: Partial<PaymentRequirements> = {}): PaymentRequirements {
  return {
    scheme: "exact",
    network: "eip155:84532",
    asset,
    amount: "3000",
    payTo: seller,
    maxTimeoutSeconds: 300,
    extra: {},
    ...overrides
  };
}

function challenge(accepts: PaymentRequirements[] = [requirement()]): PaymentRequired {
  return { x402Version: 2, resource: { url: endpoint }, accepts };
}

async function context(): Promise<ShopperConfig> {
  const directory = await mkdtemp(join(tmpdir(), "x402-challenge-integrity-"));
  const config = createShopperConfig({
    SHOPPER_ADDRESS: shopper,
    SHOPPER_ALLOWED_ENDPOINT: endpoint,
    SHOPPER_ALLOWED_SELLER: seller,
    SHOPPER_ALLOWED_ASSET: asset,
    SHOPPER_LEDGER_PATH: "ledger.json",
    SHOPPER_LOCK_PATH: "shopper.lock",
    SHOPPER_ENV_PATH: "shopper.env",
    SHOPPER_RPC_URL: "https://rpc.invalid"
  }, directory);
  await writeFile(config.ledgerPath, `${JSON.stringify({
    version: 1, shopper, network: "eip155:84532", asset,
    startingBudgetAtomic: "1000000", initialSpendCapAtomic: "30000",
    committedSpendAtomic: "0", purchases: []
  })}\n`, "utf8");
  return config;
}

function codeIs(code: string): (error: unknown) => boolean {
  return error => error instanceof ShopperGatewayError && error.code === code;
}

test("known accepted challenge proceeds through the dry-run validation path", async () => {
  const config = await context();
  let balanceLookups = 0;
  const result = await dryRunPurchase(request, config, {
    fetchChallenge: async () => challenge(),
    getBalance: async () => { balanceLookups += 1; return 1_000_000n; },
    loadPrivateKey: async () => { throw new Error("not reached by dry run"); },
    executePayment: async () => { throw new Error("not reached by dry run"); },
    waitForReceipt: async () => { throw new Error("not reached by dry run"); },
    getReceipt: async () => { throw new Error("not reached by dry run"); },
    now: () => new Date(), randomId: () => "synthetic"
  });

  assert.equal(result.allowed, true);
  assert.equal(result.requirement.amount, "3000");
  assert.equal(balanceLookups, 1);
});

test("asset and scheme challenge drift reject before any wallet or payment dependency", async () => {
  for (const [field, override] of [
    ["asset", { asset: "0x4444444444444444444444444444444444444444" }],
    ["scheme", { scheme: "upto" }]
  ] as const) {
    const config = await context();
    const calls = { balance: 0, key: 0, payment: 0, receipt: 0 };
    const dependencies: ShopperGatewayDependencies = {
      fetchChallenge: async () => challenge([requirement(override)]),
      getBalance: async () => { calls.balance += 1; return 1_000_000n; },
      loadPrivateKey: async () => { calls.key += 1; return "0x00"; },
      executePayment: async () => { calls.payment += 1; throw new Error("not reached"); },
      waitForReceipt: async () => { calls.receipt += 1; return "success"; },
      getReceipt: async () => { calls.receipt += 1; return "success"; },
      now: () => new Date(), randomId: () => "synthetic"
    };

    await assert.rejects(dryRunPurchase(request, config, dependencies), codeIs("CHALLENGE_INVALID"), field);
    assert.deepEqual(calls, { balance: 0, key: 0, payment: 0, receipt: 0 }, `${field} must fail before dependencies capable of wallet, key, receipt, or payment activity`);
  }
});

test("accepted requirement selection uses the first valid candidate", () => {
  const config = {
    allowedEndpoint: endpoint, network: "eip155:84532", seller, asset,
    maxItemPriceAtomic: 3000n
  } as ShopperConfig;
  const firstValid = requirement({ amount: "2000" });
  const selectedAfterInvalid = validatePaymentChallenge(
    challenge([requirement({ scheme: "upto" }), firstValid]), endpoint, config
  );
  const selectedFromConflict = validatePaymentChallenge(
    challenge([firstValid, requirement({ amount: "3000" })]), endpoint, config
  );

  assert.strictEqual(selectedAfterInvalid, firstValid);
  assert.strictEqual(selectedFromConflict, firstValid);
});

test("post-preflight SDK asset and scheme drift reject before signing or settlement", async () => {
  const transaction = `0x${"a".repeat(64)}`;

  for (const [field, override, shouldReject] of [
    ["accepted control", {}, false],
    ["asset", { asset: "0x4444444444444444444444444444444444444444" }, true],
    ["scheme", { scheme: "upto" }, true]
  ] as const) {
    const config = await context();
    const calls = { key: 0, payment: 0, transaction: 0, receipt: 0 };
    const dependencies: ShopperGatewayDependencies = {
      fetchChallenge: async () => challenge(),
      getBalance: async () => 1_000_000n,
      loadPrivateKey: async () => { calls.key += 1; return "0x00"; },
      executePayment: async input => {
        calls.payment += 1;
        await input.beforePaymentCreation(challenge(), requirement(override));
        calls.transaction += 1;
        await input.onTransaction(transaction);
        return { status: 200, paymentStatus: "settled", transaction, body: {} };
      },
      waitForReceipt: async () => { calls.receipt += 1; return "success"; },
      getReceipt: async () => { throw new Error("not used by execution"); },
      now: () => new Date(), randomId: () => "synthetic"
    };

    if (shouldReject) {
      await assert.rejects(executePurchase(request, config, dependencies), codeIs("CHALLENGE_INVALID"), field);
      assert.deepEqual(calls, { key: 1, payment: 1, transaction: 0, receipt: 0 }, `${field} must reject before the fake signing callback, transaction callback, or receipt lookup`);
      const ledger = await loadLedger(config.ledgerPath, config);
      assert.equal(ledger.ledger.reservations.length, 0, `${field} must not persist a reservation`);
      assert.equal(ledger.ledger.committedSpendAtomic, "0", `${field} must not commit spend`);
    } else {
      const result = await executePurchase(request, config, dependencies);
      assert.equal(result.transaction, transaction);
      assert.deepEqual(calls, { key: 1, payment: 1, transaction: 1, receipt: 1 });
    }
  }
});
