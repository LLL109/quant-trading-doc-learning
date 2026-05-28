---
slug: max-drawdown
title: 最大回撤
category: 收益与风险
difficulty: 2
prerequisites: ["return-rate"]
related: ["return-rate", "volatility", "calmar-ratio", "sharpe-ratio"]
tags: ["最大回撤", "风险控制", "回撤曲线"]
---

# 最大回撤

> 最大回撤是投资从最高点到最低点的最大亏损幅度，衡量的是"最坏情况有多坏"。

## 定义

最大回撤（Maximum Drawdown, MDD）是指在选定时间段内，资产净值从最高点下跌到最低点的最大幅度。它衡量的是投资者可能经历的最大痛苦程度，是风险控制中最直观的指标。

对程序员来说，最大回撤就像系统的"最大故障恢复时间"——它告诉你系统在最糟糕的情况下损失了多少，以及需要多长时间恢复。

## 核心内容

### 回撤的定义

回撤（Drawdown）是指资产净值从一个高点到随后低点的跌幅：
$$\text{回撤}_t = \frac{\text{NAV}_t - \text{峰值NAV}_t}{\text{峰值NAV}_t}$$

其中 $\text{峰值NAV}_t$ 是截至时间 $t$ 的历史最高净值。

### 最大回撤

最大回撤是所有回撤中的最大值：
$$\text{MDD} = \max_{t \in [0,T]} \left( \frac{\text{峰值NAV}_t - \text{NAV}_t}{\text{峰值NAV}_t} \right)$$

或者等价地：
$$\text{MDD} = \max_{0 \leq t_1 \leq t_2 \leq T} \left( \frac{\text{NAV}_{t_1} - \text{NAV}_{t_2}}{\text{NAV}_{t_1}} \right)$$

### 回撤曲线

回撤曲线（Drawdown Curve）显示了每个时间点的回撤幅度：
- 回撤曲线始终 ≤ 0（表示从峰值下跌了多少）
- 回撤曲线越深，亏损越严重
- 回撤曲线越长，恢复时间越久

### 最大回撤的解读

| 最大回撤 | 含义 | 心理承受 |
|---------|------|---------|
| < 5% | 非常优秀 | 几乎无感 |
| 5%-10% | 优秀 | 轻微不安 |
| 10%-20% | 良好 | 明显焦虑 |
| 20%-30% | 一般 | 严重焦虑 |
| 30%-50% | 较差 | 恐慌 |
| > 50% | 很差 | 可能放弃 |

### 举例说明

某基金净值走势：1.0 → 1.2 → 1.1 → 1.3 → 0.9 → 1.0

各阶段回撤：
- 从1.2跌到1.1：回撤 = (1.2-1.1)/1.2 = 8.33%
- 从1.3跌到0.9：回撤 = (1.3-0.9)/1.3 = 30.77% ← 最大回撤
- 从1.3回到1.0：回撤 = (1.3-1.0)/1.3 = 23.08%

最大回撤 = 30.77%，发生在净值从1.3跌到0.9的过程中。

### 最大回撤 vs 波动率

| 指标 | 最大回撤 | 波动率 |
|------|---------|--------|
| 衡量内容 | 最大单向跌幅 | 收益率的离散程度 |
| 是否区分方向 | 是（只看下跌） | 否（涨跌都算） |
| 时效性 | 事后统计 | 可以滚动计算 |
| 适用场景 | 风险承受能力评估 | 投资组合优化 |

## 计算公式

**回撤：**
$$\text{DD}_t = \frac{\text{NAV}_t - \max_{s \leq t} \text{NAV}_s}{\max_{s \leq t} \text{NAV}_s}$$

**最大回撤：**
$$\text{MDD} = \min_{t} \text{DD}_t = \min_t \frac{\text{NAV}_t - \text{Peak}_t}{\text{Peak}_t}$$

（注意：回撤本身是负数或零，所以MDD是回撤的最小值，其绝对值是最大的下跌幅度）

**最大回撤恢复时间：**
$$T_{\text{恢复}} = \arg\min_{t > t_{\text{谷底}}} \{t : \text{NAV}_t \geq \text{NAV}_{t_{\text{峰值}}}\}$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 获取基金或股票数据
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20200101", end_date="20240630",
                         adjust="qfq")

# 使用收盘价作为净值
nav = df['收盘'].values
dates = df['日期'].values

# 计算累计净值
cumulative_nav = nav / nav[0]

# 计算滚动峰值
running_max = np.maximum.accumulate(cumulative_nav)

# 计算回撤序列
drawdown = (cumulative_nav - running_max) / running_max

# 计算最大回撤
max_dd = drawdown.min()
max_dd_idx = drawdown.argmin()
peak_idx = cumulative_nav[:max_dd_idx].argmax()

print(f"最大回撤: {max_dd:.2%}")
print(f"峰值日期: {dates[peak_idx]}, 净值: {cumulative_nav[peak_idx]:.4f}")
print(f"谷底日期: {dates[max_dd_idx]}, 净值: {cumulative_nav[max_dd_idx]:.4f}")

# 计算回撤恢复时间
recovered = False
for i in range(max_dd_idx, len(cumulative_nav)):
    if cumulative_nav[i] >= cumulative_nav[peak_idx]:
        recovery_days = i - max_dd_idx
        print(f"恢复日期: {dates[i]}, 恢复天数: {recovery_days}")
        recovered = True
        break
if not recovered:
    print("尚未恢复")

# 回撤统计
print(f"\n回撤序列统计:")
print(f"  平均回撤: {drawdown.mean():.2%}")
print(f"  回撤中位数: {np.median(drawdown):.2%}")
print(f"  回撤<5%的天数比例: {(drawdown > -0.05).mean():.2%}")
print(f"  回撤>10%的天数比例: {(drawdown < -0.10).mean():.2%}")
```

## 常见误区

1. **"最大回撤是唯一的风控指标"** — 最大回撤只告诉你历史上最坏的一次，不代表未来不会更差。应该结合回撤频率、回撤持续时间、恢复时间等综合评估。
2. **"最大回撤可以通过历史数据完美预测"** — 最大回撤是事后统计指标，无法预测未来。但历史最大回撤可以作为参考底线——未来回撤很可能比历史最大回撤更大。
3. **"低最大回撤就是好策略"** — 一个永远空仓的策略最大回撤为0，但也没有任何收益。最大回撤必须结合收益来看，如卡玛比率（年化收益/最大回撤）。

## 相关概念

- [收益率](/k/return-rate) — 计算最大回撤的基础数据
- [波动率](/k/volatility) — 另一种风险度量方式
- [卡玛比率](/k/calmar-ratio) — 年化收益与最大回撤的比值
- [夏普比率](/k/sharpe-ratio) — 收益与波动率的综合衡量
