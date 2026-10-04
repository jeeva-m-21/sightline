import test from 'node:test';
import assert from 'node:assert/strict';
import { SightlineStore } from './store.js';
import { Edge, Entity, EntityState, Snapshot } from '@sightline/core';
import { FeatureCluster } from '@sightline/adapter-nextjs';

test('SightlineStore persists and queries snapshot, entities, and clusters', () => {
  const store = new SightlineStore(':memory:');

  const snapshot: Snapshot = {
    id: 'snap-1',
    repoId: 'repo-test',
    kind: 'commit',
    gitSha: 'abcdef123',
    createdAt: Date.now(),
  };

  const entities: Entity[] = [
    {
      id: 'ent-1',
      repoId: 'repo-test',
      kind: 'component',
      canonicalKey: 'app/page.tsx#HomePage',
      createdSnapshot: 'snap-1',
    },
    {
      id: 'ent-2',
      repoId: 'repo-test',
      kind: 'route',
      canonicalKey: 'app/api/auth/route.ts#GET',
      createdSnapshot: 'snap-1',
    },
  ];

  const states: EntityState[] = [
    {
      snapshotId: 'snap-1',
      entityId: 'ent-1',
      contentHash: 'hash1',
      filePath: 'app/page.tsx',
      startLine: 1,
      endLine: 25,
      attrs: { isDefault: true },
    },
    {
      snapshotId: 'snap-1',
      entityId: 'ent-2',
      contentHash: 'hash2',
      filePath: 'app/api/auth/route.ts',
      startLine: 1,
      endLine: 10,
    },
  ];

  const edges: Edge[] = [
    {
      snapshotId: 'snap-1',
      src: 'ent-1',
      dst: 'ent-2',
      kind: 'requests',
      provenance: 'HEURISTIC',
      reason: 'fetch /api/auth',
    },
  ];

  const clusters: FeatureCluster[] = [
    {
      id: 'marketing',
      name: 'Landing & Public Pages',
      description: 'Home page and marketing',
      routes: [
        {
          urlPath: '/',
          kind: 'page',
          filePath: 'app/page.tsx',
          isDynamic: false,
          paramNames: [],
        },
      ],
      filePaths: ['app/page.tsx'],
      entityIds: ['ent-1'],
    },
  ];

  // Save
  store.saveSnapshot(snapshot, entities, states, edges, clusters);

  // Retrieve
  const latest = store.getLatestSnapshot();
  assert.equal(latest?.id, 'snap-1');
  assert.equal(latest?.gitSha, 'abcdef123');

  const retrievedClusters = store.getClusters('snap-1');
  assert.equal(retrievedClusters.length, 1);
  assert.equal(retrievedClusters[0].name, 'Landing & Public Pages');
  assert.equal(retrievedClusters[0].routes[0].urlPath, '/');

  const retrievedEntities = store.getEntities('snap-1');
  assert.equal(retrievedEntities.length, 2);
  const homeEntity = retrievedEntities.find((e) => e.canonicalKey.includes('HomePage'));
  assert.equal(homeEntity?.kind, 'component');
  assert.equal(homeEntity?.contentHash, 'hash1');

  const retrievedEdges = store.getEdges('snap-1');
  assert.equal(retrievedEdges.length, 1);
  assert.equal(retrievedEdges[0].kind, 'requests');
  assert.equal(retrievedEdges[0].provenance, 'HEURISTIC');

  store.close();
});
