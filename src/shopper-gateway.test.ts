import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type {
  PaymentRequired,
  PaymentRequirements
} from "@x402/core/types";
import {
  acquirePurchaseLock,
  commitReservation,
  createShopperConfig,
  dryRunPurchase,
  evaluatePurchasePolicy,
  executePurchase,
  loadLedger,
  parseLedger,
  recoverPurchaseLock,
  reconcileLedger,
  validatePaymentChallenge,
  validateStoreEndpoint,
  writeLedgerAtomic,
  ShopperGatewayError,
  type PurchaseReservation,
  type ShopperConfig,
  type ShopperGatewayDependencies,
  type ShopperLedgerV1,
  type ShopperLedgerV2,
  type ShopperRequest
} from "./shopper-gateway.js";

const TEST_ENDPOINT = "https://store.example/extract-evidence";
const TEST_SHOPPER = "0x1111111111111111111111111111111111111111";
const TEST_SELLER = "0x2222222222222222222222222222222222222222";
const TEST_ASSET = "0x3333333333333333333333333333333333333333";
const FIRST_TRANSACTION = `0x${"a".repeat(64)}`;
const SECOND_TRANSACTION = `0x${"b".repeat(64)}`;

const request: ShopperRequest = {
  endpoint: TEST_ENDPOINT,
  sourceUrl: "https://source.example/article",
  question: "What evidence is relevant?"
};

async function createTestContext(): Promise<{
  directory: string;
  config: ShopperConfig;
}> {
  const directory = await mkdtemp(join(tmpdir(), "x402-shopper-test-"));
  const config = createShopperConfig(
    {
      SHOPPER_ADDRESS: TEST_SHOPPER,
      SHOPPER_ALLOWED_ENDPOINT: TEST_ENDPOINT,
      SHOPPER_ALLOWED_SELLER: TEST_SELLER,
      SHOPPER_ALLOWED_ASSET: TEST_ASSET,
      SHOPPER_LEDGER_PATH: "ledger.json",
      SHOPPER_LOCK_PATH: "shopper.lock",
      SHOPPER_ENV_PATH: "shopper.env",
      SHOPPER_RPC_URL: "https://rpc.invalid"
    },
    directory
  );
  return { directory, config };
}

function purchase(amountAtomic = "3000") {
  return {
    transaction: FIRST_TRANSACTION,
    amountAtomic,
    status: "settled" as const,
    endpoint: TEST_ENDPOINT
  };
}

function v1Ledger(
  overrides: Partial<ShopperLedgerV1> = {}
): ShopperLedgerV1 {
  return {
    version: 1,
    shopper: TEST_SHOPPER,
    network: "eip155:84532",
    asset: TEST_ASSET,
    startingBudgetAtomic: "1000000",
    initialSpendCapAtomic: "30000",
    committedSpendAtomic: "3000",
    purchases: [purchase()],
    ...overrides
  };
}

function reservation(
  overrides: Partial<PurchaseReservation> = {}
): PurchaseReservation {
  return {
    id: "reservation-1",
    amountAtomic: "3000",
    endpoint: TEST_ENDPOINT,
    sourceUrl: request.sourceUrl,
    question: request.question,
    createdAt: "2026-08-24T00:00:00.000Z",
    state: "reserved",
    ...overrides
  };
}

function v2Ledger(
  overrides: Partial<ShopperLedgerV2> = {}
): ShopperLedgerV2 {
  return {
    ...parseLedger(v1Ledger()).ledger,
    version: 2,
    ...overrides
  };
}

function requirement(
  overrides: Partial<PaymentRequirements> = {}
): PaymentRequirements {
  return {
    scheme: "exact",
    network: "eip155:84532",
    asset: TEST_ASSET,
    amount: "3000",
    payTo: TEST_SELLER,
    maxTimeoutSeconds: 300,
    extra: {},
    ...overrides
  };
}

function challenge(
  requirementOverrides: Partial<PaymentRequirements> = {},
  challengeOverrides: Partial<PaymentRequired> = {}
): PaymentRequired {
  return {
    x402Version: 2,
    resource: { url: TEST_ENDPOINT },
    accepts: [requirement(requirementOverrides)],
    ...challengeOverrides
  };
}

