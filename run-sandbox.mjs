import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import * as core from "./lib/core.js";

const HOST = process.env.HOSTDIR;
const DSH_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "purge-home-"));
process.env.DSH_HOME = DSH_HOME;
const SANDBOX = fs.mkdtempSync(path.join(os.tmpdir(), "purge-host-")) + "/@deepseek-ai";
fs.mkdirSync(SANDBOX, { recursive: true });
const files = core.targetFiles(HOST, DSH_HOME);
let copied = 0;
for (const value of Object.values(files)) {
  for (const fp of (Array.isArray(value) ? value : [value])) {
    if (!fp || typeof fp !== "string" || !fp.startsWith(HOST) || !fs.existsSync(fp)) continue;
    const rel = path.relative(HOST, fp);
    const dst = path.join(SANDBOX, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(fp, dst);
    copied += 1;
  }
}
console.log(`sandbox: ${SANDBOX} (${copied} files copied)`);
const report = await core.applyPatches(SANDBOX, core.ALL_PATCHES);
const ok = ["applied", "already", "na", "skipped"];
const bad = report.filter((row) => !ok.includes(row.status));
console.log(`applied: ${report.filter(r => r.status === "applied").length} | already: ${report.filter(r => r.status === "already").length} | na: ${report.filter(r => r.status === "na").length} | skipped: ${report.filter(r => r.status === "skipped").length} | missing_file: ${report.filter(r => r.status === "missing_file").length} | pending: ${report.filter(r => r.status === "pending").length} | FAILED: ${bad.length}`);
for (const row of bad) console.log(`  BAD #${row.patch_id} ${row.name}: ${row.status} ${row.error || ""}`);
for (const row of report) if (row.status === "missing_file") console.log(`  missing #${row.patch_id} ${row.name}`);
