import { NextRouteInfo } from '@sightline/adapter-nextjs';
import { ExtractedFile } from '@sightline/extractor';
import { FlowEntryPoint } from './types.js';

export class EntryPointDetector {
  /**
   * Discovers all user entry points from Next.js routes and extracted AST files.
   */
  public detectEntryPoints(
    routes: NextRouteInfo[],
    extractedFiles: ExtractedFile[]
  ): FlowEntryPoint[] {
    const entryPoints: FlowEntryPoint[] = [];
    const fileMap = new Map<string, ExtractedFile>();
    for (const f of extractedFiles) {
      fileMap.set(f.filePath, f);
    }

    // 1. Next.js UI Pages (app/.../page.tsx)
    for (const r of routes) {
      if (r.kind === 'page') {
        const file = fileMap.get(r.filePath);
        const mainSym = file?.symbols.find((s) => s.kind === 'component') || file?.symbols[0];
        const name = mainSym ? mainSym.name : r.urlPath;

        entryPoints.push({
          entityId: `${r.filePath}#${name}`,
          name,
          filePath: r.filePath,
          kind: 'page',
          urlPath: r.urlPath,
          line: mainSym?.startLine || 1,
        });
      }
    }

    // 2. Next.js API Routes (app/.../route.ts)
    for (const r of routes) {
      if (r.kind === 'api_route') {
        const file = fileMap.get(r.filePath);
        const routeSymbols = file?.symbols.filter((s) => s.kind === 'route') || [];
        for (const sym of routeSymbols) {
          entryPoints.push({
            entityId: `${r.filePath}#${sym.name}`,
            name: `${sym.name} ${r.urlPath}`,
            filePath: r.filePath,
            kind: 'route',
            urlPath: r.urlPath,
            line: sym.startLine,
          });
        }
      }
    }

    // 3. User Interaction Triggers in Client Components
    for (const file of extractedFiles) {
      for (const jsx of file.renderedComponents) {
        if (jsx.props) {
          const handlerProp = jsx.props['onClick'] || jsx.props['onSubmit'] || jsx.props['action'];
          if (handlerProp) {
            const cleanHandlerName = handlerProp.replace(/[\{\}]/g, '').trim();
            entryPoints.push({
              entityId: `${file.filePath}#${cleanHandlerName}`,
              name: `<${jsx.tag} /> ${cleanHandlerName}()`,
              filePath: file.filePath,
              kind: 'event_handler',
              line: jsx.line,
            });
          }
        }
      }
    }

    return entryPoints;
  }
}