function dependencies(
  overrides: Partial<ShopperGatewayDependencies> = {}
): ShopperGatewayDependencies {
  return {
    fetchChallenge: async () => challenge(),
    getBalance: async () => 997_000n,
    loadPrivateKey: async () => "0xnot-a-real-key" as `0x${string}`,
    executePayment: async () => {
      throw new Error("Payment execution was not expected in this test.");
    },
    waitForReceipt: async () => "success",
    getReceipt: async () => "pending",
    now: () => new Date("2026-08-24T01:00:00.000Z"),
    randomId: () => "reservation-1",
    ...overrides
  };
}

async function writeLedger(path: string, ledger: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
}

async function writeTestLock(path: string, pid = 42_424): Promise<string> {
  const text = `${JSON.stringify({
    pid,
    createdAt: "2026-08-24T01:00:00.000Z"
  })}\n`;
  await writeFile(path, text, "utf8");
  return text;
}

function hasGatewayCode(code: string): (error: unknown) => boolean {
  return error => error instanceof ShopperGatewayError && error.code === code;
}

test("loads a V1 ledger without writing a migration", async () => {
  const { config } = await createTestContext();
  const original = `${JSON.stringify(v1Ledger(), null, 2)}\n`;
  await writeFile(config.ledgerPath, original, "utf8");

  const loaded = await loadLedger(config.ledgerPath, config);

  assert.equal(loaded.migratedFromV1, true);
  assert.equal(loaded.ledger.version, 2);
  assert.equal(loaded.ledger.committedSpendAtomic, "3000");
  assert.equal(loaded.ledger.purchases.length, 1);
  assert.equal(await readFile(config.ledgerPath, "utf8"), original);
});

test("V1 to V2 migration preserves committed purchase history", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  const loaded = await loadLedger(config.ledgerPath, config);

  loaded.ledger.reservations.push(reservation());
  await writeLedgerAtomic(
    config.ledgerPath,
    loaded.ledger,
    "00000000-0000-4000-8000-000000000001"
  );
  const persisted = JSON.parse(await readFile(config.ledgerPath, "utf8"));

  assert.equal(persisted.version, 2);
  assert.equal(persisted.committedSpendAtomic, "3000");
  assert.equal(persisted.purchases[0].transaction, FIRST_TRANSACTION);
  assert.equal(persisted.reservations[0].id, "reservation-1");
});

test("dry-run never requests or loads a private key", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  let privateKeyLoads = 0;

  const result = await dryRunPurchase(
    request,
    config,
    dependencies({
      loadPrivateKey: async () => {
        privateKeyLoads += 1;
        throw new Error("Private key loader must not run during dry-run.");
      }
    })
  );

  assert.equal(result.allowed, true);
  assert.equal(privateKeyLoads, 0);
});

test("rejects the wrong store endpoint", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () => validateStoreEndpoint("https://other.example/buy", config),
    hasGatewayCode("POLICY_DENIED")
  );
});

test("rejects a mismatched challenge resource URL", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({}, { resource: { url: "https://other.example/item" } }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects the wrong x402 version", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({}, { x402Version: 1 }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects the wrong payment scheme", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({ scheme: "upto" }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects the wrong payment network", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({ network: "eip155:8453" }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects the wrong seller", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({ payTo: "0x4444444444444444444444444444444444444444" }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects the wrong payment asset", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({ asset: "0x5555555555555555555555555555555555555555" }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects an item price above 3000 atomic", async () => {
  const { config } = await createTestContext();
  assert.throws(
    () =>
      validatePaymentChallenge(
        challenge({ amount: "3001" }),
        TEST_ENDPOINT,
        config
      ),
    hasGatewayCode("CHALLENGE_INVALID")
  );
});

test("rejects committed plus reserved plus proposed spend above 30000", async () => {
  const { config } = await createTestContext();
  const ledger = v2Ledger({
    reservations: [reservation({ amountAtomic: "26000" })]
  });

  const decision = evaluatePurchasePolicy(ledger, 3_000n, 2_000_000n, config);

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.some(reason => reason.includes("initial spend cap")));
});

test("rejects a proposed purchase that breaches the protected reserve", async () => {
  const { config } = await createTestContext();
  const decision = evaluatePurchasePolicy(
    v2Ledger(),
    3_000n,
    972_000n,
    config
  );

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.some(reason => reason.includes("protected reserve")));
});

test("a stale high RPC balance cannot override local committed spend", async () => {
  const { config } = await createTestContext();
  const ledger = v2Ledger({
    committedSpendAtomic: "29000",
    purchases: [purchase("29000")]
  });

  const decision = evaluatePurchasePolicy(ledger, 3_000n, 9_000_000n, config);

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.some(reason => reason.includes("initial spend cap")));
});

