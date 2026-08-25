import type {
  BuyerAnalysis,
  EcosystemComparison,
  EcosystemSnapshot,
  MarketSource,
  MerchantAnalysis,
  MerchantMetrics,
  MerchantSnapshot,
  MetricResult,
  NormalizedMarketDataset,
  SnapshotDelta,
  TransactionLevelMerchantMetrics,
  TransactionSnapshot
} from "./types.js";

function ratio(
  numerator: number | undefined,
  denominator: number | undefined,
  numeratorName: string,
  denominatorName: string,
  multiplier = 1
): MetricResult {
  if (numerator === undefined || denominator === undefined) {
    const missing = [
      numerator === undefined ? numeratorName : undefined,
      denominator === undefined ? denominatorName : undefined
    ].filter(Boolean);
    return {
      availability: "missing-input",
      value: null,
      reason: `Missing ${missing.join(" and ")}.`
    };
  }
  if (denominator === 0) {
    return {
      availability: "zero-denominator",
      value: null,
      reason: `${denominatorName} is zero.`
    };
  }
  return { availability: "available", value: (numerator / denominator) * multiplier };
}

export function computeMerchantMetrics(
  merchant: MerchantSnapshot
): MerchantMetrics {
  return {
    transactionsPerBuyer: ratio(
      merchant.transactions,
      merchant.uniqueBuyers,
      "transactions",
      "unique buyers"
    ),
    volumePerBuyer: ratio(
      merchant.volumeUsd,
      merchant.uniqueBuyers,
      "volume",
      "unique buyers"
    ),
    averageTransactionValue: ratio(
      merchant.volumeUsd,
      merchant.transactions,
      "volume",
      "transactions"
    ),
    buyersPer100Transactions: ratio(
      merchant.uniqueBuyers,
      merchant.transactions,
      "unique buyers",
      "transactions",
      100
    )
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function sumLargest(values: number[], count: number): number {
  return [...values]
    .sort((left, right) => right - left)
    .slice(0, count)
    .reduce((sum, value) => sum + value, 0);
}

export function computeTransactionLevelMerchantMetrics(
  merchant: MerchantSnapshot,
  transactions: TransactionSnapshot[]
): TransactionLevelMerchantMetrics {
  const observed = transactions.filter(
    transaction =>
      transaction.sellerId === merchant.id &&
      transaction.sourceId === merchant.sourceId
  );
  if (observed.length === 0) {
    return {
      availability: "missing-input",
      reason: "No transaction-level records were supplied for this merchant."
    };
  }

  const buyers = new Map<string, { transactions: number; volumeUsd: number }>();
  for (const transaction of observed) {
    const current = buyers.get(transaction.buyerId) ?? {
      transactions: 0,
      volumeUsd: 0
    };
    current.transactions += 1;
    current.volumeUsd += transaction.amountUsd;
    buyers.set(transaction.buyerId, current);
  }

  const transactionCounts = [...buyers.values()].map(value => value.transactions);
  const volumes = [...buyers.values()].map(value => value.volumeUsd);
  const totalVolume = volumes.reduce((sum, value) => sum + value, 0);
  const repeatBuyerCount = transactionCounts.filter(count => count > 1).length;

  return {
    availability: "available",
    observedTransactions: observed.length,
    observedBuyers: buyers.size,
    repeatBuyerCount,
    repeatBuyerShare: buyers.size === 0 ? null : repeatBuyerCount / buyers.size,
    topBuyerTransactionShare:
      observed.length === 0 ? null : Math.max(...transactionCounts) / observed.length,
    topBuyerVolumeShare:
      totalVolume === 0 ? null : Math.max(...volumes) / totalVolume,
    top3BuyerTransactionShare:
      observed.length === 0
        ? null
        : sumLargest(transactionCounts, 3) / observed.length,
    top5BuyerTransactionShare:
      observed.length === 0
        ? null
        : sumLargest(transactionCounts, 5) / observed.length,
    medianTransactionsPerBuyer: median(transactionCounts)
  };
}

function metricValue(metric: MetricResult): number | undefined {
  return metric.availability === "available" ? metric.value : undefined;
}

export function analyzeMerchant(
  merchant: MerchantSnapshot,
  transactions: TransactionSnapshot[]
): MerchantAnalysis {
  const metrics = computeMerchantMetrics(merchant);
  const transactionMetrics = computeTransactionLevelMerchantMetrics(
    merchant,
    transactions
  );
  const flags: MerchantAnalysis["flags"] = [];
  const transactionsPerBuyer = metricValue(metrics.transactionsPerBuyer);

  if (merchant.transactions === 0 || merchant.uniqueBuyers === 0) {
    flags.push("LOW_OBSERVED_DEMAND");
  }
  if ((merchant.uniqueBuyers ?? 0) >= 20) flags.push("BROAD_ADOPTION");
  if (
    transactionsPerBuyer !== undefined &&
    transactionsPerBuyer >= 10 &&
    (merchant.uniqueBuyers ?? Number.POSITIVE_INFINITY) < 20
  ) {
    flags.push("CONCENTRATED_REPEAT");
  }
  if (
    transactionsPerBuyer !== undefined &&
    transactionsPerBuyer >= 5 &&
    (merchant.uniqueBuyers ?? 0) >= 20
  ) {
    flags.push("BROAD_AND_REPEAT");
  }
  if (transactionMetrics.availability === "available") {
    if ((transactionMetrics.topBuyerTransactionShare ?? 0) >= 0.8) {
      flags.push("SINGLE_BUYER_DOMINANCE");
    }
    if ((transactionMetrics.topBuyerTransactionShare ?? 0) >= 0.5) {
      flags.push("CONCENTRATION_RISK");
    }
  }

  return {
    merchantId: merchant.id,
    sourceId: merchant.sourceId,
    metrics,
    transactionMetrics,
    flags
  };
}

export function analyzeBuyers(
  transactions: TransactionSnapshot[]
): BuyerAnalysis[] {
  const buyers = new Map<
    string,
    {
      sourceIds: Set<string>;
      sellers: Map<string, { transactions: number; spendUsd: number }>;
      totalTransactions: number;
      totalSpendUsd: number;
      categories: Set<string>;
    }
  >();

  for (const transaction of transactions) {
    const buyer = buyers.get(transaction.buyerId) ?? {
      sourceIds: new Set<string>(),
      sellers: new Map<string, { transactions: number; spendUsd: number }>(),
      totalTransactions: 0,
      totalSpendUsd: 0,
      categories: new Set<string>()
    };
    buyer.sourceIds.add(transaction.sourceId);
    buyer.totalTransactions += 1;
    buyer.totalSpendUsd += transaction.amountUsd;
    if (transaction.category) buyer.categories.add(transaction.category);
    const seller = buyer.sellers.get(transaction.sellerId) ?? {
      transactions: 0,
      spendUsd: 0
    };
    seller.transactions += 1;
    seller.spendUsd += transaction.amountUsd;
    buyer.sellers.set(transaction.sellerId, seller);
    buyers.set(transaction.buyerId, buyer);
  }

  return [...buyers.entries()]
    .map(([buyerId, buyer]): BuyerAnalysis => ({
      buyerId,
      sourceIds: [...buyer.sourceIds].sort(),
      distinctSellers: buyer.sellers.size,
      totalTransactions: buyer.totalTransactions,
      totalSpendUsd: buyer.totalSpendUsd,
      sellers: [...buyer.sellers.entries()]
        .map(([sellerId, values]) => ({ sellerId, ...values }))
        .sort((left, right) => left.sellerId.localeCompare(right.sellerId)),
      categories: [...buyer.categories].sort(),
      flags: buyer.sellers.size > 1 ? ["CROSS_SELLER_SHOPPER"] : []
    }))
    .sort((left, right) => left.buyerId.localeCompare(right.buyerId));
}

function sourceCompatible(before: MarketSource, after: MarketSource): boolean {
  return (
    before.provider === after.provider &&
    before.methodology.name === after.methodology.name &&
    before.methodology.version === after.methodology.version &&
    before.window.kind === after.window.kind &&
    before.window.days === after.window.days
  );
}

function delta(before: number | undefined, after: number | undefined): SnapshotDelta {
  if (before === undefined || after === undefined) return { before, after };
  return {
    before,
    after,
    absolute: after - before,
    growthRate: before === 0 ? null : (after - before) / before
  };
}

export function compareEcosystemSnapshots(
  before: EcosystemSnapshot,
  beforeSource: MarketSource,
  after: EcosystemSnapshot,
  afterSource: MarketSource
): EcosystemComparison {
  const compatible = sourceCompatible(beforeSource, afterSource);
  if (!compatible) {
    return {
      compatible: false,
      flags: ["METHODOLOGY_MISMATCH"],
      limitations: [
        "Snapshots use incompatible providers, methodologies, or windows; deltas were not calculated."
      ],
      raw: {
        transactions: {},
        volumeUsd: {},
        buyers: {},
        sellers: {}
      },
      organicHeuristic: { volumeUsd: {}, sellers: {} }
    };
  }

  return {
    compatible: true,
    flags: [],
    limitations: [],
    raw: {
      transactions: delta(before.raw.transactions, after.raw.transactions),
      volumeUsd: delta(before.raw.volumeUsd, after.raw.volumeUsd),
      buyers: delta(before.raw.buyers, after.raw.buyers),
      sellers: delta(before.raw.sellers, after.raw.sellers)
    },
    organicHeuristic: {
      volumeUsd: delta(
        before.organicHeuristic?.volumeUsd,
        after.organicHeuristic?.volumeUsd
      ),
      sellers: delta(
        before.organicHeuristic?.sellers,
        after.organicHeuristic?.sellers
      )
    }
  };
}

export function analyzeDataset(dataset: NormalizedMarketDataset): {
  merchants: MerchantAnalysis[];
  buyers: BuyerAnalysis[];
} {
  return {
    merchants: dataset.merchants.map(merchant =>
      analyzeMerchant(merchant, dataset.transactions)
    ),
    buyers: analyzeBuyers(dataset.transactions)
  };
}
