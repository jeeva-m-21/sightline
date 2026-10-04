import { NextRouteInfo } from '@sightline/adapter-nextjs';
import { ResolvedBoundary } from './types.js';

export class CrossBoundaryResolver {
  /**
   * Resolves a client fetch URL (e.g. '/api/checkout') to a NextRouteInfo.
   */
  public resolveRouteForCall(
    urlCall: string,
    routes: NextRouteInfo[]
  ): NextRouteInfo | null {
    if (!urlCall) return null;

    // Normalize: strip query parameters and hash, remove trailing slash
    const cleanUrl = urlCall.split('?')[0].split('#')[0].replace(/\/$/, '');

    // 1. Direct exact match
    const exact = routes.find((r) => r.urlPath.replace(/\/$/, '') === cleanUrl);
    if (exact) return exact;

    // 2. Dynamic segment matching: '/api/users/123' -> '/api/users/[id]'
    for (const r of routes) {
      if (this.matchDynamicRoute(r.urlPath, cleanUrl)) {
        return r;
      }
    }

    return null;
  }

  /**
   * Matches a route pattern with dynamic segments like [id] or [...slug]
   */
  private matchDynamicRoute(routePattern: string, actualUrl: string): boolean {
    const routeParts = routePattern.replace(/\/$/, '').split('/');
    const urlParts = actualUrl.replace(/\/$/, '').split('/');

    if (routeParts.length !== urlParts.length) {
      // Check for catch-all [...slug]
      if (routePattern.includes('[...')) {
        const catchAllIdx = routeParts.findIndex((p) => p.startsWith('[...'));
        if (catchAllIdx !== -1 && urlParts.length >= catchAllIdx) {
          return routeParts.slice(0, catchAllIdx).every((p, i) => p === urlParts[i]);
        }
      }
      return false;
    }

    return routeParts.every((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) return true;
      return part === urlParts[idx];
    });
  }

  /**
   * Detects external service and database boundaries inside a route handler or service file.
   */
  public detectBoundaries(fileContent: string, filePath: string): ResolvedBoundary[] {
    const boundaries: ResolvedBoundary[] = [];

    // 1. Stripe Payment Service
    if (/stripe\.|\bcheckout\.stripe\.com\b/i.test(fileContent)) {
      boundaries.push({
        kind: 'external_api',
        name: 'Stripe Payment Gateway',
        target: 'https://api.stripe.com',
        provenance: 'EXTRACTED',
        evidence: {
          filePath,
          rawSnippet: 'Stripe session initiation or webhook handler',
        },
      });
    }

    // 2. OpenAI / LLM API
    if (/openai\.|\bapi\.openai\.com\b/i.test(fileContent)) {
      boundaries.push({
        kind: 'external_api',
        name: 'OpenAI Intelligence API',
        target: 'https://api.openai.com/v1',
        provenance: 'EXTRACTED',
        evidence: {
          filePath,
          rawSnippet: 'OpenAI client completion or embedding call',
        },
      });
    }

    // 3. Prisma ORM Database Models
    const prismaMatches = fileContent.matchAll(/prisma\.([a-zA-Z0-9_]+)\.(findMany|findUnique|findFirst|create|update|delete|upsert)/g);
    for (const match of prismaMatches) {
      const model = match[1];
      boundaries.push({
        kind: 'database_table',
        name: `${model} Model`,
        target: `prisma.${model}`,
        provenance: 'EXTRACTED',
        evidence: {
          filePath,
          rawSnippet: match[0],
        },
      });
    }

    // 4. Supabase Database Tables
    const supabaseMatches = fileContent.matchAll(/supabase\.from\(['"]([a-zA-Z0-9_]+)['"]\)/g);
    for (const match of supabaseMatches) {
      const table = match[1];
      boundaries.push({
        kind: 'database_table',
        name: `${table} Table`,
        target: `supabase.${table}`,
        provenance: 'EXTRACTED',
        evidence: {
          filePath,
          rawSnippet: match[0],
        },
      });
    }

    // 5. Auth & JWT Sessions
    if (/\bjwt\.sign\b|\bcookies\(\)\.set\(['"]token['"]|\bcreateSession\b/i.test(fileContent)) {
      boundaries.push({
        kind: 'session_auth',
        name: 'Session Token Dispatcher',
        target: 'session.cookie',
        provenance: 'EXTRACTED',
        evidence: {
          filePath,
          rawSnippet: 'Secure HTTP session / JWT generation',
        },
      });
    }

    return boundaries;
  }
}
