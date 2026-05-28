# 量化交易学习平台 — 执行计划

## 总体目标

完成一个可用的知识学习平台，包含 ~100 个知识点页面，每个知识点有完整的定义和核心内容，支持 Wiki 跳转，有基础图表和练习功能。

**原则**: 先跑通核心链路（浏览知识 → 跳转学习 → 做练习），再补充数据可视化和高级功能。

---

## 环境管理

### Python 后端

| 工具 | 用途 |
|------|------|
| `uv` | Python 版本 + 虚拟环境 + 依赖管理 (替代 pip/venv/pipenv) |
| `pyproject.toml` | 项目元数据和依赖声明 |
| `uv.lock` | 依赖锁文件，保证环境一致性 |

```bash
# 初始化
uv init --python 3.12
uv add fastapi uvicorn sqlalchemy alembic akshare

# 运行
uv run uvicorn app.main:app --reload
```

### Node.js 前端

| 工具 | 用途 |
|------|------|
| `pnpm` | 包管理 (比 npm 快，磁盘占用少) |
| `pnpm-lock.yaml` | 依赖锁文件 |

```bash
# 初始化
pnpm create next-app@latest frontend --typescript --tailwind --app

# 运行
cd frontend && pnpm dev
```

### 数据库

| 环境 | 数据库 | 理由 |
|------|--------|------|
| 开发 | SQLite | 零配置，数据文件在项目目录内 |
| 生产 | PostgreSQL | 性能更好，支持并发 |

SQLAlchemy 连接字符串通过环境变量切换，代码无需改动。

### 环境变量

后端 `.env`:
```env
DATABASE_URL=sqlite:///./data/quant_learning.db
# 生产时切换为:
# DATABASE_URL=postgresql://user:pass@localhost:5432/quant_learning
CORS_ORIGINS=http://localhost:3000
```

前端 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 部署

`docker-compose.yml` 编排三个服务:
- `frontend` — Next.js (Node.js)
- `backend` — FastAPI (Python)
- `db` — PostgreSQL (生产)

---

## Phase 1: 项目脚手架

### 目标
前后端项目能跑起来，基础布局就位。

### 前端任务

| # | 任务 | 产出 |
|---|------|------|
| 1.1 | Next.js 项目初始化 (App Router + TypeScript + pnpm) | `frontend/` 目录 |
| 1.2 | Tailwind CSS + shadcn/ui 配置 | 样式系统就绪 |
| 1.3 | 全局布局: 顶部栏 + 侧边栏 + 内容区 | `layout.tsx` |
| 1.4 | Quant Terminal 主题配色 (CSS变量) | `globals.css` |
| 1.5 | 响应式断点处理 | 移动端适配 |

### 后端任务

| # | 任务 | 产出 |
|---|------|------|
| 1.6 | FastAPI 项目初始化 (uv + pyproject.toml) | `backend/` 目录 |
| 1.7 | SQLAlchemy 模型定义 | `models/*.py` |
| 1.8 | Alembic 迁移配置 | 数据库建表 |
| 1.9 | 基础 CRUD API (知识点列表/详情) | `api/knowledge.py` |
| 1.10 | CORS 配置 + 静态文件服务 | 前后端联调就绪 |

### 验收标准
- [ ] `pnpm dev` 启动前端，看到 Quant Terminal 风格的布局
- [ ] `uv run uvicorn app.main:app --reload` 启动后端，`/docs` 能看到 API 文档
- [ ] 前端能调通后端 API 并显示数据

---

## Phase 2: 知识内容体系

### 目标
每个知识点都有完整的定义、核心内容、公式、代码示例、常见误区。

### 任务

| # | 任务 | 产出 |
|---|------|------|
| 2.1 | 设计知识分类树 (10 大分类) | `data/categories.json` |
| 2.2 | 编写 P0 知识点内容 (40个) | `data/knowledge/**/*.md` |
| 2.3 | 每个知识点必须包含: 定义/详细解释/公式/代码/误区/链接 | 严格按模板 |
| 2.4 | Markdown 内容导入脚本 | `scripts/import_content.py` |
| 2.5 | 自定义 Wiki 链接 Markdown 扩展 | `backend/app/core/wiki_link.py` |
| 2.6 | 内容校验脚本 (slug唯一性/链接完整性) | `scripts/validate_content.py` |

