import { randomUUID } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createFixtureDataset, mergeDatasets } from "./fixtures.js";
import { loadManualObservation } from "./manual.js";
import {
  createMachineDemandReport,
  renderMachineDemandMarkdown
} from "./report.js";
import { fetchX402StatsRaw, normalizeX402Stats } from "./x402stats.js";
import type { MachineDemandReport } from "./types.js";

interface CliArguments {
  command: "fixtures" | "collect-x402stats";
  outputDirectory: string;
  manualObservationPath?: string;
}

function parseArguments(args: string[]): CliArguments {
  const command = args[0];
  if (command !== "fixtures" && command !== "collect-x402stats") {
    throw new Error("Use fixtures or collect-x402stats.");
  }
  let outputDirectory = resolve(
    "reports",
    "machine-demand-observatory",
    command === "fixtures" ? "fixtures" : "live"
  );
  let manualObservationPath =
    command === "collect-x402stats"
      ? resolve("data", "market-observatory", "x402scan-round4-seed.json")
      : undefined;

  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--output") {
      const value = args[++index];
      if (!value) throw new Error("--output requires a directory.");
      outputDirectory = resolve(value);
    } else if (argument === "--manual" && command === "collect-x402stats") {
      const value = args[++index];
      if (!value) throw new Error("--manual requires a JSON file.");
      manualObservationPath = resolve(value);
    } else {
      throw new Error(`Unknown market observatory argument: ${argument}`);
    }
  }
  return { command, outputDirectory, manualObservationPath };
}

async function writeAtomic(path: string, text: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporaryPath, text, { encoding: "utf8", mode: 0o600 });
    await rename(temporaryPath, path);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function writeReport(
  outputDirectory: string,
  report: MachineDemandReport
): Promise<void> {
  await writeAtomic(
    resolve(outputDirectory, "observatory.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );
  await writeAtomic(
    resolve(outputDirectory, "observatory.md"),
    renderMachineDemandMarkdown(report)
  );
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  if (args.command === "fixtures") {
    const report = createMachineDemandReport(createFixtureDataset());
    await writeReport(args.outputDirectory, report);
    console.log("MACHINE DEMAND OBSERVATORY — FIXTURES");
    console.log(`JSON: ${resolve(args.outputDirectory, "observatory.json")}`);
    console.log(`Markdown: ${resolve(args.outputDirectory, "observatory.md")}`);
    console.log("FIXTURE DATA — NOT A LIVE MARKET CLAIM");
    console.log("NO PAYMENT MADE");
    return;
  }

  const raw = await fetchX402StatsRaw();
  const rawPath = resolve(args.outputDirectory, "raw", "x402stats.json");
  // Raw provider evidence is persisted before any normalization occurs.
  await writeAtomic(rawPath, raw);
  const liveDataset = normalizeX402Stats(raw);
  const manualDataset = await loadManualObservation(
    args.manualObservationPath!
  );
  const dataset = mergeDatasets(
    [liveDataset, manualDataset, createFixtureDataset()],
    liveDataset.generatedAt
  );
  const report = createMachineDemandReport(dataset);
  await writeReport(args.outputDirectory, report);

  console.log("MACHINE DEMAND OBSERVATORY — FREE X402STATS");
  console.log(`Raw: ${rawPath}`);
  console.log(`Manual seed: ${args.manualObservationPath}`);
  console.log(`JSON: ${resolve(args.outputDirectory, "observatory.json")}`);
  console.log(`Markdown: ${resolve(args.outputDirectory, "observatory.md")}`);
  console.log("FREE READ-ONLY COLLECTION");
  console.log("NO WALLET OR PAYMENT PATH PRESENT");
}

main().catch(error => {
  console.error("MACHINE DEMAND OBSERVATORY ERROR");
  console.error(error instanceof Error ? error.message : "Unknown error.");
  process.exitCode = 1;
});
