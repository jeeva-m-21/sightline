import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { NextJsAdapter } from './adapter.js';

test('Golden Repo Benchmark: nextjs-minimal full analysis', async () => {
  const adapter = new NextJsAdapter();
  const goldenRepoPath = path.resolve(__dirname, '../../../testbed/golden-repos/nextjs-minimal');

  const startTime = Date.now();
  const result = await adapter.analyze(goldenRepoPath);
  const elapsed = Date.now() - startTime;

  // Performance assertion (< 2000ms)
  assert.ok(elapsed < 2000, `Analysis should take < 2s, took ${elapsed}ms`);

  // Route assertions
  const urlPaths = result.routes.map((r) => r.urlPath);
  assert.ok(urlPaths.includes('/'), 'Should discover root page /');
  assert.ok(urlPaths.includes('/login'), 'Should discover /login');
  assert.ok(urlPaths.includes('/billing'), 'Should discover /billing');
  assert.ok(urlPaths.includes('/dashboard'), 'Should discover /dashboard');
  assert.ok(urlPaths.includes('/api/auth/login'), 'Should discover /api/auth/login');
  assert.ok(urlPaths.includes('/api/checkout'), 'Should discover /api/checkout');

  // Clustering assertions (<= 12 clusters)
  assert.ok(result.clusters.length <= 12, 'Must enforce <= 12 clusters');
  assert.ok(result.clusters.length >= 3, 'Must identify at least 3 distinct feature clusters');

  const clusterIds = result.clusters.map((c) => c.id);
  assert.ok(clusterIds.includes('auth'), 'Must identify Authentication feature');
  assert.ok(clusterIds.includes('billing'), 'Must identify Billing feature');
  assert.ok(clusterIds.includes('dashboard'), 'Must identify Dashboard feature');
  assert.ok(clusterIds.includes('marketing'), 'Must identify Marketing feature');

  // Extracted files assertions
  const allSymbols = result.extractedFiles.flatMap((f) => f.symbols.map((s) => s.name));
  assert.ok(allSymbols.includes('HomePage'), 'Should extract HomePage symbol');
  assert.ok(allSymbols.includes('LoginPage'), 'Should extract LoginPage symbol');
  assert.ok(allSymbols.includes('BillingPage'), 'Should extract BillingPage symbol');
  assert.ok(allSymbols.includes('Button'), 'Should extract Button symbol');
  assert.ok(allSymbols.includes('Header'), 'Should extract Header symbol');
  assert.ok(allSymbols.includes('POST'), 'Should extract POST route symbol');

  // Directives check
  const loginFile = result.extractedFiles.find((f) => f.filePath.includes('login/page.tsx'));
  assert.equal(loginFile?.isClientComponent, true, 'LoginPage must have isClientComponent: true');
});
