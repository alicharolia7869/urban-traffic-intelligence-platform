"""
Urban Traffic Intelligence Platform - FastAPI Application Main Entry.
AI-Powered Real-Time Traffic Analysis, Congestion Prediction & Urban Mobility Intelligence.
"""
import os
import sys

# Ensure workspace root is in path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.router import router as api_router

app = FastAPI(
    title="Urban Traffic Intelligence Platform API",
    description="High-throughput real-time smart city traffic monitoring, XGBoost congestion prediction, and Explainable AI.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production safe with proxy or specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "platform": "Urban Traffic Intelligence Platform",
        "role": "Smart City / Traffic Command Center AI Core",
        "status": "OPERATIONAL",
        "api_docs": "/docs",
        "endpoints": {
            "kpis": "/api/dashboard/kpis",
            "roads": "/api/roads",
            "predictions": "/api/predictions",
            "weather": "/api/weather",
            "incidents": "/api/incidents",
            "vehicles": "/api/analytics/vehicles",
            "heatmap": "/api/analytics/heatmap",
            "models": "/api/model/performance",
            "pipeline": "/api/pipeline/status",
            "assistant": "/api/assistant/query"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Urban Traffic Intelligence Backend on http://127.0.0.1:{port}")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
