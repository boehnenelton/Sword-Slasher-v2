# dev/security-notes.md - Security Analysis & Mitigations

## 2026-11-13 (V1.0.54 / PKG154)
- FIXED: `Compile.py` menu launched the chunker through `os.system` with an unquoted, interpolated path (shell-injection / path-with-spaces failure). Now an argv list via `subprocess.run`.
- NOTE: `Engines/PY/app.py` binds `flask_host` from `config.json` (default 127.0.0.1). Passing `--host 0.0.0.0` exposes the Flask development server and `/api/data/*` on the LAN with no auth. Keep loopback unless intentionally testing from another device.
- NOTE: Flask runs the Werkzeug development server (`debug=False`). Not for production deployment.
- CHECKED: no API keys, tokens or credentials in `Engines/` code or configs; secrets remain in the secure env store only.
