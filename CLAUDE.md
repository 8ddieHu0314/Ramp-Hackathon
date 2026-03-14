# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Market intelligence SaaS platform that tracks competitors via web scraping, GitHub monitoring, docs tracking, and keyword search, then generates daily reports using Claude.

## Build & Run Commands

### Backend (FastAPI + UV)
```bash
cd backend
uv sync                          # Install/update dependencies
uvicorn main:app --reload        # Dev server on http://localhost:8000
```

### Frontend (Next.js 14 + Tailwind)
```bash
cd frontend
npm install                      # Install dependencies
npm run dev                      # Dev server on http://localhost:3000
npm run build                    # Production build
npm run lint                     # ESLint
```

No test suite exists yet.

## Architecture

**Backend** (`backend/`): FastAPI app with file-based JSON persistence (no database). Projects stored in `backend/data/projects/{project_id}/`.

- `main.py` — App entry, lifespan, CORS (allows `localhost:3000`)
- `models.py` — Pydantic request/response schemas
- `routers/` — REST endpoints: projects, runs, reports, schedule, email_settings
- `services/pipeline.py` — 7-step async pipeline orchestrator (scrape → diff → GitHub → docs → keyword search → trends → Claude report generation). Runs in thread pool via `asyncio.to_thread()`
- `services/project_store.py` — JSON file persistence for project configs
- `services/run_manager.py` — In-memory run status tracking
- `services/scheduler.py` — APScheduler wrapper for daily cron runs
- `intel/collectors/` — Data collection: web_scraper (Firecrawl), web_search (Tavily), github_tracker, docs_tracker
- `intel/analysis/reporter.py` — Claude-powered report generation (claude-sonnet-4-20250514)
- `intel/analysis/differ.py` — Content/GitHub diffing
- `intel/delivery/emailer.py` — Resend email + Jinja2 templates
- `intel/state/snapshot.py` — Filesystem snapshot store for day-over-day diffs

**Frontend** (`frontend/`): Next.js 14 + React 18 + Tailwind + shadcn/ui. Multi-step wizard for project setup, dashboard for run monitoring, history page for past submissions. UI components in `components/`, state management via React Context (`lib/wizard-context.tsx`).

## Key Patterns

- **Singleton services**: `scheduler_service`, `project_store`, `run_manager` are module-level singletons
- **Pipeline runs**: Triggered via `POST /api/projects/{id}/run` → returns 202 with run_id → poll `GET .../runs/{run_id}/status`
- **Snapshot store**: Each project maintains versioned snapshots under `data/projects/{id}/snapshots/` for diffing against previous runs
- **Metrics history**: 14-day rolling window stored in `metrics_history.json`

## Required Environment Variables

`ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY`, `TAVILY_API_KEY`, `GITHUB_TOKEN`, `RESEND_API_KEY`