### 知识点页面标准模板

每个知识点页面必须包含以下板块:

```markdown
---
slug: k-line
title: K线图
category: 技术分析
difficulty: 1
prerequisites: [stock]
related: [ma, volume, trendline]
tags: [基础, 图表]
---

# K线图

## 定义

> K线图（Candlestick Chart）是一种用于展示金融资产价格变动的图表类型，
> 起源于日本米市交易，每根K线包含开盘价、收盘价、最高价、最低价四个价格信息。

## 核心内容

### K线的构成

每根K线由**实体**和**影线**两部分组成：
- **实体**: 开盘价和收盘价之间的区域
  - 阳线（上涨）: 收盘价 > 开盘价，通常为绿色/红色
  - 阴线（下跌）: 收盘价 < 开盘价，通常为红色/绿色
- **上影线**: 实体顶部到最高价的线条
- **下影线**: 实体底部到最低价的线条

### 四个价格

| 价格 | 含义 | 示例 |
|------|------|------|
| 开盘价 | 当周期第一笔成交价 | 10.00元 |
| 收盘价 | 当周期最后一笔成交价 | 10.50元 |
| 最高价 | 当周期最高成交价 | 10.80元 |
| 最低价 | 当周期最低成交价 | 9.90元 |

## 计算公式

日收益率:
$$r = \frac{P_{close} - P_{open}}{P_{open}} \times 100\%$$

## 图表说明

[内嵌K线图组件，展示实际A股K线]

## Python 代码

\`\`\`python
import akshare as ak
import mplfinance as mpf

# 获取沪深300成分股K线数据
df = ak.stock_zh_a_hist(symbol="000001", period="daily",
                         start_date="20240101", end_date="20241231")
df.index = pd.to_datetime(df['日期'])

# 绘制K线图
mpf.plot(df, type='candle', volume=True,
         style='charles', title='平安银行日K线')
\`\`\`

## 相关概念

- [开盘价](/k/open-price) — 当周期第一笔成交价
- [收盘价](/k/close-price) — 当周期最后一笔成交价
- [均线](/k/ma) — 基于收盘价计算的趋势指标
- [成交量](/k/volume) — 与K线配合使用判断强弱

## 常见误区

1. **只看K线形态不看成交量** — K线形态需要成交量配合才有意义
2. **忽视时间周期** — 日K、周K、月K的信号强度不同
3. **过度解读单根K线** — 单根K线信号较弱，需结合多根K线和趋势判断
```

### 验收标准
- [ ] 每个知识点都包含: 定义、核心内容、公式/代码、相关链接、常见误区
- [ ] 至少 40 个 P0 知识点内容完成
- [ ] 导入脚本能将 Markdown 写入数据库
- [ ] Wiki 链接语法能正确渲染为可点击链接
- [ ] 校验脚本能检测出 broken links

---

## Phase 3: 知识浏览前端

### 目标
用户可以浏览知识目录、查看知识点详情、点击跳转。

### 任务

| # | 任务 | 产出 |
|---|------|------|
| 3.1 | 知识目录页 — 分类树 + 搜索 | `/knowledge` |
| 3.2 | 知识详情页 — Markdown 渲染 | `/k/[slug]` |
| 3.3 | Wiki 链接组件 — 绿色链接 + Tooltip | `WikiLink.tsx` |
| 3.4 | 侧边栏导航 — 当前分类高亮 | `Sidebar.tsx` |
| 3.5 | 知识点底部: 前置/相关/练习区 | `KnowledgeFooter.tsx` |
| 3.6 | 面包屑导航 | `Breadcrumb.tsx` |
| 3.7 | KaTeX 公式渲染 | 集成到 Markdown |
| 3.8 | 代码块高亮 (Shiki) | 集成到 Markdown |
| 3.9 | 右侧浮动目录 (TOC) | `TableOfContents.tsx` |

