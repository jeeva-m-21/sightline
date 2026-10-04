export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS entity (
  id            TEXT PRIMARY KEY,
  repo_id       TEXT NOT NULL,
  kind          TEXT NOT NULL,
  canonical_key TEXT NOT NULL,
  created_snapshot TEXT NOT NULL,
  UNIQUE(repo_id, kind, canonical_key)
);
CREATE INDEX IF NOT EXISTS idx_entity_canonical ON entity(canonical_key);

CREATE TABLE IF NOT EXISTS snapshot (
  id         TEXT PRIMARY KEY,
  repo_id    TEXT NOT NULL,
  git_sha    TEXT,
  parent_id  TEXT REFERENCES snapshot(id),
  kind       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_state (
  snapshot_id  TEXT REFERENCES snapshot(id),
  entity_id    TEXT REFERENCES entity(id),
  content_hash TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  start_line   INTEGER,
  end_line     INTEGER,
  attrs        TEXT,
  PRIMARY KEY (snapshot_id, entity_id)
);

CREATE TABLE IF NOT EXISTS edge (
  snapshot_id TEXT REFERENCES snapshot(id),
  src         TEXT REFERENCES entity(id),
  dst         TEXT REFERENCES entity(id),
  kind        TEXT NOT NULL,
  provenance  TEXT NOT NULL,
  reason      TEXT,
  evidence    TEXT,
  PRIMARY KEY (snapshot_id, src, dst, kind)
);
CREATE INDEX IF NOT EXISTS idx_edge_src ON edge(snapshot_id, src);
CREATE INDEX IF NOT EXISTS idx_edge_dst ON edge(snapshot_id, dst);

CREATE TABLE IF NOT EXISTS feature_cluster (
  id          TEXT NOT NULL,
  snapshot_id TEXT REFERENCES snapshot(id),
  name        TEXT NOT NULL,
  description TEXT,
  routes_json TEXT,
  files_json  TEXT,
  PRIMARY KEY (snapshot_id, id)
);

CREATE TABLE IF NOT EXISTS flow (
  id             TEXT PRIMARY KEY,
  snapshot_id    TEXT REFERENCES snapshot(id),
  entry_entity   TEXT REFERENCES entity(id),
  name           TEXT NOT NULL,
  steps          TEXT NOT NULL,
  min_provenance TEXT NOT NULL
);
`;
