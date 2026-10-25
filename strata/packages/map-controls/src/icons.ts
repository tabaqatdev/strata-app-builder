/**
 * icons — every glyph the map controls draw, from ONE family: Lucide (lucide-static 0.460.0).
 *
 * Why Lucide and not Calcite: @esri/calcite-ui-icons is licensed "SEE LICENSE.md", which is the
 * Esri Master License Agreement (redistribution only unmodified, under the MLA) — not an open
 * licence a public open-source template can ship. Lucide is ISC.
 *
 *   ISC License — Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of
 *   Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *   Permission to use, copy, modify, and/or distribute this software for any purpose with or
 *   without fee is hereby granted, provided that the above copyright notice and this permission
 *   notice appear in all copies. THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
 *   WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *   AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
 *   CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
 *   WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 *   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * Each glyph is the Lucide path data on its 24×24 grid, with the presentation attributes
 * stripped: map-controls.css paints every `svg.smc-i` as a stroked currentColor icon (16 px,
 * stroke 1.7 — the weight the chrome has always had), so one rule themes them all.
 * Keys are stable API; the Lucide source name is in the comment.
 */
/** Every glyph key (stable API). */
export type IconName =
  | "zoomIn" | "zoomOut" | "home" | "layers" | "basemap" | "legend" | "fsEnter" | "fsExit"
  | "eye" | "eyeOff" | "chevron" | "more" | "grip" | "zoomTo" | "info" | "up" | "down" | "legendList"
  | "reset" | "check" | "external"
  | "locate" | "measure" | "draw" | "search" | "print" | "close" | "trash" | "download";

const svg = (body: string): string => `<svg class="smc-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS: Readonly<Record<IconName, string>> = Object.freeze({
  // ── the cluster
  zoomIn:   svg('<path d="M5 12h14"/><path d="M12 5v14"/>'),                                             // plus
  zoomOut:  svg('<path d="M5 12h14"/>'),                                                                 // minus
  home:     svg('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), // house
  layers:   svg('<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>'), // layers
  // Lucide layout-grid — the four-tile gallery glyph Map Viewer users know (Calcite's own
  // basemap icon is Esri-licensed, so it cannot ship in the public template).
  basemap:  svg('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'), // layout-grid
  legend:   svg('<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>'), // list
  fsEnter:  svg('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>'), // maximize
  fsExit:   svg('<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>'), // minimize
  // ── the layer list
  eye:      svg('<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>'), // eye
  eyeOff:   svg('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'), // eye-off
  chevron:  svg('<path d="m9 18 6-6-6-6"/>'),                                                            // chevron-right
  more:     svg('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'), // ellipsis
  grip:     svg('<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>'), // grip-vertical
  zoomTo:   svg('<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>'), // focus
  info:     svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),           // info
  up:       svg('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),                                        // arrow-up
  down:     svg('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),                                       // arrow-down
  legendList: svg('<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>'), // list
  reset:    svg('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'),     // rotate-ccw
  check:    svg('<path d="M20 6 9 17l-5-5"/>'),                                                          // check
  external: svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'), // external-link
  // ── the optional tools (tools.ts — all off by default)
  locate:   svg('<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/>'), // locate
  measure:  svg('<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>'), // ruler
  draw:     svg('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'), // pencil
  search:   svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),                            // search
  print:    svg('<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/>'), // printer
  close:    svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),                                      // x
  trash:    svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'), // trash-2
  download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'), // download
});
