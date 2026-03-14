"""Pydantic request/response models for the Market Intel API."""

from __future__ import annotations

from pydantic import BaseModel, model_validator


class CompetitorInput(BaseModel):
    url: str


class GitHubRepoInput(BaseModel):
    repo: str  # "owner/name" format


class ProjectCreateRequest(BaseModel):
    name: str
    product_name: str
    product_description: str
    additional_context: str = ""
    competitors: list[CompetitorInput] = []
    github_repos: list[GitHubRepoInput] = []
    keywords: list[str] = []
    auto_generate_keywords: bool = False

    @model_validator(mode="after")
    def check_at_least_one_source(self) -> "ProjectCreateRequest":
        if not self.competitors and not self.github_repos:
            raise ValueError("At least one competitor URL or GitHub repo must be provided")
        return self


class ProjectResponse(BaseModel):
    id: str
    name: str
    product_name: str
    product_description: str
    additional_context: str
    competitors: list[CompetitorInput]
    github_repos: list[GitHubRepoInput]
    keywords: list[str]
    email_enabled: bool = False
    email_address: str | None = None
    email_from: str = "intel@market-intel.dev"
    schedule_enabled: bool = False
    schedule_hour: int = 8
    schedule_frequency: str = "daily"
    created_at: str
    last_run: str | None = None


class RunTriggerResponse(BaseModel):
    run_id: str
    project_id: str
    status: str


class RunStatusResponse(BaseModel):
    run_id: str
    project_id: str
    status: str  # pending | running | completed | failed
    started_at: str | None = None
    completed_at: str | None = None
    current_step: str | None = None
    steps_completed: int = 0
    total_steps: int = 7
    error: str | None = None
    report_id: str | None = None


class ReportSummary(BaseModel):
    report_id: str
    project_id: str
    created_at: str
    is_first_run: bool = False


class ReportDetail(BaseModel):
    report_id: str
    project_id: str
    created_at: str
    is_first_run: bool = False
    markdown: str
    html: str


class ScheduleRequest(BaseModel):
    enabled: bool
    hour: int = 8
    frequency: str = "daily"  # daily | weekly | biweekly


class ScheduleResponse(BaseModel):
    enabled: bool
    hour: int
    frequency: str = "daily"
    next_run: str | None = None


class EmailSettingsRequest(BaseModel):
    enabled: bool
    address: str | None = None
    from_address: str = "intel@market-intel.dev"


class EmailSettingsResponse(BaseModel):
    enabled: bool
    address: str | None = None
    from_address: str
