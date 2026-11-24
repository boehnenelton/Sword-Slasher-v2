#!/usr/bin/env python3
"""
# Name:           server_manager.py
# Description:    Async background server lifecycle manager for Sword Slasher Flask Engine
# Version:        102
# Date Created:   2026-11-13
# Author:         Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
# License:        PolyForm-Noncommercial-1.0.0
# RELATIONAL_ID:  fbb31187-7f51-4d63-85fe-320b9c179a56
"""

from __future__ import annotations
import logging
import os
import signal
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

SCRIPT_PATH: Path = Path(__file__).resolve()
APP_DIR: Path = SCRIPT_PATH.parent
APP_PY: Path = APP_DIR / "app.py"
PID_FILE: Path = APP_DIR / ".server.pid"
LOG_FILE: Path = APP_DIR / "server.log"

PYTHON: str = sys.executable

DEFAULT_PORT: int = 5000
DEFAULT_HOST: str = "127.0.0.1"

# ANSI (49-col mobile portrait ceiling)
RED   = "\033[38;2;222;38;38m"
WHITE = "\033[1;37m"
DIM   = "\033[0;37m"
RESET = "\033[0m"
DIV   = "=" * 49
SUB   = "-" * 49


log = logging.getLogger("ss2.server_manager")


def _setup_logging() -> None:
    """INFO to stdout, ERROR+ to stderr, message-only format (colours are in the message)."""
    if log.handlers:
        return
    out = logging.StreamHandler(sys.stdout)
    out.addFilter(lambda r: r.levelno < logging.ERROR)
    err = logging.StreamHandler(sys.stderr)
    err.setLevel(logging.ERROR)
    for h in (out, err):
        h.setFormatter(logging.Formatter("%(message)s"))
        log.addHandler(h)
    log.setLevel(logging.INFO)
    log.propagate = False


def _ui(text: str = "") -> None:
    """Interactive banner/menu rendering (user-facing UI, not diagnostics)."""
    sys.stdout.write(text + "\n")
    sys.stdout.flush()


def log_ok(msg: str) -> None:
    log.info(f"{WHITE}[✓] {msg.lower()}{RESET}")


def log_fail(msg: str) -> None:
    log.error(f"{RED}[✗] {msg.upper()}{RESET}")


def read_pid() -> int | None:
    if PID_FILE.exists():
        try:
            return int(PID_FILE.read_text().strip())
        except ValueError:
            pass
    return None


def is_running(pid: int | None) -> bool:
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    # Guard against PID reuse after a crash: confirm the PID is still our app.py.
    cmdline = Path(f"/proc/{pid}/cmdline")
    try:
        if cmdline.exists():
            return "app.py" in cmdline.read_bytes().decode("utf-8", errors="ignore")
    except OSError:
        pass
    return True


def start(host: str, port: int) -> None:
    if is_running(read_pid()):
        log_fail(f"server already running on port {port}")
        return

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    log_fh = open(LOG_FILE, "a", encoding="utf-8")

    proc = subprocess.Popen(
        [PYTHON, str(APP_PY), "--host", host, "--port", str(port), "--no-browser"],
        stdout=log_fh,
        stderr=log_fh,
        start_new_session=True,
    )
    log_fh.close()
    PID_FILE.write_text(str(proc.pid))

    # Wait for the port to accept connections (first run may compile the bundle).
    probe_host = "127.0.0.1" if host in ("", "0.0.0.0") else host
    ready = False
    deadline = time.time() + 20
    while time.time() < deadline:
        if proc.poll() is not None:
            break
        try:
            # Probe the app's own endpoint, not just the port, so a foreign listener
            # on the same port is never mistaken for our server.
            with urllib.request.urlopen(f"http://{probe_host}:{port}/api/data/config", timeout=1) as resp:
                if resp.status == 200:
                    ready = True
                    break
        except (OSError, ValueError):
            pass
        time.sleep(0.3)

    if not ready:
        if proc.poll() is None:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except OSError:
                pass
        PID_FILE.unlink(missing_ok=True)
        log_fail("server failed to start - last log lines:")
        tail_log(15)
        return

    url = f"http://localhost:{port}"
    log_ok(f"server started — pid {proc.pid}")
    log_ok(f"url: {url}")

    # Copy URL to Termux clipboard
    try:
        subprocess.run(
            ["termux-clipboard-set", url],
            timeout=3, check=False, capture_output=True,
        )
        log_ok("url copied to clipboard")
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Launch Chrome via Android Activity Manager
    opened = False
    try:
        res = subprocess.run(
            ["am", "start", "-n",
             "com.android.chrome/com.google.android.apps.chrome.Main",
             "-d", url],
            timeout=4, check=False, capture_output=True,
        )
        if res.returncode == 0:
            opened = True
            log_ok("chrome launched")
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    if not opened:
        try:
            subprocess.run(["termux-open-url", url],
                           timeout=4, check=False, capture_output=True)
            log_ok("browser opened via termux-open-url")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            try:
                subprocess.run(["xdg-open", url],
                               timeout=4, check=False, capture_output=True)
            except (FileNotFoundError, subprocess.TimeoutExpired):
                pass


