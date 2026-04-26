# 2mensa Olympus Theme Migration Roadmap

## Goal
Apply the Olympus visual language to 2mensa while respecting the current architecture (plain HTML/CSS/JS, per-module pages, no build step).

## Current Architecture Snapshot
- Global entry points: `index.html`, `settings.html`, `app.js`, `styles.css`
- Module pages: `modules/*.html` + per-module CSS/JS files
- Navigation and interaction shell are controlled centrally by `app.js`
- Theme currently mixed in one stylesheet, creating coupling between tokens, layout, and components

## Migration Strategy (Copy + Adapt)
1. Copy Olympus style architecture pattern:
- Introduce layered CSS structure: tokens, base, layout, components, modules, motion
- Keep one entry CSS for all pages

2. Adapt to 2mensa architecture:
- No React/Vite assumptions; use plain CSS `@import` chain
- Keep existing class names to avoid JS breakage
- Keep `styles.css` as compatibility entry so existing page links keep working

3. Apply Olympus visual direction:
- Light blue + white atmospheric gradients
- Softer panels, cleaner borders, larger radius, stronger typographic hierarchy
- Elevated module cards and dashboard cards with subtle motion

4. Preserve platform behavior:
- Sidebar collapse/mobile drawer behavior unchanged
- Preferences (`high-contrast`, `large-text`, `reduced-motion`) continue to work
- Module-specific CSS files continue to layer on top

## Execution Plan
1. Add `/styles/index.css` and layered partials.
2. Move global shell styles from `styles.css` into layered files.
3. Refresh color tokens and key surfaces to Olympus theme values.
4. Keep `styles.css` as compatibility import wrapper.
5. Smoke-check core pages: Home, Settings, Sudoku.
6. Commit and push.

## Verification Checklist
- Home page renders with updated Olympus theme.
- Settings and module pages inherit new shell/theme consistently.
- Mobile sidebar opens/closes correctly.
- No missing stylesheet or class regressions.
- Accessibility toggles still affect global visual modes.

## Next Iteration (Optional)
- Bring module-specific CSS files into the same layered architecture.
- Add per-module accent tokens for game identity.
- Add shared component classes for status chips, meta cards, and action bars.
