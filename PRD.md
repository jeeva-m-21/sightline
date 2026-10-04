# Sightline — Product Specification & Architecture Design

> *"Your AI built it. Sightline helps you see it."*

**Status:** Draft v1 (evaluation + redesign of the original concept)
**Scope:** Problem evaluation, solution critique, product definition, name, improved architecture, roadmap, risks.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Evaluation of the Problem Statement](#2-evaluation-of-the-problem-statement)
3. [Evaluation of the Proposed Solution](#3-evaluation-of-the-proposed-solution)
4. [Critique of the Proposed Architecture](#4-critique-of-the-proposed-architecture)
5. [Product Name](#5-product-name)
6. [Refined Product Definition](#6-refined-product-definition)
7. [Product Specification](#7-product-specification)
8. [System Architecture (v2)](#8-system-architecture-v2)
9. [Data Model](#9-data-model)
10. [Core Algorithms](#10-core-algorithms)
11. [Agent Integration (MCP & Hooks)](#11-agent-integration-mcp--hooks)
12. [Security & Privacy](#12-security--privacy)
13. [Quality & Evaluation](#13-quality--evaluation)
14. [Roadmap](#14-roadmap)
15. [Business Considerations](#15-business-considerations)
16. [Risks & Open Questions](#16-risks--open-questions)

---

## 1. Executive Summary

**Problem.** AI agents change software faster than humans can build a mental model of it. The gap between *what the code is* and *what the human believes it is* grows with every agent session.

**Verdict on the original idea.** The problem is real and getting more acute. The proposed direction (a persistent software model + AI explanation on top, rather than "LLM reads the repo") is correct. But the original solution has four weaknesses:

1. It treats "feature / flow" detection as a given. It is the hardest unsolved part of the product.
2. It under-weights the most defensible data asset: **intent** (which prompt/session caused which change, and why).
3. It ignores half of the original problem statement, the **design perspective** ("how does what I see on screen map to code?").
4. It is over-scoped (runtime tracing, multi-language, graph DB, MCP Apps) before the core loop is proven, and it has no plan to *measure* whether users actually understand more.

**Redesigned product.** Sightline is a **comprehension layer for AI-built software** with four pillars:

| Pillar | Question answered | Differentiator |
|---|---|---|
| **Map** | What is this app, in product terms? | Feature-level map, not a dependency graph |
| **Point** | What code is behind *this thing on screen*? | Click-to-code in the live preview |
| **Story** | What did the agent just do, and why? | Session → intent → semantic diff |
| **Blast radius** | What could this break? | Provenance-weighted impact analysis |

**Architecture in one sentence.** A *local-first, evidence-graded, snapshot-versioned* software model built in three layers — **Facts** (deterministic) → **Structures** (flows/features, heuristic + clustered) → **Narrative** (LLM, grounded and verified) — with intent capture from agent sessions and a small MCP surface so agents and humans share the same model.

---

## 2. Evaluation of the Problem Statement

### 2.1 What is strong

- **The paradox is accurate and memorable:** *easier to build, harder to understand.* This is a durable framing.
- **Multi-perspective breakdown** (Product / Design / System / Code / Change) is a good scaffold for the product surface.
- **The "Core Gap" insight** — code tools show code, agents show diffs, design tools show UI, nothing connects them — is the real wedge.

### 2.2 What is weak or missing

| Gap | Why it matters |
|---|---|
| **No segmentation by willingness to pay.** | "Vibe coders" feel the pain most but have the least budget and often the least ability to act on a diagram. Teams inheriting AI code and engineers reviewing agent PRs feel it *and* pay. |
| **No evidence of current workarounds.** | Today people ask the agent "explain this repo," read READMEs, or scroll diffs. The product must beat these *on speed and trust*, not on prettiness. |
| **Problem conflates "understanding" with "confidence."** | Users often don't need to understand everything; they need to know *what changed, whether it is safe, and where to look.* Understanding is the means; **confident control** is the end. |
| **No success definition.** | "Better mental model" must be operationalized (see §13). |
| **Time dimension underspecified.** | The sharpest pain is *drift*: the model in your head was right last week. The problem is a **diff problem** as much as a **map problem**. |

### 2.3 Refined problem statement

> AI agents modify software faster than humans can track. Developers lose the ability to answer, quickly and with evidence: **What is this app made of? Where does this behavior live? What just changed and why? What might it break?** — and therefore either over-trust the agent or become afraid to touch the code.

### 2.4 Segments, ranked by product-market fit

| Rank | Segment | Pain | Pays? | Notes |
|---|---|---|---|---|
| 1 | **Engineers/leads reviewing agent-authored PRs and sessions** | Review fatigue; can't verify intent vs. result | Yes (team budget) | Best early revenue and the sharpest "Story" use case |
| 2 | **Teams inheriting AI-generated codebases** | Onboarding to code nobody wrote | Yes (project-based) | Strong "Map" use case |
| 3 | **Solo builders / vibe coders (Lovable, Bolt, v0, Cursor, Claude Code)** | Fear of touching working code | Low–medium | Best for virality and bottom-up growth; "Point" is the hook |
| 4 | **Product/design people** | Can't connect UI to implementation | Indirect | Served by "Point" and plain-language Map |

**Recommendation:** Lead with #3 for adoption (free/cheap, click-to-code is magical), monetize via #1 and #2 (team features: shared model, review stories, policies).

### 2.5 Competitive landscape (verify before external use)

Adjacent products already cover pieces of this: AI repo-wiki/Q&A tools (e.g., DeepWiki-style), code search & intelligence platforms (Sourcegraph), AI PR reviewers (CodeRabbit, Greptile, Graphite-style), living-docs tools (Swimm, Mintlify), and the agents' own built-in maps/summaries. The older code-visualization category has a poor survival record. **The gap that remains open:** *persistent, evidence-graded, intent-linked, diff-aware understanding* shared by human and agent. Position there; do not position as "architecture diagrams" or "AI code review."

---

## 3. Evaluation of the Proposed Solution

### 3.1 What to keep

| Idea | Verdict |
|---|---|
| Persistent model first, LLM explains second | **Keep. Core principle.** |
| Deterministic analysis (Tree-sitter, LSP) before AI | **Keep.** |
| Evidence/"why do you think that?" on every claim | **Keep, and make structural** (see §4). |
| Progressive disclosure (Product → Feature → Code) | **Keep.** Avoid giant graphs. |
| "What changed?" as a primary screen | **Keep and elevate** to a headline pillar. |
| MCP server so agents query the same model | **Keep, but small and carefully designed.** |
| Start with one spectacular workflow | **Keep.** |

### 3.2 What to change

| Original | Problem | Change |
|---|---|---|
| Feature/flow nodes presented as natural outputs | They don't exist in code. Inferring them is research-grade. | Define explicit **flow extraction** from entry points + clustering + human correction (§10). |
| Confidence tiers assigned by the system/LLM | An LLM grading its own confidence is unreliable. | Derive confidence from **edge provenance** (extracted / resolved / heuristic / observed / inferred). |
| Mutable graph updated in place | "Before/after" and time travel are hard; entity identity breaks on renames. | **Immutable per-commit snapshots** with content-addressed facts and a stable-identity layer. |
| OpenTelemetry runtime as a major layer | Most target users have no telemetry. | Runtime is an **optional enhancer**; ship **dev-time preview instrumentation** first. |
| Language-agnostic claim | Cross-boundary links (fetch → route → ORM → table) are framework-specific. | **Framework adapters**, start with one stack. |
| Cloud-ingest assumed | Source-code trust is a top adoption blocker. | **Local-first indexer**; sync graph metadata, not source, by default. |
| Hybrid UX but no design/UI mapping | Ignores the "Design perspective" in the problem statement. | Add **Live Preview click-to-code**. |
| MCP Apps as second channel | Host support varies; premature. | Defer; text/structured MCP tools first. |
| No eval plan | Can't tell if flows are correct or users understand more. | Add **golden repos + comprehension tests** (§13). |

### 3.3 Missed opportunities

1. **Intent provenance** — linking *prompt → session → diff → feature*. Nobody else systematically stores this. It is the "why" that the problem statement lists and the solution barely touches.
2. **Architecture diff** — showing structural change (new boundary, new dependency, new table) rather than file change. Enabled by snapshots.
3. **Drift detection** — compare the *declared* intent/spec (design doc, PRD, agent plan) against the *actual* model.
4. **Health signals** — coupling hot spots, duplicated logic, orphaned code, "agent-churn" areas. Directly addresses "fragile" and "duplicated logic" in the problem statement.
5. **Learn mode** — explain at the reader's level (designer, junior, senior). A deliberate answer to the vibe-coder segment.

---

## 4. Critique of the Proposed Architecture

### 4.1 Strengths

- Correct layering: parse → symbols → graph → explain.
- Right initial storage choice (Postgres, relational edges, pgvector). A graph DB is premature.
- Good staging of integration levels (GitHub → CLI → MCP).
- UX principle "progressive disclosure" is architecturally implied (hierarchical entities).

### 4.2 Weaknesses

**W1 — The semantic gap is hand-waved.**
The diagram moves from "AST + LSP + traces" to "Product → Screens → Components → Logic → APIs → DB" in one box. In reality this requires:
- resolving `fetch("/api/pay")` strings to route handlers,
- resolving DI containers, dynamic imports, HOCs, hooks,
- mapping ORM calls to tables,
- grouping thousands of symbols into "features."
None of these are provided by Tree-sitter or LSP. This is the product's actual engineering challenge and needs its own subsystem (**Resolver + Framework Adapters + Flow Builder**).

**W2 — Confidence is not grounded.**
High/medium/low confidence "from the system" invites false precision. Needs an *edge-level provenance* model that is computed mechanically.

**W3 — Mutable graph.**
Updating a single live graph loses history, complicates "what changed," and makes rename tracking ad hoc. A versioned snapshot design is simpler and enables the change story.

**W4 — No intent capture.**
"Agent sessions" appear as a node type with no defined ingestion path (hooks, transcripts, git trailers, PR metadata).

**W5 — Runtime-first thinking.**
OTel traces are valuable but require instrumentation and production access most target users lack. The more accessible runtime signal is the **dev-server preview** (DOM ↔ component ↔ source).

**W6 — Over-scoped stack.**
Redis queue, S3, multi-LLM abstraction, LSP for many languages, MCP Apps, and OTel before product validation. Risk: building infrastructure for a product that hasn't proven its core loop.

**W7 — Cost & latency unaddressed.**
Per-node LLM summaries on every push can become expensive. Requires content-hash caching and bounded narration.

**W8 — Entity identity.**
Not addressed: what makes `AuthService` "the same thing" after a rename/move/split? Without it, history and diff are unreliable.

**W9 — Trust & security.**
Sending customer source to a SaaS indexer is a major objection. Also unaddressed: **prompt-injection through repo content** into MCP responses and into the LLM narrator.

**W10 — No quality measurement.**
No way to say "flow extraction is 85% correct on Next.js apps" or "users find the cause of a bug 2× faster."

**W11 — Tool surface is large.**
Seven-plus MCP tools with overlapping semantics tends to be misused by agents. Fewer, outcome-oriented tools perform better.

### 4.3 Net assessment

A good conceptual architecture, a weak *engineering* architecture. The redesign keeps its spine and adds: a **Resolver/Adapter layer**, **provenance-based confidence**, **snapshots + stable identity**, **intent capture**, **local-first indexing**, **preview bridge**, and an **evaluation harness**.

---

## 5. Product Name

### 5.1 Criteria
Short; evokes *seeing/understanding* rather than *generating*; works as a CLI (`sightline init`); not locked to "AI" or "code."

### 5.2 Shortlist

| Name | Meaning | Pros | Cons |
|---|---|---|---|
| **Sightline** *(recommended)* | The line of sight into your system | Clear promise ("see what your AI built"); good CLI; works for human + agent | Common word; trademark crowded |
| **Ken** | "Beyond my ken" = range of understanding | Very short; memorable | Ambiguous; hard to search |
| **Plumbline** | Measuring true vertical; depth/verification | Evokes checking against truth | Slightly dated |
| **Wayfound** | Finding your way in a system | Friendly; navigation metaphor | Weak for enterprise |
| **Tessera** | Mosaic tile; many parts into a picture | Distinct; brandable | Obscure meaning |
| **Cartog** | From cartography | Short; map metaphor | Awkward |

**Recommendation:** **Sightline**. Tagline options:
- *"See what your AI built."*
- *"Understand your code at the speed it's written."*
- *"The map, the story, and the blast radius."*

> Action: run trademark, domain, and package-registry checks before committing; none were verified here.

---

## 6. Refined Product Definition

**Sightline is a comprehension and control layer for AI-assisted software development.** It continuously builds an evidence-backed model of a codebase and lets a human (and the human's coding agent) answer four questions:

1. **Map** — *What is this app made of, in product terms?*
2. **Point** — *What code is behind this thing I see?*
3. **Story** — *What did the agent change, and why?*
4. **Blast radius** — *What could this affect?*

### 6.1 Principles

1. **Evidence over eloquence.** Every statement is traceable to code, diffs, sessions, or runtime observations.
2. **Deterministic first, LLM last.** The LLM narrates the model; it never invents it.
3. **Product vocabulary first, code vocabulary on demand.** Default views use feature names; code is one click away.
4. **Diff-native.** Time and change are first-class, not an afterthought.
5. **Human and agent share one model.** What the human sees is what the agent queries.
6. **Local-first, trust-by-default.** Source stays on the machine unless the user opts in.
7. **Small surface, high precision.** Fewer features that are correct beat many that are plausible.

### 6.2 Non-goals

- Not an AI code reviewer (it informs review; it doesn't replace it).
- Not general documentation generation.
- Not a code editor or agent.
- Not a universal architecture-diagram tool for arbitrary languages in v1.

---

## 7. Product Specification

### 7.1 Personas

| Persona | Goal | Primary surfaces |
|---|---|---|
| **Maya — Solo vibe coder** | Change things without breaking them | Point, Map, Learn mode |
| **Dev — Engineer reviewing agent PRs** | Verify intent vs. result fast | Story, Blast radius |
| **Priya — Tech lead inheriting a project** | Onboard the team | Map, Health |
| **Sam — Designer/PM** | Connect UI to implementation | Point, Map (plain language) |

### 7.2 Core user journeys

**J1 — First understanding (Map).**
Connect repo or run `sightline init` → index in minutes → see a *product-level map* (Auth, Dashboard, Billing…) → click **Billing** → see its flow → click any node → see code + evidence + plain-language explanation.

**J2 — Point at the UI.**
Open live preview → toggle **Inspect** → click a button → Sightline shows: component, file, handler, API call, backend route, DB tables touched, and last agent session that modified it.

**J3 — Review an agent session (Story).**
Agent finishes "Add Google login" → Sightline presents a **session story**: intent, structural changes (new components, routes, migration), modified modules, affected flows, tests run, and items needing human attention. One-click "ask about this change."

**J4 — Before the agent edits (Blast radius).**
Agent calls `orient("refactor authentication")` → receives affected features, high-risk files, relevant prior sessions, and verification checklist; the human sees the same panel in the UI and can approve or constrain scope.

**J5 — Ask.**
"How does signup work?" → answer is a **rendered flow** with cited nodes, not a paragraph.

**J6 — Health.**
Weekly digest: new coupling hot spots, duplicated logic clusters, orphaned code, areas with highest agent churn.

### 7.3 Feature specification

#### F1. Product Map
- 3-level semantic zoom: **Product → Feature → Implementation**.
- Max ~12 nodes visible at any level (enforced); overflow groups collapse.
- Nodes carry: name, one-line description, risk badge, last-change badge, evidence count.
- User can **rename, merge, split, pin** features; edits persist as overrides and survive re-indexing.

#### F2. Flow View
- Ordered path from entry point (UI event / route / job) to boundary (DB / external).
- Each step: type icon, name, file:line, edge provenance chip (e.g., `resolved`, `heuristic`, `observed`).
- Side panel: *Creates/Touches* (entities, tables), *External services*, *Recent changes*, *Risk*.

#### F3. Live Preview Click-to-Code ("Point")
- Dev-server bridge maps DOM element → React component → source location.
- Click shows component tree path, props/state names, event handler, network calls triggered, and downstream flow.
- Works inside the web app (iframe/proxy) and as a browser overlay.

#### F4. Session Story ("Story")
- Built from agent intent + git diff + graph snapshot diff.
- Sections: **Intent**, **What was added/changed/removed (structural)**, **Affected flows**, **Tests**, **Needs attention**.
- Structural diff categories: new boundary, new dependency, new table/column, changed contract (API/type), changed ownership of logic, deleted code with remaining references.
- Review actions: *mark understood*, *flag*, *ask*, *revert hunk (via agent)*.

#### F5. Blast Radius
- Input: file, symbol, feature, or natural-language change proposal.
- Output: ranked impacted flows with **path evidence and provenance**, plus suggested verifications.
- Distinguishes **certain** (extracted/resolved) from **possible** (heuristic/inferred) impacts.

#### F6. Ask
- Q&A restricted to retrieval over the graph + code. Answers are structured: flow/diagram + cited entities.
- Every sentence has expandable "Why?" showing evidence and provenance.

#### F7. Health
- Coupling, cycles, duplication clusters, dead code, agent-churn heatmap, "unexplained" modules (no intent linked).

#### F8. Learn Mode
- Explanation level selector (Designer / Beginner / Experienced).
- Glossary hover on technical terms; "what would break if I removed this?" in plain language.

#### F9. Agent Integration
- MCP server (§11), Claude Code hooks / agent session ingestion, git trailer convention (`Sightline-Session: <id>`).

### 7.4 Evidence & provenance UX

| Chip | Meaning | Source |
|---|---|---|
| ● **Extracted** | Directly in syntax | Tree-sitter |
| ● **Resolved** | Confirmed by symbol/type resolution | SCIP/LSP |
| ◐ **Heuristic** | Framework/pattern match (e.g., route string) | Adapters |
| ◉ **Observed** | Seen at runtime (dev preview/OTel) | Runtime |
| ○ **Inferred** | LLM interpretation | Narrator |

Rule: **the UI never presents an inferred edge visually identical to an extracted one.** Dashed vs. solid.

### 7.5 Non-functional requirements

| Area | Target |
|---|---|
| Initial index (50k LOC TS app) | < 2 min locally |
| Incremental update on save | < 2 s for structure; narrative updates lazily |
| Map render | < 1 s; ≤ 12 visible nodes per level |
| LLM cost | Narration cached by content hash; bounded per snapshot |
| Privacy | Source never leaves machine by default |
| Availability (cloud) | Graph viewing independent of LLM availability |

### 7.6 Success metrics

| Metric | Definition |
|---|---|
| **Time-to-orientation** | Time for a new user to correctly locate where a given behavior lives (A/B vs. baseline) |
| **Flow accuracy** | Precision/recall of extracted flows vs. golden labels |
| **Review time saved** | Time to review an agent session with/without Story |
| **Trust calibration** | Do users' accept/reject decisions improve (fewer regressions) |
| **Weekly active repos** | Repos with ≥ 1 Sightline interaction/week |
| **Agent query rate** | MCP calls per agent session |

---

## 8. System Architecture (v2)

### 8.1 Design principles

1. **Three layers: Facts → Structures → Narrative.** Each layer depends only on the one below and has a different trust level.
2. **Immutable snapshots.** Every commit/working-tree state yields a graph snapshot; changes are diffs between snapshots.
3. **Provenance on every edge.** Confidence is derived, never asserted.
4. **Local-first indexing**, optional cloud sync.
5. **Pluggable adapters** for frameworks; the core is language-neutral, the adapters are not.
6. **Grounded generation.** LLM output must cite entity IDs and pass a verifier.

### 8.2 High-level view

```text
                     ┌────────────────────────────────────────────────┐
                     │                 SOURCES OF TRUTH               │
                     │                                                │
   Git / GitHub ─────┤  commits • diffs • PRs                         │
   Working tree ─────┤  file watcher (CLI/daemon)                     │
   Agent sessions ───┤  hooks • transcripts • MCP • git trailers      │
   Dev preview ──────┤  DOM↔component↔source • network calls          │
   Prod telemetry ───┤  OpenTelemetry (optional)                      │
                     └───────────────────────┬────────────────────────┘
                                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     LOCAL INDEXER  (CLI / daemon, runs on dev machine)    │
│                                                                           │
│  LAYER 1 — FACTS (deterministic)                                          │
│   ├─ Tree-sitter: syntax, exports/imports, calls, JSX, string literals    │
│   ├─ SCIP / LSP indexers: resolved symbols, definitions, references, types│
│   └─ Content-addressed per-file fact cache (hash → facts)                 │
│                                                                           │
│  LAYER 2 — STRUCTURES (heuristic + algorithmic)                           │
│   ├─ Framework Adapters (Next.js, Express, Prisma, Supabase, …)           │
│   ├─ Cross-boundary Resolver (fetch→route, handler→service, ORM→table)    │
│   ├─ Entry-point Detector (pages, routes, handlers, jobs, webhooks)       │
│   ├─ Flow Builder (bounded traversal, boundary stops, noise collapse)     │
│   ├─ Module/Feature Clusterer (graph communities + paths + naming hints)  │
│   └─ Stable Identity Matcher (renames/moves/splits across snapshots)      │
│                                                                           │
│  Output: Snapshot = entities + edges(with provenance) + flows + modules   │
└──────────────────────┬────────────────────────────────────────────────────┘
                       │  (graph metadata; source optional)
                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         SIGHTLINE CORE SERVICE                            │
│                                                                           │
│  Snapshot Store (Postgres)      Intent Store        Override Store        │
│   entities / edges / flows      sessions→diffs      human edits to        │
│   snapshots / diffs             →features           names/groupings       │
│                                                                           │
│  Change Engine                  Impact Engine        Health Engine        │
│   snapshot diff → semantic      reverse traversal    coupling, dup,       │
│   change classification         weighted by          churn, orphan        │
│                                 provenance                                │
│                                                                           │
│  LAYER 3 — NARRATIVE (LLM, grounded)                                      │
│   ├─ Narrator: names, summaries, session stories, Q&A                     │
│   ├─ Grounding verifier: cited IDs exist, edges support claims            │
│   └─ Cache keyed by (entity content hash, prompt version, level)          │
└───────────────┬──────────────────────────┬────────────────────────────────┘
                │                          │
                ▼                          ▼
      ┌──────────────────┐        ┌────────────────────┐
      │   WEB APP        │        │    MCP SERVER      │
      │ Map • Flow •     │        │ orient • explain • │
      │ Point • Story •  │        │ impact • changes • │
      │ Ask • Health     │        │ session            │
      └──────────────────┘        └────────────────────┘
```

### 8.3 Component responsibilities

| Component | Responsibility | Notes |
|---|---|---|
| **File Watcher / Git Hook** | Detect changes, trigger incremental index | Debounced; per-file hash check |
| **Tree-sitter Layer** | Fast, incremental syntax facts | Language grammars as plugins |
| **SCIP/LSP Layer** | Resolved symbols/references/types | Prefer SCIP indexers where available for batch accuracy |
| **Fact Cache** | Avoid recomputation | Key: file content hash + extractor version |
| **Framework Adapters** | Understand routes, components, hooks, ORM models, auth middleware | Versioned plugin API; community-extensible |
| **Cross-boundary Resolver** | Link client calls to server handlers, handlers to DB entities, to external SDKs | Emits edges with `heuristic` provenance + match reason |
| **Entry-point Detector** | Find user-/system-triggered starting points | Pages, routes, event handlers, cron, queue consumers, webhooks |
| **Flow Builder** | Build ordered traversals from entry points to boundaries | Depth/width bounds; collapses utilities/logging |
| **Clusterer** | Group into Features/Modules | Community detection + folder/route structure + naming hints; human overrides win |
| **Identity Matcher** | Persist entity identity across snapshots | Symbol path + content similarity + git rename info |
| **Snapshot Store** | Versioned graph | Postgres; snapshots share unchanged rows via content hashes |
| **Intent Store** | Sessions, prompts/plans, diffs, links to features | Optional redaction of prompts |
| **Change Engine** | Classify structural change between snapshots | Rule-based first; LLM only for narration |
| **Impact Engine** | Transitive impact with provenance weighting | Returns certain vs. possible |
| **Health Engine** | Metrics and hot spots | Graph algorithms |
| **Narrator + Verifier** | Language output grounded in entities | Rejects/repairs ungrounded claims |
| **Preview Bridge** | Dev-time DOM↔source mapping & network capture | Build-plugin or fiber-based; dev only |
| **Web App** | Visual product | See §7 |
| **MCP Server** | Agent access | See §11 |

### 8.4 Layered trust model

| Layer | Produced by | Failure mode | Treated as |
|---|---|---|---|
| **Facts** | Parsers, SCIP/LSP | Parse gaps, unsupported syntax | Ground truth |
| **Structures** | Adapters, resolver, clusterer | Wrong grouping, missed dynamic dispatch | "Best-effort, labelled, editable" |
| **Narrative** | LLM | Hallucination, overgeneralization | "Explanation; must cite structures/facts" |

A bug in a higher layer must never corrupt a lower layer. Re-running Layer 3 is cheap; re-running Layer 1 is cached.

### 8.5 Deployment modes

| Mode | Description | Who |
|---|---|---|
| **Local-only** | Indexer + local DB (SQLite/embedded Postgres) + local web UI | Privacy-sensitive, solo |
| **Hybrid (default)** | Local indexer; graph metadata synced to cloud; source stays local, fetched on demand | Most users |
| **Cloud** | GitHub App indexes in managed workers | Teams that prefer zero-install |

### 8.6 Technology choices (revised)

| Concern | Choice | Rationale |
|---|---|---|
| Indexer runtime | TypeScript (Node) initially; Rust for hot paths later | Fast iteration; Tree-sitter bindings available |
| Parsing | Tree-sitter | Incremental, multi-language |
| Symbol resolution | SCIP indexers / TypeScript compiler API / LSP | Accuracy for the first target stack |
| Storage | Postgres (cloud); SQLite or embedded PG (local) | Relational edges + recursive queries are enough for v1 |
| Search | Postgres FTS + pgvector for retrieval seeds | Graph traversal does the real work |
| Queue (cloud) | Postgres-backed queue first | Avoid Redis until needed |
| Web | Next.js + React; React Flow for graph canvas; custom layout for Map | Mature, fast to build |
| LLM | Provider-abstracted; structured output with entity-ID citations | Avoid lock-in; enable verifier |
| Agent interface | MCP (stdio + HTTP) | Verify the latest spec revision before building; do not depend on optional UI extensions |
| Runtime (optional) | OpenTelemetry ingest | Phase 3+ |

### 8.7 Event flow: an agent session end-to-end

```text
1. Session start
   agent ──► sightline.session(start, intent="Add Google login")
             └─ Intent Store: new session S

2. Orientation
   agent ──► sightline.orient("Add Google login")
             └─ returns affected features, risks, prior sessions

3. Agent edits files
   file watcher ──► incremental index ──► working-tree snapshot W

4. Session end
   agent ──► sightline.session(end, summary=…)
             └─ link S ↔ (base snapshot B, result snapshot R)

5. Change Engine
   diff(B, R) ──► semantic changes ──► classified
   Impact Engine ──► affected flows (certain vs possible)
   Narrator ──► session story (grounded, verified)

6. Human review
   Web UI: Story page; MCP: `changes` for follow-up sessions
```

---

## 9. Data Model

### 9.1 Entity kinds

```text
Product
 └─ Feature (human-meaningful capability)
     ├─ Flow (entry point → … → boundary)
     └─ Module (cohesive code grouping)
          ├─ File
          └─ Symbol (component, function, class, hook, type, route, query, table, external_service)
Session (agent) ── produced ──► Change set ── touches ──► Symbols / Features
```

### 9.2 Edge kinds

`imports`, `calls`, `renders`, `uses_hook`, `handles_event`, `requests` (client→route), `routes_to` (route→handler), `reads`, `writes` (code→table/column), `uses_service` (code→external), `defines`, `belongs_to` (symbol→module→feature), `modified_by` (symbol→session), `implemented_by` (feature→session).

### 9.3 Provenance (on every edge)

```text
EXTRACTED   – present in syntax
RESOLVED    – confirmed by symbol/type resolution
HEURISTIC   – adapter/pattern match (with reason string)
OBSERVED    – seen at runtime
INFERRED    – LLM-proposed (never used for impact certainty)
HUMAN       – user-asserted override
```

Derived confidence: `RESOLVED/EXTRACTED/OBSERVED/HUMAN > HEURISTIC > INFERRED`. Path confidence = weakest edge on the path.

### 9.4 Relational schema (sketch)

```sql
-- Identity is stable across snapshots; state is per snapshot.
CREATE TABLE entity (
  id            uuid PRIMARY KEY,
  repo_id       uuid NOT NULL,
  kind          text NOT NULL,            -- component|function|route|table|feature|...
  canonical_key text NOT NULL,            -- language-qualified symbol path
  created_snapshot uuid NOT NULL,
  UNIQUE (repo_id, kind, canonical_key)
);

CREATE TABLE snapshot (
  id          uuid PRIMARY KEY,
  repo_id     uuid NOT NULL,
  git_sha     text,                       -- null for working-tree snapshots
  parent_id   uuid REFERENCES snapshot(id),
  kind        text NOT NULL,              -- commit|working_tree|session_result
  created_at  timestamptz NOT NULL
);

-- State of an entity within a snapshot; unchanged rows reused via content_hash.
CREATE TABLE entity_state (
  snapshot_id  uuid REFERENCES snapshot(id),
  entity_id    uuid REFERENCES entity(id),
  content_hash text NOT NULL,
  file_path    text,
  start_line   int, end_line int,
  attrs        jsonb,
  PRIMARY KEY (snapshot_id, entity_id)
);

CREATE TABLE edge (
  snapshot_id  uuid REFERENCES snapshot(id),
  src          uuid REFERENCES entity(id),
  dst          uuid REFERENCES entity(id),
  kind         text NOT NULL,
  provenance   text NOT NULL,             -- EXTRACTED|RESOLVED|HEURISTIC|OBSERVED|INFERRED|HUMAN
  reason       text,                      -- e.g. "string match /api/pay → app/api/pay/route.ts"
  evidence     jsonb,                     -- locations, trace ids
  PRIMARY KEY (snapshot_id, src, dst, kind)
);

CREATE TABLE flow (
  id uuid PRIMARY KEY, snapshot_id uuid, entry_entity uuid,
  steps jsonb,                            -- ordered [{entity, edge_kind, provenance}]
  min_provenance text                     -- weakest link
);

CREATE TABLE session (
  id uuid PRIMARY KEY, repo_id uuid, agent text, intent text,
  base_snapshot uuid, result_snapshot uuid,
  started_at timestamptz, ended_at timestamptz,
  transcript_ref text                     -- optional, redactable
);

CREATE TABLE override (                   -- human edits survive re-indexing
  id uuid PRIMARY KEY, repo_id uuid, target_entity uuid,
  kind text,                              -- rename|merge|split|pin|hide
  payload jsonb, created_by uuid, created_at timestamptz
);

CREATE TABLE narrative (
  entity_id uuid, content_hash text, prompt_version text, level text,
  text text, citations uuid[], verified boolean,
  PRIMARY KEY (entity_id, content_hash, prompt_version, level)
);

CREATE TABLE runtime_observation (
  id uuid PRIMARY KEY, repo_id uuid, kind text, src uuid, dst uuid,
  count int, first_seen timestamptz, last_seen timestamptz, source text
);
```

### 9.5 Query patterns

- **Flow retrieval:** index on `(snapshot_id, entry_entity)`; flows are **materialized**, not recomputed per request.
- **Impact:** recursive CTE over reversed edges with depth limit and provenance filter; results cached per `(snapshot, entity)`.
- **Diff:** join `entity_state` on `entity_id` across two snapshots by `content_hash`; edges via set difference.
- **Retrieval for Ask:** FTS + embeddings choose *seed entities*; graph traversal expands context.

---

## 10. Core Algorithms

### 10.1 Flow extraction

```text
Input: snapshot graph, adapters
1. Detect entry points
   - UI: page/route components, event handlers (onClick, onSubmit)
   - Server: HTTP route handlers, server actions, webhooks
   - System: cron, queue consumers
2. For each entry point E:
   a. Traverse outgoing edges (calls, renders, uses_hook, requests, routes_to, reads/writes)
   b. Stop at boundaries: DB/table, external service, framework internals
   c. Collapse noise: logging, formatting, utility libs, trivial wrappers
   d. Bound depth/width; record truncation
   e. Record min provenance along the path
3. Merge duplicate flows sharing the same spine
4. Attach flow to candidate Feature (§10.2)
5. Persist as materialized flow
```

Key choices: flows are **paths with provenance**, not just reachable sets; truncation is visible to the user.

### 10.2 Feature / module clustering

Signals combined with weights:
1. **Route & folder structure** (e.g., `/billing/*`, `features/auth/`)
2. **Graph communities** (modularity-based) over call/render/data edges
3. **Shared data entities** (symbols touching the same tables)
4. **Naming hints** (identifier tokens, route segments, table names)
5. **Human overrides** (highest priority)

LLM role: **name and describe** each cluster using its member symbols; it does not decide membership. Re-clustering after a change is **stability-constrained**: keep prior assignments unless evidence shifts materially, to avoid map "flicker."

### 10.3 Cross-boundary resolution

| Link | Technique | Provenance |
|---|---|---|
| `fetch("/api/x")` → route handler | Normalize URL pattern; match against adapter-discovered routes | HEURISTIC (reason stored) |
| Typed client (tRPC/OpenAPI/generated) → handler | Follow generated types/symbols | RESOLVED |
| Handler → service | Symbol resolution | RESOLVED |
| ORM call → table | Adapter model (Prisma schema, Supabase typed client) | HEURISTIC→RESOLVED |
| Server action → component usage | Framework convention | HEURISTIC |
| Unresolvable dynamic call | Emit **unresolved edge** (visible gap) | n/a |

Unresolved edges are a **feature**: the UI shows "this path continues dynamically," preventing false completeness.

### 10.4 Stable identity

```text
For each entity in new snapshot:
  1. Exact canonical_key match → same entity
  2. Else git rename/move info → same entity
  3. Else content similarity (AST fingerprint) above threshold within same module → same entity
  4. Else new entity; unmatched old → marked removed
Splits/merges detected when multiple fingerprints map to one/many → recorded as events
```

### 10.5 Semantic change classification (rule-based)

| Change type | Detection |
|---|---|
| **New boundary** | New edge to external_service/table kinds |
| **New route/API** | New route entity |
| **Contract change** | Signature/schema difference on exported symbol or route |
| **New dependency** | New package/import across module boundary |
| **Moved logic** | Entity identity preserved, module changed |
| **Dangling reference** | Deleted entity still referenced |
| **Cross-feature coupling** | New edge between previously unconnected features |

The LLM turns the classified list into a readable story. It does not decide what changed.

### 10.6 Impact analysis

```text
impact(target):
  frontier = {target}
  traverse reverse edges up to depth N
  score(path) = product(weight(provenance of each edge))
     EXTRACTED/RESOLVED/OBSERVED/HUMAN = 1.0, HEURISTIC = 0.6, INFERRED = 0.2
  group by flow/feature
  output: CERTAIN (score ≥ 0.9), LIKELY (0.5–0.9), POSSIBLE (< 0.5)
  attach: suggested verifications (flows to exercise), existing tests mapped to the flow if available
```

### 10.7 Grounded narration & verification

1. Narrator receives **only**: target entities, their edges (with provenance), and code snippets.
2. Must output structured JSON: `claims[] = { text, cited_entity_ids[], cited_edge_ids[] }`.
3. Verifier checks: IDs exist in snapshot; claim keywords consistent with cited entities; no cited edge is `INFERRED` presented as fact.
4. Failures → regenerate with feedback once; otherwise render as "unverified" or omit.
5. Cache by `(entity content hash, prompt version, level)`.

### 10.8 Preview bridge (Point)

```text
Dev server + build plugin
 ├─ Annotates JSX with source locations (dev only) or reads React fiber debug source
 ├─ Overlay captures click → element → component → source
 ├─ Network observer records requests triggered by the interaction
 └─ Sends to Core: (element path, component entity, request→route matches)
Result: OBSERVED edges for UI→API plus the instant answer to "what code is this?"
```

---

## 11. Agent Integration (MCP & Hooks)

### 11.1 Design stance
- **Few tools, outcome-oriented, token-bounded.** Each returns compact structured data plus links to the web UI for depth.
- **Treat repo-derived text as untrusted.** Responses mark content origin; never include raw repo instructions as tool guidance.
- Verify the current MCP specification revision before implementation; avoid dependence on optional UI extensions initially.

### 11.2 Tools

| Tool | Purpose | Returns |
|---|---|---|
| `orient(task)` | Before starting work | Relevant features, entry points, high-risk files, prior related sessions, verification checklist |
| `explain(target)` | Understand a feature/symbol/flow | Flow summary with cited entities and provenance |
| `impact(target \| change_description)` | Blast radius | Certain/likely/possible impacts with paths |
| `changes(since?)` | What changed (structurally) | Classified change list, linked sessions |
| `session(start \| end, intent, summary)` | Intent capture | Session ID; links to snapshots |

Five tools. Search is folded into `orient` and `explain`.

### 11.3 Other agent hooks
- **Claude Code hooks / equivalent:** post-edit event → incremental index; session start/end → intent capture.
- **Git trailer:** `Sightline-Session: <id>` for traceability in PRs.
- **PR comment (GitHub App):** posts Session Story summary and Blast Radius on agent-authored PRs.

### 11.4 Safety
- Allow-listed, read-only by default.
- No tool executes code or edits files.
- Rate/size limits; redact secrets from snippets (pattern + entropy scanning at index time).

---

## 12. Security & Privacy

| Concern | Mitigation |
|---|---|
| Source code exposure | Local-first indexing; graph metadata sync; source fetched on demand with user consent; per-repo opt-in for cloud storage of snippets |
| Secrets in code/prompts | Index-time secret scanning; never embed or send flagged ranges to LLMs |
| LLM data handling | Zero-retention provider options; configurable provider; local model option for Narrator |
| Prompt injection via repo content | Narrator system prompt isolates code as data; verifier rejects instructions; MCP responses tagged as untrusted content |
| Multi-tenant isolation | Per-repo row-level security; per-tenant encryption keys (enterprise) |
| Intent data sensitivity | Transcripts optional, redactable, retention-configurable |
| Supply chain (adapters/plugins) | Signed, versioned adapters; sandboxed execution |
| Compliance | SOC 2 path for cloud; self-host option for enterprise |

---

## 13. Quality & Evaluation

### 13.1 Golden repositories
Curate 15–30 representative repos (Next.js + Prisma, Next.js + Supabase, Express + Postgres, Vite + Firebase, etc.), including **real agent-generated apps**. Hand-label: features, flows, route↔call links, table touches.

### 13.2 Automated metrics

| Metric | Method |
|---|---|
| Entity extraction recall | Compare to compiler/LSP symbols |
| Cross-boundary link precision/recall | Against labelled links |
| Flow precision/recall | Match labelled flows (step overlap) |
| Feature clustering quality | Adjusted Rand / human acceptance rate of names & groupings |
| Identity stability | Rename/move test suite with known ground truth |
| Narration groundedness | % claims with valid citations; adversarial hallucination tests |
| Change classification accuracy | Synthetic diffs with known classes |

### 13.3 Human comprehension studies
- **Task:** "Find where X happens", "What would break if Y changes?", "Explain what the agent did."
- **Compare:** baseline (IDE + agent chat) vs. Sightline.
- **Measure:** time, correctness, confidence calibration.
- Run with each persona; run again after every major release.

### 13.4 Continuous regression
Every release re-indexes all golden repos; metrics gate merges. Flow/cluster diffs between versions are reviewed for unintended map changes.

---

## 14. Roadmap

### Phase 0 — Prove the core (4–6 weeks)
**Stack:** TypeScript + React + Next.js only. **Deliver:** CLI indexer → Facts + Next.js adapter → Product Map → Flow View. No LLM except naming.
**Exit:** On 10 golden repos, ≥ 80% of top-level features correctly named/grouped; ≥ 70% flow recall; testers locate behavior ≥ 2× faster than baseline.

### Phase 1 — Point & Story (6–8 weeks)
Preview bridge (click-to-code), session capture for one agent (Claude Code), snapshots + semantic diff, Session Story, evidence/provenance UI.
**Exit:** Reviewers complete agent-session review measurably faster with equal or better defect detection.

### Phase 2 — Agent loop & teams (6–8 weeks)
MCP server (5 tools), GitHub App (PR Story + Blast Radius), shared overrides, Health v1, second stack (Express/Prisma or Supabase).
**Exit:** Agents call `orient` in majority of sessions for opted-in repos; team retention.

### Phase 3 — Depth (ongoing)
Runtime observations (OTel), drift detection vs. specs/PRDs, Learn mode, more adapters, self-host/enterprise, additional agents, optional MCP interactive UI.

### Explicitly deferred
Graph database, multi-language parity, MCP Apps as a primary surface, production telemetry as a requirement, autonomous remediation.

---

## 15. Business Considerations

### 15.1 Positioning
- **Category:** Comprehension & control layer for AI-assisted development.
- **Against code review bots:** they judge diffs; Sightline explains systems and intent.
- **Against repo-wiki tools:** they generate static docs; Sightline maintains a live, evidence-graded, diff-native model.
- **Against agents' own summaries:** a neutral, persistent model that spans agents and sessions.

### 15.2 Packaging (indicative)

| Tier | Includes |
|---|---|
| **Free** | Local indexer, Map, Flow, Point for 1 repo |
| **Pro** | Unlimited repos, Story, Blast Radius, Learn mode, MCP |
| **Team** | Shared model & overrides, GitHub App, PR stories, Health, SSO |
| **Enterprise** | Self-host, audit logs, retention controls, custom adapters |

### 15.3 Moat (honest assessment)
- Not the visualizer or the LLM.
- Defensible assets: **(1) intent-linked change history across sessions, (2) high-quality framework adapters and golden-repo eval corpus, (3) human-corrected overrides (curated knowledge), (4) agent ecosystem integration/defaults.**
- Main threat: coding agents building equivalent maps natively. Mitigation: be agent-neutral, persistent, and evidence-graded — qualities a single vendor is less incentivized to provide across competitors.

---

## 16. Risks & Open Questions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Feature clustering feels wrong → trust collapse | High | High | Human overrides, stability constraints, show evidence, start with conventional frameworks |
| Dynamic code defeats static resolution | High | Medium | Visible unresolved edges; preview/runtime observations |
| Agents ship native equivalents | Medium | High | Agent neutrality, intent history, cross-agent model |
| Vibe-coder segment doesn't pay | High | Medium | Free tier for adoption; monetize teams/reviewers |
| Source-code trust blocks adoption | Medium | High | Local-first default |
| LLM cost/latency | Medium | Medium | Content-hash caching; lazy narration |
| Scope creep to many languages | High | High | Strict stack-by-stack adapter roadmap |
| Hallucinated explanations | Medium | High | Grounded generation + verifier + provenance UI |

**Open questions**
1. Which first stack covers the largest share of AI-generated apps (likely Next.js/React + Supabase or Prisma)? Validate with real repos.
2. How much intent is capturable without agent-vendor cooperation (hooks vs. transcript scraping)?
3. Is click-to-code better delivered as a standalone overlay, a dev-server plugin, or both?
4. What is the right default granularity of "feature" for non-technical users?
5. Should overrides be stored in-repo (versioned with code) or in the service? (Recommendation: in-repo file for portability, mirrored to service.)
6. How should the product handle monorepos and multiple deployables?

---

*End of document.*