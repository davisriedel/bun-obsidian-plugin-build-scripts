/// <reference types="bun-types" />

import { $ } from "bun";

import { getPackageMetadata } from "./getPackageMetadata";

export async function generateCiArtefacts(outDir: string) {
  console.log("Copying updated manifest");
  const { targetVersion, isBeta } = await getPackageMetadata();
  if (isBeta) {
    await $`cp manifest-beta.json ${outDir}/manifest.json`.quiet();
  } else {
    await $`cp manifest.json ${outDir}/manifest.json`.quiet();
  }

  console.log("Extracting release notes from change log");
  const changelog = await Bun.file("CHANGELOG.md").text();
  const pattern = `^## ${targetVersion}\\n+((?:([^#]{2})|\\n)+)`;
  const regex = RegExp(pattern, "gm");
  const matches = regex.exec(changelog);
  const release_notes = matches?.at(1);
  if (!release_notes) console.warn("Release notes not found in changelog");

  console.log("Writing release notes");
  await Bun.write(`${outDir}/release-notes.md`, release_notes ?? "");
}
