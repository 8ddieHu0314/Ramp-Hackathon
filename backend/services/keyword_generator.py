"""Claude-based keyword auto-generation."""

from __future__ import annotations

import json
import logging
import os

import anthropic

logger = logging.getLogger(__name__)


def generate_keywords(
    product_name: str,
    product_description: str,
    competitor_urls: list[str],
    github_repos: list[dict] | None = None,
) -> list[str]:
    """Generate 5-8 search keywords using Claude."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set, returning empty keywords")
        return []

    competitors_text = "\n".join(f"- {url}" for url in competitor_urls) if competitor_urls else "None provided"
    repos_text = "\n".join(f"- {r['repo']}" for r in github_repos) if github_repos else "None provided"

    prompt = f"""Generate 5-8 search keywords for competitive intelligence monitoring.

Product: {product_name}
Description: {product_description}
Competitor URLs:
{competitors_text}
GitHub Repos (competitor open-source projects):
{repos_text}

Return ONLY a JSON array of keyword strings. Each keyword should be 2-5 words that would surface relevant competitive intelligence, industry trends, or product comparisons. Focus on:
- Product category terms
- Competitor brand + product terms
- Industry trend phrases
- Technology-specific terms

Example: ["agent skill evaluation", "LLM testing framework", "AI agent benchmarking"]"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        # Handle case where Claude wraps in markdown code block
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception:
        logger.exception("Failed to generate keywords")
        return []
