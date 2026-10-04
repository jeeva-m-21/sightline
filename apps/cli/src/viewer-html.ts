export function getViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sightline — Codebase Comprehension Workbench</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --sl-canvas: #0B121C;
      --sl-surface: #121B28;
      --sl-raised: #192434;
      --sl-rule: #243247;
      --sl-rule-light: #2c3c54;
      --sl-ink: #E7EDF5;
      --sl-ink-muted: #9DADC2;
      --sl-ink-faint: #6E7F95;
      --sl-lens: #52B6C6;
      --sl-lens-tint: #123741;
      --sl-confirmed: #E7EDF5;
      --sl-live: #4CC38A;
      --sl-matched: #E3AE45;
      --sl-guessed: #B195E6;
      --sl-gap: #9DADC2;
      --sl-human: #E77AA6;
      --sl-affected: #F2806A;
      --sl-added: #4CC38A;
      --sl-removed: #F08379;
      --sl-past: #C9B27C;

      --sl-font-ui: "Schibsted Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --sl-font-narrative: "Newsreader", Georgia, serif;
      --sl-font-code: "JetBrains Mono", monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #243247; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #344765; }

    body {
      background-color: var(--sl-canvas);
      color: var(--sl-ink);
      font-family: var(--sl-font-ui);
      font-size: 13px;
      line-height: 20px;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    code, pre, .mono { font-family: var(--sl-font-code); font-size: 12px; line-height: 19px; }
    .serif, .narrative { font-family: var(--sl-font-narrative); font-size: 15px; line-height: 24px; }

    /* Chips */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 11px;
      line-height: 16px;
      font-family: var(--sl-font-ui);
      background: var(--sl-raised);
      border: 1px solid var(--sl-rule);
      color: var(--sl-ink);
      font-weight: 500;
    }
    .chip-confirmed { border-color: var(--sl-rule); color: var(--sl-ink); }
    .chip-matched { border-color: rgba(227, 174, 69, 0.4); color: var(--sl-matched); background: rgba(227, 174, 69, 0.1); }
    .chip-live { border-color: rgba(76, 195, 138, 0.4); color: var(--sl-live); background: rgba(76, 195, 138, 0.1); }
    .chip-lens { border-color: rgba(82, 182, 198, 0.4); color: var(--sl-lens); background: rgba(82, 182, 198, 0.12); }

    /* Buttons */
    .btn-lens {
      background-color: var(--sl-lens);
      color: var(--sl-canvas);
      font-weight: 600;
      border-radius: 6px;
      padding: 6px 12px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: filter 0.15s ease;
    }
    .btn-lens:hover { filter: brightness(1.12); }
    .btn-secondary {
      background-color: var(--sl-surface);
      border: 1px solid var(--sl-rule);
      color: var(--sl-ink);
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-secondary:hover { background-color: var(--sl-raised); border-color: var(--sl-rule-light); }

    /* Nav Tabs */
    .tab-btn {
      padding: 4px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      color: var(--sl-ink-muted);
      transition: all 0.15s ease;
    }
    .tab-btn.active {
      background: var(--sl-lens-tint);
      color: var(--sl-lens);
      border-color: rgba(82, 182, 198, 0.3);
      font-weight: 600;
    }
    .tab-btn:hover:not(.active) {
      color: var(--sl-ink);
      background: var(--sl-raised);
    }

    /* Tree Node item */
    .tree-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      font-family: var(--sl-font-code);
      font-size: 12px;
      color: var(--sl-ink-muted);
      transition: background 0.1s, color 0.1s;
    }
    .tree-row:hover {
      background: var(--sl-raised);
      color: var(--sl-ink);
    }
    .tree-row.active {
      background: var(--sl-lens-tint);
      color: var(--sl-lens);
      font-weight: 500;
    }

    /* Scrubber transit row */
    .scrubber-step {
      display: flex;
      gap: 14px;
      position: relative;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      border: 1px solid transparent;
    }
    .scrubber-step:hover {
      background: var(--sl-raised);
    }
    .scrubber-step.active {
      background: rgba(82, 182, 198, 0.08);
      border-color: rgba(82, 182, 198, 0.35);
    }
    .step-rail {
      position: absolute;
      left: 27px;
      top: 36px;
      bottom: -12px;
      width: 2px;
      background: var(--sl-rule);
    }
    .scrubber-step:last-child .step-rail {
      display: none;
    }

    /* Popover */
    .why-popover {
      position: fixed;
      width: 320px;
      background: var(--sl-surface);
      border: 1px solid var(--sl-rule-light);
      border-radius: 8px;
      padding: 14px;
      z-index: 1000;
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
    }
  </style>
