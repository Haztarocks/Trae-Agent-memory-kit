import fs from 'fs';
import path from 'path';

function readJSON<T = any>(p: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return fallback; }
}

function writeJSONAtomic(p: string, obj: any): void {
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, p);
}

export interface LastSession {
  updated_at: string;
  highlights: (string | { title: string })[];
  unresolved: string[];
  next_actions: (string | { title: string; priority?: string })[];
}

export interface Ledger {
  projects: any[];
  next_actions: { id?: string; title: string; details?: string; priority?: string }[];
}

export function ensureDefaults(memoryDir: string): void {
  fs.mkdirSync(memoryDir, { recursive: true });
  const summaryPath = path.join(memoryDir, 'last_session_summary.json');
  const ledgerPath = path.join(memoryDir, 'project_ledger.json');
  const relPath = path.join(memoryDir, 'relationship_log.md');

  if (!fs.existsSync(summaryPath)) {
    writeJSONAtomic(summaryPath, {
      updated_at: new Date().toISOString(),
      highlights: [],
      unresolved: [],
      next_actions: []
    } as LastSession);
  }
  if (!fs.existsSync(ledgerPath)) {
    writeJSONAtomic(ledgerPath, { projects: [], next_actions: [] } as Ledger);
  }
  if (!fs.existsSync(relPath)) {
    fs.writeFileSync(relPath, '');
  }
}

export function readLastSession(memoryDir: string): LastSession {
  const p = path.join(memoryDir, 'last_session_summary.json');
  return readJSON<LastSession>(p, { updated_at: new Date().toISOString(), highlights: [], unresolved: [], next_actions: [] });
}

export function writeLastSession(memoryDir: string, data: LastSession): void {
  const p = path.join(memoryDir, 'last_session_summary.json');
  data.updated_at = new Date().toISOString();
  writeJSONAtomic(p, data);
}

export function readLedger(memoryDir: string): Ledger {
  const p = path.join(memoryDir, 'project_ledger.json');
  return readJSON<Ledger>(p, { projects: [], next_actions: [] });
}

export function writeLedger(memoryDir: string, data: Ledger): void {
  const p = path.join(memoryDir, 'project_ledger.json');
  writeJSONAtomic(p, data);
}

export function appendHighlight(memoryDir: string, text: string): void {
  const s = readLastSession(memoryDir);
  s.highlights = [text, ...s.highlights];
  writeLastSession(memoryDir, s);
}

export function appendUnresolved(memoryDir: string, text: string): void {
  const s = readLastSession(memoryDir);
  s.unresolved = [text, ...s.unresolved];
  writeLastSession(memoryDir, s);
}

export function appendNextAction(memoryDir: string, textOrObj: string | { title: string; priority?: string }): void {
  const s = readLastSession(memoryDir);
  const entry = typeof textOrObj === 'string' ? { title: textOrObj } : textOrObj;
  s.next_actions = [entry, ...s.next_actions];
  writeLastSession(memoryDir, s);
}

export function appendRelationshipEntry(memoryDir: string, line: string): void {
  const p = path.join(memoryDir, 'relationship_log.md');
  const stamp = new Date().toISOString().slice(0, 10);
  const formatted = `- ${stamp} — ${line}`;
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  fs.writeFileSync(p, (prev ? prev + '\n' : '') + formatted + '\n');
}