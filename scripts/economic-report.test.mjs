import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, statSync, readdirSync, mkdirSync, rmSync, symlinkSync, linkSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { canonical, compile, decode, hash, instant, micros, decimal, validate, writeReports, readInput } from './economic-report.mjs';
const SCRIPT = fileURLToPath(new URL('./economic-report.mjs', import.meta.url));
const COPY = x => JSON.parse(JSON.stringify(x));
const evidence = () => ({ ref: 'fixture:declared-source', sha256: 'a'.repeat(64), status: 'OWNER_REPORTED' });
function row(id = 'op-001', changes = {}) {
  const r = { operation_id: id, occurred_at: '2026-09-05T10:00:00Z', role: 'seller', environment: 'production', network: 'offchain',
    counterparty: { relationship: 'external_confirmed', id: 'customer-001' }, fulfillment: 'succeeded',
    payment: { state: 'settled', reference: 'payment-' + id, settled_at: '2026-09-05T10:01:00Z', currency: 'USD', amount: '2.000000', refunded: '0.000000' },
    cost: { currency: 'USD', amount: '0.500000', completeness: 'complete' }, evidence: evidence() };
  return Object.assign(r, changes);
}
function input(records = [row()]) {
  // Simulated owner-approved input for computation tests, never real customer evidence.
  return { schema: 'x402.activity-input/1', dataset_id: 'test-dataset', service_id: 'test-service', as_of: '2026-09-06T00:00:00Z',
    window: { start: '2026-09-05T00:00:00Z', end: '2026-09-06T00:00:00Z' }, classification: 'project_safe', reviewed_for_local_analysis: true,
    coverage: { state: 'complete', expected_records: records.length, evidence: evidence() }, records };
}
const signals = result => Object.fromEntries(result.signals.economic.map(r => [r.kind, r.value]));
function temporary(fn) { const root = mkdtempSync(join(tmpdir(), 'economics-')); try { return fn(root); } finally { rmSync(root, { recursive: true, force: true }); } }

