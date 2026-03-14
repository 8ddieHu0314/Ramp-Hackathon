"""Pipeline run endpoints."""

import asyncio

from fastapi import APIRouter, HTTPException

from models import RunTriggerResponse, RunStatusResponse
from services import project_store
from services.run_manager import run_manager
from services.pipeline import trigger_pipeline

router = APIRouter(prefix="/api/projects/{project_id}", tags=["runs"])


@router.post("/run", response_model=RunTriggerResponse, status_code=202)
async def trigger_run(project_id: str):
    project = project_store.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    run_id = run_manager.start_run(project_id)
    if run_id is None:
        raise HTTPException(409, "A run is already in progress for this project")

    asyncio.create_task(trigger_pipeline(project_id, run_id))

    return {"run_id": run_id, "project_id": project_id, "status": "pending"}


@router.get("/runs/{run_id}/status", response_model=RunStatusResponse)
async def get_run_status(project_id: str, run_id: str):
    run = run_manager.get_run(run_id)
    if not run or run["project_id"] != project_id:
        raise HTTPException(404, "Run not found")
    return run
