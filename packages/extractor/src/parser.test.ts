import test from 'node:test';
import assert from 'node:assert/strict';
import { AstExtractor } from './parser.js';

test('AstExtractor parses TSX component, imports, hooks, and JSX calls', () => {
  const extractor = new AstExtractor();
  const code = `
    "use client";
    import React, { useState } from 'react';
    import { CheckoutButton } from '@/components/CheckoutButton';

    export function useCart() {
      const [items, setItems] = useState([]);
      return { items };
    }

    export default function ShoppingCartPage() {
      const { items } = useCart();
      
      const handleCheckout = () => {
        fetch('/api/checkout', { method: 'POST' });
      };

      return (
        <div className="cart">
          <h1>Your Cart</h1>
          <CheckoutButton onClick={handleCheckout} />
        </div>
      );
    }
  `;

  const result = extractor.extract('app/cart/page.tsx', code);

  assert.equal(result.isClientComponent, true);
  assert.equal(result.isServerActionFile, false);

  // Symbols
  const symbols = result.symbols.map((s) => s.name);
  assert.ok(symbols.includes('useCart'), 'useCart should be extracted');
  assert.ok(symbols.includes('ShoppingCartPage'), 'ShoppingCartPage should be extracted');

  const useCartSym = result.symbols.find((s) => s.name === 'useCart');
  assert.equal(useCartSym?.kind, 'hook');
  assert.equal(useCartSym?.isExported, true);

  const cartPageSym = result.symbols.find((s) => s.name === 'ShoppingCartPage');
  assert.equal(cartPageSym?.kind, 'component');
  assert.equal(cartPageSym?.isExported, true);
  assert.equal(cartPageSym?.isDefaultExport, true);

  // Imports
  assert.equal(result.imports.length, 2);
  const reactImport = result.imports.find((i) => i.source === 'react');
  assert.ok(reactImport);
  assert.ok(reactImport?.specifiers.some((s) => s.local === 'React' && s.isDefault));
  assert.ok(reactImport?.specifiers.some((s) => s.local === 'useState'));

  // Calls
  const fetchCall = result.calls.find((c) => c.callee === 'fetch');
  assert.ok(fetchCall, 'fetch call should be detected');
  assert.deepEqual(fetchCall?.args, ['/api/checkout']);

  // Rendered Components
  assert.ok(
    result.renderedComponents.some((c) => c.tag === 'CheckoutButton'),
    'CheckoutButton JSX should be detected'
  );
});

test('AstExtractor identifies Next.js Route Handlers and server directives', () => {
  const extractor = new AstExtractor();
  const code = `
    "use server";
    import { db } from '@/lib/db';

    export async function GET(request: Request) {
      const users = await db.user.findMany();
      return Response.json(users);
    }

    export async function POST(request: Request) {
      return Response.json({ success: true });
    }
  `;

  const result = extractor.extract('app/api/users/route.ts', code);

  assert.equal(result.isServerActionFile, true);
  assert.equal(result.isClientComponent, false);

  const getRoute = result.symbols.find((s) => s.name === 'GET');
  assert.equal(getRoute?.kind, 'route');
  assert.equal(getRoute?.isExported, true);

  const postRoute = result.symbols.find((s) => s.name === 'POST');
  assert.equal(postRoute?.kind, 'route');
  assert.equal(postRoute?.isExported, true);
});
