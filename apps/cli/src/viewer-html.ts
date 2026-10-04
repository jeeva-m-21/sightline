export function getViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sightline — Codebase Comprehension Workbench</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --sl-canvas: #080C14;
      --sl-surface: #0E1522;
      --sl-surface-card: #131B2B;
      --sl-raised: #182337;
      --sl-raised-hover: #1E2D45;
      --sl-rule: #1E293B;
      --sl-rule-light: #2B3A52;
      --sl-rule-active: #3E5375;
      
      --sl-ink: #F1F5F9;
      --sl-ink-secondary: #CBD5E1;
      --sl-ink-muted: #94A3B8;
      --sl-ink-faint: #64748B;
      
      --sl-lens: #38BDF8;
      --sl-lens-glow: rgba(56, 189, 248, 0.18);
      --sl-lens-tint: rgba(56, 189, 248, 0.08);
      --sl-lens-border: rgba(56, 189, 248, 0.32);
      
      --sl-confirmed: #F1F5F9;
      --sl-live: #10B981;
      --sl-live-glow: rgba(16, 185, 129, 0.2);
      --sl-matched: #F59E0B;
      --sl-guessed: #A855F7;
      --sl-affected: #F43F5E;

      --sl-font-ui: "Schibsted Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --sl-font-narrative: "Newsreader", Georgia, serif;
      --sl-font-code: "JetBrains Mono", ui-monospace, Menlo, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #222F44; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #334563; }

    body {
      background-color: var(--sl-canvas);
      background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--sl-ink);
      font-family: var(--sl-font-ui);
      font-size: 13px;
      line-height: 20px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    code, pre, .mono { font-family: var(--sl-font-code); font-size: 12px; line-height: 19px; }
    .serif, .narrative { font-family: var(--sl-font-narrative); font-size: 15px; line-height: 24px; }
    .tabular { font-variant-numeric: tabular-nums; }

    /* Evidence Chips & Badges */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 1.5px 7px;
      border-radius: 4px;
      font-size: 11px;
      line-height: 15px;
      font-family: var(--sl-font-ui);
      background: var(--sl-raised);
      border: 1px solid var(--sl-rule);
      color: var(--sl-ink-secondary);
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .chip-confirmed {
      border-color: rgba(241, 245, 249, 0.25);
      color: var(--sl-ink);
      background: rgba(241, 245, 249, 0.05);
    }
    .chip-matched {
      border-color: rgba(245, 158, 11, 0.35);
      color: var(--sl-matched);
      background: rgba(245, 158, 11, 0.09);
    }
    .chip-live {
      border-color: rgba(16, 185, 129, 0.35);
      color: var(--sl-live);
      background: rgba(16, 185, 129, 0.09);
    }
    .chip-lens {
      border-color: var(--sl-lens-border);
      color: var(--sl-lens);
      background: var(--sl-lens-tint);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 5px 11px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: var(--sl-font-ui);
      outline: none;
      user-select: none;
    }
    .btn-lens {
      background: var(--sl-lens);
      color: #04101A;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .btn-lens:hover {
      filter: brightness(1.1);
      box-shadow: 0 0 12px var(--sl-lens-glow);
    }
    .btn-secondary {
      background: var(--sl-surface-card);
      border: 1px solid var(--sl-rule-light);
      color: var(--sl-ink-secondary);
    }
    .btn-secondary:hover {
      background: var(--sl-raised);
      border-color: var(--sl-rule-active);
      color: var(--sl-ink);
    }

    /* Segmented Control */
    .segmented-control {
      display: inline-flex;
      background: rgba(8, 12, 20, 0.75);
      border: 1px solid var(--sl-rule);
      border-radius: 6px;
      padding: 2px;
      gap: 2px;
    }
    .segmented-btn {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: transparent;
      color: var(--sl-ink-muted);
      transition: all 0.15s ease;
      font-family: var(--sl-font-ui);
    }
    .segmented-btn.active {
      background: var(--sl-surface-card);
      color: var(--sl-ink);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), inset 0 0 0 1px var(--sl-rule-light);
    }
    .segmented-btn:hover:not(.active) {
      color: var(--sl-ink-secondary);
    }

    /* Tree Node item */
    .tree-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
      user-select: none;
      font-family: var(--sl-font-code);
      font-size: 11.5px;
      color: var(--sl-ink-muted);
      transition: all 0.12s ease;
      border: 1px solid transparent;
    }
    .tree-row:hover {
      background: var(--sl-raised);
      color: var(--sl-ink);
    }
    .tree-row.active {
      background: var(--sl-lens-tint);
      border-color: var(--sl-lens-border);
      color: var(--sl-lens);
      font-weight: 500;
    }

    /* Scrubber transit row */
    .scrubber-step {
      display: flex;
      gap: 14px;
      position: relative;
      padding: 14px 18px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      background: var(--sl-surface-card);
      border: 1px solid var(--sl-rule);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .scrubber-step:hover {
      background: var(--sl-raised);
      border-color: var(--sl-rule-light);
      transform: translateY(-1px);
    }
    .scrubber-step.active {
      background: linear-gradient(180deg, var(--sl-raised) 0%, var(--sl-surface-card) 100%);
      border-color: var(--sl-lens-border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--sl-lens-border);
    }
    .step-rail {
      position: absolute;
      left: 31px;
      top: 42px;
      bottom: -16px;
      width: 2px;
      background: var(--sl-rule-light);
      z-index: 1;
    }
    .scrubber-step:last-child .step-rail {
      display: none;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(4, 7, 13, 0.78);
      backdrop-filter: blur(8px);
      z-index: 999;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 120px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
    }
    .modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Popover */
    .why-popover {
      position: fixed;
      width: 330px;
      background: var(--sl-surface-card);
      border: 1px solid var(--sl-rule-active);
      border-radius: 8px;
      padding: 14px 16px;
      z-index: 1000;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 48px;
      right: 24px;
      background: var(--sl-surface-card);
      border: 1px solid var(--sl-rule-active);
      color: var(--sl-ink);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>

  <!-- TOP HEADER (48px) -->
  <header style="height: 48px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; z-index: 20;">
    <!-- Left: macOS Window Dots, Logo & Breadcrumb Navigation -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <!-- Subtle Window Controls -->
      <div style="display: flex; align-items: center; gap: 6px; margin-right: 4px;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #EF4444; opacity: 0.85;"></span>
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; opacity: 0.85;"></span>
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; opacity: 0.85;"></span>
      </div>
      <div style="height: 16px; width: 1px; background: var(--sl-rule); margin: 0 2px;"></div>

      <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="switchMainTab('tour')">
        <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--sl-lens-tint); border: 1px solid var(--sl-lens-border); display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sl-lens)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M3 12h3M18 12h3M12 3v3M12 18v3"></path>
          </svg>
        </div>
        <span style="font-weight: 700; font-size: 13.5px; letter-spacing: -0.015em; color: var(--sl-ink);">Sightline</span>
      </div>

      <span style="color: var(--sl-ink-faint); font-size: 12px;">/</span>
      <span id="headerRepoName" style="color: var(--sl-ink-secondary); font-size: 12.5px; font-weight: 500;">nextjs-minimal</span>
      <span class="chip chip-lens" style="font-family: var(--sl-font-code); font-size: 10.5px;">Next.js App Router</span>
    </div>

    <!-- Center: Primary Mode Segmented Control -->
    <div class="segmented-control">
      <button id="viewBtnTour" class="segmented-btn active" onclick="switchMainTab('tour')">
        <span>Guided Walkthrough</span>
      </button>
      <button id="viewBtnFiles" class="segmented-btn" onclick="switchMainTab('files')">
        <span>Repository Files</span>
      </button>
      <button id="viewBtnMap" class="segmented-btn" onclick="switchMainTab('map')">
        <span>Product Map</span>
      </button>
    </div>

    <!-- Right Controls: Command Bar, VS Code shortcut, Git branch -->
    <div style="display: flex; align-items: center; gap: 8px;">
      <div id="commandBarTrigger" onclick="openCommandPalette()" style="background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 4px 10px; font-size: 12px; color: var(--sl-ink-muted); display: flex; align-items: center; gap: 10px; cursor: pointer; transition: border-color 0.15s;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Search symbols, routes...</span>
        <kbd style="font-family: var(--sl-font-code); font-size: 10px; color: var(--sl-ink-faint); border: 1px solid var(--sl-rule-light); background: var(--sl-surface); padding: 1px 4px; border-radius: 3px;">⌘K</kbd>
      </div>

      <button id="btnOpenVsCode" class="btn btn-secondary" style="padding: 4px 9px;" title="Open in VS Code" onclick="openCurrentInVsCode()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>VS Code</span>
      </button>

      <div style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted); border: 1px solid var(--sl-rule); padding: 3px 8px; border-radius: 5px; background: var(--sl-surface-card); display: flex; align-items: center; gap: 5px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9a9 9 0 0 0 9 9"/></svg>
        <span>main</span>
      </div>
    </div>
  </header>

  <!-- 3-COLUMN WORKBENCH CONTAINER -->
  <div style="flex: 1; display: flex; overflow: hidden;">

    <!-- COLUMN 1: PROJECT NAVIGATOR & WALKTHROUGH (290px) -->
    <aside style="width: 290px; border-right: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;">
      
      <!-- Sub-header: Title & Quick Counter -->
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--sl-rule); display: flex; align-items: center; justify-content: space-between; background: rgba(8, 12, 20, 0.4);">
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sl-ink-muted)" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span id="col1Title" style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sl-ink-muted); font-family: var(--sl-font-code);">
            Architectural Guide
          </span>
        </div>
        <span id="col1Meta" class="chip chip-confirmed" style="font-size: 10px; font-family: var(--sl-font-code);">4 Chapters</span>
      </div>

      <!-- Filter Input (when viewing file tree) -->
      <div id="treeFilterContainer" style="padding: 6px 10px; border-bottom: 1px solid var(--sl-rule); display: none; background: var(--sl-surface);">
        <input id="treeFilterInput" type="text" placeholder="Filter files..." oninput="filterTree(this.value)" style="width: 100%; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 4px; padding: 4px 8px; color: var(--sl-ink); font-family: var(--sl-font-code); font-size: 11px; outline: none;">
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

      <!-- Sidebar Status Footer -->
      <div style="padding: 8px 12px; border-top: 1px solid var(--sl-rule); background: rgba(8, 12, 20, 0.5); font-size: 11px; color: var(--sl-ink-faint); display: flex; justify-content: space-between; align-items: center; font-family: var(--sl-font-code);">
        <span id="col1StatsFiles">0 files</span>
        <span>•</span>
        <span id="col1StatsSymbols">0 symbols</span>
        <span>•</span>
        <span style="color: var(--sl-live);">WAL active</span>
      </div>
    </aside>

    <!-- COLUMN 2: CENTER STAGE WORKSPACE (FLEX-1) -->
    <main style="flex: 1; display: flex; flex-direction: column; background: var(--sl-canvas); overflow: hidden; position: relative;">
      
      <!-- Top Stage Breadcrumb & Secondary View Switcher (40px) -->
      <div style="height: 40px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span style="color: var(--sl-ink-faint);">Active Focus:</span>
          <span id="centerBreadcrumb" style="font-family: var(--sl-font-code); color: var(--sl-ink); font-weight: 500;">Chapter 02 · Checkout & Payment Flow</span>
          <button onclick="copyBreadcrumb()" title="Copy Path" style="background: none; border: none; color: var(--sl-ink-faint); cursor: pointer; display: flex; align-items: center; padding: 2px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="segmented-control">
            <button id="viewScrubberBtn" class="segmented-btn active" onclick="setCenterSubView('scrubber')">Dataflow Trace</button>
            <button id="viewSourceBtn" class="segmented-btn" onclick="setCenterSubView('source')">Code Street</button>
          </div>
        </div>
      </div>

      <!-- Center Viewport -->
      <div id="centerViewport" style="flex: 1; overflow-y: auto; padding: 24px 32px; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- CHAPTER / INTRO HEADER CARD -->
        <div id="centerHeaderCard" style="background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 12px; padding: 20px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 240px; background: radial-gradient(circle at right, rgba(56, 189, 248, 0.05), transparent 70%); pointer-events: none;"></div>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span id="chapterNumberBadge" class="chip chip-lens" style="font-family: var(--sl-font-code); font-weight: 600;">CHAPTER 02</span>
            <span style="font-size: 11.5px; color: var(--sl-ink-muted);">Cross-Boundary Full-Stack Dataflow</span>
          </div>
          <h1 id="chapterTitle" style="font-size: 21px; font-weight: 700; color: var(--sl-ink); letter-spacing: -0.015em;">How Checkout Payment Works</h1>
          <p id="chapterNarrative" class="narrative" style="color: var(--sl-ink-secondary); margin-top: 8px; max-width: 860px; font-style: normal;">
            User triggers the checkout intent from the client billing view. The client initiates an asynchronous HTTP POST request to the Next.js Route Handler, which validates pricing tiers and dispatches a verified Stripe Checkout session.
          </p>
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--sl-ink-faint);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span>Written by AI · Grounded in deterministic Tree-sitter AST facts</span>
          </div>
        </div>

        <!-- VIEW A: DATAFLOW TRANSIT SCRUBBER -->
        <div id="scrubberView" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 11px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; align-items: center;">
            <span>Step-by-Step Dataflow Circuit</span>
            <span style="color: var(--sl-ink-muted);">Click any node to inspect & jump to code</span>
          </div>

          <div id="scrubberStepsList" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered via JS -->
          </div>
        </div>

        <!-- VIEW B: CODE STREET (Live AST annotated code) -->
        <div id="sourceView" style="display: none; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 8px 8px 0 0; padding: 10px 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="sourceCurrentFile" style="font-family: var(--sl-font-code); font-size: 12.5px; color: var(--sl-lens); font-weight: 500;">app/billing/page.tsx</span>
              <span id="sourceDirectiveBadge" class="chip chip-matched">"use client"</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="chip chip-confirmed" style="font-size: 10.5px;">● Deterministic AST</span>
              <button onclick="openCurrentInVsCode()" class="btn btn-secondary" style="padding: 2px 8px; font-size: 11px;">
                Open in Editor
              </button>
            </div>
          </div>

          <!-- Code View Area -->
          <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-top: none; border-radius: 0 0 8px 8px; overflow: hidden; display: flex;">
            <!-- Line numbers gutter -->
            <div id="codeGutter" style="width: 48px; background: rgba(8, 12, 20, 0.6); border-right: 1px solid var(--sl-rule); padding: 14px 8px; text-align: right; color: var(--sl-ink-faint); font-family: var(--sl-font-code); font-size: 12px; line-height: 22px; user-select: none;">
            </div>
            <!-- Code text -->
            <pre id="codePre" style="flex: 1; padding: 14px 16px; overflow-x: auto; color: var(--sl-ink); font-family: var(--sl-font-code); font-size: 12px; line-height: 22px; tab-size: 2; white-space: pre; user-select: text;"></pre>
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
      <footer style="height: 36px; border-top: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 11px; color: var(--sl-ink-muted); flex-shrink: 0; z-index: 10;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--sl-live); box-shadow: 0 0 6px var(--sl-live-glow);"></span>
            <span>Snapshot: <strong id="footerSnapshotHash" style="font-family: var(--sl-font-code); color: var(--sl-ink);">latest</strong></span>
          </span>
          <span style="color: var(--sl-rule-light);">|</span>
          <span id="footerDbStatus" style="font-family: var(--sl-font-code);">SQLite WAL @ .sightline/sightline.sqlite</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <span>Trust Hierarchy: <strong style="color: var(--sl-ink);">Facts (1)</strong> &gt; <strong style="color: var(--sl-matched);">Structure (2)</strong> &gt; <strong style="color: var(--sl-guessed);">Narrative (3)</strong></span>
          <button onclick="triggerLivePoint()" class="chip chip-live" style="cursor: pointer; border: none; font-size: 11px; padding: 2px 8px;">
            Point at live app (P)
          </button>
        </div>
      </footer>
    </main>

    <!-- COLUMN 3: ARCHITECTURE & INVARIANT INSPECTOR (370px) -->
    <aside style="width: 370px; border-left: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;">
      
      <!-- Inspector Header -->
      <div style="padding: 11px 16px; border-bottom: 1px solid var(--sl-rule); display: flex; align-items: center; justify-content: space-between; background: rgba(8, 12, 20, 0.4);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sl-lens)" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span style="font-weight: 600; font-size: 12px; color: var(--sl-ink);">Architecture Inspector</span>
        </div>
        <span id="inspectorKindBadge" class="chip chip-confirmed">SYMBOL</span>
      </div>

      <!-- Inspector Body (Scrollable) -->
      <div id="inspectorContent" style="flex: 1; overflow-y: auto; padding: 18px 16px; display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Entity Identity Card -->
        <div style="background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 8px; padding: 14px;">
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Inspected Subject</div>
          <h2 id="inspectorTitle" style="font-size: 16px; font-weight: 700; color: var(--sl-ink); word-break: break-all;">BillingPage</h2>
          <div id="inspectorFileLink" onclick="jumpToCurrentInspectorFile()" style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-lens); cursor: pointer; margin-top: 6px; display: flex; align-items: center; gap: 4px;">
            <span id="inspectorFilePath">app/billing/page.tsx:21</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </div>

        <!-- Design Intent / Architectural Rationale -->
        <div>
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Design Intent & Rationale</div>
          <div style="background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 8px; padding: 12px 14px;">
            <p id="inspectorIntent" class="narrative" style="color: var(--sl-ink-secondary); font-size: 14px; line-height: 22px;">
              Renders the plan selection interface and initiates server checkout sessions. Uses a client directive to manage loading states during payment tokenization.
            </p>
          </div>
        </div>

        <!-- Invariants & Contracts Checklist -->
        <div>
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Invariants & Guarantees</div>
          <div id="inspectorInvariantsList" style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 7px 10px;">
              <span style="color: var(--sl-live);">✓</span>
              <span style="color: var(--sl-ink);">Client-side boundary isolated</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 7px 10px;">
              <span style="color: var(--sl-live);">✓</span>
              <span style="color: var(--sl-ink);">HTTPS POST with JSON payload</span>
            </div>
          </div>
        </div>

        <!-- Evidence & Verification Breakdown -->
        <div>
          <div style="font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-ink-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Proof & Provenance</div>
          <div id="inspectorProofList" style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-surface-card); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--sl-rule);">
              <span class="chip chip-confirmed">● Confirmed AST</span>
              <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted);">Tree-sitter TSX</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="margin-top: auto; border-top: 1px solid var(--sl-rule); padding-top: 14px; display: flex; flex-direction: column; gap: 8px;">
          <button onclick="openCurrentInVsCode()" class="btn btn-lens" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>Open in Local IDE</span>
          </button>
          <button onclick="explainWithAgent()" class="btn btn-secondary" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Explain Invariants (Agent)</span>
          </button>
        </div>

      </div>
    </aside>

  </div>

  <!-- SPOTLIGHT COMMAND PALETTE MODAL (⌘K) -->
  <div id="commandModal" class="modal-backdrop" onclick="closeCommandPalette(event)">
    <div style="width: 540px; background: var(--sl-surface-card); border: 1px solid var(--sl-rule-active); border-radius: 12px; box-shadow: 0 24px 60px rgba(0,0,0,0.8); overflow: hidden; display: flex; flex-direction: column;" onclick="event.stopPropagation()">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--sl-rule); display: flex; align-items: center; gap: 10px; background: rgba(8, 12, 20, 0.4);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sl-ink-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="commandInput" type="text" placeholder="Search flows, symbols, routes, or files..." oninput="handleCommandSearch(this.value)" style="flex: 1; background: transparent; border: none; outline: none; color: var(--sl-ink); font-family: var(--sl-font-ui); font-size: 13.5px;">
        <kbd style="font-family: var(--sl-font-code); font-size: 10px; color: var(--sl-ink-faint); border: 1px solid var(--sl-rule-light); padding: 1px 5px; border-radius: 3px;">ESC</kbd>
      </div>
      
      <!-- Results list -->
      <div id="commandResults" style="max-height: 320px; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
        <!-- Dynamically injected -->
      </div>
    </div>
  </div>

  <!-- EVIDENCE WHY? POPOVER -->
  <div id="whyPopover" class="why-popover" style="display: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 600; font-size: 12px; color: var(--sl-ink);">Evidence Provenance</span>
      <button onclick="closeWhy()" style="background: none; border: none; color: var(--sl-ink-muted); cursor: pointer; font-size: 14px;">✕</button>
    </div>
    <div id="whyPopoverBody" style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;"></div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toastNotification" class="toast">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sl-live)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <span id="toastMessage">Path copied to clipboard</span>
  </div>

  <script>
    // State
    let appData = { snapshot: null, clusters: [], entities: [], edges: [], projectTree: null, projectDir: '' };
    let currentChapter = 2; // Default to Checkout
    let currentStepIndex = 0;
    let selectedFilePath = 'app/billing/page.tsx';
    let fileCache = {};

    // Standard Guided Tour Chapters (defaults, updated dynamically from indexed flows)
    let chapters = [
      {
        id: 1,
        number: 'CHAPTER 01',
        title: 'System Architecture & Entrypoints',
        narrative: 'High-level application topology. Next.js App Router organizes the repository into distinct route domains: marketing ingress, user authentication, customer workspace, and checkout billing.',
        targetFile: 'app/page.tsx',
        steps: [
          { name: 'Root Layout', file: 'app/layout.tsx', line: 1, rel: 'encapsulates', kind: 'layout', evidence: 'EXTRACTED', desc: 'Global HTML shell, fonts, and session provider wrappers.', invariants: ['Renders on Server', 'Hydrates global CSS'] },
          { name: 'Home Landing Page', file: 'app/page.tsx', line: 1, rel: 'renders', kind: 'page', evidence: 'EXTRACTED', desc: 'Renders the marketing landing page and product calls to action.', invariants: ['Static Server Component', 'Zero client JS bundle cost'] },
          { name: 'Header Navigation', file: 'components/Header.tsx', line: 1, rel: 'imported by page', kind: 'component', evidence: 'EXTRACTED', desc: 'Universal navigation bar with links to /login, /dashboard, and /billing.', invariants: ['Shared across all layouts', 'Link prefetching active'] }
        ]
      },
      {
        id: 2,
        number: 'CHAPTER 02',
        title: 'Checkout & Payment Transaction Flow',
        narrative: 'Step-by-step cross-boundary flow tracing customer checkout from button click through Next.js server route handlers to external Stripe payment sessions.',
        targetFile: 'app/billing/page.tsx',
        steps: [
          { name: 'Upgrade Button Click', file: 'app/billing/page.tsx', line: 21, rel: 'event trigger', kind: 'screen', evidence: 'EXTRACTED', desc: 'User clicks Upgrade Now button on the billing pricing matrix.', invariants: ['Client-side React handler', 'Debounced against rapid taps'] },
          { name: 'handleUpgrade()', file: 'app/billing/page.tsx', line: 6, rel: 'requests /api/checkout', kind: 'function', evidence: 'HEURISTIC', desc: 'Client async function dispatches HTTP POST with JSON body { plan: "pro" }.', invariants: ['CSRF protected', 'Disables button during fetch'] },
          { name: 'POST /api/checkout', file: 'app/api/checkout/route.ts', line: 1, rel: 'route handler', kind: 'route', evidence: 'EXTRACTED', desc: 'Next.js App Router API route handler parses request and authenticates caller.', invariants: ['Server-only environment', 'Validates session credentials'] },
          { name: 'Stripe Checkout API', file: 'external:stripe', line: 0, rel: 'boundary dispatch', kind: 'service', evidence: 'EXTRACTED', desc: 'External Stripe session created with success_url and cancel_url redirects.', invariants: ['Idempotency key guaranteed', 'Webhook reconciliation enabled'] }
        ]
      },
      {
        id: 3,
        number: 'CHAPTER 03',
        title: 'User Authentication & JWT Session Flow',
        narrative: 'Authentication lifecycle handling user credentials submission, validation against backend handlers, and signed token issuance.',
        targetFile: 'app/(auth)/login/page.tsx',
        steps: [
          { name: 'Sign In Form Submission', file: 'app/(auth)/login/page.tsx', line: 28, rel: 'event trigger', kind: 'screen', evidence: 'EXTRACTED', desc: 'User submits email and password credentials in auth form.', invariants: ['Client form validation', 'Sanitizes input'] },
          { name: 'handleSubmit()', file: 'app/(auth)/login/page.tsx', line: 9, rel: 'requests /api/auth/login', kind: 'function', evidence: 'HEURISTIC', desc: 'Client fetch sends credentials payload to auth route.', invariants: ['Payload over HTTPS', 'Error state feedback'] },
          { name: 'POST /api/auth/login', file: 'app/api/auth/login/route.ts', line: 1, rel: 'route handler', kind: 'route', evidence: 'EXTRACTED', desc: 'Server route validates credentials and hashes against database.', invariants: ['Timing-safe password compare', 'Rate limit enforced'] },
          { name: 'Session Token Dispatch', file: 'internal:crypto', line: 0, rel: 'boundary set-cookie', kind: 'service', evidence: 'EXTRACTED', desc: 'Sets httpOnly secure JWT cookie and redirects to /dashboard.', invariants: ['HttpOnly + Secure flags', 'Signed with HS256'] }
        ]
      },
      {
        id: 4,
        number: 'CHAPTER 04',
        title: 'Dashboard Workspace & Analytics Ingress',
        narrative: 'How the authenticated user workspace hydrates data from server metrics and modular card components.',
        targetFile: 'app/dashboard/page.tsx',
        steps: [
          { name: 'Dashboard Entry Page', file: 'app/dashboard/page.tsx', line: 1, rel: 'server component', kind: 'page', evidence: 'EXTRACTED', desc: 'Server Component fetches initial metrics before streaming layout.', invariants: ['Server Component stream', 'Zero waterfall latency'] },
          { name: 'Stats Card Component', file: 'components/Button.tsx', line: 1, rel: 'renders in JSX', kind: 'component', evidence: 'EXTRACTED', desc: 'Renders workspace statistics and quick action buttons.', invariants: ['Pure presentational component', 'Memoized'] }
        ]
      }
    ];

    // High-craft Syntax Highlighter for TSX / JS
    function highlightCode(code) {
      // Escape HTML
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return escaped.split('\\n').map(line => {
        // Directives
        if (line.includes('&quot;use client&quot;') || line.includes('&quot;use server&quot;') || line.includes('"use client"') || line.includes('"use server"')) {
          return \`<span style="color: #34D399; font-weight: 600;">\${line}</span>\`;
        }

        // Comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          return \`<span style="color: #64748B; font-style: italic;">\${line}</span>\`;
        }

        // Keywords & syntax highlighting
        let highlighted = line
          .replace(/\\b(import|export|default|function|const|let|var|return|async|await|from|if|else|try|catch)\\b/g, '<span style="color: #93C5FD; font-weight: 500;">$1</span>')
          .replace(/\\b(React|useState|useEffect|useRouter|Response)\\b/g, '<span style="color: #F472B6;">$1</span>')
          .replace(/\\b(fetch|json|stringify)\\b/g, '<span style="color: #38BDF8;">$1</span>')
          .replace(/(&lt;[A-Z][a-zA-Z0-9]+|&lt;\\/[A-Z][a-zA-Z0-9]+&gt;)/g, '<span style="color: #60A5FA; font-weight: 500;">$1</span>')
          .replace(/(&quot;[^&]*&quot;|'[^']*'|\`[^\`]*\`)/g, '<span style="color: #FDE047;">$1</span>');

        return highlighted;
      });
    }

    // Initialize
    async function init() {
      try {
        const res = await fetch('/api/data');
        appData = await res.json();
        
        if (appData.snapshot) {
          document.getElementById('headerRepoName').textContent = appData.snapshot.repoId || 'repo';
          document.getElementById('footerSnapshotHash').textContent = appData.snapshot.id.slice(0, 8);
        }

        if (appData.flows && appData.flows.length > 0) {
          chapters = appData.flows.map((f, i) => ({
            id: i + 1,
            number: \`CHAPTER 0\${i + 1}\`,
            title: f.name,
            narrative: f.description,
            targetFile: f.entryPoint?.filePath || f.steps[0]?.filePath,
            steps: f.steps.map(s => ({
              name: s.name,
              file: s.filePath,
              line: s.line || 1,
              rel: s.rel,
              kind: s.kind,
              evidence: s.provenance,
              desc: s.description,
              invariants: s.invariants || ['Verified by AST syntax']
            }))
          }));
        }

        renderChaptersList();
        renderProjectTree();
        renderMapClusters();
        updateCol1Stats();
        
        // Default to Chapter 1 or 2
        selectChapter(chapters.length > 1 ? 2 : 1);
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
        card.style = \`padding: 10px 12px; border-radius: 8px; border: 1px solid \${isActive ? 'var(--sl-lens-border)' : 'var(--sl-rule)'}; background: \${isActive ? 'var(--sl-lens-tint)' : 'var(--sl-surface-card)'}; cursor: pointer; transition: all 0.15s ease;\`;
        card.onclick = () => selectChapter(ch.id);

        card.innerHTML = \`
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: var(--sl-font-code); font-size: 10px; color: \${isActive ? 'var(--sl-lens)' : 'var(--sl-ink-faint)'}; font-weight: 600;">\${ch.number}</span>
            <span class="chip \${isActive ? 'chip-lens' : 'chip-confirmed'}" style="font-size: 10px;">\${ch.steps.length} steps</span>
          </div>
          <div style="font-size: 12.5px; font-weight: 600; color: \${isActive ? 'var(--sl-ink)' : 'var(--sl-ink-secondary)'}; line-height: 17px;">
            \${ch.title}
          </div>
        \`;
        container.appendChild(card);
      });
    }

    // Render Project File Tree in Left Column
    function renderProjectTree(filterText = '') {
      const container = document.getElementById('fileTreeContainer');
      container.innerHTML = '';

      if (!appData.projectTree || !appData.projectTree.children) {
        container.innerHTML = '<div style="padding: 12px; color: var(--sl-ink-faint); font-size: 12px;">No file tree available</div>';
        return;
      }

      function buildDom(node, depth = 0) {
        if (filterText && !node.name.toLowerCase().includes(filterText.toLowerCase()) && node.kind === 'file') {
          return null;
        }

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
          let hasVisibleChild = false;
          node.children.forEach(child => {
            const childDom = buildDom(child, depth + 1);
            if (childDom) {
              childrenWrap.appendChild(childDom);
              hasVisibleChild = true;
            }
          });
          if (filterText && !hasVisibleChild) return null;
          wrap.appendChild(childrenWrap);
        }

        return wrap;
      }

      appData.projectTree.children.forEach(c => {
        const dom = buildDom(c, 0);
        if (dom) container.appendChild(dom);
      });
    }

    function filterTree(val) {
      renderProjectTree(val);
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

    // Render Dataflow Transit Scrubber
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
          <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--sl-surface); border: 2px solid \${idx === currentStepIndex ? 'var(--sl-lens)' : 'var(--sl-rule-light)'}; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 700; color: \${idx === currentStepIndex ? 'var(--sl-lens)' : 'var(--sl-ink-muted)'}; z-index: 2; box-shadow: \${idx === currentStepIndex ? '0 0 10px var(--sl-lens-glow)' : 'none'};">
            \${idx + 1}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 13.5px; font-weight: 600; color: var(--sl-ink);">\${s.name}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span onclick="openWhy(event, '\${s.name}', '\${s.file}', '\${s.evidence}')">\${badgeChip}</span>
                <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-lens); cursor: pointer;" onclick="event.stopPropagation(); loadFileAndShow('\${s.file}', \${s.line || 1});">\${s.file}\${s.line ? ':' + s.line : ''}</span>
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
      if (filePath.startsWith('external:') || filePath.startsWith('internal:')) return;

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
      const gutter = document.getElementById('codeGutter');
      const pre = document.getElementById('codePre');

      gutter.innerHTML = '';
      pre.innerHTML = '';

      const highlightedLines = highlightCode(content);

      highlightedLines.forEach((lineHtml, i) => {
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
        codeDiv.innerHTML = lineHtml || '&nbsp;';
        codeDiv.style.height = '22px';
        codeDiv.style.lineHeight = '22px';
        if (isTarget) {
          codeDiv.style.background = 'rgba(56, 189, 248, 0.12)';
          codeDiv.style.borderLeft = '3px solid var(--sl-lens)';
          codeDiv.style.paddingLeft = '8px';
          codeDiv.style.marginLeft = '-8px';
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

      const invariantsList = document.getElementById('inspectorInvariantsList');
      invariantsList.innerHTML = '';
      const invs = step.invariants || ['Deterministic execution', 'Type checked by tsc'];
      invs.forEach(inv => {
        const row = document.createElement('div');
        row.style = 'display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 7px 10px;';
        row.innerHTML = \`<span style="color: var(--sl-live);">✓</span><span style="color: var(--sl-ink);">\${inv}</span>\`;
        invariantsList.appendChild(row);
      });

      const proofList = document.getElementById('inspectorProofList');
      proofList.innerHTML = '';
      const isAst = step.evidence === 'EXTRACTED';
      proofList.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sl-surface-card); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--sl-rule);">
          <span class="chip \${isAst ? 'chip-confirmed' : 'chip-matched'}">\${isAst ? '● Confirmed AST' : '◐ URL Matched'}</span>
          <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-muted);">\${step.rel}</span>
        </div>
      \`;
    }

    // Update Right Inspector for clicked file
    function updateInspectorForFile(filePath, line) {
      document.getElementById('inspectorKindBadge').textContent = 'FILE';
      document.getElementById('inspectorTitle').textContent = filePath.split('/').pop();
      document.getElementById('inspectorFilePath').textContent = \`\${filePath}:\${line}\`;
      document.getElementById('inspectorIntent').textContent = \`Repository source file. Analyzed by Tree-sitter TypeScript AST parser.\`;
      
      const invariantsList = document.getElementById('inspectorInvariantsList');
      invariantsList.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 7px 10px;">
          <span style="color: var(--sl-live);">✓</span>
          <span style="color: var(--sl-ink);">Indexed in SQLite WAL</span>
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
        card.style = 'background: var(--sl-surface-card); border: 1px solid var(--sl-rule); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.2);';
        card.onmouseover = () => { card.style.borderColor = 'var(--sl-lens)'; card.style.transform = 'translateY(-2px)'; };
        card.onmouseout = () => { card.style.borderColor = 'var(--sl-rule)'; card.style.transform = 'translateY(0)'; };

        const routesHtml = c.routes.map(r => \`
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: var(--sl-font-code); padding: 4px 0;">
            <span style="color: var(--sl-ink);">\${r.urlPath}</span>
            <span class="chip" style="font-size: 9.5px;">\${r.kind}</span>
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
      const treeFilter = document.getElementById('treeFilterContainer');
      const chaptersContainer = document.getElementById('chaptersContainer');
      const fileTreeContainer = document.getElementById('fileTreeContainer');

      if (tab === 'tour') {
        col1Title.textContent = 'Architectural Guide';
        col1Meta.textContent = '4 Chapters';
        treeFilter.style.display = 'none';
        chaptersContainer.style.display = 'flex';
        fileTreeContainer.style.display = 'none';
        setCenterSubView('scrubber');
      } else if (tab === 'files') {
        col1Title.textContent = 'Repository Files';
        col1Meta.textContent = 'Source Tree';
        treeFilter.style.display = 'block';
        chaptersContainer.style.display = 'none';
        fileTreeContainer.style.display = 'flex';
        setCenterSubView('source');
      } else if (tab === 'map') {
        col1Title.textContent = 'Feature Clusters';
        col1Meta.textContent = \`\${appData.clusters.length} Regions\`;
        treeFilter.style.display = 'none';
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
      showToast('Opening ' + selectedFilePath.split('/').pop() + ' in VS Code...');
    }

    function jumpToCurrentInspectorFile() {
      loadFileAndShow(selectedFilePath, 1);
    }

    function copyBreadcrumb() {
      const text = document.getElementById('centerBreadcrumb').textContent;
      navigator.clipboard.writeText(text);
      showToast('Path copied to clipboard');
    }

    function showToast(msg) {
      const toast = document.getElementById('toastNotification');
      document.getElementById('toastMessage').textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
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
      popover.style.left = Math.min(event.clientX - 100, window.innerWidth - 350) + 'px';
    }

    function closeWhy() {
      document.getElementById('whyPopover').style.display = 'none';
    }

    function triggerLivePoint() {
      showToast('Point Mode active: Click any element in your live app preview');
    }

    function explainWithAgent() {
      showToast('Asking Sightline Grounded Agent to verify invariants...');
    }

    // Spotlight Command Palette
    function openCommandPalette() {
      const modal = document.getElementById('commandModal');
      const input = document.getElementById('commandInput');
      modal.classList.add('open');
      input.value = '';
      input.focus();
      handleCommandSearch('');
    }

    function closeCommandPalette(e) {
      document.getElementById('commandModal').classList.remove('open');
    }

    function handleCommandSearch(query) {
      const resultsContainer = document.getElementById('commandResults');
      resultsContainer.innerHTML = '';

      const q = query.toLowerCase().trim();

      const items = [
        { title: 'Chapter 02: Checkout & Payment Flow', type: 'Flow', action: () => { selectChapter(2); closeCommandPalette(); } },
        { title: 'Chapter 03: Authentication & JWT Session', type: 'Flow', action: () => { selectChapter(3); closeCommandPalette(); } },
        { title: 'Chapter 04: Dashboard & Metrics Ingress', type: 'Flow', action: () => { selectChapter(4); closeCommandPalette(); } },
        { title: 'app/billing/page.tsx', type: 'File', action: () => { loadFileAndShow('app/billing/page.tsx', 1); closeCommandPalette(); } },
        { title: 'app/api/checkout/route.ts', type: 'Route', action: () => { loadFileAndShow('app/api/checkout/route.ts', 1); closeCommandPalette(); } },
        { title: 'app/(auth)/login/page.tsx', type: 'File', action: () => { loadFileAndShow('app/(auth)/login/page.tsx', 1); closeCommandPalette(); } },
        { title: 'app/dashboard/page.tsx', type: 'File', action: () => { loadFileAndShow('app/dashboard/page.tsx', 1); closeCommandPalette(); } }
      ];

      const filtered = q ? items.filter(it => it.title.toLowerCase().includes(q) || it.type.toLowerCase().includes(q)) : items;

      if (filtered.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 12px; color: var(--sl-ink-faint); font-size: 12px; text-align: center;">No matching symbols or flows found</div>';
        return;
      }

      filtered.forEach((it, idx) => {
        const row = document.createElement('div');
        row.style = 'display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.12s;';
        row.onmouseover = () => row.style.background = 'var(--sl-raised)';
        row.onmouseout = () => row.style.background = 'transparent';
        row.onclick = it.action;

        row.innerHTML = \`
          <span style="font-size: 12.5px; color: var(--sl-ink); font-weight: 500;">\${it.title}</span>
          <span class="chip" style="font-size: 10px;">\${it.type}</span>
        \`;
        resultsContainer.appendChild(row);
      });
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
        closeCommandPalette();
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