test("reservation is persisted before the signing callback and settlement commits", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  let observedReservationBeforeSigning = false;

  const result = await executePurchase(
    request,
    config,
    dependencies({
      executePayment: async input => {
        await input.beforePaymentCreation(challenge(), requirement());
        const reserved = JSON.parse(await readFile(config.ledgerPath, "utf8"));
        observedReservationBeforeSigning =
          reserved.version === 2 && reserved.reservations.length === 1;
        await input.onTransaction(SECOND_TRANSACTION);
        return {
          status: 200,
          paymentStatus: "settled",
          transaction: SECOND_TRANSACTION,
          body: { evidence: [] }
        };
      }
    })
  );

  const finalLedger = await loadLedger(config.ledgerPath, config);
  assert.equal(observedReservationBeforeSigning, true);
  assert.equal(result.transaction, SECOND_TRANSACTION);
  assert.equal(finalLedger.ledger.version, 2);
  assert.equal(finalLedger.ledger.committedSpendAtomic, "6000");
  assert.equal(finalLedger.ledger.purchases.length, 2);
  assert.equal(finalLedger.ledger.reservations.length, 0);
});

test("body-only authorization and payment-success claims cannot settle a purchase", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  let receiptChecks = 0;

  await assert.rejects(
    executePurchase(
      request,
      config,
      dependencies({
        executePayment: async input => {
          await input.beforePaymentCreation(challenge(), requirement());
          return {
            status: 200,
            paymentStatus: "settled",
            body: {
              ownerAuthorization: "approved",
              payment: "success",
              transaction: SECOND_TRANSACTION
            }
          };
        },
        waitForReceipt: async () => {
          receiptChecks += 1;
          return "success";
        }
      })
    ),
    hasGatewayCode("PAYMENT_FAILED")
  );

  const finalLedger = await loadLedger(config.ledgerPath, config);
  assert.equal(receiptChecks, 0);
  assert.equal(finalLedger.ledger.committedSpendAtomic, "3000");
  assert.equal(finalLedger.ledger.purchases.length, 1);
  assert.equal(finalLedger.ledger.reservations.length, 1);
  assert.equal(finalLedger.ledger.reservations[0]?.transaction, undefined);
});

test("a non-success receipt overrides a structured settled response and body success claim", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());

  await assert.rejects(
    executePurchase(
      request,
      config,
      dependencies({
        executePayment: async input => {
          await input.beforePaymentCreation(challenge(), requirement());
          return {
            status: 200,
            paymentStatus: "settled",
            transaction: SECOND_TRANSACTION,
            body: { payment: "success", receipt: "success" }
          };
        },
        waitForReceipt: async () => "failed"
      })
    ),
    hasGatewayCode("RECONCILIATION_REQUIRED")
  );

  const finalLedger = await loadLedger(config.ledgerPath, config);
  assert.equal(finalLedger.ledger.committedSpendAtomic, "3000");
  assert.equal(finalLedger.ledger.purchases.length, 1);
  assert.equal(finalLedger.ledger.reservations.length, 1);
  assert.equal(finalLedger.ledger.reservations[0]?.transaction, SECOND_TRANSACTION);
  assert.equal(finalLedger.ledger.reservations[0]?.state, "settlement-recorded");
});