def stop() -> None:
    pid = read_pid()
    if not is_running(pid):
        log_fail("no server running")
        PID_FILE.unlink(missing_ok=True)
        return
    try:
        os.killpg(os.getpgid(pid), signal.SIGTERM)
        time.sleep(0.6)
        if is_running(pid):
            os.killpg(os.getpgid(pid), signal.SIGKILL)
        PID_FILE.unlink(missing_ok=True)
        log_ok("server stopped")
    except Exception as exc:
        log_fail(f"stop failed: {exc}")


def status_banner(port: int) -> None:
    pid = read_pid()
    running = is_running(pid)
    state   = f"{WHITE}RUNNING{RESET}" if running else f"{RED}STOPPED{RESET}"
    pid_str = str(pid) if running else "—"
    url     = f"http://localhost:{port}" if running else "—"
    _ui(f"{DIM}{DIV}{RESET}")
    _ui(f" {RED}SS2 FLASK ENGINE SERVER{RESET}")
    _ui(f"{DIM}{SUB}{RESET}")
    _ui(f" {RED}Status:{RESET}  {state}")
    _ui(f" {RED}PID:{RESET}     {DIM}{pid_str}{RESET}")
    _ui(f" {RED}URL:{RESET}     {DIM}{url}{RESET}")
    _ui(f" {RED}Log:{RESET}     {DIM}{LOG_FILE.name}{RESET}")
    _ui(f"{DIM}{DIV}{RESET}")


def tail_log(lines: int = 30) -> None:
    if not LOG_FILE.exists():
        log_fail("no server.log yet")
        return
    all_lines = LOG_FILE.read_text(encoding="utf-8", errors="replace").splitlines()
    for line in all_lines[-lines:]:
        _ui(line)


def tui_menu(host: str, port: int) -> None:
    while True:
        status_banner(port)
        _ui(f"{DIM}{SUB}{RESET}")
        _ui(f"  [{RED}1{RESET}] {WHITE}Start{RESET}")
        _ui(f"  [{RED}2{RESET}] {WHITE}Stop{RESET}")
        _ui(f"  [{RED}3{RESET}] {WHITE}Restart{RESET}")
        _ui(f"  [{RED}4{RESET}] {WHITE}View log (last 30){RESET}")
        _ui(f"  [{RED}5{RESET}] {WHITE}Refresh status{RESET}")
        _ui(f"  [{RED}0{RESET}] {WHITE}Exit{RESET}")
        _ui(f"{DIM}{DIV}{RESET}")
        try:
            choice = input(f"{RED}>{RESET} ").strip()
        except (EOFError, KeyboardInterrupt):
            _ui()
            break
        if choice == "1":
            start(host, port)
        elif choice == "2":
            stop()
        elif choice == "3":
            stop(); time.sleep(0.5); start(host, port)
        elif choice == "4":
            tail_log()
        elif choice == "5":
            pass
        elif choice == "0":
            break
        else:
            log_fail("unknown option")


def main() -> int:
    import argparse
    _setup_logging()
    parser = argparse.ArgumentParser(prog="server_manager")
    parser.add_argument("command", nargs="?", default="menu",
                        choices=["start", "stop", "restart", "status", "log", "menu"])
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--host", default=DEFAULT_HOST)
    args = parser.parse_args()

    if args.command == "start":
        start(args.host, args.port)
    elif args.command == "stop":
        stop()
    elif args.command == "restart":
        stop(); time.sleep(0.5); start(args.host, args.port)
    elif args.command == "status":
        status_banner(args.port)
    elif args.command == "log":
        tail_log()
    else:
        tui_menu(args.host, args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
