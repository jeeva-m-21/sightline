import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SightlineStore } from '@sightline/store';
import { getViewerHtml } from './viewer-html.js';

export interface ServerInstance {
  server: http.Server;
  port: number;
  url: string;
}

export function startViewerServer(
  store: SightlineStore,
  projectDir: string,
  preferredPort = 3111
): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getViewerHtml());
        return;
      }

      if (url.pathname === '/api/data') {
        const latest = store.getLatestSnapshot();
        if (!latest) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ snapshot: null, clusters: [], entities: [], edges: [], projectTree: null }));
          return;
        }

        const clusters = store.getClusters(latest.id);
        const entities = store.getEntities(latest.id);
        const edges = store.getEdges(latest.id);
        const projectTree = store.getProjectTree(latest.id);
        const flows = store.getFlows(latest.id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ snapshot: latest, clusters, entities, edges, projectTree, flows, projectDir }));
        return;
      }

      if (url.pathname === '/api/flows') {
        const latest = store.getLatestSnapshot();
        const flows = latest ? store.getFlows(latest.id) : [];
        const reqId = url.searchParams.get('id');

        if (reqId) {
          const matched = flows.find((f) => f.id === reqId);
          if (!matched) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Flow not found' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(matched));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ flows }));
        return;
      }

      if (url.pathname === '/api/file') {
        const reqPath = url.searchParams.get('path');
        if (!reqPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }

        // Prevent path traversal
        const resolved = path.resolve(projectDir, reqPath);
        if (!resolved.startsWith(projectDir)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Access denied' }));
          return;
        }

        try {
          const content = await fs.readFile(resolved, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ path: reqPath, content }));
        } catch (err: any) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
        }
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    let currentPort = preferredPort;
    const onError = (err: any) => {
      if (err.code === 'EADDRINUSE') {
        currentPort++;
        server.listen(currentPort, '0.0.0.0');
      } else {
        reject(err);
      }
    };

    server.on('error', onError);
    server.once('listening', () => {
      server.removeListener('error', onError);
      resolve({
        server,
        port: currentPort,
        url: `http://localhost:${currentPort}`,
      });
    });

    server.listen(currentPort, '0.0.0.0');
  });
}
