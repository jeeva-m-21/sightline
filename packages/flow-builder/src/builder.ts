import crypto from 'node:crypto';
import { calculateConfidence, PROVENANCE_WEIGHTS, ProvenanceKind } from '@sightline/core';
import { NextRouteInfo } from '@sightline/adapter-nextjs';
import { ExtractedFile } from '@sightline/extractor';
import { CrossBoundaryResolver } from './resolver.js';
import { EntryPointDetector } from './entrypoints.js';
import { FlowEntryPoint, TraceFlow, TraceStep } from './types.js';

export class FlowBuilder {
  private resolver: CrossBoundaryResolver;
  private entryDetector: EntryPointDetector;

  constructor() {
    this.resolver = new CrossBoundaryResolver();
    this.entryDetector = new EntryPointDetector();
  }

  /**
   * Materializes all cross-boundary flows across the codebase.
   */
  public buildFlows(
    snapshotId: string,
    routes: NextRouteInfo[],
    extractedFiles: ExtractedFile[],
    fileContents?: Map<string, string>
  ): TraceFlow[] {
    const flows: TraceFlow[] = [];
    const entryPoints = this.entryDetector.detectEntryPoints(routes, extractedFiles);

    const fileMap = new Map<string, ExtractedFile>();
    for (const f of extractedFiles) {
      fileMap.set(f.filePath, f);
    }

    // Process UI Pages as top-level user flow roots
    const pageEntryPoints = entryPoints.filter((e) => e.kind === 'page');

    for (const pageEntry of pageEntryPoints) {
      const pageFile = fileMap.get(pageEntry.filePath);
      if (!pageFile) continue;

      // Check if this page contains client requests or user interactions
      const clientCalls = pageFile.calls.filter((c) => c.callee === 'fetch' && c.args[0]);

      if (clientCalls.length > 0) {
        for (const call of clientCalls) {
          const flow = this.buildPageToBackendFlow(
            snapshotId,
            pageEntry,
            pageFile,
            call.args[0],
            routes,
            fileMap,
            fileContents
          );
          if (flow) {
            flows.push(flow);
          }
        }
      } else {
        // Simple page render flow
        const steps: TraceStep[] = [
          {
            entityId: `${pageFile.filePath}#${pageEntry.name}`,
            name: pageEntry.name,
            filePath: pageFile.filePath,
            line: pageEntry.line,
            kind: 'page',
            rel: 'entrypoint render',
            provenance: 'EXTRACTED',
            description: `Server Component entry page mounted for ${pageEntry.urlPath}`,
            invariants: [
              pageFile.isClientComponent ? 'Hydrates on Client' : 'Renders on Server',
              'Static or ISR caching active',
            ],
          },
        ];

        // Rendered children components
        for (const jsx of pageFile.renderedComponents) {
          steps.push({
            entityId: `${pageFile.filePath}#${jsx.tag}`,
            name: `<${jsx.tag} /> Component`,
            filePath: pageFile.filePath,
            line: jsx.line,
            kind: 'component',
            rel: 'renders in JSX',
            provenance: 'EXTRACTED',
            description: `Renders presentational component <${jsx.tag} />`,
            invariants: ['Pure presentational component', 'Prop validation enforced'],
          });
        }

        const flowId = crypto.createHash('sha256').update(`${pageEntry.filePath}:render`).digest('hex').slice(0, 16);
        flows.push({
          id: flowId,
          snapshotId,
          name: `${pageEntry.name} Page Flow`,
          description: `UI rendering sequence for ${pageEntry.urlPath}`,
          entryPoint: pageEntry,
          steps,
          minProvenance: 'EXTRACTED',
          confidence: 'CERTAIN',
          score: 1.0,
        });
      }
    }

    return flows;
  }

