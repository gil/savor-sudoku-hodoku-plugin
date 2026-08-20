import { ASSET_TOKEN, SECTIONS } from "./learn.generated.js";
import { PAGES } from "./techniques.js";

// The same map that gives a technique its reference URL gives it its prose:
// several types share one anchor, and the write-up covers all of them.
const SECTION_BY_TYPE = new Map<string, string>();
for (const [page, types] of Object.entries(PAGES)) {
  const section = SECTIONS[page];
  if (section === undefined) continue;
  for (const type of types) SECTION_BY_TYPE.set(type, section);
}

// Images are served beside the bundle, wherever the host put it. Resolving
// against import.meta.url - available because the host spawns plugins as module
// workers - keeps that working under a content-addressed filename or a CDN
// without the plugin ever being told its own address.
const ASSET_BASE = new URL("assets/", import.meta.url).href;

export function explanationFor(technique: string): string | undefined {
  return SECTION_BY_TYPE.get(technique)?.replaceAll(ASSET_TOKEN, ASSET_BASE);
}
