import { ProvenanceKind } from './provenance.js';

export type EdgeKind =
  | 'imports'
  | 'calls'
  | 'renders'
  | 'uses_hook'
  | 'handles_event'
  | 'requests'      // e.g. client fetch -> route
  | 'routes_to'     // e.g. route -> handler
  | 'reads'         // code -> table
  | 'writes'        // code -> table
  | 'uses_service'  // code -> external API
  | 'defines'
  | 'belongs_to';   // symbol -> module -> feature

export interface Edge {
  snapshotId: string;
  src: string; // entity id
  dst: string; // entity id
  kind: EdgeKind;
  provenance: ProvenanceKind;
  reason?: string;
  evidence?: {
    filePath: string;
    startLine?: number;
    endLine?: number;
    startCol?: number;
    endCol?: number;
    rawSnippet?: string;
  };
}
