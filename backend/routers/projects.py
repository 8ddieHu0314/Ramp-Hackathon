"""CRUD endpoints for projects."""

from fastapi import APIRouter, HTTPException

from models import ProjectCreateRequest, ProjectResponse
from services import project_store
from services.keyword_generator import generate_keywords

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(req: ProjectCreateRequest):
    data = req.model_dump()

    # Auto-generate keywords if requested
    if req.auto_generate_keywords and not req.keywords:
        urls = [c.url for c in req.competitors]
        keywords = generate_keywords(req.product_name, req.product_description, urls)
        data["keywords"] = keywords

    data.pop("auto_generate_keywords", None)

    project = project_store.create_project(data)
    return project


@router.get("", response_model=list[ProjectResponse])
async def list_projects():
    return project_store.list_projects()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = project_store.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str):
    if not project_store.delete_project(project_id):
        raise HTTPException(404, "Project not found")
