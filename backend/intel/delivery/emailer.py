"""Email delivery via Resend."""

from __future__ import annotations

import logging
import os
from datetime import date
from pathlib import Path

import resend
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


_SECTION_CLASSES = {
    "top 3": "section-alert",
    "pay attention": "section-alert",
    "executive summary": "section-summary",
    "website": "section-website",
    "documentation": "section-docs",
    "github": "section-github",
    "industry": "section-trends",
    "trend": "section-trends",
    "strategic": "section-strategy",
    "implication": "section-strategy",
    "action": "section-strategy",
    "recommend": "section-strategy",
}

_SECTION_ICONS = {
    "section-alert": "\U0001f514",
    "section-summary": "\U0001f4cb",
    "section-website": "\U0001f310",
    "section-docs": "\U0001f4d6",
    "section-github": "\U0001f4bb",
    "section-trends": "\U0001f4c8",
    "section-strategy": "\U0001f3af",
}


def _classify_section(heading: str) -> str:
    lower = heading.lower()
    for keyword, cls in _SECTION_CLASSES.items():
        if keyword in lower:
            return cls
    return "section-summary"


def _markdown_to_html(md: str) -> str:
    """Convert markdown report to styled HTML for email."""
    import re

    # Priority tags -> colored badges (before other processing)
    md = re.sub(r"\[HIGH\]", '<span class="tag tag-high">HIGH</span>', md)
    md = re.sub(r"\[MED\]", '<span class="tag tag-med">MED</span>', md)
    md = re.sub(r"\[LOW\]", '<span class="tag tag-low">LOW</span>', md)

    # Code blocks (before inline processing)
    md = re.sub(
        r"```(\w*)\n(.*?)```",
        r"<pre><code>\2</code></pre>",
        md,
        flags=re.DOTALL,
    )
    md = re.sub(r"`(.+?)`", r"<code>\1</code>", md)

    # Bold and italic
    md = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", md)
    md = re.sub(r"\*(.+?)\*", r"<em>\1</em>", md)

    # Links
    md = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', md)

    # Split into lines and build sections
    lines = md.split("\n")
    result: list[str] = []
    in_list = False
    in_ordered_list = False
    in_section = False

    def _close_list():
        nonlocal in_list, in_ordered_list
        if in_list:
            result.append("</ol>" if in_ordered_list else "</ul>")
            in_list = False
            in_ordered_list = False

    for line in lines:
        stripped = line.strip()

        # H1
        h1_match = re.match(r"^#\s+(?!#)(.+)$", stripped)
        if h1_match:
            _close_list()
            if in_section:
                result.append("</div></div>")

            heading = h1_match.group(1)
            heading_clean = re.sub(r"^[\U0001f300-\U0001faff\u2600-\u27bf]\s*", "", heading)
            section_cls = _classify_section(heading_clean)
            icon = _SECTION_ICONS.get(section_cls, "")
            result.append(
                f'<div class="section {section_cls}">'
                f'<div class="section-header">{icon} {heading_clean}</div>'
                f'<div class="section-body">'
            )
            in_section = True
            continue

        # H2
        h2_match = re.match(r"^##\s+(.+)$", stripped)
        if h2_match:
            _close_list()
            if in_section:
                result.append("</div></div>")

            heading = h2_match.group(1)
            heading_clean = re.sub(r"^[\U0001f300-\U0001faff\u2600-\u27bf]\s*", "", heading)
            section_cls = _classify_section(heading_clean)
            icon = _SECTION_ICONS.get(section_cls, "")
            result.append(
                f'<div class="section {section_cls}">'
                f'<div class="section-header">{icon} {heading_clean}</div>'
                f'<div class="section-body">'
            )
            in_section = True
            continue

        # H3
        h3_match = re.match(r"^###\s+(.+)$", stripped)
        if h3_match:
            _close_list()
            result.append(f"<h3>{h3_match.group(1)}</h3>")
            continue

        # Unordered list items
        if stripped.startswith("- "):
            if in_list and in_ordered_list:
                _close_list()
            if not in_list:
                result.append("<ul>")
                in_list = True
                in_ordered_list = False
            result.append(f"<li>{stripped[2:]}</li>")
            continue

        # Numbered list items
        num_match = re.match(r"^(\d+)\.\s+(.+)$", stripped)
        if num_match:
            if in_list and not in_ordered_list:
                _close_list()
            if not in_list:
                result.append("<ol>")
                in_list = True
                in_ordered_list = True
            result.append(f"<li>{num_match.group(2)}</li>")
            continue

        if in_list:
            _close_list()

        if stripped:
            if not stripped.startswith("<"):
                result.append(f"<p>{stripped}</p>")
            else:
                result.append(stripped)
        else:
            result.append("")

    _close_list()
    if in_section:
        result.append("</div></div>")

    return "\n".join(result)


def render_email(report_markdown: str, subject: str) -> str:
    """Render the report into an HTML email using Jinja2."""
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))
    template = env.get_template("report_email.html")

    report_html = _markdown_to_html(report_markdown)

    return template.render(
        subject=subject,
        date=date.today().isoformat(),
        day_of_week=date.today().strftime("%A"),
        report_html=report_html,
    )


def send_email(
    html_content: str,
    subject: str,
    from_addr: str,
    to_addrs: list[str],
) -> bool:
    """Send an HTML email via Resend."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.warning("RESEND_API_KEY not set, skipping email delivery")
        return False

    try:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_addr,
            "to": to_addrs,
            "subject": subject,
            "html": html_content,
        })
        logger.info("Email sent to %s", to_addrs)
        return True
    except Exception:
        logger.exception("Failed to send email")
        return False
