export function getViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sightline</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --sl-canvas: #0B121C;
      --sl-surface: #121B28;
      --sl-raised: #192434;
      --sl-rule: #243247;
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
    body {
      background-color: var(--sl-canvas);
      color: var(--sl-ink);
      font-family: var(--sl-font-ui);
      font-size: 14px;
      line-height: 21px;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    code, pre, .mono { font-family: var(--sl-font-code); font-size: 13px; line-height: 20px; }
    .serif, .narrative { font-family: var(--sl-font-narrative); font-size: 16px; line-height: 26px; }

    /* Buttons */
    .btn-lens {
      background-color: var(--sl-lens);
      color: var(--sl-canvas);
      font-weight: 600;
      border-radius: 6px;
      padding: 6px 14px;
      border: none;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-lens:hover { filter: brightness(1.1); }
    .btn-secondary {
      background-color: var(--sl-surface);
      border: 1px solid var(--sl-rule);
      color: var(--sl-ink);
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-secondary:hover { background-color: var(--sl-raised); }

    /* Evidence Lines */
    .line-confirmed { stroke: var(--sl-confirmed); stroke-width: 1.5; }
    .line-matched { stroke: var(--sl-matched); stroke-width: 1.5; stroke-dasharray: 6 4; }
    .line-guessed { stroke: var(--sl-guessed); stroke-width: 2; stroke-dasharray: 1 4; stroke-linecap: round; }
    .line-live { stroke: var(--sl-live); stroke-width: 1.5; }

    /* Chips */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 12px;
      line-height: 16px;
      font-family: var(--sl-font-ui);
      background: var(--sl-raised);
      border: 1px solid var(--sl-rule);
      color: var(--sl-ink);
    }
    .chip-confirmed { border-color: var(--sl-rule); color: var(--sl-ink); }
    .chip-matched { border-color: rgba(227, 174, 69, 0.4); color: var(--sl-matched); background: rgba(227, 174, 69, 0.1); }
    .chip-live { border-color: rgba(76, 195, 138, 0.4); color: var(--sl-live); background: rgba(76, 195, 138, 0.1); }

    /* Popover */
    .why-popover {
      position: absolute;
      width: 340px;
      background: var(--sl-surface);
      border: 1px solid var(--sl-rule);
      border-radius: 10px;
      padding: 16px;
      z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>

  <!-- Top Bar (48px) -->
  <header style="height: 48px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 700; font-size: 15px; letter-spacing: -0.02em; color: var(--sl-ink);">Sightline</span>
      <span style="color: var(--sl-ink-faint);">/</span>
      <span id="repoNameTop" style="color: var(--sl-ink-muted); font-size: 13px; font-weight: 500;">nextjs-minimal</span>
      <span style="background: var(--sl-raised); border: 1px solid var(--sl-rule); font-size: 11px; padding: 1px 6px; border-radius: 3px; color: var(--sl-ink-muted); font-family: var(--sl-font-code);">App Router</span>
    </div>

    <div style="display: flex; align-items: center; gap: 12px;">
      <!-- Command Bar Trigger -->
      <div id="commandBarTrigger" style="background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 5px 12px; font-size: 12px; color: var(--sl-ink-muted); display: flex; align-items: center; gap: 8px; width: 280px; cursor: pointer;">
        <span>Search or ask...</span>
        <span style="margin-left: auto; font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-faint); border: 1px solid var(--sl-rule); padding: 0 4px; border-radius: 3px;">Ctrl K</span>
      </div>
      <div style="font-family: var(--sl-font-code); font-size: 12px; color: var(--sl-ink-muted); border: 1px solid var(--sl-rule); padding: 4px 8px; border-radius: 4px; background: var(--sl-raised);">
        main
      </div>
    </div>
  </header>

  <!-- Core Body Shell -->
  <div style="flex: 1; display: flex; overflow: hidden;">
    
    <!-- Left Navigation (216px) -->
    <nav style="width: 216px; border-right: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; justify-content: space-between; padding: 12px 8px; flex-shrink: 0;">
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <button id="navOverview" class="nav-item" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 6px; border: none; background: var(--sl-lens-tint); color: var(--sl-lens); font-weight: 600; font-size: 13px; text-align: left; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
          Overview
        </button>
        <button id="navExplore" class="nav-item" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 6px; border: none; background: transparent; color: var(--sl-ink-muted); font-size: 13px; text-align: left; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M10.5 5.5L7 7l-1.5 3.5L9 9l1.5-3.5z"/></svg>
          Explore
        </button>
        <button id="navChanges" class="nav-item" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 6px; border: none; background: transparent; color: var(--sl-ink-muted); font-size: 13px; text-align: left; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>
          Changes
          <span style="margin-left: auto; font-size: 10px; font-family: var(--sl-font-code); color: var(--sl-live); background: rgba(76,195,138,0.15); padding: 1px 5px; border-radius: 3px;">● 1</span>
        </button>
        <button id="navImpact" class="nav-item" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 6px; border: none; background: transparent; color: var(--sl-ink-muted); font-size: 13px; text-align: left; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6" stroke-dasharray="2 2"/></svg>
          Impact
        </button>
      </div>

      <div style="border-top: 1px solid var(--sl-rule); padding-top: 8px;">
        <button id="btnPoint" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--sl-rule); background: var(--sl-raised); color: var(--sl-ink); font-size: 13px; cursor: pointer;">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--sl-live);"></span>
            Point at live app
          </span>
          <span style="font-family: var(--sl-font-code); font-size: 11px; color: var(--sl-ink-faint);">P</span>
        </button>
      </div>
    </nav>

    <!-- Center Workspace -->
    <main style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--sl-canvas);">
      
      <!-- Breadcrumb & Mode Switch Row (40px) -->
      <div style="height: 40px; border-bottom: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0;">
        <nav id="breadcrumbs" style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--sl-ink-muted);">
          <span id="crumbRoot" style="color: var(--sl-ink); font-weight: 500; cursor: pointer;">Overview</span>
          <span id="crumbSep" style="color: var(--sl-ink-faint); display: none;">/</span>
          <span id="crumbTarget" style="color: var(--sl-ink); font-weight: 600; display: none;"></span>
        </nav>

        <!-- Mode Switch: Map · Trace · Source -->
        <div id="modeSwitch" style="display: flex; background: var(--sl-canvas); border: 1px solid var(--sl-rule); border-radius: 6px; padding: 2px;">
          <button id="modeMapBtn" class="mode-btn" style="padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; border: none; background: var(--sl-lens-tint); color: var(--sl-lens); cursor: pointer;">Map</button>
          <button id="modeTraceBtn" class="mode-btn" style="padding: 2px 10px; border-radius: 4px; font-size: 12px; border: none; background: transparent; color: var(--sl-ink-muted); cursor: pointer;">Trace</button>
          <button id="modeSourceBtn" class="mode-btn" style="padding: 2px 10px; border-radius: 4px; font-size: 12px; border: none; background: transparent; color: var(--sl-ink-muted); cursor: pointer;">Source</button>
        </div>
      </div>

      <!-- Workspace Viewport -->
      <div id="workspaceContent" style="flex: 1; overflow-y: auto; padding: 28px 36px;">
        
        <!-- Screen 6.1: Overview Screen -->
        <div id="screenOverview" style="max-width: 1040px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Header & AI Narrative -->
          <div>
            <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; color: var(--sl-ink);">Next.js Application Architecture</h1>
            <p class="narrative" style="color: var(--sl-ink); margin-top: 6px; font-style: italic;">
              "An interactive web service where users authenticate, manage subscriptions, view workspace analytics, and initiate payment transactions."
            </p>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--sl-ink-muted);">
              <span>Written by AI · Based on 10 deterministic facts</span>
              <span>•</span>
              <span id="overviewStats">4 areas · 6 routes · 10 symbols · indexed 1m ago</span>
            </div>
          </div>

          <!-- Split: Regional Map (Left) + Good places to start (Right) -->
          <div style="display: grid; grid-template-columns: 1fr 300px; gap: 24px;">
            
            <!-- Regional Map (Calm layout with 16px radius) -->
            <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 16px; padding: 24px; position: relative;">
              <div style="font-size: 11px; text-transform: uppercase; font-family: var(--sl-font-code); color: var(--sl-ink-muted); margin-bottom: 16px;">
                Application Regions & Capabilities
              </div>

              <!-- Region Boxes -->
              <div id="regionsContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Dynamically rendered regions -->
              </div>
            </div>

            <!-- Good Places to Start & Recent Changes -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 12px; padding: 18px;">
                <h3 style="font-size: 13px; font-weight: 600; color: var(--sl-ink); margin-bottom: 12px;">Good places to start</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div onclick="openTrace('billing')" style="padding: 10px; border-radius: 6px; background: var(--sl-raised); border: 1px solid var(--sl-rule); cursor: pointer;">
                    <div style="font-size: 13px; font-weight: 500; color: var(--sl-lens);">1. How checkout payment works</div>
                    <div style="font-size: 11px; color: var(--sl-ink-muted); margin-top: 2px;">Trace: /billing ➔ /api/checkout</div>
                  </div>
                  <div onclick="openTrace('auth')" style="padding: 10px; border-radius: 6px; background: var(--sl-raised); border: 1px solid var(--sl-rule); cursor: pointer;">
                    <div style="font-size: 13px; font-weight: 500; color: var(--sl-lens);">2. How user authentication works</div>
                    <div style="font-size: 11px; color: var(--sl-ink-muted); margin-top: 2px;">Trace: /login ➔ /api/auth/login</div>
                  </div>
                  <div onclick="openTrace('dashboard')" style="padding: 10px; border-radius: 6px; background: var(--sl-raised); border: 1px solid var(--sl-rule); cursor: pointer;">
                    <div style="font-size: 13px; font-weight: 500; color: var(--sl-lens);">3. Where workspace metrics live</div>
                    <div style="font-size: 11px; color: var(--sl-ink-muted); margin-top: 2px;">Trace: /dashboard entry page</div>
                  </div>
                </div>
              </div>

              <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 12px; padding: 18px;">
                <h3 style="font-size: 13px; font-weight: 600; color: var(--sl-ink); margin-bottom: 10px;">Recently changed</h3>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--sl-ink);">Stripe checkout route</span>
                    <span style="color: var(--sl-ink-muted); font-size: 11px;">today</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--sl-ink);">Auth form validation</span>
                    <span style="color: var(--sl-ink-muted); font-size: 11px;">2d ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Screen 6.2: Trace Mode (Vertical Flow) -->
        <div id="screenTrace" style="max-width: 860px; margin: 0 auto; display: none; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <h2 id="traceTitle" style="font-size: 20px; font-weight: 600;">Check out Flow</h2>
              <div style="font-size: 12px; color: var(--sl-ink-muted); margin-top: 2px;">
                Path strength: <span id="tracePathStrength" class="chip chip-matched">◐ Matched by URL</span>
              </div>
            </div>
            <button onclick="showOverview()" class="btn-secondary">← Back to Overview</button>
          </div>

          <!-- Trace steps list with left SVG rail -->
          <div id="traceStepsList" style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 10px; overflow: hidden;">
            <!-- Rendered trace steps -->
          </div>
        </div>

        <!-- Screen 6.3: Source Mode -->
        <div id="screenSource" style="max-width: 900px; margin: 0 auto; display: none; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-family: var(--sl-font-code); font-size: 13px; color: var(--sl-lens);" id="sourceFilePath">app/billing/page.tsx</div>
            <button onclick="showOverview()" class="btn-secondary">Close Code</button>
          </div>
          <div style="background: var(--sl-surface); border: 1px solid var(--sl-rule); border-radius: 6px; font-family: var(--sl-font-code); font-size: 12px; overflow: hidden;">
            <div style="padding: 16px; background: var(--sl-canvas); color: var(--sl-ink-muted); border-bottom: 1px solid var(--sl-rule); display: flex; justify-content: space-between;">
              <span>Read-only source view with relationship annotations</span>
              <span style="color: var(--sl-live);">● Ground truth (AST)</span>
            </div>
            <pre id="sourceCodeBlock" style="padding: 16px; overflow-x: auto; line-height: 22px; color: var(--sl-ink);"></pre>
          </div>
        </div>

      </div>

      <!-- Time Bar (40px) -->
      <footer style="height: 40px; border-top: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-size: 12px; color: var(--sl-ink-muted); flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--sl-live);"></span>
          <span>Snapshot: <strong style="font-family: var(--sl-font-code); color: var(--sl-ink);" id="footerSnapshotId">latest</strong> (working tree)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>◄</span>
          <div style="width: 200px; height: 3px; background: var(--sl-rule); position: relative; border-radius: 2px;">
            <div style="position: absolute; right: 0; top: -4px; width: 11px; height: 11px; border-radius: 50%; background: var(--sl-lens); cursor: pointer;"></div>
          </div>
          <span>►</span>
          <span style="font-weight: 600; color: var(--sl-ink); margin-left: 6px;">Now</span>
        </div>
      </footer>
    </main>

    <!-- Context Panel (360px on right) -->
    <aside id="contextPanel" style="width: 360px; border-left: 1px solid var(--sl-rule); background: var(--sl-surface); display: flex; flex-direction: column; overflow-y: auto; padding: 24px 20px; gap: 20px; flex-shrink: 0;">
      
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span id="panelKindBadge" class="chip" style="font-size: 11px; text-transform: uppercase;">Feature</span>
          <span id="panelEvidenceCount" style="font-size: 11px; color: var(--sl-ink-muted);">● 4 confirmed</span>
        </div>
        <h2 id="panelTitle" style="font-size: 18px; font-weight: 600; color: var(--sl-ink); margin-top: 8px;">Billing & Payments</h2>
        <div id="panelDesc" class="narrative" style="color: var(--sl-ink-muted); margin-top: 4px; font-size: 14px; line-height: 22px;">
          Handles customer subscription tiers, checkout session dispatching, and webhook notifications.
        </div>
      </div>

      <!-- Section: Connected to -->
      <div style="border-top: 1px solid var(--sl-rule); padding-top: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; font-family: var(--sl-font-code); color: var(--sl-ink-faint); margin-bottom: 8px;">Connected To</div>
        <div id="panelConnectedList" style="display: flex; flex-direction: column; gap: 6px;">
          <!-- Items -->
        </div>
      </div>

      <!-- Section: Evidence Breakdown -->
      <div style="border-top: 1px solid var(--sl-rule); padding-top: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; font-family: var(--sl-font-code); color: var(--sl-ink-faint); margin-bottom: 8px;">Evidence & Provenance</div>
        <div id="panelEvidenceDetails" style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="chip chip-confirmed">● Confirmed</span>
            <span style="color: var(--sl-ink-muted);">Tree-sitter AST syntax</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="chip chip-matched">◐ Matched</span>
            <span style="color: var(--sl-ink-muted);">URL route convention</span>
          </div>
        </div>
      </div>

      <!-- Section: Actions -->
      <div style="margin-top: auto; border-top: 1px solid var(--sl-rule); padding-top: 16px; display: flex; flex-direction: column; gap: 8px;">
        <button id="panelActionTrace" class="btn-lens" style="width: 100%;">Trace flow</button>
        <button id="panelActionSource" class="btn-secondary" style="width: 100%;">Open code</button>
      </div>
    </aside>

  </div>

  <!-- Why? Popover (Hidden by default) -->
  <div id="whyPopover" class="why-popover" style="display: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span style="font-weight: 600; font-size: 13px;">Why we think this</span>
      <button onclick="closeWhy()" style="background: none; border: none; color: var(--sl-ink-muted); cursor: pointer; font-size: 14px;">✕</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
      <div>
        <span style="color: var(--sl-ink-faint); font-size: 11px;">WHAT WE KNOW</span>
        <div style="color: var(--sl-ink); margin-top: 2px;">handleCheckout() triggers /api/checkout</div>
      </div>
      <div>
        <span style="color: var(--sl-ink-faint); font-size: 11px;">HOW WE KNOW</span>
        <div style="margin-top: 2px;"><span class="chip chip-matched">◐ Matched by URL pattern</span></div>
      </div>
      <div>
        <span style="color: var(--sl-ink-faint); font-size: 11px;">WHERE IT CAME FROM</span>
        <div style="font-family: var(--sl-font-code); color: var(--sl-lens); margin-top: 2px;">app/billing/page.tsx:7</div>
      </div>
    </div>
  </div>

  <script>
    let appData = { snapshot: null, clusters: [], entities: [], edges: [] };
    let currentSelection = null;

    async function loadData() {
      try {
        const res = await fetch('/api/data');
        appData = await res.json();
        renderOverview();
        if (appData.clusters.length > 0) {
          selectItem('cluster', appData.clusters[0]);
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }

    function renderOverview() {
      if (appData.snapshot) {
        document.getElementById('footerSnapshotId').textContent = appData.snapshot.id.slice(0, 8);
      }
      
      const totalRoutes = appData.clusters.reduce((acc, c) => acc + c.routes.length, 0);
      document.getElementById('overviewStats').textContent = \`\${appData.clusters.length} areas · \${totalRoutes} routes · \${appData.entities.length} symbols · indexed just now\`;

      const container = document.getElementById('regionsContainer');
      container.innerHTML = '';

      appData.clusters.forEach(c => {
        const region = document.createElement('div');
        region.style = 'background: var(--sl-raised); border: 1px solid var(--sl-rule); border-radius: 10px; padding: 14px; cursor: pointer; transition: border-color 0.15s;';
        region.onmouseover = () => { region.style.borderColor = 'var(--sl-lens)'; };
        region.onmouseout = () => { region.style.borderColor = 'var(--sl-rule)'; };
        region.onclick = () => selectItem('cluster', c);

        const routesListHtml = c.routes.map(r => \`
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: var(--sl-font-code); padding: 4px 0;">
            <span style="color: var(--sl-ink);">\${r.urlPath}</span>
            <span style="color: var(--sl-ink-muted); font-size: 11px;">\${r.kind}</span>
          </div>
        \`).join('');

        region.innerHTML = \`
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 14px; font-weight: 600; color: var(--sl-ink);">\${c.name}</h4>
            <span class="chip chip-confirmed">● \${c.routes.length} routes</span>
          </div>
          <p style="font-size: 12px; color: var(--sl-ink-muted); margin-bottom: 12px;">\${c.description}</p>
          <div style="border-top: 1px solid var(--sl-rule); padding-top: 8px;">
            \${routesListHtml}
          </div>
        \`;
        container.appendChild(region);
      });
    }

    function selectItem(type, item) {
      currentSelection = { type, item };
      
      if (type === 'cluster') {
        document.getElementById('panelKindBadge').textContent = 'Area';
        document.getElementById('panelKindBadge').className = 'chip chip-confirmed';
        document.getElementById('panelTitle').textContent = item.name;
        document.getElementById('panelDesc').textContent = item.description;

        const list = document.getElementById('panelConnectedList');
        list.innerHTML = '';
        item.routes.forEach(r => {
          const row = document.createElement('div');
          row.style = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-radius: 4px; background: var(--sl-canvas); border: 1px solid var(--sl-rule); font-size: 12px;';
          row.innerHTML = \`
            <span style="font-family: var(--sl-font-code); color: var(--sl-ink);">\${r.urlPath}</span>
            <span style="color: var(--sl-ink-muted); font-size: 11px;">\${r.kind}</span>
          \`;
          list.appendChild(row);
        });

        document.getElementById('panelActionTrace').onclick = () => openTrace(item.id);
        document.getElementById('panelActionSource').onclick = () => openSource(item.filePaths[0] || 'app/page.tsx');
      }
    }

    function openTrace(areaId) {
      document.getElementById('screenOverview').style.display = 'none';
      document.getElementById('screenSource').style.display = 'none';
      document.getElementById('screenTrace').style.display = 'flex';

      document.getElementById('crumbSep').style.display = 'inline';
      const target = document.getElementById('crumbTarget');
      target.style.display = 'inline';
      target.textContent = areaId === 'billing' ? 'Checkout Flow' : (areaId === 'auth' ? 'Login Flow' : 'Dashboard Flow');

      document.getElementById('modeMapBtn').style.background = 'transparent';
      document.getElementById('modeMapBtn').style.color = 'var(--sl-ink-muted)';
      document.getElementById('modeTraceBtn').style.background = 'var(--sl-lens-tint)';
      document.getElementById('modeTraceBtn').style.color = 'var(--sl-lens)';
      document.getElementById('modeTraceBtn').style.fontWeight = '600';

      const stepsList = document.getElementById('traceStepsList');
      stepsList.innerHTML = '';

      const steps = areaId === 'billing' ? [
        { name: 'Pay Button', type: 'screen', file: 'app/billing/page.tsx:21', rel: 'click', evidence: 'Confirmed' },
        { name: 'handleUpgrade()', type: 'function', file: 'app/billing/page.tsx:6', rel: 'requests', evidence: 'Matched' },
        { name: 'POST /api/checkout', type: 'route', file: 'app/api/checkout/route.ts:1', rel: 'calls', evidence: 'Confirmed' },
        { name: 'Stripe Checkout API', type: 'service', file: 'external', rel: 'boundary', evidence: 'Confirmed' }
      ] : [
        { name: 'Sign In Button', type: 'screen', file: 'app/(auth)/login/page.tsx:34', rel: 'click', evidence: 'Confirmed' },
        { name: 'handleSubmit()', type: 'function', file: 'app/(auth)/login/page.tsx:9', rel: 'requests', evidence: 'Matched' },
        { name: 'POST /api/auth/login', type: 'route', file: 'app/api/auth/login/route.ts:1', rel: 'calls', evidence: 'Confirmed' },
        { name: 'User Token Service', type: 'service', file: 'internal', rel: 'boundary', evidence: 'Confirmed' }
      ];

      steps.forEach((s, idx) => {
        const row = document.createElement('div');
        row.style = 'display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid var(--sl-rule); cursor: pointer;';
        row.onmouseover = () => { row.style.background = 'var(--sl-raised)'; };
        row.onmouseout = () => { row.style.background = 'transparent'; };

        const isMatched = s.evidence === 'Matched';
        row.innerHTML = \`
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; background: var(--sl-raised); border: 1px solid var(--sl-rule); color: var(--sl-ink-muted);">\${idx + 1}</div>
            <div>
              <div style="font-weight: 500; font-size: 13px; color: var(--sl-ink);">\${s.name}</div>
              <div style="font-size: 11px; color: var(--sl-ink-muted);">\${s.rel}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="chip \${isMatched ? 'chip-matched' : 'chip-confirmed'}" onclick="showWhy(event, '\${s.name}', '\${s.file}')">
              \${isMatched ? '◐ Matched' : '● Confirmed'}
            </span>
            <span style="font-family: var(--sl-font-code); font-size: 12px; color: var(--sl-ink-muted);">\${s.file}</span>
          </div>
        \`;
        stepsList.appendChild(row);
      });
    }

    function openSource(filePath) {
      document.getElementById('screenOverview').style.display = 'none';
      document.getElementById('screenTrace').style.display = 'none';
      document.getElementById('screenSource').style.display = 'flex';
      document.getElementById('sourceFilePath').textContent = filePath;

      document.getElementById('modeMapBtn').style.background = 'transparent';
      document.getElementById('modeMapBtn').style.color = 'var(--sl-ink-muted)';
      document.getElementById('modeSourceBtn').style.background = 'var(--sl-lens-tint)';
      document.getElementById('modeSourceBtn').style.color = 'var(--sl-lens)';
      document.getElementById('modeSourceBtn').style.fontWeight = '600';

      const codeSample = filePath.includes('billing') ? \`// app/billing/page.tsx
"use client";
import React from 'react';
import { Button } from '@/components/Button';

export default function BillingPage() {
  const handleUpgrade = async () => {
    // ┄┄ requests /api/checkout (matched by URL pattern)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: 'pro' }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="billing-page">
      <h1>Billing & Plans</h1>
      {/* ── renders Button (extracted from JSX AST) */}
      <Button onClick={handleUpgrade}>Upgrade Now</Button>
    </div>
  );
}\` : \`// app/page.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';

export default function HomePage() {
  return (
    <main>
      {/* ── renders Header (extracted from JSX AST) */}
      <Header />
      <Button href="/login">Get Started</Button>
    </main>
  );
}\`;

      document.getElementById('sourceCodeBlock').textContent = codeSample;
    }

    function showOverview() {
      document.getElementById('screenOverview').style.display = 'flex';
      document.getElementById('screenTrace').style.display = 'none';
      document.getElementById('screenSource').style.display = 'none';

      document.getElementById('crumbSep').style.display = 'none';
      document.getElementById('crumbTarget').style.display = 'none';

      document.getElementById('modeMapBtn').style.background = 'var(--sl-lens-tint)';
      document.getElementById('modeMapBtn').style.color = 'var(--sl-lens)';
      document.getElementById('modeTraceBtn').style.background = 'transparent';
      document.getElementById('modeTraceBtn').style.color = 'var(--sl-ink-muted)';
      document.getElementById('modeSourceBtn').style.background = 'transparent';
      document.getElementById('modeSourceBtn').style.color = 'var(--sl-ink-muted)';
    }

    function showWhy(event, name, file) {
      event.stopPropagation();
      const popover = document.getElementById('whyPopover');
      popover.style.display = 'block';
      popover.style.top = (event.clientY + 12) + 'px';
      popover.style.left = Math.min(event.clientX - 100, window.innerWidth - 360) + 'px';
    }

    function closeWhy() {
      document.getElementById('whyPopover').style.display = 'none';
    }

    document.getElementById('crumbRoot').onclick = showOverview;
    document.getElementById('modeMapBtn').onclick = showOverview;
    document.getElementById('modeTraceBtn').onclick = () => openTrace('billing');
    document.getElementById('modeSourceBtn').onclick = () => openSource('app/billing/page.tsx');
    document.getElementById('navOverview').onclick = showOverview;
    document.getElementById('navExplore').onclick = () => openTrace('billing');

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        alert('Point Mode: Dev-server preview overlay active. Click any component in your live app to inspect source & flow.');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const query = prompt('Sightline Command Bar: Search routes or ask questions about this codebase:');
        if (query) {
          if (query.toLowerCase().includes('pay') || query.toLowerCase().includes('bill')) {
            openTrace('billing');
          } else if (query.toLowerCase().includes('auth') || query.toLowerCase().includes('login')) {
            openTrace('auth');
          }
        }
      }
    });

    loadData();
  </script>
</body>
</html>
`;
}
