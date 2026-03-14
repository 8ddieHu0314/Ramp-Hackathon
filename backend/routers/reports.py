"""Report endpoints."""

from fastapi import APIRouter, HTTPException

from models import ReportSummary, ReportDetail
from services import project_store

router = APIRouter(prefix="/api/projects/{project_id}", tags=["reports"])


@router.get("/reports", response_model=list[ReportSummary])
async def list_reports(project_id: str):
    if not project_store.get_project(project_id):
        raise HTTPException(404, "Project not found")
    return project_store.list_reports(project_id)


@router.get("/reports/{report_id}", response_model=ReportDetail)
async def get_report(project_id: str, report_id: str):
    report = project_store.get_report(project_id, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return report
