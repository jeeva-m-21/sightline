import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateConfidence, PROVENANCE_WEIGHTS } from './types/provenance.js';

test('PROVENANCE_WEIGHTS maps expected confidence values', () => {
  assert.equal(PROVENANCE_WEIGHTS.EXTRACTED, 1.0);
  assert.equal(PROVENANCE_WEIGHTS.RESOLVED, 1.0);
  assert.equal(PROVENANCE_WEIGHTS.OBSERVED, 1.0);
  assert.equal(PROVENANCE_WEIGHTS.HUMAN, 1.0);
  assert.equal(PROVENANCE_WEIGHTS.HEURISTIC, 0.6);
  assert.equal(PROVENANCE_WEIGHTS.INFERRED, 0.2);
});

test('calculateConfidence returns CERTAIN for score >= 0.9', () => {
  assert.equal(calculateConfidence(1.0), 'CERTAIN');
  assert.equal(calculateConfidence(0.95), 'CERTAIN');
  assert.equal(calculateConfidence(0.9), 'CERTAIN');
});

test('calculateConfidence returns LIKELY for 0.5 <= score < 0.9', () => {
  assert.equal(calculateConfidence(0.89), 'LIKELY');
  assert.equal(calculateConfidence(0.6), 'LIKELY');
  assert.equal(calculateConfidence(0.5), 'LIKELY');
});

test('calculateConfidence returns POSSIBLE for score < 0.5', () => {
  assert.equal(calculateConfidence(0.49), 'POSSIBLE');
  assert.equal(calculateConfidence(0.2), 'POSSIBLE');
  assert.equal(calculateConfidence(0.0), 'POSSIBLE');
});
