import fs from 'fs';
import path from 'path';

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function writeJSONAtomic(p, obj) {
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, p);
}

export function ensureDefaults(memoryDir) {
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
    });
  }

  if (!fs.existsSync(ledgerPath)) {
    writeJSONAtomic(ledgerPath, {
      projects: [],
      next_actions: []
    });
  }

  if (!fs.existsSync(relPath)) {
    fs.writeFileSync(relPath, '');
  }
}

export function readLastSession(memoryDir) {
  const p = path.join(memoryDir, 'last_session_summary.json');
  return readJSON(p, { updated_at: new Date().toISOString(), highlights: [], unresolved: [], next_actions: [] });
}

export function writeLastSession(memoryDir, data) {
  const p = path.join(memoryDir, 'last_session_summary.json');
  data.updated_at = new Date().toISOString();
  writeJSONAtomic(p, data);
}

export function readLedger(memoryDir) {
  const p = path.join(memoryDir, 'project_ledger.json');
  return readJSON(p, { projects: [], next_actions: [] });
}

export function writeLedger(memoryDir, data) {
  const p = path.join(memoryDir, 'project_ledger.json');
  writeJSONAtomic(p, data);
}

export function appendHighlight(memoryDir, text) {
  const s = readLastSession(memoryDir);
  s.highlights = [text, ...s.highlights];
  writeLastSession(memoryDir, s);
}

export function appendUnresolved(memoryDir, text) {
  const s = readLastSession(memoryDir);
  s.unresolved = [text, ...s.unresolved];
  writeLastSession(memoryDir, s);
}

export function appendNextAction(memoryDir, textOrObj) {
  const s = readLastSession(memoryDir);
  const entry = typeof textOrObj === 'string' ? { title: textOrObj } : textOrObj;
  s.next_actions = [entry, ...s.next_actions];
  writeLastSession(memoryDir, s);
}

export function appendRelationshipEntry(memoryDir, line) {
  const p = path.join(memoryDir, 'relationship_log.md');
  const stamp = new Date().toISOString().slice(0, 10);
  const formatted = `- ${stamp} — ${line}`;
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  fs.writeFileSync(p, (prev ? prev + '\n' : '') + formatted + '\n');
}