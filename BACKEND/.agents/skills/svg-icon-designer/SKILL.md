---
name: svg-icon-designer
description: Design and create SVG icons for the Hub System icon library. Produces sharp, consistent, dual-tone mono SVG icons optimized for CSS mask-image rendering at all sizes (12px to 48px). Use when adding new icons, redesigning existing icons, or maintaining the icon system.
---

# SVG Icon Designer — Hub System

Skill for creating beautiful, sharp, consistent SVG icons for the Hub System project. All icons use CSS `mask-image` technique and inherit `currentColor` for automatic theme support.

## When to Use This Skill

- Adding new icons to the Hub System
- Redesigning or improving existing icons
- Batch-creating icons for a new feature
- Auditing icon consistency across the system
- Converting PNG icons to SVG

## Icon System Architecture

### How Icons Work

```
SVG file (public/icons/name.svg)
  → CSS mask-image (app/icons/index.css)
    → .hub-icon-name class
      → HTML: <i class="hub-icon hub-icon-name"></i>
        → Renders with currentColor (theme-aware)
```

### Key Files

| File | Purpose |
|------|---------|
| `FRONEND/public/icons/*.svg` | SVG icon source files |
| `FRONEND/app/icons/index.css` | CSS icon class definitions |
| `FRONEND/app/layout/index.css` | Icon size overrides per context |

### Display Sizes

| Context | font-size | Notes |
|---------|-----------|-------|
| Sidebar icons | 20px | Navigation menu items |
| Header toolbar | 20px | Theme toggle, notifications |
| Sync card headers | 16px | Endpoint cards |
| Button icons | 14px | Action buttons |
| Log entry icons | 12px | Activity log items |
| Placeholder icons | 48px | Empty state decorations |

## Design Specification

### ViewBox & Grid

```
viewBox="0 0 24 24"
```

- **Grid**: 24x24 units
- **Safe area**: Coordinates 2–22 (2px padding on all sides)
- **Center point**: (12, 12)
- **NO** width/height attributes on `<svg>` — CSS controls sizing

### SVG Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="none" stroke="#000" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round">
  <!-- Dual-tone fill layer (closed shapes only) -->
  <path d="..." fill="#000" opacity="0.2" stroke="none"/>
  <!-- Main stroke layer -->
  <path d="..."/>
</svg>
```

### Stroke Rules

| Property | Value | Purpose |
|----------|-------|---------|
| `stroke` | `#000` | Black for mask (becomes currentColor) |
| `stroke-width` | `1.5` | Standard weight for all icons |
| `stroke-linecap` | `round` | Smooth line endings |
| `stroke-linejoin` | `round` | Smooth corner joins |
| `fill` | `none` | Transparent base (stroke-only) |

**Exceptions:**
- `checkmark.svg`, `cancel.svg`: Use `stroke-width="2"` for extra visual weight
- Solid dots (bullet points, keyhole): Use `fill="#000"` with no stroke

### Dual-Tone Effect

For **closed shapes** (rectangles, circles, polygons, closed paths), add a subtle fill layer:

```xml
<!-- 1. Fill layer FIRST (subtle background) -->
<rect x="3" y="5" width="18" height="14" rx="2"
  fill="#000" opacity="0.2" stroke="none"/>
<!-- 2. Stroke layer SECOND (sharp outline) -->
<rect x="3" y="5" width="18" height="14" rx="2"/>
```

Rules:
- Fill opacity: `0.2` (creates 20% tint through mask)
- Fill element must have `stroke="none"` to prevent double-stroke blur
- Only apply to CLOSED shapes (not lines, polylines, open paths)
- Place fill layer BEFORE stroke layer in SVG source

### Geometry Rules

- **Rectangles**: Use `rx="1.5"` or `rx="2"` for rounded corners
- **Circles/arcs**: Use smooth `<circle>`, `<ellipse>`, or arc commands
- **Symmetry**: Center icons in the 24x24 grid
- **Alignment**: Prefer whole-number or half-number coordinates (e.g., 12, 5.5)
- **Consistency**: Similar shapes across icons should use same proportions

### Forbidden

- NO `<g>` wrapper elements
- NO `class`, `id`, `data-*` attributes
- NO XML comments inside SVG
- NO `width`/`height` on `<svg>`
- NO inline styles (`style="..."`)
- NO gradients, filters, or effects
- NO text elements
- NO raster images

## Creating a New Icon — Step by Step

### Step 1: Design the Icon

Think about:
1. **Recognition**: Must be identifiable at 12px
2. **Simplicity**: Fewer paths = sharper at small sizes
3. **Balance**: Visual weight should match other icons
4. **Meaning**: Should clearly convey its purpose

### Step 2: Write the SVG

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="none" stroke="#000" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round">
  <!-- Design your paths here -->
</svg>
```

### Step 3: Save the File

Save to: `FRONEND/public/icons/{name}.svg`

Naming rules:
- Lowercase, kebab-case: `my-icon.svg`
- Descriptive but concise: `data-config.svg`, not `database-configuration-settings.svg`

### Step 4: Register in CSS

Add to `FRONEND/app/icons/index.css`:

```css
.hub-icon-{name} {
  -webkit-mask-image: url('/icons/{name}.svg');
  mask-image: url('/icons/{name}.svg');
}
```

### Step 5: Use in HTML

```html
<i class="hub-icon hub-icon-{name}"></i>
```

## Icon Reference Library

Current icons organized by category:

### Navigation / Layout
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-home` | home.svg | House with roof and door |
| `hub-icon-settings` | settings.svg | Three horizontal sliders |
| `hub-icon-menu` | menu.svg | Three horizontal lines (hamburger) |
| `hub-icon-layout` | layout.svg | 2x2 grid of rectangles |
| `hub-icon-globe` | globe.svg | Earth with meridians |

