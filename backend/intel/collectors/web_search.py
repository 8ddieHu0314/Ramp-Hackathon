"""Web search via Tavily API."""

from __future__ import annotations

import logging
import os

from tavily import TavilyClient

logger = logging.getLogger(__name__)


def search_keyword(keyword: str, max_results: int = 10) -> list[dict]:
    """Search for a keyword and return results."""
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        logger.warning("TAVILY_API_KEY not set, skipping search for '%s'", keyword)
        return []

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=keyword,
            search_depth="basic",
            max_results=max_results,
            include_answer=False,
        )
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0),
            }
            for r in response.get("results", [])
        ]
    except Exception:
        logger.exception("Failed to search for '%s'", keyword)
        return []


def search_all_keywords(
    keywords: list[str], max_results: int = 10
) -> dict[str, list[dict]]:
    """Search all keywords, deduplicate results by URL."""
    all_results: dict[str, list[dict]] = {}
    seen_urls: set[str] = set()

    for keyword in keywords:
        logger.info("Searching for '%s'", keyword)
        results = search_keyword(keyword, max_results)
        deduped = []
        for r in results:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                deduped.append(r)
        all_results[keyword] = deduped

    return all_results
