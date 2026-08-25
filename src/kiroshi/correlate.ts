import type {
  CorrelatedSignal,
  MarketView,
  QuestData,
  SensorBayData,
  SensorReading,
} from "./types.js";

export function correlateReadings(
  market: MarketView,
  quest: SensorReading<QuestData>,
  sensorBay: SensorReading<SensorBayData>,
): CorrelatedSignal[] {
  const signals: CorrelatedSignal[] = [];

  for (const source of market.sources) {
    if (source.evidenceState === "LIVE_STALE") {
      signals.push({
        id: `stale-${source.id}`,
        severity: "CAUTION",
        title: "LIVE SENSOR IS STALE",
        detail: `${source.provider} was observed ${Math.floor(source.ageHours)} hours ago. Refresh at the Observatory layer before relying on it.`,
        evidenceRefs: source.references,
      });
    }
    if (source.evidenceState === "DATED_MANUAL") {
      signals.push({
        id: `manual-${source.id}`,
        severity: "NOTICE",
        title: "DATED MANUAL EVIDENCE",
        detail: `${source.provider} is a research seed, not a live collection.`,
        evidenceRefs: source.references,
      });
    }
  }

  if (market.transactionEvidence.state === "INSUFFICIENT_DATA") {
    signals.push({
      id: "live-transaction-trace-unavailable",
      severity: "CAUTION",
      title: "BUYER TRACE: INSUFFICIENT DATA",
      detail:
        "Live/manual evidence has no transaction-level buyer records; buyer concentration and cross-seller behavior remain UNKNOWN.",
      evidenceRefs: ["observatory.dataset.transactions"],
    });
  }

  if (quest.data.worktree === "DIRTY") {
    signals.push({
      id: "quest-dirty-worktree",
      severity: "INFO",
      title: "QUEST WORKTREE IN PROGRESS",
      detail: "The local worktree contains uncommitted checkpoint work.",
      evidenceRefs: [quest.evidenceRef],
    });
  }

  const available = sensorBay.data.tools.filter(
    (tool) => tool.state === "AVAILABLE",
  ).length;
  signals.push({
    id: "sensor-bay-readiness",
    severity: "INFO",
    title: "SENSOR BAY IS PASSIVE",
    detail: `${available}/${sensorBay.data.tools.length} optional tool categories detected. Detection is not integration and no scans ran.`,
    evidenceRefs: [sensorBay.evidenceRef],
  });

  return signals;
}
