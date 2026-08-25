import { analyzeDataset } from "./metrics.js";
import type {
  MachineDemandReport,
  MerchantAnalysis,
  MerchantSnapshot,
  MetricResult,
  NormalizedMarketDataset,
  OpportunityCard,
  ResourceSnapshot
} from "./types.js";

function metricText(metric: MetricResult, digits = 2): string {
  return metric.availability === "available"
    ? metric.value.toFixed(digits)
    : `UNKNOWN (${metric.availability})`;
}

function priceBand(resources: ResourceSnapshot[]): string {
  const prices = resources
    .map(resource => resource.priceUsd)
    .filter((value): value is number => value !== undefined);
  if (prices.length === 0) return "UNKNOWN — human research required";
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum
    ? `$${minimum.toFixed(4)}`
    : `$${minimum.toFixed(4)}–$${maximum.toFixed(4)}`;
}

export function scaffoldOpportunityCard(
  merchant: MerchantSnapshot,
  analysis: MerchantAnalysis,
  resources: ResourceSnapshot[]
): OpportunityCard {
  const transactionMetrics = analysis.transactionMetrics;
  const concentrationCaveat =
    transactionMetrics.availability === "available"
      ? `Top buyer transaction share ${(100 * (transactionMetrics.topBuyerTransactionShare ?? 0)).toFixed(1)}%; top-three share ${(100 * (transactionMetrics.top3BuyerTransactionShare ?? 0)).toFixed(1)}%. Validate buyer independence manually.`
      : "UNKNOWN — aggregate observations do not expose transaction-level buyer concentration.";

  return {
    id: `opportunity-${merchant.id}`,
    merchantId: merchant.id,
    sourceId: merchant.sourceId,
    title: merchant.name ?? merchant.id,
    observedDemandEvidence: [
      `Observed transactions: ${merchant.transactions ?? "UNKNOWN"}.`,
      `Observed unique buyers: ${merchant.uniqueBuyers ?? "UNKNOWN"}.`,
      `Observed volume: ${merchant.volumeUsd === undefined ? "UNKNOWN" : `$${merchant.volumeUsd.toFixed(2)}`}.`,
      `Descriptive flags: ${analysis.flags.join(", ") || "none"}.`
    ],
    representativeResources: resources.map(
      resource => resource.name ?? resource.path ?? resource.id
    ),
    buyerBreadth:
      merchant.uniqueBuyers === undefined
        ? "UNKNOWN — source did not publish buyer breadth"
        : `${merchant.uniqueBuyers} source-defined unique buyers in the stated window`,
    repeatIntensity: metricText(analysis.metrics.transactionsPerBuyer),
    concentrationCaveat,
    currentPriceBand: priceBand(resources),
    buyVsBuildHypothesis: "HUMAN_REVIEW_REQUIRED",
    requiredUpstreamCapability: "HUMAN_REVIEW_REQUIRED",
    competitorsAndSubstitutes: "HUMAN_REVIEW_REQUIRED",
    lawfulSupplyPath: "HUMAN_REVIEW_REQUIRED",
    roughUnitEconomics: "HUMAN_REVIEW_REQUIRED",
    possibleX402LabAdvantage: "HUMAN_REVIEW_REQUIRED",
    cheapestFalsificationTest: "HUMAN_REVIEW_REQUIRED",
    decision: "UNREVIEWED"
  };
}

