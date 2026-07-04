#!/usr/bin/env python3
"""The Rooted website copy gate.

Mirrors the app's HardRules checker (rooted-new, app/RootedKit/Sources/HardRules)
for the surfaces this repo publishes. Scans the VISIBLE text of every page
(tags, scripts, styles stripped) plus the title and meta description/og
content, and fails with exit 1 on any violation.

Scope notes, deliberate:
- The founder section (section id="founder") is Chantal's own quoted voice,
  not Rooted's, and is exempt, the same mechanism as the app's allowlist for
  the user's own notes.
- "data" is permitted here (the privacy FAQ speaks plainly about her data);
  the app's stricter utility-language ban still holds inside the app.
- CSS class names and attributes other than title/description/og text are
  not customer-facing and are not scanned.

Rules enforced: no em-dash family; no emoji; no "this, not that" phrasing;
no tracking language; no gamification words; no directive should/must/don't;
no utility words (insight, metric, dashboard, tame); British English spot
checks; and performed-calm (calm is felt, never stated: no calm/gentle
describing the product or the moment, no canned reassurance).
"""

import html
import re
import sys
import unicodedata
from pathlib import Path

# Brand pages carry the full rule set. Legal pages are a different register
# ("we do not sell your data" is a privacy commitment, "you must be at least
# 13" is law, not a directive at her) and carry only the mechanical rules:
# em-dash, emoji, americanisms, and the brand-vocabulary bans (tracking,
# gamification, utility words), never the autonomy grammar.
BRAND_PAGES = ["index.html", "production/index.html"]
LEGAL_PAGES = ["privacy-policy.html", "terms.html",
               "production/privacy-policy.html", "production/terms.html"]
LEGAL_RULES = {"em-dash", "emoji", "americanism", "tracking-language",
               "gamification", "utility-language"}

EM_DASHES = "—―⸺⸻﹘"

WORD_RULES = {
    "tracking-language": ["track", "tracks", "tracked", "tracking", "tracker", "trackers"],
    "gamification": ["streak", "streaks", "score", "scores", "scored", "scoring",
                     "badge", "badges", "leaderboard", "leaderboards"],
    "directive-language": ["should", "shouldn't", "must", "mustn't", "don't", "do not"],
    "utility-language": ["insight", "insights", "metric", "metrics", "dashboard",
                         "dashboards", "tame", "taming"],
    "americanism": ["color", "colors", "favorite", "behavior", "center", "centered",
                    "organize", "personalized", "moisturizer", "moisturizing", "gray"],
    "performed-calm": ["no rush", "no hurry", "unhurried", "no pressure",
                       "pressure-free", "take a breath", "deep breath",
                       "soothe", "soothes", "soothed", "soothing", "calming",
                       "calmly", "in your own quiet way", "no need to", "gently"],
}

PATTERN_RULES = [
    ("this-not-that", r",\s+(not|never)\s+\w+"),
    ("performed-calm", r"\bcalm(?:er|est)?(?:\W+\w+){0,2}?\W+(place|space|app|home|page|record|moment|minute|minutes|tap|taps|pause|reflection|question|prompt|nudge|reminder|companion|corner)\b"),
    ("performed-calm", r"\bgentle\s+(on|with|to)\b"),
    ("performed-calm", r"\bgentle\s+(reminder|nudge|invitation|prompt)s?\b"),
    ("performed-calm", r"\bnothing\s+you\s+(need|have)\s+to\b"),
    ("performed-calm", r"\bat\s+your(\s+own)?\s+pace\b"),
    ("performed-calm", r"\bmeets?\s+you\s+where\s+you\s+are\b"),
]


def visible_text(raw: str) -> str:
    raw = re.sub(r"<script.*?</script>", " ", raw, flags=re.S | re.I)
    raw = re.sub(r"<style.*?</style>", " ", raw, flags=re.S | re.I)
    # The founder section is her own voice, exempt.
    raw = re.sub(r'<section id="founder".*?</section>', " ", raw, flags=re.S)
    meta = "\n".join(re.findall(
        r'<meta[^>]*(?:name="description"|property="og:(?:title|description)")[^>]*content="([^"]*)"',
        raw))
    text = re.sub(r"<[^>]+>", "\n", raw)
    return html.unescape(meta + "\n" + text)


def is_emoji(ch: str) -> bool:
    cp = ord(ch)
    if cp == 0xFE0F:
        return True
    if cp < 0x2100:
        return False
    return unicodedata.category(ch) in ("So", "Sk") or 0x1F000 <= cp <= 0x1FAFF or 0x2600 <= cp <= 0x27BF


def check(path: Path, label: str, rules: set | None) -> list:
    findings = []
    text = visible_text(path.read_text(encoding="utf-8"))
    for dash in EM_DASHES:
        if dash in text:
            findings.append((label, "em-dash", repr(dash)))
    for ch in set(text):
        if is_emoji(ch):
            findings.append((label, "emoji", ch))
    lowered = text.lower()
    for rule, words in WORD_RULES.items():
        if rules is not None and rule not in rules:
            continue
        for word in words:
            for m in re.finditer(r"\b" + re.escape(word) + r"\b", lowered):
                ctx = lowered[max(0, m.start() - 30):m.end() + 30].replace("\n", " ")
                findings.append((label, rule, f"...{ctx}..."))
    for rule, pattern in PATTERN_RULES:
        if rules is not None and rule not in rules:
            continue
        for m in re.finditer(pattern, text, flags=re.I):
            findings.append((label, rule, m.group(0)))
    return findings


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    all_findings = []
    for page in BRAND_PAGES:
        p = root / page
        if p.exists():
            all_findings.extend(check(p, page, None))
    for page in LEGAL_PAGES:
        p = root / page
        if p.exists():
            all_findings.extend(check(p, page, LEGAL_RULES))
    for f in sorted(set(all_findings)):
        print(f"[{f[1]}] {f[0]}: {f[2]}")
    if all_findings:
        print(f"\n{len(set(all_findings))} violation(s). The copy gate is exit-1 clean or it does not ship.")
        return 1
    print("copy gate clean")
    return 0


if __name__ == "__main__":
    sys.exit(main())
