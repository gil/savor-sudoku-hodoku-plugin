// Turns src/learn into two build products: one generated module holding every
// technique's prose, and an assets/ directory of content-addressed images.
//
// The split is deliberate. A hint's `explanation` crosses the worker boundary
// on every Learn click and the host caps it at 32K characters, which a single
// inlined 20K image would blow on its own as base64. Prose is small enough to
// live in the bundle; images are served as files and referenced by URL, so the
// browser fetches each one once, caches it, and never pays for a technique the
// player has not looked at.
//
// The pages are HoDoKu's own technique documentation, GFDL 1.3, so each section
// carries its attribution back to the source page.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(here, "..");
const learnDir = join(pkgDir, "src", "learn");
const imagesDir = join(learnDir, "images");
const assetsDir = join(pkgDir, "assets");

// Must match techniques.ts. The live site is gone; every outbound link this
// content carries points into the same archive snapshot the manifest uses.
const BASE =
  "https://web.archive.org/web/20260715214206/https://hodoku.sourceforge.net/en/";

const LICENSE_URL = "https://www.gnu.org/licenses/fdl-1.3.html";

// The runtime rewrites this to the plugin bundle's own directory. It is not a
// valid URL on purpose: anything that ships an unresolved token is a bug, and
// a broken scheme makes that loud instead of silently fetching the wrong path.
const ASSET_TOKEN = "@asset/";

const SECTION_RE = /^# <span id="([^"]+)"><\/span>(.*)$/gm;

function fail(message) {
  console.error(`build-learn: ${message}`);
  process.exit(1);
}

/** WebP beside the PNG the page was written against. Named by its own bytes. */
function assetName(pngRef, page) {
  const stem = basename(pngRef).replace(/\.png$/, "");
  let bytes;
  try {
    bytes = readFileSync(join(imagesDir, `${stem}.webp`));
  } catch {
    fail(`${page} references ${pngRef}, but images/${stem}.webp is missing`);
  }
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
  return { file: `${stem}-${hash}.webp`, stem };
}

/**
 * Rewrites one link target. The pages were written to sit next to each other on
 * hodoku.sourceforge.net, so every relative target - including bare fragments,
 * which would otherwise scroll the app itself - has to become absolute.
 */
function rewriteLink(target, page) {
  if (/^https?:\/\//.test(target)) return target;
  if (target.startsWith("#")) return `${BASE}${page}.php${target}`;
  const relative = /^([a-z0-9_]+)\.(?:md|php)(#.*)?$/.exec(target);
  if (relative) return `${BASE}${relative[1]}.php${relative[2] ?? ""}`;
  fail(`${page} has a link this script does not understand: ${target}`);
}

function rewrite(markdown, page, used) {
  return markdown.replace(/\]\(([^)]*)\)/g, (_match, target) => {
    if (target.startsWith("images/")) {
      const { file } = assetName(target, page);
      used.add(file);
      return `](${ASSET_TOKEN}${file})`;
    }
    return `](${rewriteLink(target, page)})`;
  });
}

function sectionsOf(markdown, page, used) {
  const heads = [...markdown.matchAll(SECTION_RE)];
  const sections = [];
  for (const [i, head] of heads.entries()) {
    const start = head.index + head[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : markdown.length;
    const anchor = head[1];
    const title = head[2].trim();
    // Drop the horizontal rules the page used between sections; inside a single
    // section they only separate the prose from nothing.
    const body = markdown
      .slice(start, end)
      .replace(/^-{4,}\s*$/gm, "")
      .trim();
    const url = `${BASE}${page}.php#${anchor}`;
    const attribution =
      `\n\n---\n\nFrom [HoDoKu](${url}) by Bernhard Hobiger. ` +
      `Text and images licensed [GFDL 1.3](${LICENSE_URL}).`;
    sections.push([
      `${page}.php#${anchor}`,
      rewrite(`# ${title}\n\n${body}`, page, used) + attribution,
    ]);
  }
  return sections;
}

const pages = readdirSync(learnDir)
  .filter((f) => f.endsWith(".md"))
  .sort();
if (pages.length === 0) fail(`no markdown found in ${learnDir}`);

const used = new Set();
const sections = new Map();
for (const file of pages) {
  const page = basename(file, ".md");
  const markdown = readFileSync(join(learnDir, file), "utf8");
  for (const [key, body] of sectionsOf(markdown, page, used)) {
    if (sections.has(key)) fail(`duplicate section ${key}`);
    sections.set(key, body);
  }
}

rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });
for (const file of used) {
  const stem = file.replace(/-[0-9a-f]{8}\.webp$/, "");
  copyFileSync(join(imagesDir, `${stem}.webp`), join(assetsDir, file));
}

const entries = [...sections.entries()]
  .map(([key, body]) => `  ${JSON.stringify(key)}: ${JSON.stringify(body)},`)
  .join("\n");

writeFileSync(
  join(pkgDir, "src", "learn.generated.ts"),
  `// Generated by scripts/build-learn.mjs from src/learn. Do not edit.\n` +
    `//\n` +
    `// HoDoKu's technique pages, one entry per anchor, keyed the way\n` +
    `// techniques.ts keys them. Image targets carry the ${JSON.stringify(ASSET_TOKEN)}\n` +
    `// token, which learn.ts resolves against the running bundle's own URL.\n` +
    `//\n` +
    `// Copyright (c) Bernhard Hobiger. Licensed GFDL 1.3, whose terms are in\n` +
    `// LICENSE.FDL and are not the GPL this plugin's code carries.\n` +
    `export const ASSET_TOKEN = ${JSON.stringify(ASSET_TOKEN)};\n\n` +
    `export const SECTIONS: Readonly<Record<string, string>> = {\n${entries}\n};\n`,
);

console.log(
  `learn: ${sections.size} sections from ${pages.length} pages, ${used.size} images`,
);
