#!/usr/bin/env bash
# Engines/PY/run.sh - Async background server manager launcher for Flask Parity Engine
# PolyForm-Noncommercial-1.0.0 · Elton Boehnen

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/server_manager.py" "$@"
