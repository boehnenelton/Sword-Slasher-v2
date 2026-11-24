/**
 * Library:         lib_bejson_Gaming_data_chunker.js
 * Family:          Gaming
 * Module Purpose:  BEJSON 105 / 104a Native Game Engine Data Chunker & Manifest MFDB Provider (JS Parity Mirror)
 * Architecture:    Flat BEJSON 104a text container serialization, O(1) field map caching, SHA-1 checksums, MFDB engine header manifest
 * Version:         1.0.5
 * Release_Version: 300
 * Date:            2026-11-01
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

export const CHUNKED_104A_FIELDS = [
  { name: 'File_Name', type: 'string' },
  { name: 'File_Extension', type: 'string' },
  { name: 'File_Content', type: 'string' },
  { name: 'File_Version', type: 'string' },
  { name: 'File_Hash', type: 'string' },
  { name: 'Relative_Path', type: 'string' },
  { name: 'Is_Binary', type: 'boolean' },
  { name: 'Is_Mounted', type: 'boolean' }
];

export class GamingDataChunker {
  constructor() {
    this.RELEASE_VERSION = 300;
  }

  async computeSha1Hash(text) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  sanitizeKey(key) {
    return key ? key.trim() : '';
  }

  createFieldMapCache(doc) {
    const fieldMap = {};
    if (!doc || !Array.isArray(doc.Fields)) return fieldMap;
    for (let i = 0; i < doc.Fields.length; i++) {
      const colName = this.sanitizeKey(doc.Fields[i].name);
      if (colName) {
        fieldMap[colName] = i;
      }
    }
    return fieldMap;
  }

  async createChunkPayload(files, contextNote, gameTitle = "Sword Slasher RPG: Shadow Link's Awakening") {
    const recordsMatrix = [];
    let totalBytes = 0;
    let binaryCount = 0;

    if (contextNote) {
      const ctxHash = await this.computeSha1Hash(contextNote);
      recordsMatrix.push([
        '!-CONTEXT.txt',
        '.txt',
        contextNote,
        '1.0.0',
        ctxHash,
        '!-CONTEXT.txt',
        false,
        false
      ]);
      totalBytes += contextNote.length;
    }

    for (const f of files) {
      const hash = f.fileHash || (await this.computeSha1Hash(f.fileContent));
      recordsMatrix.push([
        f.fileName,
        f.fileExtension,
        f.fileContent,
        f.fileVersion || '1.0.0',
        hash,
        f.relativePath,
        f.isBinary || false,
        f.isMounted || false
      ]);
      totalBytes += f.fileContent ? f.fileContent.length : 0;
      if (f.isBinary) binaryCount++;
    }

    const todayIso = new Date().toISOString().split('T')[0];

    const manifestHeader = {
      Engine_Name: 'Sword Slasher RPG Engine',
      Engine_Version: '300',
      Game_Title: gameTitle,
      BEJSON_Format: '104a',
      Author: 'Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton',
      Relational_ID: '105a0800-2026-1101-9999-000000000801',
      Total_Files: files.length,
      Total_Uncompressed_Bytes: totalBytes,
      Binary_Files_Count: binaryCount,
      Creation_Timestamp: todayIso
    };

    return {
      Format: 'BEJSON',
      Format_Version: '104a',
      Format_Creator: 'Elton Boehnen',
      Schema_Name: 'Chunked-104a-MFDB',
      Schema_Version: '1.0.5',
      Schema_Description: 'Native BEJSON Game Engine Single-File Chunker & Manifest MFDB Container',
      Engine_Name: 'Sword Slasher RPG Engine',
      Engine_Version: '300',
      Game_Title: gameTitle,
      Chunk_Date_YYYY_MM_DD: todayIso,
      Is_Mounted: 'False',
      Mount_Path: '',
      Manifest_Header: manifestHeader,
      Records_Type: ['Chunked'],
      Fields: CHUNKED_104A_FIELDS,
      Values: recordsMatrix
    };
  }

  extractChunkPayload(doc) {
    const fieldMap = this.createFieldMapCache(doc);
    const relIdx = fieldMap['Relative_Path'] ?? 5;
    const nameIdx = fieldMap['File_Name'] ?? 0;
    const extIdx = fieldMap['File_Extension'] ?? 1;
    const contentIdx = fieldMap['File_Content'] ?? 2;
    const verIdx = fieldMap['File_Version'] ?? 3;
    const hashIdx = fieldMap['File_Hash'] ?? 4;
    const binIdx = fieldMap['Is_Binary'] ?? 6;
    const mountIdx = fieldMap['Is_Mounted'] ?? 7;

    const results = [];
    const values = doc.Values || [];

    for (const row of values) {
      if (!Array.isArray(row)) continue;
      const relPath = String(row[relIdx] || '');
      if (relPath === '!-CONTEXT.txt') continue;

      results.push({
        fileName: String(row[nameIdx] || ''),
        fileExtension: String(row[extIdx] || ''),
        fileContent: String(row[contentIdx] || ''),
        fileVersion: String(row[verIdx] || '1.0.0'),
        fileHash: String(row[hashIdx] || ''),
        relativePath: relPath,
        isBinary: Boolean(row[binIdx]),
        isMounted: Boolean(row[mountIdx])
      });
    }

    return results;
  }

  getChunkFileContent(doc, targetRelativePath) {
    const fieldMap = this.createFieldMapCache(doc);
    const relIdx = fieldMap['Relative_Path'] ?? 5;
    const contentIdx = fieldMap['File_Content'] ?? 2;
    const normalizedTarget = targetRelativePath.trim().replace(/^\.\//, '');

    for (const row of doc.Values || []) {
      if (Array.isArray(row) && row.length > Math.max(relIdx, contentIdx)) {
        const curRel = String(row[relIdx]).replace(/^\.\//, '');
        if (curRel === normalizedTarget || curRel.endsWith('/' + normalizedTarget)) {
          return String(row[contentIdx]);
        }
      }
    }
    return null;
  }
}

export const gamingDataChunker = new GamingDataChunker();
