# CompetitorIQ

Market intelligence platform that automatically tracks competitors through web scraping, GitHub monitoring, docs tracking, and keyword search — then generates daily AI-powered reports using Claude.

## How It Works

1. **Configure a project** via the setup wizard — add competitor URLs, GitHub repos, doc sites, and search keywords
2. **Run the pipeline** on-demand or on a daily schedule
3. **Get reports** — Claude analyzes changes, diffs content against previous snapshots, and generates a structured intelligence briefing
4. **Track trends** — dashboard shows a 14-day rolling view of competitor activity and metrics

### Pipeline Steps

```
Scrape competitor sites (Firecrawl)
  → Diff against previous snapshots
  → Monitor GitHub repos
  → Track documentation changes
  → Run keyword searches (Tavily)
  → Analyze trends
  → Generate Claude-powered report
```

## Snapshot Diffing

Each project maintains a local snapshot store under `data/projects/{id}/snapshots/` with subdirectories for each data type:

```
snapshots/
  meta.json                  # Run count + last run timestamp
  metrics_history.json       # 14-day rolling metrics
  websites/                  # Markdown content keyed by URL slug
  screenshots/               # PNG screenshots keyed by URL slug
  github/                    # JSON repo state (stars, forks, releases, commits, issues)
  docs/                      # Sitemap JSON + per-page markdown content
```

**How it works:** On each pipeline run, the system loads the previous snapshot for every tracked source, fetches the current state, then diffs them:

- **Websites** — Previous and current page content (stored as Markdown) are compared using Python's `difflib.unified_diff`. A configurable `min_website_diff_lines` threshold filters out noise (e.g. timestamp-only changes).
- **GitHub repos** — Star/fork counts are subtracted to get deltas. Latest release tags are compared to detect new releases. Recent commits and issues are included with generated URLs.
- **Documentation** — The system fetches each competitor's `sitemap.xml` (including nested sitemap indexes), parses the `<url>` entries, and compares the `<loc>` and `<lastmod>` fields against the previously saved sitemap snapshot. This produces three categories: **new pages** (URL present in current but not previous), **updated pages** (`lastmod` changed), and **removed pages** (URL missing from current). For new and updated pages, the actual page content is scraped and diffed against the stored version using unified diffs. On the first run, up to 20 pages are scraped to establish a content baseline.

After diffing, the current state overwrites the snapshot so the next run compares against it. All diffs are compiled into a structured summary that gets passed to Claude for report generation.

Metrics (star counts, fork counts, commit activity, website change frequency) are appended to a rolling 14-day history file, which feeds the historical trends section of each report.

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Backend  | FastAPI, Python 3.11+, Pydantic, APScheduler |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| AI       | Claude (Anthropic) for report generation   |
| Data     | Firecrawl (scraping), Tavily (search), GitHub API |
| Email    | Resend + Jinja2 templates                  |
| Storage  | File-based JSON (no database)              |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Environment Variables

Create a `.env` file in `backend/` with:

```
ANTHROPIC_API_KEY=...
FIRECRAWL_API_KEY=...
TAVILY_API_KEY=...
GITHUB_TOKEN=...
RESEND_API_KEY=...
```

### Backend

```bash
cd backend
uv sync
uvicorn main:app --reload    # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects/{id}/run` | Trigger a pipeline run (returns 202) |
| `GET` | `/api/projects/{id}/runs/{run_id}/status` | Poll run status |
| `GET` | `/api/projects/{id}/reports` | List generated reports |
| `PUT` | `/api/projects/{id}/schedule` | Configure daily cron schedule |
| `PUT` | `/api/projects/{id}/email-settings` | Configure email delivery |

## Project Structure

```
backend/
  main.py                  # App entry, CORS, lifespan
  models.py                # Pydantic schemas
  routers/                 # REST endpoints
  services/
    pipeline.py            # 7-step async pipeline orchestrator
    project_store.py       # JSON file persistence
    run_manager.py         # In-memory run tracking
    scheduler.py           # APScheduler daily cron
  intel/
    collectors/            # web_scraper, web_search, github_tracker, docs_tracker
    analysis/              # reporter (Claude), differ
    delivery/              # emailer (Resend)
    state/                 # snapshot store for day-over-day diffs
  data/projects/           # Per-project config, snapshots, metrics

frontend/
  app/                     # Next.js pages
  components/              # UI components (shadcn/ui)
  lib/                     # Wizard context, API client
```

## License

MIT
