"""Documentation change tracker using sitemap-diff approach."""

from __future__ import annotations

import difflib
import logging
import xml.etree.ElementTree as ET

import httpx

from .web_scraper import scrape_url

logger = logging.getLogger(__name__)

# XML namespaces used in sitemaps
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def fetch_sitemap(sitemap_url: str) -> dict[str, str | None]:
    """Fetch and parse a sitemap, returning {url: lastmod} for all pages."""
    try:
        resp = httpx.get(sitemap_url, timeout=30, follow_redirects=True)
        resp.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Failed to fetch sitemap %s", sitemap_url)
        return {}

    try:
        root = ET.fromstring(resp.text)
    except ET.ParseError:
        logger.warning("Invalid XML in sitemap %s, skipping", sitemap_url)
        return {}

    # Check if this is a sitemap index (contains <sitemap> children)
    nested = root.findall("sm:sitemap/sm:loc", NS)
    if nested:
        all_pages: dict[str, str | None] = {}
        for loc_el in nested:
            child_url = loc_el.text
            if child_url:
                all_pages.update(fetch_sitemap(child_url.strip()))
        return all_pages

    # Regular sitemap — extract <url> entries
    pages: dict[str, str | None] = {}
    for url_el in root.findall("sm:url", NS):
        loc = url_el.find("sm:loc", NS)
        lastmod = url_el.find("sm:lastmod", NS)
        if loc is not None and loc.text:
            pages[loc.text.strip()] = lastmod.text.strip() if lastmod is not None and lastmod.text else None

    return pages


def diff_sitemaps(
    previous: dict[str, str | None],
    current: dict[str, str | None],
) -> dict[str, str]:
    """Compare two sitemap snapshots, returning changed/new URLs with reason."""
    changes: dict[str, str] = {}

    for url, lastmod in current.items():
        if url not in previous:
            changes[url] = "new_page"
        elif lastmod != previous.get(url):
            changes[url] = "updated"

    for url in previous:
        if url not in current:
            changes[url] = "removed"

    return changes


def _diff_content(old: str, new: str, url: str) -> str | None:
    """Produce a unified diff between old and new page content."""
    old_lines = old.splitlines(keepends=True)
    new_lines = new.splitlines(keepends=True)
    diff = list(difflib.unified_diff(old_lines, new_lines, fromfile=f"previous/{url}", tofile=f"current/{url}", n=3))
    return "".join(diff) if diff else None


def track_docs(
    name: str,
    sitemap_url: str,
    previous_sitemap: dict[str, str | None] | None,
    load_page_fn,
    save_page_fn,
) -> dict:
    """Track documentation changes for a competitor."""
    logger.info("Fetching sitemap for %s: %s", name, sitemap_url)
    current_sitemap = fetch_sitemap(sitemap_url)

    if not current_sitemap:
        logger.warning("Empty sitemap for %s", name)
        return {"sitemap": {}, "changes": {}, "content_diffs": {}, "new_pages": {}}

    logger.info("Found %d pages in %s sitemap", len(current_sitemap), name)

    # First run — scrape pages to establish content baseline (cap at 20 to conserve API credits)
    if previous_sitemap is None:
        pages = list(current_sitemap)[:20]
        logger.info("First run for %s docs — scraping %d/%d pages for baseline", name, len(pages), len(current_sitemap))
        for url in pages:
            logger.info("  Baseline scrape: %s", url)
            content = scrape_url(url)
            if content:
                save_page_fn(url, content)
        return {"sitemap": current_sitemap, "changes": {}, "content_diffs": {}, "new_pages": {}}

    changes = diff_sitemaps(previous_sitemap, current_sitemap)

    if not changes:
        logger.info("No documentation changes detected for %s", name)
        return {"sitemap": current_sitemap, "changes": {}, "content_diffs": {}, "new_pages": {}}

    # Scrape changed pages and produce diffs
    content_diffs: dict[str, str] = {}
    new_pages: dict[str, str] = {}

    for url, reason in changes.items():
        if reason == "removed":
            continue

        logger.info("  Scraping changed doc page: %s (%s)", url, reason)
        new_content = scrape_url(url)
        if not new_content:
            continue

        if reason == "new_page":
            new_pages[url] = new_content
        else:
            old_content = load_page_fn(url)
            if old_content:
                diff = _diff_content(old_content, new_content, url)
                if diff:
                    content_diffs[url] = diff
            else:
                new_pages[url] = new_content

        save_page_fn(url, new_content)

    logger.info(
        "%s docs: %d updated (with diffs), %d new pages, %d removed",
        name,
        len(content_diffs),
        len(new_pages),
        sum(1 for r in changes.values() if r == "removed"),
    )

    return {
        "sitemap": current_sitemap,
        "changes": changes,
        "content_diffs": content_diffs,
        "new_pages": new_pages,
    }


def track_all_docs(
    targets: list[dict],
    load_sitemap_fn,
    save_sitemap_fn,
    load_page_fn,
    save_page_fn,
) -> dict[str, dict]:
    """Track docs for all configured competitors."""
    results = {}
    for target in targets:
        name = target["name"]
        sitemap_url = target["sitemap_url"]
        previous = load_sitemap_fn(name)
        result = track_docs(
            name,
            sitemap_url,
            previous,
            load_page_fn=lambda url, _name=name: load_page_fn(_name, url),
            save_page_fn=lambda url, content, _name=name: save_page_fn(_name, url, content),
        )
        save_sitemap_fn(name, result["sitemap"])
        results[name] = result
    return results
