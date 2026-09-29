import httpx
from app.config import settings


class NodeClient:
    """Thin wrapper around the Node backend's service-to-service (internal) API.
    Used by the orchestrator to pull proposal data and push scrutiny results back.
    """

    def __init__(self):
        self.base_url = (settings.NODE_BACKEND_URL or "http://localhost:4000").rstrip('/')
        self.headers = {"X-Service-Key": settings.AI_SERVICE_KEY}

    async def get_proposal_package(self, proposal_id: str) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.base_url}/api/internal/proposals/{proposal_id}/package",
                headers=self.headers,
            )
            resp.raise_for_status()
            return resp.json()

    async def download_document(self, document_id: str) -> bytes:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.base_url}/api/internal/documents/{document_id}/download",
                headers=self.headers,
            )
            resp.raise_for_status()
            return resp.content

    async def save_scrutiny_report(self, proposal_id: str, report: dict) -> dict:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/internal/proposals/{proposal_id}/scrutiny",
                headers=self.headers,
                json=report,
            )
            resp.raise_for_status()
            return resp.json()


node_client = NodeClient()
