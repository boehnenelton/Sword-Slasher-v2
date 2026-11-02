/**
 * Library:         lib_bejson_Core_bejson_core.ts
 * Family:          Core
 * Module Purpose:  BEJSON Core Standard Parser, Field Map Cache, and Record Ingestion Engine
 * Architecture:    BEJSON Era 105 specification parser with boundary sanitization and O(1) Field Map Caching
 * Version:         3.0.0
 * Release_Version: 300
 * Date:            2026-10-27
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   105a0301-2026-1027-9999-000000000301
 */

import {
  E_BEJSON_INVALID_FORMAT,
  E_BEJSON_INVALID_CREATOR,
  E_BEJSON_UNSUPPORTED_VERSION,
  E_BEJSON_RECORD_LENGTH_MISMATCH,
  E_BEJSON_NULL_VIOLATION,
  E_BEJSON_ENUM_VIOLATION,
  E_BEJSON_FIELD_MAP_NOT_BUILT
} from './lib_bejson_Core_bejson_errors';

export const RELEASE_VERSION = 300;

export interface BejsonFieldDef {
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
  Schema_Version: string;
  Session_Id?: string;
  Project_Name?: string;
  Records_Type: string[];
  Fields: BejsonFieldDef[];
  Values: (string | number | boolean | null)[][];
}

export class BejsonCoreEngine {
  private fieldMapCache: Map<string, Map<string, number>> = new Map();

  public sanitizeString(val: string): string {
    return typeof val === 'string' ? val.trim() : val;
  }

  public buildFieldMapCache(docKey: string, fields: BejsonFieldDef[]): Map<string, number> {
    const map = new Map<string, number>();
    fields.forEach((f, idx) => {
      const cleanName = this.sanitizeString(f.name);
      map.set(cleanName, idx);
    });
    this.fieldMapCache.set(docKey, map);
    return map;
  }

  public getFieldValue(docKey: string, row: (string | number | boolean | null)[], fieldName: string): any {
    const map = this.fieldMapCache.get(docKey);
    if (!map) {
      throw new Error(`${E_BEJSON_FIELD_MAP_NOT_BUILT}: Field map cache not found for '${docKey}'`);
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
      errors.push(`${E_BEJSON_INVALID_FORMAT}: Format must equal 'BEJSON'`);
    }
    if (doc.Format_Creator !== 'Elton Boehnen') {
      errors.push(`${E_BEJSON_INVALID_CREATOR}: Format_Creator must equal 'Elton Boehnen'`);
    }
    if (!['104a', '105', '105a', '105db'].includes(doc.Format_Version)) {
      errors.push(`${E_BEJSON_UNSUPPORTED_VERSION}: Unsupported Format_Version '${doc.Format_Version}'`);
    }

    const fields = doc.Fields || [];
    const values = doc.Values || [];

    values.forEach((row, rowIndex) => {
      if (row.length !== fields.length) {
        errors.push(`${E_BEJSON_RECORD_LENGTH_MISMATCH}: Row ${rowIndex} has ${row.length} columns, expected ${fields.length}`);
      }
      fields.forEach((fDef, colIndex) => {
        const val = row[colIndex];
        if ((val === null || val === undefined) && fDef.required) {
          errors.push(`${E_BEJSON_NULL_VIOLATION}: Row ${rowIndex} field '${fDef.name}' is required`);
        }
        if (fDef.enum && typeof val === 'string' && !fDef.enum.includes(val)) {
          errors.push(`${E_BEJSON_ENUM_VIOLATION}: Row ${rowIndex} field '${fDef.name}' value '${val}' not in [${fDef.enum.join(', ')}]`);
        }
      });
    });

    return { valid: errors.length === 0, errors };
  }
}

export const bejsonCore = new BejsonCoreEngine();
