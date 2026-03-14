"""In-memory run status tracking."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


class RunManager:
    def __init__(self):
        self._runs: dict[str, dict] = {}
        self._active_by_project: dict[str, str] = {}

    def start_run(self, project_id: str) -> str | None:
        """Start a new run. Returns run_id, or None if already running."""
        if project_id in self._active_by_project:
            active_run_id = self._active_by_project[project_id]
            active = self._runs.get(active_run_id, {})
            if active.get("status") in ("pending", "running"):
                return None

        run_id = uuid4().hex[:12]
        self._runs[run_id] = {
            "run_id": run_id,
            "project_id": project_id,
            "status": "pending",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
            "current_step": None,
            "steps_completed": 0,
            "total_steps": 7,
            "error": None,
            "report_id": None,
        }
        self._active_by_project[project_id] = run_id
        return run_id

    def get_run(self, run_id: str) -> dict | None:
        return self._runs.get(run_id)

    def update_run(self, run_id: str, **kwargs) -> None:
        if run_id in self._runs:
            self._runs[run_id].update(kwargs)

    def complete_run(self, run_id: str, report_id: str | None = None) -> None:
        if run_id in self._runs:
            self._runs[run_id]["status"] = "completed"
            self._runs[run_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
            self._runs[run_id]["report_id"] = report_id
            project_id = self._runs[run_id]["project_id"]
            if self._active_by_project.get(project_id) == run_id:
                del self._active_by_project[project_id]

    def fail_run(self, run_id: str, error: str) -> None:
        if run_id in self._runs:
            self._runs[run_id]["status"] = "failed"
            self._runs[run_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
            self._runs[run_id]["error"] = error
            project_id = self._runs[run_id]["project_id"]
            if self._active_by_project.get(project_id) == run_id:
                del self._active_by_project[project_id]


# Singleton
run_manager = RunManager()
