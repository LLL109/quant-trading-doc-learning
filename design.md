# 量化交易学习平台 — 技术设计文档

## 1. 产品定位

**一句话描述**: 一个 Wiki 风格的量化交易知识库，每个核心概念独立成页，知识点之间互相跳转，配合代码示例和可视化图表。

**目标用户**: 有编程基础、金融基础薄弱、想系统学习量化交易的程序员。

**核心体验**: 像读 Investopedia 一样浏览知识，但内容更贴合 A 股市场，每个知识点附带 Python 代码和可交互图表。

---

## 2. 前端设计

### 2.1 设计风格: Quant Terminal

灵感来自 Bloomberg Terminal + Notion 的混合体。

| 元素 | 选择 | 理由 |
|------|------|------|
| 主题 | 深色为主 (Dark Mode) | 金融终端感，长时间阅读不刺眼 |
| 背景 | `#0a0e17` 深海军蓝 | 比纯黑更有层次 |
| 主色调 | `#00d4aa` 翡翠绿 | 涨/正向，金融感强 |
| 强调色 | `#ff6b6b` 暗红 | 跌/警示 |
| 辅助色 | `#ffd93d` 琥珀金 | 重要标注、星级 |
| 字体-标题 | `JetBrains Mono` | 等宽字体，代码/数据感 |
| 字体-正文 | `Noto Sans SC` | 中文可读性好 |
| 字体-代码 | `Fira Code` | 支持连字，代码高亮 |

### 2.2 页面结构

```
┌─────────────────────────────────────────────────────┐
│  [LOGO] QuantLearn     [搜索...]        [进度 72%]  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  侧边栏   │              内容区                      │
│          │                                          │
│ ▸ 基础概念 │   ┌─────────────────────────────────┐   │
│   ├ 股票   │   │  # K线图详解                     │   │
│   ├ ETF    │   │                                 │   │
│   ├ 期货   │   │  K线图是展示价格变动的最基本工具    │   │
│   └ ...   │   │  每根K线包含 [开盘价] [收盘价]      │   │
│          │   │  [最高价] [最低价] 四个价格...       │
│ ▸ 技术分析 │   │                                 │   │
│   ├ K线 ★ │   │  ## 相关概念                     │   │
│   ├ 均线   │   │  → [均线](/k/ma)                │   │
│   ├ MACD  │   │  → [成交量](/k/volume)           │   │
│   └ ...   │   │  → [趋势线](/k/trendline)        │   │
│          │   │                                 │   │
│ ▸ 基本面   │   │  ## Python 实现                  │   │
│   ├ PE    │   │  ```python                      │   │
│   ├ PB    │   │  import mplfinance as mpf       │   │
│   └ ...   │   │  mpf.plot(df, type='candle')    │   │
│          │   │  ```                            │   │
│ ▸ 量化策略 │   │                                 │   │
│   ├ 趋势   │   │  ## 交互图表                    │   │
│   ├ 均值回归│   │  [K线图组件 - 可缩放/悬停]       │   │
│   └ ...   │   └─────────────────────────────────┘   │
│          │                                          │
│ ▸ 回测    │   ┌─────────────────────────────────┐   │
│ ▸ 风控    │   │  掌握度: ●●●○○  练习题: 3/5     │   │
│ ▸ 机器学习 │   │  [做练习]  [下一个 →]            │   │
│          │   └─────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### 2.3 核心页面

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页/仪表盘 | `/` | 学习进度、推荐下一步、最近浏览 |
| 知识目录 | `/knowledge` | 按分类浏览所有知识点，树形结构 |
| 知识详情 | `/k/[slug]` | 知识点内容 + 相关链接 + 练习题 |
| 知识图谱 | `/graph` | 可视化知识关系网络 (D3.js) |
| 行情看板 | `/market` | K线图 + 技术指标叠加 |
| 学习进度 | `/progress` | 掌握度统计、薄弱环节 |

### 2.4 知识详情页交互

**核心功能: Wiki 链接跳转**

在 Markdown 内容中，用特殊语法标记可跳转的概念:

```markdown
K线图由[开盘价](/k/open-price)、[收盘价](/k/close-price)、
[最高价](/k/high-price)和[最低价](/k/low-price)组成。
当[短期均线](/k/ma)上穿[长期均线](/k/ma)时，形成
[金叉](/k/golden-cross)信号。
```

渲染后变成可点击的绿色链接，hover 时显示该概念的简短 tooltip。

**页面底部自动关联**:
- 前置知识 (学习本概念前应先看什么)
- 相关概念 (同一分类下的其他知识点)
- 练习题 (检验理解程度)

---

## 3. 后端设计

### 3.1 技术栈

| 组件 | 选型 |
|------|------|
| 框架 | FastAPI |
| 数据库 | SQLite (开发期) → PostgreSQL (生产) |
| ORM | SQLAlchemy 2.0 + Alembic |
| 数据源 | akshare (A股数据) |
| 内容渲染 | Python-Markdown + 自定义 wiki-link 扩展 |

### 3.2 数据模型

```sql
-- 知识点
CREATE TABLE knowledge_points (
    id          INTEGER PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,      -- URL友好标识，如 "k-line", "ma"
    title       TEXT NOT NULL,             -- 显示标题，如 "K线图"
    category    TEXT NOT NULL,             -- 分类，如 "技术分析"
    content     TEXT NOT NULL,             -- Markdown 内容
    difficulty  INTEGER DEFAULT 1,         -- 难度 1-5
    sort_order  INTEGER DEFAULT 0,         -- 同分类内排序
    created_at  DATETIME,
    updated_at  DATETIME
);

