export function getViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sightline — Architectural Product Map</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre, .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .card-hover:hover { transform: translateY(-2px); border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 12px 28px -6px rgba(99, 102, 241, 0.25); }
    #networkGraph { width: 100%; height: 100%; outline: none; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 h-screen flex flex-col overflow-hidden selection:bg-indigo-500 selection:text-white">
  <!-- Top Navigation & Product Header -->
  <header class="glass z-40 px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
    <div class="flex items-center gap-4">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 text-lg">
        S
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-extrabold text-base tracking-tight text-white">Sightline</h1>
          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">Sprint 1 • Map</span>
        </div>
        <p class="text-xs text-slate-400">Comprehension & Control Layer for AI-Built Software</p>
      </div>
    </div>

    <!-- Mode Switcher & Filter Pills -->
    <div class="flex items-center gap-3">
      <div class="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-medium">
        <button id="tabGraphBtn" class="px-3 py-1.5 rounded-md bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span>Architecture Graph</span>
        </button>
        <button id="tabCardsBtn" class="px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          <span>Capabilities Grid</span>
        </button>
      </div>

      <!-- Quick Search Input -->
      <div class="relative">
        <input id="searchInput" type="text" placeholder="Search routes, components..." 
          class="bg-slate-900 border border-slate-700/80 text-xs rounded-lg px-3 py-1.5 pl-8 w-60 focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 mono" />
        <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
  </header>

  <!-- Explanation Banner for Context -->
  <div class="bg-indigo-950/40 border-b border-indigo-900/40 px-6 py-2 flex items-center justify-between text-xs text-indigo-200/90 shrink-0">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="font-medium text-slate-200">Demonstrating Sprint 1:</span>
      <span class="text-slate-400">Automatic AST Parsing & Next.js Architecture Extraction. Tree-sitter resolved symbols & routes into connected capability flows.</span>
    </div>
    <div class="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-400"></span> Features (<span id="statClusters" class="text-white font-bold">0</span>)</span>
      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Routes (<span id="statRoutes" class="text-white font-bold">0</span>)</span>
      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-400"></span> Components (<span id="statComponents" class="text-white font-bold">0</span>)</span>
      <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Extracted Edges (<span id="statEdges" class="text-white font-bold">0</span>)</span>
    </div>
  </div>

  <!-- Main View Area -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- View Mode A: Interactive Architecture Graph Canvas -->
    <div id="viewGraphContainer" class="flex-1 relative flex flex-col bg-slate-950">
      <!-- Graph Canvas Legend & Controls Overlay -->
      <div class="absolute top-4 left-4 z-20 glass rounded-xl p-3 flex flex-col gap-2.5 text-xs border border-slate-800 shadow-xl pointer-events-auto">
        <div class="font-semibold text-slate-300 text-[11px] uppercase tracking-wider mono">Legend & Provenance</div>
        <div class="flex flex-col gap-1.5 text-[11px]">
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-md bg-indigo-500"></span> <span class="text-slate-300">Feature Cluster</span></div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-md bg-emerald-500"></span> <span class="text-slate-300">Route Page</span></div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-md bg-sky-500"></span> <span class="text-slate-300">React Component</span></div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-md bg-amber-500"></span> <span class="text-slate-300">API Route Handler</span></div>
        </div>
        <div class="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px]">
          <div class="flex items-center gap-2"><span class="text-emerald-400 font-bold">―▶</span> <span class="text-slate-400">renders (● EXTRACTED)</span></div>
          <div class="flex items-center gap-2"><span class="text-amber-400 font-bold">--▶</span> <span class="text-slate-400">requests (◐ HEURISTIC)</span></div>
        </div>
      </div>

      <!-- Graph Canvas Element -->
      <div id="networkGraph"></div>

      <!-- Floating Canvas Tip -->
      <div class="absolute bottom-4 left-4 z-20 glass rounded-lg px-3 py-1.5 text-[11px] text-slate-400 pointer-events-none">
        💡 Drag nodes to rearrange • Scroll to zoom • Click any node to inspect source code
      </div>
    </div>

    <!-- View Mode B: Product Capabilities Grid (Card Zoom) -->
    <div id="viewCardsContainer" class="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full hidden">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-100">Product Capability Map</h2>
          <p class="text-sm text-slate-400 mt-1">High-level capability clusters synthesized from Next.js route trees.</p>
        </div>
      </div>
      <div id="clustersGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"></div>
    </div>

    <!-- Inspection Sidebar Drawer (Level 3 - Evidence & Provenance) -->
    <aside id="inspectorPanel" class="w-[420px] border-l border-slate-800 bg-slate-900/95 flex flex-col transition-all duration-200 z-30 shrink-0 shadow-2xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <h3 class="font-bold text-sm text-slate-200">Architecture Inspector</h3>
          <span id="inspectBadge" class="text-[10px] mono px-2 py-0.5 rounded font-semibold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Node</span>
        </div>
        <button id="closeInspectorBtn" class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition">✕</button>
      </div>

      <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-5 text-sm">
        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Symbol Identifier</label>
          <div id="inspectName" class="font-bold text-lg text-slate-100 mono mt-1 break-all">Select a node</div>
        </div>

        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">File & Line Location</label>
          <div id="inspectLocation" class="text-xs text-indigo-300 mono mt-1 bg-slate-950 p-2.5 rounded border border-slate-800/80 break-all">
            Click any node in the graph to view its source facts
          </div>
        </div>

        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Trust Level & Provenance</label>
          <div id="inspectProvenance" class="mt-1 flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> EXTRACTED (Tree-sitter AST Fact)
            </span>
          </div>
        </div>

        <!-- Connected Relationships -->
        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Outgoing Dependencies</label>
          <div id="inspectOutgoing" class="mt-2 flex flex-col gap-1.5 text-xs mono">
            <span class="text-slate-500">None detected</span>
          </div>
        </div>

        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Incoming Callers / References</label>
          <div id="inspectIncoming" class="mt-2 flex flex-col gap-1.5 text-xs mono">
            <span class="text-slate-500">None detected</span>
          </div>
        </div>

        <div class="mt-auto pt-4 border-t border-slate-800">
          <a id="inspectEditorBtn" href="#" class="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30">
            <span>Jump to Source Code</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    </aside>
  </div>

  <script>
    let rawData = { snapshot: null, clusters: [], entities: [], edges: [] };
    let network = null;
    let nodesDataSet = null;
    let edgesDataSet = null;

    async function init() {
      try {
        const res = await fetch('/api/data');
        rawData = await res.json();
        updateStats();
        initNetworkGraph();
        renderCardsView();
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    function updateStats() {
      document.getElementById('statClusters').textContent = rawData.clusters.length;
      const totalRoutes = rawData.clusters.reduce((acc, c) => acc + c.routes.length, 0);
      document.getElementById('statRoutes').textContent = totalRoutes;
      const componentsCount = rawData.entities.filter(e => e.kind === 'component').length;
      document.getElementById('statComponents').textContent = componentsCount;
      document.getElementById('statEdges').textContent = rawData.edges.length;
    }

    function initNetworkGraph() {
      const container = document.getElementById('networkGraph');
      const nodes = [];
      const edges = [];

      // 1. Cluster nodes (Groups)
      rawData.clusters.forEach(c => {
        nodes.push({
          id: 'cluster_' + c.id,
          label: c.name,
          shape: 'box',
          margin: 12,
          color: {
            background: '#312e81',
            border: '#6366f1',
            highlight: { background: '#4338ca', border: '#a5b4fc' }
          },
          font: { color: '#ffffff', size: 14, face: 'Plus Jakarta Sans', bold: true },
          shadow: { enabled: true, color: 'rgba(99, 102, 241, 0.4)', size: 10 },
          data: { type: 'cluster', raw: c }
        });
      });

      // 2. Entity nodes
      rawData.entities.forEach(e => {
        const name = e.canonicalKey.split('#')[1] || e.canonicalKey;
        let colorBg = '#0284c7';
        let colorBorder = '#38bdf8';
        let shape = 'box';

        if (e.kind === 'component') {
          colorBg = '#0369a1';
          colorBorder = '#0ea5e9';
        } else if (e.kind === 'route') {
          colorBg = '#d97706';
          colorBorder = '#f59e0b';
        } else if (e.kind === 'function') {
          colorBg = '#475569';
          colorBorder = '#94a3b8';
        }

        // Check if page component
        if (e.filePath.endsWith('page.tsx')) {
          colorBg = '#059669';
          colorBorder = '#10b981';
        }

        nodes.push({
          id: e.id,
          label: name,
          shape: shape,
          margin: 8,
          color: {
            background: colorBg,
            border: colorBorder,
            highlight: { background: colorBorder, border: '#ffffff' }
          },
          font: { color: '#ffffff', size: 12, face: 'JetBrains Mono' },
          data: { type: 'entity', raw: e }
        });

        // Connect entity to its feature cluster
        const parentCluster = rawData.clusters.find(c => c.filePaths.includes(e.filePath));
        if (parentCluster) {
          edges.push({
            from: 'cluster_' + parentCluster.id,
            to: e.id,
            color: { color: 'rgba(99, 102, 241, 0.35)', highlight: '#818cf8' },
            arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            dashes: true
          });
        }
      });

      // 3. Extracted and Heuristic Edges (renders, requests)
      rawData.edges.forEach(edge => {
        const isRequest = edge.kind === 'requests';
        edges.push({
          from: edge.src,
          to: edge.dst,
          color: { color: isRequest ? '#f59e0b' : '#10b981', highlight: '#ffffff' },
          arrows: { to: { enabled: true, scaleFactor: 0.8 } },
          dashes: isRequest,
          width: 2,
          title: edge.reason || edge.kind,
          data: { type: 'edge', raw: edge }
        });
      });

      nodesDataSet = new vis.DataSet(nodes);
      edgesDataSet = new vis.DataSet(edges);

      const options = {
        physics: {
          stabilization: { iterations: 150 },
          barnesHut: {
            gravitationalConstant: -3500,
            springConstant: 0.04,
            springLength: 120
          }
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          zoomView: true,
          dragView: true
        }
      };

      network = new vis.Network(container, { nodes: nodesDataSet, edges: edgesDataSet }, options);

      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodeObj = nodesDataSet.get(nodeId);
          if (nodeObj && nodeObj.data) {
            inspectNode(nodeObj);
          }
        }
      });

      // Auto-inspect first node
      const firstEntityNode = nodes.find(n => n.data.type === 'entity');
      if (firstEntityNode) {
        inspectNode(firstEntityNode);
      }
    }

    function inspectNode(nodeObj) {
      const panel = document.getElementById('inspectorPanel');
      panel.classList.remove('hidden');

      const data = nodeObj.data;
      if (data.type === 'entity') {
        const ent = data.raw;
        const symName = ent.canonicalKey.split('#')[1] || ent.canonicalKey;

        document.getElementById('inspectBadge').textContent = ent.kind;
        document.getElementById('inspectName').textContent = symName;
        document.getElementById('inspectLocation').textContent = \`\${ent.filePath} (Lines \${ent.startLine || 1}-\${ent.endLine || 1})\`;

        // Check outgoing edges
        const outgoing = rawData.edges.filter(e => e.src === ent.id);
        const outList = document.getElementById('inspectOutgoing');
        outList.innerHTML = '';
        if (outgoing.length === 0) {
          outList.innerHTML = '<span class="text-slate-500">None detected</span>';
        } else {
          outgoing.forEach(ed => {
            const targetEnt = rawData.entities.find(e => e.id === ed.dst);
            const targetName = targetEnt ? (targetEnt.canonicalKey.split('#')[1] || targetEnt.canonicalKey) : ed.dst;
            const item = document.createElement('div');
            item.className = 'p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between';
            item.innerHTML = \`
              <span class="\${ed.kind === 'requests' ? 'text-amber-400' : 'text-emerald-400'} font-semibold">\${ed.kind} ➔ \${targetName}</span>
              <span class="text-[10px] text-slate-500">\${ed.provenance}</span>
            \`;
            outList.appendChild(item);
          });
        }

        // Check incoming edges
        const incoming = rawData.edges.filter(e => e.dst === ent.id);
        const inList = document.getElementById('inspectIncoming');
        inList.innerHTML = '';
        if (incoming.length === 0) {
          inList.innerHTML = '<span class="text-slate-500">Root or entry element</span>';
        } else {
          incoming.forEach(ed => {
            const srcEnt = rawData.entities.find(e => e.id === ed.src);
            const srcName = srcEnt ? (srcEnt.canonicalKey.split('#')[1] || srcEnt.canonicalKey) : ed.src;
            const item = document.createElement('div');
            item.className = 'p-2 rounded bg-slate-950 border border-slate-800 text-xs flex items-center justify-between';
            item.innerHTML = \`
              <span class="text-indigo-400 font-semibold">\${srcName} ➔ \${ed.kind}</span>
              <span class="text-[10px] text-slate-500">\${ed.provenance}</span>
            \`;
            inList.appendChild(item);
          });
        }

        document.getElementById('inspectEditorBtn').href = 'vscode://file/' + ent.filePath + ':' + (ent.startLine || 1);
      } else if (data.type === 'cluster') {
        const cl = data.raw;
        document.getElementById('inspectBadge').textContent = 'Feature';
        document.getElementById('inspectName').textContent = cl.name;
        document.getElementById('inspectLocation').textContent = cl.description;

        const outList = document.getElementById('inspectOutgoing');
        outList.innerHTML = '';
        cl.routes.forEach(r => {
          const item = document.createElement('div');
          item.className = 'p-2 rounded bg-slate-950 border border-slate-800 text-xs text-emerald-400';
          item.textContent = \`Route: \${r.urlPath} (\${r.kind})\`;
          outList.appendChild(item);
        });

        document.getElementById('inspectIncoming').innerHTML = '<span class="text-slate-500">High-level architectural domain</span>';
      }
    }

    function renderCardsView() {
      const grid = document.getElementById('clustersGrid');
      grid.innerHTML = '';

      rawData.clusters.forEach(c => {
        const card = document.createElement('div');
        card.className = 'glass rounded-xl p-5 border border-slate-800/80 card-hover cursor-pointer transition flex flex-col justify-between';
        card.innerHTML = \`
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase">\${c.id}</span>
              <span class="text-xs mono text-slate-400">\${c.routes.length} routes</span>
            </div>
            <h3 class="font-bold text-lg text-slate-100">\${c.name}</h3>
            <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">\${c.description}</p>
          </div>
          <div class="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span class="mono">\${c.filePaths.length} files</span>
            <span class="text-indigo-400 font-semibold flex items-center gap-1">View in Graph ➔</span>
          </div>
        \`;
        card.onclick = () => {
          switchToGraph();
          if (network) {
            network.focus('cluster_' + c.id, { scale: 1.2, animation: true });
          }
        };
        grid.appendChild(card);
      });
    }

    // Tab switching
    function switchToGraph() {
      document.getElementById('viewGraphContainer').classList.remove('hidden');
      document.getElementById('viewCardsContainer').classList.add('hidden');
      document.getElementById('tabGraphBtn').className = 'px-3 py-1.5 rounded-md bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5';
      document.getElementById('tabCardsBtn').className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5';
      if (network) network.fit();
    }

    function switchToCards() {
      document.getElementById('viewGraphContainer').classList.add('hidden');
      document.getElementById('viewCardsContainer').classList.remove('hidden');
      document.getElementById('tabCardsBtn').className = 'px-3 py-1.5 rounded-md bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5';
      document.getElementById('tabGraphBtn').className = 'px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5';
    }

    document.getElementById('tabGraphBtn').onclick = switchToGraph;
    document.getElementById('tabCardsBtn').onclick = switchToCards;
    document.getElementById('closeInspectorBtn').onclick = () => {
      document.getElementById('inspectorPanel').classList.add('hidden');
    };

    document.getElementById('searchInput').oninput = (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (!term || !network || !nodesDataSet) return;

      const matchedNode = nodesDataSet.get().find(n => n.label.toLowerCase().includes(term));
      if (matchedNode) {
        network.focus(matchedNode.id, { scale: 1.3, animation: true });
        inspectNode(matchedNode);
      }
    };

    init();
  </script>
</body>
</html>
`;
}
