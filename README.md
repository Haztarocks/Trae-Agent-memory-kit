# Trae Memory Kit — TypeScript-ready (JS MVP)

Portable Tier-2 agent memory utilities and a bootstrap CLI.

This MVP is JavaScript-first; a TypeScript migration is planned.

## Features
- PathResolver: auto-discovers the active agent memory directory
- MemoryOps: read/write/append for last_session_summary.json, project_ledger.json, relationship_log.md
- Bootstrap generator: outputs bootstrap.txt and bootstrap_rp.txt with Top Highlights/Next-Actions and priority badges
- CLI: `trae-bootstrap` to generate bootstraps (drop-in friendly)

## Usage (local dev)

Run the CLI directly:

```
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent <agent-name>
node packages/trae-memory-kit/bin/trae-bootstrap.js --agent <agent-name> --relational=true
```

Flags:
- `--agent <name>`: select agent (e.g., "sales", "shop")
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
3) Run the CLI directly (Windows examples — generic placeholders):
   - Standard bootstrap:
     - `node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <agent-name> --memory-dir ".\.trae\memory\<agent-name>"`
   - Relational bootstrap:
     - `node .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <agent-name> --memory-dir ".\.trae\memory\<agent-name>" --relational`
   - Using portable Node:
     - `.\node-v20.10.0-win-x64\node.exe .\packages\trae-memory-kit\bin\trae-bootstrap.js --agent <agent-name> --memory-dir ".\.trae\memory\<agent-name>" --relational`
4) Optional: add npm scripts in the target repo’s `package.json`:
```
"scripts": {
  "bootstrap:agent": "node .\\packages\\trae-memory-kit\\bin\\trae-bootstrap.js --agent <agent-name> --memory-dir .\\.trae\\memory\\<agent-name>",
  "bootstrap:agent:rp": "node .\\packages\\trae-memory-kit\\bin\\trae-bootstrap.js --agent <agent-name> --memory-dir .\\.trae\\memory\\<agent-name> --relational"
}
```

Inputs and outputs:
- Inputs (read-only; auto-created if missing): `commander_profile.json`, `last_session_summary.json`, `project_ledger.json`, `relationship_log.md` in your memory directory.
- Outputs: `bootstrap.txt` and (when `--relational`) `bootstrap_rp.txt` written into the same memory directory.

Notes:
- The kit only writes to the directory you pass with `--memory-dir` (or the resolved default). It does not modify other repos.
- `relational` can be passed as `--relational` (boolean) or shorthand `rp`.

## Portable launchers (Windows)

The kit ships with two universal launchers so you don’t need npm scripts or PATH gymnastics:
- PowerShell: run-kit.ps1
- CMD/Batch:  run-kit.cmd

Actions supported:
- fuse           generate fusion files (highlights, ledger, index) from a target repo
- bootstrap      write bootstrap.txt into an agent’s memory directory
- bootstrap:rp   write relational bootstrap_rp.txt (roleplay overlay)
- append         append fusion highlights/ledger into an existing bootstrap.txt

Node resolution order:
1) TRAE_NODE_EXE env var (absolute path to node.exe)
2) Portable Node in the target repo (e.g. `./node-v*/node.exe`)
3) System Node on PATH

### PowerShell examples

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

### CMD/Batch examples

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

Notes:
- Success output is intentionally minimal. Check the target memory directory for `bootstrap.txt` or the shared dir for fusion files.
- If a launcher can’t find Node, set `TRAE_NODE_EXE` explicitly as shown above.