// Every amount in this file is fabricated for a deterministic software test.
test('one settled fulfilled external record produces the intended cohort and existing signals', () => {
  const r = compile(input()); assert.equal(r.report.seller.paid_fulfillments.value, 1);
  assert.equal(r.report.seller.receipts.USD.gross_total, '2.000000');
  assert.equal(r.report.seller.contribution_proxy.value, '1.500000');
  assert.deepEqual(signals(r), { paid_fulfillments: 1, fulfillment_failures: 0, unique_buyers: 1, repeat_buyers: 0, variable_cost_usd: .5, contribution_margin_usd: 1.5 });
  assert.ok(r.signals.economic.every(x => x.status === 'OWNER_REPORTED'));
});
test('buyer/provider purchases are outlay, not seller receipts or seller cost', () => {
  const r = compile(input([row('op-buyer', { role: 'buyer' })]));
  assert.equal(r.report.buyer.provider_purchase_cash.USD.net_total, '2.000000');
  assert.equal(r.report.seller.receipts.USD.gross_total, '0.000000');
  assert.equal(r.report.seller.paid_fulfillments.value, 0);
  assert.equal(r.report.seller.variable_cost_known.USD, '0.000000');
});
test('testnet, fixture and self rows never become external production receipts', () => {
  const data = input([row('op-test', { environment: 'testnet', network: 'eip155:84532' }), row('op-fixture', { environment: 'fixture' }),
    row('op-self', { counterparty: { relationship: 'self', id: 'owner-001' } })]);
  const r = compile(data); assert.equal(r.report.seller.paid_fulfillments.value, 0);
  assert.deepEqual(r.report.records.dispositions, { FIXTURE: 1, SELF_ACTIVITY: 1, TESTNET: 1 });
  assert.equal(r.report.next_review.code, 'VALIDATE_ONE_BUYER_PROBLEM');
});
test('a whole synthetic dataset shows its numbers but exports no live economic signals', () => {
  const data = input(); data.classification = 'synthetic'; const r = compile(data);
  assert.equal(r.report.signal_export.status, 'WITHHELD_SYNTHETIC');
  assert.deepEqual(r.signals.economic, []); assert.equal(r.report.next_review.code, 'DEMONSTRATION_ONLY');
});
test('missing observations are not zero revenue', () => {
  const data = input([]); data.coverage = { state: 'unknown', expected_records: null, evidence: evidence() };
  const r = compile(data); assert.equal(r.report.data_status, 'NO_OBSERVATIONS_SUPPLIED');
  assert.equal(r.report.seller.paid_fulfillments.value, null);
  assert.equal(r.report.seller.receipts.USD.gross_total, null);
  assert.equal(r.report.seller.variable_cost_complete, null); assert.deepEqual(r.signals.economic, []);
});
test('an explicitly covered empty cohort can report zero counts without inventing profit', () => {
  const r = compile(input([])); assert.equal(r.report.seller.paid_fulfillments.value, 0);
  assert.equal(r.report.seller.contribution_proxy.value, null);
  assert.equal(signals(r).contribution_margin_usd, undefined);
});
test('partial supplied data retains known amounts and withholds total-like signals', () => {
  const data = input(); data.coverage = { state: 'partial', expected_records: null, evidence: evidence() };
  const r = compile(data); assert.equal(r.report.seller.receipts.USD.gross_known, '2.000000');
  assert.equal(r.report.seller.receipts.USD.gross_total, null); assert.deepEqual(r.signals.economic, []);
});
test('unknown relationships and unverified sources stay visible and block complete export', () => {
  for (const change of [r => r.counterparty.relationship = 'unknown', r => r.evidence.status = 'UNVERIFIED', r => r.network = 'unknown']) {
    const data = input(); change(data.records[0]); const r = compile(data);
    assert.equal(r.report.seller.operations, 0); assert.equal(r.report.seller.receipts.USD.gross_total, null);
    assert.equal(r.report.signal_export.status, 'WITHHELD_UNRESOLVED_EVIDENCE');
    assert.deepEqual(r.signals.economic, []);
  }
});
test('a status/HTTP-style success without settlement never becomes a paid fulfillment', () => {
  const data = input(); Object.assign(data.records[0].payment, { state: 'not_settled', reference: null, settled_at: null, refunded: null });
  const r = compile(data); assert.equal(r.report.seller.paid_fulfillments.value, 0);
  assert.equal(r.report.seller.receipts.USD.gross_total, '0.000000');
});
test('settlement with unknown amount is not inferred from a claimed price', () => {
  const data = input(); Object.assign(data.records[0].payment, { amount: null, refunded: null });
  const r = compile(data); assert.equal(r.report.seller.paid_fulfillments.value, null);
  assert.equal(r.report.seller.receipts.USD.gross_total, null); assert.equal(signals(r).paid_fulfillments, undefined);
});
test('paid but unfulfilled activity prompts reliability review, not a profitable-growth claim', () => {
  const r = compile(input([row('op-failed', { fulfillment: 'failed' })]));
  assert.equal(r.report.next_review.code, 'REVIEW_PAID_UNFULFILLED_REQUESTS');
  assert.equal(r.report.seller.receipts.USD.gross_total, '2.000000');
  assert.equal(r.report.seller.paid_fulfillments.value, 0); assert.equal(r.report.seller.fulfillment_failures.value, 1);
  assert.equal(r.report.seller.contribution_proxy.value, null);
});
test('refunds reduce net cash while gross receipt and fulfillment counts stay distinct', () => {
  const data = input(); data.records[0].payment.refunded = '2.0'; const r = compile(data);
  assert.equal(r.report.seller.receipts.USD.net_total, '0.000000');
  assert.equal(r.report.seller.paid_fulfillments.value, 1);
  assert.equal(r.report.seller.contribution_proxy.value, '-0.500000');
  assert.equal(r.report.next_review.code, 'REVIEW_NEGATIVE_CONTRIBUTION');
});
test('unknown refund and cost completeness withhold net/contribution, not the known gross', () => {
  const data = input(); data.records[0].payment.refunded = null;
  let r = compile(data); assert.equal(r.report.seller.receipts.USD.gross_total, '2.000000');
  assert.equal(r.report.seller.receipts.USD.net_total, null); assert.equal(r.report.seller.contribution_proxy.value, null);
  data.records[0].cost.completeness = 'partial'; r = compile(data);
  assert.equal(r.report.seller.variable_cost_complete, false); assert.equal(signals(r).variable_cost_usd, undefined);
});
test('USD and USDC remain separate: no assumed peg or mixed-currency subtraction', () => {
  const data = input(); data.records[0].payment.currency = 'USDC'; const r = compile(data);
  assert.equal(r.report.seller.receipts.USDC.gross_total, '2.000000');
  assert.equal(r.report.seller.receipts.USD.gross_total, '0.000000');
  assert.equal(r.report.seller.contribution_proxy.reason, 'NO_IMPLICIT_CURRENCY_CONVERSION');
  assert.equal(signals(r).contribution_margin_usd, undefined);
});
test('USDC-only cohort proxy is labeled USDC, not exported as USD', () => {
  const data = input(); data.records[0].payment.currency = 'USDC'; data.records[0].cost.currency = 'USDC';
  const r = compile(data); assert.equal(r.report.seller.contribution_proxy.currency, 'USDC');
  assert.equal(r.report.seller.contribution_proxy.value, '1.500000');
  assert.equal(signals(r).variable_cost_usd, undefined); assert.equal(signals(r).contribution_margin_usd, undefined);
});
test('zero-cost and missing-cost are distinct', () => {
  const data = input(); data.records[0].cost.amount = '0'; let r = compile(data);
  assert.equal(signals(r).variable_cost_usd, 0);
  data.records[0].cost = { currency: null, amount: null, completeness: 'unknown' }; r = compile(data);
  assert.equal(signals(r).variable_cost_usd, undefined); assert.equal(r.report.seller.contribution_proxy.value, null);
});
test('repeat buyer count uses separate paid operations and opaque resolved identity', () => {
  const r = compile(input([row('op-001'), row('op-002'), row('op-003', { counterparty: { relationship: 'external_confirmed', id: 'customer-002' } })]));
  assert.equal(r.report.seller.unique_buyers.value, 2); assert.equal(r.report.seller.repeat_buyers.value, 1);
});
test('missing customer identity preserves a lower bound but withholds an exact buyer count', () => {
  const data = input([row('op-001'), row('op-002', { counterparty: { relationship: 'external_confirmed', id: null } })]);
  const r = compile(data); assert.equal(r.report.seller.unique_buyers.known_subset, 1);
  assert.equal(r.report.seller.unique_buyers.value, null); assert.equal(signals(r).unique_buyers, undefined);
});
test('exact duplicates collapse; conflicting operations and reused settlement references refuse', () => {
  const data = input(); data.records.push(COPY(data.records[0])); const r = compile(data);
  assert.equal(r.report.records.duplicates_collapsed, 1); assert.equal(r.report.seller.paid_fulfillments.value, 1);
  data.records[1].fulfillment = 'failed'; assert.throws(() => compile(data), /CONFLICTING_OPERATION/);
  const other = input([row('op-001'), row('op-002')]); other.records[1].payment.reference = other.records[0].payment.reference;
  assert.throws(() => compile(other), /SETTLEMENT_USED_BY_MULTIPLE_OPERATIONS/);
});
test('request cohort boundaries are start inclusive and end exclusive, with exclusions recorded', () => {
  const a = row('op-001', { occurred_at: '2026-09-05T00:00:00Z' });
  const b = row('op-002', { occurred_at: '2026-09-06T00:00:00Z' }); b.payment.settled_at = '2026-09-06T00:00:00Z';
  const data = input([a, b]); data.coverage.expected_records = 1;
  const r = compile(data); assert.equal(r.report.records.in_window, 1); assert.equal(r.report.records.dispositions.OUTSIDE_WINDOW, 1);
});
test('time/classification contradictions are rejected, not silently repaired', () => {
  for (const modify of [d => d.records[0].network = 'eip155:84532', d => d.records[0].payment.settled_at = '2026-09-04T10:00:00Z',
    d => d.records[0].occurred_at = '2026-09-07T00:00:00Z', d => d.window.end = '2026-09-07T00:00:00Z']) {
    const d = input(); modify(d); assert.throws(() => compile(d));
  }
  assert.throws(() => instant('2026-02-30T00:00:00Z')); assert.throws(() => instant('2026-09-06T00:00:00'));
});
test('settled amount requires an evidence reference and refund cannot exceed receipt', () => {
  const data = input(); data.records[0].payment.reference = null; assert.throws(() => compile(data), /SETTLEMENT_REFERENCE_REQUIRED/);
  data.records[0].payment.reference = 'payment-original'; data.records[0].payment.refunded = '3';
  assert.throws(() => compile(data), /REFUND_EXCEEDS_PAYMENT/);
});
test('review declaration and complete coverage count are mandatory and not truth certification', () => {
  const d = input(); d.reviewed_for_local_analysis = false; assert.throws(() => compile(d), /REVIEWED_INPUT_REQUIRED/);
  d.reviewed_for_local_analysis = true; d.coverage.expected_records = 2; assert.throws(() => compile(d), /COVERAGE_COUNT_MISMATCH/);
  d.coverage.expected_records = 1; assert.equal(compile(d).report.source_authenticity, 'NOT_ESTABLISHED');
});
test('extra fields including commands/headers/wallets are refused', () => {
  for (const [field, value] of [['execute', 'rm'], ['wallet', 'secret'], ['authorization', 'secret']]) {
    const data = input(); data.records[0][field] = value; assert.throws(() => compile(data), /RECORD_SHAPE_REFUSED/);
  }
});
test('currency, numeric money, negative values, precision overflow and Boolean counts refuse', () => {
  for (const money of [1, '-1', '1e3', '1.0000001', '.5', '01', '1000000000', 'NaN']) assert.throws(() => micros(money));
  const d = input(); d.coverage.expected_records = true; assert.throws(() => compile(d));
  d.coverage.expected_records = 1; d.records[0].payment.currency = 'EUR'; assert.throws(() => compile(d));
});
test('micro amounts use exact integer math, never float accumulation', () => {
  const rows = Array.from({ length: 10 }, (_, n) => { const r = row('op-' + String(n).padStart(3, '0')); r.payment.amount = '0.000001'; r.cost.amount = '0'; return r; });
  const r = compile(input(rows)); assert.equal(r.report.seller.receipts.USD.gross_total, '0.000010');
  assert.equal(r.report.seller.contribution_proxy.value, '0.000010'); assert.equal(decimal(-1n), '-0.000001');
});
test('large aggregate amounts remain exact strings and unsafe numeric signals are withheld', () => {
  const rows = Array.from({ length: 12 }, (_, i) => { const r = row('op-large-' + i); r.payment.amount = '999999999'; r.cost.amount = '0'; return r; });
  const r = compile(input(rows)); assert.equal(r.report.seller.receipts.USD.gross_total, '11999999988.000000');
  assert.equal(signals(r).contribution_margin_usd, undefined);
  assert.ok(r.report.signal_export.withheld.some(x => x.reason === 'NUMERIC_RANGE_EXCEEDED'));
});
test('strict JSON rejects duplicates (including escaped names), bad unicode, nonfinite numbers, trailing data and depth abuse', () => {
  for (const raw of ['{"a":1,"a":2}', '{"a":{"b":1,"\\u0062":2}}', '{"x":1e999}', '{"x":NaN}', '[1,]', '{}x', '"\\ud800"', '['.repeat(40) + '0' + ']'.repeat(40)])
    assert.throws(() => decode(Buffer.from(raw)));
  assert.throws(() => decode(Buffer.from([0xff]))); assert.throws(() => decode(Buffer.alloc(512 * 1024 + 1)));
  assert.equal(canonical(decode(Buffer.from(canonical(input())))), canonical(input()));
});
test('report is deterministic, signal source hashes bind the exact report and IDs bind metric/window', () => {
  const d = input(); const r = compile(d); assert.deepEqual(r, compile(COPY(d)));
  const h = hash(canonical(r.report)); assert.ok(r.signals.economic.every(s => s.evidence_sha256 === h && s.source_ref.endsWith(h)));
  const moved = COPY(d); moved.as_of = '2026-09-06T01:00:00Z';
  assert.notEqual(r.signals.economic[0].signal_id, compile(moved).signals.economic[0].signal_id);
});
test('actual CLI creates reports, repeat preserves bytes/mtimes and notes, changed source refuses', () => temporary(root => {
  const p = join(root, 'input.json'), out = join(root, 'out'); writeFileSync(p, canonical(input()));
  const run = () => spawnSync(process.execPath, [SCRIPT, '--input', p, '--output-dir', out], { encoding: 'utf8' });
  let r = run(); assert.equal(r.status, 0, r.stdout + r.stderr); assert.equal(JSON.parse(r.stdout).status, 'CREATED');
  writeFileSync(join(out, 'decision.md'), 'Human note stays.');
  const before = Object.fromEntries(readdirSync(out).map(n => [n, [hash(readFileSync(join(out, n))), statSync(join(out, n)).mtimeMs]]));
  r = run(); assert.equal(r.status, 0); assert.equal(JSON.parse(r.stdout).status, 'UNCHANGED');
  assert.deepEqual(Object.fromEntries(readdirSync(out).map(n => [n, [hash(readFileSync(join(out, n))), statSync(join(out, n)).mtimeMs]])), before);
  const changed = input(); changed.records[0].payment.amount = '4'; writeFileSync(p, canonical(changed)); r = run();
  assert.equal(r.status, 2); assert.equal(JSON.parse(r.stdout).code, 'OUTPUT_CONFLICT_PRESERVED');
  assert.equal(readFileSync(join(out, 'decision.md'), 'utf8'), 'Human note stays.');
}));
test('partial outputs and edited review are preserved on refusal', () => temporary(root => {
  const out = join(root, 'out'), result = compile(input()); writeReports(out, result); unlinkSync(join(out, 'manifest.json'));
  assert.throws(() => writeReports(out, result), /PARTIAL_OUTPUT_PRESERVED/);
  assert.ok(exists(join(out, 'report.json')));
}));
function exists(p) { try { statSync(p); return true; } catch { return false; } }
test('Git-contained output and missing parent refuse before creation', () => temporary(root => {
  mkdirSync(join(root, '.git')); assert.throws(() => writeReports(join(root, 'out'), compile(input())), /OUTPUT_IN_GIT_REFUSED/);
  assert.throws(() => writeReports(join(root, 'missing', 'out'), compile(input())));
  assert.ok(!exists(join(root, 'out')));
}));
test('malformed CLI input returns fixed source-free errors and creates nothing', () => temporary(root => {
  const p = join(root, 'input.json'), out = join(root, 'out'); writeFileSync(p, '{"SECRET_RAW_CANARY": "do not echo"}');
  const r = spawnSync(process.execPath, [SCRIPT, '--input', p, '--output-dir', out], { encoding: 'utf8' });
  assert.equal(r.status, 2); assert.equal(r.stderr, ''); assert.ok(!r.stdout.includes('SECRET_RAW_CANARY'));
  assert.ok(!r.stdout.includes(root)); assert.ok(!exists(out));
}));
test('ordinary file reader refuses symlinks and hardlinks', { skip: process.platform === 'win32' ? 'symlink privileges vary; real Windows CLI is separate' : false }, () => temporary(root => {
  const p = join(root, 'input'), link = join(root, 'link'); writeFileSync(p, '{}'); symlinkSync(p, link);
  assert.throws(() => readInput(link)); unlinkSync(link); linkSync(p, link); assert.throws(() => readInput(p));
}));
test('checked-in synthetic example and empty template are validated with no fabricated exports', () => {
  for (const filename of ['activity.example.json', 'activity.empty.json']) {
    const d = decode(readFileSync(new URL('../data/economics/' + filename, import.meta.url))); const r = compile(d);
    assert.deepEqual(r.signals.economic, []);
  }
});
test('later caller changes cannot mutate the already bound report input fields', () => {
  const d = input(); const r = compile(d); const before = canonical(r.report);
  d.window.start = '2026-08-01T00:00:00Z'; d.coverage.state = 'unknown'; d.records[0].evidence.ref = 'mutated:source';
  assert.equal(canonical(r.report), before);
});
test('input permutation preserves math and all record-level dispositions', () => {
  const d = input([row('op-001'), row('op-002'), row('op-003', { role: 'buyer' })]);
  const reversed = COPY(d); reversed.records.reverse();
  const a = compile(d), b = compile(reversed);
  assert.deepEqual(a.report.seller, b.report.seller); assert.deepEqual(a.report.buyer, b.report.buyer);
  assert.deepEqual(a.report.dispositions, b.report.dispositions);
});
test('zero-priced fulfilled request is not counted as a paid fulfillment', () => {
  const d = input(); d.records[0].payment.amount = '0';
  const r = compile(d); assert.equal(r.report.seller.fulfilled, 1); assert.equal(r.report.seller.paid_fulfillments.value, 0);
});
test('missing fulfillment suppresses exact success/failure claims rather than passing a guessed zero', () => {
  const d = input(); d.records[0].fulfillment = 'unknown'; const r = compile(d);
  assert.equal(r.report.seller.paid_fulfillments.value, null); assert.equal(r.report.seller.fulfillment_failures.value, null);
  assert.equal(signals(r).paid_fulfillments, undefined); assert.equal(signals(r).fulfillment_failures, undefined);
});
