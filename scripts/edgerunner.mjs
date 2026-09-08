#!/usr/bin/env node
/** Offline compiler for agent-curated PUBLIC scout records. No network or model calls. */
import { createHash } from 'node:crypto';
import { openSync, closeSync, fstatSync, readFileSync, mkdirSync, writeFileSync, constants } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LIMIT = 512 * 1024;
const actions = ['REUSE', 'TEST', 'WATCH', 'REJECT'];
const bases = ['PRIMARY_DOCUMENTATION', 'PRIMARY_RELEASE', 'PROVIDER_PRICING', 'DISCOVERY_LEAD'];
const commercial = ['NONE', 'PRICING_ONLY', 'SELF_REPORTED_DEMAND', 'OBSERVED_DEMAND'];
const fail = () => { throw new Error('INVALID_SCOUT_RECORD'); };
const hash = value => createHash('sha256').update(value).digest('hex');
const stable = v => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])])) : v;
const canonical = v => JSON.stringify(stable(v));
function text(v, max = 2400) { if (typeof v !== 'string' || !v.trim() || v.length > max || /[\u0000-\u0008\u000b-\u001f\u007f]/u.test(v)) fail(); }
function shape(v, keys) {
  if (!v || typeof v !== 'object' || Array.isArray(v) ||
      Object.keys(v).length !== keys.length || Object.keys(v).some(k => !keys.includes(k))) fail();
}
function list(v, max, minimum = 0) { if (!Array.isArray(v) || v.length < minimum || v.length > max) fail(); }
function instant(v) {
  text(v, 30);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v)) fail();
  const n = Date.parse(v);
  if (!Number.isFinite(n) || new Date(n).toISOString().replace('.000Z', 'Z') !== v) fail();
  return n;
}
function published(v, checked) {
  if (v === null) return;
  text(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) ||
      new Date(v).toISOString().slice(0, 10) !== v || Date.parse(v) > checked) fail();
}
export function normalizedUrl(value) {
  text(value, 1600);
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) fail();
  for (const key of [...url.searchParams.keys()]) if (/^utm_/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString(); // References only; this utility never fetches URLs.
}
export function validateScan(scan) {
  shape(scan, ['schema', 'captured_at', 'classification', 'coverage', 'signals']);
  if (scan.schema !== 'edgerunner.scan/1' || scan.classification !== 'PUBLIC_RESEARCH') fail();
  const captured = instant(scan.captured_at);
  shape(scan.coverage, ['checked_source_ids', 'failed_source_ids', 'limitations']);
  for (const key of ['checked_source_ids', 'failed_source_ids', 'limitations']) {
    list(scan.coverage[key], 60);
    scan.coverage[key].forEach(s => text(s));
    if (new Set(scan.coverage[key]).size !== scan.coverage[key].length) fail();
  }
  if (scan.coverage.checked_source_ids.some(id => scan.coverage.failed_source_ids.includes(id))) fail();
  list(scan.signals, 30);
  const ids = new Set();
  for (const signal of scan.signals) {
    shape(signal, ['id', 'title', 'recommendation', 'review_state', 'fact', 'inference', 'applies_to',
      'next_test', 'stop_if', 'runtime_fit', 'reuse_notes', 'commercial_evidence', 'sources']);
    text(signal.id, 100);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(signal.id) || ids.has(signal.id)) fail();
    ids.add(signal.id);
    if (!actions.includes(signal.recommendation) || signal.review_state !== 'UNREVIEWED') fail();
    for (const key of ['title', 'fact', 'inference', 'next_test', 'stop_if', 'runtime_fit', 'reuse_notes']) text(signal[key]);
    list(signal.applies_to, 8, 1); signal.applies_to.forEach(s => text(s, 100));
    shape(signal.commercial_evidence, ['status', 'detail']);
    if (!commercial.includes(signal.commercial_evidence.status)) fail();
    text(signal.commercial_evidence.detail);
    list(signal.sources, 6, 1);
    const urls = new Set();
    for (const source of signal.sources) {
      shape(source, ['registry_id', 'url', 'basis', 'published_at', 'checked_at', 'reproduced']);
      if (!scan.coverage.checked_source_ids.includes(source.registry_id)) fail();
      const url = normalizedUrl(source.url);
      if (urls.has(url)) fail();
      urls.add(url);
      if (!bases.includes(source.basis) || typeof source.reproduced !== 'boolean') fail();
      const checked = instant(source.checked_at);
      if (checked > captured) fail();
      published(source.published_at, checked);
    }
    if (signal.recommendation === 'REUSE' && signal.sources.every(s => s.basis === 'DISCOVERY_LEAD')) fail();
  }
  return scan;
}
function identity(signal) {
  // Checked-at-only changes must not re-alert. All actual judgment/source changes do.
  return hash(canonical({ ...signal, applies_to: [...signal.applies_to].sort(),
    sources: signal.sources.map(({ checked_at, ...s }) => ({ ...s, url: normalizedUrl(s.url) }))
      .sort((a, b) => canonical(a).localeCompare(canonical(b))) }));
}
export function compile(scan, previous = null, asOf = scan.captured_at) {
  validateScan(scan); if (previous) validateScan(previous);
  const now = instant(asOf);
  if (now < instant(scan.captured_at) || previous && instant(previous.captured_at) > instant(scan.captured_at)) fail();
  const old = new Map((previous?.signals ?? []).map(s => [s.id, identity(s)]));
  const signals = scan.signals.map(s => ({ ...s, record_sha256: identity(s),
    delta: !old.has(s.id) ? 'NEW_TO_REGISTRY' : old.get(s.id) === identity(s) ? 'UNCHANGED' : 'CHANGED',
    freshness: s.sources.some(r => now - instant(r.checked_at) > 7 * 86400000) ? 'RECHECK_REQUIRED' : 'RECENTLY_CHECKED' }));
  return { schema: 'edgerunner.report/1', as_of: asOf, scan_sha256: hash(canonical(scan)),
    previous_scan_sha256: previous ? hash(canonical(previous)) : null,
    status: !previous ? 'BASELINE' : signals.some(s => s.delta !== 'UNCHANGED') ? 'UPDATES_FOR_REVIEW' : 'NO_MATERIAL_UPDATE_IN_SUPPLIED_RECORDS',
    coverage: scan.coverage, classification: scan.classification,
    authority: 'RECOMMENDATIONS_ONLY', scheduler: 'NOT_MANAGED',
    not_revisited: (previous?.signals ?? []).filter(s => !signals.some(n => n.id === s.id)).map(s => s.id),
    signals };
}
const safe = value => String(value).replace(/[\r\n]/g, ' ').replace(/[&<>`*_[\]#|\\]/g, c => `&#${c.charCodeAt(0)};`);
export function markdown(report) {
  const lines = ['# Kiroshi Edgerunner — market scout', '', `As of: ${safe(report.as_of)} | ${safe(report.status)}`, '',
    '**Recommendations only. No installations, purchases, launches, or approvals.**',
    'Compiled from supplied research records; no browsing or scheduler runs occur in the compiler.', '',
    `Coverage: ${report.coverage.checked_source_ids.length} checked registry entries; ${report.coverage.failed_source_ids.length} failed.`,
    ...report.coverage.limitations.map(s => `- ${safe(s)}`), '',
    'NEW_TO_REGISTRY means newly recorded, not newly released. REUSE is a proposal, not deployment approval.', ''];
  for (const s of report.signals) {
    lines.push(`## ${safe(s.recommendation)} — ${safe(s.title)}`, '',
      `${safe(s.delta)} | ${safe(s.freshness)} | ${safe(s.review_state)}`, '',
      `**Source-stated fact:** ${safe(s.fact)}`, '', `**Our inference:** ${safe(s.inference)}`, '',
      `**Relevant to:** ${safe(s.applies_to.join(', '))}`, '', `**Cheapest next test:** ${safe(s.next_test)}`, '',
      `**Stop condition:** ${safe(s.stop_if)}`, '', `**Runtime fit:** ${safe(s.runtime_fit)}`, '',
      `**Reuse conditions:** ${safe(s.reuse_notes)}`, '',
      `**Commercial evidence:** ${safe(s.commercial_evidence.status)} — ${safe(s.commercial_evidence.detail)}`, '',
      ...s.sources.map(r => `Source: ${safe(normalizedUrl(r.url))} | ${safe(r.basis)} | published ${safe(r.published_at ?? 'unknown')} | checked ${safe(r.checked_at)} | reproduced ${r.reproduced}`), '');
  }
  if (report.not_revisited.length) lines.push(`Not revisited (not withdrawn): ${safe(report.not_revisited.join(', '))}`, '');
  return lines.join('\n');
}
function readScan(path) {
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > LIMIT) fail();
    const bytes = readFileSync(fd);
    if (bytes.length > LIMIT) fail();
    return validateScan(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
  } finally { closeSync(fd); }
}
export function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!['--input', '--previous', '--as-of', '--output-dir'].includes(key) || Object.hasOwn(args, key) || !argv[i + 1] || argv[i + 1].startsWith('--')) fail();
    args[key] = argv[i + 1];
  }
  if (!args['--input'] || !args['--output-dir']) fail();
  const scan = readScan(args['--input']);
  const report = compile(scan, args['--previous'] ? readScan(args['--previous']) : null,
    args['--as-of'] ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  const out = resolve(args['--output-dir']);
  mkdirSync(out, { mode: 0o700 }); // Parent must exist; never replace an existing directory.
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  writeFileSync(resolve(out, 'report.md'), markdown(report), { flag: 'wx', mode: 0o600 });
  return { status: report.status, signals: report.signals.length, authority: report.authority };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)))); }
  catch { console.error(JSON.stringify({ status: 'REJECTED', instruction: 'Check input, chronology and a new output directory; preserve partial outputs.' })); process.exitCode = 2; }
}
