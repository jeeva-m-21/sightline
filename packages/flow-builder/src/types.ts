import { ConfidenceTier, ProvenanceKind } from '@sightline/core';

export type BoundaryKind =
  | 'external_api'
  | 'database_table'
  | 'session_auth'
  | 'server_action'
  | 'cache_storage';

export interface ResolvedBoundary {
  kind: BoundaryKind;
  name: string;
  target: string;
  provenance: ProvenanceKind;
  evidence?: {
    filePath: string;
    line?: number;
    rawSnippet?: string;
  };
}

export type EntryPointKind = 'page' | 'route' | 'event_handler' | 'server_action';

export interface FlowEntryPoint {
  entityId: string;
  name: string;
  filePath: string;
  kind: EntryPointKind;
  urlPath?: string;
  line?: number;
}

export interface TraceStep {
  entityId: string;
  name: string;
  filePath: string;
  line?: number;
  kind: string;
  rel: string;
  provenance: ProvenanceKind;
  description: string;
  invariants?: string[];
  rawSnippet?: string;
}

export interface TraceFlow {
  id: string;
  snapshotId: string;
  name: string;
  description: string;
  entryPoint: FlowEntryPoint;
  steps: TraceStep[];
  minProvenance: ProvenanceKind;
  confidence: ConfidenceTier;
  score: number;
}
