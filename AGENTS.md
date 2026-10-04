# AGENTS.md — Operational Guide for AI Agents Working on Sightline

Welcome, Agent. This file is the single source of truth for all AI agents collaborating on the **Sightline** codebase across sessions. Read this before making changes.

---

## 1. Project Mission & Identity

- **Name:** Sightline
- **Tagline:** *"Your AI built it. Sightline helps you see it."*
- **Core Purpose:** Sightline is a comprehension and control layer for AI-assisted software development. It bridges the gap between what code is and what humans/agents understand through four pillars: **Map**, **Point**, **Story**, and **Blast Radius**.
- **Primary Reference PRD:** Read [`PRD.md`](file:///home/jeeva/projects/explainable-project/PRD.md) and [`docs/`](file:///home/jeeva/projects/explainable-project/docs/) for complete context.

---

## 2. Inviolable Architectural Rules

1. **Three-Layer Trust Hierarchy:**
   - **Layer 1 (Facts):** Deterministic syntax facts from Tree-sitter. Ground truth. Never guess what a parser can resolve.
   - **Layer 2 (Structures):** Framework adapters (Next.js), heuristic cross-boundary resolvers, and clustering. Best effort, labelled with provenance.
   - **Layer 3 (Narrative):** LLM explanations. Must **always cite entity IDs** and pass the Grounding Verifier. A bug in Layer 3 must never corrupt Layer 1 or 2.
2. **Never Present Inferred Data as Ground Truth:**
   - Every edge must carry its explicit provenance: `EXTRACTED`, `RESOLVED`, `HEURISTIC`, `OBSERVED`, `INFERRED`, or `HUMAN`.
   - Never render an inferred link identical to an extracted link in UI or CLI output.
3. **Local-First & Frictionless:**
   - Default storage is SQLite (`.sightline/sightline.sqlite`).
   - Do NOT require Docker, external databases, or cloud accounts for local indexing or viewing.
4. **Target Stack Focus:**
   - **TypeScript + Next.js (App Router + Pages Router)** first. Do not add premature polyglot support until the Next.js core loop is proven on golden repos.

---

## 3. Sprint Delivery Model

We execute in **Sprints where every sprint delivers a concrete, end-to-end user feature**:

| Sprint | User-Facing Feature | Target Deliverable |
|---|---|---|
| **Sprint 1** | **The Product Map** | `sightline init` + `sightline map` (local web canvas showing $\le 12$ feature clusters) |
| **Sprint 2** | **Flow View** | Step-by-step cross-boundary flow tracing with provenance chips |
| **Sprint 3** | **Live Preview ("Point")** | Click any element in running web preview $\to$ jump to source & flow |
| **Sprint 4** | **Session Story ("Story")** | `sightline story` (what the agent changed, why, and breaking risk) |
| **Sprint 5** | **Blast Radius** | `sightline impact <target>` (provenance-weighted impact analysis) |
| **Sprint 6** | **Agent MCP Server** | 5 outcome-oriented MCP tools (`orient`, `explain`, `impact`, `changes`, `session`) |

*See [`docs/SPRINTS.md`](file:///home/jeeva/projects/explainable-project/docs/SPRINTS.md) for full sprint specs and acceptance criteria.*

---

## 4. Repository Structure & Conventions

```text
explainable-project/
├── PRD.md                  # Complete product & architecture PRD
├── AGENTS.md               # You are here
├── docs/                   # Architectural & sprint documentation
│   ├── DEVELOPMENT_PLAN.md # Master plan & quality strategy
│   ├── SPRINTS.md          # Sprint backlog & user stories
│   └── ARCHITECTURE.md     # Technical reference & schema
├── packages/
│   ├── core/               # Shared types, entity model, provenance definitions
│   ├── extractor/          # Tree-sitter AST parser & symbol extraction
│   ├── adapter-nextjs/     # Next.js route & boundary conventions
│   ├── flow-builder/       # Traversal & flow materialization
│   ├── store/              # SQLite database layer & snapshot engine
│   └── mcp-server/         # MCP server implementation
├── apps/
│   ├── cli/                # Terminal CLI (`sightline`)
│   └── web/                # Local web viewer (Next.js/React Flow)
└── testbed/
    └── golden-repos/       # Standard test repositories for evaluation
```

---

## 5. Development & Testing Standards

- **Strict TypeScript:** No `any`. All entity attributes and query payloads must be strictly typed.
- **Testing Requirement:** Every newly written parser or resolver must have unit tests with sample code fixtures.
- **Golden Repos:** Before marking any sprint complete, run the full pipeline on the golden testbed in `testbed/golden-repos/`.
- **Command Guidelines:**
  - Build: `pnpm build`
  - Test: `pnpm test`
  - Lint/Typecheck: `pnpm typecheck`

---

## 6. How to Handoff Across Sessions

When concluding a session or handing off:
1. Update the **Sprint Status** in [`docs/SPRINTS.md`](file:///home/jeeva/projects/explainable-project/docs/SPRINTS.md).
2. Ensure all tests pass (`pnpm test`).
3. Commit working code with a descriptive git message and push to GitHub.
4. Record key decisions or known blockers in this file under a `## Session Notes` section if necessary.
