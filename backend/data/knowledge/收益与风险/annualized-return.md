---
slug: annualized-return
title: 年化收益率
category: 收益与风险
difficulty: 1
prerequisites: ["return-rate"]
related: ["return-rate", "volatility", "sharpe-ratio", "calmar-ratio"]
tags: ["年化收益", "复合收益", "标准化"]
---

# 年化收益率

> 年化收益率是将不同时间段的投资回报标准化为年度收益率，是策略比较的通用语言。

## 定义

年化收益率（Annualized Return）是将任意时间段的投资回报率换算成一年的收益率。它使得不同持有期的投资可以在同一基准上进行比较。

对程序员来说，年化收益率就像一个"性能基准测试"——无论你的程序跑了1秒还是100秒，都换算成"每秒处理量"来比较。

## 核心内容

### 为什么需要年化

假设：
- 策略A：3个月赚了10%
- 策略B：2年赚了40%

哪个策略更好？直接比较"10%"和"40%"没有意义，因为时间跨度不同。年化收益率就是解决这个问题的。

### 年化收益率的计算

**从累计收益率计算年化：**
$$\text{年化收益率} = (1 + R_{\text{累计}})^{\frac{1}{n}} - 1$$

其中 $n$ 是投资年数，$R_{\text{累计}}$ 是累计收益率。

**从日收益率计算年化：**
$$\text{年化收益率} = (1 + \bar{R}_{\text{日}})^{252} - 1$$

其中 $\bar{R}_{\text{日}}$ 是日平均收益率（几何平均），252是A股每年的交易日数。

**对数收益率年化：**
$$\text{年化对数收益率} = \bar{r}_{\text{日}} \times 252$$

其中 $\bar{r}_{\text{日}}$ 是日平均对数收益率。

### 举例说明

**示例1：3个月赚10%**
$$\text{年化} = (1 + 0.10)^{\frac{1}{0.25}} - 1 = 1.10^4 - 1 = 46.41\%$$

**示例2：2年赚40%**
$$\text{年化} = (1 + 0.40)^{\frac{1}{2}} - 1 = 1.40^{0.5} - 1 = 18.32\%$$

现在可以比较了：策略A年化46.41%优于策略B的18.32%。

**示例3：从日收益率计算**
假设过去120个交易日，日均收益率为0.05%
$$\text{年化} = (1 + 0.0005)^{252} - 1 = 13.42\%$$

### 不同周期的换算

| 已知周期 | 换算公式 |
|---------|---------|
| 日收益率 → 年化 | $(1 + R_{\text{日}})^{252} - 1$ |
| 周收益率 → 年化 | $(1 + R_{\text{周}})^{52} - 1$ |
| 月收益率 → 年化 | $(1 + R_{\text{月}})^{12} - 1$ |
| 季度收益率 → 年化 | $(1 + R_{\text{季}})^{4} - 1$ |

### 算术平均 vs 几何平均

**算术平均年化：**
$$R_{\text{算术}} = \frac{1}{N} \sum_{t=1}^{N} R_t \times 252$$

**几何平均年化：**
$$R_{\text{几何}} = \left(\prod_{t=1}^{N}(1+R_t)\right)^{\frac{252}{N}} - 1$$

几何平均（时间加权）更准确地反映了实际投资回报，因为考虑了复利效应。算术平均通常大于几何平均。

## 计算公式

**年化收益率（标准公式）：**
$$R_{\text{年化}} = (1 + R_{\text{累计}})^{\frac{252}{T}} - 1$$

其中 $T$ 是交易日数。

**年化波动率（用作对比）：**
$$\sigma_{\text{年化}} = \sigma_{\text{日}} \times \sqrt{252}$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 获取股票数据
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20240101", end_date="20240630",
                         adjust="qfq")

# 计算日收益率
df['日收益率'] = df['收盘'].pct_change()
df['对数收益率'] = np.log(df['收盘'] / df['收盘'].shift(1))

# 方法1：从累计收益计算年化
cumulative_return = df['收盘'].iloc[-1] / df['收盘'].iloc[0] - 1
n_trading_days = len(df)
n_years = n_trading_days / 252
annualized_return = (1 + cumulative_return) ** (1 / n_years) - 1
print(f"累计收益率: {cumulative_return:.2%}")
print(f"交易天数: {n_trading_days}")
print(f"年化收益率: {annualized_return:.2%}")

# 方法2：从日均收益率计算年化
daily_mean = df['日收益率'].mean()
annualized_arithmetic = daily_mean * 252
annualized_geometric = (1 + daily_mean) ** 252 - 1
print(f"\n日均收益率: {daily_mean:.4%}")
print(f"算术年化: {annualized_arithmetic:.2%}")
print(f"几何年化: {annualized_geometric:.2%}")

# 方法3：对数收益率年化
log_mean = df['对数收益率'].mean()
annualized_log = log_mean * 252
print(f"\n对数年化收益率: {annualized_log:.2%}")

# 不同持有期的年化
periods = [5, 20, 60, 120]
for p in periods:
    if p < len(df):
        ret = df['收盘'].iloc[p] / df['收盘'].iloc[0] - 1
        ann = (1 + ret) ** (252 / p) - 1
        print(f"{p}日收益率: {ret:.2%}, 年化: {ann:.2%}")
```

## 常见误区

1. **"高年化收益率就是好策略"** — 年化收益率只反映收益，不反映风险。一个年化100%但最大回撤90%的策略，实战中可能让你破产。需要结合夏普比率、卡玛比率等风险调整指标。
2. **"短期年化可以外推到长期"** — 1个月赚10%年化是214%，但几乎不可能持续一整年都保持这个速度。短期年化收益率波动极大，样本越短越不可靠。
3. **"算术平均年化是实际收益"** — 算术平均会高估实际收益。例如：涨50%再跌50%的算术平均是0%，但实际亏了25%。几何平均才是真实的复合收益。

## 相关概念

- [收益率](/k/return-rate) — 年化收益率的基础
- [波动率](/k/volatility) — 收益的波动程度
- [夏普比率](/k/sharpe-ratio) — 收益与风险的综合衡量
- [卡玛比率](/k/calmar-ratio) — 年化收益与最大回撤的比值
