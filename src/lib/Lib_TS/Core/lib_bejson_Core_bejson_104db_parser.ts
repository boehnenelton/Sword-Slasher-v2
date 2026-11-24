/**
 * Library:         lib_bejson_Core_bejson_104db_parser.ts
 * Family:          Core
 * Description:     Multi-entity BEJSON 104db/105db Record_Type_Parent partition parser for TypeScript.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 * License:         PolyForm-Noncommercial-1.0.0
 */
export function bejson_104db_group_by_parent(doc: Record<string, any>): Record<string, any[][]> {
  if (!doc || !Array.isArray(doc.Fields) || !Array.isArray(doc.Values)) return {};
  const is105 = String(doc.Format_Version || "").startsWith("105");
  const parentIdx = is105 ? 1 : 0;
  const groups: Record<string, any[][]> = {};
  for (const row of doc.Values) {
    const parent = String(row[parentIdx] || "Unknown");
    if (!groups[parent]) groups[parent] = [];
    groups[parent].push(row);
  }
  return groups;
}
