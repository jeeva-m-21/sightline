# Sightline — Sprint Backlog & Feature Roadmap

Every sprint is designed around delivering a **complete, testable user-facing feature**.

---

## Sprint 1: The Product Map (CLI & Interactive Visualizer)
> **User Feature:** The user runs `sightline init` and `sightline map` on any Next.js codebase and instantly sees a high-level product architecture map in their browser (semantic zoom: Product $\to$ Features $\to$ Pages/Components), with zero external configuration.

### Scope & Deliverables
1. **Core Data Model & Storage (`@sightline/core`, `@sightline/store`):**
   - SQLite schema (Entities, Snapshots, Edges, Overrides).
   - Content-addressed caching of parsed files.
2. **Deterministic TypeScript & TSX Extractor (`@sightline/extractor`):**
   - Tree-sitter parser for files, exported functions, components, hooks, imports, and calls.
3. **Next.js Structure Adapter (`@sightline/adapter-nextjs`):**
   - Detect Next.js App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`, server components vs client components (`"use client"`).
4. **Hierarchical Clusterer:**
   - Group symbols into high-level Features (max 12 visible nodes at top level) using route tree hierarchy and module boundaries.
5. **Local Web Visualizer (`@sightline/ui`, `@sightline/cli`):**
   - CLI command `sightline map` launching local web server showing the Product Map canvas.
   - Interactive nodes with symbol type icons, file paths, and evidence badges.

### Acceptance Criteria & Tests (Sprint 1 Status: ✅ COMPLETED)
- [x] Running `sightline init` creates `.sightline/` with initialized SQLite db.
- [x] Indexing a 50k LOC Next.js repo completes in $< 60$ seconds locally (benchmarked at 33ms on golden repo).
- [x] Product Map renders $\le 12$ high-level feature clusters without overwhelming spaghetti edges.
- [x] Clicking a feature cluster expands to reveal contained routes, pages, and components.
- [x] 100% passing unit tests on Tree-sitter symbol extractors against golden test cases.

---

## Sprint 2: Flow View & Cross-Boundary Tracer
> **User Feature:** The user can click any feature or user action in the map and inspect the complete, step-by-step end-to-end flow from UI click/route to backend API and database tables, with transparent provenance chips (`● Extracted`, `◐ Heuristic`).

### Scope & Deliverables
1. **Cross-Boundary Resolver:**
   - Heuristic resolver linking client-side `fetch('/api/...')` to `app/api/.../route.ts`.
   - Resolution of Server Actions called from React client components.
   - Detection of Prisma / Supabase database queries mapped to underlying tables.
2. **Entry Point Detector:**
   - Categorize entry points: UI routes (`page.tsx`), event handlers (`onClick`, `onSubmit`), API endpoints (`route.ts`).
3. **Flow Builder Engine:**
   - Traversal algorithm: Entry Point $\to$ Components $\to$ Services/Handlers $\to$ DB/External boundary.
   - Noise collapse (filtering standard utilities, formatters, and framework runtime shims).
   - Weakest-link edge provenance calculation along the path.
4. **Interactive Flow UI Canvas:**
   - Step-by-step visual diagram rendering the flow.
   - Provenance chips on each step with click-to-view source evidence.

### Acceptance Criteria & Tests
- [ ] Resolver correctly links $\ge 80\%$ of `fetch()` calls to their corresponding Next.js route handlers in the golden testbed.
- [ ] Flow view displays clear start (Entry Point) and end (Boundary) nodes.
- [ ] Clicking any step opens the exact file and line number in local editor (e.g. VS Code link `vscode://file/...`).
- [ ] Integration tests verify flows generated for authentication and billing in golden repos.

---

## Sprint 3: Live Preview Click-to-Code ("Point")
> **User Feature:** The user opens their local development app in a browser with the Sightline dev bridge active, clicks on any button or UI element, and Sightline instantly reveals the exact React component, source file, event handler, and triggered downstream API call.

### Scope & Deliverables
1. **Dev-Server Preview Bridge:**
   - React Fiber / JSX source annotation bridge connecting DOM nodes to React component definitions (`file:line`).
2. **Network Activity Matcher:**
   - Browser bridge intercepting network requests initiated by UI user interactions.
   - Match outgoing URLs to the backend routes in the Sightline model.
3. **Point Inspector UI:**
   - Browser overlay / sidebar with "Inspect" toggle.
   - One-click leap to code in the editor and in the Sightline Flow View.