### 验收标准
- [ ] 点击侧边栏能浏览所有分类
- [ ] 知识详情页能正确渲染 Markdown、公式、代码
- [ ] 点击知识点内的 Wiki 链接能跳转到对应页面
- [ ] 搜索功能能按标题/内容模糊匹配

---

## Phase 4: 练习测验系统

### 目标
每个知识点关联练习题，支持答题、反馈、错题本。

### 任务

| # | 任务 | 产出 |
|---|------|------|
| 4.1 | 后端: 练习题 CRUD API | `api/quiz.py` |
| 4.2 | 后端: 答案校验 + 解析返回 | `services/quiz.py` |
| 4.3 | 前端: 答题卡片组件 (选择/判断/填空) | `QuizCard.tsx` |
| 4.4 | 前端: 即时反馈 + 解析展示 | `QuizFeedback.tsx` |
| 4.5 | 前端: 错题本页面 | `/mistakes` |
| 4.6 | 学习进度后端 API | `api/progress.py` |
| 4.7 | 学习进度前端展示 | `ProgressCard.tsx` |
| 4.8 | 编写练习题内容 (~100题) | `data/quizzes/*.json` |

### 验收标准
- [ ] 知识点详情页底部能显示练习题
- [ ] 答题后能即时看到对错和解析
- [ ] 错题本能查看所有答错的题
- [ ] 学习进度页能看到各分类掌握情况

---

## Phase 5: 行情数据可视化

### 目标
集成 A 股数据，用真实行情辅助理解知识点。

### 任务

| # | 任务 | 产出 |
|---|------|------|
| 5.1 | 后端: akshare 数据服务封装 | `services/market_data.py` |
| 5.2 | 后端: K线数据 API (日/周/月) | `api/market.py` |
| 5.3 | 后端: 技术指标计算 (MA/MACD/RSI/BOLL) | `services/indicators.py` |
| 5.4 | 前端: K线图组件 (Lightweight Charts) | `KLineChart.tsx` |
| 5.5 | 前端: 技术指标叠加层 | `IndicatorOverlay.tsx` |
| 5.6 | 前端: 行情看板页 | `/market` |
| 5.7 | 知识点内嵌图表 (学习MA时展示真实均线) | 内嵌组件 |

### 验收标准
- [ ] 行情看板能显示 A 股 K 线图
- [ ] 能叠加 MA、MACD 等技术指标
- [ ] 知识详情页中能内嵌相关行情图表

---

## Phase 6: 知识图谱与整合

### 目标
知识图谱可视化，整体打磨，部署就绪。

### 任务

| # | 任务 | 产出 |
|---|------|------|
| 6.1 | 后端: 知识图谱数据 API (nodes + edges) | `api/graph.py` |
| 6.2 | 前端: D3.js 力导向知识图谱 | `/graph` |
| 6.3 | 知识图谱节点着色 (已掌握/学习中/未学) | 图谱交互 |
| 6.4 | 首页仪表盘整合 | `/` |
| 6.5 | 补充剩余知识点内容 (~60个) | `data/knowledge/` |
| 6.6 | 补充剩余练习题 | `data/quizzes/` |
| 6.7 | Docker Compose 部署配置 | `docker-compose.yml` |
| 6.8 | 响应式适配 + 移动端优化 | 全局样式调整 |

### 验收标准
- [ ] 知识图谱能展示所有知识点及其关联关系
- [ ] 点击图谱节点能跳转到对应知识详情
- [ ] 首页仪表盘显示学习进度和推荐
- [ ] Docker Compose 能一键启动前后端

---

## 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 内容编写工作量大 | 延期 | 优先写核心 40 个 P0，其余逐步补充 |
| akshare 接口不稳定 | 数据展示受阻 | 加缓存层，准备 mock 数据 |
| 知识图谱交互性能 | 节点多时卡顿 | 限制一次展示的节点数，分层加载 |
| Markdown 内容格式不统一 | 渲染异常 | 制定严格的格式模板，写校验脚本 |
