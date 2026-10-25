export * from "./types.js";
export * from "./mapControls.js";

import layersSchema from "./layers.schema.json" with { type: "json" };
import catalogSchema from "./catalog.schema.json" with { type: "json" };

export { layersSchema, catalogSchema };
