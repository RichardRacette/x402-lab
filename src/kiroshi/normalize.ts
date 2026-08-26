import type {
  BuyerTracePreflightView,
  KiroshiSnapshot,
  MarketSensorData,
  MarketView,
  SensorReading,
  TargetView,
} from "./types.js";
import type { BuyerTracePreflight } from "../buyer-trace-preflight.js";

export function normalizeBuyerTracePreflightReading(
  reading: SensorReading<BuyerTracePreflight>,
): BuyerTracePreflightView {
  const preflight = reading.data;
  const recommendation = preflight.recommendedFirstExperiment;
  const target = preflight.targets.find(
    (candidate) => candidate.id === recommendation.targetId,
  ) ?? null;
  const readyForReview = Boolean(
    target
      && preflight.mode === "DRY_RUN_ONLY"
      && preflight.actualSpendUsd === 0
      && preflight.paymentExecutionAvailable === false
      && target.proposedRequest.sendsPayment === false
      && recommendation.proposedPaidRequestCount > 0
      && Number.isFinite(recommendation.hardMaximumCostUsd)
      && recommendation.hardMaximumCostUsd >= 0
      && recommendation.requiresSeparateOwnerApproval,
  );
  const notExecuted =
    preflight.actualSpendUsd === 0
    && preflight.paymentExecutionAvailable === false;
  const crossSellerSupport =
    preflight.x402scan.expectedSuccessfulResponse.analysisSupport
      .crossSellerAnalysis;
  const insufficientOrUnknown = [
    `PAID RESPONSE: NOT COLLECTED. ${preflight.x402scan.expectedSuccessfulResponse.basis}`,
    `CROSS-SELLER ANALYSIS: ${crossSellerSupport}`,
    ...(preflight.x402scan.pagination.totalCountAvailable
      ? []
      : ["TOTAL ROW COUNT: UNKNOWN — the provider response does not expose a total count."]),
    ...(preflight.x402scan.paymentRequirement.facilitator.startsWith("UNAVAILABLE")
      ? [`FACILITATOR: ${preflight.x402scan.paymentRequirement.facilitator}`]
      : []),
    ...(target
      ? [
          ...target.uncertaintyTransactionDataWouldResolve.map(
            (item) => `TARGET UNCERTAINTY: ${item}`,
          ),
          ...target.paginationAndCoverageLimitations.map(
            (item) => `COVERAGE LIMITATION: ${item}`,
          ),
        ]
      : ["RECOMMENDED TARGET: UNKNOWN — the target manifest is missing."]),
  ];

  return {
    schemaVersion: preflight.schemaVersion,
    observedAt: preflight.generatedAt,
    mode: preflight.mode,
    reviewState: readyForReview ? "READY_FOR_REVIEW" : "INCOMPLETE_PREFLIGHT",
    executionState: notExecuted
      ? "NOT_EXECUTED_NOT_PURCHASED"
      : "EXECUTION_STATE_REQUIRES_REVIEW",
    evidenceState: "PREFLIGHT_ONLY_NO_PAID_RESPONSE",
    actualSpendUsd: preflight.actualSpendUsd,
    paymentExecutionAvailable: preflight.paymentExecutionAvailable,
    recommendedExperiment: {
      target,
      proposedPaidRequestCount: recommendation.proposedPaidRequestCount,
      hardMaximumCostUsd: recommendation.hardMaximumCostUsd,
      requiresSeparateOwnerApproval:
        recommendation.requiresSeparateOwnerApproval,
    },
    paymentReview: {
      resourceTemplate: preflight.x402scan.resourceTemplate,
      unpaidResponse: preflight.x402scan.unpaidResponse,
      requirement: preflight.x402scan.paymentRequirement,
      pagination: preflight.x402scan.pagination,
    },
    compatibility: preflight.currentClientCompatibility,
    expectedResponse: preflight.x402scan.expectedSuccessfulResponse,
    insufficientOrUnknown,
  };
}

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
