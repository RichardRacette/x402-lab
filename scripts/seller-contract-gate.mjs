/** Thin CI/release-gate policy over the offline seller contract evaluator. */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, readInput, Refused } from './economic-report.mjs';
import { evaluate, REPORT_SCHEMA } from './seller-contract-check.mjs';

export const GATE_SCHEMA = 'seller-contract-gate/v1';
export const GATE_VERSION = '0.1.0-alpha';
export const EXIT = Object.freeze({ CLEAR: 0, BLOCK: 1, REFUSED: 2, REVIEW: 3 });
const STAGES = new Set(['pre-deploy', 'post-deploy']);
const STATUSES = ['PASS', 'FAIL', 'UNKNOWN', 'NOT_APPLICABLE'];

const refuse = code => { throw new Refused(code); };

function argumentsFrom(args) {
  if (args.length !== 4) refuse('USAGE_REFUSED');
  const inputAt = args.indexOf('--input'), stageAt = args.indexOf('--stage');
  if (inputAt < 0 || stageAt < 0 || args.lastIndexOf('--input') !== inputAt || args.lastIndexOf('--stage') !== stageAt) refuse('USAGE_REFUSED');
  const input = args[inputAt + 1], stage = args[stageAt + 1];
  if (!input || !stage || input.startsWith('--') || stage.startsWith('--') || !STAGES.has(stage)) refuse('USAGE_REFUSED');
  return { input, stage };
}

export function gate(report, stage) {
  if (report?.schema !== REPORT_SCHEMA || !STAGES.has(stage) || !Array.isArray(report.checks)) refuse('REPORT_OR_STAGE_REFUSED');
  if (report.checks.some(check => typeof check?.id !== 'string' || !STATUSES.includes(check.status))) refuse('REPORT_OR_STAGE_REFUSED');
  const checks = Object.fromEntries(STATUSES.map(status => [status, report.checks.filter(check => check.status === status).map(check => check.id)]));
  if (checks.FAIL.length) return result(report, stage, checks, 'BLOCKED_BY_CONTRADICTION', EXIT.BLOCK);
  if (checks.UNKNOWN.length) return result(report, stage, checks, 'REVIEW_REQUIRED', EXIT.REVIEW);
  return result(report, stage, checks, 'NO_CONTRADICTION_FOUND', EXIT.CLEAR);
}

function result(report, stage, checks, decision, exitCode) {
  return {
    schema: GATE_SCHEMA,
    gateVersion: GATE_VERSION,
    stage,
    decision,
    exitCode,
    seller: report.seller,
    evaluatorVersion: report.evaluatorVersion,
    inputSha256: report.inputSha256,
    observedAt: report.observedAt ?? null,
    request: { method: report.request?.method ?? null, url: report.request?.url ?? null },
    evidenceChecks: {
      counts: Object.fromEntries(STATUSES.map(status => [status, checks[status].length])),
      verified: checks.PASS,
      contradicted: checks.FAIL,
      unresolved: checks.UNKNOWN,
      notApplicable: checks.NOT_APPLICABLE
    },
    behaviorClaims: {
      paymentAuthorization: 'UNTESTED',
      fulfillment: report.observedBehavior?.fulfillment ?? 'UNTESTED',
      billing: 'UNTESTED',
      settlement: report.observedBehavior?.settlement ?? 'UNTESTED',
      creditRedemption: report.observedBehavior?.creditRedemption ?? 'UNTESTED',
      receiptVerification: report.observedBehavior?.receiptVerification ?? 'UNTESTED'
    },
    limitations: [
      'Release decision covers supplied evidence only; it is not a seller, payment, or safety verdict.',
      'The gate performs no fetch, signing, payment, settlement, billing, fulfillment, credit, or receipt operation.',
      'NO_CONTRADICTION_FOUND requires no FAIL or UNKNOWN checks but does not authorize payment.'
    ]
  };
}

export function main(args = process.argv.slice(2)) {
  try {
    const { input, stage } = argumentsFrom(args);
    const output = gate(evaluate(readInput(input)), stage);
    process.stdout.write(canonical(output));
    return output.exitCode;
  } catch (error) {
    process.stdout.write(canonical({ schema: GATE_SCHEMA, status: 'REFUSED', code: error instanceof Refused ? error.code : 'INPUT_OR_IO_REFUSED' }));
    return EXIT.REFUSED;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