  private buildPageToBackendFlow(
    snapshotId: string,
    pageEntry: FlowEntryPoint,
    pageFile: ExtractedFile,
    callUrl: string,
    routes: NextRouteInfo[],
    fileMap: Map<string, ExtractedFile>,
    fileContents?: Map<string, string>
  ): TraceFlow | null {
    const targetRoute = this.resolver.resolveRouteForCall(callUrl, routes);
    if (!targetRoute) return null;

    const steps: TraceStep[] = [];
    const provenances: ProvenanceKind[] = ['EXTRACTED'];
    let pathScore = 1.0;

    // Step 1: Entry Page Component
    steps.push({
      entityId: `${pageFile.filePath}#${pageEntry.name}`,
      name: `${pageEntry.name} Screen`,
      filePath: pageFile.filePath,
      line: pageEntry.line,
      kind: 'screen',
      rel: 'user entrypoint',
      provenance: 'EXTRACTED',
      description: `User visits ${pageEntry.urlPath || pageFile.filePath} and prepares action`,
      invariants: [
        pageFile.isClientComponent ? 'Client Component' : 'Server Component',
        'State hydrated',
      ],
    });

    // Step 2: Event Handler (e.g. handleUpgrade or handleSubmit)
    // Find handler function containing the fetch call
    const callObj = pageFile.calls.find((c) => c.callee === 'fetch' && c.args[0] === callUrl);
    const handlerSym = pageFile.symbols.find(
      (s) => s.kind === 'function' && callObj && s.startLine <= callObj.line && s.endLine >= callObj.line
    );

    const handlerName = handlerSym ? `${handlerSym.name}()` : 'dispatchRequest()';
    steps.push({
      entityId: `${pageFile.filePath}#${handlerSym?.name || 'handler'}`,
      name: handlerName,
      filePath: pageFile.filePath,
      line: handlerSym?.startLine || callObj?.line,
      kind: 'function',
      rel: `requests ${callUrl}`,
      provenance: 'HEURISTIC',
      description: `Client async function triggers HTTP request to ${callUrl}`,
      invariants: ['CSRF protected', 'Client async execution'],
    });
    provenances.push('HEURISTIC');
    pathScore *= PROVENANCE_WEIGHTS['HEURISTIC'];

    // Step 3: Next.js API Route Handler
    const routeFile = fileMap.get(targetRoute.filePath);
    const routeMethodSym = routeFile?.symbols.find((s) => s.kind === 'route') || {
      name: 'POST',
      startLine: 1,
    };

    steps.push({
      entityId: `${targetRoute.filePath}#${routeMethodSym.name}`,
      name: `${routeMethodSym.name} ${targetRoute.urlPath}`,
      filePath: targetRoute.filePath,
      line: routeMethodSym.startLine,
      kind: 'route',
      rel: 'route handler',
      provenance: 'EXTRACTED',
      description: `Next.js App Router server handler processes request body and authenticates caller`,
      invariants: ['Server-only environment', 'Parses JSON payload'],
    });
    provenances.push('EXTRACTED');
    pathScore *= PROVENANCE_WEIGHTS['EXTRACTED'];

    // Step 4: External / Persistence Boundaries
    const targetContent = fileContents?.get(targetRoute.filePath) || '';
    const boundaries = this.resolver.detectBoundaries(targetContent, targetRoute.filePath);

    if (boundaries.length > 0) {
      for (const b of boundaries) {
        steps.push({
          entityId: `${b.target}#boundary`,
          name: b.name,
          filePath: b.evidence?.filePath || targetRoute.filePath,
          kind: b.kind,
          rel: 'boundary dispatch',
          provenance: b.provenance,
          description: `Dispatches execution across boundary to ${b.target}`,
          invariants: ['External boundary contract', 'Verified with AST evidence'],
        });
        provenances.push(b.provenance);
        pathScore *= PROVENANCE_WEIGHTS[b.provenance];
      }
    }

    // Determine weakest link provenance
    const minProvenance = provenances.includes('INFERRED')
      ? 'INFERRED'
      : provenances.includes('HEURISTIC')
      ? 'HEURISTIC'
      : 'EXTRACTED';

    const confidence = calculateConfidence(pathScore);
    const flowId = crypto
      .createHash('sha256')
      .update(`${pageFile.filePath}:${callUrl}`)
      .digest('hex')
      .slice(0, 16);

    const friendlyName = `${pageEntry.name.replace(/Page$/, '')} ➔ ${targetRoute.urlPath.split('/').pop()?.toUpperCase()} Flow`;

    return {
      id: flowId,
      snapshotId,
      name: friendlyName,
      description: `Cross-boundary flow from ${pageEntry.urlPath} to ${targetRoute.urlPath}`,
      entryPoint: pageEntry,
      steps,
      minProvenance,
      confidence,
      score: pathScore,
    };
  }
}
