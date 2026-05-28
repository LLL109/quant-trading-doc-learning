from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json

from app.core.database import get_db
from app.models.knowledge import KnowledgePoint, Quiz, UserProgress

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class QuizItem(BaseModel):
    id: int
    knowledge_point_id: int
    question: str
    question_type: str
    options: Optional[list] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_model(cls, quiz: Quiz):
        options = None
        if quiz.options:
            try:
                options = json.loads(quiz.options)
            except:
                options = None
        return cls(
            id=quiz.id,
            knowledge_point_id=quiz.knowledge_point_id,
            question=quiz.question,
            question_type=quiz.question_type,
            options=options,
            explanation=quiz.explanation,
        )

class SubmitAnswer(BaseModel):
    quiz_id: int
    answer: str

class SubmitResult(BaseModel):
    correct: bool
    correct_answer: str
    explanation: Optional[str] = None

@router.get("/{knowledge_point_id}", response_model=List[QuizItem])
def get_quizzes(knowledge_point_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.knowledge_point_id == knowledge_point_id).all()
    return [QuizItem.from_orm_model(q) for q in quizzes]

@router.post("/submit", response_model=SubmitResult)
def submit_answer(body: SubmitAnswer, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == body.quiz_id).first()
    if not quiz:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct = body.answer.strip().lower() == quiz.answer.strip().lower()
    return SubmitResult(
        correct=correct,
        correct_answer=quiz.answer,
        explanation=quiz.explanation,
    )
