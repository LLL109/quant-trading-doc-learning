#!/usr/bin/env python3
"""导入练习题到数据库"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.database import SessionLocal, engine, Base
from app.models.knowledge import KnowledgePoint, Quiz


def import_quizzes(db: SessionLocal, quiz_file: str):
    with open(quiz_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    imported = 0
    for item in data:
        slug = item["knowledge_slug"]
        kp = db.query(KnowledgePoint).filter(KnowledgePoint.slug == slug).first()
        if not kp:
            print(f"  跳过: {slug} (知识点不存在)")
            continue

        for q in item["questions"]:
            import json as json_mod
            options_str = json_mod.dumps(q.get("options"), ensure_ascii=False) if q.get("options") else None
            quiz = Quiz(
                knowledge_point_id=kp.id,
                question=q["question"],
                question_type=q["question_type"],
                options=options_str,
                answer=q["answer"],
                explanation=q.get("explanation"),
            )
            db.add(quiz)
            imported += 1
        print(f"  {slug}: {len(item['questions'])} 题")

    db.commit()
    return imported


def main():
    project_root = Path(__file__).parent.parent
    quiz_dir = project_root / "data" / "quizzes"

    if not quiz_dir.exists():
        print(f"错误: 练习题目录不存在 {quiz_dir}")
        sys.exit(1)

    quiz_files = sorted(quiz_dir.glob("*.json"))
    if not quiz_files:
        print(f"错误: {quiz_dir} 下没有 JSON 文件")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 清除旧练习题
        deleted = db.query(Quiz).delete()
        db.commit()
        if deleted:
            print(f"清除旧练习题: {deleted} 道")

        total = 0
        for quiz_file in quiz_files:
            print(f"\n=== 导入 {quiz_file.name} ===")
            count = import_quizzes(db, str(quiz_file))
            total += count

        print(f"\n总计导入: {total} 题 (来自 {len(quiz_files)} 个文件)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
