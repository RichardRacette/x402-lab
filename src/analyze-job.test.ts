import assert from "node:assert/strict";
import test from "node:test";
import { analyzeJobDescription } from "./analyze-job.js";

test("extracts useful recruiting signals", () => {
  const result = analyzeJobDescription(
    "Senior Software Engineer - Remote",
    "Build TypeScript APIs on AWS with PostgreSQL and Docker."
  );

  assert.equal(result.normalizedTitle, "Senior Software Engineer");
  assert.equal(result.seniority, "senior");
  assert.deepEqual(result.skills, [
    "TypeScript",
    "AWS",
    "PostgreSQL",
    "Docker"
  ]);
  assert.ok(result.confidence >= 0.8);
});

test("keeps the contract useful when skills are unknown", () => {
  const result = analyzeJobDescription(
    "Production Supervisor",
    "Lead a high-volume manufacturing team and improve daily operations."
  );

  assert.equal(result.normalizedTitle, "Production Supervisor");
  assert.ok(result.searchTerms.includes("Production Supervisor"));
});
