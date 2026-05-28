from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.knowledge import KnowledgePoint, KnowledgeRelation

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class KnowledgePointBrief(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    summary: Optional[str] = None
    difficulty: int
    sort_order: int

    class Config:
        from_attributes = True


class KnowledgePointDetail(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    content: str
    summary: Optional[str] = None
    difficulty: int
    sort_order: int
    prerequisites: List[dict] = []
    related: List[dict] = []

    class Config:
        from_attributes = True


class GraphNode(BaseModel):
    id: int
    label: str
    category: str
    slug: str


class GraphEdge(BaseModel):
    source: int
    target: int
    relation_type: str


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    """返回所有知识分类名称"""
    categories = (
        db.query(KnowledgePoint.category)
        .distinct()
        .order_by(KnowledgePoint.category)
        .all()
    )
    return [c[0] for c in categories]


@router.get("", response_model=List[KnowledgePointBrief])
def list_knowledge_points(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgePoint)
    if category:
        query = query.filter(KnowledgePoint.category == category)
    return query.order_by(KnowledgePoint.sort_order, KnowledgePoint.id).all()


@router.get("/search", response_model=List[KnowledgePointBrief])
def search_knowledge_points(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db),
):
    pattern = f"%{q}%"
    return (
        db.query(KnowledgePoint)
        .filter(
            or_(
                KnowledgePoint.title.ilike(pattern),
                KnowledgePoint.summary.ilike(pattern),
                KnowledgePoint.content.ilike(pattern),
            )
        )
        .order_by(KnowledgePoint.sort_order)
        .all()
    )


@router.get("/graph", response_model=GraphData)
def get_knowledge_graph(db: Session = Depends(get_db)):
    points = db.query(KnowledgePoint).all()
    relations = db.query(KnowledgeRelation).all()

    nodes = [
        GraphNode(id=p.id, label=p.title, category=p.category, slug=p.slug)
        for p in points
    ]
    edges = [
        GraphEdge(source=r.from_id, target=r.to_id, relation_type=r.relation_type)
        for r in relations
    ]

    return GraphData(nodes=nodes, edges=edges)


@router.get("/{slug}", response_model=KnowledgePointDetail)
def get_knowledge_point(slug: str, db: Session = Depends(get_db)):
    point = db.query(KnowledgePoint).filter(KnowledgePoint.slug == slug).first()
    if not point:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Knowledge point not found")

    # 前置知识: 本知识点依赖的那些 (from_id = 本点, to_id = 前置)
    prereqs = (
        db.query(KnowledgeRelation)
        .filter(
            KnowledgeRelation.from_id == point.id,
            KnowledgeRelation.relation_type == "prerequisite",
        )
        .all()
    )
    # 相关概念: 双向
    related = (
        db.query(KnowledgeRelation)
        .filter(
            or_(
                KnowledgeRelation.from_id == point.id,
                KnowledgeRelation.to_id == point.id,
            ),
            KnowledgeRelation.relation_type == "related",
        )
        .all()
    )

    prerequisites_list = []
    for r in prereqs:
        kp = db.query(KnowledgePoint).filter(KnowledgePoint.id == r.to_id).first()
        if kp:
            prerequisites_list.append({"id": kp.id, "slug": kp.slug, "title": kp.title})

    related_list = []
    seen_slugs = set()
    for r in related:
        other_id = r.to_id if r.from_id == point.id else r.from_id
        kp = db.query(KnowledgePoint).filter(KnowledgePoint.id == other_id).first()
        if kp and kp.slug not in seen_slugs:
            related_list.append({"id": kp.id, "slug": kp.slug, "title": kp.title})
            seen_slugs.add(kp.slug)

    return KnowledgePointDetail(
        id=point.id,
        slug=point.slug,
        title=point.title,
        category=point.category,
        content=point.content,
        summary=point.summary,
        difficulty=point.difficulty,
        sort_order=point.sort_order,
        prerequisites=prerequisites_list,
        related=related_list,
    )
