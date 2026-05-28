#!/usr/bin/env python3
"""
将 data/knowledge/ 目录下的 Markdown 文件导入数据库。
同时解析知识关系（前置知识、相关概念）并写入 knowledge_relations 表。

用法:
    cd backend
    uv run python ../scripts/import_content.py
"""

import os
import re
import sys
import glob
import yaml
from pathlib import Path

# 将 backend 加入路径
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.database import SessionLocal, engine, Base
from app.models.knowledge import KnowledgePoint, KnowledgeRelation


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """解析 YAML frontmatter 和正文内容"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        return {}, content
    frontmatter = yaml.safe_load(match.group(1))
    body = match.group(2)
    return frontmatter or {}, body


def extract_summary(body: str) -> str:
    """从正文提取一句话摘要（第一个引用块）"""
    match = re.search(r'^>\s*(.+)$', body, re.MULTILINE)
    if match:
        return match.group(1).strip()[:500]
    # 如果没有引用块，取第一段非标题文本
    match = re.search(r'^(?![#\s])(.{10,100})', body, re.MULTILINE)
    if match:
        return match.group(1).strip()[:500]
    return ""


def import_knowledge_points(db: SessionLocal, knowledge_dir: str):
    """导入所有知识点"""
    md_files = glob.glob(os.path.join(knowledge_dir, "**", "*.md"), recursive=True)
    md_files.sort()

    imported = 0
    skipped = 0
    errors = []

    for filepath in md_files:
        rel_path = os.path.relpath(filepath, knowledge_dir)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            meta, body = parse_frontmatter(content)

            if not meta.get("slug"):
                errors.append(f"{rel_path}: 缺少 slug")
                continue

            slug = meta["slug"]
            title = meta.get("title", slug)
            category = meta.get("category", "未分类")
            difficulty = meta.get("difficulty", 1)
            sort_order = meta.get("sort_order", 0)
            summary = extract_summary(body)

            # 检查是否已存在
            existing = db.query(KnowledgePoint).filter(KnowledgePoint.slug == slug).first()
            if existing:
                # 更新
                existing.title = title
                existing.category = category
                existing.content = content
                existing.summary = summary
                existing.difficulty = difficulty
                existing.sort_order = sort_order
                print(f"  更新: {slug}")
            else:
                kp = KnowledgePoint(
                    slug=slug,
                    title=title,
                    category=category,
                    content=content,
                    summary=summary,
                    difficulty=difficulty,
                    sort_order=sort_order,
                )
                db.add(kp)
                print(f"  导入: {slug}")

            imported += 1

        except Exception as e:
            errors.append(f"{rel_path}: {e}")
            skipped += 1

    db.commit()
    return imported, skipped, errors


def import_relations(db: SessionLocal):
    """解析知识点的前置和相关关系"""
    all_points = db.query(KnowledgePoint).all()
    slug_map = {kp.slug: kp.id for kp in all_points}

    # 清除旧关系
    db.query(KnowledgeRelation).delete()
    db.commit()

    relations_added = 0

    for kp in all_points:
        meta, _ = parse_frontmatter(kp.content)

        # 前置知识
        for prereq_slug in meta.get("prerequisites", []):
            if prereq_slug in slug_map:
                rel = KnowledgeRelation(
                    from_id=kp.id,
                    to_id=slug_map[prereq_slug],
                    relation_type="prerequisite",
                )
                db.add(rel)
                relations_added += 1

        # 相关概念
        for related_slug in meta.get("related", []):
            if related_slug in slug_map:
                rel = KnowledgeRelation(
                    from_id=kp.id,
                    to_id=slug_map[related_slug],
                    relation_type="related",
                )
                db.add(rel)
                relations_added += 1

    db.commit()
    return relations_added


def main():
    project_root = Path(__file__).parent.parent
    knowledge_dir = project_root / "data" / "knowledge"

    if not knowledge_dir.exists():
        print(f"错误: 目录不存在 {knowledge_dir}")
        sys.exit(1)

    print(f"知识内容目录: {knowledge_dir}")
    print(f"数据库: {engine.url}")
    print()

    # 确保表存在
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 导入知识点
        print("=== 导入知识点 ===")
        imported, skipped, errors = import_knowledge_points(db, str(knowledge_dir))
        print(f"\n导入: {imported}, 跳过: {skipped}")

        if errors:
            print("\n错误:")
            for e in errors:
                print(f"  - {e}")

        # 导入关系
        print("\n=== 导入知识关系 ===")
        relations = import_relations(db)
        print(f"关系数: {relations}")

        # 统计
        total = db.query(KnowledgePoint).count()
        total_relations = db.query(KnowledgeRelation).count()
        print(f"\n=== 统计 ===")
        print(f"知识点总数: {total}")
        print(f"关系总数: {total_relations}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
