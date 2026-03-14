"""Report generation using Claude API — parameterized for any product."""

from __future__ import annotations

import logging
import os

import anthropic

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """\
You are a competitive intelligence analyst for {product_name}, {product_description}.
{additional_context}
You produce a concise, actionable daily intelligence report based on data collected from competitor websites, GitHub repos, and web searches.

Your report must be structured as follows:

## Top 3 Things to Pay Attention To
List the 3 most important findings from today's data. Each item should be one sentence with a priority tag and a source link. Format:
- **[HIGH]** Finding here ([source](url))
- **[MED]** Finding here ([source](url))

## Executive Summary
2-3 sentence overview of the most important developments.

## Competitor Website Changes
Analyze any website content changes. Note new features, messaging shifts, pricing changes.
For screenshot-only changes, describe what likely changed based on the percentage and region affected.

## Competitor Documentation Changes
Analyze changes to competitor documentation sites. Focus on what the changes reveal about:
- New features or capabilities being added
- Changes to existing functionality (API changes, new parameters, deprecations)
- New integrations or platform support
- Shifts in product direction or positioning
For each changed page, explain the *functional significance* — what can users do now that they couldn't before?

## GitHub Activity
For each tracked repository, output a separate bullet point with this format:
- **repo-name**: **[HIGH/MED/LOW]** Summary of activity (commits, releases, issues/PRs) with links.
If a repo had no meaningful activity, use: - **repo-name**: **[LOW]** No significant activity.

## Industry Trends
Synthesize web search results into emerging themes. Use bullet points — one per theme:
- **Theme name**: 1-2 sentence description with source links.

## Strategic Actions
Combine competitive implications with concrete recommendations. For each insight, provide:
1. The competitive signal (the "so what") and a specific action for the {product_name} team.
Tag each item with priority: **[HIGH]**, **[MED]**, or **[LOW]**. Provide 3-5 items as a numbered list.

Formatting rules:
- ALWAYS use full clickable URLs — never bare issue numbers. For GitHub issues/PRs, use the full URL like: [#477](https://github.com/owner/repo/issues/477)
- For web search findings, include the source URL inline: "finding here ([source](url))"
- Distinguish between confirmed facts and your analysis/interpretation
- If there are no changes in a section, say so briefly and move on
- Use bullet points (- ) or numbered lists (1. ) for ALL list content — never write unstructured paragraphs in list sections
- Each GitHub repo MUST be a separate bullet point
- If historical trend data is provided, reference trends in your analysis (e.g., "star count accelerated this week", "3rd consecutive day of commit activity")
- Keep the total report under 1500 words
"""


def generate_report(
    diff_summary: str,
    search_results: dict[str, list[dict]],
    is_first_run: bool,
    product_name: str = "our product",
    product_description: str = "",
    additional_context: str = "",
    model: str = "claude-sonnet-4-20250514",
) -> str:
    """Generate an intelligence report using Claude."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set, returning raw diff summary")
        return f"# Raw Intelligence Data (no API key)\n\n{diff_summary}"

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        product_name=product_name,
        product_description=product_description,
        additional_context=f"Additional context: {additional_context}\n" if additional_context else "",
    )

    # Build search results section
    search_section = "## Web Search Results\n\n"
    search_section += "IMPORTANT: When citing these findings in the report, always include the source URL as a clickable markdown link.\n\n"
    for keyword, results in search_results.items():
        search_section += f"### \"{keyword}\"\n"
        if not results:
            search_section += "No results.\n\n"
            continue
        for r in results:
            search_section += f"- **[{r['title']}]({r['url']})**: {r['content'][:300]}\n"
        search_section += "\n"

    user_message = f"""Here is today's collected competitive intelligence data. Please analyze it and produce a structured report.

{"NOTE: This is the first run — there are no previous snapshots to diff against. Focus on establishing a baseline of the current landscape." if is_first_run else ""}

{diff_summary}

{search_section}

Today's date: {_today()}
"""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text
    except Exception:
        logger.exception("Failed to generate report via Claude")
        return f"# Report Generation Failed\n\nRaw data:\n\n{diff_summary}\n\n{search_section}"


def _today() -> str:
    from datetime import date
    return date.today().isoformat()
