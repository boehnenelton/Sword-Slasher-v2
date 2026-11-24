/**
 * Library:         lib_bejson_Core_bejson_104db_parser.js
 * Family:          Core
 * Description:     Multi-entity BEJSON 104db/105db Record_Type_Parent partition parser for Node.js.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   6aff99c1-6344-41b5-8038-dd45a13da201
 * License:         PolyForm-Noncommercial-1.0.0
 */
"use strict";
function bejson_104db_group_by_parent(doc) {
  if (!doc || !Array.isArray(doc.Fields) || !Array.isArray(doc.Values)) return {};
  const is105 = String(doc.Format_Version || "").startsWith("105");
  const parentIdx = is105 ? 1 : 0;
  const groups = {};
  for (const row of doc.Values) {
    const parent = String(row[parentIdx] || "Unknown");
    if (!groups[parent]) groups[parent] = [];
    groups[parent].push(row);
  }
  return groups;
}
module.exports = { bejson_104db_group_by_parent };
