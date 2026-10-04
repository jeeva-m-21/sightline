import http from 'node:http';
import { SightlineStore } from '@sightline/store';
import { getViewerHtml } from './viewer-html.js';

export interface ServerInstance {
  server: http.Server;
  port: number;
  url: string;
}

export function startViewerServer(store: SightlineStore, preferredPort = 3111): Promise<ServerInstance> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
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
          res.end(JSON.stringify({ snapshot: null, clusters: [], entities: [], edges: [] }));
          return;
        }

        const clusters = store.getClusters(latest.id);
        const entities = store.getEntities(latest.id);
        const edges = store.getEdges(latest.id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ snapshot: latest, clusters, entities, edges }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    const listenOnPort = (port: number) => {
      server.listen(port, () => {
        resolve({
          server,
          port,
          url: `http://localhost:${port}`,
        });
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          listenOnPort(port + 1);
        } else {
          reject(err);
        }
      });
    };

    listenOnPort(preferredPort);
  });
}
