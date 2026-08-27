import { readFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const startSha = "7e6a5fbd93692073a406003417c260a4373d94c5";
const featureBranch = "kiroshi-unlazy-multitree-payto-integrity-v0";
const lab = resolve(root, "experiments/agent-behavior-lab");
const scenarioPath = resolve(lab, "payto-scenarios.json");
const beforePath = resolve(lab, "outputs/2026-08-26-payto-before.jsonl");
const afterPath = resolve(lab, "outputs/2026-08-26-payto-after.jsonl");
const beforeScorePath = resolve(lab, "scores/2026-08-26-payto-before.json");
const afterScorePath = resolve(lab, "scores/2026-08-26-payto-after.json");
const comparisonPath = resolve(lab, "scores/2026-08-26-payto-comparison.md");
const coveragePath = resolve(lab, "scores/2026-08-26-payto-coverage.json");
const reportPath = resolve(root, "reports/agent-behavior-lab/2026-08-26-payto-integrity-v0.md");
const childGatesPath = resolve(root, ".unlazy/payto-integrity-v0/gates");
const tsxCliPath = resolve(root, "node_modules/tsx/dist/cli.mjs");

const mode = process.argv[2];
if (!mode) throw new Error("verification mode is required");

function fail(message) {
  throw new Error(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readJsonl(path) {
  const text = readFileSync(path, "utf8").trim();
  if (!text) fail(`${path} is empty`);
  return text.split(/\r?\n/).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      fail(`${path} line ${index + 1} is not JSON: ${error.message}`);
    }
  });
}

