import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  commitReservation,
  createShopperConfig,
  loadLedger,
  parseLedger,
  recordReservationTransaction,
  ShopperGatewayError,
  validateLedger,
  type PurchaseReservation,
  type ShopperConfig,
  type ShopperLedgerV2
} from "./shopper-gateway.js";

const ENDPOINT = "https://store.example/extract-evidence";
const SHOPPER = "0x1111111111111111111111111111111111111111";
const SELLER = "0x2222222222222222222222222222222222222222";
const ASSET = "0x3333333333333333333333333333333333333333";
const TRANSACTION_A = `0x${"a".repeat(64)}`;
const TRANSACTION_B = `0x${"b".repeat(64)}`;

async function testContext(): Promise<ShopperConfig> {
  const directory = await mkdtemp(join(tmpdir(), "x402-ledger-invariant-"));
  return createShopperConfig(
    {
      SHOPPER_ADDRESS: SHOPPER,
      SHOPPER_ALLOWED_ENDPOINT: ENDPOINT,
      SHOPPER_ALLOWED_SELLER: SELLER,
      SHOPPER_ALLOWED_ASSET: ASSET,
      SHOPPER_LEDGER_PATH: "ledger.json",
      SHOPPER_LOCK_PATH: "shopper.lock",
      SHOPPER_ENV_PATH: "shopper.env",
      SHOPPER_RPC_URL: "https://rpc.invalid"
    },
    directory
  );
}

function reservation(
  id: string,
  transaction?: string
): PurchaseReservation {
  return {
    id,
    amountAtomic: "3000",
    endpoint: ENDPOINT,
    sourceUrl: "https://source.example/article",
    question: "What evidence is relevant?",
    createdAt: "2026-08-26T00:00:00.000Z",
    state: transaction ? "settlement-recorded" : "reserved",
    ...(transaction ? { transaction } : {})
  };
}

function ledger(overrides: Partial<ShopperLedgerV2> = {}): ShopperLedgerV2 {
  return {
    version: 2,
    shopper: SHOPPER,
    network: "eip155:84532",
    asset: ASSET,
    startingBudgetAtomic: "1000000",
    initialSpendCapAtomic: "30000",
    committedSpendAtomic: "0",
    purchases: [],
    reservations: [],
    reconciliationAudit: [],
    ...overrides
  };
}

async function writeLedger(config: ShopperConfig, value: ShopperLedgerV2): Promise<void> {
  await writeFile(
    config.ledgerPath,
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );
}

function hasCode(code: string): (error: unknown) => boolean {
  return error => error instanceof ShopperGatewayError && error.code === code;
}

test("matching reservation and transaction commit exactly one settled purchase", async () => {
  const config = await testContext();
  await writeLedger(
    config,
    ledger({ reservations: [reservation("A", TRANSACTION_A)] })
  );

  await commitReservation(config.ledgerPath, "A", TRANSACTION_A, config);

  const loaded = await loadLedger(config.ledgerPath, config);
  assert.equal(loaded.ledger.committedSpendAtomic, "3000");
  assert.deepEqual(loaded.ledger.reservations, []);
  assert.equal(loaded.ledger.purchases.length, 1);
  assert.equal(loaded.ledger.purchases[0]?.reservationId, "A");
  assert.equal(loaded.ledger.purchases[0]?.transaction, TRANSACTION_A);
});

test("CURRENT DEFECT: cross-reservation transaction replay deletes the unrelated active reservation", async () => {
  const config = await testContext();
  await writeLedger(
    config,
    ledger({
      committedSpendAtomic: "3000",
      purchases: [
        {
          transaction: TRANSACTION_A,
          amountAtomic: "3000",
          status: "settled",
          endpoint: ENDPOINT,
          reservationId: "A"
        }
      ],
      reservations: [reservation("B")]
    })
  );

  await commitReservation(config.ledgerPath, "B", TRANSACTION_A, config);

  const loaded = await loadLedger(config.ledgerPath, config);
  assert.equal(loaded.ledger.committedSpendAtomic, "3000");
  assert.equal(loaded.ledger.purchases.length, 1);
  assert.equal(loaded.ledger.purchases[0]?.reservationId, "A");
  assert.deepEqual(loaded.ledger.reservations, []);
  assert.deepEqual(loaded.ledger.reconciliationAudit, []);
});

test("transaction recording accepts an idempotent repeat but rejects a different transaction", async () => {
  const config = await testContext();
  await writeLedger(config, ledger({ reservations: [reservation("A")] }));

  await recordReservationTransaction(config.ledgerPath, "A", TRANSACTION_A, config);
  await recordReservationTransaction(config.ledgerPath, "A", TRANSACTION_A, config);
  await assert.rejects(
    recordReservationTransaction(config.ledgerPath, "A", TRANSACTION_B, config),
    hasCode("RECONCILIATION_REQUIRED")
  );

  const loaded = await loadLedger(config.ledgerPath, config);
  assert.equal(loaded.ledger.reservations[0]?.transaction, TRANSACTION_A);
  assert.equal(loaded.ledger.reservations[0]?.state, "settlement-recorded");
});

test("CURRENT PERMISSIVE BEHAVIOR: duplicate reservation IDs and active transaction hashes parse and validate", () => {
  const config = createShopperConfig({
    SHOPPER_ADDRESS: SHOPPER,
    SHOPPER_ALLOWED_ENDPOINT: ENDPOINT,
    SHOPPER_ALLOWED_SELLER: SELLER,
    SHOPPER_ALLOWED_ASSET: ASSET
  });
  const distinct = ledger({
    reservations: [
      reservation("A", TRANSACTION_A),
      reservation("B", TRANSACTION_B)
    ]
  });
  const duplicateIds = ledger({
    reservations: [reservation("A", TRANSACTION_A), reservation("A", TRANSACTION_A)]
  });
  const duplicateTransactions = ledger({
    reservations: [reservation("A", TRANSACTION_A), reservation("B", TRANSACTION_A)]
  });

  assert.doesNotThrow(() => validateLedger(parseLedger(distinct).ledger, config));
  assert.doesNotThrow(() => validateLedger(parseLedger(duplicateIds).ledger, config));
  assert.doesNotThrow(() =>
    validateLedger(parseLedger(duplicateTransactions).ledger, config)
  );
});
