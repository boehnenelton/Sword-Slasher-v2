/**
 * Library:         lib_bejson_Core_bejson_upgrade.ts
 * Family:          Core
 * Description:     Atomic BEJSON 104 to Format 105 upgrade engine with UUIDv4 minting for TypeScript.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 * License:         PolyForm-Noncommercial-1.0.0
 */
import * as crypto from "crypto";

export function bejson_upgrade_104_to_105(doc: Record<string, any>): Record<string, any> {
  if (!doc || typeof doc !== "object") throw new Error("Invalid BEJSON document");
  const ver = String(doc.Format_Version || "104");
  if (ver.startsWith("105")) return doc;
  const targetVer = ver === "104a" ? "105a" : ver === "104db" ? "105db" : "105";
  const upgraded = JSON.parse(JSON.stringify(doc));
  upgraded.Format_Version = targetVer;
  upgraded.Fields = (upgraded.Fields || []).map((f: any) => ({
    ...f,
    field_uuid: f.field_uuid || crypto.randomUUID()
  }));
  upgraded.Values = (upgraded.Values || []).map((row: any[]) => [crypto.randomUUID(), ...row]);
  return upgraded;
}
