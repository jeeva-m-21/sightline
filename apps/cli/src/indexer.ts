import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { NextJsAdapter } from '@sightline/adapter-nextjs';
import { SightlineStore } from '@sightline/store';
import { Edge, Entity, EntityState, Snapshot } from '@sightline/core';

export interface IndexResult {
  snapshotId: string;
  clusterCount: number;
  routeCount: number;
  symbolCount: number;
  durationMs: number;
}

export async function runIndexingPipeline(projectDir: string, dbPath: string): Promise<IndexResult> {
  const startTime = Date.now();

  // Ensure .sightline directory exists
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  const store = new SightlineStore(dbPath);
  const adapter = new NextJsAdapter();

  const analysis = await adapter.analyze(projectDir);

  const snapshotId = crypto.randomUUID();
  const repoId = path.basename(projectDir);

  const snapshot: Snapshot = {
    id: snapshotId,
    repoId,
    kind: 'commit',
    createdAt: Date.now(),
  };

  const entities: Entity[] = [];
  const entityStates: EntityState[] = [];
  const edges: Edge[] = [];
  const seenCanonicalKeys = new Set<string>();

  // Map extracted symbols to entities and states
  for (const file of analysis.extractedFiles) {
    for (const sym of file.symbols) {
      const canonicalKey = `${file.filePath}#${sym.name}`;
      if (seenCanonicalKeys.has(canonicalKey)) continue;
      seenCanonicalKeys.add(canonicalKey);

      const entityId = crypto
        .createHash('sha256')
        .update(`${repoId}:${sym.kind}:${canonicalKey}`)
        .digest('hex')
        .slice(0, 32);

      entities.push({
        id: entityId,
        repoId,
        kind: sym.kind as any,
        canonicalKey,
        createdSnapshot: snapshotId,
      });

      entityStates.push({
        snapshotId,
        entityId,
        contentHash: file.contentHash,
        filePath: file.filePath,
        startLine: sym.startLine,
        endLine: sym.endLine,
        attrs: {
          isExported: sym.isExported,
          isDefaultExport: sym.isDefaultExport,
          isClientComponent: file.isClientComponent,
        },
      });
    }
  }

  // Save in store
  store.saveSnapshot(snapshot, entities, entityStates, edges, analysis.clusters);
  store.close();

  const totalRoutes = analysis.clusters.reduce((acc, c) => acc + c.routes.length, 0);

  return {
    snapshotId,
    clusterCount: analysis.clusters.length,
    routeCount: totalRoutes,
    symbolCount: entities.length,
    durationMs: Date.now() - startTime,
  };
}
