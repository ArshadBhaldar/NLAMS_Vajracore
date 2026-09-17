import re
from difflib import SequenceMatcher
from app.config import settings

AREA_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(sq\.?\s?m|sqm|square\s?met(?:er|re)s?|hectares?|ha\b)", re.IGNORECASE)
# Matches "Owner:", "Name of owner -", "in the name of" followed by a
# Title-Case name (2-5 capitalized words), stopping before lowercase
# connector words like "holds", "is", "resides" so it doesn't swallow the
# rest of the sentence into the extracted name.
OWNER_LABEL_PATTERN = re.compile(
    r"(?i:owner|name of owner|in the name of)\s*[:\-]?\s*"
    r"([A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*){0,4})",
)


def _name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.strip().lower(), b.strip().lower()).ratio()


def _heuristic_extract(deed_text: str) -> dict:
    """Deterministic fallback extraction used when no LLM key is configured.
    Looks for an owner-name label and an area figure via regex. Deliberately
    conservative: if it can't find a confident match, it says so rather than
    guessing, so a human reviewer knows to check manually.
    """
    owner_match = OWNER_LABEL_PATTERN.search(deed_text)
    area_match = AREA_PATTERN.search(deed_text)

    return {
        "extracted_owner_name": owner_match.group(1).strip() if owner_match else None,
        "extracted_area_text": area_match.group(0) if area_match else None,
        "extraction_method": "heuristic_regex",
    }


async def _llm_extract(deed_text: str) -> dict:
    """LLM-based extraction path. Requires ANTHROPIC_API_KEY to be set.
    Kept separate from the heuristic path so the orchestrator degrades
    gracefully instead of failing when no key is provided.
    """
    import anthropic

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    prompt = (
        "Extract the registered owner's full name and the land area stated "
        "in this Indian land title deed. Respond ONLY with JSON in the form "
        '{"extracted_owner_name": "...", "extracted_area_text": "..."} '
        "using null for any field you cannot find with confidence.\n\n"
        f"DEED TEXT:\n{deed_text[:6000]}"
    )
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    raw = message.content[0].text.strip().strip("`").replace("json\n", "")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"extracted_owner_name": None, "extracted_area_text": None}
    parsed["extraction_method"] = "llm_claude"
    return parsed


async def run_legal_scrutiny(deed_text: str, declared_owner_name: str, declared_area_sqm: float) -> dict:
    """Cross-checks the title deed against what the Requiring Body declared
    for the parcel. Flags a mismatch on owner name (fuzzy match, since deeds
    often have minor spelling/spacing differences) so CALA can investigate
    before the proposal proceeds.
    """
    if not deed_text:
        return {
            "status": "FLAGGED",
            "reason": "Title deed document unreadable or not uploaded. Manual review required.",
            "extracted_owner_name": None,
            "declared_owner_name": declared_owner_name,
        }

    if settings.USE_LLM_FOR_LEGAL_AGENT:
        extracted = await _llm_extract(deed_text)
    else:
        extracted = _heuristic_extract(deed_text)

    extracted_owner = extracted.get("extracted_owner_name")
    flags = []

    if not extracted_owner:
        flags.append("Could not confidently extract an owner name from the deed.")
        name_match_score = None
    else:
        name_match_score = round(_name_similarity(extracted_owner, declared_owner_name or ""), 2)
        if name_match_score < 0.7:
            flags.append(
                f"Owner name mismatch: deed shows '{extracted_owner}' but proposal declares "
                f"'{declared_owner_name}' (similarity {name_match_score})."
            )

    status = "FLAGGED" if flags else "PASS"

    return {
        "status": status,
        "flags": flags,
        "extracted_owner_name": extracted_owner,
        "declared_owner_name": declared_owner_name,
        "name_match_score": name_match_score,
        "extracted_area_text": extracted.get("extracted_area_text"),
        "extraction_method": extracted.get("extraction_method"),
    }
