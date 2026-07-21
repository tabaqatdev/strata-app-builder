/**
 * terraDraw — lazy loader for the OPTIONAL Terra Draw + Turf + maplibre-adapter stack (MIT).
 *
 * `terra-draw`, `terra-draw-maplibre-gl-adapter`, and `@turf/turf` are optional peer dependencies.
 * They are imported dynamically so the base bundle stays free of them; if any is missing the
 * caller no-ops with a console warning (see MeasureControl / SketchControl).
 *
 * The dynamic specifiers are wrapped so a bundler that can't resolve the optional dep fails at
 * runtime (caught) rather than at build time.
 */

export interface TerraDrawModules {
  TerraDraw: any;
  modes: Record<string, any>;
  adapterFactory: (opts: { map: any; maplibregl: any }) => any;
  turf: any;
}

/**
 * Load the Terra Draw stack. Resolves `null` (with a console warning) when any optional dependency
 * is unavailable, so controls can degrade to a no-op.
 *
 * The specifiers are **literal** (not variables): a bundler like Vite must see the literal string to
 * resolve/pre-bundle the dependency for the browser — a variable specifier leaves an unresolvable
 * bare `import("terra-draw")` at runtime and measure/sketch silently no-op. Each import is wrapped in
 * `.catch(() => null)` so a lean app that hasn't installed these optional peer deps degrades cleanly.
 */
export async function loadTerraDraw(): Promise<TerraDrawModules | null> {
  const [core, adapter, turf] = await Promise.all([
    // @ts-ignore optional peer dependency — may be absent at build time (installed only by apps that use measure/sketch).
    import("terra-draw").catch(() => null),
    // @ts-ignore optional peer dependency — may be absent at build time.
    import("terra-draw-maplibre-gl-adapter").catch(() => null),
    // @ts-ignore optional peer dependency — may be absent at build time.
    import("@turf/turf").catch(() => null),
  ]);
  if (!core || !adapter || !turf) {
    // eslint-disable-next-line no-console
    console.warn(
      "[strata] measure/sketch disabled — install optional deps: terra-draw, terra-draw-maplibre-gl-adapter, @turf/turf",
    );
    return null;
  }
  const AdapterCtor = adapter.TerraDrawMapLibreGLAdapter || adapter.default;
  return {
    TerraDraw: core.TerraDraw,
    modes: {
      TerraDrawPointMode: core.TerraDrawPointMode,
      TerraDrawLineStringMode: core.TerraDrawLineStringMode,
      TerraDrawPolygonMode: core.TerraDrawPolygonMode,
      TerraDrawSelectMode: core.TerraDrawSelectMode,
    },
    adapterFactory: ({ map, maplibregl }) => new AdapterCtor({ map, lib: maplibregl }),
    turf,
  };
}
