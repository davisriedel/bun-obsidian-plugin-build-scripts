# bun-obsidian-plugin-build-scripts

Shared build scripts for [Obsidian](https://obsidian.md) community plugins. Handles TypeScript bundling via Bun, SCSS compilation via [Grass](https://github.com/connorskees/grass), optional Rust-to-WASM compilation, test vault setup, manifest management, and plugin releases.

Designed to be consumed as a **git submodule** so multiple plugin repos can share the same build infrastructure without duplication.

---

## Scripts

| Script | Exported function | Description |
|--------|-------------------|-------------|
| `build.ts` | `build()` | Compile SCSS + bundle TypeScript. Supports WASM inlining, debug stripping, and type generation. |
| `build-wasm.ts` | `buildWasm()` | Run `wasm-pack build` and patch the output for use in Obsidian's renderer. |
| `inline-wasm-bun-plugin.ts` | `InlineWasmBunPlugin` | Bun build plugin that base64-inlines `.wasm` files into the bundle. |
| `get-package-metadata.ts` | `getPackageMetadata()` | Read `version` and `obsidianMinAppVersion` from the consumer's `package.json`. Detects beta versions automatically. |
| `update-manifests.ts` | `updateManifests()` | Sync `manifest.json` and `manifest-beta.json` with the current version. Skips `manifest.json` for beta releases. |
| `setup-test-vault.ts` | `setupTestVault()` | Create or refresh a local Obsidian test vault with the latest build artifacts. |
| `generate-ci-artefacts.ts` | `generateCiArtefacts()` | Copy the correct manifest and extract release notes from `CHANGELOG.md` for CI pipelines. |
| `release-plugin.ts` | `releasePlugin()` | Full release flow: validate tag uniqueness, update manifests, validate changelog, bump `versions.json`, commit, and tag. |

---

## Requirements

- [Bun](https://bun.sh) v1.0+
- [Grass](https://github.com/connorskees/grass) (for SCSS compilation) — install with `cargo install grass`
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) (only for WASM builds)

---

## Usage

### Add as a git submodule

```sh
git submodule add git@github.com:davisriedel/bun-obsidian-plugin-build-scripts.git scripts/common
```

### Install dependencies

Run inside the submodule directory:

```sh
cd scripts/common && bun install
```

### Call scripts from your plugin

Import and call the exported async functions from your own build entry points:

```ts
// scripts/build.ts (in the consuming plugin)
import { build } from "./common/scripts/build";

await build("src", { main: "main.ts", styles: "styles/main.scss" }, "dist");
```

```ts
// scripts/release.ts (in the consuming plugin)
import { releasePlugin } from "./common/scripts/release-plugin";

await releasePlugin();
```

---

## Development

```sh
bun x ultracite fix   # Format and auto-fix lint issues
bun x ultracite check # Check for issues without fixing
```

A Lefthook pre-commit hook runs `ultracite fix` automatically on staged files.

---

## License

MIT