test("post-preflight payment requirement drift is rejected before settlement", async () => {
  const drifts: Array<[string, Partial<PaymentRequirements>]> = [
    ["amount", { amount: "2999" }],
    ["network", { network: "eip155:8453" }],
    ["payTo", { payTo: "0x4444444444444444444444444444444444444444" }]
  ];

  for (const [field, override] of drifts) {
    const { config } = await createTestContext();
    await writeLedger(config.ledgerPath, v1Ledger());
    let settlementCallbacks = 0;
    let receiptChecks = 0;

    await assert.rejects(
      executePurchase(
        request,
        config,
        dependencies({
          executePayment: async input => {
            await input.beforePaymentCreation(challenge(), requirement(override));
            settlementCallbacks += 1;
            await input.onTransaction(SECOND_TRANSACTION);
            return {
              status: 200,
              paymentStatus: "settled",
              transaction: SECOND_TRANSACTION,
              body: { evidence: [] }
            };
          },
          waitForReceipt: async () => {
            receiptChecks += 1;
            return "success";
          }
        })
      ),
      hasGatewayCode("CHALLENGE_INVALID"),
      `${field} drift must fail closed`
    );

    const finalLedger = await loadLedger(config.ledgerPath, config);
    assert.equal(settlementCallbacks, 0, `${field} must fail before settlement`);
    assert.equal(receiptChecks, 0, `${field} must not check a receipt`);
    assert.equal(finalLedger.ledger.reservations.length, 0);
  }
});

test("duplicate settlement processing cannot double-count spend", async () => {
  const { config } = await createTestContext();
  const ledger = v2Ledger({
    committedSpendAtomic: "6000",
    purchases: [
      purchase(),
      {
        transaction: SECOND_TRANSACTION,
        amountAtomic: "3000",
        status: "settled",
        endpoint: TEST_ENDPOINT,
        reservationId: "reservation-1"
      }
    ],
    reservations: []
  });
  await writeLedger(config.ledgerPath, ledger);

  await commitReservation(
    config.ledgerPath,
    "reservation-1",
    SECOND_TRANSACTION,
    config
  );
  const finalLedger = await loadLedger(config.ledgerPath, config);

  assert.equal(finalLedger.ledger.committedSpendAtomic, "6000");
  assert.equal(finalLedger.ledger.purchases.length, 2);
});

test("second concurrent lock acquisition is rejected", async () => {
  const { config } = await createTestContext();
  const firstLock = await acquirePurchaseLock(config.lockPath);

  await assert.rejects(
    acquirePurchaseLock(config.lockPath),
    hasGatewayCode("PURCHASE_LOCKED")
  );
  await firstLock.release();
});

test("active lock cannot be recovered", async () => {
  const { config } = await createTestContext();
  const original = await writeTestLock(config.lockPath);

  const result = await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "active"
  });

  assert.equal(result.outcome, "ACTIVE");
  assert.equal(result.pid, 42_424);
  assert.equal(await readFile(config.lockPath, "utf8"), original);
});

test("confirmed-dead stale lock can be explicitly recovered", async () => {
  const { config } = await createTestContext();
  await writeTestLock(config.lockPath);

  const result = await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "not-running"
  });

  assert.equal(result.outcome, "RECOVERED");
  await assert.rejects(readFile(config.lockPath, "utf8"), { code: "ENOENT" });
});

test("malformed lock fails closed and remains untouched", async () => {
  const { config } = await createTestContext();
  const malformed = "{not valid JSON\n";
  await writeFile(config.lockPath, malformed, "utf8");

  await assert.rejects(
    recoverPurchaseLock(config.lockPath, {
      checkProcessStatus: () => {
        throw new Error("Malformed ownership must not reach PID checking.");
      }
    }),
    hasGatewayCode("LOCK_RECOVERY_REFUSED")
  );
  assert.equal(await readFile(config.lockPath, "utf8"), malformed);
});

