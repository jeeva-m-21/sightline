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

  // Generate Edges: renders, requests, calls
  const entityMapByName = new Map<string, Entity>();
  for (const ent of entities) {
    const symName = ent.canonicalKey.split('#')[1] || ent.canonicalKey;
    entityMapByName.set(symName, ent);
  }

  const routeEntityByUrl = new Map<string, Entity>();
  for (const ent of entities) {
    if (ent.kind === 'route') {
      // Find matching route url
      const routeInfo = analysis.routes.find((r) => ent.canonicalKey.startsWith(r.filePath));
      if (routeInfo) {
        routeEntityByUrl.set(routeInfo.urlPath, ent);
      }
    }
  }

  for (const file of analysis.extractedFiles) {
    const fileEntities = entities.filter((e) => e.canonicalKey.startsWith(file.filePath));
    const mainEntity = fileEntities.find((e) => e.kind === 'component') || fileEntities[0];
    if (!mainEntity) continue;

    // 1. Renders edges: <Button />, <Header />
    for (const jsx of file.renderedComponents) {
      const targetEntity = entityMapByName.get(jsx.tag);
      if (targetEntity && targetEntity.id !== mainEntity.id) {
        edges.push({
          snapshotId,
          src: mainEntity.id,
          dst: targetEntity.id,
          kind: 'renders',
          provenance: 'EXTRACTED',
          reason: `<${jsx.tag} /> rendered in JSX`,
          evidence: {
            filePath: file.filePath,
            startLine: jsx.line,
          },
        });
      }
    }

    // 2. Requests edges: fetch('/api/checkout') -> app/api/checkout/route.ts
    for (const call of file.calls) {
      if (call.callee === 'fetch' && call.args[0]) {
        const urlArg = call.args[0];
        const targetRouteEntity = routeEntityByUrl.get(urlArg);
        if (targetRouteEntity) {
          edges.push({
            snapshotId,
            src: mainEntity.id,
            dst: targetRouteEntity.id,
            kind: 'requests',
            provenance: 'HEURISTIC',
            reason: `fetch('${urlArg}') client request to backend handler`,
            evidence: {
              filePath: file.filePath,
              startLine: call.line,
            },
          });
        }
      }
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
