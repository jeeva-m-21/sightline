import { EdgeKind } from './edge.js';
import { ProvenanceKind } from './provenance.js';

export interface FlowStep {
  entityId: string;
  edgeKind?: EdgeKind;
  provenance: ProvenanceKind;
  description?: string;
}

export interface Flow {
  id: string;
  snapshotId: string;
  entryEntityId: string;
  name: string;
  description?: string;
  steps: FlowStep[];
  minProvenance: ProvenanceKind;
}
