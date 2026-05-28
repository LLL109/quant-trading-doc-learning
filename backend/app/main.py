import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
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


def seed_database():
    """Seed database with knowledge points if empty."""
    from app.models.knowledge import KnowledgePoint
    db = SessionLocal()
    try:
        count = db.query(KnowledgePoint).count()
        if count > 0:
            print(f"Database already has {count} knowledge points, skipping seed.")
            return

        print("Database is empty, seeding...")
        project_root = Path(__file__).parent.parent
        scripts_dir = project_root / "scripts"

        for script_name in ["import_content.py", "import_quizzes.py"]:
            script_path = scripts_dir / script_name
            if script_path.exists():
                print(f"Running {script_name}...")
                result = subprocess.run(
                    ["uv", "run", "python", str(script_path)],
                    capture_output=True, text=True, cwd=str(project_root)
                )
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
                if result.returncode != 0:
                    print(f"Warning: {script_name} exited with code {result.returncode}")
            else:
                print(f"Script not found: {script_path}")
        print("Seeding complete.")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()


@app.get("/health")
def health_check():
    return {"status": "ok"}
