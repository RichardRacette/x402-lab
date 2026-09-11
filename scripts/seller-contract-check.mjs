/** Offline evidence evaluation. No network, wallet, signer, SDK or payment executor. */
import { canonical, decode, hash, instant, readInput, Refused } from './economic-report.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const INPUT_SCHEMA = 'seller-contract-evidence/v1';
export const REPORT_SCHEMA = 'seller-contract-report/v1';
export const EVALUATOR_VERSION = '0.1.0';
const FIELDS = ['version', 'scheme', 'network', 'asset', 'amount', 'recipient', 'timeout', 'domainName', 'domainVersion'];
const ROLES = ['header', 'decoded-header', 'body', 'openapi', 'well-known', 'advertised', 'reported-challenge', 'documentation'];
const TOPICS = ['receipt-key', 'receipt-procedure', 'failure', 'credit', 'payer-binding', 'redemption'];
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (v, key) => object(v) && Object.hasOwn(v, key);
const need = (ok, code) => { if (!ok) throw new Refused(code); };
const equal = (a, b) => canonical(a) === canonical(b);
const text = v => typeof v === 'string' && v.length > 0 && v.length <= 2048;
const ident = v => typeof v === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(v);
function shape(v, required, optional = []) {
  need(object(v) && required.every(k => own(v, k)) && Object.keys(v).every(k => [...required, ...optional].includes(k)), 'INPUT_SHAPE_REFUSED');
}
function https(v) {
  need(text(v), 'HTTPS_URL_REQUIRED');
  let u; try { u = new URL(v); } catch { throw new Refused('HTTPS_URL_REQUIRED'); }
  need(u.protocol === 'https:' && !u.username && !u.password && !u.hash, 'HTTPS_URL_REQUIRED');
  return u;
}
function validate(input) {
  shape(input, ['schema', 'seller', 'current', 'documentation'], ['previous']);
  need(input.schema === INPUT_SCHEMA && ident(input.seller), 'INPUT_VERSION_OR_SELLER_REFUSED');
  need(object(input.current) && (!own(input, 'previous') || object(input.previous)), 'CAPTURE_SHAPE_REFUSED');
  const ids = new Set();
  for (const capture of [input.current, input.previous].filter(Boolean)) {
    shape(capture, ['observedAt', 'request', 'httpStatus', 'sources']);
    if (capture.observedAt !== null) instant(capture.observedAt);
    shape(capture.request, ['method', 'url'], ['body']);
    https(capture.request.url);
    need(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes(capture.request.method), 'METHOD_REFUSED');
    need(capture.httpStatus === null || (Number.isInteger(capture.httpStatus) && capture.httpStatus >= 100 && capture.httpStatus <= 599), 'HTTP_STATUS_REFUSED');
    need(Array.isArray(capture.sources) && capture.sources.length <= 16, 'SOURCE_LIMIT');
    for (const s of capture.sources) {
      shape(s, ['id', 'role', 'kind', 'coverage', 'url', 'observedAt', 'content', 'note'], ['originSha256', 'originLocation']);
      need(ident(s.id) && !ids.has(s.id), 'SOURCE_ID_REFUSED'); ids.add(s.id);
      need(ROLES.includes(s.role) && ['capture', 'report-derived', 'public-documentation', 'synthetic'].includes(s.kind), 'SOURCE_KIND_REFUSED');
      need(['complete', 'excerpt'].includes(s.coverage) && text(s.note), 'SOURCE_PROVENANCE_REQUIRED'); https(s.url);
      if (s.observedAt !== null) instant(s.observedAt);
      if (s.originSha256 !== undefined) need(/^[a-f0-9]{64}$/.test(s.originSha256), 'ORIGIN_HASH_REFUSED');
      if (s.originLocation !== undefined) need(text(s.originLocation), 'ORIGIN_LOCATION_REFUSED');
      // A prose report is never passed off as an original HTTP representation.
      if (['header', 'decoded-header', 'body'].includes(s.role)) need(['capture', 'synthetic'].includes(s.kind), 'CAPTURE_PROVENANCE_REQUIRED');
      if (s.role === 'reported-challenge') need(s.kind === 'report-derived', 'REPORT_PROVENANCE_REQUIRED');
    }
  }
  need(Array.isArray(input.documentation) && input.documentation.length <= 24, 'DOCUMENTATION_LIMIT');
  for (const d of input.documentation) {
    shape(d, ['topic', 'coverage', 'value', 'refs']);
    need(TOPICS.includes(d.topic) && ['complete', 'partial', 'not-applicable'].includes(d.coverage) && text(d.value), 'DOCUMENTATION_SHAPE_REFUSED');
    need(Array.isArray(d.refs) && d.refs.length > 0 && d.refs.length <= 4, 'DOCUMENTATION_REFS_REQUIRED');
    for (const r of d.refs) {
      shape(r, ['source', 'pointer', 'quote']);
      need(ident(r.source) && typeof r.pointer === 'string' && (r.pointer === '' || r.pointer.startsWith('/')) && r.pointer.length <= 2048 && text(r.quote), 'REFERENCE_SHAPE_REFUSED');
    }
  }
}
function pointer(value, path) {
  if (path === '') return value;
  if (/~(?![01])/u.test(path)) return undefined;
  for (const part of path.slice(1).split('/')) {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, key)) return undefined;
    value = value[key];
  }
  return value;
}
const ref = (s, pointer = '') => ({ source: s.id, pointer, view: s.role === 'header' && pointer ? 'decoded-header' : 'content' });
const address = v => typeof v === 'string' && /^0x[0-9a-fA-F]{40}$/.test(v);
function valid(field, v) {
  if (field === 'version' || field === 'timeout') return Number.isSafeInteger(v) && v > 0;
  if (field === 'amount') return typeof v === 'string' && /^[1-9][0-9]{0,77}$/.test(v);
  return text(v);
}
function terms(value, base = '', payment = false) {
  const paths = payment ? {
    version: '/x402Version', scheme: '/scheme', network: '/network', asset: '/asset', amount: '/price/amountMinor', recipient: '/payTo', timeout: '/maxTimeoutSeconds', domainName: '/extra/name', domainVersion: '/extra/version'
  } : {
    version: '/x402Version', scheme: '/accepts/0/scheme', network: '/accepts/0/network', asset: '/accepts/0/asset', amount: '/accepts/0/amount', recipient: '/accepts/0/payTo', timeout: '/accepts/0/maxTimeoutSeconds', domainName: '/accepts/0/extra/name', domainVersion: '/accepts/0/extra/version'
  };
  return Object.fromEntries(FIELDS.map(field => {
    let v = pointer(value, paths[field]);
    const invalid = payment && field === 'amount' && v != null && (!Number.isSafeInteger(v) || v < 0);
    if (payment && field === 'amount' && Number.isSafeInteger(v) && v >= 0) v = String(v);
    return [field, { value: v ?? null, pointer: base + paths[field], invalid }];
  }));
}
function extract(s, request, observedAt) {
  let value = s.content, base = '';
  if (['header', 'decoded-header', 'body'].includes(s.role) && s.url !== request.url) return { status: 'FAIL', reason: 'Capture source URL contradicts the supplied request URL.' };
  if (['header', 'decoded-header', 'body'].includes(s.role) && s.observedAt && observedAt && instant(s.observedAt) !== instant(observedAt)) return { status: 'FAIL', reason: 'Capture source time contradicts the supplied observation time.' };
  if (s.role === 'header') {
    try {
      need(typeof value === 'string' && value.length <= 16384 && /^[A-Za-z0-9+/]+={0,2}$/.test(value), 'HEADER_INVALID');
      const bytes = Buffer.from(value, 'base64');
      const encoded = bytes.toString('base64');
      need(value === encoded || value === encoded.replace(/=+$/, ''), 'HEADER_INVALID');
      value = decode(bytes);
    } catch { return { status: 'FAIL', reason: 'Malformed, oversized, or ambiguous base64/UTF-8/JSON header.' }; }
  }
  if (['advertised', 'reported-challenge'].includes(s.role)) {
    if (!object(value)) return { status: 'FAIL', reason: 'Expected explicitly normalized field declarations.' };
    return { status: 'PASS', reason: 'Supplied normalized declarations; provenance retained.', terms: Object.fromEntries(FIELDS.map(k => [k, { value: value[k] ?? null, pointer: '/' + k }])) };
  }
  if (s.role === 'openapi') {
    const url = new URL(request.url);
    base = '/paths/' + url.pathname.replace(/~/g, '~0').replace(/\//g, '~1') + '/' + request.method.toLowerCase();
    const operation = pointer(value, base);
    if (!object(operation)) return { status: 'UNKNOWN', reason: 'Exact OpenAPI path/method operation is unavailable; templates are not guessed.' };
    const servers = operation.servers ?? pointer(value, base.slice(0, base.lastIndexOf('/')))?.servers ?? value.servers;
    if (!Array.isArray(servers) || servers.length !== 1 || servers[0]?.url !== url.origin) return { status: 'UNKNOWN', reason: 'One explicit matching OpenAPI server origin is required by this bounded parser.' };
    base += '/x-payment-info'; value = pointer(value, base);
    if (!object(value)) return { status: 'UNKNOWN', reason: 'Exact operation has no supplied x-payment-info.' };
    return { status: 'PASS', reason: 'Exact operation payment declarations extracted; absent fields stay unknown.', terms: terms(value, base, true) };
  }
  if (s.role === 'well-known') {
    const urls = Array.isArray(value?.resources) ? value.resources.map((r, i) => ({ r, i })).filter(({ r }) => r?.resource?.url === request.url) : [];
    const methods = urls.filter(({ r }) => r.method === request.method);
    const found = methods.length ? methods : urls;
    if (found.length !== 1) return { status: 'UNKNOWN', reason: 'No unique descriptor entry for the exact resource URL.' };
    base = '/resources/' + found[0].i;
    value = { ...found[0].r, x402Version: value.x402Version };
    if (value.method !== request.method) return { status: value.method == null ? 'UNKNOWN' : 'FAIL', reason: 'Descriptor method is absent or contradicts the supplied request.' };
  }
  if (!object(value) || !Array.isArray(value.accepts)) return { status: 'FAIL', reason: 'Supplied challenge is not an object with accepts.' };
  if (value.accepts.length !== 1) return { status: 'UNKNOWN', reason: 'Only one offer is supported; no alternative is silently selected.' };
  if (!object(value.accepts[0])) return { status: 'FAIL', reason: 'The sole supplied offer is not an object.' };
  const extracted = terms(value, base);
  if (s.role === 'well-known') extracted.version.pointer = '/x402Version';
  return { status: 'PASS', reason: 'Single supplied offer extracted; no signing or settlement validation.', terms: extracted, decoded: value };
}

function observation(parsed) {
  for (const roles of [['header', 'decoded-header'], ['body'], ['reported-challenge']]) {
    const candidates = parsed.filter(p => roles.includes(p.source.role));
    if (candidates.length) return candidates.length === 1 && candidates[0].terms ? candidates[0] : null;
  }
  return null;
}
function documentationChecks(input, add) {
  const sources = new Map(input.current.sources.map(s => [s.id, s]));
  for (const topic of TOPICS) {
    const claims = input.documentation.filter(d => d.topic === topic), refs = claims.flatMap(d => d.refs);
    let missing = false, invalid = false;
    for (const r of refs) {
      const source = sources.get(r.source), value = source ? pointer(source.content, r.pointer) : undefined;
      if (value === undefined) missing = true;
      else if (!['documentation', 'openapi', 'well-known', 'advertised'].includes(source.role)) invalid = true;
      else if (typeof value !== 'string' || !value.includes(r.quote)) invalid = true;
    }
    const complete = claims.filter(c => c.coverage === 'complete');
    const na = claims.filter(c => c.coverage === 'not-applicable');
    const conflict = new Set(complete.map(c => c.value)).size > 1 || (na.length > 0 && complete.length > 0);
    const status = invalid ? 'FAIL' : missing || !claims.length ? 'UNKNOWN' : conflict ? 'FAIL'
      : claims.some(c => c.coverage === 'partial') ? 'UNKNOWN' : na.length ? 'NOT_APPLICABLE' : 'PASS';
    const reason = invalid ? 'Citation does not match the supplied source text.' : missing || !claims.length ? 'Cited evidence is unavailable or no documentation claim was supplied.'
      : conflict ? 'Cited normalized declarations conflict; the evaluator does not resolve prose meaning.'
        : status === 'UNKNOWN' ? 'Reviewer marked the cited documentation incomplete; no behavior inferred.'
          : status === 'NOT_APPLICABLE' ? 'Cited reviewer declaration explicitly excludes this contract feature.'
            : 'Complete reviewer-normalized declaration has matching citations; promise only, not verified behavior.';
    add('documentation.' + topic, status, reason, refs, claims.map(({ coverage, value }) => ({ coverage, value })));
  }
}
function driftCheck(input, current, add) {
  const previous = input.previous;
  const unknown = reason => add('drift.terms', 'UNKNOWN', reason);
  if (!previous || !current) return unknown('Two comparable dated capture representations are required.');
  if (previous.httpStatus !== 402 || input.current.httpStatus !== 402 || !equal(previous.request, input.current.request)) return unknown('Request method, URL, body and unpaid response status must be comparable.');
  if (!previous.observedAt || !input.current.observedAt || instant(previous.observedAt) >= instant(input.current.observedAt)) return unknown('Capture times must be known and strictly increasing.');
  const parsed = previous.sources.filter(s => s.role !== 'documentation').map(s => ({ source: s, ...extract(s, previous.request, previous.observedAt) }));
  const before = observation(parsed);
  if (!before || !['capture', 'synthetic'].includes(before.source.kind) || before.source.kind !== current.source.kind
    || before.source.role !== current.source.role || before.source.coverage !== current.source.coverage
    || before.source.observedAt !== previous.observedAt || current.source.observedAt !== input.current.observedAt) return unknown('Comparable original/decoded captures of the same provenance are unavailable; reports are not captures.');
  if (FIELDS.some(k => !valid(k, before.terms[k].value) || !valid(k, current.terms[k].value))) return unknown('Complete comparable payment fields are unavailable.');
  const normalize = (field, v) => ['asset', 'recipient'].includes(field) && address(v) ? v.toLowerCase() : v;
  const changed = FIELDS.filter(k => !equal(normalize(k, before.terms[k].value), normalize(k, current.terms[k].value)));
  add('drift.terms', changed.length ? 'FAIL' : 'PASS', 'Dated supplied payment fields compared; no claim about unobserved intervals or other response fields.',
    [ref(before.source), ref(current.source)], { previousObservedAt: previous.observedAt, currentObservedAt: input.current.observedAt, changed });
}

/** Buffer-only entrypoint: strict, bounded JSON in; deterministic data out. */
export function evaluate(bytes) {
  const input = decode(bytes); validate(input);
  const checks = [], current = input.current;
  const add = (id, status, reason, refs = [], values = null) => checks.push({ id, status, reason, refs, values });
  const parsed = current.sources.filter(s => s.role !== 'documentation').map(s => ({ source: s, ...extract(s, current.request, current.observedAt) }));
  for (const p of parsed) add('parse.' + p.source.id, p.status, p.reason, [ref(p.source)]);
  const headers = parsed.filter(p => ['header', 'decoded-header'].includes(p.source.role));
  const bodies = parsed.filter(p => p.source.role === 'body');
  const observed = observation(parsed);
  const h = headers.length === 1 ? headers[0] : null, b = bodies.length === 1 ? bodies[0] : null;
  add('http.402', current.httpStatus === null ? 'UNKNOWN' : current.httpStatus === 402 ? 'PASS' : 'FAIL', 'Supplied HTTP status only; not proof of a payment contract.', [{ packet: 'current', pointer: '/httpStatus' }], current.httpStatus);
  add('header.encoding', !h ? 'UNKNOWN' : h.source.role === 'decoded-header' ? 'UNKNOWN' : h.status,
    !h || h.source.role === 'decoded-header' ? 'Original encoded header unavailable; never reconstructed from JSON.' : h.reason, h ? [ref(h.source)] : []);
  add('header.body', !h?.decoded || !b?.decoded ? 'UNKNOWN' : equal(h.decoded, b.decoded) ? 'PASS' : 'FAIL',
    'Compares supplied decoded JSON only; excerpts do not establish full origin or byte equality.', [...headers, ...bodies].map(p => ref(p.source)));
  const declarations = parsed.filter(p => ['advertised', 'openapi', 'well-known'].includes(p.source.role));
  for (const field of FIELDS) {
    const actual = observed?.terms[field];
    const rows = declarations.map(p => ({ p, term: p.terms?.[field] }));
    if (!rows.length) add('advertised.' + field, 'UNKNOWN', 'No supplied advertisement/documentation evidence.', actual ? [ref(observed.source, actual.pointer)] : []);
    for (const { p, term } of rows) {
      const a = actual?.value ?? null, expected = term?.value ?? null;
      const normalize = v => ['asset', 'recipient'].includes(field) && address(v) ? v.toLowerCase() : v;
      const invalid = a !== null && (!valid(field, a) || actual.invalid) || expected !== null && (!valid(field, expected) || term.invalid);
      add('agreement.' + p.source.id + '.' + field, invalid ? 'FAIL' : a === null || expected === null ? 'UNKNOWN' : equal(normalize(a), normalize(expected)) ? 'PASS' : 'FAIL',
        invalid ? 'Invalid supplied field representation; equality cannot make it valid.' : 'Explicit supplied declarations compared; missing metadata is not a contradiction or an inferred value.',
        [...(actual ? [ref(observed.source, actual.pointer)] : []), ref(p.source, term?.pointer ?? '')], { observed: a, declared: expected });
    }
  }
  const resource = observed?.decoded?.resource?.url ?? (observed?.source.role === 'reported-challenge' ? observed.source.content.resource : null);
  add('challenge.resource', resource == null ? 'UNKNOWN' : resource === current.request.url ? 'PASS' : 'FAIL', 'Supplied challenge resource compared with the exact requested URL.', observed ? [ref(observed.source, observed.source.role === 'reported-challenge' ? '/resource' : '/resource/url')] : [], resource ?? null);
  const method = observed?.decoded?.extensions?.bazaar?.info?.input?.method;
  add('challenge.method', method == null ? 'UNKNOWN' : method === current.request.method ? 'PASS' : 'FAIL', 'Optional supplied Bazaar method compared with the request; absence is not a protocol failure.', observed ? [ref(observed.source, '/extensions/bazaar/info/input/method')] : [], method ?? null);
  const profile = observed?.terms.version.value === 2 && observed.terms.scheme.value === 'exact' && typeof observed.terms.network.value === 'string' && /^eip155:[1-9][0-9]*$/.test(observed.terms.network.value);
  for (const field of FIELDS) {
    const t = observed?.terms[field], value = t?.value ?? null;
    const present = value !== null;
    const validValue = valid(field, value) && (!['asset', 'recipient'].includes(field) || address(value));
    const reportOnly = observed?.source.kind === 'report-derived';
    add('signing.' + field, reportOnly || !profile ? 'UNKNOWN' : !present ? observed.source.coverage === 'complete' ? 'FAIL' : 'UNKNOWN' : validValue ? 'PASS' : 'FAIL',
      reportOnly ? 'Field described in a historical report; original challenge metadata is unavailable.' : !profile ? 'Signing-metadata profile limited to x402 v2 exact EVM; unavailable/unsupported profile.' : !present ? 'Required metadata absent from supplied evidence; excerpt omission is not origin absence.' : 'Required v2 exact EVM field has a valid supplied shape; no domain, key, ownership or signature verified.',
      t ? [ref(observed.source, t.pointer)] : [], value);
  }
  documentationChecks(input, add);
  driftCheck(input, observed, add);
  return { schema: REPORT_SCHEMA, evaluatorVersion: EVALUATOR_VERSION, inputSha256: hash(bytes), seller: input.seller, sourceTrust: 'untrusted',
    observedAt: current.observedAt, request: current.request,
    evidence: [current, input.previous].filter(Boolean).flatMap(c => c.sources.map(({ content, ...s }) => ({ ...s, contentSha256: hash(canonical(content)), hashBasis: 'canonical-supplied-json', originHashVerification: 'NOT_PERFORMED' }))),
    checks, observedBehavior: { fulfillment: 'UNTESTED', creditRedemption: 'UNTESTED', settlement: 'UNTESTED', receiptVerification: 'UNTESTED' },
    limitations: ['Offline supplied evidence only; source authenticity and freshness are not independently verified.', 'PASS describes an individual evidence check, never safety, identity, trust, or authority to pay.', 'No paid behavior is evaluated; documented promises cannot demonstrate fulfillment or redemption.', 'Original response hashes are supplied provenance, not recomputable from excerpts or decoded JSON.', 'Documentation coverage and normalized claim values are reviewer assertions; matching citations do not validate their interpretation.', 'Parser supports one offer, exact OpenAPI paths and one explicit server origin; other layouts remain unresolved.', 'Signing checks cover the v2 exact EVM metadata profile only; no wallet or protocol execution dependencies are loaded.'] };
}

export function main(args = process.argv.slice(2)) {
  try {
    need(args.length === 2 && args[0] === '--input', 'USAGE_INPUT_REQUIRED');
    process.stdout.write(canonical(evaluate(readInput(args[1])))); return 0;
  } catch (error) {
    process.stdout.write(canonical({ status: 'REFUSED', code: error instanceof Refused ? error.code : 'INPUT_OR_IO_REFUSED' })); return 2;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
