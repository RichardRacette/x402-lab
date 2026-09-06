/** Offline operational economics. No fetch, model, wallet, database, or action executor. */
import { createHash } from 'node:crypto';
import { lstatSync, realpathSync, openSync, readSync, closeSync, fstatSync, mkdirSync, writeFileSync, fsyncSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const INPUT_SCHEMA = 'x402.activity-input/1';
export const MAX_BYTES = 512 * 1024;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/;
const SHA = /^[a-f0-9]{64}$/;
const USD_SCALE = 1000000n;
export class Refused extends Error { constructor(code) { super(code); this.code = code; } }
const need = (ok, code) => { if (!ok) throw new Refused(code); };
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export function canonical(value) {
  const walk = v => {
    if (Array.isArray(v)) return v.map(walk);
    if (v !== null && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, walk(v[k])]));
    need(v === null || ['string', 'boolean', 'number'].includes(typeof v), 'JSON_TYPE_REFUSED');
    need(typeof v !== 'number' || Number.isFinite(v), 'NONFINITE_NUMBER');
    return v;
  };
  return JSON.stringify(walk(value)) + '\n';
}
const exact = (v, keys, code = 'INPUT_SHAPE_REFUSED') => need(v !== null && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).sort().join('|') === [...keys].sort().join('|'), code);
const ident = v => need(typeof v === 'string' && ID.test(v), 'OPAQUE_ID_REQUIRED');
const oneOf = (v, choices, code = 'ENUM_REFUSED') => need(choices.includes(v), code);
export function instant(v) {
  need(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(v), 'UTC_TIMESTAMP_REQUIRED');
  const n = Date.parse(v);
  const normalized = v.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction) => '.' + (fraction || '').padEnd(3, '0') + 'Z');
  need(Number.isFinite(n) && new Date(n).toISOString() === normalized, 'INVALID_TIMESTAMP');
  return n;
}
export function micros(v) {
  need(typeof v === 'string' && /^(?:0|[1-9]\d{0,8})(?:\.\d{1,6})?$/.test(v), 'DECIMAL_MONEY_REQUIRED');
  const [whole, fraction = ''] = v.split('.');
  return BigInt(whole) * USD_SCALE + BigInt(fraction.padEnd(6, '0'));
}
export function decimal(n) {
  const sign = n < 0n ? '-' : ''; n = n < 0n ? -n : n;
  return sign + n / USD_SCALE + '.' + String(n % USD_SCALE).padStart(6, '0');
}

/** Small bounded JSON parser: preserve duplicate-key and numeric-type refusals. */
export function decode(bytes) {
  need(Buffer.isBuffer(bytes) && bytes.length <= MAX_BYTES, 'INPUT_SIZE_REFUSED');
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Refused('INVALID_UTF8'); }
  let i = 0;
  const ws = () => { while (/[ \t\r\n]/.test(text[i] || '\0')) i++; };
  const string = () => {
    const start = i++; let escaped = false;
    while (i < text.length) {
      const c = text[i++];
      if (!escaped && c === '"') {
        let v; try { v = JSON.parse(text.slice(start, i)); } catch { throw new Refused('INVALID_JSON'); }
        need(Buffer.from(v).toString('utf8') === v, 'INVALID_UNICODE'); return v;
      }
      if (!escaped && c === '\\') escaped = true; else escaped = false;
    }
    throw new Refused('INVALID_JSON');
  };
  const value = depth => {
    need(depth <= 32, 'JSON_DEPTH_REFUSED'); ws(); const c = text[i];
    if (c === '"') return string();
    if (c === '{' || c === '[') {
      i++; ws(); const object = c === '{', end = object ? '}' : ']';
      const result = object ? Object.create(null) : []; const seen = new Set();
      if (text[i] === end) { i++; return result; }
      while (i < text.length) {
        ws(); let key;
        if (object) {
          need(text[i] === '"', 'INVALID_JSON'); key = string();
          need(!seen.has(key), 'DUPLICATE_JSON_KEY'); seen.add(key); ws(); need(text[i++] === ':', 'INVALID_JSON');
        }
        const v = value(depth + 1); if (object) result[key] = v; else result.push(v);
        ws(); if (text[i] === end) { i++; return result; }
        need(text[i++] === ',', 'INVALID_JSON');
      }
      throw new Refused('INVALID_JSON');
    }
    const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i));
    need(match, 'INVALID_JSON'); i += match[0].length;
    const v = JSON.parse(match[0]); need(typeof v !== 'number' || Number.isFinite(v), 'NONFINITE_NUMBER'); return v;
  };
  const result = value(0); ws(); need(i === text.length, 'INVALID_JSON'); return result;
}

