import fs from 'fs';
import path from 'path';
import { readLastSession, readLedger } from './memoryOps.js';

function priorityBadge(p?: string): string {
  if (!p) return '';
  const s = String(p).toLowerCase();
  if (s.includes('high')) return '[high]';
  if (s.includes('medium')) return '[medium]';
  if (s.includes('low')) return '[low]';
  return '';
}

function top3(label: string, list: any[]): string {
  const items = Array.isArray(list) ? list : [];
  const top = items.slice(0, 3);
  const bullets = top.map((item: any) => {
    const title = typeof item === 'string' ? item : (item.title || item);
    if (label === 'Top Next-Actions') {
      const badge = priorityBadge((item && item.priority) || title);
      const hasTagAlready = /\[(high|medium|low)\]/i.test(String(title));
      return `- ${title}${badge && !hasTagAlready ? ' ' + badge : ''}`;
    }
    return `- ${title}`;
  });
  if (items.length > 3) bullets.push('- …');
  return `${label}\n${bullets.join('\n')}`;
}

export function generateBootstrap(memoryDir: string, agent?: string): string {
  const s = readLastSession(memoryDir);
  const l = readLedger(memoryDir);
  const highlights = s.highlights || [];
  const nextActions = (s.next_actions && s.next_actions.length ? s.next_actions : l.next_actions) || [];
  const lines: string[] = [];
  lines.push('Session Bootstrap');
  lines.push(top3('Top Highlights', highlights as any[]));
  lines.push(top3('Top Next-Actions', nextActions as any[]));
  lines.push(`Current Agent: ${agent || 'unknown'} | Mode: pro`);
  return lines.join('\n');
}

export function generateBootstrapRP(memoryDir: string, agent?: string): string {
  const relPath = path.join(memoryDir, 'relationship_log.md');
  const relLines = fs.existsSync(relPath) ? fs.readFileSync(relPath, 'utf8').split(/\r?\n/).filter(Boolean) : [];
  const latest = relLines.slice(-2);
  const header = 'Relational Continuity';
  const rcBlock = [header, ...latest].join('\n');
  return rcBlock + '\n\n' + generateBootstrap(memoryDir, agent);
}