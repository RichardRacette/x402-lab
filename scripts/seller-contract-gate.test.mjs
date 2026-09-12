import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gate, EXIT, GATE_SCHEMA } from './seller-contract-gate.mjs';

const report = statuses => ({
  schema: 'seller-contract-report/v1',
  evaluatorVersion: '0.1.0',
  inputSha256: 'a'.repeat(64),
  seller: 'synthetic-seller',
  checks: statuses.map((status, index) => ({ id: `check.${index}`, status })),
  observedBehavior: { fulfillment: 'UNTESTED', creditRedemption: 'UNTESTED', settlement: 'UNTESTED', receiptVerification: 'UNTESTED' }
});

test('gate policy maps contradictions, unknowns and complete evidence to stable exit codes', () => {
  const blocked = gate(report(['PASS', 'FAIL', 'UNKNOWN']), 'pre-deploy');
  assert.equal(blocked.decision, 'BLOCKED_BY_CONTRADICTION');
  assert.equal(blocked.exitCode, EXIT.BLOCK);
  assert.deepEqual(blocked.evidenceChecks.counts, { PASS: 1, FAIL: 1, UNKNOWN: 1, NOT_APPLICABLE: 0 });
  assert.deepEqual(blocked.evidenceChecks.contradicted, ['check.1']);

  const review = gate(report(['PASS', 'UNKNOWN']), 'post-deploy');
  assert.equal(review.decision, 'REVIEW_REQUIRED');
  assert.equal(review.exitCode, EXIT.REVIEW);

  const clear = gate(report(['PASS', 'NOT_APPLICABLE']), 'pre-deploy');
  assert.equal(clear.decision, 'NO_CONTRADICTION_FOUND');
  assert.equal(clear.exitCode, EXIT.CLEAR);
});

test('machine output keeps operational claims untested and never authorizes payment', () => {
  const output = gate(report(['PASS']), 'pre-deploy');
  assert.equal(output.schema, GATE_SCHEMA);
  assert.deepEqual(output.behaviorClaims, {
    paymentAuthorization: 'UNTESTED', fulfillment: 'UNTESTED', billing: 'UNTESTED', settlement: 'UNTESTED', creditRedemption: 'UNTESTED', receiptVerification: 'UNTESTED'
  });
  assert.equal('safeToPay' in output || 'paymentRecommended' in output, false);
});

test('CLI is deterministic, reports review for retained Ghost evidence, and refuses unsafe flags', () => {
  const invoke = args => spawnSync(process.execPath, ['scripts/seller-contract-gate.mjs', ...args], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  const args = ['--stage', 'post-deploy', '--input', 'fixtures/seller-contract-check/ghost.json'];
  const first = invoke(args), second = invoke(args);
  assert.equal(first.status, EXIT.REVIEW);
  assert.equal(first.stdout, second.stdout);
  assert.equal(JSON.parse(first.stdout).decision, 'REVIEW_REQUIRED');

  const secret = 'SYNTHETIC_PRIVATE_ARGUMENT';
  const refused = invoke(['--run-unpaid', secret]);
  assert.equal(refused.status, EXIT.REFUSED);
  assert.doesNotMatch(refused.stdout + refused.stderr, new RegExp(secret));
});

test('CLI blocks a supplied contradiction without contacting the seller', () => {
  const input = JSON.parse(readFileSync('fixtures/seller-contract-check/ghost.json', 'utf8'));
  input.current.sources.find(source => source.role === 'body').content.accepts[0].amount = '20000';
  const directory = mkdtempSync(join(tmpdir(), 'seller-gate-'));
  const path = join(directory, 'contradiction.json');
  writeFileSync(path, JSON.stringify(input));
  const run = spawnSync(process.execPath, ['scripts/seller-contract-gate.mjs', '--input', path, '--stage', 'pre-deploy'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  assert.equal(run.status, EXIT.BLOCK);
  const output = JSON.parse(run.stdout);
  assert.equal(output.decision, 'BLOCKED_BY_CONTRADICTION');
  assert.ok(output.evidenceChecks.contradicted.includes('header.body'));
});
