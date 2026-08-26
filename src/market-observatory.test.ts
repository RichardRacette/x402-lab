import assert from "node:assert/strict";
import test from "node:test";
import { createFixtureDataset } from "./market-observatory/fixtures.js";
import {
  analyzeBuyers,
  analyzeMerchant,
  compareEcosystemSnapshots,
  computeMerchantMetrics,
  computeTransactionLevelMerchantMetrics
} from "./market-observatory/metrics.js";
import { normalizeManualObservation } from "./market-observatory/manual.js";
import {
  createMachineDemandReport,
  renderMachineDemandMarkdown,
  scaffoldOpportunityCard
} from "./market-observatory/report.js";
import type {
  EcosystemSnapshot,
  MarketSource,
  MerchantSnapshot
} from "./market-observatory/types.js";
import {
  fetchX402StatsRaw,
  normalizeX402Stats
} from "./market-observatory/x402stats.js";

function merchant(id: string): MerchantSnapshot {
  const found = createFixtureDataset().merchants.find(item => item.id === id);
  if (!found) throw new Error(`Missing fixture merchant ${id}.`);
  return found;
}

function x402StatsFixture(): string {
  return JSON.stringify({
    updatedAt: "2026-08-24T12:00:00.000Z",
    methodologyVersion: "2026-07-01.v1",
    series: [
      {
        date: "2026-08-23",
        sellers: 3,
        transactions: 10,
        volumeUsd: 1.25,
        buyers: 4,
        newSellers: 1
      },
      {
        date: "2026-08-24",
        sellers: 4,
        transactions: 20,
        volumeUsd: 2.25,
        buyers: 6,
        newSellers: 2
      }
    ],
    snapshot: {
      windowDays: 2,
      computedAt: "2026-08-24T12:00:00.000Z",
      sellers: 5,
      volumeUsd: 3.5,
      organicSellers: 2,
      organicVolumeUsd: 2.2,
      medianSellerRevenueUsd: 0.01,
      avgPaymentUsd: 0.1167,
      top10VolumeShare: 0.75,
      facilitatorShare: [
        { facilitator: "fixture-facilitator", volumeUsd: 3.5, share: 1 }
      ]
    },
    history: []
  });
}

test("missing buyers remain missing rather than becoming zero", () => {
  const metrics = computeMerchantMetrics({
    id: "missing-buyers",
    sourceId: "source",
    transactions: 10,
    volumeUsd: 5
  });

  assert.equal(metrics.transactionsPerBuyer.availability, "missing-input");
  assert.equal(metrics.transactionsPerBuyer.value, null);
  assert.equal(metrics.volumePerBuyer.availability, "missing-input");
});

test("division by zero is explicit", () => {
  const metrics = computeMerchantMetrics({
    id: "zero",
    sourceId: "source",
    transactions: 0,
    volumeUsd: 0,
    uniqueBuyers: 0
  });

  assert.equal(metrics.transactionsPerBuyer.availability, "zero-denominator");
  assert.equal(metrics.averageTransactionValue.availability, "zero-denominator");
  assert.equal(metrics.buyersPer100Transactions.availability, "zero-denominator");
});

test("breadth and economic intensity metrics are correct", () => {
  const metrics = computeMerchantMetrics(merchant("fixture-broad-repeat"));

  assert.deepEqual(metrics.transactionsPerBuyer, {
    availability: "available",
    value: 5
  });
  assert.deepEqual(metrics.volumePerBuyer, {
    availability: "available",
    value: 5
  });
  assert.deepEqual(metrics.averageTransactionValue, {
    availability: "available",
    value: 1
  });
});

test("transaction-level concentration is correct", () => {
  const dataset = createFixtureDataset();
  const metrics = computeTransactionLevelMerchantMetrics(
    merchant("fixture-single-buyer"),
    dataset.transactions
  );

  assert.equal(metrics.availability, "available");
  assert.equal(metrics.topBuyerTransactionShare, 1);
  assert.equal(metrics.topBuyerVolumeShare, 1);
  assert.equal(metrics.top3BuyerTransactionShare, 1);
  assert.equal(metrics.medianTransactionsPerBuyer, 40);
});

