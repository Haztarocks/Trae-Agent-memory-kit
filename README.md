# Trae Memory Kit — TypeScript-ready (JS MVP)

Portable Tier-2 agent memory utilities and a bootstrap CLI.

This MVP is JavaScript-first to enable quick integration in Bremen Shop. TypeScript migration is planned.

## Features
- PathResolver: auto-discovers active agent memory dir
- MemoryOps: read/write/append for last_session_summary.json, project_ledger.json, relationship_log.md
- Bootstrap generator: outputs bootstrap.txt and bootstrap_rp.txt with bullet Top Highlights/Next-Actions and priority badges
- CLI: `trae-bootstrap` to generate bootstraps
 - CLI: `trae-bootstrap` to generate bootstraps (drop-in friendly)

## Usage (local dev)

Run the CLI directly:

```
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent ump45
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent shop --relational=true
```

Flags:
- `--agent <name>`: select agent (e.g., ump45, shop)
- `--memory-dir <path>`: override memory directory
- `--relational=true|false`: include relationship continuity in RP bootstrap
- `--out <file>`: override output file path

Precedence for memory directory:
1) env `TRAE_MEMORY_DIR`
2) `trae.config.json` + env `TRAE_AGENT` or `--agent`
3) scan `apps/*/trae_memory` (if exactly one)
4) fallback `.trae/memory/<agent>` (auto-create)

## Roadmap
- Convert to TypeScript and publish as `@haz/trae-memory-kit`
- Add Express middleware endpoints (optional)
- Add UI helper to inject bootstrap into viewer UIs

## Manual Drop-In (any repo)

You can copy this kit into any project and run it without publishing.

1) Copy the folder `packages/trae-memory-kit` into your target repo (e.g., `K:\AI\DigiMind\packages\trae-memory-kit`).
2) Ensure Node is available in that repo:
   - System Node on PATH, or
   - Portable Node in the repo root (e.g., `./node-v20.10.0-win-x64/node.exe`).
3) Run the CLI directly (Windows examples):
   - Standard bootstrap:
     - `node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent ump45-pro --memory-dir ".\.trae\memory\ump45-pro"`
   - Relational bootstrap:
     - `node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent ump45-pro --memory-dir ".\.trae\memory\ump45-pro" --relational`
   - Using portable Node:
     - `.\node-v20.10.0-win-x64\node.exe .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent ump45-pro --memory-dir ".\.trae\memory\ump45-pro" --relational`
4) Optional: add npm scripts in the target repo’s `package.json`:
```
"scripts": {
  "bootstrap:agent": "node .\\packages\\trae-memory-kit\\bin\\trae-bootstrap.js --agent ump45-pro --memory-dir .\\.trae\\memory\\ump45-pro",
  "bootstrap:agent:rp": "node .\\packages\\trae-memory-kit\\bin\\trae-bootstrap.js --agent ump45-pro --memory-dir .\\.trae\\memory\\ump45-pro --relational"
}
```

Inputs and outputs:
- Inputs (read-only; auto-created if missing): `commander_profile.json`, `last_session_summary.json`, `project_ledger.json`, `relationship_log.md` in your memory directory.
- Outputs: `bootstrap.txt` and (when `--relational`) `bootstrap_rp.txt` written into the same memory directory.

Notes:
- The kit only writes to the directory you pass with `--memory-dir` (or the resolved default). It does not modify other repos.
- `relational` can be passed as `--relational` (boolean) or shorthand `rp`.
## Portable launchers (Windows)

The kit ships with two universal launchers so you dont need npm scripts or PATH gymnastics:
- PowerShell: 
un-kit.ps1
- CMD/Batch:  
un-kit.cmd

Actions supported:
- use  generate fusion files (highlights, ledger, index) from a target repo
- ootstrap  write ootstrap.txt into an agents memory directory
- ootstrap:rp  write relational ootstrap_rp.txt (roleplay overlay)
- ppend  append fusion highlights/ledger into an existing ootstrap.txt

Node resolution order:
1) TRAE_NODE_EXE env var (absolute path to 
ode.exe)
2) Portable Node in the target repo (e.g. ./node-v*/node.exe)
3) System Node on PATH

### PowerShell examples

`powershell
# Optional: force a specific Node.exe (portable)
C:\Users\Haz\Documents\GitHub\Bremen shop\node-v20.10.0-win-x64\node.exe = 'C:\Users\Haz\Documents\GitHub\Bremen shop\node-v20.10.0-win-x64\node.exe'

# Generate fusion into the shops shared dir
./run-kit.ps1 fuse -ProjectDir 'C:\Users\Haz\Documents\GitHub\Bremen shop' -OutputDir '.\\.trae\\shared'

# Bootstrap UMP45 agent memory
./run-kit.ps1 bootstrap -Agent 'ump45' -MemoryDir 'C:\Users\Haz\Documents\GitHub\Bremen shop\apps\ump45\trae_memory'

# Relational bootstrap (shop overlays)
./run-kit.ps1 bootstrap:rp -Agent 'shop' -MemoryDir 'C:\Users\Haz\Documents\GitHub\Bremen shop\apps\shop\trae_memory'

# Append fusion into existing bootstrap
./run-kit.ps1 append -MemoryDir 'C:\Users\Haz\Documents\GitHub\Bremen shop\apps\ump45\trae_memory'
`



Notes:
- Success output is intentionally minimal. Check the target memory directory for ootstrap.txt or the shared dir for fusion files.
- If a launcher cant find Node, set TRAE_NODE_EXE explicitly as shown above.

