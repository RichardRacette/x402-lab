import type {
  EcosystemSnapshot,
  MachineDemandReport,
  MarketSource,
  MerchantAnalysis,
  MerchantSnapshot,
  OpportunityCard,
  ResourceSnapshot,
} from "../market-observatory/types.js";

export const KIROSHI_SCHEMA_VERSION = "kiroshi-optics/mk1" as const;

export type SensorStatus =
  | "OK"
  | "UNKNOWN"
  | "STALE"
  | "ERROR"
  | "UNAVAILABLE";

export type EvidenceState =
  | "LIVE_CURRENT"
  | "LIVE_AGING"
  | "LIVE_STALE"
  | "DATED_MANUAL"
  | "SYNTHETIC_FIXTURE";

export interface SensorReading<T> {
  sensorId: string;
  module: "MARKET" | "QUEST" | "SENSOR_BAY";
  observedAt: string;
  source: string;
  sourceVersion?: string;
  scope: string;
  evidenceRef: string;
  status: SensorStatus;
  limitations: string[];
  data: T;
}

export interface Sensor<T> {
  readonly id: string;
  scan(): Promise<SensorReading<T>>;
}

export interface SourceView extends MarketSource {
  evidenceState: EvidenceState;
  ageHours: number;
}

export interface MarketSensorData {
  report: MachineDemandReport;
  sources: SourceView[];
}

export interface TargetView {
  merchant: MerchantSnapshot;
  source: SourceView;
  analysis: MerchantAnalysis;
  resources: ResourceSnapshot[];
  opportunityCard: OpportunityCard | null;
}

export interface MarketView {
  generatedAt: string;
  sources: SourceView[];
  ecosystems: Array<{
    snapshot: EcosystemSnapshot;
    source: SourceView;
  }>;
  targets: TargetView[];
  methodologyNotes: string[];
  transactionEvidence: {
    liveOrManualRecords: number;
    fixtureRecords: number;
    state: "INSUFFICIENT_DATA" | "AVAILABLE";
    explanation: string;
  };
}

export interface QuestData {
  branch: string | null;
  head: string | null;
  worktree: "CLEAN" | "DIRTY" | "UNKNOWN";
  checks: Array<{
    name: "test" | "typecheck";
    state: "AVAILABLE_NOT_RUN" | "UNAVAILABLE";
    command: string | null;
  }>;
  activeIssues: Array<{
    number: 15 | 16;
    title: string;
    state: "CHECKPOINT_PASSED" | "ACTIVE";
    url: string;
  }>;
}

export interface SensorBayTool {
  id: string;
  category: string;
  state: "AVAILABLE" | "NOT_DETECTED";
  executable: string | null;
  capability: string;
  policy: string;
}

export interface SensorBayData {
  tools: SensorBayTool[];
  futureCategories: Array<{
    category: string;
    state: "PRESENT" | "ABSENT";
  }>;
}

export interface CorrelatedSignal {
  id: string;
  severity: "INFO" | "NOTICE" | "CAUTION";
  title: string;
  detail: string;
  evidenceRefs: string[];
}

export interface KiroshiSnapshot {
  schemaVersion: typeof KIROSHI_SCHEMA_VERSION;
  generatedAt: string;
  pipeline: ["SENSOR", "NORMALIZE", "CORRELATE", "RENDER"];
  marketReading: SensorReading<MarketSensorData>;
  questReading: SensorReading<QuestData>;
  sensorBayReading: SensorReading<SensorBayData>;
  market: MarketView;
  signals: CorrelatedSignal[];
}
