from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class KnowledgePoint(Base):
    __tablename__ = "knowledge_points"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(String(500))
    difficulty = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    prerequisites = relationship(
        "KnowledgeRelation",
        foreign_keys="KnowledgeRelation.from_id",
        back_populates="from_point",
    )
    related_to = relationship(
        "KnowledgeRelation",
        foreign_keys="KnowledgeRelation.to_id",
        back_populates="to_point",
    )


class KnowledgeRelation(Base):
    __tablename__ = "knowledge_relations"

    id = Column(Integer, primary_key=True)
    from_id = Column(Integer, ForeignKey("knowledge_points.id"), nullable=False)
    to_id = Column(Integer, ForeignKey("knowledge_points.id"), nullable=False)
    relation_type = Column(String(20), nullable=False)

    from_point = relationship("KnowledgePoint", foreign_keys=[from_id])
    to_point = relationship("KnowledgePoint", foreign_keys=[to_id])

    __table_args__ = (UniqueConstraint("from_id", "to_id", "relation_type"),)


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String(20), nullable=False)
    options = Column(Text)
    answer = Column(String(200), nullable=False)
    explanation = Column(Text)

    knowledge_point = relationship("KnowledgePoint")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), unique=True, nullable=False)
    status = Column(String(20), default="not_started")
    quiz_score = Column(Float)
    last_studied_at = Column(DateTime)

    knowledge_point = relationship("KnowledgePoint")
