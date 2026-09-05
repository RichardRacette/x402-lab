import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);

test("Buyer Trace CLI previews offline with no payment authorization", async () => {
  const { stdout } = await run(process.execPath, ["--import", "tsx", "src/buyer-trace-cli.ts"]);
  const result = JSON.parse(stdout);
  assert.equal(result.mode, "dry-run");
  assert.equal(result.audit.authorizedSpendUsd, 0);
  assert.equal(result.audit.paymentAttempts, 0);
});

test("Buyer Trace CLI refuses explicit execution and unexpected arguments", async () => {
  for (const args of [["--execute"], ["--url", "https://example.org/collect"]]) {
    await assert.rejects(run(process.execPath, ["--import", "tsx", "src/buyer-trace-cli.ts", ...args]));
  }
});
