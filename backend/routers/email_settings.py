"""Email settings endpoints."""

from fastapi import APIRouter, HTTPException

from models import EmailSettingsRequest, EmailSettingsResponse
from services import project_store

router = APIRouter(prefix="/api/projects/{project_id}", tags=["email"])


@router.put("/email", response_model=EmailSettingsResponse)
async def set_email_settings(project_id: str, req: EmailSettingsRequest):
    project = project_store.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    project_store.update_project(project_id, {
        "email_enabled": req.enabled,
        "email_address": req.address,
        "email_from": req.from_address,
    })

    return {
        "enabled": req.enabled,
        "address": req.address,
        "from_address": req.from_address,
    }
