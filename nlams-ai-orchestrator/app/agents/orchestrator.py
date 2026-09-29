from app.services.node_client import node_client
from app.utils.pdf_extract import extract_text_from_pdf_bytes
from app.agents.legal_scrutinizer import run_legal_scrutiny
from app.agents.geospatial_analyzer import run_geospatial_analysis
from app.agents.rr_calculator import run_rr_calculation


async def _get_latest_title_deed_text(documents: list) -> str:
    """Finds the highest-version TITLE_DEED document and extracts its text.
    Returns an empty string if no title deed has been uploaded yet.
    """
    deed_docs = [d for d in documents if d.get("doc_type") == "TITLE_DEED"]
    if not deed_docs:
        return ""

    latest = max(deed_docs, key=lambda d: d.get("version", 0))
    try:
        pdf_bytes = await node_client.download_document(latest["id"])
        return extract_text_from_pdf_bytes(pdf_bytes)
    except Exception as exc:
        print(f"[Orchestrator] Notice: Could not download or parse title deed ({latest.get('id')}): {exc}. Proceeding with unreadable fallback.")
        return ""



async def orchestrate_scrutiny(proposal_id: str, land_type: str = "AGRICULTURAL") -> dict:
    """Fetches everything needed for a proposal from the Node backend, runs
    all three agents, saves the combined report back to Node, and returns it.
    This is the single entry point the CALA Workbench's "Run AI Scrutiny"
    button ultimately triggers.
    """
    package = await node_client.get_proposal_package(proposal_id)
    proposal = package["proposal"]
    parcels = package["parcels"]
    documents = package["documents"]

    # Cross-check against the first parcel's declared owner for the legal
    # agent; a multi-parcel proposal would run this per-parcel in a fuller
    # build, but one representative check is enough for the prototype demo.
    declared_owner = parcels[0]["owner_name"] if parcels else "Unknown"
    declared_area = parcels[0]["claimed_area_sqm"] if parcels else 0

    deed_text = await _get_latest_title_deed_text(documents)

    legal_result = await run_legal_scrutiny(deed_text, declared_owner, declared_area)
    geospatial_result = run_geospatial_analysis(parcels)
    rr_result = run_rr_calculation(proposal["state"], parcels, land_type)

    statuses = [legal_result["status"], geospatial_result["status"], rr_result["status"]]
    overall_status = "FLAGGED" if "FLAGGED" in statuses else "PASS"

    report = {
        "legal_result": legal_result,
        "geospatial_result": geospatial_result,
        "rr_result": rr_result,
        "overall_status": overall_status,
    }

    saved_report = await node_client.save_scrutiny_report(proposal_id, report)
    return saved_report
