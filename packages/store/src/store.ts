import Database from 'better-sqlite3';
import { Edge, Entity, EntityState, Snapshot } from '@sightline/core';
import { FeatureCluster, RepoFileNode } from '@sightline/adapter-nextjs';
import { SCHEMA_SQL } from './schema.js';

export class SightlineStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(SCHEMA_SQL);
  }

  public saveSnapshot(
    snapshot: Snapshot,
    entities: Entity[],
    states: EntityState[],
    edges: Edge[],
    clusters: FeatureCluster[],
    projectTree?: RepoFileNode
  ): void {
    const insertSnapshot = this.db.prepare(`
      INSERT OR REPLACE INTO snapshot (id, repo_id, git_sha, parent_id, kind, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertEntity = this.db.prepare(`
      INSERT INTO entity (id, repo_id, kind, canonical_key, created_snapshot)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (repo_id, kind, canonical_key) DO UPDATE SET
        id = excluded.id,
        created_snapshot = excluded.created_snapshot
    `);

    const insertState = this.db.prepare(`
      INSERT OR REPLACE INTO entity_state (snapshot_id, entity_id, content_hash, file_path, start_line, end_line, attrs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEdge = this.db.prepare(`
      INSERT OR REPLACE INTO edge (snapshot_id, src, dst, kind, provenance, reason, evidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCluster = this.db.prepare(`
      INSERT OR REPLACE INTO feature_cluster (id, snapshot_id, name, description, routes_json, files_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertTree = this.db.prepare(`
      INSERT OR REPLACE INTO project_tree (snapshot_id, tree_json)
      VALUES (?, ?)
    `);

    // Run transaction
    const transaction = this.db.transaction(() => {
      insertSnapshot.run(
        snapshot.id,
        snapshot.repoId,
        snapshot.gitSha || null,
        snapshot.parentId || null,
        snapshot.kind,
        snapshot.createdAt
      );

      for (const e of entities) {
        insertEntity.run(e.id, e.repoId, e.kind, e.canonicalKey, e.createdSnapshot);
      }

      for (const s of states) {
        insertState.run(
          s.snapshotId,
          s.entityId,
          s.contentHash,
          s.filePath,
          s.startLine || null,
          s.endLine || null,
          s.attrs ? JSON.stringify(s.attrs) : null
        );
      }

      for (const edge of edges) {
        insertEdge.run(
          edge.snapshotId,
          edge.src,
          edge.dst,
          edge.kind,
          edge.provenance,
          edge.reason || null,
          edge.evidence ? JSON.stringify(edge.evidence) : null
        );
      }

      for (const c of clusters) {
        insertCluster.run(
          c.id,
          snapshot.id,
          c.name,
          c.description,
          JSON.stringify(c.routes),
          JSON.stringify(c.filePaths)
        );
      }

      if (projectTree) {
        insertTree.run(snapshot.id, JSON.stringify(projectTree));
      }
    });

    transaction();
  }

  public getProjectTree(snapshotId: string): RepoFileNode | null {
    const row = this.db
      .prepare('SELECT tree_json FROM project_tree WHERE snapshot_id = ?')
      .get(snapshotId) as { tree_json: string } | undefined;

    if (!row || !row.tree_json) return null;
    try {
      return JSON.parse(row.tree_json) as RepoFileNode;
    } catch {
      return null;
    }
  }

  public getLatestSnapshot(repoId?: string): Snapshot | null {
    let stmt;
    let row: any;
    if (repoId) {
      stmt = this.db.prepare(
        'SELECT * FROM snapshot WHERE repo_id = ? ORDER BY created_at DESC LIMIT 1'
      );
      row = stmt.get(repoId);
    } else {
      stmt = this.db.prepare('SELECT * FROM snapshot ORDER BY created_at DESC LIMIT 1');
      row = stmt.get();
    }

    if (!row) return null;

    return {
      id: row.id,
      repoId: row.repo_id,
      gitSha: row.git_sha || undefined,
      parentId: row.parent_id || undefined,
      kind: row.kind,
      createdAt: row.created_at,
    };
  }

  public getClusters(snapshotId: string): FeatureCluster[] {
    const rows = this.db
      .prepare('SELECT * FROM feature_cluster WHERE snapshot_id = ?')
      .all(snapshotId) as Array<{
      id: string;
      name: string;
      description: string;
      routes_json: string;
      files_json: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      routes: JSON.parse(r.routes_json || '[]'),
      filePaths: JSON.parse(r.files_json || '[]'),
      entityIds: [],
    }));
  }

  public getEntities(snapshotId: string): Array<Entity & EntityState> {
    const rows = this.db
      .prepare(
        `SELECT e.id, e.repo_id as repoId, e.kind, e.canonical_key as canonicalKey,
                e.created_snapshot as createdSnapshot,
                s.snapshot_id as snapshotId, s.entity_id as entityId, s.content_hash as contentHash,
                s.file_path as filePath, s.start_line as startLine, s.end_line as endLine, s.attrs
         FROM entity e
         JOIN entity_state s ON e.id = s.entity_id
         WHERE s.snapshot_id = ?`
      )
      .all(snapshotId) as Array<Entity & EntityState & { attrs: string | null }>;

    return rows.map((r) => ({
      ...r,
      attrs: r.attrs ? JSON.parse(r.attrs) : undefined,
    }));
  }

  public getEdges(snapshotId: string): Edge[] {
    const rows = this.db
      .prepare('SELECT * FROM edge WHERE snapshot_id = ?')
      .all(snapshotId) as Array<{
      snapshot_id: string;
      src: string;
      dst: string;
      kind: string;
      provenance: string;
      reason: string | null;
      evidence: string | null;
    }>;

    return rows.map((r) => ({
      snapshotId: r.snapshot_id,
      src: r.src,
      dst: r.dst,
      kind: r.kind as any,
      provenance: r.provenance as any,
      reason: r.reason || undefined,
      evidence: r.evidence ? JSON.parse(r.evidence) : undefined,
    }));
  }

  public close(): void {
    this.db.close();
  }
}