test("repeat-buyer share is calculated from transaction records", () => {
  const dataset = createFixtureDataset();
  const metrics = computeTransactionLevelMerchantMetrics(
    merchant("fixture-broad-low-repeat"),
    dataset.transactions
  );

  assert.equal(metrics.availability, "available");
  assert.equal(metrics.repeatBuyerCount, 5);
  assert.equal(metrics.repeatBuyerShare, 0.2);
});

test("multi-seller buyers are detected without inferring independence", () => {
  const buyers = analyzeBuyers(createFixtureDataset().transactions);
  const crossSeller = buyers.find(
    buyer => buyer.buyerId === "fixture-cross-seller-buyer"
  );

  assert.equal(crossSeller?.distinctSellers, 2);
  assert.equal(crossSeller?.totalTransactions, 7);
  assert.deepEqual(crossSeller?.flags, ["CROSS_SELLER_SHOPPER"]);
});

test("demand flags distinguish broad, repeat, concentrated, and weak shapes", () => {
  const dataset = createFixtureDataset();
  const broadRepeat = analyzeMerchant(
    merchant("fixture-broad-repeat"),
    dataset.transactions
  );
  const fewRepeat = analyzeMerchant(
    merchant("fixture-few-buyer-repeat"),
    dataset.transactions
  );
  const zero = analyzeMerchant(
    merchant("fixture-zero-demand-catalog"),
    dataset.transactions
  );
  const single = analyzeMerchant(
    merchant("fixture-single-buyer"),
    dataset.transactions
  );

  assert.ok(broadRepeat.flags.includes("BROAD_AND_REPEAT"));
  assert.ok(fewRepeat.flags.includes("CONCENTRATED_REPEAT"));
  assert.ok(zero.flags.includes("LOW_OBSERVED_DEMAND"));
  assert.ok(single.flags.includes("SINGLE_BUYER_DOMINANCE"));
  assert.doesNotMatch(
    [broadRepeat, fewRepeat, zero, single]
      .flatMap(analysis => analysis.flags)
      .join(" "),
    /independent|organic|self-dealing/i
  );
});

test("x402stats normalization preserves raw and organic semantics", () => {
  const dataset = normalizeX402Stats(x402StatsFixture());
  const ecosystem = dataset.ecosystems[0];

  assert.equal(ecosystem.raw.transactions, 30);
  assert.equal(ecosystem.raw.volumeUsd, 3.5);
  assert.equal(ecosystem.raw.buyers, undefined);
  assert.equal(ecosystem.raw.sellers, 5);
  assert.equal(ecosystem.organicHeuristic?.volumeUsd, 2.2);
  assert.equal(ecosystem.organicHeuristic?.sellers, 2);
  assert.notEqual(
    ecosystem.raw.volumeUsd,
    ecosystem.organicHeuristic?.volumeUsd
  );
});

test("x402stats source methodology, attribution, window, and limitations survive normalization", () => {
  const source = normalizeX402Stats(x402StatsFixture()).sources[0];

  assert.equal(source.dataMode, "live");
  assert.equal(source.methodology.version, "2026-07-01.v1");
  assert.equal(source.window.days, 2);
  assert.equal(source.license, "CC BY 4.0");
  assert.match(source.attribution ?? "", /x402stats/);
  assert.ok(source.limitations.some(item => item.includes("buyer")));
});

test("x402stats rejects malformed external shapes", () => {
  const malformed = JSON.parse(x402StatsFixture());
  delete malformed.snapshot.organicVolumeUsd;

  assert.throws(
    () => normalizeX402Stats(JSON.stringify(malformed)),
    /organicVolumeUsd/
  );
});

test("manual observations preserve missing values and source methodology", () => {
  const dataset = normalizeManualObservation({
    schemaVersion: "machine-demand-manual/v1",
    source: {
      id: "manual-source",
      provider: "manual-provider",
      dataMode: "manual",
      observedAt: "2026-08-24T00:00:00.000Z",
      window: { kind: "rolling", label: "30 days", days: 30 },
      methodology: {
        name: "human observation",
        version: "1",
        notes: ["Approximate aggregate values."]
      },
      references: ["https://example.test/source"],
      limitations: ["No transaction records."]
    },
    merchants: [
      {
        id: "manual-merchant",
        sourceId: "manual-source",
        transactions: 10,
        uniqueBuyers: 2
      }
    ],
    resources: [],
    transactions: []
  });

  assert.equal(dataset.sources[0].dataMode, "manual");
  assert.equal(dataset.sources[0].methodology.version, "1");
  assert.equal(dataset.merchants[0].volumeUsd, undefined);
  assert.equal(dataset.merchants[0].categories, undefined);
});

