---
slug: alpha
title: Alpha超额收益
category: 收益与风险
difficulty: 3
prerequisites: ["sharpe-ratio"]
related: ["beta", "sharpe-ratio", "return-rate", "volatility"]
tags: ["Alpha", "超额收益", "CAPM", "选股能力"]
---

# Alpha超额收益

> Alpha是投资组合收益中不能被市场风险（Beta）解释的部分，代表基金经理的"选股能力"。

## 定义

Alpha（α）是资本资产定价模型（CAPM）中的核心概念，表示投资组合的实际收益超出其承受系统性风险所应得收益的部分。正的Alpha意味着投资经理创造了超越市场的额外价值，负的Alpha意味着投资经理的表现不如承担风险所应得的回报。

对程序员来说，Alpha就像一个"优化算法的额外加速比"——在相同的硬件配置（Beta风险）下，好的算法能比基准多跑出多少性能。

## 核心内容

### CAPM模型

CAPM（Capital Asset Pricing Model，资本资产定价模型）认为资产的预期收益由两部分组成：

$$E(R_i) = R_f + \beta_i \times (E(R_m) - R_f)$$

其中：
- $E(R_i)$：资产i的预期收益率
- $R_f$：无风险利率
- $\beta_i$：资产i的Beta系数
- $E(R_m)$：市场预期收益率
- $(E(R_m) - R_f)$：市场风险溢价

### Alpha的定义

Alpha是实际收益与CAPM预期收益的差：

$$\alpha_i = R_i - [R_f + \beta_i \times (R_m - R_f)]$$

或者用回归模型理解：

$$R_i - R_f = \alpha_i + \beta_i \times (R_m - R_f) + \epsilon_i$$

其中 $\epsilon_i$ 是残差（特异性风险）。

### Alpha的解读

| Alpha值 | 含义 |
|---------|------|
| α > 0 | 投资组合获得了超额收益，基金经理有选股能力 |
| α = 0 | 收益完全由市场风险解释，被动投资即可 |
| α < 0 | 收益低于风险应得水平，基金经理在毁灭价值 |

### 举例说明

假设：
- 无风险利率 $R_f$ = 3%
- 市场收益率 $R_m$ = 12%
- 投资组合的Beta = 1.2
- 投资组合的实际收益率 = 18%

**CAPM预期收益：**
$$E(R) = 3\% + 1.2 \times (12\% - 3\%) = 3\% + 10.8\% = 13.8\%$$

**Alpha：**
$$\alpha = 18\% - 13.8\% = 4.2\%$$

这4.2%的超额收益就是Alpha，代表基金经理的选股能力。如果只承担Beta风险（被动投资），预期只能获得13.8%的收益。

### Alpha与夏普比率的关系

在单因子模型下：
$$\text{Sharpe}_{\text{组合}}^2 = \text{Sharpe}_{\text{市场}}^2 + \text{Information Ratio}^2$$

其中Information Ratio = α / σ(ε)，衡量每单位特异性风险获得的Alpha。

### Alpha的来源

量化投资中Alpha的常见来源：
1. **选股因子**：价值、动量、质量、低波动等因子的超额收益
2. **市场微观结构**：利用市场流动性、订单流等信息
3. **事件驱动**：财报、分红、重组等事件前后的异常收益
4. **统计套利**：利用价格关系的短期偏离

## 计算公式

**CAPM Alpha：**
$$\alpha = R_p - [R_f + \beta \times (R_m - R_f)]$$

**回归法计算Alpha：**
$$R_p - R_f = \alpha + \beta \times (R_m - R_f) + \epsilon$$

通过OLS回归求解 $\alpha$ 和 $\beta$。

**信息比率：**
$$\text{IR} = \frac{\alpha}{\sigma(\epsilon)}$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np
from scipy import stats

# 获取个股数据（以贵州茅台为例）
stock = ak.stock_zh_a_hist(symbol="600519", period="daily",
                            start_date="20220101", end_date="20240630",
                            adjust="qfq")

# 获取沪深300指数作为市场基准
market = ak.stock_zh_index_daily(symbol="sh000300")
market = market[(market['date'] >= '2022-01-01') & (market['date'] <= '2024-06-30')]

# 计算收益率
stock['日收益率'] = stock['收盘'].pct_change()
market['market_return'] = market['close'].pct_change()

# 合并数据
stock['日期'] = pd.to_datetime(stock['日期'])
market['date'] = pd.to_datetime(market['date'])
merged = pd.merge(stock[['日期', '日收益率']], market[['date', 'market_return']],
                   left_on='日期', right_on='date', how='inner')

# 无风险利率（年化3%，日化）
rf_daily = 0.03 / 252

# 计算超额收益
merged['stock_excess'] = merged['日收益率'] - rf_daily
merged['market_excess'] = merged['market_return'] - rf_daily

# OLS回归求Alpha和Beta
valid = merged.dropna()
slope, intercept, r_value, p_value, std_err = stats.linregress(
    valid['market_excess'], valid['stock_excess'])

beta = slope
alpha_daily = intercept
alpha_annual = alpha_daily * 252

print(f"Beta: {beta:.3f}")
print(f"Alpha (日): {alpha_daily:.6f}")
print(f"Alpha (年化): {alpha_annual:.2%}")
print(f"R-squared: {r_value**2:.3f}")

# 信息比率
residuals = valid['stock_excess'] - (alpha_daily + beta * valid['market_excess'])
ir = alpha_daily / residuals.std() * np.sqrt(252)
print(f"Information Ratio: {ir:.3f}")

# 无风险利率和市场收益
rf_annual = 0.03
market_return_annual = valid['market_return'].mean() * 252
stock_return_annual = valid['日收益率'].mean() * 252
expected_return = rf_annual + beta * (market_return_annual - rf_annual)
print(f"\n个股年化收益: {stock_return_annual:.2%}")
print(f"CAPM预期收益: {expected_return:.2%}")
print(f"Alpha: {stock_return_annual - expected_return:.2%}")
```

## 常见误区

1. **"Alpha高的基金就是好基金"** — 需要看Alpha的来源是否可持续。如果Alpha来自承担额外的风险因子（如小盘股溢价），那么这个Alpha可能是"假Alpha"——实际是另一种风险的补偿。
2. **"Alpha是基金经理的能力"** — 短期Alpha可能只是运气。需要统计检验（t检验）来判断Alpha是否显著不为0。通常需要3年以上的数据才有统计意义。
3. **"只有一个Alpha"** — 在多因子模型中，可以分解出多个因子的Alpha（如Fama-French三因子、五因子模型），每个因子都可能贡献不同的超额收益。

## 相关概念

- [Beta系统性风险](/k/beta) — CAPM中的风险系数
- [夏普比率](/k/sharpe-ratio) — 风险调整后的综合收益指标
- [收益率](/k/return-rate) — Alpha计算的基础数据
- [波动率](/k/volatility) — 计算信息比率需要的残差波动