-- 知识点关系 (前置/相关)
CREATE TABLE knowledge_relations (
    id              INTEGER PRIMARY KEY,
    from_id         INTEGER REFERENCES knowledge_points(id),
    to_id           INTEGER REFERENCES knowledge_points(id),
    relation_type   TEXT NOT NULL,          -- "prerequisite" | "related" | "next"
    UNIQUE(from_id, to_id, relation_type)
);

-- 练习题
CREATE TABLE quizzes (
    id                  INTEGER PRIMARY KEY,
    knowledge_point_id  INTEGER REFERENCES knowledge_points(id),
    question            TEXT NOT NULL,
    question_type       TEXT NOT NULL,       -- "choice" | "true_false" | "fill"
    options             TEXT,                -- JSON: ["A", "B", "C", "D"]
    answer              TEXT NOT NULL,
    explanation         TEXT
);

-- 学习进度 (单用户，本地存储为主)
CREATE TABLE user_progress (
    id                  INTEGER PRIMARY KEY,
    knowledge_point_id  INTEGER REFERENCES knowledge_points(id),
    status              TEXT DEFAULT "not_started",  -- "not_started" | "learning" | "mastered"
    quiz_score          REAL,
    last_studied_at     DATETIME,
    UNIQUE(knowledge_point_id)
);
```

### 3.3 API 设计

```
GET  /api/knowledge                    # 知识点列表 (支持 ?category= 技术分析)
GET  /api/knowledge/{slug}             # 知识点详情 (含关联关系)
GET  /api/knowledge/graph              # 知识图谱数据 (nodes + edges)
GET  /api/quiz/{knowledge_point_id}    # 获取某知识点的练习题
POST /api/quiz/submit                  # 提交答案
GET  /api/progress                     # 学习进度统计
PUT  /api/progress/{slug}              # 更新学习状态
GET  /api/market/kline?code=sh000300   # K线数据
GET  /api/market/indicators?code=...   # 技术指标数据
```

---

## 4. 知识内容体系

基于 GPT 文档的 20 章，拆解为独立知识点页面:

### 第一层: 分类

| 分类 | 包含知识点数 | 说明 |
|------|------------|------|
| 基础概念 | ~15 | 股票、ETF、期货、可转债等 |
| 收益与风险 | ~10 | 收益率、波动率、夏普比率等 |
| 技术分析 | ~15 | K线、均线、MACD、RSI、布林带等 |
| 基本面分析 | ~10 | PE、PB、ROE、财务三表等 |
| 量化策略 | ~10 | 趋势跟踪、均值回归、动量轮动等 |
| 回测 | ~10 | 未来函数、过拟合、Walk-forward等 |
| 风控与仓位 | ~8 | 止损、仓位管理、回撤控制等 |
| 数据与工具 | ~8 | akshare、数据质量、复权等 |
| 机器学习 | ~8 | 特征工程、模型选择、标签设计等 |
| 入门路线 | ~5 | 学习路线、练手项目等 |

**总计约 100 个知识点**，每个知识点是一个独立页面。

### 第二层: 知识点示例 (技术分析分类)

```
技术分析/
├── K线图基础          → 详细解释四价、影线、实体
│   ├── 阳线与阴线     → 涨跌的视觉表示
│   ├── 常见K线形态    → 十字星、锤子线、吞没形态
│   └── K线组合        → 早晨之星、三只乌鸦等
├── 均线               → MA定义、计算方法
│   ├── 简单移动平均    → SMA
│   ├── 指数移动平均    → EMA
│   ├── 金叉与死叉     → 短长均线交叉信号
│   └── 均线系统       → 多均线组合使用
├── MACD               → 定义、计算、信号线
├── RSI                → 相对强弱指标
├── 布林带             → BOLL定义与用法
├── 成交量             → 量价关系
└── 趋势线             → 支撑与阻力
```

每个知识点页面结构:
1. **一句话定义** — 粗体核心概念
2. **详细解释** — 通俗易懂的说明
3. **计算公式** — LaTeX 渲染
4. **图表说明** — 配合真实数据的可视化
5. **Python 代码** — 可运行的示例
6. **相关概念** — Wiki 链接跳转
7. **常见误区** — 新手容易踩的坑
8. **练习题** — 检验理解

---

## 5. 技术架构图

```
┌─────────────────────────────────────────────────┐
│                    前端 (Next.js)                │
│                                                 │
│  ┌──────┐  ┌──────────┐  ┌──────┐  ┌────────┐  │
│  │ 知识  │  │ Markdown  │  │ K线图 │  │ 知识   │  │
│  │ 目录  │  │ 渲染引擎  │  │ 组件  │  │ 图谱   │  │
│  └──┬───┘  └────┬─────┘  └──┬───┘  └───┬────┘  │
│     │           │           │          │       │
│     └───────────┴─────┬─────┴──────────┘       │
│                       │ API 调用                 │
└───────────────────────┼─────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────┐
│                 后端 (FastAPI)                    │
│                       │                          │
│  ┌──────────┐  ┌──────┴──────┐  ┌────────────┐  │
│  │ 知识点   │  │  行情数据    │  │  练习题     │  │
│  │ CRUD API │  │  服务        │  │  服务       │  │
│  └────┬─────┘  └──────┬──────┘  └─────┬──────┘  │
│       │               │              │         │
│  ┌────┴─────┐  ┌──────┴──────┐       │         │
│  │SQLite/PG │  │   akshare   │       │         │
│  │ 数据库   │  │  A股数据API │       │         │
│  └──────────┘  └─────────────┘       │         │
└──────────────────────────────────────┘         │
└────────────────────────────────────────────────┘
```

---

## 6. 环境管理

### 6.1 Python 后端

| 工具 | 用途 | 说明 |
|------|------|------|
| `uv` | 包管理 | 替代 pip/venv/pipenv，速度快 10-100x |
| `pyproject.toml` | 项目配置 | PEP 621 标准，声明依赖和元数据 |
| `uv.lock` | 锁文件 | 保证环境一致性 |

```bash
# 项目初始化
uv init --python 3.12 quant-learning-backend
cd quant-learning-backend
uv add fastapi uvicorn[standard] sqlalchemy alembic akshare pydantic-settings

