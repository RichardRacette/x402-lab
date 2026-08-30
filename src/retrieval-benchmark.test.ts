import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createFixtureProviders,
  runRetrievalBenchmark,
  type RetrievalBenchmarkFixture
} from "./retrieval-benchmark.js";

test("zero-spend retrieval fixture benchmark matches the expected provider matrix", async () => {
  const fixtures = JSON.parse(
    await readFile(new URL("../fixtures/retrieval-benchmark/cases.json", import.meta.url), "utf8")
  ) as RetrievalBenchmarkFixture[];

  const report = await runRetrievalBenchmark(createFixtureProviders(fixtures), fixtures);

  assert.equal(report.externalCostUsd, 0);
  assert.equal(report.cases.length, 15);
  assert.equal(report.expectationsMatched, 15);
  assert.equal(report.providers.find(item => item.providerId === "firecrawl-mock")?.successes, 4);
  assert.equal(report.providers.find(item => item.providerId === "native-fixture")?.successes, 3);
});
