# Trae Memory Kit — Usage Guide

Portable Tier-2 agent memory utilities and a bootstrap CLI. ESM-first, TypeScript-ready, with optional Express and a tiny UI helper.

Contents
- Install (GitHub Packages or local repo)
- CLI usage (trae-bootstrap)
- Programmatic usage (ESM Node)
- Config and environment
- Priority badges behavior
- Optional Express middleware + UI helper (appendix)

## Install

Published package (recommended after release):
1) Add an `.npmrc` (do not commit secrets):
```
@haz:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_TOKEN}
```
2) In your app’s `package.json`:
```
"dependencies": {
  "@haz/trae-memory-kit": "^1.0.0"
}
```
3) Install:
```
npm install
```

Local repo (pre-publish):
- Import directly from this repo path, e.g. `./packages/trae-memory-kit/src/*` for JS or build TS to `dist/`.

Node version: use Node 18+ (ESM).

## CLI usage — `trae-bootstrap`

Generates bootstrap text files to prime session continuity.

After publish:
```
npx trae-bootstrap --agent <AGENT_NAME>
npx trae-bootstrap --agent <AGENT_NAME> --relational
```

Flags:
- `--agent <name>`: select agent (default resolves via config/env)
- `--relational`: include Relational Continuity block (uses `relationship_log.md`)
- `--out <path>`: write to a specific output file
- `--memory-dir <memoryDir>`: override target memory directory

Outputs:
- `bootstrap.txt`: Top Highlights and Top Next-Actions (with priority badges)
- `bootstrap_rp.txt`: Relational Continuity + the standard bootstrap

Pre-publish (local JS):
```
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME>
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME> --relational
```

### Manual drop-in quickstart (any repo)

You can run the kit without installing from a registry by copying the folder into your project.

1) Copy `packages/trae-memory-kit` into your target repo.
2) Ensure Node is available:
   - System Node on PATH, or a portable Node binary in the repo (e.g., `./node-v20.10.0-win-x64/node.exe`).
3) Run commands from the target repo root.

Windows examples:
```
:: Standard bootstrap
node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <AGENT_NAME> --memory-dir ".\.trae\memory\<AGENT_NAME>"

:: Relational bootstrap
node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <AGENT_NAME> --memory-dir ".\.trae\memory\<AGENT_NAME>" --relational

:: Using portable node
.\node-v20.10.0-win-x64\node.exe .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <AGENT_NAME> --memory-dir ".\.trae\memory\<AGENT_NAME>" --relational
```

macOS/Linux examples:
```
# Standard bootstrap
node ./packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME> --memory-dir "./.trae/memory/<AGENT_NAME>"

# Relational bootstrap
node ./packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME> --memory-dir "./.trae/memory/<AGENT_NAME>" --relational
```

Optional package.json scripts in the target repo:
```
"scripts": {
  "bootstrap:agent": "node ./packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME> --memory-dir ./.trae/memory/<AGENT_NAME>",
  "bootstrap:agent:rp": "node ./packages/trae-memory-kit/bin/trae-bootstrap.js --agent <AGENT_NAME> --memory-dir ./.trae/memory/<AGENT_NAME> --relational"
}
```

Inputs and outputs
- Inputs (read-only; defaults created if missing):
  - commander_profile.json
  - last_session_summary.json
  - project_ledger.json
  - relationship_log.md
- Outputs (written to the same memory dir):
  - bootstrap.txt
  - bootstrap_rp.txt (when `--relational` is used)

Tip: You can also pass `rp` as a shorthand flag (e.g., `node ... rp`) to enable relational mode.

## Programmatic usage (ESM Node)

Import the ESM modules (after TS build, use `dist/*`; pre-publish within repo, use `src/*`).

Example: generate bootstraps and write to memory directory
```js
import fs from 'fs';
import path from 'path';
// After publish:
// import { resolveMemoryDir } from '@haz/trae-memory-kit/dist/pathResolver.js';
// import { ensureDefaults, appendHighlight, appendNextAction } from '@haz/trae-memory-kit/dist/memoryOps.js';
// import { generateBootstrap, generateBootstrapRP } from '@haz/trae-memory-kit/dist/bootstrap.js';

// Pre-publish (local repo):
import { resolveMemoryDir } from './packages/trae-memory-kit/src/pathResolver.js';
import { ensureDefaults, appendHighlight, appendNextAction } from './packages/trae-memory-kit/src/memoryOps.js';
import { generateBootstrap, generateBootstrapRP } from './packages/trae-memory-kit/src/bootstrap.js';

const agent = '<AGENT_NAME>';
const memoryDir = resolveMemoryDir({ agent });
ensureDefaults(memoryDir);

// Update memory (optional, memory hygiene)
appendHighlight(memoryDir, 'Trae Memory Kit integrated, badges live.');
appendNextAction(memoryDir, { title: 'Publish kit to GH Packages', priority: 'high' });

// Generate bootstrap texts
const txt = generateBootstrap(memoryDir, agent);
fs.writeFileSync(path.join(memoryDir, 'bootstrap.txt'), txt);

const rp = generateBootstrapRP(memoryDir, agent);
fs.writeFileSync(path.join(memoryDir, 'bootstrap_rp.txt'), rp);
```

