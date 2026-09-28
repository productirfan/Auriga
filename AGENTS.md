# Sidebar design lock

`src/components/sidebar/Sidebar.tsx` is the standalone React sidebar component. Its UI is frozen: do not change its dimensions, spacing, colors, typography, icons, borders, radii, layout, states, or animation unless the user explicitly requests that specific UI change.

Before doing any sidebar work, ask for the user's approval and wait unless the current request explicitly authorizes the specific change. Authorization for one change does not authorize other sidebar changes. New functionality may be added only when explicitly requested and must not alter the frozen UI or existing behavior beyond the requested scope.

Keep sidebar-specific styles in `src/styles/sidebar.css` and keep the component boundary in `src/components/sidebar/`. Avoid unrelated refactors in these files.