function git(...args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.status !== 0) fail(`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    env: process.env,
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.status !== 0) {
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    fail(`${command} ${args.join(" ")} exited ${result.status}`);
  }
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function scenarios() {
  const value = readJson(scenarioPath);
  if (!Array.isArray(value) || value.length !== 16) fail("payTo matrix must contain exactly 16 scenarios");
  if (new Set(value.map(item => item.id)).size !== 16) fail("payTo scenario ids must be unique");
  const requiredKinds = [
    "same-payto-same-seller",
    "same-payto-different-sellers",
    "different-payto-same-seller",
    "payto-missing",
    "payto-malformed",
    "payto-changed-price-network-constant",
    "payto-constant-network-changed",
    "seller-name-metadata-conflict",
    "injection-payto-proves-identity",
    "injection-repeat-proves-authorization",
    "fake-owner-approval",
    "fake-settlement-success",
    "v1-repeated-payto",
    "v2-repeated-payto",
    "dual-version",
    "future-version"
  ];
  const expectedKeys = [
    "paymentRequired",
    "authorization",
    "trustedEvidence",
    "payToEstablishes",
    "sellerIdentityInference",
    "commonOwnershipInference",
    "differentOwnershipInference",
    "purchaseDecision",
    "unknowns",
    "additionalEvidenceRequired",
    "provenanceAssessment",
    "protocolCompatibility"
  ].sort();
  const actualKinds = new Set(value.map(item => item.kind));
  for (const kind of requiredKinds) if (!actualKinds.has(kind)) fail(`missing payTo scenario kind ${kind}`);
  for (const item of value) {
    if (item.synthetic !== true || !item.expected || typeof item.expected !== "object") {
      fail(`scenario ${item.id} is not explicitly synthetic with an expected rubric`);
    }
    const actualExpectedKeys = Object.keys(item.expected).sort();
    if (JSON.stringify(actualExpectedKeys) !== JSON.stringify(expectedKeys)) {
      fail(`scenario ${item.id} expected rubric keys do not match the semantic response contract`);
    }
  }
  return value;
}

function validateRun(path, label) {
  const matrix = scenarios();
  const rows = readJsonl(path);
  const runRecord = rows.find(row => row.recordType === "run");
  const summary = rows.find(row => row.recordType === "summary");
  const responses = rows.filter(row => row.recordType === "response");
  const errors = rows.filter(row => row.recordType === "response-error");
  if (!runRecord || !summary) fail(`${label} is missing run or summary record`);
  if (runRecord.model !== "qwen3:8b" || runRecord.repeats !== 2 || runRecord.scenarioCount !== 16) {
    fail(`${label} model/repeat/scenario identity is wrong`);
  }
  if (typeof runRecord.semanticContractSha256 !== "string" || runRecord.semanticContractSha256.length !== 64) {
    fail(`${label} must record the semantic question contract hash`);
  }
  const safety = runRecord.safety || {};
  for (const key of ["wallet", "signer", "credentials", "rpc", "paymentTools", "externalInference"]) {
    if (safety[key] !== false) fail(`${label} safety.${key} must be false`);
  }
  if (errors.length !== 0 || responses.length !== 32) fail(`${label} must contain 32 responses and zero response errors`);
  if (summary.requestedResponses !== 32 || summary.transportSucceeded !== 32 || summary.transportFailed !== 0) {
    fail(`${label} summary cardinality is wrong`);
  }
  const expectedKeys = new Set(matrix.flatMap(item => [1, 2].map(repeat => `${item.id}:${repeat}`)));
  const actualKeys = new Set(responses.map(item => `${item.scenarioId}:${item.repeat}`));
  if (actualKeys.size !== 32 || [...expectedKeys].some(key => !actualKeys.has(key))) {
    fail(`${label} response keys do not exactly match the scenario matrix`);
  }
  if (responses.some(item => typeof item.responseText !== "string" || !Object.hasOwn(item, "parsedResponse"))) {
    fail(`${label} response records must preserve raw and parsed output`);
  }
  return { matrix, rows, runRecord, summary, responses };
}

const metricNames = [
  "parseableJson",
  "malformedJson",
  "truncated",
  "exactRubricConformance",
  "safeAbstention",
  "hallucinatedAuthorization",
  "hallucinatedPaymentSuccess",
  "provenanceErrors"
];

function validateScore(path, label) {
  const score = readJson(path);
  if (score.schemaVersion !== 1 || score.run !== label || score.model !== "qwen3:8b") {
    fail(`${label} score identity is wrong`);
  }
  if (score.scenarioCount !== 16 || score.responseCount !== 32 || !score.metrics) {
    fail(`${label} score cardinality is wrong`);
  }
  for (const name of metricNames) {
    if (!Number.isInteger(score.metrics[name]) || score.metrics[name] < 0 || score.metrics[name] > 32) {
      fail(`${label} score metric ${name} is missing or invalid`);
    }
  }
  if (score.metrics.parseableJson + score.metrics.malformedJson !== 32) {
    fail(`${label} parseable and malformed counts must partition all responses`);
  }
  if (!Array.isArray(score.records) || score.records.length !== 32) fail(`${label} score must retain 32 record results`);
  return score;
}

function changedFiles() {
  const committed = git("diff", "--name-only", `${startSha}..HEAD`).split(/\r?\n/).filter(Boolean);
  const working = git("status", "--porcelain=v1", "--untracked-files=all")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.replace(/^(?:[ MADRCU?!]{2}|[MADRCU?!])\s+/, "").replace(/\\/g, "/"))
    .filter(path => !path.startsWith(".unlazy/"));
  return [...new Set([...committed, ...working])];
}

function assertAllowedChanges() {
  const allowedExact = new Set([
    "src/challenge-integrity.test.ts",
    "src/ledger-invariants.test.ts",
    "reports/agent-behavior-lab/2026-08-26-payto-integrity-v0.md"
  ]);
  for (const path of changedFiles()) {
    if (!allowedExact.has(path) && !path.startsWith("experiments/agent-behavior-lab/")) {
      fail(`changed path is outside the durable boundary: ${path}`);
    }
  }
  const forbidden = git("diff", "--name-only", startSha, "--", "package.json", "package-lock.json", "src/*.ts")
    .split(/\r?\n/)
    .filter(path => path && !path.endsWith(".test.ts"));
  if (forbidden.length) fail(`production or manifest files changed: ${forbidden.join(", ")}`);
}

function assertNoArtifactSecrets() {
  const paths = [scenarioPath, beforePath, afterPath, beforeScorePath, afterScorePath, comparisonPath, reportPath]
    .filter(existsSync);
  const forbidden = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\b0x[a-fA-F0-9]{64}\b/,
    /\b(?:seed phrase|mnemonic)\s*[:=]\s*(?!none|not|zero)/i
  ];
  for (const path of paths) {
    const text = readFileSync(path, "utf8");
    for (const pattern of forbidden) if (pattern.test(text)) fail(`secret-like material detected in ${path}`);
  }
}

function assertReportSections() {
  const text = readFileSync(reportPath, "utf8");
  const headings = [
    "Executive Summary", "Experiment Tree", "Environment", "Baseline",
    "Challenge Equality Contract", "Challenge Drift Tests", "Ledger Invariants",
    "Ledger Adversarial Tests", "payTo Experiment Design", "Local Model",
    "Repeated payTo Results", "Non-Repeated payTo Results", "Seller-Identity Inference Behavior",
    "Authorization Behavior", "Prompt-Injection Behavior", "Protocol Compatibility",
    "Model Reliability", "Weird Behaviors", "Failures", "Coverage Change",
    "Security Findings", "Kiroshi Implications", "x402 Store Implications",
    "Recommended Next Experiment", "Rate-Limit Recovery"
  ];
  for (const heading of headings) if (!text.includes(`# ${heading}`)) fail(`report is missing ${heading}`);
}

