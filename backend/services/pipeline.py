"""Async pipeline orchestrator — adapted from the original CLI agent."""

from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timezone
from uuid import uuid4

from services.run_manager import run_manager
from services import project_store
from intel.state.snapshot import SnapshotStore
from intel.collectors.web_scraper import scrape_all
from intel.collectors.github_tracker import fetch_all_repos
from intel.collectors.web_search import search_all_keywords
from intel.collectors.screenshot import capture_and_diff
from intel.collectors.docs_tracker import track_all_docs
from intel.analysis.differ import (
    diff_text, diff_github, summarize_diffs,
    extract_daily_metrics, format_trend_context,
)
from intel.analysis.reporter import generate_report
from intel.delivery.emailer import render_email, send_email

logger = logging.getLogger(__name__)


def _run_pipeline_sync(project_id: str, run_id: str) -> None:
    """Run the full pipeline synchronously (called via asyncio.to_thread)."""
    project = project_store.get_project(project_id)
    if not project:
        run_manager.fail_run(run_id, "Project not found")
        return

    try:
        run_manager.update_run(run_id, status="running", current_step="Initializing")

        snapshot_dir = project_store.get_snapshots_dir(project_id)
        store = SnapshotStore(snapshot_dir)
        is_first = store.is_first_run

        # Step 1: Scrape websites
        run_manager.update_run(run_id, current_step="Scraping websites", steps_completed=0)
        urls = [c["url"] for c in project.get("competitors", [])]
        scraped = scrape_all(urls) if urls else {}

        # Step 2: Diff website content
        run_manager.update_run(run_id, current_step="Diffing website content", steps_completed=1)
        website_diffs: dict[str, str | None] = {}
        for url, content in scraped.items():
            previous = store.load_website(url)
            website_diffs[url] = diff_text(previous, content, label=url)
            if content is not None:
                store.save_website(url, content)

        # Step 3: Fetch GitHub repos
        run_manager.update_run(run_id, current_step="Fetching GitHub repos", steps_completed=2)
        repos = [r["repo"] for r in project.get("github_repos", [])]
        repo_states = fetch_all_repos(repos) if repos else {}

        github_diffs: dict[str, dict | None] = {}
        for repo, state in repo_states.items():
            previous = store.load_github(repo)
            github_diffs[repo] = diff_github(previous, state, repo)
            if state is not None:
                store.save_github(repo, state)

        # Step 4: Track competitor docs
        run_manager.update_run(run_id, current_step="Tracking competitor docs", steps_completed=3)
        docs_diffs: dict[str, dict] = {}
        comp_docs = project.get("competitor_docs", [])
        if comp_docs:
            targets = [{"name": d["name"], "sitemap_url": d["sitemap_url"]} for d in comp_docs]
            docs_diffs = track_all_docs(
                targets,
                load_sitemap_fn=store.load_docs_sitemap,
                save_sitemap_fn=store.save_docs_sitemap,
                load_page_fn=store.load_docs_page,
                save_page_fn=store.save_docs_page,
            )

        # Step 5: Search keywords
        run_manager.update_run(run_id, current_step="Searching keywords", steps_completed=4)
        keywords = project.get("keywords", [])
        search_results = search_all_keywords(keywords) if keywords else {}

        # Step 6: Screenshots
        run_manager.update_run(run_id, current_step="Capturing screenshots", steps_completed=5)
        screenshot_diffs: dict[str, dict] = {}
        screenshot_urls = [c["url"] for c in project.get("competitors", []) if c.get("screenshot", True)]
        for url in screenshot_urls:
            current_path = store.get_screenshot_path(url)
            previous_path = store.load_screenshot(url)
            temp_previous = None
            if previous_path:
                temp_previous = current_path.with_suffix(".prev.png")
                temp_previous.write_bytes(previous_path.read_bytes())
            result = capture_and_diff(url, current_path, temp_previous)
            screenshot_diffs[url] = result
            if temp_previous and temp_previous.exists():
                temp_previous.unlink()

        # Step 7: Compute trend metrics
        run_manager.update_run(run_id, current_step="Computing trend metrics", steps_completed=6)
        metrics_history = store.load_metrics_history()
        today_metrics = extract_daily_metrics(repo_states, website_diffs, screenshot_diffs)
        metrics_history.append(today_metrics)
        trend_context = format_trend_context(metrics_history)

        # Step 8: Generate report
        run_manager.update_run(run_id, current_step="Generating report", steps_completed=7)
        diff_summary = summarize_diffs(
            website_diffs,
            github_diffs,
            screenshot_diffs,
            docs_diffs,
        )
        if trend_context:
            diff_summary = diff_summary + "\n\n" + trend_context

        report_md = generate_report(
            diff_summary,
            search_results,
            is_first_run=is_first,
            product_name=project["product_name"],
            product_description=project["product_description"],
            additional_context=project.get("additional_context", ""),
        )

        # Render HTML
        today = date.today().isoformat()
        subject = f"[Market Intel] {project['product_name']} — {today}"
        report_html = render_email(report_md, subject)

        # Save report
        report_id = uuid4().hex[:12]
        report_data = {
            "report_id": report_id,
            "project_id": project_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_first_run": is_first,
            "markdown": report_md,
            "html": report_html,
        }
        project_store.save_report(project_id, report_id, report_data)

        # Send email if enabled
        if project.get("email_enabled") and project.get("email_address"):
            send_email(
                report_html,
                subject,
                project.get("email_from", "intel@market-intel.dev"),
                [project["email_address"]],
            )

        # Save state
        store.save_metrics_history(metrics_history)
        store.save_meta()
        project_store.update_project(project_id, {"last_run": datetime.now(timezone.utc).isoformat()})

        run_manager.complete_run(run_id, report_id=report_id)
        logger.info("Pipeline completed for project %s, run %s", project_id, run_id)

    except Exception as e:
        logger.exception("Pipeline failed for project %s, run %s", project_id, run_id)
        run_manager.fail_run(run_id, str(e))


async def trigger_pipeline(project_id: str, run_id: str) -> None:
    """Run the pipeline in a thread pool."""
    await asyncio.to_thread(_run_pipeline_sync, project_id, run_id)
