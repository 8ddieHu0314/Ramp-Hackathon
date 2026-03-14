"""Web scraping via Firecrawl API."""

from __future__ import annotations

import logging
import os

from firecrawl import Firecrawl

logger = logging.getLogger(__name__)


def scrape_url(url: str) -> str | None:
    """Scrape a single URL and return its markdown content."""
    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key:
        logger.warning("FIRECRAWL_API_KEY not set, skipping scrape for %s", url)
        return None

    try:
        app = Firecrawl(api_key=api_key)
        result = app.scrape(url, formats=["markdown"])
        if result:
            md = result.get("markdown") if isinstance(result, dict) else getattr(result, "markdown", None)
            if md:
                return md
        logger.warning("No markdown content returned for %s", url)
        return None
    except Exception:
        logger.exception("Failed to scrape %s", url)
        return None


def scrape_all(urls: list[str]) -> dict[str, str | None]:
    """Scrape multiple URLs and return a dict of url -> markdown."""
    results = {}
    for url in urls:
        logger.info("Scraping %s", url)
        results[url] = scrape_url(url)
    return results
