"""GitHub repository monitoring via PyGithub."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone, timedelta

from github import Github, GithubException

logger = logging.getLogger(__name__)


def fetch_repo_state(repo_name: str) -> dict | None:
    """Fetch current state of a GitHub repo."""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        logger.warning("GITHUB_TOKEN not set, skipping GitHub tracking for %s", repo_name)
        return None

    try:
        g = Github(token)
        repo = g.get_repo(repo_name)
        now = datetime.now(timezone.utc)
        since = now - timedelta(days=1)

        # Recent commits (last 24h)
        recent_commits = []
        try:
            for commit in repo.get_commits(since=since):
                recent_commits.append({
                    "sha": commit.sha[:7],
                    "message": commit.commit.message.split("\n")[0],
                    "author": commit.commit.author.name if commit.commit.author else "unknown",
                    "date": commit.commit.author.date.isoformat() if commit.commit.author else None,
                })
                if len(recent_commits) >= 20:
                    break
        except GithubException:
            pass

        # Latest release
        latest_release = None
        try:
            release = repo.get_latest_release()
            latest_release = {
                "tag": release.tag_name,
                "name": release.title,
                "published": release.published_at.isoformat() if release.published_at else None,
            }
        except GithubException:
            pass

        # Recent issues/PRs (last 24h)
        recent_issues = []
        try:
            for issue in repo.get_issues(state="all", since=since, sort="updated"):
                recent_issues.append({
                    "number": issue.number,
                    "title": issue.title,
                    "state": issue.state,
                    "is_pr": issue.pull_request is not None,
                    "created": issue.created_at.isoformat(),
                    "updated": issue.updated_at.isoformat(),
                })
                if len(recent_issues) >= 20:
                    break
        except GithubException:
            pass

        return {
            "repo": repo_name,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "open_issues": repo.open_issues_count,
            "description": repo.description,
            "last_push": repo.pushed_at.isoformat() if repo.pushed_at else None,
            "latest_release": latest_release,
            "recent_commits": recent_commits,
            "recent_issues": recent_issues,
            "fetched_at": now.isoformat(),
        }
    except GithubException:
        logger.exception("Failed to fetch repo %s", repo_name)
        return None


def fetch_all_repos(repos: list[str]) -> dict[str, dict | None]:
    """Fetch state for multiple repos."""
    results = {}
    for repo in repos:
        logger.info("Fetching GitHub repo %s", repo)
        results[repo] = fetch_repo_state(repo)
    return results
