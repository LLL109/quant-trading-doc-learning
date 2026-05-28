---
slug: data-sources
title: 数据来源
category: 数据与工具
difficulty: 1
prerequisites: []
related: ["akshare"]
tags: ["数据", "数据源"]
---

# 数据来源

> 数据是量化投资的原材料，选择合适的数据来源是量化之路的第一步。

## 定义

数据来源（Data Sources）是指获取股票行情、财务报表、宏观经济等量化投资所需数据的渠道。它回答的核心问题是：从哪里获取我需要的数据？

对程序员来说，数据来源就像"数据API"——你需要知道有哪些API可用、数据质量如何、调用频率限制是多少。

## 核心内容

### 常见的数据来源分类

#### 1. 免费数据源

| 数据源 | 特点 | 数据类型 |
|--------|------|----------|
| AKShare | 开源、活跃维护 | A股行情、财务、基金 |
| Tushare | 社区版免费 | A股全品种 |
| yfinance | Yahoo财经 | 全球股票 |
| 东方财富 | 网页爬取 | 实时行情 |
| 新浪财经 | 网页爬取 | 历史行情 |

#### 2. 付费数据源

| 数据源 | 价格 | 特点 |
|--------|------|------|
| Wind万得 | 3-5万/年 | 机构级，数据最全 |
| 东方财富Choice | 1-3万/年 | 性价比高 |
| 聚宽JQData | 按量付费 | 量化平台配套 |
| Tushare Pro | 积分制 | 需要贡献积分 |

#### 3. 券商数据

大多数券商交易软件提供：
- 实时行情（Level 1）
- 历史日K线
- 基本财务数据

### 数据类型

| 数据类型 | 说明 | 获取难度 |
|----------|------|----------|
| 日线行情 | 开高低收、成交量 | 容易 |
| 分钟线 | 1/5/15/30/60分钟 | 中等 |
| Tick数据 | 逐笔成交 | 困难（付费） |
| 财务报表 | 三大报表 | 中等 |
| 宏观数据 | GDP、CPI等 | 容易 |
| 另类数据 | 舆情、卫星图 | 困难（付费） |

### 数据质量检查

获取数据后需要检查：
1. **完整性**：是否有缺失值
2. **准确性**：价格是否正确（复权处理）
3. **及时性**：数据更新频率是否满足需求
4. **一致性**：不同来源的数据是否一致

## Python 代码

```python
import pandas as pd

# 数据源使用示例

# 1. AKShare（推荐入门使用）
def get_data_akshare(symbol="600519"):
    """使用AKShare获取数据"""
    import akshare as ak

    # 获取日线行情
    df = ak.stock_zh_a_hist(symbol=symbol, period="daily",
                             start_date="20230101", end_date="20241231",
                             adjust="qfq")
    return df

# 2. Tushare（需要注册获取token）
def get_data_tushare(symbol="600519.SH"):
    """使用Tushare获取数据"""
    import tushare as ts
    # ts.set_token('your_token_here')
    # pro = ts.pro_api()
    # df = pro.daily(ts_code=symbol, start_date='20230101', end_date='20241231')
    pass

# 3. yfinance（获取美股数据）
def get_data_yfinance(symbol="AAPL"):
    """使用yfinance获取数据"""
    import yfinance as yf
    df = yf.download(symbol, start="2023-01-01", end="2024-12-31")
    return df

# 数据质量检查
def check_data_quality(df):
    """检查数据质量"""
    issues = []

    # 检查缺失值
    missing = df.isnull().sum()
    if missing.any():
        issues.append(f"存在缺失值: {missing[missing > 0].to_dict()}")

    # 检查数据类型
    if '收盘' in df.columns:
        if not pd.api.types.is_numeric_dtype(df['收盘']):
            issues.append("收盘价不是数值类型")

    # 检查日期连续性
    if '日期' in df.columns:
        dates = pd.to_datetime(df['日期'])
        gaps = dates.diff().dt.days
        large_gaps = gaps[gaps > 5]  # 超过5天的间隔
        if len(large_gaps) > 0:
            issues.append(f"存在{len(large_gaps)}个大间隔（>5天）")

    if not issues:
        return "数据质量检查通过"
    else:
        return "数据质量问题：\n" + "\n".join(f"  - {i}" for i in issues)

# 使用示例
print("数据源选择建议：")
print("  入门学习：AKShare（免费、Python原生）")
print("  个人研究：Tushare Pro（积分制、数据较全）")
print("  专业投资：Wind/Choice（付费、最全面）")

# try:
#     df = get_data_akshare()
#     print(f"\n获取到{len(df)}条数据")
#     print(check_data_quality(df))
# except Exception as e:
#     print(f"获取数据失败: {e}")
```

## 常见误区

1. **"免费数据质量都差"** — AKShare、Tushare等免费数据源的质量已经能满足大部分学习和研究需求。
2. **"只用一个数据源"** — 不同数据源可能有不同的错误，交叉验证能提高数据可靠性。
3. **"忽略复权处理"** — 股票分红送股后需要复权，否则价格序列不连续，会导致回测结果错误。

## 相关概念

- [AKShare使用](/k/akshare) — 最推荐的入门级数据源
