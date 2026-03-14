"""Text diff utilities using difflib."""

from __future__ import annotations

import difflib
import json
import logging

logger = logging.getLogger(__name__)


def diff_text(old: str | None, new: str | None, label: str = "") -> str | None:
    """Generate a unified diff between old and new text."""
    if old is None:
        return None

    if new is None:
        return f"[{label}] Content no longer available"

    old_lines = old.splitlines(keepends=True)
    new_lines = new.splitlines(keepends=True)

    diff = list(
        difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile=f"previous/{label}",
            tofile=f"current/{label}",
            n=3,
        )
    )

    if not diff:
        return None

    return "".join(diff)


def diff_github(old: dict | None, new: dict | None, repo: str) -> dict | None:
    """Compare previous and current GitHub repo state."""
    if old is None or new is None:
        return None

    changes = {}

    star_diff = new.get("stars", 0) - old.get("stars", 0)
    if star_diff != 0:
        changes["stars"] = {"previous": old.get("stars"), "current": new.get("stars"), "delta": star_diff}

    fork_diff = new.get("forks", 0) - old.get("forks", 0)
    if fork_diff != 0:
        changes["forks"] = {"previous": old.get("forks"), "current": new.get("forks"), "delta": fork_diff}

    old_release = old.get("latest_release")
    new_release = new.get("latest_release")
    if new_release and (not old_release or new_release.get("tag") != old_release.get("tag")):
        changes["new_release"] = new_release

    if new.get("recent_commits"):
        commits_with_urls = []
        for commit in new["recent_commits"]:
            commit_copy = dict(commit)
            commit_copy["url"] = f"https://github.com/{repo}/commit/{commit['sha']}"
            commits_with_urls.append(commit_copy)
        changes["recent_commits"] = commits_with_urls

    if new.get("recent_issues"):
        issues_with_urls = []
        for issue in new["recent_issues"]:
            issue_copy = dict(issue)
            issue_copy["url"] = f"https://github.com/{repo}/{'pull' if issue.get('is_pr') else 'issues'}/{issue['number']}"
            issues_with_urls.append(issue_copy)
        changes["recent_issues"] = issues_with_urls

    if old.get("description") != new.get("description"):
        changes["description_changed"] = {
            "previous": old.get("description"),
            "current": new.get("description"),
        }

    return changes if changes else None


def summarize_diffs(
    website_diffs: dict[str, str | None],
    github_diffs: dict[str, dict | None],
    docs_diffs: dict[str, dict] | None = None,
    min_website_diff_lines: int = 0,
) -> str:
    """Build a text summary of all diffs for the Claude prompt."""
    sections = []

    # Website changes (with noise filtering)
    web_changes: dict[str, str] = {}
    for url, d in website_diffs.items():
        if d is None:
            continue
        if min_website_diff_lines > 0:
            change_lines = sum(
                1 for line in d.splitlines()
                if (line.startswith("+") or line.startswith("-"))
                and not line.startswith("+++") and not line.startswith("---")
            )
            if change_lines < min_website_diff_lines:
                logger.info("Filtering %s: %d changed lines < threshold %d", url, change_lines, min_website_diff_lines)
                continue
        web_changes[url] = d
    if web_changes:
        sections.append("## Website Content Changes\n")
        for url, diff in web_changes.items():
            sections.append(f"### {url}\n```diff\n{diff}\n```\n")
    else:
        sections.append("## Website Content Changes\nNo changes detected.\n")

    # Documentation changes (sitemap-diff)
    if docs_diffs:
        has_doc_changes = any(
            r.get("content_diffs") or r.get("new_pages") or any(v == "removed" for v in r.get("changes", {}).values())
            for r in docs_diffs.values()
        )
        if has_doc_changes:
            sections.append("## Competitor Documentation Changes\n")
            for name, result in docs_diffs.items():
                content_diffs = result.get("content_diffs", {})
                new_pages = result.get("new_pages", {})
                changes = result.get("changes", {})
                removed = [url for url, reason in changes.items() if reason == "removed"]

                if not content_diffs and not new_pages and not removed:
                    continue

                sections.append(f"### {name} docs\n")

                for url, diff in content_diffs.items():
                    sections.append(f"**Updated**: [{url}]({url})\n```diff\n{diff[:3000]}\n```\n")

                for url, content in new_pages.items():
                    sections.append(f"**New page**: [{url}]({url})\n```markdown\n{content[:2000]}\n```\n")

                for url in removed:
                    sections.append(f"**Removed**: {url}\n")
        else:
            sections.append("## Competitor Documentation Changes\nNo documentation changes detected.\n")
    else:
        sections.append("## Competitor Documentation Changes\nNo docs tracked.\n")

    # GitHub changes
    gh_changes = {repo: d for repo, d in github_diffs.items() if d is not None}
    if gh_changes:
        sections.append("## GitHub Repository Activity\n")
        for repo, changes in gh_changes.items():
            sections.append(f"### {repo}\n```json\n{json.dumps(changes, indent=2, default=str)}\n```\n")
    else:
        sections.append("## GitHub Repository Activity\nNo changes detected.\n")

    return "\n".join(sections)


def extract_daily_metrics(
    repo_states: dict[str, dict | None],
    website_diffs: dict[str, str | None],
) -> dict:
    """Extract key metrics from today's run for historical tracking."""
    from datetime import date

    entry: dict = {"date": date.today().isoformat(), "github": {}, "websites": {}}

    for repo, state in repo_states.items():
        if state is None:
            continue
        entry["github"][repo] = {
            "stars": state.get("stars", 0),
            "forks": state.get("forks", 0),
            "commit_count": len(state.get("recent_commits", [])),
            "issue_count": len(state.get("recent_issues", [])),
        }

    for url, diff in website_diffs.items():
        entry["websites"][url] = {"changed": diff is not None}

    return entry


def format_trend_context(history: list[dict]) -> str:
    """Format metrics history into a text summary for the report prompt."""
    if len(history) < 2:
        return ""

    lines = [f"## Historical Trends (last {len(history)} days)\n"]

    all_repos: set[str] = set()
    for entry in history:
        all_repos.update(entry.get("github", {}).keys())

    for repo in sorted(all_repos):
        star_series = []
        for entry in history:
            gh = entry.get("github", {}).get(repo)
            if gh:
                star_series.append((entry["date"], gh["stars"]))

        if len(star_series) >= 2:
            first_stars = star_series[0][1]
            last_stars = star_series[-1][1]
            delta = last_stars - first_stars
            if delta != 0:
                direction = "gained" if delta > 0 else "lost"
                lines.append(
                    f"- **{repo}**: {direction} {abs(delta)} stars over "
                    f"{len(star_series)} days ({first_stars} → {last_stars})"
                )

        commit_days = sum(
            1 for e in history
            if e.get("github", {}).get(repo, {}).get("commit_count", 0) > 0
        )
        if commit_days > 1:
            lines.append(f"  - Active {commit_days}/{len(history)} days tracked")

    all_urls: set[str] = set()
    for entry in history:
        all_urls.update(entry.get("websites", {}).keys())

    change_counts: dict[str, int] = {}
    for url in all_urls:
        count = sum(
            1 for e in history
            if e.get("websites", {}).get(url, {}).get("changed", False)
        )
        if count > 0:
            change_counts[url] = count

    if change_counts:
        lines.append("\n### Website change frequency")
        for url, count in sorted(change_counts.items(), key=lambda x: -x[1]):
            lines.append(f"- **{url}**: changed {count}/{len(history)} days")

    lines.append("")
    return "\n".join(lines) if len(lines) > 2 else ""
