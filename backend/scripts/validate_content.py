#!/usr/bin/env python3
"""
校验知识内容文件的完整性和一致性。

检查项:
1. frontmatter 必填字段 (slug, title, category, difficulty)
2. slug 唯一性
3. Wiki 链接完整性 (链接的目标 slug 是否存在)
4. 前置知识是否都存在
5. 相关概念是否都存在
6. 正文内容不为空

用法:
    python scripts/validate_content.py
"""

import os
import re
import sys
import glob
import yaml
from pathlib import Path
from collections import defaultdict


def parse_frontmatter(content: str) -> tuple[dict, str]:
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        return {}, content
    frontmatter = yaml.safe_load(match.group(1))
    body = match.group(2)
    return frontmatter or {}, body


def extract_wiki_links(body: str) -> list[str]:
    """提取 Markdown 中的 Wiki 链接目标 slug"""
    # 匹配 [text](/k/slug) 格式
    links = re.findall(r'\[.*?\]\(/k/([^)]+)\)', body)
    return links


def validate_content(knowledge_dir: str) -> list[str]:
    errors = []
    warnings = []

    md_files = glob.glob(os.path.join(knowledge_dir, "**", "*.md"), recursive=True)
    md_files.sort()

    all_slugs = set()
    slug_to_file = {}
    all_meta = {}

    # 第一遍: 收集所有 slug
    for filepath in md_files:
        rel_path = os.path.relpath(filepath, knowledge_dir)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        meta, body = parse_frontmatter(content)
        slug = meta.get("slug", "")

        if not slug:
            errors.append(f"{rel_path}: 缺少 slug 字段")
            continue

        if slug in all_slugs:
            errors.append(f"{rel_path}: slug '{slug}' 与 {slug_to_file[slug]} 重复")
            continue

        all_slugs.add(slug)
        slug_to_file[slug] = rel_path
        all_meta[slug] = meta

        # 检查必填字段
        if not meta.get("title"):
            errors.append(f"{rel_path}: 缺少 title 字段")
        if not meta.get("category"):
            errors.append(f"{rel_path}: 缺少 category 字段")
        if "difficulty" not in meta:
            warnings.append(f"{rel_path}: 缺少 difficulty 字段")

        # 检查正文
        if len(body.strip()) < 100:
            warnings.append(f"{rel_path}: 正文内容过短 ({len(body.strip())} 字符)")

        # 检查前置知识
        for prereq in meta.get("prerequisites", []):
            if prereq not in all_slugs:
                # 暂存，第二遍检查
                pass

    # 第二遍: 检查链接完整性
    for filepath in md_files:
        rel_path = os.path.relpath(filepath, knowledge_dir)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        meta, body = parse_frontmatter(content)
        slug = meta.get("slug", "")
        if not slug:
            continue

        # 检查 Wiki 链接
        wiki_links = extract_wiki_links(body)
        for target_slug in wiki_links:
            if target_slug not in all_slugs:
                errors.append(f"{rel_path}: Wiki 链接目标 '{target_slug}' 不存在")

        # 检查前置知识
        for prereq in meta.get("prerequisites", []):
            if prereq not in all_slugs:
                errors.append(f"{rel_path}: 前置知识 '{prereq}' 不存在")

        # 检查相关概念
        for related in meta.get("related", []):
            if related not in all_slugs:
                warnings.append(f"{rel_path}: 相关概念 '{related}' 不存在")

    return errors, warnings


def main():
    project_root = Path(__file__).parent.parent
    knowledge_dir = project_root / "data" / "knowledge"

    if not knowledge_dir.exists():
        print(f"错误: 目录不存在 {knowledge_dir}")
        sys.exit(1)

    print(f"校验目录: {knowledge_dir}")
    print()

    errors, warnings = validate_content(str(knowledge_dir))

    if errors:
        print(f"错误 ({len(errors)}):")
        for e in errors:
            print(f"  ❌ {e}")
        print()

    if warnings:
        print(f"警告 ({len(warnings)}):")
        for w in warnings:
            print(f"  ⚠️  {w}")
        print()

    if not errors and not warnings:
        print("✅ 所有检查通过!")
    elif not errors:
        print(f"✅ 无错误，但有 {len(warnings)} 个警告")
    else:
        print(f"❌ 发现 {len(errors)} 个错误，{len(warnings)} 个警告")
        sys.exit(1)


if __name__ == "__main__":
    main()
