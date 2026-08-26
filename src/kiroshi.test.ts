import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { createBuyerTracePreflight } from "./buyer-trace-preflight.js";
import { correlateReadings } from "./kiroshi/correlate.js";
import {
  normalizeBuyerTracePreflightReading,
  normalizeMarketReading,
} from "./kiroshi/normalize.js";
import { buildKiroshiSnapshot } from "./kiroshi/scan.js";
import { scanSensorBay } from "./kiroshi/sensors/availability.js";
import { scanBuyerTracePreflight } from "./kiroshi/sensors/buyer-trace-preflight.js";
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

async function readFunctionSource(
  path: string,
  startMarker: string,
  endMarker: string,
): Promise<string> {
  const sourceText = await readFile(path, "utf8");
  const start = sourceText.indexOf(startMarker);
  const end = sourceText.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return sourceText.slice(start, end);
}

const EXECUTION_SURFACE_PATTERNS: Array<{
  label: string;
  pattern: RegExp;
}> = [
  {
    label: "action-control",
    pattern: /node\(\s*["']button["']|createElement\(\s*["']button["']|<button\b/iu,
  },
  {
    label: "external-request",
    pattern: /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/iu,
  },
  {
    label: "wallet-or-key",
    pattern: /\bloadPrivateKey\b|\bprivateKeyToAccount\b|\bwalletClient\b|\bprocess\.env\b/iu,
  },
  {
    label: "rpc-or-blockchain",
    pattern: /\bcreatePublicClient\b|\bsendTransaction\b|\bwriteContract\b|\bwaitForTransactionReceipt\b/iu,
  },
  {
    label: "process-execution",
    pattern: /\bexecFile(?:Sync)?\s*\(|\bspawn(?:Sync)?\s*\(/iu,
  },
  {
    label: "operational-mutation",
    pattern: /\bgit\s+push\b|\bnpm\s+(?:install|i)\b|\bdeploy\b/iu,
  },
];

function executionSurfaceFindings(sourceText: string): string[] {
  return EXECUTION_SURFACE_PATTERNS
    .filter(({ pattern }) => pattern.test(sourceText))
    .map(({ label }) => label);
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
  const buyerTraceReading = await scanBuyerTracePreflight();
  const buyerTrace = normalizeBuyerTracePreflightReading(buyerTraceReading);
  const quest = await scanQuest("package.json", async (args) => {
    if (args[0] === "status") return "";
    if (args[0] === "branch") return "kiroshi-optics-mk1";
    return "35f63a34b65f5816bae647685e711d75b4b48f40";
  });
  const bay = await scanSensorBay(async () => null);
  const signals = correlateReadings(
    market,
    buyerTraceReading,
    buyerTrace,
    quest,
    bay,
  );
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

test("Kiroshi Buyer Trace snapshot consumes the repository preflight model", async () => {
  const sourceModel = createBuyerTracePreflight();
  const snapshot = await buildKiroshiSnapshot(REPORT_PATH);
  const normalized = snapshot.buyerTracePreflight;
  const sourceTarget = sourceModel.targets.find(
    (target) => target.id === sourceModel.recommendedFirstExperiment.targetId,
  );

  assert.ok(sourceTarget);
  assert.deepEqual(snapshot.buyerTracePreflightReading.data, sourceModel);
  assert.equal(snapshot.buyerTracePreflightReading.module, "BUYER_TRACE_PREFLIGHT");
  assert.equal(
    snapshot.buyerTracePreflightReading.evidenceRef,
    "src/buyer-trace-preflight.ts#createBuyerTracePreflight",
  );
  assert.equal(normalized.mode, sourceModel.mode);
  assert.equal(normalized.actualSpendUsd, sourceModel.actualSpendUsd);
  assert.equal(
    normalized.paymentExecutionAvailable,
    sourceModel.paymentExecutionAvailable,
  );
  assert.deepEqual(normalized.recommendedExperiment.target, sourceTarget);
  assert.equal(
    normalized.recommendedExperiment.proposedPaidRequestCount,
    sourceModel.recommendedFirstExperiment.proposedPaidRequestCount,
  );
  assert.equal(
    normalized.recommendedExperiment.hardMaximumCostUsd,
    sourceModel.recommendedFirstExperiment.hardMaximumCostUsd,
  );
  assert.equal(
    normalized.recommendedExperiment.requiresSeparateOwnerApproval,
    sourceModel.recommendedFirstExperiment.requiresSeparateOwnerApproval,
  );
  assert.deepEqual(
    normalized.paymentReview.requirement,
    sourceModel.x402scan.paymentRequirement,
  );
  assert.deepEqual(
    normalized.paymentReview.unpaidResponse,
    sourceModel.x402scan.unpaidResponse,
  );
  assert.deepEqual(
    normalized.paymentReview.pagination,
    sourceModel.x402scan.pagination,
  );
  assert.deepEqual(
    normalized.compatibility,
    sourceModel.currentClientCompatibility,
  );
  assert.deepEqual(
    normalized.expectedResponse,
    sourceModel.x402scan.expectedSuccessfulResponse,
  );
  assert.equal(snapshot.schemaVersion, "kiroshi-optics/mk1");
  assert.deepEqual(snapshot.pipeline, [
    "SENSOR",
    "NORMALIZE",
    "CORRELATE",
    "RENDER",
  ]);
  const preflightSignal = snapshot.signals.find(
    (signal) => signal.id === "buyer-trace-preflight-not-evidence",
  );
  assert.ok(preflightSignal);
  assert.match(preflightSignal.title, /READY FOR REVIEW — NOT EXECUTED/u);
  assert.match(
    preflightSignal.detail,
    /No paid Buyer Trace response or purchased evidence has been collected/u,
  );
});

test("Kiroshi Buyer Trace preflight optic exposes operator review fields", async () => {
  const viewerPath = resolve("kiroshi/app.js");
  const viewer = await readFunctionSource(
    viewerPath,
    "function renderBuyerTracePreflight(snapshot)",
    "function renderSources(snapshot)",
  );
  const viewerSource = await readFile(viewerPath, "utf8");
  const requiredLabels = [
    "PREFLIGHT REVIEW STATE",
    "EXECUTED / PURCHASED",
    "PREFLIGHT / NOT EXECUTED",
    "ACTUAL SPEND",
    "PAYMENT EXECUTION",
    "RECOMMENDED TARGET",
    "PROPOSED REQUEST COUNT",
    "HARD MAXIMUM COST",
    "SEPARATE OWNER APPROVAL",
    "CURRENT X402 PAYMENT REQUIREMENT",
    "SHOPPER GATEWAY COMPATIBILITY",
    "LEGACY BUYER COMPATIBILITY",
    "EXPECTED RESPONSE ANALYSIS SUPPORT",
    "INSUFFICIENT / UNKNOWN — REMAINS UNRESOLVED",
  ];
  const requiredSnapshotReads = [
    "preflight.mode",
    "preflight.actualSpendUsd",
    "preflight.paymentExecutionAvailable",
    "target?.name",
    "recommendation.proposedPaidRequestCount",
    "recommendation.hardMaximumCostUsd",
    "recommendation.requiresSeparateOwnerApproval",
    "payment.unpaidResponse",
    "payment.requirement",
    "preflight.compatibility.shopperGateway",
    "preflight.compatibility.legacyBuyer",
    "response.analysisSupport",
    "preflight.insufficientOrUnknown",
  ];

  for (const label of requiredLabels) assert.ok(viewer.includes(label), label);
  for (const read of requiredSnapshotReads) assert.ok(viewer.includes(read), read);
  assert.ok(viewerSource.includes('READY_FOR_REVIEW: "READY FOR REVIEW"'));
  assert.ok(
    viewerSource.includes(
      'NOT_EXECUTED_NOT_PURCHASED: "NOT EXECUTED / NOT PURCHASED"',
    ),
  );
  assert.ok(
    viewerSource.includes(
      'EXECUTION_STATE_REQUIRES_REVIEW: "EXECUTION STATE REQUIRES REVIEW"',
    ),
  );
  assert.match(
    viewer,
    /const executionStateDisplay\s*=\s*preflight\.executionState === "NOT_EXECUTED_NOT_PURCHASED"\s*\?\s*`NO — \$\{displayToken\(preflight\.executionState\)\}`\s*:\s*`REVIEW REQUIRED — \$\{displayToken\(preflight\.executionState\)\}`;/u,
  );
  assert.ok(viewer.includes('node("strong", "", executionStateDisplay)'));
  assert.doesNotMatch(
    viewer,
    /node\("strong", "", `NO — \$\{displayToken\(preflight\.executionState\)\}`\)/u,
  );

  const copiedStrategicConstant =
    /people-data-labs|eip155:8453|0x2EC4545f96A24876764bF2B04D54E66A1351bE71|PRICE_PER_PAGE_USD|0\.01|Endpoint allowlist permits only/u;
  const modelSource = await readFile("src/buyer-trace-preflight.ts", "utf8");
  assert.match(modelSource, copiedStrategicConstant);
  assert.doesNotMatch(viewer, copiedStrategicConstant);
});

test("Kiroshi Buyer Trace preflight optic preserves insufficient and unknown evidence", async () => {
  const reading = await scanBuyerTracePreflight();
  const normalized = normalizeBuyerTracePreflightReading(reading);

  assert.equal(normalized.reviewState, "READY_FOR_REVIEW");
  assert.ok(
    normalized.insufficientOrUnknown.some((item) =>
      item.startsWith("PAID RESPONSE: NOT COLLECTED"),
    ),
  );
  assert.ok(
    normalized.insufficientOrUnknown.some((item) =>
      item.includes("CROSS-SELLER ANALYSIS: INSUFFICIENT"),
    ),
  );
  assert.ok(
    normalized.insufficientOrUnknown.some((item) =>
      item.includes("TOTAL ROW COUNT: UNKNOWN"),
    ),
  );
  assert.ok(
    normalized.insufficientOrUnknown.some((item) =>
      item.includes("FACILITATOR: UNAVAILABLE"),
    ),
  );

  const missingTarget = normalizeBuyerTracePreflightReading({
    ...reading,
    data: { ...reading.data, targets: [] },
  });
  assert.equal(missingTarget.reviewState, "INCOMPLETE_PREFLIGHT");
  assert.equal(missingTarget.recommendedExperiment.target, null);
  assert.ok(
    missingTarget.insufficientOrUnknown.includes(
      "RECOMMENDED TARGET: UNKNOWN — the target manifest is missing.",
    ),
  );

  const paymentSendingReading = {
    ...reading,
    data: {
      ...reading.data,
      targets: reading.data.targets.map((target) =>
        target.id === reading.data.recommendedFirstExperiment.targetId
          ? {
              ...target,
              proposedRequest: {
                ...target.proposedRequest,
                sendsPayment: true,
              },
            }
          : target,
      ),
    },
  } as unknown as typeof reading;
  const paymentSending = normalizeBuyerTracePreflightReading(
    paymentSendingReading,
  );
  assert.equal(paymentSending.reviewState, "INCOMPLETE_PREFLIGHT");

  const nonFiniteMaximum = normalizeBuyerTracePreflightReading({
    ...reading,
    data: {
      ...reading.data,
      recommendedFirstExperiment: {
        ...reading.data.recommendedFirstExperiment,
        hardMaximumCostUsd: Number.POSITIVE_INFINITY,
      },
    },
  });
  assert.equal(nonFiniteMaximum.reviewState, "INCOMPLETE_PREFLIGHT");

  const negativeMaximum = normalizeBuyerTracePreflightReading({
    ...reading,
    data: {
      ...reading.data,
      recommendedFirstExperiment: {
        ...reading.data.recommendedFirstExperiment,
        hardMaximumCostUsd: -1,
      },
    },
  });
  assert.equal(negativeMaximum.reviewState, "INCOMPLETE_PREFLIGHT");
});

test("Kiroshi Buyer Trace preflight optic has no action or payment execution surface", async () => {
  const positiveControl = `
    const action = node("button");
    fetch("https://paid.example");
    loadPrivateKey();
    createPublicClient();
    sendTransaction();
    spawn("deploy");
  `;
  assert.deepEqual(executionSurfaceFindings(positiveControl), [
    "action-control",
    "external-request",
    "wallet-or-key",
    "rpc-or-blockchain",
    "process-execution",
    "operational-mutation",
  ]);

  const [sensorSource, normalizerSource, viewerSource] = await Promise.all([
    readFile("src/kiroshi/sensors/buyer-trace-preflight.ts", "utf8"),
    readFunctionSource(
      "src/kiroshi/normalize.ts",
      "export function normalizeBuyerTracePreflightReading",
      "export function normalizeMarketReading",
    ),
    readFunctionSource(
      "kiroshi/app.js",
      "function renderBuyerTracePreflight(snapshot)",
      "function renderSources(snapshot)",
    ),
  ]);
  assert.deepEqual(
    executionSurfaceFindings(
      [sensorSource, normalizerSource, viewerSource].join("\n"),
    ),
    [],
  );
  assert.deepEqual(
    [...sensorSource.matchAll(/from\s+["']([^"']+)["']/gu)].map(
      (match) => match[1],
    ),
    ["../../buyer-trace-preflight.js", "../types.js"],
  );

  const reading = await scanBuyerTracePreflight();
  assert.equal(reading.data.mode, "DRY_RUN_ONLY");
  assert.equal(reading.data.actualSpendUsd, 0);
  assert.equal(reading.data.paymentExecutionAvailable, false);
  assert.ok(
    reading.data.targets.every(
      (target) => target.proposedRequest.sendsPayment === false,
    ),
  );
});