# 开发运行
uv run uvicorn app.main:app --reload --port 8000

# 数据库迁移
uv run alembic upgrade head
```

### 6.2 Node.js 前端

| 工具 | 用途 | 说明 |
|------|------|------|
| `pnpm` | 包管理 | 比 npm 快，磁盘占用少，严格依赖隔离 |
| `pnpm-lock.yaml` | 锁文件 | 保证环境一致性 |

```bash
# 项目初始化
pnpm create next-app@latest frontend --typescript --tailwind --app --src-dir

# 开发运行
cd frontend && pnpm dev

# 添加依赖
pnpm add lightweight-charts d3 katex shiki
```

### 6.3 数据库

| 环境 | 数据库 | 理由 |
|------|--------|------|
| 开发 | SQLite (`data/quant_learning.db`) | 零配置，文件在项目目录内，Git 可忽略 |
| 测试 | SQLite (`:memory:`) | 内存数据库，测试速度快 |
| 生产 | PostgreSQL | 并发性能好，功能完整 |

切换方式: 仅改环境变量 `DATABASE_URL`，SQLAlchemy 代码无感知。

### 6.4 环境变量

后端 `.env` (放在 `backend/` 目录):
```env
# 数据库
DATABASE_URL=sqlite:///./data/quant_learning.db
# DATABASE_URL=postgresql://user:password@localhost:5432/quant_learning

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# 数据缓存 (akshare 请求缓存)
CACHE_DIR=./data/cache
CACHE_TTL=3600
```

前端 `.env.local` (放在 `frontend/` 目录):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6.5 Docker 部署

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: quant_learning
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ["5432:5432"]

volumes:
  pgdata:
```

