"""JSON file-based CRUD for projects."""

from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

DATA_DIR = Path(__file__).parent.parent / "data" / "projects"


def _project_dir(project_id: str) -> Path:
    return DATA_DIR / project_id


def _config_path(project_id: str) -> Path:
    return _project_dir(project_id) / "config.json"


def _reports_dir(project_id: str) -> Path:
    return _project_dir(project_id) / "reports"


def _snapshots_dir(project_id: str) -> Path:
    return _project_dir(project_id) / "snapshots"


def create_project(data: dict) -> dict:
    project_id = uuid4().hex[:12]
    data["id"] = project_id
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data.setdefault("email_enabled", False)
    data.setdefault("email_address", None)
    data.setdefault("email_from", "intel@market-intel.dev")
    data.setdefault("schedule_enabled", False)
    data.setdefault("schedule_hour", 8)
    data.setdefault("last_run", None)

    path = _config_path(project_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    _reports_dir(project_id).mkdir(parents=True, exist_ok=True)
    _snapshots_dir(project_id).mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2))
    return data


def get_project(project_id: str) -> dict | None:
    path = _config_path(project_id)
    if not path.exists():
        return None
    return json.loads(path.read_text())


def list_projects() -> list[dict]:
    if not DATA_DIR.exists():
        return []
    projects = []
    for d in sorted(DATA_DIR.iterdir()):
        cfg = d / "config.json"
        if cfg.exists():
            projects.append(json.loads(cfg.read_text()))
    return projects


def update_project(project_id: str, updates: dict) -> dict | None:
    data = get_project(project_id)
    if data is None:
        return None
    data.update(updates)
    _config_path(project_id).write_text(json.dumps(data, indent=2))
    return data


def delete_project(project_id: str) -> bool:
    d = _project_dir(project_id)
    if not d.exists():
        return False
    shutil.rmtree(d)
    return True


def save_report(project_id: str, report_id: str, report_data: dict) -> None:
    path = _reports_dir(project_id) / f"{report_id}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report_data, indent=2))


def get_report(project_id: str, report_id: str) -> dict | None:
    path = _reports_dir(project_id) / f"{report_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def list_reports(project_id: str) -> list[dict]:
    d = _reports_dir(project_id)
    if not d.exists():
        return []
    reports = []
    for f in sorted(d.glob("*.json"), reverse=True):
        data = json.loads(f.read_text())
        reports.append({
            "report_id": data["report_id"],
            "project_id": data["project_id"],
            "created_at": data["created_at"],
            "is_first_run": data.get("is_first_run", False),
        })
    return reports


def get_snapshots_dir(project_id: str) -> Path:
    d = _snapshots_dir(project_id)
    d.mkdir(parents=True, exist_ok=True)
    return d
