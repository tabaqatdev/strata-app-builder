// Copy the non-TypeScript assets next to the compiled modules, so dist/ is a complete,
// self-contained folder an app can vendor as-is (served statically, no bundler):
//   src/map-controls.css → dist/map-controls.css
//   thumbs/*.png         → dist/thumbs/*.png
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
mkdirSync(new URL("thumbs/", dist), { recursive: true });
copyFileSync(new URL("src/map-controls.css", root), new URL("map-controls.css", dist));
let n = 0;
for (const f of readdirSync(new URL("thumbs/", root))) {
  if (!f.endsWith(".png")) continue;
  copyFileSync(new URL(`thumbs/${f}`, root), new URL(`thumbs/${f}`, dist));
  n++;
}
console.log(`copy-assets: map-controls.css + ${n} thumbnails → ${fileURLToPath(dist)}`);
