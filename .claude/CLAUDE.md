# bun-obsidian-plugin-build-scripts — Submodule Overview

Shared build scripts for Obsidian community plugins. Consumed as a git submodule by plugin repos. All scripts are TypeScript modules exported as async functions and called from each plugin's own entry-point scripts.

- **Package name**: `bun-obsidian-plugin-build-scripts`
- **Author**: Davis Riedel
- **Consumed by**: `git@github.com:davisriedel/bun-obsidian-plugin-build-scripts.git`

---

## Tech Stack

| Tool | Role |
|------|------|
| **Bun** | Runtime, package manager |
| **TypeScript** (strict) | Primary language |
| **Biome / Ultracite** | Linting and formatting |
| **Lefthook** | Git hooks |

---

## Scripts (`scripts/`)

| File | Exported function | Purpose |
|------|-------------------|---------|
| `build.ts` | `build()` | Compile SCSS (via `grass`) + bundle TS (via Bun), optionally inline WASM, optionally strip debug, optionally emit types |
| `build-wasm.ts` | `buildWasm()` | Run `wasm-pack build`, patch `import.meta.url` references out of the output |
| `inline-wasm-bun-plugin.ts` | `InlineWasmBunPlugin` | Bun build plugin: base64-inlines `.wasm` files so they work in Obsidian's renderer |
| `get-package-metadata.ts` | `getPackageMetadata()` | Read `version`, `obsidianMinAppVersion`, detect beta (version contains `-`) from the consumer's `package.json` |
| `update-manifests.ts` | `updateManifests()` | Sync `manifest.json` / `manifest-beta.json` with current version; skips `manifest.json` for beta releases |
| `setup-test-vault.ts` | `setupTestVault()` | Create/refresh an Obsidian test vault with the built plugin files for local manual testing |
| `generate-ci-artefacts.ts` | `generateCiArtefacts()` | Copy the correct manifest and extract release notes from `CHANGELOG.md` into the CI output dir |
| `release-plugin.ts` | `releasePlugin()` | Full release flow: validate no duplicate tag, update manifests, validate changelog, bump `versions.json`, commit & tag |

---

## Key Conventions

- Every script file uses `/// <reference types="bun-types" />` at the top.
- Scripts are **pure exports** — no top-level side effects. The consuming plugin's entry script imports and calls them.
- `getPackageMetadata()` reads files relative to the **consumer's** working directory (i.e., `process.cwd()` of the calling plugin project), not this submodule.
- Beta detection: any version string containing `-` (e.g. `1.3.0-beta.1`) is treated as a pre-release.
- `releasePlugin()` commits with `--no-verify` intentionally (the release commit itself should bypass pre-commit hooks).

---

## Ultracite Code Standards

- **Format/fix**: `bun x ultracite fix`
- **Check**: `bun x ultracite check`
- Pre-commit hook (Lefthook) auto-runs `ultracite fix` on staged JS/TS/JSON files.

Follow the same standards as the consuming plugin: strict TypeScript, `for...of` over `forEach`, `const` by default, `async/await` over promise chains, early returns, no barrel files.
