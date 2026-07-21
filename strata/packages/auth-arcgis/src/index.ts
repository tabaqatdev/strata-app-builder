/**
 * @strata/auth-arcgis — optional auth adapter over Esri's `@esri/arcgis-rest-request`.
 *
 * ⚠️ **ESRI Enterprise / ArcGIS Online backends ONLY.** The Strata Serve server does not yet implement the
 * ArcGIS Enterprise Portal authentication/authorization/token model (planned). Do **not** use this against a
 * Strata backend — `createArcGISAuth` throws for a `strata` backend. For Strata secured services, use
 * Strata's own token flow when it ships.
 *
 * The Esri library is an **optional peer dependency**, loaded lazily, so the lean core builds without it:
 *   pnpm add @esri/arcgis-rest-request
 */

export type StrataBackend = "strata" | "esri-enterprise" | "esri-online";

/** Throws unless the backend is an ESRI backend that supports portal-grade auth. */
export function assertEsriBackend(backend: StrataBackend): void {
  if (backend !== "esri-enterprise" && backend !== "esri-online") {
    throw new Error(
      `@strata/auth-arcgis supports ESRI Enterprise/Online backends only. Backend "${backend}" ` +
        `(e.g. Strata Serve) does not yet implement portal-grade authentication — this is planned. ` +
        `Use Strata's own token flow for a Strata backend when it ships.`
    );
  }
}

/** True if a backend can use ArcGIS REST JS auth today. */
export function supportsArcGISAuth(backend: StrataBackend): boolean {
  return backend === "esri-enterprise" || backend === "esri-online";
}

export interface ArcGISAuthOptions {
  /** Must be "esri-enterprise" or "esri-online". A "strata" backend is rejected. */
  backend: StrataBackend;
  /** e.g. https://your.enterprise/portal/sharing/rest or https://www.arcgis.com/sharing/rest */
  portalUrl?: string;
  /** username/password sign-in (ArcGISIdentityManager). */
  username?: string;
  password?: string;
  /** an API key (ApiKeyManager). */
  apiKey?: string;
  /** a pre-obtained token. */
  token?: string;
}

/**
 * Create an ArcGIS authentication manager (`ArcGISIdentityManager` / `ApiKeyManager`).
 * ESRI Enterprise/Online only — throws for a Strata backend or a missing peer dependency.
 * Pass the returned manager as `authentication` to `@strata/feature-arcgis` calls.
 */
export async function createArcGISAuth(opts: ArcGISAuthOptions): Promise<unknown> {
  assertEsriBackend(opts.backend);
  // Variable specifier so TS doesn't statically resolve the optional peer dep (lazy, runtime-only).
  const ESRI_REST_REQUEST = "@esri/arcgis-rest-request";
  let req: any;
  try {
    req = await import(/* @vite-ignore */ ESRI_REST_REQUEST);
  } catch {
    throw new Error(
      "@strata/auth-arcgis requires the optional peer dependency '@esri/arcgis-rest-request'. " +
        "Install it: pnpm add @esri/arcgis-rest-request"
    );
  }
  if (opts.apiKey) return req.ApiKeyManager.fromKey(opts.apiKey);
  if (opts.username && opts.password) {
    return req.ArcGISIdentityManager.signIn({
      username: opts.username,
      password: opts.password,
      portal: opts.portalUrl,
    });
  }
  if (opts.token) {
    return new req.ArcGISIdentityManager({ token: opts.token, portal: opts.portalUrl });
  }
  throw new Error("createArcGISAuth: provide one of apiKey, token, or username + password.");
}
