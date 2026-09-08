import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { compile, validateScan, markdown, main, normalizedUrl } from './edgerunner.mjs';

const now = '2026-09-06T01:00:00Z';
function fixture() {
  return { schema: 'edgerunner.scan/1', captured_at: now, classification: 'PUBLIC_RESEARCH',
    coverage: { checked_source_ids: ['docs'], failed_source_ids: [], limitations: ['Synthetic test, not live research.'] },
    signals: [{ id: 'existing-tool', title: 'Synthetic tool', recommendation: 'TEST', review_state: 'UNREVIEWED',
      fact: 'Documentation advertises a capability.', inference: 'May avoid duplicate work.', applies_to: ['Lawn'],
      next_test: 'Check the installed version.', stop_if: 'No relevant capability.', runtime_fit: 'Unverified.', reuse_notes: 'License not checked.',
      commercial_evidence: { status: 'NONE', detail: 'No demonstrated demand.' },
      sources: [{ registry_id: 'docs', url: 'https://example.com/docs', basis: 'PRIMARY_DOCUMENTATION', published_at: null, checked_at: now, reproduced: false }] }] };
}
const clone = v => structuredClone(v);
const temporary = fn => { const dir = mkdtempSync(join(tmpdir(), 'edgerunner-')); try { return fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); } };

