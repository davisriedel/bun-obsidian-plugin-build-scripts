/// <reference types="bun-types" />

import builtins from "builtin-modules";
import { $ } from "bun";
import { resolveTsPaths } from "resolve-tspaths";
import { buildWasm } from "./build-wasm";
import { InlineWasmBunPlugin } from "./inline-wasm-bun-plugin";

export interface BuildOptions {
  entrypoints?: {
    main?: string;
    styles?: string;
  };
  format?: "cjs" | "esm";
  generateTypes?: boolean;
  outDir?: string;
  projectFile?: string;
  rootDir?: string;
  srcDir?: string;
  stripDebug?: boolean;
  wasm?: { build: boolean } | boolean;
}

export async function build({
  rootDir = ".",
  projectFile = "tsconfig.json",
  srcDir = "src",
  entrypoints: { main = "main.ts", styles = "styles/index.scss" } = {},
  outDir = "dist",
  format = "cjs",
  stripDebug = false,
  generateTypes = false,
  wasm = false,
}: BuildOptions = {}) {
  // Create outdir
  await $`mkdir -p ${rootDir}/${outDir}`;

  if (typeof wasm === "object" && wasm.build) {
    await buildWasm(rootDir);
  }

  // Build scss
  console.log("Building styles");
  await $`grass ${Bun.file(`${rootDir}/${srcDir}/${styles}`)} --style compressed > ${Bun.file(`${rootDir}/${outDir}/styles.css`)}`;

  // Build js
  console.log("Building main");
  await Bun.build({
    entrypoints: [`${rootDir}/${srcDir}/${main}`],
    outdir: `${rootDir}/${outDir}`,
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
    await $`bun tsc --project ${rootDir}/${projectFile} --noEmit false --emitDeclarationOnly --declaration --outDir ${rootDir}/${outDir}/types`;
    resolveTsPaths({
      src: `${rootDir}/${srcDir}`,
      out: `${rootDir}/${outDir}/types`,
    });
  }
}