function evidence(e) {
  exact(e, ['ref', 'sha256', 'status'], 'EVIDENCE_SHAPE_REFUSED'); ident(e.ref);
  need(typeof e.sha256 === 'string' && SHA.test(e.sha256), 'SOURCE_HASH_REQUIRED');
  oneOf(e.status, ['OBSERVED', 'OWNER_REPORTED', 'UNVERIFIED']);
}
export function validate(input) {
  exact(input, ['schema', 'dataset_id', 'service_id', 'as_of', 'window', 'classification', 'reviewed_for_local_analysis', 'coverage', 'records']);
  need(input.schema === INPUT_SCHEMA && input.reviewed_for_local_analysis === true, 'REVIEWED_INPUT_REQUIRED');
  ident(input.dataset_id); ident(input.service_id); const at = instant(input.as_of);
  oneOf(input.classification, ['synthetic', 'project_safe']);
  exact(input.window, ['start', 'end']); const start = instant(input.window.start), end = instant(input.window.end);
  need(start < end && end <= at, 'WINDOW_REFUSED');
  exact(input.coverage, ['state', 'expected_records', 'evidence']); evidence(input.coverage.evidence);
  oneOf(input.coverage.state, ['complete', 'partial', 'unknown']);
  if (input.coverage.state === 'complete') need(Number.isSafeInteger(input.coverage.expected_records)
    && input.coverage.expected_records >= 0 && input.coverage.expected_records <= 1000, 'COMPLETE_COVERAGE_COUNT_REQUIRED');
  else need(input.coverage.expected_records === null, 'PARTIAL_COVERAGE_COUNT_REFUSED');
  need(Array.isArray(input.records) && input.records.length <= 1000, 'RECORD_LIMIT');
  const seen = new Map(), payments = new Map(); let duplicates = 0;
  for (const r of input.records) {
    exact(r, ['operation_id', 'occurred_at', 'role', 'environment', 'network', 'counterparty', 'fulfillment', 'payment', 'cost', 'evidence'], 'RECORD_SHAPE_REFUSED');
    ident(r.operation_id); const occurred = instant(r.occurred_at); need(occurred <= at, 'FUTURE_RECORD');
    oneOf(r.role, ['seller', 'buyer']); oneOf(r.environment, ['production', 'testnet', 'fixture']);
    oneOf(r.network, ['eip155:8453', 'eip155:84532', 'offchain', 'unknown']);
    need(!(r.environment === 'production' && r.network === 'eip155:84532')
      && !(r.environment === 'testnet' && ['eip155:8453', 'offchain'].includes(r.network)), 'NETWORK_CLASS_CONFLICT');
    exact(r.counterparty, ['relationship', 'id']); oneOf(r.counterparty.relationship, ['external_confirmed', 'self', 'unknown']);
    if (r.counterparty.id !== null) ident(r.counterparty.id);
    oneOf(r.fulfillment, ['succeeded', 'failed', 'unknown']); evidence(r.evidence);
    exact(r.payment, ['state', 'reference', 'settled_at', 'currency', 'amount', 'refunded']);
    oneOf(r.payment.state, ['settled', 'not_settled', 'unknown']);
    oneOf(r.payment.currency, ['USD', 'USDC', null]);
    if (r.payment.reference !== null) ident(r.payment.reference);
    for (const key of ['amount', 'refunded']) if (r.payment[key] !== null) { micros(r.payment[key]); need(r.payment.currency !== null, 'CURRENCY_REQUIRED'); }
    if (r.payment.refunded !== null) need(r.payment.amount !== null && micros(r.payment.refunded) <= micros(r.payment.amount), 'REFUND_EXCEEDS_PAYMENT');
    if (r.payment.state === 'settled') {
      need(r.payment.reference !== null, 'SETTLEMENT_REFERENCE_REQUIRED');
      const settled = instant(r.payment.settled_at); need(settled >= occurred && settled <= at, 'SETTLEMENT_TIME_REFUSED');
    } else need(r.payment.settled_at === null && r.payment.refunded === null, 'UNSETTLED_REFUND_REFUSED');
    exact(r.cost, ['currency', 'amount', 'completeness']); oneOf(r.cost.completeness, ['complete', 'partial', 'unknown']);
    if (r.cost.completeness === 'unknown') need(r.cost.amount === null && r.cost.currency === null, 'UNKNOWN_COST_MUST_BE_NULL');
    else { oneOf(r.cost.currency, ['USD', 'USDC']); micros(r.cost.amount); }
    const bytes = canonical(r);
    if (seen.has(r.operation_id)) { need(seen.get(r.operation_id).bytes === bytes, 'CONFLICTING_OPERATION'); duplicates++; continue; }
    seen.set(r.operation_id, { bytes, row: r });
    if (r.payment.state === 'settled') {
      const key = [r.role, r.network, r.payment.reference].join('|');
      need(!payments.has(key), 'SETTLEMENT_USED_BY_MULTIPLE_OPERATIONS'); payments.set(key, r.operation_id);
    }
  }
  const rows = [...seen.values()].map(x => x.row).sort((a, b) => a.operation_id.localeCompare(b.operation_id, 'en'));
  const inWindow = rows.filter(r => instant(r.occurred_at) >= start && instant(r.occurred_at) < end);
  if (input.coverage.state === 'complete') need(input.coverage.expected_records === inWindow.length, 'COVERAGE_COUNT_MISMATCH');
  return { rows, inWindow, duplicates };
}
function classify(r, inWindow) {
  if (!inWindow) return 'OUTSIDE_WINDOW';
  if (r.environment === 'fixture') return 'FIXTURE';
  if (r.environment === 'testnet') return 'TESTNET';
  if (r.network === 'unknown') return 'UNKNOWN_PRODUCTION_NETWORK';
  if (r.evidence.status === 'UNVERIFIED') return 'UNVERIFIED_SOURCE';
  if (r.counterparty.relationship === 'self') return 'SELF_ACTIVITY';
  if (r.counterparty.relationship === 'unknown') return 'UNKNOWN_CUSTOMER_RELATIONSHIP';
  return r.role === 'buyer' ? 'PROVIDER_PURCHASE' : 'EXTERNAL_SELLER_OPERATION';
}
function receiptMoney(rows, coverageComplete = true) {
  const settled = rows.filter(r => r.payment.state === 'settled');
  return Object.fromEntries(['USD', 'USDC'].map(currency => {
    const list = settled.filter(r => r.payment.currency === currency);
    const unallocated = settled.filter(r => r.payment.currency === null).length;
    const grossMissing = list.filter(r => r.payment.amount === null).length + unallocated;
    const netMissing = list.filter(r => r.payment.refunded === null || r.payment.amount === null).length + unallocated;
    const gross = list.reduce((s, r) => s + (r.payment.amount === null ? 0n : micros(r.payment.amount)), 0n);
    const netKnown = list.reduce((s, r) => s + (r.payment.amount !== null && r.payment.refunded !== null ? micros(r.payment.amount) - micros(r.payment.refunded) : 0n), 0n);
    return [currency, { settled_records: list.length, gross_known: decimal(gross), gross_total: grossMissing || !coverageComplete ? null : decimal(gross),
      net_known: decimal(netKnown), net_total: netMissing || !coverageComplete ? null : decimal(netKnown),
      missing_gross_records: grossMissing, missing_net_records: netMissing }];
  }));
}
function contribution(rows) {
  const currencies = new Set(rows.flatMap(r => [r.payment.state === 'settled' ? r.payment.currency : null, r.cost.currency]).filter(Boolean));
  let reason = null;
  if (!rows.length) reason = 'NO_EXTERNAL_SELLER_OPERATIONS';
  else if (rows.some(r => r.cost.completeness !== 'complete')) reason = 'VARIABLE_COSTS_INCOMPLETE';
  else if (rows.some(r => r.payment.state === 'unknown' || r.fulfillment === 'unknown')) reason = 'PAYMENT_OR_FULFILLMENT_UNKNOWN';
  else if (rows.some(r => r.payment.state === 'settled' && r.fulfillment !== 'succeeded')) reason = 'SETTLED_BUT_NOT_FULFILLED';
  else if (rows.some(r => r.payment.state === 'settled' && (r.payment.amount === null || r.payment.refunded === null))) reason = 'PAYMENT_OR_REFUND_AMOUNT_UNKNOWN';
  else if (currencies.size !== 1) reason = 'NO_IMPLICIT_CURRENCY_CONVERSION';
  if (reason) return { value: null, currency: null, reason };
  const value = rows.reduce((sum, r) => sum + (r.payment.state === 'settled' ? micros(r.payment.amount) - micros(r.payment.refunded) : 0n) - micros(r.cost.amount), 0n);
  return { value: decimal(value), currency: [...currencies][0], reason: null };
}
export function compile(input, inputHash = hash(canonical(input))) {
  const { rows, inWindow, duplicates } = validate(input), member = new Set(inWindow.map(r => r.operation_id));
  const dispositions = rows.map(r => ({ operation_id: r.operation_id, disposition: classify(r, member.has(r.operation_id)),
    record_sha256: hash(canonical(r)), evidence: { ...r.evidence } }));
  const selected = name => rows.filter((_, i) => dispositions[i].disposition === name);
  const sellers = selected('EXTERNAL_SELLER_OPERATION'), buyers = selected('PROVIDER_PURCHASE');
  const paid = sellers.filter(r => r.fulfillment === 'succeeded' && r.payment.state === 'settled' && r.payment.amount !== null && micros(r.payment.amount) > 0n);
  const paidUnknown = sellers.some(r => r.fulfillment === 'unknown' || r.payment.state === 'unknown'
    || r.fulfillment === 'succeeded' && r.payment.state === 'settled' && r.payment.amount === null);
  const ids = new Map(); for (const r of paid) if (r.counterparty.id !== null) ids.set(r.counterparty.id, (ids.get(r.counterparty.id) || 0) + 1);
  const unknownIds = paid.filter(r => r.counterparty.id === null).length;
  const failures = sellers.filter(r => r.fulfillment === 'failed');
  const paidUnfulfilled = sellers.filter(r => r.payment.state === 'settled' && r.fulfillment !== 'succeeded');
  const unresolved = dispositions.filter(r => ['UNKNOWN_PRODUCTION_NETWORK', 'UNVERIFIED_SOURCE', 'UNKNOWN_CUSTOMER_RELATIONSHIP'].includes(r.disposition));
  const covered = input.coverage.state === 'complete' && input.coverage.evidence.status !== 'UNVERIFIED' && unresolved.length === 0;
  const metric = (value, missing = false) => ({ value: missing || !covered ? null : value, known_subset: value });
  const costs = Object.fromEntries(['USD', 'USDC'].map(currency => [currency, decimal(sellers.filter(r => r.cost.currency === currency).reduce((s, r) => s + micros(r.cost.amount), 0n))]));
  const costComplete = sellers.length ? sellers.every(r => r.cost.completeness === 'complete') : null;
  const margin = contribution(sellers);
  const counts = Object.fromEntries([...new Set(dispositions.map(r => r.disposition))].sort().map(k => [k, dispositions.filter(r => r.disposition === k).length]));
  const report = {
    schema: 'x402.economic-report/1', dataset_id: input.dataset_id, service_id: input.service_id,
    as_of: input.as_of, window: { ...input.window }, classification: input.classification, input_sha256: inputHash,
    data_status: !inWindow.length && input.coverage.state !== 'complete' ? 'NO_OBSERVATIONS_SUPPLIED' : 'SUPPLIED_RECORDS_ONLY',
    coverage: JSON.parse(canonical(input.coverage)), records: { supplied: input.records.length, unique: rows.length, duplicates_collapsed: duplicates, in_window: inWindow.length, dispositions: counts },
    seller: { operations: sellers.length, fulfilled: sellers.filter(r => r.fulfillment === 'succeeded').length,
      paid_fulfillments: metric(paid.length, paidUnknown), fulfillment_failures: metric(failures.length, sellers.some(r => r.fulfillment === 'unknown')),
      unique_buyers: metric(ids.size, unknownIds > 0 || paidUnknown), repeat_buyers: metric([...ids.values()].filter(n => n >= 2).length, unknownIds > 0 || paidUnknown),
      receipts: receiptMoney(sellers, covered), paid_unfulfilled_operation_ids: paidUnfulfilled.map(r => r.operation_id),
      variable_cost_known: costs, variable_cost_complete: costComplete, contribution_proxy: margin },
    buyer: { operations: buyers.length, provider_purchase_cash: receiptMoney(buyers, covered), not_customer_revenue: true },
    dispositions,
    authority: 'RECOMMENDATIONS_ONLY', source_authenticity: 'NOT_ESTABLISHED', source_hashes: 'DECLARED_NOT_FETCHED',
    value_status: 'NOT_MEASURED_BY_THIS_REPORT',
    missing_inputs: ['Distribution/lead records are not collected by this profile.', 'Currency conversions and fixed costs are not inferred.'],
    signal_export: { status: 'ELIGIBLE', withheld: [] }, next_review: null,
  };
  if (input.classification === 'synthetic') report.signal_export.status = 'WITHHELD_SYNTHETIC';
  else if (input.coverage.state !== 'complete') report.signal_export.status = 'WITHHELD_INCOMPLETE_COVERAGE';
  else if (input.coverage.evidence.status === 'UNVERIFIED' || unresolved.length) report.signal_export.status = 'WITHHELD_UNRESOLVED_EVIDENCE';
  if (input.classification === 'synthetic') report.next_review = { code: 'DEMONSTRATION_ONLY', operation_ids: [] };
  else if (paidUnfulfilled.length) report.next_review = { code: 'REVIEW_PAID_UNFULFILLED_REQUESTS', operation_ids: paidUnfulfilled.map(r => r.operation_id) };
  else if (failures.length) report.next_review = { code: 'REVIEW_FULFILLMENT_FAILURES', operation_ids: failures.map(r => r.operation_id) };
  else if (!sellers.length) report.next_review = { code: 'VALIDATE_ONE_BUYER_PROBLEM', operation_ids: [] };
  else if (!costComplete) report.next_review = { code: 'MEASURE_VARIABLE_COSTS', operation_ids: sellers.filter(r => r.cost.completeness !== 'complete').map(r => r.operation_id) };
  else if (margin.value !== null && margin.value.startsWith('-')) report.next_review = { code: 'REVIEW_NEGATIVE_CONTRIBUTION', operation_ids: sellers.map(r => r.operation_id) };
  else report.next_review = { code: 'REVIEW_COVERAGE_AND_REPEAT_USE', operation_ids: paid.map(r => r.operation_id) };

  const candidates = [];
  for (const kind of ['paid_fulfillments', 'fulfillment_failures', 'unique_buyers', 'repeat_buyers']) {
    const m = report.seller[kind];
    if (m.value === null) report.signal_export.withheld.push({ kind, reason: 'METRIC_INPUTS_MISSING' });
    else candidates.push({ kind, value: m.value, unit: 'count' });
  }
  const toNumber = (value, kind) => {
    const negative = value.startsWith('-');
    const [whole, fraction] = (negative ? value.slice(1) : value).split('.');
    const n = (BigInt(whole) * USD_SCALE + BigInt(fraction)) * (negative ? -1n : 1n);
    if (n < -BigInt(Number.MAX_SAFE_INTEGER) || n > BigInt(Number.MAX_SAFE_INTEGER)) { report.signal_export.withheld.push({ kind, reason: 'NUMERIC_RANGE_EXCEEDED' }); return; }
    const number = Number(n) / 1e6;
    if (BigInt(Math.round(number * 1e6)) !== n) { report.signal_export.withheld.push({ kind, reason: 'NUMERIC_PRECISION_LOSS' }); return; }
    candidates.push({ kind, value: number, unit: 'USD' });
  };
  if (sellers.length && costComplete && sellers.every(r => r.cost.currency === 'USD')) toNumber(costs.USD, 'variable_cost_usd');
  else report.signal_export.withheld.push({ kind: 'variable_cost_usd', reason: 'NO_COMPLETE_USD_COST_COHORT' });
  if (margin.currency === 'USD' && margin.value !== null) toNumber(margin.value, 'contribution_margin_usd');
  else report.signal_export.withheld.push({ kind: 'contribution_margin_usd', reason: margin.reason || 'NO_IMPLICIT_CURRENCY_CONVERSION' });
  const reportHash = hash(canonical(report));
  const signals = { schema: 'flywheel.signals/0.1', as_of: input.as_of, economic: [], distribution: [] };
  // Classification/coverage are declarations, not authenticated facts. Never promote them to OBSERVED.
  if (report.signal_export.status === 'ELIGIBLE') signals.economic = candidates.map(c => ({
    signal_id: 'econ-' + hash(canonical({ service: input.service_id, window: input.window, as_of: input.as_of, kind: c.kind })).slice(0, 40),
    ...c, status: 'OWNER_REPORTED', source_ref: 'economic-report:sha256:' + reportHash,
    evidence_sha256: reportHash, observed_at: input.as_of,
  }));
  return { report, signals };
}

