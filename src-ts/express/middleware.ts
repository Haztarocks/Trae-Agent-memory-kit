import type { Request, Response, NextFunction } from 'express';
import { resolveMemoryDir } from '../pathResolver.js';
import { ensureDefaults, appendRelationshipEntry } from '../memoryOps.js';
import { generateBootstrap } from '../bootstrap.js';

export interface MiddlewareOptions {
  agent?: string;
  memoryDirOverride?: string;
}

export function createTraeMemoryRoutes(opts: MiddlewareOptions = {}) {
  // Avoid hard dependency on express; expect caller to pass in an express.Router
  const express = require('express');
  const router = express.Router();

  function getMemoryDir(req: Request): string {
    const agent = opts.agent || (req.query.agent as string) || undefined;
    const mem = resolveMemoryDir({ agent, overrideDir: opts.memoryDirOverride });
    ensureDefaults(mem);
    return mem;
  }

  router.get('/api/agent/bootstrap', (req: Request, res: Response) => {
    const agent = opts.agent || (req.query.agent as string) || undefined;
    const mem = getMemoryDir(req);
    const txt = generateBootstrap(mem, agent);
    res.type('text/plain').send(txt);
  });

  router.get('/api/relationship/latest', (req: Request, res: Response) => {
    const mem = getMemoryDir(req);
    const fs = require('fs');
    const path = require('path');
    const relPath = path.join(mem, 'relationship_log.md');
    const lines = fs.existsSync(relPath) ? fs.readFileSync(relPath, 'utf8').split(/\r?\n/).filter(Boolean) : [];
    res.json({ latest: lines.slice(-5) });
  });

  router.post('/api/clientlog', (req: Request, res: Response, _next: NextFunction) => {
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