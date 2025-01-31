/// <reference types="bun-types" />

import { $ } from "bun";
import builtins from "builtin-modules";
import { resolveTsPaths } from "resolve-tspaths";
import { InlineWasmBunPlugin } from "./InlineWasmBunPlugin";
import { buildWasm } from "./buildWasm";

export async function build(
  srcDir: string,
	entrypoints: {
    main: string,
    styles: string
  },
	outDir: string,
	format: "cjs" | "esm" = "cjs",
	stripDebug: boolean = false,
  generateTypes: boolean = false,
  wasm: { build: boolean } | boolean = false
) {
  // Create outdir
  await $`mkdir -p ${outDir}`;

  if (typeof wasm == 'object' && wasm.build) {
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
      out: `${outDir}/types`
    });
  }
}
