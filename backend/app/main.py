from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.knowledge import router as knowledge_router
from app.api.quiz import router as quiz_router
from app.api.progress import router as progress_router
from app.api.market import router as market_router

# Import all models so Base.metadata knows about them
from app.models import knowledge  # noqa: F401

app = FastAPI(
    title="Quant Trading Doc Learning API",
    description="量化交易知识学习平台后端 API",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(knowledge_router)
app.include_router(quiz_router)
app.include_router(progress_router)
app.include_router(market_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok"}
