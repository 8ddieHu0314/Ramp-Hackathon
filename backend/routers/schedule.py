"""Schedule endpoints."""

from fastapi import APIRouter, HTTPException

from models import ScheduleRequest, ScheduleResponse
from services import project_store
from services.scheduler import scheduler_service
from services.run_manager import run_manager
from services.pipeline import _run_pipeline_sync

router = APIRouter(prefix="/api/projects/{project_id}", tags=["schedule"])


def _scheduled_run(project_id: str) -> None:
    """Callback for scheduled runs — runs synchronously in APScheduler's thread pool."""
    run_id = run_manager.start_run(project_id)
    if run_id is None:
        return  # Already running
    _run_pipeline_sync(project_id, run_id)


@router.post("/schedule", response_model=ScheduleResponse)
async def set_schedule(project_id: str, req: ScheduleRequest):
    project = project_store.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if req.enabled:
        scheduler_service.schedule_project(project_id, req.hour, _scheduled_run)
    else:
        scheduler_service.unschedule_project(project_id)

    project_store.update_project(project_id, {
        "schedule_enabled": req.enabled,
        "schedule_hour": req.hour,
    })

    return {
        "enabled": req.enabled,
        "hour": req.hour,
        "next_run": scheduler_service.get_next_run(project_id),
    }


@router.get("/schedule", response_model=ScheduleResponse)
async def get_schedule(project_id: str):
    project = project_store.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    return {
        "enabled": project.get("schedule_enabled", False),
        "hour": project.get("schedule_hour", 8),
        "next_run": scheduler_service.get_next_run(project_id),
    }
