// Experiment adapter only: JSON stdin -> JSON stdout; no HTTP or payment service.
import { readFileSync } from 'node:fs';
import { evaluate } from './candidate.mjs';
const request = JSON.parse(readFileSync(0, 'utf8'));
const result = Array.isArray(request.inputs)
  ? request.inputs.map(input => evaluate({ ...input, disposableDomains: input.disposableDomains ?? request.disposableDomains }))
  : evaluate(request);
process.stdout.write(JSON.stringify(result) + '\n');
