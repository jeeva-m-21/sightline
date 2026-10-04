import path from 'node:path';
import { NextRouteInfo, NextRouteKind } from './types.js';

/**
 * Normalizes and extracts route URL and metadata from a Next.js file path.
 */
export function resolveNextRoute(filePath: string): NextRouteInfo | null {
  // Normalize slashes
  const normalized = filePath.replace(/\\/g, '/');

  // Match App Router (app/ or src/app/)
  const appMatch = normalized.match(/(?:^|\/)(?:src\/)?app\/(.+)$/);
  if (appMatch) {
    const rel = appMatch[1];
    const parts = rel.split('/');
    const fileName = parts[parts.length - 1];
    const fileBase = fileName.replace(/\.(tsx|jsx|ts|js)$/, '');

    let kind: NextRouteKind | null = null;
    if (fileBase === 'page') kind = 'page';
    else if (fileBase === 'layout') kind = 'layout';
    else if (fileBase === 'route') kind = 'api_route';

    if (!kind) return null;

    // Route segments (excluding the file itself)
    const segmentParts = parts.slice(0, -1);
    const urlSegments: string[] = [];
    const paramNames: string[] = [];
    let isDynamic = false;

    for (const seg of segmentParts) {
      // Ignore Route Groups like (auth), (dashboard)
      if (/^\(.*\)$/.test(seg)) continue;
      // Ignore Parallel Routes like @modal
      if (/^@/.test(seg)) continue;
      // Ignore Intercepting Routes like (.)photo
      if (/^\(.\)/.test(seg)) continue;

      // Dynamic segments: [id], [...slug], [[...slug]]
      const dynMatch = seg.match(/^\[\.{0,3}([a-zA-Z0-9_-]+)\]$/);
      if (dynMatch) {
        isDynamic = true;
        paramNames.push(dynMatch[1]);
        if (seg.startsWith('[...')) {
          urlSegments.push(`*${dynMatch[1]}`);
        } else {
          urlSegments.push(`:${dynMatch[1]}`);
        }
      } else {
        urlSegments.push(seg);
      }
    }

    const urlPath = '/' + urlSegments.join('/');
    return {
      urlPath: urlPath === '' ? '/' : urlPath,
      kind,
      filePath: normalized,
      isDynamic,
      paramNames,
    };
  }

  // Match Pages Router (pages/ or src/pages/)
  const pagesMatch = normalized.match(/(?:^|\/)(?:src\/)?pages\/(.+)$/);
  if (pagesMatch) {
    const rel = pagesMatch[1];
    const parts = rel.split('/');
    const fileName = parts[parts.length - 1];
    const fileBase = fileName.replace(/\.(tsx|jsx|ts|js)$/, '');

    // Skip special Next.js pages: _app, _document, _error
    if (fileBase.startsWith('_')) return null;

    const isApi = parts[0] === 'api';
    const kind: NextRouteKind = isApi ? 'api_route' : 'page';

    const segmentParts = [...parts.slice(0, -1)];
    if (fileBase !== 'index') {
      segmentParts.push(fileBase);
    }

    const urlSegments: string[] = [];
    const paramNames: string[] = [];
    let isDynamic = false;

    for (const seg of segmentParts) {
      const dynMatch = seg.match(/^\[\.{0,3}([a-zA-Z0-9_-]+)\]$/);
      if (dynMatch) {
        isDynamic = true;
        paramNames.push(dynMatch[1]);
        if (seg.startsWith('[...')) {
          urlSegments.push(`*${dynMatch[1]}`);
        } else {
          urlSegments.push(`:${dynMatch[1]}`);
        }
      } else {
        urlSegments.push(seg);
      }
    }

    const urlPath = '/' + urlSegments.join('/');
    return {
      urlPath: urlPath === '' ? '/' : urlPath,
      kind,
      filePath: normalized,
      isDynamic,
      paramNames,
    };
  }

  return null;
}
