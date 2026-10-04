import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveNextRoute } from './routes.js';
import { FeatureClusterer } from './clusterer.js';
import { NextRouteInfo } from './types.js';

test('resolveNextRoute correctly maps App Router routes and groups', () => {
  // 1. Root page
  const root = resolveNextRoute('app/page.tsx');
  assert.equal(root?.urlPath, '/');
  assert.equal(root?.kind, 'page');
  assert.equal(root?.isDynamic, false);

  // 2. Route group (auth)
  const login = resolveNextRoute('app/(auth)/login/page.tsx');
  assert.equal(login?.urlPath, '/login');
  assert.equal(login?.kind, 'page');

  // 3. Nested dynamic route
  const user = resolveNextRoute('src/app/users/[id]/page.tsx');
  assert.equal(user?.urlPath, '/users/:id');
  assert.equal(user?.isDynamic, true);
  assert.deepEqual(user?.paramNames, ['id']);

  // 4. API route
  const api = resolveNextRoute('app/api/checkout/route.ts');
  assert.equal(api?.urlPath, '/api/checkout');
  assert.equal(api?.kind, 'api_route');

  // 5. Catch-all dynamic route
  const blog = resolveNextRoute('app/blog/[...slug]/page.tsx');
  assert.equal(blog?.urlPath, '/blog/*slug');
  assert.equal(blog?.isDynamic, true);
});

test('FeatureClusterer groups routes logically and enforces <= 12 clusters', () => {
  const clusterer = new FeatureClusterer();
  const sampleRoutes: NextRouteInfo[] = [
    { urlPath: '/', kind: 'page', filePath: 'app/page.tsx', isDynamic: false, paramNames: [] },
    { urlPath: '/login', kind: 'page', filePath: 'app/(auth)/login/page.tsx', isDynamic: false, paramNames: [] },
    { urlPath: '/signup', kind: 'page', filePath: 'app/(auth)/signup/page.tsx', isDynamic: false, paramNames: [] },
    { urlPath: '/billing', kind: 'page', filePath: 'app/billing/page.tsx', isDynamic: false, paramNames: [] },
    { urlPath: '/api/stripe/webhook', kind: 'api_route', filePath: 'app/api/stripe/webhook/route.ts', isDynamic: false, paramNames: [] },
    { urlPath: '/dashboard', kind: 'page', filePath: 'app/dashboard/page.tsx', isDynamic: false, paramNames: [] },
    { urlPath: '/settings/profile', kind: 'page', filePath: 'app/settings/profile/page.tsx', isDynamic: false, paramNames: [] },
  ];

  const clusters = clusterer.clusterRoutes(sampleRoutes);

  assert.ok(clusters.length <= 12, 'Must enforce <= 12 clusters');

  const clusterIds = clusters.map((c) => c.id);
  assert.ok(clusterIds.includes('marketing'), 'Should contain marketing cluster');
  assert.ok(clusterIds.includes('auth'), 'Should contain auth cluster');
  assert.ok(clusterIds.includes('billing'), 'Should contain billing cluster');
  assert.ok(clusterIds.includes('dashboard'), 'Should contain dashboard cluster');
  assert.ok(clusterIds.includes('settings'), 'Should contain settings cluster');

  const authCluster = clusters.find((c) => c.id === 'auth');
  assert.equal(authCluster?.routes.length, 2, 'Auth cluster should have 2 routes (/login, /signup)');
});
