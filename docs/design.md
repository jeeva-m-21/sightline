# Sightline: design.md

The visual and interaction design system for Sightline. Read with `sightline-ui-plan.md` (what the screens do). This file covers how everything looks, sounds and moves.

**Product in one line:** a workbench that lets developers see what their AI built, and trust what they're seeing.

**Audience:** developers and tech leads reviewing, inheriting or extending AI-written code. They live in IDEs and terminals. They are sceptical, fast, and allergic to decoration.

---

## 1. Design principles

1. **Evidence is the interface.** The line between two things *is* the proof that they're connected. How a line is drawn tells you how sure we are. This is the one memorable idea in the product (section 6). Everything else stays quiet so it can be seen.
2. **Know the source of every word.** Facts, structure and AI writing look different, so the reader always knows which they're reading (section 4).
3. **Calm density.** Compact like an IDE, spacious like a reading tool. Never more than about 12 objects competing for attention.
4. **Orientation over ornament.** Breadcrumb, mode and time are always visible. Motion explains where you went, never entertains.
5. **Honest gaps.** Unknown, truncated and dynamic things are drawn on purpose. An incomplete map that says so beats a complete one that lies.
6. **Developer-grade restraint.** No gradients as decoration, no glassmorphism, no mascots. If removing it changes nothing, remove it.

---

## 2. Visual direction

**Feel:** a surveyor's instrument sheet crossed with a modern editor. Cool, precise, readable for hours. Light and dark are equals.

**What we deliberately avoid** (these read as generic AI-tool styling):
- Warm cream + terracotta, or black + neon green
- A grid of identical rounded cards with identical soft shadows
- Tracked-out all-caps labels above every heading
- Gradient washes, glow effects, floating blobs
- Graph "spaghetti" with physics-based bouncing nodes

**Where we spend our boldness:** the **Evidence line** system and the **Map's calm regional layout**. Everything else is disciplined.

---

## 3. Color

### 3.1 Base palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `canvas` | `#EEF1F5` | `#0B121C` | App background, map ground |
| `surface` | `#FFFFFF` | `#121B28` | Panels, nodes, popovers |
| `raised` | `#F7F9FB` | `#192434` | Hover, subtle fills, code gutter |
| `ink` | `#0F1B2D` | `#E7EDF5` | Primary text, solid lines |
| `ink-muted` | `#4B5B72` | `#9DADC2` | Secondary text, captions |
| `ink-faint` | `#7A8799` | `#6E7F95` | Placeholders, disabled (not for essential text) |
| `rule` | `#D3DAE4` | `#243247` | Borders, dividers |
| `lens` | `#0B6E7F` | `#52B6C6` | Selection, focus ring, primary action |
| `lens-tint` | `#DDF0F3` | `#123741` | Selected row / node fill |

`lens` is a deep teal: the "sight" colour. It marks only *what you're looking at* (selection, focus, primary buttons). It is never used for decoration.

### 3.2 Evidence and state colours

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `confirmed` | `#0F1B2D` (ink) | `#E7EDF5` | Confirmed link (solid) |
| `live` | `#1B8657` | `#4CC38A` | Seen live at runtime |
| `matched` | `#9A6A00` | `#E3AE45` | Pattern match (dashed) |
| `guessed` | `#7447B5` | `#B195E6` | AI interpretation (dotted) |
| `gap` | `#4B5B72` | `#9DADC2` | Not traceable (open end) |
| `human` | `#B0305F` | `#E77AA6` | Edited or asserted by you |
| `affected` | `#C8472B` | `#F2806A` | Might break / in the blast radius |
| `added` | `#1B8657` | `#4CC38A` | New in this change |
| `removed` | `#B3362E` | `#F08379` | Deleted in this change |
| `past` | `#6A5A3A` | `#C9B27C` | Chrome tint when viewing history |

Rules:
- Colour is **never the only signal**. Every evidence level also has a line style and a text label.
- Tints (for fills) are the colour at 12% opacity on `surface`. Text on tints uses `ink`.
- Status colours are for state, not branding. A screen with no status has no colour except `lens`.

---

## 4. Typography

Type separates **who is speaking**. This is functional, not stylistic.