### 6.6 项目目录结构 (含环境文件)

```
quant-learning-platform/
├── frontend/
│   ├── .env.local              # 前端环境变量 (不提交)
│   ├── pnpm-lock.yaml          # 依赖锁
│   ├── pnpm-workspace.yaml     # monorepo 配置 (如需要)
│   ├── next.config.ts
│   └── ...
├── backend/
│   ├── .env                    # 后端环境变量 (不提交)
│   ├── pyproject.toml          # Python 项目配置 + 依赖
│   ├── uv.lock                 # 依赖锁
│   ├── alembic.ini             # 数据库迁移配置
│   ├── alembic/
│   └── app/
├── data/
│   ├── knowledge/              # 知识点 Markdown 内容
│   ├── quizzes/                # 练习题 JSON
│   ├── cache/                  # akshare 数据缓存 (不提交)
│   └── quant_learning.db       # SQLite 数据库 (不提交)
├── scripts/
│   ├── import_content.py       # 内容导入脚本
│   └── validate_content.py     # 内容校验脚本
├── docker-compose.yml
├── .gitignore
└── README.md
```

`.gitignore` 关键条目:
```
# 环境变量
.env
.env.local
*.env

# 数据库
*.db
data/cache/

# 依赖
node_modules/
__pycache__/
.venv/
```

---

## 7. 关键技术决策

| 决策 | 选择 | 替代方案 | 理由 |
|------|------|---------|------|
| 内容存储 | Markdown 文件 + DB | 纯DB | Git 友好，易编辑维护 |
| Wiki链接 | 自定义 Markdown 扩展 | 硬编码链接 | 内容中自然书写，自动渲染 |
| 图表库 | Lightweight Charts | ECharts/Charting | TradingView 出品，金融专用 |
| 知识图谱 | D3.js force-directed | Cytoscape | 灵活度高，效果好 |
| 公式渲染 | KaTeX | MathJax | 更快，体积更小 |
| 代码高亮 | Shiki | Prism | 更现代，支持更多语言 |
| 用户系统 | 无 (本地存储) | 完整用户系统 | MVP 阶段无需登录，降低复杂度 |
