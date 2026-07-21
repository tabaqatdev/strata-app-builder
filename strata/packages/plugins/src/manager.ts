/**
 * PluginManager — registration and activation lifecycle for Strata plugins.
 */

import type { StrataPlugin, StrataAppAPI } from "./types.js";

export class PluginManager {
  private readonly plugins = new Map<string, StrataPlugin>();
  private readonly active = new Set<string>();

  /** Register a plugin (last registration wins for a given id). */
  register(plugin: StrataPlugin): this {
    this.plugins.set(plugin.id, plugin);
    return this;
  }

  /** Register many plugins in order. */
  registerAll(plugins: StrataPlugin[]): this {
    for (const p of plugins) this.register(p);
    return this;
  }

  /**
   * Activate a registered plugin. Returns `true` on success. A plugin's `activate`
   * may return `false` to veto; any thrown error is caught and reported as failure.
   */
  activate(id: string, app: StrataAppAPI): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    if (this.active.has(id)) return true;
    try {
      const result = plugin.activate(app);
      if (result === false) return false;
      this.active.add(id);
      return true;
    } catch (err) {
      console.error(`[@strata/plugins] activate("${id}") threw:`, err);
      return false;
    }
  }

  /** Deactivate an active plugin. No-op if not active or unknown. */
  deactivate(id: string, app: StrataAppAPI): void {
    const plugin = this.plugins.get(id);
    if (!plugin || !this.active.has(id)) return;
    try {
      plugin.deactivate(app);
    } catch (err) {
      console.error(`[@strata/plugins] deactivate("${id}") threw:`, err);
    } finally {
      this.active.delete(id);
    }
  }

  /**
   * Activate every registered plugin that declares `activeByDefault`.
   * Returns the ids that activated successfully.
   */
  activateDefaults(app: StrataAppAPI): string[] {
    const activated: string[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.activeByDefault && this.activate(plugin.id, app)) {
        activated.push(plugin.id);
      }
    }
    return activated;
  }

  /** All registered plugins, in registration order. */
  list(): StrataPlugin[] {
    return [...this.plugins.values()];
  }

  isActive(id: string): boolean {
    return this.active.has(id);
  }
}
