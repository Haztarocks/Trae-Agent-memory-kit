"use strict";
const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const sharedDir = path.join(repoRoot, ".trae", "shared");
const fusionHighlights = path.join(sharedDir, "fusion_highlights.md");
const fusionLedger = path.join(sharedDir, "fusion_ledger.md");
const fusionIndex = path.join(sharedDir, "fusion_index.json");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function safeReadJson(p) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (_) {}
  return null;
}

function listAgentMemoryDirs() {
  const dirs = [];
  // Pattern A: .trae/memory/*
  const memRoot = path.join(repoRoot, ".trae", "memory");
  if (fs.existsSync(memRoot)) {
    for (const name of fs.readdirSync(memRoot)) {
      const p = path.join(memRoot, name);
      if (fs.statSync(p).isDirectory()) dirs.push(p);
    }
  }
  // Pattern B: apps/*/trae_memory
  const appsRoot = path.join(repoRoot, "apps");
  if (fs.existsSync(appsRoot)) {
    for (const agent of fs.readdirSync(appsRoot)) {
      const p = path.join(appsRoot, agent, "trae_memory");
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) dirs.push(p);
    }
  }
  return dirs;
}

function resolveAgentTag(memoryDir) {
  const meta = safeReadJson(path.join(memoryDir, "bootstrap_meta.json"));
  if (meta && meta.agent) return String(meta.agent);
  // Fallback: basename of dir (e.g., ump45-pro or trae_memory)
  const base = path.basename(memoryDir);
  if (base.toLowerCase() === "trae_memory") {
    // If it's apps/NAME/trae_memory, use NAME
    const parent = path.basename(path.dirname(memoryDir));
    return parent || base;
  }
  return base;
}

function collectFromDir(memoryDir) {
  const tag = resolveAgentTag(memoryDir);
  const last = safeReadJson(path.join(memoryDir, "last_session_summary.json")) || {};
  const ledger = safeReadJson(path.join(memoryDir, "project_ledger.json")) || {};

  const highlights = Array.isArray(last.highlights) ? last.highlights : [];
  const unresolved = Array.isArray(last.unresolved) ? last.unresolved : [];
  const nextActions = Array.isArray(last.next_actions)
    ? last.next_actions
    : Array.isArray(ledger.next_actions) ? ledger.next_actions : [];

  return { tag, highlights, unresolved, nextActions };
}

function renderHighlightsMd(blocks) {
  const ts = new Date().toISOString();
  const lines = [
    `# Fusion Highlights`,
    `[generated: ${ts}]`,
    "",
    "Note: Read-only aggregation from per-agent memory. Do not edit here.",
    "",
  ];
  for (const b of blocks) {
    lines.push(`## [agent: ${b.tag}]`, "");
    if (b.highlights.length) {
      lines.push("Highlights:");
      for (const h of b.highlights) lines.push(`- ${String(h)}`);
      lines.push("");
    } else {
      lines.push("Highlights: (none)", "");
    }
    if (b.unresolved.length) {
      lines.push("Unresolved:");
      for (const u of b.unresolved) lines.push(`- ${String(u)}`);
      lines.push("");
    }
    if (b.nextActions.length) {
      lines.push("Next actions:");
      for (const n of b.nextActions) lines.push(`- ${String(n)}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function renderLedgerMd(blocks) {
  const ts = new Date().toISOString();
  const lines = [`# Fusion Ledger`, `[generated: ${ts}]`, ""]; 
  for (const b of blocks) {
    lines.push(`## [agent: ${b.tag}]`);
    if (b.nextActions.length) {
      for (const n of b.nextActions) lines.push(`- ${String(n)}`);
    } else {
      lines.push("- (no next actions)");
    }
    lines.push("");
  }
  return lines.join("\n");
}

function main() {
  ensureDir(sharedDir);
  const dirs = listAgentMemoryDirs();
  const blocks = dirs.map(collectFromDir);
  fs.writeFileSync(fusionHighlights, renderHighlightsMd(blocks), "utf8");
  fs.writeFileSync(fusionLedger, renderLedgerMd(blocks), "utf8");
  fs.writeFileSync(
    fusionIndex,
    JSON.stringify({ generated_at: new Date().toISOString(), agents: blocks.map(b => b.tag) }, null, 2),
    "utf8"
  );
  console.log(`Fusion written:\n- ${fusionHighlights}\n- ${fusionLedger}`);
}

main();