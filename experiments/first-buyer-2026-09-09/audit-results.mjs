// Audit a ground-truth defect without changing the frozen cases or first run.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const read = name => readFileSync(new URL(name, import.meta.url));
const cases = JSON.parse(read('cases-public.json'));
const resultBytes = read('results-first-run.json');
const results = JSON.parse(resultBytes);
assert.ok(cases.disposable_list.entries.includes('notmailinator.com'));
const audited = {};
for (const arm of ['candidate', 'baseline']) {
  const rows = results[arm].rows;
  const h04 = rows.find(row => row.id === 'H04');
  assert.equal(h04.expectedRoute, 'KEEP');
  assert.equal(h04.output.route, 'REVIEW');
  assert.equal(h04.output.mailboxExists, 'UNKNOWN');
  audited[arm] = { originalScore: results[arm].correct, originalDenominator: 20,
    validOriginalCasesCorrect: rows.filter(row => row.id !== 'H04' && row.correct).length,
    validOriginalCases: 19,
    correctedExpectationDiagnosticScore: rows.filter(row => row.id !== 'H04' && row.correct).length + 1,
    correctedExpectationDiagnosticDenominator: 20 };
}
console.log(JSON.stringify({ schema: 'x402.first-buyer-audit/1',
  firstRunSha256: createHash('sha256').update(resultBytes).digest('hex'),
  defect: { caseId: 'H04', originalExpected: 'KEEP', correctExpected: 'REVIEW',
    reason: 'notmailinator.com is itself an exact entry in the frozen disposable list; both implementations correctly flag membership.',
    inputChanged: false, implementationChanged: false, newExecutionCount: 0 },
  audited,
  decision: 'NO_BUILD',
  reason: 'Equal task correctness; no four-case advantage or measured independent buyer integration saving. Neither raw nor audited result justifies seller implementation.',
  limitation: 'Correction is post-execution diagnosis, not a new heldout success or additional test. Negative suffix-boundary intent of H04 remains untested by that case.'
}, null, 2));
