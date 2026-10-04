# Sightline — Master Development & Execution Plan

## 1. Vision & Strategic Focus
Sightline is the **comprehension and control layer for AI-built software**. As AI agents generate and modify code at superhuman speeds, developers face a cognitive gap: *what is this app, how does the UI connect to code, what did the agent just change, and what could it break?*

Sightline solves this through four pillars:
1. **Map:** What is this app made of in product terms?
2. **Point:** What code is behind what I see on screen?
3. **Story:** What did the agent change and why?
4. **Blast Radius:** What could this change affect?

---

## 2. Core Execution Principles

1. **Sprint-Driven User Feature Delivery:**
   Every single sprint must deliver a complete, testable, end-to-end user capability (CLI command, UI view, or tool invocation). No sprints dedicated solely to "infrastructure with no user-facing output".
2. **Evidence Over Eloquence (Three-Layer Trust):**
   - **Layer 1 (Facts):** Deterministic syntax parsing (Tree-sitter, symbol resolution). Ground truth.
   - **Layer 2 (Structures):** Framework adapters (Next.js), cross-boundary resolution, entry-point flows, and feature clusters.
   - **Layer 3 (Narrative):** Grounded LLM narration with strict entity citations and verification.
3. **Local-First & Frictionless Setup:**
   Run locally with zero external services required (embedded SQLite + FTS5). A developer should be able to run `npx sightline` on their project in under 2 minutes.
4. **Rigorous Automated Testing:**
   All features must be validated against a curated corpus of **Golden Repositories** (real Next.js apps) with unit tests, AST assertions, flow recall benchmarks, and end-to-end user workflow tests.

---

## 3. Technology Stack & Choices

| Area | Selection | Rationale |
|---|---|---|
| **Monorepo Manager** | pnpm + Turborepo | Fast, lightweight, strictly isolated workspaces |
| **Language** | TypeScript (Node.js 20+) | Native ecosystem for Tree-sitter, Next.js AST, and browser tooling |
| **AST / Parsing** | `tree-sitter`, `tree-sitter-typescript` | Incremental, blazing fast, error-tolerant syntax parsing |
| **Local Database** | SQLite (`better-sqlite3` + `kysely`) | Single-file zero-config database; supports recursive CTEs for graph traversal |
| **CLI Framework** | `commander` + `ora` + `chalk` | Clean developer experience and terminal output |
| **UI Framework** | Next.js / React + Tailwind CSS + `@xyflow/react` (React Flow) | Rich graph canvas, performant rendering, responsive zoom |
| **Agent Interface** | Model Context Protocol (`@modelcontextprotocol/sdk`) | Standardized stdio/HTTP agent protocol |

---

## 4. Testing & Quality Strategy

To ensure Sightline is production-grade and dependable, every sprint incorporates three tiers of testing:

### 4.1 Unit & Snapshot Tests
- Fast unit tests for Tree-sitter visitors, symbol extractors, and edge generators.
- Snapshot tests verifying AST outputs across complex TypeScript patterns (closures, JSX props, server actions, route handlers).

### 4.2 Golden Repository Integration Benchmark
- Curate 3 golden repositories in `testbed/golden-repos/`:
  1. `nextjs-app-router-minimal`: Clean Next.js 14/15 App Router app with server actions and route handlers.
  2. `nextjs-prisma-fullstack`: Full-stack app with Prisma ORM, dynamic routes, and client-side data fetching.
  3. `agent-churn-repo`: A messy, multi-session AI-generated codebase reflecting real-world vibe-coder patterns.
- Benchmark metric gates:
  - $\ge 85\%$ symbol extraction recall.
  - $\ge 80\%$ flow precision and recall against hand-labeled golden flow paths.
  - Sub-second graph query responses.

### 4.3 End-to-End Workflow Verification
- CLI test suite testing `sightline init`, `sightline index`, `sightline view`, and `sightline impact`.
- Headless browser verification checking that the UI renders without errors and accurately displays features, flows, and provenance chips.
