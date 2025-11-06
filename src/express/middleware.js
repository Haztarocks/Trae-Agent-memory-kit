import fs from 'fs';
import path from 'path';
import { resolveMemoryDir } from '../pathResolver.js';
import { ensureDefaults, appendRelationshipEntry } from '../memoryOps.js';
import { generateBootstrap } from '../bootstrap.js';

// Optional Express middleware endpoints (ESM). Pass your express module in.
export function createTraeMemoryRoutes(express, opts = {}) {
  const router = express.Router();

  function getMemoryDir(req) {
    const agent = opts.agent || (req.query && req.query.agent) || undefined;
    const mem = resolveMemoryDir({ agent, overrideDir: opts.memoryDirOverride });
    ensureDefaults(mem);
    return mem;
  }

  router.get('/api/agent/bootstrap', (req, res) => {
    const agent = opts.agent || (req.query && req.query.agent) || undefined;
    const mem = getMemoryDir(req);
    const txt = generateBootstrap(mem, agent);
    res.type('text/plain').send(txt);
  });

  router.get('/api/relationship/latest', (req, res) => {
    const mem = getMemoryDir(req);
    const relPath = path.join(mem, 'relationship_log.md');
    const lines = fs.existsSync(relPath) ? fs.readFileSync(relPath, 'utf8').split(/\r?\n/).filter(Boolean) : [];
    res.json({ latest: lines.slice(-5) });
  });

  router.post('/api/clientlog', (req, res) => {
    const mem = getMemoryDir(req);
    const body = req.body || {};
    const level = String(body.level || 'info');
    const event = String(body.event || 'client_event');
    const message = String(body.message || '');
    appendRelationshipEntry(mem, `[client:${level}] ${event} — ${message}`);
    res.json({ ok: true });
  });

  return router;
}