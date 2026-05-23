from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, analyze
from app.core.config import settings

app = FastAPI(title="Said-Bird API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analyze"])


@app.get("/health")
def health():
    return {"status": "ok"}