export function markdown(report) {
  const display = v => v === null ? 'UNKNOWN' : String(v);
  const lines = ['# Service economics — ' + (report.classification === 'synthetic' ? 'SYNTHETIC DEMO' : 'supplied-record review'), '',
    `Service: \`${report.service_id}\`  |  As of: ${report.as_of}`, '',
    `Operation window: ${report.window.start} inclusive to ${report.window.end} exclusive.`,
    `Coverage: **${report.coverage.state.toUpperCase()} (operator-declared)**. Data status: ${report.data_status}.`, '',
    '**Not a profit statement or proof of independent demand.** No source, chain, wallet, bank or customer identity is fetched or authenticated.', '',
    '## What happened in the supplied operation cohort', '',
    `- Unique in-window operations: ${report.records.in_window}; exact duplicates collapsed: ${report.records.duplicates_collapsed}.`,
    ...Object.entries(report.records.dispositions).map(([k, n]) => `- ${k}: ${n}.`), '',
    '## External seller activity (known classified subset)', '',
    '| Metric | Known subset | Complete within declared coverage |', '| --- | ---: | --- |',
    ...['paid_fulfillments', 'fulfillment_failures', 'unique_buyers', 'repeat_buyers'].map(k => `| ${k} | ${report.seller[k].known_subset} | ${display(report.seller[k].value)} |`), '',
    'Cash totals below remain UNKNOWN when coverage or classification is incomplete. Known subsets are not period totals.', '',
    'Buyer identities are operator-resolved opaque IDs, not proof that wallets represent distinct people. A refunded delivery may still count as a paid fulfillment; cash is separate.', '',
    '| Currency | Known seller gross receipts | Known seller net receipts | Seller net total | Known provider net outlay |', '| --- | ---: | ---: | ---: | ---: |'];
  if (!report.records.in_window && report.coverage.state !== 'complete') lines.push('| Not supplied | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |');
  else for (const c of ['USD', 'USDC']) lines.push(`| ${c} | ${report.seller.receipts[c].gross_known} | ${report.seller.receipts[c].net_known} | ${display(report.seller.receipts[c].net_total)} | ${report.buyer.provider_purchase_cash[c].net_known} |`);
  const margin = report.seller.contribution_proxy;
  lines.push('', `Known seller variable costs: ${report.seller.variable_cost_known.USD} USD; ${report.seller.variable_cost_known.USDC} USDC (not converted).`, `Declared variable costs complete: **${report.seller.variable_cost_complete === null ? 'NOT SUPPLIED' : report.seller.variable_cost_complete ? 'yes within classified rows' : 'no'}**.`,
    `Net fulfilled receipts less declared variable cost: **${display(margin.value)}${margin.currency ? ' ' + margin.currency : ''}**${margin.reason ? ' — ' + margin.reason : ''}.`,
    'This cohort proxy excludes fixed overhead/taxes and is not accounting revenue or profit. Provider purchases are never automatically counted as seller revenue or deducted again as seller cost. USD and USDC are not converted.', '',
    `Next review: **${report.next_review.code}**. Recommendation only; no task, payment or publication is authorized.`,
    `Flywheel export: **${report.signal_export.status}**.`,
    ...report.signal_export.withheld.map(r => `- ${r.kind}: ${r.reason}.`), '',
    'Signal source references resolve to report.json by SHA-256. Do not sum reports from overlapping windows. Empty signals mean withheld/not supplied, not zero revenue.',
    'See report.json for every disposition and declared evidence reference. Preserve the original input separately. Keep human notes in decision.md.', '');
  return lines.join('\n');
}