export function createMachineDemandReport(
  dataset: NormalizedMarketDataset
): MachineDemandReport {
  const analyses = analyzeDataset(dataset);
  const sourceMode = new Map(
    dataset.sources.map(source => [source.id, source.dataMode] as const)
  );
  const opportunityMerchants = [...dataset.merchants]
    .sort((left, right) => {
      const priority = { live: 0, manual: 1, fixture: 2 } as const;
      const leftMode = sourceMode.get(left.sourceId) ?? "fixture";
      const rightMode = sourceMode.get(right.sourceId) ?? "fixture";
      return priority[leftMode] - priority[rightMode];
    })
    .slice(0, 5);
  const opportunityCards = opportunityMerchants.map(merchant => {
    const analysis = analyses.merchants.find(
      candidate =>
        candidate.merchantId === merchant.id &&
        candidate.sourceId === merchant.sourceId
    );
    if (!analysis) throw new Error(`Missing analysis for merchant ${merchant.id}.`);
    return scaffoldOpportunityCard(
      merchant,
      analysis,
      dataset.resources.filter(
        resource =>
          resource.merchantId === merchant.id &&
          resource.sourceId === merchant.sourceId
      )
    );
  });

  return {
    schemaVersion: dataset.schemaVersion,
    generatedAt: dataset.generatedAt,
    dataset,
    merchantAnalyses: analyses.merchants,
    buyerAnalyses: analyses.buyers,
    opportunityCards,
    methodologyNotes: [
      "No single opportunity score is calculated.",
      "Flags describe demand shapes; they do not prove buyer independence or product viability.",
      "BROAD_ADOPTION means at least 20 source-defined unique buyers; BROAD_AND_REPEAT additionally requires at least 5 transactions per buyer.",
      "CONCENTRATED_REPEAT means fewer than 20 source-defined buyers and at least 10 transactions per buyer.",
      "SINGLE_BUYER_DOMINANCE and CONCENTRATION_RISK require transaction-level records and top-buyer shares of at least 80% and 50%, respectively.",
      "Missing source values remain unknown and are not converted to zero.",
      "Live, manual, and fixture sources remain visibly distinct.",
      "Opportunity cards begin UNREVIEWED and require human competition, supply, economics, advantage, and falsification work."
    ]
  };
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function optionalNumber(value: number | undefined, digits = 2): string {
  return value === undefined ? "UNKNOWN" : value.toFixed(digits);
}

function percent(value: number | null | undefined): string {
  return value === undefined || value === null
    ? "UNKNOWN"
    : `${(value * 100).toFixed(1)}%`;
}

export function renderMachineDemandMarkdown(
  report: MachineDemandReport
): string {
  const lines: string[] = [
    "# Machine Demand Observatory",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "> Internal product-discovery evidence. Product #2 remains unknown. Fixture data are analytical controls, not live-market claims.",
    "",
    "## Sources and methodology",
    "",
    "| Source | Mode | Observed | Window | Methodology | Limitations |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const source of report.dataset.sources) {
    lines.push(
      `| ${escapeCell(source.provider)} | ${source.dataMode} | ${source.observedAt} | ${escapeCell(source.window.label)} | ${escapeCell(`${source.methodology.name}${source.methodology.version ? ` ${source.methodology.version}` : ""}`)} | ${escapeCell(source.limitations.join(" "))} |`
    );
  }

  lines.push("", "## Ecosystem context", "");
  if (report.dataset.ecosystems.length === 0) {
    lines.push("No ecosystem snapshot supplied.");
  } else {
    lines.push(
      "| Source | Raw transactions | Raw volume | Raw buyers | Raw sellers | Organic-heuristic volume | Organic-heuristic sellers | Top-10 volume share |",
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"
    );
    for (const ecosystem of report.dataset.ecosystems) {
      lines.push(
        `| ${escapeCell(ecosystem.sourceId)} | ${optionalNumber(ecosystem.raw.transactions, 0)} | ${optionalNumber(ecosystem.raw.volumeUsd)} | ${optionalNumber(ecosystem.raw.buyers, 0)} | ${optionalNumber(ecosystem.raw.sellers, 0)} | ${optionalNumber(ecosystem.organicHeuristic?.volumeUsd)} | ${optionalNumber(ecosystem.organicHeuristic?.sellers, 0)} | ${percent(ecosystem.publishedConcentration?.top10VolumeShare)} |`
      );
    }
  }

  lines.push(
    "",
    "Raw and organic-heuristic values are intentionally not merged. `UNKNOWN` means the source did not provide a compatible value.",
    "",
    "## Merchant demand shapes",
    "",
    "| Merchant | Source mode | Transactions | Buyers | Tx/buyer | Volume/buyer | Top buyer tx share | Flags |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |"
  );

  for (const merchant of report.dataset.merchants) {
    const source = report.dataset.sources.find(item => item.id === merchant.sourceId);
    const analysis = report.merchantAnalyses.find(
      item =>
        item.merchantId === merchant.id && item.sourceId === merchant.sourceId
    );
    if (!analysis) continue;
    lines.push(
      `| ${escapeCell(merchant.name ?? merchant.id)} | ${source?.dataMode ?? "UNKNOWN"} | ${optionalNumber(merchant.transactions, 0)} | ${optionalNumber(merchant.uniqueBuyers, 0)} | ${metricText(analysis.metrics.transactionsPerBuyer)} | ${metricText(analysis.metrics.volumePerBuyer)} | ${analysis.transactionMetrics.availability === "available" ? percent(analysis.transactionMetrics.topBuyerTransactionShare) : "UNKNOWN"} | ${analysis.flags.join(", ") || "none"} |`
    );
  }

  const crossSellerBuyers = report.buyerAnalyses.filter(buyer =>
    buyer.flags.includes("CROSS_SELLER_SHOPPER")
  );
  lines.push("", "## Buyer behavior", "");
  if (crossSellerBuyers.length === 0) {
    lines.push(
      "No cross-seller shopper is observable from the supplied transaction-level data."
    );
  } else {
    lines.push(
      "| Buyer | Source modes | Sellers | Transactions | Spend | Categories |",
      "| --- | --- | ---: | ---: | ---: | --- |"
    );
    for (const buyer of crossSellerBuyers) {
      const sourceModes = buyer.sourceIds
        .map(sourceId =>
          report.dataset.sources.find(source => source.id === sourceId)?.dataMode
        )
        .filter((mode): mode is NonNullable<typeof mode> => mode !== undefined);
      lines.push(
        `| ${escapeCell(buyer.buyerId)} | ${[...new Set(sourceModes)].join(", ")} | ${buyer.distinctSellers} | ${buyer.totalTransactions} | $${buyer.totalSpendUsd.toFixed(2)} | ${escapeCell(buyer.categories.join(", "))} |`
      );
    }
  }

  lines.push("", "## Opportunity-card queue", "");
  for (const card of report.opportunityCards) {
    lines.push(
      `### ${card.title}`,
      "",
      `- Decision: **${card.decision}**`,
      `- Buyer breadth: ${card.buyerBreadth}`,
      `- Repeat intensity: ${card.repeatIntensity}`,
      `- Concentration caveat: ${card.concentrationCaveat}`,
      `- Current price band: ${card.currentPriceBand}`,
      `- Buy-vs-build hypothesis: ${card.buyVsBuildHypothesis}`,
      `- Lawful supply path: ${card.lawfulSupplyPath}`,
      `- Rough unit economics: ${card.roughUnitEconomics}`,
      `- Cheapest falsification test: ${card.cheapestFalsificationTest}`,
      ""
    );
  }

  lines.push("## Interpretation guardrails", "");
  for (const note of report.methodologyNotes) lines.push(`- ${note}`);
  for (const source of report.dataset.sources) {
    if (source.attribution) lines.push(`- Attribution: ${source.attribution}.`);
  }
  return `${lines.join("\n")}\n`;
}
