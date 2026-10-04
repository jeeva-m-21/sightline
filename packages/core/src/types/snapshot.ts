export type SnapshotKind = 'commit' | 'working_tree' | 'session_result';

export interface Snapshot {
  id: string; // UUID
  repoId: string;
  gitSha?: string;
  parentId?: string;
  kind: SnapshotKind;
  createdAt: number; // Unix epoch ms
}
