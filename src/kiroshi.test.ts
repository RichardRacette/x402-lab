import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { correlateReadings } from "./kiroshi/correlate.js";
import { normalizeMarketReading } from "./kiroshi/normalize.js";
import { scanSensorBay } from "./kiroshi/sensors/availability.js";
import {
  classifyEvidence,
  scanObservatory,
  validateObservatoryReport,
} from "./kiroshi/sensors/observatory.js";
import { scanQuest } from "./kiroshi/sensors/quest-local.js";
import type { MarketSource } from "./market-observatory/types.js";

const REPORT_PATH = resolve(
  "reports/machine-demand-observatory/live/observatory.json",
);

function source(dataMode: MarketSource["dataMode"], observedAt: string): MarketSource {
  return {
    id: `source-${dataMode}`,
    provider: "test-provider",
    dataMode,
    observedAt,
    window: { kind: "point", label: "test point" },
    methodology: { name: "test methodology", notes: [] },
    references: ["fixture:test"],
    limitations: [],
  };
}

test("Kiroshi rejects any Observatory schema other than machine-demand-observatory/v1", () => {
  assert.throws(
    () => validateObservatoryReport({ schemaVersion: "machine-demand-observatory/v2" }),
    /Unsupported Observatory schema/u,
  );
});

test("provenance classification never presents manual or fixture evidence as live", () => {
  const now = new Date("2026-08-25T00:00:00.000Z");
  assert.equal(
    classifyEvidence(source("live", "2026-08-24T12:00:00.000Z"), now)
      .evidenceState,
    "LIVE_CURRENT",
  );
  assert.equal(
    classifyEvidence(source("live", "2026-08-10T12:00:00.000Z"), now)
      .evidenceState,
    "LIVE_STALE",
  );
  assert.equal(
    classifyEvidence(source("manual", "2026-08-25T00:00:00.000Z"), now)
      .evidenceState,
    "DATED_MANUAL",
  );
  assert.equal(
    classifyEvidence(source("fixture", "2026-08-25T00:00:00.000Z"), now)
      .evidenceState,
    "SYNTHETIC_FIXTURE",
  );
});

test("market view joins existing Observatory analyses without recomputing them", async () => {
  const reading = await scanObservatory(
    REPORT_PATH,
    new Date("2026-08-25T00:00:00.000Z"),
  );
  const view = normalizeMarketReading(reading);
  const blockRun = view.targets.find(
    (target) => target.merchant.id === "round4-blockrun",
  );
  assert.ok(blockRun);
  assert.deepEqual(
    blockRun.analysis,
    reading.data.report.merchantAnalyses.find(
      (analysis) => analysis.merchantId === "round4-blockrun",
    ),
  );
  assert.equal(blockRun.source.evidenceState, "DATED_MANUAL");
  assert.equal(blockRun.analysis.transactionMetrics.availability, "missing-input");
  assert.equal(view.transactionEvidence.liveOrManualRecords, 0);
  assert.equal(view.transactionEvidence.state, "INSUFFICIENT_DATA");
});

test("correlation reports missing live transaction traces instead of zero concentration", async () => {
  const marketReading = await scanObservatory(
    REPORT_PATH,
    new Date("2026-08-25T00:00:00.000Z"),
  );
  const market = normalizeMarketReading(marketReading);
  const quest = await scanQuest("package.json", async (args) => {
    if (args[0] === "status") return "";
    if (args[0] === "branch") return "kiroshi-optics-mk1";
    return "35f63a34b65f5816bae647685e711d75b4b48f40";
  });
  const bay = await scanSensorBay(async () => null);
  const signals = correlateReadings(market, quest, bay);
  const trace = signals.find(
    (signal) => signal.id === "live-transaction-trace-unavailable",
  );
  assert.ok(trace);
  assert.match(trace.detail, /remain UNKNOWN/u);
});

test("Quest Optic uses read-only local commands and does not claim checks ran", async () => {
  const calls: string[][] = [];
  const reading = await scanQuest("package.json", async (args) => {
    calls.push(args);
    if (args[0] === "branch") return "kiroshi-optics-mk1";
    if (args[0] === "rev-parse") return "abc123";
    return "";
  });
  assert.deepEqual(calls, [
    ["branch", "--show-current"],
    ["rev-parse", "HEAD"],
    ["status", "--porcelain"],
  ]);
  assert.equal(reading.data.worktree, "CLEAN");
  assert.ok(reading.data.checks.every((check) => check.state === "AVAILABLE_NOT_RUN"));
  assert.match(reading.limitations.join(" "), /strictly read-only/u);
});

test("Sensor Bay performs injectable presence checks only", async () => {
  const probes: string[][] = [];
  const reading = await scanSensorBay(async (names) => {
    probes.push(names);
    return names.includes("gh") ? "C:\\tools\\gh.exe" : null;
  });
  assert.equal(probes.length, 4);
  assert.equal(
    reading.data.tools.find((tool) => tool.id === "github-cli")?.state,
    "AVAILABLE",
  );
  assert.equal(
    reading.data.tools.find((tool) => tool.id === "trivy")?.state,
    "NOT_DETECTED",
  );
  assert.ok(reading.data.tools.every((tool) => tool.policy.startsWith("DETECT ONLY")));
});