test("lock with invalid ownership metadata fails closed", async () => {
  const { config } = await createTestContext();
  const invalidLocks = [
    { createdAt: "2026-08-24T01:00:00.000Z" },
    { pid: 0, createdAt: "2026-08-24T01:00:00.000Z" },
    { pid: 42_424, createdAt: "not-an-ISO-timestamp" }
  ];

  for (const invalidLock of invalidLocks) {
    const text = `${JSON.stringify(invalidLock)}\n`;
    await writeFile(config.lockPath, text, "utf8");
    await assert.rejects(
      recoverPurchaseLock(config.lockPath, {
        checkProcessStatus: () => {
          throw new Error("Invalid ownership must not reach PID checking.");
        }
      }),
      hasGatewayCode("LOCK_RECOVERY_REFUSED")
    );
    assert.equal(await readFile(config.lockPath, "utf8"), text);
  }
});

test("ambiguous PID-liveness result fails closed", async () => {
  const { config } = await createTestContext();
  const original = await writeTestLock(config.lockPath);

  for (const checkProcessStatus of [
    () => "unknown" as const,
    () => {
      throw Object.assign(new Error("Permission status unavailable."), {
        code: "EACCES"
      });
    }
  ]) {
    await assert.rejects(
      recoverPurchaseLock(config.lockPath, { checkProcessStatus }),
      hasGatewayCode("LOCK_RECOVERY_REFUSED")
    );
    assert.equal(await readFile(config.lockPath, "utf8"), original);
  }
});

test("no-lock recovery is harmless", async () => {
  const { config } = await createTestContext();
  let processChecks = 0;

  const result = await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => {
      processChecks += 1;
      return "unknown";
    }
  });

  assert.equal(result.outcome, "NO_LOCK");
  assert.equal(processChecks, 0);
});

test("stale-lock recovery does not mutate ledger contents", async () => {
  const { config } = await createTestContext();
  const ledgerText = `${JSON.stringify(
    v2Ledger({ reservations: [reservation()] }),
    null,
    2
  )}\n`;
  await writeFile(config.ledgerPath, ledgerText, "utf8");
  await writeTestLock(config.lockPath);

  await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "not-running"
  });

  assert.equal(await readFile(config.ledgerPath, "utf8"), ledgerText);
});

test("stale-lock recovery does not load a private key", async () => {
  const { config } = await createTestContext();
  await writeTestLock(config.lockPath);
  let privateKeyLoads = 0;
  const recoveryDependencies = {
    checkProcessStatus: () => "not-running" as const,
    loadPrivateKey: () => {
      privateKeyLoads += 1;
    }
  };

  await recoverPurchaseLock(config.lockPath, recoveryDependencies);

  assert.equal(privateKeyLoads, 0);
});

test("stale-lock recovery does not execute payment", async () => {
  const { config } = await createTestContext();
  await writeTestLock(config.lockPath);
  let paymentExecutions = 0;
  const recoveryDependencies = {
    checkProcessStatus: () => "not-running" as const,
    executePayment: () => {
      paymentExecutions += 1;
    }
  };

  await recoverPurchaseLock(config.lockPath, recoveryDependencies);

  assert.equal(paymentExecutions, 0);
});

test("reconcile can acquire the lock after stale-lock recovery", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v2Ledger());
  await writeTestLock(config.lockPath);

  await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "not-running"
  });
  const results = await reconcileLedger(config, dependencies());

  assert.deepEqual(results, []);
  await assert.rejects(readFile(config.lockPath, "utf8"), { code: "ENOENT" });
});

test("confirmed successful reservation reconciles after lock recovery", async () => {
  const { config } = await createTestContext();
  await writeLedger(
    config.ledgerPath,
    v2Ledger({
      reservations: [
        reservation({
          transaction: SECOND_TRANSACTION,
          state: "settlement-recorded"
        })
      ]
    })
  );
  await writeTestLock(config.lockPath);

  await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "not-running"
  });
  const results = await reconcileLedger(
    config,
    dependencies({ getReceipt: async () => "success" })
  );
  const finalLedger = await loadLedger(config.ledgerPath, config);

  assert.equal(results[0]?.outcome, "COMMITTED");
  assert.equal(finalLedger.ledger.committedSpendAtomic, "6000");
  assert.equal(finalLedger.ledger.reservations.length, 0);
});

