#!/usr/bin/env python3
"""
Name:           data_chunker.py
Family:         Simple_Chunker
Description:    Dedicated CLI tool for BEJSON data chunking and serialization into flat containers (.104a.bejson.txt).
Version:        1.0.2
Date:           2026-11-12
Author:         Elton Boehnen · boehnenelton2024@gmail.com
RELATIONAL_ID:  fbb31187-7f51-4d63-85fe-320b9c179a56
"""

import os
import json
import sys
import hashlib
import logging

log = logging.getLogger("ss2.chunker")

def compute_sha1(payload_bytes: bytes) -> str:
    return hashlib.sha1(payload_bytes).hexdigest()

def run_chunker():
    compiler_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.abspath(os.path.join(compiler_dir, "../../../game_data/raw"))
    if not os.path.exists(raw_dir):
        raw_dir = os.path.abspath(os.path.join(compiler_dir, "../../../public/data"))

    output_dir = os.path.abspath(os.path.join(compiler_dir, "../Compiled"))
    os.makedirs(output_dir, exist_ok=True)

    records = []
    log.info(f"Chunker scanning: {raw_dir}")

    if os.path.exists(raw_dir):
        for root, _, files in os.walk(raw_dir):
            for file in sorted(files):
                if file.endswith(".bejson") or file.endswith(".json"):
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, raw_dir)
                    try:
                        with open(full_p, "r", encoding="utf-8") as f:
                            content = f.read()
                            h = compute_sha1(content.encode("utf-8"))
                            records.append([
                                file,
                                ".bejson",
                                content,
                                "1.0.5",
                                h,
                                rel_p,
                                False,
                                False
                            ])
                            log.info(f"Chunked: {rel_p}")
                    except Exception as e:
                        log.error(f"Error chunking {rel_p}: {e}")

    chunk_doc = {
        "Format": "BEJSON",
        "Format_Version": "104a",
        "Format_Creator": "Elton Boehnen",
        "Schema_Name": "Chunked Engine Data Container",
        "Schema_Version": "1.0",
        "Creation_Date": "2026-11-02",
        "Records_Type": ["ChunkFile"],
        "Fields": [
            {"name": "File_Name", "type": "string"},
            {"name": "File_Extension", "type": "string"},
            {"name": "File_Content", "type": "string"},
            {"name": "File_Version", "type": "string"},
            {"name": "File_Hash", "type": "string"},
            {"name": "Relative_Path", "type": "string"},
            {"name": "Is_Binary", "type": "boolean"},
            {"name": "Is_Mounted", "type": "boolean"}
        ],
        "Values": records
    }

    out_file = os.path.join(output_dir, "Chunked_Engine_Data.104a.bejson.txt")
    with open(out_file, "w", encoding="utf-8") as out_f:
        json.dump(chunk_doc, out_f, indent=2)

    log.info(f"[SUCCESS] Chunker created container with {len(records)} files -> {out_file}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    run_chunker()
