import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import { runIndexingPipeline } from './indexer.js';
import { startViewerServer } from './server.js';
import { SightlineStore } from '@sightline/store';

test('End-to-End CLI Pipeline: runIndexingPipeline and startViewerServer', async () => {
  const goldenRepoPath = path.resolve(__dirname, '../../../testbed/golden-repos/nextjs-minimal');
  const tempDbPath = path.resolve(__dirname, '../../../testbed/golden-repos/nextjs-minimal/.sightline/test.sqlite');

  // Ensure clean state before test
  await fs.rm(path.dirname(tempDbPath), { recursive: true, force: true });

  // 1. Run Indexing Pipeline
  const indexResult = await runIndexingPipeline(goldenRepoPath, tempDbPath);

  assert.ok(indexResult.snapshotId, 'Must return a snapshot ID');
  assert.ok(indexResult.clusterCount <= 12, 'Must enforce <= 12 clusters');
  assert.ok(indexResult.clusterCount >= 3, 'Must have at least 3 feature clusters');
  assert.ok(indexResult.routeCount >= 5, 'Must detect at least 5 routes');
  assert.ok(indexResult.symbolCount >= 5, 'Must extract at least 5 symbols');
  assert.ok(indexResult.durationMs < 2000, 'Must complete in under 2s');

  // 2. Start Viewer Server
  const store = new SightlineStore(tempDbPath);
  const instance = await startViewerServer(store, goldenRepoPath, 3999);

  assert.ok(instance.url.includes('3999') || instance.port > 0);

  // 3. Test HTTP GET /
  const htmlRes = await fetch(instance.url);
  assert.equal(htmlRes.status, 200);
  const html = await htmlRes.text();
  assert.ok(html.includes('Sightline'), 'HTML must contain Sightline branding');
  assert.ok(html.includes('Architectural Guide') || html.includes('Repository Tree'), 'HTML must contain 3-column navigation');

  // 4. Test HTTP GET /api/data
  const apiRes = await fetch(`${instance.url}/api/data`);
  assert.equal(apiRes.status, 200);
  const data = (await apiRes.json()) as any;
  assert.ok(data.snapshot, 'API must return active snapshot');
  assert.ok(data.clusters.length >= 3, 'API must return detected feature clusters');
  assert.ok(data.entities.length >= 5, 'API must return extracted entities');
  assert.ok(data.projectTree, 'API must return project directory tree');

  // 5. Test HTTP GET /api/file
  const fileRes = await fetch(`${instance.url}/api/file?path=app/billing/page.tsx`);
  assert.equal(fileRes.status, 200);
  const fileData = (await fileRes.json()) as any;
  assert.ok(fileData.content.includes('BillingPage'), 'Must return real file content');

  // 5. Clean up
  await new Promise<void>((resolve) => instance.server.close(() => resolve()));
  store.close();
  await fs.rm(path.dirname(tempDbPath), { recursive: true, force: true });
});
