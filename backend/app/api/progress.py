from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.knowledge import KnowledgePoint, UserProgress

router = APIRouter(prefix="/api/progress", tags=["progress"])

class ProgressItem(BaseModel):
    knowledge_point_id: int
    slug: str
    title: str
    category: str
    status: str
    quiz_score: Optional[float] = None
    last_studied_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    status: str  # "not_started" | "learning" | "mastered"

class ProgressStats(BaseModel):
    total: int
    not_started: int
    learning: int
    mastered: int
    categories: dict  # { "基础概念": { total, mastered } }

@router.get("", response_model=List[ProgressItem])
def get_all_progress(db: Session = Depends(get_db)):
    points = db.query(KnowledgePoint).all()
    result = []
    for p in points:
        prog = db.query(UserProgress).filter(UserProgress.knowledge_point_id == p.id).first()
        result.append(ProgressItem(
            knowledge_point_id=p.id,
            slug=p.slug,
            title=p.title,
            category=p.category,
            status=prog.status if prog else "not_started",
            quiz_score=prog.quiz_score if prog else None,
            last_studied_at=prog.last_studied_at if prog else None,
        ))
    return result

@router.get("/stats", response_model=ProgressStats)
def get_progress_stats(db: Session = Depends(get_db)):
    points = db.query(KnowledgePoint).all()
    total = len(points)
    not_started = 0
    learning = 0
    mastered = 0
    categories = {}

    for p in points:
        if p.category not in categories:
            categories[p.category] = {"total": 0, "mastered": 0}
        categories[p.category]["total"] += 1

        prog = db.query(UserProgress).filter(UserProgress.knowledge_point_id == p.id).first()
        if prog:
            if prog.status == "mastered":
                mastered += 1
                categories[p.category]["mastered"] += 1
            elif prog.status == "learning":
                learning += 1
            else:
                not_started += 1
        else:
            not_started += 1

    return ProgressStats(
        total=total, not_started=not_started,
        learning=learning, mastered=mastered,
        categories=categories,
    )

@router.put("/{slug}")
def update_progress(slug: str, body: ProgressUpdate, db: Session = Depends(get_db)):
    point = db.query(KnowledgePoint).filter(KnowledgePoint.slug == slug).first()
    if not point:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")

    prog = db.query(UserProgress).filter(UserProgress.knowledge_point_id == point.id).first()
    if not prog:
        prog = UserProgress(knowledge_point_id=point.id, status=body.status)
        db.add(prog)
    else:
        prog.status = body.status
    prog.last_studied_at = datetime.utcnow()
    db.commit()
    return {"ok": True}
