"""APScheduler wrapper for scheduled runs."""

from __future__ import annotations

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)


class SchedulerService:
    def __init__(self):
        self._scheduler = BackgroundScheduler(timezone="UTC")
        self._scheduler.start()
        self._jobs: dict[str, str] = {}  # project_id -> job_id

    def schedule_project(self, project_id: str, hour: int, run_fn, frequency: str = "daily") -> None:
        """Schedule a run for a project at the given UTC hour and frequency."""
        job_id = f"project_{project_id}"

        if project_id in self._jobs:
            self.unschedule_project(project_id)

        if frequency == "weekly":
            trigger = CronTrigger(day_of_week="mon", hour=hour, minute=0)
        elif frequency == "biweekly":
            # Run on 1st and 15th of each month as an approximation of biweekly
            trigger = CronTrigger(day="1,15", hour=hour, minute=0)
        else:
            trigger = CronTrigger(hour=hour, minute=0)

        self._scheduler.add_job(
            run_fn,
            trigger,
            id=job_id,
            args=[project_id],
            replace_existing=True,
        )
        self._jobs[project_id] = job_id
        logger.info("Scheduled project %s at %02d:00 UTC (%s)", project_id, hour, frequency)

    def unschedule_project(self, project_id: str) -> None:
        """Remove scheduled job for a project."""
        job_id = self._jobs.pop(project_id, None)
        if job_id:
            try:
                self._scheduler.remove_job(job_id)
            except Exception:
                pass
            logger.info("Unscheduled project %s", project_id)

    def get_next_run(self, project_id: str) -> str | None:
        """Get the next scheduled run time for a project."""
        job_id = self._jobs.get(project_id)
        if not job_id:
            return None
        job = self._scheduler.get_job(job_id)
        if job and job.next_run_time:
            return job.next_run_time.isoformat()
        return None

    def is_scheduled(self, project_id: str) -> bool:
        return project_id in self._jobs

    def shutdown(self) -> None:
        self._scheduler.shutdown(wait=False)


# Singleton
scheduler_service = SchedulerService()
