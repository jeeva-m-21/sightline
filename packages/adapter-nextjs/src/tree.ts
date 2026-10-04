import fs from 'node:fs/promises';
import path from 'node:path';
import { ExtractedFile } from '@sightline/extractor';
import { NextRouteInfo, RepoFileNode } from './types.js';

export async function buildProjectTree(
  rootDir: string,
  routes: NextRouteInfo[],
  extractedFiles: ExtractedFile[]
): Promise<RepoFileNode> {
  const routeMap = new Map<string, NextRouteInfo>();
  for (const r of routes) {
    routeMap.set(r.filePath, r);
  }

  const fileMap = new Map<string, ExtractedFile>();
  for (const f of extractedFiles) {
    fileMap.set(f.filePath, f);
  }

  const walk = async (currentDir: string): Promise<RepoFileNode[]> => {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return [];
    }

    // Sort: directories first, then alphabetical
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const nodes: RepoFileNode[] = [];

    for (const entry of entries) {
      if (['node_modules', '.next', '.git', 'dist', 'build', '.sightline', 'testbed'].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const children = await walk(fullPath);
        if (children.length > 0) {
          nodes.push({
            name: entry.name,
            path: relPath,
            kind: 'directory',
            children,
          });
        }
      } else if (entry.isFile()) {
        if (!/\.(tsx|ts|jsx|js|json|css|md)$/.test(entry.name) || entry.name.endsWith('.d.ts')) {
          continue;
        }

        const route = routeMap.get(relPath);
        const extracted = fileMap.get(relPath);

        let fileType: RepoFileNode['fileType'] = 'utility';
        if (route) {
          fileType = route.kind === 'api_route' ? 'route' : 'page';
        } else if (extracted && extracted.symbols.some((s) => s.kind === 'component')) {
          fileType = 'component';
        }

        const outgoingCount = (extracted?.calls.length || 0) + (extracted?.renderedComponents.length || 0);

        nodes.push({
          name: entry.name,
          path: relPath,
          kind: 'file',
          fileType,
          urlPath: route?.urlPath,
          isClientComponent: extracted?.isClientComponent || false,
          isServerAction: extracted?.isServerActionFile || false,
          symbolsCount: extracted?.symbols.length || 0,
          outgoingCount,
        });
      }
    }

    return nodes;
  };

  const children = await walk(rootDir);
  return {
    name: path.basename(rootDir),
    path: '',
    kind: 'directory',
    children,
  };
}