### APIs you’ll use most

Path resolution:
```js
resolveMemoryDir({ agent?: string, overrideDir?: string, cwd?: string }): string
```

Memory ops:
```js
ensureDefaults(memoryDir: string): void
appendHighlight(memoryDir: string, text: string): void
appendNextAction(memoryDir: string, textOrObj: string | { title: string; priority?: string }): void
appendRelationshipEntry(memoryDir: string, line: string): void
// Also: readLastSession, writeLastSession, readLedger, writeLedger
```

Bootstrap generators:
```js
generateBootstrap(memoryDir: string, agent?: string): string
generateBootstrapRP(memoryDir: string, agent?: string): string
```

## Config and environment

Resolution precedence (memory directory):
1) `overrideDir` passed to resolver/CLI
2) `TRAE_MEMORY_DIR` env var
3) `trae.config.json` (optional): `{ "defaultAgent": "ump45", "memoryStrategy": "apps" }`
4) Scan apps/*/trae_memory; prefer selected agent if multiple are found
5) Fallback to `.trae/memory/<agent>` (created if missing)

Agent selection precedence:
1) CLI `--agent` or resolver `agent` option
2) `TRAE_AGENT` env var
3) `trae.config.json.defaultAgent`
4) default `ump45`

## Priority badges behavior

- Badges recognized: `[high]`, `[medium]`, `[low]`
- Source: `next_actions[i].priority` or embedded tag in the title string
- Deduplication: if the title already includes a badge, the formatter will not add another one
- Display: only “Top Next-Actions” section shows badges; highlights render as-is

## Appendix — Optional Express middleware + UI helper

If you later want HTTP endpoints/UI without wiring programmatic calls:

Express (ESM):
```js
import express from 'express';
// After publish:
// import { createTraeMemoryRoutes } from '@haz/trae-memory-kit/dist/express/middleware.js';
// Pre-publish:
import { createTraeMemoryRoutes } from './packages/trae-memory-kit/src/express/middleware.js';

const app = express();
app.use(express.json());
app.use(createTraeMemoryRoutes(express, { agent: '<AGENT_NAME>' }));
app.listen(3000);
```

UI helper (ESM):
```html
<pre id="bootstrap"></pre>
<script type="module">
  // After publish:
  // import { injectBootstrapToElement } from '@haz/trae-memory-kit/dist/ui/inject.js';
  // Pre-publish:
  import { injectBootstrapToElement } from '/packages/trae-memory-kit/src/ui/inject.js';
  injectBootstrapToElement('bootstrap');
</script>
```

That’s it — keep it simple, keep it tactical. When you’re ready to publish, switch import paths to `@haz/trae-memory-kit/dist/*` and use `npx trae-bootstrap` in your scripts.

## Portable launchers cheat sheet

PowerShell:
```
# Optional: force a specific Node.exe (portable)
$env:TRAE_NODE_EXE = "<PROJECT_DIR>\node-v20.10.0-win-x64\node.exe"

# Generate fusion into the repo’s shared dir
./run-kit.ps1 fuse -ProjectDir '<PROJECT_DIR>' -OutputDir '.\.trae\shared'

# Bootstrap an agent memory (fallback path)
./run-kit.ps1 bootstrap -Agent '<AGENT_NAME>' -MemoryDir '.\.trae\memory\<AGENT_NAME>'

# Relational bootstrap (roleplay overlay)
./run-kit.ps1 bootstrap:rp -Agent '<AGENT_NAME>' -MemoryDir '.\.trae\memory\<AGENT_NAME>'

# Append fusion into existing bootstrap
./run-kit.ps1 append -MemoryDir '.\.trae\memory\<AGENT_NAME>'
```

CMD/Batch:
```
:: Optional: force a specific Node.exe (portable)
set TRAE_NODE_EXE=<PROJECT_DIR>\node-v20.10.0-win-x64\node.exe

:: Generate fusion into the repo’s shared dir
run-kit.cmd fuse --projectdir "<PROJECT_DIR>" --output-dir ".\.trae\shared"

:: Bootstrap an agent memory (fallback path)
run-kit.cmd bootstrap --agent <AGENT_NAME> --memory-dir ".\.trae\memory\<AGENT_NAME>"

:: Relational bootstrap (roleplay overlay)
run-kit.cmd bootstrap:rp --agent <AGENT_NAME> --memory-dir ".\.trae\memory\<AGENT_NAME>"

:: Append fusion into existing bootstrap
run-kit.cmd append --memory-dir ".\.trae\memory\<AGENT_NAME>"
```

Node resolution order: `TRAE_NODE_EXE` > portable Node in repo > system PATH.