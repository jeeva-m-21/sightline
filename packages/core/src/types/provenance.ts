/**
 * Provenance indicates the derivation source and confidence of an edge or observation.
 */
export type ProvenanceKind =
  | 'EXTRACTED'   // Direct syntax observation from AST (Tree-sitter)
  | 'RESOLVED'    // Type/symbol resolution confirmed by compiler/LSP
  | 'HEURISTIC'   // Framework pattern matching (e.g. Next.js route URL)
  | 'OBSERVED'    // Observed at runtime (dev preview bridge / traces)
  | 'INFERRED'    // Suggested by LLM (never treated as verified truth)
  | 'HUMAN';      // User override / manual assertion

export const PROVENANCE_WEIGHTS: Record<ProvenanceKind, number> = {
  HUMAN: 1.0,
  EXTRACTED: 1.0,
  RESOLVED: 1.0,
  OBSERVED: 1.0,
  HEURISTIC: 0.6,
  INFERRED: 0.2,
};

export type ConfidenceTier = 'CERTAIN' | 'LIKELY' | 'POSSIBLE';

/**
 * Calculates confidence tier based on accumulated path weight.
 */
export function calculateConfidence(score: number): ConfidenceTier {
  if (score >= 0.9) return 'CERTAIN';
  if (score >= 0.5) return 'LIKELY';
  return 'POSSIBLE';
}
