/**
 * searchPlugin — registers a place-search box and fits the map to the chosen result.
 *
 * UI is contributed via the plain-DOM `StrataPanel.render(container)` contract when the host
 * exposes `registerPanel`; otherwise it falls back to a floating input appended to the
 * document body. Selecting a result calls `app.fitBounds` with the result's bbox (or a small
 * box synthesised around its point).
 */

import type { StrataPlugin, StrataAppAPI, BBox } from "@strata/plugins";
import type { SearchProvider, SearchResult } from "./types.js";

const PANEL_ID = "strata.search.panel";
/** Half-width (degrees) of the box synthesised around a point that has no bbox. */
const POINT_PAD_DEG = 0.02;

function resultToBBox(r: SearchResult): BBox {
  if (r.bbox) return r.bbox;
  return [r.lng - POINT_PAD_DEG, r.lat - POINT_PAD_DEG, r.lng + POINT_PAD_DEG, r.lat + POINT_PAD_DEG];
}

/**
 * Build the search UI inside `container`. Returns a cleanup function that removes listeners
 * and clears the DOM it created.
 */
function renderSearchUI(
  container: HTMLElement,
  app: StrataAppAPI,
  provider: SearchProvider,
): () => void {
  const root = document.createElement("div");
  root.className = "strata-search";

  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Search places…";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Search places");

  const list = document.createElement("ul");
  list.className = "strata-search-results";

  root.append(input, list);
  container.append(root);

  let seq = 0; // guards against out-of-order async responses

  const clearList = () => {
    list.replaceChildren();
  };

  const choose = (r: SearchResult) => {
    input.value = r.label;
    clearList();
    app.fitBounds(resultToBBox(r));
  };

  const runSearch = async () => {
    const query = input.value.trim();
    if (!query) {
      clearList();
      return;
    }
    const mine = ++seq;
    try {
      const results = await provider.search(query, { limit: 5 });
      if (mine !== seq) return; // a newer query superseded this one
      clearList();
      for (const r of results) {
        const li = document.createElement("li");
        li.className = "strata-search-result";
        li.textContent = r.label;
        li.tabIndex = 0;
        li.addEventListener("click", () => choose(r));
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter") choose(r);
        });
        list.append(li);
      }
    } catch (err) {
      if (mine !== seq) return;
      clearList();
      const li = document.createElement("li");
      li.className = "strata-search-error";
      li.textContent = err instanceof Error ? err.message : "Search failed";
      list.append(li);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") void runSearch();
    else if (e.key === "Escape") {
      input.value = "";
      clearList();
    }
  };
  input.addEventListener("keydown", onKeyDown);

  return () => {
    input.removeEventListener("keydown", onKeyDown);
    seq++; // invalidate any in-flight response
    root.remove();
  };
}

/**
 * A Strata plugin that adds place search backed by `provider`.
 * Prefer `nominatimProvider()` (keyless) or `esriGeocodeProvider({ token })`.
 */
export function searchPlugin(provider: SearchProvider): StrataPlugin {
  let panelCleanup: (() => void) | null = null;
  let floatingHost: HTMLElement | null = null;

  return {
    id: "strata.search",
    name: "Search",
    version: "0.3.0",

    activate(app) {
      if (app.registerPanel) {
        app.registerPanel({
          id: PANEL_ID,
          title: "Search",
          placement: "left",
          render: (container) => renderSearchUI(container, app, provider),
        });
        return;
      }

      // Fallback: a floating input appended to the document body.
      if (typeof document === "undefined") return; // headless host — nothing to render
      floatingHost = document.createElement("div");
      floatingHost.className = "strata-search-floating";
      floatingHost.style.position = "absolute";
      floatingHost.style.top = "12px";
      floatingHost.style.left = "12px";
      floatingHost.style.zIndex = "1000";
      document.body.append(floatingHost);
      panelCleanup = renderSearchUI(floatingHost, app, provider);
    },

    deactivate(app) {
      if (app.unregisterPanel) app.unregisterPanel(PANEL_ID);
      if (panelCleanup) {
        panelCleanup();
        panelCleanup = null;
      }
      if (floatingHost) {
        floatingHost.remove();
        floatingHost = null;
      }
    },
  };
}
