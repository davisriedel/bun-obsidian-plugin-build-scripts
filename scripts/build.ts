/// <reference types="bun-types" />

import builtins from "builtin-modules";
import { $ } from "bun";
import { resolveTsPaths } from "resolve-tspaths";
import { buildWasm } from "./build-wasm";
import { InlineWasmBunPlugin } from "./inline-wasm-bun-plugin";

export async function build(
  srcDir: string,
  entrypoints: {
    main: string;
    styles: string;
  },
  outDir: string,
  format: "cjs" | "esm" = "cjs",
  stripDebug = false,
  generateTypes = false,
  wasm: { build: boolean } | boolean = false
) {
  // Create outdir
  await $`mkdir -p ${outDir}`;

  if (typeof wasm === "object" && wasm.build) {
    await buildWasm();
  }

  // Build scss
  console.log("Building styles");
  await $`grass ${Bun.file(`${srcDir}/${entrypoints.styles}`)} --style compressed > ${Bun.file(`${outDir}/styles.css`)}`;

  // Build js
  console.log("Building main");
  await Bun.build({
    entrypoints: [`${srcDir}/${entrypoints.main}`],
    outdir: outDir,
    minify: true,
    target: "browser",
    format,
    plugins: wasm ? [InlineWasmBunPlugin] : [],
    drop: stripDebug ? ["console"] : [],
    external: [
      "obsidian",
      "electron",
      "@electron/remote",
      "@codemirror/autocomplete",
      "@codemirror/collab",
      "@codemirror/commands",
      "@codemirror/language",
      "@codemirror/lint",
      "@codemirror/search",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/common",
      "@lezer/highlight",
      "@lezer/lr",
      ...builtins,
    ],
  });

  if (generateTypes) {
    // Build typescript declaration files
    console.log("Building types");
    await $`bun tsc --noEmit false --emitDeclarationOnly --declaration --outDir ${outDir}/types`;
    resolveTsPaths({
      src: srcDir,
      out: `${outDir}/types`,
    });
  }
}
