import { readFile } from "node:fs/promises";
import {
  OBSERVATORY_SCHEMA_VERSION,
  type MachineDemandReport,
  type MarketSource,
} from "../../market-observatory/types.js";
import type {
  EvidenceState,
  MarketSensorData,
  SensorReading,
  SourceView,
} from "../types.js";

const HOUR_MS = 60 * 60 * 1_000;

export function classifyEvidence(
  source: MarketSource,
  now: Date,
): Pick<SourceView, "evidenceState" | "ageHours"> {
  const ageHours = Math.max(
    0,
    (now.getTime() - new Date(source.observedAt).getTime()) / HOUR_MS,
  );

  let evidenceState: EvidenceState;
  if (source.dataMode === "manual") evidenceState = "DATED_MANUAL";
  else if (source.dataMode === "fixture") evidenceState = "SYNTHETIC_FIXTURE";
  else if (ageHours <= 24) evidenceState = "LIVE_CURRENT";
  else if (ageHours <= 168) evidenceState = "LIVE_AGING";
  else evidenceState = "LIVE_STALE";

  return { evidenceState, ageHours };
}

export function validateObservatoryReport(value: unknown): MachineDemandReport {
  if (!value || typeof value !== "object") {
    throw new Error("Observatory report must be a JSON object.");
  }

  const report = value as Partial<MachineDemandReport>;
  if (report.schemaVersion !== OBSERVATORY_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported Observatory schema: ${String(report.schemaVersion)}; expected ${OBSERVATORY_SCHEMA_VERSION}.`,
    );
  }
  if (report.dataset?.schemaVersion !== OBSERVATORY_SCHEMA_VERSION) {
    throw new Error("Observatory dataset schema does not match the report schema.");
  }
  if (
    !Array.isArray(report.dataset.sources) ||
    !Array.isArray(report.dataset.merchants) ||
    !Array.isArray(report.merchantAnalyses)
  ) {
    throw new Error("Observatory report is missing normalized market collections.");
  }
  return report as MachineDemandReport;
}

export async function scanObservatory(
  reportPath: string,
  now = new Date(),
): Promise<SensorReading<MarketSensorData>> {
  const raw = await readFile(reportPath, "utf8");
  const report = validateObservatoryReport(JSON.parse(raw) as unknown);
  const sources = report.dataset.sources.map((source) => ({
    ...source,
    ...classifyEvidence(source, now),
  }));
  const staleLive = sources.some(
    (source) => source.evidenceState === "LIVE_STALE",
  );

  return {
    sensorId: "observatory-v1",
    module: "MARKET",
    observedAt: report.generatedAt,
    source: "Machine Demand Observatory normalized export",
    sourceVersion: report.schemaVersion,
    scope: "Normalized ecosystem, merchant, resource, and deterministic analysis evidence",
    evidenceRef: reportPath,
    status: staleLive ? "STALE" : "OK",
    limitations: [
      "This sensor reads the normalized Observatory report and never the raw provider file.",
      "Provider methodologies and evidence modes remain attached to every source.",
    ],
    data: { report, sources },
  };
}
