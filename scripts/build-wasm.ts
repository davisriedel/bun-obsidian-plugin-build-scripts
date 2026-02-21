/// <reference types="bun-types" />

import { $ } from "bun";

export async function buildWasm(rootDir: string) {
  // Build rust wasm
  console.log("Building rust wasm");
  await $`cd ${rootDir} && wasm-pack build --target web`;

  console.log("Applying patches");
  // import.meta.url is not supported and not needed, beacuse we inline the wasm.
  // Thus remove all import.meta.url occurrences from the wasm-pack output.
  const { main: mainFileName } = await Bun.file(`${rootDir}/pkg/package.json`).json();
  const mainFilePath = `${rootDir}/pkg/${mainFileName}`;
  const mainFileConent = await Bun.file(mainFilePath).text();
  const updatedContent = mainFileConent.replace(/import\.meta\.url/g, "");
  await Bun.write(mainFilePath, updatedContent);
}
