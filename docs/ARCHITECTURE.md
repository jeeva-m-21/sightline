# Sightline — Architecture & System Design Reference

## 1. High-Level Architecture

Sightline employs a strict **Three-Layer Trust Architecture**:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                LAYER 3: NARRATIVE (LLM)                     │
 │  Names • Descriptions • Session Stories • Grounding Verifier│
 └──────────────────────────────┬──────────────────────────────┘
                                ▲ (Narrator may only cite Layer 2 IDs)
 ┌──────────────────────────────┴──────────────────────────────┐
 │                LAYER 2: STRUCTURES (Heuristic)              │
 │  Next.js Adapter • Cross-Boundary Resolver • Flow Builder   │
 │  Feature Clusterer • Stable Identity Matcher                │
 └──────────────────────────────┬──────────────────────────────┘
                                ▲ (Structures build on top of Facts)
 ┌──────────────────────────────┴──────────────────────────────┐
 │                LAYER 1: FACTS (Deterministic)               │
 │  Tree-sitter TS/TSX AST • Export/Import/Call Extraction     │
 │  File Content Hashing & SQLite Cache                        │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model (SQLite Schema)

Local SQLite database (`.sightline/sightline.sqlite`):

### 2.1 Entity Table
Stores symbols, components, routes, and features.
```sql
CREATE TABLE entity (
  id            TEXT PRIMARY KEY,         -- UUID
  repo_id       TEXT NOT NULL,
  kind          TEXT NOT NULL,            -- 'component'|'function'|'route'|'table'|'feature'|'module'
  canonical_key TEXT NOT NULL,            -- e.g. "src/components/Button.tsx#Button"
  created_snapshot TEXT NOT NULL,
  UNIQUE(repo_id, kind, canonical_key)
);
CREATE INDEX idx_entity_canonical ON entity(canonical_key);
```

### 2.2 Snapshot & Entity State Tables
Enables instant time-travel and diffs between working trees and commits:
```sql
CREATE TABLE snapshot (
  id         TEXT PRIMARY KEY,
  repo_id    TEXT NOT NULL,
  git_sha    TEXT,                        -- NULL for uncommitted working tree
  parent_id  TEXT REFERENCES snapshot(id),
  kind       TEXT NOT NULL,               -- 'commit'|'working_tree'|'session_result'
  created_at INTEGER NOT NULL             -- Unix epoch timestamp ms
);

CREATE TABLE entity_state (
  snapshot_id  TEXT REFERENCES snapshot(id),
  entity_id    TEXT REFERENCES entity(id),
  content_hash TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  start_line   INTEGER,
  end_line     INTEGER,
  attrs        TEXT,                      -- JSON blob for props, types, etc.
  PRIMARY KEY (snapshot_id, entity_id)
);
```

### 2.3 Edge Table with Explicit Provenance
```sql
CREATE TABLE edge (
  snapshot_id TEXT REFERENCES snapshot(id),
  src         TEXT REFERENCES entity(id),
  dst         TEXT REFERENCES entity(id),
  kind        TEXT NOT NULL,              -- 'calls'|'renders'|'imports'|'requests'|'routes_to'|'reads'|'writes'
  provenance  TEXT NOT NULL,              -- 'EXTRACTED'|'RESOLVED'|'HEURISTIC'|'OBSERVED'|'INFERRED'|'HUMAN'
  reason      TEXT,                       -- e.g. "matched fetch('/api/pay') to app/api/pay/route.ts"
  evidence    TEXT,                       -- JSON with file, line, column
  PRIMARY KEY (snapshot_id, src, dst, kind)
);
CREATE INDEX idx_edge_src ON edge(snapshot_id, src);
CREATE INDEX idx_edge_dst ON edge(snapshot_id, dst);
```

### 2.4 Flow Table
Materialized execution pathways from entry points:
```sql
CREATE TABLE flow (
  id             TEXT PRIMARY KEY,
  snapshot_id    TEXT REFERENCES snapshot(id),
  entry_entity   TEXT REFERENCES entity(id),
  name           TEXT NOT NULL,
  steps          TEXT NOT NULL,           -- JSON array: [{entity_id, edge_kind, provenance}]
  min_provenance TEXT NOT NULL            -- weakest provenance along the path
);
```

---

## 3. Provenance & Confidence Calculation

Edges and paths are tagged with explicit provenance:

| Provenance Level | Weight | Description |
|---|---|---|
| **HUMAN** | 1.0 | Explicit user override (`.sightline/overrides.json`) |
| **EXTRACTED** | 1.0 | Directly parsed from syntax (Tree-sitter TS AST) |
| **RESOLVED** | 1.0 | Confirmed by TypeScript compiler / symbol definition |
| **OBSERVED** | 1.0 | Observed at runtime during dev preview interaction |
| **HEURISTIC** | 0.6 | Framework convention match (e.g. Next.js route URL match) |
| **INFERRED** | 0.2 | LLM interpretation / semantic guess |

**Path Score:**
$$\text{Score}(\text{Path}) = \prod_{e \in \text{Edges}} \text{Weight}(e)$$

- **CERTAIN:** $\text{Score} \ge 0.9$
- **LIKELY:** $0.5 \le \text{Score} < 0.9$
- **POSSIBLE:** $\text{Score} < 0.5$

---

## 4. Grounded LLM Verifier Architecture

When generating narrative summaries (Layer 3):
1. **Context Constrained:** The prompt is provided strictly with entity IDs, verified edges, and code snippets.
2. **Strict Output Schema:** The LLM must output structured JSON:
   ```json
   {
     "summary": "...",
     "claims": [
       {
         "statement": "The CheckoutButton triggers the Stripe checkout route",
         "cited_entity_ids": ["uuid-1", "uuid-2"],
         "cited_edge_ids": ["uuid-edge-1"]
       }
     ]
   }
   ```
3. **Verifier Gate:**
   - Verify every cited UUID exists in the current snapshot.
   - Verify that an edge actually connects the cited entities.
   - If verification fails: re-prompt once with the error, or mark claim as unverified.
