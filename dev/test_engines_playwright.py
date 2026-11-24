"""
Library:         test_engines_playwright.py
Family:          Shadow Link Awakening Dev Suite
Module Purpose:  Playwright E2E UI & Combat Engine Automated Test Suite for Vanilla JS and Experimental Engines
Architecture:    Headless Chromium via termux_playwright with localized HTTP static server
Version:         1.0.0
Release_Version: 300
Date:            2026-11-23
Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
License:         PolyForm-Noncommercial-1.0.0
Format_Creator:  Elton Boehnen
RELATIONAL_ID:   4e91024a-2026-1123-9999-000000000888
"""

import os
import sys
import time
import socket
import logging
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from termux_playwright import sync_playwright_termux, launch_sync

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("ss2.playwright")

REPO_ROOT = "/storage/emulated/0/Admin/Dev/Repos/Shadow_Link_Awakening"
EXP_IMG_DIR = os.path.join(REPO_ROOT, "Images", "Experimental_Engine")
JS_IMG_DIR = os.path.join(REPO_ROOT, "Images", "JS_Engine")
PORT = 8765

os.makedirs(EXP_IMG_DIR, exist_ok=True)
os.makedirs(JS_IMG_DIR, exist_ok=True)


class QuietHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO_ROOT, **kwargs)

    def log_message(self, format, *args):
        # Quiet normal GET requests to avoid console bloat
        pass