test("manual observations reject records from an undeclared source", () => {
  assert.throws(
    () =>
      normalizeManualObservation({
        schemaVersion: "machine-demand-manual/v1",
        source: {
          id: "manual-source",
          provider: "manual-provider",
          dataMode: "manual",
          observedAt: "2026-08-24T00:00:00.000Z",
          window: { kind: "point", label: "point observation" },
          methodology: { name: "manual", notes: [] },
          references: [],
          limitations: []
        },
        merchants: [{ id: "merchant", sourceId: "other-source" }]
      }),
    /declared source id/
  );
});

test("free collector accepts JSON and rejects unsupported content types", async () => {
  const raw = await fetchX402StatsRaw(
    async () =>
      new Response(x402StatsFixture(), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
  );
  assert.equal(raw, x402StatsFixture());

  await assert.rejects(
    fetchX402StatsRaw(
      async () =>
        new Response("not-json", {
          status: 200,
          headers: { "content-type": "text/plain" }
        })
    ),
    /unsupported content type/
  );
});

test("snapshot comparison refuses incompatible methodologies", () => {
  const dataset = createFixtureDataset();
  const snapshot = dataset.ecosystems[0];
  const beforeSource = dataset.sources[0];
  const afterSource: MarketSource = {
    ...beforeSource,
    methodology: { ...beforeSource.methodology, version: "different" }
  };

  const comparison = compareEcosystemSnapshots(
    snapshot,
    beforeSource,
    snapshot,
    afterSource
  );

  assert.equal(comparison.compatible, false);
  assert.deepEqual(comparison.flags, ["METHODOLOGY_MISMATCH"]);
  assert.equal(comparison.raw.transactions.absolute, undefined);
});

test("compatible snapshot comparison calculates deltas without inventing missing values", () => {
  const dataset = createFixtureDataset();
  const source = dataset.sources[0];
  const before = dataset.ecosystems[0];
  const after: EcosystemSnapshot = {
    ...before,
    raw: { ...before.raw, transactions: 1_100_000, buyers: undefined }
  };

  const comparison = compareEcosystemSnapshots(
    before,
    source,
    after,
    source
  );

  assert.equal(comparison.compatible, true);
  assert.equal(comparison.raw.transactions.absolute, 100_000);
  assert.equal(comparison.raw.transactions.growthRate, 0.1);
  assert.equal(comparison.raw.buyers.absolute, undefined);
});

test("opportunity cards default to UNREVIEWED human judgment", () => {
  const dataset = createFixtureDataset();
  const target = merchant("fixture-broad-repeat");
  const analysis = analyzeMerchant(target, dataset.transactions);
  const card = scaffoldOpportunityCard(
    target,
    analysis,
    dataset.resources.filter(resource => resource.merchantId === target.id)
  );

  assert.equal(card.decision, "UNREVIEWED");
  assert.equal(card.buyVsBuildHypothesis, "HUMAN_REVIEW_REQUIRED");
  assert.equal(card.lawfulSupplyPath, "HUMAN_REVIEW_REQUIRED");
  assert.equal(card.roughUnitEconomics, "HUMAN_REVIEW_REQUIRED");
});

test("JSON and Markdown reports retain modes, caveats, and cross-seller evidence", () => {
  const report = createMachineDemandReport(createFixtureDataset());
  const markdown = renderMachineDemandMarkdown(report);

  assert.equal(report.opportunityCards.length, 5);
  assert.ok(
    report.buyerAnalyses.some(buyer =>
      buyer.flags.includes("CROSS_SELLER_SHOPPER")
    )
  );
  assert.match(markdown, /FIXTURE DATA|Fixture data/i);
  assert.match(markdown, /Raw and organic-heuristic values are intentionally not merged/);
  assert.match(markdown, /UNKNOWN/);
  assert.match(markdown, /UNREVIEWED/);
});
