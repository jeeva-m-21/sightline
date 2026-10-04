# Sightline: UI Iteration and Screen Plan

> One sentence: Sightline is a workbench where a developer *sees* a codebase, follows any claim down to evidence, and always knows where they are.

This document defines **how the UI should work**. Its companion, `design.md`, defines **how it should look** (tokens, type, components).

---

## 1. Design goals

1. **Orientation first.** At any moment the user can answer: *Where am I? How did I get here? What do I know vs. what is guessed?*
2. **Product words first, code on demand.** Default labels are "Checkout", not `CheckoutController`. Code is always one click away.
3. **Evidence is visible, never hidden.** The UI never draws a guess the same way as a fact.
4. **One workspace, no page-hopping.** Selecting something changes the *mode* of the same canvas, it does not navigate away.
5. **Calm density.** Developers tolerate density, not clutter. Hard caps on visible objects (about 12 per level).
6. **Keyboard-first, mouse-friendly, newcomer-safe.** Power users never touch the mouse. First-timers never need a manual.

---

## 2. Mapping the spec to the UI

| Spec pillar | Where it lives in the UI |
|---|---|
| Map | **Overview** (landing) and the map canvas in Explore |
| Flow | **Explore > Trace** |
| Point | **Overlay** (`P`), result opens in Explore > Focus |
| Story | **Changes > Review** (session story) |
| Blast radius | **Impact** destination, plus the "Check impact" action on any object |
| Ask | **Command bar** (`Cmd/Ctrl+K`), answers render on the canvas |
| Health | Deferred (v1.5). Shows as small badges before it gets a page |
| Learn mode | **Explanation level** switch in the context panel (Designer / Beginner / Experienced) |

---

## 3. The application shell

The shell never changes. Only the workspace content changes.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Sightline  acme-commerce ▾     [ Search or ask…            Ctrl K ]   main ▾  │  top bar
├────────┬──────────────────────────────────────────────────────┬──────────────┤
│        │ ACME Commerce  /  Billing  /  Checkout        [mode]  │              │
│ Over-  │ ─────────────────────────────────────────────────────│  Context     │
│  view  │                                                      │  panel       │
│        │                                                      │              │
│ Explore│                  Workspace                           │  What it     │
│        │                                                      │  does        │
│ Changes│          (map  |  trace  |  learn  |  source)        │  Connected   │
│        │                                                      │  to          │
│ Impact │                                                      │  Evidence    │
│        │                                                      │  Recent      │
│        │                                                      │  changes     │
│  ·     │                                                      │  Actions     │
│ Point  │                                                      │              │
├────────┴──────────────────────────────────────────────────────┴──────────────┤
│ Snapshot: main @ 3f2a91 (working tree)   ◄ ──────●────────────────── ►  Now  │  time bar
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The object model users see

| Noun | Plain-language meaning | Shown as |
|---|---|---|
| Area | A major part of the app (Auth, Billing) | Large labelled region (`r-region`) |
| Feature | A thing users can do (Checkout) | Node |
| Flow | The path a feature takes, entry to data | Vertical trace |
| Part | A component, function, route, table or service | Small node with type glyph |
| Session | One agent run with an intent | Card |
| Change | A structural difference between two snapshots | Marker |
| Evidence | Why Sightline believes a link exists | Line style + chip |

---

## 5. Interaction Grammar & State Machine

Seven verbs: **Select**, **Open** (go deeper), **Trace**, **Explain**, **Source**, **Compare**, **Back**.
Rule: **Back always undoes the last state change.**
Global keys: `Cmd/Ctrl+K` (search/ask) and `P` (Point on live app).
