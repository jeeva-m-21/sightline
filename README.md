# Sightline

> *"Your AI built it. Sightline helps you see it."*

Sightline is a comprehension and control layer for AI-assisted software development. It bridges the gap between what code is and what humans and agents understand through four core pillars:

1. **Map:** What is this app made of in product terms?
2. **Point:** What code is behind what I see on screen?
3. **Story:** What did the agent change and why?
4. **Blast Radius:** What could this change affect?

---

## Architecture Overview

Sightline uses a **Three-Layer Trust Architecture**:
- **Layer 1 (Facts):** Deterministic syntax parsing (Tree-sitter, symbol resolution).
- **Layer 2 (Structures):** Framework adapters (Next.js), heuristic cross-boundary resolvers, entry-point flows, and feature clusters.
- **Layer 3 (Narrative):** Grounded LLM narration strictly citing verified entity IDs.

---

## Documentation

- [Master Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Sprint Roadmap & Backlog](docs/SPRINTS.md)
- [System Architecture & Reference](docs/ARCHITECTURE.md)
- [Agent Operational Guide](AGENTS.md)
- [Product Requirement Document](PRD.md)

---

## Development Roadmap (Sprint Breakdown)

- **Sprint 1: The Product Map** — `sightline init` & `sightline map` (CLI & local visualizer).
- **Sprint 2: Flow View** — End-to-end cross-boundary tracing (Entry Point $\to$ Components $\to$ API $\to$ DB).
- **Sprint 3: Live Preview ("Point")** — Click-to-code dev bridge overlay.
- **Sprint 4: Session Story ("Story")** — What the agent changed, why, and breaking risk classification.
- **Sprint 5: Blast Radius** — Provenance-weighted impact analysis before changes.
- **Sprint 6: Agent Integration (MCP)** — 5 outcome-oriented Model Context Protocol tools for AI coding agents.

---

## License

Apache-2.0
