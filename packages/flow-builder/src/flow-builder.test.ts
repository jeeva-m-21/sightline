import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRouteInfo } from '@sightline/adapter-nextjs';
import { ExtractedFile } from '@sightline/extractor';
import { CrossBoundaryResolver } from './resolver.js';
import { FlowBuilder } from './builder.js';

test('CrossBoundaryResolver resolves static and dynamic Next.js routes', () => {
  const resolver = new CrossBoundaryResolver();
  const routes: NextRouteInfo[] = [
    {
      urlPath: '/api/checkout',
      filePath: 'app/api/checkout/route.ts',
      kind: 'api_route',
      isDynamic: false,
      paramNames: [],
    },
    {
      urlPath: '/api/users/[id]',
      filePath: 'app/api/users/[id]/route.ts',
      kind: 'api_route',
      isDynamic: true,
      paramNames: ['id'],
    },
  ];

  // 1. Static match
  const match1 = resolver.resolveRouteForCall('/api/checkout', routes);
  assert.ok(match1);
  assert.equal(match1?.filePath, 'app/api/checkout/route.ts');

  // 2. Dynamic match
  const match2 = resolver.resolveRouteForCall('/api/users/12345', routes);
  assert.ok(match2);
  assert.equal(match2?.filePath, 'app/api/users/[id]/route.ts');

  // 3. Unmatched call
  const match3 = resolver.resolveRouteForCall('/api/nonexistent', routes);
  assert.equal(match3, null);
});

test('CrossBoundaryResolver detects Stripe and database boundaries', () => {
  const resolver = new CrossBoundaryResolver();
  const sampleCheckoutCode = `
    import Stripe from 'stripe';
    export async function POST(req: Request) {
      const stripe = new Stripe('sk_test_123');
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: 'https://example.com/success',
      });
      return Response.json({ url: session.url });
    }
  `;

  const boundaries = resolver.detectBoundaries(sampleCheckoutCode, 'app/api/checkout/route.ts');
  assert.ok(boundaries.length >= 1);
  assert.equal(boundaries[0].kind, 'external_api');
  assert.equal(boundaries[0].name, 'Stripe Payment Gateway');
});

test('FlowBuilder materializes end-to-end cross-boundary flow', () => {
  const builder = new FlowBuilder();

  const routes: NextRouteInfo[] = [
    {
      urlPath: '/billing',
      filePath: 'app/billing/page.tsx',
      kind: 'page',
      isDynamic: false,
      paramNames: [],
    },
    {
      urlPath: '/api/checkout',
      filePath: 'app/api/checkout/route.ts',
      kind: 'api_route',
      isDynamic: false,
      paramNames: [],
    },
  ];

  const extractedFiles: ExtractedFile[] = [
    {
      filePath: 'app/billing/page.tsx',
      contentHash: 'hash1',
      isClientComponent: true,
      isServerActionFile: false,
      symbols: [
        { name: 'BillingPage', kind: 'component', startLine: 5, endLine: 25, isExported: true },
        { name: 'handleUpgrade', kind: 'function', startLine: 6, endLine: 13, isExported: false },
      ],
      imports: [],
      calls: [{ callee: 'fetch', args: ['/api/checkout'], line: 7 }],
      renderedComponents: [
        { tag: 'Button', line: 21, props: { onClick: 'handleUpgrade' } },
      ],
    },
    {
      filePath: 'app/api/checkout/route.ts',
      contentHash: 'hash2',
      isClientComponent: false,
      isServerActionFile: false,
      symbols: [{ name: 'POST', kind: 'route', startLine: 1, endLine: 6, isExported: true }],
      imports: [],
      calls: [],
      renderedComponents: [],
    },
  ];

  const fileContents = new Map<string, string>();
  fileContents.set(
    'app/api/checkout/route.ts',
    `export async function POST() { return Response.json({ url: 'https://checkout.stripe.com/pay' }); }`
  );

  const flows = builder.buildFlows('snap-123', routes, extractedFiles, fileContents);

  assert.equal(flows.length, 1);
  const checkoutFlow = flows[0];
  assert.ok(checkoutFlow.name.includes('Billing') || checkoutFlow.name.includes('CHECKOUT'));
  assert.equal(checkoutFlow.steps.length, 4); // Screen -> Function -> Route -> Stripe boundary
  assert.equal(checkoutFlow.minProvenance, 'HEURISTIC'); // Because client fetch is matched heuristically by URL
  assert.equal(checkoutFlow.confidence, 'LIKELY');
});
