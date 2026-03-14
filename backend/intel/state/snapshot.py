"""Snapshot state management for day-over-day diffs."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path


def slugify(url_or_name: str) -> str:
    """Convert a URL or repo name into a filesystem-safe slug."""
    slug = url_or_name.replace("https://", "").replace("http://", "")
    slug = re.sub(r"[^\w\-.]", "_", slug)
    slug = re.sub(r"_+", "_", slug).strip("_")
    return slug


class SnapshotStore:
    """Reads and writes snapshot files for diffing between runs."""

    def __init__(self, base_dir: str | Path):
        self.base = Path(base_dir)
        self.websites_dir = self.base / "websites"
        self.screenshots_dir = self.base / "screenshots"
        self.github_dir = self.base / "github"
        self.docs_dir = self.base / "docs"
        self.meta_path = self.base / "meta.json"

        for d in [self.websites_dir, self.screenshots_dir, self.github_dir, self.docs_dir]:
            d.mkdir(parents=True, exist_ok=True)

    def load_meta(self) -> dict:
        if self.meta_path.exists():
            return json.loads(self.meta_path.read_text())
        return {"last_run": None, "run_count": 0}

    def save_meta(self) -> None:
        meta = self.load_meta()
        meta["last_run"] = datetime.now(timezone.utc).isoformat()
        meta["run_count"] = meta.get("run_count", 0) + 1
        self.meta_path.write_text(json.dumps(meta, indent=2) + "\n")

    @property
    def metrics_history_path(self) -> Path:
        return self.base / "metrics_history.json"

    def load_metrics_history(self) -> list[dict]:
        if self.metrics_history_path.exists():
            return json.loads(self.metrics_history_path.read_text())
        return []

    def save_metrics_history(self, history: list[dict], max_days: int = 14) -> None:
        trimmed = history[-max_days:]
        self.metrics_history_path.write_text(
            json.dumps(trimmed, indent=2, default=str) + "\n"
        )

    def load_website(self, url: str) -> str | None:
        path = self.websites_dir / f"{slugify(url)}.md"
        return path.read_text() if path.exists() else None

    def save_website(self, url: str, content: str) -> None:
        path = self.websites_dir / f"{slugify(url)}.md"
        path.write_text(content)

    def get_screenshot_path(self, url: str) -> Path:
        return self.screenshots_dir / f"{slugify(url)}.png"

    def load_screenshot(self, url: str) -> Path | None:
        path = self.get_screenshot_path(url)
        return path if path.exists() else None

    def load_github(self, repo: str) -> dict | None:
        path = self.github_dir / f"{slugify(repo)}.json"
        if path.exists():
            return json.loads(path.read_text())
        return None

    def save_github(self, repo: str, data: dict) -> None:
        path = self.github_dir / f"{slugify(repo)}.json"
        path.write_text(json.dumps(data, indent=2, default=str) + "\n")

    def load_docs_sitemap(self, name: str) -> dict | None:
        path = self.docs_dir / f"{slugify(name)}_sitemap.json"
        if path.exists():
            return json.loads(path.read_text())
        return None

    def save_docs_sitemap(self, name: str, data: dict) -> None:
        path = self.docs_dir / f"{slugify(name)}_sitemap.json"
        path.write_text(json.dumps(data, indent=2) + "\n")

    def load_docs_page(self, name: str, url: str) -> str | None:
        pages_dir = self.docs_dir / slugify(name) / "pages"
        path = pages_dir / f"{slugify(url)}.md"
        return path.read_text() if path.exists() else None

    def save_docs_page(self, name: str, url: str, content: str) -> None:
        pages_dir = self.docs_dir / slugify(name) / "pages"
        pages_dir.mkdir(parents=True, exist_ok=True)
        path = pages_dir / f"{slugify(url)}.md"
        path.write_text(content)

    @property
    def is_first_run(self) -> bool:
        meta = self.load_meta()
        return meta.get("last_run") is None
