import { $ } from "bun";

import { getPackageMetadata } from "./getPackageMetadata";
import { updateManifests } from "./updateManifests";

export async function setupTestVault(distDir: string, pluginName: string, testVaultPath: string = "./test-vault") {
  const obsidianConfigPath = `${testVaultPath}/.obsidian`;
  const pluginPath = `${obsidianConfigPath}/plugins/${pluginName}`;

  console.log("Creating test vault");
  await $`mkdir -p ${pluginPath}`.quiet();

  if (
    !(await Bun.file(`${obsidianConfigPath}/community-plugins.json`).exists())
  ) {
    console.log("Creating community-plugins.json");
    await Bun.write(
      `${obsidianConfigPath}/community-plugins.json`,
      `["${pluginName}"]`,
    );
  } else {
    console.log("Community plugins already configured in test vault");
  }

  console.log("Cleaning test vault");
  await $`rm ${pluginPath}/main.js ${pluginPath}/styles.css ${pluginPath}/manifest.json`.quiet();

  console.log("Copying plugin dist files");
  await $`cp -r ${distDir}/* ${pluginPath}/`;

  console.log("Copying updated manifests");
  const { targetVersion, minAppVersion, isBeta } = await getPackageMetadata();
  await updateManifests(targetVersion, minAppVersion, pluginPath);

  console.log("Selecting manifest");
  if (isBeta) {
    await $`mv ${pluginPath}/manifest-beta.json ${pluginPath}/manifest.json`.quiet();
  } else {
    await $`rm ${pluginPath}/manifest-beta.json`.quiet();
  }

  console.log("Test vault successfully prepared");
}