test('baseline retains provenance, unknown publication, and proposal authority', () => {
  const scan = fixture(), before = JSON.stringify(scan), report = compile(scan);
  assert.equal(report.status, 'BASELINE'); assert.equal(report.authority, 'RECOMMENDATIONS_ONLY');
  assert.equal(report.signals[0].delta, 'NEW_TO_REGISTRY'); assert.equal(report.signals[0].sources[0].published_at, null);
  assert.equal(JSON.stringify(scan), before); assert.equal(report.scheduler, 'NOT_MANAGED');
});
test('unchanged records and rechecked timestamps do not create new alerts', () => {
  const old = fixture(), scan = clone(old); scan.captured_at = '2026-09-07T01:00:00Z'; scan.signals[0].sources[0].checked_at = scan.captured_at;
  assert.equal(compile(scan, old).status, 'NO_MATERIAL_UPDATE_IN_SUPPLIED_RECORDS');
});
test('changed capabilities or recommendations produce a changed signal', () => {
  for (const [key, value] of [['fact', 'Documentation removed this feature.'], ['recommendation', 'REJECT']]) {
    const old = fixture(), scan = clone(old); scan.signals[0][key] = value;
    assert.equal(compile(scan, old).signals[0].delta, 'CHANGED');
  }
});
test('tracking parameters do not create a duplicate; queries retain actual parameters', () => {
  assert.equal(normalizedUrl('https://example.com/docs?utm_source=x&version=2'), 'https://example.com/docs?version=2');
  const old = fixture(), scan = clone(old); scan.signals[0].sources[0].url += '?utm_source=x';
  assert.equal(compile(scan, old).signals[0].delta, 'UNCHANGED');
});
test('unknown fields and automatic approval are rejected', () => {
  for (const mutate of [s => s.execute = true, s => s.signals[0].review_state = 'APPROVED', s => s.signals[0].command = 'anything']) {
    const s = fixture(); mutate(s); assert.throws(() => validateScan(s));
  }
});
test('duplicate identities and credential-bearing/non-HTTPS references are rejected', () => {
  const s = fixture(); s.signals.push(clone(s.signals[0])); assert.throws(() => validateScan(s));
  for (const url of ['https://user:secret@example.com/', 'file:///tmp/test', 'http://example.com/']) assert.throws(() => normalizedUrl(url));
});
test('false chronology and invalid calendar dates are rejected', () => {
  for (const date of ['2026-02-30T01:00:00Z', 'tomorrow', '2026-09-99T01:00:00Z']) { const s = fixture(); s.captured_at = date; assert.throws(() => compile(s)); }
  const s = fixture(); s.signals[0].sources[0].checked_at = '2026-09-07T01:00:00Z'; assert.throws(() => compile(s));
  assert.throws(() => compile(fixture(), null, '2026-09-01T01:00:00Z'));
});
test('old checked evidence is recheck-required, not current qualification', () => {
  assert.equal(compile(fixture(), null, '2026-09-14T01:00:00Z').signals[0].freshness, 'RECHECK_REQUIRED');
});
test('missing prior cards mean not revisited, not disappeared or resolved', () => {
  const s = fixture(); s.signals = []; const report = compile(s, fixture());
  assert.deepEqual(report.not_revisited, ['existing-tool']); assert.match(markdown(report), /Not revisited/);
});
test('source coverage and lead-only reuse are enforced', () => {
  for (const mutate of [s => s.signals[0].sources[0].registry_id = 'invented', s => s.coverage.failed_source_ids = ['docs'], s => { s.signals[0].recommendation = 'REUSE'; s.signals[0].sources[0].basis = 'DISCOVERY_LEAD'; }]) {
    const s = fixture(); mutate(s); assert.throws(() => validateScan(s));
  }
});
test('empty and failed coverage remain explicit without inventing market facts', () => {
  const s = fixture(); s.signals = []; s.coverage.checked_source_ids = []; s.coverage.failed_source_ids = ['docs'];
  assert.match(markdown(compile(s)), /0 checked registry entries; 1 failed/);
});
test('rendered hostile text remains inert and uncertainty visible', () => {
  const s = fixture(); s.signals[0].title = '<script>bad()</script>\n# FAKE'; s.signals[0].fact = '[run](javascript:bad)';
  const md = markdown(compile(s)); assert.doesNotMatch(md, /<script>|\n# FAKE|\[run\]/); assert.match(md, /Recommendations only/);
});
test('CLI produces both artifacts and refuses any overwrite', () => temporary(dir => {
  const input = join(dir, 'scan.json'), output = join(dir, 'out'); writeFileSync(input, JSON.stringify(fixture()));
  main(['--input', input, '--output-dir', output, '--as-of', now]);
  assert.equal(JSON.parse(readFileSync(join(output, 'report.json'), 'utf8')).signals.length, 1);
  const path = join(output, 'report.md'); writeFileSync(path, 'Human note: wait.');
  assert.throws(() => main(['--input', input, '--output-dir', output, '--as-of', now]));
  assert.equal(readFileSync(path, 'utf8'), 'Human note: wait.');
}));
test('invalid/oversized inputs refuse before output creation', () => temporary(dir => {
  const input = join(dir, 'bad.json'), output = join(dir, 'out');
  for (const content of [Buffer.from([0xff]), Buffer.alloc(512 * 1024 + 1, ' '), Buffer.from('{')]) {
    writeFileSync(input, content); assert.throws(() => main(['--input', input, '--output-dir', output])); assert.equal(existsSync(output), false);
  }
}));
test('unknown CLI arguments have a fixed diagnostic, never echoing their value', () => {
  const script = resolve(dirname(fileURLToPath(import.meta.url)), 'edgerunner.mjs');
  const p = spawnSync(process.execPath, [script, '--bad', 'SECRET_SENTINEL'], { encoding: 'utf8' });
  assert.equal(p.status, 2); assert.doesNotMatch(p.stderr + p.stdout, /SECRET_SENTINEL/); assert.match(p.stderr, /REJECTED/);
});
test('published baseline and source registry agree, without claiming unvisited sources were checked', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const scan = JSON.parse(readFileSync(join(root, 'data/edgerunner/initial-scan.json'), 'utf8'));
  const registry = JSON.parse(readFileSync(join(root, 'data/edgerunner/sources.json'), 'utf8'));
  assert.equal(compile(scan).signals.length, 5);
  const ids = registry.sources.map(s => s.id); assert.equal(new Set(ids).size, ids.length);
  registry.sources.forEach(s => normalizedUrl(s.url));
  scan.coverage.checked_source_ids.forEach(id => assert.ok(ids.includes(id)));
  assert.ok(ids.length > scan.coverage.checked_source_ids.length);
});
