import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { correlateReadings } from "./correlate.js";
import {
  assertRenderableSnapshot,
  normalizeBuyerTracePreflightReading,
  normalizeMarketReading,
} from "./normalize.js";
import { scanSensorBay } from "./sensors/availability.js";
import { scanBuyerTracePreflight } from "./sensors/buyer-trace-preflight.js";
import { scanObservatory } from "./sensors/observatory.js";
import { scanQuest } from "./sensors/quest-local.js";
import {
  KIROSHI_SCHEMA_VERSION,
  type KiroshiSnapshot,
} from "./types.js";

export const DEFAULT_OBSERVATORY_PATH = resolve(
  "reports/machine-demand-observatory/live/observatory.json",
);
export const DEFAULT_SNAPSHOT_PATH = resolve("artifacts/kiroshi/snapshot.json");

export async function buildKiroshiSnapshot(
  observatoryPath = DEFAULT_OBSERVATORY_PATH,
): Promise<KiroshiSnapshot> {
  const [
    marketReading,
    buyerTracePreflightReading,
    questReading,
    sensorBayReading,
  ] = await Promise.all([
    scanObservatory(observatoryPath),
    scanBuyerTracePreflight(),
    scanQuest(resolve("package.json")),
    scanSensorBay(),
  ]);
  const market = normalizeMarketReading(marketReading);
  const buyerTracePreflight = normalizeBuyerTracePreflightReading(
    buyerTracePreflightReading,
  );
  const snapshot: KiroshiSnapshot = {
    schemaVersion: KIROSHI_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    pipeline: ["SENSOR", "NORMALIZE", "CORRELATE", "RENDER"],
    marketReading,
    buyerTracePreflightReading,
    questReading,
    sensorBayReading,
    market,
    buyerTracePreflight,
    signals: correlateReadings(
      market,
      buyerTracePreflightReading,
      buyerTracePreflight,
      questReading,
      sensorBayReading,
    ),
  };
  assertRenderableSnapshot(snapshot);
  return snapshot;
}

export async function writeKiroshiSnapshot(
  outputPath = DEFAULT_SNAPSHOT_PATH,
): Promise<KiroshiSnapshot> {
  const snapshot = await buildKiroshiSnapshot();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

async function main(): Promise<void> {
  const snapshot = await writeKiroshiSnapshot();
  console.log(
    `Kiroshi snapshot ready: ${snapshot.market.targets.length} targets, ${snapshot.market.sources.length} sources, ${DEFAULT_SNAPSHOT_PATH}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
