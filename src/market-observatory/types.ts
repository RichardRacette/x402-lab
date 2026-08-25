export const OBSERVATORY_SCHEMA_VERSION = "machine-demand-observatory/v1";

export type DataMode = "live" | "manual" | "fixture";

export interface SourceWindow {
  kind: "rolling" | "calendar" | "point" | "unknown";
  label: string;
  days?: number;
  start?: string;
  end?: string;
}

export interface MarketSource {
  id: string;
  provider: string;
  dataMode: DataMode;
  observedAt: string;
  window: SourceWindow;
  methodology: {
    name: string;
    version?: string;
    notes: string[];
  };
  references: string[];
  attribution?: string;
  license?: string;
  limitations: string[];
}

export interface EcosystemSnapshot {
  id: string;
  sourceId: string;
  raw: {
    transactions?: number;
    volumeUsd?: number;
    buyers?: number;
    sellers?: number;
  };
  organicHeuristic?: {
    label: string;
    volumeUsd?: number;
    sellers?: number;
  };
  publishedEconomics?: {
    averagePaymentUsd?: number;
    medianSellerRevenueUsd?: number;
  };
  publishedConcentration?: {
    top10VolumeShare?: number;
  };
  facilitatorShares?: Array<{
    facilitator: string;
    volumeUsd?: number;
    share?: number;
  }>;
}

export interface MerchantSnapshot {
  id: string;
  sourceId: string;
  name?: string;
  description?: string;
  addresses?: string[];
  categories?: string[];
  resourceCount?: number;
  transactions?: number;
  volumeUsd?: number;
  uniqueBuyers?: number;
  latestActivity?: string;
  networks?: string[];
  facilitators?: string[];
  notes?: string[];
}

export interface ResourceSnapshot {
  id: string;
  sourceId: string;
  merchantId: string;
  name?: string;
  path?: string;
  method?: string;
  description?: string;
  categories?: string[];
  priceUsd?: number;
  protocolVersion?: string;
  network?: string;
  access?: "public" | "paid" | "authenticated" | "unknown";
}

export interface TransactionSnapshot {
  id: string;
  sourceId: string;
  buyerId: string;
  sellerId: string;
  amountUsd: number;
  timestamp: string;
  chain?: string;
  facilitator?: string;
  category?: string;
}

export interface NormalizedMarketDataset {
  schemaVersion: typeof OBSERVATORY_SCHEMA_VERSION;
  generatedAt: string;
  sources: MarketSource[];
  ecosystems: EcosystemSnapshot[];
  merchants: MerchantSnapshot[];
  resources: ResourceSnapshot[];
  transactions: TransactionSnapshot[];
}

export type MetricResult =
  | { availability: "available"; value: number }
  | {
      availability: "missing-input" | "zero-denominator";
      value: null;
      reason: string;
    };

export interface MerchantMetrics {
  transactionsPerBuyer: MetricResult;
  volumePerBuyer: MetricResult;
  averageTransactionValue: MetricResult;
  buyersPer100Transactions: MetricResult;
}

export interface TransactionLevelMerchantMetrics {
  availability: "available" | "missing-input";
  reason?: string;
  observedTransactions?: number;
  observedBuyers?: number;
  repeatBuyerCount?: number;
  repeatBuyerShare?: number | null;
  topBuyerTransactionShare?: number | null;
  topBuyerVolumeShare?: number | null;
  top3BuyerTransactionShare?: number | null;
  top5BuyerTransactionShare?: number | null;
  medianTransactionsPerBuyer?: number | null;
}

export type DemandShapeFlag =
  | "BROAD_ADOPTION"
  | "CONCENTRATED_REPEAT"
  | "BROAD_AND_REPEAT"
  | "LOW_OBSERVED_DEMAND"
  | "SINGLE_BUYER_DOMINANCE"
  | "CONCENTRATION_RISK";

export interface MerchantAnalysis {
  merchantId: string;
  sourceId: string;
  metrics: MerchantMetrics;
  transactionMetrics: TransactionLevelMerchantMetrics;
  flags: DemandShapeFlag[];
}

export interface BuyerAnalysis {
  buyerId: string;
  sourceIds: string[];
  distinctSellers: number;
  totalTransactions: number;
  totalSpendUsd: number;
  sellers: Array<{
    sellerId: string;
    transactions: number;
    spendUsd: number;
  }>;
  categories: string[];
  flags: Array<"CROSS_SELLER_SHOPPER">;
}

export type OpportunityDecision =
  | "UNREVIEWED"
  | "REJECT"
  | "RESEARCH"
  | "TEST";

export interface OpportunityCard {
  id: string;
  merchantId: string;
  sourceId: string;
  title: string;
  observedDemandEvidence: string[];
  representativeResources: string[];
  buyerBreadth: string;
  repeatIntensity: string;
  concentrationCaveat: string;
  currentPriceBand: string;
  buyVsBuildHypothesis: string;
  requiredUpstreamCapability: string;
  competitorsAndSubstitutes: string;
  lawfulSupplyPath: string;
  roughUnitEconomics: string;
  possibleX402LabAdvantage: string;
  cheapestFalsificationTest: string;
  decision: OpportunityDecision;
}

export interface SnapshotDelta {
  before?: number;
  after?: number;
  absolute?: number;
  growthRate?: number | null;
}

export interface EcosystemComparison {
  compatible: boolean;
  flags: Array<"METHODOLOGY_MISMATCH">;
  limitations: string[];
  raw: {
    transactions: SnapshotDelta;
    volumeUsd: SnapshotDelta;
    buyers: SnapshotDelta;
    sellers: SnapshotDelta;
  };
  organicHeuristic: {
    volumeUsd: SnapshotDelta;
    sellers: SnapshotDelta;
  };
}

export interface MachineDemandReport {
  schemaVersion: typeof OBSERVATORY_SCHEMA_VERSION;
  generatedAt: string;
  dataset: NormalizedMarketDataset;
  merchantAnalyses: MerchantAnalysis[];
  buyerAnalyses: BuyerAnalysis[];
  opportunityCards: OpportunityCard[];
  methodologyNotes: string[];
}
