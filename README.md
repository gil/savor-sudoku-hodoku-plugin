# savor-sudoku-hodoku-plugin

[HoDoKu](https://github.com/gil/HoDoKu-ts) as a Savor Sudoku engine plugin.
Implements `savor-sudoku-plugin-api`'s `EngineProvider` and builds to a single
self-contained ESM worker bundle.

Licensed **GPL-3.0-or-later** as a derivative work of HoDoKu. See `LICENSE`.
The corresponding source is the `src/` directory of this package plus the
pinned `hodoku-ts` commit in `package.json`.

Declares and implements `generate`, `rate`, and `hint`.

## Learn content

`src/learn` holds HoDoKu's technique pages, converted to Markdown, with their
example grids as lossless WebP. `scripts/build-learn.mjs` slices each page at
its anchors into `src/learn.generated.ts` and copies the images it references
into `assets/`, named by their own bytes. A hint's `explanation` is the section
for its technique, with image URLs resolved against the bundle's own location,
so the host serves them beside it and the browser fetches each one once.

The images are not inlined as base64 on purpose: the host caps one explanation
at 32K characters, which a single 20K PNG exceeds as a data URI.

**This content is not under the GPL.** It is
Copyright (c) Bernhard Hobiger and licensed **GFDL 1.3**, whose text is in
`LICENSE.FDL`. The two licences are incompatible, so the prose and images ship
alongside this plugin's code rather than as part of it, and every section
carries its attribution and licence notice into the app.