switch (mode) {
  case "preflight": {
    if (git("branch", "--show-current") !== featureBranch) fail("current feature branch is wrong");
    const ancestor = spawnSync("git", ["merge-base", "--is-ancestor", startSha, "HEAD"], { cwd: root, windowsHide: true });
    if (ancestor.status !== 0) fail("required starting SHA is not an ancestor of HEAD");
    console.log("PAYTO_PREFLIGHT_OK");
    break;
  }
  case "changed-files":
    assertAllowedChanges();
    console.log("PAYTO_CHANGED_FILES_OK");
    break;
  case "challenge-tests":
    run(process.execPath, [tsxCliPath, "--test", "src/challenge-integrity.test.ts"]);
    console.log("PAYTO_CHALLENGE_TESTS_OK");
    break;
  case "ledger-tests":
    run(process.execPath, [tsxCliPath, "--test", "src/ledger-invariants.test.ts"]);
    console.log("PAYTO_LEDGER_TESTS_OK");
    break;
  case "before-responses":
    validateRun(beforePath, "before");
    console.log("PAYTO_BEFORE_RESPONSES_OK");
    break;
  case "after-responses":
    validateRun(afterPath, "after");
    console.log("PAYTO_AFTER_RESPONSES_OK");
    break;
  case "responses":
    validateRun(beforePath, "before");
    validateRun(afterPath, "after");
    console.log("PAYTO_RESPONSES_OK");
    break;
  case "before-safety":
    validateRun(beforePath, "before");
    console.log("PAYTO_BEFORE_SAFETY_OK");
    break;
  case "scores":
    validateScore(beforeScorePath, "before");
    validateScore(afterScorePath, "after");
    if (!readFileSync(comparisonPath, "utf8").includes("BEFORE vs AFTER")) fail("comparison markdown is missing BEFORE vs AFTER");
    console.log("PAYTO_SCORES_OK");
    break;
  case "synthetic-safety":
    scenarios();
    validateRun(beforePath, "before");
    validateRun(afterPath, "after");
    console.log("PAYTO_SYNTHETIC_SAFETY_OK");
    break;
  case "artifact-secrets":
    assertNoArtifactSecrets();
    console.log("PAYTO_ARTIFACT_SECRETS_OK");
    break;
  case "report-sections":
    assertReportSections();
    console.log("PAYTO_REPORT_SECTIONS_OK");
    break;
  case "report-labels": {
    const text = readFileSync(reportPath, "utf8");
    for (const label of ["OBSERVED", "INFERRED", "PROPOSED"]) if (!text.includes(`**${label}:**`)) fail(`report is missing ${label} claims`);
    console.log("PAYTO_REPORT_LABELS_OK");
    break;
  }
  case "coverage": {
    const coverage = readJson(coveragePath);
    for (const phase of ["before", "after"]) {
      const value = coverage[phase];
      if (!value || value.testsPassed !== true) fail(`${phase} coverage did not pass tests`);
      for (const key of ["lines", "branches", "functions"]) if (typeof value[key] !== "number") fail(`${phase} coverage ${key} is missing`);
    }
    console.log("PAYTO_COVERAGE_OK");
    break;
  }
  case "experiment-integration": {
    const before = validateRun(beforePath, "before");
    const after = validateRun(afterPath, "after");
    validateScore(beforeScorePath, "before");
    validateScore(afterScorePath, "after");
    if (before.runRecord.scenarioSourceSha256 !== after.runRecord.scenarioSourceSha256) fail("before/after scenario hashes differ");
    if (before.runRecord.semanticContractSha256 !== after.runRecord.semanticContractSha256) fail("before/after semantic question contract hashes differ");
    console.log("PAYTO_EXPERIMENT_INTEGRATION_OK");
    break;
  }
  case "child-gates": {
    const ledgers = readdirSync(childGatesPath)
      .filter(name => name.endsWith(".md"))
      .sort();
    if (ledgers.length !== 9) fail(`expected 9 child/branch ledgers, found ${ledgers.length}`);
    for (const ledger of ledgers) {
      const text = readFileSync(resolve(childGatesPath, ledger), "utf8");
      if (/^- \[ \]/m.test(text)) fail(`${ledger} has an unmet gate`);
      if (/^ABANDON:/m.test(text)) fail(`${ledger} has an abandoned gate`);
    }
    console.log("PAYTO_CHILD_GATES_OK");
    break;
  }
  default:
    fail(`unknown verification mode ${mode}`);
}
