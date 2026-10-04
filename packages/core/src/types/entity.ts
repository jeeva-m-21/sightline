export type EntityKind =
  | 'product'
  | 'feature'
  | 'module'
  | 'file'
  | 'component'
  | 'function'
  | 'hook'
  | 'route'
  | 'table'
  | 'external_service';

export interface Entity {
  id: string; // UUID
  repoId: string;
  kind: EntityKind;
  canonicalKey: string; // e.g. "src/components/Button.tsx#Button"
  createdSnapshot: string;
}

export interface EntityState {
  snapshotId: string;
  entityId: string;
  contentHash: string;
  filePath: string;
  startLine?: number;
  endLine?: number;
  attrs?: Record<string, unknown>;
}
