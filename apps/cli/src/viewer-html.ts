export function getViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sightline — Product Map</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre, .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .card-hover:hover { transform: translateY(-2px); border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.2); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
  <!-- Top Navigation -->
  <header class="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
        S
      </div>
      <div>
        <h1 class="font-bold text-lg leading-tight flex items-center gap-2">
          Sightline <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">v0.1.0</span>
        </h1>
        <p class="text-xs text-slate-400">Comprehension layer for AI-built software</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <input id="searchInput" type="text" placeholder="Search routes, symbols, files..." 
          class="bg-slate-900/90 border border-slate-700 text-sm rounded-lg px-4 py-1.5 pl-9 w-72 focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 mono" />
        <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div id="statsBadge" class="hidden sm:flex items-center gap-2 text-xs mono text-slate-400 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900/50">
        <span id="clusterCount" class="text-indigo-400 font-semibold">0</span> features
        <span class="text-slate-600">•</span>
        <span id="routeCount" class="text-slate-300 font-semibold">0</span> routes
        <span class="text-slate-600">•</span>
        <span id="symbolCount" class="text-slate-300 font-semibold">0</span> symbols
      </div>
    </div>
  </header>

  <!-- Main Content Layout -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Center Canvas Area -->
    <main class="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      <!-- Breadcrumb navigation for Semantic Zoom -->
      <nav id="breadcrumbNav" class="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <button id="zoomRootBtn" class="hover:text-indigo-400 font-medium text-slate-200">Product Map</button>
        <span id="breadcrumbSeparator" class="hidden text-slate-600">/</span>
        <span id="breadcrumbCurrent" class="hidden text-indigo-400 font-medium"></span>
      </nav>

      <!-- View 1: Product Level (Feature Clusters Grid, <= 12 cards) -->
      <div id="productLevelView">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-100">Product Feature Clusters</h2>
            <p class="text-sm text-slate-400 mt-1">High-level capability map synthesized from Next.js routes, server actions, and UI boundaries.</p>
          </div>
          <div class="text-xs px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300 mono">
            Semantic Zoom: Level 1 (Product)
          </div>
        </div>

        <div id="clustersGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Dynamic Cluster Cards injected here -->
        </div>
      </div>

      <!-- View 2: Feature Level (Drilldown into routes and components) -->
      <div id="featureLevelView" class="hidden">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 id="currentFeatureTitle" class="text-2xl font-bold text-slate-100"></h2>
            <p id="currentFeatureDesc" class="text-sm text-slate-400 mt-1"></p>
          </div>
          <button id="backToProductBtn" class="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 transition">
            ← Back to Product Map
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Routes in this Feature -->
          <div class="glass rounded-xl p-5 border border-slate-800">
            <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Entry Routes & Endpoints
            </h3>
            <div id="featureRoutesList" class="flex flex-col gap-2.5"></div>
          </div>

          <!-- Symbols & Components in this Feature -->
          <div class="glass rounded-xl p-5 border border-slate-800">
            <h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span> Associated Components & Logic
            </h3>
            <div id="featureSymbolsList" class="flex flex-col gap-2.5"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- Side Inspector Panel (Level 3 - Evidence & Provenance) -->
    <aside id="inspectorPanel" class="w-96 border-l border-slate-800 bg-slate-900/90 flex flex-col hidden transition-all duration-200">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-semibold text-sm flex items-center gap-2">
          <span>Inspection</span>
          <span id="inspectorKindBadge" class="text-[10px] px-2 py-0.5 rounded mono uppercase bg-slate-800 text-slate-300"></span>
        </h3>
        <button id="closeInspectorBtn" class="text-slate-400 hover:text-slate-200">✕</button>
      </div>

      <div class="p-5 overflow-y-auto flex-1 flex flex-col gap-5 text-sm">
        <div>
          <label class="text-xs text-slate-500 uppercase font-mono tracking-wider">Symbol Identifier</label>
          <div id="inspectorName" class="font-bold text-base text-slate-100 mono mt-1 break-all"></div>
        </div>

        <div>
          <label class="text-xs text-slate-500 uppercase font-mono tracking-wider">Source Location</label>
          <div id="inspectorFile" class="text-xs text-indigo-300 mono mt-1 bg-slate-950 p-2.5 rounded border border-slate-800 break-all"></div>
        </div>

        <div>
          <label class="text-xs text-slate-500 uppercase font-mono tracking-wider">Trust & Provenance</label>
          <div id="inspectorProvenance" class="mt-1 flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> EXTRACTED (Deterministic AST)
            </span>
          </div>
        </div>

        <div id="inspectorCallsSection">
          <label class="text-xs text-slate-500 uppercase font-mono tracking-wider">Downstream Invocations</label>
          <div id="inspectorCallsList" class="mt-2 flex flex-col gap-1.5 text-xs mono"></div>
        </div>

        <div id="inspectorRenderSection">
          <label class="text-xs text-slate-500 uppercase font-mono tracking-wider">Rendered Components</label>
          <div id="inspectorRenderList" class="mt-2 flex flex-wrap gap-1.5 text-xs mono"></div>
        </div>

        <div class="mt-auto pt-4 border-t border-slate-800">
          <a id="vscodeLink" href="#" class="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium text-center flex items-center justify-center gap-2 transition">
            <span>Open in Editor</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    </aside>
  </div>

  <script>
    let appData = { clusters: [], entities: [], edges: [], snapshot: null };
    let selectedCluster = null;

    async function loadData() {
      try {
        const res = await fetch('/api/data');
        appData = await res.json();
        renderStats();
        renderClusters(appData.clusters);
      } catch (err) {
        console.error('Failed to load Sightline data:', err);
      }
    }

    function renderStats() {
      document.getElementById('clusterCount').textContent = appData.clusters.length;
      const totalRoutes = appData.clusters.reduce((acc, c) => acc + c.routes.length, 0);
      document.getElementById('routeCount').textContent = totalRoutes;
      document.getElementById('symbolCount').textContent = appData.entities.length;
    }

    function renderClusters(clusters) {
      const grid = document.getElementById('clustersGrid');
      grid.innerHTML = '';

      if (clusters.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-500">No feature clusters detected yet. Run index to populate.</div>';
        return;
      }

      clusters.forEach(c => {
        const card = document.createElement('div');
        card.className = 'glass rounded-xl p-5 border border-slate-800/80 card-hover cursor-pointer transition flex flex-col justify-between';
        card.onclick = () => selectCluster(c);

        card.innerHTML = \`
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">\${c.id}</span>
              <span class="text-xs mono text-slate-400">\${c.routes.length} routes</span>
            </div>
            <h3 class="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition">\${c.name}</h3>
            <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">\${c.description}</p>
          </div>
          <div class="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span class="mono">\${c.filePaths.length} files</span>
            <span class="text-indigo-400 font-medium flex items-center gap-1">Explore Feature →</span>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    function selectCluster(cluster) {
      selectedCluster = cluster;
      document.getElementById('productLevelView').classList.add('hidden');
      document.getElementById('featureLevelView').classList.remove('hidden');

      document.getElementById('breadcrumbSeparator').classList.remove('hidden');
      const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
      breadcrumbCurrent.classList.remove('hidden');
      breadcrumbCurrent.textContent = cluster.name;

      document.getElementById('currentFeatureTitle').textContent = cluster.name;
      document.getElementById('currentFeatureDesc').textContent = cluster.description;

      // Render routes
      const routesList = document.getElementById('featureRoutesList');
      routesList.innerHTML = '';
      cluster.routes.forEach(r => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between';
        item.onclick = () => inspectRoute(r);
        item.innerHTML = \`
          <div class="flex items-center gap-2.5">
            <span class="text-[10px] mono px-2 py-0.5 rounded font-semibold uppercase \${r.kind === 'api_route' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">\${r.kind}</span>
            <span class="mono text-xs font-semibold text-slate-200">\${r.urlPath}</span>
          </div>
          <span class="text-[11px] mono text-slate-500">\${r.filePath}</span>
        \`;
        routesList.appendChild(item);
      });

      // Render symbols in files of this feature
      const symbolsList = document.getElementById('featureSymbolsList');
      symbolsList.innerHTML = '';
      const featureEntities = appData.entities.filter(e => cluster.filePaths.includes(e.filePath));
      
      if (featureEntities.length === 0) {
        symbolsList.innerHTML = '<div class="text-xs text-slate-500 py-4">No top-level component symbols mapped directly to this feature.</div>';
      } else {
        featureEntities.forEach(e => {
          const item = document.createElement('div');
          item.className = 'p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between';
          item.onclick = () => inspectEntity(e);
          item.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-[10px] mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">\${e.kind}</span>
              <span class="mono text-xs font-medium text-slate-200">\${e.canonicalKey.split('#')[1] || e.canonicalKey}</span>
            </div>
            <span class="text-[11px] mono text-slate-500">L\${e.startLine || 1}-\${e.endLine || 1}</span>
          \`;
          symbolsList.appendChild(item);
        });
      }
    }

    function resetToProduct() {
      selectedCluster = null;
      document.getElementById('productLevelView').classList.remove('hidden');
      document.getElementById('featureLevelView').classList.add('hidden');
      document.getElementById('breadcrumbSeparator').classList.add('hidden');
      document.getElementById('breadcrumbCurrent').classList.add('hidden');
    }

    function inspectRoute(route) {
      const panel = document.getElementById('inspectorPanel');
      panel.classList.remove('hidden');

      document.getElementById('inspectorKindBadge').textContent = route.kind;
      document.getElementById('inspectorName').textContent = route.urlPath;
      document.getElementById('inspectorFile').textContent = route.filePath;

      document.getElementById('inspectorCallsSection').classList.add('hidden');
      document.getElementById('inspectorRenderSection').classList.add('hidden');

      const vscode = document.getElementById('vscodeLink');
      vscode.href = 'vscode://file/' + window.location.origin + '/' + route.filePath;
    }

    function inspectEntity(entity) {
      const panel = document.getElementById('inspectorPanel');
      panel.classList.remove('hidden');

      document.getElementById('inspectorKindBadge').textContent = entity.kind;
      const name = entity.canonicalKey.split('#')[1] || entity.canonicalKey;
      document.getElementById('inspectorName').textContent = name;
      document.getElementById('inspectorFile').textContent = \`\${entity.filePath}#L\${entity.startLine || 1}\`;

      document.getElementById('inspectorCallsSection').classList.remove('hidden');
      const callsList = document.getElementById('inspectorCallsList');
      callsList.innerHTML = '<span class="text-slate-500">Standard React lifecycle</span>';

      document.getElementById('inspectorRenderSection').classList.remove('hidden');
      const renderList = document.getElementById('inspectorRenderList');
      renderList.innerHTML = '<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">JSX Element</span>';

      const vscode = document.getElementById('vscodeLink');
      vscode.href = 'vscode://file/' + entity.filePath + ':' + (entity.startLine || 1);
    }

    // Events
    document.getElementById('zoomRootBtn').onclick = resetToProduct;
    document.getElementById('backToProductBtn').onclick = resetToProduct;
    document.getElementById('closeInspectorBtn').onclick = () => {
      document.getElementById('inspectorPanel').classList.add('hidden');
    };

    document.getElementById('searchInput').oninput = (e) => {
      const term = e.target.value.toLowerCase();
      if (!term) {
        renderClusters(appData.clusters);
        return;
      }
      const filtered = appData.clusters.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.routes.some(r => r.urlPath.toLowerCase().includes(term))
      );
      renderClusters(filtered);
    };

    loadData();
  </script>
</body>
</html>
`;
}
