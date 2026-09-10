import { mkdir, writeFile } from "node:fs/promises";
import { GhostProbeError, ghostUnsignedRequests, probeGhostUnpaid } from "./ghost-unpaid-probe.js";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(JSON.stringify({ status: "OFFLINE_PLAN_ONLY", paymentAttempts: 0, signingAttempts: 0,
    requests: ghostUnsignedRequests, runFlag: "--run-unpaid" }, null, 2));
} else if (args.length !== 1 || args[0] !== "--run-unpaid") {
  console.error("ARGUMENTS_REFUSED");
  process.exitCode = 1;
} else {
  try {
    const result = await probeGhostUnpaid();
    const dir = `artifacts/ghost-unpaid/${new Date().toISOString().replace(/[:.]/g, "-")}`;
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await writeFile(`${dir}/observation.json`, JSON.stringify(result.report, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    await writeFile(`${dir}/UNTRUSTED-captures.json`, JSON.stringify(result.captures, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    console.log(JSON.stringify({ ...result.report, localReviewDirectory: dir }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "INCONCLUSIVE", paymentAttempts: 0, signingAttempts: 0,
      reason: error instanceof GhostProbeError ? error.code : "LOCAL_OUTPUT_FAILED" }));
    process.exitCode = 1;
  }
}
