---
slug: calmar-ratio
title: 卡玛比率
category: 收益与风险
difficulty: 2
prerequisites: ["annualized-return", "max-drawdown"]
related: ["sharpe-ratio", "annualized-return", "max-drawdown"]
tags: ["卡玛比率", "风险调整收益", "Calmar"]
---

# 卡玛比率

> 卡玛比率是年化收益率与最大回撤的比值，衡量"用多大的最大亏损换来多大的收益"。

## 定义

卡玛比率（Calmar Ratio）是由Terry W. Young在1991年提出的，计算公式为年化收益率除以最大回撤。与夏普比率用波动率衡量风险不同，卡玛比率用最大回撤衡量风险，更贴近投资者"最坏情况"的关注点。

对程序员来说，卡玛比率就像系统的"性能/最大宕机时间比"——不是看平均波动，而是看最严重的故障对应的性能表现。

## 核心内容

### 卡玛比率公式

$$\text{Calmar Ratio} = \frac{R_{\text{年化}}}{|\text{MDD}|}$$

其中：
- $R_{\text{年化}}$：年化收益率
- $\text{MDD}$：最大回撤（取绝对值）

### 卡玛比率 vs 夏普比率

| 对比项 | 卡玛比率 | 夏普比率 |
|--------|---------|---------|
| 风险度量 | 最大回撤 | 波动率 |
| 关注点 | 最坏情况 | 平均波动 |
| 计算周期 | 通常3年 | 通常1年 |
| 对极端事件 | 敏感 | 不够敏感 |
| 对持续回撤 | 敏感 | 不敏感 |

### 卡玛比率的解读

| 卡玛比率 | 评价 | 含义 |
|---------|------|------|
| < 0.5 | 一般 | 收益未能充分补偿最大回撤 |
| 0.5 - 1.0 | 良好 | 收益与最大回撤较匹配 |
| 1.0 - 2.0 | 优秀 | 每单位最大回撤获得不错的收益 |
| 2.0 - 3.0 | 非常优秀 | 风险控制出色 |
| > 3.0 | 卓越 | 极其罕见 |

### 举例说明

**策略A：** 年化收益25%，最大回撤30%
$$\text{Calmar}_A = \frac{25\%}{30\%} = 0.83$$

**策略B：** 年化收益15%，最大回撤10%
$$\text{Calmar}_B = \frac{15\%}{10\%} = 1.50$$

策略B的卡玛比率更高，意味着每承担1%的最大回撤，策略B能产生0.015的年化收益，而策略A只能产生0.0083。策略B的风险控制更好。

### 适用场景

卡玛比率特别适合评估：
1. **CTA策略**：趋势跟踪策略通常有较大的回撤，卡玛比率能直观反映收益与回撤的关系
2. **绝对收益策略**：对冲基金追求绝对收益，关注最大回撤
3. **长期投资评估**：3-5年的卡玛比率更能反映策略的稳定性

## 计算公式

**卡玛比率：**
$$\text{Calmar Ratio} = \frac{R_{\text{年化}}}{|\text{MDD}|}$$

**年化收益率：**
$$R_{\text{年化}} = (1 + R_{\text{累计}})^{\frac{252}{T}} - 1$$

**最大回撤：**
$$\text{MDD} = \min_t \frac{\text{NAV}_t - \text{Peak}_t}{\text{Peak}_t}$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 获取数据
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20210101", end_date="20240630",
                         adjust="qfq")

# 计算日收益率
df['日收益率'] = df['收盘'].pct_change()
returns = df['日收益率'].dropna()

# 计算年化收益率
total_return = df['收盘'].iloc[-1] / df['收盘'].iloc[0] - 1
n_years = len(returns) / 252
annual_return = (1 + total_return) ** (1 / n_years) - 1

# 计算最大回撤
cumulative = (1 + returns).cumprod()
running_max = cumulative.cummax()
drawdown = (cumulative - running_max) / running_max
max_dd = drawdown.min()

# 计算卡玛比率
calmar = annual_return / abs(max_dd)

print(f"年化收益率: {annual_return:.2%}")
print(f"最大回撤: {max_dd:.2%}")
print(f"卡玛比率: {calmar:.2f}")

# 计算滚动卡玛比率（3年窗口）
window = 252 * 3  # 3年
rolling_results = []
for i in range(window, len(returns)):
    window_returns = returns.iloc[i-window:i]
    cum_ret = (1 + window_returns).cumprod()
    ann_ret = cum_ret.iloc[-1] ** (252/window) - 1
    dd = (cum_ret - cum_ret.cummax()) / cum_ret.cummax()
    mdd = dd.min()
    if mdd != 0:
        rolling_calmar = ann_ret / abs(mdd)
    else:
        rolling_calmar = np.nan
    rolling_results.append(rolling_calmar)

print(f"\n滚动卡玛比率统计:")
print(f"  均值: {np.nanmean(rolling_results):.2f}")
print(f"  最大: {np.nanmax(rolling_results):.2f}")
print(f"  最小: {np.nanmin(rolling_results):.2f}")

# 对比多只股票
symbols = {'贵州茅台': '600519', '招商银行': '600036'}
for name, code in symbols.items():
    try:
        tmp = ak.stock_zh_a_hist(symbol=code, period="daily",
                                  start_date="20210101", end_date="20240630",
                                  adjust="qfq")
        tmp_ret = tmp['收盘'].pct_change().dropna()
        cum = (1 + tmp_ret).cumprod()
        ann = cum.iloc[-1] ** (252/len(tmp_ret)) - 1
        mdd_val = ((cum - cum.cummax()) / cum.cummax()).min()
        cal = ann / abs(mdd_val)
        print(f"{name}: 年化{ann:.2%}, MDD{mdd_val:.2%}, Calmar{cal:.2f}")
    except:
        pass
```

## 常见误区

1. **"卡玛比率比夏普比率更好"** — 两者衡量的风险维度不同。夏普比率关注平均波动，卡玛比率关注极端风险。理想情况下应该两者都看，综合评估。
2. **"卡玛比率不需要考虑时间周期"** — 卡玛比率通常需要3年以上的数据才有统计意义。短期（如1年）的最大回撤可能不具有代表性。
3. **"最大回撤为0时卡玛比率无穷大"** — 理论上确实如此，但最大回撤为0意味着完全没有亏损，这种情况几乎不存在（除非策略一直空仓或只做无风险资产）。

## 相关概念

- [夏普比率](/k/sharpe-ratio) — 用波动率替代最大回撤的风险调整指标
- [年化收益率](/k/annualized-return) — 卡玛比率的分子
- [最大回撤](/k/max-drawdown) — 卡玛比率的分母
