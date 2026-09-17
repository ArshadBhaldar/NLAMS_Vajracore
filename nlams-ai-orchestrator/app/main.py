from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.agents.orchestrator import orchestrate_scrutiny
from app.agents.geospatial_analyzer import run_geospatial_analysis
from app.agents.rr_calculator import run_rr_calculation
from app.agents.legal_scrutinizer import run_legal_scrutiny

app = FastAPI(
    title="NLAMS 2.0 - Multi-Agent AI Orchestrator",
    description="Legal Scrutinizer, Geospatial Analyzer, and R&R Calculator agents for land acquisition proposals.",
    version="1.0.0",
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nlams-ai-orchestrator"}


# ---------- Main orchestration endpoint (used by the Node backend / CALA Workbench) ----------

class OrchestrateRequest(BaseModel):
    land_type: Optional[str] = "AGRICULTURAL"


@app.post("/orchestrate/{proposal_id}")
async def orchestrate(proposal_id: str, body: OrchestrateRequest = OrchestrateRequest()):
    """Runs all three agents for a proposal by pulling its data from the Node
    backend, and saves the combined scrutiny report back to Node. This is
    what the CALA Workbench's 'Run AI Scrutiny' action calls.
    """
    try:
        result = await orchestrate_scrutiny(proposal_id, land_type=body.land_type)
        return result
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Orchestration failed: {exc}")


# ---------- Standalone endpoints for testing/demoing individual agents ----------
# Useful for the hackathon demo: show each agent working in isolation with
# hand-crafted input, without needing the full Node backend wired up live.

class GeospatialTestRequest(BaseModel):
    parcels: list


@app.post("/agents/geospatial/test")
async def test_geospatial(body: GeospatialTestRequest):
    return run_geospatial_analysis(body.parcels)


class RRTestRequest(BaseModel):
    state: str
    parcels: list
    land_type: Optional[str] = "AGRICULTURAL"


@app.post("/agents/rr-calculator/test")
async def test_rr_calculator(body: RRTestRequest):
    return run_rr_calculation(body.state, body.parcels, body.land_type)


class LegalTestRequest(BaseModel):
    deed_text: str
    declared_owner_name: str
    declared_area_sqm: float = 0


@app.post("/agents/legal-scrutinizer/test")
async def test_legal_scrutinizer(body: LegalTestRequest):
    return await run_legal_scrutiny(body.deed_text, body.declared_owner_name, body.declared_area_sqm)
