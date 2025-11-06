"use strict";
const fs = require("fs");
const path = require("path");

function getArg(name, defVal) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return defVal;
}

const repoRoot = process.cwd();
const defaultMemory = path.join(repoRoot, "apps", "ump45", "trae_memory");
const memoryDir = path.resolve(getArg("--memory-dir", defaultMemory));
const fusionFile = path.join(repoRoot, ".trae", "shared", "fusion_highlights.md");

function safeRead(p) {
  try {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  } catch (_) {}
  return "";
}

function appendSection(target) {
  if (!fs.existsSync(target)) return;
  const fusion = safeRead(fusionFile);
  if (!fusion) return;
  const section = [
    "",
    "----------------------------------------",
    "Project Fusion Highlights (read-only)",
    "----------------------------------------",
    fusion,
    "",
  ].join("\n");
  const existing = safeRead(target);
  // Avoid duplicate appends: check for the marker line
  if (existing.includes("Project Fusion Highlights (read-only)")) return;
  fs.appendFileSync(target, section, "utf8");
  console.log(`Appended fusion to ${target}`);
}

function main() {
  appendSection(path.join(memoryDir, "bootstrap.txt"));
  appendSection(path.join(memoryDir, "bootstrap_rp.txt"));
}

main();