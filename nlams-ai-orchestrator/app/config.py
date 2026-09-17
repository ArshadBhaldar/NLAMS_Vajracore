import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    NODE_BACKEND_URL: str = os.getenv("NODE_BACKEND_URL", "http://localhost:4000")
    AI_SERVICE_KEY: str = os.getenv("AI_SERVICE_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    # When no ANTHROPIC_API_KEY is set, the Legal Scrutinizer Agent falls back
    # to a deterministic keyword/regex heuristic instead of an LLM call.
    # This keeps the orchestrator runnable out-of-the-box for a hackathon demo.
    USE_LLM_FOR_LEGAL_AGENT: bool = bool(ANTHROPIC_API_KEY)

settings = Settings()
