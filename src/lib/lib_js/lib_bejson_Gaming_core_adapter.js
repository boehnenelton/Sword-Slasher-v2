/**
 * Library:         lib_bejson_Gaming_core_adapter.js
 * Family:          Gaming
 * Module Purpose:  Engine-facing field-map cache / sanitization adapter (BejsonCoreEngine + bejsonCore singleton)
 * Architecture:    Standalone, non-frozen module. Extracted verbatim from the top-level copy of
 *                  lib_bejson_Core_bejson_core.js so the frozen Core family stays untouched.
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-15
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

class BejsonCoreEngine {
    constructor() {
        this.fieldMapCache = new Map();
    }

    sanitizeString(val) {
        return typeof val === 'string' ? val.trim() : val;
    }

    buildFieldMapCache(docKey, fields) {
        const map = new Map();
        if (Array.isArray(fields)) {
            fields.forEach((f, idx) => {
                const cleanName = this.sanitizeString(f.name);
                map.set(cleanName, idx);
            });
        }
        this.fieldMapCache.set(docKey, map);
        return map;
    }

    getFieldValue(docKey, row, fieldName) {
        const map = this.fieldMapCache.get(docKey);
        if (!map) {
            return null;
        }
        const cleanFieldName = this.sanitizeString(fieldName);
        const colIdx = map.get(cleanFieldName);
        if (colIdx === undefined || colIdx < 0 || colIdx >= row.length) {
            return null;
        }
        const val = row[colIdx];
        return typeof val === 'string' ? this.sanitizeString(val) : val;
    }

    validateDocument(doc) {
        const errors = [];
        if (!doc || doc.Format !== 'BEJSON') {
            errors.push("Invalid format");
        }
        return { valid: errors.length === 0, errors };
    }
}

export const bejsonCore = new BejsonCoreEngine();

// Preserve the global the Core copy used to publish (window.BEJSON.bejsonCore / .BejsonCoreEngine).
if (typeof window !== 'undefined') {
    window.BEJSON = window.BEJSON || {};
    window.BEJSON.BejsonCoreEngine = BejsonCoreEngine;
    window.BEJSON.bejsonCore = bejsonCore;
}

export default bejsonCore;
export { BejsonCoreEngine };
