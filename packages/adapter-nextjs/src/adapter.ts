import fs from 'node:fs/promises';
import path from 'node:path';
import { AstExtractor, ExtractedFile } from '@sightline/extractor';
import { FeatureClusterer } from './clusterer.js';
import { resolveNextRoute } from './routes.js';
import { FeatureCluster, NextRouteInfo } from './types.js';

export interface NextJsAnalysisResult {
  routes: NextRouteInfo[];
  clusters: FeatureCluster[];
  extractedFiles: ExtractedFile[];
}

export class NextJsAdapter {
  private extractor: AstExtractor;
  private clusterer: FeatureClusterer;

  constructor() {
    this.extractor = new AstExtractor();
    this.clusterer = new FeatureClusterer();
  }

  public async analyze(projectRoot: string): Promise<NextJsAnalysisResult> {
    const filePaths = await this.discoverSourceFiles(projectRoot);
    const routes: NextRouteInfo[] = [];
    const extractedFiles: ExtractedFile[] = [];

    for (const file of filePaths) {
      const relPath = path.relative(projectRoot, file).replace(/\\/g, '/');
      const routeInfo = resolveNextRoute(relPath);
      if (routeInfo) {
        routes.push(routeInfo);
      }

      try {
        const content = await fs.readFile(file, 'utf-8');
        const extracted = this.extractor.extract(relPath, content);
        extractedFiles.push(extracted);
      } catch (err) {
        console.warn(`Could not extract AST from ${relPath}:`, err);
      }
    }

    const clusters = this.clusterer.clusterRoutes(routes);

    return {
      routes,
      clusters,
      extractedFiles,
    };
  }

  private async discoverSourceFiles(dir: string): Promise<string[]> {
    const results: string[] = [];

    const walk = async (currentDir: string) => {
      let entries;
      try {
        entries = await fs.readdir(currentDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip ignore patterns
          if (
            ['node_modules', '.next', '.git', 'dist', 'build', '.sightline', 'testbed'].includes(
              entry.name
            )
          ) {
            continue;
          }
          await walk(fullPath);
        } else if (entry.isFile()) {
          if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
            results.push(fullPath);
          }
        }
      }
    };

    await walk(dir);
    return results;
  }
}
