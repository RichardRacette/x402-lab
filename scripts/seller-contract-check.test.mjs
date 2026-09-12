import test from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonical } from './economic-report.mjs';
import { evaluate, INPUT_SCHEMA } from './seller-contract-check.mjs';
const at = '2026-09-10T23:50:39.128Z', url = 'https://seller.example.invalid/search';
const quote = () => ({ x402Version: 2, resource: { url }, accepts: [{ scheme: 'exact', network: 'eip155:8453', asset: '0x' + '11'.repeat(20), amount: '10000', payTo: '0x' + '22'.repeat(20), maxTimeoutSeconds: 600, extra: { name: 'USD Coin', version: '2' } }] });
const source = (id, role, content) => ({ id, role, content, kind: 'synthetic', coverage: 'complete', url, observedAt: at, note: 'Synthetic regression; not a seller observation.' });
const fixture = () => ({ schema: INPUT_SCHEMA, seller: 'synthetic-seller', current: { observedAt: at, request: { method: 'POST', url, body: { query: 'synthetic query' } }, httpStatus: 402, sources: [source('header', 'header', Buffer.from(JSON.stringify(quote())).toString('base64')), source('body', 'body', quote()), source('ad', 'advertised', { version: 2, scheme: 'exact', network: 'eip155:8453', asset: '0x' + '11'.repeat(20), amount: '10000', recipient: '0x' + '22'.repeat(20) })] }, documentation: [] });
const run = f => evaluate(Buffer.from(JSON.stringify(f)));
const check = (r, id) => { const c = r.checks.find(c => c.id === id); assert.ok(c, id); return c; };

test('matching supplied terms produce individual checks, never a payment verdict', () => {
  const r = run(fixture());
  assert.equal(check(r, 'header.body').status, 'PASS');
  for (const field of ['version', 'scheme', 'network', 'asset', 'amount', 'recipient']) assert.equal(check(r, 'agreement.ad.' + field).status, 'PASS');
  assert.equal(r.observedBehavior.fulfillment, 'UNTESTED');
  assert.equal(r.observedBehavior.creditRedemption, 'UNTESTED');
  assert.equal('score' in r || 'safeToPay' in r || 'status' in r, false);
});
test('mismatches are failures, absence is unknown, and identical inputs are deterministic', () => {
  const f = fixture(); f.current.sources[1].content.accepts[0].amount = '20000'; f.current.sources[2].content.network = 'eip155:1';
  const r = run(f); assert.equal(check(r, 'header.body').status, 'FAIL'); assert.equal(check(r, 'agreement.ad.network').status, 'FAIL');
  assert.equal(check(r, 'agreement.ad.timeout').status, 'UNKNOWN'); assert.deepEqual(run(f), r);
});
for (const invalid of ['!', Buffer.from('{"x402Version":2,"x402Version":1}').toString('base64'), Buffer.from([0xff]).toString('base64'), 'A'.repeat(16385)]) {
  test('malformed header cannot be rescued by a matching body: ' + invalid.slice(0, 12), () => {
    const f = fixture(); f.current.sources[0].content = invalid;
    const r = run(f); assert.equal(check(r, 'header.encoding').status, 'FAIL'); assert.equal(check(r, 'header.body').status, 'UNKNOWN');
    assert.equal(check(r, 'agreement.ad.amount').status, 'UNKNOWN');
  });
}
test('missing evidence and unsupported alternatives do not produce a pass', () => {
  const f = fixture(); f.current.sources = []; f.current.httpStatus = null;
  assert.ok(run(f).checks.every(c => c.status === 'UNKNOWN'));
  const g = fixture(); const q = quote(); q.accepts.push(q.accepts[0]); g.current.sources[0].content = Buffer.from(JSON.stringify(q)).toString('base64');
  assert.equal(check(run(g), 'parse.header').status, 'UNKNOWN');
});
test('report-derived facts cannot be labelled as original HTTP captures', () => {
  const f = fixture(); f.current.sources[0].kind = 'report-derived'; assert.throws(() => run(f), /CAPTURE_PROVENANCE_REQUIRED/);
});

