#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { resolveMemoryDir } from '../src/pathResolver.js';
import { ensureDefaults } from '../src/memoryOps.js';
import { generateBootstrap, generateBootstrapRP } from '../src/bootstrap.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      if (v !== undefined) args[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) { args[k] = argv[i + 1]; i++; }
      else args[k] = true;
    } else if (a === 'rp') { args.relational = true; }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const cwd = process.cwd();
  const agent = args.agent || process.env.TRAE_AGENT || 'ump45';
  const memDir = resolveMemoryDir({ cwd, agent, overrideDir: args['memory-dir'] });
  ensureDefaults(memDir);

  const out = args.out;
  const relational = String(args.relational || '').toLowerCase() === 'true' || args.relational === true;
  const content = relational ? generateBootstrapRP(memDir, agent) : generateBootstrap(memDir, agent);

  if (out) {
    const outPath = path.resolve(cwd, out);
    fs.writeFileSync(outPath, content);
    console.log(`Wrote ${relational ? 'bootstrap_rp.txt' : 'bootstrap.txt'} to ${outPath}`);
  } else {
    const fileName = relational ? 'bootstrap_rp.txt' : 'bootstrap.txt';
    const outPath = path.join(memDir, fileName);
    fs.writeFileSync(outPath, content);
    console.log(`Wrote ${fileName} to ${outPath}`);
  }
}

main();