| Voice | Typeface | Used for |
|---|---|---|
| **Interface and facts** | Schibsted Grotesk | Labels, buttons, names, breadcrumbs, tables |
| **AI narrative** | Newsreader | Summaries, "what it does", session stories, answers |
| **Code** | JetBrains Mono | Source, file paths, symbols, line numbers |

Fallbacks: `"Schibsted Grotesk", "Inter", system-ui, sans-serif` / `"Newsreader", Georgia, serif` / `"JetBrains Mono", ui-monospace, Menlo, monospace`.

Seeing a serif face means *an AI wrote this from the facts*. It always carries the small "Written by AI" mark (section 8.14). Seeing sans or mono means it came directly from code analysis.

### 4.1 Scale

| Token | Size / line | Weight | Face | Use |
|---|---|---|---|---|
| `display` | 34 / 40 | 600 | Grotesk | Overview app name |
| `title` | 24 / 30 | 600 | Grotesk | Screen and object titles |
| `heading` | 18 / 24 | 600 | Grotesk | Panel section headings |
| `body` | 14 / 21 | 400 | Grotesk | Default UI text |
| `body-strong` | 14 / 21 | 600 | Grotesk | Names, emphasis |
| `narrative` | 16 / 26 | 400 | Newsreader | AI text (more line height than sans) |
| `caption` | 12 / 17 | 450 | Grotesk | Metadata, timestamps, helper text |
| `code` | 13 / 20 | 400 | JetBrains Mono | Code and paths |
| `code-sm` | 12 / 17 | 400 | JetBrains Mono | Inline paths in traces |

### 4.2 Rules

- **Sentence case** for all labels, headings and buttons. No all-caps labels.
- Maximum line length: 70 characters for narrative text, 80 for body.
- Left-aligned everywhere. Numbers in tables are right-aligned with tabular figures (`font-variant-numeric: tabular-nums`).
- Weight and size do the hierarchy work. No decorative eyebrows above headings.
- Never emphasise a single word in a headline with colour or italics.

---

## 5. Layout, spacing and surfaces

### 5.1 Spacing (4px base)

`space-1: 4` · `space-2: 8` · `space-3: 12` · `space-4: 16` · `space-5: 24` · `space-6: 32` · `space-7: 48` · `space-8: 64`

### 5.2 Shell dimensions

| Region | Size |
|---|---|
| Top bar | 48px tall |
| Left nav | 216px expanded, 56px collapsed |
| Context panel | 360px default, 320 to 480 resizable, collapsible |
| Time bar | 40px collapsed, 120px expanded |
| Workspace | Fluid, min 560px |
| Breadcrumb row | 40px |

### 5.4 Radius

| Token | Value | Used by |
|---|---|---|
| `r-none` | 0 | Code blocks, full-bleed panels, time bar |
| `r-sm` | 3px | Chips, tags, inline code |
| `r-md` | 6px | Buttons, inputs, list rows |
| `r-lg` | 10px | Map nodes, popovers, command bar |
| `r-region` | 16px | Area regions on the map |

### 5.5 Elevation

The interface is flat and uses **borders, not shadows**, to separate panels.

---

## 6. The Evidence line (signature element)

Every connection in Sightline is a **line**. The line's *style* is its proof level.

| Level | Plain label | Stroke | Colour | Marker |
|---|---|---|---|---|
| Confirmed | Confirmed | Solid, 1.5px | `confirmed` | Filled dot at ends |
| Seen live | Seen live | Solid, 1.5px | `live` | Filled dot + small pulse |
| Matched | Matched | Dashed `6 4`, 1.5px | `matched` | Hollow dot |
| Guessed | Guessed | Dotted `1 4` round caps, 2px | `guessed` | Hollow dot, smaller |
| Gap | Gap | Solid then a break mark, open end | `gap` | `⋮` break + end tick |
| You said so | You edited this | Solid, 1.5px | `human` | Dot with a small notch |

### Evidence chip (text form)
`● Confirmed`, `◐ Matched`, `○ Guessed`, `● Seen live`. Glyph shape plus colour plus text, always all three.

---

## 7. Tokens as code

```css
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
}
```