for (const [field, value] of Object.entries({ version: 1, scheme: 'upto', network: 'eip155:1', asset: '0x' + '33'.repeat(20), amount: '20000', recipient: '0x' + '44'.repeat(20) })) {
  test('advertised ' + field + ' disagreement includes both source locations and values', () => {
    const f = fixture(); f.current.sources[2].content[field] = value;
    const c = check(run(f), 'agreement.ad.' + field); assert.equal(c.status, 'FAIL');
    assert.equal(c.values.declared, value); assert.deepEqual(c.refs.map(r => r.source), ['header', 'ad']);
    assert.equal(c.refs[0].view, 'decoded-header');
  });
}
function openapi() {
  return { openapi: '3.1.0', info: { version: '1.0.0' }, servers: [{ url: 'https://seller.example.invalid' }], paths: { '/search': { post: { 'x-payment-info': {
    x402Version: 2, network: 'eip155:8453', asset: quote().accepts[0].asset, payTo: quote().accepts[0].payTo, price: { amountMinor: 10000 }
  } }, get: { 'x-payment-info': { x402Version: 99 } } } } };
}
test('exact OpenAPI operation supports numeric amountMinor and preserves metadata omissions', () => {
  const f = fixture(); f.current.sources.push(source('openapi', 'openapi', openapi()));
  const r = run(f); assert.equal(check(r, 'agreement.openapi.amount').status, 'PASS');
  assert.equal(check(r, 'agreement.openapi.version').status, 'PASS');
  for (const field of ['scheme', 'timeout', 'domainName', 'domainVersion']) assert.equal(check(r, 'agreement.openapi.' + field).status, 'UNKNOWN');
  assert.equal(check(r, 'agreement.openapi.amount').refs[1].pointer, '/paths/~1search/post/x-payment-info/price/amountMinor');
});
test('unsupported OpenAPI locations and malformed amountMinor never become a pass', () => {
  for (const mutate of [o => { o.paths['/different'] = o.paths['/search']; delete o.paths['/search']; }, o => { o.servers[0].url = 'https://other.invalid'; }]) {
    const f = fixture(), o = openapi(); mutate(o); f.current.sources.push(source('openapi', 'openapi', o));
    assert.equal(check(run(f), 'parse.openapi').status, 'UNKNOWN');
  }
  const f = fixture(), o = openapi(); o.paths['/search'].post['x-payment-info'].price.amountMinor = '10000'; f.current.sources.push(source('openapi', 'openapi', o));
  assert.equal(check(run(f), 'agreement.openapi.amount').status, 'FAIL');
});
test('descriptor uses exact URL/method and cannot cherry-pick duplicate entries', () => {
  const f = fixture(), q = quote(), w = { x402Version: 2, resources: [{ resource: q.resource, accepts: q.accepts, method: 'POST' }] };
  f.current.sources.push(source('well-known', 'well-known', w));
  assert.equal(check(run(f), 'agreement.well-known.recipient').status, 'PASS');
  w.resources[0].method = 'GET'; assert.equal(check(run(f), 'parse.well-known').status, 'FAIL');
  w.resources[0].method = 'POST'; w.resources.push(w.resources[0]); assert.equal(check(run(f), 'parse.well-known').status, 'UNKNOWN');
});
test('required signing metadata absence fails complete evidence, stays unknown for an excerpt', () => {
  const f = fixture(); const q = quote(); delete q.accepts[0].extra; delete q.accepts[0].maxTimeoutSeconds;
  f.current.sources[0] = source('header', 'decoded-header', q);
  const r = run(f); for (const field of ['timeout', 'domainName', 'domainVersion']) assert.equal(check(r, 'signing.' + field).status, 'FAIL');
  assert.equal(check(r, 'header.encoding').status, 'UNKNOWN');
  f.current.sources[0].coverage = 'excerpt'; assert.equal(check(run(f), 'signing.domainName').status, 'UNKNOWN');
});
test('invalid signing shapes and resource mismatch are visible without any signing dependency', () => {
  const f = fixture(), q = quote(); q.accepts[0].payTo = 'invalid'; q.accepts[0].amount = '0'; q.accepts[0].maxTimeoutSeconds = -1; q.resource.url += '/wrong';
  f.current.sources[0] = source('header', 'decoded-header', q);
  for (const field of ['recipient', 'amount', 'timeout']) assert.equal(check(run(f), 'signing.' + field).status, 'FAIL');
  assert.equal(check(run(f), 'challenge.resource').status, 'FAIL');
  q.accepts[0].network = {}; assert.equal(check(run(f), 'signing.recipient').status, 'UNKNOWN');
});
function addDoc(f, topic, value, coverage = 'complete', quote = value) {
  const id = 'doc-' + f.documentation.length;
  f.current.sources.push(source(id, 'documentation', { policy: quote }));
  f.documentation.push({ topic, value, coverage, refs: [{ source: id, pointer: '/policy', quote }] });
}
test('receipt and credit claims require cited structured review; prose alone does not pass', () => {
  const f = fixture(); f.current.sources.push(source('prose', 'documentation', 'DSSE key, procedure, failure credit and payer binding are all wonderful.'));
  assert.equal(check(run(f), 'documentation.receipt-key').status, 'UNKNOWN');
  for (const topic of ['receipt-key', 'receipt-procedure', 'failure', 'credit', 'payer-binding', 'redemption']) addDoc(f, topic, 'normalized-' + topic);
  const r = run(f); for (const c of r.checks.filter(c => c.id.startsWith('documentation.'))) assert.equal(c.status, 'PASS');
  assert.deepEqual(r.observedBehavior, { fulfillment: 'UNTESTED', creditRedemption: 'UNTESTED', settlement: 'UNTESTED', receiptVerification: 'UNTESTED' });
});
test('conflicting normalized documentation, partial contracts and explicit nonapplicability are distinct', () => {
  const f = fixture(); addDoc(f, 'credit', 'service-credit'); addDoc(f, 'credit', 'on-chain-refund');
  addDoc(f, 'payer-binding', 'token-access-without-payer-link', 'partial'); addDoc(f, 'redemption', 'no-service-credit-exists', 'not-applicable');
  const r = run(f); assert.equal(check(r, 'documentation.credit').status, 'FAIL'); assert.equal(check(r, 'documentation.payer-binding').status, 'UNKNOWN'); assert.equal(check(r, 'documentation.redemption').status, 'NOT_APPLICABLE');
  addDoc(f, 'redemption', 'redeem-with-token'); assert.equal(check(run(f), 'documentation.redemption').status, 'FAIL');
});
test('fabricated citations fail and missing cited evidence stays unknown', () => {
  const f = fixture(); addDoc(f, 'receipt-key', 'public-key-url'); f.documentation[0].refs[0].quote = 'absent-quote';
  assert.equal(check(run(f), 'documentation.receipt-key').status, 'FAIL');
  f.documentation[0].refs[0].source = 'missing'; assert.equal(check(run(f), 'documentation.receipt-key').status, 'UNKNOWN');
});
function pair() {
  const f = fixture(); f.previous = structuredClone(f.current); f.previous.observedAt = '2026-09-09T23:50:39.128Z';
  for (const s of f.previous.sources) { s.id = 'old-' + s.id; s.observedAt = f.previous.observedAt; }
  return f;
}
test('drift requires two comparable captures and reports only changed supplied terms', () => {
  const f = pair(); assert.equal(check(run(f), 'drift.terms').status, 'PASS');
  const q = quote(); q.accepts[0].amount = '20000'; f.current.sources[0].content = Buffer.from(JSON.stringify(q)).toString('base64');
  const c = check(run(f), 'drift.terms'); assert.equal(c.status, 'FAIL'); assert.deepEqual(c.values.changed, ['amount']);
});
for (const [name, mutate] of [
  ['same date', f => { f.previous.observedAt = at; }], ['missing date', f => { f.previous.observedAt = null; }],
  ['different body', f => { f.previous.request.body.query = 'different request'; }], ['different URL', f => { f.previous.request.url += '?page=2'; }],
  ['different method', f => { f.previous.request.method = 'GET'; }], ['different status', f => { f.previous.httpStatus = 200; }],
  ['missing metadata', f => { const q = quote(); delete q.accepts[0].extra; f.previous.sources[0].content = Buffer.from(JSON.stringify(q)).toString('base64'); }],
  ['reported facts', f => { f.previous.sources = [source('old-report', 'reported-challenge', f.current.sources[2].content)]; f.previous.sources[0].kind = 'report-derived'; }]
]) test('drift stays unknown for ' + name, () => { const f = pair(); mutate(f); assert.equal(check(run(f), 'drift.terms').status, 'UNKNOWN'); });
test('input version, duplicate source IDs, timestamps and unexpected instructions are refused', () => {
  for (const mutate of [f => { f.schema = 'other'; }, f => { f.current.sources.push(f.current.sources[0]); }, f => { f.current.observedAt = '2026-02-30T00:00:00Z'; }, f => { f.executePayment = true; }]) {
    const f = fixture(); mutate(f); assert.throws(() => run(f));
  }
  assert.throws(() => evaluate(Buffer.from('{"schema":1,"schema":2}')), /DUPLICATE_JSON_KEY/);
  assert.throws(() => evaluate(Buffer.alloc(524289)), /INPUT_SIZE_REFUSED/);
});
test('evaluation is reproducible with fetch disabled and canonical object key order', () => {
  const guard = mock.method(globalThis, 'fetch', () => { throw new Error('NETWORK_FORBIDDEN'); });
  try {
    const f = fixture(); f.current.sources[1].content = JSON.parse(canonical(quote()));
    const bytes = Buffer.from(canonical(f)); assert.deepEqual(evaluate(bytes), evaluate(bytes)); assert.equal(check(evaluate(bytes), 'header.body').status, 'PASS');
    assert.equal(guard.mock.callCount(), 0);
  } finally { guard.mock.restore(); }
});
test('CLI reads exactly the supplied packet, emits deterministic JSON, and refuses extra flags', () => {
  const dir = mkdtempSync(join(tmpdir(), 'contract-check-')), path = join(dir, 'input.json'); writeFileSync(path, canonical(fixture()));
  const invoke = args => spawnSync(process.execPath, ['scripts/seller-contract-check.mjs', ...args], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  const a = invoke(['--input', path]), b = invoke(['--input', path]); assert.equal(a.status, 0); assert.equal(a.stdout, b.stdout);
  assert.equal(JSON.parse(a.stdout).schema, 'seller-contract-report/v1');
  const bad = invoke(['--run-unpaid', 'SYNTHETIC_PRIVATE_ARGUMENT']); assert.equal(bad.status, 2); assert.doesNotMatch(bad.stdout + bad.stderr, /SYNTHETIC_PRIVATE_ARGUMENT/);
});
test('Ghost fixture preserves capture excerpts, metadata gaps, and untested promises', () => {
  const bytes = readFileSync(new URL('../fixtures/seller-contract-check/ghost.json', import.meta.url)), f = JSON.parse(bytes), r = evaluate(bytes);
  assert.equal(f.current.sources.find(s => s.role === 'decoded-header').kind, 'capture');
  assert.equal(f.current.sources.some(s => s.role === 'header'), false);
  assert.equal(check(r, 'header.body').status, 'PASS'); assert.equal(check(r, 'header.encoding').status, 'UNKNOWN');
  assert.equal(check(r, 'agreement.ghost-openapi.amount').status, 'PASS'); assert.equal(check(r, 'agreement.ghost-openapi.scheme').status, 'UNKNOWN');
  for (const field of ['asset', 'amount', 'recipient']) {
    assert.equal(check(r, 'agreement.ghost-advertised.' + field).status, 'UNKNOWN');
    assert.equal(check(r, 'agreement.ghost-advertised.' + field).values.declared, null);
  }
  assert.equal(check(r, 'documentation.failure').status, 'PASS');
  for (const topic of ['receipt-key', 'receipt-procedure', 'credit', 'payer-binding', 'redemption']) assert.equal(check(r, 'documentation.' + topic).status, 'UNKNOWN');
  assert.equal(check(r, 'drift.terms').status, 'UNKNOWN'); assert.equal(r.observedBehavior.creditRedemption, 'UNTESTED');
  assert.ok(r.evidence.every(s => s.contentSha256.length === 64 && s.originHashVerification === 'NOT_PERFORMED'));
});
test('unrelated x402scan fixture retains historical report provenance without fabricated raw evidence', () => {
  const bytes = readFileSync(new URL('../fixtures/seller-contract-check/x402scan.json', import.meta.url)), r = evaluate(bytes);
  assert.equal(r.seller, 'x402scan'); assert.equal(r.observedAt, '2026-08-25T12:07:58.000Z');
  assert.ok(r.evidence.every(s => s.kind === 'report-derived'));
  for (const id of ['header.encoding', 'header.body', 'advertised.amount', 'signing.domainName', 'drift.terms']) assert.equal(check(r, id).status, 'UNKNOWN');
  assert.equal(r.observedBehavior.fulfillment, 'UNTESTED');
});
test('excess base64 padding fails and a supplied Bazaar method contradiction is retained', () => {
  const f = fixture(), encoded = f.current.sources[0].content.replace(/=+$/, '');
  f.current.sources[0].content = encoded + (encoded.length % 4 === 2 ? '=' : '==');
  assert.equal(check(run(f), 'header.encoding').status, 'FAIL');
  const q = quote(); q.extensions = { bazaar: { info: { input: { method: 'GET' } } } };
  f.current.sources[0] = source('header', 'decoded-header', q);
  assert.equal(check(run(f), 'challenge.method').status, 'FAIL');
});
test('descriptor can separate GET and POST entries sharing a URL', () => {
  const f = fixture(), q = quote();
  f.current.sources.push(source('well-known', 'well-known', { x402Version: 2, resources: [{ resource: q.resource, method: 'GET', accepts: [] }, { resource: q.resource, method: 'POST', accepts: q.accepts }] }));
  assert.equal(check(run(f), 'agreement.well-known.amount').status, 'PASS');
});
test('evidence from a different HTTP source cannot establish request agreement or drift', () => {
  const f = pair(); f.current.sources[0].url = 'https://other.invalid/search';
  const r = run(f); assert.equal(check(r, 'parse.header').status, 'FAIL');
  assert.equal(check(r, 'agreement.ad.amount').status, 'UNKNOWN'); assert.equal(check(r, 'drift.terms').status, 'UNKNOWN');
});

test('known capture time contradictions cannot establish header/body or term agreement', () => {
  for (const role of ['header', 'decoded-header', 'body']) {
    const f = fixture(); f.current.sources[0] = source('http-source', role, role === 'header' ? f.current.sources[0].content : quote());
    f.current.sources = [f.current.sources[0], f.current.sources[2]];
    f.current.sources[0].observedAt = '2020-01-01T00:00:00Z';
    const r = run(f); assert.equal(check(r, 'parse.http-source').status, 'FAIL');
    assert.equal(check(r, 'header.body').status, 'UNKNOWN'); assert.equal(check(r, 'agreement.ad.amount').status, 'UNKNOWN');
    f.current.observedAt = '2020-01-01T00:00:00.000Z';
    assert.equal(check(run(f), 'parse.http-source').status, 'PASS');
  }
});