</head>
<body>

  <!-- TOP HEADER (48px) -->
  <header style="height: 48px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; z-index: 10;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <!-- Logo Mark -->
      <div style="width: 26px; height: 26px; border-radius: 6px; background: var(--sl-lens-tint); border: 1px solid rgba(82, 182, 198, 0.4); display: flex; align-items: center; justify-content: center;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sl-lens)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 12h3M18 12h3M12 3v3M12 18v3"></path>
        </svg>
      </div>
      <span style="font-weight: 700; font-size: 14px; letter-spacing: -0.01em; color: var(--sl-ink);">Sightline</span>
      <span style="color: var(--sl-ink-faint);">/</span>
      <span id="headerRepoName" style="color: var(--sl-ink-muted); font-size: 13px; font-weight: 500;">nextjs-minimal</span>
      <span class="chip chip-lens" style="font-family: var(--sl-font-code); font-size: 11px;">Next.js App Router</span>
    </div>

    <!-- Center: Primary View Toggle -->
    <div style="display: flex; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 2px; gap: 2px;">
      <button id="viewBtnTour" class="tab-btn active" onclick="switchMainTab('tour')">Guided Tour</button>
      <button id="viewBtnFiles" class="tab-btn" onclick="switchMainTab('files')">Repository Tree</button>
      <button id="viewBtnMap" class="tab-btn" onclick="switchMainTab('map')">Product Map</button>
    </div>

    <!-- Right Controls: Command Bar, VS Code shortcut, Git branch -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <div id="commandBarTrigger" onclick="openCommandPalette()" style="background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 4px 10px; font-size: 12px; color: var(--sl-ink-muted); display: flex; align-items: center; gap: 10px; cursor: pointer;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Search symbols, files or routes...</span>
        <kbd style="font-family: var(--sl-font-code); font-size: 10px; color: var(--sl-ink-faint); border: 1px solid var(--sl-rule); padding: 1px 4px; border-radius: 3px;">⌘K</kbd>
      </div>

      <button id="btnOpenVsCode" class="btn-secondary" style="padding: 4px 8px;" title="Open in VS Code" onclick="openCurrentInVsCode()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>VS Code</span>
      </button>

      <div style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted); border: 1px solid var(--sl-rule); padding: 3px 8px; border-radius: 4px; background: var(--sl-raised); display: flex; align-items: center; gap: 5px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9a9 9 0 0 0 9 9"/></svg>
        <span>main</span>
      </div>
    </div>
  </header>

  <!-- 3-COLUMN WORKBENCH SHELL -->
  <div style="flex: 1; display: flex; overflow: hidden;">

    <!-- COLUMN 1: PROJECT NAVIGATOR & WALKTHROUGH (300px) -->
    <aside style="width: 300px; border-right: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;">
      
      <!-- Sub-tabs: Guide Index vs File Tree -->
      <div style="padding: 10px 12px; border-bottom: 1px solid var(--sl-rule); display: flex; align-items: center; justify-content: space-between; background: var(--sl-raised);">
        <span id="col1Title" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sl-ink-muted); font-family: var(--sl-font-code);">
          Architectural Guide
        </span>
        <span id="col1Meta" class="chip chip-confirmed" style="font-size: 10px;">4 Chapters</span>
      </div>

      <!-- Column 1 Content Area (Scrollable) -->
      <div id="col1Content" style="flex: 1; overflow-y: auto; padding: 10px;">
        <!-- Chapters list (default view) -->
        <div id="chaptersContainer" style="display: flex; flex-direction: column; gap: 6px;">
          <!-- Rendered via JS -->
        </div>

        <!-- Project File Tree list (hidden or toggled) -->
        <div id="fileTreeContainer" style="display: none; flex-direction: column; gap: 2px;">
          <!-- Rendered dynamically from projectTree -->
        </div>
      </div>

      <!-- Quick Repo Stats Footer in Column 1 -->
      <div style="padding: 8px 12px; border-top: 1px solid var(--sl-rule); background: var(--sl-surface); font-size: 11px; color: var(--sl-ink-faint); display: flex; justify-content: space-between; align-items: center;">
        <span id="col1StatsFiles">0 files</span>
        <span>•</span>
        <span id="col1StatsSymbols">0 symbols</span>
        <span>•</span>
        <span style="color: var(--sl-live);">● Live WAL</span>
      </div>
    </aside>

    <!-- COLUMN 2: CENTER WORKSPACE (FLEX-1) -->
    <main style="flex: 1; display: flex; flex-direction: column; background: var(--sl-canvas); overflow: hidden; position: relative;">
      
      <!-- Top Action Bar for Middle Column (40px) -->
      <div style="height: 40px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span style="color: var(--sl-ink-faint);">Location:</span>
          <span id="centerBreadcrumb" style="font-family: var(--sl-font-code); color: var(--sl-ink); font-weight: 500;">Chapter 02 · Checkout & Payment Flow</span>
          <span id="centerEvidenceBadge" class="chip chip-confirmed" style="margin-left: 6px;">● AST Verified</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <!-- View switcher between Scrubber and Source -->
          <div style="display: flex; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 4px; padding: 1px;">
            <button id="viewScrubberBtn" class="tab-btn active" style="font-size: 11px; padding: 2px 8px;" onclick="setCenterSubView('scrubber')">Dataflow Trace</button>
            <button id="viewSourceBtn" class="tab-btn" style="font-size: 11px; padding: 2px 8px;" onclick="setCenterSubView('source')">Code Street</button>
          </div>
        </div>
      </div>

      <!-- Center Viewport -->
      <div id="centerViewport" style="flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- CHAPTER / FLOW HEADER -->
        <div id="centerHeaderCard" style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 10px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span id="chapterNumberBadge" class="chip chip-lens" style="font-family: var(--sl-font-code);">CHAPTER 02</span>
            <span style="font-size: 12px; color: var(--sl-ink-muted);">Cross-Boundary Full-Stack Flow</span>
          </div>
          <h1 id="chapterTitle" style="font-size: 22px; font-weight: 700; color: var(--sl-ink); letter-spacing: -0.01em;">How Checkout Payment Works</h1>
          <p id="chapterNarrative" class="narrative" style="color: var(--sl-ink-muted); margin-top: 8px; max-width: 820px;">
            User triggers the checkout intent from the client billing view. The client initiates an asynchronous HTTP POST request to the Next.js Route Handler, which validates pricing tiers and dispatches a verified Stripe Checkout session.
          </p>
        </div>

        <!-- VIEW A: DATAFLOW SCRUBBER (Apple/Google Codewalk style) -->
        <div id="scrubberView" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 11px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between;">
            <span>Transit Execution Sequence (Deterministic Facts + Grounded Routes)</span>
            <span style="color: var(--sl-ink-muted);">Click any step to inspect & jump to code</span>
          </div>

          <div id="scrubberStepsList" style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 10px; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
            <!-- Rendered via JS -->
          </div>
        </div>

        <!-- VIEW B: CODE STREET (Live annotated code loaded from disk) -->
        <div id="sourceView" style="display: none; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 8px 8px 0 0; padding: 10px 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="sourceCurrentFile" style="font-family: var(--sl-font-code); font-size: 13px; color: var(--sl-lens); font-weight: 500;">app/billing/page.tsx</span>
              <span id="sourceDirectiveBadge" class="chip chip-matched">"use client"</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; color: var(--sl-ink-muted);">Ground Truth: Tree-sitter AST</span>
            </div>
          </div>

          <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-top: none; border-radius: 0 0 8px 8px; overflow: hidden; display: flex;">
            <!-- Line numbers gutter -->
            <div id="codeGutter" style="width: 48px; background: var(--sl-canvas); border-right: 1px solid var(--sl-rule); padding: 14px 8px; text-align: right; color: var(--sl-ink-faint); font-family: var(--sl-font-code); font-size: 12px; line-height: 20px; user-select: none;">
            </div>
            <!-- Code text -->
            <pre id="codePre" style="flex: 1; padding: 14px 16px; overflow-x: auto; color: var(--sl-ink); font-family: var(--sl-font-code); font-size: 12px; line-height: 20px; tab-size: 2; white-space: pre;"></pre>
          </div>
        </div>

        <!-- VIEW C: PRODUCT MAP (Regional clusters view) -->
        <div id="mapView" style="display: none; flex-direction: column; gap: 16px;">
          <div style="font-size: 11px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em;">
            Application Functional Regions & Capabilities (Capped &le; 12)
          </div>
          <div id="mapClustersGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            <!-- Dynamically populated -->
          </div>
        </div>

      </div>

      <!-- FOOTER STATUS BAR (36px) -->
      <footer style="height: 36px; border-top: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 11px; color: var(--sl-ink-muted); flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--sl-live);"></span>
            <span>Index Snapshot: <strong id="footerSnapshotHash" style="font-family: var(--sl-font-code); color: var(--sl-ink);">latest</strong></span>
          </span>
          <span style="color: var(--sl-ink-faint);">|</span>
          <span id="footerDbStatus">SQLite WAL @ .sightline/sightline.sqlite</span>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <span>Three-Layer Trust: <strong style="color: var(--sl-ink);">Facts</strong> &gt; <strong style="color: var(--sl-matched);">Structures</strong> &gt; <strong style="color: var(--sl-guessed);">Narrative</strong></span>
          <button onclick="triggerLivePoint()" class="chip chip-live" style="cursor: pointer; border: none; font-size: 11px; padding: 2px 8px;">
            Point at live app (P)
          </button>
        </div>
      </footer>
    </main>

    <!-- COLUMN 3: ARCHITECTURE & INVARIANT INSPECTOR (380px) -->
    <aside style="width: 380px; border-left: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;">
      
      <!-- Inspector Header -->
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--sl-rule); display: flex; align-items: center; justify-content: space-between; background: var(--sl-raised);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sl-lens)" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span style="font-weight: 600; font-size: 12px; color: var(--sl-ink);">Technical Specification</span>
        </div>
        <span id="inspectorKindBadge" class="chip chip-confirmed">Symbol</span>
      </div>

      <!-- Inspector Body (Scrollable) -->
      <div id="inspectorContent" style="flex: 1; overflow-y: auto; padding: 18px 16px; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Entity Identity Card -->
        <div>
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Inspected Subject</div>
          <h2 id="inspectorTitle" style="font-size: 17px; font-weight: 700; color: var(--sl-ink); word-break: break-all;">BillingPage</h2>
          <div id="inspectorFileLink" onclick="jumpToCurrentInspectorFile()" style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-lens); cursor: pointer; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            <span id="inspectorFilePath">app/billing/page.tsx:21</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </div>

        <!-- Design Intent / Architectural Rationale -->
        <div style="border-top: 1px solid var(--sl-rule); padding-top: 14px;">
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Design Intent & Invariants</div>
          <p id="inspectorIntent" class="narrative" style="color: var(--sl-ink); font-size: 14px; line-height: 22px;">
            Renders the plan selection interface and initiates server checkout sessions. Uses a client directive to manage loading states during payment tokenization.
          </p>
        </div>

        <!-- Evidence & Verification Breakdown -->
        <div style="border-top: 1px solid var(--sl-rule); padding-top: 14px;">
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Proof & Provenance</div>
          <div id="inspectorProofList" style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-raised); padding: 6px 8px; border-radius: 4px; border: 1px solid var(--sl-rule);">
              <span class="chip chip-confirmed">● Confirmed</span>
              <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted);">Tree-sitter AST</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-raised); padding: 6px 8px; border-radius: 4px; border: 1px solid var(--sl-rule);">
              <span class="chip chip-matched">◐ Matched</span>
              <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted);">/api/checkout Route</span>
            </div>
          </div>
        </div>

        <!-- Coupling & Dependencies -->
        <div style="border-top: 1px solid var(--sl-rule); padding-top: 14px;">
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Connections & Fan-Out</div>
          <div id="inspectorConnectionsList" style="display: flex; flex-direction: column; gap: 6px;">
            <!-- Populated via JS -->
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="margin-top: auto; border-top: 1px solid var(--sl-rule); padding-top: 14px; display: flex; flex-direction: column; gap: 8px;">
          <button onclick="openCurrentInVsCode()" class="btn-lens" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>Open in Editor</span>
          </button>
          <button onclick="explainWithAgent()" class="btn-secondary" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Ask Sightline Agent</span>
          </button>
        </div>

      </div>
    </aside>

  </div>

  <!-- EVIDENCE WHY? POPOVER -->
  <div id="whyPopover" class="why-popover" style="display: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 600; font-size: 12px; color: var(--sl-ink);">Evidence Provenance</span>
      <button onclick="closeWhy()" style="background: none; border: none; color: var(--sl-ink-muted); cursor: pointer; font-size: 14px;">✕</button>
    </div>
    <div id="whyPopoverBody" style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;"></div>
  </div>

  <script>
    // State
    let appData = { snapshot: null, clusters: [], entities: [], edges: [], projectTree: null, projectDir: '' };
    let currentChapter = 1; // 1: Architecture, 2: Checkout, 3: Auth, 4: Dashboard
    let currentStepIndex = 0;
    let selectedFilePath = 'app/billing/page.tsx';
    let fileCache = {};

    // Standard Guided Tour Chapters
    const chapters = [
      {
        id: 1,
        number: 'CHAPTER 01',
        title: 'System Architecture & Entrypoints',
        narrative: 'High-level structure of the application. Next.js App Router organizes the application into distinct route groups: marketing, authentication, workspace dashboard, and transactional billing.',
        targetFile: 'app/page.tsx',
        steps: [
          { name: 'Root Layout', file: 'app/layout.tsx', line: 1, rel: 'encapsulates', kind: 'layout', evidence: 'EXTRACTED', desc: 'Global HTML shell, fonts, and session provider wrappers.' },
          { name: 'Home Landing Page', file: 'app/page.tsx', line: 1, rel: 'renders', kind: 'page', evidence: 'EXTRACTED', desc: 'Renders the marketing landing page and calls to action.' },
          { name: 'Header Component', file: 'components/Header.tsx', line: 1, rel: 'imported by', kind: 'component', evidence: 'EXTRACTED', desc: 'Universal navigation bar with links to /login, /dashboard, and /billing.' }
        ]
      },
      {
        id: 2,
        number: 'CHAPTER 02',
        title: 'Checkout & Payment Transaction Flow',
        narrative: 'Step-by-step cross-boundary flow tracing customer checkout from button click through Next.js server route handlers to external Stripe payment sessions.',
        targetFile: 'app/billing/page.tsx',
        steps: [
          { name: 'Upgrade Button Click', file: 'app/billing/page.tsx', line: 21, rel: 'event trigger', kind: 'screen', evidence: 'EXTRACTED', desc: 'User clicks Upgrade Now button on the billing pricing matrix.' },
          { name: 'handleUpgrade()', file: 'app/billing/page.tsx', line: 6, rel: 'requests /api/checkout', kind: 'function', evidence: 'HEURISTIC', desc: 'Client async function dispatches HTTP POST with JSON body { plan: "pro" }.' },
          { name: 'POST /api/checkout', file: 'app/api/checkout/route.ts', line: 1, rel: 'handler', kind: 'route', evidence: 'EXTRACTED', desc: 'Next.js App Router API route handler parses request and authenticates caller.' },
          { name: 'Stripe Checkout API', file: 'external:stripe', line: 0, rel: 'boundary dispatch', kind: 'service', evidence: 'EXTRACTED', desc: 'External Stripe session created with success_url and cancel_url redirects.' }
        ]
      },
      {
        id: 3,
        number: 'CHAPTER 03',
        title: 'User Authentication & JWT Session Flow',
        narrative: 'Authentication lifecycle handling user credentials submission, validation against backend handlers, and signed token issuance.',
        targetFile: 'app/(auth)/login/page.tsx',
        steps: [
          { name: 'Sign In Form Submission', file: 'app/(auth)/login/page.tsx', line: 28, rel: 'event trigger', kind: 'screen', evidence: 'EXTRACTED', desc: 'User submits email and password credentials in auth form.' },
          { name: 'handleSubmit()', file: 'app/(auth)/login/page.tsx', line: 9, rel: 'requests /api/auth/login', kind: 'function', evidence: 'HEURISTIC', desc: 'Client fetch sends credentials payload to auth route.' },
          { name: 'POST /api/auth/login', file: 'app/api/auth/login/route.ts', line: 1, rel: 'handler', kind: 'route', evidence: 'EXTRACTED', desc: 'Server route validates credentials and hashes against database.' },
          { name: 'Session Token Dispatch', file: 'internal:crypto', line: 0, rel: 'boundary set-cookie', kind: 'service', evidence: 'EXTRACTED', desc: 'Sets httpOnly secure JWT cookie and redirects to /dashboard.' }
        ]
      },
      {
        id: 4,
        number: 'CHAPTER 04',
        title: 'Dashboard Workspace & Analytics Ingress',
        narrative: 'How the authenticated user workspace hydrates data from server metrics and modular card components.',
        targetFile: 'app/dashboard/page.tsx',
        steps: [
          { name: 'Dashboard Entry Page', file: 'app/dashboard/page.tsx', line: 1, rel: 'server component', kind: 'page', evidence: 'EXTRACTED', desc: 'Server Component fetches initial metrics before streaming layout.' },
          { name: 'Stats Card Component', file: 'components/Button.tsx', line: 1, rel: 'renders in JSX', kind: 'component', evidence: 'EXTRACTED', desc: 'Renders workspace statistics and quick action buttons.' }
        ]
      }
    ];

    // Initialize
    async function init() {
      try {
        const res = await fetch('/api/data');
        appData = await res.json();
        
        if (appData.snapshot) {
          document.getElementById('headerRepoName').textContent = appData.snapshot.repoId || 'repo';
          document.getElementById('footerSnapshotHash').textContent = appData.snapshot.id.slice(0, 8);
        }

        renderChaptersList();
        renderProjectTree();
        renderMapClusters();
        updateCol1Stats();
        
        // Select Chapter 2 by default
        selectChapter(2);
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }

    // Render Chapters in Left Column
    function renderChaptersList() {
      const container = document.getElementById('chaptersContainer');
      container.innerHTML = '';

      chapters.forEach(ch => {
        const card = document.createElement('div');
        const isActive = ch.id === currentChapter;
        card.style = \`padding: 10px 12px; border-radius: 8px; border: 1px solid \${isActive ? 'rgba(82, 182, 198, 0.4)' : 'var(--sl-rule)'}; background: \${isActive ? 'var(--sl-lens-tint)' : 'var(--sl-canvas)'}; cursor: pointer; transition: all 0.15s ease;\`;
        card.onclick = () => selectChapter(ch.id);

        card.innerHTML = \`
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: var(--sl-font-code); font-size: 10px; color: \${isActive ? 'var(--sl-lens)' : 'var(--sl-ink-faint)'}; font-weight: 600;">\${ch.number}</span>
            <span class="chip \${isActive ? 'chip-lens' : 'chip-confirmed'}" style="font-size: 10px;">\${ch.steps.length} steps</span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: \${isActive ? 'var(--sl-ink)' : 'var(--sl-ink-muted)'}; line-height: 16px;">
            \${ch.title}
          </div>
        \`;
        container.appendChild(card);
      });
    }

    // Render Recursive File Tree in Left Column
    function renderProjectTree() {
      const container = document.getElementById('fileTreeContainer');
      container.innerHTML = '';

      if (!appData.projectTree || !appData.projectTree.children) {
        container.innerHTML = '<div style="padding: 12px; color: var(--sl-ink-faint); font-size: 12px;">No file tree available</div>';
        return;
      }

      function buildDom(node, depth = 0) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';

        const row = document.createElement('div');
        row.className = 'tree-row' + (selectedFilePath === node.path ? ' active' : '');
        row.style.paddingLeft = (depth * 14 + 6) + 'px';

        const isDir = node.kind === 'directory';
        
        let icon = '';
        if (isDir) {
          icon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
        } else {
          icon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
        }

        let badge = '';
        if (node.fileType === 'page') badge = '<span class="chip chip-lens" style="font-size: 9px; padding: 0 4px; margin-left: auto;">page</span>';
        else if (node.fileType === 'route') badge = '<span class="chip chip-matched" style="font-size: 9px; padding: 0 4px; margin-left: auto;">route</span>';
        else if (node.isClientComponent) badge = '<span class="chip" style="font-size: 9px; padding: 0 4px; margin-left: auto; color: var(--sl-live);">client</span>';

        row.innerHTML = \`
          <span style="display: flex; align-items: center; gap: 6px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            \${icon}
            <span>\${node.name}</span>
          </span>
          \${badge}
        \`;

        let childrenWrap = null;
        if (isDir) {
          childrenWrap = document.createElement('div');
          childrenWrap.style.display = 'flex';
          childrenWrap.style.flexDirection = 'column';

          row.onclick = (e) => {
            e.stopPropagation();
            const isHidden = childrenWrap.style.display === 'none';
            childrenWrap.style.display = isHidden ? 'flex' : 'none';
          };
        } else {
          row.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            loadFileAndShow(node.path, 1);
          };
        }

        wrap.appendChild(row);

        if (isDir && node.children) {
          node.children.forEach(child => {
            childrenWrap.appendChild(buildDom(child, depth + 1));
          });
          wrap.appendChild(childrenWrap);
        }

        return wrap;
      }

      appData.projectTree.children.forEach(c => {
        container.appendChild(buildDom(c, 0));
      });
    }

    // Select Chapter
    function selectChapter(id) {
      currentChapter = id;
      currentStepIndex = 0;
      const ch = chapters.find(c => c.id === id) || chapters[0];

      renderChaptersList();

      document.getElementById('chapterNumberBadge').textContent = ch.number;
      document.getElementById('chapterTitle').textContent = ch.title;
      document.getElementById('chapterNarrative').textContent = ch.narrative;
      document.getElementById('centerBreadcrumb').textContent = \`\${ch.number} · \${ch.title}\`;

      renderScrubberSteps(ch);
      if (ch.steps.length > 0) {
        selectStep(ch.steps[0], 0);
      }
    }

    // Render Dataflow Scrubber
    function renderScrubberSteps(ch) {
      const container = document.getElementById('scrubberStepsList');
      container.innerHTML = '';

      ch.steps.forEach((s, idx) => {
        const stepRow = document.createElement('div');
        stepRow.className = 'scrubber-step' + (idx === currentStepIndex ? ' active' : '');
        stepRow.onclick = () => selectStep(s, idx);

        const isConfirmed = s.evidence === 'EXTRACTED';
        const badgeChip = isConfirmed ? 
          '<span class="chip chip-confirmed">● AST Confirmed</span>' : 
          '<span class="chip chip-matched">◐ URL Matched</span>';

        stepRow.innerHTML = \`
          <div class="step-rail"></div>
          <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--sl-surface); border: 2px solid \${idx === currentStepIndex ? 'var(--sl-lens)' : 'var(--sl-rule-light)'}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: \${idx === currentStepIndex ? 'var(--sl-lens)' : 'var(--sl-ink-muted)'}; z-index: 1;">
            \${idx + 1}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 13px; font-weight: 600; color: var(--sl-ink);">\${s.name}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span onclick="openWhy(event, '\${s.name}', '\${s.file}', '\${s.evidence}')">\${badgeChip}</span>
                <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-lens);">\${s.file}\${s.line ? ':' + s.line : ''}</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--sl-ink-muted); line-height: 18px;">
              \${s.desc}
            </div>
          </div>
        \`;

        container.appendChild(stepRow);
      });
    }

    // Step selection
    function selectStep(step, idx) {
      currentStepIndex = idx;
      document.querySelectorAll('.scrubber-step').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });

      // Update Right Inspector
      updateInspectorForStep(step);

      // Pre-load file for code view
      if (step.file && !step.file.startsWith('external:') && !step.file.startsWith('internal:')) {
        loadFileAndShow(step.file, step.line, false);
      }
    }

    // Load file and show in Code Street
    async function loadFileAndShow(filePath, highlightLine = 1, switchView = true) {
      selectedFilePath = filePath;
      document.getElementById('sourceCurrentFile').textContent = filePath;
      document.getElementById('sourceDirectiveBadge').style.display = filePath.includes('billing') || filePath.includes('login') ? 'inline-flex' : 'none';

      let content = fileCache[filePath];
      if (!content) {
        try {
          const res = await fetch(\`/api/file?path=\${encodeURIComponent(filePath)}\`);
          const data = await res.json();
          content = data.content || '// Empty file';
          fileCache[filePath] = content;
        } catch {
          content = '// Could not read file from disk';
        }
      }

      renderCodeWithHighlights(content, highlightLine);

      if (switchView) {
        setCenterSubView('source');
      }

      // Also update inspector for the file
      updateInspectorForFile(filePath, highlightLine);
    }

    function renderCodeWithHighlights(content, highlightLine) {
      const lines = content.split('\\n');
      const gutter = document.getElementById('codeGutter');
      const pre = document.getElementById('codePre');

      gutter.innerHTML = '';
      pre.innerHTML = '';

      lines.forEach((line, i) => {
        const lineNum = i + 1;
        const isTarget = lineNum === highlightLine;

        const numDiv = document.createElement('div');
        numDiv.textContent = lineNum;
        if (isTarget) {
          numDiv.style.color = 'var(--sl-lens)';
          numDiv.style.fontWeight = '700';
        }
        gutter.appendChild(numDiv);

        const codeDiv = document.createElement('div');
        codeDiv.textContent = line || ' ';
        codeDiv.style.height = '20px';
        if (isTarget) {
          codeDiv.style.background = 'rgba(82, 182, 198, 0.15)';
          codeDiv.style.borderLeft = '3px solid var(--sl-lens)';
          codeDiv.style.paddingLeft = '6px';
          codeDiv.style.fontWeight = '500';
        }
        pre.appendChild(codeDiv);
      });
    }

    // Update Right Inspector for Scrubber Step
    function updateInspectorForStep(step) {
      document.getElementById('inspectorKindBadge').textContent = step.kind.toUpperCase();
      document.getElementById('inspectorTitle').textContent = step.name;
      document.getElementById('inspectorFilePath').textContent = \`\${step.file}\${step.line ? ':' + step.line : ''}\`;
      document.getElementById('inspectorIntent').textContent = step.desc;

      const proofList = document.getElementById('inspectorProofList');
      proofList.innerHTML = '';

      const isAst = step.evidence === 'EXTRACTED';
      proofList.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-raised); padding: 6px 8px; border-radius: 4px; border: 1px solid var(--sl-rule);">
          <span class="chip \${isAst ? 'chip-confirmed' : 'chip-matched'}">\${isAst ? '● Confirmed AST' : '◐ URL Matched'}</span>
          <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted);">\${step.rel}</span>
        </div>
      \`;

      const connList = document.getElementById('inspectorConnectionsList');
      connList.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 4px; font-size: 11px; font-family: var(--sl-font-code);">
          <span style="color: var(--sl-ink);">Target File</span>
          <span style="color: var(--sl-lens);">\${step.file}</span>
        </div>
      \`;
    }

    // Update Right Inspector for clicked file
    function updateInspectorForFile(filePath, line) {
      document.getElementById('inspectorKindBadge').textContent = 'FILE';
      document.getElementById('inspectorTitle').textContent = filePath.split('/').pop();
      document.getElementById('inspectorFilePath').textContent = \`\${filePath}:\${line}\`;
      document.getElementById('inspectorIntent').textContent = \`Repository source file. Analyzed by Tree-sitter AST parser.\`;
      
      const connList = document.getElementById('inspectorConnectionsList');
      connList.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 4px; font-size: 11px; font-family: var(--sl-font-code);">
          <span style="color: var(--sl-ink);">Repository Path</span>
          <span style="color: var(--sl-lens);">\${filePath}</span>
        </div>
      \`;
    }

    // Render Product Map Feature Clusters
    function renderMapClusters() {
      const grid = document.getElementById('mapClustersGrid');
      grid.innerHTML = '';

      if (!appData.clusters || appData.clusters.length === 0) {
        grid.innerHTML = '<div style="color: var(--sl-ink-muted); font-size: 12px;">No clusters indexed yet.</div>';
        return;
      }

      appData.clusters.forEach(c => {
        const card = document.createElement('div');
        card.style = 'background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: border-color 0.15s;';
        card.onmouseover = () => card.style.borderColor = 'var(--sl-lens)';
        card.onmouseout = () => card.style.borderColor = 'var(--sl-rule)';

        const routesHtml = c.routes.map(r => \`
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: var(--sl-font-code); padding: 3px 0;">
            <span style="color: var(--sl-ink);">\${r.urlPath}</span>
            <span class="chip" style="font-size: 9px;">\${r.kind}</span>
          </div>
        \`).join('');

        card.innerHTML = \`
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 14px; font-weight: 600; color: var(--sl-ink);">\${c.name}</h3>
            <span class="chip chip-confirmed">● \${c.routes.length} routes</span>
          </div>
          <p style="font-size: 12px; color: var(--sl-ink-muted); line-height: 18px;">\${c.description}</p>
          <div style="border-top: 1px solid var(--sl-rule); padding-top: 8px;">
            \${routesHtml}
          </div>
        \`;

        grid.appendChild(card);
      });
    }

    function updateCol1Stats() {
      const symCount = appData.entities ? appData.entities.length : 0;
      let fileCount = 0;
      function countFiles(node) {
        if (!node) return;
        if (node.kind === 'file') fileCount++;
        if (node.children) node.children.forEach(countFiles);
      }
      if (appData.projectTree) countFiles(appData.projectTree);

      document.getElementById('col1StatsFiles').textContent = \`\${fileCount} files\`;
      document.getElementById('col1StatsSymbols').textContent = \`\${symCount} symbols\`;
    }

    // Switch main tabs: Tour vs Files vs Map
    function switchMainTab(tab) {
      document.getElementById('viewBtnTour').classList.toggle('active', tab === 'tour');
      document.getElementById('viewBtnFiles').classList.toggle('active', tab === 'files');
      document.getElementById('viewBtnMap').classList.toggle('active', tab === 'map');

      const col1Title = document.getElementById('col1Title');
      const col1Meta = document.getElementById('col1Meta');
      const chaptersContainer = document.getElementById('chaptersContainer');
      const fileTreeContainer = document.getElementById('fileTreeContainer');

      if (tab === 'tour') {
        col1Title.textContent = 'Architectural Guide';
        col1Meta.textContent = '4 Chapters';
        chaptersContainer.style.display = 'flex';
        fileTreeContainer.style.display = 'none';
        setCenterSubView('scrubber');
      } else if (tab === 'files') {
        col1Title.textContent = 'Repository Files';
        col1Meta.textContent = 'Source Tree';
        chaptersContainer.style.display = 'none';
        fileTreeContainer.style.display = 'flex';
        setCenterSubView('source');
      } else if (tab === 'map') {
        col1Title.textContent = 'Feature Clusters';
        col1Meta.textContent = \`\${appData.clusters.length} Regions\`;
        chaptersContainer.style.display = 'flex';
        fileTreeContainer.style.display = 'none';
        setCenterSubView('map');
      }
    }

    // Switch center view between Scrubber, Source, and Map
    function setCenterSubView(view) {
      document.getElementById('scrubberView').style.display = view === 'scrubber' ? 'flex' : 'none';
      document.getElementById('sourceView').style.display = view === 'source' ? 'flex' : 'none';
      document.getElementById('mapView').style.display = view === 'map' ? 'flex' : 'none';

      document.getElementById('viewScrubberBtn').classList.toggle('active', view === 'scrubber');
      document.getElementById('viewSourceBtn').classList.toggle('active', view === 'source');
    }

    // Open in VS Code
    function openCurrentInVsCode() {
      const absPath = appData.projectDir ? \`\${appData.projectDir}/\${selectedFilePath}\` : selectedFilePath;
      const vsCodeUrl = \`vscode://file/\${absPath}:1\`;
      window.open(vsCodeUrl, '_self');
    }

    function jumpToCurrentInspectorFile() {
      loadFileAndShow(selectedFilePath, 1);
    }

    // Why Popover
    function openWhy(event, name, file, evidence) {
      event.stopPropagation();
      const popover = document.getElementById('whyPopover');
      const body = document.getElementById('whyPopoverBody');

      body.innerHTML = \`
        <div>
          <span style="font-size: 10px; color: var(--sl-ink-faint); font-family: var(--sl-font-code); text-transform: uppercase;">Observed Target</span>
          <div style="font-weight: 600; color: var(--sl-ink); margin-top: 2px;">\${name}</div>
        </div>
        <div>
          <span style="font-size: 10px; color: var(--sl-ink-faint); font-family: var(--sl-font-code); text-transform: uppercase;">Proof Tier</span>
          <div style="margin-top: 2px;">
            <span class="chip \${evidence === 'EXTRACTED' ? 'chip-confirmed' : 'chip-matched'}">
              \${evidence === 'EXTRACTED' ? '● Deterministic Syntax (Tree-sitter)' : '◐ Structural Heuristic (URL Pattern)'}
            </span>
          </div>
        </div>
        <div>
          <span style="font-size: 10px; color: var(--sl-ink-faint); font-family: var(--sl-font-code); text-transform: uppercase;">Source Origin</span>
          <div style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-lens); margin-top: 2px;">\${file}</div>
        </div>
      \`;

      popover.style.display = 'block';
      popover.style.top = Math.min(event.clientY + 10, window.innerHeight - 200) + 'px';
      popover.style.left = Math.min(event.clientX - 100, window.innerWidth - 340) + 'px';
    }

    function closeWhy() {
      document.getElementById('whyPopover').style.display = 'none';
    }

    function triggerLivePoint() {
      alert('Sightline Point Mode: Hover and click any UI component in your running dev preview to reveal its source file and dataflow route.');
    }

    function explainWithAgent() {
      alert(\`Sightline Agent Grounding: Every assertion cites entity IDs with provenance guarantees. Asking model to summarize invariants for \${selectedFilePath}...\`);
    }

    function openCommandPalette() {
      const q = prompt('Sightline Command Palette — Search route, symbol, or file:');
      if (q) {
        const query = q.toLowerCase();
        if (query.includes('bill') || query.includes('check') || query.includes('pay')) {
          selectChapter(2);
        } else if (query.includes('auth') || query.includes('login') || query.includes('sign')) {
          selectChapter(3);
        } else if (query.includes('dash') || query.includes('metric')) {
          selectChapter(4);
        } else {
          switchMainTab('files');
        }
      }
    }

    // Global Keybindings
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'p' || e.key === 'P') {
        triggerLivePoint();
      }
      if (e.key === 'Escape') {
        closeWhy();
      }
    });

    window.addEventListener('click', () => closeWhy());

    // Boot
    init();
  </script>
</body>
</html>
`;
}
