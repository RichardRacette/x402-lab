import type {
  KiroshiSnapshot,
  MarketSensorData,
  MarketView,
  SensorReading,
  TargetView,
} from "./types.js";

export function normalizeMarketReading(
  reading: SensorReading<MarketSensorData>,
): MarketView {
  const { report, sources } = reading.data;
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const analysisByMerchant = new Map(
    report.merchantAnalyses.map((analysis) => [analysis.merchantId, analysis]),
  );
  const cardByMerchant = new Map(
    report.opportunityCards.map((card) => [card.merchantId, card]),
  );

  const targets: TargetView[] = report.dataset.merchants.flatMap((merchant) => {
    const source = sourceById.get(merchant.sourceId);
    const analysis = analysisByMerchant.get(merchant.id);
    if (!source || !analysis) return [];

    return [
      {
        merchant,
        source,
        analysis,
        resources: report.dataset.resources.filter(
          (resource) => resource.merchantId === merchant.id,
        ),
        opportunityCard: cardByMerchant.get(merchant.id) ?? null,
      },
    ];
  });

  const liveOrManualSourceIds = new Set(
    sources
      .filter((source) => source.dataMode !== "fixture")
      .map((source) => source.id),
  );
  const liveOrManualRecords = report.dataset.transactions.filter((transaction) =>
    liveOrManualSourceIds.has(transaction.sourceId),
  ).length;
  const fixtureRecords = report.dataset.transactions.length - liveOrManualRecords;

  return {
    generatedAt: report.generatedAt,
    sources,
    ecosystems: report.dataset.ecosystems.flatMap((snapshot) => {
      const source = sourceById.get(snapshot.sourceId);
      return source ? [{ snapshot, source }] : [];
    }),
    targets,
    methodologyNotes: report.methodologyNotes,
    transactionEvidence: {
      liveOrManualRecords,
      fixtureRecords,
      state: liveOrManualRecords > 0 ? "AVAILABLE" : "INSUFFICIENT_DATA",
      explanation:
        liveOrManualRecords > 0
          ? "Transaction-level records are available for at least one non-fixture source."
          : "INSUFFICIENT DATA — live/manual sources expose aggregate observations, not buyer-level transactions. Fixture traces are test evidence only.",
    },
  };
}

export function assertRenderableSnapshot(snapshot: KiroshiSnapshot): void {
  if (!snapshot.market.sources.length) {
    throw new Error("Kiroshi cannot render a market scan without source provenance.");
  }
  if (!snapshot.market.targets.length) {
    throw new Error("Kiroshi cannot render a target scan without merchant analyses.");
  }
}
