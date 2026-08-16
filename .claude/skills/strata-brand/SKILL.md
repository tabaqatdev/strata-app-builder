# strata-brand skill pack

Apply the design system: tokens (color/spacing/typography), hazard/theme presets, bilingual EN/AR with
RTL-aware layout, and the attribution + independence disclaimer footer on every app.

Keep a consistent, control-room-friendly, high-contrast look across apps. Use semantic tokens
(`@hazard.active`, `@status.*`) so layer styles restyle by theme swap. Carry Esri marks nominatively with
the `DISCLAIMER.md` notice.

## The token contract

A built app declares one `--strata-*` set on `:root` and overrides **only the values** under
`[data-theme="dark"]`. Never define a colour whose only declaration lives inside the dark block.

```css
:root{
  --strata-primary: …; --strata-secondary: …; --strata-success: …;
  --strata-warning: …; --strata-warning-text: …;   /* fill and text are SEPARATE — see below */
  --strata-danger: …;  --strata-info: …;
  --strata-app-bg: …; --strata-panel-bg: …; --strata-fg: …; --strata-muted: …; --strata-border: …;
  --strata-radius: 6px; --strata-motion: 180ms;
  --strata-elev-1: …; --strata-elev-2: …;
  --strata-mono: "IBM Plex Mono", ui-monospace, …;   /* tabular numerals for every figure */
}
```

## Theme rules learned from the shipped apps

- **Measure, don't argue.** Every informational state clears **4.5:1 in both themes**, checked rather
  than eyeballed. When one hue must be both a fill and a text colour, it becomes two tokens — amber at
  `#f59e0b` is 2.15:1 as text on white and shipped that way twice before the split.
- **Contrast decides nothing; fitness for purpose decides.** Once both modes clear AA, pick light or dark
  on what the artifact *is* — a print-bound evidence pack is light; a wall display is dark.
- **Data colours are identical in both themes.** Only the halo changes. A dark-mode override that
  repainted a data fill made a whole navigation band unreadable.
- **Mix surface tints against the panel, not `transparent`** — on a dark surface, mixing against
  transparent resolves toward the tint and produces mud.
- **Semantic roles carry meaning, not emphasis.** Two different facts must not share ink; ration red to
  things that genuinely are hazards.
- **A theme swap must not discard an explicit basemap choice** — re-pair only while the user has not
  chosen one.

- **Never use an Esri mark as a UI control.** Icons follow the Calcite/ArcGIS *idiom* — inline SVG in the
  same visual language — but a trademarked logo used as a button implies endorsement rather than the
  nominative use this product's positioning allows.

Full catalogue: `strata/docs/troubleshooting.md` §8. Structured `ThemeSpec` and the named presets live in
`@strata/theme`.
