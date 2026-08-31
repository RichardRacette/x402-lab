import { readFile } from "node:fs/promises";
import {
  createFixtureProviders,
  runRetrievalBenchmark,
  type RetrievalBenchmarkFixture
} from "./retrieval-benchmark.js";

if (!process.argv.includes("--fixtures")) {
  console.error("Only the zero-spend --fixtures benchmark is enabled.");
  process.exitCode = 2;
} else {
  const fixtures = JSON.parse(
    await readFile(new URL("../fixtures/retrieval-benchmark/cases.json", import.meta.url), "utf8")
  ) as RetrievalBenchmarkFixture[];
  const report = await runRetrievalBenchmark(createFixtureProviders(fixtures), fixtures);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.expectationsMatched !== report.cases.length) {
    process.exitCode = 1;
  } else {
    console.log("Retrieval benchmark passed");
  }
}
