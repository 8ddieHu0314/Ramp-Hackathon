"""FastAPI application — Market Intel API."""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()  # must run before other imports that read env vars

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import projects, runs, reports, schedule, email_settings
from services.scheduler import scheduler_service
from services import project_store

logger = logging.getLogger(__name__)


def _restore_schedules() -> None:
    """Re-register scheduled jobs from saved project configs on startup."""
    from routers.schedule import _scheduled_run

    for project in project_store.list_projects():
        if project.get("schedule_enabled"):
            hour = project.get("schedule_hour", 8)
            frequency = project.get("schedule_frequency", "daily")
            scheduler_service.schedule_project(project["id"], hour, _scheduled_run, frequency)
            logger.info("Restored schedule for project %s at %02d:00 UTC (%s)", project["id"], hour, frequency)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )
    _restore_schedules()
    yield
    scheduler_service.shutdown()


app = FastAPI(title="CompetitorIQ API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(runs.router)
app.include_router(reports.router)
app.include_router(schedule.router)
app.include_router(email_settings.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
