/**
 * Library:         lib_bejson_Gaming_core_adapter.ts
 * Family:          Gaming
 * Module Purpose:  TypeScript Engine-facing field-map cache / sanitization adapter (BejsonCoreEngine + bejsonCore singleton)
 * Architecture:    Standalone, non-frozen module mirroring lib_bejson_Gaming_core_adapter.js so frozen Lib_TS/Core stays untouched.
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-24
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * License:         PolyForm-Noncommercial-1.0.0
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export interface BejsonField {
  name: string;
  type: string;
  required?: boolean;
  primary_key?: boolean;
  enum?: string[];
  foreign_key?: {
    references: string;
    on_delete: string;
  };
}

export interface BejsonDocument {
  Format: string;
  Format_Version: string;
  Format_Creator: string;
  Schema_Version?: string;
  Parent_Hierarchy?: string;
  Write_Owner_Module?: string;
  Primary_Key_Field?: string;
  Type_Discriminator_Field?: string;
  Domain_Type_Field?: string;
  Records_Type: string[];
  Fields: BejsonField[];
  Values: any[][];
  [key: string]: any;
}

export class BejsonCoreEngine {
  private fieldMapCache: Map<string, Map<string, number>> = new Map();

  public sanitizeString<T>(val: T): T {
    return (typeof val === 'string' ? val.trim() : val) as T;
  }

  public buildFieldMapCache(docKey: string, fields: BejsonField[]): Map<string, number> {
    const map = new Map<string, number>();
    if (Array.isArray(fields)) {
      fields.forEach((f, idx) => {
        const cleanName = this.sanitizeString(f.name);
        map.set(cleanName, idx);
      });
    }
    this.fieldMapCache.set(docKey, map);
    return map;
  }

  public getFieldValue(docKey: string, row: any[], fieldName: string): any {
    const map = this.fieldMapCache.get(docKey);
    if (!map || !Array.isArray(row)) {
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

  public validateDocument(doc: BejsonDocument): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!doc || doc.Format !== 'BEJSON') {
      errors.push('Invalid format');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const bejsonCore = new BejsonCoreEngine();
export default bejsonCore;
