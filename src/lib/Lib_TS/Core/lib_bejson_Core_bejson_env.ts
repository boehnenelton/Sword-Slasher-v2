/**
 * Library:         lib_bejson_Core_bejson_env.ts
 * Family:          Core
 * Description:     Dynamic DEFINITIONS_FILE environment variable loader and ENV: pointer resolver for TypeScript.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 * License:         PolyForm-Noncommercial-1.0.0
 */
import * as fs from "fs";
import * as path from "path";

export function resolve_path(inputPath: string): string {
  if (!inputPath) return inputPath;
  if (inputPath.startsWith("ENV:")) {
    const key = inputPath.slice(4).trim();
    return process.env[key] || inputPath;
  }
  return path.resolve(inputPath);
}

export function load_definitions(defFile?: string): Record<string, string> {
  const target = defFile || process.env.DEFINITIONS_FILE;
  if (!target || !fs.existsSync(target)) return {};
  try {
    const doc = JSON.parse(fs.readFileSync(target, "utf8"));
    const out: Record<string, string> = {};
    if (Array.isArray(doc.Values)) {
      for (const row of doc.Values) {
        if (Array.isArray(row) && row.length >= 2) out[String(row[0])] = String(row[1]);
      }
    }
    return out;
  } catch {
    return {};
  }
}
