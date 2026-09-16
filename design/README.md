# design/

Design assets for the mobile app — reference material for implementation, not a
component library.

## Structure

```
design/
├── logos/         # App/brand logos, all required sizes/formats
├── screens/        # Screen mockups / flow references (per feature)
├── colors/         # Color palette references (source for design tokens)
├── typography/     # Type scale, font files/specimens
├── icons/          # Icon assets (source files, e.g. SVG)
└── components/     # Component visual references (source for UI components)
```

## Usage rule

Assets here are **referenced from code, never duplicated**. When a component or
screen needs an asset, import/reference it from `design/` (or from `src/shared/assets`
if it needs to ship in the app bundle) — do not copy the same logo, icon, or color
value into multiple places. Design tokens (colors, typography) implemented in code
must derive from what's documented here, kept in sync by whoever updates either side.
