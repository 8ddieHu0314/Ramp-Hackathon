"""Screenshot capture via Playwright and pixel diffing via Pillow."""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def take_screenshot(url: str, output_path: Path) -> bool:
    """Take a screenshot of a URL using Playwright."""
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.screenshot(path=str(output_path), full_page=True)
            browser.close()
        return True
    except Exception:
        logger.exception("Failed to screenshot %s", url)
        return False


def diff_screenshots(old_path: Path, new_path: Path) -> dict:
    """Compare two screenshots and return diff info."""
    try:
        from PIL import Image, ImageChops

        old_img = Image.open(old_path).convert("RGB")
        new_img = Image.open(new_path).convert("RGB")

        # Resize to same dimensions for comparison
        min_w = min(old_img.width, new_img.width)
        min_h = min(old_img.height, new_img.height)
        old_resized = old_img.resize((min_w, min_h))
        new_resized = new_img.resize((min_w, min_h))

        diff = ImageChops.difference(old_resized, new_resized)
        bbox = diff.getbbox()

        if bbox is None:
            return {"changed": False, "diff_percent": 0.0}

        # Calculate percentage of changed pixels
        diff_pixels = sum(1 for px in diff.getdata() if any(c > 10 for c in px))
        total_pixels = min_w * min_h
        diff_percent = round((diff_pixels / total_pixels) * 100, 2)

        return {
            "changed": True,
            "diff_percent": diff_percent,
            "diff_bbox": bbox,
            "old_size": (old_img.width, old_img.height),
            "new_size": (new_img.width, new_img.height),
        }
    except Exception:
        logger.exception("Failed to diff screenshots")
        return {"changed": False, "error": "diff failed"}


def capture_and_diff(
    url: str, current_path: Path, previous_path: Path | None
) -> dict:
    """Take a screenshot and compare with previous if available."""
    success = take_screenshot(url, current_path)
    if not success:
        return {"url": url, "captured": False}

    result = {"url": url, "captured": True}

    if previous_path and previous_path.exists():
        diff_info = diff_screenshots(previous_path, current_path)
        result.update(diff_info)
    else:
        result["changed"] = False
        result["first_capture"] = True

    return result
