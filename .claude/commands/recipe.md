---
description: Launch a recipe like an ArcGIS Instant App — run its guided configuration wizard, then build the app.
argument-hint: [recipe name, e.g. mapviewer | showcase]
---

Launch a **recipe** the way ArcGIS Instant Apps launch: run the recipe's **guided wizard** to collect the
app's properties, confirm, then execute its **prompt-script** to build a working app on strata-app-builder.

## How to run
1. **Resolve the recipe.** Match `$ARGUMENTS` (or the app the user described) to a recipe folder:
   - Public: `recipes/<name>/RECIPE.md` — the example recipes **`mapviewer`** and **`showcase`**.
   - Private business solutions: `.private/solution_recipes/<name>/RECIPE.md` if present (not in the public template).
   - If no argument, list the recipes in `recipes/` and ask which to build (or suggest `/new-app`).
2. **Read the recipe's `## Guided wizard`** section. Run it as the configuration wizard:
   - In **Cowork**, ask each group with the multiple-choice question tool (one screen per group).
   - In the **CLI**, ask concise numbered questions.
   - Teach each option in one line, apply the **defaults** so "accept all" works, and use progressive
     disclosure (start with App + Data; only ask later groups when relevant).
3. **Confirm.** Echo a one-line summary of the collected properties and wait for a go-ahead.
4. **Build.** Execute the recipe's **prompt-script (§4)** with the wizard answers — creating the map, adding/
   converting/publishing layers, styling, popups, panels/widgets, layout/theme, and export — then print the
   run command. Follow the recipe's **§5 Verify** checklist.

## Rules
- The wizard **only collects properties**; it never invents data or scope beyond the recipe. Surface any
  side-effectful step (publish, install) for confirmation.
- Preserve the **ESRI Web Map JSON** contract on every path; styling is genuine `drawingInfo`, popups are
  genuine `popupInfo`.
- Business solution recipes live under the gitignored `.private/` and must never be published; reference them
  by name only in public output.