function ordinary(path, output = false) {
  const full = resolve(path); let p = full;
  while (true) {
    if (existsSync(p)) need(!lstatSync(p).isSymbolicLink() && realpathSync(p) === p, 'UNSAFE_PATH');
    if (output) need(!existsSync(join(p, '.git')), 'OUTPUT_IN_GIT_REFUSED');
    if (dirname(p) === p) break; p = dirname(p);
  }
  return full;
}
export function readInput(path) {
  const p = ordinary(path), info = lstatSync(p);
  need(info.isFile() && info.nlink === 1 && info.size <= MAX_BYTES, 'INPUT_FILE_REFUSED');
  const fd = openSync(p, 'r');
  try {
    const opened = fstatSync(fd); need(opened.ino === info.ino && opened.dev === info.dev, 'INPUT_CHANGED');
    const buffer = Buffer.alloc(MAX_BYTES + 1); let count = 0, n;
    do { n = readSync(fd, buffer, count, buffer.length - count, null); count += n; } while (n && count < buffer.length);
    need(count <= MAX_BYTES, 'INPUT_SIZE_REFUSED'); return buffer.subarray(0, count);
  } finally { closeSync(fd); }
}
function persist(path, bytes) {
  const fd = openSync(path, 'wx', 0o600);
  try { writeFileSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
}
export function writeReports(outputDir, result) {
  const out = ordinary(outputDir, true); need(existsSync(dirname(out)) && lstatSync(dirname(out)).isDirectory(), 'OUTPUT_PARENT_REQUIRED');
  const payloads = { 'report.json': canonical(result.report), 'signals.json': canonical(result.signals), 'report.md': markdown(result.report) };
  payloads['manifest.json'] = canonical({ schema: 'x402.economic-output/1', input_sha256: result.report.input_sha256,
    files: Object.fromEntries(Object.entries(payloads).map(([name, body]) => [name, hash(body)])), authority: 'RECOMMENDATIONS_ONLY' });
  if (existsSync(out)) {
    need(lstatSync(out).isDirectory(), 'OUTPUT_COLLISION');
    for (const [name, body] of Object.entries(payloads)) {
      need(existsSync(join(out, name)), 'PARTIAL_OUTPUT_PRESERVED');
      need(readInput(join(out, name)).equals(Buffer.from(body)), 'OUTPUT_CONFLICT_PRESERVED');
    }
    return 'UNCHANGED';
  }
  mkdirSync(out, { mode: 0o700 });
  for (const name of ['report.json', 'signals.json', 'report.md']) persist(join(out, name), payloads[name]);
  persist(join(out, 'decision.md'), '# Owner review\n\nNot reviewed. This file grants no execution authority.\n');
  persist(join(out, 'manifest.json'), payloads['manifest.json']); // Completion marker, always last.
  return 'CREATED';
}
export function main(args = process.argv.slice(2)) {
  try {
    need(args.length === 4 && args[0] === '--input' && args[2] === '--output-dir', 'USAGE_INPUT_OUTPUT_REQUIRED');
    const bytes = readInput(args[1]), result = compile(decode(bytes), hash(bytes));
    const status = writeReports(args[3], result);
    console.log(JSON.stringify({ status, data_status: result.report.data_status, signal_export: result.report.signal_export.status, actions_executed: 0 })); return 0;
  } catch (error) {
    console.log(JSON.stringify({ status: 'REFUSED', code: error instanceof Refused ? error.code : 'IO_OR_INPUT_REFUSED', actions_executed: 0 })); return 2;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
