# How do I export a map?

Use the `/export` command (backed by `@strata/export`).

## Image
> "Export the current view as a PNG at double resolution."
```
/export image --format png --scale 2
```
(Create the MapLibre map with `preserveDrawingBuffer:true` to capture pixels. `--scale 2` re-draws at higher
resolution; a true high-DPI render needs the map created at a higher `pixelRatio`.)

## Print / PDF (composed)
> "Make a proper map PDF with a legend, scale bar, and north arrow."
```
/export pdf --legend --scalebar --north-arrow --layout a4 --title "Wildfire Situational Picture"
```
A **composed** layout — the legend is built from each layer's `drawingInfo`, plus a scalebar + north-arrow on
a Letter/A4 × portrait/landscape page. Default to composed, not a bare image.

## Feature report
> "Generate a one-page report for the selected parcel."
```
/export report
```
A titled, one-feature document: attributes + a map inset + a small chart (`exportFeatureReport`).

## Atlas / map-series
> "Print one page per district."
```
/export atlas
```
Iterates a feature set → one page each (the map re-extents per feature), page-broken for print.

## Share (deep-link + embed)
> "Give me a link that reopens the app exactly as I have it now."
```
/export share
```
Serializes the view / basemap / active layer / filters into a URL (round-trips via `parseShareUrl`) and an
`<iframe>` embed snippet. Also available as the **`share`** widget in an `<StrataApp>`.

## Shareable web map (spec)
> "Give me a shareable web map of this."
```
/export map
```
→ the ESRI Web Map JSON `layers.json` — re-openable and round-trips to ArcGIS tooling.

## Layer data
> "Download the FHSZ layer as GeoParquet / GeoJSON / CSV."
```
/export layer fhsz --format geoparquet
```

The open-data hub uses these same functions for dataset downloads, thumbnails, and "open this map".