### Acceptance Criteria & Tests
- [ ] Clicking a button in the running preview highlights the exact component and line number.
- [ ] Network requests fired by user actions are correlated to the corresponding route handler.
- [ ] Dev bridge runs with zero impact on production builds.
- [ ] End-to-end Playwright test verifying that clicking a test button outputs the correct component symbol ID.

---

## Sprint 4: Agent Session Story & Semantic Diff ("Story")
> **User Feature:** When an AI agent completes a coding task, Sightline presents a readable "Session Story" displaying the agent's intent, structural changes (new boundaries, changed contracts, new tables, dangling references), and suggested verification tests.

### Scope & Deliverables
1. **Snapshot Storage & Graph Diffing:**
   - Per-commit and working-tree snapshots in SQLite.
   - Content-addressed state diffing: compare `Snapshot_A` and `Snapshot_B` at the symbol/edge level.
2. **Rule-Based Semantic Change Classifier:**
   - Detect high-risk structural changes:
     - New external service boundaries
     - Changed API route parameters/responses
     - New database tables or schema columns
     - Dangling references (symbols called that were deleted)
3. **Grounded Story Narrator:**
   - Structured LLM prompt generating narrative summary of the session.
   - Grounding verifier ensuring every claim cites valid entity UUIDs from the diff.
4. **Session Story UI & CLI:**
   - `sightline story` CLI command and interactive review screen.

### Acceptance Criteria & Tests
- [ ] Semantic diff accurately tags 100% of synthetic breaking changes (contract modifications, dangling calls).
- [ ] Grounding verifier rejects any narration that mentions non-existent symbols or edges.
- [ ] Session diff handles file renames without breaking symbol identity.

---

## Sprint 5: Blast Radius & Impact Engine
> **User Feature:** A developer or agent runs `sightline impact <file/symbol/flow>` and immediately receives a ranked, provenance-weighted blast radius showing certain vs. possible regressions and recommended tests before modifying code.

### Scope & Deliverables
1. **Reverse Traversal Engine:**
   - Recursive CTE over reversed edges in SQLite with configurable depth limit.
   - Provenance path scoring: $\text{score} = \prod \text{weight}(\text{edge})$.
2. **Impact Categorization:**
   - `CERTAIN` ($\ge 0.9$): Extracted/Resolved dependency links.
   - `LIKELY` ($0.5 - 0.9$): Heuristic route/adapter links.
   - `POSSIBLE` ($< 0.5$): Inferred or dynamic calls.
3. **Verification Checklist Generator:**
   - Maps affected downstream flows to existing test files.
4. **Blast Radius CLI & UI:**
   - Terminal tree output and visual risk graph in the UI.

### Acceptance Criteria & Tests
- [ ] Perturbation test: Modifying a shared auth hook accurately flags all dependent pages and server actions as `CERTAIN` or `LIKELY`.
- [ ] Dynamic, unresolved calls are surfaced as `POSSIBLE` warnings rather than silently omitted.
- [ ] Query latency for blast radius calculation is $< 200\text{ ms}$ on 50k LOC repositories.

---

## Sprint 6: Agent Ecosystem Integration (MCP Server)
> **User Feature:** AI coding agents (Claude Code, Cursor, Antigravity, etc.) can natively query Sightline via Model Context Protocol (MCP) using 5 outcome-oriented tools (`orient`, `explain`, `impact`, `changes`, `session`) to plan changes with zero guesswork.

### Scope & Deliverables
1. **MCP Server (`@sightline/mcp-server`):**
   - Implement official MCP protocol (JSON-RPC over stdio and HTTP/SSE).
   - Tool `orient(task)`: High-risk files, affected features, and prior sessions.
   - Tool `explain(target)`: Structured flow and citations.
   - Tool `impact(target)`: Programmatic blast radius.
   - Tool `changes(since)`: Structural diff list.
   - Tool `session(start | end, intent)`: Lifecycle tracking.
2. **Safety & Token Optimization:**
   - Compact structured responses with token bounds.
   - Repo text treated as untrusted; sanitization of prompt-injection vectors.

### Acceptance Criteria & Tests
- [ ] MCP protocol test suite passes all standard schema and transport validations.
- [ ] Simulated agent session: Agent successfully calls `orient`, runs edits, calls `session(end)`, and receives verified session story.
- [ ] Sub-500ms response time for all MCP tool calls.