### Theme
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-moon` | moon.svg | Crescent moon |
| `hub-icon-sun` | sun.svg | Circle with radiating rays |

### User / Auth
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-user` | user.svg | Person head + shoulders |
| `hub-icon-lock` | lock.svg | Padlock with keyhole |
| `hub-icon-mail` | mail.svg | Envelope with V flap |
| `hub-icon-security` | security.svg | Shield with checkmark |

### Actions
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-plus` | plus.svg | Plus sign |
| `hub-icon-search` | search.svg | Magnifying glass |
| `hub-icon-refresh` | refresh.svg | Two curved arrows (refresh) |
| `hub-icon-download` | download.svg | Arrow down with tray |
| `hub-icon-sync` | sync.svg | Two sync arrows (spin-safe) |
| `hub-icon-flag` | flag.svg | Flag on pole |
| `hub-icon-link` | link.svg | Two chain links |

### Content
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-bell` | bell.svg | Notification bell |
| `hub-icon-document` | document.svg | File with corner fold |
| `hub-icon-money` | money.svg | Banknote with center circle |
| `hub-icon-monitor` | monitor.svg | Computer screen |
| `hub-icon-survey` | survey.svg | Clipboard with lines |
| `hub-icon-chart` | chart.svg | Three ascending bars |

### Sync Tool
| Class | File | Description |
|-------|------|-------------|
| `hub-icon-speed` | speed.svg | Wind/motion lines |
| `hub-icon-speedometer` | speedometer.svg | Gauge with needle |
| `hub-icon-play` | play.svg | Play triangle |
| `hub-icon-pause` | pause.svg | Two vertical bars |
| `hub-icon-stop` | stop.svg | Rounded square |
| `hub-icon-checkmark` | checkmark.svg | Bold tick mark |
| `hub-icon-error` | error.svg | Circle with X |
| `hub-icon-warning` | warning.svg | Triangle with exclamation |
| `hub-icon-clock` | clock.svg | Clock with hands |
| `hub-icon-flash` | flash.svg | Lightning bolt |
| `hub-icon-rocket` | rocket.svg | Rocket ship |
| `hub-icon-database` | database.svg | Stacked cylinders |
| `hub-icon-connection` | connection-sync.svg | Two boxes with arrows |
| `hub-icon-activity` | activity.svg | EKG pulse line |
| `hub-icon-progress` | progress.svg | Progress bar |
| `hub-icon-checklist` | checklist.svg | Three rows with checks |
| `hub-icon-gear` | gear.svg | Cog wheel |
| `hub-icon-cancel` | cancel.svg | X cross |
| `hub-icon-ok` | ok.svg | Circle with checkmark |
| `hub-icon-lightning` | lightning.svg | Lightning in circle |
| `hub-icon-data-config` | data-config.svg | Database with gear |
| `hub-icon-batch` | batch.svg | Stacked rectangles |
| `hub-icon-filter` | filter.svg | Funnel shape |
| `hub-icon-list` | list.svg | Bullet list |
| `hub-icon-cloud` | cloud.svg | Cloud shape |
| `hub-icon-graph` | graph.svg | Line chart with dots |
| `hub-icon-update` | update.svg | Rotation arrows |
| `hub-icon-tools` | tools.svg | Wrench |
| `hub-icon-login` | login.svg | Arrow entering box |
| `hub-icon-key` | key.svg | Key shape |

## Quality Checklist

Before finalizing any icon:

- [ ] ViewBox is exactly `0 0 24 24`
- [ ] No width/height attributes on `<svg>`
- [ ] All strokes use `stroke-width="1.5"` (unless intentional exception)
- [ ] `stroke-linecap="round"` and `stroke-linejoin="round"` present
- [ ] Closed shapes have dual-tone fill layer with `opacity="0.2" stroke="none"`
- [ ] Fill layers appear BEFORE stroke layers
- [ ] Coordinates stay within 2–22 range
- [ ] No `<g>`, `class`, `id`, comments, or inline styles
- [ ] Icon is recognizable at 12px display size
- [ ] Visual weight matches other icons in the system
- [ ] CSS class registered in `app/icons/index.css`
- [ ] Icon renders correctly with CSS `mask-image`

## Troubleshooting

### Icon looks blurry
- Check that dual-tone fill has `stroke="none"` (prevents double-stroke)
- Ensure opacity is `0.2` (not lower — too faint creates haze)
- Verify stroke-width is `2` (thinner strokes anti-alias more)

### Icon doesn't show color
- SVG must use `#000` for stroke/fill (mask-image uses alpha channel)
- CSS must have `background-color: currentColor` on `.hub-icon`

### Icon looks too thin/thick compared to others
- Compare stroke-width with neighboring icons
- Check that the viewBox is 24x24 (not 16x16 or 48x48)
- Ensure icon fills the safe area (2–22) proportionally

### Spinning icon wobbles
- Icon must be visually centered (cx=12, cy=12)
- Avoid asymmetric designs for icons used with `hub-icon-spin`
