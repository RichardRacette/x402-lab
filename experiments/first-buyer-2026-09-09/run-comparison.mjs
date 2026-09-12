// Bounded offline comparison. No network, payments, model calls or service startup.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const directory = fileURLToPath(new URL('./', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => readFileSync(directory + name);
const publicBytes = read('cases-public.json');
const hiddenBytes = read('cases-heldout.json');
assert.equal(hash(publicBytes), 'c64f25dbd217acf8dcda8ff916b0e590d7f05b6b80b36d8da0fe7f428956b072');
assert.equal(hash(hiddenBytes), 'ecc772858f9a7755c72807181a683df22cec96e9ba677c7dd455dd96cd159fac');
assert.equal(hash(read('candidate.mjs')), '0c1cd385a0360f1cfaf4d6efa9edee30045c9b739e87d1c84eb0a8e75cf7e338');
assert.equal(hash(read('baseline.py')), '60ad70ab2de43090fc90179d2f26ccabaabf159c3fd4ad99694e03a8e1604ffa');
assert.equal(hash(read('baseline-requirements.txt')), '75baf9f1f6d76d953d0cd39c3d771bf23e4ae5fc39289902d98bc0593d221f1d');
const disclosed = JSON.parse(publicBytes), hidden = JSON.parse(hiddenBytes);
assert.equal(disclosed.cases.length, 14);
assert.equal(hidden.cases.length, 6);
const cases = [...disclosed.cases, ...hidden.cases];
assert.equal(new Set(cases.map(c => c.id)).size, 20);
const inputs = cases.map(({ email, dns }) => ({ email, dns }));
const request = JSON.stringify({ inputs, disposableDomains: disclosed.disposable_list.entries });
function execute(command, args) {
  const start = performance.now();
  const run = spawnSync(command, args, { input: request, encoding: 'utf8', timeout: 10000, maxBuffer: 4 * 1024 * 1024 });
  const elapsedMs = performance.now() - start;
  if (run.error || run.status !== 0) throw new Error(`COMPARATOR_PROCESS_FAILED: ${run.error?.message ?? run.stderr}`);
  const outputs = JSON.parse(run.stdout);
  assert.ok(Array.isArray(outputs));
  assert.equal(outputs.length, 20, 'Every input must be accounted for');
  return { elapsedMs, outputs };
}
function assess(run) {
  const rows = cases.map((c, i) => {
    const output = run.outputs[i];
    const shape = output && ['KEEP', 'REVIEW', 'BLOCK'].includes(output.route)
      && typeof output.reason === 'string' && output.reason.length > 0;
    const acceptedUnsupported = c.acceptable_routes?.includes('REVIEW')
      && output?.route === 'REVIEW' && output.status === 'UNSUPPORTED'
      && /SMTPUTF8/i.test(output.reason);
    const correct = Boolean(shape && output.mailboxExists === 'UNKNOWN'
      && (output.route === c.expected_route || acceptedUnsupported));
    return { id: c.id, split: i < 14 ? 'public' : 'heldout', expectedRoute: c.expected_route,
      correct, falseBlock: output?.route === 'BLOCK' && c.expected_route !== 'BLOCK',
      mailboxClaim: output?.mailboxExists !== 'UNKNOWN', output };
  });
  return { correct: rows.filter(r => r.correct).length,
    publicCorrect: rows.slice(0, 14).filter(r => r.correct).length,
    heldoutCorrect: rows.slice(14).filter(r => r.correct).length,
    falseBlocks: rows.filter(r => r.falseBlock).length,
    mailboxClaims: rows.filter(r => r.mailboxClaim).length,
    coldBatchElapsedMs: run.elapsedMs, coldBatchSize: 20, rows };
}
const candidate = assess(execute(process.execPath, [directory + 'candidate-cli.mjs']));
const python = process.env.BUYER_BASELINE_PYTHON || 'python3';
const baseline = assess(execute(python, [directory + 'baseline.py']));
const technicalFloor = candidate.correct >= 19 && candidate.falseBlocks === 0 && candidate.mailboxClaims === 0;
const qualityAdvantage = candidate.correct - baseline.correct >= 4;
const result = {
  schema: 'x402.first-buyer-comparison/1', measuredAt: new Date().toISOString(),
  evidenceMode: 'OFFLINE_SYNTHETIC_FIXTURES', actualSpendUsd: 0,
  caseCount: 20, nodeVersion: process.version,
  hashes: Object.fromEntries(['cases-public.json', 'cases-heldout.json', 'candidate.mjs', 'candidate-cli.mjs', 'baseline.py', 'baseline-requirements.txt', 'run-comparison.mjs'].map(name => [name, hash(read(name))])),
  candidate, baseline,
  noBuild: { workflow: 'Queue all contacts for existing manual intake review; no new service or automated deletion',
    recordsQueued: 20, automaticallyResolved: 0, additionalSoftwareCashUsd: 0,
    operatorMinutes: null, operatorMinutesStatus: 'NOT_MEASURED',
    outputs: cases.map(c => ({ id: c.id, route: 'REVIEW', reason: 'EXISTING_MANUAL_REVIEW_PENDING', mailboxExists: 'UNKNOWN' })) },
  gates: { technicalFloor, qualityAdvantage, correctCaseDifference: candidate.correct - baseline.correct,
    independentBuyerIntegrationSavings: null, independentBuyerIntegrationSavingsStatus: 'NOT_MEASURED',
    overallDecision: 'LEAD_REVIEW_REQUIRED' },
  limitations: [
    'Cold subprocess batch timings include interpreter, JSON and list handling; exclude network, DNS, HTTP, hosting, payment and actual customer integration. One measured sample each; no production speed claim.',
    'List and DNS evidence are identical for both. Fixture timestamps are not live DNS freshness. Freshness comparison unavailable.',
    'Reviewer authored baseline and all cases; only candidate implementer was blind to six heldout cases. This limits comparative generalization.',
    'Paid Agent Email Check, Hunter and Emailable fulfillment were not purchased or measured. Existing allowances have zero incremental cash within quota.',
    'No external buyer, launch, live seller payment, independent demand or repeat purchase is represented.',
  ],
};
const body = JSON.stringify(result, null, 2) + '\n';
if (process.argv.length === 2) process.stdout.write(body);
else if (process.argv.length === 4 && process.argv[2] === '--output') {
  writeFileSync(process.argv[3], body, { flag: 'wx' });
  console.log(JSON.stringify({ candidate: candidate.correct, baseline: baseline.correct, technicalFloor, qualityAdvantage, outputWritten: true }));
} else throw new Error('Usage: node run-comparison.mjs [--output NEW_FILE]');