test("ambiguous reservation remains blocked after lock recovery", async () => {
  const { config } = await createTestContext();
  await writeLedger(
    config.ledgerPath,
    v2Ledger({ reservations: [reservation()] })
  );
  await writeTestLock(config.lockPath);

  await recoverPurchaseLock(config.lockPath, {
    checkProcessStatus: () => "not-running"
  });
  const results = await reconcileLedger(config, dependencies());
  const finalLedger = await loadLedger(config.ledgerPath, config);
  const decision = evaluatePurchasePolicy(
    finalLedger.ledger,
    3_000n,
    997_000n,
    config
  );

  assert.equal(results[0]?.outcome, "AMBIGUOUS");
  assert.equal(finalLedger.ledger.reservations.length, 1);
  assert.equal(decision.allowed, false);
});

test("ordinary operations do not silently delete a stale lock", async () => {
  const { config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  const lockText = await writeTestLock(config.lockPath);

  const dryRun = await dryRunPurchase(request, config, dependencies());
  assert.equal(dryRun.allowed, true);
  assert.equal(await readFile(config.lockPath, "utf8"), lockText);

  await assert.rejects(
    executePurchase(request, config, dependencies()),
    hasGatewayCode("PURCHASE_LOCKED")
  );
  assert.equal(await readFile(config.lockPath, "utf8"), lockText);

  await assert.rejects(
    reconcileLedger(config, dependencies()),
    hasGatewayCode("PURCHASE_LOCKED")
  );
  assert.equal(await readFile(config.lockPath, "utf8"), lockText);
});

test("an unresolved reservation blocks spending", async () => {
  const { config } = await createTestContext();
  const decision = evaluatePurchasePolicy(
    v2Ledger({ reservations: [reservation()] }),
    3_000n,
    997_000n,
    config
  );

  assert.equal(decision.allowed, false);
  assert.ok(decision.reasons.some(reason => reason.includes("reconciliation")));
});

test("reconciliation commits a confirmed successful transaction", async () => {
  const { config } = await createTestContext();
  await writeLedger(
    config.ledgerPath,
    v2Ledger({
      reservations: [
        reservation({
          transaction: SECOND_TRANSACTION,
          state: "settlement-recorded"
        })
      ]
    })
  );

  const result = await reconcileLedger(
    config,
    dependencies({ getReceipt: async () => "success" })
  );
  const finalLedger = await loadLedger(config.ledgerPath, config);

  assert.equal(result[0]?.outcome, "COMMITTED");
  assert.equal(finalLedger.ledger.committedSpendAtomic, "6000");
  assert.equal(finalLedger.ledger.reservations.length, 0);
});

test("ambiguous reservation without a transaction remains blocked", async () => {
  const { config } = await createTestContext();
  await writeLedger(
    config.ledgerPath,
    v2Ledger({ reservations: [reservation()] })
  );

  const result = await reconcileLedger(config, dependencies());
  const finalLedger = await loadLedger(config.ledgerPath, config);
  const decision = evaluatePurchasePolicy(
    finalLedger.ledger,
    3_000n,
    997_000n,
    config
  );

  assert.equal(result[0]?.outcome, "AMBIGUOUS");
  assert.equal(finalLedger.ledger.reservations.length, 1);
  assert.equal(decision.allowed, false);
});

test("atomic ledger replacement leaves valid JSON and no temporary file", async () => {
  const { directory, config } = await createTestContext();
  await writeLedger(config.ledgerPath, v1Ledger());
  const ledger = v2Ledger({ reservations: [reservation()] });

  await writeLedgerAtomic(
    config.ledgerPath,
    ledger,
    "00000000-0000-4000-8000-000000000002"
  );
  const persisted = JSON.parse(await readFile(config.ledgerPath, "utf8"));
  const files = await readdir(directory);

  assert.equal(persisted.version, 2);
  assert.equal(persisted.reservations.length, 1);
  assert.ok(!files.some(file => file.includes(".tmp-")));
});
