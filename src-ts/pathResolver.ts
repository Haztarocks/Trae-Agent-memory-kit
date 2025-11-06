import fs from 'fs';
import path from 'path';

function fileExists(p: string): boolean {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
}

function readJSONSafe<T = any>(p: string): T | null {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

export interface ResolveOpts { cwd?: string; agent?: string; overrideDir?: string; }

export function resolveMemoryDir({ cwd = process.cwd(), agent, overrideDir }: ResolveOpts = {}): string {
  if (overrideDir) return path.resolve(cwd, overrideDir);
  if (process.env.TRAE_MEMORY_DIR) return path.resolve(cwd, process.env.TRAE_MEMORY_DIR);

  const configPath = path.resolve(cwd, 'trae.config.json');
  const cfg = fileExists(configPath) ? readJSONSafe<any>(configPath) : null;
  const selectedAgent = agent || process.env.TRAE_AGENT || (cfg && cfg.defaultAgent) || 'ump45';
  const strategy = (cfg && cfg.memoryStrategy) || 'apps';

  if (strategy === 'apps') {
    const candidate = path.join(cwd, 'apps', selectedAgent, 'trae_memory');
    if (fileExists(candidate)) return candidate;
  }

  const appsDir = path.join(cwd, 'apps');
  if (fileExists(appsDir)) {
    const children = fs.readdirSync(appsDir, { withFileTypes: true });
    const memoryDirs: string[] = [];
    for (const d of children) {
      if (d.isDirectory()) {
        const p = path.join(appsDir, d.name, 'trae_memory');
        if (fileExists(p)) memoryDirs.push(p);
      }
    }
    if (memoryDirs.length === 1) return memoryDirs[0];
    const preferred = memoryDirs.find(p => p.includes(path.sep + selectedAgent + path.sep));
    if (preferred) return preferred;
  }

  const fallback = path.join(cwd, '.trae', 'memory', selectedAgent);
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}