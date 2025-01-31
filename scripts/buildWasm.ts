/// <reference types="bun-types" />

import { $ } from "bun";

export async function buildWasm() {
  // Build rust wasm
  console.log("Building rust wasm");
  await $`wasm-pack build --target web`;

  console.log("Applying patches");
  // import.meta.url is not supported and not needed, beacuse we inline the wasm.
  // Thus remove all import.meta.url occurrences from the wasm-pack output.
  const { main: mainFileName } = await Bun.file(`./pkg/package.json`).json();
  const mainFilePath = `./pkg/${mainFileName}`;
  const mainFileConent = await Bun.file(mainFilePath).text();
  const updatedContent = mainFileConent.replace(/import\.meta\.url/g, "");
  await Bun.write(mainFilePath, updatedContent);
}
