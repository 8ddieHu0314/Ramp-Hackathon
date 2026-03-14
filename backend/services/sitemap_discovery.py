"""Auto-discover sitemaps from competitor URLs."""

from __future__ import annotations

import logging
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

SITEMAP_PATHS = [
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/sitemap/sitemap.xml",
]


def discover_sitemap(base_url: str) -> str | None:
    """Probe a domain for common sitemap locations. Returns URL or None."""
    parsed = urlparse(base_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    for path in SITEMAP_PATHS:
        url = origin + path
        try:
            resp = httpx.head(url, timeout=10, follow_redirects=True)
            if resp.status_code == 200:
                logger.info("Found sitemap at %s", url)
                return url
        except httpx.HTTPError:
            continue

    # Try robots.txt
    try:
        resp = httpx.get(origin + "/robots.txt", timeout=10, follow_redirects=True)
        if resp.status_code == 200:
            for line in resp.text.splitlines():
                if line.lower().startswith("sitemap:"):
                    sitemap_url = line.split(":", 1)[1].strip()
                    logger.info("Found sitemap via robots.txt: %s", sitemap_url)
                    return sitemap_url
    except httpx.HTTPError:
        pass

    return None


def discover_sitemaps_for_urls(urls: list[str]) -> dict[str, str | None]:
    """Discover sitemaps for a list of competitor URLs (one per origin)."""
    results = {}
    seen_origins = set()
    for url in urls:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin in seen_origins:
            continue
        seen_origins.add(origin)
        results[origin] = discover_sitemap(url)
    return results
