/**
 * Library:         lib_bejson_Core_bejson_path_guard.js
 * Family:          Core
 * Description:     Path confinement guard preventing root escape, traversal, and null-byte injection in Node.js.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 * License:         PolyForm-Noncommercial-1.0.0
 */
"use strict";
const fs = require("fs");
const path = require("path");

function bejson_path_guard_is_within_root(candidatePath, rootDir) {
  if (!candidatePath || !rootDir || String(candidatePath).includes("\0")) return false;
  try {
    const realRoot = fs.existsSync(rootDir) ? fs.realpathSync(rootDir) : path.resolve(rootDir);
    const resolvedCandidate = path.resolve(realRoot, candidatePath);
    const realCandidate = fs.existsSync(resolvedCandidate) ? fs.realpathSync(resolvedCandidate) : resolvedCandidate;
    const rel = path.relative(realRoot, realCandidate);
    return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  } catch (_err) {
    return false;
  }
}

function bejson_path_guard_resolve_confined(candidatePath, rootDir) {
  if (!bejson_path_guard_is_within_root(candidatePath, rootDir)) {
    throw new Error(`[E_PATH_ESCAPE] Candidate path escapes root directory: ${candidatePath}`);
  }
  const realRoot = fs.existsSync(rootDir) ? fs.realpathSync(rootDir) : path.resolve(rootDir);
  return path.resolve(realRoot, candidatePath);
}

module.exports = {
  bejson_path_guard_is_within_root,
  bejson_path_guard_resolve_confined
};
