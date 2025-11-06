import fs from 'fs';
import path from 'path';

function fileExists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
}

function readJSONSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

export function resolveMemoryDir({ cwd = process.cwd(), agent, overrideDir } = {}) {
  // 1) explicit override
  if (overrideDir) return path.resolve(cwd, overrideDir);

  // 2) env TRAE_MEMORY_DIR
  if (process.env.TRAE_MEMORY_DIR) {
    return path.resolve(cwd, process.env.TRAE_MEMORY_DIR);
  }

  // 3) config + env TRAE_AGENT/param
  const configPath = path.resolve(cwd, 'trae.config.json');
  const cfg = fileExists(configPath) ? readJSONSafe(configPath) : null;
  const selectedAgent = agent || process.env.TRAE_AGENT || (cfg && cfg.defaultAgent) || 'ump45';
  const strategy = (cfg && cfg.memoryStrategy) || 'apps';

  if (strategy === 'apps') {
    // Try apps/<agent>/trae_memory
    const candidate = path.join(cwd, 'apps', selectedAgent, 'trae_memory');
    if (fileExists(candidate)) return candidate;
  }

  // 4) scan apps/*/trae_memory; if exactly one found, use it
  const appsDir = path.join(cwd, 'apps');
  if (fileExists(appsDir)) {
    const children = fs.readdirSync(appsDir, { withFileTypes: true });
    const memoryDirs = [];
    for (const d of children) {
      if (d.isDirectory()) {
        const p = path.join(appsDir, d.name, 'trae_memory');
        if (fileExists(p)) memoryDirs.push(p);
      }
    }
    if (memoryDirs.length === 1) return memoryDirs[0];
    // Prefer matching agent when multiple
    const preferred = memoryDirs.find(p => p.includes(path.sep + selectedAgent + path.sep));
    if (preferred) return preferred;
  }

  // 5) fallback .trae/memory/<agent>
  const fallback = path.join(cwd, '.trae', 'memory', selectedAgent);
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}