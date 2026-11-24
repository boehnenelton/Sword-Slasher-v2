/**
 * Library:         lib_bejson_Core_bejson_upgrade.js
 * Family:          Core
 * Description:     Atomic BEJSON 104 to Format 105 upgrade engine with UUIDv4 minting for Node.js.
 * Version:         1.0.0
 * Release_Version: 301
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * RELATIONAL_ID:   ade28979-f318-4fbe-960c-6615f942c6eb
 * License:         PolyForm-Noncommercial-1.0.0
 */
"use strict";
const crypto = require("crypto");

function bejson_upgrade_104_to_105(doc) {
  if (!doc || typeof doc !== "object") throw new Error("Invalid BEJSON document");
  const ver = String(doc.Format_Version || "104");
  if (ver.startsWith("105")) return doc;
  const targetVer = ver === "104a" ? "105a" : ver === "104db" ? "105db" : "105";
  const upgraded = JSON.parse(JSON.stringify(doc));
  upgraded.Format_Version = targetVer;
  upgraded.Fields = (upgraded.Fields || []).map(f => ({
    ...f,
    field_uuid: f.field_uuid || crypto.randomUUID()
  }));
  upgraded.Values = (upgraded.Values || []).map(row => [crypto.randomUUID(), ...row]);
  return upgraded;
}

module.exports = { bejson_upgrade_104_to_105 };