def start_server():
    server = HTTPServer(("127.0.0.1", PORT), QuietHTTPHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    log.info(f"Local static server running on http://127.0.0.1:{PORT}")
    return server


def run_tests():
    server = start_server()
    time.sleep(1)

    errors = []

    with sync_playwright_termux() as playwright_instance:
        log.info("Launching headless Chromium via termux_playwright...")
        browser = launch_sync(playwright_instance, headless=True)
        context = browser.new_context(viewport={"width": 480, "height": 860})
        page = context.new_page()
        monitor_root = os.environ.get("PLAYWRIGHT_MONITOR_ROOT", "/storage/emulated/0/Admin/System/playwright_monitor")
        if os.path.isdir(monitor_root) and monitor_root not in sys.path:
            sys.path.insert(0, monitor_root)
        try:
            from feed_helper import attach_live_feed
            attach_live_feed(page)
        except Exception as feed_exc:
            log.debug(f"Live feed helper skipped: {feed_exc}")

        # Capture console errors
        def on_console(msg):
            if msg.type in ["error"]:
                if "favicon.ico" in msg.text or "status of 404" in msg.text:
                    return
                log.warning(f"Browser Console Error: {msg.text}")
                errors.append(msg.text)

        def on_page_error(err):
            log.error(f"Page Error: {err}")
            errors.append(str(err))

        page.on("console", on_console)
        page.on("pageerror", on_page_error)

        # -------------------------------------------------------------
        # PART 1: TEST EXPERIMENTAL STANDALONE ENGINE
        # -------------------------------------------------------------
        log.info("=" * 60)
        log.info("TESTING EXPERIMENTAL STANDALONE ENGINE")
        log.info("=" * 60)

        exp_url = f"http://127.0.0.1:{PORT}/Engines/Experimental/Compiled/standalone-game.html"
        log.info(f"Navigating to {exp_url}")
        page.goto(exp_url, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_selector("#gameCanvas", timeout=10000)
        time.sleep(1)

        # 01 Intro Screen
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "01_intro_screen.png"))
        log.info("Captured Experimental 01_intro_screen.png")

        # Dismiss Intro -> Enters Shadow Cave (Home Base · Supertile 0x00)
        page.click("#intro-screen")
        time.sleep(0.8)

        # 02 Shadow Cave Home Base Initial Boot (Supertile 0x00)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "02_real_game_world_init.png"))
        log.info("Captured Experimental 02_real_game_world_init.png (Shadow Cave Home Base)")

        # 02b Walk South out of Shadow Cave into Empty 8x8 Overworld Grid (Sector 0x1B)
        page.keyboard.down("s")
        time.sleep(1.8)
        page.keyboard.up("s")
        time.sleep(0.4)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "02b_overworld_sector_0x1B_threshold.png"))
        log.info("Captured Experimental 02b_overworld_sector_0x1B_threshold.png (Overworld Sector 0x1B)")

        # 03 Open System Menu via SELECT button
        page.click("#btn-select")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "03_select_menu_overlay.png"))
        log.info("Captured Experimental 03_select_menu_overlay.png")

        # 04 Flip Debug Mode Switch ON -> Warps to Debug Chamber & unlocks room controls
        page.click("#btn-toggle-debug")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "04_debug_mode_active_menu.png"))
        log.info("Captured Experimental 04_debug_mode_active_menu.png")

        # Resume Game / Close Menu
        page.click("#btn-resume-game")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "05_debug_chamber_map.png"))
        log.info("Captured Experimental 05_debug_chamber_map.png")

        # Test room switching in Debug Mode
        page.click("#btn-room-sanctuary")
        time.sleep(0.6)
        page.click("#btn-room-cavern")
        time.sleep(0.6)
        page.click("#btn-room-courtyard")
        time.sleep(0.6)

        # Return to Debug Chamber for Mechanics
        page.click("#btn-room-debug")
        time.sleep(0.6)

        # 06 Player Movement & Camera Tracking
        page.keyboard.down("d")
        time.sleep(0.7)
        page.keyboard.up("d")
        page.keyboard.down("s")
        time.sleep(0.5)
        page.keyboard.up("s")
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "06_player_movement_camera.png"))
        log.info("Captured Experimental 06_player_movement_camera.png")

        # 07 Sword Slash Action (B button)
        page.keyboard.press("b")
        time.sleep(0.12)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "07_sword_slash_action.png"))
        log.info("Captured Experimental 07_sword_slash_action.png")
        time.sleep(0.5)

        # 08 Boomerang / Ancilla Item Action (Y button)
        page.keyboard.press("y")
        time.sleep(0.18)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "08_boomerang_action.png"))
        log.info("Captured Experimental 08_boomerang_action.png")
        time.sleep(0.8)

        # 09 Joystick Active UI
        joystick = page.query_selector("#joystick")
        if joystick:
            box = joystick.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                page.mouse.move(box["x"] + box["width"] / 2 + 15, box["y"] + box["height"] / 2 + 15)
                time.sleep(0.1)
                page.screenshot(path=os.path.join(EXP_IMG_DIR, "09_joystick_active_red.png"))
                page.mouse.up()
                log.info("Captured Experimental 09_joystick_active_red.png")

        # 10 Button B Active UI
        btn_b = page.query_selector("#btn-b")
        if btn_b:
            box = btn_b.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                time.sleep(0.1)
                page.screenshot(path=os.path.join(EXP_IMG_DIR, "10_btn_b_active_red.png"))
                page.mouse.up()
                log.info("Captured Experimental 10_btn_b_active_red.png")

        # 11 Button Y Active UI
        btn_y = page.query_selector("#btn-y")
        if btn_y:
            box = btn_y.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                time.sleep(0.1)
                page.screenshot(path=os.path.join(EXP_IMG_DIR, "11_btn_y_active_red.png"))
                page.mouse.up()
                log.info("Captured Experimental 11_btn_y_active_red.png")

        # 12 & 13 Enemy AI Awareness & Lock-on
        # Move toward enemy to alert AI
        page.keyboard.down("a")
        time.sleep(0.6)
        page.keyboard.up("a")
        page.keyboard.down("w")
        time.sleep(0.5)
        page.keyboard.up("w")
        time.sleep(0.3)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "12_enemy_ai_awareness_alert.png"))
        log.info("Captured Experimental 12_enemy_ai_awareness_alert.png")

        time.sleep(0.8)
        page.screenshot(path=os.path.join(EXP_IMG_DIR, "13_enemy_ai_lockon_telegraph.png"))
        log.info("Captured Experimental 13_enemy_ai_lockon_telegraph.png")

        # -------------------------------------------------------------
        # PART 2: TEST VANILLA JS PARITY ENGINE
        # -------------------------------------------------------------
        log.info("=" * 60)
        log.info("TESTING VANILLA JS PARITY ENGINE")
        log.info("=" * 60)

        js_url = f"http://127.0.0.1:{PORT}/Engines/JS/index.html"
        log.info(f"Navigating to {js_url}")
        page.goto(js_url, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_selector("#gameCanvas", timeout=10000)
        time.sleep(1.2)

        # 01 Shadow Cave Home Base Initial Boot (Supertile 0x00)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "01_real_game_world_init.png"))
        log.info("Captured JS Engine 01_real_game_world_init.png (Shadow Cave Home Base)")

        # 01b Walk South out of Shadow Cave into Empty 8x8 Overworld Grid (Sector 0x1B)
        page.keyboard.down("s")
        time.sleep(1.8)
        page.keyboard.up("s")
        time.sleep(0.4)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "01b_overworld_sector_0x1B_threshold.png"))
        log.info("Captured JS Engine 01b_overworld_sector_0x1B_threshold.png (Overworld Sector 0x1B)")

        # 02 Open System Menu via SELECT button
        page.click("#btn-select")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "02_select_menu_overlay.png"))
        log.info("Captured JS Engine 02_select_menu_overlay.png")

        # 03 Flip Debug Mode Switch ON -> Warps to Debug Chamber & unlocks controls bar
        page.click("#btn-toggle-debug")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "03_debug_mode_active_menu.png"))
        log.info("Captured JS Engine 03_debug_mode_active_menu.png")

        # Resume Game / Close Menu
        page.click("#btn-resume-game")
        time.sleep(0.5)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "04_debug_chamber_map.png"))
        log.info("Captured JS Engine 04_debug_chamber_map.png")

        # Test room switching in Debug Mode
        page.click("#btn-room-sanctuary")
        time.sleep(0.6)
        page.click("#btn-room-cavern")
        time.sleep(0.6)
        page.click("#btn-room-courtyard")
        time.sleep(0.6)

        # Return to Debug Chamber
        page.click("#btn-room-debug")
        time.sleep(0.6)

        # 05 Player Movement & Camera
        page.keyboard.down("d")
        time.sleep(0.7)
        page.keyboard.up("d")
        page.keyboard.down("s")
        time.sleep(0.5)
        page.keyboard.up("s")
        page.screenshot(path=os.path.join(JS_IMG_DIR, "05_player_movement_camera.png"))
        log.info("Captured JS Engine 05_player_movement_camera.png")

        # 06 Sword Slash Action
        page.keyboard.press("b")
        time.sleep(0.12)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "06_sword_slash_action.png"))
        log.info("Captured JS Engine 06_sword_slash_action.png")
        time.sleep(0.5)

        # 07 Boomerang / Ancilla Item Action
        page.keyboard.press("y")
        time.sleep(0.18)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "07_boomerang_action.png"))
        log.info("Captured JS Engine 07_boomerang_action.png")
        time.sleep(0.8)

        # 08 Joystick Active
        joystick = page.query_selector("#joystick")
        if joystick:
            box = joystick.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                page.mouse.move(box["x"] + box["width"] / 2 + 15, box["y"] + box["height"] / 2 + 15)
                time.sleep(0.1)
                page.screenshot(path=os.path.join(JS_IMG_DIR, "08_joystick_active_red.png"))
                page.mouse.up()
                log.info("Captured JS Engine 08_joystick_active_red.png")

        # 09 Button B Active
        btn_b = page.query_selector("#btn-b")
        if btn_b:
            box = btn_b.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                time.sleep(0.1)
                page.screenshot(path=os.path.join(JS_IMG_DIR, "09_btn_b_active_red.png"))
                page.mouse.up()
                log.info("Captured JS Engine 09_btn_b_active_red.png")

        # 10 Button Y Active
        btn_y = page.query_selector("#btn-y")
        if btn_y:
            box = btn_y.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.mouse.down()
                time.sleep(0.1)
                page.screenshot(path=os.path.join(JS_IMG_DIR, "10_btn_y_active_red.png"))
                page.mouse.up()
                log.info("Captured JS Engine 10_btn_y_active_red.png")

        # 11 & 12 Enemy AI
        page.keyboard.down("a")
        time.sleep(0.6)
        page.keyboard.up("a")
        page.keyboard.down("w")
        time.sleep(0.5)
        page.keyboard.up("w")
        time.sleep(0.3)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "11_enemy_ai_awareness_alert.png"))
        log.info("Captured JS Engine 11_enemy_ai_awareness_alert.png")

        time.sleep(0.8)
        page.screenshot(path=os.path.join(JS_IMG_DIR, "12_enemy_ai_lockon_telegraph.png"))
        log.info("Captured JS Engine 12_enemy_ai_lockon_telegraph.png")

        browser.close()

    server.shutdown()
    log.info("=" * 60)
    log.info(f"PLAYWRIGHT TESTS COMPLETE. Recorded {len(errors)} browser errors.")
    log.info("=" * 60)
    return errors


if __name__ == "__main__":
    errs = run_tests()
    if errs:
        sys.exit(1)
    sys.exit(0)
